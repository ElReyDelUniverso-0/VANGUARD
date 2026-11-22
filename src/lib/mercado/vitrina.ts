// ═══════════════════════════════════════════════════════════════════
// v440.3 · LA VITRINA DE LOS MÓDULOS — el mercado enseña la casa, no se
// enseña a sí mismo
//
// El Dueño, textual: «el mercado necesita actualizarse, que verdaderamente
// literalmente módulos de Vanguard para que las personas los vean con una
// descripción y que vayan rotando infinitamente para que los vean y una
// música suave».
//
// Así que aquí no se inventa nada: las fichas salen de la fuente única de la
// casa —`components/portada/modulos` (los cuatro módulos y sus salas) — y cada
// ficha lleva su nombre, su descripción REAL (`txt`, la misma que usa la
// portada del módulo) y su ruta. Nada de descripciones escritas para lucirse en
// el escaparate: si la sala cambia su `txt`, el mercado cambia con ella.
//
// Este archivo es PURO (sin React, sin DOM, sin azar): se prueba en node.
// ═══════════════════════════════════════════════════════════════════

import { MODULOS, type Modulo, type Pestana } from "@/components/portada/modulos";

/** El color de cada módulo: el que ya usa la casa para su familia. */
const COLOR: Record<string, string> = {
  redaccion: "#ff5a5f",
  mundo: "#5de6f7",
  saber: "#e8c56a",
  casa: "#c4a2ff",
  estado: "#8ee9f5",
};

export function colorDeModulo(id: string): string {
  return COLOR[id] ?? "#e8c56a";
}

/** Una ficha del escaparate: una sala de la casa con lo que hace, en una línea. */
export type Ficha = {
  /** la ruta real de la sala */
  href: string;
  /** cómo se llama en la puerta del módulo */
  titulo: string;
  /** qué se hace ahí — la descripción de la casa, no una nueva */
  descripcion: string;
  /** el módulo al que pertenece */
  modulo: string;
  moduloId: string;
  color: string;
  img?: string;
  /** si la sala late en vivo */
  vivo: boolean;
};

/** El módulo, tal cual, para la fila grande del escaparate. */
export type ModuloFicha = {
  id: string;
  nombre: string;
  lema: string;
  gancho: string;
  nav: string;
  img: string;
  color: string;
  salas: number;
};

function fichaDe(m: Modulo, p: Pestana): Ficha {
  return {
    href: p.href,
    titulo: p.label,
    // el `txt` de la casa; si una pestaña no lo trae, su lema de módulo
    descripcion: (p.txt && p.txt.trim()) || m.lema,
    modulo: m.nombre,
    moduloId: m.id,
    color: colorDeModulo(m.id),
    img: p.img,
    vivo: Boolean(p.vivo),
  };
}

/** Los cuatro módulos con su cuenta real de salas. */
export const MODULOS_VITRINA: ModuloFicha[] = MODULOS.map((m) => ({
  id: m.id,
  nombre: m.nombre,
  lema: m.lema,
  gancho: m.gancho,
  nav: m.nav,
  img: m.img,
  color: colorDeModulo(m.id),
  salas: m.pestanas.length,
}));

/**
 * Todas las salas de la casa, sin repetir ruta, en el orden de los módulos:
 * la primera aparición de una ruta manda (así /en-vivo no sale dos veces).
 */
export const FICHAS: Ficha[] = (() => {
  const vistas = new Set<string>();
  const salida: Ficha[] = [];
  for (const m of MODULOS) {
    for (const p of m.pestanas) {
      if (vistas.has(p.href)) continue;
      vistas.add(p.href);
      salida.push(fichaDe(m, p));
    }
  }
  return salida;
})();

/** Una ficha por ruta, para el buscador. */
export function fichaDeRuta(href: string): Ficha | null {
  return FICHAS.find((f) => f.href === href) ?? null;
}

/**
 * La cinta: las fichas repartidas en filas del mismo tamaño, para que cada
 * fila corra a su aire (unas hacia la izquierda, otras hacia la derecha) y el
 * ojo no se aburra. Reparte en orden, no al azar: la casa es determinista.
 */
export function filas(cuantas: number, fichas: Ficha[] = FICHAS): Ficha[][] {
  const n = Math.max(1, Math.trunc(cuantas));
  const salida: Ficha[][] = Array.from({ length: n }, () => []);
  fichas.forEach((f, i) => salida[i % n].push(f));
  return salida.filter((f) => f.length > 0);
}

/** Las cifras del escaparate, derivadas — nunca escritas a mano. */
export function cifrasVitrina() {
  return {
    modulos: MODULOS_VITRINA.length,
    salas: FICHAS.length,
    rutas: new Set(FICHAS.map((f) => f.href)).size,
    vivas: FICHAS.filter((f) => f.vivo).length,
    conFoto: FICHAS.filter((f) => Boolean(f.img)).length,
  };
}

/** Corta una descripción larga sin partir palabras: la ficha es un cartel. */
export function recortar(texto: string, max = 118): string {
  const t = (texto || "").trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max);
  const espacio = corte.lastIndexOf(" ");
  return `${(espacio > 40 ? corte.slice(0, espacio) : corte).trimEnd()}…`;
}
