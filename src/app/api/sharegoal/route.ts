import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v49.0 DIFUSIÓN 200 — la meta del comando hecha mecánica.
// "Ahora una meta: 200 links, en diferentes lugares, innova."
// Cada enlace público verificado (blogs, pastes, wikis, gists, páginas,
// acortadores, imágenes) suma a 'shares:external' en site_counter. Esta
// ruta expone el progreso de la MISIÓN DE DIFUSIÓN y, cuando la comunidad
// + el equipo de difusión alcanzan 200 enlaces, TODOS pueden reclamar.
//
//   · Server lee 'shares:external' (solo enlaces verificados a mano, v36)
//   · Meta: 200 enlaces → 3.000 monedas + 30 gemas + 500 XP para cada agente
//   · Dedup idéntico a /api/goal: PK site_counter (k=sharegoal:claim:<alias>)
//   · Transparencia: 'sharegoal:claim' cuenta cuántos han reclamado

export const dynamic = "force-dynamic";

const LINK_GOAL = 200;
const REWARD = { coins: 3000, gems: 30, xp: 500 };

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

// GET /api/sharegoal — progreso de la misión de difusión
export async function GET() {
  try {
    await ensureTable();
    const total = await readKey("shares:external");
    const claimed = await readKey("sharegoal:claim");
    return NextResponse.json({
      ok: true,
      total,
      goal: LINK_GOAL,
      remaining: Math.max(0, LINK_GOAL - total),
      progress: Math.min(100, Math.round((total / LINK_GOAL) * 100)),
      reward: REWARD,
      claimed,
      unlocked: total >= LINK_GOAL,
    });
  } catch {
    return NextResponse.json(
      { ok: false, total: 0, goal: LINK_GOAL, remaining: LINK_GOAL, progress: 0, reward: REWARD, claimed: 0, unlocked: false },
      { status: 200 }
    );
  }
}

// POST /api/sharegoal — reclamar la recompensa por 200 enlaces
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
    if (total < LINK_GOAL) {
      return NextResponse.json(
        { error: "Aún no llegamos a 200 enlaces", remaining: LINK_GOAL - total },
        { status: 409 }
      );
    }
    const ins = await db.$executeRaw`
      INSERT INTO site_counter (k, n) VALUES (${`sharegoal:claim:${alias}`}, 1)
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
      goal: LINK_GOAL,
      reward: REWARD,
      claimed,
      total,
    });
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
