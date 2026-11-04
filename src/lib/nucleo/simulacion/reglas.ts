// ============================================================
// v224.0 EL ESTRATEGA — REGLAS (separadas de DATOS y RESULTADOS)
// El motor aritmético del escenario: funciones PURAS y
// DETERMINISTAS. Aquí NO hay reloj, ni BD, ni red, ni azar, ni
// eval: los datos entran hechos por parámetro y salen los
// factores normalizados 0–100 con su desglose. Mismo input →
// mismo output, siempre — es lo que lo hace VERIFICABLE.
//
// Los ANCLAS de saturación (3650 días, 500 cables, 12 frentes,
// 10 % del PIB) NO son datos: son decisiones editoriales de la
// casa, visibles en el desglose de cada resultado y declaradas
// en los límites del escenario. Cambiarlas cambia el resultado —
// por eso viven aquí, a la vista.
// ============================================================

/** Los anclas del modelo — editoriales, visibles, discutibles. */
export const ANCLAS = {
  /** Días que saturan el factor tiempo: 10 años → 100 puntos. */
  TIEMPO_DIAS: 3650,
  /** Cables del archivo que saturan el factor cobertura: 500 → 100. */
  COBERTURA_CABLES: 500,
  /** Frentes documentados que saturan el factor: 12 → 100 (el frente
   * más documentado de la casa hoy: la sala OSINT de Ucrania). */
  FRENTES: 12,
  /** Gasto militar medio (% PIB) que satura el factor: 10 % → 100. */
  CAPACIDAD_PCT: 10,
} as const;

/** El dato ya recogido de UN teatro (lo monta datos.ts — aquí solo
 * se consume; null = el dato no existe y se declara, no se finge). */
export interface DatoTeatro {
  slug: string;
  nombre: string;
  /** Días transcurridos desde el inicio documentado del hecho (medido
   * UNA vez al recoger datos — las reglas no conocen el reloj). */
  diasDesde: number | null;
  /** Cables reales del archivo con este conflictTag. */
  cables: number;
  /** Frentes documentados en la sala OSINT (null = teatro sin sala). */
  frentes: number | null;
  /** Gasto militar medio % PIB de las naciones implicadas (null si el
   * Banco Mundial no cubre a ninguna o no respondió). */
  gastoMilitarPct: number | null;
  /** De dónde salió CADA dato (fnt:…, con detalle humano). */
  procedencias: string[];
  /** El año del dato del Banco Mundial usado (honestidad). */
  anioIndicadores: number | null;
}

/** El desglose de un teatro evaluado: cada factor con su crudo, su
 * ancla y su valor normalizado — nada de cajas negras. */
export interface DesgloseFactor {
  crudo: string; // «1 741 días» · «173 cables» · «12 frentes» · «5,4 % PIB»
  ancla: string; // «100 a 3 650 días» · …
  valor: number | null; // 0–100 (null = sin dato, excluido)
}

export interface ResultadoTeatro {
  slug: string;
  nombre: string;
  factores: {
    tiempo: DesgloseFactor;
    cobertura: DesgloseFactor;
    frentes: DesgloseFactor;
    capacidad: DesgloseFactor;
  };
  /** Pesos aplicados (los que el usuario validó). */
  pesos: Record<string, number>;
  /** La puntuación final 0–100 (null si ningún factor tenía dato). */
  total: number | null;
  /** Factores excluidos por falta de dato — declarados, no fingidos. */
  faltantes: string[];
}

const dias = (n: number) => `${Math.round(n).toLocaleString("es-ES")} días`;

/** Redondeo honesto a 1 decimal (evita el ruido de coma flotante). */
function a1(x: number): number {
  return Math.round(x * 10) / 10;
}

/** Tiempo con rendimiento decreciente: log1p(días)/log1p(ancla)·100. */
export function factorTiempo(diasDesde: number | null): number | null {
  if (diasDesde === null || diasDesde < 0) return null;
  return a1(Math.min(100, (100 * Math.log1p(diasDesde)) / Math.log1p(ANCLAS.TIEMPO_DIAS)));
}

/** Cobertura: cables reales del archivo contra el ancla (satura). */
export function factorCobertura(cables: number): number | null {
  if (!Number.isFinite(cables) || cables < 0) return null;
  return a1(Math.min(100, (100 * cables) / ANCLAS.COBERTURA_CABLES));
}

/** Frentes documentados: los puntos de la sala OSINT contra el ancla. */
export function factorFrentes(frentes: number | null): number | null {
  if (frentes === null || !Number.isFinite(frentes) || frentes < 0) return null;
  return a1(Math.min(100, (100 * frentes) / ANCLAS.FRENTES));
}

/** Capacidad: gasto militar medio % PIB contra el ancla. */
export function factorCapacidad(gastoMilitarPct: number | null): number | null {
  if (gastoMilitarPct === null || !Number.isFinite(gastoMilitarPct) || gastoMilitarPct < 0) return null;
  return a1(Math.min(100, (100 * gastoMilitarPct) / ANCLAS.CAPACIDAD_PCT));
}

/**
 * LA REGLA DE AGREGACIÓN (SUP-AGREGACION): media ponderada de los
 * factores DISPONIBLES (un factor sin dato se excluye y los pesos
 * restantes renormalizan). Si el usuario mandó todo a cero o ningún
 * factor tiene dato → total null, declarado.
 */
export function evaluarTeatro(dato: DatoTeatro, pesos: Record<string, number>): ResultadoTeatro {
  const t = factorTiempo(dato.diasDesde);
  const c = factorCobertura(dato.cables);
  const f = factorFrentes(dato.frentes);
  const k = factorCapacidad(dato.gastoMilitarPct);

  const factores = {
    tiempo: {
      crudo: dato.diasDesde === null ? "sin fecha documentada" : dias(dato.diasDesde),
      ancla: `100 a ${dias(ANCLAS.TIEMPO_DIAS)}`,
      valor: t,
    },
    cobertura: {
      crudo: `${dato.cables.toLocaleString("es-ES")} cables`,
      ancla: `100 a ${ANCLAS.COBERTURA_CABLES.toLocaleString("es-ES")} cables`,
      valor: c,
    },
    frentes: {
      crudo: dato.frentes === null ? "sin sala OSINT documentada" : `${dato.frentes} frentes`,
      ancla: `100 a ${ANCLAS.FRENTES} frentes`,
      valor: f,
    },
    capacidad: {
      crudo:
        dato.gastoMilitarPct === null
          ? "sin dato del Banco Mundial"
          : `${dato.gastoMilitarPct.toLocaleString("es-ES", { maximumFractionDigits: 1 })} % del PIB`,
      ancla: `100 a ${ANCLAS.CAPACIDAD_PCT} % del PIB`,
      valor: k,
    },
  };

  const pares: { peso: number; valor: number | null }[] = [
    { peso: pesos.pesoTiempo ?? 0, valor: t },
    { peso: pesos.pesoCobertura ?? 0, valor: c },
    { peso: pesos.pesoFrentes ?? 0, valor: f },
    { peso: pesos.pesoCapacidad ?? 0, valor: k },
  ];

  const faltantes: string[] = [];
  if (t === null) faltantes.push("tiempo");
  if (c === null) faltantes.push("cobertura");
  if (f === null) faltantes.push("frentes");
  if (k === null) faltantes.push("capacidad");

  let suma = 0;
  let pesoVivo = 0;
  for (const { peso, valor } of pares) {
    if (valor === null) continue; // sin dato: excluido, no cero
    suma += peso * valor;
    pesoVivo += peso;
  }

  const total = pesoVivo > 0 ? a1(suma / pesoVivo) : null;
  return { slug: dato.slug, nombre: dato.nombre, factores, pesos, total, faltantes };
}

/** Ordena: mayor presión primero; los sin puntuación al final, con
 * su nombre (orden estable — el empate no baila entre peticiones). */
export function ordenaResultados(resultados: ResultadoTeatro[]): ResultadoTeatro[] {
  return [...resultados].sort((a, b) => {
    if (a.total === null && b.total === null) return a.nombre.localeCompare(b.nombre, "es");
    if (a.total === null) return 1;
    if (b.total === null) return -1;
    if (b.total !== a.total) return b.total - a.total;
    return a.nombre.localeCompare(b.nombre, "es");
  });
}
