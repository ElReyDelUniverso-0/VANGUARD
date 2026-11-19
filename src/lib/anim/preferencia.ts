// ═══════════════════════════════════════════════════════════════════
// v416.0 · LA PREFERENCIA DE ANIMACIÓN — una sola verdad para toda la casa
//
// El informe del visitante: un Galaxy A06 con Brave bajaba a ~10 FPS en una
// animación giratoria. La causa no era una animación, eran CIENTOS: la casa
// declara más de doscientas animaciones `infinite` entre CSS y estilos en
// línea, casi ninguna se pausa al salir de pantalla y ninguna pregunta al
// aparato si puede con ellas.
//
// Este archivo define tres niveles y su persistencia. No anima nada: decide.
//   · completas     la experiencia visual original, sin tocar.
//   · reducidas     se apagan las animaciones decorativas infinitas, se quita
//                   el desenfoque de fondo y se acortan las transiciones.
//   · desactivadas  se apaga toda animación decorativa; la funcionalidad, los
//                   estados y los datos quedan exactamente igual.
//
// La elección se guarda en el aparato (localStorage, clave `vg-anim`) y se
// aplica al elemento <html> como `data-vg-anim`, que es lo que lee el CSS.
// ═══════════════════════════════════════════════════════════════════

export type NivelAnimacion = "completas" | "reducidas" | "desactivadas";

/** Clave de almacenamiento. No cambia nunca: romperla borra la elección. */
export const CLAVE_ANIM = "vg-anim";
/** Evento interno para que la interfaz reaccione al cambio en la misma pestaña. */
export const EVENTO_ANIM = "vg:anim";
/** Atributo del <html> que lee el CSS. */
export const ATRIBUTO_ANIM = "data-vg-anim";
/** Marca de pestaña oculta: con ella, el CSS pausa TODA animación. */
export const ATRIBUTO_OCULTO = "data-vg-oculto";

export interface NivelInfo {
  id: NivelAnimacion;
  nombre: string;
  resumen: string;
  detalle: string;
}

export const NIVELES: NivelInfo[] = [
  {
    id: "completas",
    nombre: "Completas",
    resumen: "La experiencia original, con todos los efectos.",
    detalle:
      "Todo se mueve como siempre. Recomendado en ordenador y en teléfonos recientes. Aun así, las animaciones se pausan cuando la pestaña no se ve.",
  },
  {
    id: "reducidas",
    nombre: "Reducidas",
    resumen: "Efectos ligeros: lo decorativo se queda quieto.",
    detalle:
      "Se apagan las animaciones decorativas que no paran nunca (sellos girando, barridos, lluvias, parpadeos) y el desenfoque de fondo. Los avisos, los estados y las transiciones cortas siguen: se entiende todo igual, con la mitad del trabajo por cuadro.",
  },
  {
    id: "desactivadas",
    nombre: "Desactivadas",
    resumen: "Cero animación decorativa. Nada más.",
    detalle:
      "Ninguna animación decorativa se ejecuta y las transiciones duran un milisegundo. Los menús, los simuladores, los gráficos y los datos funcionan exactamente igual: solo dejan de moverse solos.",
  },
];

const VALIDOS: NivelAnimacion[] = ["completas", "reducidas", "desactivadas"];

/** Devuelve el nivel si es uno de los tres; null para cualquier otra cosa. */
export function normalizarNivel(valor: unknown): NivelAnimacion | null {
  return typeof valor === "string" && (VALIDOS as string[]).includes(valor)
    ? (valor as NivelAnimacion)
    : null;
}

/**
 * ¿Este aparato pide calma por su cuenta? Dos señales honestas, ninguna
 * inventada: la preferencia del sistema operativo y la memoria declarada.
 * `deviceMemory` solo existe en navegadores de Chromium (Brave entre ellos);
 * si no está, no se supone nada.
 */
export function aparatoLimitado(): boolean {
  if (typeof navigator === "undefined") return false;
  const memoria = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const nucleos = navigator.hardwareConcurrency;
  if (typeof memoria === "number" && memoria > 0 && memoria <= 4) return true;
  if (typeof nucleos === "number" && nucleos > 0 && nucleos <= 4) return true;
  return false;
}

export function sistemaPideCalma(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Nivel por defecto cuando el visitante no ha elegido nunca. */
export function nivelPorDefecto(): NivelAnimacion {
  if (sistemaPideCalma()) return "reducidas";
  if (aparatoLimitado()) return "reducidas";
  return "completas";
}

/** Nivel vigente: la elección guardada o, si no hay, el de por defecto. */
export function nivelGuardado(): NivelAnimacion | null {
  if (typeof window === "undefined") return null;
  try {
    return normalizarNivel(window.localStorage.getItem(CLAVE_ANIM));
  } catch {
    return null;
  }
}

export function nivelActual(): NivelAnimacion {
  return nivelGuardado() ?? nivelPorDefecto();
}

/** Escribe el nivel en el <html>. Es lo único que lee el CSS. */
export function aplicarNivel(nivel: NivelAnimacion): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(ATRIBUTO_ANIM, nivel);
}

/** Guarda la elección, la aplica y avisa a quien escuche. */
export function guardarNivel(nivel: NivelAnimacion): void {
  const limpio = normalizarNivel(nivel) ?? "completas";
  try {
    window.localStorage.setItem(CLAVE_ANIM, limpio);
  } catch {
    // modo privado sin almacenamiento: se aplica igual, solo no se recuerda
  }
  aplicarNivel(limpio);
  window.dispatchEvent(new CustomEvent(EVENTO_ANIM, { detail: limpio }));
}

/** Vuelve al nivel automático (borra la elección guardada). */
export function olvidarNivel(): void {
  try {
    window.localStorage.removeItem(CLAVE_ANIM);
  } catch {
    /* nada que borrar */
  }
  aplicarNivel(nivelPorDefecto());
  window.dispatchEvent(new CustomEvent(EVENTO_ANIM, { detail: nivelPorDefecto() }));
}

export function suscribirNivel(cb: (n: NivelAnimacion) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const alEvento = () => cb(nivelActual());
  const alAlmacen = (e: StorageEvent) => {
    if (e.key === CLAVE_ANIM) cb(nivelActual());
  };
  window.addEventListener(EVENTO_ANIM, alEvento as EventListener);
  window.addEventListener("storage", alAlmacen);
  return () => {
    window.removeEventListener(EVENTO_ANIM, alEvento as EventListener);
    window.removeEventListener("storage", alAlmacen);
  };
}

/**
 * Las animaciones decorativas que la casa repite sin parar y que el apagado
 * tiene que conocer para pausarlas fuera de pantalla. Se listan por clase y
 * por atributo; si una animación nueva quiere este trato, se marca con
 * `data-vg-continua` y entra sin tocar este archivo.
 */
export const SELECTOR_CONTINUAS = [
  "[data-vg-continua]",
  ".v130-sello",
  ".vg191-barrido",
  ".vg191-globo",
  ".vg191-lluvia",
  ".vg191-ventanas",
  ".vg191-estrellas",
  ".vg191-sol",
  ".vg193-radar",
  ".vg193-baliza",
  ".vg193-flotar",
  ".v110-giro-lento",
  ".casa-aire-orbe",
  ".radar-spin",
].join(",");
