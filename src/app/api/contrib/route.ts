import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ANTI_SPAM, looksDuplicate, communityVerdict, CONTRIB_REWARDS } from "@/lib/rewards";
import { upsertProfile, notify, rewardApproval, punishFakeReport } from "@/lib/contrib-server";

// GET /api/contrib — lista de contribuciones
// ?type=&status=&author=&sort=recent|likes&take=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "";
  const status = searchParams.get("status") ?? "";
  const author = searchParams.get("author") ?? "";
  const sort = searchParams.get("sort") ?? "recent";
  const take = Math.min(60, parseInt(searchParams.get("take") ?? "30", 10) || 30);

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (author) where.author = author;

  const items = await db.contribution.findMany({
    where,
    orderBy: sort === "likes" ? [{ likes: "desc" }, { createdAt: "desc" }] : { createdAt: "desc" },
    take,
    include: { votes: true },
  });
  return NextResponse.json({ items });
}

// POST /api/contrib — crear contribución (con ANTI-SPAM completo)
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const type = String(body?.type || "").slice(0, 16);
  const author = String(body?.author || "").slice(0, 24);
  const title = String(body?.title || "").trim().slice(0, 160);
  if (!type || !author || !title || !CONTRIB_REWARDS[type]) {
    return NextResponse.json({ error: "Datos de contribución incompletos" }, { status: 400 });
  }

  const profile = await upsertProfile(author, body?.country);
  const now = Date.now();

  // ===== ANTI-SPAM =====
  // 1) tiempo mínimo entre envíos: 5 minutos
  if (profile.lastSubmitAt && now - new Date(profile.lastSubmitAt).getTime() < ANTI_SPAM.minGapMs) {
    const wait = Math.ceil((ANTI_SPAM.minGapMs - (now - new Date(profile.lastSubmitAt).getTime())) / 60000);
    return NextResponse.json({ error: `Anti-spam: espera ${wait} min entre envíos` }, { status: 429 });
  }
  // 2) máximo diario por tipo
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const todayCount = await db.contribution.count({ where: { author, type, createdAt: { gte: startOfDay } } });
  const cap = type === "ficha" ? ANTI_SPAM.maxFichasDay : type === "reporte" ? ANTI_SPAM.maxReportesDay : ANTI_SPAM.maxOtrosDay;
  if (todayCount >= cap) {
    await notify(author, "Límite diario alcanzado ⛔", `Máximo ${cap} ${type}s por día. Vuelve mañana.`, "⛔");
    return NextResponse.json({ error: `Anti-spam: máximo ${cap} ${type}s por día` }, { status: 429 });
  }
  // 3) detección de contenido copiado/duplicado (IA simple por similitud)
  const recent = await db.contribution.findMany({ where: { type, createdAt: { gte: new Date(now - 7 * 86400_000) } }, select: { title: true, content: true, author: true } });
  const dup = recent.find((r) => looksDuplicate(r.title + " " + r.content.slice(0, 200), title + " " + String(body?.content || "").slice(0, 200)));
  if (dup) {
    await notify(author, "Posible contenido duplicado 🚨", "Tu envío se parece mucho a uno existente. Si es spam, habrá ban automático.", "🚨");
    return NextResponse.json({ error: "Anti-spam: contenido duplicado detectado" }, { status: 429 });
  }

  // ===== CREAR =====
  const item = await db.contribution.create({
    data: {
      type,
      title,
      content: String(body?.content || "").slice(0, 6000),
      author,
      country: String(body?.country || "us").slice(0, 2).toLowerCase(),
      eventType: String(body?.eventType || "").slice(0, 20),
      location: String(body?.location || "").slice(0, 80),
      sourceUrl: String(body?.sourceUrl || "").slice(0, 300),
      countries: String(body?.countries || "").slice(0, 120),
      startDate: String(body?.startDate || "").slice(0, 20),
      cause: String(body?.cause || "").slice(0, 200),
      originalText: String(body?.originalText || "").slice(0, 4000),
      targetLang: String(body?.targetLang || "es").slice(0, 8),
      options: body?.options ? JSON.stringify(body.options).slice(0, 800) : "",
      resolveDate: String(body?.resolveDate || "").slice(0, 20),
      analysisType: String(body?.analysisType || "").slice(0, 30),
    },
  });

  const pendingCount = await db.contribution.count({ where: { author, status: "pendiente" } });
  await db.contributorProfile.update({ where: { alias: author }, data: { pending: pendingCount, lastSubmitAt: new Date() } });
  await notify(
    author,
    `Recibido: ${CONTRIB_REWARDS[type].label} 📥`,
    type === "reporte" ? "Tu reporte va a verificación comunitaria (5 usuarios). Si es real: +50 monedas." : "Tu contribución está en revisión. Te avisaremos cuando sea aprobada.",
    CONcontribIcon(type)
  );

  return NextResponse.json({ item, note: type === "reporte" ? "En verificación comunitaria" : "En revisión" });
}

function CONcontribIcon(type: string) {
  return CONTRIB_REWARDS[type]?.icon ?? "📥";
}
