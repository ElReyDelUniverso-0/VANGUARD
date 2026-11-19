// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — los tipos
// MISIÓN 03: catálogo mundial de infraestructura civil. Cada ficha lleva
// lo que el Dueño exigió: Nombre · País y ubicación · Categoría ·
// Descripción · Fecha conocida · Características documentadas ·
// Fotografías autorizadas · Fuente de información · Estado de verificación.
//
// REGLAS DE HONESTIDAD (no se negocian):
//   · TODA entrada es una obra REAL y DOCUMENTADA en fuentes públicas.
//     Nada inventado: si un dato no está documentado, su campo queda vacío
//     o se dice «sin dato documentado» (fecha null).
//   · Fotografías: la casa no carga imágenes externas (ley de la casa).
//     `fotos` solo se llena con fotografías autorizadas que YA existan en
//     el repo; mientras tanto, la ficha lo dice y dibuja el emblema en
//     código. Ninguna URL externa, ninguna imagen de terceros.
//   · INFORMACIÓN PÚBLICA Y APROPIADA: nada de vulnerabilidades, controles
//     de acceso ni detalles operativos sensibles. Solo hechos públicos:
//     qué es, dónde queda, cuándo se construyó (si está documentado) y
//     características técnicas que cualquier fuente pública publica.
// ═══════════════════════════════════════════════════════════════════

export const CATEGORIAS_INFRA = [
  "aeropuerto",
  "puerto",
  "ferrocarril",
  "puente",
  "tunel",
  "central-energetica",
  "presa",
  "agua",
  "educacion",
  "sanitaria",
  "edificio",
] as const;
export type CategoriaInfra = (typeof CATEGORIAS_INFRA)[number];

/** Metadatos de cada categoría: nombre, pregunta, explorador al que pertenece. */
export interface MetaCategoria {
  id: CategoriaInfra;
  nombre: string;
  pregunta: string;
  explorador: "transporte" | "energia" | "arquitectura";
}

export const META_CATEGORIA: Record<CategoriaInfra, MetaCategoria> = {
  aeropuerto: { id: "aeropuerto", nombre: "Aeropuertos", pregunta: "Cómo entran y salen los países del planeta.", explorador: "transporte" },
  puerto: { id: "puerto", nombre: "Puertos", pregunta: "Los nudos del comercio marítimo mundial.", explorador: "transporte" },
  ferrocarril: { id: "ferrocarril", nombre: "Ferrocarril y transporte ferroviario", pregunta: "Las líneas y estaciones que unen continentes.", explorador: "transporte" },
  puente: { id: "puente", nombre: "Puentes", pregunta: "Las obras que unen orillas.", explorador: "transporte" },
  tunel: { id: "tunel", nombre: "Túneles", pregunta: "Las obras que atraviesan la montaña y el agua.", explorador: "transporte" },
  "central-energetica": { id: "central-energetica", nombre: "Centrales energéticas", pregunta: "Cómo produce la energía civil el planeta.", explorador: "energia" },
  presa: { id: "presa", nombre: "Presas y embalses", pregunta: "Las obras que guardan el agua y la energía.", explorador: "energia" },
  agua: { id: "agua", nombre: "Infraestructura de agua", pregunta: "Los sistemas que llevan agua a las ciudades.", explorador: "energia" },
  educacion: { id: "educacion", pregunta: "La infraestructura de la educación.", nombre: "Educación", explorador: "arquitectura" },
  sanitaria: { id: "sanitaria", nombre: "Infraestructura sanitaria", pregunta: "Los hospitales y sistemas de salud documentados.", explorador: "arquitectura" },
  edificio: { id: "edificio", nombre: "Edificios y obras emblemáticas", pregunta: "Las obras de arquitectura e ingeniería más conocidas.", explorador: "arquitectura" },
};

/** Una característica documentada (la clave permite comparar fichas). */
export interface Caracteristica {
  clave: string;
  valor: string;
}

export interface FuenteInfo {
  nombre: string;
  url: string;
  licencia?: string;
}

export type EstadoVerificacion = "documentado" | "confirmado" | "por verificar";

export interface Infraestructura {
  /** slug único, estable: «aeropuerto-hartsfield-jackson» */
  id: string;
  nombre: string;
  categoria: CategoriaInfra;
  /** ISO-2 del país (validado contra geo-paises) */
  pais: string;
  /** país y ubicación */
  ubicacion: {
    ciudad: string;
    lat: number;
    lng: number;
  };
  descripcion: string;
  /** fecha conocida (texto: «1937», «1889», «80 d. C.», «2019–2024»); null si no está documentada */
  fecha: string | null;
  /** características documentadas */
  caracteristicas: Caracteristica[];
  /** fotografías autorizadas que existen en la casa; vacío = no hay */
  fotos: string[];
  fuente: FuenteInfo;
  verificacion: EstadoVerificacion;
  /** «gran obra»: la tabla de las obras icónicas del catálogo */
  granObra?: boolean;
}

/**
 * Constructor compacto del catálogo. El orden de los campos es fijo para
 * que todas las tandas de datos se escriban igual y las pruebas puedan
 * comprobar que NADA falta.
 */
export function e(
  id: string,
  nombre: string,
  categoria: CategoriaInfra,
  pais: string,
  ubicacion: { ciudad: string; lat: number; lng: number },
  descripcion: string,
  fecha: string | null,
  caracteristicas: Caracteristica[],
  fuente: FuenteInfo,
  verificacion: EstadoVerificacion = "documentado",
  fotos: string[] = [],
  granObra = false
): Infraestructura {
  return { id, nombre, categoria, pais, ubicacion, descripcion, fecha, caracteristicas, fotos, fuente, verificacion, granObra };
}
