// ═══════════════════════════════════════════════════════════════════
// v405.9 · LAS OCHO CAPAS DEL PLANETA — la arquitectura del centro de mapas.
//
// La regla que ordena este archivo: UNA capa no es un componente, es una
// DECLARACIÓN. Añadir la novena capa mañana es añadir un objeto a `CAPAS`:
// no se toca el globo, ni la sala, ni el cliente. Eso es lo que impide que
// VANGUARD acabe con ocho mapas duplicados.
//
// Cada capa dice: qué mide, con qué dato REAL lo mide, de qué fuente viene,
// cómo se pinta (mancha por país, puntos, arcos o solo textura) y cuál es su
// escala. Cero cifras escritas a mano: todo sale de las fuentes de la casa —
// Banco Mundial (poder-data), captura de divisas (world-data), el archivo de
// guerras (game-data) y los teatros del núcleo (mundo + acontecimientos).
// ═══════════════════════════════════════════════════════════════════

import { PAISES_GEO, POR_ISO2, POR_ISO3, type PaisGeo } from "./geo-paises";
import { PODER_FILAS, PODER_CAPTURA } from "./poder-data";
import { WORLD_CURRENCIES_FULL } from "./world-data";
import { HISTORICAL_WARS } from "./game-data";
import { TEATRO_3D } from "./mundo";
import { SEMILLA_ACONTECIMIENTOS } from "./nucleo/acontecimientos";

export type TipoCapa = "coropleta" | "categorica" | "textura" | "puntos" | "arcos";

/** Un valor por país, con su fuente declarada. */
export interface DatoPais {
  iso3: string;
  iso2: string;
  nombre: string;
  valor: number;
  texto: string;
  anio?: number;
}

export interface EscalaCapa {
  min: number;
  max: number;
  unidad: string;
  /** cómo se formatea un valor para leerlo */
  formato: "usd" | "personas" | "pct" | "tasa" | "numero";
}

export interface CapaMapa {
  id: string;
  nombre: string;
  /** la pregunta que responde la capa, en una línea */
  pregunta: string;
  tipo: TipoCapa;
  fuente: string;
  datos: DatoPais[];
  escala?: EscalaCapa;
  /** para capas categóricas: valor → color y etiqueta */
  categorias?: { clave: string; etiqueta: string; color: string }[];
  /** para capas de textura: qué piel del planeta se enciende */
  textura?: "oscuridad" | "satelite" | "noche";
}

// ── formatos: una sola gramática para todo el centro de mapas ─────────
export function fmtUsd(v: number): string {
  if (v >= 1e12) return `US$ ${(v / 1e12).toLocaleString("es-ES", { maximumFractionDigits: 2 })} billones`;
  if (v >= 1e9) return `US$ ${(v / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 0 })} mil M`;
  if (v >= 1e6) return `US$ ${(v / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 0 })} M`;
  return `US$ ${Math.round(v).toLocaleString("es-ES")}`;
}
export function fmtPersonas(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 2 })} M`;
  if (v >= 1e3) return `${(v / 1e3).toLocaleString("es-ES", { maximumFractionDigits: 0 })} mil`;
  return Math.round(v).toLocaleString("es-ES");
}
export function fmtNumero(v: number): string {
  return v.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}
function fmtSegun(formato: EscalaCapa["formato"], v: number): string {
  if (formato === "usd") return fmtUsd(v);
  if (formato === "personas") return fmtPersonas(v);
  if (formato === "pct") return `${fmtNumero(v)} %`;
  if (formato === "tasa") return `${fmtNumero(v)} por US$ 1`;
  return fmtNumero(v);
}

// ── LOS DATOS: cada capa lee su fuente, ninguna inventa ───────────────

/** Gasto militar (Banco Mundial, US$ corrientes) por país. */
const GASTO: DatoPais[] = PODER_FILAS.filter((f) => f.gasto > 0).map((f) => ({
  iso3: f.iso3,
  iso2: POR_ISO3.get(f.iso3)?.iso2 ?? "",
  nombre: f.nombre,
  valor: f.gasto,
  texto: fmtUsd(f.gasto),
  anio: f.anio,
}));

/** Personal en servicio activo (Banco Mundial). */
const PERSONAL: DatoPais[] = PODER_FILAS.filter((f) => f.personal != null && f.personal > 0).map((f) => ({
  iso3: f.iso3,
  iso2: POR_ISO3.get(f.iso3)?.iso2 ?? "",
  nombre: f.nombre,
  valor: f.personal as number,
  texto: fmtPersonas(f.personal as number),
  anio: f.anio,
}));

/** Tasa de cambio oficial (unidades de moneda local por 1 US$). */
const TASAS: DatoPais[] = WORLD_CURRENCIES_FULL.filter((c) => c.rate > 0).map((c) => ({
  iso3: POR_ISO2.get(c.code.toLowerCase())?.iso3 ?? "",
  iso2: c.code.toLowerCase(),
  nombre: c.name,
  valor: c.rate,
  texto: `${fmtNumero(c.rate)} ${c.curCode} por US$ 1`,
}));

/** Regiones del planeta: la división categórica de la capa mundial. */
const REGIONES = (() => {
  const cuenta = new Map<string, number>();
  for (const p of PAISES_GEO) if (p.region) cuenta.set(p.region, (cuenta.get(p.region) ?? 0) + 1);
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
})();

const COLOR_REGION: Record<string, string> = {
  Americas: "#5eead4",
  Europe: "#7fe3ff",
  Africa: "#f5a623",
  Asia: "#b48cff",
  Oceania: "#3ddc97",
  Antarctic: "#8b98ad",
};

/** La esfera de influencia declarada por el Banco Mundial (capas políticas). */
const BLOQUES = (() => {
  const cuenta = new Map<string, number>();
  for (const f of PODER_FILAS) cuenta.set(f.region, (cuenta.get(f.region) ?? 0) + 1);
  const paleta = ["#7fe3ff", "#f5a623", "#3ddc97", "#b48cff", "#ff7a52", "#5eead4", "#e8c56a", "#8b98ad"];
  return [...cuenta.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([clave, n], i) => ({ clave, etiqueta: `${clave} · ${n}`, color: paleta[i % paleta.length] }));
})();

function datosDeBloque(region: string): DatoPais[] {
  return PODER_FILAS.filter((f) => f.region === region).map((f) => ({
    iso3: f.iso3,
    iso2: POR_ISO3.get(f.iso3)?.iso2 ?? "",
    nombre: f.nombre,
    valor: 1,
    texto: region,
    anio: f.anio,
  }));
}

// ── escala automática: min/max salen de los datos, jamás se escriben ──
function escalaDe(datos: DatoPais[], unidad: string, formato: EscalaCapa["formato"]): EscalaCapa {
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const d of datos) {
    if (d.valor < min) min = d.valor;
    if (d.valor > max) max = d.valor;
  }
  return { min: Number.isFinite(min) ? min : 0, max, unidad, formato };
}

// ═══════════════════════════════════════════════════════════════════
// LAS OCHO CAPAS — el registro. Añadir una es añadir un objeto aquí.
// ═══════════════════════════════════════════════════════════════════
export const CAPAS: CapaMapa[] = [
  {
    id: "mundial",
    nombre: "MAPA MUNDIAL",
    pregunta: "¿dónde está cada país y a qué región del planeta pertenece?",
    tipo: "categorica",
    fuente: "Natural Earth 110m (polígonos) + ISO 3166-1 vía mledoze/countries",
    datos: [],
    categorias: REGIONES.map(([clave, n]) => ({
      clave,
      etiqueta: `${clave} · ${n}`,
      color: COLOR_REGION[clave] ?? "#8b98ad",
    })),
  },
  {
    id: "politico",
    nombre: "MAPA POLÍTICO",
    pregunta: "¿qué bloque declara cada país ante el Banco Mundial?",
    tipo: "categorica",
    fuente: `Banco Mundial — regiones de ${PODER_CAPTURA.indicadores.length} indicadores · captura ${PODER_CAPTURA.fecha ?? ""}`.trim(),
    datos: [],
    categorias: BLOQUES,
  },
  {
    id: "fisico",
    nombre: "MAPA FÍSICO",
    pregunta: "¿cómo es el planeta de verdad: mar, hielo y relieve?",
    tipo: "textura",
    fuente: "NASA Blue Marble · NASA Earth at Night · relieve earth-topology (assets/globe)",
    datos: [],
    textura: "satelite",
  },
  {
    id: "economico",
    nombre: "MAPA ECONÓMICO",
    pregunta: "¿cuánto gasta cada país en sus fuerzas armadas?",
    tipo: "coropleta",
    fuente: `Banco Mundial · MS.MIL.XPND.CD (US$ corrientes) · captura ${PODER_CAPTURA.fecha ?? ""}`.trim(),
    datos: GASTO,
    escala: escalaDe(GASTO, "US$ por año", "usd"),
  },
  {
    id: "demografico",
    nombre: "MAPA DEMOGRÁFICO",
    pregunta: "¿cuánta gente tiene cada país en armas?",
    tipo: "coropleta",
    fuente: `Banco Mundial · MS.MIL.TOTL.P1 (personal en servicio activo) · captura ${PODER_CAPTURA.fecha ?? ""}`.trim(),
    datos: PERSONAL,
    escala: escalaDe(PERSONAL, "personas en servicio", "personas"),
  },
  {
    id: "tematico",
    nombre: "MAPA TEMÁTICO · DIVISAS",
    pregunta: "¿cuántas unidades de su moneda cuesta un dólar?",
    tipo: "coropleta",
    fuente: "open.er-api.com — la captura que declara world-data.ts",
    datos: TASAS,
    escala: escalaDe(TASAS, "unidades por US$ 1", "tasa"),
  },
  {
    id: "historico",
    nombre: "MAPA HISTÓRICO",
    pregunta: "¿dónde se pelearon las guerras que fundaron el mundo de hoy?",
    tipo: "puntos",
    fuente: `game-data.ts · HISTORICAL_WARS (${HISTORICAL_WARS.length} guerras con coordenadas reales)`,
    datos: [],
  },
  {
    id: "acontecimientos",
    nombre: "MAPA DE ACONTECIMIENTOS",
    pregunta: "¿qué está pasando ahora mismo y dónde?",
    tipo: "puntos",
    fuente: `núcleo · ${SEMILLA_ACONTECIMIENTOS.length} acontecimientos sembrados + teatro 3D documentado`,
    datos: [],
  },
];

export function capaPorId(id: string): CapaMapa {
  return CAPAS.find((c) => c.id === id) ?? CAPAS[0];
}

// ── los puntos de las capas de memoria y de fuego: coordenadas reales ──
export interface PuntoMapa {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  color: string;
  tamano: number;
  etiqueta: string;
  /** a dónde lleva su ficha (si tiene puerta) */
  href?: string;
  /** época o estado, para el filtro de la capa */
  epoca?: string;
  desde?: number;
  hasta?: number;
}

const ERA_COLOR: Record<string, string> = {
  ANTIGUA: "#e8c56a",
  EDAD_MEDIA: "#f5a623",
  MODERNA: "#3ddc97",
  CONTEMPORANEA: "#ff7a52",
};

export const PUNTOS_HISTORICOS: PuntoMapa[] = HISTORICAL_WARS.map((g) => ({
  id: g.id,
  nombre: g.name,
  lat: g.lat,
  lng: g.lng,
  color: ERA_COLOR[g.era] ?? "#e8c56a",
  tamano: 0.35,
  etiqueta: `${g.name} · ${g.yearStart < 0 ? `${-g.yearStart} a. C.` : g.yearStart} – ${g.yearEnd < 0 ? `${-g.yearEnd} a. C.` : g.yearEnd} · ${g.region}`,
  epoca: g.era,
  desde: g.yearStart,
  hasta: g.yearEnd,
}));

/** Los teatros vivos, unidos a su acontecimiento del núcleo por `teatroTag`. */
export const PUNTOS_ACONTECIMIENTOS: PuntoMapa[] = SEMILLA_ACONTECIMIENTOS.filter((a) => a.teatroTag).map((a) => {
  const coords = TEATRO_3D[a.teatroTag as string] ?? { lat: 0, lng: 0 };
  const color = a.estado === "escalada" ? "#ff4d5e" : a.estado === "activo" ? "#f5a623" : "#3ddc97";
  return {
    id: a.slug,
    nombre: a.titulo,
    lat: coords.lat,
    lng: coords.lng,
    color,
    tamano: a.estado === "escalada" ? 0.6 : 0.45,
    etiqueta: `${a.titulo} · ${a.estado.toUpperCase()} desde ${a.ocurridoDesde}`,
    href: `/conflicto/${a.slug}`,
    epoca: a.estado,
    desde: Number(a.ocurridoDesde.slice(0, 4)),
  };
});

/** Los países tocados por un acontecimiento (para encender su polígono). */
export const PAISES_POR_ACONTECIMIENTO: Record<string, PaisGeo[]> = Object.fromEntries(
  SEMILLA_ACONTECIMIENTOS.map((a) => [
    a.slug,
    a.paisCodes.map((c) => POR_ISO2.get(c.toLowerCase())).filter((p): p is PaisGeo => Boolean(p)),
  ]),
);

// ── la escala de color: una sola función para todas las capas numéricas ──
/** Devuelve un color entre dos extremos según dónde cae el valor (escala raíz, no lineal: el gasto se concentra). */
export function colorDeValor(valor: number, escala: EscalaCapa | undefined): string {
  if (!escala || escala.max <= 0) return "rgba(148,163,205,0.18)";
  const t = Math.max(0, Math.min(1, Math.sqrt(valor / escala.max)));
  // de azul profundo (bajo) a ámbar (alto): la paleta de la casa
  const a = [24, 58, 92];
  const b = [245, 166, 35];
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgba(${r},${g},${bl},${(0.25 + 0.65 * t).toFixed(2)})`;
}

/** Cuántos países de los datos tienen polígono propio: la cobertura declarada. */
export function coberturaDeCapa(capa: CapaMapa): { conDato: number; conPoligono: number } {
  let conPoligono = 0;
  for (const d of capa.datos) if (POR_ISO3.has(d.iso3)) conPoligono++;
  return { conDato: capa.datos.length, conPoligono };
}
