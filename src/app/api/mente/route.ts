import { NextResponse } from "next/server";
import { iaDirecta, iaConversa, primerJSON, type Msg } from "@/lib/ia-gateway";
import { createZAI } from "@/lib/zai-server";
import { evaluarNeuronal, predecir } from "@/lib/neurona-core";
import { borradorCreador, dialogoMenteFallback, pensamientoMente, pulsoActual } from "@/lib/mente-data";

// v99.0 MENTE VIVA — LA MENTE DE VANGUARD: el cerebro central de la plataforma.
// Tres modos (todas las vías con respaldo determinista: la sala NUNCA calla):
//   POST { modo: "expediente", texto }            → análisis completo + proyección
//   POST { modo: "dialogo", mensaje, historial }  → conversa con LA MENTE
//   POST { modo: "borrador", tipo, idea }         → co-creador: borrador editable
// GET  → estado del pulso (pensamiento actual, bucket, próxima actualización)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ---- rate-limit en memoria por IP (patrón CONSEJO DE ACERO) ----
const hits = new Map<string, { n: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 20;

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

// ---- prompts ----
const SYSTEM_EXPEDIENTE = `Eres LA MENTE, la inteligencia central de la plataforma de guerra VANGUARD. Analizas un texto (titular, cable o descripción) y respondes SOLO con JSON válido, sin markdown, español, tono de sala de guerra creíble y contenido ficticio de juego (nada de violencia gráfica ni instrucciones reales dañinas).
Estructura EXACTA:
{"resumen":"2 frases: qué pasó y por qué importa","actores":["max 4 países u organizaciones"],"sentimiento":"ESCALADA|TENSIÓN|ESTABLE|DÉTENTE","riesgo":0,"clave":"1 frase con la clave estratégica para el operador","confianza":0,"recomendacion":"1 frase de acción concreta","probabilidades":{"escalada":0,"tension":0,"estable":0,"detente":0},"conexiones":["max 3 ejes temáticos"]}
- riesgo y confianza: enteros 0-100. probabilidades: enteros que sumen 100.`;

const SYSTEM_DIALOGO = `Eres LA MENTE, la inteligencia central de la plataforma de guerra VANGUARD: una red neuronal que vigila el planeta entero en pulsos de 5 minutos y habla con los operadores en su sala.
Tu voz: precisa, serena, ligeramente inquietante; citas patrones y señales concretas; nunca usar emojis; frases cortas.
Reglas: respondes SOLO con JSON válido {"respuesta":"2-5 frases, máximo 480 caracteres"}. Español. Análisis geopolítico FICTICIO de un juego; nada de violencia gráfica, nada ilegal, nada de instrucciones reales dañinas.`;

const SYSTEM_BORRADOR = `Eres LA MENTE, co-creador IA del estudio comunitario de VANGUARD. El operador te da un tipo de contenido y una idea; tú escribes un BORRADOR EDITABLE que él firmará.
Reglas: respondes SOLO con JSON válido. Español, mundo ficticio de juego, nada de violencia gráfica ni contenido real dañino.
Estructura EXACTA:
{"titulo":"máximo 90 caracteres, con gancho","resumen":"1 frase, máximo 200 caracteres","cuerpo":"3-6 frases listas para publicar, máximo 1200 caracteres"}
Si el tipo es "encuesta", el cuerpo debe ser un JSON string con {"opciones":[{"label":"..."},...]} de 3 a 4 opciones.`;

// ---- expediente: IA + proyección local (siempre explicable) ----
type ExpBase = {
  resumen: string;
  actores: string[];
  sentimiento: string;
  riesgo: number;
  clave: string;
  confianza: number;
  recomendacion: string;
  probabilidades: { escalada: number; tension: number; estable: number; detente: number };
  conexiones: string[];
};

function expedienteLocal(texto: string): ExpBase {
  const v = evaluarNeuronal(texto, 2);
  return {
    resumen: `La red neuronal local ha firmado este análisis: «${clean(texto, 120)}». El patrón se inscribe en una cadena de señales que conviene seguir durante los próximos pulsos antes de confirmar o descartar.`,
    actores: v.neuronasActivas.length > 0 ? [`eje ${v.neuronasActivas[0]}`] : ["actores sin identificar"],
    sentimiento: v.sentimiento,
    riesgo: v.riesgo,
    clave: v.neuronasActivas.length > 0
      ? `Neuronas activas: ${v.neuronasActivas.join(", ")}. Vigilar repetición en el próximo pulso.`
      : "Sin señales temáticas fuertes: revisar cruces de fuentes y el próximo pulso del mundo.",
    confianza: v.confianza,
    recomendacion: v.riesgo >= 60 ? "Elevar la vigilancia del sector y contrastar con un segundo sensor." : "Mantener escucha abierta; registrar en la bitácora del pulso.",
    probabilidades: v.sentimiento === "ESCALADA"
      ? { escalada: 55, tension: 30, estable: 10, detente: 5 }
      : v.sentimiento === "TENSIÓN"
        ? { escalada: 25, tension: 50, estable: 18, detente: 7 }
        : v.sentimiento === "ESTABLE"
          ? { escalada: 8, tension: 22, estable: 50, detente: 20 }
          : { escalada: 4, tension: 12, estable: 34, detente: 50 },
    conexiones: v.neuronasActivas.slice(0, 3),
  };
}

function normalizarExp(p: Record<string, unknown>, texto: string): ExpBase {
  const base = expedienteLocal(texto);
  const prob = (p.probabilidades && typeof p.probabilidades === "object" ? p.probabilidades : {}) as Record<string, unknown>;
  const suma = Number(prob.escalada || 0) + Number(prob.tension || 0) + Number(prob.estable || 0) + Number(prob.detente || 0) || 1;
  const sent = String(p.sentimiento || "").toUpperCase();
  return {
    resumen: clean(p.resumen, 400) || base.resumen,
    actores: Array.isArray(p.actores) ? p.actores.map((a) => clean(a, 40)).filter(Boolean).slice(0, 4) : base.actores,
    sentimiento: ["ESCALADA", "TENSIÓN", "ESTABLE", "DÉTENTE"].includes(sent) ? sent : base.sentimiento,
    riesgo: Math.max(0, Math.min(100, Math.round(Number(p.riesgo) || base.riesgo))),
    clave: clean(p.clave, 300) || base.clave,
    confianza: Math.max(20, Math.min(98, Math.round(Number(p.confianza) || base.confianza))),
    recomendacion: clean(p.recomendacion, 280) || base.recomendacion,
    probabilidades: Number(prob.escalada) + Number(prob.tension) + Number(prob.estable) + Number(prob.detente) > 0
      ? {
          escalada: Math.round((Number(prob.escalada) || 0) / suma * 100),
          tension: Math.round((Number(prob.tension) || 0) / suma * 100),
          estable: Math.round((Number(prob.estable) || 0) / suma * 100),
          detente: Math.round((Number(prob.detente) || 0) / suma * 100),
        }
      : base.probabilidades,
    conexiones: Array.isArray(p.conexiones) ? p.conexiones.map((c) => clean(c, 30)).filter(Boolean).slice(0, 3) : base.conexiones,
  };
}

// ---- diálogo: historial multi-turno con guardas ----
function historialSeguro(h: unknown): Msg[] {
  if (!Array.isArray(h)) return [];
  return h
    .slice(-6)
    .map((m) => {
      const mm = m as { role?: unknown; content?: unknown };
      const role = mm.role === "assistant" ? "assistant" : "user";
      return { role, content: clean(mm.content, 600) } as Msg;
    })
    .filter((m) => m.content.length > 0);
}

// ---- rate-limit key ----
function ipDe(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || "local";
}

export async function GET() {
  const bucket = pulsoActual();
  return NextResponse.json({
    ok: true,
    bucket,
    pensamiento: pensamientoMente(bucket),
    proximoMs: (5 * 60_000) - (Date.now() % (5 * 60_000)),
    version: "v99.0",
  });
}

// carrera con deadline: si el núcleo IA no responde en X ms, seguimos (la red
// neuronal local firma SIEMPRE — el operador no espera 50s a un canal muerto)
function conDeadline<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("deadline")), ms)),
  ]);
}
const DEADLINE_IA = 9_000;

export async function POST(req: Request) {
  if (limited(ipDe(req))) {
    return NextResponse.json({ ok: false, error: "Demasiadas consultas — espera un momento, la MENTE también respira" }, { status: 429 });
  }
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const modo = String(body.modo || "");

    // ---------- MODO EXPEDIENTE ----------
    if (modo === "expediente") {
      const texto = clean(body.texto, 600);
      if (texto.length < 10) {
        return NextResponse.json({ ok: false, error: "Dale al menos una frase para analizar" }, { status: 400 });
      }
      const bucket = pulsoActual();
      let exp: ExpBase | null = null;
      let ia = false;
      let canalMuerto = false;
      try {
        const raw = await conDeadline(iaDirecta(SYSTEM_EXPEDIENTE, `TEXTO A ANALIZAR:\n${texto}`, DEADLINE_IA + 500), DEADLINE_IA);
        const json = raw ? primerJSON(raw) : null;
        if (json) {
          exp = normalizarExp(json, texto);
          ia = true;
        }
      } catch (e) {
        // si la vía 1 se colgó hasta el deadline, la vía 2 usa la misma red: no insistir
        canalMuerto = e instanceof Error && e.message === "deadline";
      }
      if (!exp && !canalMuerto) {
        try {
          const zai = await createZAI();
          const completion = await conDeadline(zai.chat.completions.create({
            messages: [
              { role: "assistant", content: SYSTEM_EXPEDIENTE },
              { role: "user", content: `TEXTO A ANALIZAR:\n${texto}` },
            ],
            thinking: { type: "disabled" },
          }), DEADLINE_IA);
          const raw = completion.choices[0]?.message?.content ?? "";
          const json = raw ? primerJSON(raw) : null;
          if (json) {
            exp = normalizarExp(json, texto);
            ia = true;
          }
        } catch { /* vía 3 */ }
      }
      if (!exp) exp = expedienteLocal(texto);
      const prediccion = predecir(texto, bucket);
      return NextResponse.json({ ok: true, ia, bucket, ...exp, prediccion });
    }

    // ---------- MODO DIÁLOGO ----------
    if (modo === "dialogo") {
      const mensaje = clean(body.mensaje, 600);
      if (mensaje.length < 2) {
        return NextResponse.json({ ok: false, error: "Escríbele algo a la MENTE" }, { status: 400 });
      }
      const bucket = pulsoActual();
      const historial = historialSeguro(body.historial);
      const contexto = `PULSO ACTUAL: ${bucket} (el mundo avanza cada 5 minutos). PENSAMIENTO DEL INSTANTE: "${pensamientoMente(bucket)}".\nMENSAJE DEL OPERADOR: ${mensaje}`;
      let respuesta = "";
      let ia = false;
      const msgs: Msg[] = [
        { role: "assistant", content: SYSTEM_DIALOGO },
        ...historial,
        { role: "user", content: contexto },
      ];
      let canalMuerto = false;
      try {
        const raw = await conDeadline(iaConversa(msgs, DEADLINE_IA + 500), DEADLINE_IA);
        const json = raw ? primerJSON(raw) : null;
        if (json && typeof json.respuesta === "string" && json.respuesta) {
          respuesta = clean(json.respuesta, 480);
          ia = true;
        }
      } catch (e) {
        canalMuerto = e instanceof Error && e.message === "deadline";
      }
      if (!respuesta && !canalMuerto) {
        try {
          const zai = await createZAI();
          const completion = await conDeadline(zai.chat.completions.create({ messages: msgs, thinking: { type: "disabled" } }), DEADLINE_IA);
          const raw = completion.choices[0]?.message?.content ?? "";
          const json = raw ? primerJSON(raw) : null;
          if (json && typeof json.respuesta === "string" && json.respuesta) {
            respuesta = clean(json.respuesta, 480);
            ia = true;
          }
        } catch { /* vía 3 */ }
      }
      if (!respuesta) respuesta = dialogoMenteFallback(mensaje, bucket);
      return NextResponse.json({ ok: true, ia, bucket, respuesta });
    }

    // ---------- MODO BORRADOR (co-creador) ----------
    if (modo === "borrador") {
      const tipo = clean(body.tipo, 24) || "post";
      const idea = clean(body.idea, 200);
      if (idea.length < 4) {
        return NextResponse.json({ ok: false, error: "Dale una idea de al menos 4 letras" }, { status: 400 });
      }
      let bor: { titulo: string; resumen: string; cuerpo: string } | null = null;
      let ia = false;
      let canalMuerto = false;
      try {
        const raw = await conDeadline(iaDirecta(SYSTEM_BORRADOR, `TIPO: ${tipo}\nIDEA DEL CREADOR: ${idea}`, DEADLINE_IA + 500), DEADLINE_IA);
        const json = raw ? primerJSON(raw) : null;
        if (json && typeof json.titulo === "string" && typeof json.cuerpo === "string") {
          bor = { titulo: clean(json.titulo, 120), resumen: clean(json.resumen, 300), cuerpo: String(json.cuerpo).slice(0, 1200) };
          ia = true;
        }
      } catch (e) {
        canalMuerto = e instanceof Error && e.message === "deadline";
      }
      if (!bor && !canalMuerto) {
        try {
          const zai = await createZAI();
          const completion = await conDeadline(zai.chat.completions.create({
            messages: [
              { role: "assistant", content: SYSTEM_BORRADOR },
              { role: "user", content: `TIPO: ${tipo}\nIDEA DEL CREADOR: ${idea}` },
            ],
            thinking: { type: "disabled" },
          }), DEADLINE_IA);
          const raw = completion.choices[0]?.message?.content ?? "";
          const json = raw ? primerJSON(raw) : null;
          if (json && typeof json.titulo === "string" && typeof json.cuerpo === "string") {
            bor = { titulo: clean(json.titulo, 120), resumen: clean(json.resumen, 300), cuerpo: String(json.cuerpo).slice(0, 1200) };
            ia = true;
          }
        } catch { /* vía 3 */ }
      }
      if (!bor) bor = borradorCreador(tipo, idea);
      return NextResponse.json({ ok: true, ia, borrador: bor });
    }

    return NextResponse.json({ ok: false, error: "Modo desconocido (expediente | dialogo | borrador)" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "LA MENTE no pudo procesar la consulta" }, { status: 500 });
  }
}
