// ═══════════════════════════════════════════════════════════════════════════
// v419.1 · EL CORPUS DE LA CASA — de dónde puede citar la Cámara
//
// Una regla manda sobre todo lo demás: **solo se cita lo que existe**. Por eso
// este archivo no inventa un índice nuevo: lee las fuentes que la casa ya
// publica y las convierte en algo citable.
//
//   · los 10 dossiers sistémicos de /investigacion (TEMAS_INVESTIGACION)
//   · la enciclopedia de /conocimiento/enciclopedia (ARTICULOS)
//   · las fichas de país del atlas (PAISES_ATLAS) → /datos-mundiales/pais/<iso>
//   · los expedientes de conceptos (CONCEPTOS) → /conocimiento/tema/<id>
//   · lo que responda el buscador global del núcleo (noticias, teatros, módulos…)
//   · los documentos que el operador sube (viajan aparte, en documentos.ts)
//
// SOLO SERVIDOR: importa los catálogos completos (cientos de KB) y no debe
// viajar al navegador.
// ═══════════════════════════════════════════════════════════════════════════

import { TEMAS_INVESTIGACION } from "@/lib/investigacion/temas-data";
import { ARTICULOS, rutaArticulo } from "@/lib/enciclopedia/indice";
import { PAISES_ATLAS } from "@/lib/atlas-data";
import { CONCEPTOS } from "@/lib/conocimiento/indice";
import { buscarEnNucleo } from "@/lib/nucleo/busqueda";
import type { Fuente, Pasaje, ViaFuente } from "./tipos";
import { frases, idfDe, normalizar, puntuar, terminos } from "./texto";

interface EntradaCorpus {
  fuente: Fuente;
  pasajes: Pasaje[];
  /** todo el texto junto, para puntuar y para extraer entidades */
  texto: string;
  /** términos precalculados del título (peso alto en la selección) */
  tituloTerminos: string[];
}

// ── Construcción del corpus fijo (una vez por instancia de lambda) ──────

let cache: EntradaCorpus[] | null = null;

function pasajes(titulo: string, bloques: { donde: string; texto: string }[]): Pasaje[] {
  const salida: Pasaje[] = [];
  let n = 0;
  for (const b of bloques) {
    const limpio = b.texto.replace(/\s+/g, " ").trim();
    if (limpio.length < 30) continue;
    // un bloque muy largo se parte por frases para que la cita sea corta y útil
    if (limpio.length > 700) {
      let acumulado: string[] = [];
      let largo = 0;
      for (const f of frases(limpio)) {
        acumulado.push(f);
        largo += f.length;
        if (largo > 620) {
          salida.push({ fuenteId: titulo, n: n++, texto: acumulado.join(" "), donde: b.donde });
          acumulado = [];
          largo = 0;
        }
      }
      if (acumulado.length) salida.push({ fuenteId: titulo, n: n++, texto: acumulado.join(" "), donde: b.donde });
    } else {
      salida.push({ fuenteId: titulo, n: n++, texto: limpio, donde: b.donde });
    }
  }
  return salida;
}

export function corpusFijo(): EntradaCorpus[] {
  if (cache) return cache;
  const salida: EntradaCorpus[] = [];

  // ① Dossiers sistémicos — el material más denso de la casa.
  for (const t of TEMAS_INVESTIGACION) {
    const id = `dossier:${t.id}`;
    const bloques = [
      { donde: "resumen ejecutivo", texto: t.resumenEjecutivo },
      ...t.preguntasClave.map((p, i) => ({ donde: `pregunta clave ${i + 1}`, texto: p })),
      ...t.conceptosEsenciales.map((c) => ({ donde: `concepto · ${c.termino}`, texto: `${c.termino}: ${c.definicion} ${c.contexto}` })),
      ...t.actoresClave.map((a) => ({ donde: `actor · ${a.nombre}`, texto: `${a.nombre} — ${a.rol}. Postura: ${a.postura}. Influencia: ${a.influencia}.` })),
      ...t.cronologia.map((c) => ({ donde: `cronología · ${c.fecha}`, texto: `${c.fecha}: ${c.hito} Impacto: ${c.impacto}` })),
      ...t.indicadoresEmpiricos.map((i) => ({ donde: `indicador · ${i.nombre}`, texto: `${i.nombre}: ${i.valor} ${i.unidad} (${i.periodo}, fuente oficial: ${i.fuenteOficial}). ${i.interpretacion}` })),
      ...t.puntosCiegos.map((p, i) => ({ donde: `punto ciego ${i + 1}`, texto: p })),
    ];
    const ps = pasajes(id, bloques);
    salida.push({
      fuente: {
        id,
        via: "dossier",
        titulo: t.titulo,
        resumen: t.subtitulo,
        ruta: `/investigacion/${t.id}`,
        fecha: t.fechaActualizacion,
        emisor: "VANGUARD · dossier sistémico",
      },
      pasajes: ps,
      texto: bloques.map((b) => b.texto).join(" "),
      tituloTerminos: terminos(`${t.titulo} ${t.subtitulo} ${t.etiquetas.join(" ")}`),
    });
  }

  // ② Enciclopedia — artículos con fuentes propias.
  for (const a of ARTICULOS) {
    const id = `enciclopedia:${a.slug}`;
    const bloques = [
      { donde: "bajada", texto: a.bajada },
      ...a.introduccion.map((p, i) => ({ donde: `introducción ${i + 1}`, texto: p })),
      ...a.secciones.flatMap((s) => s.parrafos.map((p, i) => ({ donde: `${s.titulo} ${i + 1}`, texto: p }))),
      ...(a.historia ? a.historia.parrafos.map((p, i) => ({ donde: `historia ${i + 1}`, texto: p })) : []),
      ...a.datos.map((d) => ({ donde: `dato · ${d.etiqueta}`, texto: `${d.etiqueta}: ${d.valor}${d.nota ? ` (${d.nota})` : ""}` })),
      ...(a.cronologia ? a.cronologia.map((c) => ({ donde: `cronología · ${c.fecha}`, texto: `${c.fecha}: ${c.texto}` })) : []),
    ];
    const ps = pasajes(id, bloques);
    salida.push({
      fuente: {
        id,
        via: "enciclopedia",
        titulo: a.titulo,
        resumen: a.bajada,
        ruta: rutaArticulo(a.slug),
        fecha: a.actualizado,
        emisor: `VANGUARD · enciclopedia (${a.fuentes.length} fuentes propias)`,
      },
      pasajes: ps,
      texto: bloques.map((b) => b.texto).join(" "),
      tituloTerminos: terminos(`${a.titulo} ${a.bajada} ${a.palabrasClave.join(" ")}`),
    });
  }

  // ③ Fichas de país — datos duros, con fecha de revisión del atlas.
  for (const p of PAISES_ATLAS) {
    const id = `pais:${p.id}`;
    const bloques = [
      { donde: "ficha", texto: `${p.nombre}. Capital: ${p.capital}. Región: ${p.region}. Población: ${p.poblacion} millones. Superficie: ${p.superficie} km². Idiomas: ${p.idiomas}. Moneda: ${p.moneda}. Gobierno: ${p.gobierno}. Liderazgo: ${p.lider}.` },
      { donde: "verdad estratégica", texto: p.dato },
    ];
    const ps = pasajes(id, bloques);
    salida.push({
      fuente: {
        id,
        via: "pais",
        titulo: `Ficha de país · ${p.nombre}`,
        resumen: p.dato.slice(0, 160),
        ruta: `/datos-mundiales/pais/${p.id}`,
        emisor: "VANGUARD · atlas (ficha de país)",
      },
      pasajes: ps,
      texto: bloques.map((b) => b.texto).join(" "),
      tituloTerminos: terminos(`${p.nombre} ${p.capital} ${p.region} ${p.idiomas}`),
    });
  }

  // ④ Expedientes de conceptos.
  for (const c of CONCEPTOS) {
    const id = `concepto:${c.id}`;
    const bloques = [
      { donde: "resumen", texto: `${c.titulo}: ${c.resumen ?? ""}` },
      { donde: "mecanismo", texto: c.mecanismo ?? "" },
      { donde: "contexto", texto: c.contexto ?? "" },
      { donde: "límite declarado", texto: c.limite ?? "" },
      { donde: "la pregunta que responde", texto: c.pregunta ?? "" },
    ];
    const ps = pasajes(id, bloques);
    if (!ps.length) continue;
    salida.push({
      fuente: {
        id,
        via: "concepto",
        titulo: `Expediente · ${c.titulo}`,
        resumen: (c.resumen ?? "").slice(0, 160),
        ruta: `/conocimiento/tema/${c.id}`,
        emisor: "VANGUARD · expediente de conocimiento",
      },
      pasajes: ps,
      texto: bloques.map((b) => b.texto).join(" "),
      tituloTerminos: terminos(`${c.titulo} ${c.area} ${(c.paises ?? []).join(" ")}`),
    });
  }

  cache = salida;
  return salida;
}

/** Cuántas fuentes y pasajes puede citar la Cámara (se enseña en la interfaz). */
export function censoCorpus() {
  const c = corpusFijo();
  const porVia: Record<string, number> = {};
  for (const e of c) porVia[e.fuente.via] = (porVia[e.fuente.via] ?? 0) + 1;
  return {
    fuentes: c.length,
    pasajes: c.reduce((n, e) => n + e.pasajes.length, 0),
    porVia,
  };
}

// ── Selección de fuentes para una pregunta ──────────────────────────────

export interface FuenteCandidata extends Fuente {
  /** cuánto encaja con la pregunta (0-∞, sólo ordena) */
  puntos: number;
  /** los dos mejores extractos, para que el operador sepa qué va a citar */
  muestra: string[];
  pasajesN: number;
}

/**
 * La PODA, contada. La casa tenía un `slice` silencioso: si treinta fuentes
 * hablaban del asunto y se devolvían catorce, el operador nunca sabía que
 * existían las otras dieciséis. Aquí se cuenta todo lo que se cae y por qué.
 */
export interface PodaCandidatas {
  /** fuentes del corpus total (todas las vías) */
  total: number;
  /** las examinadas con las vías pedidas */
  examinadas: number;
  /** descartadas antes de puntuar: su vía estaba excluida */
  fueraDeVias: number;
  /** las que sí hablan del asunto (superan el umbral) */
  relevantes: number;
  /** las que se devuelven al operador */
  devueltas: number;
  /** hablan del asunto pero no caben en el tope: fuera por puntuación */
  porTope: number;
  /** no llegan al umbral: el asunto no aparece en ellas */
  bajoUmbral: number;
  umbral: number;
}

export interface BusquedaPodada {
  candidatas: FuenteCandidata[];
  poda: PodaCandidatas;
}

const UMBRAL = 0.15;
const TOPE = 14;

/** Todas las fuentes que hablan del asunto, sin recortar. */
function candidatasDe(
  pregunta: string,
  opts: { vias?: ViaFuente[] }
): { todas: FuenteCandidata[]; examinadas: number; total: number } {
  const q = terminos(pregunta);
  const completo = corpusFijo();
  if (!q.length) return { todas: [], examinadas: 0, total: completo.length };
  const corpus = completo.filter((e) => !opts.vias?.length || opts.vias.includes(e.fuente.via));
  const idf = idfDe(corpus.map((e) => e.texto));
  const salida: FuenteCandidata[] = [];

  for (const e of corpus) {
    const enTitulo = puntuar(q, e.fuente.titulo + " " + e.tituloTerminos.join(" "), idf) * 2.2;
    const enCuerpo = puntuar(q, e.texto, idf);
    const puntos = enTitulo + enCuerpo;
    if (puntos <= UMBRAL) continue;
    const ordenados = e.pasajes
      .map((p) => ({ p, s: puntuar(q, p.texto, idf) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    salida.push({
      ...e.fuente,
      puntos: Math.round(puntos * 100) / 100,
      muestra: ordenados.slice(0, 2).map((x) => x.p.texto.slice(0, 240)),
      pasajesN: ordenados.length,
    });
  }

  salida.sort((a, b) => b.puntos - a.puntos);
  return { todas: salida, examinadas: corpus.length, total: completo.length };
}

/**
 * Devuelve las fuentes que hablan de la pregunta **y la cuenta de la poda**.
 * `vias` permite al operador restringir («sólo dossiers», «sólo países»).
 */
export function buscarConPoda(
  pregunta: string,
  opts: { vias?: ViaFuente[]; limite?: number } = {}
): BusquedaPodada {
  const tope = opts.limite ?? TOPE;
  const { todas, examinadas, total } = candidatasDe(pregunta, opts);
  const candidatas = todas.slice(0, tope);
  return {
    candidatas,
    poda: {
      total,
      examinadas,
      fueraDeVias: total - examinadas,
      relevantes: todas.length,
      devueltas: candidatas.length,
      porTope: Math.max(0, todas.length - candidatas.length),
      bajoUmbral: examinadas - todas.length,
      umbral: UMBRAL,
    },
  };
}

/**
 * Devuelve las fuentes de la casa que hablan de la pregunta, ordenadas.
 * (Firma histórica: sin la cuenta de la poda. Para contarla, `buscarConPoda`.)
 */
export function buscarFuentes(
  pregunta: string,
  opts: { vias?: ViaFuente[]; limite?: number } = {}
): FuenteCandidata[] {
  return buscarConPoda(pregunta, opts).candidatas;
}

/** La poda en una frase, para el aviso que ve el operador. */
export function fraseDePoda(p: PodaCandidatas): string {
  if (!p.relevantes) {
    return `Se examinaron ${p.examinadas} fuentes de la casa y ninguna llega al umbral (${p.umbral}).`;
  }
  const partes = [`Se usaron ${p.devueltas} de ${p.relevantes} fuentes que hablan del asunto`];
  if (p.porTope) partes.push(`${p.porTope} quedaron fuera por puntuación, no por falta de datos`);
  if (p.fueraDeVias) partes.push(`${p.fueraDeVias} no se examinaron por las vías elegidas`);
  if (p.bajoUmbral) partes.push(`${p.bajoUmbral} no mencionan el asunto`);
  return partes.join("; ") + ".";
}

/** Los pasajes de las fuentes elegidas que de verdad responden a la pregunta. */
export function pasajesDe(fuenteIds: string[], pregunta: string, porFuente = 3, tope = 22): Pasaje[] {
  const pedidas = new Set(fuenteIds);
  const q = terminos(pregunta);
  const corpus = corpusFijo().filter((e) => pedidas.has(e.fuente.id));
  const idf = idfDe(corpus.map((e) => e.texto));
  const salida: { p: Pasaje; s: number }[] = [];
  for (const e of corpus) {
    const ordenados = e.pasajes
      .map((p) => ({ p, s: puntuar(q, p.texto, idf) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, porFuente);
    salida.push(...ordenados.map((x) => ({ p: x.p, s: x.s })));
  }
  return salida
    .sort((a, b) => b.s - a.s)
    .slice(0, tope)
    .map((x) => x.p);
}

/** Convierte resultados del buscador global en fuentes citables (vivo). */
export async function fuentesVivas(pregunta: string, limite = 8): Promise<FuenteCandidata[]> {
  try {
    const r = await buscarEnNucleo(pregunta, limite);
    return r.resultados.slice(0, limite).map((x) => ({
      id: `nucleo:${x.entidad?.id ?? x.moduloId ?? normalizar(x.titulo).slice(0, 40)}`,
      via: (x.entidad?.tipo === "noticia" ? "noticia" : x.moduloId || !x.entidad ? "modulo" : "noticia") as ViaFuente,
      titulo: x.titulo,
      resumen: x.subtitulo,
      ruta: x.ruta,
      fecha: x.fecha?.slice(0, 10),
      emisor: x.origen.replace("fnt:", "núcleo · "),
      origenNucleo: x.origen,
      puntos: 1,
      muestra: [x.subtitulo].filter(Boolean),
      pasajesN: 1,
    }));
  } catch {
    return [];
  }
}

// ── Bibliografía real ──────────────────────────────────────────────────

/** Saca las fuentes metodológicas de los dossiers citados (son las de verdad). */
export function bibliografiaDe(fuenteIds: string[]) {
  const entradas: { id: string; autor: string; titulo: string; anio: string; url?: string; tipo: string }[] = [];
  const citas: string[] = [];
  const vistos = new Set<string>();

  for (const id of fuenteIds) {
    const m = id.match(/^dossier:(.+)$/);
    if (m) {
      const t = TEMAS_INVESTIGACION.find((x) => x.id === m[1]);
      if (!t) continue;
      for (const f of t.fuentesMetodologicas) {
        const clave = normalizar(`${f.institucion}|${f.publicacion}|${f.anio}`);
        if (vistos.has(clave)) continue;
        vistos.add(clave);
        const corto = f.institucion.split(/[,(]/)[0].trim();
        entradas.push({
          id: `bib:${clave}`,
          autor: f.institucion,
          titulo: f.publicacion,
          anio: String(f.anio),
          url: undefined,
          tipo: f.tipo,
        });
        citas.push(`${corto} (${f.anio}), «${f.publicacion}».`);
      }
    }
    const e = id.match(/^enciclopedia:(.+)$/);
    if (e) {
      const a = ARTICULOS.find((x) => x.slug === e[1]);
      if (!a) continue;
      for (const f of a.fuentes) {
        const clave = normalizar(`${f.editor}|${f.titulo}`);
        if (vistos.has(clave)) continue;
        vistos.add(clave);
        entradas.push({ id: `bib:${clave}`, autor: f.editor, titulo: f.titulo, anio: String(a.actualizado.slice(0, 4)), url: f.url, tipo: f.tipo });
        citas.push(`${f.editor} (${a.actualizado.slice(0, 4)}), «${f.titulo}», ${f.url}.`);
      }
    }
    const p = id.match(/^pais:(.+)$/);
    if (p) {
      const pais = PAISES_ATLAS.find((x) => x.id === p[1]);
      if (!pais) continue;
      const clave = `atlas|${pais.id}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      entradas.push({ id: `bib:${clave}`, autor: "VANGUARD · Atlas de naciones", titulo: `Ficha de país: ${pais.nombre}`, anio: String(new Date().getFullYear()), tipo: "DATOS" });
      citas.push(`VANGUARD, «Ficha de país: ${pais.nombre}» (/datos-mundiales/pais/${pais.id}).`);
    }
  }

  const bibtex = entradas
    .map((e, i) => {
      const clave = `${(e.autor.split(/\s+/)[0] || "vanguard").toLowerCase()}${e.anio}${i}`.replace(/[^a-z0-9]/g, "");
      const tipo = e.tipo === "AGENCIA_OFICIAL" || e.tipo === "institucional" ? "techreport" : "misc";
      return `@${tipo}{${clave},\n  author = {${e.autor}},\n  title = {${e.titulo}},\n  year = {${e.anio}}${e.url ? `,\n  url = {${e.url}}` : ""}\n}`;
    })
    .join("\n\n");

  return { entradas, citas, bibtex };
}
