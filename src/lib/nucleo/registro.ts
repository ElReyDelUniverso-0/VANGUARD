// ============================================================
// v218.0 EL NÚCLEO — REGISTRO CENTRAL DE MÓDULOS
// El censo oficial de la casa: TODO módulo vivo de Vanguard con
// nombre, descripción, categoría, ruta, permisos, estado y
// dependencias. Si una función no está aquí, no existe para el
// Núcleo (no aparece en /nucleo ni en la búsqueda de módulos).
//
// REGLAS DEL CENSO (las verifica scripts/pruebas-nucleo.mjs):
//   · ids únicos, con prefijo mod:.
//   · cada ruta debe existir de verdad en src/app/.
//   · las dependencias (mod:… / fnt:…) deben existir.
//   · SOLO módulos reales: jamás se registra una función que no
//     vive en producción (nada de carteles).
// Para AÑADIR un módulo: src/lib/nucleo/README.md (4 pasos).
// ============================================================

import { TOTAL_REAL, cuentaPorTipo } from "@/lib/catalogo-real";

// v367.9 — el censo del catálogo se CALCULA, no se escribe (guardia v234). La
// sala /calidad recordó por qué: las cifras a mano envejecen en silencio.
const CENSO_CATALOGO = cuentaPorTipo();

/** Categorías del censo — la navegación de /nucleo las agrupa. */
export const CATEGORIAS_MODULO = [
  "REDACCION", // leer la guerra: cables, teatros, última hora
  "MUNDO", // el planeta: mapas, espía, traductor
  "SIMULACION", // vivir la guerra: juegos, misiones, objetivos
  "COMUNIDAD", // la gente: audios, cuentas, contribuciones
  "SISTEMA", // la casa: núcleo, modo, privacidad
] as const;

export type CategoriaModulo = (typeof CATEGORIAS_MODULO)[number];

/** Nivel de acceso que NECESITA usar el módulo (se juzga en el servidor). */
export const PERMISOS_MODULO = ["publico", "cuenta", "dueno"] as const;
export type PermisoModulo = (typeof PERMISOS_MODULO)[number];

/** Estado de implementación honesto. */
export const ESTADOS_MODULO = ["VIVO", "BETA", "PLAN"] as const;
export type EstadoModulo = (typeof ESTADOS_MODULO)[number];

export interface ModuloNucleo {
  id: string; // mod:<slug> — estable, jamás se recicla
  nombre: string; // EL PULSO, LA EMISORA…
  lema: string; // una línea que lo explica
  descripcion: string; // qué hace de verdad y con qué datos
  categoria: CategoriaModulo;
  ruta: string; // la puerta real (src/app/…)
  permiso: PermisoModulo; // publico | cuenta | dueno
  estado: EstadoModulo; // VIVO | BETA | PLAN
  dependencias: string[]; // mod:… y fnt:… de los que vive
  alias: string; // términos extra para la búsqueda
  /** Si el módulo ES una entidad (mapa o simulación), su id estable. */
  idEntidadComo?: string; // vg:mapa:mundo, vg:simulacion:ver-guerra…
}

export const MODULOS_NUCLEO: ModuloNucleo[] = [
  // ── REDACCIÓN ──────────────────────────────────────────────
  {
    id: "mod:envivo",
    nombre: "EL PULSO · EN VIVO",
    lema: "La redacción abierta 24 h",
    descripcion:
      "Línea del tiempo minuto a minuto con SOLO cables reales (GDELT + 18 medios), LO MÁS CALIENTE ranqueado por impacto y exactitud visible: hora, fuente y sello de credibilidad en cada pieza.",
    categoria: "REDACCION",
    ruta: "/en-vivo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:fuentes"],
    alias: "en vivo ultima hora directo pulso breaking redaccion noticias archivo",
  },
  {
    id: "mod:vertigo",
    nombre: "EL VÉRTIGO",
    lema: "El mundo en deslizamientos",
    descripcion:
      "El feed infinito: cada cable a pantalla completa, se desliza y la siguiente pieza del planeta encaja. Doble toque para latir.",
    categoria: "REDACCION",
    ruta: "/vertigo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables"],
    alias: "vertigo feed infinito tiktok deslizar scroll",
  },
  {
    id: "mod:noticia",
    nombre: "EL CABLE",
    lema: "Cada noticia, su página propia",
    descripcion:
      "Página indexable por cable con fuente, bandera, resumen, traducción y el ¿POR QUÉ IMPORTA? de la redacción. La puerta por la que Google entra al archivo.",
    categoria: "REDACCION",
    ruta: "/noticia/[id]",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:fuentes"],
    alias: "noticia cable detalle lectura articulo",
  },
  {
    id: "mod:traductor",
    nombre: "MODO TRADUCTOR",
    lema: "Las noticias del mundo en tu idioma",
    descripcion:
      "Los 8 idiomas de Vanguard en una fuente: estudio completo de traducción y las últimas noticias traducidas al vuelo desde los cables reales.",
    categoria: "REDACCION",
    ruta: "/traductor",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables"],
    alias: "traductor idiomas traducir ingles chino ruso frances portugues",
  },
  // ── MUNDO ──────────────────────────────────────────────────
  {
    id: "mod:guerra-hoy",
    nombre: "GUERRA HOY",
    lema: "El planeta vigilado",
    descripcion:
      "Los frentes activos del día con el Ojo de Dios: teatros, unidades, leyenda del globo y el pulso de última hora sobre el panel.",
    categoria: "MUNDO",
    ruta: "/guerra-hoy",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:teatros"],
    alias: "guerra hoy frentes ojo de dios panel mapa conflictos",
    idEntidadComo: "vg:mapa:guerra-hoy",
  },
  {
    id: "mod:mundo",
    nombre: "EL MUNDO 3D",
    lema: "El planeta girando en vivo",
    descripcion:
      "El globo entero con motor 3D: 9 teatros encendidos por cables reales de 24 h, 28 plazas del poder, 6 arcos de fricción y vuelo de cámara por selección.",
    categoria: "MUNDO",
    ruta: "/mundo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:teatros"],
    alias: "mundo 3d globo planeta tierra guerras en vivo mapa",
    idEntidadComo: "vg:mapa:mundo",
  },
  {
    id: "mod:conflicto",
    nombre: "FICHAS DE TEATRO",
    lema: "Una página por frente de guerra",
    descripcion:
      "Ficha server-rendered por cada teatro de guerra: resumen, cables reales del frente y puertas al globo, a la sala en vivo y al espía.",
    categoria: "MUNDO",
    ruta: "/conflicto/[tag]",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:teatros", "fnt:cables"],
    alias: "conflicto teatro frente ficha ucrania gaza taiwan sahel",
  },
  {
    id: "mod:espia",
    nombre: "MODO ESPÍA",
    lema: "Lo que los gobiernos publican",
    descripcion:
      "Índice de tensión por teatro (24 h contra la media de 7 días) y escuchas oficiales RSS verificadas una a una: ONU, ReliefWeb, OMS, OPCW. SIN SEÑAL honesto cuando no hay nada.",
    categoria: "MUNDO",
    ruta: "/espia",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:escuchas", "fnt:cables", "fnt:teatros"],
    alias: "espia gobierno radar escuchas osint inteligencia onu oms opcw desarme",
  },
  {
    id: "mod:pulsomundial",
    nombre: "WORLD PULSE",
    lema: "El centro de inteligencia mundial",
    descripcion:
      "El pulso del planeta con la fuente a la vista: 11 indicadores reales del Banco Mundial (CC BY 4.0, serie 2012–2025) para 47 naciones y el agregado mundial, cronología de cables reales por categoría y el WORLD PULSE INDEX — percentiles ponderados con pesos publicados y metodología transparente. Filtros por continente, país, categoría y período. Cero estadísticas inventadas: fecha de actualización, procedencia y limitaciones en cada dato.",
    categoria: "MUNDO",
    ruta: "/pulso-mundial",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:indicadores", "fnt:cables"],
    alias: "world pulse centro inteligencia mundial indicadores estadisticas banco mundial economia diplomacia sociedad ambiente indice wpi tendencias cronologia",
  },
  // ── SIMULACIÓN ─────────────────────────────────────────────
  {
    id: "mod:teatro-3d",
    nombre: "VANGUARD 3D · TEATRO TOTAL",
    lema: "Cualquier lugar del mundo en 3D/2D, frentes en vivo y arsenal interactivo",
    descripcion:
      "Motor táctico 2D/3D unificado con VANGUARD #1 primero: genera terrenos 3D y mapas 2D para cualquier coordenada o ciudad del planeta, vigila frentes en directo ligados a los cables, inspecciona uniformes por capas, comanda escuadrones 3D y despieza armas en CAD y rayos X.",
    categoria: "SIMULACION",
    ruta: "/teatro-3d",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:teatros", "fnt:cables"],
    alias: "vanguard 3d 2d simulador mundial terreno frentes uniformes escuadrones armas despiece",
    idEntidadComo: "vg:simulacion:teatro-3d",
  },
  {
    id: "mod:novedades",
    nombre: "LO NUEVO · EXPANSIÓN 10X",
    lema: "Registro de novedades con enlaces directos y 10 funciones interactivas nuevas",
    descripcion:
      "Menú y panel completo de novedades de VANGUARD con links directos (/teatro-3d, /novedades, /mundo, /en-vivo, /vertigo, /nucleo) más 10 herramientas nuevas en vivo conectadas a las APIs y datasets reales de la plataforma.",
    categoria: "SISTEMA",
    ruta: "/novedades",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:teatros"],
    alias: "lo nuevo novedades links directos 10 funciones expansion comparador termometro riesgo suministros radar osint duelo vigia briefing atlas",
  },
  {
    id: "mod:universo-diario",
    nombre: "THE DAILY UNIVERSE",
    lema: "Vanguard Credits, 8 colecciones con cartas 3D mejorables, Marketplace ético y Base Personal",
    descripcion:
      "Economía diaria y semanal sin miedo a perder recompensas: gana Vanguard Credits (VC) completando retos, quizzes e investigaciones educativas; desbloquea y mejora 40 cartas 3D Holo-Foil en 8 álbumes mundiales y personaliza tu experiencia en el Marketplace ético.",
    categoria: "COMUNIDAD",
    ruta: "/universo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables"],
    alias: "daily universe vanguard credits vc colecciones cartas 3d paises civilizaciones monumentos espacio fenomenos ciencia personajes acontecimientos marketplace base personal",
  },
  {
    id: "mod:ver-guerra",
    nombre: "VER GUERRA 3D",
    lema: "El frente en vivo, en volumen",
    descripcion:
      "El simulador 3D de frentes: unidades, territorios y batallas del teatro en tiempo real dentro del navegador.",
    categoria: "SIMULACION",
    ruta: "/ver-guerra",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:teatros"],
    alias: "ver guerra 3d simulador frente unidades batalla",
    idEntidadComo: "vg:simulacion:ver-guerra",
  },
  {
    id: "mod:zona-cero",
    nombre: "ZONA CERO",
    lema: "La ciudad que cae en vivo",
    descripcion:
      "El espectáculo único de Vanguard: una ciudad en directo, bloque a bloque, mientras el mundo arde.",
    categoria: "SIMULACION",
    ruta: "/zona-cero",
    permiso: "publico",
    estado: "VIVO",
    // v230.0 EL ESPEJO — dependencias declaradas: el simulador pulsa los
    // teatros reales (fnt:teatros) y su radar de despachos + la sección de
    // la guerra real viven de los cables (fnt:cables). Antes: vacías.
    dependencias: ["fnt:teatros", "fnt:cables"],
    alias: "zona cero ciudad en directo simulacion bloques",
    idEntidadComo: "vg:simulacion:zona-cero",
  },
  {
    id: "mod:mision",
    nombre: "MISIONES",
    lema: "Tu misión comunitaria",
    descripcion:
      "La misión del día, retos semanales y el progreso que paga tu tiempo en monedas, gemas y XP — guardado en la nube con tu cuenta.",
    categoria: "SIMULACION",
    ruta: "/mision",
    permiso: "cuenta",
    estado: "VIVO",
    dependencias: ["mod:cuenta"],
    alias: "mision misiones retos semanales recompensas monedas xp",
  },
  {
    id: "mod:objetivos",
    nombre: "LOS 100",
    lema: "La vitrina que casi nadie termina",
    descripcion:
      "Los 100 objetivos de Vanguard con botín a la vista y EL 1% como rey: solo cae con los otros 99 desbloqueados. Progreso real del PlayerState.",
    categoria: "SIMULACION",
    ruta: "/objetivos",
    permiso: "publico",
    estado: "VIVO",
    dependencias: [],
    alias: "objetivos logros desafios recompensas monedas gemas 1% vitrina",
  },
  {
    id: "mod:vanguard2",
    nombre: "VANGUARD-2",
    lema: "Cada sección, su propio mundo 3D",
    descripcion:
      "El universo en volumen: cada sección del SPA como mundo 3D independiente, en CSS3D, cero DOM encima.",
    categoria: "SIMULACION",
    ruta: "/vanguard2",
    permiso: "publico",
    estado: "VIVO",
    dependencias: [],
    alias: "vanguard2 universo 3d volumen secciones",
  },
  {
    id: "mod:escenarios",
    nombre: "EL ESTRATEGA",
    lema: "Escenarios con datos reales, nunca predicciones",
    descripcion:
      "Simulación pequeña verificable: datos/supuestos/variables/reglas/resultados SEPARADOS — fechas históricas, cables reales, frentes OSINT y gasto militar del Banco Mundial combinados bajo 5 supuestos declarados y 4 pesos que ajusta el usuario (0–2). Determinista, con desglose y procedencia a la vista. No predice: mide el peso relativo de los factores.",
    categoria: "SIMULACION",
    ruta: "/escenarios",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:acontecimientos", "fnt:cables", "fnt:teatros", "fnt:indicadores"],
    alias: "escenarios estratega simulacion presion teatro modelo pesos variables que pasa si analisis",
    idEntidadComo: "vg:simulacion:escenarios",
  },
  // ── COMUNIDAD ──────────────────────────────────────────────
  {
    id: "mod:audios",
    nombre: "LA EMISORA",
    lema: "La guerra en voz alta",
    descripcion:
      "El parte de guerra hablado que EXPLICA cada frente (emisor v217) y el muro donde los comandantes mandan su audio: grabador con permiso de micrófono, ≤90 s, moderado por techos.",
    categoria: "COMUNIDAD",
    ruta: "/audios",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:audios", "fnt:cables", "fnt:teatros"],
    alias: "audios emisora voz micro grabar radio comandante parte hablar escuchar",
  },
  {
    id: "mod:cuenta",
    nombre: "CUENTA VANGUARD",
    lema: "Tu progreso, en la nube",
    descripcion:
      "Registro y entrada reales (alias + clave, lockout, muros): el progreso viaja a cada aparato. La puerta vive en /modo y en el ritual de entrada.",
    categoria: "COMUNIDAD",
    ruta: "/modo",
    permiso: "cuenta",
    estado: "VIVO",
    dependencias: [],
    alias: "cuenta registro login entrar aliaste crear cuenta nube guardar",
  },
  {
    id: "mod:identidad",
    nombre: "VANGUARD ID",
    lema: "La firma viva del agente",
    descripcion:
      "El carnet de identidad: perfil con avatar y bio, KNOWLEDGE LEVEL (4 dimensiones con pesos publicados que suman 100 — Educación 35, Contribución 30, Constructiva 20, Retos 15 —, medido contra techos reales, jamás popularidad por volumen de publicaciones), insignias derivadas del estado real, estadísticas, historial de actividad (el log de la tienda), contenido guardado, privacidad por campo (actividad y favoritos OFF por defecto), notificaciones por categoría, bloqueos locales silenciosos, nombres reservados anti-suplantación y huella de identidad estable.",
    categoria: "COMUNIDAD",
    ruta: "/",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["mod:portada", "mod:cuenta"],
    alias: "identidad carnet id perfil knowledge level nivel conocimiento insignias logros privacidad bloquear huella firma avatar bio notificaciones anti suplantacion",
  },
  // ── SISTEMA ────────────────────────────────────────────────
  {
    id: "mod:modo",
    nombre: "TU MODO",
    lema: "Elige qué hacer en Vanguard",
    descripcion:
      "El selector permanente de puertas: 6 modos de la casa, fijado en tu cuenta o en tu aparato, con panel de cuenta sin salir de la página.",
    categoria: "SISTEMA",
    ruta: "/modo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["mod:cuenta"],
    alias: "modo elegir puerta entrada ritual que hacer",
  },
  {
    id: "mod:portada",
    nombre: "VANGUARD TODO",
    lema: "La portada total",
    descripcion:
      "La casa completa: redacción, mente, sensores, juegos y comunidad — el SPA con las 81 secciones, el buscador total y VG-ASSIST.",
    categoria: "SISTEMA",
    ruta: "/",
    permiso: "publico",
    estado: "VIVO",
    dependencias: [],
    alias: "portada todo casa spa inicio hangar",
  },
  {
    id: "mod:nucleo",
    nombre: "EL NÚCLEO",
    lema: "El mapa que conecta todo",
    descripcion:
      "Este censo: el registro de módulos, las 8 entidades compartidas con ids estables, la búsqueda global sobre fuentes autorizadas y los enlaces contextuales entre páginas.",
    categoria: "SISTEMA",
    ruta: "/nucleo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:modulos"],
    alias: "nucleo mapa modulos arquitectura busqueda entidades sistema",
  },
  {
    id: "mod:privacidad",
    nombre: "PRIVACIDAD",
    lema: "Las reglas de la casa por escrito",
    descripcion:
      "Qué se guarda, qué no y con qué derecho — la página que exige Publisher Center y la honestidad de la casa.",
    categoria: "SISTEMA",
    ruta: "/privacidad",
    permiso: "publico",
    estado: "VIVO",
    dependencias: [],
    alias: "privacidad terminos datos reglas legal",
  },
  {
    id: "mod:torre",
    nombre: "LA TORRE DE CONTROL",
    lema: "La casa, mirada desde dentro",
    descripcion:
      "Salud real del arranque: cuántos aparatos montan la casa, cuántos llegan vivos al final del montaje (la cortina eterna medida por primera vez), los tramos de carga y el embudo del camino real (globo → tab → zona → sala). Cuentas honestas de los cinco salvavidas v178→v184. Sin IP, sin user-agent, sin alias: cuenta sucesos, no personas. Su fuente es fnt:telemetria, privada por diseño.",
    categoria: "SISTEMA",
    ruta: "/torre",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:telemetria"],
    alias: "torre control salud telemetria rescate cortina arranque supervivencia diagnostico latido",
  },
  {
    id: "mod:voz",
    nombre: "LA VOZ MAESTRA",
    lema: "La casa que explica, no solo la que obedece",
    descripcion:
      "Asistente de voz con cuatro personas (locutora, analista, general, cronista), boca que respira con pausas reales y texto limpiado para decir en vez de leer. Su cerebro es el maestro: nueve teatros y quince conceptos de geopolítica explicados con terreno, actores, por qué importa y qué vigilar, sobre el archivo real con fuente y fecha, con navegación a las salas de la casa y memoria de doce turnos. El audio nunca sale del aparato y el micrófono es opcional: si el aparato no tiene voz, la respuesta se escribe.",
    categoria: "SISTEMA",
    ruta: "/voz",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:fuentes"],
    alias: "voz maestra maestro asistente orbe hablar audio locutora analista general cronista pausas persona explicar clases geopolítica microfono",
  },
  {
    id: "mod:cronica",
    nombre: "LA CRÓNICA DEL DÍA",
    lema: "Qué pasó de verdad, en un parte",
    descripcion:
      "El parte diario derivado del archivo real: cables de las últimas 24 h, teatros que hablaron con su última señal fechada, medios que firmaron, la hora UTC más cargada y el último cable que entró. La ventana medida se declara en la cara del lector y cada cifra viaja con su CADENA DE LA VERDAD. Sin datos, SIN SEÑAL honesto.",
    categoria: "REDACCION",
    ruta: "/cronica",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:fuentes"],
    alias: "cronica parte diario resumen hoy crónica retencion dia teatros medios",
  },
  {
    id: "mod:centinela",
    nombre: "TU CENTINELA",
    lema: "Lo que te importa, vigilado por ti",
    descripcion:
      "Vigilancia personal: el visitante pone bajo seguimiento teatros y medios reales y la casa le cuenta cuánto han hablado y cuándo fue su última señal. La lista vive SOLO en su aparato (localStorage, clave vg367-centinela) y no se envía a ningún servidor. Sin permisos de notificaciones ni avisos inventados.",
    categoria: "COMUNIDAD",
    ruta: "/centinela",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "fnt:fuentes", "mod:cronica"],
    alias: "centinela seguir vigilancia alertas teatro medio suscripcion avisos",
  },
  {
    id: "mod:musica",
    nombre: "LA MÚSICA CON FORMA",
    lema: "El himno, las piezas y la radio de la casa",
    descripcion:
      "La música de Vanguard con composición de verdad: sello de cuatro notas, forma A-B-A y tiempo absoluto (ancla + paso × duración) para que una pieza larga no se deforme nunca. Incluye el himno de la casa, tributos de pulso con melodía original, marchas militares, la radio de conflicto con emisoras reales comprobadas (fecha y código HTTP a la vista) y la radio de la casa — ambiente sintetizado y boletín leído del archivo real, que no depende de nadie. Todo el audio se fabrica con osciladores del aparato: cero archivos, cero licencias, cero copia.",
    categoria: "SISTEMA",
    ruta: "/musica",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cables", "mod:cronica", "mod:voz"],
    alias:
      "musica himno piezas radio conflicto emisora militar marcha sonido audio sello forma bpm sintetizador tambor sirena morse",
  },
  {
    id: "mod:catalogo",
    nombre: "EL CATÁLOGO DE LO QUE YA EXISTE",
    lema: `${TOTAL_REAL} piezas reales con su puerta`,
    descripcion: `Índice generado del árbol del repositorio: ${CENSO_CATALOGO.sala} salas con su ruta navegable, ${CENSO_CATALOGO.panel} paneles ya construidos, ${CENSO_CATALOGO.motor} motores y ${CENSO_CATALOGO.api} puntos de datos (${TOTAL_REAL} en total, v367.9), cada uno con el archivo del que sale como prueba. No es una idea ni una promesa: es la lista de lo que ya estaba hecho, para que se pueda encontrar y usar.`,
    categoria: "SISTEMA",
    ruta: "/catalogo",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:modulos"],
    alias:
      "catalogo indice inventario cien salas paneles motores api mapa de la casa lo que existe",
  },
  {
    id: "mod:radio-real",
    nombre: "LA RADIO REAL EN EL VANGUARD PÚBLICO",
    lema: "Las trece pistas reales, barajadas, en toda la casa",
    descripcion:
      "Motor aleatorio de la música real: baraja las trece pistas de dominio público y CC0 del catálogo y las pone solas, una tras otra, en el reproductor global de la portada, de modo que suenan en todo el sitio público mientras se navega. Se enciende SOLO cuando el piloto pulsa su botón (v367.7: ni siquiera con el primer gesto — orden del Dueño «no la pongas automática»), apaga el motor sintetizado al encenderse y se para a los tres fallos seguidos diciéndolo. Cada pista declara autor, licencia y fuente.",
    categoria: "SISTEMA",
    ruta: "/",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:audios"],
    alias:
      "radio real aleatorio shuffle musica publica dominio publico cc0 archive pista barajar encender parar chip v367.5",
  },
  {
    id: "mod:perfil-jugador",
    nombre: "EL PERFIL DEL JUGADOR",
    lema: "Carnet de seis piezas, código estable y permisos reales",
    descripcion:
      "La puerta única del perfil: reúne lo que la casa ya tenía (store del perfil con banner, marco, bio, país, facción, avatar y firma 3D; alias del game-store; modal de cuenta; censo de permisos del núcleo; huella anti-suplantación del carnet) y le suma la foto y el código del jugador. El carnet dice qué le falta a cada jugador en seis piezas; los permisos se leen del censo, no se escriben a mano; la foto se reduce en el aparato (320 px, JPEG 0.82) y no se sube a ningún servidor.",
    categoria: "SISTEMA",
    ruta: "/perfil",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:cuentas"],
    alias:
      "perfil jugador carnet codigo jugador permisos foto avatar banner marco bio faccion personalizacion cuenta sesion acceso v367.6",
  },
  {
    id: "mod:portadas",
    nombre: "LAS PORTADAS DE SALA",
    lema: "Cada sala abre con una imagen grande y sus cifras, no con un muro de texto",
    descripcion:
      "El componente de servidor que viste las salas densas: portada grande con dimensiones reales declaradas, título, sumario de dos líneas, cifras de la sala en tarjetas e índice de anclas. Cero JavaScript y cero hidratación — la portada viaja en el HTML. Nació de la medición del Agente 7, que encontró siete salas con más de 15.000 letras y ninguna imagen. Las ilustraciones son las que la casa ya tenía en /public/ilustraciones y cada cifra se calcula en el render: nada se inventó ni se escribió a mano. En pie en /servicios, /rostros, /atlas, /oscura, /poder, /verdad-cruda, /divisas y /archivo-mundial.",
    categoria: "SISTEMA",
    ruta: "/calidad",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["mod:calidad"],
    alias:
      "portada portadas imagen imagenes visual densidad libro texto tarjetas cifras kpi hero cabecera ilustraciones pilar 2 v367.10",
  },
  {
    id: "mod:calidad",
    nombre: "LA SALA DE LA CALIDAD",
    lema: "Seis agentes auditan la casa y publican su informe con fecha",
    descripcion:
      "El equipo de auditoría de la casa (scripts/auditoria.mjs, cero dependencias): RUTAS, ENLACES, IDIOMA, RECURSOS, BOTONES y EN VIVO. Cada agente tiene un solo deber y se le mide por su número; el sexto pide de verdad cada ruta al despliegue y anota el código HTTP, porque que un archivo exista no es lo mismo que una sección funcione. El informe se publica en /calidad leyendo la instantánea que escribe el propio auditor (src/lib/auditoria.json), sin una sola cifra escrita a mano. Nació de la orden del Dueño de 2026-11-14: menos acumulación y más calidad.",
    categoria: "SISTEMA",
    ruta: "/calidad",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["mod:catalogo"],
    alias:
      "auditoria calidad agentes errores bugs enlaces rotos recursos idioma botones salud smoke rutas defectos reparar auditar v367.9",
  },
  {
    id: "mod:parque-militar",
    nombre: "EL PARQUE MILITAR",
    lema: "Personajes, carros y mech reales, copiados con su licencia",
    descripcion:
      "Los seis modelos 3D que ya existían (Quaternius, CC0 1.0) copiados a la casa sin retocar la malla: infantería de asalto, operario de campaña, tres carros de combate con su animación de avance y un mech con 18 clips. Vanguard solo añade el tinte del uniforme por bando (seis uniformes, aplicados únicamente a los materiales de tela). Montado en /ver-guerra, /escenarios y /zona-cero. Si un archivo no abre, la escena lo confiesa y su puesto lo ocupa la figura procedural de la casa.",
    categoria: "SIMULACION",
    ruta: "/ver-guerra",
    permiso: "publico",
    estado: "VIVO",
    dependencias: ["fnt:teatros"],
    alias:
      "parque militar uniformes personajes soldados tanques carros mech vehiculos 3d glb gltf cc0 quaternius simulador guerra v367.8",
  },
];

/** ── Consultas del censo (puras, sin BD) ─────────────────── */

export function moduloPorId(id: string): ModuloNucleo | null {
  return MODULOS_NUCLEO.find((m) => m.id === id) ?? null;
}

export function moduloPorRuta(ruta: string): ModuloNucleo | null {
  return MODULOS_NUCLEO.find((m) => m.ruta === ruta) ?? null;
}

/** Módulos agrupados por categoría, en el orden del censo de categorías. */
export function modulosPorCategoria(): { categoria: CategoriaModulo; modulos: ModuloNucleo[] }[] {
  return CATEGORIAS_MODULO.map((categoria) => ({
    categoria,
    modulos: MODULOS_NUCLEO.filter((m) => m.categoria === categoria),
  }));
}

/** ¿Depende A de B, directa o en cadena? (evita ciclos por diseño). */
export function dependeDe(idModulo: string, idDependencia: string, profunidad = 6): boolean {
  const mod = moduloPorId(idModulo);
  if (!mod || profunidad <= 0) return false;
  if (mod.dependencias.includes(idDependencia)) return true;
  return mod.dependencias
    .filter((d) => d.startsWith("mod:"))
    .some((d) => dependeDe(d, idDependencia, profunidad - 1));
}

/** Los módulos que viven de este (cadena hacia arriba). */
export function dependientesDe(id: string): ModuloNucleo[] {
  return MODULOS_NUCLEO.filter((m) => m.dependencias.includes(id));
}
