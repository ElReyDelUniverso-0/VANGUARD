// Vanguard v15 — API de cuentas: registro con cloud-save.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword, validateUsername, validatePassword, createSessionToken,
  sessionCookieOptions, ensureOwnerAccount, publicAccount,
} from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    await ensureOwnerAccount();
    const body = await req.json().catch(() => ({}));
    const username = String(body.username ?? "").trim().toUpperCase();
    const password = String(body.password ?? "");

    const nameErr = validateUsername(username);
    if (nameErr) return NextResponse.json({ ok: false, error: nameErr }, { status: 400 });
    const passErr = validatePassword(password);
    if (passErr) return NextResponse.json({ ok: false, error: passErr }, { status: 400 });

    const exists = await db.account.findUnique({ where: { username } });
    if (exists) {
      return NextResponse.json({ ok: false, error: "Ese nombre de cuenta ya existe." }, { status: 409 });
    }

    const account = await db.account.create({
      data: { username, passHash: hashPassword(password), lastLoginAt: new Date() },
    });

    const res = NextResponse.json({ ok: true, account: publicAccount(account) });
    res.cookies.set("vg_session", createSessionToken(account.username), sessionCookieOptions());
    return res;
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json({ ok: false, error: "Error del servidor al crear la cuenta." }, { status: 500 });
  }
}
