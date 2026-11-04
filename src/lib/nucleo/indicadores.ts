// ============================================================
// v223.0 EL BARÓMETRO — INDICADORES REALES DEL BANCO MUNDIAL
// El eslabón que faltaba en la cadena del mandato:
//   mapa → acontecimiento → país → INDICADORES → fuente
// Una fuente pública NUEVA de la casa (tarea (e) de la cola):
//   · API gratuita, SIN clave, del Banco Mundial.
//   · Licencia CC BY 4.0: Vanguard PRESERVA la atribución, escribe
//     su propio resumen de qué mide cada indicador y ENLAZA al
//     original — nada se presenta como propio.
//   · CERO valores inventados: los números SOLO entran por la API
//     (el catálogo de abajo no lleva un solo dato numérico). Si el
//     Banco Mundial no cubre una nación (Taiwán) o no responde, la
//     ficha lo DECLARA — ausencia honesta, no fingida.
// CUOTA: 4 peticiones en total por refresco (una por indicador,
// con TODAS las naciones en la misma URL, mrnev=1 = el valor más
// reciente no vacío) y cache en memoria 6 h. Nunca más de ~16
// peticiones/día por servidor.
// Puro dato + fetch acotado: sin React, sin BD, sin eval.
// ============================================================

/** La fuente, con su licencia y su original (atribución preservada). */
export const FUENTE_INDICADORES = {
  nombre: "Banco Mundial · Indicadores del Desarrollo Mundial",
  licencia: "CC BY 4.0 — atribución preservada",
  enlace: "https://datos.bancomundial.org/",
} as const;

export interface IndicadorCatalogo {
  /** Código oficial del Banco Mundial (WDI). */
  codigo: string;
  /** Nombre propio de la casa, en español de la casa. */
  nombre: string;
  /** Resumen PROPIO de qué mide (el Dueño manda: resumen propio + enlace). */
  descripcion: string;
  /** Cómo se muestra el valor. */
  formato: "entero" | "moneda" | "porcentaje";
}

/** Los 4 indicadores del barómetro — códigos VERIFICADOS uno a uno
 * contra la API v2 en el examen de esta ronda (respuestas reales
 * con valores y años). El catálogo NO lleva valores: solo nombres
 * propios, códigos y enlaces. */
export const INDICADORES: IndicadorCatalogo[] = [
  {
    codigo: "SP.POP.TOTL",
    nombre: "Población total",
    descripcion: "Cuántos habitantes registra el Banco Mundial: el peso humano del frente.",
    formato: "entero",
  },
  {
    codigo: "NY.GDP.MKTP.CD",
    nombre: "PIB nominal",
    descripcion: "El tamaño de la economía en dólares corrientes: el músculo fiscal que sostiene el esfuerzo de guerra.",
    formato: "moneda",
  },
  {
    codigo: "MS.MIL.XPND.GD.ZS",
    nombre: "Gasto militar",
    descripcion: "Qué parte de su economía dedica la nación a sus fuerzas armadas, en porcentaje del PIB.",
    formato: "porcentaje",
  },
  {
    codigo: "SM.POP.TOTL",
    nombre: "Stock migratorio",
    descripcion: "Cuántas personas nacidas fuera viven en la nación: la presión demográfica que el conflicto mueve.",
    formato: "entero",
  },
];

/** Enlace al ORIGINAL de cada indicador (atribución CC BY 4.0). */
export function enlaceOriginalDe(codigo: string): string {
  return `https://datos.bancomundial.org/indicador/${codigo}`;
}

/**
 * Las naciones del eslabón MAPAS (RELACION_PAIS_TEATRO en
 * relaciones.ts) en su código ISO-3 del Banco Mundial.
 * La prueba del censo vigila que AMBOS mapas digan lo mismo.
 * Taiwán va declarado (TWN) aunque el Banco Mundial no lo cubra:
 * la ficha mostrará la ausencia — se declara, no se finge.
 */
export const ISO3_POR_ISO2: Record<string, string> = {
  ua: "UKR",
  ru: "RUS",
  il: "ISR",
  ps: "PSE",
  lb: "LBN",
  ir: "IRN",
  tw: "TWN",
  cn: "CHN",
  ml: "MLI",
  ne: "NER",
  bf: "BFA",
  ye: "YEM",
  kp: "PRK",
  kr: "KOR",
  sd: "SDN",
};

const ISO2_POR_ISO3: Record<string, string> = Object.fromEntries(
  Object.entries(ISO3_POR_ISO2).map(([iso2, iso3]) => [iso3, iso2])
);

/** El valor CRUDO de un indicador, tal como llega del Banco Mundial.
 * v224 EL ESTRATEGA: la simulación necesita números, no textos —
 * misma fuente, misma cache, cero peticiones extra. */
export interface ValorNumericoIndicador {
  codigo: string;
  valor: number;
  anio: number;
}

/** Un indicador ya medido para una nación (el valor SOLO nace aquí,
 * traído por la API — jamás escrito a mano). */
export interface IndicadorPais {
  codigo: string;
  nombre: string;
  /** Valor formateado en español, listo para leer. */
  texto: string;
  /** Año del dato, tal cual lo publica el Banco Mundial. */
  anio: number;
  /** El original, para verificar el número en su casa. */
  enlaceOriginal: string;
}

/** El bloque que la ficha vg:pais sirve (página y API por igual). */
export interface FichaIndicadores {
  fuente: { nombre: string; licencia: string; enlace: string };
  valores: IndicadorPais[];
  /** Por qué NO hay valores, cuando no los hay (honestidad). */
  nota: string | null;
}

const NOTA_SIN_COBERTURA =
  "El Banco Mundial no publica estos indicadores para esta nación — ausencia declarada, no fingida.";
const NOTA_SIN_RED =
  "El Banco Mundial no respondió ahora — sin indicadores en esta ficha (nada fingido).";

// ── FORMATO (puro) ──────────────────────────────────────────

/** «37.860.221» · «2,2 billones de US$» · «8,5 % del PIB» — español. */
export function textoIndicador(valor: number, formato: IndicadorCatalogo["formato"]): string {
  if (!Number.isFinite(valor)) return "—";
  if (formato === "porcentaje") {
    return `${valor.toLocaleString("es-ES", { maximumFractionDigits: 1 })} % del PIB`;
  }
  if (formato === "moneda") {
    if (valor >= 1e12) {
      return `${(valor / 1e12).toLocaleString("es-ES", { maximumFractionDigits: 1 })} billones de US$`;
    }
    if (valor >= 1e9) {
      return `${(valor / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 1 })} mil millones de US$`;
    }
    return `${Math.round(valor).toLocaleString("es-ES")} US$`;
  }
  return Math.round(valor).toLocaleString("es-ES");
}

// ── LA DESCARGA (batch, con cuota y cache) ──────────────────

interface Snapshot {
  t: number;
  redOk: boolean;
  porIso2: Map<string, IndicadorPais[]>;
  /** v224: los mismos datos SIN formatear, para consumidores que
   * necesiten el número (la simulación). Misma vida que porIso2. */
  porIso2Crudo: Map<string, ValorNumericoIndicador[]>;
}

const TTL_LLENO = 6 * 60 * 60 * 1000; // 6 h con datos
const TTL_CAIDO = 5 * 60 * 1000; // 5 min si la red falló: reintentar pronto
let snapshot: Snapshot | null = null;

/** Una petición al Banco Mundial para UN indicador y TODAS las
 * naciones del barómetro. Devuelve las filas crudas o [] (fallo
 * honesto: un indicador caído no tumba el resto). */
async function pedirIndicador(codigo: string): Promise<{ iso3: string; date: string; value: number }[]> {
  const paises = Object.values(ISO3_POR_ISO2).join(";");
  const url = `https://api.worldbank.org/v2/country/${paises}/indicator/${codigo}?format=json&per_page=90&mrnev=1`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Vanguard/2.0 (+https://vanguard-kq9r.vercel.app · atribución CC BY 4.0)" },
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) return [];
    const cuerpo: unknown = await res.json();
    if (!Array.isArray(cuerpo)) return [];
    const filas = cuerpo[1];
    if (!Array.isArray(filas)) return []; // p. ej. total 0: ausencia real
    return filas
      .filter(
        (f): f is { countryiso3code: string; date: string; value: number } =>
          !!f &&
          typeof f === "object" &&
          typeof (f as { countryiso3code?: unknown }).countryiso3code === "string" &&
          typeof (f as { date?: unknown }).date === "string" &&
          typeof (f as { value?: unknown }).value === "number" &&
          Number.isFinite((f as { value?: unknown }).value as number)
      )
      .map((f) => ({ iso3: f.countryiso3code, date: f.date, value: f.value }));
  } catch {
    return []; // la red falló para este indicador: se declara abajo
  } finally {
    clearTimeout(t);
  }
}

/** El refresco del barómetro: 4 peticiones como máximo (una por
 * indicador), cache 6 h (5 min si el Banco Mundial está mudo). */
async function snapshotBarometro(): Promise<Snapshot> {
  if (snapshot && Date.now() - snapshot.t < (snapshot.redOk ? TTL_LLENO : TTL_CAIDO)) {
    return snapshot;
  }
  const porIso2 = new Map<string, IndicadorPais[]>();
  const porIso2Crudo = new Map<string, ValorNumericoIndicador[]>();
  const respuestas = await Promise.allSettled(INDICADORES.map((ind) => pedirIndicador(ind.codigo)));
  let redOk = false;
  INDICADORES.forEach((ind, i) => {
    const r = respuestas[i];
    if (r.status !== "fulfilled" || r.value.length === 0) return;
    redOk = true;
    for (const fila of r.value) {
      const iso2 = ISO2_POR_ISO3[fila.iso3];
      if (!iso2) continue;
      const anio = Number.parseInt(fila.date, 10);
      if (!Number.isFinite(anio)) continue;
      const lista = porIso2.get(iso2) ?? [];
      if (!lista.some((v) => v.codigo === ind.codigo)) {
        lista.push({
          codigo: ind.codigo,
          nombre: ind.nombre,
          texto: textoIndicador(fila.value, ind.formato),
          anio,
          enlaceOriginal: enlaceOriginalDe(ind.codigo),
        });
        porIso2.set(iso2, lista);
        const cruda = porIso2Crudo.get(iso2) ?? [];
        cruda.push({ codigo: ind.codigo, valor: fila.value, anio });
        porIso2Crudo.set(iso2, cruda);
      }
    }
  });
  snapshot = { t: Date.now(), redOk, porIso2, porIso2Crudo };
  return snapshot;
}

/** v224 EL ESTRATEGA — los valores CRUDOS del barómetro para UN país
 * (números de verdad, sin formatear; [] si el país no está en el
 * eslabón o el Banco Mundial no respondió: ausencia honesta). */
export async function indicadoresNumericosDePais(iso2: string): Promise<ValorNumericoIndicador[]> {
  if (!ISO3_POR_ISO2[iso2]) return [];
  try {
    const snap = await snapshotBarometro();
    return (snap.porIso2Crudo.get(iso2) ?? []).map((v) => ({ ...v }));
  } catch {
    return [];
  }
}

/** Los indicadores de UN país del eslabón (o null si el país no
 * forma parte del barómetro — sin bloque, sin ruido). NUNCA lanza:
 * si el Banco Mundial no responde, la ficha lo declara. */
export async function indicadoresDePais(iso2: string): Promise<FichaIndicadores | null> {
  if (!ISO3_POR_ISO2[iso2]) return null;
  try {
    const snap = await snapshotBarometro();
    const valores = snap.porIso2.get(iso2) ?? [];
    return {
      fuente: { ...FUENTE_INDICADORES },
      valores,
      nota: valores.length === 0 ? (snap.redOk ? NOTA_SIN_COBERTURA : NOTA_SIN_RED) : null,
    };
  } catch {
    return { fuente: { ...FUENTE_INDICADORES }, valores: [], nota: NOTA_SIN_RED };
  }
}
