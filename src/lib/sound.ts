// Vanguard v109.0 — SONIDO VANGUARD v4: efectos de interfaz "dulces para los
// oídos" (Web Audio, sin assets). El comandante pidió una Vanguard que se
// escuche bien: adiós a los bips de onda cuadrada — ahora toca madera cálida,
// campanas FM con cola de sala y arpegios con séptima. Todo pasa por una
// mini-cadena compartida (HPF → ganancia → salida + reverb corta) para que la
// interfaz suene DENTRO del mismo mundo que la Radio.
import { resumeMusicIfWanted } from "@/lib/conflict-music";

let ctx: AudioContext | null = null;
let muted = false;
let sfxBus: GainNode | null = null;
let sfxVerb: ConvolverNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

// mini-cadena compartida: se construye la primera vez que suena un SFX
function bus(c: AudioContext): GainNode {
  if (!sfxBus) {
    sfxBus = c.createGain();
    sfxBus.gain.value = 0.9;
    const hpf = c.createBiquadFilter();
    hpf.type = "highpass";
    hpf.frequency.value = 60;
    sfxBus.connect(hpf);
    hpf.connect(c.destination);
    // reverb corta y clara (la interfaz vive en la misma sala que la música)
    try {
      const dur = 1.3;
      const len = Math.floor(c.sampleRate * dur);
      const ir = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = ir.getChannelData(ch);
        let lp = 0;
        for (let i = 0; i < len; i++) {
          const x = i / len;
          const n = Math.random() * 2 - 1;
          lp += (0.55 - 0.35 * x) * (n - lp);
          d[i] = lp * Math.pow(1 - x, 2.8);
        }
      }
      sfxVerb = c.createConvolver();
      sfxVerb.buffer = ir;
      const wet = c.createGain();
      wet.gain.value = 0.22;
      sfxVerb.connect(wet);
      wet.connect(sfxBus);
    } catch { /* sin reverb, no pasa nada */ }
  }
  return sfxBus;
}

function sendVerb(c: AudioContext, node: AudioNode, amount: number) {
  if (sfxVerb && amount > 0) {
    const g = c.createGain();
    g.gain.value = amount;
    node.connect(g);
    g.connect(sfxVerb);
  }
}

export function setMuted(m: boolean) {
  muted = m;
  try {
    localStorage.setItem("vanguard-muted", m ? "1" : "0");
  } catch {}
}

export function isMuted() {
  if (typeof window === "undefined") return false;
  try {
    return muted || localStorage.getItem("vanguard-muted") === "1";
  } catch {
    return muted;
  }
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.08, when = 0, verb = 0.08) {
  const c = getCtx();
  if (!c || isMuted()) return;
  try {
    if (c.state === "suspended") c.resume();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = c.currentTime + when;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(bus(c));
    sendVerb(c, g, verb);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  } catch {}
}

// v109: toque de madera — triangle con caída de tono + tick de ruido
function playWood(freq: number, duration: number, gain = 0.05, when = 0) {
  const c = getCtx();
  if (!c || isMuted()) return;
  try {
    if (c.state === "suspended") c.resume();
    const t0 = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(freq * 1.04, t0);
    o.frequency.exponentialRampToValueAtTime(freq, t0 + duration * 0.6);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    o.connect(g);
    g.connect(bus(c));
    sendVerb(c, g, 0.1);
    o.start(t0);
    o.stop(t0 + duration + 0.05);
    const len = Math.floor(c.sampleRate * 0.012);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource();
    s.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = freq * 4;
    const sg = c.createGain();
    sg.gain.setValueAtTime(gain * 0.5, t0);
    sg.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.012);
    s.connect(f);
    f.connect(sg);
    sg.connect(bus(c));
    s.start(t0);
  } catch {}
}

// v109: campana FM (la misma familia de la Voz Dorada de la Radio)
function playBell(freq: number, duration: number, gain = 0.05, when = 0) {
  const c = getCtx();
  if (!c || isMuted()) return;
  try {
    if (c.state === "suspended") c.resume();
    const t0 = c.currentTime + when;
    const car = c.createOscillator();
    const mod = c.createOscillator();
    const modG = c.createGain();
    const g = c.createGain();
    car.type = "sine";
    car.frequency.value = freq;
    mod.type = "sine";
    mod.frequency.value = freq * 2.005;
    modG.gain.setValueAtTime(freq * 1.8, t0);
    modG.gain.exponentialRampToValueAtTime(freq * 0.15, t0 + Math.min(0.3, duration));
    mod.connect(modG);
    modG.connect(car.frequency);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    car.connect(g);
    g.connect(bus(c));
    sendVerb(c, g, 0.3);
    car.start(t0);
    mod.start(t0);
    car.stop(t0 + duration + 0.1);
    mod.stop(t0 + duration + 0.1);
  } catch {}
}

function playNoise(duration: number, gain = 0.05, when = 0) {
  const c = getCtx();
  if (!c || isMuted()) return;
  try {
    if (c.state === "suspended") c.resume();
    const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const g = c.createGain();
    const t0 = c.currentTime + when;
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    src.connect(filter);
    filter.connect(g);
    g.connect(bus(c));
    sendVerb(c, g, 0.1);
    src.start(t0);
    src.stop(t0 + duration);
  } catch {}
}

export const sfx = {
  // v109: toque de madera suave (antes: bip cuadrado)
  click: () => playWood(520, 0.045, 0.045),
  hover: () => playTone(740, 0.02, "sine", 0.012, 0, 0.03),
  // v109: acorde add9 con campanas — el "bien hecho" de Vanguard
  success: () => {
    playBell(523.25, 0.16, 0.05);
    playBell(659.25, 0.16, 0.05, 0.08);
    playBell(783.99, 0.16, 0.05, 0.16);
    playBell(1174.66, 0.3, 0.045, 0.24); // re + octava: el color dulce
  },
  // v109: doble golpe grave de madera — avisa sin rasgar
  error: () => {
    playWood(210, 0.14, 0.05);
    playWood(168, 0.18, 0.045, 0.09);
  },
  coin: () => {
    playBell(987.77, 0.09, 0.04);
    playBell(1318.51, 0.14, 0.04, 0.05);
  },
  // v26 SONIDO ESPECIAL de recompensa — v109: campanas con destello
  reward: () => {
    playBell(1046.5, 0.1, 0.045);
    playBell(1318.51, 0.1, 0.045, 0.06);
    playBell(1567.98, 0.1, 0.045, 0.12);
    playBell(2093.0, 0.24, 0.05, 0.18);
    playBell(3135.96, 0.3, 0.025, 0.22); // destello
  },
  levelUp: () => {
    playBell(523.25, 0.14, 0.055);
    playBell(659.25, 0.14, 0.055, 0.08);
    playBell(783.99, 0.14, 0.055, 0.16);
    playBell(1046.5, 0.34, 0.06, 0.24);
  },
  // v109: aviso de dos notas con vibrato suave — urgente pero no agresivo
  alarm: () => {
    playTone(660, 0.13, "sine", 0.045);
    playTone(528, 0.15, "sine", 0.045, 0.17);
  },
  unlock: () => {
    playNoise(0.15, 0.035);
    playBell(880, 0.14, 0.045, 0.05);
  },
  achievement: () => {
    playBell(659.25, 0.12, 0.055);
    playBell(880, 0.12, 0.055, 0.06);
    playBell(1108.73, 0.28, 0.06, 0.12);
  },
  tab: () => playWood(330, 0.04, 0.03),
  beep: () => playTone(1200, 0.04, "sine", 0.025),
  streak: () => {
    for (let i = 0; i < 4; i++) playBell(440 + i * 110, 0.1, 0.04, i * 0.06);
  },
  // ---- Dron Strike 3D ----
  droneFire: () => {
    playNoise(0.07, 0.04);
    playTone(300, 0.1, "sawtooth", 0.04);
    playTone(180, 0.12, "sine", 0.035, 0.02);
  },
  droneExplosion: () => {
    playNoise(0.32, 0.07);
    playTone(85, 0.3, "triangle", 0.055);
    playTone(60, 0.36, "sine", 0.05, 0.04);
  },
  droneHit: (combo: number) => {
    const base = 620 + Math.min(5, combo) * 105;
    playBell(base, 0.07, 0.04);
    playBell(base * 1.5, 0.1, 0.035, 0.05);
  },
  droneEnd: () => {
    playBell(523.25, 0.11, 0.05);
    playBell(659.25, 0.11, 0.05, 0.09);
    playBell(783.99, 0.11, 0.05, 0.18);
    playBell(1046.5, 0.3, 0.055, 0.27);
  },
  droneLeak: () => {
    playTone(160, 0.16, "triangle", 0.04);
  },
};

export function initSound() {
  // resume on first user gesture
  if (typeof window === "undefined") return;
  const resume = () => {
    const c = getCtx();
    if (c && c.state === "suspended") c.resume();
    // si el usuario dejó RADIO VANGUARD encendida, suena al primer gesto
    resumeMusicIfWanted();
  };
  window.addEventListener("click", resume, { once: true });
  window.addEventListener("keydown", resume, { once: true });
  // load mute state
  try {
    muted = localStorage.getItem("vanguard-muted") === "1";
  } catch {}
}
