import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { electionCycle } from "@/lib/dark-data";

// GET /api/ambassadors — candidatos del ciclo actual + resultados
// ?country=ua&cycle=1
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cyc = electionCycle();
  const cycle = searchParams.get("cycle") ?? cyc.cycle;
  const country = searchParams.get("country") ?? "";

  const where: Record<string, unknown> = { cycle };
  if (country) where.country = country;

  const candidates = await db.ambassadorCandidate.findMany({
    where,
    orderBy: [{ votes: "desc" }, { createdAt: "asc" }],
    include: { votesRel: { select: { voter: true, country: true } } },
  });

  const totalCountries = country
    ? 1
    : await db.ambassadorCandidate.groupBy({ by: ["country"], where: { cycle } });

  return NextResponse.json({
    cycle,
    election: cyc,
    candidates,
    countriesInElection: Array.isArray(totalCountries) ? totalCountries.length : 1,
  });
}

// POST /api/ambassadors — registrar candidatura
// { alias, country, slogan, platform, cycle? }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const alias = String(body.alias ?? "").trim();
    const country = String(body.country ?? "").trim().toLowerCase();
    const slogan = String(body.slogan ?? "").slice(0, 140);
    const platform = String(body.platform ?? "").slice(0, 1000);
    const cyc = electionCycle();
    const cycle = String(body.cycle ?? cyc.cycle);

    if (!alias || alias.length < 2) {
      return NextResponse.json({ error: "Alias inválido" }, { status: 400 });
    }
    if (!/^[a-z]{2}$/.test(country)) {
      return NextResponse.json({ error: "País inválido (ISO2)" }, { status: 400 });
    }

    const existing = await db.ambassadorCandidate.findUnique({
      where: { alias_country_cycle: { alias, country, cycle } },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya eres candidato de este país en este ciclo" }, { status: 409 });
    }

    const created = await db.ambassadorCandidate.create({
      data: { alias, country, cycle, slogan, platform },
    });
    return NextResponse.json({ ok: true, candidate: created, election: cyc });
  } catch {
    return NextResponse.json({ error: "Error al registrar candidatura" }, { status: 500 });
  }
}
