// ============================================================
// v218.0 EL NÚCLEO — GET /api/nucleo/entidad?id=vg:<tipo>:<clave>
// La ficha de cualquier entidad del ecosistema: metadatos reales,
// enlaces contextuales y cables relacionados. Muro 60/min (ley v211).
// ============================================================
import { NextResponse } from "next/server";
import { fichaEntidad } from "@/lib/nucleo/relaciones";
import { muro, claveCliente, sanitizarLinea } from "@/lib/fortaleza";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const veredicto = muro(`nucleo-ent:${claveCliente(req)}`, 60, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas fichas por segundo — respira." },
      { status: 429 }
    );
  }
  const url = new URL(req.url);
  const id = sanitizarLinea(url.searchParams.get("id") ?? "", 80);
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Falta ?id=vg:<tipo>:<clave>" },
      { status: 400 }
    );
  }
  try {
    const ficha = await fichaEntidad(id);
    if (!ficha.ok) {
      return NextResponse.json(ficha, { status: 404 });
    }
    return NextResponse.json(ficha, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("nucleo/entidad error", e);
    return NextResponse.json(
      { ok: false, error: "El núcleo no responde ahora." },
      { status: 500 }
    );
  }
}
