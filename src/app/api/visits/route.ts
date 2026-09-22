import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v34 LLAMADO A LAS ARMAS — contador real de visitas sin migración de esquema.
// La tabla se crea on-demand con CREATE TABLE IF NOT EXISTS (idempotente):
// no toca ninguna tabla existente, riesgo cero para la BD de producción.
// Contadores: 'total' (acumulado histórico) y 'day:YYYY-MM-DD' (se reinicia cada día UTC).

export const dynamic = "force-dynamic";

const todayKey = () => new Date().toISOString().slice(0, 10);

async function ensureTable() {
  await db.$executeRawUnsafe(
    "CREATE TABLE IF NOT EXISTS site_counter (k TEXT PRIMARY KEY, n BIGINT NOT NULL DEFAULT 0)"
  );
}

async function bump(key: string) {
  await db.$executeRaw`
    INSERT INTO site_counter (k, n) VALUES (${key}, 1)
    ON CONFLICT (k) DO UPDATE SET n = site_counter.n + 1`;
}

async function readCounts() {
  const rows = await db.$queryRaw<{ k: string; n: bigint | number }[]>`
    SELECT k, n FROM site_counter WHERE k = 'total' OR k = ${"day:" + todayKey()}`;
  let total = 0;
  let today = 0;
  for (const r of rows) {
    const n = typeof r.n === "bigint" ? Number(r.n) : r.n;
    if (r.k === "total") total = n;
    else today = n;
  }
  return { total, today };
}

// POST /api/visits — registra una visita y devuelve los contadores actualizados
export async function POST() {
  try {
    await ensureTable();
    await bump("total");
    await bump(`day:${todayKey()}`);
    const counts = await readCounts();
    return NextResponse.json({ ok: true, ...counts });
  } catch {
    return NextResponse.json({ ok: false, total: 0, today: 0 }, { status: 200 });
  }
}

// GET /api/visits — el comandante puede vigilar cuánta gente llega, en cualquier momento
export async function GET() {
  try {
    await ensureTable();
    const counts = await readCounts();
    return NextResponse.json({ ok: true, ...counts });
  } catch {
    return NextResponse.json({ ok: false, total: 0, today: 0 }, { status: 200 });
  }
}
