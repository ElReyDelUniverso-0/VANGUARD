// ============================================================
// v117.0 ATMÓSFERA — VOZ DE LA CIUDAD
// El comandante pidió que la megalópolis SUENE: tráfico lejano
// por franja horaria, aire, y los pitidos lejanos de una ciudad
// viva. Audio 100% PROCEDURAL — síntesis WebAudio en vivo, cero
// muestras, cero copyright (regla de oro de la casa: todo el
// sonido de Vanguard nace aquí, no se importa).
//   · HUMO DEL TRÁFICO — ruido marrón filtrado en grave; la
//     intensidad obedece a la fase real del día (de noche la
//     ciudad casi calla; al mediodía resopla).
//   · AIRE DE LA MESETA — banda ancha muy tenue que nunca para.
//   · EVENTOS LEJANOS — pitidos suaves aleatorios (tranvía,
//     sirena a tres manzanas) cada 9–17 s.
//   · Fundido de entrada 2 s / salida 0.8 s. Respeta el MUTE
//     global de la casa (no arranca si está silenciado).
// Contrato 60 FPS: cero rAF — todo vive dentro del AudioContext.
// ============================================================

import type { FaseDia } from "@/components/vanguard/megalopolis";

interface NodosAmbiente {
  master: GainNode;
  humo: AudioBufferSourceNode;
  aire: AudioBufferSourceNode;
  ganHumo: GainNode;
  eventoIv: ReturnType<typeof setInterval> | null;
}

let ctx: AudioContext | null = null;
let nodos: NodosAmbiente | null = null;

/** volumen del tráfico según la fase real del día */
const GAN_HUMO: Record<FaseDia, number> = {
  noche: 0.045,
  alba: 0.07,
  dia: 0.11,
  ocaso: 0.09,
};

function bufferRuido(ac: AudioContext, seg: number, tipo: "marron" | "blanco"): AudioBuffer {
  const n = Math.floor(ac.sampleRate * seg);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < n; i++) {
    const w = Math.random() * 2 - 1;
    if (tipo === "marron") {
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.2;
    } else {
      d[i] = w;
    }
  }
  return buf;
}

export function ambienteActivo(): boolean {
  return nodos !== null;
}

/** Arranca la voz de la ciudad. Devuelve false si el mute de la casa lo impide. */
export async function arrancarAmbiente(fase: FaseDia): Promise<boolean> {
  try {
    const { isMuted } = await import("@/lib/sound");
    if (isMuted()) return false;
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") await ctx.resume();
    if (nodos) return true;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // HUMO DEL TRÁFICO — ruido marrón → lowpass grave: el tráfico a tres calles
    const humo = ctx.createBufferSource();
    humo.buffer = bufferRuido(ctx, 4, "marron");
    humo.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 210;
    lp.Q.value = 0.4;
    const ganHumo = ctx.createGain();
    ganHumo.gain.value = GAN_HUMO[fase];
    humo.connect(lp);
    lp.connect(ganHumo);
    ganHumo.connect(master);
    humo.start();

    // AIRE — banda ancha tenue: la respiración de la meseta
    const aire = ctx.createBufferSource();
    aire.buffer = bufferRuido(ctx, 4, "blanco");
    aire.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 620;
    bp.Q.value = 0.5;
    const ganAire = ctx.createGain();
    ganAire.gain.value = 0.012;
    aire.connect(bp);
    bp.connect(ganAire);
    ganAire.connect(master);
    aire.start();

    // EVENTOS LEJANOS — pitidos suaves cada 9–17 s
    const eventoIv: ReturnType<typeof setInterval> = setInterval(() => {
      if (!ctx || !nodos) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "sine";
      const f = 540 + Math.random() * 380;
      o.frequency.setValueAtTime(f, t);
      o.frequency.linearRampToValueAtTime(f * (Math.random() < 0.5 ? 0.82 : 1.18), t + 0.9);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.018, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      o.connect(g);
      g.connect(master);
      o.start(t);
      o.stop(t + 1.5);
    }, 9000 + Math.random() * 8000);

    nodos = { master, humo, aire, ganHumo, eventoIv };
    master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2); // fundido de entrada
    return true;
  } catch {
    return false;
  }
}

/** Reafina el volumen del tráfico cuando cambia la fase del día */
export function faseAmbiente(fase: FaseDia): void {
  if (!ctx || !nodos) return;
  try {
    nodos.ganHumo.gain.linearRampToValueAtTime(GAN_HUMO[fase], ctx.currentTime + 1.5);
  } catch {
    /* contexto cerrado: silencio honesto */
  }
}

/** Para la voz de la ciudad con fundido de salida */
export function pararAmbiente(): void {
  if (!ctx || !nodos) return;
  const n = nodos;
  nodos = null;
  try {
    const t = ctx.currentTime;
    n.master.gain.cancelScheduledValues(t);
    n.master.gain.setValueAtTime(n.master.gain.value, t);
    n.master.gain.linearRampToValueAtTime(0, t + 0.8);
  } catch {
    /* ya muerto */
  }
  setTimeout(() => {
    try {
      if (n.eventoIv !== null) clearInterval(n.eventoIv);
      n.humo.stop();
      n.aire.stop();
    } catch {
      /* ya parado */
    }
  }, 900);
}
