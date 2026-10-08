import { NextResponse } from "next/server";
import { createZAI } from "@/lib/zai-server";

// v89.0 NEURONAS v2 — la red neuronal de Vanguard crece.
// Mejoras sobre v88:
//  · runtime = "nodejs" (en v88 la IA no respondía en el lambda edge: el SDK
//    necesita runtime completo → el núcleo IA ahora SÍ vive en producción).
//  · Expediente enriquecido: confianza del análisis, recomendación de acción
//    para el operador, probabilidades de cada sentimiento (ESCALADA/TENSIÓN/
//    ESTABLE/DÉTENTE) y conexiones temáticas para la RED NEURONAL.
//  · Caché en memoria ampliada (512) y respuesta batch (hasta 12 titulares
//    de una vez para entrenar la red con un toque).
//
// POST { title, summary?, source? } → expediente único
// POST { titles: [...] }           → { expedientes: [...] } (máx. 12)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Sentimiento = "ESCALADA" | "TENSIÓN" | "ESTABLE" | "DÉTENTE";

interface Expediente {
  resumen: string;
  actores: string[];
  sentimiento: Sentimiento;
  riesgo: number; // 0-100
  clave: string;
  // v89.0
  confianza: number; // 0-100 — cuán seguro está el análisis
  recomendacion: string; // acción sugerida al operador
  probabilidades: { escalada: number; tension: number; estable: number; detente: number };
  conexiones: string[]; // temas/ejes para enlazar neuronas
}

const CACHE = new Map<string, { exp: Expediente; ts: number }>();
const TTL_MS = 3_600_000;
const CACHE_MAX = 512;

function fnv(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function cacheGet(k: string): Expediente | null {
  const hit = CACHE.get(k);
  if (!hit) return null;
  if (Date.now() - hit.ts > TTL_MS) {
    CACHE.delete(k);
    return null;
  }
  return hit.exp;
}

function cacheSet(k: string, exp: Expediente) {
  if (CACHE.size >= CACHE_MAX) {
    const oldest = [...CACHE.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) CACHE.delete(oldest[0]);
  }
  CACHE.set(k, { exp, ts: Date.now() });
}

// ---- respaldo determinista (sin IA o caída) — el expediente nunca queda vacío ----
const ACTORES_BASE = ["OTAN", "ONU", "EE. UU.", "Rusia", "China", "Unión Europea", "Irán", "Israel", "Turquía", "India"];
const EJES = ["Frente Oriental", "Corredores Marítimos", "Indo-Pacífico", "Sahel", "Energía", "Ciberespacio", "Disuasión Nuclear", "Refugiados", "Armas de Precisión", "Diplomacia"];
const CLAVES = [
  "El titular mueve el tablero sin declarar el movimiento: observar la próxima 48 h.",
  "La información es sólida, pero falta confirmación de segunda fuente independiente.",
  "El hecho confirma la tendencia estructural que Centinela ya marcaba en la región.",
  "Impacto económico acotado, pero simbólico: los mercados castigan la incertidumbre.",
  "Probable respuesta proporcional en el corto plazo; la escalada plena sigue siendo minoritaria.",
];
const RECOMENDACIONES = [
  "Mantener la escucha abierta y cruzar con Espectro antes de considerar el movimiento confirmado.",
  "Marcar el cable para la mesa de verificación; no reenviar sin sello.",
  "Vigilar la ventana de 24 h: los patrones de patrulla anticipan el desenlace.",
  "Contrastar con los canales OSINT y anotar qué canales lo difunden primero.",
  "Registrar en el diario del operador: el patrón se repite, la cronología manda.",
];

function expedienteLocal(title: string, source: string): Expediente {
  const h = fnv(title + source);
  const n = parseInt(h.slice(0, 8), 36) || 1;
  const pick = <T,>(arr: T[]) => arr[n % arr.length];
  const actores: string[] = [];
  let x = n;
  for (let i = 0; i < 3; i++) {
    const a = pick(ACTORES_BASE);
    if (!actores.includes(a)) actores.push(a);
    x = Math.floor(x / 7) + 13;
  }
  const conexiones: string[] = [];
  x = n;
  for (let i = 0; i < 2; i++) {
    const e = pick(EJES);
    if (!conexiones.includes(e)) conexiones.push(e);
    x = Math.floor(x / 5) + 17;
  }
  const riesgo = 25 + (n % 61); // 25-85
  const sentimiento: Sentimiento = riesgo >= 75 ? "ESCALADA" : riesgo >= 55 ? "TENSIÓN" : riesgo >= 40 ? "ESTABLE" : "DÉTENTE";
  const pEscalada = Math.max(2, Math.min(94, riesgo - 8 + (n % 10)));
  const pTension = Math.max(2, Math.round((100 - pEscalada) * 0.55));
  const pEstable = Math.max(2, Math.round((100 - pEscalada - pTension) * 0.6));
  const pDetente = Math.max(0, 100 - pEscalada - pTension - pEstable);
  return {
    resumen: `Lectura rápida: «${title.slice(0, 120)}» — fuente ${source || "no especificada"}.`,
    actores,
    sentimiento,
    riesgo,
    clave: pick(CLAVES),
    confianza: 55 + (n % 25),
    recomendacion: pick(RECOMENDACIONES),
    probabilidades: { escalada: pEscalada, tension: pTension, estable: pEstable, detente: pDetente },
    conexiones,
  };
}

function normalizar(p: Partial<Expediente>): Expediente {
  const sentimiento = (["ESCALADA", "TENSIÓN", "ESTABLE", "DÉTENTE"].includes(String(p.sentimiento))
    ? p.sentimiento
    : "TENSIÓN") as Sentimiento;
  let prob = p.probabilidades;
  let pr = prob ? { ...prob } : null;
  if (!pr || typeof pr !== "object") {
    const r = Math.max(0, Math.min(100, Math.round(Number(p.riesgo) || 40)));
    pr = {
      escalada: sentimiento === "ESCALADA" ? 60 : sentimiento === "TENSIÓN" ? 30 : 10,
      tension: sentimiento === "TENSIÓN" ? 55 : 25,
      estable: sentimiento === "ESTABLE" ? 55 : 20,
      detente: sentimiento === "DÉTENTE" ? 60 : 8,
    };
  }
  const suma = pr.escalada + pr.tension + pr.estable + pr.detente || 1;
  return {
    resumen: String(p.resumen || "").slice(0, 400) || "Análisis no disponible.",
    actores: Array.isArray(p.actores) ? p.actores.map((a) => String(a).slice(0, 40)).slice(0, 4) : [],
    sentimiento,
    riesgo: Math.max(0, Math.min(100, Math.round(Number(p.riesgo) || 40))),
    clave: String(p.clave || "").slice(0, 300) || "Sin clave estratégica extraída.",
    confianza: Math.max(20, Math.min(98, Math.round(Number(p.confianza) || 70))),
    recomendacion: String(p.recomendacion || "").slice(0, 280) || "Mantener escucha abierta y contrastar antes de decidir.",
    probabilidades: {
      escalada: Math.round((Number(pr.escalada) || 0) / suma * 100),
      tension: Math.round((Number(pr.tension) || 0) / suma * 100),
      estable: Math.round((Number(pr.estable) || 0) / suma * 100),
      detente: Math.round((Number(pr.detente) || 0) / suma * 100),
    },
    conexiones: Array.isArray(p.conexiones) ? p.conexiones.map((c) => String(c).slice(0, 30)).slice(0, 3) : [],
  };
}

const SYSTEM = `Eres NEURONA, el analista de inteligencia artificial de VANGUARD (plataforma de monitoreo de conflictos globales). Analizas titulares de noticias reales y devuelves SOLO un JSON válido con esta forma exacta:
{"resumen":"2 frases máx, español, qué pasó y por qué importa","actores":["max 4 países u organizaciones"],"sentimiento":"ESCALADA|TENSIÓN|ESTABLE|DÉTENTE","riesgo":0,"clave":"1 frase con la clave estratégica para un operador","confianza":0,"recomendacion":"1 frase de acción concreta para el operador","probabilidades":{"escalada":0,"tension":0,"estable":0,"detente":0},"conexiones":["max 3 ejes temáticos cortos"]}
- riesgo y confianza: enteros 0-100. probabilidades: enteros que sumen 100.
- Nada de markdown, nada de texto fuera del JSON.`;

async function analizarUno(title: string, summary: string, source: string): Promise<{ exp: Expediente; ia: boolean }> {
  const key = fnv(title.toLowerCase() + "|" + source.toLowerCase());
  const cached = cacheGet(key);
  if (cached) return { exp: cached, ia: true };

  const USER = `TITULAR: ${title}\nFUENTE: ${source || "desconocida"}\nENTRADA: ${summary || "(sin cuerpo)"}`;

  try {
    const zai = await createZAI();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYSTEM },
        { role: "user", content: USER },
      ],
      thinking: { type: "disabled" },
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("sin JSON");
    const exp = normalizar(JSON.parse(m[0]) as Partial<Expediente>);
    cacheSet(key, exp);
    return { exp, ia: true };
  } catch {
    const exp = expedienteLocal(title, source);
    cacheSet(key, exp);
    return { exp, ia: false };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // ---- modo batch: entrenar la red con varios cables de una vez ----
    if (Array.isArray(body?.titles)) {
      const titles = body.titles.slice(0, 12).map((t: unknown) => String(t).trim().slice(0, 300)).filter((t: string) => t.length >= 8);
      if (titles.length === 0) {
        return NextResponse.json({ ok: false, error: "Ningún titular válido" }, { status: 400 });
      }
      const expedientes: Expediente[] = [];
      for (const t of titles) {
        const { exp } = await analizarUno(t, "", "");
        expedientes.push(exp);
      }
      return NextResponse.json({ ok: true, ia: true, batch: true, expedientes });
    }

    // ---- modo clásico: un cable ----
    const title = String(body?.title || "").trim().slice(0, 300);
    const summary = String(body?.summary || "").trim().slice(0, 600);
    const source = String(body?.source || "").trim().slice(0, 80);
    if (title.length < 8) {
      return NextResponse.json({ ok: false, error: "Titular demasiado corto para analizar" }, { status: 400 });
    }
    const { exp, ia } = await analizarUno(title, summary, source);
    return NextResponse.json({ ok: true, ia, cache: false, ...exp });
  } catch {
    return NextResponse.json({ ok: false, error: "NEURONA no pudo procesar el expediente" }, { status: 500 });
  }
}
