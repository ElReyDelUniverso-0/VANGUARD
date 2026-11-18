#!/usr/bin/env node
// v406.0 LA TRAVESÍA — pruebas de las funciones puras del rastro.
// Uso: node scripts/pruebas-travesia.mjs
// Transpila src/lib/travesia/rastro.ts con el compilador de TypeScript del propio
// repo (sin dependencias nuevas) y lo importa desde un data: URL.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const fuente = readFileSync(new URL("../src/lib/travesia/rastro.ts", import.meta.url), "utf8");
const js = ts.transpileModule(fuente, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const R = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

let ok = 0;
const prueba = (nombre, fn) => {
  try {
    fn();
    ok++;
    console.log("  ✓ " + nombre);
  } catch (e) {
    console.error("  ✗ " + nombre + "\n    " + e.message);
    process.exitCode = 1;
  }
};

const paso = (u, k, t, extra = {}) => ({ u, r: u.split("?")[0], ti: u, k, e: null, t, ...extra });

console.log("La Travesía · rastro.ts");

prueba("dejaHuella: la portada, la Travesía y las tuberías no dejan huella", () => {
  for (const r of ["", "/", "/entrar", "/api/news", "/offline", "/_next/x"]) assert.equal(R.dejaHuella(r), false, r);
  for (const r of ["/divisas", "/cuartel", "/entrarx", "/servicios"]) assert.equal(R.dejaHuella(r), true, r);
});

prueba("tipoDeRuta clasifica las cuatro actividades", () => {
  assert.equal(R.tipoDeRuta("/escenarios"), "simulacion");
  assert.equal(R.tipoDeRuta("/cuartel"), "simulacion");
  assert.equal(R.tipoDeRuta("/centinela"), "proyecto");
  assert.equal(R.tipoDeRuta("/perfil"), "proyecto");
  assert.equal(R.tipoDeRuta("/modulos"), "exploracion");
  assert.equal(R.tipoDeRuta("/divisas"), "investigacion");
  assert.equal(R.tipoDeRuta("/sala/brief-tv"), "investigacion");
});

prueba("registrarPaso: sin duplicados, el más reciente arriba, cuenta visitas", () => {
  let l = [];
  l = R.registrarPaso(l, paso("/a", "investigacion", 1));
  l = R.registrarPaso(l, paso("/b", "investigacion", 2));
  l = R.registrarPaso(l, paso("/a", "investigacion", 3, { ti: "" }));
  assert.deepEqual(l.map((p) => p.u), ["/a", "/b"]);
  assert.equal(l[0].n, 2);
  assert.equal(l[0].ti, "/a", "conserva el título previo si llega vacío");
});

prueba("registrarPaso respeta el tope", () => {
  let l = [];
  for (let i = 0; i < 100; i++) l = R.registrarPaso(l, paso("/p" + i, "investigacion", i));
  assert.equal(l.length, R.MAX_PASOS);
  assert.equal(l[0].u, "/p99");
});

prueba("ultimosPorTipo y pasosDe ordenan por tiempo", () => {
  const l = [paso("/a", "investigacion", 1), paso("/b", "investigacion", 5), paso("/s", "simulacion", 3)];
  const u = R.ultimosPorTipo(l);
  assert.equal(u.investigacion.u, "/b");
  assert.equal(u.simulacion.u, "/s");
  assert.equal(u.proyecto, undefined);
  assert.deepEqual(R.pasosDe(l, "investigacion").map((p) => p.u), ["/b", "/a"]);
  assert.equal(R.pasosDe(l, "investigacion", 1).length, 1);
});

prueba("paraContinuar ignora los índices (exploración)", () => {
  assert.equal(R.paraContinuar([]), null);
  const l = [paso("/modulos", "exploracion", 9), paso("/centinela", "proyecto", 4)];
  assert.equal(R.paraContinuar(l).u, "/centinela");
  assert.equal(R.paraContinuar([paso("/modulos", "exploracion", 9)]), null);
});

prueba("salasCuartelVistas cuenta salas distintas", () => {
  const l = [
    paso("/cuartel?sala=servicios", "simulacion", 1),
    paso("/cuartel?sala=servicios&x=1", "simulacion", 2),
    paso("/cuartel?sala=warsim", "simulacion", 3),
    paso("/cuartel", "simulacion", 4),
  ];
  assert.deepEqual(R.salasCuartelVistas(l).sort(), ["servicios", "warsim"]);
});

prueba("haceCuanto en español", () => {
  const a = 10_000_000_000;
  assert.equal(R.haceCuanto(a, a + 20e3), "ahora mismo");
  assert.equal(R.haceCuanto(a, a + 8 * 60e3), "hace 8 min");
  assert.equal(R.haceCuanto(a, a + 5 * 3600e3), "hace 5 h");
  assert.equal(R.haceCuanto(a, a + 26 * 3600e3), "ayer");
  assert.equal(R.haceCuanto(a, a + 4 * 86400e3), "hace 4 días");
  assert.equal(R.haceCuanto(a + 999, a), "ahora mismo", "un reloj adelantado no da negativos");
});

prueba("sanear descarta basura y urls externas", () => {
  assert.deepEqual(R.sanear(null), []);
  assert.deepEqual(R.sanear({ u: "/a" }), []);
  const l = R.sanear([
    paso("/ok", "investigacion", 1),
    paso("//malo.com", "investigacion", 1),
    paso("https://malo.com", "investigacion", 1),
    paso("/tipo", "otro", 1),
    { u: "/sin-tiempo", k: "investigacion" },
    { ...paso("/largo", "proyecto", 2), ti: "x".repeat(500), n: "nada", e: 7 },
    null,
  ]);
  assert.deepEqual(l.map((p) => p.u), ["/ok", "/largo"]);
  assert.equal(l[1].ti.length, 140);
  assert.equal(l[1].n, 1);
  assert.equal(l[1].e, null);
});

console.log(process.exitCode ? "FALLÓ" : `OK · ${ok} pruebas`);
