// ═══════════════════════════════════════════════════════════════════
// v440.3 · VANGUARD CINEMATIC EXPERIENCE — los tipos compartidos.
// Sin "use client": lo importan el servidor (que reúne los datos REALES)
// y el cliente (que los pinta).
// ═══════════════════════════════════════════════════════════════════

/** las cinco experiencias grandes */
export type TipoCine = "ojo" | "v" | "planeta" | "radar" | "portales";
/** los destellos: sorpresas pequeñas que aparecen tras minutos explorando */
export type TipoDestello = "d-anillo" | "d-ojo" | "d-v" | "d-radar" | "d-portal";
export type TipoEscena = TipoCine | TipoDestello;

/** el material de la V cambia según el módulo en el que se gana */
export type Material = "metal" | "cristal" | "lineas" | "particulas";

export type ModuloCine = {
  id: string;
  nombre: string;
  lema: string;
  nav: string;
  /** todas las salas del módulo (sus href) */
  salas: string[];
  /** alguna de sus salas aparece en las últimas entradas de la bitácora */
  actualizado: boolean;
};

/** lo que el servidor pasa al cliente: TODO sale de la casa, nada se inventa */
export type DatosCine = {
  version: string;
  /** las tres últimas novedades reales de la bitácora */
  novedades: { version: string; nombre: string }[];
  modulos: ModuloCine[];
  /** salas reales del módulo «El mundo» para las ventanas del planeta */
  ventanas: { label: string; txt: string; href: string }[];
};

/** un portal tal y como lo pinta la escena (calculado en el cliente con lo visitado) */
export type PortalCine = {
  nombre: string;
  nav: string;
  /** «ACTUALIZADO», «SIN EXPLORAR» o «3/18 SALAS» */
  estado: string;
  tono: "nuevo" | "vacio" | "visto";
  color: string;
};

export type ExtraCine = {
  /** salas descubiertas (V y destello radar) */
  cuenta?: number;
  total?: number;
  /** texto real del logro que disparó la V */
  texto?: string;
  portales?: PortalCine[];
  /** índice del portal por el que entra la cámara */
  objetivo?: number;
  /** destello portal: el módulo aún sin explorar */
  modulo?: { nombre: string; nav: string };
  /** etiquetas reales que orbitan el ojo */
  etiquetas?: string[];
};

export type FinCine = { ir?: string; sugerido?: { nombre: string; nav: string } };
