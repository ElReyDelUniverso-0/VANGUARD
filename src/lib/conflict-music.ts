// VANGUARD v26 — MOTOR DE MÚSICA DE CONFLICTO (Web Audio, cero assets)
// El usuario pidió: "agrega música de fondo, muchas músicas de conflicto".
// Este motor SINTETIZA 6 pistas de guerra en tiempo real (tambores de marcha,
// drones oscuros, tensión de frente, radio morse, cumbre rota, victoria) con
// un secuenciador de 16 pasos y look-ahead scheduling — sin descargar nada.
// UI: MusicPlayer (widget global). Persistencia: localStorage vanguard_music.

type Pattern = string; // "x...x...x...x..." — x = golpe, . = silencio, o = acento

interface TrackDef {
  id: string;
  name: string;
  desc: string;
  bpm: number;
  root: number; // Hz del bajo raíz
  kick: Pattern;
  snare: Pattern;
  hat: Pattern;
  bass: number[]; // semitonos relativos a root por paso (-1 = silencio)
  lead: number[]; // semitonos relativos a root*4 (dos octavas arriba)
  leadType: OscillatorType;
  bassType: OscillatorType;
  drone: number; // multiplicador de root para el drone continuo (0 = sin drone)
  droneGain: number;
  swing?: boolean;
}

const st = (semi: number, root: number) => root * Math.pow(2, semi / 12);

export const MUSIC_TRACKS: TrackDef[] = [
  {
    id: "marcha",
    name: "Marcha de Acero",
    desc: "Tambores de desfile militar y bajo de columnas blindadas",
    bpm: 96,
    root: st(-24, 110), // A1
    kick: "x...x...x...x...",
    snare: "....x.......x.oo",
    hat: "..o...o...o...o.",
    bass: [0, -1, 0, -1, 0, -1, 0, 3, 0, -1, 0, -1, -2, -1, -2, -1],
    lead: [-1, -1, 7, -1, -1, -1, 5, -1, 3, -1, -1, -1, 2, -1, -1, -1],
    leadType: "triangle",
    bassType: "sawtooth",
    drone: 0.5,
    droneGain: 0.05,
  },
  {
    id: "drones",
    name: "Drones en la Noche",
    desc: "Zumbido oscuro a 2.000 metros — la espera antes del impacto",
    bpm: 58,
    root: st(-24, 73.42), // D1
    kick: "x.......x.......",
    snare: "................",
    hat: "....o.......o...",
    bass: [0, -1, -1, -1, 0, -1, -1, -1, 0, -1, -1, -1, -5, -1, -1, -1],
    lead: [-1, -1, -1, 12, -1, -1, 10, -1, -1, -1, -1, -1, 7, -1, -1, -1],
    leadType: "sine",
    bassType: "sine",
    drone: 1,
    droneGain: 0.09,
  },
  {
    id: "frente",
    name: "Tensión de Frente",
    desc: "Segundero del francotirador — ostinato de trincheras",
    bpm: 112,
    root: st(-24, 82.41), // E1
    kick: "x..x....x..x....",
    snare: "....x...x...x..o",
    hat: "oooooooooooooo o",
    bass: [0, 0, -1, 0, 0, -1, 0, 3, 0, 0, -1, 0, -2, -1, 5, 3],
    lead: [-1, 12, -1, -1, 10, -1, -1, -1, 8, -1, -1, 12, -1, -1, 15, -1],
    leadType: "square",
    bassType: "sawtooth",
    drone: 0.25,
    droneGain: 0.04,
    swing: true,
  },
  {
    id: "radio",
    name: "Radio Guerra",
    desc: "Morse cifrado, latidos y estática de la central de mando",
    bpm: 84,
    root: st(-24, 98), // G1
    kick: "x.......x.......",
    snare: "............x...",
    hat: "..o...o...o...o.",
    bass: [0, -1, -1, -1, -1, -1, 0, -1, -1, -1, 0, -1, -1, -1, -1, -1],
    lead: [12, -1, 12, -1, -1, 12, -1, -1, 12, 12, -1, -1, -1, -1, 10, -1],
    leadType: "square",
    bassType: "triangle",
    drone: 0.5,
    droneGain: 0.06,
  },
  {
    id: "cumbre",
    name: "Cumbre Rota",
    desc: "Piano de mesa de negociaciones que ya se cae a pedazos",
    bpm: 72,
    root: st(-24, 87.31), // F1
    kick: "x.......x.......",
    snare: "....o.......o...",
    hat: "................",
    bass: [0, -1, -1, -1, -4, -1, -1, -1, 5, -1, -1, -1, 3, -1, -1, -1],
    lead: [12, -1, 15, -1, 19, -1, 15, -1, 12, -1, 10, -1, 8, -1, 10, -1],
    leadType: "triangle",
    bassType: "sine",
    drone: 0,
    droneGain: 0,
  },
  {
    id: "victoria",
    name: "Victoria Final",
    desc: "Fanfarria de banderas — la capital que resiste y celebra",
    bpm: 124,
    root: st(-24, 130.81), // C1
    kick: "x...x...x...x...",
    snare: "....x...x...x.oo",
    hat: "..o...o...o.oooo",
    bass: [0, -1, 0, 0, -1, 0, -1, 0, 7, -1, 7, 7, 5, -1, 3, -1],
    lead: [12, 16, 19, 24, 19, 16, 12, -1, 17, 21, 24, 21, 17, -1, 12, -1],
    leadType: "square",
    bassType: "sawtooth",
    drone: 0,
    droneGain: 0,
  },
  // ====== v28 LANZAMIENTO MUNDIAL: 6 pistas nuevas (12 en total) ======
  {
    id: "exodo",
    name: "Éxodo Silencioso",
    desc: "Maletas en la carretera — la marcha lenta de quienes huyen",
    bpm: 64,
    root: st(-24, 65.41), // C1 dórico grave
    kick: "x.......x.......",
    snare: "........x.......",
    hat: "....o.......o...",
    bass: [0, -1, -1, -1, 3, -1, -1, -1, 5, -1, -1, -1, 3, -1, -1, -1],
    lead: [-1, -1, 12, -1, -1, -1, 10, -1, -1, -1, 8, -1, -1, -1, 7, -1],
    leadType: "triangle",
    bassType: "sine",
    drone: 0.5,
    droneGain: 0.07,
  },
  {
    id: "bloqueo",
    name: "Bloqueo Naval",
    desc: "Buques de guerra en la gabarra — escoltas y sonar activo",
    bpm: 76,
    root: st(-24, 55), // G1 más profundo aún
    kick: "x.....x.x.......",
    snare: "....x.......x...",
    hat: "..o...o...o...o.",
    bass: [0, -1, 0, -1, 0, -1, -2, -1, 0, -1, 0, -1, 3, -1, 2, -1],
    lead: [-1, 7, -1, -1, 10, -1, -1, 7, -1, -1, 5, -1, -1, -1, 3, -1],
    leadType: "sawtooth",
    bassType: "sawtooth",
    drone: 1,
    droneGain: 0.08,
  },
  {
    id: "ciber",
    name: "Ciberataque",
    desc: "Glitch en la red eléctrica — la guerra que no se ve",
    bpm: 132,
    root: st(-24, 92.5), // F#1
    kick: "x..x..x...x..x..",
    snare: "..x.......x...x.",
    hat: "o.o.o.o.o.o.o.oo",
    bass: [0, 0, -1, 3, 0, -1, 5, 3, 0, 0, -1, 3, 7, -1, 5, 3],
    lead: [12, -1, 15, 12, -1, 19, -1, 15, 12, -1, 10, -1, 15, -1, 19, 22],
    leadType: "square",
    bassType: "square",
    drone: 0,
    droneGain: 0,
    swing: true,
  },
  {
    id: "invierno",
    name: "Invierno Atómico",
    desc: "Silencio después de la sirena — cielo gris, tierra helada",
    bpm: 50,
    root: st(-24, 49), // G1 casi subgrave
    kick: "x...............",
    snare: "................",
    hat: "................",
    bass: [0, -1, -1, -1, -1, -1, -1, -1, -5, -1, -1, -1, -1, -1, -1, -1],
    lead: [-1, -1, -1, -1, 12, -1, -1, -1, -1, -1, 10, -1, -1, -1, -1, -1],
    leadType: "sine",
    bassType: "sine",
    drone: 1,
    droneGain: 0.11,
  },
  {
    id: "cerco",
    name: "Cerco Urbano",
    desc: "Calles atrincheradas — escombros, protestas y pancartas",
    bpm: 104,
    root: st(-24, 87.31), // F1
    kick: "x.xx....x.x.....",
    snare: "....x..x....x..o",
    hat: "ooooooooooooooo.",
    bass: [0, 0, -1, 0, -1, 0, 3, -1, 0, 0, -1, 0, -2, -1, -1, 5],
    lead: [-1, 12, -1, -1, 15, -1, -1, 12, -1, 10, -1, -1, 8, -1, 10, -1],
    leadType: "square",
    bassType: "sawtooth",
    drone: 0.25,
    droneGain: 0.05,
  },
  {
    id: "tregua",
    name: "Tregua al Amanecer",
    desc: "Cese al fuego a las 6:00 — café frío y bandera blanca",
    bpm: 68,
    root: st(-24, 110), // A1 cálido
    kick: "x.......x.......",
    snare: "................",
    hat: "....o.......o..o",
    bass: [0, -1, -1, 4, -1, -1, -1, -1, 2, -1, -1, 5, -1, -1, -1, -1],
    lead: [12, -1, 16, -1, 19, -1, -1, 16, 12, -1, -1, 9, -1, -1, 7, -1],
    leadType: "triangle",
    bassType: "triangle",
    drone: 0,
    droneGain: 0,
  },
];

// ================== motor ==================
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;
let droneLfo: OscillatorNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextTime = 0;
let current: TrackDef | null = null;
let volume = 0.5;
const subscribers = new Set<() => void>();

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = volume * 0.6;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function notify() {
  subscribers.forEach((s) => s());
}

function noiseBuffer(c: AudioContext, dur: number): AudioBuffer {
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function playKick(c: AudioContext, t: number, accent: boolean) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(accent ? 140 : 110, t);
  osc.frequency.exponentialRampToValueAtTime(38, t + 0.22);
  g.gain.setValueAtTime(accent ? 0.5 : 0.38, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
  osc.connect(g);
  g.connect(master!);
  osc.start(t);
  osc.stop(t + 0.3);
}

function playSnare(c: AudioContext, t: number, accent: boolean) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.18);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1900;
  f.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(accent ? 0.3 : 0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  src.connect(f);
  f.connect(g);
  g.connect(master!);
  src.start(t);
  src.stop(t + 0.2);
  // golpe de caja (tono corto)
  const osc = c.createOscillator();
  const og = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(196, t);
  og.gain.setValueAtTime(accent ? 0.14 : 0.08, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  osc.connect(og);
  og.connect(master!);
  osc.start(t);
  osc.stop(t + 0.1);
}

function playHat(c: AudioContext, t: number, accent: boolean) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.05);
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 7200;
  const g = c.createGain();
  g.gain.setValueAtTime(accent ? 0.09 : 0.05, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
  src.connect(f);
  f.connect(g);
  g.connect(master!);
  src.start(t);
  src.stop(t + 0.06);
}

function playNote(c: AudioContext, t: number, freq: number, dur: number, type: OscillatorType, gain: number) {
  const osc = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = type === "sawtooth" || type === "square" ? 900 : 2600;
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(f);
  f.connect(g);
  g.connect(master!);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function startDrone(t: TrackDef) {
  const c = getCtx();
  if (!c || !master || !t.drone) return;
  stopDrone();
  droneOsc = c.createOscillator();
  droneGain = c.createGain();
  droneLfo = c.createOscillator();
  const lfoGain = c.createGain();
  droneOsc.type = "sine";
  droneOsc.frequency.value = t.root * t.drone;
  droneGain!.gain.value = t.droneGain;
  droneLfo.frequency.value = 0.13;
  lfoGain.gain.value = t.droneGain * 0.5;
  droneLfo.connect(lfoGain);
  lfoGain.connect(droneGain!.gain);
  droneOsc.connect(droneGain!);
  droneGain!.connect(master);
  droneOsc.start(c.currentTime);
  droneLfo.start(c.currentTime);
}

function stopDrone() {
  try {
    droneOsc?.stop();
    droneLfo?.stop();
  } catch {
    /* noop */
  }
  droneOsc = null;
  droneLfo = null;
  droneGain = null;
}

function scheduler() {
  const c = ctx;
  const t = current;
  if (!c || !t || !master) return;
  const stepDur = 60 / t.bpm / 4; // semicorcheas
  while (nextTime < c.currentTime + 0.14) {
    const i = step % 16;
    const swingOffset = t.swing && i % 2 === 1 ? stepDur * 0.18 : 0;
    const time = nextTime + swingOffset;
    if (t.kick[i] === "x" || t.kick[i] === "o") playKick(c, time, t.kick[i] === "o");
    if (t.snare[i] === "x" || t.snare[i] === "o") playSnare(c, time, t.snare[i] === "o");
    if (t.hat[i] === "x" || t.hat[i] === "o") playHat(c, time, t.hat[i] === "o");
    const b = t.bass[i];
    if (b >= 0) playNote(c, time, st(b, t.root), stepDur * 1.7, t.bassType, 0.16);
    const l = t.lead[i];
    if (l >= 0) playNote(c, time, st(l, t.root * 4), stepDur * 2.4, t.leadType, 0.055);
    nextTime += stepDur;
    step++;
  }
}

// ================== API pública ==================
export function startMusic(trackId?: string) {
  const c = getCtx();
  if (!c) return;
  const def = MUSIC_TRACKS.find((t) => t.id === trackId) || current || MUSIC_TRACKS[0];
  stopMusic();
  current = def;
  step = 0;
  nextTime = c.currentTime + 0.06;
  startDrone(def);
  timer = setInterval(scheduler, 40);
  notify();
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  stopDrone();
  current = current; // conserva selección para reanudar
  notify();
}

export function isMusicPlaying(): boolean {
  return timer !== null;
}

export function currentTrackId(): string | null {
  return current?.id ?? null;
}

export function setMusicVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (master && ctx) master.gain.setTargetAtTime(volume * 0.6, ctx.currentTime, 0.05);
  notify();
}

export function getMusicVolume(): number {
  return volume;
}

export function subscribeMusic(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}
