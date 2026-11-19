#!/usr/bin/env node
// ============================================================
// v421.9 SCIENCE FRONTIER — la guarda del centro científico.
//
// Comprueba que el índice no miente y que la casa lo tiene conectado:
//   ① integridad de los datos (ids, fechas, enlaces, huellas, citas);
//   ② la frontera editorial: una hipótesis jamás viaja como hallazgo,
//      una prepublicación nunca se declara arbitrada y una divulgación
//      nunca se cuenta como evidencia;
//   ③ que cada ruta publicada existe de verdad en src/app;
//   ④ que el centro está enganchado a núcleo, portada, búsqueda,
//      sitemap, llms.txt y el catálogo de la API.
//
// Uso:  node tools/ciencia/comprobar.mjs
// Sale con código 1 si algo falla (la casa no publica un centro roto).
// ============================================================

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LIB = join(RAIZ, "src", "lib", "ciencia");
const leer = (f) => JSON.parse(readFileSync(join(LIB, f), "utf8"));
const fuente = (f) => readFileSync(join(RAIZ, f), "utf8");

let pasadas = 0;
const fallos = [];
function afirmar(cond, mensaje) {
  if (cond) pasadas += 1;
  else fallos.push(mensaje);
}
function grupo(nombre) {
  console.log(`\n▸ ${nombre}`);
}

const publicaciones = leer("publicaciones.json");
const ideas = leer("ideas.json");
const catalogo = leer("catalogo.json");
const cronologia = leer("cronologia.json");

const TIPOS = new Set(["articulo", "preprint", "revision", "divulgacion"]);
const NIVELES = new Set(["medicion", "experimento", "observacional", "inferencia", "hipotesis", "sintesis", "demostracion", "registro"]);
const porId = new Map(publicaciones.map((p) => [p.id, p]));
const noDivulgacion = publicaciones.filter((p) => p.tipo !== "divulgacion");
const ideaIds = new Set(ideas.map((i) => i.id));
const disciplinas = new Set(catalogo.disciplinas.map((d) => d.id));

// ── ① integridad ──────────────────────────────────────────
grupo("integridad del índice");
afirmar(publicaciones.length === 45, `se esperaban 45 registros, hay ${publicaciones.length}`);
afirmar(noDivulgacion.length === 42, `se esperaban 42 publicaciones, hay ${noDivulgacion.length}`);
afirmar(new Set(publicaciones.map((p) => p.id)).size === publicaciones.length, "hay ids de publicación duplicados");
afirmar(new Set(ideas.map((i) => i.id)).size === ideas.length, "hay ids de idea duplicados");
afirmar(ideas.length >= 8, `el explorador necesita al menos 8 ideas, hay ${ideas.length}`);
afirmar(catalogo.disciplinas.length === 6, `se esperaban 6 disciplinas, hay ${catalogo.disciplinas.length}`);

for (const p of publicaciones) {
  afirmar(TIPOS.has(p.tipo), `${p.id}: tipo editorial desconocido ${p.tipo}`);
  afirmar(NIVELES.has(p.nivel), `${p.id}: nivel de evidencia desconocido ${p.nivel}`);
  afirmar(/^\d{4}(-\d{2})?(-\d{2})?$/.test(p.fecha), `${p.id}: fecha ilegible ${p.fecha}`);
  afirmar(Number(p.fecha.slice(0, 4)) === p.anio, `${p.id}: el año no coincide con la fecha`);
  afirmar(disciplinas.has(p.disciplinaId), `${p.id}: disciplina inexistente ${p.disciplinaId}`);
  afirmar(ideaIds.has(p.ideaId), `${p.id}: idea inexistente ${p.ideaId}`);
  afirmar(typeof p.titulo === "string" && p.titulo.length > 12, `${p.id}: título demasiado corto`);
  afirmar(typeof p.tituloOriginal === "string" && p.tituloOriginal.length > 6, `${p.id}: falta el título original`);
  afirmar(typeof p.original === "string" && p.original.startsWith("https://"), `${p.id}: el enlace original no es https`);
  afirmar(typeof p.lectura === "string" && p.lectura.length >= 80, `${p.id}: la lectura editorial es demasiado corta`);
  afirmar(typeof p.cautela === "string" && p.cautela.length >= 35, `${p.id}: falta el límite declarado`);
  afirmar(p.tipo === "divulgacion" || typeof p.sha256 === "string" && p.sha256.length === 64, `${p.id}: falta la huella de la captura`);
  afirmar(Array.isArray(p.autores) && p.totalAutores >= p.autores.length, `${p.id}: autores incoherentes con el total`);
  afirmar(p.tipo === "divulgacion" || p.identificador.length > 4, `${p.id}: falta el identificador`);
  for (const r of p.referencias) afirmar(porId.has(r), `${p.id}: cita un registro inexistente ${r}`);
}

// ── ② frontera editorial ──────────────────────────────────
grupo("frontera editorial (tipo ≠ evidencia)");
const HIPOTESIS_PROHIBIDO = /\b(descubri[oó]|demostr[oó]|prob[oó] que|es un hecho|queda demostrado)\b/i;
for (const p of publicaciones) {
  if (p.tipo === "preprint") {
    afirmar(p.arbitraje === "repositorio", `${p.id}: una prepublicación no puede declararse arbitrada`);
    afirmar(/arxiv/i.test(p.medio), `${p.id}: prepublicación fuera de arXiv sin declararlo`);
    afirmar(
      p.nivel !== "registro" || /versi[oó]n|manuscrito|dep[oó]sito|v1/i.test(p.cautela),
      `${p.id}: una prepublicación no es un registro institucional (salvo versión declarada)`
    );
  }
  if (p.tipo === "divulgacion") {
    afirmar(p.arbitraje === "no-aplica", `${p.id}: una divulgación no tiene arbitraje`);
    afirmar(p.nivel === "registro", `${p.id}: una divulgación no puede ser nivel ${p.nivel}`);
    afirmar(
      /divulgaci|comunicado|nota|referencia institucional/i.test(`${p.lectura} ${p.cautela}`),
      `${p.id}: no declara que es divulgación`
    );
  }
  if (p.tipo === "revision") afirmar(p.nivel === "sintesis", `${p.id}: una revisión debe clasificarse como síntesis`);
  if (p.nivel === "hipotesis") {
    afirmar(!HIPOTESIS_PROHIBIDO.test(p.lectura), `${p.id}: presenta una hipótesis como hallazgo demostrado`);
    afirmar(
      /hip[oó]tesis|modelo|interpretaci[oó]n|propon|propues|propone/i.test(`${p.lectura} ${p.cautela} ${p.nivelEtiqueta}`),
      `${p.id}: hipótesis sin declararlo en el texto`
    );
  }
  afirmar(!/peer[- ]reviewed|revisado por pares/i.test(`${p.lectura} ${p.cautela}`) || p.arbitraje === "revista", `${p.id}: afirma arbitraje que el registro no declara`);
}
const hipotesis = publicaciones.filter((p) => p.nivel === "hipotesis");
afirmar(hipotesis.length >= 3, `el índice debe mostrar hipótesis explícitas (hay ${hipotesis.length})`);

// ── ideas y relaciones ────────────────────────────────────
grupo("ideas, pasos y citas");
const asignadas = [];
for (const i of ideas) {
  afirmar(i.publicaciones.length >= 2, `${i.id}: una idea necesita al menos dos publicaciones`);
  afirmar(["demostrado", "parcial", "abierto"].includes(i.estado), `${i.id}: estado desconocido`);
  afirmar(i.sintesis.length >= 120, `${i.id}: síntesis demasiado corta`);
  afirmar(i.estadoDetalle.length >= 80, `${i.id}: falta el detalle del estado`);
  afirmar(i.abiertas.length >= 2, `${i.id}: debe declarar al menos dos preguntas abiertas`);
  afirmar(i.desde <= i.hasta, `${i.id}: rango de años invertido`);
  const fechas = i.publicaciones.map((id) => {
    afirmar(porId.has(id), `${i.id}: paso inexistente ${id}`);
    asignadas.push(id);
    return porId.get(id)?.fecha ?? "";
  });
  afirmar([...fechas].sort().join() === fechas.join(), `${i.id}: los pasos no están en orden cronológico`);
  for (const id of i.publicaciones) {
    afirmar(typeof i.pasos[id] === "string" && i.pasos[id].length >= 40, `${i.id}/${id}: falta la explicación del paso`);
  }
  afirmar(Number(fechas[0]?.slice(0, 4)) === i.desde && Number(fechas[fechas.length - 1]?.slice(0, 4)) === i.hasta, `${i.id}: el rango no coincide con los pasos`);
}
afirmar(new Set(asignadas).size === asignadas.length, "hay publicaciones en dos ideas a la vez");
afirmar(asignadas.length === noDivulgacion.length, `hay publicaciones sin idea (${noDivulgacion.length - asignadas.length})`);

for (const p of publicaciones) {
  for (const c of p.citadaPor) {
    afirmar(porId.get(c)?.referencias.includes(p.id), `${p.id}: citadaPor incoherente con ${c}`);
  }
  for (const r of p.referencias) {
    afirmar(porId.get(r)?.citadaPor.includes(p.id), `${p.id}: referencia incoherente con ${r}`);
  }
}
const citasInternas = publicaciones.reduce((n, p) => n + p.referencias.length, 0);
afirmar(citasInternas >= 10, `se esperaban al menos 10 citas verificadas entre registros, hay ${citasInternas}`);

// ── catálogos ─────────────────────────────────────────────
grupo("catálogos (instituciones, premios, experimentos, tecnología)");
afirmar(catalogo.instituciones.length >= 8, `catálogo de instituciones insuficiente (${catalogo.instituciones.length})`);
for (const i of catalogo.instituciones) {
  afirmar(i.sitio.startsWith("https://"), `${i.id}: sitio no seguro`);
  afirmar(i.http === 200, `${i.id}: el sitio no respondió 200 en la captura`);
  afirmar(i.papel.length > 40, `${i.id}: falta el papel institucional`);
  for (const v of i.vinculos) {
    afirmar(porId.has(v.publicacion), `${i.id}: vínculo a publicación inexistente ${v.publicacion}`);
    afirmar(v.base.length > 15, `${i.id}: el vínculo no declara su base documental`);
  }
}
afirmar(catalogo.institucionesSinVerificar.length >= 3, "debe declarar los vínculos que no pudo verificar");
for (const pr of catalogo.premios) {
  afirmar(pr.motivacion.length > 40, `${pr.id}: falta la motivación literal`);
  afirmar(pr.url.startsWith("https://www.nobelprize.org/"), `${pr.id}: el premio no enlaza a su registro oficial`);
  afirmar(pr.laureados.length >= 1, `${pr.id}: sin laureados`);
  afirmar(ideaIds.has(pr.idea), `${pr.id}: idea inexistente`);
  for (const id of pr.publicaciones) afirmar(porId.has(id), `${pr.id}: publicación inexistente ${id}`);
}
afirmar(catalogo.premios.length >= 5, "el catálogo de premios es demasiado corto");
for (const e of catalogo.experimentos) {
  afirmar(e.queNoDemuestra.length > 30, `${e.id}: un experimento debe declarar qué no demuestra`);
  afirmar(e.fuente.startsWith("https://"), `${e.id}: fuente no segura`);
  for (const id of e.publicaciones) afirmar(porId.has(id), `${e.id}: publicación inexistente ${id}`);
}
for (const t of catalogo.tecnologias) {
  afirmar(t.limite.length > 25, `${t.id}: falta el límite tecnológico`);
  afirmar(["en uso", "en desarrollo", "promesa"].includes(t.madurez), `${t.id}: madurez no declarada (${t.madurez})`);
  for (const id of t.publicaciones) afirmar(porId.has(id), `${t.id}: publicación inexistente ${id}`);
}
for (const es of catalogo.estanterias) {
  afirmar(es.publicaciones.length >= 4, `${es.id}: una estantería necesita al menos cuatro lecturas`);
  for (const id of es.publicaciones) afirmar(porId.has(id), `${es.id}: publicación inexistente ${id}`);
}
for (const d of catalogo.divulgacion) {
  afirmar(porId.has(d.id) || porId.has(d.publicacion ?? ""), `${d.id}: divulgación sin ancla`);
}

// ── cronología ────────────────────────────────────────────
grupo("cronología");
afirmar(cronologia.length === publicaciones.length + catalogo.premios.length + 2, `la cronología no cuadra: ${cronologia.length}`);
const ordenada = [...cronologia].sort((a, b) => a.fecha.localeCompare(b.fecha));
afirmar(ordenada.every((c, i) => c.fecha === cronologia[i].fecha), "la cronología no está ordenada por fecha");
for (const c of cronologia) {
  afirmar(c.fecha.startsWith(String(c.fecha.slice(0, 4))), `${c.id}: fecha inválida`);
  if (c.tipo === "premio") afirmar(porId.size > 0 && catalogo.premios.some((p) => p.id === c.id), `${c.id}: premio desconocido en la cronología`);
}

// ── ③ rutas reales ────────────────────────────────────────
grupo("rutas publicadas");
const ESTATICAS = ["", "/buscar", "/explorador", "/cronologia", "/instituciones", "/premios", "/experimentos", "/tecnologia", "/biblioteca", "/metodo"];
for (const r of ESTATICAS) {
  afirmar(existsSync(join(RAIZ, "src/app/ciencia", r, "page.tsx")), `falta la página /ciencia${r}`);
}
for (const d of ["publicacion/[id]", "idea/[id]", "disciplina/[id]"]) {
  afirmar(existsSync(join(RAIZ, "src/app/ciencia", d, "page.tsx")), `falta la página dinámica /ciencia/${d}`);
}
afirmar(existsSync(join(RAIZ, "src/app/api/ciencia/route.ts")), "falta /api/ciencia");
afirmar(existsSync(join(RAIZ, "src/components/ciencia/ciencia.css")), "falta la hoja del centro");
for (const i of ideas) afirmar(porId.has(i.publicaciones[0]), `${i.id}: primer paso inexistente`);

// ── ④ integración nativa ──────────────────────────────────
grupo("integración con la casa");
const registro = fuente("src/lib/nucleo/registro.ts");
afirmar(registro.includes('id:"mod:science-frontier"'), "el núcleo no registra el módulo Science Frontier");
afirmar(registro.includes('ruta:"/ciencia"'), "el módulo no declara su ruta real");
afirmar(registro.includes('id:"mod:science-explorador"'), "el núcleo no registra el explorador");
afirmar(registro.includes('id:"mod:science-biblioteca"'), "el núcleo no registra la biblioteca");
afirmar(fuente("src/lib/nucleo/fuentes.ts").includes('id: "fnt:ciencia"'), "la fuente fnt:ciencia no está declarada");
const busqueda = fuente("src/lib/nucleo/busqueda.ts");
afirmar(busqueda.includes('fuentePublica("fnt:ciencia")'), "la búsqueda global no consulta el índice científico");
afirmar(busqueda.includes('"fnt:ciencia", // v421.9'), "el orden canónico de la búsqueda no incluye la ciencia");
afirmar(fuente("src/components/portada/modulos.ts").includes('id: "ciencia"'), "la portada no tiene el módulo de ciencia");
afirmar(fuente("src/lib/navegacion/espacios.ts").includes('href: "/ciencia"'), "los espacios de trabajo no ofrecen Science Frontier");
const mapaSitio = fuente("src/lib/seo/mapa.ts") + fuente("src/lib/seo/secciones.ts");
afirmar(mapaSitio.includes("rutasCiencia()") && mapaSitio.includes('"/ciencia"'), "el sitemap no publica las rutas del centro");
afirmar(fuente("src/app/llms.txt/route.ts").includes("Science Frontier"), "llms.txt no describe el centro");
afirmar(fuente("src/lib/api/catalogo.ts").includes('ruta:"/api/ciencia"'), "el catálogo de la API no documenta /api/ciencia");
const api = fuente("src/app/api/ciencia/route.ts");
afirmar(api.includes("export function GET"), "/api/ciencia no exporta GET");
afirmar(api.includes("no-store") || api.includes("fallo") || api.includes("ok("), "/api/ciencia no usa el contrato de la casa");
afirmar(fuente("src/lib/arquitectura/departamentos.ts").includes('id: "ciencia"') && fuente("src/lib/arquitectura/departamentos.ts").includes("/ciencia/explorador"), "el departamento de ciencia no está actualizado");
afirmar(fuente("src/app/ciencia/page.tsx").includes("MarcoCiencia"), "la portada no usa la carcasa del centro");

// ── resumen ───────────────────────────────────────────────
console.log("");
if (fallos.length === 0) {
  console.log(`✔ ${pasadas} comprobaciones · Science Frontier en pie`);
  process.exit(0);
}
console.error(`✖ ${fallos.length} fallos de ${pasadas + fallos.length} comprobaciones:`);
for (const f of fallos) console.error(`  · ${f}`);
process.exit(1);
