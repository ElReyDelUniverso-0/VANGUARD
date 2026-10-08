"use client";

// v88.0 OPERADOR LEGENDARIO — look completo del avatar, ahora con EQUIPO REAL:
// casco con montura NVG, boina, mochila táctica, parche de hombro, compañero
// (águila / dron / orbital) y RELIQUIA única que orbita al operador.
// Las MEDALLAS no se eligen: se GANAN (derivadas de logros y estadísticas reales).
// El agente 3D del hangar lee este store al montarse y escucha el evento
// "vanguard:agente-look" para actualizarse EN VIVO (sin reconstruir).
// "rango" = el uniforme lo decide el nivel (comportamiento clásico v67).

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Headgear = "none" | "casco" | "boina";
export type Companero = "none" | "aguila" | "dron" | "orbital";
export type Reliquia = "none" | "espada" | "corona" | "globo" | "estrella" | "corazon";

export interface AgenteLook {
  /** Tono de piel (hex) */
  skin: string;
  /** Uniforme: "rango" (por nivel) o hex personalizado */
  uniforme: string;
  /** Pantalón (hex) */
  pantalon: string;
  /** Visor táctico encendido */
  visor: boolean;
  /** Color del visor (hex) */
  visorColor: string;
  /** v88 Cabeza: sin nada / casco de combate / boina */
  headgear: Headgear;
  /** Color del casco o boina (hex) */
  headgearColor: string;
  /** v88 Mochila táctica */
  mochila: boolean;
  /** Color de la mochila (hex) */
  mochilaColor: string;
  /** v88 Parche de hombro (hex) */
  parche: string;
  /** v88 Compañero que vuela junto al operador */
  companero: Companero;
  /** v88 Reliquia única que orbita al operador (requiere desbloqueo) */
  reliquia: Reliquia;
}

export const AGENTE_LOOK_DEFAULT: AgenteLook = {
  skin: "#d8a77a",
  uniforme: "rango",
  pantalon: "#1a1d26",
  visor: false,
  visorColor: "#00FF87",
  headgear: "none",
  headgearColor: "#3a3f4a",
  mochila: false,
  mochilaColor: "#2b2f3a",
  parche: "#1E90FF",
  companero: "none",
  reliquia: "none",
};

// paletas del editor (mismas constantes aquí y en el panel)
export const PIEL_TONOS = ["#f2c9a0", "#e0b088", "#d8a77a", "#b97f52", "#8c5a34", "#5f3d22"];
export const UNIFORME_COLORES = [
  "#3a3f4a", "#14401e", "#0e4a5a", "#7a5a10", "#8a1420",
  "#1E90FF", "#FF8A2A", "#9B5CFF", "#00FF87", "#FF3B30", "#FFD60A", "#F0F0F0",
];
export const PANTALON_COLORES = ["#1a1d26", "#2b2f3a", "#3d3428", "#22333d", "#402020", "#101418"];
export const VISOR_COLORES = ["#00FF87", "#1E90FF", "#FF3B30", "#FFD60A", "#9B5CFF"];
export const HEADGEAR_COLORES = ["#3a3f4a", "#14401e", "#8a1420", "#1a1d26", "#d4af37", "#F0F0F0"];
export const MOCHILA_COLORES = ["#2b2f3a", "#3d3428", "#14401e", "#8a1420", "#1E90FF", "#101418"];
export const PARCHE_COLORES = ["#1E90FF", "#00FF87", "#FF3B30", "#FFD60A", "#9B5CFF", "#F0F0F0"];

interface AgenteLookStore extends AgenteLook {
  setLook: (p: Partial<AgenteLook>) => void;
  reset: () => void;
}

export const useAgenteLook = create<AgenteLookStore>()(
  persist(
    (set) => ({
      ...AGENTE_LOOK_DEFAULT,
      setLook: (p) => {
        set(p);
        emitirLook();
      },
      reset: () => {
        set(AGENTE_LOOK_DEFAULT);
        emitirLook();
      },
    }),
    { name: "vg_agente_look_v73" }
  )
);

/** Notifica al hangar 3D (y a cualquier escena) que el look cambió. */
export function emitirLook() {
  if (typeof window === "undefined") return;
  const s = useAgenteLook.getState();
  window.dispatchEvent(
    new CustomEvent("vanguard:agente-look", {
      detail: {
        skin: s.skin, uniforme: s.uniforme, pantalon: s.pantalon,
        visor: s.visor, visorColor: s.visorColor,
        headgear: s.headgear, headgearColor: s.headgearColor,
        mochila: s.mochila, mochilaColor: s.mochilaColor,
        parche: s.parche, companero: s.companero, reliquia: s.reliquia,
      } satisfies AgenteLook,
    })
  );
}

/** Lectura tolerante para escenas fuera de React (three.js). */
export function leerLook(): AgenteLook {
  try {
    const raw = localStorage.getItem("vg_agente_look_v73");
    if (!raw) return AGENTE_LOOK_DEFAULT;
    const j = JSON.parse(raw) as { state?: Partial<AgenteLook> };
    return { ...AGENTE_LOOK_DEFAULT, ...(j.state || {}) };
  } catch {
    return AGENTE_LOOK_DEFAULT;
  }
}

// ---- v88 MEDALLAS Y RELIQUIAS: se GANAN, no se compran ----

export interface Medalla {
  id: string;
  nombre: string;
  cinta: string[]; // colores de la cinta (2-3 franjas)
  descripcion: string;
  /** condición evaluada con stats del store */
  cond: (s: MedalStats) => boolean;
}

export interface MedalStats {
  level: number;
  streak: number;
  achievements: string[];
  mpWins: number;
  conquestWins: number;
  quizCorrect: number;
  coins: number;
  minigameBestScore: number;
  viewedNews: number;
}

export const MEDALLAS: Medalla[] = [
  { id: "MD-ALISTAMIENTO", nombre: "Alistamiento", cinta: ["#8a90a8", "#5a6078"], descripcion: "Servir un primer día en Vanguard", cond: (s) => s.level >= 1 },
  { id: "MD-PLOMO", nombre: "Cinta de Plomo", cinta: ["#b06a3b", "#7a4a28"], descripcion: "Racha de 3 días sin faltar", cond: (s) => s.streak >= 3 },
  { id: "MD-BRONCE", nombre: "Estrella de Bronce", cinta: ["#cd7f32", "#8a5a2a", "#cd7f32"], descripcion: "Alcanzar el nivel 5", cond: (s) => s.level >= 5 },
  { id: "MD-OJO", nombre: "Ojo del Analista", cinta: ["#1E90FF", "#0a4a8a"], descripcion: "30 lecturas de noticias", cond: (s) => s.viewedNews >= 30 },
  { id: "MD-CEREBRO", nombre: "Mente Quirúrgica", cinta: ["#00FF87", "#0a6a3a"], descripcion: "20 aciertos de quiz", cond: (s) => s.quizCorrect >= 20 },
  { id: "MD-PLATA", nombre: "Cruz de Plata", cinta: ["#c0c0c0", "#7a8a9a"], descripcion: "Alcanzar el nivel 10", cond: (s) => s.level >= 10 },
  { id: "MD-ESPALDA", nombre: "Corazón Púrpura", cinta: ["#9B5CFF", "#5a2a8a"], descripcion: "10 victorias en PvP", cond: (s) => s.mpWins >= 10 },
  { id: "MD-CONQUISTA", nombre: "Medalla del Estratega", cinta: ["#FF3B30", "#7a1a10"], descripcion: "Ganar una conquista", cond: (s) => s.conquestWins >= 1 },
  { id: "MD-ORO", nombre: "Cruz de Oro", cinta: ["#FFD60A", "#b08a10", "#FFD60A"], descripcion: "Alcanzar el nivel 16", cond: (s) => s.level >= 16 },
  { id: "MD-ARCADEN", nombre: "Ángel del Arcade", cinta: ["#FF8A2A", "#8a4a10"], descripcion: "300 puntos en el arcade", cond: (s) => s.minigameBestScore >= 300 },
  { id: "MD-COSECHA", nombre: "Fortuna de Guerra", cinta: ["#FFD60A", "#00FF87"], descripcion: "Acumular 5.000 monedas", cond: (s) => s.coins >= 5000 },
  { id: "MD-LEYENDA", nombre: "Estrella de la Legión", cinta: ["#FFD60A", "#FF3B30", "#1E90FF"], descripcion: "Alcanzar el nivel 25", cond: (s) => s.level >= 25 },
];

export function medallasGanadas(s: MedalStats): Medalla[] {
  return MEDALLAS.filter((m) => {
    try { return m.cond(s); } catch { return false; }
  });
}

// Reliquias: cada una exige una proeza. El hangar 3D las dibuja orbitando.
export interface ReliquiaDef {
  id: Reliquia;
  nombre: string;
  hex: number; // color three.js
  forma: "espada" | "corona" | "globo" | "estrella" | "corazon";
  proeza: string;
  cond: (s: MedalStats) => boolean;
}

export const RELIQUIAS: ReliquiaDef[] = [
  { id: "none", nombre: "Sin reliquia", hex: 0x000000, forma: "estrella", proeza: "—", cond: () => true },
  { id: "globo", nombre: "GLOBO DEL MUNDO", hex: 0x1e90ff, forma: "globo", proeza: "Llegar al nivel 8", cond: (s) => s.level >= 8 },
  { id: "estrella", nombre: "ESTRELLA DE VANGUARD", hex: 0xffd60a, forma: "estrella", proeza: "Racha de 7 días", cond: (s) => s.streak >= 7 },
  { id: "corazon", nombre: "CORAZÓN DE HIERRO", hex: 0xff3b30, forma: "corazon", proeza: "20 victorias PvP", cond: (s) => s.mpWins >= 20 },
  { id: "espada", nombre: "ESPADA DEL ORÁCULO", hex: 0x00ff87, forma: "espada", proeza: "Ganar 3 conquistas", cond: (s) => s.conquestWins >= 3 },
  { id: "corona", nombre: "CORONA DEL MANDO", hex: 0xd4af37, forma: "corona", proeza: "Alcanzar el nivel 20", cond: (s) => s.level >= 20 },
];

export function reliquiaDesbloqueada(id: Reliquia, s: MedalStats): boolean {
  const r = RELIQUIAS.find((x) => x.id === id);
  if (!r) return false;
  try { return r.cond(s); } catch { return false; }
}
