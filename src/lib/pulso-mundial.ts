// ============================================================
// v358.0 WORLD PULSE — EL CENTRO DE INTELIGENCIA MUNDIAL
// Mandato del Dueño: «un centro de inteligencia mundial que reúna
// acontecimientos, tendencias, indicadores y estadísticas
// internacionales… sin inventar estadísticas ni tendencias».
//
// Las reglas de la casa (heredadas del BARÓMETRO v223):
//   · CERO valores inventados: los números SOLO nacen del Banco
//     Mundial (API v2, CC BY 4.0) — horneados en la instantánea
//     con fecha de extracción, o frescos si la red responde.
//   · Atribución preservada: fuente, licencia y enlace al
//     original en cada indicador.
//   · Ausencia honesta: un hueco se muestra como hueco.
//   · El WORLD PULSE INDEX es DERIVADO: percentiles de 7
//     indicadores reales con pesos editoriales PUBLICADOS.
//
// Puro dato: sin React, sin BD, sin eval. La instantánea vive en
// public/pulso-mundial-instantanea.json (el servidor la lee con
// fs; la isla del cliente la trae con un fetch — cero bundle).
// ============================================================

import { enlaceOriginalDe } from "@/lib/nucleo/indicadores";

export interface IndicadorPulso {
  codigo: string;
  nombre: string;
  descripcion: string;
  unidad: string;
  categoria: "ECONOMIA" | "SOCIEDAD" | "AMBIENTE" | "CONTEXTO";
  /** 1 = más es mejor; -1 = menos es mejor (inflación, desempleo, CO2). */
  direccion: 1 | -1;
  /** Entra al WORLD PULSE INDEX. */
  papel: "indice" | "contexto";
  ultimoAnio: number | null;
}

export interface PaisPulso {
  iso3: string;
  nombre: string;
  continente: string;
}

export interface InstantaneaPulso {
  meta: {
    fuente: string;
    licencia: string;
    enlace: string;
    extraccion: string;
    ultimaActualizacionWB: string;
    anios: string;
    peticiones: number;
    paisesCubiertos: number;
    limitaciones: string[];
  };
  indicadores: IndicadorPulso[];
  paises: PaisPulso[];
  datos: Record<string, Record<string, Record<string, number>>>;
}

export interface PuntoSerie {
  anio: number;
  valor: number;
}

export interface ComponenteWpi {
  codigo: string;
  percentil: number | null;
  activo: boolean;
}

export interface WpiPais {
  iso3: string;
  anio: number;
  /** 0–100 o null si la cobertura no llega (declarado, no fingido). */
  valor: number | null;
  cobertura: number;
  componentes: ComponenteWpi[];
}

// ── LOS PESOS DEL ÍNDICE (decisión editorial PUBLICADA — ley del módulo) ──
// ECONOMÍA 45 % · SOCIEDAD 30 % · AMBIENTE 25 %.
export const PESOS_WPI: Record<string, number> = {
  "NY.GDP.MKTP.KD.ZG": 0.15,
  "FP.CPI.TOTL.ZG": 0.15,
  "NY.GDP.PCAP.CD": 0.15,
  "SP.DYN.LE00.IN": 0.12,
  "SL.UEM.TOTL.ZS": 0.08,
  "SH.XPD.CHEX.GD.ZS": 0.1,
  "EN.GHG.CO2.PC.CE.AR5": 0.13,
  "EG.FEC.RNEW.ZS": 0.12,
};

export const GRUPOS_WPI: { grupo: string; peso: number; codigos: string[] }[] = [
  { grupo: "Economía", peso: 0.45, codigos: ["NY.GDP.MKTP.KD.ZG", "FP.CPI.TOTL.ZG", "NY.GDP.PCAP.CD"] },
  { grupo: "Sociedad", peso: 0.3, codigos: ["SP.DYN.LE00.IN", "SL.UEM.TOTL.ZS", "SH.XPD.CHEX.GD.ZS"] },
  { grupo: "Ambiente", peso: 0.25, codigos: ["EN.GHG.CO2.PC.CE.AR5", "EG.FEC.RNEW.ZS"] },
];

export const CATEGORIAS_PULSO = ["ECONOMIA", "SOCIEDAD", "AMBIENTE", "CONTEXTO"] as const;
export type CategoriaPulso = (typeof CATEGORIAS_PULSO)[number];

/** Cobertura mínima de indicadores activos para que el WPI exista (5 de 7). */
export const COBERTURA_MINIMA_WPI = 5;

const INDICE = new Set(Object.keys(PESOS_WPI));

// ── LECTURAS BÁSICAS ────────────────────────────────────────

export function indicadorPorCodigo(snap: InstantaneaPulso, codigo: string): IndicadorPulso | null {
  return snap.indicadores.find((i) => i.codigo === codigo) ?? null;
}

export function continentesDe(snap: InstantaneaPulso): string[] {
  const set = new Set<string>();
  for (const p of snap.paises) set.add(p.continente);
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

export function paisesDeContinente(snap: InstantaneaPulso, continente: string): PaisPulso[] {
  if (!continente) return snap.paises.filter((p) => p.iso3 !== "WLD");
  return snap.paises.filter((p) => p.continente === continente);
}

export function paisPorIso3(snap: InstantaneaPulso, iso3: string): PaisPulso | null {
  return snap.paises.find((p) => p.iso3 === iso3) ?? null;
}

/** La serie anual REAL de un indicador para un país (ordenada, huecos como huecos). */
export function serieDePais(snap: InstantaneaPulso, iso3: string, codigo: string): PuntoSerie[] {
  const serie = snap.datos[iso3]?.[codigo];
  if (!serie) return [];
  return Object.entries(serie)
    .map(([anio, valor]) => ({ anio: Number(anio), valor: Number(valor) }))
    .filter((p) => Number.isFinite(p.valor))
    .sort((a, b) => a.anio - b.anio);
}

/** El dato más reciente REAL de un indicador para un país (o null). */
export function ultimoDato(
  snap: InstantaneaPulso,
  iso3: string,
  codigo: string
): PuntoSerie | null {
  const serie = serieDePais(snap, iso3, codigo);
  return serie.length > 0 ? serie[serie.length - 1] : null;
}

// ── FORMATO (español de la casa) ────────────────────────────

export function formatearValor(valor: number, unidad: string): string {
  if (!Number.isFinite(valor)) return "—";
  if (unidad === "%") return `${valor.toLocaleString("es-ES", { maximumFractionDigits: 2 })} %`;
  if (unidad === "% del PIB") return `${valor.toLocaleString("es-ES", { maximumFractionDigits: 2 })} % del PIB`;
  if (unidad === "t CO2e") return `${valor.toLocaleString("es-ES", { maximumFractionDigits: 2 })} t CO₂e`;
  if (unidad === "años") return `${valor.toLocaleString("es-ES", { maximumFractionDigits: 1 })} años`;
  if (unidad === "US$") {
    if (Math.abs(valor) >= 1e6) return `${(valor / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M US$`;
    return `${Math.round(valor).toLocaleString("es-ES")} US$`;
  }
  if (Math.abs(valor) >= 1e9) return `${(valor / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 2 })} mil millones`;
  if (Math.abs(valor) >= 1e6) return `${(valor / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 1 })} millones`;
  return Math.round(valor).toLocaleString("es-ES");
}

// ── EL WORLD PULSE INDEX (percentiles, pesos publicados) ────

/** Percentil de un país en UN indicador y UN año, entre todos los
 * países con dato (el Mundo WLD no compite). Direccion -1 invierte
 * (menos inflación/desempleo/CO2 = mejor percentil). Empates: el
 * percentil de la primera posición del empate. */
function percentilEn(
  snap: InstantaneaPulso,
  codigo: string,
  anio: number,
  iso3: string
): number | null {
  const clave = String(anio);
  const valores: { iso3: string; valor: number }[] = [];
  for (const p of snap.paises) {
    if (p.iso3 === "WLD") continue;
    const v = snap.datos[p.iso3]?.[codigo]?.[clave];
    if (typeof v === "number" && Number.isFinite(v)) valores.push({ iso3: p.iso3, valor: v });
  }
  if (valores.length < 2) return null;
  const ind = indicadorPorCodigo(snap, codigo);
  const direccion = ind?.direccion ?? 1;
  valores.sort((a, b) => (a.valor - b.valor) * direccion);
  const idx = valores.findIndex((v) => v.iso3 === iso3);
  if (idx < 0) return null;
  return Math.round((idx / (valores.length - 1)) * 1000) / 10;
}

/** El WPI de UN país en UN año: media ponderada de percentiles con
 * renormalización de pesos por cobertura (mínimo 5 de 7 activos). */
export function wpiDePais(snap: InstantaneaPulso, iso3: string, anio: number): WpiPais {
  const componentes: ComponenteWpi[] = [];
  let pesoVivo = 0;
  let suma = 0;
  for (const [codigo, peso] of Object.entries(PESOS_WPI)) {
    const percentil = percentilEn(snap, codigo, anio, iso3);
    const activo = percentil !== null;
    if (activo) {
      pesoVivo += peso;
      suma += peso * (percentil as number);
    }
    componentes.push({ codigo, percentil, activo });
  }
  const cobertura = componentes.filter((c) => c.activo).length;
  const valor =
    cobertura >= COBERTURA_MINIMA_WPI && pesoVivo > 0
      ? Math.round((suma / pesoVivo) * 10) / 10
      : null;
  return { iso3, anio, valor, cobertura, componentes };
}

/** La serie del WPI para un país (años donde la cobertura alcanza). */
export function wpiSerie(snap: InstantaneaPulso, iso3: string): PuntoSerie[] {
  const puntos: PuntoSerie[] = [];
  for (let anio = 2012; anio <= 2025; anio++) {
    const w = wpiDePais(snap, iso3, anio);
    if (w.valor !== null) puntos.push({ anio, valor: w.valor });
  }
  return puntos;
}

/** El percentil de un país en UN indicador y UN año (para la ficha
 * de indicadores: cada pieza independiente, con su año real). */
export function percentilIndicador(
  snap: InstantaneaPulso,
  codigo: string,
  anio: number,
  iso3: string
): number | null {
  return percentilEn(snap, codigo, anio, iso3);
}

/** El ranking mundial del WPI en un año (solo países con índice). */
export function rankingWpi(snap: InstantaneaPulso, anio: number): { iso3: string; wpi: number }[] {
  const filas: { iso3: string; wpi: number }[] = [];
  for (const p of snap.paises) {
    if (p.iso3 === "WLD") continue;
    const w = wpiDePais(snap, p.iso3, anio);
    if (w.valor !== null) filas.push({ iso3: p.iso3, wpi: w.valor });
  }
  return filas.sort((a, b) => b.wpi - a.wpi);
}

// ── COMPARAR PERÍODOS (deltas reales, honestos) ─────────────

export interface Comparacion {
  a: number | null;
  b: number | null;
  delta: number | null;
  /** Variación relativa en % — solo si a ≠ 0 (evita fingir infinities). */
  deltaPct: number | null;
}

export function compararPeriodos(
  snap: InstantaneaPulso,
  iso3: string,
  codigo: string,
  anioA: number,
  anioB: number
): Comparacion {
  const va = snap.datos[iso3]?.[codigo]?.[String(anioA)];
  const vb = snap.datos[iso3]?.[codigo]?.[String(anioB)];
  const a = typeof va === "number" ? va : null;
  const b = typeof vb === "number" ? vb : null;
  if (a === null || b === null) return { a, b, delta: null, deltaPct: null };
  const delta = Math.round((b - a) * 1e6) / 1e6;
  const deltaPct = a === 0 ? null : Math.round(((b - a) / Math.abs(a)) * 1e4) / 100;
  return { a, b, delta, deltaPct };
}

// ── LA METODOLOGÍA (texto publicado, igual en página y API) ─

export const METODOLOGIA_WPI = {
  titulo: "WORLD PULSE INDEX — metodología",
  que: "Un índice derivado (0–100) que resume el pulso estructural de una nación con 7 indicadores reales del Banco Mundial. No es una fuente primaria: es una lectura de Vanguard sobre datos públicos.",
  como: "Para cada indicador y cada año, cada país recibe su percentil (0–100) entre las naciones con dato. Los indicadores negativos (inflación, desempleo, CO₂ per cápita) se invierten: menos es mejor. El índice es la media ponderada de los percentiles con los pesos publicados arriba, renormalizada según la cobertura de cada país.",
  cobertura:
    "Un país necesita datos de al menos 5 de los 7 indicadores del índice en un año para tener WPI ese año; con menos, el índice se declara ausente — no se estima.",
  limitaciones:
    "Los años más recientes del Banco Mundial pueden ser preliminares. Los pesos son una decisión editorial de Vanguard (publicada y estable), no una medida oficial. Muestra curada de 47 naciones + el agregado mundial.",
} as const;

// ── FUENTE ÚNICA (atribución preservada) ────────────────────

export function fuentePulso(snap: InstantaneaPulso) {
  return {
    nombre: snap.meta.fuente,
    licencia: snap.meta.licencia,
    enlace: snap.meta.enlace,
    extraccion: snap.meta.extraccion,
    ultimaActualizacionWB: snap.meta.ultimaActualizacionWB,
  };
}

/** El original de cada indicador (atribución CC BY 4.0) — heredado
 * del BARÓMETRO: misma casa, mismos enlaces verificables. */
export function enlaceIndicador(codigo: string): string {
  return enlaceOriginalDe(codigo);
}
