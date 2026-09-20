// Vanguard v7 — datos del mini-servicio de tiempo real (:3003).
// Salas de chat, comunidad simulada y territorios del Mundo de Guerra multijugador.

// ================= SALAS DE CHAT =================
export interface RoomDef {
  id: string;
  name: string;
  desc: string;
  color: string; // amber | green | red | violet | cyan
}

export const ROOMS: RoomDef[] = [
  { id: "general", name: "Cantina", desc: "Cantina del comando · charla libre", color: "amber" },
  { id: "ucrania", name: "Frente Este", desc: "Frente Ucrania · noticias y rumores", color: "green" },
  { id: "mercado", name: "Bolsa", desc: "Cripto-paises · senales y P/L en vivo", color: "green" },
  { id: "camaras", name: "CCTV", desc: "Operadores de camaras · devastaciones", color: "cyan" },
  { id: "guerra", name: "Guerra", desc: "Mundo de Guerra · buscar aliados", color: "red" },
  { id: "osint", name: "OSINT", desc: "Fotos OSINT · verificacion cruzada", color: "violet" },
  { id: "ciber", name: "Ciber", desc: "Ciberataques, drones y senales", color: "cyan" },
  { id: "latam", name: "LATAM", desc: "Charla hispana · comunidad latina", color: "amber" },
];

// ================= COMUNIDAD SIMULADA =================
export interface BotIdentity {
  name: string;
  country: string; // ISO para FlagBadge
}

export const BOTS: BotIdentity[] = [
  { name: "VIPER_7", country: "US" },
  { name: "KOBRA_REAL", country: "RU" },
  { name: "NOMADA_88", country: "MX" },
  { name: "LUNA_OSINT", country: "ES" },
  { name: "CNDOR_SUR", country: "AR" },
  { name: "HAWK_EYE", country: "GB" },
  { name: "RATTA_X", country: "BR" },
  { name: "SOMBRA_ANDINA", country: "CO" },
  { name: "ZORRO_DIGITAL", country: "CL" },
  { name: "BUHO_NOCTURNO", country: "DE" },
  { name: "PANTERA_ROJA", country: "CN" },
  { name: "COBRA_LATAM", country: "PE" },
];

// Mensajes ambientales por sala (sin emojis, estilo comunidad tactica)
export const AMBIENT: Record<string, string[]> = {
  general: [
    "alguien mas vio el cable de las 06:00? movio todo el tablero",
    "racha de 9 dias aqui, no la rompan",
    "el nuevo HUD esta muy limpio, se agradece",
    "quien esta despierto? el sector 4 no duerme",
    "recuerden pasar por los foros, hay un hilo bueno sobre drones",
    "mate en mano y a vigilar el frente",
    "si, los directos de GlobalVision hoy estan buenisisimos",
  ],
  ucrania: [
    "el frente este sigue caliente, camaras lo confirman",
    "artilleria pesada cerca del Dnieper segun el mapa",
    "el convoy nocturno ya paso el checkpoint, todo capturado",
    "rumor de rotacion de tropas esta semana",
    "hay fotos OSINT nuevas del sector, verifiquen antes de compartir",
    "el briefing de hoy cubre todo esto, leanlo",
  ],
  mercado: [
    "IRNR cayendo otra vez, quien compro el dip?",
    "USDX estable pero el volumen subio 40%",
    "acabo de cerrar en verde, +34 monedas de P/L",
    "ojo con TRKX, hay evento de sanciones posible",
    "el libro de ordenes se ve flaco en BRZL, poco soporte",
    "mis ordenes limite funcionando solas, me encanta",
    "BTC quien? aqui solo hay cripto-paises",
  ],
  camaras: [
    "ORBITAL V-9 detectando devastacion cada 5 minutos",
    "acabo de colocar 3 camaras en el frente este, ingreso brutal",
    "el pase elite duplica ingresos, lo recomiendo",
    "captura en vivo: crater nuevo en la ruta principal",
    "cobrando todo, +89 monedas acumuladas",
    "la 4K tactica de noche es otra cosa",
  ],
  guerra: [
    "busco aliado para dominar Europa, alguien?",
    "me tomaron Mexico... reconquista en marcha",
    "los bots del EJE atacan fuerte esta partida",
    "capturar territorio da 2 gemas, dominio total 25",
    "tip: fortalecan fronteras antes de atacar",
    "quedan 3 territorios neutrales, corran",
    "acaba de capturar Siberia con 8 tropas, suertudo",
  ],
  osint: [
    "la foto del puente colapsado esta verificada por 3 fuentes",
    "geolocalizacion del convoy: 48.2N 35.1E aprox",
    "cuidado con las fotos falsas, cruzar con el mapa",
    "subi una foto nueva del refinery en llamas",
    "esa subestacion ya aparecia en el briefing de ayer",
  ],
  ciber: [
    "deteccion de enjambre autonomo en el sector 7",
    "senal cifrada intermitente desde las 03:00",
    "el ciberataque de hoy tumbo 3 nodos del mapa",
    "quien esta monitoreando la frecuencia 4.7?",
    "drones de reconocimiento activos, mantengan discrecion",
  ],
  latam: [
    "saludos desde Mexico, aqui pendientes del cartel del norte",
    "el mapa de carteles nuevo esta buenisimo",
    "hola a toda la comunidad hispana",
    "alguien de Argentina? el mercado ARGB esta en el suelo",
    "colombia presente, operando camaras en la selva",
    "vamos LATAM, dominemos el ranking global",
  ],
};

// Respuestas contextuales cuando alguien escribe (chance ~45%)
export const REPLIES: string[] = [
  "copiado, {name}",
  "totalmente de acuerdo, {name}",
  "buen punto, {name}. el frente confirma eso",
  "jaja cierto {name}",
  "{name} tiene razon, lo vi en el mapa hoy",
  "negativo, mi fuente dice otra cosa",
  "eso mismo pienso",
  "passalo al foro, eso merece un hilo",
  "anotado operador {name}",
  "el comando escucha, {name}",
  "confirmo, mis camaras lo captaron",
];

// ================= MUNDO DE GUERRA MULTIJUGADOR =================
export interface MpTerritory {
  id: string;
  name: string;
  continent: string;
  lat: number;
  lng: number;
  adj: string[];
}

export const MP_TERRITORIES: MpTerritory[] = [
  { id: "canadartico", name: "Canadá Ártico", continent: "NORTEAMÉRICA", lat: 62, lng: -100, adj: ["eeuu", "siberia"] },
  { id: "eeuu", name: "Estados Unidos", continent: "NORTEAMÉRICA", lat: 39, lng: -98, adj: ["canadartico", "mexico", "japon"] },
  { id: "mexico", name: "México y Centroamérica", continent: "NORTEAMÉRICA", lat: 21, lng: -101, adj: ["eeuu", "amazonia"] },
  { id: "amazonia", name: "Amazonia y Brasil", continent: "SUDAMÉRICA", lat: -8, lng: -53, adj: ["mexico", "andes", "argentina", "africacentral"] },
  { id: "andes", name: "Cordillera de los Andes", continent: "SUDAMÉRICA", lat: -22, lng: -66, adj: ["amazonia", "argentina"] },
  { id: "argentina", name: "Cono Sur", continent: "SUDAMÉRICA", lat: -38, lng: -64, adj: ["amazonia", "andes"] },
  { id: "europawest", name: "Europa Occidental", continent: "EUROPA", lat: 47, lng: 2, adj: ["escandinavia", "balcanes", "magreb"] },
  { id: "escandinavia", name: "Escandinavia", continent: "EUROPA", lat: 63, lng: 16, adj: ["europawest", "europaeste", "siberia"] },
  { id: "europaeste", name: "Europa Oriental", continent: "EUROPA", lat: 53, lng: 33, adj: ["escandinavia", "balcanes", "siberia", "asiacentral"] },
  { id: "balcanes", name: "Balcanes y Turquía", continent: "EUROPA", lat: 42, lng: 24, adj: ["europawest", "europaeste", "oriente"] },
  { id: "magreb", name: "Magreb y Sáhara", continent: "ÁFRICA", lat: 27, lng: -5, adj: ["europawest", "africaoccidental", "egipto"] },
  { id: "africaoccidental", name: "África Occidental", continent: "ÁFRICA", lat: 11, lng: -2, adj: ["magreb", "africacentral"] },
  { id: "africacentral", name: "Cuenca del Congo", continent: "ÁFRICA", lat: -1, lng: 22, adj: ["africaoccidental", "africaoriental", "africasure", "amazonia"] },
  { id: "egipto", name: "Egipto y Cuerno", continent: "ÁFRICA", lat: 24, lng: 34, adj: ["magreb", "africaoriental", "oriente"] },
  { id: "africaoriental", name: "África Oriental", continent: "ÁFRICA", lat: -4, lng: 37, adj: ["egipto", "africacentral", "africasure"] },
  { id: "africasure", name: "África Austral", continent: "ÁFRICA", lat: -26, lng: 25, adj: ["africacentral", "africaoriental"] },
  { id: "oriente", name: "Oriente Medio", continent: "ASIA", lat: 29, lng: 46, adj: ["balcanes", "egipto", "asiacentral", "india"] },
  { id: "asiacentral", name: "Asia Central", continent: "ASIA", lat: 45, lng: 66, adj: ["europaeste", "oriente", "siberia", "india", "china"] },
  { id: "siberia", name: "Siberia", continent: "ASIA", lat: 62, lng: 96, adj: ["escandinavia", "europaeste", "asiacentral", "china", "canadartico", "japon"] },
  { id: "india", name: "Subcontinente Indio", continent: "ASIA", lat: 21, lng: 78, adj: ["oriente", "asiacentral", "china", "sudeste"] },
  { id: "china", name: "China y Mongolia", continent: "ASIA", lat: 34, lng: 105, adj: ["siberia", "asiacentral", "india", "sudeste", "japon"] },
  { id: "sudeste", name: "Sudeste Asiático", continent: "ASIA", lat: 13, lng: 102, adj: ["india", "china", "australia"] },
  { id: "japon", name: "Japón y el Pacífico", continent: "ASIA", lat: 37, lng: 139, adj: ["china", "siberia", "eeuu"] },
  { id: "australia", name: "Australia y Oceanía", continent: "OCEANÍA", lat: -25, lng: 134, adj: ["sudeste"] },
];

export const MP_CONTINENTS: Record<string, number> = {
  NORTEAMÉRICA: 2,
  SUDAMÉRICA: 2,
  EUROPA: 3,
  ÁFRICA: 2,
  ASIA: 3,
  OCEANÍA: 2,
};

export const MP_BOTS = [
  { id: "bot-eje", name: "MARISCAL VOROTNIKOV", color: "#ef4444", avatar: "ru" },
  { id: "bot-acero", name: "GENERAL HALVORSEN", color: "#22d3ee", avatar: "no" },
];

export const PLAYER_COLORS = ["#f5a623", "#a855f7", "#34d399", "#f472b6", "#38bdf8", "#fb923c", "#facc15"];
