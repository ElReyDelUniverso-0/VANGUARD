import { NextResponse } from "next/server";
import { registrarEventos } from "./registro";

// ============================================================
// VANGUARD v170.0 — /api/telemetria (POST batched)
// El cliente envía señales cada 30 s; la red las agrega.
// ============================================================

export async function POST(req: Request) {
  try {
    const cuerpo = (await req.json()) as {
      eventos?: { fila: string; via: string; ts: number }[];
    };
    const aceptados = registrarEventos(cuerpo.eventos ?? []);
    return NextResponse.json({ ok: true, aceptados });
  } catch {
    return NextResponse.json({ ok: false, aceptados: 0 }, { status: 400 });
  }
}
