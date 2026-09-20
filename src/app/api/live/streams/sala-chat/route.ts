import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Chat lateral GLOBAL de la sala de medios oficiales.
// Usa un stream virtual con id fijo "sala-chat" (cumple la FK de LiveChatMessage).
async function ensureSala() {
  await db.liveStream.upsert({
    where: { id: "sala-chat" },
    update: {},
    create: {
      id: "sala-chat",
      title: "SALA GLOBAL EN VIVO — Medios Oficiales",
      category: "noticias",
      streamerName: "VANGUARD",
      country: "un",
      status: "live",
    },
  });
}

// GET /api/live/streams/sala-chat — últimos 60 mensajes de la sala global
export async function GET() {
  const messages = await db.liveChatMessage.findMany({
    where: { streamId: "sala-chat" },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return NextResponse.json({ messages: messages.reverse() });
}

// POST /api/live/streams/sala-chat — publicar en el chat de la sala
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.content) return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  await ensureSala();
  const msg = await db.liveChatMessage.create({
    data: {
      streamId: "sala-chat",
      author: String(body.author || "Anónimo").slice(0, 24),
      country: String(body.country || "us").slice(0, 2).toLowerCase(),
      content: String(body.content).slice(0, 300),
      kind: "chat",
    },
  });
  return NextResponse.json({ message: msg });
}
