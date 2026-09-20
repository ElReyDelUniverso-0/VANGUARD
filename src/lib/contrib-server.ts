// Vanguard v23 — helpers de servidor para EN VIVO + CONTRIBUIDORES.
import { db } from "@/lib/db";
import { CONTRIB_REWARDS } from "@/lib/rewards";

/** Perfil de contribuidor (crea si no existe). */
export async function upsertProfile(alias: string, country?: string) {
  const clean = (alias || "Anónimo").slice(0, 24).trim();
  const existing = await db.contributorProfile.findUnique({ where: { alias: clean } });
  if (existing) return existing;
  return db.contributorProfile.create({
    data: { alias: clean, country: (country || "us").slice(0, 2).toLowerCase() },
  });
}

/** Notificación in-app para contribuidores/streamers. */
export async function notify(alias: string, title: string, body = "", icon = "🔔") {
  if (!alias) return;
  try {
    await db.contribNotification.create({
      data: { alias: alias.slice(0, 24).trim(), title: title.slice(0, 120), body: body.slice(0, 300), icon },
    });
  } catch {
    // las notificaciones nunca deben tumbar una acción principal
  }
}

/** Otorga recompensa al aprobar una contribución (perfil + notificación). */
export async function rewardApproval(type: string, author: string, country?: string, extraCoins = 0) {
  const base = CONTRIB_REWARDS[type]?.coins ?? 10;
  const coins = base + extraCoins;
  const profile = await upsertProfile(author, country);
  await db.contributorProfile.update({
    where: { alias: profile.alias },
    data: { approved: { increment: 1 }, pending: { decrement: 1 }, coinsEarned: { increment: coins } },
  });
  await notify(
    author,
    `Tu ${CONTRIB_REWARDS[type]?.label.toLowerCase() ?? "contribución"} fue ${CONTRIB_REWARDS[type]?.past ?? "aprobada"} 🎉 +${coins} monedas`,
    "Ya está visible para toda la comunidad de VANGUARD.",
    contribIcon(type)
  );
  return coins;
}

function contribIcon(type: string) {
  return CONTRIB_REWARDS[type]?.icon ?? "✅";
}

/** Castigo por reporte falso confirmado. */
export async function punishFakeReport(author: string) {
  const profile = await upsertProfile(author);
  await db.contributorProfile.update({
    where: { alias: profile.alias },
    data: { rejected: { increment: 1 }, pending: { decrement: 1 }, coinsEarned: { decrement: 20 } },
  });
  await notify(author, "Tu reporte fue marcado como FALSO ❌ −20 monedas", "Los reportes verificados por la comunidad deben ser reales.", "❌");
}

/** Suma aciertos de verificación y evalúa badge elite (90%+ con 10+ votos).
 *  Nota: el pago de monedas del acierto lo hace la ruta de verificación;
 *  aquí solo se llevan las estadísticas y el badge elite. */
export async function recordVerifyResult(voter: string, hit: boolean) {
  const profile = await upsertProfile(voter);
  const data = {
    verifTotal: { increment: 1 },
    ...(hit ? { verifHits: { increment: 1 } } : {}),
  };
  await db.contributorProfile.update({ where: { alias: profile.alias }, data });
  if (hit) {
    const fresh = await db.contributorProfile.findUnique({ where: { alias: profile.alias } });
    if (fresh && fresh.verifTotal >= 10 && fresh.verifHits / fresh.verifTotal >= 0.9 && !fresh.badges?.includes("elite")) {
      await db.contributorProfile.update({
        where: { alias: fresh.alias },
        data: { coinsEarned: { increment: 500 }, badges: ((fresh.badges ?? "") + "elite,").slice(0, 200) },
      });
      await notify(voter, "Badge FACT-CHECKER ELITE desbloqueado 🏅 +500 monedas", "90%+ de aciertos verificando noticias. Tu voto ahora vale x2.", "🏅");
    }
  }
}
