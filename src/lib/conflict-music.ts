// VANGUARD v31 — MOTOR DE MÚSICA v2 "BANDA SONORA CINEMATOGRÁFICA" (Web Audio, cero assets)
// Reescritura total a petición del usuario: la v26 sonaba a "bips" porque loopeaba
// UN compás con ondas crudas. Esta versión añade:
//   · Arreglo de 4 compases con progresión de acordes real (i-VI-III-VII etc.)
//   · PAD cinematográfico: acordes sostenidos con ataque lento + filtro + reverb
//   · Arpegio melódico con DELAY con feedback (espacio tridimensional)
//   · REVERB sintética (impulso exponencial generado en vivo)
//   · COMPRESOR en el master (sonido pegado, sin clips)
//   · Batería refinada: kick con sub grave, caja con cuerpo, hats suaves
//   · Fill de batería al final del ciclo de 4 compases
//   · Autoplay: resumeMusicIfWanted() arranca la radio en el primer gesto si
//     el usuario la dejó encendida (los navegadores exigen un gesto).
// UI: MusicPlayer (widget global). Persistencia: localStorage vanguard_music.

type Pattern = string; // "x...x..." — x = golpe, . = silencio, o = acento

interface TrackDef {
  id: string;
  name: string;
  desc: string;
  bpm: number;
  root: number; // Hz del bajo raíz (registro grave)
  chords: number[][]; // 4 compases: acorde por compás, semitonos relativos a root
  bass: number[]; // 16 pasos: offset en semitonos sobre la FUNDAMENTAL del acorde (-1 silencio)
  arp: number[]; // 16 pasos: índice de nota del acorde (0=root,1=3ª,2=5ª,3=root+12...) (-1 silencio)
  arpType: OscillatorType;
  bassType: OscillatorType;
  kick: Pattern;
  snare: Pattern;
  hat: Pattern;
  drone: number; // multiplicador de root para el drone continuo (0 = sin drone)
  droneGain: number;
  padLevel: number; // volumen del colchón de acordes
  swing?: boolean;
  fill?: boolean; // relleno de batería en el compás 4
}

const st = (semi: number, root: number) => root * Math.pow(2, semi / 12);

// helper: acorde mayor/menor en semitonos relativos
const maj = (r: number) => [r, r + 4, r + 7];
const min = (r: number) => [r, r + 3, r + 7];

export const MUSIC_TRACKS: TrackDef[] = [
  {
    id: "marcha",
    name: "Marcha de Acero",
    desc: "Tambores de desfile militar y bajo de columnas blindadas",
    bpm: 96,
    root: st(-24, 110), // A0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // Am - F - C - G
    bass: [0, -1, 0, -1, 0, -1, 0, 7, 0, -1, 0, -1, 0, 7, 10, 12],
    arp: [-1, -1, 6, -1, -1, -1, 4, -1, -1, -1, 2, -1, -1, -1, 0, -1],
    arpType: "triangle",
    bassType: "sawtooth",
    kick: "x...x...x...x...",
    snare: "....x.......x...",
    hat: "..x...x...x...x.",
    drone: 0.5,
    droneGain: 0.05,
    padLevel: 0.05,
    fill: true,
  },
  {
    id: "drones",
    name: "Drones en la Noche",
    desc: "Zumbido oscuro a 2.000 metros — la espera antes del impacto",
    bpm: 58,
    root: st(-24, 73.42), // D0
    chords: [min(0), maj(-4), min(-7), maj(-5)], // Dm - Bb - Gm - A
    bass: [0, -1, -1, -1, -1, -1, -1, 7, -1, -1, -1, -1, -1, -1, 10, -1],
    arp: [3, -1, -1, -1, 4, -1, -1, -1, 2, -1, -1, -1, 6, -1, -1, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "................",
    hat: "....x.......x...",
    drone: 1,
    droneGain: 0.08,
    padLevel: 0.06,
  },
  {
    id: "frente",
    name: "Tensión de Frente",
    desc: "Segundero del francotirador — ostinato de trincheras",
    bpm: 112,
    root: st(-24, 82.41), // E0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // Em - C - G - D
    bass: [0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0, -1, 0, 0, 10, 7],
    arp: [3, -1, 4, -1, 5, -1, 4, -1, 3, -1, 4, -1, 6, -1, 5, -1],
    arpType: "triangle",
    bassType: "sawtooth",
    kick: "x..x....x..x....",
    snare: "....x...x...x...",
    hat: "x.x.x.x.x.x.x.x.",
    drone: 0.25,
    droneGain: 0.04,
    padLevel: 0.045,
    swing: true,
    fill: true,
  },
  {
    id: "radio",
    name: "Radio Guerra",
    desc: "Morse cifrado, latidos y estática de la central de mando",
    bpm: 84,
    root: st(-24, 98), // G0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // Gm - Eb - Bb - F
    bass: [0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1, 7, -1],
    arp: [3, 4, -1, 3, -1, -1, 5, -1, 3, 4, -1, 3, -1, 6, -1, -1],
    arpType: "square",
    bassType: "triangle",
    kick: "x.......x.......",
    snare: "............x...",
    hat: "..x...x...x...x.",
    drone: 0.5,
    droneGain: 0.05,
    padLevel: 0.04,
  },
  {
    id: "cumbre",
    name: "Cumbre Rota",
    desc: "Piano de mesa de negociaciones que ya se cae a pedazos",
    bpm: 72,
    root: st(-24, 87.31), // F0
    chords: [maj(0), min(-3), maj(-7), maj(-5)], // F - Dm - Bb - C
    bass: [0, -1, -1, -1, 7, -1, -1, -1, 0, -1, -1, -1, 10, -1, -1, -1],
    arp: [3, -1, 4, -1, 5, -1, 4, -1, 3, -1, 4, -1, 5, -1, 4, -1],
    arpType: "triangle",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "....x.......x...",
    hat: "................",
    drone: 0,
    droneGain: 0,
    padLevel: 0.06,
  },
  {
    id: "victoria",
    name: "Victoria Final",
    desc: "Fanfarria de banderas — la capital que resiste y celebra",
    bpm: 124,
    root: st(-24, 130.81), // C0
    chords: [maj(0), maj(-5), min(-3), maj(-7)], // C - G - Am - F
    bass: [0, -1, 0, -1, 0, -1, 7, -1, 0, -1, 0, -1, 7, -1, 10, 12],
    arp: [3, 4, 5, 7, 5, 4, 3, -1, 4, 5, 6, 8, 6, 5, 4, -1],
    arpType: "square",
    bassType: "sawtooth",
    kick: "x...x...x...x...",
    snare: "....x...x...x...",
    hat: "..x...x...x.x.x.",
    drone: 0,
    droneGain: 0,
    padLevel: 0.05,
    fill: true,
  },
  {
    id: "exodo",
    name: "Éxodo Silencioso",
    desc: "Maletas en la carretera — la marcha lenta de quienes huyen",
    bpm: 64,
    root: st(-24, 65.41), // C0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // Cm - Ab - Eb - Bb
    bass: [0, -1, -1, -1, 0, -1, -1, -1, 7, -1, -1, -1, 10, -1, -1, -1],
    arp: [-1, -1, 3, -1, -1, -1, 4, -1, -1, -1, 5, -1, -1, -1, 4, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "........x.......",
    hat: "....x.......x...",
    drone: 0.5,
    droneGain: 0.06,
    padLevel: 0.06,
  },
  {
    id: "bloqueo",
    name: "Bloqueo Naval",
    desc: "Buques de guerra en la gabarra — escoltas y sonar activo",
    bpm: 76,
    root: st(-24, 55), // G0 profundo
    chords: [min(0), min(5), maj(-5), min(0)], // Gm - Cm - D - Gm
    bass: [0, -1, 0, -1, 0, -1, 0, 7, 0, -1, 0, -1, 0, 10, 7, 0],
    arp: [3, -1, -1, 5, -1, -1, 4, -1, 3, -1, -1, 5, -1, -1, 6, -1],
    arpType: "sawtooth",
    bassType: "sawtooth",
    kick: "x.....x.x.......",
    snare: "....x.......x...",
    hat: "..x...x...x...x.",
    drone: 1,
    droneGain: 0.07,
    padLevel: 0.05,
  },
  {
    id: "ciber",
    name: "Ciberataque",
    desc: "Glitch en la red eléctrica — la guerra que no se ve",
    bpm: 132,
    root: st(-24, 92.5), // F#0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // F#m - D - A - E
    bass: [0, 0, -1, 0, 0, -1, 0, 7, 0, 0, -1, 0, 0, -1, 10, 7],
    arp: [3, -1, 4, 5, -1, 4, 3, -1, 4, -1, 5, 6, -1, 5, 4, -1],
    arpType: "square",
    bassType: "square",
    kick: "x..x..x...x..x..",
    snare: "..x.......x...x.",
    hat: "x.x.x.x.x.x.x.x.",
    drone: 0,
    droneGain: 0,
    padLevel: 0.035,
    swing: true,
    fill: true,
  },
  {
    id: "invierno",
    name: "Invierno Atómico",
    desc: "Silencio después de la sirena — cielo gris, tierra helada",
    bpm: 50,
    root: st(-24, 49), // G0 casi subgrave
    chords: [min(0), maj(-4), min(0), maj(-5)], // Gm - Eb - Gm - D
    bass: [0, -1, -1, -1, -1, -1, -1, -1, -5, -1, -1, -1, -1, -1, -1, -1],
    arp: [-1, -1, -1, 3, -1, -1, -1, -1, 4, -1, -1, -1, -1, -1, 2, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x...............",
    snare: "................",
    hat: "................",
    drone: 1,
    droneGain: 0.1,
    padLevel: 0.07,
  },
  {
    id: "cerco",
    name: "Cerco Urbano",
    desc: "Calles atrincheradas — escombros, protestas y pancartas",
    bpm: 104,
    root: st(-24, 87.31), // F0
    chords: [min(0), maj(-4), maj(-2), maj(-5)], // Fm - Db - Eb - C
    bass: [0, -1, 0, 0, -1, 0, 7, -1, 0, -1, 0, 0, -1, 10, 7, 0],
    arp: [3, -1, -1, 4, -1, 3, -1, -1, 5, -1, 4, -1, 3, -1, 4, -1],
    arpType: "sawtooth",
    bassType: "sawtooth",
    kick: "x.xx....x.x.....",
    snare: "....x..x....x...",
    hat: "x.x.x.x.x.x.x.x.",
    drone: 0.25,
    droneGain: 0.045,
    padLevel: 0.04,
    fill: true,
  },
  {
    id: "tregua",
    name: "Tregua al Amanecer",
    desc: "Cese al fuego a las 6:00 — café frío y bandera blanca",
    bpm: 68,
    root: st(-24, 110), // A0 cálido
    chords: [maj(0), maj(-5), min(4), maj(5)], // A - E - F#m - D
    bass: [0, -1, -1, -1, 7, -1, -1, -1, 0, -1, -1, -1, 7, -1, 12, -1],
    arp: [3, -1, 4, -1, 5, -1, -1, 4, 3, -1, -1, 4, -1, -1, 5, -1],
    arpType: "triangle",
    bassType: "triangle",
    kick: "x.......x.......",
    snare: "................",
    hat: "....x.......x..x",
    drone: 0,
    droneGain: 0,
    padLevel: 0.06,
  },
];

// ================== motor v2 ==================
let ctx: AudioContext | null = null;
let master: GainNode | null = null; // volumen general
let comp: DynamicsCompressorNode | null = null; // compresor master
let reverbBus: GainNode | null = null; // envío a reverb
let delayBus: GainNode | null = null; // envío a delay
let delayNode: DelayNode | null = null;
let padFilter: BiquadFilterNode | null = null;
let droneOsc: OscillatorNode | null = null;
let droneOsc2: OscillatorNode | null = null;
let droneGain: GainNode | null = null;
let droneLfo: OscillatorNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextTime = 0;
let current: TrackDef | null = null;
let volume = 0.5;
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((s) => s());
}

function buildReverbImpulse(c: AudioContext): AudioBuffer {
  // impulso sintético: ruido estéreo con decaimiento exponencial (sala grande)
  const dur = 2.1;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
    }
  }
  return buf;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctor();

      // cadena master: volumen -> compresor -> salida
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 22;
      comp.ratio.value = 4;
      comp.attack.value = 0.004;
      comp.release.value = 0.24;
      comp.connect(ctx.destination);

      master = ctx.createGain();
      master.gain.value = volume * 0.55;
      master.connect(comp);

      // bus de reverb
      const conv = ctx.createConvolver();
      conv.buffer = buildReverbImpulse(ctx);
      const wet = ctx.createGain();
      wet.gain.value = 0.9;
      reverbBus = ctx.createGain();
      reverbBus.gain.value = 1;
      reverbBus.connect(conv);
      conv.connect(wet);
      wet.connect(master);

      // bus de delay con feedback filtrado
      delayBus = ctx.createGain();
      delayNode = ctx.createDelay(1.5);
      const fb = ctx.createGain();
      fb.gain.value = 0.34;
      const fbFilter = ctx.createBiquadFilter();
      fbFilter.type = "lowpass";
      fbFilter.frequency.value = 2200;
      delayNode.connect(fbFilter);
      fbFilter.connect(fb);
      fb.connect(delayNode); // loop
      delayBus.connect(delayNode);
      delayNode.connect(master);
      if (reverbBus) delayNode.connect(reverbBus); // una pizca de reverb al eco

      // filtro del pad (colchón cálido)
      padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.value = 780;
      padFilter.Q.value = 0.4;
      padFilter.connect(master);
      if (reverbBus) padFilter.connect(reverbBus);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function noiseBuffer(c: AudioContext, dur: number): AudioBuffer {
  const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// ---------- percusión refinada ----------
function playKick(c: AudioContext, t: number, accent: boolean) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(accent ? 130 : 105, t);
  osc.frequency.exponentialRampToValueAtTime(36, t + 0.24);
  g.gain.setValueAtTime(accent ? 0.52 : 0.4, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.connect(g);
  g.connect(master!);
  osc.start(t);
  osc.stop(t + 0.34);
  // click suave filtrado (menos "pop" que la v26)
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.02);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 900;
  const cg = c.createGain();
  cg.gain.setValueAtTime(accent ? 0.16 : 0.1, t);
  cg.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
  src.connect(f);
  f.connect(cg);
  cg.connect(master!);
  src.start(t);
  src.stop(t + 0.03);
}

function playSnare(c: AudioContext, t: number, accent: boolean) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, 0.2);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = 1700;
  f.Q.value = 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(accent ? 0.26 : 0.15, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
  src.connect(f);
  f.connect(g);
  g.connect(master!);
  if (reverbBus) g.connect(reverbBus); // cola de sala
  src.start(t);
  src.stop(t + 0.22);
  // cuerpo tonal corto
  const osc = c.createOscillator();
  const og = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(185, t);
  osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
  og.gain.setValueAtTime(accent ? 0.12 : 0.07, t);
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
  f.frequency.value = 8600;
  const g = c.createGain();
  g.gain.setValueAtTime(accent ? 0.07 : 0.038, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  src.connect(f);
  f.connect(g);
  g.connect(master!);
  src.start(t);
  src.stop(t + 0.055);
}

// ---------- notas ----------
function playNote(
  c: AudioContext,
  t: number,
  freq: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  opts?: { reverb?: number; delay?: number; cutoff?: number },
) {
  const osc = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = opts?.cutoff ?? (type === "sawtooth" || type === "square" ? 1400 : 3000);
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(f);
  f.connect(g);
  g.connect(master!);
  if (opts?.reverb && reverbBus) {
    const rs = c.createGain();
    rs.gain.value = opts.reverb;
    g.connect(rs);
    rs.connect(reverbBus);
  }
  if (opts?.delay && delayBus) {
    const ds = c.createGain();
    ds.gain.value = opts.delay;
    g.connect(ds);
    ds.connect(delayBus);
  }
  osc.start(t);
  osc.stop(t + dur + 0.06);
}

// ---------- pad: acordes sostenidos por compás ----------
function playPad(c: AudioContext, t: number, chordSemis: number[], root: number, barDur: number, level: number) {
  if (!padFilter || level <= 0) return;
  const notes = [...chordSemis.slice(0, 3), chordSemis[0] + 12]; // tríada + octava
  for (const semi of notes) {
    for (const det of [-5, 5]) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = st(semi, root * 4);
      osc.detune.value = det;
      const atk = barDur * 0.35;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level, t + atk);
      g.gain.setValueAtTime(level, t + barDur * 0.7);
      g.gain.linearRampToValueAtTime(0, t + barDur * 1.15);
      osc.connect(g);
      g.connect(padFilter);
      osc.start(t);
      osc.stop(t + barDur * 1.2);
    }
  }
}

function startDrone(t: TrackDef) {
  const c = getCtx();
  if (!c || !master || !t.drone) return;
  stopDrone();
  droneOsc = c.createOscillator();
  droneOsc2 = c.createOscillator();
  droneGain = c.createGain();
  droneLfo = c.createOscillator();
  const lfoGain = c.createGain();
  const dFilter = c.createBiquadFilter();
  dFilter.type = "lowpass";
  dFilter.frequency.value = 320;
  droneOsc.type = "sine";
  droneOsc.frequency.value = t.root * t.drone;
  droneOsc2.type = "sine";
  droneOsc2.frequency.value = t.root * t.drone;
  droneOsc2.detune.value = 7; // coro ligero
  droneGain.gain.value = t.droneGain;
  droneLfo.frequency.value = 0.09;
  lfoGain.gain.value = t.droneGain * 0.45;
  droneLfo.connect(lfoGain);
  lfoGain.connect(droneGain.gain);
  droneOsc.connect(dFilter);
  droneOsc2.connect(dFilter);
  dFilter.connect(droneGain);
  droneGain.connect(master);
  droneOsc.start(c.currentTime);
  droneOsc2.start(c.currentTime);
  droneLfo.start(c.currentTime);
}

function stopDrone() {
  try {
    droneOsc?.stop();
    droneOsc2?.stop();
    droneLfo?.stop();
  } catch {
    /* noop */
  }
  droneOsc = null;
  droneOsc2 = null;
  droneLfo = null;
  droneGain = null;
}

function scheduler() {
  const c = ctx;
  const t = current;
  if (!c || !t || !master) return;
  const stepDur = 60 / t.bpm / 4; // semicorcheas
  const barDur = stepDur * 16;
  while (nextTime < c.currentTime + 0.16) {
    const i = step % 16;
    const bar = Math.floor(step / 16) % 4;
    const swingOffset = t.swing && i % 2 === 1 ? stepDur * 0.16 : 0;
    const time = nextTime + swingOffset;

    // batería + fill en el último compás del ciclo (t.fill es opcional → !! para boolean estricto)
    const filling = !!t.fill && bar === 3 && i >= 12;
    if (t.kick[i] === "x" || t.kick[i] === "o") playKick(c, time, t.kick[i] === "o");
    if (t.snare[i] === "x" || t.snare[i] === "o" || (filling && i % 2 === 0)) playSnare(c, time, t.snare[i] === "o" || filling);
    if (t.hat[i] === "x" || t.hat[i] === "o" || (filling && i % 2 === 1)) playHat(c, time, t.hat[i] === "o" || filling);

    // bajo: sigue la fundamental del acorde del compás
    const chord = t.chords[bar];
    const b = t.bass[i];
    if (b >= 0) {
      playNote(c, time, st(chord[0] + b, t.root), stepDur * 2.2, t.bassType, 0.17, { cutoff: 480 });
    }
    // arpegio melódico con eco
    const a = t.arp[i];
    if (a >= 0) {
      const oct = Math.floor(a / 3);
      const tone = chord[a % 3] + 12 * oct;
      playNote(c, time, st(tone, t.root * 4), stepDur * 2.6, t.arpType, 0.05, {
        reverb: 0.35,
        delay: 0.4,
        cutoff: t.arpType === "square" ? 1500 : 3200,
      });
    }
    // pad al inicio de cada compás
    if (i === 0) playPad(c, time, chord, t.root, barDur, t.padLevel);

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
  nextTime = c.currentTime + 0.08;
  if (delayNode) delayNode.delayTime.value = Math.min(1.4, (60 / def.bpm) * 0.75); // corchea con puntillo
  startDrone(def);
  timer = setInterval(scheduler, 40);
  notify();
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  stopDrone();
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
  if (master && ctx) master.gain.setTargetAtTime(volume * 0.55, ctx.currentTime, 0.05);
  notify();
}

export function getMusicVolume(): number {
  return volume;
}

export function subscribeMusic(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

// v31 — AUTOPLAY: si el usuario dejó la radio encendida, arranca en el primer
// gesto (los navegadores bloquean el audio sin interacción). Devuelve true si
// reanudó la reproducción.
export function resumeMusicIfWanted(): boolean {
  if (typeof window === "undefined" || isMusicPlaying()) return false;
  try {
    const raw = localStorage.getItem("vanguard_music");
    if (!raw) return false;
    const p = JSON.parse(raw) as { on?: boolean; vol?: number; track?: string };
    if (p.on !== true) return false;
    if (typeof p.vol === "number") setMusicVolume(p.vol);
    startMusic(p.track || "marcha");
    return true;
  } catch {
    return false;
  }
}
