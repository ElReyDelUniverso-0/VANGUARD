import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// v405.0 LA CASA ÚNICA — EL ROBOT DEJA DE TENER SU PROPIA OPINIÓN DEL DOMINIO.
//
// Antes esto era `public/robots.txt`, un archivo estático que declaraba a mano
// «Sitemap: https://vanguard.vanguard-casa.workers.dev/sitemap.xml» mientras el sitemap
// (src/app/sitemap.ts, v403.6) ya se generaba con `SITE_URL`. Dos verdades del
// mismo dominio en dos archivos: si mañana cambia la casa, una de las dos
// seguía apuntando a la vieja y nadie se enteraba. Ahora el robot se genera
// igual que el sitemap, de la misma fuente y en el mismo idioma.
//
// Las REGLAS se conservan exactas (mismos agentes, mismos Allow, el mismo
// Disallow /api/ del escudo v204) y los comentarios del archivo viejo siguen
// aquí, como comentarios del código. Lo único que cambia de verdad es que el
// dominio ya no está escrito a mano en ningún segundo sitio.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Indexación total para buscadores y redes sociales (v34, intacto).
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "Twitterbot", allow: "/" },
      { userAgent: "facebookexternalhit", allow: "/" },
      { userAgent: "WhatsApp", allow: "/" },
      { userAgent: "TelegramBot", allow: "/" },
      // v204 EL ESCUDO — las cocinas no se rastrean: las rutas /api/ no son
      // páginas públicas y algunas ejecutan trabajo caro (la mirada del
      // escudo, el núcleo).
      { userAgent: "*", allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
