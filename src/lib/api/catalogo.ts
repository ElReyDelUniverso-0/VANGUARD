// ============================================================
// v407.0 · EL CATÁLOGO DE ENDPOINTS — qué hay, qué hace y qué está documentado
//
// La casa tiene 100 endpoints y ninguna lista pública: quien quería integrarse
// tenía que leer el árbol del repositorio. Este archivo es esa lista, en dos
// niveles HONESTOS:
//
//   · DOCUMENTADOS (documentado: true) — contrato revisado a mano: método,
//     parámetros que acepta de verdad, forma de la respuesta y muro. Aquí una
//     promesa incumplida es un fallo de la casa.
//   · INVENTARIADOS (documentado: false) — existen (las pruebas comprueban que
//     la ruta está en `src/app/api`), pero su contrato NO se ha verificado. Se
//     listan para que nadie los descubra por sorpresa, no para prometer nada.
//
// VERSIONADO: `API_VERSION` (en `sistema/contrato.ts`) es la versión de la
// INTERFAZ de los endpoints nuevos. Esta lista declara, por endpoint, la versión
// con la que se documentó. Cambiar la forma de una respuesta obliga a subir la
// versión del endpoint en este catálogo — y las pruebas avisan si alguien
// documenta una ruta que no existe.
// ============================================================

export const GRUPOS_API = [
  "sistema", // salud, diagnóstico, contratos, catálogos
  "nucleo", // censo, búsqueda, fichas, acontecimientos
  "noticias", // archivo, portada, crónica, vértigo
  "mundo", // mapa, capas, planeta, pulso, monedas
  "datos", // conectores externos (clima, sismo, wiki…)
  "comunidad", // contribuciones, creadores, UGC
  "cuenta", // sesión y guardado
  "vivo", // directos, presencia, chat
  "juegos", // partida, mercado, objetivos
  "seguridad", // escudo, fortaleza, denuncias
  "integraciones", // telegram, indexnow, medios
] as const;

export type GrupoApi = (typeof GRUPOS_API)[number];

export interface ParametroEndpooint {
  nombre: string;
  donde: "query" | "cuerpo" | "ruta";
  tipo: "texto" | "numero" | "booleano";
  requerido: boolean;
  descripcion: string;
}

export interface EndpointVanguard {
  ruta: string;
  metodos: ("GET" | "POST" | "PUT" | "DELETE")[];
  grupo: GrupoApi;
  descripcion: string;
  params?: ParametroEndpooint[];
  /** forma de la respuesta, en una línea */
  respuesta?: string;
  /** límite de peticiones declarado por el propio endpoint */
  muro?: string;
  cache?: string;
  auth?: "ninguna" | "sesion" | "dueno";
  /** contrato revisado a mano o solo inventariado */
  documentado: boolean;
  /** versión de la interfaz con la que se documentó */
  version: string;
}

/** Los endpoints cuyo contrato está revisado. */
export const ENDPOINTS_DOCUMENTADOS: EndpointVanguard[] = [
  {ruta:"/api/sistema/arquitectura",metodos:["GET"],grupo:"sistema",descripcion:"El mapa de la casa para máquinas: censo del árbol, grafo de áreas, huecos declarados, las ocho piezas del contrato de integración y el estado de los 22 departamentos.",params:[{nombre:"seccion",donde:"query",tipo:"texto",requerido:false,descripcion:"resumen | grafo | huecos | piezas | acoplamientos | departamentos | todo"}],respuesta:"{ok,api,version,datos:{version,seccion,resumen|areasCentrales|huecos|piezas|departamentos,…},meta}",auth:"ninguna",documentado:true,version:"1",cache:"public, max-age=300",muro:"60 por minuto y cliente"},
  {ruta:"/api/mundial",metodos:["GET"],grupo:"datos",descripcion:"Centro de datos mundiales: catálogo de 52 indicadores, países con región y renta, series históricas, rankings, comparación entre países y agregados del Banco Mundial. Cada valor viaja con su año; lo que la fuente no publica se devuelve como null.",params:[{nombre:"seccion",donde:"query",tipo:"texto",requerido:false,descripcion:"catalogo | paises | serie | ranking | comparar | panel | todo"},{nombre:"indicador",donde:"query",tipo:"texto",requerido:false,descripcion:"id del catálogo (poblacion, pib_pc, esperanza_vida…) o código del Banco Mundial"},{nombre:"paises",donde:"query",tipo:"texto",requerido:false,descripcion:"hasta 6 códigos ISO-3166-1 alfa-2 separados por coma"},{nombre:"indicadores",donde:"query",tipo:"texto",requerido:false,descripcion:"hasta 6 ids separados por coma (sección comparar)"},{nombre:"anio",donde:"query",tipo:"numero",requerido:false,descripcion:"año fijo del ranking; sin él, último dato de cada país"},{nombre:"desde",donde:"query",tipo:"numero",requerido:false,descripcion:"año inicial de la serie (1960-2035, por defecto 1990)"},{nombre:"agregados",donde:"query",tipo:"texto",requerido:false,descripcion:"WLD, LCN, SSF… (sección panel)"}],respuesta:"{ok,api,version,datos:{version,seccion,catalogo|paises|serie|ranking|comparacion|panel},meta}",auth:"ninguna",documentado:true,version:"1",cache:"public, max-age=1800",muro:"40 por minuto y cliente"},
  // v420.0 VANGUARD LINGUA
  {ruta:"/api/lingua/buscar",metodos:["GET"],grupo:"datos",descripcion:"Busca lenguas, familias y dialectos de Glottolog 5.4 por nombre en español o en inglés, código ISO 639-3 o glottocode; cada resultado dice si es lengua, familia o dialecto.",params:[{nombre:"q",donde:"query",tipo:"texto",requerido:true,descripcion:"Consulta, 2 a 80 caracteres"}],respuesta:"{ok,api,version,datos:{q,resultados:[{id,nombre,tipo,detalle,ruta}]},meta}",auth:"ninguna",documentado:true,version:"1",cache:"public, s-maxage=3600",muro:"60 por minuto y cliente"},
  {ruta:"/api/lingua/arbol",metodos:["GET"],grupo:"datos",descripcion:"Árbol genealógico de Glottolog: hijos de un nodo (ramas, lenguas, dialectos) y ficha del nodo con linaje, recuento de lenguas, estado de amenaza y distribución.",params:[{nombre:"id",donde:"query",tipo:"texto",requerido:true,descripcion:"Glottocode (cuatro letras y cuatro cifras)"}],respuesta:"{ok,api,version,datos:{detalle,hijos},meta}",auth:"ninguna",documentado:true,version:"1",cache:"public, s-maxage=3600",muro:"120 por minuto y cliente"},
  {ruta:"/api/lingua/traducir",metodos:["POST"],grupo:"datos",descripcion:"Traduce hasta 500 caracteres entre 39 idiomas con MyMemory (Translated). Devuelve proveedor, coincidencia y alternativas; descarta resultados que no estén en el idioma pedido. Sin traducción del proveedor, error PROVEEDOR: nunca un texto inventado.",params:[{nombre:"texto",donde:"cuerpo",tipo:"texto",requerido:true,descripcion:"1 a 500 caracteres"},{nombre:"de",donde:"cuerpo",tipo:"texto",requerido:true,descripcion:"código de idioma de origen (es, en, fr, zh-CN…)"},{nombre:"a",donde:"cuerpo",tipo:"texto",requerido:true,descripcion:"código de idioma de destino"}],respuesta:"{ok,api,version,datos:{texto,coincidencia,proveedor,alternativas,aviso?,cache},meta}",auth:"ninguna",documentado:true,version:"1",cache:"no-store",muro:"15 por minuto y cliente"},
  {ruta:"/api/conocimiento/explicar",metodos:["GET"],grupo:"nucleo",descripcion:"Selecciona dos niveles de explicación del expediente existente, sin generar afirmaciones nuevas.",params:[{nombre:"tema",donde:"query",tipo:"texto",requerido:true,descripcion:"Identificador del concepto"},{nombre:"nivel",donde:"query",tipo:"texto",requerido:false,descripcion:"rapido o completo"}],respuesta:"{ok,api,version,datos:{id,titulo,nivel,resumen,limites,fuentes,relacionados,ruta,metodo,revision,…},meta}",auth:"ninguna",documentado:true,version:"1",cache:"public, max-age=300",muro:"Sin limitador específico; lectura local acotada, sin proveedor externo"},
  {ruta:"/api/conocimiento",metodos:["GET"],grupo:"nucleo",descripcion:"Busca conceptos, acontecimientos, civilizaciones u organizaciones editoriales.",params:[{nombre:"q",donde:"query",tipo:"texto",requerido:false,descripcion:"Consulta, hasta 180 caracteres"},{nombre:"tipo",donde:"query",tipo:"texto",requerido:false,descripcion:"conceptos, acontecimientos, civilizaciones u organizaciones"},{nombre:"area",donde:"query",tipo:"texto",requerido:false,descripcion:"Identificador de área"},{nombre:"limite",donde:"query",tipo:"numero",requerido:false,descripcion:"1 a 50"},{nombre:"desde",donde:"query",tipo:"numero",requerido:false,descripcion:"0 a 10000"}],respuesta:"{tipo,q,area,total,desde,limite,resultados,siguiente}; error:{error:string}. Contrato específico original, sin envoltorio central.",auth:"ninguna",documentado:true,version:"1",cache:"public, max-age=300",muro:"Sin limitador específico; máximo 50 resultados por petición"},
  {
    ruta: "/api/health",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion: "Latido del servidor: estado de la base de datos, memoria y versión desplegada.",
    respuesta: "{ ok, db, ms, rss, heap, uptime, version }",
    cache: "no-store",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/system",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion: "Pulso de actualización: versión en marcha, última publicada y si hay código nuevo esperando.",
    respuesta: "{ version, remota, hayNueva, … }",
    muro: "por IP",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/sistema/endpoints",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion: "Este catálogo, servido como JSON: endpoints documentados, inventariados y cobertura por grupo.",
    params: [{ nombre: "grupo", donde: "query", tipo: "texto", requerido: false, descripcion: "filtra por grupo (sistema, nucleo, noticias…)" }],
    respuesta: "{ ok, api, version, datos: { documentados, inventariados, cobertura } }",
    muro: "60/min por IP",
    cache: "s-maxage=300",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/sistema/diagnostico",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion:
      "Comprobaciones reales de la casa: base de datos, censo, catálogo de datos, contratos, caché y versión. Cada comprobación con su tiempo.",
    params: [{ nombre: "profundo", donde: "query", tipo: "booleano", requerido: false, descripcion: "«1» añade la comprobación de base de datos" }],
    respuesta: "{ ok, datos: { sano, checks: [{ id, nombre, ok, detalle, ms }] } }",
    muro: "20/min por IP",
    cache: "no-store",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/sistema/novedades",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion:
      "Sistema de actualizaciones: versión, últimas entradas de la bitácora, módulos nuevos del censo y señal de las últimas 24 h por teatro.",
    respuesta: "{ ok, datos: { version, bitacora[], modulosNuevos[], senales[] } }",
    muro: "30/min por IP",
    cache: "s-maxage=60",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/sistema/actividad",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion: "Registro de actividad técnica de esta instancia (anillo de 200 eventos, sin datos personales).",
    params: [{ nombre: "n", donde: "query", tipo: "numero", requerido: false, descripcion: "cuántos eventos devolver (1–100, por defecto 40)" }],
    respuesta: "{ ok, datos: { resumen, eventos[] } }",
    muro: "30/min por IP",
    cache: "no-store",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/sistema/extensiones",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion: "Puntos de extensión de la casa, extensiones instaladas y reglas que debe cumplir un descriptor.",
    respuesta: "{ ok, datos: { puntos[], instaladas[], total, nota } }",
    cache: "s-maxage=300",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/sistema/datos",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion: "Catálogo central de datos: modelos, procedencia, licencias, fechas de captura, caché y relaciones.",
    params: [{ nombre: "modelo", donde: "query", tipo: "texto", requerido: false, descripcion: "id del modelo (dato:pais, dato:cable…)" }],
    respuesta: "{ ok, datos: { modelos[], cobertura } }",
    muro: "60/min por IP",
    cache: "s-maxage=300",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/sistema/busqueda-google",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion:
      "VANGUARD SEARCH OPPORTUNITIES: estado de la conexión con Google Search Console (público) y, con sesión del Dueño blindada, prueba real de conexión y oportunidades a partir de consultas, impresiones, clics, CTR y posición media.",
    params: [
      { nombre: "accion", donde: "query", tipo: "texto", requerido: false, descripcion: "estado (por defecto, público) · probar · informe (privados)" },
      { nombre: "dias", donde: "query", tipo: "numero", requerido: false, descripcion: "7, 28 o 90 días cerrados (informe)" },
      { nombre: "tipo", donde: "query", tipo: "texto", requerido: false, descripcion: "filtra el informe: CTR_BAJO, CONTENIDO_A_MEJORAR, SIN_IMPRESIONES, CANIBALIZACION, PAGINA_MEJOR, HUECO" },
    ],
    respuesta: "{ ok, datos: { conexion, acceso, comprobaciones, umbrales } | { conectado, pasos[], totales7d } | { periodo, totales, oportunidades[], porTipo, porCategoria, franjas, control } }",
    muro: "20/min por IP",
    cache: "no-store (el informe se memoriza 6 h en el servidor)",
    auth: "dueno",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/sistema/ia",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion:
      "Estado REAL de las capacidades de IA: qué proveedores tienen credencial configurada (solo el nombre de la variable) y qué se resuelve sin proveedor.",
    respuesta: "{ ok, datos: { proveedores[], deterministas[], nota } }",
    cache: "no-store",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/consulta",
    metodos: ["GET"],
    grupo: "sistema",
    descripcion:
      "Consulta estructurada: interpreta una pregunta en español y devuelve país, tipo, filtros y resultados del núcleo. Determinista (reglas), sin proveedor de IA.",
    params: [
      { nombre: "q", donde: "query", tipo: "texto", requerido: true, descripcion: "la pregunta o los términos (mínimo 2 letras)" },
      { nombre: "limite", donde: "query", tipo: "numero", requerido: false, descripcion: "resultados a devolver (1–24, por defecto 8)" },
    ],
    respuesta: "{ ok, datos: { interpretacion, resultados[], fuentes[] } }",
    muro: "30/min por IP",
    cache: "no-store",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/nucleo/modulos",
    metodos: ["GET"],
    grupo: "nucleo",
    descripcion: "El censo público de módulos: nombre, descripción, categoría, ruta, permiso, estado y dependencias.",
    respuesta: "{ ok, modulos[], porCategoria, fuentes… }",
    muro: "60/min por IP",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/nucleo/busqueda",
    metodos: ["GET"],
    grupo: "nucleo",
    descripcion: "Búsqueda global del núcleo: todos los proveedores públicos en paralelo, con sus fuentes declaradas.",
    params: [
      { nombre: "q", donde: "query", tipo: "texto", requerido: true, descripcion: "términos (mínimo 2 letras, se normaliza sin tildes)" },
      { nombre: "tipo", donde: "query", tipo: "texto", requerido: false, descripcion: "filtra por tipo de entidad (noticia, pais, acontecimiento…)" },
    ],
    respuesta: "{ ok, q, terminos[], tipo, resultados[], fuentes[], generado }",
    muro: "30/min por IP",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/nucleo/entidad",
    metodos: ["GET"],
    grupo: "nucleo",
    descripcion: "La ficha completa de una entidad vg:… con sus enlaces contextuales y los cables relacionados.",
    params: [{ nombre: "id", donde: "query", tipo: "texto", requerido: true, descripcion: "id estable de la entidad (vg:<tipo>:<clave>)" }],
    respuesta: "{ ok, entidad, enlaces[], relacionados… }",
    muro: "60/min por IP",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/nucleo/acontecimientos",
    metodos: ["GET"],
    grupo: "nucleo",
    descripcion: "Los acontecimientos del archivo con su cronología y los cables que reúnen.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/nucleo/simulacion",
    metodos: ["GET"],
    grupo: "nucleo",
    descripcion: "El estado publicado de la simulación (teatros y sus cifras), servido para el núcleo.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/news",
    metodos: ["GET"],
    grupo: "noticias",
    descripcion: "El archivo de cables paginado (BD real). Es la fuente de la portada y de la sala en vivo.",
    params: [
      { nombre: "page", donde: "query", tipo: "numero", requerido: false, descripcion: "página (empieza en 1)" },
      { nombre: "limit", donde: "query", tipo: "numero", requerido: false, descripcion: "tamaño de página" },
      { nombre: "modo", donde: "query", tipo: "texto", requerido: false, descripcion: "variante de orden/filtro que usa la portada" },
    ],
    respuesta: "{ items: [{ id, title, summary, source, url, publishedAt, conflictTag, tacticalTag, imageUrl }], source }",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/mundo",
    metodos: ["GET"],
    grupo: "mundo",
    descripcion: "La instantánea del planeta: los nueve teatros con su peso de 24 h y su último titular por fuente.",
    respuesta: "{ teatros: [{ tag, nombre, n, ultimo… }], generado }",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/layers",
    metodos: ["GET"],
    grupo: "mundo",
    descripcion: "Las capas del globo y sus definiciones (qué mide cada una y de dónde sale).",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/geo",
    metodos: ["GET"],
    grupo: "mundo",
    descripcion: "Geometría y datos geográficos que alimentan el mapa de los mundos.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/currencies",
    metodos: ["GET", "POST"],
    grupo: "mundo",
    descripcion: "Monedas y tasas de la casa (world-data). No es un servicio de cotización en vivo.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/pulso",
    metodos: ["GET"],
    grupo: "mundo",
    descripcion: "El pulso del planeta que consume la capa viva del cliente.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/planeta",
    metodos: ["GET"],
    grupo: "mundo",
    descripcion: "Datos agregados del planeta para las visualizaciones del globo.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/datos/clima",
    metodos: ["GET"],
    grupo: "datos",
    descripcion: "Conector de clima: dato externo con su procedencia declarada.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/datos/sismos",
    metodos: ["GET"],
    grupo: "datos",
    descripcion: "Conector de sismos (mismo origen que /api/earthquakes), con la fuente citada.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/datos/cripto",
    metodos: ["GET"],
    grupo: "datos",
    descripcion: "Conector de cripto: precio y variación con su fuente.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/efemerides",
    metodos: ["GET"],
    grupo: "datos",
    descripcion: "Efemérides del día: hechos con fecha que la casa cita tal cual.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/wiki",
    metodos: ["GET"],
    grupo: "datos",
    descripcion: "Consulta a Wikipedia para el contexto de una entidad, devolviendo el enlace al original.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/traductor",
    metodos: ["GET", "POST"],
    grupo: "datos",
    descripcion: "Traducción de la casa (8 idiomas) con el proveedor que esté configurado y su estado declarado.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/auth/me",
    metodos: ["GET"],
    grupo: "cuenta",
    descripcion: "Quién eres según la sesión del servidor. Sin sesión devuelve el estado anónimo.",
    auth: "sesion",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/notifications",
    metodos: ["GET", "POST"],
    grupo: "comunidad",
    descripcion: "Notificaciones del contribuidor por alias; POST marca leídas.",
    params: [
      { nombre: "alias", donde: "query", tipo: "texto", requerido: false, descripcion: "alias del contribuidor" },
    ],
    auth: "sesion",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/escudo",
    metodos: ["GET"],
    grupo: "seguridad",
    descripcion: "Estado del escudo de la casa (defensas y amenazas contadas), sin detalles explotables.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
  {
    ruta: "/api/fortaleza",
    metodos: ["GET"],
    grupo: "seguridad",
    descripcion: "Estado agregado del muro anti-ráfaga y de los bloqueos de login.",
    auth: "ninguna",
    documentado: true,
    version: "1",
  },
];

/**
 * INVENTARIO — endpoints que existen en `src/app/api` y cuyo contrato NO se ha
 * revisado a mano. Se listan para transparencia; las pruebas comprueban que
 * cada ruta sigue existiendo (si una desaparece, la prueba avisa).
 */
export const RUTAS_INVENTARIADAS: string[] = [
  "/api",
  "/api/agent-ping",
  "/api/agente",
  "/api/agente/opinar",
  "/api/ambassadors",
  "/api/ambassadors/vote",
  "/api/arquitecto",
  "/api/asistente",
  "/api/audios",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/modo",
  "/api/auth/register",
  "/api/auth/save",
  "/api/centro/buscar",
  "/api/centro/documento",
  "/api/centro/documento/comparar",
  "/api/centro/documento/preguntar",
  "/api/centro/informe",
  "/api/centro/investigar",
  "/api/consejo",
  "/api/contrib",
  "/api/contrib/[id]",
  "/api/contrib/[id]/vote",
  "/api/contrib/leaderboard",
  "/api/creadores/colecciones",
  "/api/creadores/fama",
  "/api/creadores/moderacion",
  "/api/creadores/obras",
  "/api/creadores/obras/[id]",
  "/api/creadores/perfil/[alias]",
  "/api/creadores/yo",
  "/api/cronica",
  "/api/datos/curiosidad",
  "/api/datos/planeta",
  "/api/denuncias",
  "/api/denuncias/[id]",
  "/api/drone-scores",
  "/api/duelo",
  "/api/earthquakes",
  "/api/espectro",
  "/api/foto",
  "/api/geo-tablero",
  "/api/geopolitics",
  "/api/goal",
  "/api/government",
  "/api/indexnow",
  "/api/investigacion",
  "/api/juegos",
  "/api/live/claim",
  "/api/live/presence",
  "/api/live/replays",
  "/api/live/schedule",
  "/api/live/streams",
  "/api/live/streams/[id]",
  "/api/live/streams/[id]/chat",
  "/api/live/streams/[id]/donate",
  "/api/live/streams/sala-chat",
  "/api/maestro",
  "/api/media/[id]",
  "/api/memes",
  "/api/memes/[id]",
  "/api/mente",
  "/api/mercado",
  "/api/meteo",
  "/api/mp/stats",
  "/api/naciones",
  "/api/neurona",
  "/api/noticias",
  "/api/og",
  "/api/portada",
  "/api/presence",
  "/api/reclutar",
  "/api/sharegoal",
  "/api/telegram",
  "/api/telegram/webhook",
  "/api/telemetria",
  "/api/torre",
  "/api/ugc",
  "/api/ugc/[id]",
  "/api/ugc/comments",
  "/api/verify",
  "/api/vertigo",
  "/api/visits",
];

/** Todos los endpoints conocidos (documentados + inventariados). */
export function todasLasRutas(): string[] {
  return [...ENDPOINTS_DOCUMENTADOS.map((e) => e.ruta), ...RUTAS_INVENTARIADAS].sort();
}

/** Busca un endpoint por ruta exacta. */
export function endpointPorRuta(ruta: string): EndpointVanguard | null {
  return ENDPOINTS_DOCUMENTADOS.find((e) => e.ruta === ruta) ?? null;
}

/** Los documentados de un grupo (para la página /sistema). */
export function documentadosDeGrupo(grupo: GrupoApi): EndpointVanguard[] {
  return ENDPOINTS_DOCUMENTADOS.filter((e) => e.grupo === grupo);
}

/** Cifras de cobertura: cuánto está documentado de verdad. */
export function coberturaApi() {
  const documentados = ENDPOINTS_DOCUMENTADOS.length;
  const inventariados = RUTAS_INVENTARIADAS.length;
  const total = documentados + inventariados;
  const porGrupo = GRUPOS_API.map((g) => ({
    grupo: g,
    documentados: ENDPOINTS_DOCUMENTADOS.filter((e) => e.grupo === g).length,
  })).filter((x) => x.documentados > 0);
  return {
    total,
    documentados,
    inventariados,
    porcentajeDocumentado: total > 0 ? Math.round((documentados / total) * 100) : 0,
    conMuro: ENDPOINTS_DOCUMENTADOS.filter((e) => !!e.muro).length,
    conAuth: ENDPOINTS_DOCUMENTADOS.filter((e) => e.auth && e.auth !== "ninguna").length,
    porGrupo,
  };
}
