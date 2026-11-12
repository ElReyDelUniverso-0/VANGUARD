import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
      {
        source: "/:carpeta(videos|imagenes-reales|ilustraciones|posters|uploads|assets|vendor)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
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
