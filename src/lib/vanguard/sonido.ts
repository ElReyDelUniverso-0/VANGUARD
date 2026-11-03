"use client";

// ============================================================
// VANGUARD v170.0 — SONIDO SINTETIZADO (herencia v169.0)
// Cero assets, cero red, cero lag. AudioContext perezoso
// (requiere gesto de usuario — entrar a la red ya lo es).
// Todo en try/catch: si falla, Vanguard calla y sigue.
// ============================================================

let ctx: AudioContext | null = null;
let silenciado = false;

function obtenerCtx(): AudioContext | null {
  if (silenciado) return null;
  try {
    if (!ctx) {
      const Win = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const Ctor = Win.AudioContext ?? Win.webkitAudioContext;
      if (!Ctor) {
        silenciado = true;
        return null;
      }
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    silenciado = true;
    return null;
  }
}

function tono(freqInicio: number, freqFin: number, dur: number, pico: number, tipo: OscillatorType = "sine"): void {
  const c = obtenerCtx();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = tipo;
    const t = c.currentTime;
    osc.frequency.setValueAtTime(freqInicio, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqFin, 1), t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(pico, t + dur * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch {
    // silencio total
  }
}

// cascada de revelado: cada fila/card entra una nota más alta (520→940 Hz)
export function tickCascada(indice: number, total: number): void {
  const paso = Math.min(Math.max(indice / Math.max(total - 1, 1), 0), 1);
  tono(520 + paso * 420, 520 + paso * 420 + 60, 0.14, 0.045);
}

// click de interfaz
export function sfxClick(): void {
  tono(190, 140, 0.06, 0.03, "square");
}

// like / recompensa: dos notas ascendentes
export function sfxExito(): void {
  tono(620, 620, 0.09, 0.05);
  window.setTimeout(() => tono(930, 930, 0.12, 0.05), 90);
}

// error / derrota: nota descendente
export function sfxFallo(): void {
  tono(330, 150, 0.22, 0.05, "sawtooth");
}

// transición de sala
export function sfxSala(): void {
  tono(240, 480, 0.18, 0.04, "triangle");
}

// ── FICHAS DEL LINAJE: sobre y revelados por rareza ──────────
export function sfxSobre(): void {
  tono(150, 65, 0.28, 0.06, "sawtooth");
  window.setTimeout(() => tono(230, 95, 0.18, 0.05, "square"), 130);
}

const NOTAS_RAREZA: Record<string, number[]> = {
  COMUN: [520],
  RARO: [560, 700],
  EPICO: [600, 760, 940],
  LEGENDARIO: [640, 840, 1040],
  MITICO: [700, 880, 1100, 1320],
  UNICO: [620, 780, 980, 1180, 1480],
};

// arpegio de revelado: más notas cuanto más rara la ficha
export function sfxRevelar(rareza: string): void {
  const notas = NOTAS_RAREZA[rareza] ?? [520];
  notas.forEach((f, i) => {
    window.setTimeout(() => tono(f, f * 1.02, 0.16, 0.055, i >= 2 ? "triangle" : "sine"), i * 95);
  });
}
