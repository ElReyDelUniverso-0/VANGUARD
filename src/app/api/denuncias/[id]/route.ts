import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/denuncias/[id] — votar o cambiar estado (moderación)
// { action: "vote" | "status", voter?, status? }
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const action = String(body.action ?? "");

    const denuncia = await db.denuncia.findUnique({ where: { id } });
    if (!denuncia) return NextResponse.json({ error: "Denuncia no encontrada" }, { status: 404 });

    if (action === "vote") {
      const voter = String(body.voter ?? "").trim();
      if (!voter) return NextResponse.json({ error: "Voter requerido" }, { status: 400 });
      if (voter === denuncia.author) {
        return NextResponse.json({ error: "No puedes apoyar tu propia denuncia" }, { status: 400 });
      }
      const prior = await db.denunciaVote.findUnique({
        where: { denunciaId_voter: { denunciaId: id, voter } },
      });
      if (prior) {
        return NextResponse.json({ error: "Ya apoyaste esta denuncia" }, { status: 409 });
      }
      const [, updated] = await db.$transaction([
        db.denunciaVote.create({ data: { denunciaId: id, voter } }),
        db.denuncia.update({ where: { id }, data: { upvotes: { increment: 1 } } }),
      ]);
      return NextResponse.json({ ok: true, upvotes: updated.upvotes });
    }

    if (action === "status") {
      const status = String(body.status ?? "");
      if (!["RECIBIDA", "INVESTIGACION", "VERIFICADA", "DESCARTADA"].includes(status)) {
        return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
      }
      const updated = await db.denuncia.update({ where: { id }, data: { status } });
      return NextResponse.json({ ok: true, status: updated.status });
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error al actualizar denuncia" }, { status: 500 });
  }
}
