// ═══════════════════════════════════════════════════════════════════
// v416.0 · CÓMO SE ESCRIBE UNA CIFRA — formato español, sin adornos
// Departamento 4 · VANGUARD WORLD DATA
//
// Todo lo que sale a pantalla pasa por aquí: así una cifra se lee igual en la
// tabla, en el gráfico, en la ficha del país y en el comparador. Y «sin dato»
// se escribe siempre igual, en minúscula y sin guiones: es una respuesta, no
// un hueco.
// ═══════════════════════════════════════════════════════════════════

import type { Indicador } from "./catalogo";

const numero = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });

export const SIN_DATO = "sin dato";

/** Una cifra con sus decimales y su unidad corta, en español. */
export function fmtValor(valor: number | null | undefined, ind: Indicador): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return SIN_DATO;
  const dec = ind.decimales;
  switch (ind.formato) {
    case "millardos": {
      const abs = Math.abs(valor);
      if (abs >= 1e12) return `${(valor / 1e12).toLocaleString("es-ES", { maximumFractionDigits: 2 })} billones`;
      if (abs >= 1e9) return `${(valor / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 1 })} mil M`;
      if (abs >= 1e6) return `${(valor / 1e6).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M`;
      return valor.toLocaleString("es-ES", { maximumFractionDigits: dec });
    }
    case "porcentaje":
      return `${valor.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec })} %`;
    case "anios":
      return `${valor.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec })} años`;
    default:
      return valor.toLocaleString("es-ES", {
        minimumFractionDigits: dec > 0 ? Math.min(dec, 2) : 0,
        maximumFractionDigits: dec,
      });
  }
}

/** Cifra sin unidad, para ejes y tablas estrechas. */
export function fmtNumero(valor: number | null | undefined, ind?: Indicador): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return SIN_DATO;
  const dec = ind?.decimales ?? 0;
  return valor.toLocaleString("es-ES", { maximumFractionDigits: dec });
}

/** El año entre paréntesis, que acompaña SIEMPRE a la cifra. */
export function fmtAnio(anio: number | null | undefined): string {
  return anio ? `(${anio})` : "(sin año)";
}

/** «1,03 veces» con tres cifras significativas como máximo. */
export function fmtVeces(ratio: number): string {
  if (!Number.isFinite(ratio)) return SIN_DATO;
  if (ratio >= 10) return ratio.toFixed(0);
  if (ratio >= 1) return ratio.toFixed(2).replace(".", ",");
  return ratio.toFixed(3).replace(".", ",");
}

/** Variación porcentual entre dos puntos, con signo. */
export function fmtVariacion(desde: number, hasta: number): string {
  if (!Number.isFinite(desde) || !Number.isFinite(hasta) || desde === 0) return SIN_DATO;
  const pct = ((hasta - desde) / Math.abs(desde)) * 100;
  const signo = pct > 0 ? "+" : "";
  return `${signo}${pct.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`;
}

/** Nombre corto del indicador para ejes y chips. */
export function etiquetaCorta(ind: Indicador): string {
  return ind.corto || ind.nombre;
}
