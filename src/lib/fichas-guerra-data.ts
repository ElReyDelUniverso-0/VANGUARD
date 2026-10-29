"use client";

// ══════════════════════════════════════════════════════════════════════
// v176.0 LAS FICHAS DE GUERRA — LA COLECCIÓN DE LA AGENCIA
// Orden del Dueño: «fichas coleccionables de conflictos mundiales,
// de noticias únicas de cada guerra» — las tarjetas de la casa al
// estilo de las placas GTA (v175): cada frente vivo del planeta tiene
// SU carta coleccionable con rareza VIVA (la mide el motor de impacto
// con los cables de HOY) y su noticia única.
//
//   · EL CATÁLOGO — las 9 guerras del mapa conflictTag de /api/news
//     (ukraine, gaza, lebanon, sudan, redsea, korea, taiwan, hormuz,
//     sahel): bandos, teatro, coordenadas, inicio histórico, contexto.
//     Honestidad: los datos históricos son fijos y citables; lo que
//     respira (rareza, intensidad, pulso, frescura) lo pone el feed
//     real — sin cables hoy, la carta duerme en SILENCIO, no se inventa.
//
//   · LA COLECCIÓN — abrir una ficha la DESCUBRE (sello con fecha,
//     contador X/9). Persistencia con el escudo de la casa:
//     storageBlindado + registro en rehidratador.tsx (la lección
//     v171/v172 — sin registro, la cerradura bloquea la escritura).
// ══════════════════════════════════════════════════════════════════════

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageBlindado } from "@/lib/storage-blindado";

// ── LA RAREZA VIVA — la decrece el tiempo, no la opinión ──────────
export type RarezaFicha = "leyenda" | "epica" | "rara" | "comun" | "silencio";

export const RAREZAS: Record<RarezaFicha, { label: string; hex: string; nota: string }> = {
  leyenda:  { label: "LEYENDA",   hex: "#FFB800", nota: "cable URGENTE hoy" },
  epica:    { label: "ÉPICA",     hex: "#FF8A3D", nota: "cable CRÍTICO hoy" },
  rara:     { label: "RARA",      hex: "#F5C542", nota: "cable ALTO hoy" },
  comun:    { label: "COMÚN",     hex: "#7AB8FF", nota: "en desarrollo hoy" },
  silencio: { label: "SILENCIO",  hex: "#8B98AD", nota: "sin señales frescas" },
};

// rareza por el MEJOR cable de la guerra en el escáner de hoy (mismo
// veredicto que el ranking del Centro Mundial: una sola verdad)
export function rarezaDeMejorImpacto(mejor: number | null): RarezaFicha {
  if (mejor == null) return "silencio";
  if (mejor >= 80) return "leyenda";
  if (mejor >= 64) return "epica";
  if (mejor >= 48) return "rara";
  if (mejor >= 32) return "comun";
  return "silencio";
}

// ── EL CATÁLOGO — una ficha por guerra viva con nombre ────────────
export interface BandoFicha {
  bandera: string; // emoji de bandera (el alfabeto visual de la casa)
  nombre: string;
}

export interface FichaGuerra {
  key: string;              // el conflictTag de /api/news (la llave del feed real)
  serie: string;            // el número de la colección
  nombre: string;           // nombre de guerra (dos bandos, en la placa)
  bandos: [BandoFicha, BandoFicha];
  teatro: string;           // el escenario geográfico, al estilo carta naval
  lat: number;
  lng: number;
  inicioIso: string;        // el origen histórico (verificable)
  inicioTxt: string;
  duracionTxt: string;      // cómo se leen esos años en la mesa
  contexto: string;         // la línea de contexto que necesitas saber
  color: string;            // el color de la facción (tinte de la escena)
}

export const FICHAS_GUERRA: FichaGuerra[] = [
  {
    key: "ukraine",
    serie: "VG-01",
    nombre: "RUSIA—UCRANIA",
    bandos: [{ bandera: "🇷🇺", nombre: "RUSIA" }, { bandera: "🇺🇦", nombre: "UCRANIA" }],
    teatro: "EL DONBÁS · JÁRKOV · MAR NEGRO",
    lat: 48.4, lng: 35.5,
    inicioIso: "2022-02-24",
    inicioTxt: "24 FEB 2022",
    duracionTxt: "INVASIÓN A GRAN ESCALA (el frente del Dombás arde desde 2014)",
    contexto: "La mayor guerra de Europa desde 1945: anexiones declaradas, drones y misiles a diario, sanciones globales y un frente que mide la OTAN sin entrar en ella.",
    color: "#FF3B30",
  },
  {
    key: "gaza",
    serie: "VG-02",
    nombre: "ISRAEL—GAZA",
    bandos: [{ bandera: "🇮🇱", nombre: "ISRAEL" }, { bandera: "🇵🇸", nombre: "HAMAS" }],
    teatro: "FRANJA DE GAZA · JENÍN · RAFAH",
    lat: 31.5, lng: 34.47,
    inicioIso: "2023-10-07",
    inicioTxt: "7 OCT 2023",
    duracionTxt: "LA GUERRA QUE ABRIÓ EL DECENIO DE ORIENTE MEDIO",
    contexto: "Del ataque del 7-O a la campaña sobre la franja: asedio humanitario, mediación de Catar y Egipto, y un frente que arrastró al Líbano, al Mar Rojo y a Irán.",
    color: "#FF8A3D",
  },
  {
    key: "lebanon",
    serie: "VG-03",
    nombre: "ISRAEL—HEZBOLÁ",
    bandos: [{ bandera: "🇮🇱", nombre: "ISRAEL" }, { bandera: "🇱🇧", nombre: "HEZBOLÁ" }],
    teatro: "SUR DEL LÍBANO · BEKAA · BEIRUT",
    lat: 33.27, lng: 35.4,
    inicioIso: "2023-10-08",
    inicioTxt: "8 OCT 2023",
    duracionTxt: "EL SEGUNDO FRENTE QUE NACIÓ AL DÍA SIGUIENTE",
    contexto: "El fuego cruzado más peligroso desde 2006: la frontera más armada del planeta, evacuaciones de pueblos enteros y la amenaza de guerra total sobre Beirut.",
    color: "#F5C542",
  },
  {
    key: "sudan",
    serie: "VG-04",
    nombre: "SUDÁN: SAF—FRS",
    bandos: [{ bandera: "🇸🇩", nombre: "EJÉRCITO (SAF)" }, { bandera: "⚔️", nombre: "FRS" }],
    teatro: "JARTUM · DARFUR · EL FRESNO",
    lat: 15.5, lng: 32.55,
    inicioIso: "2023-04-15",
    inicioTxt: "15 ABR 2023",
    duracionTxt: "LA GUERRA CIVIL QUE EL MUNDO VIO TARDE",
    contexto: "Dos generales partido en dos el Estado: la mayor crisis de desplazados del planeta (más de 10 millones) con hambruna declarada en Darfur.",
    color: "#B48CFF",
  },
  {
    key: "redsea",
    serie: "VG-05",
    nombre: "EL MAR ROJO",
    bandos: [{ bandera: "🇾🇪", nombre: "HUTÍES" }, { bandera: "🚢", nombre: "COMERCIO MUNDIAL" }],
    teatro: "BAB EL-MANDEB · GOLFO DE ADÉN",
    lat: 12.58, lng: 43.33,
    inicioIso: "2023-11-19",
    inicioTxt: "19 NOV 2023",
    duracionTxt: "EL STRAIT QUE SECUESTRÓ EL 12% DEL COMERCIO",
    contexto: "Drones y misiles contra buques en la ruta de Suez: convoyes navales, bombardeos de represalia y fletes que dan la vuelta a África.",
    color: "#7AB8FF",
  },
  {
    key: "korea",
    serie: "VG-06",
    nombre: "LAS DOS COREAS",
    bandos: [{ bandera: "🇰🇵", nombre: "PYONGYANG" }, { bandera: "🇰🇷", nombre: "SEÚL" }],
    teatro: "38º PARALELO · LA DMZ · MAR AMARILLO",
    lat: 38.0, lng: 127.0,
    inicioIso: "1953-07-27",
    inicioTxt: "27 JUL 1953",
    duracionTxt: "EL ARMISTICIO MÁS LARGO DEL MUNDO (nunca hubo paz)",
    contexto: "La guerra fría que nunca terminó: ensayos nucleares, globos basura, artillería en la DMZ y tropas norcoreanas probadas en el frente de Ucrania.",
    color: "#5EA0FF",
  },
  {
    key: "taiwan",
    serie: "VG-07",
    nombre: "EL ESTRECHO",
    bandos: [{ bandera: "🇨🇳", nombre: "CHINA" }, { bandera: "🇹🇼", nombre: "TAIWÁN" }],
    teatro: "ESTRECHO DE TAIWÁN · LA LÍNEA MEDIA",
    lat: 24.0, lng: 119.5,
    inicioIso: "1949-12-07",
    inicioTxt: "DESDE 1949",
    duracionTxt: "EL FRENTE QUE MIDEN EN INCURSIONES DIARIAS",
    contexto: "Cada día se cuentan cazas, buques y globos cruzando la línea media: el escenario nº 1 de una posible gran guerra del decenio.",
    color: "#3DDC97",
  },
  {
    key: "hormuz",
    serie: "VG-08",
    nombre: "ORMUZ—IRÁN",
    bandos: [{ bandera: "🇮🇷", nombre: "IRÁN" }, { bandera: "🛢️", nombre: "LA CURIOSIDAD GLOBAL" }],
    teatro: "ESTRECHO DE ORMUZ · GOLFO PÉRSICO",
    lat: 26.57, lng: 56.25,
    inicioIso: "2015-07-14",
    inicioTxt: "CRISIS NUCLEAR DESDE 2015",
    duracionTxt: "EL 20% DEL PETRÓLEO DEL PLANETA PASA POR AQUÍ",
    contexto: "Capturas de tanqueros, enriquecimiento nuclear y represalias por poder interpuesto: el pulso entre Teherán y Occidente que cada año roza la guerra.",
    color: "#FF6B6B",
  },
  {
    key: "sahel",
    serie: "VG-09",
    nombre: "EL SAHEL",
    bandos: [{ bandera: "🌵", nombre: "JNIM · EIGS" }, { bandera: "🎖️", nombre: "JUNTAS" }],
    teatro: "MALÍ · NÍGER · BURKINA FASO",
    lat: 16.0, lng: -2.0,
    inicioIso: "2012-04-06",
    inicioTxt: "DESDE 2012",
    duracionTxt: "EL FRENTE MÁS LETAL DEL MUNDO (y el menos filmado)",
    contexto: "La epidemia de golpes de Estado y la yihad que avanza hacia el golfo de Guinea: hoy concentra más muertes por combate que Ucrania y Gaza.",
    color: "#D9A05B",
  },
];

// la ficha por conflictTag (o null si el feed trajo un frente sin carta)
export function fichaDe(key: string | null | undefined): FichaGuerra | null {
  if (!key) return null;
  return FICHAS_GUERRA.find((f) => f.key === key.toLowerCase()) ?? null;
}

// ── LA COLECCIÓN — el álbum persistente del visitante ─────────────
export interface SelloFicha {
  ts: number;      // cuándo se descubrió
  intensidad: number; // el impacto del mejor cable al momento del descubrimiento
}

interface ColeccionState {
  descubiertas: Record<string, SelloFicha>; // key → sello con fecha
  aperturas: number;                        // total de fichas abiertas (afición)
  descubrir: (key: string, intensidad: number) => void;
  contarApertura: () => void;
  reiniciar: () => void;
}

export const useColeccionFichas = create<ColeccionState>()(
  persist(
    (set) => ({
      descubiertas: {},
      aperturas: 0,
      descubrir: (key, intensidad) => {
        try {
          const k = (key || "").slice(0, 20);
          if (!k) return;
          set((st) =>
            st.descubiertas[k]
              ? st // ya descubierta: el sello conserva la PRIMERA fecha
              : { descubiertas: { ...st.descubiertas, [k]: { ts: Date.now(), intensidad } } },
          );
        } catch { /* coleccionar jamás cuesta la ficha */ }
      },
      contarApertura: () => {
        try {
          set((st) => ({ aperturas: st.aperturas + 1 }));
        } catch { /* silencio honesto */ }
      },
      reiniciar: () => set({ descubiertas: {}, aperturas: 0 }),
    }),
    {
      name: "vg176-fichas",
      storage: createJSONStorage(() => storageBlindado),
    },
  ),
);

// fecha legible del sello de colección
export function selloFecha(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return ""; }
}
