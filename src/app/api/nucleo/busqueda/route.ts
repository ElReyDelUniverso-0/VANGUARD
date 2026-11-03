// ============================================================
// v218.0 EL NÚCLEO — GET /api/nucleo/busqueda?q=…
// La búsqueda global por API: SOLO proveedores públicos (la
// guarda de frontera vive en buscarEnNucleo). Muro 30/min por
// IP (ley v211: muro objeto — se juzga .permitido).
// ============================================================
import { NextResponse } from "next/server";
import { buscarEnNucleo } from "@/lib/nucleo/busqueda";
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
  try {
    const resp = await buscarEnNucleo(q, 24);
    return NextResponse.json(resp, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("nucleo/busqueda error", e);
    return NextResponse.json(
      { ok: false, error: "El núcleo no responde ahora." },
      { status: 500 }
    );
  }
}
