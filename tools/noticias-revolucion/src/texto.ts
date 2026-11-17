/** Misión 003 · Normalización de titulares en español para comparación. */
const STOPWORDS = new Set(("de la el los las un una unos unas y e o u a ante con contra desde durante en entre hacia hasta mediante para por segun sin sobre tras al del es son fue fueron ser estar estan esta este estos esta ese esa aquel aquella como mas pero sus su se lo hemos han ha habia hay no si ya muy entre entre otras otro otros sus tras sus tambien aun hoy ayer manana sobre entre").split(/\s+/));

export function normalizarTexto(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñü\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(s: string): Set<string> {
  const t = normalizarTexto(s).split(" ").filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  return new Set(t);
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}
