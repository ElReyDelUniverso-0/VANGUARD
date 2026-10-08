// v89.0 OPERACIÓN ESPEJO — MOTOR DE DETONACIÓN (espejo educativo del simulador
// de explosiones nucleares más usado del mundo). Física simplificada con
// escalado cúbico real: radio ∝ Y^(1/3). Objetivo DIDÁCTICO: que cada jugador
// vea el costo real de una detonación y por qué estas armas no se usan.
// Todo se evalúa sobre el mapa real del planeta con fórmulas públicas.

export interface CabezaNuclear {
  id: string;
  nombre: string;
  kt: number; // rendimiento en kilotones
  descripcion: string;
}

export const CABEZAS: CabezaNuclear[] = [
  { id: "t0", nombre: "Proyectil táctico", kt: 0.3, descripcion: "Artillería de rango corto. La más pequeña del arsenal moderno." },
  { id: "g15", nombre: "Bomba de gravedad", kt: 15, descripcion: "El rendimiento de la bomba de 1945: borró una ciudad entera." },
  { id: "t100", nombre: "Táctico moderno", kt: 100, descripcion: "Rendimiento típico de ojiva de misil táctico actual." },
  { id: "s300", nombre: "Estratégico", kt: 300, descripcion: "Ojiva estándar de misil balístico intercontinental." },
  { id: "t800", nombre: "Termonuclear pesado", kt: 800, descripcion: "Ojiva de múltiples objetivos sobre el mismo vector." },
  { id: "zar", nombre: "Doomsday (prueba histórica)", kt: 50000, descripcion: "La mayor detonación humana: 50 megatones de prueba en 1961." },
];

export interface CiudadObjetivo {
  nombre: string;
  pais: string;
  lat: number;
  lng: number;
  popMillones: number;
  densidadKm2: number; // hab/km² del área metropolitana
}

export const CIUDADES: CiudadObjetivo[] = [
  { nombre: "Nueva York", pais: "EE. UU.", lat: 40.713, lng: -74.006, popMillones: 19.6, densidadKm2: 10900 },
  { nombre: "Ciudad de México", pais: "México", lat: 19.433, lng: -99.133, popMillones: 21.8, densidadKm2: 9800 },
  { nombre: "Londres", pais: "Reino Unido", lat: 51.507, lng: -0.128, popMillones: 9.6, densidadKm2: 5700 },
  { nombre: "París", pais: "Francia", lat: 48.857, lng: 2.352, popMillones: 11.2, densidadKm2: 20500 },
  { nombre: "Berlín", pais: "Alemania", lat: 52.52, lng: 13.405, popMillones: 3.8, densidadKm2: 4100 },
  { nombre: "Moscú", pais: "Rusia", lat: 55.756, lng: 37.617, popMillones: 12.6, densidadKm2: 4900 },
  { nombre: "Estambul", pais: "Turquía", lat: 41.008, lng: 28.978, popMillones: 15.6, densidadKm2: 2700 },
  { nombre: "El Cairo", pais: "Egipto", lat: 30.044, lng: 31.236, popMillones: 21.3, densidadKm2: 8100 },
  { nombre: "Bombay", pais: "India", lat: 19.076, lng: 72.878, popMillones: 21.3, densidadKm2: 21500 },
  { nombre: "Shanghái", pais: "China", lat: 31.23, lng: 121.474, popMillones: 28.5, densidadKm2: 3900 },
  { nombre: "Seúl", pais: "Corea del Sur", lat: 37.566, lng: 126.978, popMillones: 25.5, densidadKm2: 16000 },
  { nombre: "Tokio", pais: "Japón", lat: 35.68, lng: 139.769, popMillones: 37.4, densidadKm2: 6300 },
];

export interface AnillosDetonacion {
  bolaFuego: number; // km
  psi5: number; // colapso de edificios
  psi1: number; // rotura de ventanas
  termica3: number; // quemaduras de tercer grado
  radiacion: number; // 500 rem
}

const cbrt = (x: number) => Math.cbrt(Math.max(x, 0.0001));

export function anillos(kt: number, airburst: boolean): AnillosDetonacion {
  const y = cbrt(kt);
  const boost = airburst ? 1.12 : 1.0; // la explosión aérea amplifica onda y fuego
  return {
    bolaFuego: Math.max(0.05, 0.075 * y * boost),
    psi5: Math.max(0.2, 0.63 * y * boost),
    psi1: Math.max(0.5, 2.0 * y * boost),
    termica3: Math.max(0.3, 0.85 * y * (airburst ? 1.18 : 0.9)),
    radiacion: airburst ? Math.min(1.5, 0.5 + 0.15 * y) : Math.min(2.2, 0.9 + 0.18 * y),
  };
}

export interface EstimacionBajas {
  muertos: number;
  heridos: number;
  alcanceHumo: number; // km donde el humo altera el clima regional
}

export function bajas(kt: number, ciudad: CiudadObjetivo, a: AnillosDetonacion): EstimacionBajas {
  // letalidad simplificada: dentro de 5psi ~65% letal, térmica ~25% adicional,
  // entre 5psi y 1psi ~18% heridos. Áreas en km².
  const area5 = Math.PI * a.psi5 * a.psi5;
  const areaT = Math.PI * a.termica3 * a.termica3;
  const area1 = Math.PI * a.psi1 * a.psi1;

  const dens = ciudad.densidadKm2; // hab/km² (ya está en unidades correctas)
  const popInterior = Math.min(ciudad.popMillones * 1e6, dens * area1 * 0.8);

  const muertos5 = dens * area5 * 0.62;
  const muertosT = Math.max(0, Math.min(dens * areaT * 0.24, popInterior * 0.3));
  const heridos1 = Math.min(dens * (area1 - area5) * 0.35, popInterior * 0.5);

  const muertos = Math.round(Math.min(popInterior, muertos5 + muertosT));
  const heridos = Math.round(Math.min(popInterior - muertos, heridos1));
  const alcanceHumo = Math.round(Math.pow(kt, 0.28) * 4);
  return { muertos, heridos, alcanceHumo };
}

export function formateaKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 2 : 1)} km`;
}

export function formateaNum(n: number): string {
  return n.toLocaleString("es-ES");
}
