// ════════════════════════════════════════════════════════════════
// v215.0 EL MUNDO — LA INSTANTÁNEA VIVA DEL PLANETA (server-only).
// Una sola función alimenta las dos puertas del mundo:
//   · /mundo (página server)     → el globo nace YA vivo con el 1er byte
//   · /api/mundo (el latido JSON) → el globo respira cada 60 s
// SOLO cables REALES (externalId real; las «curated-» de respaldo
// jamás encienden el planeta — la exactitud es ley de la casa).
// ════════════════════════════════════════════════════════════════

import { db } from "@/lib/db";
import { TEATROS } from "@/lib/teatros";
import { TEATRO_3D } from "@/lib/mundo";

export interface UltimoCable {
  t: string; // titular
  f: string; // fuente
  fecha: string; // ISO
  id: string; // → /noticia/[id]
}

export interface TeatroVivo {
  slug: string;
  nombre: string;
  n: number; // cables reales de las últimas 24 h
  lat: number;
  lng: number;
  ultimo: UltimoCable | null;
}

export interface InstantaneaMundo {
  generado: string;
  hoy: number; // cables reales de las últimas 24 h
  paises: number; // países distintos en la muestra
  teatros: TeatroVivo[]; // SIEMPRE los 9 teatros (n puede ser 0)
}

export async function buildInstantaneaMundo(): Promise<InstantaneaMundo> {
  const desde = new Date(Date.now() - 24 * 3600_000);
  const rows = await db.newsItem.findMany({
    where: {
      publishedAt: { gte: desde },
      externalId: { not: { startsWith: "curated-" } },
    },
    orderBy: { publishedAt: "desc" },
    take: 400,
    select: {
      id: true,
      title: true,
      source: true,
      publishedAt: true,
      conflictTag: true,
      sourceCountry: true,
    },
  });

  // los 9 teatros SIEMPRE vivos en la lista (aunque hoy no llevan cables)
  const mapa = new Map<string, TeatroVivo>();
  for (const [slug, c] of Object.entries(TEATRO_3D)) {
    mapa.set(slug, {
      slug,
      nombre: TEATROS[slug]?.nombre ?? slug,
      n: 0,
      lat: c.lat,
      lng: c.lng,
      ultimo: null,
    });
  }
  for (const r of rows) {
    const slug = r.conflictTag;
    if (!slug || !mapa.has(slug)) continue;
    const e = mapa.get(slug)!;
    e.n++;
    if (!e.ultimo) {
      e.ultimo = {
        t: r.title,
        f: r.source,
        fecha: new Date(r.publishedAt).toISOString(),
        id: r.id,
      };
    }
  }

  const paises = new Set<string>();
  for (const r of rows) if (r.sourceCountry) paises.add(r.sourceCountry.toUpperCase());

  return {
    generado: new Date().toISOString(),
    hoy: rows.length,
    paises: paises.size,
    teatros: [...mapa.values()],
  };
}
