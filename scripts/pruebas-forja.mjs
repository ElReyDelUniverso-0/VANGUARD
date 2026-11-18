#!/usr/bin/env node
// v406.1 LA FORJA — pruebas de las funciones puras del ecosistema de creadores.
// Uso: node scripts/pruebas-forja.mjs
// Transpila los módulos puros de src/lib/creadores con el TypeScript del repo
// (sin dependencias nuevas) y los importa desde data: URLs.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const cargar = async (nombre) => {
  const fuente = readFileSync(new URL(`../src/lib/creadores/${nombre}.ts`, import.meta.url), "utf8");
  const js = ts.transpileModule(fuente, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
};
const T = await cargar("tipos");
const P = await cargar("permisos");
const M = await cargar("moderacion");
const R = await cargar("reconocimiento");

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

console.log("TIPOS");
prueba("las cinco clases pedidas por el Dueño", () => {
  assert.deepEqual([...T.CLASES], ["mapa", "escenario", "investigacion", "simulacion", "proyecto"]);
  for (const c of T.CLASES) assert.ok(T.INFO_CLASES[c].sala.href.startsWith("/"), c);
});
prueba("validarObra rechaza clase desconocida y título corto", () => {
  assert.ok(T.validarObra({ clase: "meme" }).error);
  assert.ok(T.validarObra({ clase: "mapa", titulo: "ab", resumen: "un resumen suficiente" }).error);
});
prueba("un mapa válido: puntos redondeados y fuera los inválidos", () => {
  const r = T.validarObra({
    clase: "mapa", titulo: "Puertos del Caribe", resumen: "Los puertos con más tráfico de la región.",
    datos: { puntos: [{ lat: 18.4291234, lon: -70.0123456, etiqueta: "Haina" }, { lat: 200, lon: 0, etiqueta: "x" }, { lat: 1, lon: 1, etiqueta: "" }] },
    etiquetas: "Caribe, puertos, caribe",
  });
  assert.equal(r.error, null);
  assert.equal(r.obra.datos.puntos.length, 1);
  assert.equal(r.obra.datos.puntos[0].lat, 18.4291);
  assert.deepEqual(r.obra.etiquetas, ["caribe", "puertos"]);
});
prueba("una investigación exige fuentes públicas (fuera localhost, IP privadas y javascript:)", () => {
  const base = { clase: "investigacion", titulo: "Remesas 2025", resumen: "Cuánto pesan las remesas en el PIB.", datos: { pregunta: "¿Cuánto pesan las remesas?" } };
  assert.ok(T.validarObra({ ...base, datos: { ...base.datos, fuentes: ["http://localhost/x", "http://192.168.1.1/a", "javascript:alert(1)", "http://0.0.0.0/"] } }).error);
  const r = T.validarObra({ ...base, datos: { ...base.datos, fuentes: "https://www.bancentral.gov.do/\nftp://x.org" } });
  assert.equal(r.error, null);
  assert.deepEqual(r.obra.datos.fuentes, ["https://www.bancentral.gov.do/"]);
});
prueba("enlaces: solo rutas internas de la casa", () => {
  const r = T.sanearDatos("proyecto", { objetivo: "Cartografiar los ríos", hitos: [{ texto: "Fase 1", hecho: true }], enlaces: ["/mapas", "//evil.com", "https://x.com", "/cuartel?sala=lab"] });
  assert.deepEqual(r.datos.enlaces, ["/mapas", "/cuartel?sala=lab"]);
});
prueba("simulación necesita dos variables y una regla; escenario, premisa y supuestos", () => {
  assert.ok(T.sanearDatos("simulacion", { variables: [{ nombre: "a", valor: 1 }], regla: "a por b igual c" }).error);
  assert.equal(T.sanearDatos("simulacion", { variables: [{ nombre: "a", valor: 1 }, { nombre: "b", valor: "2" }], regla: "a por b igual c" }).error, null);
  assert.ok(T.sanearDatos("escenario", { premisa: "¿Y si cierra el canal?", supuestos: [] }).error);
});
prueba("el mini-mapa usa la misma proyección que dibujó /mapa-mundo.svg", () => {
  const wp = JSON.parse(readFileSync(new URL("../src/lib/world-paths.json", import.meta.url), "utf8"));
  assert.deepEqual(T.PROYECCION_MUNDO, wp.proj);
});
prueba("cambioEntre y media", () => {
  const a = { titulo: "A", resumen: "r", cuerpo: "hola", datos: "{}" };
  assert.deepEqual(T.cambioEntre(a, { ...a, titulo: "B", cuerpo: "hola mundo" }), ["título", "texto (+6 caracteres)"]);
  assert.equal(T.media(0, 0), null);
  assert.equal(T.media(14, 3), 4.7);
});

console.log("PERMISOS");
prueba("visitante y suspendido solo leen", () => {
  for (const r of ["visitante", "suspendido"]) {
    assert.ok(P.puede(r, "leer"));
    for (const a of ["publicar", "comentar", "valorar", "reportar", "moderar"]) assert.equal(P.puede(r, a), false, `${r} ${a}`);
  }
});
prueba("fallo cerrado: sin AUTH_SECRET nadie modera, ni el dueño", () => {
  for (const a of ["moderar", "suspender", "nombrar"]) assert.equal(P.puede("dueno", a, false), false);
  assert.ok(P.puede("dueno", "publicar", false));
  assert.ok(!P.permisosDe("moderador", false).includes("moderar"));
});
prueba("solo el dueño nombra; un moderador no toca a otro moderador", () => {
  assert.ok(P.puede("dueno", "nombrar"));
  assert.equal(P.puede("moderador", "nombrar"), false);
  assert.equal(P.puedeActuarSobre("moderador", "moderador"), false);
  assert.equal(P.puedeActuarSobre("moderador", "dueno"), false);
  assert.ok(P.puedeActuarSobre("moderador", "creador"));
  assert.equal(P.puedeActuarSobre("dueno", "dueno"), false);
});
prueba("rolEfectivo: sin sesión visitante; un rol guardado raro no eleva", () => {
  assert.equal(P.rolEfectivo(null, "moderador", false), "visitante");
  assert.equal(P.rolEfectivo("ANA", "dueno", false), "creador");
  assert.equal(P.rolEfectivo("ANA", "suspendido", true), "dueno");
  assert.equal(P.rolEfectivo("ANA", "verificado", false), "verificado");
});

console.log("MODERACIÓN");
prueba("veredicto de la IA → estado inicial", () => {
  assert.equal(M.estadoPorVeredicto("INAPROPIADO", true), "ELIMINADO");
  assert.equal(M.estadoPorVeredicto("SOSPECHOSO"), "PENDIENTE");
  assert.equal(M.estadoPorVeredicto("SOSPECHOSO", true), "APROBADO");
  assert.equal(M.estadoPorVeredicto("OK"), "APROBADO");
});
prueba("umbral de reportes (doble para verificados)", () => {
  assert.equal(M.debeIrACola(M.UMBRAL_REPORTES - 1, false), false);
  assert.ok(M.debeIrACola(M.UMBRAL_REPORTES, false));
  assert.equal(M.debeIrACola(M.UMBRAL_REPORTES, true), false);
});
prueba("transiciones: no se aprueba lo publicado ni se elimina lo retirado", () => {
  assert.equal(M.transicion("PENDIENTE", "aprobar"), "APROBADO");
  assert.equal(M.transicion("APROBADO", "aprobar"), null);
  assert.equal(M.transicion("RETIRADA", "eliminar"), null);
  assert.equal(M.transicion("OCULTO", "restaurar"), "APROBADO");
  assert.equal(M.transicion("PENDIENTE", "destacar"), null);
});
prueba("visibilidad y motivo obligatorio", () => {
  assert.ok(M.visiblePara("APROBADO", { esAutor: false, modera: false }));
  assert.equal(M.visiblePara("OCULTO", { esAutor: false, modera: false }), false);
  assert.ok(M.visiblePara("OCULTO", { esAutor: true, modera: false }));
  assert.equal(M.visiblePara("ELIMINADO", { esAutor: true, modera: false }), false);
  assert.equal(M.motivoValido("  "), null);
  assert.equal(M.motivoValido("spam repetido"), "spam repetido");
});

console.log("RECONOCIMIENTO");
const obra = (x = {}) => ({ clase: "mapa", estado: "APROBADO", version: 1, ratingSum: 0, ratingCount: 0, destacada: false, fuentes: 0, creada: 0, ...x });
prueba("fama: solo cuentan las obras publicadas", () => {
  const h = { obras: [obra({ ratingSum: 9, version: 3 }), obra({ estado: "OCULTO", ratingSum: 50 })], comentariosAprobados: 0, coleccionesPublicas: [], rol: "creador" };
  assert.equal(R.fama(h), 5 + 18 + 2);
});
prueba("insignias salen de datos comprobables", () => {
  const sem = 7 * 86400e3;
  const h = {
    obras: [obra({ creada: 0 }), obra({ creada: sem }), obra({ creada: 2 * sem }), obra({ clase: "investigacion", fuentes: 3 })],
    comentariosAprobados: 2, coleccionesPublicas: [{ obras: 5 }], rol: "verificado",
  };
  const ids = R.insignias(h).map((i) => i.id);
  for (const id of ["verificado", "primera", "cartografo", "riguroso", "constante", "curador"]) assert.ok(ids.includes(id), id);
  assert.ok(!ids.includes("voz") && !ids.includes("dueno"));
});
prueba("rangos con escalones públicos", () => {
  assert.equal(R.rango(0).nombre, "Aprendiz");
  assert.deepEqual(R.rango(45).siguiente, { nombre: "Forjador", faltan: 5 });
  assert.equal(R.rango(9999).siguiente, null);
});

console.log(`\n${ok} pruebas pasan${process.exitCode ? " · HAY FALLOS" : ""}`);
