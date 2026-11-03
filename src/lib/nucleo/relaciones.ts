// ============================================================
// v218.0 EL NÚCLEO — RELACIONES EXPLÍCITAS Y ENLACES CONTEXTUALES
// El tejido que conecta las páginas de Vanguard entre sí:
//   · RELACION_PAIS_TEATRO — qué países participan en qué teatro
//     (geografía real de los 9 frentes, no opinión).
//   · enlacesDeRegion / enlacesDePais / enlacesDeCable — puros y
//     sin BD: los montan las páginas server (conflicto, noticia).
//   · fichaEntidad(id) — la ficha completa de cualquier entidad
//     vg:… : metadatos reales, enlaces y cables relacionados de
//     la BD. La sirven /nucleo?id=… y /api/nucleo/entidad.
// TODO enlace apunta a una ruta que EXISTE; nada de páginas
// fantasma ni datos inventados (ley de la casa).
// ============================================================

import { db } from "@/lib/db";
import { TEATROS } from "@/lib/teatros";
import { PAISES_ATLAS } from "@/lib/atlas-data";
import { EXPEDIENTES } from "@/lib/expedientes-datos";
import { TEORIAS, ARMAS, CIVILIZACIONES, DOCS } from "@/lib/oscura-data";
import { MODULOS_NUCLEO, moduloPorId, type ModuloNucleo } from "./registro";
import {
  slugAcontecimientoDeTeatro,
  idAcontecimiento,
  acontecimientoPorSlug,
  cronologiaDeAcontecimiento,
} from "./acontecimientos";
import {
  idEntidad,
  partesDeId,
  type EnlaceContextual,
  type EntidadRef,
} from "./tipos";

// ── GEOGRAFÍA REAL: países → teatro (partes directas del frente) ──
export const RELACION_PAIS_TEATRO: Record<string, string[]> = {
  ukraine: ["ua", "ru"],
  gaza: ["il", "ps"],
  lebanon: ["lb"],
  hormuz: ["ir"],
  taiwan: ["tw", "cn"],
  sahel: ["ml", "ne", "bf"],
  redsea: ["ye"],
  korea: ["kp", "kr"],
  sudan: ["sd"],
};

function teatroDePais(iso: string): string | null {
  for (const [slug, paises] of Object.entries(RELACION_PAIS_TEATRO)) {
    if (paises.includes(iso)) return slug;
  }
  return null;
}

function paisesDeTeatro(slug: string): string[] {
  return RELACION_PAIS_TEATRO[slug] ?? [];
}

function nombrePais(iso: string): string {
  return PAISES_ATLAS.find((p) => p.id === iso)?.nombre ?? iso.toUpperCase();
}

// ── ENLACES PUROS (sin BD) — para páginas server ────────────

/** Enlaces contextuales de un teatro de guerra. */
export function enlacesDeRegion(slug: string): EnlaceContextual[] {
  const t = TEATROS[slug];
  if (!t) return [];
  const enlaces: EnlaceContextual[] = [];
  const slugAcon = slugAcontecimientoDeTeatro(slug);
  if (slugAcon) {
    enlaces.push({
      etiqueta: "EL ACONTECIMIENTO ▸",
      ruta: `/nucleo?id=${idAcontecimiento(slugAcon)}`,
      motivo: "El hecho real que reúne todos los cables de este frente",
      tipoRelacion: "pertenece_a",
    });
  }
  enlaces.push(
    {
      etiqueta: "LA FICHA DEL FRENTE ▸",
      ruta: `/conflicto/${slug}`,
      motivo: `Página propia del teatro ${t.nombre} con sus cables reales`,
      tipoRelacion: "pertenece_a",
    },
    {
      etiqueta: "VER EN EL MUNDO 3D ▸",
      ruta: `/mundo?teatro=${slug}`,
      motivo: "El teatro encendido en el globo con su tensión del día",
      tipoRelacion: "visible_en",
    },
    {
      etiqueta: "ÚLTIMA HORA ▸",
      ruta: "/en-vivo",
      motivo: "La redacción abierta 24 h muestra los cables más frescos",
      tipoRelacion: "pertenece_a",
    },
    {
      etiqueta: "EL SIMULADOR ▸",
      ruta: "/ver-guerra",
      motivo: "Vivir el frente en 3D con unidades y territorios",
      tipoRelacion: "simulado_en",
    },
    {
      etiqueta: "EL PARTE HABLADO ▸",
      ruta: "/audios",
      motivo: "La emisora explica este teatro con datos reales",
      tipoRelacion: "analizado_en",
    },
  );
  for (const iso of paisesDeTeatro(slug).slice(0, 3)) {
    enlaces.push({
      etiqueta: `FICHA DE ${nombrePais(iso).toUpperCase()} ▸`,
      ruta: `/nucleo?id=${idEntidad("pais", iso)}`,
      motivo: "País parte directa de este frente",
      tipoRelacion: "implica_pais",
    });
  }
  return enlaces;
}

/** Enlaces contextuales de un país (ISO-2). */
export function enlacesDePais(iso: string): EnlaceContextual[] {
  const nombre = nombrePais(iso);
  const enlaces: EnlaceContextual[] = [];
  const teatro = teatroDePais(iso);
  if (teatro) {
    enlaces.push(
      {
        etiqueta: `EL TEATRO ${TEATROS[teatro].nombre.toUpperCase()} ▸`,
        ruta: `/conflicto/${teatro}`,
        motivo: `${nombre} es parte directa de este frente`,
        tipoRelacion: "pertenece_a",
      },
      {
        etiqueta: "VER EN EL MUNDO 3D ▸",
        ruta: `/mundo?teatro=${teatro}`,
        motivo: "Dónde arde el frente en el globo",
        tipoRelacion: "visible_en",
      }
    );
  }
  enlaces.push(
    {
      etiqueta: "ÚLTIMA HORA ▸",
      ruta: "/en-vivo",
      motivo: "La última hora del planeta, minuto a minuto",
      tipoRelacion: "pertenece_a",
    },
    {
      etiqueta: "GUERRA HOY ▸",
      ruta: "/guerra-hoy",
      motivo: "El planeta vigilado con el Ojo de Dios",
      tipoRelacion: "visible_en",
    },
    {
      etiqueta: `BUSCAR «${nombre}» ▸`,
      ruta: `/nucleo?q=${encodeURIComponent(nombre)}`,
      motivo: "Todos sus cables en el archivo",
      tipoRelacion: "fuente_de",
    }
  );
  return enlaces;
}

/** Enlaces contextuales de un cable (puro — la página /noticia lo monta). */
export function enlacesDeCable(cable: {
  id: string;
  conflictTag: string | null;
  source: string;
}): EnlaceContextual[] {
  const enlaces: EnlaceContextual[] = [];
  const slugAcon = slugAcontecimientoDeTeatro(cable.conflictTag);
  if (slugAcon) {
    enlaces.push({
      etiqueta: "PARTE DE: EL ACONTECIMIENTO ▸",
      ruta: `/nucleo?id=${idAcontecimiento(slugAcon)}`,
      motivo: "Este cable pertenece a un hecho mayor que reúne varias noticias",
      tipoRelacion: "pertenece_a",
    });
  }
  if (cable.conflictTag && TEATROS[cable.conflictTag]) {
    enlaces.push(
      {
        etiqueta: `EL TEATRO ${TEATROS[cable.conflictTag].nombre.toUpperCase()} ▸`,
        ruta: `/conflicto/${cable.conflictTag}`,
        motivo: "Este cable pertenece al frente",
        tipoRelacion: "pertenece_a",
      },
      {
        etiqueta: "VER EN EL MUNDO 3D ▸",
        ruta: `/mundo?teatro=${cable.conflictTag}`,
        motivo: "Dónde arde este frente en el globo",
        tipoRelacion: "visible_en",
      }
    );
  }
  enlaces.push(
    {
      etiqueta: "LA SALA EN VIVO ▸",
      ruta: "/en-vivo",
      motivo: "La redacción abierta 24 h con la última hora",
      tipoRelacion: "pertenece_a",
    },
    {
      etiqueta: "LA EMISORA ▸",
      ruta: "/audios",
      motivo: "El parte hablado que explica la guerra",
      tipoRelacion: "analizado_en",
    }
  );
  return enlaces;
}

/** Enlaces contextuales de un módulo: a dónde conecta el censo. */
export function enlacesDeModulo(mod: ModuloNucleo): EnlaceContextual[] {
  const enlaces: EnlaceContextual[] = [
    {
      etiqueta: `ENTRAR A ${mod.nombre} ▸`,
      ruta: mod.ruta,
      motivo: "La puerta real del módulo",
      tipoRelacion: "modulo_de",
    },
  ];
  for (const dep of mod.dependencias) {
    if (dep.startsWith("mod:")) {
      const m = moduloPorId(dep);
      if (m) {
        enlaces.push({
          etiqueta: `${m.nombre} ▸`,
          ruta: m.ruta,
          motivo: `${mod.nombre} vive de este módulo`,
          tipoRelacion: "modulo_de",
        });
      }
    }
  }
  return enlaces.slice(0, 6);
}

// ── LA FICHA DE ENTIDAD (server, con BD) ────────────────────

export interface CableRelacionado {
  titulo: string;
  ruta: string;
  fecha: string;
  fuente: string;
}

export interface FichaEntidad {
  ok: boolean;
  error?: string;
  entidad?: EntidadRef;
  descripcion?: string;
  meta?: { k: string; v: string }[];
  enlaces?: EnlaceContextual[];
  cables?: CableRelacionado[]; // cables REALES relacionados (≤3)
  modulo?: ModuloNucleo; // si la entidad es la cara de un módulo
  vive?: string; // dónde vive de verdad (transparencia)
  total?: number; // conteo real asociado (cables, etc.)
}

/** Cables reales recientes por filtros — helper interno con fallo honesto. */
async function cablesRecientes(
  where: Record<string, unknown>,
  excluirId?: string
): Promise<{ lista: CableRelacionado[]; total: number }> {
  try {
    const [rows, total] = await Promise.all([
      db.newsItem.findMany({
        where: { ...where, ...(excluirId ? { id: { not: excluirId } } : {}) },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: { id: true, title: true, source: true, publishedAt: true },
      }),
      db.newsItem.count({ where }),
    ]);
    return {
      lista: rows.map((n) => ({
        titulo: n.title,
        ruta: `/noticia/${n.id}`,
        fecha: n.publishedAt.toISOString(),
        fuente: n.source,
      })),
      total,
    };
  } catch {
    return { lista: [], total: 0 };
  }
}

/** La ficha completa de cualquier entidad del ecosistema. */
export async function fichaEntidad(idRaw: string): Promise<FichaEntidad> {
  const partes = partesDeId(idRaw);
  if (!partes) return { ok: false, error: "Id de entidad inválido — fórmula: vg:<tipo>:<clave>" };
  const { tipo, clave } = partes;

  // ── PAÍS ──
  if (tipo === "pais") {
    const p = PAISES_ATLAS.find((x) => x.id === clave);
    const { lista, total } = await cablesRecientes({ sourceCountry: clave });
    if (!p && total === 0) {
      return { ok: false, error: `País sin ficha ni cables en el archivo: ${clave.toUpperCase()}` };
    }
    return {
      ok: true,
      entidad: { id: idEntidad("pais", clave), tipo, nombre: p?.nombre ?? clave.toUpperCase() },
      descripcion:
        p?.dato ??
        `País registrado por los cables de su prensa en el archivo de Vanguard (${total} piezas).`,
      meta: p
        ? [
            { k: "Capital", v: p.capital },
            { k: "Líder", v: p.lider },
            { k: "Gobierno", v: p.gobierno },
            { k: "Región", v: p.region },
            { k: "Cables en archivo", v: String(total) },
          ]
        : [{ k: "Código ISO", v: clave.toUpperCase() }, { k: "Cables en archivo", v: String(total) }],
      enlaces: enlacesDePais(clave),
      cables: lista,
      vive: p ? "Atlas de naciones (fnt:atlas)" : "Archivo de cables (fnt:cables)",
    };
  }

  // ── REGIÓN / TEATRO ──
  if (tipo === "region") {
    const t = TEATROS[clave];
    if (!t) return { ok: false, error: `Teatro desconocido: ${clave}` };
    const { lista, total } = await cablesRecientes({ conflictTag: clave });
    return {
      ok: true,
      entidad: { id: idEntidad("region", clave), tipo, nombre: t.nombre },
      descripcion: t.resumen,
      meta: [
        { k: "Cables en archivo", v: String(total) },
        { k: "Países del frente", v: paisesDeTeatro(clave).map(nombrePais).join(", ") || "—" },
      ],
      enlaces: enlacesDeRegion(clave),
      cables: lista,
      vive: "Catálogo de teatros (fnt:teatros)",
      total,
    };
  }

  // ── ACONTECIMIENTO (el hecho real que reúne varias noticias) ──
  if (tipo === "acontecimiento") {
    try {
      const a = await acontecimientoPorSlug(clave);
      if (!a) return { ok: false, error: `Acontecimiento no registrado: ${clave}` };
      const cron = await cronologiaDeAcontecimiento(a);
      const enlaces: EnlaceContextual[] = [];
      if (a.teatroTag && TEATROS[a.teatroTag]) {
        enlaces.push(
          {
            etiqueta: `EL TEATRO ${TEATROS[a.teatroTag].nombre.toUpperCase()} ▸`,
            ruta: `/conflicto/${a.teatroTag}`,
            motivo: "El frente donde vive este hecho, con sus cables en vivo",
            tipoRelacion: "pertenece_a",
          },
          {
            etiqueta: "VER EN EL MUNDO 3D ▸",
            ruta: `/mundo?teatro=${a.teatroTag}`,
            motivo: "Dónde arde este hecho en el globo",
            tipoRelacion: "visible_en",
          }
        );
      }
      for (const iso of a.paisCodes.slice(0, 3)) {
        enlaces.push({
          etiqueta: `FICHA DE ${nombrePais(iso).toUpperCase()} ▸`,
          ruta: `/nucleo?id=${idEntidad("pais", iso)}`,
          motivo: "País implicado en este acontecimiento",
          tipoRelacion: "implica_pais",
        });
      }
      enlaces.push({
        etiqueta: "ÚLTIMA HORA ▸",
        ruta: "/en-vivo",
        motivo: "La redacción abierta 24 h sigue este hecho minuto a minuto",
        tipoRelacion: "pertenece_a",
      });
      return {
        ok: true,
        entidad: { id: a.id, tipo, nombre: a.titulo },
        descripcion: a.resumen,
        meta: [
          { k: "Estado", v: a.estado.toUpperCase() },
          { k: "El hecho empezó", v: a.ocurridoDesde ? a.ocurridoDesde.slice(0, 10) : "sin fecha precisa" },
          { k: "Noticias en el archivo", v: String(cron.total) },
          { k: "Países implicados", v: a.paisCodes.map(nombrePais).join(", ") || "—" },
          { k: "Precisión temporal", v: a.precisionTemporal ?? "—" },
        ],
        enlaces,
        cables: cron.lista,
        vive: "Registro de acontecimientos (fnt:acontecimientos)",
        total: cron.total,
      };
    } catch {
      return { ok: false, error: "El registro de acontecimientos no responde" };
    }
  }

  // ── NOTICIA / CABLE (una fuente de información del archivo) ──
  if (tipo === "noticia") {
    try {
      const n = await db.newsItem.findUnique({
        where: { id: clave },
        select: {
          id: true,
          title: true,
          summary: true,
          source: true,
          publishedAt: true,
          conflictTag: true,
          sourceCountry: true,
        },
      });
      if (!n) return { ok: false, error: "Cable no encontrado en el archivo" };
      const rel = n.conflictTag
        ? await cablesRecientes({ conflictTag: n.conflictTag }, n.id)
        : { lista: [], total: 0 };
      return {
        ok: true,
        entidad: { id: idEntidad("noticia", n.id), tipo, nombre: n.title },
        descripcion: n.summary || "Cable del archivo sin resumen — entra y lee la pieza completa.",
        meta: [
          { k: "Fuente", v: n.source },
          { k: "Publicada", v: n.publishedAt.toISOString().slice(0, 16).replace("T", " ") },
          ...(n.conflictTag ? [{ k: "Conflicto", v: n.conflictTag.toUpperCase() }] : []),
          ...(n.sourceCountry ? [{ k: "País", v: nombrePais(n.sourceCountry) }] : []),
        ],
        enlaces: enlacesDeCable(n),
        cables: rel.lista,
        vive: "Archivo de cables (fnt:cables)",
      };
    } catch {
      return { ok: false, error: "El archivo de cables no responde" };
    }
  }

  // ── FUENTE (medio) ──
  if (tipo === "fuente") {
    if (!clave.startsWith("med-")) return { ok: false, error: "Fuente desconocida" };
    try {
      const medios = await db.newsItem.findMany({
        distinct: ["source"],
        select: { source: true },
        take: 800,
      });
      const { normalizar } = await import("./tipos");
      const nombre = medios
        .map((m) => m.source)
        .find((s) => normalizar(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) === clave.slice(4));
      if (!nombre) return { ok: false, error: "Medio no encontrado en el archivo" };
      const { lista, total } = await cablesRecientes({ source: nombre });
      return {
        ok: true,
        entidad: { id: idEntidad("fuente", clave), tipo, nombre },
        descripcion: `Medio real que firma cables del archivo de Vanguard (${total} piezas con su sello).`,
        meta: [{ k: "Cables en archivo", v: String(total) }],
        enlaces: [
          {
            etiqueta: `BUSCAR «${nombre}» ▸`,
            ruta: `/nucleo?q=${encodeURIComponent(nombre)}`,
            motivo: "Todos sus cables en la búsqueda global",
            tipoRelacion: "fuente_de",
          },
          {
            etiqueta: "LA SALA EN VIVO ▸",
            ruta: "/en-vivo",
            motivo: "La última hora con el sello de credibilidad de cada fuente",
            tipoRelacion: "pertenece_a",
          },
        ],
        cables: lista,
        vive: "Archivo de cables · campo source (fnt:fuentes)",
        total,
      };
    } catch {
      return { ok: false, error: "El archivo de cables no responde" };
    }
  }

  // ── DOCUMENTO (exp- | osc- | aud-) ──
  if (tipo === "documento") {
    if (clave.startsWith("exp-")) {
      const e = EXPEDIENTES.find((x) => x.id === clave.slice(4));
      if (!e) return { ok: false, error: "Expediente no encontrado" };
      return {
        ok: true,
        entidad: { id: idEntidad("documento", clave), tipo, nombre: e.titulo },
        descripcion: `Expediente del ARCHIVO SECRETO de Vanguard, firmado por ${e.agencia}.`,
        meta: [
          { k: "Agencia", v: e.agencia },
          { k: "Año", v: String(e.year) },
          { k: "Rareza", v: e.rareza },
          { k: "Categoría", v: e.cat },
        ],
        enlaces: [
          {
            etiqueta: "ABRIR EL ARCHIVO SECRETO ▸",
            ruta: "/",
            motivo: "El expediente se lee en la Casa SPA · sección EXPEDIENTES",
            tipoRelacion: "documenta",
          },
        ],
        vive: "Catálogo editorial (fnt:documentos)",
      };
    }
    if (clave.startsWith("osc-")) {
      const c = clave.slice(4);
      const x =
        TEORIAS.find((t) => t.id === c) ??
        ARMAS.find((a) => a.id === c) ??
        CIVILIZACIONES.find((s) => s.id === c) ??
        DOCS.find((d) => d.id === c);
      if (!x) return { ok: false, error: "Documento de la oscura no encontrado" };
      return {
        ok: true,
        entidad: { id: idEntidad("documento", clave), tipo, nombre: x.titulo },
        descripcion: `Pieza de ALEJANDRÍA OSCURA · fuente: ${x.fuente}.`,
        meta: [{ k: "Fuente declarada", v: x.fuente }],
        enlaces: [
          {
            etiqueta: "ENTRAR A LA ALEJANDRÍA OSCURA ▸",
            ruta: "/",
            motivo: "La pieza se lee en la Casa SPA · sección OSCURA",
            tipoRelacion: "documenta",
          },
        ],
        vive: "Catálogo editorial (fnt:documentos)",
      };
    }
    if (clave.startsWith("aud-")) {
      try {
        const a = await db.audioComandante.findUnique({ where: { id: clave.slice(4) } });
        if (!a) return { ok: false, error: "Audio no encontrado en el muro" };
        return {
          ok: true,
          entidad: { id: idEntidad("documento", clave), tipo, nombre: a.titulo },
          descripcion: `Audio mandado a Vanguard por ${a.autor} desde la emisora de la casa.`,
          meta: [
            { k: "Autor", v: a.autor },
            { k: "Duración", v: `${a.duracion}s` },
            { k: "Recibido", v: a.createdAt.toISOString().slice(0, 16).replace("T", " ") },
          ],
          enlaces: [
            {
              etiqueta: "ESCUCHAR EL AUDIO ▸",
              ruta: `/api/media/${a.mediaId}`,
              motivo: "Los bytes del audio, servidos por la casa",
              tipoRelacion: "fuente_de",
            },
            {
              etiqueta: "LA EMISORA ▸",
              ruta: "/audios",
              motivo: "El muro donde vive con el resto de audios",
              tipoRelacion: "pertenece_a",
            },
          ],
          vive: "Muro de la emisora (fnt:audios)",
        };
      } catch {
        return { ok: false, error: "El muro de audios no responde" };
      }
    }
    return { ok: false, error: "Documento desconocido" };
  }

  // ── ANÁLISIS (verdad cruda) ──
  if (tipo === "analisis") {
    try {
      const v = await db.newsVerify.findUnique({ where: { id: clave } });
      if (!v) return { ok: false, error: "Análisis no encontrado" };
      return {
        ok: true,
        entidad: { id: idEntidad("analisis", v.id), tipo, nombre: v.headline },
        descripcion: `Titular puesto a prueba en LA VERDAD CRUDA: la comunidad vota si es real, falsa o dudosa.`,
        meta: [
          { k: "Fuente", v: v.source },
          { k: "Veredicto", v: v.resolved ? v.truth || "sin resolver" : "en votación" },
        ],
        enlaces: [
          {
            etiqueta: "ENTRAR A LA VERDAD CRUDA ▸",
            ruta: "/",
            motivo: "El análisis se debate en la Casa SPA",
            tipoRelacion: "analizado_en",
          },
          {
            etiqueta: "LA SALA EN VIVO ▸",
            ruta: "/en-vivo",
            motivo: "Compara con la última hora real",
            tipoRelacion: "pertenece_a",
          },
        ],
        vive: "La verdad cruda (fnt:verificaciones)",
      };
    } catch {
      return { ok: false, error: "La verdad cruda no responde" };
    }
  }

  // ── MAPA / SIMULACIÓN (la cara de un módulo) ──
  if (tipo === "mapa" || tipo === "simulacion") {
    const mod =
      MODULOS_NUCLEO.find((m) => m.idEntidadComo === idRaw) ?? moduloPorId(`mod:${clave}`);
    if (!mod) return { ok: false, error: `Módulo no registrado: ${clave}` };
    return {
      ok: true,
      entidad: { id: idEntidad(tipo, clave), tipo, nombre: mod.nombre },
      descripcion: mod.descripcion,
      meta: [
        { k: "Categoría", v: mod.categoria },
        { k: "Estado", v: mod.estado },
        { k: "Permiso", v: mod.permiso },
        { k: "Ruta", v: mod.ruta },
      ],
      enlaces: enlacesDeModulo(mod),
      modulo: mod,
      vive: `Censo de módulos (${mod.id})`,
    };
  }

  return { ok: false, error: "Tipo de entidad sin ficha" };
}
