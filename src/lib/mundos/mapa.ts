// ═══════════════════════════════════════════════════════════════════
// v405.12 · EL MAPA DE LOS MUNDOS — países reales, fronteras reales
//
// QUÉ FALTABA: la casa tenía la silueta del planeta (world-paths.json, sin
// países), 24 manchas de macroterritorio (territory-paths.ts, de un juego) y
// un globo WebGL. Ninguno servía para la pregunta más simple del lector:
// «toca mi país». Este módulo lee el mapa generado por
// `scripts/generar-mundos-mapa.mjs` (Natural Earth · world-atlas, la MISMA
// fuente del globo 3D) y expone:
//   · cada país como polígono SVG proyectado (azimuthal de área igual),
//   · sus FRONTERAS (los vecinos que comparten arco en topojson),
//   · su encuadre (bbox) y su centro proyectado,
//   · sus 24 macroterritorios de la casa (los del mapa de guerra, sin tocar).
// Cero datos a mano: todo se lee del archivo generado y del censo ISO.
// ═══════════════════════════════════════════════════════════════════

import mapaJson from "./mapa-mundo.json";
import { POR_NUM, POR_ISO2 } from "@/lib/geo-paises";
import { TERRITORY_COUNTRY_MAP, COUNTRY_TO_TERRITORY } from "@/lib/world-geo";

export interface PaisMapa {
  /** nombre de Natural Earth (inglés) — el que casa con los territorios */
  n: string;
  /** path SVG ya proyectado al lienzo del mapa */
  d: string;
  /** encuadre [x0,y0,x1,y1] */
  b: [number, number, number, number];
  /** centro proyectado [x,y] */
  c: [number, number];
}

interface ArchivoMapa {
  fuente: string;
  proyeccion: string;
  ancho: number;
  alto: number;
  paises: Record<string, PaisMapa>;
  vecinos: Record<string, string[]>;
  rejilla: string;
}

export const MAPA = mapaJson as unknown as ArchivoMapa;

export const LIENZO = { ancho: MAPA.ancho, alto: MAPA.alto };

/** id numérico ISO (3 dígitos, el de Natural Earth) → polígono */
export const POLIGONOS = MAPA.paises;

/** Los polígonos ordenados por área estimada del encuadre (grande → pequeño).
 *  El orden importa: pintar primero lo grande deja los países pequeños
 *  encima y clicables (si no, Francia tapa Mónaco). */
export const POLIGONOS_ORDENADOS: { clave: string; pais: PaisMapa; iso2: string | null; area: number }[] = Object.entries(POLIGONOS)
  .map(([clave, pais]) => {
    const g = POR_NUM.get(clave) ?? null;
    const [x0, y0, x1, y1] = pais.b;
    return { clave, pais, iso2: g ? g.iso2 : null, area: Math.abs((x1 - x0) * (y1 - y0)) };
  })
  .sort((a, b) => b.area - a.area);

/** nombre de Natural Earth → clave numérica (para unir territorios con el mapa) */
const CLAVE_POR_NOMBRE_NE = new Map<string, string>();
for (const [clave, pais] of Object.entries(POLIGONOS)) CLAVE_POR_NOMBRE_NE.set(pais.n, clave);

export function claveDeNumerico(num: string | null | undefined): string | null {
  if (!num) return null;
  const k = num.padStart(3, "0");
  return POLIGONOS[k] ? k : null;
}

/** El ISO-2 de un polígono del mapa (puede no tenerlo: Kosovo, Somaliland…). */
export function iso2DeClave(clave: string): string | null {
  const g = POR_NUM.get(clave);
  return g ? g.iso2 : null;
}

// ── FRONTERAS: topojson dice qué polígonos comparten arco; aquí se traduce
//    a países del censo, con nombre en español y enlace a su ficha.
export interface Vecino {
  iso2: string | null;
  nombre: string;
  clave: string;
}

const VECINOS_POR_ISO = new Map<string, Vecino[]>();

function vecinosDeClave(clave: string): Vecino[] {
  return (MAPA.vecinos[clave] ?? []).map((k) => {
    const g = POR_NUM.get(k) ?? null;
    return {
      iso2: g ? g.iso2 : null,
      nombre: g ? g.nombre : (POLIGONOS[k]?.n ?? k),
      clave: k,
    };
  });
}

/** Los países con los que comparte FRONTERA TERRESTRE (vecinos topológicos). */
export function vecinosDe(iso2: string): Vecino[] {
  const g = POR_ISO2.get((iso2 ?? "").toLowerCase());
  if (!g) return [];
  const cache = VECINOS_POR_ISO.get(g.iso2);
  if (cache) return cache;
  const clave = claveDeNumerico(g.num);
  const lista = clave ? vecinosDeClave(clave) : [];
  VECINOS_POR_ISO.set(g.iso2, lista);
  return lista;
}

/** Cuántas fronteras terrestres tiene un país (0 si no hay polígono). */
export function cuentaVecinos(iso2: string): number | null {
  const g = POR_ISO2.get((iso2 ?? "").toLowerCase());
  if (!g) return null;
  const clave = claveDeNumerico(g.num);
  if (!clave) return null;
  return vecinosDeClave(clave).length;
}

/** Las claves de polígono que hay que encender al elegir un país. */
export function conjuntoDe(iso2: string): { pais: string | null; vecinos: string[] } {
  const g = POR_ISO2.get((iso2 ?? "").toLowerCase());
  if (!g) return { pais: null, vecinos: [] };
  const clave = claveDeNumerico(g.num);
  if (!clave) return { pais: null, vecinos: [] };
  return { pais: clave, vecinos: (MAPA.vecinos[clave] ?? []).filter((k) => !!POLIGONOS[k]) };
}

// ── LOS 24 MACROTERRITORIOS DE LA CASA ─────────────────────────────
// Son los del mapa de guerra (world-geo.ts). NO se renombran ni se tocan sus
// países: aquí solo se les pone nombre en español para poder leerlos en el
// mapa nuevo, y se cuentan desde la fuente (cero cifras a mano).
export const NOMBRE_TERRITORIO: Record<string, string> = {
  canadartico: "Ártico canadiense",
  eeuu: "Estados Unidos",
  mexico: "México y Centroamérica",
  amazonia: "Amazonia",
  andes: "Andes",
  argentina: "Cono Sur",
  europawest: "Europa occidental",
  escandinavia: "Escandinavia",
  europaeste: "Europa del Este",
  balcanes: "Balcanes y Anatolia",
  magreb: "Magreb",
  africaoccidental: "África occidental",
  africacentral: "África central",
  egipto: "Egipto y Cuerno",
  africaoriental: "África oriental",
  africasure: "África austral",
  oriente: "Oriente Próximo",
  asiacentral: "Asia central",
  siberia: "Siberia",
  india: "Subcontinente indio",
  china: "China y Mongolia",
  sudeste: "Sudeste asiático",
  japon: "Japón y Corea",
  australia: "Oceanía",
};

export interface Territorio {
  clave: string;
  nombre: string;
  /** ISO-2 de los países del censo que caen dentro */
  paises: string[];
  /** claves de polígono (para pintar el territorio entero en el mapa) */
  claves: string[];
}

function construirTerritorios(): Territorio[] {
  const salida: Territorio[] = [];
  for (const [clave, nombresNE] of Object.entries(TERRITORY_COUNTRY_MAP)) {
    const paises: string[] = [];
    const claves: string[] = [];
    for (const nombre of nombresNE) {
      const k = CLAVE_POR_NOMBRE_NE.get(nombre);
      if (k) claves.push(k);
      const g = k ? POR_NUM.get(k) : null;
      if (g) paises.push(g.iso2);
    }
    salida.push({
      clave,
      nombre: NOMBRE_TERRITORIO[clave] ?? clave,
      paises,
      claves,
    });
  }
  return salida.sort((a, b) => b.paises.length - a.paises.length);
}

export const TERRITORIOS: Territorio[] = construirTerritorios();

const TERRITORIO_POR_ISO = new Map<string, string>();
for (const t of TERRITORIOS) for (const iso2 of t.paises) TERRITORIO_POR_ISO.set(iso2, t.clave);

/** El macroterritorio de la casa al que pertenece un país (o null). */
export function territorioDe(iso2: string): Territorio | null {
  const clave = TERRITORIO_POR_ISO.get((iso2 ?? "").toLowerCase());
  if (!clave) return null;
  return TERRITORIOS.find((t) => t.clave === clave) ?? null;
}

/** El territorio de una clave de polígono (para pintar por manchas). */
export function territorioDeClave(clave: string): string | null {
  const pais = POLIGONOS[clave];
  if (!pais) return null;
  return COUNTRY_TO_TERRITORY[pais.n] ?? null;
}

/** Cobertura del mapa, para declararla en la sala sin adornos. */
export function coberturaMapa() {
  const conPoligono = Object.keys(POLIGONOS).length;
  const conIso = POLIGONOS_ORDENADOS.filter((p) => !!p.iso2).length;
  const conVecinos = Object.keys(MAPA.vecinos).length;
  return {
    fuente: "Natural Earth vía world-atlas (countries-110m) · la misma del globo 3D",
    proyeccion: MAPA.proyeccion,
    conPoligono,
    conIso,
    conVecinos,
    territorios: TERRITORIOS.length,
  };
}

export const REJILLA_SVG = MAPA.rejilla;
