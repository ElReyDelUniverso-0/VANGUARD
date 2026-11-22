#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v422.1 REBIRTH · LAS PRUEBAS DEL ECOSISTEMA
//
// Comprueba lo que un «rediseño» suele romper sin que nadie lo note:
//   ① las diez familias están y son diez (ni nueve ni once);
//   ② ninguna puerta ni experiencia apunta a una ruta que no exista
//      (se comprueba contra src/app/**/page.tsx, no contra una lista);
//   ③ ninguna experiencia aparece dos veces: dos puertas a lo mismo es
//      exactamente lo que esta misión vino a quitar;
//   ④ cada ilustración declarada existe de verdad en public/;
//   ⑤ las cifras son DERIVADAS: en el registro no se escribe ni un número
//      a mano, y las que vienen de JSON coinciden con su fichero;
//   ⑥ la portada monta las tres piezas nuevas y ya no monta las dos
//      «front doors» que competían con ellas.
//
// Uso:  node scripts/pruebas-experiencia.mjs
// Sale con código 1 si algo falla.
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (f) => readFileSync(join(RAIZ, f), "utf8");

let pasadas = 0;
const fallos = [];
const ok = (cond, mensaje) => (cond ? (pasadas += 1) : fallos.push(mensaje));

// ── ① el registro ───────────────────────────────────────────────────
const registro = leer("src/lib/experiencia/registro.ts");

/** Trozos por eje: se corta por `id: "<clave>",` de primer nivel. */
const bloques = [...registro.matchAll(/\n  \{\n    id: "([a-z]+)",\n([\s\S]*?)\n  \},/g)].map((m) => ({
  id: m[1],
  cuerpo: m[2],
}));

ok(bloques.length === 10, `el registro debe declarar 10 ejes y declara ${bloques.length}`);

const CLAVES = [
  "actualidad", "geografia", "historia", "ciencia", "datos",
  "educacion", "simulacion", "narrativa", "investigacion", "mundos",
];
for (const clave of CLAVES) ok(bloques.some((b) => b.id === clave), `falta el eje «${clave}»`);

// ── ② cada ruta declarada existe como page.tsx ──────────────────────
/** Todas las rutas reales de la casa, con los segmentos dinámicos normalizados. */
const rutasReales = new Set();
(function recorrer(dir) {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) {
      if (entrada.startsWith("_") || entrada === "node_modules") continue;
      recorrer(ruta);
    } else if (entrada === "page.tsx") {
      const rel = relative(join(RAIZ, "src/app"), dir).replace(/\\/g, "/");
      rutasReales.add(rel === "" ? "/" : `/${rel}`);
    }
  }
})(join(RAIZ, "src/app"));

const hrefs = [...registro.matchAll(/href: "([^"]+)"/g)].map((m) => m[1]);
const puertas = [...registro.matchAll(/puerta: "([^"]+)"/g)].map((m) => m[1]);
const todas = [...new Set([...hrefs, ...puertas])];

ok(todas.length >= 40, `se esperaban al menos 40 puertas distintas y hay ${todas.length}`);
for (const href of todas) {
  ok(href.startsWith("/"), `la ruta «${href}» no es interna de la casa`);
  const limpia = href.split("?")[0].replace(/\/+$/, "") || "/";
  // v436.1 · rutas dinámicas: /modulo/<id> se sirve desde /modulo/[id]/page.tsx
  const comoDinamica = /^\/modulo\/[^/]+$/.test(limpia) ? "/modulo/[id]" : limpia;
  ok(
    rutasReales.has(limpia) || rutasReales.has(comoDinamica),
    `ruta rota en el registro: ${href} (no existe ${comoDinamica === limpia ? limpia : `${limpia} → ${comoDinamica}`}/page.tsx)`
  );
}

// ── ③ ni una experiencia repetida ───────────────────────────────────
const cuenta = new Map();
for (const h of hrefs) cuenta.set(h, (cuenta.get(h) ?? 0) + 1);
const repetidas = [...cuenta.entries()].filter(([, n]) => n > 1);
ok(repetidas.length === 0, `experiencias repetidas: ${repetidas.map(([h, n]) => `${h}×${n}`).join(", ")}`);

// ── ④ las ilustraciones existen ─────────────────────────────────────
const imgs = [...registro.matchAll(/img: "([^"]+)"/g)].map((m) => m[1]);
ok(imgs.length >= 10, `se esperaban al menos 10 ilustraciones (una por familia) y hay ${imgs.length}`);
for (const img of imgs) ok(existsSync(join(RAIZ, "public", img)), `ilustración inexistente: ${img}`);

// ── ⑤ las cifras son derivadas y cuadran ────────────────────────────
const valores = [...registro.matchAll(/valor: ([^,\n]+),/g)].map((m) => m[1].trim());
ok(valores.length >= 8, `se esperaban al menos 8 cifras declaradas y hay ${valores.length}`);
for (const v of valores) {
  ok(v.includes("${"), `cifra escrita a mano en el registro (debe derivarse): ${v}`);
}

const publicaciones = JSON.parse(leer("src/lib/ciencia/publicaciones.json"));
const ideas = JSON.parse(leer("src/lib/ciencia/ideas.json"));
ok(registro.includes("PUBLICACIONES.length"), "la cifra de publicaciones no se deriva de PUBLICACIONES");
ok(registro.includes("IDEAS.length"), "la cifra de ideas no se deriva de IDEAS");
ok(publicaciones.length > 0 && ideas.length > 0, "los JSON del índice científico están vacíos");

// los conteos que se enseñan en la entrada salen de las mismas fuentes
ok(registro.includes("PAISES_GEO.length"), "la cifra de países no se deriva de PAISES_GEO");
ok(registro.includes("CURSOS_ACADEMIA.length"), "la cifra de cursos no se deriva de CURSOS_ACADEMIA");
ok(/leccionesAcademia\(\)/.test(registro), "las lecciones no se cuentan desde los cursos");

// ── ⑥ la portada monta lo nuevo y deja de montar lo viejo ───────────
const portada = leer("src/app/page.tsx");
ok(portada.includes('from "@/components/experiencia/entrada"'), "la portada no monta la entrada");
// v437.2: las diez familias se muestran en la portada como la franja del
// MERCADO (MercadoPortada), no como el bloke completo del ecosistema; el
// ecosistema completo vive en /ecosistema y su componente se monta allí.
ok(portada.includes('from "@/components/mercado/mercado-portada"'), "la portada no monta la franja del mercado");
ok(portada.includes('from "@/components/experiencia/portada-viva"'), "la portada no monta la portada viva");
ok(portada.includes("<Entrada"), "la entrada no se renderiza");
ok(portada.includes("<MercadoPortada"), "la franja del mercado no se renderiza");
ok(portada.includes("<PortadaViva"), "la portada viva no se renderiza");
ok(!portada.includes("<AreasRejilla"), "la portada sigue montando las ocho áreas (compiten con el ecosistema)");
ok(!portada.includes("<HeroeVanguard"), "la portada sigue montando el héroe viejo (la entrada lo sustituye)");
ok(portada.includes("<HiloPortada"), "la portada perdió el hilo de la Travesía");
ok(portada.includes("<Historias"), "la portada perdió las historias de los frentes");
ok(portada.includes("<MapaPortada"), "la portada perdió el mapa vivo");
ok(portada.includes("<ModulosRejilla"), "la portada perdió la rejilla de módulos");

// /ecosistema monta EL MISMO componente (un componente, dos montajes)
ok(existsSync(join(RAIZ, "src/app/ecosistema/page.tsx")), "no existe /ecosistema");
const paginaEco = leer("src/app/ecosistema/page.tsx");
ok(paginaEco.includes("<Ecosistema"), "/ecosistema no monta el componente Ecosistema");
ok(!paginaEco.includes("EJES.map((eje) => (\n        <li className=\"vxe-eje\""), "/ecosistema duplica la composición en vez de montarla");
ok(leer("src/lib/nucleo/registro.ts").includes('id:"mod:ecosistema"'), "el Núcleo no conoce /ecosistema");
ok(leer("src/lib/bitacora.ts").includes('version: "v422.1"'), "la bitácora no tiene la entrada v422.1");

// el h1 de la portada es único y vive en la entrada
const h1 = (portada.match(/<h1/g) ?? []).length + (leer("src/components/experiencia/entrada.tsx").match(/<h1/g) ?? []).length;
ok(h1 === 1, `la portada debe tener un solo h1 y tiene ${h1}`);

// ── ⑦ v439.6 LA VOTACIÓN DEL MUNDO ────────────────────────────────
// Algo nuevo, original, nunca antes visto: una pregunta del día para
// todo el planeta. Determinista (hash de la fecha) → sólido y predecible.
ok(existsSync(join(RAIZ, "src/lib/votacion-dia.ts")), "no existe src/lib/votacion-dia.ts");
ok(existsSync(join(RAIZ, "src/app/votacion/page.tsx")), "no existe /votacion");
const votacionLib = leer("src/lib/votacion-dia.ts");
ok(votacionLib.includes("hashStr"), "la votación no tiene el hash determinista");
ok(votacionLib.includes("diaClave"), "la votación no deriva la clave del día");
ok(votacionLib.includes("votacionDelDia"), "la votación no elige la pregunta del día");
ok(votacionLib.includes("resultadosBase"), "la votación no tiene el tablero base");
ok(votacionLib.includes("aplicarVoto"), "la votación no aplica el voto del piloto");
ok(votacionLib.includes("votacionDeManana"), "la votación no puede predecir la de mañana");
ok(votacionLib.includes("localStorage"), "la votación no guarda el voto del piloto");
ok(existsSync(join(RAIZ, "src/components/portada/votacion-tarjeta.tsx")), "no existe la tarjeta de votación");
ok(portada.includes('from "@/components/portada/votacion-tarjeta"'), "la portada no monta la votación");
ok(portada.includes("<VotacionTarjeta"), "la votación no se renderiza en la portada");
const paginaVotacion = leer("src/app/votacion/page.tsx");
ok(paginaVotacion.includes("votacionDelDia"), "/votacion no usa la pregunta del día");
ok(paginaVotacion.includes("votacionDeManana"), "/votacion no muestra la de mañana (predecible)");
ok(leer("src/app/portada.css").includes(".vx-vot-card"), "portada.css no tiene estilos de la votación");

// ── resultado ───────────────────────────────────────────────────────
if (fallos.length) {
  console.error(`\n✖ ${fallos.length} fallos de ${pasadas + fallos.length} comprobaciones`);
  for (const f of fallos) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(`✔ ${pasadas} comprobaciones · el ecosistema está en pie (10 familias, ${todas.length} puertas reales)`);
