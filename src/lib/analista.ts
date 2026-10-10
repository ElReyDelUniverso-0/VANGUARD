"use client";

// v101.0 EL REGRESO — PILAR 2: EL USUARIO PROGRESA
// PERFIL DE ANALISTA: la progresión con sentido. Nivel de analista, 14
// insignias, retos semanales de investigación y ELO de analista — todo
// computado de acciones REALES (cada número es verdadero, nada inflado).
// Fuente de verdad: los contadores que alimentan los 6 ganchos registrar()
// (expedientes, oscura, laboratorio, LA MENTE, creador, quiz) + el espejo de
// XP en game-store.addXp (todo XP ganado en cualquier panel sube el nivel).
// HONESTIDAD: sin recompensas que desaparezcan, sin presión falsa. Si no
// completas un reto semanal, no pierdes nada: la semana siguiente sigue.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { weekKeyOf, weekDaysLeft } from "./retention";

// ---------- rangos ----------
export const RANGOS_ANALISTA = [
  { n: 1, nombre: "RECLUTA INTEL", acento: "#8A90A8" },
  { n: 2, nombre: "VIGÍA", acento: "#7FE3FF" },
  { n: 3, nombre: "ANALISTA JR", acento: "#3DDCFF" },
  { n: 4, nombre: "ANALISTA", acento: "#38BDF8" },
  { n: 5, nombre: "ANALISTA SR", acento: "#00FF87" },
  { n: 6, nombre: "JEFE DE ESTACIÓN", acento: "#F5C542" },
  { n: 7, nombre: "DIRECTOR ADJUNTO", acento: "#FFB347" },
  { n: 8, nombre: "OJO DEL MUNDO", acento: "#FFD166" },
] as const;

export const XP_NIVEL = 60; // XP de analista por nivel (espejo de game-store)
export const NIVELES_MAX = 30;

// ---------- ELO ----------
export type TierElo = "TIERRA" | "BRONCE" | "PLATA" | "ORO" | "PLATINO" | "DIAMANTE" | "MAESTRO";
export const TIERS_ELO: { nombre: TierElo; desde: number; acento: string }[] = [
  { nombre: "TIERRA", desde: 0, acento: "#8A90A8" },
  { nombre: "BRONCE", desde: 1100, acento: "#C98A4B" },
  { nombre: "PLATA", desde: 1300, acento: "#B8C4D4" },
  { nombre: "ORO", desde: 1500, acento: "#F5C542" },
  { nombre: "PLATINO", desde: 1750, acento: "#7FE3FF" },
  { nombre: "DIAMANTE", desde: 2000, acento: "#3DDCFF" },
  { nombre: "MAESTRO", desde: 2300, acento: "#FFD166" },
];

// ---------- retos semanales ----------
export type RetoTipo = "exped" | "lab" | "mente" | "crea" | "quiz" | "oscura";
export interface RetoSemanal {
  id: string;
  tipo: RetoTipo;
  titulo: string;
  desc: string;
  meta: number;
  coins: number;
  xpa: number; // XP de analista
}

const BANCO_RETOS: Omit<RetoSemanal, "id">[] = [
  { tipo: "exped", titulo: "OJO EN EL ARCHIVO", desc: "Abre 3 expedientes desclasificados y registra su lectura", meta: 3, coins: 60, xpa: 40 },
  { tipo: "lab", titulo: "LABORATORIO ACTIVO", desc: "Ejecuta 2 simulaciones contrafactuales en el Laboratorio del Destino", meta: 2, coins: 70, xpa: 50 },
  { tipo: "mente", titulo: "MENTE NEURONAL", desc: "Firma 2 expedientes con LA MENTE (sala Análisis)", meta: 2, coins: 60, xpa: 40 },
  { tipo: "crea", titulo: "LA GENTE CREA", desc: "Publica 1 obra en el estudio comunitario o comparte 1 escenario", meta: 1, coins: 80, xpa: 60 },
  { tipo: "quiz", titulo: "MENTE AFILADA", desc: "Acierta 5 preguntas del quiz geopolítico", meta: 5, coins: 55, xpa: 35 },
  { tipo: "oscura", titulo: "LECTOR DE LO OSCURO", desc: "Lee 3 entradas de Alejandría Oscura con veredicto", meta: 3, coins: 55, xpa: 35 },
];

function seedDeSemana(wk: string): number {
  let h = 2166136261;
  for (let i = 0; i < wk.length; i++) {
    h ^= wk.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Los 3 retos de la semana ISO — deterministas por weekKey. */
export function retosDeSemana(wk = weekKeyOf()): RetoSemanal[] {
  let seed = seedDeSemana(wk);
  const rng = () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pool = [...BANCO_RETOS];
  const out: RetoSemanal[] = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    const idx = Math.floor(rng() * pool.length);
    const r = pool.splice(idx, 1)[0];
    out.push({ ...r, id: `${wk}-${r.tipo}` });
  }
  return out;
}

// ---------- insignias ----------
export interface Insignia {
  id: string;
  nombre: string;
  desc: string;
  icono: string;
  acento: string;
  valor: number; // progreso actual
  meta: number;
}

export function insigniasDe(c: Contadores): Insignia[] {
  return [
    { id: "primer-dossier", nombre: "PRIMER DOSSIER", desc: "Abre tu primer expediente desclasificado", icono: "FolderOpen", acento: "#A855F7", valor: c.exped, meta: 1 },
    { id: "archivista", nombre: "ARCHIVISTA", desc: "10 expedientes leídos", icono: "Archive", acento: "#A855F7", valor: c.exped, meta: 10 },
    { id: "ojo-de-dios", nombre: "OJO DE DIOS", desc: "23 expedientes: el ARCHIVO SECRETO completo", icono: "Eye", acento: "#FFD166", valor: c.exped, meta: 23 },
    { id: "oscurantista", nombre: "OSCURANTISTA", desc: "10 entradas de Alejandría Oscura", icono: "BookLock", acento: "#FF3B30", valor: c.oscura, meta: 10 },
    { id: "contrafactual", nombre: "CONTRAFACTUAL", desc: "Primera simulación ¿Y SI...? en el Laboratorio", icono: "FlaskConical", acento: "#38BDF8", valor: c.lab, meta: 1 },
    { id: "arquitecto-destino", nombre: "ARQUITECTO DEL DESTINO", desc: "10 simulaciones en el Laboratorio", icono: "Gauge", acento: "#38BDF8", valor: c.lab, meta: 10 },
    { id: "operador-neuronal", nombre: "OPERADOR NEURONAL", desc: "5 expedientes firmados por LA MENTE", icono: "BrainCircuit", acento: "#BEF264", valor: c.mente, meta: 5 },
    { id: "co-creador", nombre: "CO-CREADOR", desc: "Publica tu primera obra en la comunidad", icono: "PenTool", acento: "#A855F7", valor: c.crea, meta: 1 },
    { id: "editor-total", nombre: "EDITOR TOTAL", desc: "5 obras publicadas", icono: "Sparkles", acento: "#A855F7", valor: c.crea, meta: 5 },
    { id: "escenógrafo", nombre: "ESCENÓGRAFO", desc: "Comparte un escenario del Laboratorio con la comunidad", icono: "Share2", acento: "#FFC94D", valor: c.escenarios, meta: 1 },
    { id: "mente-afilada", nombre: "MENTE AFILADA", desc: "20 aciertos del quiz geopolítico", icono: "Brain", acento: "#00FF87", valor: c.quizOk, meta: 20 },
    { id: "erudito", nombre: "ERUDITO", desc: "50 aciertos del quiz", icono: "GraduationCap", acento: "#00FF87", valor: c.quizOk, meta: 50 },
    { id: "racha-viva", nombre: "SEMANA VIVA", desc: "Completa 3 retos semanales de investigación", icono: "Trophy", acento: "#F5C542", valor: c.retosCompletados, meta: 3 },
    { id: "elite", nombre: "ORO DE ANALISTA", desc: "Alcanza el nivel 10 de analista", icono: "Medal", acento: "#F5C542", valor: Math.floor(c.xpa / XP_NIVEL) + 1, meta: 10 },
  ];
}

// ---------- contadores ----------
export interface Contadores {
  exped: number;
  oscura: number;
  lab: number;
  mente: number;
  crea: number;
  escenarios: number;
  quizOk: number;
  quizKo: number;
  xpa: number; // XP de analista (espejo de game-store.addXp)
  retosCompletados: number;
}

export type AccionAnalista = "expediente" | "oscura" | "lab" | "mente" | "creacion" | "escenario" | "quiz_ok" | "quiz_ko";

interface WeeklyState {
  weekKey: string;
  progreso: Record<RetoTipo, number>;
  claimed: string[]; // ids de retos reclamados
}

interface AnalistaState extends Contadores {
  weekKey: string;
  progreso: Record<RetoTipo, number>;
  claimed: string[];
  hidratado: boolean;

  registrar: (a: AccionAnalista, cantidad?: number) => void;
  addXpa: (n: number) => void;
  claimReto: (id: string) => { coins: number; xpa: number } | null;
  nivel: () => number;
  progresoNivel: () => number;
  elo: () => number;
  tier: () => { nombre: TierElo; acento: string };
  rango: () => { n: number; nombre: string; acento: string };
  diasRestantes: () => number;
}

const ACCION_RETO: Record<AccionAnalista, RetoTipo | null> = {
  expediente: "exped",
  oscura: "oscura",
  lab: "lab",
  mente: "mente",
  creacion: "crea",
  escenario: "crea",
  quiz_ok: "quiz",
  quiz_ko: null,
};

export const useAnalista = create<AnalistaState>()(
  persist(
    (set, get) => ({
      exped: 0,
      oscura: 0,
      lab: 0,
      mente: 0,
      crea: 0,
      escenarios: 0,
      quizOk: 0,
      quizKo: 0,
      xpa: 0,
      retosCompletados: 0,
      weekKey: "",
      progreso: { exped: 0, oscura: 0, lab: 0, mente: 0, crea: 0, quiz: 0 },
      claimed: [],
      hidratado: false,

      registrar: (a, cantidad = 1) => {
        const wk = weekKeyOf();
        const s = get();
        const rollover = s.weekKey !== wk;
        const progreso: Record<RetoTipo, number> = rollover
          ? { exped: 0, oscura: 0, lab: 0, mente: 0, crea: 0, quiz: 0 }
          : { ...s.progreso };
        const base: Partial<Contadores> = {};
        const n = Math.max(1, cantidad);
        switch (a) {
          case "expediente": base.exped = n; break;
          case "oscura": base.oscura = n; break;
          case "lab": base.lab = n; break;
          case "mente": base.mente = n; break;
          case "creacion": base.crea = n; break;
          case "escenario": base.escenarios = n; break;
          case "quiz_ok": base.quizOk = n; break;
          case "quiz_ko": base.quizKo = n; break;
        }
        const tipo = ACCION_RETO[a];
        if (tipo) progreso[tipo] = (progreso[tipo] || 0) + n;
        set({ ...base, weekKey: wk, progreso } as Partial<AnalistaState>);
      },

      addXpa: (n) => {
        if (n <= 0) return;
        set({ xpa: Math.min(get().xpa + n, NIVELES_MAX * XP_NIVEL + XP_NIVEL - 1) });
      },

      claimReto: (id) => {
        const s = get();
        if (s.claimed.includes(id)) return null;
        const reto = retosDeSemana(s.weekKey || weekKeyOf()).find((r) => r.id === id);
        if (!reto) return null;
        if ((s.progreso[reto.tipo] || 0) < reto.meta) return null;
        set({
          claimed: [...s.claimed, id].slice(-30),
          retosCompletados: s.retosCompletados + 1,
        });
        return { coins: reto.coins, xpa: reto.xpa };
      },

      nivel: () => Math.min(NIVELES_MAX, Math.floor(get().xpa / XP_NIVEL) + 1),
      progresoNivel: () => (get().xpa % XP_NIVEL) / XP_NIVEL,
      elo: () => {
        const c = get();
        const raw =
          1000 +
          c.quizOk * 9 -
          c.quizKo * 4 +
          c.lab * 14 +
          c.mente * 11 +
          c.exped * 7 +
          c.oscura * 5 +
          c.crea * 16 +
          c.escenarios * 12 +
          c.retosCompletados * 20;
        return Math.max(800, Math.min(3000, Math.round(raw)));
      },
      tier: () => {
        const e = get().elo();
        let t = TIERS_ELO[0];
        for (const x of TIERS_ELO) if (e >= x.desde) t = x;
        return { nombre: t.nombre, acento: t.acento };
      },
      rango: () => {
        const n = get().nivel();
        let r: { n: number; nombre: string; acento: string } = RANGOS_ANALISTA[0];
        for (const x of RANGOS_ANALISTA) if (n >= x.n) r = x;
        return { ...r };
      },
      diasRestantes: () => weekDaysLeft(),
    }),
    {
      name: "vg-analista-v101",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.hidratado = true;
      },
      partialize: (s) => ({
        exped: s.exped, oscura: s.oscura, lab: s.lab, mente: s.mente,
        crea: s.crea, escenarios: s.escenarios, quizOk: s.quizOk, quizKo: s.quizKo,
        xpa: s.xpa, retosCompletados: s.retosCompletados,
        weekKey: s.weekKey, progreso: s.progreso, claimed: s.claimed,
      }),
    }
  )
);

/** Gancho ligero para el espejo de XP en game-store.addXp. */
export function espejoXpa(xp: number) {
  try {
    const st = useAnalista.getState();
    if (st.hidratado) st.addXpa(xp);
  } catch {
    // la economía nunca se bloquea por la progresión de analista
  }
}
