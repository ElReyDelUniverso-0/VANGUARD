import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { electionCycle } from "@/lib/dark-data";

export const dynamic = "force-dynamic";

// v27 — GOBIERNO MUNDIAL: el embajador ELECTO de cada país puede TOMAR EL
// PODER como PRESIDENTE, nombrar CANCILLER/GENERAL/MINISTRO_PRENSA, reclutar
// jugadores a los departamentos de su nación y publicar DECRETOS (noticias
// oficiales fijadas que la comunidad lee). Poder político = roster + decretos
// + años de mandato ponderados.
//
// GET ?country=ua → gobierno, roster, decretos, poder | sin country → ranking de poder
// POST { action: "claim"|"appoint"|"declaim"|"join"|"leave", ... }

// v28 — JERARQUÍA COMPLETA: 8 cargos por país. El presidente nombra 7.
const ROLES = [
  "PRESIDENTE", "CANCILLER", "GENERAL", "ALMIRANTE", "MARISCAL_AIRE",
  "ESPIA_MAESTRO", "TESORERO", "MINISTRO_PRENSA",
];
// El poder político de cada nación suma el peso de sus cargos ocupados.
const ROLE_POWER: Record<string, number> = {
  PRESIDENTE: 60, CANCILLER: 35, GENERAL: 30, ALMIRANTE: 25,
  MARISCAL_AIRE: 25, ESPIA_MAESTRO: 25, TESORERO: 20, MINISTRO_PRENSA: 20,
};
const DEPTS = ["MILITAR", "DIPLOMACIA", "INTELIGENCIA", "PRENSA", "ECONOMIA"];

async function electedAmbassador(country: string, cycle: string): Promise<string> {
  const cands = await db.ambassadorCandidate.findMany({
    where: { country, cycle },
    orderBy: [{ votes: "desc" }, { createdAt: "asc" }],
    take: 1,
  });
  return cands[0]?.votes > 0 ? cands[0].alias : "";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = (searchParams.get("country") || "").slice(0, 2).toLowerCase();
    const cyc = electionCycle();

    if (!country) {
      // RANKING DE PODER POLÍTICO por país (v28: suma los pesos de los cargos)
      const [roles, rosters, decrees] = await Promise.all([
        db.govRole.findMany(),
        db.govRecruit.groupBy({ by: ["country"], _count: { country: true } }),
        db.ugcItem.groupBy({ by: ["country"], where: { kind: "decreto", status: "APROBADO" }, _count: { country: true } }),
      ]);
      const power = new Map<string, { country: string; president: string; roster: number; decrees: number; power: number }>();
      for (const r of roles) {
        const p = power.get(r.country) ?? { country: r.country, president: "", roster: 0, decrees: 0, power: r.role === "PRESIDENTE" ? 100 : 0 };
        if (r.role === "PRESIDENTE") {
          p.president = r.alias;
          p.power = Math.max(p.power, 100);
        }
        p.power += ROLE_POWER[r.role] ?? 0;
        power.set(r.country, p);
      }
      for (const rr of rosters) {
        const p = power.get(rr.country);
        if (p) {
          p.roster = rr._count.country;
          p.power += rr._count.country * 10;
        } else {
          power.set(rr.country, { country: rr.country, president: "", roster: rr._count.country, decrees: 0, power: rr._count.country * 10 });
        }
      }
      for (const d of decrees) {
        const p = power.get(d.country);
        if (p) {
          p.decrees = d._count.country;
          p.power += d._count.country * 25;
        }
      }
      const ranking = [...power.values()].sort((a, b) => b.power - a.power).slice(0, 25);
      return NextResponse.json({ ranking, cycle: cyc });
    }

    const [roles, roster, decrees, elected] = await Promise.all([
      db.govRole.findMany({ where: { country }, orderBy: { createdAt: "asc" } }),
      db.govRecruit.findMany({ where: { country }, orderBy: { createdAt: "desc" }, take: 60 }),
      db.ugcItem.findMany({ where: { kind: "decreto", country, status: "APROBADO" }, orderBy: { createdAt: "desc" }, take: 20 }),
      electedAmbassador(country, cyc.cycle),
    ]);

    const rosterCount = roster.length;
    const rolePower = roles.reduce((a, r) => a + (ROLE_POWER[r.role] ?? 0), 0);
    const power = 100 + rolePower + rosterCount * 10 + decrees.length * 25;
    return NextResponse.json({
      cycle: cyc,
      electedAmbassador: elected,
      roles,
      roster,
      decrees,
      power,
      depts: DEPTS,
      rolesAvailable: ROLES,
    });
  } catch (e) {
    console.error("government GET error", e);
    return NextResponse.json({ ranking: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action || "");
    const alias = String(body.alias || "").slice(0, 24);
    const country = String(body.country || "").slice(0, 2).toLowerCase();
    if (!alias || !country) return NextResponse.json({ error: "Falta alias o país" }, { status: 400 });
    const cyc = electionCycle();

    if (action === "claim") {
      // TOMAR EL PODER: exige ser el embajador electo del ciclo actual
      const elected = await electedAmbassador(country, cyc.cycle);
      if (!elected)
        return NextResponse.json({ error: "Este país aún no tiene embajador electo — gana las elecciones primero" }, { status: 403 });
      if (elected !== alias)
        return NextResponse.json({ error: `Solo ${elected} (embajador electo) puede tomar el poder de este país` }, { status: 403 });
      const existing = await db.govRole.findUnique({ where: { country_role: { country, role: "PRESIDENTE" } } });
      if (existing && existing.alias !== alias)
        return NextResponse.json({ error: `${existing.alias} ya es presidente — hay que derrocarlo (próximo ciclo)` }, { status: 409 });
      const role = await db.govRole.upsert({
        where: { country_role: { country, role: "PRESIDENTE" } },
        update: { alias, appointedBy: "ELECCIÓN POPULAR" },
        create: { country, role: "PRESIDENTE", alias, appointedBy: "ELECCIÓN POPULAR", cycle: cyc.cycle },
      });
      return NextResponse.json({ role, message: "¡Tomaste el poder! Ahora eres PRESIDENTE" }, { status: 201 });
    }

    const pres = await db.govRole.findUnique({ where: { country_role: { country, role: "PRESIDENTE" } } });

    if (action === "appoint") {
      if (!pres || pres.alias !== alias)
        return NextResponse.json({ error: "Solo el PRESIDENTE nombra cargos" }, { status: 403 });
      const role = String(body.role || "").toUpperCase();
      const target = String(body.target || "").slice(0, 24);
      if (!ROLES.includes(role) || role === "PRESIDENTE")
        return NextResponse.json({ error: "Cargo inválido (CANCILLER, GENERAL, ALMIRANTE, MARISCAL_AIRE, ESPIA_MAESTRO, TESORERO, MINISTRO_PRENSA)" }, { status: 400 });
      if (!target) return NextResponse.json({ error: "¿A quién nombras?" }, { status: 400 });
      const saved = await db.govRole.upsert({
        where: { country_role: { country, role } },
        update: { alias: target, appointedBy: pres.alias },
        create: { country, role, alias: target, appointedBy: pres.alias, cycle: cyc.cycle },
      });
      return NextResponse.json({ role: saved, message: `${target} nombrado ${role}` }, { status: 201 });
    }

    if (action === "declaim") {
      if (!pres || pres.alias !== alias)
        return NextResponse.json({ error: "Solo el PRESIDENTE publica decretos" }, { status: 403 });
      const title = String(body.title || "").trim().slice(0, 120);
      const info = String(body.body || "").trim().slice(0, 4000);
      if (title.length < 5 || info.length < 30)
        return NextResponse.json({ error: "El decreto necesita título (5+) y cuerpo (30+)" }, { status: 400 });
      const decree = await db.ugcItem.create({
        data: {
          kind: "decreto",
          author: pres.alias,
          authorBall: country,
          title: `DECRETO PRESIDENCIAL: ${title}`,
          summary: info.slice(0, 300),
          body: info,
          country,
          status: "APROBADO",
          aiVerdict: "LIMPIO",
          aiModerated: false,
        },
      });
      return NextResponse.json({ decree, message: "Decreto publicado — todo el país lo ve" }, { status: 201 });
    }

    if (action === "join") {
      const dept = String(body.dept || "MILITAR").toUpperCase();
      if (!DEPTS.includes(dept)) return NextResponse.json({ error: "Departamento inválido" }, { status: 400 });
      const row = await db.govRecruit.upsert({
        where: { country_alias: { country, alias } },
        update: { dept },
        create: { country, alias, dept },
      });
      return NextResponse.json({ recruit: row, message: `Te alistaste en ${dept} de ${country.toUpperCase()}` }, { status: 201 });
    }

    if (action === "leave") {
      await db.govRecruit.deleteMany({ where: { country, alias } });
      return NextResponse.json({ ok: true, message: "Dejaste el servicio del país" });
    }

    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (e) {
    console.error("government POST error", e);
    return NextResponse.json({ error: "El gobierno no pudo procesar la acción" }, { status: 500 });
  }
}
