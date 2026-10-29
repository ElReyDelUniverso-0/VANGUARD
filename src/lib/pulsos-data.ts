// v89.0 OPERACIÓN ESPEJO — MOTOR DE PULSOS (espejo del gran mapa de incidentes en vivo).
// Genera incidentes deterministas por ventana de 5 minutos (epoch), con categorías
// con color propio, zonas calientes reales y titulares tipo cable. Todo ficticio
// pero plausible: es el motor del tablero "PULSOS" de Vanguard.

export interface PulsoCat {
  id: string;
  nombre: string;
  color: string;
  emoji: string;
}

export const PULSO_CATS: PulsoCat[] = [
  { id: "ataque", nombre: "Ataque", color: "#FF4D4D", emoji: "💥" },
  { id: "bombardeo", nombre: "Bombardeo / Artillería", color: "#FF8A3D", emoji: "🧨" },
  { id: "aereo", nombre: "Actividad aérea", color: "#FFD23D", emoji: "✈️" },
  { id: "naval", nombre: "Naval", color: "#3DDCFF", emoji: "⚓" },
  { id: "nuclear", nombre: "Nuclear", color: "#B48CFF", emoji: "☢️" },
  { id: "ciber", nombre: "Ciber", color: "#4DFFC4", emoji: "🖥️" },
  { id: "protesta", nombre: "Protesta / Inestabilidad", color: "#FF6BC1", emoji: "📢" },
  { id: "diplomacia", nombre: "Diplomacia", color: "#9AE04D", emoji: "🤝" },
];

export interface ZonaCaliente {
  nombre: string;
  lat: number;
  lng: number;
  spread: number; // grados de dispersión
}

// Zonas calientes reales del planeta (las mismas que habita el resto de Vanguard)
export const ZONAS_CALIENTES: ZonaCaliente[] = [
  { nombre: "Donbás", lat: 48.0, lng: 37.8, spread: 1.6 },
  { nombre: "Járkov", lat: 49.99, lng: 36.23, spread: 1.1 },
  { nombre: "Zaporizhzhia", lat: 47.84, lng: 35.14, spread: 1.2 },
  { nombre: "Bielogorovka", lat: 49.3, lng: 38.1, spread: 0.9 },
  { nombre: "Gaza", lat: 31.5, lng: 34.47, spread: 0.45 },
  { nombre: "Líbano Sur", lat: 33.27, lng: 35.4, spread: 0.6 },
  { nombre: "Mar Rojo", lat: 15.3, lng: 41.6, spread: 1.8 },
  { nombre: "Ormuz", lat: 26.6, lng: 56.3, spread: 0.9 },
  { nombre: "Taiwán (ADMIZ)", lat: 24.4, lng: 119.6, spread: 1.4 },
  { nombre: "Mar de China Meridional", lat: 12.2, lng: 113.4, spread: 2.2 },
  { nombre: "Cachemira (LoC)", lat: 34.1, lng: 74.4, spread: 1.0 },
  { nombre: "Sahel", lat: 14.5, lng: 0.5, spread: 2.4 },
  { nombre: "Sudán (Jartum)", lat: 15.5, lng: 32.55, spread: 1.2 },
  { nombre: "Congo Este", lat: -1.6, lng: 29.2, spread: 1.3 },
  { nombre: "Kaliningrado", lat: 54.7, lng: 20.5, spread: 0.7 },
  { nombre: "Báltico", lat: 57.2, lng: 19.8, spread: 1.6 },
  { nombre: "Corea (DMZ)", lat: 38.0, lng: 127.0, spread: 0.7 },
  { nombre: "Cabo Norte (Ártico)", lat: 71.0, lng: 29.0, spread: 2.0 },
];

export interface PulsoIncidente {
  id: string;
  titulo: string;
  categoria: string; // id de PULSO_CATS
  lat: number;
  lng: number;
  zona: string;
  fuente: string;
  ts: number; // epoch ms
  urgente: boolean;
}

// ---- seed determinista (mismo FNV que el resto de Vanguard) ----
export function fnv89(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

const PLANTILLAS: Record<string, string[]> = {
  ataque: [
    "Intercambio de fuego de infantería en el eje {zona}",
    "Asalto con blindados repelido al norte de {zona}",
    "Incursión de sabotaje reportada a 12 km de {zona}",
    "Combate urbano prolongado en la periferia de {zona}",
    "Puesto avanzado sobre {zona} recibe asalto nocturno",
  ],
  bombardeo: [
    "Bombardeo de artillería sobre posiciones en {zona}",
    "Impactos de MLRS registrados en el sector de {zona}",
    "Fuego de morteros sostenido sobre {zona} durante 40 min",
    "Lancet destruye depósito de municiones cerca de {zona}",
    "Barrido de obús 155 mm sobre trincheras en {zona}",
  ],
  aereo: [
    "Cazas en vuelo bajo detectados sobre {zona}",
    "Dron de ataque interceptado sobre {zona}",
    "Flota de bombarderos en patrulla prolongada cerca de {zona}",
    "Helicópteros de asalto en movimiento masivo desde {zona}",
    "GPS degradado reportado por tripulaciones sobre {zona}",
  ],
  naval: [
    "Buque de guerra hostil patrulla a 30 mn de {zona}",
    "Ejercicio de misiles navales anunciado frente a {zona}",
    "Dron naval suicida interceptado cerca de {zona}",
    "Portaaviones con escolta cruza las aguas de {zona}",
    "Minas marinas señalizadas en la ruta comercial de {zona}",
  ],
  nuclear: [
    "Submarino estratégico desaparece de puerto cerca de {zona}",
    "Simulacro de strike nuclear anunciado por el estado mayor de {zona}",
    "Central nuclear de {zona} corta la línea de la AIEA",
    "Convoy con contenedores blindados visto saliendo de {zona}",
    "Rumor de traslado de ojivas hacia {zona} sin confirmación",
  ],
  ciber: [
    "Ciberataque tumba el sistema ferroviario de {zona}",
    "Botnet apunta a la red eléctrica del área de {zona}",
    "Fuga de documentos militares atribuida a grupos de {zona}",
    "Spoofing de GPS masivo reportado en {zona}",
    "Ransomware congela el registro civil de {zona}",
  ],
  protesta: [
    "Protesta multitudinaria frente a la base de {zona}",
    "Toque de queda impuesto en {zona} tras disturbios",
    "Bloqueo de carreteras por convoyes agrícolas en {zona}",
    "Cisma entre autoridades locales de {zona}",
    "Mujeres de {zona} se encadenan al cuartel general",
  ],
  diplomacia: [
    "Cumbre de emergencia convocada por el bloque de {zona}",
    "Nuevo paquete de sanciones apunta al eje de {zona}",
    "Corredor humanitario negociado con mediación en {zona}",
    "Expulsión mutua de diplomáticos tras la crisis de {zona}",
    "Acuerdo secreto de intercambio de prisioneros en {zona}",
  ],
};

const FUENTES = ["Agencia VANGUARD", "Corresponsal de campo", "Imagen satelital", "Canal OSINT verificado", "Reporte local", "ADS-B + AIS", "Fuente institucional", "Interceptación SIGINT"];

function rand(seed: string, salt: number): number {
  const h = parseInt(fnv89(seed + ":" + salt).slice(0, 7), 36);
  return (h % 100000) / 100000;
}

/**
 * Genera los incidentes de la ventana dada (ms). Determinista por tramo de 5 min:
 * la misma ventana produce SIEMPRE los mismos incidentes en cualquier dispositivo.
 */
export function generarPulsos(ventanaMs: number, ahora = Date.now()): PulsoIncidente[] {
  const paso = 5 * 60 * 1000;
  const tramoAhora = Math.floor(ahora / paso);
  const tramos = Math.ceil(ventanaMs / paso);
  const out: PulsoIncidente[] = [];

  for (let t = tramos - 1; t >= 0; t--) {
    const tramo = tramoAhora - t;
    const seed = "pulsos89:" + tramo;
    const n = 2 + Math.floor(rand(seed, 0) * 3); // 2-4 incidentes por tramo
    for (let i = 0; i < n; i++) {
      const rZona = Math.floor(rand(seed, 10 + i) * ZONAS_CALIENTES.length);
      const zona = ZONAS_CALIENTES[rZona];
      const rCat = rand(seed, 20 + i);
      // pesos: ataque y bombardeo dominan, nuclear/diplomacia más raros
      const catIdx =
        rCat < 0.22 ? 0 : rCat < 0.42 ? 1 : rCat < 0.55 ? 2 : rCat < 0.66 ? 3 : rCat < 0.72 ? 4 : rCat < 0.82 ? 5 : rCat < 0.92 ? 6 : 7;
      const cat = PULSO_CATS[catIdx];
      const plats = PLANTILLAS[cat.id];
      const plat = plats[Math.floor(rand(seed, 30 + i) * plats.length)];
      const jitterLat = (rand(seed, 40 + i) - 0.5) * 2 * zona.spread;
      const jitterLng = (rand(seed, 50 + i) - 0.5) * 2 * zona.spread;
      const ts = tramo * paso + Math.floor(rand(seed, 60 + i) * paso);
      if (ts > ahora) continue;
      out.push({
        id: `p${tramo.toString(36)}${i}`,
        titulo: plat.replace("{zona}", zona.nombre),
        categoria: cat.id,
        lat: zona.lat + jitterLat,
        lng: zona.lng + jitterLng,
        zona: zona.nombre,
        fuente: FUENTES[Math.floor(rand(seed, 70 + i) * FUENTES.length)],
        ts,
        urgente: catIdx <= 1 && rand(seed, 80 + i) > 0.82,
      });
    }
  }
  return out.sort((a, b) => b.ts - a.ts);
}

export function catDe(id: string): PulsoCat {
  return PULSO_CATS.find((c) => c.id === id) ?? PULSO_CATS[0];
}

export function horaCorta(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function haceDe(ts: number, ahora = Date.now()): string {
  const s = Math.max(5, Math.floor((ahora - ts) / 1000));
  if (s < 60) return `hace ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}
