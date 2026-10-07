import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { APP_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";

// v27 ESTABILIDAD — latido del server que el watchdog del cliente consulta.
// Si falla 3 veces seguidas, el cliente muestra "RECONECTANDO" y recarga
// cuando vuelve: el usuario ya no ve "la página se cayó" sin explicación.
//
// v84.0 FORTUNA DE GUERRA — ADIÓS A LOS FALSOS "SE CAYÓ LA CONEXIÓN":
// la consulta de BD ya NO puede colgar el latido. Supabase (plan gratis) a
// veces tarda o se pausa → antes el route devolvía 503 o se pasaba del
// timeout del cliente y el watchdog contaba 3 fallos seguidos → overlay
// RECONECTANDO en pantalla aunque la app funcionaba perfectamente (todo el
// progreso vive en localStorage). Ahora:
//   · la consulta corre contra un reloj de 3.5s (Promise.race)
//   · el route SIEMPRE responde 200 si el proceso Next está vivo (que es lo
//     único que el watchdog necesita saber); el estado de la BD va en el payload
//     como db: "up" | "slow" | "down" para diagnóstico.
const DB_TIMEOUT_MS = 3500;

export async function GET() {
  const started = Date.now();
  let dbStatus: "up" | "slow" | "down" = "down";
  try {
    await Promise.race([
      db.$queryRaw`SELECT 1`,
      new Promise((_, rej) => setTimeout(() => rej(new Error("db-timeout")), DB_TIMEOUT_MS)),
    ]);
    dbStatus = "up";
  } catch (e) {
    dbStatus = e instanceof Error && e.message === "db-timeout" ? "slow" : "down";
  }
  const mem = process.memoryUsage();
  return NextResponse.json(
    {
      ok: true, // el PROCESO responde: para el cliente esto es lo que importa
      db: dbStatus,
      ms: Date.now() - started,
      rss: Math.round(mem.rss / 1048576),
      heap: Math.round(mem.heapUsed / 1048576),
      uptime: Math.round(process.uptime()),
      version: APP_VERSION,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
