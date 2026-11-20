// ============================================================
// v417.0 · Pruebas de VANGUARD KNOWLEDGE (la Enciclopedia)
//
//   node scripts/pruebas-enciclopedia.mjs
//
// Hace cumplir el contrato editorial del encargo: ningún artículo sin
// introducción, explicación completa, datos con fuente, imagen con licencia
// permitida (y archivo presente en public/), bibliografía, fecha de revisión
// y temas relacionados; ninguna relación hacia la nada (artículos, conceptos,
// civilizaciones, organismos, países, puertas de categoría); ningún artículo
// huérfano; búsqueda temática que encuentra lo esperado.
// Sale con código 1 si algo falla.
// ============================================================
import { createRequire } from "node:module";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const RAIZ = process.cwd();
const { createJiti } = require(join(RAIZ, "node_modules/jiti"));
const jiti = createJiti(import.meta.url, { alias: { "@": join(RAIZ, "src") }, interopDefault: true });

let pasan = 0;
let fallan = 0;
async function prueba(nombre, fn) {
  try {
    await fn();
    pasan++;
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallan++;
    console.log(`  ✗ ${nombre}\n      ${e?.message ?? e}`);
  }
}
function afirmar(c, m) {
  if (!c) throw new Error(m);
}

const E = await jiti.import("@/lib/enciclopedia/indice");
const K = await jiti.import("@/lib/conocimiento/indice");
const O = await jiti.import("@/lib/planeta/organizaciones");
const G = await jiti.import("@/lib/geo-paises");

const { ARTICULOS, CATEGORIAS, IMAGENES, RUTAS } = E;
const LICENCIAS = /^(CC BY(-SA)? [0-9.]+|CC0|Public domain)$/;
const MIN_PALABRAS = 650;

/** ¿existe la ruta en src/app? (segmentos dinámicos [x] y grupos (x) incluidos) */
function rutaExiste(ruta) {
  const limpia = ruta.split(/[?#]/)[0];
  const segs = limpia.split("/").filter(Boolean);
  function busca(dir, i) {
    if (i === segs.length) return existsSync(join(dir, "page.tsx")) || existsSync(join(dir, "page.ts"));
    if (!existsSync(dir)) return false;
    const fijo = join(dir, segs[i]);
    if (existsSync(fijo) && statSync(fijo).isDirectory() && busca(fijo, i + 1)) return true;
    const { readdirSync } = require("node:fs");
    for (const d of readdirSync(dir)) {
      const p = join(dir, d);
      if (!statSync(p).isDirectory()) continue;
      if (/^\[.+\]$/.test(d) && busca(p, i + 1)) return true;
      if (/^\(.+\)$/.test(d) && busca(p, i)) return true;
    }
    return false;
  }
  return busca(join(RAIZ, "src/app"), 0);
}

console.log("\nPARTE A — contrato de cada artículo");

await prueba(`hay al menos 20 artículos (${ARTICULOS.length})`, () => afirmar(ARTICULOS.length >= 20, "pocos artículos"));

await prueba("slugs únicos, en minúsculas y sin chocar con rutas fijas", () => {
  const vistos = new Set();
  for (const a of ARTICULOS) {
    afirmar(/^[a-z0-9-]+$/.test(a.slug), `slug inválido ${a.slug}`);
    afirmar(!vistos.has(a.slug), `slug repetido ${a.slug}`);
    afirmar(!["buscar", "categoria"].includes(a.slug), `slug reservado ${a.slug}`);
    vistos.add(a.slug);
  }
});

await prueba(`cada artículo tiene título, introducción y explicación completa (≥ ${MIN_PALABRAS} palabras, ≥ 3 secciones)`, () => {
  for (const a of ARTICULOS) {
    afirmar(a.titulo && a.bajada, `${a.slug}: sin título o bajada`);
    afirmar(a.introduccion.length >= 2, `${a.slug}: introducción corta`);
    afirmar(a.secciones.length >= 3, `${a.slug}: menos de 3 secciones`);
    for (const s of a.secciones) afirmar(s.titulo && s.parrafos.length >= 1, `${a.slug}: sección vacía`);
    const n = E.palabrasDe(a);
    afirmar(n >= MIN_PALABRAS, `${a.slug}: ${n} palabras (< ${MIN_PALABRAS})`);
  }
});

await prueba("contexto histórico presente en los artículos que lo requieren", () => {
  const exigen = ["continentes", "civilizaciones", "paises", "organizaciones-internacionales"];
  for (const a of ARTICULOS)
    if (exigen.includes(a.categoria)) afirmar(a.historia && a.historia.parrafos.length >= 2, `${a.slug}: sin contexto histórico`);
});

await prueba("datos relevantes: ≥ 5 por artículo y cada uno remite a una fuente existente", () => {
  for (const a of ARTICULOS) {
    afirmar(a.datos.length >= 5, `${a.slug}: ${a.datos.length} datos`);
    for (const d of a.datos)
      afirmar(Number.isInteger(d.fuente) && d.fuente >= 0 && d.fuente < a.fuentes.length, `${a.slug}: «${d.etiqueta}» remite a fuente ${d.fuente}`);
  }
});

await prueba("fuentes: ≥ 4 por artículo, URL https, sin duplicados, y al menos una de referencia general", () => {
  for (const a of ARTICULOS) {
    afirmar(a.fuentes.length >= 4, `${a.slug}: ${a.fuentes.length} fuentes`);
    const urls = new Set();
    for (const f of a.fuentes) {
      afirmar(/^https:\/\//.test(f.url), `${a.slug}: URL no https ${f.url}`);
      afirmar(!urls.has(f.url), `${a.slug}: fuente duplicada ${f.url}`);
      urls.add(f.url);
      afirmar(f.titulo && f.editor, `${a.slug}: fuente sin título/editor`);
    }
    afirmar(
      a.fuentes.some((f) => /britannica\.com|wikipedia\.org|nationalgeographic\.org/.test(f.url)),
      `${a.slug}: sin obra de referencia general`,
    );
    afirmar(
      a.fuentes.some((f) => ["institucional", "datos", "academica"].includes(f.tipo)),
      `${a.slug}: sin fuente primaria (institucional, datos o académica)`,
    );
  }
});

await prueba("las cinco referencias del encargo están citadas en la enciclopedia", () => {
  const todas = ARTICULOS.flatMap((a) => a.fuentes.map((f) => f.url)).join(" ");
  for (const d of ["wikipedia.org", "britannica.com", "nationalgeographic", "education.nationalgeographic.org", "un.org"])
    afirmar(todas.includes(d), `nadie cita ${d}`);
});

await prueba("fecha de actualización AAAA-MM-DD válida y no futura", () => {
  const hoy = new Date().toISOString().slice(0, 10);
  for (const a of ARTICULOS) {
    afirmar(/^\d{4}-\d{2}-\d{2}$/.test(a.actualizado), `${a.slug}: fecha ${a.actualizado}`);
    afirmar(!Number.isNaN(Date.parse(a.actualizado)), `${a.slug}: fecha imposible`);
    afirmar(a.actualizado <= hoy || process.env.PERMITIR_FECHA_FUTURA, `${a.slug}: fecha futura ${a.actualizado}`);
  }
});

console.log("\nPARTE B — imágenes de uso permitido");

await prueba("cada artículo tiene ≥ 1 imagen con alt y pie", () => {
  for (const a of ARTICULOS) {
    afirmar(a.imagenes.length >= 1, `${a.slug}: sin imagen`);
    for (const i of a.imagenes) afirmar(i.alt && i.pie, `${a.slug}: imagen ${i.clave} sin alt/pie`);
  }
});

await prueba("cada imagen citada existe en imagenes.json y en public/", () => {
  for (const a of ARTICULOS)
    for (const i of a.imagenes) {
      const m = IMAGENES[i.clave];
      afirmar(m, `${a.slug}: clave ${i.clave} no está en imagenes.json`);
      afirmar(existsSync(join(RAIZ, "public", m.archivo)), `${a.slug}: falta el archivo ${m.archivo}`);
    }
});

await prueba("cada imagen tiene autor, licencia permitida y página de origen en Commons", () => {
  for (const [k, m] of Object.entries(IMAGENES)) {
    afirmar(m.autor && m.autor.length > 1, `${k}: sin autor`);
    afirmar(LICENCIAS.test(m.licencia), `${k}: licencia no permitida «${m.licencia}»`);
    afirmar(m.licencia === "Public domain" || m.licencia === "CC0" || /^https?:\/\//.test(m.licenciaUrl ?? ""), `${k}: CC sin enlace a la licencia`);
    afirmar(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(m.origen), `${k}: origen no es Commons`);
    afirmar(m.ancho > 0 && m.alto > 0, `${k}: sin dimensiones`);
    const kb = statSync(join(RAIZ, "public", m.archivo)).size / 1024;
    afirmar(kb < 300, `${k}: ${Math.round(kb)} KB (> 300 KB, pesa demasiado en móvil)`);
  }
});

await prueba("ninguna imagen del catálogo queda sin usar", () => {
  const usadas = new Set(ARTICULOS.flatMap((a) => a.imagenes.map((i) => i.clave)));
  const sobran = Object.keys(IMAGENES).filter((k) => !usadas.has(k));
  afirmar(sobran.length === 0, `sin usar: ${sobran.join(", ")}`);
});

console.log("\nPARTE C — relaciones entre artículos y con la casa");

await prueba("temas relacionados: ≥ 4, existentes, sin autorreferencia ni repetición", () => {
  for (const a of ARTICULOS) {
    afirmar(a.relacionados.length >= 4, `${a.slug}: ${a.relacionados.length} relacionados`);
    afirmar(new Set(a.relacionados).size === a.relacionados.length, `${a.slug}: relacionados repetidos`);
    for (const r of a.relacionados) {
      afirmar(r !== a.slug, `${a.slug}: se cita a sí mismo`);
      afirmar(E.articuloDe(r), `${a.slug}: relacionado inexistente «${r}»`);
    }
  }
});

await prueba("ningún artículo huérfano: todos reciben al menos un enlace de otro artículo", () => {
  for (const a of ARTICULOS) {
    const entra = ARTICULOS.some((b) => b.slug !== a.slug && b.relacionados.includes(a.slug));
    afirmar(entra, `${a.slug}: nadie lo enlaza`);
  }
});

await prueba("conceptos citados existen en /conocimiento/tema/[id]", () => {
  const ids = new Set(K.CONCEPTOS.map((c) => c.id));
  for (const a of ARTICULOS) for (const c of a.conceptos ?? []) afirmar(ids.has(c), `${a.slug}: concepto «${c}» no existe`);
});

await prueba("civilizaciones citadas existen en el explorador", () => {
  const ids = new Set(K.CIVILIZACIONES.map((c) => c.id));
  for (const a of ARTICULOS) for (const c of a.civilizaciones ?? []) afirmar(ids.has(c), `${a.slug}: civilización «${c}» no existe`);
});

await prueba("organismos citados existen en /organizaciones/[clave]", () => {
  for (const a of ARTICULOS) for (const o of a.organizaciones ?? []) afirmar(O.organizacionDe(o), `${a.slug}: organismo «${o}» no existe`);
});

await prueba("países citados existen en /mundos/[iso]", () => {
  for (const a of ARTICULOS) for (const p of a.paises ?? []) afirmar(G.POR_ISO2.get(p), `${a.slug}: país «${p}» no existe`);
});

await prueba("articulosDePais pone primero la monografía del país (do → república dominicana)", () => {
  const l = E.articulosDePais("do");
  afirmar(l[0]?.slug === "republica-dominicana", `primero: ${l[0]?.slug}`);
  afirmar(l.length >= 3, `solo ${l.length} artículos para DO`);
});

await prueba("citadoPor devuelve relaciones inversas que no están ya en relacionados", () => {
  for (const a of ARTICULOS)
    for (const b of E.citadoPor(a.slug)) {
      afirmar(b.relacionados.includes(a.slug), `${b.slug} no cita a ${a.slug}`);
      afirmar(!a.relacionados.includes(b.slug), `${b.slug} ya estaba en relacionados de ${a.slug}`);
    }
});

console.log("\nPARTE D — categorías, rutas y búsqueda");

await prueba("las diez categorías del encargo existen y ninguna está vacía", () => {
  afirmar(CATEGORIAS.length === 10, `${CATEGORIAS.length} categorías`);
  for (const c of CATEGORIAS) afirmar(E.articulosDeCategoria(c.id).length >= 1, `categoría vacía ${c.id}`);
  for (const a of ARTICULOS) afirmar(E.categoriaDe(a.categoria), `${a.slug}: categoría desconocida`);
});

await prueba("los seis continentes y la Antártida tienen artículo", () => {
  for (const s of ["africa", "america", "asia", "europa", "oceania", "antartida"]) afirmar(E.articuloDe(s)?.categoria === "continentes", `falta ${s}`);
});

await prueba("las puertas de cada categoría apuntan a rutas que existen en src/app", () => {
  for (const c of CATEGORIAS) for (const p of c.puertas) afirmar(rutaExiste(p.ruta), `${c.id}: ${p.ruta} no existe`);
});

await prueba("las páginas de la enciclopedia existen (portada, artículo, categoría, búsqueda)", () => {
  for (const r of ["/conocimiento/enciclopedia", "/conocimiento/enciclopedia/x", "/conocimiento/enciclopedia/categoria/x", "/conocimiento/enciclopedia/buscar"])
    afirmar(rutaExiste(r), `falta la página ${r}`);
});

await prueba("rutas de descubrimiento: ≥ 4 paradas existentes, con motivo", () => {
  afirmar(RUTAS.length >= 4, `${RUTAS.length} rutas`);
  for (const r of RUTAS) {
    afirmar(r.pasos.length >= 4, `${r.id}: ${r.pasos.length} paradas`);
    for (const p of r.pasos) {
      afirmar(E.articuloDe(p.slug), `${r.id}: parada inexistente ${p.slug}`);
      afirmar(p.porque.length > 20, `${r.id}: parada ${p.slug} sin motivo`);
    }
  }
});

await prueba("rutasEnciclopedia() = portada + categorías + artículos (para el sitemap)", () => {
  const r = E.rutasEnciclopedia();
  afirmar(r.length === 1 + CATEGORIAS.length + ARTICULOS.length, `tamaño ${r.length}`);
  afirmar(new Set(r).size === r.length, "rutas repetidas");
});

await prueba("búsqueda temática: encuentra por título, palabra clave y cuerpo, sin tildes", () => {
  const top = (q) => E.buscarArticulos(q)[0]?.articulo.slug;
  afirmar(top("tainos") === "pueblos-tainos", `tainos → ${top("tainos")}`);
  afirmar(top("Hammurabi") === "mesopotamia", `Hammurabi → ${top("Hammurabi")}`);
  afirmar(top("blanqueamiento") === "arrecifes-de-coral", `blanqueamiento → ${top("blanqueamiento")}`);
  afirmar(top("Köppen") === "clima-y-biomas", `Köppen → ${top("Köppen")}`);
  afirmar(E.buscarArticulos("monzón").some((r) => r.articulo.slug === "asia"), "monzón no encuentra Asia");
  afirmar(E.buscarArticulos("zzqx").length === 0, "una búsqueda absurda devolvió resultados");
  afirmar(E.buscarArticulos("").length === 0, "la búsqueda vacía devolvió resultados");
});

console.log("\nPARTE E — integración con la casa");

await prueba("buscador central (fnt:conocimiento): artículos Y expedientes en la misma fuente, sin pisarse", async () => {
  const B = await jiti.import("@/lib/nucleo/busqueda");
  const r = await B.buscarEnNucleo("tectonica", 40, "documento");
  const rutas = r.resultados.map((x) => x.ruta);
  afirmar(rutas.includes("/conocimiento/enciclopedia/tectonica-de-placas"), `sin artículo: ${rutas.join(", ")}`);
  afirmar(rutas.includes("/conocimiento/tema/tectonica"), `sin expediente: ${rutas.join(", ")}`);
  const f = r.fuentes.find((x) => x.id === "fnt:conocimiento");
  afirmar(f && !f.fallo, "la fuente fnt:conocimiento falló");
});

await prueba("las rutas de la enciclopedia están en el sitemap, el directorio y el censo del Núcleo", async () => {
  const D = await jiti.import("@/lib/planeta/directorio");
  const N = await jiti.import("@/lib/nucleo/registro");
  afirmar(D.TEMAS.some((t) => t.rutas.includes("/conocimiento/enciclopedia")), "no está en TEMAS");
  afirmar(D.destinos().some((d) => d.ruta === "/conocimiento/enciclopedia"), "no es un destino del directorio");
  afirmar(N.MODULOS_NUCLEO.some((m) => m.ruta === "/conocimiento/enciclopedia"), "no está en MODULOS_NUCLEO");
  const { readFileSync } = await import("node:fs");
  afirmar(readFileSync(join(RAIZ, "src/lib/seo/mapa.ts"), "utf8").includes("rutasEnciclopedia()"), "el sitemap no la incluye");
  afirmar(readFileSync(join(RAIZ, "src/components/conocimiento/puentes-pais.tsx"), "utf8").includes("articulosDePais"), "la ficha de país no la enlaza");
  afirmar(readFileSync(join(RAIZ, "src/components/conocimiento/explorador.tsx"), "utf8").includes("/conocimiento/enciclopedia"), "el explorador no la enlaza");
});

console.log(`\n${pasan} pasan · ${fallan} fallan\n`);
process.exit(fallan ? 1 : 0);
