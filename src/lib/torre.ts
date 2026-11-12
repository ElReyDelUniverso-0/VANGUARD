// ============================================================
// v367.1 EL OJO DEL DUEÑO — LA TORRE DE CONTROL (la vista que faltaba)
//
// El Dueño vio la cortina eterna TRES veces (v177 red, v179 server zombi,
// v181 hilo muerto) y las tres veces se curó A CIEGAS: el salvavidas se
// construía, se publicaba y nadie sabía si alguna vez había salvado a
// alguien. La propuesta «TELEMETRÍA DE RESCATE» llevaba treinta mensajes
// viva en agent-ctx/improvement-inbox.md sin subir a la mesa.
//
// Esta lib es la mesa: un mostrador de contadores HONESTOS, anónimos y
// reales donde la casa anota lo que de verdad pasa en el aparato del
// visitante. Nada de números fingidos: si no hay señal, la Torre dice
// «SIN SEÑAL» (ley de la casa: la honestidad como técnica).
//
// ── LAS TRES DECISIONES DE DISEÑO ───────────────────────────
// ① CERO TABLA NUEVA. La Torre NO abre esquema: usa `site_counter`, el
//    mostrador de contadores que la casa ya tiene desde v34 (k TEXT PRIMARY
//    KEY, n BIGINT). Sus claves viven bajo el prefijo `torre:` y /api/visits
//    lee claves explícitas, así que jamás se pisan (verificado en su
//    readCounts/readTopRefs). Riesgo cero para la BD de producción.
// ② CERO DATO PERSONAL. Aquí no entra IP, ni user-agent, ni alias, ni id de
//    sesión: la Torre cuenta SUCESOS, no personas. Por eso su fuente es
//    `fnt:telemetria`, que ya estaba declarada PRIVADA en nucleo/fuentes.ts
//    desde v218 — es decir: jamás se consulta por la búsqueda global y jamás
//    sale por una API pública. La Torre respeta esa frontera por diseño.
// ③ CERO NÚMERO EXACTO. Los milisegundos de arranque NO se guardan: se
//    guardan por TRAMOS (bucketMs). Un tramo basta para diagnosticar una
//    cortina y no convierte al visitante en un expediente.
//
// ── QUÉ SE PUEDE ANOTAR (whitelist cerrada en el servidor) ──
//   arranque          la casa montó en el aparato (sesión nueva)
//   hidrata           el hilo principal sigue vivo (hidratación completa)
//   error-hilo        el aparato reportó un error de JS (onerror)
//   rechazo-promesa   una promesa murió sin dueño (unhandledrejection)
//   paso-globo/tab/zona/sala   el embudo REAL del camino del usuario
//   ojo · vigia · meta · cortina · watchdog
//                     los cinco salvavidas: un toque de anotación para cada
//                     ronda futura (la lib `senalTorre()` está exportada y
//                     documentada para que quien los toque los conecte — sin
//                     tocar mundo-webgl.tsx en esta ronda).
// ============================================================

import { db } from "@/lib/db";
import { asegurarTabla } from "@/lib/db-ddl";
import { APP_VERSION, APP_CODENAME } from "@/lib/version";

/** Las señales que la Torre acepta. Cerrada: lo que no está aquí no entra. */
export const SENALES_TORRE = [
  "arranque",
  "hidrata",
  "error-hilo",
  "rechazo-promesa",
  "paso-globo",
  "paso-tab",
  "paso-zona",
  "paso-sala",
  "ojo",
  "vigia",
  "meta",
  "cortina",
  "watchdog",
] as const;

export type SenalTorre = (typeof SENALES_TORRE)[number];

/** Los cuatro escalones del camino real del usuario (tap globo → tab → zona → sala). */
export const PASOS_EMBUDO = ["paso-globo", "paso-tab", "paso-zona", "paso-sala"] as const;

/** Los cinco salvavidas de la casa (v178 → v184), con su nombre de calle. */
export const SALVAVIDAS: { senal: SenalTorre; nombre: string; origen: string }[] = [
  { senal: "ojo", nombre: "EL OJO", origen: "v178 — el primer rescate de red" },
  { senal: "vigia", nombre: "EL VIGÍA", origen: "v181 — el server zombi" },
  { senal: "meta", nombre: "EL META", origen: "v182 — HTML puro, sin JS" },
  { senal: "cortina", nombre: "LA CORTINA DE PIEDRA", origen: "v184 — CSS al compositor" },
  { senal: "watchdog", nombre: "EL WATCHDOG DE SALA", origen: "v167 — salaAnclaPendiente" },
];

/**
 * TRAMOS DE ARRANQUE — los milisegundos se guardan en tramos, nunca exactos.
 * El tramo es lo único que hace falta para diagnosticar una cortina:
 * «¿cuántos aparatos tardaron más de 10 s en montar la casa?».
 */
export const TRAMOS_MS: { hasta: number; etiqueta: string }[] = [
  { hasta: 1_000, etiqueta: "<1 s" },
  { hasta: 2_500, etiqueta: "1–2,5 s" },
  { hasta: 5_000, etiqueta: "2,5–5 s" },
  { hasta: 10_000, etiqueta: "5–10 s" },
  { hasta: 20_000, etiqueta: "10–20 s" },
  { hasta: 40_000, etiqueta: "20–40 s" },
  { hasta: 120_000, etiqueta: "40 s–2 min" },
  { hasta: Number.POSITIVE_INFINITY, etiqueta: ">2 min" },
];

/** Devuelve la etiqueta del tramo al que pertenece un tiempo real (o null si no es un número). */
export function tramoDeMs(ms: number | null | undefined): string | null {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms < 0) return null;
  for (const t of TRAMOS_MS) {
    if (ms < t.hasta) return t.etiqueta;
  }
  return TRAMOS_MS[TRAMOS_MS.length - 1].etiqueta;
}

/** ¿Es una señal de la casa? (guarda de la whitelist, en un solo lugar). */
export function esSenalTorre(x: unknown): x is SenalTorre {
  return typeof x === "string" && (SENALES_TORRE as readonly string[]).includes(x);
}

// ── El mostrador (la tabla que la casa ya tenía desde v34) ──────────────
const TABLA = "site_counter";

async function asegurarMostrador(): Promise<void> {
  await asegurarTabla(
    TABLA,
    "CREATE TABLE IF NOT EXISTS site_counter (k TEXT PRIMARY KEY, n BIGINT NOT NULL DEFAULT 0)",
  );
}

const hoy = () => new Date().toISOString().slice(0, 10);
const aNumero = (n: bigint | number) => (typeof n === "bigint" ? Number(n) : n);

async function sumar(clave: string): Promise<void> {
  await db.$executeRaw`
    INSERT INTO site_counter (k, n) VALUES (${clave}, 1)
    ON CONFLICT (k) DO UPDATE SET n = site_counter.n + 1`;
}

/**
 * ANOTAR UNA SEÑAL — la única puerta de escritura de la Torre.
 * Idempotencia: no la hay a propósito. Cada llamada es un SUCESO real y se
 * cuenta; quien llame debe llamar una sola vez por suceso (el panel lo hace
 * con la cerradura de sesión de sessionStorage).
 */
export async function anotarSenal(senal: SenalTorre, ms?: number | null): Promise<void> {
  await asegurarMostrador();
  await sumar(`torre:${senal}`);
  await sumar(`torre:${senal}:${hoy()}`);
  const tramo = tramoDeMs(ms);
  if (tramo) {
    await sumar(`torre:ms:${tramo}`);
    await sumar(`torre:ms:${tramo}:${hoy()}`);
  }
}

// ── El parte de la Torre (solo lectura, para la sala y su API) ──────────
export interface FilaTorre {
  clave: string;
  total: number;
  hoy: number;
}

export interface ResumenTorre {
  ok: boolean;
  /** la firma de la casa que está midiendo */
  version: string;
  codename: string;
  consultadoEn: string;
  /** señales contadas (todas, incluidos los pasos del embudo) */
  senales: FilaTorre[];
  /** el embudo del camino real: cuántas veces se pisó cada escalón */
  embudo: (FilaTorre & { etiqueta: string })[];
  /** tramos de arranque medidos en el aparato del visitante */
  tramos: FilaTorre[];
  /** el corazón de la Torre: ¿cuántas casas montaron y cuántas se rompieron? */
  supervivencia: {
    arranques: number;
    hidratadas: number;
    erroresHilo: number;
    rechazos: number;
    /** % de arranques que llegaron a hidratar (null = sin datos todavía) */
    tasaHidratacion: number | null;
  };
  /** salvavidas con su nombre de calle y su cuenta real (0 = nunca se ha oído) */
  salvavidas: { senal: SenalTorre; nombre: string; origen: string; total: number; hoy: number }[];
  /** honestidad: si la BD no respondió, la sala lo dice en vez de fingir ceros */
  nota: string;
}

const FILA_VACIA = (clave: string): FilaTorre => ({ clave, total: 0, hoy: 0 });

function resumenVacio(nota: string): ResumenTorre {
  return {
    ok: false,
    version: APP_VERSION,
    codename: APP_CODENAME,
    consultadoEn: new Date().toISOString(),
    senales: [],
    embudo: [],
    tramos: [],
    supervivencia: {
      arranques: 0,
      hidratadas: 0,
      erroresHilo: 0,
      rechazos: 0,
      tasaHidratacion: null,
    },
    salvavidas: SALVAVIDAS.map((s) => ({ ...s, total: 0, hoy: 0 })),
    nota,
  };
}

/**
 * LEER LA TORRE — una sola consulta al mostrador (patrón v262: cero
 * consultas de más) y todo el cálculo en memoria. Si la BD falla, responde
 * el parte vacío con su nota honesta: la sala nunca miente.
 */
export async function leerTorre(): Promise<ResumenTorre> {
  try {
    await asegurarMostrador();
    const filas = await db.$queryRaw<{ k: string; n: bigint | number }[]>`
      SELECT k, n FROM site_counter WHERE k LIKE ${"torre:%"}`;

    const d = hoy();
    const total = new Map<string, number>();
    const delDia = new Map<string, number>();
    for (const f of filas) {
      const n = aNumero(f.n);
      const clave = f.k.slice("torre:".length);
      // las claves con fecha viven como <clave>:YYYY-MM-DD
      const m = /^(.*):(\d{4}-\d{2}-\d{2})$/.exec(clave);
      if (m) {
        if (m[2] === d) delDia.set(m[1], (delDia.get(m[1]) ?? 0) + n);
      } else {
        total.set(clave, (total.get(clave) ?? 0) + n);
      }
    }
    const fila = (clave: string): FilaTorre => ({
      ...FILA_VACIA(clave),
      total: total.get(clave) ?? 0,
      hoy: delDia.get(clave) ?? 0,
    });

    const senales = SENALES_TORRE.map((s) => fila(s));
    const embudo = PASOS_EMBUDO.map((p) => ({
      ...fila(p),
      etiqueta: p.replace("paso-", "").toUpperCase(),
    }));
    const tramos = TRAMOS_MS.map((t) => fila(`ms:${t.etiqueta}`)).map((f, i) => ({
      ...f,
      clave: TRAMOS_MS[i].etiqueta,
    }));

    const arranques = fila("arranque").total;
    const hidratadas = fila("hidrata").total;
    const erroresHilo = fila("error-hilo").total;
    const rechazos = fila("rechazo-promesa").total;

    return {
      ok: true,
      version: APP_VERSION,
      codename: APP_CODENAME,
      consultadoEn: new Date().toISOString(),
      senales,
      embudo,
      tramos,
      supervivencia: {
        arranques,
        hidratadas,
        erroresHilo,
        rechazos,
        tasaHidratacion:
          arranques > 0 ? Math.round((hidratadas / arranques) * 1000) / 10 : null,
      },
      salvavidas: SALVAVIDAS.map((s) => ({ ...s, total: fila(s.senal).total, hoy: fila(s.senal).hoy })),
      nota:
        arranques === 0
          ? "SIN SEÑAL — la Torre está escuchando pero ningún aparato ha anotado todavía. Esto no es un cero: es un «aún no»."
          : "Cuentas reales del mostrador de la casa (site_counter). Cero datos personales: la Torre cuenta sucesos, no personas.",
    };
  } catch {
    return resumenVacio(
      "SIN SEÑAL — la base de datos no respondió ahora mismo. La Torre no inventa ceros: no pudo leer.",
    );
  }
}
