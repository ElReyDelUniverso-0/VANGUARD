// v93.0 VANGUARD EARTH — motor de "el googles de Vanguard"
// Espejo del simulador de satélite espía de navegador (globo fotorrealista,
// contactos en vivo de aviones, buques, satélites, sismos, drones y cámaras,
// rastreo con estela, vistas de sensor, HUD militar, analista por texto,
// crónicas guiadas y reset al planeta completo). Cero assets, cero textos y
// cero código del original: todo el universo (llamativos, modelos, rutas,
// lugares ficticios y prosa) es creación propia de Vanguard.
// El motor es 100% determinista y puro en el tiempo: la misma marca temporal
// produce siempre el mismo planeta — inspeccionable línea a línea.

import { fnvHash, mulberry32, clamp, evaluarNeuronal, type Veredicto } from "@/lib/neurona-core";

// ---------- utilidades geográficas ----------
const R_TIERRA = 6371;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function distanciaKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R_TIERRA * Math.asin(Math.min(1, Math.sqrt(h))));
}

export function rumboEntre(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLng = rad(bLng - aLng);
  const y = Math.sin(dLng) * Math.cos(rad(bLat));
  const x = Math.cos(rad(aLat)) * Math.sin(rad(bLat)) - Math.sin(rad(aLat)) * Math.cos(rad(bLat)) * Math.cos(dLng);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/** Interpolación por círculo máximo entre dos puntos (fracción 0..1). */
function interpolaGranCirculo(
  aLat: number, aLng: number, bLat: number, bLng: number, f: number,
): { lat: number; lng: number; rumbo: number } {
  const φ1 = rad(aLat), λ1 = rad(aLng), φ2 = rad(bLat), λ2 = rad(bLng);
  const d =
    2 * Math.asin(Math.min(1, Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2)));
  if (d < 1e-9) return { lat: aLat, lng: aLng, rumbo: rumboEntre(aLat, aLng, bLat, bLng) };
  const A = Math.sin((1 - f) * d) / Math.sin(d);
  const B = Math.sin(f * d) / Math.sin(d);
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
  const z = A * Math.sin(φ1) + B * Math.sin(φ2);
  const lat = deg(Math.atan2(z, Math.sqrt(x * x + y * y)));
  const lng = deg(Math.atan2(y, x));
  return { lat, lng, rumbo: rumboEntre(lat, lng, bLat, bLng) };
}

export function normaliza(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// ---------- catálogo de lugares (geografía real + ficción de Vanguard) ----------
export type LugarTipo = "ciudad" | "estrecho" | "mar" | "teatro" | "ficticio" | "base";

export interface Lugar {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  alt: number; // altitud de cámara al volar (radios globe.gl)
  tipo: LugarTipo;
  nota: string;
}

export const LUGARES: Lugar[] = [
  // ciudades centinela
  { id: "estambul", nombre: "Estambul", lat: 41.01, lng: 28.98, alt: 0.75, tipo: "ciudad", nota: "Dos continentes colgando de tres puentes. Cada convoy que cruza el Bósforo se firma aquí dos veces: una en Asia y otra en Europa." },
  { id: "dubai", nombre: "Dubái", lat: 25.2, lng: 55.27, alt: 0.7, tipo: "ciudad", nota: "Una ciudad construida sobre el carbón barato y el dinero rápido. Desde la órbita se ve su palma artificial como una firma." },
  { id: "singapur", nombre: "Singapur", lat: 1.35, lng: 103.82, alt: 0.65, tipo: "ciudad", nota: "El puerto que mueve una quinta parte del comercio mundial con menos superficie que una provincia." },
  { id: "rotterdam", nombre: "Róterdam", lat: 51.92, lng: 4.48, alt: 0.65, tipo: "ciudad", nota: "La puerta de entrada de Europa. Cuando los muelles se llenan de grano, alguien en otra latitud ya sabe el precio del pan." },
  { id: "shanghai", nombre: "Shanghái", lat: 31.23, lng: 121.47, alt: 0.7, tipo: "ciudad", nota: "El horizonte más fotografiado del planeta desde arriba: fabricas, ríos de contenedores y puentes que nunca se vacían." },
  { id: "losangeles", nombre: "Los Ángeles", lat: 34.05, lng: -118.24, alt: 0.7, tipo: "ciudad", nota: "Cien kilómetros de luces seguidas. El aeropuerto del sur recibe a la mitad de los aviones que ves cruzar el Pacífico." },
  { id: "panama", nombre: "Ciudad de Panamá", lat: 8.98, lng: -79.52, alt: 0.6, tipo: "ciudad", nota: "Las esclusas por donde pasa todo lo que no cabe por otro lado. Un día de cierre aquí encarece el flete en tres continentes." },
  { id: "elcairo", nombre: "El Cairo", lat: 30.04, lng: 31.24, alt: 0.65, tipo: "ciudad", nota: "Junto al canal que separa dos mares y une los otros cinco. La arena del desierto aún borra los tanques de 1973." },
  { id: "nairobi", nombre: "Nairobi", lat: -1.29, lng: 36.82, alt: 0.6, tipo: "ciudad", nota: "Capital diplomática de África oriental: aquí se firma la paz que otras capitales ya decidieron." },
  { id: "sydney", nombre: "Sídney", lat: -33.87, lng: 151.21, alt: 0.65, tipo: "ciudad", nota: "El faro del hemisferio sur. Todo buque que atraviesa el estrecho de Torres firma su bitácora frente a esta bahía." },
  { id: "reikiavik", nombre: "Reikiavik", lat: 64.15, lng: -21.94, alt: 0.6, tipo: "ciudad", nota: "El hueco entre Groenlandia y Escocia por donde pasan los submarinos. Durante la Guerra Fría, la franja más vigilada del Atlántico." },
  { id: "buenosaires", nombre: "Buenos Aires", lat: -34.6, lng: -58.38, alt: 0.65, tipo: "ciudad", nota: "El Río de la Plata es tan ancho que parece mar. Los graneleros que salen vacíos vuelven cargados de futuro." },
  { id: "bombay", nombre: "Bombay", lat: 19.08, lng: 72.88, alt: 0.7, tipo: "ciudad", nota: "Media flota pesquera del Índico y una base aeronaval comparten la misma bahía." },
  { id: "estocolmo", nombre: "Estocolmo", lat: 59.33, lng: 18.07, alt: 0.6, tipo: "ciudad", nota: "Archipiélago de treinta mil islas. Sus hidrófonos escuchan más de lo que cuentan los periódicos." },
  { id: "ciudaddelcabo", nombre: "Ciudad del Cabo", lat: -33.92, lng: 18.42, alt: 0.6, tipo: "ciudad", nota: "Cuando Suez se cierra, todo el mundo recuerda que este cabo existe. Dos océanos discutiendo frente a la misma montaña." },
  { id: "tokio", nombre: "Tokio", lat: 35.68, lng: 139.69, alt: 0.7, tipo: "ciudad", nota: "La mayor mancha de luz nocturna del planeta. De noche parece que la ciudad flota sobre un mar de lámparas." },
  // estrechos y gargantas
  { id: "ormuz", nombre: "Estrecho de Ormuz", lat: 26.57, lng: 56.25, alt: 0.55, tipo: "estrecho", nota: "Una tercera parte del petróleo que quema el mundo pasa por un corredor de 39 kilómetros. El parachoques más caro de la historia." },
  { id: "malaca", nombre: "Estrecho de Malaca", lat: 2.5, lng: 101.4, alt: 0.55, tipo: "estrecho", nota: "El embudo entre dos gigantes. Mil buques al día, piratas modernos incluidos y un solo canal profundo." },
  { id: "suez", nombre: "Canal de Suez", lat: 30.42, lng: 32.35, alt: 0.5, tipo: "estrecho", nota: "Un barco atascado en 2021 paralizó el comercio de medio mundo durante seis días. El canal es una arteria sin bypass." },
  { id: "gibraltar", nombre: "Estrecho de Gibraltar", lat: 35.97, lng: -5.5, alt: 0.5, tipo: "estrecho", nota: "Catorce kilómetros entre dos continentes y dos mundos fiscales. Bajo el agua, los cables que hablan por África y Europa." },
  { id: "mandeb", nombre: "Bab el-Mandeb", lat: 12.58, lng: 43.33, alt: 0.5, tipo: "estrecho", nota: "La 'puerta de las lágrimas'. Los misiles llegan desde la costa antes de que el buque termine de virar." },
  { id: "taiwan", nombre: "Estrecho de Taiwán", lat: 24.5, lng: 119.5, alt: 0.55, tipo: "estrecho", nota: "180 kilómetros que resumen la mayor disputa naval del siglo. Los radares de ambas orillas se saludan cada mañana." },
  { id: "bosforo", nombre: "Bósforo", lat: 41.12, lng: 29.07, alt: 0.5, tipo: "estrecho", nota: "La convención de 1936 sigue decidiendo qué buque de guerra entra y cuál se queda fuera mirando." },
  { id: "magallanes", nombre: "Estrecho de Magallanes", lat: -53.3, lng: -70.6, alt: 0.55, tipo: "estrecho", nota: "El final del mapa antiguo. Vientos de cien nudos y petroleros que lo cruzan de todos modos." },
  // mares
  { id: "mediterraneo", nombre: "Mar Mediterráneo", lat: 35.0, lng: 18.0, alt: 1.6, tipo: "mar", nota: "El mar más vigiado de la historia: veintidós países, tres continentes y ninguna milímetro de costa sin dueño." },
  { id: "mar_china", nombre: "Mar de China Meridional", lat: 14.0, lng: 114.0, alt: 1.7, tipo: "mar", nota: "Arrecifes convertidos en pistas. Cada isla artificial es una reclamación escrita en hormigón." },
  { id: "caribe", nombre: "Mar Caribe", lat: 15.0, lng: -75.0, alt: 1.6, tipo: "mar", nota: "Rutas de cruceros por delante, rutas de narcos por debajo. La misma agua cuenta dos historias." },
  { id: "baltico", nombre: "Mar Báltico", lat: 58.0, lng: 20.0, alt: 1.6, tipo: "mar", nota: "Cables de fibra que se rompen 'por accidente', buques de bandera dudosa y la mayor densidad de radares por kilómetro cuadrado." },
  // teatros y lugares de ficción Vanguard (los mismos que viven en el resto de espejos)
  { id: "karsk", nombre: "Valle del Karsk", lat: 48.6, lng: 37.4, alt: 0.8, tipo: "ficticio", nota: "El teatro ficticio de la Línea del Frente: once puntos que cambian de mano cada noche y una franja disputada que nadie ha logrado nombrar todavía." },
  { id: "karvath", nombre: "República de Karvath", lat: 46.2, lng: 41.8, alt: 0.9, tipo: "ficticio", nota: "Potencia media del mundo Vanguard: refinamientos en el sur, manifiestos en la capital y una guardia fronteriza que dispara primero y redacta después." },
  { id: "sarn", nombre: "Emirato de Sarn", lat: 27.4, lng: 50.9, alt: 0.9, tipo: "ficticio", nota: "Petróleo, bancas y un príncipe heredero que colecciona misiles como otros coleccionan sellos. Los buques de Malaca le saludan primero." },
  { id: "tarquinia", nombre: "Liga de Tarquinia", lat: 43.8, lng: 11.4, alt: 0.85, tipo: "ficticio", nota: "Confederación de ciudades-república del Mediterráneo Vanguard: la diplomacia se escribe en tinta y se ejecuta en radares." },
  { id: "osk", nombre: "Comarca de Osk", lat: 52.1, lng: 23.6, alt: 0.8, tipo: "ficticio", nota: "La llanura mercantil del RTS IMPERIO: granjas, mercados y fortalezas que cambian de trono cada semana." },
  { id: "vand", nombre: "Estrecho de Vand", lat: 14.2, lng: 68.3, alt: 0.55, tipo: "ficticio", nota: "La garganta ficticia donde la Liga Tarquinia y el Emirato de Sarn miden sus flotas sin declararse la guerra." },
  { id: "alvar", nombre: "República de Alvar", lat: -12.6, lng: -55.4, alt: 0.9, tipo: "ficticio", nota: "Selva, soja y tres golpes de estado disfrazados de referéndum. El pulso del hemisferio sur se lee aquí." },
  { id: "zenit", nombre: "Cuenca de Zenit", lat: -38.2, lng: 96.5, alt: 1.2, tipo: "ficticio", nota: "Abismo oceánico del Índico austral donde Vanguard entrena a sus hidrófonos. Nadie ha puesto nombre a la mitad de los sonidos." },
  { id: "meridiana", nombre: "Base Meridiana", lat: -75.1, lng: -12.8, alt: 0.85, tipo: "base", nota: "Estación polar de Vanguard: radar de banda ancha, pista de hielo y el mejor cielo del planeta para mirar hacia arriba." },
  { id: "aurora", nombre: "Torre Aurora", lat: 68.4, lng: 16.2, alt: 0.75, tipo: "base", nota: "La antena más al norte de la red Vanguard. Cuando las auroras golpean la ionosfera, toda la escuadra del Báltico sale a la superficie." },
];

export function lugarPorId(id: string): Lugar | undefined {
  return LUGARES.find((l) => l.id === id);
}

// ---------- tipos de contacto ----------
export type TipoContacto = "avion" | "buque" | "satelite" | "dron" | "sismo" | "camara";

export interface Contacto {
  id: string;
  tipo: TipoContacto;
  nombre: string;
  callsign: string;
  clase: string;
  modelo: string;
  lat: number;
  lng: number;
  altKm: number;
  vel: number; // km/h
  rumbo: number; // grados
  bandera: string;
  meta: string[];
  img?: string; // feed de cámara (contactos cámara)
}

// llamativos y clases — universo original Vanguard
const MODELOS_AVION: Record<string, string[]> = {
  comercial: ["Aerion 320", "Aerion 350 neo", "Vulcan V-900", "Cóndor C-800"],
  carga: ["Titán F-7", "Mula Aérea MA-400", "Cóndor Carga CC-9"],
  militar: ["Halcón F-22X", "Corsario K-72", "Relámpago R-5", "Vigía-1 AEWC", "Búho B-2R"],
};
const MODELOS_BUQUE: string[] = ["Portaaviones VMN Alba", "Destructor Clase Trueno", "Fragata Clase Bruma", "Granelero Estrella del Sur", "Petrolero Golfo Azul", "Crucero Clase Centinela"];
const MODELOS_DRON: string[] = ["Zángano-7", "Vespa ISR-4", "Ala Fija A-19", "Cuadricóptero Pesado Q-88"];
const BANDERAS: string[] = ["Vanguard", "Karvath", "Sarn", "Tarquinia", "Alvar", "neutral"];

// nodos de ruta aéreos (usar ciudades/estrechos del catálogo)
const NODOS_AEREOS = ["estambul", "dubai", "singapur", "rotterdam", "shanghai", "losangeles", "panama", "elcairo", "nairobi", "sydney", "reikiavik", "buenosaires", "bombay", "estocolmo", "ciudaddelcabo", "tokio", "karvath", "sarn", "tarquinia", "alvar"];

// rutas marítimas (waypoints por id de lugar)
const RUTAS_MARITIMAS: string[][] = [
  ["suez", "mandeb", "bombay", "singapur", "shanghai"],
  ["gibraltar", "mediterraneo", "suez"],
  ["singapur", "malaca", "bombay", "mandeb", "suez", "gibraltar", "rotterdam"],
  ["panama", "caribe", "rotterdam"],
  ["magallanes", "buenosaires", "rotterdam"],
  ["tokio", "shanghai", "taiwan", "singapur"],
  ["vand", "sarn", "ormuz", "malaca"],
  ["reikiavik", "estocolmo", "estambul"],
  ["ciudaddelcabo", "nairobi", "bombay", "singapur"],
  ["zenit", "sydney", "singapur"],
];

const ZONAS_DRON = ["karsk", "karvath", "vand", "mandeb", "ormuz", "taiwan", "baltico", "alvar"];
const CCAA: Array<{ nombre: string; lat: number; lng: number; img: string }> = [
  { nombre: "CCTV · Puente del Bósforo", lat: 41.04, lng: 29.0, img: "/assets/cctv/bridge-cctv.png" },
  { nombre: "CCTV · Puerto de contenedores", lat: 1.29, lng: 103.85, img: "/assets/cctv/harbor-smoke.png" },
  { nombre: "CCTV · Avenida sitiada", lat: 48.6, lng: 37.4, img: "/assets/cctv/street-devastation.png" },
  { nombre: "CCTV · Paso fronterizo norte", lat: 46.2, lng: 41.8, img: "/assets/cctv/border-cctv.png" },
  { nombre: "CCTV · Plaza con blindados", lat: 30.04, lng: 31.24, img: "/assets/cctv/tanks-square.png" },
  { nombre: "CCTV · Cruce nocturno", lat: 35.68, lng: 139.69, img: "/assets/cctv/night-street.png" },
  { nombre: "CCTV · Almacén en llamas", lat: 25.2, lng: 55.27, img: "/assets/cctv/warehouse-fire.png" },
  { nombre: "CCTV · Control de carretera", lat: 48.9, lng: 37.1, img: "/assets/cctv/checkpoint-night.png" },
  { nombre: "CCTV · Central eléctrica", lat: 51.92, lng: 4.48, img: "/assets/cctv/power-plant.png" },
  { nombre: "CCTV · Carretera con cráter", lat: 43.8, lng: 11.4, img: "/assets/cctv/road-crater.png" },
];

const MESES_UTC = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
export function hhmmUTC(t: number): string {
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
}
export function fechaCortaUTC(t: number): string {
  const d = new Date(t);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MESES_UTC[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// ---------- generadores puros por tipo ----------
interface AvionCfg { id: string; callsign: string; clase: keyof typeof MODELOS_AVION; modelo: string; bandera: string; desde: string; hacia: string; durMin: number; fase: number; altKm: number; }

const AVIONES: AvionCfg[] = Array.from({ length: 26 }, (_, i) => {
  const r = mulberry32(0xa1 + i * 977);
  const clases = Object.keys(MODELOS_AVION) as (keyof typeof MODELOS_AVION)[];
  const clase = clases[i % 3 === 2 ? (r() < 0.55 ? 2 : 1) : 0];
  const modelos = MODELOS_AVION[clase];
  const a = NODOS_AEREOS[Math.floor(r() * NODOS_AEREOS.length)];
  let b = NODOS_AEREOS[Math.floor(r() * NODOS_AEREOS.length)];
  if (b === a) b = NODOS_AEREOS[(NODOS_AEREOS.indexOf(a) + 7) % NODOS_AEREOS.length];
  const prefijo = ["VG", "KRV", "SRN", "TRQ", "ALV", "MER"][i % 6];
  return {
    id: `av-${i}`,
    callsign: `${prefijo}-${String(100 + Math.floor(r() * 899))}`,
    clase,
    modelo: modelos[Math.floor(r() * modelos.length)],
    bandera: BANDERAS[Math.floor(r() * BANDERAS.length)],
    desde: a,
    hacia: b,
    durMin: 70 + Math.floor(r() * 90),
    fase: r(),
    altKm: clase === "militar" ? 3 + r() * 9 : 9.2 + r() * 2.8,
  };
});

function posAvion(cfg: AvionCfg, t: number): { lat: number; lng: number; rumbo: number } {
  const a = lugarPorId(cfg.desde)!;
  const b = lugarPorId(cfg.hacia)!;
  const progreso = ((t / 60000) / cfg.durMin + cfg.fase) % 1;
  return interpolaGranCirculo(a.lat, a.lng, b.lat, b.lng, progreso);
}

interface BuqueCfg { id: string; nombre: string; callsign: string; bandera: string; ruta: number; fase: number; }
const BUQUES: BuqueCfg[] = Array.from({ length: 12 }, (_, i) => {
  const r = mulberry32(0xb2 + i * 613);
  return {
    id: `bq-${i}`,
    nombre: MODELOS_BUQUE[Math.floor(r() * MODELOS_BUQUE.length)],
    callsign: `VM${String(4000 + Math.floor(r() * 5999))}`,
    bandera: BANDERAS[Math.floor(r() * BANDERAS.length)],
    ruta: i % RUTAS_MARITIMAS.length,
    fase: r(),
  };
});

function posBuque(cfg: BuqueCfg, t: number): { lat: number; lng: number; rumbo: number } {
  const ruta = RUTAS_MARITIMAS[cfg.ruta].map((id) => lugarPorId(id)!).filter(Boolean);
  const progresoTotal = ((t / 60000) / 240 + cfg.fase) % 1; // 4 h por tramo completo
  const tramos = ruta.length - 1;
  const seg = Math.min(tramos - 1, Math.floor(progresoTotal * tramos));
  const f = progresoTotal * tramos - seg;
  const a = ruta[seg], b = ruta[seg + 1];
  return interpolaGranCirculo(a.lat, a.lng, b.lat, b.lng, f);
}

interface SatCfg { id: string; nombre: string; tipo: string; inclMax: number; periodoMin: number; fase: number; lngBase: number; deriva: number; }
const SATelites: SatCfg[] = [
  { id: "sat-0", nombre: "Estación Meridiana", tipo: "estación tripulada", inclMax: 51.6, periodoMin: 92.8, fase: 0.05, lngBase: 0, deriva: 22.5 },
  { id: "sat-1", nombre: "Vigía-Óptica 2", tipo: "imagen óptica", inclMax: 97.8, periodoMin: 96.4, fase: 0.31, lngBase: 40, deriva: -24 },
  { id: "sat-2", nombre: "Vigía-SAR 5", tipo: "radar de apertura", inclMax: 98.6, periodoMin: 98.2, fase: 0.62, lngBase: -30, deriva: 25 },
  { id: "sat-3", nombre: "Oreja del Norte", tipo: "escucha ELINT", inclMax: 63.4, periodoMin: 104.0, fase: 0.18, lngBase: 120, deriva: -21 },
  { id: "sat-4", nombre: "Clima-Global 9", tipo: "meteorológico", inclMax: 81.2, periodoMin: 110.5, fase: 0.44, lngBase: -100, deriva: 19 },
  { id: "sat-5", nombre: "Hilo Dorado 3", tipo: "comunicaciones", inclMax: 12.0, periodoMin: 124.0, fase: 0.7, lngBase: 60, deriva: 27 },
  { id: "sat-6", nombre: "Vigía-Óptica 7", tipo: "imagen óptica", inclMax: 97.9, periodoMin: 96.9, fase: 0.9, lngBase: 160, deriva: -24 },
  { id: "sat-7", nombre: "Senda Polaria 1", tipo: "observación polar", inclMax: 86.4, periodoMin: 100.1, fase: 0.52, lngBase: 10, deriva: 23 },
  { id: "sat-8", nombre: "Faro de Zenit", tipo: "baliza de socorro", inclMax: 45.0, periodoMin: 116.3, fase: 0.26, lngBase: -60, deriva: -20 },
  { id: "sat-9", nombre: "Guardián-SAR 2", tipo: "radar de apertura", inclMax: 98.2, periodoMin: 97.6, fase: 0.83, lngBase: 90, deriva: 26 },
];

function posSatelite(cfg: SatCfg, t: number): { lat: number; lng: number; rumbo: number } {
  const theta = (2 * Math.PI * (t / 60000)) / cfg.periodoMin + cfg.fase * 2 * Math.PI;
  const lat = cfg.inclMax * Math.sin(theta);
  const vueltas = t / 60000 / cfg.periodoMin + cfg.fase;
  const lng = ((cfg.lngBase + cfg.deriva * vueltas + 540 * Math.cos(theta)) % 360 + 540) % 360 - 180;
  const rumbo = Math.cos(theta) >= 0 ? 12 : 168; // ascendente o descendente
  return { lat, lng, rumbo };
}

function posDron(i: number, t: number): { lat: number; lng: number; rumbo: number } {
  const zona = lugarPorId(ZONAS_DRON[i % ZONAS_DRON.length])!;
  const r = mulberry32(0xd4 + i * 331);
  const radio = 1.1 + r() * 1.4;
  const theta = (t / 1000) / (240 + r() * 120) * 2 * Math.PI + r() * Math.PI * 2;
  const lat = zona.lat + radio * Math.sin(theta);
  const lng = zona.lng + (radio * Math.cos(theta)) / Math.max(0.2, Math.cos(rad(zona.lat)));
  return { lat, lng, rumbo: (deg(theta) + 90) % 360 };
}

function sismosDeHora(t: number): Array<{ lat: number; lng: number; mag: number; prof: number; zona: string }> {
  const bucket = Math.floor(t / 3600_000);
  const anillos: Array<[string, number]> = [
    ["Cinturón de fuego", 0.9], ["Índico oriental", 0.7], ["Báltico profundo", 0.5],
    ["Cuenca de Zenit", 0.6], ["Cordillera de Alvar", 0.8], ["Arco de Tarquinia", 0.5],
  ];
  return Array.from({ length: 6 }, (_, i) => {
    const r = mulberry32(fnvHash(`${bucket}-sismo-${i}`));
    const [zona, ampl] = anillos[Math.floor(r() * anillos.length)];
    const baseLat = -60 + r() * 130;
    const baseLng = -180 + r() * 360;
    const mag = Math.round((3.4 + r() * 3.4) * 10) / 10;
    return { lat: clamp(baseLat * ampl, -78, 78), lng: baseLng, mag, prof: Math.round(8 + r() * 120), zona };
  });
}

// ---------- API principal: contactos en un instante ----------
export function contactosEn(t: number): Contacto[] {
  const out: Contacto[] = [];
  for (const cfg of AVIONES) {
    const p = posAvion(cfg, t);
    out.push({
      id: cfg.id, tipo: "avion", nombre: `Vuelo ${cfg.callsign}`, callsign: cfg.callsign,
      clase: cfg.clase, modelo: cfg.modelo, lat: p.lat, lng: p.lng, altKm: Math.round(cfg.altKm * 10) / 10,
      vel: cfg.clase === "militar" ? 940 : 810 + (fnvHash(cfg.callsign) % 90),
      rumbo: Math.round(p.rumbo), bandera: cfg.bandera,
      meta: [
        `Clase: ${cfg.clase.toUpperCase()} · ${cfg.modelo}`,
        `Bandera: ${cfg.bandera}`,
        `Ruta: ${lugarPorId(cfg.desde)?.nombre} → ${lugarPorId(cfg.hacia)?.nombre}`,
        `Transpondedor ADS-B activo · nivel de vuelo ${Math.round(cfg.altKm * 32.8)}00 ft`,
      ],
    });
  }
  for (const cfg of BUQUES) {
    const p = posBuque(cfg, t);
    out.push({
      id: cfg.id, tipo: "buque", nombre: cfg.nombre, callsign: cfg.callsign,
      clase: "naval / mercante", modelo: cfg.nombre, lat: p.lat, lng: p.lng, altKm: 0,
      vel: 18 + (fnvHash(cfg.callsign) % 8), rumbo: Math.round(p.rumbo), bandera: cfg.bandera,
      meta: [
        `Bandera: ${cfg.bandera}`,
        `AIS activo · calado y lastre declarados`,
        `Tramo: ${RUTAS_MARITIMAS[cfg.ruta].map((id) => lugarPorId(id)?.nombre.split(" ")[0]).join(" → ")}`,
      ],
    });
  }
  for (const cfg of SATelites) {
    const p = posSatelite(cfg, t);
    out.push({
      id: cfg.id, tipo: "satelite", nombre: cfg.nombre, callsign: cfg.id.toUpperCase().replace("-", " "),
      clase: "orbital", modelo: cfg.tipo, lat: p.lat, lng: p.lng, altKm: 420 + (fnvHash(cfg.nombre) % 360),
      vel: 27600, rumbo: Math.round(p.rumbo), bandera: "Vanguard",
      meta: [
        `Tipo de carga: ${cfg.tipo}`,
        `Periodo orbital: ${cfg.periodoMin} min · inclinación máx. ${cfg.inclMax}°`,
        `Pase sobre tu objetivo: pregunta al ANALISTA`,
      ],
    });
  }
  for (let i = 0; i < 8; i++) {
    const p = posDron(i, t);
    const zona = lugarPorId(ZONAS_DRON[i % ZONAS_DRON.length])!;
    const modelo = MODELOS_DRON[i % MODELOS_DRON.length];
    out.push({
      id: `dr-${i}`, tipo: "dron", nombre: `Patrulla ${modelo}`, callsign: `ZNG-${String(i + 1).padStart(2, "0")}`,
      clase: "no tripulado", modelo, lat: p.lat, lng: p.lng, altKm: 1.2, vel: 185,
      rumbo: Math.round(p.rumbo), bandera: "Vanguard",
      meta: [
        `Órbita de vigilancia sobre ${zona.nombre}`,
        `Cámara electroóptica + FLIR activos`,
        `Autonomía declarada: 21 h`,
      ],
    });
  }
  for (const [i, s] of sismosDeHora(t).entries()) {
    out.push({
      id: `si-${i}`, tipo: "sismo", nombre: `Sismo M${s.mag} · ${s.zona}`, callsign: `USGS-EQ`,
      clase: "geofísico", modelo: `profundidad ${s.prof} km`, lat: s.lat, lng: s.lng, altKm: 0,
      vel: 0, rumbo: 0, bandera: "—",
      meta: [
        `Magnitud ${s.mag} a ${s.prof} km de profundidad`,
        `Red sismológica global: ${6 + (i % 4)} estaciones lo confirman`,
        `Sin aviso de tsunami salvo orden contraria`,
      ],
    });
  }
  for (const [i, c] of CCAA.entries()) {
    out.push({
      id: `cm-${i}`, tipo: "camara", nombre: c.nombre, callsign: `CCTV-${String(i + 1).padStart(2, "0")}`,
      clase: "cámara pública", modelo: "fija 24/7", lat: c.lat, lng: c.lng, altKm: 0,
      vel: 0, rumbo: 0, bandera: "—", img: c.img,
      meta: [`Alimentación en vivo indexada por Vanguard`, `Ubicación aproximada por privacidad`],
    });
  }
  return out;
}

export function estelaDe(c: Contacto, t: number): Array<[number, number, number]> {
  const pasos = 14;
  const ventana = c.tipo === "satelite" ? 40 * 60_000 : c.tipo === "buque" ? 90 * 60_000 : c.tipo === "avion" ? 90_000 : 20_000;
  const puntos: Array<[number, number, number]> = [];
  for (let i = 0; i < pasos; i++) {
    const tt = t - ventana + (ventana * i) / (pasos - 1);
    const pos =
      c.tipo === "avion" ? posAvion(AVIONES.find((a) => a.id === c.id)!, tt)
      : c.tipo === "buque" ? posBuque(BUQUES.find((b) => b.id === c.id)!, tt)
      : c.tipo === "satelite" ? posSatelite(SATelites.find((s) => s.id === c.id)!, tt)
      : c.tipo === "dron" ? posDron(Number(c.id.split("-")[1]), tt)
      : { lat: c.lat, lng: c.lng, rumbo: 0 };
    puntos.push([pos.lat, pos.lng, c.tipo === "satelite" ? 0.28 : c.tipo === "avion" ? 0.08 : 0.02]);
  }
  return puntos;
}

// ---------- pases satelitales ----------
export interface PaseSat { sat: string; tipo: string; enMs: number; durMin: number; maxGrados: number; }
export function pasesSobre(lat: number, lng: number, t: number, maxPases = 4): PaseSat[] {
  const out: PaseSat[] = [];
  for (const cfg of SATelites) {
    for (let m = 1; m <= 90; m++) {
      const tt = t + m * 60_000;
      const p = posSatelite(cfg, tt);
      const d = distanciaKm(lat, lng, p.lat, p.lng);
      if (d < 900) {
        out.push({
          sat: cfg.nombre, tipo: cfg.tipo, enMs: tt - t,
          durMin: Math.round(4 + (900 - d) / 300), maxGrados: Math.round(clamp(90 - d / 12, 12, 88)),
        });
        break;
      }
    }
    if (out.length >= maxPases) break;
  }
  return out.sort((a, b) => a.enMs - b.enMs);
}

export function cuentaAtras(ms: number): string {
  const min = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return min > 0 ? `${min} min ${String(s).padStart(2, "0")} s` : `${s} s`;
}

// ---------- veredicto neuronal de un contacto ----------
export function veredictoDe(c: Contacto): Veredicto {
  const texto = `${c.nombre} ${c.clase} ${c.modelo} ${c.meta.join(" ")}`;
  return evaluarNeuronal(texto, c.tipo === "satelite" ? 4 : 2);
}

// ---------- sensores (7 vistas) ----------
export interface Sensor { id: string; nombre: string; css: string; overlay: "ninguno" | "crt" | "nvg" | "flir" | "espectral"; nota: string; }
export const SENSORES: Sensor[] = [
  { id: "normal", nombre: "NORMAL", css: "none", overlay: "ninguno", nota: "Óptica estándar del satélite de Vanguard. Lo que ves es lo que hay." },
  { id: "crt", nombre: "CRT", css: "saturate(1.35) contrast(1.18) brightness(0.96)", overlay: "crt", nota: "Monitor fósforo verde de la vieja sala de situación. Chisporrotea, pero nunca miente." },
  { id: "nvg", nombre: "NVG", css: "hue-rotate(62deg) saturate(2.2) brightness(1.3) contrast(1.25)", overlay: "nvg", nota: "Visión nocturna: amplifica 4 órdenes de magnitud. Todo el planeta parece un bosque de fantasmas." },
  { id: "flir", nombre: "FLIR", css: "grayscale(1) sepia(0.5) hue-rotate(-35deg) saturate(4.2) contrast(1.3)", overlay: "flir", nota: "Termografía de hierro fundido: lo caliente quema en la imagen. Motores, humos y focos traicionan." },
  { id: "noir", nombre: "NOIR", css: "grayscale(1) contrast(1.55) brightness(0.88)", overlay: "ninguno", nota: "Sensor monocromo de contraste máximo: la honestidad de la sombra pura." },
  { id: "termico", nombre: "TÉRMICO", css: "invert(0.92) hue-rotate(180deg) saturate(1.8) contrast(1.35)", overlay: "flir", nota: "Inversión térmica: el mar se vuelve plomo, las ciudades se vuelven lava." },
  { id: "espectral", nombre: "ESPECTRAL", css: "hue-rotate(205deg) saturate(1.9) brightness(1.12) contrast(1.1)", overlay: "espectral", nota: "Banda SAR multiespectral: atraviesa nubes yorgos, ve los campos que siembran a escondidas." },
];

// ---------- misiones de primera vez (los primeros cinco minutos) ----------
export interface Mision { id: string; titulo: string; desc: string; capas: Record<string, boolean>; sensor: string; vuelo: { lat: number; lng: number; alt: number }; }
export const MISIONES: Mision[] = [
  {
    id: "contactos", titulo: "CONTACTOS EN VIVO", desc: "Ilumina el cielo: aviones, buques y drones en tiempo real. Pulsa uno: la cámara lo encierra, dibuja su estela y te entrega la ficha.",
    capas: { aviones: true, buques: true, drones: true, satelites: false, sismos: false, camaras: false }, sensor: "normal",
    vuelo: { lat: 12, lng: 100, alt: 2.0 },
  },
  {
    id: "orbita", titulo: "ÓRBITA", desc: "Sube con la constelación: diez satélites de Vanguard cabalgando sobre el planeta. Rastrea uno y acompáñalo de polo a polo.",
    capas: { aviones: false, buques: false, drones: false, satelites: true, sismos: false, camaras: false }, sensor: "espectral",
    vuelo: { lat: 10, lng: 20, alt: 3.1 },
  },
  {
    id: "superficie", titulo: "SUPERFICIE", desc: "La Tierra bajo los pies: sismos de la última hora y cámaras públicas proyectadas sobre sus ciudades. Pulsa una cámara y mira por su ojo.",
    capas: { aviones: false, buques: false, drones: false, satelites: false, sismos: true, camaras: true }, sensor: "flir",
    vuelo: { lat: 48.6, lng: 37.4, alt: 1.1 },
  },
  {
    id: "libre", titulo: "EXPLORACIÓN LIBRE", desc: "Todo encendido, todos los sensores. Gira el planeta, elige sensor con 1-7 y pregunta al ANALISTA lo que quieras contar.",
    capas: { aviones: true, buques: true, drones: true, satelites: true, sismos: true, camaras: true }, sensor: "normal",
    vuelo: { lat: 22, lng: 12, alt: 2.5 },
  },
];

// ---------- crónicas guiadas (el "voyager" de Vanguard) ----------
export interface Parada { lugarId: string; texto: string; }
export interface Cronica { id: string; titulo: string; lema: string; paradas: Parada[]; }
export const CRONICAS: Cronica[] = [
  {
    id: "estrechos", titulo: "LOS SEIS ESTRECHOS", lema: "Seis gargantas por donde respira el comercio",
    paradas: [
      { lugarId: "ormuz", texto: "Empezamos donde el petróleo se hace estrecho: 39 kilómetros y un tercio del crudo del planeta. Un solo parachoques caro." },
      { lugarId: "malaca", texto: "El embudo de Asia. Mil buques al día entre dos potencias que lo cuentan todo con lanchas patrulleras." },
      { lugarId: "suez", texto: "La arteria sin bypass. Cuando se atasca, el mundo entero recuerda que la geografía sigue mandando." },
      { lugarId: "mandeb", texto: "La puerta de las lágrimas: 30 kilómetros que separan la calma de la hiperbórea y la historia reciente de la pólvora." },
      { lugarId: "gibraltar", texto: "Catorce kilómetros entre dos continentes. Debajo, los cables por donde hablan dos mundos." },
      { lugarId: "bosforo", texto: "Cerramos en Estambul: la convención de 1936 decide todavía qué buque entra y cuál mira desde fuera." },
    ],
  },
  {
    id: "karsk", titulo: "EL VALLE QUE ARDE", lema: "Tour del frente que se mueve mientras vuelas",
    paradas: [
      { lugarId: "karsk", texto: "Once puntos, una franja rayada y un mapa que cambia de mano cada noche. La Línea del Frente vive aquí." },
      { lugarId: "karvath", texto: "La república que redacta manifiestos por la mañana y mueve convoyes por la tarde. Su guardia fronteriza nunca duerme." },
      { lugarId: "tarquinia", texto: "La Liga mediando con una mano y embargando con la otra. La diplomacia de tinta y radar." },
      { lugarId: "sarn", texto: "El emirato que compra paz al por mayor y misiles al detalle. Malaca le saluda primero a sus buques." },
      { lugarId: "osk", texto: "Más al norte, la llanura del IMPERIO: tronos que cambian de dueño cada semana sin que el trigo se entere." },
      { lugarId: "vand", texto: "Cerramos en Vand: dos flotas midiéndose sin declararse. El estrecho más tranquilo del mundo es el que mejor se vigila." },
    ],
  },
  {
    id: "noche", titulo: "CIUDADES QUE NO DUERMEN", lema: "La luz nocturna como testigo del poder",
    paradas: [
      { lugarId: "tokio", texto: "La mayor mancha de luz del planeta. De noche, la bahía parece una galaxia de lámparas en fila." },
      { lugarId: "shanghai", texto: "El delta que fabrica media casa del mundo. Los muelles brillan más que el centro histórico." },
      { lugarId: "dubai", texto: "Una palma de hormigón visible desde 400 kilómetros. El lujo también firma desde arriba." },
      { lugarId: "losangeles", texto: "Cien kilómetros de luces seguidas: la autopista como vena y el aeropuerto como corazón." },
      { lugarId: "estambul", texto: "Dos continentes encendidos a la vez. El puente parpadea con el tráfico de las 3 de la mañana." },
      { lugarId: "buenosaires", texto: "En el sur, el Río de la Plata brilla con reflejo propio: luz de ciudad, agua y futuro." },
    ],
  },
  {
    id: "orbita", titulo: "LA ÓRBITA DE LOS QUIETOS", lema: "Quién mira desde arriba y para qué",
    paradas: [
      { lugarId: "meridiana", texto: "Empezamos abajo: la Base Meridiana, pista de hielo y radar de banda ancha. Todo lo que sube, pasa por aquí primero." },
      { lugarId: "reikiavik", texto: "El hueco entre Groenlandia y Escocia. Los satélites ELINT lo barren cada noventa minutos." },
      { lugarId: "aurora", texto: "La Torre Aurora escucha lo que la ionosfera tira hacia abajo cuando las auroras golpean." },
      { lugarId: "zenit", texto: "La Cuenca de Zenit: un abismo de referencia para calibrar hidrófonos y sonidos sin nombre." },
      { lugarId: "taiwan", texto: "Sobre el estrecho más fotografiado del siglo, tres constelaciones se pasan el relevo cada órbita." },
      { lugarId: "mar_china", texto: "Cerramos sobre las islas de hormigón: las reclamaciones también se escriben desde el espacio." },
    ],
  },
  {
    id: "acero", titulo: "MAREAS DE ACERO", lema: "Las rutas que mueven el mundo pesado",
    paradas: [
      { lugarId: "malaca", texto: "Todo empieza en el embudo: graneleros, portacontenedores y alguna silueta que no declara calado." },
      { lugarId: "singapur", texto: "La factoría de recaladas: aquí se rellena el buque, el capitán y la garantía." },
      { lugarId: "bombay", texto: "Pesqueros, ferries y una base aeronaval compartiendo bahía. El tráfico más denso del Índico." },
      { lugarId: "caribe", texto: "El mar de las dos historias: cruceros por delante, contrabando por debajo." },
      { lugarId: "panama", texto: "Las esclusas: 81 pies de amplitud que deciden el diseño de cada buque construido desde 1914." },
      { lugarId: "magallanes", texto: "El final del mundo navegable: vientos de cien nudos y capitanes que igualmente cruzan." },
    ],
  },
  {
    id: "hielo", titulo: "LA FRONTERA DEL HIELO", lema: "El norte grande, la última frontera silenciosa",
    paradas: [
      { lugarId: "reikiavik", texto: "El GAP: la franja donde los submarinos desaparecían durante la Guerra Fría. Ahora los escucha un satélite." },
      { lugarId: "estocolmo", texto: "Treinta mil islas y una densidad de radares que ningún mapa turístico confiesa." },
      { lugarId: "baltico", texto: "Fibra rota 'por accidente', buques de bandera dudosa y minas viejas que siguen cobrando peaje." },
      { lugarId: "aurora", texto: "La antena más al norte de Vanguard. Cuando el cielo se enciende, toda la escuadra asciende." },
      { lugarId: "meridiana", texto: "Cerramos en el hielo del sur: la Base Meridiana y el mejor cielo del planeta para mirar hacia arriba." },
      { lugarId: "magallanes", texto: "Y el estrecho que une ambos océanos bajo tres mil kilómetros de viento sin dueño." },
    ],
  },
];

// ---------- analista (pregunta en lenguaje natural, responde el núcleo) ----------
export interface RespuestaAnalista {
  titulo: string;
  lineas: string[];
  vueloA?: { lat: number; lng: number; alt: number };
  resaltar?: string; // id de contacto
}

export type CapasTierra = { aviones: boolean; buques: boolean; satelites: boolean; drones: boolean; sismos: boolean; camaras: boolean };

const AYUDA = [
  "Prueba con: «cuántos contactos hay», «el más rápido», «cuándo pasa un satélite», «riesgo del Valle del Karsk», «llévame a Ormuz» o «buscar Vigía-SAR».",
  "El analista corre en el núcleo neuronal local de Vanguard: cero nube, cero esperas, todo inspeccionable.",
];

export function preguntar(q: string, centro: { lat: number; lng: number }, t: number): RespuestaAnalista {
  const s = normaliza(q);
  const cs = contactosEn(t);

  const tiene = (...palabras: string[]) => palabras.some((p) => s.includes(p));

  // contar
  if (tiene("cuantos", "cuenta", "cuántos", "numero", "número", "how many")) {
    const porTipo = (tp: TipoContacto) => cs.filter((c) => c.tipo === tp).length;
    return {
      titulo: "RECUENTO DE CONTACTOS",
      lineas: [
        `${cs.length} contactos vivos ahora mismo sobre el planeta.`,
        `✈ ${porTipo("avion")} aviones · ⚓ ${porTipo("buque")} buques · 🛰 ${porTipo("satelite")} satélites`,
        `♙ ${porTipo("dron")} drones · ▲ ${porTipo("sismo")} sismos (última hora) · 📷 ${porTipo("camara")} cámaras`,
        "La cuenta cambia cada segundo: el mundo no se queda quieto.",
      ],
    };
  }
  // más rápido
  if (tiene("rapido", "rápido", "veloz", "fastest")) {
    const aviones = cs.filter((c) => c.tipo === "avion");
    const top = aviones.sort((a, b) => b.vel - a.vel)[0];
    return {
      titulo: "EL MÁS RÁPIDO DEL CIELO",
      lineas: [
        `${top.nombre} · ${top.modelo} a ${top.vel} km/h`,
        `Rumbo ${top.rumbo}° a ${top.altKm} km de altitud. ${top.meta[2] ?? ""}`,
        "Pulsa RASTREAR en su ficha para volar con él.",
      ],
      resaltar: top.id,
      vueloA: { lat: top.lat, lng: top.lng, alt: 0.6 },
    };
  }
  // más alto
  if (tiene("mas alto", "más alto", "altitud", "highest", "orbita mas alta")) {
    const sats = cs.filter((c) => c.tipo === "satelite").sort((a, b) => b.altKm - a.altKm);
    const top = sats[0];
    return {
      titulo: "EL MÁS ALTO DE LA ÓRBITA",
      lineas: [
        `${top.nombre} · ${top.modelo} a ${top.altKm} km`,
        `27.600 km/h y ninguna prisa: da la vuelta al planeta en ${90 + (fnvHash(top.nombre) % 35)} minutos.`,
        "Rastrea y acompáñalo de polo a polo.",
      ],
      resaltar: top.id,
      vueloA: { lat: top.lat, lng: top.lng, alt: 2.4 },
    };
  }
  // cercano
  if (tiene("cercano", "cerca", "nearest", "mas proximo")) {
    const terrestres = cs.filter((c) => c.tipo !== "satelite" && c.tipo !== "sismo");
    const top = terrestres.sort((a, b) => distanciaKm(centro.lat, centro.lng, a.lat, a.lng) - distanciaKm(centro.lat, centro.lng, b.lat, b.lng))[0];
    return {
      titulo: "CONTACTO MÁS CERCANO A TU VISTA",
      lineas: [
        `${top.nombre} a ${distanciaKm(centro.lat, centro.lng, top.lat, top.lng).toLocaleString("es")} km del centro de tu cámara.`,
        `${top.clase.toUpperCase()} · ${top.vel} km/h · rumbo ${top.rumbo}°`,
        "La lista de CONTACTOS del panel izquierdo muestra los 30 más próximos.",
      ],
      resaltar: top.id,
      vueloA: { lat: top.lat, lng: top.lng, alt: 0.7 },
    };
  }
  // pases satelitales
  if (tiene("pase", "pasa", "cuando vera", "overflight", "sobrevuela")) {
    const pases = pasesSobre(centro.lat, centro.lng, t, 3);
    if (!pases.length) return { titulo: "SIN PASES PRÓXIMOS", lineas: ["Ningún satélite de la constelación pasa sobre tu vista en los próximos 90 minutos.", ...AYUDA] };
    return {
      titulo: "AGENDA DE PASES SOBRE TU VISTA",
      lineas: pases.map((p) => `${p.sat} (${p.tipo}) en ${cuentaAtras(p.enMs)} · ${p.maxGrados}° de elevación · ${p.durMin} min de ventana`),
      vueloA: { lat: centro.lat, lng: centro.lng, alt: 1.8 },
    };
  }
  // riesgo / veredicto
  if (tiene("riesgo", "tension", "tensión", "veredicto", "analiza", "evalua")) {
    const lugar = LUGARES.find((l) => s.includes(normaliza(l.nombre)));
    if (lugar) {
      const v = evaluarNeuronal(lugar.nota, 3);
      return {
        titulo: `VEREDICTO NEURONAL · ${lugar.nombre.toUpperCase()}`,
        lineas: [
          lugar.nota,
          `Riesgo ${v.riesgo}/100 · Tensión ${v.tension}/100 · Confianza ${v.confianza}/100 → ${v.sentimiento}`,
          `Neuronas activas: ${v.neuronasActivas.length ? v.neuronasActivas.join(", ") : "sin señales temáticas"}.`,
        ],
        vueloA: { lat: lugar.lat, lng: lugar.lng, alt: lugar.alt },
      };
    }
  }
  // llevar a / mostrar
  if (tiene("lleva", "vuela", "ir a", "muestra", "ve a", "take me")) {
    const lugar = buscarLugar(q);
    if (lugar) {
      return {
        titulo: `RUMBO A ${lugar.nombre.toUpperCase()}`,
        lineas: [lugar.nota, "Vuelo cinematográfico iniciado: sujeta el estómago."],
        vueloA: { lat: lugar.lat, lng: lugar.lng, alt: lugar.alt },
      };
    }
  }
  // buscar contacto por llamativo
  const cn = normaliza(q).replace(/[^a-z0-9 ]/g, "");
  const contacto = cs.find((c) => cn.includes(normaliza(c.callsign).replace(/[^a-z0-9]/g, "")) || cn.includes(normaliza(c.nombre).split(" ").slice(-1)[0]));
  if (contacto && q.length > 2) {
    return {
      titulo: `CONTACTO LOCALIZADO · ${contacto.callsign}`,
      lineas: [contacto.nombre, contacto.meta[0] ?? "", contacto.meta[1] ?? ""],
      resaltar: contacto.id,
      vueloA: { lat: contacto.lat, lng: contacto.lng, alt: contacto.tipo === "satelite" ? 2.0 : 0.6 },
    };
  }
  // buscar lugar por nombre
  const lugar = buscarLugar(q);
  if (lugar) {
    return {
      titulo: `FICHA · ${lugar.nombre.toUpperCase()}`,
      lineas: [lugar.nota, `Coordenadas ${lugar.lat.toFixed(2)}, ${lugar.lng.toFixed(2)} · tipo ${lugar.tipo}.`],
      vueloA: { lat: lugar.lat, lng: lugar.lng, alt: lugar.alt },
    };
  }
  return { titulo: "ANALISTA LOCAL LISTO", lineas: AYUDA };
}

export function buscarLugar(q: string): Lugar | undefined {
  const s = normaliza(q);
  let mejor: { l: Lugar; score: number } | null = null;
  for (const l of LUGARES) {
    const n = normaliza(l.nombre);
    if (s.includes(n) || n.includes(s)) {
      const score = n.length;
      if (!mejor || score > mejor.score) mejor = { l, score };
    }
  }
  return mejor?.l;
}

// ---------- viento para la capa de partículas ----------
export function vientoEn(lat: number, lng: number, t: number): { u: number; v: number } {
  // banda de alisios + ruido trigonométrico determinista (sin nube, sin azar)
  const alisio = Math.cos(rad(lat * 2)) * 1.4;
  const u = alisio + Math.sin(rad(lng * 3) + t / 900000) * 0.9 + Math.sin(rad(lat * 5) - t / 700000) * 0.4;
  const v = Math.sin(rad(lat * 4) + t / 1100000) * 0.7 + Math.cos(rad(lng * 2.2) + t / 1300000) * 0.5;
  return { u, v };
}

// ---------- textura por hora UTC (día/noche automático como el Googles) ----------
export function texturaPorHora(t: number): "satelite" | "noche" {
  const h = new Date(t).getUTCHours();
  return h >= 6 && h < 18 ? "satelite" : "noche";
}
