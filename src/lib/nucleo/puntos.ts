// ============================================================
// v225.0 EL FRENTE — LOS PUNTOS COMO ENTIDADES (vg:punto:<clave>)
// Cada ciudad con estado de las salas de guerra OSINT (v129,
// proyectadas por v220) se vuelve una ENTIDAD del núcleo con
// ficha propia. Leyes que cumple:
//   · CERO coordenadas inventadas: el catálogo no declara ni una
//     lat/lng — solo PROYECTA geografiaDeTeatro (que a su vez solo
//     proyecta las salas de la casa, con su fuente citada).
//   · CLAVE ESTABLE: vg:punto:<slug-del-nombre>, derivada con la
//     normalización de la casa; si dos teatros compartieran nombre
//     de ciudad, la clave lleva el teatro (desambiguación
//     determinista, orden estable del catálogo TEATROS).
//   · Lo que no existe no se finge: puntoPorClave() devuelve null
//     honesto para claves desconocidas.
// Puro y sin BD: lo consumen relaciones.ts (fichas) y busqueda.ts.
// ============================================================

import { TEATROS } from "@/lib/teatros";
import { geografiaDeTeatro, type PuntoFrente } from "./geografia";
import { normalizar } from "./tipos";

/** «Gaza (ciudad)» → gaza-ciudad · «Uagadugú» → uagadugu (estable). */
export function slugPunto(nombre: string): string {
  return normalizar(nombre)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Un punto del frente como entidad del núcleo. */
export interface PuntoNucleo extends PuntoFrente {
  /** El teatro del núcleo al que pertenece (ukraine, gaza…). */
  teatro: string;
  /** Nombre del teatro (etiqueta humana). */
  teatroNombre: string;
  /** La clave estable de vg:punto:<clave>. */
  clave: string;
  /** La sala de guerra que lo documenta (si existe). */
  salaGuerra: string | null;
  /** La fuente OSINT citada de esa sala (no copiada: citada). */
  fuenteDatos: string | null;
}

let catalogo: PuntoNucleo[] | null = null;

/**
 * TODOS los frentes documentados de la casa, una vez (cache del
 * módulo: el catálogo es estático). Orden estable: el del catálogo
 * de teatros y el de la sala de cada uno.
 */
export function puntosDelNucleo(): PuntoNucleo[] {
  if (catalogo) return catalogo;

  // 1.ª pasada: contar nombres repetidos ENTRE teatros (hoy no hay
  // ninguno; si un día aparece, la desambiguación ya está lista).
  const conteo = new Map<string, number>();
  const brutas: { teatro: string; teatroNombre: string; punto: PuntoFrente; salaGuerra: string | null; fuenteDatos: string | null }[] = [];
  for (const slug of Object.keys(TEATROS)) {
    const geo = geografiaDeTeatro(slug);
    for (const punto of geo.puntos) {
      const base = slugPunto(punto.nombre);
      conteo.set(base, (conteo.get(base) ?? 0) + 1);
      brutas.push({
        teatro: slug,
        teatroNombre: TEATROS[slug].nombre,
        punto,
        salaGuerra: geo.salaGuerra,
        fuenteDatos: geo.fuenteDatos,
      });
    }
  }

  catalogo = brutas.map((b) => {
    const base = slugPunto(b.punto.nombre);
    return {
      ...b.punto,
      teatro: b.teatro,
      teatroNombre: b.teatroNombre,
      clave: (conteo.get(base) ?? 0) > 1 ? `${base}-${b.teatro}` : base,
      salaGuerra: b.salaGuerra,
      fuenteDatos: b.fuenteDatos,
    };
  });
  return catalogo;
}

/** El punto con esa clave estable (null honesto si no existe). */
export function puntoPorClave(clave: string): PuntoNucleo | null {
  return puntosDelNucleo().find((p) => p.clave === clave) ?? null;
}

/** El id estable del punto (fórmula única del núcleo). */
export function idPunto(clave: string): string {
  return `vg:punto:${clave}`;
}
