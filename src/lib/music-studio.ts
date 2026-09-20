"use client";

// v27 ESTUDIO DE MÚSICA — compositor procedural DENTRO de la página.
// El jugador arma su patrón (kick/snare/hats/bajo/lead en 16 pasos), elige
// BPM y escala, escucha la vista previa y lo RENDERIZA a WAV real con
// OfflineAudioContext → queda subible a la galería de música de la comunidad
// (los demás lo califican). Sin assets externos: todo se sintetiza.

export interface StudioPattern {
  kick: boolean[]; // 16
  snare: boolean[];
  hat: boolean[];
  bass: number[]; // semitonos relativos a la raíz, -1 = silencio
  lead: number[];
  root: number; // frecuencia raíz (ej 110 = A2)
  wave: OscillatorType; // onda del lead
  bpm: number;
  swing: number; // 0-0.3
}

export const STUDIO_GENRES: { id: string; name: string; bpm: number; desc: string; build: () => StudioPattern }[] = [
  {
    id: "marcha", name: "Marcha de Guerra", bpm: 96, desc: "Tambor marcial + bajo grave",
    build: () => ({
      kick: bool16(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0),
      snare: bool16(0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1),
      hat: bool16(1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1),
      bass: seq16(0, -1, -1, -1, 0, -1, -1, -1, 0, -1, -1, -1, 3, -1, -1, -1),
      lead: seq16(-1, -1, 12, -1, -1, -1, 10, -1, -1, -1, 7, -1, -1, -1, -1, -1),
      root: 110, wave: "sawtooth", bpm: 96, swing: 0,
    }),
  },
  {
    id: "tension", name: "Tensión de Frente", bpm: 112, desc: "Sincopado inquieto",
    build: () => ({
      kick: bool16(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0),
      snare: bool16(0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1),
      hat: bool16(1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1),
      bass: seq16(0, 0, -1, 0, 3, -1, 0, -1, 5, -1, 3, -1, 0, -1, -1, -1),
      lead: seq16(-1, -1, -1, -1, 12, -1, -1, 15, -1, -1, 12, -1, -1, 10, -1, -1),
      root: 98, wave: "square", bpm: 112, swing: 0.12,
    }),
  },
  {
    id: "drones", name: "Drones en la Noche", bpm: 60, desc: "Ambiental, cielo hostil",
    build: () => ({
      kick: bool16(1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
      snare: bool16(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
      hat: bool16(0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0),
      bass: seq16(0, -1, -1, -1, -1, -1, -1, -1, -2, -1, -1, -1, -1, -1, -1, -1),
      lead: seq16(-1, -1, -1, 7, -1, -1, -1, -1, -1, 10, -1, -1, -1, -1, 5, -1),
      root: 82, wave: "sine", bpm: 60, swing: 0,
    }),
  },
  {
    id: "victoria", name: "Victoria Final", bpm: 124, desc: "Himno épico acelerado",
    build: () => ({
      kick: bool16(1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0),
      snare: bool16(0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1),
      hat: bool16(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
      bass: seq16(0, 0, 7, 0, 5, 0, 7, 0, 0, 0, 7, 0, 8, -1, 7, 5),
      lead: seq16(12, -1, 12, 15, -1, 12, -1, 10, 12, -1, 15, -1, 17, -1, -1, -1),
      root: 110, wave: "sawtooth", bpm: 124, swing: 0,
    }),
  },
  {
    id: "morse", name: "Radio de Guerra", bpm: 84, desc: "Morse + estática",
    build: () => ({
      kick: bool16(1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
      snare: bool16(0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0),
      hat: bool16(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1),
      bass: seq16(0, -1, 0, -1, 7, -1, -1, -1, 0, -1, 0, -1, 5, -1, -1, -1),
      lead: seq16(19, -1, -1, 19, -1, 19, -1, -1, -1, -1, 19, -1, -1, -1, -1, -1),
      root: 98, wave: "square", bpm: 84, swing: 0,
    }),
  },
];

function bool16(...v: (0 | 1)[]): boolean[] { return v.map((x) => x === 1); }
function seq16(...v: number[]): number[] { return v; }

export function emptyPattern(genreId = "marcha"): StudioPattern {
  const g = STUDIO_GENRES.find((x) => x.id === genreId) ?? STUDIO_GENRES[0];
  return g.build();
}

// ====== voces (síntesis autónoma, funciona en ctx real y offline) ======
function noise(ctx: BaseAudioContext, dur: number): AudioBuffer {
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function voice(ctx: BaseAudioContext, dest: AudioNode, kind: "kick" | "snare" | "hat" | "bass" | "lead", t: number, freq: number, wave: OscillatorType) {
  const g = ctx.createGain();
  g.connect(dest);
  if (kind === "kick") {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.11);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.24);
    return;
  }
  if (kind === "snare" || kind === "hat") {
    const src = ctx.createBufferSource();
    src.buffer = noise(ctx, 0.18);
    const f = ctx.createBiquadFilter();
    f.type = kind === "snare" ? "bandpass" : "highpass";
    f.frequency.value = kind === "snare" ? 1800 : 7200;
    g.gain.setValueAtTime(kind === "snare" ? 0.5 : 0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + (kind === "snare" ? 0.14 : 0.05));
    src.connect(f).connect(g);
    src.start(t);
    src.stop(t + 0.2);
    return;
  }
  // bass / lead
  const o = ctx.createOscillator();
  o.type = kind === "bass" ? "sawtooth" : wave;
  o.frequency.value = freq;
  const f = ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = kind === "bass" ? 420 : 2400;
  const dur = kind === "bass" ? 0.24 : 0.16;
  g.gain.setValueAtTime(kind === "bass" ? 0.4 : 0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(f).connect(g);
  o.start(t);
  o.stop(t + dur + 0.05);
}

const st = (semi: number, root: number) => root * Math.pow(2, semi / 12);

function schedule(ctx: BaseAudioContext, dest: AudioNode, p: StudioPattern, t0: number, bars: number) {
  const stepDur = 60 / p.bpm / 4;
  const total = bars * 16;
  for (let s = 0; s < total; s++) {
    const i = s % 16;
    const swing = i % 2 === 1 ? p.swing * stepDur : 0;
    const t = t0 + s * stepDur + swing;
    if (p.kick[i]) voice(ctx, dest, "kick", t, 0, p.wave);
    if (p.snare[i]) voice(ctx, dest, "snare", t, 0, p.wave);
    if (p.hat[i]) voice(ctx, dest, "hat", t, 0, p.wave);
    if (p.bass[i] >= 0) voice(ctx, dest, "bass", t, st(p.bass[i], p.root), p.wave);
    if (p.lead[i] >= 0) voice(ctx, dest, "lead", t, st(p.lead[i], p.root * 2), p.wave);
  }
}

// ====== vista previa en vivo ======
let liveCtx: AudioContext | null = null;
let liveStop: (() => void) | null = null;

function getLive(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!liveCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    liveCtx = new Ctor();
  }
  if (liveCtx.state === "suspended") void liveCtx.resume();
  return liveCtx;
}

export function playPreview(p: StudioPattern, onEnd?: () => void): void {
  stopPreview();
  const c = getLive();
  if (!c) return;
  const bars = 2;
  const master = c.createGain();
  master.gain.value = 0.85;
  master.connect(c.destination);
  schedule(c, master, p, c.currentTime + 0.06, bars);
  const totalMs = (2 * 16 * (60 / p.bpm) * 1000) + 400;
  const timer = setTimeout(() => {
    master.disconnect();
    liveStop = null;
    onEnd?.();
  }, totalMs);
  liveStop = () => {
    clearTimeout(timer);
    try { master.disconnect(); } catch { /* noop */ }
    liveStop = null;
  };
}

export function isPlaying(): boolean {
  return liveStop !== null;
}

export function stopPreview(): void {
  liveStop?.();
}

// ====== render a WAV (OfflineAudioContext) → data URL subible ======
export async function renderToWav(p: StudioPattern, bars = 4): Promise<string> {
  const sampleRate = 22050;
  const duration = bars * 16 * (60 / p.bpm) + 1;
  const Ctor =
    (window as unknown as { OfflineAudioContext?: typeof OfflineAudioContext }).OfflineAudioContext ??
    (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!Ctor) throw new Error("OfflineAudioContext no disponible");
  const off = new Ctor(1, Math.ceil(sampleRate * duration), sampleRate);
  const master = off.createGain();
  master.gain.value = 0.85;
  master.connect(off.destination);
  schedule(off, master, p, 0.02, bars);
  const buf = await off.startRendering();
  return encodeWav(buf);
}

async function encodeWav(buf: AudioBuffer): Promise<string> {
  const numCh = 1;
  const len = buf.length;
  const bytes = 44 + len * numCh * 2;
  const ab = new ArrayBuffer(bytes);
  const view = new DataView(ab);
  const wstr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  wstr(0, "RIFF");
  view.setUint32(4, bytes - 8, true);
  wstr(8, "WAVE");
  wstr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, buf.sampleRate, true);
  view.setUint32(28, buf.sampleRate * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  wstr(36, "data");
  view.setUint32(40, len * numCh * 2, true);
  const data = buf.getChannelData(0);
  let off = 44;
  for (let i = 0; i < len; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  const blob = new Blob([ab], { type: "audio/wav" });
  return await new Promise<string>((res) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.readAsDataURL(blob);
  });
}
