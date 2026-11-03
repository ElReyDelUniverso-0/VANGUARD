// ============================================================
// v219.0 EL HISTORIADOR — EL ESLABÓN NOTICIA ↔ ACONTECIMIENTO
// Una NOTICIA (cable) es una fuente de información; un
// ACONTECIMIENTO reúne varias noticias del mismo hecho.
//
// LEYES QUE CUMPLE (mandato del sistema):
//   · Cero datos ficticios: los 9 acontecimientos sembrados son
//     hechos históricos PÚBLICOS con fecha de inicio conocida,
//     respaldados por su nube real de cables en el archivo.
//   · El momento del HECHO (ocurridoDesde) no se confunde con el
//     momento de PUBLICACIÓN de cada cable (publishedAt).
//   · Cada asociación noticia↔acontecimiento lleva su procedencia
//     (metodo: regla:teatro | manual) y no destruye la atribución
//     original del cable.
//   · Id estable vg:acontecimiento:<slug> — jamás se recicla.
// ============================================================

import { db } from "@/lib/db";
import { normalizar } from "./tipos";

/** Un acontecimiento sembrado: hecho histórico real, no inventado. */
export interface SemillaAcontecimiento {
  slug: string; // clave estable del id vg:acontecimiento:<slug>
  titulo: string;
  resumen: string; // resumen PROPIO de Vanguard
  tipo: "conflicto" | "crisis" | "proceso";
  estado: "activo" | "escalada" | "desescalada" | "cerrado";
  teatroTag: string | null; // slug del teatro con página propia, si existe
  paisCodes: string[]; // ISO-2 de los países implicados (geografía real)
  /** Fecha en que EMPEZÓ el hecho (histórica pública) — UTC. */
  ocurridoDesde: string;
  precisionTemporal: string;
}

/** ── LOS 9 ACONTECIMIENTOS SEMBRADOS ─────────────────────────
 * Uno por teatro de guerra de la casa: son hechos armados REALES
 * y en curso (sus teatros reciben cables 24 h de GDELT + 18 medios).
 * Las fechas son de registro histórico público:
 *   ukraine  → invasión a gran escala 24-02-2022
 *   gaza     → ataque del 7-O y campaña sobre la Franja 07-10-2023
 *   lebanon  → fuego cruzado Israel–Hezbolá desde el 08-10-2023
 *   redsea   → captura del Galaxy Leader por los hutíes 19-11-2023
 *   hormuz   → sabotaje de petroleros frente a Fujairah 12-05-2019
 *   taiwan   → maniobras chinas de cerco tras la visita de Pelosi 04-08-2022
 *   sahel    → golpe en Malí que abre el ciclo de juntas 18-08-2020
 *   korea    → ensayo hipersónico que abre la escalada récord 11-01-2022
 *   sudan    → estallido de la guerra SAF–RSF en Jartum 15-04-2023
 */
export const SEMILLA_ACONTECIMIENTOS: SemillaAcontecimiento[] = [
  {
    slug: "invasion-rusa-de-ucrania",
    titulo: "Invasión rusa de Ucrania",
    resumen:
      "La mayor guerra de Europa desde 1945: Rusia atacó por tierra, mar y aire el 24 de febrero de 2022 y el frente derivó en un desgaste de artillería, drones y misiles largos que alcanza a la energía, el grano y la economía de todo el continente. Vanguard lo vigila cable a cable.",
    tipo: "conflicto",
    estado: "activo",
    teatroTag: "ukraine",
    paisCodes: ["ua", "ru"],
    ocurridoDesde: "2022-02-24",
    precisionTemporal: "Inicio de la invasión a gran escala (24-02-2022); la guerra del Donbás empezó en 2014.",
  },
  {
    slug: "guerra-israel-gaza",
    titulo: "Guerra Israel–Gaza",
    resumen:
      "El ataque de Hamás del 7 de octubre de 2023 y la campaña militar israelí sobre la Franja abrieron la peor crisis humanitaria de la década, con escalada cruzada hacia Líbano, Irán y el Mar Rojo.",
    tipo: "conflicto",
    estado: "activo",
    teatroTag: "gaza",
    paisCodes: ["il", "ps"],
    ocurridoDesde: "2023-10-07",
    precisionTemporal: "Ciclo actual iniciado el 07-10-2023; el conflicto israelí-palestino es anterior.",
  },
  {
    slug: "conflicto-israel-hezbola",
    titulo: "Conflicto Israel–Hezbolá",
    resumen:
      "Desde el 8 de octubre de 2023 Hezbolá e Israel se bombardean en la frontera del sur del Líbano; la escalada de 2024 — buscapersonas, campaña aérea, invasión terrestre y alto el fuego frágil — mantiene el frente abierto.",
    tipo: "conflicto",
    estado: "activo",
    teatroTag: "lebanon",
    paisCodes: ["lb", "il"],
    ocurridoDesde: "2023-10-08",
    precisionTemporal: "Fuego cruzado iniciado el día posterior al ataque del 7-O.",
  },
  {
    slug: "crisis-del-mar-rojo",
    titulo: "Crisis del Mar Rojo",
    resumen:
      "Desde que los hutíes capturaron el buque Galaxy Leader el 19 de noviembre de 2023, el comercio que cruza Babel-Mandeb es objetivo militar: ataques con drones y misiles, respuestas navales multinacionales y rutas alargadas por el Cabo de Buena Esperanza.",
    tipo: "conflicto",
    estado: "activo",
    teatroTag: "redsea",
    paisCodes: ["ye"],
    ocurridoDesde: "2023-11-19",
    precisionTemporal: "Primer apresamiento de un buque comercial de la campaña hutí.",
  },
  {
    slug: "crisis-de-ormuz",
    titulo: "Crisis del Estrecho de Ormuz",
    resumen:
      "Por la garganta que vigila Irán pasa cerca de un quinto del petróleo del mundo: desde 2019, sabotajes de petroleros, interceptaciones de buques, derribos y una guerra de presión naval sin declarar entre Teherán y Washington.",
    tipo: "conflicto",
    estado: "activo",
    teatroTag: "hormuz",
    paisCodes: ["ir"],
    ocurridoDesde: "2019-05-12",
    precisionTemporal: "Ciclo abierto con el sabotaje de cuatro petroleros frente a Fujairah (12-05-2019).",
  },
  {
    slug: "crisis-del-estrecho-de-taiwan",
    titulo: "Crisis del Estrecho de Taiwán",
    resumen:
      "China ejerce presión militar permanente sobre Taiwán desde agosto de 2022: maniobras de cerco, incursiones aéreas diarias y la amenaza de bloqueo sobre la isla que fabrica la mayoría de los chips avanzados del planeta.",
    tipo: "conflicto",
    estado: "activo",
    teatroTag: "taiwan",
    paisCodes: ["tw", "cn"],
    ocurridoDesde: "2022-08-04",
    precisionTemporal: "Maniobras de cerco iniciadas tras la visita de la presidenta de la Cámara EE.UU. (04-08-2022).",
  },
  {
    slug: "juntas-y-yihadismo-en-el-sahel",
    titulo: "Juntas y yihadismo en el Sahel",
    resumen:
      "Una cadena de golpes de Estado — Malí, Burkina Faso, Níger — expulsó a las fuerzas europeas y a la ONU y se apoyó en mercenarios rusos, mientras la violencia yihadista se extiende hacia el golfo de Guinea.",
    tipo: "conflicto",
    estado: "activo",
    teatroTag: "sahel",
    paisCodes: ["ml", "ne", "bf"],
    ocurridoDesde: "2020-08-18",
    precisionTemporal: "Golpe en Malí que abre el ciclo actual de juntas (18-08-2020).",
  },
  {
    slug: "ensayos-de-corea-del-norte",
    titulo: "Escalada de ensayos de Corea del Norte",
    resumen:
      "Kim Jong-un convirtió 2022 en el año récord de lanzamientos de misiles, consagró la doctrina nuclear irrevocable en la constitución y sigue marcando el pulso de la península con cada ensayo.",
    tipo: "conflicto",
    estado: "activo",
    teatroTag: "korea",
    paisCodes: ["kp", "kr"],
    ocurridoDesde: "2022-01-11",
    precisionTemporal: "Ensayo hipersónico que abre la escalada récord de 2022.",
  },
  {
    slug: "guerra-civil-sudanesa",
    titulo: "Guerra civil sudanesa",
    resumen:
      "La guerra entre el ejército del general al-Burhan y los Paramilitares RSF de Hemedti arrasó Jartum en abril de 2023 y provocó la mayor crisis de desplazados del mundo, con frentes en Darfur y Jezira.",
    tipo: "conflicto",
    estado: "activo",
    teatroTag: "sudan",
    paisCodes: ["sd"],
    ocurridoDesde: "2023-04-15",
    precisionTemporal: "Estallido de los combates SAF–RSF en Jartum (15-04-2023).",
  },
];

/** id estable de la semilla: vg:acontecimiento:<slug>. */
export function idAcontecimiento(slug: string): string {
  return `vg:acontecimiento:${slug}`;
}

/** Mapa teatro → slug del acontecimiento sembrado (puro, sin BD). */
export const ACONTECIMIENTO_POR_TEATRO: Record<string, string> = Object.fromEntries(
  SEMILLA_ACONTECIMIENTOS.filter((s) => s.teatroTag).map((s) => [s.teatroTag as string, s.slug])
);

/** Slug del acontecimiento de un teatro, si está sembrado. */
export function slugAcontecimientoDeTeatro(tag: string | null | undefined): string | null {
  if (!tag) return null;
  return ACONTECIMIENTO_POR_TEATRO[tag] ?? null;
}

/** ── SIEMBRA IDEMPOTENTE (server) ────────────────────────────
 * Crea los 9 acontecimientos si faltan (upsert, no toca los que
 * ya existen) y enlaza con metodo «regla:teatro» TODOS los
 * externalId actuales de cada teatro. Re-runnable sin duplicar:
 * los enlaces ya existentes se conservan, los cables nuevos del
 * sync se añaden. Guarda la procedencia de cada asociación.
 */
export async function sembrarAcontecimientos(): Promise<{
  creados: string[];
  enlacesNuevos: number;
}> {
  const creados: string[] = [];
  let enlacesNuevos = 0;

  for (const s of SEMILLA_ACONTECIMIENTOS) {
    const id = idAcontecimiento(s.slug);
    const antes = await db.acontecimiento.findUnique({ where: { id }, select: { id: true } });
    if (!antes) creados.push(s.slug);

    await db.acontecimiento.upsert({
      where: { id },
      create: {
        id,
        slug: s.slug,
        titulo: s.titulo,
        resumen: s.resumen,
        busca: normalizar(`${s.titulo} ${s.resumen}`),
        tipo: s.tipo,
        estado: s.estado,
        teatroTag: s.teatroTag,
        paisCodes: JSON.stringify(s.paisCodes),
        ocurridoDesde: new Date(`${s.ocurridoDesde}T00:00:00.000Z`),
        precisionTemporal: s.precisionTemporal,
        procedencia:
          `Registro de Vanguard a partir del catálogo de teatros (fnt:teatros) y su nube de cables reales ` +
          `(fnt:cables · GDELT + 18 medios). Fecha de inicio según el registro histórico público.`,
      },
      update: {}, // idempotente: si ya existe, no se toca
    });

    if (s.teatroTag) {
      const externos = await db.newsItem.findMany({
        where: { conflictTag: s.teatroTag },
        select: { externalId: true },
      });
      const yaPuestos = new Set(
        (
          await db.noticiaAcontecimiento.findMany({
            where: { acontecimientoId: id },
            select: { noticiaExternalId: true },
          })
        ).map((e) => e.noticiaExternalId)
      );
      const nuevos = externos
        .map((e) => e.externalId)
        .filter((x) => !yaPuestos.has(x))
        .map((noticiaExternalId) => ({
          acontecimientoId: id,
          noticiaExternalId,
          metodo: "regla:teatro",
        }));
      if (nuevos.length > 0) {
        await db.noticiaAcontecimiento.createMany({ data: nuevos });
        enlacesNuevos += nuevos.length;
      }
    }
  }

  return { creados, enlacesNuevos };
}

/** ── CONSULTAS server para fichas, índice y APIs ───────────── */

export interface AcontecimientoFicha {
  id: string;
  slug: string;
  titulo: string;
  resumen: string;
  tipo: string;
  estado: string;
  teatroTag: string | null;
  paisCodes: string[];
  ocurridoDesde: string | null;
  precisionTemporal: string | null;
  procedencia: string;
  actualizadoEn: string;
}

function parseFila(a: {
  id: string;
  slug: string;
  titulo: string;
  resumen: string;
  tipo: string;
  estado: string;
  teatroTag: string | null;
  paisCodes: string;
  ocurridoDesde: Date | null;
  precisionTemporal: string | null;
  procedencia: string;
  actualizadoEn: Date;
}): AcontecimientoFicha {
  let paises: string[] = [];
  try {
    const parsed = JSON.parse(a.paisCodes);
    if (Array.isArray(parsed)) paises = parsed.filter((x) => typeof x === "string");
  } catch {
    // JSON corrupto: se declara vacío, jamás se inventa
  }
  return {
    id: a.id,
    slug: a.slug,
    titulo: a.titulo,
    resumen: a.resumen,
    tipo: a.tipo,
    estado: a.estado,
    teatroTag: a.teatroTag,
    paisCodes: paises,
    ocurridoDesde: a.ocurridoDesde ? a.ocurridoDesde.toISOString() : null,
    precisionTemporal: a.precisionTemporal,
    procedencia: a.procedencia,
    actualizadoEn: a.actualizadoEn.toISOString(),
  };
}

/** Lista completa de acontecimientos registrados (índice y API). */
export async function listaAcontecimientos(): Promise<AcontecimientoFicha[]> {
  const filas = await db.acontecimiento.findMany({ orderBy: [{ teatroTag: "asc" }, { slug: "asc" }] });
  return filas.map(parseFila);
}

/** Un acontecimiento por slug (la ficha). */
export async function acontecimientoPorSlug(slug: string): Promise<AcontecimientoFicha | null> {
  const a = await db.acontecimiento.findUnique({ where: { slug } });
  return a ? parseFila(a) : null;
}

/** Cronología REAL: cables asociados de la BD, del más nuevo al más viejo.
 * Si el acontecimiento viene de «regla:teatro» consulta por conflictTag
 * (índice [conflictTag, publishedAt]); si no, por los externalId enlazados. */
export async function cronologiaDeAcontecimiento(
  ficha: AcontecimientoFicha,
  take = 8
): Promise<{ lista: { titulo: string; ruta: string; fecha: string; fuente: string }[]; total: number; completa: boolean }> {
  const base = {
    select: { id: true, title: true, source: true, publishedAt: true },
    orderBy: { publishedAt: "desc" as const },
  };
  try {
    if (ficha.teatroTag) {
      const [rows, total] = await Promise.all([
        db.newsItem.findMany({ ...base, where: { conflictTag: ficha.teatroTag }, take }),
        db.newsItem.count({ where: { conflictTag: ficha.teatroTag } }),
      ]);
      return {
        lista: rows.map((n) => ({
          titulo: n.title,
          ruta: `/noticia/${n.id}`,
          fecha: n.publishedAt.toISOString(),
          fuente: n.source,
        })),
        total,
        completa: total <= take,
      };
    }
    const enlaces = await db.noticiaAcontecimiento.findMany({
      where: { acontecimientoId: ficha.id },
      select: { noticiaExternalId: true },
      take: 400,
    });
    const externos = enlaces.map((e) => e.noticiaExternalId);
    if (externos.length === 0) return { lista: [], total: 0, completa: true };
    const rows = await db.newsItem.findMany({
      ...base,
      where: { externalId: { in: externos } },
      take,
    });
    return {
      lista: rows.map((n) => ({
        titulo: n.title,
        ruta: `/noticia/${n.id}`,
        fecha: n.publishedAt.toISOString(),
        fuente: n.source,
      })),
      total: externos.length,
      completa: externos.length <= take,
    };
  } catch {
    return { lista: [], total: 0, completa: false }; // fallo honesto
  }
}
