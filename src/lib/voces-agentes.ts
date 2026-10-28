"use client";

// ============================================================
// v191.0 EL CONSEJO DE VOCES — cada agente de Vanguard tiene su
// PROPIA voz. Antes todo salía por la misma boca (rate 1.18,
// pitch 0.95, la primera voz es-ES que encontrara el aparato):
// apresurado, metálico y monótono. Ahora:
//  · CENTINELA — grave, pausado, radar (pitch 0.72)
//  · LA ANALISTA — clara y brillante (pitch 1.22)
//  · VG-ASSIST — neutral de mando (pitch 1.0)
//  · EL NARRADOR — operador de radio del parte (pitch 0.80)
// Reglas de la casa respetadas:
//  · UNA SOLA VOZ ACTIVA — la nueva orden corta a la anterior.
//  · RESPETA EL MUTE global (src/lib/sound.ts).
//  · CERO SERVICIOS EXTERNOS: speechSynthesis del aparato.
//  · VOCES CLARAS: rate humano (0.86–1.06, jamás 1.18), volumen
//    0.95 y preferencia por voces neuronales (Google/Microsoft
//    Natural) cuando el aparato las tenga.
//  · VOCES DISTINTAS: si el aparato tiene ≥2 voces en español,
//    cada agente recibe una voiceURI DIFERENTE (reparto estable
//    por offset); si solo hay una, pitch+rate las separan igual.
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

export const VOCES_ROSTER: Record<VozAgenteId, PerfilVoz> = {
  centinela: {
    id: "centinela",
    nombre: "CENTINELA",
    rol: "Radar de impacto · anuncios urgentes",
    color: "#FF3B30",
    frase: "Radar activo. Veinticuatro frentes vigilados. Nada pasa sin que yo lo vea.",
    pitch: 0.72,
    rate: 0.96,
    langs: ["es-ES", "es-MX", "es-419", "es-US", "es"],
    offset: 0,
  },
  analista: {
    id: "analista",
    nombre: "LA ANALISTA",
    rol: "Briefings y partes del día",
    color: "#38BDF8",
    frase: "El mundo no duerme. Yo tampoco. Aquí está lo que importa.",
    pitch: 1.22,
    rate: 1.0,
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
    rate: 1.06,
    langs: ["es-ES", "es-419", "es-MX", "es-US", "es"],
    offset: 2,
  },
  narrador: {
    id: "narrador",
    nombre: "EL NARRADOR",
    rol: "El cronoteatro · parte del frente",
    color: "#3DDC97",
    frase: "Parte del frente. Día doce de campaña. El sector norte resiste.",
    pitch: 0.8,
    rate: 0.88,
    langs: ["es-ES", "es-ES", "es-MX", "es-419", "es"],
    offset: 3,
  },
};

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

function calidadNombre(nombre: string): number {
  const n = nombre.toLowerCase();
  if (n.includes("google")) return 3;        // neuronales de Chrome
  if (n.includes("natural")) return 2.6;     // Microsoft Neural
  if (n.includes("microsoft")) return 1.6;   // de escritorio
  if (n.includes("premium") || n.includes("enhanced")) return 2.2;
  if (n.includes("loqueño") || n.includes("male") || n.includes("female")) return 1.0;
  return 0.6;
}

/** Elige la voiceURI del agente: distinta por reparto estable. */
export function vozDeAgente(id: VozAgenteId): SpeechSynthesisVoice | null {
  const perfil = VOCES_ROSTER[id];
  const pool = vocesEspanol();
  if (pool.length === 0) {
    // sin español: cualquier voz del aparato (pitch/rate siguen separando)
    return cacheVoces[0] || null;
  }
  const puntua = (v: SpeechSynthesisVoice): number => {
    const lang = (v.lang || "").toLowerCase().replace("_", "-");
    const iLang = perfil.langs.findIndex((l) => lang.startsWith(l.toLowerCase()));
    return (iLang >= 0 ? 10 - iLang : 1) + calidadNombre(v.name);
  };
  const orden = [...pool].sort((a, b) => puntua(b) - puntua(a));
  // REPARTO: si hay ≥2 voces, cada agente toma una DIFERENTE de forma estable
  return orden[perfil.offset % orden.length] || null;
}

export interface HablarOpts {
  onend?: () => void;
  onerror?: () => void;
  /** false = encola detrás de la voz actual en vez de cortarla */
  interrumpir?: boolean;
}

/** ¿El aparato puede hablar? */
export function vocesDisponibles(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
}

/**
 * HABLA UN AGENTE con su identidad vocal. Una sola voz activa en la
 * casa: si otra hablaba, se corta (regla v119). Respeta el MUTE.
 */
export function hablarAgente(id: VozAgenteId, texto: string, opts: HablarOpts = {}): boolean {
  if (typeof window === "undefined" || !vocesDisponibles()) {
    opts.onerror?.();
    return false;
  }
  const synth = window.speechSynthesis;
  const limpio = (texto || "").trim();
  if (!limpio) { opts.onerror?.(); return false; }
  if (isMuted()) { try { synth.cancel(); } catch {} opts.onend?.(); return false; }
  try {
    if (opts.interrumpir !== false) synth.cancel();
    const perfil = VOCES_ROSTER[id];
    const u = new SpeechSynthesisUtterance(limpio);
    const voz = vozDeAgente(id);
    if (voz) u.voice = voz;
    const langVoz = (voz?.lang || perfil.langs[0] || "es-ES").replace("_", "-");
    u.lang = langVoz;
    u.pitch = perfil.pitch;
    u.rate = perfil.rate;
    u.volume = 0.95;
    u.onend = () => opts.onend?.();
    u.onerror = () => opts.onerror?.();
    synth.speak(u);
    return true;
  } catch {
    opts.onerror?.();
    return false;
  }
}

/** Silencia TODO el consejo al instante (botones, desmontes, navegación). */
export function pararVoces() {
  if (typeof window === "undefined" || !vocesDisponibles()) return;
  try { window.speechSynthesis.cancel(); } catch {}
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
