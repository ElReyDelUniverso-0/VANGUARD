// ============================================================
// v407.0 · EL SISTEMA DE EXTENSIONES — cómo se añade un módulo sin tocar el centro
//
// La casa crece a mano: alguien edita `registro.ts`, añade una ruta, un enlace y
// una prueba. Eso funciona y no se cambia. Lo que faltaba es el CONTRATO que
// permite que ese crecimiento sea revisable: un descriptor que dice qué añade la
// extensión, dónde se engancha y de qué depende, y un validador que lo rechaza
// si miente.
//
// HONESTIDAD SOBRE LO QUE ESTO ES Y NO ES:
//   ✅ Es un registro declarativo validado: censo, enlaces, búsqueda, datos,
//      permisos y diagnóstico son PUNTOS DE EXTENSIÓN con reglas comprobables.
//   ❌ No es un cargador de plugins en tiempo de ejecución: el código de una
//      extensión se despliega con la casa (Next compila), no se sube en caliente.
//      Un `eval` de código ajeno sería un agujero de seguridad, y aquí no hay.
// ============================================================

import type { ModuloNucleo } from "@/lib/nucleo/registro";
import { MODULOS_NUCLEO } from "@/lib/nucleo/registro";
import { FUENTES_PUBLICAS, FUENTES_PRIVADAS } from "@/lib/nucleo/fuentes";
import { ErrorVanguard } from "@/lib/sistema/contrato";

/** Los seis sitios donde una extensión puede engancharse. */
export const PUNTOS_EXTENSION = [
  "censo", // registra módulos en MODULOS_NUCLEO
  "enlaces", // añade chips y relaciones entre entidades
  "busqueda", // publica un proveedor de búsqueda (fuente pública)
  "datos", // declara modelos y fuentes en el catálogo de datos
  "permisos", // declara el nivel que exige cada módulo
  "diagnostico", // aporta comprobaciones propias
] as const;

export type PuntoExtension = (typeof PUNTOS_EXTENSION)[number];

export interface ExtensionNucleo {
  /** ext:<slug> — estable, jamás se recicla */
  id: string;
  nombre: string;
  /** versión de la extensión (no la de la casa) */
  version: string;
  autor: string;
  descripcion: string;
  /** el módulo que añade al censo; su ruta debe existir en src/app */
  modulo: ModuloNucleo;
  puntos: PuntoExtension[];
  /** de qué vive: mod: y fnt: que YA existen */
  requiere: string[];
  /** qué prueba la cubre (nombre del caso en scripts/pruebas-*.mjs) */
  prueba: string;
}

export interface ResultadoValidacion {
  valida: boolean;
  errores: string[];
  avisos: string[];
}

const VERSION_SEMVER = /^\d+\.\d+\.\d+$/;
const ID_EXT = /^ext:[a-z0-9][a-z0-9-]{1,40}$/;

/**
 * Valida un descriptor contra la casa REAL: ids, dependencias, puntos y la
 * forma del módulo. Lo que no cumple no se instala — y se dice por qué.
 */
export function validarExtension(crudo: unknown): ResultadoValidacion {
  const errores: string[] = [];
  const avisos: string[] = [];
  const e = crudo as Partial<ExtensionNucleo>;

  if (!e || typeof e !== "object") return { valida: false, errores: ["el descriptor no es un objeto"], avisos };

  if (!e.id || !ID_EXT.test(String(e.id))) errores.push("id inválido: debe ser ext:<slug> en minúsculas");
  if (!e.nombre || String(e.nombre).length < 2) errores.push("falta el nombre");
  if (!e.version || !VERSION_SEMVER.test(String(e.version))) errores.push("version inválida: usa semver X.Y.Z");
  if (!e.autor) errores.push("falta el autor (quién responde de esto)");
  if (!e.descripcion || String(e.descripcion).length < 20) errores.push("la descripción debe contar qué hace de verdad");
  if (!e.prueba) errores.push("falta la prueba: una extensión sin caso de prueba no entra");

  const puntos = Array.isArray(e.puntos) ? e.puntos : [];
  if (puntos.length === 0) errores.push("no declara ningún punto de extensión");
  for (const p of puntos) {
    if (!(PUNTOS_EXTENSION as readonly string[]).includes(String(p))) errores.push(`punto desconocido: ${String(p)}`);
  }

  for (const d of e.requiere ?? []) {
    const ok =
      (d.startsWith("mod:") && MODULOS_NUCLEO.some((m) => m.id === d)) ||
      (d.startsWith("fnt:") &&
        [...FUENTES_PUBLICAS, ...FUENTES_PRIVADAS].some((f) => f.id === d));
    if (!ok) errores.push(`dependencia inexistente: ${d}`);
  }

  const m = e.modulo;
  if (!m || typeof m !== "object") {
    errores.push("no trae módulo para el censo");
  } else {
    if (!m.id?.startsWith("mod:")) errores.push("el módulo debe tener id mod:<slug>");
    if (!m.ruta?.startsWith("/")) errores.push("la ruta del módulo debe empezar por /");
    if (!m.dependencias?.every((x) => typeof x === "string")) errores.push("dependencias del módulo mal formadas");
    if (m.estado === "VIVO" && !m.descripcion) errores.push("un módulo VIVO sin descripción no entra");
    if (MODULOS_NUCLEO.some((x) => x.id === m.id)) errores.push(`el id ${m.id} ya está en el censo`);
    if (m.permiso === "dueno") avisos.push("un módulo de extensión con permiso «dueno»: revísalo a mano");
  }

  return { valida: errores.length === 0, errores, avisos };
}

/**
 * Las extensiones que la casa trae instaladas. Vacío A PROPÓSITO: hoy el
 * crecimiento es manual y no hay ninguna extensión externa validada. La lista
 * existe para que la primera se registre aquí y quede con su prueba al lado.
 */
export const EXTENSIONES_NUCLEO: ExtensionNucleo[] = [];

/** Instala (valida y devuelve) o revienta con el error del contrato. */
export function instalarExtension(descriptor: unknown): ExtensionNucleo {
  const r = validarExtension(descriptor);
  if (!r.valida) {
    throw new ErrorVanguard("VALIDACION", "La extensión no cumple el contrato de la casa.", {
      errores: r.errores,
    });
  }
  const ext = descriptor as ExtensionNucleo;
  if (EXTENSIONES_NUCLEO.some((x) => x.id === ext.id)) {
    throw new ErrorVanguard("VALIDACION", "Esa extensión ya está instalada.", { id: ext.id });
  }
  EXTENSIONES_NUCLEO.push(ext);
  return ext;
}

/** Estado para /sistema y /api/sistema/extensiones. */
export function estadoExtensiones() {
  return {
    puntos: [...PUNTOS_EXTENSION],
    instaladas: EXTENSIONES_NUCLEO.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      version: e.version,
      puntos: e.puntos,
      prueba: e.prueba,
    })),
    total: EXTENSIONES_NUCLEO.length,
    nota:
      "Registro declarativo validado. El código de una extensión se despliega con la casa (Next lo compila); no hay carga de plugins en caliente ni eval de código ajeno.",
  };
}
