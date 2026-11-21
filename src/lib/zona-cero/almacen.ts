// ═══════════════════════════════════════════════════════════════════════════
// v434.2 · ZONA CERO — el almacén de la mesa (vive en tu aparato)
//
// Las órdenes, las señales, las capturas y la clave de tu proveedor se quedan
// en `localStorage`: no hay base de datos de la mesa, no hay perfil, no hay
// servidor mirando. La clave solo viaja a TU proveedor cuando pulsas el botón,
// y se puede borrar de un golpe.
//
// Escritura diferida (varios cambios seguidos = una escritura), saneado al
// leer y puerta de olvido. Si el almacén está lleno o roto, la mesa sigue
// funcionando en memoria y lo dice.
// ═══════════════════════════════════════════════════════════════════════════

import { mesaVacia, sanear, type Mesa } from "./mesa";

export const CLAVE_MESA = "vg:zona-cero:mesa:v1";
export const EVENTO_MESA = "vg:zona-cero:mesa";

function hayAlmacen(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export function leerMesa(ahora = Date.now()): Mesa {
  if (!hayAlmacen()) return mesaVacia(ahora);
  try {
    const crudo = window.localStorage.getItem(CLAVE_MESA);
    if (!crudo) return mesaVacia(ahora);
    const m = sanear(JSON.parse(crudo), ahora);
    return m ?? mesaVacia(ahora);
  } catch {
    return mesaVacia(ahora);
  }
}

let pendiente: Mesa | null = null;
let temporizador: number | null = null;

/** Guarda con retardo y avisa a la pantalla (para el «guardado» honesto). */
export function guardarMesa(mesa: Mesa): void {
  if (!hayAlmacen()) return;
  pendiente = mesa;
  if (temporizador !== null) return;
  const escribir = () => {
    temporizador = null;
    const datos = pendiente;
    pendiente = null;
    if (!datos) return;
    try {
      window.localStorage.setItem(CLAVE_MESA, JSON.stringify(datos));
      window.dispatchEvent(new CustomEvent(EVENTO_MESA, { detail: { ok: true, ts: datos.actualizada } }));
    } catch {
      // cuota llena: se avisa de verdad, sin fingir que se guardó
      window.dispatchEvent(
        new CustomEvent(EVENTO_MESA, {
          detail: { ok: false, error: "El almacén del navegador está lleno: borra capturas o exporta la mesa." },
        })
      );
    }
  };
  temporizador =
    typeof window.requestIdleCallback === "function"
      ? (window.requestIdleCallback(escribir, { timeout: 1200 }) as unknown as number)
      : window.setTimeout(escribir, 250);
}

export function olvidarMesa(): void {
  if (!hayAlmacen()) return;
  try {
    window.localStorage.removeItem(CLAVE_MESA);
    window.dispatchEvent(new CustomEvent(EVENTO_MESA, { detail: { ok: true, ts: Date.now() } }));
  } catch {
    /* nada que borrar */
  }
}

/** ¿Cuánto ocupa la mesa en el aparato? (para poder decir la verdad) */
export function pesoMesa(): { bytes: number; kb: number; pct: number } {
  if (!hayAlmacen()) return { bytes: 0, kb: 0, pct: 0 };
  try {
    const crudo = window.localStorage.getItem(CLAVE_MESA) ?? "";
    const bytes = new Blob([crudo]).size;
    // los navegadores dan ~5 MB por origen; se dice como aproximación
    return { bytes, kb: Math.round(bytes / 1024), pct: Math.min(100, Math.round((bytes / (5 * 1024 * 1024)) * 100)) };
  } catch {
    return { bytes: 0, kb: 0, pct: 0 };
  }
}

/** Descarga un texto como archivo (exportar la mesa). */
export function descargar(nombre: string, contenido: string, tipo = "text/markdown;charset=utf-8"): void {
  try {
    const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    /* navegador sin descargas: no se finge nada */
  }
}
