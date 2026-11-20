// ============================================================
// v421.0 /sitemap.xml — EL ÍNDICE, NO EL ARCHIVO
//
// Antes esta URL devolvía las 3.766 páginas en un solo archivo. Ahora
// devuelve el ÍNDICE: ocho sitemaps, uno por sección, cada uno con su
// conteo y su última modificación real. Nada más cambia para Google: los
// robots.txt siguen anunciando exactamente /sitemap.xml (una sola puerta
// que nunca hay que volver a tocar cuando crezca el mapa).
//
// Por qué importa: Search Console informa POR ARCHIVO. Con un archivo
// único, «1,2 % con error» no dice qué sala falla. Dividido, se ve.
// ============================================================
import { SITE_URL } from "@/lib/site";
import { CABECERAS_XML, censoDeSecciones, sitemapindex } from "@/lib/seo/entrega";

// Se calcula en cada visita (con memoria de 10 min en la instancia): así el
// lastmod es el real y el build no depende de la base de datos.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const censo = await censoDeSecciones();
  const xml = sitemapindex(
    censo.filter((f) => f.urls > 0).map((f) => ({ archivo: f.archivo, ultima: f.ultima })),
    SITE_URL
  );
  return new Response(xml, { headers: CABECERAS_XML });
}
