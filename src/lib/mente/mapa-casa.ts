// ═══════════════════════════════════════════════════════════════════════════
// v431.0 · LA MENTE — EL MAPA DE LA CASA (lo que la mente sabe de su mundo)
//
// PROBLEMA QUE RESUELVE: LA MENTE hablaba de geopolítica, pero no sabía dónde
// estaba nada dentro de Vanguard. Si el operador decía «llévame al mapa» o
// «¿dónde veo las divisas?», improvisaba. No tenía los ojos puestos en la casa.
//
// Este módulo le da esos ojos. NO crea un catálogo nuevo: lee los que ya
// existen y los aplana en un índice buscable.
//   · `espacios.ts`   → 12 espacios + sus herramientas (los botones reales)
//   · `mapa-salas.ts` → las salas del cuartel + sus constelaciones
//   · `destinos.ts`   → el catálogo derivado
//   · `modulos.ts`    → los módulos de la portada
//
// Todo lo que sale de aquí es una RUTA que existe. Si la mente manda a un
// sitio, ese sitio está.
//
// Puro y sin dependencias de red: se prueba con `tools/mente/probar.mts`.
// ═══════════════════════════════════════════════════════════════════════════

import { ESPACIOS, ESPACIO_POR_CLAVE } from "@/lib/navegacion/espacios";
import { CATALOGO } from "@/lib/navegacion/destinos";
import { CONSTELACIONES, SALAS_MAPA } from "@/lib/vanguard/mapa-salas";
import { MODULOS } from "@/components/portada/modulos";
import type { ClaveEspacio } from "@/lib/navegacion/tipos";

export type TipoLugar = "portada" | "area" | "modulo" | "herramienta" | "sala" | "destino";

export type Lugar = {
  /** ruta navegable de verdad */
  r: string;
  /** nombre humano */
  n: string;
  tipo: TipoLugar;
  /** espacio al que pertenece (para decir «esto está en Geografía») */
  area: ClaveEspacio;
  /** palabras con las que se reconoce (sin acentos, en minúscula) */
  claves: string[];
  /** una línea de qué es (si la casa ya la tenía) */
  que?: string;
};

/** Sin acentos, sin mayúsculas, sin signos: la forma en que se compara aquí. */
export function llano(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s/._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Palabras que no son sitios. Si se cuelan, una sala con la descripción larga
 * gana a la puerta que el operador pidió (pasó de verdad: «llévame al mapa y
 * quiero ver los países» acababa en una galería de retratos).
 */
const MULETILLAS = new Set([
  "llevame", "lleva", "llévame", "ir", "veme", "ve", "vete", "abre", "abreme", "abrir",
  "entra", "entrar", "navega", "muestra", "muestrame", "ensename", "quiero", "queria",
  "ver", "vista", "mira", "mirar", "donde", "esta", "estan", "como", "llego", "puedo",
  "encuentro", "busca", "buscar", "que", "cual", "cuales", "hay", "con", "por", "para",
  "del", "los", "las", "una", "uno", "unos", "unas", "mis", "tus", "sus", "mas", "muy",
  "sobre", "desde", "hasta", "cuando", "ahora", "aqui", "alli", "esto", "eso", "algo",
  "mente", "vanguard", "casa", "puedes", "podrias", "ayuda", "ayudame", "dime", "sabes",
  "hazme", "haz", "crea", "crear", "escribe", "escribeme", "genera", "explicame",
]);

function partes(...trozos: (string | undefined)[]): string[] {
  const out = new Set<string>();
  for (const t of trozos) {
    if (!t) continue;
    const limpio = llano(t);
    if (limpio && !MULETILLAS.has(limpio)) out.add(limpio);
    for (const p of limpio.split(/[\s/._-]+/)) {
      if (p.length > 2 && !MULETILLAS.has(p)) out.add(p);
    }
  }
  return Array.from(out);
}

// ── El índice: una sola lista, construida a partir de lo que ya existe ────

function construir(): Lugar[] {
  const lugares = new Map<string, Lugar>();
  const meter = (l: Lugar) => {
    // La CLAVE es la ruta completa, consulta incluida: `/cuartel?sala=mente` y
    // `/cuartel?sala=mapa` son dos lugares distintos. (Cuando se comparaba sin
    // la consulta, todas las salas del cuartel se fundían en una sola.)
    const r = l.r.split("#")[0].replace(/\/+$/, "") || "/";
    const previo = lugares.get(r);
    if (previo) {
      previo.claves = Array.from(new Set([...previo.claves, ...l.claves]));
      if (!previo.que && l.que) previo.que = l.que;
      if (previo.tipo === "destino" && l.tipo !== "destino") previo.tipo = l.tipo;
      return;
    }
    lugares.set(r, { ...l, r });
  };

  // ① la portada
  meter({
    r: "/",
    n: "La portada",
    tipo: "portada",
    area: "leer",
    claves: partes("portada inicio home casa entrada"),
    que: "La entrada: noticias, áreas y el hilo de lo último que viste.",
  });

  // ② las áreas (espacios de trabajo) y sus herramientas: los botones reales
  for (const e of ESPACIOS) {
    const entrada = e.herramientas[0]?.href ?? "/";
    meter({ r: entrada, n: e.nombre, tipo: "area", area: e.clave, claves: partes(e.nombre, e.lema, e.clave), que: e.lema });
    for (const h of e.herramientas) {
      meter({
        r: h.href,
        n: h.nombre,
        tipo: "herramienta",
        area: e.clave,
        claves: partes(h.nombre, h.desc, h.href, e.nombre),
        que: h.desc,
      });
    }
  }

  // ③ las salas del cuartel: la casa por dentro (/cuartel?sala=<clave>)
  const constelacionDeSala = new Map<string, (typeof CONSTELACIONES)[number]>();
  for (const c of CONSTELACIONES) for (const s of c.salas) constelacionDeSala.set(s.clave, c);
  const areaDeSala = new Map<string, ClaveEspacio>();
  for (const e of ESPACIOS) for (const clave of e.detecta.salas) areaDeSala.set(clave, e.clave);
  for (const s of SALAS_MAPA) {
    const c = constelacionDeSala.get(s.clave);
    meter({
      r: `/cuartel?sala=${s.clave}`,
      n: s.nombre,
      tipo: "sala",
      area: areaDeSala.get(s.clave) ?? "sistema",
      claves: partes(s.nombre, s.corto, s.clave, c?.nombre),
      que: c ? `Sala del cuartel · constelación ${c.nombre}` : "Sala del cuartel",
    });
  }

  // ④ los destinos derivados (incluye constelaciones y rutas vivas)
  for (const d of CATALOGO) {
    meter({
      r: d.href,
      n: d.nombre,
      tipo: "destino",
      area: d.espacio,
      claves: partes(d.nombre, d.corto, d.sub, d.familia),
      que: d.sub || undefined,
    });
  }

  // ⑤ los módulos de la portada
  for (const m of MODULOS) {
    meter({
      r: m.nav || `/modulo/${m.id}`,
      n: m.nombre,
      tipo: "modulo",
      area: (ESPACIOS.find((e) => (e.detecta.modulos ?? []).includes(m.id))?.clave ?? "leer") as ClaveEspacio,
      claves: partes(m.nombre, m.id, m.lema, m.gancho),
      que: m.lema,
    });
  }

  return Array.from(lugares.values());
}

/** El índice completo: todos los lugares con ruta real. */
export const LUGARES: Lugar[] = construir();

/** Cuántos lugares conoce la mente (dato que se muestra en la interfaz). */
export const TOTAL_LUGARES = LUGARES.length;

// ── Búsqueda: puntuación simple y explicable, sin modelos ─────────────────

const PESO: Record<TipoLugar, number> = {
  portada: 1,
  area: 4,
  modulo: 3,
  herramienta: 5,
  sala: 2,
  destino: 3,
};

/**
 * Cuánto discrimina una palabra dentro de la casa (IDF). «divisas» aparece en
 * dos lugares y vale mucho; «país» aparece en medio centenar y no puede mandar
 * sobre el resto de la frase.
 */
function rareza(consulta: string[], lugares: Lugar[]): Map<string, number> {
  const mapa = new Map<string, number>();
  const N = Math.max(1, lugares.length);
  for (const c of consulta) {
    let df = 0;
    for (const l of lugares) {
      if (l.claves.some((k) => k.includes(c)) || llano(l.n).includes(c) || llano(l.r).includes(c)) df += 1;
    }
    mapa.set(c, 1 + Math.log(N / Math.max(1, df)));
  }
  return mapa;
}

function puntuar(consulta: string[], lugar: Lugar, pesos?: Map<string, number>): number {
  const nombre = llano(lugar.n);
  const segmentos = llano(lugar.r).split(/[/?=&]+/).filter(Boolean);
  let total = 0;
  let mejor = 0;
  for (const c of consulta) {
    if (!c) continue;
    let p = 0;
    // el nombre manda…
    if (nombre === c) p = 60;
    else if (nombre.startsWith(c)) p = 40;
    else if (nombre.includes(c)) p = 24;
    // …pero la RUTA es la prueba dura: «mapas» en /mapas vale más que una
    // palabra suelta en una descripción
    if (segmentos.some((x) => x === c || `${x}s` === c || x === `${c}s`)) p = Math.max(p, 38);
    else if (segmentos.some((x) => x.startsWith(c))) p = Math.max(p, 28);
    // y las palabras de contexto solo desempatan
    if (lugar.claves.includes(c)) p += 8;
    else if (lugar.claves.some((k) => k.startsWith(c))) p += 4;
    const w = p * (pesos?.get(c) ?? 1);
    total += w;
    if (w > mejor) mejor = w;
  }
  if (total <= 0) return 0;
  // La mejor coincidencia pesa entera; el resto, un tercio. Sin esto, un lugar
  // que menciona «los», «ver» y «país» en su descripción vencía al mapa.
  return mejor + (total - mejor) * 0.35 + PESO[lugar.tipo];
}

export type Hallazgo = Lugar & { puntos: number; porque: string };

/** Busca en la casa. Devuelve los mejores, con el motivo (para que la mente lo diga). */
export function buscarEnCasa(texto: string, limite = 6): Hallazgo[] {
  const consulta = partes(texto).filter((c) => c.length > 1);
  if (!consulta.length) return [];
  const pesos = rareza(consulta, LUGARES);
  return LUGARES.map((l) => {
    const p = puntuar(consulta, l, pesos);
    return { ...l, puntos: p, porque: p >= 34 ? "coincide con el nombre" : "aparece en su descripción" };
  })
    .filter((l) => l.puntos > 0)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, limite);
}

/** El mejor destino para una frase («llévame a las divisas»). */
export function resolverDestino(texto: string): Hallazgo | null {
  const limpio = llano(texto).replace(
    /^(llevame|llévame|ir|ve|vete|abre|abreme|entra|entrar|navega|muestrame|muestra|ensename|quiero ver|como llego|donde esta|donde veo|donde puedo ver|donde encuentro|busca|buscar)\s+(a\s+|al\s+|a la\s+|a las\s+|el\s+|la\s+|los\s+|las\s+)?/,
    ""
  );
  const hallazgos = buscarEnCasa(limpio, 8);
  const mejor = hallazgos[0];
  if (!mejor) return null;
  // un solo destino dudoso no se ofrece como certeza: pedimos más pistas
  if (mejor.puntos < 12) return null;
  // «llévame al mapa» no debe aterrizar en una salita llamada Mapa cuando la
  // puerta grande (/mapas) está casi a la par: gana la puerta.
  if (mejor.tipo === "sala") {
    const puerta = hallazgos.find((h) => h.tipo !== "sala" && h.puntos >= mejor.puntos - 26);
    if (puerta) return puerta;
  }
  return mejor;
}

/** El área (espacio de trabajo) de una ruta, para decir dónde está lo que se enseña. */
export function areaDeRuta(ruta: string): { clave: ClaveEspacio; nombre: string; color: string } {
  const r = ruta.split("?")[0].replace(/\/+$/, "") || "/";
  const sala = new URLSearchParams(ruta.split("?")[1] ?? "").get("sala");
  for (const e of ESPACIOS) {
    if (sala && e.detecta.salas.includes(sala)) return { clave: e.clave, nombre: e.nombre, color: e.color };
    if (!sala && e.detecta.rutas.some((p) => (p === "" ? r === "/" : r === p || r.startsWith(p + "/"))))
      return { clave: e.clave, nombre: e.nombre, color: e.color };
  }
  const salaMapa = LUGARES.find((l) => l.r === r && l.tipo === "sala");
  if (salaMapa) {
    const espacio = ESPACIO_POR_CLAVE[salaMapa.area];
    return { clave: salaMapa.area, nombre: espacio?.nombre ?? "", color: espacio?.color ?? "#3ddcff" };
  }
  return { clave: "leer", nombre: "La casa", color: "#3ddcff" };
}

// ── Lo que se le cuenta al modelo (compacto: esto viaja en cada consulta) ──

/**
 * El mapa en texto para el prompt. Se limita a propósito: el modelo necesita
 * saber qué hay y cómo se llama, no las 156 salas una por una (para eso tiene
 * la acción `buscar`, que consulta el índice completo en el servidor).
 */
export function mapaParaElModelo(): string {
  const lineas: string[] = [];
  lineas.push(
    `LA CASA TIENE ${ESPACIOS.length} ÁREAS (espacios de trabajo), ${SALAS_MAPA.length} SALAS en /cuartel y ${TOTAL_LUGARES} lugares con ruta real.`
  );
  lineas.push("ÁREAS Y SUS PUERTAS PRINCIPALES (usa estas rutas exactas):");
  for (const e of ESPACIOS) {
    const puertas = e.herramientas
      .slice(0, 5)
      .map((h) => `${h.nombre} (${h.href})`)
      .join(", ");
    lineas.push(`· ${e.nombre} [${e.clave}] — ${e.lema}. Puertas: ${puertas}`);
  }
  const constelaciones = CONSTELACIONES.slice(0, 12)
    .map((c) => `${c.nombre} (${c.salas.length} salas)`)
    .join(", ");
  lineas.push(`CONSTELACIONES DEL CUARTEL (cada sala se abre en /cuartel?sala=<clave>): ${constelaciones}`);
  lineas.push(
    "RUTAS VIVAS QUE DEBES CONOCER: / (portada), /cuartel?sala=mente (tu sala), /mapas, /navegacion, /espacio (mi mesa), /resiliencia, /inteligencia, /conocimiento, /archivo-mundial, /divisas, /teatro-3d, /herramientas, /estado."
  );
  return lineas.join("\n");
}
