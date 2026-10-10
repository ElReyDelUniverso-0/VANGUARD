// Vanguard v15 — API de cuentas: inicio de sesión.
// v102.0 LA CIUDADELA — BLINDAJE DEL LOGIN: 8 intentos/10 min por IP,
// lockout de 15 min tras 5 fallos de una misma cuenta, retardo constante
// en los fallos (anti-sondeo de contraseñas).
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyPassword, createSessionToken, sessionCookieOptions,
  ensureOwnerAccount, publicAccount,
} from "@/lib/auth-server";
import { muro, claveCliente, registrarFalloLogin, limpiarFalloLogin, enLockout, sanitizarLinea } from "@/lib/fortaleza";

const retardo = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: NextRequest) {
  try {
    // MURO — máximo 8 intentos por IP cada 10 minutos
    const veredicto = muro(`login:${claveCliente(req)}`, 8, 600_000);
    if (!veredicto.permitido) {
      return NextResponse.json(
        { ok: false, error: `Demasiados intentos desde tu conexión — muro de acero ${Math.ceil(veredicto.espera / 60)} min.` },
        { status: 429 }
      );
    }

    await ensureOwnerAccount();
    const body = await req.json().catch(() => ({}));
    const username = sanitizarLinea(body.username ?? "", 24).trim().toUpperCase();
    const password = typeof body.password === "string" ? body.password.slice(0, 64) : "";

    // LOCKOUT por cuenta — antes de tocar la base
    if (enLockout(`cuenta:${username}`)) {
      await retardo(350);
      return NextResponse.json(
        { ok: false, error: "Esta cuenta está blindada 15 minutos tras 5 fallos — espera o recupera la calma." },
        { status: 429 }
      );
    }

    const account = await db.account.findUnique({ where: { username } });
    if (!account || !verifyPassword(password, account.passHash)) {
      const lock = registrarFalloLogin(`cuenta:${username}`);
      await retardo(350); // retardo constante: no revelamos si la cuenta existe
      return NextResponse.json(
        {
          ok: false,
          error: lock.bloqueado
            ? `Cuenta blindada 15 min tras 5 fallos — la Ciudadela protege a sus analistas.`
            : "Cuenta o contraseña incorrecta.",
        },
        { status: 401 }
      );
    }

    limpiarFalloLogin(`cuenta:${username}`);
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
