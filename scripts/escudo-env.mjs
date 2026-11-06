#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// VANGUARD — EL INVENTARIO DEL AIRE (escudo-env.mjs) · hermano menor del
// Buscador de Llaves (busca-apikeys.mjs, ley v204). Mientras el Buscador caza
// SECRETOS escritos en el código, el Inventario mira lo que el código RESPIRA:
// qué variables de entorno usa, cuáles declara la casa y qué reservas quedaron
// hardcodeadas en el camino. Node puro, cero dependencias nuevas (ley de la casa).
//
//   node scripts/escudo-env.mjs            → informe · exit 1 si hay RESERVAS hardcodeadas
//   node scripts/escudo-env.mjs --strict   → también falla si hay variables usadas sin declarar
//   node scripts/escudo-env.mjs --json     → salida JSON (para CI u otras herramientas)
//
// Las tres miradas:
//   A) USADAS SIN DECLARAR — process.env.X en el código que ningún .env* de la
//      casa declara. En Vercel puede ser correcto (las variables viajan en el
//      panel, no en archivos), así que solo es delito con --strict. Es la lista
//      que guía la cura del P0: si AUTH_SECRET o ZAI_TOKEN siguen aquí, la
//      rotación todavía no cerró.
//   B) DECLARADAS SIN USO — variables que la casa declara y el código no
//      respira: config muerta que confunde al siguiente soldado.
//   C) RESERVAS HARDCODEADAS — process.env.X ?? "literal" donde X huele a
//      secreto (SECRET/TOKEN/PASSWORD/KEY/AUTH/WEBHOOK/ADMIN/CRED). Eso es una
//      credencial viajando en el repo: DELITO siempre → exit 1. La cura es la
//      del P0: definir la variable en Vercel y borrar el fallback del código.
//
// Los valores del informe viajan ENMASCARADOS: el informe jamás filtra lo que mira.
// ═══════════════════════════════════════════════════════════════════════════

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";

// ── variables que el SISTEMA inyecta y no son de la casa ──────────────────
const SISTEMA = new Set([
  "NODE_ENV", "PORT", "HOSTNAME", "PWD", "HOME", "PATH", "LANG", "TZ",
  "TMPDIR", "CI", "NEXT_RUNTIME", "NEXT_DEPLOYMENT_ID", "NODE_OPTIONS",
  "VERCEL", "VERCEL_ENV", "VERCEL_URL", "VERCEL_REGION",
  "VERCEL_PROJECT_PRODUCTION_URL",
]);
const PREFIJOS_SISTEMA = ["npm_", "VERCEL_GIT_"];
const esSistema = (n) =>
  SISTEMA.has(n) || PREFIJOS_SISTEMA.some((p) => n.startsWith(p));

// ── qué se mira y qué no ──────────────────────────────────────────────────
const DIRS_FUERA = new Set([
  "node_modules", ".git", ".next", ".vercel", ".output", "standalone", "dist",
  "video", "capturas", "media", "rescate-v168", "tmp", "download", "upload",
  "tool-results", ".zscripts-cache",
]);
const EXT_CODIGO = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs", ".mts", ".jsx", ".json",
  ".sh", ".bash", ".prisma", ".yml", ".yaml",
]);
const EXT_BIN = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".mp4", ".webm",
  ".mov", ".wav", ".mp3", ".ogg", ".db", ".sqlite", ".sqlite3", ".wasm", ".zip",
  ".gz", ".tgz", ".tar", ".rar", ".7z", ".pdf", ".woff", ".woff2", ".ttf", ".otf",
  ".eot", ".bin", ".pid", ".exe", ".dll", ".so", ".dylib", ".node", ".onnx",
]);
const NOMBRES_SIN_EXT = new Set(["Caddyfile", "Dockerfile"]);
const TOPE_BYTES = 2_000_000;

// archivos donde la casa DECLARA variables (raíz del proyecto)
const ARCHIVOS_ENV = [
  ".env.example", ".env", ".env.local", ".env.production", ".env.development",
];

// ── filtros de línea ──────────────────────────────────────────────────────
const COMENTARIO = /^[ \t]*(#|\/\/|\/\*|\*|--)/;
const NOMBRE_HUELE = /(SECRET|TOKEN|PASSWORD|PASS|KEY|CRED|AUTH|WEBHOOK|ADMIN)/i;
const PLACEHOLDER = /(cambia|tu-|tu_|example|xxx|placeholder|changeme|change-me|<[^>]+>|\$\{|your_|my_|insert|here|personalizar|reemplazar|cadena-larga|cadena\s+larga)/i;

// ── utilidades ────────────────────────────────────────────────────────────
const RUTA = process.cwd();
const marca = (s) =>
  s.length > 14 ? s.slice(0, 6) + "…" + s.slice(-4) : "•".repeat(Math.max(s.length, 8));
const LIMITE_EJEMPLOS = 5;

function* archivos(raiz) {
  for (const nombre of readdirSync(raiz)) {
    const completo = join(raiz, nombre);
    let st;
    try { st = statSync(completo); } catch { continue; }
    if (st.isDirectory()) {
      if (DIRS_FUERA.has(nombre)) continue;
      yield* archivos(completo);
    } else {
      yield completo;
    }
  }
}

// ── mirada 0: qué declara la casa ─────────────────────────────────────────
const declaradas = new Map(); // nombre → archivo que la declara
for (const archivoEnv of ARCHIVOS_ENV) {
  const ruta = join(RUTA, archivoEnv);
  if (!existsSync(ruta)) continue;
  let texto;
  try { texto = readFileSync(ruta, "utf8"); } catch { continue; }
  for (const m of texto.matchAll(/^[ \t]*(?:export[ \t]+)?([A-Za-z_][A-Za-z0-9_]*)[ \t]*=/gm)) {
    if (!declaradas.has(m[1])) declaradas.set(m[1], archivoEnv);
  }
}

// ── el barrido: usos (A/B) y reservas (C) ─────────────────────────────────
const usos = new Map(); // nombre → [{ archivo, linea }]
const reservas = [];
let examinados = 0;

const RE_USO_PUNTO = /\bprocess\.env\.([A-Z][A-Z0-9_]{1,80})\b/g;
const RE_USO_CORCHETE = /\bprocess\.env\[\s*["']([A-Z][A-Z0-9_]{1,80})["']\s*\]/g;
const RE_RESERVA = /process\.env(?:\.([A-Z][A-Z0-9_]{1,80})|\[\s*["']([A-Z][A-Z0-9_]{1,80})["']\s*\])\s*(?:\?\?|\|\|)\s*["'`]([^'`\n]{6,})["'`]/;

function registrarUso(nombre, rel, linea) {
  if (!usos.has(nombre)) usos.set(nombre, []);
  const lista = usos.get(nombre);
  if (lista.length < LIMITE_EJEMPLOS) lista.push({ archivo: rel, linea });
}

for (const ruta of archivos(RUTA)) {
  const rel = relative(RUTA, ruta);
  if (rel === "scripts/escudo-env.mjs") continue; // el espejo no se vigila a sí mismo
  const ext = extname(rel).toLowerCase();
  const base = rel.split("/").pop().split("\\").pop();
  if (!EXT_CODIGO.has(ext) && !(ext === "" && NOMBRES_SIN_EXT.has(base))) continue;
  let st;
  try { st = statSync(ruta); } catch { continue; }
  if (!st.isFile() || st.size > TOPE_BYTES) continue;
  let texto;
  try { texto = readFileSync(ruta, "utf8"); } catch { continue; }
  if (texto.slice(0, 8192).includes("\u0000")) continue; // binario disfrazado
  examinados++;

  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    if (!linea || linea.length > 2000) continue;
    const comentada = COMENTARIO.test(linea);
    if (comentada) continue; // los comentarios no respiran

    // usos: process.env.X y process.env["X"] (código) · env("X") (esquema Prisma)
    for (const m of linea.matchAll(RE_USO_PUNTO)) registrarUso(m[1], rel, i + 1);
    for (const m of linea.matchAll(RE_USO_CORCHETE)) registrarUso(m[1], rel, i + 1);
    if (ext === ".prisma") {
      for (const m of linea.matchAll(/\benv\(\s*["']([A-Z][A-Z0-9_]{1,80})["']\s*\)/g)) {
        registrarUso(m[1], rel, i + 1);
      }
    }

    // reservas: process.env.X ?? "literal" (o ||) con nombre que huele a secreto
    const r = RE_RESERVA.exec(linea);
    if (r) {
      const nombre = r[1] || r[2];
      const valor = r[3];
      if (NOMBRE_HUELE.test(nombre) && !PLACEHOLDER.test(valor) && !valor.startsWith("${")) {
        reservas.push({
          archivo: rel,
          linea: i + 1,
          variable: nombre,
          muestra: marca(valor),
          lineaTexto: linea.trim().slice(0, 120),
          cura:
            "Define " + nombre + " en Vercel (variables de entorno), borra el fallback del código y rota el valor que quedó expuesto.",
        });
      }
    }
  }
}

// ── veredicto ─────────────────────────────────────────────────────────────
const estricto = process.argv.includes("--strict");
const comoJson = process.argv.includes("--json");

const nombresUsados = [...usos.keys()].sort();
const sinDeclarar = nombresUsados.filter((n) => !declaradas.has(n) && !esSistema(n));
const sinUso = [...declaradas.keys()].filter((n) => !usos.has(n)).sort();
const detalleSinDeclarar = sinDeclarar.map((n) => ({
  variable: n,
  ejemplos: usos.get(n) || [],
}));
const exito = reservas.length === 0 && (!estricto || sinDeclarar.length === 0);

if (comoJson) {
  console.log(
    JSON.stringify(
      {
        examinados,
        usadas: nombresUsados.length,
        declaradas: [...declaradas.keys()].sort(),
        sinDeclarar: detalleSinDeclarar,
        sinUso,
        reservas,
        estricto,
        exito,
      },
      null,
      2
    )
  );
} else {
  const linea = "════════════════════════════════════════════════════════════";
  console.log(linea);
  console.log(" VANGUARD — EL INVENTARIO DEL AIRE · escudo-env");
  console.log(" (hermano del Buscador de Llaves · complemento de la ley v204)");
  console.log(linea);
  console.log(`Archivos examinados: ${examinados}`);
  console.log(`Variables usadas en el código: ${nombresUsados.length}`);
  console.log(`Variables declaradas por la casa (.env*): ${declaradas.size}`);
  console.log(`Reservas hardcodeadas (delito): ${reservas.length}`);
  console.log("");

  if (sinDeclarar.length) {
    console.log("── A) USADAS SIN DECLARAR — el código respira aire que la casa no nombra ──");
    for (const d of detalleSinDeclarar.slice(0, 20)) {
      console.log(`  · ${d.variable}`);
      for (const ej of d.ejemplos) console.log(`      ${ej.archivo}:${ej.linea}`);
    }
    if (sinDeclarar.length > 20) console.log(`  … y ${sinDeclarar.length - 20} más`);
    console.log("  (en Vercel puede ser correcto — con --strict esto hace caer el veredicto)");
    console.log("");
  }

  if (sinUso.length) {
    console.log("── B) DECLARADAS SIN USO — config muerta que confunde al siguiente soldado ──");
    for (const n of sinUso.slice(0, 20)) console.log(`  · ${n} (${declaradas.get(n)})`);
    if (sinUso.length > 20) console.log(`  … y ${sinUso.length - 20} más`);
    console.log("");
  }

  if (reservas.length) {
    console.log("── C) RESERVAS HARDCODEADAS — una credencial viajando en el repo ──");
    for (const r of reservas.slice(0, 40)) {
      console.log(`  ✗ ${r.variable} · ${r.archivo}:${r.linea} · ${r.muestra}`);
      console.log(`     línea: ${r.lineaTexto}`);
      console.log(`     cura:  ${r.cura}`);
    }
    if (reservas.length > 40) console.log(`  … y ${reservas.length - 40} más`);
    console.log("");
    console.log("PROTOCOLO DE CURA (el P0 de la auditoría):");
    console.log("  1. Define la variable en Vercel (Settings → Environment Variables).");
    console.log("  2. BORRA el fallback del código: el código debe fallar alto, no mentir.");
    console.log("  3. Rota el valor que quedó expuesto en el histórico del repo.");
    console.log("  4. Cuando las reservas mueran, este escudo vuelve a verde.");
  } else {
    console.log("VEREDICTO: SIN RESERVAS — ninguna credencial hardcodeada en el árbol.");
    if (sinDeclarar.length) {
      console.log("RECUERDA: hay variables usadas sin declarar — revísalas con --strict.");
    }
  }
}

process.exit(exito ? 0 : 1);
