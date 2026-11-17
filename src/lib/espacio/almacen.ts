// ═══════════════════════════════════════════════════════════════════
// v405.11 · EL ALMACÉN DEL ESPACIO DE TRABAJO — lógica pura, sin React
//
// LA AUDITORÍA (lo que había, medido en el repo): la personalización y lo
// guardado de la casa vivía repartido en CUATRO almacenes que no se hablaban:
//   · `vg171-favoritos` (favoritos-store.ts) — los módulos fijados en el riel;
//   · `vx405.10-navegacion` (navegacion/paneles.ts) — el orden de las
//     herramientas por espacio;
//   · `vg195-atajos-usage` (lib/nav.ts) — el uso real de cada sala;
//   · `vanguard:…` de game-store / perfil-jugador / profile-store — progreso,
//     carnet y personalización del perfil.
// Y ni un solo sitio donde meter un TRABAJO: una investigación, un mapa
// favorito, un escenario, una lista de herramientas para una misión.
//
// ESTE ARCHIVO es ese sitio, y no sustituye a nadie: lee los almacenes viejos
// para sembrar el primer proyecto (`migrarLegado`) y no borra nada.
//
// Todo son funciones puras salvo `cargar`/`guardar`, que fallan en silencio.
// Por eso las pruebas de node pueden ejercitar el almacén entero sin navegador.
// ═══════════════════════════════════════════════════════════════════

export const CLAVE_ESPACIO = "vx405.11-espacio";
export const CLAVE_FAVORITOS = "vg171-favoritos";
export const CLAVE_USO = "vg195-atajos-usage";
/** máximo de instantáneas para deshacer (recuperación del trabajo) */
export const MAX_HISTORIAL = 25;
/** máximo de acciones visibles en el historial de actividad */
export const MAX_ACTIVIDAD = 120;

export type ClaseElemento =
  | "mapa"
  | "simulacion"
  | "escenario"
  | "herramienta"
  | "investigacion"
  | "nota"
  | "enlace";

export const CLASES: { clave: ClaseElemento; nombre: string; color: string; icono: string }[] = [
  { clave: "mapa", nombre: "Mapas", color: "#5eead4", icono: "layers" },
  { clave: "simulacion", nombre: "Simulaciones", color: "#f5a623", icono: "crosshair" },
  { clave: "escenario", nombre: "Escenarios", color: "#f472b6", icono: "flask-conical" },
  { clave: "herramienta", nombre: "Herramientas", color: "#3ddcff", icono: "wrench" },
  { clave: "investigacion", nombre: "Investigaciones", color: "#a78bfa", icono: "search" },
  { clave: "nota", nombre: "Notas", color: "#e8c56a", icono: "notebook-pen" },
  { clave: "enlace", nombre: "Enlaces", color: "#94a3b8", icono: "arrow" },
];

export type Elemento = {
  id: string;
  clase: ClaseElemento;
  titulo: string;
  /** a dónde lleva; vacío en una nota suelta */
  href?: string;
  nota?: string;
  etiquetas: string[];
  creado: string;
  ultimoUso?: string;
  /** 0 = normal; 1 = fijado arriba del panel */
  fijado?: boolean;
  /** viene del almacén viejo (favoritos / uso): se marca para no duplicar */
  origen?: "favoritos" | "uso" | "registro" | "manual" | "importado";
};

export type PanelId = "elementos" | "accesos" | "actividad" | "sesiones" | "recuperar" | "papelera";

export const PANELES: { clave: PanelId; nombre: string; desc: string }[] = [
  { clave: "elementos", nombre: "El trabajo", desc: "Las piezas del proyecto: mapas, simulaciones, escenarios, notas…" },
  { clave: "accesos", nombre: "Accesos", desc: "Las herramientas de la casa para este proyecto" },
  { clave: "sesiones", nombre: "Sesiones", desc: "Dónde lo dejaste, con su fecha: se continúa de un toque" },
  { clave: "actividad", nombre: "Actividad", desc: "Qué has hecho aquí, en orden" },
  { clave: "recuperar", nombre: "Recuperar", desc: "Deshacer pasos y volver a un estado anterior" },
  { clave: "papelera", nombre: "Papelera", desc: "Lo que quitaste: se restaura, no se pierde" },
];

export type Proyecto = {
  id: string;
  nombre: string;
  lema: string;
  color: string;
  creado: string;
  actualizado: string;
  elementos: Elemento[];
  /** orden de los paneles de ESTE proyecto (configurable) */
  paneles: PanelId[];
  ocultos: PanelId[];
  /** a dónde volver al continuar el proyecto */
  ultimaRuta?: string;
  archivado?: boolean;
};

export type SesionGuardada = {
  id: string;
  nombre: string;
  ts: string;
  proyectoId: string;
  /** copia congelada de los elementos del proyecto en ese momento */
  elementos: Elemento[];
  paneles: PanelId[];
  ultimaRuta?: string;
};

export type Actividad = {
  id: string;
  ts: string;
  tipo: "crear" | "editar" | "añadir" | "quitar" | "mover" | "abrir" | "sesion" | "importar" | "restaurar" | "migrar";
  detalle: string;
  proyectoId?: string;
};

/** Lo quitado de un proyecto: no se borra, se aparca aquí. */
export type PapeleraItem = { proyectoId: string; elemento: Elemento; ts: string };

export type Instantanea = {
  proyectos: Proyecto[];
  activo: string;
  sesiones: SesionGuardada[];
  actividad: Actividad[];
  papelera: PapeleraItem[];
};

export type EstadoEspacio = Instantanea & {
  version: 1;
  historial: { ts: string; etiqueta: string; estado: Instantanea }[];
  migrado: string | null;
};

// ─────────────────────────── utilidades ──────────────────────────────────
const ahora = () => new Date().toISOString();
let contador = 0;
const nid = (p: string) => `${p}-${Date.now().toString(36)}-${(contador++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export function proyectoVacio(nombre = "Mi primer proyecto", color = "#5eead4"): Proyecto {
  const ts = ahora();
  return {
    id: nid("pr"),
    nombre,
    lema: "",
    color,
    creado: ts,
    actualizado: ts,
    elementos: [],
    paneles: PANELES.map((p) => p.clave),
    ocultos: [],
  };
}

export function estadoInicial(): EstadoEspacio {
  const p = proyectoVacio("Mi primer proyecto", "#5eead4");
  return {
    version: 1,
    proyectos: [p],
    activo: p.id,
    sesiones: [],
    actividad: [],
    papelera: [],
    historial: [],
    migrado: null,
  };
}

const instantanea = (e: EstadoEspacio): Instantanea => ({
  proyectos: e.proyectos,
  activo: e.activo,
  sesiones: e.sesiones,
  actividad: e.actividad,
  papelera: e.papelera,
});

const conActividad = (e: EstadoEspacio, tipo: Actividad["tipo"], detalle: string, proyectoId?: string): EstadoEspacio => ({
  ...e,
  actividad: [{ id: nid("ac"), ts: ahora(), tipo, detalle, proyectoId }, ...e.actividad].slice(0, MAX_ACTIVIDAD),
});

/** Guarda una instantánea ANTES de tocar nada: de ahí sale el deshacer. */
function conHistorial(e: EstadoEspacio, etiqueta: string): EstadoEspacio {
  return {
    ...e,
    historial: [{ ts: ahora(), etiqueta, estado: instantanea(e) }, ...e.historial].slice(0, MAX_HISTORIAL),
  };
}

/** Toda mutación pasa por aquí: historial + actividad + fecha del proyecto. */
function mutar(
  estado: EstadoEspacio,
  etiqueta: string,
  tipo: Actividad["tipo"],
  proyectoId: string | undefined,
  fn: (e: EstadoEspacio) => EstadoEspacio,
): EstadoEspacio {
  const base = conHistorial(estado, etiqueta);
  const siguiente = fn(base);
  return conActividad(siguiente, tipo, etiqueta, proyectoId);
}

export function proyectoActivo(e: EstadoEspacio): Proyecto {
  return e.proyectos.find((p) => p.id === e.activo) ?? e.proyectos[0] ?? proyectoVacio();
}

// ─────────────────────────── proyectos ───────────────────────────────────
export function crearProyecto(e: EstadoEspacio, nombre: string, color = "#5eead4"): EstadoEspacio {
  const p = proyectoVacio(nombre.trim() || "Proyecto sin nombre", color);
  return conActividad(
    { ...conHistorial(e, `crear el proyecto «${p.nombre}»`), proyectos: [...e.proyectos, p], activo: p.id },
    "crear",
    `crear el proyecto «${p.nombre}»`,
    p.id,
  );
}

export function abrirProyecto(e: EstadoEspacio, id: string): EstadoEspacio {
  if (!e.proyectos.some((p) => p.id === id)) return e;
  const p = e.proyectos.find((x) => x.id === id)!;
  return conActividad({ ...e, activo: id }, "abrir", `abrir «${p.nombre}»`, id);
}

export function editarProyecto(e: EstadoEspacio, id: string, cambios: Partial<Pick<Proyecto, "nombre" | "lema" | "color" | "ultimaRuta">>): EstadoEspacio {
  return mutar(e, "editar el proyecto", "editar", id, (x) => ({
    ...x,
    proyectos: x.proyectos.map((p) => (p.id === id ? { ...p, ...cambios, actualizado: ahora() } : p)),
  }));
}

/** Archivar NO borra: el proyecto sale de la lista y se puede recuperar. */
export function archivarProyecto(e: EstadoEspacio, id: string): EstadoEspacio {
  return mutar(e, "archivar el proyecto", "editar", id, (x) => {
    const proyectos = x.proyectos.map((p) => (p.id === id ? { ...p, archivado: true, actualizado: ahora() } : p));
    const vivos = proyectos.filter((p) => !p.archivado);
    return { ...x, proyectos, activo: x.activo === id ? (vivos[0]?.id ?? id) : x.activo };
  });
}

export function recuperarProyecto(e: EstadoEspacio, id: string): EstadoEspacio {
  return mutar(e, "recuperar el proyecto", "restaurar", id, (x) => ({
    ...x,
    proyectos: x.proyectos.map((p) => (p.id === id ? { ...p, archivado: false, actualizado: ahora() } : p)),
    activo: id,
  }));
}

// ─────────────────────────── elementos ───────────────────────────────────
export function añadirElemento(
  e: EstadoEspacio,
  proyectoId: string,
  datos: Pick<Elemento, "clase" | "titulo"> & Partial<Pick<Elemento, "href" | "nota" | "etiquetas" | "origen">>,
): EstadoEspacio {
  const el: Elemento = {
    id: nid("el"),
    clase: datos.clase,
    titulo: datos.titulo.trim() || "Sin título",
    href: datos.href,
    nota: datos.nota,
    etiquetas: datos.etiquetas ?? [],
    creado: ahora(),
    origen: datos.origen ?? "manual",
  };
  return mutar(e, `añadir «${el.titulo}»`, "añadir", proyectoId, (x) => ({
    ...x,
    proyectos: x.proyectos.map((p) =>
      p.id === proyectoId ? { ...p, elementos: [...p.elementos, el], actualizado: ahora() } : p,
    ),
  }));
}

export function quitarElemento(e: EstadoEspacio, proyectoId: string, elementoId: string): EstadoEspacio {
  const p = e.proyectos.find((x) => x.id === proyectoId);
  const el = p?.elementos.find((x) => x.id === elementoId);
  if (!el) return e;
  // no se borra: sale del proyecto y queda en la papelera (restaurable)
  return mutar(e, `quitar «${el.titulo}»`, "quitar", proyectoId, (x) => ({
    ...x,
    proyectos: x.proyectos.map((pr) =>
      pr.id === proyectoId
        ? { ...pr, elementos: pr.elementos.filter((it) => it.id !== elementoId), actualizado: ahora() }
        : pr,
    ),
    // la pieza NO se destruye: se aparca en la papelera con su proyecto
    papelera: [{ proyectoId, elemento: el, ts: ahora() }, ...x.papelera].slice(0, 60),
  }));
}

export function restaurarElemento(e: EstadoEspacio, proyectoId: string, elemento: Elemento): EstadoEspacio {
  return mutar(e, `restaurar «${elemento.titulo}»`, "restaurar", proyectoId, (x) => ({
    ...x,
    proyectos: x.proyectos.map((p) =>
      p.id === proyectoId && !p.elementos.some((it) => it.id === elemento.id)
        ? { ...p, elementos: [...p.elementos, elemento], actualizado: ahora() }
        : p,
    ),
    papelera: x.papelera.filter((it) => it.elemento.id !== elemento.id),
  }));
}

/** Restaurar desde la papelera (sin saber el proyecto de origen). */
export function restaurarDePapelera(e: EstadoEspacio, elementoId: string): EstadoEspacio {
  const item = e.papelera.find((x) => x.elemento.id === elementoId);
  if (!item) return e;
  return restaurarElemento(e, item.proyectoId, item.elemento);
}

export function vaciarPapelera(e: EstadoEspacio): EstadoEspacio {
  return mutar(e, "vaciar la papelera", "quitar", undefined, (x) => ({ ...x, papelera: [] }));
}

export function fijarElemento(e: EstadoEspacio, proyectoId: string, elementoId: string): EstadoEspacio {
  return mutar(e, "fijar una pieza", "editar", proyectoId, (x) => ({
    ...x,
    proyectos: x.proyectos.map((p) =>
      p.id === proyectoId
        ? { ...p, elementos: p.elementos.map((el) => (el.id === elementoId ? { ...el, fijado: !el.fijado } : el)), actualizado: ahora() }
        : p,
    ),
  }));
}

export function marcarUso(e: EstadoEspacio, proyectoId: string, elementoId: string): EstadoEspacio {
  return {
    ...e,
    proyectos: e.proyectos.map((p) =>
      p.id === proyectoId
        ? { ...p, elementos: p.elementos.map((el) => (el.id === elementoId ? { ...el, ultimoUso: ahora() } : el)) }
        : p,
    ),
  };
}

/** Las piezas del proyecto, fijadas primero y luego por último uso. */
export function elementosOrdenados(p: Proyecto, filtro?: ClaseElemento): Elemento[] {
  // el índice desempata: dos piezas creadas en el mismo milisegundo se
  // ordenan por «la última que añadiste, arriba» (no por orden de inserción).
  return p.elementos
    .map((el, i) => ({ el, i }))
    .filter(({ el }) => !filtro || el.clase === filtro)
    .sort((a, b) => {
      if (!!b.el.fijado !== !!a.el.fijado) return b.el.fijado ? 1 : -1;
      const fa = a.el.ultimoUso ?? a.el.creado;
      const fb = b.el.ultimoUso ?? b.el.creado;
      return fb.localeCompare(fa) || b.i - a.i;
    })
    .map(({ el }) => el);
}

// ─────────────────────────── paneles ─────────────────────────────────────
export function moverPanel(e: EstadoEspacio, proyectoId: string, panel: PanelId, dir: -1 | 1): EstadoEspacio {
  return mutar(e, "mover un panel", "mover", proyectoId, (x) => ({
    ...x,
    proyectos: x.proyectos.map((p) => {
      if (p.id !== proyectoId) return p;
      const i = p.paneles.indexOf(panel);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= p.paneles.length) return p;
      const paneles = p.paneles.slice();
      [paneles[i], paneles[j]] = [paneles[j], paneles[i]];
      return { ...p, paneles, actualizado: ahora() };
    }),
  }));
}

export function alternarPanel(e: EstadoEspacio, proyectoId: string, panel: PanelId): EstadoEspacio {
  return mutar(e, "encender o apagar un panel", "editar", proyectoId, (x) => ({
    ...x,
    proyectos: x.proyectos.map((p) =>
      p.id === proyectoId
        ? {
            ...p,
            ocultos: p.ocultos.includes(panel) ? p.ocultos.filter((q) => q !== panel) : [...p.ocultos, panel],
            actualizado: ahora(),
          }
        : p,
    ),
  }));
}

export function panelesVisibles(p: Proyecto): PanelId[] {
  return p.paneles.filter((q) => !p.ocultos.includes(q));
}

// ─────────────────────────── sesiones ────────────────────────────────────
export function guardarSesion(e: EstadoEspacio, nombre?: string): EstadoEspacio {
  const p = proyectoActivo(e);
  const s: SesionGuardada = {
    id: nid("se"),
    nombre: nombre?.trim() || `Sesión del ${new Date().toLocaleString("es-DO", { dateStyle: "short", timeStyle: "short" })}`,
    ts: ahora(),
    proyectoId: p.id,
    elementos: p.elementos,
    paneles: p.paneles,
    ultimaRuta: p.ultimaRuta,
  };
  return conActividad(
    { ...conHistorial(e, "guardar una sesión"), sesiones: [s, ...e.sesiones].slice(0, 30) },
    "sesion",
    `guardar la sesión «${s.nombre}»`,
    p.id,
  );
}

export function abrirSesion(e: EstadoEspacio, sesionId: string): EstadoEspacio {
  const s = e.sesiones.find((x) => x.id === sesionId);
  if (!s) return e;
  return conActividad(
    {
      ...conHistorial(e, `continuar «${s.nombre}»`),
      proyectos: e.proyectos.map((p) =>
        p.id === s.proyectoId ? { ...p, elementos: s.elementos, paneles: s.paneles, actualizado: ahora() } : p,
      ),
      activo: s.proyectoId,
    },
    "sesion",
    `continuar la sesión «${s.nombre}»`,
    s.proyectoId,
  );
}

export function borrarSesion(e: EstadoEspacio, sesionId: string): EstadoEspacio {
  return mutar(e, "borrar una sesión guardada", "quitar", undefined, (x) => ({
    ...x,
    sesiones: x.sesiones.filter((s) => s.id !== sesionId),
  }));
}

// ─────────────────────────── recuperación ────────────────────────────────
export function deshacer(e: EstadoEspacio): EstadoEspacio {
  const [ultima, ...resto] = e.historial;
  if (!ultima) return e;
  return {
    ...ultima.estado,
    version: 1,
    historial: resto,
    migrado: e.migrado,
  };
}

export function puedeDeshacer(e: EstadoEspacio): boolean {
  return e.historial.length > 0;
}

// ─────────────────────────── exportar / importar ─────────────────────────
export function exportar(e: EstadoEspacio, proyectoId?: string): string {
  const proyectos = proyectoId ? e.proyectos.filter((p) => p.id === proyectoId) : e.proyectos;
  return JSON.stringify(
    { app: "vanguard", tipo: "espacio-trabajo", version: 1, ts: ahora(), proyectos, sesiones: e.sesiones, papelera: e.papelera },
    null,
    1,
  );
}

/**
 * Importar es ADITIVO: nunca pisa lo que hay. Los ids se regeneran para que
 * dos importaciones del mismo archivo no choquen.
 */
export function importar(e: EstadoEspacio, json: string): { estado: EstadoEspacio; añadidos: number; error?: string } {
  let datos: unknown;
  try {
    datos = JSON.parse(json);
  } catch {
    return { estado: e, añadidos: 0, error: "El archivo no es JSON válido" };
  }
  const d = datos as { proyectos?: unknown };
  if (!d || !Array.isArray(d.proyectos)) return { estado: e, añadidos: 0, error: "El archivo no trae proyectos" };
  const nuevos: Proyecto[] = [];
  for (const bruto of d.proyectos as Partial<Proyecto>[]) {
    if (!bruto || typeof bruto !== "object") continue;
    const base = proyectoVacio(typeof bruto.nombre === "string" ? bruto.nombre : "Proyecto importado", typeof bruto.color === "string" ? bruto.color : "#5eead4");
    nuevos.push({
      ...base,
      lema: typeof bruto.lema === "string" ? bruto.lema : "",
      elementos: Array.isArray(bruto.elementos)
        ? (bruto.elementos as Elemento[])
            .filter((el) => el && typeof el.titulo === "string" && CLASES.some((c) => c.clave === el.clase))
            .map((el) => ({ ...el, id: nid("el"), origen: "importado" as const }))
        : [],
      paneles: Array.isArray(bruto.paneles)
        ? (bruto.paneles as PanelId[]).filter((q) => PANELES.some((p) => p.clave === q))
        : base.paneles,
    });
  }
  if (!nuevos.length) return { estado: e, añadidos: 0, error: "No había proyectos legibles" };
  return {
    estado: conActividad(
      { ...conHistorial(e, "importar un espacio"), proyectos: [...e.proyectos, ...nuevos] },
      "importar",
      `importar ${nuevos.length} proyecto(s)`,
      nuevos[0].id,
    ),
    añadidos: nuevos.length,
  };
}

// ─────────────────────────── migración del legado ────────────────────────
export type Legado = { favoritos?: string[]; uso?: Record<string, number> };

/**
 * Siembra el primer proyecto con lo que YA había en los almacenes viejos:
 * los favoritos del riel y las salas más usadas. Es idempotente (se marca
 * `migrado`) y NO borra ni modifica esos almacenes.
 */
export function migrarLegado(e: EstadoEspacio, legado: Legado): EstadoEspacio {
  if (e.migrado) return e;
  const favoritos = Array.isArray(legado.favoritos) ? legado.favoritos.slice(0, 24) : [];
  const uso = legado.uso && typeof legado.uso === "object" ? legado.uso : {};
  const usadas = Object.entries(uso)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 8)
    .map(([k]) => k);
  const yaEsta = new Set(e.proyectos.flatMap((p) => p.elementos.map((el) => `${el.origen}:${el.href ?? el.titulo}`)));
  const nuevos: Elemento[] = [];
  for (const clave of favoritos) {
    const marca = `favoritos:/cuartel?sala=${clave}`;
    if (yaEsta.has(marca)) continue;
    nuevos.push({
      id: nid("el"),
      clase: "herramienta",
      titulo: `Sala favorita: ${clave}`,
      href: `/cuartel?sala=${clave}`,
      etiquetas: ["favorito", "riel"],
      creado: ahora(),
      origen: "favoritos",
    });
  }
  for (const clave of usadas) {
    const marca = `uso:/cuartel?sala=${clave}`;
    if (yaEsta.has(marca) || favoritos.includes(clave)) continue;
    nuevos.push({
      id: nid("el"),
      clase: "herramienta",
      titulo: `Sala que más usas: ${clave}`,
      href: `/cuartel?sala=${clave}`,
      etiquetas: ["uso", `${uso[clave]} visitas`],
      creado: ahora(),
      origen: "uso",
    });
  }
  if (!nuevos.length) return { ...e, migrado: ahora() };
  const p = proyectoActivo(e);
  return conActividad(
    {
      ...conHistorial(e, "traer tus favoritos al espacio"),
      migrado: ahora(),
      proyectos: e.proyectos.map((x) =>
        x.id === p.id ? { ...x, elementos: [...x.elementos, ...nuevos], actualizado: ahora() } : x,
      ),
    },
    "migrar",
    `traer ${nuevos.length} piezas de tus favoritos y tu uso`,
    p.id,
  );
}

// ─────────────────────────── saneado ─────────────────────────────────────
const esPanel = (x: unknown): x is PanelId => PANELES.some((p) => p.clave === x);
const esClase = (x: unknown): x is ClaseElemento => CLASES.some((c) => c.clave === x);

function sanearElemento(bruto: unknown): Elemento | null {
  if (!bruto || typeof bruto !== "object") return null;
  const e = bruto as Partial<Elemento>;
  if (!esClase(e.clase) || typeof e.titulo !== "string") return null;
  return {
    id: typeof e.id === "string" ? e.id : nid("el"),
    clase: e.clase,
    titulo: e.titulo.slice(0, 240),
    href: typeof e.href === "string" && e.href.startsWith("/") ? e.href : undefined,
    nota: typeof e.nota === "string" ? e.nota.slice(0, 4000) : undefined,
    etiquetas: Array.isArray(e.etiquetas) ? e.etiquetas.filter((t) => typeof t === "string").slice(0, 8) : [],
    creado: typeof e.creado === "string" ? e.creado : ahora(),
    ultimoUso: typeof e.ultimoUso === "string" ? e.ultimoUso : undefined,
    fijado: !!e.fijado,
    origen: e.origen,
  };
}

export function sanear(bruto: unknown): EstadoEspacio {
  const base = estadoInicial();
  if (!bruto || typeof bruto !== "object") return base;
  const b = bruto as Partial<EstadoEspacio>;
  if (!Array.isArray(b.proyectos) || !b.proyectos.length) return base;
  const proyectos: Proyecto[] = [];
  for (const pb of b.proyectos as Partial<Proyecto>[]) {
    if (!pb || typeof pb !== "object") continue;
    const paneles = Array.isArray(pb.paneles) ? pb.paneles.filter(esPanel) : [];
    const faltan = PANELES.map((p) => p.clave).filter((q) => !paneles.includes(q));
    proyectos.push({
      id: typeof pb.id === "string" ? pb.id : nid("pr"),
      nombre: typeof pb.nombre === "string" && pb.nombre.trim() ? pb.nombre.slice(0, 120) : "Proyecto",
      lema: typeof pb.lema === "string" ? pb.lema.slice(0, 240) : "",
      color: typeof pb.color === "string" ? pb.color : "#5eead4",
      creado: typeof pb.creado === "string" ? pb.creado : ahora(),
      actualizado: typeof pb.actualizado === "string" ? pb.actualizado : ahora(),
      elementos: Array.isArray(pb.elementos) ? pb.elementos.map(sanearElemento).filter((x): x is Elemento => !!x) : [],
      paneles: [...paneles, ...faltan],
      ocultos: Array.isArray(pb.ocultos) ? pb.ocultos.filter(esPanel) : [],
      ultimaRuta: typeof pb.ultimaRuta === "string" ? pb.ultimaRuta : undefined,
      archivado: !!pb.archivado,
    });
  }
  if (!proyectos.length) return base;
  const activo = proyectos.some((p) => p.id === b.activo) ? (b.activo as string) : proyectos[0].id;
  return {
    version: 1,
    proyectos,
    activo,
    papelera: Array.isArray(b.papelera)
      ? (b.papelera as PapeleraItem[])
          .filter((it) => it && typeof it.proyectoId === "string" && !!sanearElemento(it.elemento))
          .map((it) => ({ ...it, elemento: sanearElemento(it.elemento) as Elemento }))
          .slice(0, 60)
      : [],
    sesiones: Array.isArray(b.sesiones)
      ? (b.sesiones as SesionGuardada[])
          .filter((s) => s && typeof s.nombre === "string" && Array.isArray(s.elementos))
          .slice(0, 30)
      : [],
    actividad: Array.isArray(b.actividad)
      ? (b.actividad as Actividad[]).filter((a) => a && typeof a.detalle === "string").slice(0, MAX_ACTIVIDAD)
      : [],
    historial: Array.isArray(b.historial)
      ? (b.historial as EstadoEspacio["historial"]).filter((h) => h && h.estado && Array.isArray(h.estado.proyectos)).slice(0, MAX_HISTORIAL)
      : [],
    migrado: typeof b.migrado === "string" ? b.migrado : null,
  };
}

// ─────────────────────────── almacenamiento ──────────────────────────────
export function cargar(leer?: (clave: string) => string | null): EstadoEspacio {
  try {
    const leerDe = leer ?? ((k: string) => (typeof window !== "undefined" ? window.localStorage.getItem(k) : null));
    const raw = leerDe(CLAVE_ESPACIO);
    if (!raw) return estadoInicial();
    return sanear(JSON.parse(raw));
  } catch {
    return estadoInicial();
  }
}

export function guardar(e: EstadoEspacio, escribir?: (clave: string, valor: string) => void): void {
  try {
    const poner = escribir ?? ((k: string, v: string) => { if (typeof window !== "undefined") window.localStorage.setItem(k, v); });
    // el historial NO se persiste entero si se hincha: se recorta antes
    const paraGuardar: EstadoEspacio = { ...e, historial: e.historial.slice(0, 8) };
    poner(CLAVE_ESPACIO, JSON.stringify(paraGuardar));
  } catch {
    /* si no cabe, el espacio de esta sesión sigue funcionando en memoria */
  }
}

/** Lee los almacenes viejos para sembrar el espacio (sin tocarlos). */
export function leerLegado(leer?: (clave: string) => string | null): Legado {
  const leerDe = leer ?? ((k: string) => (typeof window !== "undefined" ? window.localStorage.getItem(k) : null));
  const out: Legado = {};
  try {
    const fav = leerDe(CLAVE_FAVORITOS);
    if (fav) {
      const d = JSON.parse(fav) as { state?: { favoritos?: string[] }; favoritos?: string[] };
      out.favoritos = d.state?.favoritos ?? d.favoritos ?? [];
    }
  } catch { /* el legado es un extra: si falla, se empieza limpio */ }
  try {
    const uso = leerDe(CLAVE_USO);
    if (uso) out.uso = JSON.parse(uso) as Record<string, number>;
  } catch { /* idem */ }
  return out;
}
