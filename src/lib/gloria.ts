"use client";

// ══════════════════════════════════════════════════════════════════════
// v183.0 LA GLORIA — PRESUMIR, EXCLUSIVO, EMOCIONANTE, ADICTO
// Orden del Dueño: «creal algo que haga que las personas las necesite
// presumir exclusivo algo emocionante que las personas se vuelvan
// adicta estilo vanguard» — la capa de gloria sobre LAS FICHAS DE
// GUERRA v176 (la colección real del linaje vivo).
//
//   · EL SELLO DORADO 1/1 — abrir una ficha mientras SU guerra arde en
//     LEYENDA (impacto ≥80) graba TU hora exacta: «SELLO DORADO · VG-01
//     captada 21:47 con IMP 87». La rareza viva es efímera: si no
//     abres la carta en esa hora, ese sello NUNCA vuelve a existir —
//     nadie más en el mundo puede tener el tuyo. Exclusividad honesta:
//     tu sello = tu momento de la historia, cero invención.
//
//   · LA RACHA DEL CAZADOR — abrir ≥1 ficha al día sostiene la racha
//     (el bucle Duolingo de la casa, aplicado a la colección viva).
//
//   · LOS 12 TÍTULOS GLORIA — hitos reales sobre la colección: solo se
//     visten los GANADOS; el próximo siempre muestra su progreso (el
//     casi-alcanzado que muerde). El último, LEYENDA DE LA CASA, exige
//     el álbum completo + oro + constancia.
//
//   · LA VITRINA — 3 fichas elegidas para el perfil + botón PRESUMIR:
//     canvas → PNG → navigator.share / descarga (compartir de verdad,
//     fuera de la Casa, sin servidores ni cuentas).
//
// Persistencia con el escudo de la casa: storageBlindado + registro en
// rehidratador.tsx (la lección v171/v172 — sin registro, la cerradura
// bloquea la escritura).
// ══════════════════════════════════════════════════════════════════════

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageBlindado } from "@/lib/storage-blindado";

// ── EL SELLO DORADO — la hora que solo tú viviste ──────────────────
export interface SelloDorado {
  ts: number;         // el instante exacto de la captura
  hora: string;       // HH:MM local (la hora que presume)
  intensidad: number; // el impacto del cable al capturarla
}

// ── LOS 12 TÍTULOS GLORIA — solo se visten los ganados ─────────────
export interface CtxGloria {
  descubiertas: number;   // fichas descubiertas (0–9)
  sellosDorados: number;
  mejorSello: number;     // la mayor intensidad capturada
  racha: number;          // racha del cazador (días)
  aperturas: number;      // aperturas totales del álbum
}

export interface TituloGloria {
  id: string;
  nombre: string;
  nota: string;           // el requisito, en la voz de la Agencia
  color: string;
  gana: (c: CtxGloria) => boolean;
}

export const TITULOS_GLORIA: TituloGloria[] = [
  { id: "recluta",   nombre: "RECLUTA DEL ARCHIVO",   nota: "Descubre tu primera ficha",                        color: "#8B98AD", gana: (c) => c.descubiertas >= 1 },
  { id: "cazador",   nombre: "CAZADOR DE FRENTES",    nota: "Descubre 3 fichas",                                color: "#7AB8FF", gana: (c) => c.descubiertas >= 3 },
  { id: "ojo",       nombre: "OJO DEL CENTRO",        nota: "Descubre 5 fichas",                                color: "#7AB8FF", gana: (c) => c.descubiertas >= 5 },
  { id: "cartografo",nombre: "CARTÓGRAFO DEL FUEGO",  nota: "Descubre 7 fichas",                                color: "#5EA0FF", gana: (c) => c.descubiertas >= 7 },
  { id: "maestro",   nombre: "MAESTRO DEL ÁLBUM",     nota: "Completa las 9 fichas",                            color: "#B48CFF", gana: (c) => c.descubiertas >= 9 },
  { id: "mano-oro",  nombre: "MANO DE ORO",           nota: "Captura tu primer SELLO DORADO",                   color: "#F5C542", gana: (c) => c.sellosDorados >= 1 },
  { id: "cosecha",   nombre: "COSECHA DE ORO",        nota: "Captura 3 sellos dorados",                         color: "#F5C542", gana: (c) => c.sellosDorados >= 3 },
  { id: "hora-dorada",nombre: "HORA DORADA",          nota: "Captura un sello con intensidad ≥ 90",             color: "#FFB800", gana: (c) => c.mejorSello >= 90 },
  { id: "ferro",     nombre: "RACHA DE FERRO",        nota: "Sostén la racha del cazador 3 días",               color: "#FF8A3D", gana: (c) => c.racha >= 3 },
  { id: "centinela", nombre: "CENTINELA ETERNO",      nota: "Sostén la racha del cazador 7 días",               color: "#FF8A3D", gana: (c) => c.racha >= 7 },
  { id: "acero",     nombre: "PULSO DE ACERO",        nota: "Abre fichas 50 veces",                             color: "#3DDC97", gana: (c) => c.aperturas >= 50 },
  { id: "leyenda",   nombre: "LEYENDA DE LA CASA",    nota: "Álbum completo + 3 sellos dorados + racha de 7",   color: "#FF3B30", gana: (c) => c.descubiertas >= 9 && c.sellosDorados >= 3 && c.racha >= 7 },
];

// evalúa los títulos ganados para un contexto (orden del catálogo)
export function evaluarTitulos(c: CtxGloria): string[] {
  return TITULOS_GLORIA.filter((t) => t.gana(c)).map((t) => t.id);
}

// el PRÓXIMO título (el casi-alcanzado que muerde) + su progreso 0–1
export function proximoTitulo(c: CtxGloria): { titulo: TituloGloria; progreso: number } | null {
  for (const t of TITULOS_GLORIA) {
    if (t.gana(c)) continue;
    const partes: number[] = [];
    if (t.id === "recluta") partes.push(c.descubiertas);
    else if (t.id === "mano-oro") partes.push(c.sellosDorados);
    else if (t.id === "cazador") partes.push(c.descubiertas / 3);
    else if (t.id === "ojo") partes.push(c.descubiertas / 5);
    else if (t.id === "cartografo") partes.push(c.descubiertas / 7);
    else if (t.id === "maestro") partes.push(c.descubiertas / 9);
    else if (t.id === "cosecha") partes.push(c.sellosDorados / 3);
    else if (t.id === "hora-dorada") partes.push(c.mejorSello / 90);
    else if (t.id === "ferro") partes.push(c.racha / 3);
    else if (t.id === "centinela") partes.push(c.racha / 7);
    else if (t.id === "acero") partes.push(c.aperturas / 50);
    else if (t.id === "leyenda") {
      partes.push(c.descubiertas / 9);
      partes.push(c.sellosDorados / 3);
      partes.push(c.racha / 7);
    }
    const progreso = partes.length ? Math.max(0, Math.min(1, Math.min(...partes))) : 0;
    return { titulo: t, progreso };
  }
  return null; // los 12 ganados: gloria completa
}

// el día local en formato en-CA (la clave diaria de la casa, v178)
export function diaLocal(d = new Date()): string {
  try { return d.toLocaleDateString("en-CA"); } catch { return ""; }
}

// ── EL ESTADO GLORIA — el escaparate del agente ────────────────────
interface GloriaState {
  sellos: Record<string, SelloDorado>;   // ficha key → sello dorado 1/1
  titulos: string[];                     // ids ganados
  tituloActivo: string | null;           // el que se viste en el perfil
  vitrina: [string | null, string | null, string | null]; // 3 huecos del escaparate
  rachaDias: number;                     // racha del cazador
  rachaMejor: number;
  ultimoDia: string | null;              // último día (en-CA) con apertura
  compartido: number;                    // veces presumido
  // acciones
  sellarDorado: (key: string, intensidad: number) => boolean; // true = NUEVO sello
  marcarDia: () => { rachaSubio: boolean; racha: number };
  syncTitulos: (c: CtxGloria) => string[]; // devuelve ids NUEVOS ganados
  elegirTitulo: (id: string | null) => void;
  ponerVitrina: (slot: 0 | 1 | 2, key: string | null) => void;
  contarCompartido: () => void;
  reiniciar: () => void;
}

const INITIAL = {
  sellos: {} as Record<string, SelloDorado>,
  titulos: [] as string[],
  tituloActivo: null as string | null,
  vitrina: [null, null, null] as [string | null, string | null, string | null],
  rachaDias: 0,
  rachaMejor: 0,
  ultimoDia: null as string | null,
  compartido: 0,
};

export const useGloria = create<GloriaState>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      sellarDorado: (key, intensidad) => {
        try {
          const k = (key || "").slice(0, 20);
          if (!k) return false;
          const ya = get().sellos[k];
          if (ya) return false; // el sello conserva la PRIMERA hora dorada
          let hora = "";
          try { hora = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }); } catch { hora = ""; }
          const sello: SelloDorado = { ts: Date.now(), hora, intensidad };
          set((st) => ({ sellos: { ...st.sellos, [k]: sello } }));
          return true;
        } catch { return false; }
      },

      marcarDia: () => {
        try {
          const hoy = diaLocal();
          if (!hoy) return { rachaSubio: false, racha: get().rachaDias };
          const st = get();
          if (st.ultimoDia === hoy) return { rachaSubio: false, racha: st.rachaDias };
          // ayer con fecha local: la racha sobrevive si no hay hueco de un día
          const ayer = diaLocal(new Date(Date.now() - 86_400_000));
          const racha = st.ultimoDia === ayer ? st.rachaDias + 1 : 1;
          set({ rachaDias: racha, rachaMejor: Math.max(st.rachaMejor, racha), ultimoDia: hoy });
          return { rachaSubio: true, racha };
        } catch { return { rachaSubio: false, racha: get().rachaDias }; }
      },

      syncTitulos: (c) => {
        try {
          const ganados = evaluarTitulos(c);
          const previos = new Set(get().titulos);
          const nuevos = ganados.filter((id) => !previos.has(id));
          if (nuevos.length) {
            set((st) => ({
              titulos: ganados,
              // el primer título ganado se viste solo (la primera gloria no se esconde)
              tituloActivo: st.tituloActivo ?? nuevos[0],
            }));
          } else {
            set({ titulos: ganados });
          }
          return nuevos;
        } catch { return []; }
      },

      elegirTitulo: (id) => {
        try { set({ tituloActivo: id }); } catch { /* la gloria no bloquea */ }
      },

      ponerVitrina: (slot, key) => {
        try {
          set((st) => {
            const vitrina: [string | null, string | null, string | null] = [st.vitrina[0], st.vitrina[1], st.vitrina[2]];
            // quitar la ficha de otros huecos (una ficha, un hueco)
            for (let i = 0; i < 3; i++) if (vitrina[i] === key && i !== slot) vitrina[i] = null;
            vitrina[slot] = key;
            return { vitrina };
          });
        } catch { /* silencio honesto */ }
      },

      contarCompartido: () => {
        try { set((st) => ({ compartido: st.compartido + 1 })); } catch { /* noop */ }
      },

      reiniciar: () => set({ ...INITIAL, vitrina: [null, null, null] }),
    }),
    {
      name: "vg183-gloria",
      storage: createJSONStorage(() => storageBlindado),
    },
  ),
);

// contexto GLORIA a partir de los estados crudos (la colección v176 + el álbum)
export function ctxDe(descubiertas: number, aperturas: number, g: { sellos: Record<string, SelloDorado>; rachaDias: number }): CtxGloria {
  const valores = Object.values(g.sellos);
  return {
    descubiertas,
    aperturas,
    sellosDorados: valores.length,
    mejorSello: valores.reduce((m, s) => Math.max(m, s.intensidad), 0),
    racha: g.rachaDias,
  };
}
