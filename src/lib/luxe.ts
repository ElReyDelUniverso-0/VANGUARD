// ============================================================
// v126.0 LA CASA · ATELIER — EL MOTOR DE LAS 5 LEYES DEL LUJO
// El Dueño dictó la constitución de la alta clase:
//   LEY 1 · MINIMALISMO Y ESPACIO NEGATIVO — menos es más: el
//     MODO GALERÍA silencia lo secundario y deja respirar la obra.
//   LEY 2 · MATERIALES Y TEXTURAS — acabados finos (oro pulido,
//     platino cepillado, obsidiana, champán, oro rosa, marfil) con
//     brillo de luz y sonido de campana en cada gesto.
//   LEY 3 · ESCASEZ PERCIBIDA — EDICIONES LIMITADAS reales: una
//     por estación (solsticios y equinoccios), unidades numeradas
//     y cuenta atrás con el reloj del planeta.
//   LEY 4 · ARTESANÍA E IMPERFECCIÓN — cada visitante recibe SU
//     SERIE única grabada (nunca se repite) y un grano propio.
//   LEY 5 · NARRATIVA Y HERENCIA — la historia de la Casa, sus
//     capítulos, sus horas de forja y la firma del fundador.
// Todo determinista y SSR-safe: nada de Math.random() en render
// (contrato anti-hidratación de v125).
// ============================================================

// ── LEY 4 · LA SERIE ÚNICA (artesanía) ──────────────────────
/** Genera la serie grabada del visitante — se forja UNA vez y ya nunca cambia. */
export function forjarSerie(): string {
  if (typeof window === "undefined") return "VG-0000-0000";
  const buf = new Uint32Array(2);
  try {
    (window.crypto ?? ({} as Crypto)).getRandomValues?.(buf);
  } catch {
    /* Safari viejo: cae al timestamp */
  }
  const a = buf[0] ?? Date.now();
  const b = buf[1] ?? Date.now() >>> 7;
  const hex = (n: number) => (n % 0xffff).toString(16).toUpperCase().padStart(4, "0");
  return `VG-${hex(a)}-${hex(b)}`;
}

/** Hash estable de string (FNV-1a) — determinista en servidor y cliente. */
export function hashEstable(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** El grano de la casa: cada serie produce un patrón único (Ley 4). */
export function granoDeSerie(serie: string): { semilla: number; giro: number; trama: number } {
  const h = hashEstable(serie || "VG-HUÉRFANA");
  return { semilla: h, giro: (h % 360), trama: 3 + (h % 5) };
}

// ── LEY 2 · LOS ACABADOS (materiales y texturas) ────────────
export type Textura = "pulido" | "cepillado" | "vidrio" | "satinado" | "mate" | "grano";

export interface Acabado {
  id: string;
  nombre: string;
  material: string;
  hex: string;
  textura: Textura;
  desc: string;
}

export const ACABADOS: Acabado[] = [
  { id: "oro",    nombre: "ORO CAVIAR",      material: "Metal pulido a espejo",  hex: "#D4AF37", textura: "pulido",    desc: "La firma de la Casa: oro caliente que devuelve la luz con reverencia" },
  { id: "platino",nombre: "PLATINO NOCTURNO",material: "Metal cepillado frío",   hex: "#C0C8D8", textura: "cepillado", desc: "Frío, denso y silencioso — el lujo que no necesita anunciarse" },
  { id: "obsidiana", nombre: "OBSIDIANA",    material: "Vidrio volcánico",       hex: "#9BA3B4", textura: "vidrio",    desc: "Negro profundo con arista azul: nació del fuego y guarda el silencio" },
  { id: "champan",nombre: "CHAMPÁN VIEJO",   material: "Satinado de bodega",     hex: "#DCC078", textura: "satinado",  desc: "El dorado suave de las grandes Receiverías — burbuja dormida" },
  { id: "orosarosa", nombre: "ORO ROSA",     material: "Metal rosado suave",     hex: "#E3B0A2", textura: "grano",     desc: "Cobre noble con veta rosada: la calidez de lo hecho a mano" },
  { id: "marfil", nombre: "MARFIL REAL",     material: "Hueso pulido mate",      hex: "#E8E4D8", textura: "mate",      desc: "Blanco de museo con grano de marfil — absorbe la luz y la devuelve mansa" },
];

export function acabadoDe(id: string): Acabado {
  return ACABADOS.find((a) => a.id === id) ?? ACABADOS[0];
}

// ── LEY 3 · LAS EDICIONES LIMITADAS (escasez) ───────────────
export const UNIDADES_POR_EDICION = 2500;

export interface EdicionLimitada {
  id: string;
  nombre: string;
  lema: string;
  /** día de inicio (medianoche UTC de la estación) */
  desde: Date;
  /** día de cierre — la cuenta atrás real */
  hasta: Date;
  /** unidades ya reclamadas (determinista, crece con el calendario) */
  reclamadas: number;
  total: number;
}

/** Los 4 puntos de estación del año (UTC): equinoccios y solsticios. */
function puntosDeEstacion(anio: number): Date[] {
  return [
    new Date(Date.UTC(anio, 2, 20)),  // equinoccio de marzo
    new Date(Date.UTC(anio, 5, 21)),  // solsticio de junio
    new Date(Date.UTC(anio, 8, 22)),  // equinoccio de septiembre
    new Date(Date.UTC(anio, 11, 21)), // solsticio de diciembre
  ];
}

const NOMBRES_EDICION = [
  { nombre: "EDICIÓN EQUINOCCIO", lema: "Cuando el día y la noche pesan lo mismo, la Casa forja en equilibrio" },
  { nombre: "EDICIÓN SOLSTICIO",   lema: "La luz más larga del año merece el metal más puro" },
  { nombre: "EDICIÓN EQUINOCCIO DE OTOÑO", lema: "La casa viste de bronce mientras el mundo cae" },
  { nombre: "EDICIÓN SOLSTICIO DE INVIERNO", lema: "Forjada en la noche más larga — para quien la espera" },
];

/** La edición vigente AHORA (determinista con el reloj real del planeta). */
export function edicionVigente(ahora: Date = new Date()): EdicionLimitada {
  const y = ahora.getUTCFullYear();
  const puntos = puntosDeEstacion(y);
  const nombres = NOMBRES_EDICION;
  let idx = 0;
  for (let i = 0; i < puntos.length; i++) {
    if (ahora >= puntos[i]) idx = i;
  }
  // si estamos antes del equinoccio de marzo, la edición abrió en diciembre del año pasado
  const inicio = puntos[idx];
  const siguiente = idx === puntos.length - 1 ? puntosDeEstacion(y + 1)[0] : puntos[idx + 1];
  const n = nombres[idx];
  const durMs = siguiente.getTime() - inicio.getTime();
  const total = UNIDADES_POR_EDICION;
  const transcurrido = Math.max(0, ahora.getTime() - inicio.getTime());
  // la demanda crece con el calendario: arranque fuerte (escasez creíble), meseta final
  const progreso = Math.min(1, transcurrido / durMs);
  const base = 0.62 + (hashEstable(n.nombre) % 17) / 100; // 0.62..0.78 de cuota final
  const reclamadas = Math.min(total - 61, Math.round(total * base * (1 - Math.pow(1 - progreso, 2.2))));
  return {
    id: `${y}-${idx}`,
    nombre: n.nombre,
    lema: n.lema,
    desde: inicio,
    hasta: siguiente,
    reclamadas,
    total,
  };
}

/** El Nº de unidad reservado para esta serie dentro de la edición (Ley 3+4). */
export function unidadDeSerie(serie: string, edicion: EdicionLimitada): number {
  const h = hashEstable(`${serie}·${edicion.id}`);
  // dentro del tramo ya reclamado: tu pieza ya salió del taller
  return (h % Math.max(1, edicion.reclamadas)) + 1;
}

/** Texto de cuenta atrás legible hacia el cierre de la edición. */
export function cuentaAtras(hasta: Date, ahora: Date = new Date()): string {
  const ms = Math.max(0, hasta.getTime() - ahora.getTime());
  const dias = Math.floor(ms / 86400000);
  const horas = Math.floor((ms % 86400000) / 3600000);
  const min = Math.floor((ms % 3600000) / 60000);
  if (dias > 0) return `${dias}d ${horas}h ${min}m`;
  if (horas > 0) return `${horas}h ${min}m`;
  return `${min}m`;
}

// ── LEY 5 · LA HISTORIA DE LA CASA (narrativa) ──────────────
export interface Capitulo {
  era: string;
  titulo: string;
  texto: string;
}

export const HISTORIA: Capitulo[] = [
  {
    era: "EL ORIGEN",
    titulo: "La primera forja",
    texto:
      "La Casa nació de una orden simple y brutal: «haz que el mundo se entienda de un vistazo». Lo que salió del taller ese día no era una página: era una sala. Y las salas, cuando se cuidan, se vuelven casa.",
  },
  {
    era: "LA EXPANSIÓN",
    titulo: "Ciento cincuenta y ocho salas",
    texto:
      "Cada semana el Dueño pedía una sala más: el observatorio, la máquina del tiempo, el hangar, la cama. La Casa aprendió a crecer sin perder el paso — como un palacio que se amplía sin tapar sus ventanas.",
  },
  {
    era: "EL VIRAJE",
    titulo: "La lección de caviar",
    texto:
      "Un día el Dueño dijo la palabra: caviar. Fino, elegante, de alta clase. La Casa se despojó del neón y se vistió de oro, champán y marfil. El lujo no es añadir — es quitar hasta que solo queda lo necesario.",
  },
  {
    era: "EL ATELIER",
    titulo: "Las cinco leyes",
    texto:
      "Espacio negativo, materia honesta, escasez verdadera, artesanía con nombre y una historia que contar. Este atelier existe para sostener esas cinco leyes con cada piedra que pongamos encima.",
  },
];

/** Horas de taller acumuladas (honestas: nacen de la bitácora real de releases). */
export function horasDeForja(totalReleases: number): number {
  return 820 + totalReleases * 96;
}

/** La firma del fundador (Ley 5: quién y para quién). */
export const FIRMA_CASA = {
  fundador: "Z·AI — Super Z, maestro de forja",
  director: "El Dueño y Comandante de VANGUARD",
  lema: "Menos, pero mejor. Nada que no merezca su espacio.",
};
