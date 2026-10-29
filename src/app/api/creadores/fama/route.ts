import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v104.0 LA VITRINA — PASEO DE LA FAMA DE CREADORES.
// La obra de la comunidad necesita su vitrina y su fama: aquí se computa el
// ranking de creadores a partir de acciones REALES de la comunidad:
//   · obras publicadas y aprobadas
//   · me gusta recibidos (voto honesto, 1 por votante)
//   · jugadas de sus juegos (el arcade cuenta cada partida)
// FAMA = me_gusta×3 + jugadas×2 + obras×5 — fórmula explicable, sin magia.
// Sin cuentas: solo lo que la gente ya hizo con las obras de cada autor.
// GET ?limit=12 → [{ author, authorBall, obras, likes, plays, fama }]

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "12", 10) || 12, 24);

    const grupos = await db.ugcItem.groupBy({
      by: ["author"],
      where: { status: "APROBADO" },
      _count: { author: true },
      _sum: { likes: true, plays: true },
      orderBy: [{ _count: { author: "desc" } }],
      take: 120, // base amplia: la fama decide el orden final, no el volumen
    });

    const lista = grupos
      .map((g) => {
        const obras = g._count.author;
        const likes = g._sum.likes ?? 0;
        const plays = g._sum.plays ?? 0;
        const fama = likes * 3 + plays * 2 + obras * 5;
        return { author: g.author, authorBall: "un", obras, likes, plays, fama };
      })
      .sort((a, b) => b.fama - a.fama)
      .slice(0, limit);

    return NextResponse.json({ creadores: lista });
  } catch (e) {
    console.error("fama GET error", e);
    return NextResponse.json({ creadores: [] }, { status: 200 });
  }
}
