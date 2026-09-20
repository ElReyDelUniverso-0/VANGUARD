// Vanguard v15 — API de cuentas: guardado en la nube del progreso.
// GET  -> devuelve el saveJson de la cuenta de la sesión
// POST -> guarda el saveJson (máx ~2MB)
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const username = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!username) return NextResponse.json({ ok: false, error: "sin sesión" }, { status: 401 });
    const account = await db.account.findUnique({
      where: { username },
      select: { saveJson: true, savedAt: true },
    });
    if (!account) return NextResponse.json({ ok: false, error: "sin sesión" }, { status: 401 });
    return NextResponse.json({ ok: true, save: account.saveJson || null, savedAt: account.savedAt });
  } catch (e) {
    console.error("save GET error", e);
    return NextResponse.json({ ok: false, error: "error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const username = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!username) return NextResponse.json({ ok: false, error: "sin sesión" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const save = typeof body.save === "string" ? body.save : "";
    if (save.length > 2_000_000) {
      return NextResponse.json({ ok: false, error: "guardado demasiado grande" }, { status: 413 });
    }
    await db.account.update({ where: { username }, data: { saveJson: save, savedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("save POST error", e);
    return NextResponse.json({ ok: false, error: "error" }, { status: 500 });
  }
}
