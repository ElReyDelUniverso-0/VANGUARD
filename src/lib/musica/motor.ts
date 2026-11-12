"use client";

// ============================================================
// v367.3 LA MÚSICA CON FORMA — EL RELOJ DE HIERRO (lib/musica/motor.ts)
//
// El motor que toca las piezas de piezas.ts. Tres cosas que el motor viejo
// no garantizaba y que son exactamente lo que el Dueño oyó como «se
// deforma con el tiempo»:
//
//  ① TIEMPO ABSOLUTO, NO ACUMULADO. Cada nota se agenda en
//     `ancla + paso × duración`, jamás en «un poquito después de la
//     anterior». Sumar retardos es lo que desafina una pieza larga.
//  ② MIRADA ADELANTADA. Se agenda 1,2 s por delante cada 90 ms: el reloj
//     del navegador nunca llega tarde a la cita.
//  ③ RESYNC EN COMPÁS. Si la pestaña se durmió (móvil en segundo plano),
//     el motor NO corre para alcanzarse: salta al compás siguiente limpio
//     y sigue. Antes eso sonaba a «se rompe».
//
// Cero samples, cero archivos, cero red: todo se sintetiza con osciladores
// y ruido del propio aparato. Por eso no hay copia posible: la música se
// fabrica aquí.
// ============================================================

import {
  PASOS_POR_COMPAS,
  armarForma,
  duracionPaso,
  frecuencia,
  instanteDePaso,
  semitonosDeGrado,
  type Capa,
  type Compas,
  type Pieza,
} from "./forma";
import { piezaPorId } from "./piezas";

export interface EstadoMotor {
  sonando: string | null;
  compas: number;
  seccion: string;
  vuelta: number;
}

const MIRADA_S = 1.2;
const TICK_MS = 90;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverb: ConvolverNode | null = null;
let salidaReverb: GainNode | null = null;
let timer: number | null = null;
let pieza: Pieza | null = null;
let forma: Compas[] = [];
let ancla = 0;
let pasoDesdeAncla = 0;
let pasoGlobal = 0;
let vuelta = 0;
let volumen = 0.42;
let resyncs = 0;
let oyentes = new Set<(e: EstadoMotor) => void>();

function avisar() {
  const e: EstadoMotor = {
    sonando: pieza?.id ?? null,
    compas: Math.floor(pasoGlobal / PASOS_POR_COMPAS),
    seccion: forma[Math.floor(pasoGlobal / PASOS_POR_COMPAS) % Math.max(1, forma.length)]?.nombre ?? "—",
    vuelta,
  };
  for (const f of oyentes) {
    try {
      f(e);
    } catch {
      /* un oyente roto no tumba la música */
    }
  }
}

export function alCambiarMotor(f: (e: EstadoMotor) => void): () => void {
  oyentes.add(f);
  f({ sonando: pieza?.id ?? null, compas: 0, seccion: "—", vuelta: 0 });
  return () => {
    oyentes.delete(f);
  };
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = W.AudioContext || W.webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = volumen;
    // reverb corta y sintética: sala, no catedral (una cola larga emborrona)
    const len = Math.floor(ctx.sampleRate * 1.6);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const x = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - x, 2.6);
      }
    }
    reverb = ctx.createConvolver();
    reverb.buffer = buf;
    salidaReverb = ctx.createGain();
    salidaReverb.gain.value = 0.22;
    reverb.connect(salidaReverb);
    salidaReverb.connect(master);
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setVolumen(v: number) {
  volumen = Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0.42));
  if (master && ctx) master.gain.setTargetAtTime(volumen, ctx.currentTime, 0.1);
}

// ── Voces (cada instrumento es una función que agenda UN golpe) ──
function envolvente(g: GainNode, t: number, ataque: number, caida: number, pico: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, pico), t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + ataque + caida);
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

function aReverb(n: AudioNode, c: AudioContext, cantidad = 1) {
  if (!reverb) return;
  const g = c.createGain();
  g.gain.value = cantidad;
  n.connect(g);
  g.connect(reverb);
}

function nota(
  c: AudioContext,
  t: number,
  freq: number,
  tipo: OscillatorType,
  dur: number,
  pico: number,
  filtro?: { tipo: BiquadFilterType; hz: number; q?: number },
  rev = 0.6,
) {
  const o = c.createOscillator();
  o.type = tipo;
  o.frequency.value = freq;
  const g = c.createGain();
  let nodo: AudioNode = o;
  if (filtro) {
    const f = c.createBiquadFilter();
    f.type = filtro.tipo;
    f.frequency.value = filtro.hz;
    f.Q.value = filtro.q ?? 1;
    o.connect(f);
    nodo = f;
  }
  nodo.connect(g);
  g.connect(master!);
  aReverb(g, c, rev);
  envolvente(g, t, Math.min(0.08, dur * 0.35), dur, pico);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function golpePercusion(
  c: AudioContext,
  t: number,
  tipo: "bombo" | "caja" | "charles" | "platillo" | "timpano",
  pico: number,
  freqBase: number,
) {
  if (tipo === "bombo" || tipo === "timpano") {
    const o = c.createOscillator();
    o.type = "sine";
    const dur = tipo === "bombo" ? 0.22 : 0.45;
    o.frequency.setValueAtTime(freqBase * (tipo === "bombo" ? 2.2 : 1.6), t);
    o.frequency.exponentialRampToValueAtTime(freqBase * 0.55, t + dur);
    const g = c.createGain();
    envolvente(g, t, 0.004, dur, pico);
    o.connect(g);
    g.connect(master!);
    aReverb(g, c, tipo === "timpano" ? 0.9 : 0.25);
    o.start(t);
    o.stop(t + dur + 0.05);
    return;
  }
  const dur = tipo === "charles" ? 0.05 : tipo === "caja" ? 0.12 : 1.1;
  const s = ruido(c, dur + 0.05);
  const f = c.createBiquadFilter();
  f.type = tipo === "charles" ? "highpass" : "bandpass";
  f.frequency.value = tipo === "charles" ? 6500 : tipo === "caja" ? 1900 : 3200;
  f.Q.value = tipo === "caja" ? 0.9 : 0.6;
  const g = c.createGain();
  envolvente(g, t, 0.002, dur, pico);
  s.connect(f);
  f.connect(g);
  g.connect(master!);
  aReverb(g, c, tipo === "platillo" ? 1.2 : 0.35);
  s.start(t);
  s.stop(t + dur + 0.06);
}

function tocaCapa(c: AudioContext, capa: Capa, compas: Compas, t: number, durPaso: number, swing: number) {
  const esPerc = capa.inst === "bombo" || capa.inst === "caja" || capa.inst === "charles" || capa.inst === "platillo" || capa.inst === "timpano";
  const base = pieza?.raiz ?? 98;
  const acorde = compas.acorde;

  // los patrones vacíos son colchones: se sostienen el compás entero
  if (capa.patron.length === 0) {
    const t0 = t;
    const dur = durPaso * PASOS_POR_COMPAS;
    const notas = capa.inst === "coro" ? [acorde[0] ?? 0, acorde[2] ?? 7] : acorde.slice(0, 3);
    if (capa.inst === "platillo") {
      golpePercusion(c, t0, "platillo", capa.gain, base);
      return;
    }
    for (const semi of notas) {
      if (capa.inst === "pad") nota(c, t0, frecuencia(base, semi + 12), "sawtooth", dur, capa.gain * 0.16, { tipo: "lowpass", hz: 900, q: 0.7 }, 0.5);
      else if (capa.inst === "coro") nota(c, t0, frecuencia(base, semi + 24), "sine", dur, capa.gain * 0.2, { tipo: "lowpass", hz: 2400 }, 1.1);
      else if (capa.inst === "timpano") golpePercusion(c, t0, "timpano", capa.gain, frecuencia(base, semi));
    }
    return;
  }

  for (let i = 0; i < capa.patron.length; i++) {
    const grado = capa.patron[i];
    if (grado < 0) continue;
    // SWING MEDIDO: los pasos impares se retrasan una fracción fija del paso
    const desfase = swing > 0 && i % 2 === 1 ? durPaso * swing : 0;
    const tt = t + i * durPaso + desfase;
    const semi = semitonosDeGrado(acorde, grado);
    if (esPerc) {
      if (capa.inst === "timpano") golpePercusion(c, tt, "timpano", capa.gain, frecuencia(base, semi));
      else golpePercusion(c, tt, capa.inst as "bombo" | "caja" | "charles" | "platillo", capa.gain, base);
      continue;
    }
    if (capa.inst === "bajo") nota(c, tt, frecuencia(base, semi), "triangle", durPaso * 1.7, capa.gain * 0.5, { tipo: "lowpass", hz: 420 }, 0.15);
    else if (capa.inst === "arpa") nota(c, tt, frecuencia(base, semi + 12), "sine", durPaso * 2.4, capa.gain * 0.3, undefined, 0.9);
    else if (capa.inst === "metal") nota(c, tt, frecuencia(base, semi + 12), "sawtooth", durPaso * 1.4, capa.gain * 0.28, { tipo: "lowpass", hz: 2600, q: 1.4 }, 0.7);
    else if (capa.inst === "pad") nota(c, tt, frecuencia(base, semi + 12), "sawtooth", durPaso * 4, capa.gain * 0.14, { tipo: "lowpass", hz: 800 }, 0.6);
  }
}

// ── El planificador ──
function planificar() {
  const c = audio();
  if (!c || !pieza) return;
  const durPaso = duracionPaso(pieza.bpm);
  const ahora = c.currentTime;

  // resync: si el reloj del aparato se quedó atrás, saltamos al compás limpio
  const esperado = instanteDePaso(ancla, pasoDesdeAncla, pieza.bpm);
  if (esperado < ahora - durPaso * 6) {
    const compasBase = Math.ceil(pasoGlobal / PASOS_POR_COMPAS) * PASOS_POR_COMPAS;
    pasoGlobal = compasBase;
    pasoDesdeAncla = 0;
    ancla = ahora + 0.06;
    resyncs++;
  }

  while (instanteDePaso(ancla, pasoDesdeAncla, pieza.bpm) < ahora + MIRADA_S) {
    const t = instanteDePaso(ancla, pasoDesdeAncla, pieza.bpm);
    const totalPasos = forma.length * PASOS_POR_COMPAS;
    const idxForma = Math.floor(pasoGlobal / PASOS_POR_COMPAS) % Math.max(1, forma.length);
    const compas = forma[idxForma];
    if (compas) {
      for (const capa of pieza.secciones[compas.seccion]?.capas ?? []) {
        // cada capa toca el compás completo; el paso suelto se agenda desde el inicio del compás
        if (pasoDesdeAncla % PASOS_POR_COMPAS === 0) {
          tocaCapa(c, capa, compas, t, durPaso, pieza.swing);
        }
      }
    }
    pasoDesdeAncla += PASOS_POR_COMPAS;
    pasoGlobal += PASOS_POR_COMPAS;
    if (pasoGlobal >= totalPasos) {
      pasoGlobal = 0;
      vuelta++;
      avisar();
    }
  }
  avisar();
}

export function tocar(id: string, opciones: { volumen?: number } = {}): boolean {
  const c = audio();
  const p = piezaPorId(id);
  if (!c || !p) return false;
  pararMusica(false);
  pieza = p;
  forma = armarForma(p);
  pasoGlobal = 0;
  pasoDesdeAncla = 0;
  vuelta = 0;
  ancla = c.currentTime + 0.12;
  if (opciones.volumen !== undefined) setVolumen(opciones.volumen);
  if (master) master.gain.setTargetAtTime(volumen, c.currentTime, 0.15);
  timer = window.setInterval(planificar, TICK_MS);
  planificar();
  avisar();
  return true;
}

export function pararMusica(anunciar = true) {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  pieza = null;
  forma = [];
  if (ctx && master) master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
  if (anunciar) avisar();
}

export function musicaSonando(): string | null {
  return pieza?.id ?? null;
}

/** Diagnóstico honesto para la Torre: cuántas veces hubo que resincronizar. */
export function diagnosticoMotor(): { pieza: string | null; resyncs: number; paso: number; bpm: number } {
  return { pieza: pieza?.id ?? null, resyncs, paso: pasoGlobal, bpm: pieza?.bpm ?? 0 };
}
