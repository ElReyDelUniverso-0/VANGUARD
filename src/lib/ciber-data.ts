// v90.0 ESPEJOS SIN FIN — MOTOR CIBER (espejo del gran mapa de ciberamenazas:
// arcos de ataque entre naciones sobre el mapa oscuro, contadores rodando,
// ranking de orígenes y objetivos, feed de intrusión). Todo ficticio y propio
// del mundo Vanguard.
//
// v322.0 EL ADVERSARIO CON NOMBRE — el mapa se dobla y respira con el anillo
// de la escuela (QUINTO consumidor de girar(): mando v313, instituto v318,
// red v320, canal v321, ciber v322):
//   · EL DOBLEZ: NACIONES 13→24 (entran Sudamérica, el Caribe, África austral,
//     Asia Central, Sudeste Asiático, Oceanía, la Liga Hanseática y la
//     Estación Ártica — que conecta con el Ártico del instituto v318),
//     TIPOS 6→10 (cadena de suministro, secuestro DNS, desvío BGP, wiper) y
//     SECTORES 7→14 (telecom, defensa, aviación, satélites, agua, industria,
//     cripto).
//   · EL ADVERSARIO CON NOMBRE: CAMPANAS — doce operaciones con nombre, alias,
//     firma técnica y crónica propia. Cada arco vivo nace ATRIBUIDO a una
//     campaña (las de su origen si las hay; si no, el catálogo entero —
//     la atribución es una ESTIMACIÓN declarada, no un hecho: ley de la casa
//     de distinguir hechos de estimaciones).
//   · EL ANILLO: campanaDelDia() — una campaña lleva el panel cada día
//     (día del año % 12, una muesca por fecha: dos días seguidos jamás
//     repiten la campaña del día).

import { girar, diaDelAnillo } from "./estrategia-data";
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
  // v322 — las once naciones que el mapa no tenía: el hemisferio sur, el
  // Ártico y los estrechos entran a la guerra que no hace ruido
  { id: "plata", nombre: "Confederación del Plata", bandera: "🇦🇷", lat: -34.6, lng: -58.4, rol: "AMBOS", peso: 0.5 },
  { id: "paracas", nombre: "República de Paracas", bandera: "🇵🇪", lat: -12.0, lng: -77.0, rol: "OBJETIVO", peso: 0.35 },
  { id: "zambezia", nombre: "República de Zambezia", bandera: "🇿🇼", lat: -17.8, lng: 31.0, rol: "AMBOS", peso: 0.45 },
  { id: "cuenca", nombre: "Cuenca del Ubangi", bandera: "🇨🇩", lat: -4.3, lng: 15.3, rol: "OBJETIVO", peso: 0.3 },
  { id: "hanseatica", nombre: "Liga Hanseática", bandera: "🇩🇪", lat: 53.55, lng: 8.8, rol: "AMBOS", peso: 0.6 },
  { id: "joresmia", nombre: "Kanato de Joresmia", bandera: "🇰🇿", lat: 41.3, lng: 69.2, rol: "AMBOS", peso: 0.4 },
  { id: "indochina", nombre: "Península Dorada", bandera: "🇹🇭", lat: 13.7, lng: 100.5, rol: "AMBOS", peso: 0.5 },
  { id: "malaca", nombre: "Sultanato de Malaca", bandera: "🇲🇾", lat: 3.1, lng: 101.7, rol: "AMBOS", peso: 0.55 },
  { id: "talasea", nombre: "Mancomunidad de Talasea", bandera: "🇳🇿", lat: -33.9, lng: 151.2, rol: "AMBOS", peso: 0.45 },
  { id: "artico", nombre: "Estación Ártica Aurora", bandera: "🇮🇸", lat: 78.2, lng: 15.6, rol: "AMBOS", peso: 0.35 },
  { id: "caribe", nombre: "Archipiélago del Caribe", bandera: "🇯🇲", lat: 18.1, lng: -77.3, rol: "OBJETIVO", peso: 0.4 },
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
  // v322 — las cuatro firmas que el mapa no sabía leer (colores únicos,
  // lección v320: dos voces con el mismo color son dos voces mudas)
  { id: "cadena", nombre: "Cadena de suministro", color: "#38BDF8" },
  { id: "dns", nombre: "Secuestro DNS", color: "#FB7185" },
  { id: "bgp", nombre: "Desvío BGP", color: "#A3E635" },
  { id: "wiper", nombre: "Wiper", color: "#E879F9" },
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
  // v322 — los siete frentes civiles que el catálogo ignoraba
  { id: "telecom", nombre: "Telecom", emoji: "📡" },
  { id: "defensa", nombre: "Defensa", emoji: "🛡️" },
  { id: "aviacion", nombre: "Aviación", emoji: "✈️" },
  { id: "satelites", nombre: "Satélites", emoji: "🛰️" },
  { id: "agua", nombre: "Agua", emoji: "💧" },
  { id: "industria", nombre: "Industria OT", emoji: "⚙️" },
  { id: "cripto", nombre: "Criptobolsas", emoji: "🪙" },
];

// ── v322: EL ADVERSARIO CON NOMBRE ─────────────────────────────
// Doce campañas con nombre propio (el ciberespacio de Vanguard ya no ataca
// «algún origen»: ataca UN QUIÉN). atribución declarada como estimación.
export interface Campana {
  id: string;
  nombre: string;
  alias: string;
  origen: string; // id de NacionCiber
  color: string; // único en el catálogo
  tec: string; // firma técnica
  nota: string; // crónica de una línea
  sectores: string[]; // ids de SectorObjetivo
}

export const CAMPANAS: Campana[] = [
  { id: "manada", nombre: "MANADA DE INVIERNO", alias: "Manada", origen: "fednord", color: "#7DD3FC", tec: "wiper con borrado de huellas", nota: "Apaga transformadores y barre sus propios rastros: la destrucción también lleva horario.", sectores: ["energia", "ferrocarril"] },
  { id: "papel", nombre: "PAPEL DE ARROZ", alias: "Papel", origen: "impcen", color: "#FDE68A", tec: "cadena de suministro", nota: "No fuerza la puerta: viaja en el camión que la entrega.", sectores: ["defensa", "industria"] },
  { id: "guadana", nombre: "GUADAÑA DE SAL", alias: "Guadaña", origen: "uniatl", color: "#F9A8D4", tec: "credenciales robadas", nota: "Cobra en secretos: cada informe robado es un voto que nadie ve.", sectores: ["gobierno", "banco"] },
  { id: "marea", nombre: "MAREA ESPEJO", alias: "Marea", origen: "ormuz", color: "#5EEAD4", tec: "secuestro DNS", nota: "Cuando el mapa del puerto miente, el barco paga el peaje.", sectores: ["puerto", "banco"] },
  { id: "gato", nombre: "GATO DE BÓSFORO", alias: "Gato", origen: "bosforo", color: "#FDBA74", tec: "phishing de madrugada", nota: "Vende a los dos lados del estrecho: el intermediario no elige bando.", sectores: ["medios", "gobierno"] },
  { id: "cincel", nombre: "CINCEL DEL INDUS", alias: "Cincel", origen: "indus", color: "#D8B4FE", tec: "malware a medida", nota: "Un objetivo, mil noches: la paciencia del artesano también es un arma.", sectores: ["energia", "gobierno"] },
  { id: "escalera", nombre: "ESCALERA DEL SUBCONTINENTE", alias: "Escalera", origen: "subcon", color: "#FCA5A5", tec: "doble extorsión", nota: "Cifra la sala y vende la copia: dos veces el mismo rehén.", sectores: ["salud", "banco"] },
  { id: "sonata", nombre: "SONATA HERMITANA", alias: "Sonata", origen: "hermita", color: "#E7E5E4", tec: "fraude directo", nota: "Roba para comer, ataca para existir: la moneda dura financia el silencio.", sectores: ["banco", "cripto"] },
  { id: "polvo", nombre: "POLVO DE LEVANTE", alias: "Polvo", origen: "levante", color: "#FEF08A", tec: "desfiguración con mensaje", nota: "No quiere datos, quiere titulares: el ruido es el botín.", sectores: ["medios", "gobierno"] },
  { id: "harmattan", nombre: "HARMATTAN", alias: "Harmattan", origen: "sahel", color: "#BBF7D0", tec: "phishing estacional", nota: "Recorre el Sahel con la estación: donde cae la red, sube el anzuelo.", sectores: ["telecom", "medios"] },
  { id: "cable", nombre: "CABLE INVERSO", alias: "Cable", origen: "artico", color: "#93C5FD", tec: "desvío BGP", nota: "No ataca el dato: ataca el camino del dato.", sectores: ["satelites", "telecom"] },
  { id: "perla", nombre: "PERLA NEGRA", alias: "Perla", origen: "malaca", color: "#C4B5FD", tec: "espionaje logístico", nota: "Lee el manifiesto antes que el capitán: la ruta vale más que la carga.", sectores: ["puerto", "ferrocarril"] },
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
  campanaId: string; // v322: atribución (estimación declarada) a una campaña
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

// v322: la atribución — las campañas del origen si las hay; si no, el
// catálogo entero (operación forastera o bandera falsa). Es una ESTIMACIÓN
// nacida de la semilla, y la UI la declara como tal.
function atribuirCampana(seed: string, salt: number, origenId: string): Campana {
  const propias = CAMPANAS.filter((c) => c.origen === origenId);
  const pool = propias.length > 0 ? propias : CAMPANAS;
  return pool[Math.floor(r(seed, salt) * pool.length)];
}

export function campanaPorId(id: string): Campana | undefined {
  return CAMPANAS.find((c) => c.id === id);
}

export function nacionCiberDe(id: string): NacionCiber | undefined {
  return NACIONES_CIBER.find((n) => n.id === id);
}

// v322: el día del año — el reloj del anillo (el MISMO reloj que sirve a la
// red desde la v320 y al canal desde la v321: contar días es la forma honesta
// de girar un anillo). v324: la copia muere — diaDelAnillo vive en
// estrategia-data y los seis anillos comparten ese único reloj.

// v322: EL ADVERSARIO DEL DÍA — el ciber respira con el anillo de la escuela
// (girar, la rotación por envoltura exportada — el MISMO patrón que rota las
// clases del mando, el foco del instituto, el destacado de la red y el
// episodio del canal): una campaña lleva el panel cada día; el anillo avanza
// UNA muesca por fecha, de modo que dos días seguidos jamás repiten la
// campaña del día — y al duodécimo día las doce campañas han pasado por
// la pantalla.
export function campanaDelDia(): Campana {
  return girar(CAMPANAS, 1, diaDelAnillo() % CAMPANAS.length)[0];
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
      ti < 24 ? TIPOS_ATAQUE[0] : ti < 40 ? TIPOS_ATAQUE[1] : ti < 54 ? TIPOS_ATAQUE[2] : ti < 64 ? TIPOS_ATAQUE[3] : ti < 72 ? TIPOS_ATAQUE[4] : ti < 78 ? TIPOS_ATAQUE[5] : ti < 84 ? TIPOS_ATAQUE[6] : ti < 90 ? TIPOS_ATAQUE[7] : ti < 95 ? TIPOS_ATAQUE[8] : TIPOS_ATAQUE[9];
    const sector = SECTORES[Math.floor(r(seed, 40) * SECTORES.length)];
    const intensidad = 1 + Math.floor(r(seed, 50) * 5);
    const ts = win * paso + Math.floor(r(seed, 60) * paso);
    // v322: el arco nace con nombre — atribución determinista a una campaña
    const campana = atribuirCampana(seed, 90, origen.id);
    ataques.push({
      id: `a${win.toString(36)}${i}`,
      origen, objetivo, tipo, sector, intensidad, ts,
      durMs: 1800 + Math.floor(r(seed, 70) * 1600),
      campanaId: campana.id,
    });
  }

  // contadores deterministas por hora (24 tramos de 5 min ya vividos)
  const hora = Math.floor(ahora / 3600_000);
  const seedHora = "ciberh90:" + hora;
  const totalHoy = 6400 + Math.floor(r(seedHora, 0) * 5100);

  const porTipo = TIPOS_ATAQUE.map((t, i) => ({
    tipo: t,
    n: Math.floor(totalHoy * (0.04 + r(seedHora, 10 + i) * 0.13)),
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
    n: Math.floor(totalHoy * (0.03 + r(seedHora, 70 + i) * 0.1)),
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
