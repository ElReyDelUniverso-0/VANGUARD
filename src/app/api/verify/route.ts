import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recordVerifyResult, upsertProfile, notify } from "@/lib/contrib-server";

// GET /api/verify — cola de noticias a verificar (no resueltas primero)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const voter = (searchParams.get("voter") || "").slice(0, 24);
  const items = await db.newsVerify.findMany({
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    take: 20,
    include: { votes: true },
  });
  const profile = voter ? await db.contributorProfile.findUnique({ where: { alias: voter } }) : null;
  const accuracy = profile && profile.verifTotal > 0 ? Math.round((profile.verifHits / profile.verifTotal) * 100) : null;
  return NextResponse.json({ items, accuracy, elite: profile?.badges.includes("elite") ?? false });
}

// POST /api/verify — votar si una noticia es real/falsa/dudosa/no-sé
// 10 usuarios verifican; el 70%+ decide; los que aciertan ganan +10 (x2 para elite).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const newsId = String(body?.newsId || "");
  const voter = String(body?.voter || "").slice(0, 24);
  const verdict = String(body?.verdict || "");
  if (!newsId || !voter || !["real", "falsa", "dudosa", "nose"].includes(verdict)) {
    return NextResponse.json({ error: "Voto inválido" }, { status: 400 });
  }
  const news = await db.newsVerify.findUnique({ where: { id: newsId }, include: { votes: true } });
  if (!news) return NextResponse.json({ error: "Noticia no encontrada" }, { status: 404 });
  if (news.votes.some((v) => v.voter === voter)) {
    return NextResponse.json({ error: "Ya verificaste esta noticia" }, { status: 409 });
  }

  await db.newsVerifyVote.create({ data: { newsId, voter, verdict } });
  let resolved = false;
  let correct = false;

  const fresh = await db.newsVerify.findUnique({ where: { id: newsId }, include: { votes: true } });
  const total = fresh!.votes.length;

  // resolución al llegar a 10 votos (o mayoría clara de 7+)
  if (total >= 10 || (total >= 7 && maxShare(fresh!.votes.map((v) => v.verdict)) >= 0.7)) {
    const tally: Record<string, number> = {};
    for (const v of fresh!.votes) tally[v.verdict] = (tally[v.verdict] || 0) + 1;
    const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    const truth = news.truth || winner; // si hay ground truth sembrada, se usa
    await db.newsVerify.update({ where: { id: newsId }, data: { resolved: true, truth } });
    resolved = true;
    // pagar aciertos
    for (const v of fresh!.votes) {
      const hit = v.verdict === truth;
      const profile = await upsertProfile(v.voter);
      const elite = profile.badges.includes("elite");
      const coins = hit ? (elite ? 20 : 10) : v.verdict === "dudosa" ? 5 : v.verdict === "nose" ? 2 : 0;
      if (coins > 0) {
        await db.contributorProfile.update({ where: { alias: v.voter }, data: { coinsEarned: { increment: coins } } });
      }
      await recordVerifyResult(v.voter, hit);
      if (hit) {
        await notify(v.voter, "Verificación correcta ✅ +10 monedas", `"${news.headline.slice(0, 70)}" era ${truth.toUpperCase()}.`, "✅");
      }
      if (v.voter === voter) correct = hit;
    }
  }

  return NextResponse.json({ ok: true, resolved, correct });
}

function maxShare(arr: string[]): number {
  const tally: Record<string, number> = {};
  for (const a of arr) tally[a] = (tally[a] || 0) + 1;
  return Math.max(0, ...Object.values(tally)) / arr.length;
}
