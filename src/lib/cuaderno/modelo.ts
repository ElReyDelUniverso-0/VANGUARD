// ═══════════════════════════════════════════════════════════════════
// v431.6 EL CUADERNO · EL MODELO (puro, sin DOM, sin React)
//
// El Dueño pidió que el anotador fuera «un módulo aparte, más hermoso, más
// fluido, que pueda agregar más cosas, escribir, señalar y mucho más».
// Todo lo que se puede decidir sin pantalla vive aquí, para poder probarlo
// ejecutándolo de verdad (scripts/pruebas-cuaderno.mjs):
//
//   · PIEZAS de siete clases (nota, cita, enlace, lugar, cifra, tarea,
//     imagen) con etiquetas, marca, tinta y —si tiene sitio— coordenadas.
//   · TEXTO RICO seguro: se guarda como texto plano con marcas, se lee en
//     trozos tipados y NUNCA se inyecta HTML.
//   · SEÑALAR: resaltar un tramo del texto propio (y quitar el resaltado).
//   · MIGRACIÓN: el tablero de la Zona Cero (v2) entra solo la primera vez.
//   · LECTURA: buscar sin tildes, filtrar, relacionadas, cifras, Markdown.
//   · EL EMBLEMA: el sello del cuaderno, editable, y su SVG descargable.
// ═══════════════════════════════════════════════════════════════════

import { PIELES, TINTAS, VISTAS, pielValida, tintaValida, vistaValida, type Piel, type Tinta, type Vista } from "./pieles";

export const VERSION_CUADERNO = 3;

// ─────────────────────────────── las piezas ───────────────────────────────

export const TIPOS = ["nota", "cita", "enlace", "lugar", "cifra", "tarea", "imagen"] as const;
export type Tipo = (typeof TIPOS)[number];

export const TIPO_INFO: Record<Tipo, { nombre: string; simbolo: string; detalle: string }> = {
  nota: { nombre: "Nota", simbolo: "¶", detalle: "Texto libre: lo que piensas o lo que has entendido." },
  cita: { nombre: "Cita", simbolo: "❝", detalle: "Lo que dijo otro, con su fuente y su fecha." },
  enlace: { nombre: "Enlace", simbolo: "↗", detalle: "Una puerta: una ruta de la casa o una web." },
  lugar: { nombre: "Lugar", simbolo: "◎", detalle: "Un punto del planeta con sus coordenadas." },
  cifra: { nombre: "Cifra", simbolo: "№", detalle: "Un dato con su unidad y de dónde sale." },
  tarea: { nombre: "Tarea", simbolo: "☑", detalle: "Algo que hacer; se puede dar por hecho." },
  imagen: { nombre: "Imagen", simbolo: "▣", detalle: "Una imagen con su crédito y su licencia." },
};

export const MARCAS = ["ninguna", "bandera", "estrella", "duda", "hecho"] as const;
export type Marca = (typeof MARCAS)[number];

export const MARCA_INFO: Record<Marca, { simbolo: string; nombre: string }> = {
  ninguna: { simbolo: "·", nombre: "Sin marca" },
  bandera: { simbolo: "⚑", nombre: "Señalada" },
  estrella: { simbolo: "★", nombre: "Importante" },
  duda: { simbolo: "?", nombre: "Por comprobar" },
  hecho: { simbolo: "✓", nombre: "Comprobada" },
};

export type Pieza = {
  id: string;
  tipo: Tipo;
  titulo: string;
  cuerpo: string;
  etiquetas: string[];
  marca: Marca;
  tinta: Tinta;
  /** sitio, si lo tiene */
  lugar?: string;
  lat?: number;
  lng?: number;
  /** puerta, si la tiene */
  ruta?: string;
  /** de dónde sale (medio, institución, persona) */
  fuente?: string;
  imagen?: string;
  /** posición en el tablero, 0..100 */
  x: number;
  y: number;
  creada: number;
  tocada: number;
  /** sólo tareas */
  hecha?: boolean;
};

export type Enlace = [string, string];

export type Cuaderno = {
  v: number;
  piezas: Pieza[];
  enlaces: Enlace[];
  emblema: Emblema;
  piel: Piel;
  vista: Vista;
};

export const MAX_PIEZAS = 400;
export const MAX_ENLACES = 900;
export const MAX_TITULO = 140;
export const MAX_CUERPO = 4000;
export const MAX_NOTA_CORTA = 280;
const MAX_ETIQUETAS = 8;
const MAX_ETIQUETA = 24;

// ─────────────────────────────── el emblema ───────────────────────────────

export const FORMAS = ["escudo", "circulo", "rombo", "hexagono", "sello"] as const;
export type Forma = (typeof FORMAS)[number];

export const ICONOS = [
  "ojo",
  "estrella",
  "brujula",
  "libro",
  "rayo",
  "globo",
  "ancla",
  "pluma",
  "llama",
  "diana",
  "corona",
  "onda",
] as const;
export type Icono = (typeof ICONOS)[number];

export type Emblema = {
  forma: Forma;
  icono: Icono;
  monograma: string;
  tinta: Tinta;
  metal: Tinta;
  lema: string;
};

export const EMBLEMA_DEFECTO: Emblema = {
  forma: "escudo",
  icono: "ojo",
  monograma: "VG",
  tinta: "ambar",
  metal: "grafito",
  lema: "Lo que se anota, se piensa dos veces",
};

/** Los trazos de los doce iconos (línea, 24×24). Dibujo propio, sin fuentes. */
export const TRAZOS_ICONO: Record<Icono, string[]> = {
  ojo: ["M2.5 12S6 6.2 12 6.2 21.5 12 21.5 12 18 17.8 12 17.8 2.5 12 2.5 12Z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"],
  estrella: ["M12 3.2l2.7 5.7 6.3.9-4.6 4.3 1.2 6-5.6-3-5.6 3 1.2-6L3 9.8l6.3-.9Z"],
  brujula: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M15.4 8.6l-2 5-5 2 2-5Z"],
  libro: ["M3.2 5.6c0-.9.7-1.6 1.6-1.6H11v15.4H4.8c-.9 0-1.6-.7-1.6-1.6Z", "M20.8 5.6c0-.9-.7-1.6-1.6-1.6H13v15.4h6.2c.9 0 1.6-.7 1.6-1.6Z"],
  rayo: ["M13.2 2 4.6 13.6h5.6L9 22l8.8-11.6h-5.6Z"],
  globo: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M3.2 12h17.6", "M12 3c2.6 2.6 2.6 15.4 0 18", "M12 3c-2.6 2.6-2.6 15.4 0 18"],
  ancla: ["M12 4.2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "M12 8.2V20", "M5 13.4a7 7 0 0 0 14 0"],
  pluma: ["M4 20 20 3.6c-1 5.2-3.2 8.4-7.2 10.4L8.6 15l-1 4.6Z", "M9 15.4 14 10"],
  llama: ["M12 2.6c3 3.6 6 6.2 6 10.2a6 6 0 0 1-12 0c0-2.6 1.6-4.2 3-5.8.2 2 1.2 3 2.2 3s1.2-3 .8-4.6".replace(/\.8-4\.6$/, ".8-4.6")],
  diana: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z", "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z", "M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"],
  corona: ["M3.2 18.4 5.4 6.6l4.2 3.2L12 3l2.4 6.8 4.2-3.2 2.2 11.8Z"],
  onda: ["M2.4 12.6c2.4-6 4.8-6 7.2 0s4.8 6 7.2 0 2.4-3.4 4.8-3.4", "M2.4 16.6c2.4-4 4.8-4 7.2 0s4.8 4 7.2 0"],
};

export const FORMA_TRAZO: Record<Forma, string> = {
  escudo: "M60 8l42 12v34c0 28-20 46-42 58C38 100 18 82 18 54V20Z",
  circulo: "M60 8a52 52 0 1 0 0 104A52 52 0 0 0 60 8Z",
  rombo: "M60 6 114 60 60 114 6 60Z",
  hexagono: "M60 6 105 33v54L60 114 15 87V33Z",
  sello: "M60 8a52 52 0 1 0 0 104A52 52 0 0 0 60 8Z",
};

export const MONOGRAMAS = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789·";

export function limpiarEmblema(crudo: unknown): Emblema {
  const o = (crudo ?? {}) as Partial<Emblema>;
  const mono = String(o.monograma ?? EMBLEMA_DEFECTO.monograma)
    .toUpperCase()
    .replace(/[^A-Z0-9Ñ·]/g, "")
    .slice(0, 3);
  return {
    forma: (FORMAS as readonly string[]).includes(String(o.forma)) ? (o.forma as Forma) : EMBLEMA_DEFECTO.forma,
    icono: (ICONOS as readonly string[]).includes(String(o.icono)) ? (o.icono as Icono) : EMBLEMA_DEFECTO.icono,
    monograma: mono || EMBLEMA_DEFECTO.monograma,
    tinta: tintaValida(o.tinta, EMBLEMA_DEFECTO.tinta),
    metal: tintaValida(o.metal, EMBLEMA_DEFECTO.metal),
    lema: String(o.lema ?? EMBLEMA_DEFECTO.lema).replace(/[<>&]/g, "").slice(0, 72),
  };
}

const HEX_TINTA: Record<Tinta, string> = {
  ambar: "#e8c56a",
  cian: "#22d3ee",
  verde: "#4ade80",
  rojo: "#f87171",
  violeta: "#c084fc",
  grafito: "#94a3b8",
};

/** El sello del cuaderno como SVG completo (para pintarlo y para descargarlo). */
export function emblemaSVG(emblema: Emblema, tam = 132): string {
  const e = limpiarEmblema(emblema);
  const tinta = HEX_TINTA[e.tinta];
  const metal = HEX_TINTA[e.metal];
  const forma = FORMA_TRAZO[e.forma];
  const trazos = TRAZOS_ICONO[e.icono].map(
    (d) => `<path d="${d}" fill="none" stroke="${tinta}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
  );
  const aro = e.forma === "sello" ? `<circle cx="60" cy="60" r="46" fill="none" stroke="${metal}" stroke-width="1.2" stroke-dasharray="3 5" opacity=".8"/>` : "";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${Math.round(tam)}" height="${Math.round(tam)}" role="img" aria-label="Emblema de EL CUADERNO">`,
    `<title>${e.lema}</title>`,
    `<path d="${forma}" fill="rgba(8,10,16,.55)" stroke="${metal}" stroke-width="2.2"/>`,
    aro,
    `<g transform="translate(30 24) scale(2.5)">${trazos.join("")}</g>`,
    `<text x="60" y="98" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="17" letter-spacing="3" fill="${metal}">${e.monograma}</text>`,
    `</svg>`,
  ].join("");
}

// ─────────────────────────────── sanea y migra ───────────────────────────────

const limitar = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function idPieza(semilla = Date.now(), azar = Math.random()): string {
  return `p${Math.floor(semilla).toString(36)}${Math.floor(azar * 1e6).toString(36).slice(0, 4)}`;
}

/** Ruta segura: sólo rutas internas de la casa y http(s). Nada de javascript:. */
export function rutaSegura(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s || s.length > 400) return undefined;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  if (/^https?:\/\/[^\s]+$/i.test(s)) return s;
  return undefined;
}

export function imagenSegura(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return undefined;
  if (/^(https:\/\/|\/)[^\s]*$/i.test(s) && !s.startsWith("//")) return s;
  return undefined;
}

/** "  Guerra, Europa   y 2026 " → ["guerra","europa","y","2026"] (sin repetir) */
export function partirEtiquetas(crudo: unknown): string[] {
  const lista = Array.isArray(crudo) ? crudo : String(crudo ?? "").split(/[,;|]/);
  const vistas = new Set<string>();
  for (const t of lista) {
    const limpia = String(t ?? "")
      .replace(/[#]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_ETIQUETA);
    if (limpia) vistas.add(limpia.toLowerCase());
  }
  return [...vistas].slice(0, MAX_ETIQUETAS);
}

function tipoValido(v: unknown): Tipo {
  return (TIPOS as readonly string[]).includes(String(v)) ? (v as Tipo) : "nota";
}

function marcaValida(v: unknown): Marca {
  return (MARCAS as readonly string[]).includes(String(v)) ? (v as Marca) : "ninguna";
}

function coordenada(v: unknown, max: number): number | undefined {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || Math.abs(n) > max) return undefined;
  return Math.round(n * 1e4) / 1e4;
}

export function limpiarPieza(crudo: unknown, ahora = Date.now()): Pieza | null {
  const o = (crudo ?? {}) as Partial<Pieza>;
  const titulo = String(o.titulo ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_TITULO);
  const cuerpo = String(o.cuerpo ?? "").slice(0, MAX_CUERPO);
  if (!titulo && !cuerpo.trim()) return null;
  const lat = coordenada(o.lat, 90);
  const lng = coordenada(o.lng, 180);
  const lugar = String(o.lugar ?? "").replace(/\s+/g, " ").trim().slice(0, 90) || undefined;
  const conSitio = lat !== undefined && lng !== undefined;
  const pieza: Pieza = {
    id: typeof o.id === "string" && /^[a-z0-9-]{2,40}$/i.test(o.id) ? o.id : idPieza(ahora, Math.random()),
    tipo: tipoValido(o.tipo),
    titulo: titulo || cuerpo.trim().split(/\n/)[0].slice(0, MAX_TITULO),
    cuerpo,
    etiquetas: partirEtiquetas(o.etiquetas),
    marca: marcaValida(o.marca),
    tinta: tintaValida(o.tinta),
    x: Number.isFinite(o.x as number) ? limitar(Number(o.x), 2, 98) : 50,
    y: Number.isFinite(o.y as number) ? limitar(Number(o.y), 2, 98) : 50,
    creada: Number.isFinite(o.creada as number) ? Number(o.creada) : ahora,
    tocada: Number.isFinite(o.tocada as number) ? Number(o.tocada) : ahora,
  };
  if (conSitio) {
    pieza.lat = lat;
    pieza.lng = lng;
  }
  if (lugar) pieza.lugar = lugar;
  const ruta = rutaSegura(o.ruta);
  if (ruta) pieza.ruta = ruta;
  const fuente = String(o.fuente ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
  if (fuente) pieza.fuente = fuente;
  const imagen = imagenSegura(o.imagen);
  if (imagen) pieza.imagen = imagen;
  if (pieza.tipo === "tarea") pieza.hecha = o.hecha === true;
  return pieza;
}

export function enlaceValido(e: unknown, ids: Set<string>): Enlace | null {
  if (!Array.isArray(e) || e.length !== 2) return null;
  const [a, b] = e.map(String);
  if (a === b || !ids.has(a) || !ids.has(b)) return null;
  return a < b ? [a, b] : [b, a];
}

export function claveEnlace(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Cualquier cosa que llegue —guardado viejo, import, el tablero de la Zona
 * Cero (v2)— se convierte en un cuaderno válido. Nunca lanza.
 */
export function limpiar(crudo: unknown, ahora = Date.now()): Cuaderno {
  const o = (crudo ?? {}) as Partial<Cuaderno> & { piezas?: unknown; enlaces?: unknown };
  const crudas = Array.isArray(o.piezas) ? o.piezas : Array.isArray(crudo) ? crudo : [];
  const piezas: Pieza[] = [];
  const ids = new Set<string>();
  for (const c of crudas) {
    const p = limpiarPieza(c, ahora);
    if (!p) continue;
    let id = p.id;
    let n = 1;
    while (ids.has(id)) id = `${p.id}-${n++}`;
    ids.add(id);
    piezas.push({ ...p, id });
    if (piezas.length >= MAX_PIEZAS) break;
  }
  const enlaces: Enlace[] = [];
  const vistos = new Set<string>();
  for (const e of Array.isArray(o.enlaces) ? o.enlaces : []) {
    const bueno = enlaceValido(e, ids);
    if (!bueno) continue;
    const k = claveEnlace(bueno[0], bueno[1]);
    if (vistos.has(k)) continue;
    vistos.add(k);
    enlaces.push(bueno);
    if (enlaces.length >= MAX_ENLACES) break;
  }
  return {
    v: VERSION_CUADERNO,
    piezas,
    enlaces,
    emblema: limpiarEmblema(o.emblema),
    piel: pielValida(o.piel),
    vista: vistaValida(o.vista),
  };
}

export function nuevoCuaderno(): Cuaderno {
  return limpiar({}, Date.now());
}

// ─────────────────────────────── cambios (puros) ───────────────────────────────

export function poner(cuaderno: Cuaderno, crudo: unknown, ahora = Date.now()): Cuaderno {
  const p = limpiarPieza(crudo, ahora);
  if (!p) return cuaderno;
  if (cuaderno.piezas.some((x) => x.id === p.id)) return cuaderno;
  const piezas = [p, ...cuaderno.piezas].slice(0, MAX_PIEZAS);
  return { ...cuaderno, piezas };
}

export function editar(cuaderno: Cuaderno, id: string, cambios: Partial<Pieza>, ahora = Date.now()): Cuaderno {
  let tocado = false;
  const piezas = cuaderno.piezas.map((p) => {
    if (p.id !== id) return p;
    tocado = true;
    const mezcla = { ...p, ...cambios, id: p.id, creada: p.creada, tocada: ahora };
    const limpia = limpiarPieza(mezcla, ahora);
    return limpia ? { ...limpia, id: p.id, creada: p.creada, tocada: ahora, x: mezcla.x ?? p.x, y: mezcla.y ?? p.y } : p;
  });
  return tocado ? { ...cuaderno, piezas } : cuaderno;
}

export function quitar(cuaderno: Cuaderno, id: string): Cuaderno {
  return {
    ...cuaderno,
    piezas: cuaderno.piezas.filter((p) => p.id !== id),
    enlaces: cuaderno.enlaces.filter((e) => e[0] !== id && e[1] !== id),
  };
}

export function mover(cuaderno: Cuaderno, id: string, x: number, y: number): Cuaderno {
  const nx = Math.round(limitar(Number(x) || 50, 2, 98) * 10) / 10;
  const ny = Math.round(limitar(Number(y) || 50, 2, 98) * 10) / 10;
  return {
    ...cuaderno,
    piezas: cuaderno.piezas.map((p) => (p.id === id ? { ...p, x: nx, y: ny } : p)),
  };
}

export function marcar(cuaderno: Cuaderno, id: string, marca: Marca): Cuaderno {
  return editar(cuaderno, id, { marca: marcaValida(marca) });
}

export function alternarTarea(cuaderno: Cuaderno, id: string): Cuaderno {
  const p = cuaderno.piezas.find((x) => x.id === id);
  if (!p || p.tipo !== "tarea") return cuaderno;
  return editar(cuaderno, id, { hecha: !p.hecha });
}

export function etiquetar(cuaderno: Cuaderno, id: string, etiquetas: unknown): Cuaderno {
  return editar(cuaderno, id, { etiquetas: partirEtiquetas(etiquetas) });
}

export function enlazar(cuaderno: Cuaderno, a: string, b: string): Cuaderno {
  if (a === b) return cuaderno;
  const ids = new Set(cuaderno.piezas.map((p) => p.id));
  if (!ids.has(a) || !ids.has(b)) return cuaderno;
  const k = claveEnlace(a, b);
  if (cuaderno.enlaces.some((e) => claveEnlace(e[0], e[1]) === k)) return cuaderno;
  if (cuaderno.enlaces.length >= MAX_ENLACES) return cuaderno;
  return { ...cuaderno, enlaces: [...cuaderno.enlaces, a < b ? [a, b] : [b, a]] };
}

export function desenlazar(cuaderno: Cuaderno, a: string, b: string): Cuaderno {
  const k = claveEnlace(a, b);
  return { ...cuaderno, enlaces: cuaderno.enlaces.filter((e) => claveEnlace(e[0], e[1]) !== k) };
}

export function cambiarPiel(cuaderno: Cuaderno, piel: unknown): Cuaderno {
  return { ...cuaderno, piel: pielValida(piel, cuaderno.piel) };
}

export function cambiarVista(cuaderno: Cuaderno, vista: unknown): Cuaderno {
  return { ...cuaderno, vista: vistaValida(vista, cuaderno.vista) };
}

export function cambiarEmblema(cuaderno: Cuaderno, cambios: Partial<Emblema>): Cuaderno {
  return { ...cuaderno, emblema: limpiarEmblema({ ...cuaderno.emblema, ...cambios }) };
}

/** Órbita de ángulo áureo: cada pieza nueva cae en un hueco distinto. */
export function posicionOrbita(i: number): { x: number; y: number } {
  const a = (i * 137.508 * Math.PI) / 180 - Math.PI / 2;
  const rx = 32 + (i % 3) * 5;
  const ry = 30 + (i % 4) * 4;
  return { x: limitar(50 + rx * Math.cos(a), 8, 92), y: limitar(50 + ry * Math.sin(a), 8, 92) };
}

/** Reparte el tablero sin amontonar (mismo orden, posiciones nuevas). */
export function acomodar(cuaderno: Cuaderno): Cuaderno {
  return { ...cuaderno, piezas: cuaderno.piezas.map((p, i) => ({ ...p, ...posicionOrbita(i) })) };
}

// ─────────────────────────────── leer y buscar ───────────────────────────────

/** Sin tildes, sin mayúsculas: «Europa» y «europá» se encuentran. */
export function normalizar(t: unknown): string {
  return String(t ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type Filtro = { q?: string; tipo?: Tipo | "todo"; marca?: Marca | "todo"; etiqueta?: string | null; conLugar?: boolean };

export function filtrar(cuaderno: Cuaderno, f: Filtro = {}): Pieza[] {
  const q = normalizar(f.q);
  const palabras = q ? q.split(" ").filter(Boolean) : [];
  return cuaderno.piezas.filter((p) => {
    if (f.tipo && f.tipo !== "todo" && p.tipo !== f.tipo) return false;
    if (f.marca && f.marca !== "todo" && p.marca !== f.marca) return false;
    if (f.etiqueta && !p.etiquetas.includes(normalizar(f.etiqueta))) return false;
    if (f.conLugar && p.lat === undefined) return false;
    if (!palabras.length) return true;
    const heno = normalizar(
      [p.titulo, p.cuerpo, p.etiquetas.join(" "), p.lugar ?? "", p.fuente ?? "", TIPO_INFO[p.tipo].nombre].join(" ")
    );
    return palabras.every((w) => heno.includes(w));
  });
}

export function relacionadas(cuaderno: Cuaderno, id: string, tope = 5): Pieza[] {
  const base = cuaderno.piezas.find((p) => p.id === id);
  if (!base) return [];
  const suyas = new Set(base.etiquetas);
  return cuaderno.piezas
    .filter((p) => p.id !== id)
    .map((p) => {
      const comunes = p.etiquetas.filter((e) => suyas.has(e)).length;
      const enlazada = cuaderno.enlaces.some((e) => (e[0] === id && e[1] === p.id) || (e[1] === id && e[0] === p.id));
      return { p, peso: comunes * 2 + (enlazada ? 3 : 0) + (p.tipo === base.tipo ? 1 : 0) };
    })
    .filter((x) => x.peso > 0)
    .sort((a, b) => b.peso - a.peso || b.p.tocada - a.p.tocada)
    .slice(0, tope)
    .map((x) => x.p);
}

export function vecinasDeEnlace(cuaderno: Cuaderno, id: string): string[] {
  return cuaderno.enlaces
    .filter((e) => e[0] === id || e[1] === id)
    .map((e) => (e[0] === id ? e[1] : e[0]));
}

export type Cuenta = {
  piezas: number;
  porTipo: Record<Tipo, number>;
  porMarca: Record<Marca, number>;
  conLugar: number;
  conEnlace: number;
  tareasHechas: number;
  tareasTotal: number;
  etiquetas: { etiqueta: string; n: number }[];
  palabras: number;
  enlaces: number;
};

/** Cifras reales del cuaderno: se cuentan, no se estiman. */
export function cuenta(cuaderno: Cuaderno): Cuenta {
  const porTipo = Object.fromEntries(TIPOS.map((t) => [t, 0])) as Record<Tipo, number>;
  const porMarca = Object.fromEntries(MARCAS.map((m) => [m, 0])) as Record<Marca, number>;
  const etiquetas = new Map<string, number>();
  let conLugar = 0;
  let conEnlace = 0;
  let palabras = 0;
  let tareasHechas = 0;
  let tareasTotal = 0;
  for (const p of cuaderno.piezas) {
    porTipo[p.tipo] += 1;
    porMarca[p.marca] += 1;
    if (p.lat !== undefined && p.lng !== undefined) conLugar += 1;
    if (p.ruta) conEnlace += 1;
    palabras += `${p.titulo} ${p.cuerpo}`.split(/\s+/).filter(Boolean).length;
    if (p.tipo === "tarea") {
      tareasTotal += 1;
      if (p.hecha) tareasHechas += 1;
    }
    for (const e of p.etiquetas) etiquetas.set(e, (etiquetas.get(e) ?? 0) + 1);
  }
  return {
    piezas: cuaderno.piezas.length,
    porTipo,
    porMarca,
    conLugar,
    conEnlace,
    tareasHechas,
    tareasTotal,
    etiquetas: [...etiquetas.entries()]
      .map(([etiqueta, n]) => ({ etiqueta, n }))
      .sort((a, b) => b.n - a.n || a.etiqueta.localeCompare(b.etiqueta))
      .slice(0, 24),
    palabras,
    enlaces: cuaderno.enlaces.length,
  };
}

// ─────────────────────────────── texto rico ───────────────────────────────

export type Trozo = { texto: string; fuerte?: boolean; cursiva?: boolean; resaltado?: boolean; codigo?: boolean; href?: string };
export type Bloque = { tipo: "titulo" | "parrafo" | "lista" | "cita" | "tarea"; hecha?: boolean; trozos: Trozo[] };

const ENLACE_RE = /\[([^\]\n]{1,140})\]\(([^)\s]{1,400})\)/g;

/** Convierte el cuerpo (texto con marcas) en bloques tipados. Nunca HTML. */
export function formatear(cuerpo: unknown): Bloque[] {
  const texto = String(cuerpo ?? "").replace(/\r\n?/g, "\n");
  if (!texto.trim()) return [];
  const bloques: Bloque[] = [];
  for (const linea of texto.split("\n")) {
    const cruda = linea.replace(/\s+$/, "");
    if (!cruda.trim()) continue;
    let tipo: Bloque["tipo"] = "parrafo";
    let resto = cruda;
    let hecha: boolean | undefined;
    const tarea = resto.match(/^\s*[-*]\s*\[( |x|X)\]\s+(.*)$/);
    if (/^#{1,3}\s+/.test(resto)) {
      tipo = "titulo";
      resto = resto.replace(/^#{1,3}\s+/, "");
    } else if (tarea) {
      tipo = "tarea";
      hecha = tarea[1].toLowerCase() === "x";
      resto = tarea[2];
    } else if (/^\s*[-*]\s+/.test(resto)) {
      tipo = "lista";
      resto = resto.replace(/^\s*[-*]\s+/, "");
    } else if (/^>\s?/.test(resto)) {
      tipo = "cita";
      resto = resto.replace(/^>\s?/, "");
    }
    bloques.push({ tipo, ...(hecha === undefined ? {} : { hecha }), trozos: trocear(resto) });
  }
  return bloques;
}

/** **fuerte**, *cursiva*, ==resaltado==, `código`, [texto](href) — en ese orden. */
export function trocear(linea: string): Trozo[] {
  const trozos: Trozo[] = [];
  let resto = String(linea ?? "");
  const empujar = (t: Trozo) => {
    if (t.texto) trozos.push(t);
  };
  while (resto.length) {
    const m = resto.match(/\*\*([^*]+)\*\*|\*([^*]+)\*|==([^=]+)==|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/);
    if (!m || m.index === undefined) {
      empujar({ texto: resto });
      break;
    }
    if (m.index > 0) empujar({ texto: resto.slice(0, m.index) });
    if (m[1] !== undefined) empujar({ texto: m[1], fuerte: true });
    else if (m[2] !== undefined) empujar({ texto: m[2], cursiva: true });
    else if (m[3] !== undefined) empujar({ texto: m[3], resaltado: true });
    else if (m[4] !== undefined) empujar({ texto: m[4], codigo: true });
    else if (m[5] !== undefined) {
      const href = rutaSegura(m[6]);
      if (href) empujar({ texto: m[5], href });
      else empujar({ texto: `${m[5]} (${m[6]})` });
    }
    resto = resto.slice(m.index + m[0].length);
  }
  return trozos;
}

export type Senalado = { texto: string; desde: number; hasta: number };

/**
 * SEÑALAR: mete el tramo elegido entre ==…==. Si ya estaba señalado, lo
 * devuelve a texto normal. Devuelve también dónde queda la selección para
 * que el cursor no se pierda.
 */
export function senalar(cuerpo: string, desde: number, hasta: number): Senalado {
  const texto = String(cuerpo ?? "");
  const a = Math.max(0, Math.min(texto.length, Math.min(desde, hasta)));
  const b = Math.max(0, Math.min(texto.length, Math.max(desde, hasta)));
  if (a === b) return { texto, desde: a, hasta: b };
  const tramo = texto.slice(a, b);
  // ¿ya está dentro de un resaltado? (== delante y detrás)
  const antesDos = texto.slice(Math.max(0, a - 2), a);
  const despuesDos = texto.slice(b, b + 2);
  if (antesDos === "==" && despuesDos === "==") {
    return {
      texto: texto.slice(0, a - 2) + tramo + texto.slice(b + 2),
      desde: a - 2,
      hasta: b - 2,
    };
  }
  const limpio = tramo.replace(/==/g, "");
  return {
    texto: texto.slice(0, a) + `==${limpio}==` + texto.slice(b),
    desde: a + 2,
    hasta: a + 2 + limpio.length,
  };
}

/** El cuerpo sin marcas: lo que se copia, se cuenta y se lee en voz alta. */
export function textoPlano(cuerpo: unknown): string {
  return formatear(cuerpo)
    .map((b) => b.trozos.map((t) => t.texto).join(""))
    .join("\n");
}

/** Cuántas palabras y cuánto se tarda en leerlas (200 ppm, la media en español). */
export function lectura(cuerpo: unknown): { palabras: number; segundos: number } {
  const palabras = textoPlano(cuerpo).split(/\s+/).filter(Boolean).length;
  return { palabras, segundos: Math.round((palabras / 200) * 60) };
}

// ─────────────────────────────── exportar / importar ───────────────────────────────

export function aMarkdown(cuaderno: Cuaderno): string {
  const c = cuaderno;
  const n = cuenta(c);
  const lineas: string[] = [];
  lineas.push(`# EL CUADERNO · ${c.emblema.monograma}`);
  lineas.push("");
  lineas.push(`> ${c.emblema.lema}`);
  lineas.push("");
  lineas.push(
    `${n.piezas} piezas · ${n.enlaces} enlaces · ${n.conLugar} con lugar · ${n.palabras} palabras · piel: ${c.piel}`
  );
  for (const tipo of TIPOS) {
    const lista = c.piezas.filter((p) => p.tipo === tipo);
    if (!lista.length) continue;
    lineas.push("", `## ${TIPO_INFO[tipo].nombre} (${lista.length})`, "");
    for (const p of lista) {
      const marca = p.marca !== "ninguna" ? ` ${MARCA_INFO[p.marca].simbolo}` : "";
      lineas.push(`### ${p.titulo}${marca}`);
      if (p.cuerpo.trim()) lineas.push("", p.cuerpo.trim());
      const datos: string[] = [];
      if (p.etiquetas.length) datos.push(`etiquetas: ${p.etiquetas.map((e) => `#${e}`).join(" ")}`);
      if (p.fuente) datos.push(`fuente: ${p.fuente}`);
      if (p.ruta) datos.push(`enlace: ${p.ruta}`);
      if (p.lat !== undefined && p.lng !== undefined)
        datos.push(`lugar: ${p.lugar ? `${p.lugar} · ` : ""}${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}`);
      if (p.tipo === "tarea") datos.push(p.hecha ? "hecha: sí" : "hecha: no");
      if (datos.length) lineas.push("", datos.join(" · "));
      lineas.push("");
    }
  }
  if (c.enlaces.length) {
    lineas.push("## Hilos", "");
    const porId = new Map(c.piezas.map((p) => [p.id, p.titulo]));
    for (const [a, b] of c.enlaces) lineas.push(`- ${porId.get(a) ?? a} ↔ ${porId.get(b) ?? b}`);
  }
  return lineas.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function aJSON(cuaderno: Cuaderno): string {
  return JSON.stringify({ ...cuaderno, v: VERSION_CUADERNO }, null, 2);
}

/** Importa texto (JSON del cuaderno o el tablero viejo). Devuelve null si no es nada. */
export function desdeJSON(texto: unknown, ahora = Date.now()): Cuaderno | null {
  const t = String(texto ?? "").trim();
  if (!t) return null;
  let crudo: unknown;
  try {
    crudo = JSON.parse(t);
  } catch {
    return null;
  }
  const c = limpiar(crudo, ahora);
  if (!c.piezas.length && !crudo) return null;
  return c;
}

/** Une dos cuadernos sin pisar ids (para «traer» el tablero de la Zona Cero). */
export function fusionar(base: Cuaderno, otro: Cuaderno, ahora = Date.now()): Cuaderno {
  const ids = new Set(base.piezas.map((p) => p.id));
  const nuevas = otro.piezas
    .filter((p) => !ids.has(p.id))
    .map((p, i) => ({ ...p, x: posicionOrbita(base.piezas.length + i).x, y: posicionOrbita(base.piezas.length + i).y }));
  const mezcla: Cuaderno = {
    ...base,
    piezas: [...base.piezas, ...nuevas].slice(0, MAX_PIEZAS),
    enlaces: [...base.enlaces],
    emblema: base.emblema,
    piel: base.piel,
    vista: base.vista,
  };
  for (const [a, b] of otro.enlaces) {
    const con = enlazar(mezcla, a, b);
    mezcla.enlaces = con.enlaces;
  }
  return { ...mezcla, v: VERSION_CUADERNO };
}

/**
 * Migración del tablero de la Zona Cero (v2) al Cuaderno. No borra nada:
 * sólo lee lo que hubiera y lo convierte en piezas con nota propia.
 */
export function migrarZonaCero(crudo: unknown, ahora = Date.now()): Cuaderno {
  const o = (crudo ?? {}) as { piezas?: unknown; enlaces?: unknown };
  const piezas = (Array.isArray(o.piezas) ? o.piezas : []).map((x, i) => {
    const p = x as Record<string, unknown>;
    const pos = posicionOrbita(i);
    return limpiarPieza(
      {
        id: p.id,
        tipo: p.imagen ? "imagen" : p.ruta ? "enlace" : "nota",
        titulo: p.titulo,
        cuerpo: p.nota ?? "",
        etiquetas: [p.clase ?? "zona-cero"],
        tinta: "cian",
        ruta: p.ruta,
        imagen: p.imagen,
        fuente: p.fuente,
        x: p.x ?? pos.x,
        y: p.y ?? pos.y,
      },
      ahora
    );
  });
  return limpiar({ piezas: piezas.filter(Boolean), enlaces: Array.isArray(o.enlaces) ? o.enlaces : [], piel: "constelacion" }, ahora);
}

/** El cuaderno de ejemplo NO existe: la casa no inventa notas ajenas. */
export const SIN_PIEZAS: Pieza[] = [];

export const ES_PIEL = PIELES;
export const ES_TINTA = TINTAS;
export const ES_VISTA = VISTAS;
