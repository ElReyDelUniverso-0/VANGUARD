// v13 — SALA OSINT: datos de las 15 capas del mapa mundial.
// Todo lo que no tiene API publica es simulado con realismo (flights, ships,
// cyber, GPS jam, satelites, clima, incendios); sismos llegan EN VIVO de USGS.

export interface OsintPoint {
  id: string;
  layer: LayerId;
  name: string;
  lat: number;
  lng: number;
  countries: string[]; // codigos ISO para banderas
  intensity: number; // 1-10
  status: "ACTIVO" | "NEGOCIACION" | "RESUELTO" | "MONITOREO";
  since: string;
  detail: string;
  news?: { title: string; source: string; ago: string }[];
}

export type LayerId =
  | "conflictos"
  | "tensiones"
  | "vuelos"
  | "barcos"
  | "ciber"
  | "gps"
  | "cables"
  | "satelites"
  | "clima"
  | "nucleares"
  | "bases"
  | "oleoductos"
  | "incendios"
  | "sismos"
  | "historicos";

export interface LayerDef {
  id: LayerId;
  label: string;
  emoji: string;
  color: string; // hex para el mapa
  desc: string;
  live?: boolean; // datos en vivo de API real
}

export const LAYERS: LayerDef[] = [
  { id: "conflictos", label: "Conflictos armados activos", emoji: "🔴", color: "#FF3B30", desc: "Frentes de guerra con combates activos verificados" },
  { id: "tensiones", label: "Tensiones geopoliticas", emoji: "🟠", color: "#FF9500", desc: "Escaladas diplomáticas, movilizaciones y crisis sin fuego" },
  { id: "vuelos", label: "Vuelos militares (OpenSky)", emoji: "✈️", color: "#1E90FF", desc: "Patrullas, transportes y ISR en ruta" },
  { id: "barcos", label: "Barcos de guerra (MarineTraffic)", emoji: "🚢", color: "#4DA6FF", desc: "Grupos de combate y patrullas navales" },
  { id: "ciber", label: "Ciberataques en vivo (Cloudflare)", emoji: "💻", color: "#BF5AF2", desc: "Tráfico malicioso entre países, atenuación DNS" },
  { id: "gps", label: "Interferencia GPS (GPSJam)", emoji: "📡", color: "#FFD60A", desc: "Zonas con degradación de señal GNSS reportada" },
  { id: "cables", label: "Cables submarinos de internet", emoji: "🌐", color: "#64D2FF", desc: "Backbones que llevan el 99% del tráfico global" },
  { id: "satelites", label: "Satélites militares en órbita", emoji: "🛸", color: "#F0F0F0", desc: "Reconocimiento, SIGINT y alerta temprana" },
  { id: "clima", label: "Clima en zonas de conflicto", emoji: "🌩️", color: "#00C7BE", desc: "Ventanas meteorológicas que afectan operaciones" },
  { id: "nucleares", label: "Instalaciones nucleares", emoji: "☢️", color: "#FFD60A", desc: "Centrales, enriquecimiento y arsenales declarados" },
  { id: "bases", label: "Bases militares del mundo", emoji: "🏛️", color: "#00FF87", desc: "Despliegues extranjeros permanentes" },
  { id: "oleoductos", label: "Oleoductos estratégicos", emoji: "🛢️", color: "#C68452", desc: "Energía que cruza zonas de riesgo" },
  { id: "incendios", label: "Incendios (NASA FIRMS)", emoji: "🔥", color: "#FF6B35", desc: "Hotspots térmicos detectados por satélite" },
  { id: "sismos", label: "Terremotos (USGS en vivo)", emoji: "🌋", color: "#00FF87", desc: "Sismos M2.5+ últimas 24h — API real", live: true },
  { id: "historicos", label: "Eventos históricos", emoji: "📜", color: "#F5A623", desc: "Batallas y giros que cambiaron el mapa" },
];

// ====== CAPA 1+2: conflictos y tensiones (realistas, coherentes con CONFLICTS) ======
export const TENSIONS: OsintPoint[] = [
  { id: "t-strait", layer: "tensiones", name: "Estrecho de Taiwán — Cruces ADIZ", lat: 24.2, lng: 120.6, countries: ["TW", "CN", "US"], intensity: 8, status: "MONITOREO", since: "2021", detail: "Media de 12 incursiones aéreas diarias al ADIZ. Ejercicios de bloqueo simulado reportados por Taipei." },
  { id: "t-kashmir", layer: "tensiones", name: "Línea de Control Cachemira", lat: 34.1, lng: 74.6, countries: ["IN", "PK"], intensity: 7, status: "ACTIVO", since: "1947", detail: "Intercambio de fuego esporádico. Ambas potencias nucleares con doctrina de respuesta rápida." },
  { id: "t-venezuela", layer: "tensiones", name: "Frontera Colombia–Venezuela", lat: 7.1, lng: -72.4, countries: ["CO", "VE"], intensity: 5, status: "MONITOREO", since: "2021", detail: "Movilización de unidades fronterizas y tensión por grupos irregulares en el Catatumbo." },
  { id: "t-balcans", layer: "tensiones", name: "Norte de Kosovo — Mitrovica", lat: 42.89, lng: 20.87, countries: ["XK", "RS"], intensity: 6, status: "NEGOCIACION", since: "2022", detail: "Protestas étnicas y despliegue de KFOR reforzado tras crisis de alcaldías." },
  { id: "t-marrojo", layer: "tensiones", name: "Mares del Sur — Segundo Thomas Shoal", lat: 9.74, lng: 115.86, countries: ["PH", "CN"], intensity: 6, status: "ACTIVO", since: "2023", detail: "Bloqueos a reabastecimiento filipino y cortes de cabos reportados por Manila." },
  { id: "t-caucaso", layer: "tensiones", name: "Corredor de Zangezur", lat: 39.2, lng: 46.3, countries: ["AM", "AZ"], intensity: 5, status: "NEGOCIACION", since: "2021", detail: "Negociación del corredor bajo mediación rusa y de la UE; incidentes fronterizos semanales." },
  { id: "t-sahel", layer: "tensiones", name: "Expulsión de tropas — Sahel", lat: 12.6, lng: -8.0, countries: ["ML", "BF", "NE", "RU"], intensity: 7, status: "ACTIVO", since: "2022", detail: "Retirada ordenada de fuerzas occidentales y entrada de instructores rusos en tres capitales." },
  { id: "t-corea", layer: "tensiones", name: "Zona Desmilitarizada de Corea", lat: 38.0, lng: 127.0, countries: ["KR", "KP"], intensity: 6, status: "MONITOREO", since: "1953", detail: "Pruebas de misiles balísticos semanales y guerra de globos de vigilancia." },
];

// ====== CAPA 3: vuelos militares (simulados estilo OpenSky) ======
export interface OsintRoute { id: string; from: [number, number]; to: [number, number]; label: string; }
export const MILITARY_FLIGHTS: OsintRoute[] = [
  { id: "fl-rc135", from: [52.3, 4.9], to: [55.6, 20.4], label: "RC-135 ISR · Báltico" },
  { id: "fl-b52", from: [30.2, -97.7], to: [36.1, -5.3], label: "B-52 · Bomber Task" },
  { id: "fl-a400", from: [48.6, 7.6], to: [37.9, 23.7], label: "A400M · Ruta Atenas" },
  { id: "fl-il76", from: [55.7, 37.6], to: [43.1, 131.9], label: "IL-76 · Puente Este" },
  { id: "fl-p8", from: [32.3, 119.8], to: [22.6, 120.3], label: "P-8 · Mar del Sur" },
  { id: "fl-drone", from: [12.1, 15.0], to: [16.0, 32.5], label: "MQ-9 · Sahel" },
  { id: "fl-f35", from: [24.4, 54.6], to: [25.3, 55.3], label: "F-35 · Golfo" },
  { id: "fl-tu95", from: [64.3, 100.2], to: [69.3, 18.8], label: "Tu-95 · Ártico" },
];

// ====== CAPA 4: barcos de guerra ======
export const WARSHIPS: OsintPoint[] = [
  { id: "sh-csg", layer: "barcos", name: "Carrier Strike Group — Mediterráneo Oriental", lat: 34.2, lng: 32.9, countries: ["US"], intensity: 6, status: "MONITOREO", since: "2023", detail: "Portaaviones + 4 destructores. Escudo aéreo sobre el Levante." },
  { id: "sh-black", layer: "barcos", name: "Patrulla del Bósforo", lat: 41.1, lng: 29.05, countries: ["TR"], intensity: 4, status: "MONITOREO", since: "2022", detail: "Inspección de tránsito bajo la Convención de Montreux." },
  { id: "sh-hormuz", layer: "barcos", name: "Escort Tankers — Estrecho de Ormuz", lat: 26.6, lng: 56.3, countries: ["US", "GB"], intensity: 5, status: "MONITOREO", since: "2019", detail: "Escoltas a buques civiles tras confiscaciones iraníes." },
  { id: "sh-scs", layer: "barcos", name: "Flotilla de Guardacostas — Mares del Sur", lat: 11.5, lng: 114.3, countries: ["CN"], intensity: 6, status: "ACTIVO", since: "2021", detail: "Decenas de buques de milicia marítima alrededor de arrecifes disputados." },
  { id: "sh-redsea", layer: "barcos", name: "Operación Guardián — Mar Rojo", lat: 15.3, lng: 41.2, countries: ["US", "FR", "IT"], intensity: 7, status: "ACTIVO", since: "2023", detail: "Intercepciones de drones y misiles antibuque contra tráfico comercial." },
  { id: "sh-baltic", layer: "barcos", name: "SNMG-1 — Mar Báltico", lat: 57.7, lng: 18.6, countries: ["DE", "SE", "FI"], intensity: 4, status: "MONITOREO", since: "2024", detail: "Vigilancia de cables submarinos tras cortes de anclaje sospechosos." },
];

// ====== CAPA 5: ciberataques (simulado estilo Cloudflare Radar) ======
export const CYBER_ATTACKS: OsintRoute[] = [
  { id: "cy-ru-us", from: [55.7, 37.6], to: [40.7, -74.0], label: "DDoS L7 · 84 Gbps" },
  { id: "cy-cn-tw", from: [31.2, 121.5], to: [25.0, 121.5], label: "Escaneo masivo · 1.2M req/min" },
  { id: "cy-ir-il", from: [35.7, 51.4], to: [32.1, 34.8], label: "Botnet · Sector energía" },
  { id: "cy-kp-kr", from: [39.0, 125.7], to: [37.6, 127.0], label: "Phishing APT · Finanzas" },
  { id: "cy-ru-pl", from: [54.7, 20.5], to: [52.2, 21.0], label: "DNS amplification" },
  { id: "cy-cn-jp", from: [39.9, 116.4], to: [35.7, 139.7], label: "Credential stuffing" },
];

// ====== CAPA 6: interferencia GPS ======
export const GPS_JAM: OsintPoint[] = [
  { id: "gps-baltic", layer: "gps", name: "Degradación GNSS — Báltico", lat: 58.4, lng: 22.0, countries: ["EE", "LV", "FI"], intensity: 7, status: "ACTIVO", since: "2024", detail: "Aviación civil reporta pérdida de posicionamiento en 60% de vuelos regionales." },
  { id: "gps-med", layer: "gps", name: "Jamming — Mediterráneo Oriental", lat: 34.8, lng: 33.5, countries: ["CY", "LB", "IL"], intensity: 6, status: "ACTIVO", since: "2023", detail: "GPS spoofing en rutas aéreas comerciales cerca de zonas de combate." },
  { id: "gps-gulfo", layer: "gps", name: "Interferencia — Golfo Pérsico", lat: 27.0, lng: 52.5, countries: ["AE", "IR"], intensity: 5, status: "MONITOREO", since: "2019", detail: "Spoofing navario crónico reportado por operadores de tanqueros." },
  { id: "gps-front", layer: "gps", name: "Guerra electrónica — Frente Oriental", lat: 49.0, lng: 36.5, countries: ["UA", "RU"], intensity: 9, status: "ACTIVO", since: "2022", detail: "Jamming intensivo de drones a 100km de la línea de contacto." },
];

// ====== CAPA 7: cables submarinos ======
export const SUBMARINE_CABLES: OsintRoute[] = [
  { id: "cb-1", from: [51.5, -3.0], to: [40.7, -74.0], label: "TAT-14/AEC" },
  { id: "cb-2", from: [36.1, -5.3], to: [1.3, 103.8], label: "SEA-ME-WE 5" },
  { id: "cb-3", from: [35.5, 139.7], to: [33.9, -118.4], label: "JUPITER" },
  { id: "cb-4", from: [-23.5, -43.2], to: [5.9, -0.3], label: "SACS" },
  { id: "cb-5", from: [25.2, 55.3], to: [12.8, 45.0], label: "FALCON" },
  { id: "cb-6", from: [59.3, 18.0], to: [51.9, 4.5], label: "C-Lion1" },
];

// ====== CAPA 9: clima en zonas de conflicto ======
export const WEATHER_ZONES: OsintPoint[] = [
  { id: "wx-ukr", layer: "clima", name: "Rasputitsa — Barro de otoño", lat: 49.6, lng: 34.5, countries: ["UA"], intensity: 5, status: "MONITOREO", since: "estacional", detail: "Lluvia reduce movilidad de vehículos pesados 40% fuera de carretera." },
  { id: "wx-sahel", layer: "clima", name: "Harmattan — Sahel", lat: 14.5, lng: 0.0, countries: ["ML", "NE"], intensity: 4, status: "MONITOREO", since: "estacional", detail: "Polvo limita vuelo con visibilidad <1km; ventanas de ataque reducidas." },
  { id: "wx-gaza", layer: "clima", name: "Tormentas — Levante", lat: 31.5, lng: 34.4, countries: ["PS", "IL"], intensity: 3, status: "MONITOREO", since: "estacional", detail: "Aguaceros agravan crisis humanitaria en campamentos del sur." },
  { id: "wx-artic", layer: "clima", name: "Ruta del Ártico abierta", lat: 76.0, lng: 100.0, countries: ["RU", "NO"], intensity: 4, status: "MONITOREO", since: "estacional", detail: "Deshielo amplía navegación 3 semanas; carrera por escolta militar." },
];

// ====== CAPA 10: instalaciones nucleares ======
export const NUCLEAR_SITES: OsintPoint[] = [
  { id: "nu-zapor", layer: "nucleares", name: "Central de Zaporiyia (ocupada)", lat: 47.51, lng: 34.59, countries: ["UA", "RU"], intensity: 9, status: "ACTIVO", since: "2022", detail: "Mayor planta de Europa bajo ocupación militar. OIEA exige desmilitarización." },
  { id: "nu-natanz", layer: "nucleares", name: "Natanz — Enriquecimiento", lat: 33.72, lng: 51.73, countries: ["IR"], intensity: 8, status: "MONITOREO", since: "2002", detail: "Centrífugas avanzadas IR-6 bajo vigilancia reducida del OIEA." },
  { id: "nu-yongbyon", layer: "nucleares", name: "Yongbyon — Reprocesamiento", lat: 39.8, lng: 125.75, countries: ["KP"], intensity: 8, status: "MONITOREO", since: "1985", detail: "Actividad de plutonio detectada por imágenes satelitales." },
  { id: "nu-punggye", layer: "nucleares", name: "Punggye-ri — Túnel 3", lat: 41.28, lng: 129.09, countries: ["KP"], intensity: 7, status: "MONITOREO", since: "2006", detail: "Preparativos de 7ª prueba nuclear observados en períodos previos." },
  { id: "nu-kursk", layer: "nucleares", name: "Central de Kursk", lat: 51.67, lng: 35.62, countries: ["RU"], intensity: 6, status: "MONITOREO", since: "1976", detail: "Cercana a zona de operaciones; plan de contingencia activo." },
  { id: "nu-bushehr", layer: "nucleares", name: "Bushéhr", lat: 28.83, lng: 50.89, countries: ["IR"], intensity: 5, status: "MONITOREO", since: "2011", detail: "Única central civil iraní, alimentada por combustible ruso." },
];

// ====== CAPA 11: bases militares ======
export const MILITARY_BASES: OsintPoint[] = [
  { id: "bs-ramstein", layer: "bases", name: "Ramstein (US) — Alemania", lat: 49.44, lng: 7.6, countries: ["US", "DE"], intensity: 4, status: "MONITOREO", since: "1953", detail: "Hub logístico y de mando aéreo de la OTAN en Europa." },
  { id: "bs-diego", layer: "bases", name: "Diego García (US/UK)", lat: -7.31, lng: 72.41, countries: ["US", "GB"], intensity: 5, status: "MONITOREO", since: "1971", detail: "Base estratégica del Índico: bombarderos y submarinos de apoyo." },
  { id: "bs-djibouti", layer: "bases", name: "Camp Lemonnier (US) + Base china", lat: 11.55, lng: 43.15, countries: ["US", "CN", "DJ"], intensity: 5, status: "MONITOREO", since: "2003", detail: "Única base africana de China a 12km de la mayor de EEUU." },
  { id: "bs-tartus", layer: "bases", name: "Tartús (RU) — Siria", lat: 34.89, lng: 35.87, countries: ["RU"], intensity: 6, status: "MONITOREO", since: "1971", detail: "Único puerto ruso en el Mediterráneo; futuro en renegociación." },
  { id: "bs-okinawa", layer: "bases", name: "Kadena (US) — Okinawa", lat: 26.35, lng: 127.77, countries: ["US", "JP"], intensity: 4, status: "MONITOREO", since: "1945", detail: "50+ mil efectivos; pieza clave de la disuasión en el Pacífico." },
  { id: "bs-tartus2", layer: "bases", name: "Gibraltar (UK)", lat: 36.14, lng: -5.35, countries: ["GB"], intensity: 3, status: "MONITOREO", since: "1704", detail: "Control del acceso occidental al Mediterráneo." },
];

// ====== CAPA 12: oleoductos estratégicos ======
export const PIPELINES: OsintRoute[] = [
  { id: "pl-nordic", from: [60.0, 24.0], to: [54.7, 20.5], label: "Baltic Pipe" },
  { id: "pl-tapi", from: [31.6, 65.7], to: [25.4, 68.4], label: "TAPI" },
  { id: "pl-kuwait", from: [29.3, 47.5], to: [29.4, 34.8], label: "Ruta del Golfo" },
  { id: "pl-bakutbilisi", from: [40.4, 49.9], to: [41.7, 44.8], label: "BTC" },
  { id: "pl-kc", from: [47.9, 106.9], to: [51.5, 104.0], label: "ESPO" },
  { id: "pl-druzhba", from: [55.8, 37.6], to: [52.2, 21.0], label: "Druzhba Norte" },
];

// ====== CAPA 13: incendios (estilo NASA FIRMS) ======
export const FIRE_HOTSPOTS: OsintPoint[] = [
  { id: "fi-siberia", layer: "incendios", name: "Fuegos — Yakutia", lat: 62.0, lng: 129.7, countries: ["RU"], intensity: 7, status: "ACTIVO", since: "temporada", detail: "300K ha activas; humo visible desde órbita y carbonización del permafrost." },
  { id: "fi-amazon", layer: "incendios", name: "Quemas — Amazonia", lat: -8.0, lng: -55.0, countries: ["BR"], intensity: 6, status: "ACTIVO", since: "temporada", detail: "Hotspots asociados a deforestación; alertas de calidad del aire en 4 estados." },
  { id: "fi-australia", layer: "incendios", name: "Bushman — Australia Occidental", lat: -30.7, lng: 121.5, countries: ["AU"], intensity: 5, status: "MONITOREO", since: "temporada", detail: "Frentes lineales de 40km en matorral; vientos favorables a propagación." },
  { id: "fi-grecia", layer: "incendios", name: "Incendio forestal — Ática", lat: 38.1, lng: 23.8, countries: ["GR"], intensity: 6, status: "ACTIVO", since: "temporada", detail: "Evacuaciones costeras; Canadair de la UE desplegados." },
];

// ====== CAPA 15: eventos históricos ======
export const HISTORIC_EVENTS: OsintPoint[] = [
  { id: "h-stalingrado", layer: "historicos", name: "Batalla de Stalingrado (1942-43)", lat: 48.7, lng: 44.5, countries: ["RU", "DE"], intensity: 10, status: "RESUELTO", since: "1942", detail: "2M de bajas. Punto de inflexión del frente oriental de la II Guerra Mundial." },
  { id: "h-normandia", layer: "historicos", name: "Desembarco de Normandía (1944)", lat: 49.4, lng: -0.9, countries: ["US", "GB", "FR", "DE"], intensity: 10, status: "RESUELTO", since: "1944", detail: "156K tropas desembarcadas el D-Day; abre el segundo frente en Europa." },
  { id: "h-berlin", layer: "historicos", name: "Muro de Berlín (1961-89)", lat: 52.52, lng: 13.4, countries: ["DE"], intensity: 8, status: "RESUELTO", since: "1961", detail: "Símbolo de la Guerra Fría; caída el 9 de noviembre de 1989." },
  { id: "h-suez", layer: "historicos", name: "Crisis de Suez (1956)", lat: 30.6, lng: 32.3, countries: ["EG", "GB", "FR", "IL"], intensity: 7, status: "RESUELTO", since: "1956", detail: "Fin de las potencias coloniales europeas como actores globales." },
  { id: "h-bayeux", layer: "historicos", name: "Batalla de Hastings (1066)", lat: 50.91, lng: 0.49, countries: ["GB", "FR"], intensity: 6, status: "RESUELTO", since: "1066", detail: "Guillermo el Conquistador cambia el mapa de Inglaterra para siempre." },
  { id: "h-gaugamela", layer: "historicos", name: "Gaugamela — Alejandro (331 a.C.)", lat: 36.36, lng: 43.25, countries: ["IQ", "GR"], intensity: 7, status: "RESUELTO", since: "-331", detail: "Alejandro derrota a Darío III y toma Babilonia; nace el helenismo." },
];

// ====== conteo por capa (para switches) ======
export function layerCount(id: LayerId, extraCount = 0): number {
  const statics = {
    conflictos: 0, // se llena desde CONFLICTS en el panel
    tensiones: TENSIONS.length,
    vuelos: MILITARY_FLIGHTS.length,
    barcos: WARSHIPS.length,
    ciber: CYBER_ATTACKS.length,
    gps: GPS_JAM.length,
    cables: SUBMARINE_CABLES.length,
    satelites: 0, // orbita animada, contador fijo
    clima: WEATHER_ZONES.length,
    nucleares: NUCLEAR_SITES.length,
    bases: MILITARY_BASES.length,
    oleoductos: PIPELINES.length,
    incendios: FIRE_HOTSPOTS.length,
    sismos: extraCount,
    historicos: HISTORIC_EVENTS.length,
  } as Record<LayerId, number>;
  return statics[id] ?? 0;
}

// ====== TERMÓMETRO MUNDIAL 1-100 ======
export function computeWorldTension(
  conflicts: { level: string; intensity: number }[],
  layerConvergence: number
): number {
  if (!conflicts.length) return 20;
  let sum = 0;
  for (const c of conflicts) {
    const w = c.level === "CRITICO" ? 1.0 : c.level === "TENSION" ? 0.62 : c.level === "INESTABILIDAD" ? 0.4 : 0.2;
    sum += (c.intensity / 100) * 22 * w;
  }
  // normalizado: fraccion de maximo teorico + convergencia de capas
  const norm = sum / Math.max(1, conflicts.length * 22);
  const base = norm * 68 + layerConvergence * 2.2 + 16;
  return Math.max(5, Math.min(100, Math.round(base)));
}

export function tensionColor(v: number): string {
  if (v >= 80) return "#FF3B30";
  if (v >= 60) return "#FF9500";
  if (v >= 40) return "#FFD60A";
  return "#00FF87";
}

export function tensionLabel(v: number): string {
  if (v >= 85) return "BRINK OF GLOBAL WAR";
  if (v >= 70) return "CRISIS MULTIFRENTE";
  if (v >= 55) return "TENSION ELEVADA";
  if (v >= 40) return "INESTABILIDAD MODERADA";
  return "ESTABILIDAD RELATIVA";
}
