// ============================================================
// VANGUARD v302.0 EL MUNDO RESPIRA — EL AMBIENTE DEL MUNDO SIN RADIO
// ============================================================
// La cola viva del oído (v300): «el ambiente del mundo con la radio
// APAGADA — el mundo respira sin radio». La v299 le dio al mundo voz
// cuando la Radio suena (setPulsoMundo); esta ronda le da ALIENTO
// cuando la radio descansa: la sala nunca vuelve a estar muerta.
//
// QUÉ SUENA (100% sintetizado, cero assets, cero copyright — ley de
// la casa): un drone grave que sigue la tensión real del planeta
// (getTension), un ALIENTO de ruido filtrado que entra y sale lento
// (el mundo inhalando/exhalando), un LATIDO distante cuya frecuencia
// crece con la tensión (calma ~30 s · mundo ardiendo ~10 s) y una
// SEÑAL lejana (la marca de un cable que llega). El carácter del
// mundo tiene lengua propia: dormido · respira · late · arde.
//
// LAS LEYES DEL MOTOR (las de la casa, v299/v300):
//  · CANDADO DE GESTO: el AudioContext nace/resume SOLO dentro del
//    clic del botón MUNDO (o el primer gesto si el Dueño lo dejó
//    encendido — resumeAmbienteSiQuerido). Cero audio sin permiso.
//  · CESIÓN A LA RADIO: si la Radio suena, el mundo se aparta (fade
//    a cero y queda «en-espera»); cuando la radio descansa, el mundo
//    vuelve a respirar si el Dueño lo dejó querido. El mundo jamás
//    pisa la obra.
//  · SIN RÁFAGAS (lección v299): el latido y la señal no acumulan
//    deuda — si el navegador throttea el timer, el siguiente golpe
//    se reprograma desde AHORA; nunca ametralla atrasos.
//  · HONESTIDAD: estado consultable (apagado · en-espera · vivo) y
//    suscripción para que la píldora cante la verdad.
// ============================================================

import { isMusicPlaying, subscribeMusic } from "@/lib/conflict-music";
import { getTension } from "@/lib/tension";

// ── EL CARÁCTER DEL MUNDO (puro, probado) ──
export type CaracterMundo = "dormido" | "respira" | "late" | "arde";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function caracterMundo(tension: number): CaracterMundo {
  const t = clamp(Number.isFinite(tension) ? tension : 0, 0, 100);
  if (t < 25) return "dormido";
  if (t < 50) return "respira";
  if (t < 75) return "late";
  return "arde";
}

// la intensidad del mundo (0..1): nunca mudo del todo mientras vive —
// incluso en calma el planeta respira suave (0.15)
export function intensidadAmbiente(tension: number): number {
  const t = clamp(Number.isFinite(tension) ? tension : 0, 0, 100);
  return clamp(0.15 + (t / 100) * 0.85, 0.15, 1);
}

// los segundos hasta el próximo LATIDO distante: el mundo caliente
// late antes (30 s en calma → 10 s ardiendo), con deriva humana ±25%
// (la humanización v299, ahora en el planeta)
export function siguienteLatido(tension: number, azar: number): number {
  const t = clamp(Number.isFinite(tension) ? tension : 0, 0, 100);
  const base = 30 - (t / 100) * 20;
  return base * (0.75 + clamp(azar, 0, 1) * 0.5);
}

// los segundos hasta la próxima SEÑAL lejana (un cable que llega):
// 45 s en calma → 20 s cuando el mundo arde, deriva humana ±30%
export function siguienteSenal(tension: number, azar: number): number {
  const t = clamp(Number.isFinite(tension) ? tension : 0, 0, 100);
  const base = 45 - (t / 100) * 25;
  return base * (0.7 + clamp(azar, 0, 1) * 0.6);
}

// ── EL ESTADO HONESTO ──
export type EstadoAmbiente = "apagado" | "en-espera" | "vivo";
const LS_AMBIENTE = "vg_ambiente_v302";

let querido = false; // la intención del Dueño (persistida)
let vivo = false; // el mundo suena ahora mismo
let tensionActual = 0;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
// la planta: el filtro del drone (se abre con la tensión) y el aliento
// (la base y su LFO, ambos a la misma escala del mundo)
let nodos: { flt: BiquadFilterNode; g: GainNode; lfoG: GainNode } | null = null;
let timerLatido: ReturnType<typeof setTimeout> | null = null;
let timerSenal: ReturnType<typeof setTimeout> | null = null;
let timerTension: ReturnType<typeof setInterval> | null = null;
let cesionActiva = false; // el mundo ya mira a la radio
const suscriptores = new Set<() => void>();

function notificar() {
  for (const cb of suscriptores) {
    try { cb(); } catch { /* un oyente muerto no calla a los demás */ }
  }
}

export function subscribeAmbiente(cb: () => void): () => void {
  suscriptores.add(cb);
  return () => suscriptores.delete(cb);
}

export function estadoAmbiente(): EstadoAmbiente {
  if (!querido && !vivo) return "apagado";
  if (vivo) return "vivo";
  return "en-espera";
}

function leerQuerido(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LS_AMBIENTE) === "on";
  } catch { return false; }
}

function guardarQuerido(v: boolean) {
  querido = v;
  try {
    localStorage.setItem(LS_AMBIENTE, v ? "on" : "off");
  } catch { /* noop */ }
}

// ── LA PLANTA SONORA (la respiración) ──
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    } catch { return null; }
  }
  return ctx;
}

function aliento(c: AudioContext, destino: GainNode) {
  // el aliento: un lazo de ruido bandpass cuyo volumen sube y baja lento
  // (período ~14 s) — el mundo inhalando y exhalando
  const dur = 4;
  const buf = c.createBuffer(2, c.sampleRate * dur, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < d.length; i++) {
      const n = Math.random() * 2 - 1;
      lp += 0.04 * (n - lp); // ruido marrón suave, sin grano
      d[i] = lp * 3.2;
    }
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 420;
  bp.Q.value = 0.7;
  const g = c.createGain();
  g.gain.value = 0.0;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.07; // ~14 s de respiración
  const lfoG = c.createGain();
  // la profundidad del aliento la manda baseAliento(): el LFO oscila
  // alrededor de CERO con la MISMA escala que la base — la suma nunca
  // suena ni negra ni fuerte (el mundo no grita: respira)
  lfoG.gain.value = 0;
  lfo.connect(lfoG);
  lfoG.connect(g.gain);
  src.connect(bp);
  bp.connect(g);
  g.connect(destino);
  src.start();
  lfo.start();
  return { g, bp, lfoG };
}

function drone(c: AudioContext, destino: GainNode) {
  // el drone grave: dos senos desafinados (D2 + A2 con deriva) bajo un
  // filtro que se abre con la tensión — el hermano silencioso del drone
  // de la orquesta (v299)
  const gA = c.createOscillator();
  gA.type = "sine";
  gA.frequency.value = 73.42; // D2 — la casa vive en Re
  const gB = c.createOscillator();
  gB.type = "sine";
  gB.frequency.value = 110.35; // A2 +6 cents — la quinta que respira
  const mezcla = c.createGain();
  mezcla.gain.value = 0.5;
  const flt = c.createBiquadFilter();
  flt.type = "lowpass";
  flt.frequency.value = 180;
  flt.Q.value = 0.4;
  // la deriva lenta del filtro (como el aire de una sala grande)
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.021;
  const lfoG = c.createGain();
  lfoG.gain.value = 36;
  lfo.connect(lfoG);
  lfoG.connect(flt.frequency);
  gA.connect(mezcla);
  gB.connect(mezcla);
  mezcla.connect(flt);
  flt.connect(destino);
  gA.start();
  gB.start();
  lfo.start();
  return { flt };
}

function latido(c: AudioContext, destino: GainNode, fuerza: number) {
  // el latido distante: un golpe grave que cae de tono (58→38 Hz) con
  // un eco más suave 0.18 s después — el corazón del planeta, lejos
  const t0 = c.currentTime;
  for (const [delta, k] of [[0, 1], [0.18, 0.55]] as const) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(58, t0 + delta);
    o.frequency.exponentialRampToValueAtTime(38, t0 + delta + 0.3);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t0 + delta);
    g.gain.linearRampToValueAtTime(0.09 * fuerza * k, t0 + delta + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + delta + 0.42);
    o.connect(g);
    g.connect(destino);
    o.start(t0 + delta);
    o.stop(t0 + delta + 0.5);
  }
}

function senal(c: AudioContext, destino: GainNode, fuerza: number) {
  // la señal lejana: una campana FM altísima y bajísima — la marca de
  // un cable que llega al mundo (la familia de la Voz Dorada, v123)
  const t0 = c.currentTime;
  const car = c.createOscillator();
  car.type = "sine";
  car.frequency.value = 1174.66; // Re6 — la casa
  const mod = c.createOscillator();
  mod.type = "sine";
  mod.frequency.value = 2352;
  const modG = c.createGain();
  modG.gain.setValueAtTime(180, t0);
  modG.gain.exponentialRampToValueAtTime(8, t0 + 0.2);
  mod.connect(modG);
  modG.connect(car.frequency);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.018 * fuerza, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.55);
  car.connect(g);
  g.connect(destino);
  car.start(t0);
  mod.start(t0);
  car.stop(t0 + 0.6);
  mod.stop(t0 + 0.6);
}

function programarLatido() {
  if (timerLatido) clearTimeout(timerLatido);
  if (!vivo || !ctx || !master) return;
  // SIN DEUDA (lección v299): el próximo golpe se cuenta desde AHORA —
  // si el navegador durmió el timer, el mundo late tarde, nunca en ráfaga
  timerLatido = setTimeout(() => {
    if (!vivo || !ctx || !master) return;
    latido(ctx, master, intensidadAmbiente(tensionActual));
    programarLatido();
  }, Math.round(siguienteLatido(tensionActual, Math.random()) * 1000));
}

function programarSenal() {
  if (timerSenal) clearTimeout(timerSenal);
  if (!vivo || !ctx || !master) return;
  timerSenal = setTimeout(() => {
    if (!vivo || !ctx || !master) return;
    senal(ctx, master, intensidadAmbiente(tensionActual));
    programarSenal();
  }, Math.round(siguienteSenal(tensionActual, Math.random()) * 1000));
}

function sienteTension() {
  tensionActual = getTension();
  // el filtro del drone se abre con el mundo (hermano del pulso v299)
  if (ctx && nodos) {
    nodos.flt.frequency.setTargetAtTime(180 + tensionActual * 2.6, ctx.currentTime, 1.2);
  }
}

function levantaPlanta(c: AudioContext): boolean {
  if (!master) {
    master = c.createGain();
    master.gain.value = 0;
    master.connect(c.destination);
    nodos = { ...drone(c, master), ...aliento(c, master) };
  }
  return true;
}

function baseAliento(fuerza: number) {
  // la base y la profundidad del aliento a la MISMA escala: la suma
  // oscila entre ~10% y ~190% de la base — respira, nunca grita
  if (!ctx || !nodos) return;
  nodos.g.gain.setTargetAtTime(0.022 * fuerza, ctx.currentTime, 1.5);
  nodos.lfoG.gain.setTargetAtTime(0.018 * fuerza, ctx.currentTime, 1.5);
}

function baseDrone(fuerza: number) {
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(0.055 * fuerza, ctx.currentTime, 1.5);
}

function arranqueInterno() {
  const c = getCtx();
  if (!c) return false;
  if (c.state === "suspended") c.resume();
  levantaPlanta(c);
  vivo = true;
  tensionActual = getTension();
  const fuerza = intensidadAmbiente(tensionActual);
  baseAliento(fuerza);
  baseDrone(fuerza);
  sienteTension();
  programarLatido();
  programarSenal();
  if (!timerTension) timerTension = setInterval(sienteTension, 5000);
  notificar();
  return true;
}

function apagonInterno() {
  vivo = false;
  if (timerLatido) { clearTimeout(timerLatido); timerLatido = null; }
  if (timerSenal) { clearTimeout(timerSenal); timerSenal = null; }
  if (timerTension) { clearInterval(timerTension); timerTension = null; }
  if (ctx && master) {
    // el mundo se duerme suave (fade ~1.2 s): la planta queda quieta y
    // sin coste — volver a respirar solo levanta las ganancias
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    if (nodos) {
      nodos.g.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      nodos.lfoG.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    }
  }
  notificar();
}

// ── LA CESIÓN A LA RADIO (el mundo jamás pisa la obra) ──
function vigilarRadio() {
  if (cesionActiva || typeof window === "undefined") return;
  cesionActiva = true;
  subscribeMusic(() => {
    if (isMusicPlaying()) {
      // la radio entra: el mundo se aparta (queda querido, en espera)
      if (vivo) apagonInterno();
    } else if (querido) {
      // la radio descansa: el mundo vuelve a respirar si el Dueño lo dejó
      arranqueInterno();
    }
  });
}

// ── LA API DE LA CASA ──
export function startAmbiente(): boolean {
  if (typeof window === "undefined") return false;
  guardarQuerido(true);
  vigilarRadio();
  if (isMusicPlaying()) { notificar(); return false; } // en espera, sin pisar la obra
  const ok = arranqueInterno();
  return ok;
}

export function stopAmbiente() {
  guardarQuerido(false);
  apagonInterno();
}

export function toggleAmbiente(): boolean {
  if (querido) { stopAmbiente(); return false; }
  startAmbiente();
  return querido;
}

// el mundo que el Dueño dejó encendido respira al primer gesto
// (los navegadores bloquean el audio sin interacción — ley v217)
export function resumeAmbienteSiQuerido(): boolean {
  if (typeof window === "undefined" || vivo) return false;
  if (!leerQuerido()) { querido = false; return false; }
  querido = true;
  vigilarRadio();
  if (isMusicPlaying()) { notificar(); return false; }
  return arranqueInterno();
}

export function isAmbienteVivo(): boolean {
  return vivo;
}

// el puente de QA (solo lectura, el patrón de la casa v194)
export function __qaAmbienteDebug(): {
  estado: EstadoAmbiente; querido: boolean; vivo: boolean;
  tension: number; caracter: CaracterMundo; fuerza: number;
  latidoBase: number; senalBase: number; ctx: string;
} {
  return {
    estado: estadoAmbiente(),
    querido,
    vivo,
    tension: tensionActual,
    caracter: caracterMundo(tensionActual),
    fuerza: intensidadAmbiente(tensionActual),
    latidoBase: siguienteLatido(tensionActual, 0.5),
    senalBase: siguienteSenal(tensionActual, 0.5),
    ctx: ctx?.state ?? "sin-ctx",
  };
}

if (typeof window !== "undefined") {
  (window as unknown as { __vgMundo?: typeof __qaAmbienteDebug }).__vgMundo = __qaAmbienteDebug;
}
