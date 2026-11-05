#!/usr/bin/env node
// AUDITORÍA DE FORMAS v341 — los params de la vena C
import { readFileSync } from "node:fs";
const h = JSON.parse(readFileSync("/tmp/censo-v341-clasificado.json", "utf8"));
const params = h.filter((x) => x.clase === "param-en-firma" || x.clase === "otro");
console.log("param total:", params.length);
const otro = h.filter((x) => x.clase === "otro");
const flechas = otro.filter((x) => /^\(?\w*\)?\s*=>/.test(x.linea ?? ""));
console.log("otro flechas:", flechas.length, "/", otro.length);
for (const x of otro) if (!flechas.includes(x)) console.log("OTRO-NO-FLECHA:", x.archivo + ":" + x.linea, x.nombre, "::", (x.linea ?? "").slice(0, 90));
let multilineas = 0;
for (const p of params) {
  const full = readFileSync("/home/z/my-project/" + p.archivo, "utf8").split("\n");
  const L = full[p.linea - 1] ?? "";
  const abre = (L.match(/\(/g) || []).length, cierra = (L.match(/\)/g) || []).length;
  const esDest = /\{/.test(L) && new RegExp("[{,]\\s*" + p.nombre + "\\s*[:},]").test(L);
  if (abre > cierra) { multilineas++; console.log("MULTILINE:", p.archivo + ":" + p.linea, "'" + p.nombre + "'", esDest ? "(dest)" : "(pos)"); }
}
console.log("firmas multi-línea:", multilineas);
console.log("---muestra destructure---");
let n = 0;
for (const p of params) {
  const L = p.linea ?? "";
  if (/\{/.test(L) && new RegExp("[{,]\\s*" + p.nombre + "\\s*[:},]").test(L) && n < 6) { console.log(p.archivo + ":" + p.linea, "'" + p.nombre + "'", "::", L.slice(0, 130)); n++; }
}
