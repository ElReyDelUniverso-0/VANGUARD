// ═══════════════════════════════════════════════════════════════════
// v422.0 VANGUARD WORLDS — LA CARGA DEL MUNDO VIVO
//
// La página server compone UNA vez el mundo que viaja con el primer byte:
// las zonas y sus lugares (con sus experiencias reales) y las cifras de
// cobertura. Las capas NO se duplican: se reutilizan las mismas
// declaraciones del Centro de Mapas (mapas-payload) — el globo pinta la
// capa activa con los mismos colores y valores, y la fuente de cada
// capa viaja en su ficha. Cero mapas duplicados, cero datos inventados.
// ═══════════════════════════════════════════════════════════════════

import { ZONAS_MUNDOS } from "./zonas";
import { construirPayload, type CapaCliente } from "@/lib/mapas-payload";
import { CATEGORIA_MUNDOS } from "./tipos";
import type { PayloadMundos } from "./tipos";

/** El mundo completo: zonas, lugares y cifras de cobertura reales. */
export function construirPayloadMundos(): PayloadMundos & { capas: CapaCliente[] } {
  const zonas = ZONAS_MUNDOS;
  const lugares = zonas.flatMap((z) => z.lugares);
  const experiencias = lugares.flatMap((l) => l.experiencias);

  return {
    zonas,
    cifras: {
      zonas: zonas.length,
      lugares: lugares.length,
      experiencias: experiencias.length,
    },
    // las capas son las del Centro de Mapas: la misma fuente, el mismo
    // pintado, la misma ficha. El mundo no inventa capa suya.
    capas: construirPayload().capas,
  };
}

/** Las experiencias por categoría, para el resumen de la página. */
export function experienciasPorCategoria(
  payload: PayloadMundos,
): { clave: string; etiqueta: string; cuenta: number }[] {
  const todo = payload.zonas.flatMap((z) => z.lugares).flatMap((l) => l.experiencias);
  const cuentas = new Map<string, number>();
  for (const e of todo) cuentas.set(e.categoria, (cuentas.get(e.categoria) ?? 0) + 1);
  const etiqueta = (clave: string) =>
    CATEGORIA_MUNDOS.find((c) => c.clave === clave)?.etiqueta ?? clave;
  return [...cuentas.entries()]
    .map(([clave, cuenta]) => ({ clave, etiqueta: etiqueta(clave), cuenta }))
    .sort((a, b) => b.cuenta - a.cuenta);
}

/** El payload completo (mundos + capas) para la página. */
export type PayloadMundoCompleto = PayloadMundos & { capas: CapaCliente[] };
