// ============================================================
// v367.2 LA VOZ MAESTRA — EL LIMPIADOR DE BOCA (limpiar.ts)
//
// El Dueño fue tajante: «lee sin sentido». Y tenía razón: la boca de la casa
// recibía texto de PANEL (markdown, viñetas, URLs, claves mod:, porcentajes
// sueltos, emojis) y lo pronunciaba tal cual. Un sintetizador no lee: recita
// lo que le dan. Si le das «▲ 3,5 % · GDELT — VG-08», dice exactamente eso.
//
// Este módulo hace UNA cosa y la hace para toda la casa: convertir texto de
// pantalla en texto de BOCA. No resume, no inventa, no cambia datos: quita lo
// que no se puede decir en voz alta y expande lo que se dice mal.
//
// REGLA DE ORO (ley de la casa): la limpieza JAMÁS altera una cifra, un
// nombre propio ni una fuente. Si no sabe cómo se dice algo, lo deja quieto.
// ============================================================

const RE_URL = /\b(?:https?:\/\/|www\.)\S+/gi;
const RE_ENLACE_MD = /\[([^\]]+)\]\([^)]*\)/g; // [texto](url) → texto
const RE_MARKDOWN = /(\*\*|__|~~|`{1,3}|\*|_)/g;
const RE_EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu;
const RE_BALAS =
  /[\u{2022}\u{25AA}\u{25AB}\u{25CF}\u{25CB}\u{00A6}\u{25B6}\u{25B8}\u{25C0}\u{25C2}\u{2713}\u{2714}\u{2715}\u{2716}\u{00D7}\u{26A0}\u{2500}-\u{257F}]+/gu;
const RE_TOKEN = /\b[\p{L}\p{N}-]*(?:[._][\p{L}\p{N}-]+){2,}\b/gu; // EN.GHG.CO2.PC · a_b_c
const RE_CLAVE = /\b(?:mod|fnt|vg):[\p{L}\p{N}:-]+/giu; // vg:pais:ua · mod:torre
const RE_SIGNO_REPETIDO = /([!¡?¿.;,])\1{1,}/g;
const RE_ALMOHADILLA = /#+/g; // #urgente → urgente (el motor diría «numeral»)
const RE_VINETA_LINEA = /(^|\n)\s*[-–—+*]\s+/g; // viñetas de panel: el motor lee «guion»
// v367.2 (hallazgo del QA): «24 h» se leía «veinticuatro hache». Las unidades
// cortas se expanden SOLO cuando van pegadas a una cifra — sin tocar el resto.
const RE_UNIDAD_H = /\b(\d{1,4})\s*h\b(?![\p{L}])/gu;

/** Los números que el sintetizador español dice mal si van en cifra. */
const NUMEROS: Record<string, string> = {
  "0": "cero", "1": "uno", "2": "dos", "3": "tres", "4": "cuatro", "5": "cinco",
  "6": "seis", "7": "siete", "8": "ocho", "9": "nueve", "10": "diez",
  "11": "once", "12": "doce", "13": "trece", "14": "catorce", "15": "quince",
  "16": "dieciséis", "17": "diecisiete", "18": "dieciocho", "19": "diecinueve",
  "20": "veinte", "24": "veinticuatro", "30": "treinta", "40": "cuarenta",
  "50": "cincuenta", "60": "sesenta", "70": "setenta", "80": "ochenta",
  "90": "noventa", "100": "cien",
};

/** Abreviaturas y símbolos: se dicen, no se deletrean. */
const SIMBOLOS: [RegExp, string][] = [
  [/\bEE\.?\s?UU\.?/gi, "Estados Unidos"],
  [/\bEEUU\b/gi, "Estados Unidos"],
  [/\bS\.\s?XXI\b/gi, "siglo veintiuno"],
  [/\bS\.\s?XX\b/gi, "siglo veinte"],
  [/\bN[º°]\s?/gi, "número "],
  [/\bkm²/gi, "kilómetros cuadrados"],
  [/\bkm2\b/gi, "kilómetros cuadrados"],
  [/\bm²/gi, "metros cuadrados"],
  [/\bmm\b/gi, "milímetros"],
  [/\bkm\b/gi, "kilómetros"],
  [/\bkg\b/gi, "kilos"],
  [/%/g, " por ciento"],
  [/€/g, " euros"],
  [/\$/g, " dólares"],
  [/≈/g, " aproximadamente "],
  [/≥/g, " igual o mayor que "],
  [/≤/g, " igual o menor que "],
  [/→|➜|⟶/g, ", hacia "],
  [/&/g, " y "],
  [/@/g, " arroba "],
  [/\//g, " "],
  [/\s{2,}/g, " "],
];

/** «3,5» y «1.877» se dicen: se convierten en números pequeños legibles. */
function numerosLegibles(t: string): string {
  // enteros con separador de miles: 1.877 → 1877 (el TTS lo lee bien)
  let s = t.replace(/\b(\d{1,3}(?:\.\d{3})+)\b/g, (m) => m.replace(/\./g, ""));
  // decimales con coma: 3,5 → 3.5 (el TTS lo lee «tres coma cinco»)
  s = s.replace(/(\d),(\d)/g, "$1.$2");
  // cifras pequeñas sueltas → palabra (0-100 sin decimales ni unidades pegadas)
  s = s.replace(/\b(\d{1,3})\b/g, (m, d: string) => NUMEROS[d] ?? m);
  return s;
}

/** Pausas reales: los separadores de panel se convierten en comas y puntos. */
function pausasReales(t: string): string {
  return t
    .replace(/\s*[·•|]\s*/g, ". ")
    .replace(/\s+[—–]\s+/g, ", ")
    .replace(/\s*:\s*/g, ", ")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+([.,;!?])/g, "$1")
    .replace(/([.,;!?])(?=[^\s\d])/g, "$1 ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * TEXTO DE BOCA. La única puerta: todo lo que la casa quiere DECIR pasa por
 * aquí. Determinista, sin dependencias y sin red.
 */
export function textoDeBoca(entrada: string): string {
  if (!entrada) return "";
  let t = entrada.normalize("NFC");
  t = t.replace(RE_ENLACE_MD, "$1");
  t = t.replace(RE_URL, " ");
  t = t.replace(RE_CLAVE, " "); // vg:pais:ua no se dice: se omite (nunca se inventa)
  t = t.replace(RE_TOKEN, " ");
  t = t.replace(RE_MARKDOWN, "");
  t = t.replace(RE_EMOJI, " ");
  t = t.replace(RE_BALAS, " ");
  t = t.replace(RE_SIGNO_REPETIDO, "$1");
  t = t.replace(RE_VINETA_LINEA, "$1");
  t = t.replace(RE_ALMOHADILLA, " ");
  t = t.replace(RE_UNIDAD_H, (_m, d: string) => (d === "1" ? "una hora" : `${d} horas`));
  for (const [re, con] of SIMBOLOS) t = t.replace(re, con);
  t = numerosLegibles(t);
  t = pausasReales(t);
  return t;
}

/**
 * TROCEADO DE BOCA — por párrafos y frases, con la longitud máxima que un
 * sintetizador digiere sin cortar el aliento. Devuelve bloques con su pausa
 * posterior en milisegundos: así la boca RESPIRA (el Dueño: «una voz sin
 * pausa»).
 */
export interface BloqueBoca {
  texto: string;
  /** silencio DESPUÉS de este bloque, en ms */
  pausa: number;
}

const MAX_TROZO = 170;
export const PAUSA_FRASE = 260;
export const PAUSA_PARRAFO = 700;
export const PAUSA_TITULO = 420;

export function trocearParaBoca(texto: string): BloqueBoca[] {
  const limpio = textoDeBoca(texto);
  if (!limpio) return [];
  const parrafos = limpio.split(/\n{1,}/).map((p) => p.trim()).filter(Boolean);
  const salida: BloqueBoca[] = [];
  for (const parrafo of parrafos) {
    // frases: corta en . ! ? … sin comerse las abreviaturas cortas
    const frases = parrafo.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) ?? [parrafo];
    for (const bruta of frases) {
      const frase = bruta.trim();
      if (!frase) continue;
      if (frase.length <= MAX_TROZO) {
        salida.push({ texto: frase, pausa: PAUSA_FRASE });
        continue;
      }
      // frase larga: se parte por comas, la respiración natural
      const trozos = frase.match(new RegExp(`[^,]{1,${MAX_TROZO}}(,|$)`, "g")) ?? [frase];
      for (const t of trozos) {
        const x = t.trim();
        if (x) salida.push({ texto: x, pausa: 180 });
      }
    }
    // respiro largo entre párrafos
    if (salida.length > 0) salida[salida.length - 1].pausa = PAUSA_PARRAFO;
  }
  return salida;
}
