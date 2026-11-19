// ═══════════════════════════════════════════════════════════════════
// v405.10 · LOS DIEZ ESPACIOS DE TRABAJO — el registro
//
// LA AUDITORÍA, EN UNA FRASE: la casa tenía seis navegaciones a la vez y
// 155 salas + 56 rutas repartidas entre ellas, pero ninguna sabía qué estaba
// haciendo el operador. Este archivo declara DIEZ espacios y, dentro de cada
// uno, las herramientas que sirven para lo que estás haciendo.
//
// REGLAS QUE CUMPLE ESTE REGISTRO (las comprueban los scripts de prueba):
//  ① Ninguna herramienta apunta a un sitio inventado: todo href es una ruta
//     real del repo o una sala real del cuartel (?sala=<clave>).
//  ② Ningún prefijo de ruta ni ninguna sala se declara en DOS espacios: si
//     hiciera falta, es que el espacio está mal pensado.
//  ③ Un espacio nuevo (o una herramienta nueva) es una entrada más en estas
//     listas: ni la barra, ni la sala /navegacion, ni el buscador se tocan.
//  ④ Nada se borra: este archivo añade contexto a lo que ya había; las seis
//     navegaciones viejas siguen funcionando tal cual.
// ═══════════════════════════════════════════════════════════════════

import type { ClaveEspacio, Espacio } from "./tipos";

export const ESPACIOS: Espacio[] = [
  // ─────────────────────────────────────────────────────────────── GEO
  {
    clave: "geo",
    nombre: "Geografía",
    lema: "El planeta, en volumen",
    color: "#5eead4",
    icono: "globe",
    detecta: {
      rutas: ["/conocimiento", "/mundos", "/mapas", "/atlas", "/mundo", "/zona-cero", "/conflictos", "/conflicto", "/guerra-hoy", "/rostros", "/pulso-mundial", "/pulso"],
      salas: ["mapa", "tierra", "geoint", "planeta", "atlas", "mundo", "teatro3d", "frentes", "fichas", "mundial", "rostros", "frente"],
      modulos: ["mapa", "conocimiento", "datos"],
      constelaciones: ["teatro3d"],
    },
    herramientas: [
      { id: "conocimiento-global", nombre: "Conocimiento global", href: "/conocimiento", icono: "book-open", desc: "Enciclopedia, centros de investigación, cronologías y comparación internacional con procedencia" },
      { id: "enciclopedia", nombre: "Enciclopedia", href: "/conocimiento/enciclopedia", icono: "book-open", desc: "Artículos de fondo con fuentes, imágenes con licencia y fecha de revisión: continentes, países, civilizaciones, ciencia y naturaleza", desde: "v417.0" },
      { id: "mundos", nombre: "El mapa de los mundos", href: "/mundos", icono: "globe-2", desc: "249 países con ficha unificada, 177 con polígono y fronteras reales, doce capas de datos y el registro de los quince mundos de la casa", desde: "v405.12" },
      { id: "mundos-pais", nombre: "Ficha de país", href: "/mundos/do", icono: "map-pin", desc: "Geografía, economía, política, historia y cultura de un país, con sus fronteras, sus vecinos y el puente al simulador", desde: "v405.12" },
      { id: "centro-mapas", nombre: "Centro de mapas", href: "/mapas", icono: "layers", desc: "Ocho capas geográficas sobre el globo: mundial, político, físico, económico, demográfico, temático, histórico y de acontecimientos", desde: "v405.9" },
      { id: "atlas", nombre: "Atlas mundial", href: "/atlas", icono: "book-open", desc: "84 naciones con capital, población, moneda y líder real" },
      { id: "mundo-3d", nombre: "Mundo 3D", href: "/mundo", icono: "globe-2", desc: "El globo de la casa con las zonas de control y los cables del día" },
      { id: "teatro-3d", nombre: "Teatro 3D", href: "/teatro-3d", icono: "crosshair", desc: "Cualquier lugar del planeta convertido en teatro táctico 2D/3D" },
      { id: "zona-cero", nombre: "Zona cero", href: "/zona-cero", icono: "target", desc: "Los puntos calientes del planeta, uno por uno" },
      { id: "conflictos", nombre: "Tablero de conflictos", href: "/conflictos", icono: "swords", desc: "Las regiones en seguimiento con su intensidad medida" },
      { id: "rostros", nombre: "Rostros del poder", href: "/rostros", icono: "users", desc: "Quién manda en cada sitio, con su sede real" },
      { id: "datos-vivos", nombre: "Datos vivos", href: "/pulso-mundial", icono: "activity", desc: "El planeta medido en tiempo real: sismos, clima espacial, señales" },
    ],
    vecinos: ["simular", "investigar", "leer"],
  },
  // ──────────────────────────────────────────────────────────── SIMULAR
  {
    clave: "simular",
    nombre: "Simulación",
    lema: "Qué pasa si…",
    color: "#f5a623",
    icono: "crosshair",
    detecta: {
      rutas: ["/teatro-3d", "/escenarios", "/ver-guerra", "/objetivos", "/armeria", "/cruce"],
      salas: ["laboratorio", "simulador", "imperio", "enclaves", "extranjera", "armodo", "operaciones", "warsim", "escenarios", "conquista", "edad", "multijugador", "estrategia"],
      modulos: ["arsenal"],
      constelaciones: ["estrategia", "experimental", "arquitecto"],
    },
    herramientas: [
      { id: "teatro-3d-sim", nombre: "Teatro táctico", href: "/teatro-3d", icono: "crosshair", desc: "El simulador: terreno, unidades y órdenes sobre el mapa real" },
      { id: "escenarios", nombre: "Escenarios", href: "/escenarios", icono: "flask-conical", desc: "Los escenarios jugables de la casa, abiertos y sin guion fijo" },
      { id: "ver-guerra", nombre: "Ver la guerra", href: "/ver-guerra", icono: "eye", desc: "La guerra como sistema: fuerzas, pérdidas y desgaste" },
      { id: "objetivos", nombre: "Objetivos", href: "/objetivos", icono: "target", desc: "Qué se busca en cada frente y con qué se mide" },
      { id: "armeria", nombre: "Armería", href: "/armeria", icono: "shield", desc: "Las armas reales que mueven los conflictos, con sus datos" },
      { id: "laboratorio", nombre: "Laboratorio del destino", href: "/cuartel?sala=laboratorio", icono: "flask-conical", desc: "La simulación de largo plazo: decisiones y consecuencias" },
      { id: "warsim", nombre: "WarSim", href: "/cuartel?sala=warsim", icono: "gamepad-2", desc: "El simulador de guerra por turnos de la casa" },
      { id: "cruce", nombre: "El Cruce", href: "/cruce", icono: "git-branch", desc: "Cruza dos teatros y mira qué se parecen" },
    ],
    vecinos: ["geo", "jugar", "investigar"],
  },
  // ─────────────────────────────────────────────────────────────── LEER
  {
    clave: "leer",
    nombre: "Redacción",
    lema: "El mundo, minuto a minuto",
    color: "#e8c56a",
    icono: "newspaper",
    detecta: {
      rutas: ["", "/cronica", "/en-vivo", "/noticia", "/lectura", "/galeria", "/audios", "/traductor", "/vertigo", "/musica"],
      salas: ["centro", "inicio", "redaccion", "noticias", "verdades", "verifica", "cambios", "envivo", "pantalla", "foryou", "videos", "directos", "memes", "canalbrief", "briefings", "briefing", "galeria"],
      modulos: ["medios"],
      constelaciones: ["inicio", "emisora"],
    },
    herramientas: [
      { id: "portada", nombre: "Portada", href: "/", icono: "home", desc: "El centro mundial de noticias, en vivo por importancia e impacto" },
      { id: "cronica", nombre: "Crónica del día", href: "/cronica", icono: "notebook-pen", desc: "Qué pasó de verdad en las últimas 24 horas, teatro por teatro" },
      { id: "en-vivo", nombre: "En vivo", href: "/en-vivo", icono: "radio", desc: "Cables entrando minuto a minuto, con hora y fuente" },
      { id: "guerra-hoy", nombre: "Guerra hoy", href: "/guerra-hoy", icono: "siren", desc: "El resumen de todos los frentes abiertos" },
      { id: "galeria", nombre: "Medios", href: "/galeria", icono: "images", desc: "Escucha y mira el mundo: imágenes, audio y directos" },
      { id: "traductor", nombre: "Traductor", href: "/traductor", icono: "languages", desc: "Las noticias del mundo en ocho idiomas" },
      { id: "vertigo", nombre: "Vértigo", href: "/vertigo", icono: "flip-horizontal-2", desc: "El archivo en vivo, una pieza por deslizamiento" },
      { id: "redaccion-sala", nombre: "La Redacción", href: "/cuartel?sala=redaccion", icono: "newspaper", desc: "El lugar optimizado para leer: portada, porqués e investigación" },
    ],
    vecinos: ["geo", "investigar", "archivo"],
  },
  // ────────────────────────────────────────────────────────── INVESTIGAR
  {
    clave: "investigar",
    nombre: "Inteligencia",
    lema: "Lo que no sale en portada",
    color: "#3ddcff",
    icono: "radar",
    detecta: {
      rutas: ["/espia", "/centinela", "/oscura", "/verdad-cruda", "/poder", "/modulo/secretos"],
      salas: ["salaguerra", "comunidad", "redmundial", "googles", "mente", "imagenes", "grafo", "espejo", "maquina", "expedientes", "ojodios", "osint", "canales", "wikiguerra", "centinela", "espectro", "pulsos", "evaluacion", "perdidas", "monitorglobal", "camaras", "cielos", "sismo", "ciber", "pulso", "radar", "geopolitica", "observatorio", "abusos", "incidentes", "memorial", "sala18", "dronguerra", "recluta", "espionaje", "crisis", "oscura"],
      modulos: ["secretos"],
      constelaciones: ["inteligencia", "observatorio", "oscsuro"],
    },
    herramientas: [
      { id: "espia", nombre: "Servicios secretos", href: "/espia", icono: "fingerprint", desc: "Agencias, agentes y expedientes con su documento a la vista" },
      { id: "centinela", nombre: "Centinela", href: "/centinela", icono: "radar", desc: "La vigilancia continua: lo que se mueve y lo que se calla" },
      { id: "oscura", nombre: "Verdad cruda", href: "/verdad-cruda", icono: "skull", desc: "Abusos documentados con su fuente pública citada" },
      { id: "poder", nombre: "El poder", href: "/poder", icono: "landmark", desc: "Quién decide de verdad y con qué instrumentos" },
      { id: "mente", nombre: "La Mente", href: "/cuartel?sala=mente", icono: "brain", desc: "El cerebro de IA de la casa: pregunta y razona contigo" },
      { id: "espejo", nombre: "El Espejo", href: "/cuartel?sala=espejo", icono: "venetian-mask", desc: "Una crisis, todas las perspectivas" },
      { id: "expedientes", nombre: "Expedientes", href: "/cuartel?sala=expedientes", icono: "file-search", desc: "Los papeles desclasificados de la casa" },
      { id: "googles", nombre: "Googles de Vanguard", href: "/cuartel?sala=googles", icono: "search", desc: "El buscador de los problemas geopolíticos" },
    ],
    vecinos: ["geo", "archivo", "leer"],
  },
  // ───────────────────────────────────────────────────────────── ARCHIVO
  {
    clave: "archivo",
    nombre: "Archivo",
    lema: "La memoria de la casa",
    color: "#a78bfa",
    icono: "archive",
    detecta: {
      rutas: ["/archivo-mundial", "/historia", "/catalogo"],
      salas: ["enciclopedia", "curiosidades", "epocas", "historia", "muertes", "contadores", "carteles", "biblioteca", "tribunal", "conquistas3d", "registro"],
      constelaciones: ["archivo", "comando"],
    },
    herramientas: [
      { id: "archivo-mundial", nombre: "Archivo mundial", href: "/archivo-mundial", icono: "archive", desc: "44 curiosidades verídicas, 8 eras y los contadores de las guerras" },
      { id: "historia", nombre: "Historia", href: "/historia", icono: "hourglass", desc: "Las guerras que quedaron escritas, con su año y su fuente" },
      { id: "catalogo", nombre: "Catálogo real", href: "/catalogo", icono: "file-stack", desc: "Todo lo que la casa ha construido, pieza por pieza" },
      { id: "biblioteca", nombre: "Biblioteca", href: "/cuartel?sala=biblioteca", icono: "book-marked", desc: "Los libros y documentos que sostienen el archivo" },
      { id: "epocas", nombre: "Épocas", href: "/cuartel?sala=epocas", icono: "history", desc: "Ocho eras desde la Prehistoria hasta hoy" },
      { id: "tribunal", nombre: "Tribunal", href: "/cuartel?sala=tribunal", icono: "gavel", desc: "Los juicios que cambiaron el mapa" },
    ],
    vecinos: ["investigar", "geo", "leer"],
  },
  // ───────────────────────────────────────────────────────────── MERCADO
  {
    clave: "mercado",
    nombre: "Mercado",
    lema: "El mundo que se paga",
    color: "#34d399",
    icono: "circle-dollar-sign",
    detecta: {
      rutas: ["/divisas", "/universo", "/modo"],
      salas: ["bolsa", "hacienda", "divisas", "bookmaker", "apuestas", "lados", "predicciones", "gancho", "mercados", "pronosticos", "bolsamonedas", "tienda", "universo"],
      modulos: ["universo"],
      constelaciones: ["mercado"],
    },
    herramientas: [
      { id: "divisas", nombre: "Divisas", href: "/divisas", icono: "banknote", desc: "247 países y territorios con su moneda real y su tasa" },
      { id: "universo", nombre: "Daily Universe", href: "/universo", icono: "gem", desc: "Créditos, colecciones 3D y el marketplace ético" },
      { id: "bolsa", nombre: "Bolsa de guerra", href: "/cuartel?sala=bolsa", icono: "trending-up", desc: "El mercado que mueve la guerra: apuesta con criterio" },
      { id: "predicciones", nombre: "Predicciones", href: "/cuartel?sala=predicciones", icono: "dices", desc: "Anticipa lo que va a pasar y gana o pierde con ello" },
      { id: "hacienda", nombre: "Hacienda", href: "/cuartel?sala=hacienda", icono: "coins", desc: "Tus cuentas dentro de la casa, sin sorpresas" },
      { id: "modo", nombre: "Modo y cuenta", href: "/modo", icono: "user-cog", desc: "El selector de modo y el estado de tu cuenta" },
    ],
    vecinos: ["jugar", "crear", "leer"],
  },
  // ─────────────────────────────────────────────────────────────── CREAR
  {
    clave: "crear",
    nombre: "Talleres",
    lema: "Lo que aún no existe",
    color: "#f472b6",
    icono: "hammer",
    detecta: {
      rutas: ["/herramientas", "/servicios", "/novedades", "/nucleo", "/voz"],
      salas: ["agenteia", "obras", "creador", "studios", "mapascrea", "armeria", "maps", "taller", "estudio", "atelier", "experimental", "arquitecto", "nueva", "fusion", "agente", "novedades"],
      constelaciones: ["creadores", "hangar", "nueva"],
    },
    herramientas: [
      { id: "herramientas", nombre: "Herramientas", href: "/herramientas", icono: "wrench", desc: "Los útiles de la casa: crear, convertir, medir" },
      { id: "servicios", nombre: "Servicios", href: "/servicios", icono: "briefcase", desc: "Lo que la casa hace por ti, con su precio y su letra pequeña" },
      { id: "agenteia", nombre: "Modo agente", href: "/cuartel?sala=agenteia", icono: "bot", desc: "El agente que crea contigo: juegos, escenarios e informes" },
      { id: "obras", nombre: "El muro de obras", href: "/cuartel?sala=obras", icono: "layout-grid", desc: "La vitrina de la comunidad: juega, vota y remezcla" },
      { id: "laboratorio-crea", nombre: "Simulador de escenarios", href: "/escenarios", icono: "flask-conical", desc: "Construye un escenario y hazlo jugable" },
      { id: "nucleo", nombre: "El Núcleo", href: "/nucleo", icono: "cpu", desc: "La IA que vive en tu navegador: sin claves, sin servidores" },
      { id: "voz", nombre: "La Voz", href: "/voz", icono: "mic", desc: "Habla con la casa y deja que la casa hable" },
      { id: "novedades", nombre: "Lo nuevo", href: "/novedades", icono: "sparkles", desc: "Todo lo recién añadido, con su enlace directo" },
      { id: "espacio-crear", nombre: "Tu espacio", href: "/espacio", icono: "briefcase", desc: "Lleva lo que crees a un proyecto con sus piezas y sus sesiones", desde: "v405.11" },
    ],
    vecinos: ["jugar", "mercado", "sistema"],
  },
  // ─────────────────────────────────────────────────────────────── JUGAR
  {
    clave: "jugar",
    nombre: "Juego",
    lema: "Tu progreso, tu guerra",
    color: "#ff3b30",
    icono: "castle",
    detecta: {
      rutas: ["/cuartel", "/modulos", "/clasico", "/perfil"],
      salas: ["detective", "mipais", "arcade", "dron", "minijuego", "combate", "misiones", "retos", "quiz", "logros", "recompensas", "racha", "torneos", "estadisticas", "ranking", "consejoia", "empleos", "fortaleza"],
      modulos: ["juego"],
      constelaciones: ["juego"],
    },
    herramientas: [
      { id: "cuartel", nombre: "El Cuartel", href: "/cuartel", icono: "castle", desc: "Las 155 salas de la casa en una sola barra de pestañas" },
      { id: "modulos", nombre: "Todas las salas", href: "/modulos", icono: "layout-grid", desc: "Las 155 salas y las 20 constelaciones, con buscador" },
      { id: "perfil", nombre: "Tu carnet", href: "/perfil", icono: "user-check", desc: "Tu rango, tus logros y tu historial dentro de la casa" },
      { id: "misiones", nombre: "Misiones", href: "/cuartel?sala=misiones", icono: "target", desc: "Las misiones del día y los retos semanales" },
      { id: "arcade", nombre: "Arcade", href: "/cuartel?sala=arcade", icono: "joystick", desc: "Los juegos rápidos de la casa" },
      { id: "logros", nombre: "Logros", href: "/cuartel?sala=logros", icono: "medal", desc: "Lo que has conseguido y lo que te falta" },
      { id: "torneos", nombre: "Torneos", href: "/cuartel?sala=torneos", icono: "trophy", desc: "Competiciones abiertas entre operadores" },
    ],
    vecinos: ["simular", "social", "mercado"],
  },
  // ─────────────────────────────────────────────────────────────── SOCIAL
  {
    clave: "social",
    nombre: "Comunidad",
    lema: "Los otros operadores",
    color: "#38bdf8",
    icono: "users",
    detecta: {
      rutas: ["/perfil-social", "/privacidad", "/mision"],
      salas: ["foros", "encuestas", "redes", "amigos", "perfil", "identidad", "gobierno", "embajadores", "alianzas", "salas", "contribuidores", "notificaciones", "telegram", "ayuda", "cama"],
      constelaciones: ["social"],
    },
    herramientas: [
      { id: "foros", nombre: "Foros", href: "/cuartel?sala=foros", icono: "messages-square", desc: "Donde la comunidad discute el mundo que lee" },
      { id: "amigos", nombre: "Amigos", href: "/cuartel?sala=amigos", icono: "users", desc: "Tu red dentro de la casa" },
      { id: "ranking", nombre: "Ranking", href: "/cuartel?sala=ranking", icono: "crown", desc: "Quién está arriba y por qué" },
      { id: "encuestas", nombre: "Encuestas", href: "/cuartel?sala=encuestas", icono: "vote", desc: "La casa opina sobre lo que pasa" },
      { id: "privacidad", nombre: "Privacidad", href: "/privacidad", icono: "shield-check", desc: "Qué se guarda, dónde y durante cuánto tiempo" },
      { id: "ayuda", nombre: "Ayuda", href: "/cuartel?sala=ayuda", icono: "help-circle", desc: "Cómo se usa la casa, sin adornos" },
    ],
    vecinos: ["jugar", "crear", "leer"],
  },
  // ────────────────────────────────────────────────────────────── SISTEMA
  {
    clave: "sistema",
    nombre: "La Casa",
    lema: "Vanguard por dentro",
    color: "#94a3b8",
    icono: "settings",
    detecta: {
      rutas: ["/estado", "/calidad", "/torre", "/escudo", "/navegacion", "/entrar", "/offline"],
      salas: ["agentes", "analista", "hangar"],
      modulos: ["estado"],
      constelaciones: ["sistema"],
    },
    herramientas: [
      { id: "estado", nombre: "Estado", href: "/estado", icono: "activity", desc: "La casa por dentro: salud, versión y auditoría" },
      { id: "navegacion", nombre: "Navegación", href: "/navegacion", icono: "compass", desc: "Esta arquitectura: los diez espacios, sus herramientas y sus fusiones", desde: "v405.10" },
      { id: "arquitectura", nombre: "Arquitectura", href: "/arquitectura", icono: "network", desc: "El censo del árbol, el motor de nexos y los veintidós departamentos con su estado real", desde: "v412.0" },
      { id: "calidad", nombre: "Calidad", href: "/calidad", icono: "gauge", desc: "Las pruebas de la casa y lo que miden" },
      { id: "torre", nombre: "La Torre", href: "/torre", icono: "tower-control", desc: "El control de la infraestructura y los despliegues" },
      { id: "escudo", nombre: "El Escudo", href: "/escudo", icono: "shield-alert", desc: "Seguridad, permisos y límites de la casa" },
      { id: "nucleo-sistema", nombre: "Núcleo", href: "/nucleo", icono: "cpu", desc: "La IA embebida: estado del modelo y del worker" },
      { id: "agentes", nombre: "Agentes", href: "/cuartel?sala=agentes", icono: "bot", desc: "Los agentes automáticos que mantienen la casa viva" },
    ],
    vecinos: ["crear", "social", "geo"],
  },
  // ────────────────────────────────────────────────────────── MI ESPACIO
  {
    clave: "miespacio",
    nombre: "Mi espacio",
    lema: "Tu mesa de trabajo",
    color: "#c084fc",
    icono: "briefcase",
    detecta: {
      rutas: ["/espacio"],
      salas: [],
    },
    herramientas: [
      { id: "espacio-trabajo", nombre: "Espacio de trabajo", href: "/espacio", icono: "briefcase", desc: "Proyectos con sus mapas, simulaciones, escenarios y notas; paneles reorganizables, sesiones e historial", desde: "v405.11" },
      { id: "perfil-mio", nombre: "Tu carnet", href: "/perfil", icono: "user-check", desc: "Identidad, progreso y personalización del operador" },
      { id: "modo-mio", nombre: "Modo y cuenta", href: "/modo", icono: "user-cog", desc: "El selector de modo de la casa" },
      { id: "navegacion-mia", nombre: "La arquitectura", href: "/navegacion", icono: "compass", desc: "Los once espacios y sus herramientas: de dónde sale cada acceso" },
      { id: "catalogo-mio", nombre: "El catálogo", href: "/catalogo", icono: "file-stack", desc: "Todo lo construido, pieza por pieza, con su ruta" },
      { id: "obras-mio", nombre: "El muro", href: "/cuartel?sala=obras", icono: "layout-grid", desc: "La vitrina de la comunidad, para remezclar" },
    ],
    vecinos: ["crear", "jugar", "sistema"],
  },
];

/** Índice por clave (una sola búsqueda, cero recorridos repetidos). */
export const ESPACIO_POR_CLAVE: Record<ClaveEspacio, Espacio> = ESPACIOS.reduce(
  (acc, e) => {
    acc[e.clave] = e;
    return acc;
  },
  {} as Record<ClaveEspacio, Espacio>,
);

export const CLAVES_ESPACIO: ClaveEspacio[] = ESPACIOS.map((e) => e.clave);

/** Todas las herramientas de la casa, sin repetir id. */
export const HERRAMIENTAS: Record<string, { herramienta: import("./tipos").Herramienta; espacio: ClaveEspacio }> =
  ESPACIOS.reduce((acc, e) => {
    for (const h of e.herramientas) acc[h.id] = { herramienta: h, espacio: e.clave };
    return acc;
  }, {} as Record<string, { herramienta: import("./tipos").Herramienta; espacio: ClaveEspacio }>);

export const TOTAL_HERRAMIENTAS = Object.keys(HERRAMIENTAS).length;

/** El espacio por defecto cuando no hay pistas: la portada es lectura. */
export const ESPACIO_POR_DEFECTO: ClaveEspacio = "leer";
