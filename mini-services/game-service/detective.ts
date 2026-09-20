// Vanguard v11 — ARCHIVOS NACIÓN: DETECTIVE MULTIJUGADOR (servidor :3003).
// Juego de deduccion social por salas (una sala por caso historico):
//   LOBBY -> INVESTIGACION (buscar/interrogar) -> DELIBERACION -> JUICIO (votos) -> VEREDICTO.
// Un jugador (o bot) es el INSTIGADOR: conoce al culpable, planta pistas falsas y desvia votos.
// Las pistas falsas (ENGAÑO) tienen fiabilidad BAJA; los detectives ganan si acusan al culpable.
import type { Server, Socket } from "socket.io";
import {
  DET_CASES, DET_CLUE_STRONG, DET_CLUE_WEAK, DET_CLUE_FAKE,
  DET_ANSWER_INNOCENT, DET_ANSWER_GUILTY, DET_BOT_NAMES, DET_BOT_LINES,
  type DetCase,
} from "./detective-data";

const PORT_PHASES = {
  LOBBY: 18_000,
  INVESTIGACION: 50_000,
  DELIBERACION: 32_000,
  JUICIO: 22_000,
  VEREDICTO: 24_000,
};
const MAX_ACTIONS = 5;
const BOT_ACTIONS = 3; // los bots investigan con menos acciones para no vaciar el tablero
const ROOM_SIZE = 5; // humanos + bots

type Phase = "LOBBY" | "INVESTIGACION" | "DELIBERACION" | "JUICIO" | "VEREDICTO";

interface Clue {
  id: string;
  suspectId: string;
  text: string;
  reliability: "ALTA" | "MEDIA" | "BAJA";
  fake: boolean;
  locationId: string | null; // null = anonima (plantada)
  found: boolean;
  anonymous: boolean;
}

interface DetPlayer {
  id: string;
  name: string;
  isBot: boolean;
  connected: boolean;
  actions: number;
  role: "DETECTIVE" | "INSTIGADOR";
  planted: boolean; // instigador ya uso su pista falsa
  vote: string | null;
  interrogated: string[]; // sospechosos ya interrogados por este jugador
}

interface DetChatMsg { id: string; name: string; body: string; ts: number; bot?: boolean }

interface DetRoom {
  caseId: string;
  matchId: number;
  phase: Phase;
  phaseEnds: number;
  startAt: number | null;
  guiltyId: string;
  instigadorId: string | null;
  players: Record<string, DetPlayer>;
  clues: Clue[];
  locationPools: Record<string, string[]>; // locationId -> clue ids ocultas
  board: string[]; // clue ids descubiertas
  log: { ts: number; msg: string; color?: string }[];
  chat: DetChatMsg[]; // v17: chat libre durante la deliberación
  verdict: {
    guiltyId: string; accusedId: string; correct: boolean;
    tally: Record<string, number>; recap: string;
  } | null;
  seq: number;
}

const rooms = new Map<string, DetRoom>();
let matchSeq = 0;
let clueSeq = 0;

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

function fillTpl(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function freshRoom(c: DetCase): DetRoom {
  return {
    caseId: c.id, matchId: ++matchSeq, phase: "LOBBY", phaseEnds: 0, startAt: null,
    guiltyId: "", instigadorId: null,
    players: {}, clues: [], locationPools: {}, board: [],
    log: [{ ts: Date.now(), msg: "SALA ABIERTA — los detectives pueden unirse al caso", color: "#22d3ee" }],
    chat: [],
    verdict: null, seq: 0,
  };
}

for (const c of DET_CASES) rooms.set(c.id, freshRoom(c));

function roomLog(room: DetRoom, msg: string, color?: string) {
  room.log.push({ ts: Date.now(), msg, color });
  if (room.log.length > 50) room.log.splice(0, room.log.length - 50);
}

// ================== GENERACION DE PARTIDA ==================
function startMatch(room: DetRoom) {
  const c = DET_CASES.find((x) => x.id === room.caseId)!;
  room.matchId = ++matchSeq;
  room.guiltyId = pick(c.suspects).arch;
  // convierte arch -> id real del sospechoso (id == arch en este diseno)
  const suspectIds = c.suspects.map((s) => s.arch);

  // 1) culpable: 3 pistas fuertes repartidas en 3 ubicaciones distintas
  const locs = c.locations.map((l) => l.id);
  const strongLocs = shuffle(locs).slice(0, Math.min(3, locs.length));
  const strongTpls = shuffle(DET_CLUE_STRONG);
  const pools: Record<string, string[]> = {};
  for (const l of locs) pools[l] = [];

  for (let i = 0; i < 3; i++) {
    const id = `clue-${++clueSeq}`;
    room.clues.push({
      id, suspectId: room.guiltyId,
      text: fillTpl(strongTpls[i % strongTpls.length], {
        sus: suspectName(c, room.guiltyId), loc: locName(c, strongLocs[i]), subj: c.subject,
      }),
      reliability: "ALTA", fake: false, locationId: strongLocs[i], found: false, anonymous: false,
    });
    pools[strongLocs[i]].push(id);
  }

  // 2) inocentes: 1 indicio MEDIA cada uno + 2 indicios extra para no quedarnos cortos
  const innocents = suspectIds.filter((s) => s !== room.guiltyId);
  const weakTpls = shuffle(DET_CLUE_WEAK);
  let locIdx = 0;
  for (const inn of innocents) {
    const id = `clue-${++clueSeq}`;
    const loc = locs[locIdx++ % locs.length];
    room.clues.push({
      id, suspectId: inn,
      text: fillTpl(weakTpls[(locIdx + 2) % weakTpls.length], {
        sus: suspectName(c, inn), loc: locName(c, loc), subj: c.subject,
      }),
      reliability: "MEDIA", fake: false, locationId: loc, found: false, anonymous: false,
    });
    pools[loc].push(id);
  }
  for (const inn of shuffle(innocents).slice(0, 2)) {
    const id = `clue-${++clueSeq}`;
    const loc = locs[locIdx++ % locs.length];
    room.clues.push({
      id, suspectId: inn,
      text: fillTpl(weakTpls[(locIdx + 4) % weakTpls.length], {
        sus: suspectName(c, inn), loc: locName(c, loc), subj: c.subject,
      }),
      reliability: "MEDIA", fake: false, locationId: loc, found: false, anonymous: false,
    });
    pools[loc].push(id);
  }

  // 3) 2 pistas falsas pre-plantadas (ENGAÑO) sobre inocentes al azar
  const fakeTpls = shuffle(DET_CLUE_FAKE);
  const fakeTargets = shuffle(innocents).slice(0, 2);
  fakeTargets.forEach((target, i) => {
    const id = `clue-${++clueSeq}`;
    const loc = locs[locIdx++ % locs.length];
    room.clues.push({
      id, suspectId: target,
      text: fillTpl(fakeTpls[i], { sus: suspectName(c, target), loc: locName(c, loc), subj: c.subject }),
      reliability: "BAJA", fake: true, locationId: loc, found: false, anonymous: false,
    });
    pools[loc].push(id);
  });

  room.locationPools = pools;
  room.board = [];
  room.verdict = null;

  // 4) rellenar sala con bots y repartir roles
  const humans = Object.values(room.players).filter((p) => p.isBot === false);
  const botPool = shuffle(DET_BOT_NAMES);
  let botsNeeded = Math.max(0, ROOM_SIZE - humans.length);
  for (const p of Object.values(room.players)) {
    p.actions = MAX_ACTIONS;
    p.planted = false;
    p.vote = null;
    p.interrogated = [];
    p.role = "DETECTIVE";
    p.connected = p.isBot ? p.connected : true;
  }
  while (botsNeeded-- > 0) {
    const id = `bot-${room.caseId}-${botPool[(botsNeeded + 7) % botPool.length]}-${Math.floor(Math.random() * 999)}`;
    room.players[id] = {
      id, name: botPool[Math.abs(hashCode(id)) % botPool.length], isBot: true, connected: true,
      actions: BOT_ACTIONS, role: "DETECTIVE", planted: false, vote: null, interrogated: [],
    };
  }
  // instigador: 1 al azar entre todos (humanos incluidos)
  const all = Object.keys(room.players);
  room.instigadorId = pick(all);
  room.players[room.instigadorId].role = "INSTIGADOR";

  room.phase = "INVESTIGACION";
  room.phaseEnds = Date.now() + PORT_PHASES.INVESTIGACION;
  roomLog(room, `CASO ABIERTO: ${c.title} — responsable secreto asignado. Un instigador se infiltró.`, "#f5a623");
}

function suspectName(c: DetCase, id: string): string {
  return c.suspects.find((s) => s.arch === id)?.name ?? id;
}
function locName(c: DetCase, id: string): string {
  return c.locations.find((l) => l.id === id)?.name ?? id;
}
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
  return h;
}

// ================== ACCIONES ==================
function doSearch(room: DetRoom, p: DetPlayer, locationId: string): { ok: boolean; reason?: string } {
  if (room.phase !== "INVESTIGACION" && room.phase !== "DELIBERACION") return { ok: false, reason: "Solo en investigacion" };
  if (p.actions <= 0) return { ok: false, reason: "Sin acciones restantes" };
  const pool = room.locationPools[locationId];
  if (!pool) return { ok: false, reason: "Ubicacion inexistente" };
  const hidden = pool.filter((id) => !room.clues.find((c) => c.id === id)!.found);
  if (hidden.length === 0) return { ok: false, reason: "No queda nada por registrar aqui" };
  p.actions -= 1;
  const clueId = pick(hidden);
  const clue = room.clues.find((x) => x.id === clueId)!;
  clue.found = true;
  room.board.push(clue.id);
  const c = DET_CASES.find((x) => x.id === room.caseId)!;
  const remaining = pool.filter((id) => !room.clues.find((x) => x.id === id)!.found).length;
  roomLog(room, `${p.name} registro ${locName(c, locationId)} — pista ${clue.reliability} contra ${suspectName(c, clue.suspectId)}${remaining > 0 ? ` (quedan ${remaining} en el lugar)` : " (lugar limpio)"}`, clue.reliability === "ALTA" ? "#4ade80" : "#9ca3af");
  return { ok: true };
}

function doInterrogate(room: DetRoom, p: DetPlayer, suspectId: string): { ok: boolean; answer?: string; reason?: string } {
  if (room.phase !== "INVESTIGACION" && room.phase !== "DELIBERACION") return { ok: false, reason: "Solo en investigacion" };
  if (p.actions <= 0) return { ok: false, reason: "Sin acciones restantes" };
  const c = DET_CASES.find((x) => x.id === room.caseId)!;
  const suspect = c.suspects.find((s) => s.arch === suspectId);
  if (!suspect) return { ok: false, reason: "Sospechoso inexistente" };
  if (p.interrogated.includes(suspectId)) return { ok: false, reason: "Ya interrogado: no dira nada nuevo" };
  p.actions -= 1;
  p.interrogated.push(suspectId);

  const others = c.suspects.filter((s) => s.arch !== suspectId).map((s) => s.arch);
  let answer: string;
  if (suspectId === room.guiltyId) {
    // ENGAÑO del culpable: desvia hacia un inocente
    const other = pick(others);
    answer = fillTpl(pick(DET_ANSWER_GUILTY), {
      other: suspectName(c, other), loc: locName(c, pick(c.locations).id), subj: c.subject,
    });
  } else {
    // verdad parcial: pista sobre un tercero o sobre el culpable (60%)
    const about = Math.random() < 0.6 ? room.guiltyId : pick(others);
    answer = fillTpl(pick(DET_ANSWER_INNOCENT), {
      other: suspectName(c, about), loc: locName(c, pick(c.locations).id), subj: c.subject,
    });
  }
  roomLog(room, `${p.name} interrogó a ${suspect.name}: "${answer}"`, "#22d3ee");
  return { ok: true, answer };
}

function doPlant(room: DetRoom, p: DetPlayer, suspectId: string): { ok: boolean; reason?: string } {
  if (p.role !== "INSTIGADOR") return { ok: false, reason: "Solo el instigador puede plantar" };
  if (p.planted) return { ok: false, reason: "Ya usaste tu pista falsa" };
  if (suspectId === room.guiltyId) return { ok: false, reason: "No puedes incriminar al culpable que proteges" };
  const c = DET_CASES.find((x) => x.id === room.caseId)!;
  if (!c.suspects.find((s) => s.arch === suspectId)) return { ok: false, reason: "Sospechoso inexistente" };
  p.planted = true;
  const id = `clue-${++clueSeq}`;
  room.clues.push({
    id, suspectId,
    text: fillTpl(pick(DET_CLUE_FAKE), { sus: suspectName(c, suspectId), loc: locName(c, pick(c.locations).id), subj: c.subject }),
    reliability: "BAJA", fake: true, locationId: null, found: true, anonymous: true,
  });
  room.board.push(id);
  roomLog(room, "PISTA ANONIMA apareció en el tablero — fuente no verificada, fiabilidad BAJA", "#ef4444");
  return { ok: true };
}

function doVote(room: DetRoom, p: DetPlayer, suspectId: string): { ok: boolean; reason?: string } {
  if (room.phase !== "JUICIO") return { ok: false, reason: "Solo durante el juicio" };
  const c = DET_CASES.find((x) => x.id === room.caseId)!;
  if (!c.suspects.find((s) => s.arch === suspectId)) return { ok: false, reason: "Sospechoso inexistente" };
  p.vote = suspectId;
  roomLog(room, `${p.name} emitió su veredicto`, "#f5a623");
  return { ok: true };
}

// ================== BOTS ==================
function botTick(room: DetRoom) {
  const c = DET_CASES.find((x) => x.id === room.caseId)!;
  const bots = Object.values(room.players).filter((p) => p.isBot && p.connected);
  if (room.phase === "INVESTIGACION") {
    for (const b of bots) {
      if (b.actions <= 0 || Math.random() > 0.22) continue;
      const locs = c.locations.map((l) => l.id).filter((l) => room.locationPools[l].some((id) => !room.clues.find((x) => x.id === id)!.found));
      if (locs.length === 0) {
        const alive = c.suspects.map((s) => s.arch).filter((s) => !b.interrogated.includes(s));
        if (alive.length > 0) doInterrogate(room, b, pick(alive));
        continue;
      }
      if (Math.random() < 0.25) {
        const alive = c.suspects.map((s) => s.arch).filter((s) => !b.interrogated.includes(s));
        if (alive.length > 0) doInterrogate(room, b, pick(alive));
      } else {
        doSearch(room, b, pick(locs));
      }
    }
  }
  if (room.phase === "DELIBERACION") {
    const instigador = room.instigadorId ? room.players[room.instigadorId] : null;
    if (instigador && instigador.isBot && !instigador.planted && Math.random() < 0.5) {
      const innocents = c.suspects.map((s) => s.arch).filter((s) => s !== room.guiltyId);
      doPlant(room, instigador, pick(innocents));
    }
    if (Math.random() < 0.6) {
      const b = pick(bots);
      if (b) {
        const line = pick(DET_BOT_LINES);
        roomLog(room, `${b.name}: "${line}"`, "#8b8b8b");
        // v17: los bots también debaten en el chat libre
        room.chat.push({ id: `dc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: b.name, body: line, ts: Date.now(), bot: true });
        if (room.chat.length > 50) room.chat.splice(0, room.chat.length - 50);
      }
    }
  }
  if (room.phase === "JUICIO") {
    const strongFound = room.board.filter((id) => room.clues.find((x) => x.id === id)?.reliability === "ALTA").length;
    for (const b of bots) {
      if (b.vote || Math.random() > 0.35) continue;
      if (b.role === "INSTIGADOR") {
        b.vote = pick(c.suspects.map((s) => s.arch).filter((s) => s !== room.guiltyId));
      } else {
        const pCorrect = Math.min(0.85, 0.3 + 0.11 * strongFound);
        b.vote = Math.random() < pCorrect ? room.guiltyId : pick(c.suspects.map((s) => s.arch).filter((s) => s !== room.guiltyId));
      }
    }
  }
}

// ================== FASES ==================
function tickRoom(room: DetRoom) {
  const now = Date.now();
  if (room.phase === "LOBBY") {
    if (room.startAt && now >= room.startAt) startMatch(room);
    return;
  }
  botTick(room);
  if (now < room.phaseEnds) return;

  if (room.phase === "INVESTIGACION") {
    room.phase = "DELIBERACION";
    room.phaseEnds = now + PORT_PHASES.DELIBERACION;
    roomLog(room, "FIN DE LA INVESTIGACION — deliberad con el tablero abierto. El instigador puede plantar su engaño.", "#f5a623");
  } else if (room.phase === "DELIBERACION") {
    room.phase = "JUICIO";
    room.phaseEnds = now + PORT_PHASES.JUICIO;
    roomLog(room, "JUICIO ABIERTO — emitan su acusacion final. Se revelara al culpable real.", "#ef4444");
    room.chat.push({ id: `dc-sys-${now}`, name: "SISTEMA", body: "El chat queda abierto hasta el final del juicio — convencan a los demás detectives", ts: now });
  } else if (room.phase === "JUICIO") {
    // veredicto por mayoria simple
    const c = DET_CASES.find((x) => x.id === room.caseId)!;
    const tally: Record<string, number> = {};
    for (const p of Object.values(room.players)) {
      if (p.vote) tally[p.vote] = (tally[p.vote] ?? 0) + 1;
    }
    let accusedId = room.guiltyId;
    let maxVotes = 0;
    for (const [sid, n] of Object.entries(tally)) {
      if (n > maxVotes) { maxVotes = n; accusedId = sid; }
    }
    const correct = accusedId === room.guiltyId;
    room.verdict = { guiltyId: room.guiltyId, accusedId, correct, tally, recap: c.recap };
    room.phase = "VEREDICTO";
    room.phaseEnds = now + PORT_PHASES.VEREDICTO;
    roomLog(room, correct
      ? `VEREDICTO CORRECTO: ${suspectName(c, accusedId)} era el responsable. Los detectives ganan.`
      : `VEREDICTO ERRONEO: acusaron a ${suspectName(c, accusedId)}. El instigador ha ganado — el responsable era ${suspectName(c, room.guiltyId)}.`,
      correct ? "#4ade80" : "#ef4444");
  } else if (room.phase === "VEREDICTO") {
    // reinicio completo: cada detective se une de nuevo (y paga su fianza) a la siguiente ronda
    const mid = room.matchId;
    const fresh = freshRoom(DET_CASES.find((x) => x.id === room.caseId)!);
    fresh.matchId = mid;
    room.phase = fresh.phase;
    room.phaseEnds = 0;
    room.startAt = null;
    room.players = fresh.players;
    room.clues = [];
    room.locationPools = {};
    room.board = [];
    room.log = fresh.log;
    room.verdict = null;
    room.guiltyId = "";
    room.instigadorId = null;
    roomLog(room, "NUEVO CASO DISPONIBLE — unete de nuevo para jugar la siguiente ronda", "#22d3ee");
  }
}

// ================== SNAPSHOTS PUBLICOS ==================
function publicRoom(room: DetRoom) {
  const c = DET_CASES.find((x) => x.id === room.caseId)!;
  return {
    caseId: room.caseId,
    matchId: room.matchId,
    phase: room.phase,
    phaseEnds: room.phaseEnds,
    startAt: room.startAt,
    players: Object.values(room.players).map((p) => ({
      id: p.id, name: p.name, isBot: p.isBot, connected: p.connected,
      voteDone: !!p.vote, actions: p.actions,
    })),
    suspects: c.suspects,
    locations: c.locations.map((l) => ({
      ...l,
      cluesLeft: (room.locationPools[l.id] ?? []).filter((id) => !room.clues.find((x) => x.id === id)?.found).length,
    })),
    board: room.board.map((id) => {
      const cl = room.clues.find((x) => x.id === id)!;
      return {
        id, suspectId: cl.suspectId, text: cl.text, reliability: cl.reliability,
        anonymous: cl.anonymous, locationId: cl.locationId,
      };
    }),
    votesCast: Object.values(room.players).filter((p) => p.vote).length,
    log: room.log.slice(-24),
    chat: room.chat.slice(-30),
    verdict: room.verdict,
    title: c.title, tagline: c.tagline, year: c.year, country: c.country,
    stake: c.stake, briefing: c.briefing, difficulty: c.difficulty,
  };
}

function meState(room: DetRoom | undefined, pid: string) {
  if (!room) return { caseId: null, inMatch: false };
  const p = room.players[pid];
  return {
    caseId: room.caseId,
    matchId: room.matchId,
    phase: room.phase,
    inMatch: !!p,
    role: p?.role ?? null,
    actions: p?.actions ?? 0,
    planted: p?.planted ?? false,
    myVote: p?.vote ?? null,
    // el instigador conoce al culpable que protege (solo para su socket)
    guilty: p?.role === "INSTIGADOR" ? room.guiltyId : null,
  };
}

// ================== REGISTRO SOCKET.IO ==================
const socketRooms = new Map<string, { pid: string; caseId: string | null }>();
let detIo: Server | null = null;
const lastDetChatAt = new WeakMap<Socket, number>();

function pushDetChat(room: DetRoom, msg: DetChatMsg) {
  room.chat.push(msg);
  if (room.chat.length > 50) room.chat.splice(0, room.chat.length - 50);
  // entrega inmediata a los suscritos de la sala
  if (!detIo) return;
  for (const [sid, link] of socketRooms.entries()) {
    if (link.caseId !== room.caseId) continue;
    detIo.sockets.sockets.get(sid)?.emit("det:chat", { caseId: room.caseId, msg });
  }
}

export function setupDetective(io: Server) {
  detIo = io;
  // bucle global 1s: fases + bots + broadcast
  setInterval(() => {
    let anyChange = false;
    for (const room of rooms.values()) {
      const before = `${room.phase}|${room.board.length}|${Object.values(room.players).filter((p) => p.vote).length}|${room.log.length}`;
      tickRoom(room);
      const after = `${room.phase}|${room.board.length}|${Object.values(room.players).filter((p) => p.vote).length}|${room.log.length}`;
      if (before !== after) anyChange = true;
      // broadcast por sala a los suscritos
      for (const [sid, link] of socketRooms.entries()) {
        if (link.caseId !== room.caseId) continue;
        const sock = io.sockets.sockets.get(sid);
        if (!sock) continue;
        sock.emit("det:state", publicRoom(room));
        sock.emit("det:me", meState(room, link.pid));
      }
    }
    if (anyChange) io.emit("det:rooms", roomsList());
  }, 1000);

  io.on("connection", (socket: Socket) => {
    socket.emit("det:rooms", roomsList());

    socket.on("det:subscribe", (d: { caseId?: string; pid: string }) => {
      const caseId = DET_CASES.find((c) => c.id === d?.caseId)?.id ?? null;
      socketRooms.set(socket.id, { pid: String(d?.pid ?? "anon"), caseId });
      socket.emit("det:rooms", roomsList());
      const room = caseId ? rooms.get(caseId) : undefined;
      if (room && caseId) {
        socket.emit("det:state", publicRoom(room));
        socket.emit("det:me", meState(room, String(d?.pid ?? "anon")));
      }
    });

    socket.on("det:join", (d: { caseId: string; pid: string; name: string }, cb?: (r: { ok: boolean; reason?: string }) => void) => {
      const c = DET_CASES.find((x) => x.id === d?.caseId);
      if (!c) { cb?.({ ok: false, reason: "Caso inexistente" }); return; }
      const room = rooms.get(c.id)!;
      const pid = String(d?.pid ?? "anon");
      const name = String(d?.name ?? "DETECTIVE").slice(0, 18) || "DETECTIVE";
      if (room.phase === "DELIBERACION" || room.phase === "JUICIO") {
        cb?.({ ok: false, reason: "Partida en curso demasiado avanzada — espera el siguiente caso" });
        return;
      }
      let p = room.players[pid];
      if (!p) {
        // si ya arranco la investigacion, entrada tardia con acciones reducidas
        const late = room.phase === "INVESTIGACION";
        p = {
          id: pid, name, isBot: false, connected: true,
          actions: late ? Math.max(2, MAX_ACTIONS - 2) : MAX_ACTIONS,
          role: "DETECTIVE", planted: false, vote: null, interrogated: [],
        };
        room.players[pid] = p;
        roomLog(room, `${name} se unio al caso${late ? " (entrada tardia)" : ""}`, "#22d3ee");
      } else {
        p.name = name;
        p.connected = true;
      }
      if (room.phase === "LOBBY" && !room.startAt) {
        room.startAt = Date.now() + PORT_PHASES.LOBBY;
        roomLog(room, `Caso tomado — la investigacion arranca en ${PORT_PHASES.LOBBY / 1000}s`, "#f5a623");
      }
      cb?.({ ok: true });
    });

    socket.on("det:leave", (d: { caseId: string; pid: string }) => {
      const room = rooms.get(d?.caseId);
      if (!room) return;
      const p = room.players[d?.pid];
      if (p) {
        if (room.phase === "INVESTIGACION" || room.phase === "DELIBERACION" || room.phase === "JUICIO") {
          roomLog(room, `${p.name} abandono el caso`, "#888");
        }
        if (room.instigadorId === p.id && room.phase !== "LOBBY") {
          // reasignar instigador a un bot para no romper la partida
          const bot = Object.values(room.players).find((x) => x.isBot);
          if (bot) { room.instigadorId = bot.id; bot.role = "INSTIGADOR"; }
        }
        delete room.players[p.id];
      }
    });

    socket.on("det:search", (d: { caseId: string; pid: string; locationId: string }, cb?: (r: { ok: boolean; reason?: string }) => void) => {
      const room = rooms.get(d?.caseId);
      const p = room?.players[d?.pid];
      if (!room || !p) { cb?.({ ok: false, reason: "No estas en el caso" }); return; }
      cb?.(doSearch(room, p, String(d?.locationId ?? "")));
    });

    socket.on("det:interrogate", (d: { caseId: string; pid: string; suspectId: string }, cb?: (r: { ok: boolean; answer?: string; reason?: string }) => void) => {
      const room = rooms.get(d?.caseId);
      const p = room?.players[d?.pid];
      if (!room || !p) { cb?.({ ok: false, reason: "No estas en el caso" }); return; }
      cb?.(doInterrogate(room, p, String(d?.suspectId ?? "")));
    });

    socket.on("det:plant", (d: { caseId: string; pid: string; suspectId: string }, cb?: (r: { ok: boolean; reason?: string }) => void) => {
      const room = rooms.get(d?.caseId);
      const p = room?.players[d?.pid];
      if (!room || !p) { cb?.({ ok: false, reason: "No estas en el caso" }); return; }
      cb?.(doPlant(room, p, String(d?.suspectId ?? "")));
    });

    socket.on("det:vote", (d: { caseId: string; pid: string; suspectId: string }, cb?: (r: { ok: boolean; reason?: string }) => void) => {
      const room = rooms.get(d?.caseId);
      const p = room?.players[d?.pid];
      if (!room || !p) { cb?.({ ok: false, reason: "No estas en el caso" }); return; }
      cb?.(doVote(room, p, String(d?.suspectId ?? "")));
    });

    // v17: chat libre de la sala (deliberación / juicio / veredicto)
    socket.on("det:chat", (d: { caseId: string; pid: string; body: string }, cb?: (r: { ok: boolean; reason?: string }) => void) => {
      const room = rooms.get(d?.caseId);
      const p = room?.players[d?.pid];
      if (!room || !p) { cb?.({ ok: false, reason: "No estas en el caso" }); return; }
      if (room.phase !== "DELIBERACION" && room.phase !== "JUICIO" && room.phase !== "VEREDICTO") {
        cb?.({ ok: false, reason: "El chat abre en la deliberación" }); return;
      }
      if (!d || typeof d.body !== "string") return;
      const body = d.body.trim().slice(0, 200);
      if (!body) return;
      const now = Date.now();
      if (now - (lastDetChatAt.get(socket) ?? 0) < 700) { cb?.({ ok: false, reason: "Tranquilo, agente" }); return; }
      lastDetChatAt.set(socket, now);
      pushDetChat(room, { id: `dc-${now}-${Math.random().toString(36).slice(2, 6)}`, name: p.name, body, ts: now });
      cb?.({ ok: true });
    });

    socket.on("disconnect", () => {
      const link = socketRooms.get(socket.id);
      if (link?.caseId) {
        const room = rooms.get(link.caseId);
        const p = room?.players[link.pid];
        if (p && !p.isBot) p.connected = false;
      }
      socketRooms.delete(socket.id);
    });
  });
}

function roomsList() {
  return DET_CASES.map((c) => {
    const room = rooms.get(c.id)!;
    return {
      caseId: c.id, country: c.country, title: c.title, tagline: c.tagline,
      year: c.year, difficulty: c.difficulty, stake: c.stake,
      phase: room.phase, startAt: room.startAt, phaseEnds: room.phaseEnds,
      humans: Object.values(room.players).filter((p) => !p.isBot).length,
      players: Object.keys(room.players).length,
      hasVerdict: !!room.verdict,
    };
  });
}
