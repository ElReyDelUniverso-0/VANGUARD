// ============================================================
// v421.0 /sitemaps/<seccion>/sitemap.xml — UN ARCHIVO POR SECCIÓN
//
// /sitemaps/noticias/sitemap.xml, /sitemaps/geopolitica/sitemap.xml,
// /sitemaps/mapas/sitemap.xml… Cada uno con las URLs de SU sección, ya
// deduplicadas. El límite del protocolo es 50.000 URLs o 50 MB por
// archivo; el más grande hoy (/noticias) lleva 2.000 y crece solo.
//
// Una sección desconocida responde 404 (nunca un archivo vacío: un
// sitemap vacío en Search Console es un error que se aprende a ignorar).
// ============================================================
import { SECCIONES } from "@/lib/seo/secciones";
import { CABECERAS_XML, urlset, urlsDeSeccion } from "@/lib/seo/entrega";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LIMITE_GOOGLE = 50000;

export async function GET(
  _peticion: Request,
  { params }: { params: Promise<{ seccion: string }> }
) {
  const { seccion } = await params;
  // se admite «noticias» y también «sitemap-noticias.xml» (por si alguien
  // copia el nombre del archivo a mano)
  const limpio = seccion
    .replace(/^sitemap-/, "")
    .replace(/\.xml$/, "")
    .toLowerCase();
  const conocida = SECCIONES.find((s) => s.id === limpio);
  if (!conocida) return new Response("Sección desconocida", { status: 404 });

  let urls = await urlsDeSeccion(conocida.id);
  if (urls.length > LIMITE_GOOGLE) urls = urls.slice(0, LIMITE_GOOGLE);

  return new Response(urlset(urls), { headers: CABECERAS_XML });
}
