// ============================================================
// v407.0 · EL CATÁLOGO CENTRAL DE DATOS
//
// La casa tenía fuentes declaradas (`nucleo/fuentes.ts`: fnt:cables, fnt:atlas,
// fnt:indicadores…) pero ningún sitio donde estuvieran los MODELOS: qué campos
// tiene un país, de dónde sale cada uno, con qué licencia, de qué fecha es, cada
// cuánto se actualiza, cuánto se puede cachear y con qué otros modelos se
// relaciona. Sin eso, cada módulo reinventa la procedencia y nadie puede auditar
// una cifra de punta a punta.
//
// ESTE ARCHIVO ES DOCUMENTACIÓN EJECUTABLE: lo leen /datos (personas),
// /api/sistema/datos (máquinas), el diagnóstico (¿está todo declarado?) y las
// pruebas (¿existe la ruta que dice existir?).
//
// REGLA: aquí no hay ni una cifra nueva. Solo se declara dónde vive cada dato
// y quién lo publica — con su licencia y su fecha cuando la tienen.
// ============================================================

/** Cómo llega el dato a la casa. */
export type Origen = "fuente-externa" | "catalogo-en-codigo" | "base-de-datos" | "instantanea-horneada";

export interface Procedencia {
  /** quién lo publica (organismo, medio, proyecto) */
  quien: string;
  /** licencia o condición de uso, tal como está declarada */
  licencia: string;
  /** cuándo se capturó (ISO o texto) — null si es vivo */
  captura?: string | null;
  enlace?: string;
  /** fnt:… del núcleo cuando la fuente está registrada allí */
  fuente?: string;
}

export interface CampoDato {
  nombre: string;
  tipo: "texto" | "numero" | "fecha" | "booleano" | "lista" | "objeto";
  descripcion: string;
}

export interface ModeloDato {
  /** clave estable del catálogo */
  id: string;
  nombre: string;
  descripcion: string;
  origen: Origen;
  /** dónde vive el código o la tabla (ruta del repo o tabla Prisma) */
  vive: string;
  /** cuántos registros hay, con la unidad dicha (nunca una cifra sin contexto) */
  volumen: string;
  campos: CampoDato[];
  procedencia: Procedencia[];
  /** con qué otros modelos se puede unir, y por qué clave */
  relaciones: { con: string; por: string; nota: string }[];
  /** cada cuánto cambia de verdad */
  actualizacion: string;
  /** TTL de caché recomendado (segundos) o null si no se debe cachear */
  cache: number | null;
  /** dónde se ve esto en la casa */
  rutas: string[];
  /** endpoint que lo sirve, si lo hay */
  endpoint?: string;
  /** lo que este modelo NO dice (límites declarados) */
  limites: string[];
}

export const MODELOS_DATO: ModeloDato[] = [
  {
    id: "dato:pais",
    nombre: "País y territorio",
    descripcion:
      "La identidad de cada país y territorio: ISO-3166-1 (alfa-2, alfa-3 y numérico), nombre en español, región, subregión y centro geográfico. Es la CLAVE que une toda la casa: la misma para el mapa, la moneda, el indicador y la noticia.",
    origen: "catalogo-en-codigo",
    vive: "src/lib/geo-paises.ts",
    volumen: "249 países y territorios (ISO 3166-1 completo, incluidos territorios dependientes)",
    campos: [
      { nombre: "iso2", tipo: "texto", descripcion: "ISO-3166-1 alfa-2 en minúsculas — clave primaria de la casa" },
      { nombre: "iso3", tipo: "texto", descripcion: "ISO-3166-1 alfa-3 (clave del Banco Mundial)" },
      { nombre: "num", tipo: "texto", descripcion: "ISO-3166-1 numérico como texto (clave de Natural Earth)" },
      { nombre: "nombre", tipo: "texto", descripcion: "nombre en español" },
      { nombre: "region / subregion", tipo: "texto", descripcion: "región y subregión de Naciones Unidas" },
      { nombre: "lat / lng", tipo: "numero", descripcion: "centro aproximado del país (no es una frontera)" },
    ],
    procedencia: [
      { quien: "ISO 3166-1 (mantenido por ISO)", licencia: "uso libre para identificación", captura: null },
      { quien: "Natural Earth", licencia: "dominio público", captura: null },
    ],
    relaciones: [
      { con: "dato:ficha-pais", por: "iso2", nota: "una ficha por país" },
      { con: "dato:indicador", por: "iso3", nota: "Banco Mundial publica por alfa-3" },
      { con: "dato:moneda", por: "iso2", nota: "moneda y tasa de cada país" },
      { con: "dato:poligono", por: "num", nota: "polígono real de Natural Earth" },
      { con: "dato:cable", por: "texto del titular", nota: "el nexo lee el país en el titular" },
    ],
    actualizacion: "Manual: se toca cuando cambia el censo ISO. Sin proceso automático.",
    cache: 3600,
    rutas: ["/mundos", "/mundos/[iso]", "/mapas", "/poder", "/divisas", "/atlas"],
    limites: [
      "El centro lat/lng es una aproximación: sirve para etiquetar, no para juzgar soberanía.",
      "Nombres en español: un país puede aparecer con otro nombre en otras fuentes.",
    ],
  },
  {
    id: "dato:ficha-pais",
    nombre: "Ficha de país",
    descripcion:
      "La vista que une cinco tablas por ISO-2: geografía, economía y demografía del Banco Mundial, política y cultura del atlas, historia del archivo de guerras y vecinos por aristas compartidas. Donde no hay dato se escribe «sin dato».",
    origen: "catalogo-en-codigo",
    vive: "src/lib/mundos/ficha.ts",
    volumen: "249 fichas prerenderizadas (una por país del censo)",
    campos: [
      { nombre: "poblacion / superficie", tipo: "numero", descripcion: "del atlas y del Banco Mundial, con su año" },
      { nombre: "pib / renta / esperanzaVida", tipo: "numero", descripcion: "Banco Mundial, con el año de cada indicador" },
      { nombre: "moneda", tipo: "objeto", descripcion: "nombre, símbolo y tasa frente al dólar" },
      { nombre: "gobierno / lider", tipo: "texto", descripcion: "forma de gobierno y persona al frente, del atlas" },
      { nombre: "vecinos", tipo: "lista", descripcion: "fronteras topológicas reales (aristas simétricas)" },
    ],
    procedencia: [
      { quien: "Atlas de la casa (atlas-data)", licencia: "compilación propia sobre datos públicos", captura: null },
      { quien: "Banco Mundial · Indicadores del Desarrollo Mundial (API v2)", licencia: "CC BY 4.0 — atribución preservada", captura: "2026-11-06", enlace: "https://datos.bancomundial.org/", fuente: "fnt:indicadores" },
      { quien: "Natural Earth", licencia: "dominio público", captura: null },
    ],
    relaciones: [
      { con: "dato:acontecimiento", por: "geografía", nota: "guerras documentadas por cercanía declarada" },
      { con: "dato:cable", por: "país del titular", nota: "los cables de ese país, vía nexo" },
      { con: "dato:persona", por: "país", nota: "quién manda y desde qué sede" },
    ],
    actualizacion: "Se regenera en cada despliegue (build). Los indicadores, cuando se vuelve a hornear la instantánea.",
    cache: 3600,
    rutas: ["/mundos/[iso]"],
    limites: [
      "Es una ficha de consulta: no sustituye a un censo nacional ni a una fuente oficial del país.",
      "Cada indicador tiene su propio último año: comparar indicadores entre sí exige mirar la fecha.",
    ],
  },
  {
    id: "dato:poligono",
    nombre: "Polígono y fronteras",
    descripcion:
      "La geometría real de 177 países, las fronteras topológicas compartidas (simétricas) y los 24 macroterritorios de la casa.",
    origen: "catalogo-en-codigo",
    vive: "src/lib/mundos/mapa.ts · src/lib/mundos/mapa-*.json",
    volumen: "177 países con polígono · 156 con fronteras declaradas · 24 macroterritorios",
    campos: [
      { nombre: "poligono", tipo: "lista", descripcion: "anillos de coordenadas del país" },
      { nombre: "vecinos", tipo: "lista", descripcion: "claves de países que comparten frontera" },
      { nombre: "territorio", tipo: "texto", descripcion: "macroterritorio de la casa al que pertenece" },
    ],
    procedencia: [{ quien: "Natural Earth (110m/50m)", licencia: "dominio público", captura: null }],
    relaciones: [
      { con: "dato:pais", por: "num / iso2", nota: "el polígono se identifica por el código numérico" },
      { con: "dato:ficha-pais", por: "vecinos", nota: "los vecinos se calculan de las aristas" },
    ],
    actualizacion: "Manual: se regenera con scripts/generar-mundos-mapa.mjs cuando cambia la fuente.",
    cache: 3600,
    rutas: ["/mundos", "/mapas", "/mundo"],
    limites: [
      "Resolución 110m/50m: no sirve para dirimir un límite disputado, solo para situar.",
      "Los macroterritorios son una agrupación de la casa, no una división oficial.",
    ],
  },
  {
    id: "dato:indicador",
    nombre: "Indicador socioeconómico",
    descripcion:
      "Once indicadores del Banco Mundial (población, PIB, renta por habitante, esperanza de vida, gasto militar…) con su año, su enlace al original y las limitaciones escritas al lado.",
    origen: "instantanea-horneada",
    vive: "public/pulso-mundial-instantanea.json",
    volumen: "11 indicadores · 48 países cubiertos · años 2012–2025",
    campos: [
      { nombre: "valor", tipo: "numero", descripcion: "el dato del año indicado" },
      { nombre: "anio", tipo: "numero", descripcion: "año real del dato (no el de la captura)" },
      { nombre: "enlace", tipo: "texto", descripcion: "URL del original en el Banco Mundial" },
    ],
    procedencia: [
      {
        quien: "Banco Mundial · Indicadores del Desarrollo Mundial (API v2)",
        licencia: "CC BY 4.0 — atribución preservada, enlace al original en cada indicador",
        captura: "2026-11-06T00:27:49Z",
        enlace: "https://datos.bancomundial.org/",
        fuente: "fnt:indicadores",
      },
    ],
    relaciones: [
      { con: "dato:pais", por: "iso3", nota: "el Banco Mundial publica por alfa-3" },
      { con: "dato:ficha-pais", por: "iso2←→iso3", nota: "la ficha muestra el indicador con su año" },
    ],
    actualizacion: "Horneada: se vuelve a generar cuando alguien la actualiza (script propio), no en vivo.",
    cache: 900,
    rutas: ["/pulso-mundial", "/poder", "/mapas", "/mundos/[iso]"],
    limites: [
      "No son series temporales en la casa: se guarda el último dato disponible por indicador, no la evolución año a año.",
      "Cobertura de 48 países: el resto se declara «sin dato», no se estima.",
    ],
  },
  {
    id: "dato:cable",
    nombre: "Cable (noticia)",
    descripcion:
      "La pieza de actualidad: titular, resumen, medio, fecha, imagen, etiqueta táctica y teatro. Es la materia prima de la redacción y el origen de los enlaces hacia el país.",
    origen: "base-de-datos",
    vive: "Prisma · tabla NewsItem",
    volumen: "vivo: depende de las fuentes (una muestra de 48 cables puede venir de 9 medios)",
    campos: [
      { nombre: "title / summary", tipo: "texto", descripcion: "titular y resumen del medio" },
      { nombre: "source / url", tipo: "texto", descripcion: "medio y enlace al original" },
      { nombre: "publishedAt", tipo: "fecha", descripcion: "fecha de publicación del medio" },
      { nombre: "conflictTag", tipo: "texto", descripcion: "teatro al que pertenece (si lo tiene)" },
      { nombre: "tacticalTag", tipo: "texto", descripcion: "clasificación de la casa (diplomacia, economía…)" },
    ],
    procedencia: [{ quien: "GDELT + medios vía RSS", licencia: "enlace al original; el texto es del medio", captura: null, fuente: "fnt:cables" }],
    relaciones: [
      { con: "dato:pais", por: "países del titular", nota: "el nexo extrae el país y su término exacto" },
      { con: "dato:acontecimiento", por: "conflictTag", nota: "varios cables forman un acontecimiento" },
      { con: "dato:punto", por: "teatro", nota: "los puntos del frente del mismo teatro" },
    ],
    actualizacion: "Automática por ingesta de las fuentes (cuando las fuentes publican).",
    cache: null,
    rutas: ["/en-vivo", "/noticia/[id]", "/archivo-mundial", "/lectura/[clave]", "/guerra-hoy", "/vertigo"],
    endpoint: "/api/news",
    limites: [
      "La casa no verifica el contenido del medio: publica su enlace, su nombre y su fecha.",
      "El volumen depende de terceros: un día flojo de las fuentes es un día flojo del archivo.",
    ],
  },
  {
    id: "dato:acontecimiento",
    nombre: "Acontecimiento",
    descripcion:
      "El hecho mayor que reúne varios cables: tiene slug, título, fecha histórica pública y cronología. Es lo que convierte una lista de noticias en un caso.",
    origen: "catalogo-en-codigo",
    vive: "src/lib/nucleo/acontecimientos.ts",
    volumen: "semilla de hechos con fecha histórica pública, uno por teatro documentado",
    campos: [
      { nombre: "slug", tipo: "texto", descripcion: "clave estable del hecho" },
      { nombre: "titulo / resumen", tipo: "texto", descripcion: "qué es y por qué importa" },
      { nombre: "fecha", tipo: "fecha", descripcion: "fecha histórica pública de inicio" },
      { nombre: "cronologia", tipo: "lista", descripcion: "hitos con fecha" },
    ],
    procedencia: [{ quien: "Semilla editorial de la casa", licencia: "elaboración propia sobre hechos públicos", captura: null, fuente: "fnt:acontecimientos" }],
    relaciones: [
      { con: "dato:cable", por: "conflictTag → slug", nota: "los cables del teatro pertenecen al hecho" },
      { con: "dato:region", por: "teatro", nota: "cada acontecimiento vive en un frente" },
    ],
    actualizacion: "Manual (editorial): se añade cuando hay un hecho que agrupa.",
    cache: 600,
    rutas: ["/nucleo?id=…", "/conflicto/[tag]"],
    endpoint: "/api/nucleo/acontecimientos",
    limites: ["No es un archivo histórico exhaustivo: es la semilla de los frentes que la casa cubre."],
  },
  {
    id: "dato:punto",
    nombre: "Punto del frente",
    descripcion:
      "Ciudades y posiciones de un teatro, con su estado y su fuente OSINT citada. Son entidades con id estable (vg:punto:…).",
    origen: "catalogo-en-codigo",
    vive: "src/lib/nucleo/puntos.ts",
    volumen: "catálogo de puntos por teatro documentado",
    campos: [
      { nombre: "clave", tipo: "texto", descripcion: "identificador del punto" },
      { nombre: "teatro", tipo: "texto", descripcion: "frente al que pertenece" },
      { nombre: "estado", tipo: "texto", descripcion: "situación declarada del punto" },
      { nombre: "fuenteDatos", tipo: "texto", descripcion: "procedencia OSINT citada" },
    ],
    procedencia: [{ quien: "Fuentes OSINT citadas por punto", licencia: "cita en cada ficha", captura: null }],
    relaciones: [
      { con: "dato:acontecimiento", por: "teatro", nota: "los puntos pertenecen al hecho del frente" },
      { con: "dato:poligono", por: "coordenada", nota: "se sitúan sobre la geometría real" },
    ],
    actualizacion: "Manual/OSINT: se actualiza cuando la fuente cambia.",
    cache: 300,
    rutas: ["/nucleo?id=…", "/ver-guerra"],
    limites: ["Estimación OSINT declarada: no es cartografía oficial ni parte militar."],
  },
  {
    id: "dato:persona",
    nombre: "Persona del poder",
    descripcion: "Quién manda en cada país y desde qué sede: gobernantes y figuras públicas con su país y su cargo.",
    origen: "catalogo-en-codigo",
    vive: "src/lib/atlas-data.ts (PERSONAS_ATLAS)",
    volumen: "78 personas · 84 naciones con capital, gobierno y líder",
    campos: [
      { nombre: "nombre", tipo: "texto", descripcion: "persona" },
      { nombre: "cargo", tipo: "texto", descripcion: "puesto que ocupa" },
      { nombre: "pais", tipo: "texto", descripcion: "país de referencia (ISO-2 cuando se puede)" },
    ],
    procedencia: [{ quien: "Compilación de la casa sobre fuentes públicas", licencia: "elaboración propia", captura: null }],
    relaciones: [{ con: "dato:pais", por: "iso2", nota: "cada persona pertenece a un país del censo" }],
    actualizacion: "Manual: los cargos cambian y hay que revisarlos.",
    cache: 3600,
    rutas: ["/rostros", "/atlas", "/espia"],
    limites: ["No hay verificación automática de cambios de gobierno: si algo se queda viejo, se corrige a mano."],
  },
  {
    id: "dato:moneda",
    nombre: "Moneda y tasa",
    descripcion: "La moneda de cada país, su símbolo y su tasa frente al dólar, con la fecha de la tasa cuando la tiene.",
    origen: "base-de-datos",
    vive: "src/lib/world-data.ts",
    volumen: "una entrada por país y territorio del censo",
    campos: [
      { nombre: "currency", tipo: "texto", descripcion: "nombre de la moneda" },
      { nombre: "symbol", tipo: "texto", descripcion: "símbolo" },
      { nombre: "rate", tipo: "numero", descripcion: "unidades por 1 USD" },
    ],
    procedencia: [{ quien: "Datos de la casa (world-data)", licencia: "elaboración propia sobre datos públicos", captura: null }],
    relaciones: [{ con: "dato:pais", por: "iso2", nota: "una moneda por país" }],
    actualizacion: "Manual: la tasa no se refresca en vivo; se declara su fecha cuando se actualiza.",
    cache: 3600,
    rutas: ["/divisas", "/mundos/[iso]"],
    endpoint: "/api/currencies",
    limites: ["No es un servicio de cotización en tiempo real: no sirve para operar."],
  },
  {
    id: "dato:guerra-historica",
    nombre: "Guerra histórica",
    descripcion: "Diez guerras reales con fecha, bandos, bajas declaradas, relevancia y coordenada: la capa de pasado del atlas.",
    origen: "catalogo-en-codigo",
    vive: "src/lib/game-data.ts (HISTORICAL_WARS)",
    volumen: "10 guerras",
    campos: [
      { nombre: "name / year", tipo: "texto", descripcion: "nombre y año" },
      { nombre: "participants / casualties", tipo: "texto", descripcion: "bandos y bajas según la fuente citada" },
      { nombre: "significance", tipo: "texto", descripcion: "por qué importa" },
    ],
    procedencia: [{ quien: "Compilación de la casa sobre bibliografía pública", licencia: "elaboración propia", captura: null }],
    relaciones: [{ con: "dato:pais", por: "coordenada", nota: "la ficha del país las busca por cercanía declarada (2.600 km)" }],
    actualizacion: "Estática por definición (historia).",
    cache: 86400,
    rutas: ["/historia", "/mundos/[iso]"],
    limites: ["Las cifras de bajas son las de la fuente citada: no se recalculan ni se promedian."],
  },
  {
    id: "dato:simulacion",
    nombre: "Simulación",
    descripcion:
      "El estado de las salas de simulación: teatros, unidades, posiciones y proyectiles. Es un MODELO, no un pronóstico.",
    origen: "base-de-datos",
    vive: "src/lib/game-store.ts + motores 3D (/teatro-3d, /zona-cero, /escenarios)",
    volumen: "9 teatros · 5 salas de simulación",
    campos: [
      { nombre: "teatro", tipo: "texto", descripcion: "frente simulado" },
      { nombre: "unidades / posiciones", tipo: "objeto", descripcion: "estado de la partida" },
      { nombre: "seq", tipo: "numero", descripcion: "sello que firma el estado (evita repintados falsos)" },
    ],
    procedencia: [{ quien: "Modelo propio de la casa", licencia: "elaboración propia", captura: null, fuente: "fnt:teatros" }],
    relaciones: [
      { con: "dato:pais", por: "coordenada", nota: "el simulador se abre en las coordenadas del país" },
      { con: "dato:punto", por: "teatro", nota: "los puntos del frente alimentan el escenario" },
    ],
    actualizacion: "En vivo mientras se juega; no persiste como dato histórico.",
    cache: null,
    rutas: ["/teatro-3d", "/zona-cero", "/escenarios", "/objetivos", "/ver-guerra", "/armeria"],
    endpoint: "/api/nucleo/simulacion",
    limites: [
      "Es simulación declarada: no predice nada ni representa fuerzas reales en tiempo real.",
      "No se guarda como archivo: al cerrar, el estado se pierde (salvo el guardado del jugador).",
    ],
  },
  {
    id: "dato:documento",
    nombre: "Documento y expediente",
    descripcion:
      "El archivo documental de la casa: expedientes oscuros, abusos de guerra documentados, víctimas con nombre y material con su fuente.",
    origen: "catalogo-en-codigo",
    vive: "src/lib/oscura-data.ts · src/lib/expedientes-datos.ts",
    volumen: "43 expedientes documentados + el archivo de la verdad cruda",
    campos: [
      { nombre: "titulo / resumen", tipo: "texto", descripcion: "qué documenta" },
      { nombre: "veredicto / rareza", tipo: "texto", descripcion: "valoración declarada del expediente" },
      { nombre: "fuente", tipo: "texto", descripcion: "procedencia del documento" },
    ],
    procedencia: [{ quien: "Documentación pública citada", licencia: "cita en cada pieza", captura: null, fuente: "fnt:documentos" }],
    relaciones: [
      { con: "dato:pais", por: "texto", nota: "un expediente puede referirse a un país" },
      { con: "dato:acontecimiento", por: "tema", nota: "documenta un hecho del archivo" },
    ],
    actualizacion: "Manual (editorial).",
    cache: 3600,
    rutas: ["/oscura", "/verdad-cruda", "/editorial"],
    limites: ["Es archivo curado, no un repositorio exhaustivo de documentos."],
  },
];

/** Todos los campos del catálogo, plano (para el diagnóstico y las pruebas). */
export function mapaDeModelos(): Map<string, ModeloDato> {
  return new Map(MODELOS_DATO.map((m) => [m.id, m]));
}

/** Cuántos modelos declaran caché, procedencia con fecha y límites escritos. */
export function coberturaCatalogo() {
  const total = MODELOS_DATO.length;
  return {
    modelos: total,
    conProcedencia: MODELOS_DATO.filter((m) => m.procedencia.length > 0).length,
    conFechaDeCaptura: MODELOS_DATO.filter((m) => m.procedencia.some((p) => p.captura)).length,
    conLimites: MODELOS_DATO.filter((m) => m.limites.length > 0).length,
    conCache: MODELOS_DATO.filter((m) => m.cache !== null).length,
    conEndpoint: MODELOS_DATO.filter((m) => !!m.endpoint).length,
    relaciones: MODELOS_DATO.reduce((n, m) => n + m.relaciones.length, 0),
  };
}

/** Los modelos que se pueden unir con este (para el motor de relaciones). */
export function vecinosDeModelo(id: string): { con: string; por: string; nota: string }[] {
  const m = mapaDeModelos().get(id);
  if (!m) return [];
  const salida = [...m.relaciones];
  for (const otro of MODELOS_DATO) {
    if (otro.id === id) continue;
    for (const r of otro.relaciones) {
      if (r.con === id && !salida.some((s) => s.con === otro.id)) {
        salida.push({ con: otro.id, por: r.por, nota: `${otro.nombre} → ${m.nombre}` });
      }
    }
  }
  return salida;
}
