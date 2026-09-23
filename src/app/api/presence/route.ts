import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v42 TU IDIOMA, TU GUERRA — GUERREROS EN VIVO.
// El comandante pidió ver "personas activas, no solo entraron y ya": esto es la
// PRESENCIA real. Pureza HTTP (POST latido cada 30s desde PresencePing):
// al no depender del socket de Render, funciona aunque el contenedor esté
// dormido — misma doctrina que ensurePlayerCounted en v39.1.
//
// Tabla on-demand (idempotente, riesgo cero como site_counter):
//   site_presence(uid TEXT PK, last_seen BIGINT epoch-ms, lang TEXT)
// En línea = latido dentro de la ventana de 90s (tolera 3 latidos perdidos).
// Limpieza: cada POST borra filas de más de 2h — la tabla queda mínima.

export const dynamic = "force-dynamic";

const WINDOW_MS = 90_000; // en línea si latió hace < 90s
const GC_MS = 7_200_000;  // borra muertos con más de 2h

async function ensureTable() {
  await db.$executeRawUnsafe(
    "CREATE TABLE IF NOT EXISTS site_presence (uid TEXT PRIMARY KEY, last_seen BIGINT NOT NULL, lang TEXT NOT NULL DEFAULT '')"
  );
}

async function countOnline(): Promise<number> {
  const rows = await db.$queryRaw<{ n: number }[]>`
    SELECT COUNT(*) AS n FROM site_presence WHERE last_seen > ${Date.now() - WINDOW_MS}`;
  return rows[0] ? Number(rows[0].n) : 0;
}

async function langBreakdown(): Promise<{ lang: string; n: number }[]> {
  const rows = await db.$queryRaw<{ lang: string; n: number }[]>`
    SELECT lang, COUNT(*) AS n FROM site_presence
    WHERE last_seen > ${Date.now() - WINDOW_MS} AND lang <> ''
    GROUP BY lang ORDER BY n DESC LIMIT 8`;
  return rows.map((r) => ({ lang: r.lang || "?", n: Number(r.n) }));
}

// POST /api/presence — latido { uid, lang? } → upsert + { ok, online, langs }
export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = (await req.json().catch(() => ({}))) as {
      uid?: string;
      lang?: string;
    };
    const uid = (body?.uid || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 40);
    const lang = (body?.lang || "").replace(/[^a-zA-Z]/g, "").slice(0, 8).toLowerCase();
    if (uid.length >= 8) {
      await db.$executeRaw`
        INSERT INTO site_presence (uid, last_seen, lang)
        VALUES (${uid}, ${Date.now()}, ${lang})
        ON CONFLICT (uid) DO UPDATE SET last_seen = ${Date.now()}, lang = ${lang}`;
      await db
        .$executeRaw`DELETE FROM site_presence WHERE last_seen < ${Date.now() - GC_MS}`.catch(
        () => {}
      );
    }
    const online = await countOnline();
    return NextResponse.json({ ok: true, online });
  } catch {
    return NextResponse.json({ ok: false, online: 0 }, { status: 200 });
  }
}

// GET /api/presence — { ok, online, langs } para el badge EN VIVO
export async function GET() {
  try {
    await ensureTable();
    const [online, langs] = await Promise.all([countOnline(), langBreakdown()]);
    return NextResponse.json({ ok: true, online, langs });
  } catch {
    return NextResponse.json({ ok: false, online: 0, langs: [] }, { status: 200 });
  }
}
