// Vanguard v14 — GEOGRAFIA MUNDIAL EN GEOJSON para los globos 3D (globe.gl).
// Sustituye los mapas planos SVG: poligonos reales de paises (Natural Earth 110m)
// + reparto de los 24 territorios de Mundo de Guerra / Age of Nations por pais.
import { feature } from "topojson-client";
import { geoCentroid } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import topo from "world-atlas/countries-110m.json";

export type CountryFeature = Feature<Geometry, { name: string }> & { __tid?: string | null };

const topoData = topo as Parameters<typeof feature>[0];
const fc = feature(topoData, topoData.objects.countries) as { features: CountryFeature[] };

/** Todos los paises del mundo como Features GeoJSON (con nombre). */
export const COUNTRY_FEATURES: CountryFeature[] = (fc.features as CountryFeature[]).filter(
  (f) => !!f.properties?.name
);

/** Centroides [lng, lat] por pais (para marcadores, flechas y zoom). */
export const COUNTRY_CENTROIDS: Record<string, [number, number]> = {};
for (const f of COUNTRY_FEATURES) {
  try {
    const c = geoCentroid(f);
    if (Number.isFinite(c[0]) && Number.isFinite(c[1])) COUNTRY_CENTROIDS[f.properties.name] = [c[0], c[1]];
  } catch {
    /* geometrias degeneradas se ignoran */
  }
}

// ====== Reparto de los 24 territorios por pais (misma base que el WarMap SVG) ======
export const TERRITORY_COUNTRY_MAP: Record<string, string[]> = {
  canadartico: ["Canada", "Greenland"],
  eeuu: ["United States of America"],
  mexico: ["Mexico", "Guatemala", "Belize", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Panama"],
  amazonia: ["Brazil", "Venezuela", "Guyana", "Suriname", "Falkland Is."],
  andes: ["Peru", "Bolivia", "Ecuador"],
  argentina: ["Argentina", "Chile", "Uruguay", "Paraguay"],
  europawest: ["France", "Germany", "United Kingdom", "Ireland", "Spain", "Portugal", "Belgium", "Netherlands", "Luxembourg", "Switzerland", "Austria", "Italy", "Czechia", "Slovakia", "Hungary"],
  escandinavia: ["Norway", "Sweden", "Finland", "Denmark", "Iceland"],
  europaeste: ["Poland", "Ukraine", "Belarus", "Romania", "Bulgaria", "Moldova", "Lithuania", "Latvia", "Estonia"],
  balcanes: ["Turkey", "Greece", "Serbia", "Croatia", "Bosnia and Herz.", "Albania", "North Macedonia", "Macedonia", "Slovenia", "Montenegro", "Kosovo", "Cyprus"],
  magreb: ["Morocco", "Algeria", "Tunisia", "Libya", "W. Sahara"],
  africaoccidental: ["Mauritania", "Mali", "Senegal", "Gambia", "Guinea", "Guinea-Bissau", "Sierra Leone", "Liberia", "Burkina Faso", "Côte d'Ivoire", "Ghana", "Togo", "Benin", "Niger", "Nigeria"],
  africacentral: ["Dem. Rep. Congo", "Congo", "Gabon", "Eq. Guinea", "Cameroon", "Central African Rep.", "Chad", "Angola", "Zambia"],
  egipto: ["Egypt", "Sudan", "S. Sudan", "Eritrea", "Djibouti", "Ethiopia"],
  africaoriental: ["Kenya", "Tanzania", "Uganda", "Rwanda", "Burundi", "Somalia", "Somaliland", "Mozambique", "Malawi"],
  africasure: ["South Africa", "Namibia", "Botswana", "Zimbabwe", "Madagascar", "Lesotho", "eSwatini"],
  oriente: ["Saudi Arabia", "Iraq", "Iran", "Syria", "Jordan", "Israel", "Lebanon", "Kuwait", "United Arab Emirates", "Qatar", "Oman", "Yemen", "Palestine"],
  asiacentral: ["Kazakhstan", "Uzbekistan", "Turkmenistan", "Kyrgyzstan", "Tajikistan", "Afghanistan", "Pakistan"],
  siberia: ["Russia"],
  india: ["India", "Nepal", "Bhutan", "Bangladesh", "Sri Lanka"],
  china: ["China", "Mongolia", "Taiwan"],
  sudeste: ["Thailand", "Vietnam", "Laos", "Cambodia", "Myanmar", "Malaysia", "Indonesia", "Philippines", "Brunei", "Timor-Leste", "Papua New Guinea"],
  japon: ["Japan", "North Korea", "South Korea"],
  australia: ["Australia", "New Zealand", "Fiji", "Solomon Is.", "Vanuatu", "New Caledonia"],
};

/** nombre de pais -> id de territorio */
export const COUNTRY_TO_TERRITORY: Record<string, string> = {};
for (const [tid, names] of Object.entries(TERRITORY_COUNTRY_MAP)) {
  for (const n of names) COUNTRY_TO_TERRITORY[n] = tid;
}

/** Marca cada feature con su territorio (una vez, al cargar) y devuelve la lista lista para el globo. */
export const GLOBE_COUNTRY_POLYS: CountryFeature[] = COUNTRY_FEATURES.map((f) => {
  const tid = COUNTRY_TO_TERRITORY[f.properties.name] ?? null;
  (f as { __tid?: string | null }).__tid = tid;
  return f;
});

/** Convierte "#RRGGBB" + alpha 0..1 en "#RRGGBBAA" (globe.gl acepta hex de 8). */
export function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "").slice(0, 6);
  const a = Math.max(0, Math.min(1, alpha));
  return `#${h}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
}
