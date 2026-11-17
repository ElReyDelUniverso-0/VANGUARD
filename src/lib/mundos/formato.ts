// ═══════════════════════════════════════════════════════════════════
// v405.12 · LOS MUNDOS — formato único de cifras (es-ES, sin librerías)
//
// Existe porque el número de un país lo escriben TRES sitios: la ficha del
// índice, la ficha del país y la leyenda del mapa. Si cada uno lo formatea a
// su manera, el mismo dato aparece de tres formas distintas y el lector deja
// de creerlo. Aquí hay una sola función y todas beben de ella.
// ═══════════════════════════════════════════════════════════════════

/** Separa miles con punto y decimales con coma (uso español). */
export function miles(n: number, decimales = 0): string {
  if (!Number.isFinite(n)) return "—";
  const neg = n < 0;
  const abs = Math.abs(n);
  const fijo = abs.toFixed(decimales);
  const [ent, dec] = fijo.split(".");
  const conPuntos = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "−" : "") + conPuntos + (dec ? "," + dec : "");
}

/** 1 410 millones de personas → «1.410 M» */
export function millones(n: number, decimales = 1): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1000) return miles(n, 0) + " M";
  return miles(n, decimales) + " M";
}

/** Superficie en km² (el atlas la guarda en km², sin escalas). */
export function km2(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return miles(n) + " km²";
}

/**
 * Dólares. La prensa española dice «mil millones» donde el inglés dice
 * «billion»; aquí se respeta el uso español y se declara la unidad.
 */
export function usd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1e12) return miles(n / 1e12, 2) + " billones US$";
  if (n >= 1e9) return miles(n / 1e9, 1) + " mil M US$";
  if (n >= 1e6) return miles(n / 1e6, 1) + " M US$";
  return miles(n, 0) + " US$";
}

export function porcentaje(n: number, decimales = 2): string {
  if (!Number.isFinite(n)) return "—";
  return miles(n, decimales) + " %";
}

export function personas(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return miles(n);
}

/** Densidad: habitantes por km² (derivada, no viene en ninguna fuente). */
export function densidad(hab: number, km: number): string {
  if (!Number.isFinite(hab) || !Number.isFinite(km) || km <= 0) return "—";
  return miles(hab / km, 1) + " hab/km²";
}

/** Distancia en km, redondeada a la unidad que el lector puede usar. */
export function distancia(km: number): string {
  if (!Number.isFinite(km)) return "—";
  return km >= 100 ? miles(km, 0) + " km" : miles(km, 1) + " km";
}

/** «hace 4 años» — para fechas de un hecho histórico (año en curso aparte). */
export function aniosDesde(anio: number, hoy = new Date().getFullYear()): string {
  const d = hoy - anio;
  if (!Number.isFinite(d)) return "—";
  if (d <= 0) return "este año";
  return d === 1 ? "hace 1 año" : `hace ${d} años`;
}

/** El «tipo» de formato que viaja al cliente (sin funciones: serializable). */
export type FormatoMedida = "poblacion" | "superficie" | "densidad" | "usd" | "pct" | "personal" | "tasa" | "conteo" | "anios";

/** Aplica el formato por su nombre. La usan servidor y cliente: mismo texto. */
export function formatear(tipo: FormatoMedida, n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "sin dato";
  switch (tipo) {
    case "poblacion":
      return millones(n, 1);
    case "superficie":
      return km2(n);
    case "densidad":
      return miles(n, 1) + " hab/km²";
    case "usd":
      return usd(n);
    case "pct":
      return porcentaje(n, 2);
    case "personal":
      return personas(n) + " efectivos";
    case "tasa":
      return miles(n, 2) + " por US$";
    case "conteo":
      return miles(n, 0);
    case "anios":
      return miles(n, 1) + " años";
    default:
      return miles(n, 1);
  }
}
