// ============================================================
// v432.0 UN SOLO MUNDO · ZONA CERO — EL BUSCADOR DEL OJO (server-only)
//
// Orden del Dueño: «una zona oscura, en el medio el ojo de Vanguard; si uno lo
// presiona puede buscar módulos, informaciones, elementos de otros módulos,
// imágenes… y pegarlas a la Zona Cero».
//
// No es un buscador nuevo que compita con el del Núcleo: ES el del Núcleo
// (buscarEnNucleo, las mismas fuentes públicas y la misma guarda de frontera)
// más tres cosas que la Zona Cero necesita para armar un tablero visual:
//   ① IMAGEN cuando la casa la tiene con derechos claros: foto del cable (la
//      que publica el propio medio), imagen de la Enciclopedia (Wikimedia
//      Commons con autor y licencia), foto del arma (Commons), bandera
//      (flagcdn) e ilustración propia de cada sala.
//   ② DOS FUENTES MÁS que el Núcleo no indexaba como piezas: el Arsenal (21
//      armas reales de /armeria) y las salas de cada módulo de la portada.
//   ③ DESTACADOS para la primera vez (sin consulta): lo último del cable con
//      foto, artículos de la Enciclopedia, armas y salas — nada inventado,
//      todo sale de los mismos catálogos.
// Ley de la casa: si una fuente falla se omite y se dice; jamás se rellena.
// ============================================================

import { db } from "@/lib/db";
import { sanitizarLinea } from "@/lib/fortaleza";
import { buscarEnNucleo } from "@/lib/nucleo/busqueda";
import { ETIQUETA_TIPO, normalizar } from "@/lib/nucleo/tipos";
import type { ResultadoNucleo } from "@/lib/nucleo/fuentes";
import { ARSENAL } from "@/lib/arsenal-data";
import { ARTICULOS, imagenDe } from "@/lib/enciclopedia/indice";
import { MODULOS_PUBLICOS } from "@/components/portada/modulos";
import { obtenerNotas, type Nota } from "@/lib/portada/notas";

export const FILTROS_ZONA_CERO = ["todo", "noticias", "paises", "conocimiento", "armas", "salas", "imagenes"] as const;
export type FiltroZonaCero = (typeof FILTROS_ZONA_CERO)[number];

export type ClasePieza =
  | "noticia"
  | "pais"
  | "conocimiento"
  | "arma"
  | "sala"
  | "acontecimiento"
  | "region"
  | "documento"
  | "analisis"
  | "otro";

export interface PiezaZonaCero {
  /** id estable (sirve para no pegar dos veces lo mismo) */
  id: string;
  clase: ClasePieza;
  /** rótulo humano del tipo («NOTICIA / CABLE», «ARMA», «SALA»…) */
  etiqueta: string;
  titulo: string;
  sub: string;
  /** destino navegable REAL dentro de Vanguard */
  ruta: string;
  imagen?: string;
  /** autor/licencia/origen de la imagen cuando la casa lo sabe */
  credito?: string;
  fecha?: string;
  /** fnt:<id> — qué fuente respondió */
  origen: string;
}

export interface RespuestaZonaCero {
  q: string;
  filtro: FiltroZonaCero;
  modo: "busqueda" | "destacados";
  piezas: PiezaZonaCero[];
  /** fuentes que respondieron (y cuántas piezas dio cada una) */
  fuentes: { id: string; n: number; fallo?: boolean }[];
}

const bandera = (iso2: string) => `https://flagcdn.com/w160/${iso2.toLowerCase()}.png`;

// ── traducción de un resultado del Núcleo a pieza del tablero ──────────
function claseDe(r: ResultadoNucleo): ClasePieza {
  const t = r.entidad?.tipo;
  if (r.moduloId) return "sala";
  if (t === "noticia") return "noticia";
  if (t === "pais") return "pais";
  if (t === "acontecimiento") return "acontecimiento";
  if (t === "region" || t === "punto" || t === "mapa") return "region";
  if (t === "analisis") return "analisis";
  if (t === "documento") {
    if (r.origen === "fnt:conocimiento" || r.origen === "fnt:ciencia" || r.origen === "fnt:lingua") return "conocimiento";
    return "documento";
  }
  return "otro";
}

function etiquetaDe(r: ResultadoNucleo): string {
  if (r.moduloId) return "MÓDULO";
  if (r.origen === "fnt:conocimiento") return r.ruta.startsWith("/conocimiento/enciclopedia/") ? "ENCICLOPEDIA" : "CONOCIMIENTO";
  if (r.origen === "fnt:ciencia") return "CIENCIA";
  if (r.origen === "fnt:lingua") return "LENGUA";
  return r.entidad ? ETIQUETA_TIPO[r.entidad.tipo] : "VANGUARD";
}

function desdeNucleo(r: ResultadoNucleo): PiezaZonaCero {
  const clase = claseDe(r);
  const pieza: PiezaZonaCero = {
    id: r.entidad?.id ?? `vg:ruta:${r.ruta}`,
    clase,
    etiqueta: etiquetaDe(r),
    titulo: r.titulo,
    sub: r.subtitulo,
    ruta: r.ruta,
    fecha: r.fecha,
    origen: r.origen,
  };
  // país → su ficha completa en /mundos/{iso} (249 fichas reales) y su bandera
  if (clase === "pais" && r.entidad) {
    const iso = r.entidad.id.split(":").pop() ?? "";
    if (/^[a-z]{2}$/.test(iso)) {
      pieza.ruta = `/mundos/${iso}`;
      pieza.imagen = bandera(iso);
      pieza.credito = "Bandera · flagcdn.com";
    }
  }
  // artículo de la Enciclopedia → su primera imagen atribuida (Commons)
  if (r.ruta.startsWith("/conocimiento/enciclopedia/")) {
    const slug = r.ruta.split("/").pop() ?? "";
    const art = ARTICULOS.find((a) => a.slug === slug);
    const img = art?.imagenes[0] ? imagenDe(art.imagenes[0].clave) : undefined;
    if (img) {
      pieza.imagen = img.archivo;
      pieza.credito = `${img.autor} · ${img.licencia} · Wikimedia Commons`;
    }
  }
  return pieza;
}

/** Las fotos de los cables viven en la BD (NewsItem.imageUrl): una sola query. */
async function conFotosDeCables(piezas: PiezaZonaCero[]): Promise<void> {
  const ids = piezas
    .filter((p) => p.clase === "noticia" && !p.imagen && p.ruta.startsWith("/noticia/"))
    .map((p) => p.ruta.slice("/noticia/".length));
  if (!ids.length) return;
  try {
    const filas = await db.newsItem.findMany({ where: { id: { in: ids } }, select: { id: true, imageUrl: true, source: true } });
    const mapa = new Map(filas.map((f) => [f.id, f]));
    for (const p of piezas) {
      if (p.clase !== "noticia") continue;
      const f = mapa.get(p.ruta.slice("/noticia/".length));
      if (f?.imageUrl && /^https:\/\//.test(f.imageUrl)) {
        p.imagen = f.imageUrl;
        p.credito = `Foto · ${f.source}`;
      }
    }
  } catch {
    /* sin BD: las noticias salen sin foto, nunca con una inventada */
  }
}

// ── fuentes propias de la Zona Cero ─────────────────────────────────────
function puntos(texto: string, terminos: string[], frase: string): number {
  const t = normalizar(texto);
  if (!t) return 0;
  let p = t.includes(frase) ? 6 : 0;
  for (const x of terminos) if (t.includes(x)) p += 2;
  return p;
}

function piezaArma(w: (typeof ARSENAL)[number]): PiezaZonaCero {
  return {
    id: `vg:arma:${w.id}`,
    clase: "arma",
    etiqueta: "ARMA · ARSENAL",
    titulo: w.name,
    sub: `${w.origin} · ${w.era}`,
    ruta: `/armeria#arma-${w.id}`,
    imagen: w.photo,
    credito: "Foto · Wikimedia Commons",
    origen: "fnt:arsenal",
  };
}

type SalaPlana = { modulo: string; href: string; label: string; img?: string; txt?: string };
const SALAS: SalaPlana[] = (() => {
  const vistas = new Set<string>();
  const out: SalaPlana[] = [];
  for (const m of MODULOS_PUBLICOS) {
    for (const p of m.pestanas) {
      if (vistas.has(p.href)) continue;
      vistas.add(p.href);
      out.push({ modulo: m.nombre, href: p.href, label: p.label, img: p.img ?? m.img, txt: p.txt });
    }
  }
  return out;
})();

function piezaSala(s: SalaPlana): PiezaZonaCero {
  return {
    id: `vg:sala:${s.href}`,
    clase: "sala",
    etiqueta: `SALA · ${s.modulo.toUpperCase()}`,
    titulo: s.label,
    sub: s.txt ?? `Una sala del módulo ${s.modulo}.`,
    ruta: s.href,
    imagen: s.img,
    credito: s.img ? "Ilustración de Vanguard" : undefined,
    origen: "fnt:salas",
  };
}

function buscarArmas(norm: string, terminos: string[], limite: number): PiezaZonaCero[] {
  return ARSENAL.map((w) => ({ w, p: puntos(`${w.name} ${w.short} ${w.name} ${w.origin} ${w.era} ${w.function}`, terminos, norm) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p)
    .slice(0, limite)
    .map((x) => piezaArma(x.w));
}

function buscarSalas(norm: string, terminos: string[], limite: number): PiezaZonaCero[] {
  return SALAS.map((s) => ({ s, p: puntos(`${s.label} ${s.label} ${s.modulo} ${s.txt ?? ""}`, terminos, norm) }))
    .filter((x) => x.p > 0)
    .sort((a, b) => b.p - a.p)
    .slice(0, limite)
    .map((x) => piezaSala(x.s));
}

function pasaFiltro(p: PiezaZonaCero, f: FiltroZonaCero): boolean {
  switch (f) {
    case "todo":
      return true;
    case "noticias":
      return p.clase === "noticia" || p.clase === "acontecimiento" || p.clase === "analisis";
    case "paises":
      return p.clase === "pais" || p.clase === "region";
    case "conocimiento":
      return p.clase === "conocimiento" || p.clase === "documento";
    case "armas":
      return p.clase === "arma";
    case "salas":
      return p.clase === "sala";
    case "imagenes":
      return Boolean(p.imagen);
  }
}

/** Una vuelta diaria determinista: los destacados cambian cada día, no en cada recarga. */
function delDia<T>(lista: T[], n: number, sal: number): T[] {
  if (lista.length <= n) return lista.slice();
  const dia = Math.floor(Date.now() / 86_400_000) + sal;
  const inicio = (dia * 7) % lista.length;
  return Array.from({ length: n }, (_, i) => lista[(inicio + i * 3) % lista.length]);
}

/** El cable del día: las mismas notas en español que pinta la portada (RSS de
 *  BBC Mundo, El País, DW…, caché de datos de Next 300 s), con su foto. */
async function notasDelDia(): Promise<Nota[]> {
  try {
    return await Promise.race([
      obtenerNotas(),
      new Promise<Nota[]>((_, no) => setTimeout(() => no(new Error("lento")), 4500)),
    ]);
  } catch {
    return [];
  }
}

function piezaNota(n: Nota): PiezaZonaCero {
  return {
    id: `vg:nota:${n.id.slice(-40)}`,
    clase: "noticia",
    etiqueta: "NOTICIA DE HOY",
    titulo: n.titulo,
    sub: `${n.fuente}${n.resumen ? ` · ${n.resumen.slice(0, 110)}` : ""}`,
    ruta: `/lectura/${n.id}`,
    imagen: n.imagen && n.imagen.startsWith("https://") ? n.imagen : undefined,
    credito: n.imagen ? `Foto · ${n.fuente}` : undefined,
    fecha: n.fecha,
    origen: "fnt:hoy",
  };
}

async function destacados(filtro: FiltroZonaCero): Promise<RespuestaZonaCero> {
  const fuentes: RespuestaZonaCero["fuentes"] = [];
  let cables: PiezaZonaCero[] = [];
  try {
    const filas = await db.newsItem.findMany({
      where: { imageUrl: { startsWith: "https://" } },
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: { id: true, title: true, source: true, conflictTag: true, imageUrl: true, publishedAt: true },
    });
    cables = filas.map((n) => ({
      id: `vg:noticia:${n.id.toLowerCase()}`,
      clase: "noticia" as const,
      etiqueta: ETIQUETA_TIPO.noticia,
      titulo: n.title,
      sub: `${n.source}${n.conflictTag ? ` · ${n.conflictTag.toUpperCase()}` : ""}`,
      ruta: `/noticia/${n.id}`,
      imagen: n.imageUrl ?? undefined,
      credito: `Foto · ${n.source}`,
      fecha: n.publishedAt.toISOString(),
      origen: "fnt:cables",
    }));
    fuentes.push({ id: "fnt:cables", n: cables.length });
  } catch {
    fuentes.push({ id: "fnt:cables", n: 0, fallo: true });
  }
  const hoy = (await notasDelDia()).filter((n) => n.imagen?.startsWith("https://")).slice(0, 6).map(piezaNota);
  fuentes.unshift({ id: "fnt:hoy", n: hoy.length });
  const conImagen = ARTICULOS.filter((a) => a.imagenes[0] && imagenDe(a.imagenes[0].clave));
  const articulos = delDia(conImagen, 6, 1).map((a) => {
    const img = imagenDe(a.imagenes[0].clave)!;
    return {
      id: `vg:documento:enciclopedia-${a.slug}`,
      clase: "conocimiento" as const,
      etiqueta: "ENCICLOPEDIA",
      titulo: a.titulo,
      sub: a.bajada,
      ruta: `/conocimiento/enciclopedia/${a.slug}`,
      imagen: img.archivo,
      credito: `${img.autor} · ${img.licencia} · Wikimedia Commons`,
      fecha: a.actualizado,
      origen: "fnt:conocimiento",
    };
  });
  fuentes.push({ id: "fnt:conocimiento", n: articulos.length });
  const armas = delDia(ARSENAL, 4, 2).map(piezaArma);
  fuentes.push({ id: "fnt:arsenal", n: armas.length });
  const salas = delDia(SALAS, 6, 3).map(piezaSala);
  fuentes.push({ id: "fnt:salas", n: salas.length });

  const todas = [...hoy, ...cables.slice(0, hoy.length >= 4 ? 2 : 6), ...articulos, ...armas, ...salas].filter((p) => pasaFiltro(p, filtro));
  return { q: "", filtro, modo: "destacados", piezas: todas, fuentes };
}

export async function buscarZonaCero(qCruda: string, filtroCrudo: string): Promise<RespuestaZonaCero> {
  const filtro: FiltroZonaCero = (FILTROS_ZONA_CERO as readonly string[]).includes(filtroCrudo)
    ? (filtroCrudo as FiltroZonaCero)
    : "todo";
  const q = sanitizarLinea(qCruda ?? "", 64).trim();
  const norm = normalizar(q);
  if (norm.length < 2) return destacados(filtro);
  const terminos = norm.split(/\s+/).filter((t) => t.length >= 2);

  const fuentes: RespuestaZonaCero["fuentes"] = [];
  let delNucleo: PiezaZonaCero[] = [];
  try {
    const r = await buscarEnNucleo(q, 24, null);
    delNucleo = r.resultados.map(desdeNucleo);
    for (const f of r.fuentes) fuentes.push({ id: f.id, n: f.n, fallo: f.fallo });
  } catch {
    fuentes.push({ id: "fnt:nucleo", n: 0, fallo: true });
  }
  await conFotosDeCables(delNucleo);
  // las notas de hoy que nombran la búsqueda en el título o el resumen
  const hoy = (await notasDelDia())
    .filter((n) => {
      const t = normalizar(`${n.titulo} ${n.resumen}`);
      return terminos.every((x) => t.includes(x));
    })
    .slice(0, 8)
    .map(piezaNota);
  fuentes.unshift({ id: "fnt:hoy", n: hoy.length });
  const armas = buscarArmas(norm, terminos, 8);
  fuentes.push({ id: "fnt:arsenal", n: armas.length });
  const salas = buscarSalas(norm, terminos, 8);
  fuentes.push({ id: "fnt:salas", n: salas.length });

  // sin duplicados (misma ruta = misma pieza); las que traen imagen, delante
  const vistas = new Set<string>();
  const piezas: PiezaZonaCero[] = [];
  for (const p of [...hoy.slice(0, 4), ...armas, ...delNucleo, ...hoy.slice(4), ...salas]) {
    if (vistas.has(p.ruta)) continue;
    vistas.add(p.ruta);
    if (pasaFiltro(p, filtro)) piezas.push(p);
  }
  return { q, filtro, modo: "busqueda", piezas: piezas.slice(0, 48), fuentes };
}
