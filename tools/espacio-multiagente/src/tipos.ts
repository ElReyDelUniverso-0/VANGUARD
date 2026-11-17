/** Tipos compartidos del espacio multiagente. */
export interface Fuente {
  id: string;
  url: string;
  estado: number;
  obtenidaEn: string;
  bytes: number;
  extracto: string;
  contenidoHtml: boolean;
  nota?: string;
}
export type EstadoTarea = "pendiente" | "en-curso" | "hecha" | "bloqueada";
export interface Tarea {
  id: string;
  titulo: string;
  rol: RolIdSimple;
  estado: EstadoTarea;
  creadaEn: string;
  actualizadaEn: string;
  detalle?: string;
  evidencias: string[];   // ids de hallazgos o rutas de archivos/commits reales
}
export type RolIdSimple = string; // ver roles.ts para los ids válidos
export type Confianza = "baja" | "media" | "alta";
export interface Hallazgo {
  id: string;
  tareaId: string;
  rol: RolIdSimple;
  texto: string;
  confianza: Confianza;
  fuenteIds: string[];
  creadoEn: string;
}
export interface Respuesta {
  id: string;
  preguntaId: string;
  rol: RolIdSimple;
  texto: string;
  creadoEn: string;
}
export interface Pregunta {
  id: string;
  titulo: string;
  creadaEn: string;
  respuestas: string[]; // ids de Respuesta
}
export interface EstadoEspacio {
  version: 1;
  tareas: Tarea[];
  hallazgos: Hallazgo[];
  fuentes: Fuente[];
  preguntas: Pregunta[];
  respuestas: Respuesta[];
}
