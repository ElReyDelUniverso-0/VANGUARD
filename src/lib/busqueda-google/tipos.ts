// ============================================================
// v415.0 · VANGUARD SEARCH OPPORTUNITIES — los tipos
//
// Las cifras de este módulo salen SOLO de la API de Google Search Console
// (searchAnalytics.query). Nada se estima ni se rellena: si no hay
// credenciales, no hay filas; si una franja no tiene datos suficientes, su
// referencia es null y la regla que la usa no se dispara.
// ============================================================

/** Una fila de Search Console con dimensiones [query, page]. */
export interface FilaConsultaPagina {
  consulta: string;
  /** URL absoluta tal como la devuelve Google */
  pagina: string;
  clics: number;
  impresiones: number;
  /** 0–1, tal como la devuelve Google */
  ctr: number;
  /** posición media, tal como la devuelve Google (1 = arriba) */
  posicion: number;
}

/** Una fila con dimensión [page]: incluye las consultas anonimizadas. */
export interface FilaPagina {
  pagina: string;
  clics: number;
  impresiones: number;
  ctr: number;
  posicion: number;
}

export interface Totales {
  clics: number;
  impresiones: number;
  ctr: number;
  posicion: number;
}

/** Una página real de la casa, candidata a recibir una consulta. */
export interface PaginaCasa {
  ruta: string;
  nombre: string;
  /** módulo / categoría a la que pertenece («Planeta», «Redacción»…) */
  categoria: string;
  /** texto donde se busca (nombre, descripción, alias del censo) */
  buscar: string;
  /** ¿es una puerta importante (centro público), no una sala interna? */
  importante: boolean;
}

export const TIPOS_OPORTUNIDAD = [
  "CTR_BAJO",
  "CONTENIDO_A_MEJORAR",
  "SIN_IMPRESIONES",
  "CANIBALIZACION",
  "PAGINA_MEJOR",
  "HUECO",
] as const;
export type TipoOportunidad = (typeof TIPOS_OPORTUNIDAD)[number];

export const NOMBRE_TIPO: Record<TipoOportunidad, { nombre: string; pregunta: string }> = {
  CTR_BAJO: {
    nombre: "Muchas impresiones, pocos clics",
    pregunta: "¿Dónde aparece la casa pero casi nadie la elige?",
  },
  CONTENIDO_A_MEJORAR: {
    nombre: "Recibe clics, el contenido puede crecer",
    pregunta: "¿Qué páginas ya traen visitas pero se quedan al final de la primera página o en la segunda?",
  },
  SIN_IMPRESIONES: {
    nombre: "Página importante sin impresiones",
    pregunta: "¿Qué puertas principales no ha mostrado Google ni una vez en el periodo?",
  },
  CANIBALIZACION: {
    nombre: "Dos páginas compiten por la misma consulta",
    pregunta: "¿Qué consultas reparten sus impresiones entre varias páginas de la casa?",
  },
  PAGINA_MEJOR: {
    nombre: "La casa tiene una página más adecuada",
    pregunta: "¿Qué consultas llegan a una página genérica cuando existe una dedicada?",
  },
  HUECO: {
    nombre: "Consulta sin página que la trate",
    pregunta: "¿Qué busca la gente que la casa todavía no responde con una página propia?",
  },
};

export interface Oportunidad {
  id: string;
  tipo: TipoOportunidad;
  consulta: string | null;
  /** URL absoluta que devuelve Google (o la de la casa, para SIN_IMPRESIONES) */
  url: string | null;
  ruta: string | null;
  paginaNombre: string | null;
  categoria: string;
  impresiones: number;
  clics: number;
  /** 0–1; null cuando no hay impresiones */
  ctr: number | null;
  /** null cuando no hay impresiones: no se inventa una posición */
  posicion: number | null;
  /** CTR medio de la propia casa en la misma franja de posición (referencia) */
  referencia: { franja: string; ctr: number } | null;
  /** página real de la casa que encaja mejor con la consulta, si es otra */
  sugerida: { ruta: string; nombre: string } | null;
  detectada: string;
  accion: string;
  /** para ordenar dentro de su tipo (impresiones, o importancia) */
  peso: number;
}

export interface FranjaCtr {
  franja: string;
  desde: number;
  hasta: number;
  impresiones: number;
  clics: number;
  /** null si la franja no llega al mínimo de impresiones para ser referencia */
  ctr: number | null;
}

export interface InformeOportunidades {
  oportunidades: Oportunidad[];
  porTipo: { tipo: TipoOportunidad; nombre: string; cuantas: number }[];
  porCategoria: { categoria: string; cuantas: number; impresiones: number }[];
  franjas: FranjaCtr[];
  /** cifras de control para que el panel no prometa más de lo que tiene */
  control: {
    filasConsultaPagina: number;
    filasPagina: number;
    consultasDistintas: number;
    paginasConImpresiones: number;
    paginasImportantes: number;
    paginasImportantesSinImpresiones: number;
  };
}
