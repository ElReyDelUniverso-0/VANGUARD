// ═══════════════════════════════════════════════════════════════════════════
// v432.4 · EL ALGORITMO — el motor del «PARA TI» de VANGUARD
//
// Mandato del Dueño: «agrégale un algoritmo como el de TikTok». Lo que hace
// TikTok, desarmado en piezas honestas:
//
//   1. NO ordena por fecha. Predice qué vas a ver hasta el final.
//   2. Cada gesto se convierte en recompensa (saltar resta; terminar, like,
//      guardar y compartir suman) y se aprende por rasgo, con incertidumbre.
//   3. Mezcla siempre un poco de lo desconocido (exploración con muestreo de
//      Thompson): si nunca te enseña algo nuevo, no puede aprender nada nuevo.
//   4. Castiga lo repetido y lo que ya saltaste, pero no lo entierra: a las
//      horas vuelve a tener derecho a intentarlo.
//   5. Cuida la sesión: variedad de tipos y de autores, como el feed real,
//      que no te pone tres cosas iguales seguidas.
//   6. DA LA CARA: cada tarjeta trae su desglose numérico y una frase que
//      explica por qué está ahí. Sin caja negra y sin datos inventados.
//
// Puro y determinista: la exploración usa una semilla derivada del id, así que
// la misma entrada da el mismo orden (y se puede probar).
// ═══════════════════════════════════════════════════════════════════════════

import { familiaDe, llano, PESO_RASGO, rasgosDe, temasDe } from "./rasgos";
import { certeza, media, vistoHace, type Memoria } from "./memoria";

export type SenalesContenido = {
  vistas?: number;
  likes?: number;
  compartidos?: number;
  guardados?: number;
  /** milisegundos totales que la gente ha pasado en este contenido */
  estanciaMs?: number;
};

export type Candidato = {
  id: string;
  tipo: string;
  autor: string;
  /** epoch ms de creación */
  ts: number;
  titulo: string;
  temas?: readonly string[];
  senales?: SenalesContenido;
  /** empuje editorial legítimo: EN VIVO ahora, contenido producido para ti… */
  base?: number;
  /** cuánto dura (ms) si se sabe; si no, se estima */
  duracionMs?: number;
};

export type Desglose = {
  /** lo que se espera que te guste (0..1) */
  gusto: number;
  /** lo que se espera que veas hasta el final (0..1) */
  estancia: number;
  /** enganche medido del contenido en la casa (0..1) */
  enganche: number;
  /** frescura (0..1) */
  frescura: number;
  /** hueco de exploración (0..1) */
  exploracion: number;
  /** empuje editorial declarado */
  base: number;
  /** castigos (≤ 0): repetido, saltado, fatiga */
  castigo: number;
};

export type Puntuado = {
  candidato: Candidato;
  score: number;
  desglose: Desglose;
  porQue: string;
  /** los rasgos que más pesaron, para poder enseñarlos */
  rasgosTop: string[];
};

export type Contexto = {
  ahora: number;
  /** la misma semilla = el mismo feed (una sesión, un barajado) */
  semilla?: string | number;
  limite?: number;
};

/** Los pesos del motor. Suma 1 entre los «buenos»; el castigo es aparte. */
export const PESOS = {
  gusto: 2.4,
  estancia: 1.5,
  enganche: 1,
  frescura: 1.7,
  exploracion: 0.7,
} as const;

/** Vida media de la frescura por tipo (horas). Lo efímero se apaga antes. */
export const VIDA_MEDIA_HORAS: Record<string, number> = {
  vivo: 3,
  pulso: 12,
  mesa: 24,
  meme: 18,
  video: 24,
  musica: 36,
  foto: 30,
  tv: 12,
  default: 15,
};

/** Por debajo de esto, un contenido ya visto se considera «recién visto». */
const RECIEN_MS = 8 * 3_600_000;

// ── azar reproducible (no hay Math.random en el motor) ─────────────────────

function hashCadena(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Muestreo de una Beta(a+1, b+1) con dos gammas de Marsaglia–Tsang. */
function muestraBeta(a: number, b: number, rnd: () => number): number {
  const gamma = (k: number): number => {
    if (k < 1) return gamma(k + 1) * Math.pow(Math.max(rnd(), 1e-9), 1 / k);
    const d = k - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    for (;;) {
      let x = 0;
      let v = 0;
      do {
        const u1 = Math.max(rnd(), 1e-9);
        const u2 = rnd();
        x = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        v = 1 + c * x;
      } while (v <= 0);
      v = v * v * v;
      const u = rnd();
      if (u < 1 - 0.0331 * x * x * x * x) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  };
  const x = gamma(Math.max(a, 1e-6));
  const y = gamma(Math.max(b, 1e-6));
  return x / (x + y);
}

// ── piezas de la puntuación ────────────────────────────────────────────────

/** Gusto esperado por rasgo, encogido según la certeza (nada de dogmas). */
export function gustoDe(rasgos: string[], memoria: Memoria): { valor: number; top: string[] } {
  let suma = 0;
  let pesos = 0;
  let mejor = { valor: 0.5, rasgo: "" };
  for (const r of rasgos) {
    const fam = familiaDe(r);
    const peso = PESO_RASGO[fam] ?? 0.3;
    const e = memoria.rasgo[r];
    const c = certeza(e);
    // media encogida hacia 0.5: con poca evidencia no se cree nada
    const valor = 0.5 + (media(e) - 0.5) * (0.3 + 0.7 * c);
    suma += valor * peso;
    pesos += peso;
    if (Math.abs(valor - 0.5) > Math.abs(mejor.valor - 0.5)) mejor = { valor, rasgo: r };
  }
  const valor = pesos > 0 ? suma / pesos : 0.5;
  return { valor, top: mejor.rasgo ? [mejor.rasgo] : [] };
}

/** Cuánto se espera que veas hasta el final: lo medido + tu costumbre. */
export function estanciaDe(c: Candidato, memoria: Memoria): number {
  const s = c.senales ?? {};
  const vistas = Math.max(0, s.vistas ?? 0);
  const dur = c.duracionMs && c.duracionMs > 0 ? c.duracionMs : 20_000;
  const medido = vistas > 0 ? Math.min(1, Math.max(0, (s.estanciaMs ?? 0) / (vistas * dur))) : 0.35;

  const vistos = Object.values(memoria.vistos);
  const tuMedia = vistos.length
    ? vistos.reduce((acc, v) => acc + v.pct, 0) / vistos.length
    : 0.35;

  return Math.min(1, Math.max(0, 0.6 * medido + 0.4 * tuMedia));
}

/** Enganche del contenido en la casa, suavizado (nada de 1 like = 100 %). */
export function engancheDe(c: Candidato): number {
  const s = c.senales ?? {};
  const vistas = Math.max(0, s.vistas ?? 0);
  const positivas = (s.likes ?? 0) + 1.5 * (s.guardados ?? 0) + 2 * (s.compartidos ?? 0);
  const tasa = (positivas + 1) / (vistas + 20); // suavizado de Laplace
  return Math.min(1, tasa * 8);
}

/** Frescura con vida media por tipo: lo nuevo pesa, lo viejo no muere. */
export function frescuraDe(c: Candidato, ahora: number): number {
  const vida = VIDA_MEDIA_HORAS[llano(c.tipo)] ?? VIDA_MEDIA_HORAS.default;
  const horas = Math.max(0, (ahora - c.ts) / 3_600_000);
  return Math.pow(0.5, horas / vida);
}

/** Los rasgos con menos certeza (los que más pueden enseñar). */
export function incertidumbreDe(rasgos: string[], memoria: Memoria): { valor: number; rasgo: string } {
  let mejor = { valor: 0, rasgo: "" };
  for (const r of rasgos) {
    const c = certeza(memoria.rasgo[r]);
    if (1 - c > mejor.valor) mejor = { valor: 1 - c, rasgo: r };
  }
  return mejor;
}

/** Castigos: lo repetido, lo saltado y la fatiga de la sesión. */
export function castigoDe(c: Candidato, memoria: Memoria, ahora: number, rnd: () => number): number {
  let castigo = 0;

  const hace = vistoHace(memoria, c.id, ahora);
  if (hace !== null && hace < RECIEN_MS) {
    const fuerza = 1 - hace / RECIEN_MS; // 1 = ahora mismo
    castigo -= 1.8 * fuerza;
    const v = memoria.vistos[c.id];
    if (v && v.pct < 0.3) castigo -= 0.7; // lo saltaste: no insistas igual
  }

  const delAutor = memoria.sesion?.autor?.[c.autor] ?? 0;
  if (delAutor > 1) castigo -= 0.45 * Math.min(3, delAutor - 1);

  const delTipo = memoria.sesion?.tipo?.[c.tipo] ?? 0;
  if (delTipo > 2) castigo -= 0.35 * Math.min(4, delTipo - 2);

  // un pelín de ruido determinista: dos contenidos iguales no empatan siempre
  castigo -= 0.12 * rnd();
  return castigo;
}

/** Puntúa un candidato con todo el desglose a la vista. */
export function puntuar(c: Candidato, memoria: Memoria, ctx: Contexto): Puntuado {
  const ahora = ctx.ahora;
  const rasgos = rasgosDe(c);
  const semilla = hashCadena(`${ctx.semilla ?? "casa"}|${c.id}`);

  const { valor: gusto, top } = gustoDe(rasgos, memoria);
  const estancia = estanciaDe(c, memoria);
  const enganche = engancheDe(c);
  const frescura = frescuraDe(c, ahora);

  const incierta = incertidumbreDe(rasgos, memoria);
  const tirada = muestraBeta(1 + (memoria.rasgo[incierta.rasgo]?.a ?? 0), 1 + (memoria.rasgo[incierta.rasgo]?.b ?? 0), mulberry32(semilla));
  const exploracion = incierta.rasgo ? tirada * incierta.valor : 0;

  const castigo = castigoDe(c, memoria, ahora, mulberry32(semilla ^ 0x9e3779b9));
  const base = c.base ?? 0;

  const score =
    PESOS.gusto * gusto +
    PESOS.estancia * estancia +
    PESOS.enganche * enganche +
    PESOS.frescura * frescura +
    PESOS.exploracion * exploracion +
    base +
    castigo;

  const desglose: Desglose = { gusto, estancia, enganche, frescura, exploracion, base, castigo };

  return {
    candidato: c,
    score,
    desglose,
    porQue: explicar(c, desglose, memoria, ahora),
    rasgosTop: [incierta.rasgo, ...top].filter(Boolean),
  };
}

/** La frase que el feed enseña: por qué está esto aquí, en cristiano. */
export function explicar(c: Candidato, d: Desglose, memoria: Memoria, ahora: number): string {
  const rasgo = Object.entries(memoria.rasgo)
    .map(([r, e]) => ({ r, v: media(e), c: certeza(e) }))
    .filter((x) => rasgosDe(c).includes(x.r))
    .sort((a, b) => b.v * b.c - a.v * a.c)[0];

  const hace = vistoHace(memoria, c.id, ahora);
  if (hace !== null && hace < RECIEN_MS && d.castigo <= -1.5) return "LO VISTE HACE POCO";
  if (d.base >= 1.4) return "EN VIVO AHORA MISMO";
  if (d.exploracion >= 0.35) return "PARA QUE DESCUBRAS ALGO NUEVO";
  if (rasgo && rasgo.c > 0.35 && rasgo.v > 0.62) return `PORQUE TE GUSTA ${etiqueta(rasgo.r)}`;
  if (ahora - c.ts < 2 * 3_600_000) return "RECIÉN LLEGADO AL MUNDO";
  if (d.enganche > 0.5) return "ESTÁ PEGANDO EN LA CASA";
  if (d.estancia > 0.75) return "ESTO LO SUELE VER HASTA EL FINAL";
  if (d.castigo < -0.5) return "OTRA VUELTA POR AQUÍ";
  return "PARA DIVERSIFICARTE EL FEED";
}

function etiqueta(rasgo: string): string {
  const [fam, ...resto] = rasgo.split(":");
  const valor = resto.join(":");
  if (fam === "autor") return `@${valor.toUpperCase()}`;
  if (fam === "tipo") return `${valor.toUpperCase()}`;
  return valor.toUpperCase();
}

/**
 * ORDEN FINAL: puntuación + diversidad. Se elige siempre lo mejor, pero si
 * repetir tipo, autor o tema cuesta más que la ventaja del candidato, gana el
 * distinto. Así el feed no se vuelve una lista de lo mismo.
 */
export function ordenar(puntuados: Puntuado[], limite?: number): Puntuado[] {
  const resto = [...puntuados].sort((a, b) => b.score - a.score);
  const salida: Puntuado[] = [];
  const tope = limite ?? resto.length;

  while (resto.length > 0 && salida.length < tope) {
    const temasUsados = new Set(
      salida.slice(-3).map((p) => temasDe(p.candidato.titulo, p.candidato.temas)[0]).filter(Boolean)
    );
    const ult = salida[salida.length - 1];
    const penult = salida[salida.length - 2];

    // REGLA DURA: si las dos últimas son del mismo tipo, la tercera de ese tipo
    // no entra mientras haya otra cosa. Es lo que hace el feed real: no te
    // enseña tres memes seguidos aunque sean los tres mejores.
    const bloqueado = ult && penult && ult.candidato.tipo === penult.candidato.tipo ? ult.candidato.tipo : null;
    let elegibles = bloqueado ? resto.filter((p) => p.candidato.tipo !== bloqueado) : resto;
    if (elegibles.length === 0) elegibles = resto;

    let elegido = elegibles[0];
    let mejorValor = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < elegibles.length && i < 40; i += 1) {
      const p = elegibles[i];
      let valor = p.score;
      if (ult && ult.candidato.tipo === p.candidato.tipo) valor -= 0.9;
      if (ult && ult.candidato.autor === p.candidato.autor) valor -= 1.1;
      const tema = temasDe(p.candidato.titulo, p.candidato.temas)[0];
      if (tema && temasUsados.has(tema)) valor -= 0.7;
      if (valor > mejorValor) {
        mejorValor = valor;
        elegido = p;
      }
    }
    salida.push(resto.splice(resto.indexOf(elegido), 1)[0]);
  }

  return salida;
}

/**
 * LA PUERTA: recibe candidatos reales y la memoria del espectador, y devuelve
 * el feed ordenado. Si no hay candidatos, devuelve vacío (no inventa nada).
 */
export function rango(candidatos: readonly Candidato[], memoria: Memoria, ctx: Contexto): Puntuado[] {
  if (!candidatos.length) return [];
  const ahora = ctx.ahora;
  const vistos = candidatos.map((c) => puntuar(c, memoria, { ...ctx, ahora }));
  return ordenar(vistos, ctx.limite);
}

/** Media de la puntuación: sirve de termómetro en la sala de máquinas. */
export function salud(puntuados: readonly Puntuado[]): {
  n: number;
  media: number;
  exploracion: number;
  castigo: number;
  frescura: number;
} {
  if (!puntuados.length) return { n: 0, media: 0, exploracion: 0, castigo: 0, frescura: 0 };
  const n = puntuados.length;
  const suma = (f: (p: Puntuado) => number) => puntuados.reduce((a, p) => a + f(p), 0) / n;
  return {
    n,
    media: suma((p) => p.score),
    exploracion: suma((p) => p.desglose.exploracion),
    castigo: suma((p) => p.desglose.castigo),
    frescura: suma((p) => p.desglose.frescura),
  };
}
