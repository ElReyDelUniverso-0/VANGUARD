// ─────────────────────────────────────────────────────────────
// sim-v285.mjs — micro-lección v266: la ronda simula sus asertos
// estáticos CONTRA LOS FICHEROS REALES después de editar y antes
// de quemar el QA completo. 0 dependencias: lee los ficheros y
// aplica las mismas agujas que la suite usará en la ronda v286
// (los rostros nacieron v284 en vuelo y el protocolo los renumeró dos veces
// tras la colisión con el tablero del escritor paralelo).
// La medición de la fuente (tsx) se pagó ANTES de editar:
// ROSTROS 34 · censos 12·10·6·6 · naciones 18 · poder 58–98.
// ─────────────────────────────────────────────────────────────
import { readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
let pasan = 0, fallan = 0;
const fallos = [];

const afirmar = (cond, msg) => {
  if (cond) { pasan++; } else { fallan++; fallos.push(msg); }
};

const sala = readFileSync(join(RAIZ, "src/app/rostros/page.tsx"), "utf8");
const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
const bitacora = readFileSync(join(RAIZ, "src/lib/bitacora.ts"), "utf8");

// la fuente viaja (nada a mano)
afirmar(sala.includes('from "@/lib/personas-data"'), "no importa personas-data");
afirmar(sala.includes("ROSTROS,\n  COLECCION_ROSTROS,\n  CATEGORIAS_ROSTRO,"), "los tres exports no viajan");
// derivaciones
afirmar(sala.includes("[...new Set(ROSTROS.map((r) => r.categoria))]"), "censo sin Set");
afirmar(sala.includes("ROSTROS.filter((r) => r.categoria === c).length"), "censo sin filter");
afirmar(sala.includes("new Set(ROSTROS.map((r) => r.pais)).size"), "naciones sin derivar");
// leyendas y etiquetas de la fuente (directiva v266)
afirmar(sala.includes("CATEGORIAS_ROSTRO[c].leyenda"), "leyendas fuera de la fuente");
afirmar(sala.includes("CATEGORIAS_ROSTRO[c].etiqueta"), "etiquetas fuera de la fuente");
// líneas compuestas
afirmar(sala.includes("const lineaRostros = `La galería de los rostros — ${ROSTROS.length}"), "lineaRostros no compuesta");
afirmar(sala.includes("const lineaCifras = `La colección en cifras — ${COLECCION_ROSTROS.total}"), "lineaCifras no compuesta desde COLECCION_ROSTROS");
afirmar(sala.includes("COLECCION_ROSTROS.masPoderoso.nombre"), "la ficha más poderosa no viaja derivada");
// placa + las DOS guardias heredadas
afirmar(sala.includes('String(n).padStart(2, "0")'), "placa sin padStart");
afirmar(!/const linea\w+ = [^;]*\b\d{4}\b/.test(sala), "un año escrito a mano en una línea");
afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "fechas ISO a mano en la sala");
// puertas
afirmar(mapa.includes("${SITE_URL}/rostros"), "sitemap sin la galería");
afirmar(paleta.includes('key: "pg:rostros"'), "paleta sin la galería");
afirmar(paleta.includes("Crosshair, Activity, Users }"), "los iconos Activity y Users no viajan importados");
afirmar(paleta.includes('key: "pg:conflictos"'), "la ancla v284 del tablero se rompió en la paleta");
afirmar(mapa.includes("${SITE_URL}/conflictos"), "la ancla v284 del tablero se rompió en el sitemap");
afirmar(sala.includes("vive en el aparato"), "puerta honesta ausente");
afirmar(sala.includes("Esta sala funciona sin JavaScript"), "noscript ausente");
// versión y bitácora
afirmar(version.includes('APP_VERSION = "v286.0"'), "version.ts no está en v286.0");
afirmar(version.includes('APP_CODENAME = "LOS ROSTROS DEL PODER"'), "codename incorrecto");
afirmar(version.includes("v284.0 EL TABLERO DE LOS CONFLICTOS"), "la crónica v284 del tablero se perdió en el rebase");
afirmar(bitacora.includes('version: "v286.0"'), "la bitácora no tiene la entrada v285");
afirmar(bitacora.includes('version: "v284.0"'), "la entrada v284 del tablero se perdió en el rebase");

console.log(`SIM v286 — PASAN ${pasan} · FALLAN ${fallan}`);
fallos.forEach((f) => console.log("  · " + f));
process.exit(fallan > 0 ? 1 : 0);
