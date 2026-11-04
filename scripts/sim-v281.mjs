// ─────────────────────────────────────────────────────────────
// sim-v281.mjs — micro-lección v266: la ronda simula sus asertos
// estáticos CONTRA LOS FICHEROS REALES antes de quemar el QA.
// 0 dependencias: lee los ficheros y aplica las mismas agullas
// que la suite usará en la ronda v281.
// ─────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
let pasan = 0, fallan = 0;
const fallos = [];

const afirmar = (cond, msg) => {
  if (cond) { pasan++; } else { fallan++; fallos.push(msg); }
};

const sala = readFileSync(join(RAIZ, "src/app/servicios/page.tsx"), "utf8");
const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");

// las DOS fuentes
afirmar(sala.includes('from "@/lib/agencias-data"'), "no importa agencias-data");
afirmar(sala.includes('from "@/lib/agencias-mundo-data"'), "no importa agencias-mundo-data");
// derivaciones
afirmar(sala.includes("[...new Set(COMUNIDAD.map((a) => a.categoria))]"), "censo comunidad sin Set");
afirmar(sala.includes("[...new Set(RED.map((s) => s.categoria))]"), "censo red sin Set");
afirmar(sala.includes("x.fundacion < min ? x.fundacion : min"), "arco sin reduce");
afirmar(sala.includes("Infinity,"), "mínimo del arco arranca en 0 (bug v281)");
afirmar(sala.includes("new Set(RED.map((s) => s.pais)).size"), "naciones sin derivar");
// líneas compuestas
afirmar(sala.includes("const lineaSala = `La sala de los servicios — ${COMUNIDAD.length + RED.length}"), "lineaSala no compuesta");
afirmar(sala.includes("${FUNDACION_MIN} a ${FUNDACION_MAX}"), "arco no viaja en la línea");
// placa + leyendas de la fuente
afirmar(sala.includes('String(n).padStart(2, "0")'), "placa sin padStart");
afirmar(sala.includes("BLOQUES.find((b) => b.cat === cat)?.leyenda"), "leyendas fuera de la fuente");
// puerta honesta + sitemap
afirmar(sala.includes("vive en el aparato"), "puerta honesta ausente");
afirmar(mapa.includes("${SITE_URL}/servicios"), "sitemap sin la sala");
// guardia v234
afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "fechas ISO a mano en la sala");
// versión
afirmar(version.includes('APP_VERSION = "v281.0"'), "version.ts no está en v281.0");
afirmar(version.includes('APP_CODENAME = "LA SALA DE LOS SERVICIOS"'), "codename incorrecto");

console.log(`SIM v281 — PASAN ${pasan} · FALLAN ${fallan}`);
fallos.forEach((f) => console.log("  · " + f));
process.exit(fallan > 0 ? 1 : 0);
