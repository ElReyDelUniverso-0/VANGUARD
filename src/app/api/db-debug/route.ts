import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// TEMPORAL v31.1 — diagnostico de conexion a la BD (no expone secretos:
// solo esquema y host de la URL + mensaje de error saneado). Eliminar tras diagnostico.
export async function GET() {
  const url = (process.env.DATABASE_URL || "").trim();
  let scheme = "(vacía)";
  let host = "(n/d)";
  if (!url) {
    scheme = "(NO DEFINIDA)";
  } else {
    try {
      const u = new URL(url);
      scheme = u.protocol.replace(":", "");
      host = u.host;
    } catch {
      scheme = "(URL invalida)";
    }
  }
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { db: "up", envScheme: scheme, envHost: host },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const msg = raw
      .replace(/:[^:@/\s]+@/g, ":****@")
      .replace(/(password|secret|token)=[^&\s]+/gi, "$1=****")
      .slice(0, 400);
    return NextResponse.json(
      { db: "down", envScheme: scheme, envHost: host, error: msg },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
