// Vanguard v15 — API de cuentas: sesión actual.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE, publicAccount } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const username = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!username) return NextResponse.json({ ok: true, account: null });
    const account = await db.account.findUnique({ where: { username } });
    if (!account) return NextResponse.json({ ok: true, account: null });
    return NextResponse.json({ ok: true, account: publicAccount(account), savedAt: account.savedAt });
  } catch (e) {
    console.error("me error", e);
    return NextResponse.json({ ok: true, account: null });
  }
}
