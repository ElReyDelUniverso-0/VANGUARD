// ════════════════════════════════════════════════════════════════
// v213.0 EL PULSO — LA INSTANTÁNEA DE ÚLTIMA HORA
// Mandato del Dueño: «Vanguard se vuelve más exacto, es EL PRIMERO
// en dar noticias — importantes y de morbo —, te lo dice TODO sin
// salir de Vanguard, con el mapa 3D y el Ojo de Dios llenos de
// información, todo EN VIVO, EN DIRECTO».
//
// Una sola instantánea server alimenta las tres puertas del pulso:
//   · /en-vivo            → LA SALA DE ÚLTIMA HORA (página server + polling)
//   · /api/pulso          → el latido JSON (el cliente sondea cada 30 s)
//   · OJO DE DIOS         → la franja «EL PULSO · ÚLTIMA HORA» (pulso-ojo.tsx)
//
// EXACTITUD por decreto:
//   · SOLO cables REALES (externalId real de un medio; las piezas
//     «curated-» de respaldo quedan FUERA — la sala nunca miente).
//   · Cada cable sale con el sello del motor de impacto v172
//     (impacto 0-100, tier, edad) + credibilidad de la fuente.
// ════════════════════════════════════════════════════════════════

import { db } from "@/lib/db";
import { enriquecerLista, type NoticiaRanqueada } from "@/lib/impacto";
import { obtenerNotas } from "@/lib/portada/notas";
import { conflictoPorKey } from "@/lib/portada/clasificar";

// v402.0 — EL PULSO DE VERDAD: la sala «En vivo» leía la base, que en producción
// viaja de solo lectura (congelada en el último build: cables de hace dos
// semanas bajo un letrero de «EN VIVO»). Ahora manda la red viva — los mismos
// medios de la portada — y la base queda de respaldo si la red cae.
const PAIS_MEDIO: Record<string, string> = {
  "BBC Mundo": "gb", "France 24": "fr", "El Mundo": "es", "El País": "es", "ABC": "es",
  "La Vanguardia": "es", "Europa Press": "es", "20minutos": "es", DW: "de", "ONU Noticias": "un",
};

type FilaPulso = {
  id: string; title: string; url: string; source: string; imageUrl: string | null;
  publishedAt: Date; tacticalTag: string | null; conflictTag: string | null;
  sourceCountry: string | null; summary: string | null;
};

async function filasVivas(): Promise<FilaPulso[]> {
  const notas = await obtenerNotas().catch(() => []);
  return notas.map((n) => ({
    id: n.id,
    title: n.titulo,
    url: n.url,
    source: n.fuente,
    imageUrl: n.imagen,
    publishedAt: new Date(n.fecha),
    tacticalTag: null,
    conflictTag: conflictoPorKey(n.conflicto)?.teatro ?? null,
    sourceCountry: PAIS_MEDIO[n.fuente] ?? null,
    summary: n.resumen || null,
  }));
}

// el sello de la fuente — la credibilidad que ya usa la casa (v172)
export function nivelFuente(cred: number): string {
  if (cred >= 9) return "AGENCIA A++";
  if (cred >= 8) return "AGENCIA A+";
  if (cred >= 6) return "MEDIO A";
  if (cred >= 5) return "MEDIO B";
  return "FUENTE C";
}

export interface StatsPulso {
  hoy: number;          // cables reales de las últimas 24 h
  ultimaHora: number;   // cables reales de los últimos 60 min
  urgente: number;      // tier URGENTE + CRÍTICO en la muestra
  teatros: number;      // teatros de guerra vivos hoy
  paises: number;       // países distintos en la muestra
  frescoMin: number | null; // edad del cable más nuevo (null si no hay)
  generado: string;     // ISO de la instantánea
}

export interface InstantaneaPulso {
  items: NoticiaRanqueada[];      // los más nuevos primero (muestra 60)
  calientes: NoticiaRanqueada[];  // LO MÁS CALIENTE: top impacto de la muestra
  stats: StatsPulso;
}

export async function instantaneaPulso(): Promise<InstantaneaPulso> {
  // LA EXACTITUD EMPIEZA AQUÍ: solo cables con origen real.
  // Las «curadas» de respaldo (externalId curated-*) jamás pasan por
  // la sala de última hora — ahí no hay relleno, hay noticia.
  const vivas = (await filasVivas()).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  const rows: FilaPulso[] = vivas.length
    ? vivas.slice(0, 60)
    : await db.newsItem
        .findMany({
          where: { externalId: { not: { startsWith: "curated-" } } },
          orderBy: { publishedAt: "desc" },
          take: 60,
        })
        .catch(() => []);

  const ricos = enriquecerLista(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      source: r.source,
      imageUrl: r.imageUrl,
      publishedAt: r.publishedAt,
      tacticalTag: r.tacticalTag,
      conflictTag: r.conflictTag,
      sourceCountry: r.sourceCountry,
      summary: r.summary,
    }))
  );

  // LO MÁS CALIENTE (el morbo con regla): mayor impacto, desempate el más fresco
  const calientes = [...ricos]
    .sort((a, b) => b.impacto - a.impacto || a.edadMin - b.edadMin)
    .slice(0, 8);

  // contadores del medidor: se cuentan sobre la MISMA fuente que se muestra
  const ahora = Date.now();
  const base = vivas.length ? vivas : rows;
  const hoy = base.filter((r) => ahora - r.publishedAt.getTime() <= 24 * 3600_000).length;
  const ultimaHora = base.filter((r) => ahora - r.publishedAt.getTime() <= 3600_000).length;
  const porTeatro = new Set(
    base.filter((r) => r.conflictTag && ahora - r.publishedAt.getTime() <= 24 * 3600_000).map((r) => r.conflictTag)
  );

  const paises = new Set<string>();
  let urgente = 0;
  for (const r of ricos) {
    if (r.sourceCountry) paises.add(r.sourceCountry.toUpperCase());
    if (r.tier === "urgente" || r.tier === "critico") urgente++;
  }

  return {
    items: ricos,
    calientes,
    stats: {
      hoy,
      ultimaHora,
      urgente,
      teatros: porTeatro.size,
      paises: paises.size,
      frescoMin: ricos.length ? ricos[0].edadMin : null,
      generado: new Date().toISOString(),
    },
  };
}

// v402.0 — UNA sola forma de cable para la página y para /api/pulso: antes el
// sondeo devolvía filas crudas (title/source) y la sala leía t/f → a los 30 s
// los titulares se quedaban en blanco.
export function aCableVivo(r: NoticiaRanqueada) {
  return {
    id: r.id,
    t: r.title,
    f: r.source,
    u: r.url ?? "",
    fecha: typeof r.publishedAt === "string" ? r.publishedAt : new Date(r.publishedAt).toISOString(),
    impacto: r.impacto,
    tier: r.tier,
    cred: r.cred,
    tag: (r.tacticalTag || "INFO").toUpperCase(),
    conflicto: r.conflictTag || "",
    pais: r.sourceCountry || "",
    paisNombre: r.paisNombre || "",
    s: r.resumen || "",
    img: r.imageUrl && /^https?:\/\//.test(r.imageUrl) ? r.imageUrl : "",
  };
}
