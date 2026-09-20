import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { APP_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";

// v27 ESTABILIDAD — latido del server que el watchdog del cliente consulta.
// Si falla 3 veces seguidas, el cliente muestra "RECONECTANDO" y recarga
// cuando vuelve: el usuario ya no ve "la página se cayó" sin explicación.
export async function GET() {
  const started = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    const mem = process.memoryUsage();
    return NextResponse.json(
      {
        ok: true,
        db: "up",
        ms: Date.now() - started,
        rss: Math.round(mem.rss / 1048576),
        heap: Math.round(mem.heapUsed / 1048576),
        uptime: Math.round(process.uptime()),
        version: APP_VERSION,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
