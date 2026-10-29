// v90.0 ESPEJOS SIN FIN — MOTOR SISMO (espejo del gran monitor sísmico global:
// feed de temblores con magnitud/profundidad, mapa con anillos, sismógrafo
// dibujando en vivo y detección de detonaciones sospechosas — lección
// educativa de vigilancia de pruebas nucleares). Eventos ficticios plausibles
// del mundo Vanguard; zonas sísmicas reales donde habita el resto del juego.

import { fnv89 } from "./pulsos-data";

export interface ZonaSismica {
  nombre: string;
  lat: number;
  lng: number;
  spread: number;
  actividad: number; // 0..1 base de actividad tectónica
  sitioPrueba?: boolean; // zona histórica de ensayos (para detección)
}

export const ZONAS_SISMICAS: ZonaSismica[] = [
  { nombre: "Cinturón de Fuego — Kuriles", lat: 46.6, lng: 152.3, spread: 2.2, actividad: 0.95 },
  { nombre: "Japón — Fosa de Nankai", lat: 33.4, lng: 136.8, spread: 1.8, actividad: 0.92 },
  { nombre: "Filipinas — Fosa de Manila", lat: 14.6, lng: 121.2, spread: 1.8, actividad: 0.85 },
  { nombre: "Sumatra — Megathrust", lat: -0.7, lng: 100.4, spread: 2.4, actividad: 0.9 },
  { nombre: "Chile — Fosa Peruano-Chilena", lat: -30.1, lng: -71.3, spread: 2.0, actividad: 0.88 },
  { nombre: "California — San Andreas", lat: 35.8, lng: -117.6, spread: 1.2, actividad: 0.7 },
  { nombre: "Alaska — Subducción", lat: 58.6, lng: -152.4, spread: 2.0, actividad: 0.86 },
  { nombre: "Turquía — Falla de Anatolia", lat: 39.0, lng: 35.4, spread: 1.6, actividad: 0.8 },
  { nombre: "Irán — Cinturón Alpino", lat: 32.4, lng: 53.7, spread: 2.0, actividad: 0.82 },
  { nombre: "Himalaya — Frente de empuje", lat: 28.2, lng: 84.5, spread: 2.0, actividad: 0.84 },
  { nombre: "Italia — Apeninos", lat: 42.5, lng: 13.2, spread: 1.0, actividad: 0.55 },
  { nombre: "Grecia — Arco Hélade", lat: 37.5, lng: 22.0, spread: 1.2, actividad: 0.62 },
  { nombre: "Sitos de prueba — Novaya", lat: 73.4, lng: 54.9, spread: 0.6, actividad: 0.08, sitioPrueba: true },
  { nombre: "Sitos de prueba — Lop Nur", lat: 41.6, lng: 88.7, spread: 0.6, actividad: 0.06, sitioPrueba: true },
  { nombre: "Sitos de prueba — Punggye", lat: 41.3, lng: 129.1, spread: 0.5, actividad: 0.07, sitioPrueba: true },
  { nombre: "Sitos de prueba — Nevada", lat: 37.1, lng: -116.1, spread: 0.5, actividad: 0.05, sitioPrueba: true },
];

export interface Temblor {
  id: string;
  zona: string;
  lat: number;
  lng: number;
  mag: number; // 1.0 - 7.9
  profundidad: number; // km
  ts: number;
  sospechoso: boolean; // detonación de prueba documentada
  estacion: string;
}

export interface EstadoSismo {
  temblores: Temblor[];
  hoy: number;
  mayor: Temblor | null;
  sospechosas: Temblor[];
  energias: number; // % de energía media anual liberada a la fecha
}

export const ESTACIONES = ["VGA-NORTE", "VGA-SUR", "VGA-ARTICA", "VGA-INDICO", "VGA-PACIFICO", "VGA-ATLANTICO"];

function r(seed: string, salt: number): number {
  const h = parseInt(fnv89(seed + ":" + salt).slice(0, 7), 36);
  return (h % 100000) / 100000;
}

/**
 * Temblores de la ventana dada. Determinista por tramos de 10 min.
 * Magnitudes con ley Gutenberg-Richter aproximada: muchos pequeños, pocos grandes.
 */
export function generarSismos(ventanaMs: number, ahora = Date.now()): EstadoSismo {
  const paso = 10 * 60 * 1000;
  const tramoAhora = Math.floor(ahora / paso);
  const tramos = Math.ceil(ventanaMs / paso);
  const out: Temblor[] = [];

  for (let t = tramos - 1; t >= 0; t--) {
    const tramo = tramoAhora - t;
    const seed = "sismo90:" + tramo;
    // 1-4 temblores por tramo
    const n = 1 + Math.floor(r(seed, 0) * 4);
    for (let i = 0; i < n; i++) {
      const sSeed = `${seed}:${i}`;
      const zPool: ZonaSismica[] = [];
      for (const z of ZONAS_SISMICAS) {
        const veces = Math.max(1, Math.round(z.actividad * 5));
        for (let k = 0; k < veces; k++) zPool.push(z);
      }
      const zona = zPool[Math.floor(r(sSeed, 1) * zPool.length)];
      // Gutenberg-Richter: b=1 sobre 1.0
      const mag = +(1.0 - Math.log10(1 - r(sSeed, 2) * 0.996)).toFixed(1);
      const profundidad = Math.round(5 + Math.pow(r(sSeed, 3), 2.2) * 640);
      const ts = tramo * paso + Math.floor(r(sSeed, 4) * paso);
      if (ts > ahora) continue;
      const esPrueba = !!zona.sitioPrueba;
      // detonación sospechosa: sitio de prueba + somero + mag en rango de explosión
      const sospechoso = esPrueba && profundidad < 12 && mag >= 2.8 && mag <= 6.5;
      out.push({
        id: `q${tramo.toString(36)}${i}`,
        zona: zona.nombre.replace("Sitos de prueba — ", ""),
        lat: zona.lat + (r(sSeed, 5) - 0.5) * 2 * zona.spread,
        lng: zona.lng + (r(sSeed, 6) - 0.5) * 2 * zona.spread,
        mag,
        profundidad,
        ts,
        sospechoso,
        estacion: ESTACIONES[Math.floor(r(sSeed, 7) * ESTACIONES.length)],
      });
    }
  }

  const hoy = 240 + Math.floor(r("sismoh90:" + Math.floor(ahora / 86400_000), 0) * 380);
  const conMag = out.filter((q) => q.mag >= 1.0);
  const mayor = conMag.reduce<Temblor | null>((acc, q) => (!acc || q.mag > acc.mag ? q : acc), null);
  const sospechosas = conMag.filter((q) => q.sospechoso);

  return {
    temblores: conMag.sort((a, b) => b.ts - a.ts),
    hoy,
    mayor,
    sospechosas,
    energias: Math.round(38 + r("sismoe90:" + Math.floor(ahora / 3600_000), 0) * 55),
  };
}

export function magColor(mag: number): string {
  if (mag >= 6) return "#FF3D3D";
  if (mag >= 5) return "#FF7A3D";
  if (mag >= 4) return "#FFD23D";
  if (mag >= 3) return "#9AE04D";
  return "#4DFFC4";
}

export function claseMag(mag: number): string {
  if (mag >= 8) return "Gran terremoto";
  if (mag >= 7) return "Terremoto mayor";
  if (mag >= 6) return "Fuerte";
  if (mag >= 5) return "Moderado";
  if (mag >= 4) return "Menor";
  if (mag >= 3) return "Muy leve";
  return "Microsismo";
}

// trazo del sismógrafo: ruido + eventos (determinista por semilla de minuto)
export function trazoSismograma(minuto: number, amplitudBase = 4): number[] {
  const pts: number[] = [];
  for (let i = 0; i < 160; i++) {
    const seed = `trazo90:${minuto}:${i}`;
    const rr = r(seed, 0);
    const rr2 = r(seed, 1);
    // bursts: 12% de puntos con energía alta (llegada P/S simulada)
    const burst = rr > 0.88 ? (rr2 - 0.5) * 46 : (rr2 - 0.5) * amplitudBase;
    pts.push(burst);
  }
  return pts;
}
