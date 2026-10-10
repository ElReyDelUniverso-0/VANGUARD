// Vanguard v15 — API de cuentas: registro con cloud-save.
// v102.0 LA CIUDADELA — MUROS DE ACERO: límite por IP (6 cuentas/hora),
// contraseña mínima de 6, respuesta con retardo constante anti-sondeo.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword, validateUsername, validatePassword, createSessionToken,
  sessionCookieOptions, ensureOwnerAccount, publicAccount,
} from "@/lib/auth-server";
import { muro, claveCliente, sanitizarLinea } from "@/lib/fortaleza";

export async function POST(req: NextRequest) {
  try {
    // MURO 1 — máximo 6 registros por IP y hora
    const veredicto = muro(`reg:${claveCliente(req)}`, 6, 3600_000);
    if (!veredicto.permitido) {
      return NextResponse.json(
        { ok: false, error: `La Ciudadela detectó demasiados registros desde tu conexión. Vuelve en ${Math.ceil(veredicto.espera / 60)} min.` },
        { status: 429 }
      );
    }

    await ensureOwnerAccount();
    const body = await req.json().catch(() => ({}));
    const username = sanitizarLinea(body.username ?? "", 24).trim().toUpperCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 64) : "";

    const nameErr = validateUsername(username);
    if (nameErr) return NextResponse.json({ ok: false, error: nameErr }, { status: 400 });
    const passErr = validatePassword(password);
    if (passErr) return NextResponse.json({ ok: false, error: passErr }, { status: 400 });
    // v102: la Ciudadela exige 6+ — las cuentas viejas (4+) siguen entrando igual
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "La Ciudadela exige una contraseña de al menos 6 caracteres." },
        { status: 400 }
      );
    }

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
