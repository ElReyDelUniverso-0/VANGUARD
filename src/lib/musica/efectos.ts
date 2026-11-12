"use client";

// ============================================================
// v367.3 LA MÚSICA CON FORMA — LOS SONIDOS DE GUERRA (efectos.ts)
//
// «Todo lo que tenga que ver con sonidos, música o algo de guerra visual
// agrégalo» (el Dueño). Aquí están los sonidos de la sala de guerra, todos
// SINTETIZADOS en el aparato: sirena, morse, estática de radio, explosión
// lejana, radar, helicóptero y tambor de marcha. Cero archivos, cero
// enlaces, cero copia.
//
// También es el motor del «ambiente» de la RADIO DE LA CASA: cuando la casa
// emite su propia emisora, debajo del locutor suena esto.
// ============================================================

export type Efecto = "sirena" | "morse" | "estatica" | "explosion" | "radar" | "helicoptero" | "tambor";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let ambiente: { nodos: AudioNode[]; timers: number[] } | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = W.AudioContext || W.webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function ruido(c: AudioContext, dur: number): AudioBufferSourceNode {
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource();
  s.buffer = buf;
  return s;
}

function tono(c: AudioContext, freq: number, tipo: OscillatorType, dur: number, pico: number, t0?: number) {
  const t = t0 ?? c.currentTime;
  const o = c.createOscillator();
  o.type = tipo;
  o.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, pico), t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master!);
  o.start(t);
  o.stop(t + dur + 0.02);
}

/** Un efecto suelto, de un solo golpe. */
export function efecto(nombre: Efecto, volumen = 0.5) {
  const c = audio();
  if (!c || !master) return;
  const t = c.currentTime;
  if (nombre === "sirena") {
    const o = c.createOscillator();
    o.type = "sine";
    const g = c.createGain();
    g.gain.value = volumen * 0.18;
    const lfo = c.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.35;
    const lfoG = c.createGain();
    lfoG.gain.value = 180;
    lfo.connect(lfoG);
    lfoG.connect(o.frequency);
    o.frequency.value = 620;
    o.connect(g);
    g.connect(master);
    o.start(t);
    lfo.start(t);
    o.stop(t + 4);
    lfo.stop(t + 4);
    return;
  }
  if (nombre === "morse") {
    // «VG» en morse: ...- --.
    const patron = [0.1, 0.1, 0.1, 0.3, 0.3, 0.3, 0.6];
    let at = 0;
    const on = [1, 1, 1, 0, 1, 1, 0];
    for (let i = 0; i < patron.length; i++) {
      if (on[i]) tono(c, 720, "square", patron[i], volumen * 0.16, t + at);
      at += patron[i] + 0.08;
    }
    return;
  }
  if (nombre === "estatica") {
    const s = ruido(c, 1.2);
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 1200;
    const g = c.createGain();
    g.gain.value = volumen * 0.1;
    s.connect(f);
    f.connect(g);
    g.connect(master);
    s.start(t);
    return;
  }
  if (nombre === "explosion") {
    const s = ruido(c, 1.4);
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(90, t + 1.2);
    const g = c.createGain();
    g.gain.setValueAtTime(volumen * 0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    s.connect(f);
    f.connect(g);
    g.connect(master);
    s.start(t);
    return;
  }
  if (nombre === "radar") {
    tono(c, 1180, "sine", 0.28, volumen * 0.2);
    tono(c, 1180, "sine", 0.28, volumen * 0.12, t + 0.42);
    return;
  }
  if (nombre === "helicoptero") {
    for (let i = 0; i < 8; i++) tono(c, 92, "square", 0.06, volumen * 0.14, t + i * 0.13);
    return;
  }
  if (nombre === "tambor") {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(52, t + 0.3);
    const g = c.createGain();
    g.gain.setValueAtTime(volumen * 0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t + 0.35);
  }
}

/** El ambiente continuo de una emisora de la casa (estática + morse + sirena + tambor). */
export function arrancarAmbiente(a: {
  estatica: number;
  morse: boolean;
  sirena: "ninguna" | "lejana" | "cercana";
  tambor: boolean;
}) {
  const c = audio();
  if (!c || !master) return;
  pararAmbiente();
  const nodos: AudioNode[] = [];
  const timers: number[] = [];

  if (a.estatica > 0) {
    const s = ruido(c, 2);
    s.loop = true;
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 900;
    const g = c.createGain();
    g.gain.value = Math.min(0.14, a.estatica * 0.25);
    s.connect(f);
    f.connect(g);
    g.connect(master);
    s.start();
    nodos.push(s, g);
  }
  if (a.morse) {
    timers.push(
      window.setInterval(() => efecto("morse", 0.35), 9000),
    );
  }
  if (a.sirena !== "ninguna") {
    const vol = a.sirena === "cercana" ? 0.5 : 0.18;
    timers.push(window.setInterval(() => efecto("sirena", vol), a.sirena === "cercana" ? 11000 : 17000));
  }
  if (a.tambor) {
    timers.push(window.setInterval(() => efecto("tambor", 0.3), 2100));
  }
  ambiente = { nodos, timers };
}

export function pararAmbiente() {
  if (!ambiente) return;
  for (const t of ambiente.timers) window.clearInterval(t);
  for (const n of ambiente.nodos) {
    try {
      if (n instanceof AudioBufferSourceNode) n.stop();
      n.disconnect();
    } catch {
      /* noop */
    }
  }
  ambiente = null;
}

export function ambienteSonando(): boolean {
  return ambiente !== null;
}
