"use client";

// ══════════════════════════════════════════════════════════════════════
// v367.0 EL IMÁN GLOBAL — la madriguera sale de la biblioteca y cruza
// toda la casa. Mandato del Dueño: «agrega estos tipos de navegación en
// todo Vanguard, funcióanlo todo y haz Vanguard hermosamente adictivo».
//
//   · EL PUENTE (usePuenteMadriguera) — canal de UI de UN solo disparo:
//     una sala deja un destino y la otra lo recoge al montar (initializer
//     puro, ley v335 — cero efectos). NO se persiste: es un canal, como
//     la abierta de la carta (v365). Si nadie lo recoge, se queda vacío.
//   · LOS SALTOS DEL ÁLBUM — desde una carta de LOS LÍDERES o LA
//     HISTORIA se deriven SIEMPRE de datos reales: la constitución del
//     MISMO país (match por nombre), el arma y la pieza geopolítica de
//     SU ÉPOCA (año del mando / año de la guerra — distancia mínima,
//     empate por id: misma respuesta siempre, como la biblioteca v366).
//   · LOS SALTOS AL ÁLBUM — desde una ficha de la biblioteca, el poder
//     de HOY de ese país (líder con el mismo país) o la guerra de su
//     época (guerra activa más cercana). El álbum no auto-abre cartas
//     SELLADAS — honestidad de la casa: te deja EN la familia.
//
//   Cero catálogos nuevos: todo se deriva de CONSTITUCIONES, GEOPOLÍTICA,
//   ARSENAL, ROSTROS (vía FICHAS_LIDERES) y HISTORICAL_WARS (vía
//   FICHAS_HISTORIA) — las cinco fuentes canónicas ya publicadas.
// ══════════════════════════════════════════════════════════════════════

import { CONSTITUCIONES, GEOPOLITICA, type Salto } from "@/lib/biblioteca-data";

// el tipo del salto viaja con el puente (una sola fuente de verdad: biblioteca-data)
export type { Salto };
import { ARSENAL } from "@/lib/biblioteca-armas-data";
import { FICHAS_LIDERES, FICHAS_HISTORIA, type FichaLider } from "@/lib/fichas-coleccion-data";
import { HISTORICAL_WARS } from "@/lib/game-data";

// ── EL PUENTE — canal de UI de un solo disparo (NO se persiste) ─────
// LECCIÓN DEL ARNÉS v367 (del test, no de la casa): el primer puente vivió
// en un store zustand de módulo — y el empaquetador lo DUPLICÓ en dos
// chunks (el de la biblioteca y el del álbum son gemelos cargados por
// separado): dejar() escribía en una copia y recoger() leía la otra, y el
// destino se perdía en el aire. La cura es la ley v190 de la casa: los
// canales que cruzan paneles viven en LA VENTANA — un solo `window` por
// pestaña, jamás duplicado. El buzón NO se persiste: muere con la pestaña,
// como un canal de UI debe morir. Un disparo: recoger() limpia.
export type Puente =
  | { tipo: "ficha"; kind: Salto["kind"]; id: string }
  | { tipo: "album"; familia: "lideres" | "historia" }
  | null;

interface PaquetePuente {
  destino: Exclude<Puente, null>;
  ts: number;
}

declare global {
  interface Window {
    __vgPuenteMadriguera?: PaquetePuente | null;
  }
}

// dejar: la sala de origen estampa el destino y camina
// recoger / ver: leen el paquete VIVO — y NO limpian al leer.
// LECCIÓN DEL ARNÉS v367 (segunda vuelta): el lazy de next/dynamic puede
// MONTAR el panel dos veces (el primer montaje se descarta al resolverse
// el chunk) — limpiar al leer entregaba el paquete al montaje descartado
// y el visible recibía el canal vacío. La cura: el paquete es IDEMPOTENTE
// — todos los montajes de la ventana leen el MISMO destino (el XP ya es
// idempotente de casa: estudio.leer solo paga la primera vez) — y muere
// SOLO por TTL (6 s: cubre chunks lentos; nunca cruza a un gesto viejo).
export const TTL_PUENTE_MS = 6000;

interface PaquetePuente {
  destino: Exclude<Puente, null>;
  ts: number;
}

export function dejarPuente(p: Exclude<Puente, null>): void {
  try {
    window.__vgPuenteMadriguera = { destino: p, ts: Date.now() };
  } catch { /* sin ventana no hay puente: el gesto sigue siendo honesto */ }
}

function paqueteVivo(): Puente {
  try {
    const b = window.__vgPuenteMadriguera;
    if (!b) return null;
    if (Date.now() - b.ts > TTL_PUENTE_MS) {
      window.__vgPuenteMadriguera = null; // el canal muere solo: un gesto viejo jamás aterriza
      return null;
    }
    return b.destino;
  } catch { return null; }
}

// recoger: la sala de destino levanta el paquete (sin limpiar: idempotente)
export function recogerPuente(): Puente {
  return paqueteVivo();
}

// ver: mirar sin consumir (el techo de la biblioteca decide su sala de aterrizaje)
export function verPuente(): Puente {
  return paqueteVivo();
}

// ── utilidades deterministas (el mismo espíritu de saltoMasCercano v366) ──
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

function masCercano<T extends { id: string }>(
  piezas: T[],
  año: (p: T) => number,
  objetivo: number,
): T | null {
  let mejor: T | null = null;
  let mejorD = Number.POSITIVE_INFINITY;
  for (const p of piezas) {
    const d = Math.abs(año(p) - objetivo);
    // el empate se resuelve por id: orden determinista, misma respuesta siempre
    if (d < mejorD || (d === mejorD && mejor !== null && p.id < mejor.id)) {
      mejorD = d;
      mejor = p;
    }
  }
  return mejor;
}

// el año «de época» de una guerra: el CENTRO de sus años (determinista)
function centroDeGuerra(start: number, end: number): number {
  return Math.round((start + end) / 2);
}

// ── SALTOS DESDE EL ÁLBUM → la biblioteca ────────────────────────────
// LOS LÍDERES: la constitución de SU país (match real por nombre), el
// arma y la pieza geopolítica de SU ÉPOCA (el año en que llegó al mando,
// tal como lo publica el catálogo del poder v130).
export function saltosDesdeLider(l: FichaLider): Salto[] {
  const saltos: Salto[] = [];
  // (1) la carta magna de su país — match EXACTO por nombre normalizado
  const c = CONSTITUCIONES.find((x) => norm(x.pais) === norm(l.pais));
  if (c) saltos.push({ kind: "const", id: c.id, nombre: c.nombre, año: c.año, porQue: `la carta magna vigente de ${c.pais}` });
  // (2) su época: el primer año del mando publicado por el catálogo
  const m = l.mandato.match(/\d{4}/);
  if (m) {
    const añoMando = Number(m[0]);
    const arma = masCercano(ARSENAL, (p) => p.año, añoMando);
    if (arma) saltos.push({ kind: "arma", id: arma.id, nombre: arma.nombre, año: arma.año, porQue: "el arsenal del año en que llegó al mando" });
    const geo = masCercano(GEOPOLITICA, (p) => p.año, añoMando);
    if (geo) saltos.push({ kind: "geo", id: geo.id, nombre: geo.nombre, año: geo.año, porQue: "el tablero del mundo de su mando" });
  }
  return saltos;
}

// LA HISTORIA: el arma, la pieza geopolítica y la carta de SU ÉPOCA
// (el centro publicado del conflicto — años reales del archivo v166).
export function saltosDesdeHistoria(h: { key: string; nombre: string }): Salto[] {
  const saltos: Salto[] = [];
  const w = HISTORICAL_WARS.find((x) => h.key === `hist:${x.id}`);
  if (!w) return saltos; // sin año real no hay época: cero invención
  const epoca = centroDeGuerra(w.yearStart, w.yearEnd);
  const arma = masCercano(ARSENAL, (p) => p.año, epoca);
  if (arma) saltos.push({ kind: "arma", id: arma.id, nombre: arma.nombre, año: arma.año, porQue: "el arsenal de su época" });
  const geo = masCercano(GEOPOLITICA, (p) => p.año, epoca);
  if (geo) saltos.push({ kind: "geo", id: geo.id, nombre: geo.nombre, año: geo.año, porQue: "el tablero de su época" });
  const carta = masCercano(CONSTITUCIONES, (p) => p.año, epoca);
  if (carta) saltos.push({ kind: "const", id: carta.id, nombre: carta.nombre, año: carta.año, porQue: "el mundo civil de su época" });
  return saltos;
}

// ── SALTOS DESDE LA BIBLIOTECA → el álbum ────────────────────────────
export interface SaltoAlbum {
  familia: "lideres" | "historia";
  etiqueta: string;   // el nombre visible del destino real
  porQue: string;     // el porqué REAL del salto
}

// desde una constitución: el poder de HOY de ESE país (match por nombre)
export function saltoAlAlbumDesdeConstitucion(pais: string): SaltoAlbum | null {
  const lider = FICHAS_LIDERES.find((f) => norm(f.pais) === norm(pais));
  if (!lider) return null;
  return { familia: "lideres", etiqueta: lider.nombre, porQue: `el poder de hoy de ${pais}` };
}

// desde el arsenal o la geopolítica: la guerra de SU ÉPOCA (centro real)
export function saltoAlAlbumPorEpoca(año: number): SaltoAlbum | null {
  const w = masCercano(HISTORICAL_WARS, (x) => centroDeGuerra(x.yearStart, x.yearEnd), año);
  if (!w) return null;
  const ficha = FICHAS_HISTORIA.find((f) => f.key === `hist:${w.id}`);
  if (!ficha) return null;
  return { familia: "historia", etiqueta: ficha.nombre, porQue: "la guerra de su época, en cartas" };
}
