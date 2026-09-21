import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moderateUgc } from "@/lib/ai-moderate";

// v25 — Galería de memes geopolíticos.
// GET  ?sort=recent|top  → lista + stats + meme del día
// POST → publicar (anti-spam: 8/día y 60s entre envíos por autor)
// v31  → AGENTE MODERADOR IA integrado: los memes son texto libre del usuario,
//        así que ahora pasan por el mismo filtro que el resto de la comunidad.

export const dynamic = "force-dynamic";

const MAX_PER_DAY = 8;
const GAP_MS = 60_000;
const MAX_COMPOSITION = 12_000;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sort = url.searchParams.get("sort") === "top" ? "top" : "recent";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "48", 10) || 48, 96);

    const [memes, total, today, likesAgg] = await Promise.all([
      db.meme.findMany({
        where: { status: "APROBADO" },
        orderBy: sort === "top" ? [{ likes: "desc" }, { createdAt: "desc" }] : { createdAt: "desc" },
        take: limit,
      }),
      db.meme.count({ where: { status: "APROBADO" } }),
      db.meme.count({
        where: { status: "APROBADO", createdAt: { gte: new Date(Date.now() - 24 * 3600_000) } },
      }),
      db.memeLike.count(),
    ]);

    // Meme del día: el más gustado de las últimas 24h; si no hay, el más gustado global.
    let memeOfDay = await db.meme.findFirst({
      where: { status: "APROBADO", createdAt: { gte: new Date(Date.now() - 24 * 3600_000) }, likes: { gt: 0 } },
      orderBy: { likes: "desc" },
    });
    if (!memeOfDay) {
      memeOfDay = await db.meme.findFirst({ where: { status: "APROBADO", likes: { gt: 0 } }, orderBy: [{ likes: "desc" }, { createdAt: "desc" }] });
    }
    if (!memeOfDay) memeOfDay = memes[0] ?? null;

    return NextResponse.json({ memes, stats: { total, today, likes: likesAgg }, memeOfDay });
  } catch (e) {
    console.error("memes GET error", e);
    return NextResponse.json({ memes: [], stats: { total: 0, today: 0, likes: 0 }, memeOfDay: null }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const author = String(body.author || "ANÓNIMO").slice(0, 24);
    const template = String(body.template || "libre").slice(0, 24);
    const caption = String(body.caption || "").slice(0, 140);
    const composition = typeof body.composition === "string" ? body.composition : JSON.stringify(body.composition ?? {});

    if (!body.composition) return NextResponse.json({ error: "Falta la composición del meme" }, { status: 400 });
    if (composition.length > MAX_COMPOSITION) return NextResponse.json({ error: "La composición es demasiado grande (demasiadas capas)" }, { status: 400 });

    const [last, dayCount] = await Promise.all([
      db.meme.findFirst({ where: { author }, orderBy: { createdAt: "desc" } }),
      db.meme.count({ where: { author, createdAt: { gte: new Date(Date.now() - 24 * 3600_000) } } }),
    ]);
    if (last && Date.now() - last.createdAt.getTime() < GAP_MS)
      return NextResponse.json({ error: "Frena un minuto — espera 60s entre memes" }, { status: 429 });
    if (dayCount >= MAX_PER_DAY)
      return NextResponse.json({ error: "Límite de 8 memes por día alcanzado — mañana más" }, { status: 429 });

    // v31 — AGENTE MODERADOR IA: analiza el texto libre del meme (caption + capas)
    let textLayers = "";
    try {
      const parsed = JSON.parse(composition) as { layers?: { kind?: string; text?: string }[] };
      textLayers = (parsed.layers || [])
        .map((l) => (l?.kind === "text" || l?.kind === "emoji" ? String(l.text || "") : ""))
        .filter(Boolean)
        .join(" \n ");
    } catch {
      /* composición no parseable — se modera igual con caption/template */
    }
    const moderation = await moderateUgc({
      kind: "meme",
      title: template,
      summary: caption,
      body: textLayers,
    });

    if (moderation.verdict === "INAPROPIADO") {
      // eliminado antes de nacer — igual que el resto de contenido de la comunidad
      return NextResponse.json(
        { deleted: true, verdict: moderation.verdict, reason: moderation.reason, ai: moderation.ai },
        { status: 202 },
      );
    }

    const meme = await db.meme.create({
      data: {
        author,
        template,
        caption,
        composition,
        status: moderation.verdict === "SOSPECHOSO" ? "PENDIENTE" : "APROBADO",
        aiVerdict: moderation.verdict,
        aiReason: moderation.reason.slice(0, 180),
      },
    });

    if (moderation.verdict === "SOSPECHOSO") {
      // pasa a revisión: no aparece en la galería hasta revisarse (sin recompensa)
      return NextResponse.json(
        { pending: true, verdict: moderation.verdict, reason: moderation.reason, ai: moderation.ai },
        { status: 202 },
      );
    }

    return NextResponse.json({ meme, reward: 25 }, { status: 201 });
  } catch (e) {
    console.error("memes POST error", e);
    return NextResponse.json({ error: "No se pudo publicar el meme" }, { status: 500 });
  }
}
