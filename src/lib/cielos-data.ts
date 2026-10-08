// v90.0 ESPEJOS SIN FIN — MOTOR CIELOS (espejo del gran rastreador de vuelos:
// lista lateral con llamadas/tipo/altitud/velocidad, mapa con pines en vivo y
// ficha del vuelo; mecánica propia "el transpondedor se apaga"). Rutas y datos
// ficticios del mundo Vanguard.

import { fnv89 } from "./pulsos-data";
import { projectLatLng } from "@/components/vanguard/world-map-svg";

export interface VueloTipo {
  id: string;
  nombre: string;
  color: string;
  emoji: string;
}

export const VUELO_TIPOS: VueloTipo[] = [
  { id: "isr", nombre: "Reconocimiento (ISR)", color: "#3DDCFF", emoji: "🛰️" },
  { id: "bombardeo", nombre: "Bombardeo estratégico", color: "#FF4D4D", emoji: "🎯" },
  { id: "caza", nombre: "Caza / escolta", color: "#FFD23D", emoji: "✈️" },
  { id: "transporte", nombre: "Transporte / repostaje", color: "#9AE04D", emoji: "🛬" },
  { id: "dron", nombre: "Dron armado (MALE)", color: "#B48CFF", emoji: "🛸" },
  { id: "aew", nombre: "Alerta temprana (AEW&C)", color: "#4DFFC4", emoji: "📡" },
];

export interface ModeloVuelo {
  modelo: string;
  tipo: string; // id de VUELO_TIPOS
  velCrucero: number; // kt
  techo: number; // ft
}

// modelos ficticios del mundo Vanguard (cifras plausibles, nombres propios)
const MODELOS: ModeloVuelo[] = [
  { modelo: "RX-8 CENTINELA", tipo: "isr", velCrucero: 410, techo: 50000 },
  { modelo: "PZ-12 ALBATROS", tipo: "isr", velCrucero: 390, techo: 42000 },
  { modelo: "BS-99 TITÁN", tipo: "bombardeo", velCrucero: 480, techo: 45000 },
  { modelo: "BS-160 SOMBRÍO", tipo: "bombardeo", velCrucero: 520, techo: 51000 },
  { modelo: "FG-22 ESPEJO", tipo: "caza", velCrucero: 560, techo: 60000 },
  { modelo: "FG-44 BORER", tipo: "caza", velCrucero: 540, techo: 58000 },
  { modelo: "TR-77 MULA", tipo: "transporte", velCrucero: 310, techo: 33000 },
  { modelo: "RA-3 PIRAÑA", tipo: "dron", velCrucero: 195, techo: 27000 },
  { modelo: "RA-9 LAGARTO", tipo: "dron", velCrucero: 180, techo: 25000 },
  { modelo: "AT-66 FARO", tipo: "aew", velCrucero: 330, techo: 38000 },
];

interface BaseVuelo {
  base: string;
  faccion: string;
  lat: number;
  lng: number;
}

const BASES: BaseVuelo[] = [
  { base: "Gradoval-Centro", faccion: "FEDERACIÓN NÓRDICA", lat: 55.7, lng: 37.6 },
  { base: "Chkalovski Norte", faccion: "FEDERACIÓN NÓRDICA", lat: 59.8, lng: 30.3 },
  { base: "Puerto Alba-Anexo", faccion: "UNIÓN ATLÁNTICA", lat: 36.9, lng: -76.3 },
  { base: "Kadena del Pacífico", faccion: "UNIÓN ATLÁNTICA", lat: 26.4, lng: 127.8 },
  { base: "Akrotiri Sur", faccion: "COALICIÓN", lat: 34.6, lng: 32.99 },
  { base: "Bandar Sable Oeste", faccion: "SULTANATO DE ORMUZ", lat: 27.2, lng: 56.3 },
  { base: "Ciudad Espejo-Este", faccion: "IMPERIO CENTRAL", lat: 24.0, lng: 118.0 },
  { base: "Yamunagar Central", faccion: "UNIÓN DEL SUBCONTINENTE", lat: 28.6, lng: 77.2 },
  { base: "Raviabad Norte", faccion: "ESTADO DEL INDUS", lat: 33.7, lng: 73.1 },
];

interface ObjetivoVuelo {
  zona: string;
  lat: number;
  lng: number;
  duracionH: number; // horas que dura el patrullaje
}

const OBJETIVOS: ObjetivoVuelo[] = [
  { zona: "Báltico", lat: 57.2, lng: 19.8, duracionH: 6 },
  { zona: "Kaliningrado", lat: 54.7, lng: 20.5, duracionH: 4 },
  { zona: "Valle del Karsk", lat: 48.0, lng: 37.8, duracionH: 5 },
  { zona: "Bab el-Mandeb", lat: 12.6, lng: 43.4, duracionH: 7 },
  { zona: "Ormuz", lat: 26.6, lng: 56.3, duracionH: 6 },
  { zona: "Estrecho de Taiping", lat: 24.4, lng: 119.6, duracionH: 8 },
  { zona: "Línea de Control", lat: 34.1, lng: 74.4, duracionH: 5 },
  { zona: "Cabo Norte", lat: 71.0, lng: 29.0, duracionH: 9 },
  { zona: "Mar de China Meridional", lat: 12.2, lng: 113.4, duracionH: 8 },
  { zona: "DMZ de Corea", lat: 38.0, lng: 127.0, duracionH: 6 },
];

const PREFIJOS: Record<string, string[]> = {
  "FEDERACIÓN NÓRDICA": ["RFD", "GLM", "NRD"],
  "UNIÓN ATLÁNTICA": ["RCH", "VLG", "ATL"],
  COALICIÓN: ["GDM", "TF4"],
  "SULTANATO DE ORMUZ": ["BSR", "ORM"],
  "IMPERIO CENTRAL": ["PLA", "CEN"],
  "UNIÓN DEL SUBCONTINENTE": ["SBC", "IND"],
  "ESTADO DEL INDUS": ["PAX", "IND2"],
};

export interface Vuelo {
  id: string;
  callsign: string;
  modelo: string;
  tipo: string;
  faccion: string;
  base: string;
  zona: string;
  lat: number;
  lng: number;
  rumbo: number; // grados
  alt: number; // ft
  vel: number; // kt
  oscuro: boolean; // transpondedor apagado
  progreso: number; // 0..1 del ciclo de patrulla
  seedNum: number;
}

function r(seed: string, salt: number): number {
  const h = parseInt(fnv89(seed + ":" + salt).slice(0, 7), 36);
  return (h % 100000) / 100000;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// órbita de patrulla: circula alrededor del objetivo en elipse
function orbita(base: BaseVuelo, obj: ObjetivoVuelo, fase: number, wobble: number): { lat: number; lng: number; rumbo: number } {
  const a = 1.6 + wobble * 1.4; // semieje lat
  const b = 2.2 + wobble * 1.8; // semieje lng
  const ang = fase * Math.PI * 2;
  const lat = obj.lat + Math.sin(ang) * a * (0.6 + wobble * 0.5);
  const lng = obj.lng + Math.cos(ang) * b;
  // rumbo tangente (derivada de la elipse, sentido horario)
  const dLat = Math.cos(ang) * a;
  const dLng = -Math.sin(ang) * b;
  let rumbo = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  if (rumbo < 0) rumbo += 360;
  return { lat, lng, rumbo };
}

export interface VuelosTick {
  vuelos: Vuelo[];
  enAire: number;
  oscuros: number;
}

/**
 * Estado del cielo en el instante dado. Los VUELOS se sortean una vez por día
 * (determinista); la posición evoluciona con el tiempo (ciclo de patrulla).
 */
export function generarCielos(ahora = Date.now()): VuelosTick {
  const dia = Math.floor(ahora / 86400_000);
  const seedDia = "cielos90:" + dia;
  const n = 12 + Math.floor(r(seedDia, 0) * 4); // 12-15 vuelos
  const vuelos: Vuelo[] = [];
  let oscuros = 0;

  for (let i = 0; i < n; i++) {
    const seed = `${seedDia}:${i}`;
    const m = MODELOS[Math.floor(r(seed, 1) * MODELOS.length)];
    const base = BASES[Math.floor(r(seed, 2) * BASES.length)];
    const obj = OBJETIVOS[Math.floor(r(seed, 3) * OBJETIVOS.length)];
    const prefijo = (PREFIJOS[base.faccion] ?? ["VGX"])[Math.floor(r(seed, 4) * (PREFIJOS[base.faccion]?.length ?? 1))];
    const num = 100 + Math.floor(r(seed, 5) * 899);
    const cicloH = obj.duracionH + r(seed, 6) * 2;
    const fase = ((ahora / 3600_000) / cicloH + r(seed, 7)) % 1;
    const pos = orbita(base, obj, fase, r(seed, 8));
    // el transpondedor se apaga: más probable en bombarderos y drones
    const probDark = m.tipo === "bombardeo" ? 0.42 : m.tipo === "dron" ? 0.3 : m.tipo === "isr" ? 0.18 : 0.1;
    const oscuro = r(seed, 9) < probDark && fase > 0.25 && fase < 0.75;
    if (oscuro) oscuros++;

    vuelos.push({
      id: `v${dia.toString(36)}${i}`,
      callsign: `${prefijo}${num}`,
      modelo: m.modelo,
      tipo: m.tipo,
      faccion: base.faccion,
      base: base.base,
      zona: obj.zona,
      lat: pos.lat,
      lng: pos.lng,
      rumbo: Math.round(pos.rumbo),
      alt: Math.round(m.techo * (0.72 + r(seed, 10) * 0.26)),
      vel: Math.round(m.velCrucero * (0.85 + r(seed, 11) * 0.3)),
      oscuro,
      progreso: fase,
      seedNum: i,
    });
  }
  return { vuelos, enAire: vuelos.length, oscuros };
}

export function tipoDe(id: string): VueloTipo {
  return VUELO_TIPOS.find((t) => t.id === id) ?? VUELO_TIPOS[0];
}

export function pingsDeVuelos(vuelos: Vuelo[]) {
  return vuelos.map((v) => ({
    id: v.id,
    lat: v.lat,
    lng: v.lng,
    color: v.oscuro ? "#FF4D4D" : tipoDe(v.tipo).color,
    tipo: "AVION_MIL" as const,
    etiqueta: v.oscuro ? "SIN SEÑAL" : v.callsign,
  }));
}

export function rutasDeVuelos(vuelos: Vuelo[]) {
  // estelas: del objetivo hacia el avión (trayecto ya recorrido, simbólico)
  return vuelos
    .filter((v) => !v.oscuro)
    .slice(0, 10)
    .map((v) => {
      const obj = OBJETIVOS.find((o) => o.zona === v.zona) ?? OBJETIVOS[0];
      return {
        id: "tr-" + v.id,
        from: [v.lat, v.lng] as [number, number],
        to: [obj.lat, obj.lng] as [number, number],
        color: tipoDe(v.tipo).color,
        label: v.callsign,
      };
    });
}

// proyección XY para overlays propios (flecha de rumbo en el mapa grande)
export function xyDe(v: Vuelo): { x: number; y: number; ang: number } {
  const p = projectLatLng(v.lat, v.lng);
  return { x: p.x, y: p.y, ang: v.rumbo };
}

export function fmtRumbo(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return `${dirs[Math.round(deg / 22.5) % 16]} ${Math.round(deg)}°`;
}

export function fmtAlt(ft: number): string {
  return `${(ft / 1000).toFixed(1)}k ft`;
}
