#!/usr/bin/env node
// v420.0 VANGUARD LINGUA — pruebas de contrato.
//   node scripts/pruebas-lingua.mjs                 # solo árbol
//   node scripts/pruebas-lingua.mjs https://dominio  # árbol + vivo
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.argv[2] || "").replace(/\/$/, "");
const leer = (p) => readFileSync(join(RAIZ, p), "utf8");
const json = (p) => JSON.parse(leer(p));
let pasan = 0;
let fallan = 0;
function afirmar(c, msg) {
  if (!c) throw new Error(msg);
}
async function prueba(nombre, fn) {
  try {
    await fn();
    pasan++;
    console.log("  ✓", nombre);
  } catch (e) {
    fallan++;
    console.log("  ✗", nombre, "—", e.message);
  }
}

const PAGINAS = ["", "idiomas", "idioma/[id]", "familias", "familias/[id]", "mapa", "regiones", "regiones/[iso]", "peligro", "escrituras", "escrituras/[codigo]", "escrituras/comparar", "alfabetos", "diccionario", "comparador", "expresiones", "expresiones/[id]", "pronunciacion", "traductor", "conceptos"];

console.log("LINGUA · árbol");
await prueba("las 20 páginas y las 3 API existen", () => {
  for (const p of PAGINAS) afirmar(existsSync(join(RAIZ, "src/app/lingua", p, "page.tsx")), `falta /lingua/${p}`);
  for (const a of ["arbol", "buscar", "traducir"]) afirmar(existsSync(join(RAIZ, "src/app/api/lingua", a, "route.ts")), `falta /api/lingua/${a}`);
});
await prueba("datos de Glottolog: 8.243 lenguas, dialectos y nodos con forma esperada", () => {
  const L = json("src/lib/lingua/datos/lenguas.json");
  afirmar(L.filas.length === 8243, `lenguas: ${L.filas.length}`);
  const es = L.filas.find((f) => f[0] === "stan1288");
  afirmar(es && es[2] === "spa" && es[7] === "indo1319", "español mal formado");
  const D = json("src/lib/lingua/datos/dialectos.json");
  afirmar((D.filas ?? D).length > 10000, "pocos dialectos");
});
await prueba("ninguna lengua es a la vez dialecto (lengua ≠ dialecto)", () => {
  const L = new Set(json("src/lib/lingua/datos/lenguas.json").filas.map((f) => f[0]));
  const D = json("src/lib/lingua/datos/dialectos.json");
  for (const d of D.filas ?? D) afirmar(!L.has(d[0]), `${d[0]} figura como lengua y dialecto`);
});
await prueba("cada traducción del diccionario y de las expresiones cita su fuente", () => {
  const P = json("src/lib/lingua/datos/palabras.json");
  afirmar(P.fuente && P.conceptos.length >= 30, "diccionario sin fuente general");
  for (const x of P.conceptos) afirmar(x.fuente, `palabra sin fuente: ${x.id}`);
  for (const x of json("src/lib/lingua/datos/expresiones.json").expresiones) afirmar(x.fuente, `expresión sin fuente: ${x.id}`);
});
await prueba("puntos del mapa público: ligeros y válidos", () => {
  const P = json("public/idiomas/puntos.json");
  afirmar(P.p.length > 8000, "pocos puntos");
  for (const p of P.p) afirmar(Math.abs(p[2]) <= 90 && Math.abs(p[3]) <= 180, `coordenada imposible en ${p[0]}`);
  afirmar(readFileSync(join(RAIZ, "public/idiomas/puntos.json")).length < 600_000, "puntos.json demasiado grande");
});
await prueba("los módulos de servidor no se importan desde componentes de cliente", () => {
  for (const f of ["arbol.tsx", "mapa-mundial.tsx", "traductor.tsx"]) {
    const s = leer(`src/components/lingua/${f}`);
    afirmar(s.startsWith('"use client"'), `${f} no es de cliente`);
    afirmar(!/^import (?!type)[^;]*from "@\/lib\/lingua\/(servidor|arbol|escrituras|wiki)"/m.test(s), `${f} importa código de servidor`);
  }
});
await prueba("pronunciación sin síntesis: solo audio de Commons", () => {
  const s = leer("src/lib/lingua/wiki.ts") + leer("src/app/lingua/pronunciacion/page.tsx");
  afirmar(!/speechSynthesis|text-to-speech|\btts\b/i.test(s), "hay síntesis de voz");
  afirmar(s.includes("upload.wikimedia.org") || s.includes("commons"), "sin Commons");
});
await prueba("el traductor verifica el idioma de salida y nunca inventa", () => {
  const w = leer("src/lib/lingua/wiki.ts");
  afirmar(w.includes("motivoIdiomaIncorrecto"), "sin verificación de idioma");
  const r = leer("src/app/api/lingua/traducir/route.ts");
  afirmar(r.includes('fallo("PROVEEDOR"'), "sin error honesto");
  const t = leer("src/lib/lingua/traduccion.ts");
  for (const c of ['"qu"', '"gn"', '"nah"']) afirmar(!t.includes(`code: ${c}`), `par no fiable ${c} ofrecido`);
});
await prueba("integración: buscador, registro, directorio, espacios, sitemap, llms.txt, países y enciclopedia", () => {
  afirmar(leer("src/lib/nucleo/fuentes.ts").includes('"fnt:lingua"'), "fuente");
  afirmar(leer("src/lib/nucleo/busqueda.ts").includes('fuentePublica("fnt:lingua")'), "proveedor");
  afirmar(leer("src/lib/nucleo/registro.ts").includes('"mod:lingua"'), "registro");
  afirmar(leer("src/lib/planeta/directorio.ts").includes('id: "lenguas"'), "directorio");
  afirmar(leer("src/lib/navegacion/espacios.ts").includes('href: "/lingua"'), "espacios");
  afirmar(leer("src/components/portada/modulos.ts").includes('href: "/lingua"'), "portada");
  afirmar(leer("src/lib/seo/mapa.ts").includes("rutasLingua"), "sitemap");
  afirmar(leer("src/app/llms.txt/route.ts").includes("## Lingua"), "llms.txt");
  afirmar(leer("src/app/mundos/[iso]/page.tsx").includes("<LenguasDelPais"), "ficha de país");
  afirmar(leer("src/lib/enciclopedia/articulos/historia.ts").includes('ruta: "/lingua'), "enciclopedia");
  const censo = json("src/lib/arquitectura/censo.json");
  afirmar(censo.rutas.some((r) => r.ruta === "/lingua"), "censo");
});

if (BASE) {
  console.log(`LINGUA · vivo (${BASE})`);
  const get = async (r, init) => {
    const res = await fetch(BASE + r, { ...init, signal: AbortSignal.timeout(30000) });
    return { status: res.status, texto: await res.text(), tipo: res.headers.get("content-type") || "" };
  };
  const RUTAS = ["/lingua", "/lingua/idiomas?q=quechua", "/lingua/idioma/stan1288", "/lingua/idioma/tain1254", "/lingua/familias", "/lingua/familias/indo1319", "/lingua/familias/araw1281?n=tain1254", "/lingua/mapa", "/lingua/regiones", "/lingua/regiones/do", "/lingua/peligro", "/lingua/escrituras", "/lingua/escrituras/Latn", "/lingua/escrituras/comparar?a=Latn&b=Cyrl", "/lingua/alfabetos?l=ja", "/lingua/diccionario?p=agua", "/lingua/comparador", "/lingua/expresiones", "/lingua/expresiones/hola", "/lingua/pronunciacion?p=bonjour", "/lingua/traductor", "/lingua/conceptos"];
  for (const r of RUTAS) {
    await prueba(`200 ${r}`, async () => {
      const x = await get(r);
      afirmar(x.status === 200, `HTTP ${x.status}`);
      afirmar(x.texto.includes("vx-li-nav"), "sin la navegación de Lingua");
    });
  }
  await prueba("la ficha de país lleva el bloque Lenguas", async () => {
    const x = await get("/mundos/do");
    afirmar(x.status === 200 && x.texto.includes('id="lenguas"') && x.texto.includes("/lingua/regiones/do"), "sin bloque");
  });
  await prueba("API árbol responde con el contrato", async () => {
    const x = JSON.parse((await get("/api/lingua/arbol?id=indo1319")).texto);
    afirmar(x.ok && x.datos.hijos.length > 0 && x.datos.detalle.nLenguas > 500, "árbol vacío");
    const e = await get("/api/lingua/arbol?id=xx");
    afirmar(e.status === 400, `id inválido devolvió ${e.status}`);
  });
  await prueba("API buscar distingue lengua, familia y dialecto", async () => {
    const x = JSON.parse((await get("/api/lingua/buscar?q=guarani")).texto);
    afirmar(x.ok && x.datos.resultados.some((r) => r.id === "para1311"), "no encuentra el guaraní");
  });
  await prueba("API traducir: valida y responde con proveedor o error honesto", async () => {
    const v = await get("/api/lingua/traducir", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ texto: "hola", de: "es", a: "qu" }) });
    afirmar(v.status === 400, `par no ofrecido devolvió ${v.status}`);
    const t = await get("/api/lingua/traducir", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ texto: "El agua del río está fría.", de: "es", a: "fr" }) });
    const j = JSON.parse(t.texto);
    afirmar((j.ok && j.datos.proveedor === "MyMemory" && j.datos.texto) || (!j.ok && j.error.codigo === "PROVEEDOR"), "respuesta fuera de contrato");
  });
  await prueba("buscador central devuelve resultados de Lingua", async () => {
    const j = JSON.parse((await get("/api/nucleo/busqueda?q=euskera")).texto);
    const lista = j.datos?.resultados ?? j.resultados ?? [];
    afirmar(lista.some((r) => r.origen === "fnt:lingua"), "sin resultados fnt:lingua");
  });
  await prueba("sitemap y llms.txt incluyen Lingua", async () => {
    afirmar((await get("/sitemap.xml")).texto.includes("/lingua/familias/indo1319"), "sitemap");
    afirmar((await get("/llms.txt")).texto.includes("## Lingua"), "llms.txt");
  });
  await prueba("puntos del mapa servidos como estáticos", async () => {
    const x = await get("/idiomas/puntos.json");
    afirmar(x.status === 200 && JSON.parse(x.texto).p.length > 8000, "puntos");
  });
}

console.log(`\n${pasan} pasan · ${fallan} fallan`);
process.exit(fallan ? 1 : 0);
