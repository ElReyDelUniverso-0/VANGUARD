// ═══════════════════════════════════════════════════════════════════
// v416.0 · EXPLICAR LA DIFERENCIA — la frase que falta en todo comparador
// Departamento 4 · VANGUARD WORLD DATA
//
// El encargo lo pide con estas palabras: «un usuario debe poder seleccionar dos
// países, comparar sus indicadores y COMPRENDER las diferencias mediante
// gráficos y explicaciones». Una tabla de dos columnas no explica nada: hay que
// decir cuántas veces es uno respecto del otro, cuánto es la brecha en la
// unidad del indicador y —lo que casi nadie hace— si los dos datos son del
// mismo año, porque comparar 2024 con 2019 y callarlo es mentir con números
// verdaderos.
//
// Este archivo es PURO: entra un par de cifras con su año, sale una frase. No
// llama a ninguna fuente y no decide nada que no esté en el dato.
// ═══════════════════════════════════════════════════════════════════

import type { Indicador } from "./catalogo";
import { fmtAnio, fmtValor, fmtVeces, SIN_DATO } from "./formato";

export interface Cifra {
  iso: string;
  pais: string;
  valor: number | null;
  anio: number | null;
}

export interface Explicacion {
  /** qué clase de frase es, para que la interfaz elija el color */
  tipo: "mayor" | "menor" | "igual" | "sin_dato";
  /** la frase, en español y en una línea */
  texto: string;
  /** aviso metodológico cuando la comparación no es estricta */
  aviso?: string;
  /** cuántas veces es el mayor respecto del menor (null si no aplica) */
  veces: number | null;
}

/** Diferencia absoluta con la unidad del indicador, para que se entienda la escala. */
function brecha(ind: Indicador, mayor: number, menor: number): string {
  const d = Math.abs(mayor - menor);
  return fmtValor(d, ind);
}

/**
 * Compara dos cifras del MISMO indicador y devuelve la frase.
 * No dice «mejor» ni «peor»: el sentido del indicador se declara aparte, en la
 * metodología, porque confundir «más alto» con «mejor» es el error clásico.
 */
export function explicarPar(a: Cifra, b: Cifra, ind: Indicador): Explicacion {
  const av = a.valor;
  const bv = b.valor;
  if (av === null || bv === null || !Number.isFinite(av) || !Number.isFinite(bv)) {
    const quien = a.valor === null ? a.pais : b.pais;
    return {
      tipo: "sin_dato",
      texto: `No se puede comparar ${ind.nombre.toLowerCase()}: la fuente no publica el dato de ${quien}.`,
      aviso: "La casa no estima ni rellena huecos: si el Banco Mundial no lo publica, aquí se escribe «sin dato».",
      veces: null,
    };
  }

  const avisos: string[] = [];
  const mismoAnio = a.anio !== null && b.anio !== null && a.anio === b.anio;
  if (a.anio !== null && b.anio !== null && !mismoAnio) {
    const salto = Math.abs(a.anio - b.anio);
    avisos.push(
      `Los datos no son del mismo año: ${a.pais} es de ${a.anio} y ${b.pais} de ${b.anio} (${salto} ${salto === 1 ? "año" : "años"} de diferencia). La brecha incluye ese tiempo.`
    );
  }
  if (ind.sentido === "bajo") {
    avisos.push("En este indicador, un valor más bajo se lee como mejor situación. La cifra no dice por sí sola la causa.");
  } else if (ind.sentido === "alto") {
    avisos.push("En este indicador, un valor más alto se lee como mejor situación. La cifra no dice por sí sola la causa.");
  }

  if (av === bv) {
    return {
      tipo: "igual",
      texto: `${a.pais} y ${b.pais} tienen la misma cifra en ${ind.nombre.toLowerCase()}: ${fmtValor(av, ind)} ${fmtAnio(a.anio)}.`,
      aviso: avisos.join(" "),
      veces: 1,
    };
  }

  const mayor = av > bv ? { ...a, valor: av } : { ...b, valor: bv };
  const menor = av > bv ? { ...b, valor: bv } : { ...a, valor: av };
  const ratio = menor.valor === 0 ? null : mayor.valor / menor.valor;
  const veces = ratio !== null && ratio >= 1.01 ? fmtVeces(ratio) : null;

  const nombre = ind.nombre.toLowerCase();
  const nucleo = veces
    ? `${mayor.pais} tiene ${veces} veces más ${nombre} que ${menor.pais}: ${fmtValor(mayor.valor, ind)} frente a ${fmtValor(menor.valor, ind)}; la diferencia es de ${brecha(ind, mayor.valor, menor.valor)}.`
    : `${mayor.pais} supera a ${menor.pais} en ${nombre}: ${fmtValor(mayor.valor, ind)} frente a ${fmtValor(menor.valor, ind)} ${fmtAnio(mayor.anio)}.`;

  return {
    tipo: mayor.iso === a.iso ? "mayor" : "menor",
    texto: nucleo,
    aviso: avisos.length ? avisos.join(" ") : undefined,
    veces: ratio,
  };
}

/** Resume la serie de un país: de dónde a dónde, y con cuántos años de dato. */
export function explicarSerie(puntos: { anio: number; valor: number }[], ind: Indicador, pais: string): string {
  if (!puntos.length) return `${pais}: ${SIN_DATO} de ${ind.nombre.toLowerCase()} en la serie consultada.`;
  const primero = puntos[0];
  const ultimo = puntos[puntos.length - 1];
  const signo = ultimo.valor > primero.valor ? "sube" : ultimo.valor < primero.valor ? "baja" : "no cambia";
  const cambio = primero.valor !== 0 ? ((ultimo.valor - primero.valor) / Math.abs(primero.valor)) * 100 : null;
  const cola = cambio === null ? "" : ` (${cambio > 0 ? "+" : ""}${cambio.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %)`;
  return `${pais}: ${ind.nombre.toLowerCase()} ${signo} de ${fmtValor(primero.valor, ind)} en ${primero.anio} a ${fmtValor(ultimo.valor, ind)} en ${ultimo.anio}${cola}, con ${puntos.length} ${puntos.length === 1 ? "año" : "años"} con dato.`;
}

/**
 * Qué se puede decir —y qué no— con dos series de países distintos.
 * Devuelve una lista corta de observaciones honestas, sin adjetivos.
 */
export function observaciones(a: { pais: string; puntos: { anio: number; valor: number }[] }, b: { pais: string; puntos: { anio: number; valor: number }[] }): string[] {
  const salida: string[] = [];
  if (a.puntos.length === 0 || b.puntos.length === 0) return ["Una de las dos series no tiene ni un dato publicado: no hay nada que observar."];
  const ultimoA = a.puntos[a.puntos.length - 1];
  const ultimoB = b.puntos[b.puntos.length - 1];
  if (ultimoA.anio !== ultimoB.anio) {
    salida.push(`El último dato de ${a.pais} es de ${ultimoA.anio} y el de ${b.pais} de ${ultimoB.anio}: no son contemporáneos.`);
  }
  const desde = Math.max(a.puntos[0].anio, b.puntos[0].anio);
  const hasta = Math.min(ultimoA.anio, ultimoB.anio);
  if (desde < hasta) {
    const hallar = (serie: { anio: number; valor: number }[], anio: number) => serie.find((p) => p.anio === anio)?.valor ?? null;
    const va = hallar(a.puntos, hasta);
    const vb = hallar(b.puntos, hasta);
    if (va !== null && vb !== null && vb !== 0) {
      salida.push(`En ${hasta} —el último año que ambos publican— la relación era de ${fmtVeces(va / vb)} veces.`);
    }
  } else {
    salida.push("Las dos series no comparten ni un año con dato: cualquier comparación sería entre épocas distintas.");
  }
  return salida;
}
