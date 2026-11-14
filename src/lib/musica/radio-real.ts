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
//  ② CERO AUTOPLAY, NI SIQUIERA CON GESTO (v367.7). Antes el motor se armaba
//     para el primer toque del piloto y arrancaba solo. El Dueño ordenó «no la
//     pongas automática»: ahora la radio suena ÚNICAMENTE cuando se pulsa su
//     botón. El aparato sigue recordando si estaba encendida, pero ese recuerdo
//     no enciende nada — solo se usa para pintar el chip.
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
 * v367.7 LA MÚSICA NO SE ENCIENDE SOLA — orden del Dueño, textual: «no la
 * pongas automática».
 *
 * Esta función EXISTÍA para armar la radio en el primer gesto del piloto (un
 * toque en cualquier sitio la encendía). Eso ya no pasa: ahora no enciende
 * nada y lo dice con su nombre. Se conserva exportada para no romper a quien
 * la importe y porque el gesto explícito sigue siendo el único camino: la
 * radio real suena SOLO si el piloto pulsa el botón del chip.
 *
 * No se borró ni una pista ni una función de la radio: lo único que se apagó
 * es el arranque por su cuenta.
 */
export function armarRadioReal(): void {
  // A propósito vacío. Ver el comentario de arriba: cero arranque automático.
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
