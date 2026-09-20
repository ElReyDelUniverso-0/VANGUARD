// Vanguard — Static game data (conflicts, missions templates, quizzes, shop)
// Centralizado para que frontend y API lo usen.

export type AlertLevel = "CRITICO" | "TENSION" | "INESTABILIDAD" | "VIGILANCIA";

export interface ConflictRegion {
  id: string;
  name: string;
  country: string;
  flag: string;
  level: AlertLevel;
  intensity: number; // 0..100
  summary: string;
  lat: number;
  lng: number;
  factions: string[];
  since: string; // año
  casualties: string;
  civilianImpact: string;
  humanitarian: string;
  tags: string[];
}

export const CONFLICTS: ConflictRegion[] = [
  {
    id: "ukraine",
    name: "Frente Oriental — Ucrania",
    country: "Ucrania",
    flag: "UA",
    level: "CRITICO",
    intensity: 92,
    summary:
      "Combates sostenidos en el eje Donetsk-Kupiansk. Intensificación de ataques con drones Shahed sobre infraestructura energética.",
    lat: 48.5,
    lng: 37.5,
    factions: ["Fuerzas Armadas de Ucrania", "Fuerzas Armadas Rusas"],
    since: "2022",
    casualties: "~500K (est. OSINT)",
    civilianImpact: "Alta — desplazamiento de 6.5M",
    humanitarian: "Crítico en zonas frontales",
    tags: ["guerra", "OTAN", "energía", "drones"],
  },
  {
    id: "gaza",
    name: "Perímetro de Gaza",
    country: "Palestina / Israel",
    flag: "PS",
    level: "CRITICO",
    intensity: 88,
    summary:
      "Operaciones terrestres en curso en Rafah y Jabalia. Treguas humanitarias intermitentes mediadas por Egipto y Qatar.",
    lat: 31.4,
    lng: 34.4,
    factions: ["TSAL", "Hamás", "Yihad Islámica"],
    since: "2023",
    casualties: "40K+ (est. local)",
    civilianImpact: "Severo — 1.9M desplazados",
    humanitarian: "Crisis alimentaria nivel IPC 5",
    tags: ["guerra", "humanitario", "tregua"],
  },
  {
    id: "lebanon",
    name: "Línea Azul — Líbano",
    country: "Líbano / Israel",
    flag: "LB",
    level: "TENSION",
    intensity: 74,
    summary:
      "Intercambio de fuego diario entre Hezbolá y TSAL. Desplazamiento interno de 90K personas en el sur del Líbano.",
    lat: 33.27,
    lng: 35.5,
    factions: ["Hezbolá", "TSAL"],
    since: "2023",
    casualties: "~600",
    civilianImpact: "Moderado-Alto",
    humanitarian: "Alerta en el sur",
    tags: ["frontera", "escaramuzas"],
  },
  {
    id: "sudan",
    name: "Jartum — Sudán",
    country: "Sudán",
    flag: "SD",
    level: "CRITICO",
    intensity: 81,
    summary:
      "Guerra civil entre FAR y RSF. 10M+ desplazados, la mayor crisis de desplazamiento del mundo.",
    lat: 15.5,
    lng: 32.5,
    factions: ["FAR", "RSF"],
    since: "2023",
    casualties: "150K+ (est.)",
    civilianImpact: "Catastrófico",
    humanitarian: "Hambruna declarada en Darfur",
    tags: ["guerra civil", "hambruna"],
  },
  {
    id: "elfasher",
    name: "El Fasher — Darfur",
    country: "Sudán",
    flag: "SD",
    level: "CRITICO",
    intensity: 85,
    summary:
      "Asedio prolongado de RSF a El Fasher. Último bastión de FAR en Darfur occidental.",
    lat: 13.63,
    lng: 25.35,
    factions: ["FAR", "RSF"],
    since: "2024",
    casualties: "Decenas de miles",
    civilianImpact: "Asedio — sin ayuda humanitaria",
    humanitarian: "IPC 5 — hambruna confirmada",
    tags: ["asedio", "hambruna"],
  },
  {
    id: "korea",
    name: "DMZ — Corea",
    country: "Península de Corea",
    flag: "KP",
    level: "VIGILANCIA",
    intensity: 32,
    summary:
      "Tensión persistente en la Zona Desmilitarizada. Pruebas balísticas norcoreanas en pausa técnica.",
    lat: 37.95,
    lng: 126.68,
    factions: ["EPCN", "EE.UU. / RDC"],
    since: "1953",
    casualties: "—",
    civilianImpact: "Bajo",
    humanitarian: "—",
    tags: ["nuclear", "disuasión"],
  },
  {
    id: "taiwan",
    name: "Estrecho de Taiwán",
    country: "Taiwán / China",
    flag: "TW",
    level: "TENSION",
    intensity: 58,
    summary:
      "Ejercicios navales chinos cerca de la línea mediana. Patrullaje aéreo de la República de China reforzado.",
    lat: 24.5,
    lng: 120.5,
    factions: ["EPL", "Fuerzas de Taiwán"],
    since: "1949",
    casualties: "—",
    civilianImpact: "Bajo",
    humanitarian: "—",
    tags: ["naval", "político"],
  },
  {
    id: "redsea",
    name: "Bab el-Mandeb — Mar Rojo",
    country: "Yemen",
    flag: "YE",
    level: "INESTABILIDAD",
    intensity: 67,
    summary:
      "Ataques de Huti a buques comerciales. Operación Prosperity Guardian activa. Rutas marítimas desviadas por Cabo de Buena Esperanza.",
    lat: 12.6,
    lng: 43.4,
    factions: ["Huti", "Coalición naval"],
    since: "2023",
    casualties: "—",
    civilianImpact: "Comercio marítimo",
    humanitarian: "Impacto logístico global",
    tags: ["marítimo", "comercio"],
  },
  {
    id: "hormuz",
    name: "Estrecho de Ormuz",
    country: "Irán",
    flag: "IR",
    level: "VIGILANCIA",
    intensity: 41,
    summary:
      "Tensión persistente en una de las rutas energéticas más críticas del mundo. 20% del petróleo global la atraviesa.",
    lat: 26.57,
    lng: 56.25,
    factions: ["IRGC-N", "EE.UU. 5ª Flota"],
    since: "2019",
    casualties: "—",
    civilianImpact: "Bajo",
    humanitarian: "—",
    tags: ["petróleo", "naval"],
  },
  {
    id: "sahel",
    name: "Sahel — Liptako-Gourma",
    country: "Malí / Níger / Burkina Faso",
    flag: "ML",
    level: "INESTABILIDAD",
    intensity: 70,
    summary:
      "Expansión de grupos yihadistas tras retirada francesa y MINUSMA. Golpes militares en los tres países.",
    lat: 14.5,
    lng: -0.5,
    factions: ["JNIM", "GSIM", "Fuerzas estatales"],
    since: "2012",
    casualties: "Decenas de miles",
    civilianImpact: "Alto — 3M desplazados",
    humanitarian: "Crisis prolongada",
    tags: ["yihadismo", "golpe militar"],
  },
  {
    id: "myanmar",
    name: "Myanmar — Frente étnico",
    country: "Myanmar",
    flag: "MM",
    level: "INESTABILIDAD",
    intensity: 76,
    summary:
      "Guerra civil tras el golpe de 2021. La resistencia popular y las milicias étnicas controlan amplias zonas fronterizas.",
    lat: 21.5,
    lng: 96.0,
    factions: ["Tatmadaw", "PDF", "Milicias étnicas"],
    since: "2021",
    casualties: "50K+ (est.)",
    civilianImpact: "Alto — 3M desplazados",
    humanitarian: "Crisis humanitaria severa",
    tags: ["guerra civil", "golpe militar"],
  },
  {
    id: "venezuela",
    name: "Venezuela — Tensión política",
    country: "Venezuela",
    flag: "VE",
    level: "VIGILANCIA",
    intensity: 48,
    summary:
      "Disputa electoral y crisis económica. Sanciones internacionales y migración masiva hacia el sur.",
    lat: 8.0,
    lng: -66.0,
    factions: ["Gobierno", "Oposición", "Comunidad internacional"],
    since: "2019",
    casualties: "—",
    civilianImpact: "Alto — 7M emigrados",
    humanitarian: "Crisis económica y social",
    tags: ["político", "migración"],
  },
  {
    id: "colombia",
    name: "Colombia — Conflictos armados",
    country: "Colombia",
    flag: "CO",
    level: "INESTABILIDAD",
    intensity: 62,
    summary:
      "Grupos armados residual activos en zonas rurales pese al acuerdo de paz de 2016. Conflictos por territorios y narcotráfico.",
    lat: 4.5,
    lng: -73.5,
    factions: ["ELN", "Disidencias FARC", "Fuerzas estatales"],
    since: "2017",
    casualties: "Miles (est.)",
    civilianImpact: "Moderado",
    humanitarian: "Liderazgos sociales amenazados",
    tags: ["narcotráfico", "guerrilla"],
  },
  {
    id: "haiti",
    name: "Haití — Crisis de pandillas",
    country: "Haití",
    flag: "HT",
    level: "CRITICO",
    intensity: 79,
    summary:
      "Las pandillas controlan el 80% de Puerto Príncipe. Colapso institucional y crisis humanitaria severa.",
    lat: 18.5,
    lng: -72.3,
    factions: ["Pandillas G9", "Fuerzas estatales", "Misión multinacional"],
    since: "2021",
    casualties: "Miles (est.)",
    civilianImpact: "Catastrófico",
    humanitarian: "Hambruna y desplazamiento masivo",
    tags: ["pandillas", "colapso institucional"],
  },
  {
    id: "sahara",
    name: "Sáhara Occidental",
    country: "Sáhara Occidental / Marruecos",
    flag: "MA",
    level: "VIGILANCIA",
    intensity: 35,
    summary:
      "Disputa territorial pendiente entre Marruecos y el Frente Polisario. Alto el fuego en vigor desde 1991 con tensiones periódicas.",
    lat: 24.5,
    lng: -13.0,
    factions: ["Marruecos", "Frente Polisario"],
    since: "1975",
    casualties: "—",
    civilianImpact: "Bajo",
    humanitarian: "Refugiados saharauis en Tinduf",
    tags: ["territorial", "diplomacia"],
  },
  {
    id: "armenia",
    name: "Alto Karabaj — Cáucaso",
    country: "Armenia / Azerbaiyán",
    flag: "AM",
    level: "TENSION",
    intensity: 54,
    summary:
      "Tras la guerra de 2020 y la ofensiva de 2023, Azerbaiyán recupera el control. Población armenia desplazada casi por completo.",
    lat: 39.8,
    lng: 46.8,
    factions: ["Azerbaiyán", "Armenia"],
    since: "1988",
    casualties: "Miles (est.)",
    civilianImpact: "Alto — 100K+ desplazados",
    humanitarian: "Éxodo armenio de Karabaj",
    tags: ["territorial", "étnico"],
  },
  {
    id: "somalia",
    name: "Somalia — Cuerno de Africa",
    country: "Somalia",
    flag: "SO",
    level: "INESTABILIDAD",
    intensity: 72,
    summary:
      "Insurgencia de Al-Shabaab activa desde 2006. Ataques frecuentes en Mogadiscio y regiones rurales. Apoyo de la ATMIS y fuerzas estatales.",
    lat: 5.15,
    lng: 46.2,
    factions: ["Al-Shabaab", "Fuerzas federales", "ATMIS"],
    since: "2006",
    casualties: "Decenas de miles",
    civilianImpact: "Alto",
    humanitarian: "Crisis alimentaria recurrente",
    tags: ["yihadismo", "insurgencia"],
  },
  {
    id: "drcongo",
    name: "R.D. Congo — Kivu",
    country: "Republica Democratica del Congo",
    flag: "CD",
    level: "CRITICO",
    intensity: 83,
    summary:
      "Conflictos armados en Kivu Norte y Sur con decenas de grupos armados. Mision de paz MONUSCO en retirada.",
    lat: -1.7,
    lng: 29.2,
    factions: ["M23", "FDLR", "FARDC", "MONUSCO"],
    since: "1996",
    casualties: "Millones (est.)",
    civilianImpact: "Catastrófico — 7M desplazados",
    humanitarian: "Crisis prolongada",
    tags: ["guerra civil", "minerales"],
  },
  {
    id: "afghanistan",
    name: "Afganistan — Emirato Talibán",
    country: "Afganistan",
    flag: "AF",
    level: "INESTABILIDAD",
    intensity: 65,
    summary:
      "Talibán en el poder desde 2021. Resistencia del Frente Nacional de Resistencia en el valle de Panjshir. ISIS-K activo.",
    lat: 34.5,
    lng: 67.0,
    factions: ["Talibán", "FNR", "ISIS-K"],
    since: "2021",
    casualties: "Miles (est.)",
    civilianImpact: "Alto",
    humanitarian: "Crisis humanitaria y de derechos",
    tags: ["yihadismo", "golpe de estado"],
  },
  {
    id: "yemen",
    name: "Yemen — Guerra civil",
    country: "Yemen",
    flag: "YE",
    level: "INESTABILIDAD",
    intensity: 68,
    summary:
      "Guerra civil entre gobierno reconocido y Huti desde 2014. Tregua frágil en vigor desde 2022. Crisis humanitaria severa.",
    lat: 15.5,
    lng: 48.5,
    factions: ["Huti", "Gobierno", "Coalición arabica"],
    since: "2014",
    casualties: "377K+ (est.)",
    civilianImpact: "Catastrófico",
    humanitarian: "80% dependen de ayuda humanitaria",
    tags: ["guerra civil", "humanitario"],
  },
  {
    id: "syria",
    name: "Siria — Conflicto prolongado",
    country: "Siria",
    flag: "SY",
    level: "INESTABILIDAD",
    intensity: 64,
    summary:
      "Conflicto armado desde 2011 con multiples actores. Gobierno controla mayoria del territorio. Idlib bajo control opositor.",
    lat: 35.0,
    lng: 38.5,
    factions: ["Gobierno sirio", "SNA", "SDF", "HTS"],
    since: "2011",
    casualties: "500K+ (est.)",
    civilianImpact: "Alto — 6.8M desplazados",
    humanitarian: "Crisis prolongada",
    tags: ["guerra civil", "yihadismo"],
  },
  {
    id: "ethiopia",
    name: "Etiopia — Tigré y Oromia",
    country: "Etiopia",
    flag: "ET",
    level: "VIGILANCIA",
    intensity: 45,
    summary:
      "Tras el acuerdo de paz de Tigré (2022), tensiones en Oromia con el OLA. Reformas politicas en curso.",
    lat: 9.0,
    lng: 38.7,
    factions: ["Gobierno federal", "OLA", "Frente Tigré"],
    since: "2020",
    casualties: "500K+ (est.)",
    civilianImpact: "Alto en Tigré",
    humanitarian: "Reconstrucción en curso",
    tags: ["guerra civil", "étnico"],
  },
  {
    id: "mozambique",
    name: "Mozambique — Cabo Delgado",
    country: "Mozambique",
    flag: "MZ",
    level: "INESTABILIDAD",
    intensity: 58,
    summary:
      "Insurgencia yihadista en Cabo Delgado desde 2017. Apoyo de fuerzas ruandesas y SAMIM. Ataques a infraestructura de gas.",
    lat: -11.5,
    lng: 40.5,
    factions: ["ISCAP", "Fuerzas estatales", "SAMIM"],
    since: "2017",
    casualties: "Miles (est.)",
    civilianImpact: "Alto — 1M+ desplazados",
    humanitarian: "Crisis alimentaria",
    tags: ["yihadismo", "gas natural"],
  },
  {
    id: "mexico",
    name: "Mexico — Violencia de pandillas",
    country: "Mexico",
    flag: "MX",
    level: "INESTABILIDAD",
    intensity: 60,
    summary:
      "Violencia de cárteles de drogas en multiples estados. Militarización de la seguridad pública.",
    lat: 23.6,
    lng: -102.5,
    factions: ["Cárteles", "Fuerzas federales", "Guardia Nacional"],
    since: "2006",
    casualties: "350K+ (est.)",
    civilianImpact: "Alto",
    humanitarian: "Desaparecidos: 100K+",
    tags: ["narcotráfico", "violencia"],
  },
  {
    id: "kashmir",
    name: "Cachemira — Disputa India/Pakistan",
    country: "Cachemira",
    flag: "IN",
    level: "TENSION",
    intensity: 52,
    summary:
      "Disputa territorial desde 1947 entre India y Pakistan. Línea de control con escaramuzas periódicas. Tensiones tras revocación del estatus especial.",
    lat: 34.0,
    lng: 76.0,
    factions: ["India", "Pakistan", "Grupos armados"],
    since: "1947",
    casualties: "Decenas de miles",
    civilianImpact: "Moderado",
    humanitarian: "Tensiones prolongadas",
    tags: ["territorial", "nuclear"],
  },
  // ====== Terrorism & Cartels ======
  {
    id: "isisk",
    name: "ISIS-K — Jorasán",
    country: "Afganistan / Pakistan",
    flag: "AF",
    level: "CRITICO",
    intensity: 78,
    summary:
      "Rama de ISIS en Jorasán. Atentados mortales en Kabul, Irán y Moscú. Expansión global con células en Europa y Asia.",
    lat: 34.5,
    lng: 69.2,
    factions: ["ISIS-K", "Talibán", "Fuerzas especiales EE.UU."],
    since: "2015",
    casualties: "Miles (est.)",
    civilianImpact: "Alto — atentados masivos",
    humanitarian: "Terrorismo transnacional",
    tags: ["terrorismo", "yihadismo", "transnacional"],
  },
  {
    id: "boko",
    name: "Boko Haram — Lago Chad",
    country: "Nigeria / Chad / Níger",
    flag: "NG",
    level: "CRITICO",
    intensity: 80,
    summary:
      "Grupo yihadista activo desde 2009. Secuestro de Chibok (2014). Aliado de ISIS. Más de 350K muertos y 3M desplazados.",
    lat: 12.0,
    lng: 13.5,
    factions: ["Boko Haram", "ISWAP", "Fuerzas multinacionales"],
    since: "2009",
    casualties: "350K+ (est.)",
    civilianImpact: "Catastrófico — 3M desplazados",
    humanitarian: "Crisis alimentaria severa",
    tags: ["terrorismo", "yihadismo", "secuestros"],
  },
  {
    id: "sinaloa",
    name: "Cártel de Sinaloa",
    country: "México",
    flag: "MX",
    level: "CRITICO",
    intensity: 85,
    summary:
      "El cártel de drogas más poderoso del mundo. Guerra interna tras captura de El Chapo. Rutas de fentanilo hacia EE.UU.",
    lat: 25.0,
    lng: -107.5,
    factions: ["Cártel de Sinaloa", "CJNG", "Fuerzas federales"],
    since: "1980",
    casualties: "350K+ (est. total narcoviolencia)",
    civilianImpact: "Alto — desaparecidos 100K+",
    humanitarian: "Crisis de derechos humanos",
    tags: ["narcotráfico", "cárteles", "fentanilo"],
  },
  {
    id: "cjng",
    name: "CJNG — Nueva Generación",
    country: "México",
    flag: "MX",
    level: "INESTABILIDAD",
    intensity: 75,
    summary:
      "Cártel Jalisco Nueva Generación. Expansión agresiva por todo México. Violencia extrema, videos de ejecuciones, guerra con Sinaloa.",
    lat: 20.7,
    lng: -103.3,
    factions: ["CJNG", "Cártel de Sinaloa", "Fuerzas federales"],
    since: "2011",
    casualties: "Decenas de miles",
    civilianImpact: "Alto",
    humanitarian: "Desplazamiento forzado",
    tags: ["narcotráfico", "cárteles", "expansión"],
  },
  {
    id: "paramilitares",
    name: "Paramilitares Colombia",
    country: "Colombia",
    flag: "CO",
    level: "INESTABILIDAD",
    intensity: 63,
    summary:
      "Grupos paramilitares (AGC, Clan del Golfo) controlan territorios rurales. Narcotráfico, minería ilegal, extorsión.",
    lat: 7.0,
    lng: -75.5,
    factions: ["AGC", "ELN", "Disidencias FARC", "Fuerzas estatales"],
    since: "2017",
    casualties: "Miles (est.)",
    civilianImpact: "Moderado-Alto",
    humanitarian: "Liderazgos sociales amenazados",
    tags: ["narcotráfico", "paramilitares", "extorsión"],
  },
  {
    id: "favelas",
    name: "Favelas — Río de Janeiro",
    country: "Brasil",
    flag: "BR",
    level: "INESTABILIDAD",
    intensity: 68,
    summary:
      "Cárteles brasileños (CV, TCP) controlan favelas. Guerra urbana con policía. Tráfico de armas y drogas.",
    lat: -22.9,
    lng: -43.2,
    factions: ["Comando Vermelho", "TCP", "Bope/Policía"],
    since: "2016",
    casualties: "Miles anuales",
    civilianImpact: "Alto en favelas",
    humanitarian: "Violencia urbana endémica",
    tags: ["narcotráfico", "guerra urbana", "favelas"],
  },
  {
    id: "alshabaab",
    name: "Al-Shabaab — Cuerno",
    country: "Somalia / Kenia",
    flag: "SO",
    level: "INESTABILIDAD",
    intensity: 73,
    summary:
      "Insurgencia yihadista afiliada a Al-Qaeda. Atentados en Mogadiscio, Nairobi. Control de zonas rurales.",
    lat: 3.0,
    lng: 45.0,
    factions: ["Al-Shabaab", "Gobierno federal", "ATMIS"],
    since: "2006",
    casualties: "Decenas de miles",
    civilianImpact: "Alto",
    humanitarian: "Crisis alimentaria recurrente",
    tags: ["terrorismo", "yihadismo", "insurgencia"],
  },
  {
    id: "taliban_isis",
    name: "Talibán vs ISIS-K",
    country: "Afganistan",
    flag: "AF",
    level: "TENSION",
    intensity: 55,
    summary:
      "Guerra entre el Emirato Talibán (gobierno) e ISIS-K (rival yihadista). Atentados mutuos en Kabul y provincias.",
    lat: 33.0,
    lng: 65.0,
    factions: ["Talibán (gobierno)", "ISIS-K"],
    since: "2021",
    casualties: "Miles (est.)",
    civilianImpact: "Moderado",
    humanitarian: "Inestabilidad prolongada",
    tags: ["terrorismo", "guerra civil", "yihadismo"],
  },
];

export interface MissionTemplate {
  code: string;
  title: string;
  description: string;
  category: "DAILY" | "WEEKLY" | "SPECIAL" | "STORY";
  difficulty: "EASY" | "NORMAL" | "HARD" | "EXTREME";
  xpReward: number;
  coinReward: number;
  gemReward: number;
  target: number;
  action: string;
  conflictTag?: string;
}

export const MISSION_TEMPLATES: MissionTemplate[] = [
  // DAILY
  { code: "D_LOGIN", title: "Conexion diaria", description: "Inicia sesión en el centro de mando.", category: "DAILY", difficulty: "EASY", xpReward: 20, coinReward: 15, gemReward: 0, target: 1, action: "LOGIN" },
  { code: "D_BRIEF_3", title: "Briefing matutino", description: "Lee 3 informes de inteligencia.", category: "DAILY", difficulty: "EASY", xpReward: 30, coinReward: 25, gemReward: 0, target: 3, action: "READ_BRIEFING" },
  { code: "D_NEWS_5", title: "Cable de alerta", description: "Revisa 5 noticias en vivo.", category: "DAILY", difficulty: "EASY", xpReward: 30, coinReward: 25, gemReward: 0, target: 5, action: "VIEW_NEWS" },
  { code: "D_PHOTO_2", title: "Verificación OSINT", description: "Inspecciona 2 fotos verificadas en la galería.", category: "DAILY", difficulty: "EASY", xpReward: 25, coinReward: 20, gemReward: 0, target: 2, action: "VIEW_PHOTO" },
  { code: "D_QUIZ_3", title: "Test táctico", description: "Responde 3 preguntas del quiz geopolítico.", category: "DAILY", difficulty: "NORMAL", xpReward: 40, coinReward: 35, gemReward: 0, target: 3, action: "QUIZ_CORRECT" },
  { code: "D_MAP_1", title: "Reconocimiento del mapa", description: "Abre el mapa global y observa un frente.", category: "DAILY", difficulty: "EASY", xpReward: 15, coinReward: 10, gemReward: 0, target: 1, action: "OPEN_MAP" },
  { code: "D_PREDICT_1", title: "Analista predictivo", description: "Realiza una predicción en el mercado.", category: "DAILY", difficulty: "NORMAL", xpReward: 35, coinReward: 30, gemReward: 0, target: 1, action: "PREDICT" },
  { code: "D_FUSION_1", title: "Fusion de inteligencia", description: "Fusiona 1 vez informes en la sala de fusión.", category: "DAILY", difficulty: "NORMAL", xpReward: 50, coinReward: 40, gemReward: 1, target: 1, action: "FUSION" },

  // WEEKLY
  { code: "W_BRIEF_15", title: "Operacion semana", description: "Lee 15 informes durante la semana.", category: "WEEKLY", difficulty: "HARD", xpReward: 200, coinReward: 180, gemReward: 2, target: 15, action: "READ_BRIEFING" },
  { code: "W_NEWS_30", title: "Centinela de cables", description: "Revisa 30 noticias en vivo.", category: "WEEKLY", difficulty: "HARD", xpReward: 220, coinReward: 200, gemReward: 2, target: 30, action: "VIEW_NEWS" },
  { code: "W_QUIZ_15", title: "Estratega certificado", description: "Acerta 15 preguntas del quiz.", category: "WEEKLY", difficulty: "HARD", xpReward: 250, coinReward: 220, gemReward: 3, target: 15, action: "QUIZ_CORRECT" },
  { code: "W_PREDICT_5", title: "Vidente táctico", description: "Realiza 5 predicciones.", category: "WEEKLY", difficulty: "EXTREME", xpReward: 300, coinReward: 250, gemReward: 3, target: 5, action: "PREDICT" },

  // SPECIAL
  { code: "S_FUSION_5", title: "Maestro de fusion", description: "Realiza 5 fusiones de inteligencia.", category: "SPECIAL", difficulty: "EXTREME", xpReward: 350, coinReward: 300, gemReward: 5, target: 5, action: "FUSION" },
  { code: "S_STREAK_7", title: "Racha imparable", description: "Mantén una racha de 7 días.", category: "SPECIAL", difficulty: "HARD", xpReward: 280, coinReward: 220, gemReward: 4, target: 7, action: "STREAK" },

  // STORY
  { code: "STORY_KIEV", title: "Capitulo 1 — Kiev bajo asedio", description: "Lee el briefing de Ucrania y abre el mapa del frente oriental.", category: "STORY", difficulty: "NORMAL", xpReward: 120, coinReward: 100, gemReward: 1, target: 1, action: "OPEN_MAP", conflictTag: "ukraine" },
  { code: "STORY_GAZA", title: "Capitulo 2 — Perimetro de Gaza", description: "Lee el briefing de Gaza y abre el mapa del frente sur.", category: "STORY", difficulty: "NORMAL", xpReward: 120, coinReward: 100, gemReward: 1, target: 1, action: "OPEN_MAP", conflictTag: "gaza" },
  { code: "STORY_SUDAN", title: "Capitulo 3 — Crisis del Cuerno", description: "Analiza la guerra civil sudanesa.", category: "STORY", difficulty: "HARD", xpReward: 150, coinReward: 120, gemReward: 2, target: 1, action: "OPEN_MAP", conflictTag: "sudan" },
];

export interface Briefing {
  id: string;
  conflictId: string;
  title: string;
  classification: "PUBLICO" | "RESERVADO" | "SECRETO";
  date: string;
  summary: string;
  keyPoints: string[];
  analysis: string;
  outlook: string;
  coinCost: number; // 0 = gratis
}

export const BRIEFINGS: Briefing[] = [
  {
    id: "B-UKR-01",
    conflictId: "ukraine",
    title: "Situacion operacional — Frente Oriental",
    classification: "PUBLICO",
    date: "Hoy",
    summary:
      "La situacion en el eje Donetsk-Kupiansk permanece altamente volatil. Se reporta un aumento del 38% en ataques con drones Shahed-136 contra objetivos energeticos en las ultimas 72 horas.",
    keyPoints: [
      "3 subestaciones electricas fuera de servicio en regiones centrales",
      "Defensa aerea movil Patriot intercepto 14 de 17 drones",
      "Actividad mecanizada limitada cerca de Avdiivka",
      "Apoyo logistico de socios occidentales en marco de 50 mil millones EUR",
    ],
    analysis:
      "La estrategia rusa busca erosionar la voluntad civil mediante presion energetica sostenida, mientras mantiene la presion terrestre sin comprometer reservas operacionales. Ucrania prioriza la defensa en profundidad y mantiene capacidad de proyeccion en el sector de Jarkov.",
    outlook: "Probabilidad ALTA de nuevos ataques masivos en las proximas 48h.",
    coinCost: 0,
  },
  {
    id: "B-GAZA-01",
    conflictId: "gaza",
    title: "Crisis humanitaria — Perimetro de Gaza",
    classification: "RESERVADO",
    date: "Hoy",
    summary:
      "Las operaciones terrestres continuan en Rafah y Jabalia con pausas humanitarias intermitentes. Se estima que 1.9M de personas estan desplazadas internamente.",
    keyPoints: [
      "Corredor humanitario de Rafah opera al 22% de su capacidad",
      "Negociaciones de tregua mediadas por Egipto y Qatar estancadas",
      "Informe IPC confirma fase 5 (catastrofe) en el norte",
      "Libertacion de rehenes en negociacion como moneda de cambio",
    ],
    analysis:
      "La dimension humanitaria y la dimension politico-militar estan profundamente entrelazadas. Cualquier tregua sostenida requiere garantias verificables para ambas partes y un mecanismo creible de intercambio.",
    outlook: "Probabilidad MODERADA de tregua de 7 dias en los proximos 14 dias.",
    coinCost: 50,
  },
  {
    id: "B-SDN-01",
    conflictId: "sudan",
    title: "Guerra civil sudanesa — Panorama estrategico",
    classification: "RESERVADO",
    date: "Hoy",
    summary:
      "El conflicto entre las Fuerzas Armadas Sudanesas (FAR) y las Fuerzas de Apoyo Rapido (RSF) ha desplazado a mas de 10 millones de personas, la mayor crisis de desplazamiento del mundo.",
    keyPoints: [
      "RSF controla amplias zonas de Darfur y Jartum",
      "FAR mantienen Port Sudan como capital administrativa",
      "Hambruna declarada en El Fasher y zonas de Darfur",
      "Apoyo externo: EAU a RSF, Egipto a FAR (segun ONGs)",
    ],
    analysis:
      "La fragmentacion territorial y la injerencia externa complican cualquier solucion negociada. La crisis humanitaria tiene dimensiones regionales con flujo de refugiados hacia Chad y Etiopia.",
    outlook: "Probabilidad ALTA de escalation en Darfur occidental.",
    coinCost: 60,
  },
  {
    id: "B-LEB-01",
    conflictId: "lebanon",
    title: "Linea Azul — Escaramuzas transfronterizas",
    classification: "PUBLICO",
    date: "Hoy",
    summary:
      "Fuego diario entre Hezbol y el Tsahal en la frontera sur del Libano. 90K libaneses desplazados.",
    keyPoints: [
      "Promedio de 12 incidentes diarios en la frontera",
      "Hezbol conserva ~80% de capacidad de coheteria",
      "Mediacion estadounidense para aplicacion de Resolucion 1701",
      "Riesgo de escalation regional si se abre nuevo frente",
    ],
    analysis:
      "El equilibrio disuasivo es fragil. Cualquier error de calculo puede escalar a un conflicto regional mas amplio que involucre a Irán.",
    outlook: "Probabilidad MODERADA de escalation sostenida en proximas 4 semanas.",
    coinCost: 40,
  },
  {
    id: "B-RS-01",
    conflictId: "redsea",
    title: "Mar Rojo — Ruta maritima bajo presion",
    classification: "PUBLICO",
    date: "Hoy",
    summary:
      "Ataques continuos de los Huti a buques comerciales. Operacion Prosperity Guardian mantiene corredor de seguridad parcial.",
    keyPoints: [
      "~60% del trafico comercial desviado por Cabo de Buena Esperanza",
      "Aumento del 15-20% en costos de flete",
      "Intervencion naval de EE.UU., Reino Unido, Francia e India",
      "Huti mantienen capacidad de ataque pese a bombardeos",
    ],
    analysis:
      "La desviacion de rutas comerciales tiene impactos globales en cadenas de suministro y presion inflacionaria. La dimension disuasiva militar no ha neutralizado la capacidad operativa de los Huti.",
    outlook: "Situacion prolongada; impacto economico sostenido.",
    coinCost: 30,
  },
  {
    id: "B-TW-01",
    conflictId: "taiwan",
    title: "Estrecho de Taiwán — Postura strategica",
    classification: "SECRETO",
    date: "Hoy",
    summary:
      "Ejercicios navales chinos cerca de la linea mediana. Taiwan refuerza patrullaje aereo y alerta temprana.",
    keyPoints: [
      "Aumento de incursiones aereas (gray zone)",
      "Modernizacion naval de la EPL acelerada",
      "Taiwan incrementa compras defensivas EE.UU.",
      "Disuasion extendida bajo escrutinio",
    ],
    analysis:
      "La estrategia china de presion gris busca desgastar la respuesta taiwanesa sin cruzar umbrales que provoquen respuesta militar directa de EE.UU.",
    outlook: "Riesgo MODERADO de incidente en proximos 6 meses.",
    coinCost: 80,
  },
  {
    id: "B-SOM-01",
    conflictId: "somalia",
    title: "Somalia — Insurgencia de Al-Shabaab",
    classification: "PUBLICO",
    date: "Hoy",
    summary:
      "Al-Shabaab mantiene capacidad operativa pese a ofensivas del gobierno federal y ATMIS. Ataques en Mogadiscio continuan.",
    keyPoints: [
      "Atentados suicidas frecuentes en capital",
      "ATMIS en transicion de responsabilidades",
      "Fuerzas estatales con apoyo turco y estadounidense",
      "Reclutamiento forzado en zonas rurales",
    ],
    analysis:
      "La insurgencia muestra resiliencia adaptativa. La retirada progresiva de ATMIS sin transferencia completa de capacidades genera vacios de seguridad.",
    outlook: "Probabilidad ALTA de escalation en periodo electoral.",
    coinCost: 0,
  },
  {
    id: "B-CONGO-01",
    conflictId: "drcongo",
    title: "R.D. Congo — Crisis de Kivu",
    classification: "RESERVADO",
    date: "Hoy",
    summary:
      "Ofensiva del M23 respaldada por Rwanda segun ONU. MONUSCO en retirada tras 25 anos de mision.",
    keyPoints: [
      "M23 controla Goma y Sake",
      "1M+ desplazados en Kivu Norte",
      "Tensiones diplomaticas Congo-Rwanda",
      "Extraccion ilegal de minerales (coltan, oro)",
    ],
    analysis:
      "El conflicto entrelaza dimensiones locales, regionales e internacionales. La economia ilegal de minerales financia a multiples grupos armados.",
    outlook: "Riesgo ALTO de guerra regional si escalation continúa.",
    coinCost: 60,
  },
  {
    id: "B-AFG-01",
    conflictId: "afghanistan",
    title: "Afganistan — Bajo el Emirato",
    classification: "RESERVADO",
    date: "Hoy",
    summary:
      "Talibán consolido el poder tras retirada de EE.UU. en 2021. Derechos de la mujer eliminados. ISIS-K activo en fronteras.",
    keyPoints: [
      "Prohibicion de educacion femenina",
      "Reconocimiento internacional limitado",
      "ISIS-K ataca minorias chiitas",
      "Crisis economica y de ayuda humanitaria",
    ],
    analysis:
      "El aislamiento internacional limita opciones diplomaticas. La crisis humanitaria se agrava sin mecanismos de ayuda estandarizados.",
    outlook: "Situacion prolongada sin perspectiva de cambio.",
    coinCost: 50,
  },
  {
    id: "B-YEM-01",
    conflictId: "yemen",
    title: "Yemen — Tregua fragil",
    classification: "PUBLICO",
    date: "Hoy",
    summary:
      "Tregua de 2022 se mantiene fragil. Huti controla norte y capital Sanaa. Crisis humanitaria catastrofica.",
    keyPoints: [
      "80% de poblacion depende de ayuda humanitaria",
      "Huti atacan comercio maritimo (Mar Rojo)",
      "Divisiones en gobierno reconocido",
      "Arabia Saudita busca salida diplomatica",
    ],
    analysis:
      "El conflicto se ha regionalizado. Los Huti utilizan Yemen como base para operaciones contra el comercio internacional.",
    outlook: "Probabilidad MODERADA de tregua formal en proximos 6 meses.",
    coinCost: 40,
  },
];

export interface QuizQ {
  id: string;
  category: string;
  difficulty: "EASY" | "NORMAL" | "HARD";
  question: string;
  options: string[];
  answerIdx: number;
  explanation: string;
  xpReward: number;
  coinReward: number;
}

export const QUIZ_QUESTIONS: QuizQ[] = [
  { id: "Q1", category: "GEOGRAFIA", difficulty: "EASY", question: "Que estrecho separa Iran de Oman y es vital para el 20% del petroleo mundial?", options: ["Bósforo", "Bab el-Mandeb", "Ormuz", "Malaca"], answerIdx: 2, explanation: "El estrecho de Ormuz es la ruta de exportacion de petroleo del Golfo Persico.", xpReward: 15, coinReward: 10 },
  { id: "Q2", category: "CONFLICTOS", difficulty: "EASY", question: "Que dos facciones combaten en la guerra civil sudanesa desde 2023?", options: ["FAR y RSF", "FAR y JNIM", "RSF y EPLF", "FAR y Boko Haram"], answerIdx: 0, explanation: "Las Fuerzas Armadas Sudanesas contra las Fuerzas de Apoyo Rapido (RSF).", xpReward: 15, coinReward: 10 },
  { id: "Q3", category: "CONFLICTOS", difficulty: "NORMAL", question: "Cual es la Resolucion de la ONU que puso fin a la guerra Libano-Israel de 2006?", options: ["Res. 242", "Res. 1701", "Res. 2334", "Res. 1441"], answerIdx: 1, explanation: "La Resolucion 1701 establecio el cese al fuego y la zona desmilitarizada al sur del Litani.", xpReward: 20, coinReward: 15 },
  { id: "Q4", category: "HISTORIA", difficulty: "NORMAL", question: "En que ano empezo la guerra del Donbas (previa a la invasion total)?", options: ["2013", "2014", "2016", "2021"], answerIdx: 1, explanation: "Los combates empezaron en 2014 tras la anexión de Crimea.", xpReward: 20, coinReward: 15 },
  { id: "Q5", category: "ACTUALIDAD", difficulty: "EASY", question: "Que grupo yihadista opera en el Sahel (Liptako-Gourma)?", options: ["Boko Haram", "JNIM", "Al-Shabaab", "ISIS-K"], answerIdx: 1, explanation: "JNIM (Jama'at Nusrat al-Islam wal-Muslimin) es la rama de Al-Qaeda en el Sahel.", xpReward: 15, coinReward: 10 },
  { id: "Q6", category: "ECONOMIA", difficulty: "NORMAL", question: "Que porcentaje del comercio maritimo mundial se desvio por los ataques de los Huti?", options: ["~10%", "~30%", "~60%", "~90%"], answerIdx: 2, explanation: "Aproximadamente 60% del trafico por el Mar Rojo se desvio por el Cabo de Buena Esperanza.", xpReward: 20, coinReward: 15 },
  { id: "Q7", category: "GEOGRAFIA", difficulty: "NORMAL", question: "Que ciudad es el ultimo bastion de las FAR en Darfur occidental?", options: ["Nyala", "El Fasher", "Geneina", "Khartoum"], answerIdx: 1, explanation: "El Fasher, capital de Darfur del Norte, esta bajo asedio prolongado.", xpReward: 20, coinReward: 15 },
  { id: "Q8", category: "CONFLICTOS", difficulty: "HARD", question: "Que operacion naval lidera EE.UU. en el Mar Rojo contra los Huti?", options: ["Operacion Trident", "Operacion Prosperity Guardian", "Operacion Sea Shield", "Operacion Atalanta"], answerIdx: 1, explanation: "La Operacion Prosperity Guardian se lanzo en diciembre 2023.", xpReward: 30, coinReward: 25 },
  { id: "Q9", category: "HISTORIA", difficulty: "HARD", question: "En que ano se firmo el armisticio de la Guerra de Corea?", options: ["1951", "1953", "1955", "1957"], answerIdx: 1, explanation: "El armisticio se firmo el 27 de julio de 1953.", xpReward: 30, coinReward: 25 },
  { id: "Q10", category: "ECONOMIA", difficulty: "EASY", question: "Que moneda usan las sanciones de EE.UU. como instrumento principal?", options: ["Euro", "Yuan", "Dolar", "Rublo"], answerIdx: 2, explanation: "El dolar domina el comercio petrolero y financiero global, base del poder de sancion.", xpReward: 15, coinReward: 10 },
  { id: "Q11", category: "ACTUALIDAD", difficulty: "NORMAL", question: "Que sistema de defensa aerea intercepta drones Shahed?", options: ["Iron Dome", "Patriot", "THAAD", "S-400"], answerIdx: 1, explanation: "El sistema Patriot PAC-2/3 es usado por Ucrania contra Shahed-136.", xpReward: 20, coinReward: 15 },
  { id: "Q12", category: "CONFLICTOS", difficulty: "HARD", question: "¿Qué región disputada marca la línea mediana del estrecho de Taiwán?", options: ["Quemoy", "Matsu", "Línea mediana del estrecho", "Pescadores"], answerIdx: 2, explanation: "La línea mediana es la línea de control informal en el estrecho de Taiwán.", xpReward: 30, coinReward: 25 },
  { id: "Q13", category: "GEOGRAFIA", difficulty: "EASY", question: "Cual es la capital de Sudan?", options: ["Juba", "Jartum", "Port Sudan", "Omdurman"], answerIdx: 1, explanation: "Jartum es la capital de Sudan, en la confluencia del Nilo Blanco y Azul.", xpReward: 15, coinReward: 10 },
  { id: "Q14", category: "CONFLICTOS", difficulty: "NORMAL", question: "Que grupo controla el 80% de Puerto Principe (Haiti)?", options: ["Pandillas G9", "Fuerzas estatales", "MINUSTAH", "Casques Bleus"], answerIdx: 0, explanation: "Las pandillas del G9 y aliados controlan la mayor parte de Puerto Principe desde 2023.", xpReward: 20, coinReward: 15 },
  { id: "Q15", category: "HISTORIA", difficulty: "NORMAL", question: "Que acuerdo puso fin al conflicto armado en Colombia en 2016?", options: ["Acuerdo de Oslo", "Acuerdo de La Habana", "Acuerdo de Cartagena", "Proceso de paz de Caguán"], answerIdx: 1, explanation: "El Acuerdo de La Habana entre el gobierno colombiano y las FARC se firmo en 2016.", xpReward: 20, coinReward: 15 },
  { id: "Q16", category: "ACTUALIDAD", difficulty: "NORMAL", question: "Que milicia gobierna Myanmar tras el golpe de 2021?", options: ["PDF", "Tatmadaw", "Arakan Army", "KIA"], answerIdx: 1, explanation: "El Tatmadaw (ejercito de Myanmar) tomo el poder tras el golpe de febrero 2021.", xpReward: 20, coinReward: 15 },
  { id: "Q17", category: "ECONOMIA", difficulty: "HARD", question: "Que porcentaje del petroleo mundial cruza el estrecho de Ormuz?", options: ["10%", "20%", "40%", "60%"], answerIdx: 1, explanation: "Aproximadamente el 20% del petroleo mundial transita por el estrecho de Ormuz.", xpReward: 30, coinReward: 25 },
  { id: "Q18", category: "GEOGRAFIA", difficulty: "NORMAL", question: "Que pais no tiene frontera con Sudan?", options: ["Egipto", "Etiopia", "Chad", "Kenia"], answerIdx: 3, explanation: "Kenia no limita con Sudan; si lo hace con Sudan del Sur, pais independiente desde 2011.", xpReward: 20, coinReward: 15 },
  { id: "Q19", category: "CONFLICTOS", difficulty: "HARD", question: "Que organizacion reclamo el ataque al Sahel (Liptako-Gourma)?", options: ["Boko Haram", "Al-Shabaab", "JNIM", "ISIS-K"], answerIdx: 2, explanation: "JNIM (Jama'at Nusrat al-Islam wal-Muslimin) es la rama de Al-Qaeda en el Sahel.", xpReward: 30, coinReward: 25 },
  { id: "Q20", category: "HISTORIA", difficulty: "EASY", question: "En que ano cayo el Muro de Berlin?", options: ["1987", "1989", "1991", "1993"], answerIdx: 1, explanation: "El Muro de Berlin cayo el 9 de noviembre de 1989.", xpReward: 15, coinReward: 10 },
  { id: "Q21", category: "ECONOMIA", difficulty: "NORMAL", question: "Que moneda es la mas usada en reservas internacionales globales?", options: ["Euro", "Yen", "Dolar", "Yuan"], answerIdx: 2, explanation: "El dolar representa aproximadamente el 58% de las reservas internacionales.", xpReward: 20, coinReward: 15 },
  { id: "Q22", category: "ACTUALIDAD", difficulty: "NORMAL", question: "Que organizacion lidera la operacion naval en el Mar Rojo?", options: ["OTAN", "Union Europea", "Coalicion liderada por EE.UU.", "Rusia"], answerIdx: 2, explanation: "La Operacion Prosperity Guardian es liderada por EE.UU. con aliados.", xpReward: 20, coinReward: 15 },
  { id: "Q23", category: "CONFLICTOS", difficulty: "HARD", question: "Que acuerdo rige la frontera Libano-Israel desde 2006?", options: ["Resolucion 1701", "Acuerdos de Taif", "Linea Azul", "Armisticio de Rodas"], answerIdx: 0, explanation: "La Resolucion 1701 del Consejo de Seguridad puso fin a la guerra del Libano 2006.", xpReward: 30, coinReward: 25 },
  { id: "Q24", category: "GEOGRAFIA", difficulty: "EASY", question: "Cual es el estrecho que separa Asia de America?", options: ["Bering", "Magallanes", "Drake", "Bósforo"], answerIdx: 0, explanation: "El estrecho de Bering separa Rusia (Asia) de Alaska (America).", xpReward: 15, coinReward: 10 },
  { id: "Q25", category: "ECONOMIA", difficulty: "NORMAL", question: "Que bloque economico lidera el PIB mundial?", options: ["ASEAN", "UE", "USMCA", "Mercosur"], answerIdx: 1, explanation: "La Union Europea representa el segundo PIB mundial despues de EE.UU.", xpReward: 20, coinReward: 15 },
  { id: "Q26", category: "HISTORIA", difficulty: "HARD", question: "Que tratado creo la OTAN en 1949?", options: ["Tratado de Washington", "Tratado de Brussels", "Tratado de Londres", "Tratado de Ottawa"], answerIdx: 0, explanation: "El Tratado de Washington firmado en 1949 creo la Organizacion del Tratado del Atlantico Norte.", xpReward: 30, coinReward: 25 },
  { id: "Q27", category: "ACTUALIDAD", difficulty: "EASY", question: "Que pais es miembro permanente del Consejo de Seguridad de la ONU?", options: ["Alemania", "Japon", "Brasil", "China"], answerIdx: 3, explanation: "Los 5 miembros permanentes son EE.UU., China, Rusia, Reino Unido y Francia.", xpReward: 15, coinReward: 10 },
  { id: "Q28", category: "CONFLICTOS", difficulty: "NORMAL", question: "Que grupo reclamo la ofensiva sobre Karabaj en 2023?", options: ["Armenia", "Azerbaiyan", "Fuerzas de paz rusas", "OSCE"], answerIdx: 1, explanation: "Azerbaiyan lanzo una ofensiva relampago sobre Karabaj en septiembre 2023.", xpReward: 20, coinReward: 15 },
  { id: "Q29", category: "GEOGRAFIA", difficulty: "NORMAL", question: "Que rio divide El Cairo en dos partes?", options: ["Tigris", "Eufrates", "Nilo", "Jordán"], answerIdx: 2, explanation: "El Nilo atraviesa El Cairo dividiendola en Cairo Este y Cairo Oeste.", xpReward: 20, coinReward: 15 },
  { id: "Q30", category: "ECONOMIA", difficulty: "HARD", question: "Que porcentaje del gas natural licuado (LNG) mundial proviene de EE.UU. y Qatar combinados?", options: ["20%", "40%", "60%", "80%"], answerIdx: 1, explanation: "EE.UU. y Qatar juntos producen cerca del 40% del LNG mundial.", xpReward: 30, coinReward: 25 },
  { id: "Q31", category: "GEOGRAFIA", difficulty: "EASY", question: "Cual es la capital de Afganistan?", options: ["Kabul", "Herat", "Kandahar", "Mazar-e-Sharif"], answerIdx: 0, explanation: "Kabul es la capital y ciudad mas grande de Afganistan.", xpReward: 15, coinReward: 10 },
  { id: "Q32", category: "CONFLICTOS", difficulty: "NORMAL", question: "Que grupo controla Sanaa, capital de Yemen?", options: ["Huti", "Gobierno reconocido", "Al-Qaeda", "ISIS"], answerIdx: 0, explanation: "Los Huti (Ansar Allah) controlan Sanaa desde 2014.", xpReward: 20, coinReward: 15 },
  { id: "Q33", category: "HISTORIA", difficulty: "NORMAL", question: "En que ano se unificaron las dos Alemanias?", options: ["1989", "1990", "1991", "1992"], answerIdx: 1, explanation: "La reunificacion alemana se completo el 3 de octubre de 1990.", xpReward: 20, coinReward: 15 },
  { id: "Q34", category: "ECONOMIA", difficulty: "NORMAL", question: "Que es el SWIFT en el contexto de sanciones internacionales?", options: ["Un sistema de mensajeria financiera", "Una moneda digital", "Un banco central", "Un tratado comercial"], answerIdx: 0, explanation: "SWIFT es el sistema de mensajeria interbancaria usado globalmente; excluir a un pais afecta sus transacciones financieras.", xpReward: 20, coinReward: 15 },
  { id: "Q35", category: "ACTUALIDAD", difficulty: "HARD", question: "Que operacion lanzo Azerbaiyan sobre Karabaj en septiembre 2023?", options: ["Operacion Relampago", "Operacion Hierro", "Operacion Karabaj", "Operacion Paz"], answerIdx: 0, explanation: "Azerbaiyan llamo 'Operacion Relampago' a su ofensiva de 24h sobre Karabaj.", xpReward: 30, coinReward: 25 },
  { id: "Q36", category: "GEOGRAFIA", difficulty: "NORMAL", question: "Que rio atraviesa El Cairo?", options: ["Tigris", "Eufrates", "Nilo", "Jordán"], answerIdx: 2, explanation: "El Nilo atraviesa El Cairo de sur a norte, dividiendola en Cairo Este y Oeste.", xpReward: 20, coinReward: 15 },
  { id: "Q37", category: "CONFLICTOS", difficulty: "HARD", question: "Que organizacion es la rama de Al-Qaeda en el Sahel?", options: ["Boko Haram", "JNIM", "ISWAP", "Ansar Dine"], answerIdx: 1, explanation: "JNIM (Jama'at Nusrat al-Islam wal-Muslimin) es la rama oficial de Al-Qaeda en el Sahel.", xpReward: 30, coinReward: 25 },
  { id: "Q38", category: "HISTORIA", difficulty: "EASY", question: "Cuantos miembros permanentes tiene el Consejo de Seguridad de la ONU?", options: ["3", "5", "7", "10"], answerIdx: 1, explanation: "Los 5 miembros permanentes (P5) son EE.UU., China, Rusia, Reino Unido y Francia, con derecho a veto.", xpReward: 15, coinReward: 10 },
  { id: "Q39", category: "ECONOMIA", difficulty: "NORMAL", question: "Que pais es el mayor productor de petroleo del mundo en 2024?", options: ["Arabia Saudita", "EE.UU.", "Rusia", "Iran"], answerIdx: 1, explanation: "EE.UU. es el mayor productor de petroleo del mundo desde 2018, superando a Arabia Saudita y Rusia.", xpReward: 20, coinReward: 15 },
  { id: "Q40", category: "ACTUALIDAD", difficulty: "NORMAL", question: "¿Qué es la estrategia 'gray zone' (zona gris)?", options: ["Guerra abierta", "Acciones por debajo del umbral de conflicto", "Paz total", "Negociación diplomática"], answerIdx: 1, explanation: "La zona gris se refiere a acciones coercitivas por debajo del umbral de conflicto armado convencional (ej. Taiwan, Mar Rojo).", xpReward: 25, coinReward: 20 },
  { id: "Q41", category: "GEOGRAFIA", difficulty: "EASY", question: "Cual es la capital de Mozambique?", options: ["Maputo", "Beira", "Nampula", "Quelimane"], answerIdx: 0, explanation: "Maputo es la capital y ciudad mas grande de Mozambique.", xpReward: 15, coinReward: 10 },
  { id: "Q42", category: "CONFLICTOS", difficulty: "NORMAL", question: "Que grupo controla amplias zonas de Kivu en R.D. Congo?", options: ["M23", "Talibán", "Hezbolá", "ISIS-K"], answerIdx: 0, explanation: "El M23, respaldado por Rwanda segun la ONU, controla partes de Kivu Norte.", xpReward: 20, coinReward: 15 },
  { id: "Q43", category: "HISTORIA", difficulty: "HARD", question: "En que ano se firmo el Tratado de Paz entre Israel y Egipto?", options: ["1977", "1978", "1979", "1980"], answerIdx: 2, explanation: "El Tratado de Paz Israel-Egipto se firmo en 1979 en Camp David, EE.UU.", xpReward: 30, coinReward: 25 },
  { id: "Q44", category: "ECONOMIA", difficulty: "NORMAL", question: "Que porcentaje de las exportaciones rusas son hidrocarburos?", options: ["~30%", "~50%", "~70%", "~90%"], answerIdx: 1, explanation: "Aproximadamente el 50% de las exportaciones rusas son petroleo y gas natural.", xpReward: 20, coinReward: 15 },
  { id: "Q45", category: "ACTUALIDAD", difficulty: "EASY", question: "Que es el BRICS?", options: ["Un grupo de paises emergentes", "Un tratado militar", "Una moneda", "Una ONG"], answerIdx: 0, explanation: "BRICS es el grupo de economias emergentes: Brasil, Rusia, India, China y Sudafrica (ahora +6 paises).", xpReward: 15, coinReward: 10 },
  { id: "Q46", category: "CONFLICTOS", difficulty: "HARD", question: "¿Qué misión de paz de la ONU operó en el Congo hasta 2024?", options: ["MINUSCA", "MINUSMA", "MONUSCO", "UNMISS"], answerIdx: 2, explanation: "MONUSCO (Misión de la ONU en R.D. Congo) comenzó su retirada en 2024 tras 25 años.", xpReward: 30, coinReward: 25 },
  { id: "Q47", category: "GEOGRAFIA", difficulty: "NORMAL", question: "Que estrecho separa Arabia Saudita de Iran?", options: ["Ormuz", "Bab el-Mandeb", "Bósforo", "Hormuz"], answerIdx: 3, explanation: "El estrecho de Ormuz (o Hormuz) separa la peninsula arabica de Iran, ruta clave del petroleo.", xpReward: 20, coinReward: 15 },
  { id: "Q48", category: "HISTORIA", difficulty: "NORMAL", question: "En que ano cayo el imperio sovietico?", options: ["1989", "1990", "1991", "1992"], answerIdx: 2, explanation: "La Union Sovietica se disolvio oficialmente el 26 de diciembre de 1991.", xpReward: 20, coinReward: 15 },
  { id: "Q49", category: "ECONOMIA", difficulty: "HARD", question: "Que es el CIPS en el sistema financiero internacional?", options: ["Un sistema de pagos chino", "Un banco central europeo", "Una criptomoneda", "Un fondo de inversion"], answerIdx: 0, explanation: "CIPS (Cross-Border Interbank Payment System) es la alternativa china a SWIFT para pagos en yuan.", xpReward: 30, coinReward: 25 },
  { id: "Q50", category: "ACTUALIDAD", difficulty: "NORMAL", question: "Que operacion lanzo el Talibán para tomar Afganistan en 2021?", options: ["Operacion Tormenta", "Operacion Conquista", "Ofensiva de primavera", "Operacion 9/11"], answerIdx: 2, explanation: "El Talibán lanzo una ofensiva de primavera en 2021 que culmino con la toma de Kabul en agosto.", xpReward: 25, coinReward: 20 },
];

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  currency: "COINS" | "GEMS";
  category: "AVATAR" | "BRIEFING" | "BOOST" | "COSMETIC" | "CONSUMABLE" | "CAMERA" | "ELITE";
  icon: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: "AVATAR_001", title: "Insignia de Operador", description: "Avatar de operador especial con mascara balistica.", cost: 100, currency: "COINS", category: "AVATAR", icon: "glasses" },
  { id: "AVATAR_002", title: "Comandante de Flota", description: "Avatar con gorra de oficial naval.", cost: 150, currency: "COINS", category: "AVATAR", icon: "medal" },
  { id: "AVATAR_003", title: "Analista OSINT", description: "Avatar con HUD de datos en vivo.", cost: 200, currency: "COINS", category: "AVATAR", icon: "satellite" },
  { id: "AVATAR_004", title: "Francotirador", description: "Avatar con mascara de francotirador experto.", cost: 250, currency: "COINS", category: "AVATAR", icon: "crosshair" },
  { id: "AVATAR_005", title: "Mariscal de campo", description: "Avatar legendario con baston de mando.", cost: 500, currency: "COINS", category: "AVATAR", icon: "medal" },
  { id: "BRIEFING_TW_SECRET", title: "Informe clasificado Taiwán", description: "Desbloquea el briefing SECRETO del estrecho de Taiwán.", cost: 80, currency: "COINS", category: "BRIEFING", icon: "folder" },
  { id: "BOOST_XP_2X", title: "Doble XP (24h)", description: "Duplica tu ganancia de XP por 24 horas.", cost: 4, currency: "GEMS", category: "BOOST", icon: "zap" },
  { id: "BOOST_COIN_2X", title: "Doble monedas (24h)", description: "Duplica tus monedas por 24 horas.", cost: 4, currency: "GEMS", category: "BOOST", icon: "gem" },
  { id: "BOOST_HP_COMBAT", title: "HP extra en combate", description: "Empieza combates con 150 HP en lugar de 100.", cost: 3, currency: "GEMS", category: "BOOST", icon: "heart-pulse" },
  { id: "COSMETIC_REDHUD", title: "Tema HUD Rojo", description: "Cambia tu HUD a tema rojo sangre.", cost: 6, currency: "GEMS", category: "COSMETIC", icon: "palette" },
  { id: "COSMETIC_CYANHUD", title: "Tema HUD Cian", description: "Cambia tu HUD a tema cian tecnológico.", cost: 6, currency: "GEMS", category: "COSMETIC", icon: "palette" },
  { id: "CONSUMABLE_MEDKIT", title: "Kit medico de campo", description: "Restaura 50 HP en combate (un solo uso).", cost: 50, currency: "COINS", category: "CONSUMABLE", icon: "cross" },
  { id: "CONSUMABLE_AMMO", title: "Municion extra", description: "Duplica el ataque de tu proximo item en combate.", cost: 40, currency: "COINS", category: "CONSUMABLE", icon: "crosshair" },
  { id: "CAM_BASIC", title: "Camara GUARD-100", description: "Vigilancia estandar. Coloca donde quieras: capta eventos y genera intel 24/7.", cost: 350, currency: "COINS", category: "CAMERA", icon: "camera" },
  { id: "CAM_THERMAL", title: "Camara TERMICA 300", description: "Vision termica nocturna, radio ampliado y mayor recaudacion de intel.", cost: 850, currency: "COINS", category: "CAMERA", icon: "cctv" },
  { id: "CAM_TACTIC", title: "Camara 4K TACTICA", description: "Unidad de reconocimiento 4K con analisis automatico. Alta rentabilidad.", cost: 1600, currency: "COINS", category: "CAMERA", icon: "cctv" },
  { id: "CAM_PANO", title: "Panoramica 360-X", description: "Cobertura hemisferica: vigila varios frentes simultaneamente.", cost: 2400, currency: "COINS", category: "CAMERA", icon: "video" },
  { id: "CAM_ORBITAL", title: "Enlace Orbital V-9", description: "Nodo satelital de elite: continentes enteros bajo tu vigilancia. El nodo mas rentable.", cost: 10, currency: "GEMS", category: "CAMERA", icon: "satellite" },
  { id: "ELITE_PASS", title: "PASE ELITE (7 dias)", description: "Ingresos de cámaras x2, 3 gemas diarias, 15% de descuento en cámaras y credencial ELITE.", cost: 15, currency: "GEMS", category: "ELITE", icon: "crown" },
];

export interface WeeklyRewardDef {
  day: number; // 0=Lun
  title: string;
  description: string;
  coinReward: number;
  gemReward: number;
  xpReward: number;
}

export const WEEKLY_REWARDS: WeeklyRewardDef[] = [
  { day: 0, title: "Lunes — Caja de reclutamiento", description: "Bonus de inicio de semana.", coinReward: 50, gemReward: 0, xpReward: 40 },
  { day: 1, title: "Martes — Llave de inteligencia", description: "Recompensa de operacion.", coinReward: 70, gemReward: 1, xpReward: 60 },
  { day: 2, title: "Miercoles — Cofre de analista", description: "Tesoro del dia 3.", coinReward: 90, gemReward: 1, xpReward: 80 },
  { day: 3, title: "Jueves — Cache de campo", description: "Suministros para el frente.", coinReward: 110, gemReward: 1, xpReward: 100 },
  { day: 4, title: "Viernes — Caja de fin de semana", description: "Llegan los refuerzos.", coinReward: 150, gemReward: 2, xpReward: 130 },
  { day: 5, title: "Sábado — Botín del comando", description: "Recompensa de descanso activo.", coinReward: 200, gemReward: 2, xpReward: 160 },
  { day: 6, title: "Domingo — Capsula dorada", description: "Premio mayor semanal.", coinReward: 300, gemReward: 3, xpReward: 220 },
];

export interface PhotoItem {
  id: string;
  conflictId: string;
  title: string;
  caption: string;
  severity: AlertLevel;
  context: string;
  bda: string; // bomb damage assessment
  seed: string;
  image?: string; // ruta de la foto (v9: fotos REALES desde public/assets/real)
  real?: boolean; // marca de verificacion: material real re-hosted, no sintetico
}

export const PHOTOS: PhotoItem[] = [
  { id: "P-UKR-01", conflictId: "ukraine", title: "Subestacion impactada", caption: "Subestacion electrica despues de un ataque con Shahed-136.", severity: "CRITICO", context: "Region central de Ucrania. Sin bajas reportadas.", bda: "Danos moderados a transformadores. Servicio restablecido en 6h.", seed: "ukraine-grid", image: "/assets/osint/ukraine-substation.png" },
  { id: "P-UKR-02", conflictId: "ukraine", title: "Trinchera en Donetsk", caption: "Posición defensiva en la línea de contacto.", severity: "TENSION", context: "Frente de Avdiivka.", bda: "Posicion activa. Sin actividad enemiga inmediata.", seed: "ukraine-trench", image: "/assets/osint/ukraine-trench.png" },
  { id: "P-GAZA-01", conflictId: "gaza", title: "Edificio colapsado", caption: "Edificio residencial tras impacto en zona urbana.", severity: "CRITICO", context: "Jabalia, norte de Gaza.", bda: "Estructura colapsada. Evacuacion civil en curso.", seed: "gaza-building", image: "/assets/osint/gaza-urban.png" },
  { id: "P-GAZA-02", conflictId: "gaza", title: "Corredor humanitario", caption: "Camiones de ayuda en el corredor de Rafah.", severity: "INESTABILIDAD", context: "Rafah, sur de Gaza.", bda: "Trafico limitado. Sin incidentes.", seed: "gaza-aid", image: "/assets/osint/gaza-convoy.png" },
  { id: "P-LEB-01", conflictId: "lebanon", title: "Patrulla fronteriza", caption: "Vehiculo blindado en la Linea Azul.", severity: "TENSION", context: "Sur del Libano.", bda: "Patrulla de rutina.", seed: "lebanon-patrol", image: "/assets/osint/border-check.png" },
  { id: "P-SDN-01", conflictId: "sudan", title: "Jartom barrio afectado", caption: "Zona residencial con danos de combate.", severity: "CRITICO", context: "Jartum Norte.", bda: "Infraestructura civil danada.", seed: "sudan-street", image: "/assets/osint/gaza-urban.png" },
  { id: "P-SDN-02", conflictId: "elfasher", title: "Campo de refugiados", caption: "Campo de desplazados cerca de El Fasher.", severity: "CRITICO", context: "Darfur del Norte.", bda: "Condiciones humanitarias criticas.", seed: "elfasher-camp", image: "/assets/osint/refugee-camp.png" },
  { id: "P-RS-01", conflictId: "redsea", title: "Buque escoltado", caption: "Carguero bajo escolta naval.", severity: "INESTABILIDAD", context: "Mar Rojo, zona de Bab el-Mandeb.", bda: "Transito sin incidentes.", seed: "redsea-ship", image: "/assets/osint/naval-ship.png" },
  { id: "P-TW-01", conflictId: "taiwan", title: "Patrulla aerea", caption: "Caza de la ROCAF en mision de interceptacion.", severity: "TENSION", context: "ADIZ suroeste de Taiwan.", bda: "Incursion registrada y monitoreada.", seed: "taiwan-jet", image: "/assets/osint/jet-patrol.png" },
  { id: "P-KOR-01", conflictId: "korea", title: "DMZ punto de observacion", caption: "Puesto de observacion en la Zona Desmilitarizada.", severity: "VIGILANCIA", context: "DMZ, sector occidental.", bda: "Actividad rutinaria.", seed: "korea-dmz", image: "/assets/osint/border-check.png" },
  { id: "P-SAHEL-01", conflictId: "sahel", title: "Base avanzada", caption: "Puesto militar en la región del Liptako-Gourma.", severity: "INESTABILIDAD", context: "Triple frontera Mali-Niger-Burkina.", bda: "Base activa.", seed: "sahel-base", image: "/assets/osint/night-convoy.png" },
  { id: "P-HORMUZ-01", conflictId: "hormuz", title: "Patrullaje IRGC", caption: "Lanchas rapidas del IRGC en el estrecho.", severity: "VIGILANCIA", context: "Estrecho de Ormuz.", bda: "Actividad de rutina monitoreada.", seed: "hormuz-boat", image: "/assets/osint/naval-ship.png" },
  { id: "P-SOM-01", conflictId: "somalia", title: "Checkpoint en Mogadiscio", caption: "Puesto de control en las afueras de Mogadiscio.", severity: "INESTABILIDAD", context: "Mogadiscio, Somalia.", bda: "Control de seguridad activo.", seed: "somalia-check", image: "/assets/osint/border-check.png" },
  { id: "P-CONGO-01", conflictId: "drcongo", title: "Campo de refugiados Kivu", caption: "Campo de desplazados en Kivu Norte.", severity: "CRITICO", context: "Goma, R.D. Congo.", bda: "Condiciones humanitarias criticas.", seed: "congo-camp", image: "/assets/osint/refugee-camp.png" },
  { id: "P-AFG-01", conflictId: "afghanistan", title: "Patrulla Talibán", caption: "Patrulla del Talibán en Kabul.", severity: "INESTABILIDAD", context: "Kabul, Afganistan.", bda: "Control territorial consolidado.", seed: "afghan-patrol", image: "/assets/osint/night-convoy.png" },
  { id: "P-YEM-01", conflictId: "yemen", title: "Danos en Sanaa", caption: "Edificio residencial tras impacto en Sanaa.", severity: "CRITICO", context: "Sanaa, Yemen.", bda: "Infraestructura civil danada.", seed: "yemen-building", image: "/assets/osint/gaza-urban.png" },
  { id: "P-SYR-01", conflictId: "syria", title: "Convoy humanitario Idlib", caption: "Convoy de ayuda hacia zona opositora.", severity: "TENSION", context: "Idlib, Siria.", bda: "Transito monitoreado.", seed: "syria-convoy", image: "/assets/osint/gaza-convoy.png" },
  { id: "P-MOZ-01", conflictId: "mozambique", title: "Planta de gas abandonada", caption: "Instalacion de gas en Cabo Delgado.", severity: "INESTABILIDAD", context: "Palma, Mozambique.", bda: "Instalacion evacuada.", seed: "moz-gas", image: "/assets/osint/refinery-fire.png" },
  { id: "P-MEX-01", conflictId: "mexico", title: "Operativo en Culiacan", caption: "Operativo federal en zona de cárteles.", severity: "INESTABILIDAD", context: "Culiacan, Mexico.", bda: "Actividad de seguridad.", seed: "mexico-op", image: "/assets/osint/border-check.png" },
  { id: "P-KASH-01", conflictId: "kashmir", title: "Puesto fronterizo LoC", caption: "Puesto en la Linea de Control.", severity: "TENSION", context: "Cachemira, LoC.", bda: "Patrulla de rutina.", seed: "kashmir-loc", image: "/assets/osint/border-check.png" },
  { id: "P-KARABAKH-01", conflictId: "armenia", title: "Stepanakert abandonado", caption: "Vista de la capital de Karabaj tras éxodo.", severity: "CRITICO", context: "Stepanakert, Karabaj.", bda: "Ciudad deshabitada.", seed: "karakh-city", image: "/assets/osint/bridge-collapsed.png" },
  { id: "P-UKR-03", conflictId: "ukraine", title: "Trench warfare", caption: "Trinchera en primera linea bajo nieve.", severity: "CRITICO", context: "Donetsk, frente oriental.", bda: "Posicion activa.", seed: "ukr-trench2", image: "/assets/osint/ukraine-trench.png" },
  { id: "P-UKR-04", conflictId: "ukraine", title: "Dron strike aftermath", caption: "Crater de impacto de dron Shahed en zona urbana.", severity: "CRITICO", context: "Kiev, Ucrania.", bda: "Danos en infraestructura electrica.", seed: "ukr-drone2", image: "/assets/osint/ukraine-substation.png" },
  { id: "P-GAZA-03", conflictId: "gaza", title: "Tunel discovered", caption: "Acceso a tunel subterraneo hallado en operacion.", severity: "TENSION", context: "Frontera Gaza-Israel.", bda: "Tunel neutralizado.", seed: "gaza-tunnel", image: "/assets/osint/border-check.png" },
  { id: "P-GAZA-04", conflictId: "gaza", title: "Hospital damaged", caption: "Hospital con danos estructurales tras bombardeo.", severity: "CRITICO", context: "Gaza centro.", bda: "Hospital parcialmente operativo.", seed: "gaza-hospital", image: "/assets/osint/gaza-urban.png" },
  { id: "P-SUDAN-02", conflictId: "sudan", title: "Market destroyed", caption: "Mercado central de Jartum destruido.", severity: "CRITICO", context: "Jartum, Sudan.", bda: "Zona comercial devastada.", seed: "sudan-market", image: "/assets/osint/gaza-urban.png" },
  { id: "P-LEB-02", conflictId: "lebanon", title: "Rocket impact", caption: "Crater de cohete en zona residencial.", severity: "CRITICO", context: "Sur del Libano.", bda: "Edificio residential danado.", seed: "leb-rocket", image: "/assets/osint/gaza-urban.png" },
  { id: "P-RS-02", conflictId: "redsea", title: "Houthi missile launch", caption: "Lanzamiento de misil desde posicion costera.", severity: "TENSION", context: "Costa de Yemen.", bda: "Lanzamiento registrado.", seed: "rs-missile", image: "/assets/osint/naval-ship.png" },
  { id: "P-TW-02", conflictId: "taiwan", title: "Naval exercise", caption: "Flota naval china en ejercicio de bloqueo.", severity: "TENSION", context: "Estrecho de Taiwán.", bda: "Ejercicio monitorado.", seed: "tw-naval", image: "/assets/osint/naval-ship.png" },
  { id: "P-KOR-02", conflictId: "korea", title: "Border guard post", caption: "Puesto de guardia norte-coreano en la DMZ.", severity: "VIGILANCIA", context: "DMZ, sector central.", bda: "Actividad de rutina.", seed: "kor-guard", image: "/assets/osint/border-check.png" },
  { id: "P-SAHEL-02", conflictId: "sahel", title: "Patrol ambushed", caption: "Vehiculo militar con danos tras emboscada.", severity: "INESTABILIDAD", context: "Liptako-Gourma, Mali.", bda: "2 bajas, vehiculo destruido.", seed: "sahel-ambush", image: "/assets/osint/night-convoy.png" },

  // ============ v9: FOTOS REALES (14) — material real recolectado de la web ============
  { id: "P-REAL-01", conflictId: "ukraine", title: "Columna blindada REAL", caption: "Columna de tanques fotografiada en movimiento — material real verificado.", severity: "CRITICO", context: "Frente oriental. Imagen real recopilada por la red OSINT.", bda: "Actividad mecanizada confirmada visualmente.", seed: "real-tanks-1", image: "/assets/real/tanks-1.jpg", real: true },
  { id: "P-REAL-02", conflictId: "ukraine", title: "Blindados en ruta REAL", caption: "Vehiculo blindado de combate en carretera — foto real de archivo abierto.", severity: "TENSION", context: "Eje de avance. Material real de fuentes abiertas.", bda: "Movimiento logistico registrado.", seed: "real-tanks-2", image: "/assets/real/tanks-2.jpg", real: true },
  { id: "P-REAL-03", conflictId: "taiwan", title: "Caza en vuelo REAL", caption: "Caza militar en vuelo fotografia­do durante patrulla — imagen real.", severity: "TENSION", context: "ADIZ. Imagen real de avistamiento aereo.", bda: "Interceptacion documentada.", seed: "real-jet-1", image: "/assets/real/jet-1.jpg", real: true },
  { id: "P-REAL-04", conflictId: "taiwan", title: "Ala rotando REAL", caption: "Aeronave militar en aproximacion — foto real de spotter.", severity: "VIGILANCIA", context: "Base aerea. Material real.", bda: "Rotacion de escuadron observada.", seed: "real-jet-2", image: "/assets/real/jet-2.jpg", real: true },
  { id: "P-REAL-05", conflictId: "redsea", title: "Destructor en patrulla REAL", caption: "Buque de guerra en mar abierto — fotografia real verificada.", severity: "TENSION", context: "Aguas del Mar Rojo. Material real.", bda: "Escolta naval activa.", seed: "real-ship-1", image: "/assets/real/ship-1.jpg", real: true },
  { id: "P-REAL-06", conflictId: "redsea", title: "Flota en formacion REAL", caption: "Unidades navales en despliegue — imagen real de archivo.", severity: "VIGILANCIA", context: "Transito comercial escoltado. Material real.", bda: "Presencia naval sostenida.", seed: "real-ship-2", image: "/assets/real/ship-2.jpg", real: true },
  { id: "P-REAL-07", conflictId: "sahel", title: "Dron tactico REAL", caption: "Dron militar en zona de operaciones — foto real recolectada.", severity: "INESTABILIDAD", context: "Triple frontera. Material real de fuentes abiertas.", bda: "Vuelo de reconocimiento confirmado.", seed: "real-drone-1", image: "/assets/real/drone-1.jpg", real: true },
  { id: "P-REAL-08", conflictId: "sahel", title: "CUAS en despliegue REAL", caption: "Sistema de dron en posición — imagen real de campo.", severity: "TENSION", context: "Sector operativo. Material real.", bda: "Capacidad de huelga aerea presente.", seed: "real-drone-2", image: "/assets/real/drone-2.jpg", real: true },
  { id: "P-REAL-09", conflictId: "korea", title: "Lanzamiento REAL", caption: "Prueba de misil documentada en imagen real.", severity: "CRITICO", context: "Peninsula. Material real de registro publico.", bda: "Ensayo balistico confirmado.", seed: "real-missile-1", image: "/assets/real/missile-1.jpg", real: true },
  { id: "P-REAL-10", conflictId: "korea", title: "Ascenso del proyectil REAL", caption: "Fase inicial de lanzamiento capturada — foto real.", severity: "CRITICO", context: "Sitio de pruebas. Material real.", bda: "Trazado de vuelo en analisis.", seed: "real-missile-2", image: "/assets/real/missile-2.jpg", real: true },
  { id: "P-REAL-11", conflictId: "lebanon", title: "Capital de noche REAL", caption: "Skyline urbano nocturno en zona de alerta — foto real.", severity: "TENSION", context: "Beirut. Material real de archivo abierto.", bda: "Actividad urbana normal.", seed: "real-city-1", image: "/assets/real/city-1.jpg", real: true },
  { id: "P-REAL-12", conflictId: "lebanon", title: "Panorama urbano REAL", caption: "Vista panoramica de la capital — imagen real diurna.", severity: "VIGILANCIA", context: "Sector metropolitano. Material real.", bda: "Sin indicadores de escalada.", seed: "real-city-2", image: "/assets/real/city-2.jpg", real: true },
  { id: "P-REAL-13", conflictId: "mozambique", title: "Refineria en llamas REAL", caption: "Incendio industrial nocturno documentado — foto real.", severity: "CRITICO", context: "Instalacion energetica. Material real.", bda: "Columnas de humo visibles desde orbita.", seed: "real-fire-1", image: "/assets/real/fire-1.jpg", real: true },
  { id: "P-REAL-14", conflictId: "mozambique", title: "Fuego industrial REAL", caption: "Segundo angulo del incendio — imagen real verificada.", severity: "CRITICO", context: "Complejo de tanques. Material real.", bda: "Produccion detenida.", seed: "real-fire-2", image: "/assets/real/fire-2.jpg", real: true },
  { id: "P-REAL-15", conflictId: "ukraine", title: "Helicoptero de ataque REAL", caption: "Helicoptero militar en vuelo de combate — foto real verificada.", severity: "TENSION", context: "Frente oriental. Material real de fuentes abiertas.", bda: "Apoyo aereo cercano activo.", seed: "real-heli-1", image: "/assets/real/heli-1.jpg", real: true },
  { id: "P-REAL-16", conflictId: "ukraine", title: "Rotatorio en mission REAL", caption: "Segundo angulo del helicoptero en operacion — imagen real.", severity: "TENSION", context: "Sector aereo activo. Material real.", bda: "Rotacion de vuelo confirmada.", seed: "real-heli-2", image: "/assets/real/heli-2.jpg", real: true },
  { id: "P-REAL-17", conflictId: "taiwan", title: "Submarino en puerto REAL", caption: "Submarino naval atracado en base — fotografia real.", severity: "VIGILANCIA", context: "Base naval. Material real de archivo abierto.", bda: "Flotilla de submarinos operativa.", seed: "real-sub-1", image: "/assets/real/sub-1.jpg", real: true },
  { id: "P-REAL-18", conflictId: "ukraine", title: "Artilleria en accion REAL", caption: "Pieza de artilleria disparando — imagen real de frente.", severity: "CRITICO", context: "Linea de contacto. Material real.", bda: "Fuego de contrabateria registrado.", seed: "real-arty-1", image: "/assets/real/arty-1.jpg", real: true },
  { id: "P-REAL-19", conflictId: "korea", title: "Desfile militar REAL", caption: "Formacion de soldados en desfile — foto real verificada.", severity: "VIGILANCIA", context: "Capital. Material real de registro publico.", bda: "Escalada de senales simbolicas.", seed: "real-parade-1", image: "/assets/real/parade-1.jpg", real: true },
  { id: "P-REAL-20", conflictId: "taiwan", title: "Caza desde portaaviones REAL", caption: "Caza despegando de cubierta de portaaviones — imagen real.", severity: "TENSION", context: "Grupo de combate naval. Material real.", bda: "Operaciones de cubierta activas.", seed: "real-carrier-1", image: "/assets/real/carrier-1.jpg", real: true },
  { id: "P-REAL-21", conflictId: "mexico", title: "Muro fronterizo REAL", caption: "Barrera fronteriza en zona de patrulla — foto real.", severity: "INESTABILIDAD", context: "Frontera norte. Material real de archivo.", bda: "Infraestructura de control reforzada.", seed: "real-wall-1", image: "/assets/real/wall-1.jpg", real: true },
  { id: "P-REAL-22", conflictId: "sahel", title: "Blindado en el desierto REAL", caption: "Carro de combate en maniobras sobre arena — imagen real.", severity: "INESTABILIDAD", context: "Zona saheliense. Material real de fuentes abiertas.", bda: "Maniobras mecanizadas confirmadas.", seed: "real-desert-1", image: "/assets/real/desert-1.jpg", real: true },
  { id: "P-REAL-23", conflictId: "sahel", title: "Columna en arena REAL", caption: "Segundo angulo de las maniobras en desierto — foto real.", severity: "TENSION", context: "Sector operativo. Material real.", bda: "Movimiento de columnas registrado.", seed: "real-desert-2", image: "/assets/real/desert-2.jpg", real: true },
  { id: "P-REAL-24", conflictId: "taiwan", title: "Centro de radar REAL", caption: "Estacion de radar y mando con pantallas activas — imagen real.", severity: "VIGILANCIA", context: "Instalacion C2. Material real de archivo abierto.", bda: "Vigilancia electronica sostenida.", seed: "real-radar-1", image: "/assets/real/radar-1.jpg", real: true },
];

export const RANKS = [
  { name: "RECLUTA", minLevel: 1, color: "text-muted-foreground" },
  { name: "CABO", minLevel: 3, color: "text-green-hud" },
  { name: "SARGENTO", minLevel: 5, color: "text-green-hud" },
  { name: "TENIENTE", minLevel: 8, color: "text-cyan-hud" },
  { name: "CAPITAN", minLevel: 12, color: "text-cyan-hud" },
  { name: "MAYOR", minLevel: 16, color: "text-amber" },
  { name: "CORONEL", minLevel: 20, color: "text-amber" },
  { name: "GENERAL", minLevel: 25, color: "text-amber" },
  { name: "MARISCAL", minLevel: 30, color: "text-red-hud" },
];

export function getRankForLevel(level: number) {
  let result = RANKS[0];
  for (const r of RANKS) {
    if (level >= r.minLevel) result = r;
  }
  return result;
}

export function xpForLevel(level: number) {
  // 100, 250, 450, 700, 1000...
  return Math.round(100 * level + 25 * Math.pow(level, 2) - 25);
}

export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  category: string;
  // probabilidad estimada de YES (0..1)
  probability: number;
  odds: number; // multiplicador
  closesAt: string; // texto descriptivo
}

export const PREDICTION_MARKETS: PredictionMarket[] = [
  { id: "PM-GAZA-TREGUA-7D", title: "Tregua de 7 dias en Gaza", description: "Se lograra una tregua sostenida de al menos 7 dias en Gaza.", category: "ORIENTE MEDIO", probability: 0.42, odds: 2.4, closesAt: "en 14 dias" },
  { id: "PM-UKR-KHARKIV", title: "Ofensiva rusa en Jarkov", description: "Ofensiva terrestre rusa sobre Jarkov antes de fin de mes.", category: "EUROPA ORIENTAL", probability: 0.28, odds: 3.6, closesAt: "en 18 dias" },
  { id: "PM-LEB-HEZBOLAH", title: "Hezbol repliegue al norte del Litani", description: "Hezbol retira fuerzas al norte del Litani en 30 dias.", category: "ORIENTE MEDIO", probability: 0.18, odds: 5.4, closesAt: "en 30 dias" },
  { id: "PM-SDN-CESAR", title: "Cese al fuego en Sudan", description: "Cese al fuego bilateral firmado en 60 dias.", category: "AFRICA", probability: 0.12, odds: 8.0, closesAt: "en 60 dias" },
  { id: "PM-TAIWAN-INCIDENT", title: "Incidente en el estrecho de Taiwán", description: "Incidente militar reportado en el estrecho en 90 dias.", category: "INDO-PACIFICO", probability: 0.22, odds: 4.5, closesAt: "en 90 dias" },
  { id: "PM-HORMUZ-BLOCK", title: "Cierre del estrecho de Ormuz", description: "Cierre parcial del estrecho de Ormuz en 30 dias.", category: "GOLFO", probability: 0.06, odds: 16.0, closesAt: "en 30 dias" },
  { id: "PM-SAHEL-GOLPE", title: "Nuevo golpe en el Sahel", description: "Otro golpe militar en Malí, Niger o Burkina en 90 dias.", category: "AFRICA", probability: 0.34, odds: 2.9, closesAt: "en 90 dias" },
  { id: "PM-REDSEA-DROP", title: "Cae el trafico por el Mar Rojo", description: "El trafico comercial cae otro 10% en 30 dias.", category: "MARITIMO", probability: 0.55, odds: 1.8, closesAt: "en 30 dias" },
];

// elementos fusionables
export interface FusionRecipe {
  id: string;
  name: string;
  description: string;
  inputs: { label: string; emoji: string; quantity: number }[];
  output: { label: string; emoji: string; quantity: number };
  cost: number; // monedas
  xpReward: number;
  rarity: "COMUN" | "RARO" | "EPICO" | "LEGENDARIO";
}

export const FUSION_RECIPES: FusionRecipe[] = [
  {
    id: "F1",
    name: "Sintesis de inteligencia",
    description: "Combina tres cables en bruto en un informe depurado.",
    inputs: [
      { label: "Cable bruto", emoji: "radio", quantity: 3 },
      { label: "Foto OSINT", emoji: "image", quantity: 1 },
    ],
    output: { label: "Informe depurado", emoji: "bar-chart", quantity: 1 },
    cost: 30,
    xpReward: 60,
    rarity: "COMUN",
  },
  {
    id: "F2",
    name: "Paquete satelital",
    description: "Construye un paquete satelital con fotos y datos.",
    inputs: [
      { label: "Foto OSINT", emoji: "image", quantity: 2 },
      { label: "Informe depurado", emoji: "bar-chart", quantity: 1 },
    ],
    output: { label: "Paquete satelital", emoji: "satellite", quantity: 1 },
    cost: 60,
    xpReward: 120,
    rarity: "RARO",
  },
  {
    id: "F3",
    name: "Dossier de crisis",
    description: "Sintetiza un dossier completo de crisis.",
    inputs: [
      { label: "Paquete satelital", emoji: "satellite", quantity: 2 },
      { label: "Informe depurado", emoji: "bar-chart", quantity: 2 },
    ],
    output: { label: "Dossier de crisis", emoji: "folder", quantity: 1 },
    cost: 120,
    xpReward: 200,
    rarity: "EPICO",
  },
  {
    id: "F4",
    name: "Operacion clasificada",
    description: "Fusion final para generar una operacion clasificada.",
    inputs: [
      { label: "Dossier de crisis", emoji: "folder", quantity: 2 },
      { label: "Paquete satelital", emoji: "satellite", quantity: 1 },
    ],
    output: { label: "Operacion clasificada", emoji: "medal", quantity: 1 },
    cost: 250,
    xpReward: 350,
    rarity: "LEGENDARIO",
  },
];

// Elementos base que el jugador colecciona
export interface InventoryItem {
  id: string;
  label: string;
  emoji: string;
  rarity: "COMUN" | "RARO" | "EPICO" | "LEGENDARIO";
  source: string;
}

export const BASE_INVENTORY_ITEMS: InventoryItem[] = [
  { id: "raw_cable", label: "Cable bruto", emoji: "radio", rarity: "COMUN", source: "Noticias en vivo" },
  { id: "raw_photo", label: "Foto OSINT", emoji: "image", rarity: "COMUN", source: "Galería OSINT" },
];

// Helper: generar alias por defecto
export function defaultAlias() {
  return "AGENTE-" + Math.floor(Math.random() * 9000 + 1000);
}

// Helper: clave semanal
export function currentWeekKey(d = new Date()) {
  const year = d.getFullYear();
  const start = new Date(year, 0, 1);
  const diff = (d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const week = Math.ceil((diff + start.getDay() + 1) / 7);
  return `${year}-W${week}`;
}

// Helper: dia de la semana (0=Lun..6=Dom)
export function currentDayIndex(d = new Date()) {
  // JS: 0=Domingo, 1=Lunes.. querremos Lun=0
  return (d.getDay() + 6) % 7;
}

// ====== Achievements ======
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "PROGRESO" | "COMBATE" | "INTEL" | "SOCIAL" | "ESPECIAL" | "VIGILANCIA" | "GUERRA" | "MERCADO" | "GANANCIAS";
  icon: string; // icon key (rendered via VIcon)
  rarity: "COMUN" | "RARO" | "EPICO" | "LEGENDARIO";
  xpReward: number;
  coinReward: number;
  gemReward: number;
  // check function takes state snapshot, returns boolean unlocked
  check: (s: AchievementState) => boolean;
  progress: (s: AchievementState) => { current: number; target: number };
}

export interface AchievementState {
  level: number;
  streak: number;
  fusionCount: number;
  quizCorrect: number;
  readBriefings: number;
  viewedNews: number;
  viewedPhotos: number;
  openedMaps: number;
  predictions: number;
  coins: number;
  gems: number;
  unlockedBriefings: number;
  claimedMissions: number;
  logrosUnlocked: number;
  visitedTabs?: string[];
  minigameBestScore?: number;
  camerasPlaced?: number;
  cameraEvents?: number;
  cameraIncome?: number;
  conquestTerritories?: number;
  conquestCaptures?: number;
  conquestWins?: number;
  marketTrades?: number;
  marketProfit?: number;
  myVideos?: number;
  myPolls?: number;
  myPhotos?: number;
  mpCaptures?: number;
  mpWins?: number;
  // v8 — centro de ganancias / staking / apuestas / pase
  wheelSpins?: number;
  crateOpens?: number;
  stakeCount?: number;
  betsWon?: number;
  passTierReached?: number;
  conquestCapturesTotal?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // PROGRESO
  { id: "ACH-FIRST-LOGIN", title: "Primer contacto", description: "Inicia sesion por primera vez.", category: "PROGRESO", icon: "crosshair", rarity: "COMUN", xpReward: 30, coinReward: 20, gemReward: 0, check: (s) => s.level >= 1, progress: (s) => ({ current: Math.min(1, s.level), target: 1 }) },
  { id: "ACH-LVL-5", title: "Operador confirmado", description: "Alcanza el nivel 5.", category: "PROGRESO", icon: "star", rarity: "RARO", xpReward: 100, coinReward: 80, gemReward: 1, check: (s) => s.level >= 5, progress: (s) => ({ current: Math.min(s.level, 5), target: 5 }) },
  { id: "ACH-LVL-10", title: "Veterano de campo", description: "Alcanza el nivel 10.", category: "PROGRESO", icon: "medal", rarity: "EPICO", xpReward: 250, coinReward: 200, gemReward: 2, check: (s) => s.level >= 10, progress: (s) => ({ current: Math.min(s.level, 10), target: 10 }) },
  { id: "ACH-LVL-20", title: "Comando elite", description: "Alcanza el nivel 20.", category: "PROGRESO", icon: "trophy", rarity: "LEGENDARIO", xpReward: 500, coinReward: 400, gemReward: 5, check: (s) => s.level >= 20, progress: (s) => ({ current: Math.min(s.level, 20), target: 20 }) },

  // COMBATE
  { id: "ACH-STREAK-3", title: "Racha inicial", description: "Mantén una racha de 3 dias.", category: "COMBATE", icon: "flame", rarity: "COMUN", xpReward: 50, coinReward: 40, gemReward: 0, check: (s) => s.streak >= 3, progress: (s) => ({ current: Math.min(s.streak, 3), target: 3 }) },
  { id: "ACH-STREAK-7", title: "Semana perfecta", description: "Mantén una racha de 7 dias.", category: "COMBATE", icon: "zap", rarity: "RARO", xpReward: 120, coinReward: 100, gemReward: 1, check: (s) => s.streak >= 7, progress: (s) => ({ current: Math.min(s.streak, 7), target: 7 }) },
  { id: "ACH-STREAK-30", title: "Mes inquebrantable", description: "Mantén una racha de 30 dias.", category: "COMBATE", icon: "gem", rarity: "LEGENDARIO", xpReward: 600, coinReward: 500, gemReward: 6, check: (s) => s.streak >= 30, progress: (s) => ({ current: Math.min(s.streak, 30), target: 30 }) },

  // INTEL
  { id: "ACH-BRIEF-1", title: "Primer informe", description: "Lee tu primer briefing.", category: "INTEL", icon: "file-text", rarity: "COMUN", xpReward: 25, coinReward: 20, gemReward: 0, check: (s) => s.readBriefings >= 1, progress: (s) => ({ current: Math.min(s.readBriefings, 1), target: 1 }) },
  { id: "ACH-BRIEF-ALL", title: "Analista completo", description: "Lee los 6 briefings disponibles.", category: "INTEL", icon: "book-open", rarity: "EPICO", xpReward: 200, coinReward: 180, gemReward: 2, check: (s) => s.readBriefings >= 6, progress: (s) => ({ current: Math.min(s.readBriefings, 6), target: 6 }) },
  { id: "ACH-NEWS-30", title: "Monitor de cables", description: "Revisa 30 noticias en vivo.", category: "INTEL", icon: "newspaper", rarity: "RARO", xpReward: 100, coinReward: 80, gemReward: 1, check: (s) => s.viewedNews >= 30, progress: (s) => ({ current: Math.min(s.viewedNews, 30), target: 30 }) },
  { id: "ACH-PHOTOS-10", title: "Verificador OSINT", description: "Inspecciona 10 fotos verificadas.", category: "INTEL", icon: "image", rarity: "RARO", xpReward: 100, coinReward: 80, gemReward: 1, check: (s) => s.viewedPhotos >= 10, progress: (s) => ({ current: Math.min(s.viewedPhotos, 10), target: 10 }) },
  { id: "ACH-QUIZ-12", title: "Estratega maestro", description: "Acerta las 12 preguntas del quiz.", category: "INTEL", icon: "brain", rarity: "EPICO", xpReward: 220, coinReward: 200, gemReward: 2, check: (s) => s.quizCorrect >= 12, progress: (s) => ({ current: Math.min(s.quizCorrect, 12), target: 12 }) },
  { id: "ACH-FUSION-5", title: "Maestro de fusion", description: "Realiza 5 fusiones.", category: "INTEL", icon: "flask", rarity: "EPICO", xpReward: 220, coinReward: 200, gemReward: 2, check: (s) => s.fusionCount >= 5, progress: (s) => ({ current: Math.min(s.fusionCount, 5), target: 5 }) },
  { id: "ACH-PREDICT-5", title: "Vidente", description: "Realiza 5 predicciones.", category: "INTEL", icon: "crystal", rarity: "RARO", xpReward: 100, coinReward: 80, gemReward: 1, check: (s) => s.predictions >= 5, progress: (s) => ({ current: Math.min(s.predictions, 5), target: 5 }) },

  // SOCIAL
  { id: "ACH-MAPS-10", title: "Cartografo", description: "Explora los 10 frentes del mapa.", category: "SOCIAL", icon: "map", rarity: "EPICO", xpReward: 200, coinReward: 150, gemReward: 2, check: (s) => s.openedMaps >= 10, progress: (s) => ({ current: Math.min(s.openedMaps, 10), target: 10 }) },
  { id: "ACH-MISSIONS-10", title: "Operador eficiente", description: "Reclama 10 misiones.", category: "SOCIAL", icon: "check-circle", rarity: "RARO", xpReward: 120, coinReward: 100, gemReward: 1, check: (s) => s.claimedMissions >= 10, progress: (s) => ({ current: Math.min(s.claimedMissions, 10), target: 10 }) },

  // ESPECIAL
  { id: "ACH-COINS-1000", title: "Magnate", description: "Acumula 1000 monedas.", category: "ESPECIAL", icon: "coins", rarity: "EPICO", xpReward: 200, coinReward: 0, gemReward: 3, check: (s) => s.coins >= 1000, progress: (s) => ({ current: Math.min(s.coins, 1000), target: 1000 }) },
  { id: "ACH-COINS-5000", title: "Baron", description: "Acumula 5000 monedas.", category: "ESPECIAL", icon: "landmark", rarity: "LEGENDARIO", xpReward: 500, coinReward: 0, gemReward: 5, check: (s) => s.coins >= 5000, progress: (s) => ({ current: Math.min(s.coins, 5000), target: 5000 }) },
  { id: "ACH-UNLOCK-SECRET", title: "Claro secreto", description: "Desbloquea el briefing SECRETO de Taiwán.", category: "ESPECIAL", icon: "key", rarity: "RARO", xpReward: 150, coinReward: 100, gemReward: 1, check: (s) => s.unlockedBriefings >= 1, progress: (s) => ({ current: Math.min(s.unlockedBriefings, 1), target: 1 }) },
  // 5 new achievements (total 25)
  { id: "ACH-VISIT-20", title: "Explorador incansable", description: "Visita 20 pestañas diferentes en una sesion.", category: "PROGRESO", icon: "compass", rarity: "RARO", xpReward: 100, coinReward: 80, gemReward: 1, check: (s) => s.visitedTabs ? s.visitedTabs.length >= 20 : false, progress: (s) => ({ current: Math.min((s.visitedTabs || []).length, 20), target: 20 }) },
  { id: "ACH-QUIZ-STREAK-10", title: "Racha mental", description: "Acerta 10 preguntas del quiz sin fallar.", category: "INTEL", icon: "flame", rarity: "EPICO", xpReward: 200, coinReward: 150, gemReward: 2, check: (s) => s.quizCorrect >= 10, progress: (s) => ({ current: Math.min(s.quizCorrect, 10), target: 10 }) },
  { id: "ACH-ALL-QUIZ", title: "Maestro del quiz", description: "Acerta las 40 preguntas del quiz.", category: "INTEL", icon: "crown", rarity: "LEGENDARIO", xpReward: 600, coinReward: 500, gemReward: 5, check: (s) => s.quizCorrect >= 40, progress: (s) => ({ current: Math.min(s.quizCorrect, 40), target: 40 }) },
  { id: "ACH-MINIGAME-1000", title: "Centurion", description: "Alcanza 1000 puntos en el mini-game.", category: "COMBATE", icon: "swords", rarity: "EPICO", xpReward: 250, coinReward: 200, gemReward: 2, check: (s) => (s.minigameBestScore ?? 0) >= 1000, progress: (s) => ({ current: Math.min(s.minigameBestScore ?? 0, 1000), target: 1000 }) },
  { id: "ACH-MINIGAME-2000", title: "Leyenda del combate", description: "Alcanza 2000 puntos en el mini-game.", category: "COMBATE", icon: "trophy", rarity: "LEGENDARIO", xpReward: 500, coinReward: 400, gemReward: 5, check: (s) => (s.minigameBestScore ?? 0) >= 2000, progress: (s) => ({ current: Math.min(s.minigameBestScore ?? 0, 2000), target: 2000 }) },

  // VIGILANCIA (camaras)
  { id: "ACH-CAM-1", title: "Ojo en el muro", description: "Coloca tu primera camara de vigilancia.", category: "VIGILANCIA", icon: "camera", rarity: "COMUN", xpReward: 40, coinReward: 30, gemReward: 0, check: (s) => (s.camerasPlaced ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.camerasPlaced ?? 0, 1), target: 1 }) },
  { id: "ACH-CAM-5", title: "Red de vigilancia", description: "Opera 5 camaras simultaneamente.", category: "VIGILANCIA", icon: "cctv", rarity: "RARO", xpReward: 120, coinReward: 100, gemReward: 1, check: (s) => (s.camerasPlaced ?? 0) >= 5, progress: (s) => ({ current: Math.min(s.camerasPlaced ?? 0, 5), target: 5 }) },
  { id: "ACH-CAM-10", title: "Gran hermano", description: "Opera 10 camaras simultaneamente.", category: "VIGILANCIA", icon: "video", rarity: "EPICO", xpReward: 250, coinReward: 200, gemReward: 2, check: (s) => (s.camerasPlaced ?? 0) >= 10, progress: (s) => ({ current: Math.min(s.camerasPlaced ?? 0, 10), target: 10 }) },
  { id: "ACH-EVENT-10", title: "Devastacion documentada", description: "Captura 10 eventos en vivo con tus camaras.", category: "VIGILANCIA", icon: "zap", rarity: "RARO", xpReward: 140, coinReward: 120, gemReward: 1, check: (s) => (s.cameraEvents ?? 0) >= 10, progress: (s) => ({ current: Math.min(s.cameraEvents ?? 0, 10), target: 10 }) },
  { id: "ACH-EVENT-40", title: "Archivo de guerra", description: "Captura 40 eventos en vivo con tus camaras.", category: "VIGILANCIA", icon: "film", rarity: "LEGENDARIO", xpReward: 400, coinReward: 350, gemReward: 4, check: (s) => (s.cameraEvents ?? 0) >= 40, progress: (s) => ({ current: Math.min(s.cameraEvents ?? 0, 40), target: 40 }) },
  // GUERRA MUNDIAL (v6)
  { id: "ACH-WAR-1", title: "Primera sangre", description: "Conquista tu primer territorio en MUNDO DE GUERRA.", category: "GUERRA", icon: "crosshair", rarity: "COMUN", xpReward: 50, coinReward: 40, gemReward: 0, check: (s) => (s.conquestCaptures ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.conquestCaptures ?? 0, 1), target: 1 }) },
  { id: "ACH-WAR-5", title: "Senor de la guerra", description: "Conquista 5 territorios en MUNDO DE GUERRA.", category: "GUERRA", icon: "swords", rarity: "RARO", xpReward: 150, coinReward: 130, gemReward: 1, check: (s) => (s.conquestCaptures ?? 0) >= 5, progress: (s) => ({ current: Math.min(s.conquestCaptures ?? 0, 5), target: 5 }) },
  { id: "ACH-WAR-10", title: "Superpotencia", description: "Controla 10 territorios simultaneamente.", category: "GUERRA", icon: "globe", rarity: "EPICO", xpReward: 280, coinReward: 240, gemReward: 2, check: (s) => (s.conquestTerritories ?? 0) >= 10, progress: (s) => ({ current: Math.min(s.conquestTerritories ?? 0, 10), target: 10 }) },
  { id: "ACH-WAR-WIN", title: "Dominio mundial", description: "Conquista los 24 territorios del planeta.", category: "GUERRA", icon: "crown", rarity: "LEGENDARIO", xpReward: 500, coinReward: 500, gemReward: 5, check: (s) => (s.conquestWins ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.conquestWins ?? 0, 1), target: 1 }) },
  { id: "ACH-CAP-50", title: "Conquistador total", description: "Acumula 50 capturas historicas en MUNDO DE GUERRA.", category: "GUERRA", icon: "crosshair", rarity: "EPICO", xpReward: 320, coinReward: 280, gemReward: 3, check: (s) => (s.conquestCapturesTotal ?? 0) >= 50, progress: (s) => ({ current: Math.min(s.conquestCapturesTotal ?? 0, 50), target: 50 }) },
  // MERCADO (v6)
  { id: "ACH-TRD-1", title: "Primer inversion", description: "Compra tu primer activo soberano en el MERCADO.", category: "MERCADO", icon: "trending-up", rarity: "COMUN", xpReward: 45, coinReward: 35, gemReward: 0, check: (s) => (s.marketTrades ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.marketTrades ?? 0, 1), target: 1 }) },
  { id: "ACH-TRD-10", title: "Inversor activo", description: "Ejecuta 10 operaciones en el mercado.", category: "MERCADO", icon: "bar-chart", rarity: "RARO", xpReward: 130, coinReward: 110, gemReward: 1, check: (s) => (s.marketTrades ?? 0) >= 10, progress: (s) => ({ current: Math.min(s.marketTrades ?? 0, 10), target: 10 }) },
  { id: "ACH-TRD-500", title: "Mogul geopolitico", description: "Acumula +500 de beneficio realizado.", category: "MERCADO", icon: "gem", rarity: "EPICO", xpReward: 300, coinReward: 260, gemReward: 3, check: (s) => (s.marketProfit ?? 0) >= 500, progress: (s) => ({ current: Math.max(0, Math.min(s.marketProfit ?? 0, 500)), target: 500 }) },
  { id: "ACH-STK-1", title: "Renta pasiva", description: "Abre tu primera posicion de staking soberano.", category: "MERCADO", icon: "trending-up", rarity: "COMUN", xpReward: 60, coinReward: 50, gemReward: 0, check: (s) => (s.stakeCount ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.stakeCount ?? 0, 1), target: 1 }) },
  { id: "ACH-STK-5", title: "Banquero de guerra", description: "Mantén 5 posiciones de staking simultaneas.", category: "MERCADO", icon: "bar-chart", rarity: "RARO", xpReward: 180, coinReward: 150, gemReward: 2, check: (s) => (s.stakeCount ?? 0) >= 5, progress: (s) => ({ current: Math.min(s.stakeCount ?? 0, 5), target: 5 }) },

  // ====== v7: CONTENIDO + MULTIJUGADOR ======
  { id: "ACH-VID-1", title: "Productor de campo", description: "Publica tu primer video en GlobalVision (+50 gemas por video).", category: "SOCIAL", icon: "signal", rarity: "RARO", xpReward: 120, coinReward: 100, gemReward: 2, check: (s) => (s.myVideos ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.myVideos ?? 0, 1), target: 1 }) },
  { id: "ACH-VID-3", title: "Estudio de guerra", description: "Publica 3 videos en tu canal de GlobalVision.", category: "SOCIAL", icon: "video", rarity: "EPICO", xpReward: 260, coinReward: 220, gemReward: 4, check: (s) => (s.myVideos ?? 0) >= 3, progress: (s) => ({ current: Math.min(s.myVideos ?? 0, 3), target: 3 }) },
  { id: "ACH-POL-1", title: "Sondeador", description: "Crea tu primera encuesta para la comunidad.", category: "SOCIAL", icon: "vote", rarity: "COMUN", xpReward: 60, coinReward: 50, gemReward: 1, check: (s) => (s.myPolls ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.myPolls ?? 0, 1), target: 1 }) },
  { id: "ACH-POL-5", title: "Barometro global", description: "Crea 5 encuestas sobre el estado del mundo.", category: "SOCIAL", icon: "poll", rarity: "RARO", xpReward: 150, coinReward: 130, gemReward: 2, check: (s) => (s.myPolls ?? 0) >= 5, progress: (s) => ({ current: Math.min(s.myPolls ?? 0, 5), target: 5 }) },
  { id: "ACH-FOT-1", title: "Ojo OSINT", description: "Publica tu primera foto en la galería.", category: "SOCIAL", icon: "image", rarity: "COMUN", xpReward: 60, coinReward: 50, gemReward: 0, check: (s) => (s.myPhotos ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.myPhotos ?? 0, 1), target: 1 }) },
  { id: "ACH-MP-1", title: "Captura online", description: "Captura tu primer territorio en el MULTIJUGADOR global.", category: "GUERRA", icon: "crosshair", rarity: "RARO", xpReward: 130, coinReward: 110, gemReward: 2, check: (s) => (s.mpCaptures ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.mpCaptures ?? 0, 1), target: 1 }) },
  { id: "ACH-MP-10", title: "Señor de la red", description: "Captura 10 territorios en partidas multijugador.", category: "GUERRA", icon: "swords", rarity: "EPICO", xpReward: 280, coinReward: 240, gemReward: 3, check: (s) => (s.mpCaptures ?? 0) >= 10, progress: (s) => ({ current: Math.min(s.mpCaptures ?? 0, 10), target: 10 }) },
  { id: "ACH-MP-WIN", title: "Campeon del mundo online", description: "Logra el DOMINIO GLOBAL en una partida multijugador.", category: "GUERRA", icon: "crown", rarity: "LEGENDARIO", xpReward: 600, coinReward: 550, gemReward: 6, check: (s) => (s.mpWins ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.mpWins ?? 0, 1), target: 1 }) },
  { id: "ACH-INCOME-2000", title: "Magnate de la intel", description: "Recauda 2000 monedas con tu red de cámaras.", category: "ESPECIAL", icon: "coins", rarity: "EPICO", xpReward: 250, coinReward: 0, gemReward: 3, check: (s) => (s.cameraIncome ?? 0) >= 2000, progress: (s) => ({ current: Math.min(s.cameraIncome ?? 0, 2000), target: 2000 }) },

  // GANANCIAS (v8) — ruleta / cajones / apuestas / pase de temporada
  { id: "ACH-GAN-1", title: "Primer giro", description: "Gira la ruleta diaria del Centro de Ganancias.", category: "GANANCIAS", icon: "zap", rarity: "COMUN", xpReward: 40, coinReward: 30, gemReward: 0, check: (s) => (s.wheelSpins ?? 0) >= 1, progress: (s) => ({ current: Math.min(s.wheelSpins ?? 0, 1), target: 1 }) },
  { id: "ACH-GAN-10", title: "Adicto a la fortuna", description: "Gira la ruleta diaria 10 veces.", category: "GANANCIAS", icon: "star", rarity: "RARO", xpReward: 160, coinReward: 130, gemReward: 1, check: (s) => (s.wheelSpins ?? 0) >= 10, progress: (s) => ({ current: Math.min(s.wheelSpins ?? 0, 10), target: 10 }) },
  { id: "ACH-GAN-CRATE5", title: "Cazador de cajones", description: "Abre 5 cajones de suministros.", category: "GANANCIAS", icon: "gem", rarity: "RARO", xpReward: 170, coinReward: 140, gemReward: 2, check: (s) => (s.crateOpens ?? 0) >= 5, progress: (s) => ({ current: Math.min(s.crateOpens ?? 0, 5), target: 5 }) },
  { id: "ACH-GAN-BET10", title: "Mano firme", description: "Gana 10 apuestas de guerra (simples o parley).", category: "GANANCIAS", icon: "coins", rarity: "EPICO", xpReward: 300, coinReward: 260, gemReward: 3, check: (s) => (s.betsWon ?? 0) >= 10, progress: (s) => ({ current: Math.min(s.betsWon ?? 0, 10), target: 10 }) },
  { id: "ACH-GAN-PASS5", title: "Operador de temporada", description: "Alcanza el nivel 5 del Pase Vanguard.", category: "GANANCIAS", icon: "medal", rarity: "EPICO", xpReward: 280, coinReward: 240, gemReward: 3, check: (s) => (s.passTierReached ?? 0) >= 5, progress: (s) => ({ current: Math.min(s.passTierReached ?? 0, 5), target: 5 }) },
];


// ====== Daily Challenges (rotating mini-quests) ======
export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  coinReward: number;
  target: number;
  action: string;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  { id: "DC-1", title: "Patrulla matinal", description: "Visita 3 pestañas diferentes en una sola sesion.", icon: "sunrise", xpReward: 25, coinReward: 20, target: 3, action: "VISIT_TAB" },
  { id: "DC-2", title: "Caza de amenazas", description: "Elimina 5 objetivos hostiles en el mini-game.", icon: "crosshair", xpReward: 40, coinReward: 35, target: 5, action: "MINIGAME_HITS" },
  { id: "DC-3", title: "Coleccionista de cables", description: "Revisa 4 cables de noticias en vivo.", icon: "radio", xpReward: 30, coinReward: 25, target: 4, action: "VIEW_NEWS" },
  { id: "DC-4", title: "Verificador de campo", description: "Inspecciona 2 fotos OSINT.", icon: "image", xpReward: 25, coinReward: 20, target: 2, action: "VIEW_PHOTO" },
  { id: "DC-5", title: "Analista certero", description: "Responde 3 preguntas del quiz correctamente.", icon: "brain", xpReward: 50, coinReward: 40, target: 3, action: "QUIZ_CORRECT" },
  { id: "DC-6", title: "Profeta", description: "Realiza 2 predicciones en el mercado.", icon: "crystal", xpReward: 40, coinReward: 35, target: 2, action: "PREDICT" },
  { id: "DC-7", title: "Sintesis avanzada", description: "Realiza 1 fusion exitosa.", icon: "flask", xpReward: 50, coinReward: 45, target: 1, action: "FUSION" },
  { id: "DC-8", title: "Explorador global", description: "Abre el mapa y visita 2 frentes.", icon: "map", xpReward: 25, coinReward: 20, target: 2, action: "OPEN_MAP" },
  { id: "DC-9", title: "Operador CCTV", description: "Captura 3 eventos en vivo con tu red de camaras.", icon: "camera", xpReward: 45, coinReward: 40, target: 3, action: "CAM_EVENT" },
];

// ====== Tournaments / Leaderboard (mock data) ======
export interface TournamentEntry {
  rank: number;
  alias: string;
  avatar: string;
  score: number;
  level: number;
  isPlayer?: boolean;
}

export interface Tournament {
  id: string;
  title: string;
  category: string;
  metric: string; // what's being measured
  endsIn: string;
  topPrize: { coins: number; gems: number };
  leaderboard: TournamentEntry[];
}

export const TOURNAMENTS: Tournament[] = [
  {
    id: "T-QUIZ-WEEK",
    title: "Copa Estratega",
    category: "Quiz",
    metric: "Aciertos de quiz esta semana",
    endsIn: "3d 14h",
    topPrize: { coins: 500, gems: 5 },
    leaderboard: [
      { rank: 1, alias: "AGUILEGEND-7", avatar: "bird", score: 47, level: 18 },
      { rank: 2, alias: "FALCON_Omega", avatar: "swords", score: 42, level: 15 },
      { rank: 3, alias: "RAVEN_Alpha", avatar: "bird", score: 38, level: 14 },
      { rank: 4, alias: "WOLF_Tactico", avatar: "dog", score: 35, level: 11 },
      { rank: 5, alias: "GHOST_Cmd", avatar: "ghost", score: 31, level: 9 },
      { rank: 6, alias: "VIPER_X", avatar: "bug", score: 28, level: 8 },
      { rank: 7, alias: "SHADE_Ops", avatar: "glasses", score: 24, level: 7 },
    ],
  },
  {
    id: "T-MINIGAME-WEEK",
    title: "Operacion Tritón",
    category: "Mini-game",
    metric: "Puntuacion total en Threat Assessment",
    endsIn: "5d 02h",
    topPrize: { coins: 800, gems: 8 },
    leaderboard: [
      { rank: 1, alias: "REAPER_Pro", avatar: "skull", score: 1240, level: 20 },
      { rank: 2, alias: "BLADE_Tac", avatar: "swords", score: 980, level: 16 },
      { rank: 3, alias: "HUNTER_K", avatar: "crosshair", score: 845, level: 13 },
      { rank: 4, alias: "STORM_Ops", avatar: "zap", score: 720, level: 11 },
      { rank: 5, alias: "NIGHT_V", avatar: "moon", score: 615, level: 9 },
      { rank: 6, alias: "PHOENIX_R", avatar: "flame", score: 540, level: 8 },
      { rank: 7, alias: "SILVER_F", avatar: "shield", score: 480, level: 7 },
    ],
  },
  {
    id: "T-XP-WEEK",
    title: "Maraton Operacional",
    category: "Progreso",
    metric: "XP ganada durante la semana",
    endsIn: "1d 22h",
    topPrize: { coins: 600, gems: 6 },
    leaderboard: [
      { rank: 1, alias: "TITAN_Cmd", avatar: "landmark", score: 3420, level: 22 },
      { rank: 2, alias: "ATLAS_Ops", avatar: "globe", score: 2890, level: 19 },
      { rank: 3, alias: "COBRA_K", avatar: "bug", score: 2410, level: 16 },
      { rank: 4, alias: "MAMBA_X", avatar: "shield", score: 1980, level: 14 },
      { rank: 5, alias: "DELTA_F", avatar: "zap", score: 1620, level: 12 },
      { rank: 6, alias: "OMEGA_T", avatar: "Ω", score: 1340, level: 10 },
      { rank: 7, alias: "GAMMA_Ops", avatar: "γ", score: 1080, level: 8 },
    ],
  },
];

// ====== Progress history (for charts) ======
export interface ProgressPoint {
  ts: number;
  label: string;
  xp: number;
  coins: number;
}

// initial mock history + helper to extend with current session
export const INITIAL_HISTORY: ProgressPoint[] = [
  { ts: Date.now() - 6 * 86400000, label: "D-6", xp: 0, coins: 250 },
  { ts: Date.now() - 5 * 86400000, label: "D-5", xp: 80, coins: 290 },
  { ts: Date.now() - 4 * 86400000, label: "D-4", xp: 180, coins: 340 },
  { ts: Date.now() - 3 * 86400000, label: "D-3", xp: 320, coins: 410 },
  { ts: Date.now() - 2 * 86400000, label: "D-2", xp: 480, coins: 380 },
  { ts: Date.now() - 86400000, label: "D-1", xp: 680, coins: 450 },
];

// ====== Friends / Alliance system ======
export interface Friend {
  id: string;
  alias: string;
  avatar: string;
  level: number;
  rank: string;
  online: boolean;
  lastActive: string;
  stats: {
    quizCorrect: number;
    minigameBest: number;
    missionsClaimed: number;
    streak: number;
  };
}

export const FRIENDS: Friend[] = [
  { id: "F1", alias: "WOLF_Tactico", avatar: "dog", level: 14, rank: "CAPITAN", online: true, lastActive: "ahora", stats: { quizCorrect: 11, minigameBest: 720, missionsClaimed: 9, streak: 5 } },
  { id: "F2", alias: "FALCON_X", avatar: "bird", level: 18, rank: "MAYOR", online: true, lastActive: "ahora", stats: { quizCorrect: 12, minigameBest: 980, missionsClaimed: 14, streak: 12 } },
  { id: "F3", alias: "GHOST_Cmd", avatar: "ghost", level: 9, rank: "TENIENTE", online: false, lastActive: "hace 2h", stats: { quizCorrect: 6, minigameBest: 380, missionsClaimed: 4, streak: 0 } },
  { id: "F4", alias: "VIPER_K", avatar: "bug", level: 8, rank: "SARGENTO", online: false, lastActive: "hace 1d", stats: { quizCorrect: 5, minigameBest: 290, missionsClaimed: 3, streak: 0 } },
  { id: "F5", alias: "RAVEN_Alpha", avatar: "bird", level: 11, rank: "CAPITAN", online: true, lastActive: "ahora", stats: { quizCorrect: 9, minigameBest: 540, missionsClaimed: 8, streak: 3 } },
  { id: "F6", alias: "PHOENIX_R", avatar: "flame", level: 6, rank: "CABO", online: false, lastActive: "hace 4h", stats: { quizCorrect: 3, minigameBest: 180, missionsClaimed: 2, streak: 1 } },
];

// ====== Notification system ======
export interface Notification {
  id: string;
  type: "ACHIEVEMENT" | "MISSION" | "WEEKLY" | "TOURNAMENT" | "SYSTEM" | "FRIEND";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  icon: string;
}

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "N1", type: "SYSTEM", title: "Bienvenido a VANGUARD", message: "Tu cuenta ha sido activada. Reclama tu bono diario de conexion.", timestamp: Date.now() - 3600000, read: false, icon: "shield" },
  { id: "N2", type: "WEEKLY", title: "Recompensa semanal disponible", message: "El dia 1 de tu calendario semanal esta listo para reclamar.", timestamp: Date.now() - 1800000, read: false, icon: "gift" },
  { id: "N3", type: "TOURNAMENT", title: "Torneo: Copa Estratega", message: "Una nueva temporada del torneo de Quiz ha comenzado. Premios: 500 monedas + 5 gemas.", timestamp: Date.now() - 7200000, read: false, icon: "trophy" },
  { id: "N4", type: "FRIEND", title: "FALCON_X esta en linea", message: "Tu aliado FALCON_X ha iniciado sesion. Nivel 18, rango MAYOR.", timestamp: Date.now() - 900000, read: true, icon: "bird" },
  { id: "N5", type: "SYSTEM", title: "Nuevos conflictos detectados", message: "Se han anadido 6 nuevos frentes al mapa global: Myanmar, Venezuela, Colombia, Haiti, Sahara y Karabaj.", timestamp: Date.now() - 86400000, read: true, icon: "map" },
];

// ====== Streak calendar ======
export interface StreakDay {
  date: string; // YYYY-MM-DD
  claimed: boolean;
  day: number; // 1..N
  reward: number; // coins
}

// Generate last 30 days for streak visualization
export function generateStreakHistory(currentStreak: number, lastLogin: string | null): StreakDay[] {
  const days: StreakDay[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    // last `currentStreak` days are claimed (going back from today)
    const daysAgo = i;
    const claimed = daysAgo < currentStreak;
    days.push({
      date: dateStr,
      claimed,
      day: 30 - i,
      reward: 30 + (30 - i) * 10,
    });
  }
  return days;
}

// ====== Historical Wars (Middle Ages, Ancient, WWII, etc.) ======
export interface HistoricalWar {
  id: string;
  name: string;
  era: "ANTIGUA" | "EDAD_MEDIA" | "MODERNA" | "CONTEMPORANEA";
  yearStart: number;
  yearEnd: number;
  region: string;
  lat: number;
  lng: number;
  summary: string;
  factions: string[];
  outcome: string;
  casualties: string;
  significance: string;
  emoji: string;
}

export const HISTORICAL_WARS: HistoricalWar[] = [
  {
    id: "HW-PUNIC",
    name: "Guerras Punicas",
    era: "ANTIGUA",
    yearStart: -264,
    yearEnd: -146,
    region: "Mediterraneo",
    lat: 37.0,
    lng: 14.0,
    summary: "Tres guerras entre Roma y Cartago por el control del Mediterraneo occidental. Incluye la famosa marcha de Anibal con elefantes por los Alpes.",
    factions: ["Republica Romana", "Cartago"],
    outcome: "Victoria romana · Cartago destruida en 146 a.C.",
    casualties: "~1M+ (est.)",
    significance: "Consolido a Roma como potencia mediterranea absoluta.",
    emoji: "landmark",
  },
  {
    id: "HW-ROMAN-GAUL",
    name: "Conquista de la Galia",
    era: "ANTIGUA",
    yearStart: -58,
    yearEnd: -50,
    region: "Galia (Francia)",
    lat: 47.0,
    lng: 2.0,
    summary: "Julio Cesar conquista la Galia tras 8 anos de campañas. Descrita en 'De Bello Gallico'. Incluye el famoso sitio de Alesia.",
    factions: ["Republica Romana (Cesar)", "Galos (Vercingetorix)"],
    outcome: "Victoria romana · Galia anexada al Imperio",
    casualties: "~1M galos muertos/esclavizados",
    significance: "Expansion territorial romana y base para el futuro Imperio.",
    emoji: "swords",
  },
  {
    id: "HW-CRUSADES",
    name: "Cruzadas",
    era: "EDAD_MEDIA",
    yearStart: 1096,
    yearEnd: 1291,
    region: "Tierra Santa",
    lat: 31.8,
    lng: 35.2,
    summary: "Nueve cruzadas lanzadas por la cristiandad para recuperar Jerusalen del control musulman. Primera Cruzada (1099) exitosa, luego fracasos.",
    factions: ["Cruzados europeos", "Imperio Ayubida", "Selyucidas"],
    outcome: "Fracaso final · Caida de Acre en 1291",
    casualties: "1-3M (est.)",
    significance: "Intercambio cultural Europa-Oriente, debilitamiento Bizancio.",
    emoji: "cross",
  },
  {
    id: "HW-HUNDRED",
    name: "Guerra de los Cien Años",
    era: "EDAD_MEDIA",
    yearStart: 1337,
    yearEnd: 1453,
    region: "Francia",
    lat: 47.0,
    lng: 2.5,
    summary: "Conflicto dinastico entre Inglaterra y Francia. Incluye figuras legendarias como Juana de Arco. Batallas de Crecy, Agincourt y Orleans.",
    factions: ["Reino de Inglaterra", "Reino de Francia"],
    outcome: "Victoria francesa · Inglaterra pierde territorios continentales",
    casualties: "~3-5M (est.)",
    significance: "Consolido las identidades nacionales de Francia e Inglaterra.",
    emoji: "castle",
  },
  {
    id: "HW-NAPOLONIC",
    name: "Guerras Napoleonicas",
    era: "MODERNA",
    yearStart: 1803,
    yearEnd: 1815,
    region: "Europa",
    lat: 50.8,
    lng: 4.3,
    summary: "Series de conflictos entre el Imperio Frances de Napoleon y potencias europeas. Batallas de Austerlitz, Waterloo, Leipzig.",
    factions: ["Imperio Frances", "Coalicion (UK, Rusia, Prusia, Austria)"],
    outcome: "Derrota de Napoleon en Waterloo (1815)",
    casualties: "~3-6M (est.)",
    significance: "Redibujo el mapa de Europa, surgio el nacionalismo moderno.",
    emoji: "flag",
  },
  {
    id: "HW-WW1",
    name: "Primera Guerra Mundial",
    era: "CONTEMPORANEA",
    yearStart: 1914,
    yearEnd: 1918,
    region: "Europa / Global",
    lat: 49.5,
    lng: 2.8,
    summary: "Guerra total entre Aliados y Potencias Centrales. Trincheras, gas venenoso, primera guerra mecanizada. Tratado de Versalles.",
    factions: ["Aliados (UK, Francia, Rusia, EE.UU.)", "Potencias Centrales (Alemania, Austria-Hungria, Otomano)"],
    outcome: "Victoria aliada · Tratado de Versalles",
    casualties: "~20M muertos",
    significance: "Fin de imperios (otomano, austrohungaro, ruso), inicio del siglo XX.",
    emoji: "medal",
  },
  {
    id: "HW-WW2",
    name: "Segunda Guerra Mundial",
    era: "CONTEMPORANEA",
    yearStart: 1939,
    yearEnd: 1945,
    region: "Global",
    lat: 50.0,
    lng: 10.0,
    summary: "El conflicto mas mortifero de la historia. Frentes en Europa, Pacifico, Africa. Holocausto, bombas atomicas en Hiroshima y Nagasaki.",
    factions: ["Aliados (UK, URSS, EE.UU., Francia)", "Eje (Alemania nazi, Japon, Italia)"],
    outcome: "Rendicion del Eje · ONU creada",
    casualties: "~70-85M muertos",
    significance: "Nuevo orden mundial, Guerra Fria, descolonizacion.",
    emoji: "globe",
  },
  {
    id: "HW-VIETNAM",
    name: "Guerra de Vietnam",
    era: "CONTEMPORANEA",
    yearStart: 1955,
    yearEnd: 1975,
    region: "Sudeste Asiatico",
    lat: 16.0,
    lng: 107.0,
    summary: "Guerra fria proxy entre Vietnam del Norte (comunista) y del Sur (apoyado por EE.UU.). Guerra de guerrillas, Napalm, protestas masivas.",
    factions: ["Vietnam del Norte (Vietcong)", "Vietnam del Sur + EE.UU."],
    outcome: "Victoria del Norte · Reunificacion en 1975",
    casualties: "~3-5M (est.)",
    significance: "Cambio en politica exterior de EE.UU., fin de la conscripcion.",
    emoji: "radar",
  },
  {
    id: "HW-COLD",
    name: "Guerra Fria",
    era: "CONTEMPORANEA",
    yearStart: 1947,
    yearEnd: 1991,
    region: "Global",
    lat: 50.0,
    lng: 30.0,
    summary: "Tension geopolitica entre EE.UU. y URSS sin conflicto directo. Carrera armamentista, espionaje, guerras proxy (Corea, Vietnam, Afganistan).",
    factions: ["EE.UU. + OTAN", "URSS + Pacto de Varsovia"],
    outcome: "Colapso de la URSS en 1991",
    casualties: "~20M en guerras proxy (est.)",
    significance: "Fin del comunismo sovietico, unipolaridad momentanea de EE.UU.",
    emoji: "radiation",
  },
  {
    id: "HW-GERMANIC",
    name: "Guerras Germanicas",
    era: "ANTIGUA",
    yearStart: -12,
    yearEnd: 16,
    region: "Germania (Alemania)",
    lat: 51.0,
    lng: 10.0,
    summary: "Campanas de Druso y Tiberio para conquistar Germania. Derrota romana en el bosque de Teutoburgo (9 d.C.) por Arminio.",
    factions: ["Imperio Romano", "Tribus germanicas (Arminio)"],
    outcome: "Frontera del Rin consolidada · Germania no conquistada",
    casualties: "~100K (est.)",
    significance: "Detuvo la expansion romana al este del Rin, definio la frontera cultural Europea.",
    emoji: "shield",
  },
];

// ====== Famous Battles & Deaths ======
export interface FamousFigure {
  id: string;
  name: string;
  emoji: string;
  role: string;
  deathYear: number;
  deathPlace: string;
  cause: string;
  war: string;
  description: string;
  famous: boolean;
}

export const FAMOUS_FIGURES: FamousFigure[] = [
  { id: "FF1", name: "Julio Cesar", emoji: "landmark", role: "Dictador romano", deathYear: -44, deathPlace: "Roma", cause: "Asesinato (23 puñaladas)", war: "Guerras Civiles Romanas", description: "Asesinado por conspiradores en el Senado, incluido Bruto. Sus ultimas palabras: 'Tu quoque, fili mi?'", famous: true },
  { id: "FF2", name: "Anibal Barca", emoji: "swords", role: "General cartaginés", deathYear: -183, deathPlace: "Bitinia", cause: "Suicidio por veneno", war: "Guerras Punicas", description: "Cruzó los Alpes con elefantes. Derrotado por Roma, se exilio y se enveneno para no caer prisionero.", famous: true },
  { id: "FF3", name: "Espartaco", emoji: "swords", role: "Gladiador rebelde", deathYear: -71, deathPlace: "Apulia, Italia", cause: "Muerto en batalla", war: "Tercera Guerra Servil", description: "Lidero una rebelión de esclavos contra Roma. Crucificados 6,000 seguidores tras su derrota.", famous: true },
  { id: "FF4", name: "Atila el Huno", emoji: "crosshair", role: "Rey de los Hunos", deathYear: 453, deathPlace: "Hungria", cause: "Hemorragia nupcial", war: "Invasiones barbaras", description: "Murió de un sangrado nasal la noche de su boda. Su imperio se desintegro rapidamente.", famous: true },
  { id: "FF5", name: "Juana de Arco", emoji: "cross", role: "Heroína francesa", deathYear: 1431, deathPlace: "Rouen, Francia", cause: "Quemada en la hoguera", war: "Guerra de los Cien Años", description: "Quemada viva a los 19 años por herejía. Canonizada en 1920. Lideró tropas francesas con 17 años.", famous: true },
  { id: "FF6", name: "Napoleón Bonaparte", emoji: "flag", role: "Emperador francés", deathYear: 1821, deathPlace: "Santa Helena", cause: "Cancer estomacal", war: "Guerras Napoleonicas", description: "Exiliado en una isla remota del Atlantico Sur. Murió en cautiverio a los 51 años.", famous: true },
  { id: "FF7", name: "Horacio Nelson", emoji: "anchor", role: "Almirante británico", deathYear: 1805, deathPlace: "Trafalgar", cause: "Herida de bala", war: "Guerras Napoleonicas", description: "Muerto por un francotirador frances en la batalla de Trafalgar. Su cuerpo fue preservado en brandy.", famous: true },
  { id: "FF8", name: "Erwin Rommel", emoji: "mountain", role: "Mariscal aleman", deathYear: 1944, deathPlace: "Herrlingen, Alemania", cause: "Suicidio forzado", war: "Segunda Guerra Mundial", description: 'Forzado a suicidarse por envenenamiento tras ser implicado en el complot contra Hitler. "Zorro del Desierto".', famous: true },
  { id: "FF9", name: "George S. Patton", emoji: "star", role: "General EE.UU.", deathYear: 1945, deathPlace: "Heidelberg, Alemania", cause: "Accidente automovilistico", war: "Segunda Guerra Mundial", description: "Sobrevivió a la guerra pero murio días despues de un accidente de coche en Alemania ocupada.", famous: true },
  { id: "FF10", name: "Che Guevara", emoji: "star", role: "Revolucionario", deathYear: 1967, deathPlace: "Bolivia", cause: "Ejecucion", war: "Guerra Fria (proxy)", description: "Capturado y ejecutado por la CIA y ejercito boliviano. Sus restos fueron encontrados 30 años despues.", famous: true },
  { id: "FF11", name: "Gengis Kan", emoji: "crosshair", role: "Emperador mongol", deathYear: 1227, deathPlace: "Desconocido", cause: "Desconocida", war: "Conquistas mongolas", description: "Su tumba jamas fue encontrada. Se cree que fue sepultado en secreto y los soldados mataron a los testigos.", famous: true },
  { id: "FF12", name: "Alejandro Magno", emoji: "crown", role: "Rey macedonio", deathYear: -323, deathPlace: "Babilonia", cause: "Fiebre (posible envenenamiento)", war: "Conquistas macedonicas", description: "Murio a los 32 años tras conquistar el mayor imperio conocido. Causa real sigue en debate.", famous: true },
  { id: "FF13", name: "Leonidas I", emoji: "shield", role: "Rey espartano", deathYear: -480, deathPlace: "Termopilas", cause: "Muerto en batalla", war: "Guerras Medicas", description: "Murio con 300 espartanos defendiendo el paso de Termopilas contra el ejercito persa de Jerjes.", famous: true },
  { id: "FF14", name: "Adolf Hitler", emoji: "skull", role: "Dictador aleman", deathYear: 1945, deathPlace: "Berlin", cause: "Suicidio", war: "Segunda Guerra Mundial", description: "Se disparo y se enveneno en su bunker mientras las tropas sovieticas tomaban Berlin.", famous: true },
  { id: "FF15", name: "Benito Mussolini", emoji: "IT", role: "Dictador italiano", deathYear: 1945, deathPlace: "Milan", cause: "Ejecucion y colgado", war: "Segunda Guerra Mundial", description: "Fusilado por partisanos, su cuerpo fue colgado boca abajo en una gasolinera de Milan.", famous: true },
];

// ====== War Betting System ======
export interface WarBet {
  id: string;
  warName: string;
  emoji: string;
  factionA: string;
  factionB: string;
  oddsA: number;
  oddsB: number;
  probabilityA: number;
  category: "ANTIGUA" | "MEDIEVAL" | "MODERNA" | "ACTUAL";
  description: string;
}

export const WAR_BETS: WarBet[] = [
  { id: "WB1", warName: "Guerras Punicas", emoji: "landmark", factionA: "Roma", factionB: "Cartago", oddsA: 1.4, oddsB: 3.2, probabilityA: 0.65, category: "ANTIGUA", description: "Roma vs Cartago por el Mediterraneo. ¿Quien gano historicamente?" },
  { id: "WB2", warName: "Batalla de Termopilas", emoji: "shield", factionA: "Esparta (300)", factionB: "Imperio Persa", oddsA: 5.0, oddsB: 1.15, probabilityA: 0.15, category: "ANTIGUA", description: "300 espartanos vs 100,000 persas. Leonidas murio pero detuvo el avance." },
  { id: "WB3", warName: "Cruzadas", emoji: "cross", factionA: "Cruzados", factionB: "Musulmanes", oddsA: 2.0, oddsB: 1.8, probabilityA: 0.45, category: "MEDIEVAL", description: "9 cruzadas por Jerusalen. ¿Quien mantuvo el control al final?" },
  { id: "WB4", warName: "Guerra de los Cien Años", emoji: "castle", factionA: "Francia", factionB: "Inglaterra", oddsA: 1.5, oddsB: 2.5, probabilityA: 0.60, category: "MEDIEVAL", description: "116 años de guerra. Juana de Arco cambio el rumbo." },
  { id: "WB5", warName: "Waterloo", emoji: "flag", factionA: "Aliados (UK/Prusia)", factionB: "Napoleon", oddsA: 1.6, oddsB: 2.3, probabilityA: 0.55, category: "MODERNA", description: "Batalla final de Napoleon. ¿Quien prevalecio?" },
  { id: "WB6", warName: "WWII Europa", emoji: "globe", factionA: "Aliados", factionB: "Eje", oddsA: 1.3, oddsB: 3.5, probabilityA: 0.70, category: "ACTUAL", description: "El conflicto mas grande de la historia. ¿Quien gano?" },
  { id: "WB7", warName: "Vietnam", emoji: "radar", factionA: "Vietnam del Norte", factionB: "EE.UU. + Sur", oddsA: 1.7, oddsB: 2.1, probabilityA: 0.52, category: "ACTUAL", description: "Guerra de guerrillas. ¿Quien gano historicamente?" },
  { id: "WB8", warName: "Guerra Fria", emoji: "radiation", factionA: "EE.UU.", factionB: "URSS", oddsA: 1.2, oddsB: 5.0, probabilityA: 0.80, category: "ACTUAL", description: "45 años de tension. ¿Quien colapso primero?" },
];

// ====== Country Control Game ======
export interface ConquerableCountry {
  id: string;
  name: string;
  flag: string;
  region: string;
  defense: number;
  reward: number;
  emoji: string;
}

export const CONQUERABLE_COUNTRIES: ConquerableCountry[] = [
  { id: "CC1", name: "Ucrania", flag: "UA", region: "Europa Oriental", defense: 60, reward: 100, emoji: "shield" },
  { id: "CC2", name: "Gaza", flag: "PS", region: "Oriente Medio", defense: 40, reward: 80, emoji: "swords" },
  { id: "CC3", name: "Taiwán", flag: "TW", region: "Indo-Pacífico", defense: 55, reward: 90, emoji: "palmtree" },
  { id: "CC4", name: "Sudán", flag: "SD", region: "África", defense: 35, reward: 70, emoji: "mountain" },
  { id: "CC5", name: "Afganistan", flag: "AF", region: "Asia Central", defense: 45, reward: 75, emoji: "mountain" },
  { id: "CC6", name: "Mexico (Sinaloa)", flag: "MX", region: "America Latina", defense: 50, reward: 85, emoji: "pill" },
  { id: "CC7", name: "R.D. Congo", flag: "CD", region: "África Central", defense: 30, reward: 60, emoji: "gem" },
  { id: "CC8", name: "Libano", flag: "LB", region: "Oriente Medio", defense: 38, reward: 65, emoji: "tree" },
  { id: "CC9", name: "Haití", flag: "HT", region: "Caribe", defense: 25, reward: 50, emoji: "flame" },
  { id: "CC10", name: "Myanmar", flag: "MM", region: "Sudeste Asiático", defense: 42, reward: 78, emoji: "castle" },
  { id: "CC11", name: "Somalia", flag: "SO", region: "Cuerno de África", defense: 28, reward: 55, emoji: "swords" },
  { id: "CC12", name: "Venezuela", flag: "VE", region: "America Latina", defense: 48, reward: 82, emoji: "fuel" },
];
