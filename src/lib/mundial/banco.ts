// ═══════════════════════════════════════════════════════════════════
// v416.0 · EL BANCO DE DATOS — hablar con la fuente, sin inventar nada
// Departamento 4 · VANGUARD WORLD DATA
//
// Esta capa NO guarda cifras: pide series al Banco Mundial (API pública v2,
// sin clave) y las devuelve con su año pegado a cada valor. Tres reglas:
//
//   1. CADA NÚMERO LLEVA SU AÑO. El Banco Mundial publica por años y no todos
//      los países tienen el mismo último año. Nunca se rellena un hueco con el
//      año de al lado ni se interpola: si no hay valor, no hay punto.
//   2. SI LA FUENTE NO CONTESTA, SE DICE. La consulta devuelve `null` y la
//      interfaz escribe «sin dato» o «fuente no disponible». No hay respaldo
//      inventado (a diferencia de otras fuentes de la casa que sí lo declaran).
//   3. LA CACHÉ ES DE LA PLATAFORMA, no de este archivo: `next.revalidate`
//      deja que Vercel sirva la misma serie durante 24 h. Aquí solo hay una
//      caché en memoria por instancia para no repetir la misma llamada dentro
//      de una misma página.
//
// LICENCIA: los datos del Banco Mundial se publican con CC BY 4.0; la casa
// cita fuente, licencia y enlace de definición en cada indicador.
// ═══════════════════════════════════════════════════════════════════

import type { Indicador } from "./catalogo";
import { POR_ISO2 } from "@/lib/geo-paises";

/** Los nombres y regiones del Banco Mundial vienen en inglés: se traducen aquí. */
const REGION_ES: Record<string, string> = {
  "Latin America & Caribbean": "América Latina y el Caribe",
  "Sub-Saharan Africa": "África subsahariana",
  "Europe & Central Asia": "Europa y Asia Central",
  "Middle East & North Africa": "Oriente Medio y Norte de África",
  "East Asia & Pacific": "Asia Oriental y el Pacífico",
  "South Asia": "Asia meridional",
  "North America": "Norteamérica",
};
const RENTA_ES: Record<string, string> = {
  "High income": "Renta alta",
  "Upper middle income": "Renta media-alta",
  "Lower middle income": "Renta media-baja",
  "Low income": "Renta baja",
  "Not classified": "Sin clasificar",
};

const BASE = "https://api.worldbank.org/v2";
const TTL_SERIE = 60 * 60 * 24; // 24 h
const TTL_PAISES = 60 * 60 * 24 * 7; // 7 días
const TIMEOUT_MS = 7000;

export interface Punto {
  anio: number;
  valor: number;
}

export interface Serie {
  iso: string;
  pais: string;
  indicador: string;
  nombre: string;
  unidad: string;
  fuente: string;
  licencia: string;
  urlDefinicion: string;
  /** puntos ordenados de antiguo a reciente; huecos = años sin dato */
  puntos: Punto[];
  /** el último año con valor (null si la fuente no publica nada) */
  ultimo: Punto | null;
  /** años con dato (para explicar la cobertura sin adornos) */
  cobertura: number;
  /** fecha de consulta, ISO */
  consultado: string;
  /** false si el Banco Mundial no contestó a esta petición */
  disponible: boolean;
}

export interface PaisMundo {
  iso2: string;
  iso3: string;
  nombre: string;
  region: string;
  regionId: string;
  renta: string;
  capital: string;
}

interface CacheItem {
  ts: number;
  datos: unknown;
}

const memoria = new Map<string, CacheItem>();
const TTL_MEM = 10 * 60 * 1000;

async function traer<T>(url: string, ttlSeg: number, clave: string): Promise<T | null> {
  const guardado = memoria.get(clave);
  if (guardado && Date.now() - guardado.ts < TTL_MEM) return guardado.datos as T;
  try {
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), TIMEOUT_MS);
    const r = await fetch(url, {
      signal: control.signal,
      headers: { "user-agent": "VanguardWorldData/416.0 (datos abiertos; CC BY 4.0)" },
      next: { revalidate: ttlSeg },
    });
    clearTimeout(reloj);
    if (!r.ok) return null;
    const json = (await r.json()) as T;
    memoria.set(clave, { ts: Date.now(), datos: json });
    return json;
  } catch {
    return null;
  }
}

interface FilaBm {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
}

/** Convierte la respuesta [meta, filas] del Banco Mundial en puntos limpios. */
function aPuntos(filas: FilaBm[] | null | undefined): Punto[] {
  if (!Array.isArray(filas)) return [];
  const vistos = new Set<number>();
  const puntos: Punto[] = [];
  for (const f of filas) {
    const anio = Number(f?.date);
    const valor = f?.value;
    if (!Number.isFinite(anio) || valor === null || valor === undefined) continue;
    if (!Number.isFinite(valor)) continue;
    if (vistos.has(anio)) continue;
    vistos.add(anio);
    puntos.push({ anio, valor });
  }
  return puntos.sort((a, b) => a.anio - b.anio);
}

function serieVacia(iso: string, ind: Indicador, pais = iso): Serie {
  return {
    iso,
    pais,
    indicador: ind.id,
    nombre: ind.nombre,
    unidad: ind.unidad,
    fuente: ind.fuente,
    licencia: ind.licencia,
    urlDefinicion: ind.urlDefinicion,
    puntos: [],
    ultimo: null,
    cobertura: 0,
    consultado: new Date().toISOString(),
    disponible: false,
  };
}

/** Serie histórica de un país para un indicador. */
export async function serieDePais(iso: string, ind: Indicador, desde = 1990, hasta = new Date().getFullYear()): Promise<Serie> {
  const codigoPais = iso.toLowerCase();
  const url = `${BASE}/country/${codigoPais}/indicator/${ind.codigo}?format=json&per_page=400&date=${desde}:${hasta}`;
  const json = await traer<[unknown, FilaBm[]]>(url, TTL_SERIE, `s:${codigoPais}:${ind.codigo}:${desde}`);
  if (!Array.isArray(json) || !Array.isArray(json[1])) return serieVacia(iso, ind);
  const puntos = aPuntos(json[1]);
  const nombre = POR_ISO2.get(codigoPais)?.nombre ?? json[1][0]?.country?.value ?? iso.toUpperCase();
  return {
    ...serieVacia(iso, ind, nombre),
    puntos,
    ultimo: puntos.length ? puntos[puntos.length - 1] : null,
    cobertura: puntos.length,
    disponible: true,
  };
}

/** Varias series a la vez (comparador). Secuencial en tandas para no abrir 30 sockets. */
export async function seriesDeVarios(iso2s: string[], ind: Indicador, desde = 1990): Promise<Serie[]> {
  const salida: Serie[] = [];
  const tanda = 4;
  for (let i = 0; i < iso2s.length; i += tanda) {
    const grupo = iso2s.slice(i, i + tanda);
    const res = await Promise.all(grupo.map((iso) => serieDePais(iso, ind, desde)));
    salida.push(...res);
  }
  return salida;
}

export interface FilaRanking {
  iso: string;
  pais: string;
  region: string;
  renta: string;
  valor: number;
  anio: number;
}

export interface Ranking {
  indicador: string;
  nombre: string;
  unidad: string;
  /** "fijo" = todos los valores son del mismo año; "reciente" = cada país, su último dato */
  modo: "fijo" | "reciente";
  anio: number | null;
  /** años distintos presentes (solo en modo reciente) */
  anios: number[];
  filas: FilaRanking[];
  paisesConDato: number;
  paisesSinDato: number;
  consultado: string;
  disponible: boolean;
}

/**
 * Ranking de un indicador.
 *  · modo "fijo" (anio=2023): todos los países en el MISMO año. Es el único
 *    modo en el que una comparación entre filas es estricta.
 *  · modo "reciente": el último dato disponible de cada país (`mrnev=1`). Se
 *    usa cuando el año fijo dejaría medio mundo en «sin dato», y la tabla
 *    escribe el año en cada fila para que nadie compare años a ciegas.
 */
export async function rankingDeIndicador(
  ind: Indicador,
  opciones: { anio?: number | null; limite?: number } = {}
): Promise<Ranking> {
  const anio = opciones.anio ?? null;
  const modo: "fijo" | "reciente" = anio ? "fijo" : "reciente";
  const fecha = anio ? String(anio) : "";
  const extra = anio ? "" : "&mrnev=1";
  const url = `${BASE}/country/all/indicator/${ind.codigo}?format=json&per_page=400${fecha ? `&date=${fecha}` : ""}${extra}`;
  const json = await traer<[unknown, FilaBm[]]>(url, TTL_SERIE, `r:${ind.codigo}:${modo}:${fecha}`);
  const paises = await catalogoPaises();
  if (!Array.isArray(json) || !Array.isArray(json[1])) {
    return {
      indicador: ind.id, nombre: ind.nombre, unidad: ind.unidad, modo, anio,
      anios: [], filas: [], paisesConDato: 0, paisesSinDato: paises.length,
      consultado: new Date().toISOString(), disponible: false,
    };
  }
  const porIso = new Map(paises.map((p) => [p.iso3, p]));
  const filas: FilaRanking[] = [];
  const anios = new Set<number>();
  for (const f of json[1]) {
    const valor = f?.value;
    if (valor === null || valor === undefined || !Number.isFinite(valor)) continue;
    const p = porIso.get(f.countryiso3code);
    if (!p) continue; // agrega regiones y grupos de renta: aquí solo países
    const a = Number(f.date);
    if (!Number.isFinite(a)) continue;
    anios.add(a);
    filas.push({ iso: p.iso2, pais: p.nombre, region: p.region, renta: p.renta, valor, anio: a });
  }
  filas.sort((x, y) => (ind.sentido === "bajo" ? x.valor - y.valor : y.valor - x.valor));
  const limite = opciones.limite ?? 220;
  return {
    indicador: ind.id, nombre: ind.nombre, unidad: ind.unidad, modo, anio,
    anios: [...anios].sort((a, b) => b - a),
    filas: filas.slice(0, limite),
    paisesConDato: filas.length,
    paisesSinDato: Math.max(0, paises.length - filas.length),
    consultado: new Date().toISOString(),
    disponible: true,
  };
}

let cachePaises: { ts: number; datos: PaisMundo[] } | null = null;

/** Catálogo de países del Banco Mundial: región, nivel de renta y capital. */
export async function catalogoPaises(): Promise<PaisMundo[]> {
  if (cachePaises && Date.now() - cachePaises.ts < TTL_MEM * 10) return cachePaises.datos;
  const url = `${BASE}/country?format=json&per_page=400`;
  const json = await traer<[unknown, Record<string, unknown>[]]>(url, TTL_PAISES, "paises");
  if (!Array.isArray(json) || !Array.isArray(json[1])) return cachePaises?.datos ?? [];
  const salida: PaisMundo[] = [];
  for (const c of json[1]) {
    const region = c.region as { id: string; value: string } | undefined;
    const renta = c.incomeLevel as { id: string; value: string } | undefined;
    const iso2 = String(c.iso2Code ?? "");
    if (!iso2 || !region || region.id === "NA") continue; // NA = agregados
    const iso = iso2.toLowerCase();
    const geo = POR_ISO2.get(iso);
    salida.push({
      iso2: iso,
      iso3: String(c.id ?? ""),
      // nombre en español del censo geográfico de la casa; si falta, el de la fuente
      nombre: geo?.nombre ?? String(c.name ?? iso2),
      region: REGION_ES[region.value] ?? region.value,
      regionId: region.id,
      renta: RENTA_ES[renta?.value ?? ""] ?? renta?.value ?? "sin dato",
      capital: String(c.capitalCity ?? ""),
    });
  }
  salida.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  cachePaises = { ts: Date.now(), datos: salida };
  return salida;
}

/** Agregados que el propio Banco Mundial calcula (no los calcula la casa). */
export const AGREGADOS = [
  { iso: "WLD", nombre: "Mundo", nota: "Agregado del Banco Mundial (WLD)" },
  { iso: "HIC", nombre: "Países de renta alta", nota: "Agregado del Banco Mundial (HIC)" },
  { iso: "MIC", nombre: "Países de renta media", nota: "Agregado del Banco Mundial (MIC)" },
  { iso: "LIC", nombre: "Países de renta baja", nota: "Agregado del Banco Mundial (LIC)" },
  { iso: "LCN", nombre: "América Latina y el Caribe", nota: "Agregado del Banco Mundial (LCN)" },
  { iso: "EAS", nombre: "Asia Oriental y Pacífico", nota: "Agregado del Banco Mundial (EAS)" },
  { iso: "ECS", nombre: "Europa y Asia Central", nota: "Agregado del Banco Mundial (ECS)" },
  { iso: "MEA", nombre: "Oriente Medio y Norte de África", nota: "Agregado del Banco Mundial (MEA)" },
  { iso: "SAS", nombre: "Asia meridional", nota: "Agregado del Banco Mundial (SAS)" },
  { iso: "SSF", nombre: "África subsahariana", nota: "Agregado del Banco Mundial (SSF)" },
];

/** Serie de un agregado oficial (panel de desarrollo). */
export async function serieDeAgregado(iso: string, ind: Indicador, desde = 1990): Promise<Serie> {
  const s = await serieDePais(iso, ind, desde);
  const nombre = AGREGADOS.find((a) => a.iso === iso)?.nombre ?? iso;
  return { ...s, pais: s.disponible ? s.pais : nombre };
}

/** Cuántos países publican este indicador (para explicar cobertura, no para rellenar). */
export async function coberturaIndicador(ind: Indicador): Promise<{ conDato: number; total: number }> {
  const r = await rankingDeIndicador(ind, { limite: 400 });
  return { conDato: r.paisesConDato, total: r.paisesConDato + r.paisesSinDato };
}
