// ═══════════════════════════════════════════════════════════════════
// v431.2 RADIO VANGUARD · LA MESA DE EDICIÓN — leer el archivo entero
// antes de abrir el micrófono.
//
// QUÉ HACE (todo derivado de datos reales, nada inventado):
//   ① AGRUPA cables que cuentan lo mismo. Diez medios en español cubren el
//      mismo bombardeo con diez titulares distintos; leerlos seguidos es
//      ruido. Se comparan por tokens (Jaccard) y el grupo conserva TODAS sus
//      fuentes, para poder decir «lo firman cuatro medios».
//   ② SELECCIONA con criterio editorial: relevancia real (`relevancia()` de
//      la portada) + DIVERSIDAD por región y por fuente, para que el
//      programa no sea cuatro cables del mismo sitio.
//   ③ CUENTA el archivo: total de cables, medios, regiones, el último que
//      entró, los conflictos que aparecen y los temas que más se repiten.
//      Todo son cuentas sobre `notas`; ninguna cifra escrita a mano.
//
// Sin DOM, sin red, sin reloj propio (la hora entra por parámetro): se
// ejecuta en Node en scripts/pruebas-radio.mjs.
// ═══════════════════════════════════════════════════════════════════

import type { Nota } from "@/lib/portada/notas";

/**
 * PUNTUACIÓN EDITORIAL — la misma regla que usa la portada (`relevancia()` en
 * lib/portada/notas.ts), copiada aquí por una razón de peso: la portada habla
 * con la base de datos y con `fs`, y este módulo lo importa el reproductor,
 * que es cliente. Copiar cinco líneas es más barato que arrastrar SQLite al
 * navegador.
 *
 * PARA QUE NO HAYA DERIVA: `scripts/pruebas-radio.mjs` lee los pesos del
 * propio `notas.ts` y comprueba que aquí están los mismos números. Si alguien
 * cambia la relevancia de la portada, la prueba falla y obliga a decidir.
 */
export function puntuacionEditorial(n: Nota, ahora = Date.now()): number {
  const horas = (ahora - new Date(n.fecha).getTime()) / 3600_000;
  let p = 100 - horas * 6;
  if (n.imagen) p += 30;
  if (n.conflicto) p += 25;
  if (n.region !== "mundo") p += 8;
  if ((n.resumen ?? "").length > 60) p += 6;
  return p;
}

/** Palabras que no identifican un asunto: se descartan al comparar. */
const VACIAS = new Set([
  "para", "como", "sobre", "entre", "desde", "hasta", "donde", "cuando", "porque", "aunque",
  "este", "esta", "esto", "estos", "estas", "aquel", "otro", "otra", "otros", "otras",
  "todo", "toda", "todos", "todas", "mismo", "misma", "tras", "segun", "según", "durante",
  "contra", "ante", "bajo", "hacia", "hasta", "mas", "más", "pero", "sino", "también",
  "tambien", "solo", "sólo", "cada", "unos", "unas", "sera", "será", "sido", "esta",
  "dice", "dijo", "señala", "asegura", "afirma", "explica", "anuncia", "presenta",
  "nuevo", "nueva", "nuevos", "nuevas", "gran", "grandes", "primer", "primera",
  "the", "and", "for", "con", "los", "las", "del", "que", "por", "una", "uno",
]);

/** Minúsculas, sin acentos, solo letras y números separados por espacio. */
export function normalizarTexto(t: string): string {
  return (t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Los tokens que identifican: 4+ letras y que no sean palabras vacías. */
export function tokens(t: string): string[] {
  return normalizarTexto(t)
    .split(" ")
    .filter((p) => p.length >= 4 && !VACIAS.has(p));
}

/** Parecido entre dos textos: Jaccard de sus tokens (0 = nada, 1 = iguales). */
export function parecido(a: string, b: string): number {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let comunes = 0;
  for (const t of ta) if (tb.has(t)) comunes += 1;
  return comunes / (ta.size + tb.size - comunes);
}

export type Grupo = {
  /** el cable que se cuenta (el de más relevancia del grupo) */
  principal: Nota;
  /** los otros cables que cuentan lo mismo */
  duplicados: Nota[];
  /** medios distintos que firman el asunto, en orden de relevancia */
  fuentes: string[];
  region: string;
  /** conflictos que toca el grupo (de su campo real) */
  conflictos: string[];
};

/**
 * AGRUPAR: dos cables son el mismo asunto si se parecen lo suficiente (0,34
 * por defecto) o si comparten conflicto Y región (mismo frente, misma zona).
 * El umbral se calibró con titulares reales de los diez medios: por debajo de
 * 0,3 se mezclan asuntos distintos (dos países, dos ataques).
 */
export function agrupar(notas: Nota[], umbral = 0.34): Grupo[] {
  const grupos: Grupo[] = [];
  for (const n of notas) {
    if (!n || !n.titulo) continue;
    let encajado = false;
    for (const g of grupos) {
      const p = g.principal;
      const mismoFrente = !!n.conflicto && n.conflicto === p.conflicto && n.region === p.region;
      const mismoTitular = parecido(`${n.titulo} ${n.resumen}`, `${p.titulo} ${p.resumen}`) >= umbral;
      if (mismoFrente || mismoTitular) {
        g.duplicados.push(n);
        if (!g.fuentes.includes(n.fuente)) g.fuentes.push(n.fuente);
        if (n.conflicto && !g.conflictos.includes(n.conflicto)) g.conflictos.push(n.conflicto);
        encajado = true;
        break;
      }
    }
    if (!encajado) {
      grupos.push({
        principal: n,
        duplicados: [],
        fuentes: [n.fuente],
        region: n.region,
        conflictos: n.conflicto ? [n.conflicto] : [],
      });
    }
  }
  return grupos;
}

export type OpcionesSeleccion = {
  /** cuántos asuntos como máximo */
  maximo?: number;
  /** duración aproximada que se busca (ms): decide cuántos asuntos entran */
  objetivoMs?: number;
  ahora?: number;
};

/** Duración media de un asunto desarrollado, medida en el guion real (~48 s). */
export const MS_POR_ASUNTO = 48_000;

/** Cuántos asuntos caben en una duración objetivo. */
export function asuntosPara(objetivoMs: number): number {
  return Math.max(1, Math.min(8, Math.round(objetivoMs / MS_POR_ASUNTO)));
}

/**
 * SELECCIONAR: primero por relevancia real, pero sin repetir región ni fuente
 * mientras haya alternativa. Si se acaban las alternativas, se completa con el
 * resto por relevancia. Así un programa de cuatro asuntos cubre cuatro sitios.
 */
export function seleccionar(notas: Nota[], opciones: OpcionesSeleccion = {}): Grupo[] {
  const ahora = opciones.ahora ?? Date.now();
  const maximo = Math.max(
    1,
    Math.min(
      8,
      opciones.maximo ?? (opciones.objetivoMs ? asuntosPara(opciones.objetivoMs) : 4)
    )
  );

  const grupos = agrupar(notas).sort(
    (a, b) =>
      puntuacionEditorial(b.principal, ahora) - puntuacionEditorial(a.principal, ahora) ||
      b.fuentes.length - a.fuentes.length
  );

  const elegidos: Grupo[] = [];
  const regiones = new Set<string>();
  const fuentes = new Set<string>();

  // ① pasada con diversidad estricta
  for (const g of grupos) {
    if (elegidos.length >= maximo) break;
    if (regiones.has(g.region) || fuentes.has(g.principal.fuente)) continue;
    elegidos.push(g);
    regiones.add(g.region);
    fuentes.add(g.principal.fuente);
  }
  // ② relleno por relevancia si la diversidad dejó hueco
  for (const g of grupos) {
    if (elegidos.length >= maximo) break;
    if (elegidos.includes(g)) continue;
    elegidos.push(g);
  }
  // ③ orden final: la relevancia manda (la diversidad decide QUIÉN entra)
  elegidos.sort(
    (a, b) => puntuacionEditorial(b.principal, ahora) - puntuacionEditorial(a.principal, ahora)
  );
  return elegidos;
}

export type Estadisticas = {
  cables: number;
  medios: number;
  regiones: { region: string; cables: number }[];
  asuntos: number;
  /** cables que cuentan lo mismo que otro (agrupados) */
  repetidos: number;
  ultimo: { titulo: string; fuente: string; haceMs: number } | null;
  conflictos: { nombre: string; cables: number }[];
  temaDelDia: string;
};

/** CIFRAS DEL ARCHIVO: cuentas reales sobre las notas que hay. */
export function estadisticas(notas: Nota[], ahora: number): Estadisticas {
  const porRegion = new Map<string, number>();
  const porFuente = new Set<string>();
  const porConflicto = new Map<string, number>();
  let ultimo: Nota | null = null;

  for (const n of notas) {
    if (!n || !n.titulo) continue;
    porRegion.set(n.region, (porRegion.get(n.region) ?? 0) + 1);
    porFuente.add(n.fuente);
    if (n.conflicto) porConflicto.set(n.conflicto, (porConflicto.get(n.conflicto) ?? 0) + 1);
    const t = Date.parse(n.fecha);
    if (Number.isFinite(t) && (!ultimo || t > Date.parse(ultimo.fecha))) ultimo = n;
  }

  const grupos = agrupar(notas);
  const repetidos = grupos.reduce((s, g) => s + g.duplicados.length, 0);
  const temas = temasDeHoy(notas, 1);

  return {
    cables: notas.filter((n) => n && n.titulo).length,
    medios: porFuente.size,
    regiones: [...porRegion.entries()]
      .map(([region, cables]) => ({ region, cables }))
      .sort((a, b) => b.cables - a.cables),
    asuntos: grupos.length,
    repetidos,
    ultimo: ultimo
      ? {
          titulo: ultimo.titulo,
          fuente: ultimo.fuente,
          haceMs: Math.max(0, ahora - Date.parse(ultimo.fecha)),
        }
      : null,
    conflictos: [...porConflicto.entries()]
      .map(([nombre, cables]) => ({ nombre, cables }))
      .sort((a, b) => b.cables - a.cables),
    temaDelDia: temas[0]?.tema ?? "",
  };
}

/** DE QUÉ SE HABLA HOY: los tokens que más se repiten entre los titulares. */
export function temasDeHoy(notas: Nota[], limite = 6): { tema: string; cables: number }[] {
  const cuenta = new Map<string, number>();
  for (const n of notas) {
    if (!n || !n.titulo) continue;
    for (const t of new Set(tokens(`${n.titulo} ${n.resumen}`))) {
      cuenta.set(t, (cuenta.get(t) ?? 0) + 1);
    }
  }
  return [...cuenta.entries()]
    .filter(([, c]) => c >= 2)
    .map(([tema, cables]) => ({ tema, cables }))
    .sort((a, b) => b.cables - a.cables || a.tema.localeCompare(b.tema))
    .slice(0, limite);
}
