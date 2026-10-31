// ============================================================
// v214.0 LA PUERTA — API del modo elegido.
// POST /api/auth/modo { modo } — guarda en la CUENTA (nube) el modo
// que la persona eligió en el ritual o en /modo. El aparato ya lo
// guarda solo (localStorage vg-modo); esto es el espejo honesto:
// sin sesión responde 401 y el cliente sigue con su modo local.
// v207 INFINITO: el DUEÑO cruza los muros. Ley v211: muro() devuelve
// un OBJETO — se juzga .permitido, jamás como booleano.
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE, sesionDuenoReq } from "@/lib/auth-server";
import { muro, claveCliente, sanitizarLinea } from "@/lib/fortaleza";
import { esModoValido } from "@/lib/modos";

export async function POST(req: NextRequest) {
  try {
    const veredicto = muro(`modo:${claveCliente(req)}`, 30, 60_000);
    if (!veredicto.permitido && !sesionDuenoReq(req)) {
      return NextResponse.json(
        { ok: false, error: `Demasiados cambios de modo — respira y vuelve en ${Math.ceil(veredicto.espera / 1000)}s.` },
        { status: 429 }
      );
    }

    const username = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!username) {
      return NextResponse.json(
        { ok: false, error: "Entra a tu cuenta para guardar tu modo en la nube." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const modo = sanitizarLinea(body.modo ?? "", 32).trim().toLowerCase();
    if (!modo || !esModoValido(modo)) {
      return NextResponse.json({ ok: false, error: "Modo desconocido." }, { status: 400 });
    }

    const cuenta = await db.account.findUnique({ where: { username }, select: { id: true } });
    if (!cuenta) {
      return NextResponse.json({ ok: false, error: "Cuenta no encontrada." }, { status: 404 });
    }

    await db.account.update({ where: { id: cuenta.id }, data: { modo } });
    return NextResponse.json({ ok: true, modo });
  } catch (e) {
    console.error("modo error", e);
    return NextResponse.json({ ok: false, error: "Error del servidor al fijar el modo." }, { status: 500 });
  }
}
