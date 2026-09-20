import { NextResponse } from "next/server";

// Presencia en vivo de la web (contador de personas en EN VIVO).
// En memoria del proceso — suficiente para el contador global de la sala.
const g = globalThis as unknown as { __vanguardPresence?: { count: number; sessions: Map<string, number> } };
if (!g.__vanguardPresence) g.__vanguardPresence = { count: 0, sessions: new Map() };
const presence = g.__vanguardPresence;

// POST /api/live/presence { action: "join" | "leave", sid } — heartbeat del visitante
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const sid = String(body?.sid || "").slice(0, 40);
  const action = body?.action;
  if (sid) {
    if (action === "join") {
      if (!presence.sessions.has(sid)) {
        presence.sessions.set(sid, Date.now());
        presence.count++;
      } else {
        presence.sessions.set(sid, Date.now()); // heartbeat
      }
    } else if (action === "leave" && presence.sessions.has(sid)) {
      presence.sessions.delete(sid);
      presence.count = Math.max(0, presence.count - 1);
    }
  }
  // limpieza de sesiones sin heartbeat > 2 min
  const now = Date.now();
  for (const [k, t] of presence.sessions) if (now - t > 120_000) { presence.sessions.delete(k); presence.count = Math.max(0, presence.count - 1); }
  return NextResponse.json({ online: presence.count });
}

// GET /api/live/presence — cuánta gente hay ahora en EN VIVO
export async function GET() {
  return NextResponse.json({ online: presence.count });
}
