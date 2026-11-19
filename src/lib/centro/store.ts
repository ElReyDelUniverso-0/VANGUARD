"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v419.1 · LA MEMORIA DEL OPERADOR — proyectos, historial y documentos
//
// DÓNDE VIVE LO GUARDADO, Y POR QUÉ AQUÍ:
// la BD de la casa en Vercel es efímera por diseño (cada instancia del lambda
// copia SQLite a /tmp y se lleva su copia; ver src/lib/db.ts). Guardar una
// investigación en servidor sería prometer una permanencia que no existe.
// Por eso lo guardado vive en el NAVEGADOR del operador (localStorage) — la
// ley de la casa desde v27 — y se puede EXPORTAR a .json para llevarlo a otro
// sitio o recuperarlo.
//
// Consecuencias honestas (la interfaz las dice):
//   · borrar los datos del navegador borra las investigaciones;
//   · no hay sincronización entre dispositivos;
//   · localStorage ronda los 5 MB: el texto de los documentos se recorta y, si
//     no cabe, se avisa en vez de fallar en silencio.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Documento,
  EntradaHistorial,
  Investigacion,
  InvestigacionGuardada,
  Proyecto,
} from "./tipos";

const K = {
  proyectos: "vg:centro:v1:proyectos",
  historial: "vg:centro:v1:historial",
  documentos: "vg:centro:v1:documentos",
};

/** localStorage puede no existir (SSR) o estar bloqueado (modo privado duro). */
function almacen(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const s = window.localStorage;
    const prueba = "__vg_centro__";
    s.setItem(prueba, "1");
    s.removeItem(prueba);
    return s;
  } catch {
    return null;
  }
}

export function hayAlmacen(): boolean {
  return almacen() !== null;
}

function leer<T>(clave: string, porDefecto: T): T {
  const s = almacen();
  if (!s) return porDefecto;
  try {
    const raw = s.getItem(clave);
    if (!raw) return porDefecto;
    return JSON.parse(raw) as T;
  } catch {
    return porDefecto;
  }
}

function escribir(clave: string, valor: unknown): { ok: boolean; error?: string } {
  const s = almacen();
  if (!s) return { ok: false, error: "Este navegador no permite guardar datos (modo privado)." };
  try {
    s.setItem(clave, JSON.stringify(valor));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "No queda espacio en el navegador (los documentos ocupan mucho). Borra alguno o exporta y limpia.",
    };
  }
}

export function nuevoId(prefijo: string): string {
  return `${prefijo}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// ── Proyectos ───────────────────────────────────────────────────────────

export function leerProyectos(): Proyecto[] {
  return leer<Proyecto[]>(K.proyectos, []);
}

export function guardarProyectos(p: Proyecto[]): { ok: boolean; error?: string } {
  return escribir(K.proyectos, p);
}

export function crearProyecto(nombre: string, descripcion = ""): Proyecto {
  const ahora = new Date().toISOString();
  const p: Proyecto = {
    id: nuevoId("pry"),
    nombre: nombre.trim().slice(0, 90) || "Proyecto sin nombre",
    descripcion: descripcion.trim().slice(0, 240),
    creado: ahora,
    actualizado: ahora,
    investigaciones: [],
  };
  const todos = leerProyectos();
  guardarProyectos([p, ...todos]);
  return p;
}

export function archivarInvestigacion(
  proyectoId: string,
  inv: Investigacion,
  documentos: { id: string; nombre: string }[] = [],
  notas = ""
): { ok: boolean; error?: string } {
  const todos = leerProyectos();
  const i = todos.findIndex((p) => p.id === proyectoId);
  if (i < 0) return { ok: false, error: "El proyecto no existe." };
  const g: InvestigacionGuardada = {
    id: nuevoId("inv"),
    titulo: inv.pregunta.slice(0, 120),
    investigacion: inv,
    documentos,
    guardado: new Date().toISOString(),
    notas,
    etiquetas: [],
  };
  todos[i] = {
    ...todos[i],
    actualizado: g.guardado,
    investigaciones: [g, ...todos[i].investigaciones],
  };
  const r = guardarProyectos(todos);
  if (!r.ok) return r;
  anadirHistorial({
    id: nuevoId("his"),
    pregunta: inv.pregunta.slice(0, 200),
    cuando: g.guardado,
    motor: inv.motor,
    nFuentes: inv.fuentes.length,
    confianza: inv.confianza,
    proyectoId,
  });
  return { ok: true };
}

export function borrarInvestigacion(proyectoId: string, invId: string): void {
  const todos = leerProyectos().map((p) =>
    p.id === proyectoId ? { ...p, investigaciones: p.investigaciones.filter((x) => x.id !== invId) } : p
  );
  guardarProyectos(todos);
}

export function borrarProyecto(id: string): void {
  guardarProyectos(leerProyectos().filter((p) => p.id !== id));
}

// ── Historial ───────────────────────────────────────────────────────────

export function leerHistorial(): EntradaHistorial[] {
  return leer<EntradaHistorial[]>(K.historial, []);
}

export function anadirHistorial(e: EntradaHistorial): void {
  const h = [e, ...leerHistorial()].slice(0, 60);
  escribir(K.historial, h);
}

export function borrarHistorial(): void {
  escribir(K.historial, []);
}

// ── Documentos (el texto vive aquí, no en el servidor) ───────────────────

const MAX_DOCS = 4;
const MAX_CHARS = 90_000;

export function leerDocumentos(): Documento[] {
  return leer<Documento[]>(K.documentos, []);
}

/** Guarda un documento recortando el texto si hace falta (y lo dice). */
export function guardarDocumento(doc: Documento): { ok: boolean; error?: string; recortado?: boolean } {
  const previos = leerDocumentos().filter((d) => d.id !== doc.id);
  const recortado = doc.texto.length > MAX_CHARS;
  const ligero: Documento = {
    ...doc,
    texto: doc.texto.slice(0, MAX_CHARS),
    // los trozos también se recortan para que el navegador no reviente
    trozos: doc.trozos.filter((t) => t.texto.length > 0).slice(0, 120),
  };
  const lista = [ligero, ...previos].slice(0, MAX_DOCS);
  const r = escribir(K.documentos, lista);
  return { ...r, recortado };
}

export function borrarDocumento(id: string): void {
  escribir(K.documentos, leerDocumentos().filter((d) => d.id !== id));
}

// ── Exportar / importar todo ────────────────────────────────────────────

export interface Volcado {
  formato: "vanguard-centro";
  version: 1;
  exportado: string;
  proyectos: Proyecto[];
  historial: EntradaHistorial[];
}

export function exportarTodo(): string {
  const v: Volcado = {
    formato: "vanguard-centro",
    version: 1,
    exportado: new Date().toISOString(),
    proyectos: leerProyectos(),
    historial: leerHistorial(),
  };
  return JSON.stringify(v, null, 2);
}

export function importarTodo(texto: string): { ok: boolean; proyectos?: number; error?: string } {
  try {
    const v = JSON.parse(texto) as Volcado;
    if (v?.formato !== "vanguard-centro" || !Array.isArray(v.proyectos)) {
      return { ok: false, error: "Ese archivo no es un volcado del Centro de Inteligencia." };
    }
    const actuales = leerProyectos();
    const ids = new Set(actuales.map((p) => p.id));
    const nuevos = v.proyectos.filter((p) => !ids.has(p.id));
    const r = guardarProyectos([...nuevos, ...actuales]);
    if (!r.ok) return { ok: false, error: r.error };
    if (Array.isArray(v.historial)) {
      const h = [...v.historial, ...leerHistorial()].slice(0, 60);
      escribir(K.historial, h);
    }
    return { ok: true, proyectos: nuevos.length };
  } catch {
    return { ok: false, error: "El archivo no es JSON válido." };
  }
}

/** Descarga un texto como archivo (Markdown, JSON…). */
export function descargar(nombre: string, contenido: string, mime = "text/markdown;charset=utf-8"): void {
  try {
    const blob = new Blob([contenido], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch {
    // sin descarga: el operador siempre puede copiar el texto del panel
  }
}

export async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}
