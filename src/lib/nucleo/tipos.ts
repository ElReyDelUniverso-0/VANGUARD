// ============================================================
// v218.0 EL NÚCLEO — TIPOS E IDENTIFICADORES ESTABLES
// El corazón que conecta los módulos de Vanguard sin acoplarlos:
//   · 8 TIPOS DE ENTIDAD compartidos (país, región, acontecimiento,
//     documento, fuente, mapa, análisis, simulación).
//   · UNA FÓRMULA DE ID ESTABLE:  vg:<tipo>:<clave>  — el mismo
//     cable, el mismo país y el mismo teatro tienen SIEMPRE el
//     mismo id en búsqueda, fichas, enlaces y APIs.
//   · RELACIONES EXPLÍCITAS tipadas entre entidades.
// Puro dato y funciones puras: sin ventana, sin BD, sin React.
// Lo leen el servidor (búsqueda, fichas, APIs) y las pruebas.
// ============================================================

/** Los 9 tipos de entidad compartida del ecosistema.
 * v219: se separa NOTICIA (el cable, fuente de información) de
 * ACONTECIMIENTO (el hecho real que reúne varias noticias). */
export const TIPOS_ENTIDAD = [
  "pais",
  "region",
  "acontecimiento",
  "documento",
  "fuente",
  "mapa",
  "analisis",
  "simulacion",
  "noticia",
] as const;

export type TipoEntidad = (typeof TIPOS_ENTIDAD)[number];

/** Etiqueta humana por tipo (server + client, español de la casa). */
export const ETIQUETA_TIPO: Record<TipoEntidad, string> = {
  pais: "PAÍS",
  region: "REGIÓN / TEATRO",
  acontecimiento: "ACONTECIMIENTO",
  noticia: "NOTICIA / CABLE",
  documento: "DOCUMENTO",
  fuente: "FUENTE",
  mapa: "MAPA",
  analisis: "ANÁLISIS",
  simulacion: "SIMULACIÓN",
};

/** Tipos de relación explícita entre entidades. */
export const TIPOS_RELACION = [
  "pertenece_a", // acontecimiento → región (el cable pertenece al teatro)
  "implica_pais", // * → país (el cable/el teatro implica a una nación)
  "documenta", // documento → * (un expediente documenta un asunto)
  "fuente_de", // fuente → acontecimiento (quién lo publicó)
  "visible_en", // * → mapa (dónde se ve en el planeta)
  "analizado_en", // * → análisis (dónde se analiza)
  "simulado_en", // * → simulación (dónde se vive en juego)
  "modulo_de", // módulo → módulo (dependencia declarada)
] as const;

export type TipoRelacion = (typeof TIPOS_RELACION)[number];

/** Referencia mínima y estable a cualquier entidad del ecosistema. */
export interface EntidadRef {
  id: string; // vg:<tipo>:<clave> — ver idEntidad()
  tipo: TipoEntidad;
  nombre: string;
}

/** Un enlace contextual: la consecuencia navegable de una relación. */
export interface EnlaceContextual {
  etiqueta: string; // «VER EN EL MUNDO 3D ▸»
  ruta: string; // «/mundo?teatro=ukraine»
  motivo: string; // por qué conecta (transparencia)
  tipoRelacion: TipoRelacion;
}

/**
 * FÓRMULA DE ID ESTABLE — la única puerta de entrada.
 * idEntidad("pais", "ua")  → "vg:pais:ua"
 * La clave va en minúscula, sin espacios (slug o id interno ya estable).
 */
export function idEntidad(tipo: TipoEntidad, clave: string): string {
  return `vg:${tipo}:${clave.toLowerCase().trim()}`;
}

/** ¿El id tiene la forma correcta y un tipo conocido? */
export function esIdEntidad(id: string): boolean {
  const partes = id.split(":");
  if (partes.length !== 3 || partes[0] !== "vg") return false;
  return (TIPOS_ENTIDAD as readonly string[]).includes(partes[1]);
}

/** Descompone un id válido → { tipo, clave }. null si es inválido. */
export function partesDeId(id: string): { tipo: TipoEntidad; clave: string } | null {
  if (!esIdEntidad(id)) return null;
  const partes = id.split(":");
  return { tipo: partes[1] as TipoEntidad, clave: partes[2] };
}

/** Normalización de la casa (v47): minúsculas sin acentos para buscar. */
export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
