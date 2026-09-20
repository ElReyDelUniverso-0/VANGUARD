// Vanguard v15 — API de cuentas: inicio de sesión.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyPassword, createSessionToken, sessionCookieOptions,
  ensureOwnerAccount, publicAccount,
} from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    await ensureOwnerAccount();
    const body = await req.json().catch(() => ({}));
    const username = String(body.username ?? "").trim().toUpperCase();
    const password = String(body.password ?? "");

    const account = await db.account.findUnique({ where: { username } });
    if (!account || !verifyPassword(password, account.passHash)) {
      return NextResponse.json({ ok: false, error: "Cuenta o contraseña incorrecta." }, { status: 401 });
    }

    await db.account.update({ where: { id: account.id }, data: { lastLoginAt: new Date() } });

    const res = NextResponse.json({
      ok: true,
      account: publicAccount(account),
      hasSave: !!account.saveJson,
      savedAt: account.savedAt,
    });
    res.cookies.set("vg_session", createSessionToken(account.username), sessionCookieOptions());
    return res;
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json({ ok: false, error: "Error del servidor al iniciar sesión." }, { status: 500 });
  }
}
