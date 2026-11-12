// ============================================================================
// VANGUARD — THE DAILY UNIVERSE (CATÁLOGO DE ECONOMÍA, COLECCIONES Y MARKETPLACE)
// Principio ético: cero ventajas competitivas de pago (anti pay-to-win) y cero
// recompensas aleatorias pagadas (anti lootbox). Todo progreso se obtiene
// jugando, aprendiendo y participando cada día o semana.
// ============================================================================

export type RarezaUniversal = "comun" | "rara" | "epica" | "leyenda" | "mitica";

export type CategoriaColeccion =
  | "paises"
  | "civilizaciones"
  | "monumentos"
  | "espacio"
  | "fenomenos"
  | "ciencia"
  | "personajes"
  | "acontecimientos";

export interface CartaUniversal {
  id: string;
  serie: string;
  categoria: CategoriaColeccion;
  titulo: string;
  subtitulo: string;
  rareza: RarezaUniversal;
  epocaOLugar: string;
  resumenEducativo: string;
  datoCurioso: string;
  costoVC: number; // 0 = desbloqueada al inicio o por reto
  lat?: number;
  lng?: number;
  preguntaVerificacion: {
    enunciado: string;
    opciones: string[];
    correcta: number;
    recompensaVC: number;
  };
}

export interface MetaCategoriaColeccion {
  id: CategoriaColeccion;
  titulo: string;
  lema: string;
  color: string;
}

export type CategoriaMarketplace =
  | "avatares"
  | "insignias"
  | "temas"
  | "mundos"
  | "musica"
  | "base"
  | "suscripcion";

export interface ItemMarketplace {
  id: string;
  categoria: CategoriaMarketplace;
  nombre: string;
  descripcion: string;
  modelo: "Compra digital (VC)" | "Suscripción mensual (Cosmética)";
  precioVC: number;
  precioUsdRef?: string;
  color: string;
  badge: string;
  // Propiedades funcionales reales según categoría:
  temaCss?: string;        // aplica tema visual real en <html>
  frecuenciaHz?: number;   // tono base para reproductor musical WebAudio
  acordes?: number[];      // progresión de frecuencias para banda sonora
  coords3D?: { lat: number; lng: number; nombre: string }; // enlace a /teatro-3d
  avatarCodigo?: string;
  insigniaTexto?: string;
  estiloBase?: string;
}

export interface MisionDiaria {
  id: string;
  titulo: string;
  descripcion: string;
  accionLabel: string;
  rutaDestino: string;
  recompensaVC: number;
}

export interface AcontecimientoDiario {
  id: string;
  titulo: string;
  fechaReferencia: string;
  contexto: string;
  porQueImporta: string;
  rutaRelacionada: string;
}

export interface PreguntaDiaria {
  id: string;
  tema: string;
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
  recompensaVC: number;
}

export interface PaqueteDiario {
  indiceCiclo: number;
  etiquetaDia: string;
  mision: MisionDiaria;
  acontecimiento: AcontecimientoDiario;
  desafio: PreguntaDiaria;
  cartaRecompensaId: string;
  competicion: {
    titulo: string;
    meta: string;
    recompensaVC: number;
  };
  experiencia: {
    titulo: string;
    descripcion: string;
    ruta: string;
  };
}

export interface EventoSemanal {
  id: string;
  tipo: "COLECCIÓN" | "ESCENARIO 3D" | "TORNEO" | "EVENTO MUNDIAL" | "OBJETO LIMITADO";
  titulo: string;
  descripcion: string;
  recompensa: string;
  ruta: string;
  color: string;
}

export const RAREZAS_UNIVERSALES: Record<
  RarezaUniversal,
  { label: string; hex: string; brillo: string; bonoEstudioVC: number }
> = {
  comun:   { label: "COMÚN",   hex: "#38BDF8", brillo: "rgba(56,189,248,0.32)",  bonoEstudioVC: 20 },
  rara:    { label: "RARA",    hex: "#F5C542", brillo: "rgba(245,197,66,0.36)",  bonoEstudioVC: 35 },
  epica:   { label: "ÉPICA",   hex: "#FF8A3D", brillo: "rgba(255,138,61,0.40)",  bonoEstudioVC: 55 },
  leyenda: { label: "LEYENDA", hex: "#FFC94D", brillo: "rgba(255,201,77,0.48)",  bonoEstudioVC: 80 },
  mitica:  { label: "MÍTICA",  hex: "#E879F9", brillo: "rgba(232,121,249,0.52)", bonoEstudioVC: 120 },
};

export const CATEGORIAS_COLECCION: MetaCategoriaColeccion[] = [
  { id: "paises",          titulo: "Países del Mundo",           lema: "Geografía, soberanía y enclaves",      color: "#38BDF8" },
  { id: "civilizaciones",  titulo: "Civilizaciones Históricas",  lema: "Imperios y legados culturales",        color: "#FFC94D" },
  { id: "monumentos",      titulo: "Monumentos",                 lema: "Obras maestras de la humanidad",       color: "#F59E0B" },
  { id: "espacio",         titulo: "Exploraciones Espaciales",   lema: "Misiones más allá de la Tierra",       color: "#A855F7" },
  { id: "fenomenos",       titulo: "Fenómenos Naturales",        lema: "Fuerzas vivas del planeta",            color: "#3DDC97" },
  { id: "ciencia",         titulo: "Descubrimientos Científicos",lema: "Hitos que cambiaron la historia",      color: "#06B6D4" },
  { id: "personajes",      titulo: "Personajes Históricos",      lema: "Líderes, inventores y pensadores",     color: "#FF8A3D" },
  { id: "acontecimientos", titulo: "Acontecimientos Clave",      lema: "Fechas que redibujaron el mapa",       color: "#FF3B30" },
];

export const CARTAS_UNIVERSALES: CartaUniversal[] = [
  // ── 1. PAÍSES ─────────────────────────────────────────────────────────────
  {
    id: "col-pais-do",
    serie: "VG-COL-001",
    categoria: "paises",
    titulo: "República Dominicana",
    subtitulo: "Caribe · Isla La Española",
    rareza: "leyenda",
    epocaOLugar: "18.49° N, 69.93° O · Santo Domingo",
    resumenEducativo: "Primera ciudad europea permanente en América (Santo Domingo, 1498), puente estratégico entre el Atlántico y el Mar Caribe.",
    datoCurioso: "Alberga tanto el punto más alto del Caribe (Pico Duarte, 3,098 m) como el más bajo (Lago Enriquillo, -46 m).",
    costoVC: 0,
    lat: 18.49,
    lng: -69.93,
    preguntaVerificacion: {
      enunciado: "¿Cuál es la cima más alta de las Antillas ubicada en República Dominicana?",
      opciones: ["Pico Turquino", "Pico Duarte", "Cerro Chirripó"],
      correcta: 1,
      recompensaVC: 40,
    },
  },
  {
    id: "col-pais-jp",
    serie: "VG-COL-002",
    categoria: "paises",
    titulo: "Japón",
    subtitulo: "Asia Oriental · Archipiélago del Pacífico",
    rareza: "epica",
    epocaOLugar: "35.68° N, 139.76° E · Tokio",
    resumenEducativo: "Potencia tecnológica en el Cinturón de Fuego del Pacífico, pionera en ingeniería antisísmica, robótica y transporte ferroviario de alta velocidad.",
    datoCurioso: "El Shinkansen mantiene un promedio histórico de retraso inferior al minuto desde su inauguración en 1964.",
    costoVC: 90,
    lat: 35.68,
    lng: 139.76,
    preguntaVerificacion: {
      enunciado: "¿En qué año comenzó a operar la primera línea del tren bala Shinkansen en Japón?",
      opciones: ["1952", "1964", "1978"],
      correcta: 1,
      recompensaVC: 45,
    },
  },
  {
    id: "col-pais-eg",
    serie: "VG-COL-003",
    categoria: "paises",
    titulo: "Egipto",
    subtitulo: "Norte de África / Sinaí · Canal de Suez",
    rareza: "rara",
    epocaOLugar: "30.04° N, 31.23° E · El Cairo",
    resumenEducativo: "Custodio del Canal de Suez, arteria vital por la que transita cerca del 12% del comercio marítimo global entre Europa y Asia.",
    datoCurioso: "El Nilo recorre más de 6,650 km hasta desembocar en el Mediterráneo formando uno de los deltas más fértiles del planeta.",
    costoVC: 70,
    lat: 30.04,
    lng: 31.23,
    preguntaVerificacion: {
      enunciado: "¿Qué mar conecta el Canal de Suez egipcio con el Mar Mediterráneo?",
      opciones: ["Mar Rojo", "Mar Negro", "Mar Caspio"],
      correcta: 0,
      recompensaVC: 35,
    },
  },
  {
    id: "col-pais-ch",
    serie: "VG-COL-004",
    categoria: "paises",
    titulo: "Suiza",
    subtitulo: "Europa Central · Alpes",
    rareza: "rara",
    epocaOLugar: "46.95° N, 7.45° E · Berna / Ginebra",
    resumenEducativo: "Estado alpino con neutralidad armada histórica, sede de organismos internacionales en Ginebra y del CERN en la frontera franco-suiza.",
    datoCurioso: "Sus refugios civiles subterráneos superan el 100% de la población residente y cuatro idiomas nacionales son oficiales.",
    costoVC: 75,
    lat: 46.95,
    lng: 7.45,
    preguntaVerificacion: {
      enunciado: "¿Cuántos idiomas oficiales nacionales reconoce la Confederación Suiza?",
      opciones: ["Dos", "Tres", "Cuatro"],
      correcta: 2,
      recompensaVC: 35,
    },
  },
  {
    id: "col-pais-ua",
    serie: "VG-COL-005",
    categoria: "paises",
    titulo: "Ucrania",
    subtitulo: "Europa del Este · Mar Negro",
    rareza: "epica",
    epocaOLugar: "50.45° N, 30.52° E · Kiev",
    resumenEducativo: "El país íntegramente europeo de mayor superficie territorial y pieza clave en el suministro mundial de trigo, maíz y aceite de girasol.",
    datoCurioso: "Su suelo de chernozem ('tierra negra') es de los más ricos en humus del planeta.",
    costoVC: 100,
    lat: 50.45,
    lng: 30.52,
    preguntaVerificacion: {
      enunciado: "¿Cómo se denomina el característico suelo fértil oscuro de las llanuras ucranianas?",
      opciones: ["Podzol", "Chernozem", "Laterita"],
      correcta: 1,
      recompensaVC: 45,
    },
  },

  // ── 2. CIVILIZACIONES HISTÓRICAS ──────────────────────────────────────────
  {
    id: "col-civ-sumeria",
    serie: "VG-COL-006",
    categoria: "civilizaciones",
    titulo: "Civilización Sumeria",
    subtitulo: "Mesopotamia · Cuna de la Escritura",
    rareza: "leyenda",
    epocaOLugar: "c. 4500 – 1900 a. C. · Entre Tigris y Éufrates",
    resumenEducativo: "Desarrolló las primeras ciudades-estado (Ur, Uruk), la escritura cuneiforme, la rueda y el sistema sexagesimal.",
    datoCurioso: "Todavía medimos la hora en 60 minutos y el círculo en 360 grados gracias al sistema base 60 de los sumerios.",
    costoVC: 0,
    lat: 31.32,
    lng: 45.64,
    preguntaVerificacion: {
      enunciado: "¿Qué base matemática usaron los sumerios que aún rige nuestros relojes?",
      opciones: ["Base 10", "Base 60", "Base 12"],
      correcta: 1,
      recompensaVC: 40,
    },
  },
  {
    id: "col-civ-taina",
    serie: "VG-COL-007",
    categoria: "civilizaciones",
    titulo: "Cultura Taína",
    subtitulo: "Antillas Mayores · Navegantes del Caribe",
    rareza: "epica",
    epocaOLugar: "siglos VII – XVI · Quisqueya / Borikén / Cuba",
    resumenEducativo: "Pueblo arahuaco organizado en cacicazgos con agricultura en conucos, astronomía agrícola y juegos ceremoniales de batey.",
    datoCurioso: "Palabras universales como 'huracán', 'canoa', 'hamaca', 'barbacoa' y 'tabaco' provienen de la lengua taína.",
    costoVC: 85,
    lat: 18.73,
    lng: -70.16,
    preguntaVerificacion: {
      enunciado: "¿Cuál de estas palabras cotidianas tiene origen en la lengua taína?",
      opciones: ["Huracán", "Volcán", "Océano"],
      correcta: 0,
      recompensaVC: 45,
    },
  },
  {
    id: "col-civ-roma",
    serie: "VG-COL-008",
    categoria: "civilizaciones",
    titulo: "Imperio Romano",
    subtitulo: "Cuenca del Mediterráneo",
    rareza: "epica",
    epocaOLugar: "27 a. C. – 476 d. C. (Occidente)",
    resumenEducativo: "Unificó el Mediterráneo mediante calzadas pavimentadas, derecho civil codificado, acueductos y hormigón puzolánico marino.",
    datoCurioso: "El hormigón romano fabricado con ceniza volcánica se vuelve más resistente al reaccionar con el agua del mar.",
    costoVC: 95,
    lat: 41.89,
    lng: 12.49,
    preguntaVerificacion: {
      enunciado: "¿Qué ingrediente volcánico confería autorreparación al hormigón marino romano?",
      opciones: ["Puzolana", "Mármol blanco", "Basalto líquido"],
      correcta: 0,
      recompensaVC: 45,
    },
  },
  {
    id: "col-civ-maya",
    serie: "VG-COL-009",
    categoria: "civilizaciones",
    titulo: "Civilización Maya",
    subtitulo: "Mesoamérica · Astrónomos y Matemáticos",
    rareza: "rara",
    epocaOLugar: "c. 2000 a. C. – 1697 d. C.",
    resumenEducativo: "Concibió independientemente el número cero posicional y elaboró calendarios solares y venusinos de precisión asombrosa.",
    datoCurioso: "Su sistema de escritura jeroglífica combina logogramas con signos silábicos.",
    costoVC: 80,
    lat: 20.68,
    lng: -88.57,
    preguntaVerificacion: {
      enunciado: "¿Qué concepto matemático fundamental empleaban los mayas en su sistema vigesimal?",
      opciones: ["El cero posicional", "Los números imaginarios", "El cálculo infinitesimal"],
      correcta: 0,
      recompensaVC: 40,
    },
  },
  {
    id: "col-civ-han",
    serie: "VG-COL-010",
    categoria: "civilizaciones",
    titulo: "Dinastía Han",
    subtitulo: "China · Ruta de la Seda",
    rareza: "rara",
    epocaOLugar: "202 a. C. – 220 d. C.",
    resumenEducativo: "Abrió la Ruta de la Seda conectando Chang'an con el Mediterráneo y estandarizó la fabricación de papel y el sismoscopio.",
    datoCurioso: "Zhang Heng construyó en el año 132 d. C. un detector de terremotos que señalaba la dirección del temblor lejano.",
    costoVC: 85,
    lat: 34.26,
    lng: 108.94,
    preguntaVerificacion: {
      enunciado: "¿Qué gran corredor comercial terrestre nació durante la Dinastía Han?",
      opciones: ["La Ruta del Ámbar", "La Ruta de la Seda", "La Ruta de las Especias del Cabo"],
      correcta: 1,
      recompensaVC: 40,
    },
  },

  // ── 3. MONUMENTOS ─────────────────────────────────────────────────────────
  {
    id: "col-mon-guiza",
    serie: "VG-COL-011",
    categoria: "monumentos",
    titulo: "Gran Pirámide de Guiza",
    subtitulo: "Única Maravilla Antigua en Pie",
    rareza: "leyenda",
    epocaOLugar: "c. 2560 a. C. · Meseta de Guiza",
    resumenEducativo: "Erigida con ~2.3 millones de bloques calizos para el faraón Keops; fue la estructura humana más alta durante 3,800 años.",
    datoCurioso: "Sus caras están alineadas con los puntos cardinales con un error menor a un quinceavo de grado.",
    costoVC: 110,
    lat: 29.98,
    lng: 31.13,
    preguntaVerificacion: {
      enunciado: "¿Para qué faraón de la IV Dinastía se construyó la Gran Pirámide de Guiza?",
      opciones: ["Tutankamón", "Keops (Jufu)", "Ramsés II"],
      correcta: 1,
      recompensaVC: 50,
    },
  },
  {
    id: "col-mon-alcazar",
    serie: "VG-COL-012",
    categoria: "monumentos",
    titulo: "Alcázar de Colón",
    subtitulo: "Palacio Virreinal del Nuevo Mundo",
    rareza: "epica",
    epocaOLugar: "1511 – 1514 · Ciudad Colonial, Santo Domingo",
    resumenEducativo: "Construido por Diego Colón en piedra coralina sin usar un solo clavo en la estructura original de sus techumbres.",
    datoCurioso: "Desde sus salones se planificaron muchas de las primeras expediciones continentales del siglo XVI.",
    costoVC: 70,
    lat: 18.48,
    lng: -69.88,
    preguntaVerificacion: {
      enunciado: "¿Qué material geológico local compone los muros principales del Alcázar de Colón?",
      opciones: ["Granito rosado", "Piedra coralina", "Pizarra volcánica"],
      correcta: 1,
      recompensaVC: 40,
    },
  },
  {
    id: "col-mon-machu",
    serie: "VG-COL-013",
    categoria: "monumentos",
    titulo: "Machu Picchu",
    subtitulo: "Ciudadela Inca entre las Nubes",
    rareza: "epica",
    epocaOLugar: "c. 1450 · Cusco, Perú (2,430 m s. n. m.)",
    resumenEducativo: "Complejo urbano y agrícola de sillería antisísmica en seco tallada al milímetro sin argamasa.",
    datoCurioso: "El 60% de la obra de ingeniería de Machu Picchu se encuentra bajo tierra en drenajes y cimentaciones de terrazas.",
    costoVC: 95,
    lat: -13.16,
    lng: -72.54,
    preguntaVerificacion: {
      enunciado: "¿Cómo lograban los muros incas resistir fuertes terremotos sin mortero?",
      opciones: ["Sillería en seco con ligera inclinación", "Cadenas de bronce internas", "Cimiento hidráulico romano"],
      correcta: 0,
      recompensaVC: 45,
    },
  },
  {
    id: "col-mon-acropolis",
    serie: "VG-COL-014",
    categoria: "monumentos",
    titulo: "Acrópolis y Partenón",
    subtitulo: "Ciudadela Clásica de Atenas",
    rareza: "rara",
    epocaOLugar: "447 – 432 a. C. · Atenas",
    resumenEducativo: "Cumbre de la arquitectura dórica con correcciones ópticas sutiles para que las columnas parezcan perfectamente rectas a distancia.",
    datoCurioso: "Ni una sola línea de su estilóbato es geométricamente plana: se curva levemente para compensar la ilusión óptica humana.",
    costoVC: 75,
    lat: 37.97,
    lng: 23.73,
    preguntaVerificacion: {
      enunciado: "¿Por qué el Partenón tiene columnas ligeramente abombadas (éntasis) y base curvada?",
      opciones: ["Por hundimiento natural", "Como corrección óptica intencionada", "Para recolectar lluvia"],
      correcta: 1,
      recompensaVC: 35,
    },
  },
  {
    id: "col-mon-muralla",
    serie: "VG-COL-015",
    categoria: "monumentos",
    titulo: "Gran Muralla China",
    subtitulo: "Sistema Defensivo Transcontinental",
    rareza: "epica",
    epocaOLugar: "siglo III a. C. – XVII d. C. · +21,000 km",
    resumenEducativo: "Red continua de murallas, torres de señales con humo y fuego, pasos fortificados y guarniciones a lo largo de la estepa norte.",
    datoCurioso: "En la dinastía Ming se mezcló arroz glutinoso en el mortero de cal para hacerlo mucho más resistente y duradero.",
    costoVC: 100,
    lat: 40.43,
    lng: 116.57,
    preguntaVerificacion: {
      enunciado: "¿Qué ingrediente orgánico se añadió al mortero Ming para reforzar tramos de la Gran Muralla?",
      opciones: ["Arroz glutinoso", "Resina de pino", "Leche de cabra"],
      correcta: 0,
      recompensaVC: 45,
    },
  },

  // ── 4. EXPLORACIONES ESPACIALES ───────────────────────────────────────────
  {
    id: "col-esp-apolo11",
    serie: "VG-COL-016",
    categoria: "espacio",
    titulo: "Misión Apolo 11",
    subtitulo: "Primer Alunizaje Tripulado",
    rareza: "mitica",
    epocaOLugar: "20 de julio de 1969 · Mar de la Tranquilidad",
    resumenEducativo: "Armstrong, Aldrin y Collins demostraron el descenso lunar en órbita con una computadora AGC de apenas ~72 KB de memoria fija.",
    datoCurioso: "Un interruptor roto del módulo lunar Eagle se activó usando la punta de un bolígrafo de fieltro para poder despegar de la Luna.",
    costoVC: 130,
    lat: 28.57,
    lng: -80.65,
    preguntaVerificacion: {
      enunciado: "¿En qué región lunar descendió el módulo Eagle de la misión Apolo 11?",
      opciones: ["Cráter Tycho", "Mar de la Tranquilidad", "Océano de las Tormentas"],
      correcta: 1,
      recompensaVC: 60,
    },
  },
  {
    id: "col-esp-voyager1",
    serie: "VG-COL-017",
    categoria: "espacio",
    titulo: "Sonda Voyager 1",
    subtitulo: "Emisaria en el Espacio Interestelar",
    rareza: "leyenda",
    epocaOLugar: "Lanzada 1977 · >24,000 millones de km",
    resumenEducativo: "El objeto artificial más alejado de la Tierra; capturó el retrato 'Un Punto Azul Pálido' antes de cruzar la heliopausa.",
    datoCurioso: "Lleva un Disco de Oro con saludos en 55 idiomas y música terrestre pensados para durar más de mil millones de años.",
    costoVC: 0,
    preguntaVerificacion: {
      enunciado: "¿Cómo se titula la célebre fotografía de la Tierra tomada por Voyager 1 a 6,000 millones de km?",
      opciones: ["Amanecer Terrestre", "Un Punto Azul Pálido", "Canica Azul"],
      correcta: 1,
      recompensaVC: 45,
    },
  },
  {
    id: "col-esp-jwst",
    serie: "VG-COL-018",
    categoria: "espacio",
    titulo: "Telescopio James Webb",
    subtitulo: "Observatorio Infrarrojo en L2",
    rareza: "epica",
    epocaOLugar: "Lanzado dic. 2021 · 1.5 millones de km",
    resumenEducativo: "Espejo segmentado de 6.5 metros recubierto de oro que observa las primeras galaxias nacidas tras el Big Bang y atmósferas exoplanetarias.",
    datoCurioso: "Su parasol de cinco capas de Kapton mantiene los instrumentos a -233 °C mientras el lado expuesto al Sol supera +85 °C.",
    costoVC: 105,
    preguntaVerificacion: {
      enunciado: "¿En qué punto gravitatorio del sistema Sol-Tierra orbita el telescopio James Webb?",
      opciones: ["Órbita geoestacionaria", "Punto de Lagrange L2", "Órbita lunar baja"],
      correcta: 1,
      recompensaVC: 45,
    },
  },
  {
    id: "col-esp-perseverance",
    serie: "VG-COL-019",
    categoria: "espacio",
    titulo: "Rover Perseverance & Ingenuity",
    subtitulo: "Vuelo y Astrobiología en Marte",
    rareza: "epica",
    epocaOLugar: "Aterrizaje feb. 2021 · Cráter Jezero, Marte",
    resumenEducativo: "Recoge muestras geológicas de un antiguo delta fluvial marciano y desplegó el helicóptero Ingenuity, primer vuelo controlado en otro planeta.",
    datoCurioso: "Su instrumento MOXIE produjo oxígeno respirable directamente a partir del CO₂ de la atmósfera marciana.",
    costoVC: 95,
    preguntaVerificacion: {
      enunciado: "¿Qué logro histórico alcanzó el pequeño helicóptero Ingenuity en Marte?",
      opciones: ["Primer vuelo propulsado en otro planeta", "Primera perforación profunda de 1 km", "Primer enlace láser con Plutón"],
      correcta: 0,
      recompensaVC: 45,
    },
  },
  {
    id: "col-esp-iss",
    serie: "VG-COL-020",
    categoria: "espacio",
    titulo: "Estación Espacial Internacional",
    subtitulo: "Laboratorio Orbital Cooperativo",
    rareza: "rara",
    epocaOLugar: "En órbita desde 1998 · ~408 km altitud",
    resumenEducativo: "Mantenida habitada de forma ininterrumpida desde noviembre del año 2000 orbitando la Tierra a 27,600 km/h (16 amaneceres cada día).",
    datoCurioso: "Los astronautas experimentan aproximadamente 90 minutos por cada vuelta completa alrededor del planeta.",
    costoVC: 80,
    preguntaVerificacion: {
      enunciado: "¿Cuántos amaneceres presencian aproximadamente los astronautas de la EEI en 24 horas?",
      opciones: ["2", "8", "16"],
      correcta: 2,
      recompensaVC: 35,
    },
  },

  // ── 5. FENÓMENOS NATURALES ────────────────────────────────────────────────
  {
    id: "col-fen-aurora",
    serie: "VG-COL-021",
    categoria: "fenomenos",
    titulo: "Aurora Boreal y Austral",
    subtitulo: "Viento Solar vs Magnetosfera",
    rareza: "epica",
    epocaOLugar: "90 – 300 km de altura · Óvalos Polares",
    resumenEducativo: "Partículas cargadas solares guiadas por el campo magnético terrestre excitan oxígeno y nitrógeno en la alta atmósfera liberando fotones.",
    datoCurioso: "El verde brillante proviene del oxígeno atómico alrededor de 100 km, mientras los tonos violeta son de nitrógeno molecular.",
    costoVC: 85,
    lat: 69.65,
    lng: 18.96,
    preguntaVerificacion: {
      enunciado: "¿Qué gas atmosférico produce el característico color verde más frecuente en las auroras?",
      opciones: ["Helio", "Oxígeno atómico", "Argón"],
      correcta: 1,
      recompensaVC: 40,
    },
  },
  {
    id: "col-fen-fuego",
    serie: "VG-COL-022",
    categoria: "fenomenos",
    titulo: "Cinturón de Fuego del Pacífico",
    subtitulo: "Frontera Tectónica de 40,000 km",
    rareza: "leyenda",
    epocaOLugar: "Cuenca del Océano Pacífico",
    resumenEducativo: "Herradura volcánica y de subducción tectónica donde se concentra ~90% de los terremotos mundiales y ~75% de los volcanes activos.",
    datoCurioso: "Incluye la Fosa de las Marianas, donde el Abismo Challenger alcanza casi 11,000 metros bajo el nivel del mar.",
    costoVC: 100,
    lat: 35.36,
    lng: 138.73,
    preguntaVerificacion: {
      enunciado: "¿Qué porcentaje aproximado de los terremotos del mundo ocurre en el Cinturón de Fuego del Pacífico?",
      opciones: ["Alrededor del 30%", "Alrededor del 90%", "Menos del 15%"],
      correcta: 1,
      recompensaVC: 45,
    },
  },
  {
    id: "col-fen-golfo",
    serie: "VG-COL-023",
    categoria: "fenomenos",
    titulo: "Corriente del Golfo",
    subtitulo: "Motor Térmico del Atlántico Norte",
    rareza: "rara",
    epocaOLugar: "Golfo de México → Atlántico Norte",
    resumenEducativo: "Gigantesca corriente oceánica cálida que transporta calor desde los trópicos hacia Europa Occidental regulando sus inviernos.",
    datoCurioso: "Mueve más volumen de agua por segundo que todos los ríos del planeta juntos.",
    costoVC: 70,
    lat: 26.0,
    lng: -79.5,
    preguntaVerificacion: {
      enunciado: "¿Qué efecto climático principal ejerce la Corriente del Golfo sobre Europa Occidental?",
      opciones: ["Hace sus inviernos más templados que latitudes equivalentes de Canadá", "Congela el Mar del Norte todo el año", "Causa desertificación en Irlanda"],
      correcta: 0,
      recompensaVC: 35,
    },
  },
  {
    id: "col-fen-yellowstone",
    serie: "VG-COL-024",
    categoria: "fenomenos",
    titulo: "Caldera Geotérmica de Yellowstone",
    subtitulo: "Sistema Hidrotermal Continental",
    rareza: "epica",
    epocaOLugar: "44.43° N, 110.59° O · Wyoming",
    resumenEducativo: "Alberga más de la mitad de todos los géiseres activos del planeta alimentados por una cámara magmática continental monitorizada 24/7.",
    datoCurioso: "Los colores vivos de la Gran Fuente Prismática se deben a tapetes de bacterias termófilas que viven en agua casi hirviendo.",
    costoVC: 90,
    lat: 44.43,
    lng: -110.59,
    preguntaVerificacion: {
      enunciado: "¿Qué origina los anillos multicolores de la Gran Fuente Prismática en Yellowstone?",
      opciones: ["Microorganismos termófilos pigmentados", "Reflexión de minerales lunares", "Vertidos industriales"],
      correcta: 0,
      recompensaVC: 40,
    },
  },
  {
    id: "col-fen-monzon",
    serie: "VG-COL-025",
    categoria: "fenomenos",
    titulo: "Sistema de Monzones Asiáticos",
    subtitulo: "Inversión Estacional de Vientos",
    rareza: "comun",
    epocaOLugar: "Océano Índico & Sur de Asia",
    resumenEducativo: "Cambio estacional de vientos por la diferencia térmica entre tierra y mar que sustenta la agricultura de más de dos mil millones de personas.",
    datoCurioso: "Mawsynram, en el noreste de India, registra lluvias medias cercanas a 11,800 mm al año por el relieve del monzón.",
    costoVC: 60,
    lat: 25.3,
    lng: 91.58,
    preguntaVerificacion: {
      enunciado: "¿Cuál es el mecanismo físico básico que dispara los monzones estacionales?",
      opciones: ["La diferencia de calentamiento entre continentes y océanos", "Las mareas lunares", "Los asteroides ecuatoriales"],
      correcta: 0,
      recompensaVC: 30,
    },
  },

  // ── 6. DESCUBRIMIENTOS CIENTÍFICOS ────────────────────────────────────────
  {
    id: "col-cie-adn",
    serie: "VG-COL-026",
    categoria: "ciencia",
    titulo: "Doble Hélice del ADN",
    subtitulo: "Código de la Herencia Biológica",
    rareza: "leyenda",
    epocaOLugar: "1953 · Difracción de Rayos X (Fotografía 51)",
    resumenEducativo: "Rosalind Franklin, Maurice Wilkins, James Watson y Francis Crick elucidaron cómo el ADN almacena y replica las instrucciones de la vida.",
    datoCurioso: "Si desenrollaras el ADN de todas las células de un solo cuerpo humano, abarcaría miles de millones de kilómetros.",
    costoVC: 100,
    lat: 52.2,
    lng: 0.12,
    preguntaVerificacion: {
      enunciado: "¿Qué investigadora obtuvo la decisiva Fotografía 51 de difracción de rayos X del ADN?",
      opciones: ["Marie Curie", "Rosalind Franklin", "Ada Lovelace"],
      correcta: 1,
      recompensaVC: 50,
    },
  },
  {
    id: "col-cie-penicilina",
    serie: "VG-COL-027",
    categoria: "ciencia",
    titulo: "Descubrimiento de la Penicilina",
    subtitulo: "Nacimiento de la Era Antibiótica",
    rareza: "epica",
    epocaOLugar: "1928 · Alexander Fleming / Oxford",
    resumenEducativo: "Un hongo Penicillium contaminó una placa de cultivo e inhibió bacterias alrededor, iniciando una revolución médica que salvó cientos de millones de vidas.",
    datoCurioso: "Howard Florey y Ernst Chain lograron purificarla y escalar su producción en masa durante la década de 1940.",
    costoVC: 80,
    lat: 51.52,
    lng: -0.17,
    preguntaVerificacion: {
      enunciado: "¿En qué año observó Alexander Fleming el efecto antibacteriano del hongo Penicillium?",
      opciones: ["1914", "1928", "1945"],
      correcta: 1,
      recompensaVC: 40,
    },
  },
  {
    id: "col-cie-relatividad",
    serie: "VG-COL-028",
    categoria: "ciencia",
    titulo: "Relatividad General",
    subtitulo: "Geometría del Espacio-Tiempo",
    rareza: "mitica",
    epocaOLugar: "1915 · Albert Einstein",
    resumenEducativo: "Describió la gravedad como la curvatura del tejido espacio-tiempo causada por la masa y la energía, prediciendo lentes gravitacionales y ondas.",
    datoCurioso: "Sin corregir la dilatación temporal relativista de los satélites GPS, la navegación civil acumularía kilómetros de error al día.",
    costoVC: 120,
    preguntaVerificacion: {
      enunciado: "¿Qué tecnología cotidiana fallaría rápidamente sin correcciones de la Relatividad?",
      opciones: ["El posicionamiento por satélite GPS", "La bombilla incandescente", "El motor diésel"],
      correcta: 0,
      recompensaVC: 55,
    },
  },
  {
    id: "col-cie-higgs",
    serie: "VG-COL-029",
    categoria: "ciencia",
    titulo: "Bosón de Higgs (CERN)",
    subtitulo: "Origen de la Masa Elemental",
    rareza: "epica",
    epocaOLugar: "4 de julio de 2012 · LHC, Ginebra",
    resumenEducativo: "Confirmado en un anillo superconductor subterráneo de 27 km en el CERN, validando el campo cuántico que otorga masa a partículas elementales.",
    datoCurioso: "Los imanes del LHC operan enfriados con helio líquido a 1.9 Kelvin, más fríos que el espacio interestelar.",
    costoVC: 95,
    lat: 46.23,
    lng: 6.05,
    preguntaVerificacion: {
      enunciado: "¿Qué longitud aproximada tiene el anillo acelerador del LHC donde se descubrió el bosón de Higgs?",
      opciones: ["2.7 km", "27 km", "270 km"],
      correcta: 1,
      recompensaVC: 45,
    },
  },
  {
    id: "col-cie-fusion",
    serie: "VG-COL-030",
    categoria: "ciencia",
    titulo: "Fusión Nuclear Magnética",
    subtitulo: "Energía de las Estrellas en la Tierra",
    rareza: "rara",
    epocaOLugar: "Siglo XX – XXI · Tokamaks & Láseres",
    resumenEducativo: "Combina núcleos ligeros de deuterio y tritio confinados a más de 100 millones de grados para liberar energía limpia sin emisiones de carbono.",
    datoCurioso: "La palabra 'Tokamak' proviene de un acrónimo ruso para cámara toroidal con bobinas magnéticas.",
    costoVC: 80,
    lat: 43.71,
    lng: 5.76,
    preguntaVerificacion: {
      enunciado: "¿Qué fuerza mantiene confinado el plasma ultracaliente dentro de un reactor tipo Tokamak?",
      opciones: ["Campos magnéticos intensos", "Agua pesada a presión", "Gravedad artificial"],
      correcta: 0,
      recompensaVC: 40,
    },
  },

  // ── 7. PERSONAJES HISTÓRICOS ──────────────────────────────────────────────
  {
    id: "col-per-duarte",
    serie: "VG-COL-031",
    categoria: "personajes",
    titulo: "Juan Pablo Duarte",
    subtitulo: "Padre de la Patria Dominicana",
    rareza: "leyenda",
    epocaOLugar: "1813 – 1876 · Santo Domingo",
    resumenEducativo: "Fundó la sociedad secreta La Trinitaria (1838) y redactó un proyecto constitucional de vanguardia democrática basado en igualdad ante la ley.",
    datoCurioso: "Entregó toda su fortuna familiar para financiar las campañas de independencia sin exigir jamás cargo ni salario alguno.",
    costoVC: 0,
    lat: 18.47,
    lng: -69.89,
    preguntaVerificacion: {
      enunciado: "¿Cómo se llamó la sociedad secreta fundada por Juan Pablo Duarte en 1838?",
      opciones: ["La Filantrópica", "La Trinitaria", "Los Febreristas"],
      correcta: 1,
      recompensaVC: 45,
    },
  },
  {
    id: "col-per-curie",
    serie: "VG-COL-032",
    categoria: "personajes",
    titulo: "Marie Skłodowska-Curie",
    subtitulo: "Doble Premio Nobel en Física y Química",
    rareza: "mitica",
    epocaOLugar: "1867 – 1934 · Varsovia / París",
    resumenEducativo: "Aisló el polonio y el radio, acuñó el término 'radiactividad' y desplegó ambulancias móviles de rayos X en los hospitales de campaña.",
    datoCurioso: "Sigue siendo la única persona en la historia que ha ganado Premios Nobel en dos ciencias naturales distintas.",
    costoVC: 115,
    lat: 48.84,
    lng: 2.34,
    preguntaVerificacion: {
      enunciado: "¿Cuáles son los dos campos científicos en los que Marie Curie recibió el Premio Nobel?",
      opciones: ["Medicina y Física", "Física y Química", "Química y Astronomía"],
      correcta: 1,
      recompensaVC: 55,
    },
  },
  {
    id: "col-per-davinci",
    serie: "VG-COL-033",
    categoria: "personajes",
    titulo: "Leonardo da Vinci",
    subtitulo: "Polímata del Renacimiento",
    rareza: "epica",
    epocaOLugar: "1452 – 1519 · Florencia / Amboise",
    resumenEducativo: "Unió anatomía, hidráulica, óptica, pintura e ingeniería militar en miles de folios con escritura especular de derecha a izquierda.",
    datoCurioso: "Diseñó puentes autoportantes, paracaídas piramidales y estudios de turbulencia de fluidos siglos antes de la aviación.",
    costoVC: 95,
    lat: 43.77,
    lng: 11.25,
    preguntaVerificacion: {
      enunciado: "¿Qué peculiaridad tienen los cuadernos manuscritos de Leonardo da Vinci?",
      opciones: ["Están escritos al revés (escritura especular)", "Están grabados en placas de cobre", "Solo contienen cifras binarias"],
      correcta: 0,
      recompensaVC: 40,
    },
  },
  {
    id: "col-per-lovelace",
    serie: "VG-COL-034",
    categoria: "personajes",
    titulo: "Ada Lovelace",
    subtitulo: "Primera Programadora de la Historia",
    rareza: "epica",
    epocaOLugar: "1815 – 1852 · Londres",
    resumenEducativo: "En 1843 publicó el primer algoritmo concebido para la Máquina Analítica de Babbage y visionó que las máquinas procesarían música y símbolos.",
    datoCurioso: "Advirtió un siglo antes de la informática moderna que la computación universal iría mucho más allá del simple cálculo aritmético.",
    costoVC: 90,
    lat: 51.51,
    lng: -0.14,
    preguntaVerificacion: {
      enunciado: "¿Para qué máquina proyectada por Charles Babbage escribió Ada Lovelace su célebre algoritmo?",
      opciones: ["Máquina Analítica", "Enigma", "Colossus"],
      correcta: 0,
      recompensaVC: 45,
    },
  },
  {
    id: "col-per-mandela",
    serie: "VG-COL-035",
    categoria: "personajes",
    titulo: "Nelson Mandela",
    subtitulo: "Símbolo de Reconciliación y Derechos Civiles",
    rareza: "rara",
    epocaOLugar: "1918 – 2013 · Sudáfrica",
    resumenEducativo: "Tras 27 años de prisión lideró el desmantelamiento pacífico del apartheid y una transición constitucional democrática sin guerra civil.",
    datoCurioso: "Recibió el Premio Nobel de la Paz en 1993 antes de ser elegido presidente democrático en 1994.",
    costoVC: 80,
    lat: -33.8,
    lng: 18.37,
    preguntaVerificacion: {
      enunciado: "¿Cuántos años permaneció encarcelado Nelson Mandela antes de su liberación en 1990?",
      opciones: ["12 años", "27 años", "40 años"],
      correcta: 1,
      recompensaVC: 35,
    },
  },

  // ── 8. ACONTECIMIENTOS IMPORTANTES ────────────────────────────────────────
  {
    id: "col-aco-berlin",
    serie: "VG-COL-036",
    categoria: "acontecimientos",
    titulo: "Caída del Muro de Berlín",
    subtitulo: "Fin Simbólico de la Guerra Fría",
    rareza: "leyenda",
    epocaOLugar: "9 de noviembre de 1989 · Berlín",
    resumenEducativo: "Tras 28 años dividiendo una ciudad entera y a Europa en dos bloques, la apertura pacífica de los pasos fronterizos transformó el orden global.",
    datoCurioso: "Un anuncio impreciso sobre efecto inmediato durante una rueda de prensa precipitó la concentración multitudinaria esa misma noche.",
    costoVC: 0,
    lat: 52.52,
    lng: 13.38,
    preguntaVerificacion: {
      enunciado: "¿En qué fecha histórica cayó el Muro de Berlín?",
      opciones: ["9 de noviembre de 1989", "4 de julio de 1991", "1 de enero de 1985"],
      correcta: 0,
      recompensaVC: 45,
    },
  },
  {
    id: "col-aco-imprenta",
    serie: "VG-COL-037",
    categoria: "acontecimientos",
    titulo: "Imprenta de Tipos Móviles",
    subtitulo: "Democratización Global del Saber",
    rareza: "epica",
    epocaOLugar: "c. 1440 · Johannes Gutenberg, Maguncia",
    resumenEducativo: "Al combinar aleación metálica reutilizable, tinta oleosa y prensa de tornillo, redujo drásticamente el coste de los libros en toda Europa.",
    datoCurioso: "En solo 50 años ya funcionaban imprentas en más de 250 ciudades europeas produciendo millones de ejemplares.",
    costoVC: 85,
    lat: 50.0,
    lng: 8.27,
    preguntaVerificacion: {
      enunciado: "¿En qué ciudad alemana perfeccionó Johannes Gutenberg la imprenta europea de tipos móviles metálicos?",
      opciones: ["Múnich", "Maguncia (Mainz)", "Hamburgo"],
      correcta: 1,
      recompensaVC: 40,
    },
  },
  {
    id: "col-aco-wright",
    serie: "VG-COL-038",
    categoria: "acontecimientos",
    titulo: "Primer Vuelo Controlado (1903)",
    subtitulo: "Inicio de la Era Aeronáutica",
    rareza: "rara",
    epocaOLugar: "17 de diciembre de 1903 · Kitty Hawk",
    resumenEducativo: "Orville y Wilbur Wright lograron cuatro vuelos motorizados, sostenidos y controlados en los tres ejes aerodinámicos en Carolina del Norte.",
    datoCurioso: "Solo 66 años separan los 12 segundos del primer vuelo del Flyer I de las primeras huellas humanas en la Luna.",
    costoVC: 75,
    lat: 36.02,
    lng: -75.67,
    preguntaVerificacion: {
      enunciado: "¿Cuántos segundos duró el histórico primer vuelo de Orville Wright en diciembre de 1903?",
      opciones: ["12 segundos", "3 minutos", "45 segundos"],
      correcta: 0,
      recompensaVC: 35,
    },
  },
  {
    id: "col-aco-onu",
    serie: "VG-COL-039",
    categoria: "acontecimientos",
    titulo: "Fundación de la ONU (1945)",
    subtitulo: "Arquitectura del Derecho Internacional",
    rareza: "rara",
    epocaOLugar: "24 de octubre de 1945 · San Francisco",
    resumenEducativo: "51 Estados fundadores firmaron la Carta de las Naciones Unidas buscando prevenir conflictos globales mediante cooperación multilateral.",
    datoCurioso: "La Carta establece la Corte Internacional de Justicia en La Haya como principal órgano judicial internacional.",
    costoVC: 75,
    lat: 40.75,
    lng: -73.97,
    preguntaVerificacion: {
      enunciado: "¿Cuántos Estados fundadores firmaron originalmente la Carta de las Naciones Unidas en 1945?",
      opciones: ["193", "51", "27"],
      correcta: 1,
      recompensaVC: 35,
    },
  },
  {
    id: "col-aco-1492",
    serie: "VG-COL-040",
    categoria: "acontecimientos",
    titulo: "Encuentro Transatlántico (1492)",
    subtitulo: "Conexión Permanente de Dos Hemisferios",
    rareza: "epica",
    epocaOLugar: "Octubre – Diciembre de 1492 · Caribe",
    resumenEducativo: "El cruce atlántico dio inicio al Intercambio Colombino global de cultivos (papa, maíz, cacao, café), lenguas y rutas marítimas oceánicas.",
    datoCurioso: "Cultivos originarios de América como el tomate, la papa y el maíz transformaron para siempre las dietas de Europa, África y Asia.",
    costoVC: 90,
    lat: 19.79,
    lng: -70.69,
    preguntaVerificacion: {
      enunciado: "¿Cuál de estos alimentos esenciales es originario de América y viajó al resto del mundo tras 1492?",
      opciones: ["El trigo", "La papa y el maíz", "La aceituna"],
      correcta: 1,
      recompensaVC: 40,
    },
  },
];

// ── MARKETPLACE ÉTICO DE VANGUARD (7 CATEGORÍAS EXACTAS) ────────────────────
export const CATEGORIAS_MARKETPLACE: {
  id: CategoriaMarketplace;
  titulo: string;
  subtitulo: string;
  modelo: string;
}[] = [
  { id: "avatares",    titulo: "1. Avatares Exclusivos",  subtitulo: "Personajes, vestimentas y accesorios digitales",    modelo: "Compra digital" },
  { id: "insignias",   titulo: "2. Insignias",            subtitulo: "Colecciones, títulos y reconocimientos",           modelo: "Compra digital" },
  { id: "temas",       titulo: "3. Temas Premium",        subtitulo: "Interfaces, efectos y personalización en vivo",    modelo: "Compra digital" },
  { id: "mundos",      titulo: "4. Mundos Digitales",     subtitulo: "Escenarios, planetas y espacios 3D desbloqueables",modelo: "Compra digital" },
  { id: "musica",      titulo: "5. Música Original",      subtitulo: "Bandas sonoras y colecciones musicales en vivo",   modelo: "Compra digital" },
  { id: "base",        titulo: "6. Base Personal",        subtitulo: "Espacios privados personalizables y vitrina",       modelo: "Compra digital" },
  { id: "suscripcion", titulo: "7. VANGUARD+ Premium",    subtitulo: "Suscripción mensual transparente (100% cosmética)", modelo: "Mensual" },
];

export const ITEMS_MARKETPLACE: ItemMarketplace[] = [
  // 1. AVATARES EXCLUSIVOS
  {
    id: "av-polaris",
    categoria: "avatares",
    nombre: "Traje Polaris Comando",
    descripcion: "Indumentaria táctica negra y oro Polaris con visor fotocrómico digital.",
    modelo: "Compra digital (VC)",
    precioVC: 160,
    color: "#FFC94D",
    badge: "AVATAR · ORO",
    avatarCodigo: "POLARIS-CMD",
  },
  {
    id: "av-orbital",
    categoria: "avatares",
    nombre: "Astronauta Orbital EX-7",
    descripcion: "Casco presurizado con telemetría HUD para exploradores de misiones espaciales.",
    modelo: "Compra digital (VC)",
    precioVC: 210,
    color: "#A855F7",
    badge: "AVATAR · ESPACIO",
    avatarCodigo: "ORBITAL-EX7",
  },
  {
    id: "av-cartografo",
    categoria: "avatares",
    nombre: "Cartógrafo del Archivo",
    descripcion: "Gabardina técnica cian con brújula holográfica y dossier digital.",
    modelo: "Compra digital (VC)",
    precioVC: 140,
    color: "#38BDF8",
    badge: "AVATAR · SABER",
    avatarCodigo: "ARCHIVIST-01",
  },
  // 2. INSIGNIAS
  {
    id: "ins-trinitaria",
    categoria: "insignias",
    nombre: "Emblema Estrella Polar",
    descripcion: "Insignia oficial de los primeros guardianes del Diario Universal VANGUARD.",
    modelo: "Compra digital (VC)",
    precioVC: 90,
    color: "#FFC94D",
    badge: "INSIGNIA",
    insigniaTexto: "★ ESTRELLA POLAR",
  },
  {
    id: "ins-cronista",
    categoria: "insignias",
    nombre: "Cronista Global",
    descripcion: "Título honorífico por investigaciones educativas y lectura sin pausa.",
    modelo: "Compra digital (VC)",
    precioVC: 120,
    color: "#3DDC97",
    badge: "TÍTULO",
    insigniaTexto: "◆ CRONISTA GLOBAL",
  },
  {
    id: "ins-cosmos",
    categoria: "insignias",
    nombre: "Observador del Cosmos",
    descripcion: "Distintivo violeta para coleccionistas de exploraciones espaciales y ciencia.",
    modelo: "Compra digital (VC)",
    precioVC: 150,
    color: "#E879F9",
    badge: "COLECCIÓN",
    insigniaTexto: "✦ COSMOS",
  },
  // 3. TEMAS PREMIUM (cambian el tema real en vivo)
  {
    id: "tem-oro",
    categoria: "temas",
    nombre: "VANGUARD Oro Nocturno (Clásico)",
    descripcion: "Paleta maestra oro polaris y cian táctico sobre obsidiana.",
    modelo: "Compra digital (VC)",
    precioVC: 0,
    color: "#FFC94D",
    badge: "INCLUIDO",
    temaCss: "oro",
  },
  {
    id: "tem-ciber",
    categoria: "temas",
    nombre: "Neón Cibernético",
    descripcion: "Acento eléctrico cian y magenta para consolas nocturnas de alta densidad.",
    modelo: "Compra digital (VC)",
    precioVC: 180,
    color: "#00F5D4",
    badge: "TEMA EN VIVO",
    temaCss: "ciber",
  },
  {
    id: "tem-esmeralda",
    categoria: "temas",
    nombre: "Matriz Esmeralda",
    descripcion: "Interfaz verde radar estilo centro de comando espacial y satélites.",
    modelo: "Compra digital (VC)",
    precioVC: 180,
    color: "#00FFA3",
    badge: "TEMA EN VIVO",
    temaCss: "esmeralda",
  },
  {
    id: "tem-carmesí",
    categoria: "temas",
    nombre: "Carmesí Imperial",
    descripcion: "Contraste rubí de sala de crisis con marcos bronce y luz cálida.",
    modelo: "Compra digital (VC)",
    precioVC: 200,
    color: "#FF4D5A",
    badge: "TEMA EN VIVO",
    temaCss: "carmesi",
  },
  // 4. MUNDOS DIGITALES / ESCENARIOS 3D
  {
    id: "mun-pacifico",
    categoria: "mundos",
    nombre: "Archipiélago del Pacífico 3D",
    descripcion: "Escenario volcánico costero navegable y listo para simulaciones en /teatro-3d.",
    modelo: "Compra digital (VC)",
    precioVC: 170,
    color: "#38BDF8",
    badge: "ESCENARIO 3D",
    coords3D: { lat: 35.68, lng: 139.76, nombre: "Bahía del Pacífico" },
  },
  {
    id: "mun-alpes",
    categoria: "mundos",
    nombre: "Fortaleza Alpina 3D",
    descripcion: "Relieve montañoso nevado con pasos estrechos y elevación de alta cota.",
    modelo: "Compra digital (VC)",
    precioVC: 190,
    color: "#E2E8F0",
    badge: "ESCENARIO 3D",
    coords3D: { lat: 46.55, lng: 7.98, nombre: "Cumbres Alpinas" },
  },
  {
    id: "mun-caribe",
    categoria: "mundos",
    nombre: "Bastión del Caribe 3D",
    descripcion: "Escenario marítimo tropical con radares costeros y corredores insulares.",
    modelo: "Compra digital (VC)",
    precioVC: 150,
    color: "#FFC94D",
    badge: "ESCENARIO 3D",
    coords3D: { lat: 18.42, lng: -70.03, nombre: "Bastión Caribe VANGUARD" },
  },
  // 5. MÚSICA ORIGINAL (sintetizador WebAudio en vivo)
  {
    id: "mus-orbital",
    categoria: "musica",
    nombre: "Obertura: Pulso Orbital",
    descripcion: "Banda sonora ambiental en Re menor con arpegios lentos para estudio y lectura.",
    modelo: "Compra digital (VC)",
    precioVC: 110,
    color: "#A855F7",
    badge: "AUDIO EN VIVO",
    frecuenciaHz: 146.83,
    acordes: [146.83, 174.61, 220.0, 293.66],
  },
  {
    id: "mus-dorado",
    categoria: "musica",
    nombre: "Horizonte Dorado VANGUARD",
    descripcion: "Tema épico cálido en Do sostenido / Sol para explorar colecciones del mundo.",
    modelo: "Compra digital (VC)",
    precioVC: 130,
    color: "#FFC94D",
    badge: "AUDIO EN VIVO",
    frecuenciaHz: 130.81,
    acordes: [130.81, 164.81, 196.0, 261.63],
  },
  {
    id: "mus-bunker",
    categoria: "musica",
    nombre: "Búnker Nocturno · Concentración",
    descripcion: "Drone armónico profundo pensado para sesiones tácticas y análisis OSINT.",
    modelo: "Compra digital (VC)",
    precioVC: 120,
    color: "#38BDF8",
    badge: "AUDIO EN VIVO",
    frecuenciaHz: 110.0,
    acordes: [110.0, 130.81, 164.81, 220.0],
  },
  // 6. BASE PERSONAL
  {
    id: "bas-observatorio",
    categoria: "base",
    nombre: "Bóveda Observatorio Orbital",
    descripcion: "Espacio privado con cúpula estelar y vitrina iluminada para 6 cartas.",
    modelo: "Compra digital (VC)",
    precioVC: 0,
    color: "#38BDF8",
    badge: "INCLUIDA",
    estiloBase: "observatorio",
  },
  {
    id: "bas-galeria",
    categoria: "base",
    nombre: "Galería Museo Imperial",
    descripcion: "Sala privada en mármol oscuro con focos dorados para exhibir colecciones.",
    modelo: "Compra digital (VC)",
    precioVC: 220,
    color: "#FFC94D",
    badge: "ESPACIO PRIVADO",
    estiloBase: "galeria-oro",
  },
  {
    id: "bas-holo",
    categoria: "base",
    nombre: "Santuario Holográfico Neon",
    descripcion: "Cabina privada ciber-acústica con suelo de rejilla luminosa.",
    modelo: "Compra digital (VC)",
    precioVC: 240,
    color: "#E879F9",
    badge: "ESPACIO PRIVADO",
    estiloBase: "santuario-neon",
  },
  // 7. SUSCRIPCIÓN PREMIUM (100% COSMÉTICA Y EXPERIENCIAS)
  {
    id: "sub-vanguard-plus",
    categoria: "suscripcion",
    nombre: "Pase Experiencia VANGUARD+ (Simulación Cosmética)",
    descripcion: "Incluye acceso anticipado a colecciones culturales, marcos de vitrina ampliados y pistas musicales. Garantía absoluta: cero ventajas competitivas y cero recompensas aleatorias de pago.",
    modelo: "Suscripción mensual (Cosmética)",
    precioVC: 450,
    precioUsdRef: "$4.99 / mes (cuando se habilite pasarela)",
    color: "#FFC94D",
    badge: "MENSUAL · ÉTICO",
  },
];

// ── EL SISTEMA DIARIO SIN FOMO (ROTACIÓN DIARIA + ARCHIVO ACCESIBLE) ───────
export const CICLO_DIARIO_7: Omit<PaqueteDiario, "indiceCiclo" | "etiquetaDia">[] = [
  {
    mision: {
      id: "mis-1",
      titulo: "Explora el Teatro Global 3D/2D y fija un objetivo",
      descripcion: "Abre el motor táctico VANGUARD 3D/2D y prueba cualquier ciudad del planeta.",
      accionLabel: "Ir a #1 TEATRO 3D",
      rutaDestino: "/teatro-3d",
      recompensaVC: 60,
    },
    acontecimiento: {
      id: "aco-1",
      titulo: "Rutas Marítimas y Estrechos Críticos del Comercio",
      fechaReferencia: "Análisis Geo-Económico",
      contexto: "Más del 80% del volumen del comercio mundial navega por corredores marítimos como Suez, Malaca, Ormuz y el Canal de Panamá.",
      porQueImporta: "Cualquier incidente en un estrecho repercute en días sobre la energía, los microchips y el coste de alimentos en todos los continentes.",
      rutaRelacionada: "/novedades?funcion=impacto-suministros",
    },
    desafio: {
      id: "qz-1",
      tema: "Geopolítica Marítima",
      pregunta: "¿Qué estrecho separa la península arábiga de Irán y concentra cerca de una quinta parte del petróleo marítimo?",
      opciones: ["Estrecho de Ormuz", "Estrecho de Gibraltar", "Estrecho de Bering"],
      correcta: 0,
      explicacion: "El Estrecho de Ormuz conecta el Golfo Pérsico con el Golfo de Omán y es uno de los puntos energéticos más vigilados de la Tierra.",
      recompensaVC: 45,
    },
    cartaRecompensaId: "col-pais-eg",
    competicion: {
      titulo: "Reto Táctico Relámpago (3 Turnos)",
      meta: "Completa una partida rápida del Duelo Relámpago y comparte resultado",
      recompensaVC: 70,
    },
    experiencia: {
      titulo: "Sobrevolar el Canal de Suez en 3D",
      descripcion: "Genera el teatro 3D/2D sobre El Cairo y Suez en un clic.",
      ruta: "/teatro-3d?modulo=mundial&lat=30.04&lng=31.23&nombre=Suez+%2F+Egipto",
    },
  },
  {
    mision: {
      id: "mis-2",
      titulo: "Verifica un cable en vivo con el Verificador OSINT",
      descripcion: "Carga una noticia real desde /api/news y analiza entidades y neutralidad.",
      accionLabel: "Abrir Verificador OSINT",
      rutaDestino: "/novedades?funcion=verificador-osint",
      recompensaVC: 60,
    },
    acontecimiento: {
      id: "aco-2",
      titulo: "La Revolución de los Telescopios Infrarrojos en L2",
      fechaReferencia: "Exploración Espacial",
      contexto: "Situado a 1.5 millones de kilómetros de la Tierra, el telescopio James Webb analiza luz estirada por la expansión cósmica durante más de 13 mil millones de años.",
      porQueImporta: "Permite estudiar la composición química atmosférica de exoplanetas lejanos buscando vapor de agua y dióxido de carbono.",
      rutaRelacionada: "/universo?vista=colecciones",
    },
    desafio: {
      id: "qz-2",
      tema: "Ciencia y Espacio",
      pregunta: "¿Por qué la luz de las galaxias más antiguas del universo llega al James Webb principalmente en el espectro infrarrojo?",
      opciones: ["Por la expansión del universo (corrimiento al rojo)", "Porque los espejos son de hierro", "Porque bloquean la gravedad lunar"],
      correcta: 0,
      explicacion: "Al expandirse el espacio-tiempo, la longitud de onda de la luz viajera se estira hacia frecuencias infrarrojas.",
      recompensaVC: 45,
    },
    cartaRecompensaId: "col-esp-jwst",
    competicion: {
      titulo: "Desafío Comparador de Doctrinas",
      meta: "Compara al menos 2 sistemas de armas y registra tu análisis",
      recompensaVC: 65,
    },
    experiencia: {
      titulo: "Vigía Planetario en Tiempo Real",
      descripcion: "Consulta los últimos sismos M4.5+ de USGS y alertas de NASA EONET.",
      ruta: "/novedades?funcion=vigia-planetario",
    },
  },
  {
    mision: {
      id: "mis-3",
      titulo: "Consulta el Termómetro Global por Regiones",
      descripcion: "Evalúa qué macro-región registra mayor índice de tensión hoy.",
      accionLabel: "Ver Termómetro Regional",
      rutaDestino: "/novedades?funcion=termometro-regiones",
      recompensaVC: 55,
    },
    acontecimiento: {
      id: "aco-3",
      titulo: "La Herencia Matemática del Cero y el Sexagesimal",
      fechaReferencia: "Historia de la Ciencia",
      contexto: "Civilizaciones separadas por océanos y milenios —Sumeria en Mesopotamia y los mayas en Mesoamérica— inventaron pilares matemáticos que siguen rigiendo nuestra vida digital y astronómica.",
      porQueImporta: "Sin el cero posicional ni la aritmética modular no existirían ni los procesadores actuales ni los relojes orbitales.",
      rutaRelacionada: "/universo?vista=colecciones",
    },
    desafio: {
      id: "qz-3",
      tema: "Civilizaciones Históricas",
      pregunta: "¿Cuál de estas culturas mesoamericanas desarrolló un uso avanzado del cero posicional en su sistema vigesimal?",
      opciones: ["Los mayas", "Los fenicios", "Los vikingos"],
      correcta: 0,
      explicacion: "El cero maya, representado frecuentemente como una concha, permitía cálculos calendáricos que abarcaban millones de años.",
      recompensaVC: 45,
    },
    cartaRecompensaId: "col-civ-maya",
    competicion: {
      titulo: "Ronda de Conocimiento del Archivo",
      meta: "Desbloquea y estudia 1 carta de Civilizaciones o Monumentos hoy",
      recompensaVC: 70,
    },
    experiencia: {
      titulo: "Vuelo 3D sobre Tokio y el Cinturón de Fuego",
      descripcion: "Inspecciona en el motor táctico 3D/2D el área sísmica e insular japonesa.",
      ruta: "/teatro-3d?modulo=mundial&lat=35.68&lng=139.76&nombre=Tokio+%C2%B7+Cintur%C3%B3n+de+Fuego",
    },
  },
  {
    mision: {
      id: "mis-4",
      titulo: "Compila un Parte Ejecutivo de 1 Minuto",
      descripcion: "Genera tu informe de coyuntura con conflictos y cables reales.",
      accionLabel: "Abrir Generador de Briefing",
      rutaDestino: "/novedades?funcion=generador-briefing",
      recompensaVC: 65,
    },
    acontecimiento: {
      id: "aco-4",
      titulo: "1953: Cómo una Imagen de Rayos X Descifró el Código de la Vida",
      fechaReferencia: "Descubrimientos Científicos",
      contexto: "La obtención de la Fotografía 51 por Rosalind Franklin reveló el patrón en 'X' característico de una estructura helicoidal doble.",
      porQueImporta: "Hoy permite desde medicina de precisión y vacunas de ARN mensajero hasta reconstruir migraciones humanas milenarias.",
      rutaRelacionada: "/universo?vista=colecciones",
    },
    desafio: {
      id: "qz-4",
      tema: "Biología y Física",
      pregunta: "¿Qué técnica experimental permitió visualizar el patrón en cruz que confirmó la doble hélice del ADN?",
      opciones: ["Difracción de rayos X", "Microscopía acústica", "Espectroscopía solar"],
      correcta: 0,
      recompensaVC: 45,
      explicacion: "Al hacer incidir rayos X sobre fibras cristalinas de ADN, los patrones de difracción desvelaron el paso y radio de la hélice.",
    },
    cartaRecompensaId: "col-cie-adn",
    competicion: {
      titulo: "Reto de Investigación Educativa",
      meta: "Completa la pregunta de verificación de cualquier carta de Ciencia",
      recompensaVC: 75,
    },
    experiencia: {
      titulo: "Explora el CERN y Ginebra en el Mapa 3D/2D",
      descripcion: "Lleva las coordenadas de la frontera franco-suiza al simulador.",
      ruta: "/teatro-3d?modulo=mundial&lat=46.23&lng=6.05&nombre=Ginebra+%2F+CERN",
    },
  },
];

export const EVENTOS_SEMANALES: EventoSemanal[] = [
  {
    id: "sem-col",
    tipo: "COLECCIÓN",
    titulo: "Semana de las Grandes Exploraciones (Espacio + Ciencia)",
    descripcion: "Estudia 3 cartas espaciales o científicas para obtener bonos dobles de VC sin fecha de caducidad punitiva.",
    recompensa: "+120 VC + Insignia de Estudio",
    ruta: "/universo?vista=colecciones",
    color: "#A855F7",
  },
  {
    id: "sem-3d",
    tipo: "ESCENARIO 3D",
    titulo: "Nuevo Escenario Semanal: Corredor de los Alpes y Estrechos",
    descripcion: "Prueba las formaciones de alta cota y mapas tácticos 2D/3D sobre los 32 puntos del Atlas.",
    recompensa: "+90 VC al desplegar",
    ruta: "/teatro-3d?modulo=mundial&lat=46.55&lng=7.98&nombre=Alpes+Semanales",
    color: "#38BDF8",
  },
  {
    id: "sem-torneo",
    tipo: "TORNEO",
    titulo: "Torneo Semanal de Estrategia y Conocimiento Global",
    descripcion: "Compite en retos diarios y cuestionarios históricos; la clasificación premia el mérito y saber, nunca pagos.",
    recompensa: "+150 VC + Título Semanal",
    ruta: "/universo?vista=hoy",
    color: "#FFC94D",
  },
  {
    id: "sem-mundo",
    tipo: "EVENTO MUNDIAL",
    titulo: "Observatorio Planetario Vivo: Terremotos y Clima Espacial",
    descripcion: "Sigue los sensores USGS y NASA EONET en tiempo real durante la semana de vigilancia geofísica.",
    recompensa: "+80 VC por verificación",
    ruta: "/novedades?funcion=vigia-planetario",
    color: "#3DDC97",
  },
  {
    id: "sem-objeto",
    tipo: "OBJETO LIMITADO",
    titulo: "Edición Estacional: Marco Polar para Base Personal",
    descripcion: "Desbloqueable completando actividades de esta semana o canjeando VC acumulados (cero ventaja de combate).",
    recompensa: "Marco Dorado Base Personal",
    ruta: "/universo?vista=marketplace",
    color: "#FF8A3D",
  },
];

export function obtenerPaqueteDiario(offsetDias = 0): PaqueteDiario {
  const ahora = new Date();
  ahora.setUTCDate(ahora.getUTCDate() - offsetDias);
  const yyyy = ahora.getUTCFullYear();
  const mm = String(ahora.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(ahora.getUTCDate()).padStart(2, "0");
  const diasDesdeEpoch = Math.floor(ahora.getTime() / 86_400_000);
  const idx = ((diasDesdeEpoch % CICLO_DIARIO_7.length) + CICLO_DIARIO_7.length) % CICLO_DIARIO_7.length;
  const base = CICLO_DIARIO_7[idx];
  return {
    indiceCiclo: idx,
    etiquetaDia: `${yyyy}-${mm}-${dd}`,
    ...base,
  };
}

export const FUENTES_VANGUARD_CREDITS: {
  id: string;
  titulo: string;
  descripcion: string;
  rangoVC: string;
  ruta: string;
}[] = [
  { id: "vc-1", titulo: "Completar el Desafío Diario", descripcion: "Misión mundial del día sin penalización si entras otro día.", rangoVC: "+60 VC", ruta: "/universo?vista=hoy" },
  { id: "vc-2", titulo: "Resolver Preguntas Mundiales", descripcion: "Trivia diaria y preguntas educativas verificadas en cada carta.", rangoVC: "+35 a +60 VC", ruta: "/universo?vista=colecciones" },
  { id: "vc-3", titulo: "Participar en Competiciones", descripcion: "Retos relámpago de estrategia y clasificación por mérito.", rangoVC: "+65 a +150 VC", ruta: "/novedades?funcion=duelo-relampago" },
  { id: "vc-4", titulo: "Completar Investigaciones Educativas", descripcion: "Estudia a fondo cartas de historia, ciencia, países y espacio.", rangoVC: "+20 a +120 VC", ruta: "/universo?vista=colecciones" },
  { id: "vc-5", titulo: "Crear Contenido de Calidad", descripcion: "Publica briefings ejecutivos, informes o análisis verificados.", rangoVC: "+50 VC", ruta: "/novedades?funcion=generador-briefing" },
  { id: "vc-6", titulo: "Participar en Eventos Especiales", descripcion: "Semanas temáticas mundiales, vigilancia sísmica y simulaciones 3D.", rangoVC: "+80 VC", ruta: "/novedades?funcion=vigia-planetario" },
  { id: "vc-7", titulo: "Conseguir Logros y Subir Cartas", descripcion: "Hitos de colección permanente (del Álbum Nv. 1 al Nv. 5).", rangoVC: "+40 a +150 VC", ruta: "/universo?vista=base" },
];
