// ═══════════════════════════════════════════════════════════════════
// v406.0 LA TRAVESÍA — EL RASTRO: la memoria de por dónde anduviste.
//
// Mandato del Dueño: «el usuario debe poder continuar sus investigaciones,
// simulaciones y proyectos desde donde los dejó». La casa ya guardaba trozos
// sueltos (la sala abierta del cuartel, la marca del Vértigo, la lista del
// Centinela, los favoritos del riel, el modo elegido…) pero nadie los unía.
// El rastro es la pieza que faltaba: cada página que abres deja un paso
// (ruta, título, tipo de actividad y hora). La Travesía lo lee junto a las
// tiendas que ya existían y te devuelve EL HILO.
//
// Honestidad y privacidad:
//   · Vive SOLO en tu aparato (localStorage «vg-rastro-v1»). No viaja a
//     ningún servidor, no lleva identificador, se borra con un toque.
//   · Tope de 80 pasos: un rastro infinito no es memoria, es vigilancia.
//   · Las funciones de arriba son PURAS (sin window): las prueba
//     scripts/pruebas-travesia.mjs sin navegador.
// ═══════════════════════════════════════════════════════════════════

export type TipoActividad = "investigacion" | "simulacion" | "proyecto" | "exploracion";

export type Paso = {
  /** url completa dentro de la casa (ruta + query) — la puerta de vuelta */
  u: string;
  /** ruta sin query */
  r: string;
  /** título legible */
  ti: string;
  k: TipoActividad;
  /** espacio de la Travesía al que pertenece (id de módulo) o null */
  e: string | null;
  /** última vez (ms) */
  t: number;
  /** veces que volviste */
  n: number;
};

export const CLAVE_RASTRO = "vg-rastro-v1";
export const CLAVE_BRUJULA = "vg-brujula-v1";
export const CLAVE_ESPACIO = "vg-travesia-espacio";
export const MAX_PASOS = 80;

/** rutas que no dejan huella: la propia Travesía, la portada y las tuberías */
const SIN_HUELLA = ["/entrar", "/api", "/offline", "/index", "/_next"];

const SIMULACION = ["/escenarios", "/zona-cero", "/teatro-3d", "/ver-guerra", "/vanguard2", "/cuartel", "/clasico", "/modo"];
const PROYECTO = ["/centinela", "/universo", "/objetivos", "/mision", "/perfil"];
const EXPLORACION = ["/modulos", "/modulo", "/novedades", "/vertigo", "/catalogo", "/estado", "/calidad", "/torre", "/privacidad", "/escudo"];

function bajo(ruta: string, base: string) {
  return ruta === base || ruta.startsWith(base + "/");
}

export function dejaHuella(ruta: string): boolean {
  if (!ruta || ruta === "/") return false;
  return !SIN_HUELLA.some((b) => bajo(ruta, b));
}

/** clasifica una ruta en una de las cuatro actividades de la casa */
export function tipoDeRuta(ruta: string): TipoActividad {
  if (SIMULACION.some((b) => bajo(ruta, b))) return "simulacion";
  if (PROYECTO.some((b) => bajo(ruta, b))) return "proyecto";
  if (EXPLORACION.some((b) => bajo(ruta, b))) return "exploracion";
  return "investigacion";
}

/** añade (o refresca) un paso: sin duplicados por url, el más reciente arriba */
export function registrarPaso(lista: Paso[], paso: Omit<Paso, "n">, max = MAX_PASOS): Paso[] {
  const previo = lista.find((p) => p.u === paso.u);
  const resto = lista.filter((p) => p.u !== paso.u);
  const nuevo: Paso = { ...paso, ti: paso.ti || previo?.ti || paso.r, n: (previo?.n ?? 0) + 1 };
  return [nuevo, ...resto].slice(0, max);
}

/** el último paso de cada actividad (para «continúa tu investigación…») */
export function ultimosPorTipo(lista: Paso[]): Partial<Record<TipoActividad, Paso>> {
  const out: Partial<Record<TipoActividad, Paso>> = {};
  for (const p of [...lista].sort((a, b) => b.t - a.t)) if (!out[p.k]) out[p.k] = p;
  return out;
}

/** los pasos de una actividad, más recientes primero */
export function pasosDe(lista: Paso[], k: TipoActividad, n = 4): Paso[] {
  return lista.filter((p) => p.k === k).sort((a, b) => b.t - a.t).slice(0, n);
}

/** lo último que hiciste que de verdad se pueda continuar (no un índice) */
export function paraContinuar(lista: Paso[]): Paso | null {
  return [...lista].sort((a, b) => b.t - a.t).find((p) => p.k !== "exploracion") ?? null;
}

/** salas del cuartel distintas que ya abriste (por /cuartel?sala=) */
export function salasCuartelVistas(lista: Paso[]): string[] {
  const s = new Set<string>();
  for (const p of lista) {
    const m = /^\/cuartel\?sala=([a-z0-9_-]+)/i.exec(p.u);
    if (m) s.add(m[1]);
  }
  return [...s];
}

/** «hace 5 min», «hace 2 h», «ayer», «hace 4 días» — sin librerías */
export function haceCuanto(t: number, ahora = Date.now()): string {
  const s = Math.max(0, Math.round((ahora - t) / 1000));
  if (s < 60) return "ahora mismo";
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ayer";
  return `hace ${d} días`;
}

/** valida lo leído del almacenamiento (un JSON roto no tumba la casa) */
export function sanear(x: unknown): Paso[] {
  if (!Array.isArray(x)) return [];
  const tipos: TipoActividad[] = ["investigacion", "simulacion", "proyecto", "exploracion"];
  return x
    .filter(
      (p): p is Paso =>
        !!p &&
        typeof p === "object" &&
        typeof (p as Paso).u === "string" &&
        (p as Paso).u.startsWith("/") &&
        !(p as Paso).u.startsWith("//") &&
        typeof (p as Paso).t === "number" &&
        tipos.includes((p as Paso).k)
    )
    .map((p) => ({ ...p, ti: String(p.ti ?? "").slice(0, 140), n: Number(p.n) || 1, e: typeof p.e === "string" ? p.e : null }))
    .slice(0, MAX_PASOS);
}

// ───────── capa de almacenamiento (solo cliente, siempre a prueba de fallos)

export function leerJSON<T = unknown>(clave: string): T | null {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function leerRastro(): Paso[] {
  return sanear(leerJSON(CLAVE_RASTRO));
}

export function guardarRastro(lista: Paso[]) {
  try {
    localStorage.setItem(CLAVE_RASTRO, JSON.stringify(lista));
    window.dispatchEvent(new Event("vg-rastro"));
  } catch {
    /* modo privado: la casa funciona igual, solo sin memoria */
  }
}

export function borrarRastro() {
  try {
    localStorage.removeItem(CLAVE_RASTRO);
    localStorage.removeItem(CLAVE_ESPACIO);
    window.dispatchEvent(new Event("vg-rastro"));
  } catch {
    /* nada que borrar */
  }
}

export type Brujula = { intereses: string[]; desde: string };

export function leerBrujula(): Brujula | null {
  const b = leerJSON<Brujula>(CLAVE_BRUJULA);
  if (!b || !Array.isArray(b.intereses)) return null;
  return { intereses: b.intereses.filter((x) => typeof x === "string").slice(0, 3), desde: String(b.desde ?? "") };
}

export function guardarBrujula(intereses: string[]) {
  try {
    localStorage.setItem(CLAVE_BRUJULA, JSON.stringify({ intereses: intereses.slice(0, 3), desde: new Date().toISOString() }));
    window.dispatchEvent(new Event("vg-rastro"));
  } catch {
    /* sin brújula guardada: la Travesía usa su orden de siempre */
  }
}

/** lee una tienda zustand persistida ({state:{…}}) sin importar la tienda */
export function leerTienda<T = Record<string, unknown>>(clave: string): T | null {
  const j = leerJSON<{ state?: T }>(clave);
  return j && typeof j === "object" && j.state && typeof j.state === "object" ? j.state : null;
}
