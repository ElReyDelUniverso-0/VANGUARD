// ═══════════════════════════════════════════════════════════════════
// v406.3 VANGUARD EDITORIAL COMMAND — los contratos de la redacción.
// Un artículo es un objeto con su área, su tipo (actualidad · permanente ·
// datos), sus fuentes, su fecha de revisión y su registro de cambios.
// El calendario, la cola, la verificación y el plan de actualizaciones leen
// SOLO estos tipos: una pieza nueva entra en todo el sistema con un objeto.
// ═══════════════════════════════════════════════════════════════════

export type ClaveArea =
  | "geopolitica"
  | "paises"
  | "economia"
  | "historia"
  | "conflictos"
  | "ciencia"
  | "sociedad"
  | "educacion"
  | "recursos"
  | "relaciones";

/** actualidad = caduca y se revisa a menudo · permanente = de fondo ·
 *  datos = se recalcula sola desde una fuente de la casa */
export type TipoPieza = "actualidad" | "permanente" | "datos";

export type Bloque =
  | { t: "p"; x: string }
  | { t: "h2"; x: string; id?: string }
  | { t: "lista"; items: string[]; numerada?: boolean }
  | { t: "datos"; titulo?: string; filas: [string, string][] }
  | { t: "tabla"; cab: string[]; filas: (string | number)[][]; nota?: string }
  | { t: "cita"; x: string; de: string }
  | { t: "aviso"; x: string }
  /** clasificación con enlace a la ficha de cada país (piezas de datos) */
  | { t: "ranking"; titulo: string; filas: { pos: number; nombre: string; href: string; valor: string; destacado?: boolean }[]; nota?: string };

export type Fuente = {
  nombre: string;
  url: string;
  /** primaria = el documento o el organismo que produce el dato */
  tipo: "primaria" | "secundaria";
  fecha?: string;
};

export type Enlace = { href: string; label: string };

export type Cambio = { fecha: string; nota: string };

export interface Articulo {
  slug: string;
  titulo: string;
  entradilla: string;
  area: ClaveArea;
  tipo: TipoPieza;
  /** ISO yyyy-mm-dd */
  publicado: string;
  revisado: string;
  /** cada cuántos días toca revisarla (el plan de actualizaciones lo lee) */
  revisarCada: number;
  /** si la vigencia depende de una fecha concreta (fin de una cumbre, un plazo) */
  hito?: { fecha: string; que: string };
  imagen: string;
  claves: string[];
  /** cuerpo fijo, o función que lo compone desde los datos de la casa */
  cuerpo: Bloque[] | (() => Bloque[]);
  fuentes: Fuente[];
  /** salas modernas de la casa que la pieza complementa (rutas vivas) */
  enlaces: Enlace[];
  /** puertas del Vanguard clásico (/sala/<clave>) */
  salas: string[];
  etiquetas: string[];
  /** con qué informe de la casa se coordina (de dónde salen o adónde van sus datos) */
  informe: string;
  /** qué contenido existente complementa SIN repetirlo (control de duplicados) */
  complementa?: string;
  cambios: Cambio[];
}

/** Estado de una pieza en el calendario */
export type EstadoPieza = "publicado" | "en-preparacion" | "en-cola" | "pendiente-evento";

export interface PiezaPlan {
  fecha: string; // yyyy-mm-dd
  area: ClaveArea;
  titulo: string;
  tipo: TipoPieza;
  prioridad: 1 | 2 | 3; // 1 = máxima
  estado: EstadoPieza;
  angulo: string; // qué cuenta que no cuente ya la casa
  informe: string; // con qué informe se coordina
  complementa?: string; // contenido existente al que remite (ruta viva)
  fuentes: string[]; // fuentes previstas
  slug?: string; // si ya está publicada
  evento?: string; // si depende de un evento con fecha
}
