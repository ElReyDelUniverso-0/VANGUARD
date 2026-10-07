// v73.0 REGLA DE ORO — config central para TODA sección de Vanguard.
// La regla del comandante: 1) título GRANDE llamativo → 2) ilustración hermosa
// → 3) texto rápido y fácil de leer. Cada sección con su acento vibrante único.
// Los componentes leen de aquí (hero-oro.tsx); añadir una sección = añadir una entrada.

export interface ReglaOroEntry {
  /** Título grande y llamativo */
  titulo: string;
  /** Línea pequeña encima del título */
  volanta: string;
  /** Ilustración hero (public/ilustraciones) */
  imagen: string;
  /** Texto fácil de leer debajo de la ilustración */
  texto: string;
  /** Color vibrante ÚNICO de la sección (hex) */
  acento: string;
  /** Altura de la ilustración en px (default 230) */
  altura?: number;
}

export const REGLA_ORO = {
  noticias: {
    titulo: "Noticias Globales",
    volanta: "El mundo en tiempo real",
    imagen: "/ilustraciones/noticias.jpg",
    texto:
      "Titulares verificados de todo el planeta, con credibilidad por fuente. Lee, vota si es REAL o FAKE y sube tu IQ de analista.",
    acento: "#FFB020",
  },
  mapa: {
    titulo: "Mapa Mundial",
    volanta: "Cada frontera bajo la luna",
    imagen: "/ilustraciones/mapa.jpg",
    texto:
      "El planeta entero en una sola vista: conflictos, sismos y movimientos en vivo. Toca cualquier zona para ver qué pasa ahora mismo.",
    acento: "#FFC94D",
  },
  // v81.0 MAPAS DE GUERRA — la sala donde se decide la guerra
  operaciones: {
    titulo: "SALA DE OPERACIONES",
    volanta: "El tablero donde se decide la guerra",
    imagen: "/ilustraciones/operaciones.jpg",
    texto:
      "Cuatro misiones militares esperan tu orden: pulsa EJECUTAR y mira los jets cruzar el tablero, las fases avanzar y el misil volar. Cuando el objetivo cae, cobras.",
    acento: "#FF4D00",
  },
  // v82.0 TODO EL MUNDO — el dinero del guerrero, con techo y con bóveda
  hacienda: {
    titulo: "BANCO CENTRAL",
    volanta: "Tu dinero ahora trabaja contigo",
    imagen: "/ilustraciones/banco.jpg",
    texto:
      "Sueldo de operativo que acumula cada minuto, bóvedas con interés al 9-30%, tesorería de verdad y bonos por información certificada. La información es dinero — y aquí se cobra.",
    acento: "#F7C948",
  },
  misiones: {
    titulo: "Misiones",
    volanta: "Tu camino de comandante",
    imagen: "/ilustraciones/misiones.jpg",
    texto:
      "Objetivos diarios que pagan monedas, gemas y XP. Completa, cobra y escala en el ranking sin salir de aquí.",
    acento: "#FF3B30",
  },
  briefing: {
    titulo: "Briefing Diario",
    volanta: "Primera luz, primera intel",
    imagen: "/ilustraciones/briefing.jpg",
    texto:
      "Cada día el mundo cambia. Aquí tienes el resumen: qué mirar, dónde apuntar y qué se te está escapando.",
    acento: "#FFD27A",
  },
  osint: {
    titulo: "Sala OSINT",
    volanta: "15 capas de inteligencia",
    imagen: "/ilustraciones/osint.jpg",
    texto:
      "Satélites, radar, fotos y señales abiertas. Todo lo que ve un analista profesional — ahora al alcance de tu dedo.",
    acento: "#1E90FF",
  },
  mundo: {
    titulo: "Mundo de Guerra",
    volanta: "La partida grande",
    imagen: "/ilustraciones/mundo.jpg",
    texto:
      "Conquista territorios, defiende los tuyos y decide el destino del mapa. Cada movimiento cambia la guerra.",
    acento: "#FF5A3C",
  },
  multijugador: {
    titulo: "Multijugador",
    volanta: "Otros guerreros, tu nivel",
    imagen: "/ilustraciones/multijugador.jpg",
    texto:
      "Guerra global, duelos 1v1, ranking ELO y ahora DESAFÍOS POR CÓDIGO: reta a cualquiera sin importar su horario — ambos jugáis la misma semilla y el bote espera al mejor.",
    acento: "#FF7A45",
  },
  arcade: {
    titulo: "Arcade Pack",
    volanta: "Joyas retro de guerra",
    imagen: "/ilustraciones/arcade.jpg",
    texto:
      "12 minijuegos con récords que defender: sobrevive al CONVOY BAJO FUEGO bajo luna llena, rompe el CIFRADO SIMON y persigue el JUEGO DEL DÍA, que paga doble. Y ojo: cada recompensa puede traer el GOLPE DE FORTUNA (×2, ×3 o ×5) — con tensión global alta, todos los pagos llevan PRIMA DE GUERRA +15%.",
    acento: "#FF9F1C",
  },
  bookmaker: {
    titulo: "BetNación",
    volanta: "La casa de apuestas",
    imagen: "/ilustraciones/bookmaker.jpg",
    texto:
      "Apuesta monedas por eventos reales del mundo: cuotas vivas, mercados de GUERRA con la tensión real del planeta y JACKPOT progresivo que engorda con cada boleto. La primera apuesta del día la paga la casa — y las combinadas de 3+ aciertos suman bonus hasta +12%.",
    acento: "#00FF87",
  },
  espionaje: {
    titulo: "Red de Espionaje",
    volanta: "Sombras que reportan",
    imagen: "/ilustraciones/espionaje.jpg",
    texto:
      "Recluta espías, envíalos tras la pista y recibe informes que nadie más tiene. El silencio también dispara.",
    acento: "#9B5CFF",
  },
  biblioteca: {
    titulo: "Biblioteca Secreta",
    volanta: "Páginas que nadie debía leer",
    imagen: "/ilustraciones/biblioteca.jpg",
    texto:
      "Documentos, historias y saberes guardados bajo llave. Abre un libro y descubre por qué era secreto.",
    acento: "#FFB84D",
  },
  foryou: {
    titulo: "Para Ti",
    volanta: "El feed de la comunidad",
    imagen: "/ilustraciones/foryou.jpg",
    texto:
      "Lo mejor que crea la comunidad, en un feed vertical infinito. Desliza, reacciona y aparece tú también.",
    acento: "#FF4D6D",
  },
  ranking: {
    titulo: "Ranking",
    volanta: "Los que mandan",
    imagen: "/ilustraciones/ranking.jpg",
    texto:
      "La tabla de los mejores analistas del mundo. Sube puestos, entra al top y haz historia esta semana.",
    acento: "#FFD60A",
  },
  agente: {
    titulo: "Perfil del Agente",
    volanta: "Tu identidad en la sombra",
    imagen: "/ilustraciones/agente.jpg",
    texto:
      "Tu IQ geopolítico, tu equipo y tu look de combate. Edita tu agente 3D y hazlo único en el hangar.",
    acento: "#38C6FF",
  },
  alianzas: {
    titulo: "Alianzas",
    volanta: "Juntos somos frente",
    imagen: "/ilustraciones/alianzas.jpg",
    texto:
      "Funda pactos, únete a uniones y comparte victorias. Un guerrero solo cae; una alianza avanza.",
    acento: "#B78CFF",
  },
  gobierno: {
    titulo: "Gobierno Mundial",
    volanta: "El salón de los decretos",
    imagen: "/ilustraciones/gobierno.jpg",
    texto:
      "Preside, decreta y negocia como líder mundial. Cada firma tuya mueve el tablero de todos.",
    acento: "#FFC857",
  },
  quiz: {
    titulo: "Quiz Táctico",
    volanta: "¿Cuánto sabes de verdad?",
    imagen: "/ilustraciones/quiz.jpg",
    texto:
      "Preguntas reales sobre el mundo y puntos por respuesta rápida. Aprende jugando — y sube tu IQ.",
    acento: "#FF6FB5",
  },
  dronguerra: {
    titulo: "Guerra de Drones",
    volanta: "Ojos que no parpadean",
    imagen: "/ilustraciones/dronguerra.jpg",
    texto:
      "Pilota misiones de dron sobre ciudades reales. Exactitud, paciencia y un dedo firme.",
    acento: "#FF7043",
  },
  frente: {
    titulo: "Líneas de Frente",
    volanta: "Donde el mundo arde hoy",
    imagen: "/ilustraciones/frente.jpg",
    texto:
      "Los frentes activos del planeta, en vivo y en 3D. Mira de cerca dónde se decide la historia.",
    acento: "#FF8A5C",
  },
  warsim: {
    titulo: "Simulador de Guerras",
    volanta: "Escenarios que no existen… aún",
    imagen: "/ilustraciones/warsim.jpg",
    texto:
      "Crea conflictos hipotéticos y simúlalos con datos reales. La mejor forma de predecir el mañana.",
    acento: "#FFA552",
  },
  crisis: {
    titulo: "Crisis Mundial",
    volanta: "Alerta en el tablero",
    imagen: "/ilustraciones/crisis.jpg",
    texto:
      "Cuando el mundo se rompe, aquí suena la alarma. Sigue cada crisis minuto a minuto.",
    acento: "#FF2E4C",
  },
  planeta: {
    titulo: "Planeta Vivo",
    volanta: "La Tierra respira",
    imagen: "/ilustraciones/planeta.jpg",
    texto:
      "ISS, auroras, sismos y NASA en directo. El planeta visto desde arriba — y desde dentro.",
    acento: "#4DC9FF",
  },
  geopolitica: {
    titulo: "Geopolítica en Vivo",
    volanta: "La ONU y el pulso del mundo",
    imagen: "/ilustraciones/geopolitica.jpg",
    texto:
      "Resoluciones, sismos y decisiones globales al momento. Entiende el porqué de cada movimiento.",
    acento: "#7FD1FF",
  },
  detective: {
    titulo: "Archivos Nación",
    volanta: "Cada país guarda un secreto",
    imagen: "/ilustraciones/detective.jpg",
    texto:
      "Investiga naciones como un detective: pistas, historias y expedientes por país. Resuelve el caso.",
    acento: "#E8B36A",
  },
  // ===== v76.0 OLA DE ORO — segunda ola: 22 secciones nuevas =====
  bolsa: {
    titulo: "Bolsa Geopolítica",
    volanta: "El mercado nunca duerme",
    imagen: "/ilustraciones/bolsa.jpg",
    texto:
      "Compra monedas de países reales y velas subir o caer con el mundo. Empieza con poco, aprende rápido — y si aciertas, la bolsa paga.",
    acento: "#3EA6FF",
  },
  expedientes: {
    titulo: "Archivo Secreto",
    volanta: "Expedientes desclasificados",
    imagen: "/ilustraciones/expedientes.jpg",
    texto:
      "Documentos reales del FBI, CIA y NARA que estuvieron bajo llave durante décadas. Ábrelos todos y escala hasta el rango OJO DE DIOS.",
    acento: "#C77DFF",
  },
  oscura: {
    titulo: "Alejandría Oscura",
    volanta: "La biblioteca del miedo",
    imagen: "/ilustraciones/oscura.jpg",
    texto:
      "Teorías con veredicto real, armas imposibles, civilizaciones perdidas y documentos prohibidos. Entra con la luz encendida.",
    acento: "#D6336C",
  },
  envivo: {
    titulo: "En Vivo Mundial",
    volanta: "El planeta al minuto",
    imagen: "/ilustraciones/envivo.jpg",
    texto:
      "Noticias reales 24/7 y directos de la comunidad, con donaciones en vivo. Lo que pasa ahora mismo, sin filtro y sin retraso.",
    acento: "#FF5252",
  },
  contribuidores: {
    titulo: "Contribuidores",
    volanta: "Tu talento paga",
    imagen: "/ilustraciones/contribuidores.jpg",
    texto:
      "Siete trabajos remunerados: reporta, escribe, verifica, traduce. La comunidad construye Vanguard — y aquí cobra por ello.",
    acento: "#2EE6A8",
  },
  memes: {
    titulo: "Estudio de Memes",
    volanta: "La guerra también se ríe",
    imagen: "/ilustraciones/memes.jpg",
    texto:
      "Diseña tu meme geopolítico con 251 países personajes. Publícalo, haz reír al mundo y gana monedas si triunfa.",
    acento: "#D946EF",
  },
  creador: {
    titulo: "Estudio Comunitario",
    volanta: "Sube tu propia obra",
    imagen: "/ilustraciones/creador.jpg",
    texto:
      "Personajes, armas, juegos, música, noticias y encuestas: sube tu contenido y la IA lo modera al instante. Tu creación, frente al mundo.",
    acento: "#FF66C4",
  },
  studios: {
    titulo: "Estudios Creadores",
    volanta: "Una fábrica por sección",
    imagen: "/ilustraciones/studios.jpg",
    texto:
      "Noticias con fotos, banderas propias, mapas con flechas, música compuesta al momento y stickers. Cada estudio, una obra maestra.",
    acento: "#22D3EE",
  },
  bolsamonedas: {
    titulo: "Bolsa de Monedas",
    volanta: "Funda tu propia divisa",
    imagen: "/ilustraciones/bolsamonedas.jpg",
    texto:
      "Crea tu moneda con ticker y supply. El mercado la cotiza en vivo y los jugadores mueven el precio. Si tu divisa despega, te haces rico.",
    acento: "#34C77B",
  },
  armeria: {
    titulo: "Armería Real",
    volanta: "El acero, en detalle",
    imagen: "/ilustraciones/armeria.jpg",
    texto:
      "Fotos reales de las armas del conflicto: función, ficha técnica y armado pieza por pieza. Conocerlas es entender la guerra.",
    acento: "#FF5C33",
  },
  abusos: {
    titulo: "Verdad Cruda",
    volanta: "El lado que prefieren ocultar",
    imagen: "/ilustraciones/abusos.jpg",
    texto:
      "Crímenes y abusos documentados con fuentes de la ONU. No es fácil de leer, pero es lo que realmente pasa en el mundo.",
    acento: "#FF6B6B",
  },
  memorial: {
    titulo: "Memorial",
    volanta: "Los que documentaron y cayeron",
    imagen: "/ilustraciones/memorial.jpg",
    texto:
      "Periodistas y analistas que murieron contando la verdad. Enciende tu vela y guarda un minuto de silencio.",
    acento: "#B49CFF",
  },
  predicciones: {
    titulo: "Predicciones",
    volanta: "Apuesta por el mañana",
    imagen: "/ilustraciones/predicciones.jpg",
    texto:
      "Predice elecciones, conflictos y crisis antes de que pasen. Cada acierto sube tu reputación y llena tu cuenta.",
    acento: "#FFB35C",
  },
  salas: {
    titulo: "Salas Sociales",
    volanta: "La tertulia de los guerreros",
    imagen: "/ilustraciones/salas.jpg",
    texto:
      "Chat en vivo con GRITO DEL DÍA para encender el debate, emotes rápidos y tarjetas de operador con rango y firma de guerra. Entra, opina y haz aliados — o rivales.",
    acento: "#8C7FFF",
  },
  radar: {
    titulo: "Radar Desinfo",
    volanta: "Caza las mentiras",
    imagen: "/ilustraciones/radar.jpg",
    texto:
      "Detecta noticias falsas y conexiones ocultas entre fuentes. Tu cuchillo analítico contra la desinformación.",
    acento: "#2EE6C8",
  },
  logros: {
    titulo: "Logros",
    volanta: "Tu vitrina de guerra",
    imagen: "/ilustraciones/logros.jpg",
    texto:
      "Medallas, insignias y marcas históricas por cada hazaña. Aquí se guarda todo lo que has conquistado.",
    acento: "#FFE14D",
  },
  recompensas: {
    titulo: "Recompensas",
    volanta: "El botín del comandante",
    imagen: "/ilustraciones/recompensas.jpg",
    texto:
      "Cofres, bonos y premios por tu actividad diaria. Vuelve cada día: el botín nunca se repite.",
    acento: "#FFAA33",
  },
  tienda: {
    titulo: "Tienda",
    volanta: "El arsenal del agente",
    imagen: "/ilustraciones/tienda.jpg",
    texto:
      "Equipamiento, potencias y objetos raros para tu agente y tus operaciones. Gasta con cabeza — o con estilo.",
    acento: "#5CE1E6",
  },
  camaras: {
    titulo: "Cámaras del Mundo",
    volanta: "Los ojos de la calle",
    imagen: "/ilustraciones/camaras.jpg",
    texto:
      "Cámaras públicas de ciudades de todo el planeta, en directo. Mira la Tierra moverse en tiempo real.",
    acento: "#00E5A0",
  },
  pulso: {
    titulo: "Pulso Mundial",
    volanta: "Satélite y cielo en vivo",
    imagen: "/ilustraciones/pulso.jpg",
    texto:
      "Satélites, radar aéreo y el latido del planeta desde arriba. Lo que vuela, lo que late, lo que se mueve.",
    acento: "#00D4FF",
  },
  tribunal: {
    titulo: "Juicio Histórico",
    volanta: "La historia en el banquillo",
    imagen: "/ilustraciones/tribunal.jpg",
    texto:
      "Juzga los momentos que cambiaron el mundo: tú eres el jurado. El veredicto de la comunidad queda para la historia.",
    acento: "#E6C86E",
  },
  recluta: {
    titulo: "Reclutamiento",
    volanta: "De civil a agente",
    imagen: "/ilustraciones/recluta.jpg",
    texto:
      "Cómo se entra en Vanguard: la vía 3D paso a paso. Míralo una vez y entenderás todo el juego.",
    acento: "#7DFFB2",
  },
  // ===== v77.0 ORO TOTAL — el mega-menú completo iluminado: 36 secciones =====
  registro: {
    titulo: "Registro de Actividad",
    volanta: "Tu historial de guerra",
    imagen: "/ilustraciones/registro.jpg",
    texto:
      "Cada acción que tomas queda escrita aquí: misiones, batallas, monedas y logros. Tu carrera, línea a línea.",
    acento: "#9AA8FF",
  },
  edad: {
    titulo: "Age of Nations",
    volanta: "Evoluciona tu nación",
    imagen: "/ilustraciones/edad.jpg",
    texto:
      "Desde la aldea antigua hasta la superpotencia moderna: haz crecer tu civilización era por era.",
    acento: "#FF9E7A",
  },
  briefings: {
    titulo: "Briefings Clasificados",
    volanta: "Solo lectura autorizada",
    imagen: "/ilustraciones/briefings.jpg",
    texto:
      "Informes reservados con lo que casi nadie sabe todavía. Léelos antes de que el mundo los descubra.",
    acento: "#6FD6FF",
  },
  carteles: {
    titulo: "Carteles",
    volanta: "El imperio invisible",
    imagen: "/ilustraciones/carteles.jpg",
    texto:
      "Carteles y organizaciones que mueven el dinero y el miedo del planeta. Conoce su mapa y su historia.",
    acento: "#B54FFF",
  },
  combate: {
    titulo: "Simulador de Combate",
    volanta: "Enfrenta al enemigo",
    imagen: "/ilustraciones/combate.jpg",
    texto:
      "Elige tu oponente, estudia su ficha y lucha bajo la luna. Reflejos, táctica y un dedo firme.",
    acento: "#FF4655",
  },
  conquistas3d: {
    titulo: "Conquistas 3D",
    volanta: "Tu imperio en pantalla",
    imagen: "/ilustraciones/conquistas3d.jpg",
    texto:
      "Revive tus conquistas en escenas 3D: cada territorio tomado, cada batalla ganada, tu historia.",
    acento: "#FFD98E",
  },
  contadores: {
    titulo: "Contadores Mundiales",
    volanta: "El mundo en números",
    imagen: "/ilustraciones/contadores.jpg",
    texto:
      "Población, nacimientos, conflictos y más, contando en vivo. El planeta nunca deja de moverse.",
    acento: "#FF7BAC",
  },
  curiosidades: {
    titulo: "Curiosidades",
    volanta: "Datos que sorprenden",
    imagen: "/ilustraciones/curiosidades.jpg",
    texto:
      "Historias reales y datos increíbles del mundo que no salen en las noticias. Aprende algo nuevo cada día.",
    acento: "#F5E960",
  },
  retos: {
    titulo: "Retos Diarios",
    volanta: "Ponte a prueba",
    imagen: "/ilustraciones/retos.jpg",
    texto:
      "Desafíos nuevos cada día con premios en monedas y gemas. Complétalos todos y mantén tu racha.",
    acento: "#FFDA47",
  },
  directos: {
    titulo: "Directos en Vivo",
    volanta: "La comunidad al aire",
    imagen: "/ilustraciones/directos.jpg",
    texto:
      "Streams de los jugadores en tiempo real: guerra, análisis y entretenimiento. Súbete al aire.",
    acento: "#FF3D68",
  },
  divisas: {
    titulo: "Divisas del Mundo",
    volanta: "El valor de cada nación",
    imagen: "/ilustraciones/divisas.jpg",
    texto:
      "El precio de las monedas del planeta en vivo, con cambios al instante. Entiende la economía mundial.",
    acento: "#4ADE80",
  },
  embajadores: {
    titulo: "Embajadores por País",
    volanta: "La voz de cada nación",
    imagen: "/ilustraciones/embajadores.jpg",
    texto:
      "Un representante por país: los jugadores elegidos para hablar por su nación. Postúlate y vota.",
    acento: "#86EFAC",
  },
  enciclopedia: {
    titulo: "Enciclopedia Mundial",
    volanta: "Saber de A a Z",
    imagen: "/ilustraciones/enciclopedia.jpg",
    texto:
      "Países, banderas, historias y datos de los 251 territorios del planeta. La biblioteca del analista.",
    acento: "#93C5FD",
  },
  epocas: {
    titulo: "Épocas Antiguas",
    volanta: "Viaja en el tiempo",
    imagen: "/ilustraciones/epocas.jpg",
    texto:
      "Imperios, guerras y civilizaciones que hicieron el mundo de hoy. La historia que repite sus lecciones.",
    acento: "#D8B4FE",
  },
  estudio: {
    titulo: "Estudio de Video",
    volanta: "Crea y publica",
    imagen: "/ilustraciones/estudio.jpg",
    texto:
      "Monta tus videos con la herramienta del estudio: corta, arma y publica para toda la comunidad.",
    acento: "#F472B6",
  },
  muertes: {
    titulo: "Figuras y Bajas",
    volanta: "Los que marcaron la historia",
    imagen: "/ilustraciones/muertes.jpg",
    texto:
      "Fallecimientos de figuras del mundo en tiempo real y las bajas históricas que cambiaron el rumbo.",
    acento: "#B8B8C4",
  },
  foros: {
    titulo: "Foros",
    volanta: "El debate de la comunidad",
    imagen: "/ilustraciones/foros.jpg",
    texto:
      "Hilos por temas y países donde los guerreros discuten el mundo. Opina con argumentos, gana respeto.",
    acento: "#67E8F9",
  },
  amigos: {
    titulo: "Amigos",
    volanta: "Tu escuadrón",
    imagen: "/ilustraciones/amigos.jpg",
    texto:
      "Añade guerreros, mira quién está en línea y comparte batallas. Nadie gana una guerra en solitario.",
    acento: "#5EEAD4",
  },
  fusion: {
    titulo: "Fusion",
    volanta: "Combina y descubre",
    imagen: "/ilustraciones/fusion.jpg",
    texto:
      "Mezcla elementos y descubre combinaciones únicas. El laboratorio secreto de Vanguard.",
    acento: "#A78BFA",
  },
  galeria: {
    titulo: "Galería OSINT",
    volanta: "Imágenes de la guerra",
    imagen: "/ilustraciones/galeria.jpg",
    texto:
      "Fotos y capturas del mundo en conflicto, curadas por la comunidad. Cada imagen cuenta una historia.",
    acento: "#E879F9",
  },
  maps: {
    titulo: "Mapas de Conflictos",
    volanta: "La vista de calle",
    imagen: "/ilustraciones/maps.jpg",
    texto:
      "Explora las zonas calientes del planeta en el mapa satelital. Del espacio a la esquina exacta.",
    acento: "#34D399",
  },
  ayuda: {
    titulo: "Ayuda",
    volanta: "Todo explicado",
    imagen: "/ilustraciones/ayuda.jpg",
    texto:
      "Guías rápidas de cada sección, preguntas frecuentes y contacto. Nunca estás perdido en Vanguard.",
    acento: "#FCD34D",
  },
  historia: {
    titulo: "Guerras Históricas",
    volanta: "Lecciones de acero",
    imagen: "/ilustraciones/historia.jpg",
    texto:
      "Los conflictos que dibujaron las fronteras de hoy: causas, fechas y consecuencias. Comprende el pasado.",
    acento: "#D9A05B",
  },
  gancho: {
    titulo: "Centro de Ganancias",
    volanta: "Todo lo que puedes ganar",
    imagen: "/ilustraciones/gancho.jpg",
    texto:
      "Bonos, referidos, retos y recompensas en un solo lugar. Tu camino rápido a la fortuna.",
    acento: "#FBBF24",
  },
  incidentes: {
    titulo: "Mapa de Incidentes",
    volanta: "Donde algo está pasando",
    imagen: "/ilustraciones/incidentes.jpg",
    texto:
      "Incidencias reportadas en el mapa en vivo: alertas, sucesos y señales de la comunidad.",
    acento: "#FB7185",
  },
  minijuego: {
    titulo: "Minijuegos",
    volanta: "Pausa táctica",
    imagen: "/ilustraciones/minijuego.jpg",
    texto:
      "Juegos rápidos para ganar monedas entre batallas. Diversión que también entrena tu mente.",
    acento: "#F97316",
  },
  notificaciones: {
    titulo: "Alertas",
    volanta: "No te pierdas nada",
    imagen: "/ilustraciones/notificaciones.jpg",
    texto:
      "Tus notificaciones en un solo lugar: logros, eventos, ataques y noticias que te afectan.",
    acento: "#EAB308",
  },
  perfil: {
    titulo: "Personaliza tu Perfil",
    volanta: "Tu cara ante el mundo",
    imagen: "/ilustraciones/perfil.jpg",
    texto:
      "Bandera, apodo, colores y estilo: haz que tu perfil grite quién eres antes de que hables.",
    acento: "#C084FC",
  },
  encuestas: {
    titulo: "Encuestas",
    volanta: "Tu voto cuenta",
    imagen: "/ilustraciones/encuestas.jpg",
    texto:
      "Vota los temas del mundo y compara con la comunidad. La opinión global, en tiempo real.",
    acento: "#2DD4BF",
  },
  estadisticas: {
    titulo: "Estadísticas",
    volanta: "Tu progreso en gráficas",
    imagen: "/ilustraciones/estadisticas.jpg",
    texto:
      "Tu evolución día a día: XP, monedas, victorias y rachas. Los números de tu carrera.",
    acento: "#60A5FA",
  },
  sala18: {
    titulo: "Sala Roja",
    volanta: "Contenido documental 18+",
    imagen: "/ilustraciones/sala18.jpg",
    texto:
      "Lo crudo del conflicto: material documental verificado, solo para mayores de 18 años. Entra con criterio.",
    acento: "#DC2626",
  },
  racha: {
    titulo: "Racha",
    volanta: "Cada día cuenta",
    imagen: "/ilustraciones/racha.jpg",
    texto:
      "Tu calendario de constancia: entra, marca el día y multiplica tu botín. No rompas la cadena.",
    acento: "#FB923C",
  },
  telegram: {
    titulo: "Bot de Telegram",
    volanta: "Vanguard en tu bolsillo",
    imagen: "/ilustraciones/telegram.jpg",
    texto:
      "Conecta el bot y recibe alertas, noticias y retos directo en tu chat. El cuartel en tu bolsillo.",
    acento: "#29B6F6",
  },
  torneos: {
    titulo: "Torneos",
    volanta: "Compite por la gloria",
    imagen: "/ilustraciones/torneos.jpg",
    texto:
      "Competiciones por temporadas con premios grandes. Inscríbete, sube la tabla y sé leyenda.",
    acento: "#FACC15",
  },
  apuestas: {
    titulo: "Apuestas de Guerra",
    volanta: "Predice el conflicto",
    imagen: "/ilustraciones/apuestas.jpg",
    texto:
      "Apuesta por los frentes y eventos del mundo real con cuotas vivas. Gana si lees la guerra mejor.",
    acento: "#3BFF6F",
  },
  videos: {
    titulo: "GlobalVision",
    volanta: "La TV de la comunidad",
    imagen: "/ilustraciones/videos.jpg",
    texto:
      "Videos de la comunidad sobre el mundo real: reportajes, análisis y entretenimiento. Publica el tuyo.",
    acento: "#FF5E5B",
  },
  consejoia: {
    titulo: "Consejo de Acero",
    volanta: "IA en vivo: 4 mentes, un decreto",
    imagen: "/ilustraciones/consejo.jpg",
    texto:
      "Plantea tu crisis y cuatro consejeros de IA deliberan en vivo, votan y firman un decreto. Activa el Núcleo Embebido y la IA corre dentro de tu navegador, con memoria de tus sesiones.",
    acento: "#00E5FF",
  },
  // v85.0 EL MUNDO DENTRO
  empleos: {
    titulo: "EMPLEOS DE VANGUARD",
    volanta: "Aquí no se juega: se trabaja",
    imagen: "/ilustraciones/empleos.jpg",
    texto:
      "Pasa la entrevista de ingreso y Vanguard te contrata: Estado Mayor, Cartografía, Escucha SIGINT o Cancillería. Sueldo por minuto, turnos pagados, ascensos y una nómina que corre aunque cierres la app.",
    acento: "#D4E157",
  },
  armodo: {
    titulo: "MODO AR",
    volanta: "El mundo, flotando en tu calle",
    imagen: "/ilustraciones/modoar.jpg",
    texto:
      "Abre la cámara y mira los conflictos del planeta flotando sobre TU mundo, con giroscopio y capa de guerra en vivo. Toca un marcador y lee el frente como si estuviera frente a ti.",
    acento: "#7DF9FF",
  },
  mapascrea: {
    titulo: "CONSTRUCTOR DE MAPAS",
    volanta: "Tu guerra, tu cartografía",
    imagen: "/ilustraciones/constructor.jpg",
    texto:
      "Pinta zonas por facción, traza frentes punto a punto, coloca HQ, batallas y flotas sobre el mapa real. Guarda tu cartoteca, exporta PNG y comparte tu mundo en un código VGMAP85.",
    acento: "#FFD1DC",
  },
  // v86.0 CENTINELA GLOBAL
  verifica: {
    titulo: "MESA DE VERIFICACIÓN",
    volanta: "Primero se verifica. Después se publica",
    imagen: "/ilustraciones/verifica.jpg",
    texto:
      "La sala OSINT donde cada noticia pasa por 5 cheques: metadatos, geolocalización, satélite, contraste de fuentes y detector de deepfake. Sellos de confianza, las DOS orillas de cada conflicto, filtro de contenido sensible y fichas técnicas de armas y actores al tocar.",
    acento: "#00E5A8",
  },
  centinela: {
    titulo: "CENTINELA · ALERTA TEMPRANA",
    volanta: "Lee el mundo antes de que sea titular",
    imagen: "/ilustraciones/centinela.jpg",
    texto:
      "Índice de riesgo por región con la aguja del planeta en vivo: movimientos de tropas, actividad diplomática, propaganda estatal, flujo de refugiados y ciberactividad. La guerra casi nunca estalla sin avisar — aquí el aviso llega primero.",
    acento: "#FF6B6B",
  },
  espectro: {
    titulo: "ESPECTRO EN VIVO",
    volanta: "El cielo y el mar también hablan",
    imagen: "/ilustraciones/espectro.jpg",
    texto:
      "Tráfico aéreo REAL (ADS-B) sobre 5 zonas calientes, los 6 canales marítimos que sostienen el comercio del planeta y el pulso del espectro de radio con jamming de GPS. Los buques de guerra se ven antes de que los nombres salgan en las agencias.",
    acento: "#22D3EE",
  },
} satisfies Record<string, ReglaOroEntry>;

export type ReglaOroPanel = keyof typeof REGLA_ORO;
