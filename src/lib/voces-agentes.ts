"use client";

// ============================================================
// v196.0 LA VOZ QUE SE PROGRAMA — reescritura del motor sobre el
// Consejo de Voces v191. Por qué la voz anterior SE TRABABA y la
// cura, pieza por pieza:
//  · TEXTOS LARGOS EN UNA SOLA EMISIÓN — Chrome corta toda
//    utterance que pasa de ~15s y el onend NUNCA llega: la voz
//    muere a media frase (el «se traba» del Dueño). CURA: el texto
//    se trocea en frases ≤190 caracteres encadenadas sin costuras
//    (onend → siguiente trozo, con micro-pausas naturales).
//  · CANCEL() + SPEAK() EN EL MISMO LATIDO — Chrome se engancha y
//    escupe audio roto o se queda mudo. CURA: respiro de 70ms
//    entre el cancel() y el primer trozo nuevo.
//  · MUERTE SILENCIOSA — si un trozo nunca termina (motor mudo
//    tras un corte), nada seguía. CURA: VIGÍA anti-traba cada
//    2.5s — trozo que excede su tiempo estimado se salta y el
//    discurso SE CURA SOLO; aparato que pausó la voz la despierta.
//  · ROBÓTICA — el aparato sirve voces metálicas (eSpeak, Compact,
//    Pico) con el mismo derecho que las buenas. CURA: las malas
//    quedan penalizadas y las neuronales (Google, Natural,
//    Enhanced, Premium) mandan; pitch/rate humanos y calmados
//    (suave, sutil, voz que da gusto oír).
//  · PROGRAMABLE — LA VOZ SE PROGRAMA: cada persona elige voz
//    concreta, velocidad, tono, volumen y pausas desde el panel
//    de VG-ASSIST. Queda grabado en el aparato (vg196-voz-ajustes)
//    y MANDA sobre los perfiles del Consejo.
// Reglas de la casa intactas: UNA SOLA VOZ ACTIVA (la nueva orden
// corta a la anterior), RESPETA EL MUTE (src/lib/sound.ts), CERO
// servicios externos (síntesis del aparato), y la API v191 igual
// (hablarAgente / pararVoces / probarVoces / VOCES_ROSTER) para
// que cinemática, puerta de Vigo, portadas, briefing y despacho
// sigan hablando sin tocar una línea.
// ============================================================

import { isMuted } from "./sound";

export type VozAgenteId = "centinela" | "analista" | "assist" | "narrador";

export interface PerfilVoz {
  id: VozAgenteId;
  nombre: string;
  rol: string;
  color: string;
  frase: string;        // línea de identidad (prueba de voz / cinemática)
  pitch: number;
  rate: number;
  langs: string[];      // acento preferido en orden
  offset: number;       // posición al repartir voces distintas
}

// v196: pitch/rate CALMADOS — la v191 llevaba al Centinela a 0.72
// (grave metálico) y a VG-ASSIST a 1.06 (apresurado). Ahora todos
// viven cerca de lo humano: suave, pausado, cálido.
export const VOCES_ROSTER: Record<VozAgenteId, PerfilVoz> = {
  centinela: {
    id: "centinela",
    nombre: "CENTINELA",
    rol: "Radar de impacto · anuncios urgentes",
    color: "#FF3B30",
    frase: "Radar activo. Veinticuatro frentes vigilados. Nada pasa sin que yo lo vea.",
    pitch: 0.85,
    rate: 0.94,
    langs: ["es-ES", "es-MX", "es-419", "es-US", "es"],
    offset: 0,
  },
  analista: {
    id: "analista",
    nombre: "LA ANALISTA",
    rol: "Briefings y partes del día",
    color: "#38BDF8",
    frase: "El mundo no duerme. Yo tampoco. Aquí está lo que importa.",
    pitch: 1.1,
    rate: 0.97,
    langs: ["es-MX", "es-419", "es-ES", "es-US", "es"],
    offset: 1,
  },
  assist: {
    id: "assist",
    nombre: "VG-ASSIST",
    rol: "Tu agente de voz · órdenes y respuestas",
    color: "#E8C56A",
    frase: "A tu orden, comandante. Pregúntame lo que quieras del mundo.",
    pitch: 1.0,
    rate: 0.99,
    langs: ["es-ES", "es-419", "es-MX", "es-US", "es"],
    offset: 2,
  },
  narrador: {
    id: "narrador",
    nombre: "EL NARRADOR",
    rol: "El cronoteatro · parte del frente",
    color: "#3DDC97",
    frase: "Parte del frente. Día doce de campaña. El sector norte resiste.",
    pitch: 0.9,
    rate: 0.9,
    langs: ["es-ES", "es-ES", "es-MX", "es-419", "es"],
    offset: 3,
  },
};

// ── LA VOZ SE PROGRAMA: ajustes de la persona (mandan sobre todo) ──

export interface AjustesVoz {
  /** voiceURI elegida en el panel; null = AUTO (la mejor del aparato) */
  vozURI: string | null;
  /** multiplicador de velocidad del agente (0.7–1.3; 1 = la del agente) */
  velocidad: number;
  /** multiplicador de tono (0.75–1.25; 1 = el del agente) */
  tono: number;
  /** volumen global (0.3–1.0) */
  volumen: number;
  /** micro-pausas naturales entre frases (el respiro que la hace humana) */
  pausas: boolean;
}

const LS_AJUSTES = "vg196-voz-ajustes";
const AJUSTES_DEFECTO: AjustesVoz = { vozURI: null, velocidad: 1, tono: 1, volumen: 0.9, pausas: true };

let cacheAjustes: AjustesVoz | null = null;

function num(v: unknown, def: number, min: number, max: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : def;
  return Math.min(max, Math.max(min, n));
}
function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function leerAjustes(): AjustesVoz {
  if (cacheAjustes) return cacheAjustes;
  let a: AjustesVoz = { ...AJUSTES_DEFECTO };
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(LS_AJUSTES);
      if (raw) {
        const p = JSON.parse(raw) as Partial<AjustesVoz>;
        a = {
          vozURI: typeof p.vozURI === "string" && p.vozURI ? p.vozURI : null,
          velocidad: num(p.velocidad, 1, 0.7, 1.3),
          tono: num(p.tono, 1, 0.75, 1.25),
          volumen: num(p.volumen, 0.9, 0.3, 1),
          pausas: p.pausas !== false,
        };
      }
    } catch { /* ajustes rotos: los de la casa */ }
  }
  cacheAjustes = a;
  return a;
}

export function guardarAjustes(a: AjustesVoz): void {
  cacheAjustes = {
    vozURI: typeof a.vozURI === "string" && a.vozURI ? a.vozURI : null,
    velocidad: num(a.velocidad, 1, 0.7, 1.3),
    tono: num(a.tono, 1, 0.75, 1.25),
    volumen: num(a.volumen, 0.9, 0.3, 1),
    pausas: a.pausas !== false,
  };
  if (typeof window === "undefined") return;
  try { localStorage.setItem(LS_AJUSTES, JSON.stringify(cacheAjustes)); } catch {}
  try { window.dispatchEvent(new CustomEvent("vg:voz-ajustes")); } catch {}
}

export function restablecerAjustes(): void {
  guardarAjustes({ ...AJUSTES_DEFECTO });
}

// ── estado del aparato: las voces llegan TARDE en Chrome (evento) ──
let cacheVoces: SpeechSynthesisVoice[] = [];
let listenerPuesto = false;
let intentos = 0;

function ponerListener() {
  if (listenerPuesto || typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  listenerPuesto = true;
  const recarga = () => {
    try {
      cacheVoces = synth.getVoices() || [];
      intentos = 0;
    } catch { /* aparato sin voces: los perfiles usan pitch/rate */ }
  };
  recarga();
  try { synth.addEventListener?.("voiceschanged", recarga); } catch { /* viejo */ }
  // red de seguridad: algunos aparatos tardan >1s en poblar la lista
  const t = setInterval(() => {
    recarga();
    if (cacheVoces.length > 0 || ++intentos > 20) clearInterval(t);
  }, 500);
}

/** Voces ya cargadas (diagnóstico honesto para la UI). */
export function vocesCargadas(): number {
  ponerListener();
  return cacheVoces.length;
}

/** Voces en español disponibles en este aparato. */
function vocesEspanol(): SpeechSynthesisVoice[] {
  ponerListener();
  return cacheVoces.filter((v) => (v.lang || "").toLowerCase().replace("_", "-").startsWith("es"));
}

// v196: CALIDAD DE VOZ — la causa #1 del sonido robótico es que el
// aparato ofrece motores metálicos (eSpeak/Compact/Pico) al mismo
// nivel que las neuronales. Aquí las malas quedan fuera del podio.
function calidadNombre(nombre: string): number {
  const n = (nombre || "").toLowerCase();
  let s = 0.5;
  if (n.includes("google")) s = 3.0;                     // neuronales de Chrome
  else if (n.includes("natural")) s = 2.6;               // Microsoft Neural
  else if (n.includes("premium") || n.includes("enhanced")) s = 2.2;
  else if (/(estephania|paulina|monica|mónica|elvira|sabina|dalia|jorge|juan|alvaro|álvaro)/.test(n)) s = 2.0; // voces humanas conocidas
  else if (n.includes("microsoft")) s = 1.6;             // de escritorio
  else if (n.includes("loqueño") || n.includes("male") || n.includes("female")) s = 1.0;
  // PENALIZADOS — motores metálicos, la causa del robot
  if (n.includes("espeak") || n.includes("compact") || n.includes("pico") || n.includes("festival") || n.includes("robot")) s = -2;
  return s;
}

function etiquetaDe(calidad: number): VozLista["etiqueta"] {
  if (calidad >= 2.8) return "neuronal";
  if (calidad >= 2.4) return "natural";
  if (calidad >= 1.9) return "mejorada";
  if (calidad >= 0.9) return "sistema";
  return "básica";
}

export interface VozLista {
  uri: string;
  nombre: string;
  lang: string;
  etiqueta: "neuronal" | "natural" | "mejorada" | "sistema" | "básica";
  calidad: number;
}

/** Catálogo para el panel: español primero, luego por calidad. */
export function vocesLista(): VozLista[] {
  ponerListener();
  return [...cacheVoces]
    .map((v) => ({
      uri: v.voiceURI || v.name,
      nombre: v.name,
      lang: (v.lang || "").replace("_", "-"),
      calidad: calidadNombre(v.name),
      etiqueta: etiquetaDe(calidadNombre(v.name)),
    }))
    .sort((a, b) => {
      const esA = a.lang.toLowerCase().startsWith("es") ? 1 : 0;
      const esB = b.lang.toLowerCase().startsWith("es") ? 1 : 0;
      if (esA !== esB) return esB - esA;
      if (b.calidad !== a.calidad) return b.calidad - a.calidad;
      return a.nombre.localeCompare(b.nombre);
    });
}

/** Elige la voz del agente. LA ELEGIDA POR LA PERSONA MANDA. */
export function vozDeAgente(id: VozAgenteId): SpeechSynthesisVoice | null {
  ponerListener();
  const aj = leerAjustes();
  if (aj.vozURI) {
    const elegida = cacheVoces.find((v) => (v.voiceURI || v.name) === aj.vozURI);
    if (elegida) return elegida; // la voz programada manda sobre el Consejo
  }
  const pool = vocesEspanol();
  if (pool.length === 0) {
    // sin español: cualquier voz del aparato (pitch/rate siguen separando)
    return cacheVoces[0] || null;
  }
  const perfil = VOCES_ROSTER[id];
  const puntua = (v: SpeechSynthesisVoice): number => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const iLang = perfil.langs.findIndex((l) => lang.startsWith(l.toLowerCase()));
    return (iLang >= 0 ? 10 - iLang : 1) + calidadNombre(v.name);
  };
  const orden = [...pool].sort((a, b) => puntua(b) - puntua(a));
  // REPARTO: si hay ≥2 voces, cada agente toma una DIFERENTE de forma estable
  return orden[perfil.offset % orden.length] || null;
}

// ── TROCEO — la cura del «se traba»: Chrome corta emisiones largas ──

const TROZO_MAX = 190;

/** Parte en frases conservando el signo con su cierre («...» ). */
function partirFrases(t: string): string[] {
  const frases: string[] = [];
  let buf = "";
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    buf += ch;
    if (ch === "." || ch === "!" || ch === "?" || ch === "…" || ch === ";") {
      while (i + 1 < t.length && (t[i + 1] === '"' || t[i + 1] === "”" || t[i + 1] === "'" || t[i + 1] === ")")) {
        buf += t[++i];
      }
      frases.push(buf.trim());
      buf = "";
    }
  }
  if (buf.trim()) frases.push(buf.trim());
  return frases.filter(Boolean);
}

/** Frase demasiado larga → corte por coma/espacio, nunca a media palabra. */
function acortar(frase: string): string[] {
  if (frase.length <= TROZO_MAX) return [frase];
  const partes: string[] = [];
  let resto = frase;
  while (resto.length > TROZO_MAX) {
    let corte = -1;
    for (let i = TROZO_MAX; i >= 60; i--) {
      const ch = resto[i];
      if (ch === "," || ch === ":" || ch === "—") { corte = i + 1; break; }
    }
    if (corte < 0) {
      const esp = resto.lastIndexOf(" ", TROZO_MAX);
      corte = esp > 40 ? esp : TROZO_MAX;
    }
    partes.push(resto.slice(0, corte).trim());
    resto = resto.slice(corte).trim();
  }
  if (resto) partes.push(resto);
  return partes.filter(Boolean);
}

export function trocearTexto(texto: string): string[] {
  const limpio = (texto || "").replace(/\s+/g, " ").trim();
  if (!limpio) return [];
  const trozos: string[] = [];
  for (const f of partirFrases(limpio)) trozos.push(...acortar(f));
  return trozos;
}

// ── COLA DE HABLA — un trabajo = un texto troceado, encadenado ──

export interface HablarOpts {
  onend?: () => void;
  onerror?: () => void;
  /** false = encola detrás de la voz actual en vez de cortarla */
  interrumpir?: boolean;
}

interface Trabajo {
  id: VozAgenteId;
  trozos: string[];
  i: number;
  opts: HablarOpts;
  cancelado: boolean;
  timer: number | null;
  tokenTrozo: number;  // contra callbacks viejos tras cancel/salto
  inicioTrozo: number;
}

let actual: Trabajo | null = null;
let cola: Trabajo[] = [];
let vigia: number | null = null;

function pararVigia() {
  if (vigia !== null && typeof window !== "undefined") { clearInterval(vigia); }
  vigia = null;
}

function matar(t: Trabajo | null) {
  if (!t) return;
  t.cancelado = true;
  if (t.timer !== null && typeof window !== "undefined") { clearTimeout(t.timer); }
  t.timer = null;
}

function limpiarCola() {
  matar(actual);
  actual = null;
  for (const c of cola) matar(c);
  cola = [];
  pararVigia();
}

function fin(t: Trabajo) {
  if (actual !== t) return;
  actual = null;
  const sig = cola.shift();
  if (sig) { actual = sig; hablarTrozo(sig); return; }
  pararVigia();
  t.opts.onend?.();
}

function siguiente(t: Trabajo, finFrase: boolean) {
  if (t.cancelado || actual !== t) return;
  t.i++;
  if (t.i < t.trozos.length) {
    const aj = leerAjustes();
    // micro-pausa natural: el respiro entre frases la hace humana
    const pausa = finFrase && aj.pausas ? 90 : 35;
    t.timer = window.setTimeout(() => { t.timer = null; hablarTrozo(t); }, pausa);
  } else {
    fin(t);
  }
}

function hablarTrozo(t: Trabajo) {
  if (t.cancelado || actual !== t) return;
  if (typeof window === "undefined" || !vocesDisponibles()) { fin(t); return; }
  const synth = window.speechSynthesis;
  const trozo = t.trozos[t.i];
  try {
    const u = new SpeechSynthesisUtterance(trozo);
    const voz = vozDeAgente(t.id);
    if (voz) u.voice = voz;
    const aj = leerAjustes();
    const perfil = VOCES_ROSTER[t.id];
    u.lang = (voz?.lang || perfil.langs[0] || "es-ES").replace("_", "-");
    u.pitch = clamp(perfil.pitch * aj.tono, 0.1, 2);
    u.rate = clamp(perfil.rate * aj.velocidad, 0.5, 1.6);
    u.volume = clamp(aj.volumen, 0.1, 1);
    t.tokenTrozo++;
    const token = t.tokenTrozo;
    t.inicioTrozo = Date.now();
    u.onend = () => { if (!t.cancelado && t.tokenTrozo === token) siguiente(t, true); };
    u.onerror = () => { if (!t.cancelado && t.tokenTrozo === token) siguiente(t, false); };
    synth.speak(u);
  } catch {
    siguiente(t, false);
  }
}

// ── VIGÍA ANTI-TRABA — el discurso SE CURA SOLO ──
// Cada 2.5s: si el aparato pausó la voz la despierta; si un trozo
// lleva más de su tiempo estimado sin terminar (motor mudo tras un
// corte — la enfermedad original), lo salta y el discurso sigue.
function encenderVigia() {
  pararVigia();
  vigia = window.setInterval(() => {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth || !actual || actual.cancelado) return;
    if (synth.paused) { try { synth.resume(); } catch {} return; }
    if (!synth.speaking) return; // respiro entre trozos — normal
    const trozo = actual.trozos[actual.i] || "";
    if (!trozo) return;
    const aj = leerAjustes();
    const rate = Math.max(0.5, VOCES_ROSTER[actual.id].rate * aj.velocidad);
    const msEstimado = (trozo.length * 105) / rate + 3500;
    if (Date.now() - actual.inicioTrozo > msEstimado) {
      try { synth.cancel(); } catch {}
      siguiente(actual, false);
    }
  }, 2500);
}

/** ¿El aparato puede hablar? */
export function vocesDisponibles(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
}

/**
 * HABLA UN AGENTE con su identidad vocal. Una sola voz activa en la
 * casa: si otra hablaba, se corta (regla v119). Respeta el MUTE.
 * v196: el texto viaja TROCEADO — ya no se traba ni muere a media frase.
 */
export function hablarAgente(id: VozAgenteId, texto: string, opts: HablarOpts = {}): boolean {
  if (typeof window === "undefined" || !vocesDisponibles()) {
    opts.onerror?.();
    return false;
  }
  const limpio = (texto || "").trim();
  if (!limpio) { opts.onerror?.(); return false; }
  const synth = window.speechSynthesis;
  if (isMuted()) { try { synth.cancel(); } catch {} limpiarCola(); opts.onend?.(); return false; }
  const trozos = trocearTexto(limpio);
  if (trozos.length === 0) { opts.onerror?.(); return false; }
  const trabajo: Trabajo = {
    id, trozos, i: 0, opts,
    cancelado: false, timer: null, tokenTrozo: 0, inicioTrozo: 0,
  };
  if (opts.interrumpir !== false) {
    // regla de la casa: UNA SOLA VOZ — la nueva orden corta a la anterior
    matar(actual);
    for (const c of cola) matar(c);
    cola = [];
    try { synth.cancel(); } catch {}
    actual = trabajo;
    encenderVigia();
    // RESPIRO: Chrome necesita unos ms entre cancel() y speak() o se engancha
    trabajo.timer = window.setTimeout(() => { trabajo.timer = null; hablarTrozo(trabajo); }, 70);
  } else {
    if (actual) cola.push(trabajo);
    else { actual = trabajo; encenderVigia(); hablarTrozo(trabajo); }
  }
  return true;
}

/** Silencia TODO el consejo al instante (botones, desmontes, navegación). */
export function pararVoces() {
  if (typeof window === "undefined" || !vocesDisponibles()) return;
  try { window.speechSynthesis.cancel(); } catch {}
  limpiarCola();
}

/**
 * PRUEBA DEL CONSEJO: los agentes se presentan UNO A UNO, cada uno con
 * su propia voz — la demo viva de que ya no todos suenan igual.
 * Devuelve una función para detener la demo.
 */
export function probarVoces(ids: VozAgenteId[] = ["centinela", "analista", "assist", "narrador"]): () => void {
  pararVoces();
  let cancelada = false;
  const paso = (i: number) => {
    if (cancelada || i >= ids.length) return;
    const id = ids[i];
    hablarAgente(id, VOCES_ROSTER[id].frase, {
      onend: () => setTimeout(() => paso(i + 1), 350),
      onerror: () => setTimeout(() => paso(i + 1), 150),
    });
  };
  paso(0);
  return () => { cancelada = true; pararVoces(); };
}
