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
//
// ── v437.0 · LA VOZ EN TU IDIOMA (encargo del Dueño: «pule más las voces, la
// personalización también, los idiomas… y la voz más hermosa de todas») ──
//  ⑤ OCHO IDIOMAS, UNA BOCA. El idioma ya no es un parámetro olvidado: se lee
//     de la casa (`idiomaActual()`, idiomas.ts) si nadie lo dice, y manda en la
//     voz elegida, en la etiqueta que recibe el motor (`es-ES`, `en-US`, `pt-BR`,
//     `fr-FR`, `de-DE`, `it-IT`, `ru-RU`, `zh-CN`), en los símbolos que se dicen
//     y en las pausas. Cambiar el idioma de la casa cambia lo que se oye.
//  ⑥ PERSONALIZACIÓN POR IDIOMA, NO GLOBAL. `gustos.porIdioma` guarda, para
//     cada idioma, la voz que el piloto forzó y su velocidad y su tono: el
//     español puede ir despacio y el inglés rápido sin pisarse.
//  ⑦ EL GÉNERO DE LA PERSONA, RESPETADO. Cada persona tiene su preferencia y
//     cada idioma su lista de voces conocidas (Aria, Jorge, Francisca, Amélie,
//     Katja, Elsa, Milena, Xiaoxiao…). Se busca la persona, no «la primera voz».
//  ⑧ LA PREGUNTA SE OYE COMO PREGUNTA. Un bloque que termina en «?» sube el
//     tono 0.05 y uno que termina en «!» lo sube 0.02: en un motor plano, esa
//     curva es la diferencia entre leer y hablar.
// ============================================================

import { trocearParaBoca, textoDeBoca, type BloqueBoca } from "./limpiar";
import {
  IDIOMAS_VOZ,
  comoIdiomaVoz,
  hablaEseIdioma,
  idiomaActual,
  idiomaVoz,
  type IdiomaVozId,
} from "./idiomas";

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
  /**
   * v437.0 · el género que pide la persona. Los nombres concretos de cada
   * idioma viven en idiomas.ts (femeninas/masculinas): aquí solo se pide.
   */
  genero: "femenino" | "masculino";
}

export const PERSONAS: Record<PersonaId, Persona> = {
  locutora: {
    id: "locutora",
    nombre: "LA LOCUTORA",
    lema: "Voz de la casa: clara, media, sin prisa",
    rate: 0.94,
    pitch: 1.02,
    // v437.0 · la persona pide GÉNERO; los nombres concretos los pone el idioma
    prefiere: [/natural|neural|online|premium|enhanced/i],
    genero: "femenino",
  },
  analista: {
    id: "analista",
    nombre: "EL ANALISTA",
    lema: "Geopolítica explicada: frío, seguro, con ejemplo",
    rate: 0.9,
    pitch: 0.96,
    prefiere: [/natural|neural|online|premium/i],
    genero: "masculino",
  },
  general: {
    id: "general",
    nombre: "EL GENERAL",
    lema: "Parte de guerra: grave, lento, sin adorno",
    rate: 0.84,
    pitch: 0.82,
    prefiere: [/natural|neural|online|premium/i],
    genero: "masculino",
  },
  cronista: {
    id: "cronista",
    nombre: "EL CRONISTA",
    lema: "Cuenta lo que pasó, con fechas, sin dramatismo",
    rate: 1,
    pitch: 1.06,
    prefiere: [/google/i, /natural|neural|online|premium/i],
    genero: "femenino",
  },
};

// ── Preferencias del piloto (persistidas, sin servidor) ──

/**
 * v437.0 · LO QUE CADA IDIOMA GUARDA PARA SÍ.
 * El español puede ir despacio y el inglés rápido; tu voz forzada en francés no
 * tiene por qué ser la misma que en chino. Sin esto, cambiar de idioma borraba
 * lo que habías ajustado — y eso no es personalización, es un reinicio.
 */
export interface AjustesIdioma {
  /** URI forzada para ESE idioma (null/ausente = la casa elige la mejor) */
  vozURI?: string | null;
  rate?: number;
  pitch?: number;
}

export interface GustosVoz {
  persona: PersonaId;
  /**
   * URI de la voz elegida a mano (null = la casa elige la mejor).
   * Se conserva por compatibilidad: es el atajo del idioma actual.
   */
  vozURI: string | null;
  /** v437.0 · ajustes por idioma, con el código de dos letras como clave */
  porIdioma?: Partial<Record<IdiomaVozId, AjustesIdioma>>;
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
  porIdioma: {},
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
    const porIdioma = sanearPorIdioma(j.porIdioma);
    // MIGRACIÓN v437.0: quien ya tenía una voz forzada o un ritmo propio antes
    // de los idiomas no lo pierde: pasa a ser el de su idioma de ahora.
    if (Object.keys(porIdioma).length === 0) {
      const heredado: AjustesIdioma = {};
      if (typeof j.vozURI === "string") heredado.vozURI = j.vozURI;
      if (Number.isFinite(Number(j.rate)) && Number(j.rate) !== GUSTOS_DEFECTO.rate) heredado.rate = freno(Number(j.rate), 0.6, 1.4, 1);
      if (Number.isFinite(Number(j.pitch)) && Number(j.pitch) !== GUSTOS_DEFECTO.pitch) heredado.pitch = freno(Number(j.pitch), 0.5, 1.5, 1);
      if (Object.keys(heredado).length > 0) porIdioma[idiomaActual()] = heredado;
    }
    return {
      persona: (j.persona && j.persona in PERSONAS ? j.persona : "locutora") as PersonaId,
      vozURI: typeof j.vozURI === "string" ? j.vozURI : null,
      porIdioma,
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

/**
 * v437.0 · los ajustes por idioma entran saneados: un JSON viejo, roto o con
 * un idioma que la casa ya no tiene no puede tumbar la voz (ley de la casa:
 * el aparato del piloto no rompe la boca).
 */
function sanearPorIdioma(bruto: unknown): Partial<Record<IdiomaVozId, AjustesIdioma>> {
  const salida: Partial<Record<IdiomaVozId, AjustesIdioma>> = {};
  if (!bruto || typeof bruto !== "object") return salida;
  for (const [k, v] of Object.entries(bruto as Record<string, unknown>)) {
    const id = comoIdiomaVoz(k);
    if (!esIdiomaDeLaCasa(k)) continue;
    if (!v || typeof v !== "object") continue;
    const a = v as Record<string, unknown>;
    const limpio: AjustesIdioma = {};
    if (typeof a.vozURI === "string") limpio.vozURI = a.vozURI;
    else if (a.vozURI === null) limpio.vozURI = null;
    if (Number.isFinite(Number(a.rate))) limpio.rate = freno(Number(a.rate), 0.6, 1.4, 1);
    if (Number.isFinite(Number(a.pitch))) limpio.pitch = freno(Number(a.pitch), 0.5, 1.5, 1);
    if (Object.keys(limpio).length > 0) salida[id] = limpio;
  }
  return salida;
}

function esIdiomaDeLaCasa(x: unknown): x is IdiomaVozId {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(IDIOMAS_VOZ, x);
}

function freno(n: number, min: number, max: number, def: number): number {
  if (!Number.isFinite(n)) return def;
  return Math.min(max, Math.max(min, n));
}

// ── PERSONALIZACIÓN POR IDIOMA (v437.0) ──────────────────────────────────

/**
 * Los gustos que valen AHORA en un idioma: la persona de siempre + LO GUARDADO
 * PARA ESE IDIOMA. Si ese idioma no tiene nada guardado, valen los de fábrica:
 * así el español y el inglés no se prestan la velocidad (v437.0: antes cambiar
 * de idioma arrastraba el ajuste del anterior, que es justo lo contrario de
 * personalizar).
 */
export function gustosEnIdioma(g: GustosVoz, idioma: IdiomaVozId): GustosVoz {
  const a = g.porIdioma?.[idioma];
  return {
    ...g,
    persona: g.persona,
    vozURI: a?.vozURI ?? null,
    rate: a?.rate ?? GUSTOS_DEFECTO.rate,
    pitch: a?.pitch ?? GUSTOS_DEFECTO.pitch,
  };
}

/** Guarda un ajuste SOLO para ese idioma (y no toca los demás). */
export function guardarAjustesIdioma(
  g: GustosVoz,
  idioma: IdiomaVozId,
  cambios: AjustesIdioma
): GustosVoz {
  const previos = g.porIdioma?.[idioma] ?? {};
  const siguiente: GustosVoz = {
    ...g,
    porIdioma: { ...(g.porIdioma ?? {}), [idioma]: { ...previos, ...cambios } },
  };
  // el atajo global sigue apuntando a la voz del idioma que se acaba de tocar
  if (cambios.vozURI !== undefined) siguiente.vozURI = cambios.vozURI;
  if (cambios.rate !== undefined) siguiente.rate = cambios.rate;
  if (cambios.pitch !== undefined) siguiente.pitch = cambios.pitch;
  guardarGustos(siguiente);
  return siguiente;
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
const NEURONALES = /natural|neural|online|premium|enhanced|mejorada|siri|wavenet|studio/i;
const BUENAS = /google/i;

/**
 * LA NOTA DE UNA VOZ (v437.0, ahora con el idioma en la mano).
 * El orden importa y está escrito para que se pueda discutir:
 *   ① robótica conocida → 12, sin piedad (es lo que el Dueño llamó «voz de robot»)
 *   ② red de Google → 95 (en casi todos los aparatos es la más humana que hay)
 *   ③ neuronal/mejorada/wavenet → 90
 *   ④ voz de red sin apellido → 78 · voz local del sistema → 55
 * Y encima, dos ajustes reales: +6 si es una de las voces conocidas y buenas de
 * ESE idioma (Aria, Jorge, Xiaoxiao…), +3 si el idioma es el de la casa y la
 * etiqueta coincide con la región que se va a pedir.
 */
function puntuar(
  nombre: string,
  idiomaEtiqueta: string,
  local: boolean,
  id: IdiomaVozId = "es"
): { calidad: number; nota: string } {
  let n = 55;
  let nota = "voz del sistema (local, sin red)";
  if (ROBOTICAS.test(nombre)) {
    n = 12;
    nota = "voz robótica de reserva (la peor clase)";
  } else if (BUENAS.test(nombre)) {
    n = 95;
    nota = "voz de red de Google: la más natural que suele haber";
  } else if (NEURONALES.test(nombre)) {
    n = 90;
    nota = "voz neuronal: muy natural";
  } else if (!local) {
    n = 78;
    nota = "voz de red: buena";
  }
  const tabla = idiomaVoz(id);
  if (tabla.femeninas.test(nombre) || tabla.masculinas.test(nombre)) {
    n += 6;
    nota = `${nota} · voz conocida de ${tabla.nativo}`;
  }
  if (idiomaEtiqueta && idiomaEtiqueta.toLowerCase().startsWith(tabla.bcp47.slice(0, 2))) n += 3;
  return { calidad: Math.min(100, n), nota };
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
  /** v437.0 · el género que se le puede suponer por el nombre (o «sin dato») */
  genero: "femenino" | "masculino" | "sin dato";
}

/** Las voces del aparato que hablan ese idioma, puntuadas. Vacío si aún no cargaron. */
export function escanearVoces(idioma: IdiomaVozId = "es"): VozDisponible[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const todas = window.speechSynthesis.getVoices();
  const tabla = idiomaVoz(idioma);
  const lista: VozDisponible[] = [];
  for (const v of todas) {
    if (!hablaEseIdioma(v.lang, idioma)) continue;
    const { calidad, nota } = puntuar(v.name, v.lang, v.localService, idioma);
    const fem = tabla.femeninas.test(v.name);
    const mas = !fem && tabla.masculinas.test(v.name);
    lista.push({
      uri: v.voiceURI,
      nombre: v.name,
      idioma: v.lang,
      calidad,
      nota,
      genero: fem ? "femenino" : mas ? "masculino" : "sin dato",
    });
  }
  return lista.sort((a, b) => b.calidad - a.calidad);
}

/**
 * LA VOZ QUE HABLA (v437.0). Orden de mando:
 *   ① la voz que el piloto forzó PARA ESE IDIOMA (si sigue instalada),
 *   ② la voz conocida y buena del idioma que pide el GÉNERO de la persona,
 *   ③ una voz neuronal del idioma, del género que sea,
 *   ④ la mejor puntuada del idioma.
 * Nunca devuelve una voz de otro idioma: si no hay, devuelve null y la casa lo
 * dice con nombre y apellido (`avisosDelAparato`).
 */
export function elegirVoz(
  persona: PersonaId,
  gustos: GustosVoz,
  idioma: IdiomaVozId = "es"
): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const todas = window.speechSynthesis.getVoices().filter((v) => hablaEseIdioma(v.lang, idioma));
  if (todas.length === 0) return null;

  const ordenadas = todas
    .map((v) => ({
      v,
      s: puntuar(v.name, v.lang, v.localService, idioma).calidad,
      neuron: NEURONALES.test(v.name) || BUENAS.test(v.name),
    }))
    .sort((a, b) => b.s - a.s);

  // ① la voz forzada para este idioma
  const forzada = gustos.porIdioma?.[idioma]?.vozURI ?? gustos.vozURI;
  if (forzada) {
    const manual = todas.find((v) => v.voiceURI === forzada);
    if (manual) return manual;
  }

  const p = PERSONAS[persona];
  const tabla = idiomaVoz(idioma);
  const pistaGenero = p.genero === "femenino" ? tabla.femeninas : tabla.masculinas;

  // ② la voz conocida del idioma, del género de la persona
  const delGenero = ordenadas.find((o) => pistaGenero.test(o.v.name));
  if (delGenero && delGenero.s >= 55) return delGenero.v;

  // ③ cualquier neuronal (la persona se nota menos que la naturalidad)
  const neuronal = ordenadas.find((o) => o.neuron);
  if (neuronal) return neuronal.v;

  // ④ la mejor del idioma (con la pista de la persona, si la hay)
  for (const pista of p.prefiere) {
    const cand = ordenadas.find((o) => pista.test(o.v.name) && o.s >= 55);
    if (cand) return cand.v;
  }
  return ordenadas[0] ? ordenadas[0].v : null;
}

/** Avisos honestos sobre el aparato: la casa no finge que suena bien. */
export function avisosDelAparato(idioma: IdiomaVozId = "es"): string[] {
  const tabla = idiomaVoz(idioma);
  const voces = escanearVoces(idioma);
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return ["Este navegador no tiene voz. La casa te lo dice: aquí solo se puede leer."];
  }
  if (voces.length === 0) {
    // el aviso se dice en el idioma que el piloto pidió, no en el de la casa
    return [tabla.sinVoces];
  }
  if (voces[0].calidad < 55) {
    return [
      tabla.mejorEsMala
        .replace("{voz}", voces[0].nombre)
        .replace("{nota}", voces[0].nota),
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
  /**
   * v437.0 · el idioma en que se dice. Si falta, se usa el de la CASA
   * (`idiomaActual()`): el que el piloto eligió en la interfaz. Así la boca y
   * la pantalla no pueden ir cada una por su lado.
   */
  idioma?: IdiomaVozId;
  /** ¿cortar lo que esté sonando? (por defecto SÍ: una sola voz manda) */
  interrumpir?: boolean;
  onFin?: () => void;
  /**
   * v431.2 · CADA FRASE, AVISADA. Se llama antes de decir cada trozo con su
   * texto, su índice y el total. Existe para que la pantalla pueda enseñar
   * lo que suena EXACTAMENTE (subtítulos de la radio), sin que la sala tenga
   * que reimplementar la boca ni adivinar por dónde va. Es opcional: los
   * otros llamantes de la casa siguen igual.
   */
  onFrase?: (texto: string, indice: number, total: number) => void;
}

/**
 * DECIR — la boca de la casa. Devuelve false si el aparato no puede hablar
 * (y entonces el que llama debe pintar el texto: la casa nunca se queda muda).
 */
export function decir(texto: string, opts: OpcionesDecir = {}): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const idioma: IdiomaVozId = opts.idioma ?? idiomaActual();
  const tabla = idiomaVoz(idioma);
  // ⑥ los gustos que valen en ESTE idioma (voz forzada, velocidad y tono)
  const gustos = gustosEnIdioma(opts.gustos ?? leerGustos(), idioma);
  const persona = opts.persona ?? gustos.persona;
  const bloques = trocearParaBoca(texto, idioma);
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
    try {
      opts.onFrase?.(bloque.texto, actual.i - 1, actual.bloques.length);
    } catch {
      /* un subtítulo roto no puede parar la voz */
    }
    const u = new SpeechSynthesisUtterance(bloque.texto);
    u.voice = voz;
    // ⑤ la etiqueta del idioma de la casa manda; la voz solo la afina
    u.lang = tabla.bcp47 || voz.lang || "es-ES";
    // el ritmo del idioma (el alemán y el ruso piden más calma que el español)
    u.rate = freno(gustos.rate * p.rate * tabla.ajusteRitmo, 0.5, 1.6, 1);
    // ⑧ la curva de la frase: preguntar se oye, exclamar se nota
    const cierre = bloque.texto.trim().slice(-1);
    const curva = cierre === "?" || cierre === "？" ? 0.05 : cierre === "!" || cierre === "！" ? 0.02 : 0;
    u.pitch = freno(gustos.pitch * p.pitch + curva, 0.4, 1.6, 1);
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
