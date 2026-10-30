import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { TEATROS } from "@/lib/teatros";

// v18 SEO: sitemap con la portada a máxima prioridad y refresco diario
// (la portada muestra noticias en vivo, Google la re-rastrea a menudo).
// v34: la URL canónica debe apuntar a un dominio real (vanguard.world aún sin DNS)
// v202.0 PUERTAS ABIERTAS: el sitemap incluye las noticias como URLs propias
// (/noticia/[id]) — refrescadas en cada rastreo.
// v207.0 INFINITO: 50 → 500 puertas — Google puede entrar a TODO el archivo. Si la BD falla, las puertas estáticas quedan intactas.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // v202.0: puertas por noticia — cada cable vivo es una URL indexable
  let noticias: MetadataRoute.Sitemap = [];
  try {
    const rows = await db.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: 500,
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

  // v206.0 MÁS PUERTAS: una página por TEATRO DE GUERRA (/conflicto/[tag]) —
  // solo teatros con cables vivos hoy (nada vacío para Google) — y la
  // política de privacidad que exige Publisher Center.
  let teatros: MetadataRoute.Sitemap = [];
  try {
    const conVida = await db.newsItem.groupBy({
      by: ["conflictTag"],
      where: { conflictTag: { not: null } },
      _count: { conflictTag: true },
    });
    const vivas = new Set(
      conVida
        .filter((g) => g._count.conflictTag >= 5 && g.conflictTag && TEATROS[g.conflictTag])
        .map((g) => g.conflictTag as string)
    );
    teatros = Object.keys(TEATROS)
      .filter((k) => vivas.has(k))
      .map((k) => ({
        url: `${SITE_URL}/conflicto/${k}`,
        lastModified: new Date(),
        changeFrequency: "hourly" as const,
        priority: 0.8,
      }));
  } catch {
    /* sin teatros dinámicos ante fallo de BD */
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
    {
      // v207.0: privacidad pública — confianza para Google News (Publisher Center)
      url: `${SITE_URL}/privacidad`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...teatros,
    ...noticias,
  ];
}
