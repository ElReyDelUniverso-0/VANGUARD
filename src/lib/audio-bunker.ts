// ============================================================
// v135.0 NEXUS-HYPNOS — SONIDO DEL BÚNKER (War Room Ambient)
// "The War Room Ambient": un sintetizador generativo 100% Web
// Audio (cero assets, cero derechos) que dota a Vanguard de
// una atmósfera sonora viva. El drone grave respira, la
// estática de satélite chisporrotea y una estación numérica
// militar emite códigos difusos al fondo. TODO reacciona al
// PULSO GLOBAL (tension.ts 0-100):
//   · tensión baja  → drone lento y azul, estática mínima
//   · tensión alta  → filtro se abre, drone se afina arriba,
//                     la estática muerde y los códigos suenan
//                     más seguido (búnker en alerta)
// Contrato de la casa: se arranca SOLO con gesto del usuario
// (política de autoplay de los navegadores) y el nivel se
// desliza siempre con rampas (nunca clics secos).
// ============================================================

type Grafo = {
  ctx: AudioContext;
  master: GainNode;
  droneA: OscillatorNode;
  droneB: OscillatorNode;
  sub: OscillatorNode;
  filtroDrone: BiquadFilterNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
  estatica: AudioBufferSourceNode;
  filtroEstatica: BiquadFilterNode;
  gananciaEstatica: GainNode;
  temporizador: number;
};

let grafo: Grafo | null = null;
/** nivel de tensión normalizado 0-1 que alimenta el motor */
let nivel = 0.62;

// la estación numérica militar: alturas frías y espaciadas
const CODIGOS = [523.25, 622.25, 698.46, 783.99, 932.33, 1046.5];

function crearRuido(ctx: AudioContext): AudioBuffer {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** un código de la estación numérica: pitido filtrado con paneo aleatorio */
function emitirCodigo(g: Grafo) {
  const ctx = g.ctx;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = CODIGOS[Math.floor(Math.random() * CODIGOS.length)];
  const gan = ctx.createGain();
  gan.gain.setValueAtTime(0.0001, t);
  gan.gain.exponentialRampToValueAtTime(0.05 + nivel * 0.07, t + 0.06);
  gan.gain.exponentialRampToValueAtTime(0.0001, t + 0.5 + nivel * 0.4);
  const pan = ctx.createStereoPanner();
  pan.pan.value = Math.random() * 1.6 - 0.8;
  const filtro = ctx.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.frequency.value = osc.frequency.value;
  filtro.Q.value = 6;
  osc.connect(filtro).connect(gan).connect(pan).connect(g.master);
  osc.start(t);
  osc.stop(t + 1.2 + nivel * 0.5);
}

/** ¿el búnker está sonando ahora mismo? */
export function bunkerActivo(): boolean {
  return grafo !== null;
}

/** Arranca la atmósfera. Devuelve true si logró arrancar (requiere gesto previo). */
export function iniciarBunker(): boolean {
  if (grafo) return true;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    void ctx.resume();

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    // la cadena de estudio: compresor suave para que nada muerda
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -24;
    comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
    master.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 2.2);

    // ---- DRONE: dos sierras desafinadas + filtro con deriva ----
    const filtroDrone = ctx.createBiquadFilter();
    filtroDrone.type = "lowpass";
    filtroDrone.frequency.value = 220;
    filtroDrone.Q.value = 7;
    const ganDrone = ctx.createGain();
    ganDrone.gain.value = 0.5;
    filtroDrone.connect(ganDrone).connect(master);

    const droneA = ctx.createOscillator();
    droneA.type = "sawtooth";
    droneA.frequency.value = 55;
    droneA.detune.value = -6;
    const droneB = ctx.createOscillator();
    droneB.type = "sawtooth";
    droneB.frequency.value = 55;
    droneB.detune.value = 7;
    droneA.connect(filtroDrone);
    droneB.connect(filtroDrone);

    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = 27.5;
    const ganSub = ctx.createGain();
    ganSub.gain.value = 0.34;
    sub.connect(ganSub).connect(master);

    // la respiración del filtro (LFO lento, la casa nunca es estática)
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 55;
    lfo.connect(lfoGain).connect(filtroDrone.frequency);

    // ---- ESTÁTICA DE SATÉLITE ----
    const estatica = ctx.createBufferSource();
    estatica.buffer = crearRuido(ctx);
    estatica.loop = true;
    const filtroEstatica = ctx.createBiquadFilter();
    filtroEstatica.type = "bandpass";
    filtroEstatica.frequency.value = 1600;
    filtroEstatica.Q.value = 0.7;
    const gananciaEstatica = ctx.createGain();
    gananciaEstatica.gain.value = 0.015;
    estatica.connect(filtroEstatica).connect(gananciaEstatica).connect(master);

    droneA.start();
    droneB.start();
    sub.start();
    lfo.start();
    estatica.start();

    const g: Grafo = {
      ctx, master, droneA, droneB, sub, filtroDrone, lfo, lfoGain,
      estatica, filtroEstatica, gananciaEstatica,
      temporizador: 0,
    };
    // estación numérica: frecuencia de emisión según la tensión
    const programar = () => {
      if (!grafo) return;
      emitirCodigo(grafo);
      const espera = 4200 - nivel * 2900 + Math.random() * 1400;
      grafo.temporizador = window.setTimeout(programar, espera);
    };
    grafo = g;
    g.temporizador = window.setTimeout(programar, 1800);

    // sintoniza con el nivel actual
    setNivelBunker(nivel);
    return true;
  } catch {
    return false;
  }
}

/** Apaga con desvanecimiento honesto (no corta el sonido en seco). */
export function pararBunker() {
  const g = grafo;
  if (!g) return;
  grafo = null;
  window.clearTimeout(g.temporizador);
  try {
    g.master.gain.cancelScheduledValues(g.ctx.currentTime);
    g.master.gain.setValueAtTime(Math.max(g.master.gain.value, 0.0001), g.ctx.currentTime);
    g.master.gain.exponentialRampToValueAtTime(0.0001, g.ctx.currentTime + 0.9);
    window.setTimeout(() => {
      try {
        g.droneA.stop(); g.droneB.stop(); g.sub.stop(); g.lfo.stop(); g.estatica.stop();
        void g.ctx.close();
      } catch { /* ya cerrado */ }
    }, 1100);
  } catch { /* noop */ }
}

/** El pulso del planeta alimenta al búnker (0-1). Rampas de 2s, nunca saltos. */
export function setNivelBunker(v: number) {
  nivel = Math.max(0, Math.min(1, v));
  const g = grafo;
  if (!g) return;
  try {
    const t = g.ctx.currentTime;
    const rampa = 2.0;
    // el drone se afina hacia arriba con la tensión (55 → 84 Hz)
    g.droneA.frequency.linearRampToValueAtTime(55 + nivel * 26, t + rampa);
    g.droneB.frequency.linearRampToValueAtTime(55 + nivel * 29, t + rampa);
    // el filtro se abre: el búnker "despierta"
    g.filtroDrone.frequency.linearRampToValueAtTime(200 + nivel * 1100, t + rampa);
    // la estática muerde
    g.gananciaEstatica.gain.linearRampToValueAtTime(0.012 + nivel * 0.055, t + rampa);
    g.filtroEstatica.frequency.linearRampToValueAtTime(1300 + nivel * 2400, t + rampa);
  } catch { /* noop */ }
}
