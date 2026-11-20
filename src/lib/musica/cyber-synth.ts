// ============================================================
// VANGUARD · GENERADOR AMBIENTAL CYBERSYNTH (v423.0)
//
// Motor Web Audio nativo para música ambiental hiperfuturista.
// Cero ruidos molestos de estática o sirenas: genera pads cálidos analógicos,
// arpegios espaciales y drones cinemáticos en escala menor/dórica.
// ============================================================

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let osciladores: OscillatorNode[] = [];
let intervaloArpegio: number | null = null;
let sonando = false;

// Frecuencias para acordes cyberpunk atmosféricos (Am9 / Fmaj7 / Cmaj7 / Em)
const ACORDES = [
  [110.0, 164.81, 220.0, 261.63, 329.63], // A2, E3, A3, C4, E4
  [87.31, 130.81, 174.61, 220.0, 261.63],  // F2, C3, F3, A3, C4
  [130.81, 196.0, 261.63, 329.63, 392.0],  // C3, G3, C4, E4, G4
  [82.41, 123.47, 164.81, 246.94, 329.63], // E2, B2, E3, B3, E4
];

export function iniciarCyberSynth(volumen = 0.35) {
  if (sonando) return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, volumen), ctx.currentTime + 3);

    // Filtro pasa-bajos cálido para sonido analógico de sintetizador
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(750, ctx.currentTime);
    filter.Q.setValueAtTime(2.5, ctx.currentTime);

    // Modulación lenta de corte de filtro (LFO)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(320, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    masterGain.connect(filter);
    filter.connect(ctx.destination);

    let indiceAcorde = 0;

    function tocarAcorde(notas: number[]) {
      if (!ctx || !masterGain) return;

      // Desvanecer osciladores viejos
      osciladores.forEach((osc) => {
        try {
          osc.stop(ctx!.currentTime + 1.5);
        } catch {}
      });
      osciladores = [];

      notas.forEach((freq, idx) => {
        const osc = ctx!.createOscillator();
        const oscGain = ctx!.createGain();

        // Onda diente de sierra suave con leve desafinación estéreo para grosor
        osc.type = idx === 0 ? "triangle" : "sawtooth";
        const detune = (idx - 2) * 5; // Detune de +-10 cents
        osc.frequency.setValueAtTime(freq, ctx!.currentTime);
        osc.detune.setValueAtTime(detune, ctx!.currentTime);

        const gananciaNota = idx === 0 ? 0.28 : 0.08 / Math.sqrt(idx);
        oscGain.gain.setValueAtTime(0.001, ctx!.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(gananciaNota, ctx!.currentTime + 2.5);

        osc.connect(oscGain);
        oscGain.connect(masterGain!);
        osc.start();
        osciladores.push(osc);
      });
    }

    // Arrancar primer acorde
    tocarAcorde(ACORDES[0]);

    // Progresión cíclica lenta cada 8 segundos
    const cambioRef = window.setInterval(() => {
      indiceAcorde = (indiceAcorde + 1) % ACORDES.length;
      tocarAcorde(ACORDES[indiceAcorde]);
    }, 8000);

    intervaloArpegio = cambioRef;
    sonando = true;
  } catch (err) {
    console.error("No se pudo iniciar el sintetizador ambiental:", err);
  }
}

export function pararCyberSynth() {
  if (!sonando) return;

  if (intervaloArpegio) {
    window.clearInterval(intervaloArpegio);
    intervaloArpegio = null;
  }

  if (masterGain && ctx) {
    try {
      masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      setTimeout(() => {
        osciladores.forEach((osc) => {
          try {
            osc.stop();
          } catch {}
        });
        osciladores = [];
        if (ctx) {
          void ctx.close();
          ctx = null;
        }
      }, 1600);
    } catch {
      if (ctx) void ctx.close();
    }
  }

  sonando = false;
}

export function setVolumenCyberSynth(v: number) {
  if (masterGain && ctx) {
    try {
      masterGain.gain.setTargetAtTime(Math.max(0.001, Math.min(1, v)), ctx.currentTime, 0.1);
    } catch {}
  }
}

export function estaCyberSynthSonando(): boolean {
  return sonando;
}
