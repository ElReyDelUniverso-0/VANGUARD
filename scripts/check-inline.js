#!/usr/bin/env node
// ============================================================
// QA FIJO DE LA CASA (nació en v185.1, v188.1, recreado v189.0)
// El lección v185.1: un regex dentro del template literal JSX pierde
// las barras (\/ → /) y el // abre un comentario que mata el script
// ENTERO — cortina eterna para todos. Este guardián extrae los
// <script> SIN src del HTML prerenderizado y los valida con
// node --check, más los marcadores de la versión en curso.
// Uso: node scripts/check-inline.js [versión-esperada]
// ============================================================
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const esperada = process.argv[2] || "v189.0";
const htmlPath = path.join(process.cwd(), ".next", "server", "app", "index.html");
if (!fs.existsSync(htmlPath)) {
  console.error("FALTA: " + htmlPath + " (¿build de producción?)");
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, "utf8");

// extraer scripts inline (sin src) — indexOf/slice, sin regex complejos
const inline = [];
let pos = 0;
for (;;) {
  const a = html.indexOf("<script", pos);
  if (a < 0) break;
  const b = html.indexOf(">", a);
  if (b < 0) break;
  const attrs = html.slice(a + 7, b);
  const c = html.indexOf("</script>", b);
  if (c < 0) break;
  const cuerpo = html.slice(b + 1, c);
  pos = c + 9;
  if (attrs.indexOf("src=") > -1) continue;
  if (attrs.indexOf("application/ld+json") > -1) continue;
  if (cuerpo.trim().length < 8) continue;
  inline.push(cuerpo);
}

let fallos = 0;
console.log("scripts inline hallados: " + inline.length);
inline.forEach((cuerpo, i) => {
  const tmp = path.join(require("os").tmpdir(), "vg-inline-" + i + ".js");
  fs.writeFileSync(tmp, cuerpo);
  try {
    execFileSync("node", ["--check", tmp], { stdio: "pipe" });
    console.log("  [" + i + "] SYNTAX_OK (" + cuerpo.length + " bytes)");
  } catch (e) {
    fallos++;
    console.error("  [" + i + "] SYNTAX_ROTO:\n" + String(e.stderr || e.message).slice(0, 800));
  }
});

// marcadores obligatorios de la versión viva
const marcadores = [
  ["VER interpolada", "var VER='" + esperada + "'"],
  ["placa cortina", esperada],
  ["testigo v187", "vg187-err"],
  ["sufrió v187", "vg187-sufrio"],
  ["CÓDIGO socorro", "CÓDIGO: "],
  ["paciente v188", "vgChorroVivo"],
  ["error no es vida v189", "data-vgmal"],
  ["salida limpia v189", "?vg189="],
];
for (const [nombre, aguja] of marcadores) {
  if (html.indexOf(aguja) === -1) {
    fallos++;
    console.error("MARCADOR AUSENTE: " + nombre + " → " + aguja);
  } else {
    console.log("MARCADOR OK: " + nombre);
  }
}

// el cine NO debe existir ya en el HTML prerenderizado (v189 adiós al cine)
if (html.indexOf("EL CINE DE ENTRADA") > -1) {
  fallos++;
  console.error("CINE PRESENTE EN HTML — debió morir en v189");
} else {
  console.log("CINE AUSENTE (retirado en v189) OK");
}

if (fallos > 0) {
  console.error("CHECK-INLINE: " + fallos + " FALLO(S)");
  process.exit(1);
}
console.log("CHECK-INLINE: TODO OK (" + esperada + ")");
