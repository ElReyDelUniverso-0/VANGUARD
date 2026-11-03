// ============================================================
// VANGUARD v170.0 «RENACIMIENTO» — TIPOS FUNDAMENTALES
// La red mundial de salas. Sin modo 3D (eliminado por decreto).
// El algoritmo PARA TI gobierna el descubrimiento.
// ============================================================

export type Categoria = "MUNDO" | "MERCADO" | "JUEGO" | "CONOCIMIENTO" | "AGENTE";

export const CATEGORIAS: Record<
  Categoria,
  { etiqueta: string; gradiente: string; texto: string; borde: string; glow: string }
> = {
  MUNDO: {
    etiqueta: "MUNDO",
    gradiente: "from-emerald-500/80 via-teal-500/60 to-emerald-900/40",
    texto: "text-emerald-300",
    borde: "border-emerald-500/40",
    glow: "shadow-[0_0_40px_-8px_rgba(16,185,129,0.45)]",
  },
  MERCADO: {
    etiqueta: "MERCADO",
    gradiente: "from-amber-500/80 via-orange-500/60 to-amber-900/40",
    texto: "text-amber-300",
    borde: "border-amber-500/40",
    glow: "shadow-[0_0_40px_-8px_rgba(245,158,11,0.45)]",
  },
  JUEGO: {
    etiqueta: "JUEGO",
    gradiente: "from-red-500/80 via-rose-600/60 to-red-900/40",
    texto: "text-red-300",
    borde: "border-red-500/40",
    glow: "shadow-[0_0_40px_-8px_rgba(239,68,68,0.45)]",
  },
  CONOCIMIENTO: {
    etiqueta: "CONOCIMIENTO",
    gradiente: "from-violet-500/80 via-purple-500/60 to-violet-900/40",
    texto: "text-violet-300",
    borde: "border-violet-500/40",
    glow: "shadow-[0_0_40px_-8px_rgba(139,92,246,0.45)]",
  },
  AGENTE: {
    etiqueta: "AGENTE",
    gradiente: "from-cyan-500/80 via-teal-400/60 to-cyan-900/40",
    texto: "text-cyan-300",
    borde: "border-cyan-500/40",
    glow: "shadow-[0_0_40px_-8px_rgba(6,182,212,0.45)]",
  },
};

export interface Sala {
  id: string;
  nombre: string;
  icono: string;
  categoria: Categoria;
  tagline: string;
  descripcion: string;
  tags: string[];
  fuente: "api" | "sim" | "archivo";
  fuenteEtiqueta: string;
  poder: number; // calidad base 0-100 — ingrediente del momentum
}

// ── Filas universales del renderizador de salas ──────────────
export type Fila =
  | { tipo: "stat"; etiqueta: string; valor: string; detalle?: string; color?: string }
  | { tipo: "texto"; titulo: string; cuerpo: string }
  | { tipo: "lista"; titulo: string; items: { principal: string; secundario?: string; color?: string }[] }
  | { tipo: "progreso"; etiqueta: string; valor: number; detalle?: string; color?: string }
  | { tipo: "accion"; etiqueta: string; accion: string; nota?: string };

// ── Señales del agente (combustible del algoritmo) ───────────
export interface SenalSala {
  vistas: number;
  likes: number;
  noInteresa: boolean;
  tiempoMs: number;
  ultimaVistaTs: number;
}

export interface SenalesAgente {
  [salaId: string]: SenalSala;
}

export interface EstadoAgente {
  mon: number;
  xp: number;
  racha: number;
  ultimoDiaRacha: string;
  partidas: number;
  senales: SenalesAgente;
  historial: string[]; // ids de salas, más reciente primero
  mecanicas: Record<string, Record<string, unknown>>;
  sonido: boolean;
}

export interface TarjetaRecomendada {
  sala: Sala;
  puntaje: number;
  razon: string;
}
