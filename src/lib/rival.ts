"use client";

// v67.0 EL HANGAR — RIVAL AUTOMÁTICO (competencia instintiva personalizada).
// Un agente-bot determinista generado desde TU alias: siempre tu nivel ±1,
// acumula puntos semanales a un ritmo creíble y se burla con gracia cuando va
// ganando. Puntos propios: cada ⓒ ganada suma 1 punto de rivalidad semanal.

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game-store";

export interface Rival {
  name: string;
  level: number;
  rank: string;
  points: number;
  taunt: string;
}

const RIVAL_NAMES = ["HEX", "NOCTURNO", "VERITAS", "SOMBRA-9", "KRAKEN", "ÁBACO", "CENTINELA", "MIRAGE", "VÓRTICE", "LOBOSOL"];
const TAUNTS_AHEAD = [
  "Sigo delante. ¿Esa es toda tu inteligencia?",
  "Mi abuela analiza mejor con el televisor apagado.",
  "Te dejaré leer mis informes… si alcanzas.",
  "El ranking tiene una forma: la mía.",
];
const TAUNTS_BEHIND = [
  "Disfruta la ventaja, es prestada.",
  "Estoy estudiando tus patrones. Literalmente.",
  "La semana no ha terminado, agente.",
  "Cada punto tuyo me entrena. Gracias.",
];

interface RivalState { weekKey: string; points: number; }

const RIVAL_KEY = "vanguard-rival-v67";
const MY_KEY = "vanguard-rival-me-v67";

function weekKey(): string {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 1);
  const week = Math.floor((d.getTime() - start.getTime()) / (7 * 86400000));
  return `${d.getFullYear()}-W${week}`;
}

function load(key: string): RivalState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const j = JSON.parse(raw) as RivalState;
    return j.weekKey === weekKey() ? j : null;
  } catch {
    return null;
  }
}

function save(key: string, s: RivalState) {
  try {
    localStorage.setItem(key, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

// nombre y temperamento deterministas desde el alias del jugador
function hashStr(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function getRival(alias: string, myLevel: number): Rival {
  const h = hashStr((alias || "AGENTE") + "-rival");
  const name = RIVAL_NAMES[h % RIVAL_NAMES.length];
  const level = Math.max(1, myLevel + ((h % 3) - 1));
  const stored = load(RIVAL_KEY);
  // ritmo del rival: 4-11 pts/hora vivos esta semana + fondo semanal
  const hoursIntoWeek = ((Date.now() % (7 * 86400000)) / 3600000);
  const pace = 4 + (h % 8);
  const points = stored?.points ?? Math.round(hoursIntoWeek * pace + (h % 40));
  return {
    name: `AGT-${name}`,
    level,
    rank: level >= 25 ? "MARISCAL" : level >= 16 ? "MAYOR" : level >= 8 ? "TENIENTE" : level >= 3 ? "CABO" : "RECLUTA",
    points,
    taunt: "",
  };
}

export function getMyRivalPoints(): number {
  return load(MY_KEY)?.points ?? 0;
}

export function addMyRivalPoints(n: number) {
  const cur = load(MY_KEY) ?? { weekKey: weekKey(), points: 0 };
  cur.weekKey = weekKey();
  cur.points += n;
  save(MY_KEY, cur);
}

/** Tira con puntajes en vivo. La punta del jugador gana 5ⓒ semanales cuando supera al rival. */
export function useRivalStrip() {
  const { alias, level, coins } = useGameStore();
  const [rival, setRival] = useState<Rival | null>(null);
  const [mine, setMine] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const r = getRival(alias || "AGENTE", level);
      // vivo: el rival gana puntos mientras miras
      const jitter = Math.floor((Date.now() / 60000) % 60) * (1 + (hashStr(r.name) % 3));
      r.points += jitter % 23;
      setRival(r);
      setMine(getMyRivalPoints());
    };
    refresh();
    const iv = setInterval(refresh, 30000);
    return () => clearInterval(iv);
  }, [alias, level, coins]);

  const ahead = rival ? mine >= rival.points : true;
  const taunts = ahead ? TAUNTS_BEHIND : TAUNTS_AHEAD;
  const rivalFinal: Rival | null = rival
    ? { ...rival, taunt: taunts[hashStr(rival.name + weekKey()) % taunts.length] }
    : null;
  return { rival: rivalFinal, mine, ahead };
}
