// Vanguard v102.0 LA CIUDADELA — API del ARCADE COMUNITARIO (juegos del Taller).
// GET  ?sort=recent|plays|top&limit= → juegos kind="juego" aprobados
// POST {id, aciertos, total, jugador} → registra una partida:
//        +1 play para el juego, guarda la puntuación del día y devuelve la fama.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sanitizarLinea } from "@/lib/fortaleza";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sort = url.searchParams.get("sort") || "recent";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "40", 10) || 40, 80);

    let orderBy;
    if (sort === "plays") orderBy = [{ plays: "desc" as const }, { createdAt: "desc" as const }];
    else if (sort === "top") orderBy = [{ likes: "desc" as const }, { createdAt: "desc" as const }];
    else orderBy = { createdAt: "desc" as const };

    const [items, total] = await Promise.all([
      db.ugcItem.findMany({
        where: { kind: "juego", status: "APROBADO" },
        orderBy,
        take: limit,
        select: {
          id: true, title: true, summary: true, author: true, authorBall: true,
          specs: true, gameHtml: true, gameUrl: true, plays: true, likes: true,
          ratingSum: true, ratingCount: true, createdAt: true,
        },
      }),
      db.ugcItem.count({ where: { kind: "juego", status: "APROBADO" } }),
    ]);

    return NextResponse.json({ items, total });
  } catch (e) {
    console.error("juegos GET error", e);
    return NextResponse.json({ items: [], total: 0 }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const id = sanitizarLinea(body.id ?? "", 40);
    const aciertos = Math.max(0, Math.min(999, Number(body.aciertos) || 0));
    const total = Math.max(1, Math.min(999, Number(body.total) || 1));
    const jugador = sanitizarLinea(body.jugador ?? "ANÓNIMO", 24) || "ANÓNIMO";
    if (!id) return NextResponse.json({ error: "Falta el juego" }, { status: 400 });

    const item = await db.ugcItem.findUnique({ where: { id } });
    if (!item || item.kind !== "juego") {
      return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 });
    }

    // 1 partida registrada por jugador y día (la única única de la Ciudadela)
    const hoy = new Date().toISOString().slice(0, 10);
    const voter = `${jugador}·${hoy}`.slice(0, 60);
    const ya = await db.ugcVote.findUnique({
      where: { itemId_voter_kind: { itemId: id, voter, kind: "partida" } },
    });
    if (!ya) {
      await db.ugcVote.create({ data: { itemId: id, voter, kind: "partida", value: aciertos } });
    }

    const updated = await db.ugcItem.update({ where: { id }, data: { plays: { increment: 1 } } });

    return NextResponse.json({
      ok: true,
      plays: updated.plays,
      primeraDelDia: !ya,
      fama: updated.plays,
    });
  } catch (e) {
    console.error("juegos POST error", e);
    return NextResponse.json({ error: "La partida no pudo registrarse" }, { status: 500 });
  }
}
