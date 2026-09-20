import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moderateUgc } from "@/lib/ai-moderate";

export const dynamic = "force-dynamic";

// v27 — COMENTARIOS DE LA COMUNIDAD: cualquiera comenta cualquier contenido
// UGC. El agente moderador revisa cada comentario (el inapropiado se elimina).
// GET  ?itemId= → comentarios aprobados
// POST { itemId, author, authorBall, text }
const BANNED = /(mátate|mata te|kys|idiota de mierda|pendejo|puta madre|nazi de mierda)/i;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const itemId = url.searchParams.get("itemId") || "";
    if (!itemId) return NextResponse.json({ comments: [] });
    const comments = await db.ugcComment.findMany({
      where: { itemId, status: "APROBADO" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const itemId = String(body.itemId || "");
    const author = String(body.author || "ANÓNIMO").slice(0, 24);
    const authorBall = String(body.authorBall || "us").slice(0, 2).toLowerCase();
    const text = String(body.text || "").trim().slice(0, 500);
    if (!itemId || !text) return NextResponse.json({ error: "Falta el comentario" }, { status: 400 });

    const item = await db.ugcItem.findUnique({ where: { id: itemId }, select: { id: true } });
    if (!item) return NextResponse.json({ error: "El contenido ya no existe" }, { status: 404 });

    // moderación: escudo heurístico local primero (barato), IA como respaldo
    let verdict = "LIMPIO";
    let reason = "";
    let ai = false;
    if (BANNED.test(text)) {
      verdict = "INAPROPIADO";
      reason = "Lenguaje prohibido en el comentario";
    } else if (text.length >= 40) {
      const mod = await moderateUgc({ kind: "comentario", title: text.slice(0, 60), summary: "", body: text });
      verdict = mod.verdict;
      reason = mod.reason;
      ai = mod.ai;
    }

    if (verdict === "INAPROPIADO") {
      return NextResponse.json(
        { eliminated: true, reason: reason || "Contenido inapropiado detectado por el agente", ai },
        { status: 202 }
      );
    }

    const comment = await db.ugcComment.create({
      data: {
        itemId,
        author,
        authorBall,
        text,
        status: verdict === "SOSPECHOSO" ? "ELIMINADO" : "APROBADO",
        aiVerdict: verdict,
        aiReason: reason,
      },
    });
    return NextResponse.json({ comment, ai }, { status: 201 });
  } catch (e) {
    console.error("ugc comment POST error", e);
    return NextResponse.json({ error: "No se pudo publicar el comentario" }, { status: 500 });
  }
}
