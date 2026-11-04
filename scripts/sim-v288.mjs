// ─────────────────────────────────────────────────────────────
// sim-v288.mjs — micro-lección v266: la ronda simula sus asertos
// estáticos CONTRA LOS FICHEROS REALES después de editar y antes
// de quemar el QA completo. 0 dependencias: lee los ficheros y
// aplica las mismas agujas que la suite usará en la ronda v288.
// La medición de la fuente (python3-sqlite3, solo lectura) se pagó
// ANTES de editar: 10 de 18 agencias citadas por 451 titulares
// (CIA 307 · NSA 39 · DEA 38 · OIA 25 · DHS 15 · INR 13 · OICI 6
// · AFINTEL 4 · ONI 3 · FBI 1) sobre 1857 cables no-curados.
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
const fuente = readFileSync(join(RAIZ, "src/lib/agencias-data.ts"), "utf8");

// la fuente de keywords intacta: 18 llaves, las agencias del censo
afirmar(fuente.includes("export const PULSO_KEYWORDS"), "la fuente de keywords no existe");
const iniK = fuente.indexOf("export const PULSO_KEYWORDS");
const finK = fuente.indexOf("};", iniK);
const bloqueK = fuente.slice(iniK, finK === -1 ? fuente.length : finK + 2);
const nKws = (bloqueK.match(/^\s{2}[a-z]+: \[/gm) ?? []).length;
afirmar(nKws === 18, `el censo de keywords midió mal (${nKws}/18)`);

// la sala consume la fuente y la BD
afirmar(sala.includes('import Link from "next/link";'), "el import de Link no viaja");
afirmar(sala.includes('import { db } from "@/lib/db";'), "el import de la BD no viaja");
afirmar(sala.includes("PULSO_KEYWORDS,"), "la sala no consume la fuente de keywords");
// lectura pura (un solo escritor, leyes v245/v246)
afirmar(sala.includes('where: { externalId: { not: { startsWith: "curated-" } } }'), "el pulso cuenta las piezas curadas de respaldo");
afirmar(sala.includes("select: { id: true, title: true }"), "el pulso no baja solo los campos que necesita");
afirmar(sala.includes('export const dynamic = "force-dynamic";'), "la sala no deja entrar el pulso al render");
// EL MISMO algoritmo del canon del consumidor (comunidad-panel v127)
afirmar(sala.includes("(PULSO_KEYWORDS[a.id] ?? []).map((k) => k.toLowerCase())"), "las keywords no bajan en minúsculas");
afirmar(sala.includes("c.title.toLowerCase().includes(k)"), "el matching no es el del canon");
// el orden de la fuente y el vacío no se rellena
afirmar(sala.includes("for (const a of COMUNIDAD) {"), "el cruce no recorre la fuente en su orden");
afirmar(sala.includes("if (suyos.length > 0) {"), "el vacío de una agencia no se rellena");
// la línea compuesta COMPLETA en JS (lección v256)
afirmar(sala.includes("const lineaPulso = `El pulso del archivo por agencia — ${pulso.length} de ${COMUNIDAD.length} agencias citadas por ${totalMenciones} titulares del archivo`"), "la línea del pulso no se compone COMPLETA en JS");
// la sección + la puerta viva + el vacío honesto
afirmar(sala.includes("EL PULSO DEL ARCHIVO POR AGENCIA"), "la sección del pulso no viaja");
afirmar(sala.includes("href={`/noticia/${p.ultimo.id}`}"), "el último titular no abre su puerta viva a /noticia");
afirmar(sala.includes("el archivo no cita a ninguna agencia todavía — el pulso duerme honesto"), "el vacío del pulso no se declara honesto");
// el noscript crece, también compuesto en JS
afirmar(sala.includes("${pulso.length > 0 ? `, con el pulso del archivo por agencia (${pulso.length} de ${COMUNIDAD.length} agencias citadas)` : \"\"}"), "el noscript no creció compuesto");
// las anclas v282 siguen en pie
afirmar(sala.includes("const lineaSala = `La sala de los servicios — ${COMUNIDAD.length + RED.length}"), "la línea v282 de la sala se rompió");
afirmar(sala.includes("const lineaSentidos = `Los sentidos del oficio — ${SENTIDOS.length}"), "la línea de los sentidos se rompió");
afirmar(sala.includes("const lineaManos = `La sala anexa — ${ALIADAS.length}"), "la línea de las manos se rompió");
afirmar(sala.includes("SALA ANEXA — LAS MANOS QUE ACTÚAN"), "la sala anexa se rompió");
afirmar(sala.includes("vive en el aparato"), "la puerta honesta se rompió");
// guardias: fechas ISO a mano y años en las líneas
afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "fechas ISO a mano en la sala (v288)");
afirmar(!/const linea\w+ = [^;]*\b19\d\d\b/.test(sala), "año a mano en una línea (v288)");
// versión y bitácora
afirmar(version.includes('APP_VERSION = "v288.0"'), "version.ts no está en v288.0");
afirmar(version.includes('APP_CODENAME = "EL PULSO DEL ARCHIVO POR AGENCIA"'), "codename incorrecto");
afirmar(bitacora.includes('version: "v288.0"'), "la bitácora no tiene la entrada v288");

console.log(`SIM v288 — PASAN ${pasan} · FALLAN ${fallan}`);
fallos.forEach((f) => console.log("  · " + f));
process.exit(fallan > 0 ? 1 : 0);
