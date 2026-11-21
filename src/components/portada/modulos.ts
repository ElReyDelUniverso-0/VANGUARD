// ═══════════════════════════════════════════════════════════════════
// v433.0 · SIETE MÓDULOS, UN SOLO UNIVERSO — mandato del Dueño:
//
//   «no es suficiente, necesita fusionar módulos similares; los del cuartel
//    necesita agregarlos a los principales, actualízalo todo y que el cuartel
//    no exista, porque todos los módulos comparten un solo universo».
//
// Antes había 14 módulos (13 públicos + Estado) con 94 pestañas y duplicados:
// Secretos y Arsenal eran lo mismo que Inteligencia; Mapa y Planeta, lo mismo
// que el terreno; Ciencia y Academia colgaban del conocimiento; el Juego
// escondía el expediente del operador.
//
// Ahora hay SIETE módulos, uno por división, y cada sala vive dentro del suyo.
// Ninguna sala se ha borrado: se ha movido a donde pertenece. `pestanas` sigue
// siendo la lista COMPLETA (la usan la portada del módulo, su vestíbulo y el
// sitemap); `destacadas` es lo único que se pinta en la barra del segundo menú,
// seis como mucho, para que ningún botón tape a otro.
// ═══════════════════════════════════════════════════════════════════

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
  /** lo único que pinta la barra del segundo menú (máx. 6) */
  destacadas: string[];
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
    id: "frente",
    nombre: "Frente",
    corto: "Frente",
    lema: "Qué está pasando ahora mismo, con la hora y la fuente de cada cable",
    nav: "/guerra-hoy",
    img: "/ilustraciones/frentes.jpg",
    gancho: "Frentes abiertos, cables entrando minuto a minuto y los datos que se mueven con ellos.",
    // fusión de: conflictos, datos
    destacadas: ["/guerra-hoy", "/en-vivo", "/conflictos", "/cronica", "/pulso-mundial", "/vertigo"],
    pestanas: [
      { href: "/guerra-hoy", label: "Hoy", img: "/ilustraciones/frentes.jpg", txt: "El resumen de todos los frentes abiertos hoy." },
      { href: "/en-vivo", label: "En vivo", vivo: true, img: "/ilustraciones/envivo.jpg", txt: "Cables reales entrando minuto a minuto, con hora y fuente." },
      { href: "/conflictos", label: "Tablero", img: "/ilustraciones/crisis.jpg", txt: "Las regiones en seguimiento con su intensidad medida." },
      { href: "/cronica", label: "Crónica del día", img: "/ilustraciones/briefing.jpg", txt: "Qué pasó de verdad en las últimas 24 horas, teatro por teatro." },
      { href: "/vertigo", label: "Vértigo", img: "/ilustraciones/foryou.jpg", txt: "El archivo en vivo, una pieza por deslizamiento." },
      { href: "/verdad-cruda", label: "Lo que no se dice", img: "/ilustraciones/verdades.jpg", txt: "Abusos documentados de las guerras, con su fuente." },
      { href: "/pulso-mundial", label: "Pulso mundial", img: "/ilustraciones/pulso.jpg", txt: "Indicadores del Banco Mundial y la cronología del planeta." },
      { href: "/infraestructura", label: "Atlas infraestructura", img: "/ilustraciones/pulso.jpg", txt: "Aeropuertos, puertos, puentes, presas, centrales y edificios emblemáticos: el catálogo mundial con sus nueve campos por obra." },
      { href: "/cruce", label: "El Cruce", vivo: true, img: "/ilustraciones/sismo.jpg", txt: "Lo que pasó hoy, medido a distancia de tu casa." },
      { href: "/herramientas", label: "Las diez llaves", img: "/ilustraciones/radar.jpg", txt: "Herramientas externas de vigilancia, abiertas dentro de la casa." },
      { href: "/centinela", label: "Mi centinela", img: "/ilustraciones/centinela.jpg", txt: "Elige qué vigilar y la casa te avisa." },
    ],
  },
  {
    id: "terreno",
    nombre: "Terreno",
    corto: "Terreno",
    lema: "Dónde pasa: el planeta, sus países y sus rostros",
    nav: "/mundo",
    img: "/ilustraciones/mundo.jpg",
    gancho: "El globo, el centro de mapas, los cinco mundos vivos y la ficha de cada país.",
    // fusión de: mapa, planeta
    destacadas: ["/mundo", "/mapas", "/mundos", "/worlds", "/zona-cero", "/comparador"],
    pestanas: [
      { href: "/mapas", label: "Centro de mapas", img: "/ilustraciones/planeta.jpg", txt: "Ocho capas geográficas sobre un solo globo: mundial, político, físico, económico, demográfico, temático, histórico y de acontecimientos." },
      { href: "/worlds", label: "Mundos vivos", img: "/ilustraciones/planeta.jpg", txt: "Cinco mundos explorables —América, Europa, África, Asia y Oceanía— con lugares reales y sus experiencias: ficha, atlas, obra, historia, datos y ciencia. Tres vistas, capas conmutables y alternativa 2D." },
      { href: "/mundo", label: "Globo vivo", img: "/ilustraciones/mundo.jpg", txt: "El globo 3D con los teatros encendidos y sus cables." },
      { href: "/ver-guerra", label: "Frente en directo", img: "/ilustraciones/frente.jpg", txt: "El frente en directo: despachos reales y el parque militar." },
      { href: "/zona-cero", label: "Zona Cero", img: "/ilustraciones/ojo-dios.jpg", txt: "El ojo de Vanguard: busca en toda la casa y pega lo que encuentres. Debajo, la mesa de guerra mundial." },
      { href: "/vanguard2", label: "Universo 3D", img: "/ilustraciones/conquistas3d.jpg", txt: "Cada sección de la casa en su propio mundo 3D." },
      { href: "/mundos", label: "Países", img: "/ilustraciones/mi-pais.jpg", txt: "El mapa de los mundos: la ficha de cada país con sus fronteras reales." },
      { href: "/comparador", label: "Comparador", img: "/ilustraciones/estadisticas.jpg", txt: "Hasta cuatro países cara a cara: población, economía, defensa y años de vida." },
      { href: "/rankings", label: "Rankings", img: "/ilustraciones/ranking.jpg", txt: "Ocho listas mundiales completas, con el año del dato de cada país." },
      { href: "/demografia", label: "Población", img: "/ilustraciones/edad.jpg", txt: "Cuántos somos, dónde nos concentramos y cuántos años vivimos." },
      { href: "/regiones", label: "Regiones", img: "/ilustraciones/planeta.jpg", txt: "Las 24 subregiones del mundo con su población y su economía sumadas." },
      { href: "/organizaciones", label: "Organizaciones", img: "/ilustraciones/alianzas.jpg", txt: "OTAN, UE, BRICS, OPEP, SICA y once bloques más: quién está y cuánto pesan." },
      { href: "/resiliencia/recursos/do", label: "Protección civil por país", img: "/ilustraciones/gobierno.jpg", txt: "Los organismos de cada país, lo que publican y sus números de emergencia escritos en texto." },
    ],
  },
  {
    id: "inteligencia",
    nombre: "Inteligencia",
    corto: "Inteligencia",
    lema: "Quién manda y con qué: potencias, servicios y arsenales",
    nav: "/informacion",
    img: "/ilustraciones/radar.jpg",
    gancho: "La consola maestra, los servicios secretos, la armería y el poder militar medido.",
    // fusión de: informacion, secretos, arsenal
    destacadas: ["/informacion", "/espia", "/servicios", "/armeria", "/poder", "/teatro-3d"],
    pestanas: [
      { href: "/informacion", label: "Consola Maestra", txt: "La consola táctica unificada con todos los frentes de inteligencia." },
      { href: "/espia", label: "Modo espía", img: "/ilustraciones/espionaje.jpg", txt: "Lo que gobiernos y organizaciones publican, en un radar." },
      { href: "/servicios", label: "Servicios secretos", img: "/ilustraciones/agente.jpg", txt: "Las agencias de inteligencia del mundo, expediente a expediente." },
      { href: "/oscura", label: "Biblioteca oscura", img: "/ilustraciones/oscura.jpg", txt: "Teorías y secretos con su veredicto y su documento." },
      { href: "/armeria", label: "Armería", img: "/ilustraciones/armeria.jpg", txt: "Las armas que explican los conflictos de hoy." },
      { href: "/poder", label: "Poder militar", img: "/ilustraciones/estadisticas.jpg", txt: "El gasto militar real del planeta, país por país." },
      { href: "/teatro-3d", label: "Arsenal 3D", img: "/ilustraciones/simulador.jpg", txt: "Uniformes, escuadrones y armas en 2D y 3D." },
      { href: "/escenarios", label: "Escenarios", img: "/ilustraciones/predicciones.jpg", txt: "Escenarios de presión con supuestos a la vista; nunca predicciones." },
    ],
  },
  {
    id: "conocimiento",
    nombre: "Conocimiento",
    corto: "Conocimiento",
    lema: "Por qué pasa: historia, lenguas, ciencia y escuela",
    nav: "/atlas",
    img: "/ilustraciones/planeta.jpg",
    gancho: "Atlas, enciclopedia, Lingua, investigación, ciencia de frontera y los cursos de la Academia.",
    // fusión de: conocimiento, ciencia, academia
    destacadas: ["/atlas", "/conocimiento", "/lingua", "/historia", "/ciencia", "/academia"],
    pestanas: [
      { href: "/conocimiento", label: "Conocimiento global", txt: "Nueve centros, treinta áreas, enciclopedia conectada e indicadores con fuentes y límites." },
      { href: "/conocimiento/enciclopedia", label: "Enciclopedia", txt: "Artículos de fondo sobre continentes, países, civilizaciones, ciencia y naturaleza, con fuentes y fecha de revisión." },
      { href: "/lingua", label: "Lingua", txt: "8.243 lenguas, sus familias, escrituras y alfabetos; diccionario, pronunciación real y traductor con la fuente a la vista." },
      { href: "/atlas", label: "Atlas", img: "/ilustraciones/planeta.jpg", txt: "Las naciones, las personas y las rutas del poder." },
      { href: "/investigacion", label: "Investigación", img: "/ilustraciones/radar.jpg", txt: "Dossiers sistémicos conectados: comprender, investigar, visualizar, comparar y simular." },
      { href: "/editorial", label: "Redacción", img: "/ilustraciones/biblioteca.jpg", txt: "Artículos con fuentes en diez áreas: geopolítica, historia, economía, conflictos y más." },
      { href: "/rostros", label: "Rostros del poder", img: "/ilustraciones/gobierno.jpg", txt: "Quién decide y quién ejecuta: las fichas del poder." },
      { href: "/divisas", label: "Dinero", img: "/ilustraciones/divisas.jpg", txt: "Las monedas oficiales del planeta y quién las comparte." },
      { href: "/historia", label: "Historia", img: "/ilustraciones/historia.jpg", txt: "Las guerras que enseñaron a leer las de hoy." },
      { href: "/archivo-mundial", label: "Archivo", img: "/ilustraciones/curiosidades.jpg", txt: "Curiosidades verídicas, eras y los contadores de las guerras." },
      { href: "/traductor", label: "Traductor", img: "/ilustraciones/osint.jpg", txt: "Las noticias del mundo en tu idioma." },
      { href: "/resiliencia", label: "Resiliencia civil", img: "/ilustraciones/radar.jpg", txt: "Quince secciones para preparar a una comunidad: guías por emergencia, fichas de peligros, continuidad familiar, accesibilidad y recuperación." },
      { href: "/resiliencia/evaluacion", label: "Evaluación comunitaria", txt: "Veinticuatro preguntas, seis categorías y un resultado orientativo que se queda en tu navegador." },
      { href: "/ciencia", label: "Centro", img: "/ilustraciones/enciclopedia.jpg", txt: "Buscador, cifras y la taxonomía editorial del centro." },
      { href: "/ciencia/explorador", label: "Explorador", img: "/ilustraciones/radar.jpg", txt: "Elige una idea y recorre sus pasos: qué añadió cada publicación y qué no demuestra." },
      { href: "/ciencia/buscar", label: "Publicaciones", img: "/ilustraciones/biblioteca.jpg", txt: "Filtros por disciplina, tipo editorial, nivel de evidencia y fecha." },
      { href: "/ciencia/cronologia", label: "Cronología", txt: "Publicaciones, premios e hitos en el orden en que ocurrieron." },
      { href: "/ciencia/instituciones", label: "Instituciones", txt: "Laboratorios y centros con su URL comprobada y su vínculo documentado." },
      { href: "/ciencia/premios", label: "Premios", txt: "Motivación oficial literal y su traducción de trabajo." },
      { href: "/ciencia/experimentos", label: "Experimentos", txt: "El montaje, el resultado y el límite de cada método." },
      { href: "/ciencia/tecnologia", label: "Tecnología", txt: "La herramienta detrás del hallazgo, con su madurez real." },
      { href: "/ciencia/biblioteca", label: "Biblioteca", img: "/ilustraciones/biblioteca.jpg", txt: "Estanterías curadas, índice completo y tu estantería." },
      { href: "/ciencia/metodo", label: "Método", txt: "Qué se capturó, de dónde y cómo se reproduce." },
      { href: "/academia", label: "Portal", txt: "Visión general, progreso y catálogo interactivo." },
      { href: "/academia/cursos", label: "Cursos", txt: "Los 10 cursos nucleares de análisis y geopolítica." },
      { href: "/academia/rutas", label: "Rutas", txt: "Trayectorias de especialización profesional guiadas." },
      { href: "/academia/ejercicios", label: "Ejercicios", txt: "Casos prácticos de lectura de cables y mapas." },
      { href: "/academia/certificados", label: "Certificados", txt: "Validación criptográfica SHA-256 de diplomas." },
      { href: "/academia/glosario", label: "Glosario", txt: "Términos doctrinales, militares y de OSINT." },
      { href: "/academia/historial", label: "Historial", txt: "Tus intentos, calificaciones y tiempo dedicado." },
      { href: "/cuaderno", label: "El Cuaderno", txt: "Tu anotador: escribir, señalar, unir con hilos y verlo en un mapa 3D." },
    ],
  },
  {
    id: "metodo",
    nombre: "Método",
    corto: "Método",
    lema: "Cómo se mide: los motores con los que la casa calcula",
    nav: "/motores",
    img: "/ilustraciones/radar.jpg",
    gancho: "Censo, Lanchester, DBSCAN, curva de rendimiento, disuasión y escalada: las cuentas a la vista.",
    // fusión de: motores
    destacadas: ["/motores", "/motores/lanchester", "/motores/dbscan", "/motores/censo", "/cruce", "/centinela"],
    pestanas: [
      { href: "/motores", label: "Laboratorio", txt: "Simulador interactivo y visor del censo de plataformas." },
      { href: "/motores/censo", label: "Censo 100", txt: "Directorio de 100 plataformas clasificadas en 8 dimensiones." },
      { href: "/motores/lanchester", label: "Lanchester", txt: "Leyes diferenciales de atrición y combate a distancia." },
      { href: "/motores/dbscan", label: "DBSCAN", txt: "Agrupador espacial geodésico para frentes cinéticos." },
      { href: "/motores/curva-rendimiento", label: "Nelson-Siegel", txt: "Curvas de rendimiento y tipos soberanos." },
      { href: "/motores/disuasion", label: "Disuasión", txt: "Dinámica Lotka-Volterra de equilibrios armamentistas." },
    ],
  },
  {
    id: "archivo",
    nombre: "Archivo y voz",
    corto: "Archivo",
    lema: "Lo que la casa ya contó: fototeca, radio, música y voz",
    nav: "/galeria",
    img: "/ilustraciones/biblioteca.jpg",
    gancho: "La fototeca, la radio de guerra, la emisora, la música y la voz de la casa.",
    // fusión de: medios
    destacadas: ["/galeria", "/radio", "/audios", "/musica", "/voz"],
    pestanas: [
      { href: "/galeria", label: "Fototeca", img: "/ilustraciones/galeria.jpg", txt: "Fotografías reales del planeta y la videoteca." },
      { href: "/audios", label: "Radio de guerra", img: "/ilustraciones/canales.jpg", txt: "La guerra explicada en voz alta: el parte hablado." },
      { href: "/musica", label: "Música", img: "/ilustraciones/studios.jpg", txt: "Música real de dominio público y la radio del conflicto." },
      { href: "/voz", label: "La voz", img: "/ilustraciones/briefings.jpg", txt: "La voz que explica Vanguard y responde preguntas." },
      { href: "/radio", label: "Radio", vivo: true, txt: "La emisora de la casa: lo que está sonando ahora mismo." },
    ],
  },
  {
    id: "casa",
    nombre: "La casa",
    corto: "La casa",
    lema: "Tu expediente y el estado del sistema",
    nav: "/mi-universo",
    img: "/ilustraciones/gobierno.jpg",
    gancho: "Mi universo, tu perfil, la misión, los objetivos, las colecciones, la Forja y el latido del sistema.",
    // fusión de: juego, estado
    destacadas: ["/mi-universo", "/perfil", "/mision", "/objetivos", "/universo", "/estado"],
    pestanas: [
      { href: "/cuartel", label: "Cuartel", img: "/ilustraciones/salas.jpg", txt: "El centro de mando del juego." },
      { href: "/objetivos", label: "Objetivos", img: "/ilustraciones/logros.jpg", txt: "Misiones, retos y torneos: lo que hay que hacer hoy." },
      { href: "/universo", label: "Colecciones", img: "/ilustraciones/recompensas.jpg", txt: "Créditos, colecciones y tu base personal." },
      { href: "/creadores", label: "La Forja", img: "/ilustraciones/creador.jpg", txt: "Publica mapas, escenarios, investigaciones, simulaciones y proyectos con tu nombre." },
      { href: "/mision", label: "Misión 100", img: "/ilustraciones/recluta.jpg", txt: "Reparte Vanguard y suma reclutas." },
      { href: "/perfil", label: "Mi perfil", img: "/ilustraciones/perfil.jpg", txt: "Tu carnet de agente, tu código y tus permisos." },
      { href: "/modo", label: "Modo y cuenta", img: "/ilustraciones/registro.jpg", txt: "Elige cómo juegas y entra con tu alias." },
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

// ── recuperados tal cual del registro anterior (mi reemplazo se los había
//    comido: sin `moduloDe` la cabecera y la carcasa no compilan) ──
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
export const SALAS_INTERNAS = ["/calidad", "/torre", "/catalogo", "/nucleo", "/escudo", "/novedades", "/mision", "/navegacion"];

/** la portada propia de cada módulo */
export const portadaDe = (m: Modulo) => `/modulo/${m.id}`;

/** a dónde lleva la cabecera: los módulos con sala-vestíbulo propia entran
 *  directo a ella; los nuevos entran por su portada */
const CON_VESTIBULO = ["frente", "terreno", "inteligencia", "conocimiento", "metodo", "archivo", "casa"];
export const entradaDe = (m: Modulo) => (CON_VESTIBULO.includes(m.id) ? m.nav : portadaDe(m));

/** los módulos que se enseñan al público (el Estado vive aparte, al pie) */
export const MODULOS_PUBLICOS = MODULOS.filter((m) => m.id !== "estado");

