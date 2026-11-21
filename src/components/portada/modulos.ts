// ═══════════════════════════════════════════════════════════════════
// v436.0 · CUATRO MÓDULOS, UN SOLO UNIVERSO — mandato del Dueño:
//
//   «tiene que hacer los módulos, actualízalos y fusionar algunos módulos
//    similares o que son compatibles para que ver informaciones más
//    completas: fusiona todos los similares, todo ya compatible».
//
// De siete a cuatro. La regla que se aplicó no es «juntar lo que suena
// parecido», es el contenido REAL de cada sala:
//
//   · Frente + Archivo → LA REDACCIÓN. Un módulo era «qué pasa ahora» y el
//     otro «cómo lo contó la casa»: cables, crónica, radio, música, voz y
//     fotografía salen del mismo archivo. Ahora el parte y el locutor viven
//     en la misma habitación.
//   · Terreno + Inteligencia → EL MUNDO. «Dónde pasa» y «quién manda ahí»
//     son dos mitades del mismo objeto; además entran /atlas, /rostros y
//     /divisas, que estaban en Conocimiento sin ser conocimiento.
//   · Conocimiento + Método → EL SABER. El texto que explica y la fórmula
//     que lo mide, juntos: enciclopedia, lenguas, ciencia, academia, motores
//     y los simuladores («¿qué pasaría si…?»), que también se calculan.
//   · La casa queda sola: tu expediente, el latido del sistema y el índice
//     de las salas. Aquí no hay noticias.
//
// NINGUNA SALA SE HA PERDIDO: las 91 fichas que había están las 95 de ahora
// (91 + /tierra, /datos-mundiales, /orden y /config, que vivían fuera del
// censo de módulos). `pestanas` sigue siendo la lista COMPLETA (portada del
// módulo, vestíbulo y sitemap); `destacadas` es lo único que pinta la barra
// del segundo menú, seis como mucho, para que ningún botón tape a otro.
// ═══════════════════════════════════════════════════════════════════

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

export const MODULOS: Modulo[] = [
  {
    id: "redaccion",
    nombre: "La redacción",
    corto: "Redacción",
    lema: "Qué está pasando ahora y cómo lo cuenta la casa: cables, crónica, radio, foto y voz",
    nav: "/guerra-hoy",
    img: "/imagenes-reales/portaaviones.jpg",
    gancho: "Los frentes abiertos minuto a minuto y el mismo material contado en texto, en voz y en fotografía real. Antes eran dos módulos (Frente y Archivo) y el lector tenía que adivinar dónde estaba el parte y dónde el locutor.",
    destacadas: ["/guerra-hoy", "/en-vivo", "/conflictos", "/cronica", "/radio", "/galeria"],
    pestanas: [
            { href: "/guerra-hoy", label: "Hoy", img: "/imagenes-reales/portaaviones.jpg", txt: "El resumen de todos los frentes abiertos hoy." },
            { href: "/en-vivo", label: "En vivo", vivo: true, img: "/imagenes-reales/satelite.jpg", txt: "Cables reales entrando minuto a minuto, con hora y fuente." },
            { href: "/conflictos", label: "Tablero", img: "/imagenes-reales/nuclear.jpg", txt: "Las regiones en seguimiento con su intensidad medida." },
            { href: "/cronica", label: "Crónica del día", img: "/imagenes-reales/suez.jpg", txt: "Qué pasó de verdad en las últimas 24 horas, teatro por teatro." },
            { href: "/vertigo", label: "Vértigo", img: "/imagenes-reales/control.jpg", txt: "El archivo en vivo, una pieza por deslizamiento." },
            { href: "/verdad-cruda", label: "Lo que no se dice", img: "/imagenes-reales/chernobyl.jpg", txt: "Abusos documentados de las guerras, con su fuente." },
            { href: "/cruce", label: "El Cruce", vivo: true, img: "/imagenes-reales/suez.jpg", txt: "Lo que pasó hoy, medido a distancia de tu casa." },
            { href: "/centinela", label: "Mi centinela", img: "/imagenes-reales/satelite.jpg", txt: "Elige qué vigilar y la casa te avisa." },
            { href: "/herramientas", label: "Las diez llaves", img: "/assets/real/radar-1.jpg", txt: "Herramientas externas de vigilancia, abiertas dentro de la casa." },
            { href: "/galeria", label: "Fototeca", img: "/imagenes-reales/tokio.jpg", txt: "Fotografías reales del planeta y la videoteca." },
            { href: "/audios", label: "Radio de guerra", img: "/imagenes-reales/control.jpg", txt: "La guerra explicada en voz alta: el parte hablado." },
            { href: "/musica", label: "Música", img: "/imagenes-reales/dubai.jpg", txt: "Música real de dominio público y la radio del conflicto." },
            { href: "/voz", label: "La voz", img: "/imagenes-reales/control.jpg", txt: "La voz que explica Vanguard y responde preguntas." },
            { href: "/radio", label: "Radio", vivo: true, txt: "La emisora de la casa: lo que está sonando ahora mismo." },
            { href: "/archivo-mundial", label: "Archivo", img: "/imagenes-reales/rapanui.jpg", txt: "Curiosidades verídicas, eras y los contadores de las guerras." },
            { href: "/resiliencia", label: "Resiliencia civil", img: "/assets/real/radar-1.jpg", txt: "Quince secciones para preparar a una comunidad: guías por emergencia, fichas de peligros, continuidad familiar, accesibilidad y recuperación." },
            { href: "/resiliencia/evaluacion", label: "Evaluación comunitaria", txt: "Veinticuatro preguntas, seis categorías y un resultado orientativo que se queda en tu navegador." },
    ],
  },
  {
    id: "mundo",
    nombre: "El mundo",
    corto: "Mundo",
    lema: "Dónde pasa y quién manda ahí: el planeta, sus países, sus datos y su poder",
    nav: "/mundos",
    img: "/imagenes-reales/satelite.jpg",
    gancho: "El mapa, el atlas, los 200 países con sus medidas, las potencias con su arsenal y los rostros que firman las decisiones. Antes eran dos módulos (Terreno e Inteligencia) que se miraban de espaldas.",
    destacadas: ["/mundos", "/mapas", "/mundo", "/informacion", "/rostros", "/tierra"],
    pestanas: [
            { href: "/mundos", label: "Países", img: "/imagenes-reales/arco.jpg", txt: "El mapa de los mundos: la ficha de cada país con sus fronteras reales." },
            { href: "/mundo", label: "Globo vivo", img: "/imagenes-reales/satelite.jpg", txt: "El globo 3D con los teatros encendidos y sus cables." },
            { href: "/mapas", label: "Centro de mapas", img: "/imagenes-reales/satelite.jpg", txt: "Ocho capas geográficas sobre un solo globo: mundial, político, físico, económico, demográfico, temático, histórico y de acontecimientos." },
            { href: "/worlds", label: "Mundos vivos", img: "/imagenes-reales/satelite.jpg", txt: "Cinco mundos explorables —América, Europa, África, Asia y Oceanía— con lugares reales y sus experiencias: ficha, atlas, obra, historia, datos y ciencia. Tres vistas, capas conmutables y alternativa 2D." },
            { href: "/comparador", label: "Comparador", img: "/imagenes-reales/losangeles.jpg", txt: "Hasta cuatro países cara a cara: población, economía, defensa y años de vida." },
            { href: "/rankings", label: "Rankings", img: "/imagenes-reales/losangeles.jpg", txt: "Ocho listas mundiales completas, con el año del dato de cada país." },
            { href: "/demografia", label: "Población", img: "/imagenes-reales/nairobi.jpg", txt: "Cuántos somos, dónde nos concentramos y cuántos años vivimos." },
            { href: "/regiones", label: "Regiones", img: "/imagenes-reales/satelite.jpg", txt: "Las 24 subregiones del mundo con su población y su economía sumadas." },
            { href: "/organizaciones", label: "Organizaciones", img: "/imagenes-reales/onu.jpg", txt: "OTAN, UE, BRICS, OPEP, SICA y once bloques más: quién está y cuánto pesan." },
            { href: "/resiliencia/recursos/do", label: "Protección civil por país", img: "/imagenes-reales/kremlin.jpg", txt: "Los organismos de cada país, lo que publican y sus números de emergencia escritos en texto." },
            { href: "/atlas", label: "Atlas", img: "/imagenes-reales/satelite.jpg", txt: "Las naciones, las personas y las rutas del poder." },
            { href: "/rostros", label: "Rostros del poder", img: "/imagenes-reales/kremlin.jpg", txt: "Quién decide y quién ejecuta: las fichas del poder." },
            { href: "/divisas", label: "Dinero", img: "/imagenes-reales/shanghai.jpg", txt: "Las monedas oficiales del planeta y quién las comparte." },
            { href: "/informacion", label: "Consola Maestra", txt: "La consola táctica unificada con todos los frentes de inteligencia." },
            { href: "/espia", label: "Modo espía", img: "/imagenes-reales/cia.jpg", txt: "Lo que gobiernos y organizaciones publican, en un radar." },
            { href: "/servicios", label: "Servicios secretos", img: "/imagenes-reales/kremlin.jpg", txt: "Las agencias de inteligencia del mundo, expediente a expediente." },
            { href: "/oscura", label: "Biblioteca oscura", img: "/imagenes-reales/area51.jpg", txt: "Teorías y secretos con su veredicto y su documento." },
            { href: "/poder", label: "Poder militar", img: "/imagenes-reales/losangeles.jpg", txt: "El gasto militar real del planeta, país por país." },
      { href: "/tierra", label: "Earth System", img: "/imagenes-reales/satelite.jpg", txt: "El planeta capa por capa: relieve, ríos, regiones y el atlas 2D del mismo dato." },
      { href: "/datos-mundiales", label: "Datos del mundo", img: "/imagenes-reales/dubai.jpg", txt: "52 indicadores de 200 países, cada uno con su fuente y su año." },
            { href: "/pulso-mundial", label: "Pulso mundial", img: "/imagenes-reales/satelite.jpg", txt: "Indicadores del Banco Mundial y la cronología del planeta." },
            { href: "/infraestructura", label: "Atlas infraestructura", img: "/imagenes-reales/satelite.jpg", txt: "Aeropuertos, puertos, puentes, presas, centrales y edificios emblemáticos: el catálogo mundial con sus nueve campos por obra." },
    ],
  },
  {
    id: "saber",
    nombre: "El saber",
    corto: "Saber",
    lema: "Por qué pasa y con qué se mide: historia, lenguas, ciencia, academia y motores",
    nav: "/conocimiento",
    img: "/imagenes-reales/kremlin.jpg",
    gancho: "La enciclopedia, las ocho mil lenguas, el índice científico, los cursos y los simuladores que ponen a prueba lo aprendido. Antes eran dos módulos (Conocimiento y Método) y la fórmula vivía lejos del texto que la explicaba.",
    destacadas: ["/conocimiento", "/ciencia", "/lingua", "/motores", "/teatro-3d", "/historia"],
    pestanas: [
            { href: "/conocimiento", label: "Conocimiento global", txt: "Nueve centros, treinta áreas, enciclopedia conectada e indicadores con fuentes y límites." },
            { href: "/conocimiento/enciclopedia", label: "Enciclopedia", txt: "Artículos de fondo sobre continentes, países, civilizaciones, ciencia y naturaleza, con fuentes y fecha de revisión." },
            { href: "/lingua", label: "Lingua", txt: "8.243 lenguas, sus familias, escrituras y alfabetos; diccionario, pronunciación real y traductor con la fuente a la vista." },
            { href: "/investigacion", label: "Investigación", img: "/assets/real/radar-1.jpg", txt: "Dossiers sistémicos conectados: comprender, investigar, visualizar, comparar y simular." },
            { href: "/editorial", label: "Redacción", img: "/imagenes-reales/arco.jpg", txt: "Artículos con fuentes en diez áreas: geopolítica, historia, economía, conflictos y más." },
            { href: "/historia", label: "Historia", img: "/imagenes-reales/muroberlin.jpg", txt: "Las guerras que enseñaron a leer las de hoy." },
            { href: "/traductor", label: "Traductor", img: "/imagenes-reales/estambul.jpg", txt: "Las noticias del mundo en tu idioma." },
            { href: "/ciencia", label: "Centro", img: "/imagenes-reales/sumeria.jpg", txt: "Buscador, cifras y la taxonomía editorial del centro." },
            { href: "/ciencia/explorador", label: "Explorador", img: "/assets/real/radar-1.jpg", txt: "Elige una idea y recorre sus pasos: qué añadió cada publicación y qué no demuestra." },
            { href: "/ciencia/buscar", label: "Publicaciones", img: "/imagenes-reales/arco.jpg", txt: "Filtros por disciplina, tipo editorial, nivel de evidencia y fecha." },
            { href: "/ciencia/cronologia", label: "Cronología", txt: "Publicaciones, premios e hitos en el orden en que ocurrieron." },
            { href: "/ciencia/instituciones", label: "Instituciones", txt: "Laboratorios y centros con su URL comprobada y su vínculo documentado." },
            { href: "/ciencia/premios", label: "Premios", txt: "Motivación oficial literal y su traducción de trabajo." },
            { href: "/motores", label: "Laboratorio", txt: "Simulador interactivo y visor del censo de plataformas." },
            { href: "/motores/censo", label: "Censo 100", txt: "Directorio de 100 plataformas clasificadas en 8 dimensiones." },
            { href: "/motores/lanchester", label: "Lanchester", txt: "Leyes diferenciales de atrición y combate a distancia." },
            { href: "/motores/dbscan", label: "DBSCAN", txt: "Agrupador espacial geodésico para frentes cinéticos." },
            { href: "/motores/curva-rendimiento", label: "Nelson-Siegel", txt: "Curvas de rendimiento y tipos soberanos." },
            { href: "/motores/disuasion", label: "Disuasión", txt: "Dinámica Lotka-Volterra de equilibrios armamentistas." },
            { href: "/teatro-3d", label: "Arsenal 3D", img: "/assets/real/jet-1.jpg", txt: "Uniformes, escuadrones y armas en 2D y 3D." },
            { href: "/ver-guerra", label: "Frente en directo", img: "/imagenes-reales/portaaviones.jpg", txt: "El frente en directo: despachos reales y el parque militar." },
            { href: "/zona-cero", label: "Zona Cero", img: "/imagenes-reales/area51.jpg", txt: "El ojo de Vanguard: busca en toda la casa y pega lo que encuentres. Debajo, la mesa de guerra mundial." },
            { href: "/escenarios", label: "Escenarios", img: "/imagenes-reales/suez.jpg", txt: "Escenarios de presión con supuestos a la vista; nunca predicciones." },
            { href: "/armeria", label: "Armería", img: "/assets/real/missile-1.jpg", txt: "Las armas que explican los conflictos de hoy." },
            { href: "/ciencia/experimentos", label: "Experimentos", txt: "El montaje, el resultado y el límite de cada método." },
            { href: "/ciencia/tecnologia", label: "Tecnología", txt: "La herramienta detrás del hallazgo, con su madurez real." },
            { href: "/ciencia/biblioteca", label: "Biblioteca", img: "/imagenes-reales/arco.jpg", txt: "Estanterías curadas, índice completo y tu estantería." },
            { href: "/ciencia/metodo", label: "Método", txt: "Qué se capturó, de dónde y cómo se reproduce." },
            { href: "/academia", label: "Portal", txt: "Visión general, progreso y catálogo interactivo." },
            { href: "/academia/cursos", label: "Cursos", txt: "Los 10 cursos nucleares de análisis y geopolítica." },
            { href: "/academia/rutas", label: "Rutas", txt: "Trayectorias de especialización profesional guiadas." },
            { href: "/academia/ejercicios", label: "Ejercicios", txt: "Casos prácticos de lectura de cables y mapas." },
            { href: "/academia/certificados", label: "Certificados", txt: "Validación criptográfica SHA-256 de diplomas." },
            { href: "/academia/glosario", label: "Glosario", txt: "Términos doctrinales, militares y de OSINT." },
            { href: "/academia/historial", label: "Historial", txt: "Tus intentos, calificaciones y tiempo dedicado." },
    ],
  },
  {
    id: "casa",
    nombre: "La casa",
    corto: "Casa",
    lema: "Tu expediente, la salud del sistema y el índice de todas las salas",
    nav: "/mi-universo",
    img: "/imagenes-reales/pentagono.jpg",
    gancho: "Tu perfil, tu memoria de aparato, las misiones vividas, lo que mide el latido y el orden de batalla con las 156 salas. Aquí no hay noticias: aquí está lo tuyo y el estado de la máquina.",
    destacadas: ["/mi-universo", "/perfil", "/estado", "/objetivos", "/creadores", "/orden"],
    pestanas: [
            { href: "/mi-universo", label: "Mi universo", img: "/imagenes-reales/satelite.jpg", txt: "Tus puertas repartidas en grupos, con tu memoria de aparato: lo que ya viste, lo que marcaste y lo que aprendió de ti." },
            { href: "/objetivos", label: "Objetivos", img: "/imagenes-reales/pentagono.jpg", txt: "Misiones, retos y torneos: lo que hay que hacer hoy." },
            { href: "/universo", label: "Colecciones", img: "/imagenes-reales/dubai.jpg", txt: "Créditos, colecciones y tu base personal." },
            { href: "/creadores", label: "La Forja", img: "/imagenes-reales/control.jpg", txt: "Publica mapas, escenarios, investigaciones, simulaciones y proyectos con tu nombre." },
            { href: "/mision", label: "Misión 100", img: "/imagenes-reales/pentagono.jpg", txt: "Reparte Vanguard y suma reclutas." },
            { href: "/perfil", label: "Mi perfil", img: "/imagenes-reales/control.jpg", txt: "Tu carnet de agente, tu código y tus permisos." },
            { href: "/modo", label: "Modo y cuenta", img: "/imagenes-reales/control.jpg", txt: "Elige cómo juegas y entra con tu alias." },
            { href: "/estado", label: "Latido", img: "/assets/real/radar-1.jpg", txt: "El latido público: la casa responde en vivo." },
            { href: "/novedades", label: "Novedades", img: "/imagenes-reales/control.jpg", txt: "Todo lo nuevo, con enlace directo." },
            { href: "/calidad", label: "Calidad", img: "/imagenes-reales/panama.jpg", txt: "La auditoría de la casa, con sus defectos abiertos." },
            { href: "/torre", label: "Torre de control", img: "/imagenes-reales/control.jpg", txt: "La salud real del arranque, noche a noche." },
            { href: "/directorio", label: "Directorio", img: "/imagenes-reales/sumeria.jpg", txt: "Todas las puertas de la casa, buscables, con tus favoritos y tus recientes." },
            { href: "/colecciones", label: "Colecciones", img: "/imagenes-reales/pentagono.jpg", txt: "Recorridos guiados por temas: de la pregunta a las salas que la responden." },
            { href: "/catalogo", label: "Catálogo", img: "/imagenes-reales/sumeria.jpg", txt: "El índice de lo que ya existe en Vanguard." },
            { href: "/nucleo", label: "Núcleo", img: "/imagenes-reales/control.jpg", txt: "El censo de módulos y la búsqueda global." },
            { href: "/escudo", label: "Escudo", img: "/imagenes-reales/gps.jpg", txt: "El buscador de llaves: que ningún secreto se publique." },
            { href: "/privacidad", label: "Privacidad", img: "/imagenes-reales/control.jpg", txt: "Qué datos se guardan y cuáles no." },
      { href: "/orden", label: "El orden de batalla", img: "/imagenes-reales/control.jpg", txt: "Todas las salas de la casa con su código, en un solo cuerpo." },
      { href: "/config", label: "Ajustes", img: "/imagenes-reales/control.jpg", txt: "Pantalla grande o pequeña, modo ligero, densidad, letra y fondo: se guarda en tu aparato." },
            { href: "/vanguard2", label: "Universo 3D", img: "/imagenes-reales/dubai.jpg", txt: "Cada sección de la casa en su propio mundo 3D." },
            { href: "/cuaderno", label: "El Cuaderno", txt: "Tu anotador: escribir, señalar, unir con hilos y verlo en un mapa 3D." },
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
const CON_VESTIBULO = ["redaccion", "mundo", "saber", "casa"];
export const entradaDe = (m: Modulo) => (CON_VESTIBULO.includes(m.id) ? m.nav : portadaDe(m));

/** los módulos que se enseñan al público (el Estado vive aparte, al pie) */
export const MODULOS_PUBLICOS = MODULOS.filter((m) => m.id !== "estado");

