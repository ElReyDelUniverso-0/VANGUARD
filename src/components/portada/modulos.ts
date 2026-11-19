// ============================================================
// v402.0 LOS CINCO MÓDULOS — mandato del Dueño: «algunos no sirven o son muy
// similares… corrígelos, fusiónalos». Las 47 salas sueltas quedan agrupadas en
// CINCO módulos (más el Estado de la casa, que reúne las salas internas).
// Cada sala pasa a ser una PESTAÑA de su módulo: la carcasa pinta la barra de
// pestañas debajo de la cabecera. Las salas duplicadas de verdad (clásico =
// cuartel) redirige a su original (next.config.ts). /modo (selector + cuenta) es pestaña de Juego.
// FUENTE ÚNICA: la cabecera, la carcasa y el sitemap leen de aquí.
// ============================================================

export type Pestana = { href: string; label: string; vivo?: boolean; img?: string; txt?: string };
export type Modulo = {
  id: string;
  nombre: string;
  /** etiqueta corta para la cabecera */
  corto: string;
  lema: string;
  /** la sala que abre el módulo (la portada del módulo vive en /modulo/[id]) */
  nav: string;
  /** portada del módulo: ilustración de la casa y su frase de entrada */
  img: string;
  gancho: string;
  pestanas: Pestana[];
};

// v402.6 LOS NUEVE MÓDULOS — mandato del Dueño: «Vanguard tiene mucho más que
// mostrar que solo noticias». Inteligencia escondía 16 salas detrás de una sola
// puerta y dos salas (El Cruce, Las diez llaves) no colgaban de ningún módulo.
// Nada nuevo: las MISMAS salas, repartidas en módulos con nombre propio,
// cada uno con su portada (/modulo/[id]) y su barra de pestañas.
export const MODULOS: Modulo[] = [
  {
    id: "conflictos",
    nombre: "Conflictos",
    corto: "Conflictos",
    lema: "Las guerras del planeta, minuto a minuto",
    nav: "/guerra-hoy",
    img: "/ilustraciones/frentes.jpg",
    gancho: "Todos los frentes abiertos, con la hora y la fuente de cada cable.",
    pestanas: [
      { href: "/guerra-hoy", label: "Hoy", img: "/ilustraciones/frentes.jpg", txt: "El resumen de todos los frentes abiertos hoy." },
      { href: "/en-vivo", label: "En vivo", vivo: true, img: "/ilustraciones/envivo.jpg", txt: "Cables reales entrando minuto a minuto, con hora y fuente." },
      { href: "/conflictos", label: "Tablero", img: "/ilustraciones/crisis.jpg", txt: "Las regiones en seguimiento con su intensidad medida." },
      { href: "/cronica", label: "Crónica del día", img: "/ilustraciones/briefing.jpg", txt: "Qué pasó de verdad en las últimas 24 horas, teatro por teatro." },
      { href: "/vertigo", label: "Vértigo", img: "/ilustraciones/foryou.jpg", txt: "El archivo en vivo, una pieza por deslizamiento." },
      { href: "/verdad-cruda", label: "Lo que no se dice", img: "/ilustraciones/verdades.jpg", txt: "Abusos documentados de las guerras, con su fuente." },
    ],
  },
  {
    id: "mapa",
    nombre: "Mapa 3D",
    corto: "Mapa",
    lema: "El planeta en volumen",
    nav: "/mundo",
    img: "/ilustraciones/mundo.jpg",
    gancho: "Gira el globo, entra al frente y recorre la casa en tres dimensiones.",
    pestanas: [
      // v405.10: el centro de mapas (v405.9) entra donde le toca — el módulo del
      // mapa. No crea módulo nuevo ni sustituye a nadie: es una pestaña más.
      { href: "/mapas", label: "Centro de mapas", img: "/ilustraciones/planeta.jpg", txt: "Ocho capas geográficas sobre un solo globo: mundial, político, físico, económico, demográfico, temático, histórico y de acontecimientos." },
      { href: "/mundo", label: "Globo vivo", img: "/ilustraciones/mundo.jpg", txt: "El globo 3D con los teatros encendidos y sus cables." },
      { href: "/ver-guerra", label: "Frente en directo", img: "/ilustraciones/frente.jpg", txt: "El frente en directo: despachos reales y el parque militar." },
      { href: "/zona-cero", label: "Teatro global", img: "/ilustraciones/warsim.jpg", txt: "La mesa de guerra mundial con teatros y unidades." },
      { href: "/vanguard2", label: "Universo 3D", img: "/ilustraciones/conquistas3d.jpg", txt: "Cada sección de la casa en su propio mundo 3D." },
    ],
  },
  {
    id: "conocimiento",
    nombre: "Conocimiento",
    corto: "Conocimiento",
    lema: "El mundo explicado: naciones, personas y dinero",
    nav: "/atlas",
    img: "/ilustraciones/planeta.jpg",
    gancho: "Las fichas que explican quién es quién, cuánto pesa cada país y de dónde viene todo.",
    pestanas: [
      { href: "/conocimiento", label: "Conocimiento global", txt: "Nueve centros, treinta áreas, enciclopedia conectada e indicadores con fuentes y límites." },
      // v417.0 VANGUARD KNOWLEDGE — artículos de fondo con fuentes, imágenes con licencia y fecha de revisión
      { href: "/conocimiento/enciclopedia", label: "Enciclopedia", txt: "Artículos de fondo sobre continentes, países, civilizaciones, ciencia y naturaleza, con fuentes y fecha de revisión." },
      { href: "/atlas", label: "Atlas", img: "/ilustraciones/planeta.jpg", txt: "Las naciones, las personas y las rutas del poder." },
      // v412.0 INVESTIGACIÓN SISTÉMICA — dossiers interconectados con datos, mapas, comparador y simuladores
      { href: "/investigacion", label: "Investigación", img: "/ilustraciones/radar.jpg", txt: "Dossiers sistémicos conectados: comprender, investigar, visualizar, comparar y simular." },
      // v406.3 EDITORIAL COMMAND — la biblioteca de artículos con fuentes, en diez áreas.
      { href: "/editorial", label: "Redacción", img: "/ilustraciones/biblioteca.jpg", txt: "Artículos con fuentes en diez áreas: geopolítica, historia, economía, conflictos y más." },
      { href: "/rostros", label: "Rostros del poder", img: "/ilustraciones/gobierno.jpg", txt: "Quién decide y quién ejecuta: las fichas del poder." },
      { href: "/divisas", label: "Dinero", img: "/ilustraciones/divisas.jpg", txt: "Las monedas oficiales del planeta y quién las comparte." },
      { href: "/historia", label: "Historia", img: "/ilustraciones/historia.jpg", txt: "Las guerras que enseñaron a leer las de hoy." },
      { href: "/archivo-mundial", label: "Archivo", img: "/ilustraciones/curiosidades.jpg", txt: "Curiosidades verídicas, eras y los contadores de las guerras." },
      { href: "/traductor", label: "Traductor", img: "/ilustraciones/osint.jpg", txt: "Las noticias del mundo en tu idioma." },
    ],
  },
  // v407.1 EL PLANETA EN CIFRAS — el módulo de los países: la ficha de cada
  // uno (que ya existía en /mundos sin colgar de ningún módulo) más los cinco
  // centros que la ponen en contexto: comparar, ordenar, sumar por regiones,
  // contar la población y ver quién se sienta con quién.
  {
    id: "planeta",
    nombre: "Planeta en cifras",
    corto: "Planeta",
    lema: "Países, regiones y bloques medidos con datos abiertos",
    nav: "/mundos",
    img: "/ilustraciones/maps.jpg",
    gancho: "Compara países, ordénalos, súmalos por regiones y mira qué pesa cada bloque, con las cifras del Banco Mundial y su año.",
    pestanas: [
      { href: "/mundos", label: "Países", img: "/ilustraciones/mi-pais.jpg", txt: "El mapa de los mundos: la ficha de cada país con sus fronteras reales." },
      { href: "/comparador", label: "Comparador", img: "/ilustraciones/estadisticas.jpg", txt: "Hasta cuatro países cara a cara: población, economía, defensa y años de vida." },
      { href: "/rankings", label: "Rankings", img: "/ilustraciones/ranking.jpg", txt: "Ocho listas mundiales completas, con el año del dato de cada país." },
      { href: "/demografia", label: "Población", img: "/ilustraciones/edad.jpg", txt: "Cuántos somos, dónde nos concentramos y cuántos años vivimos." },
      { href: "/regiones", label: "Regiones", img: "/ilustraciones/planeta.jpg", txt: "Las 24 subregiones del mundo con su población y su economía sumadas." },
      { href: "/organizaciones", label: "Organizaciones", img: "/ilustraciones/alianzas.jpg", txt: "OTAN, UE, BRICS, OPEP, SICA y once bloques más: quién está y cuánto pesan." },
    ],
  },
  {
    id: "secretos",
    nombre: "Secretos",
    corto: "Secretos",
    lema: "Espías, agencias y expedientes con su documento",
    nav: "/espia",
    img: "/ilustraciones/espionaje.jpg",
    gancho: "Lo que publican los gobiernos, las agencias que vigilan y los expedientes con veredicto.",
    pestanas: [
      { href: "/espia", label: "Modo espía", img: "/ilustraciones/espionaje.jpg", txt: "Lo que gobiernos y organizaciones publican, en un radar." },
      { href: "/servicios", label: "Servicios secretos", img: "/ilustraciones/agente.jpg", txt: "Las agencias de inteligencia del mundo, expediente a expediente." },
      { href: "/oscura", label: "Biblioteca oscura", img: "/ilustraciones/oscura.jpg", txt: "Teorías y secretos con su veredicto y su documento." },
    ],
  },
  {
    id: "arsenal",
    nombre: "Arsenal",
    corto: "Arsenal",
    lema: "Las armas y la fuerza que mueven los conflictos",
    nav: "/armeria",
    img: "/ilustraciones/armeria.jpg",
    gancho: "Cada arma explicada, el gasto militar real y los modelos 3D para verlos de cerca.",
    pestanas: [
      { href: "/armeria", label: "Armería", img: "/ilustraciones/armeria.jpg", txt: "Las armas que explican los conflictos de hoy." },
      { href: "/poder", label: "Poder militar", img: "/ilustraciones/estadisticas.jpg", txt: "El gasto militar real del planeta, país por país." },
      { href: "/teatro-3d", label: "Arsenal 3D", img: "/ilustraciones/simulador.jpg", txt: "Uniformes, escuadrones y armas en 2D y 3D." },
      { href: "/escenarios", label: "Escenarios", img: "/ilustraciones/predicciones.jpg", txt: "Escenarios de presión con supuestos a la vista; nunca predicciones." },
    ],
  },
  {
    id: "datos",
    nombre: "Datos vivos",
    corto: "Datos",
    lema: "El planeta medido en tiempo real",
    nav: "/pulso-mundial",
    img: "/ilustraciones/pulso.jpg",
    gancho: "Sismos, alertas e indicadores oficiales, medidos desde tu casa y avisándote a ti.",
    pestanas: [
      { href: "/pulso-mundial", label: "Pulso mundial", img: "/ilustraciones/pulso.jpg", txt: "Indicadores del Banco Mundial y la cronología del planeta." },
      { href: "/cruce", label: "El Cruce", vivo: true, img: "/ilustraciones/sismo.jpg", txt: "Lo que pasó hoy, medido a distancia de tu casa." },
      { href: "/herramientas", label: "Las diez llaves", img: "/ilustraciones/radar.jpg", txt: "Herramientas externas de vigilancia, abiertas dentro de la casa." },
      { href: "/centinela", label: "Mi centinela", img: "/ilustraciones/centinela.jpg", txt: "Elige qué vigilar y la casa te avisa." },
    ],
  },
  {
    id: "medios",
    nombre: "Medios",
    corto: "Medios",
    lema: "Escucha y mira el mundo",
    nav: "/galeria",
    img: "/ilustraciones/galeria.jpg",
    gancho: "Fotos reales, el parte hablado, la música de dominio público y la voz de la casa.",
    pestanas: [
      { href: "/galeria", label: "Fototeca", img: "/ilustraciones/galeria.jpg", txt: "Fotografías reales del planeta y la videoteca." },
      { href: "/audios", label: "Radio de guerra", img: "/ilustraciones/canales.jpg", txt: "La guerra explicada en voz alta: el parte hablado." },
      { href: "/musica", label: "Música", img: "/ilustraciones/studios.jpg", txt: "Música real de dominio público y la radio del conflicto." },
      { href: "/voz", label: "La voz", img: "/ilustraciones/briefings.jpg", txt: "La voz que explica Vanguard y responde preguntas." },
    ],
  },
  {
    id: "juego",
    nombre: "Juego",
    corto: "Juego",
    lema: "Misiones, logros y tu carnet",
    nav: "/cuartel",
    img: "/ilustraciones/salas.jpg",
    gancho: "Misiones diarias, retos, torneos y un carnet de agente que sube de rango contigo.",
    pestanas: [
      { href: "/cuartel", label: "Cuartel", img: "/ilustraciones/salas.jpg", txt: "El centro de mando del juego." },
      { href: "/objetivos", label: "Objetivos", img: "/ilustraciones/logros.jpg", txt: "Misiones, retos y torneos: lo que hay que hacer hoy." },
      { href: "/universo", label: "Colecciones", img: "/ilustraciones/recompensas.jpg", txt: "Créditos, colecciones y tu base personal." },
      // v406.1 LA FORJA: el ecosistema de creadores entra como pestaña del módulo de la comunidad y el juego
      { href: "/creadores", label: "La Forja", img: "/ilustraciones/creador.jpg", txt: "Publica mapas, escenarios, investigaciones, simulaciones y proyectos con tu nombre." },
      { href: "/mision", label: "Misión 100", img: "/ilustraciones/recluta.jpg", txt: "Reparte Vanguard y suma reclutas." },
      { href: "/perfil", label: "Mi perfil", img: "/ilustraciones/perfil.jpg", txt: "Tu carnet de agente, tu código y tus permisos." },
      { href: "/modo", label: "Modo y cuenta", img: "/ilustraciones/registro.jpg", txt: "Elige cómo juegas y entra con tu alias." },
    ],
  },
  {
    id: "estado",
    nombre: "Estado de Vanguard",
    corto: "Estado",
    lema: "La casa por dentro, auditada",
    nav: "/estado",
    img: "/ilustraciones/radar.jpg",
    gancho: "El latido público, la auditoría y todo lo nuevo, con sus defectos abiertos.",
    pestanas: [
      { href: "/estado", label: "Latido", img: "/ilustraciones/radar.jpg", txt: "El latido público: la casa responde en vivo." },
      { href: "/novedades", label: "Novedades", img: "/ilustraciones/notificaciones.jpg", txt: "Todo lo nuevo, con enlace directo." },
      { href: "/calidad", label: "Calidad", img: "/ilustraciones/evaluacion.jpg", txt: "La auditoría de la casa, con sus defectos abiertos." },
      { href: "/torre", label: "Torre de control", img: "/ilustraciones/operaciones.jpg", txt: "La salud real del arranque, noche a noche." },
      { href: "/directorio", label: "Directorio", img: "/ilustraciones/enciclopedia.jpg", txt: "Todas las puertas de la casa, buscables, con tus favoritos y tus recientes." },
      { href: "/colecciones", label: "Colecciones", img: "/ilustraciones/misiones.jpg", txt: "Recorridos guiados por temas: de la pregunta a las salas que la responden." },
      { href: "/catalogo", label: "Catálogo", img: "/ilustraciones/enciclopedia.jpg", txt: "El índice de lo que ya existe en Vanguard." },
      { href: "/nucleo", label: "Núcleo", img: "/ilustraciones/fusion.jpg", txt: "El censo de módulos y la búsqueda global." },
      { href: "/escudo", label: "Escudo", img: "/ilustraciones/ciber.jpg", txt: "El buscador de llaves: que ningún secreto se publique." },
      { href: "/privacidad", label: "Privacidad", img: "/ilustraciones/registro.jpg", txt: "Qué datos se guardan y cuáles no." },
    ],
  },
];

function dentro(ruta: string, href: string) {
  return ruta === href || ruta.startsWith(href + "/");
}

/** el módulo al que pertenece una ruta (o null para la portada y /lectura) */
export function moduloDe(ruta: string | null): Modulo | null {
  if (!ruta) return null;
  if (ruta.startsWith("/modulo/")) return MODULOS.find((m) => ruta === `/modulo/${m.id}`) ?? null;
  if (dentro(ruta, "/conflicto")) return MODULOS[0]; // fichas /conflicto/[tag]
  if (dentro(ruta, "/noticia")) return MODULOS[0];
  for (const m of MODULOS) if (m.pestanas.some((p) => dentro(ruta, p.href))) return m;
  return null;
}

/** salas internas: fuera del buscador y del sitemap */
// v405.10: la sala de la arquitectura de navegación es interna (lleva noindex)
export const SALAS_INTERNAS = ["/calidad", "/torre", "/catalogo", "/nucleo", "/escudo", "/novedades", "/mision", "/navegacion"];

/** la portada propia de cada módulo */
export const portadaDe = (m: Modulo) => `/modulo/${m.id}`;

/** a dónde lleva la cabecera: los módulos con sala-vestíbulo propia entran
 *  directo a ella; los nuevos entran por su portada */
const CON_VESTIBULO = ["conflictos", "mapa", "juego"];
export const entradaDe = (m: Modulo) => (CON_VESTIBULO.includes(m.id) ? m.nav : portadaDe(m));

/** los módulos que se enseñan al público (el Estado vive aparte, al pie) */
export const MODULOS_PUBLICOS = MODULOS.filter((m) => m.id !== "estado");
