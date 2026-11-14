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
export type Modulo = { id: string; nombre: string; lema: string; nav: string; pestanas: Pestana[] };

export const MODULOS: Modulo[] = [
  {
    id: "conflictos",
    nombre: "Conflictos",
    lema: "Las guerras del planeta, minuto a minuto",
    nav: "/guerra-hoy",
    pestanas: [
      { href: "/guerra-hoy", label: "Hoy", img: "/ilustraciones/frentes.jpg", txt: "El resumen de todos los frentes abiertos hoy." },
      { href: "/en-vivo", label: "En vivo", vivo: true, img: "/ilustraciones/envivo.jpg", txt: "Cables reales entrando minuto a minuto, con hora y fuente." },
      { href: "/conflictos", label: "Tablero", img: "/ilustraciones/crisis.jpg", txt: "Las regiones en seguimiento con su intensidad medida." },
      { href: "/cronica", label: "Crónica del día", img: "/ilustraciones/briefing.jpg", txt: "Qué pasó de verdad en las últimas 24 horas, teatro por teatro." },
      { href: "/vertigo", label: "Vértigo", img: "/ilustraciones/foryou.jpg", txt: "El archivo en vivo, una pieza por deslizamiento." },
      { href: "/escenarios", label: "Escenarios", img: "/ilustraciones/predicciones.jpg", txt: "Escenarios de presión con supuestos a la vista; nunca predicciones." },
      { href: "/verdad-cruda", label: "Lo que no se dice", img: "/ilustraciones/verdades.jpg", txt: "Abusos documentados de las guerras, con su fuente." },
      { href: "/audios", label: "Radio de guerra", img: "/ilustraciones/canales.jpg", txt: "La guerra explicada en voz alta: el parte hablado." },
    ],
  },
  {
    id: "mapa",
    nombre: "Mapa 3D",
    lema: "El planeta en volumen",
    nav: "/mundo",
    pestanas: [
      { href: "/mundo", label: "Globo vivo", img: "/ilustraciones/mundo.jpg", txt: "El globo 3D con los teatros encendidos y sus cables." },
      { href: "/ver-guerra", label: "Frente en directo", img: "/ilustraciones/frente.jpg", txt: "El frente en directo: despachos reales y el parque militar." },
      { href: "/zona-cero", label: "Teatro global", img: "/ilustraciones/warsim.jpg", txt: "La mesa de guerra mundial con teatros y unidades." },
      { href: "/teatro-3d", label: "Arsenal 3D", img: "/ilustraciones/simulador.jpg", txt: "Uniformes, escuadrones y armas en 2D y 3D." },
      { href: "/vanguard2", label: "Universo 3D", img: "/ilustraciones/conquistas3d.jpg", txt: "Cada sección de la casa en su propio mundo 3D." },
    ],
  },
  {
    id: "analisis",
    nombre: "Inteligencia",
    lema: "El archivo que explica el mundo",
    nav: "/pulso-mundial",
    pestanas: [
      { href: "/pulso-mundial", label: "Pulso mundial", img: "/ilustraciones/pulso.jpg", txt: "Indicadores del Banco Mundial y la cronología del planeta." },
      { href: "/espia", label: "Modo espía", img: "/ilustraciones/espionaje.jpg", txt: "Lo que gobiernos y organizaciones publican, en un radar." },
      { href: "/atlas", label: "Atlas", img: "/ilustraciones/planeta.jpg", txt: "Las naciones, las personas y las rutas del poder." },
      { href: "/rostros", label: "Rostros del poder", img: "/ilustraciones/gobierno.jpg", txt: "Quién decide y quién ejecuta: las fichas del poder." },
      { href: "/servicios", label: "Servicios secretos", img: "/ilustraciones/agente.jpg", txt: "Las agencias de inteligencia del mundo, expediente a expediente." },
      { href: "/poder", label: "Poder militar", img: "/ilustraciones/estadisticas.jpg", txt: "El gasto militar real del planeta, país por país." },
      { href: "/armeria", label: "Armería", img: "/ilustraciones/armeria.jpg", txt: "Las armas que explican los conflictos de hoy." },
      { href: "/divisas", label: "Dinero", img: "/ilustraciones/divisas.jpg", txt: "Las monedas oficiales del planeta y quién las comparte." },
      { href: "/historia", label: "Historia", img: "/ilustraciones/historia.jpg", txt: "Las guerras que enseñaron a leer las de hoy." },
      { href: "/archivo-mundial", label: "Archivo", img: "/ilustraciones/curiosidades.jpg", txt: "Curiosidades verídicas, eras y los contadores de las guerras." },
      { href: "/oscura", label: "Biblioteca oscura", img: "/ilustraciones/oscura.jpg", txt: "Teorías y secretos con su veredicto y su documento." },
      { href: "/galeria", label: "Fototeca", img: "/ilustraciones/galeria.jpg", txt: "Fotografías reales del planeta y la videoteca." },
      { href: "/traductor", label: "Traductor", img: "/ilustraciones/osint.jpg", txt: "Las noticias del mundo en tu idioma." },
      { href: "/centinela", label: "Mi centinela", img: "/ilustraciones/centinela.jpg", txt: "Elige qué vigilar y la casa te avisa." },
      { href: "/voz", label: "La voz", img: "/ilustraciones/briefings.jpg", txt: "La voz que explica Vanguard y responde preguntas." },
      { href: "/musica", label: "Música", img: "/ilustraciones/studios.jpg", txt: "Música real de dominio público y la radio del conflicto." },
    ],
  },
  {
    id: "juego",
    nombre: "Juego",
    lema: "Misiones, logros y tu carnet",
    nav: "/cuartel",
    pestanas: [
      { href: "/cuartel", label: "Cuartel", img: "/ilustraciones/salas.jpg", txt: "El centro de mando del juego." },
      { href: "/objetivos", label: "Objetivos", img: "/ilustraciones/logros.jpg", txt: "Misiones, retos y torneos: lo que hay que hacer hoy." },
      { href: "/universo", label: "Colecciones", img: "/ilustraciones/recompensas.jpg", txt: "Créditos, colecciones y tu base personal." },
      { href: "/mision", label: "Misión 100", img: "/ilustraciones/recluta.jpg", txt: "Reparte Vanguard y suma reclutas." },
      { href: "/perfil", label: "Mi perfil", img: "/ilustraciones/perfil.jpg", txt: "Tu carnet de agente, tu código y tus permisos." },
      { href: "/modo", label: "Modo y cuenta", img: "/ilustraciones/registro.jpg", txt: "Elige cómo juegas y entra con tu alias." },
    ],
  },
  {
    id: "estado",
    nombre: "Estado de Vanguard",
    lema: "La casa por dentro, auditada",
    nav: "/estado",
    pestanas: [
      { href: "/estado", label: "Latido", img: "/ilustraciones/radar.jpg", txt: "El latido público: la casa responde en vivo." },
      { href: "/novedades", label: "Novedades", img: "/ilustraciones/notificaciones.jpg", txt: "Todo lo nuevo, con enlace directo." },
      { href: "/calidad", label: "Calidad", img: "/ilustraciones/evaluacion.jpg", txt: "La auditoría de la casa, con sus defectos abiertos." },
      { href: "/torre", label: "Torre de control", img: "/ilustraciones/operaciones.jpg", txt: "La salud real del arranque, noche a noche." },
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
  if (dentro(ruta, "/conflicto")) return MODULOS[0]; // fichas /conflicto/[tag]
  if (dentro(ruta, "/noticia")) return MODULOS[0];
  for (const m of MODULOS) if (m.pestanas.some((p) => dentro(ruta, p.href))) return m;
  return null;
}

/** salas internas: fuera del buscador y del sitemap */
export const SALAS_INTERNAS = ["/calidad", "/torre", "/catalogo", "/nucleo", "/escudo", "/novedades", "/mision"];
