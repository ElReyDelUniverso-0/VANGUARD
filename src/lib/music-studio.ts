"use client";

// v27 ESTUDIO DE MÚSICA — compositor procedural DENTRO de la página.
// El jugador arma su patrón (kick/snare/hats/bajo/lead en 16 pasos), elige
// BPM y escala, escucha la vista previa y lo RENDERIZA a WAV real con
// OfflineAudioContext → queda subible a la galería de música de la comunidad
// (los demás lo califican). Sin assets externos: todo se sintetiza.
//
// v112.0 SOLSTICIO — INSTRUMENTOS V4 "ORQUESTA DE ORO" EN EL ESTUDIO:
// el creador ya no compone con chiptune crudo. Hereda del motor v109:
//   · VOZ FM (campana suave): portadora + modulador 2:1 con índice que cae
//   · CRISTAL: senos desafinados con brillo de armónico doble
//   · METAL: sierra con barrido de filtro (metales de la Última Frontera)
//   · PAD con séptima mayor: colchón de sierras desafinadas ±6 cents
//   · SUB-BAJO: senoidal una octava bajo el bajo
//   · CADENA DE ESTUDIO (AIRE): HPF 28 Hz → aire 9 kHz → compresor de bus
//   · Percusión refinada: bombo con click filtrado, caja con cuerpo
// Los géneros clásicos suenan IGUAL que siempre (compatibilidad total).

export type VozStudio = "sierra" | "cuadrada" | "senoidal" | "triangular" | "fm" | "cristal" | "metal";

export interface StudioPattern {
  kick: boolean[]; // 16
  snare: boolean[];
  hat: boolean[];
  bass: number[]; // semitonos relativos a la raíz, -1 = silencio
  lead: number[];
  root: number; // frecuencia raíz (ej 110 = A2)
  wave: OscillatorType; // onda del lead (clásico — voz sierra/cuadrada/senoidal/triangular)
  bpm: number;
  swing: number; // 0-0.3
  // ── v112 instrumentos v4 (opcionales — los patrones viejos siguen intactos) ──
  voz?: VozStudio; // la voz de la melodía; si falta, se usa `wave`
  pad?: boolean; // colchón de acordes con séptima (color de orquesta)
  sub?: boolean; // sub-senoidal bajo el bajo
  aire?: boolean; // cadena master de estudio (HPF + aire + compresor)
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
  // ── v112: la nueva hornada con instrumentos v4 ──
  {
    id: "orquesta", name: "Orquesta de Oro", bpm: 84, desc: "Campana FM + colchón con séptimas",
    build: () => ({
      kick: bool16(1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0),
      snare: bool16(0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1),
      hat: bool16(1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0),
      bass: seq16(0, -1, -1, -1, -1, -1, 0, -1, -2, -1, -1, -1, 3, -1, -1, -1),
      lead: seq16(12, -1, -1, 10, -1, -1, 7, -1, -1, 15, -1, -1, 12, -1, -1, -1),
      root: 110, wave: "sine", bpm: 84, swing: 0.06,
      voz: "fm", pad: true, aire: true,
    }),
  },
  {
    id: "cristal", name: "Sala de Cristal", bpm: 72, desc: "Voz de cristal, sala dorada",
    build: () => ({
      kick: bool16(1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0),
      snare: bool16(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
      hat: bool16(0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0),
      bass: seq16(0, -1, -1, -1, -1, -1, -1, -1, 5, -1, -1, -1, -1, -1, -1, -1),
      lead: seq16(-1, -1, 7, -1, -1, 10, -1, -1, 12, -1, -1, 14, -1, -1, -1, -1),
      root: 98, wave: "sine", bpm: 72, swing: 0,
      voz: "cristal", pad: true, aire: true,
    }),
  },
  {
    id: "bronce", name: "Metales de Bronce", bpm: 108, desc: "Metales v4 + sub-bajo",
    build: () => ({
      kick: bool16(1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0),
      snare: bool16(0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1),
      hat: bool16(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
      bass: seq16(0, 0, -1, 0, -1, 0, 3, -1, 0, 0, -1, 5, -1, 3, 0, -1),
      lead: seq16(12, -1, 15, -1, 17, -1, -1, 15, -1, 12, -1, 10, 12, -1, -1, -1),
      root: 110, wave: "sawtooth", bpm: 108, swing: 0,
      voz: "metal", sub: true, aire: true,
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
    // v112: bombo redondo + click filtrado (herencia v4)
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.11);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.connect(g);
    o.start(t);
    o.stop(t + 0.24);
    const click = ctx.createBufferSource();
    click.buffer = noise(ctx, 0.02);
    const cf = ctx.createBiquadFilter();
    cf.type = "highpass";
    cf.frequency.value = 2400;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.12, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
    click.connect(cf).connect(cg).connect(dest);
    click.start(t);
    click.stop(t + 0.03);
    return;
  }
  if (kind === "snare") {
    // v112: caja con cuerpo — ruido de sala + tono de 180 Hz
    const src = ctx.createBufferSource();
    src.buffer = noise(ctx, 0.18);
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1800;
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    src.connect(f).connect(g);
    src.start(t);
    src.stop(t + 0.2);
    const cuerpo = ctx.createOscillator();
    cuerpo.type = "triangle";
    cuerpo.frequency.value = 180;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.16, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    cuerpo.connect(cg).connect(dest);
    cuerpo.start(t);
    cuerpo.stop(t + 0.1);
    return;
  }
  if (kind === "hat") {
    const src = ctx.createBufferSource();
    src.buffer = noise(ctx, 0.18);
    const f = ctx.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 7200;
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
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

// ── v112: las TRES VOCES NUEVAS del creador (heredadas del motor v4) ──
function vozV4(ctx: BaseAudioContext, dest: AudioNode, voz: VozStudio, t: number, freq: number) {
  const g = ctx.createGain();
  g.connect(dest);
  const dur = 0.55;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.2, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  if (voz === "fm") {
    // campana suave: portadora + modulador 2:1 con índice que cae (v4)
    const port = ctx.createOscillator();
    port.type = "sine";
    port.frequency.value = freq;
    const mod = ctx.createOscillator();
    mod.type = "sine";
    mod.frequency.value = freq * 2;
    const modG = ctx.createGain();
    modG.gain.setValueAtTime(freq * 1.4, t);
    modG.gain.exponentialRampToValueAtTime(freq * 0.2, t + 0.5);
    mod.connect(modG).connect(port.frequency);
    port.connect(g);
    port.start(t); port.stop(t + dur + 0.05);
    mod.start(t); mod.stop(t + dur + 0.05);
    return;
  }
  if (voz === "cristal") {
    // dos senos desafinados + brillo de armónico doble (v4)
    for (const [f, det, lv] of [[freq, -5, 0.6], [freq, 5, 0.6], [freq * 2.01, 0, 0.28]] as const) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.detune.value = det;
      const og = ctx.createGain();
      og.gain.value = lv;
      o.connect(og).connect(g);
      o.start(t); o.stop(t + dur + 0.05);
    }
    return;
  }
  // metal: sierra con barrido de filtro (metales de la Última Frontera, v4)
  const o = ctx.createOscillator();
  o.type = "sawtooth";
  o.frequency.value = freq;
  const fl = ctx.createBiquadFilter();
  fl.type = "lowpass";
  fl.Q.value = 3;
  fl.frequency.setValueAtTime(420, t);
  fl.frequency.exponentialRampToValueAtTime(2900, t + 0.22);
  fl.frequency.exponentialRampToValueAtTime(700, t + dur);
  o.connect(fl).connect(g);
  o.start(t); o.stop(t + dur + 0.05);
}

// ── v112: cadena master de estudio (opcional, flag `aire`) ──
function cadenaMaster(ctx: BaseAudioContext, aire: boolean): { input: GainNode; out: GainNode } {
  const input = ctx.createGain();
  const out = ctx.createGain();
  out.gain.value = 0.85;
  if (!aire) {
    input.connect(out);
    return { input, out };
  }
  const hpf = ctx.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.value = 28;
  const aireEq = ctx.createBiquadFilter();
  aireEq.type = "highshelf";
  aireEq.frequency.value = 9000;
  aireEq.gain.value = 3;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 24;
  comp.ratio.value = 3;
  comp.attack.value = 0.004;
  comp.release.value = 0.18;
  input.connect(hpf);
  hpf.connect(aireEq);
  aireEq.connect(comp);
  comp.connect(out);
  return { input, out };
}

const st = (semi: number, root: number) => root * Math.pow(2, semi / 12);

function schedule(ctx: BaseAudioContext, dest: AudioNode, p: StudioPattern, t0: number, bars: number) {
  const stepDur = 60 / p.bpm / 4;
  const voz: VozStudio = p.voz ?? "sierra";
  const vozClasica: Record<string, OscillatorType> = {
    sierra: "sawtooth", cuadrada: "square", senoidal: "sine", triangular: "triangle",
  };

  // ── v112 PAD con séptima: colchón por compás (sierras desafinadas ±6 cents) ──
  if (p.pad) {
    const barDur = 16 * stepDur;
    for (let bar = 0; bar < bars; bar++) {
      const tBar = t0 + bar * barDur;
      const base = st(0, p.root * 2);
      const notas = [base, base * 1.5, base * 2 * Math.pow(2, 11 / 12)]; // raíz + 5ª + 7ª mayor
      for (const f of notas) {
        for (const det of [-6, 6]) {
          const o = ctx.createOscillator();
          o.type = "sawtooth";
          o.frequency.value = f;
          o.detune.value = det;
          const fl = ctx.createBiquadFilter();
          fl.type = "lowpass";
          fl.frequency.value = 1200;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, tBar);
          g.gain.linearRampToValueAtTime(0.02, tBar + 0.4);
          g.gain.setValueAtTime(0.02, tBar + barDur - 0.5);
          g.gain.linearRampToValueAtTime(0.0001, tBar + barDur);
          o.connect(fl).connect(g).connect(dest);
          o.start(tBar);
          o.stop(tBar + barDur + 0.05);
        }
      }
    }
  }

  const total = bars * 16;
  for (let s = 0; s < total; s++) {
    const i = s % 16;
    const swing = i % 2 === 1 ? p.swing * stepDur : 0;
    const t = t0 + s * stepDur + swing;
    if (p.kick[i]) voice(ctx, dest, "kick", t, 0, p.wave);
    if (p.snare[i]) voice(ctx, dest, "snare", t, 0, p.wave);
    if (p.hat[i]) voice(ctx, dest, "hat", t, 0, p.wave);
    if (p.bass[i] >= 0) {
      const fb = st(p.bass[i], p.root);
      voice(ctx, dest, "bass", t, fb, p.wave);
      // v112 SUB-BAJO: senoidal una octava abajo, redondo y presente
      if (p.sub) {
        const sg = ctx.createGain();
        sg.connect(dest);
        sg.gain.setValueAtTime(0.26, t);
        sg.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        const so = ctx.createOscillator();
        so.type = "sine";
        so.frequency.value = fb / 2;
        so.connect(sg);
        so.start(t);
        so.stop(t + 0.32);
      }
    }
    if (p.lead[i] >= 0) {
      const fl = st(p.lead[i], p.root * 2);
      if (voz === "fm" || voz === "cristal" || voz === "metal") vozV4(ctx, dest, voz, t, fl);
      else voice(ctx, dest, "lead", t, fl, vozClasica[voz] ?? p.wave);
    }
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
  const { input, out } = cadenaMaster(c, p.aire === true);
  out.connect(c.destination);
  schedule(c, input, p, c.currentTime + 0.06, bars);
  const totalMs = (2 * 16 * (60 / p.bpm) * 1000) + 400;
  const timer = setTimeout(() => {
    out.disconnect();
    liveStop = null;
    onEnd?.();
  }, totalMs);
  liveStop = () => {
    clearTimeout(timer);
    try { out.disconnect(); } catch { /* noop */ }
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
  const { input, out } = cadenaMaster(off, p.aire === true);
  out.connect(off.destination);
  schedule(off, input, p, 0.02, bars);
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
  view.setUint32(28, buf.sampleRate * numCh * 2, true); // byte rate
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
