// ═══════════════════════════════════════════════════════════════════
// v422.0 VANGUARD WORLDS — TIPOS DEL MUNDO VIVO
//
// La regla que ordena este archivo: un MUNDO no es un marcador en un
// globo, es una ZONA real del planeta con lugares REALES, y cada lugar
// enlaza a experiencias REALES de Vanguard. Nada ficticio: cada enlace
// apunta a una puerta que existe, y el marco lo declara si no la tiene.
// ═══════════════════════════════════════════════════════════════════

/** Categorías de experiencia a las que puede llevar un lugar. */
export type CategoriaMundo =
  | "informacion"
  | "historia"
  | "acontecimientos"
  | "datos"
  | "educacion"
  | "simulaciones"
  | "infraestructura";

export const CATEGORIA_MUNDOS: {
  clave: CategoriaMundo;
  etiqueta: string;
  acento: string;
}[] = [
  { clave: "informacion", etiqueta: "Información", acento: "#7DD3FC" },
  { clave: "historia", etiqueta: "Historia", acento: "#C4B5FD" },
  { clave: "acontecimientos", etiqueta: "Acontecimientos", acento: "#FBBF24" },
  { clave: "datos", etiqueta: "Datos", acento: "#34D399" },
  { clave: "educacion", etiqueta: "Educación", acento: "#F472B6" },
  { clave: "simulaciones", etiqueta: "Simulaciones", acento: "#FB923C" },
  { clave: "infraestructura", etiqueta: "Infraestructura", acento: "#A78BFA" },
];

/** Una puerta real de Vanguard a la que conduce un lugar. */
export interface EnlaceMundo {
  /** ruta interna (sin dominio): /mundos/us, /infraestructura/obra/… */
  ruta: string;
  /** qué es la puerta, en una línea */
  etiqueta: string;
  /** por qué lleva ahí este lugar */
  motivo: string;
  categoria: CategoriaMundo;
}

/** Un lugar real del planeta: punto de interés con experiencias de la casa. */
export interface PoiMundo {
  id: string;
  nombre: string;
  /** país donde vive el lugar */
  pais: { nombre: string; iso2: string };
  lat: number;
  lng: number;
  /** una línea: qué es este lugar para el explorador */
  nota: string;
  experiencias: EnlaceMundo[];
}

/** Una zona real del planeta: un mundo explorable. */
export interface ZonaMundo {
  id: string;
  nombre: string;
  /** una línea: qué se explora en este mundo */
  lema: string;
  /** centro de la zona para el vuelo inicial del globo */
  centro: { lat: number; lng: number; altitud: number };
  /** color único de la zona en el rail y en las marcas */
  acento: string;
  /** emoji/glifo dibujado en código (sin imágenes, ley de la casa) */
  glifo: string;
  /** los lugares de este mundo */
  lugares: PoiMundo[];
}

/** El payload que la página server compone y viaja con el primer byte. */
export interface PayloadMundos {
  zonas: ZonaMundo[];
  /** cifras reales por zona (número de lugares y experiencias) */
  cifras: {
    zonas: number;
    lugares: number;
    experiencias: number;
  };
}
