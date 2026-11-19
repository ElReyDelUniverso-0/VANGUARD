// v420.0 VANGUARD LINGUA — comprobación de que una traducción está en el idioma pedido.
//
// MyMemory mezcla traducción automática con memorias aportadas por usuarios,
// y algunas están mal etiquetadas: para «es → fr» puede devolver una frase en
// inglés con un 99 % de coincidencia. Lingua no muestra un texto que no
// parezca estar en el idioma de destino. Son comprobaciones conservadoras:
// solo rechazan cuando la evidencia en contra es clara.

/** escritura dominante esperada por idioma de destino */
const ESCRITURA: Record<string, RegExp> = {
  ru: /\p{Script=Cyrillic}/u,
  uk: /\p{Script=Cyrillic}/u,
  el: /\p{Script=Greek}/u,
  ar: /\p{Script=Arabic}/u,
  fa: /\p{Script=Arabic}/u,
  ur: /\p{Script=Arabic}/u,
  he: /\p{Script=Hebrew}/u,
  hi: /\p{Script=Devanagari}/u,
  bn: /\p{Script=Bengali}/u,
  "zh-CN": /\p{Script=Han}/u,
  "zh-TW": /\p{Script=Han}/u,
  ja: /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u,
  ko: /\p{Script=Hangul}/u,
  th: /\p{Script=Thai}/u,
  am: /\p{Script=Ethiopic}/u,
};
const LATINA = /\p{Script=Latin}/u;

/** palabras funcionales muy frecuentes de las lenguas latinas más comunes en las memorias */
const FUNCIONALES: Record<string, string[]> = {
  en: ["the", "is", "are", "where", "what", "you", "and", "of", "to", "this", "with", "for", "it", "i", "my", "please", "thank", "your", "how", "do"],
  es: ["el", "la", "los", "las", "es", "está", "dónde", "qué", "de", "y", "que", "por", "con", "para", "un", "una", "gracias", "yo", "mi", "cómo"],
  fr: ["le", "la", "les", "est", "où", "que", "de", "et", "des", "une", "un", "je", "vous", "pour", "avec", "merci", "mon", "comment", "c'est", "du"],
  pt: ["o", "os", "as", "é", "está", "onde", "que", "de", "e", "do", "da", "um", "uma", "eu", "você", "obrigado", "obrigada", "para", "com", "não"],
  it: ["il", "lo", "gli", "è", "dove", "che", "di", "e", "un", "una", "io", "per", "con", "grazie", "sono", "come", "del", "della", "non", "mi"],
  de: ["der", "die", "das", "ist", "wo", "was", "und", "ich", "sie", "ein", "eine", "nicht", "mit", "für", "danke", "bitte", "zu", "den", "wie", "mein"],
  nl: ["de", "het", "een", "is", "waar", "wat", "en", "ik", "niet", "met", "voor", "dank", "alstublieft", "van", "hoe", "mijn", "u", "je", "zijn", "dat"],
  ca: ["el", "la", "els", "les", "és", "on", "què", "de", "i", "que", "per", "amb", "un", "una", "gràcies", "jo", "meu", "com", "no", "del"],
};

function palabras(t: string): string[] {
  return t
    .toLowerCase()
    .replace(/[¿?¡!.,;:«»"()—–-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** proporción de letras del texto que pertenecen a la escritura */
function proporcion(t: string, re: RegExp): number {
  const letras = [...t].filter((c) => /\p{L}/u.test(c));
  if (!letras.length) return 1;
  return letras.filter((c) => re.test(c)).length / letras.length;
}

/** idioma (entre los de FUNCIONALES) con más palabras funcionales en el texto, y sus aciertos */
export function idiomaProbable(t: string): { codigo: string; aciertos: number; delDestino: (c: string) => number } {
  const ws = palabras(t);
  const cuenta = (c: string) => ws.filter((w) => FUNCIONALES[c].includes(w)).length;
  let mejor = { codigo: "", aciertos: 0 };
  for (const c of Object.keys(FUNCIONALES)) {
    const n = cuenta(c);
    if (n > mejor.aciertos) mejor = { codigo: c, aciertos: n };
  }
  return { ...mejor, delDestino: (c: string) => (FUNCIONALES[c] ? cuenta(c) : 0) };
}

/**
 * ¿Parece `texto` escrito en el idioma `destino`? Devuelve el motivo del
 * rechazo o null si no hay evidencia clara en contra.
 */
export function motivoIdiomaIncorrecto(texto: string, destino: string, origen: string, original: string): string | null {
  const t = texto.trim();
  if (!t) return "vacía";
  const esperada = ESCRITURA[destino];
  if (esperada) {
    if (proporcion(t, esperada) < 0.5) return "escritura";
  } else if (proporcion(t, LATINA) < 0.5) {
    return "escritura";
  }
  // destino en escritura latina: buscar una lengua latina que encaje claramente mejor
  if (!esperada) {
    const p = idiomaProbable(t);
    const enDestino = p.delDestino(destino);
    // Para destinos sin lista propia (gallego, rumano, suajili…) solo se acusa al
    // inglés: las lenguas romances comparten demasiadas palabras funcionales.
    const comparable = Boolean(FUNCIONALES[destino]) || p.codigo === "en";
    if (comparable && p.codigo && p.codigo !== destino && p.aciertos >= 2 && enDestino * 2 < p.aciertos && enDestino < 2) {
      return `parece ${p.codigo}`;
    }
  }
  // devolvió el original sin cambios en una frase de varias palabras
  if (origen !== destino && palabras(t).length >= 3 && t.toLowerCase() === original.trim().toLowerCase()) return "sin traducir";
  return null;
}
