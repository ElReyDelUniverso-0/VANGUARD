// ═══════════════════════════════════════════════════════════════════════════
// v432.4 · EL ALGORITMO — rasgos del contenido (lo que la máquina «ve»)
//
// Un algoritmo no ve vídeos: ve números. Este fichero convierte cualquier
// tarjeta de la casa (un vídeo, un meme, un pulso del Productor, un canal en
// vivo, tu última partida de la escuela) en un vector de rasgos estable:
//
//   tipo:video · tema:divisas · autor:@alguien · idioma:es · largo:corto
//
// Los temas salen del título y de las etiquetas reales del contenido — nunca
// de un catálogo inventado. Si el título no dice nada, el contenido aporta
// menos rasgos y el motor lo sabrá (y lo dirá).
//
// Puro: sin red, sin almacenes, sin relojes. Se prueba solo.
// ═══════════════════════════════════════════════════════════════════════════

/** Palabras que no dicen nada de un contenido: fuera del vector. */
const VACIAS = new Set([
  "de", "del", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "u",
  "a", "ante", "con", "en", "para", "por", "que", "se", "su", "sus", "al", "lo",
  "es", "son", "como", "más", "mas", "pero", "ya", "muy", "sin", "sobre", "este",
  "esta", "esto", "estos", "estas", "hoy", "ahora", "aquí", "aqui", "tu", "tus",
  "mi", "mis", "nos", "les", "le", "the", "of", "and", "to", "in", "is", "it",
]);

/** Sin acentos, sin mayúsculas, sin signos: la forma en que se compara aquí. */
export function llano(s: string): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s#@_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Trocea un texto en palabras con sentido (>= 4 letras, sin vacías). */
export function palabras(texto: string): string[] {
  const vistos = new Set<string>();
  const salida: string[] = [];
  for (const p of llano(texto).split(" ")) {
    const limpia = p.replace(/^[#@_-]+|[#@_-]+$/g, "");
    if (limpia.length < 4) continue;
    if (VACIAS.has(limpia)) continue;
    if (/^\d+$/.test(limpia)) continue;
    if (vistos.has(limpia)) continue;
    vistos.add(limpia);
    salida.push(limpia);
  }
  return salida;
}

/** Los temas de un contenido: como mucho seis, los más «decisivos» primero. */
export function temasDe(titulo: string, extra?: readonly string[]): string[] {
  const temas = [...palabras(titulo), ...(extra ?? []).flatMap((e) => palabras(e))];
  const unicos = Array.from(new Set(temas));
  // los temas largos describen mejor que los cortos
  unicos.sort((a, b) => b.length - a.length);
  return unicos.slice(0, 6);
}

/**
 * Rasgos de un contenido. El orden importa: los tres primeros son los que el
 * motor pesa más (qué es, de qué va, quién lo firma).
 */
export function rasgosDe(c: {
  tipo: string;
  autor: string;
  titulo: string;
  temas?: readonly string[];
}): string[] {
  const rasgos = [
    `tipo:${llano(c.tipo)}`,
    ...temasDe(c.titulo, c.temas).map((t) => `tema:${t}`),
    `autor:${llano(c.autor)}`,
  ];
  return Array.from(new Set(rasgos));
}

/** Cuánto pesa cada familia de rasgo en el gusto del espectador. */
export const PESO_RASGO: Record<string, number> = {
  tipo: 0.34,
  tema: 0.42,
  autor: 0.24,
};

/** Familia de un rasgo: "tema:divisas" → "tema". */
export function familiaDe(rasgo: string): string {
  const i = rasgo.indexOf(":");
  return i > 0 ? rasgo.slice(0, i) : "tema";
}
