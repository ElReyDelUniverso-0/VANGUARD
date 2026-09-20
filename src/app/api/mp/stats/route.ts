import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v17 MULTIJUGADOR TERMINADO — ranking ELO global persistido en SQLite.
// GET               -> top 25 del board mundial (por ELO)
// GET ?alias=X      -> perfil de un jugador (crea fila inicial si no existe)
// POST { username, kind, streak? } -> registra resultado y ajusta ELO:
//   MP_WIN +30 · MP_LOSS -16 · DUEL_WIN +22 · DUEL_LOSS -14 · DUEL_TIE +5
//   CAPTURE (sin elo, +1 captura) · DETECTIVE_WIN +12

export const dynamic = "force-dynamic";

const ELO_MIN = 100;

type Kind = "MP_WIN" | "MP_LOSS" | "DUEL_WIN" | "DUEL_LOSS" | "DUEL_TIE" | "CAPTURE" | "DETECTIVE_WIN";

const ELO_DELTAS: Record<Kind, number> = {
  MP_WIN: 30,
  MP_LOSS: -16,
  DUEL_WIN: 22,
  DUEL_LOSS: -14,
  DUEL_TIE: 5,
  CAPTURE: 0,
  DETECTIVE_WIN: 12,
};

function isKind(v: unknown): v is Kind {
  return typeof v === "string" && v in ELO_DELTAS;
}

async function getOrCreate(username: string) {
  const clean = username.trim().slice(0, 18).toUpperCase() || "OPERADOR";
  const profile = await db.mpProfile.upsert({
    where: { username: clean },
    update: {},
    create: { username: clean },
  });
  return { clean, profile };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const alias = searchParams.get("alias");

    if (alias) {
      const { profile } = await getOrCreate(alias);
      return NextResponse.json({ profile });
    }

    const board = await db.mpProfile.findMany({
      orderBy: [{ elo: "desc" }, { wins: "desc" }],
      take: 25,
    });
    return NextResponse.json({ board });
  } catch (err) {
    console.error("[api/mp/stats] GET error:", err);
    return NextResponse.json({ error: "No se pudo leer el ranking" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const username = String(body?.username ?? "").trim();
    const kind = body?.kind;

    if (!username) {
      return NextResponse.json({ error: "username requerido" }, { status: 400 });
    }
    if (!isKind(kind)) {
      return NextResponse.json({ error: "kind invalido" }, { status: 400 });
    }

    const { clean } = await getOrCreate(username);

    const data: Record<string, unknown> = {};
    switch (kind) {
      case "MP_WIN":
        data.wins = { increment: 1 };
        data.mpGames = { increment: 1 };
        break;
      case "MP_LOSS":
        data.losses = { increment: 1 };
        data.mpGames = { increment: 1 };
        break;
      case "DUEL_WIN":
        data.duelsWon = { increment: 1 };
        data.duelsPlayed = { increment: 1 };
        break;
      case "DUEL_LOSS":
        data.duelsLost = { increment: 1 };
        data.duelsPlayed = { increment: 1 };
        break;
      case "DUEL_TIE":
        data.draws = { increment: 1 };
        data.duelsPlayed = { increment: 1 };
        break;
      case "CAPTURE":
        data.captures = { increment: 1 };
        break;
      case "DETECTIVE_WIN":
        data.detectiveSolved = { increment: 1 };
        break;
    }

    const eloDelta = ELO_DELTAS[kind];
    if (eloDelta !== 0) data.elo = { increment: eloDelta };

    // racha personal de duelos (opcional, solo informativa para el perfil)
    const streak = Number(body?.streak ?? 0);
    if (kind === "DUEL_WIN" && Number.isFinite(streak) && streak > 0) {
      data.bestDuelStreak = { set: Math.max(0, Math.floor(streak)) };
    }

    const profile = await db.mpProfile.update({
      where: { username: clean },
      data,
    });

    // suelo de ELO (no bajas de 100)
    if (eloDelta < 0 && profile.elo < ELO_MIN) {
      const fixed = await db.mpProfile.update({
        where: { username: clean },
        data: { elo: ELO_MIN },
      });
      return NextResponse.json({ profile: fixed });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[api/mp/stats] POST error:", err);
    return NextResponse.json({ error: "No se pudo registrar el resultado" }, { status: 500 });
  }
}
