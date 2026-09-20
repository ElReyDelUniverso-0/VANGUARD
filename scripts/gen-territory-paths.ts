// Vanguard v9 — genera src/lib/territory-paths.json
// Paths SVG REALES por territorio de WorldConquest (24 regiones) usando
// world-atlas countries-110m + topojson-client + d3-geo con la MISMA proyeccion
// del WarMap (geoMercator rotate [-10,0] center [0,20] scale 155 translate [500,295]).
// Ejecutar: bun scripts/gen-territory-paths.ts
import { readFileSync, writeFileSync } from "fs";
import * as topojson from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";

const WIDTH = 1000;
const HEIGHT = 500;
const projection = geoMercator()
  .rotate([-10, 0])
  .center([0, 20])
  .scale(155)
  .translate([WIDTH / 2, HEIGHT / 2 + 45]);
const path = geoPath(projection);

// territorio -> paises (nombres de world-atlas countries-110m)
const MAP: Record<string, string[]> = {
  canadartico: ["Canada", "Greenland"],
  eeuu: ["United States of America"],
  mexico: ["Mexico", "Guatemala", "Belize", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Panama"],
  amazonia: ["Brazil", "Venezuela", "Guyana", "Suriname", "Falkland Is."],
  andes: ["Peru", "Bolivia", "Ecuador"],
  argentina: ["Argentina", "Chile", "Uruguay", "Paraguay"],
  europawest: ["France", "Germany", "United Kingdom", "Ireland", "Spain", "Portugal", "Belgium", "Netherlands", "Luxembourg", "Switzerland", "Austria", "Italy", "Czechia", "Slovakia", "Hungary"],
  escandinavia: ["Norway", "Sweden", "Finland", "Denmark", "Iceland"],
  europaeste: ["Poland", "Ukraine", "Belarus", "Romania", "Bulgaria", "Moldova", "Lithuania", "Latvia", "Estonia"],
  balcanes: ["Turkey", "Greece", "Serbia", "Croatia", "Bosnia and Herz.", "Albania", "Macedonia", "Slovenia", "Montenegro", "Kosovo", "Cyprus"],
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

// nombres alternativos por si acaso
const ALIAS: Record<string, string> = {
  "United States of America": "United States of America",
  "Macedonia": "Macedonia",
  "eSwatini": "eSwatini",
};

const topo = JSON.parse(readFileSync("node_modules/world-atlas/countries-110m.json", "utf8"));
const fc: any = topojson.feature(topo, topo.objects.countries);
const byName = new Map<string, any>();
for (const f of fc.features) byName.set(f.properties.name, f);

const out: Record<string, string> = {};
const missing = new Set<string>();
for (const [tid, countries] of Object.entries(MAP)) {
  const feats: any[] = [];
  for (const name of countries) {
    const f = byName.get(name);
    if (!f) {
      missing.add(name);
      continue;
    }
    feats.push(f);
  }
  // combinar en un solo path (multiples subpaths M...Z)
  out[tid] = feats.map((f) => path(f)).join(" ");
}

// estadisticas
let total = 0;
for (const [tid, p] of Object.entries(out)) {
  total += p.length;
  console.log(tid.padEnd(18), String(p.length).padStart(7), "chars");
}
console.log("TOTAL", total, "chars");
if (missing.size) {
  console.log("MISSING (revisar):", [...missing].join(" | "));
  process.exit(1);
}
const json = `// AUTO-GENERADO por scripts/gen-territory-paths.ts — no editar a mano.
// Paths SVG de los 24 territorios de Mundo de Guerra (geografia real Natural Earth 110m).
// Proyeccion identica al WarMap: geoMercator rotate [-10,0] center [0,20] scale 155 translate [500,295].
export const TERRITORY_PATHS: Record<string, string> = ${JSON.stringify(out, null, 0)};
`;
writeFileSync("src/lib/territory-paths.json.ts", json);
console.log("OK -> src/lib/territory-paths.json.ts");
