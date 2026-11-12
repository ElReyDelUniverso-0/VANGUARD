// ============================================================
// v367.2 LA VOZ MAESTRA — LA BOCA DE LA CASA (decir.ts)
//
// El diagnóstico del Dueño, palabra por palabra: «tiene una voz robótica, no
// tiene diferentes voces, una voz sin pausa, una voz molesta». Este módulo
// ataca las cuatro quejas con lo ÚNICO que la casa puede controlar de verdad
// en un sintetizador del navegador: QUÉ voz se elige, CÓMO se ajusta, CUÁNDO
// respira y CÓMO se encadenan las frases.
//
// ① ELECCIÓN CON CRITERIO — `escanearVoces()` puntúa cada voz del aparato:
//    las neuronales/de red («Google español», «Microsoft … Natural/Online»)
//    ganan; las robóticas conocidas («eSpeak», «compact», «Pico») pierden.
//    Y si el aparato NO tiene ninguna decente, la casa LO DICE en vez de
//    fingir que suena bien (honestidad como técnica, ley de la casa).
// ② CUATRO PERSONAS DE VERDAD — locutora, analista, general y cronista: cada
//    una con su velocidad, su tono y su voz preferida. No es un cambio de
//    tono cosmético: un general habla más grave y más lento que una locutora.
// ③ RESPIRACIÓN REAL — el texto se trocea por frases y párrafos (limpiar.ts)
//    y entre bloque y bloque hay SILENCIO de verdad (260 ms por frase, 700 ms
//    por párrafo). Ahí muere la «voz sin pausa».
// ④ COLA CON MANDO — hablar/parar/pausar/reanudar y una sola voz a la vez:
//    una orden nueva corta a la anterior (nadie habla encima de nadie).
//
// Límite honesto que la casa NO esconde: la calidad final depende de las
// voces instaladas en el aparato. Aquí se elige la mejor disponible y se
// avisa cuando la mejor es mala.
// ============================================================

import { trocearParaBoca, textoDeBoca, type BloqueBoca } from "./limpiar";

export type PersonaId = "locutora" | "analista" | "general" | "cronista";

export interface Persona {
  id: PersonaId;
  nombre: string;
  lema: string;
  /** multiplicador de velocidad (1 = la del aparato) */
  rate: number;
  /** tono (1 = el del aparato) */
  pitch: number;
  /** pistas de nombre de voz que esta persona prefiere, por orden */
  prefiere: RegExp[];
}

export const PERSONAS: Record<PersonaId, Persona> = {
  locutora: {
    id: "locutora",
    nombre: "LA LOCUTORA",
    lema: "Voz de la casa: clara, media, sin prisa",
    rate: 0.94,
    pitch: 1.02,
    // voces femeninas naturales primero (Helena, Sabina, Mónica, Paulina, Laura)
    prefiere: [/helena|sabina|monica|mónica|paulina|laura|elvira|estrella/i, /mujer|female/i],
  },
  analista: {
    id: "analista",
    nombre: "EL ANALISTA",
    lema: "Geopolítica explicada: frío, seguro, con ejemplo",
    rate: 0.9,
    pitch: 0.96,
    prefiere: [/jorge|pablo|diego|carlos|raul|raúl|alvaro|álvaro/i, /hombre|male/i],
  },
  general: {
    id: "general",
    nombre: "EL GENERAL",
    lema: "Parte de guerra: grave, lento, sin adorno",
    rate: 0.84,
    pitch: 0.82,
    prefiere: [/jorge|pablo|diego|carlos|gonzalo|enrique/i, /hombre|male/i],
  },
  cronista: {
    id: "cronista",
    nombre: "EL CRONISTA",
    lema: "Cuenta lo que pasó, con fechas, sin dramatismo",
    rate: 1,
    pitch: 1.06,
    prefiere: [/google/i, /natural|neural|online|premium/i, /mujer|female/i],
  },
};

// ── Preferencias del piloto (persistidas, sin servidor) ──
export interface GustosVoz {
  persona: PersonaId;
  /** URI de la voz elegida a mano (null = la casa elige la mejor) */
  vozURI: string | null;
  /** 0.6 – 1.4 */
  rate: number;
  /** 0.5 – 1.5 */
  pitch: number;
  /** 0 – 1 */
  volumen: number;
  pausas: boolean;
}

const LS = "vg3672-voz-maestra";

export const GUSTOS_DEFECTO: GustosVoz = {
  persona: "locutora",
  vozURI: null,
  rate: 1,
  pitch: 1,
  volumen: 0.95,
  pausas: true,
};

export function leerGustos(): GustosVoz {
  if (typeof window === "undefined") return { ...GUSTOS_DEFECTO };
  try {
    const raw = window.localStorage.getItem(LS);
    if (!raw) return { ...GUSTOS_DEFECTO };
    const j = JSON.parse(raw) as Partial<GustosVoz>;
    return {
      persona: (j.persona && j.persona in PERSONAS ? j.persona : "locutora") as PersonaId,
      vozURI: typeof j.vozURI === "string" ? j.vozURI : null,
      rate: freno(Number(j.rate), 0.6, 1.4, 1),
      pitch: freno(Number(j.pitch), 0.5, 1.5, 1),
      volumen: freno(Number(j.volumen), 0, 1, 0.95),
      pausas: j.pausas !== false,
    };
  } catch {
    return { ...GUSTOS_DEFECTO };
  }
}

export function guardarGustos(g: GustosVoz): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS, JSON.stringify(g));
  } catch {
    /* modo privado: los gustos viven en memoria */
  }
}

function freno(n: number, min: number, max: number, def: number): number {
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

// ── El aparato: qué voces hay y cuáles valen ──
export interface VozDisponible {
  uri: string;
  nombre: string;
  idioma: string;
  /** 0–100: cuánto se parece a una voz humana */
  calidad: number;
  /** por qué esa nota (la casa nunca da un número sin motivo) */
  nota: string;
}

const ROBOTICAS = /espeak|compact|pico|festival|flite|sam\b|albert|zarvox|bubbles|trinoids/i;
const NEURONALES = /natural|neural|online|premium|enhanced|mejorada|siri/i;
const BUENAS = /google/i;

function puntuar(nombre: string, idioma: string, local: boolean): { calidad: number; nota: string } {
  let n = 55;
  let nota = "voz del sistema";
  if (ROBOTICAS.test(nombre)) {
    n = 12;
    nota = "voz robótica de reserva (la peor clase)";
  } else if (BUENAS.test(nombre)) {
    n = 95;
    nota = "voz de red de Google: la más natural que suele haber";
  } else if (NEURONALES.test(nombre)) {
    n = 90;
    nota = "voz neuronal del sistema: muy natural";
  } else if (!local) {
    n = 78;
    nota = "voz de red: buena";
  }
  if (/es-(ES|MX|US|AR|CO|CL|PE|VE)/i.test(idioma)) n += 5;
  else if (/^es/i.test(idioma)) n += 2;
  return { calidad: Math.min(100, n), nota };
}

/** Las voces del aparato, puntuadas. Vacío si aún no cargaron. */
export function escanearVoces(idioma = "es"): VozDisponible[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const todas = window.speechSynthesis.getVoices();
  const lista: VozDisponible[] = [];
  for (const v of todas) {
    if (!v.lang || !v.lang.toLowerCase().startsWith(idioma)) continue;
    const { calidad, nota } = puntuar(v.name, v.lang, v.localService);
    lista.push({ uri: v.voiceURI, nombre: v.name, idioma: v.lang, calidad, nota });
  }
  return lista.sort((a, b) => b.calidad - a.calidad);
}

export function elegirVoz(persona: PersonaId, gustos: GustosVoz, idioma = "es"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const todas = window.speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith(idioma));
  if (todas.length === 0) return null;
  // ① la voz elegida a mano manda (si sigue existiendo)
  if (gustos.vozURI) {
    const manual = todas.find((v) => v.voiceURI === gustos.vozURI);
    if (manual) return manual;
  }
  // ② la preferida de la persona, si además es buena
  const p = PERSONAS[persona];
  for (const pista of p.prefiere) {
    const cand = todas
      .filter((v) => pista.test(v.name))
      .map((v) => ({ v, s: puntuar(v.name, v.lang, v.localService).calidad }))
      .sort((a, b) => b.s - a.s)[0];
    if (cand && cand.s >= 55) return cand.v;
  }
  // ③ la mejor puntuada del aparato
  const mejor = todas
    .map((v) => ({ v, s: puntuar(v.name, v.lang, v.localService).calidad }))
    .sort((a, b) => b.s - a.s)[0];
  return mejor ? mejor.v : null;
}

/** Avisos honestos sobre el aparato: la casa no finge que suena bien. */
export function avisosDelAparato(idioma = "es"): string[] {
  const voces = escanearVoces(idioma);
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return ["Este navegador no tiene voz. La casa te lo dice: aquí solo se puede leer."];
  }
  if (voces.length === 0) {
    return [
      "Tu aparato no tiene ninguna voz en español instalada. La casa no puede hablar sin ella: instala una voz en los ajustes del sistema (Android: Ajustes › Idiomas › Texto a voz).",
    ];
  }
  if (voces[0].calidad < 55) {
    return [
      `La mejor voz de tu aparato es de clase baja (${voces[0].nombre}: ${voces[0].nota}). Suena robótica porque lo es — no es la casa, es el aparato. Instala «Voz de Google» o una voz neuronal para que esto suene humano.`,
    ];
  }
  return [];
}

// ── El motor de la boca ──
type Estado = "quieta" | "hablando" | "pausada";

interface Sesion {
  bloques: BloqueBoca[];
  i: number;
  cancelada: boolean;
  timer: number | null;
}

let sesion: Sesion | null = null;
let oyentes = new Set<(e: Estado) => void>();
let estado: Estado = "quieta";

function anunciar(e: Estado) {
  estado = e;
  for (const f of oyentes) {
    try {
      f(e);
    } catch {
      /* un oyente roto no tumba la boca */
    }
  }
}

/** Suscripción al estado de la boca (para pintar el orbe). */
export function alCambiarBoca(f: (e: Estado) => void): () => void {
  oyentes.add(f);
  f(estado);
  return () => {
    oyentes.delete(f);
  };
}

export function estadoBoca(): Estado {
  return estado;
}

function matar(): void {
  if (sesion?.timer) {
    window.clearTimeout(sesion.timer);
    sesion.timer = null;
  }
  if (sesion) sesion.cancelada = true;
  sesion = null;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

/** Corta TODO al instante (navegación, desmontaje, otra orden). */
export function pararBoca(): void {
  matar();
  anunciar("quieta");
}

export function pausarBoca(): void {
  if (estado !== "hablando") return;
  try {
    window.speechSynthesis.pause();
  } catch {
    /* noop */
  }
  anunciar("pausada");
}

export function reanudarBoca(): void {
  if (estado !== "pausada") return;
  try {
    window.speechSynthesis.resume();
  } catch {
    /* noop */
  }
  anunciar("hablando");
}

export interface OpcionesDecir {
  persona?: PersonaId;
  gustos?: GustosVoz;
  idioma?: string;
  /** ¿cortar lo que esté sonando? (por defecto SÍ: una sola voz manda) */
  interrumpir?: boolean;
  onFin?: () => void;
}

/**
 * DECIR — la boca de la casa. Devuelve false si el aparato no puede hablar
 * (y entonces el que llama debe pintar el texto: la casa nunca se queda muda).
 */
export function decir(texto: string, opts: OpcionesDecir = {}): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const gustos = opts.gustos ?? leerGustos();
  const persona = opts.persona ?? gustos.persona;
  const idioma = opts.idioma ?? "es";
  const bloques = trocearParaBoca(texto);
  if (bloques.length === 0) return false;
  const voz = elegirVoz(persona, gustos, idioma);
  if (!voz) return false;

  if (opts.interrumpir !== false) matar();
  const p = PERSONAS[persona];
  const actual: Sesion = { bloques, i: 0, cancelada: false, timer: null };
  sesion = actual;
  anunciar("hablando");

  const siguiente = () => {
    if (actual.cancelada || sesion !== actual) return;
    if (actual.i >= actual.bloques.length) {
      sesion = null;
      anunciar("quieta");
      opts.onFin?.();
      return;
    }
    const bloque = actual.bloques[actual.i++];
    const u = new SpeechSynthesisUtterance(bloque.texto);
    u.voice = voz;
    u.lang = voz.lang || "es-ES";
    u.rate = freno(gustos.rate * p.rate, 0.5, 1.6, 1);
    u.pitch = freno(gustos.pitch * p.pitch, 0.4, 1.6, 1);
    u.volume = freno(gustos.volumen, 0, 1, 1);
    u.onend = () => {
      if (actual.cancelada || sesion !== actual) return;
      // LA RESPIRACIÓN: silencio real entre bloques (0 si el piloto apagó pausas)
      const espera = gustos.pausas ? bloque.pausa : 40;
      actual.timer = window.setTimeout(() => {
        actual.timer = null;
        siguiente();
      }, espera);
    };
    u.onerror = () => {
      if (actual.cancelada || sesion !== actual) return;
      // un error de una frase no debe matar el discurso entero
      actual.timer = window.setTimeout(() => {
        actual.timer = null;
        siguiente();
      }, 60);
    };
    try {
      window.speechSynthesis.speak(u);
    } catch {
      siguiente();
    }
  };

  // respiro de arranque: Chrome necesita unos ms tras cancel()
  actual.timer = window.setTimeout(() => {
    actual.timer = null;
    siguiente();
  }, 60);
  return true;
}

/** ¿Cuánto tarda en leerse? (estimación honesta para la UI: ~14 car/s) */
export function duracionAproxMs(texto: string): number {
  const limpio = textoDeBoca(texto);
  return Math.round((limpio.length / 14) * 1000);
}
