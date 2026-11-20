// ============================================================
// v421.0 LA ENTREGA DEL MAPA — una sola medición, muchos archivos
//
// El mapa completo se construye con construirMapa() (src/lib/seo/mapa.ts),
// la misma función de siempre, con las mismas fuentes. Lo único nuevo es
// que ahora se mide UNA vez por instancia caliente y se reparte en los
// archivos de sección: sin esto, cada uno de los 8 archivos repetiría las
// mismas consultas (2.000 noticias, los teatros vivos, el catálogo de
// países, 250 fichas…) y Google descargaría el índice 9 veces para nada.
// ============================================================
import type { MetadataRoute } from "next";
import { construirMapa } from "./mapa";
import { SECCIONES, seccionDe, archivoDe, type SeccionId } from "./secciones";

const TTL_MS = 10 * 60 * 1000; // 10 minutos: el mapa no cambia más rápido que las noticias
let cache: { ts: number; mapa: MetadataRoute.Sitemap } | null = null;

export async function mapaCacheado(): Promise<MetadataRoute.Sitemap> {
  if (cache && Date.now() - cache.ts < TTL_MS) return cache.mapa;
  const mapa = await construirMapa();
  cache = { ts: Date.now(), mapa };
  return mapa;
}

/** Las URLs de una sección, ya filtradas y sin repetir. */
export async function urlsDeSeccion(id: SeccionId): Promise<MetadataRoute.Sitemap> {
  const mapa = await mapaCacheado();
  const vistas = new Set<string>();
  return mapa.filter((e) => {
    if (seccionDe(e.url) !== id) return false;
    if (vistas.has(e.url)) return false;
    vistas.add(e.url);
    return true;
  });
}

/** Cuántas URLs y qué última fecha tiene una sección (para el índice). */
export async function censoDeSecciones() {
  const mapa = await mapaCacheado();
  return SECCIONES.map((s) => {
    const propias = mapa.filter((e) => seccionDe(e.url) === s.id);
    let ultima: Date | undefined;
    for (const e of propias) {
      const d = e.lastModified ? new Date(e.lastModified) : undefined;
      if (d && !Number.isNaN(d.getTime()) && (!ultima || d > ultima)) ultima = d;
    }
    return { id: s.id, titulo: s.titulo, archivo: archivoDe(s.id), urls: propias.length, ultima };
  });
}

export * from "./xml";
