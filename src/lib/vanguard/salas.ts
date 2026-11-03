import type { Sala } from "./tipos";

// ============================================================
// VANGUARD v170.0 — CATÁLOGO DE SALAS (24 puertas a la red)
// Nombres heredados de la bitácora v168 rescate-v168/.
// Sin modo 3D. El algoritmo decide el orden; aquí vive el mundo.
// ============================================================

export const SALAS: Sala[] = [
  // ── MUNDO ──────────────────────────────────────────────────
  {
    id: "sismo",
    nombre: "TERREMOTOS EN VIVO",
    icono: "🌐",
    categoria: "MUNDO",
    tagline: "El planeta late y aquí se le escucha el pulso.",
    descripcion:
      "Monitor sísmico conectado a USGS: los temblores de magnitud 4.5+ de las últimas 24 h, ordenados por energía liberada. Cada evento llega con lugar, profundidad y hora exacta del epicentro.",
    tags: ["usgs", "sismos", "en vivo"],
    fuente: "api",
    fuenteEtiqueta: "USGS · EN VIVO",
    poder: 92,
  },
  {
    id: "meteo",
    nombre: "METEO GLOBAL",
    icono: "🌦️",
    categoria: "MUNDO",
    tagline: "Ocho ciudades, un solo cielo.",
    descripcion:
      "Ventana meteorológica en directo sobre 8 capitales del mundo vía Open-Meteo: temperatura, viento y condición actual. Los datos se refrescan solos — Vanguard nunca duerme.",
    tags: ["clima", "open-meteo", "en vivo"],
    fuente: "api",
    fuenteEtiqueta: "OPEN-METEO · EN VIVO",
    poder: 84,
  },
  {
    id: "planeta",
    nombre: "PLANETA VIVO",
    icono: "🛰️",
    categoria: "MUNDO",
    tagline: "Eventos geofísicos que la NASA vigila por ti.",
    descripcion:
      "Enlace directo con EONET (NASA Earth Observatory): erupciones, incendios, tormentas severas y hielo en retirada. La Tierra como organismo, con sus eventos naturales documentados uno a uno.",
    tags: ["nasa", "eonet", "naturaleza"],
    fuente: "api",
    fuenteEtiqueta: "NASA EONET · EN VIVO",
    poder: 88,
  },
  {
    id: "pulso",
    nombre: "PULSO DEL PLANETA",
    icono: "📡",
    categoria: "MUNDO",
    tagline: "Todos los radares de Vanguard en una sola sala.",
    descripcion:
      "Sala de agregación: sismos, clima extremo, cripto y curiosidades confluyen en un índice único del estado del mundo. La lectura horizontal que un agente necesita antes de operar.",
    tags: ["radar", "índice", "resumen"],
    fuente: "api",
    fuenteEtiqueta: "AGREGADOR · EN VIVO",
    poder: 78,
  },
  {
    id: "ojodios",
    nombre: "OJO DE DIOS",
    icono: "👁️",
    categoria: "MUNDO",
    tagline: "La visión omnisciente sobre los frentes del mundo.",
    descripcion:
      "Mapa de tensión global: frentes activos con intensidad en vivo, facciones implicadas y la última batalla registrada. Vista de dios para quien quiere entender dónde arde el mundo hoy.",
    tags: ["conflictos", "frentes", "intel"],
    fuente: "sim",
    fuenteEtiqueta: "SIMULACIÓN TÁCTICA",
    poder: 90,
  },
  // ── MERCADO ────────────────────────────────────────────────
  {
    id: "cripto",
    nombre: "DIVISAS DEL FUTURO",
    icono: "🪙",
    categoria: "MERCADO",
    tagline: "Bitcoin, Ether y el pulso del dinero libre.",
    descripcion:
      "Cotizaciones en vivo de las 6 criptodivisas principales vía CoinGecko, con variación 24 h y color de sentimiento. El mercado no cierra nunca; esta sala tampoco.",
    tags: ["cripto", "coingecko", "en vivo"],
    fuente: "api",
    fuenteEtiqueta: "COINGECKO · EN VIVO",
    poder: 86,
  },
  {
    id: "betnacion",
    nombre: "BETNACIÓN",
    icono: "🎲",
    categoria: "MERCADO",
    tagline: "La casa de apuestas oficial de Vanguard.",
    descripcion:
      "Apuesta tus mon ◉ al mercado más honesto del mundo: ¿BTC sube o baja en los próximos 60 segundos? La cuota se resuelve con el precio real si llega, y con el destino si no.",
    tags: ["apuestas", "btc", "adrenalina"],
    fuente: "sim",
    fuenteEtiqueta: "JUEGO LIMPIO",
    poder: 82,
  },
  {
    id: "ganancias",
    nombre: "CENTRO DE GANANCIAS",
    icono: "💰",
    categoria: "MERCADO",
    tagline: "La sala de máquinas que hace volver cada día.",
    descripcion:
      "Misiones diarias con recompensa real: explora salas nuevas, reacciona al feed, gana un combate. Tu racha crece aquí y el algoritmo te premia por constancia.",
    tags: ["misiones", "racha", "mon"],
    fuente: "sim",
    fuenteEtiqueta: "ECONOMÍA VANGUARD",
    poder: 74,
  },
  {
    id: "imperio",
    nombre: "IMPERIO",
    icono: "🏛️",
    categoria: "MERCADO",
    tagline: "Funda un imperio que produce incluso mientras te vas.",
    descripcion:
      "Idle-strategy puro: recluta guerreros, acumula oro y ciencia, y observa cómo tus reservas crecen en tiempo real. Cada visita cobra los impuestos pendientes.",
    tags: ["idle", "estrategia", "oro"],
    fuente: "sim",
    fuenteEtiqueta: "SIMULACIÓN ECONÓMICA",
    poder: 80,
  },
  // ── JUEGO ──────────────────────────────────────────────────
  {
    id: "guerra",
    nombre: "MUNDO DE GUERRA",
    icono: "⚔️",
    categoria: "JUEGO",
    tagline: "Conquista estilo Risk sobre la carta del mundo.",
    descripcion:
      "12 territorios, un ejército y el destino. Lanza tus ofensivas territorio a territorio: cada conquista suma mon ◉ y cambia el mapa de tu campaña. La guerra con reglas claras.",
    tags: ["estrategia", "conquista", "turnos"],
    fuente: "sim",
    fuenteEtiqueta: "SIMULACIÓN DE GUERRA",
    poder: 94,
  },
  {
    id: "combate",
    nombre: "SIMULADOR DE COMBATE",
    icono: "🥊",
    categoria: "JUEGO",
    tagline: "Duelo por turnos contra la máquina.",
    descripcion:
      "Tú, tu barra de vida y un rival que no duda. Ataca, defiende y sobrevive a la serie de golpes del simulador. Cada victoria paga bien; cada derrota enseña.",
    tags: ["duelo", "pvp bot", "reflejos"],
    fuente: "sim",
    fuenteEtiqueta: "COMBATE SIMULADO",
    poder: 87,
  },
  {
    id: "detective",
    nombre: "DIVISIÓN DETECTIVE",
    icono: "🕵️",
    categoria: "JUEGO",
    tagline: "Tres sospechosos, pistas sucias, un solo culpable.",
    descripcion:
      "Casos generados por la mente de Vanguard: examina pistas, compara coartadas y acusa. Acertar paga en mon ◉ y XP; equivocar la acusación también deja huella en tu expediente.",
    tags: ["misterio", "deducción", "casos"],
    fuente: "sim",
    fuenteEtiqueta: "CASOS GENERADOS",
    poder: 85,
  },
  {
    id: "arcade",
    nombre: "ARCADE VANGUARD",
    icono: "🎯",
    categoria: "JUEGO",
    tagline: "Reflejos puros contra el reloj.",
    descripcion:
      "20 segundos, blancos que aparecen y se escapan, y un récord que te mira. El minijuego más simple y más adictivo de la red: tu precisión contra ti mismo.",
    tags: ["arcade", "récord", "precisión"],
    fuente: "sim",
    fuenteEtiqueta: "MINIJUEGO REAL",
    poder: 76,
  },
  {
    id: "mipais",
    nombre: "MI PAÍS",
    icono: "🚩",
    categoria: "JUEGO",
    tagline: "Proclama una nación y gobierna con decretos.",
    descripcion:
      "Simulador de nación compacto: proclama tu país, elige gobierno y firma decretos que mueven población, PIB y ejército. El país que siempre quisiste dirigir, sin oposición real.",
    tags: ["nación", "gobierno", "decretos"],
    fuente: "sim",
    fuenteEtiqueta: "SIMULADOR DE NACIÓN",
    poder: 83,
  },
  {
    id: "taller",
    nombre: "TALLER CREADOR",
    icono: "🛠️",
    categoria: "JUEGO",
    tagline: "El reto del día se fabrica aquí.",
    descripcion:
      "Cada día la mente de Vanguard forja un reto creativo distinto. Acepta el reto, márcalo como cumplido y cobra. La fábrica de contenido de la red, siempre en operación.",
    tags: ["retos", "creación", "diario"],
    fuente: "sim",
    fuenteEtiqueta: "FÁBRICA DE RETOS",
    poder: 70,
  },
  // ── CONOCIMIENTO ───────────────────────────────────────────
  {
    id: "curiosidades",
    nombre: "INFINITAS CURIOSIDADES",
    icono: "🎲",
    categoria: "CONOCIMIENTO",
    tagline: "Lo que pasó un día como hoy, según Wikipedia.",
    descripcion:
      "Efemérides reales de Wikipedia del día en curso + la curiosidad destacada de Vanguard. Aprender algo nuevo cada día paga: archivar curiosidades suma mon ◉.",
    tags: ["wikipedia", "efemérides", "saber"],
    fuente: "api",
    fuenteEtiqueta: "WIKIPEDIA · EN VIVO",
    poder: 79,
  },
  {
    id: "biblioteca",
    nombre: "BIBLIOTECA DE EXPEDIENTES",
    icono: "📚",
    categoria: "CONOCIMIENTO",
    tagline: "Los desclasificados que la red guarda por ti.",
    descripcion:
      "10 expedientes temáticos con nivel de acceso: operaciones históricas, doctrinas, operaciones de bandera falsa. Lee, archiva y construye tu criterio de analista.",
    tags: ["expedientes", "historia", "doctrina"],
    fuente: "archivo",
    fuenteEtiqueta: "ARCHIVO VANGUARD",
    poder: 72,
  },
  {
    id: "redmundial",
    nombre: "RED MUNDIAL",
    icono: "🕸️",
    categoria: "CONOCIMIENTO",
    tagline: "El pacto que nunca firma periódicos.",
    descripcion:
      "Los 10 servicios de inteligencia más influyentes del planeta con su historia, sede y misión pública. Un mapa del poder invisible, documentado con fuentes abiertas.",
    tags: ["intel", "servicios", "poder"],
    fuente: "archivo",
    fuenteEtiqueta: "ARCHIVO VANGUARD",
    poder: 81,
  },
  {
    id: "rostros",
    nombre: "ROSTROS DEL PODER",
    icono: "🎭",
    categoria: "CONOCIMIENTO",
    tagline: "La jerarquía invisible, cara a cara.",
    descripcion:
      "Colección de perfiles de la jerarquía del poder: índice de influencia, ruta al poder y qué cable los delata. El expediente que todo agente consulta antes de operar.",
    tags: ["perfiles", "jerarquía", "influencia"],
    fuente: "archivo",
    fuenteEtiqueta: "ARCHIVO VANGUARD",
    poder: 75,
  },
  {
    id: "mente",
    nombre: "MENTE VIVA",
    icono: "🧠",
    categoria: "CONOCIMIENTO",
    tagline: "El cerebro central de Vanguard piensa en voz alta.",
    descripcion:
      "La mente de la red: analiza tus señales, emite pensamientos sobre tu comportamiento de agente y propone el siguiente movimiento. Autoconocimiento algorítmico, literal.",
    tags: ["ia", "análisis", "reflexión"],
    fuente: "sim",
    fuenteEtiqueta: "COGNICIÓN VANGUARD",
    poder: 77,
  },
  // ── AGENTE ─────────────────────────────────────────────────
  {
    id: "centinela",
    nombre: "CENTINELA GLOBAL",
    icono: "🛡️",
    categoria: "AGENTE",
    tagline: "Entrena tu criterio contra la desinformación.",
    descripcion:
      "Titulares del día: unos reales, otros falsificados por la casa. Verifica cuáles son verdad y afina tu ojo de analista. Cada acierto paga; cada error se registra.",
    tags: ["verificación", "fake news", "criterio"],
    fuente: "sim",
    fuenteEtiqueta: "MESA DE VERIFICACIÓN",
    poder: 89,
  },
  {
    id: "tribunal",
    nombre: "TRIBUNAL GLOBAL",
    icono: "⚖️",
    categoria: "AGENTE",
    tagline: "Tu voto cuenta; la verdad, también.",
    descripcion:
      "Casos internacionales sometidos al jurado de la red: vota culpable o inocente y descubre el veredicto documentado. La justicia como ejercicio diario de criterio.",
    tags: ["jurado", "voto", "casos"],
    fuente: "sim",
    fuenteEtiqueta: "JURADO DE LA RED",
    poder: 73,
  },
  {
    id: "espectro",
    nombre: "ESPECTRO",
    icono: "📻",
    categoria: "AGENTE",
    tagline: "Canales, bandas y señales que cruzan el aire.",
    descripcion:
      "Archivo de escucha: canales marítimos, bandas HF y el protocolo del rastreo aéreo explicados para operadores. Cuando no hay barrido en vivo, hay doctrina.",
    tags: ["radio", "rastreo", "protocolo"],
    fuente: "archivo",
    fuenteEtiqueta: "ARCHIVO VANGUARD",
    poder: 68,
  },
  {
    id: "carteles",
    nombre: "ARCHIVO CARTELES",
    icono: "🗂️",
    categoria: "AGENTE",
    tagline: "Fichas abiertas: origen, rutas y cifras.",
    descripcion:
      "El archivo histórico de las organizaciones que movieron el mundo clandestino: origen, expansión y cómo fueron desmanteladas. Conocimiento del enemigo, con fuente abierta.",
    tags: ["archivo", "organizaciones", "historia"],
    fuente: "archivo",
    fuenteEtiqueta: "ARCHIVO VANGUARD",
    poder: 71,
  },
];

export const SALA_POR_ID: Record<string, Sala> = Object.fromEntries(
  SALAS.map((s) => [s.id, s])
);

export function salaPorId(id: string): Sala | undefined {
  return SALA_POR_ID[id];
}
