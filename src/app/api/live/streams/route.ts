import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/live/streams — lista de streams de la comunidad
// ?status=live|ended&sort=viewers|recent|category&cat=&country=&mine=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "live";
  const sort = searchParams.get("sort") ?? "viewers";
  const cat = searchParams.get("cat") ?? "";
  const country = searchParams.get("country") ?? "";
  const mine = searchParams.get("mine") ?? "";

  const where: Record<string, unknown> = { status };
  if (cat) where.category = cat;
  if (country) where.country = country.toLowerCase();
  if (mine) where.streamerName = mine;

  const orderBy = sort === "recent" ? { startedAt: "desc" as const } : { viewers: "desc" as const };

  const streams = await db.liveStream.findMany({
    where,
    orderBy,
    take: 40,
    include: { _count: { select: { chat: true, donations: true } } },
  });

  const sorted =
    sort === "category"
      ? [...streams].sort((a, b) => (a.category > b.category ? 1 : -1))
      : sort === "country"
        ? [...streams].sort((a, b) => (a.country > b.country ? 1 : -1))
        : streams;
  return NextResponse.json({ streams: sorted });
}

// POST /api/live/streams — iniciar transmisión en vivo
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.streamerName) {
    return NextResponse.json({ error: "Faltan título o streamer" }, { status: 400 });
  }
  const stream = await db.liveStream.create({
    data: {
      title: String(body.title).slice(0, 140),
      category: String(body.category || "analisis").slice(0, 24),
      streamerName: String(body.streamerName).slice(0, 24),
      country: String(body.country || "us").slice(0, 2).toLowerCase(),
      viewers: 1,
      peakViewers: 1,
      totalViews: 1,
    },
  });
  await db.liveChatMessage.create({
    data: { streamId: stream.id, author: "SISTEMA", country: "un", kind: "system", content: "🔴 La transmisión ha comenzado. ¡Bienvenidos!" },
  });
  return NextResponse.json({ stream });
}
