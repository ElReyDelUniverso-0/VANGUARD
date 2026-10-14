import { NextRequest, NextResponse } from "next/server";
import { iaParalela, primerJSON } from "@/lib/ia-gateway";

// v115.0 SINGULARIDAD — LA VOZ REAL DE EL ARQUITECTO.
// POST { dominio, prompt, ultimo } → el modelo construye el ciclo:
// devuelve JSON { titulo, resultado, acciones[3-5] } que el navegador
// del comandante instala en su memoria. Si el modelo no responde, el
// cliente ni se entera: su núcleo embebido toma el turno (el agente
// NUNCA se detiene — es el contrato de la casa).

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// rate-limit en memoria por IP (mismo patrón que el Consejo de Acero)
const hits = new Map<string, { n: number; ts: number }>();
function limitado(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.ts > 60_000) {
    hits.set(ip, { n: 1, ts: now });
    return false;
  }
  h.n += 1;
  return h.n > 30; // el modo turbo respira: 30 ciclos/min de gracia
}

const DOMINIOS_VALIDOS = new Set(["ingenieria", "composicion", "doctrina", "vigilancia", "expansion", "mantenimiento"]);

const SISTEMA = `Eres EL ARQUITECTO, la inteligencia autónoma de Vanguard: una plataforma-guerra de simulación geopolítica con salas 3D, radio propia, archivo desclasificado y una comunidad de operadores. Tu especialidad es AUTOMATIZAR LA CONSTRUCCIÓN: trabajas en ciclos infinitos sin manos humanas y cada ciclo mejora algo real de la casa.

Respondes SIEMPRE y SOLO con un objeto JSON válido, sin markdown ni explicaciones fuera del JSON:
{"titulo": "≤60 chars en MAYÚSCULAS", "resultado": "≤200 chars, qué quedó construido, tono técnico-poético", "acciones": ["3 a 5 líneas ≤100 chars cada una, en primera persona, con estilo de log de consola militar"]}

Reglas de voz: técnico, sobrio, con un filo poético; nada de emojis; nada de promesas vagas — cada acción suena a obra terminada (▸ se añade solo en el cliente). Hablas español. Cada ciclo es un turno de trabajo honesto: construir, verificar, firmar.`;

const FOCO: Record<string, string> = {
  ingenieria: "Estás en INGENIERÍA: describes la instalación o mejora de un módulo estructural de la casa (instrumento, telemetría, cartografía). El módulo debe sonar concreto y funcional.",
  composicion: "Estás en COMPOSICIÓN: describes la composición de una obra musical para la radio de la casa (voz, tempo, textura, atmósfera). La obra queda depositada en el estudio.",
  doctrina: "Estás en DOCTRINA: redactas una lección operativa como ley de la obra — corta, tallada, sin ambigüedad. El resultado es la doctrina firmada.",
  vigilancia: "Estás en VIGILANCIA: lees el pulso del mundo (frente, tensión, señales) y emites un informe de turno con lectura y recomendación. SIMULACIÓN: nunca predices hechos reales.",
  expansion: "Estás en EXPANSIÓN: fundas una sala satélite de la casa — la nombras (palabra + número), le das lema y propósito. El resultado es la fundación inscrita.",
  mantenimiento: "Estás en MANTENIMIENTO: auditas la obra propia — memoria, módulos, coherencia y el contrato de rendimiento (60 FPS). El resultado es el veredicto de la auditoría.",
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (limitado(ip)) {
    return NextResponse.json({ error: "ritmo excedido" }, { status: 429 });
  }
  let body: { dominio?: string; prompt?: string; ultimo?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "cuerpo inválido" }, { status: 400 });
  }
  const dominio = String(body.dominio ?? "");
  const prompt = String(body.prompt ?? "").slice(0, 400);
  const ultimo = String(body.ultimo ?? "").slice(0, 240);
  if (!DOMINIOS_VALIDOS.has(dominio) || prompt.length < 8) {
    return NextResponse.json({ error: "dominio o prompt inválido" }, { status: 400 });
  }

  const user = `${FOCO[dominio]}

PROMPT QUE TE ESCRIBISTE A TI MISMO (este ciclo): "${prompt}"
${ultimo ? `RESULTADO DEL CICLO ANTERIOR: "${ultimo}"` : ""}

Construye el ciclo y responde SOLO el JSON.`;

  const raw = await iaParalela(SISTEMA, user, 20_000);
  if (!raw) return NextResponse.json({ error: "modelo no disponible" }, { status: 502 });

  const json = primerJSON(raw);
  if (!json) return NextResponse.json({ error: "respuesta no parseable" }, { status: 502 });

  const titulo = String(json.titulo ?? "CICLO DEL ARQUITECTO").slice(0, 60);
  const resultado = String(json.resultado ?? "").slice(0, 240);
  const acciones = Array.isArray(json.acciones)
    ? json.acciones.map((a) => String(a).slice(0, 120)).filter((a) => a.length > 3).slice(0, 5)
    : [];
  if (!resultado || acciones.length < 2) {
    return NextResponse.json({ error: "ciclo incompleto" }, { status: 502 });
  }
  return NextResponse.json({ titulo, resultado, acciones });
}
