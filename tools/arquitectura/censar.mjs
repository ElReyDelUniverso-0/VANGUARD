#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v412.0 · CENSADOR DE LA CASA — la foto real de la arquitectura
//
// Uso:  node tools/arquitectura/censar.mjs
//
// Qué hace (y qué no):
//   · LEE el árbol de verdad: src/app/**/page.tsx y src/app/api/**/route.ts.
//   · CUENTA las referencias entrantes: cuántos ficheros de src/ mencionan
//     cada ruta entre comillas. No adivina: si una ruta no aparece en ningún
//     sitio, es una puerta huérfana y se dice.
//   · ESCRIBE src/lib/arquitectura/censo.json con la foto y su fecha. La
//     página /arquitectura la lee; el fichero se versiona para que el número
//     que ve el visitante se pueda comprobar contra el commit.
//   · NO escribe en src/app, NO borra nada, NO toca la base de datos.
// ═══════════════════════════════════════════════════════════════════

import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, sep, dirname } from "node:path";

const RAIZ = process.cwd();
const APP = join(RAIZ, "src", "app");
const SRC = join(RAIZ, "src");
const SALIDA = join(RAIZ, "src", "lib", "arquitectura", "censo.json");

function caminar(dir, out = []) {
  for (const nombre of readdirSync(dir)) {
    const p = join(dir, nombre);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (nombre === "node_modules" || nombre.startsWith(".")) continue;
      caminar(p, out);
    } else {
      out.push(p);
    }
  }
  return out;
}

function aRuta(archivo, base, fichero) {
  const rel = relative(base, archivo).split(sep).join("/");
  const sin = rel.slice(0, -(fichero.length + 1));
  const limpio = sin.replace(/\/index$/, "");
  return "/" + limpio;
}

const archivosApp = caminar(APP);

const paginas = archivosApp
  .filter((f) => /(^|[/\\])page\.tsx$/.test(f))
  .map((f) => aRuta(f, APP, "page.tsx"))
  .sort();

const rutasApi = archivosApp
  .filter((f) => /(^|[/\\])route\.ts$/.test(f))
  .map((f) => aRuta(f, APP, "route.ts"))
  .sort();

// ── referencias entrantes ─────────────────────────────────────────
// Solo cuentan las que un visitante PUEDE pulsar: páginas, layouts y
// componentes. El sitemap, robots, llms.txt y las rutas de API mencionan
// rutas, pero nadie las pulsa: si contaran, ninguna puerta sería huérfana
// nunca y el censo mentiría.
const navegable = (f) => {
  const rel = relative(SRC, f).split(sep).join("/");
  if (rel.startsWith("components/")) return true;
  // Los registros de src/lib GENERAN enlaces (menús, espacios, catálogos): si
  // no contaran, media casa parecería huérfana cuando en realidad se llega a
  // ella desde un menú que se construye en tiempo de render.
  if (rel.startsWith("lib/")) {
    return !/lib\/(api|sistema)\/catalogo\.ts$/.test(rel) ? true : true;
  }
  if (!rel.startsWith("app/")) return false;
  if (/\/(sitemap|robots|manifest|icon|opengraph-image|llms\.txt)\./.test(rel)) return false;
  if (rel.startsWith("app/api/")) return false;
  return /(^|\/)page\.tsx$|(^|\/)layout\.tsx$|(^|\/)[a-z0-9\-]+\.tsx$/.test(rel);
};

const fuentes = caminar(SRC).filter((f) => /\.(ts|tsx|mts|js|mjs)$/.test(f) && navegable(f));
const contenido = new Map();
for (const f of fuentes) contenido.set(f, readFileSync(f, "utf8"));

function normalizarRuta(ruta) {
  // una ruta con segmentos dinámicos se busca también por su prefijo literal
  return ruta.replace(/\[[^\]]+\]/g, "");
}

const referencias = new Map(); // ruta -> Set(archivos)
for (const ruta of [...paginas, ...rutasApi]) {
  referencias.set(ruta, new Set());
}
const listaRutas = [...paginas, ...rutasApi];

for (const [archivo, texto] of contenido) {
  // extrae literales que empiezan por "/" (href, router.push, redirect, Link…)
  const literales = texto.match(/["'`](\/[A-Za-z0-9\-_/[\]$.?=&%]*)/g) ?? [];
  for (const bruto of literales) {
    const lit = bruto.slice(1).split("?")[0].split("#")[0];
    if (!lit.startsWith("/")) continue;
    for (const ruta of listaRutas) {
      const base = normalizarRuta(ruta);
      // la ruta "X" cuenta si el literal es X o cuelga de X/… (o al revés para dinámicas)
      if (lit === base || lit.startsWith(base.endsWith("/") ? base : base + "/") || base === lit + "/") {
        if (ruta === "/" && lit !== "/") continue;
        // una página no se cuenta a sí misma salvo que otra la enlace de verdad
        referencias.get(ruta).add(relative(SRC, archivo).split(sep).join("/"));
      }
    }
  }
}

const propio = (ruta, archivo) => {
  // el fichero de la propia página no cuenta como puerta entrante
  const rel = ruta === "/" ? "app" : "app" + ruta;
  return archivo.startsWith(rel + "/page") || archivo === rel + "/page.tsx";
};

const detalle = [...paginas, ...rutasApi].map((ruta) => {
  const refs = [...referencias.get(ruta)].filter((a) => !propio(ruta, a));
  return {
    ruta,
    tipo: paginas.includes(ruta) ? "pagina" : "api",
    referencias: refs.length,
    desde: refs.slice(0, 4),
  };
});

const huerfanas = detalle
  .filter((d) => d.tipo === "pagina" && d.ruta !== "/" && d.referencias === 0)
  .map((d) => d.ruta)
  .sort();

const bienConectadas = detalle.filter((d) => d.tipo === "pagina" && d.referencias >= 3).length;

const censo = {
  version: "v412.0",
  fecha: new Date().toISOString().slice(0, 10),
  paginas: paginas.length,
  rutasApi: rutasApi.length,
  total: paginas.length + rutasApi.length,
  bienConectadas,
  huerfanas,
  paginasConReferencias: detalle.filter((d) => d.tipo === "pagina" && d.referencias > 0).length,
  mediaReferencias: Number(
    (
      detalle.filter((d) => d.tipo === "pagina").reduce((t, d) => t + d.referencias, 0) /
      Math.max(1, detalle.filter((d) => d.tipo === "pagina").length)
    ).toFixed(2)
  ),
  rutas: detalle.sort((a, b) => a.ruta.localeCompare(b.ruta)),
};

mkdirSync(dirname(SALIDA), { recursive: true });
writeFileSync(SALIDA, JSON.stringify(censo, null, 2) + "\n", "utf8");

console.log(`Censo escrito en ${relative(RAIZ, SALIDA)}`);
console.log(`  páginas        ${censo.paginas}`);
console.log(`  rutas de API   ${censo.rutasApi}`);
console.log(`  con enlaces    ${censo.paginasConReferencias}/${censo.paginas}`);
console.log(`  huérfanas      ${censo.huerfanas.length}${censo.huerfanas.length ? " → " + censo.huerfanas.join(", ") : ""}`);
