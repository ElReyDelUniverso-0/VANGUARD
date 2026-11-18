// ═══════════════════════════════════════════════════════════════════
// v406.5 · EL PLANETA EN CIFRAS — LA TABLA ÚNICA
//
// Una fila por país, sacada de la ficha canónica (src/lib/mundos/ficha.ts):
// así el comparador, los rankings, las regiones, la demografía y las
// organizaciones dicen EXACTAMENTE la misma cifra que la ficha de cada país.
// Si mañana se refresca el censo del Banco Mundial, cambian todas a la vez.
//
// Reglas:
//   · nada se estima: un hueco es null y se escribe «sin dato»;
//   · todo agregado dice cuántos países tienen el dato (cobertura);
//   · las medias de una región se ponderan por población (la media simple
//     de 20 islas y un gigante no describe a nadie).
// ═══════════════════════════════════════════════════════════════════

import { fichas, regionEnEspanol, type FichaPais } from "@/lib/mundos/ficha";
import { IDS_INDICADOR, type FilaPlaneta, type IdIndicador } from "./indicadores";
import { SUBREGIONES_ES, slugDe } from "./subregiones";

export { SUBREGIONES_ES, slugDe };

function aFila(f: FichaPais): FilaPlaneta {
  const pob = f.poblacion;
  const sup = f.superficie;
  const pib = f.censo?.pib ?? null;
  const mil = f.militar ? f.militar.gasto : f.censo?.gastoMilitar ?? null;
  const subEs = f.subregion ? SUBREGIONES_ES[f.subregion] ?? f.subregion : "Sin subregión";
  return {
    iso2: f.iso2,
    iso3: f.iso3,
    nombre: f.nombre,
    region: f.region,
    regionEs: regionEnEspanol(f.region),
    sub: f.subregion,
    subEs,
    subSlug: slugDe(subEs),
    v: {
      pob,
      sup,
      dens: f.densidad,
      pib,
      pibPC: f.censo?.pibPC ?? null,
      mil,
      milPib: mil !== null && pib !== null && pib > 0 ? (mil / pib) * 100 : null,
      vida: f.censo?.esperanzaVida ?? null,
    },
    anios: f.censo?.anios ?? {},
  };
}

let CACHE: FilaPlaneta[] | null = null;

/** Todas las filas del planeta (249 países y territorios del censo geográfico). */
export function filasPlaneta(): FilaPlaneta[] {
  if (!CACHE) CACHE = fichas().map(aFila);
  return CACHE;
}

export function filaDe(iso2: string): FilaPlaneta | null {
  return filasPlaneta().find((f) => f.iso2 === iso2.toLowerCase()) ?? null;
}

/** ── Rankings ─────────────────────────────────────────────── */

export interface Puesto {
  fila: FilaPlaneta;
  valor: number;
  puesto: number;
}

/** Los países con dato, ordenados de mayor a menor (o al revés). */
export function ranking(id: IdIndicador, orden: "desc" | "asc" = "desc"): Puesto[] {
  const conDato = filasPlaneta()
    .filter((f) => f.v[id] !== null && Number.isFinite(f.v[id] as number))
    .map((f) => ({ fila: f, valor: f.v[id] as number }));
  conDato.sort((a, b) => (orden === "desc" ? b.valor - a.valor : a.valor - b.valor));
  return conDato.map((x, i) => ({ ...x, puesto: i + 1 }));
}

const CACHE_PUESTOS = new Map<IdIndicador, Map<string, number>>();

/** El puesto mundial de un país en un indicador (1 = el mayor). */
export function puestoDe(id: IdIndicador, iso2: string): { puesto: number; de: number } | null {
  let m = CACHE_PUESTOS.get(id);
  if (!m) {
    m = new Map(ranking(id).map((p) => [p.fila.iso2, p.puesto]));
    CACHE_PUESTOS.set(id, m);
  }
  const p = m.get(iso2.toLowerCase());
  return p ? { puesto: p, de: m.size } : null;
}

/** ── Agregados ────────────────────────────────────────────── */

export interface Agregado {
  paises: number;
  pob: number;
  sup: number;
  pib: number;
  mil: number;
  /** PIB total ÷ población de los países con PIB (no la media de medias) */
  pibPC: number | null;
  /** media de esperanza de vida ponderada por población */
  vida: number | null;
  dens: number | null;
  /** cuántos países aportan cada cifra */
  cobertura: Record<"pob" | "sup" | "pib" | "mil" | "vida", number>;
  mayorPob: FilaPlaneta | null;
  mayorPib: FilaPlaneta | null;
}

export function agregar(filas: FilaPlaneta[]): Agregado {
  let pob = 0,
    sup = 0,
    pib = 0,
    mil = 0,
    pobConPib = 0,
    vidaPond = 0,
    pobConVida = 0,
    pobConSup = 0,
    supConPob = 0;
  const cob = { pob: 0, sup: 0, pib: 0, mil: 0, vida: 0 };
  let mayorPob: FilaPlaneta | null = null;
  let mayorPib: FilaPlaneta | null = null;
  for (const f of filas) {
    const v = f.v;
    if (v.pob !== null) {
      pob += v.pob;
      cob.pob++;
      if (!mayorPob || (mayorPob.v.pob ?? 0) < v.pob) mayorPob = f;
    }
    if (v.sup !== null) {
      sup += v.sup;
      cob.sup++;
    }
    if (v.pob !== null && v.sup !== null && v.sup > 0) {
      pobConSup += v.pob;
      supConPob += v.sup;
    }
    if (v.pib !== null) {
      pib += v.pib;
      cob.pib++;
      if (v.pob !== null) pobConPib += v.pob;
      if (!mayorPib || (mayorPib.v.pib ?? 0) < v.pib) mayorPib = f;
    }
    if (v.mil !== null) {
      mil += v.mil;
      cob.mil++;
    }
    if (v.vida !== null && v.pob !== null) {
      vidaPond += v.vida * v.pob;
      pobConVida += v.pob;
      cob.vida++;
    }
  }
  return {
    paises: filas.length,
    pob,
    sup,
    pib,
    mil,
    pibPC: pobConPib > 0 ? pib / pobConPib : null,
    vida: pobConVida > 0 ? vidaPond / pobConVida : null,
    dens: supConPob > 0 ? pobConSup / supConPob : null,
    cobertura: cob,
    mayorPob,
    mayorPib,
  };
}

let CACHE_MUNDO: Agregado | null = null;
export function mundo(): Agregado {
  if (!CACHE_MUNDO) CACHE_MUNDO = agregar(filasPlaneta());
  return CACHE_MUNDO;
}

/** ── Regiones ─────────────────────────────────────────────── */

export interface Subregion {
  slug: string;
  nombre: string;
  /** nombre original del censo (Natural Earth / ONU) */
  original: string;
  region: string;
  regionEs: string;
  filas: FilaPlaneta[];
  agg: Agregado;
}

let CACHE_SUB: Subregion[] | null = null;

/** Las subregiones con al menos un país, ordenadas por población. */
export function subregiones(): Subregion[] {
  if (CACHE_SUB) return CACHE_SUB;
  const grupos = new Map<string, FilaPlaneta[]>();
  for (const f of filasPlaneta()) {
    if (!f.sub) continue;
    const g = grupos.get(f.subSlug) ?? [];
    g.push(f);
    grupos.set(f.subSlug, g);
  }
  CACHE_SUB = [...grupos.entries()]
    .map(([slug, filas]) => ({
      slug,
      nombre: filas[0].subEs,
      original: filas[0].sub,
      region: filas[0].region,
      regionEs: filas[0].regionEs,
      filas: [...filas].sort((a, b) => (b.v.pob ?? -1) - (a.v.pob ?? -1)),
      agg: agregar(filas),
    }))
    .sort((a, b) => b.agg.pob - a.agg.pob);
  return CACHE_SUB;
}

export function subregionDe(slug: string): Subregion | null {
  return subregiones().find((s) => s.slug === slug) ?? null;
}

/** Las grandes regiones (continentes del censo) con sus subregiones dentro. */
export function regiones(): { region: string; nombre: string; subs: Subregion[]; agg: Agregado }[] {
  const out = new Map<string, { region: string; nombre: string; subs: Subregion[]; filas: FilaPlaneta[] }>();
  for (const s of subregiones()) {
    const r = out.get(s.region) ?? { region: s.region, nombre: s.regionEs, subs: [], filas: [] };
    r.subs.push(s);
    r.filas.push(...s.filas);
    out.set(s.region, r);
  }
  return [...out.values()]
    .map((r) => ({ region: r.region, nombre: r.nombre, subs: r.subs, agg: agregar(r.filas) }))
    .sort((a, b) => b.agg.pob - a.agg.pob);
}

/** Lo que viaja al cliente para el comparador: las filas, nada más. */
export function payloadComparador(): FilaPlaneta[] {
  return filasPlaneta().map((f) => ({ ...f, v: { ...f.v } }));
}

/** Años más frecuentes de cada indicador (para escribir «datos de 2025»). */
export function anioTipico(clave: string): number | null {
  const cuenta = new Map<number, number>();
  for (const f of filasPlaneta()) {
    const a = f.anios[clave];
    if (a) cuenta.set(a, (cuenta.get(a) ?? 0) + 1);
  }
  let mejor: number | null = null;
  let max = 0;
  for (const [a, n] of cuenta) if (n > max) [mejor, max] = [a, n];
  return mejor;
}

export { IDS_INDICADOR };
