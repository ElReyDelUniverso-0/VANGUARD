// ═══════════════════════════════════════════════════════════════════
// v441.3 · ABANDONED WORLD — tipos del atlas de lugares abandonados
// ═══════════════════════════════════════════════════════════════════

export type CategoriaAbandono = "ciudad" | "hospital" | "ocio" | "industrial";

/** Cómo se puede conocer el lugar sin poner a nadie en riesgo ni saltarse la ley. */
export type TipoAcceso = "visita-oficial" | "desde-exterior" | "cerrado" | "transformado";

export interface FotoAbandono {
  src: string;
  w: number;
  h: number;
  autor: string;
  licencia: string;
  /** Página del archivo en Wikimedia Commons. */
  origen: string;
  titulo: string;
}

export interface HitoAbandono {
  anio: string;
  hecho: string;
}

export interface FuenteAbandono {
  titulo: string;
  url: string;
}

export interface LugarAbandonado {
  id: string;
  nombre: string;
  pais: string;
  iso2: string;
  region: string;
  categoria: CategoriaAbandono;
  lat: number;
  lon: number;
  /** Años de vida activa del lugar, p. ej. "1970–1986". */
  epoca: string;
  /** Una línea: qué fue y por qué quedó vacío. */
  resumen: string;
  historia: string[];
  razones: string[];
  cronologia: HitoAbandono[];
  /** Estado actual documentado. */
  estado: string;
  acceso: { tipo: TipoAcceso; texto: string };
  fuentes: FuenteAbandono[];
}
