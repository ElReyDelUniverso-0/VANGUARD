// ============================================================
// v218.0 EL NÚCLEO — BÚSQUEDA GLOBAL (server-only)
// v221.0 LA LUPA — la búsqueda entiende la pregunta:
//   · la parte en TÉRMINOS («ukraine drones» ya encuentra)
//   · PUNTÚA cada candidato: frase exacta > todos los términos >
//     algunos términos — y ordena lo mejor primero
//   · los CABLES se escanean en memoria con la normalización de
//     la casa: «artico» encuentra «ártico» (el LIKE de SQLite no
//     normaliza tildes — bug real verificado contra el archivo)
//   · los FRENTES de la sala de guerra (v220 EL CARTÓGRAFO) son
//     buscables: «bajmut» lleva al mapa, con su fuente OSINT citada
//   · filtro honesto por tipo de entidad (&tipo=noticia)
// Una pregunta → todos los proveedores públicos de la casa
// contestan EN PARALELO bajo el mismo contrato (ProveedorBusqueda).
//
// LEYES QUE CUMPLE (mandato del Dueño):
//   · «consulte únicamente las fuentes de datos disponibles y
//     autorizadas» — cada proveedor declara su fuente y la guarda
//     de frontera (esFuentePublica) lo admite o lo revienta.
//   · «No expongas información privada» — las fuentes privadas
//     (fnt:cuentas, fnt:jugadores, fnt:telemetría, fnt:conversación)
//     NO tienen proveedor: no existen para la búsqueda.
//   · «No generes datos ficticios» — todo resultado sale de la BD
//     real o de un catálogo real de la casa; si un proveedor
//     falla, se reporta como fallo, jamás se inventa.
// ============================================================

import { db } from "@/lib/db";
import { sanitizarLinea } from "@/lib/fortaleza";
import { TEATROS } from "@/lib/teatros";
import { PAISES_ATLAS } from "@/lib/atlas-data";
import { EXPEDIENTES } from "@/lib/expedientes-datos";
import { TEORIAS, ARMAS, CIVILIZACIONES, DOCS } from "@/lib/oscura-data";
import { MODULOS_NUCLEO } from "./registro";
import { puntosDelNucleo } from "./puntos";
import {
  FUENTES_PUBLICAS,
  esFuentePublica,
  type FuenteNucleo,
  type ProveedorBusqueda,
  type ResultadoNucleo,
} from "./fuentes";
import { idEntidad, normalizar, type TipoEntidad } from "./tipos";

// ── LA LUPA: partir la pregunta y puntuar candidatos ────────

/** Los términos de la pregunta (≥ 2 letras; q ya llega normalizado). */
function terminosDe(q: string): string[] {
  return q.split(/\s+/).filter((t) => t.length >= 2);
}

/** Puntos con los que un texto responde a la pregunta. 0 = no pinta.
 *  el texto ES la frase          → 180 (match exacto)
 *  frase completa presente       → 120 (la pregunta textual)
 *  todos los términos            → 40 + 6 por término
 *  solo algunos términos         → 8 por término acertado
 * El orden canónico entre fuentes (ORDEN_ORIGEN) no cambia: esto
 * ordena DENTRO de cada fuente, nunca entre fuentes. */
function puntua(texto: string, frase: string, terminos: string[]): number {
  const t = normalizar(texto);
  if (!t) return 0;
  if (frase && t.includes(frase)) return t === frase ? 180 : 120;
  if (terminos.length === 0) return 0;
  const aciertos = terminos.filter((x) => t.includes(x)).length;
  if (aciertos === 0) return 0;
  return aciertos === terminos.length ? 40 + 6 * aciertos : 8 * aciertos;
}

/** Ordena por puntos (empate = orden de inserción, estable) y recorta. */
function mejores<T>(candidatos: { cosa: T; puntos: number }[], limite: number): T[] {
  return candidatos
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, limite)
    .map((c) => c.cosa);
}

// ── helpers ─────────────────────────────────────────────────

/** slug estable para nombres de medios: «Reuters» → reuters */
function slugMedio(s: string): string {
  return normalizar(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Lookup por id — jamás índices posicionales (el censo puede reordenarse). */
function fuentePublica(id: string): FuenteNucleo {
  const f = FUENTES_PUBLICAS.find((x) => x.id === id);
  if (!f) throw new Error(`fuente pública no declarada: ${id}`);
  return f;
}

// ── LOS PROVEEDORES PÚBLICOS (uno por fuente autorizada) ────

const PROVEEDORES: ProveedorBusqueda[] = [
  // 1. MÓDULOS — la navegación primero: aterrizarte en la puerta correcta
  {
    fuente: fuentePublica("fnt:modulos"),
    async buscar(q, limite) {
      const terminos = terminosDe(q);
      return mejores(
        MODULOS_NUCLEO.map((m) => ({
          cosa: m,
          puntos: puntua(`${m.nombre} ${m.lema} ${m.descripcion} ${m.alias} ${m.ruta}`, q, terminos),
        })).filter((c) => c.puntos > 0),
        limite
      ).map((m) => ({
        moduloId: m.id,
        titulo: m.nombre,
        subtitulo: `${m.lema} — ${m.ruta}`,
        ruta: m.ruta,
        origen: "fnt:modulos",
      }));
    },
  },
  // 2. TEATROS — las regiones de guerra con página propia, más SUS
  //    FRENTES (v221): las ciudades que la sala de guerra (v129)
  //    documenta se vuelven buscables y llevan al mapa. La fuente
  //    OSINT se CITA en el subtítulo — procedencia a la vista.
  {
    fuente: fuentePublica("fnt:teatros"),
    async buscar(q, limite) {
      const terminos = terminosDe(q);
      const candidatos: { cosa: ResultadoNucleo; puntos: number }[] = [];
      for (const [slug, t] of Object.entries(TEATROS)) {
        const pTeatro = puntua(`${slug} ${t.nombre} ${t.resumen}`, q, terminos);
        if (pTeatro > 0) {
          candidatos.push({
            cosa: {
              entidad: { id: idEntidad("region", slug), tipo: "region" as const, nombre: t.nombre },
              titulo: `Teatro: ${t.nombre}`,
              subtitulo: t.resumen,
              ruta: `/conflicto/${slug}`,
              origen: "fnt:teatros",
            },
            puntos: pTeatro,
          });
        }
        // frentes documentados del teatro (geografía v220: cero
        // coordenadas inventadas — solo se proyecta la sala de la casa).
        // v225 EL FRENTE: cada punto es una ENTIDAD vg:punto con ficha
        // propia — la búsqueda lleva a la FICHA, y la ficha al mapa.
        for (const punto of puntosDelNucleo().filter((p) => p.teatro === slug)) {
          const p = puntua(`${punto.nombre} ${punto.estado}`, q, terminos);
          if (p > 0) {
            candidatos.push({
              cosa: {
                entidad: {
                  id: idEntidad("punto", punto.clave),
                  tipo: "punto" as const,
                  nombre: punto.nombre,
                },
                titulo: `Frente: ${punto.nombre} — ${punto.estado}`,
                subtitulo: `Punto del frente del teatro ${t.nombre} · mapa OSINT · fuente: ${punto.fuenteDatos ?? "sala de guerra de la casa"}`,
                ruta: `/nucleo?id=${encodeURIComponent(idEntidad("punto", punto.clave))}`,
                origen: "fnt:teatros",
              },
              puntos: p,
            });
          }
        }
      }
      return mejores(candidatos, limite);
    },
  },
  // 3. PAÍSES — el atlas de naciones
  {
    fuente: fuentePublica("fnt:atlas"),
    async buscar(q, limite) {
      const terminos = terminosDe(q);
      return mejores(
        PAISES_ATLAS.map((p) => ({
          cosa: p,
          puntos: puntua(`${p.nombre} ${p.capital} ${p.lider} ${p.gobierno}`, q, terminos),
        })).filter((c) => c.puntos > 0),
        limite
      ).map((p) => ({
        entidad: { id: idEntidad("pais", p.id), tipo: "pais" as const, nombre: p.nombre },
        titulo: p.nombre,
        subtitulo: `${p.capital} · ${p.gobierno}`,
        ruta: `/nucleo?id=${idEntidad("pais", p.id)}`,
        origen: "fnt:atlas",
      }));
    },
  },
  // 4. CABLES — el archivo real (BD), escaneado EN MEMORIA
  //    (v221 LA LUPA: normalizar() de la casa sobre título+resumen —
  //    «artico» encuentra «ártico», cosa que el LIKE de SQLite no hace;
  //    multi-término: los que citan TODOS los términos quedan arriba;
  //    y EL TÍTULO MANDA: el título puntúa doble frente al resumen —
  //    un cable que cita la pregunta en su titular es más relevante
  //    que uno que la menciona de pasada; a igualdad, el más reciente).
  {
    fuente: fuentePublica("fnt:cables"),
    async buscar(q, limite) {
      const terminos = terminosDe(q);
      const filas = await db.newsItem.findMany({
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          summary: true,
          source: true,
          publishedAt: true,
          conflictTag: true,
        },
      });
      return mejores(
        filas
          .map((n) => ({
            cosa: n,
            puntos:
              puntua(n.title, q, terminos) * 2 +
              puntua(n.summary ?? "", q, terminos),
          }))
          .filter((c) => c.puntos > 0),
        limite
      ).map((n) => ({
        entidad: { id: idEntidad("noticia", n.id), tipo: "noticia" as const, nombre: n.title },
        titulo: n.title,
        subtitulo: `${n.source}${n.conflictTag ? ` · ${n.conflictTag.toUpperCase()}` : ""}`,
        ruta: `/noticia/${n.id}`,
        fecha: n.publishedAt.toISOString(),
        origen: "fnt:cables",
      }));
    },
  },
  // 5. ACONTECIMIENTOS — los hechos reales que reúnen varias noticias
  //    (tabla Acontecimiento; LA LUPA puntuó también aquí: frase >
  //    todos los términos > algunos — «invasion rusa» sigue hallando
  //    «Invasión rusa» y ahora «rusa ucrania» también lo encuentra).
  {
    fuente: fuentePublica("fnt:acontecimientos"),
    async buscar(q, limite) {
      const terminos = terminosDe(q);
      const filas = await db.acontecimiento.findMany({
        select: { id: true, slug: true, titulo: true, resumen: true, estado: true, teatroTag: true, ocurridoDesde: true, busca: true },
      });
      return mejores(
        filas
          .map((a) => ({
            cosa: a,
            // el título manda (v221): doble peso frente al resumen
            puntos:
              puntua(a.titulo, q, terminos) * 2 +
              puntua(`${a.resumen} ${a.busca}`, q, terminos),
          }))
          .filter((c) => c.puntos > 0),
        limite
      ).map((a) => ({
        entidad: { id: a.id, tipo: "acontecimiento" as const, nombre: a.titulo },
        titulo: `Acontecimiento: ${a.titulo}`,
        subtitulo: `${a.estado.toUpperCase()} · desde ${a.ocurridoDesde?.toISOString().slice(0, 10) ?? "fecha sin precisión"}${a.teatroTag ? ` · teatro ${a.teatroTag}` : ""}`,
        ruta: `/nucleo?id=${encodeURIComponent(a.id)}`,
        fecha: a.ocurridoDesde?.toISOString(),
        origen: "fnt:acontecimientos",
      }));
    },
  },
  // 6. DOCUMENTOS — expedientes + alejandría oscura (catálogos reales),
  //    ambos catálogos compiten por puntos en una sola cola.
  {
    fuente: fuentePublica("fnt:documentos"),
    async buscar(q, limite) {
      const terminos = terminosDe(q);
      const candidatos: { cosa: ResultadoNucleo; puntos: number }[] = [];
      for (const e of EXPEDIENTES) {
        const p = puntua(`${e.titulo} ${e.agencia} ${e.cat} ${e.rareza}`, q, terminos);
        if (p > 0) {
          candidatos.push({
            cosa: {
              entidad: { id: idEntidad("documento", `exp-${e.id}`), tipo: "documento" as const, nombre: e.titulo },
              titulo: e.titulo,
              subtitulo: `ARCHIVO SECRETO · ${e.agencia} · ${e.year} · ${e.rareza}`,
              ruta: `/nucleo?id=${idEntidad("documento", `exp-${e.id}`)}`,
              origen: "fnt:documentos",
            },
            puntos: p,
          });
        }
      }
      const oscura = [
        ...TEORIAS.map((x) => ({ id: x.id, titulo: x.titulo, fuente: x.fuente, sala: "TEORÍAS" })),
        ...ARMAS.map((x) => ({ id: x.id, titulo: x.titulo, fuente: x.fuente, sala: "ARMAS" })),
        ...CIVILIZACIONES.map((x) => ({ id: x.id, titulo: x.titulo, fuente: x.fuente, sala: "CIVILIZACIONES" })),
        ...DOCS.map((x) => ({ id: x.id, titulo: x.titulo, fuente: x.fuente, sala: "DOCUMENTOS" })),
      ];
      for (const x of oscura) {
        const p = puntua(`${x.titulo} ${x.fuente}`, q, terminos);
        if (p > 0) {
          candidatos.push({
            cosa: {
              entidad: { id: idEntidad("documento", `osc-${x.id}`), tipo: "documento" as const, nombre: x.titulo },
              titulo: x.titulo,
              subtitulo: `ALEJANDRÍA OSCURA · ${x.sala} · ${x.fuente}`,
              ruta: `/nucleo?id=${idEntidad("documento", `osc-${x.id}`)}`,
              origen: "fnt:documentos",
            },
            puntos: p,
          });
        }
      }
      return mejores(candidatos, limite);
    },
  },
  // 7. ANÁLISIS — la verdad cruda (verificaciones de la comunidad),
  //    escaneo en memoria con la normalización de la casa.
  {
    fuente: fuentePublica("fnt:verificaciones"),
    async buscar(q, limite) {
      const terminos = terminosDe(q);
      const filas = await db.newsVerify.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, headline: true, source: true, truth: true, resolved: true },
      });
      return mejores(
        filas
          .map((v) => ({
            cosa: v,
            puntos: puntua(`${v.headline} ${v.source}`, q, terminos),
          }))
          .filter((c) => c.puntos > 0),
        limite
      ).map((v) => ({
        entidad: { id: idEntidad("analisis", v.id), tipo: "analisis" as const, nombre: v.headline },
        titulo: v.headline,
        subtitulo: `VERDAD CRUDA · ${v.resolved ? `veredicto: ${v.truth || "sin resolver"}` : "en votación"} · ${v.source}`,
        ruta: `/nucleo?id=${idEntidad("analisis", v.id)}`,
        fecha: undefined,
        origen: "fnt:verificaciones",
      }));
    },
  },
  // 8. AUDIOS — el muro de la emisora (contenido público de la comunidad)
  {
    fuente: fuentePublica("fnt:audios"),
    async buscar(q, limite) {
      const terminos = terminosDe(q);
      const filas = await db.audioComandante.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, autor: true, titulo: true, duracion: true, createdAt: true },
      });
      return mejores(
        filas
          .map((a) => ({
            cosa: a,
            puntos: puntua(`${a.titulo} ${a.autor}`, q, terminos),
          }))
          .filter((c) => c.puntos > 0),
        limite
      ).map((a) => ({
        entidad: { id: idEntidad("documento", `aud-${a.id}`), tipo: "documento" as const, nombre: a.titulo },
        titulo: a.titulo,
        subtitulo: `EMISORA · audio de ${a.autor} · ${a.duracion}s`,
        ruta: `/nucleo?id=${idEntidad("documento", `aud-${a.id}`)}`,
        fecha: a.createdAt.toISOString(),
        origen: "fnt:audios",
      }));
    },
  },
  // 9. MEDIOS — quién firma las noticias (fuentes reales del archivo,
  //    distintas en memoria y puntuadas con la lupa).
  {
    fuente: fuentePublica("fnt:fuentes"),
    async buscar(q, limite) {
      const terminos = terminosDe(q);
      const filas = await db.newsItem.findMany({ select: { source: true } });
      const unicos = [...new Set(filas.map((f) => f.source))];
      return mejores(
        unicos
          .map((s) => ({ cosa: s, puntos: puntua(s, q, terminos) }))
          .filter((c) => c.puntos > 0),
        limite
      ).map((r) => {
        const slug = slugMedio(r);
        return {
          entidad: { id: idEntidad("fuente", `med-${slug}`), tipo: "fuente" as const, nombre: r },
          titulo: r,
          subtitulo: "Medio que firma cables del archivo",
          ruta: `/nucleo?id=${idEntidad("fuente", `med-${slug}`)}`,
          origen: "fnt:fuentes",
        };
      });
    },
  },
];

// ── EL MOTOR: pregunta única, respuestas unificadas ─────────

export interface FuenteConsultada {
  id: string;
  nombre: string;
  n: number;
  fallo?: boolean;
}

export interface RespuestaBusquedaNucleo {
  ok: boolean;
  q: string;
  /** v221 LA LUPA: los términos en que se partió la pregunta. */
  terminos: string[];
  /** v221: filtro por tipo aplicado (null = sin filtro). */
  tipo: TipoEntidad | null;
  resultados: ResultadoNucleo[];
  fuentes: FuenteConsultada[]; // TODAS las públicas consultadas (honestidad)
  generado: string;
}

/** Orden canónico de resultados: navegar → entender → leer → oír. */
const ORDEN_ORIGEN = [
  "fnt:modulos",
  "fnt:teatros",
  "fnt:acontecimientos",
  "fnt:atlas",
  "fnt:cables",
  "fnt:documentos",
  "fnt:verificaciones",
  "fnt:audios",
  "fnt:fuentes",
];

export async function buscarEnNucleo(
  qRaw: string,
  limite = 24,
  tipoFiltro: TipoEntidad | null = null
): Promise<RespuestaBusquedaNucleo> {
  const q = sanitizarLinea(qRaw, 64);
  const norm = normalizar(q);
  const terminos = terminosDe(norm);
  const generado = new Date().toISOString();

  if (norm.length < 2) {
    return {
      ok: false,
      q,
      terminos,
      tipo: tipoFiltro,
      resultados: [],
      fuentes: [],
      generado,
    };
  }

  const asientos = FUENTES_PUBLICAS.map<FuenteConsultada>((f) => ({ id: f.id, nombre: f.nombre, n: 0 }));

  const asentados = await Promise.allSettled(
    PROVEEDORES.map(async (prov) => {
      // GUARDA DE FRONTERA — un proveedor sin fuente pública declarada
      // jamás llega a correr (defensa en profundidad).
      if (!esFuentePublica(prov.fuente.id)) {
        throw new Error(`fuente no autorizada: ${prov.fuente.id}`);
      }
      const res = await prov.buscar(norm, 8);
      return { prov, res };
    })
  );

  const porOrigen = new Map<string, ResultadoNucleo[]>();
  for (const r of asentados) {
    if (r.status === "fulfilled") {
      porOrigen.set(r.value.prov.fuente.id, r.value.res);
    }
  }

  for (const a of asientos) {
    const lista = porOrigen.get(a.id);
    if (lista) a.n = lista.length;
    else a.fallo = true; // no respondió: se declara, jamás se inventa
  }

  let resultados: ResultadoNucleo[] = [];
  for (const origen of ORDEN_ORIGEN) {
    for (const r of porOrigen.get(origen) ?? []) {
      if (resultados.length >= limite) break;
      resultados.push(r);
    }
  }

  // v221 LA LUPA — filtro honesto por tipo: solo entidades de ese tipo
  // sobreviven. Los módulos del censo (sin entidad) solo pasan con
  // tipo=mapa, que es su publica_tipo declarado en fuentes.ts.
  if (tipoFiltro) {
    resultados = resultados.filter(
      (r) =>
        r.entidad
          ? r.entidad.tipo === tipoFiltro
          : tipoFiltro === "mapa" && Boolean(r.moduloId)
    );
  }

  return { ok: true, q, terminos, tipo: tipoFiltro, resultados, fuentes: asientos, generado };
}

/** Para el mapa de entidades de /nucleo: qué proveedores hay por fuente. */
export function proveedoresDelNucleo(): { fuente: FuenteNucleo; listo: boolean }[] {
  return FUENTES_PUBLICAS.map((f) => ({
    fuente: f,
    listo: PROVEEDORES.some((p) => p.fuente.id === f.id),
  }));
}
