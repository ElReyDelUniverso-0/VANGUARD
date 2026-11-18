// ============================================================
// v407.0 · EL CONTRATO — una sola forma de responder (y de fallar)
//
// EL PROBLEMA REAL: la casa tiene 100 endpoints y cada uno inventa su envoltorio
// (`{ok:false,error}`, `{error}`, `{items}`, texto plano…). Eso no rompe la web,
// pero hace imposible escribir un cliente, un diagnóstico o una prueba que valga
// para todos. Este módulo NO cambia ningún endpoint existente: fija el contrato
// hacia delante y da las piezas para cumplirlo.
//
// FORMA ÚNICA (todas las respuestas nuevas):
//   {
//     ok: true,
//     api: "1",                     ← versión de la INTERFAZ, no del producto
//     version: "v407.0",            ← versión del producto que responde
//     datos: <lo que sea>,
//     meta: { ts, ms, instancia, cache? }
//   }
//   { ok:false, api:"1", version, error:{ codigo, mensaje, detalle? }, meta:{…} }
//
// REGLAS:
//   · Los códigos de error son un vocabulario cerrado (6). Un cliente puede
//     programar contra ellos; un texto libre no.
//   · Nunca se devuelve un stack ni una consulta SQL: el detalle es un objeto
//     plano y corto (se filtra en `limpiarDetalle`).
//   · La versión de interfaz sube SOLO si cambia la forma; los campos nuevos se
//     añaden sin subirla (compatible hacia atrás).
// ============================================================

import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/version";
import { anotar } from "@/lib/sistema/actividad";

/** Versión de la INTERFAZ pública (no del producto). */
export const API_VERSION = "1";

/** Vocabulario cerrado de errores. Si no está aquí, es un fallo interno. */
export const CODIGOS_ERROR = [
  "VALIDACION",
  "NO_ENCONTRADO",
  "MURO",
  "PERMISO",
  "PROVEEDOR",
  "INTERNO",
] as const;

export type CodigoError = (typeof CODIGOS_ERROR)[number];

const ESTADO_HTTP: Record<CodigoError, number> = {
  VALIDACION: 400,
  NO_ENCONTRADO: 404,
  MURO: 429,
  PERMISO: 403,
  PROVEEDOR: 502,
  INTERNO: 500,
};

/** Error de la casa: código cerrado + mensaje para humanos + detalle corto. */
export class ErrorVanguard extends Error {
  codigo: CodigoError;
  detalle?: Record<string, unknown>;
  constructor(codigo: CodigoError, mensaje: string, detalle?: Record<string, unknown>) {
    super(mensaje);
    this.name = "ErrorVanguard";
    this.codigo = codigo;
    this.detalle = detalle;
  }
}

/** Identificador de la instancia que responde (para leer logs de Vercel). */
export const INSTANCIA = Math.random().toString(36).slice(2, 8);

export interface MetaRespuesta {
  /** ISO-8601 del servidor */
  ts: string;
  /** milisegundos que tardó la petición */
  ms: number;
  /** qué instancia contestó (los contenedores son efímeros) */
  instancia: string;
  /** estado de la caché en memoria, cuando la petición la ha usado */
  cache?: { hits: number; fallos: number; claves: number };
  /** aviso legible sobre los límites de esta respuesta */
  nota?: string;
}

/** Un detalle NUNCA lleva objetos anidados profundos ni cadenas largas. */
export function limpiarDetalle(detalle: unknown): Record<string, unknown> | undefined {
  if (!detalle || typeof detalle !== "object") return undefined;
  const salida: Record<string, unknown> = {};
  let n = 0;
  for (const [k, v] of Object.entries(detalle as Record<string, unknown>)) {
    if (n++ >= 12) break;
    if (typeof v === "string") salida[k] = v.slice(0, 200);
    else if (typeof v === "number" || typeof v === "boolean" || v === null) salida[k] = v;
    else if (Array.isArray(v)) salida[k] = v.slice(0, 8).map((x) => (typeof x === "string" ? x.slice(0, 80) : typeof x));
    else salida[k] = typeof v;
  }
  return salida;
}

function metaBase(t0: number, extra?: Partial<MetaRespuesta>): MetaRespuesta {
  return {
    ts: new Date().toISOString(),
    ms: Date.now() - t0,
    instancia: INSTANCIA,
    ...extra,
  };
}

/** Respuesta correcta. `datos` es lo único que el cliente necesita. */
export function ok<T>(
  datos: T,
  opciones: { t0?: number; cache?: MetaRespuesta["cache"]; nota?: string; cabeceras?: Record<string, string> } = {}
) {
  return NextResponse.json(
    {
      ok: true,
      api: API_VERSION,
      version: APP_VERSION,
      datos,
      meta: metaBase(opciones.t0 ?? Date.now(), { cache: opciones.cache, nota: opciones.nota }),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store", ...(opciones.cabeceras ?? {}) },
    }
  );
}

/** Respuesta de error: mismo envoltorio, código cerrado, sin stack. */
export function fallo(
  codigo: CodigoError,
  mensaje: string,
  detalle?: Record<string, unknown>,
  opciones: { t0?: number; cabeceras?: Record<string, string> } = {}
) {
  return NextResponse.json(
    {
      ok: false,
      api: API_VERSION,
      version: APP_VERSION,
      error: { codigo, mensaje, detalle: limpiarDetalle(detalle) },
      meta: metaBase(opciones.t0 ?? Date.now()),
    },
    {
      status: ESTADO_HTTP[codigo],
      headers: { "Cache-Control": "no-store", ...(opciones.cabeceras ?? {}) },
    }
  );
}

/**
 * Envuelve un handler: cronometra, anota en el registro de actividad y traduce
 * cualquier excepción al contrato. Un handler nuevo no debería necesitar nada más.
 */
export function conManejo(
  nombre: string,
  fn: (req: Request, t0: number) => Promise<NextResponse>
): (req: Request) => Promise<NextResponse> {
  return async (req: Request) => {
    const t0 = Date.now();
    try {
      const r = await fn(req, t0);
      anotar("info", "api.ok", { endpoint: nombre, ms: Date.now() - t0, estado: r.status });
      return r;
    } catch (e) {
      const ms = Date.now() - t0;
      if (e instanceof ErrorVanguard) {
        anotar("aviso", "api.error", { endpoint: nombre, ms, codigo: e.codigo });
        return fallo(e.codigo, e.message, e.detalle, { t0 });
      }
      // Lo inesperado se registra con nombre y mensaje, jamás con stack al cliente.
      const mensaje = e instanceof Error ? e.message : String(e);
      anotar("error", "api.excepcion", { endpoint: nombre, ms, mensaje: mensaje.slice(0, 160) });
      return fallo("INTERNO", "La casa no pudo completar la petición.", { endpoint: nombre }, { t0 });
    }
  };
}

/** Cabecera para lo que sí se puede cachear (por defecto la casa no cachea). */
export function cacheable(segundos: number): Record<string, string> {
  const s = Math.max(0, Math.min(3600, Math.floor(segundos)));
  return { "Cache-Control": `public, max-age=0, s-maxage=${s}, stale-while-revalidate=${s}` };
}

/** ── VALIDACIÓN ────────────────────────────────────────────────
 *  Los endpoints validan ANTES de tocar la BD. Todo lo que entra por la URL o
 *  por el cuerpo pasa por aquí: si no cumple, sale un 400 con código cerrado y
 *  nombre de campo (nunca un 500 a mitad del trabajo).
 */
export const validar = {
  texto(crudo: unknown, campo: string, opciones: { max: number; min?: number; requerido?: boolean } = { max: 200 }) {
    const v = typeof crudo === "string" ? crudo.trim() : "";
    const min = opciones.min ?? 0;
    if (!v) {
      if (opciones.requerido) throw new ErrorVanguard("VALIDACION", `Falta «${campo}».`, { campo });
      return "";
    }
    if (v.length < min) throw new ErrorVanguard("VALIDACION", `«${campo}» necesita al menos ${min} caracteres.`, { campo });
    return v.slice(0, opciones.max);
  },

  entero(crudo: unknown, campo: string, opciones: { min: number; max: number; porDefecto: number }) {
    if (crudo === null || crudo === undefined || crudo === "") return opciones.porDefecto;
    const n = Number(crudo);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      throw new ErrorVanguard("VALIDACION", `«${campo}» debe ser un número entero.`, { campo });
    }
    if (n < opciones.min || n > opciones.max) {
      throw new ErrorVanguard("VALIDACION", `«${campo}» debe estar entre ${opciones.min} y ${opciones.max}.`, { campo });
    }
    return n;
  },

  unoDe<T extends string>(crudo: unknown, campo: string, permitidos: readonly T[], porDefecto: T | null = null): T | null {
    const v = typeof crudo === "string" ? crudo.trim() : "";
    if (!v) return porDefecto;
    if (!(permitidos as readonly string[]).includes(v)) {
      throw new ErrorVanguard("VALIDACION", `«${campo}» no es un valor admitido.`, { campo, validos: [...permitidos] });
    }
    return v as T;
  },

  iso2(crudo: unknown, campo = "iso"): string {
    const v = typeof crudo === "string" ? crudo.trim().toLowerCase() : "";
    if (!/^[a-z]{2}$/.test(v)) {
      throw new ErrorVanguard("VALIDACION", `«${campo}» debe ser un código ISO-3166-1 alfa-2 (dos letras).`, { campo });
    }
    return v;
  },
};
