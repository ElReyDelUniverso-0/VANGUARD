#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v412.0 · LA PRUEBA DE LA ARQUITECTURA
//
// Uso:  node tools/arquitectura/probar.mjs
//
// Comprueba, contra el censo real del árbol (src/lib/arquitectura/censo.json):
//   ① que cada ruta citada en el motor de nexos exista de verdad;
//   ② que cada ruta citada en el registro de los 22 departamentos exista;
//   ③ que los quince laboratorios del motor sean los quince del registro;
//   ④ que el registro de departamentos tenga exactamente 22 entradas;
//   ⑤ que ningún departamento «en pie» esté vacío (sin piezas con ruta).
//
// No usa TypeScript ni el bundler: lee los ficheros como texto. Es una prueba
// de honestidad, no un análisis semántico — y por eso puede correr en cualquier
// sitio donde corra Node.
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CENSO = join(RAIZ, "src", "lib", "arquitectura", "censo.json");
const NEXOS = join(RAIZ, "src", "lib", "arquitectura", "nexos.ts");
const DEPTS = join(RAIZ, "src", "lib", "arquitectura", "departamentos.ts");
const LABS = join(RAIZ, "src", "lib", "labs", "registro.ts");

const fallos = [];
const ok = (cond, mensaje) => {
  if (!cond) fallos.push(mensaje);
  return cond;
};

if (!existsSync(CENSO)) {
  console.error("Falta el censo. Ejecuta antes: node tools/arquitectura/censar.mjs");
  process.exit(1);
}

const censo = JSON.parse(readFileSync(CENSO, "utf8"));
const rutasCenso = censo.rutas.map((r) => r.ruta);

const aRegex = (ruta) => new RegExp("^" + ruta.replace(/\[[^\]]+\]/g, "[^/]+").replace(/\//g, "\\/") + "$");

function existe(ruta) {
  const limpia = ruta.split("?")[0].split("#")[0];
  if (rutasCenso.includes(limpia)) return true;
  return rutasCenso.some((r) => aRegex(r).test(limpia));
}

const textoNexos = readFileSync(NEXOS, "utf8");
const textoDepts = readFileSync(DEPTS, "utf8");

// ① y ② — rutas citadas
const citadas = new Set();
for (const m of textoNexos.matchAll(/ruta:\s*[`"']([^`"']+)[`"']/g)) citadas.add(m[1]);
for (const m of textoNexos.matchAll(/ruta:\s*`([^`]+)`/g)) citadas.add(m[1]);
for (const m of textoDepts.matchAll(/ruta:\s*"([^"]+)"/g)) citadas.add(m[1]);

const inexistentes = [...citadas].filter((r) => !existe(r));
ok(inexistentes.length === 0, `rutas citadas que no existen en el árbol: ${inexistentes.join(", ")}`);

// ③ — los modelos del motor son los del registro
const idsRegistro = new Set([...readFileSync(LABS, "utf8").matchAll(/^import \{([^}]+)\}/gm)].flatMap((m) => m[1].split(",").map((s) => s.trim())));
const bloquePropios = textoNexos.slice(textoNexos.indexOf("NEXOS_PROPIOS"), textoNexos.indexOf("/** Todas las salidas"));
const idsNexos = [...bloquePropios.matchAll(/^  ([a-z]+):\s*\[/gm)].map((m) => m[1]);
const faltanEnRegistro = idsNexos.filter((id) => !idsRegistro.has(id));
ok(idsNexos.length === 15, `el motor declara ${idsNexos.length} laboratorios y el catálogo tiene 15`);
ok(faltanEnRegistro.length === 0, `laboratorios del motor que no están en el registro: ${faltanEnRegistro.join(", ")}`);

// ④ y ⑤ — los departamentos
const nDepts = [...textoDepts.matchAll(/\n  \{\n    n: \d+,\n    id: "[^"]+",/g)].length;
ok(nDepts === 22, `el registro tiene ${nDepts} departamentos, no 22`);

const bloques = textoDepts.split(/\n  \},\n  \{/);
const sinPiezas = [];
for (const b of bloques) {
  if (/estado: "en pie"/.test(b)) {
    const nombre = (b.match(/nombre: "([^"]+)"/) ?? [])[1] ?? "?";
    const piezas = (b.match(/ruta:/g) ?? []).length;
    if (piezas === 0) sinPiezas.push(nombre);
  }
}
ok(sinPiezas.length === 0, `departamentos «en pie» sin ninguna pieza con ruta: ${sinPiezas.join(", ")}`);

// ── informe ───────────────────────────────────────────────────────
const totalNexos = [...textoNexos.matchAll(/ruta:\s*[`"']/g)].length;
console.log("ARQUITECTURA · prueba de honestidad");
console.log(`  censo            ${censo.paginas} páginas · ${censo.rutasApi} rutas de API (${censo.fecha})`);
console.log(`  rutas citadas    ${citadas.size} · todas existen: ${inexistentes.length === 0 ? "sí" : "NO"}`);
console.log(`  laboratorios     ${idsNexos.length} · en el registro: ${faltanEnRegistro.length === 0 ? "todos" : "faltan " + faltanEnRegistro.join(", ")}`);
console.log(`  rutas de nexo    ${totalNexos} literales en el motor (modelos, base y ficha de país)`);
console.log(`  departamentos    ${nDepts}`);

if (fallos.length) {
  console.error("\nFALLOS:");
  for (const f of fallos) console.error("  · " + f);
  process.exit(1);
}
console.log("\nTODO LIMPIO: ningún nexo ni departamento cita una ruta que no exista.\n");
