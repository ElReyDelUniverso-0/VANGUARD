import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/live/streams/[id]/chat?since=<iso|id-offset> — mensajes nuevos (polling)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const take = Math.min(80, parseInt(searchParams.get("take") ?? "50", 10) || 50);
  const messages = await db.liveChatMessage.findMany({
    where: { streamId: id },
    orderBy: { createdAt: "desc" },
    take,
  });
  return NextResponse.json({ messages: messages.reverse() });
}

// POST /api/live/streams/[id]/chat — chat | reacción | mensaje de sistema
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.content) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  const msg = await db.liveChatMessage.create({
    data: {
      streamId: id,
      author: String(body.author || "Anónimo").slice(0, 24),
      country: String(body.country || "us").slice(0, 2).toLowerCase(),
      content: String(body.content).slice(0, 300),
      kind: String(body.kind || "chat").slice(0, 12),
      amount: Math.max(0, parseInt(String(body.amount ?? 0), 10) || 0),
    },
  });
  return NextResponse.json({ message: msg });
}
