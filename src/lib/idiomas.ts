// v215.0 EL MUNDO — LOS IDIOMAS DE VANGUARD en una sola fuente.
// Antes vivían dentro de /api/traductor (route.ts); ahora el catálogo lo
// comparte el API, el MODO TRADUCTOR (/traductor) y el chip de noticia —
// una sola lista, cero divergencias.

export interface IdiomaVanguard {
  code: string;
  nombre: string;
}

export const IDIOMAS_VANGUARD: IdiomaVanguard[] = [
  { code: "es", nombre: "Español" },
  { code: "en", nombre: "Inglés" },
  { code: "pt", nombre: "Portugués" },
  { code: "fr", nombre: "Francés" },
  { code: "de", nombre: "Alemán" },
  { code: "it", nombre: "Italiano" },
  { code: "zh", nombre: "Chino" },
  { code: "ru", nombre: "Ruso" },
];

export const NOMBRES_IDIOMA: Record<string, string> = Object.fromEntries(
  IDIOMAS_VANGUARD.map((i) => [i.code, i.nombre])
);

/** "en" → "INGLÉS" (para sellos tipo «TRADUCIDO ▸ INGLÉS»). */
export function nombreIdiomaMayus(code: string): string {
  return (NOMBRES_IDIOMA[code] ?? code).toUpperCase();
}
