import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { TEATROS, PAGE_SIZE_ARCHIVO } from "@/lib/teatros";

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
  // v269.0 EL MAPA DEL ARCHIVO: la cota de v207 (500) se quedó corta — el
  // archivo medido de la casa es 1877 y 1377 puertas quedaban fuera del
  // mapa que Google rastrea. La cota manda sobre el archivo entero: 2000
  // (Google acepta 50.000 URLs por sitemap — el archivo cabe de sobra y
  // crece tranquilo). Si la BD falla, las puertas estáticas quedan intactas.
  const PUERTAS_NOTICIA = 2000;
  let noticias: MetadataRoute.Sitemap = [];
  try {
    const rows = await db.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: PUERTAS_NOTICIA,
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
      // v269: la misma groupBy mide la última señal real de cada teatro
      // (patrón v256/v262 — cero consultas de más): el lastModified del
      // mapa declara la última señal, no una fecha fingida (guardia v234).
      _max: { publishedAt: true },
    });
    const vivas = new Set(
      conVida
        .filter((g) => g._count.conflictTag >= 5 && g.conflictTag && TEATROS[g.conflictTag])
        .map((g) => g.conflictTag as string)
    );
    teatros = Object.keys(TEATROS)
      .filter((k) => vivas.has(k))
      .flatMap((k) => {
        // v269.0 EL MAPA DEL ARCHIVO — las páginas profundas que la sala
        // v261 hizo canónicas viajan ahora al mapa: derivadas de la count
        // real con el tamaño de la fuente única (PAGE_SIZE_ARCHIVO), nunca
        // inventadas. La página 1 ya viaja limpia (su canónica es al
        // limpio — v261); de la 2 en adelante se anuncia cada una.
        const g = conVida.find((x) => x.conflictTag === k);
        const paginas = g
          ? Math.max(1, Math.ceil(g._count.conflictTag / PAGE_SIZE_ARCHIVO))
          : 1;
        const ultima = g?._max.publishedAt;
        const urls: MetadataRoute.Sitemap = [
          {
            url: `${SITE_URL}/conflicto/${k}`,
            lastModified: ultima ? new Date(ultima) : new Date(),
            changeFrequency: "hourly" as const,
            priority: 0.8,
          },
        ];
        for (let p = 2; p <= paginas; p++) {
          urls.push({
            url: `${SITE_URL}/conflicto/${k}?page=${p}`,
            lastModified: ultima ? new Date(ultima) : new Date(),
            changeFrequency: "daily" as const,
            priority: 0.6,
          });
        }
        return urls;
      });
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
      // v213.0 EL PULSO — la sala EN VIVO: la redacción abierta 24 h,
      // revalidate 30 — Google News encuentra última hora con fuente
      url: `${SITE_URL}/en-vivo`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      // v216.0 LOS 100 — la vitrina de objetivos: la puerta de la adicción
      url: `${SITE_URL}/objetivos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      // v274.0 EL ARCHIVO DE LA HISTORIA — las 10 guerras reales de la
      // fuente (HISTORICAL_WARS) servidas en server: la memoria con la
      // que la casa lee las de hoy, indexable para las búsquedas de
      // historia (Guerras Púnicas, Cruzadas, Guerra Fría...)
      url: `${SITE_URL}/historia`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      // v281.0 LA SALA DE LOS SERVICIOS — los 36 expedientes reales de
      // inteligencia de las fuentes (AGENCIAS v127 + SERVICIOS v128)
      // servidos en server: la Comunidad de EE. UU. y la red del resto
      // del planeta, indexables para las búsquedas de servicios
      // (CIA, MI6, Mossad, FSB...)
      url: `${SITE_URL}/servicios`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      // v283.0 LA ARMERÍA DEL ARCHIVO — las 12 armas reales de la
      // fuente (ARSENAL) servidas en server: la AK-47 y el Shahed que
      // explican los conflictos de hoy, indexables para las búsquedas
      // de armas (AK-47, Javelin, HIMARS, despiece...)
      url: `${SITE_URL}/armeria`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      // v284.0 EL TABLERO DE LOS CONFLICTOS — las 33 regiones de la
      // fuente (CONFLICTS) servidas en server: nivel, intensidad y
      // dossier real, con puertas a las salas de teatro vivas,
      // indexable para las búsquedas de conflictos (Ucrania, Gaza,
      // Sahel, Taiwán...)
      url: `${SITE_URL}/conflictos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      // v285.0 LOS ROSTROS DEL PODER — las 34 fichas reales del
      // censo de poder de la fuente (ROSTROS) servidas en server:
      // los tronos, el dinero, el tribunal y los nuevos, indexables
      // para las búsquedas de poder (presidente, banquero, tribunal...)
      url: `${SITE_URL}/rostros`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      // v217.0 LA EMISORA — la guerra en voz alta + muro de audios
      url: `${SITE_URL}/audios`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      // v218.0 EL NÚCLEO — el censo de módulos y la búsqueda global
      url: `${SITE_URL}/nucleo`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      // v265.0 EL PÓRTICO DE LAS SALAS — la puerta de las salas anunciada
      // a Google: el índice de los teatros (desde v206 solo vivían los
      // /conflicto/[tag]; la raíz era un 404)
      url: `${SITE_URL}/conflicto`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      // v224.0 EL ESTRATEGA — escenarios con datos reales, nunca predicciones
      url: `${SITE_URL}/escenarios`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      // v211.0 EL VÉRTIGO — el feed infinito: puerta para el público de
      // deslizamiento (la fórmula TikTok indexable por Google)
      url: `${SITE_URL}/vertigo`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      // v215.0 EL MUNDO — el planeta 3D en vivo: guerras, gobiernos y
      // gargantas estratégicas en un globo interactivo
      url: `${SITE_URL}/mundo`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      // v215.0 MODO ESPÍA — radar de gobiernos en fuentes abiertas
      url: `${SITE_URL}/espia`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      // v215.0 MODO TRADUCTOR — las noticias del mundo en 8 idiomas
      url: `${SITE_URL}/traductor`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      // v214.0 LA PUERTA — el selector de modo + cuenta: la puerta de
      // entrada elegible (VÉRTIGO / EN VIVO / GUERRA HOY / ZONA CERO…)
      url: `${SITE_URL}/modo`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
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
