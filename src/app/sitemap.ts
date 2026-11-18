import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { TEATROS, PAGE_SIZE_ARCHIVO } from "@/lib/teatros";
import { MODULOS, SALAS_INTERNAS } from "@/components/portada/modulos";

// v18 SEO: sitemap con la portada a máxima prioridad y refresco diario
// (la portada muestra noticias en vivo, Google la re-rastrea a menudo).
// v34: la URL canónica debe apuntar a un dominio real (vanguard.world aún sin DNS)
// v202.0 PUERTAS ABIERTAS: el sitemap incluye las noticias como URLs propias
// (/noticia/[id]) — refrescadas en cada rastreo.
// v207.0 INFINITO: 50 → 500 puertas — Google puede entrar a TODO el archivo. Si la BD falla, las puertas estáticas quedan intactas.
import { SITE_URL } from "@/lib/site"; // v403.6: una sola puerta
import { CONSTELACIONES } from "@/lib/vanguard/mapa-salas"; // v403.9: las 20 puertas
import { PUERTAS_SALAS } from "@/lib/vanguard/puertas-salas"; // v405.8: las puertas de las salas
import { PAISES_GEO } from "@/lib/geo-paises"; // v405.12: el mapa de los mundos

// v402.11 EL MAPA QUE GOOGLE LEE — auditoría de descubrimiento (Search Console:
// «Google no reconoce esta URL» en /conflicto/*). Tres reglas nuevas, todas
// derivadas de fuentes únicas (nada a mano, nada inventado):
// ① MISMA REGLA QUE LA PÁGINA: /conflicto/[tag] responde 200 en cuanto el
//    teatro existe en TEATROS y tiene ≥ 1 cable (si no, 404). El mapa exigía
//    ≥ 5 y dejaba fuera páginas públicas, enlazadas e indexables (Líbano).
//    Un teatro nuevo en TEATROS con cables entra solo, sin tocar este archivo.
// ② NADA «noindex» EN EL MAPA: las SALAS_INTERNAS llevan X-Robots-Tag noindex
//    (next.config) y aun así viajaban aquí → Search Console las marca como
//    «Enviada pero con noindex». Se filtran con la misma lista.
// ③ LASTMOD VERDADERO: las rutas fijas declaraban la hora del build (cada
//    despliegue «modificaba» 54 URLs) y Google aprende a ignorar un lastmod
//    que siempre cambia. Las salas que viven del archivo declaran la última
//    noticia real; el resto, ninguna fecha (permitido por el protocolo).
// + sin URLs duplicadas (la primera aparición manda).
const MIN_CABLES_TEATRO = 1; // = regla de la página (items.length === 0 → 404)
const SALAS_DEL_ARCHIVO = ["", "/guerra-hoy", "/en-vivo", "/conflicto", "/conflictos", "/modulo/conflictos"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // v202.0: puertas por noticia — cada cable vivo es una URL indexable
  // v269.0 EL MAPA DEL ARCHIVO: la cota de v207 (500) se quedó corta — el
  // archivo medido de la casa es 1877 y 1377 puertas quedaban fuera del
  // mapa que Google rastrea. La cota manda sobre el archivo entero: 2000
  // (Google acepta 50.000 URLs por sitemap — el archivo cabe de sobra y
  // crece tranquilo). Si la BD falla, las puertas estáticas quedan intactas.
  const PUERTAS_NOTICIA = 2000;
  let noticias: MetadataRoute.Sitemap = [];
  let ultimaNoticia: Date | undefined;
  try {
    const rows = await db.newsItem.findMany({
      orderBy: { publishedAt: "desc" },
      take: PUERTAS_NOTICIA,
      select: { id: true, publishedAt: true },
    });
    // el máximo real (en la base conviven fechas en texto y en milisegundos:
    // el orden de SQLite no garantiza que la primera fila sea la más nueva)
    for (const r of rows) {
      const d = new Date(r.publishedAt);
      if (!ultimaNoticia || d > ultimaNoticia) ultimaNoticia = d;
    }
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
    // v403.2: el MAX de SQL no sirve aquí — publishedAt guarda unas filas en
    // texto y otras en milisegundos y SQLite ordena el texto por encima de los
    // números (Gaza declaraba 31-oct teniendo cables del 14-nov). La última
    // señal real de cada teatro se calcula aquí, fecha a fecha.
    const senales = await db.newsItem.findMany({
      where: { conflictTag: { not: null } },
      select: { conflictTag: true, publishedAt: true },
    });
    const ultimaDe = new Map<string, Date>();
    for (const r of senales) {
      if (!r.conflictTag) continue;
      const d = new Date(r.publishedAt);
      const prev = ultimaDe.get(r.conflictTag);
      if (!prev || d > prev) ultimaDe.set(r.conflictTag, d);
    }
    const vivas = new Set(
      conVida
        .filter((g) => g._count.conflictTag >= MIN_CABLES_TEATRO && g.conflictTag && TEATROS[g.conflictTag])
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
        const ultima = ultimaDe.get(k) ?? g?._max.publishedAt;
        const urls: MetadataRoute.Sitemap = [
          {
            url: `${SITE_URL}/conflicto/${k}`,
            lastModified: ultima ? new Date(ultima) : undefined,
            changeFrequency: "hourly" as const,
            priority: 0.8,
          },
        ];
        for (let p = 2; p <= paginas; p++) {
          urls.push({
            url: `${SITE_URL}/conflicto/${k}?page=${p}`,
            lastModified: ultima ? new Date(ultima) : undefined,
            changeFrequency: "daily" as const,
            priority: 0.6,
          });
        }
        return urls;
      });
  } catch {
    /* sin teatros dinámicos ante fallo de BD */
  }

  const estaticas: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/teatro-3d`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/novedades`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.92,
    },
    {
      url: `${SITE_URL}/universo`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.93,
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
      // v406.1 LA FORJA — la vitrina del ecosistema de creadores (las obras,
      // perfiles y colecciones quedan noindex mientras la base no sea permanente)
      url: `${SITE_URL}/creadores`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
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
    // v402.4 — el Cuartel (módulo Juego) faltaba en el mapa del sitio
    {
      url: `${SITE_URL}/cuartel`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      // v402.4 EL CRUCE — los sismos del día y las alertas de la ONU
      // ordenados por la distancia real a esta casa, en kilómetros
      // calculados con las coordenadas de USGS y GDACS
      url: `${SITE_URL}/cruce`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      // v402.3 LAS DIEZ LLAVES — las diez fuentes abiertas que la casa
      // consulta en vivo (sismos, eventos naturales, alertas ONU/CE,
      // pobreza, desplazamiento, efemérides, clima, aire, cambio, bitcoin),
      // indexables para quien busque de dónde sale cada cifra
      url: `${SITE_URL}/herramientas`,
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
      // v405.9 EL CENTRO DE MAPAS — la sala /mapas: ocho capas geográficas
      // reales sobre el globo de la casa (mundial ISO 3166-1, político del
      // Banco Mundial, físico de la NASA, económico y demográfico del Banco
      // Mundial, temático de divisas reales, histórico del archivo de guerras
      // y de acontecimientos del núcleo), con buscador de países, fichas por
      // país y sus noticias. Indexable para las búsquedas de geografía,
      // mapas y datos por país.
      url: `${SITE_URL}/mapas`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      // v405.11 TU ESPACIO DE TRABAJO — la mesa del operador: proyectos con
      // piezas (mapas, simulaciones, escenarios, herramientas, investigaciones
      // y notas), paneles reorganizables, sesiones e historial. El trabajo se
      // guarda en el aparato del visitante, así que la página es pública pero
      // no hay datos personales que rastrear.
      url: `${SITE_URL}/espacio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      // v405.12 EL MAPA DE LOS MUNDOS — el índice geográfico de la casa: 249
      // países con ficha unificada (identidad ISO, capital, población,
      // superficie, moneda, gobierno, líder, gasto militar del Banco Mundial y
      // fronteras topológicas reales) y el registro de los quince mundos.
      url: `${SITE_URL}/mundos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
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
      // v367.1 EL OJO DEL DUEÑO — la crónica del día (parte real, refresco por hora).
      // LA TORRE (/torre) NO entra a propósito: es un panel de salud interno y
      // viaja con robots:{index:false} — a Google se le da lo que el lector usa.
      url: `${SITE_URL}/cronica`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.7,
    },
    {
      // v367.1 — el centinela personal: sala pública, contenido local del visitante
      url: `${SITE_URL}/centinela`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      // v367.2 — LA VOZ MAESTRA: sala pública de la voz y del maestro
      url: `${SITE_URL}/voz`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      // v367.3 LA MÚSICA CON FORMA — el himno, las piezas y la radio de la casa.
      url: `${SITE_URL}/musica`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      // v367.6 EL PERFIL DEL JUGADOR — el carnet, el código y los permisos.
      url: `${SITE_URL}/perfil`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      // v367.9 LA SALA DE LA CALIDAD — el informe de los seis agentes.
      url: `${SITE_URL}/calidad`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      // v367.4 EL CATÁLOGO — índice real de cien piezas ya construidas.
      url: `${SITE_URL}/catalogo`,
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
    {
      // RONDA EL CENTINELA DE BOLSILLO — el detector de llaves en el
      // navegador del visitante (patrones horneados del Buscador, cero red)
      url: `${SITE_URL}/escudo/detector`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    // v402.6 LOS NUEVE MÓDULOS: el índice y la portada de cada módulo
    {
      url: `${SITE_URL}/modulos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    // v403.9 CADA CONSTELACIÓN TIENE SU PUERTA: las 20 constelaciones del
    // mapa de las 155 salas, derivadas de la fuente (mapa-salas.ts) — si
    // mañana se añade una sección al cuartel, entra sola al mapa de Google.
    ...CONSTELACIONES.map((c) => ({
      url: `${SITE_URL}/constelacion/${c.clave}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    // v405.8 LAS PUERTAS DE LAS SALAS: cada sala con texto real tiene su
    // puerta /sala/<clave> (las que no, llevan noindex y NO entran: regla ②).
    // Derivado de la fuente: una sala que gana descripción entra sola.
    ...CONSTELACIONES.flatMap((c) => c.salas)
      .filter((s) => PUERTAS_SALAS[s.clave]?.indexable)
      .map((s) => ({
        url: `${SITE_URL}/sala/${s.clave}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ...MODULOS.filter((m) => m.id !== "estado").map((m) => ({
      url: `${SITE_URL}/modulo/${m.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    // v405.12 LA FICHA DE CADA PAÍS: 249 puertas /mundos/<iso>, derivadas del
    // censo geográfico (una entrada nueva en geo-paises entra sola). Cada una
    // es una página prerenderizada con datos reales y enlaces a sus vecinos:
    // es la puerta que Google necesita para «capital de X», «fronteras de X».
    ...PAISES_GEO.map((g) => ({
      url: `${SITE_URL}/mundos/${g.iso2}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ];

  // ② y ③: fuera las salas noindex; lastmod real o ninguno
  const internas = new Set(SALAS_INTERNAS.map((r) => `${SITE_URL}${r}`));
  const delArchivo = new Set(SALAS_DEL_ARCHIVO.map((r) => `${SITE_URL}${r}`));
  const fijas = estaticas
    .filter((e) => !internas.has(e.url))
    .map((e) => ({ ...e, lastModified: delArchivo.has(e.url) ? ultimaNoticia : undefined }));

  // + sin duplicados
  const vistas = new Set<string>();
  return [...fijas, ...teatros, ...noticias].filter((e) => {
    if (vistas.has(e.url)) return false;
    vistas.add(e.url);
    return true;
  });
}
