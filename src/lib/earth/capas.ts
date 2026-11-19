// ═══════════════════════════════════════════════════════════════════
// v416.0 VANGUARD EARTH SYSTEM — LAS CAPAS DEL EXPLORADOR.
//
// El explorador no es un mapa nuevo: es el registro de capas de la casa
// (src/lib/mapas-capas.ts) MÁS la capa física que faltaba (hitos.ts). Cada
// capa es una DECLARACIÓN: dice qué textura lleva el planeta, qué hitos se
// encienden, si pinta países por región y si realza las fronteras.
//
// Por eso añadir una capa nueva no toca ni el globo ni el explorador: es
// añadir una fila a CAPAS_EARTH. Es la misma arquitectura que impidió que el
// centro de mapas acabara con ocho mapas duplicados.
// ═══════════════════════════════════════════════════════════════════

import { PAISES_GEO } from "@/lib/geo-paises";
import { LUGARES } from "@/lib/tierra-data";
import { COLOR_REGION } from "./region-color";
// v416.0: los puntos de guerra viven en un módulo CLIENTE-SEGURO (game-data);
// mapas-capas importa la BD y no puede entrar en el navegador.
import { PUNTOS_HISTORICOS } from "./guerra-puntos";
import { HITOS, TIPOS_HITO, type TipoHito } from "./hitos";
import type { GlobeViewMode } from "@/lib/globe-assets";

export type CapaEarthId =
  | "regiones"
  | "relieve"
  | "fronteras"
  | "rios"
  | "montanas"
  | "mares"
  | "desiertos"
  | "islas"
  | "lagos"
  | "historico"
  | "lugares"
  | "acontecimientos";

export type PuntoCapaEarth = "historico" | "lugares" | "acontecimientos";

/** Un punto de teatro vivo, tal como lo calcula el servidor (mapas-capas). */
export interface PuntoAcontecimiento {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  color: string;
  tamano: number;
  etiqueta: string;
  href?: string;
}

export interface CapaEarth {
  id: CapaEarthId;
  nombre: string;
  /** la pregunta que responde la capa, en una línea */
  volanta: string;
  viewMode: GlobeViewMode;
  /** hitos que se encienden con la capa */
  hitos: TipoHito[];
  /** capa de puntos de la casa que se suma (guerras, lugares, teatros) */
  puntos: PuntoCapaEarth | null;
  /** pinta cada país con el color de su región del planeta */
  regiones: boolean;
  /** realza las fronteras por encima del planeta */
  bordes: boolean;
}

export const CAPAS_EARTH: CapaEarth[] = [
  {
    id: "regiones",
    nombre: "EL MUNDO POR REGIONES",
    volanta: "¿a qué región del planeta pertenece cada país?",
    viewMode: "oscuridad",
    hitos: [],
    puntos: null,
    regiones: true,
    bordes: true,
  },
  {
    id: "relieve",
    nombre: "EL RELIEVE REAL",
    volanta: "el planeta de verdad: mar, hielo y la textura del terreno",
    viewMode: "satelite",
    hitos: ["montana"],
    puntos: null,
    regiones: false,
    bordes: false,
  },
  {
    id: "fronteras",
    nombre: "FRONTERAS",
    volanta: "cada línea que separa a dos países, dibujada sobre el terreno",
    viewMode: "oscuridad",
    hitos: [],
    puntos: null,
    regiones: false,
    bordes: true,
  },
  {
    id: "rios",
    nombre: "LOS GRANDES RÍOS",
    volanta: "las venas de agua dulce que sostienen a medio planeta",
    viewMode: "satelite",
    hitos: ["rio"],
    puntos: null,
    regiones: false,
    bordes: false,
  },
  {
    id: "montanas",
    nombre: "LAS CUMBRES",
    volanta: "los techos y las columnas que deciden el clima y las fronteras",
    viewMode: "satelite",
    hitos: ["montana"],
    puntos: null,
    regiones: false,
    bordes: false,
  },
  {
    id: "mares",
    nombre: "OCÉANOS Y MARES",
    volanta: "las cinco masas de agua y las habitaciones del planeta",
    viewMode: "satelite",
    hitos: ["oceano", "mar"],
    puntos: null,
    regiones: false,
    bordes: false,
  },
  {
    id: "desiertos",
    nombre: "LOS DESIERTOS",
    volanta: "los vacíos que también mandan en el tablero",
    viewMode: "satelite",
    hitos: ["desierto"],
    puntos: null,
    regiones: false,
    bordes: false,
  },
  {
    id: "islas",
    nombre: "ISLAS Y LAGOS",
    volanta: "las piezas sueltas del tablero y los mares interiores",
    viewMode: "satelite",
    hitos: ["isla", "lago"],
    puntos: null,
    regiones: false,
    bordes: false,
  },
  {
    id: "historico",
    nombre: "MAPA HISTÓRICO",
    volanta: "¿dónde se pelearon las guerras que fundaron el mundo de hoy?",
    viewMode: "oscuridad",
    hitos: [],
    puntos: "historico",
    regiones: false,
    bordes: true,
  },
  {
    id: "lugares",
    nombre: "CATÁLOGO DE LUGARES",
    volanta: "ciudades, estrechos y mares que la casa vigila desde v93",
    viewMode: "oscuridad",
    hitos: [],
    puntos: "lugares",
    regiones: false,
    bordes: true,
  },
  {
    id: "acontecimientos",
    nombre: "TEATROS EN VIVO",
    volanta: "¿qué está pasando ahora mismo y dónde?",
    viewMode: "oscuridad",
    hitos: [],
    puntos: "acontecimientos",
    regiones: false,
    bordes: false,
  },
];

export function capaEarthPorId(id: CapaEarthId): CapaEarth {
  return CAPAS_EARTH.find((c) => c.id === id) ?? CAPAS_EARTH[0];
}

/** Los hitos que pinta una capa. */
export function hitosDeCapa(capa: CapaEarth) {
  if (capa.hitos.length === 0) return [];
  return HITOS.filter((h) => capa.hitos.includes(h.tipo));
}

// ── el coropletas por región: clave = numérico ISO de Natural Earth ────
export const COLORES_REGION: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const p of PAISES_GEO) {
    out[p.num] = COLOR_REGION[p.region] ?? "#8b98ad";
  }
  return out;
})();

/** Regiones con su color, para la leyenda. */
export const LEYENDA_REGION: { clave: string; etiqueta: string; color: string }[] = (() => {
  const cuenta = new Map<string, number>();
  for (const p of PAISES_GEO) if (p.region) cuenta.set(p.region, (cuenta.get(p.region) ?? 0) + 1);
  return [...cuenta.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([clave, n]) => ({ clave, etiqueta: `${clave} · ${n}`, color: COLOR_REGION[clave] ?? "#8b98ad" }));
})();

/**
 * Los puntos de una capa de puntos, en el formato del globo. La capa de
 * teatros en vivo la resuelve el explorador con los datos que le pasa la
 * página (el núcleo de acontecimientos vive en el servidor).
 */
export function puntosDeCapa(capa: CapaEarth) {
  if (capa.puntos === "historico") return PUNTOS_HISTORICOS;
  if (capa.puntos === "lugares") return LUGARES;
  return [];
}

export const TIPOS_HITO_VISIBLE = TIPOS_HITO;
