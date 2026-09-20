// Vanguard v12 — BETNACION: motor de casa de apuestas estilo sportsbook real.
// Ligas de futbol simuladas + eleccion presidencial + frentes de guerra.
// Cuotas derivadas de probabilidades con margen de la casa (6%), drift en vivo,
// liquidacion automatica al finalizar, cashout en apuestas simples en vivo.

export type BkKind = "FUTBOL" | "ELECCION" | "GUERRA";
export type BkStatus = "PROXIMO" | "EN_VIVO" | "FINALIZADO";

export interface BkChoice {
  key: string;
  label: string;
  prob: number; // probabilidad real del motor (sin margen)
  odd: number;  // cuota con margen
}

export interface BkMarket {
  key: string; // "1X2" | "DOBLE" | "OU25" | "HCP" | "EXACTO" | "WINNER"
  label: string;
  choices: BkChoice[];
}

export interface BkEvent {
  id: string;
  kind: BkKind;
  comp: string;            // competicion / contexto
  title: string;           // "RIVER FEDERAL vs REAL CORDILLERA"
  sides: string[];         // etiquetas de las selecciones de WINNER
  startAt: number;         // ms epoch
  status: BkStatus;
  minute: number;          // futbol en vivo
  hs: number; as: number;  // marcador
  corners: [number, number];
  cards: [number, number];
  xg: [number, number];    // goles esperados (fuerza de momento)
  events: string[];        // feed de momentos
  markets: BkMarket[];
  drawn?: boolean;         // para ELECCION/GUERRA: ganador ya sorteado
}

export interface BkLeg {
  eventId: string;
  eventTitle: string;
  marketKey: string;
  marketLabel: string;
  choiceKey: string;
  choiceLabel: string;
  odd: number;
}

export interface BkTicket {
  id: string;
  placedAt: number;
  legs: BkLeg[];
  stake: number;
  potential: number;
  status: "ABIERTA" | "GANADA" | "PERDIDA" | "COBRADA";
  payout: number;
  settledAt?: number;
  cashedAtStatus?: string; // estado del evento al cobrar (cashout)
}

// ====== EQUIPOS (ficticios, estilo clubes de potencia) ======
interface BkTeam { id: string; name: string; short: string; str: number; }

const LIGA_A: BkTeam[] = [
  { id: "riv", name: "River Federal", short: "RIV", str: 86 },
  { id: "cor", name: "Real Cordillera", short: "COR", str: 84 },
  { id: "atl", name: "Atlantico FC", short: "ATL", str: 81 },
  { id: "uni", name: "Union del Sur", short: "UNI", str: 78 },
  { id: "arm", name: "Arsenal Norte", short: "ARM", str: 76 },
  { id: "def", name: "Defensores Norte", short: "DEF", str: 74 },
  { id: "oly", name: "Olympia Verde", short: "OLY", str: 72 },
  { id: "cit", name: "Ciudad Capital", short: "CIT", str: 70 },
];
const LIGA_B: BkTeam[] = [
  { id: "imp", name: "Imperio SC", short: "IMP", str: 83 },
  { id: "leg", name: "Legion Andina", short: "LEG", str: 80 },
  { id: "vig", name: "Vigia del Litoral", short: "VIG", str: 77 },
  { id: "fue", name: "Fuego Austral", short: "FUE", str: 75 },
  { id: "mar", name: "Maritima del Este", short: "MAR", str: 73 },
  { id: "cue", name: "Cuenca Dorada", short: "CUE", str: 71 },
  { id: "pio", name: "Pioneros del Valle", short: "PIO", str: 69 },
  { id: "for", name: "Fortin del Norte", short: "FOR", str: 67 },
];

export const BK_TEAMS = [...LIGA_A, ...LIGA_B];

const MARGEN = 0.94; // payout de la casa (6% de margen total)

function rnd(a: number, b: number) { return a + Math.random() * (b - a); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// ====== PROBABILIDADES Y CUOTAS ======
export function poissonP(k: number, lambda: number): number {
  let f = 1; for (let i = 2; i <= k; i++) f *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / f;
}

export function footballMarkets(xh: number, xa: number): BkMarket[] {
  // probabilidades exactas por marcador (0..6)
  const px: number[][] = [];
  for (let h = 0; h <= 6; h++) { px[h] = []; for (let a = 0; a <= 6; a++) px[h][a] = poissonP(h, xh) * poissonP(a, xa); }
  let pH = 0, pD = 0, pA = 0, pO = 0, pH1 = 0, p12 = 0, pX2 = 0;
  const exact: { key: string; label: string; prob: number }[] = [];
  const topScores = [[1, 0], [2, 1], [1, 1], [0, 0], [2, 0], [0, 1]];
  for (let h = 0; h <= 6; h++) for (let a = 0; a <= 6; a++) {
    const p = px[h][a];
    if (h > a) pH += p; else if (h === a) pD += p; else pA += p;
    if (h + a > 2) pO += p;
    if (h - a >= 2) pH1 += p;
    if (h > a || (h === a && h > 0)) p12 += p;
    if (a > h || (h === a && a > 0)) pX2 += p;
  }
  for (const [h, a] of topScores) exact.push({ key: `E${h}${a}`, label: `${h}-${a}`, prob: px[h][a] });
  const odd = (p: number) => Math.max(1.02, Math.round((1 / Math.max(p, 0.01)) * MARGEN * 100) / 100);
  return [
    { key: "1X2", label: "1X2", choices: [
      { key: "1", label: "GANA LOCAL", prob: pH, odd: odd(pH) },
      { key: "X", label: "EMPATE", prob: pD, odd: odd(pD) },
      { key: "2", label: "GANA VISITA", prob: pA, odd: odd(pA) },
    ]},
    { key: "DOBLE", label: "Doble oportunidad", choices: [
      { key: "1X", label: "LOCAL O EMPATE", prob: pH + pD, odd: odd(pH + pD) },
      { key: "12", label: "LOCAL O VISITA", prob: pH + pA, odd: odd(pH + pA) },
      { key: "X2", label: "EMPATE O VISITA", prob: pD + pA, odd: odd(pD + pA) },
    ]},
    { key: "OU25", label: "Total de goles", choices: [
      { key: "OV", label: "MAS DE 2.5", prob: pO, odd: odd(pO) },
      { key: "UN", label: "MENOS DE 2.5", prob: 1 - pO, odd: odd(1 - pO) },
    ]},
    { key: "HCP", label: "Hándicap -2", choices: [
      { key: "H1", label: "LOCAL -2", prob: pH1, odd: odd(pH1) },
      { key: "H2", label: "VISITA +2", prob: 1 - pH1, odd: odd(1 - pH1) },
    ]},
    { key: "EXACTO", label: "Marcador exacto", choices: exact.map((e) => ({ key: e.key, label: e.label, prob: e.prob, odd: odd(e.prob) })) },
  ];
}

function winnerMarkets(sides: { label: string; prob: number }[]): BkMarket[] {
  const odd = (p: number) => Math.max(1.02, Math.round((1 / Math.max(p, 0.01)) * MARGEN * 100) / 100);
  return [{ key: "WINNER", label: "Ganador", choices: sides.map((s, i) => ({ key: `W${i}`, label: s.label, prob: s.prob, odd: odd(s.prob) })) }];
}

// ====== GENERADOR DE JORNADA ======
export function generateEvents(now = Date.now()): BkEvent[] {
  const events: BkEvent[] = [];
  const mkFutbol = (tA: BkTeam, tB: BkTeam, comp: string, startAt: number, liveAt: number): BkEvent => {
    const homeAdv = 0.32;
    const xh = Math.max(0.35, Math.pow(10, (tA.str + homeAdv - tB.str) / 10) * 0.9);
    const xa = Math.max(0.3, Math.pow(10, (tB.str - tA.str - homeAdv) / 10) * 0.9);
    return {
      id: `BK-${tA.id}-${tB.id}-${Math.floor(Math.random() * 1e6)}`,
      kind: "FUTBOL", comp,
      title: `${tA.short} vs ${tB.short}`,
      sides: [tA.name, tB.name],
      startAt, status: startAt <= now ? "EN_VIVO" : "PROXIMO",
      minute: startAt <= now ? Math.min(88, Math.floor((now - startAt) / 2000)) : 0,
      hs: 0, as: 0, corners: [0, 0], cards: [0, 0], xg: [xh, xa],
      events: startAt <= now ? ["Rueda inicial en marcha"] : [],
      markets: footballMarkets(xh, xa),
    };
  };
  // 3 EN VIVO con minutos distintos
  events.push(mkFutbol(pick(LIGA_A), pick(LIGA_A), "LIGA IMPERIO · J7", now - 90_000, now - 90_000));
  events.push(mkFutbol(pick(LIGA_B), pick(LIGA_B), "LIGA NACION · J7", now - 170_000, now - 170_000));
  events.push(mkFutbol(pick(LIGA_A), pick(LIGA_B), "COPA CRUZADA · SF", now - 40_000, now - 40_000));
  // 5 PROXIMOS (arrancan en 1-7 min para que el usuario los vea en vivo)
  const pairs = new Set<string>();
  let guard = 0;
  while (events.length < 8 && guard++ < 80) {
    const tA = pick(Math.random() < 0.5 ? LIGA_A : LIGA_B);
    const tB = pick(Math.random() < 0.5 ? LIGA_A : LIGA_B);
    const pk = [tA.id, tB.id].sort().join("-");
    if (tA.id === tB.id || pairs.has(pk)) continue;
    pairs.add(pk);
    const startAt = now + rnd(60_000, 420_000);
    events.push(mkFutbol(tA, tB, tA.str > 78 && tB.str > 78 ? "SUPERCLASICO TV" : "JORNADA REGULAR", startAt, startAt));
  }
  // ELECCION presidencial (se cierra en ~6 min)
  events.push({
    id: `BK-ELEC-${Math.floor(Math.random() * 1e6)}`, kind: "ELECCION",
    comp: "ELECCION NACIONAL", title: "¿Quien gana la presidencia?",
    sides: ["UNION PATRIA", "FRENTE LIBERAL", "MOVIMIENTO VERDE"],
    startAt: now + 360_000, status: "PROXIMO", minute: 0, hs: 0, as: 0,
    corners: [0, 0], cards: [0, 0], xg: [0, 0], events: ["Encuestas: UP 41% · FL 38% · MV 21%"],
    markets: winnerMarkets([
      { label: "UNION PATRIA", prob: 0.42 },
      { label: "FRENTE LIBERAL", prob: 0.38 },
      { label: "MOVIMIENTO VERDE", prob: 0.20 },
    ]),
  });
  // FRENTE DE GUERRA
  events.push({
    id: `BK-WAR-${Math.floor(Math.random() * 1e6)}`, kind: "GUERRA",
    comp: "FRENTE ORIENTAL", title: "Caida de la ciudad fortificada",
    sides: ["ATAQUE BLINDADO", "DEFENSA URBANA"],
    startAt: now + 240_000, status: "PROXIMO", minute: 0, hs: 0, as: 0,
    corners: [0, 0], cards: [0, 0], xg: [0, 0], events: ["Artilleria bombardeando perimetro"],
    markets: winnerMarkets([
      { label: "ATAQUE BLINDADO", prob: 0.58 },
      { label: "DEFENSA URBANA", prob: 0.42 },
    ]),
  });
  return events;
}

// ====== AVANCE EN VIVO ======
const MOMENTOS = ["Disparo desviado", "Gran atajada del portero", "Corner peligroso", "Falta amarilla en media luna", "Contra ataque cortado", "Remate al travesaño", "Presion alta en campo rival"];

export function advanceEvent(e: BkEvent, dtSec: number): BkEvent {
  if (e.status === "FINALIZADO") return e;
  if (e.status === "PROXIMO") {
    if (Date.now() >= e.startAt) {
      e.status = "EN_VIVO"; e.minute = 0;
      e.events = [e.kind === "FUTBOL" ? "COMIENZA EL PARTIDO" : "Comienza el conteo"];
    }
    return e;
  }
  // EN VIVO
  e.minute = Math.min(90, e.minute + dtSec * 0.5);
  if (e.kind === "FUTBOL") {
    // prob de gol por segundo proporcional a xg/minuto, con impulso al perdedor (drama)
    const boostH = e.hs < e.as ? 1.18 : 1;
    const boostA = e.as < e.hs ? 1.18 : 1;
    const pGoalH = (e.xg[0] / 90) * dtSec * 0.5 * boostH;
    const pGoalA = (e.xg[1] / 90) * dtSec * 0.5 * boostA;
    if (Math.random() < pGoalH) { e.hs++; e.events.unshift(`GOL DE ${e.sides[0].slice(0, 16)} ${e.hs}-${e.as} (${Math.floor(e.minute)}')`); }
    else if (Math.random() < pGoalA) { e.as++; e.events.unshift(`GOL DE ${e.sides[1].slice(0, 16)} ${e.hs}-${e.as} (${Math.floor(e.minute)}')`); }
    if (Math.random() < 0.10 * dtSec) e.corners[0] += Math.random() < 0.55 ? 1 : 0;
    if (Math.random() < 0.10 * dtSec) e.corners[1] += Math.random() < 0.55 ? 1 : 0;
    if (Math.random() < 0.05 * dtSec) e.cards[Math.random() < 0.5 ? 0 : 1]++;
    if (Math.random() < 0.08 * dtSec && e.events.length < 24) e.events.unshift(pick(MOMENTOS));
  }
  if (e.minute >= 90) {
    e.status = "FINALIZADO";
    e.events.unshift(e.kind === "FUTBOL" ? `FINAL DEL PARTIDO ${e.hs}-${e.as}` : "RESULTADO DEFINITIVO");
  }
  return e;
}

// recalcular cuotas en vivo (se llama cada ~2s sobre eventos EN_VIVO)
export function refreshOdds(e: BkEvent): BkEvent {
  if (e.status !== "EN_VIVO") return e;
  const rest = Math.max(1, 90 - e.minute) / 90;
  if (e.kind === "FUTBOL") {
    const gh = e.xg[0] * rest, ga = e.xg[1] * rest;
    let pH = 0, pD = 0, pA = 0, pO = 0;
    for (let h = 0; h <= 5; h++) for (let a = 0; a <= 5; a++) {
      const p = poissonP(h, gh) * poissonP(a, ga);
      if (h + e.hs > a + e.as) pH += p; else if (h + e.hs === a + e.as) pD += p; else pA += p;
      if (h + a + e.hs + e.as > 2) pO += p;
    }
    const odd = (p: number) => Math.max(1.01, Math.round((1 / Math.max(p, 0.02)) * MARGEN * 100) / 100);
    const m1 = e.markets.find((m) => m.key === "1X2");
    if (m1) {
      m1.choices[0].prob = pH; m1.choices[0].odd = odd(pH);
      m1.choices[1].prob = pD; m1.choices[1].odd = odd(pD);
      m1.choices[2].prob = pA; m1.choices[2].odd = odd(pA);
    }
    const mo = e.markets.find((m) => m.key === "OU25");
    if (mo) {
      mo.choices[0].prob = pO; mo.choices[0].odd = odd(pO);
      mo.choices[1].prob = 1 - pO; mo.choices[1].odd = odd(1 - pO);
    }
  }
  return e;
}

// ====== LIQUIDACION ======
export function choiceWon(e: BkEvent, leg: BkLeg): boolean | null {
  if (e.status !== "FINALIZADO") return null;
  if (e.kind === "FUTBOL") {
    const [h, a] = [e.hs, e.as];
    switch (leg.choiceKey) {
      case "1": return h > a; case "X": return h === a; case "2": return a > h;
      case "1X": return h >= a; case "12": return h !== a; case "X2": return a >= h;
      case "OV": return h + a > 2; case "UN": return h + a < 3;
      case "H1": return h - a >= 2; case "H2": return h - a < 2;
      default: {
        if (leg.marketKey === "EXACTO") {
          const m = leg.choiceKey.match(/E(\d)(\d)/);
          return m ? Number(m[1]) === h && Number(m[2]) === a : false;
        }
        return false;
      }
    }
  }
  // ELECCION / GUERRA: ganador sorteado con las probabilidades (indice W<i>)
  if (leg.marketKey === "WINNER") {
    return winnerIndex(e) === Number(leg.choiceKey.slice(1));
  }
  return false;
}

export function settleWinnerEvent(e: BkEvent, rng = Math.random): void {
  // elige ganador por probabilidad de la cuota inicial (almacenada en e.events? no: usamos markets)
  const m = e.markets.find((mk) => mk.key === "WINNER");
  if (!m || e.drawn) return;
  let r = rng(), idx = 0;
  for (let i = 0; i < m.choices.length; i++) { r -= m.choices[i].prob; if (r <= 0) { idx = i; break; } }
  e.hs = idx; e.as = idx; e.drawn = true; // hs = indice ganador para WINNER
  e.events.unshift(`RESULTADO: ${m.choices[idx].label}`);
}

export function winnerIndex(e: BkEvent): number {
  return e.hs; // para ELECCION/GUERRA resueltos
}

// ====== CASHOUT ======
export function cashoutValue(t: BkTicket, events: Record<string, BkEvent>): number | null {
  if (t.status !== "ABIERTA" || t.legs.length !== 1) return null;
  const e = events[t.legs[0].eventId];
  if (!e || e.status !== "EN_VIVO") return null;
  const leg = t.legs[0];
  const m = e.markets.find((mk) => mk.key === leg.marketKey);
  const ch = m?.choices.find((c) => c.key === leg.choiceKey);
  if (!ch) return null;
  const winProb = 1 / ch.odd; // prob implicita de que la seleccion gane ahora
  const val = t.stake * (winProb * leg.odd) * 0.92; // 8% de comision de cashout
  return Math.max(0.01 * Math.round(val * 100), Math.round(val));
}

// ====== HELPERS DE PERSISTENCIA ======
export function loadTickets(): BkTicket[] {
  try { return JSON.parse(localStorage.getItem("vanguard-bk-tickets") ?? "[]") as BkTicket[]; } catch { return []; }
}
export function saveTickets(t: BkTicket[]) {
  try { localStorage.setItem("vanguard-bk-tickets", JSON.stringify(t.slice(0, 60))); } catch {}
}
export function loadEvents(): BkEvent[] | null {
  try {
    const raw = localStorage.getItem("vanguard-bk-events");
    if (!raw) return null;
    const arr = JSON.parse(raw) as BkEvent[];
    if (!Array.isArray(arr) || arr.length < 8) return null;
    // si todos estan viejos (más de 30 min) regenerar jornada
    if (arr.every((e) => e.status === "FINALIZADO" && Date.now() - e.startAt > 30 * 60_000)) return null;
    return arr;
  } catch { return null; }
}
export function saveEvents(events: BkEvent[]) {
  try { localStorage.setItem("vanguard-bk-events", JSON.stringify(events)); } catch {}
}
