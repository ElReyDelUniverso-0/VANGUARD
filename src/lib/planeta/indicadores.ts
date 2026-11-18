// ═══════════════════════════════════════════════════════════════════
// v407.1 · EL PLANETA EN CIFRAS — LOS INDICADORES (sin datos dentro)
//
// Este archivo NO importa ninguna tabla: solo declara qué se mide, con qué
// código del Banco Mundial, en qué unidad y cómo se escribe la cifra. Lo usan
// el servidor (rankings, regiones, organizaciones) y el cliente (comparador),
// así que tiene que ser liviano y puro.
//
// Las cifras salen de la ficha única del país (src/lib/mundos/ficha.ts), que
// ya resuelve la tabla de la casa primero y el Banco Mundial después. Aquí no
// se inventa ni se estima nada: lo que no está, se escribe «sin dato».
// ═══════════════════════════════════════════════════════════════════

import { miles, usd } from "@/lib/mundos/formato";

export const IDS_INDICADOR = ["pob", "sup", "dens", "pib", "pibPC", "mil", "milPib", "vida"] as const;
export type IdIndicador = (typeof IDS_INDICADOR)[number];

export type FormatoIndicador = "personas" | "km2" | "dens" | "usd" | "pct" | "anios";

export interface Indicador {
  id: IdIndicador;
  nombre: string;
  /** etiqueta corta para columnas estrechas */
  corto: string;
  /** la pregunta que responde, en palabras del lector */
  pregunta: string;
  formato: FormatoIndicador;
  /** código del indicador en la fuente (o «derivado») */
  codigo: string;
  /** de dónde sale, en una línea */
  fuente: string;
  /** clave del año en censo-banco-mundial.json (para escribir «(2025)») */
  anioDe: string | null;
}

export const INDICADORES: Indicador[] = [
  {
    id: "pob",
    nombre: "Población",
    corto: "Población",
    pregunta: "¿Cuánta gente vive ahí?",
    formato: "personas",
    codigo: "SP.POP.TOTL",
    fuente: "Atlas de la casa + Banco Mundial SP.POP.TOTL (la misma cifra que la ficha del país)",
    anioDe: "pob",
  },
  {
    id: "sup",
    nombre: "Superficie",
    corto: "Superficie",
    pregunta: "¿Cuánto territorio ocupa?",
    formato: "km2",
    codigo: "AG.SRF.TOTL.K2",
    fuente: "Atlas de la casa + Banco Mundial AG.SRF.TOTL.K2",
    anioDe: "sup",
  },
  {
    id: "dens",
    nombre: "Densidad",
    corto: "Densidad",
    pregunta: "¿Qué tan apretada vive la gente?",
    formato: "dens",
    codigo: "derivado",
    fuente: "Derivada: población ÷ superficie (las dos cifras de arriba)",
    anioDe: null,
  },
  {
    id: "pib",
    nombre: "Producto interior bruto",
    corto: "PIB",
    pregunta: "¿Cuánto produce su economía en un año?",
    formato: "usd",
    codigo: "NY.GDP.MKTP.CD",
    fuente: "Banco Mundial NY.GDP.MKTP.CD (US$ corrientes)",
    anioDe: "pib",
  },
  {
    id: "pibPC",
    nombre: "Renta por habitante",
    corto: "PIB/hab.",
    pregunta: "¿Cuánto produce, en promedio, cada persona?",
    formato: "usd",
    codigo: "NY.GDP.PCAP.CD",
    fuente: "Banco Mundial NY.GDP.PCAP.CD (US$ corrientes por habitante)",
    anioDe: "pibPC",
  },
  {
    id: "mil",
    nombre: "Gasto militar",
    corto: "Gasto mil.",
    pregunta: "¿Cuánto dinero dedica a sus fuerzas armadas?",
    formato: "usd",
    codigo: "MS.MIL.XPND.CD",
    fuente: "poder-data de la casa + Banco Mundial MS.MIL.XPND.CD (US$ corrientes)",
    anioDe: "mil",
  },
  {
    id: "milPib",
    nombre: "Esfuerzo militar",
    corto: "Mil. % PIB",
    pregunta: "¿Qué parte de su economía se va en defensa?",
    formato: "pct",
    codigo: "derivado",
    fuente: "Derivado: gasto militar ÷ PIB (las dos cifras del Banco Mundial de esta tabla)",
    anioDe: null,
  },
  {
    id: "vida",
    nombre: "Esperanza de vida",
    corto: "Vida",
    pregunta: "¿Cuántos años vive, en promedio, quien nace ahí?",
    formato: "anios",
    codigo: "SP.DYN.LE00.IN",
    fuente: "Banco Mundial SP.DYN.LE00.IN (años al nacer)",
    anioDe: "vida",
  },
];

export const INDICADOR: Record<IdIndicador, Indicador> = Object.fromEntries(
  INDICADORES.map((i) => [i.id, i])
) as Record<IdIndicador, Indicador>;

export function esIndicador(x: string): x is IdIndicador {
  return (IDS_INDICADOR as readonly string[]).includes(x);
}

/** La cifra escrita como la lee una persona (puro: servidor y cliente). */
export function fmt(id: IdIndicador, n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "sin dato";
  switch (INDICADOR[id].formato) {
    case "personas":
      if (n >= 1e9) return miles(n / 1e9, 2) + " mil M hab.";
      if (n >= 1e6) return miles(n / 1e6, 1) + " M hab.";
      return miles(n) + " hab.";
    case "km2":
      return miles(n) + " km²";
    case "dens":
      return miles(n, 1) + " hab/km²";
    case "usd":
      return usd(n);
    case "pct":
      return miles(n, 2) + " %";
    case "anios":
      return miles(n, 1) + " años";
  }
}

/** «2,3×» o «la mitad» — cuántas veces A respecto a B, en palabras. */
export function veces(a: number | null, b: number | null): string | null {
  if (a === null || b === null || !Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  const r = a / b;
  if (Math.abs(r - 1) < 0.05) return "casi igual";
  if (r >= 1) return `${miles(r, r >= 10 ? 0 : 1)}×`;
  return `${miles(r * 100, 0)} %`;
}

/** Una fila del planeta: lo que viaja al cliente (serializable, sin funciones). */
export interface FilaPlaneta {
  iso2: string;
  iso3: string;
  nombre: string;
  region: string;
  regionEs: string;
  sub: string;
  subEs: string;
  subSlug: string;
  v: Record<IdIndicador, number | null>;
  /** año de cada cifra cuando la fuente lo declara */
  anios: Record<string, number>;
}
