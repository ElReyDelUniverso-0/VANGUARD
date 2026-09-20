import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/live/replays — replays de streams pasados (?sort=views|recent)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") ?? "views";
  const items = await db.streamReplay.findMany({
    orderBy: sort === "recent" ? { recordedAt: "desc" } : { views: "desc" },
    take: 30,
  });
  return NextResponse.json({ items });
}

// PATCH /api/live/replays — incrementa vistas al abrir un replay
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  const item = await db.streamReplay.update({ where: { id: body.id }, data: { views: { increment: 1 } } });
  return NextResponse.json({ item });
}
