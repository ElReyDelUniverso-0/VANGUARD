// ═══════════════════════════════════════════════════════════════════
// VANGUARD INVESTIGACIÓN SISTÉMICA — REGISTRO & CONSULTAS
// ═══════════════════════════════════════════════════════════════════

export * from "./tipos";
export * from "./temas-data";

import type { CategoriaInvestigacion, TemaInvestigacion } from "./tipos";
import { TEMAS_INVESTIGACION } from "./temas-data";

/** Obtiene un tema por su identificador slug (ej: 'semiconductores-litografia') */
export function obtenerTemaInvestigacion(id: string): TemaInvestigacion | undefined {
  return TEMAS_INVESTIGACION.find((t) => t.id === id);
}

/** Filtra y busca temas por categoría, texto y urgencia */
export function buscarTemasInvestigacion(filtros?: {
  categoria?: CategoriaInvestigacion | "TODAS";
  texto?: string;
  urgencia?: string;
}): TemaInvestigacion[] {
  let resultado = [...TEMAS_INVESTIGACION];

  if (filtros?.categoria && filtros.categoria !== "TODAS") {
    resultado = resultado.filter((t) => t.categoria === filtros.categoria);
  }

  if (filtros?.urgencia && filtros.urgencia !== "TODAS") {
    resultado = resultado.filter((t) => t.urgenciaSistemica === filtros.urgencia);
  }

  if (filtros?.texto && filtros.texto.trim()) {
    const q = filtros.texto.toLowerCase().trim();
    resultado = resultado.filter(
      (t) =>
        t.titulo.toLowerCase().includes(q) ||
        t.subtitulo.toLowerCase().includes(q) ||
        t.resumenEjecutivo.toLowerCase().includes(q) ||
        t.etiquetas.some((et) => et.toLowerCase().includes(q)) ||
        t.actoresClave.some((a) => a.nombre.toLowerCase().includes(q)) ||
        t.conceptosEsenciales.some((c) => c.termino.toLowerCase().includes(q))
    );
  }

  return resultado;
}

/** Encuentra todos los temas conectados con un modelo de simulador de /labs/<modelo> */
export function temasPorModeloLab(modeloId: string): TemaInvestigacion[] {
  return TEMAS_INVESTIGACION.filter((t) =>
    t.conexionesVanguard.labsModelos.some((m) => m.id === modeloId)
  );
}

/** Métricas vivas del ecosistema de investigación */
export function metricasInvestigacion() {
  const totalTemas = TEMAS_INVESTIGACION.length;
  const totalIndicadores = TEMAS_INVESTIGACION.reduce((acc, t) => acc + t.indicadoresEmpiricos.length, 0);
  const totalFuentes = TEMAS_INVESTIGACION.reduce((acc, t) => acc + t.fuentesMetodologicas.length, 0);
  const totalNodos = TEMAS_INVESTIGACION.reduce((acc, t) => acc + t.nodosGeograficos.length, 0);

  const porCategoria = TEMAS_INVESTIGACION.reduce((acc, t) => {
    acc[t.categoria] = (acc[t.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalTemas,
    totalIndicadores,
    totalFuentes,
    totalNodos,
    porCategoria,
    actualizado: "2026-10-15",
  };
}

export const CATEGORIAS_CONFIG: {
  id: CategoriaInvestigacion | "TODAS";
  label: string;
  color: string;
  desc: string;
}[] = [
  { id: "TODAS", label: "Todas las áreas", color: "#f59e0b", desc: "Visión integral de todos los vectores sistémicos del planeta." },
  { id: "GEOPOLITICA", label: "Geopolítica & Rutas", color: "#38bdf8", desc: "Chokepoints marítimos, equilibrio de poder y control territorial." },
  { id: "TECNOLOGIA_CIBER", label: "Tecnología & Ciber", color: "#a855f7", desc: "Semiconductores, cables submarinos e inteligencia artificial de frontera." },
  { id: "ENERGIA_RECURSOS", label: "Energía & Recursos", color: "#10b981", desc: "Minerales críticos, fertilizantes, transición y seguridad de abastecimiento." },
  { id: "FINANZAS_COMERCIO", label: "Finanzas & Deuda", color: "#eab308", desc: "Desdolarización, arquitectura monetaria y deuda soberana global." },
  { id: "DEFENSA_ESTRATEGIA", label: "Defensa & Disuasión", color: "#ef4444", desc: "Armas hipersónicas, doctrinas de disuasión y proliferación estratégica." },
  { id: "CLIMA_AGUA", label: "Clima & Agua", color: "#06b6d4", desc: "Estrés hídrico en cuencas fluviales compartidas y deshielo polar." },
];
