import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moderateUgc } from "@/lib/ai-moderate";
import { verifySessionToken, SESSION_COOKIE, firmaBorrado } from "@/lib/auth-server";
import { muro, claveCliente } from "@/lib/fortaleza";

// v26 — Interacciones con el contenido de la comunidad.
// PATCH { action, voter, value?, label?, optionIdx? }
//   like     → toggle (1 like por votante)
//   rate     → 1-5 estrellas (1 voto por votante, media recalculada)
//   classify → chip de clasificación libre (género/tipo) 1 por votante
//   play     → +1 reproducción (juegos y música)
//   votePoll → votar opción de encuesta (1 voto por votante)
//   report   → reportar: vuelve a PENDIENTE y el agente lo re-analiza al leerlo
// DELETE ?tk= → el autor elimina su envío con su permiso HMAC (v204)

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    // MURO v204 — 40 interacciones (likes/ratings/votos) por IP y minuto:
    // antes el voter era autodeclarado y un guion podía inflar todo sin freno
    const veredictoMuro = muro(`ugc-act:${claveCliente(req)}`, 40, 60_000);
    if (!veredictoMuro.permitido) {
      return NextResponse.json({ error: `Demasiadas interacciones — espera ${Math.ceil(veredictoMuro.espera / 60)} min.` }, { status: 429 });
    }
    const { id } = await ctx.params;
    const body = await req.json();
    const action = String(body.action || "");
    const voter = String(body.voter || "").slice(0, 24) || "ANÓNIMO";

    const item = await db.ugcItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Contenido no encontrado" }, { status: 404 });

    switch (action) {
      case "like": {
        const existing = await db.ugcVote.findUnique({
          where: { itemId_voter_kind: { itemId: id, voter, kind: "like" } },
        });
        if (existing) {
          await db.ugcVote.delete({ where: { id: existing.id } });
          const updated = await db.ugcItem.update({ where: { id }, data: { likes: { decrement: 1 } } });
          return NextResponse.json({ liked: false, likes: updated.likes });
        }
        await db.ugcVote.create({ data: { itemId: id, voter, kind: "like" } });
        const updated = await db.ugcItem.update({ where: { id }, data: { likes: { increment: 1 } } });
        return NextResponse.json({ liked: true, likes: updated.likes });
      }

      case "rate": {
        const value = Math.max(1, Math.min(5, parseInt(body.value, 10) || 0));
        if (!value) return NextResponse.json({ error: "Rating 1-5" }, { status: 400 });
        const existing = await db.ugcVote.findUnique({
          where: { itemId_voter_kind: { itemId: id, voter, kind: "rating" } },
        });
        if (existing) return NextResponse.json({ error: "Ya calificaste este contenido", ratingCount: item.ratingCount, ratingSum: item.ratingSum }, { status: 409 });
        await db.ugcVote.create({ data: { itemId: id, voter, kind: "rating", value } });
        const updated = await db.ugcItem.update({
          where: { id },
          data: { ratingSum: { increment: value }, ratingCount: { increment: 1 } },
        });
        return NextResponse.json({
          ratingCount: updated.ratingCount,
          ratingSum: updated.ratingSum,
          avg: updated.ratingCount ? +(updated.ratingSum / updated.ratingCount).toFixed(1) : 0,
        });
      }

      case "classify": {
        const label = String(body.label || "").slice(0, 40);
        if (!label) return NextResponse.json({ error: "Falta la etiqueta" }, { status: 400 });
        const existing = await db.ugcVote.findUnique({
          where: { itemId_voter_kind: { itemId: id, voter, kind: "genre" } },
        });
        if (existing) {
          await db.ugcVote.update({ where: { id: existing.id }, data: { label } });
        } else {
          await db.ugcVote.create({ data: { itemId: id, voter, kind: "genre", label } });
        }
        const genres = await db.ugcVote.groupBy({
          by: ["label"],
          where: { itemId: id, kind: "genre" },
          _count: { label: true },
        });
        return NextResponse.json({
          genres: genres.map((g) => ({ label: g.label, count: g._count.label })).sort((a, b) => b.count - a.count),
        });
      }

      case "play": {
        const updated = await db.ugcItem.update({ where: { id }, data: { plays: { increment: 1 } } });
        return NextResponse.json({ plays: updated.plays });
      }

      case "votePoll": {
        const opts: { label: string; votes: number }[] = JSON.parse(item.pollOptions || "[]");
        const idx = parseInt(body.optionIdx, 10);
        if (!(idx >= 0 && idx < opts.length)) return NextResponse.json({ error: "Opción inválida" }, { status: 400 });
        const existing = await db.ugcVote.findUnique({
          where: { itemId_voter_kind: { itemId: id, voter, kind: "poll" } },
        });
        if (existing) return NextResponse.json({ error: "Ya votaste en esta encuesta", pollOptions: opts }, { status: 409 });
        await db.ugcVote.create({ data: { itemId: id, voter, kind: "poll", value: idx } });
        opts[idx].votes += 1;
        await db.ugcItem.update({ where: { id }, data: { pollOptions: JSON.stringify(opts) } });
        return NextResponse.json({ pollOptions: opts, voted: idx });
      }

      case "genres": {
        const genres = await db.ugcVote.groupBy({
          by: ["label"],
          where: { itemId: id, kind: "genre" },
          _count: { label: true },
        });
        return NextResponse.json({
          genres: genres.map((g) => ({ label: g.label, count: g._count.label })).sort((a, b) => b.count - a.count),
        });
      }

      case "report": {
        const reason = String(body.reason || "").slice(0, 200) || "Reportado por la comunidad";
        // re-análisis inmediato del agente sobre lo reportado
        const mod = await moderateUgc({ kind: item.kind, title: item.title, summary: item.summary, body: item.body });
        const status = mod.verdict === "INAPROPIADO" ? "ELIMINADO" : "PENDIENTE";
        const updated = await db.ugcItem.update({
          where: { id },
          data: { status, aiVerdict: mod.verdict, aiReason: `${reason} → ${mod.reason}`, aiModerated: mod.ai },
        });
        if (status === "ELIMINADO") {
          await db.ugcItem.delete({ where: { id } });
          return NextResponse.json({ eliminated: true, reason: mod.reason });
        }
        return NextResponse.json({ status: updated.status, reason: updated.aiReason });
      }

      default:
        return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }
  } catch (e) {
    console.error("ugc PATCH error", e);
    return NextResponse.json({ error: "No se pudo procesar la acción" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    // MURO v204 — 10 intentos de borrado por IP y minuto
    const veredictoMuro = muro(`ugc-del:${claveCliente(req)}`, 10, 60_000);
    if (!veredictoMuro.permitido) {
      return NextResponse.json({ error: "Demasiados intentos — espera un momento" }, { status: 429 });
    }
    const { id } = await ctx.params;
    const url = new URL(req.url);
    const item = await db.ugcItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Contenido no encontrado" }, { status: 404 });
    // v204 EL ESCUDO — fin del IDOR: antes bastaba pasar ?author= con el nombre
    // público del autor para borrarle el contenido a otro. Ahora vale:
    //   ① el permiso tk (HMAC que el servidor entregó al autor al publicar), o
    //   ② la sesión firmada del propio autor, o
    //   ③ la sesión del DUEÑO.
    const tk = url.searchParams.get("tk") || "";
    let ses: string | null = null;
    try {
      ses = verifySessionToken((req as any).cookies?.get?.(SESSION_COOKIE)?.value ?? null);
    } catch { ses = null; }
    const permitidoPorToken = tk.length === 32 && tk === firmaBorrado(item.id);
    const permitidoPorSesion = !!ses && (ses === item.author || ses === "DUENO");
    if (!permitidoPorToken && !permitidoPorSesion) {
      return NextResponse.json({ error: "Solo el autor puede eliminar su envío" }, { status: 403 });
    }
    await db.ugcItem.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error("ugc DELETE error", e);
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}
