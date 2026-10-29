import { NextResponse } from "next/server";
import { createZAI } from "@/lib/zai-server";

// v94.0 GOOGLES TOTAL — TRADUCTOR DE VANGUARD
// El traductor de la suite: 8 idiomas del juego (es/en/pt/fr/de/it/zh/ru).
// POST { texto, de, a } → { traduccion, nota?, ia, ms }
// Vía 1: caché en memoria (TTL 24 h).
// Vía 2: núcleo IA (createZAI, runtime nodejs — patrón v89).
// Vía 3: glosario determinista es↔en (~50 términos geopolíticos) para que
//        el traductor NUNCA quede sin respuesta.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const IDIOMAS: Array<{ code: string; nombre: string }> = [
  { code: "es", nombre: "Español" },
  { code: "en", nombre: "Inglés" },
  { code: "pt", nombre: "Portugués" },
  { code: "fr", nombre: "Francés" },
  { code: "de", nombre: "Alemán" },
  { code: "it", nombre: "Italiano" },
  { code: "zh", nombre: "Chino" },
  { code: "ru", nombre: "Ruso" },
];

const NOMBRES: Record<string, string> = Object.fromEntries(IDIOMAS.map((i) => [i.code, i.nombre]));

interface RespTraductor {
  traduccion: string;
  nota: string;
  ia: boolean;
  ms: number;
}

const CACHE = new Map<string, { r: RespTraductor; ts: number }>();
const TTL_MS = 86_400_000;
const CACHE_MAX = 300;

function fnv(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

// ---- glosario de emergencia (es ↔ en) — el traductor nunca calla ----
const GLOSARIO: Record<string, string> = {
  "alto el fuego": "ceasefire", "alto al fuego": "ceasefire", guerra: "war", paz: "peace",
  frontera: "border", frente: "front", batalla: "battle", ejército: "army",
  flota: "fleet", submarino: "submarine", portaviones: "aircraft carrier",
  misil: "missile", misiles: "missiles", dron: "drone", drones: "drones",
  sanción: "sanction", sanciones: "sanctions", embargo: "embargo",
  refugiados: "refugees", refugiado: "refugee", evacuación: "evacuation",
  negociación: "negotiation", tratado: "treaty", cumbre: "summit",
  espionaje: "espionage", inteligencia: "intelligence", satélite: "satellite",
  petróleo: "oil", trigo: "wheat", grano: "grain",
  convoy: "convoy", ataque: "attack", defensa: "defense", aliado: "ally",
  aliados: "allies", diplomacia: "diplomacy", embajada: "embassy",
  estrecho: "strait", canal: "canal", puerto: "port",
  seguridad: "security", amenaza: "threat", crisis: "crisis", conflicto: "conflict",
  operador: "operator", comandante: "commandant", informes: "reports",
  "armas nucleares": "nuclear weapons", nuclear: "nuclear",
};

function viaGlosario(texto: string, de: string, a: string): string {
  const dir = de.startsWith("es") && a === "en" ? "es-en" : de === "en" && a.startsWith("es") ? "en-es" : null;
  if (!dir) return "";
  let out = texto;
  const pares = Object.entries(GLOSARIO).sort((x, y) => y[0].length - x[0].length);
  for (const [k, v] of pares) {
    const [a1, b1] = dir === "es-en" ? [k, v] : [v, k];
    out = out.replace(new RegExp(`\\b${a1}\\b`, "gi"), b1);
  }
  return out === texto ? "" : out;
}

export async function GET() {
  return NextResponse.json({ ok: true, idiomas: IDIOMAS, version: "v94.0" });
}

export async function POST(req: Request) {
  const t0 = Date.now();
  let body: { texto?: string; de?: string; a?: string } = {};
  try { body = await req.json(); } catch { /* cuerpo vacío */ }
  const texto = (body.texto ?? "").trim().slice(0, 900);
  const de = (body.de ?? "es").slice(0, 5);
  const a = (body.a ?? "en").slice(0, 5);
  if (!texto) return NextResponse.json({ error: "Falta el texto a traducir" }, { status: 400 });
  if (de === a) return NextResponse.json({ traduccion: texto, nota: "Mismo idioma", ia: false, ms: Date.now() - t0 });

  const key = fnv(texto + de + a);
  const hit = CACHE.get(key);
  if (hit && Date.now() - hit.ts < TTL_MS) {
    return NextResponse.json({ ...hit.r, ms: Date.now() - t0 });
  }

  const nombreDe = NOMBRES[de] ?? de;
  const nombreA = NOMBRES[a] ?? a;

  const SYSTEM = `Eres el TRADUCTOR OFICIAL de VANGUARD, la plataforma de inteligencia geopolítica. Traduces con precisión de agencia: términos militares, diplomáticos y energéticos correctos, tono sobrio de informe. Devuelves SIEMPRE solo JSON válido: {"traduccion": "...", "nota": "máx 90 chars con un matiz útil (registro, alternativa o alerta terminológica) o string vacío"}. No inventes contexto. Si hay ambigüedad, resuélvela por el sentido geopolítico más común.`;
  const USER = `Traduce de ${nombreDe} a ${nombreA}:\n\n"""${texto}"""`;

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
    const j = JSON.parse(m[0]) as { traduccion?: string; nota?: string };
    const traduccion = (j.traduccion ?? "").trim();
    if (!traduccion) throw new Error("traducción vacía");
    const r: RespTraductor = { traduccion, nota: (j.nota ?? "").trim().slice(0, 140), ia: true, ms: Date.now() - t0 };
    if (CACHE.size >= CACHE_MAX) {
      const oldest = [...CACHE.entries()].sort((x, y) => x[1].ts - y[1].ts)[0];
      if (oldest) CACHE.delete(oldest[0]);
    }
    CACHE.set(key, { r, ts: Date.now() });
    return NextResponse.json(r);
  } catch {
    // vía 3: glosario
    const g = viaGlosario(texto, de, a);
    if (g) {
      const r: RespTraductor = { traduccion: g, nota: "Traducido con el glosario táctico local (núcleo IA sin conexión)", ia: false, ms: Date.now() - t0 };
      CACHE.set(key, { r, ts: Date.now() });
      return NextResponse.json(r);
    }
    return NextResponse.json(
      { error: "El núcleo de traducción no responde ahora mismo. Prueba otra vez en unos segundos.", ia: false, ms: Date.now() - t0 },
      { status: 503 },
    );
  }
}
