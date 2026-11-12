"use client";

// ============================================================
// v367.1 EL OJO DEL DUEÑO — EL CENTINELA PERSONAL (la lista de lo tuyo)
//
// «Sigue un teatro, un medio» y la casa te lo cuenta SIN notificaciones
// falsas y SIN salir de Vanguard (ley de la casa: cero enlaces externos,
// cero prueba social inventada — «Juan de Madrid acaba de comprar» no
// entra aquí, eso no es retención, es mentira).
//
// Qué es y qué NO es:
//   · ES una lista de vigilancia del aparato: hasta 40 claves (teatro o
//     medio), cada una con la fecha en que la seguiste. Vive en tu
//     localStorage y no viaja a ningún servidor (nadie sabe a quién sigues).
//   · NO es un permiso de notificaciones del navegador: la casa no pide
//     permiso para interrumpir; el Aviso se lee cuando entras a la sala.
//
// Almacenamiento: se usa un almacén propio, pequeño y blindado a mano
// (try/catch), en vez del `storageBlindado` compartido — ese exige la
// cerradura de hidratación de rehidratador.tsx y esta tienda no necesita
// esa coreografía: es una lista corta que se puede pintar en cuanto existe.
// ============================================================

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

export type TipoSeguido = "teatro" | "medio";

export interface Seguido {
  tipo: TipoSeguido;
  clave: string;
  /** cuándo lo pusiste bajo vigilancia (ISO) — honestidad del seguimiento */
  desde: string;
}

/** Tope duro: una lista infinita no es un centinela, es un cajón. */
export const MAX_SEGUIDOS = 40;

const almacenSeguro: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* cuota llena o modo privado: la lista vive solo en memoria */
    }
  },
  removeItem: (name: string): void => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* noop */
    }
  },
};

interface EstadoCentinela {
  seguidos: Seguido[];
  /** idempotente: seguir lo ya seguido no duplica ni reinicia la fecha */
  seguir: (tipo: TipoSeguido, clave: string) => void;
  soltar: (tipo: TipoSeguido, clave: string) => void;
  limpiar: () => void;
}

export const useCentinela = create<EstadoCentinela>()(
  persist(
    (set) => ({
      seguidos: [],
      seguir: (tipo, clave) =>
        set((s) => {
          const limpia = clave.trim();
          if (!limpia) return s;
          if (s.seguidos.some((x) => x.tipo === tipo && x.clave === limpia)) return s;
          const nuevo = [...s.seguidos, { tipo, clave: limpia, desde: new Date().toISOString() }];
          return { seguidos: nuevo.slice(Math.max(0, nuevo.length - MAX_SEGUIDOS)) };
        }),
      soltar: (tipo, clave) =>
        set((s) => ({
          seguidos: s.seguidos.filter((x) => !(x.tipo === tipo && x.clave === clave)),
        })),
      limpiar: () => set({ seguidos: [] }),
    }),
    {
      name: "vg367-centinela",
      storage: createJSONStorage(() => almacenSeguro),
      partialize: (s) => ({ seguidos: s.seguidos }),
    },
  ),
);

/** ¿Está ya bajo vigilancia? (pura, para pintar sin duplicar lógica). */
export function estaSeguido(seguidos: Seguido[], tipo: TipoSeguido, clave: string): boolean {
  return seguidos.some((x) => x.tipo === tipo && x.clave === clave);
}
