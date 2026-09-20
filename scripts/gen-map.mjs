// Generates detailed world map SVG paths from Natural Earth data (world-atlas 110m)
// Output: src/lib/world-paths.json { landPath, borderPath, graticulePath, spherePath }
import * as topojson from "topojson-client";
import { geoMercator, geoPath, geoGraticule10 } from "d3-geo";
import { writeFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const world = require("world-atlas/countries-110m.json");

const WIDTH = 1000;
const HEIGHT = 500;

// Mercator clipped to +-83 deg latitude (avoids poles stretching)
const projection = geoMercator()
  .rotate([-10, 0])
  .center([0, 20])
  .scale(155)
  .translate([WIDTH / 2, HEIGHT / 2 + 45]);

const path = geoPath(projection);

const land = topojson.feature(world, world.objects.land);
const countries = topojson.feature(world, world.objects.countries);
const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

const landPath = path(land) || "";
const borderPath = path(borders) || "";

const graticule = path(geoGraticule10()) || "";

// Also emit country centroids for potential use
const out = {
  landPath,
  borderPath,
  graticulePath: graticule,
  width: WIDTH,
  height: HEIGHT,
  // inverse projection helper constants for client
  proj: {
    rotate: [-10, 0],
    center: [0, 20],
    scale: 155,
    translate: [WIDTH / 2, HEIGHT / 2 + 45],
  },
};

writeFileSync("/home/z/my-project/src/lib/world-paths.json", JSON.stringify(out));

// sanity: verify conflict coords project inside canvas
const sample = [
  ["ukraine", 49.0, 32.0],
  ["gaza", 31.4, 34.4],
  ["sudan", 15.5, 32.5],
  ["taiwan", 23.7, 121.0],
  ["mexico", 25.0, -107.0],
];
for (const [id, lat, lng] of sample) {
  const [x, y] = projection([lng, lat]);
  console.log(id, Math.round(x), Math.round(y), x >= 0 && x <= WIDTH && y >= 0 && y <= HEIGHT ? "OK" : "OUT_OF_CANVAS");
}
console.log("landPath length:", landPath.length, "borderPath length:", borderPath.length);
