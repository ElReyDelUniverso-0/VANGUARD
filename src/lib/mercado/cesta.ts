// ═══════════════════════════════════════════════════════════════════
// v438.1 · LA CESTA DE LA PLAZA — lo que te llevas apuntado
//
// En un mercado se echa a la cesta lo que quieres volver a ver. Aquí la cesta
// guarda SECCIONES (rutas reales del registro), no promesas: si una ruta deja
// de existir, `sanearCesta` la tira al leerla. Vive en el aparato del visitante
// (`vg:mercado:v1`), como el resto de las cosas suyas, y se borra con un botón.
//
// La lógica es pura a propósito (nada de `localStorage` aquí dentro): el
// componente lee y escribe, esto decide. Se prueba en node.
// ═══════════════════════════════════════════════════════════════════

import { SECCIONES, type Seccion } from "./puestos";

/** La clave del aparato. Misma convención que `vg:interfaz:v1`. */
export const CLAVE_CESTA = "vg:mercado:v1";

/** Tope honesto: una cesta de mercado no es un almacén. */
export const TOPE_CESTA = 24;

export type Cesta = { secciones: string[] };
export type EnCesta = Seccion & { puesto: string; puestoNombre: string; color: string };

export function cestaVacia(): Cesta {
  return { secciones: [] };
}

/** Solo entra lo que existe: cualquier ruta inventada o vieja se cae al leer. */
export function sanearCesta(x: unknown): Cesta {
  const crudo = Array.isArray(x)
    ? x
    : x && typeof x === "object" && Array.isArray((x as { secciones?: unknown }).secciones)
      ? ((x as { secciones: unknown[] }).secciones as unknown[])
      : [];
  const validas = new Set(SECCIONES.map((s) => s.href));
  const vistas = new Set<string>();
  const secciones: string[] = [];
  for (const h of crudo) {
    if (typeof h !== "string" || !validas.has(h) || vistas.has(h)) continue;
    vistas.add(h);
    secciones.push(h);
    if (secciones.length >= TOPE_CESTA) break;
  }
  return { secciones };
}

/** Lee la cesta guardada (texto del aparato). Nunca lanza. */
export function leerCesta(guardado: string | null | undefined): Cesta {
  if (!guardado) return cestaVacia();
  try {
    return sanearCesta(JSON.parse(guardado));
  } catch {
    return cestaVacia();
  }
}

/** El texto que se guarda en el aparato. */
export function textoCesta(c: Cesta): string {
  return JSON.stringify(sanearCesta(c));
}

export function enCesta(c: Cesta, href: string): boolean {
  return c.secciones.includes(href);
}

/** Echar o sacar una sección. Devuelve una cesta NUEVA (nada de mutar). */
export function alternarCesta(c: Cesta, href: string): Cesta {
  if (!SECCIONES.some((s) => s.href === href)) return sanearCesta(c);
  if (c.secciones.includes(href)) return { secciones: c.secciones.filter((h) => h !== href) };
  if (c.secciones.length >= TOPE_CESTA) return sanearCesta(c);
  return sanearCesta({ secciones: [...c.secciones, href] });
}

export function contarCesta(c: Cesta): number {
  return c.secciones.length;
}

/** La cesta resuelta contra el índice del mercado: nombre, puesto y color. */
export function detalleCesta(c: Cesta): EnCesta[] {
  const porRuta = new Map(SECCIONES.map((s) => [s.href, s]));
  return sanearCesta(c).secciones
    .map((h) => porRuta.get(h))
    .filter((s): s is EnCesta => Boolean(s));
}
