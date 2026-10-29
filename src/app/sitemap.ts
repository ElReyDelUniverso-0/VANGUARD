import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

// v18 SEO: sitemap con la portada a máxima prioridad y refresco diario
// (la portada muestra noticias en vivo, Google la re-rastrea a menudo).
// v34: la URL canónica debe apuntar a un dominio real (vanguard.world aún sin DNS)
// v202.0 PUERTAS ABIERTAS: el sitemap ahora incluye las últimas 50 noticias
// como URLs propias (/noticia/[id]) — 50 puertas más para Google, refrescadas
// en cada rastreo. Si la BD falla, las puertas estáticas quedan intactas.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // v202.0: puertas por noticia — cada cable vivo es una URL indexable
  let noticias: MetadataRoute.Sitemap = [];
  try {
    const rows = await db.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: { id: true, publishedAt: true },
    });
    noticias = rows.map((r) => ({
      url: `${SITE_URL}/noticia/${r.id}`,
      lastModified: new Date(r.publishedAt),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch {
    /* sitemap estático ante fallo de BD */
  }

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      // v35: página SEO server-rendered con noticias en vivo — imán de Google
      url: `${SITE_URL}/guerra-hoy`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      // v52: ZONA CERO — la ciudad que cae en vivo (espectáculo único)
      url: `${SITE_URL}/zona-cero`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      // v53: FRENTE TOTAL — el planeta en guerra en directo (10 frentes a la vez)
      url: `${SITE_URL}/ver-guerra`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      // v63.0 PRIMERA PÁGINA: la misión comunitaria es contenido real y estable
      url: `${SITE_URL}/mision`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...noticias,
  ];
}
