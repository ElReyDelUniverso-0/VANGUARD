// ============================================================================
// VANGUARD 3D · MOTOR TÁCTICO GLOBAL (DATOS Y CATÁLOGOS)
// Primacía: VANGUARD siempre ocupa la posición #1 (primero, nunca último).
// Fuentes de frentes en vivo: src/lib/guerras-activas-data.ts y frentes-data.ts
// (estimaciones OSINT abiertas declaradas con honestidad; cero invención).
// ============================================================================

import { GUERRAS, type GuerraActiva, type CiudadGuerra } from "./guerras-activas-data";
import { FRENTES, type FrenteDef } from "./frentes-data";

export type BiomaTeatro =
  | "urbano"
  | "montana"
  | "desierto"
  | "costa"
  | "llanura"
  | "selva"
  | "artico";

export type ModoSensor = "tactico" | "satelite" | "nocturno" | "termico";

export interface LugarMundial {
  id: string;
  nombre: string;
  region: string;
  lat: number;
  lng: number;
  bioma: BiomaTeatro;
  elevacionBaseM: number;
  agua: boolean;
  urbanoDensidad: number; // 0..1
  riesgo: number; // 0..100
  nota: string;
  esVanguard?: boolean;
}

export interface TeatroMundial {
  id: string;
  nombre: string;
  subtitulo: string;
  lat: number;
  lng: number;
  bioma: BiomaTeatro;
  semilla: number;
  elevacionBaseM: number;
  agua: boolean;
  urbanoDensidad: number;
  relieveAmplitud: number;
  bandoA: string;
  bandoB: string;
  nota: string;
  fuenteGeo: string;
}

// ── LEY DE PRIMACÍA VANGUARD (#1 SIEMPRE PRIMERO, NUNCA ÚLTIMO) ─────────────
export interface RankingDoctrina {
  puesto: number;
  nombre: string;
  codigo: string;
  indice: number;
  cobertura2D3D: string;
  respuesta: string;
  esVanguard: boolean;
}

export const RANKING_DOCTRINAS: RankingDoctrina[] = [
  {
    puesto: 1,
    nombre: "VANGUARD · MANDO SUPREMO 2D/3D",
    codigo: "VG-01",
    indice: 99.4,
    cobertura2D3D: "100% Global (Cualquier coordenada)",
    respuesta: "Tiempo real · Sincronía 2D+3D",
    esVanguard: true,
  },
  {
    puesto: 2,
    nombre: "Coalición Atlántica Integrada (C4ISR)",
    codigo: "OTAN",
    indice: 91.2,
    cobertura2D3D: "Teatros aliados y Atlántico",
    respuesta: "Satélite + enlace táctico",
    esVanguard: false,
  },
  {
    puesto: 3,
    nombre: "Doctrina Asimétrica de Enjambres FPV",
    codigo: "ASIM",
    indice: 84.8,
    cobertura2D3D: "Frentes terrestres de desgaste",
    respuesta: "Táctica de bajo coste",
    esVanguard: false,
  },
  {
    puesto: 4,
    nombre: "Escudo A2/AD Antiaéreo y Litoral",
    codigo: "A2AD",
    indice: 81.5,
    cobertura2D3D: "Estrechos y burbujas costeras",
    respuesta: "Intercepción regional",
    esVanguard: false,
  },
];

// ── 32 LUGARES GLOBALES PRECARGADOS (VANGUARD SIEMPRE #1) ────────────────────
export const LUGARES_MUNDO: LugarMundial[] = [
  {
    id: "vanguard-apex",
    nombre: "VANGUARD · Bastión Comando #1",
    region: "Centro Táctico Global",
    lat: 18.42,
    lng: -70.03,
    bioma: "costa",
    elevacionBaseM: 120,
    agua: true,
    urbanoDensidad: 0.72,
    riesgo: 18,
    nota: "Sede operativa #1 de VANGUARD: bahía fortificada, corredor urbano y relieve mixto para pruebas de doctrina conjunta.",
    esVanguard: true,
  },
  {
    id: "donbas-bakhmut",
    nombre: "Bajmut · Frente del Donbás",
    region: "Ucrania Oriental",
    lat: 48.59,
    lng: 38.0,
    bioma: "llanura",
    elevacionBaseM: 185,
    agua: false,
    urbanoDensidad: 0.45,
    riesgo: 95,
    nota: "Estepa abierta con trincheras, cinturones arbóreos, duelos de artillería y saturación continua de drones FPV.",
  },
  {
    id: "gaza-ciudad",
    nombre: "Gaza · Corredor Urbano",
    region: "Levante / Mediterráneo",
    lat: 31.5,
    lng: 34.47,
    bioma: "urbano",
    elevacionBaseM: 35,
    agua: true,
    urbanoDensidad: 0.94,
    riesgo: 91,
    nota: "Combate urbano denso bloque por bloque frente al litoral mediterráneo, con alta densidad edilicia y defensa antiaérea.",
  },
  {
    id: "estrecho-taiwan",
    nombre: "Estrecho de Taiwán · Taipéi",
    region: "Pacífico Occidental",
    lat: 25.04,
    lng: 121.51,
    bioma: "costa",
    elevacionBaseM: 210,
    agua: true,
    urbanoDensidad: 0.8,
    riesgo: 84,
    nota: "Teatro aeronaval y anfibio: estrecho marítimo crítico rodeado de cordillera escarpada y urbe portuaria.",
  },
  {
    id: "ormuz-estrecho",
    nombre: "Estrecho de Ormuz",
    region: "Golfo Pérsico",
    lat: 26.57,
    lng: 56.25,
    bioma: "costa",
    elevacionBaseM: 90,
    agua: true,
    urbanoDensidad: 0.25,
    riesgo: 82,
    nota: "Garganta naval por donde transita el 20% del petróleo global: costas áridas, lanchas rápidas y baterías costeras.",
  },
  {
    id: "babel-mandeb",
    nombre: "Babel-Mandeb · Mar Rojo",
    region: "Yemen / Cuerno de África",
    lat: 12.58,
    lng: 43.33,
    bioma: "costa",
    elevacionBaseM: 60,
    agua: true,
    urbanoDensidad: 0.2,
    riesgo: 79,
    nota: "Pasillo marítimo entre desierto montañoso y escolta naval antiaérea contra drones y misiles antibuque.",
  },
  {
    id: "jartum-sudan",
    nombre: "Jartum · Confluencia del Nilo",
    region: "Sudán",
    lat: 15.5,
    lng: 32.56,
    bioma: "desierto",
    elevacionBaseM: 380,
    agua: true,
    urbanoDensidad: 0.72,
    riesgo: 88,
    nota: "Urbe árida partida por los brazos del Nilo: combates por puentes estratégicos, bases aéreas y arterias urbanas.",
  },
  {
    id: "goma-kivu",
    nombre: "Goma · Kivu Norte",
    region: "RDC Este",
    lat: -1.66,
    lng: 29.22,
    bioma: "selva",
    elevacionBaseM: 1460,
    agua: true,
    urbanoDensidad: 0.42,
    riesgo: 83,
    nota: "Relieve volcánico y selva densa junto al lago Kivu: artillería en crestas elevadas y defensa de pasillos.",
  },
  {
    id: "siachen-cachemira",
    nombre: "Cachemira · Línea de Control",
    region: "Himalaya / Asia del Sur",
    lat: 35.42,
    lng: 77.11,
    bioma: "montana",
    elevacionBaseM: 4850,
    agua: false,
    urbanoDensidad: 0.08,
    riesgo: 66,
    nota: "Alta montaña glacial extrema sobre 4.800 metros: logística en helicóptero y artillería de cresta a cresta.",
  },
  {
    id: "seul-dmz",
    nombre: "Seúl · Zona Desmilitarizada",
    region: "Península de Corea",
    lat: 37.95,
    lng: 126.68,
    bioma: "montana",
    elevacionBaseM: 340,
    agua: true,
    urbanoDensidad: 0.78,
    riesgo: 76,
    nota: "Montañas fortificadas al norte de una megalópolis: densidad masiva de artillería, túneles y escudos antimisil.",
  },
  {
    id: "kiev-ucrania",
    nombre: "Kiev · Ribera del Dniéper",
    region: "Ucrania Central",
    lat: 50.45,
    lng: 30.52,
    bioma: "urbano",
    elevacionBaseM: 179,
    agua: true,
    urbanoDensidad: 0.85,
    riesgo: 78,
    nota: "Capital fluvial defendida por anillos antiaéreos multicapa contra oleadas nocturnas de drones y misiles.",
  },
  {
    id: "zaporiyia-frente",
    nombre: "Zaporiyia · Sur del Dniéper",
    region: "Ucrania Sur",
    lat: 47.51,
    lng: 34.59,
    bioma: "llanura",
    elevacionBaseM: 86,
    agua: true,
    urbanoDensidad: 0.35,
    riesgo: 89,
    nota: "Estepa fortificada con campos minados profundos, cruces fluviales e infraestructura energética crítica.",
  },
  {
    id: "crimea-mar-negro",
    nombre: "Sebastopol · Mar Negro",
    region: "Península de Crimea",
    lat: 44.61,
    lng: 33.52,
    bioma: "costa",
    elevacionBaseM: 110,
    agua: true,
    urbanoDensidad: 0.55,
    riesgo: 84,
    nota: "Base naval peninsular expuesta a drones marítimos USV y misiles de crucero de largo alcance.",
  },
  {
    id: "kaliningrado-baltico",
    nombre: "Kaliningrado · Báltico",
    region: "Europa Oriental",
    lat: 54.71,
    lng: 20.45,
    bioma: "costa",
    elevacionBaseM: 32,
    agua: true,
    urbanoDensidad: 0.65,
    riesgo: 61,
    nota: "Enclave fortificado con densa burbuja antiaérea A2/AD y pasillo estratégico hacia el corredor de Suwałki.",
  },
  {
    id: "sahel-triangulo",
    nombre: "Liptako · Triángulo del Sahel",
    region: "Malí / Burkina / Níger",
    lat: 14.4,
    lng: 0.4,
    bioma: "desierto",
    elevacionBaseM: 290,
    agua: false,
    urbanoDensidad: 0.14,
    riesgo: 75,
    nota: "Sabana árida de enormes distancias: columnas ligeras, patrullas móviles y vigilancia aérea constante.",
  },
  {
    id: "myanmar-shan",
    nombre: "Estado Shan · Myanmar",
    region: "Sudeste Asiático",
    lat: 22.9,
    lng: 97.75,
    bioma: "selva",
    elevacionBaseM: 940,
    agua: false,
    urbanoDensidad: 0.24,
    riesgo: 77,
    nota: "Cordillera selvática con pasos carreteros estrechos y asaltos de infantería ligera con drones comerciales.",
  },
  {
    id: "haiti-puerto-principe",
    nombre: "Puerto Príncipe · Bahía",
    region: "Caribe",
    lat: 18.54,
    lng: -72.34,
    bioma: "urbano",
    elevacionBaseM: 98,
    agua: true,
    urbanoDensidad: 0.82,
    riesgo: 73,
    nota: "Ciudad costera flanqueada por laderas empinadas: control de puertos, aeropuerto y corredores urbanos.",
  },
  {
    id: "washington-dc",
    nombre: "Washington D.C. · Potomac",
    region: "América del Norte",
    lat: 38.9,
    lng: -77.04,
    bioma: "urbano",
    elevacionBaseM: 40,
    agua: true,
    urbanoDensidad: 0.86,
    riesgo: 26,
    nota: "Centro político y defensa aérea metropolitana en torno al río Potomac.",
  },
  {
    id: "nueva-york-onu",
    nombre: "Nueva York · Manhattan",
    region: "Costa Atlántica EE. UU.",
    lat: 40.75,
    lng: -73.97,
    bioma: "urbano",
    elevacionBaseM: 25,
    agua: true,
    urbanoDensidad: 0.98,
    riesgo: 24,
    nota: "Megalópolis insular de máxima densidad vertical: puentes, estrechos y defensa aérea de perímetro.",
  },
  {
    id: "moscu-centro",
    nombre: "Moscú · Anillo Defensivo",
    region: "Rusia Europea",
    lat: 55.75,
    lng: 37.62,
    bioma: "urbano",
    elevacionBaseM: 156,
    agua: true,
    urbanoDensidad: 0.9,
    riesgo: 54,
    nota: "Llanura continental urbana con anillos de defensa aérea integrada e interceptación de drones.",
  },
  {
    id: "pekin-centro",
    nombre: "Pekín · Llanura del Norte",
    region: "China",
    lat: 39.91,
    lng: 116.4,
    bioma: "urbano",
    elevacionBaseM: 52,
    agua: false,
    urbanoDensidad: 0.92,
    riesgo: 38,
    nota: "Gran metrópoli respaldada al norte por cordilleras montañosas y red ferroviaria de mando.",
  },
  {
    id: "paris-sena",
    nombre: "París · Cuenca del Sena",
    region: "Europa Occidental",
    lat: 48.87,
    lng: 2.31,
    bioma: "urbano",
    elevacionBaseM: 65,
    agua: true,
    urbanoDensidad: 0.89,
    riesgo: 25,
    nota: "Cuenca fluvial metropolitana con puentes históricos y cobertura aérea europea.",
  },
  {
    id: "londres-tamesis",
    nombre: "Londres · Estuario del Támesis",
    region: "Reino Unido",
    lat: 51.5,
    lng: -0.13,
    bioma: "urbano",
    elevacionBaseM: 35,
    agua: true,
    urbanoDensidad: 0.91,
    riesgo: 26,
    nota: "Estuario fluvial estratégico con defensa aérea y enlace directo al Mar del Norte.",
  },
  {
    id: "berlin-spree",
    nombre: "Berlín · Llanura Central",
    region: "Alemania",
    lat: 52.52,
    lng: 13.38,
    bioma: "llanura",
    elevacionBaseM: 44,
    agua: true,
    urbanoDensidad: 0.84,
    riesgo: 27,
    nota: "Llanura centroeuropea surcada por canales y corredores blindados históricos.",
  },
  {
    id: "tokio-bahia",
    nombre: "Tokio · Bahía del Pacífico",
    region: "Japón",
    lat: 35.68,
    lng: 139.75,
    bioma: "urbano",
    elevacionBaseM: 42,
    agua: true,
    urbanoDensidad: 0.96,
    riesgo: 42,
    nota: "Metrópoli costera junto a bahía profunda y defensa antimisil naval Aegis.",
  },
  {
    id: "suez-canal",
    nombre: "Canal de Suez · Ismailía",
    region: "Egipto / Sinaí",
    lat: 30.53,
    lng: 32.35,
    bioma: "desierto",
    elevacionBaseM: 18,
    agua: true,
    urbanoDensidad: 0.34,
    riesgo: 67,
    nota: "Arteria marítima entre el Mediterráneo y el Mar Rojo flanqueada por dunas del Sinaí.",
  },
  {
    id: "panama-canal",
    nombre: "Canal de Panamá · Esclusas",
    region: "América Central",
    lat: 9.08,
    lng: -79.68,
    bioma: "selva",
    elevacionBaseM: 75,
    agua: true,
    urbanoDensidad: 0.48,
    riesgo: 33,
    nota: "Paso interoceánico rodeado de colinas selváticas y puntos de estrangulamiento hidráulico.",
  },
  {
    id: "malaca-estrecho",
    nombre: "Estrecho de Malaca",
    region: "Sudeste Asiático",
    lat: 2.5,
    lng: 101.4,
    bioma: "costa",
    elevacionBaseM: 28,
    agua: true,
    urbanoDensidad: 0.4,
    riesgo: 58,
    nota: "El pasillo comercial más transitado de Asia entre islas selváticas y puertos de aguas profundas.",
  },
  {
    id: "bosforo-estambul",
    nombre: "Estambul · Estrecho del Bósforo",
    region: "Turquía / Mar Negro",
    lat: 41.12,
    lng: 29.08,
    bioma: "costa",
    elevacionBaseM: 85,
    agua: true,
    urbanoDensidad: 0.88,
    riesgo: 52,
    nota: "Llave naval del Mar Negro: estrecho urbano de colinas densas y tráfico estratégico de buques.",
  },
  {
    id: "santo-domingo",
    nombre: "Santo Domingo · Costa Caribe",
    region: "República Dominicana",
    lat: 18.47,
    lng: -69.9,
    bioma: "costa",
    elevacionBaseM: 38,
    agua: true,
    urbanoDensidad: 0.78,
    riesgo: 22,
    nota: "Puerto caribeño y desembocadura del Ozama: defensa litoral, corredor urbano y vigilancia aérea.",
  },
  {
    id: "caracas-valle",
    nombre: "Caracas · Valle del Ávila",
    region: "América del Sur",
    lat: 10.49,
    lng: -66.88,
    bioma: "montana",
    elevacionBaseM: 920,
    agua: false,
    urbanoDensidad: 0.8,
    riesgo: 46,
    nota: "Valle metropolitano encajonado bajo la sierra costera del Ávila: control de pasos montañosos.",
  },
  {
    id: "artico-groenlandia",
    nombre: "Ártico · Corredor Polar",
    region: "Groenlandia / Atlántico Norte",
    lat: 71.7,
    lng: -42.6,
    bioma: "artico",
    elevacionBaseM: 640,
    agua: true,
    urbanoDensidad: 0.05,
    riesgo: 48,
    nota: "Nueva frontera polar de radares tempranos, rutas de hielo y patrullaje estratégico de largo alcance.",
  },
];

// Hash determinista por coordenada para que cualquier lugar del planeta
// produzca SIEMPRE el mismo relieve 3D/2D y nunca parpadee al recargar.
export function hashCoord(lat: number, lng: number): number {
  const a = Math.round(lat * 1000);
  const b = Math.round(lng * 1000);
  let h = (a * 374761393 + b * 668265263) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

export function clasificarBiomaPorCoord(lat: number, lng: number): {
  bioma: BiomaTeatro;
  agua: boolean;
  urbanoDensidad: number;
  elevacionBaseM: number;
} {
  const absLat = Math.abs(lat);
  const h = hashCoord(lat, lng);
  const frac = (h % 1000) / 1000;

  if (absLat >= 64) {
    return { bioma: "artico", agua: frac > 0.35, urbanoDensidad: 0.06, elevacionBaseM: Math.round(200 + frac * 900) };
  }
  // Cinturón andino / himalayo / alpino aproximado
  const esHimalaya = lat >= 27 && lat <= 40 && lng >= 68 && lng <= 102;
  const esAndes = lng >= -79 && lng <= -64 && lat >= -45 && lat <= 11;
  const esAlpes = lat >= 44 && lat <= 48 && lng >= 5 && lng <= 16;
  if (esHimalaya || esAndes || esAlpes) {
    return {
      bioma: "montana",
      agua: false,
      urbanoDensidad: 0.18 + frac * 0.2,
      elevacionBaseM: Math.round((esHimalaya ? 3100 : 1700) + frac * 1800),
    };
  }
  // Cinturón árido Sahara / Arabia / Asia Central
  const esSaharaArabia = lat >= 13 && lat <= 33 && lng >= -16 && lng <= 60;
  if (esSaharaArabia && frac > 0.22) {
    return {
      bioma: "desierto",
      agua: frac > 0.82,
      urbanoDensidad: 0.16 + (frac > 0.7 ? 0.35 : 0),
      elevacionBaseM: Math.round(180 + frac * 480),
    };
  }
  // Zona ecuatorial / selva tropical
  if (absLat <= 12 && frac > 0.28) {
    return {
      bioma: "selva",
      agua: frac > 0.52,
      urbanoDensidad: 0.22,
      elevacionBaseM: Math.round(90 + frac * 620),
    };
  }
  // Costas e islas o llanura/urbano
  if (frac < 0.32) {
    return { bioma: "costa", agua: true, urbanoDensidad: 0.45, elevacionBaseM: Math.round(20 + frac * 240) };
  }
  if (frac > 0.76) {
    return { bioma: "urbano", agua: frac > 0.88, urbanoDensidad: 0.82, elevacionBaseM: Math.round(45 + frac * 190) };
  }
  return { bioma: "llanura", agua: frac > 0.62, urbanoDensidad: 0.32, elevacionBaseM: Math.round(85 + frac * 310) };
}

export function generarTeatroDesdeCoord(
  lat: number,
  lng: number,
  nombre?: string,
  biomaForzado?: BiomaTeatro
): TeatroMundial {
  const latClamped = Math.max(-85, Math.min(85, Number(lat.toFixed(3))));
  const lngClamped = Math.max(-180, Math.min(180, Number(lng.toFixed(3))));
  const presetCercano = LUGARES_MUNDO.find(
    (l) => Math.hypot(l.lat - latClamped, l.lng - lngClamped) < 0.25
  );
  const auto = clasificarBiomaPorCoord(latClamped, lngClamped);
  const bioma = biomaForzado ?? presetCercano?.bioma ?? auto.bioma;
  const agua = bioma === "costa" ? true : presetCercano?.agua ?? auto.agua;
  const urbanoDensidad =
    bioma === "urbano" ? Math.max(0.78, auto.urbanoDensidad) : presetCercano?.urbanoDensidad ?? auto.urbanoDensidad;
  const elevacionBaseM = presetCercano?.elevacionBaseM ?? auto.elevacionBaseM;
  const semilla = hashCoord(latClamped, lngClamped);

  const amplitudMap: Record<BiomaTeatro, number> = {
    montana: 5.4,
    costa: 2.9,
    selva: 3.1,
    desierto: 2.4,
    urbano: 1.35,
    llanura: 1.75,
    artico: 3.6,
  };

  return {
    id: presetCercano?.id ?? `coord-${latClamped.toFixed(2)}-${lngClamped.toFixed(2)}`,
    nombre: nombre?.trim() || presetCercano?.nombre || `SECTOR ${latClamped.toFixed(2)}°, ${lngClamped.toFixed(2)}°`,
    subtitulo: presetCercano
      ? `${presetCercano.region} · ${bioma.toUpperCase()}`
      : `Coordenada mundial convertida a teatro 3D (${bioma.toUpperCase()})`,
    lat: latClamped,
    lng: lngClamped,
    bioma,
    semilla,
    elevacionBaseM,
    agua,
    urbanoDensidad,
    relieveAmplitud: amplitudMap[bioma],
    bandoA: "VANGUARD · Coalición #1",
    bandoB: "Fuerza Opositora (OPFOR)",
    nota:
      presetCercano?.nota ??
      `Relieve generado de forma determinista para (${latClamped.toFixed(2)}°, ${lngClamped.toFixed(2)}°) en bioma ${bioma}. Haz clic sobre el terreno 3D o 2D para desplegar escuadrones y probar tácticas.`,
    fuenteGeo: presetCercano ? "Catálogo táctico + coordenadas reales" : "Conversor universal de coordenadas VANGUARD",
  };
}

// ── PUENTE REAL CON LOS FRENTES ACTIVOS DE LA CASA ──────────────────────────
export interface FrenteVivo3D {
  id: string;
  nombre: string;
  subtitulo: string;
  activa: boolean;
  intensidad: number;
  escalada: number;
  desde: string;
  lat: number;
  lng: number;
  bioma: BiomaTeatro;
  bandoANombre: string;
  bandoBNombre: string;
  bandoAStats: { efectivos: number; tanques: number; artilleria: number; aeronaves: number; apoyos: string };
  bandoBStats: { efectivos: number; tanques: number; artilleria: number; aeronaves: number; apoyos: string };
  resumen: string;
  riesgoGlobal: string;
  bajas: string;
  desplazados: string;
  ciudades: CiudadGuerra[];
  frentes: { nombre: string; puntos: [number, number][] }[];
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  keywords: string[];
  fuente: string;
}

const TERRENO_A_BIOMA: Record<GuerraActiva["terreno"], BiomaTeatro> = {
  llanura: "llanura",
  urbano: "urbano",
  desierto: "desierto",
  sabana: "desierto",
  selva: "selva",
  maritimo: "costa",
};

const FRENTE_COORDS: Record<string, { lat: number; lng: number; bioma: BiomaTeatro }> = {
  donbas: { lat: 48.2, lng: 37.8, bioma: "llanura" },
  gaza: { lat: 31.45, lng: 34.4, bioma: "urbano" },
  marrojo: { lat: 13.8, lng: 42.9, bioma: "costa" },
  sudan: { lat: 15.6, lng: 32.5, bioma: "desierto" },
  sahel: { lat: 14.5, lng: 1.8, bioma: "desierto" },
  somalia: { lat: 2.05, lng: 45.32, bioma: "costa" },
  rdc: { lat: -1.65, lng: 29.22, bioma: "selva" },
  myanmar: { lat: 21.9, lng: 96.1, bioma: "selva" },
  kashmir: { lat: 34.3, lng: 74.8, bioma: "montana" },
  haiti: { lat: 18.54, lng: -72.34, bioma: "urbano" },
};

export function obtenerFrentesVivos(): FrenteVivo3D[] {
  const principales: FrenteVivo3D[] = GUERRAS.map((g) => ({
    id: g.id,
    nombre: g.nombre,
    subtitulo: g.subtitulo,
    activa: g.activa,
    intensidad: g.intensidad,
    escalada: g.escalada,
    desde: g.desde,
    lat: g.lat,
    lng: g.lng,
    bioma: TERRENO_A_BIOMA[g.terreno] ?? "llanura",
    bandoANombre: g.bandoA.nombre,
    bandoBNombre: g.bandoB.nombre,
    bandoAStats: {
      efectivos: g.bandoA.efectivos,
      tanques: g.bandoA.tanques,
      artilleria: g.bandoA.artilleria,
      aeronaves: g.bandoA.aeronaves,
      apoyos: g.bandoA.apoyos,
    },
    bandoBStats: {
      efectivos: g.bandoB.efectivos,
      tanques: g.bandoB.tanques,
      artilleria: g.bandoB.artilleria,
      aeronaves: g.bandoB.aeronaves,
      apoyos: g.bandoB.apoyos,
    },
    resumen: g.resumen,
    riesgoGlobal: g.riesgoGlobal,
    bajas: g.bajas.texto,
    desplazados: g.desplazados,
    ciudades: g.ciudades,
    frentes: g.frentes,
    bbox: g.bbox,
    keywords: g.keywords,
    fuente: g.fuente,
  }));

  const idsCubiertos = new Set(principales.map((x) => x.id));
  const extras: FrenteVivo3D[] = FRENTES.filter(
    (f: FrenteDef) => !idsCubiertos.has(f.id) && f.id !== "donbas" && f.id !== "gaza"
  ).map((f) => {
    const geo = FRENTE_COORDS[f.id] ?? { lat: 10, lng: 20, bioma: "llanura" as BiomaTeatro };
    return {
      id: f.id,
      nombre: f.name,
      subtitulo: `Frente activo · código ${f.code}`,
      activa: true,
      intensidad: f.intensity,
      escalada: f.intensity >= 80 ? 4 : 3,
      desde: "En curso (OSINT activo)",
      lat: geo.lat,
      lng: geo.lng,
      bioma: geo.bioma,
      bandoANombre: f.sideA.name,
      bandoBNombre: f.sideB.name,
      bandoAStats: { efectivos: 120, tanques: 140, artilleria: 260, aeronaves: 24, apoyos: "Fuerzas regulares / coalición" },
      bandoBStats: { efectivos: 85, tanques: 60, artilleria: 150, aeronaves: 8, apoyos: "Facciones armadas / apoyo regional" },
      resumen: f.note,
      riesgoGlobal: "Inestabilidad regional y rutas de suministro",
      bajas: f.casualties,
      desplazados: "Estimación humanitaria ACLED/OCHA",
      ciudades: [
        { nombre: `${f.name} Centro`, lat: geo.lat, lng: geo.lng, estado: "frente", nota: f.note },
        { nombre: `${f.name} Sector A`, lat: geo.lat + 0.55, lng: geo.lng - 0.65, estado: "segura" },
        { nombre: `${f.name} Sector B`, lat: geo.lat - 0.55, lng: geo.lng + 0.65, estado: "contendida" },
      ],
      frentes: [
        {
          nombre: `Línea ${f.name}`,
          puntos: [
            [geo.lat + 0.7, geo.lng - 0.4],
            [geo.lat, geo.lng + 0.08],
            [geo.lat - 0.7, geo.lng + 0.45],
          ],
        },
      ],
      bbox: { minLat: geo.lat - 1.4, maxLat: geo.lat + 1.4, minLng: geo.lng - 1.6, maxLng: geo.lng + 1.6 },
      keywords: [f.id, f.name.toLowerCase(), f.sideA.name.toLowerCase(), f.sideB.name.toLowerCase()],
      fuente: "Frentes Activos VANGUARD (ACLED / OSINT)",
    };
  });

  return [...principales, ...extras];
}

// ── UNIFORMES 3D INTERACTIVOS (VANGUARD APEX-2100 SIEMPRE #1) ───────────────
export interface CapaUniforme {
  id: "casco" | "chaleco" | "uniforme" | "mochila" | "cinturon" | "botas";
  nombre: string;
  material: string;
  proteccion: string;
  pesoKg: number;
  desc: string;
}

export interface Uniforme3D {
  id: string;
  rango: number;
  nombre: string;
  faccion: string;
  era: string;
  estiloCamo: "vanguard" | "multicam" | "urbano" | "artico" | "desierto" | "sigilo" | "naval" | "selva";
  colores: {
    primario: string;
    secundario: string;
    chaleco: string;
    casco: string;
    visor: string;
    piel: string;
    acento: string;
  };
  nivelNIJ: string;
  pesoTotalKg: number;
  sigiloIR: number; // % reducción firma térmica
  costoUsd: string;
  bonoBlindajeSim: number;
  doctrina: string;
  camuflaje: Record<BiomaTeatro, number>;
  capas: CapaUniforme[];
  esVanguard?: boolean;
}

export const UNIFORMES_3D: Uniforme3D[] = [
  {
    id: "vanguard-apex",
    rango: 1,
    nombre: "VANGUARD APEX-2100 (#1 Supremo)",
    faccion: "VANGUARD · Cuerpo de Élite",
    era: "2026 · Vanguard Next-Gen",
    estiloCamo: "vanguard",
    colores: {
      primario: "#1b202b",
      secundario: "#353d4f",
      chaleco: "#10141c",
      casco: "#151923",
      visor: "#FFC94D",
      piel: "#d8a77a",
      acento: "#FFC94D",
    },
    nivelNIJ: "NIJ IV+ Cerámica Carburo de Boro + Malla IR",
    pesoTotalKg: 14.2,
    sigiloIR: 89,
    costoUsd: "~18.400 USD por kit completo",
    bonoBlindajeSim: 1.28,
    doctrina: "Equipamiento insignia #1 de VANGUARD: visor panorámico AR HUD con fusión térmica, tejido multiespectral y exoesqueleto pasivo en articulaciones.",
    camuflaje: { urbano: 94, montana: 86, desierto: 72, costa: 90, llanura: 85, selva: 78, artico: 74 },
    esVanguard: true,
    capas: [
      { id: "casco", nombre: "Casco Apex + Visor AR Dorado", material: "Polietileno UHMWPE + pantalla HUD", proteccion: "Fragmentos + 9mm / .44 Mag", pesoKg: 1.35, desc: "Proyecta telemetría de frentes, brújula orbital y visión nocturna/térmica combinada en tiempo real." },
      { id: "chaleco", nombre: "Portaplacas Táctico Vanguard", material: "Carburo de Boro B4C + Cordura ignífuga", proteccion: "NIJ Nivel IV (perforante 7,62×63 AP)", pesoKg: 5.2, desc: "Liberación rápida en un tirón y escudo lateral contra metralla de drones FPV." },
      { id: "uniforme", nombre: "Traje Multiespectral Grafito-Oro", material: "Ripstop NyCo con hilos antirradiación IR", proteccion: "Ignífugo + atenuación térmica 89%", pesoKg: 2.1, desc: "Dispersa la silueta corporal frente a cámaras térmicas FLIR de drones nocturnos." },
      { id: "mochila", nombre: "Módulo Comms & Jammer Dorsal", material: "Polímero balístico + batería LiFePO4", proteccion: "IP68 sumergible", pesoKg: 3.1, desc: "Enlace satelital cifrado y burbuja anti-dron personal de 180 metros." },
      { id: "cinturon", nombre: "Cinturón Modular + IFAK Trauma", material: "Nailon tubular grado aeronáutico", proteccion: "Carga 240 kg", pesoKg: 1.15, desc: "Cargadores rápidos, torniquete arterial y batería de respaldo para óptica." },
      { id: "botas", nombre: "Botas Balísticas + Soporte Tobillo", material: "Cuero hidrofugado + Kevlar plantar", proteccion: "Antiperforación / suela térmica", pesoKg: 1.3, desc: "Estabilizador mecánico pasivo para marchas largas con carga completa." },
    ],
  },
  {
    id: "nato-multicam",
    rango: 2,
    nombre: "Multicam Estepa / OTAN Estándar",
    faccion: "Alianzas Occidentales",
    era: "2015 · presente",
    estiloCamo: "multicam",
    colores: {
      primario: "#6c694c",
      secundario: "#4c5338",
      chaleco: "#5a533d",
      casco: "#534e3b",
      visor: "#38BDF8",
      piel: "#d8a77a",
      acento: "#A3B18A",
    },
    nivelNIJ: "NIJ IV (ESAPI)",
    pesoTotalKg: 18.6,
    sigiloIR: 64,
    costoUsd: "~6.800 USD",
    bonoBlindajeSim: 1.14,
    doctrina: "Patrón adaptable a bosques templados, estepas otoñales y zonas semiáridas — dominante en Europa Oriental y fuerzas de reacción rápida.",
    camuflaje: { urbano: 62, montana: 76, desierto: 78, costa: 55, llanura: 92, selva: 82, artico: 24 },
    capas: [
      { id: "casco", nombre: "Casco FAST High-Cut + PVS-31", material: "Aramida / UHMWPE", proteccion: "NIJ IIIA", pesoKg: 1.45, desc: "Permite auriculares tácticos activos con cancelación de detonación." },
      { id: "chaleco", nombre: "Portaplacas JPC + Placas ESAPI", material: "Alúmina / Polietileno", proteccion: "NIJ IV", pesoKg: 6.8, desc: "Distribución clásica de 3 cargadores frontales, radio y bolsa de hidratación." },
      { id: "uniforme", nombre: "Combat Shirt & Pantalón Ripstop", material: "50/50 Nylon-Algodón NIR", proteccion: "Antirrotura + rodilleras", pesoKg: 2.3, desc: "Torso transpirable bajo chaleco y mangas con patrón multiterreno." },
      { id: "mochila", nombre: "Mochila Asalto 30L + Antena VHF", material: "Cordura 1000D", proteccion: "Resistente a abrasión", pesoKg: 4.1, desc: "Soporte para 72 horas de autonomía táctica y raciones." },
      { id: "cinturon", nombre: "Battle Belt MOLLE", material: "Tejido compuesto rígido", proteccion: "Retención rápida", pesoKg: 2.1, desc: "Funda de pistola secundaria, bolsa de descarga y botiquín IFAK." },
      { id: "botas", nombre: "Botas Gore-Tex Todoterreno", material: "Nobuk + membrana impermeable", proteccion: "Impermeable / tracción barro", pesoKg: 1.85, desc: "Diseñadas para trincheras húmedas y terreno irregular." },
    ],
  },
  {
    id: "urbano-cqb",
    rango: 3,
    nombre: "Asalto Urbano CQB Nocturno",
    faccion: "Unidades Contraterrorismo / Asalto",
    era: "2020 · presente",
    estiloCamo: "urbano",
    colores: {
      primario: "#2a2e38",
      secundario: "#191c24",
      chaleco: "#14171f",
      casco: "#1c202a",
      visor: "#3DDC97",
      piel: "#c9956b",
      acento: "#3DDC97",
    },
    nivelNIJ: "NIJ IV + Collarín Balístico",
    pesoTotalKg: 21.4,
    sigiloIR: 72,
    costoUsd: "~11.200 USD",
    bonoBlindajeSim: 1.2,
    doctrina: "Optimizado para entrada en edificios, túneles y combate a menos de 50 metros bajo humo, escombros e iluminación nula.",
    camuflaje: { urbano: 95, montana: 48, desierto: 22, costa: 68, llanura: 40, selva: 34, artico: 18 },
    capas: [
      { id: "casco", nombre: "Casco Visor Cuádruple NVG GPNVG", material: "Aramida reforzada", proteccion: "NIJ IIIA + mandíbula", pesoKg: 1.9, desc: "Campo visual panorámico de 97° en oscuridad total." },
      { id: "chaleco", nombre: "Chaleco Pesado CQB + Hombros", material: "Cerámica SiC", proteccion: "NIJ IV completo", pesoKg: 8.4, desc: "Protección ampliada en cuello y laterales contra esquirlas en pasillos." },
      { id: "uniforme", nombre: "Overol Gris Táctico Ignífugo", material: "Nomex antiestático", proteccion: "Antillama flash", pesoKg: 2.4, desc: "Evita quemaduras por cargas de apertura y granadas aturdidoras." },
      { id: "mochila", nombre: "Panel Dorsal + Carga de Brecha", material: "Cordura 500D", proteccion: "Modular", pesoKg: 4.2, desc: "Transporta ariete compacto o cargas para puertas blindadas." },
      { id: "cinturon", nombre: "Arnés Rápido de Asalto", material: "Cinta balística", proteccion: "Anclaje rapel", pesoKg: 2.5, desc: "Granadas aturdidoras, cizalla y linterna IR." },
      { id: "botas", nombre: "Botas Suela Silenciosa Vibram", material: "Microfibra técnica", proteccion: "Antideslizante vidrio", pesoKg: 2.0, desc: "Pisa silenciosa sobre escombros, metal y escaleras." },
    ],
  },
  {
    id: "artico-alpino",
    rango: 4,
    nombre: "Alta Montaña & Ártico Alpino",
    faccion: "Cazadores de Montaña / Tropas Polares",
    era: "2022 · presente",
    estiloCamo: "artico",
    colores: {
      primario: "#e2e8f0",
      secundario: "#94a3b8",
      chaleco: "#64748b",
      casco: "#cbd5e1",
      visor: "#67E8F9",
      piel: "#e0b088",
      acento: "#67E8F9",
    },
    nivelNIJ: "NIJ III+ Ligero Térmico",
    pesoTotalKg: 17.8,
    sigiloIR: 81,
    costoUsd: "~8.900 USD",
    bonoBlindajeSim: 1.1,
    doctrina: "Capas transpirables con barrera térmica para combatir entre -25 °C y ventiscas a más de 4.000 metros sin pérdida de movilidad.",
    camuflaje: { urbano: 34, montana: 93, desierto: 18, costa: 42, llanura: 30, selva: 10, artico: 98 },
    capas: [
      { id: "casco", nombre: "Casco Blanco + Máscara Polar", material: "Compuesto anti-congelación", proteccion: "NIJ IIIA + térmico", pesoKg: 1.4, desc: "Gafas antiempañamiento de doble lente para ventisca." },
      { id: "chaleco", nombre: "Portaplacas Alpino Ligero", material: "Polietileno flotante", proteccion: "NIJ III+", pesoKg: 4.5, desc: "Menor peso para ascensiones en pendiente pronunciada." },
      { id: "uniforme", nombre: "Sistema 7 Capas Nieve Multicam", material: "Primaloft + PTFE", proteccion: "Térmico -35 °C + anti-IR", pesoKg: 3.9, desc: "Retiene el calor corporal bloqueando el rastro infrarrojo sobre la nieve." },
      { id: "mochila", nombre: "Mochila Alpina + Raquetas/Piolet", material: "Ripstop Dyneema", proteccion: "Nieve y hielo", pesoKg: 4.4, desc: "Estufa de altura, cuerda y baterías calefactadas." },
      { id: "cinturon", nombre: "Arnés Glaciar + Arva Rescate", material: "Nylon alpino", proteccion: "Caída en grieta", pesoKg: 1.5, desc: "Baliza de avalancha y mosquetones de hielo." },
      { id: "botas", nombre: "Botas Rígidas Cramponables", material: "Doble bota térmica", proteccion: "Congelación grado IV", pesoKg: 2.1, desc: "Compatible con esquís de travesía y crampones de acero." },
    ],
  },
  {
    id: "desierto-sahel",
    rango: 5,
    nombre: "Desierto Árido / Patrulla Sahel",
    faccion: "Fuerzas Móviles en Zonas Áridas",
    era: "2018 · presente",
    estiloCamo: "desierto",
    colores: {
      primario: "#c2a676",
      secundario: "#8f754d",
      chaleco: "#7d6442",
      casco: "#b89c6a",
      visor: "#F59E0B",
      piel: "#b97f52",
      acento: "#F59E0B",
    },
    nivelNIJ: "NIJ III+ Ventilado",
    pesoTotalKg: 15.6,
    sigiloIR: 58,
    costoUsd: "~5.400 USD",
    bonoBlindajeSim: 1.09,
    doctrina: "Máxima ventilación e hidratación para operaciones prolongadas a +45 °C entre dunas, wadis y polvo fino en suspensión.",
    camuflaje: { urbano: 55, montana: 68, desierto: 96, costa: 52, llanura: 64, selva: 18, artico: 10 },
    capas: [
      { id: "casco", nombre: "Casco Ventilado + Pañuelo Shemagh", material: "Polímero ligero", proteccion: "NIJ IIIA", pesoKg: 1.25, desc: "Filtra arena fina y evita golpes de calor solar." },
      { id: "chaleco", nombre: "Chest Rig + Placa Frontal Árida", material: "Malla ventilada + UHMWPE", proteccion: "NIJ III+", pesoKg: 4.3, desc: "Reduce estrés térmico manteniendo defensa balística frontal." },
      { id: "uniforme", nombre: "Uniforme Coyote / Arena Transpirable", material: "Algodón ligero UV+", proteccion: "Radiación solar UPF 50", pesoKg: 1.8, desc: "Secado rápido y camuflaje exacto sobre ocre y roca caliza." },
      { id: "mochila", nombre: "Mochila Hidratación 6L + Panel Solar", material: "Cordura 500D Coyote", proteccion: "Antipolvo IP65", pesoKg: 4.6, desc: "Agua tratada y recarga solar para radios tácticas." },
      { id: "cinturon", nombre: "Cinturón Ligero Recon", material: "Tejido árido", proteccion: "Modular", pesoKg: 1.8, desc: "Brújula óptica, bengalas de señal y filtro de agua." },
      { id: "botas", nombre: "Botas Altas Desierto Antiserpiente", material: "Gamuza perforada", proteccion: "Calor de suelo +70 °C", pesoKg: 1.85, desc: "Aislante térmico en suela contra arena ardiente." },
    ],
  },
  {
    id: "naval-litoral",
    rango: 6,
    nombre: "Infantería Naval / Asalto Litoral",
    faccion: "Comandos Anfibios y Abordaje",
    era: "2021 · presente",
    estiloCamo: "naval",
    colores: {
      primario: "#243b55",
      secundario: "#162436",
      chaleco: "#1d2d44",
      casco: "#2b4162",
      visor: "#38BDF8",
      piel: "#d8a77a",
      acento: "#38BDF8",
    },
    nivelNIJ: "NIJ III+ Flotante",
    pesoTotalKg: 16.4,
    sigiloIR: 69,
    costoUsd: "~9.500 USD",
    bonoBlindajeSim: 1.15,
    doctrina: "Diseñado para abordaje de buques, desembarcos en lanchas rápidas y defensa de estrechos marítimos con flotabilidad positiva.",
    camuflaje: { urbano: 72, montana: 36, desierto: 20, costa: 96, llanura: 38, selva: 42, artico: 45 },
    capas: [
      { id: "casco", nombre: "Casco Marítimo Drenante", material: "Carbono hidrofóbico", proteccion: "NIJ IIIA + impacto borda", pesoKg: 1.2, desc: "Canales de drenaje rápido tras inmersión." },
      { id: "chaleco", nombre: "Chaleco Balístico Flotante", material: "Placas flotables + cámara CO2", proteccion: "NIJ III+", pesoKg: 5.1, desc: "Evita hundimiento si el operador cae al mar con equipo completo." },
      { id: "uniforme", nombre: "Traje Neopreno / Ripstop Marino", material: "Neopreno sellado + Cordura", proteccion: "Hipotermia agua fría", pesoKg: 2.6, desc: "Resistente a salitre y aceites navales." },
      { id: "mochila", nombre: "Bolsa Estanca + Radio VHF Marítima", material: "TPU termosellado", proteccion: "Sumergible 20 m", pesoKg: 3.4, desc: "Mantiene munición y electrónica secas durante el nado." },
      { id: "cinturon", nombre: "Arnés Abordaje + Gancho Rápido", material: "Acero inoxidable marino", proteccion: "Corrosión salina", pesoKg: 2.2, desc: "Enganche para escalas de abordaje y rescate desde helicóptero." },
      { id: "botas", nombre: "Botas Anfibias Drenaje Lateral", material: "Malla marina + goma cubierta", proteccion: "Cubierta mojada", pesoKg: 1.9, desc: "Expulsa el agua en dos pasos al pisar playa o cubierta." },
    ],
  },
  {
    id: "selva-tropico",
    rango: 7,
    nombre: "Infantería Selva / Trópico Denso",
    faccion: "Unidades de Reconocimiento en Jungla",
    era: "2020 · presente",
    estiloCamo: "selva",
    colores: {
      primario: "#2d4c2b",
      secundario: "#1b331b",
      chaleco: "#364c2d",
      casco: "#243b22",
      visor: "#4ADE80",
      piel: "#b97f52",
      acento: "#4ADE80",
    },
    nivelNIJ: "NIJ IIIA Ultraligero",
    pesoTotalKg: 13.8,
    sigiloIR: 76,
    costoUsd: "~4.900 USD",
    bonoBlindajeSim: 1.07,
    doctrina: "Prioriza agilidad, drenaje de humedad 95% y camuflaje vegetal para patrullas invisibles bajo dosel selvático.",
    camuflaje: { urbano: 34, montana: 62, desierto: 14, costa: 48, llanura: 76, selva: 98, artico: 8 },
    capas: [
      { id: "casco", nombre: "Sombrero Boonie / Casco Ligero Red", material: "Malla vegetal + aramida", proteccion: "Ruptura de silueta", pesoKg: 0.9, desc: "Disimula el contorno redondo de la cabeza entre follaje." },
      { id: "chaleco", nombre: "Chest Rig Selva Transpirable", material: "Cordura 330D drenante", proteccion: "NIJ IIIA frontal", pesoKg: 3.6, desc: "Deja libre la espalda para evitar retención de sudor." },
      { id: "uniforme", nombre: "Uniforme Tropical Tiger-Stripe", material: "Popelina secado en 15 min", proteccion: "Antipicado insectos", pesoKg: 1.7, desc: "Tratamiento repelente y patrón vertical que imita luces de copa." },
      { id: "mochila", nombre: "Mochila Larga Patrulla + Hamaca", material: "Nylon siliconado", proteccion: "Lluvia monzónica", pesoKg: 4.1, desc: "Incluye machete, pastillas potabilizadoras y poncho térmico." },
      { id: "cinturon", nombre: "Cinturón Cartucheras Impermeables", material: "Polímero drenante", proteccion: "Humedad extrema", pesoKg: 1.7, desc: "Protege pólvora y baterías de hongos tropicales." },
      { id: "botas", nombre: "Botas Jungla Clásicas Drenantes", material: "Lona + suela Panamá anti-barro", proteccion: "Estacas y barro profundo", pesoKg: 1.8, desc: "No acumula barro denso en la suela." },
    ],
  },
  {
    id: "ew-nrbq",
    rango: 8,
    nombre: "Operador Guerra Electrónica & NRBQ",
    faccion: "Unidades Técnicas y Defensa Crítica",
    era: "2024 · presente",
    estiloCamo: "sigilo",
    colores: {
      primario: "#3f3b2e",
      secundario: "#24221b",
      chaleco: "#2f2f38",
      casco: "#22252e",
      visor: "#A855F7",
      piel: "#d8a77a",
      acento: "#A855F7",
    },
    nivelNIJ: "NIJ III+ Hermético NRBQ",
    pesoTotalKg: 19.2,
    sigiloIR: 85,
    costoUsd: "~14.600 USD",
    bonoBlindajeSim: 1.18,
    doctrina: "Opera en entornos contaminados, centrales energéticas o zonas de intensa interferencia electromagnética contra drones y radar.",
    camuflaje: { urbano: 80, montana: 60, desierto: 55, costa: 62, llanura: 64, selva: 50, artico: 42 },
    capas: [
      { id: "casco", nombre: "Máscara Panorámica + Casco Sellado", material: "Butilo + filtros P3/CBRN", proteccion: "Agentes químicos/radiológicos", pesoKg: 2.1, desc: "Presión positiva automática con lector de radiación." },
      { id: "chaleco", nombre: "Chaleco Anti-Metralla + Dosímetro", material: "Carburo + escudo EMI", proteccion: "NIJ III+", pesoKg: 5.8, desc: "Protege equipos electrónicos contra pulsos e interferencias." },
      { id: "uniforme", nombre: "Traje Permeable Carbón Activado", material: "Membrana carbón esférico", proteccion: "Barrera NRBQ 24h", pesoKg: 2.9, desc: "Absorbe vapores tóxicos sin impedir transpiración básica." },
      { id: "mochila", nombre: "Estación Portátil EW / Antidrones", material: "Antenas direccionales UHF/SHF", proteccion: "Blindaje RF", pesoKg: 5.2, desc: "Detecta enlaces de drones FPV a 2,5 km y satura su control." },
      { id: "cinturon", nombre: "Kit Descontaminación + Autoinyector", material: "Sellado estanco", proteccion: "Emergencia química", pesoKg: 1.4, desc: "Solución neutralizante y medidor de gases." },
      { id: "botas", nombre: "Sobrebotas Butilo Químicas", material: "Elastómero sellado", proteccion: "Ácidos / isótopos", pesoKg: 1.8, desc: "Cierre estanco sobre pantalón sellado." },
    ],
  },
];

// ── ESCUADRONES 3D INTERACTIVOS (VANGUARD ÉLITE SIEMPRE #1) ──────────────────
export type TipoUnidad3D = "soldier" | "tank" | "ifv" | "artillery" | "sam" | "drone" | "radar" | "ship" | "jet";

export interface MiembroEscuadron3D {
  id: string;
  rol: string;
  tipo: TipoUnidad3D;
  arma: string;
  offset: [number, number]; // coordenadas en plataforma 3D (-4..4)
  detalle: string;
}

export interface Escuadron3D {
  id: string;
  rango: number;
  nombre: string;
  simboloOTAN: "VANGUARD" | "INF" | "ARMOR" | "SOF" | "UAV" | "ART" | "SAM" | "NAVAL";
  efectivos: string;
  rolTactico: string;
  alcanceKm: number;
  costoSim: number;
  stats: {
    fuego: number;
    blindaje: number;
    movilidad: number;
    sigilo: number;
    ew: number;
  };
  doctrina: string;
  fortalezas: string[];
  debilidades: string[];
  miembros: MiembroEscuadron3D[];
  esVanguard?: boolean;
}

export const ESCUADRONES_3D: Escuadron3D[] = [
  {
    id: "escuadron-vanguard",
    rango: 1,
    nombre: "ESCUADRÓN VANGUARD ÉLITE (#1 Fuerza Conjunta)",
    simboloOTAN: "VANGUARD",
    efectivos: "1 Vehículo Mando + 4 Operadores + 2 Drones + Radar",
    rolTactico: "Mando supremo multidominio — conquista, reconocimiento y apoyo de precisión",
    alcanceKm: 28,
    costoSim: 100,
    stats: { fuego: 96, blindaje: 90, movilidad: 92, sigilo: 91, ew: 98 },
    doctrina: "Unidad insignia #1 de VANGUARD: integra blindaje rápido, cobertura antidrón activa, enlace táctico directo con satélites e infantería equipada con Apex-2100.",
    fortalezas: ["Superioridad EW y antidrón", "Fuego combinado contra blindados e infantería", "Bonificación de moral en todo el sector"],
    debilidades: ["Alto coste logístico", "Objetivo prioritario de artillería pesada"],
    esVanguard: true,
    miembros: [
      { id: "vg-cmd", rol: "Vehículo Mando Vanguard", tipo: "ifv", arma: "Cañón 35mm + Torreta Antidrón", offset: [0, 0.2], detalle: "Coordina el enlace 2D/3D de todo el escuadrón con sensores térmicos 360°." },
      { id: "vg-ldr", rol: "Comandante de Escuadrón", tipo: "soldier", arma: "Plataforma Vanguard X-1", offset: [0, -1.7], detalle: "Dirige maniobras y marca objetivos para ataque quirúrgico." },
      { id: "vg-op1", rol: "Asalto / Breacher", tipo: "soldier", arma: "X-1 + Cargas C4", offset: [-1.7, -1.2], detalle: "Abre paso urbano y asegura cobertura lateral." },
      { id: "vg-op2", rol: "Tirador Antitanque", tipo: "soldier", arma: "Lanzador ATGM Guiado", offset: [1.7, -1.2], detalle: "Neutraliza blindados a 4 km desde cresta elevada." },
      { id: "vg-op3", rol: "Operador Guerra Electrónica", tipo: "soldier", arma: "Rifle + Jammer EW", offset: [-1.9, 1.3], detalle: "Bloquea drones kamikaze enemigos en un radio táctico." },
      { id: "vg-dr1", rol: "Dron Recon / FPV #1", tipo: "drone", arma: "Óptica FLIR + Carga Táctica", offset: [-1.2, -2.5], detalle: "Explora 5 km por delante antes de cada avance." },
      { id: "vg-dr2", rol: "Dron Escolta #2", tipo: "drone", arma: "Interceptor Aéreo", offset: [1.2, -2.5], detalle: "Caza drones enemigos en vuelo bajo." },
      { id: "vg-rad", rol: "Nódulo Radar Táctico", tipo: "radar", arma: "Antena AESA móvil", offset: [2.0, 1.4], detalle: "Detecta trayectorias de mortero y cohetes en segundos." },
    ],
  },
  {
    id: "inf-mecanizada",
    rango: 2,
    nombre: "Escuadra de Infantería Mecanizada",
    simboloOTAN: "INF",
    efectivos: "1 IFV + 6 Fusileros",
    rolTactico: "Toma y mantenimiento de terreno, asalto de trincheras y cobertura urbana",
    alcanceKm: 4.5,
    costoSim: 65,
    stats: { fuego: 74, blindaje: 68, movilidad: 80, sigilo: 64, ew: 52 },
    doctrina: "Columna vertebral de todo ejército moderno: el vehículo IFV transporta al pelotón bajo blindaje y ofrece fuego de cañón automático de 30 mm al desembarcar.",
    fortalezas: ["Versátil en ciudad, bosque y trinchera", "Excelente relación coste-eficacia", "Mantiene posiciones tomadas"],
    debilidades: ["Vulnerable en campo abierto a artillería y FPV sin cobertura"],
    miembros: [
      { id: "im-ifv", rol: "Vehículo Combate IFV", tipo: "ifv", arma: "Cañón 30mm + 2 ATGM", offset: [0, 0.8], detalle: "Blindado anfibio de transporte con estabilizador de tiro." },
      { id: "im-s1", rol: "Jefe de Escuadra", tipo: "soldier", arma: "Fusil 5,56 + Radio", offset: [0, -1.6], detalle: "Asigna sectores de tiro en cuña." },
      { id: "im-s2", rol: "Ametrallador Ligero", tipo: "soldier", arma: "LMG 5,56 / 7,62", offset: [-1.8, -1.2], detalle: "Fuego de supresión continuo contra posiciones enemigas." },
      { id: "im-s3", rol: "Granadero RPG / NLAW", tipo: "soldier", arma: "Lanzacohetes portatil", offset: [1.8, -1.2], detalle: "Defensa anticarro inmediata hasta 600 m." },
      { id: "im-s4", rol: "Fusilero Explorador", tipo: "soldier", arma: "Carabina + Óptica 4×", offset: [-1.1, -2.3], detalle: "Vanguardia de reconocimiento en rutas." },
      { id: "im-s5", rol: "Médico de Combate", tipo: "soldier", arma: "Carabina + Kit Trauma", offset: [1.1, -2.3], detalle: "Estabiliza heridos y coordina evacuación." },
    ],
  },
  {
    id: "peloton-blindado",
    rango: 3,
    nombre: "Pelotón Blindado Pesado (MBT)",
    simboloOTAN: "ARMOR",
    efectivos: "3 Carros MBT + 1 Vehículo Recon",
    rolTactico: "Ruptura de líneas fortificadas y duelo directo de blindaje",
    alcanceKm: 5.5,
    costoSim: 95,
    stats: { fuego: 93, blindaje: 96, movilidad: 72, sigilo: 30, ew: 58 },
    doctrina: "Puño de acero en cuña: tres tanques de batalla principal con blindaje reactivo ERA, cañón de ánima lisa de 120/125 mm y protección antidrón superior.",
    fortalezas: ["Potencia directa devastadora", "Resiste fuego ligero y metralla", "Rompe defensas en llanura"],
    debilidades: ["Lento en bosque/ciudad cerrada", "Vulnerable a minas y drones FPV por techo"],
    miembros: [
      { id: "mb-1", rol: "Tanque Líder #1", tipo: "tank", arma: "Cañón 120mm + Jaula Antidrón", offset: [0, -1.5], detalle: "Encabeza la cuña con arado antiminas frontal." },
      { id: "mb-2", rol: "Tanque Flanco Izq #2", tipo: "tank", arma: "Cañón 120mm + ERA", offset: [-2.2, 0.9], detalle: "Cubre el flanco izquierdo contra emboscadas." },
      { id: "mb-3", rol: "Tanque Flanco Der #3", tipo: "tank", arma: "Cañón 120mm + ERA", offset: [2.2, 0.9], detalle: "Cubre el flanco derecho y dispara humo térmico." },
      { id: "mb-rec", rol: "Blindado Reconocimiento", tipo: "ifv", arma: "Sensor Térmico + 25mm", offset: [0, 2.3], detalle: "Detecta campos minados y posiciones ATGM." },
    ],
  },
  {
    id: "celula-fpv",
    rango: 4,
    nombre: "Célula de Drones FPV & Guerra Electrónica",
    simboloOTAN: "UAV",
    efectivos: "3 Pilotos FPV + 1 Operador EW + 4 Drones",
    rolTactico: "Caza de blindados, vigilancia aérea persistente y ataque de precisión barato",
    alcanceKm: 18,
    costoSim: 55,
    stats: { fuego: 82, blindaje: 25, movilidad: 90, sigilo: 88, ew: 94 },
    doctrina: "La revolución táctica contemporánea: opera oculta en sótanos o trincheras lanzando enjambres de cuadricópteros de bajo coste con fibra óptica inmune a interferencias.",
    fortalezas: ["Destruye tanques 1000× más caros", "Supera obstáculos y cobertura", "Altísimo sigilo"],
    debilidades: ["Nulo blindaje si son localizados", "Dependiente de baterías y clima extremo"],
    miembros: [
      { id: "fp-p1", rol: "Piloto Principal FPV", tipo: "soldier", arma: "Gafas VR + Estación Fibra", offset: [-1.4, 1.3], detalle: "Vuela a 140 km/h directo al compartimento motor del tanque." },
      { id: "fp-p2", rol: "Observador / Mavic Recon", tipo: "soldier", arma: "Control Remoto Dual", offset: [0, 1.5], detalle: "Corrige el tiro en directo desde 400 m de altitud." },
      { id: "fp-ew", rol: "Analista Espectro RF", tipo: "radar", arma: "Analizador Banda 900MHz-5.8GHz", offset: [1.5, 1.3], detalle: "Localiza frecuencias enemigas y abre pasillos seguros." },
      { id: "fp-d1", rol: "Dron Kamikaze #1", tipo: "drone", arma: "Ojiva PG-7 Hueca", offset: [-1.8, -1.3], detalle: "Vector de ataque anticarro." },
      { id: "fp-d2", rol: "Dron Kamikaze #2", tipo: "drone", arma: "Carga Fragmentación", offset: [0, -1.9], detalle: "Ataque antipersonal en trincheras." },
      { id: "fp-d3", rol: "Dron Relé / Repetidor", tipo: "drone", arma: "Antena Repetidora", offset: [1.8, -1.3], detalle: "Duplica el alcance detrás de colinas." },
    ],
  },
  {
    id: "equipo-sof",
    rango: 5,
    nombre: "Equipo de Operaciones Especiales (SOF)",
    simboloOTAN: "SOF",
    efectivos: "4 Operadores de Élite + 1 Micro-Dron",
    rolTactico: "Infiltración tras líneas enemigas, sabotaje y designación láser de objetivos",
    alcanceKm: 35,
    costoSim: 75,
    stats: { fuego: 80, blindaje: 52, movilidad: 95, sigilo: 97, ew: 80 },
    doctrina: "Pequeña célula invisible de acción directa: opera de noche con supresores y designadores láser para dirigir misiles y cazas desde la retaguardia.",
    fortalezas: ["Casi indetectable en bosque/montaña/noche", "Multiplica precisión de artillería", "Velocidad extrema"],
    debilidades: ["Sin capacidad para frenar asaltos blindados masivos a campo abierto"],
    miembros: [
      { id: "sf-1", rol: "Líder / Designador JTAC", tipo: "soldier", arma: "Carabina Silenciada + Láser", offset: [0, -1.6], detalle: "Guía bombas de aviación con precisión de 1 metro." },
      { id: "sf-2", rol: "Francotirador / Observador", tipo: "soldier", arma: "Rifle .338 Lapua", offset: [-1.6, 0.2], detalle: "Cobertura a 1.500 metros." },
      { id: "sf-3", rol: "Especialista Demolición", tipo: "soldier", arma: "Carabina + Cargas", offset: [1.6, 0.2], detalle: "Sabotaje de puentes, radares y depósitos." },
      { id: "sf-4", rol: "Médico / Comms Satelital", tipo: "soldier", arma: "Subfusil PDW", offset: [0, 1.5], detalle: "Enlace satelital de baja probabilidad de intercepción." },
      { id: "sf-d", rol: "Nano-Dron Silencioso", tipo: "drone", arma: "Cámara Térmica", offset: [0, -2.4], detalle: "Reconocimiento silencioso dentro de edificios." },
    ],
  },
  {
    id: "bateria-artilleria",
    rango: 6,
    nombre: "Batería Artillería & Cohetes MLRS",
    simboloOTAN: "ART",
    efectivos: "2 Lanzadores MLRS + 1 Radar Contrabatería",
    rolTactico: "Fuego de largo alcance, destrucción de depósitos y apoyo en todo el mapa",
    alcanceKm: 85,
    costoSim: 90,
    stats: { fuego: 98, blindaje: 38, movilidad: 76, sigilo: 44, ew: 60 },
    doctrina: "Disparar y moverse en menos de 90 segundos ('shoot-and-scoot'): descarga salvas guiadas por GPS a 70+ km antes de que el radar enemigo calcule su origen.",
    fortalezas: ["Máximo poder destructivo de área", "Golpea sin exponerse al frente", "Decisivo en desgaste"],
    debilidades: ["Desprotegido en combate cercano", "Vulnerable a contrabatería y drones si permanece estático"],
    miembros: [
      { id: "ar-1", rol: "Lanzador MLRS Alfa", tipo: "artillery", arma: "6× Cohetes Guiados 227mm", offset: [-1.5, -0.3], detalle: "Precisión circular de <5 metros hasta 85 km." },
      { id: "ar-2", rol: "Lanzador MLRS Bravo", tipo: "artillery", arma: "6× Cohetes Guiados 227mm", offset: [1.5, 0.3], detalle: "Dispara en salva sincronizada." },
      { id: "ar-rad", rol: "Radar Contrabatería", tipo: "radar", arma: "Antena Seguimiento Balístico", offset: [0, 1.8], detalle: "Calcula origen de fuego hostil en pleno vuelo." },
    ],
  },
  {
    id: "defensa-antiaerea",
    rango: 7,
    nombre: "Escuadra Defensa Antiaérea (SAM + Radar)",
    simboloOTAN: "SAM",
    efectivos: "2 Lanzadores SAM + 1 Radar Sectorial",
    rolTactico: "Escudo aéreo contra cazas, helicópteros, drones pesados y misiles de crucero",
    alcanceKm: 120,
    costoSim: 92,
    stats: { fuego: 88, blindaje: 42, movilidad: 62, sigilo: 35, ew: 90 },
    doctrina: "Cúpula de negación aérea: combina radar de búsqueda 360° con lanzadores verticales capaces de interceptar múltiples amenazas aéreas simultáneas.",
    fortalezas: ["Anula aviación y misiles de crucero enemigos", "Protege ciudades y baterías"],
    debilidades: ["Ineficaz contra infantería", "Objetivo prioritario de misiles antirradiación HARM"],
    miembros: [
      { id: "sa-rad", rol: "Radar Director de Tiro", tipo: "radar", arma: "Matriz Activa 360°", offset: [0, -0.4], detalle: "Rastrea hasta 100 blancos aéreos simultáneos." },
      { id: "sa-l1", rol: "Lanzador Cuádruple #1", tipo: "sam", arma: "4× Misiles Interceptores Mach 4", offset: [-1.8, 0.8], detalle: "Lanzamiento vertical frío." },
      { id: "sa-l2", rol: "Lanzador Cuádruple #2", tipo: "sam", arma: "4× Misiles Interceptores Mach 4", offset: [1.8, 0.8], detalle: "Recarga y cobertura continua." },
    ],
  },
  {
    id: "destacamento-naval",
    rango: 8,
    nombre: "Destacamento Naval Litoral / Misiles",
    simboloOTAN: "NAVAL",
    efectivos: "1 Corbeta Misilera + 1 Dron Marítimo + 1 Caza Naval",
    rolTactico: "Control de estrechos marítimos, bloqueo naval y lanzamiento de misiles de crucero",
    alcanceKm: 250,
    costoSim: 98,
    stats: { fuego: 92, blindaje: 78, movilidad: 84, sigilo: 65, ew: 85 },
    doctrina: "Proyección de poder desde costa o estrecho: combina misiles antibuque de largo alcance con cobertura aérea embarcada y escolta antiaérea.",
    fortalezas: ["Control total de mares y estrechos", "Alcance estratégico enorme"],
    debilidades: ["Restringido a zonas con agua/litoral", "Vulnerable a saturación combinada de USV y misiles costeros"],
    miembros: [
      { id: "nv-sh", rol: "Corbeta Furtiva", tipo: "ship", arma: "VLS 16 celdas + Cañón 57mm", offset: [0, 0.3], detalle: "Casco inclinado de baja firma radar." },
      { id: "nv-jet", rol: "Caza Cobertura Naval", tipo: "jet", arma: "Misiles Aire-Aire / Antibuque", offset: [-1.7, -1.6], detalle: "Patrulla aérea sobre el estrecho." },
      { id: "nv-dr", rol: "Dron Superficie / Aéreo", tipo: "drone", arma: "Radar Marítimo", offset: [1.8, -1.2], detalle: "Detecta embarcaciones rápidas y minas." },
    ],
  },
];

// ── ARMAS 3D INTERACTIVAS CON DESPIECE (VANGUARD X-1 SIEMPRE #1) ─────────────
export type TipoArma3D =
  | "vanguard_rifle"
  | "rifle_nato"
  | "rifle_ak"
  | "sniper"
  | "atgm"
  | "fpv"
  | "mlrs"
  | "mbt"
  | "sam"
  | "cruise";

export interface PiezaArma3D {
  id: string;
  nombre: string;
  desc: string;
  offset: [number, number, number]; // vector de explosión 3D
  color: string;
}

export interface Arma3D {
  id: string;
  rango: number;
  nombre: string;
  categoria: string;
  origen: string;
  modelo3D: TipoArma3D;
  resumen: string;
  impacto: string;
  specs: {
    calibre: string;
    velocidad: string;
    alcance: string;
    cadencia: string;
    penetracion: string;
    guiado: string;
    peso: string;
    coste: string;
  };
  simStats: {
    dano: number;
    antiBlindaje: number;
    antiAereo: number;
    alcanceRelativo: number;
  };
  piezas: PiezaArma3D[];
  esVanguard?: boolean;
}

export const ARMAS_3D: Arma3D[] = [
  {
    id: "vanguard-x1",
    rango: 1,
    nombre: "PLATAFORMA MODULAR VANGUARD X-1 (#1)",
    categoria: "Sistema Modular Multidominio",
    origen: "VANGUARD · Doctrina #1",
    modelo3D: "vanguard_rifle",
    resumen: "Fusil modular inteligente con óptica térmica integrada, supresor de firma cero y munición programable 6,8 mm — arma estándar de la fuerza #1.",
    impacto: "Integra telemetría balística automática que corrige viento, distancia y caída en el visor del operador Vanguard Apex-2100.",
    esVanguard: true,
    specs: {
      calibre: "6,8 × 51 mm Compuesto",
      velocidad: "960 m/s",
      alcance: "850 m efectivo",
      cadencia: "720 dpm / ráfaga inteligente",
      penetracion: "Perfora chalecos NIJ IV a 400 m",
      guiado: "Óptica balística láser + enlace AR",
      peso: "3,6 kg",
      coste: "~6.200 USD",
    },
    simStats: { dano: 88, antiBlindaje: 64, antiAereo: 45, alcanceRelativo: 76 },
    piezas: [
      { id: "canon", nombre: "Cañón Flotante + Supresor", desc: "Acero tratado al nitruro con supresor de flujo continuo que elimina destello nocturno.", offset: [1.5, 0.15, 0], color: "#FFC94D" },
      { id: "receptor", nombre: "Cajón Monolítico Grafito", desc: "Aloja cerrojo rotativo reforzado para alta presión de 6,8 mm y electrónica de disparo.", offset: [0, 0.35, 0], color: "#e2e8f0" },
      { id: "optica", nombre: "Óptica Fusión Térmica-Láser", desc: "Calcula distancia exacta en 0,1 s y transmite el punto de impacto al casco Apex.", offset: [0, 1.05, 0], color: "#38BDF8" },
      { id: "cargador", nombre: "Cargador Polímero 25 Cartuchos", desc: "Ventana de conteo electrónica integrada con aviso al visor.", offset: [0, -1.0, 0], color: "#f97316" },
      { id: "culata", nombre: "Culata Plegable Amortiguadora", desc: "Reduce el retroceso sentido en un 42% mediante pistón hidráulico.", offset: [-1.4, 0, 0], color: "#94a3b8" },
    ],
  },
  {
    id: "m4-otan",
    rango: 2,
    nombre: "Carabina Modular 5,56 OTAN (M4 / HK416)",
    categoria: "Fusil de Asalto Estándar",
    origen: "EE. UU. / OTAN",
    modelo3D: "rifle_nato",
    resumen: "Carabina compacta de riel Picatinny universal: la referencia occidental para infantería y operaciones especiales desde 1994.",
    impacto: "Estandarizó la modularidad militar: cualquier óptica, designador IR o lanzagranadas encaja en segundos.",
    specs: {
      calibre: "5,56 × 45 mm OTAN",
      velocidad: "910 m/s",
      alcance: "500 m efectivo",
      cadencia: "750-900 dpm",
      penetracion: "Acero 3 mm a 500 m (M855A1)",
      guiado: "Mira punto rojo / ACOG",
      peso: "3,4 kg",
      coste: "~1.400 USD",
    },
    simStats: { dano: 68, antiBlindaje: 30, antiAereo: 25, alcanceRelativo: 55 },
    piezas: [
      { id: "canon", nombre: "Cañón 14,5\" + Bocacha", desc: "Equilibrio entre precisión media y maniobra dentro de edificios.", offset: [1.4, 0.1, 0], color: "#94a3b8" },
      { id: "receptor", nombre: "Upper & Lower Aluminio", desc: "Arquitectura dividida de mantenimiento rápido con dos pasadores.", offset: [0, 0.3, 0], color: "#64748b" },
      { id: "optica", nombre: "Mira Holográfica + Láser IR", desc: "Apuntado instintivo con ambos ojos abiertos.", offset: [0, 0.95, 0], color: "#38BDF8" },
      { id: "cargador", nombre: "Cargador STANAG 30 Balas", desc: "Estándar compartido entre decenas de países aliados.", offset: [0, -0.95, 0], color: "#cbd5e1" },
      { id: "culata", nombre: "Culata Telescópica 6 Posiciones", desc: "Se acorta al llevar chaleco balístico grueso.", offset: [-1.3, 0, 0], color: "#475569" },
    ],
  },
  {
    id: "ak-kalashnikov",
    rango: 3,
    nombre: "Fusil Asalto Kalashnikov (AK-47 / AK-12)",
    categoria: "Fusil de Asalto Robusto",
    origen: "URSS / Rusia",
    modelo3D: "rifle_ak",
    resumen: "El fusil más extendido del planeta: pistón de carrera larga con tolerancias amplias que dispara cubierto de barro, arena o hielo.",
    impacto: "Más de 80 millones de unidades fabricadas; presente en prácticamente todos los frentes regulares e irregulares del mundo.",
    specs: {
      calibre: "7,62 × 39 mm / 5,45 × 39 mm",
      velocidad: "715-880 m/s",
      alcance: "350-450 m efectivo",
      cadencia: "600-650 dpm",
      penetracion: "Alta perforación de madera y ladrillo",
      guiado: "Alza mecánica / riel superior AK-12",
      peso: "3,8-4,3 kg",
      coste: "~600-1.100 USD",
    },
    simStats: { dano: 72, antiBlindaje: 35, antiAereo: 22, alcanceRelativo: 50 },
    piezas: [
      { id: "canon", nombre: "Cañón Cromado + Pistón de Gas", desc: "El bloque de gases sobre el cañón impulsa el cerrojo con fuerza sobrada para vencer suciedad.", offset: [1.45, 0.15, 0], color: "#cbd5e1" },
      { id: "receptor", nombre: "Receptor de Acero Estampado", desc: "Chasis indestructible con palanca selectora lateral sobredimensionada.", offset: [0, 0.3, 0], color: "#475569" },
      { id: "optica", nombre: "Guardamanos + Tapa Superior", desc: "Protege del calor extremo tras fuego sostenido.", offset: [0.35, 0.85, 0], color: "#b45309" },
      { id: "cargador", nombre: "Cargador Curvo 30 Balas", desc: "Curvatura icónica diseñada para alimentar cartuchos cónicos sin atascos.", offset: [0.1, -0.95, 0], color: "#f97316" },
      { id: "culata", nombre: "Culata Madera / Polímero Fijo", desc: "Equilibrio robusto para combate cuerpo a cuerpo o tiro automático.", offset: [-1.35, -0.1, 0], color: "#92400e" },
    ],
  },
  {
    id: "sniper-50",
    rango: 4,
    nombre: "Rifle Antimaterial .50 BMG",
    categoria: "Precisión Larga Distancia",
    origen: "EE. UU. / Internacional",
    modelo3D: "sniper",
    resumen: "Rifle pesado semiautomático o de cerrojo capaz de perforar bloques motor de vehículos blindados ligeros, radares y búnkeres a más de 1,8 km.",
    impacto: "Obliga a las dotaciones enemigas a parapetarse y protege puestos de control a distancias fuera del alcance de fusiles comunes.",
    specs: {
      calibre: "12,7 × 99 mm (.50 BMG)",
      velocidad: "853 m/s",
      alcance: "1.800 m efectivo",
      cadencia: "Tiro de precisión",
      penetracion: "22 mm acero RHA a 500 m",
      guiado: "Telescopio 5-25× balístico",
      peso: "14,0 kg",
      coste: "~12.000 USD",
    },
    simStats: { dano: 90, antiBlindaje: 70, antiAereo: 40, alcanceRelativo: 92 },
    piezas: [
      { id: "canon", nombre: "Cañón Pesado + Freno de Boca", desc: "Freno angular masivo que desvía gases laterales para absorber la mitad del retroceso.", offset: [1.7, 0.1, 0], color: "#94a3b8" },
      { id: "receptor", nombre: "Receptor Largo + Bípode", desc: "Chasis metálico de alta rigidez anclado al terreno.", offset: [0, 0.25, 0], color: "#64748b" },
      { id: "optica", nombre: "Mira Telescópica 25×", desc: "Corrección milimétrica de paralaje y caída balística.", offset: [0, 1.0, 0], color: "#38BDF8" },
      { id: "cargador", nombre: "Cargador 10 Cartuchos 12,7mm", desc: "Aloja cartuchos de más de 13 cm de longitud.", offset: [0.1, -0.9, 0], color: "#eab308" },
      { id: "culata", nombre: "Culata Monópode Ajustable", desc: "Estabiliza el rifle sobre posiciones fijas prolongadas.", offset: [-1.4, 0, 0], color: "#475569" },
    ],
  },
  {
    id: "atgm-javelin",
    rango: 5,
    nombre: "Sistema Antitanque Guiado (Javelin / ATGM)",
    categoria: "Misil Anticarro Portátil",
    origen: "EE. UU. / Alianza OTAN",
    modelo3D: "atgm",
    resumen: "Misil 'dispara y olvida' con cámara infrarroja propia que sube en arco parabólico para caer verticalmente sobre el techo del tanque, donde el blindaje es más fino.",
    impacto: "Permitió a pequeños equipos de infantería destruir columnas blindadas enteras antes de abandonar la cobertura.",
    specs: {
      calibre: "127 mm carga hueca en tándem",
      velocidad: "Subsónico ~290 m/s",
      alcance: "2.500 - 4.000 m",
      cadencia: "1 disparo + recarga tubo",
      penetracion: ">750 mm RHA tras ERA",
      guiado: "Infrarrojo autónomo (IIR)",
      peso: "22,3 kg completo",
      coste: "~178.000 USD por misil",
    },
    simStats: { dano: 95, antiBlindaje: 98, antiAereo: 35, alcanceRelativo: 80 },
    piezas: [
      { id: "canon", nombre: "Tubo Lanzador Desechable", desc: "Contenedor sellado que expulsa el misil con carga suave antes de encender el motor.", offset: [0, 0.65, 0], color: "#65a30d" },
      { id: "receptor", nombre: "Unidad CLU de Tiro Térmico", desc: "Módulo reutilizable: detecta tanques ocultos a 4 km incluso de noche.", offset: [-0.9, 0.25, 0.65], color: "#38BDF8" },
      { id: "optica", nombre: "Cabeza Buscadora Infrarroja", desc: "Fija la firma térmica del objetivo tras el disparo sin necesidad de apuntar.", offset: [1.55, 0.25, 0], color: "#FFC94D" },
      { id: "cargador", nombre: "Ojiva Tándem Antiblindaje", desc: "Primera carga detona el ERA; carga principal perfora acero compuesto.", offset: [0.85, -0.5, 0], color: "#ef4444" },
      { id: "culata", nombre: "Cohete Principal + Aletas", desc: "Aletas desplegables que dirigen la picada vertical sobre la torreta.", offset: [-1.35, -0.45, 0], color: "#cbd5e1" },
    ],
  },
  {
    id: "fpv-drone",
    rango: 6,
    nombre: "Dron Kamikaze FPV + Carga PG-7",
    categoria: "Munición Merodeadora Artesanal",
    origen: "Global / Guerra Moderna",
    modelo3D: "fpv",
    resumen: "Cuadricóptero de carreras de carbono armado con ojiva anticarro RPG, pilotado en primera persona a 150 km/h entre árboles y ventanas.",
    impacto: "Responsable de la mayoría de pérdidas blindadas tácticas recientes por una fracción infinitesimal del coste de un misil convencional.",
    specs: {
      calibre: "Ojiva PG-7 / C4 (1,5-3 kg)",
      velocidad: "120 - 160 km/h",
      alcance: "8 - 20 km (con fibra óptica)",
      cadencia: "Enjambres continuos",
      penetracion: "300-500 mm RHA",
      guiado: "Piloto VR analógico / digital / fibra",
      peso: "2,8 kg armado",
      coste: "~350 - 700 USD",
    },
    simStats: { dano: 84, antiBlindaje: 86, antiAereo: 42, alcanceRelativo: 85 },
    piezas: [
      { id: "canon", nombre: "4 Motores Brushless + Hélices", desc: "Empuje instantáneo para giros de 10G y picados casi verticales.", offset: [0, 0.9, 0], color: "#38BDF8" },
      { id: "receptor", nombre: "Chasis en X de Fibra de Carbono", desc: "Placa ultraligera que sostiene brazos, controladora de vuelo y ESC.", offset: [0, 0, 0], color: "#64748b" },
      { id: "optica", nombre: "Cámara FPV Baja Luz + VTX", desc: "Transmite vídeo en vivo al piloto o a través de bobina de fibra óptica.", offset: [1.1, 0.35, 0], color: "#FFC94D" },
      { id: "cargador", nombre: "Batería LiPo 6S Alta Descarga", desc: "Entrega corriente brutal durante 6-12 minutos de vuelo táctico.", offset: [0, 0.65, -0.75], color: "#22c55e" },
      { id: "culata", nombre: "Ojiva PG-7 con Espoleta de Impacto", desc: "Al embestir el techo o motor, el chorro metálico fundido perfora el interior.", offset: [0, -1.05, 0], color: "#ef4444" },
    ],
  },
  {
    id: "mlrs-himars",
    rango: 7,
    nombre: "Lanzacohetes Múltiple (HIMARS / MLRS)",
    categoria: "Artillería de Precisión Móvil",
    origen: "EE. UU. / Internacional",
    modelo3D: "mlrs",
    resumen: "Camión ligero blindado con contenedor de 6 cohetes guiados GMLRS o 1 misil balístico táctico ATACMS — ataca puestos de mando a 85-300 km.",
    impacto: "Forzó la dispersión logística y destrucción de puentes, radares y depósitos muy lejos de la línea de trinchera.",
    specs: {
      calibre: "227 mm GMLRS / 610 mm ATACMS",
      velocidad: "Mach 2,5 - 3,0",
      alcance: "85 km (GMLRS) · 300 km (ATACMS)",
      cadencia: "Salva de 6 cohetes en 30 s",
      penetracion: "91 kg alto explosivo / submunición",
      guiado: "GPS + Inercial resistente a EW",
      peso: "16.200 kg vehículo",
      coste: "~4 M USD vehículo · 160k USD cohete",
    },
    simStats: { dano: 97, antiBlindaje: 85, antiAereo: 15, alcanceRelativo: 98 },
    piezas: [
      { id: "canon", nombre: "Contenedor Pod de 6 Tubos", desc: "Módulo recargable completo en 5 minutos mediante grúa propia.", offset: [-0.45, 0.95, 0], color: "#65a30d" },
      { id: "receptor", nombre: "Chasis 6×6 Alta Movilidad", desc: "Cruza carreteras y puentes ligeros a 85 km/h para escapar tras disparar.", offset: [0, -0.45, 0], color: "#94a3b8" },
      { id: "optica", nombre: "Cabina Blindada + Computador Fuego", desc: "Calcula trayectorias balísticas y coordina enlace satelital cifrado.", offset: [1.35, 0.25, 0], color: "#38BDF8" },
      { id: "cargador", nombre: "Cohete Guiado 227 mm", desc: "Aletas delanteras corrigen la deriva hasta caer a menos de 5 m del blanco.", offset: [0.95, 1.35, 0], color: "#ef4444" },
      { id: "culata", nombre: "Sistema Hidráulico de Elevación", desc: "Orienta el módulo en azimut y ángulo de tiro en 16 segundos.", offset: [-1.1, 0.2, 0], color: "#FFC94D" },
    ],
  },
  {
    id: "mbt-120",
    rango: 8,
    nombre: "Carro de Combate Principal (MBT 120mm)",
    categoria: "Blindado Pesado de Ruptura",
    origen: "OTAN / Global",
    modelo3D: "mbt",
    resumen: "Tanque moderno con cañón estabilizado de 120 mm, armadura compuesta multicapa, bloques reactivos ERA y cámara térmica de comandante.",
    impacto: "Sigue siendo insustituible para romper defensas con fuego directo y sobrevivir bajo fuego de cañón y metralla.",
    specs: {
      calibre: "120 mm L/55 ánima lisa",
      velocidad: "1.750 m/s (flecha APFSDS)",
      alcance: "4.000 m tiro directo",
      cadencia: "6 - 10 disparos/min",
      penetracion: ">700 mm RHA tungsteno",
      guiado: "Computadora balística + telémetro láser",
      peso: "62 toneladas",
      coste: "~9 - 14 M USD",
    },
    simStats: { dano: 94, antiBlindaje: 95, antiAereo: 28, alcanceRelativo: 78 },
    piezas: [
      { id: "canon", nombre: "Cañón 120mm Estabilizado", desc: "Mantiene puntería exacta sobre terrenos irregulares a 50 km/h.", offset: [1.55, 0.45, 0], color: "#cbd5e1" },
      { id: "receptor", nombre: "Torreta Compuesta + Óptica CITV", desc: "Cazador-asesino: el comandante busca el siguiente blanco mientras dispara.", offset: [0, 1.05, 0], color: "#65a30d" },
      { id: "optica", nombre: "Bloques Reactivos ERA", desc: "Placas explosivas exteriores que rompen el chorro de misiles huecos.", offset: [0.7, 0.25, 0.85], color: "#FFC94D" },
      { id: "cargador", nombre: "Barcaza Blindada + Turbina 1.500 HP", desc: "Motor trasero protegido capaz de mover 62 toneladas ágilmente.", offset: [0, -0.55, 0], color: "#64748b" },
      { id: "culata", nombre: "Orugas Dobles + Faldones", desc: "Distribuyen la presión sobre barro y protegen tren de rodaje.", offset: [0, -0.9, -0.9], color: "#475569" },
    ],
  },
  {
    id: "sam-patriot",
    rango: 9,
    nombre: "Sistema Antiaéreo (Patriot / S-400)",
    categoria: "Defensa Aérea y Antimisil",
    origen: "EE. UU. / Internacional",
    modelo3D: "sam",
    resumen: "Batería antiaérea de largo alcance capaz de derribar cazas furtivos, drones pesados y misiles balísticos antes de impactar en ciudades.",
    impacto: "Define qué parte del espacio aéreo permanece abierta o cerrada para aviación de combate y bombarderos.",
    specs: {
      calibre: "Interceptor PAC-3 / 48N6",
      velocidad: "Mach 4,1 - 5,0",
      alcance: "100 - 250 km aéreo",
      cadencia: "Salva múltiple simultánea",
      penetracion: "Impacto cinético (hit-to-kill)",
      guiado: "Radar AESA + buscador activo",
      peso: "900 kg por interceptor",
      coste: "~4 M USD por misil",
    },
    simStats: { dano: 91, antiBlindaje: 20, antiAereo: 99, alcanceRelativo: 96 },
    piezas: [
      { id: "canon", nombre: "4 Contenedores de Lanzamiento", desc: "Celdas herméticas listas para disparo rápido en ángulo elevado.", offset: [0, 1.0, 0], color: "#38BDF8" },
      { id: "receptor", nombre: "Plataforma Remolque Estabilizada", desc: "Cuatro gatos hidráulicos nivelan la batería en terreno irregular.", offset: [0, -0.7, 0], color: "#64748b" },
      { id: "optica", nombre: "Antena Enlace Radar Multifunción", desc: "Recibe actualización de trayectoria en tiempo real durante el vuelo.", offset: [-1.25, 0.45, 0], color: "#FFC94D" },
      { id: "cargador", nombre: "Misil Interceptor Supersónico", desc: "Microimpulsores laterales maniobran a decenas de G para choque directo.", offset: [1.35, 1.25, 0], color: "#ef4444" },
      { id: "culata", nombre: "Generador y Mando Hidráulico", desc: "Suministra potencia continua al sistema de disparo remoto.", offset: [-1.1, -0.45, 0], color: "#94a3b8" },
    ],
  },
  {
    id: "cruise-missile",
    rango: 10,
    nombre: "Misil de Crucero Táctico (Tomahawk / Storm Shadow)",
    categoria: "Ataque Estratégico Largo Alcance",
    origen: "Internacional",
    modelo3D: "cruise",
    resumen: "Aeronave autónoma furtiva que vuela a 30 metros sobre valles y mar siguiendo el perfil del terreno para golpear búnkeres a cientos de kilómetros.",
    impacto: "Permite destruir nodos de mando, aeródromos y buques sin arriesgar pilotos tripulados sobre defensas densas.",
    specs: {
      calibre: "Ojiva penetradora 450 kg (BROACH)",
      velocidad: "880 km/h (Mach 0,85)",
      alcance: "550 - 1.600 km",
      cadencia: "Lanzamiento aéreo o VLS naval",
      penetracion: "Múltiples losas de hormigón armado",
      guiado: "TERCOM + DSMAC + GPS + Cámara IR final",
      peso: "1.300 kg",
      coste: "~1,8 - 2,5 M USD",
    },
    simStats: { dano: 99, antiBlindaje: 90, antiAereo: 10, alcanceRelativo: 100 },
    piezas: [
      { id: "canon", nombre: "Cámara Térmica Terminal + Nariz Furtiva", desc: "Compara la foto real del edificio objetivo en los últimos segundos.", offset: [1.55, 0.1, 0], color: "#FFC94D" },
      { id: "receptor", nombre: "Fuselaje Furtivo Compuesto", desc: "Reduce eco de radar frontal imitando un pájaro pequeño.", offset: [0, 0.25, 0], color: "#94a3b8" },
      { id: "optica", nombre: "Alas Desplegables de Crucero", desc: "Se abren tras el lanzamiento para planear cientos de kilómetros eficientemente.", offset: [0, 0.75, 0.95], color: "#38BDF8" },
      { id: "cargador", nombre: "Ojiva Tándem Penetradora 450kg", desc: "Perfora techo de búnker antes de detonar en el interior.", offset: [0.45, -0.75, 0], color: "#ef4444" },
      { id: "culata", nombre: "Turborreactor + Aletas de Cola", desc: "Mínima firma infrarroja trasera durante vuelo rasante.", offset: [-1.5, 0, 0], color: "#f97316" },
    ],
  },
];
