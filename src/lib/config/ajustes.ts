// ═══════════════════════════════════════════════════════════════════
// v435.0 · EL SISTEMA DE CONFIGURACIÓN DE VANGUARD
//
// Mandato del Dueño: «añade un sistema de configuración para Vanguard».
//
// Reglas de la casa que este archivo respeta:
//   · La configuración vive EN EL APARATO (localStorage). Nada viaja a un
//     servidor, nada se finge: si no se puede guardar, la casa sigue igual.
//   · Se aplica escribiendo atributos en <html>, que es lo que ya hacía la
//     casa con `data-vg-anim`. Así el CSS manda y no hay cascadas de JS.
//   · Todo tiene vuelta: «Restablecer» deja la casa como vino.
//
// Qué se puede configurar:
//   pantalla   · auto | grande | pequena   (dos maquetas de verdad, no una
//                                            encogida: ver pantallas.css)
//   ligero     · auto | si | no            (apaga animaciones y desenfoques)
//   anim       · completas | reducidas | desactivadas  (data-vg-anim)
//   densidad   · comoda | compacta
//   letra      · normal | grande
//   fondo      · placas | llano
// ═══════════════════════════════════════════════════════════════════

export type Pantalla = "auto" | "grande" | "pequena";
export type Ligero = "auto" | "si" | "no";
export type Anim = "completas" | "reducidas" | "desactivadas";
export type Densidad = "comoda" | "compacta";
export type Letra = "normal" | "grande";
export type Fondo = "placas" | "llano";

export type Ajustes = {
  pantalla: Pantalla;
  ligero: Ligero;
  anim: Anim;
  densidad: Densidad;
  letra: Letra;
  fondo: Fondo;
};

export const POR_DEFECTO: Ajustes = {
  pantalla: "auto",
  ligero: "auto",
  anim: "completas",
  densidad: "comoda",
  letra: "normal",
  fondo: "placas",
};

/** clave propia de esta capa: no pisa las de la casa (`vg-*`, `vx421-*`) */
export const CLAVE = "vx435-config";

export function leer(): Ajustes {
  if (typeof window === "undefined") return POR_DEFECTO;
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return POR_DEFECTO;
    const d = JSON.parse(crudo) as Partial<Ajustes>;
    // cada campo se valida solo: un valor raro no rompe la casa
    return {
      pantalla: (["auto", "grande", "pequena"] as const).includes(d.pantalla as Pantalla) ? (d.pantalla as Pantalla) : POR_DEFECTO.pantalla,
      ligero: (["auto", "si", "no"] as const).includes(d.ligero as Ligero) ? (d.ligero as Ligero) : POR_DEFECTO.ligero,
      anim: (["completas", "reducidas", "desactivadas"] as const).includes(d.anim as Anim) ? (d.anim as Anim) : POR_DEFECTO.anim,
      densidad: (["comoda", "compacta"] as const).includes(d.densidad as Densidad) ? (d.densidad as Densidad) : POR_DEFECTO.densidad,
      letra: (["normal", "grande"] as const).includes(d.letra as Letra) ? (d.letra as Letra) : POR_DEFECTO.letra,
      fondo: (["placas", "llano"] as const).includes(d.fondo as Fondo) ? (d.fondo as Fondo) : POR_DEFECTO.fondo,
    };
  } catch {
    return POR_DEFECTO;
  }
}

export function guardar(a: Ajustes) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(a));
  } catch {
    /* la configuración es del aparato: si no se puede guardar, no pasa nada */
  }
}

/** ¿este aparato va justo? (memoria, núcleos o pantalla táctil pequeña) */
export function pareceLigero(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const memoria = nav.deviceMemory ?? 8;
    const nucleos = navigator.hardwareConcurrency ?? 8;
    const tactil = window.matchMedia("(hover: none)").matches;
    const pequena = window.matchMedia("(max-width: 760px)").matches;
    if (memoria <= 4) return true;
    if (nucleos <= 4) return true;
    if (tactil && pequena) return true;
    return false;
  } catch {
    return false;
  }
}

/** pinta los ajustes en <html>: aquí no hay React, solo atributos */
export function aplicar(a: Ajustes) {
  if (typeof document === "undefined") return;
  const raiz = document.documentElement;

  // pantalla: «auto» no escribe nada y deja mandar a la media query
  if (a.pantalla === "auto") raiz.removeAttribute("data-vx-pantalla");
  else raiz.setAttribute("data-vx-pantalla", a.pantalla);

  const ligero = a.ligero === "si" || (a.ligero === "auto" && pareceLigero());
  if (ligero) raiz.setAttribute("data-vx-ligero", "1");
  else raiz.removeAttribute("data-vx-ligero");

  raiz.setAttribute("data-vg-anim", a.anim);
  raiz.setAttribute("data-vx-densidad", a.densidad);
  raiz.setAttribute("data-vx-letra", a.letra);
  raiz.setAttribute("data-vx-fondo", a.fondo);
}

/** qué maqueta se está viendo ahora mismo (para enseñarlo en el panel) */
export function pantallaActual(a: Ajustes): "grande" | "pequena" {
  if (a.pantalla !== "auto") return a.pantalla;
  if (typeof window === "undefined") return "grande";
  return window.matchMedia("(max-width: 760px)").matches ? "pequena" : "grande";
}

/** el evento con el que cualquier botón abre el panel */
export const ABRIR = "vx:abrir-ajustes";

export function abrirAjustes() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ABRIR));
}
