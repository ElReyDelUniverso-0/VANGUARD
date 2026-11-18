// ═══════════════════════════════════════════════════════════════════
// v411.0 · REGISTRO DE LABORATORIOS
//
// El catálogo único. La ruta /labs y /labs/[modelo] leen de aquí: si un modelo
// no está en este registro, no existe para la web. Sin listas paralelas.
// ═══════════════════════════════════════════════════════════════════

import type { CategoriaLab, ModeloLab } from "./tipos";
import { CATEGORIA_LAB } from "./tipos";

import { macro, fiscal, comercio, produccion } from "./modelos/economia";
import { demografia, urbanizacion, acople } from "./modelos/sociedad";
import { clima, agua, territorio } from "./modelos/geografia";
import { imperios, rutas } from "./modelos/historia";
import { red, energia, transporte } from "./modelos/sistemas";

export const MODELOS: ModeloLab[] = [
  macro,
  fiscal,
  comercio,
  produccion,
  demografia,
  urbanizacion,
  acople,
  clima,
  agua,
  territorio,
  imperios,
  rutas,
  red,
  energia,
  transporte,
];

export const MODELOS_POR_ID: Record<string, ModeloLab> = Object.fromEntries(
  MODELOS.map((m) => [m.id, m])
);

export function obtenerModelo(id: string): ModeloLab | undefined {
  return MODELOS_POR_ID[id];
}

export function modelosDeCategoria(cat: CategoriaLab): ModeloLab[] {
  return MODELOS.filter((m) => m.categoria === cat);
}

export const CATEGORIAS: CategoriaLab[] = ["economia", "demografia", "geografia", "historia", "sistemas"];

export function resumenCategorias() {
  return CATEGORIAS.map((id) => ({
    id,
    ...CATEGORIA_LAB[id],
    modelos: modelosDeCategoria(id),
  }));
}

export function buscarModelos(texto: string): ModeloLab[] {
  const q = texto.trim().toLowerCase();
  if (!q) return MODELOS;
  return MODELOS.filter((m) =>
    [m.nombre, m.pregunta, m.resumen, m.contexto, m.categoria, CATEGORIA_LAB[m.categoria].nombre]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export function estadisticasLabs() {
  const totalVariables = MODELOS.reduce((a, m) => a + m.variables.length, 0);
  const totalLimites = MODELOS.reduce((a, m) => a + m.limites.length, 0);
  const totalSupuestos = MODELOS.reduce((a, m) => a + m.supuestos.length, 0);
  const totalReales = MODELOS.reduce((a, m) => a + m.reales.length, 0);
  const totalPresets = MODELOS.reduce((a, m) => a + (m.presets?.length ?? 0), 0);
  return {
    modelos: MODELOS.length,
    categorias: CATEGORIAS.length,
    variables: totalVariables,
    limites: totalLimites,
    supuestos: totalSupuestos,
    datosReales: totalReales,
    presets: totalPresets,
  };
}

/** Los modelos que traen mapa (para la sección de visualización geográfica). */
export function modelosConMapa(): ModeloLab[] {
  return MODELOS.filter((m) => typeof m.mapa === "function");
}
