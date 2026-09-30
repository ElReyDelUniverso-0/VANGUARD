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
      "Duelas, salas y retos contra jugadores reales en línea. Aquí no se gana solo: se gana mejor.",
    acento: "#FF7A45",
  },
  arcade: {
    titulo: "Arcade Pack",
    volanta: "Joyas retro de guerra",
    imagen: "/ilustraciones/arcade.jpg",
    texto:
      "Minijuegos clásicos con sabor a 1986 y récords que defender. La pausa táctica entre batallas.",
    acento: "#FF9F1C",
  },
  bookmaker: {
    titulo: "BetNación",
    volanta: "La casa de apuestas",
    imagen: "/ilustraciones/bookmaker.jpg",
    texto:
      "Apuesta monedas por eventos reales del mundo. Cuotas vivas, adrenalina pura — y si aciertas, la casa paga.",
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
      "Charlas en vivo por temas y países, con gente real de todo el mundo. Entra, opina y haz aliados — o rivales.",
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
} satisfies Record<string, ReglaOroEntry>;

export type ReglaOroPanel = keyof typeof REGLA_ORO;
