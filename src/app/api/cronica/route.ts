// ============================================================
// v367.1 EL OJO DEL DUEÑO — GET /api/cronica
// El parte del día en JSON, derivado del archivo real (una sola lectura).
// Muro 30/min por IP (ley v211). Sin caché: una crónica vieja es una
// crónica falsa. Consumidores: /cronica (SSR la usa directo) y el panel de
// /centinela (que cruza lo que sigues con lo que de verdad ha pasado).
// ============================================================
import { NextResponse } from "next/server";
import { parteDelDia } from "@/lib/cronica";
import { muro, claveCliente } from "@/lib/fortaleza";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const veredicto = muro(`cronica:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas crónicas — espera unos segundos." },
      { status: 429 },
    );
  }
  const parte = await parteDelDia();
  return NextResponse.json(parte, { headers: { "Cache-Control": "no-store" } });
}
