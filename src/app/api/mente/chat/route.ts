import { NextResponse } from "next/server";
import { hablarConMente, type Mensaje } from "@/lib/mente/agente";

// v431.0 · LA MENTE EN TODAS PARTES — la puerta de la conversación global.
//
// POR QUÉ UNA RUTA NUEVA Y NO TOCAR `/api/mente`: aquella es la sala del
// cuartel y tiene su contrato (expediente · dialogo · investigar · borrador)
// con llamadas en producción. Esta no rompe nada: es la puerta del PANEL
// GLOBAL, que habla desde cualquier página, sabe dónde estás, te lleva a los
// sitios, crea artefactos y recuerda.
//
// CONTRATO:
//   POST /api/mente/chat            → text/event-stream (evento `paso` …, `final`, `error`)
//   POST /api/mente/chat?json=1     → JSON plano (pruebas y clientes simples)
//   { mensaje, historial?, ruta?, memoria? }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Rate-limit por IP en memoria (mismo patrón que /api/mente): la casa no paga
// dos veces por la misma tecla pulsada.
const hits = new Map<string, { n: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 15;

function limitado(ip: string): boolean {
  const ahora = Date.now();
  const h = hits.get(ip);
  if (!h || ahora - h.ts > WINDOW_MS) {
    hits.set(ip, { n: 1, ts: ahora });
    if (hits.size > 400) for (const [k, v] of hits) if (ahora - v.ts > WINDOW_MS) hits.delete(k);
    return false;
  }
  h.n += 1;
  return h.n > MAX_REQ;
}

function texto(v: unknown, max: number): string {
  return String(v ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function historialSeguro(v: unknown): Mensaje[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(-10)
    .map((m) => {
      const o = (m ?? {}) as Record<string, unknown>;
      const rol = o.rol === "mente" ? "mente" : "operador";
      const t = texto(o.texto, 600);
      return t ? ({ rol, texto: t } as Mensaje) : null;
    })
    .filter((m): m is Mensaje => m !== null);
}

function memoriaSegura(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => texto(x, 200)).filter(Boolean).slice(-12);
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  if (limitado(ip)) {
    return NextResponse.json({ ok: false, error: "Demasiadas preguntas seguidas. Respira un minuto." }, { status: 429 });
  }

  let cuerpo: Record<string, unknown> = {};
  try {
    cuerpo = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Falta el mensaje" }, { status: 400 });
  }

  const mensaje = texto(cuerpo.mensaje, 1_500);
  if (mensaje.length < 2) {
    return NextResponse.json({ ok: false, error: "Escríbele algo a LA MENTE" }, { status: 400 });
  }

  const peticion = {
    mensaje,
    historial: historialSeguro(cuerpo.historial),
    ruta: texto(cuerpo.ruta, 300) || undefined,
    memoria: memoriaSegura(cuerpo.memoria),
  };

  // ── Modo plano: una respuesta y se acabó (pruebas, curl, clientes simples) ──
  const url = new URL(req.url);
  if (url.searchParams.get("json") === "1") {
    const r = await hablarConMente(peticion);
    return NextResponse.json({ ok: true, ...r });
  }

  // ── Modo flujo: el operador ve lo que la mente está haciendo mientras pasa ──
  const codificador = new TextEncoder();
  const flujo = new ReadableStream<Uint8Array>({
    async start(control) {
      let cerrado = false;
      const enviar = (evento: string, datos: unknown) => {
        if (cerrado) return;
        control.enqueue(codificador.encode(`event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`));
      };
      // latido: algunos proxies cortan los flujos mudos a los 30 s
      const latido = setInterval(() => enviar("latido", { t: Date.now() }), 12_000);
      try {
        enviar("abierto", { ok: true });
        const r = await hablarConMente({ ...peticion, onPaso: (p) => enviar("paso", p) });
        enviar("final", r);
      } catch {
        enviar("error", { mensaje: "La mente se quedó sin aire a medio camino. Vuelve a intentarlo." });
      } finally {
        clearInterval(latido);
        cerrado = true;
        try {
          control.close();
        } catch {
          /* ya cerrado */
        }
      }
    },
  });

  return new Response(flujo, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Saber si la puerta está viva sin gastar una llamada al modelo. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    puerta: "mente/chat",
    acepta: "POST { mensaje, historial?, ruta?, memoria? }",
    flujo: "text/event-stream (abierto · paso · final · error)",
    plano: "POST ?json=1",
  });
}
