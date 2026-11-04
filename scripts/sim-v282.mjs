// ─────────────────────────────────────────────────────────────
// sim-v282.mjs — micro-lección v266: la ronda simula sus asertos
// estáticos CONTRA LOS FICHEROS REALES después de editar y antes
// de quemar el QA completo. 0 dependencias: lee los ficheros y
// aplica las mismas agujas que la suite usará en la ronda v282.
// La medición de la fuente (tsx) se pagó ANTES de editar:
// SENTIDOS 5 · ALIADAS 1 (FEMA) · COLECCION 18·16·1882·2020·6·2.
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
const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
const bitacora = readFileSync(join(RAIZ, "src/lib/bitacora.ts"), "utf8");

// los TRES exports hermanos viajan (nada a mano)
afirmar(sala.includes("ALIADAS,\n  SENTIDOS,\n  COLECCION,"), "los tres imports hermanos no viajan");
// las tres líneas compuestas COMPLETAS en JS (lección v256)
afirmar(sala.includes("const lineaSentidos = `Los sentidos del oficio — ${SENTIDOS.length}"), "lineaSentidos no compuesta desde el length");
afirmar(sala.includes("SENTIDOS.map((s) => s.sigla).join(\" · \")"), "las siglas de los sentidos no viajan derivadas");
afirmar(sala.includes("const lineaManos = `La sala anexa — ${ALIADAS.length}"), "lineaManos no compuesta desde el length");
afirmar(sala.includes("ALIADAS.map((a) => a.sigla).join(\" · \")"), "las siglas de las manos no viajan derivadas");
afirmar(sala.includes("const lineaCifras = `La colección en cifras — ${COLECCION.total}"), "lineaCifras no compuesta desde COLECCION");
// la sala NO escribe las cifras: las sirve de COLECCION (ya derivada en la fuente)
afirmar(sala.includes("COLECCION.enCorredor} sedes en el corredor"), "el corredor no viaja desde COLECCION");
afirmar(sala.includes("COLECCION.masAntigua.fundacion} (${COLECCION.masAntigua.sigla})"), "el arco no viaja desde COLECCION");
afirmar(sala.includes("COLECCION.creadasPost11S} nacidas tras el 11-S"), "el post 11-S no viaja desde COLECCION");
afirmar(sala.includes("COLECCION.fueraCorredor.join(\" · \")"), "los huérfanos del corredor no viajan derivados");
// la sala no inventa cifras: no hay 1882 ni 2020 ni un 16 suelto escritos a mano en las líneas nuevas
afirmar(!/const linea\w+ = [^;]*\b1882\b/.test(sala), "el arco está escrito a mano en una línea (debe salir de COLECCION)");
afirmar(!/const linea\w+ = [^;]*\b2020\b/.test(sala), "el año joven está escrito a mano en una línea (debe salir de COLECCION)");
// las dos secciones nuevas + el strip
afirmar(sala.includes("LOS SENTIDOS DE LA INTELIGENCIA"), "la sección de los sentidos no está");
afirmar(sala.includes("SALA ANEXA — LAS MANOS QUE ACTÚAN"), "la sala anexa no está");
afirmar(sala.includes("{`${lineaCifras}.`}"), "el strip de cifras no se pinta compuesto");
// el noscript crece, también compuesto
afirmar(sala.includes("los ${SENTIDOS.length} sentidos del oficio y la sala anexa (${ALIADAS.map((a) => a.sigla).join(\" · \")}) también viajan en el HTML"), "el noscript no creció compuesto");
// las anclas v281 siguen en pie
afirmar(sala.includes("const lineaSala = `La sala de los servicios — ${COMUNIDAD.length + RED.length}"), "la línea v281 de la sala se rompió");
afirmar(sala.includes("BLOQUES.find((b) => b.cat === cat)?.leyenda"), "las leyendas de la fuente se rompieron");
afirmar(sala.includes("vive en el aparato"), "la puerta honesta se rompió");
// guardia v234
afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "fechas ISO a mano en la sala (v282)");
// versión y bitácora
afirmar(version.includes('APP_VERSION = "v282.0"'), "version.ts no está en v282.0");
afirmar(version.includes('APP_CODENAME = "LOS SENTIDOS DE LA SALA"'), "codename incorrecto");
afirmar(bitacora.includes('version: "v282.0"'), "la bitácora no tiene la entrada v282");

console.log(`SIM v282 — PASAN ${pasan} · FALLAN ${fallan}`);
fallos.forEach((f) => console.log("  · " + f));
process.exit(fallan > 0 ? 1 : 0);
