// ====== Vanguard v5 — Datos de la red social: Foros, Encuestas, GlobalVision ======
// Todo el contenido es ficticio y de ambiente (juego de inteligencia geopolitica).

// ---------- CANALES (YouTube de paises) ----------
export interface TvChannel {
  id: string;
  name: string;
  code: string; // ISO para FlagBadge
  subs: number; // suscriptores
  verified: boolean;
  tagline: string;
}

export const TV_CHANNELS: TvChannel[] = [
  { id: "ua-tv", name: "Kyiv Directo", code: "UA", subs: 4820000, verified: true, tagline: "Cobertura del frente oriental 24/7" },
  { id: "us-tv", name: "Pentagon Feed", code: "US", subs: 9130000, verified: true, tagline: "Comunicados y tecnologia militar" },
  { id: "ru-tv", name: "Radio Moscu", code: "RU", subs: 7210000, verified: true, tagline: "La version del otro lado" },
  { id: "cn-tv", name: "Beijing Watch", code: "CN", subs: 6640000, verified: true, tagline: "El Pacifico bajo vigilancia" },
  { id: "il-tv", name: "Tel Aviv Alerts", code: "IL", subs: 3480000, verified: true, tagline: "Perimetro y defensa antiaerea" },
  { id: "tr-tv", name: "Anatolia Reports", code: "TR", subs: 2210000, verified: false, tagline: "Puente entre dos mundos" },
  { id: "in-tv", name: "Delhi Strategic", code: "IN", subs: 5090000, verified: true, tagline: "Cachemira y el Himalaya" },
  { id: "kp-tv", name: "Pyongyang State", code: "KP", subs: 1870000, verified: false, tagline: "Transmisiones oficiales" },
  { id: "br-tv", name: "Brasilia Abierta", code: "BR", subs: 1240000, verified: false, tagline: "Sudamerica en foco" },
  { id: "fr-tv", name: "Paris 24", code: "FR", subs: 2870000, verified: true, tagline: "Diplomacia europea en vivo" },
  { id: "ng-tv", name: "Lagos Wire", code: "NG", subs: 980000, verified: false, tagline: "Africa occidental conectada" },
  { id: "vg-official", name: "VANGUARD Oficial", code: "AM", subs: 12400000, verified: true, tagline: "Canal de la agencia · briefing semanal" },
];

// ---------- CATEGORIAS DE VIDEO ----------
export type TvCategory = "COMBATE" | "DIPLOMACIA" | "TECNOLOGIA" | "HUMANITARIO" | "HISTORIA" | "DIRECTO";

export const TV_CATEGORIES: { id: TvCategory; label: string }[] = [
  { id: "COMBATE", label: "Combate" },
  { id: "DIPLOMACIA", label: "Diplomacia" },
  { id: "TECNOLOGIA", label: "Tecnologia" },
  { id: "HUMANITARIO", label: "Humanitario" },
  { id: "HISTORIA", label: "Historia" },
  { id: "DIRECTO", label: "En vivo" },
];

// ---------- VIDEOS ----------
export interface TvComment {
  author: string;
  body: string;
  likes: number;
  hoursAgo: number;
}

export interface TvVideo {
  id: string;
  title: string;
  channelId: string;
  category: TvCategory;
  durationSec: number;
  views: number;
  likes: number;
  daysAgo: number;
  thumb: string;
  src?: string; // fuente real reproducible (v6.2: los videos SI se reproducen — asignada en bloque FUENTES REALES)
  desc: string;
  live?: boolean;
  comments: TvComment[];
}

const t = (p: string) => `/assets/tv/${p}.png`;
const o = (p: string) => `/assets/osint/${p}.png`;
const c = (p: string) => `/assets/cctv/${p}.png`;

export const TV_VIDEOS: TvVideo[] = [
  {
    id: "V-001", title: "EN VIVO: Columna blindada cruzando el eje este — cobertura continua", channelId: "ua-tv",
    category: "DIRECTO", durationSec: 0, views: 84213, likes: 6120, daysAgo: 0, thumb: c("tanks-square"), live: true,
    desc: "Camara fija retransmitiendo el movimiento de columnas en el eje este. Fuentes de campo confirman actividad sostenida desde las 04:00. El chat tactical esta activo.",
    comments: [
      { author: "OPERADOR_R7", body: "Llevo 40 minutos viendo y a las 04:12 se ve el primer movimiento real. Impresionante la cobertura.", likes: 342, hoursAgo: 2 },
      { author: "MAPA_VIVO", body: "Crucen con el panel del mapa, la ruta coincide con el frente 3. Buen trabajo de emision.", likes: 187, hoursAgo: 1 },
    ],
  },
  {
    id: "V-002", title: "Prueba de misil a las 03:14 — analisis frame a frame del lanzamiento", channelId: "kp-tv",
    category: "TECNOLOGIA", durationSec: 843, views: 1240000, likes: 88300, daysAgo: 1, thumb: t("rocket-launch"),
    desc: "Desglose tecnico del ultimo ensayo: fase de ascenso, separacion estimada y radio proyectado. Con comparativa de los tres lanzamientos anteriores.",
    comments: [
      { author: "ANALISTA_K2", body: "El angulo de ascenso es mas pronunciado que en la prueba de marzo. Alguien mas lo nota?", likes: 512, hoursAgo: 20 },
      { author: "VECT0R", body: "Frame a frame impecable. El channel state siempre publica la version sin cortes.", likes: 201, hoursAgo: 14 },
      { author: "NIGHT_OWL", body: "03:14 hora local... mensaje claro y a la vez negacion plausible. Clasico.", likes: 98, hoursAgo: 9 },
    ],
  },
  {
    id: "V-003", title: "Cumbre de emergencia: los 90 minutos que reordenaron las sanciones", channelId: "fr-tv",
    category: "DIPLOMACIA", durationSec: 1562, views: 634000, likes: 41200, daysAgo: 2, thumb: t("summit"),
    desc: "Sala completa, puertas cerradas y una declaracion final de 12 puntos. Reconstruimos que se pacto y quien cedio en la mesa.",
    comments: [
      { author: "DOSSIER_X", body: "El punto 7 es el que nadie esta comentando y es el mas importante.", likes: 431, hoursAgo: 30 },
      { author: "EMBAJADA_0", body: "Se ve la silla vacia al fondo. La ausencia tambien es diplomacia.", likes: 289, hoursAgo: 22 },
    ],
  },
  {
    id: "V-004", title: "Ejercicio naval conjunto: 40 unidades en formacion cerrada", channelId: "us-tv",
    category: "COMBATE", durationSec: 1123, views: 891000, likes: 76500, daysAgo: 3, thumb: t("fleet"),
    desc: "Tomadas desde helicoptero de la alianza: portaviones, destructores y logistica en formacion. Con identificacion de clases por silueta.",
    comments: [
      { author: "SONAR_3", body: "A las 07:22 se escucha el ping en el audio original. Detalle brutal del camarografo.", likes: 378, hoursAgo: 40 },
      { author: "HELM_D", body: "La distancia entre unidades es menor que en el ejercicio del ano pasado. Mensaje a dos orillas.", likes: 154, hoursAgo: 31 },
    ],
  },
  {
    id: "V-005", title: "Enjambre autonomo: 50 drones coordinados sin enlace satelital", channelId: "vg-official",
    category: "TECNOLOGIA", durationSec: 734, views: 2110000, likes: 187000, daysAgo: 4, thumb: t("drone-swarm"),
    desc: "Demostracion de malla local: sin GPS, sin satelite, solo entre ellos. Explicamos la arquitectura de enjambre y sus implicaciones para el frente.",
    comments: [
      { author: "PILOT_X", body: "Sin enlace satelital... eso cambia TODAS las contramedidas actuales.", likes: 921, hoursAgo: 50 },
      { author: "GRID_MAINT", body: "VANGUARD subiendo contenido de este nivel gratis. Suscribanse, esto es oro.", likes: 430, hoursAgo: 44 },
    ],
  },
  {
    id: "V-006", title: "La muralla nueva: 14 km de hormigon en 60 dias (documental)", channelId: "tr-tv",
    category: "HISTORIA", durationSec: 2740, views: 512000, likes: 33400, daysAgo: 5, thumb: t("border-wall"),
    desc: "Cronica de la construccion acelerada de la valla fronteriza: turnos, grullas y el calendario politico detras de cada tramo.",
    comments: [
      { author: "SURVEY_9", body: "El tramo 4 avanza el doble de rapido. Se nota el cambio de contratista.", likes: 167, hoursAgo: 60 },
      { author: "CASUS_BELLI", body: "Documental nivel emisora estatal pero con datos verificables. Raro y valioso.", likes: 88, hoursAgo: 51 },
    ],
  },
  {
    id: "V-007", title: "Desfile militar: todo el arsenal nuevo en 9 minutos (resumen)", channelId: "ru-tv",
    category: "COMBATE", durationSec: 543, views: 3140000, likes: 221000, daysAgo: 6, thumb: t("parade"),
    desc: "Recorte oficial + nuestra superposicion de especificaciones. Que es nuevo, que es maqueta y que ya se vio en el frente.",
    comments: [
      { author: "TRACKPAD", body: "El tercer chasis ya salio en la galeria OSINT de la app. Cruzen las fotos.", likes: 612, hoursAgo: 70 },
      { author: "FORMACION_1", body: "Paso perfecto, demasiado perfecto. Las ruedas no marcan el asfalto igual.", likes: 344, hoursAgo: 66 },
    ],
  },
  {
    id: "V-008", title: "Convoy humanitario nocturno: 72 toneladas en 6 horas", channelId: "vg-official",
    category: "HUMANITARIO", durationSec: 921, views: 233000, likes: 41200, daysAgo: 2, thumb: o("night-convoy"),
    desc: "Vision nocturna del cruce autorizado: ruta, peajes humanitarios y coordinacion con tres ONG. Sin cortes de emision.",
    comments: [
      { author: "AUX_12", body: "Trabajé en un cruce parecido. Se subestima la logística de los peajes humanitarios.", likes: 203, hoursAgo: 26 },
      { author: "LUMEN", body: "La ventanilla de 6 horas es lo unico que funciona de todo el corredor.", likes: 141, hoursAgo: 19 },
    ],
  },
  {
    id: "V-009", title: "Trenches 101: por que la guerra volvio a la zanja", channelId: "ua-tv",
    category: "HISTORIA", durationSec: 1832, views: 998000, likes: 87300, daysAgo: 8, thumb: o("ukraine-trench"),
    desc: "Del drone al bunker: anatomia de una linea defensiva moderna y por que en 2026 la pala vuelve a ser arma estrategica.",
    comments: [
      { author: "SAPPER_5", body: "La regla del metro por hora por hombre. No cambia desde el 15.", likes: 278, hoursAgo: 80 },
      { author: "DRONE_GIRL", body: "El segmento de anti-drone nets es el mejor resumen que he visto.", likes: 190, hoursAgo: 74 },
    ],
  },
  {
    id: "V-010", title: "EN VIVO: Frontera sur — paso 4 reabierto tras 11 dias", channelId: "us-tv",
    category: "DIRECTO", durationSec: 0, views: 44120, likes: 3210, daysAgo: 0, thumb: c("border-cctv"), live: true,
    desc: "Camara de la garita norte. Cola inicial de 300 vehiculos segun conteo de la emisora. Protocolo de doble inspeccion activo.",
    comments: [
      { author: "GATE_WARDEN", body: "Reabierto a las 05:00 en punto. El conteo de la emisora va corto, van mas.", likes: 87, hoursAgo: 3 },
    ],
  },
  {
    id: "V-011", title: "Searchlights sobre la capital: la noche de las 6 alarmas", channelId: "il-tv",
    category: "COMBATE", durationSec: 664, views: 1470000, likes: 98300, daysAgo: 3, thumb: t("city-skyline"),
    desc: "Cronometro de interceptacion noche a noche: desde la alerta hasta el estallido. Con audio de radio captado por oyentes.",
    comments: [
      { author: "RADIO_HAWK", body: "Confirmo el audio: era el canal de emergencia. Lo capte igual desde la colina.", likes: 356, hoursAgo: 36 },
      { author: "SKYLINE_7", body: "6 alarmas, 6 interceptaciones, 0 impactos. Los numeros de esta noche son buenos.", likes: 210, hoursAgo: 33 },
    ],
  },
  {
    id: "V-012", title: "Cachemira a 5500m: la patrulla del glaciar que nunca se mueve", channelId: "in-tv",
    category: "HISTORIA", durationSec: 2210, views: 764000, likes: 65100, daysAgo: 10, thumb: o("jet-patrol"),
    desc: "El puesto mas alto del mundo: rotaciones de 30 dias, raciones congeladas y una linea que no se discute con nieve encima.",
    comments: [
      { author: "ALTITUDE_0", body: "Mi tio sirvio ahi en el 19. Los detalles de las raciones son exactos.", likes: 402, hoursAgo: 90 },
      { author: "GRID_NORTH", body: "5500 metros y ni una bandera de colores. Todo blanco y verde. Respeto.", likes: 233, hoursAgo: 84 },
    ],
  },
  {
    id: "V-013", title: "Refineria en llamas: que sabemos (y que no) del incendio", channelId: "ng-tv",
    category: "DIPLOMACIA", durationSec: 445, views: 1830000, likes: 121000, daysAgo: 1, thumb: o("refinery-fire"),
    desc: "Cuatro hipotesis, tres negaciones y una imagen termica. Analisis frio de las ultimas 24 horas en el corredor energetico.",
    comments: [
      { author: "THERMAL_OP", body: "La imagen termica del minuto 3 no cuadra con el parte oficial. Alguien esta midiendo mal.", likes: 488, hoursAgo: 16 },
      { author: "OILWATCH", body: "El precio del barril ya desconto el 40% de la capacidad. El mercado creo la hipotesis 2.", likes: 267, hoursAgo: 12 },
    ],
  },
  {
    id: "V-014", title: "Campamento de refugiados: una generacion nacida en la lona", channelId: "br-tv",
    category: "HUMANITARIO", durationSec: 1920, views: 421000, likes: 88400, daysAgo: 12, thumb: o("refugee-camp"),
    desc: "Reportaje filmado en 3 visitas durante un ano: la escuela bajo la lona 12, el generador que falla los viernes y los que se van.",
    comments: [
      { author: "TENT_12", body: "Creci en un campamento asi. La escena de la escuela me rompio.", likes: 1240, hoursAgo: 100 },
      { author: "ONG_INT", body: "El detalle del generador de los viernes es lo mas real que he visto en reportaje humanitario.", likes: 620, hoursAgo: 95 },
    ],
  },
  {
    id: "V-015", title: "Puente colapsado: ingenieria del desastre y plan de paso temporal", channelId: "tr-tv",
    category: "TECNOLOGIA", durationSec: 1090, views: 388000, likes: 27600, daysAgo: 7, thumb: o("bridge-collapsed"),
    desc: "Por que cayo el vano central, carga residual del hormigon y como montan el puente militar en 48 horas.",
    comments: [
      { author: "CIVIL_E", body: "El calculo de carga residual del minuto 6 es correcto. Bien verificado.", likes: 176, hoursAgo: 64 },
      { author: "BAILEY_44", body: "Puente tipo Bailey siempre salva. Vi uno montado en 30 horas.", likes: 98, hoursAgo: 58 },
    ],
  },
  {
    id: "V-016", title: "EN VIVO: Presa y delta — nivel del embalse al 34% y bajando", channelId: "cn-tv",
    category: "DIRECTO", durationSec: 0, views: 29800, likes: 2210, daysAgo: 0, thumb: o("infra-dam"), live: true,
    desc: "Camara fija sobre el vertedor. Grafico de nivel cada 10 min. Tension agricola aguas abajo en el tercer mes de sequia.",
    comments: [
      { author: "HYDRO_M", body: "34% y bajando 0.4 por dia. A este ritmo, restricciones en 3 semanas.", likes: 121, hoursAgo: 5 },
    ],
  },
  {
    id: "V-017", title: "El convoy que nunca llego: reconstruccion con 4 camaras", channelId: "vg-official",
    category: "COMBATE", durationSec: 1345, views: 2740000, likes: 198000, daysAgo: 9, thumb: c("road-crater"),
    desc: "Sincronizamos cuatro cámaras de seguridad y una imagen de satelite para reconstruir los 11 minutos del amblaze del cruce 9. Advertencia: contenido de analisis, sin imagenes graficas.",
    comments: [
      { author: "SYNC_OP", body: "La sincronizacion por sombras del minuto 4 es una obra maestra de edicion.", likes: 890, hoursAgo: 96 },
      { author: "CRATER_9", body: "Trabaje la zona. La geometria del crater cuadra con lo que vimos. Buen trabajo.", likes: 540, hoursAgo: 91 },
      { author: "GHOST_CAT", body: "VANGUARD making the best war docs on the platform, change my mind.", likes: 312, hoursAgo: 87 },
    ],
  },
  {
    id: "V-018", title: "La plaza vacia: cronicas de la protesta que no se emitio", channelId: "ng-tv",
    category: "DIPLOMACIA", durationSec: 1680, views: 1120000, likes: 143000, daysAgo: 14, thumb: t("protest"),
    desc: "Sobre el apagon informativo: que filmaron los moviles, por que no salio al aire y como la senal volvio por repetidores civilian.",
    comments: [
      { author: "SIGNAL_JAM", body: "Los repetidores civiles salvaron la noche. Nunca lo olvidaremos.", likes: 780, hoursAgo: 110 },
      { author: "PRESS_FREEDOM", body: "Este video deberia estar en todas las escuelas de comunicacion.", likes: 460, hoursAgo: 105 },
    ],
  },

  // ============ v9: EMISIONES DESDE FOTOS REALES (material verificado) ============
  {
    id: "V-019", title: "ANALISIS: columna acorazada real — identificacion por silueta", channelId: "ua-tv",
    category: "COMBATE", durationSec: 30, views: 382000, likes: 31200, daysAgo: 0, thumb: "/assets/real/tanks-2.jpg",
    desc: "Recorrido de cámara sobre una columna de tanques REAL captada por la red OSINT. Identificación de chasis, orden de marcha y carga logística.",
    comments: [
      { author: "TRACKPAD", body: "El tercer vehiculo es el mando. Se ve la antena abatible al cruzar el puente.", likes: 214, hoursAgo: 6 },
      { author: "MAPA_VIVO", body: "Cruza con la foto REAL de la galeria. Mismo convoy, 40 km despues.", likes: 98, hoursAgo: 4 },
    ],
  },
  {
    id: "V-020", title: "EN VUELO: interceptor real en patrulla de ADIZ", channelId: "tw-tv",
    category: "COMBATE", durationSec: 26, views: 271000, likes: 22400, daysAgo: 1, thumb: "/assets/real/jet-1.jpg",
    desc: "Fotografia real de caza en vuelo convertida en emisora con desplazamiento lateral: analisis de carga de pylons y matricula de cola.",
    comments: [
      { author: "PILOT_X", body: "Lleva tanques externos: mision CAP larga, no scramble corto.", likes: 156, hoursAgo: 20 },
    ],
  },
  {
    id: "V-021", title: "OSINT: dron tactico real sobre zona de operaciones", channelId: "vg-official",
    category: "TECNOLOGIA", durationSec: 24, views: 198000, likes: 18100, daysAgo: 1, thumb: "/assets/real/drone-1.jpg",
    desc: "Material real de dron militar en zona de operaciones. Zoom sobre la berma del sensor y antena de enlace de malla.",
    comments: [
      { author: "DRONE_GIRL", body: "La antena de malla confirma que vuela autonomo parte de la ruta.", likes: 132, hoursAgo: 16 },
    ],
  },
  {
    id: "V-022", title: "DEPLOYMENT: destructor real en el estrecho", channelId: "us-tv",
    category: "COMBATE", durationSec: 28, views: 224000, likes: 19700, daysAgo: 2, thumb: "/assets/real/ship-1.jpg",
    desc: "Emision desde fotografia real de destructor en patrulla: estela, rumbo estimado y radar de barrido activo.",
    comments: [
      { author: "SONAR_3", body: "La estela corta indica velocidad de crucero de escolta. Van acompañados.", likes: 118, hoursAgo: 30 },
    ],
  },
  {
    id: "V-023", title: "URBANO: la capital de noche bajo alerta — material real", channelId: "il-tv",
    category: "DIPLOMACIA", durationSec: 22, views: 158000, likes: 12400, daysAgo: 2, thumb: "/assets/real/city-2.jpg",
    desc: "Panorama urbano real de la capital: rutina de noche, ventanas iluminadas y el contrapeso silencioso de la defensa antiaerea.",
    comments: [
      { author: "SKYLINE_7", body: "La torre del este apagada desde el martes. Rotacion de energia.", likes: 87, hoursAgo: 26 },
    ],
  },
  {
    id: "V-024", title: "INCIDENTE: refineria real en llamas — que sabemos hasta ahora", channelId: "ng-tv",
    category: "HUMANITARIO", durationSec: 20, views: 341000, likes: 27600, daysAgo: 0, thumb: "/assets/real/fire-1.jpg",
    desc: "Fotografia real nocturna del incendio industrial: lectura de columnas de humo, direccion del viento y radio de evacuacion estimado.",
    comments: [
      { author: "OILWATCH", body: "La columna cae hacia el sur: los tanques del extremo opuesto aun estan a tiempo.", likes: 143, hoursAgo: 8 },
    ],
  },
];

// ---------- FUENTES REALES (v6.2) ----------
// Cada emision apunta a un MP4 LOCAL (public/videos) generado con ffmpeg desde
// las imagenes CCTV/OSINT de la app: el reproductor reproduce de verdad
// (play, seek, volumen, fullscreen) sin depender de CDNs externos.
// Los directos son clips de 14s en loop mute automatico (camara en vivo).
const VIDEO_SRC: Record<string, number> = {
  "V-001": 14,
  "V-002": 45,
  "V-003": 38,
  "V-004": 42,
  "V-005": 40,
  "V-006": 48,
  "V-007": 18,
  "V-008": 40,
  "V-009": 45,
  "V-010": 14,
  "V-011": 36,
  "V-012": 42,
  "V-013": 14,
  "V-014": 22,
  "V-015": 46,
  "V-016": 40,
  "V-017": 44,
  "V-018": 38,
  "V-019": 30,
  "V-020": 26,
  "V-021": 24,
  "V-022": 28,
  "V-023": 22,
  "V-024": 20,
};
for (const vid of TV_VIDEOS) {
  vid.src = `/videos/${vid.id}.mp4`;
  if (!vid.live && VIDEO_SRC[vid.id]) vid.durationSec = VIDEO_SRC[vid.id];
}

// ---------- FOROS ----------
export type ForumCategory = "MILITAR" | "DIPLOMACIA" | "ECONOMIA" | "OSINT" | "RUMORES";

export const FORUM_CATEGORIES: ForumCategory[] = ["MILITAR", "DIPLOMACIA", "ECONOMIA", "OSINT", "RUMORES"];

export const FORUM_CAT_COLOR: Record<ForumCategory, string> = {
  MILITAR: "text-red-hud border-red-hud bg-red-hud/20",
  DIPLOMACIA: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  ECONOMIA: "text-amber border-amber-hud bg-amber-hud/20",
  OSINT: "text-green-hud border-green-hud bg-green-hud/20",
  RUMORES: "text-violet-hud border-violet-hud bg-violet-hud/20",
};

export interface SeedReply {
  author: string;
  body: string;
  likes: number;
  hoursAgo: number;
}

export interface SeedThread {
  id: string;
  title: string;
  category: ForumCategory;
  body: string;
  author: string;
  hoursAgo: number;
  likes: number;
  views: number;
  pinned?: boolean;
  replies: SeedReply[];
}

export const FORUM_SEED: SeedThread[] = [
  {
    id: "F-001", title: "[ANALISIS] El patrón de las 04:00 en el frente este: coincidencia o doctrina?", category: "MILITAR",
    body: "Llevo tres semanas marcando en el calendario los movimientos reportados por las cámaras del frente oriental. El 71% de los movimientos mecanizados arrancan entre 03:50 y 04:20. No es fatiga ni relevo: es doctrina. Abro hilo con las marcas de tiempo para quien quiera cruzar datos.",
    author: "OPERADOR_R7", hoursAgo: 5, likes: 342, views: 12400, pinned: true,
    replies: [
      { author: "MAPA_VIVO", body: "Cruce con mis registros: 68% en mi muestra. La ventana de 30 min cuadra. Ya no es casualidad.", likes: 96, hoursAgo: 4 },
      { author: "SAPPER_5", body: "La luz matinal mas baja visibilidad optica = ventana de asalto clasica. Buena observacion.", likes: 54, hoursAgo: 3 },
      { author: "NIGHT_OWL", body: "Esto deveria ir al briefing semanal. Taggen al equipo VANGUARD.", likes: 31, hoursAgo: 1 },
    ],
  },
  {
    id: "F-002", title: "RUMOR: cambio de matricula en los convoyes del corredor sur", category: "RUMORES",
    body: "Un contacto de garita dice que desde el martes los convoyes llevan placas nuevas, serie no registrada. Sin foto aun. Si alguien pasa por el paso 4, camara lista.",
    author: "GATE_WARDEN", hoursAgo: 9, likes: 87, views: 5300,
    replies: [
      { author: "TRACKPAD", body: "Confirmado parcialmente: vi una placa serie B-7 en el canal en vivo de la frontera. Captura en mi perfil.", likes: 41, hoursAgo: 8 },
      { author: "CASUS_BELLI", body: "Serie B = reasignación logística. No se emocionen, no es primera línea.", likes: 28, hoursAgo: 6 },
    ],
  },
  {
    id: "F-003", title: "Guia OSINT: como geolocalizar una foto en 6 pasos (sin herramientas de pago)", category: "OSINT",
    body: "Tutorial paso a paso: sombras -> ángulo solar -> líneas eléctricas -> vegetación -> tipografía de señales -> cruce con terreno. Con ejemplos usando las fotos de la galería de la app. Nivel: principiante.",
    author: "SYNC_OP", hoursAgo: 26, likes: 512, views: 18900,
    replies: [
      { author: "PILOT_X", body: "El paso 3 (lineas electricas) es el mas infravalorado. Los torres traen numero de serie visible en zoom.", likes: 88, hoursAgo: 22 },
      { author: "DRONE_GIRL", body: "Hice el ejercicio con la foto del puente colapsado y di con el cauce en 20 min. Funciona.", likes: 62, hoursAgo: 18 },
      { author: "LUMEN", body: "Fijado en mi clan. Gracias por compartir sin paywall.", likes: 40, hoursAgo: 12 },
    ],
  },
  {
    id: "F-004", title: "Economia de guerra: el barril descontando incidentes que aun no ocurren", category: "ECONOMIA",
    body: "Cada aviso de la red de camaras mueve el precio antes de cualquier parte oficial. Tengo un grafico de 30 dias: el mercado reacciona en promedio 14 minutos antes que los comunicados. Quien filtra? O quien trasuda?",
    author: "OILWATCH", hoursAgo: 14, likes: 224, views: 9800,
    replies: [
      { author: "THERMAL_OP", body: "Algoritmos leyendo feeds publicos. Nuestro propio ticker en la app tiene delay de index.", likes: 51, hoursAgo: 12 },
      { author: "DOSSIER_X", body: "14 min es exactamente la latencia del re-corte de un broker conocido. No es conspiracion, es tuberia.", likes: 77, hoursAgo: 10 },
    ],
  },
  {
    id: "F-005", title: "Diplomacia: la silla vacia como estrategia (caso cumbre de esta semana)", category: "DIPLOMACIA",
    body: "Analizo la ausencia deliberada en la cumbre: que gana el ausente, que pierde la sala y por que la declaracion final tenia 12 puntos y no 13. El punto faltante era el precio de la silla.",
    author: "EMBAJADA_0", hoursAgo: 31, likes: 178, views: 7600,
    replies: [
      { author: "FORMACION_1", body: "La fotografia oficial con silla vacia es un mensaje a tres audiencias a la vez. Nivel maestro.", likes: 44, hoursAgo: 28 },
      { author: "CASUS_BELLI", body: "El punto 13 se negocia en bilateral posterior. Apunten mi prediccion.", likes: 33, hoursAgo: 20 },
    ],
  },
  {
    id: "F-006", title: "[MEGAHILO] Todas las cámaras del canal, rankeadas por azar de captura", category: "OSINT",
    body: "Crucé 48h de eventos de la red de camaras con las plantillas de incidente. Ranking: puente nocturno > garita desierto > plaza urbana. La camara que apunte a puerto rinde un 40% menos pero paga mejor el evento de humo. Datos y tabla en el hilo.",
    author: "GRID_MAINT", hoursAgo: 40, likes: 389, views: 15400,
    replies: [
      { author: "OPERADOR_R7", body: "Mi orbital en la costa confirma: menos eventos, mejor pago. El calculo de ROI del hilo es correcto.", likes: 72, hoursAgo: 35 },
      { author: "SONAR_3", body: "Falta probar la camara 4K tactica en zona montanosa. Alguien con datos?", likes: 25, hoursAgo: 30 },
    ],
  },
  {
    id: "F-007", title: "Que esta pasando realmente con el nivel de la presa?", category: "ECONOMIA",
    body: "El canal en vivo marca 34% y bajando. Los partes oficiales dicen 'dentro de lo normal'. El triangulo entre ambos datos es la historia. Quien vive aguas abajo que reporte.",
    author: "HYDRO_M", hoursAgo: 7, likes: 145, views: 6700,
    replies: [
      { author: "GATE_WARDEN", body: "Canal de riego de mi zona con caudal a la mitad. Los partes dicen 'normal'. Ya ven.", likes: 39, hoursAgo: 5 },
      { author: "LUMEN", body: "Capturas de la camara en vivo cada hora = evidencia temporal. Hacer backup, este canal suele 'mantenerse'.", likes: 47, hoursAgo: 3 },
    ],
  },
  {
    id: "F-008", title: "Historia: las 5 veces que una zanja cambio una guerra", category: "MILITAR",
    body: "Del 15 al 26: cinco lineas defensivas que detuvieron ofensivas completas. Con mapas de la app superpuestos. El patron se repite: terreno + paciencia + drones = zanja invicta.",
    author: "SAPPER_5", hoursAgo: 55, likes: 298, views: 11200,
    replies: [
      { author: "MAPA_VIVO", body: "El caso 3 (2024) cuadra perfecto con el frente 1 del mapa actual. Escalofriante.", likes: 58, hoursAgo: 48 },
      { author: "ALTITUDE_0", body: "Falta el glaciar: 5500m y 40 anos de zanja. Es el extremo del patron.", likes: 36, hoursAgo: 42 },
    ],
  },
  {
    id: "F-009", title: "RUMOR: proxima expansion del mapa del juego (fuente: alias interno)", category: "RUMORES",
    body: "Me llego que el equipo de VANGUARD prueba un modo con mapa ampliado y climas por region. Sin fecha. Tomelo con sal, pero el archivo del cliente ya trae texturas de desierto frio.",
    author: "VECT0R", hoursAgo: 18, likes: 421, views: 22100,
    replies: [
      { author: "GHOST_CAT", body: "Desierto frio = Gobi confirmado jaja. Rezo por mapa de Mar Rojo.", likes: 91, hoursAgo: 15 },
      { author: "MOD_HENRY", body: "Confirmado desde dentro: existe en build interna. Lo demas, speculation.", likes: 130, hoursAgo: 13 },
    ],
  },
  {
    id: "F-010", title: "Como reportar noticias falsas que llegan al feed (protocolo de la casa)", category: "DIPLOMACIA",
    body: "Recordatorio del equipo de moderacion: 1) captura con timestamp 2) contrasta con 2 fuentes 3) abre hilo en OSINT, no en RUMORES 4) etiqueta a un moderador. La red es buena porque filtramos juntos.",
    author: "MOD_HENRY", hoursAgo: 46, likes: 205, views: 8900, pinned: true,
    replies: [
      { author: "SYNC_OP", body: "Anado: guardar el JSON de la respuesta de la API si es de feed externo. La captura sola no basta.", likes: 68, hoursAgo: 40 },
      { author: "PRESS_FREEDOM", body: "Este protocolo deveria estar en la seccion de ayuda de la app.", likes: 29, hoursAgo: 33 },
    ],
  },
  {
    id: "F-011", title: "BOLSA: IRNR se desploma -12% en una sesion. Compran el dip o huyen?", category: "ECONOMIA",
    body: "El evento de sanciones lo tiro al suelo en dos ticks. El historial dice que IRNR rebota fuerte despues de cada panico (3 de 3 veces este mes), pero tambien que su drift es negativo. Yo entre con el 15% del portafolio a 7.2. Limit de venta puesto en 8.9. Discutan.",
    author: "OILWATCH", hoursAgo: 3, likes: 167, views: 6100,
    replies: [
      { author: "DOSSIER_X", body: "Dip si, pero con stop duro: frontera pura sin caso base. Yo puse limite de compra en 6.8 y quedo armada.", likes: 54, hoursAgo: 2 },
      { author: "THERMAL_OP", body: "Cuidado con promediar a la baja en frontera. ARGB tambien 'siempre rebota' hasta que no. Diversifica el riesgo.", likes: 41, hoursAgo: 1 },
      { author: "VECT0R", body: "El libro de ordenes hoy era puro pánico vendedor. Entre cuando vi el spread cerrarse. Casio de manual.", likes: 33, hoursAgo: 1 },
    ],
  },
  {
    id: "F-012", title: "GUIA: como funciona la comision del 0.5% y el libro de ordenes (para nuevos)", category: "ECONOMIA",
    body: "Rapido: cada operacion paga 0.5% de comision taker. Si compran y venden rapido, la comision se come el beneficio: necesitan moverse mas de ~1% a favor solo para empatar. El libro muestra donde esta la liquidez real: ordenes gruesas = soporte/resistencia de verdad. Preguntas abajo.",
    author: "GRID_MAINT", hoursAgo: 20, likes: 312, views: 9700,
    replies: [
      { author: "PILOT_X", body: "Dato clave que nadie dice: las ordenes limite TAMBIEN pagan comision al ejecutarse. No es gratis por esperar.", likes: 76, hoursAgo: 16 },
      { author: "LUMEN", body: "Con la guia del hilo pase de -40 a +120 en la semana. El 25/50/75% del panel es oro para no meterse completo de una.", likes: 45, hoursAgo: 9 },
    ],
  },
  {
    id: "F-013", title: "Despues de ver la emision del enjambre autonomo, rediscuto toda mi defensa", category: "MILITAR",
    body: "El video de los 50 drones sin enlace satelital (canal vg-official) no es una demo: es una doctrina. Si el enjambre se coordina solo, mis rutas de suministro estan desnudas. Cruce con el mapa: cada corredor que defiendo tiene 2+ puntos de lanzamiento posibles.",
    author: "SAPPER_5", hoursAgo: 12, likes: 198, views: 7300,
    replies: [
      { author: "MAPA_VIVO", body: "El segmento de malla local del minuto 4 es el clave: sin GPS la contra es jamonar el area completa. Cuesta mas que el enjambre entero.", likes: 62, hoursAgo: 9 },
      { author: "NIGHT_OWL", body: "Como siempre: la tecnologia se filtra antes que la doctrina. En 2 revisiones esto estara en el quiz de la app.", likes: 28, hoursAgo: 6 },
    ],
  },
  {
    id: "F-014", title: "Verificacion cruzada: directos del canal fronterizo vs mapa de frentes", category: "OSINT",
    body: "Propuesta metodologica: abrir el directo de la garita y el mapa lado a lado, anotar cada movimiento con timestamp, y contrastarlo con las rutas animadas del modo TERRORISMO. Tengo 6 horas de datos y el cruce cuadra en un 80%. Busco 2 operadores para duplicar muestra.",
    author: "SYNC_OP", hoursAgo: 8, likes: 141, views: 5200,
    replies: [
      { author: "GATE_WARDEN", body: "Me apunto. Mi turno cubre la garita del desierto de 02:00 a 06:00, ahi hay movimiento que el parte no menciona.", likes: 37, hoursAgo: 5 },
      { author: "DRONE_GIRL", body: "Sugerencia: usen la galería OSINT para geolocalizar el ángulo exacto de cada cámara. Con eso el cruce es exacto, no aproximado.", likes: 52, hoursAgo: 4 },
    ],
  },
  {
    id: "F-015", title: "Rozenme el portafolio: 40% potencias, 30% emergentes, 30% cash", category: "RUMORES",
    body: "USDX/CHFF/JPYN al 40, INRA/PLNZ/MXPL/VNMD al 30, resto en cash esperando dip de frontera. P/L de la semana: +3.1% con comisiones incluidas. Se sinceros: demasiado aburrido, demasiado justo, o exactamente lo que hay que hacer?",
    author: "FORMACION_1", hoursAgo: 16, likes: 96, views: 4400,
    replies: [
      { author: "OILWATCH", body: "Sin frontera estas dejando la mitad de la volatilidad sobre la mesa, y la volatilidad AQUI es la que paga. 10% en ARGB/CLPE no te mata.", likes: 44, hoursAgo: 12 },
      { author: "GRID_MAINT", body: "Aburrido = correcto. El que esta en todos los hilos diciendo 'x10 en una semana' es el mismo que perdio el portafolio en IRNR.", likes: 71, hoursAgo: 10 },
      { author: "GHOST_CAT", body: "Portafolio solido, opinion impopular: agrega CAND. Cobre + petroleo + estabilidad = el hedge que no sabias que necesitabas.", likes: 29, hoursAgo: 7 },
    ],
  },
  {
    id: "F-016", title: "Sanciones 2.0: los tickers soberanos como arma diplomatica", category: "DIPLOMACIA",
    body: "Observen el patron: cada ronda de sanciones no mueve el precio del sancionado solo. Mueve a sus socios comerciales en el mismo tick. La bolsa de la app esta mostrando en vivo algo que antes tardaba semanas en verse: la economia como continente, no como islas. Ejemplos dentro.",
    author: "EMBAJADA_0", hoursAgo: 27, likes: 184, views: 6800,
    replies: [
      { author: "DOSSIER_X", body: "El caso OPEP+ es el mas claro: SAUR/AEDE/NGAR se mueven como un solo cuerpo. Hace 20 anos esto era teoria.", likes: 58, hoursAgo: 22 },
      { author: "CASUS_BELLI", body: "La diplomacia del futuro no sera con notas de protesta, sera con spreads. Estamos viendo el ensayo general.", likes: 40, hoursAgo: 18 },
    ],
  },
  {
    id: "F-017", title: "Guia: como ganar el MUNDO DE GUERRA defendiendo 3 frentes a la vez", category: "MILITAR",
    body: "Probado en 6 partidas: 1) no ataques ratio bajo 1.5 salvo emergencia 2) refuerza SIEMPRE tu capital antes que el frente 3) deja que las IA se desangren entre ellas un turno completo 4) el bonus continental vale mas que 3 territorios sueltos. Con capturas de mis bitacoras.",
    author: "MAPA_VIVO", hoursAgo: 34, likes: 276, views: 10200,
    replies: [
      { author: "SONAR_3", body: "El punto 3 es oro: en mi partida EJE y SOMBRA se comieron mutuamente mientras yo asegure todo un continente en silencio.", likes: 63, hoursAgo: 28 },
      { author: "ALTITUDE_0", body: "Falta el detalle del ingreso: 1 tropa por cada 2 territorios. Encadenar territorios chicos tambien paga, no todo es bonus.", likes: 31, hoursAgo: 24 },
    ],
  },
  {
    id: "F-018", title: "RUMOR: la proxima revision trae ranking global de operadores de bolsa", category: "RUMORES",
    body: "Un alias del equipo dejo caer en el canal oficial que los P/L realizados 'pronto tendran tabla comparativa'. Si es cierto, el de las ordenes limite va a arrasar. Mientras tanto, posteen su P/L realizado de la semana como quien deja su marca en la pared.",
    author: "VECT0R", hoursAgo: 10, likes: 233, views: 8100,
    replies: [
      { author: "OILWATCH", body: "Realizado de la semana: +187 mon. 60% de IRNR dip, 40% disciplina. Dejo mi marca.", likes: 51, hoursAgo: 7 },
      { author: "MOD_HENRY", body: "Recuerdo: el ranking se hara por P/L porcentual, no absoluto. Así el que empieza con 250 monedas tambien compite.", likes: 88, hoursAgo: 5 },
      { author: "HYDRO_M", body: "+64 con dos limit ejecutados en EGRP. El secreto: armar limites ANTES de los eventos, no despues.", likes: 36, hoursAgo: 3 },
    ],
  },
];

// ---------- ENCUESTAS ----------
export interface PollOption {
  label: string;
  baseVotes: number;
}

export interface PollDef {
  id: string;
  question: string;
  category: ForumCategory | "COMUNIDAD";
  options: PollOption[];
  hoursLeft: number;
  conflictTag?: string;
}

export const POLLS: PollDef[] = [
  {
    id: "P-001", question: "Cuando cesara el alto el fuego actual del frente oriental?", category: "MILITAR", conflictTag: "UA",
    options: [
      { label: "Antes de fin de mes", baseVotes: 421 },
      { label: "En 1-3 meses", baseVotes: 1187 },
      { label: "En mas de 3 meses", baseVotes: 2044 },
      { label: "Se congela sin acuerdo formal", baseVotes: 1533 },
    ],
    hoursLeft: 62,
  },
  {
    id: "P-002", question: "Que dispositivo es mejor despliegue para empezar a ganar monedas?", category: "COMUNIDAD",
    options: [
      { label: "GUARD-100 en zona urbana", baseVotes: 312 },
      { label: "TERM-300 en garita", baseVotes: 588 },
      { label: "4K tactica en puerto", baseVotes: 467 },
      { label: "Orbital en costa", baseVotes: 240 },
    ],
    hoursLeft: 30,
  },
  {
    id: "P-003", question: "Quien esta inflando mas la narrativa esta semana?", category: "DIPLOMACIA",
    options: [
      { label: "Kyiv Directo", baseVotes: 380 },
      { label: "Radio Moscu", baseVotes: 902 },
      { label: "Pentagon Feed", baseVotes: 512 },
      { label: "Pyongyang State", baseVotes: 1731 },
    ],
    hoursLeft: 47,
  },
  {
    id: "P-004", question: "El nivel del embalse al 34%: esto termina en...", category: "ECONOMIA",
    options: [
      { label: "Restricciones en 2-3 semanas", baseVotes: 894 },
      { label: "Lluvias fuera de temporada lo salvan", baseVotes: 276 },
      { label: "Conflicto por el agua", baseVotes: 655 },
      { label: "Nada, es operacion de mantenimiento", baseVotes: 143 },
    ],
    hoursLeft: 78,
  },
  {
    id: "P-005", question: "Mejor mini-juego/panel para subir XP rapido", category: "COMUNIDAD",
    options: [
      { label: "Threat Assessment (minijuego)", baseVotes: 1024 },
      { label: "Quiz geopolítico", baseVotes: 866 },
      { label: "Simulador de combate", baseVotes: 733 },
      { label: "Fusion de inventario", baseVotes: 187 },
    ],
    hoursLeft: 20,
  },
  {
    id: "P-006", question: "El enjambre autonomo de 50 drones: que cambia primero?", category: "MILITAR",
    options: [
      { label: "Doctrina anti-dron", baseVotes: 1203 },
      { label: "Tratados de armas autonomas", baseVotes: 488 },
      { label: "Precio de los drones", baseVotes: 322 },
      { label: "Nada, es marketing", baseVotes: 409 },
    ],
    hoursLeft: 90,
  },
  {
    id: "P-007", question: "Apuestas internas: proximo frente en entrar en alerta roja", category: "MILITAR", conflictTag: "MAPA",
    options: [
      { label: "Estrecho de Taiwan", baseVotes: 921 },
      { label: "Bab el-Mandeb", baseVotes: 744 },
      { label: "Sahel", baseVotes: 610 },
      { label: "Kashmir", baseVotes: 512 },
    ],
    hoursLeft: 54,
  },
  {
    id: "P-008", question: "Que canal deberia hacer mas directos?", category: "COMUNIDAD",
    options: [
      { label: "Kyiv Directo", baseVotes: 688 },
      { label: "VANGUARD Oficial", baseVotes: 1450 },
      { label: "Lagos Wire", baseVotes: 302 },
      { label: "Brasilia Abierta", baseVotes: 421 },
    ],
    hoursLeft: 36,
  },
];

// ---------- HELPERS ----------
export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDuration(sec: number): string {
  if (!sec) return "LIVE";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function hoursAgoToText(h: number): string {
  if (h < 1) return "ahora";
  if (h < 24) return `hace ${Math.round(h)}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}
