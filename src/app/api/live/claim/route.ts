import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/live/claim { alias } — reclamar monedas ganadas en directos
// (las monedas entran a la bolsa local del jugador desde el cliente).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const alias = String(body?.alias || "").slice(0, 24);
  if (!alias) return NextResponse.json({ error: "Falta alias" }, { status: 400 });
  const profile = await db.contributorProfile.findUnique({ where: { alias } });
  if (!profile || profile.streamEarnings <= 0) return NextResponse.json({ ok: true, claimed: 0 });
  const claimed = profile.streamEarnings;
  await db.contributorProfile.update({ where: { alias }, data: { streamEarnings: 0 } });
  return NextResponse.json({ ok: true, claimed });
}

// GET /api/live/claim?alias= — ganancias en espera
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const alias = (searchParams.get("alias") || "").slice(0, 24);
  if (!alias) return NextResponse.json({ pending: 0 });
  const profile = await db.contributorProfile.findUnique({ where: { alias } });
  return NextResponse.json({ pending: profile?.streamEarnings ?? 0 });
}
