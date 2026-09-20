// Vanguard — Sound system using Web Audio API (no external assets)

let ctx: AudioContext | null = null;
let muted = false;

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

function playTone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.08, when = 0) {
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
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
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
    g.connect(c.destination);
    src.start(t0);
    src.stop(t0 + duration);
  } catch {}
}

export const sfx = {
  click: () => playTone(440, 0.05, "square", 0.04),
  hover: () => playTone(660, 0.02, "sine", 0.02),
  success: () => {
    playTone(523.25, 0.1, "sine", 0.06);
    playTone(659.25, 0.1, "sine", 0.06, 0.08);
    playTone(783.99, 0.18, "sine", 0.06, 0.16);
  },
  error: () => {
    playTone(220, 0.15, "sawtooth", 0.05);
    playTone(180, 0.2, "sawtooth", 0.05, 0.1);
  },
  coin: () => {
    playTone(987.77, 0.06, "square", 0.04);
    playTone(1318.51, 0.08, "square", 0.04, 0.05);
  },
  // v26: SONIDO ESPECIAL por cada recompensa ganada — lluvia de monedas con
  // destello (arpegio ascendente + brillo). Se dispara automáticamente en
  // addCoins() con un pequeño throttle para no saturar en rachas.
  reward: () => {
    playTone(1046.5, 0.07, "triangle", 0.05); // do
    playTone(1318.51, 0.07, "triangle", 0.05, 0.06); // mi
    playTone(1567.98, 0.07, "triangle", 0.05, 0.12); // sol
    playTone(2093.0, 0.16, "triangle", 0.06, 0.18); // do alto
    playTone(3135.96, 0.2, "sine", 0.03, 0.2); // destello
  },
  levelUp: () => {
    playTone(523.25, 0.1, "triangle", 0.07);
    playTone(659.25, 0.1, "triangle", 0.07, 0.08);
    playTone(783.99, 0.1, "triangle", 0.07, 0.16);
    playTone(1046.5, 0.25, "triangle", 0.08, 0.24);
  },
  alarm: () => {
    playTone(880, 0.12, "sawtooth", 0.05);
    playTone(880, 0.12, "sawtooth", 0.05, 0.18);
  },
  unlock: () => {
    playNoise(0.15, 0.04);
    playTone(880, 0.1, "sine", 0.05, 0.05);
  },
  achievement: () => {
    playTone(659.25, 0.08, "triangle", 0.07);
    playTone(880, 0.08, "triangle", 0.07, 0.06);
    playTone(1108.73, 0.18, "triangle", 0.08, 0.12);
  },
  tab: () => playTone(330, 0.04, "sine", 0.03),
  beep: () => playTone(1200, 0.04, "square", 0.03),
  streak: () => {
    for (let i = 0; i < 4; i++) playTone(440 + i * 110, 0.08, "triangle", 0.05, i * 0.06);
  },
  // ---- Dron Strike 3D ----
  droneFire: () => {
    // lanzamiento: soplido de aire + tono grave corto
    playNoise(0.07, 0.045);
    playTone(300, 0.1, "sawtooth", 0.045);
    playTone(180, 0.12, "sine", 0.04, 0.02);
  },
  droneExplosion: () => {
    // detonacion: estallido grave con doble cola
    playNoise(0.32, 0.085);
    playTone(85, 0.3, "sawtooth", 0.06);
    playTone(60, 0.36, "sine", 0.05, 0.04);
  },
  droneHit: (combo: number) => {
    // confirmacion que sube de tono con el combo (hasta x5)
    const base = 620 + Math.min(5, combo) * 105;
    playTone(base, 0.06, "square", 0.045);
    playTone(base * 1.5, 0.09, "square", 0.04, 0.05);
  },
  droneEnd: () => {
    // fanfarria de fin de mision
    playTone(523.25, 0.09, "triangle", 0.06);
    playTone(659.25, 0.09, "triangle", 0.06, 0.09);
    playTone(783.99, 0.09, "triangle", 0.06, 0.18);
    playTone(1046.5, 0.22, "triangle", 0.07, 0.27);
  },
  droneLeak: () => {
    // objetivo que escapa: alerta baja
    playTone(160, 0.16, "sawtooth", 0.04);
  },
};

export function initSound() {
  // resume on first user gesture
  if (typeof window === "undefined") return;
  const resume = () => {
    const c = getCtx();
    if (c && c.state === "suspended") c.resume();
  };
  window.addEventListener("click", resume, { once: true });
  window.addEventListener("keydown", resume, { once: true });
  // load mute state
  try {
    muted = localStorage.getItem("vanguard-muted") === "1";
  } catch {}
}
