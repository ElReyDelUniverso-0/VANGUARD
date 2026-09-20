import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { electionCycle } from "@/lib/dark-data";

// POST /api/ambassadors/vote — votar a un candidato (1 voto por país por ciclo)
// { candidateId, voter }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const candidateId = String(body.candidateId ?? "");
    const voter = String(body.voter ?? "").trim();
    if (!candidateId || !voter) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const candidate = await db.ambassadorCandidate.findUnique({ where: { id: candidateId } });
    if (!candidate) {
      return NextResponse.json({ error: "Candidato no encontrado" }, { status: 404 });
    }
    if (candidate.alias === voter) {
      return NextResponse.json({ error: "No puedes votarte a ti mismo" }, { status: 400 });
    }

    // 1 voto por país por ciclo
    const prior = await db.ambassadorVote.findFirst({
      where: { voter, country: candidate.country, cycle: candidate.cycle },
    });
    if (prior) {
      return NextResponse.json({ error: `Ya votaste por otro candidato de ${candidate.country.toUpperCase()} este ciclo` }, { status: 409 });
    }

    const [vote, updated] = await db.$transaction([
      db.ambassadorVote.create({
        data: { candidateId, voter, country: candidate.country, cycle: candidate.cycle },
      }),
      db.ambassadorCandidate.update({ where: { id: candidateId }, data: { votes: { increment: 1 } } }),
    ]);

    return NextResponse.json({ ok: true, votes: updated.votes, voteId: vote.id, election: electionCycle() });
  } catch {
    return NextResponse.json({ error: "Error al votar" }, { status: 500 });
  }
}
