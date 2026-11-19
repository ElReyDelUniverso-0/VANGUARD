// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — índice de datos (SOLO servidor).
// Lee los JSON generados por lingua-qa/construir.py (Glottolog 5.4,
// ISO 639-3, Unicode CLDR 49, Wikcionario) y expone consultas tipadas.
// Nunca se importa desde un componente "use client": lenguas.json y
// dialectos.json pesan ~700 KB cada uno y no deben viajar al navegador.
// ═══════════════════════════════════════════════════════════════════

import lenguasJson from "./datos/lenguas.json";
import nodosJson from "./datos/nodos.json";
import dialectosJson from "./datos/dialectos.json";
import cldrJson from "./datos/cldr.json";
import palabrasJson from "./datos/palabras.json";
import expresionesJson from "./datos/expresiones.json";
import nombresWiktJson from "./datos/nombres-wikt.json";
import alfabetosJson from "./datos/alfabetos.json";
import escriturasJson from "./datos/escrituras.json";
import { AES_ES, CATEGORIAS_ES, MACROAREAS_ES, MED_ES, normalizarLingua } from "./tipos";
import { FICHAS_FAMILIA, NOMBRES_FAMILIA_ES } from "./familias";

// ── tipos ──────────────────────────────────────────────────────────
export interface Lengua {
  id: string;
  nombre: string;
  /** nombre en español (CLDR o Wikcionario), si existe */
  nombreEs: string;
  iso: string;
  macro: string;
  lat: number | null;
  lon: number | null;
  paises: string[];
  /** familia de primer nivel ('' si es aislada) */
  familia: string;
  /** nodo inmediatamente superior ('' si es aislada) */
  padre: string;
  categoria: string;
  /** índice en AES_ES (-1 sin dato) */
  aes: number;
  med: string;
  nDialectos: number;
  aislada: boolean;
}

export interface Nodo {
  id: string;
  nombre: string;
  padre: string;
  nLenguas: number;
  pseudo: boolean;
}

export interface Dialecto {
  id: string;
  nombre: string;
  lengua: string;
  padre: string;
}

export type Traduccion = [texto: string, transliteracion: string, nota: string];

export interface Concepto {
  id: string;
  palabra: string;
  acepcion: string;
  revision: string;
  fuente: string;
  t: Record<string, Traduccion[]>;
}

export interface Expresion {
  id: string;
  es: string;
  categoria: string;
  pagina: string;
  glosa: string;
  revision: number;
  fuente: string;
  t: Record<string, Traduccion[]>;
}

export interface Alfabeto {
  principal: string[];
  total: number;
  muestra: string[];
  indice: string[];
  auxiliar: string[];
  numeros: string[];
  escritura: string;
}

export interface Escritura {
  codigo: string;
  nombre: string;
  tipo: string;
  direccion: string;
  estado: string;
  epoca: string;
  lugar: string;
  ancestro?: [string, string, string];
  origenTexto?: string;
  creador?: string;
  letras: string;
  caja: boolean;
  muestra: string[];
  muestraNombres: string[];
  muestraCodigos: string[];
  unicode: [string, string];
  wiki: string;
  texto: string;
  lenguasP: string[];
  lenguasS: string[];
}

interface TerritorioCldr {
  pob: number;
  l: [code: string, pct: number, estatus: string, glotto: string][];
}

// ── carga perezosa ─────────────────────────────────────────────────
const L = lenguasJson as unknown as {
  fuente: string;
  macroareas: string[];
  categorias: string[];
  aes: string[];
  med: string[];
  filas: (string | number | null)[][];
};

const CLDR = cldrJson as unknown as {
  fuente: string;
  territorios: Record<string, TerritorioCldr>;
  escrituras: Record<string, { p: string[]; s: string[] }>;
  usuarios: Record<string, number>;
  glotto: Record<string, string>;
  probable: Record<string, string>;
  nombresLengua: Record<string, string>;
  variedades: Record<string, string>;
  nombresEscritura: Record<string, string>;
  nombresTerritorio: Record<string, string>;
  macrolenguas: Record<string, string[]>;
  iso1: Record<string, string>;
};

export const FUENTE_GLOTTOLOG = L.fuente;
export const FUENTE_CLDR = CLDR.fuente;

interface Indice {
  lenguas: Lengua[];
  porId: Map<string, Lengua>;
  nodos: Map<string, Nodo>;
  dialectos: Map<string, Dialecto>;
  hijosNodo: Map<string, Nodo[]>;
  hijosLengua: Map<string, Lengua[]>;
  hijosDialecto: Map<string, Dialecto[]>;
  porPais: Map<string, Lengua[]>;
  porIso: Map<string, Lengua>;
  /** glottocode → código CLDR/Wikcionario */
  codigoDe: Map<string, string>;
  textoBusqueda: Map<string, string>;
}

let INDICE: Indice | null = null;

function construir(): Indice {
  const lenguas: Lengua[] = L.filas.map((f) => {
    const macroIdx = f[3] as number;
    const catIdx = f[9] as number;
    const medIdx = f[11] as number;
    return {
      id: f[0] as string,
      nombre: f[1] as string,
      iso: (f[2] as string) || "",
      macro: macroIdx >= 0 ? L.macroareas[macroIdx] ?? "" : "",
      lat: typeof f[4] === "number" ? (f[4] as number) : null,
      lon: typeof f[5] === "number" ? (f[5] as number) : null,
      paises: f[6] ? String(f[6]).split(";").filter(Boolean) : [],
      familia: (f[7] as string) || "",
      padre: (f[8] as string) || "",
      categoria: catIdx >= 0 ? L.categorias[catIdx] ?? "" : "",
      aes: (f[10] as number) ?? -1,
      med: medIdx >= 0 ? L.med[medIdx] ?? "" : "",
      nDialectos: (f[12] as number) || 0,
      nombreEs: (f[13] as string) || "",
      aislada: f[14] === 1,
    };
  });
  const porId = new Map(lenguas.map((l) => [l.id, l]));
  const nodos = new Map<string, Nodo>();
  for (const n of nodosJson as unknown as (string | number)[][]) {
    nodos.set(n[0] as string, {
      id: n[0] as string,
      nombre: n[1] as string,
      padre: (n[2] as string) || "",
      nLenguas: (n[3] as number) || 0,
      pseudo: n[4] === 1,
    });
  }
  const dialectos = new Map<string, Dialecto>();
  for (const d of dialectosJson as unknown as string[][]) {
    dialectos.set(d[0], { id: d[0], nombre: d[1], lengua: d[2], padre: d[3] });
  }
  const hijosNodo = new Map<string, Nodo[]>();
  for (const n of nodos.values()) {
    if (!n.padre) continue;
    const a = hijosNodo.get(n.padre) ?? [];
    a.push(n);
    hijosNodo.set(n.padre, a);
  }
  const hijosLengua = new Map<string, Lengua[]>();
  const porPais = new Map<string, Lengua[]>();
  const porIso = new Map<string, Lengua>();
  for (const l of lenguas) {
    if (l.padre) {
      const a = hijosLengua.get(l.padre) ?? [];
      a.push(l);
      hijosLengua.set(l.padre, a);
    }
    for (const p of l.paises) {
      const a = porPais.get(p) ?? [];
      a.push(l);
      porPais.set(p, a);
    }
    if (l.iso) porIso.set(l.iso, l);
  }
  const hijosDialecto = new Map<string, Dialecto[]>();
  for (const d of dialectos.values()) {
    const a = hijosDialecto.get(d.padre) ?? [];
    a.push(d);
    hijosDialecto.set(d.padre, a);
  }
  const porNombre = (a: { nombre: string }, b: { nombre: string }) => a.nombre.localeCompare(b.nombre, "en");
  for (const a of hijosNodo.values()) a.sort((x, y) => y.nLenguas - x.nLenguas || porNombre(x, y));
  for (const a of hijosLengua.values()) a.sort(porNombre);
  for (const a of hijosDialecto.values()) a.sort(porNombre);

  // glottocode → código corto: primero el de CLDR (que es el que usan los
  // nombres en español y Wikcionario), luego ISO 639-1, luego ISO 639-3.
  const codigoDe = new Map<string, string>();
  for (const [code, g] of Object.entries(CLDR.glotto)) {
    if (!codigoDe.has(g) || code.length < (codigoDe.get(g) ?? "").length) codigoDe.set(g, code);
  }
  for (const l of lenguas) {
    if (codigoDe.has(l.id) || !l.iso) continue;
    codigoDe.set(l.id, CLDR.iso1[l.iso] ?? l.iso);
  }

  // nombre en español de CLDR para lenguas cuyo código corto lo tiene (p. ej. gn → guaraní)
  for (const l of lenguas) {
    if (l.nombreEs) continue;
    const code = codigoDe.get(l.id);
    const es = code ? CLDR.nombresLengua[code] : undefined;
    if (es && CLDR.glotto[code as string] === l.id) l.nombreEs = es;
  }

  const textoBusqueda = new Map<string, string>();
  for (const l of lenguas) {
    const code = codigoDe.get(l.id) ?? "";
    textoBusqueda.set(l.id, normalizarLingua(`${l.nombre} ${l.nombreEs} ${l.iso} ${code} ${l.id}`));
  }
  return { lenguas, porId, nodos, dialectos, hijosNodo, hijosLengua, hijosDialecto, porPais, porIso, codigoDe, textoBusqueda };
}

function idx(): Indice {
  if (!INDICE) INDICE = construir();
  return INDICE;
}

// ── consultas básicas ──────────────────────────────────────────────
export const todasLasLenguas = () => idx().lenguas;
export const lenguaPorId = (id: string) => idx().porId.get(id);
export const nodoPorId = (id: string) => idx().nodos.get(id);
export const dialectoPorId = (id: string) => idx().dialectos.get(id);
export const lenguaPorIso = (iso: string) => idx().porIso.get(iso);
export const codigoCorto = (id: string) => idx().codigoDe.get(id) ?? "";

export type TipoLanguoide = "lengua" | "familia" | "dialecto";
export function tipoDe(id: string): TipoLanguoide | null {
  const i = idx();
  if (i.porId.has(id)) return "lengua";
  if (i.nodos.has(id)) return "familia";
  if (i.dialectos.has(id)) return "dialecto";
  return null;
}

export function nombreLengua(l: Lengua): string {
  return l.nombreEs ? capitalizar(l.nombreEs) : l.nombre;
}

export function nombreNodo(n: Nodo): string {
  const es = NOMBRES_FAMILIA_ES[n.id];
  return es ?? n.nombre;
}

export function nombreDe(id: string): string {
  const i = idx();
  const l = i.porId.get(id);
  if (l) return nombreLengua(l);
  const n = i.nodos.get(id);
  if (n) return nombreNodo(n);
  return i.dialectos.get(id)?.nombre ?? id;
}

export function capitalizar(s: string): string {
  return s ? s.charAt(0).toLocaleUpperCase("es") + s.slice(1) : s;
}

export interface Paso {
  id: string;
  nombre: string;
  tipo: TipoLanguoide;
}

/** cadena de antepasados (de la raíz hacia abajo), sin incluir el propio id */
export function linaje(id: string): Paso[] {
  const i = idx();
  const out: Paso[] = [];
  let padre = i.porId.get(id)?.padre ?? i.nodos.get(id)?.padre ?? i.dialectos.get(id)?.padre ?? "";
  let guardas = 0;
  while (padre && guardas++ < 60) {
    const n = i.nodos.get(padre);
    if (n) {
      out.unshift({ id: n.id, nombre: nombreNodo(n), tipo: "familia" });
      padre = n.padre;
      continue;
    }
    const l = i.porId.get(padre);
    if (l) {
      out.unshift({ id: l.id, nombre: nombreLengua(l), tipo: "lengua" });
      padre = l.padre;
      continue;
    }
    const d = i.dialectos.get(padre);
    if (d) {
      out.unshift({ id: d.id, nombre: d.nombre, tipo: "dialecto" });
      padre = d.padre;
      continue;
    }
    break;
  }
  return out;
}

export function hijosDe(id: string): { nodos: Nodo[]; lenguas: Lengua[]; dialectos: Dialecto[] } {
  const i = idx();
  return {
    nodos: i.hijosNodo.get(id) ?? [],
    lenguas: i.hijosLengua.get(id) ?? [],
    dialectos: i.hijosDialecto.get(id) ?? [],
  };
}

/** todas las lenguas bajo un nodo de familia (recorrido en profundidad) */
export function lenguasBajo(id: string): Lengua[] {
  const i = idx();
  const out: Lengua[] = [];
  const pila = [id];
  let vueltas = 0;
  while (pila.length && vueltas++ < 20000) {
    const actual = pila.pop() as string;
    for (const l of i.hijosLengua.get(actual) ?? []) out.push(l);
    for (const n of i.hijosNodo.get(actual) ?? []) pila.push(n.id);
  }
  return out;
}

export function dialectosDe(lenguaId: string): Dialecto[] {
  const i = idx();
  const out: Dialecto[] = [];
  const pila = [lenguaId];
  while (pila.length) {
    const actual = pila.pop() as string;
    for (const d of i.hijosDialecto.get(actual) ?? []) {
      out.push(d);
      pila.push(d.id);
    }
  }
  return out;
}

// ── resúmenes ──────────────────────────────────────────────────────
export interface Resumen {
  n: number;
  aes: number[];
  sinAes: number;
  macro: Record<string, number>;
  paises: [string, number][];
  med: Record<string, number>;
  categorias: Record<string, number>;
  conIso: number;
}

export function resumir(lenguas: Lengua[]): Resumen {
  const aes = AES_ES.map(() => 0);
  let sinAes = 0;
  const macro: Record<string, number> = {};
  const paises = new Map<string, number>();
  const med: Record<string, number> = {};
  const categorias: Record<string, number> = {};
  let conIso = 0;
  for (const l of lenguas) {
    if (l.aes >= 0 && l.aes < aes.length) aes[l.aes]++;
    else sinAes++;
    if (l.macro) macro[l.macro] = (macro[l.macro] ?? 0) + 1;
    for (const p of l.paises) paises.set(p, (paises.get(p) ?? 0) + 1);
    if (l.med) med[l.med] = (med[l.med] ?? 0) + 1;
    if (l.categoria) categorias[l.categoria] = (categorias[l.categoria] ?? 0) + 1;
    if (l.iso) conIso++;
  }
  return { n: lenguas.length, aes, sinAes, macro, paises: [...paises.entries()].sort((a, b) => b[1] - a[1]), med, categorias, conIso };
}

/** familias de primer nivel, separadas en genealógicas y pseudofamilias */
export function familiasRaiz(): { reales: { nodo: Nodo; n: number }[]; pseudo: { nodo: Nodo; n: number }[]; aisladas: Lengua[] } {
  const i = idx();
  const cuenta = new Map<string, number>();
  for (const l of i.lenguas) if (l.familia) cuenta.set(l.familia, (cuenta.get(l.familia) ?? 0) + 1);
  const reales: { nodo: Nodo; n: number }[] = [];
  const pseudo: { nodo: Nodo; n: number }[] = [];
  for (const n of i.nodos.values()) {
    if (n.padre) continue;
    const c = cuenta.get(n.id) ?? 0;
    if (!c) continue;
    (n.pseudo ? pseudo : reales).push({ nodo: n, n: c });
  }
  reales.sort((a, b) => b.n - a.n || a.nodo.nombre.localeCompare(b.nodo.nombre));
  pseudo.sort((a, b) => b.n - a.n);
  const aisladas = i.lenguas.filter((l) => l.aislada).sort((a, b) => nombreLengua(a).localeCompare(nombreLengua(b), "es"));
  return { reales, pseudo, aisladas };
}

// ── búsqueda y catálogo ────────────────────────────────────────────
export interface FiltrosCatalogo {
  q?: string;
  macro?: string;
  categoria?: string;
  aes?: number | null;
  familia?: string;
  pais?: string;
  orden?: "nombre" | "dialectos" | "amenaza";
}

export function filtrarLenguas(f: FiltrosCatalogo): Lengua[] {
  const i = idx();
  const q = f.q ? normalizarLingua(f.q) : "";
  const partes = q ? q.split(" ").filter(Boolean) : [];
  let base = f.pais ? i.porPais.get(f.pais.toUpperCase()) ?? [] : i.lenguas;
  if (f.familia) {
    const bajo = new Set(lenguasBajo(f.familia).map((l) => l.id));
    base = base.filter((l) => bajo.has(l.id));
  }
  const out = base.filter((l) => {
    if (f.macro && l.macro !== f.macro) return false;
    if (f.categoria && l.categoria !== f.categoria) return false;
    if (f.aes !== undefined && f.aes !== null && l.aes !== f.aes) return false;
    if (partes.length) {
      const t = i.textoBusqueda.get(l.id) ?? "";
      return partes.every((p) => t.includes(p));
    }
    return true;
  });
  if (q) {
    // las coincidencias exactas de nombre o código van primero
    const exacta = (l: Lengua) => {
      const code = i.codigoDe.get(l.id) ?? "";
      if (normalizarLingua(l.nombreEs) === q || normalizarLingua(l.nombre) === q || l.iso === q || code === q || l.id === q) return 0;
      if (normalizarLingua(l.nombreEs).startsWith(q) || normalizarLingua(l.nombre).startsWith(q)) return 1;
      return 2;
    };
    out.sort((a, b) => exacta(a) - exacta(b) || nombreLengua(a).localeCompare(nombreLengua(b), "es"));
  } else if (f.orden === "dialectos") {
    out.sort((a, b) => b.nDialectos - a.nDialectos);
  } else if (f.orden === "amenaza") {
    out.sort((a, b) => b.aes - a.aes || nombreLengua(a).localeCompare(nombreLengua(b), "es"));
  } else {
    out.sort((a, b) => nombreLengua(a).localeCompare(nombreLengua(b), "es"));
  }
  return out;
}

/** búsqueda global rápida: lenguas, familias y dialectos */
export function buscarLingua(q: string, limite = 20): { id: string; nombre: string; tipo: TipoLanguoide; detalle: string }[] {
  const i = idx();
  const nq = normalizarLingua(q);
  if (nq.length < 2) return [];
  const out: { id: string; nombre: string; tipo: TipoLanguoide; detalle: string; peso: number }[] = [];
  for (const l of filtrarLenguas({ q }).slice(0, limite)) {
    const fam = l.familia ? nombreDe(l.familia) : "lengua aislada";
    const exacto = normalizarLingua(l.nombreEs) === nq || normalizarLingua(l.nombre) === nq ? 0 : 1;
    out.push({ id: l.id, nombre: nombreLengua(l), tipo: "lengua", detalle: `${fam} · ${MACROAREAS_ES[l.macro] ?? l.macro}`, peso: exacto });
  }
  for (const n of i.nodos.values()) {
    const t = normalizarLingua(`${n.nombre} ${NOMBRES_FAMILIA_ES[n.id] ?? ""}`);
    if (t.includes(nq)) out.push({ id: n.id, nombre: nombreNodo(n), tipo: "familia", detalle: `${n.pseudo ? "agrupación" : "familia o rama"} · ${n.nLenguas} lenguas`, peso: n.padre ? 2 : 1 });
    if (out.length > limite * 3) break;
  }
  if (nq.length >= 4) {
    let k = 0;
    for (const d of i.dialectos.values()) {
      if (normalizarLingua(d.nombre).includes(nq)) {
        const l = i.porId.get(d.lengua);
        out.push({ id: d.id, nombre: d.nombre, tipo: "dialecto", detalle: `dialecto de ${l ? nombreLengua(l) : d.lengua}`, peso: 3 });
        if (++k >= 8) break;
      }
    }
  }
  return out.sort((a, b) => a.peso - b.peso).slice(0, limite).map(({ peso: _p, ...r }) => { void _p; return r; });
}

// ── CLDR: población, escrituras, variedades ───────────────────────
export function territoriosDeLengua(id: string): { iso2: string; nombre: string; pct: number; oficial: string; hablantes: number }[] {
  const out: { iso2: string; nombre: string; pct: number; oficial: string; hablantes: number }[] = [];
  for (const [iso2, t] of Object.entries(CLDR.territorios)) {
    for (const [, pct, est, g] of t.l) {
      if (g === id) out.push({ iso2, nombre: CLDR.nombresTerritorio[iso2] ?? iso2, pct, oficial: est, hablantes: Math.round((t.pob * pct) / 100) });
    }
  }
  return out.sort((a, b) => b.hablantes - a.hablantes);
}

export function territorioCldr(iso2: string): (TerritorioCldr & { nombre: string }) | null {
  const t = CLDR.territorios[iso2.toUpperCase()];
  return t ? { ...t, nombre: CLDR.nombresTerritorio[iso2.toUpperCase()] ?? iso2 } : null;
}

export const nombreTerritorio = (iso2: string) => CLDR.nombresTerritorio[iso2.toUpperCase()] ?? iso2.toUpperCase();
export const nombreLenguaCldr = (code: string) => CLDR.nombresLengua[code];
export const nombreEscrituraCldr = (code: string) => CLDR.nombresEscritura[code];
export const usuariosCldr = (code: string) => CLDR.usuarios[code] ?? 0;
export const escriturasDeCodigo = (code: string) => CLDR.escrituras[code] ?? null;
export const macrolenguaDe = (iso3: string) => CLDR.macrolenguas[iso3] ?? null;
export function macrolenguaQueContiene(iso3: string): string | null {
  for (const [m, miembros] of Object.entries(CLDR.macrolenguas)) if (miembros.includes(iso3)) return m;
  return null;
}
export function variedadesDe(code: string): { codigo: string; nombre: string }[] {
  return Object.entries(CLDR.variedades)
    .filter(([k]) => k.split("-")[0] === code)
    .map(([codigo, nombre]) => ({ codigo, nombre }));
}
export const todasLasVariedades = () => Object.entries(CLDR.variedades).map(([codigo, nombre]) => ({ codigo, nombre }));
export const glottoDeCodigo = (code: string) => CLDR.glotto[code] ?? (code.length === 3 ? idx().porIso.get(code)?.id : undefined);

/** nombre en español de un código de lengua de Wikcionario/CLDR */
export function nombreCodigo(code: string): string {
  const cldr = CLDR.nombresLengua[code];
  if (cldr) return capitalizar(cldr);
  const wikt = (nombresWiktJson as Record<string, string>)[code];
  if (wikt) return capitalizar(wikt);
  const g = glottoDeCodigo(code);
  const l = g ? idx().porId.get(g) : undefined;
  return l ? nombreLengua(l) : code;
}

// ── palabras, expresiones, alfabetos, escrituras ──────────────────
const PALABRAS = palabrasJson as unknown as { fuente: string; conceptos: Concepto[] };
const EXPRESIONES = expresionesJson as unknown as { fuente: string; expresiones: Expresion[] };
const ALFABETOS = alfabetosJson as unknown as {
  fuente: string;
  locales: Record<string, Alfabeto>;
  nombres: Record<string, string>;
  unicode: string[];
};
const ESCRITURAS = escriturasJson as unknown as { fuente: string; escrituras: Escritura[] };

export const conceptos = () => PALABRAS.conceptos;
export const conceptoPorId = (id: string) => PALABRAS.conceptos.find((c) => c.id === id);
export const FUENTE_PALABRAS = PALABRAS.fuente;
export const expresiones = () => EXPRESIONES.expresiones;
export const expresionPorId = (id: string) => EXPRESIONES.expresiones.find((e) => e.id === id);
export const FUENTE_EXPRESIONES = EXPRESIONES.fuente;
export const alfabetos = () => ALFABETOS.locales;
export const alfabetoDe = (loc: string) => ALFABETOS.locales[loc];
export const nombreCaracter = (c: string) => ALFABETOS.nombres[c];
export const FUENTE_ALFABETOS = ALFABETOS.fuente;
export const escrituras = () => ESCRITURAS.escrituras;
export const escrituraPorCodigo = (c: string) => ESCRITURAS.escrituras.find((e) => e.codigo.toLowerCase() === c.toLowerCase());
export const FUENTE_ESCRITURAS = ESCRITURAS.fuente;

/** traducciones disponibles para una lengua (por su código corto) */
export function vocabularioDe(code: string): { concepto: Concepto; t: Traduccion[] }[] {
  if (!code) return [];
  return PALABRAS.conceptos.filter((c) => c.t[code]?.length).map((c) => ({ concepto: c, t: c.t[code] }));
}
export function expresionesDe(code: string): { expresion: Expresion; t: Traduccion[] }[] {
  if (!code) return [];
  return EXPRESIONES.expresiones.filter((e) => e.t[code]?.length).map((e) => ({ expresion: e, t: e.t[code] }));
}

/** cifras globales para portadas */
export function cifrasLingua() {
  const i = idx();
  const r = familiasRaiz();
  return {
    lenguas: i.lenguas.length,
    dialectos: i.dialectos.size,
    familias: r.reales.length,
    aisladas: r.aisladas.length,
    nodos: i.nodos.size,
    senas: i.lenguas.filter((l) => l.categoria === "Sign_Language").length,
    extintas: i.lenguas.filter((l) => AES_ES[l.aes]?.clave === "extinct").length,
    amenazadas: i.lenguas.filter((l) => l.aes >= 1 && l.aes <= 4).length,
    escrituras: ESCRITURAS.escrituras.length,
    alfabetos: Object.keys(ALFABETOS.locales).length,
    conceptos: PALABRAS.conceptos.length,
    expresiones: EXPRESIONES.expresiones.length,
    variedades: Object.keys(CLDR.variedades).length,
    paises: i.porPais.size,
  };
}

export { CATEGORIAS_ES, MACROAREAS_ES, MED_ES };

// ── v420.0 · rutas públicas para sitemap y llms.txt ────────────────
/** Portadas, familias con ficha, escrituras, expresiones, países y las lenguas
 *  con nombre en español de CLDR (las más consultadas). Las ~8.000 fichas
 *  restantes existen, pero no se inflan en el sitemap. */
export function rutasLingua(): string[] {
  const fijas = ["/lingua", "/lingua/idiomas", "/lingua/familias", "/lingua/mapa", "/lingua/regiones", "/lingua/peligro", "/lingua/escrituras", "/lingua/escrituras/comparar", "/lingua/alfabetos", "/lingua/diccionario", "/lingua/comparador", "/lingua/expresiones", "/lingua/pronunciacion", "/lingua/traductor", "/lingua/conceptos"];
  const i = idx();
  const paises = new Set<string>();
  for (const l of i.lenguas) for (const p of l.paises) paises.add(p.toLowerCase());
  return [
    ...fijas,
    ...FICHAS_FAMILIA.map((f) => `/lingua/familias/${f.id}`),
    ...escrituras().map((e) => `/lingua/escrituras/${e.codigo}`),
    ...expresiones().map((e) => `/lingua/expresiones/${e.id}`),
    ...[...paises].filter((p) => /^[a-z]{2}$/.test(p)).sort().map((p) => `/lingua/regiones/${p}`),
    ...i.lenguas.filter((l) => l.nombreEs).map((l) => `/lingua/idioma/${l.id}`),
  ];
}
