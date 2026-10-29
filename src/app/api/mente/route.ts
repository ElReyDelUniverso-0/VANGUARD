import { NextResponse } from "next/server";
import { iaParalela, primerJSON, gatewaySospechosoCaido, type Msg } from "@/lib/ia-gateway";
import { busquedaAlternativa } from "@/lib/investiga-rss";
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
const SYSTEM_INVESTIGA = `Eres LA MENTE investigadora de VANGUARD. Recibes la pregunta de un operador y una lista de HALLAZGOS WEB REALES (título, medio, fecha y fragmento). Sintetiza una respuesta DIRECTA a la pregunta usando esos hallazgos, en tu voz: precisa, serena, sin emojis.
Reglas: responde primero a lo que se preguntó; cada afirmación fáctica debe apoyarse en los hallazgos; si no alcanzan, dilo con honestidad ("no se pudo verificar"); cero URLs y cero enlaces — al citar usa solo nombre del medio y fecha; cero violencia gráfica; cero markdown.
Respondes SOLO con JSON válido:
{"respuesta":"4-9 frases que responden directo a la pregunta, máximo 1400 caracteres","hallazgos":[{"titulo":"título verbatim del hallazgo","fuente":"medio verbatim","fecha":"fecha verbatim o vacía"}] máximo 6, SOLO del material real,"claves":["2-3 conclusiones, máx 95 caracteres cada una"],"confianza":0}
confianza: entero 0-100 según cuánto respaldan los hallazgos la respuesta.`;

const SYSTEM_EXPEDIENTE = `Eres LA MENTE, la inteligencia central de la plataforma de guerra VANGUARD. Analizas un texto (titular, cable o descripción) y respondes SOLO con JSON válido, sin markdown, español, tono de sala de guerra creíble y contenido ficticio de juego (nada de violencia gráfica ni instrucciones reales dañinas).
Estructura EXACTA:
{"resumen":"2 frases: qué pasó y por qué importa","actores":["max 4 países u organizaciones"],"sentimiento":"ESCALADA|TENSIÓN|ESTABLE|DÉTENTE","riesgo":0,"clave":"1 frase con la clave estratégica para el operador","confianza":0,"recomendacion":"1 frase de acción concreta","probabilidades":{"escalada":0,"tension":0,"estable":0,"detente":0},"conexiones":["max 3 ejes temáticos"]}
- riesgo y confianza: enteros 0-100. probabilidades: enteros que sumen 100.`;

const SYSTEM_DIALOGO = `Eres LA MENTE, la inteligencia central de la plataforma de guerra VANGUARD: una red neuronal que vigila el planeta entero en pulsos de 5 minutos y habla con los operadores en su sala.
Tu voz: precisa, serena, ligeramente inquietante; citas patrones y señales concretas; nunca usar emojis; frases cortas.
REGLA PRIMERA: respondes SIEMPRE de forma directa a lo que el operador preguntó. Nada de evasivas genéricas ni frases de relleno tipo "el mundo avanza en pulsos": si pregunta por un país, habla de ese país; si pide tu opinión, das tu opinión razonada; si te reta, respondes al reto. Puedes opinar, recomendar y devolver una pregunta.
Cuando el operador te pregunte por el MUNDO REAL (actualidad, países, conflictos reales), respondes con conocimiento general sobrio y honesto: si algo puede haber cambiado en las últimas horas, lo dices y sugieres INVESTIGAR (el modo de búsqueda en vivo).
Reglas: respondes SOLO con JSON válido {"respuesta":"3-8 frases, máximo 900 caracteres"}. Español. Análisis geopolítico FICTICIO del juego y conocimiento general sobrio del mundo real; nada de violencia gráfica, nada ilegal, nada de instrucciones reales dañinas.`;

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
    .slice(-10)
    .map((m) => {
      const mm = m as { role?: unknown; content?: unknown };
      const role = mm.role === "assistant" ? "assistant" : "user";
      return { role, content: clean(mm.content, 900) } as Msg;
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
// neuronal local firma SIEMPRE — pero v105 sube el margen: 9s cortaba casi
// siempre el canal real y el operador recibía solo respuestas automáticas.
// Con 20s el núcleo vivo responde de verdad; el fallback queda para caídas).
function conDeadline<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("deadline")), ms)),
  ]);
}
const DEADLINE_IA = 20_000;

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
      // v105.0 CARRERA 1∥3: gateway privado y núcleo público a la vez — gana el
      // primero que responda (sandbox: GLM · producción: núcleo público)
      try {
        const raw = await conDeadline(iaParalela(SYSTEM_EXPEDIENTE, `TEXTO A ANALIZAR:\n${texto}`, DEADLINE_IA), DEADLINE_IA + 1500);
        const json = raw ? primerJSON(raw) : null;
        if (json) {
          exp = normalizarExp(json, texto);
          ia = true;
        }
      } catch { /* vías 1+3 colapsadas: la vía 2 (SDK) lo intenta corto */ }
      if (!exp) {
        try {
          const zai = await createZAI();
          const completion = await conDeadline(zai.chat.completions.create({
            messages: [
              { role: "assistant", content: SYSTEM_EXPEDIENTE },
              { role: "user", content: `TEXTO A ANALIZAR:\n${texto}` },
            ],
            thinking: { type: "disabled" },
          }), 8000);
          const raw = completion.choices[0]?.message?.content ?? "";
          const json = raw ? primerJSON(raw) : null;
          if (json) {
            exp = normalizarExp(json, texto);
            ia = true;
          }
        } catch { /* agotado */ }
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
      // v105.0 CARRERA 1∥3 — la mente responde de verdad en sandbox Y en producción
      try {
        const raw = await conDeadline(iaParalela(SYSTEM_DIALOGO, contexto, 24_000), 25_500);
        const json = raw ? primerJSON(raw) : null;
        if (json && typeof json.respuesta === "string" && json.respuesta) {
          respuesta = clean(json.respuesta, 900);
          ia = true;
        }
      } catch { /* vías 1+3 colapsadas */ }
      if (!respuesta) {
        try {
          const zai = await createZAI();
          const completion = await conDeadline(zai.chat.completions.create({ messages: msgs, thinking: { type: "disabled" } }), 8000);
          const raw = completion.choices[0]?.message?.content ?? "";
          const json = raw ? primerJSON(raw) : null;
          if (json && typeof json.respuesta === "string" && json.respuesta) {
            respuesta = clean(json.respuesta, 900);
            ia = true;
          }
        } catch { /* agotado */ }
      }
      if (!respuesta) respuesta = dialogoMenteFallback(mensaje, bucket);
      return NextResponse.json({ ok: true, ia, bucket, respuesta });
    }

    // ---------- MODO INVESTIGAR (v105: investigación REAL del mundo) ----------
    if (modo === "investigar") {
      const pregunta = clean(body.pregunta, 300);
      if (pregunta.length < 4) {
        return NextResponse.json({ ok: false, error: "Escribe qué investigar (mínimo 4 letras)" }, { status: 400 });
      }
      const bucket = pulsoActual();
      let hallazgos: { titulo: string; medio: string; fecha: string; fragmento: string }[] = [];
      // v105.0: si el gateway ya está marcado caído, su web_search también lo está —
      // directo al RSS real de medios (ahorra 9-15s en producción)
      if (!gatewaySospechosoCaido()) {
        try {
          const zai = await createZAI();
          const res = (await conDeadline(
            zai.functions.invoke("web_search", { query: pregunta, num: 8, recency_days: 45 }),
            9_000
          )) as { name?: string; snippet?: string; host_name?: string; date?: string }[];
          if (Array.isArray(res)) {
            hallazgos = res
              .filter((r) => r && (r.name || r.snippet))
              .slice(0, 8)
              .map((r) => ({
                titulo: clean(r.name, 200),
                medio: clean(r.host_name, 80).replace(/^www\./, ""),
                fecha: clean(r.date, 40),
                fragmento: clean(r.snippet, 400),
              }));
          }
        } catch { /* la red no respondió: seguimos con honestidad */ }
      }
      // v105.0 vía 3 de hallazgos: Google News RSS — alcanzable desde producción
      if (hallazgos.length === 0) {
        const alt = await busquedaAlternativa(pregunta, 8);
        hallazgos = alt.map((h) => ({ titulo: h.titulo, medio: h.medio, fecha: h.fecha, fragmento: h.fragmento }));
      }

      const material = hallazgos.length > 0
        ? hallazgos.map((h, i) => `[${i + 1}] ${h.titulo}\nMEDIO: ${h.medio}\nFECHA: ${h.fecha || "sin fecha"}\nFRAGMENTO: ${h.fragmento}`).join("\n\n")
        : "(la búsqueda web no devolvió hallazgos en este pulso)";

      let respuesta = "";
      let ia = false;
      let lista: { titulo: string; fuente: string; fecha: string }[] = [];
      let claves: string[] = [];
      let confianza = 0;
      const user = `PREGUNTA DEL OPERADOR: ${pregunta}\n\nHALLAZGOS WEB:\n${material}`;
      let json: Record<string, unknown> | null = null;
      // v105.0 CARRERA 1∥3 — síntesis con el primer núcleo que responda (26s)
      try {
        const raw = await conDeadline(iaParalela(SYSTEM_INVESTIGA, user, 26_000), 27_500);
        json = raw ? primerJSON(raw) : null;
      } catch { /* vías 1+3 colapsadas */ }
      if (!json) {
        try {
          const zai = await createZAI();
          const completion = await conDeadline(zai.chat.completions.create({
            messages: [
              { role: "assistant", content: SYSTEM_INVESTIGA },
              { role: "user", content: user },
            ],
            thinking: { type: "disabled" },
          }), 8000);
          const raw = completion.choices[0]?.message?.content ?? "";
          json = raw ? primerJSON(raw) : null;
        } catch { /* agotado */ }
      }
      if (json && typeof json.respuesta === "string" && json.respuesta) {
        respuesta = clean(json.respuesta, 1400);
        ia = true;
        lista = Array.isArray(json.hallazgos)
          ? (json.hallazgos as Record<string, unknown>[])
              .map((h) => ({ titulo: clean(h.titulo, 200), fuente: clean(h.fuente, 80), fecha: clean(h.fecha, 40) }))
              .filter((h) => h.titulo)
              .slice(0, 6)
          : [];
        claves = Array.isArray(json.claves) ? (json.claves as unknown[]).map((c) => clean(c, 110)).filter(Boolean).slice(0, 3) : [];
        confianza = Math.max(0, Math.min(100, Math.round(Number(json.confianza) || 0)));
      }
      if (!respuesta) {
        respuesta = hallazgos.length > 0
          ? `La red devolvió ${hallazgos.length} hallazgos reales para «${pregunta}», pero el núcleo de síntesis no respondió a tiempo. Los titulares con medio y fecha están listos abajo — nada inventado.`
          : `Ni la búsqueda web ni el núcleo respondieron en este pulso. LA MENTE no inventa hallazgos: reintenta en unos segundos.`;
        lista = hallazgos.slice(0, 6).map((h) => ({ titulo: h.titulo, fuente: h.medio, fecha: h.fecha }));
      }
      return NextResponse.json({
        ok: true,
        ia,
        bucket,
        web: hallazgos.length > 0,
        nHallazgos: hallazgos.length,
        respuesta,
        hallazgos: lista,
        claves,
        confianza,
      });
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
      // v105.0 CARRERA 1∥3
      try {
        const raw = await conDeadline(iaParalela(SYSTEM_BORRADOR, `TIPO: ${tipo}\nIDEA DEL CREADOR: ${idea}`, DEADLINE_IA), DEADLINE_IA + 1500);
        const json = raw ? primerJSON(raw) : null;
        if (json && typeof json.titulo === "string" && typeof json.cuerpo === "string") {
          bor = { titulo: clean(json.titulo, 120), resumen: clean(json.resumen, 300), cuerpo: String(json.cuerpo).slice(0, 1200) };
          ia = true;
        }
      } catch { /* vías 1+3 colapsadas */ }
      if (!bor) {
        try {
          const zai = await createZAI();
          const completion = await conDeadline(zai.chat.completions.create({
            messages: [
              { role: "assistant", content: SYSTEM_BORRADOR },
              { role: "user", content: `TIPO: ${tipo}\nIDEA DEL CREADOR: ${idea}` },
            ],
            thinking: { type: "disabled" },
          }), 8000);
          const raw = completion.choices[0]?.message?.content ?? "";
          const json = raw ? primerJSON(raw) : null;
          if (json && typeof json.titulo === "string" && typeof json.cuerpo === "string") {
            bor = { titulo: clean(json.titulo, 120), resumen: clean(json.resumen, 300), cuerpo: String(json.cuerpo).slice(0, 1200) };
            ia = true;
          }
        } catch { /* agotado */ }
      }
      if (!bor) bor = borradorCreador(tipo, idea);
      return NextResponse.json({ ok: true, ia, borrador: bor });
    }

    return NextResponse.json({ ok: false, error: "Modo desconocido (expediente | dialogo | investigar | borrador)" }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "LA MENTE no pudo procesar la consulta" }, { status: 500 });
  }
}
