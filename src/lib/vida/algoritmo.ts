// ══════════════════════════════════════════════════════════════════════
// v421.9 · EL ALGORITMO DE IMPRESIONES — «Vanguard aprende de ti»
//
// QUÉ HACE Y QUÉ NO:
//   · SÍ: ordena las puertas de la casa según lo que TÚ has abierto, con
//     señales reales que ya existen en el aparato (`vg195-atajos-usage` y
//     `vg171-favoritos`) más las impresiones que apunta esta capa.
//   · SÍ: explica cada recomendación con una razón legible («lo fijaste tú»,
//     «vuelves mucho por aquí», «nunca lo has abierto»).
//   · NO: no hay servidor, ni cuenta, ni perfil en la nube. Todo se calcula
//     en el aparato y nada sale de él. Si mañana se enciende la nube, este
//     módulo sigue siendo la pieza que decide; solo cambia de dónde lee.
//   · NO: no es aleatorio. Mismas señales → mismo orden (hay desempate por
//     hash), así que dos cargas seguidas no bailan.
//
// MODELO (0–30 puntos, todo sumable):
//   1. Favorito declarado ......... +8,0   el Dueño lo fijó con la estrella
//   2. Impresiones propias ........ +2,2 × min(aperturas, 8)
//   3. Afinidad de grupo .......... +1,4 × min(aperturas del grupo, 6)
//   4. Novedad .................... +3,0 × (1 − decaimiento)
//        nunca abierto = 3,0 · abierto hace un rato = 0 · abierto hace un mes ≈ 3,0
//        (el olvido devuelve la novedad: nada queda castigado para siempre)
//   5. Repetición reciente ........ −4,0 × decaimiento (no repetir lo de hace un rato)
// ══════════════════════════════════════════════════════════════════════

export type Candidato = {
  /** clave estable de la pieza (id del registro, nunca inventado) */
  id: string;
  nombre: string;
  href: string;
  /** familia a la que pertenece (módulo, espacio…): da la afinidad */
  grupo: string;
};

export type Senal = {
  /** aperturas reales por clave o por href (`vg195-atajos-usage`) */
  uso?: Record<string, number>;
  /** claves fijadas con la estrella (`vg171-favoritos`) */
  favoritos?: string[];
  /** impresiones de esta capa: clave → instante de la última apertura */
  vistos?: Record<string, number>;
  /** ahora, en ms (se inyecta para poder probar) */
  ahora?: number;
};

export type Recomendacion = Candidato & {
  puntos: number;
  razon: string;
  /** por qué, en datos: lo que se usó para puntuar (auditable) */
  detalle: { favorito: number; impresiones: number; afinidad: number; novedad: number; repeticion: number };
};

/** vida media del recuerdo de una visita: 3 días */
export const VIDA_MEDIA_MS = 3 * 24 * 60 * 60 * 1000;

/** decaimiento exponencial 1 → 0 conforme envejece la impresión */
export function decaimiento(edadMs: number): number {
  if (!Number.isFinite(edadMs) || edadMs <= 0) return 1;
  return Math.pow(0.5, edadMs / VIDA_MEDIA_MS);
}

/** hash estable (FNV-1a 32 bits) para desempates y colores */
export function hash(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Puntúa y ordena. Determinista: empate → hash del id.
 * `cuantos` limita el resultado (0 o menos = todos).
 */
export function puntuar(candidatos: Candidato[], senal: Senal = {}, cuantos = 6): Recomendacion[] {
  const uso = senal.uso ?? {};
  const favoritos = new Set(senal.favoritos ?? []);
  const vistos = senal.vistos ?? {};
  const ahora = senal.ahora ?? Date.now();

  const aperturas = (c: Candidato): number => (uso[c.id] ?? 0) + (uso[c.href] ?? 0);

  // cuántas veces se ha abierto cada familia (afinidad)
  const porGrupo: Record<string, number> = {};
  for (const c of candidatos) porGrupo[c.grupo] = (porGrupo[c.grupo] ?? 0) + aperturas(c);

  const filas: Recomendacion[] = candidatos.map((c) => {
    const n = aperturas(c);
    const favorito = favoritos.has(c.id) || favoritos.has(c.href) ? 8 : 0;
    const impresiones = Math.round(2.2 * Math.min(n, 8) * 100) / 100;
    const afinidad = Math.round(1.4 * Math.min(porGrupo[c.grupo] ?? 0, 6) * 100) / 100;
    const visto = vistos[c.id] ?? vistos[c.href];
    // el olvido es simétrico: lo que hace mucho que no abres vuelve a ser
    // «nuevo» (+3) y deja de estar penalizado (−4). Así el carril no se queda
    // clavado en las mismas seis puertas para siempre.
    const frescura = visto === undefined ? 0 : decaimiento(ahora - visto);
    const novedad = Math.round(3 * (1 - frescura) * 100) / 100;
    const repeticion = visto === undefined ? 0 : -Math.round(4 * frescura * 100) / 100;

    const puntos = Math.round((favorito + impresiones + afinidad + novedad + repeticion) * 100) / 100;

    // la razón más fuerte, en palabras que se entienden sin manual
    let razon: string;
    if (favorito > 0) razon = "lo fijaste tú";
    else if (repeticion < -2.4) razon = "lo abriste hace un momento";
    else if (n > 0 && impresiones >= afinidad) razon = "vuelves mucho por aquí";
    else if (afinidad > 0 && n === 0) razon = `cerca de lo que más abres (${c.grupo})`;
    else if (visto !== undefined && novedad > 1.5) razon = "hace tiempo que no entras";
    else if (visto === undefined) razon = "nunca lo has abierto";
    else razon = "una puerta de la casa";

    return { ...c, puntos, razon, detalle: { favorito, impresiones, afinidad, novedad, repeticion } };
  });

  filas.sort((a, b) => b.puntos - a.puntos || hash(a.id) - hash(b.id));
  return cuantos > 0 ? filas.slice(0, cuantos) : filas;
}

/**
 * Anota una impresión. Devuelve un registro NUEVO (no muta el recibido) y
 * recorta a las 200 más recientes para que el almacén nunca crezca sin freno.
 */
export function registrarVisto(vistos: Record<string, number>, id: string, ahora = Date.now()): Record<string, number> {
  const nuevo: Record<string, number> = { ...vistos, [id]: ahora };
  const claves = Object.keys(nuevo);
  if (claves.length <= 200) return nuevo;
  claves.sort((a, b) => nuevo[b] - nuevo[a]);
  const recortado: Record<string, number> = {};
  for (const k of claves.slice(0, 200)) recortado[k] = nuevo[k];
  return recortado;
}

/** Lee JSON sin reventar (almacén corrupto, modo privado, campo vacío…). */
export function leerJson<T>(texto: string | null | undefined, porDefecto: T): T {
  if (!texto) return porDefecto;
  try {
    const v = JSON.parse(texto) as unknown;
    if (v && typeof v === "object") return v as T;
    return porDefecto;
  } catch {
    return porDefecto;
  }
}

/**
 * Normaliza las señales reales de la casa a un `Senal` utilizable.
 * Acepta el formato de zustand-persist de `vg171-favoritos`
 * (`{ state: { favoritos: [...] } }`) y el plano (`[...]`), y tolera basura.
 */
export function normalizarSenal(bruto: {
  uso?: unknown;
  favoritos?: unknown;
  vistos?: unknown;
  ahora?: number;
}): Senal {
  const uso: Record<string, number> = {};
  if (bruto.uso && typeof bruto.uso === "object" && !Array.isArray(bruto.uso)) {
    for (const [k, v] of Object.entries(bruto.uso as Record<string, unknown>)) {
      const n = typeof v === "number" ? v : Number(v);
      if (Number.isFinite(n) && n > 0) uso[k] = Math.min(Math.floor(n), 9999);
    }
  }

  let favoritos: string[] = [];
  const f = bruto.favoritos as unknown;
  if (Array.isArray(f)) favoritos = f.filter((x): x is string => typeof x === "string");
  else if (f && typeof f === "object") {
    const posible = (f as { state?: { favoritos?: unknown } }).state?.favoritos;
    if (Array.isArray(posible)) favoritos = posible.filter((x): x is string => typeof x === "string");
  }

  const vistos: Record<string, number> = {};
  if (bruto.vistos && typeof bruto.vistos === "object" && !Array.isArray(bruto.vistos)) {
    for (const [k, v] of Object.entries(bruto.vistos as Record<string, unknown>)) {
      const n = typeof v === "number" ? v : Number(v);
      if (Number.isFinite(n) && n > 0) vistos[k] = n;
    }
  }

  return { uso, favoritos: [...new Set(favoritos)], vistos, ahora: bruto.ahora };
}

/** Paleta de la casa, en orden fijo (los colores no se inventan por pieza). */
export const PALETA = ["#7c5cff", "#22d3ee", "#ff4d8d", "#ffd166", "#34d399", "#f472b6", "#38bdf8", "#a78bfa", "#fb923c", "#4ade80"] as const;

/** Dos colores estables por persona/pieza: su tarjeta siempre se ve igual. */
export function tonoDe(semilla: string): { a: string; b: string } {
  const h = hash(semilla || "vanguard");
  return { a: PALETA[h % PALETA.length], b: PALETA[(h >>> 8) % PALETA.length] };
}

/** Inicial para el avatar (nunca revienta con vacío o emoji). */
export function inicialDe(nombre: string): string {
  const limpio = (nombre ?? "").trim();
  if (!limpio) return "V";
  return [...limpio][0].toUpperCase();
}

// ══════════════════════════════════════════════════════════════════════
// v422.3 · LA RULETA Y EL RESUMEN — dos piezas nuevas del motor
//
// `elegirSorprendente` es la sorpresa CON MEMORIA: no repite nada de lo que
// ya te está enseñando el carril ni lo que abriste hace un momento, y prefiere
// lo que nunca tocaste. Determinista con la semilla que se le pase (para poder
// probarla) y sin `Math.random` en el motor: el azar lo pone la pantalla.
// ══════════════════════════════════════════════════════════════════════ */

/** Cuántas impresiones distintas y cuántas aperturas hay en total (para la cabecera del carril). */
export function resumenSenal(senal: Senal): { puertas: number; aperturas: number; recientes: number } {
  const uso = senal.uso ?? {};
  const vistos = senal.vistos ?? {};
  // la basura del almacén no cuenta: ni negativos, ni NaN
  const aperturas =
    Object.values(uso).reduce((a, b) => a + (Number.isFinite(b) ? Math.max(0, b) : 0), 0) + Object.keys(vistos).length;
  const ahora = senal.ahora ?? Date.now();
  const recientes = Object.values(vistos).filter((t) => Number.isFinite(t) && ahora - t < VIDA_MEDIA_MS).length;
  return { puertas: Object.keys(vistos).length, aperturas, recientes };
}

/**
 * La ruleta: elige UNA puerta que sorprenda.
 * Reglas, en orden: (1) nunca una de las que ya estás viendo, (2) nunca una
 * abierta en la última hora, (3) primero las que nunca abriste, (4) desempate
 * por hash con la semilla — así dos toques seguidos dan puertas distintas y la
 * misma semilla da siempre la misma (prueba reproducible).
 */
export function elegirSorprendente(
  candidatos: Candidato[],
  senal: Senal = {},
  excluir: string[] = [],
  semilla = 0,
): Recomendacion | null {
  const ahora = senal.ahora ?? Date.now();
  const vistos = senal.vistos ?? {};
  const fuera = new Set(excluir);
  const hace = (id: string, href: string) => vistos[id] ?? vistos[href];

  const libres = candidatos.filter((c) => !fuera.has(c.id) && !fuera.has(c.href));
  if (libres.length === 0) return null;

  const UNA_HORA = 60 * 60 * 1000;
  const frios = libres.filter((c) => {
    const t = hace(c.id, c.href);
    return t === undefined || ahora - t > UNA_HORA;
  });
  const base = frios.length > 0 ? frios : libres;

  const nuevos = base.filter((c) => hace(c.id, c.href) === undefined);
  const bolsa = nuevos.length > 0 ? nuevos : base;

  const orden = [...bolsa].sort((a, b) => hash(a.id + ":" + semilla) - hash(b.id + ":" + semilla));
  const elegido = orden[0];
  const yaVisto = hace(elegido.id, elegido.href) !== undefined;
  return {
    ...elegido,
    puntos: 0,
    razon: yaVisto ? "la ruleta dice que vuelvas" : "la ruleta te enseña algo nuevo",
    detalle: { favorito: 0, impresiones: 0, afinidad: 0, novedad: 0, repeticion: 0 },
  };
}
