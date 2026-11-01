import { NextResponse } from "next/server";
import { buildInstantaneaMundo } from "@/lib/mundo-datos";
import { muro, claveCliente } from "@/lib/fortaleza";

// v215.0 EL MUNDO — el latido JSON del planeta.
// GET /api/mundo → { ok, generado, hoy, paises, teatros[] } sin caché:
// el globo de /mundo sondea cada 60 s y las guerras SE MUEVEN SOLOS
// (ley v190: la página jamás se recarga — solo entran datos).
// Muro 30/min: sobra para el humano, estrangula al scraper (ley v211:
// muro() devuelve un OBJETO — se juzga .permitido, no la verdad).

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const veredictoMuro = muro(`mundo:${claveCliente(req)}`, 30, 60_000);
  if (!veredictoMuro.permitido) {
    return NextResponse.json(
      { ok: false, error: "El mundo respira — espera un momento" },
      { status: 429 }
    );
  }
  try {
    const snap = await buildInstantaneaMundo();
    return NextResponse.json(
      { ok: true, ...snap },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("mundo error", e);
    return NextResponse.json(
      { ok: false, teatros: [], hoy: 0, paises: 0, error: "instantánea no disponible" },
      { status: 200 }
    );
  }
}
