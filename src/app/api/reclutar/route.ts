import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v72.0 INFINITA VERDADES — RECLUTAR ALIADO ALEATORIO.
// El comandante pidió "que se pueda invitar jugadores aleatorios". Doctrina:
//  · El objetivo se elige AL AZAR entre los guerreros EN LÍNEA AHORA (latido de
//    site_presence < 90s), nunca uno mismo.
//  · La invitación vive en site_invites (tabla on-demand idempotente) 15 minutos
//    o hasta aceptarse; el invitado la ve al abrir MI PAÍS y puede UNIRSE a la
//    unión del que invita con un toque.

export const dynamic = "force-dynamic";

const VENTANA_MS = 90_000; // misma ventana de presencia
const VIDA_MS = 15 * 60_000; // la invitación caduca en 15 min

async function ensureTables() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS site_invites (
      id BIGSERIAL PRIMARY KEY,
      from_uid TEXT NOT NULL,
      from_nacion TEXT NOT NULL DEFAULT '',
      from_union TEXT NOT NULL DEFAULT '',
      to_uid TEXT NOT NULL,
      accepted INT NOT NULL DEFAULT 0,
      ts BIGINT NOT NULL
    )`);
}

function str(v: unknown, max: number): string {
  return String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

// GET /api/reclutar?uid= → invitaciones pendientes para mí
export async function GET(req: Request) {
  try {
    await ensureTables();
    const uid = (new URL(req.url).searchParams.get("uid") || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 40);
    if (!uid) return NextResponse.json({ ok: true, items: [] });
    const rows = await db.$queryRaw<{ id: bigint | number; from_uid: string; from_nacion: string; from_union: string; ts: bigint | number }[]>`
      SELECT id, from_uid, from_nacion, from_union, ts FROM site_invites
      WHERE to_uid = ${uid} AND accepted = 0 AND ts > ${Date.now() - VIDA_MS}
      ORDER BY ts DESC LIMIT 5`;
    return NextResponse.json({
      ok: true,
      items: rows.map((r) => ({ id: Number(r.id), de: r.from_uid, nacion: r.from_nacion, union: r.from_union })),
    });
  } catch (e) {
    console.error("reclutar GET error", e);
    return NextResponse.json({ ok: true, items: [] });
  }
}

// POST /api/reclutar
// { action: "invitar", uid }                    → elige guerrero al azar en línea
// { action: "aceptar", uid, id }                → marca aceptada
export async function POST(req: Request) {
  try {
    await ensureTables();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const uid = str(body.uid, 40).replace(/[^A-Za-z0-9-]/g, "");
    if (uid.length < 8) return NextResponse.json({ ok: false, error: "UID inválido" }, { status: 400 });
    const action = str(body.action, 10);

    if (action === "invitar") {
      // 1) mi nación (para el mensaje de la invitación)
      const mia = await db.$queryRaw<{ nombre: string; union_name: string }[]>`
        SELECT nombre, union_name FROM site_naciones WHERE uid = ${uid} LIMIT 1`;
      if (!mia[0]) {
        return NextResponse.json({ ok: false, error: "Proclama tu país antes de reclutar" }, { status: 400 });
      }
      // 2) guerreros en línea ahora, excluyéndome
      const online = await db.$queryRaw<{ uid: string }[]>`
        SELECT uid FROM site_presence WHERE last_seen > ${Date.now() - VENTANA_MS} AND uid <> ${uid}
        ORDER BY random() LIMIT 1`;
      if (!online[0]) {
        return NextResponse.json({ ok: false, error: "No hay otros guerreros en línea ahora — vuelve a intentarlo pronto" });
      }
      // 3) registrar invitación (evita duplicar a la misma persona en <2 min)
      const dup = await db.$queryRaw<{ id: bigint | number }[]>`
        SELECT id FROM site_invites WHERE from_uid = ${uid} AND to_uid = ${online[0].uid} AND ts > ${Date.now() - 120_000} LIMIT 1`;
      if (dup[0]) {
        return NextResponse.json({ ok: false, error: "Ya le enviaste invitación a ese guerrero hace un momento" });
      }
      await db.$executeRaw`
        INSERT INTO site_invites (from_uid, from_nacion, from_union, to_uid, ts)
        VALUES (${uid}, ${mia[0].nombre}, ${mia[0].union_name || ""}, ${online[0].uid}, ${Date.now()})`;
      await db.$executeRawUnsafe(`DELETE FROM site_invites WHERE ts < ${Date.now() - VIDA_MS}`).catch(() => {});
      return NextResponse.json({ ok: true, objetivo: online[0].uid });
    }

    if (action === "aceptar") {
      const id = Number(body.id);
      if (!Number.isFinite(id)) return NextResponse.json({ ok: false, error: "Invitación inválida" }, { status: 400 });
      const rows = await db.$queryRaw<{ from_union: string }[]>`
        SELECT from_union FROM site_invites WHERE id = ${id} AND to_uid = ${uid} LIMIT 1`;
      await db.$executeRaw`UPDATE site_invites SET accepted = 1 WHERE id = ${id} AND to_uid = ${uid}`;
      const union = rows[0]?.from_union || "";
      if (union) {
        // el aceptar te une directamente a la unión del que te invitó
        await db.$executeRaw`UPDATE site_naciones SET union_name = ${union} WHERE uid = ${uid}`.catch(() => {});
      }
      return NextResponse.json({ ok: true, union: union || null });
    }

    return NextResponse.json({ ok: false, error: "Acción desconocida" }, { status: 400 });
  } catch (e) {
    console.error("reclutar POST error", e);
    return NextResponse.json({ ok: false, error: "Error del servidor de reclutamiento" }, { status: 200 });
  }
}
