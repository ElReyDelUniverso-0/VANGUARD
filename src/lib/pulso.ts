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
  const rows = await db.newsItem.findMany({
    where: { externalId: { not: { startsWith: "curated-" } } },
    orderBy: { publishedAt: "desc" },
    take: 60,
  });

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

  // contadores del medidor (2 counts + 1 groupBy — baratos con índice v209)
  const desde24h = new Date(Date.now() - 24 * 3600_000);
  const desde1h = new Date(Date.now() - 3600_000);
  const [hoy, ultimaHora, porTeatro] = await Promise.all([
    db.newsItem.count({
      where: { publishedAt: { gte: desde24h }, externalId: { not: { startsWith: "curated-" } } },
    }),
    db.newsItem.count({
      where: { publishedAt: { gte: desde1h }, externalId: { not: { startsWith: "curated-" } } },
    }),
    db.newsItem.groupBy({
      by: ["conflictTag"],
      where: { publishedAt: { gte: desde24h }, conflictTag: { not: null } },
      _count: { conflictTag: true },
    }),
  ]);

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
      teatros: porTeatro.length,
      paises: paises.size,
      frescoMin: ricos.length ? ricos[0].edadMin : null,
      generado: new Date().toISOString(),
    },
  };
}

// ============================================================
// v402.2 EL LATIDO DEL ARCHIVO — la serie que el gráfico de líneas dibuja
//
// El Dueño pidió «series temporales» (cables por día). Aquí está la fuente
// de esa serie, y está donde debe estar: al lado de la instantánea, con la
// misma regla de exactitud — SOLO cables reales (las piezas «curated-» de
// respaldo quedan fuera, igual que en la sala).
//
// La ventana se calcula, no se escribe: desde el inicio del día de hace
// N-1 días hasta ahora, un cubo por día. Un día sin cables reales se
// declara con 0 — el gráfico enseña el hueco en vez de taparlo.
// ============================================================

export interface DiaDeSerie {
  /** ISO corto (AAAA-MM-DD) del día del cubo */
  fecha: string;
  /** etiqueta ya formateada en español («14 nov») */
  etiqueta: string;
  /** cables reales publicados ese día */
  valor: number;
}

export interface SerieDias {
  dias: DiaDeSerie[];
  total: number;
  pico: number;
  /** fecha ISO del día con más cables del tramo */
  picoFecha: string;
  /** primer día del tramo (ISO corto) */
  desde: string;
}

export async function serieCablesPorDia(dias = 14): Promise<SerieDias> {
  const hoy = new Date();
  const inicio = new Date(hoy);
  inicio.setUTCHours(0, 0, 0, 0);
  inicio.setUTCDate(inicio.getUTCDate() - (dias - 1));

  const filas = await db.newsItem.findMany({
    where: {
      publishedAt: { gte: inicio },
      externalId: { not: { startsWith: "curated-" } },
    },
    select: { publishedAt: true },
  });

  const cubos = new Map<string, number>();
  for (const f of filas) {
    const clave = f.publishedAt.toISOString().slice(0, 10);
    cubos.set(clave, (cubos.get(clave) ?? 0) + 1);
  }

  const tramo: DiaDeSerie[] = [];
  for (let i = 0; i < dias; i++) {
    const d = new Date(inicio);
    d.setUTCDate(inicio.getUTCDate() + i);
    const clave = d.toISOString().slice(0, 10);
    tramo.push({
      fecha: clave,
      etiqueta: d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", timeZone: "UTC" }),
      valor: cubos.get(clave) ?? 0,
    });
  }

  const valores = tramo.map((d) => d.valor);
  const pico = valores.length ? Math.max(...valores) : 0;
  const picoFecha = tramo[valores.indexOf(pico)]?.fecha ?? tramo[0]?.fecha ?? "";

  return {
    dias: tramo,
    total: valores.reduce((a, b) => a + b, 0),
    pico,
    picoFecha,
    desde: tramo[0]?.fecha ?? "",
  };
}
