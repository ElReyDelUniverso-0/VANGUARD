// v90.0 ESPEJOS SIN FIN — MOTOR CIBER (espejo del gran mapa de ciberamenazas:
// arcos de ataque entre naciones sobre el mapa oscuro, contadores rodando,
// ranking de orígenes y objetivos, feed de intrusión). Todo ficticio y propio
// del mundo Vanguard.

import { fnv89 } from "./pulsos-data";

export interface NacionCiber {
  id: string;
  nombre: string;
  bandera: string;
  lat: number;
  lng: number;
  rol: "ORIGEN" | "OBJETIVO" | "AMBOS";
  peso: number; // 0..1 frecuencia
}

// naciones ficticias del mundo Vanguard con coordenadas plausibles
export const NACIONES_CIBER: NacionCiber[] = [
  { id: "fednord", nombre: "Federación Nórdica", bandera: "🇳🇮", lat: 55.7, lng: 37.6, rol: "AMBOS", peso: 0.95 },
  { id: "uniatl", nombre: "Unión Atlántica", bandera: "🇺🇦", lat: 38.9, lng: -77.0, rol: "AMBOS", peso: 0.9 },
  { id: "impcen", nombre: "Imperio Central", bandera: "🇨🇳", lat: 39.9, lng: 116.4, rol: "AMBOS", peso: 0.92 },
  { id: "donalto", nombre: "República del Donalto", bandera: "🇺🇸", lat: 50.45, lng: 30.5, rol: "OBJETIVO", peso: 0.85 },
  { id: "ormuz", nombre: "Sultanato de Ormuz", bandera: "🇮🇷", lat: 35.7, lng: 51.4, rol: "AMBOS", peso: 0.7 },
  { id: "taiping", nombre: "Isla de Taiping", bandera: "🇹🇼", lat: 25.0, lng: 121.5, rol: "OBJETIVO", peso: 0.75 },
  { id: "bosforo", nombre: "República del Bósforo", bandera: "🇹🇷", lat: 39.9, lng: 32.9, rol: "AMBOS", peso: 0.6 },
  { id: "subcon", nombre: "Unión del Subcontinente", bandera: "🇮🇳", lat: 28.6, lng: 77.2, rol: "AMBOS", peso: 0.65 },
  { id: "indus", nombre: "Estado del Indus", bandera: "🇵🇰", lat: 33.7, lng: 73.1, rol: "AMBOS", peso: 0.55 },
  { id: "hermita", nombre: "Reino Hermitano", bandera: "🇰🇵", lat: 39.0, lng: 125.8, rol: "ORIGEN", peso: 0.7 },
  { id: "levante", nombre: "Confederación del Levante", bandera: "🇱🇧", lat: 33.9, lng: 35.5, rol: "AMBOS", peso: 0.5 },
  { id: "sahel", nombre: "Bloque del Sahel", bandera: "🇲🇱", lat: 12.6, lng: -8.0, rol: "AMBOS", peso: 0.4 },
  { id: "vanguard", nombre: "Red Vanguard (comunidad)", bandera: "🛡️", lat: 48.85, lng: 2.35, rol: "OBJETIVO", peso: 0.8 },
];

export interface TipoAtaque {
  id: string;
  nombre: string;
  color: string;
}

export const TIPOS_ATAQUE: TipoAtaque[] = [
  { id: "ddos", nombre: "DDoS", color: "#FF4D4D" },
  { id: "malware", nombre: "Malware", color: "#FF8A3D" },
  { id: "intrusion", nombre: "Intrusión", color: "#FFD23D" },
  { id: "phishing", nombre: "Phishing", color: "#B48CFF" },
  { id: "ransomware", nombre: "Ransomware", color: "#4DFFC4" },
  { id: "desfig", nombre: "Desfiguración", color: "#FF6BC1" },
];

export interface SectorObjetivo {
  id: string;
  nombre: string;
  emoji: string;
}

export const SECTORES: SectorObjetivo[] = [
  { id: "energia", nombre: "Energía", emoji: "⚡" },
  { id: "banco", nombre: "Banca", emoji: "🏦" },
  { id: "gobierno", nombre: "Gobierno", emoji: "🏛️" },
  { id: "medios", nombre: "Medios", emoji: "📰" },
  { id: "ferrocarril", nombre: "Ferrocarril", emoji: "🚆" },
  { id: "puerto", nombre: "Puertos", emoji: "⚓" },
  { id: "salud", nombre: "Salud", emoji: "🏥" },
];

export interface Ataque {
  id: string;
  origen: NacionCiber;
  objetivo: NacionCiber;
  tipo: TipoAtaque;
  sector: SectorObjetivo;
  intensidad: number; // 1-5
  ts: number;
  durMs: number; // duración del arco animado
}

export interface EstadoCiber {
  ataques: Ataque[]; // vivos en este instante
  totalHoy: number;
  porTipo: { tipo: TipoAtaque; n: number }[];
  topObjetivos: { nacion: NacionCiber; n: number }[];
  topOrigenes: { nacion: NacionCiber; n: number }[];
  defconCiber: number; // 1-5
 sectores: { sector: SectorObjetivo; n: number }[];
}

function r(seed: string, salt: number): number {
  const h = parseInt(fnv89(seed + ":" + salt).slice(0, 7), 36);
  return (h % 100000) / 100000;
}

function pickNacion(seed: string, salt: number, filtro: (n: NacionCiber) => boolean): NacionCiber {
  const pool = NACIONES_CIBER.filter(filtro);
  const pesos = pool.map((n) => n.peso);
  const total = pesos.reduce((a, b) => a + b, 0);
  let t = r(seed, salt) * total;
  for (let i = 0; i < pool.length; i++) {
    t -= pesos[i];
    if (t <= 0) return pool[i];
  }
  return pool[0];
}

/**
 * Estado ciber en el instante dado. Ventanas de 4 s: en cada ventana viven
 * 6-11 ataques simultáneos; el contador diario es determinista por hora.
 */
export function generarCiber(ahora = Date.now()): EstadoCiber {
  const paso = 4000;
  const win = Math.floor(ahora / paso);
  const seedWin = "ciber90:" + win;
  const n = 6 + Math.floor(r(seedWin, 0) * 6);
  const ataques: Ataque[] = [];

  for (let i = 0; i < n; i++) {
    const seed = `${seedWin}:${i}`;
    let origen = pickNacion(seed, 10, (x) => x.rol !== "OBJETIVO");
    let objetivo = pickNacion(seed, 20, (x) => x.id !== origen.id && x.rol !== "ORIGEN");
    if (r(seed, 21) < 0.22) {
      const tmp = origen;
      origen = objetivo; objetivo = tmp; // contraataques invertidos
    }
    const ti = Math.floor(r(seed, 30) * 100);
    const tipo =
      ti < 30 ? TIPOS_ATAQUE[0] : ti < 52 ? TIPOS_ATAQUE[1] : ti < 70 ? TIPOS_ATAQUE[2] : ti < 84 ? TIPOS_ATAQUE[3] : ti < 94 ? TIPOS_ATAQUE[4] : TIPOS_ATAQUE[5];
    const sector = SECTORES[Math.floor(r(seed, 40) * SECTORES.length)];
    const intensidad = 1 + Math.floor(r(seed, 50) * 5);
    const ts = win * paso + Math.floor(r(seed, 60) * paso);
    ataques.push({
      id: `a${win.toString(36)}${i}`,
      origen, objetivo, tipo, sector, intensidad, ts,
      durMs: 1800 + Math.floor(r(seed, 70) * 1600),
    });
  }

  // contadores deterministas por hora (24 tramos de 5 min ya vividos)
  const hora = Math.floor(ahora / 3600_000);
  const seedHora = "ciberh90:" + hora;
  const totalHoy = 6400 + Math.floor(r(seedHora, 0) * 5100);

  const porTipo = TIPOS_ATAQUE.map((t, i) => ({
    tipo: t,
    n: Math.floor(totalHoy * (0.09 + r(seedHora, 10 + i) * 0.16)),
  })).sort((a, b) => b.n - a.n);

  const targetPool = NACIONES_CIBER.filter((x) => x.rol !== "ORIGEN");
  const topObjetivos = targetPool
    .map((x, i) => ({ nacion: x, n: Math.floor(totalHoy * 0.22 * (x.peso + r(seedHora, 30 + i) * 0.2)) }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);

  const originPool = NACIONES_CIBER.filter((x) => x.rol !== "OBJETIVO");
  const topOrigenes = originPool
    .map((x, i) => ({ nacion: x, n: Math.floor(totalHoy * 0.24 * (x.peso + r(seedHora, 50 + i) * 0.2)) }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);

  const sectores = SECTORES.map((s, i) => ({
    sector: s,
    n: Math.floor(totalHoy * (0.06 + r(seedHora, 70 + i) * 0.13)),
  })).sort((a, b) => b.n - a.n);

  // DEFCON ciber: intensidad media viva + hora pico
  const mediaInt = ataques.reduce((a, b) => a + b.intensidad, 0) / Math.max(1, ataques.length);
  const defcon = Math.max(1, Math.min(5, Math.round(mediaInt * 0.9 + r(seedHora, 80) * 1.4)));

  return { ataques, totalHoy, porTipo, topObjetivos, topOrigenes, defconCiber: defcon, sectores };
}

export function rutasDeAtaques(ataques: Ataque[]) {
  return ataques.map((a) => ({
    id: a.id,
    from: [a.origen.lat, a.origen.lng] as [number, number],
    to: [a.objetivo.lat, a.objetivo.lng] as [number, number],
    color: a.tipo.color,
    label: `${a.origen.bandera}→${a.objetivo.bandera} ${a.tipo.nombre}`,
  }));
}
