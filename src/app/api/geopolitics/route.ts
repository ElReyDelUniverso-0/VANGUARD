import { NextResponse } from "next/server";
import { getRadar } from "@/lib/geopolitics";

// v43.0 RADAR GLOBAL — titulares de conflicto del mundo entero (GDELT) +
// alertas de desastres en vivo (GDACS). Fuentes abiertas, SIN API key.
// Cache interno de 5 min (ver lib/geopolitics.ts); las fuentes caídas
// degradan a [] con ok:true para que el cliente nunca se rompa.

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const radar = await getRadar();
    return NextResponse.json({
      ok: true,
      ...radar,
      sources: {
        news: "GDELT Project — gdeltproject.org (open data)",
        alerts: "GDACS — European Commission JRC (public feed)",
      },
    });
  } catch {
    // imposible llegar aquí sin que getRadar degrade, pero por si acaso
    return NextResponse.json({
      ok: false,
      gdeltEs: [],
      gdeltEn: [],
      gdacs: [],
      cachedAt: null,
    });
  }
}
