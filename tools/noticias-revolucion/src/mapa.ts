/** Misión 003 · NOTICIAS EN EL MAPA — marcadores desde notas verificadas.
 *  Sin coordenadas propias en la BD: el marcador vive en el CENTROIDE del país ISO
 *  de la nota (sourceCountry), con un desplazamiento determinista para que varias
 *  notas del mismo país no se solapen. La precisión es "país", y se etiqueta como tal. */
import { deduplicar, type NotaBase } from "./dedupe.js";
import { centroide } from "./paises.js";
import { regionDe } from "./regiones.js";

export interface NotaMapa extends NotaBase {
  id: string;
  conflictTag?: string | null;
  tacticalTag?: string | null;
  sourceCountry?: string | null;
  summary?: string | null;
  fuente?: string;
}

export interface MarcadorMapa {
  id: string;
  titular: string;
  resumen: string | null;
  url: string;
  fuente: string;
  imagen: string | null;
  publicado: string; // ISO
  pais: string | null;
  region: string;
  conflicto: string | null;
  categoria: string | null;
  lat: number;
  lng: number;
  precision: "pais";
  duplicados: number; // cuántas notas de la misma historia conviven aquí
}

function hashDeterminista(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export interface OpcionesMapa {
  ahora?: Date;          // ventana respecto a "ahora" (por defecto 72 h)
  ventanaHoras?: number; // 72 por defecto
  umbralSimilitud?: number; // 0.6
  maxPorPais?: number;   // evita saturar un país con decenas de marcadores
}

export function construirMarcadores(notas: NotaMapa[], opciones: OpcionesMapa = {}): {
  marcadores: MarcadorMapa[];
  sinPais: MarcadorMapa[];
  resumen: { total: number; unicas: number; duplicadas: number; porRegion: Record<string, number>; porCategoria: Record<string, number> };
} {
  const ahora = opciones.ahora ?? new Date();
  const ventana = (opciones.ventanaHoras ?? 72) * 3600_000;
  const recientes = notas.filter((n) => {
    const t = new Date(n.publicado).getTime();
    return Number.isFinite(t) && ahora.getTime() - t <= ventana;
  });
  const dedup = deduplicar(recientes, opciones.umbralSimilitud ?? 0.6);

  const marcadores: MarcadorMapa[] = [];
  const sinPais: MarcadorMapa[] = [];
  const contadorPais = new Map<string, number>();
  const porRegion: Record<string, number> = {};
  const porCategoria: Record<string, number> = {};

  for (const { principal, duplicados } of dedup) {
    const iso = (principal.sourceCountry ?? "").trim().toUpperCase() || null;
    const c = centroide(iso);
    const region = regionDe(iso);
    const categoria = principal.tacticalTag ?? null;
    porRegion[region] = (porRegion[region] ?? 0) + 1;
    if (categoria) porCategoria[categoria] = (porCategoria[categoria] ?? 0) + 1;
    const base = {
      id: principal.id,
      titular: principal.titulo,
      resumen: principal.summary ?? null,
      url: principal.url,
      fuente: principal.fuente ?? "Fuente no declarada",
      imagen: principal.imagen ?? null,
      publicado: new Date(principal.publicado).toISOString(),
      pais: iso,
      region,
      conflicto: principal.conflictTag ?? null,
      categoria,
      precision: "pais" as const,
      duplicados: duplicados.length,
    };
    if (!c) { sinPais.push({ ...base, lat: 0, lng: 0 }); continue; }
    const n = contadorPais.get(iso!) ?? 0;
    contadorPais.set(iso!, n + 1);
    if (opciones.maxPorPais && n >= opciones.maxPorPais) continue;
    // Desplazamiento determinista ≤ 0.6° en espiral áurea para dispersar solapados
    const h = hashDeterminista(principal.id);
    const ang = h * 2.399963229; // ángulo áureo
    const rad = 0.12 + (n % 6) * 0.09;
    marcadores.push({ ...base, lat: c[0] + Math.sin(ang) * rad, lng: c[1] + Math.cos(ang) * rad });
  }

  return {
    marcadores,
    sinPais,
    resumen: { total: notas.length, unicas: dedup.length, duplicadas: recientes.length - dedup.length, porRegion, porCategoria },
  };
}
