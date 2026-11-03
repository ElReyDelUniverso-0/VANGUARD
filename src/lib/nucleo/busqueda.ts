// ============================================================
// v218.0 EL NÚCLEO — BÚSQUEDA GLOBAL (server-only)
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
import {
  FUENTES_PUBLICAS,
  esFuentePublica,
  type FuenteNucleo,
  type ProveedorBusqueda,
  type ResultadoNucleo,
} from "./fuentes";
import { idEntidad, normalizar } from "./tipos";

// ── helpers ─────────────────────────────────────────────────

/** slug estable para nombres de medios: «Reuters» → reuters */
function slugMedio(s: string): string {
  return normalizar(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function incluye(haystack: string, aguja: string): boolean {
  return normalizar(haystack).includes(aguja);
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
      return MODULOS_NUCLEO.filter((m) =>
        incluye(`${m.nombre} ${m.lema} ${m.descripcion} ${m.alias} ${m.ruta}`, q)
      )
        .slice(0, limite)
        .map((m) => ({
          moduloId: m.id,
          titulo: m.nombre,
          subtitulo: `${m.lema} — ${m.ruta}`,
          ruta: m.ruta,
          origen: "fnt:modulos",
        }));
    },
  },
  // 2. TEATROS — las regiones de guerra con página propia
  {
    fuente: fuentePublica("fnt:teatros"),
    async buscar(q, limite) {
      return Object.entries(TEATROS)
        .filter(([slug, t]) => incluye(`${slug} ${t.nombre} ${t.resumen}`, q))
        .slice(0, limite)
        .map(([slug, t]) => ({
          entidad: { id: idEntidad("region", slug), tipo: "region" as const, nombre: t.nombre },
          titulo: `Teatro: ${t.nombre}`,
          subtitulo: t.resumen,
          ruta: `/conflicto/${slug}`,
          origen: "fnt:teatros",
        }));
    },
  },
  // 3. PAÍSES — el atlas de naciones
  {
    fuente: fuentePublica("fnt:atlas"),
    async buscar(q, limite) {
      return PAISES_ATLAS.filter((p) =>
        incluye(`${p.nombre} ${p.capital} ${p.lider} ${p.gobierno}`, q)
      )
        .slice(0, limite)
        .map((p) => ({
          entidad: { id: idEntidad("pais", p.id), tipo: "pais" as const, nombre: p.nombre },
          titulo: p.nombre,
          subtitulo: `${p.capital} · ${p.gobierno}`,
          ruta: `/nucleo?id=${idEntidad("pais", p.id)}`,
          origen: "fnt:atlas",
        }));
    },
  },
  // 4. CABLES — el archivo real (BD)
  {
    fuente: fuentePublica("fnt:cables"),
    async buscar(q, limite) {
      const rows = await db.newsItem.findMany({
        where: { OR: [{ title: { contains: q } }, { summary: { contains: q } }] },
        orderBy: { publishedAt: "desc" },
        take: limite,
        select: {
          id: true,
          title: true,
          summary: true,
          source: true,
          publishedAt: true,
          conflictTag: true,
        },
      });
      return rows.map((n) => ({
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
  //    (tabla Acontecimiento; filtro en memoria sobre `busca` normalizado
  //    para que «invasion» encuentre «Invasión» sin depender del LIKE).
  {
    fuente: fuentePublica("fnt:acontecimientos"),
    async buscar(q, limite) {
      const filas = await db.acontecimiento.findMany({
        select: { id: true, slug: true, titulo: true, resumen: true, estado: true, teatroTag: true, ocurridoDesde: true, busca: true },
      });
      return filas
        .filter((a) => a.busca.includes(q) || normalizar(`${a.titulo} ${a.resumen}`).includes(q))
        .slice(0, limite)
        .map((a) => ({
          entidad: { id: a.id, tipo: "acontecimiento" as const, nombre: a.titulo },
          titulo: `Acontecimiento: ${a.titulo}`,
          subtitulo: `${a.estado.toUpperCase()} · desde ${a.ocurridoDesde?.toISOString().slice(0, 10) ?? "fecha sin precisión"}${a.teatroTag ? ` · teatro ${a.teatroTag}` : ""}`,
          ruta: `/nucleo?id=${encodeURIComponent(a.id)}`,
          fecha: a.ocurridoDesde?.toISOString(),
          origen: "fnt:acontecimientos",
        }));
    },
  },
  // 6. DOCUMENTOS — expedientes + alejandría oscura (catálogos reales)
  {
    fuente: fuentePublica("fnt:documentos"),
    async buscar(q, limite) {
      const exps: ResultadoNucleo[] = EXPEDIENTES.filter((e) =>
        incluye(`${e.titulo} ${e.agencia} ${e.cat} ${e.rareza}`, q)
      ).map((e) => ({
        entidad: { id: idEntidad("documento", `exp-${e.id}`), tipo: "documento" as const, nombre: e.titulo },
        titulo: e.titulo,
        subtitulo: `ARCHIVO SECRETO · ${e.agencia} · ${e.year} · ${e.rareza}`,
        ruta: `/nucleo?id=${idEntidad("documento", `exp-${e.id}`)}`,
        origen: "fnt:documentos",
      }));
      const oscs: ResultadoNucleo[] = [
        ...TEORIAS.map((x) => ({ id: x.id, titulo: x.titulo, fuente: x.fuente, sala: "TEORÍAS" })),
        ...ARMAS.map((x) => ({ id: x.id, titulo: x.titulo, fuente: x.fuente, sala: "ARMAS" })),
        ...CIVILIZACIONES.map((x) => ({ id: x.id, titulo: x.titulo, fuente: x.fuente, sala: "CIVILIZACIONES" })),
        ...DOCS.map((x) => ({ id: x.id, titulo: x.titulo, fuente: x.fuente, sala: "DOCUMENTOS" })),
      ]
        .filter((x) => incluye(`${x.titulo} ${x.fuente}`, q))
        .map((x) => ({
          entidad: { id: idEntidad("documento", `osc-${x.id}`), tipo: "documento" as const, nombre: x.titulo },
          titulo: x.titulo,
          subtitulo: `ALEJANDRÍA OSCURA · ${x.sala} · ${x.fuente}`,
          ruta: `/nucleo?id=${idEntidad("documento", `osc-${x.id}`)}`,
          origen: "fnt:documentos",
        }));
      return [...exps, ...oscs].slice(0, limite);
    },
  },
  // 7. ANÁLISIS — la verdad cruda (verificaciones de la comunidad)
  {
    fuente: fuentePublica("fnt:verificaciones"),
    async buscar(q, limite) {
      const rows = await db.newsVerify.findMany({
        where: { headline: { contains: q } },
        orderBy: { createdAt: "desc" },
        take: limite,
        select: { id: true, headline: true, source: true, truth: true, resolved: true },
      });
      return rows.map((v) => ({
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
      const rows = await db.audioComandante.findMany({
        where: { OR: [{ titulo: { contains: q } }, { autor: { contains: q } }] },
        orderBy: { createdAt: "desc" },
        take: limite,
        select: { id: true, autor: true, titulo: true, duracion: true, createdAt: true },
      });
      return rows.map((a) => ({
        entidad: { id: idEntidad("documento", `aud-${a.id}`), tipo: "documento" as const, nombre: a.titulo },
        titulo: a.titulo,
        subtitulo: `EMISORA · audio de ${a.autor} · ${a.duracion}s`,
        ruta: `/nucleo?id=${idEntidad("documento", `aud-${a.id}`)}`,
        fecha: a.createdAt.toISOString(),
        origen: "fnt:audios",
      }));
    },
  },
  // 9. MEDIOS — quién firma las noticias (fuentes reales del archivo)
  {
    fuente: fuentePublica("fnt:fuentes"),
    async buscar(q, limite) {
      const rows = await db.newsItem.findMany({
        where: { source: { contains: q } },
        distinct: ["source"],
        select: { source: true },
        take: limite,
      });
      return rows.map((r) => {
        const slug = slugMedio(r.source);
        return {
          entidad: { id: idEntidad("fuente", `med-${slug}`), tipo: "fuente" as const, nombre: r.source },
          titulo: r.source,
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
  limite = 24
): Promise<RespuestaBusquedaNucleo> {
  const q = sanitizarLinea(qRaw, 64);
  const norm = normalizar(q);
  const generado = new Date().toISOString();

  if (norm.length < 2) {
    return {
      ok: false,
      q,
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

  const resultados: ResultadoNucleo[] = [];
  for (const origen of ORDEN_ORIGEN) {
    for (const r of porOrigen.get(origen) ?? []) {
      if (resultados.length >= limite) break;
      resultados.push(r);
    }
  }

  return { ok: true, q, resultados, fuentes: asientos, generado };
}

/** Para el mapa de entidades de /nucleo: qué proveedores hay por fuente. */
export function proveedoresDelNucleo(): { fuente: FuenteNucleo; listo: boolean }[] {
  return FUENTES_PUBLICAS.map((f) => ({
    fuente: f,
    listo: PROVEEDORES.some((p) => p.fuente.id === f.id),
  }));
}
