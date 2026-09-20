import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rankOf } from "@/lib/rewards";
import { upsertProfile } from "@/lib/contrib-server";

// GET /api/contrib/leaderboard?alias= — ranking completo de contribuidores
// Devuelve: top del mes, hall de la fama (top 50), stats globales,
// contribuidor del mes y mi perfil con rango.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const alias = (searchParams.get("alias") || "").slice(0, 24);

  const monthAgo = new Date(Date.now() - 30 * 86400_000);

  const [topMonth, hallOfFame, fichas, noticias, analisis, streamAgg, totalContrib, contribOfMonth, myProfile, typeCounts] = await Promise.all([
    db.contribution.groupBy({
      by: ["author"],
      where: { status: "aprobado", createdAt: { gte: monthAgo } },
      _count: { _all: true },
      orderBy: { _count: { author: "desc" } },
      take: 10,
    }),
    db.contributorProfile.findMany({
      orderBy: [{ approved: "desc" }, { coinsEarned: "desc" }],
      take: 50,
    }),
    db.contribution.count({ where: { type: "ficha", status: "aprobado" } }),
    db.newsVerify.count(),
    db.contribution.count({ where: { type: "analisis", status: "aprobado" } }),
    db.contributorProfile.aggregate({ _sum: { streamMinutes: true } }),
    db.contribution.count(),
    db.contribution.groupBy({
      by: ["author"],
      where: { status: "aprobado", createdAt: { gte: monthAgo } },
      _count: { _all: true },
      orderBy: { _count: { author: "desc" } },
      take: 1,
    }),
    alias ? db.contributorProfile.findUnique({ where: { alias } }) : null,
    db.contribution.groupBy({ by: ["type", "status"], _count: { _all: true } }),
  ]);

  const monthAuthor = contribOfMonth[0]?.author;
  const monthContrib = monthAuthor ? await db.contributorProfile.findUnique({ where: { alias: monthAuthor } }) : null;
  const monthCount = contribOfMonth[0]?._count._all ?? 0;

  const myData = myProfile
    ? { ...myProfile, rank: rankOf(myProfile.approved) }
    : { approved: 0, rejected: 0, pending: 0, coinsEarned: 0, verifHits: 0, verifTotal: 0, streamMinutes: 0, streamEarnings: 0, badges: "", rank: rankOf(0) };

  return NextResponse.json({
    topMonth: topMonth.map((t) => ({ author: t.author, count: t._count._all })),
    hallOfFame,
    stats: {
      fichas,
      noticiasVerificadas: noticias,
      analisis,
      horasStream: Math.round((streamAgg._sum.streamMinutes ?? 0) / 60),
      totalContribuciones: totalContrib,
    },
    contribOfMonth: monthContrib ? { ...monthContrib, count: monthCount } : null,
    me: myData,
    typeCounts,
  });
}

// POST /api/contrib/leaderboard — crear/actualizar mi perfil de contribuidor
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const alias = String(body?.alias || "").slice(0, 24);
  if (!alias) return NextResponse.json({ error: "Falta alias" }, { status: 400 });
  const profile = await upsertProfile(alias, body?.country);
  return NextResponse.json({ profile, rank: rankOf(profile.approved) });
}
