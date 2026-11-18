// ============================================================
// v407.0 · LOS PERMISOS, EN UN SOLO SITIO
//
// Hoy cada endpoint juzga como puede: unos miran la sesión a mano, otros no
// miran nada y otros confían en el cliente. El censo del Núcleo ya declara el
// permiso de cada módulo (`publico` | `cuenta` | `dueno`), pero nadie lo
// consultaba de forma central.
//
// Este módulo NO cambia ninguna autenticación existente: da UNA función que
// lee el censo y responde con una decisión booleana, y un `exigir()` que lanza
// el error del contrato. Los endpoints nuevos lo usan; los viejos siguen con su
// lógica hasta que alguien los migre a propósito (compatibilidad hacia atrás).
//
// Regla de la casa, intacta: el permiso se juzga EN EL SERVIDOR. Este módulo
// vive en `src/lib/sistema`, se importa desde rutas de servidor y **no** lleva
// "use client".
// ============================================================

import { MODULOS_NUCLEO, moduloPorId, type ModuloNucleo } from "@/lib/nucleo/registro";
import { ErrorVanguard } from "@/lib/sistema/contrato";

/** Nivel que EXIGE un módulo. */
export type NivelPermiso = "publico" | "cuenta" | "dueno";

/** Lo único que hace falta saber de la sesión para decidir. */
export interface SesionPermiso {
  /** ¿hay sesión válida? */
  autenticado: boolean;
  /** ¿es el Dueño? (un solo nivel extra, como en el censo) */
  dueno?: boolean;
}

export const SIN_SESION: SesionPermiso = { autenticado: false };

/** El permiso declarado por el censo para un módulo (o null si no existe). */
export function nivelDeModulo(id: string): NivelPermiso | null {
  const m = moduloPorId(id);
  return m ? (m.permiso as NivelPermiso) : null;
}

/** La decisión, en una línea: ¿puede esta sesión usar este módulo? */
export function puedeVer(moduloId: string, sesion: SesionPermiso = SIN_SESION): boolean {
  const nivel = nivelDeModulo(moduloId);
  if (nivel === null) return false; // lo que no está en el censo no se sirve
  if (nivel === "publico") return true;
  if (nivel === "cuenta") return sesion.autenticado;
  return sesion.dueno === true;
}

/** Igual que `puedeVer`, pero lanza el error del contrato (403 traducido). */
export function exigir(moduloId: string, sesion: SesionPermiso = SIN_SESION): void {
  const nivel = nivelDeModulo(moduloId);
  if (nivel === null) {
    throw new ErrorVanguard("NO_ENCONTRADO", "Ese módulo no está en el censo de la casa.", { moduloId });
  }
  if (!puedeVer(moduloId, sesion)) {
    throw new ErrorVanguard("PERMISO", "Este módulo necesita sesión.", {
      moduloId,
      nivel,
      comoEntrar: nivel === "dueno" ? "solo el Dueño" : "inicia sesión con tu cuenta",
    });
  }
}

/** Qué módulos ve una sesión (para un índice filtrado, sin trucos en el cliente). */
export function modulosPermitidos(
  sesion: SesionPermiso = SIN_SESION,
  filtro?: (m: ModuloNucleo) => boolean
): ModuloNucleo[] {
  return MODULOS_NUCLEO.filter((m) => puedeVer(m.id, sesion) && (filtro ? filtro(m) : true));
}

/** El reparto del censo por nivel — cifra honesta para /sistema. */
export function repartoPermisos() {
  const cuenta: Record<NivelPermiso, number> = { publico: 0, cuenta: 0, dueno: 0 };
  for (const m of MODULOS_NUCLEO) cuenta[m.permiso as NivelPermiso]++;
  return { total: MODULOS_NUCLEO.length, ...cuenta };
}
