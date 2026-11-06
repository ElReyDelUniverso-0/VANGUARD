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
      // v283.0 LA ARMERÍA DEL ARCHIVO — las armas reales de la
      // fuente (ARSENAL) servidas en server: la AK-47 y el Shahed que
      // explican los conflictos de hoy, indexables para las búsquedas
      // de armas (AK-47, Javelin, HIMARS, Patriot, despiece...)
      // (rodillo v326: 12 → 21 armas — la cifra la lleva la fuente)
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
      // v293.0 EL ARCHIVO MUNDIAL — la fuente archive-data (v12, REAL)
      // servida en server: 44 curiosidades verídicas, 8 eras desde la
      // Prehistoria, los contadores de las grandes guerras, el crimen
      // global y 8 expedientes de cartel, indexable para las búsquedas
      // de historia y crimen organizado
      url: `${SITE_URL}/archivo-mundial`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      // v294.0 EL ATLAS DEL PLANETA — la fuente atlas-data (v121, REAL,
      // «datos verificados hasta octubre 2025») servida en server: 84
      // naciones con capital, población, superficie, moneda, gobierno y
      // líder real; 78 personas del poder con su sede real y las 24
      // rutas del poder (rodillo v324: el sur entró), indexable para las búsquedas de geografía y
      // poder (capital, presidente, gobierno, población...)
      url: `${SITE_URL}/atlas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      // v295.0 LA VERDAD CRUDA — la fuente dark-data (v24, documentada,
      // «todas las entradas citan fuentes públicas (ONU, CPJ, RSF, ACLED,
      // HRW, OSCE)») servida en server: 12 abusos de guerra verificados
      // con su fuente citada, el memorial de 10 periodistas caídos, 14
      // incidentes documentados, 4 sistemas de dron con su anatomía y
      // las cifras del coste, indexable para las búsquedas de
      // documentación de guerra (Kramatorsk, Bucha, Mariúpol, memorial
      // de prensa, guerra de drones...)
      url: `${SITE_URL}/verdad-cruda`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      // v296.0 LAS DIVISAS DEL PLANETA — la fuente world-data (v20, REAL,
      // «DATASET MUNDIAL REGENERADO — no editar a mano») servida en
      // server: 247 países y territorios con su moneda oficial real
      // (ISO 4217, símbolo y tasa por 1 USD — captura open.er-api.com),
      // 154 monedas únicas y las monedas compartidas, indexable para
      // las búsquedas de monedas (moneda de Japón, euro, yen, tasa...)
      url: `${SITE_URL}/divisas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      // v297.0 EL PODER MUNDIAL — la captura REAL del Banco Mundial (v44)
      // congelada en server: 167 países con su gasto militar (MS.MIL.XPND.CD),
      // su personal (MS.MIL.TOTL.P1) y su esfuerzo % del PIB
      // (MS.MIL.XPND.GD.ZS), captura del 2026-11-05 con mrnev=1; el ranking
      // del dinero, la fuerza y el esfuerzo, indexable para las búsquedas
      // de poder militar (gasto militar de Estados Unidos, ejército más
      // grande, % del PIB militar...)
      url: `${SITE_URL}/poder`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      // v298.0 LA FOTOTECA DEL PLANETA — la capa REAL del aparato (v98
      // ORO TOTAL) congelada en server: 50 fotografías reales servidas
      // localmente (verificadas contra el disco, 11,8 MB) en 5 categorías
      // con su nota editorial y su fuente declarada verbatim, indexable
      // para las búsquedas de imágenes y lugares (foto de Chernóbil,
      // canal de Suez, Pentágono, moáis de Rapa Nui...)
      url: `${SITE_URL}/galeria`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      // v301.0 LA BIBLIOTECA OSCURA — la biblioteca de la v63 sale del
      // teaser de /guerra-hoy a su sala server: 43 entradas con veredicto
      // REAL/MITO/PARCIAL y fuente real (14 teorías · 11 armas-idea ·
      // 10 civilizaciones · 8 documentos desclasificados), cada entrada
      // abierta a su documento original (CIA, National Archives, NSA,
      // FBI Vault...), indexable para las búsquedas de documentos
      // desclasificados (MK-ULTRA, Tartessos, Gateway, HAARP...)
      url: `${SITE_URL}/oscura`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
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
      // v358.0 WORLD PULSE — el centro de inteligencia mundial: indicadores
      // reales del Banco Mundial, cronología de cables y el índice WPI
      url: `${SITE_URL}/pulso-mundial`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
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
    {
      // LA SALA DEL ESCUDO — el buscador de API keys de la casa (ley v204)
      url: `${SITE_URL}/escudo`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      // EL ESTADO DE LA CASA — el latido público del server (health v27/v84)
      url: `${SITE_URL}/estado`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...teatros,
    ...noticias,
  ];
}
