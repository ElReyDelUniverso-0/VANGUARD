// ============================================================
// v367.2 LA VOZ MAESTRA — POST /api/maestro
//
// El cerebro nuevo de la voz de la casa. Mismo contrato que /api/asistente
// ({hablar, accion, briefing}) — por eso el orbe de siempre puede cambiar de
// cerebro sin tocar su interfaz — pero con tres cosas que antes no existían:
//   · RESPUESTAS LARGAS con estructura de analista (qué pasa · por qué
//     importa · qué vigilar · qué significa) en vez de 220 caracteres.
//   · MEMORIA DE CONVERSACIÓN: el cliente manda `historial` y el maestro
//     sigue el hilo («dame un ejemplo», «¿por qué?», «sigue»).
//   · FUENTES con fecha real en la respuesta (doctrina de la casa).
//
// Los datos son del ARCHIVO REAL (una sola lectura, la misma del parte del
// día). Si la BD no responde, el maestro lo dice: nunca inventa cifras.
// Muro 30/min por IP (ley v211). Sin claves, sin servicios de pago.
// ============================================================
import { NextResponse } from "next/server";
import { parteDelDia } from "@/lib/cronica";
import { responder, type DatosMaestro, type Turno } from "@/lib/agente/maestro";
import { fechaHora } from "@/lib/procedencia";
import { muro, claveCliente } from "@/lib/fortaleza";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function datosDesdeParte(p: Awaited<ReturnType<typeof parteDelDia>>): DatosMaestro {
  return {
    ok: p.ok,
    consultadoEn: p.consultadoEn,
    archivo: p.censo.archivo,
    total24: p.censo.ultimas24,
    total7: p.censo.enVentana,
    teatros: p.teatros.map((t) => ({
      tag: t.tag,
      nombre: t.tag,
      n24: t.hoy,
      n7: t.semana,
      ultimo: t.ultimo
        ? {
            titulo: t.ultimo.titulo,
            fuente: t.ultimo.fuente,
            fecha: fechaHora(t.ultimo.publicado),
          }
        : null,
    })),
    medios: p.medios.map((m) => m.medio),
    nota: p.nota,
  };
}

export async function POST(req: Request) {
  const veredicto = muro(`maestro:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas preguntas seguidas — dame unos segundos." },
      { status: 429 },
    );
  }

  let cuerpo: { texto?: unknown; historial?: unknown } = {};
  try {
    cuerpo = (await req.json()) as { texto?: unknown; historial?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo ilegible." }, { status: 400 });
  }

  const texto = typeof cuerpo.texto === "string" ? cuerpo.texto.slice(0, 600) : "";
  if (!texto.trim()) {
    return NextResponse.json({ ok: false, error: "No he oído nada." }, { status: 400 });
  }

  // memoria acotada: 12 turnos y 400 caracteres cada uno (el hilo, no el archivo)
  const historial: Turno[] = Array.isArray(cuerpo.historial)
    ? (cuerpo.historial as unknown[])
        .filter((x): x is Turno => {
          if (!x || typeof x !== "object") return false;
          const t = x as { rol?: unknown; texto?: unknown };
          return (t.rol === "piloto" || t.rol === "casa") && typeof t.texto === "string";
        })
        .slice(-12)
        .map((t) => ({ rol: t.rol, texto: t.texto.slice(0, 400) }))
    : [];

  try {
    const parte = await parteDelDia();
    const datos = datosDesdeParte(parte);
    const r = responder(texto, datos, historial);
    return NextResponse.json(
      {
        ok: true,
        hablar: r.hablar,
        ai: r.ai,
        accion: r.accion,
        briefing: r.briefing ?? [],
        fuentes: r.fuentes ?? [],
        modo: r.modo,
        tema: r.tema ?? "",
        seguir: r.seguir ?? [],
        corte: datos.consultadoEn,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "El cerebro de la casa no responde ahora mismo. La voz no va a inventar una respuesta.",
      },
      { status: 200 },
    );
  }
}

// GET — la ficha de presentación del maestro (para la sala y para el censo)
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      nombre: "LA VOZ MAESTRA",
      modos: ["panorama", "teatro", "clase", "cronica", "ejemplo", "navegar", "ayuda"],
      memoria: "12 turnos",
      datos: "archivo real de la casa (tabla NewsItem), una sola lectura por pregunta",
      noHace: ["inventar cifras", "prometer salas que no existen", "salir de Vanguard"],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
