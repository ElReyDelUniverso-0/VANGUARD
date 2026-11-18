// v406.5 · Las subregiones en español y su slug — pura y liviana para que
// relaciones.ts (enlaces del núcleo) pueda usarla sin cargar tablas.

/** Las 24 subregiones del censo geográfico, en español. */
export const SUBREGIONES_ES: Record<string, string> = {
  "Southern Asia": "Asia meridional",
  "Northern Europe": "Europa del Norte",
  "Southeast Europe": "Europa sudoriental",
  "Western Europe": "Europa occidental",
  "Southern Europe": "Europa meridional",
  "Middle Africa": "África central",
  Caribbean: "Caribe",
  "Western Asia": "Asia occidental",
  "Northern Africa": "África del Norte",
  "South America": "América del Sur",
  "Australia and New Zealand": "Australia y Nueva Zelanda",
  "Central Europe": "Europa central",
  "Central America": "Centroamérica",
  "Western Africa": "África occidental",
  "North America": "América del Norte",
  "Eastern Europe": "Europa oriental",
  "Southern Africa": "África austral",
  "South-Eastern Asia": "Sudeste asiático",
  "Eastern Africa": "África oriental",
  "Eastern Asia": "Asia oriental",
  Melanesia: "Melanesia",
  Micronesia: "Micronesia",
  Polynesia: "Polinesia",
  "Central Asia": "Asia central",
};

export function slugDe(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}


/** La página de región de un país (por su subregión del censo en inglés). */
export function rutaRegionDe(subregionOriginal: string | null | undefined): string | null {
  if (!subregionOriginal) return null;
  const es = SUBREGIONES_ES[subregionOriginal];
  return es ? `/regiones/${slugDe(es)}` : null;
}
