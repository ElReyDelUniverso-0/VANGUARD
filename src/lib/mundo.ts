// ════════════════════════════════════════════════════════════════
// v215.0 EL MUNDO — EL PLANETA EN 3D COMO LA CASA LO MIRA.
// Mandato del Dueño: «Vanguard debe ser un mundo 3D donde se vea
// EN VIVO las guerras de todo el mundo, ciudades y lugares
// importantes en 3D».
//
// Datos estáticos (client-safe, sin BD): coordenadas de los teatros
// de guerra, plazas del poder mundial (gobiernos, organizaciones y
// gargantas estratégicas) y arcos de conflicto. Lo VIVO (cables de
// las últimas 24 h) lo baja /api/mundo desde la BD real.
// ════════════════════════════════════════════════════════════════

// ---- Teatros de guerra → donde vive cada uno en el globo ----
// Los slugs son EXACTAMENTE los de TEATROS (src/lib/teatros.ts):
// una fuente de slugs, dos vistas (página de teatro y globo).
export const TEATRO_3D: Record<string, { lat: number; lng: number }> = {
  ukraine: { lat: 48.6, lng: 32.0 },
  gaza: { lat: 31.45, lng: 34.4 },
  hormuz: { lat: 26.6, lng: 56.3 },
  taiwan: { lat: 23.8, lng: 121.0 },
  sahel: { lat: 14.5, lng: 2.0 },
  redsea: { lat: 15.3, lng: 41.2 },
  korea: { lat: 38.3, lng: 127.0 },
  sudan: { lat: 15.6, lng: 30.3 },
  lebanon: { lat: 33.9, lng: 35.6 },
};

// ---- Territorio del juego que se enciende por teatro (TERRITORY_COUNTRY_MAP) ----
export const TEATRO_TERRITORIO: Record<string, string> = {
  ukraine: "europaeste",
  gaza: "oriente",
  lebanon: "oriente",
  hormuz: "oriente",
  redsea: "oriente",
  taiwan: "china",
  korea: "japon",
  sahel: "africaoccidental",
  sudan: "egipto",
};

// ---- PLAZAS DEL MUNDO: gobiernos, organizaciones y gargantas ----
// «ciudades lugares importantes 3D»: todo lo que mueve el planeta
// con su coordenada real. tipo: capital | organizacion | estrategico
export interface PlazaMundo {
  id: string;
  nombre: string;
  detalle: string;
  lat: number;
  lng: number;
  tipo: "capital" | "organizacion" | "estrategico";
}

export const PLAZAS_MUNDO: PlazaMundo[] = [
  { id: "washington", nombre: "Washington", detalle: "EEUU — Casa Blanca y el Pentágono", lat: 38.897, lng: -77.036, tipo: "capital" },
  { id: "nueva-york", nombre: "Nueva York", detalle: "ONU — Sede de las Naciones Unidas", lat: 40.749, lng: -73.968, tipo: "organizacion" },
  { id: "bruselas", nombre: "Bruselas", detalle: "OTAN — Cuartel General de la Alianza", lat: 50.865, lng: 4.352, tipo: "organizacion" },
  { id: "londres", nombre: "Londres", detalle: "Reino Unido — Downing Street", lat: 51.503, lng: -0.128, tipo: "capital" },
  { id: "paris", nombre: "París", detalle: "Francia — El Élysée", lat: 48.87, lng: 2.313, tipo: "capital" },
  { id: "berlin", nombre: "Berlín", detalle: "Alemania — La Cancillería", lat: 52.519, lng: 13.38, tipo: "capital" },
  { id: "moscu", nombre: "Moscú", detalle: "Rusia — El Kremlin", lat: 55.752, lng: 37.618, tipo: "capital" },
  { id: "kiev", nombre: "Kiev", detalle: "Ucrania — Gobierno y Estado Mayor", lat: 50.45, lng: 30.523, tipo: "capital" },
  { id: "jerusalen", nombre: "Jerusalén", detalle: "Israel — Gobierno y seguro estratégico", lat: 31.777, lng: 35.213, tipo: "capital" },
  { id: "teheran", nombre: "Teherán", detalle: "Irán — Gobierno y programa nuclear", lat: 35.689, lng: 51.389, tipo: "capital" },
  { id: "riyadh", nombre: "Riad", detalle: "Arabia Saudí — Gobierno y OPEP de facto", lat: 24.713, lng: 46.675, tipo: "capital" },
  { id: "taibei", nombre: "Taipéi", detalle: "Taiwán — Presidencia y la fábrica del silicio", lat: 25.04, lng: 121.512, tipo: "capital" },
  { id: "beijing", nombre: "Pekín", detalle: "China — Zhongnanhai, el mando del partido", lat: 39.908, lng: 116.397, tipo: "capital" },
  { id: "pyongyang", nombre: "Pyongyang", detalle: "Corea del Norte — Gobierno y arsenal", lat: 39.019, lng: 125.752, tipo: "capital" },
  { id: "seul", nombre: "Seúl", detalle: "Corea del Sur — Gobierno y mando EE.UU.-ROK", lat: 37.567, lng: 126.979, tipo: "capital" },
  { id: "tokio", nombre: "Tokio", detalle: "Japón — Kantei y el Mando Conjunto", lat: 35.684, lng: 139.745, tipo: "capital" },
  { id: "nueva-delhi", nombre: "Nueva Delhi", detalle: "India — Gobierno de la mayor democracia", lat: 28.616, lng: 77.21, tipo: "capital" },
  { id: "islamabad", nombre: "Islamabad", detalle: "Pakistán — Gobierno y mando nuclear", lat: 33.684, lng: 73.048, tipo: "capital" },
  { id: "elcairo", nombre: "El Cairo", detalle: "Egipto — Gobierno y guardian de Suez", lat: 30.044, lng: 31.236, tipo: "capital" },
  { id: "ankara", nombre: "Ankara", detalle: "Turquía — Presidencia y control de los estrechos", lat: 39.933, lng: 32.859, tipo: "capital" },
  { id: "caracas", nombre: "Caracas", detalle: "Venezuela — Miraflores y las reservas de crudo", lat: 10.494, lng: -66.879, tipo: "capital" },
  { id: "ormuz", nombre: "Estrecho de Ormuz", detalle: "Sale el 20% del petróleo del mundo", lat: 26.57, lng: 56.25, tipo: "estrategico" },
  { id: "babelmandeb", nombre: "Babel-Mandeb", detalle: "La puerta del Mar Rojo — 12% del comercio", lat: 12.58, lng: 43.33, tipo: "estrategico" },
  { id: "suez", nombre: "Canal de Suez", detalle: "El atajo entre Asia y Europa", lat: 30.53, lng: 32.35, tipo: "estrategico" },
  { id: "panama", nombre: "Canal de Panamá", detalle: "El cuello de las Américas", lat: 9.08, lng: -79.68, tipo: "estrategico" },
  { id: "malaca", nombre: "Estrecho de Malaca", detalle: "La garganta del comercio asiático", lat: 2.5, lng: 101.4, tipo: "estrategico" },
  { id: "zaporiyia", nombre: "Zaporiyia", detalle: "La mayor central nuclear de Europa, ocupada", lat: 47.51, lng: 34.59, tipo: "estrategico" },
  { id: "artico", nombre: "Ártico — Groenlandia", detalle: "La nueva frontera militar del hielo", lat: 71.7, lng: -42.6, tipo: "estrategico" },
];

// ---- ARCOS DE CONFLICTO: las guerras y las tensiones que cruzan el planeta ----
export interface ArcaMundo {
  id: string;
  nombre: string;
  desde: { lat: number; lng: number };
  hasta: { lat: number; lng: number };
  color: [string, string];
}

export const ARCAS_MUNDO: ArcaMundo[] = [
  { id: "ar-ru-ua", nombre: "Rusia ▸ Ucrania", desde: { lat: 55.752, lng: 37.618 }, hasta: { lat: 48.6, lng: 32.0 }, color: ["#FF3B30", "#FF9500"] },
  { id: "ar-ir-il", nombre: "Irán ▸ Israel", desde: { lat: 35.689, lng: 51.389 }, hasta: { lat: 31.777, lng: 35.213 }, color: ["#FF3B30", "#FFD60A"] },
  { id: "ar-cn-tw", nombre: "China ▸ Taiwán", desde: { lat: 39.908, lng: 116.397 }, hasta: { lat: 25.04, lng: 121.512 }, color: ["#FF9500", "#FFD60A"] },
  { id: "ar-kp-kr", nombre: "Corea del Norte ▸ Corea del Sur", desde: { lat: 39.019, lng: 125.752 }, hasta: { lat: 37.567, lng: 126.979 }, color: ["#FF3B30", "#FF9500"] },
  { id: "ar-ye-rs", nombre: "Yemen ▸ Mar Rojo", desde: { lat: 15.35, lng: 44.2 }, hasta: { lat: 12.58, lng: 43.33 }, color: ["#FF3B30", "#FF6B35"] },
  { id: "ar-pk-in", nombre: "Pakistán ▸ India", desde: { lat: 33.684, lng: 73.048 }, hasta: { lat: 28.616, lng: 77.21 }, color: ["#FF9500", "#FFD60A"] },
];

// ---- Colores de tensión (misma ley que la casa) ----
export function colorTension(v: number): string {
  if (v >= 80) return "#FF3B30";
  if (v >= 60) return "#FF9500";
  if (v >= 40) return "#FFD60A";
  return "#3DDC97";
}

/** cables de 24 h → 0-100 y color (13+ cables ya es el rojo máximo). */
export function tensionPorCables(n: number): number {
  return Math.min(100, Math.round((n / 13) * 100));
}

export function colorPorCables(n: number): string {
  if (n <= 0) return "#3DDC97";
  return colorTension(Math.max(45, tensionPorCables(n)));
}

/** "3 min" / "2 h" — edad legible de un cable (client-safe, sin BD). */
export function haceDe(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

/** Recorta un titular para la etiqueta del globo (dos líneas máximo). */
export function recortar(s: string, max = 96): string {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}
