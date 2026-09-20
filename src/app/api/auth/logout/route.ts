// Vanguard v15 — API de cuentas: cerrar sesión.
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("vg_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
