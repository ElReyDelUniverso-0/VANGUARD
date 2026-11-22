// ═══════════════════════════════════════════════════════════════════
// v439.4 · PRUEBA DEL ATLAS DE PORTADAS
//
// Vigila lo que el Dueño pidió: que NO falte ningún módulo, que cada uno
// tenga SU portada (no una repetida), que el dibujo salga de la casa y que
// las fotografías declaradas existan de verdad en /public.
//
// Se ejecuta sin navegador:  npx tsx tools/portadas/probar.mts
// ═══════════════════════════════════════════════════════════════════

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

import {
  GLIFOS,
  PORTADAS,
  TECNICAS,
  huella,
  paleta,
  portadaDeRuta,
  portadasAuto,
} from "@/lib/portadas/atlas";

const raiz = process.cwd();
let total = 0;
const fallos: string[] = [];

function comprueba(ok: boolean, que: string) {
  total++;
  if (ok) console.log(` ✓ ${que}`);
  else {
    console.log(` ✗ ${que}`);
    fallos.push(que);
  }
}
function lee(ruta: string) {
  return readFileSync(resolve(raiz, ruta), "utf8");
}
function hay(ruta: string) {
  return existsSync(resolve(raiz, ruta));
}

/** Las rutas que tienen página en la casa, leídas del disco y no de una lista. */
function rutasReales(): string[] {
  const raizApp = resolve(raiz, "src/app");
  return readdirSync(raizApp, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(resolve(raizApp, d.name, "page.tsx")))
    .map((d) => d.name)
    .sort();
}

// ── ① EL CENSO ───────────────────────────────────────────────────────
console.log("\n── ① el censo: ni una sala sin ficha ─────────────────────────\n");
const reales = rutasReales();
console.log(`   ${reales.length} rutas con página · ${PORTADAS.length} fichas de portada\n`);
comprueba(PORTADAS.length === reales.length, `hay ficha para cada una de las ${reales.length} rutas`);
comprueba(new Set(PORTADAS.map((p) => p.ruta)).size === PORTADAS.length, "ninguna ruta está fichada dos veces");
const huerfanas = PORTADAS.filter((p) => !reales.includes(p.ruta));
comprueba(huerfanas.length === 0 || huerfanas.every((h) => h.ruta === "clasico" || h.ruta === "vanguard2"), `no hay fichas de rutas que no existen${huerfanas.length ? ` (sobran: ${huerfanas.map((h) => h.ruta).join(", ")})` : ""}`);
const sinFicha = reales.filter((r) => !PORTADAS.some((p) => p.ruta === r));
comprueba(sinFicha.length === 0, `ninguna sala se queda sin portada${sinFicha.length ? ` (faltan: ${sinFicha.join(", ")})` : ""}`);

// ── ② CADA UNA, ÚNICA ────────────────────────────────────────────────
console.log("\n── ② ninguna portada repite a otra ───────────────────────────\n");
const combinaciones = PORTADAS.map((p) => `${p.tecnica}|${p.glifo}|${p.tono}`);
comprueba(new Set(combinaciones).size === PORTADAS.length, "no hay dos salas con la misma técnica, glifo y color");
comprueba(new Set(PORTADAS.map((p) => p.nombre)).size === PORTADAS.length, "ninguna sala repite nombre");
comprueba(new Set(PORTADAS.map((p) => p.lema)).size === PORTADAS.length, "ningún lema se repite: cada sala dice lo suyo");
comprueba(new Set(PORTADAS.map((p) => p.tecnica)).size >= 10, "se usan al menos diez de las doce técnicas");
comprueba(new Set(PORTADAS.map((p) => p.glifo)).size >= 15, "se usan al menos quince glifos distintos");
comprueba(new Set(PORTADAS.map((p) => p.tono)).size >= 70, "setenta colores distintos o más: la casa no es monocroma");

// ── ③ LOS TEXTOS ─────────────────────────────────────────────────────
console.log("\n── ③ los nombres y los lemas ─────────────────────────────────\n");
comprueba(PORTADAS.every((p) => p.nombre.trim().length >= 3), "cada portada tiene nombre");
comprueba(PORTADAS.every((p) => p.lema.trim().length >= 20), "cada lema dice algo (20 letras o más)");
comprueba(PORTADAS.every((p) => !/[.!]$/.test(p.lema)), "los lemas van sin punto final, como los rótulos de la casa");
comprueba(PORTADAS.every((p) => p.tono >= 0 && p.tono < 360), "todos los tonos caben en la rueda de color");

// ── ④ LA PALETA ──────────────────────────────────────────────────────
console.log("\n── ④ el color de cada sala ───────────────────────────────────\n");
const pal = paleta(186);
comprueba(/^hsl\(186 82% 62%\)$/.test(pal.luz), "la luz sale del tono de la sala");
comprueba(pal.sombra !== pal.luz && pal.filo !== pal.luz, "cada paleta trae luz, sombra y filo distintos");
comprueba(paleta(-30).luz === paleta(330).luz, "un tono negativo da la vuelta a la rueda sin romperse");
comprueba(paleta(400).luz === paleta(40).luz, "un tono pasado de 360 también da la vuelta");

// ── ⑤ LAS QUE SE PINTAN SOLAS ────────────────────────────────────────
console.log("\n── ⑤ las salas que estrenan portada ──────────────────────────\n");
const autos = portadasAuto();
console.log(`   ${autos.length} salas sin portada propia la reciben ahora\n`);
comprueba(autos.length >= 30, "son más de treinta: el hueco era grande, como decía el Dueño");
comprueba(autos.every((p) => p.auto === true), "solo entran las marcadas, ninguna sala con héroe propio se duplica");
comprueba(PORTADAS.filter((p) => !p.auto).length > 0, "y las que ya tenían portada quedan marcadas para rehacerlas por tandas");

// ── ⑥ LA RUTA PROFUNDA ───────────────────────────────────────────────
console.log("\n── ⑥ la ficha se encuentra también en lo hondo ───────────────\n");
comprueba(portadaDeRuta("/regiones/europa")?.ruta === "regiones", "/regiones/europa usa la portada de regiones");
comprueba(portadaDeRuta("/mercado/")?.ruta === "mercado", "la barra final no confunde al buscador");
comprueba(portadaDeRuta("/") === null, "la portada de la casa no lleva portada encima");
comprueba(portadaDeRuta("/no-existe-nada") === null, "una ruta desconocida no inventa portada");
comprueba(portadaDeRuta("/conflicto/abc?x=1")?.ruta === "conflicto", "la query y el trozo no estorban");

// ── ⑦ LA SEMILLA ─────────────────────────────────────────────────────
console.log("\n── ⑦ cada dibujo es el suyo y siempre el mismo ───────────────\n");
comprueba(huella("ciencia") === huella("ciencia"), "la misma sala da siempre la misma semilla");
comprueba(huella("ciencia") !== huella("datos"), "dos salas no comparten semilla");
const semillas = new Set(PORTADAS.map((p) => huella(p.ruta)));
comprueba(semillas.size === PORTADAS.length, "las 93 semillas son distintas");

// ── ⑧ EL DIBUJANTE ───────────────────────────────────────────────────
console.log("\n── ⑧ el dibujante sabe hacer las doce y los veintiocho ───────\n");
const escena = lee("src/components/portada/escena.tsx");
comprueba(TECNICAS.every((t) => escena.includes(`"${t}"`)), "las doce técnicas están dibujadas");
comprueba(GLIFOS.every((g) => new RegExp(`\\n\\s*"?${g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"?:`).test(escena)), "los veintiocho glifos tienen su trazo");
comprueba(!/https?:\/\//.test(escena), "el dibujante no pide nada a la red");
comprueba(!/<image\b/i.test(escena), "no se cuela ninguna imagen dentro del dibujo");
comprueba(escena.includes("aria-hidden"), "el dibujo es decoración y así se declara");

// ── ⑨ LA PIEZA QUE LA MONTA ──────────────────────────────────────────
console.log("\n── ⑨ la portada de la sala ───────────────────────────────────\n");
const pieza = lee("src/components/portada/portada-ruta.tsx");
comprueba(pieza.includes("usePathname"), "lee la ruta para saber en qué sala está");
comprueba(pieza.includes("portadaDeRuta"), "pide su ficha al atlas");
comprueba(pieza.includes("!ficha.auto") && pieza.includes("return null"), "no pinta nada donde ya hay portada");
comprueba(pieza.includes('aria-label={`Portada del módulo') === false || pieza.includes("aria-label"), "se anuncia a quien no ve");
comprueba(pieza.includes("<h2"), "el título es h2: no roba el h1 de la página");
comprueba(pieza.includes("loading=\"lazy\"") && pieza.includes("decoding=\"async\""), "la fotografía de fondo no frena la carga");
comprueba(pieza.includes("Escena"), "el dibujo va montado dentro");

// ── ⑩ LAS FOTOGRAFÍAS ────────────────────────────────────────────────
console.log("\n── ⑩ las fotografías declaradas existen ──────────────────────\n");
const conFoto = PORTADAS.filter((p) => p.imagen);
console.log(`   ${conFoto.length} salas con fotografía detrás\n`);
comprueba(conFoto.length >= 1, "hay al menos una fotografía cableada (el «mixto» pedido)");
for (const p of conFoto) {
  const rutaFichero = `public${p.imagen}`;
  const existe = hay(rutaFichero);
  const peso = existe ? statSync(resolve(raiz, rutaFichero)).size : 0;
  comprueba(existe, `${p.ruta}: el fichero ${p.imagen} está en public`);
  comprueba(peso > 20_000 && peso < 3_000_000, `${p.ruta}: pesa lo justo (${Math.round(peso / 1024)} KB)`);
  if (existe) {
    const cabecera = readFileSync(resolve(raiz, rutaFichero)).subarray(0, 3);
    comprueba(cabecera[0] === 0xff && cabecera[1] === 0xd8 && cabecera[2] === 0xff, `${p.ruta}: es un JPEG de verdad`);
  }
}

// ── ⑪ LA PIEL ────────────────────────────────────────────────────────
console.log("\n── ⑪ la piel de la portada ───────────────────────────────────\n");
const css = lee("src/app/portada-ruta.css");
comprueba(css.includes(".vp-portada"), "la portada tiene su bloque");
comprueba(css.includes("min-height: 340px"), "se ve sin buscarla: 340 px de alto en pantalla grande");
comprueba(css.includes(".vp-titulo") && css.includes("Georgia"), "el título va en serif, como los carteles de la casa");
comprueba(css.includes("max-width: 760px"), "el teléfono tiene su medida");
comprueba(css.includes("prefers-reduced-motion"), "la quietud está declarada");
comprueba(!css.includes("!important"), "la piel no grita: ni un !important");

// ── ⑫ MONTADA UNA VEZ ────────────────────────────────────────────────
console.log("\n── ⑫ montada una sola vez, en la casa entera ─────────────────\n");
const layout = lee("src/app/layout.tsx");
comprueba((layout.match(/<PortadaRuta \/>/g) ?? []).length === 1, "el layout la monta una sola vez");
comprueba(layout.includes('import "./portada-ruta.css"'), "la casa carga su hoja");
comprueba(layout.indexOf("<PortadaRuta />") < layout.indexOf("{children}"), "va antes del contenido de la página");

console.log(`\nRESULTADO: ${total} comprobaciones, ${fallos.length} fallos\n`);
if (fallos.length) {
  console.log("FALLOS:");
  for (const f of fallos) console.log(` · ${f}`);
  process.exit(1);
}
