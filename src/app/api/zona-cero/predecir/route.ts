import { NextResponse } from "next/server";
import { iaDirecta } from "@/lib/ia-gateway";
import { predecir, sanear, avance, alertas, type Mesa, type Prediccion } from "@/lib/zona-cero/mesa";

// ═══════════════════════════════════════════════════════════════════════════
// v434.2 · ZONA CERO — LA PUERTA DE PREDECIR
//
//   POST /api/zona-cero/predecir
//   { mesa: <la mesa saneada>, usarIA?: boolean, pregunta?: string,
//     clave?: string, baseUrl?: string, modelo?: string }
//
// Hace dos cosas, y las dice por separado:
//   ① SIEMPRE devuelve las predicciones del MOTOR DE LA CASA, calculadas aquí
//      con las mismas funciones puras que usa la pantalla (deterministas y
//      explicables: cada número trae sus factores y su confianza).
//   ② Si se pide narración (usarIA) intenta explicarla con un modelo:
//      · con TU clave (OpenAI-compatible: openai, groq, openrouter, o una base
//        propia) — la clave se usa en esta llamada y no se guarda ni se registra;
//      · si no hay clave, con el núcleo de la casa (iaDirecta).
//      Si el modelo no contesta, se responde SIN narración y con el motivo.
//      Jamás se inventa un texto y se hace pasar por una predicción.
//
// La mesa NO se guarda aquí: vive en el aparato del operador. Esta ruta es
// stateless por diseño (nada de historiales ni perfiles en la casa).
// ═══════════════════════════════════════════════════════════════════════════

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const hits = new Map<string, { n: number; ts: number }>();
const VENTANA = 60_000;
const MAX = 12;

function limitado(claveIp: string): boolean {
  const ahora = Date.now();
  const h = hits.get(claveIp);
  if (!h || ahora - h.ts > VENTANA) {
    hits.set(claveIp, { n: 1, ts: ahora });
    if (hits.size > 300) for (const [k, v] of hits) if (ahora - v.ts > VENTANA) hits.delete(k);
    return false;
  }
  h.n += 1;
  return h.n > MAX;
}

function ip(req: Request): string {
  const f = req.headers.get("x-forwarded-for") ?? "";
  return (f.split(",")[0] || "local").trim().slice(0, 60);
}

function texto(v: unknown, max: number): string {
  return String(v ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

/** Solo destinos https (o http en local): nunca se manda una clave a un http raro. */
function baseSegura(v: unknown): string | null {
  const crudo = texto(v, 300);
  if (!crudo) return null;
  try {
    const u = new URL(crudo);
    const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
    if (u.protocol !== "https:" && !(local && u.protocol === "http:")) return null;
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

/** El prompt de la narración: solo los números de la mesa, nada inventado. */
function promptNarracion(mesa: Mesa, predicciones: Prediccion[], pregunta: string): string {
  const av = avance(mesa);
  const al = alertas(mesa, Date.now());
  const lineas = predicciones.map(
    (p) =>
      `- ${p.pregunta} → ${Math.round(p.probabilidad * 100)} % (confianza ${Math.round(p.confianza * 100)} %). Factores: ${p.factores
        .map((f) => `${f.etiqueta}=${f.valor} (peso ${f.peso})`)
        .join("; ")}.`
  );
  return [
    `MESA: ${mesa.titulo}. Órdenes: ${av.total} (${av.hechas} hechas, ${av.abiertas} abiertas, ${av.pct} % de avance).`,
    `Señales en el tablero: ${mesa.pines.length}. Capturas: ${mesa.capturas.length}.`,
    al.length ? `Avisos: ${al.map((a) => a.texto).join(" | ").slice(0, 600)}` : "Sin avisos.",
    "",
    "PREDICCIONES DEL MOTOR:",
    ...lineas,
    "",
    pregunta ? `PREGUNTA DEL OPERADOR: ${pregunta}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const SISTEMA =
  "Eres el analista de la ZONA CERO de VANGUARD. Recibes los números de la mesa de órdenes de un operador y explicas qué " +
  "significan en dos o tres frases, en español, en voz alta y sin adornos. Reglas: no inventes datos que no estén en el " +
  "resumen; si la confianza es baja, dilo; no repitas los porcentajes uno a uno, di qué patrón ves y qué conviene hacer " +
  "primero; nada de markdown, nada de listas, nada de rutas. Máximo 90 palabras.";

export async function POST(req: Request) {
  if (limitado(ip(req))) {
    return NextResponse.json({ ok: false, motivo: "Demasiadas predicciones seguidas; espera unos segundos." }, { status: 429 });
  }

  let cuerpo: Record<string, unknown> = {};
  try {
    cuerpo = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, motivo: "El cuerpo no es JSON válido." }, { status: 400 });
  }

  const ahora = Date.now();
  const mesa = sanear(cuerpo.mesa, ahora);
  if (!mesa) {
    return NextResponse.json({ ok: false, motivo: "Falta la mesa (o no tiene forma de mesa de ZONA CERO)." }, { status: 400 });
  }

  const horizonte = Math.max(1, Math.min(90, Number(cuerpo.horizonteDias ?? mesa.ajustes.horizonteDias) || 7));
  const predicciones = predecir(mesa, ahora, horizonte);
  const pregunta = texto(cuerpo.pregunta, 400);

  const quiereIA = cuerpo.usarIA === true;
  if (!quiereIA) {
    return NextResponse.json(
      { ok: true, predicciones, motor: "casa", narracion: "", horizonteDias: horizonte },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // ── narración: primero la clave del operador, después el núcleo de la casa ──
  const clave = texto(cuerpo.clave, 400);
  const base = baseSegura(cuerpo.baseUrl);
  const modelo = texto(cuerpo.modelo, 120) || "gpt-4o-mini";
  const contenido = promptNarracion(mesa, predicciones, pregunta);

  if (clave) {
    if (!base) {
      return NextResponse.json(
        {
          ok: true,
          predicciones,
          motor: "casa",
          narracion: "",
          motivo: "La dirección del proveedor tiene que ser https (o http://localhost). No se ha enviado tu clave a ningún sitio.",
          horizonteDias: horizonte,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }
    try {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${clave}` },
        body: JSON.stringify({
          model: modelo,
          messages: [
            { role: "system", content: SISTEMA },
            { role: "user", content: contenido },
          ],
          max_tokens: 320,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) {
        const detalle = await res.text().catch(() => "");
        return NextResponse.json(
          {
            ok: true,
            predicciones,
            motor: "casa",
            narracion: "",
            motivo: `Tu proveedor respondió ${res.status}. ${texto(detalle, 220) || "Sin detalle."} Las predicciones de abajo son las de la casa y no dependen de esto.`,
            horizonteDias: horizonte,
          },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
      const datos = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const narracion = texto(datos?.choices?.[0]?.message?.content, 1200);
      return NextResponse.json(
        {
          ok: true,
          predicciones,
          motor: narracion ? "tu-clave" : "casa",
          narracion,
          motivo: narracion ? "" : "Tu proveedor contestó vacío. Se queda la predicción de la casa.",
          horizonteDias: horizonte,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (e) {
      return NextResponse.json(
        {
          ok: true,
          predicciones,
          motor: "casa",
          narracion: "",
          motivo: `No se pudo llegar a tu proveedor (${texto((e as Error)?.message ?? "sin red", 120)}). Las predicciones de abajo son las de la casa.`,
          horizonteDias: horizonte,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  // sin clavé del operador: el núcleo de la casa (si está disponible)
  try {
    const narracion = texto(await iaDirecta(SISTEMA, contenido, 25_000), 1200);
    return NextResponse.json(
      {
        ok: true,
        predicciones,
        motor: narracion ? "casa-nucleo" : "casa",
        narracion,
        motivo: narracion ? "" : "El núcleo de la casa no contestó. Las predicciones de abajo son deterministas y siguen valiendo.",
        horizonteDias: horizonte,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      {
        ok: true,
        predicciones,
        motor: "casa",
        narracion: "",
        motivo: "El núcleo de la casa no está disponible ahora mismo. Las predicciones de abajo no dependen de él.",
        horizonteDias: horizonte,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      puerta: "zona-cero.predecir",
      metodo: "POST",
      cuerpo: {
        mesa: "la mesa saneada (obligatoria)",
        usarIA: "true para pedir narración",
        clave: "opcional: tu clave (OpenAI-compatible); no se guarda",
        baseUrl: "opcional: https://api.openai.com/v1 · https://api.groq.com/openai/v1 · https://openrouter.ai/api/v1",
        modelo: "opcional",
        horizonteDias: "1..90",
        pregunta: "opcional: qué quieres saber",
      },
      nota: "El motor de la casa es determinista y explicable; la narración es opcional y nunca sustituye al número.",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
