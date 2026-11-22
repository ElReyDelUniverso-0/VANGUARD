// ═══════════════════════════════════════════════════════════════════
// v442.0 · LOS SÍMBOLOS VIVOS — EL ESTADO (la vida de cada signo)
//
// Un símbolo tiene cuatro humores y el humor lo decide la casa, no el
// azar:
//
//   · reciente  — «?»: la sala o el módulo NUNCA se ha entrado, o acaba de
//                 recibir algo. Chispas de signos de interrogación.
//   · ira       — el signo de la ira: hay una tarea empezada dentro de ese
//                 módulo que aún no se ha terminado (los Retos del día reales
//                 de la bitácora del juego, no inventados).
//   · importante— pasa algo: el pulso de la casa (determinista, el mismo
//                 para todo el planeta) o un evento nuevo de la bitácora del
//                 piloto enciende el módulo. Temblor, energía, los ojos
//                 mirando a los lados y cambio de posición.
//   · calma     — respira: lento, sin ruido. Todo signo descansa.
//
// La tienda es pequeña y persistida (visitas + fuegos); el reloj (`ahora`)
// lo lleva VidaGlobal con un solo intervalo para toda la casa.
// ═══════════════════════════════════════════════════════════════════
"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { DAILY_CHALLENGES } from "@/lib/game-data";
import { djb2, MODULOS_VIDA, type EstadoVida } from "./modelo";

/** lo que el estado necesita saber de la bitácora del juego */
export interface JuegoVida {
  dailyChallengeProgress: Record<string, number>;
  dailyChallengeClaimed: string[];
}

/** qué módulo duele cuando un reto del día se queda a medias */
const MODULO_DE_ACCION: Record<string, string> = {
  VIEW_NEWS: "redaccion",
  READ_BRIEFING: "redaccion",
  VIEW_PHOTO: "redaccion",
  SHARE_CARD: "redaccion",
  OPEN_MAP: "mundo",
  PREDICT: "casa",
  QUIZ_CORRECT: "saber",
  FUSION: "saber",
  VISIT_TAB: "casa",
  MINIGAME_HITS: "casa",
  CAM_EVENT: "casa",
  STREAK: "casa",
  LOGIN: "casa",
};

/** claves de la bitácora del piloto → módulo que se enciende */
const CLAVES_MODULO: [RegExp, string][] = [
  [/cable|noticia|agencia|en vivo|radio/i, "redaccion"],
  [/mapa|mundo|pa[ií]s|conflicto|frontera|guerra/i, "mundo"],
  [/quiz|ciencia|libro|briefing|informe|curso|estudio/i, "saber"],
  [/misi[oó]n|moneda|gema|nivel|racha|perfil|objetivo|trofeo/i, "casa"],
];

export function moduloDeMensaje(msg: string): string | null {
  for (const [re, mod] of CLAVES_MODULO) if (re.test(msg)) return mod;
  return null;
}

export interface Visita {
  n: number;
  ultima: number;
}

interface VidaState {
  /** salas y módulos visitados (la clave es el id del signo) */
  visitas: Record<string, Visita>;
  /** módulo → timestamp del último fuego de importancia */
  importante: Record<string, number>;
  /** marca del último pulso de la casa */
  pulso: number;
  /** timestamp del último evento de la bitácora ya contestado */
  vistoLog: number;
  /** reloj de la casa (lo mueve VidaGlobal) */
  ahora: number;
  visitar: (id: string) => void;
  marcarImportante: (id: string, ts?: number) => void;
  apagar: (id: string) => void;
}

// localStorage con escritura diferida (el juego ya usa este patrón: la
// escritura del mapa no debe bloquear el hilo principal). El pendiente se
// descarga al esconder la página: una visita que se hace al cerrar no se
// pierde.
const storageVida: StateStorage = (() => {
  let pending: string | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const flush = () => {
    timer = null;
    if (pending === null) return;
    try {
      window.localStorage.setItem("vanguard-vida-v1", pending);
    } catch {
      /* cuota llena o modo privado: la vida sigue en memoria */
    }
    pending = null;
  };
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }
  return {
    getItem: (name) => {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (_name, valor) => {
      pending = String(valor);
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, 800);
    },
    removeItem: (name) => {
      try {
        window.localStorage.removeItem(name);
      } catch {
        /* sin almacenamiento: nada que borrar */
      }
    },
  };
})();

export const useVidaStore = create<VidaState>()(
  persist(
    (set) => ({
      visitas: {},
      importante: {},
      pulso: 0,
      vistoLog: 0,
      ahora: 0,
      visitar: (id) => {
        if (!id) return;
        set((s) => {
          const prev = s.visitas[id];
          return {
            visitas: {
              ...s.visitas,
              [id]: { n: (prev?.n ?? 0) + 1, ultima: Date.now() },
            },
          };
        });
      },
      marcarImportante: (id, ts) => {
        if (!id) return;
        set((s) => ({ importante: { ...s.importante, [id]: ts ?? Date.now() } }));
      },
      apagar: (id) =>
        set((s) => {
          const importante = { ...s.importante };
          delete importante[id];
          return { importante };
        }),
    }),
    {
      name: "vanguard-vida-v1",
      storage: createJSONStorage(() => storageVida),
      // el reloj no se persiste: cada arranque toma la hora del aparato
      partialize: (s) => ({
        visitas: s.visitas,
        importante: s.importante,
        pulso: s.pulso,
        vistoLog: s.vistoLog,
      }),
    },
  ),
);

// ── cuándo caduca cada fuego ────────────────────────────────────────────
const DURACION_IMPORTANTE = 25_000; // 25 s de temblor y energía
const DURACION_IRA = 120_000; // 2 min de ira: la tarea sigue ahí
const DURACION_RECIENTE = 60_000; // 1 min de «?» tras entrar o actualizarse
export const PULSO_CICLO = 45_000; // el pulso de la casa: un módulo cada 45 s

/** ¿queda una tarea empezada y sin terminar dentro de este módulo? */
export function tareaSinTerminar(juego: JuegoVida, id: string): boolean {
  for (const c of DAILY_CHALLENGES) {
    if (MODULO_DE_ACCION[c.action] !== id) continue;
    const p = juego.dailyChallengeProgress[c.id] ?? 0;
    if (p > 0 && p < c.target && !juego.dailyChallengeClaimed.includes(c.id)) return true;
  }
  return false;
}

/** el humor de un signo ahora mismo (función pura: la prueban los tests). */
export function estadoDeVida(id: string, s: VidaState, juego: JuegoVida): EstadoVida {
  const ahora = s.ahora || Date.now();
  const fuego = s.importante[id] ?? 0;
  if (fuego && ahora - fuego < DURACION_IMPORTANTE) return "importante";
  if (tareaSinTerminar(juego, id)) return "ira";
  const v = s.visitas[id];
  if (!v) return "reciente"; // nunca entrado → chispas de «?»
  if (ahora - v.ultima < DURACION_RECIENTE) return "reciente"; // acaba de pasar algo
  return "calma";
}

/** el pulso determinista: qué módulo despierta en este ciclo (igual para todos). */
export function moduloDelPulso(ciclo: number): string {
  return MODULOS_VIDA[djb2(`pulso:${ciclo}`) % MODULOS_VIDA.length];
}
