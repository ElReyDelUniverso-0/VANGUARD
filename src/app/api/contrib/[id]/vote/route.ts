import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { communityVerdict, CONTRIB_REWARDS } from "@/lib/rewards";
import { upsertProfile, notify, rewardApproval, punishFakeReport } from "@/lib/contrib-server";

// POST /api/contrib/[id]/vote — voto comunitario
// verdict: confirmo | niego | like
// - reportes: 5+ votos y 70% -> auto-aprobado (+50 y +5 por confirmo extra) o falso (-20)
// - analisis: like (a 50 likes +250, a 100 likes +500 bonus)
// - fichas/predicciones/traducciones: votos suman reputación para el admin
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const voter = String(body?.voter || "").slice(0, 24);
  const verdict = String(body?.verdict || "");
  if (!voter || !["confirmo", "niego", "like"].includes(verdict)) {
    return NextResponse.json({ error: "Voto inválido" }, { status: 400 });
  }

  const item = await db.contribution.findUnique({ where: { id }, include: { votes: true } });
  if (!item) return NextResponse.json({ error: "Contribución no encontrada" }, { status: 404 });
  if (item.author === voter && verdict !== "like") {
    return NextResponse.json({ error: "No puedes votar tu propia contribución" }, { status: 400 });
  }

  // like (sin voto único: cualquiera puede dar like)
  if (verdict === "like") {
    const alreadyLiked = item.votes.some((v) => v.voter === voter && v.verdict === "like");
    if (alreadyLiked) return NextResponse.json({ error: "Ya diste like" }, { status: 409 });
    await db.contributionVote.create({ data: { contributionId: id, voter, verdict } });
    const likes = item.likes + 1;
    await db.contribution.update({ where: { id }, data: { likes } });
    if (likes === 50) {
      await db.contributorProfile.update({ where: { alias: item.author }, data: { coinsEarned: { increment: 250 } } }).catch(() => {});
      await notify(item.author, "Tu análisis llegó a 50 likes 🔥 +250 monedas", `"${item.title.slice(0, 70)}" está en tendencia.`, "🔥");
    }
    if (likes === 100) {
      await db.contributorProfile.update({ where: { alias: item.author }, data: { coinsEarned: { increment: 500 } } }).catch(() => {});
      await notify(item.author, "Tu análisis llegó a 100 likes 💯 +500 monedas BONUS", "¡Estás entre los mejores analistas de VANGUARD!", "💯");
    }
    return NextResponse.json({ ok: true, likes });
  }

  // confirmo / niego (1 voto por usuario)
  const existing = item.votes.find((v) => v.voter === voter && v.verdict !== "like");
  if (existing) return NextResponse.json({ error: "Ya votaste esta contribución" }, { status: 409 });
  await db.contributionVote.create({ data: { contributionId: id, voter, verdict } });

  if (item.type === "reporte" && item.status === "pendiente") {
    const fresh = await db.contribution.findUnique({ where: { id }, include: { votes: true } });
    const confirm = fresh!.votes.filter((v) => v.verdict === "confirmo").length;
    const deny = fresh!.votes.filter((v) => v.verdict === "niego").length;
    const verdictResult = communityVerdict(confirm, deny);
    if (verdictResult === "aprobado") {
      // +50 base +5 por cada "confirmo" extra sobre el mínimo de 5
      const extra = Math.max(0, confirm - 5) * 5;
      await rewardApproval("reporte", item.author, item.country, extra);
      await db.contribution.update({ where: { id }, data: { status: "aprobado", rewardCoins: CONTRIB_REWARDS.reporte.coins + extra } });
      // badge Reportero Verificado a los 10 aprobados
      const p = await db.contributorProfile.findUnique({ where: { alias: item.author } });
      if (p && p.approved >= 10 && !p.badges.includes("reportero10")) {
        await db.contributorProfile.update({ where: { alias: item.author }, data: { badges: (p.badges + "reportero10,").slice(0, 200) } });
        await notify(item.author, "Badge REPORTERO VERIFICADO 🏅", "10 reportes aprobados. Tus reportes destacan en el mapa.", "🏅");
      }
    } else if (verdictResult === "rechazado") {
      await punishFakeReport(item.author);
      await db.contribution.update({ where: { id }, data: { status: "rechazado", rejectReason: "La comunidad lo marcó como falso" } });
    }
  }

  return NextResponse.json({ ok: true, verdict });
}
