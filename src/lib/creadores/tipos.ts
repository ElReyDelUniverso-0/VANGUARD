// ═══════════════════════════════════════════════════════════════════
// v406.1 · LA FORJA — el ecosistema de creadores de VANGUARD
//
// No nace de cero: FUNDE lo que la casa ya tenía repartido por el cuartel
//   · UgcItem (v26)           → la OBRA (con sus clases mapa y escenario de v27/v101)
//   · UgcComment (v27)        → los comentarios, ahora con autor FIRMADO
//   · UgcVote kind=rating     → las valoraciones (1 por cuenta, nunca la propia)
//   · moderateUgc (v26)       → el agente moderador en cada publicación y versión
//   · fama (v104)             → la fórmula de reconocimiento, explicable
//   · ContribNotification     → el aviso al autor cuando se modera su obra
// y añade lo que faltaba: versiones, colecciones, reportes, roles y bitácora
// de moderación (tablas propias creadas con asegurarTabla, sin tocar custom.db).
//
// Este archivo es PURO: tipos, límites y validación. Sin BD, sin red.
// ═══════════════════════════════════════════════════════════════════

/** las cinco clases de obra que se publican desde La Forja */
export const CLASES = ["mapa", "escenario", "investigacion", "simulacion", "proyecto"] as const;
export type ClaseObra = (typeof CLASES)[number];

export type InfoClase = {
  id: ClaseObra;
  nombre: string;
  plural: string;
  verbo: string;
  color: string;
  /** qué pide el formulario además del texto */
  ayuda: string;
  /** sala de la casa donde la obra cobra vida */
  sala: { href: string; nombre: string };
};

export const INFO_CLASES: Record<ClaseObra, InfoClase> = {
  mapa: {
    id: "mapa",
    nombre: "Mapa",
    plural: "Mapas",
    verbo: "Traza",
    color: "#6ed6ff",
    ayuda: "Marca hasta 40 puntos (latitud, longitud y etiqueta). La casa los dibuja sobre el planeta.",
    sala: { href: "/mapas", nombre: "Centro de mapas" },
  },
  escenario: {
    id: "escenario",
    nombre: "Escenario",
    plural: "Escenarios",
    verbo: "Plantea",
    color: "#ff9f43",
    ayuda: "Un «¿y si…?»: la premisa, los supuestos de los que partes y lo que vigilarías. Nunca una predicción.",
    sala: { href: "/escenarios", nombre: "El Estratega" },
  },
  investigacion: {
    id: "investigacion",
    nombre: "Investigación",
    plural: "Investigaciones",
    verbo: "Documenta",
    color: "#3ddc97",
    ayuda: "Tu pregunta, lo que encontraste y LAS FUENTES. Sin al menos una fuente enlazada no se publica.",
    sala: { href: "/atlas", nombre: "Conocimiento" },
  },
  simulacion: {
    id: "simulacion",
    nombre: "Simulación",
    plural: "Simulaciones",
    verbo: "Modela",
    color: "#c084fc",
    ayuda: "Las variables con su valor y la regla que las une. Quien la abra puede repetirla en El Estratega.",
    sala: { href: "/escenarios", nombre: "El Estratega" },
  },
  proyecto: {
    id: "proyecto",
    nombre: "Proyecto",
    plural: "Proyectos",
    verbo: "Construye",
    color: "#e8c56a",
    ayuda: "El objetivo, los hitos (marcados o pendientes) y las obras o salas de la casa que lo forman.",
    sala: { href: "/objetivos", nombre: "Objetivos" },
  },
};

export const esClase = (x: unknown): x is ClaseObra => typeof x === "string" && (CLASES as readonly string[]).includes(x);

// ───────── límites (iguales en cliente y servidor)
export const LIM = {
  titulo: 90,
  resumen: 240,
  cuerpo: 12_000,
  nota: 160,
  comentario: 600,
  puntos: 40,
  fuentes: 12,
  variables: 16,
  hitos: 20,
  enlaces: 12,
  etiqueta: 48,
  coleccionTitulo: 70,
  coleccionDesc: 280,
  obrasPorColeccion: 60,
  motivo: 200,
} as const;

// ───────── datos estructurados por clase (viajan en UgcItem.specs como JSON)
export type Punto = { lat: number; lon: number; etiqueta: string };
export type Variable = { nombre: string; valor: number; unidad: string };
export type Hito = { texto: string; hecho: boolean };

export type Datos = {
  puntos?: Punto[];
  premisa?: string;
  supuestos?: string[];
  vigilar?: string[];
  pregunta?: string;
  fuentes?: string[];
  variables?: Variable[];
  regla?: string;
  objetivo?: string;
  hitos?: Hito[];
  /** rutas internas de la casa (/escenarios, /cuartel?sala=…) u obras (/creadores/obra/…) */
  enlaces?: string[];
};

const txt = (x: unknown, max: number) =>
  typeof x === "string" ? x.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max) : "";
const lineas = (x: unknown, max: number, largo = 200) =>
  (Array.isArray(x) ? x : typeof x === "string" ? x.split("\n") : [])
    .map((l) => txt(l, largo))
    .filter(Boolean)
    .slice(0, max);

/** una url pública http(s) — las fuentes de una investigación */
export function esUrlPublica(u: string): boolean {
  try {
    const x = new URL(u);
    if (x.protocol !== "https:" && x.protocol !== "http:") return false;
    const h = x.hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".local") || /^(0|10|127|192\.168|169\.254)\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
    return h.includes(".");
  } catch {
    return false;
  }
}

/** una ruta interna de la casa (nunca un enlace externo ni protocolo raro) */
export function esRutaInterna(u: string): boolean {
  return /^\/[a-z0-9\-/?=&_.%]*$/i.test(u) && !u.startsWith("//") && u.length <= 160;
}

/** limpia y valida los datos de una clase; devuelve los datos saneados o el error para el autor */
export function sanearDatos(clase: ClaseObra, x: unknown): { datos: Datos; error: string | null } {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
  const enlaces = lineas(o.enlaces, LIM.enlaces, 160).filter(esRutaInterna);
  const d: Datos = { enlaces };
  switch (clase) {
    case "mapa": {
      const pts = (Array.isArray(o.puntos) ? o.puntos : [])
        .map((p) => p as Record<string, unknown>)
        .map((p) => ({ lat: Number(p.lat), lon: Number(p.lon), etiqueta: txt(p.etiqueta, LIM.etiqueta) }))
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180 && p.etiqueta)
        .slice(0, LIM.puntos)
        .map((p) => ({ ...p, lat: Math.round(p.lat * 1e4) / 1e4, lon: Math.round(p.lon * 1e4) / 1e4 }));
      d.puntos = pts;
      if (!pts.length) return { datos: d, error: "Un mapa necesita al menos un punto con latitud, longitud y etiqueta." };
      break;
    }
    case "escenario": {
      d.premisa = txt(o.premisa, 300);
      d.supuestos = lineas(o.supuestos, 10);
      d.vigilar = lineas(o.vigilar, 10);
      if (d.premisa.length < 10) return { datos: d, error: "Escribe la premisa del escenario («¿Y si…?»)." };
      if (!d.supuestos.length) return { datos: d, error: "Un escenario necesita al menos un supuesto declarado." };
      break;
    }
    case "investigacion": {
      d.pregunta = txt(o.pregunta, 300);
      d.fuentes = lineas(o.fuentes, LIM.fuentes, 400).filter(esUrlPublica);
      if (d.pregunta.length < 10) return { datos: d, error: "Escribe la pregunta que investigas." };
      if (!d.fuentes.length) return { datos: d, error: "Una investigación necesita al menos una fuente pública enlazada (https://…)." };
      break;
    }
    case "simulacion": {
      d.variables = (Array.isArray(o.variables) ? o.variables : [])
        .map((v) => v as Record<string, unknown>)
        .map((v) => ({ nombre: txt(v.nombre, 48), valor: Number(v.valor), unidad: txt(v.unidad, 16) }))
        .filter((v) => v.nombre && Number.isFinite(v.valor))
        .slice(0, LIM.variables);
      d.regla = txt(o.regla, 600);
      if (d.variables.length < 2) return { datos: d, error: "Una simulación necesita al menos dos variables con su valor." };
      if (d.regla.length < 10) return { datos: d, error: "Explica la regla que une las variables." };
      break;
    }
    case "proyecto": {
      d.objetivo = txt(o.objetivo, 300);
      d.hitos = (Array.isArray(o.hitos) ? o.hitos : [])
        .map((h) => h as Record<string, unknown>)
        .map((h) => ({ texto: txt(h.texto, 140), hecho: h.hecho === true }))
        .filter((h) => h.texto)
        .slice(0, LIM.hitos);
      if (d.objetivo.length < 10) return { datos: d, error: "Escribe el objetivo del proyecto." };
      if (!d.hitos.length) return { datos: d, error: "Un proyecto necesita al menos un hito." };
      break;
    }
  }
  return { datos: d, error: null };
}

export type EntradaObra = { clase: ClaseObra; titulo: string; resumen: string; cuerpo: string; datos: Datos; etiquetas: string[] };

/** valida lo que llega del formulario; mismo veredicto en cliente y servidor */
export function validarObra(x: unknown): { obra: EntradaObra | null; error: string | null } {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
  if (!esClase(o.clase)) return { obra: null, error: "Elige qué publicas: mapa, escenario, investigación, simulación o proyecto." };
  const titulo = txt(o.titulo, LIM.titulo).replace(/\s+/g, " ");
  const resumen = txt(o.resumen, LIM.resumen).replace(/\s+/g, " ");
  const cuerpo = txt(o.cuerpo, LIM.cuerpo);
  if (titulo.length < 4) return { obra: null, error: "El título necesita al menos 4 caracteres." };
  if (resumen.length < 12) return { obra: null, error: "Escribe un resumen de al menos 12 caracteres: es lo que verá la gente en la vitrina." };
  const { datos, error } = sanearDatos(o.clase, o.datos);
  if (error) return { obra: null, error };
  const etiquetas = lineas(o.etiquetas, 6, 24)
    .flatMap((l) => l.split(","))
    .map((e) => e.trim().toLowerCase().replace(/[^a-z0-9áéíóúñü\- ]/gi, ""))
    .filter((e) => e.length >= 2)
    .slice(0, 6);
  return { obra: { clase: o.clase, titulo, resumen, cuerpo, datos, etiquetas: [...new Set(etiquetas)] }, error: null };
}

/** cuánto cambió una versión respecto a la anterior (para la línea de tiempo) */
export function cambioEntre(a: { titulo: string; resumen: string; cuerpo: string; datos: string }, b: { titulo: string; resumen: string; cuerpo: string; datos: string }): string[] {
  const out: string[] = [];
  if (a.titulo !== b.titulo) out.push("título");
  if (a.resumen !== b.resumen) out.push("resumen");
  if (a.cuerpo !== b.cuerpo) {
    const d = b.cuerpo.length - a.cuerpo.length;
    out.push(d === 0 ? "texto" : `texto (${d > 0 ? "+" : ""}${d} caracteres)`);
  }
  if (a.datos !== b.datos) out.push("datos");
  return out;
}

/** media de valoraciones con un decimal; null si nadie votó */
export function media(suma: number, n: number): number | null {
  return n > 0 ? Math.round((suma / n) * 10) / 10 : null;
}

/**
 * la proyección con la que está dibujado /mapa-mundo.svg (copia de
 * src/lib/world-paths.json → proj; no se importa ese JSON en el cliente porque
 * pesa 166 KB). scripts/pruebas-forja.mjs comprueba que sigan iguales.
 */
export const PROYECCION_MUNDO = {
  rotate: [-10, 0] as [number, number],
  center: [0, 20] as [number, number],
  scale: 155,
  translate: [500, 295] as [number, number],
};

/** proyección equirectangular de un punto a un lienzo w×h (el mini-mapa) */
export function proyectar(p: { lat: number; lon: number }, w: number, h: number): { x: number; y: number } {
  return { x: ((p.lon + 180) / 360) * w, y: ((90 - p.lat) / 180) * h };
}
