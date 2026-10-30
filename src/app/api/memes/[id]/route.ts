import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { muro, claveCliente } from "@/lib/fortaleza";
import { sesionDuenoReq } from "@/lib/auth-server";

// v25 — Like/unlike de un meme (toggle por votante, 1 like por usuario).
// v204 EL ESCUDO: muro anti-flood — 40 likes por IP y minuto.

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    // v207.0 INFINITO: la sesión del DUEÑO cruza los muros
    const veredictoMuro = sesionDuenoReq(req)
      ? { permitido: true, espera: 0 }
      : muro(`meme-act:${claveCliente(req)}`, 40, 60_000);
    if (!veredictoMuro.permitido) {
      return NextResponse.json({ error: "Demasiados likes seguidos — respira un momento" }, { status: 429 });
    }
    const { id } = await ctx.params;
    const body = await req.json();
    const voter = String(body.voter || "ANÓNIMO").slice(0, 24);

    const meme = await db.meme.findUnique({ where: { id } });
    if (!meme) return NextResponse.json({ error: "Meme no encontrado" }, { status: 404 });

    const existing = await db.memeLike.findUnique({ where: { memeId_voter: { memeId: id, voter } } });
    if (existing) {
      await db.memeLike.delete({ where: { id: existing.id } });
      const likes = await db.meme.update({ where: { id }, data: { likes: { decrement: 1 } } });
      return NextResponse.json({ likes: likes.likes, liked: false });
    }
    await db.memeLike.create({ data: { memeId: id, voter } });
    const likes = await db.meme.update({ where: { id }, data: { likes: { increment: 1 } } });
    return NextResponse.json({ likes: likes.likes, liked: true });
  } catch (e) {
    console.error("meme PATCH error", e);
    return NextResponse.json({ error: "No se pudo procesar el like" }, { status: 500 });
  }
}
