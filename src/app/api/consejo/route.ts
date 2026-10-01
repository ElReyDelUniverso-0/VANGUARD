import { NextResponse } from "next/server";

// v79.0 — EL CONSEJO DE ACERO: la primera sala de deliberación con IA en vivo.
// POST { modo: "deliberacion", tema }                      → 4 intervenciones + voto + decreto
// POST { modo: "dialogo", consejero, mensaje, historial }  → respuesta de 1 consejero
// Corre SOLO en servidor (z-ai-web-dev-sdk). Si la IA falla, hay fallback
// heurístico para que la sala NUNCA quede en silencio.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ConsejeroId = "estratega" | "canciller" | "general" | "analista";

const CONSEJEROS: Record<ConsejeroId, { nombre: string; rol: string; voz: string }> = {
  estratega: {
    nombre: "EL ESTRATEGA",
    rol: "táctica, mapas y logística",
    voz: "Frío, calculador: ejes de avance, suministros y consecuencias de segundo orden. Habla corto y quirúrgico.",
  },
  canciller: {
    nombre: "LA CANCILLER",
    rol: "diplomacia y alianzas",
    voz: "Elegante y medida: tratados, sanciones, opinión pública y salidas negociables. Busca la mesa antes que el frente.",
  },
  general: {
    nombre: "EL GENERAL",
    rol: "fuerza y disuasión",
    voz: "Seco y contundente: capacidad, movilización y coste humano sin adornos. Desprecia la duda.",
  },
  analista: {
    nombre: "EL ANALISTA",
    rol: "datos y probabilidad",
    voz: "Metódico y cuantitativo: escenarios con porcentajes, supuestos frágiles y datos que faltan. Números antes que adjetivos.",
  },
};

// rate-limit en memoria por IP (simple, por instancia serverless)
const hits = new Map<string, { n: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 14;

function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.ts > WINDOW_MS) {
    hits.set(ip, { n: 1, ts: now });
    if (hits.size > 500) {
      for (const [k, v] of hits) if (now - v.ts > WINDOW_MS) hits.delete(k);
    }
    return false;
  }
  h.n += 1;
  return h.n > MAX_REQ;
}

function clean(s: unknown, max: number): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const SYSTEM_DELIBERACION = `Eres EL CONSEJO DE ACERO de la plataforma de guerra VANGUARD: cuatro consejeros de IA (EL ESTRATEGA, LA CANCILLER, EL GENERAL y EL ANALISTA) que delibera una crisis planteada por un jugador.
Reglas: respondes SOLO con JSON válido, sin markdown ni texto fuera del JSON. Español. Tono de sala de guerra, directo y creíble. Nada de violencia gráfica, nada ilegal: es análisis geopolítico ficticio para un juego.
Estructura EXACTA del JSON:
{"intervenciones":[{"id":"estratega","texto":"2-3 frases en la voz del consejero, máximo 320 caracteres"},{"id":"canciller","texto":"..."},{"id":"general","texto":"..."},{"id":"analista","texto":"..."}],"votos":[{"id":"estratega","voto":"A FAVOR|EN CONTRA|ABSTENCIÓN","confianza":72}],"decreto":{"titulo":"DECRETO: máximo 8 palabras","veredicto":"PROCEDER|CONTENER|NEGOCIAR|ESPERAR","texto":"2-3 frases con la decisión del consejo, máximo 320 caracteres","acciones":["acción concreta 1","acción 2","acción 3"]}}
Cada consejero PIENSA distinto y puede discrepar con los demás. Los ids son EXACTOS y en este orden: "estratega", "canciller", "general", "analista". Nunca los renombres. Las acciones son jugables y concretas (máximo 90 caracteres cada una).`;

function systemDialogo(id: ConsejeroId): string {
  const c = CONSEJEROS[id];
  return `Eres ${c.nombre}, consejero del CONSEJO DE ACERO en la plataforma de guerra VANGUARD. Especialidad: ${c.rol}. Tu voz: ${c.voz} El comandante te habla directamente en la sala de deliberación. Respondes SOLO JSON válido: {"respuesta":"2-4 frases, máximo 380 caracteres, en tu voz"}. Español, análisis geopolítico ficticio de juego, sin violencia gráfica ni instrucciones reales dañinas.`;
}

function stripFences(raw: string): string {
  return raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

function extractJson(raw: string): Record<string, unknown> | null {
  const clean = stripFences(raw);
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return null;
  }
}

function fallbackDeliberacion(tema: string) {
  return {
    intervenciones: [
      { id: "estratega", texto: `Sin datos de satélite suficientes sobre "${tema}", mi recomendación es asegurar las líneas de suministro antes de mover una sola pieza visible.` },
      { id: "canciller", texto: `Abriría un canal discreto con las partes antes de que "${tema}" escale en la prensa. Una mesa callada vale más que diez discursos.` },
      { id: "general", texto: `La disuasión se demuestra, no se anuncia: visibilidad de capacidades y nada más. El ruido estratégico solo invita a pruebas ajenas.` },
      { id: "analista", texto: `Modelo rápido: 55% de que el tema se congela esta semana, 30% escalada retórica, 15% incidente físico. Faltan datos duros para afinar.` },
    ],
    votos: [
      { id: "estratega", voto: "ABSTENCIÓN", confianza: 50 },
      { id: "canciller", voto: "A FAVOR", confianza: 60 },
      { id: "general", voto: "EN CONTRA", confianza: 55 },
      { id: "analista", voto: "ABSTENCIÓN", confianza: 48 },
    ],
    decreto: {
      titulo: "DECRETO: VIGILANCIA ACTIVA",
      veredicto: "ESPERAR",
      texto: `El consejo ordena vigilar "${tema}" con las tres capas de inteligencia y reconvenir en 24 horas con datos frescos.`,
      acciones: ["Revisa la Sala OSINT cada 6 horas", "Abre expediente en el Archivo Secreto", "Trae el tema de vuelta al consejo"],
    },
  };
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "El consejo necesita respirar: espera unos segundos." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida" }, { status: 400 });
  }

  const modo = body?.modo === "dialogo" ? "dialogo" : "deliberacion";

  try {
    const { createZAI } = await import("@/lib/zai-server");
    const zai = await createZAI();

    if (modo === "deliberacion") {
      const tema = clean(body?.tema, 280);
      if (tema.length < 4) {
        return NextResponse.json({ ok: false, error: "Plantea el tema con al menos 4 caracteres." }, { status: 400 });
      }
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: SYSTEM_DELIBERACION },
          { role: "user", content: `CRISIS PLANTEADA POR EL COMANDANTE: "${tema}". Deliberen AHORA y emitan el decreto. Responde solo el JSON.` },
        ],
        thinking: { type: "disabled" },
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      const parsed = extractJson(raw) as any;
      if (!parsed?.intervenciones || !parsed?.decreto) {
        return NextResponse.json({ ok: true, ...fallbackDeliberacion(tema), ia: false });
      }
      const ids: ConsejeroId[] = ["estratega", "canciller", "general", "analista"];
      const lista: any[] = Array.isArray(parsed.intervenciones) ? parsed.intervenciones : [];
      // mapeo tolerante: primero por id exacto; si falta, por posición (el modelo
      // a veces renombra los consejeros — les asignamos nuestra voz canónica)
      const intervenciones = ids
        .map((id, i) => {
          const porId = lista.find((x) => x?.id === id);
          const elegido = porId ?? lista[i] ?? null;
          return { id, texto: clean(elegido?.texto ?? elegido?.intervencion ?? "", 400) };
        })
        .filter((x) => x.texto.length > 0);
      if (intervenciones.length < 2) {
        return NextResponse.json({ ok: true, ...fallbackDeliberacion(tema), ia: false });
      }
      const votos = ids.map((id, i) => {
        const vlista: any[] = Array.isArray(parsed.votos) ? parsed.votos : [];
        const v = vlista.find((x: any) => x?.id === id) ?? vlista[i] ?? {};
        const voto = clean(v.voto, 16).toUpperCase();
        return {
          id,
          voto: ["A FAVOR", "EN CONTRA", "ABSTENCIÓN"].includes(voto) ? voto : "ABSTENCIÓN",
          confianza: Math.max(10, Math.min(99, parseInt(String(v.confianza), 10) || 55)),
        };
      });
      const d = parsed.decreto ?? {};
      return NextResponse.json({
        ok: true,
        ia: true,
        tema,
        intervenciones,
        votos,
        decreto: {
          titulo: clean(d.titulo, 60) || "DECRETO DEL CONSEJO",
          veredicto: clean(d.veredicto, 12).toUpperCase() || "PROCEDER",
          texto: clean(d.texto, 360) || "El consejo ha deliberado. Mantén la vigilancia.",
          acciones: [clean(d.acciones?.[0], 90), clean(d.acciones?.[1], 90), clean(d.acciones?.[2], 90)].filter(Boolean),
        },
      });
    }

    // modo diálogo con un consejero
    const id = String(body?.consejero) as ConsejeroId;
    if (!CONSEJEROS[id]) {
      return NextResponse.json({ ok: false, error: "Consejero desconocido" }, { status: 400 });
    }
    const mensaje = clean(body?.mensaje, 500);
    if (mensaje.length < 2) {
      return NextResponse.json({ ok: false, error: "Escribe tu réplica." }, { status: 400 });
    }
    const historial = Array.isArray(body?.historial) ? body.historial.slice(-12) : [];
    const hist = historial
      .map((h: Record<string, unknown>) => `${clean(h?.consejero, 20)}: ${clean(h?.texto, 400)}`)
      .filter((l: string) => l.length > 3)
      .join("\n");

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemDialogo(id) },
        ...(hist ? [{ role: "user" as const, content: `TRANSCRIPCIÓN PREVIA DE LA SALA:\n${hist}` }] : []),
        { role: "user", content: `EL COMANDANTE TE CONTESTA: "${mensaje}". Responde solo el JSON.` },
      ],
      thinking: { type: "disabled" },
    });
    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = extractJson(raw) as any;
    const respuesta = clean(parsed?.respuesta, 420);
    if (!respuesta) {
      return NextResponse.json({ ok: true, ia: false, respuesta: "Sigue hablando, comandante: la sala te escucha, aunque la señal con el núcleo de IA está intermitente." });
    }
    return NextResponse.json({ ok: true, ia: true, respuesta });
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("consejo error", errMsg);
    const tema = clean(body?.tema, 60) || "la crisis abierta";
    const url = new URL(req.url);
    const debug = url.searchParams.get("debug") === "1";
    return NextResponse.json(
      modo === "deliberacion"
        ? { ok: true, ia: false, ...(tema ? fallbackDeliberacion(tema) : fallbackDeliberacion("la crisis abierta")), ...(debug ? { err: errMsg } : {}) }
        : { ok: true, ia: false, respuesta: "La conexión con el núcleo falló. Repite la orden, comandante: la sala sigue abierta.", ...(debug ? { err: errMsg } : {}) },
      { status: 200 },
    );
  }
}
