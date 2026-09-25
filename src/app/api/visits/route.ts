import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v34 LLAMADO A LAS ARMAS — contador real de visitas sin migración de esquema.
// La tabla se crea on-demand con CREATE TABLE IF NOT EXISTS (idempotente):
// no toca ninguna tabla existente, riesgo cero para la BD de producción.
// Contadores: 'total' (acumulado histórico) y 'day:YYYY-MM-DD' (se reinicia cada día UTC).
//
// v37 MISIÓN 100 — campaña de enlaces:
//   'shares:total'    → compartidos de la comunidad (botones/copias dentro de la app)
//   'shares:external' → envíos verificados a motores/directorios/archivos
//   'day:shares:...'  → compartidos de hoy
//   'ref:CODIGO'      → visitas que LLEGARON por cada enlace repartido (ranking en vivo)
//   'ref:total'       → total de visitas traídas por enlaces
//
// v38 OPERACIÓN 100 JUGADORES:
//   'player:UID'      → jugadores ÚNICOS que entraron a la guerra (1 fila por agente)
//   'players:total'   → meta del reto extremo: 100 jugadores
//   'day:players:...' → jugadores nuevos de hoy

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

const toNum = (n: bigint | number) => (typeof n === "bigint" ? Number(n) : n);

async function readCounts() {
  const rows = await db.$queryRaw<{ k: string; n: bigint | number }[]>`
    SELECT k, n FROM site_counter
    WHERE k = 'total'
       OR k = ${"day:" + todayKey()}
       OR k = ${"day:shares:" + todayKey()}
       OR k = ${"day:players:" + todayKey()}
       OR k IN ('shares:total', 'shares:external', 'ref:total', 'players:total')`;
  let total = 0;
  let today = 0;
  let shares = 0;
  let external = 0;
  let refVisits = 0;
  let sharesToday = 0;
  let players = 0;
  let playersToday = 0;
  for (const r of rows) {
    const n = toNum(r.n);
    if (r.k === "total") total = n;
    else if (r.k === "shares:total") shares = n;
    else if (r.k === "shares:external") external = n;
    else if (r.k === "ref:total") refVisits = n;
    else if (r.k === "players:total") players = n;
    else if (r.k === "day:" + todayKey()) today = n;
    else if (r.k === "day:shares:" + todayKey()) sharesToday = n;
    else if (r.k === "day:players:" + todayKey()) playersToday = n;
  }
  return {
    total,
    today,
    shares,
    external,
    refVisits,
    sharesToday,
    players,
    playersToday,
    mission: shares + external,
    goal: 100,
    playerGoal: 100,
  };
}

// top enlaces que están trayendo gente (ranking en vivo de la misión)
async function readTopRefs(limit = 8) {
  const rows = await db.$queryRaw<{ k: string; n: bigint | number }[]>`
    SELECT k, n FROM site_counter
    WHERE k LIKE ${"ref:VGD%"}
    ORDER BY n DESC
    LIMIT ${limit}`;
  return rows.map((r) => ({ code: r.k.slice(4), visits: toNum(r.n) }));
}

// POST /api/visits — registra una acción y devuelve los contadores actualizados.
// body: { action?: "visit" | "share" | "ref", code?: string }
export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = (await req.json().catch(() => ({}))) as {
      action?: string;
      code?: string;
      uid?: string;
    };
    const action = body?.action || "visit";

    if (action === "share") {
      // un enlace salió de la app (botón de compartir o copia del arsenal)
      await bump("shares:total");
      await bump(`day:shares:${todayKey()}`);
    } else if (action === "ref") {
      // un visitante aterrizó por un enlace repartido: suma al ranking de ese enlace
      const code = (body?.code || "")
        .replace(/[^A-Za-z0-9-]/g, "")
        .slice(0, 16)
        .toUpperCase();
      if (code.startsWith("VGD")) {
        await bump(`ref:${code}`);
        await bump("ref:total");
      }
    } else if (action === "player") {
      // v38: un agente entró a la guerra — cuenta solo si es ÚNICO (player:UID nuevo)
      const uid = (body?.uid || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 40);
      if (uid.length >= 8) {
        const inserted = await db.$executeRaw`
          INSERT INTO site_counter (k, n) VALUES (${"player:" + uid}, 1)
          ON CONFLICT (k) DO NOTHING`;
        if (inserted > 0) {
          await bump("players:total");
          await bump(`day:players:${todayKey()}`);
        }
      }
    } else {
      // visita normal
      await bump("total");
      await bump(`day:${todayKey()}`);
    }

    const counts = await readCounts();
    return NextResponse.json({ ok: true, ...counts });
  } catch {
    return NextResponse.json(
      { ok: false, total: 0, today: 0, shares: 0, external: 0, refVisits: 0, sharesToday: 0, players: 0, playersToday: 0, mission: 0, goal: 100, playerGoal: 100 },
      { status: 200 }
    );
  }
}

// GET /api/visits — el comandante vigila la campaña en vivo (visitas + misión + ranking)
export async function GET() {
  try {
    await ensureTable();
    const counts = await readCounts();
    let topLinks: { code: string; visits: number }[] = [];
    try {
      topLinks = await readTopRefs(8);
    } catch {
      topLinks = [];
    }
    return NextResponse.json({ ok: true, ...counts, topLinks });
  } catch {
    return NextResponse.json(
      { ok: false, total: 0, today: 0, shares: 0, external: 0, refVisits: 0, sharesToday: 0, players: 0, playersToday: 0, mission: 0, goal: 100, playerGoal: 100, topLinks: [] },
      { status: 200 }
    );
  }
}
