// ═══════════════════════════════════════════════════════════════════════════
// EL ALGORITMO DE LA CASA — puente entre las tarjetas del feed y el motor
//
// v191 hizo la primera versión (suma de engaño + frescura + afinidad). v432.4
// la sustituye por el motor de verdad (`lib/para-ti/motor.ts`): Beta por rasgo,
// predicción de estancia, exploración con muestreo de Thompson, castigos por
// repetición y diversidad en el orden. Este fichero NO duplica esa lógica:
// solo traduce las tarjetas de la casa a candidatos y los gestos a eventos.
//
// Todo lo aprendido vive en el aparato (`vg432:algoritmo:v2`). No hay servidor
// mirando, ni perfiles, ni datos personales.
// ═══════════════════════════════════════════════════════════════════════════

import {
  rango,
  salud,
  PESOS,
  type Candidato,
  type Desglose,
  type Puntuado,
} from "@/lib/para-ti/motor";
import { aprenderLocal, guardarMemoria, leerMemoria, olvidarTodo } from "@/lib/para-ti/almacen";
import { gustos, madurar, type Memoria } from "@/lib/para-ti/memoria";

// v317 LA MESA EN LA PORTADA: la escuela produce contenido con tus partidas —
// el tipo "mesa" es la última partida de la escuela entrando al algoritmo.
export type TipoFeed = "video" | "musica" | "foto" | "meme" | "tv" | "pulso" | "vivo" | "mesa";

export interface TarjetaFeed {
  id: string;
  tipo: TipoFeed;
  titulo: string;
  autor: string;
  ts: number; // epoch ms de creación
  likes: number;
  bola?: string; // código de countryball del autor
  datos?: Record<string, unknown>; // payload específico del tipo
}

export interface PerfilFeed {
  pesoTipo: Record<string, number>;
  pesoAutor: Record<string, number>;
  vistas: number;
  /** el modelo completo (evidencia Beta por rasgo) */
  memoria?: Memoria;
}

export interface TarjetaPuntuada {
  tarjeta: TarjetaFeed;
  score: number;
  porQue: string;
  /** el desglose numérico: la caja negra, abierta */
  desglose?: Desglose;
  rasgosTop?: string[];
}

const DURACION_ESTIMADA = 20_000;

// ── perfil (lo que el algoritmo sabe de ti, en la forma de siempre) ────────

export function leerPerfil(): PerfilFeed {
  const memoria = leerMemoria();
  const pesoTipo: Record<string, number> = {};
  const pesoAutor: Record<string, number> = {};
  for (const [rasgo, e] of Object.entries(memoria.rasgo)) {
    const valor = (1 + e.a) / (2 + e.a + e.b); // media de la Beta
    if (rasgo.startsWith("tipo:")) pesoTipo[rasgo.slice(5)] = valor;
    if (rasgo.startsWith("autor:")) pesoAutor[rasgo.slice(6)] = valor;
  }
  return {
    pesoTipo,
    pesoAutor,
    vistas: Object.keys(memoria.vistos).length,
    memoria,
  };
}

// ── traducir una tarjeta a candidato del motor ─────────────────────────────

function numero(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function aCandidato(t: TarjetaFeed): Candidato {
  const d = t.datos ?? {};
  const etiquetas = Array.isArray(d.tags) ? (d.tags as unknown[]).map(String) : [];
  return {
    id: t.id,
    tipo: t.tipo,
    autor: t.autor,
    ts: t.ts,
    titulo: t.titulo,
    temas: etiquetas,
    duracionMs: numero(d.duracionMs) || undefined,
    senales: {
      vistas: numero(d.vistas) || numero(d.views),
      likes: t.likes,
      compartidos: numero(d.compartidos) || numero(d.shares),
      guardados: numero(d.guardados) || numero(d.saves),
      estanciaMs: numero(d.estanciaMs) || numero(d.vistas) * 9_000,
    },
    // empuje legítimo: lo que ahora mismo está pasando, y lo que la casa
    // produjo para ti (pulsos del Productor, tu partida de la escuela)
    base: t.tipo === "vivo" ? 1.6 : t.tipo === "pulso" || t.tipo === "mesa" ? 1.2 : 0,
  };
}

// ── puntuación ─────────────────────────────────────────────────────────────

export function puntuar(t: TarjetaFeed, perfil: PerfilFeed, ahora: number): TarjetaPuntuada {
  const memoria = perfil.memoria ?? leerMemoria(ahora);
  const [p] = rango([aCandidato(t)], memoria, { ahora, semilla: "casa", limite: 1 });
  return {
    tarjeta: t,
    score: p?.score ?? 0,
    porQue: p?.porQue ?? "PARA DIVERSIFICARTE EL FEED",
    desglose: p?.desglose,
    rasgosTop: p?.rasgosTop,
  };
}

/** Ordena con el motor + diversidad. Sin candidatos, devuelve vacío. */
export function ordenarAlgoritmo(
  tarjetas: TarjetaFeed[],
  perfil: PerfilFeed,
  ahora: number,
): TarjetaPuntuada[] {
  const memoria = perfil.memoria ?? leerMemoria(ahora);
  const candidatos = tarjetas.map(aCandidato);
  const ordenados = rango(candidatos, memoria, { ahora, semilla: semillaDeSesion(), limite: tarjetas.length });
  const porId = new Map(tarjetas.map((t) => [t.id, t]));

  return ordenados.map((p: Puntuado) => ({
    tarjeta: porId.get(p.candidato.id) as TarjetaFeed,
    score: p.score,
    porQue: p.porQue,
    desglose: p.desglose,
    rasgosTop: p.rasgosTop,
  }));
}

/** Orden cronológico puro (pestaña RECIENTE). */
export function ordenarReciente(tarjetas: TarjetaFeed[]): TarjetaPuntuada[] {
  return [...tarjetas]
    .sort((a, b) => b.ts - a.ts)
    .map((tarjeta) => ({ tarjeta, score: 0, porQue: "LO MÁS NUEVO PRIMERO" }));
}

/** El barajado de la sesión: cambia al recargar, no en cada render. */
function semillaDeSesion(): string {
  if (typeof window === "undefined") return "casa";
  try {
    const guardada = window.sessionStorage.getItem("vg432:semilla");
    if (guardada) return guardada;
    const nueva = Math.random().toString(36).slice(2, 10);
    window.sessionStorage.setItem("vg432:semilla", nueva);
    return nueva;
  } catch {
    return "casa";
  }
}

// ── señales: cada gesto del espectador entra aquí ──────────────────────────

type Extra = {
  id?: string;
  titulo?: string;
  temas?: readonly string[];
  ms?: number;
  duracionMs?: number;
};

function evento(t: TarjetaFeed, accion: Parameters<typeof aprenderLocal>[0]["accion"], extra?: Extra) {
  return aprenderLocal({
    id: extra?.id ?? t.id,
    tipo: t.tipo,
    autor: t.autor,
    titulo: extra?.titulo ?? t.titulo,
    temas: extra?.temas ?? (Array.isArray(t.datos?.tags) ? (t.datos?.tags as unknown[]).map(String) : undefined),
    accion,
    ms: extra?.ms,
    duracionMs: extra?.duracionMs ?? (typeof t.datos?.duracionMs === "number" ? t.datos.duracionMs : DURACION_ESTIMADA),
  });
}

/**
 * El espectador MIRÓ una tarjeta. Ahora con el dato que de verdad importa:
 * cuánto tiempo estuvo en pantalla. Un vistazo de un segundo no es un «me
 * gusta» — y el motor lo distingue.
 */
export function notaVista(tipo: TipoFeed, autor: string, extra?: Extra): void {
  evento({ id: extra?.id ?? "", tipo, autor, titulo: extra?.titulo ?? "", ts: Date.now(), likes: 0 }, "vista", extra);
}

/** Marcador de «esto ya se vio», sin señal de gusto (no ensucia el perfil). */
export function marcarVista(id: string, ahora = Date.now()): void {
  if (!id) return;
  try {
    const m = leerMemoria(ahora);
    const previa = m.vistos[id];
    m.vistos[id] = { ts: ahora, veces: (previa?.veces ?? 0) + 1, pct: previa?.pct ?? 0 };
    guardarMemoria(madurar(m, ahora));
  } catch {
    /* sin almacén: el feed sigue */
  }
}

/** LIKE — la señal clásica, fuerte pero no la más fuerte. */
export function notaLike(tipo: TipoFeed, autor: string, extra?: Extra): void {
  evento({ id: extra?.id ?? "", tipo, autor, titulo: extra?.titulo ?? "", ts: Date.now(), likes: 0 }, "gusta", extra);
}

/** Quitar el like también enseña (hacia abajo, pero flojo). */
export function notaDesgusta(tipo: TipoFeed, autor: string, extra?: Extra): void {
  evento({ id: extra?.id ?? "", tipo, autor, titulo: extra?.titulo ?? "", ts: Date.now(), likes: 0 }, "desgusta", extra);
}

/** GUARDAR — «esto lo quiero tener»: por encima del like. */
export function notaGuarda(tipo: TipoFeed, autor: string, extra?: Extra): void {
  evento({ id: extra?.id ?? "", tipo, autor, titulo: extra?.titulo ?? "", ts: Date.now(), likes: 0 }, "guarda", extra);
}

/** COMPARTIR — la señal más fuerte de un feed real. */
export function notaComparte(tipo: TipoFeed, autor: string, extra?: Extra): void {
  evento({ id: extra?.id ?? "", tipo, autor, titulo: extra?.titulo ?? "", ts: Date.now(), likes: 0 }, "comparte", extra);
}

/** Comentarios abiertos — interés medio. */
export function notaComentario(tipo: TipoFeed, autor?: string, extra?: Extra): void {
  evento({ id: extra?.id ?? "", tipo, autor: autor ?? "", titulo: extra?.titulo ?? "", ts: Date.now(), likes: 0 }, "comenta", extra);
}

/** «NO ME INTERESA» — se aparta de verdad, pero no para siempre. */
export function notaNoInteresa(tipo: TipoFeed, autor: string, extra?: Extra): void {
  evento({ id: extra?.id ?? "", tipo, autor, titulo: extra?.titulo ?? "", ts: Date.now(), likes: 0 }, "noInteresa", extra);
}

/** Siguió al autor — el compromiso más alto. */
export function notaSigue(tipo: TipoFeed, autor: string, extra?: Extra): void {
  evento({ id: extra?.id ?? "", tipo, autor, titulo: extra?.titulo ?? "", ts: Date.now(), likes: 0 }, "sigue", extra);
}

// ── la sala de máquinas: lo que el algoritmo ha aprendido, a la vista ──────

export { gustos, salud, PESOS, olvidarTodo as olvidarAlgoritmo, leerMemoria };

/** Termómetro del feed actual (para el cartel de la sala de máquinas). */
export function termometro(puntuados: readonly TarjetaPuntuada[]) {
  const saludable = salud(
    puntuados
      .filter((p) => p.desglose)
      .map((p) => ({
        candidato: aCandidato(p.tarjeta),
        score: p.score,
        desglose: p.desglose as Desglose,
        porQue: p.porQue,
        rasgosTop: p.rasgosTop ?? [],
      }))
  );
  return saludable;
}
