import { NextResponse } from "next/server";
import { getRadar } from "@/lib/geopolitics";

// v43.0 RADAR GLOBAL — alertas de desastres (GDACS, Comisión Europea) aquí;
// titulares de conflicto GDELT se consumen DIRECTO desde el navegador del
// visitante (CORS abierto, ver geopolitics-radar.tsx): la IP compartida de
// Vercel está rate-limitada 1 req/5s por todo el mundo y GDELT la bloquea.

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const radar = await getRadar();
    return NextResponse.json({
      ok: true,
      gdacs: radar.gdacs,
      cachedAt: radar.cachedAt,
      sources: {
        alerts: "GDACS — European Commission JRC (public feed)",
        news: "GDELT Project — consumido desde el navegador (CORS abierto)",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, gdacs: [], cachedAt: null });
  }
}
