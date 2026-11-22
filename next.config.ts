import type { NextConfig } from "next";
// v405.0 LA CASA ÚNICA — la puerta y sus gemelos se leen de UNA fuente
// (src/lib/site.ts). Aquí no se escribe ni un dominio a mano: si el Dueño
// pone dominio propio, se cambia NEXT_PUBLIC_SITE_URL y este archivo obedece.
import { SITE_URL, PUERTAS_GEMELAS } from "./src/lib/site";

// v402.11 EL MAPA QUE GOOGLE LEE — METADATOS EN EL <head> PARA LOS BUSCADORES.
// Next 16 «transmite» los metadatos (title, description, canonical, robots) y los
// deja en el <body> del HTML inicial para todo agente que no esté en su lista de
// bots limitados — y Googlebot NO está (medido en producción: canónica en el
// <body> para Googlebot, en el <head> solo para Google-InspectionTool). Google
// ignora la rel=canonical que aparece en el <body> del HTML descargado y solo la
// recupera al renderizar. Lista = la de fábrica de Next 16.4 (html-bots.js) + los
// rastreadores de buscadores; a ellos se les sirve el render completo con los
// metadatos en el <head>. Los visitantes siguen recibiendo la transmisión.
const BOTS_DE_FABRICA =
  "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight";
const BUSCADORES = "Googlebot|GoogleOther|Storebot|bingbot|msnbot|YandexBot|PetalBot|SeznamBot|Qwantify|Mojeek|Amazonbot";

const nextConfig: NextConfig = {
  output: "standalone",
  /* v443.0 LA MUDANZA A CLOUDFLARE: en Cloudflare Workers no hay sharp (binario
     nativo) para optimizar imágenes en el servidor; allí las imágenes se sirven
     tal cual. En Vercel/local nada cambia (VANGUARD_CF solo existe en el build
     de Cloudflare). */
  ...(process.env.VANGUARD_CF === "1" ? { images: { unoptimized: true } } : {}),
  htmlLimitedBots: new RegExp(`${BOTS_DE_FABRICA}|${BUSCADORES}`, "i"),
  /* v244.0 LA FAMILIA REUNIDA — LA CURA DE LA DEUDA v240. Medido en el
     build v243 (censo con marcadores de clase que sobreviven a la
     minificación y que ninguna otra librería WebGL contiene): la familia
     three viaja REPARTIDA en 3-5 trozos según el empaquetador — el motor
     completo del globo, y copias del núcleo por cada raíz de import
     independiente (los teatros de zona-cero, el hangar, el frente, el
     motor de vanguard2…) — unos 550 KB gzip cuando lo justo sería UNA
     copia compartida. Turbopack no expone splitChunks; webpack sí.
     Esta grupo de caché reúne a TODA la familia (motor, globo y sus
     adornos: geometrías cónicas, geojson, slippy-map, render-objects,
     tween) en UN solo chunk asíncrono: la primera sala 3D que un
     visitante abre lo baja una vez y el navegador lo cachea para todas
     las demás. Con chunks:"async" jamás entra en el HTML crítico de
     ninguna sala (ley v222 intacta) y las salas sin 3D no lo bajan.
     El build de producción pasa a --webpack, el único motor que honra
     esta configuración (documentado en worklog v244). */
  webpack: (config, { isServer }) => {
    if (!isServer && config.optimization?.splitChunks) {
      /* v244.0 LA FAMILIA REUNIDA, segunda cura medida: ModuleConcatenation
         (scope hoisting) pega el núcleo del motor a la RAÍZ de cada grafo
         (globe.gl en unos, nuestros teatros en otros) y el grupo de caché
         deja de reconocerlo — el build salió con DOS copias del núcleo
         (376 KB minificado cada una, idénticas: medido módulo a módulo).
         Con la concatenación apagada cada archivo vuelve a ser un módulo
         con su propio path de node_modules, el test del grupo los casa
         TODOS y la familia vive reunida en un solo chunk asíncrono. El
         coste (algunos % de tamaño en el resto del bundle) es la prima
         honesta de la reunión. */
      config.optimization.concatenateModules = false;
      config.optimization.splitChunks.cacheGroups.familiaTres = {
        name: "familia-tres",
        test: /[\\/]node_modules[\\/](three|globe\.gl|three-globe|three-render-objects|three-conic-polygon-geometry|three-geojson-geometry|three-slippy-map-globe|@tweenjs[\\/]tween\.js)[\\/]/,
        chunks: "async",
        priority: 40,
        enforce: true,
        reuseExistingChunk: true,
      };
    }
    return config;
  },
  // v184.0 CORTINA DE PIEDRA — LA BD VIAJA CON LA CASA: Vercel servía
  // «db: down» porque la SQLite (db/custom.db) no entraba en el bundle del
  // serverless (outputFileTracing no la ve: Prisma la abre por env var).
  // Con esta línea el archivo entra en TODAS las rutas API; en runtime
  // db.ts la copia a /tmp (el FS de Vercel es de solo lectura) y apunta
  // DATABASE_URL ahí. La verdad sigue siendo localStorage; la BD es la
  // memoria del Centro Mundial (cables, visitas, presencia).
  outputFileTracingIncludes: {
    "/api/**/*": ["./db/**/*"],
    "/*": ["./db/**/*"],
  },
  /* v70.0 CLASICO PURO: la portada "/" vuelve a ser la app clasica completa.
     La experiencia nexo (v68/v69) fue eliminada por decision del comandante. */
  /* v349.0 LA LEY SIN EXCEPCIÓN — EL BUILD VUELVE A LEER LA LEY DE TIPOS
     (en DOS capas, medidas una a una). La compuerta typescript.
     ignoreBuildErrors nació en la v29.0 (el primer lanzamiento, b20e968) y
     llevó 320 versiones siendo la cesión callando: NADA verificaba los
     tipos — ni el build, ni nadie si el agente no corría tsc a mano.
     // LA CURA, MEDIDA: esta caja de build tiene 4 GB sin swap y vecinos
     // vivos (el next-server del vecino: 426 MB; next dev: 59 MB; la
     // infra del sandbox: 125 MB). El chequeo interno de Next corre en un
     // jest-worker junto al padre post-compilación: MEDIDO, el padre
     // retiene ~2 495 MB de RSS y el worker muere por OOM del kernel
     // (exit 137) en "Running TypeScript ..." — probado con
     // max-old-space-size 1536 y 1280 y MALLOC_ARENA_MAX=1: el padre es
     // quien no afloja. La ley se muda entonces a DONDE SE CUMPLE SIN
     // MORIR: el script "build" de package.json ahora abre con
     // `tsc --noEmit` — proceso SOLO, pico medido ~1 722 MB — y CUALQUIER
     // error de tipos mata el build ANTES de compilar (fail-fast, en esta
     // caja y en Vercel, que corre el mismo script). Este flag solo salta
     // la re-verificación DUPLICADA de Next (la que OOM-mata la caja);
     // ya no es una compuerta porque el mismo `bun run build` / `npm run
     // build` grita antes. Si alguien borra el tsc del script SIN quitar
     // este flag, vuelve la era del silencio — por eso la suite lo
     // aserta: la ley vive en el build, no en el recuerdo de nadie. */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // v145.1 GUARDIA DE MEMORIA (dev): el realtime-status sondea /socket.io
  // cada pocos segundos; en DEV cada 404 dispara una compilacion de
  // not-found de Turbopack y la memoria del server crece hasta el OOM de
  // la caja (4GB). En dev, /socket.io responde 404 BARATO via rewrite a
  // una ruta API ya compilada — cero compiles repetidos. En produccion no
  // aplica (standalone no recompila nada).
  ...(process.env.NODE_ENV === "development"
    ? {
        async rewrites() {
          return { beforeFiles: [{ source: "/socket.io", destination: "/api/health" }] };
        },
      }
    : {}),
  allowedDevOrigins: [
    "*.space-z.ai",
    "*.chatglm.cn",
    "*.z.ai",
    "*.e2b.app",
    "localhost",
    "127.0.0.1",
    "*.preview.chatglm.cn",
  ],
  // v402.0 LOS CINCO MÓDULOS — las salas duplicadas de verdad redirigen a su
  // original (permanente: los enlaces viejos y Google aprenden la nueva casa).
  //   /clasico → /cuartel (importaba el mismo componente: era la misma sala)
  //   (/modo NO: es el selector de modo + la cuenta; vive como pestaña de Juego)
  async redirects() {
    return [
      // v436.6 LAS DOS SALAS DEL VANGUARD ANTERIOR — medido con navegador real
      // el 2026-11-21: /vanguard2 y /vertigo eran las DOS ÚNICAS rutas de la
      // casa que todavía se pintaban con la piel vieja (fondo #050607, letra
      // system-ui, sin carcasa ni cabecera) y con los nombres de secciones que
      // ya no existen (Encuestas, Quiz, Noticias, Economía, Índice, Pronóstico,
      // Negocios). Orden del Dueño: «hay módulos viejos que no están
      // actualizados, están con los fondos anteriores de Vanguard».
      // No se borra ni una línea de su código: se cierran con 308 a la sala de
      // hoy que hace su trabajo — /vanguard2 (universo 3D) → /zona-cero (el ojo
      // de la casa, también en 3D) y /vertigo (archivo en vivo por deslizamiento)
      // → /en-vivo (el río de cables). Ningún enlace viejo muere.
      { source: "/vanguard2", destination: "/zona-cero", permanent: true },
      { source: "/vertigo", destination: "/en-vivo", permanent: true },
      // v405.0 LA CASA ÚNICA — LOS GEMELOS DEJAN DE SER DESTINO.
      // Medido en vivo (auditoría v404.0): el código declaraba canónica a
      // vanguard-u6b9 y la campaña entera empujaba a vanguard-kq9r; los dos
      // proyectos Vercel sirven el mismo build pero con OTRA base de datos
      // (los mismos latidos de presencia: 3 en la casa, 0 en el gemelo).
      // Dos destinos = dos memorias = dos universos. Aquí el gemelo responde
      // 301 a la casa con su misma ruta, así que ningún enlace viejo muere y
      // no queda una segunda puerta compitiendo por la misma página.
      ...PUERTAS_GEMELAS.map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: `${SITE_URL}/:path*`,
        permanent: true,
      })),
      // v421.3 LAS CUATRO PUERTAS QUE NUNCA EXISTIERON — medido el 2026-11-20:
      // el catálogo de infraestructura generaba cuatro ids con «ó» y «ñ»
      // («central-eólica-offshore-hornsea/walney/wir», «sanitaria-hospital-del-niño»).
      // La ficha usa dynamicParams = false, así que Next respondía 404 ANTES de
      // ejecutar la página: ni la forma cruda ni la percent-encoded resolvían, y
      // las cuatro viajaban anunciadas en el sitemap. Los ids ya son ASCII; estas
      // reglas de borde cierran las dos variantes viejas con 301 a la buena (el
      // redirect de next.config corre ANTES del enrutado, sin tocar la sala).
      ...[
        ["central-\u00f3lica-offshore-hornsea", "central-eolica-offshore-hornsea"],
        ["central-\u00f3lica-offshore-walney", "central-eolica-offshore-walney"],
        ["central-\u00f3lica-offshore-wir", "central-eolica-offshore-wir"],
        ["sanitaria-hospital-del-ni\u00f1o", "sanitaria-hospital-del-nino"],
      ].flatMap(([viejo, nuevo]) => [
        { source: `/infraestructura/obra/${viejo}`, destination: `/infraestructura/obra/${nuevo}`, permanent: true },
        { source: `/infraestructura/obra/${encodeURIComponent(viejo)}`, destination: `/infraestructura/obra/${nuevo}`, permanent: true },
      ]),
      { source: "/clasico", destination: "/orden", permanent: true },
      // v402.4 — salas que vivieron sueltas y hoy son pestañas del Cuartel:
      // el enlace viejo (y el botón del Teatro Total) aterriza en su sala.
      { source: "/maquina-del-tiempo", destination: "/teatro-3d?modo=tiempo", permanent: true },
      { source: "/detonacion", destination: "/escenarios", permanent: true },
      // /lectura solo existe como /lectura/<clave>: la raíz lleva a la Crónica.
      { source: "/lectura", destination: "/cronica", permanent: false },
      // v418.2 · LA PUERTA QUE SE LLAMABA DE OTRA FORMA (departamento 10).
      // Medido: /ajustes devolvía 404 con la casa entera en pie, y no es una
      // ruta inventada — es el nombre que cualquiera escribe (y el que usan
      // los navegadores para «ajustes»). Los ajustes de verdad viven en /modo
      // (MODO Y CUENTA: tema, nivel de animaciones, sonido, mundo). Las tres
      // variantes aterrizan ahí en vez de morir en «esta sala no existe».
      // v436.0 CUATRO MÓDULOS — de siete a cuatro. Ninguna puerta vieja muere:
      // las siete de v433.0 y las trece de las fusiones anteriores aterrizan
      // directamente en el módulo donde ahora vive su contenido, sin cadenas de
      // redirecciones (una 301 que rebota en otra 301 no la sigue Google).
      { source: "/modulo/frente", destination: "/modulo/redaccion", permanent: true },
      { source: "/modulo/archivo", destination: "/modulo/redaccion", permanent: true },
      { source: "/modulo/conflictos", destination: "/modulo/redaccion", permanent: true },
      { source: "/modulo/datos", destination: "/modulo/redaccion", permanent: true },
      { source: "/modulo/medios", destination: "/modulo/redaccion", permanent: true },
      { source: "/modulo/terreno", destination: "/modulo/mundo", permanent: true },
      { source: "/modulo/inteligencia", destination: "/modulo/mundo", permanent: true },
      { source: "/modulo/informacion", destination: "/modulo/mundo", permanent: true },
      { source: "/modulo/secretos", destination: "/modulo/mundo", permanent: true },
      { source: "/modulo/arsenal", destination: "/modulo/mundo", permanent: true },
      { source: "/modulo/mapa", destination: "/modulo/mundo", permanent: true },
      { source: "/modulo/planeta", destination: "/modulo/mundo", permanent: true },
      { source: "/modulo/conocimiento", destination: "/modulo/saber", permanent: true },
      { source: "/modulo/metodo", destination: "/modulo/saber", permanent: true },
      { source: "/modulo/ciencia", destination: "/modulo/saber", permanent: true },
      { source: "/modulo/academia", destination: "/modulo/saber", permanent: true },
      { source: "/modulo/motores", destination: "/modulo/saber", permanent: true },
      { source: "/modulo/juego", destination: "/modulo/casa", permanent: true },
      { source: "/modulo/estado", destination: "/modulo/casa", permanent: true },
      // el cuartel deja de ser un destino (sus 155 salas viven en /orden) y las
      // tres búsquedas sueltas se funden en el buscador único
      { source: "/juego", destination: "/orden", permanent: true },
      { source: "/modulos", destination: "/orden", permanent: true },
      { source: "/ciencia/buscar", destination: "/buscar", permanent: true },
      { source: "/memoria/buscar", destination: "/buscar", permanent: true },
      { source: "/conocimiento/enciclopedia/buscar", destination: "/buscar", permanent: true },
            // v434.1 CADA SALA CON SU URL — el cuartel deja de ser un sitio: su
      // puerta con parámetro se convierte en la dirección propia de cada sala
      // (156 reglas generadas del registro real), y /cuartel a secas
      // aterriza en el índice. Ningún enlace viejo muere.
      ...[
        "teatro3d",
        "novedades",
        "universo",
        "hangar",
        "salaguerra",
        "comunidad",
        "redmundial",
        "rostros",
        "googles",
        "mente",
        "imagenes",
        "grafo",
        "espejo",
        "maquina",
        "tierra",
        "expedientes",
        "ojodios",
        "osint",
        "mapa",
        "worlds",
        "canales",
        "mundial",
        "wikiguerra",
        "centro",
        "fichas",
        "inicio",
        "redaccion",
        "cambios",
        "verdades",
        "verifica",
        "noticias",
        "mundo",
        "multijugador",
        "frente",
        "detective",
        "edad",
        "mipais",
        "arcade",
        "taller",
        "dron",
        "minijuego",
        "combate",
        "warsim",
        "conquista",
        "bolsa",
        "hacienda",
        "divisas",
        "bookmaker",
        "apuestas",
        "lados",
        "predicciones",
        "espionaje",
        "gancho",
        "atlas",
        "enciclopedia",
        "curiosidades",
        "epocas",
        "historia",
        "muertes",
        "conquistas3d",
        "contadores",
        "carteles",
        "biblioteca",
        "tribunal",
        "oscura",
        "briefing",
        "misiones",
        "retos",
        "quiz",
        "observatorio",
        "centinela",
        "espectro",
        "pulsos",
        "evaluacion",
        "perdidas",
        "frentes",
        "geoint",
        "monitorglobal",
        "camaras",
        "cielos",
        "sismo",
        "ciber",
        "pulso",
        "radar",
        "planeta",
        "geopolitica",
        "galeria",
        "laboratorio",
        "simulador",
        "imperio",
        "enclaves",
        "extranjera",
        "canalbrief",
        "estrategia",
        "mercados",
        "pronosticos",
        "armodo",
        "operaciones",
        "briefings",
        "pantalla",
        "foryou",
        "envivo",
        "videos",
        "directos",
        "estudio",
        "memes",
        "abusos",
        "incidentes",
        "memorial",
        "sala18",
        "dronguerra",
        "recluta",
        "agenteia",
        "obras",
        "creador",
        "escenarios",
        "studios",
        "mapascrea",
        "armeria",
        "maps",
        "bolsamonedas",
        "empleos",
        "consejoia",
        "crisis",
        "contribuidores",
        "gobierno",
        "embajadores",
        "alianzas",
        "salas",
        "foros",
        "encuestas",
        "redes",
        "amigos",
        "torneos",
        "perfil",
        "identidad",
        "agentes",
        "cama",
        "atelier",
        "agente",
        "analista",
        "fortaleza",
        "logros",
        "recompensas",
        "ranking",
        "racha",
        "fusion",
        "registro",
        "estadisticas",
        "notificaciones",
        "telegram",
        "tienda",
        "ayuda",
        "experimental",
        "arquitecto",
        "nueva",
      ].map((clave) => ({
        source: "/cuartel",
        has: [{ type: "query" as const, key: "sala", value: clave }],
        destination: `/sala/${clave}`,
        permanent: true,
      })),
      { source: "/cuartel", destination: "/orden", permanent: true },
{ source: "/ajustes", destination: "/modo", permanent: false },
      { source: "/configuracion", destination: "/modo", permanent: false },
      { source: "/settings", destination: "/modo", permanent: false },
    ];
  },
  // v102.0 LA CIUDADELA — CABECERAS DE ACERO: el muro invisible que rodea
  // toda la plataforma (el comandante pidió "seguridad de acero impenetrable").
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" }, // anti-clickjacking
          { key: "X-Content-Type-Options", value: "nosniff" }, // anti-MIME-sniff
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // v306.0 EL AIRE DEL PERMISO — la cura del conflicto de la v102: la ciudadela
          // prohibió el micrófono PARA TODOS (veto absoluto) en la era sin voz;
          // la v299 (LA VOZ DE VANGUARD) le dio al operador la palabra y esta
          // cabecera la ESTRANGULABA en el navegador (getUserMedia moría con
          // NotAllowedError ANTES de tocar el permiso del usuario — la tarjeta
          // PEDIR PERMISO pedía algo que la casa ya le había negado). (self):
          // la casa confía en su propia sala; nadie externo habla con ella.
          { key: "Permissions-Policy", value: "geolocation=(self), microphone=(self), payment=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      // v125.0 CORRECCIÓN TOTAL — LEY CONTRA LA PÁGINA VIEJA: el HTML de la app
      // SIEMPRE se revalida (el navegador y cualquier gateway nunca muestran una
      // versión caducada — la causa «a veces no se actualiza»). Los assets de
      // /_next/static conservan su caché inmutable de fábrica (no se tocan).
      // v199.0 EL TURBO — CACHÉ DE MEDIA: los videos, imágenes reales,
      // ilustraciones, pósters y uploads antes caían bajo el no-store global
      // (cada re-visita revalidaba 30+ MB contra el servidor: segundos de
      // espera que no hacían falta). Ahora viajan con caché de 1 día +
      // stale-while-revalidate de 7 días: la SEGUNDA visita abre los paneles
      // de video/imágenes al instante desde el disco, y cualquier cambio en
      // los archivos se propaga en horas, no nunca-jamás. El HTML y las API
      // conservan su no-cache (ley v125 intacta).
      // v402.0: las salas internas del módulo ESTADO no se indexan
      {
        source: "/:sala(calidad|torre|catalogo|nucleo|escudo|novedades|mision)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
      {
        source: "/:carpeta(videos|imagenes-reales|ilustraciones|posters|uploads|assets|vendor)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" },
        ],
      },
      {
        source: "/((?!_next/static|_next/image|favicon|assets/|videos/|imagenes-reales/|ilustraciones/|posters/|uploads/).*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
