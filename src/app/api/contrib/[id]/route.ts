import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CONTRIB_REWARDS, MOD_REWARD } from "@/lib/rewards";
import { upsertProfile, notify } from "@/lib/contrib-server";

// Clave de administrador (demo). En producción va en .env + NextAuth.
const ADMIN_KEY = "VANGUARD-2026";

// PATCH /api/contrib/[id] — moderación: aprobar | rechazar | bonus
// Puede: admin con clave, o Editor Senior (500+ aprobadas) como moderador.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const action = String(body?.action || "");
  const moderator = String(body?.moderator || "Admin").slice(0, 24);
  const isAdmin = body?.adminKey === ADMIN_KEY;

  const item = await db.contribution.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Contribución no encontrada" }, { status: 404 });

  // permiso de moderación
  if (!isAdmin) {
    const mod = await db.contributorProfile.findUnique({ where: { alias: moderator } });
    const isSenior = !!mod && mod.approved >= 500;
    if (!isSenior) return NextResponse.json({ error: "Solo un Editor Senior (500+) o el admin puede moderar" }, { status: 403 });
  }

  if (action === "aprobar") {
    if (item.status === "aprobado") return NextResponse.json({ item });
    const base = CONTRIB_REWARDS[item.type]?.coins ?? 10;
    const bonus = Math.max(0, Math.min(1000, parseInt(String(body?.bonus ?? 0), 10) || 0));
    const total = base + bonus;
    await db.contribution.update({
      where: { id },
      data: { status: "aprobado", rewardCoins: total, reviewedBy: moderator },
    });
    const profile = await upsertProfile(item.author, item.country);
    await db.contributorProfile.update({
      where: { alias: item.author },
      data: { approved: { increment: 1 }, pending: Math.max(0, profile.pending - 1), coinsEarned: { increment: total } },
    });
    await notify(item.author, `Tu ${CONTRIB_REWARDS[item.type]?.label.toLowerCase() ?? "contribución"} fue ${CONTRIB_REWARDS[item.type]?.past ?? "aprobada"} 🎉 +${total} monedas`, bonus > 0 ? `Incluye un bonus especial de +${bonus} del administrador.` : "Gracias por construir VANGUARD.", contribIcon(item.type));
    // paga al moderador
    const modProfile = await upsertProfile(moderator);
    await db.contributorProfile.update({ where: { alias: moderator }, data: { coinsEarned: { increment: MOD_REWARD } } });
    await notify(moderator, `Moderaste un contenido ✅ +${MOD_REWARD} monedas`, `Revisaste "${item.title.slice(0, 60)}".`, "🛡️");
    return NextResponse.json({ item: await db.contribution.findUnique({ where: { id } }), rewarded: total });
  }

  if (action === "rechazar") {
    const reason = String(body?.reason || "No cumple las normas").slice(0, 200);
    await db.contribution.update({ where: { id }, data: { status: "rechazado", rejectReason: reason, reviewedBy: moderator } });
    const profile = await upsertProfile(item.author);
    await db.contributorProfile.update({ where: { alias: item.author }, data: { pending: Math.max(0, profile.pending - 1) } });
    await notify(item.author, `Tu ${item.type} fue rechazada ❌`, `Motivo: ${reason}`, "❌");
    return NextResponse.json({ item: await db.contribution.findUnique({ where: { id } }) });
  }

  if (action === "badge") {
    // badge especial manual (ej. "Reportero Verificado")
    const badge = String(body?.badge || "").slice(0, 30);
    if (!badge) return NextResponse.json({ error: "Falta badge" }, { status: 400 });
    const profile = await upsertProfile(item.author);
    if (!profile.badges.includes(badge)) {
      await db.contributorProfile.update({ where: { alias: item.author }, data: { badges: (profile.badges + badge + ",").slice(0, 200) } });
    }
    await notify(item.author, `Nuevo badge: ${badge} 🏅`, "El administrador te ha otorgado un badge especial.", "🏅");
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
}

function contribIcon(type: string) {
  return CONTRIB_REWARDS[type]?.icon ?? "✅";
}
