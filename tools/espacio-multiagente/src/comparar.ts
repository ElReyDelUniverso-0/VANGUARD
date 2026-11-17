/** ESPACIO MULTIAGENTE · Comparar respuestas de especialistas — solapamiento léxico honesto,
 *  no «quién tiene razón». La verdad la decide la fuente, no el texto. */
const STOP = new Set(("de la el los las un una y y e o a en con para por que se no es son lo su sus del al como mas muy entre sobre tras tras entre").split(/\s+/));
function tokens(s: string): Set<string> {
  return new Set((s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9ñü\s]/g, " ").split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w)));
}
export function solapamiento(a: string, b: string): number {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return Math.round((inter / (A.size + B.size - inter)) * 100) / 100;
}
export function matrizSolapamiento(respuestas: { rol: string; texto: string }[]): { par: [string, string]; jaccard: number }[] {
  const out: { par: [string, string]; jaccard: number }[] = [];
  for (let i = 0; i < respuestas.length; i++)
    for (let j = i + 1; j < respuestas.length; j++)
      out.push({ par: [respuestas[i].rol, respuestas[j].rol], jaccard: solapamiento(respuestas[i].texto, respuestas[j].texto) });
  return out;
}
