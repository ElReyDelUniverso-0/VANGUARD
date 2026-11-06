"use client";

// ══════════════════════════════════════════════════════════════════════
// v363.0 EL ÁLBUM ILUSTRADO — LAS FAMILIAS DEL ÁLBUM
// Orden del Dueño: «las cartas más únicas y más variedad». El álbum
// de la casa crece de UNA familia (los 11 conflictos vivos de v176)
// a TRES: los conflictos vivos, LOS LÍDERES (los rostros del poder,
// v130) y LA HISTORIA (las guerras del archivo, v166).
//
//   · CERO CATÁLOGOS DUPLICADOS — cada familia se DERIVA de su fuente
//     real en el momento del import: cuando la casa amplíe el dossier
//     del poder o el archivo histórico, el álbum crece SOLO. Aquí no
//     se copia un solo nombre: se importan los catálogos canónicos.
//
//   · LA RAREZA PUBLICADA — la regla vive aquí y la ficha la confiesa:
//     líder → el PODER del catálogo (≥95 LEYENDA · ≥88 ÉPICA · ≥80
//     RARA · resto COMÚN); historia → la DURACIÓN publicada del
//     conflicto (≥100 años LEYENDA · ≥20 ÉPICA · ≥8 RARA · resto
//     COMÚN). Cero suposiciones: número de la fuente, regla a la vista.
//
//   · EL ESCÁNER DE FAMILIA — cada familia nueva tiene su escáner con
//     TRES turnos al día (ESCANES_DIA): revela una ficha sin descubrir
//     elegida de la pila real. Y la casa también descubre: visitar la
//     mesa de un teatro en la máquina del tiempo revela a sus líderes;
//     abrir la ficha de una guerra del atlas revela su carta.
//
//   · PERSISTENCIA vg363-coleccion con el escudo de la casa + registro
//     en rehidratador.tsx (ley v171/v172/v176 — sin registro, la
//     cerradura bloquea la escritura).
// ══════════════════════════════════════════════════════════════════════

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageBlindado } from "@/lib/storage-blindado";
import { ROSTROS } from "@/lib/personas-data";
import { HISTORICAL_WARS, type HistoricalWar } from "@/lib/game-data";

// ── LA RAREZA DE LAS FAMILIAS NUEVAS (regla publicada) ────────────
export type RarezaAlbum = "leyenda" | "epica" | "rara" | "comun";
export type FamiliaAlbum = "conflictos" | "lideres" | "historia";

export const RAREZA_ALBUM: Record<RarezaAlbum, { label: string; hex: string; nota: string }> = {
  leyenda: { label: "LEYENDA", hex: "#FFB800", nota: "la cima del catálogo" },
  epica:   { label: "ÉPICA",   hex: "#FF8A3D", nota: "expediente de peso" },
  rara:    { label: "RARA",    hex: "#F5C542", nota: "poder y historia notables" },
  comun:   { label: "COMÚN",   hex: "#7AB8FF", nota: "en el álbum como todos" },
};

// líder: el PODER publicado del catálogo manda (≥95 · ≥88 · ≥80)
export function rarezaDePoder(poder: number): RarezaAlbum {
  if (poder >= 95) return "leyenda";
  if (poder >= 88) return "epica";
  if (poder >= 80) return "rara";
  return "comun";
}

// historia: la DURACIÓN publicada del conflicto manda (≥100 · ≥20 · ≥8)
export function rarezaDeDuracion(anios: number): RarezaAlbum {
  if (anios >= 100) return "leyenda";
  if (anios >= 20) return "epica";
  if (anios >= 8) return "rara";
  return "comun";
}

// ── FAMILIA LÍDERES — derivada del catálogo del poder (v130) ──────
export interface FichaLider {
  key: string;          // "lider:<id del rostro>"
  serie: string;        // VG-P-01…
  nombre: string;
  cargo: string;
  organizacion: string;
  pais: string;
  bandera: string;
  sede: string;
  ciudad: string;
  lat: number;
  lng: number;
  poder: number;
  mandato: string;
  frase: string;
  rareza: RarezaAlbum;
}

export const FICHAS_LIDERES: FichaLider[] = ROSTROS.map((r, i) => ({
  key: `lider:${r.id}`,
  serie: `VG-P-${String(i + 1).padStart(2, "0")}`,
  nombre: r.nombre,
  cargo: r.cargo,
  organizacion: r.organizacion,
  pais: r.pais,
  bandera: r.bandera,
  sede: r.sede,
  ciudad: r.ciudad,
  lat: r.lat,
  lng: r.lng,
  poder: r.poder,
  mandato: r.mandato,
  frase: r.frase,
  rareza: rarezaDePoder(r.poder),
}));

// ── FAMILIA HISTORIA — derivada del archivo histórico (v166) ──────
// la paleta de eras es la misma de la casa (atlas de la máquina)
export const ERA_HEX: Record<HistoricalWar["era"], string> = {
  ANTIGUA: "#F5C542",
  EDAD_MEDIA: "#C084FC",
  MODERNA: "#4DD8FF",
  CONTEMPORANEA: "#FF4D5E",
};

export const ETIQUETA_ERA: Record<HistoricalWar["era"], string> = {
  ANTIGUA: "ANTIGÜEDAD",
  EDAD_MEDIA: "EDAD MEDIA",
  MODERNA: "EDAD MODERNA",
  CONTEMPORANEA: "CONTEMPORÁNEA",
};

export interface FichaHistoria {
  key: string;          // "hist:<id del archivo>"
  serie: string;        // VG-H-01…
  nombre: string;
  era: HistoricalWar["era"];
  aniosTxt: string;     // «264 a.C. – 146 a.C.» (el formato de la casa)
  duracionAnios: number;
  region: string;
  lat: number;
  lng: number;
  bandos: string[];
  resumen: string;
  desenlace: string;
  bajas: string;
  significado: string;
  rareza: RarezaAlbum;
}

function anioTxt(y: number): string {
  return y < 0 ? `${Math.abs(y)} a.C.` : `${y}`;
}

export const FICHAS_HISTORIA: FichaHistoria[] = HISTORICAL_WARS.map((w, i) => ({
  key: `hist:${w.id}`,
  serie: `VG-H-${String(i + 1).padStart(2, "0")}`,
  nombre: w.name,
  era: w.era,
  aniosTxt: `${anioTxt(w.yearStart)} – ${anioTxt(w.yearEnd)}`,
  duracionAnios: w.yearEnd - w.yearStart,
  region: w.region,
  lat: w.lat,
  lng: w.lng,
  bandos: w.factions,
  resumen: w.summary,
  desenlace: w.outcome,
  bajas: w.casualties,
  significado: w.significance,
  rareza: rarezaDeDuracion(w.yearEnd - w.yearStart),
}));

// ── EL ESCÁNER DE FAMILIA — tres turnos al día por familia ────────
export const ESCANES_DIA = 3;

function diaDeHoy(): string {
  try {
    return new Date().toLocaleDateString("es-ES", { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch { return ""; }
}

interface SelloAlbum {
  ts: number;
  via: string;   // «escaner» · «mesa» · «atlas» — cómo entró al álbum
}

interface ColeccionVanguardState {
  descubiertas: Record<string, SelloAlbum>;
  escaneos: Record<string, { dia: string; usados: number }>; // familia → turno del día
  descubrir: (key: string, via: string) => boolean;          // true si era nueva
  escanear: (familia: "lideres" | "historia") => { ficha: FichaLider | FichaHistoria; nueva: boolean } | null;
  escaneosHoy: (familia: "lideres" | "historia") => number;
  reiniciar: () => void;
}

export const useColeccionVanguard = create<ColeccionVanguardState>()(
  persist(
    (set, get) => ({
      descubiertas: {},
      escaneos: {},
      descubrir: (key, via) => {
        try {
          const k = (key || "").slice(0, 40);
          if (!k) return false;
          let nueva = false;
          set((st) => {
            if (st.descubiertas[k]) return st; // el sello conserva la PRIMERA fecha
            nueva = true;
            return { descubiertas: { ...st.descubiertas, [k]: { ts: Date.now(), via } } };
          });
          return nueva;
        } catch { return false; } // coleccionar jamás cuesta la ficha
      },
      escanear: (familia) => {
        try {
          const hoy = diaDeHoy();
          const turno = get().escaneos[familia];
          const usados = turno && turno.dia === hoy ? turno.usados : 0;
          if (usados >= ESCANES_DIA) return null; // el turno del día se agotó
          const pila =
            familia === "lideres"
              ? FICHAS_LIDERES.filter((f) => !get().descubiertas[f.key])
              : FICHAS_HISTORIA.filter((f) => !get().descubiertas[f.key]);
          if (!pila.length) return null; // la familia está completa
          const ficha = pila[Math.floor(Math.random() * pila.length)];
          const nueva = get().descubrir(ficha.key, "escaner");
          set((st) => ({ escaneos: { ...st.escaneos, [familia]: { dia: hoy, usados: usados + 1 } } }));
          return { ficha, nueva };
        } catch { return null; }
      },
      escaneosHoy: (familia) => {
        try {
          const turno = get().escaneos[familia];
          return turno && turno.dia === diaDeHoy() ? turno.usados : 0;
        } catch { return 0; }
      },
      reiniciar: () => set({ descubiertas: {}, escaneos: {} }),
    }),
    {
      name: "vg363-coleccion",
      storage: createJSONStorage(() => storageBlindado),
    },
  ),
);

// el sello legible del álbum (mismo formato que la casa usa desde v176)
export function selloAlbumFecha(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return ""; }
}
