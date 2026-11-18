// ============================================================
// v407.0 · LA CACHÉ — recordar sin mentir
//
// El problema: varias salidas de la casa recalculan lo mismo en cada petición
// (catálogo de datos, diagnóstico, agregados de señales). En Vercel cada
// instancia es efímera y hay varias en paralelo: una caché en memoria es
// HUMILDE por definición, y aquí se declara como tal.
//
// Reglas:
//   · Vive en la memoria del proceso: no se comparte entre instancias ni
//     sobrevive a un despliegue. Nunca se presenta como caché global.
//   · TTL explícito y obligatorio. Sin TTL no se cachea: un dato viejo sin
//     fecha es una mentira.
//   · Anti-estampida: dos peticiones simultáneas con la misma clave comparten
//     la misma promesa (si el cálculo falla, falla para ambos y NO se guarda).
//   · Si el valor tarda más de lo razonable, el siguiente que llegue lo pide
//     otra vez: la caché acelera, no bloquea.
// ============================================================

interface Entrada {
  valor: unknown;
  expira: number;
  creada: number;
}

const ALMACEN = new Map<string, Entrada>();
const EN_VUELO = new Map<string, Promise<unknown>>();
const STATS = { hits: 0, fallos: 0, expirados: 0, errores: 0 };
export const MAX_CLAVES = 200;

/** Lee de caché si está fresca; si no, calcula, guarda y devuelve. */
export async function memo<T>(clave: string, ttlMs: number, calcular: () => Promise<T>): Promise<{ valor: T; cacheado: boolean }> {
  const ahora = Date.now();
  const guardada = ALMACEN.get(clave);
  if (guardada) {
    if (guardada.expira > ahora) {
      STATS.hits++;
      return { valor: guardada.valor as T, cacheado: true };
    }
    ALMACEN.delete(clave);
    STATS.expirados++;
  }

  const enCurso = EN_VUELO.get(clave);
  if (enCurso) {
    STATS.hits++;
    return { valor: (await enCurso) as T, cacheado: true };
  }

  STATS.fallos++;
  const promesa = (async () => {
    try {
      const valor = await calcular();
      if (ALMACEN.size >= MAX_CLAVES) {
        // desalojo del más antiguo: la casa prefiere simple y predecible
        const primera = ALMACEN.keys().next();
        if (!primera.done) ALMACEN.delete(primera.value);
      }
      ALMACEN.set(clave, { valor, expira: Date.now() + Math.max(0, ttlMs), creada: ahora });
      return valor;
    } catch (e) {
      STATS.errores++;
      throw e;
    } finally {
      EN_VUELO.delete(clave);
    }
  })();

  EN_VUELO.set(clave, promesa);
  return { valor: (await promesa) as T, cacheado: false };
}

/** Estado legible de la caché (para /sistema y /api/sistema/diagnostico). */
export function estadoCache() {
  const ahora = Date.now();
  let frescas = 0;
  let caducadas = 0;
  for (const e of ALMACEN.values()) {
    if (e.expira > ahora) frescas++;
    else caducadas++;
  }
  const total = STATS.hits + STATS.fallos;
  return {
    ...STATS,
    claves: ALMACEN.size,
    frescas,
    caducadas,
    limite: MAX_CLAVES,
    acierto: total > 0 ? Math.round((STATS.hits / total) * 100) : 0,
    ambito: "memoria del proceso · no compartida entre instancias ni entre despliegues",
  };
}

/** Vacía todo (o solo un prefijo) — lo usa el diagnóstico y las pruebas. */
export function limpiarCache(prefijo?: string): number {
  let n = 0;
  for (const clave of [...ALMACEN.keys()]) {
    if (!prefijo || clave.startsWith(prefijo)) {
      ALMACEN.delete(clave);
      n++;
    }
  }
  return n;
}
