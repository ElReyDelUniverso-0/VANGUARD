#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v416.0 · EL AUDITOR DE ANIMACIONES — qué se mueve solo en esta casa
//
// Uso:  node tools/anim/auditar.mjs
//
// Lee TODOS los CSS del proyecto y los bloques de CSS en línea de los
// componentes .tsx, y separa dos familias:
//   · animaciones que se repiten sin parar (`infinite`) → son las que gastan
//     batería y cuadros sin que nadie las mire;
//   · animaciones de entrada (una vez) → no se tocan.
//
// Con la primera lista escribe `src/app/animaciones-generadas.css`, que apaga
// exactamente esas animaciones cuando el visitante elige «reducidas». No
// apaga nada más y no toca el nivel «completas».
//
// No borra, no reescribe CSS a mano y no cambia componentes: solo genera una
// hoja de apagado derivada del árbol real.
// ═══════════════════════════════════════════════════════════════════

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const RAIZ = process.cwd();
const SALIDA_CSS = join(RAIZ, "src", "app", "animaciones-generadas.css");
const SALIDA_JSON = join(RAIZ, "src", "lib", "anim", "auditoria.json");

function caminar(dir, filtro, out = []) {
  for (const nombre of readdirSync(dir)) {
    const p = join(dir, nombre);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (nombre === "node_modules" || nombre.startsWith(".")) continue;
      caminar(p, filtro, out);
    } else if (filtro(nombre)) {
      out.push(p);
    }
  }
  return out;
}

const css = caminar(join(RAIZ, "src"), (n) => n.endsWith(".css") && n !== "animaciones-generadas.css");
const tsx = caminar(join(RAIZ, "src"), (n) => n.endsWith(".tsx"));

/** Limpia un selector: quita espacios raros y descarta los de @media. */
function limpiarSelector(sel) {
  return sel
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("@") && s !== ":root" && !s.startsWith("html"))
    // los fotogramas de un @keyframes no son selectores de elemento
    .filter((s) => !/^(from|to|\d+%)(\s*,\s*(from|to|\d+%))*$/.test(s))
    .join(", ");
}

const infinitas = [];
const entradas = [];

function analizar(textoBruto, archivo, enLinea) {
  // los comentarios no son selectores: se quitan ANTES de partir las reglas
  const texto = textoBruto.replace(/\/\*[\s\S]*?\*\//g, "");
  // reglas simples: selector { ... animation: ... }
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(texto))) {
    const selector = limpiarSelector(m[1]);
    const cuerpo = m[2];
    if (!selector) continue;
    if (!/animation(-name)?\s*:/.test(cuerpo)) continue;
    const esInfinita = /infinite/.test(cuerpo);
    const nombres = [...cuerpo.matchAll(/animation(?:-name)?\s*:\s*([A-Za-z0-9_-]+)/g)].map((x) => x[1]);
    const item = {
      archivo: relative(RAIZ, archivo).split(sep).join("/"),
      selector,
      nombres: [...new Set(nombres)],
      enLinea,
    };
    if (esInfinita) infinitas.push(item);
    else entradas.push(item);
  }
}

for (const f of css) analizar(readFileSync(f, "utf8"), f, false);

for (const f of tsx) {
  const texto = readFileSync(f, "utf8");
  // solo los bloques que parecen CSS dentro de plantillas
  if (!/@keyframes|animation\s*:/.test(texto)) continue;
  analizar(texto, f, true);
}

// ── las que van en `style={{…}}` ─────────────────────────────────────
// Ningún selector alcanza un estilo en línea, así que ninguna hoja las apagaba:
// el barrido de radar del panel de juego seguía girando en «reducidas». La
// salida es doble: el componente marca el elemento con `data-vg-anim-inline`
// y la hoja generada apaga ahí con !important (que sí gana a un estilo en
// línea sin !important). El auditor comprueba que ningún archivo se olvide.
const enLinea = [];
for (const f of tsx) {
  const texto = readFileSync(f, "utf8");
  const rel = relative(RAIZ, f).split(sep).join("/");
  const re = /animation\s*:\s*"([^"]*infinite[^"]*)"/g;
  let m;
  let cuantas = 0;
  while ((m = re.exec(texto))) cuantas++;
  if (!cuantas) continue;
  const marcados = (texto.match(/data-vg-anim-inline/g) ?? []).length;
  enLinea.push({
    archivo: rel,
    cuantas,
    marcados,
    nombre: (texto.match(/animation\s*:\s*"([A-Za-z0-9_-]+)/) ?? [])[1] ?? "?",
  });
}
const sinMarcar = enLinea.filter((e) => e.marcados < e.cuantas);

// ── hoja de apagado para «reducidas» ────────────────────────────────
const selectores = [...new Set(infinitas.map((i) => i.selector))].sort();

const cabecera = `/* ═══════════════════════════════════════════════════════════════════
 * GENERADO — no editar a mano.
 * Lo escribe tools/anim/auditar.mjs a partir de las animaciones que se
 * repiten sin parar en el árbol real (${infinitas.length} reglas).
 *
 * Se aplica SOLO con el nivel «reducidas»; «completas» no lo ve y
 * «desactivadas» no necesita esta lista (apaga todo).
 *
 * Una regla por selector, sin agrupar en :is(): un pseudo-elemento dentro de
 * :is() no es válido y el navegador lo descarta en silencio — así se colaban
 * los catorce pulsos de los puntos del mapa, que eran justo los que más
 * pesaban en un teléfono.
 * ═══════════════════════════════════════════════════════════════════ */

${selectores
  .map((sel) => {
    // un selector que ya apunta a un pseudo-elemento no admite otro detrás
    if (sel.includes("::")) {
      return `html[data-vg-anim="reducidas"] ${sel} { animation: none !important; }`;
    }
    return `html[data-vg-anim="reducidas"] ${sel},
html[data-vg-anim="reducidas"] ${sel}::before,
html[data-vg-anim="reducidas"] ${sel}::after { animation: none !important; }`;
  })
  .join("\n")}

/* Las animaciones que viven en un estilo en línea no las alcanza ningún
   selector; el componente marca su elemento con data-vg-anim-inline y aquí se
   apagan. Son los barridos y pulsos de pantalla completa: decoración, no
   función. */
html[data-vg-anim="reducidas"] [data-vg-anim-inline],
html[data-vg-anim="reducidas"] [data-vg-anim-inline]::before,
html[data-vg-anim="reducidas"] [data-vg-anim-inline]::after {
  animation: none !important;
}

/* El desenfoque de fondo es lo más caro por píxel en un teléfono modesto:
   en «reducidas» se retira y queda el color de respaldo. */
html[data-vg-anim="reducidas"] *,
html[data-vg-anim="reducidas"] *::before,
html[data-vg-anim="reducidas"] *::after {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* Las transiciones se acortan, no se eliminan: los estados siguen leyéndose
   y \`transitionend\` sigue disparándose. */
html[data-vg-anim="reducidas"] * {
  transition-duration: 120ms !important;
}
`;

writeFileSync(SALIDA_CSS, cabecera, "utf8");

const porArchivo = {};
for (const i of infinitas) porArchivo[i.archivo] = (porArchivo[i.archivo] ?? 0) + 1;

const informe = {
  version: "v416.0",
  fecha: new Date().toISOString().slice(0, 10),
  archivos: { css: css.length, tsx: tsx.length },
  infinitas: infinitas.length,
  selectoresUnicos: selectores.length,
  entradas: entradas.length,
  porArchivo: Object.entries(porArchivo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([archivo, cuantas]) => ({ archivo, cuantas })),
  selectores,
  enLinea: { archivos: enLinea, total: enLinea.reduce((n, e) => n + e.cuantas, 0), sinMarcar: sinMarcar.length },
  peores: infinitas.slice(0, 40).map((i) => `${i.selector} (${i.nombres.join(" ") || "?"})`),
};

writeFileSync(SALIDA_JSON, JSON.stringify(informe, null, 2) + "\n", "utf8");

console.log("AUDITORÍA DE ANIMACIONES");
console.log(`  CSS leídos           ${css.length}`);
console.log(`  bloques .tsx leídos  ${tsx.length}`);
console.log(`  infinitas            ${infinitas.length} reglas · ${selectores.length} selectores únicos`);
console.log(`  de entrada (1 vez)   ${entradas.length}`);
console.log(`  en estilo en línea   ${enLinea.reduce((n, e) => n + e.cuantas, 0)} infinitas en ${enLinea.length} archivos · ${sinMarcar.length} sin marcar`);
console.log(`  hoja generada        src/app/animaciones-generadas.css`);
if (sinMarcar.length) {
  console.log("  ⚠ estos archivos tienen animaciones en línea sin marcar:");
  for (const e of sinMarcar) console.log(`    ${e.archivo} (${e.marcados}/${e.cuantas})`);
}
console.log("  los cinco archivos con más animaciones sin fin:");
for (const p of informe.porArchivo.slice(0, 5)) console.log(`    ${String(p.cuantas).padStart(4)}  ${p.archivo}`);
