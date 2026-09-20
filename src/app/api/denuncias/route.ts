import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/denuncias — lista de denuncias
// ?status=&category=&author=&take=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "";
  const category = searchParams.get("category") ?? "";
  const author = searchParams.get("author") ?? "";
  const take = Math.min(60, parseInt(searchParams.get("take") ?? "40", 10) || 40);

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (author) where.author = author;

  const items = await db.denuncia.findMany({
    where,
    orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
    take,
    include: { votes: { select: { voter: true } } },
  });

  const stats = {
    total: await db.denuncia.count(),
    verificadas: await db.denuncia.count({ where: { status: "VERIFICADA" } }),
    investigacion: await db.denuncia.count({ where: { status: "INVESTIGACION" } }),
    recibidas: await db.denuncia.count({ where: { status: "RECIBIDA" } }),
  };

  return NextResponse.json({ items, stats });
}

// POST /api/denuncias — crear denuncia
// { author, country, category, title, detail, evidenceUrl?, location? }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const author = String(body.author ?? "").trim();
    const country = String(body.country ?? "us").slice(0, 2).toLowerCase();
    const category = String(body.category ?? "OTRO").slice(0, 30);
    const title = String(body.title ?? "").trim().slice(0, 140);
    const detail = String(body.detail ?? "").trim().slice(0, 3000);
    const evidenceUrl = String(body.evidenceUrl ?? "").trim().slice(0, 400);
    const location = String(body.location ?? "").trim().slice(0, 120);

    if (!author || title.length < 8 || detail.length < 20) {
      return NextResponse.json({ error: "Título (8+) y detalle (20+) obligatorios" }, { status: 400 });
    }

    // anti-spam: máx 5 denuncias por autor por día
    const dayAgo = new Date(Date.now() - 24 * 3600 * 1000);
    const today = await db.denuncia.count({ where: { author, createdAt: { gte: dayAgo } } });
    if (today >= 5) {
      return NextResponse.json({ error: "Límite anti-spam: 5 denuncias por día" }, { status: 429 });
    }
    const last = await db.denuncia.findFirst({ where: { author }, orderBy: { createdAt: "desc" } });
    if (last && Date.now() - last.createdAt.getTime() < 3 * 60 * 1000) {
      return NextResponse.json({ error: "Espera 3 minutos entre denuncias" }, { status: 429 });
    }

    const created = await db.denuncia.create({
      data: { author, country, category, title, detail, evidenceUrl, location },
    });
    return NextResponse.json({ ok: true, denuncia: created });
  } catch {
    return NextResponse.json({ error: "Error al registrar denuncia" }, { status: 500 });
  }
}
