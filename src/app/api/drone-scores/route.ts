import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_DIFFS = new Set(["RECLUTA", "VETERANO", "ELITE", "LEYENDA"]);
const clean = (v: unknown, max: number) => {
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
};

// GET /api/drone-scores -> top 20 global
export async function GET() {
  try {
    const scores = await db.droneScore.findMany({
      orderBy: [{ score: "desc" }, { createdAt: "asc" }],
      take: 20,
    });
    return NextResponse.json({ ok: true, scores });
  } catch (e) {
    console.error("drone-scores GET", e);
    return NextResponse.json({ ok: false, error: "No se pudo leer el ranking", scores: [] }, { status: 500 });
  }
}

// POST /api/drone-scores { alias, score, hits, difficulty } -> guarda y devuelve puesto global
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });

    const rawAlias = typeof body.alias === "string" ? body.alias.trim().slice(0, 24) : "";
    const alias = (rawAlias || "OPERADOR").toUpperCase();
    const score = clean(body.score, 100000);
    const hits = clean(body.hits, 5000);
    const difficulty = VALID_DIFFS.has(body.difficulty) ? body.difficulty : "VETERANO";

    const entry = await db.droneScore.create({ data: { alias, score, hits, difficulty } });
    const better = await db.droneScore.count({ where: { score: { gt: score } } });

    return NextResponse.json({ ok: true, id: entry.id, rank: better + 1 });
  } catch (e) {
    console.error("drone-scores POST", e);
    return NextResponse.json({ ok: false, error: "No se pudo guardar el puntaje" }, { status: 500 });
  }
}
