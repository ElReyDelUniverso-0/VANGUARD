// ═══════════════════════════════════════════════════════════════════════════
// v434.2 · ZONA CERO — LA MESA DE ÓRDENES (el modelo, puro y probado)
//
// Orden del Dueño, textual: «mejora la zona cero, que sea un módulo completo,
// expándela; que uno pueda señalar, corregir, editar, poner capturas, poner
// órdenes por números, o sea de todo; y que se pueda poner una API key, también
// predecir y muchas más cosas».
//
// Esto es el esqueleto de todo eso, sin pantalla y sin almacén: las piezas de
// un puesto de mando de verdad — órdenes numeradas, pines donde señalas,
// capturas pegadas, correcciones con su historial y predicciones que dicen en
// qué se basan. Ninguna función de aquí inventa datos: si no hay base para una
// probabilidad, se dice y se baja la confianza.
//
// Puro: sin red, sin localStorage, sin Date.now() implícito. Se prueba solo con
// `npx tsx tools/zona-cero/probar.mts`.
// ═══════════════════════════════════════════════════════════════════════════

export type EstadoOrden = "pendiente" | "curso" | "hecha" | "descartada";
/** 5 = crítica (para ahora) · 1 = cuando se pueda */
export type Prioridad = 1 | 2 | 3 | 4 | 5;
export type TipoPin = "senal" | "riesgo" | "objetivo" | "recurso" | "nota";

export type Orden = {
  id: string;
  /** número visible; se renumera solo al mover y al borrar */
  numero: number;
  titulo: string;
  detalle: string;
  prioridad: Prioridad;
  estado: EstadoOrden;
  /** ids de órdenes que deben cerrarse antes (bloqueos reales, no adornos) */
  dependeDe: string[];
  etiquetas: string[];
  /** epoch ms o null si no vence */
  vence: number | null;
  progreso: number; // 0..100
  creada: number;
  actualizada: number;
};

export type Pin = {
  id: string;
  numero: number;
  titulo: string;
  nota: string;
  /** posición en el lienzo, en milésimas (0..1000): independiente del tamaño */
  x: number;
  y: number;
  tipo: TipoPin;
  color: string;
  /** ruta de la casa a la que apunta, si apunta a algo */
  ruta?: string;
  ts: number;
};

export type Captura = {
  id: string;
  titulo: string;
  nota: string;
  /** imagen en data URL (vive en el aparato; nunca se sube a un servidor) */
  dataUrl: string;
  ancho: number;
  alto: number;
  peso: number; // bytes
  fuente: string;
  ts: number;
};

export type Correccion = {
  id: string;
  objetivoId: string;
  tipo: "orden" | "pin" | "captura" | "mesa";
  campo: string;
  antes: string;
  despues: string;
  ts: number;
};

export type Factor = { etiqueta: string; valor: number; peso: number };

export type Prediccion = {
  id: string;
  clave: string;
  pregunta: string;
  /** 0..1 */
  probabilidad: number;
  /** 0..1 — cuánta fe merece el número (poca muestra = poca fe) */
  confianza: number;
  horizonteDias: number;
  factores: Factor[];
  motor: "casa" | "ia";
  texto: string;
  ts: number;
};

export type AjustesMesa = {
  /** de dónde sale la predicción narrada: la casa, o una clave tuya */
  motor: "casa" | "propio";
  proveedor: "openai" | "groq" | "openrouter" | "personalizado";
  baseUrl: string;
  modelo: string;
  /** la clave NO se guarda en el código ni se envía a nadie más que al proveedor */
  clave: string;
  /** tope por captura, en MB */
  topeMB: number;
  horizonteDias: number;
};

export type Mesa = {
  v: 1;
  id: string;
  titulo: string;
  creada: number;
  actualizada: number;
  ordenes: Orden[];
  pines: Pin[];
  capturas: Captura[];
  correcciones: Correccion[];
  predicciones: Prediccion[];
  ajustes: AjustesMesa;
};

// ── límites honestos (lo que el aparato puede con esto) ────────────────────

export const TOPE_CAPTURAS = 40;
/** las capturas viven en localStorage: cada MB pesa el doble en base64 */
export const TOPE_CAPTURA_MB = 4;
export const TOPE_ORDENES = 300;
export const TOPE_PINES = 400;
export const TOPE_HISTORIAL = 200;

export const AJUSTES_DEFECTO: AjustesMesa = {
  motor: "casa",
  proveedor: "openai",
  baseUrl: "https://api.openai.com/v1",
  modelo: "gpt-4o-mini",
  clave: "",
  topeMB: 2,
  horizonteDias: 7,
};

export const BASES: Record<AjustesMesa["proveedor"], string> = {
  openai: "https://api.openai.com/v1",
  groq: "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  personalizado: "",
};

export const MODELOS: Record<AjustesMesa["proveedor"], string> = {
  openai: "gpt-4o-mini",
  groq: "llama-3.3-70b-versatile",
  openrouter: "openai/gpt-4o-mini",
  personalizado: "modelo-local",
};

export function mesaVacia(ahora = 0): Mesa {
  return {
    v: 1,
    id: `mesa-${ahora}`,
    titulo: "Mesa de órdenes",
    creada: ahora,
    actualizada: ahora,
    ordenes: [],
    pines: [],
    capturas: [],
    correcciones: [],
    predicciones: [],
    ajustes: { ...AJUSTES_DEFECTO },
  };
}

// ── utilidades ─────────────────────────────────────────────────────────────

let contador = 0;
/** id local: no hace falta criptografía para nombrar una fila de tu mesa */
export function nuevoId(prefijo: string, ahora = 0): string {
  contador += 1;
  return `${prefijo}-${ahora.toString(36)}-${contador.toString(36)}`;
}

export function recortar(s: string, max: number): string {
  return (s ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Renumera las órdenes 1..n en el orden en que están. Devuelve copia. */
export function renumerar(ordenes: Orden[]): Orden[] {
  return ordenes.map((o, i) => (o.numero === i + 1 ? o : { ...o, numero: i + 1 }));
}

/** Mueve una orden de sitio y renumera (las órdenes son una lista, no un saco). */
export function moverOrden(mesa: Mesa, id: string, destino: number, ahora: number): Mesa {
  const i = mesa.ordenes.findIndex((o) => o.id === id);
  if (i < 0) return mesa;
  const lista = [...mesa.ordenes];
  const [fila] = lista.splice(i, 1);
  const j = Math.max(0, Math.min(lista.length, destino));
  lista.splice(j, 0, fila);
  return { ...mesa, ordenes: renumerar(lista), actualizada: ahora };
}

/** La siguiente número libre (el que el Dueño ve al añadir). */
export function siguienteNumero(mesa: Mesa): number {
  return mesa.ordenes.length + 1;
}

export function crearOrden(
  mesa: Mesa,
  datos: Partial<Omit<Orden, "id" | "numero" | "creada" | "actualizada">> & { titulo: string },
  ahora: number
): Mesa {
  if (mesa.ordenes.length >= TOPE_ORDENES) return mesa;
  const orden: Orden = {
    id: nuevoId("ord", ahora),
    numero: siguienteNumero(mesa),
    titulo: recortar(datos.titulo, 160) || "Orden sin título",
    detalle: recortar(datos.detalle ?? "", 2000),
    prioridad: (datos.prioridad ?? 3) as Prioridad,
    estado: datos.estado ?? "pendiente",
    dependeDe: Array.isArray(datos.dependeDe) ? datos.dependeDe.slice(0, 12) : [],
    etiquetas: Array.isArray(datos.etiquetas) ? datos.etiquetas.slice(0, 8).map((e) => recortar(e, 24)) : [],
    vence: Number.isFinite(datos.vence as number) ? (datos.vence as number) : null,
    progreso: Math.max(0, Math.min(100, datos.progreso ?? 0)),
    creada: ahora,
    actualizada: ahora,
  };
  return { ...mesa, ordenes: [...mesa.ordenes, orden], actualizada: ahora };
}

/** Añade un pin (señalar): el número es el de la casa, no el del orden de órdenes. */
export function crearPin(
  mesa: Mesa,
  datos: Partial<Omit<Pin, "id" | "numero" | "ts">> & { x: number; y: number },
  ahora: number
): Mesa {
  if (mesa.pines.length >= TOPE_PINES) return mesa;
  const pin: Pin = {
    id: nuevoId("pin", ahora),
    numero: mesa.pines.length + 1,
    titulo: recortar(datos.titulo ?? "Señal", 120),
    nota: recortar(datos.nota ?? "", 1200),
    x: Math.max(0, Math.min(1000, datos.x)),
    y: Math.max(0, Math.min(1000, datos.y)),
    tipo: (datos.tipo ?? "senal") as TipoPin,
    color: datos.color ?? "#e8c56a",
    ruta: datos.ruta ? recortar(datos.ruta, 200) : undefined,
    ts: ahora,
  };
  return { ...mesa, pines: [...mesa.pines, pin], actualizada: ahora };
}

/** Corregir: cambia un campo y deja rastro (para poder deshacer). */
export function corregir(
  mesa: Mesa,
  objetivoId: string,
  tipo: Correccion["tipo"],
  campo: string,
  valor: string,
  ahora: number
): Mesa {
  const antes = leerCampo(mesa, objetivoId, campo);
  if (antes === valor) return mesa;

  let m = aplicarCampo(mesa, objetivoId, campo, valor, ahora);
  const correccion: Correccion = {
    id: nuevoId("cor", ahora),
    objetivoId,
    tipo,
    campo,
    antes: recortar(antes, 400),
    despues: recortar(valor, 400),
    ts: ahora,
  };
  m = { ...m, correcciones: [...m.correcciones, correccion].slice(-TOPE_HISTORIAL), actualizada: ahora };
  return m;
}

const CAMPOS_TEXTO = new Set([
  "titulo", "detalle", "nota", "fuente", "pregunta", "texto",
]);

function leerCampo(mesa: Mesa, id: string, campo: string): string {
  const o = mesa.ordenes.find((x) => x.id === id);
  if (o) return String((o as unknown as Record<string, unknown>)[campo] ?? "");
  const p = mesa.pines.find((x) => x.id === id);
  if (p) return String((p as unknown as Record<string, unknown>)[campo] ?? "");
  const c = mesa.capturas.find((x) => x.id === id);
  if (c) return String((c as unknown as Record<string, unknown>)[campo] ?? "");
  if (id === mesa.id) return String((mesa as unknown as Record<string, unknown>)[campo] ?? "");
  return "";
}

function aplicarCampo(mesa: Mesa, id: string, campo: string, valor: string, ahora: number): Mesa {
  const texto = CAMPOS_TEXTO.has(campo) ? recortar(valor, campo === "detalle" ? 2000 : 400) : valor;

  const enOrden = mesa.ordenes.findIndex((x) => x.id === id);
  if (enOrden >= 0) {
    const ordenes = [...mesa.ordenes];
    const o = { ...ordenes[enOrden] };
    if (campo === "prioridad") o.prioridad = Math.max(1, Math.min(5, Number(texto) || 3)) as Prioridad;
    else if (campo === "estado") o.estado = (["pendiente", "curso", "hecha", "descartada"].includes(texto) ? texto : o.estado) as EstadoOrden;
    else if (campo === "progreso") o.progreso = Math.max(0, Math.min(100, Number(texto) || 0));
    else if (campo === "vence") o.vence = Number(texto) || null;
    else (o as unknown as Record<string, unknown>)[campo] = texto;
    o.actualizada = ahora;
    ordenes[enOrden] = o;
    return { ...mesa, ordenes };
  }

  const enPin = mesa.pines.findIndex((x) => x.id === id);
  if (enPin >= 0) {
    const pines = [...mesa.pines];
    const p = { ...pines[enPin] };
    if (campo === "tipo") p.tipo = texto as TipoPin;
    else if (campo === "x" || campo === "y") p[campo] = Math.max(0, Math.min(1000, Number(texto) || 0));
    else if (campo === "numero") p.numero = Math.max(1, Number(texto) || 1);
    else (p as unknown as Record<string, unknown>)[campo] = texto;
    pines[enPin] = p;
    return { ...mesa, pines };
  }

  const enCap = mesa.capturas.findIndex((x) => x.id === id);
  if (enCap >= 0) {
    const capturas = [...mesa.capturas];
    const c = { ...capturas[enCap] };
    (c as unknown as Record<string, unknown>)[campo] = texto;
    capturas[enCap] = c;
    return { ...mesa, capturas };
  }

  if (id === mesa.id) return { ...mesa, [campo]: texto } as Mesa;
  return mesa;
}

/** Deshacer la última corrección (y devolver cómo quedó dicha en cristiano). */
export function deshacer(mesa: Mesa, ahora: number): { mesa: Mesa; dicho: string } {
  const cor = mesa.correcciones[mesa.correcciones.length - 1];
  if (!cor) return { mesa, dicho: "No hay nada que deshacer." };
  const revertida = aplicarCampo(mesa, cor.objetivoId, cor.campo, cor.antes, ahora);
  return {
    mesa: {
      ...revertida,
      correcciones: mesa.correcciones.slice(0, -1),
      actualizada: ahora,
    },
    dicho: `Deshecho: ${cor.campo} volvió a «${cor.antes || "(vacío)"}».`,
  };
}

/** Borra con rastro: la fila desaparece pero queda apuntado qué había. */
export function borrar(mesa: Mesa, id: string, ahora: number): Mesa {
  const orden = mesa.ordenes.find((o) => o.id === id);
  if (orden) {
    const quedan = mesa.ordenes.filter((o) => o.id !== id).map((o) => ({
      ...o,
      dependeDe: o.dependeDe.filter((d) => d !== id),
    }));
    return conRastro({ ...mesa, ordenes: renumerar(quedan) }, id, "orden", "borrada", orden.titulo, ahora);
  }
  const pin = mesa.pines.find((p) => p.id === id);
  if (pin) return conRastro({ ...mesa, pines: mesa.pines.filter((p) => p.id !== id) }, id, "pin", "borrado", pin.titulo, ahora);
  const cap = mesa.capturas.find((c) => c.id === id);
  if (cap) return conRastro({ ...mesa, capturas: mesa.capturas.filter((c) => c.id !== id) }, id, "captura", "borrada", cap.titulo, ahora);
  return mesa;
}

function conRastro(mesa: Mesa, id: string, tipo: Correccion["tipo"], campo: string, antes: string, ahora: number): Mesa {
  const correccion: Correccion = {
    id: nuevoId("cor", ahora),
    objetivoId: id,
    tipo,
    campo,
    antes,
    despues: "",
    ts: ahora,
  };
  return {
    ...mesa,
    correcciones: [...mesa.correcciones, correccion].slice(-TOPE_HISTORIAL),
    actualizada: ahora,
  };
}

/** Añade una captura con su tope real (y lo dice si no cabe). */
export function crearCaptura(
  mesa: Mesa,
  datos: { titulo: string; dataUrl: string; ancho: number; alto: number; peso: number; nota?: string; fuente?: string },
  ahora: number
): { mesa: Mesa; error?: string } {
  if (!datos.dataUrl.startsWith("data:image/")) {
    return { mesa, error: "Eso no es una imagen (solo capturas PNG, JPG o WebP)." };
  }
  if (mesa.capturas.length >= TOPE_CAPTURAS) {
    return { mesa, error: `La mesa admite ${TOPE_CAPTURAS} capturas. Borra alguna antes de pegar otra.` };
  }
  const tope = Math.max(0.2, Math.min(TOPE_CAPTURA_MB, mesa.ajustes.topeMB)) * 1024 * 1024;
  if (datos.peso > tope) {
    return {
      mesa,
      error: `Esa captura pesa ${(datos.peso / 1024 / 1024).toFixed(1)} MB y el tope está en ${(tope / 1024 / 1024).toFixed(1)} MB. Recórtala o sube el tope en Ajustes.`,
    };
  }
  const captura: Captura = {
    id: nuevoId("cap", ahora),
    titulo: recortar(datos.titulo || "Captura", 120),
    nota: recortar(datos.nota ?? "", 1200),
    dataUrl: datos.dataUrl,
    ancho: Math.max(0, Math.round(datos.ancho)),
    alto: Math.max(0, Math.round(datos.alto)),
    peso: Math.max(0, Math.round(datos.peso)),
    fuente: recortar(datos.fuente ?? "", 200),
    ts: ahora,
  };
  return { mesa: { ...mesa, capturas: [captura, ...mesa.capturas], actualizada: ahora } };
}

export function borrarPrediccion(mesa: Mesa, id: string, ahora: number): Mesa {
  return { ...mesa, predicciones: mesa.predicciones.filter((p) => p.id !== id), actualizada: ahora };
}

// ── salud de la mesa: lo que está mal, dicho sin adornos ───────────────────

export type Alerta = { nivel: "alta" | "media" | "baja"; texto: string; ordenId?: string };

export function alertas(mesa: Mesa, ahora: number): Alerta[] {
  const salida: Alerta[] = [];
  const abiertas = mesa.ordenes.filter((o) => o.estado === "pendiente" || o.estado === "curso");

  for (const o of abiertas) {
    if (o.vence && o.vence < ahora) {
      salida.push({ nivel: "alta", texto: `La orden ${o.numero} está vencida desde hace ${Math.max(1, Math.round((ahora - o.vence) / 86_400_000))} día(s): «${o.titulo}»`, ordenId: o.id });
    }
    const bloqueos = o.dependeDe
      .map((d) => mesa.ordenes.find((x) => x.id === d))
      .filter((d): d is Orden => Boolean(d) && d!.estado !== "hecha" && d!.estado !== "descartada");
    if (bloqueos.length > 0 && o.estado === "curso") {
      salida.push({ nivel: "alta", texto: `La orden ${o.numero} está en curso pero depende de ${bloqueos.map((b) => b.numero).join(", ")} — no puede cerrarse.`, ordenId: o.id });
    }
    if (o.estado === "curso" && !o.detalle) {
      salida.push({ nivel: "media", texto: `La orden ${o.numero} está en curso sin detalle: no dice cómo se hace.`, ordenId: o.id });
    }
  }

  if (mesa.ordenes.length === 0) {
    salida.push({ nivel: "baja", texto: "La mesa está vacía: escribe la primera orden y numérala." });
  }
  const sinCaptura = mesa.capturas.length === 0 && mesa.pines.length > 0;
  if (sinCaptura) {
    salida.push({ nivel: "baja", texto: "Tienes señales en el tablero pero ninguna captura que las respalde." });
  }
  const criticas = abiertas.filter((o) => o.prioridad === 5).length;
  if (criticas > 5) {
    salida.push({ nivel: "media", texto: `${criticas} órdenes marcadas como críticas: si todo es crítico, nada lo es.` });
  }

  const orden = { alta: 0, media: 1, baja: 2 };
  return salida.sort((a, b) => orden[a.nivel] - orden[b.nivel]).slice(0, 12);
}

/** Cuánto está avanzado el conjunto, contando órdenes (no píxeles). */
export function avance(mesa: Mesa): { pct: number; hechas: number; abiertas: number; total: number } {
  const total = mesa.ordenes.length;
  if (total === 0) return { pct: 0, hechas: 0, abiertas: 0, total: 0 };
  const hechas = mesa.ordenes.filter((o) => o.estado === "hecha").length;
  const abiertas = mesa.ordenes.filter((o) => o.estado === "pendiente" || o.estado === "curso").length;
  return { pct: Math.round((hechas / total) * 100), hechas, abiertas, total };
}

// ── PREDECIR: el motor determinista de la casa ─────────────────────────────
//
// No es una bola de cristal. Es un modelo de lo que TÚ has puesto en la mesa:
// cuenta vencidas, bloqueos, carga crítica, avance y respaldo visual, y lo
// convierte en probabilidad con una logística. Cada predicción lleva sus
// factores y su confianza: si la mesa tiene tres órdenes, la confianza es
// baja y se dice.

function logistica(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

type Base = {
  total: number;
  abiertas: number;
  vencidas: number;
  criticas: number;
  bloqueadas: number;
  sinDetalle: number;
  avancePct: number;
  pines: number;
  capturas: number;
  diasRestantes: number | null;
};

export function baseDeMesa(mesa: Mesa, ahora: number): Base {
  const abiertas = mesa.ordenes.filter((o) => o.estado === "pendiente" || o.estado === "curso");
  const vencidas = abiertas.filter((o) => o.vence !== null && o.vence < ahora).length;
  const criticas = abiertas.filter((o) => o.prioridad === 5).length;
  const bloqueadas = abiertas.filter((o) =>
    o.dependeDe.some((d) => {
      const dep = mesa.ordenes.find((x) => x.id === d);
      return dep && dep.estado !== "hecha" && dep.estado !== "descartada";
    })
  ).length;
  const sinDetalle = abiertas.filter((o) => !o.detalle).length;
  const vencimientos = mesa.ordenes.map((o) => o.vence).filter((v): v is number => typeof v === "number");
  const diasRestantes = vencimientos.length ? Math.round((Math.min(...vencimientos) - ahora) / 86_400_000) : null;

  return {
    total: mesa.ordenes.length,
    abiertas: abiertas.length,
    vencidas,
    criticas,
    bloqueadas,
    sinDetalle,
    avancePct: avance(mesa).pct,
    pines: mesa.pines.length,
    capturas: mesa.capturas.length,
    diasRestantes,
  };
}

/**
 * Las predicciones que la mesa puede hacer con honestidad. Todas se calculan
 * de lo que hay en el tablero; ninguna inventa contexto del mundo.
 */
export function predecir(mesa: Mesa, ahora: number, horizonteDias = mesa.ajustes.horizonteDias): Prediccion[] {
  const b = baseDeMesa(mesa, ahora);
  const h = Math.max(1, Math.min(90, horizonteDias || 7));
  const salida: Prediccion[] = [];

  const push = (
    clave: string,
    pregunta: string,
    probabilidad: number,
    factores: Factor[],
    texto: string
  ) => {
    // la confianza depende de cuánta mesa hay detrás: con 2 órdenes, poca
    const muestra = Math.min(1, b.total / 12) * 0.6 + Math.min(1, (b.pines + b.capturas) / 6) * 0.4;
    salida.push({
      id: nuevoId("pre", ahora),
      clave,
      pregunta,
      probabilidad: Math.max(0.02, Math.min(0.98, probabilidad)),
      confianza: Math.round(Math.max(0.08, Math.min(0.92, muestra)) * 100) / 100,
      horizonteDias: h,
      factores,
      motor: "casa",
      texto,
      ts: ahora,
    });
  };

  // ① ¿se cierra lo abierto en el horizonte? (lo que TikTok no te dice: por qué)
  const carga = b.abiertas / Math.max(1, h);
  const z1 =
    (b.abiertas === 0 ? 3 : 0) +
    -0.55 * b.vencidas +
    -0.35 * b.bloqueadas +
    -0.22 * Math.max(0, b.criticas - 1) +
    -0.08 * b.sinDetalle +
    -0.5 * Math.max(0, carga - 2) +
    0.9 * (b.avancePct / 100);
  push(
    "cierre",
    `¿Se cierra lo abierto en ${h} día(s)?`,
    logistica(z1),
    [
      { etiqueta: "órdenes abiertas", valor: b.abiertas, peso: -0.25 },
      { etiqueta: "vencidas", valor: b.vencidas, peso: -0.55 },
      { etiqueta: "bloqueadas", valor: b.bloqueadas, peso: -0.35 },
      { etiqueta: "críticas", valor: b.criticas, peso: -0.22 },
      { etiqueta: "avance", valor: b.avancePct, peso: 0.9 },
    ],
    b.abiertas === 0
      ? "Sin órdenes abiertas no hay nada que cerrar: la mesa está limpia."
      : `Con ${b.abiertas} órdenes abiertas${b.vencidas ? `, ${b.vencidas} vencida(s)` : ""}${b.bloqueadas ? ` y ${b.bloqueadas} bloqueada(s)` : ""}, el horizonte de ${h} día(s) es ${carga > 2 ? "apretado" : "razonable"}.`
  );

  // ② ¿aparece un retraso en cadena por los bloqueos?
  const z2 = 0.9 * b.bloqueadas + 0.6 * b.vencidas - 0.5 * (b.avancePct / 100) - 0.7;
  push(
    "retraso",
    "¿Se te va a retrasar la mesa por dependencias?",
    logistica(z2),
    [
      { etiqueta: "bloqueadas", valor: b.bloqueadas, peso: 0.9 },
      { etiqueta: "vencidas", valor: b.vencidas, peso: 0.6 },
      { etiqueta: "avance", valor: b.avancePct, peso: -0.5 },
    ],
    b.bloqueadas === 0
      ? "Ninguna orden espera a otra: no hay cadena que se rompa."
      : `${b.bloqueadas} orden(es) esperan a que se cierre otra antes. Ahí es donde se rompe un plan.`
  );

  // ③ ¿está respaldada la mesa? (señales y capturas frente a órdenes)
  const respaldo = b.pines + b.capturas;
  const z3 = 0.5 * respaldo - 0.4 * b.abiertas - 0.4;
  push(
    "respaldo",
    "¿Está la mesa respaldada con pruebas?",
    logistica(z3),
    [
      { etiqueta: "señales", valor: b.pines, peso: 0.5 },
      { etiqueta: "capturas", valor: b.capturas, peso: 0.5 },
      { etiqueta: "órdenes abiertas", valor: b.abiertas, peso: -0.4 },
    ],
    respaldo === 0
      ? "No hay ni una señal ni una captura: las órdenes van a ciegas."
      : `Hay ${b.pines} señal(es) y ${b.capturas} captura(s) para ${b.total} orden(es).`
  );

  // ④ ¿se te pasa un vencimiento?
  const z4 = b.vencidas * 1.1 + (b.diasRestantes !== null && b.diasRestantes < h ? 0.8 : -0.6) - 0.4;
  push(
    "vence",
    `¿Se te pasa algún vencimiento en ${h} día(s)?`,
    logistica(z4),
    [
      { etiqueta: "vencidas hoy", valor: b.vencidas, peso: 1.1 },
      { etiqueta: "días al vencimiento más próximo", valor: b.diasRestantes ?? 999, peso: 0.8 },
    ],
    b.diasRestantes === null
      ? "Ninguna orden tiene fecha: se puede decir poco."
      : `El vencimiento más próximo está a ${b.diasRestantes} día(s).`
  );

  return salida;
}

// ── exportar / importar: la mesa tiene que poder salir y volver ────────────

export function exportarMD(mesa: Mesa): string {
  const lineas: string[] = [];
  lineas.push(`# ${mesa.titulo || "Mesa de órdenes"}`);
  lineas.push("");
  lineas.push(`_ZONA CERO · exportada el ${new Date(mesa.actualizada || mesa.creada).toISOString().slice(0, 16).replace("T", " ")} UTC_`);
  lineas.push("");
  lineas.push(`## Órdenes (${mesa.ordenes.length})`);
  lineas.push("");
  for (const o of mesa.ordenes) {
    const fecha = o.vence ? new Date(o.vence).toISOString().slice(0, 10) : "sin fecha";
    lineas.push(`${o.numero}. **${o.titulo}** — ${o.estado}, prioridad ${o.prioridad}/5, ${o.progreso}%, vence ${fecha}`);
    if (o.detalle) lineas.push(`   ${o.detalle}`);
    if (o.etiquetas.length) lineas.push(`   _etiquetas: ${o.etiquetas.join(", ")}_`);
  }
  lineas.push("");
  lineas.push(`## Señales del tablero (${mesa.pines.length})`);
  lineas.push("");
  for (const p of mesa.pines) {
    lineas.push(`- **${p.numero}. ${p.titulo}** (${p.tipo}) en ${(p.x / 10).toFixed(1)}%, ${(p.y / 10).toFixed(1)}%${p.ruta ? ` → ${p.ruta}` : ""}`);
    if (p.nota) lineas.push(`  ${p.nota}`);
  }
  lineas.push("");
  lineas.push(`## Capturas (${mesa.capturas.length})`);
  lineas.push("");
  for (const c of mesa.capturas) {
    lineas.push(`- **${c.titulo}** · ${c.ancho}×${c.alto} · ${(c.peso / 1024).toFixed(0)} KB${c.fuente ? ` · fuente: ${c.fuente}` : ""}`);
    if (c.nota) lineas.push(`  ${c.nota}`);
  }
  lineas.push("");
  if (mesa.predicciones.length) {
    lineas.push(`## Últimas predicciones`);
    lineas.push("");
    for (const p of mesa.predicciones.slice(-5)) {
      lineas.push(`- **${p.pregunta}** → ${Math.round(p.probabilidad * 100)} % (confianza ${Math.round(p.confianza * 100)} %) · ${p.motor}`);
    }
    lineas.push("");
  }
  return lineas.join("\n");
}

export function exportarJSON(mesa: Mesa): string {
  return JSON.stringify(mesa, null, 2);
}

export function importarJSON(texto: string, ahora: number): { mesa: Mesa | null; error?: string } {
  try {
    const datos = JSON.parse(texto);
    const m = sanear(datos, ahora);
    if (!m) return { mesa: null, error: "Ese archivo no parece una mesa de ZONA CERO." };
    return { mesa: m };
  } catch {
    return { mesa: null, error: "El archivo no es JSON válido." };
  }
}

// ── saneado: un almacén manipulado no puede romper la pantalla ─────────────

function numero(v: unknown, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function lista<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function sanear(datos: unknown, ahora = 0): Mesa | null {
  if (!datos || typeof datos !== "object") return null;
  const d = datos as Partial<Mesa> & { v?: number };
  if (d.v !== 1 && !Array.isArray(d.ordenes)) return null;

  const ordenes: Orden[] = lista<Partial<Orden>>(d.ordenes)
    .filter((o) => o && typeof o === "object")
    .slice(0, TOPE_ORDENES)
    .map((o) => ({
      id: typeof o.id === "string" ? o.id : nuevoId("ord", ahora),
      numero: numero(o.numero, 1),
      titulo: recortar(String(o.titulo ?? "Orden"), 160),
      detalle: recortar(String(o.detalle ?? ""), 2000),
      prioridad: Math.max(1, Math.min(5, numero(o.prioridad, 3))) as Prioridad,
      estado: (["pendiente", "curso", "hecha", "descartada"].includes(String(o.estado)) ? o.estado : "pendiente") as EstadoOrden,
      dependeDe: lista<string>(o.dependeDe).filter((x) => typeof x === "string").slice(0, 12),
      etiquetas: lista<string>(o.etiquetas).filter((x) => typeof x === "string").slice(0, 8).map((x) => recortar(x, 24)),
      vence: Number.isFinite(numero(o.vence, Number.NaN)) ? numero(o.vence) : null,
      progreso: Math.max(0, Math.min(100, numero(o.progreso, 0))),
      creada: numero(o.creada, ahora),
      actualizada: numero(o.actualizada, ahora),
    }));

  const pines: Pin[] = lista<Partial<Pin>>(d.pines)
    .filter((p) => p && typeof p === "object")
    .slice(0, TOPE_PINES)
    .map((p) => ({
      id: typeof p.id === "string" ? p.id : nuevoId("pin", ahora),
      numero: Math.max(1, numero(p.numero, 1)),
      titulo: recortar(String(p.titulo ?? "Señal"), 120),
      nota: recortar(String(p.nota ?? ""), 1200),
      x: Math.max(0, Math.min(1000, numero(p.x, 500))),
      y: Math.max(0, Math.min(1000, numero(p.y, 500))),
      tipo: (["senal", "riesgo", "objetivo", "recurso", "nota"].includes(String(p.tipo)) ? p.tipo : "senal") as TipoPin,
      color: typeof p.color === "string" ? recortar(p.color, 24) : "#e8c56a",
      ruta: p.ruta ? recortar(String(p.ruta), 200) : undefined,
      ts: numero(p.ts, ahora),
    }));

  const capturas: Captura[] = lista<Partial<Captura>>(d.capturas)
    .filter((c) => c && typeof c === "object" && typeof c.dataUrl === "string" && c.dataUrl.startsWith("data:image/"))
    .slice(0, TOPE_CAPTURAS)
    .map((c) => ({
      id: typeof c.id === "string" ? c.id : nuevoId("cap", ahora),
      titulo: recortar(String(c.titulo ?? "Captura"), 120),
      nota: recortar(String(c.nota ?? ""), 1200),
      dataUrl: String(c.dataUrl),
      ancho: numero(c.ancho, 0),
      alto: numero(c.alto, 0),
      peso: numero(c.peso, 0),
      fuente: recortar(String(c.fuente ?? ""), 200),
      ts: numero(c.ts, ahora),
    }));

  const ajustes: AjustesMesa = {
    motor: d.ajustes?.motor === "propio" ? "propio" : "casa",
    proveedor: (["openai", "groq", "openrouter", "personalizado"].includes(String(d.ajustes?.proveedor))
      ? d.ajustes!.proveedor
      : "openai") as AjustesMesa["proveedor"],
    baseUrl: recortar(String(d.ajustes?.baseUrl ?? BASES.openai), 300),
    modelo: recortar(String(d.ajustes?.modelo ?? MODELOS.openai), 120),
    clave: typeof d.ajustes?.clave === "string" ? d.ajustes.clave.slice(0, 400) : "",
    topeMB: Math.max(0.2, Math.min(TOPE_CAPTURA_MB, numero(d.ajustes?.topeMB, 2))),
    horizonteDias: Math.max(1, Math.min(90, numero(d.ajustes?.horizonteDias, 7))),
  };

  const correcciones: Correccion[] = lista<Partial<Correccion>>(d.correcciones)
    .filter((c) => c && typeof c === "object")
    .slice(-TOPE_HISTORIAL)
    .map((c) => ({
      id: typeof c.id === "string" ? c.id : nuevoId("cor", ahora),
      objetivoId: String(c.objetivoId ?? ""),
      tipo: (["orden", "pin", "captura", "mesa"].includes(String(c.tipo)) ? c.tipo : "orden") as Correccion["tipo"],
      campo: recortar(String(c.campo ?? ""), 40),
      antes: recortar(String(c.antes ?? ""), 400),
      despues: recortar(String(c.despues ?? ""), 400),
      ts: numero(c.ts, ahora),
    }));

  const predicciones: Prediccion[] = lista<Partial<Prediccion>>(d.predicciones)
    .filter((p) => p && typeof p === "object")
    .slice(-40)
    .map((p) => ({
      id: typeof p.id === "string" ? p.id : nuevoId("pre", ahora),
      clave: recortar(String(p.clave ?? "cierre"), 30),
      pregunta: recortar(String(p.pregunta ?? ""), 200),
      probabilidad: Math.max(0, Math.min(1, numero(p.probabilidad, 0.5))),
      confianza: Math.max(0, Math.min(1, numero(p.confianza, 0.2))),
      horizonteDias: Math.max(1, numero(p.horizonteDias, 7)),
      factores: lista<Factor>(p.factores).filter((f) => f && typeof f === "object").slice(0, 10).map((f) => ({
        etiqueta: recortar(String(f.etiqueta ?? ""), 60),
        valor: numero(f.valor, 0),
        peso: numero(f.peso, 0),
      })),
      motor: p.motor === "ia" ? "ia" : "casa",
      texto: recortar(String(p.texto ?? ""), 1200),
      ts: numero(p.ts, ahora),
    }));

  return {
    v: 1,
    id: typeof d.id === "string" ? d.id : `mesa-${ahora}`,
    titulo: recortar(String(d.titulo ?? "Mesa de órdenes"), 120),
    creada: numero(d.creada, ahora),
    actualizada: numero(d.actualizada, ahora),
    ordenes: renumerar(ordenes),
    pines,
    capturas,
    correcciones,
    predicciones,
    ajustes,
  };
}
