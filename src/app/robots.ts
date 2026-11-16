import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// ============================================================
// v404.1 — robots DINÁMICO (antes public/robots.txt, estático)
//
// Defecto medido en producción: el robots.txt estático anunciaba el sitemap en
// un host y el propio sitemap y los canonical salían de @/lib/site (otro host).
// Ahora el robots lee la MISMA fuente: cambiar el dominio es una línea en site.ts.
// Reglas IDÉNTICAS a las del archivo anterior (indexación total, /api/ fuera
// — v204 EL ESCUDO: las cocinas no se rastrean y algunas son caras).
// ============================================================

const BOTS = ["Googlebot", "Bingbot", "Twitterbot", "facebookexternalhit", "WhatsApp", "TelegramBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...BOTS.map((userAgent) => ({ userAgent, allow: "/" })),
      { userAgent: "*", allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
