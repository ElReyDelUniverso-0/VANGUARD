// ═══════════════════════════════════════════════════════════════════
// v405.12 · LA FICHA DEL PAÍS — cinco tablas viejas, una sola verdad
//
// LA AUDITORÍA, EN UNA FRASE: el mismo país vivía en cinco tablas que no se
// conocían entre sí y cada pantalla enseñaba una —
//   ① geo-paises.ts   (249) → identidad ISO-2 / ISO-3 / numérico + centro
//   ② atlas-data.ts   (162) → capital, zona horaria, población, superficie,
//                             idiomas, moneda, gobierno y líder REAL
//   ③ world-data.ts   (249) → moneda oficial con su tasa por dólar
//   ④ poder-data.ts   (167) → gasto militar, efectivos y % del PIB (Banco Mundial)
//   ⑤ acontecimientos (9)   → hechos armados reales con sus países
// Ninguna sobra: cada una mide algo que las otras no. Lo que sobraba era
// TENER QUE ELEGIR. Esta ficha las une con la identidad ISO como llave y
// declara, campo por campo, si el dato existe o no (`cobertura`).
//
// REGLA QUE CUMPLE: no se inventa ni un campo. Si una tabla no tiene el país,
// el campo vale null y la sala lo dice con la palabra «sin dato». Nunca un
// cero, nunca un promedio, nunca una estimación disfrazada.
// ═══════════════════════════════════════════════════════════════════

import { PAISES_GEO, POR_ISO2, type PaisGeo } from "@/lib/geo-paises";
import { PAISES_ATLAS, PERSONAS_ATLAS, type PaisAtlas, type PersonaAtlas } from "@/lib/atlas-data";
import { WORLD_CURRENCIES_FULL, type WorldCountry } from "@/lib/world-data";
import { PODER_FILAS, type FilaPoder } from "@/lib/poder-data";
import type { FormatoMedida } from "./formato";

// ── índices (una sola pasada al cargar; el resto son búsquedas O(1)) ──
const ATLAS_POR_ISO = new Map<string, PaisAtlas>(PAISES_ATLAS.map((p) => [p.id, p]));
const MONEDA_POR_ISO = new Map<string, WorldCountry>(WORLD_CURRENCIES_FULL.map((c) => [c.code, c]));
const PODER_POR_ISO3 = new Map<string, FilaPoder & { puesto: number }>(
  PODER_FILAS.map((f, i) => [f.iso3, { ...f, puesto: i + 1 }]),
);
const PERSONAS_POR_ISO = new Map<string, PersonaAtlas[]>();
for (const p of PERSONAS_ATLAS) {
  const lista = PERSONAS_POR_ISO.get(p.pais) ?? [];
  lista.push(p);
  PERSONAS_POR_ISO.set(p.pais, lista);
}

export interface FichaPais {
  /** identidad (geo-paises · siempre presente) */
  iso2: string;
  iso3: string;
  num: string;
  nombre: string;
  region: string;
  subregion: string;
  lat: number;
  lng: number;
  /** atlas real (capital, zona, población, superficie, idiomas, moneda, gobierno, líder) */
  atlas: {
    capital: string;
    zona: string;
    poblacion: number;
    superficie: number;
    idiomas: string;
    moneda: string;
    gobierno: string;
    lider: string;
    dato: string;
  } | null;
  /** moneda oficial con su tasa por dólar (world-data) */
  moneda: { codigo: string; nombre: string; simbolo: string; tasa: number } | null;
  /** gasto militar del Banco Mundial (poder-data) con su puesto mundial */
  militar: { gasto: number; personal: number | null; gdpPct: number | null; anio: number; puesto: number; de: number } | null;
  /** personas del poder con sede real (atlas-data) */
  personas: { id: string; nombre: string; cargo: string; categoria: string; sede: string; ciudad: string; desde: number | string }[];
  /** derivado honesto: habitantes por km² */
  densidad: number | null;
  /** qué hay y qué no, campo por campo */
  cobertura: { atlas: boolean; moneda: boolean; militar: boolean; personas: number };
}

function construir(g: PaisGeo): FichaPais {
  const a = ATLAS_POR_ISO.get(g.iso2) ?? null;
  const m = MONEDA_POR_ISO.get(g.iso2) ?? null;
  const poder = PODER_POR_ISO3.get(g.iso3) ?? null;
  const personas = (PERSONAS_POR_ISO.get(g.iso2) ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre,
    cargo: p.cargo,
    categoria: p.categoria,
    sede: p.sede,
    ciudad: p.ciudad,
    desde: p.desde,
  }));
  return {
    iso2: g.iso2,
    iso3: g.iso3,
    num: g.num,
    nombre: g.nombre,
    region: g.region,
    subregion: g.subregion,
    lat: g.lat,
    lng: g.lng,
    atlas: a
      ? {
          capital: a.capital,
          zona: a.zona,
          poblacion: a.poblacion,
          superficie: a.superficie,
          idiomas: a.idiomas,
          moneda: a.moneda,
          gobierno: a.gobierno,
          lider: a.lider,
          dato: a.dato,
        }
      : null,
    moneda: m ? { codigo: m.curCode, nombre: m.curName, simbolo: m.symbol, tasa: m.rate } : null,
    militar: poder
      ? {
          gasto: poder.gasto,
          personal: poder.personal,
          gdpPct: poder.gdpPct,
          anio: poder.anio,
          puesto: poder.puesto,
          de: PODER_FILAS.length,
        }
      : null,
    personas,
    densidad: a && a.superficie > 0 ? (a.poblacion * 1_000_000) / a.superficie : null,
    cobertura: { atlas: !!a, moneda: !!m, militar: !!poder, personas: personas.length },
  };
}

// la ficha se construye una vez por proceso (249 objetos, no más)
const CACHE = new Map<string, FichaPais>();

/** La ficha de un país por ISO-2 (en minúsculas). Devuelve null si no existe. */
export function fichaPais(iso2: string): FichaPais | null {
  const clave = (iso2 ?? "").trim().toLowerCase();
  const c = CACHE.get(clave);
  if (c) return c;
  const g = POR_ISO2.get(clave);
  if (!g) return null;
  const f = construir(g);
  CACHE.set(clave, f);
  return f;
}

/** Las 249 fichas del censo, en el orden de la fuente. */
export function fichas(): FichaPais[] {
  return PAISES_GEO.map((g) => fichaPais(g.iso2)).filter((f): f is FichaPais => !!f);
}

/** Nombres en español de las cinco regiones del censo + Antártida. */
export const REGIONES_ES: Record<string, string> = {
  Africa: "África",
  Americas: "América",
  Antarctic: "Antártida",
  Asia: "Asia",
  Europe: "Europa",
  Oceania: "Oceanía",
};

export function regionEnEspanol(region: string): string {
  return REGIONES_ES[region] ?? region;
}

/** Cuántos países hay en cada región, y cuántos traen cada tabla. */
export function coberturaGlobal() {
  const todas = fichas();
  const regiones: { clave: string; nombre: string; paises: number; conAtlas: number; conMilitar: number }[] = [];
  for (const f of todas) {
    let r = regiones.find((x) => x.clave === f.region);
    if (!r) {
      r = { clave: f.region, nombre: regionEnEspanol(f.region), paises: 0, conAtlas: 0, conMilitar: 0 };
      regiones.push(r);
    }
    r.paises += 1;
    if (f.atlas) r.conAtlas += 1;
    if (f.militar) r.conMilitar += 1;
  }
  return {
    paises: todas.length,
    conAtlas: todas.filter((f) => f.atlas).length,
    conMoneda: todas.filter((f) => f.moneda).length,
    conMilitar: todas.filter((f) => f.militar).length,
    conPersonas: todas.filter((f) => f.personas.length > 0).length,
    personas: PERSONAS_ATLAS.length,
    regiones,
  };
}

// ═══════════════════════════════════════════════════════════════════
// LAS MEDIDAS DEL MAPA — cada capa es una columna real de la ficha
// ═══════════════════════════════════════════════════════════════════
export interface Medida {
  id: string;
  nombre: string;
  /** la pregunta que responde la capa, en palabras del lector */
  pregunta: string;
  /** unidad y formato de la cifra */
  formato: FormatoMedida;
  /** de dónde sale el dato, con nombre y fecha de la fuente */
  fuente: string;
  /** mayor = más oscuro (o menor, si la capa premia lo pequeño) */
  sentido: "mayor" | "menor";
  valor: (f: FichaPais) => number | null;
}

export const MEDIDAS: Medida[] = [
  {
    id: "poblacion",
    nombre: "Población",
    pregunta: "¿Dónde vive la gente?",
    formato: "poblacion",
    fuente: "atlas-data (población en millones, censo de la casa)",
    sentido: "mayor",
    valor: (f) => (f.atlas ? f.atlas.poblacion : null),
  },
  {
    id: "superficie",
    nombre: "Superficie",
    pregunta: "¿Cuánto territorio ocupa cada país?",
    formato: "superficie",
    fuente: "atlas-data (km²)",
    sentido: "mayor",
    valor: (f) => (f.atlas ? f.atlas.superficie : null),
  },
  {
    id: "densidad",
    nombre: "Densidad",
    pregunta: "¿Dónde está apretada la población?",
    formato: "densidad",
    fuente: "derivada: población ÷ superficie de atlas-data",
    sentido: "mayor",
    valor: (f) => f.densidad,
  },
  {
    id: "gasto",
    nombre: "Gasto militar",
    pregunta: "¿Quién paga la guerra?",
    formato: "usd",
    fuente: "poder-data · Banco Mundial MS.MIL.XPND.CD (captura 2026-11-05)",
    sentido: "mayor",
    valor: (f) => (f.militar ? f.militar.gasto : null),
  },
  {
    id: "gastoPib",
    nombre: "Esfuerzo militar",
    pregunta: "¿Qué parte de su riqueza dedica a armas?",
    formato: "pct",
    fuente: "poder-data · Banco Mundial MS.MIL.XPND.GD.ZS (captura 2026-11-05)",
    sentido: "mayor",
    valor: (f) => (f.militar ? f.militar.gdpPct : null),
  },
  {
    id: "personal",
    nombre: "Efectivos",
    pregunta: "¿Cuántos soldados hay en armas?",
    formato: "personal",
    fuente: "poder-data · Banco Mundial MS.MIL.TOTL.P1 (captura 2026-11-05)",
    sentido: "mayor",
    valor: (f) => (f.militar ? f.militar.personal : null),
  },
  {
    id: "tasa",
    nombre: "Moneda",
    pregunta: "¿Cuánto vale su dinero frente al dólar?",
    formato: "tasa",
    fuente: "world-data · open.er-api.com (captura del dataset)",
    sentido: "menor",
    valor: (f) => (f.moneda ? f.moneda.tasa : null),
  },
  {
    id: "vecinos",
    nombre: "Fronteras",
    pregunta: "¿Con cuántos países comparte tierra?",
    formato: "conteo",
    fuente: "derivada: topología Natural Earth (arcos compartidos)",
    sentido: "mayor",
    valor: () => null, // la rellena mapa.ts, que es quien sabe de fronteras
  },
  {
    id: "conflictos",
    nombre: "Conflictos",
    pregunta: "¿Dónde hay un hecho armado abierto?",
    formato: "conteo",
    fuente: "núcleo · SEMILLA_ACONTECIMIENTOS (hechos reales con fecha)",
    sentido: "mayor",
    valor: () => null, // la rellena la sala, que es quien tiene el archivo
  },
];

export const MEDIDA_POR_ID = new Map(MEDIDAS.map((m) => [m.id, m]));
