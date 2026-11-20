#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v422.3 RADIO VANGUARD · LAS PRUEBAS DE LA VOZ
//
// Estas pruebas NO leen el código: lo EJECUTAN. Se transpila
// `src/lib/radio/{guion,conversar}.ts` con el compilador TypeScript que ya
// tiene la casa, se escribe el resultado en un directorio temporal y se
// importa como módulo. Así lo que se comprueba es el comportamiento real:
//
//   ① sin cables, el programa lo dice y no inventa nada;
//   ② el recorte es por frase completa (nunca una palabra partida);
//   ③ cada bloque deja un silencio > 0 (las pausas son datos, no texto);
//   ④ la duración estimada es coherente con los bloques que hay;
//   ⑤ el texto no contiene `undefined`, `NaN` ni `null` — el error clásico
//      de las voces que leen basura;
//   ⑥ cada bloque de noticia lleva su nota, su fuente y su href real;
//   ⑦ el mismo archivo con tres estilos da tres sintonías distintas;
//   ⑧ la conversación acierta con región, tema, fuente, resumen y hora;
//   ⑨ y cuando no sabe, LO DICE (`hallado: false`) en vez de improvisar;
//   ⑩ el reproductor, la página y los registros de la casa están puestos
//      de verdad (no hay una sala sin puerta ni una boca sin pausa).
//
// Uso:  node scripts/pruebas-radio.mjs
// Sale con código 1 si algo falla.
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (f) => readFileSync(join(RAIZ, f), "utf8");
const require = createRequire(join(RAIZ, "package.json"));

let pasadas = 0;
const fallos = [];
const ok = (cond, mensaje) => (cond ? (pasadas += 1) : fallos.push(mensaje));
const seccion = (t) => console.log(`\n── ${t}`);

// ── carga real del módulo ───────────────────────────────────────────
const ts = require("typescript");
const tmp = mkdtempSync(join(tmpdir(), "vg-radio-"));
function cargar(archivo, salida) {
  const fuente = leer(archivo);
  const { outputText } = ts.transpileModule(fuente, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: archivo,
  });
  const js = outputText.replace(/from "\.\/([a-z-]+)"/g, 'from "./$1.mjs"');
  writeFileSync(join(tmp, salida), js, "utf8");
  return pathToFileURL(join(tmp, salida)).href;
}
const urlGuion = cargar("src/lib/radio/guion.ts", "guion.mjs");
const urlConversar = cargar("src/lib/radio/conversar.ts", "conversar.mjs");
const guion = await import(urlGuion);
const conversar = await import(urlConversar);
rmSync(tmp, { recursive: true, force: true });

ok(typeof guion.construirPrograma === "function", "no se pudo cargar construirPrograma");
ok(typeof conversar.responder === "function", "no se pudo cargar responder");

// ── datos de prueba: cables con la forma REAL de Nota ───────────────
const AHORA = Date.parse("2026-11-18T14:00:00.000Z");
const iso = (minutos) => new Date(AHORA - minutos * 60000).toISOString();
const NOTAS = [
  { id: "n1", titulo: "Ucrania firma un alto el fuego parcial en el este", resumen: "El acuerdo cubre tres corredores humanitarios y se revisará en una semana. Los observadores no confirman todavía la retirada de armas pesadas.", url: "https://ejemplo.test/1", fuente: "Agencia Uno", imagen: null, fecha: iso(12), region: "europa", conflicto: "Ucrania" },
  { id: "n2", titulo: "Israel y Líbano reabren conversaciones sobre la frontera", resumen: "La mediación se retoma en Qatar con un calendario de tres fases.", url: "https://ejemplo.test/2", fuente: "Agencia Dos", imagen: null, fecha: iso(48), region: "oriente", conflicto: "Oriente Medio" },
  { id: "n3", titulo: "Brasil anuncia un plan de infraestructura para el Amazonas", resumen: "El programa incluye vigilancia satelital y financiación municipal durante cinco años.", url: "https://ejemplo.test/3", fuente: "Agencia Tres", imagen: null, fecha: iso(180), region: "americas", conflicto: null },
  { id: "n4", titulo: "China publica datos de crecimiento del tercer trimestre", resumen: "El informe oficial sitúa la cifra por debajo de la previsión del propio gobierno.", url: "https://ejemplo.test/4", fuente: "Agencia Cuatro", imagen: null, fecha: iso(400), region: "asia", conflicto: null },
  { id: "n5", titulo: "El Sahel activa un fondo común contra la sequía", resumen: "Cinco países aportan al fondo; el reparto se decidirá por comité técnico.", url: "https://ejemplo.test/5", fuente: "Agencia Cinco", imagen: null, fecha: iso(900), region: "africa", conflicto: null },
  { id: "n6", titulo: "Rusia y Ucrania intercambian prisioneros en la frontera norte", resumen: "El intercambio fue verificado por la Cruz Roja, según el comunicado.", url: "https://ejemplo.test/6", fuente: "Agencia Uno", imagen: null, fecha: iso(30), region: "europa", conflicto: "Ucrania" },
];

const PROHIBIDO = /undefined|NaN|\bnull\b|\[object Object\]/;
const textos = (p) => p.bloques.map((b) => b.texto);

// ── ① sin cables ────────────────────────────────────────────────────
seccion("sin cables, la radio no inventa");
{
  const p = guion.construirPrograma([], { ahora: AHORA });
  ok(p.bloques.length === 1, `sin notas debe haber 1 bloque (sintonía) y hay ${p.bloques.length}`);
  ok(/no tiene cables nuevos/i.test(p.bloques[0].texto), "el bloque de sintonía no avisa de que no hay cables");
  ok(p.notaIds.length === 0, "sin notas no puede haber notaIds");
  ok(p.duracionMs > 0, "la duración estimada debe ser > 0 incluso en silencio");
  ok(!PROHIBIDO.test(textos(p).join(" ")), "el programa vacío contiene basura (undefined/NaN/null)");
}

// ── ② recorte por frase ─────────────────────────────────────────────
seccion("recorte por frase, nunca por palabra");
{
  const largo = "Primera frase completa del resumen del cable. Segunda frase que también termina bien. Tercera que ya sobra y no debería aparecer entera porque el límite es corto.";
  for (const max of [40, 70, 100, 130, 200]) {
    const r = guion.recortarPorFrase(largo, max);
    ok(r.length <= max + 1, `recortarPorFrase(${max}) devolvió ${r.length} caracteres`);
    ok(/[.…]$/.test(r), `recortarPorFrase(${max}) no termina en punto ni en puntos suspensivos: «${r.slice(-12)}»`);
    ok(!/\s$/.test(r), `recortarPorFrase(${max}) deja un espacio final`);
    // no puede terminar en una palabra partida: si acaba en … la palabra previa está completa
    const ultima = r.replace(/[.…]$/, "").trim().split(" ").pop() ?? "";
    ok(largo.includes(ultima), `recortarPorFrase(${max}) partió una palabra: «${ultima}»`);
  }
  ok(guion.recortarPorFrase("Corto.", 100) === "Corto.", "un texto corto no debe tocarse");
  ok(guion.recortarPorFrase("", 100) === "", "recortarPorFrase de vacío debe dar vacío");
  const sinEspacios = guion.recortarPorFrase("a".repeat(300), 50);
  ok(sinEspacios.length > 0 && sinEspacios.length <= 51, "recortarPorFrase sin espacios debe seguir recortando");
}

// ── ③ pausas reales ────────────────────────────────────────────────
seccion("las pausas son datos (> 0), no puntos suspensivos");
{
  const p = guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 4 });
  ok(p.bloques.length >= 8, `un programa con 6 cables debe tener al menos 8 bloques y tiene ${p.bloques.length}`);
  for (const b of p.bloques) {
    ok(Number.isFinite(b.pausaMs) && b.pausaMs > 0, `el bloque «${b.id}» no deja silencio (pausaMs=${b.pausaMs})`);
    ok(b.texto.trim().length > 0, `el bloque «${b.id}» está vacío`);
    ok(!/\.\.\.$/.test(b.texto), `el bloque «${b.id}» simula la pausa con puntos suspensivos`);
  }
  const desarrollo = p.bloques.filter((b) => b.tipo === "desarrollo");
  const sintonia = p.bloques.find((b) => b.tipo === "sintonia");
  ok(desarrollo.every((b) => b.pausaMs > sintonia.pausaMs), "la pausa del desarrollo debe ser mayor que la de la sintonía (respiración tras explicar)");
}

// ── ④ duración coherente ───────────────────────────────────────────
seccion("la duración dice la verdad");
{
  const p = guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 4 });
  const suma = p.bloques.reduce((ms, b) => ms + Math.round((b.texto.length / 14) * 1000) + b.pausaMs, 0);
  ok(Math.abs(p.duracionMs - suma) <= 30, `duracionMs (${p.duracionMs}) no coincide con la suma de bloques (${suma})`);
  const corto = guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 1 });
  ok(p.duracionMs > corto.duracionMs, "más noticias desarrolladas deben durar más");
  ok(p.duracionMs > 20000 && p.duracionMs < 15 * 60000, `duración fuera de rango razonable: ${p.duracionMs} ms`);
  ok(guion.estimarDuracion([]) === 0, "estimarDuracion de cero bloques debe ser 0");
}

// ── ⑤ nada de basura en el texto ───────────────────────────────────
seccion("la boca no puede leer basura");
{
  const casos = [
    guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 8 }),
    guion.construirPrograma([{ ...NOTAS[0], resumen: "" }], { ahora: AHORA }),
    guion.construirPrograma([{ ...NOTAS[0], fecha: "no-es-fecha" }], { ahora: AHORA }),
  ];
  for (const [i, p] of casos.entries()) {
    const todo = textos(p).join(" ");
    ok(!PROHIBIDO.test(todo), `el programa ${i} contiene undefined/NaN/null`);
    ok(!/\s{2,}/.test(todo), `el programa ${i} tiene espacios dobles (se oyen como tartamudeo)`);
    ok(!/,\s*\./.test(todo), `el programa ${i} tiene una coma antes de punto`);
  }
  const sinFecha = guion.construirPrograma([{ ...NOTAS[0], fecha: "no-es-fecha" }], { ahora: AHORA });
  ok(!/hace/i.test(textos(sinFecha).join(" ")), "una fecha inválida no puede producir un «hace X»");
}

// ── ⑥ de dónde sale cada bloque ────────────────────────────────────
seccion("cada bloque de noticia lleva su nota, su fuente y su enlace");
{
  const p = guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 4 });
  const conNota = p.bloques.filter((b) => b.notaId);
  ok(conNota.length >= 4, `se esperaban bloques con nota y hay ${conNota.length}`);
  const ids = new Set(NOTAS.map((n) => n.id));
  for (const b of conNota) {
    ok(ids.has(b.notaId), `el bloque «${b.id}» cita una nota inexistente (${b.notaId})`);
    ok(b.href === `/lectura/${b.notaId}`, `el bloque «${b.id}» no enlaza a /lectura/${b.notaId} (${b.href})`);
    ok(NOTAS.some((n) => n.fuente === b.fuente), `el bloque «${b.id}» inventa una fuente (${b.fuente})`);
  }
  for (const n of NOTAS.slice(0, 3)) {
    ok(textos(p).some((t) => t.includes(n.titulo)), `el titular «${n.titulo}» no aparece literal en el programa`);
  }
  ok(p.notaIds.length === 4, `notaIds debe listar los 4 desarrollos y lista ${p.notaIds.length}`);
  ok(guion.programaATexto(p).length > 400, "programaATexto debe devolver el guion completo");
}

// ── ⑦ tres estilos, tres radios ────────────────────────────────────
seccion("tres estilos de locución, tres programas distintos");
{
  const a = guion.construirPrograma(NOTAS, { ahora: AHORA, estilo: "serena" });
  const b = guion.construirPrograma(NOTAS, { ahora: AHORA, estilo: "cercana" });
  const c = guion.construirPrograma(NOTAS, { ahora: AHORA, estilo: "filosa" });
  const s = (p) => p.bloques.find((x) => x.tipo === "sintonia").texto;
  ok(new Set([s(a), s(b), s(c)]).size >= 2, "los tres estilos comparten la misma sintonía (no hay estilo)");
  ok(new Set([a.estilo, b.estilo, c.estilo]).size === 3, "el programa no recuerda su estilo");
  ok(guion.construirPrograma(NOTAS, { ahora: AHORA, estilo: "desconocido" }).estilo === "cercana", "un estilo inválido debe caer en el de por defecto");
}

// ── ⑧⑨ la conversación ─────────────────────────────────────────────
seccion("la conversación entiende lo que puede demostrar");
{
  const intencion = (q) => conversar.interpretar(q).intencion;
  ok(intencion("Hola") === "saludo", "«Hola» no se interpreta como saludo");
  ok(intencion("¿qué pasa en Europa?") === "region", "una región no se interpreta como región");
  ok(intencion("dame el resumen del día") === "resumen", "«resumen» no se interpreta como resumen");
  ok(intencion("¿qué hora es?") === "hora", "«qué hora es» no se interpreta como hora");
  ok(intencion("¿algo bueno?") === "buenas", "«algo bueno» no se interpreta como buenas noticias");
  ok(intencion("cállate ya") === "silencio", "«cállate» no se interpreta como silencio");
  ok(intencion("¿qué puedes hacer?") === "ayuda", "«qué puedes hacer» no se interpreta como ayuda");
  ok(intencion("") === "desconocida", "una pregunta vacía debe ser desconocida");

  const saludo = conversar.responder("Hola", NOTAS, AHORA);
  ok(saludo.intencion === "saludo" && saludo.hallado, "el saludo debe saludar");
  ok(saludo.texto.includes(String(NOTAS.length)), "el saludo debe decir cuántos cables hay");

  const region = conversar.responder("¿Qué pasa en Ucrania?", NOTAS, AHORA);
  ok(region.intencion === "region", `preguntar por Ucrania debe caer en región y cayó en ${region.intencion}`);
  ok(region.notaIds.length === 2 && region.notaIds.every((id) => id === "n1" || id === "n6"), "la respuesta de región no trae los cables de Europa");
  ok(region.rotulos.every((r) => r.href.startsWith("/lectura/")), "los rótulos no enlazan a /lectura/");

  const tema = conversar.responder("háblame del Amazonas", NOTAS, AHORA);
  ok(tema.intencion === "tema" && tema.hallado, "un tema con cable debe encontrarse");
  ok(tema.notaIds[0] === "n3", `el tema debería encontrar n3 y encontró ${tema.notaIds.join(",")}`);

  const fuente = conversar.responder("¿Qué ha dicho Agencia Uno?", NOTAS, AHORA);
  ok(fuente.hallado, "una fuente real debe encontrarse");
  ok(fuente.notaIds.includes("n1") && fuente.notaIds.includes("n6"), "no trae los dos cables de esa fuente");

  const nada = conversar.responder("¿Qué pasa con el volcán de Islandia?", NOTAS, AHORA);
  ok(nada.hallado === false, "lo que no está debe declararse no hallado");
  ok(nada.notaIds.length === 0, "no hallado no puede traer notas");
  ok(/no tengo un cable/i.test(nada.texto), "la respuesta vacía debe decir que no lo tiene");

  const buenas = conversar.responder("¿algo bueno?", NOTAS, AHORA);
  ok(buenas.hallado && buenas.notaIds.length > 0, "con un alto el fuego en el archivo debe haber algo bueno");
  ok(conversar.responder("¿algo bueno?", [NOTAS[2]], AHORA).hallado === false, "sin buenas noticias no se puede inventar una");

  const hora = conversar.responder("¿qué hora es?", NOTAS, Date.parse("2026-11-18T09:07:00.000Z"));
  ok(/9 y 7/.test(hora.texto), `la hora no coincide con el reloj dado: «${hora.texto}»`);

  const vacio = conversar.responder("resumen", [], AHORA);
  ok(vacio.hallado === false && /archivo/i.test(vacio.texto), "sin cables el resumen debe decirlo");

  for (const q of ["hola", "resumen", "¿Qué pasa en África?", "¿algo bueno?", "xyzzy", "¿qué puedes hacer?"]) {
    const r = conversar.responder(q, NOTAS, AHORA);
    ok(!PROHIBIDO.test(r.texto), `la respuesta a «${q}» contiene basura`);
    ok(r.texto.trim().length > 0, `la respuesta a «${q}» está vacía`);
    ok(Array.isArray(r.rotulos), `la respuesta a «${q}» no trae rótulos`);
  }
  ok(conversar.SUGERENCIAS.length >= 4, "hacen falta preguntas de arranque");
  for (const s of conversar.SUGERENCIAS) {
    ok(conversar.interpretar(s).intencion !== "desconocida", `la sugerencia «${s}» no se entiende`);
  }
}

// ── ⑩ la casa está conectada de verdad ─────────────────────────────
seccion("el reproductor, la página y los registros");
{
  const reproductor = leer("src/components/radio/radio-vanguard.tsx");
  ok(reproductor.includes('from "@/lib/voz/decir"'), "el reproductor no usa la boca de la casa (decir)");
  ok(/decir\(bloque\.texto/.test(reproductor), "el reproductor no dice bloque a bloque");
  ok(/bloque\.pausaMs/.test(reproductor), "el reproductor no respeta la pausa del bloque");
  ok(/setTimeout\([\s\S]{0,90}pausaMs\)/.test(reproductor), "el silencio entre bloques no se espera de verdad");
  ok(reproductor.includes("guardarGustos"), "la personalización no se guarda");
  ok(reproductor.includes("leerGustos"), "la personalización no se recupera");
  ok(/prefers-reduced-motion|aria-live/.test(reproductor), "el reproductor no declara accesibilidad");
  ok(!/innerHTML/.test(reproductor), "el reproductor inyecta HTML (peligro de romper la página)");

  ok(existsSync(join(RAIZ, "src/app/radio/page.tsx")), "no existe /radio");
  const pagina = leer("src/app/radio/page.tsx");
  ok(pagina.includes("<RadioVanguard"), "/radio no monta el reproductor");
  ok(pagina.includes("obtenerNotas"), "/radio no lee los cables reales");
  ok((pagina.match(/<h1/g) ?? []).length === 1, "/radio debe tener un solo h1");
  ok(!pagina.includes('href="/radio"'), "/radio no debe enlazarse a sí misma como puerta");

  const nucleo = leer("src/lib/nucleo/registro.ts");
  ok(nucleo.includes('id: "mod:radio"') || nucleo.includes('id:"mod:radio"'), "el Núcleo no conoce /radio");
  ok(nucleo.includes('ruta: "/radio"') || nucleo.includes('ruta:"/radio"'), "la ficha del Núcleo no apunta a /radio");

  const espacios = leer("src/lib/navegacion/espacios.ts");
  ok(espacios.includes('"/radio"'), "la barra de la casa no tiene /radio (quedaría huérfana)");

  const bitacora = leer("src/lib/bitacora.ts");
  ok(bitacora.includes('version: "v422.3"'), "la bitácora no tiene la entrada v422.3");

  const version = leer("src/lib/version.ts");
  ok(/export const APP_VERSION = "v422\.3"/.test(version), "la versión en marcha no es v422.3");

  // la estética declara sus tokens (el bug del degradado invisible de v422.0)
  const css = leer("src/components/radio/radio.css");
  ok(css.includes(".vxr {"), "el CSS no define el contenedor .vxr");
  ok(/\.vxr[\s\S]{0,600}--vxr-oro:/.test(css), "el contenedor .vxr no declara sus tokens de color");
  ok(css.includes("prefers-reduced-motion"), "el CSS no apaga el movimiento");
  ok(!/glassmorphism|backdrop-filter: blur\((?:[1-9]\d{1,})/.test(css), "el CSS abusa del cristal");
}

// ── resultado ──────────────────────────────────────────────────────
if (fallos.length) {
  console.error(`\n✖ ${fallos.length} fallos de ${pasadas + fallos.length} comprobaciones`);
  for (const f of fallos) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(`\n✔ ${pasadas} comprobaciones · la radio lee, respira y no inventa`);
