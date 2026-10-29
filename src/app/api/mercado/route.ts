// ============================================================
// v173.0 LA CASA EN VIVO — MERCADO REAL SIN KEYS
// Fuente única de datos vivos de Vanguard: cripto vía Binance
// (público, sin key), acciones/índices/divisas vía Yahoo Finance
// chart (público, sin key) — exactamente los grifos que beben los
// sitios de mercado. Cache en memoria para ser buen vecino del
// upstream y fallback simulado sembrado si un grifo se corta:
// la casa NUNCA se queda sin números.
// GET /api/mercado        → tickers de todo el universo (+chispa)
// GET /api/mercado?id=BTC → + velas 1m del activo
// ============================================================
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type Vela = { t: number; o: number; h: number; l: number; c: number; v: number };
type Clase = "cripto" | "acciones" | "indices" | "divisas";
type Ticker = {
  id: string; s: string; n: string; c: Clase;
  p: number; d: number; ch: number[]; f: string;
};

type Def = { id: string; sim: string; n: string; c: Clase; base: number };

// ── EL UNIVERSO (32 activos, todos keyless) ──────────────────
const UNIVERSO: Def[] = [
  // cripto — Binance (pares USDT)
  { id: "BTC", sim: "BTCUSDT", n: "Bitcoin", c: "cripto", base: 80000 },
  { id: "ETH", sim: "ETHUSDT", n: "Ethereum", c: "cripto", base: 3800 },
  { id: "BNB", sim: "BNBUSDT", n: "BNB", c: "cripto", base: 620 },
  { id: "SOL", sim: "SOLUSDT", n: "Solana", c: "cripto", base: 185 },
  { id: "XRP", sim: "XRPUSDT", n: "XRP", c: "cripto", base: 2.1 },
  { id: "ADA", sim: "ADAUSDT", n: "Cardano", c: "cripto", base: 0.75 },
  { id: "DOGE", sim: "DOGEUSDT", n: "Dogecoin", c: "cripto", base: 0.32 },
  { id: "AVAX", sim: "AVAXUSDT", n: "Avalanche", c: "cripto", base: 38 },
  { id: "DOT", sim: "DOTUSDT", n: "Polkadot", c: "cripto", base: 6.8 },
  { id: "LINK", sim: "LINKUSDT", n: "Chainlink", c: "cripto", base: 22 },
  // acciones — Yahoo
  { id: "AAPL", sim: "AAPL", n: "Apple", c: "acciones", base: 348 },
  { id: "MSFT", sim: "MSFT", n: "Microsoft", c: "acciones", base: 512 },
  { id: "NVDA", sim: "NVDA", n: "NVIDIA", c: "acciones", base: 186 },
  { id: "TSLA", sim: "TSLA", n: "Tesla", c: "acciones", base: 412 },
  { id: "AMZN", sim: "AMZN", n: "Amazon", c: "acciones", base: 245 },
  { id: "GOOGL", sim: "GOOGL", n: "Alphabet", c: "acciones", base: 252 },
  { id: "META", sim: "META", n: "Meta", c: "acciones", base: 748 },
  { id: "JPM", sim: "JPM", n: "JPMorgan", c: "acciones", base: 302 },
  { id: "KO", sim: "KO", n: "Coca-Cola", c: "acciones", base: 69 },
  { id: "XOM", sim: "XOM", n: "Exxon Mobil", c: "acciones", base: 118 },
  // índices — Yahoo
  { id: "SPX", sim: "^GSPC", n: "S&P 500", c: "indices", base: 6820 },
  { id: "NDX", sim: "^IXIC", n: "Nasdaq", c: "indices", base: 23400 },
  { id: "DJI", sim: "^DJI", n: "Dow Jones", c: "indices", base: 47900 },
  { id: "DAX", sim: "^GDAXI", n: "DAX", c: "indices", base: 24100 },
  { id: "FTSE", sim: "^FTSE", n: "FTSE 100", c: "indices", base: 9650 },
  { id: "NIKKEI", sim: "^N225", n: "Nikkei 225", c: "indices", base: 49800 },
  // divisas — Yahoo (pares =)
  { id: "EURUSD", sim: "EURUSD=X", n: "Euro / Dólar", c: "divisas", base: 1.085 },
  { id: "GBPUSD", sim: "GBPUSD=X", n: "Libra / Dólar", c: "divisas", base: 1.272 },
  { id: "USDJPY", sim: "USDJPY=X", n: "Dólar / Yen", c: "divisas", base: 152.4 },
  { id: "AUDUSD", sim: "AUDUSD=X", n: "Dólar Aus. / Dólar", c: "divisas", base: 0.652 },
  { id: "USDMXN", sim: "USDMXN=X", n: "Dólar / Peso MX", c: "divisas", base: 18.4 },
  { id: "USDCHF", sim: "USDCHF=X", n: "Dólar / Franco", c: "divisas", base: 0.882 },
];

const IDX = new Map(UNIVERSO.map((d) => [d.id, d]));

// ── CACHE EN MEMORIA (buena vecindad con el upstream) ────────
const TTL_TICK_CRYPTO = 4000;
const TTL_TICK_YAHOO = 30000;
const TTL_VELAS = 45000;

let criptoCache: { ts: number; precios: Map<string, { p: number; d: number }> } | null = null;
let criptoChispa: { ts: number; data: Map<string, number[]> } | null = null;
const yahooCache = new Map<string, { ts: number; p: number; d: number; velas: Vela[] }>();
const velasCache = new Map<string, { ts: number; velas: Vela[]; f: string }>();

async function jget(url: string): Promise<unknown> {
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Vanguard/1.0" },
    signal: AbortSignal.timeout(6000),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// ── FALLBACK SIMULADO (sembrado por símbolo + minuto: estable) ──
function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const VOL_CLASE: Record<Clase, number> = { cripto: 0.0016, acciones: 0.0008, indices: 0.0004, divisas: 0.0002 };
function simularVelas(def: Def, precioFinal?: number): Vela[] {
  const rnd = mulberry32(hash32(def.id + "_" + Math.floor(Date.now() / 60000)));
  const vol = VOL_CLASE[def.c];
  const velas: Vela[] = [];
  const t0 = Math.floor(Date.now() / 60000) * 60 - 119 * 60;
  let p = precioFinal ? precioFinal * (1 - vol * 14) : def.base * (1 + (rnd() - 0.5) * 0.04);
  for (let i = 0; i < 120; i++) {
    const drift = (rnd() - 0.5) * 2 * vol;
    const o = p;
    p = Math.max(p * (1 + drift), def.base * 0.5);
    const h = Math.max(o, p) * (1 + rnd() * vol * 0.6);
    const l = Math.min(o, p) * (1 - rnd() * vol * 0.6);
    velas.push({ t: t0 + i * 60, o, h, l, c: p, v: Math.round(rnd() * 1000) + 50 });
  }
  return velas;
}

// ── GRIFO CRIPTO: Binance 24hr batch + klines para la chispa ──
async function criptoPrecios(): Promise<Map<string, { p: number; d: number }>> {
  if (criptoCache && Date.now() - criptoCache.ts < TTL_TICK_CRYPTO) return criptoCache.precios;
  try {
    const sims = UNIVERSO.filter((d) => d.c === "cripto").map((d) => d.sim);
    const raw = (await jget(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(sims))}`)) as Array<{ symbol: string; lastPrice: string; priceChangePercent: string }>;
    const precios = new Map<string, { p: number; d: number }>();
    for (const t of raw) precios.set(t.symbol, { p: parseFloat(t.lastPrice), d: parseFloat(t.priceChangePercent) });
    if (precios.size === 0) throw new Error("binance vacío");
    criptoCache = { ts: Date.now(), precios };
    // chispa: klines 1m (60 barras) por activo, refresco cada 60s
    if (!criptoChispa || Date.now() - criptoChispa.ts > 60000) {
      const data = new Map<string, number[]>();
      const defs = UNIVERSO.filter((d) => d.c === "cripto");
      const res = await Promise.allSettled(defs.map((d) => jget(`https://api.binance.com/api/v3/klines?symbol=${d.sim}&interval=1m&limit=60`)));
      defs.forEach((d, i) => {
        if (res[i].status === "fulfilled") {
          const ks = res[i].value as unknown[][];
          data.set(d.id, ks.map((k) => parseFloat(String(k[4]))));
        }
      });
      criptoChispa = { ts: Date.now(), data };
    }
    return precios;
  } catch {
    // grifo cortado: precios simulados estables por minuto
    const precios = new Map<string, { p: number; d: number }>();
    for (const d of UNIVERSO.filter((x) => x.c === "cripto")) {
      const rnd = mulberry32(hash32(d.id + Math.floor(Date.now() / 60000)));
      precios.set(d.sim, { p: d.base * (1 + (rnd() - 0.5) * 0.05), d: (rnd() - 0.5) * 8 });
    }
    return precios;
  }
}

// ── GRIFO YAHOO: un solo endpoint da precio + Δ% + velas 1m ──
async function yahooSim(def: Def): Promise<{ p: number; d: number; velas: Vela[] }> {
  const hit = yahooCache.get(def.id);
  if (hit && Date.now() - hit.ts < TTL_TICK_YAHOO) return hit;
  try {
    const raw = (await jget(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(def.sim)}?interval=1m&range=1d`)) as {
      chart?: { result?: Array<{ meta?: { regularMarketPrice?: number; chartPreviousClose?: number; previousClose?: number }; timestamp?: number[]; indicators?: { quote?: Array<{ close?: (number | null)[]; open?: (number | null)[]; high?: (number | null)[]; low?: (number | null)[]; volume?: (number | null)[] }> } }> };
    };
    const r0 = raw.chart?.result?.[0];
    if (!r0?.meta) throw new Error("yahoo sin meta");
    const p = Number(r0.meta.regularMarketPrice ?? 0);
    const prev = Number(r0.meta.chartPreviousClose ?? r0.meta.previousClose ?? p);
    const d = prev ? ((p - prev) / prev) * 100 : 0;
    const ts = r0.timestamp ?? [];
    const q = r0.indicators?.quote?.[0] ?? {};
    const velas: Vela[] = [];
    for (let i = 0; i < ts.length; i++) {
      const c = q.close?.[i], o = q.open?.[i], h = q.high?.[i], l = q.low?.[i];
      if (c == null || o == null || h == null || l == null) continue;
      velas.push({ t: ts[i], o, h, l, c, v: q.volume?.[i] ?? 0 });
    }
    const out = { p, d, velas };
    yahooCache.set(def.id, { ts: Date.now(), ...out });
    return out;
  } catch {
    const rnd = mulberry32(hash32(def.id + Math.floor(Date.now() / 60000)));
    const velas = simularVelas(def);
    const out = { p: velas[velas.length - 1].c, d: (rnd() - 0.5) * 3, velas };
    yahooCache.set(def.id, { ts: Date.now(), ...out });
    return out;
  }
}

// ── VELAS (para el gráfico) con cache propio ─────────────────
async function velasDe(def: Def): Promise<{ velas: Vela[]; f: string }> {
  const hit = velasCache.get(def.id);
  if (hit && Date.now() - hit.ts < TTL_VELAS) return { velas: hit.velas, f: hit.f };
  let velas: Vela[] = [];
  let f = "sim";
  try {
    if (def.c === "cripto") {
      const ks = (await jget(`https://api.binance.com/api/v3/klines?symbol=${def.sim}&interval=1m&limit=120`)) as unknown[][];
      velas = ks.map((k) => ({ t: Math.floor(Number(k[0]) / 1000), o: parseFloat(String(k[1])), h: parseFloat(String(k[2])), l: parseFloat(String(k[3])), c: parseFloat(String(k[4])), v: parseFloat(String(k[5])) }));
      f = "binance";
    } else {
      const y = await yahooSim(def);
      velas = y.velas;
      f = "yahoo";
    }
    if (velas.length < 10) throw new Error("velas insuficientes");
  } catch {
    const act = hit?.velas[hit.velas.length - 1]?.c;
    velas = simularVelas(def, act);
    f = "sim";
  }
  velasCache.set(def.id, { ts: Date.now(), velas, f });
  return { velas, f };
}

// ── TICKER COMPACTO ──────────────────────────────────────────
function chispaDe(def: Def, velas: Vela[]): number[] {
  if (def.c === "cripto") return criptoChispa?.data.get(def.id) ?? [];
  const cs = velas.map((v) => v.c);
  return cs.slice(-60);
}

async function tickers(): Promise<Ticker[]> {
  const cripto = await criptoPrecios();
  const yahDef = UNIVERSO.filter((d) => d.c !== "cripto");
  const yah = await Promise.all(yahDef.map((d) => yahooSim(d)));
  const out: Ticker[] = [];
  for (const def of UNIVERSO) {
    if (def.c === "cripto") {
      const k = cripto.get(def.sim);
      if (!k) continue;
      out.push({ id: def.id, s: def.sim, n: def.n, c: def.c, p: k.p, d: k.d, ch: chispaDe(def, []), f: "binance" });
    }
  }
  yahDef.forEach((def, i) => {
    const y = yah[i];
    out.push({ id: def.id, s: def.sim, n: def.n, c: def.c, p: y.p, d: y.d, ch: chispaDe(def, y.velas), f: "yahoo" });
  });
  return out;
}

// ── RUTA ─────────────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const def = IDX.get(id.toUpperCase());
      if (!def) return NextResponse.json({ ok: false, error: "activo desconocido" }, { status: 404 });
      const { velas, f } = await velasDe(def);
      const cripto = def.c === "cripto" ? (await criptoPrecios()).get(def.sim) : undefined;
      const y = def.c === "cripto" ? null : await yahooSim(def);
      const activo: Ticker = {
        id: def.id, s: def.sim, n: def.n, c: def.c,
        p: cripto?.p ?? y?.p ?? velas[velas.length - 1]?.c ?? def.base,
        d: cripto?.d ?? y?.d ?? 0,
        ch: chispaDe(def, velas), f,
      };
      return NextResponse.json({ ok: true, ts: Date.now(), activo, velas });
    }
    const lista = await tickers();
    // v196.0 EL POZO ÚNICO — MERCADO A DIETA: el latido general viaja cada 9s;
    // la chispa de la cinta se dibuja igual con 14 puntos que con 60, pero la
    // respuesta cae de ~32KB a ~12KB (≈21MB/hora quemados en móvil → ~7MB).
    // El gráfico detallado NO se toca: pide ?id= y recibe la historia completa.
    const ligera = lista.map((t) => ({ ...t, ch: Array.isArray(t.ch) ? t.ch.slice(-14) : t.ch }));
    return NextResponse.json({ ok: true, ts: Date.now(), activos: ligera });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "fallo de mercado" }, { status: 500 });
  }
}
