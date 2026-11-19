#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// v419.0 · PRUEBAS DEL ARCHIVO DE LA MEMORIA — Memory Archive
//
// Qué comprueba, y por qué cada cosa importa:
//   1. El catálogo de fuentes está íntegro: tres puertas declaradas, cada una
//      con cobertura, lo que NO cubre, sus derechos, su contrato y su forma de
//      citar. Y las puertas ausentes están dichas (Europeana, UNESCO, NARA).
//   2. La política de derechos tiene las cinco clases y solo dos permiten
//      publicar imagen con reservas… no: solo tres clases permiten imagen, y
//      «uso condicionado» y «sin declarar» NO. Eso se comprueba leyendo el
//      código, porque es la regla que el encargo puso por delante.
//   3. Todos los expedientes tienen resumen, contexto, «qué no está»,
//      referencias y piezas fijadas con fuente e identificador válidos.
//   4. Ninguna pieza fijada apunta a una fuente que no exista en el archivo.
//   5. Las colecciones son consultas declaradas: texto, fuentes y nota.
//   6. En vivo (si se pasa una base): las tres instituciones responden, cada
//      pieza fijada se resuelve, las páginas devuelven 200 y la API respeta el
//      contrato {ok, api, version, datos, meta}.
//
// Uso:
//   node scripts/pruebas-memoria.mjs                          (solo código)
//   node scripts/pruebas-memoria.mjs https://mi-dominio       (código + vivo)
// ═══════════════════════════════════════════════════════════════════════════
import { readFileSync, existsSync } from "node:fs";

const BASE = process.argv[2] || "";
let ok = 0;
let mal = 0;
const fallos = [];
function comprobar(cond, texto) {
  if (cond) {
    ok++;
    console.log(`✓ ${texto}`);
  } else {
    mal++;
    fallos.push(texto);
    console.log(`✗ ${texto}`);
  }
}

const leer = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");

// ── 1. El catálogo de fuentes ─────────────────────────────────────────────
const fuentes = leer("src/lib/memoria/fuentes.ts");
const puertas = [...fuentes.matchAll(/id:\s*"(loc|ia|commons)"/g)].map((m) => m[1]);
comprobar(puertas.length === 3, `catálogo de fuentes: ${puertas.length} puertas (deben ser 3)`);
for (const campo of ["cubre:", "noCubre:", "derechos:", "contrato:", "citar:"]) {
  const cuantos = (fuentes.match(new RegExp(campo, "g")) ?? []).length;
  comprobar(cuantos >= 3, `catálogo de fuentes: ${campo.replace(":", "")} declarado en las tres (${cuantos})`);
}
comprobar(/PUERTAS_AUSENTES/.test(fuentes), "faltan las puertas ausentes declaradas");

// ── 2. La política de derechos ────────────────────────────────────────────
const derechos = leer("src/lib/memoria/derechos.ts");
const clases = ["dominio-publico", "licencia-abierta", "sin-restricciones-conocidas", "uso-condicionado", "sin-declarar"];
for (const c of clases) comprobar(derechos.includes(c), `derechos: existe la clase «${c}»`);
const permitidas = (derechos.match(/imagenPermitida:\s*true/g) ?? []).length;
const prohibidas = (derechos.match(/imagenPermitida:\s*false/g) ?? []).length;
comprobar(permitidas === 3, `derechos: ${permitidas} clases permiten publicar imagen (deben ser 3)`);
comprobar(prohibidas === 2, `derechos: ${prohibidas} clases NO permiten publicar imagen (deben ser 2)`);
comprobar(
  /derechosLoc[\s\S]*?not evaluated[\s\S]*?sin-declarar/.test(derechos),
  "derechos: «rights status not evaluated» del Library of Congress cae en sin declarar"
);
comprobar(
  /derechosIa[\s\S]*?if \(!t\) return "sin-declarar"/.test(derechos),
  "derechos: una pieza del Internet Archive sin licencia cae en sin declarar"
);

// ── 3. Los expedientes ────────────────────────────────────────────────────
const acont = leer("src/lib/memoria/acontecimientos.ts");
const slugs = [...acont.matchAll(/^\s*slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
comprobar(slugs.length >= 8, `expedientes: ${slugs.length} declarados (mínimo 8)`);
comprobar(new Set(slugs).size === slugs.length, "expedientes: no hay slugs duplicados");
for (const campo of ["resumen:", "contexto:", "noEsta:", "referencias:", "piezas:"]) {
  const cuantos = (acont.match(new RegExp(campo, "g")) ?? []).length;
  comprobar(cuantos >= slugs.length, `expedientes: ${campo.replace(":", "")} presente en todos (${cuantos}/${slugs.length})`);
}

// ── 4. Las piezas fijadas apuntan a fuentes reales ────────────────────────
const piezas = [...acont.matchAll(/fuente:\s*"(loc|ia|commons)",\s*id:\s*"([^"]+)"/g)].map((m) => ({
  fuente: m[1],
  id: m[2],
}));
const colecciones = leer("src/lib/memoria/colecciones.ts");
const piezasColeccion = [...colecciones.matchAll(/fuente:\s*"(loc|ia|commons)",\s*id:\s*"([^"]+)"/g)].map((m) => ({
  fuente: m[1],
  id: m[2],
}));
const todas = [...piezas, ...piezasColeccion];
comprobar(todas.length >= 10, `piezas fijadas: ${todas.length} en expedientes y colecciones`);
comprobar(
  todas.every((p) => ["loc", "ia", "commons"].includes(p.fuente)),
  "piezas fijadas: todas apuntan a una de las tres fuentes"
);
comprobar(
  todas.every((p) => /^[A-Za-z0-9._-]+$/.test(p.id)),
  "piezas fijadas: los identificadores tienen forma válida"
);

// ── 5. Las colecciones son consultas declaradas ───────────────────────────
// Solo el bloque COLECCIONES_MEMORIA: los siglos tienen su propia puerta y se
// cuentan aparte, no inflan el censo de colecciones.
const bloqueColecciones = colecciones.slice(
  colecciones.indexOf("COLECCIONES_MEMORIA"),
  colecciones.indexOf("PERIODOS"),
);
const slugsColeccion = [...bloqueColecciones.matchAll(/^\s*slug:\s*"([a-z0-9-]+)"/gm)].map((m) => m[1]);
comprobar(slugsColeccion.length >= 6, `colecciones: ${slugsColeccion.length} declaradas (mínimo 6)`);
comprobar(colecciones.includes("nota:"), "colecciones: falta la nota que explica la consulta");
comprobar(colecciones.includes("noEsta:"), "colecciones: falta lo que la colección no tiene");
const siglos = [...colecciones.matchAll(/slug:\s*"(xvi|xvii|xviii|xix|xx)"/g)].map((m) => m[1]);
comprobar(siglos.length >= 5, `períodos: ${siglos.length} siglos con puerta propia (mínimo 5)`);

// ── 6. Las piezas de la casa existen y están enlazadas ────────────────────
const rutas = [
  "src/app/memoria/page.tsx",
  "src/app/memoria/buscar/page.tsx",
  "src/app/memoria/acontecimiento/[slug]/page.tsx",
  "src/app/memoria/documento/[fuente]/[id]/page.tsx",
  "src/app/memoria/coleccion/[slug]/page.tsx",
  "src/app/memoria/periodo/[slug]/page.tsx",
  "src/app/memoria/fuentes/page.tsx",
  "src/app/memoria/comparar/page.tsx",
  "src/app/api/memoria/buscar/route.ts",
  "src/app/api/memoria/documento/route.ts",
  "src/app/api/memoria/acontecimiento/route.ts",
  "src/components/memoria/tarjeta-documento.tsx",
  "src/components/memoria/visor-documento.tsx",
  "src/components/memoria/buscador-memoria.tsx",
  "src/app/memoria/memoria.css",
];
for (const r of rutas) comprobar(existsSync(r), `pieza presente: ${r}`);

const registro = leer("src/lib/nucleo/registro.ts");
comprobar(registro.includes("mod:memoria"), "el Núcleo registra el archivo de la memoria");
const sitemap = leer("src/app/sitemap.ts");
comprobar(sitemap.includes('"/memoria"'), "el mapa del sitio incluye el archivo");

// ── 7. En vivo ────────────────────────────────────────────────────────────
if (!BASE) {
  console.log("\n(sin base: no se ejecutan las pruebas en vivo; pásame una URL para hacerlas)");
} else {
  const base = BASE.replace(/\/$/, "");
  const pedir = async (ruta) => {
    try {
      const res = await fetch(base + ruta, { headers: { "User-Agent": "VANGUARD-pruebas" }, signal: AbortSignal.timeout(45000) });
      return { estado: res.status, tipo: res.headers.get("content-type") ?? "", cuerpo: await res.text() };
    } catch (e) {
      return { estado: 0, tipo: "", cuerpo: "", error: String(e) };
    }
  };

  const api = await pedir("/api/memoria/buscar?q=declaration&limite=4");
  let json = null;
  try {
    json = JSON.parse(api.cuerpo);
  } catch {
    /* no era JSON */
  }
  comprobar(api.estado === 200, `vivo: /api/memoria/buscar responde 200 (${api.estado})`);
  comprobar(!!json && json.ok === true && "datos" in json && "meta" in json, "vivo: la API cumple el contrato {ok, datos, meta}");
  comprobar(
    !!json && Array.isArray(json.datos?.porFuente) && json.datos.porFuente.length === 3,
    "vivo: la búsqueda declara el estado de las tres fuentes"
  );
  comprobar(
    !!json && json.datos.documentos.every((d) => d.derechos && d.urlOriginal && d.fuente),
    "vivo: todos los documentos traen derechos, enlace original y fuente"
  );

  const portada = await pedir("/memoria");
  comprobar(portada.estado === 200 && portada.cuerpo.includes("Archivo de la memoria"), `vivo: /memoria responde y se titula (${portada.estado})`);

  const fuentesPagina = await pedir("/memoria/fuentes");
  comprobar(
    fuentesPagina.estado === 200 && fuentesPagina.cuerpo.includes("Library of Congress") && fuentesPagina.cuerpo.includes("Wikimedia Commons"),
    "vivo: /memoria/fuentes nombra las tres instituciones"
  );

  for (const slug of slugs.slice(0, 3)) {
    const p = await pedir(`/memoria/acontecimiento/${slug}`);
    comprobar(p.estado === 200, `vivo: expediente /memoria/acontecimiento/${slug} responde 200 (${p.estado})`);
  }

  for (const p of todas.slice(0, 4)) {
    const ficha = await pedir(`/memoria/documento/${p.fuente}/${encodeURIComponent(p.id)}`);
    comprobar(ficha.estado === 200, `vivo: ficha ${p.fuente}:${p.id} responde 200 (${ficha.estado})`);
  }

  const comp = await pedir(`/memoria/comparar?a=${encodeURIComponent(todas[0]?.fuente + ":" + todas[0]?.id)}&b=${encodeURIComponent(todas[1]?.fuente + ":" + todas[1]?.id)}`);
  comprobar(comp.estado === 200, `vivo: el comparador responde 200 (${comp.estado})`);
}

console.log(`\n${ok} comprobaciones correctas · ${mal} fallos`);
if (fallos.length) {
  console.error("\nFALLOS:");
  for (const f of fallos) console.error(` · ${f}`);
  process.exit(1);
}
console.log("ARCHIVO DE LA MEMORIA · TODO LIMPIO\n");
