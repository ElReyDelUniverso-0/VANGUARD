// Vanguard v17 — DUELO DE TRIVIA PvP 1v1 EN TIEMPO REAL (servidor :3003).
// Cola de emparejamiento (rival humano o bot a los 5s), 7 preguntas de 9s,
// puntos por velocidad (500 base + hasta 400 por rapidez), revelación con
// puntuación en vivo, victoria por abandono si el rival se desconecta.
// El cliente premia con monedas/gemas/XP y registra el ELO en /api/mp/stats.
import type { Server, Socket } from "socket.io";
import { DUEL_QUESTIONS, type DuelQuestion } from "./duel-questions";

const MATCH_QUESTIONS = 7;
const QUESTION_MS = 9_000;
const REVEAL_MS = 2_800;
const COUNTDOWN_MS = 3_200;
const QUEUE_FILL_MS = 5_000;
const CLEANUP_MS = 14_000;

interface DuelSide {
  sid: string; pid: string; name: string;
  score: number; correct: number;
  answer: number | null; answerAt: number;
  isBot: boolean;
}

interface DuelMatch {
  id: number;
  sides: [DuelSide, DuelSide];
  qs: DuelQuestion[];
  qIdx: number; // -1 durante la cuenta atras
  qStart: number;
  phase: "COUNTDOWN" | "QUESTION" | "REVEAL" | "ENDED";
  phaseEnds: number;
  result: { winnerIdx: number | null; walkover: boolean } | null;
}

let ioRef: Server;
const matches = new Map<number, DuelMatch>();
const sidToMatch = new Map<string, number>();
let matchSeq = 0;
let waiting: { sid: string; pid: string; name: string; since: number; timer: NodeJS.Timeout } | null = null;

const DUEL_BOT_NAMES = ["AGATA_IX", "VECTOR_77", "SOMBRA_3", "KRAKEN", "ZORRO_BLANCO", "NIGHTOWL", "CENTINELA"];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function pickQuestions(n: number): DuelQuestion[] {
  return [...DUEL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, n);
}

function makeBotSide(): DuelSide {
  const sid = `bot-${Math.random().toString(36).slice(2, 8)}`;
  return {
    sid, pid: sid, name: pick(DUEL_BOT_NAMES),
    score: 0, correct: 0, answer: null, answerAt: 0, isBot: true,
  };
}

function makeHumanSide(sid: string, pid: string, name: string): DuelSide {
  return {
    sid, pid: String(pid ?? "").slice(0, 40), name: String(name ?? "OPERADOR").slice(0, 18) || "OPERADOR",
    score: 0, correct: 0, answer: null, answerAt: 0, isBot: false,
  };
}

function gainFor(side: DuelSide, m: DuelMatch): number {
  if (side.answer == null) return 0;
  const q = m.qs[m.qIdx];
  if (!q || side.answer !== q.a) return 0;
  const elapsed = Math.max(0, side.answerAt - m.qStart);
  const speed = Math.max(0, 1 - elapsed / QUESTION_MS);
  return 500 + Math.round(400 * speed);
}

function createMatch(a: DuelSide, b: DuelSide) {
  const m: DuelMatch = {
    id: ++matchSeq,
    sides: [a, b],
    qs: pickQuestions(MATCH_QUESTIONS),
    qIdx: -1,
    qStart: 0,
    phase: "COUNTDOWN",
    phaseEnds: Date.now() + COUNTDOWN_MS,
    result: null,
  };
  matches.set(m.id, m);
  sidToMatch.set(a.sid, m.id);
  sidToMatch.set(b.sid, m.id);
  broadcast(m);
}

function broadcast(m: DuelMatch) {
  for (let i = 0; i < 2; i++) {
    const side = m.sides[i];
    if (side.isBot) continue;
    ioRef.to(side.sid).emit("duel:state", publicMatch(m, i));
  }
}

function publicMatch(m: DuelMatch, viewer: number) {
  const rival = m.sides[1 - viewer];
  const me = m.sides[viewer];
  const q = m.qIdx >= 0 ? m.qs[m.qIdx] : null;
  const showAnswer = m.phase === "REVEAL" || m.phase === "ENDED";
  return {
    id: m.id,
    phase: m.phase,
    qIdx: m.qIdx,
    total: m.qs.length,
    phaseEnds: m.phaseEnds,
    question: q
      ? { text: q.q, opts: q.opts, cat: q.cat, ...(showAnswer ? { a: q.a } : {}) }
      : null,
    me: {
      name: me.name, score: me.score, correct: me.correct,
      answered: me.answer != null, lastGain: m.phase === "REVEAL" ? gainFor(me, m) : 0,
    },
    rival: {
      name: rival.name, isBot: rival.isBot, score: rival.score, correct: rival.correct,
      answered: rival.answer != null, lastGain: m.phase === "REVEAL" ? gainFor(rival, m) : 0,
    },
    result: m.result
      ? {
          outcome: m.result.winnerIdx == null ? "TIE" : m.result.winnerIdx === viewer ? "WIN" : "LOSS",
          walkover: m.result.walkover,
          eloDelta: m.result.winnerIdx == null ? 5 : m.result.winnerIdx === viewer ? 22 : -14,
        }
      : null,
  };
}

function clearSideAnswer(m: DuelMatch) {
  for (const s of m.sides) { s.answer = null; s.answerAt = 0; }
}

function goReveal(m: DuelMatch) {
  m.phase = "REVEAL";
  m.phaseEnds = Date.now() + REVEAL_MS;
  const g0 = gainFor(m.sides[0], m);
  const g1 = gainFor(m.sides[1], m);
  m.sides[0].score += g0;
  m.sides[1].score += g1;
  if (g0 > 0) m.sides[0].correct += 1;
  if (g1 > 0) m.sides[1].correct += 1;
  broadcast(m);
}

function startQuestion(m: DuelMatch) {
  m.qIdx += 1;
  m.phase = "QUESTION";
  m.qStart = Date.now();
  m.phaseEnds = m.qStart + QUESTION_MS;
  clearSideAnswer(m);
  broadcast(m);
  // programar respuesta del bot si esta en la partida
  for (let i = 0; i < 2; i++) {
    const side = m.sides[i];
    if (!side.isBot) continue;
    const delay = 1_200 + Math.random() * 6_000;
    setTimeout(() => {
      const cur = matches.get(m.id);
      if (!cur || cur.phase !== "QUESTION" || cur.qIdx !== m.qIdx || side.answer != null) return;
      const q = cur.qs[cur.qIdx];
      side.answerAt = Date.now();
      side.answer = Math.random() < 0.62 ? q.a : (q.a + 1 + Math.floor(Math.random() * 3)) % 4;
      if (cur.sides[0].answer != null && cur.sides[1].answer != null) goReveal(cur);
    }, delay);
  }
}

function endDuel(m: DuelMatch, winnerIdx: number | null, walkover = false) {
  m.phase = "ENDED";
  m.result = { winnerIdx, walkover };
  m.phaseEnds = Date.now() + CLEANUP_MS;
  broadcast(m);
}

function walkover(m: DuelMatch, loserSid: string) {
  if (m.phase === "ENDED") return;
  const idx = m.sides.findIndex((s) => s.sid === loserSid);
  if (idx < 0) return;
  endDuel(m, 1 - idx, true);
}

function cleanupMatch(m: DuelMatch) {
  matches.delete(m.id);
  for (const s of m.sides) {
    if (sidToMatch.get(s.sid) === m.id) sidToMatch.delete(s.sid);
  }
  for (const s of m.sides) {
    if (!s.isBot) ioRef.to(s.sid).emit("duel:closed", { id: m.id });
  }
}

export function setupDuel(io: Server) {
  ioRef = io;

  // bucle global 200ms: fases del duelo
  setInterval(() => {
    const now = Date.now();
    for (const m of [...matches.values()]) {
      if (m.phase === "COUNTDOWN" && now >= m.phaseEnds) {
        startQuestion(m);
      } else if (m.phase === "QUESTION" && now >= m.phaseEnds) {
        goReveal(m);
      } else if (m.phase === "REVEAL" && now >= m.phaseEnds) {
        if (m.qIdx + 1 >= m.qs.length) {
          const w = m.sides[0].score === m.sides[1].score ? null : m.sides[0].score > m.sides[1].score ? 0 : 1;
          endDuel(m, w);
        } else {
          startQuestion(m);
        }
      } else if (m.phase === "ENDED" && now >= m.phaseEnds) {
        cleanupMatch(m);
      }
    }
  }, 200);

  io.on("connection", (socket: Socket) => {
    socket.on("duel:queue", (d: { playerId: string; name: string }, cb?: (r: { ok: boolean; reason?: string }) => void) => {
      // si su duelo anterior ya terminó, liberarlo para que pueda revancha
      const mid0 = sidToMatch.get(socket.id);
      if (mid0) {
        const m0 = matches.get(mid0);
        if (m0 && m0.phase === "ENDED") cleanupMatch(m0);
        else { cb?.({ ok: false, reason: "Ya estas en un duelo" }); return; }
      }
      const me = { sid: socket.id, pid: String(d?.playerId ?? "anon"), name: String(d?.name ?? "OPERADOR") };

      if (waiting && waiting.sid !== socket.id && ioRef.sockets.sockets.has(waiting.sid)) {
        // rival humano listo — emparejar ya
        if (waiting.timer) clearTimeout(waiting.timer);
        const rival = waiting;
        waiting = null;
        createMatch(makeHumanSide(rival.sid, rival.pid, rival.name), makeHumanSide(me.sid, me.pid, me.name));
        cb?.({ ok: true });
        return;
      }

      if (waiting && waiting.sid === socket.id) { cb?.({ ok: true }); return; }

      // entrar en cola con relleno de bot a los 5s
      const timer = setTimeout(() => {
        if (waiting && waiting.sid === socket.id) {
          waiting = null;
          if (!sidToMatch.has(socket.id)) {
            createMatch(makeHumanSide(socket.id, me.pid, me.name), makeBotSide());
          }
        }
      }, QUEUE_FILL_MS);
      waiting = { ...me, since: Date.now(), timer };
      cb?.({ ok: true });
    });

    socket.on("duel:cancel", () => {
      if (waiting && waiting.sid === socket.id) {
        if (waiting.timer) clearTimeout(waiting.timer);
        waiting = null;
      }
    });

    socket.on("duel:answer", (d: { idx: number }) => {
      const mid = sidToMatch.get(socket.id);
      if (!mid) return;
      const m = matches.get(mid);
      if (!m || m.phase !== "QUESTION") return;
      const idx = m.sides.findIndex((s) => s.sid === socket.id);
      if (idx < 0) return;
      const side = m.sides[idx];
      if (side.answer != null) return;
      const pickIdx = Math.max(0, Math.min(3, Math.floor(Number(d?.idx ?? -1))));
      if (pickIdx < 0) return;
      side.answer = pickIdx;
      side.answerAt = Date.now();
      if (m.sides[0].answer != null && m.sides[1].answer != null) goReveal(m);
      else {
        // feedback inmediato al que ya respondió (el rival ve "respondió")
        const sock = ioRef.sockets.sockets.get(socket.id);
        if (sock) sock.emit("duel:state", publicMatch(m, idx));
        const rival = m.sides[1 - idx];
        if (!rival.isBot) {
          const rs = ioRef.sockets.sockets.get(rival.sid);
          if (rs) rs.emit("duel:state", publicMatch(m, 1 - idx));
        }
      }
    });

    socket.on("duel:quit", () => {
      const mid = sidToMatch.get(socket.id);
      if (!mid) return;
      const m = matches.get(mid);
      if (!m) return;
      if (m.phase === "ENDED") {
        cleanupMatch(m);
      } else {
        walkover(m, socket.id);
      }
    });

    socket.on("disconnect", () => {
      if (waiting && waiting.sid === socket.id) {
        if (waiting.timer) clearTimeout(waiting.timer);
        waiting = null;
      }
      const mid = sidToMatch.get(socket.id);
      if (!mid) return;
      const m = matches.get(mid);
      if (m) walkover(m, socket.id);
    });
  });
}
