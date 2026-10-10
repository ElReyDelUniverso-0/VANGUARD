// Vanguard v102.0 LA CIUDADELA — estado público de la fortaleza.
// GET → sellos de seguridad activos + telemetría de los muros.
// El panel FORTALEZA (SISTEMA) lo muestra: la seguridad se ve, no se esconde.
import { NextResponse } from "next/server";
import { estadoFortaleza } from "@/lib/fortaleza";

export const dynamic = "force-dynamic";

export async function GET() {
  const estado = estadoFortaleza();
  return NextResponse.json({
    ok: true,
    version: "v102.0",
    sellos: estado.sellos,
    murosActivos: estado.muros,
    blindajes: estado.lockouts,
  });
}
