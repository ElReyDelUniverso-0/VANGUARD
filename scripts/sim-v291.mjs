// ─────────────────────────────────────────────────────────────
// sim-v291.mjs — micro-lección v266: la ronda simula sus asertos
// estáticos CONTRA LOS FICHEROS REALES después de editar y antes
// de quemar el QA completo. 0 dependencias: lee los ficheros y
// aplica las mismas agujas que la suite usará en la ronda v291.
// La medición con el motor real (tsx) se pagó ANTES de editar:
// COLECCION_MUNDO 18·12·6 · MI6 1909 · CNI 2002 · REDES 5 arcos
// (hub mi6) · 1 puente · TERMINAL_PUENTE 38.8977/-77.0365.
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
const fuente = readFileSync(join(RAIZ, "src/lib/agencias-mundo-data.ts"), "utf8");

// los tres exports hermanos intactos en la fuente
afirmar(fuente.includes("export const REDES"), "la fuente de arcos no existe");
afirmar(fuente.includes("export const TERMINAL_PUENTE"), "la terminal no existe");
afirmar(fuente.includes("export const COLECCION_MUNDO"), "las cifras no existen");
// la sala consume los tres
afirmar(sala.includes("REDES, TERMINAL_PUENTE, COLECCION_MUNDO"), "los tres hermanos no viajan al server");
// las siglas derivadas por id (nada a mano)
afirmar(sala.includes("const siglaDe = (id: string): string => RED.find((s) => s.id === id)?.sigla ?? id"), "las siglas no se derivan por id");
afirmar(sala.includes("const arcosPacto = REDES.map"), "los arcos no se derivan de la fuente");
afirmar(sala.includes('r.a === "washington" ? null : siglaDe(r.a)'), "la terminal no se distingue");
// las dos líneas compuestas COMPLETAS en JS (lección v256)
afirmar(sala.includes("const lineaPacto = `El pacto que une las dos salas — ${REDES.length} arcos nacen del hub de Londres (${hubPacto}) y ${nPuentes} cruza el Atlántico hasta Washington (${TERMINAL_PUENTE.lat}°, ${TERMINAL_PUENTE.lng}°), la terminal del puente con la Comunidad`"), "lineaPacto no compuesta");
afirmar(sala.includes("const lineaCifrasRed = `La red mundial en cifras — ${COLECCION_MUNDO.total}"), "lineaCifrasRed no servida de COLECCION_MUNDO");
// la sección + terminal compuesta (v285)
afirmar(sala.includes("EL PACTO QUE UNE LAS DOS SALAS"), "la sección del pacto no está");
afirmar(sala.includes("TERMINAL_PUENTE.lat}°, ${TERMINAL_PUENTE.lng}°"), "la coordenada no compuesta (v285)");
afirmar(sala.includes("el puente atlántico — la terminal vive en LA COMUNIDAD"), "el puente no declarado");
// el noscript crece compuesto
afirmar(sala.includes("y los ${REDES.length} arcos del pacto UKUSA"), "el noscript no creció");
// las anclas v282/v288/v289 siguen en pie
afirmar(sala.includes("const lineaSala = `La sala de los servicios — ${COMUNIDAD.length + RED.length}"), "la línea v282 se rompió");
afirmar(sala.includes("const lineaPulso = `El pulso del archivo por agencia — ${pulso.length} de ${COMUNIDAD.length}"), "el pulso v288 se rompió");
afirmar(sala.includes("const lineaPulsoMundo = `El pulso de la red mundial — ${pulsoMundo.length} de ${RED.length}"), "el pulso v289 se rompió");
afirmar(sala.includes("SALA ANEXA — LAS MANOS QUE ACTÚAN"), "la sala anexa se rompió");
afirmar(sala.includes("vive en el aparato"), "la puerta honesta se rompió");
// guardias: fechas ISO a mano y AÑOS en las líneas (la guardia crece a (19|20))
afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "fechas ISO a mano en la sala (v291)");
afirmar(!/const linea\w+ = [^;]*\b(19|20)\d\d\b/.test(sala), "año a mano en una línea (1909/1946/2002 viven en la fuente)");
// versión y bitácora
afirmar(version.includes('APP_VERSION = "v291.0"'), "version.ts no está en v291.0");
afirmar(version.includes('APP_CODENAME = "EL PACTO QUE UNE LAS DOS SALAS"'), "codename incorrecto");
afirmar(bitacora.includes('version: "v291.0"'), "la bitácora no tiene la entrada v291");

console.log(`SIM v291 — PASAN ${pasan} · FALLAN ${fallan}`);
fallos.forEach((f) => console.log("  · " + f));
process.exit(fallan > 0 ? 1 : 0);
