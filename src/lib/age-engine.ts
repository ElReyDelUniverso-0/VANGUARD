// Vanguard v12 — AGE OF NATIONS: estrategia por turnos estilo Age of History.
// Modo CONQUISTA (anexion de provincias) y modo CRUZADA (guerras de religion:
// conversion por misioneros y Expansion de la fe). Motor puro serializable.

import { TERRITORIES } from "@/lib/conquest-data";

export type AoNMode = "CONQUISTA" | "CRUZADA";
export type AoNStatus = "JUGANDO" | "VICTORIA" | "DERROTA";
export type AoNAi = "AGRESIVO" | "EQUILIBRADO" | "DEFENSIVO";

export interface AoNNation {
  id: number;
  name: string;
  color: string;
  religion: string; // id de AON_RELIGIONS
  ai: AoNAi | "JUGADOR";
}

export interface AoNProv {
  owner: number;
  troops: number;
  pop: number;
  fort: number;      // 0..3
  religion: string;  // id de AON_RELIGIONS
}

export interface AoNState {
  mode: AoNMode;
  turn: number;
  gold: number;               // oro del jugador
  aiGold: number[];           // oro por nacion (index = nation id)
  nations: AoNNation[];
  provs: Record<string, AoNProv>;
  log: string[];
  status: AoNStatus;
  actions: number;            // acciones restantes del turno del jugador
  tax: 1 | 2 | 3;             // baja/media/alta
  playerNation: number;
  wonAt?: number;
}

export const AON_RELIGIONS = [
  { id: "CRUZ", name: "Cristianismo", sym: "✝", color: "#f59e0b" },
  { id: "LUNA", name: "Islam", sym: "☪", color: "#22c55e" },
  { id: "VIA", name: "Budismo", sym: "☸", color: "#f97316" },
  { id: "TORA", name: "Judaismo", sym: "✡", color: "#22d3ee" },
  { id: "LOTUS", name: "Hinduismo", sym: "ॐ", color: "#a855f7" },
  { id: "ANCI", name: "Animismo", sym: "▲", color: "#94a3b8" },
] as const;

export function religionOf(id: string) {
  return AON_RELIGIONS.find((r) => r.id === id) ?? AON_RELIGIONS[5];
}

// ====== NACIONES Y REPARTO INICIAL ======
export interface AoNNationDef { name: string; color: string; religion: string; ai: AoNAi | "JUGADOR"; provs: string[]; blurb: string; }

export const AON_NATION_DEFS: AoNNationDef[] = [
  { name: "Republica del Ambar", color: "#f59e0b", religion: "CRUZ", ai: "JUGADOR", provs: ["eeuu", "canadartico", "mexico", "japon"], blurb: "Potencia industrial del norte · economia fuerte" },
  { name: "Imperio Esmeralda", color: "#22c55e", religion: "VIA", ai: "EQUILIBRADO", provs: ["argentina", "andes", "amazonia", "sudeste"], blurb: "Hegemonia austral · Expansion en dos oceanos" },
  { name: "Imperio Escarlata", color: "#ef4444", religion: "LUNA", ai: "AGRESIVO", provs: ["europawest", "escandinavia", "balcanes", "magreb"], blurb: "Maquina de guerra europea · ataca primero" },
  { name: "Dominio Zafiro", color: "#22d3ee", religion: "TORA", ai: "DEFENSIVO", provs: ["europaeste", "siberia", "asiacentral", "oriente"], blurb: "Coloso continental · fortifica cada frontera" },
  { name: "Liga de Oro", color: "#a855f7", religion: "LOTUS", ai: "EQUILIBRADO", provs: ["india", "china", "australia", "egipto"], blurb: "Masa demografica gigante · marea humana" },
  { name: "Consejo de Marfil", color: "#d4d4d8", religion: "ANCI", ai: "DEFENSIVO", provs: ["africaoccidental", "africacentral", "africaoriental", "africasure"], blurb: "Tradicion ancestral · dominio de Africa" },
];

const AI_GOLD_START = 120;

export function newGame(mode: AoNMode, playerNationIdx: number): AoNState {
  const nations: AoNNation[] = AON_NATION_DEFS.map((d, i) => ({
    id: i, name: d.name, color: d.color, religion: d.religion, ai: d.ai,
  }));
  const provs: Record<string, AoNProv> = {};
  AON_NATION_DEFS.forEach((d, i) => {
    for (const pid of d.provs) {
      const t = TERRITORIES.find((x) => x.id === pid)!;
      provs[pid] = { owner: i, troops: t.baseTroops * 2 + 1, pop: 6 + t.baseTroops * 2, fort: i === 3 ? 1 : 0, religion: d.religion };
    }
  });
  return {
    mode, turn: 1,
    gold: playerNationIdx === 0 ? 150 : 130,
    aiGold: AON_NATION_DEFS.map((_, i) => (i === playerNationIdx ? 0 : AI_GOLD_START)),
    nations, provs,
    log: [`Año 1900 · ${nations[playerNationIdx].name} entra en la historia`],
    status: "JUGANDO",
    actions: 5, tax: 2, playerNation: playerNationIdx,
  };
}

export function provIncome(s: AoNState, nationId: number, tax: 1 | 2 | 3 = 2): number {
  let inc = 0;
  for (const p of Object.values(s.provs)) if (p.owner === nationId) inc += p.pop;
  const mult = tax === 1 ? 0.75 : tax === 2 ? 1 : 1.35;
  return Math.max(2, Math.round(inc * 0.62 * mult));
}

export const AON_COSTS = { reclutar: 30, fort: 45, misionero: 60, reclutarLote: 5 };

function logAdd(s: AoNState, msg: string) {
  s.log.unshift(`T${s.turn} · ${msg}`);
  if (s.log.length > 40) s.log.pop();
}

// ====== COMBATE ======
export function attack(s: AoNState, fromId: string, toId: string): { ok: boolean; msg: string; captured?: boolean } {
  const from = s.provs[fromId]; const to = s.provs[toId];
  if (!from || !to) return { ok: false, msg: "Provincia invalida" };
  if (from.owner !== s.playerNation) return { ok: false, msg: "No controlas la provincia de origen" };
  if (from.troops < 2) return { ok: false, msg: "Se necesitan al menos 2 tropas para atacar" };
  if (to.owner === s.playerNation) return { ok: false, msg: "Ya es tuya" };
  const t = TERRITORIES.find((x) => x.id === fromId)!;
  if (!t.adj.includes(toId)) return { ok: false, msg: "No es adyacente" };
  if (s.actions < 1) return { ok: false, msg: "Sin acciones restantes" };

  const terrTo = TERRITORIES.find((x) => x.id === toId)!;
  const rollA = from.troops * (0.9 + Math.random() * 0.5);
  const rollD = to.troops * (1 + to.fort * 0.3) * (1.0 + Math.random() * 0.45) + 0.5;
  s.actions--;
  const attacker = s.nations[s.playerNation];
  const defender = s.nations[to.owner];
  if (rollA > rollD) {
    // captura
    const survivors = Math.max(1, Math.floor(from.troops * 0.6));
    from.troops = Math.max(1, from.troops - survivors);
    to.owner = s.playerNation;
    to.troops = survivors; to.fort = Math.max(0, to.fort - 1);
    if (s.mode === "CRUZADA") to.religion = attacker.religion;
    logAdd(s, `⚔ CAPTURASTE ${terrTo.name} (de ${defender.name})`);
    return { ok: true, captured: true, msg: `${terrTo.name} capturada` };
  }
  from.troops = Math.max(1, Math.floor(from.troops * 0.5));
  to.troops = Math.max(1, Math.floor(to.troops * 0.75));
  logAdd(s, `Ataque rechazado en ${terrTo.name} (defendio ${defender.name})`);
  return { ok: true, captured: false, msg: `Ataque rechazado en ${terrTo.name}` };
}

export function moveTroops(s: AoNState, fromId: string, toId: string, qty: number): { ok: boolean; msg: string } {
  const from = s.provs[fromId]; const to = s.provs[toId];
  if (!from || !to || from.owner !== s.playerNation || to.owner !== s.playerNation) return { ok: false, msg: "Provincias propias requeridas" };
  if (!TERRITORIES.find((x) => x.id === fromId)!.adj.includes(toId)) return { ok: false, msg: "No son adyacentes" };
  if (qty < 1 || qty > from.troops - 1) return { ok: false, msg: "Cantidad invalida (deja 1 tropa)" };
  if (s.actions < 1) return { ok: false, msg: "Sin acciones" };
  s.actions--;
  from.troops -= qty; to.troops += qty;
  return { ok: true, msg: `${qty} tropas movidas` };
}

export function recruit(s: AoNState, provId: string, lote = AON_COSTS.reclutarLote): { ok: boolean; msg: string } {
  const p = s.provs[provId];
  if (!p || p.owner !== s.playerNation) return { ok: false, msg: "Provincia propia requerida" };
  const cap = p.pop * 3;
  if (p.troops + lote > cap) return { ok: false, msg: `Limite de reclutamiento (${cap})` };
  const cost = AON_COSTS.reclutar;
  if (s.gold < cost) return { ok: false, msg: "Oro insuficiente" };
  s.gold -= cost; p.troops += lote;
  return { ok: true, msg: `+${lote} tropas` };
}

export function buildFort(s: AoNState, provId: string): { ok: boolean; msg: string } {
  const p = s.provs[provId];
  if (!p || p.owner !== s.playerNation) return { ok: false, msg: "Provincia propia requerida" };
  if (p.fort >= 3) return { ok: false, msg: "Fortaleza al maximo" };
  if (s.gold < AON_COSTS.fort) return { ok: false, msg: "Oro insuficiente" };
  s.gold -= AON_COSTS.fort; p.fort++;
  return { ok: true, msg: `Fortificacion nivel ${p.fort}` };
}

export function sendMissionary(s: AoNState, provId: string): { ok: boolean; msg: string } {
  if (s.mode !== "CRUZADA") return { ok: false, msg: "Solo en modo CRUZADA" };
  const p = s.provs[provId];
  if (!p || p.owner !== s.playerNation) return { ok: false, msg: "Provincia propia requerida" };
  const rel = religionOf(s.nations[s.playerNation].religion);
  if (p.religion === rel.id) return { ok: false, msg: "Ya profesa tu fe" };
  if (s.gold < AON_COSTS.misionero) return { ok: false, msg: "Oro insuficiente" };
  s.gold -= AON_COSTS.misionero; p.religion = rel.id;
  logAdd(s, `☀ Conversion en ${TERRITORIES.find((x) => x.id === provId)!.name}`);
  return { ok: true, msg: "Provincia convertida a tu fe" };
}

// ====== FIN DE TURNO: impuestos, revueltas, IA, eventos ======
const EVENTOS = [
  { txt: "PESTE NEGRA: brote en una provincia", kind: "PESTE" },
  { txt: "VETA DE ORO: el tesoro crece", kind: "ORO" },
  { txt: "CARAVANAS DE MERCADERES: plusvalia comercial", kind: "COMERCIO" },
  { txt: "HEREJIA: una provincia duda de su fe", kind: "HEREJIA" },
] as const;

export function endTurn(s: AoNState): AoNState {
  // 1) ingresos del jugador + revueltas por impuestos altos
  s.gold += provIncome(s, s.playerNation, s.tax);
  if (s.tax === 3) {
    const mine = Object.entries(s.provs).filter(([, p]) => p.owner === s.playerNation);
    for (const [id, p] of mine) {
      if (Math.random() < 0.06 && p.troops > 1) {
        p.troops -= 1;
        logAdd(s, `Revolta fiscal en ${TERRITORIES.find((x) => x.id === id)!.name}: desertan reclutas`);
      }
    }
  }
  // 2) ingresos IA + decisiones
  for (const n of s.nations) {
    if (n.ai === "JUGADOR" || s.status !== "JUGANDO") continue;
    s.aiGold[n.id] += provIncome(s, n.id, 2);
    const mine = Object.entries(s.provs).filter(([, p]) => p.owner === n.id);
    if (!mine.length) continue;
    const aggro = n.ai === "AGRESIVO" ? 3 : n.ai === "EQUILIBRADO" ? 2 : 1;
    let acts = 1 + (Math.random() < 0.4 * aggro ? 1 : 0) + (n.ai === "AGRESIVO" && s.turn > 3 ? 1 : 0);
    // fortalecer frontera
    if (n.ai === "DEFENSIVO" && s.aiGold[n.id] >= AON_COSTS.fort && Math.random() < 0.5) {
      const [pid, p] = mine[Math.floor(Math.random() * mine.length)];
      if (p.fort < 3) { p.fort++; s.aiGold[n.id] -= AON_COSTS.fort; }
    }
    while (acts-- > 0) {
      // buscar mejor ataque: provincia mia (de la IA) con tropas contra vecino mas debil
      let best: { from: string; to: string; ratio: number } | null = null;
      for (const [pid, p] of mine) {
        if (s.provs[pid]?.owner !== n.id) continue;
        for (const adj of TERRITORIES.find((x) => x.id === pid)!.adj) {
          const tp = s.provs[adj];
          if (!tp || tp.owner === n.id) continue;
          const ratio = p.troops / Math.max(1, tp.troops * (1 + tp.fort * 0.3));
          const threshold = n.ai === "AGRESIVO" ? 1.15 : n.ai === "EQUILIBRADO" ? 1.45 : 1.8;
          if (ratio >= threshold && (!best || ratio > best.ratio)) best = { from: pid, to: adj, ratio };
        }
      }
      if (best && s.provs[best.from] && s.provs[best.from].troops >= 3) {
        const fp = s.provs[best.from]; const tp = s.provs[best.to];
        const rollA = fp.troops * (0.85 + Math.random() * 0.45);
        const rollD = tp.troops * (1 + tp.fort * 0.3) * (1.05 + Math.random() * 0.4) + 0.5;
        const terrTo = TERRITORIES.find((x) => x.id === best.to)!;
        if (rollA > rollD) {
          const surv = Math.max(1, Math.floor(fp.troops * 0.6));
          fp.troops = Math.max(1, fp.troops - surv);
          const prevOwner = tp.owner;
          tp.owner = n.id; tp.troops = surv; tp.fort = Math.max(0, tp.fort - 1);
          if (s.mode === "CRUZADA") tp.religion = n.religion;
          if (prevOwner === s.playerNation) logAdd(s, `PERDISTE ${terrTo.name} ante ${n.name}`);
          else logAdd(s, `${n.name} capturo ${terrTo.name}`);
        } else {
          fp.troops = Math.max(1, Math.floor(fp.troops * 0.55));
          tp.troops = Math.max(1, Math.floor(tp.troops * 0.8));
        }
      } else if (s.aiGold[n.id] >= AON_COSTS.reclutar) {
        // reforzar provincia fronteriza
        const frontier = mine.filter(([pid, p]) => TERRITORIES.find((x) => x.id === pid)!.adj.some((a) => s.provs[a] && s.provs[a].owner !== n.id));
        const tgt = frontier.length ? frontier[Math.floor(Math.random() * frontier.length)] : mine[Math.floor(Math.random() * mine.length)];
        if (tgt && tgt[1].troops < tgt[1].pop * 3) { tgt[1].troops += 4; s.aiGold[n.id] -= AON_COSTS.reclutar; }
      }
    }
  }
  // 3) eventos aleatorios
  if (Math.random() < 0.38) {
    const ev = EVENTOS[Math.floor(Math.random() * EVENTOS.length)];
    const ids = Object.keys(s.provs);
    const pid = ids[Math.floor(Math.random() * ids.length)];
    const p = s.provs[pid];
    const tName = TERRITORIES.find((x) => x.id === pid)!.name;
    if (ev.kind === "PESTE" && p.troops > 1) { p.troops = Math.max(1, p.troops - 3); logAdd(s, `☣ PESTE en ${tName}: -3 tropas`); }
    else if (ev.kind === "ORO" && p.owner === s.playerNation) { s.gold += 60; logAdd(s, `✦ VETA DE ORO en ${tName}: +60 oro`); }
    else if (ev.kind === "COMERCIO" && p.owner === s.playerNation) { s.gold += 40; logAdd(s, `✦ CARAVANAS en ${tName}: +40 oro`); }
    else if (ev.kind === "HEREJIA" && s.mode === "CRUZADA") { p.religion = "ANCI"; logAdd(s, `HEREJIA en ${tName}: regresan al animismo`); }
    else logAdd(s, ev.txt);
  }
  // 4) nuevo turno
  s.turn++;
  const mineCount = Object.values(s.provs).filter((p) => p.owner === s.playerNation).length;
  s.actions = 5 + Math.floor(mineCount / 8);
  // 5) chequeo de fin
  if (mineCount === 0) { s.status = "DERROTA"; s.wonAt = s.turn; logAdd(s, "Tu nación ha sido borrada del mapa"); }
  else if (s.mode === "CONQUISTA" && mineCount >= 15) { s.status = "VICTORIA"; s.wonAt = s.turn; logAdd(s, `DOMINACION TOTAL: ${mineCount}/24 provincias`); }
  else if (s.mode === "CRUZADA") {
    const rel = s.nations[s.playerNation].religion;
    const share = Object.values(s.provs).filter((p) => p.religion === rel).length;
    if (share >= 15) { s.status = "VICTORIA"; s.wonAt = s.turn; logAdd(s, `LA FE TRIUNFA: ${share}/24 provincias convertidas`); }
  }
  return s;
}

export function religionShare(s: AoNState): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of Object.values(s.provs)) out[p.religion] = (out[p.religion] ?? 0) + 1;
  return out;
}

export function nationsAlive(s: AoNState): AoNNation[] {
  const owners = new Set(Object.values(s.provs).map((p) => p.owner));
  return s.nations.filter((n) => owners.has(n.id));
}

// ====== PERSISTENCIA ======
const SAVE_KEY = "vanguard-aon-v2";
export function saveAoN(s: AoNState) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch {} }
export function loadAoN(): AoNState | null {
  try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) as AoNState : null; } catch { return null; }
}
export function clearAoN() { try { localStorage.removeItem(SAVE_KEY); } catch {} }

// ====== PROYECCION MERCATOR (misma que WarMap: rotate[-10,0] center[0,20] scale155 translate[500,295]) ======
export function projXY(lat: number, lng: number): { x: number; y: number } {
  const rad = Math.PI / 180;
  const y = (l: number) => Math.log(Math.tan(Math.PI / 4 + (l * rad) / 2));
  return {
    x: 500 + 155 * (lng + 10) * rad,
    y: 295 - 155 * (y(lat) - y(20)),
  };
}
