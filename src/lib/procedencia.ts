// ============================================================
// v367.1 EL OJO DEL DUEÑO — LA CADENA DE LA VERDAD (piezas puras)
//
// La doctrina de la casa ya estaba escrita: «datos ficticios PROHIBIDOS: si
// una fuente no responde, SIN SEÑAL honesto». Lo que faltaba era el ÚTIL: un
// formateador único para que toda sala pueda decir, en una línea discreta,
// DE DÓNDE sale su dato y DE CUÁNDO es.
//
// Por qué aquí y no en cada página: si cada sala formatea a su gusto, la
// cadena se rompe. Estas funciones son PURAS y deterministas — sin
// `toLocaleString`, sin `Intl`, sin zona horaria del aparato — porque se
// ejecutan en el servidor y en el cliente con el mismo resultado: cero
// desajuste de hidratación (la lección de v124 se respeta sola).
//
// Todo se declara en UTC y se dice en la cara: «12 nov 2026 · 14:02 UTC».
// La casa no finge la hora local de nadie.
// ============================================================

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

const dos = (n: number) => (n < 10 ? `0${n}` : String(n));

/** Fecha corta determinista en UTC: «12 nov 2026». */
export function fechaCorta(entrada: Date | string | number): string {
  const d = new Date(entrada);
  if (!Number.isFinite(d.getTime())) return "fecha ilegible";
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Hora corta determinista en UTC: «14:02 UTC». */
export function horaCorta(entrada: Date | string | number): string {
  const d = new Date(entrada);
  if (!Number.isFinite(d.getTime())) return "hora ilegible";
  return `${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())} UTC`;
}

/** Fecha y hora juntas: «12 nov 2026 · 14:02 UTC». */
export function fechaHora(entrada: Date | string | number): string {
  return `${fechaCorta(entrada)} · ${horaCorta(entrada)}`;
}

/**
 * Retraso legible entre la publicación de un dato y el momento de leerlo.
 * Devuelve null si las fechas no son comparables (nunca inventa un número).
 */
export function minutosDeRetraso(
  publicado: Date | string | number,
  consultado: Date | string | number = new Date(),
): number | null {
  const a = new Date(publicado).getTime();
  const b = new Date(consultado).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const ms = b - a;
  if (ms < 0) return 0; // una fuente puede adelantarse unos segundos: no es un retraso
  return Math.round(ms / 60_000);
}

/** «40 min de retraso» · «3 h de retraso» · «al día» (nunca cifras fingidas). */
export function retrasoLegible(minutos: number | null): string {
  if (minutos === null) return "antigüedad ilegible";
  if (minutos < 1) return "al segundo";
  if (minutos < 60) return `${minutos} min de retraso`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `${horas} h de retraso`;
  const dias = Math.round(horas / 24);
  return `${dias} d de retraso`;
}

/** La línea completa que pinta `FuenteYFecha`: honesta, corta, sin adornos. */
export function selloProcedencia(opciones: {
  fuente: string;
  publicado?: Date | string | number | null;
  consultado?: Date | string | number;
}): string {
  const { fuente, publicado, consultado } = opciones;
  if (!publicado) return `FUENTE: ${fuente}`;
  return `FUENTE: ${fuente} · ${fechaHora(publicado)} · ${retrasoLegible(
    minutosDeRetraso(publicado, consultado ?? new Date()),
  )}`;
}
