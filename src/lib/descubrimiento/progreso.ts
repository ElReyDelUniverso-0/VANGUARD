// ═══════════════════════════════════════════════════════════════════════════
// v434.4 · VANGUARD DISCOVERY SYSTEM — EL PROGRESO
//
// Lo que la casa recuerda de ti para no repetirte lo que ya sabes: qué salas
// has pisado, por qué paso de qué guía vas y si prefieres que no te guíe.
//
// Vive SOLO en tu aparato (`localStorage`), como todo lo tuyo. «Modo libre» no
// es un adorno: apagado el aviso, la casa deja de explicarse y eres tú y las
// salas. Y el progreso no se pierde al salir del modo libre.
// ═══════════════════════════════════════════════════════════════════════════

import { FICHAS, PUERTAS_DE_ENTRADA, fichaDe, TOTAL_FICHAS, type Ficha } from "./fichas";

export const CLAVE = "vg:descubrimiento:v1";
export const EVENTO = "vg:descubrimiento";

export type Progreso = {
  v: 1;
  /** ruta → epoch ms de la última visita */
  visitadas: Record<string, number>;
  /** id de guía → pasos completados */
  guias: Record<string, number>;
  guiaActiva: string | null;
  /** apagado = la casa deja de explicarse (libertad total) */
  modoLibre: boolean;
  /** el aviso de sala, silenciado para siempre si el operador lo pide */
  avisosApagados: boolean;
  primeraVez: number;
  actualizado: number;
};

export function progresoVacio(ahora = 0): Progreso {
  return {
    v: 1,
    visitadas: {},
    guias: {},
    guiaActiva: null,
    modoLibre: false,
    avisosApagados: false,
    primeraVez: ahora,
    actualizado: ahora,
  };
}

function hayAlmacen(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** Sanea lo guardado: nada de un almacén manipulado puede romper la pantalla. */
export function sanear(datos: unknown, ahora = 0): Progreso {
  if (!datos || typeof datos !== "object") return progresoVacio(ahora);
  const d = datos as Partial<Progreso>;
  const visitadas: Record<string, number> = {};
  for (const [ruta, ts] of Object.entries(d.visitadas ?? {})) {
    if (typeof ruta !== "string" || !ruta.startsWith("/")) continue;
    const n = Number(ts);
    if (Number.isFinite(n) && n > 0) visitadas[ruta] = n;
  }
  const guias: Record<string, number> = {};
  for (const [id, pasos] of Object.entries(d.guias ?? {})) {
    const n = Number(pasos);
    if (typeof id === "string" && Number.isFinite(n)) guias[id] = Math.max(0, Math.min(50, Math.round(n)));
  }
  return {
    v: 1,
    visitadas,
    guias,
    guiaActiva: typeof d.guiaActiva === "string" ? d.guiaActiva : null,
    modoLibre: d.modoLibre === true,
    avisosApagados: d.avisosApagados === true,
    primeraVez: Number.isFinite(Number(d.primeraVez)) ? Number(d.primeraVez) : ahora,
    actualizado: Number.isFinite(Number(d.actualizado)) ? Number(d.actualizado) : ahora,
  };
}

export function leer(ahora = Date.now()): Progreso {
  if (!hayAlmacen()) return progresoVacio(ahora);
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    return crudo ? sanear(JSON.parse(crudo), ahora) : progresoVacio(ahora);
  } catch {
    return progresoVacio(ahora);
  }
}

export function guardar(p: Progreso, ahora = Date.now()): void {
  if (!hayAlmacen()) return;
  try {
    const datos = { ...p, actualizado: ahora };
    window.localStorage.setItem(CLAVE, JSON.stringify(datos));
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: datos }));
  } catch {
    /* almacén lleno: el progreso es un lujo, la casa sigue */
  }
}

/** Apunta que has estado en una ruta (sin duplicar ni castigar). */
export function marcarVisita(p: Progreso, ruta: string, ahora = Date.now()): Progreso {
  const limpia = (ruta || "/").split("#")[0].split("?")[0].replace(/\/+$/, "") || "/";
  if (limpia === "/") return p;
  return { ...p, visitadas: { ...p.visitadas, [limpia]: ahora }, actualizado: ahora };
}

/** Anota un paso completado (solo avanza, nunca retrocede). */
export function registrarPaso(p: Progreso, guia: string, indice: number, ahora = Date.now()): Progreso {
  const hechos = Math.max(p.guias[guia] ?? 0, indice + 1);
  return { ...p, guias: { ...p.guias, [guia]: hechos }, guiaActiva: guia, actualizado: ahora };
}

/** Cuántas fichas has pisado de las que tiene la casa. */
export function pctDescubierto(p: Progreso): number {
  const pisadas = FICHAS.filter((f) => Boolean(p.visitadas[f.href.split("#")[0].split("?")[0]])).length;
  if (TOTAL_FICHAS === 0) return 0;
  return Math.max(0, Math.min(100, Math.round((pisadas / TOTAL_FICHAS) * 100)));
}

export function fichasVisitadas(p: Progreso): number {
  return FICHAS.filter((f) => Boolean(p.visitadas[f.href.split("#")[0].split("?")[0]])).length;
}

/**
 * Qué enseñarle ahora a alguien que no sabe por dónde ir: primero las puertas
 * de entrada que no ha pisado (pocas y grandes), luego cualquier sala sin
 * visitar, priorizando las «sin prisa» (no se empieza por lo más hondo).
 */
export function recomendar(p: Progreso): Ficha | null {
  for (const href of PUERTAS_DE_ENTRADA) {
    const f = fichaDe(href);
    if (f && !p.visitadas[href]) return f;
  }
  const sinPisar = FICHAS.filter((f) => !p.visitadas[f.href.split("#")[0].split("?")[0]]);
  if (!sinPisar.length) return null;
  sinPisar.sort((a, b) => (a.nivel === b.nivel ? 0 : a.nivel === "sin prisa" ? -1 : 1));
  return sinPisar[0];
}

/** Las tres puertas siguientes, para ofrecer más de una salida. */
export function recomendarVarias(p: Progreso, cuantas = 3): Ficha[] {
  const salida: Ficha[] = [];
  const vistas = new Set<string>();
  for (const href of PUERTAS_DE_ENTRADA) {
    if (salida.length >= cuantas) break;
    const f = fichaDe(href);
    if (f && !p.visitadas[href] && !vistas.has(f.href)) {
      vistas.add(f.href);
      salida.push(f);
    }
  }
  for (const f of FICHAS) {
    if (salida.length >= cuantas) break;
    const limpia = f.href.split("#")[0].split("?")[0];
    if (p.visitadas[limpia] || vistas.has(f.href)) continue;
    vistas.add(f.href);
    salida.push(f);
  }
  return salida;
}

export function reiniciar(): Progreso {
  const p = progresoVacio(Date.now());
  guardar(p);
  return p;
}
