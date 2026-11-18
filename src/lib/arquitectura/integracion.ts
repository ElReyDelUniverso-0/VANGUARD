// ═══════════════════════════════════════════════════════════════════
// v414.0 · EL CONTRATO DE INTEGRACIÓN — cómo entra un área nueva sin romper la casa
//
// Los 22 departamentos del plan (y los que vengan) tienen autoridad sobre su
// materia, pero no sobre la arquitectura común. Este fichero es esa frontera,
// en código: ocho piezas obligatorias, qué se comprueba de cada una y una
// función que dice en voz alta lo que falta.
//
// No sustituye a los CONTRATOS en prosa de `arquitectura/departamentos.ts`
// (v412.0): los hace ejecutables. `scripts/pruebas-arquitectura.mjs` los usa.
//
// Lo que este fichero NO es: un formulario de buenas intenciones. Si una pieza
// no se puede comprobar desde el árbol, se dice («revisión humana»), no se
// finge que hay una prueba.
// ═══════════════════════════════════════════════════════════════════

import censo from "./censo.json";
import grafo from "./grafo.json";

// ── Las ocho piezas ────────────────────────────────────────────────

export type TipoComprobacion = "árbol" | "registro" | "prueba" | "revisión humana";

export interface PiezaIntegracion {
  id: string;
  nombre: string;
  /** qué tiene que existir, en una frase */
  regla: string;
  /** cómo lo comprueba la casa */
  comprobacion: string;
  tipo: TipoComprobacion;
  /** dónde se cumple (fichero real) */
  donde: string;
}

export const PIEZAS: PiezaIntegracion[] = [
  {
    id: "puerta",
    nombre: "Una puerta canónica",
    regla: "El área declara UNA ruta pública que la representa. Las demás son alias vivos que no compiten en el índice.",
    comprobacion: "La ruta existe en src/app y figura en el censo como página con al menos una referencia entrante.",
    tipo: "árbol",
    donde: "src/app/<área>/page.tsx · src/lib/arquitectura/censo.json",
  },
  {
    id: "registro",
    nombre: "Registro antes que página",
    regla: "Ninguna ruta pública sin entrada en un registro (Núcleo, catálogo del área o censo de la arquitectura). La página lee del registro.",
    comprobacion: "Hay un `mod:` (o entrada equivalente) con ruta real en src/lib/nucleo/registro.ts o en el registro del área.",
    tipo: "registro",
    donde: "src/lib/nucleo/registro.ts",
  },
  {
    id: "datos",
    nombre: "Cada dato con su origen",
    regla: "Todo número lleva fuente, licencia, fecha de captura y sus límites. Si no hay dato, se escribe «sin dato».",
    comprobacion: "El modelo de dato está en src/lib/datos/catalogo.ts con procedencia y límites no vacíos.",
    tipo: "registro",
    donde: "src/lib/datos/catalogo.ts",
  },
  {
    id: "api",
    nombre: "Puerta de máquina con contrato",
    regla: "Si el área sirve datos, expone una ruta de API con el contrato de la casa y aparece en el catálogo.",
    comprobacion: "La ruta responde `{ok, api, version, datos|error, meta}` y está en src/lib/api/catalogo.ts (documentada o inventariada).",
    tipo: "prueba",
    donde: "src/lib/api/catalogo.ts · src/lib/sistema/contrato.ts",
  },
  {
    id: "enlaces",
    nombre: "Enlaces de ida y vuelta",
    regla: "El área enlaza a las que existían y pide el enlace de vuelta. Sin callejones: toda página es alcanzable y lleva a algo.",
    comprobacion: "El censo cuenta referencias entrantes; una página con 0 se publica como huérfana y bloquea la entrega.",
    tipo: "árbol",
    donde: "src/lib/arquitectura/grafo.json (`huecos.huerfanas`)",
  },
  {
    id: "limites",
    nombre: "Límites escritos",
    regla: "Lo que el área no sabe, no mide o no puede sostener se declara antes de que el visitante lo descubra.",
    comprobacion: "Revisión humana sobre el texto publicado: cada visualización y cada modelo lleva sus supuestos o su «sin dato».",
    tipo: "revisión humana",
    donde: "la propia página del área",
  },
  {
    id: "pruebas",
    nombre: "Prueba ejecutable",
    regla: "Cada área deja al menos una comprobación en scripts/ que falle si su registro miente.",
    comprobacion: "Existe un `scripts/pruebas-*.mjs` que menciona las rutas o los ficheros del área y pasa en verde.",
    tipo: "prueba",
    donde: "scripts/pruebas-*.mjs",
  },
  {
    id: "constancia",
    nombre: "Constancia para las otras IA",
    regla: "La tanda se anota donde las demás miran: versión, bitácora, bandeja de mejoras y worklog.",
    comprobacion: "La versión publicada aparece en src/lib/version.ts y en la bitácora; la bandeja tiene el bloque del área.",
    tipo: "registro",
    donde: "src/lib/version.ts · src/lib/bitacora.ts · agent-ctx/improvement-inbox.md · worklog.md",
  },
];

// ── El descriptor que cada departamento entrega ────────────────────

export interface Integracion {
  area: string;
  rutaCanonica: string;
  registro: string;
  datos: string[];
  api: string | null;
  pruebas: string[];
  limitesEscritos: boolean;
  constancia: string;
}

const vacio = (v: unknown): boolean =>
  v === undefined || v === null || (typeof v === "string" && v.trim().length === 0) || (Array.isArray(v) && v.length === 0);

export interface VeredictoIntegracion {
  ok: boolean;
  faltan: string[];
  avisos: string[];
  piezas: number;
}

/** Dice, pieza a pieza, qué le falta a un área para entrar. No lanza: informa. */
export function validarIntegracion(i: Partial<Integracion>): VeredictoIntegracion {
  const faltan: string[] = [];
  const avisos: string[] = [];

  if (vacio(i.rutaCanonica)) faltan.push("puerta: falta la ruta canónica");
  else if (!i.rutaCanonica!.startsWith("/")) faltan.push("puerta: la ruta canónica debe empezar por «/»");

  if (vacio(i.registro)) faltan.push("registro: falta el id del módulo o la entrada del registro");
  if (vacio(i.datos)) faltan.push("datos: no declara ningún modelo de dato (aunque sea propio)");
  if (vacio(i.pruebas)) faltan.push("pruebas: no declara ninguna comprobación ejecutable");
  if (i.limitesEscritos !== true) faltan.push("limites: los límites no están escritos");
  if (vacio(i.constancia)) faltan.push("constancia: falta la anotación para las otras IA");

  if (i.api === undefined) faltan.push("api: declara `null` si el área no sirve datos, o su ruta si los sirve");
  else if (i.api !== null && !String(i.api).startsWith("/api/")) faltan.push("api: la puerta de máquina debe empezar por «/api/»");

  if (!vacio(i.rutaCanonica) && Array.isArray(i.pruebas) && i.pruebas.length === 1) {
    avisos.push("con una sola prueba, el área se sostiene con un alfiler: añade la del caso que la rompería");
  }
  if (!vacio(i.datos) && Array.isArray(i.datos) && i.datos.every((d) => !d.startsWith("dato:"))) {
    avisos.push("los datos se nombran con su modelo (`dato:…`) para poder cruzarlos en el catálogo");
  }

  return { ok: faltan.length === 0, faltan, avisos, piezas: PIEZAS.length };
}

// ── El estado real de la casa, leído de los dos JSON ───────────────

export interface ResumenArquitectura {
  paginas: number;
  rutasApi: number;
  areas: number;
  acoplamientos: number;
  ciclos: number;
  modulos: number;
  dependencias: number;
  dependenciasRotas: number;
  huerfanas: number;
  apiSinConsumidor: number;
  fecha: string;
}

export function resumenArquitectura(): ResumenArquitectura {
  const h = grafo.huecos as {
    huerfanas: string[];
    apiSinConsumidor: string[];
  };
  return {
    paginas: censo.paginas,
    rutasApi: censo.rutasApi,
    areas: grafo.areas.length,
    acoplamientos: grafo.acoplamientos.length,
    ciclos: grafo.ciclosDeEnlace.length,
    modulos: grafo.registro.modulos,
    dependencias: grafo.registro.dependencias,
    dependenciasRotas: grafo.registro.rotas.length,
    huerfanas: h.huerfanas.length,
    apiSinConsumidor: h.apiSinConsumidor.length,
    fecha: grafo.generado,
  };
}

/** Las áreas con más tráfico de enlaces: por dónde pasa la casa de verdad. */
export function areasCentrales(n = 8) {
  return (grafo.areas as { id: string; tipo: string; rutas: number; enlacesEntrantes: number; enlacesSalientes: number }[])
    .filter((a) => a.tipo === "ruta")
    .map((a) => ({ ...a, peso: a.enlacesEntrantes + a.enlacesSalientes }))
    .sort((a, b) => b.peso - a.peso)
    .slice(0, n);
}

/** Los acoplamientos más fuertes entre áreas (quién tira de quién). */
export function acoplamientosFuertes(n = 10) {
  return (grafo.acoplamientos as { desde: string; hacia: string; n: number }[]).slice(0, n);
}

/** Lo que el grafo ve como hueco. Se publica tal cual: no se maquilla. */
export function huecosDeArquitectura() {
  return grafo.huecos as {
    huerfanas: string[];
    apiSinConsumidor: string[];
    paginasDeUnEnlace: string[];
    apiMasUsadas: { ruta: string; consumidores: number }[];
  };
}

/** Puertas de API que el árbol tiene y que ningún fichero del repositorio cita. */
export function puertasSinConsumidor(): string[] {
  return huecosDeArquitectura().apiSinConsumidor;
}

export const VERSION_ARQUITECTURA = "v414.0";
