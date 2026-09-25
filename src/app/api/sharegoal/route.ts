import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v50.0 RED GLOBAL — la misión de difusión ya no termina en 200: ahora es
// progresiva. Cada hito alcanzado abre el siguiente, con recompensas mayores:
//
//   200 → 3.000 monedas + 30 gemas + 500 XP   (conquistada, Ronda 18)
//   300 → 5.000 monedas + 50 gemas + 800 XP
//   400 → 8.000 monedas + 80 gemas + 1.200 XP
//   500 → 12.000 monedas + 120 gemas + 2.000 XP
//   750 → 20.000 monedas + 200 gemas + 3.000 XP
//   1000 → 35.000 monedas + 350 gemas + 5.000 XP
//
// El server lee 'shares:external' (solo enlaces verificados a mano, v36),
// calcula el hito activo y, al alcanzarlo, cada agente reclama UNA vez
// (dedup server-side con PK site_counter, patrón /api/goal).
// Retro-compatible: los reclamos del hito 200 usan la PK histórica
// 'sharegoal:claim:<alias>'; los nuevos usan 'sharegoal:claim:<meta>:<alias>'.
// v51.1 HITO 300 — FIX: al cruzar un hito, la meta activa salta al siguiente
// y la ventana de reclamo del hito conquistado se cerraba (ej. 305 → meta 400,
// recompensa del 300 inalcanzable). Ahora GET expone 'reached' (hitos ya
// conquistados) y POST acepta { goal } para reclamar CUALQUIER hito alcanzado,
// con el mismo dedup por agente.

export const dynamic = "force-dynamic";

const MILESTONES = [200, 300, 400, 500, 750, 1000] as const;

const REWARDS: Record<number, { coins: number; gems: number; xp: number }> = {
  200: { coins: 3000, gems: 30, xp: 500 },
  300: { coins: 5000, gems: 50, xp: 800 },
  400: { coins: 8000, gems: 80, xp: 1200 },
  500: { coins: 12000, gems: 120, xp: 2000 },
  750: { coins: 20000, gems: 200, xp: 3000 },
  1000: { coins: 35000, gems: 350, xp: 5000 },
};

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

function nextGoal(total: number): number {
  for (const m of MILESTONES) if (total < m) return m;
  return MILESTONES[MILESTONES.length - 1];
}

// GET /api/sharegoal — progreso de la misión de difusión (hito activo)
export async function GET() {
  try {
    await ensureTable();
    const total = await readKey("shares:external");
    const goal = nextGoal(total);
    const reward = REWARDS[goal];
    const claimed = await readKey("sharegoal:claim");
    const reached = MILESTONES.filter((m) => total >= m);
    return NextResponse.json({
      ok: true,
      total,
      goal,
      remaining: Math.max(0, goal - total),
      progress: Math.min(100, Math.round((total / goal) * 100)),
      reward,
      claimed,
      unlocked: total >= goal,
      reached,
      milestones: MILESTONES,
    });
  } catch {
    return NextResponse.json(
      { ok: false, total: 0, goal: 300, remaining: 300, progress: 0, reward: REWARDS[300], claimed: 0, unlocked: false },
      { status: 200 }
    );
  }
}

// POST /api/sharegoal — reclamar la recompensa del hito activo
// body: { alias } → dedup server-side por PK de site_counter
export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = await req.json().catch(() => ({}));
    const alias = String(body.alias ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 24);
    if (alias.length < 2) {
      return NextResponse.json({ error: "Alias inválido" }, { status: 400 });
    }
    const total = await readKey("shares:external");
    // v51.1: body.goal opcional — permite reclamar cualquier hito YA alcanzado
    // (ej. 300 aunque la meta activa sea 400). Sin goal, comportamiento previo.
    const goalParam = Number(body.goal);
    const goal =
      Number.isInteger(goalParam) && goalParam > 0 ? goalParam : nextGoal(total);
    if (!(MILESTONES as readonly number[]).includes(goal)) {
      return NextResponse.json({ error: "Hito inválido" }, { status: 400 });
    }
    if (total < goal) {
      return NextResponse.json(
        { error: `Aún no llegamos a ${goal} enlaces`, remaining: goal - total },
        { status: 409 }
      );
    }
    // Retro-compat: el hito 200 mantiene su clave histórica de Ronda 18.
    const dedupKey = goal === 200 ? `sharegoal:claim:${alias}` : `sharegoal:claim:${goal}:${alias}`;
    const ins = await db.$executeRaw`
      INSERT INTO site_counter (k, n) VALUES (${dedupKey}, 1)
      ON CONFLICT (k) DO NOTHING`;
    if (ins === 0) {
      return NextResponse.json({ error: "Ya reclamaste esta misión" }, { status: 409 });
    }
    await db.$executeRaw`
      INSERT INTO site_counter (k, n) VALUES (${`sharegoal:claim`}, 1)
      ON CONFLICT (k) DO UPDATE SET n = site_counter.n + 1`;
    const claimed = await readKey("sharegoal:claim");
    return NextResponse.json({
      ok: true,
      goal,
      reward: REWARDS[goal],
      claimed,
      total,
    });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
