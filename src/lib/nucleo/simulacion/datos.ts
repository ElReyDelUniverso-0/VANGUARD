// ============================================================
// v224.0 EL ESTRATEGA — DATOS (separados de SUPUESTOS y REGLAS)
// La recogida de SOLO datos documentados, cada uno con su
// procedencia a la vista:
//   · la FECHA del hecho → semilla v219 (hecho histórico público,
//     fnt:acontecimientos) — el reloj se lee UNA vez aquí y pasa a
//     las reglas como dato, para que las reglas sean deterministas;
//   · los FRENTES → geografiaDeTeatro (v220, salas OSINT de la casa,
//     cero coordenadas inventadas) — un teatro sin sala se declara;
//   · los CABLES → conteo REAL del archivo por conflictTag (BD);
//   · la CAPACIDAD → gasto militar % PIB del Banco Mundial (v223,
//     CC BY 4.0) — media de las naciones del teatro CON dato; si no
//     hay cobertura o red, null y se declara.
// CERO literales numéricos de datos: los números entran solo por
// la BD y la API del Banco Mundial.
// ============================================================

import { db } from "@/lib/db";
import { TEATROS } from "@/lib/teatros";
import { SEMILLA_ACONTECIMIENTOS } from "../acontecimientos";
import { geografiaDeTeatro } from "../geografia";
import { RELACION_PAIS_TEATRO } from "../relaciones";
import { indicadoresNumericosDePais } from "../indicadores";
import type { DatoTeatro } from "./reglas";

/** Los países de un teatro según el eslabón MAPAS (relaciones.ts). */
function paisesDe(slug: string): string[] {
  return RELACION_PAIS_TEATRO[slug] ?? [];
}

/**
 * Recoge los datos de TODOS los teatros de la casa. NUNCA lanza:
 * si la BD no responde los conteos quedan a 0 y se declara en la
 * nota; si el Banco Mundial no responde, capacidad null. Las
 * reglas reciben esto hecho — mismo input, mismo output.
 */
export async function recogerDatos(): Promise<{
  datos: DatoTeatro[];
  notaBd: string | null;
  ahoraIso: string;
}> {
  const ahora = new Date();
  const ahoraIso = ahora.toISOString();

  // ── Fechas documentadas (semilla v219, hecho histórico público) ──
  const inicioPorTeatro = new Map<string, string>();
  for (const a of SEMILLA_ACONTECIMIENTOS) {
    if (a.teatroTag && a.ocurridoDesde) inicioPorTeatro.set(a.teatroTag, a.ocurridoDesde);
  }

  // ── Conteo REAL de cables por teatro (una consulta, la BD viva) ──
  const conteos = new Map<string, number>();
  let notaBd: string | null = null;
  try {
    const filas = await db.newsItem.groupBy({
      by: ["conflictTag"],
      _count: { conflictTag: true },
    });
    for (const f of filas) {
      if (f.conflictTag) conteos.set(f.conflictTag, f._count.conflictTag);
    }
  } catch {
    notaBd = "El archivo de cables no respondió ahora — el factor cobertura quedó a cero (declarado, no fingido).";
  }

  // ── Gasto militar crudo por país (UNA cache compartida del barómetro) ──
  const isoNecesarios = new Set<string>();
  for (const slug of Object.keys(TEATROS)) {
    for (const iso of paisesDe(slug)) isoNecesarios.add(iso);
  }
  const gastoPorIso = new Map<string, { pct: number; anio: number }>();
  await Promise.allSettled(
    [...isoNecesarios].map(async (iso) => {
      const valores = await indicadoresNumericosDePais(iso);
      const militar = valores.find((v) => v.codigo === "MS.MIL.XPND.GD.ZS");
      if (militar) gastoPorIso.set(iso, { pct: militar.valor, anio: militar.anio });
    })
  );

  // ── Ensamblado por teatro ──
  const datos: DatoTeatro[] = [];
  for (const [slug, t] of Object.entries(TEATROS)) {
    const inicio = inicioPorTeatro.get(slug) ?? null;
    const ms = inicio ? Date.parse(`${inicio}T00:00:00Z`) : NaN;
    const diasDesde = Number.isFinite(ms) ? Math.max(0, (ahora.getTime() - ms) / 86_400_000) : null;

    // frentes: SOLO lo que la sala OSINT de la casa documenta (null = sin sala)
    const geo = geografiaDeTeatro(slug);
    const frentes = geo.salaGuerra ? geo.puntos.length : null;

    // capacidad: media del gasto militar de las naciones CON dato
    const paises = paisesDe(slug);
    const conDato = paises.map((iso) => gastoPorIso.get(iso)).filter((g): g is { pct: number; anio: number } => !!g);
    const mediaGasto =
      conDato.length > 0
        ? conDato.reduce((acc, g) => acc + g.pct, 0) / conDato.length
        : null;
    const anioIndicadores = conDato.length > 0 ? Math.max(...conDato.map((g) => g.anio)) : null;

    const procedencias: string[] = [];
    if (inicio) procedencias.push("fnt:acontecimientos — fecha histórica pública del hecho");
    procedencias.push("fnt:cables — conteo vivo del archivo por conflictTag");
    if (frentes !== null) procedencias.push("fnt:teatros — frentes de la sala OSINT (v220, fuente citada)");
    if (mediaGasto !== null) {
      procedencias.push("fnt:indicadores — gasto militar % PIB del Banco Mundial (CC BY 4.0)");
    }

    datos.push({
      slug,
      nombre: t.nombre,
      diasDesde,
      cables: conteos.get(slug) ?? 0,
      frentes,
      gastoMilitarPct: mediaGasto === null ? null : Math.round(mediaGasto * 100) / 100,
      procedencias,
      anioIndicadores,
    });
  }

  return { datos, notaBd, ahoraIso };
}
