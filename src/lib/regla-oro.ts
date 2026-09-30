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
} satisfies Record<string, ReglaOroEntry>;

export type ReglaOroPanel = keyof typeof REGLA_ORO;
