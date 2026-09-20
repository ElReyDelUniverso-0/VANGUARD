// Vanguard v7 — MINI-SERVICIO DE TIEMPO REAL (:3003)
// 1) Salas sociales: chat en vivo con comunidad simulada + jugadores reales.
// 2) Multijugador: Mundo de Guerra global autoritativo (LOBBY -> REINFORCE -> WAR -> ENDED).
// Corre con: bun --hot index.ts  (desde mini-services/game-service)
import { Server, type Socket } from "socket.io";
import {
  ROOMS, BOTS, AMBIENT, REPLIES,
  MP_TERRITORIES, MP_CONTINENTS, MP_BOTS, PLAYER_COLORS,
  type BotIdentity, type MpTerritory,
} from "./data";
import { setupDetective } from "./detective";
import { setupDuel } from "./duel";

const PORT = 3003;

// ==================================================================
// UTILIDADES
// ==================================================================
const rnd = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ==================================================================
// 1) CHAT DE SALAS SOCIALES
// ==================================================================
interface ChatMsg {
  id: string; room: string; author: string; country: string;
  body: string; ts: number; bot?: boolean; sys?: boolean;
}

const history: Record<string, ChatMsg[]> = {};
const lastMsgAt = new WeakMap<Socket, number>();

// presencia simulada estable: 1-3 bots "en linea" por sala
const fakePresence: Record<string, BotIdentity[]> = {};
for (const r of ROOMS) {
  const n = 1 + Math.floor(Math.random() * 3);
  const shuffled = [...BOTS].sort(() => Math.random() - 0.5);
  fakePresence[r.id] = shuffled.slice(0, n);
}

function seedRoom(roomId: string) {
  const msgs: ChatMsg[] = [];
  const pool = AMBIENT[roomId] ?? AMBIENT.general;
  const n = 7 + Math.floor(Math.random() * 4);
  let t = Date.now() - 45 * 60 * 1000;
  for (let i = 0; i < n; i++) {
    const bot = pick(BOTS);
    t += Math.round((38 * 60 * 1000 / n) * rnd(0.6, 1.4));
    msgs.push({
      id: `seed-${roomId}-${i}`,
      room: roomId, author: bot.name, country: bot.country,
      body: pick(pool), ts: t, bot: true,
    });
  }
  history[roomId] = msgs;
}
ROOMS.forEach((r) => seedRoom(r.id));

function pushMsg(roomId: string, msg: ChatMsg) {
  const h = history[roomId] ?? (history[roomId] = []);
  h.push(msg);
  if (h.length > 80) h.splice(0, h.length - 80);
}

// presencia real por socket
interface SockInfo { room: string; name: string; country: string }
const sockInfo = new Map<string, SockInfo>();

function onlineSnapshot() {
  const online: Record<string, number> = {};
  const names: Record<string, string[]> = {};
  for (const r of ROOMS) {
    let n = fakePresence[r.id].length;
    const nm = fakePresence[r.id].map((b) => b.name);
    for (const s of sockInfo.values()) {
      if (s.room === r.id) { n += 1; nm.push(s.name); }
    }
    online[r.id] = n;
    names[r.id] = nm.slice(0, 8);
  }
  return { online, names };
}

// ==================================================================
// 2) MUNDO DE GUERRA MULTIJUGADOR (partida global autoritativa)
// ==================================================================
interface MpPlayer {
  id: string; name: string; color: string; isBot: boolean; avatar?: string;
  reserves: number; connected: boolean; captures: number; gemsEarned: number;
}
type Phase = "LOBBY" | "REINFORCE" | "WAR" | "ENDED";

interface MpChatMsg { id: string; name: string; color: string; body: string; ts: number; sys?: boolean }

interface MpState {
  phase: Phase; round: number; phaseEnds: number; startAt: number | null;
  territories: Record<string, { owner: string | null; troops: number }>;
  players: Record<string, MpPlayer>;
  log: { ts: number; msg: string; color?: string }[];
  // v17: chat de guerra en vivo + votos de revancha
  chat: MpChatMsg[];
  rematch: { votes: number; needed: number };
  lastBattle: {
    seq: number; from: string; to: string; attacker: string; attackerName: string; defenderName: string;
    atkRoll: number; defRoll: number; atkLosses: number; defLosses: number; captured: boolean;
    attackerColor: string; defenderColor: string;
  } | null;
  winnerId: string | null; winnerName: string | null; winnerSeq: number;
  resetAt: number | null;
  territoryMeta: MpTerritory[];
}

const LOBBY_WAIT = 25_000;      // desde el primer reclamo hasta el despliegue
const REINFORCE_MS = 30_000;
const WAR_MS = 45_000;
const RESET_MS = 15_000;
const MAX_ROUND = 8;
const START_TROOPS = 12;

let battleSeq = 0;
let winnerSeq = 0;

function freshState(): MpState {
  const territories: MpState["territories"] = {};
  for (const t of MP_TERRITORIES) territories[t.id] = { owner: null, troops: 0 };
  return {
    phase: "LOBBY", round: 0, phaseEnds: 0, startAt: null,
    territories,
    players: {},
    log: [{ ts: Date.now(), msg: "Servidor de partida listo — recluta tu territorio", color: "#22d3ee" }],
    chat: [{ id: "c-sys-0", name: "SISTEMA", color: "#22d3ee", body: "Canal de guerra abierto — coordinad sus ataques", ts: Date.now(), sys: true }],
    rematch: { votes: 0, needed: 0 },
    lastBattle: null,
    winnerId: null, winnerName: null, winnerSeq: 0,
    resetAt: null,
    territoryMeta: MP_TERRITORIES,
  };
}

let mp: MpState = freshState();

const terrName = (id: string) => MP_TERRITORIES.find((t) => t.id === id)?.name ?? id;
const neighbors = (id: string) => MP_TERRITORIES.find((t) => t.id === id)?.adj ?? [];

function logAdd(msg: string, color?: string) {
  mp.log.push({ ts: Date.now(), msg, color });
  if (mp.log.length > 60) mp.log.splice(0, mp.log.length - 60);
}

function ownedOf(pid: string): string[] {
  return Object.entries(mp.territories).filter(([, v]) => v.owner === pid).map(([k]) => k);
}

function incomeFor(pid: string): number {
  const owned = ownedOf(pid);
  let inc = Math.floor(owned.length / 2);
  for (const cont of Object.keys(MP_CONTINENTS)) {
    const inCont = MP_TERRITORIES.filter((t) => t.continent === cont);
    if (inCont.length > 0 && inCont.every((t) => mp.territories[t.id]?.owner === pid)) {
      inc += MP_CONTINENTS[cont];
    }
  }
  return Math.max(1, inc);
}

function ensurePlayer(id: string, name: string, avatar?: string): MpPlayer {
  let p = mp.players[id];
  if (!p) {
    const humans = Object.values(mp.players).filter((x) => !x.isBot).length;
    p = {
      id, name: name.slice(0, 18) || `OPERADOR-${humans + 1}`,
      color: PLAYER_COLORS[humans % PLAYER_COLORS.length],
      isBot: false, reserves: 0, connected: true, captures: 0, gemsEarned: 0,
      avatar: avatar && /^[a-z]{2}$/.test(avatar) ? avatar : undefined,
    };
    mp.players[id] = p;
  } else {
    p.name = name.slice(0, 18) || p.name;
    if (avatar && /^[a-z]{2}$/.test(avatar)) p.avatar = avatar;
    p.connected = true;
  }
  return p;
}

function startMatch() {
  mp.phase = "REINFORCE";
  mp.round = 1;
  mp.startAt = null;
  // bots reclaman 3 territorios cada uno (con su countryball nacional)
  const free = MP_TERRITORIES.map((t) => t.id).filter((id) => !mp.territories[id].owner);
  for (const botDef of MP_BOTS) {
    const bot: MpPlayer = mp.players[botDef.id] ?? {
      id: botDef.id, name: botDef.name, color: botDef.color, avatar: botDef.avatar,
      isBot: true, reserves: 0, connected: true, captures: 0, gemsEarned: 0,
    };
    bot.avatar = botDef.avatar;
    mp.players[botDef.id] = bot;
    for (let i = 0; i < 3 && free.length > 0; i++) {
      const idx = Math.floor(Math.random() * free.length);
      const tid = free.splice(idx, 1)[0];
      mp.territories[tid] = { owner: bot.id, troops: 2 };
    }
  }
  // guarniciones neutrales
  for (const t of Object.values(mp.territories)) {
    if (!t.owner) t.troops = 1 + Math.floor(Math.random() * 2);
  }
  for (const p of Object.values(mp.players)) p.reserves = START_TROOPS;
  logAdd("¡ARRANCA LA PARTIDA GLOBAL! Desplieguen sus reservas", "#f5a623");
  mp.phaseEnds = Date.now() + REINFORCE_MS;
}

function goWar() {
  mp.phase = "WAR";
  mp.phaseEnds = Date.now() + WAR_MS;
  logAdd(`RONDA ${mp.round}: fase de GUERRA — los asaltos estan abiertos`, "#ef4444");
}

function nextReinforce() {
  mp.round += 1;
  mp.phase = "REINFORCE";
  mp.phaseEnds = Date.now() + REINFORCE_MS;
  for (const p of Object.values(mp.players)) p.reserves += incomeFor(p.id);
  logAdd(`RONDA ${mp.round}: refuerzos repartidos segun dominio`, "#22d3ee");
}

function endMatch(reason: string) {
  const counts: Record<string, number> = {};
  for (const t of Object.values(mp.territories)) {
    if (!t.owner) continue;
    counts[t.owner] = (counts[t.owner] ?? 0) + 1;
  }
  let best: MpPlayer | null = null;
  for (const p of Object.values(mp.players)) {
    if (!best || (counts[p.id] ?? 0) > (counts[best.id] ?? 0)) best = p;
  }
  mp.phase = "ENDED";
  mp.winnerId = best?.id ?? null;
  mp.winnerName = best?.name ?? null;
  mp.winnerSeq = ++winnerSeq;
  if (best) {
    best.gemsEarned += 25;
    logAdd(`VICTORIA DE ${best.name} — ${reason} (+25 gemas)`, "#f5a623");
  }
  // v17: la revancha necesita el voto de los humanos conectados
  const humans = Object.values(mp.players).filter((x) => !x.isBot && x.connected).length;
  mp.rematch = { votes: 0, needed: Math.max(1, humans) };
  mpRematchVoted.clear();
  mp.chat.push({
    id: `c-sys-${Date.now()}`, name: "SISTEMA", color: "#f5a623",
    body: best ? `${best.name} ha dominado el mundo — pidan REVANCHA en el chat` : "Partida terminada",
    ts: Date.now(), sys: true,
  });
  if (mp.chat.length > 40) mp.chat.splice(0, mp.chat.length - 40);
  mp.resetAt = Date.now() + RESET_MS;
}

function resolveAttack(attackerId: string, fromId: string, toId: string) {
  const from = mp.territories[fromId];
  const to = mp.territories[toId];
  if (!from || !to || from.owner !== attackerId || to.owner === attackerId) return;
  const atkTroops = from.troops - 1;
  if (atkTroops < 2) return;
  const r1 = rnd(0.75, 1.25);
  const r2 = rnd(0.75, 1.25);
  const atkPower = atkTroops * r1;
  const defPower = Math.max(1, to.troops) * 1.12 * r2;
  const captured = atkPower > defPower;
  const attacker = mp.players[attackerId];
  const defenderName = to.owner ? mp.players[to.owner]?.name ?? "NEUTRAL" : "NEUTRAL";
  let atkLosses: number;
  let defLosses: number;
  if (captured) {
    atkLosses = Math.min(atkTroops, Math.ceil(defPower / 2));
    defLosses = to.troops;
    const survivors = Math.max(1, atkTroops - atkLosses);
    to.owner = attackerId;
    to.troops = survivors;
    from.troops = 1;
    if (attacker) { attacker.captures += 1; attacker.gemsEarned += 2; }
    logAdd(`${attacker?.name ?? "?"} CAPTURO ${terrName(toId)} (defendia ${defenderName})`, attacker?.color);
  } else {
    atkLosses = Math.min(atkTroops, Math.ceil(defPower / 2.5));
    defLosses = Math.min(Math.max(0, to.troops - 1), Math.ceil(atkPower / 2.5));
    from.troops = Math.max(1, from.troops - atkLosses);
    to.troops = Math.max(1, to.troops - defLosses);
    logAdd(`${attacker?.name ?? "?"} asalto ${terrName(toId)} y fue repelido`, attacker?.color);
  }
  mp.lastBattle = {
    seq: ++battleSeq,
    from: fromId, to: toId,
    attacker: attackerId, attackerName: attacker?.name ?? "?", defenderName,
    atkRoll: Math.round(atkPower * 10) / 10,
    defRoll: Math.round(defPower * 10) / 10,
    atkLosses, defLosses, captured,
    attackerColor: attacker?.color ?? "#888",
    defenderColor: mp.players[to.owner ?? ""]?.color ?? "#52525b",
  };
  // victoria por dominio total
  const owners = new Set(Object.values(mp.territories).map((t) => t.owner).filter(Boolean));
  if (owners.size === 1 && mp.players[[...owners][0] as string]) {
    endMatch("dominio total del mundo");
  }
}

function botTick() {
  if (mp.phase === "REINFORCE") {
    for (const p of Object.values(mp.players)) {
      if (!p.isBot || p.reserves <= 0) continue;
      if (Math.random() > 0.65) continue;
      const owned = ownedOf(p.id);
      if (owned.length === 0) continue;
      // prioriza fronteras con enemigos
      const border = owned.filter((tid) => neighbors(tid).some((a) => mp.territories[a]?.owner !== p.id));
      const target = pick(border.length > 0 ? border : owned);
      const qty = Math.min(p.reserves, 1 + Math.floor(Math.random() * 2));
      mp.territories[target].troops += qty;
      p.reserves -= qty;
    }
  }
  if (mp.phase === "WAR") {
    for (const p of Object.values(mp.players)) {
      if (!p.isBot || Math.random() > 0.55) continue;
      const owned = ownedOf(p.id);
      const options: { from: string; to: string; ratio: number }[] = [];
      for (const tid of owned) {
        const t = mp.territories[tid];
        if (t.troops < 4) continue;
        for (const a of neighbors(tid)) {
          const e = mp.territories[a];
          if (!e || e.owner === p.id) continue;
          const ratio = t.troops / Math.max(1, e.troops);
          if (ratio >= 1.45) options.push({ from: tid, to: a, ratio });
        }
      }
      if (options.length > 0) {
        options.sort((x, y) => y.ratio - x.ratio);
        resolveAttack(p.id, options[0].from, options[0].to);
      }
    }
  }
}

function mpTick() {
  const now = Date.now();
  if (mp.phase === "LOBBY") {
    if (mp.startAt && now >= mp.startAt) startMatch();
    return;
  }
  if (mp.phase === "REINFORCE") {
    botTick();
    if (now >= mp.phaseEnds) goWar();
    return;
  }
  if (mp.phase === "WAR") {
    botTick();
    if (now >= mp.phaseEnds) {
      if (mp.round >= MAX_ROUND) endMatch(`limite de ${MAX_ROUND} rondas alcanzado`);
      else nextReinforce();
    }
    return;
  }
  if (mp.phase === "ENDED") {
    if (mp.resetAt && now >= mp.resetAt) resetMatchNow();
  }
}

// v17: reinicio compartido por tiempo agotado o revancha unanime
function resetMatchNow() {
  const keep = mp.players;
  const seqKeep = { battleSeq, winnerSeq };
  mp = freshState();
  mp.players = Object.fromEntries(
    Object.entries(keep).map(([k, p]) => [k, { ...p, reserves: 0 }])
  );
  battleSeq = seqKeep.battleSeq;
  winnerSeq = seqKeep.winnerSeq;
  mpRematchVoted.clear();
  logAdd("El mundo se ha reiniciado — nueva partida, nuevos imperios", "#22d3ee");
}

// v17: votos de revancha (se limpian en cada reinicio)
const mpRematchVoted = new Set<string>();
const lastMpChatAt = new WeakMap<Socket, number>();

// ==================================================================
// SERVIDOR SOCKET.IO
// ==================================================================
// mapa socket -> jugador multijugador (para autorizar acciones)
const mpPlayersBySocket = new Map<string, { id: string }>();

const io = new Server(PORT, {
  cors: { origin: "*" },
  transports: ["websocket", "polling"],
});

// Vanguard v11 — ARCHIVOS NACION: detective multijugador por salas (enganos y pistas)
setupDetective(io);

// Vanguard v17 — DUELO DE TRIVIA PvP 1v1 en tiempo real
setupDuel(io);

let mpDirty = false;
const markMpDirty = () => { mpDirty = true; };
// broadcast rapido tras acciones del jugador (feedback en <250ms)
setInterval(() => {
  if (mpDirty) {
    mpDirty = false;
    io.emit("mp:state", mp);
  }
}, 250);

io.on("connection", (socket) => {
  // estado inicial del chat (salas + presencia)
  socket.emit("chat:init", { rooms: ROOMS, online: onlineSnapshot().online });

  // ---------- CHAT ----------
  socket.on("chat:join", (d: { room: string; name: string; country: string }, cb?: (r: { ok: boolean }) => void) => {
    const room = ROOMS.find((r) => r.id === d?.room)?.id;
    if (!room) { cb?.({ ok: false }); return; }
    const prev = sockInfo.get(socket.id);
    if (prev && prev.room !== room) {
      io.to(prev.room).emit("chat:sys", { room: prev.room, body: `${prev.name} salio de la sala`, ts: Date.now() });
    }
    const name = String(d?.name ?? "OPERADOR").slice(0, 18) || "OPERADOR";
    const country = String(d?.country ?? "UN").slice(0, 4).toUpperCase();
    sockInfo.set(socket.id, { room, name, country });
    socket.join(room);
    cb?.({ ok: true });
    socket.emit("chat:history", { roomId: room, msgs: history[room] ?? [] });
    if (!prev || prev.room !== room) {
      io.to(room).emit("chat:sys", { room, body: `${name} se ha unido a la sala`, ts: Date.now() });
    }
    io.emit("chat:online", onlineSnapshot());
  });

  socket.on("chat:msg", (d: { room: string; body: string }) => {
    const info = sockInfo.get(socket.id);
    if (!info || !d || typeof d.body !== "string") return;
    const body = d.body.trim().slice(0, 240);
    if (!body) return;
    const now = Date.now();
    if (now - (lastMsgAt.get(socket) ?? 0) < 500) return;
    lastMsgAt.set(socket, now);
    const msg: ChatMsg = {
      id: `m-${now}-${Math.random().toString(36).slice(2, 8)}`,
      room: info.room, author: info.name, country: info.country, body, ts: now,
    };
    pushMsg(info.room, msg);
    io.to(info.room).emit("chat:msg", msg);
    // respuesta de la comunidad (45%)
    if (Math.random() < 0.45) {
      const bot = pick(BOTS);
      const reply = pick(REPLIES).replace("{name}", info.name);
      setTimeout(() => {
        const m: ChatMsg = {
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          room: info.room, author: bot.name, country: bot.country, body: reply, ts: Date.now(), bot: true,
        };
        pushMsg(info.room, m);
        io.to(info.room).emit("chat:msg", m);
      }, 1800 + Math.random() * 4200);
    }
  });

  socket.on("chat:typing", () => {
    const info = sockInfo.get(socket.id);
    if (!info) return;
    socket.to(info.room).emit("chat:typing", { room: info.room, name: info.name });
  });

  // ---------- MULTIJUGADOR ----------
  socket.on("mp:join", (d: { playerId: string; name: string; avatar?: string }, cb?: (r: { state: MpState }) => void) => {
    if (!d?.playerId) return;
    const p = ensurePlayer(String(d.playerId), String(d?.name ?? "OPERADOR"), typeof d?.avatar === "string" ? d.avatar : undefined);
    mpPlayersBySocket.set(socket.id, { id: p.id });
    markMpDirty();
    cb?.({ state: mp });
  });

  socket.on("mp:claim", (d: { terrId: string }, cb?: (r: { ok: boolean; reason?: string }) => void) => {
    const link = mpPlayersBySocket.get(socket.id);
    const p = link ? mp.players[link.id] : undefined;
    if (!p) { cb?.({ ok: false, reason: "Unete a la partida primero" }); return; }
    if (mp.phase !== "LOBBY") { cb?.({ ok: false, reason: "La partida ya empezo" }); return; }
    const t = mp.territories[d?.terrId ?? ""];
    if (!t) { cb?.({ ok: false, reason: "Territorio inexistente" }); return; }
    if (t.owner) { cb?.({ ok: false, reason: "Territorio ocupado" }); return; }
    t.owner = p.id;
    t.troops = 0;
    logAdd(`${p.name} reclamo ${terrName(d.terrId)}`, p.color);
    if (!mp.startAt) {
      mp.startAt = Date.now() + LOBBY_WAIT;
      logAdd("Partida armada — el despliegue arranca en segundos", "#f5a623");
    }
    markMpDirty();
    cb?.({ ok: true });
  });

  socket.on("mp:deploy", (d: { terrId: string; qty: number }, cb?: (r: { ok: boolean; reason?: string }) => void) => {
    const link = mpPlayersBySocket.get(socket.id);
    const p = link ? mp.players[link.id] : undefined;
    if (!p) { cb?.({ ok: false, reason: "No estas en la partida" }); return; }
    if (mp.phase !== "REINFORCE") { cb?.({ ok: false, reason: "Solo en fase de refuerzos" }); return; }
    const t = mp.territories[d?.terrId ?? ""];
    if (!t || t.owner !== p.id) { cb?.({ ok: false, reason: "Territorio no tuyo" }); return; }
    const qty = Math.max(1, Math.min(10, Math.floor(Number(d?.qty ?? 1))));
    if (p.reserves < qty) { cb?.({ ok: false, reason: "Reservas insuficientes" }); return; }
    p.reserves -= qty;
    t.troops += qty;
    markMpDirty();
    cb?.({ ok: true });
  });

  socket.on("mp:deployAll", (_d: unknown, cb?: (r: { ok: boolean; reason?: string }) => void) => {
    const link = mpPlayersBySocket.get(socket.id);
    const p = link ? mp.players[link.id] : undefined;
    if (!p) { cb?.({ ok: false, reason: "No estas en la partida" }); return; }
    if (mp.phase !== "REINFORCE") { cb?.({ ok: false, reason: "Solo en fase de refuerzos" }); return; }
    const owned = ownedOf(p.id);
    if (owned.length === 0 || p.reserves <= 0) { cb?.({ ok: false, reason: "Nada que desplegar" }); return; }
    let i = 0;
    while (p.reserves > 0) {
      mp.territories[owned[i % owned.length]].troops += 1;
      p.reserves -= 1;
      i += 1;
    }
    markMpDirty();
    cb?.({ ok: true });
  });

  socket.on("mp:attack", (d: { from: string; to: string }, cb?: (r: { ok: boolean; reason?: string }) => void) => {
    const link = mpPlayersBySocket.get(socket.id);
    const p = link ? mp.players[link.id] : undefined;
    if (!p) { cb?.({ ok: false, reason: "No estas en la partida" }); return; }
    if (mp.phase !== "WAR") { cb?.({ ok: false, reason: "Solo en fase de guerra" }); return; }
    const from = mp.territories[d?.from ?? ""];
    const to = mp.territories[d?.to ?? ""];
    if (!from || !to) { cb?.({ ok: false, reason: "Territorio invalido" }); return; }
    if (from.owner !== p.id) { cb?.({ ok: false, reason: "Ese territorio no es tuyo" }); return; }
    if (!neighbors(d.from).includes(d.to)) { cb?.({ ok: false, reason: "No son vecinos" }); return; }
    if (to.owner === p.id) { cb?.({ ok: false, reason: "Ya es tuyo" }); return; }
    if (from.troops < 3) { cb?.({ ok: false, reason: "Se necesitan 3+ tropas" }); return; }
    resolveAttack(p.id, d.from, d.to);
    markMpDirty();
    cb?.({ ok: true });
  });

  // ---------- v17: CHAT DE GUERRA EN VIVO ----------
  socket.on("mp:chat", (d: { body: string }, cb?: (r: { ok: boolean; reason?: string }) => void) => {
    const link = mpPlayersBySocket.get(socket.id);
    const p = link ? mp.players[link.id] : undefined;
    if (!p) { cb?.({ ok: false, reason: "Unete a la partida primero" }); return; }
    if (!d || typeof d.body !== "string") return;
    const body = d.body.trim().slice(0, 160);
    if (!body) return;
    const now = Date.now();
    if (now - (lastMpChatAt.get(socket) ?? 0) < 500) return;
    lastMpChatAt.set(socket, now);
    mp.chat.push({ id: `c-${now}-${Math.random().toString(36).slice(2, 6)}`, name: p.name, color: p.color, body, ts: now });
    if (mp.chat.length > 40) mp.chat.splice(0, mp.chat.length - 40);
    markMpDirty();
    cb?.({ ok: true });
  });

  // ---------- v17: REVANCHA ----------
  socket.on("mp:rematch", (_d: unknown, cb?: (r: { ok: boolean; reason?: string }) => void) => {
    const link = mpPlayersBySocket.get(socket.id);
    const p = link ? mp.players[link.id] : undefined;
    if (!p) { cb?.({ ok: false, reason: "No estas en la partida" }); return; }
    if (mp.phase !== "ENDED") { cb?.({ ok: false, reason: "La partida sigue viva" }); return; }
    const key = `${mp.winnerSeq}:${p.id}`;
    if (!mpRematchVoted.has(key)) {
      mpRematchVoted.add(key);
      const humans = Object.values(mp.players).filter((x) => !x.isBot && x.connected).length;
      mp.rematch = { votes: Math.min(humans, mp.rematch.votes + 1), needed: Math.max(1, humans) };
      logAdd(`${p.name} pide REVANCHA (${mp.rematch.votes}/${mp.rematch.needed})`, "#f5a623");
      markMpDirty();
      if (mp.rematch.votes >= mp.rematch.needed) {
        mp.chat.push({ id: `c-sys-${Date.now()}`, name: "SISTEMA", color: "#00FF87", body: "REVANCHA APROBADA — nueva partida", ts: Date.now(), sys: true });
        resetMatchNow();
      }
    }
    cb?.({ ok: true });
  });

  socket.on("disconnect", () => {
    // chat
    const info = sockInfo.get(socket.id);
    if (info) {
      io.to(info.room).emit("chat:sys", { room: info.room, body: `${info.name} se desconecto`, ts: Date.now() });
      sockInfo.delete(socket.id);
      io.emit("chat:online", onlineSnapshot());
    }
    // multijugador
    const link = mpPlayersBySocket.get(socket.id);
    if (link) {
      const p = mp.players[link.id];
      if (p) {
        p.connected = false;
        logAdd(`${p.name} se desconecto — sus territorios quedan a la defensiva`, "#888");
      }
      mpPlayersBySocket.delete(socket.id);
      markMpDirty();
    }
  });
});

// ==================================================================
// BUCLES GLOBALES
// ==================================================================
// chat ambient cada 6s (70% de probabilidad, evita repetir el ultimo mensaje)
const lastAmbient: Record<string, string> = {};
setInterval(() => {
  if (Math.random() > 0.72) return;
  const room = pick(ROOMS);
  const bot = pick(BOTS);
  const pool = AMBIENT[room.id] ?? AMBIENT.general;
  let body = pick(pool);
  for (let i = 0; i < 3 && body === lastAmbient[room.id]; i++) body = pick(pool);
  lastAmbient[room.id] = body;
  const msg: ChatMsg = {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    room: room.id, author: bot.name, country: bot.country, body, ts: Date.now(), bot: true,
  };
  pushMsg(room.id, msg);
  io.to(room.id).emit("chat:msg", msg);
}, 6000);

// tick del multijugador cada 1s: estado siempre en emision (los cambios de fase
// llegan al cliente sin depender de acciones); acciones del jugador ademas
// disparan broadcast con throttle de 200ms
setInterval(() => {
  mpTick();
  io.emit("mp:state", mp);
}, 1000);

io.emit("chat:online", onlineSnapshot());

console.log(`[vanguard-game-service] escuchando en :${PORT} — salas: ${ROOMS.length} · territorios MP: ${MP_TERRITORIES.length}`);
