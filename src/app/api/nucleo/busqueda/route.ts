// ============================================================
// v218.0 EL NÚCLEO — GET /api/nucleo/busqueda?q=…
// v221.0 LA LUPA — además &tipo=<tipo de entidad> filtra la
// respuesta (whitelist TIPOS_ENTIDAD; tipo desconocido → 400
// honesto, jamás silencioso). Muro 30/min por IP (ley v211).
// ============================================================
import { NextResponse } from "next/server";
import { buscarEnNucleo } from "@/lib/nucleo/busqueda";
import { TIPOS_ENTIDAD, type TipoEntidad } from "@/lib/nucleo/tipos";
import { muro, claveCliente, sanitizarLinea } from "@/lib/fortaleza";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const veredicto = muro(`nucleo-busq:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas búsquedas — espera unos segundos." },
      { status: 429 }
    );
  }
  const url = new URL(req.url);
  const q = sanitizarLinea(url.searchParams.get("q") ?? "", 64);
  if (q.trim().length < 2) {
    return NextResponse.json(
      { ok: false, error: "Escribe al menos 2 letras." },
      { status: 400 }
    );
  }
  const tipoParam = sanitizarLinea(url.searchParams.get("tipo") ?? "", 24);
  let tipoFiltro: TipoEntidad | null = null;
  if (tipoParam) {
    if (!(TIPOS_ENTIDAD as readonly string[]).includes(tipoParam)) {
      return NextResponse.json(
        {
          ok: false,
          error: `tipo desconocido: ${tipoParam} — válidos: ${TIPOS_ENTIDAD.join(", ")}`,
        },
        { status: 400 }
      );
    }
    tipoFiltro = tipoParam as TipoEntidad;
  }
  try {
    const resp = await buscarEnNucleo(q, 24, tipoFiltro);
    return NextResponse.json(resp, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("nucleo/busqueda error", e);
    return NextResponse.json(
      { ok: false, error: "El núcleo no responde ahora." },
      { status: 500 }
    );
  }
}
