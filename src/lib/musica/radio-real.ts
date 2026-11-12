"use client";

// ============================================================
// v367.5 LA RADIO REAL EN EL VANGUARD PÚBLICO (lib/musica/radio-real.ts)
//
// Orden del Dueño: «que la música esté ya toda en el Vanguard público y se
// pongan aleatoriamente en el Vanguard».
//
// Esto es el motor que la pone: toma las trece pistas REALES del catálogo
// (dominio público y CC0, comprobadas), las baraja y las va poniendo una
// tras otra en cualquier sala de la casa, porque el chip vive en el
// reproductor global. Cuando una pista termina entra la siguiente; si un
// enlace falla, se salta sola y lo confiesa — no se queda muda fingiendo.
//
// Tres leyes que respeta:
//  ① CERO MÚSICA SIN DERECHOS. Solo entran las pistas de MUSICA_REAL, con su
//     licencia escrita en `catalogo.ts`.
//  ② CERO AUTOPLAY ENGAÑOSO. Los navegadores exigen un toque: el motor no
//     arranca solo, arranca cuando el piloto lo enciende, y recuerda que lo
//     encendió para la próxima visita.
//  ③ CERO SILENCIO DISFRAZADO. Si fallan tres enlaces seguidos, se para y
//     avisa con el motivo.
// ============================================================

import { MUSICA_REAL, type PistaReal } from "./catalogo";
import { stopMusic, isMusicPlaying } from "@/lib/conflict-music";
import { stopPreview, isPlaying as estudioSonando } from "@/lib/music-studio";

export interface EstadoRadioReal {
  activa: boolean;
  pista: PistaReal | null;
  indice: number;
  total: number;
  fallosSeguidos: number;
  aviso: string;
}

const LS = "vg367-radio-real-encendida";

let audio: HTMLAudioElement | null = null;
let cola: PistaReal[] = [];
let indice = 0;
let activa = false;
let fallosSeguidos = 0;
let aviso = "";
let oyentes = new Set<(e: EstadoRadioReal) => void>();

function estado(): EstadoRadioReal {
  return {
    activa,
    pista: cola[indice] ?? null,
    indice,
    total: MUSICA_REAL.length,
    fallosSeguidos,
    aviso,
  };
}

function avisar() {
  const e = estado();
  for (const f of oyentes) {
    try {
      f(e);
    } catch {
      /* un oyente roto no tumba la radio */
    }
  }
}

export function alCambiarRadioReal(f: (e: EstadoRadioReal) => void): () => void {
  oyentes.add(f);
  f(estado());
  return () => {
    oyentes.delete(f);
  };
}

export function estadoRadioReal(): EstadoRadioReal {
  return estado();
}

/** Baraja honesta (Fisher-Yates) sobre el catálogo real. */
function barajar(): PistaReal[] {
  const copia = [...MUSICA_REAL];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function limpiarAudio() {
  if (audio) {
    try {
      audio.pause();
      audio.src = "";
    } catch {
      /* noop */
    }
    audio = null;
  }
}

function poner(desdeIndice: number) {
  if (typeof window === "undefined") return;
  limpiarAudio();
  if (cola.length === 0) cola = barajar();
  indice = desdeIndice % cola.length;
  const pista = cola[indice];
  if (!pista) return;
  const a = new Audio(pista.url);
  a.volume = 0.55;
  audio = a;
  a.addEventListener("playing", () => {
    fallosSeguidos = 0;
    aviso = "";
    avisar();
  });
  a.addEventListener("ended", () => {
    // la siguiente SIEMPRE es aleatoria dentro de la cola barajada
    if (activa) poner(indice + 1);
  });
  a.addEventListener("error", () => {
    fallosSeguidos++;
    aviso = `«${pista.nombre}» no ha abierto desde tu aparato. Salto a la siguiente.`;
    avisar();
    if (fallosSeguidos >= 3) {
      pararRadioReal();
      aviso =
        "Tres pistas seguidas no han abierto: puede que archive.org esté saturado o que tu red lo bloquee. La radio se para en vez de fingir que suena.";
      avisar();
      return;
    }
    if (activa) poner(indice + 1);
  });
  void a.play().catch(() => {
    aviso = "El navegador ha bloqueado el audio: pulsa otra vez el botón (los navegadores exigen un toque).";
    avisar();
  });
  avisar();
}

/** Enciende la radio aleatoria real (requiere gesto del piloto). */
export function encenderRadioReal(): boolean {
  if (typeof window === "undefined" || MUSICA_REAL.length === 0) return false;
  // LEY DE UNA SOLA VOZ: nunca dos músicas a la vez. Si la Orquesta de Oro
  // sonaba, se apaga; si el taller estaba probando un patrón, se apaga.
  try {
    if (isMusicPlaying()) stopMusic();
    if (estudioSonando()) stopPreview();
  } catch {
    /* si el motor viejo no está cargado, la radio real sigue igual */
  }
  activa = true;
  fallosSeguidos = 0;
  aviso = "";
  try {
    window.localStorage.setItem(LS, "1");
  } catch {
    /* modo privado: no pasa nada */
  }
  if (cola.length === 0) cola = barajar();
  poner(indice);
  return true;
}

export function pararRadioReal() {
  activa = false;
  limpiarAudio();
  try {
    window.localStorage.setItem(LS, "0");
  } catch {
    /* noop */
  }
  avisar();
}

export function saltarPistaReal() {
  if (!activa) return;
  poner(indice + 1);
}

/**
 * ARMA LA RADIO PARA EL PRIMER TOQUE.
 *
 * El Dueño pidió que la música «esté ya ahí» al abrir el Vanguard público.
 * Ningún navegador deja sonar audio antes de un gesto del piloto, así que se
 * hace lo único honesto: se arma un oyente de UN SOLO gesto (toque, tecla o
 * rueda) y en ese instante la radio real arranca barajada. Si el piloto la
 * había parado a mano la vez anterior, NO se arranca — su decisión manda.
 */
let armada = false;

export function armarRadioReal(): void {
  if (typeof window === "undefined" || armada) return;
  armada = true;
  const arranca = (ev?: Event) => {
    // Un toque DENTRO del chip es una decisión suya sobre la radio (encender o
    // parar): no se consume como «primer gesto» ni se adelanta al botón.
    const t = ev?.target as HTMLElement | null;
    if (t && typeof t.closest === "function" && t.closest("[data-vg-radio-real]")) return;
    window.removeEventListener("pointerdown", arranca);
    window.removeEventListener("keydown", arranca as EventListener);
    window.removeEventListener("wheel", arranca as EventListener);
    if (activa) return;
    let previo: string | null = null;
    try {
      previo = window.localStorage.getItem(LS);
    } catch {
      /* modo privado */
    }
    if (previo === "0") return; // lo paró a propósito: se respeta
    encenderRadioReal();
  };
  window.addEventListener("pointerdown", arranca as EventListener, { passive: true });
  window.addEventListener("keydown", arranca as EventListener);
  window.addEventListener("wheel", arranca as EventListener, { passive: true });
}

/** ¿El piloto la había encendido la última vez? (para pintar el chip) */
export function recuerdaEncendida(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LS) === "1";
  } catch {
    return false;
  }
}
