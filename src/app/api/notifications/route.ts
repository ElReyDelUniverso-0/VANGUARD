import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/notifications?alias= — notificaciones del contribuidor/streamer
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const alias = (searchParams.get("alias") || "").slice(0, 24);
  if (!alias) return NextResponse.json({ items: [], unread: 0 });
  const items = await db.contribNotification.findMany({
    where: { alias },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  const unread = items.filter((i) => !i.read).length;
  return NextResponse.json({ items, unread });
}

// POST /api/notifications { alias, action: "read-all" | "read", id }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const alias = String(body?.alias || "").slice(0, 24);
  if (!alias) return NextResponse.json({ error: "Falta alias" }, { status: 400 });
  if (body?.action === "read-all") {
    await db.contribNotification.updateMany({ where: { alias, read: false }, data: { read: true } });
  } else if (body?.action === "read" && body?.id) {
    await db.contribNotification.update({ where: { id: String(body.id) }, data: { read: true } });
  }
  return NextResponse.json({ ok: true });
}
