#!/usr/bin/env node
// ============================================================
// v407.0 · PRUEBAS DE LA PLATAFORMA — el sistema central se vigila solo
//
//   node scripts/pruebas-plataforma.mjs [https://tu-dominio]
//
// PARTE A — OFFLINE (lee el código, no necesita servidor):
//   · el contrato de respuesta existe y sus códigos de error son cerrados
//   · el catálogo de endpoints cuadra con src/app/api (ni una ruta fantasma,
//     ni un endpoint nuevo sin inventariar)
//   · el catálogo de datos declara procedencia, límites y rutas REALES
//   · los puntos de extensión son seis y el descriptor inválido se rechaza
//   · la consulta y el nexo son deterministas (sin BD, sin red, sin reloj)
//   · la IA no llama a ningún modelo y no lee valores de credenciales
// PARTE B — VIVO (contra el servidor que le pases):
//   /api/sistema/{endpoints,diagnostico,novedades,datos,ia,extensiones,actividad},
//   /api/consulta, /sistema y /datos responden con el contrato.
//
// No necesita dependencias: solo `node:fs` y `fetch`.
// Sale con código 1 si algo falla.
// ============================================================
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = process.cwd();
const BASE = (process.argv[2] || "").replace(/\/$/, "");
let pasan = 0;
let fallan = 0;
const fallos = [];

async function verificar(nombre, fn) {
  try {
    await fn();
    pasan++;
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallan++;
    fallos.push(`${nombre} — ${e?.message ?? e}`);
    console.error(`  ✗ ${nombre} — ${e?.message ?? e}`);
  }
}

function afirmar(cond, mensaje) {
  if (!cond) throw new Error(mensaje);
}

function leer(ruta) {
  const p = join(RAIZ, ruta);
  afirmar(existsSync(p), `falta ${ruta}`);
  return readFileSync(p, "utf8");
}

/** Todas las rutas de API reales en src/app/api (route.ts). */
function rutasApiReales() {
  const base = join(RAIZ, "src/app/api");
  afirmar(existsSync(base), "no existe src/app/api");
  const salida = [];
  const andar = (dir) => {
    for (const nombre of readdirSync(dir)) {
      const p = join(dir, nombre);
      if (statSync(p).isDirectory()) andar(p);
      else if (nombre === "route.ts" || nombre === "route.tsx") {
        const ruta = "/" + relative(join(RAIZ, "src/app"), dir).split("\\").join("/");
        salida.push(ruta === "/api/." ? "/api" : ruta);
      }
    }
  };
  andar(base);
  return salida.sort();
}

// ─────────────────────────────────────────────────────────────
// PARTE A
// ─────────────────────────────────────────────────────────────
async function parteA() {
  console.log("\nPARTE A — EL SISTEMA CENTRAL (offline)");
  if (!existsSync(join(RAIZ, "src/app/api"))) {
    console.log("  · sin árbol del repositorio en este directorio: la parte A se omite y lo dice.");
    console.log("    Ejecútala desde la raíz del repositorio (necesita src/ y docs/).");
    return;
  }

  await verificar("el contrato existe y sus códigos de error son cerrados (6)", () => {
    const t = leer("src/lib/sistema/contrato.ts");
    for (const trozo of ["API_VERSION", "ErrorVanguard", "conManejo", "limpiarDetalle", "validar"]) {
      afirmar(t.includes(trozo), `el contrato no declara «${trozo}»`);
    }
    const codigos = (t.match(/^\s{2}"[A-Z_]+",$/gm) || []).length;
    afirmar(codigos === 6, `se esperaban 6 códigos de error, hay ${codigos}`);
    afirmar(!/stack\s*:/i.test(t), "el contrato no debe devolver stacks");
  });

  await verificar("el catálogo de endpoints cuadra con src/app/api (sin fantasmas ni huérfanos)", () => {
    const t = leer("src/lib/api/catalogo.ts");
    const reales = new Set(rutasApiReales());
    const declaradas = [...t.matchAll(/ruta: "(\/api[^"]*)"/g)].map((m) => m[1]);
    const inventariadas = [...t.matchAll(/^\s{2}"(\/api[^"]*)",$/gm)].map((m) => m[1]);
    afirmar(declaradas.length >= 20, `solo ${declaradas.length} endpoints documentados`);
    for (const r of declaradas) afirmar(reales.has(r), `endpoint documentado que NO existe en src/app/api: ${r}`);
    for (const r of inventariadas) afirmar(reales.has(r), `endpoint inventariado que NO existe: ${r}`);
    const todas = [...declaradas, ...inventariadas];
    const dup = todas.filter((x, i) => todas.indexOf(x) !== i);
    afirmar(dup.length === 0, `endpoints repetidos en el catálogo: ${[...new Set(dup)].join(", ")}`);
    const sinRegistrar = [...reales].filter((r) => !todas.includes(r));
    afirmar(sinRegistrar.length === 0, `endpoints vivos sin documentar ni inventariar: ${sinRegistrar.join(", ")}`);
  });

  await verificar("el catálogo de datos declara procedencia, límites y rutas que existen", () => {
    const t = leer("src/lib/datos/catalogo.ts");
    const modelos = (t.match(/^\s{4}id: "dato:/gm) || []).length;
    afirmar(modelos >= 8, `solo ${modelos} modelos en el catálogo`);
    const procedencias = (t.match(/procedencia: \[/g) || []).length;
    const limites = (t.match(/limites: \[/g) || []).length;
    afirmar(procedencias >= modelos, `${modelos} modelos pero ${procedencias} procedencias`);
    afirmar(limites >= modelos, `${modelos} modelos pero ${limites} bloques de límites`);
    for (const ruta of [...t.matchAll(/"(?:rutas: \[|, )(\/[a-z0-9[\]/_-]*)"/gi)].map((m) => m[1])) {
      const rel = ruta === "/" ? "src/app/page.tsx" : `src/app${ruta}/page.tsx`;
      afirmar(existsSync(join(RAIZ, rel)), `el catálogo apunta a una ruta que no existe: ${ruta}`);
    }
  });

  await verificar("cada endpoint citado por el catálogo de datos existe", () => {
    const t = leer("src/lib/datos/catalogo.ts");
    const reales = new Set(rutasApiReales());
    for (const r of [...t.matchAll(/endpoint: "(\/api[^"]+)"/g)].map((m) => m[1])) {
      afirmar(reales.has(r), `el catálogo de datos cita un endpoint inexistente: ${r}`);
    }
  });

  await verificar("el sistema de extensiones tiene 6 puntos y rechaza lo que no cumple", () => {
    const t = leer("src/lib/sistema/extensiones.ts");
    const puntos = (t.match(/^\s{2}"[a-z]+", \/\//gm) || []).length;
    afirmar(puntos === 6, `se esperaban 6 puntos de extensión, hay ${puntos}`);
    for (const trozo of ["validarExtension", "ID_EXT", "VERSION_SEMVER", "EXTENSIONES_NUCLEO"]) {
      afirmar(t.includes(trozo), `el sistema de extensiones no declara «${trozo}»`);
    }
    afirmar(!/eval\(|new Function|import\(/m.test(t), "el sistema de extensiones no debe cargar código ajeno en caliente");
  });

  await verificar("la consulta estructurada y el nexo son deterministas", () => {
    for (const ruta of ["src/lib/nucleo/consulta.ts", "src/lib/nucleo/nexo.ts"]) {
      const t = leer(ruta);
      for (const prohibido of ["@/lib/db", "fetch(", "Date.now(", "new Date("]) {
        afirmar(!t.includes(prohibido), `${ruta} usa ${prohibido}: deja de ser determinista`);
      }
    }
    const c = leer("src/lib/nucleo/consulta.ts");
    for (const trozo of ["interpretarConsulta", "paisesEnTexto", "expansiones", "pistas"]) {
      afirmar(c.includes(trozo), `la consulta no declara «${trozo}»`);
    }
  });

  await verificar("el motor de recomendaciones usa las cuatro fuentes y no inventa rutas", () => {
    const t = leer("src/lib/nucleo/recomendaciones.ts");
    for (const trozo of ["familiaDeRuta", "contextoDePais", "vecinosDeModelo", "MODULOS_NUCLEO", "porque"]) {
      afirmar(t.includes(trozo), `el motor no usa «${trozo}»`);
    }
    afirmar(!t.includes("fetch("), "el motor no debe pedir nada a la red");
  });

  await verificar("la IA no simula conexiones: ningún proveedor implementado y ninguna clave leída", () => {
    const t = leer("src/lib/ia/proveedor.ts");
    afirmar(!t.includes("fetch("), "proveedor.ts hace fetch: hoy no debe llamar a ningún modelo");
    const implementados = [...t.matchAll(/implementado: (true|false)/g)].map((m) => m[1]);
    afirmar(implementados.length >= 4, "no declara el estado de sus proveedores");
    afirmar(implementados.every((x) => x === "false"), "declara un proveedor implementado: si lo hay, necesita su cliente real");
    afirmar(!/process\.env\[[^\]]+\]\s*[+?]?\s*`/.test(t), "no debe imprimir ni concatenar el valor de una credencial");
    afirmar(t.includes("capacidadesDeterministas"), "no declara qué funciona sin proveedor");
  });

  await verificar("los permisos se juzgan en el servidor y leen el censo", () => {
    const t = leer("src/lib/sistema/permisos.ts");
    afirmar(t.includes("moduloPorId"), "los permisos no leen el censo");
    afirmar(t.includes("ErrorVanguard"), "no usan el error del contrato");
    afirmar(!/^\s*["']use client["']/m.test(t), "un módulo de permisos cliente no puede juzgar permisos");
  });

  await verificar("los servicios nuevos están registrados en la casa (rutas y censo)", () => {
    for (const ruta of ["src/app/sistema/page.tsx", "src/app/datos/page.tsx"]) afirmar(existsSync(join(RAIZ, ruta)), `falta ${ruta}`);
    for (const ruta of [
      "src/app/api/sistema/endpoints/route.ts",
      "src/app/api/sistema/diagnostico/route.ts",
      "src/app/api/sistema/novedades/route.ts",
      "src/app/api/sistema/actividad/route.ts",
      "src/app/api/sistema/extensiones/route.ts",
      "src/app/api/sistema/datos/route.ts",
      "src/app/api/sistema/ia/route.ts",
      "src/app/api/consulta/route.ts",
    ]) {
      afirmar(existsSync(join(RAIZ, ruta)), `falta ${ruta}`);
    }
    const registro = leer("src/lib/nucleo/registro.ts");
    for (const id of ['"mod:sistema"', '"mod:datos"']) afirmar(registro.includes(id), `el censo no registra ${id}`);
  });

  await verificar("los endpoints nuevos usan el contrato (no inventan envoltorio)", () => {
    const rutas = [
      "endpoints", "diagnostico", "novedades", "actividad", "extensiones", "datos", "ia",
    ].map((r) => `src/app/api/sistema/${r}/route.ts`);
    rutas.push("src/app/api/consulta/route.ts");
    for (const ruta of rutas) {
      const t = leer(ruta);
      afirmar(t.includes("conManejo"), `${ruta} no usa conManejo`);
      afirmar(t.includes("from \"@/lib/sistema/contrato\""), `${ruta} no importa el contrato`);
      afirmar(!/NextResponse\.json\(/.test(t), `${ruta} devuelve JSON a mano en vez de usar ok()/fallo()`);
    }
  });

  await verificar("la documentación técnica existe y no promete lo que no hay", () => {
    const t = leer("docs/CORE.md");
    for (const trozo of ["contrato", "catálogo de datos", "extensiones", "caché", "permisos", "sin proveedor"]) {
      afirmar(t.toLowerCase().includes(trozo.toLowerCase()), `docs/CORE.md no cubre «${trozo}»`);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// PARTE B
// ─────────────────────────────────────────────────────────────
async function pedirJson(ruta) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30000);
  try {
    const r = await fetch(`${BASE}${ruta}`, { signal: ctrl.signal, headers: { "User-Agent": "pruebas-plataforma" } });
    const texto = await r.text();
    let json = null;
    try {
      json = JSON.parse(texto);
    } catch {
      /* HTML */
    }
    return { status: r.status, texto, json };
  } finally {
    clearTimeout(t);
  }
}

async function parteB() {
  console.log("\nPARTE B — EL SISTEMA VIVO (contrato y comprobaciones)");

  const rutas = [
    "/api/sistema/endpoints",
    "/api/sistema/diagnostico",
    "/api/sistema/novedades",
    "/api/sistema/actividad",
    "/api/sistema/extensiones",
    "/api/sistema/datos",
    "/api/sistema/ia",
    "/api/consulta?q=ucrania",
  ];

  for (const ruta of rutas) {
    await verificar(`contrato en ${ruta}`, async () => {
      const r = await pedirJson(ruta);
      afirmar(r.status === 200, `${ruta} devolvió ${r.status}`);
      afirmar(r.json && r.json.ok === true, `${ruta} no devuelve ok:true`);
      afirmar(typeof r.json.api === "string", `${ruta} no declara versión de interfaz`);
      afirmar(!!r.json.version, `${ruta} no declara versión del producto`);
      afirmar(r.json.meta && typeof r.json.meta.ms === "number", `${ruta} no trae meta.ms`);
    });
  }

  await verificar("el diagnóstico en vivo está sano", async () => {
    const r = await pedirJson("/api/sistema/diagnostico");
    afirmar(r.json?.datos?.sano === true, `diagnóstico con fallos: ${JSON.stringify(r.json?.datos?.checks?.filter((c) => !c.ok) ?? [])}`);
    afirmar(r.json.datos.checks.length >= 8, "el diagnóstico trae menos de 8 comprobaciones");
  });

  await verificar("el catálogo vivo cubre todos los endpoints reales", async () => {
    const r = await pedirJson("/api/sistema/endpoints");
    const c = r.json?.datos?.cobertura ?? {};
    afirmar(c.total >= 90, `el catálogo vive ${c.total} endpoints: la casa tiene más`);
    afirmar(c.documentados >= 20, `solo ${c.documentados} documentados`);
  });

  await verificar("la consulta estructurada interpreta y devuelve resultados reales", async () => {
    const r = await pedirJson("/api/consulta?q=que%20pasa%20en%20ucrania");
    const d = r.json?.datos;
    afirmar(d?.interpretacion?.pais?.iso2 === "ua", "no reconoce Ucrania como país");
    afirmar(d.interpretacion.tipo === "noticia", "no entiende que pide noticias");
    afirmar(Array.isArray(d.resultados), "no devuelve resultados");
    afirmar(Array.isArray(d.interpretacion.pistas) && d.interpretacion.pistas.length > 0, "no explica su interpretación");
  });

  await verificar("la IA se declara sin proveedor (no finge)", async () => {
    const r = await pedirJson("/api/sistema/ia");
    const d = r.json?.datos;
    afirmar(Array.isArray(d?.proveedores), "no lista proveedores");
    afirmar(d.proveedores.every((p) => p.implementado === false), "declara un proveedor implementado sin cliente real");
    afirmar(Array.isArray(d.deterministas) && d.deterministas.length >= 5, "no declara las capacidades deterministas");
  });

  await verificar("las páginas /sistema y /datos responden 200", async () => {
    for (const ruta of ["/sistema", "/datos"]) {
      const r = await pedirJson(ruta);
      afirmar(r.status === 200, `${ruta} devolvió ${r.status}`);
      afirmar(r.texto.length > 5000, `${ruta} devuelve una página vacía`);
    }
  });

  await verificar("el muro del diagnóstico existe (ráfaga → 429)", async () => {
    let vio429 = false;
    for (let i = 0; i < 66; i++) {
      const r = await pedirJson("/api/sistema/diagnostico");
      if (r.status === 429) {
        vio429 = true;
        break;
      }
    }
    afirmar(vio429, "66 diagnósticos seguidos sin 429: el muro no está aplicado");
  });
}

const t0 = Date.now();
await parteA();
if (BASE) await parteB();
else console.log("\nPARTE B omitida: pasa la URL del servidor como argumento para probarla en vivo.");
console.log("\n════════════════════════════════════════");
console.log(`  PASAN ${pasan} · FALLAN ${fallan} · ${Date.now() - t0} ms${BASE ? " (parte A + B)" : " (solo parte A)"}`);
if (fallan > 0) {
  fallos.forEach((f) => console.log(`   · ${f}`));
  process.exit(1);
}
console.log("  EL SISTEMA CENTRAL RESPONDE: contrato, catálogos, permisos y diagnóstico ✓");
