import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v72.0 INFINITA VERDADES — SIMULADOR DE PAÍS (MI PAÍS).
// El comandante pidió "crear simulador de país: mi país, cartel/unión, elegir
// su territorio, figuras públicas". Doctrina de tablas on-demand idempotentes
// (misma de site_presence / site_counter: CREATE TABLE IF NOT EXISTS, riesgo cero):
//   site_naciones(uid PK, nombre, gentilicio, lema, c1, c2, simbolo, gobierno,
//                 region, capital, presidente, ministros JSON, union_name,
//                 pob, pib, ejercito, updated_at)
//   site_uniones(nombre PK, tipo, lema, fundador, fundador_uid, created_at)
// Estadísticas (población/PIB/ejército) se derivan SIEMPRE del nombre en el
// servidor: mismas cifras para todos, nada manipulable desde el cliente.

export const dynamic = "force-dynamic";

const MIN = 2;

async function ensureTables() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS site_naciones (
      uid TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      gentilicio TEXT NOT NULL DEFAULT '',
      lema TEXT NOT NULL DEFAULT '',
      c1 TEXT NOT NULL DEFAULT '#c8102e',
      c2 TEXT NOT NULL DEFAULT '#ffd60a',
      simbolo TEXT NOT NULL DEFAULT '★',
      gobierno TEXT NOT NULL DEFAULT 'REPÚBLICA',
      region TEXT NOT NULL DEFAULT '',
      capital TEXT NOT NULL DEFAULT '',
      presidente TEXT NOT NULL DEFAULT '',
      ministros TEXT NOT NULL DEFAULT '[]',
      union_name TEXT NOT NULL DEFAULT '',
      pob BIGINT NOT NULL DEFAULT 0,
      pib BIGINT NOT NULL DEFAULT 0,
      ejercito INT NOT NULL DEFAULT 0,
      updated_at BIGINT NOT NULL
    )`);
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS site_uniones (
      nombre TEXT PRIMARY KEY,
      tipo TEXT NOT NULL DEFAULT 'ALIANZA',
      lema TEXT NOT NULL DEFAULT '',
      fundador TEXT NOT NULL DEFAULT '',
      fundador_uid TEXT NOT NULL DEFAULT '',
      created_at BIGINT NOT NULL
    )`);
}

function str(v: unknown, max: number): string {
  return String(v ?? "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, max);
}

function color(v: unknown, fallback: string): string {
  const s = String(v ?? "");
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s : fallback;
}

function hashNum(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function statsFor(nombre: string) {
  const h = hashNum(nombre.toLowerCase());
  return {
    pob: 2_000_000 + (h % 140_000_000),
    pib: 8_000 + (Math.floor(h / 7) % 2_400_000), // millones USD
    ejercito: 8_000 + (Math.floor(h / 13) % 900_000),
  };
}

interface Ministro {
  rol: string;
  nombre: string;
}

function parseMinistros(v: unknown): Ministro[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(0, 6)
    .map((m) => ({ rol: str((m as Ministro)?.rol, 24), nombre: str((m as Ministro)?.nombre, 28) }))
    .filter((m) => m.rol && m.nombre);
}

interface NacionRow {
  uid: string;
  nombre: string;
  gentilicio: string;
  lema: string;
  c1: string;
  c2: string;
  simbolo: string;
  gobierno: string;
  region: string;
  capital: string;
  presidente: string;
  ministros: string;
  union_name: string;
  pob: bigint | number;
  pib: bigint | number;
  ejercito: number;
  updated_at: bigint | number;
}

function shapeNacion(r: NacionRow) {
  let ministros: Ministro[] = [];
  try {
    ministros = parseMinistros(JSON.parse(r.ministros || "[]"));
  } catch {
    ministros = [];
  }
  return {
    uid: r.uid,
    nombre: r.nombre,
    gentilicio: r.gentilicio,
    lema: r.lema,
    c1: r.c1,
    c2: r.c2,
    simbolo: r.simbolo,
    gobierno: r.gobierno,
    region: r.region,
    capital: r.capital,
    presidente: r.presidente,
    ministros,
    union: r.union_name || null,
    pob: Number(r.pob),
    pib: Number(r.pib),
    ejercito: r.ejercito,
  };
}

// GET /api/naciones?uid= → { ok, mia, top, uniones, totalNaciones }
export async function GET(req: Request) {
  try {
    await ensureTables();
    const uid = new URL(req.url).searchParams.get("uid")?.replace(/[^A-Za-z0-9-]/g, "").slice(0, 40) || "";
    const rows = await db.$queryRaw<NacionRow[]>`
      SELECT * FROM site_naciones ORDER BY updated_at DESC LIMIT 60`;
    const unionRows = await db.$queryRaw<{ nombre: string; tipo: string; lema: string; fundador: string; fundador_uid: string; created_at: bigint | number; miembros: bigint | number }[]>`
      SELECT u.*, (SELECT COUNT(*) FROM site_naciones n WHERE n.union_name = u.nombre) AS miembros
      FROM site_uniones u ORDER BY created_at DESC LIMIT 40`;
    const top = rows.map(shapeNacion);
    const mia = uid ? top.find((n) => n.uid === uid) ?? null : null;
    const total = await db.$queryRaw<{ n: bigint | number }[]>`SELECT COUNT(*) AS n FROM site_naciones`;
    return NextResponse.json({
      ok: true,
      mia,
      top: top.slice(0, 18),
      uniones: unionRows.map((u) => ({
        nombre: u.nombre,
        tipo: u.tipo,
        lema: u.lema,
        fundador: u.fundador,
        miembros: Number(u.miembros),
      })),
      totalNaciones: Number(total[0]?.n ?? 0),
    });
  } catch (e) {
    console.error("naciones GET error", e);
    return NextResponse.json({ ok: false, mia: null, top: [], uniones: [], totalNaciones: 0 }, { status: 200 });
  }
}

// POST /api/naciones
// { action: "guardar", uid, nacion: {...} }
// { action: "crear_union", uid, union: { nombre, tipo, lema } }
// { action: "unirse", uid, union: "NOMBRE" }
// { action: "salir", uid }
export async function POST(req: Request) {
  try {
    await ensureTables();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const uid = str(body.uid, 40).replace(/[^A-Za-z0-9-]/g, "");
    if (uid.length < 8) return NextResponse.json({ ok: false, error: "UID inválido" }, { status: 400 });
    const action = str(body.action, 16);

    if (action === "guardar") {
      const n = (body.nacion ?? {}) as Record<string, unknown>;
      const nombre = str(n.nombre, 32);
      if (nombre.length < MIN) return NextResponse.json({ ok: false, error: "El país necesita nombre" }, { status: 400 });
      // un nombre de país es único: si otro uid ya lo registró, se rechaza
      const dueno = await db.$queryRaw<{ uid: string }[]>`
        SELECT uid FROM site_naciones WHERE LOWER(nombre) = ${nombre.toLowerCase()} LIMIT 1`;
      if (dueno[0] && dueno[0].uid !== uid) {
        return NextResponse.json({ ok: false, error: `El nombre "${nombre}" ya lo proclamó otra nación` }, { status: 409 });
      }
      const prev = await db.$queryRaw<{ union_name: string }[]>`
        SELECT union_name FROM site_naciones WHERE uid = ${uid} LIMIT 1`;
      const stats = statsFor(nombre);
      const ministros = parseMinistros(n.ministros);
      await db.$executeRaw`
        INSERT INTO site_naciones
          (uid, nombre, gentilicio, lema, c1, c2, simbolo, gobierno, region, capital, presidente, ministros, union_name, pob, pib, ejercito, updated_at)
        VALUES (${uid}, ${nombre}, ${str(n.gentilicio, 24)}, ${str(n.lema, 80)},
                ${color(n.c1, "#c8102e")}, ${color(n.c2, "#ffd60a")}, ${str(n.simbolo, 4) || "★"},
                ${str(n.gobierno, 24) || "REPÚBLICA"}, ${str(n.region, 40)}, ${str(n.capital, 28)},
                ${str(n.presidente, 32)}, ${JSON.stringify(ministros)},
                ${str(prev[0]?.union_name, 40)}, ${stats.pob}, ${stats.pib}, ${stats.ejercito}, ${Date.now()})
        ON CONFLICT (uid) DO UPDATE SET
          nombre = EXCLUDED.nombre, gentilicio = EXCLUDED.gentilicio, lema = EXCLUDED.lema,
          c1 = EXCLUDED.c1, c2 = EXCLUDED.c2, simbolo = EXCLUDED.simbolo, gobierno = EXCLUDED.gobierno,
          region = EXCLUDED.region, capital = EXCLUDED.capital, presidente = EXCLUDED.presidente,
          ministros = EXCLUDED.ministros, pob = EXCLUDED.pob, pib = EXCLUDED.pib,
          ejercito = EXCLUDED.ejercito, updated_at = EXCLUDED.updated_at`;
      const mia = await db.$queryRaw<NacionRow[]>`SELECT * FROM site_naciones WHERE uid = ${uid} LIMIT 1`;
      return NextResponse.json({ ok: true, mia: mia[0] ? shapeNacion(mia[0]) : null });
    }

    if (action === "crear_union") {
      const u = (body.union ?? {}) as Record<string, unknown>;
      const nombre = str(u.nombre, 32);
      if (nombre.length < MIN) return NextResponse.json({ ok: false, error: "La unión necesita nombre" }, { status: 400 });
      const existe = await db.$queryRaw<{ nombre: string }[]>`
        SELECT nombre FROM site_uniones WHERE LOWER(nombre) = ${nombre.toLowerCase()} LIMIT 1`;
      if (existe[0]) return NextResponse.json({ ok: false, error: `Ya existe "${nombre}"` }, { status: 409 });
      const mia = await db.$queryRaw<{ nombre: string }[]>`SELECT nombre FROM site_naciones WHERE uid = ${uid} LIMIT 1`;
      if (!mia[0]) return NextResponse.json({ ok: false, error: "Proclama tu país antes de fundar una unión" }, { status: 400 });
      await db.$executeRaw`
        INSERT INTO site_uniones (nombre, tipo, lema, fundador, fundador_uid, created_at)
        VALUES (${nombre}, ${str(u.tipo, 16) || "ALIANZA"}, ${str(u.lema, 80)}, ${mia[0].nombre}, ${uid}, ${Date.now()})`;
      await db.$executeRaw`UPDATE site_naciones SET union_name = ${nombre} WHERE uid = ${uid}`;
      return NextResponse.json({ ok: true, union: nombre });
    }

    if (action === "unirse") {
      const nombre = str(body.union, 40);
      const existe = await db.$queryRaw<{ nombre: string }[]>`SELECT nombre FROM site_uniones WHERE nombre = ${nombre} LIMIT 1`;
      if (!existe[0]) return NextResponse.json({ ok: false, error: "Esa unión no existe" }, { status: 404 });
      await db.$executeRaw`UPDATE site_naciones SET union_name = ${nombre} WHERE uid = ${uid}`;
      return NextResponse.json({ ok: true, union: nombre });
    }

    if (action === "salir") {
      await db.$executeRaw`UPDATE site_naciones SET union_name = '' WHERE uid = ${uid}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Acción desconocida" }, { status: 400 });
  } catch (e) {
    console.error("naciones POST error", e);
    return NextResponse.json({ ok: false, error: "Error del servidor de naciones" }, { status: 200 });
  }
}
