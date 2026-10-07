// v86.0 CENTINELA GLOBAL — CAPAS TÁCTICAS
// Datos geográficos reales (lat/lng) para las capas conmutables del mapa:
// bases militares, oleoductos/gasoductos, zonas de exclusión aérea, bloqueos
// navales y densidad de población. El usuario enciende y apaga cada capa.

import type { CapaTactica } from "@/components/vanguard/world-map-svg";

export interface DefCapa {
  id: string;
  nombre: string;
  desc: string;
  color: string;
  items: CapaTactica[];
}

// ---------- BASES MILITARES (públicamente conocidas) ----------
const BASES: CapaTactica[] = [
  { id: "b-ramstein", tipo: "BASE", nombre: "RAMSTEIN", lat: 49.44, lng: 7.6, color: "#00FF87" },
  { id: "b-incirlik", tipo: "BASE", nombre: "INCIRLIK", lat: 37.0, lng: 35.42, color: "#00FF87" },
  { id: "b-aludeid", tipo: "BASE", nombre: "AL UDEID", lat: 25.12, lng: 51.31, color: "#00FF87" },
  { id: "b-diegogarcia", tipo: "BASE", nombre: "DIEGO GARCIA", lat: -7.31, lng: 72.41, color: "#00FF87" },
  { id: "b-rota", tipo: "BASE", nombre: "ROTA", lat: 36.64, lng: -6.35, color: "#00FF87" },
  { id: "b-napoles", tipo: "BASE", nombre: "NÁPOLES", lat: 40.85, lng: 14.27, color: "#00FF87" },
  { id: "b-souda", tipo: "BASE", nombre: "SOUDA BAY", lat: 35.53, lng: 24.15, color: "#00FF87" },
  { id: "b-kaliningrado", tipo: "BASE", nombre: "KALININGRADO", lat: 54.71, lng: 20.51, color: "#FF4655" },
  { id: "b-sebastopol", tipo: "BASE", nombre: "SEBASTÓPOL", lat: 44.62, lng: 33.53, color: "#FF4655" },
  { id: "b-tartus", tipo: "BASE", nombre: "TARTUS", lat: 34.9, lng: 35.87, color: "#FF4655" },
  { id: "b-hmeimim", tipo: "BASE", nombre: "HMEIMIM", lat: 35.4, lng: 35.95, color: "#FF4655" },
  { id: "b-djibouti", tipo: "BASE", nombre: "DJIBOUTI (CN)", lat: 11.55, lng: 43.15, color: "#FF4655" },
  { id: "b-gwadar", tipo: "BASE", nombre: "GWADAR", lat: 25.12, lng: 62.32, color: "#FFB020" },
  { id: "b-djibouti-us", tipo: "BASE", nombre: "CAMP LEMONNIER", lat: 11.54, lng: 43.14, color: "#00FF87" },
  { id: "b-yokosuka", tipo: "BASE", nombre: "YOKOSUKA", lat: 35.29, lng: 139.67, color: "#00FF87" },
  { id: "b-guam", tipo: "BASE", nombre: "ANDERSEN", lat: 13.58, lng: 144.92, color: "#00FF87" },
  { id: "b-kadena", tipo: "BASE", nombre: "KADENA", lat: 26.35, lng: 127.77, color: "#00FF87" },
  { id: "b-murmansk", tipo: "BASE", nombre: "SEVEROMORSK", lat: 69.07, lng: 33.42, color: "#FF4655" },
];

// ---------- ENERGÍA (oleoductos / gasoductos) ----------
const ENERGIA: CapaTactica[] = [
  {
    id: "e-druzhba", tipo: "ENERGIA", nombre: "OLEODUCTO DRUZHBA", color: "#FFB020",
    puntos: [[54.7, 39.7], [53.9, 32.0], [51.5, 24.0], [49.8, 19.0], [48.5, 15.5], [47.5, 9.2]],
  },
  {
    id: "e-turkstream", tipo: "ENERGIA", nombre: "TURKSTREAM", color: "#FFB020",
    puntos: [[43.6, 33.5], [43.2, 31.5], [42.0, 29.2], [41.2, 28.9]],
  },
  {
    id: "e-bluestream", tipo: "ENERGIA", nombre: "BLUE STREAM", color: "#FFB020",
    puntos: [[44.6, 37.8], [43.4, 36.0], [41.9, 35.2], [41.0, 31.4]],
  },
  {
    id: "e-qatar", tipo: "ENERGIA", nombre: "RUTA LNG QATAR", color: "#FFB020",
    puntos: [[25.9, 51.5], [24.5, 57.0], [20.0, 60.5], [12.8, 43.3], [12.5, 32.5], [30.0, 25.0], [36.0, 14.0]],
  },
  {
    id: "e-baku", tipo: "ENERGIA", nombre: "BTC · BAKU-TBILISI-CEYHAN", color: "#FFB020",
    puntos: [[40.4, 49.9], [41.7, 44.8], [41.5, 43.5], [40.5, 41.0], [39.8, 38.5], [36.8, 35.9]],
  },
  {
    id: "e-arabia", tipo: "ENERGIA", nombre: "EAST-WEST · ARABIA", color: "#FFB020",
    puntos: [[26.0, 50.0], [25.5, 45.0], [24.8, 40.0], [24.0, 37.0]],
  },
];

// ---------- ZONAS DE EXCLUSIÓN AÉREA ----------
const EXCLUSIONES: CapaTactica[] = [
  { id: "x-ucrania", tipo: "EXCLUSION", nombre: "UKRAINE TSA", lat: 49.0, lng: 31.5 },
  { id: "x-kaliningrado", tipo: "EXCLUSION", nombre: "KALININGRADO", lat: 54.71, lng: 20.51 },
  { id: "x-taiwan-strait", tipo: "EXCLUSION", nombre: "MEDIANERA", lat: 24.5, lng: 119.6 },
  { id: "x-mar-rojo", tipo: "EXCLUSION", nombre: "MAR ROJO NORTE", lat: 19.5, lng: 38.5 },
  { id: "x-ormuz", tipo: "EXCLUSION", nombre: "ORMUZ ADIZ", lat: 26.6, lng: 56.25 },
  { id: "x-libia", tipo: "EXCLUSION", nombre: "TRIPOLI FIR", lat: 32.0, lng: 17.5 },
  { id: "x-corea", tipo: "EXCLUSION", nombre: "KOREA EAST", lat: 39.5, lng: 128.5 },
];

// ---------- BLOQUEOS / AMENAZAS NAVALES ----------
const BLOQUEOS: CapaTactica[] = [
  { id: "n-mandeb", tipo: "BLOQUEO", nombre: "BAB EL-MANDEB", lat: 12.58, lng: 43.33, color: "#FF4655" },
  { id: "n-ormuz", tipo: "BLOQUEO", nombre: "ESTRECHO DE ORMUZ", lat: 26.57, lng: 56.25, color: "#FF4655" },
  { id: "n-malaca", tipo: "BLOQUEO", nombre: "ESTRECHO DE MALACA", lat: 2.5, lng: 101.4, color: "#FFB020" },
  { id: "n-gaza", tipo: "BLOQUEO", nombre: "COSTA DE GAZA", lat: 31.5, lng: 34.3, color: "#FF4655" },
  { id: "n-mar-negro", tipo: "BLOQUEO", nombre: "CORREDOR DE GRANO", lat: 44.8, lng: 31.4, color: "#FFB020" },
  { id: "n-baltico", tipo: "BLOQUEO", nombre: "BÁLTICO · FLOTA FANTASMA", lat: 57.5, lng: 19.5, color: "#FFB020" },
  { id: "n-taiwan", tipo: "BLOQUEO", nombre: "ESTRECHO DE TAIWÁN", lat: 24.5, lng: 120.3, color: "#FFB020" },
];

// ---------- DENSIDAD DE POBLACIÓN (megaciudades) ----------
const POBLACION: CapaTactica[] = [
  { id: "p-delhi", tipo: "POBLACION", nombre: "Delhi", lat: 28.6, lng: 77.2 },
  { id: "p-shanghai", tipo: "POBLACION", nombre: "Shanghái", lat: 31.2, lng: 121.5 },
  { id: "p-saopaulo", tipo: "POBLACION", nombre: "São Paulo", lat: -23.55, lng: -46.63 },
  { id: "p-cdmx", tipo: "POBLACION", nombre: "CDMX", lat: 19.43, lng: -99.13 },
  { id: "p-cairo", tipo: "POBLACION", nombre: "El Cairo", lat: 30.04, lng: 31.24 },
  { id: "p-dhaka", tipo: "POBLACION", nombre: "Daca", lat: 23.81, lng: 90.41 },
  { id: "p-mumbai", tipo: "POBLACION", nombre: "Bombay", lat: 19.08, lng: 72.88 },
  { id: "p-pekin", tipo: "POBLACION", nombre: "Pekín", lat: 39.9, lng: 116.4 },
  { id: "p-osaka", tipo: "POBLACION", nombre: "Osaka", lat: 34.69, lng: 135.5 },
  { id: "p-nueva-york", tipo: "POBLACION", nombre: "Nueva York", lat: 40.71, lng: -74.01 },
  { id: "p-karachi", tipo: "POBLACION", nombre: "Karachi", lat: 24.86, lng: 67.01 },
  { id: "p-estambul", tipo: "POBLACION", nombre: "Estambul", lat: 41.01, lng: 28.98 },
  { id: "p-lagos", tipo: "POBLACION", nombre: "Lagos", lat: 6.52, lng: 3.38 },
  { id: "p-teheran", tipo: "POBLACION", nombre: "Teherán", lat: 35.69, lng: 51.39 },
  { id: "p-moscu", tipo: "POBLACION", nombre: "Moscú", lat: 55.76, lng: 37.62 },
  { id: "p-londres", tipo: "POBLACION", nombre: "Londres", lat: 51.51, lng: -0.13 },
  { id: "p-seul", tipo: "POBLACION", nombre: "Seúl", lat: 37.57, lng: 126.98 },
  { id: "p-jakarta", tipo: "POBLACION", nombre: "Yakarta", lat: -6.21, lng: 106.85 },
  { id: "p-manila", tipo: "POBLACION", nombre: "Manila", lat: 14.6, lng: 120.98 },
  { id: "p-riyadh", tipo: "POBLACION", nombre: "Riad", lat: 24.71, lng: 46.68 },
  { id: "p-kyiv", tipo: "POBLACION", nombre: "Kiev", lat: 50.45, lng: 30.52 },
  { id: "p-taipei", tipo: "POBLACION", nombre: "Taipéi", lat: 25.03, lng: 121.57 },
];

export const CAPAS_TACTICAS: DefCapa[] = [
  { id: "bases", nombre: "Bases militares", desc: "18 bases públicas de EE.UU., Rusia y China", color: "#00FF87", items: BASES },
  { id: "energia", nombre: "Oleoductos y gas", desc: "Druzhba, TurkStream, BTC, rutas LNG", color: "#FFB020", items: ENERGIA },
  { id: "exclusiones", nombre: "Exclusión aérea", desc: "7 espacios aéreos restringidos u hostiles", color: "#FF4655", items: EXCLUSIONES },
  { id: "bloqueos", nombre: "Bloqueos navales", desc: "7 gargantas y corredores amenazados", color: "#38BDF8", items: BLOQUEOS },
  { id: "poblacion", nombre: "Megaciudades", desc: "22 centros urbanos sobre el tablero", color: "#C084FC", items: POBLACION },
];

export function capasActivas(ids: Set<string>): CapaTactica[] {
  const out: CapaTactica[] = [];
  for (const d of CAPAS_TACTICAS) {
    if (ids.has(d.id)) out.push(...d.items);
  }
  return out;
}
