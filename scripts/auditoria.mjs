#!/usr/bin/env node
// ============================================================
// v367.9 AUDITORÍA TOTAL — EL EQUIPO DE CINCO (scripts/auditoria.mjs)
//
// Orden del Dueño: «eres un grupo de 5 personas, cada uno un multiagente
// experto en programación, buscar errores y resolución de problemas al
// instante». Esta es la herramienta que hace el trabajo, sin dependencias:
//
//   AGENTE 1 · RUTAS      — ¿existe cada página y cada endpoint?
//   AGENTE 2 · ENLACES    — ¿a dónde apunta cada href y router.push del código?
//   AGENTE 3 · IDIOMA     — ¿toda clave t("…") existe en el diccionario español?
//   AGENTE 4 · RECURSOS   — ¿existe cada /assets/... que el código pide?
//   AGENTE 5 · BOTONES    — href="#", onClick vacíos, TODO/FIXME, código muerto
//
// Uso:  node scripts/auditoria.mjs [--json]
// Salida: informe legible + (con --json) agent-ctx/auditoria.json
// ============================================================

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const RAIZ = process.cwd();
const SRC = join(RAIZ, "src");
const PUBLIC = join(RAIZ, "public");

// ── utilidades ──
function* caminar(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", ".next", ".git", "dist", "build"].includes(e.name)) continue;
      yield* caminar(p);
    } else if (/\.(ts|tsx)$/.test(e.name)) {
      yield p;
    }
  }
}

const archivos = [...caminar(SRC)];
const cache = new Map();
function leer(f) {
  if (!cache.has(f)) cache.set(f, readFileSync(f, "utf8"));
  return cache.get(f);
}

// ── AGENTE 1 · RUTAS ─────────────────────────────────────────
const paginas = new Set();
const apis = new Set();
const dinamicas = [];
for (const f of archivos) {
  const rel = relative(join(SRC, "app"), f).split("\\").join("/");
  if (!/(^|\/)page\.tsx$/.test(rel)) continue;
  let ruta = "/" + rel.replace(/\/?page\.tsx$/, "");
  ruta = ruta.replace(/\/index$/, "") || "/";
  paginas.add(ruta);
  if (ruta.includes("[")) dinamicas.push(ruta);
}
for (const f of readdirSync(join(SRC, "app", "api"), { withFileTypes: true })) {
  // se llena abajo con el recorrido completo
}
for (const f of archivos) {
  const rel = relative(join(SRC, "app"), f).split("\\").join("/");
  if (!/(^|\/)route\.ts$/.test(rel)) continue;
  apis.add("/" + rel.replace(/\/route\.ts$/, ""));
}

function existeRuta(p) {
  const limpia = p.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  if (paginas.has(limpia) || apis.has(limpia)) return true;
  // ¿encaja con una ruta dinámica? /conflicto/redsea → /conflicto/[tag]
  for (const d of dinamicas) {
    const re = new RegExp("^" + d.replace(/\[[^\]]+\]/g, "[^/]+") + "$");
    if (re.test(limpia)) return true;
  }
  return false;
}

// ── manifiesto de public/ (para enlaces a archivos y para recursos) ──
let manifiestoPrevio = null;
try {
  manifiestoPrevio = JSON.parse(readFileSync(join(RAIZ, "agent-ctx", "public-manifest.json"), "utf8"));
} catch { manifiestoPrevio = null; }
const manifiestoDeEnlaces = new Set((manifiestoPrevio?.rutas ?? []).map((p) => p.replace(/^public/, "")));

// ── AGENTE 2 · ENLACES ───────────────────────────────────────
const enlacesRotos = [];
const enlacesRutaDinamicaEnServer = [];
const totalEnlaces = { n: 0 };

for (const f of archivos) {
  const txt = leer(f);
  const esCliente = /^\s*["']use client["']/m.test(txt) || /from ["']react["']/.test(txt);
  // href="/algo" y href={'/algo'} y router.push("/algo")
  const patrones = [
    /href="(\/[^"{}]*)"/g,
    /href=\{["'](\/[^"']*)["']\}/g,
    /router\.push\(["'](\/[^"']*)["']\)/g,
    /redirect\(["'](\/[^"']*)["']\)/g,
  ];
  for (const re of patrones) {
    let m;
    while ((m = re.exec(txt))) {
      const destino = m[1];
      if (!destino || destino.startsWith("//")) continue;
      totalEnlaces.n++;
      if (!existeRuta(destino) && !(manifiestoDeEnlaces?.has(destino) ?? false) && !existsSync(join(PUBLIC, destino.replace(/^\//, "")))) {
        enlacesRotos.push({
          archivo: relative(RAIZ, f),
          destino,
          linea: txt.slice(0, m.index).split("\n").length,
        });
      }
    }
  }
  // enlace literal a ruta con parámetro (rompe el App Router en servidor)
  if (!esCliente && /<Link[^>]*href="\/[^"]*\[[^\]]+\]"/.test(txt)) {
    enlacesRutaDinamicaEnServer.push(relative(RAIZ, f));
  }
}

// ── AGENTE 3 · IDIOMA ────────────────────────────────────────
const dic = new Map();
const i18nTxt = leer(join(SRC, "lib", "i18n.ts"));
const bloqueES = i18nTxt.slice(i18nTxt.indexOf("const ES: Dict"));
for (const m of bloqueES.matchAll(/"([a-zA-Z0-9_.\-]+)"\s*:/g)) dic.set(m[1], true);
for (const f of archivos.filter((x) => /src[\\/]lib[\\/]i18n[\\/]lang-/.test(x))) {
  for (const m of leer(f).matchAll(/"([a-zA-Z0-9_.\-]+)"\s*:/g)) dic.set(m[1], dic.get(m[1]) ?? false);
}
const clavesUsadas = new Map();
for (const f of archivos) {
  const txt = leer(f);
  // v367.9 — falso positivo cazado: algunos archivos declaran su PROPIO `t`
  // (p. ej. social-data.ts: `const t = (p) => \`/assets/tv/${p}.png\``). Ahí
  // t("summit") no es una clave de idioma, es una ruta de imagen. Si el archivo
  // define un t local, sus t("…") no se auditan como claves.
  const tLocal = /(?:const|let|var|function)\s+t\s*[=(]/.test(txt);
  if (tLocal) continue;
  for (const m of txt.matchAll(/\bt\(\s*["']([a-zA-Z0-9_.\-]+)["']/g)) {
    if (!clavesUsadas.has(m[1])) clavesUsadas.set(m[1], []);
    clavesUsadas.get(m[1]).push(relative(RAIZ, f));
  }
}
const clavesFaltantes = [...clavesUsadas.entries()].filter(([k]) => !dic.has(k)).map(([k, f]) => ({ clave: k, archivos: [...new Set(f)].slice(0, 3) }));

// ── AGENTE 4 · RECURSOS ──────────────────────────────────────
const recursosFaltantes = [];
const recursosVistos = new Set();

// v367.9 — LECCIÓN DE LA CASA: este clon de trabajo NO trae los binarios
// (public/ tiene 417 archivos en el repositorio real y aquí no están). Si se
// audita contra el disco, se inventan 107 «faltantes» que en realidad existen.
// Por eso manda el MANIFIESTO real (agent-ctx/public-manifest.json, generado
// del árbol de main). El disco solo se usa si no hay manifiesto.
let manifiesto = null;
try {
  manifiesto = JSON.parse(readFileSync(join(RAIZ, "agent-ctx", "public-manifest.json"), "utf8"));
} catch {
  manifiesto = null;
}
const enManifiesto = new Set((manifiesto?.rutas ?? []).map((p) => p.replace(/^public/, "")));
const existeRecurso = (ruta) => {
  if (manifiesto) return enManifiesto.has(ruta) || existsSync(join(PUBLIC, ruta.replace(/^\//, "")));
  return existsSync(join(PUBLIC, ruta.replace(/^\//, "")));
};
for (const f of archivos) {
  const txt = leer(f);
  for (const m of txt.matchAll(/["'`](\/(?:assets|images|img|fonts)\/[^"'`\s)]+)["'`]/g)) {
    const ruta = m[1];
    if (ruta.includes("${")) continue; // plantilla: se resuelve en tiempo de ejecución
    if (recursosVistos.has(ruta)) continue;
    recursosVistos.add(ruta);
    if (ruta.endsWith("/")) continue; // es un prefijo de carpeta, no un archivo
    if (!existeRecurso(ruta)) recursosFaltantes.push({ archivo: relative(RAIZ, f), ruta });
  }
}

// ── AGENTE 5 · BOTONES Y CÓDIGO SOSPECHOSO ───────────────────
// Los candidatos ya leídos a mano se aceptan aquí: así el informe solo enseña
// lo NUEVO. La palabra española «todo» en mayúsculas dentro de un comentario no
// es un pendiente, y esta casa la usa a diario.
let aceptados = [];
try {
  aceptados = JSON.parse(readFileSync(join(RAIZ, "agent-ctx", "auditoria-aceptados.json"), "utf8")).aceptados ?? [];
} catch { aceptados = []; }
// se acepta por archivo + TEXTO (las líneas se mueven al versionar) o por línea exacta
const esAceptado = (archivo, linea, texto) =>
  aceptados.some(
    (a) =>
      a.archivo === archivo &&
      ((a.contiene && texto.includes(a.contiene)) || (typeof a.linea === "number" && a.linea === linea)),
  );
const botonesVacios = [];
const hrefAlmohadilla = [];
const pendientes = [];
for (const f of archivos) {
  const txt = leer(f);
  const rel = relative(RAIZ, f);
  const lineas = txt.split("\n");
  lineas.forEach((l, i) => {
    if (/onClick=\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/.test(l) || /onClick=\{undefined\}/.test(l)) {
      botonesVacios.push({ archivo: rel, linea: i + 1 });
    }
    if (/href="#"/.test(l)) hrefAlmohadilla.push({ archivo: rel, linea: i + 1 });
    // v367.9 — SEGUNDO Y TERCER FALSO POSITIVO CAZADOS: la casa escribe en
    // español «TODO derivado del catálogo», «COBRAR TODO», «el mapa de TODO: un
    // globo»… Nada de eso es un pendiente. Solo cuenta el marcador de verdad:
    // el que ABRE el comentario (// TODO… / * FIXME… / /* HACK…).
    if (/^\s*(\/\/|\*|\/\*)\s*(TODO|FIXME|XXX|HACK)\b/.test(l)) {
      if (!esAceptado(rel, i + 1, l)) pendientes.push({ archivo: rel, linea: i + 1, texto: l.trim().slice(0, 110) });
    }
  });
}

// ── AGENTE 6 · SALUD EN VIVO (opcional: --smoke https://…) ────
// Pide cada ruta de verdad contra un servidor y anota el código HTTP. Es la
// única prueba de que una sección «funciona» y no solo de que su archivo existe.
let humo = null;
const iSmoke = process.argv.indexOf("--smoke");
if (iSmoke > -1 && process.argv[iSmoke + 1]) {
  const base = process.argv[iSmoke + 1].replace(/\/$/, "");
  const rutas = [...paginas].filter((r) => !r.includes("[")).sort();
  humo = { base, fecha: new Date().toISOString().slice(0, 19), total: rutas.length, ok: 0, fallos: [] };
  const cola = [...rutas];
  const trabajador = async () => {
    while (cola.length) {
      const r = cola.shift();
      try {
        const res = await fetch(base + r, { redirect: "manual" });
        if (res.status >= 200 && res.status < 400) humo.ok++;
        else humo.fallos.push({ ruta: r, codigo: res.status });
      } catch (e) {
        humo.fallos.push({ ruta: r, codigo: 0, error: String(e).slice(0, 80) });
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, trabajador));
}

// ── INFORME ──────────────────────────────────────────────────
const informe = {
  fecha: new Date().toISOString().slice(0, 10),
  agentes: {
    rutas: { paginas: paginas.size, apis: apis.size, dinamicas: dinamicas.length },
    enlaces: { revisados: totalEnlaces.n, rotos: enlacesRotos.length, aRutaDinamicaEnServer: enlacesRutaDinamicaEnServer.length },
    idioma: { clavesDiccionario: dic.size, clavesUsadas: clavesUsadas.size, faltantes: clavesFaltantes.length },
    recursos: {
      revisados: recursosVistos.size,
      faltantes: recursosFaltantes.length,
      contra: manifiesto ? `manifiesto real de main (${manifiesto.rutas.length} archivos en public/, ref ${manifiesto.ref.slice(0, 8)})` : "solo el disco de este clon (SPARSE: puede dar falsos faltantes)",
    },
    botones: { sinAccion: botonesVacios.length, hrefAlmohadilla: hrefAlmohadilla.length, pendientes: pendientes.length },
  },
  humo,
  detalle: { enlacesRotos, enlacesRutaDinamicaEnServer, clavesFaltantes, recursosFaltantes, botonesVacios, hrefAlmohadilla, pendientes },
};

if (process.argv.includes("--json")) {
  mkdirSync(join(RAIZ, "agent-ctx"), { recursive: true });
  writeFileSync(join(RAIZ, "agent-ctx", "auditoria.json"), JSON.stringify(informe, null, 2));
  // la misma instantánea, recortada, es la que enseña la sala /calidad
  const publica = {
    fecha: informe.fecha,
    humo: informe.humo,
    agentes: informe.agentes,
    defectos: {
      enlacesRotos: informe.detalle.enlacesRotos,
      recursosFaltantes: informe.detalle.recursosFaltantes,
      botonesVacios: informe.detalle.botonesVacios,
      clavesFaltantes: informe.detalle.clavesFaltantes,
      pendientes: informe.detalle.pendientes.slice(0, 20).map((p) => ({ archivo: p.archivo, linea: p.linea })),
    },
  };
  writeFileSync(join(RAIZ, "src", "lib", "auditoria.json"), JSON.stringify(publica, null, 2));
}

const A = informe.agentes;
console.log(`\n═══ AUDITORÍA VANGUARD · ${informe.fecha} ═══\n`);
console.log(`AGENTE 1 · RUTAS      ${A.rutas.paginas} páginas · ${A.rutas.apis} endpoints · ${A.rutas.dinamicas} dinámicas`);
console.log(`AGENTE 2 · ENLACES    ${A.enlaces.n = A.enlaces.revisados} revisados → ${A.enlaces.rotos} ROTOS · ${A.enlaces.aRutaDinamicaEnServer} sospechosos en servidor`);
console.log(`AGENTE 3 · IDIOMA     ${A.idioma.clavesUsadas} claves usadas contra ${A.idioma.clavesDiccionario} del diccionario → ${A.idioma.faltantes} FALTAN`);
console.log(`AGENTE 4 · RECURSOS   ${A.recursos.revisados} pedidos → ${A.recursos.faltantes} FALTAN   [contra: ${A.recursos.contra}]`);
console.log(`AGENTE 5 · BOTONES    ${A.botones.sinAccion} sin acción · ${A.botones.hrefAlmohadilla} href="#" · ${A.botones.pendientes} TODO/FIXME`);
if (humo) {
  console.log(`AGENTE 6 · EN VIVO    ${humo.ok}/${humo.total} rutas responden contra ${humo.base}${humo.fallos.length ? ` → ${humo.fallos.length} FALLAN` : " → todas sanas"}`);
  for (const f of humo.fallos) console.log(`  ${f.codigo} ${f.ruta}`);
}
console.log("");
if (enlacesRotos.length) {
  console.log("── ENLACES ROTOS ──");
  for (const e of enlacesRotos.slice(0, 40)) console.log(`  ${e.archivo}:${e.linea} → ${e.destino}`);
  if (enlacesRotos.length > 40) console.log(`  … y ${enlacesRotos.length - 40} más`);
}
if (enlacesRutaDinamicaEnServer.length) {
  console.log("── LINK A RUTA CON PARÁMETRO DESDE SERVIDOR (rompe el App Router) ──");
  for (const f of enlacesRutaDinamicaEnServer) console.log(`  ${f}`);
}
if (clavesFaltantes.length) {
  console.log("── CLAVES DE IDIOMA QUE FALTAN ──");
  for (const c of clavesFaltantes.slice(0, 30)) console.log(`  ${c.clave}   (${c.archivos.join(", ")})`);
}
if (recursosFaltantes.length) {
  console.log("── RECURSOS QUE NO EXISTEN ──");
  for (const r of recursosFaltantes.slice(0, 30)) console.log(`  ${r.ruta}   (${r.archivo})`);
}
console.log("");
