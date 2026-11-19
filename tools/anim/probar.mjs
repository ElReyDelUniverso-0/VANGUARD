#!/usr/bin/env node
// v416.0 · PRUEBA DEL SISTEMA DE ANIMACIONES (estática, sin navegador)
// Uso: node tools/anim/probar.mjs
// Comprueba que el sistema está entero y que la hoja generada cubre lo que dice.
import { readFileSync, existsSync } from "node:fs";
const fallos = [];
const ok = (c, m) => { if (!c) fallos.push(m); };

const leer = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");
const pref = leer("src/lib/anim/preferencia.ts");
const gen = leer("src/app/animaciones-generadas.css");
const css = leer("src/app/animaciones.css");
const layout = leer("src/app/layout.tsx");
const selector = leer("src/components/anim/selector-animacion.tsx");
const auditoria = JSON.parse(leer("src/lib/anim/auditoria.json") || "{}");

// ① los tres niveles existen con su nombre exacto
for (const n of ["completas", "reducidas", "desactivadas"]) {
  ok(pref.includes(`"${n}"`), `falta el nivel ${n} en preferencia.ts`);
}

// ② la hoja generada cubre TODAS las animaciones infinitas del censo
const sinComentarios = gen.replace(/\/\*[\s\S]*?\*\//g, "");
const selectoresCss = (sinComentarios.match(/^html\[data-vg-anim="reducidas"\] \S/gm) ?? []).length;
const censados = auditoria.selectores ?? [];
const sinCubrir = censados.filter((sel) => !sinComentarios.includes(sel));
ok(censados.length > 0, "el censo no trae la lista de selectores");
ok(sinCubrir.length === 0, `la hoja generada no cubre ${sinCubrir.length} selectores: ${sinCubrir.slice(0, 4).join(" | ")}`);
ok(!/:is\(/.test(sinComentarios), "la hoja generada usa :is(): un pseudo-elemento ahí se descarta en silencio");

// ③ el layout decide el nivel antes del primer pintado
ok(/data-vg-anim/.test(layout) && /localStorage/.test(layout), "el layout no decide el nivel antes del primer pintado");
ok(layout.includes("animaciones-generadas.css"), "la hoja generada no se importa en el layout");

// ④ pausa por pestaña oculta y por fuera de pantalla
ok(/data-vg-oculto="1"/.test(css), "el CSS no pausa la pestaña oculta");
ok(/data-vg-pausa="1"/.test(css), "el CSS no pausa lo que sale de pantalla");
ok(/will-change: transform/.test(css), "falta la promoción de capa de lo que gira");

// ⑤ el selector es accesible y guarda
ok(selector.includes("aria-pressed"), "el selector no marca el estado con aria-pressed");
ok(selector.includes("guardarNivel"), "el selector no guarda la elección");

// ⑥ medidor presente para poder repetir la prueba
ok(existsSync("tools/anim/medir.mjs"), "falta el medidor reproducible");

console.log("SISTEMA DE ANIMACIONES · prueba estática");
console.log(`  animaciones infinitas censadas   ${auditoria.infinitas ?? "?"}`);
console.log(`  selectores apagados en reducidas ${censados.length} (${selectoresCss} líneas de regla)`);
console.log(`  niveles                          3 (completas · reducidas · desactivadas)`);
if (fallos.length) {
  console.error("\nFALLOS:");
  for (const f of fallos) console.error("  · " + f);
  process.exit(1);
}
console.log("\nTODO LIMPIO\n");
