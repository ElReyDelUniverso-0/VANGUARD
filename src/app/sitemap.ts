import type { MetadataRoute } from "next";

// v18 SEO: sitemap con la portada a máxima prioridad y refresco diario
// (la portada muestra noticias en vivo, Google la re-rastrea a menudo).
// v34: la URL canónica debe apuntar a un dominio real (vanguard.world aún sin DNS)
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];
}
