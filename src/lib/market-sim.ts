"use client";

// Vanguard v6.2 — BOLSA GEOPOLITICA: exchange de paises estilo criptomoneda.
// Motor en tiempo real: random walk gaussiano + eventos de mercado cada ~40s,
// velas OHLC por temporalidad (sinteticas deterministicas + agregacion en vivo),
// libro de ordenes, feed de operaciones y persistencia en localStorage.

export interface CountryAsset {
  id: string;        // ticker estilo cripto
  name: string;      // pais
  flag: string;      // codigo ISO para FlagBadge
  base: number;      // precio base
  vol: number;       // volatilidad por tick (1s)
  drift: number;     // tendencia estructural por tick
  mcap: number;      // capitalizacion de mercado (miles de millones de mon)
  sector: "POTENCIA" | "EMERGENTE" | "FRONTERA";
  desc: string;
}

// 34 paises — solo paises, cada uno su "cripto soberana"
export const ASSETS: CountryAsset[] = [
  { id: "USDX", name: "Estados Unidos", flag: "US", base: 100, vol: 0.0035, drift: 0.00025, mcap: 27000, sector: "POTENCIA", desc: "Reserva mundial. Baja volatilidad, crecimiento estable." },
  { id: "CNYN", name: "China", flag: "CN", base: 71, vol: 0.005, drift: 0.0003, mcap: 18000, sector: "POTENCIA", desc: "Fabrica del mundo. Sensible a tension en el estrecho." },
  { id: "JPYN", name: "Japon", flag: "JP", base: 88, vol: 0.0035, drift: 0.00015, mcap: 4200, sector: "POTENCIA", desc: "Tecnologia y robotica. Refugio asiatico." },
  { id: "DEUM", name: "Alemania", flag: "DE", base: 79, vol: 0.004, drift: 0.0002, mcap: 4500, sector: "POTENCIA", desc: "Motor industrial europeo. Energia y automocion." },
  { id: "GBRC", name: "Reino Unido", flag: "GB", base: 62, vol: 0.004, drift: 0.00018, mcap: 3400, sector: "POTENCIA", desc: "Finanzas de la City. Servicios e intel." },
  { id: "FRFE", name: "Francia", flag: "FR", base: 66, vol: 0.004, drift: 0.00018, mcap: 3100, sector: "POTENCIA", desc: "Nuclear, aeroespacial y lujo. Estable con huelgas." },
  { id: "INRA", name: "India", flag: "IN", base: 45, vol: 0.006, drift: 0.00045, mcap: 3900, sector: "EMERGENTE", desc: "Demografia imparable. Servicios y defensa." },
  { id: "KRSA", name: "Corea del Sur", flag: "KR", base: 58, vol: 0.005, drift: 0.0003, mcap: 1800, sector: "EMERGENTE", desc: "Semiconductores. Riesgo: vecino del norte." },
  { id: "BRZL", name: "Brasil", flag: "BR", base: 33, vol: 0.007, drift: 0.00025, mcap: 2200, sector: "EMERGENTE", desc: "Agro y litio. Volatil con Amazonia en juego." },
  { id: "CAND", name: "Canada", flag: "CA", base: 71, vol: 0.003, drift: 0.0002, mcap: 2200, sector: "POTENCIA", desc: "Petroleo, madera y mineras. Refugio norteamericano." },
  { id: "AUSD", name: "Australia", flag: "AU", base: 64, vol: 0.0035, drift: 0.00022, mcap: 1750, sector: "POTENCIA", desc: "Hierro y litio. Barometro de la demanda china." },
  { id: "RUBR", name: "Rusia", flag: "RU", base: 12, vol: 0.014, drift: -0.0001, mcap: 2000, sector: "FRONTERA", desc: "Sancionada. Petroleo sombra y gas." },
  { id: "MXPL", name: "Mexico", flag: "MX", base: 40, vol: 0.008, drift: 0.00028, mcap: 1800, sector: "EMERGENTE", desc: "Nearshoring brutal. Presion de carteles." },
  { id: "ESPA", name: "Espana", flag: "ES", base: 57, vol: 0.0045, drift: 0.00018, mcap: 1700, sector: "POTENCIA", desc: "Turismo, renovables y hortalizas de Europa." },
  { id: "ITAL", name: "Italia", flag: "IT", base: 54, vol: 0.0045, drift: 0.00016, mcap: 2300, sector: "POTENCIA", desc: "Maquinaria, moda y deuda soberana clasica." },
  { id: "IDNR", name: "Indonesia", flag: "ID", base: 26, vol: 0.007, drift: 0.00035, mcap: 1400, sector: "EMERGENTE", desc: "Niquel y palma. Archipielago con crecimiento." },
  { id: "SAUR", name: "Arabia Saudita", flag: "SA", base: 31, vol: 0.007, drift: 0.0002, mcap: 1100, sector: "EMERGENTE", desc: "Grifo del mundo. Vision 2030 en marcha." },
  { id: "TRKX", name: "Turquia", flag: "TR", base: 18, vol: 0.012, drift: 0.00015, mcap: 1150, sector: "FRONTERA", desc: "Puente OTAN-Rusia. Inflacion cronica." },
  { id: "NLDE", name: "Paises Bajos", flag: "NL", base: 68, vol: 0.0035, drift: 0.0002, mcap: 1150, sector: "POTENCIA", desc: "Puerta logística de Europa. ASML inside." },
  { id: "CHFF", name: "Suiza", flag: "CH", base: 92, vol: 0.0028, drift: 0.00022, mcap: 950, sector: "POTENCIA", desc: "Banco del mundo. La volatilidad mas baja." },
  { id: "PLNZ", name: "Polonia", flag: "PL", base: 36, vol: 0.006, drift: 0.00025, mcap: 850, sector: "EMERGENTE", desc: "Escudo del este. Growth industrial fuerte." },
  { id: "SEKK", name: "Suecia", flag: "SE", base: 61, vol: 0.004, drift: 0.0002, mcap: 620, sector: "POTENCIA", desc: "Innovacion nordica. Forestacion y defensa." },
  { id: "ARGB", name: "Argentina", flag: "AR", base: 15, vol: 0.016, drift: 0.0001, mcap: 640, sector: "FRONTERA", desc: "Montana rusa fiscal. Litio y soja." },
  { id: "NGAR", name: "Nigeria", flag: "NG", base: 22, vol: 0.010, drift: 0.0002, mcap: 470, sector: "EMERGENTE", desc: "Petroleo y demografia. Boko Haram en el flanco." },
  { id: "AEDE", name: "Emiratos Arabes", flag: "AE", base: 48, vol: 0.006, drift: 0.00028, mcap: 510, sector: "EMERGENTE", desc: "Hub del Golfo. Oro, puertos e IA." },
  { id: "ILSS", name: "Israel", flag: "IL", base: 44, vol: 0.009, drift: 0.00015, mcap: 520, sector: "EMERGENTE", desc: "Startup nation. Cúpula y ciberseguridad." },
  { id: "EGRP", name: "Egipto", flag: "EG", base: 14, vol: 0.012, drift: 0.0001, mcap: 400, sector: "FRONTERA", desc: "Canal de Suez. Peaje geopolitico puro." },
  { id: "ZAFR", name: "Sudáfrica", flag: "ZA", base: 19, vol: 0.011, drift: 0.00012, mcap: 380, sector: "EMERGENTE", desc: "Platino, oro y cortes de luz recurrentes." },
  { id: "IRNR", name: "Iran", flag: "IR", base: 8, vol: 0.018, drift: -0.00005, mcap: 400, sector: "FRONTERA", desc: "Maximo riesgo. Nuclear, sanciones, proxy wars." },
  { id: "VNMD", name: "Vietnam", flag: "VN", base: 21, vol: 0.008, drift: 0.0004, mcap: 470, sector: "EMERGENTE", desc: "La fabrica que escala. Exportacion brutal." },
  { id: "COLP", name: "Colombia", flag: "CO", base: 17, vol: 0.010, drift: 0.00015, mcap: 380, sector: "FRONTERA", desc: "Petroleo y cafe. Paz fragil en el Cauca." },
  { id: "CLPE", name: "Chile", flag: "CL", base: 29, vol: 0.008, drift: 0.0002, mcap: 340, sector: "EMERGENTE", desc: "Rey del cobre. Litio del Atacama." },
  { id: "PKRR", name: "Pakistan", flag: "PK", base: 10, vol: 0.013, drift: 0.00008, mcap: 340, sector: "FRONTERA", desc: "Nuclear endeudado. Balanza con el vecino grande." },
  { id: "PHPR", name: "Filipinas", flag: "PH", base: 23, vol: 0.009, drift: 0.0003, mcap: 450, sector: "EMERGENTE", desc: "Remesas y BPO. Mar del Sur en disputa." },
];

export interface MarketEvent {
  id: string;
  ts: number;
  headline: string;
  impact: string[]; // asset ids afectados
  severity: number; // 1-3
}

export interface AssetState {
  price: number;
  prev: number; // precio al inicio de la sesion (para % 24h)
  history: number[]; // ultimos N precios para sparkline
  dayHigh: number;
  dayLow: number;
  volume: number; // volumen simulado
  change24h: number; // % variacion 24h
}

export interface LiveTrade {
  id: string;
  ts: number;
  price: number;
  qty: number;
  side: "BUY" | "SELL";
}

export interface Candle {
  time: number; // segundos UNIX (apertura del bucket)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BookLevel {
  price: number;
  qty: number;
  cum: number;
}

export interface MarketState {
  assets: Record<string, AssetState>;
  events: MarketEvent[]; // ultimos eventos
  tradeFeed: Record<string, LiveTrade[]>; // feed de operaciones en vivo por activo
  lastTick: number;
  tickCount: number;
}

export const TIMEFRAMES: Record<string, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1H": 3600,
  "4H": 14400,
  "1D": 86400,
};
export type TimeframeKey = keyof typeof TIMEFRAMES;

const HISTORY_MAX = 80;
const EVENTS_MAX = 24;
const TRADES_PER_ASSET = 28;
const TICK_MS = 1000;
const SAVE_KEY = "vanguard-market-v2";
const RESUME_WINDOW_MS = 30 * 60 * 1000; // si la partida guardada tiene < 30 min, continuar
const SYNTH_CANDLES = 200;

// ---------- PRNG determinista ----------
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// gaussiana estandar a partir de PRNG uniforme (Box-Muller)
function gaussFrom(rnd: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function gauss(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

interface EventTemplate {
  headline: string;
  impact: string[];
  minShock: number;
  maxShock: number;
  severity: number;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  { headline: "Banco central recorta tasas de emergencia", impact: ["USDX", "DEUM", "GBRC"], minShock: 0.02, maxShock: 0.06, severity: 2 },
  { headline: "Hallazgo gigante de litio enciende la euforia minera", impact: ["ARGB", "CLPE", "MXPL"], minShock: 0.06, maxShock: 0.14, severity: 3 },
  { headline: "Sanciones del consejo de seguridad endurecen el bloqueo", impact: ["RUBR", "IRNR"], minShock: -0.12, maxShock: -0.05, severity: 3 },
  { headline: "Tregua firmada: los mercados respiran", impact: ["ILSS", "IRNR", "TRKX"], minShock: 0.05, maxShock: 0.15, severity: 2 },
  { headline: "Ataque a buque tanquero dispara la prima de riesgo", impact: ["IRNR", "SAUR", "EGRP"], minShock: -0.08, maxShock: -0.03, severity: 3 },
  { headline: "Cifra de PIB supera toda proyeccion", impact: ["INRA", "CNYN", "VNMD"], minShock: 0.04, maxShock: 0.09, severity: 2 },
  { headline: "Crisis de deuda soberana: rebaja de calificacion", impact: ["ARGB", "TRKX", "PKRR"], minShock: -0.11, maxShock: -0.04, severity: 3 },
  { headline: "Boom de semiconductores: pedidos record de chips", impact: ["KRSA", "JPYN", "NLDE"], minShock: 0.05, maxShock: 0.11, severity: 2 },
  { headline: "Escalada en la frontera: reservas movilizadas", impact: ["KRSA", "CNYN", "JPYN"], minShock: -0.07, maxShock: -0.02, severity: 2 },
  { headline: "Nearshoring: nuevas fabricas anuncian inversion masiva", impact: ["MXPL", "USDX", "VNMD"], minShock: 0.04, maxShock: 0.10, severity: 2 },
  { headline: "Ofensiva contra carteles despliega al ejercito federal", impact: ["MXPL", "COLP"], minShock: -0.06, maxShock: -0.01, severity: 2 },
  { headline: "Fusion nuclear alcanza neto positivo sostenido", impact: ["USDX", "JPYN", "CHFF"], minShock: 0.03, maxShock: 0.08, severity: 1 },
  { headline: "Ola de violencia urbana frena el turismo", impact: ["BRZL", "NGAR", "COLP"], minShock: -0.06, maxShock: -0.02, severity: 1 },
  { headline: "Acuerdo comercial historico entre bloques emergentes", impact: ["INRA", "BRZL", "NGAR"], minShock: 0.04, maxShock: 0.10, severity: 2 },
  { headline: "Eleccion sorpresa: mercados al borde del panico", impact: ["TRKX", "ARGB", "EGRP"], minShock: -0.10, maxShock: -0.04, severity: 3 },
  { headline: "Vaca Muerta: exportaciones de gas baten records", impact: ["ARGB", "BRZL"], minShock: 0.03, maxShock: 0.09, severity: 1 },
  { headline: "OPEP+ recorta cuotas sin aviso: crudo al alza", impact: ["SAUR", "AEDE", "NGAR"], minShock: 0.05, maxShock: 0.12, severity: 2 },
  { headline: "Cobre toca maximos historicos por demanda verde", impact: ["CLPE", "AUSD", "CAND"], minShock: 0.04, maxShock: 0.10, severity: 2 },
  { headline: "Ciberataque masivo a puertos logisticos", impact: ["NLDE", "AEDE", "PHPR"], minShock: -0.05, maxShock: -0.02, severity: 2 },
  { headline: "Corte total de energia paraliza la industria", impact: ["ZAFR", "EGRP", "PKRR"], minShock: -0.09, maxShock: -0.03, severity: 3 },
  { headline: "Acuerdo de agua y energia desbloquea represas", impact: ["EGRP", "IRNR", "PKRR"], minShock: 0.04, maxShock: 0.09, severity: 1 },
  { headline: "Panic selling: fondos huyen de frontera", impact: ["IRNR", "ARGB", "PKRR", "NGAR"], minShock: -0.13, maxShock: -0.06, severity: 3 },
];

function makeAssetState(base: number): AssetState {
  const start = base * (0.94 + Math.random() * 0.12);
  return {
    price: start,
    prev: start,
    history: Array.from({ length: 40 }, () => start * (1 + (Math.random() - 0.5) * 0.004)),
    dayHigh: start,
    dayLow: start,
    volume: Math.round(500000 + Math.random() * 4000000),
    change24h: 0,
  };
}

class MarketSim {
  state: MarketState;
  private listeners = new Set<() => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private eventTimer = 0;
  private saveCounter = 0;
  private started = false;
  private tickCloses: Record<string, { t: number; p: number; v: number }[]> = {};
  private candleCache = new Map<string, Candle[]>();
  private lastBucket: Record<string, number> = {}; // assetId -> bucket abierto actual por tf? no: manejamos por cierre

  constructor() {
    this.state = { assets: {}, events: [], tradeFeed: {}, lastTick: Date.now(), tickCount: 0 };
  }

  init() {
    if (this.started) return;
    this.started = true;
    if (typeof window === "undefined") return;
    if (!this.loadSave()) {
      for (const a of ASSETS) {
        this.state.assets[a.id] = makeAssetState(a.base);
      }
      this.recomputeChanges();
    }
    // tickCloses inicial: sembrar con el precio actual
    for (const a of ASSETS) {
      this.tickCloses[a.id] = [];
      this.state.tradeFeed[a.id] = [];
    }
    this.timer = setInterval(() => this.tick(), TICK_MS);
    // v11: pausa del motor cuando la pestana esta oculta (bateria + CPU en movil)
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          if (this.timer) { clearInterval(this.timer); this.timer = null; }
        } else if (!this.timer && this.started) {
          this.timer = setInterval(() => this.tick(), TICK_MS);
        }
      });
    }
  }

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };

  getState = () => this.state;

  private emit() {
    // nueva identidad de estado por tick para useSyncExternalStore
    this.state = { ...this.state };
    for (const l of this.listeners) l();
  }

  private recomputeChanges() {
    for (const a of ASSETS) {
      const st = this.state.assets[a.id];
      if (!st || !st.prev) continue;
      st.change24h = ((st.price - st.prev) / st.prev) * 100;
    }
  }

  // ---------- VELAS OHLC ----------
  // Sinteticas: caminata determinista por (asset, tf) con vol escalada a la temporalidad,
  // re-escaladas para terminar cerca del precio actual. En vivo: agregamos tickCloses.
  getCandles(assetId: string, tfKey: string): Candle[] {
    const asset = ASSETS.find((a) => a.id === assetId);
    if (!asset) return [];
    const tfSec = TIMEFRAMES[tfKey] ?? 60;
    const st = this.state.assets[assetId];
    if (!st) return [];
    const now = Math.floor(Date.now() / 1000);
    const curBucket = Math.floor(now / tfSec) * tfSec;

    // cache de caminata sintetica cruda (sin escalar)
    const cacheKey = `${assetId}:${tfKey}`;
    let raw = this.candleCache.get(cacheKey);
    if (!raw) {
      raw = this.generateSynthetic(asset, tfSec, SYNTH_CANDLES, curBucket);
      this.candleCache.set(cacheKey, raw);
    }

    // parte en vivo: closes de ticks agrupados en buckets >= primer bucket vivo
    const live = this.aggregateLive(assetId, tfSec, curBucket, SYNTH_CANDLES);
    const firstLiveTime = live.length > 0 ? live[0].time : curBucket;

    // factor de escala: la ultima sintetica debe cerrar donde empieza la parte viva
    const synth = raw.filter((c) => c.time < firstLiveTime).map((c) => ({ ...c }));
    const anchor = live.length > 0 ? live[0].open : st.price;
    if (synth.length > 0) {
      const lastClose = synth[synth.length - 1].close;
      const k = lastClose > 0 ? anchor / lastClose : 1;
      for (const c of synth) {
        c.open *= k;
        c.high *= k;
        c.low *= k;
        c.close *= k;
      }
    }
    return [...synth, ...live];
  }

  private generateSynthetic(asset: CountryAsset, tfSec: number, count: number, endBucket: number): Candle[] {
    const seedFn = xmur3(`${asset.id}|candles|${tfSec}`);
    const rnd = mulberry32(seedFn());
    // sigma por vela: proporcional a sqrt(tf), amortiguado y acotado para estetica realista
    const sigma = Math.min(0.055, asset.vol * Math.sqrt(tfSec) * 0.28 + 0.002);
    const candles: Candle[] = [];
    let price = asset.base * (0.85 + rnd() * 0.3);
    const start = endBucket - count * tfSec;
    for (let i = 0; i < count; i++) {
      const t = start + i * tfSec;
      const open = price;
      // micro-tendencia por regimenes para que se vean rachas reales
      const regime = gaussFrom(rnd) * 0.35;
      let high = open;
      let low = open;
      let close = open;
      for (let s = 0; s < 6; s++) {
        close *= 1 + regime * 0.02 + sigma * gaussFrom(rnd) * 0.4;
        if (close > high) high = close;
        if (close < low) low = close;
      }
      // mean reversion suave hacia la base
      close += (asset.base - close) * 0.02;
      high = Math.max(high, close);
      low = Math.min(low, close);
      const volBase = asset.mcap / 900 + 20000;
      const volume = Math.round(volBase * (0.5 + rnd() * 1.2) * (1 + Math.abs(close - open) / Math.max(0.0001, open) * 18));
      candles.push({ time: t, open, high, low, close, volume });
      price = close;
    }
    return candles;
  }

  private aggregateLive(assetId: string, tfSec: number, curBucket: number, maxCount: number): Candle[] {
    const ticks = this.tickCloses[assetId] ?? [];
    if (ticks.length === 0) return [];
    const map = new Map<number, Candle>();
    for (const tk of ticks) {
      const b = Math.floor(tk.t / tfSec) * tfSec;
      const c = map.get(b);
      if (c) {
        c.high = Math.max(c.high, tk.p);
        c.low = Math.min(c.low, tk.p);
        c.close = tk.p;
        c.volume += tk.v;
      } else {
        map.set(b, { time: b, open: tk.p, high: tk.p, low: tk.p, close: tk.p, volume: tk.v });
      }
    }
    const arr = [...map.values()].sort((a, b) => a.time - b.time);
    // asegurar bucket actual presente (aunque sin ticks previos)
    if (arr.length === 0 || arr[arr.length - 1].time !== curBucket) {
      const st = this.state.assets[assetId];
      if (st) {
        const prevClose = arr.length > 0 ? arr[arr.length - 1].close : st.price;
        arr.push({ time: curBucket, open: prevClose, high: Math.max(prevClose, st.price), low: Math.min(prevClose, st.price), close: st.price, volume: 0 });
      }
    }
    return arr.slice(-maxCount);
  }

  // ---------- LIBRO DE ORDENES ----------
  getBook(assetId: string): { bids: BookLevel[]; asks: BookLevel[]; spread: number } {
    const st = this.state.assets[assetId];
    const asset = ASSETS.find((a) => a.id === assetId);
    if (!st || !asset) return { bids: [], asks: [], spread: 0 };
    const sec = Math.floor(Date.now() / 1000);
    const rnd = mulberry32(xmur3(`${assetId}|book|${sec}`)());
    const spreadPct = 0.0004 + asset.vol * 0.25;
    const spread = st.price * spreadPct;
    const step = spread / 2 + st.price * 0.0006;
    const liq = asset.mcap / 2200 + 180;
    const bids: BookLevel[] = [];
    const asks: BookLevel[] = [];
    let cumB = 0;
    let cumA = 0;
    for (let i = 0; i < 11; i++) {
      const qb = Math.round(liq * (0.3 + rnd() * 1.4) * (1 + i * 0.35));
      const qa = Math.round(liq * (0.3 + rnd() * 1.4) * (1 + i * 0.35));
      cumB += qb;
      cumA += qa;
      bids.push({ price: st.price - spread / 2 - i * step, qty: qb, cum: cumB });
      asks.push({ price: st.price + spread / 2 + i * step, qty: qa, cum: cumA });
    }
    return { bids, asks, spread };
  }

  private pushTrade(assetId: string, side: "BUY" | "SELL", price: number, qty: number) {
    const feed = this.state.tradeFeed[assetId] ?? (this.state.tradeFeed[assetId] = []);
    feed.unshift({ id: `${assetId}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, ts: Date.now(), price, qty, side });
    if (feed.length > TRADES_PER_ASSET) feed.pop();
  }

  private tick() {
    const s = this.state;
    s.tickCount += 1;
    s.lastTick = Date.now();
    const nowSec = Math.floor(Date.now() / 1000);

    for (const a of ASSETS) {
      const st = s.assets[a.id];
      if (!st) continue;
      const r = a.drift + a.vol * gauss();
      let next = st.price * (1 + r);
      // micro-mean-reversion hacia la base para evitar deriva infinita
      next += (a.base * 0.9 - next) * 0.0004;
      if (next < a.base * 0.25) next = a.base * 0.25;
      st.price = next;
      st.history.push(next);
      if (st.history.length > HISTORY_MAX) st.history.shift();
      if (next > st.dayHigh) st.dayHigh = next;
      if (next < st.dayLow) st.dayLow = next;
      const tickVol = Math.round((a.mcap / 900 + 400) * (0.2 + Math.abs(gauss()) * 0.8));
      st.volume += tickVol;

      // registrar close de tick para velas en vivo
      const tc = this.tickCloses[a.id] ?? (this.tickCloses[a.id] = []);
      tc.push({ t: nowSec, p: next, v: tickVol });
      if (tc.length > 4000) tc.splice(0, tc.length - 4000);

      // feed de operaciones en vivo (probabilidad por activo)
      if (Math.random() < 0.38) {
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n; i++) {
          const side: "BUY" | "SELL" = Math.random() < 0.5 + a.drift * 400 ? "BUY" : "SELL";
          const px = next * (1 + (Math.random() - 0.5) * 0.0008);
          const qy = Math.max(1, Math.round((a.mcap / 4000 + 20) * (0.2 + Math.random() * 1.8)));
          this.pushTrade(a.id, side, px, qy);
        }
      }
    }
    this.recomputeChanges();

    // eventos de mercado
    this.eventTimer -= 1;
    if (this.eventTimer <= 0) {
      this.eventTimer = 34 + Math.floor(Math.random() * 36);
      const tpl = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
      const validImpact = tpl.impact.filter((id) => !!s.assets[id]);
      const ev: MarketEvent = {
        id: `E-${Date.now()}`,
        ts: Date.now(),
        headline: tpl.headline,
        impact: validImpact,
        severity: tpl.severity,
      };
      for (const aid of validImpact) {
        const st = s.assets[aid];
        if (!st) continue;
        const shock = tpl.minShock + Math.random() * (tpl.maxShock - tpl.minShock);
        const base = ASSETS.find((x) => x.id === aid)!.base;
        st.price = Math.max(base * 0.25, st.price * (1 + shock));
        st.history.push(st.price);
        if (st.history.length > HISTORY_MAX) st.history.shift();
        if (st.price > st.dayHigh) st.dayHigh = st.price;
        if (st.price < st.dayLow) st.dayLow = st.price;
        const tc = this.tickCloses[aid] ?? (this.tickCloses[aid] = []);
        tc.push({ t: nowSec, p: st.price, v: Math.round(base * 900) });
        this.pushTrade(aid, shock >= 0 ? "BUY" : "SELL", st.price, Math.round(base * 3 + 50));
      }
      s.events.unshift(ev);
      if (s.events.length > EVENTS_MAX) s.events.pop();
    }

    this.saveCounter += 1;
    if (this.saveCounter % 8 === 0) this.save();
    this.emit();
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      const snap: Record<string, { price: number; prev: number; history: number[]; volume: number }> = {};
      for (const a of ASSETS) {
        const st = this.state.assets[a.id];
        if (!st) continue;
        snap[a.id] = { price: st.price, prev: st.prev, history: st.history.slice(-40), volume: st.volume };
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify({ ts: Date.now(), tickCount: this.state.tickCount, snap }));
    } catch {
      /* storage lleno o bloqueado */
    }
  }

  private loadSave(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw) as {
        ts: number;
        tickCount: number;
        snap: Record<string, { price: number; prev: number; history: number[]; volume: number }>;
      };
      if (!data.snap || Date.now() - data.ts > RESUME_WINDOW_MS) return false;
      this.state.tickCount = data.tickCount ?? 0;
      for (const a of ASSETS) {
        const saved = data.snap[a.id];
        if (saved && saved.price > 0) {
          this.state.assets[a.id] = {
            price: saved.price,
            prev: saved.prev ?? saved.price,
            history: saved.history ?? [],
            dayHigh: Math.max(saved.price, ...(saved.history ?? [0])),
            dayLow: Math.min(saved.price, ...(saved.history?.length ? saved.history : [saved.price])),
            volume: saved.volume ?? 1000000,
            change24h: 0,
          };
        } else {
          this.state.assets[a.id] = makeAssetState(a.base);
        }
      }
      this.recomputeChanges();
      return true;
    } catch {
      return false;
    }
  }

  reset() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SAVE_KEY);
    this.state = { assets: {}, events: [], tradeFeed: {}, lastTick: Date.now(), tickCount: 0 };
    for (const a of ASSETS) {
      this.state.assets[a.id] = makeAssetState(a.base);
      this.tickCloses[a.id] = [];
      this.state.tradeFeed[a.id] = [];
    }
    this.candleCache.clear();
    this.recomputeChanges();
    this.emit();
  }
}

// singleton global (sobrevive al hot-reload de paneles)
const g = globalThis as unknown as { __vanguardMarket?: MarketSim };
export const marketSim: MarketSim = g.__vanguardMarket ?? new MarketSim();
g.__vanguardMarket = marketSim;

export function formatPrice(p: number): string {
  return p.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatVolume(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return String(v);
}

export function formatClock(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}
