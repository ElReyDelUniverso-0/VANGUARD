import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/live/schedule — programación de streams (próximos primero)
export async function GET() {
  const items = await db.streamSchedule.findMany({ orderBy: { scheduledAt: "asc" }, take: 30 });
  return NextResponse.json({ items });
}

// POST /api/live/schedule — programar un stream futuro
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.host || !body?.scheduledAt) {
    return NextResponse.json({ error: "Faltan título, host o fecha" }, { status: 400 });
  }
  const when = new Date(body.scheduledAt);
  if (isNaN(when.getTime())) return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  const item = await db.streamSchedule.create({
    data: {
      title: String(body.title).slice(0, 140),
      host: String(body.host).slice(0, 24),
      category: String(body.category || "analisis").slice(0, 24),
      description: String(body.description || "").slice(0, 300),
      scheduledAt: when,
    },
  });
  return NextResponse.json({ item });
}
