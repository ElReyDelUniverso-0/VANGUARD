// ═══════════════════════════════════════════════════════════════════
// v411.0 · EL MOTOR DEL LABORATORIO
//
// Corre un modelo declarativo paso a paso y devuelve TODO separado: series,
// métricas, eventos, lectura y huella. Es puro y determinista: los mismos
// parámetros con la misma semilla dan exactamente la misma corrida, así que
// un experimento guardado se puede reproducir meses después.
//
// LO QUE EL MOTOR GARANTIZA
//   · Los parámetros se recortan al rango declarado: no hay valores imposibles.
//   · Ninguna serie puede contener NaN ni infinitos: si un modelo los produce,
//     el motor lo detecta y lo declara en el resultado en vez de pintar basura.
//   · La huella es un hash corto y estable del escenario (modelo + parámetros +
//     semilla + pasos). Sirve para citar una corrida en una conversación.
// ═══════════════════════════════════════════════════════════════════

import type {
  EstadoLab,
  ModeloLab,
  ParametrosLab,
  ResultadoLab,
  VariableLab,
} from "./tipos";
import { limitar, redondear } from "./tipos";

export interface OpcionesCorrida {
  pasos?: number;
  semilla?: number;
}

/** Parámetros por defecto de un modelo (los declarados en sus variables). */
export function parametrosDefecto(modelo: ModeloLab): ParametrosLab {
  const p: ParametrosLab = {};
  for (const v of modelo.variables) p[v.id] = v.defecto;
  return p;
}

/** Recorta y valida: cualquier valor fuera de rango vuelve al límite. */
export function normalizarParametros(modelo: ModeloLab, entrada: ParametrosLab): ParametrosLab {
  const salida: ParametrosLab = {};
  for (const v of modelo.variables) {
    const crudo = entrada[v.id];
    const num = typeof crudo === "number" && Number.isFinite(crudo) ? crudo : v.defecto;
    salida[v.id] = limitar(num, v.min, v.max);
  }
  return salida;
}

/** Hash FNV-1a de 32 bits en hexadecimal: la huella del escenario. */
export function huellaDe(modelo: ModeloLab, p: ParametrosLab, pasos: number, semilla: number): string {
  const texto = `${modelo.id}|${pasos}|${semilla}|${modelo.variables.map((v) => `${v.id}:${p[v.id]}`).join(",")}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0").toUpperCase();
}

/** Corre el modelo y devuelve el resultado completo. */
export function simular(modelo: ModeloLab, entrada: ParametrosLab, opciones: OpcionesCorrida = {}): ResultadoLab {
  const p = normalizarParametros(modelo, entrada);
  const pasos = Math.max(1, Math.min(modelo.pasosMax, Math.round(opciones.pasos ?? modelo.pasosDefecto)));
  const semilla = Math.round(opciones.semilla ?? 20260101);

  const inicial = modelo.init(p, semilla);
  let estado: EstadoLab = { ...inicial };
  const estados: EstadoLab[] = [estado];

  const series: ResultadoLab["series"] = modelo.series.map((s) => ({
    campo: s.campo,
    nombre: s.nombre,
    color: s.color,
    unidad: s.unidad,
    valores: [],
  }));
  const porCampo = new Map(series.map((s) => [s.campo, s]));

  const registrar = (e: EstadoLab) => {
    const d = modelo.derivar(e, p);
    const plano: Record<string, number> = { ...e, ...d };
    for (const s of series) {
      const v = plano[s.campo];
      s.valores.push(Number.isFinite(v) ? redondear(v, 4) : 0);
    }
  };

  registrar(estado);

  const eventos: ResultadoLab["eventos"] = [];
  for (let i = 1; i <= pasos; i++) {
    estado = modelo.step(estado, p, i, semilla);
    // Saneamiento: un modelo no puede envenenar la serie con NaN.
    const saneado: EstadoLab = {};
    for (const [k, v] of Object.entries(estado)) saneado[k] = Number.isFinite(v) ? v : 0;
    estado = saneado;
    estados.push(estado);
    registrar(estado);
  }

  const derivadaFinal = modelo.derivar(estado, p);
  const derivadaInicial = modelo.derivar(inicial, p);
  const metricas = modelo.metricas.map((m) => {
    const valor = Number.isFinite(derivadaFinal[m.campo]) ? derivadaFinal[m.campo] : 0;
    const ini = Number.isFinite(derivadaInicial[m.campo]) ? derivadaInicial[m.campo] : 0;
    return {
      campo: m.campo,
      nombre: m.nombre,
      unidad: m.unidad,
      formato: m.formato,
      decimales: m.decimales,
      valor: redondear(valor, m.decimales + 2),
      inicial: redondear(ini, m.decimales + 2),
      nota: m.nota,
    };
  });

  const etiquetasTiempo: string[] = [];
  for (let i = 0; i <= pasos; i++) {
    etiquetasTiempo.push(
      modelo.anioInicial !== undefined ? String(modelo.anioInicial + i) : `+${i} ${modelo.unidadTiempo}`
    );
  }

  // Avisos de rango: si una variable acabó en su tope, el resultado está
  // empujando el modelo fuera de su zona razonable y hay que decirlo.
  for (const v of modelo.variables) {
    if (p[v.id] === v.max) eventos.push({ paso: 0, texto: `«${v.nombre}» está en su tope (${v.max} ${v.unidad}): el resultado se lee con cuidado.`, tipo: "limite" });
    if (p[v.id] === v.min) eventos.push({ paso: 0, texto: `«${v.nombre}» está en su mínimo (${v.min} ${v.unidad}).`, tipo: "limite" });
  }

  const sinFin = series.find((s) => s.valores.some((x) => !Number.isFinite(x)));

  return {
    modeloId: modelo.id,
    pasos,
    semilla,
    etiquetasTiempo,
    series,
    metricas,
    eventos,
    lectura: [
      ...modelo.lectura(estado, p, { inicial, pasos }),
      ...(sinFin ? ["Una serie produjo valores no finitos: el modelo se ha recortado para no pintar datos falsos."] : []),
    ],
    mapa: modelo.mapa ? modelo.mapa(estado, p) : undefined,
    huella: huellaDe(modelo, p, pasos, semilla),
  };
}

export interface ComparacionLab {
  a: ResultadoLab;
  b: ResultadoLab;
  filas: { nombre: string; unidad: string; formato: string; decimales: number; a: number; b: number; delta: number; deltaPct: number | null }[];
}

/** Compara dos corridas del MISMO modelo (escenario A contra escenario B). */
export function comparar(a: ResultadoLab, b: ResultadoLab): ComparacionLab {
  const filas = a.metricas.map((m) => {
    const otro = b.metricas.find((x) => x.campo === m.campo);
    const vb = otro ? otro.valor : 0;
    return {
      nombre: m.nombre,
      unidad: m.unidad,
      formato: m.formato,
      decimales: m.decimales,
      a: m.valor,
      b: vb,
      delta: redondear(vb - m.valor, 3),
      deltaPct: m.valor !== 0 ? redondear(((vb - m.valor) / Math.abs(m.valor)) * 100, 1) : null,
    };
  });
  return { a, b, filas };
}

/** CSV con todas las series (una fila por paso). */
export function exportarCSV(r: ResultadoLab): string {
  const cabecera = ["paso", "tiempo", ...r.series.map((s) => `${s.nombre} (${s.unidad})`)];
  const filas = r.etiquetasTiempo.map((t, i) => [i, t, ...r.series.map((s) => s.valores[i])]);
  return [cabecera.join(";"), ...filas.map((f) => f.join(";"))].join("\n");
}

/** JSON reproducible: incluye la huella y la versión, para citar una corrida. */
export function exportarJSON(modelo: ModeloLab, p: ParametrosLab, r: ResultadoLab): string {
  return JSON.stringify(
    {
      formato: "vanguard-labs/v1",
      modelo: { id: modelo.id, nombre: modelo.nombre },
      escenario: { parametros: p, pasos: r.pasos, semilla: r.semilla, huella: r.huella },
      supuestos: modelo.supuestos,
      limites: modelo.limites,
      series: Object.fromEntries(r.series.map((s) => [s.campo, s.valores])),
      metricas: r.metricas,
      eventos: r.eventos,
      aviso: "Simulación de sistema dinámico con supuestos declarados. NO es una predicción.",
    },
    null,
    2
  );
}

/** Resumen legible de un experimento guardado en el navegador. */
export interface ExperimentoGuardado {
  id: string;
  modeloId: string;
  nombre: string;
  creado: string;
  parametros: ParametrosLab;
  pasos: number;
  semilla: number;
  huella: string;
}

export const LIMITE_EXPERIMENTOS = 24;
export const CLAVE_ALMACEN = "vanguard-labs/experimentos/v1";

export function variablesFueraDeDefecto(variables: VariableLab[], p: ParametrosLab): VariableLab[] {
  return variables.filter((v) => Math.abs((p[v.id] ?? v.defecto) - v.defecto) > 1e-9);
}
