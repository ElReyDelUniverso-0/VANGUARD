import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v42.2 AGENTE AUTO DE PROMOCIÓN — el agente que el comandante pidió:
// "cuando termines una tarea, el agente manda el siguiente mensaje solo".
// Este endpoint REPITE la promoción de VANGUARD sin que nadie toque nada:
//   IndexNow + Ping-o-Matic + Twingly + WebSub x2 + TotalPing
// (mismos canales verificados manualmente en r1-r8, todos keyless).
//
// Disparadores:
//   · Vercel Cron (vercel.json → crons) — 1 vez al día
//   · Supabase pg_cron + pg_net (schedule SQL cada 12h) si la extensión está
//   · curl manual (con ?force=1 salta la protección anti-spam)
// Protección: sin ?force=1 solo corre 1 vez cada 30 min (guard en memoria).
// Cada corrida queda en site_counter: agent:runs (contador) y agent:last (epoch).

export const dynamic = "force-dynamic";

const BASE = "https://vanguard-kq9r.vercel.app";
const KEY = "074b8db50cc83f0689a2211e3ff94db1";

let _lastRun = 0;

type PingResult = { channel: string; status: number; ok: boolean };

async function ping(channel: string, url: string, init?: RequestInit): Promise<PingResult> {
  try {
    const r = await fetch(url, { ...init, signal: AbortSignal.timeout(12_000) });
    return { channel, status: r.status, ok: r.status >= 200 && r.status < 400 };
  } catch {
    return { channel, status: 0, ok: false };
  }
}

async function runPings(): Promise<PingResult[]> {
  const post = (url: string, body: string, ct: string): RequestInit => ({
    method: "POST",
    headers: { "Content-Type": ct },
    body,
  });
  return Promise.all([
    ping(
      "IndexNow",
      "https://api.indexnow.org/indexnow",
      post(
        "https://api.indexnow.org/indexnow",
        JSON.stringify({
          host: "vanguard-kq9r.vercel.app",
          key: KEY,
          keyLocation: `${BASE}/${KEY}.txt`,
          urlList: [`${BASE}/?ref=VGD-AGENT`, `${BASE}/guerra-hoy`],
        }),
        "application/json; charset=utf-8"
      )
    ),
    ping(
      "PingOMatic",
      `https://pingomatic.com/ping/?title=VANGUARD%20guerra%20en%20vivo&blogurl=${BASE}&rssurl=${BASE}/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on`
    ),
    ping(
      "Twingly",
      "https://ping.twingly.com/",
      post(
        "https://ping.twingly.com/",
        `<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD guerra en vivo</value></param><param><value>${BASE}</value></param><param><value>${BASE}/feed.xml</value></param></params></methodCall>`,
        "text/xml"
      )
    ),
    ping("WebSub-PubSubHubbub", "https://pubsubhubbub.appspot.com/", post("https://pubsubhubbub.appspot.com/", "hub.mode=publish&hub.url=" + BASE + "/feed.xml", "application/x-www-form-urlencoded")),
    ping("WebSub-Superfeedr", "https://hub.superfeedr.com/", post("https://hub.superfeedr.com/", "hub.mode=publish&hub.url=" + BASE + "/feed.xml", "application/x-www-form-urlencoded")),
    ping("TotalPing", `http://www.totalping.com/?p=tp&title=VANGUARD&url=${BASE}&rss=${BASE}/feed.xml&chk=1`),
  ]);
}

async function recordRun(results: PingResult[]) {
  try {
    await db.$executeRawUnsafe(
      "CREATE TABLE IF NOT EXISTS site_counter (k TEXT PRIMARY KEY, n BIGINT NOT NULL DEFAULT 0)"
    );
    await db.$executeRaw`
      INSERT INTO site_counter (k, n) VALUES (${"agent:runs"}, 1)
      ON CONFLICT (k) DO UPDATE SET n = site_counter.n + 1`;
    await db.$executeRaw`
      INSERT INTO site_counter (k, n) VALUES (${"agent:last"}, ${Date.now()})
      ON CONFLICT (k) DO UPDATE SET n = ${Date.now()}`;
    const okCount = results.filter((r) => r.ok).length;
    await db.$executeRaw`
      INSERT INTO site_counter (k, n) VALUES (${"agent:ok"}, ${okCount})
      ON CONFLICT (k) DO UPDATE SET n = ${okCount}`;
  } catch {
    /* el registro nunca tumba al agente */
  }
}

// GET /api/agent-ping — una corrida completa del agente. ?force=1 salta el guard.
export async function GET(req: Request) {
  const force = new URL(req.url).searchParams.get("force") === "1";
  if (!force && Date.now() - _lastRun < 30 * 60 * 1000) {
    return NextResponse.json({ ok: true, skipped: true, lastRunAgoMs: Date.now() - _lastRun });
  }
  _lastRun = Date.now();
  const results = await runPings();
  await recordRun(results);
  const okCount = results.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: true,
    agent: "auto-promo",
    ranAt: new Date().toISOString(),
    channelsOk: okCount,
    channels: results.length,
    results,
  });
}
