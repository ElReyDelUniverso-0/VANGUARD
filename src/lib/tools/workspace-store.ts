// ============================================================
// VANGUARD TOOLS — GESTOR DE ESTADO, PERSISTENCIA Y COMPARTICIÓN
// v406.7 Almacenamiento local (localStorage) y enlaces compartibles
// ============================================================

import {
  VanguardWorkspaceState,
  NotaInteligencia,
  SavedScenario,
  CustomThematicMap,
  CustomTimeline,
  ColeccionInvestigacion,
} from "./types";
import { PREBUILT_TIMELINES } from "./data-indicators";

const STORAGE_KEY = "vanguard_tools_workspace_v1";

const DEFAULT_STATE: VanguardWorkspaceState = {
  favoritos: ["US", "CN", "RU", "DE", "pib-nominal", "gasto-defensa", "cable-sea-me-we-5"],
  historialConsultas: [
    { texto: "Comparativa militar EE.UU. vs China", timestamp: Date.now() - 3600000, categoria: "analisis" },
    { texto: "Vulnerabilidad Estrecho de Ormuz", timestamp: Date.now() - 7200000, categoria: "creacion" },
    { texto: "Poder nuclear estratégico global", timestamp: Date.now() - 86400000, categoria: "exploracion" },
  ],
  notas: [
    {
      id: "nota-inicial-1",
      titulo: "Evaluación de Cuello de Botella en el Estrecho de Malaca",
      contenido: "El 80% del petróleo importado por China transita por Malaca. Un bloqueo efectivo requeriría el despliegue de la 7ª Flota en el Estrecho de la Sonda y Lombok como desvíos alternativos con sobrecostos del 35%.",
      paisRelacionado: "CN",
      clasificacion: "CONFIDENCIAL (VANGUARD)",
      tags: ["maritimo", "energia", "malaca", "asia"],
      fechaCreacion: new Date(Date.now() - 86400000 * 2).toISOString(),
      fechaModificacion: new Date().toISOString(),
    },
    {
      id: "nota-inicial-2",
      titulo: "Impacto del CHIPS Act en la Cadena de Suministro de 2nm",
      contenido: "TSMC en Arizona enfrenta retrasos en la instalación de maquinaria ASML High-NA EUV por escasez de técnicos especializados. Taiwán mantiene la ventaja de empaquetado CoWoS hasta al menos 2028.",
      paisRelacionado: "US",
      clasificacion: "ABIERTO (OSINT)",
      tags: ["tecnologia", "semiconductores", "taiwan"],
      fechaCreacion: new Date(Date.now() - 86400000 * 5).toISOString(),
      fechaModificacion: new Date().toISOString(),
    },
  ],
  colecciones: [
    {
      id: "col-taiwan",
      nombre: "Foco Estrecho de Taiwán & Microchips",
      descripcion: "Dossiers de defensa, semiconductores y cuellos de botella del Mar del Sur de China.",
      color: "#06B6D4",
      fecha: new Date().toISOString(),
      elementos: [
        { tipo: "pais", id: "CN", titulo: "República Popular China" },
        { tipo: "pais", id: "US", titulo: "Estados Unidos" },
        { tipo: "indicador", id: "satelites-espacio", titulo: "Satélites en Órbita" },
      ],
    },
    {
      id: "col-energia",
      nombre: "Seguridad Energética Euroasiática",
      descripcion: "Monitoreo de gasoductos, terminales GNL y flujos de crudo de los Urales.",
      color: "#F59E0B",
      fecha: new Date().toISOString(),
      elementos: [
        { tipo: "pais", id: "RU", titulo: "Federación Rusa" },
        { tipo: "pais", id: "DE", titulo: "Alemania" },
        { tipo: "indicador", id: "produccion-crudo", titulo: "Producción de Petróleo" },
      ],
    },
  ],
  mapasPersonalizados: [
    {
      id: "mapa-defecto-1",
      nombre: "Corredor Indo-Pacífico Táctico",
      descripcion: "Visualización de las principales bases navales y pasos marítimos del Sudeste Asiático.",
      fechaCreacion: new Date().toISOString(),
      paisesColoreados: {
        US: "#3B82F6",
        CN: "#EF4444",
        JP: "#10B981",
        IN: "#F59E0B",
        AU: "#8B5CF6",
      },
      pins: [
        { id: "p1", lat: 1.3521, lng: 103.8198, titulo: "Base Naval Changi (Singapur)", nota: "Acceso de portaaviones", categoria: "base", color: "#3B82F6" },
        { id: "p2", lat: 12.7855, lng: 45.0187, titulo: "Bab el-Mandeb", nota: "Vigilancia de drones", categoria: "conflicto", color: "#EF4444" },
      ],
      rutas: [
        { id: "r1", nombre: "Ruta del Crudo Golfo-Shanghái", desde: [25.0, 55.0], hasta: [31.2, 121.5], tipo: "maritima", color: "#F59E0B" },
      ],
      capasActivas: {
        chokepoints: true,
        cables: true,
        alianzas: true,
      },
    },
  ],
  cronologiasGuardadas: PREBUILT_TIMELINES,
  escenariosGuardados: [
    {
      id: "esc-bloqueo-ormuz",
      nombre: "Cierre Temporal del Estrecho de Ormuz (45 días)",
      descripcion: "Interrupción de 17 mbpd de crudo tras incidentes en el Golfo de Omán.",
      fecha: new Date().toISOString(),
      shocks: {
        aumentoCrudoDolares: 45,
        bloqueoOrmuz: true,
        bloqueoMalaca: false,
        bloqueoSuez: false,
        arancelesGlobalesPct: 5,
        aumentoGastoDefensaPct: 15,
        disrupcionSemiconductores: false,
      },
      impacto: {
        inflacionAdicionalGlobalPct: 4.82,
        retrasoFleteMaritimoDias: 16,
        indiceTensionGlobal: 88,
        sectoresMasAfectados: ["Transporte marítimo", "Química pesada", "Refino europeo"],
        ganadoresGeopoliticos: ["Productores no-OPEP", "GNL estadounidense"],
        perdedoresGeopoliticos: ["Economías importadoras de Asia Oriental", "Industria alemana"],
        resumenImpacto: "Aumento inmediato del barril a $125 USD, activación de reservas IEA y tensión militar máxima en el Comando Central de EE.UU.",
      },
    },
  ],
  temaVisual: "tactico-hud",
};

/**
 * Carga el estado del workspace de Vanguard desde localStorage
 */
export function loadWorkspaceState(): VanguardWorkspaceState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
    };
  } catch (err) {
    console.error("Error al cargar Vanguard Workspace:", err);
    return DEFAULT_STATE;
  }
}

/**
 * Guarda el estado del workspace en localStorage
 */
export function saveWorkspaceState(state: VanguardWorkspaceState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Error al guardar Vanguard Workspace:", err);
  }
}

/**
 * Agrega un elemento a favoritos o lo remueve si ya existe
 */
export function toggleFavoriteItem(id: string): boolean {
  const current = loadWorkspaceState();
  const exists = current.favoritos.includes(id);
  let nextFavorites: string[];
  if (exists) {
    nextFavorites = current.favoritos.filter((item) => item !== id);
  } else {
    nextFavorites = [id, ...current.favoritos];
  }
  saveWorkspaceState({ ...current, favoritos: nextFavorites });
  return !exists;
}

/**
 * Registra una consulta en el historial de investigación
 */
export function recordInvestigationHistory(texto: string, categoria: string): void {
  const current = loadWorkspaceState();
  const filtered = current.historialConsultas.filter((item) => item.texto.toLowerCase() !== texto.toLowerCase());
  const updated = [
    { texto, timestamp: Date.now(), categoria },
    ...filtered.slice(0, 19), // Mantener últimas 20 consultas
  ];
  saveWorkspaceState({ ...current, historialConsultas: updated });
}

/**
 * Guarda una nota de inteligencia (creación o actualización)
 */
export function saveIntelligenceNote(nota: Omit<NotaInteligencia, "id" | "fechaCreacion" | "fechaModificacion"> & { id?: string }): NotaInteligencia {
  const current = loadWorkspaceState();
  const now = new Date().toISOString();
  let fullNote: NotaInteligencia;

  if (nota.id) {
    // Actualizar existente
    fullNote = {
      id: nota.id,
      titulo: nota.titulo,
      contenido: nota.contenido,
      paisRelacionado: nota.paisRelacionado,
      clasificacion: nota.clasificacion,
      tags: nota.tags,
      fechaCreacion: current.notas.find((n) => n.id === nota.id)?.fechaCreacion || now,
      fechaModificacion: now,
    };
    const nextNotes = current.notas.map((n) => (n.id === nota.id ? fullNote : n));
    saveWorkspaceState({ ...current, notas: nextNotes });
  } else {
    // Crear nueva
    fullNote = {
      ...nota,
      id: `nota-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fechaCreacion: now,
      fechaModificacion: now,
    };
    saveWorkspaceState({ ...current, notas: [fullNote, ...current.notas] });
  }

  return fullNote;
}

/**
 * Elimina una nota de inteligencia por id
 */
export function deleteIntelligenceNote(id: string): void {
  const current = loadWorkspaceState();
  saveWorkspaceState({
    ...current,
    notas: current.notas.filter((n) => n.id !== id),
  });
}

/**
 * Codifica parámetros de investigación en una cadena URL segura (base64)
 */
export function encodeShareableState(toolId: string, params: Record<string, any>): string {
  try {
    const payload = JSON.stringify({ t: toolId, p: params, v: "406.7", d: Date.now() });
    if (typeof window !== "undefined") {
      return btoa(encodeURIComponent(payload));
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Decodifica una cadena compartida desde la URL
 */
export function decodeShareableState(hash: string): { toolId: string; params: Record<string, any> } | null {
  try {
    if (typeof window === "undefined" || !hash) return null;
    const clean = hash.replace(/^#\/?/, "").replace(/^share=/, "");
    const decoded = decodeURIComponent(atob(clean));
    const parsed = JSON.parse(decoded);
    return {
      toolId: parsed.t,
      params: parsed.p || {},
    };
  } catch {
    return null;
  }
}
