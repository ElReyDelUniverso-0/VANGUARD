// ═══════════════════════════════════════════════════════════════════
// v417.0 VANGUARD KNOWLEDGE — el contrato del artículo enciclopédico.
// Cada campo responde a la estructura exigida por el encargo: título,
// introducción, explicación completa, contexto histórico, datos
// relevantes, imágenes de uso permitido, fuentes, fecha de actualización
// y temas relacionados. `scripts/pruebas-enciclopedia.mjs` hace cumplir
// el contrato (ningún artículo sin fuentes, sin imagen o sin vecinos).
// ═══════════════════════════════════════════════════════════════════

export type CategoriaId =
  | "continentes"
  | "paises"
  | "geografia-fisica"
  | "geografia-humana"
  | "civilizaciones"
  | "culturas-sociedades"
  | "ciencia-tecnologia"
  | "naturaleza-biodiversidad"
  | "organizaciones-internacionales"
  | "recursos-naturales";

export interface Categoria {
  id: CategoriaId;
  nombre: string;
  /** la pregunta que la categoría ayuda a responder */
  pregunta: string;
  descripcion: string;
  color: string;
  /** puertas de la casa que ya trabajan este campo (rutas existentes) */
  puertas: { ruta: string; etiqueta: string }[];
}

export interface Seccion {
  titulo: string;
  parrafos: string[];
}

export interface Dato {
  etiqueta: string;
  valor: string;
  /** año o periodo de la cifra, o aclaración del alcance */
  nota?: string;
  /** índice (base 0) de la fuente en `fuentes` que respalda la cifra */
  fuente: number;
}

export interface Fuente {
  titulo: string;
  editor: string;
  url: string;
  tipo: "enciclopedia" | "institucional" | "educativa" | "datos" | "academica";
}

export interface ImagenArticulo {
  /** clave en imagenes.json (atribución generada desde Wikimedia Commons) */
  clave: string;
  alt: string;
  pie: string;
}

export interface Articulo {
  slug: string;
  titulo: string;
  categoria: CategoriaId;
  /** una línea: qué es y por qué importa */
  bajada: string;
  introduccion: string[];
  /** la explicación completa, en secciones */
  secciones: Seccion[];
  /** contexto histórico (cuando corresponde) */
  historia?: Seccion;
  datos: Dato[];
  cronologia?: { fecha: string; texto: string }[];
  imagenes: ImagenArticulo[];
  fuentes: Fuente[];
  /** fecha de la última revisión editorial (AAAA-MM-DD) */
  actualizado: string;
  /** artículos hermanos de la enciclopedia */
  relacionados: string[];
  /** expedientes breves de /conocimiento/tema/[id] */
  conceptos?: string[];
  /** fichas de país (iso2 en minúscula) */
  paises?: string[];
  /** bloques y organismos de /organizaciones/[clave] */
  organizaciones?: string[];
  /** civilizaciones del explorador de /conocimiento */
  civilizaciones?: string[];
  palabrasClave: string[];
}

export interface Ruta {
  id: string;
  titulo: string;
  pregunta: string;
  pasos: { slug: string; porque: string }[];
}
