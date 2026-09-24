import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v46.0 OBJETIVO MUNDIAL — LA META QUE NOS PAGA A TODOS.
// El comandante ordenó: "busca jugadores y supera siempre el límite". La
// mecánica más honesta para lograrlo no es regalar bots ni inflar números:
// es convertir el crecimiento en un OBJETIVO COMUNITARIO con recompensa real.
//
//   · Server lee 'players:total' de site_counter (jugadores ÚNICOS reales, v38)
//   · Hitos: 30 → 40 → 50 → 75 → 100 → 150 → 200 → 300 → 500
//   · Cuando la comunidad alcanza el hito, TODOS pueden reclamar monedas+gemas
//   · Cada jugador reclama 1 vez por hito: dedup server-side con la PK de
//     site_counter (k = goal:claim:<hito>:<alias>, INSERT ... ON CONFLICT DO
//     NOTHING → rows=0 significa "ya reclamaste")
//   · 'goal:claim:<hito>' cuenta cuántos reclaman (transparencia)
//
// Tabla: la MISMA site_counter (idempotente, riesgo cero, doctrina v34/v42).

export const dynamic = "force-dynamic";

const MILESTONES: { goal: number; coins: number; gems: number; xp: number }[] = [
  { goal: 30, coins: 1000, gems: 10, xp: 300 },
  { goal: 40, coins: 1500, gems: 15, xp: 400 },
  { goal: 50, coins: 2500, gems: 25, xp: 600 },
  { goal: 75, coins: 4000, gems: 40, xp: 900 },
  { goal: 100, coins: 6000, gems: 60, xp: 1200 },
  { goal: 150, coins: 9000, gems: 90, xp: 1800 },
  { goal: 200, coins: 15000, gems: 150, xp: 2500 },
  { goal: 300, coins: 25000, gems: 250, xp: 4000 },
  { goal: 500, coins: 50000, gems: 500, xp: 8000 },
];

async function ensureTable() {
  await db.$executeRawUnsafe(
    "CREATE TABLE IF NOT EXISTS site_counter (k TEXT PRIMARY KEY, n BIGINT NOT NULL DEFAULT 0)"
  );
}

const toNum = (n: bigint | number) => (typeof n === "bigint" ? Number(n) : n);

async function readKey(key: string): Promise<number> {
  const rows = await db.$queryRaw<{ n: bigint | number }[]>`
    SELECT n FROM site_counter WHERE k = ${key}`;
  return rows[0] ? toNum(rows[0].n) : 0;
}

function nextMilestone(total: number) {
  return MILESTONES.find((m) => m.goal > total) ?? MILESTONES[MILESTONES.length - 1];
}

function pastMilestones(total: number) {
  return MILESTONES.filter((m) => m.goal <= total).map((m) => m.goal);
}

function futureGoals(total: number) {
  return MILESTONES.filter((m) => m.goal > total).map((m) => m.goal);
}

// GET /api/goal — estado de la meta comunitaria
export async function GET() {
  try {
    await ensureTable();
    const total = await readKey("players:total");
    const milestone = nextMilestone(total);
    const claimed = await readKey(`goal:claim:${milestone.goal}`);
    return NextResponse.json({
      ok: true,
      total,
      goal: milestone.goal,
      remaining: Math.max(0, milestone.goal - total),
      progress: Math.min(100, Math.round((total / milestone.goal) * 100)),
      reward: { coins: milestone.coins, gems: milestone.gems, xp: milestone.xp },
      claimed,
      unlocked: total >= milestone.goal,
      nextGoals: futureGoals(total),
      passedGoals: pastMilestones(total),
    });
  } catch {
    return NextResponse.json(
      { ok: false, total: 0, goal: 30, remaining: 30, progress: 0, reward: { coins: 1000, gems: 10, xp: 300 }, claimed: 0, unlocked: false, nextGoals: [], passedGoals: [] },
      { status: 200 }
    );
  }
}

// POST /api/goal — reclamar la recompensa del hito actual
// body: { alias, goal? } → dedup por alias con la PK de site_counter
export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = await req.json().catch(() => ({}));
    const alias = String(body.alias ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24);
    if (alias.length < 2) {
      return NextResponse.json({ error: "Alias inválido" }, { status: 400 });
    }
    const total = await readKey("players:total");
    const milestone = nextMilestone(total);
    if (total < milestone.goal) {
      return NextResponse.json(
        { error: "Aún no se alcanza la meta", remaining: milestone.goal - total },
        { status: 409 }
      );
    }
    // dedup server-side: la PK impide el doble reclamo del mismo alias
    const ins = await db.$executeRaw`
      INSERT INTO site_counter (k, n) VALUES (${`goal:claim:${milestone.goal}:${alias}`}, 1)
      ON CONFLICT (k) DO NOTHING`;
    if (ins === 0) {
      return NextResponse.json({ error: "Ya reclamaste esta meta" }, { status: 409 });
    }
    await db.$executeRaw`
      INSERT INTO site_counter (k, n) VALUES (${`goal:claim:${milestone.goal}`}, 1)
      ON CONFLICT (k) DO UPDATE SET n = site_counter.n + 1`;
    const claimed = await readKey(`goal:claim:${milestone.goal}`);
    return NextResponse.json({
      ok: true,
      goal: milestone.goal,
      reward: { coins: milestone.coins, gems: milestone.gems, xp: milestone.xp },
      claimed,
      total,
    });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
