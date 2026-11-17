/** Misión 003 · NOTICIAS RELACIONADAS — misma historia/tema, país o conflicto. */
import { tokens, jaccard } from "./texto.js";
import type { NotaMapa } from "./mapa.js";

export interface Relacion { nota: NotaMapa; puntuacion: number; motivos: string[] }

export function relacionadas(nota: NotaMapa, candidatas: NotaMapa[], max = 5): Relacion[] {
  const t0 = tokens(nota.titulo);
  const out: Relacion[] = [];
  for (const c of candidatas) {
    if (c.id === nota.id) continue;
    const motivos: string[] = [];
    let score = jaccard(t0, tokens(c.titulo)) * 6; // relevancia textual dominante
    if (nota.conflictTag && c.conflictTag && nota.conflictTag === c.conflictTag) { score += 3; motivos.push("mismo conflicto"); }
    if (nota.sourceCountry && c.sourceCountry && nota.sourceCountry === c.sourceCountry) { score += 2; motivos.push("mismo país"); }
    if (nota.tacticalTag && c.tacticalTag && nota.tacticalTag === c.tacticalTag) { score += 1; motivos.push("misma categoría"); }
    const dias = Math.abs(new Date(c.publicado).getTime() - new Date(nota.publicado).getTime()) / 86400_000;
    if (dias > 14) score *= 0.25;       // demasiado lejos en el tiempo
    else if (motivos.length) motivos.push(`≤14 días`);
    if (score >= 2.5) out.push({ nota: c, puntuacion: Math.round(score * 100) / 100, motivos });
  }
  return out.sort((a, b) => b.puntuacion - a.puntuacion).slice(0, max);
}
