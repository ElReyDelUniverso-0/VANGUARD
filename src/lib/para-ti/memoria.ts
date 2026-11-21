// ═══════════════════════════════════════════════════════════════════════════
// v432.4 · EL ALGORITMO — la memoria del espectador (lo que aprende de ti)
//
// Esto es el corazón del «For You». En lugar de sumar puntos a mano, cada
// rasgo del contenido (tema, tipo, autor) lleva un contador de aciertos y
// fallos: una distribución Beta. Con dos números por rasgo se sabe tres cosas:
//
//   · lo que te gusta        → media = (1+a)/(2+a+b)
//   · cuánta certeza hay     → varianza de la Beta (poca muestra = poca certeza)
//   · y por tanto qué explorar → un rasgo casi desconocido merece una tirada
//
// Las recompensas siguen la escala real de TikTok: saltar en dos segundos es
// una señal negativa floja; verlo entero es media; darle like, guardarlo o
// compartirlo pesa mucho más; «no me interesa» pesa en contra de verdad.
//
// Y nada es para siempre: cada 30 días la evidencia se diluye a la mitad. Si
// cambias de gustos, el algoritmo cambia contigo en semanas, no en años.
//
// Puro: sin red, sin localStorage, sin Date.now() implícito. Se prueba solo.
// ═══════════════════════════════════════════════════════════════════════════

import { familiaDe, rasgosDe } from "./rasgos";

/** Beta con prior Beta(1,1): dos números, cero dogmas. */
export type Evidencia = { a: number; b: number };

export type Vista = { ts: number; veces: number; pct: number };

export type Memoria = {
  v: 1;
  /** evidencia por rasgo: "tema:divisas", "tipo:video", "autor:alguien" */
  rasgo: Record<string, Evidencia>;
  /** qué se vio y cuándo (para no repetir y para volver a servir más tarde) */
  vistos: Record<string, Vista>;
  /** la sesión en curso: fatiga de tipo, autores repetidos */
  sesion: { inicio: number; tipo: Record<string, number>; autor: Record<string, number> };
  /** cuántos eventos ha aprendido y cuándo fue la última vez */
  eventos: number;
  actualizado: number;
};

export type Accion =
  | "vista"
  | "salta"
  | "gusta"
  | "desgusta"
  | "guarda"
  | "comparte"
  | "comenta"
  | "sigue"
  | "noInteresa";

export type Evento = {
  id: string;
  tipo: string;
  autor: string;
  titulo: string;
  temas?: readonly string[];
  accion: Accion;
  /** milisegundos que estuvo en pantalla */
  ms?: number;
  /** duración conocida del contenido (si es un vídeo, su largo) */
  duracionMs?: number;
  ts?: number;
};

/** Cuánto suma (o resta) cada gesto. La escala es la de un feed de verdad. */
export const RECOMPENSA: Record<Accion, { pos: number; neg: number }> = {
  vista: { pos: 0.45, neg: 0 },
  salta: { pos: 0, neg: 1 },
  gusta: { pos: 1.2, neg: 0 },
  desgusta: { pos: 0, neg: 0.8 },
  guarda: { pos: 1.4, neg: 0 },
  comparte: { pos: 1.6, neg: 0 },
  comenta: { pos: 0.8, neg: 0 },
  sigue: { pos: 2, neg: 0 },
  noInteresa: { pos: 0, neg: 2 },
};

const DIA = 86_400_000;
/** Vida media de un gusto: 30 días. */
export const VIDA_MEDIA_DIAS = 30;
/** Tope de evidencia por rasgo: nada se vuelve dogma (ni un 100 % eterno). */
const TOPE = 180;
/** Cuántos rasgos se guardan (los que más evidencia tienen). */
const MAX_RASGOS = 900;

export function memoriaVacia(ahora = 0): Memoria {
  return {
    v: 1,
    rasgo: {},
    vistos: {},
    sesion: { inicio: ahora, tipo: {}, autor: {} },
    eventos: 0,
    actualizado: ahora,
  };
}

/** Media de la Beta: 0.5 = no sé nada; 0.9 = casi siempre me gusta. */
export function media(e?: Evidencia): number {
  if (!e) return 0.5;
  return (1 + e.a) / (2 + e.a + e.b);
}

/** Certeza 0..1: con poca muestra se duda (y eso se usa para explorar). */
export function certeza(e?: Evidencia): number {
  if (!e) return 0;
  const n = e.a + e.b;
  return n / (n + 4);
}

/** La recompensa de un gesto; `vista` se afina con el porcentaje visto. */
export function recompensaDe(ev: Evento): { pos: number; neg: number } {
  const base = RECOMPENSA[ev.accion] ?? { pos: 0, neg: 0 };
  if (ev.accion !== "vista") return base;

  const ms = Math.max(0, ev.ms ?? 0);
  const dur = ev.duracionMs && ev.duracionMs > 0 ? ev.duracionMs : 15_000;
  const pct = Math.min(1, ms / dur);

  // salta antes de dos segundos: eso no es interés, es pasar de largo
  if (ms <= 2_000 || pct < 0.08) return { pos: 0, neg: 0.8 };
  if (pct < 0.25) return { pos: 0.15, neg: 0.3 };
  if (pct < 0.6) return { pos: 0.35, neg: 0 };
  if (pct < 0.9) return { pos: 0.65, neg: 0 };
  return { pos: 1, neg: 0 };
}

/** Aplica un evento: la única puerta por la que entra experiencia. */
export function aprender(memoria: Memoria, ev: Evento, ahora = ev.ts ?? 0): Memoria {
  const m: Memoria = {
    ...memoria,
    rasgo: { ...memoria.rasgo },
    vistos: { ...memoria.vistos },
    sesion: {
      inicio: memoria.sesion?.inicio ?? ahora,
      tipo: { ...(memoria.sesion?.tipo ?? {}) },
      autor: { ...(memoria.sesion?.autor ?? {}) },
    },
    eventos: memoria.eventos + 1,
    actualizado: ahora,
  };

  const { pos, neg } = recompensaDe(ev);
  const rasgos = rasgosDe({ tipo: ev.tipo, autor: ev.autor, titulo: ev.titulo, temas: ev.temas });

  for (const r of rasgos) {
    const fam = familiaDe(r);
    const peso = fam === "tema" ? 1 : fam === "tipo" ? 0.85 : 0.7;
    const e = m.rasgo[r] ?? { a: 0, b: 0 };
    m.rasgo[r] = {
      a: Math.min(TOPE, e.a + pos * peso),
      b: Math.min(TOPE, e.b + neg * peso),
    };
  }

  // salto y «no me interesa» marcan además el tipo (señal más gruesa)
  if (ev.accion === "noInteresa" || ev.accion === "salta") {
    const clave = `tipo:${ev.tipo}`;
    const e = m.rasgo[clave] ?? { a: 0, b: 0 };
    m.rasgo[clave] = { a: e.a, b: Math.min(TOPE, e.b + (ev.accion === "noInteresa" ? 1.2 : 0.3)) };
  }

  // historial de vistas: porcentaje máximo, veces y cuándo
  const previa = m.vistos[ev.id];
  if (ev.accion === "vista" || ev.accion === "salta") {
    const dur = ev.duracionMs && ev.duracionMs > 0 ? ev.duracionMs : 15_000;
    const pct = Math.min(1, Math.max(0, (ev.ms ?? 0) / dur));
    m.vistos[ev.id] = {
      ts: ahora,
      veces: (previa?.veces ?? 0) + 1,
      pct: Math.max(previa?.pct ?? 0, ev.accion === "salta" ? Math.min(pct, 0.1) : pct),
    };
  }

  // contadores de la sesión (fatiga)
  if (ahora - m.sesion.inicio > 3 * 3_600_000) {
    m.sesion = { inicio: ahora, tipo: {}, autor: {} };
  }
  m.sesion.tipo[ev.tipo] = (m.sesion.tipo[ev.tipo] ?? 0) + 1;
  m.sesion.autor[ev.autor] = (m.sesion.autor[ev.autor] ?? 0) + 1;

  return m;
}

/** Olvido suave: la evidencia se diluye hacia el prior con el tiempo. */
export function madurar(memoria: Memoria, ahora: number): Memoria {
  if (!memoria.actualizado) return { ...memoria, actualizado: ahora };
  const dias = Math.max(0, (ahora - memoria.actualizado) / DIA);
  if (dias < 1) return memoria;

  const factor = Math.pow(0.5, dias / VIDA_MEDIA_DIAS);
  const rasgo: Record<string, Evidencia> = {};
  for (const [k, e] of Object.entries(memoria.rasgo)) {
    const a = e.a * factor;
    const b = e.b * factor;
    // si ya no queda evidencia apreciable, el rasgo vuelve al anonimato
    if (a + b < 0.05) continue;
    rasgo[k] = { a, b };
  }

  // el historial de vistas caduca a los 30 días (el feed puede volver a servir)
  const vistos: Record<string, Vista> = {};
  for (const [k, v] of Object.entries(memoria.vistos)) {
    if (ahora - v.ts < 30 * DIA) vistos[k] = v;
  }

  // los rasgos con más evidencia sobreviven si hay demasiados
  const entradas = Object.entries(rasgo);
  if (entradas.length > MAX_RASGOS) {
    entradas.sort((x, y) => y[1].a + y[1].b - (x[1].a + x[1].b));
    return {
      ...memoria,
      rasgo: Object.fromEntries(entradas.slice(0, MAX_RASGOS)),
      vistos,
      actualizado: ahora,
    };
  }

  return { ...memoria, rasgo, vistos, actualizado: ahora };
}

/** ¿Cuándo se vio esto por última vez? (null si nunca) */
export function vistoHace(memoria: Memoria, id: string, ahora: number): number | null {
  const v = memoria.vistos[id];
  if (!v) return null;
  return Math.max(0, ahora - v.ts);
}

/** Los gustos del espectador, ordenados, para poder enseñárselos. */
export function gustos(memoria: Memoria, limite = 8): { rasgo: string; valor: number; certeza: number }[] {
  return Object.entries(memoria.rasgo)
    .map(([rasgo, e]) => ({ rasgo, valor: media(e), certeza: certeza(e) }))
    .filter((g) => g.certeza > 0.15)
    .sort((a, b) => b.valor * b.certeza - a.valor * a.certeza)
    .slice(0, limite);
}
