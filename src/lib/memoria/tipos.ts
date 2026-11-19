// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — el modelo del archivo documental
//
// Un documento del archivo NO es una ficha inventada: es un registro de una
// fuente externa (Library of Congress, Internet Archive o Wikimedia Commons)
// con su identificador, su fecha, su autor si lo declara y —lo que manda—
// su estado de derechos. Todo lo que el archivo enseña viene de ahí; lo que
// la fuente no publica se escribe «sin dato» y nunca se rellena.
//
// Nada de este módulo se calcula por el visitante en el servidor de la casa:
// se consultan las fuentes y se normaliza su respuesta.
// ═══════════════════════════════════════════════════════════════════

export const FUENTES = ["loc", "ia", "commons"] as const;
export type FuenteId = (typeof FUENTES)[number];

/** Qué clase de documento es. El tipo lo declara la fuente; si no lo dice, es `otro`. */
export const TIPOS = [
  "documento",
  "fotografia",
  "mapa",
  "discurso",
  "publicacion",
  "audio",
  "otro",
] as const;
export type TipoDocumento = (typeof TIPOS)[number];

/** Estado de derechos. Es la bisagra del archivo: decide si se puede ver la imagen. */
export const DERECHOS = [
  "dominio-publico",
  "licencia-abierta",
  "sin-restricciones-conocidas",
  "uso-condicionado",
  "sin-declarar",
] as const;
export type EstadoDerechos = (typeof DERECHOS)[number];

export interface Documento {
  /** fuente de la que sale el registro */
  fuente: FuenteId;
  /** identificador estable dentro de la fuente */
  id: string;
  /** clave del archivo: `fuente:id` (la usan las rutas y las referencias cruzadas) */
  clave: string;
  titulo: string;
  /** autor o institución que la fuente declara. null = no lo publica */
  autor: string | null;
  /** fecha tal como la publica la fuente (`1776-07-04`, `1863`, `1944-06-07`…) */
  fecha: string | null;
  /** año numérico, solo si la fecha lo permite leer sin adivinar */
  anio: number | null;
  tipo: TipoDocumento;
  derechos: EstadoDerechos;
  /** texto literal de derechos que publica la fuente */
  derechosTexto: string | null;
  /** licencia legible (`Public domain`, `CC BY-SA 3.0`, `CC0`…) */
  licencia: string | null;
  descripcion: string | null;
  /** imagen que el archivo puede mostrar; null si los derechos no lo permiten */
  imagen: string | null;
  /** enlace canónico al registro original */
  urlOriginal: string;
  /** institución que custodia el original, si la fuente lo dice */
  institucion: string | null;
}

export interface PaginaDocumento {
  numero: number;
  imagen: string;
  ancho: number | null;
  alto: number | null;
}

export interface FichaDocumento extends Documento {
  paginas: PaginaDocumento[];
  /** notas de la fuente (alcance, serie, repositorio…) */
  notas: string[];
  /** sujetos o materias declarados por la fuente */
  materias: string[];
  /** ecosistema: de dónde salió el registro y con qué contrato */
  fuenteNombre: string;
  fuenteUrl: string;
  /** qué no sabemos de este documento (se enseña tal cual) */
  limites: string[];
}

export interface ResultadoBusqueda<T> {
  fuente: FuenteId;
  total: number | null;
  documentos: T[];
  /** la fuente no contestó: se declara en la página en vez de fingir cero */
  error: string | null;
}

export const CLAVE_TIPO: Record<TipoDocumento, string> = {
  documento: "Documento",
  fotografia: "Fotografía",
  mapa: "Mapa",
  discurso: "Discurso o declaración",
  publicacion: "Publicación",
  audio: "Audio",
  otro: "Otro",
};

/** `fuente:id` — la forma canónica de citar un documento del archivo. */
export function claveDocumento(fuente: FuenteId, id: string): string {
  return `${fuente}:${id}`;
}

/** Lee un año de una fecha publicada sin inventarlo: `1944-06-07`, `1863`, `[1905]`. */
export function anioDeFecha(fecha: string | null): number | null {
  if (!fecha) return null;
  const m = fecha.match(/(\d{4})/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 1 || n > 2100) return null;
  return n;
}

/** Fecha legible en español, sin inventar el día que la fuente no da. */
export function fechaLegible(fecha: string | null): string {
  if (!fecha) return "sin fecha en la fuente";
  const iso = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, a, m, d] = iso;
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const mes = meses[Number(m) - 1];
    if (mes) return `${Number(d)} de ${mes} de ${a}`;
  }
  const anoMes = fecha.match(/^(\d{4})-(\d{2})$/);
  if (anoMes) {
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const mes = meses[Number(anoMes[2]) - 1];
    if (mes) return `${mes} de ${anoMes[1]}`;
  }
  if (/^\d{4}$/.test(fecha)) return fecha;
  return fecha;
}
