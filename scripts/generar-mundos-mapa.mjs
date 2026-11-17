// ═══════════════════════════════════════════════════════════════════
// v405.12 · EL CARTÓGRAFO DE LOS MUNDOS — generador del mapa de países.
//
// POR QUÉ EXISTE: la casa tenía el planeta en cuatro piezas que no se
// hablaban — un SVG de silueta (world-paths.json), 24 manchas de macroterritorio
// (territory-paths.ts), un globo WebGL (globe.gl) y un censo de países
// (geo-paises.ts) que no tenía mapa propio. Este script produce la pieza que
// faltaba: CADA país como polígono real, con sus FRONTERAS y sus VECINOS,
// proyectado igual que el mapa de la casa para que todo case.
//
// FUENTE (pública, la misma del globo 3D): Natural Earth vía `world-atlas`
//   · countries-110m.json → mapa del índice (cobertura mundial, ~120 KB)
//   · countries-50m.json  → mapa de detalle por país (fronteras finas)
// PROYECCIÓN: azimuthal de área igual, rotate [-10,0], center [0,20],
//   scale 155, translate [500,295] → lienzo 1000×500 (idéntica a
//   src/lib/world-paths.json, para que el mapa nuevo encaje con el viejo).
//
// NO se edita a mano. Regenerar:
//   NODE_PATH=./node_modules node scripts/generar-mundos-mapa.mjs
// Requiere: world-atlas, topojson-client, d3-geo (ya son dependencias de la casa).
// ═══════════════════════════════════════════════════════════════════
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { feature, neighbors } from "topojson-client";
import * as d3 from "d3-geo";

const require = createRequire(import.meta.url);

const PROY = { rotate: [-10, 0], center: [0, 20], scale: 155, translate: [500, 295] };
const W = 1000, H = 500;

const proy = () =>
  d3
    .geoAzimuthalEqualArea()
    .rotate(PROY.rotate)
    .center(PROY.center)
    .scale(PROY.scale)
    .translate(PROY.translate)
    .precision(0.5);

const sinTildes = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

function clave(f, i) {
  const id = f.id;
  if (id !== undefined && id !== null && !Number.isNaN(Number(id))) return String(Number(id)).padStart(3, "0");
  return "n:" + sinTildes(f.properties?.name || "x" + i);
}

function construir(archivo, digits) {
  const topo = require(archivo);
  const coleccion = feature(topo, topo.objects.countries);
  const feats = coleccion.features.filter((f) => !!f.geometry);
  const path = d3.geoPath(proy()).digits(digits);

  const paises = {};
  feats.forEach((f, i) => {
    const k = clave(f, i);
    const d = path(f);
    if (!d) return;
    const b = path.bounds(f);
    const c = path.centroid(f);
    const redondear = (n) => Math.round(n * 10) / 10;
    paises[k] = {
      n: f.properties?.name ?? k,
      d,
      b: [redondear(b[0][0]), redondear(b[0][1]), redondear(b[1][0]), redondear(b[1][1])],
      c: [redondear(c[0]), redondear(c[1])],
    };
  });

  // ── VECINOS REALES: topojson sabe qué polígonos comparten arco ──
  const idx = feats.map((f, i) => clave(f, i));
  const vec = neighbors(topo.objects.countries.geometries);
  const vecinos = {};
  idx.forEach((k, i) => {
    const lista = (vec[i] || []).map((j) => idx[j]).filter((v) => v && v !== k && paises[v]);
    if (lista.length) vecinos[k] = Array.from(new Set(lista)).sort();
  });

  // ── rejilla (paralelos y meridianos cada 20°) ──
  const rejilla = d3.geoPath(proy()).digits(0)(d3.geoGraticule10());

  return {
    fuente: archivo,
    proyeccion: "azimuthal-equal-area rotate[-10,0] center[0,20] scale155",
    ancho: W,
    alto: H,
    digitos: digits,
    paises,
    vecinos,
    rejilla,
  };
}

mkdirSync("src/lib/mundos", { recursive: true });

const mundo = construir("world-atlas/countries-110m.json", 1);
const detalle = construir("world-atlas/countries-50m.json", 1);

const cabecera = (o) =>
  JSON.stringify(o, null, 0);

const escribir = (ruta, obj) => {
  writeFileSync(ruta, cabecera(obj));
  const bytes = Buffer.byteLength(cabecera(obj));
  console.log(ruta.padEnd(44), String(bytes).padStart(9), "B ·", Object.keys(obj.paises).length, "países ·", Object.keys(obj.vecinos).length, "con vecinos");
};

escribir("src/lib/mundos/mapa-mundo.json", mundo);
escribir("src/lib/mundos/mapa-detalle.json", detalle);
