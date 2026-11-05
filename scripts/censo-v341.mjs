#!/usr/bin/env node
// CENSO CLASIFICADO v341 — la vena C (locales/params muertos)
// Lee el censo de tsc --noUnusedLocals --noUnusedParameters y clasifica cada
// hallazgo leyendo SU LÍNEA (la ley de la casa: no confiar a ciegas en tsc).
// Salida: JSON con clases — param (renombra a _), local-puro (borrable),
// local-con-llamada (requiere leer el inicializador), tipo (TS6196), otro.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "/home/z/my-project";
const lineas = readFileSync("/tmp/censo-v341.txt", "utf8")
  .split("\n")
  .filter((l) => l.includes("error TS6"));

const hallazgos = [];
for (const l of lineas) {
  const m = l.match(/^(.+?)\((\d+),(\d+)\): error (TS6133|TS6196): '(.+?)' is declared but (?:its value is never read|never used)\./);
  if (!m) { hallazgos.push({ crudo: l, clase: "NO_PARSEADO" }); continue; }
  const [, archivo, lineaStr, colStr, codigo, nombre] = m;
  const ruta = join(RAIZ, archivo);
  let fuenteLinea = "";
  try {
    const contenido = readFileSync(ruta, "utf8");
    const lineasArchivo = contenido.split("\n");
    fuenteLinea = lineasArchivo[Number(lineaStr) - 1] ?? "";
  } catch { /* archivo ausente */ }
  const linea = fuenteLinea.trim();
  let clase = "otro";
  if (codigo === "TS6196") clase = "tipo";
  else if (/\bfunction\b|\b=>\s*\{?\s*$|^\w+\s*\([^)]*$|^\{/.test(linea) && !/^\s*(const|let)\b/.test(linea)) clase = "param-en-firma";
  else if (/^\s*(const|let)\b/.test(linea)) {
    // ¿el inicializador llama algo? (llamada con paréntesis fuera de tipos)
    const init = linea.replace(/^\s*(const|let)\s+\[?[\w{}, :\[\]]*\]?\s*[:<][^=]*=\s*/, "").replace(/^\s*(const|let)\s+[\w\[\], ]+\s*=\s*/, "");
    if (/\w+\s*\(/.test(init) && !/^</.test(init) && !/^(as )?[A-Z]\w*(<[^>]*>)?\s*(\||;|$)/.test(init)) clase = "local-con-llamada";
    else clase = "local-puro";
  }
  else if (/\binterface\b|\btype\b/.test(linea)) clase = "tipo-decl";
  hallazgos.push({ archivo, linea: Number(lineaStr), col: Number(colStr), codigo, nombre, clase, linea: fuenteLinea.trim() });
}

const resumen = {};
for (const h of hallazgos) resumen[h.clase] = (resumen[h.clase] ?? 0) + 1;
console.log("CLASES:", JSON.stringify(resumen, null, 1));
writeFileSync("/tmp/censo-v341-clasificado.json", JSON.stringify(hallazgos, null, 1));
console.log("total:", hallazgos.length);
// muestra de cada clase
for (const c of Object.keys(resumen)) {
  console.log(`\n── ${c} ──`);
  for (const h of hallazgos.filter((x) => x.clase === c).slice(0, 6))
    console.log(`${h.archivo}:${h.linea} '${h.nombre}' :: ${String(h.linea ?? "").slice(0, 110)}`);
}
