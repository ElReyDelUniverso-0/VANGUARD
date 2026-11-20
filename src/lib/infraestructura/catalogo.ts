// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — CATALOGO
// Agrupación del catálogo del Atlas: catálogo completo, consultas y
// grouping por categoría y por grupo de explorador.
// ═══════════════════════════════════════════════════════════════════

import { AEROPUERTOS } from "./datos-aeropuertos";
import { PUERTOS } from "./datos-puertos";
import { FERROCARRILES } from "./datos-ferrocarril";
import { PUENTES } from "./datos-puentes";
import { TUNELS } from "./datos-tuneles";
import { CENTRALES } from "./datos-centrales";
import { PRESAS } from "./datos-presas";
import { AGUA } from "./datos-agua";
import { EDUCACION } from "./datos-educacion";
import { SANITARIA } from "./datos-sanitaria";
import { EDIFICIOS } from "./datos-edificios";
import {
  CATEGORIAS_INFRA,
  META_CATEGORIA,
  type CategoriaInfra,
  type Infraestructura,
} from "./tipos";

export { CATEGORIAS_INFRA, META_CATEGORIA };

/** Catálogo completo del Atlas, ordenado por categoría. */
export const CATALOGO_INFRA: Infraestructura[] = [
  ...AEROPUERTOS,
  ...PUERTOS,
  ...FERROCARRILES,
  ...PUENTES,
  ...TUNELS,
  ...CENTRALES,
  ...PRESAS,
  ...AGUA,
  ...EDUCACION,
  ...SANITARIA,
  ...EDIFICIOS,
];

/** Objetos por categoría (array de catálogos). */
export const POR_CATEGORIA: Record<CategoriaInfra, Infraestructura[]> = {
  aeropuerto: AEROPUERTOS,
  puerto: PUERTOS,
  ferrocarril: FERROCARRILES,
  puente: PUENTES,
  tunel: TUNELS,
  "central-energetica": CENTRALES,
  presa: PRESAS,
  agua: AGUA,
  educacion: EDUCACION,
  sanitaria: SANITARIA,
  edificio: EDIFICIOS,
};

/**
 * v421.2 — forma plana de un identificador: sin codificación de URL, sin
 * acentos y en minúsculas. Sirve para que una URL vieja con acento
 * («central-eólica-…»), su variante percent-encoded («%C3%B3») y la forma
 * ASCII actual («central-eolica-…») lleven todas a la MISMA ficha. Medido
 * el 2026-11-20: las tres formas acentuadas del catálogo respondían 404 y
 * viajaban anunciadas en el sitemap.
 */
const plano = (s: string) => {
  let t = s;
  try {
    t = decodeURIComponent(s);
  } catch {
    /* ya venía sin codificar */
  }
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

/** Busca una obra por su identificador único (tolerante a acentos y %XX). */
export function obraPorId(id: string): Infraestructura | undefined {
  return CATALOGO_INFRA.find((o) => o.id === id) ?? CATALOGO_INFRA.find((o) => plano(o.id) === plano(id));
}

/** Número total de obras del catálogo. */
export const CANTIDAD_TOTAL = CATALOGO_INFRA.length;

/** Cifras por categoría: { categoria, meta, cantidad }. */
export function cifrasPorCategoria(): { categoria: CategoriaInfra; meta: (typeof META_CATEGORIA)[CategoriaInfra]; cantidad: number }[] {
  return CATEGORIAS_INFRA.map((categoria) => ({
    categoria,
    meta: META_CATEGORIA[categoria],
    cantidad: POR_CATEGORIA[categoria].length,
  }));
}

/** Cifras por país (solo países con al menos una obra). */
export function cifrasPorPais(): { iso2: string; cantidad: number }[] {
  const mapa = new Map<string, number>();
  for (const obra of CATALOGO_INFRA) {
    mapa.set(obra.pais, (mapa.get(obra.pais) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([iso2, cantidad]) => ({ iso2, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

/** ¿La obra existe? (para redirección segura en páginas dinámicas) */
export function existeObra(id: string): boolean {
  return obraPorId(id) !== undefined;
}

/** Obras del catálogo de un país (ISO-2), ordenadas por nombre. */
export function obrasDePais(iso2: string): Infraestructura[] {
  return CATALOGO_INFRA.filter((o) => o.pais === iso2).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

/** Índices de verificación: cuántas están confirmadas, documentadas, etc. */
export function estadosVerificacion() {
  const conteo: Record<string, number> = { confirmado: 0, documentado: 0, "por verificar": 0 };
  for (const obra of CATALOGO_INFRA) {
    conteo[obra.verificacion] = (conteo[obra.verificacion] ?? 0) + 1;
  }
  return conteo;
}

/** Filtra el catálogo por los criterios del explorador. */
export function filtrarCatalogo(criterios: {
  categorias?: string[];
  pais?: string;
  grupo?: "transporte" | "energia" | "arquitectura" | undefined;
  texto?: string;
}): Infraestructura[] {
  const categorias = criterios.categorias?.filter((c) => c in META_CATEGORIA);
  const texto = (criterios.texto ?? "").trim().toLowerCase();
  return CATALOGO_INFRA.filter((obra) => {
    if (categorias && categorias.length > 0 && !categorias.includes(obra.categoria)) return false;
    if (criterios.pais && obra.pais !== criterios.pais) return false;
    if (criterios.grupo && META_CATEGORIA[obra.categoria].explorador !== criterios.grupo) return false;
    if (texto) {
      const en = [obra.nombre, obra.pais, obra.ubicacion.ciudad, obra.categoria, obra.descripcion]
        .join(" ")
        .toLowerCase();
      if (!en.includes(texto)) return false;
    }
    return true;
  });
}

/** Cifras generales del Atlas (para la cabecera). */
export const CIFRAS_ATLAS = {
  obras: CANTIDAD_TOTAL,
  categorias: CATEGORIAS_INFRA.length,
  paises: cifrasPorPais().length,
  confirmadas: estadosVerificacion().confirmado,
};
