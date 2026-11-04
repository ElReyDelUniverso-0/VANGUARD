#!/usr/bin/env node
// ============================================================
// v238.0 EL VELOCÍMETRO — el instrumental de medición móvil de
// la casa. La cola mandaba «medir primero»: esto MIDE lo que un
// móvil descarga en una visita fría (caché vacío) a cada sala.
//
//   node scripts/velocimetro.mjs http://127.0.0.1:3000 /mundo /conflicto/ukraine /
//
// Por cada ruta: bytes del documento comprimido (gzip/br, como
// llega al móvil), TTFB, y TODOS los subrecursos que el HTML
// declara (scripts, CSS, fuentes, imágenes) descargados y
// clasificados por tipo. Las imágenes lazy se reportan aparte
// (bajo demanda: el móvil no las baja hasta hacer falta). Los
// chunks de three.js/globo cargados por next/dynamic tampoco los
// declara el HTML: el velocímetro los busca en .next/static
// (si corre desde la raíz del repo) y los declara como Bajo
// demanda. Cifras honestas o nada.
// ============================================================
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const RUTAS = process.argv.slice(3).length ? process.argv.slice(3) : ["/mundo", "/conflicto/ukraine", "/"];

// velocidades de bolsillo (bytes/seg): 3G lenta y 4G media — para estimar
const VELOCIDADES = [
  ["3G lenta (1.5 Mbps)", 187_500],
  ["4G media (10 Mbps)", 1_250_000],
];

function curl(url, out = null) {
  const destino = out || "/tmp/velocimetro-sub.bin";
  const args = ["-sL", "--compressed", "-w", "%{size_download} %{time_starttransfer} %{http_code}", "--max-time", "30", "-o", destino];
  args.push(url);
  const res = execFileSync("curl", args, { encoding: "utf8", maxBuffer: 1024 * 1024 });
  const [bytes, ttfb, code] = res.trim().split(/\s+/).map(Number);
  return { bytes: bytes || 0, ttfb: ttfb || 0, code: code || 0 };
}

function clasifica(url) {
  if (/\.js(\?|$)/.test(url)) return "JS";
  if (/\.css(\?|$)/.test(url)) return "CSS";
  if (/\.woff2?(\?|$)/.test(url)) return "Fuentes";
  if (/\.(png|jpe?g|webp|gif|svg|ico)(\?|$)/.test(url)) return "Imágenes";
  return "Otros";
}

// marcadores de CÓDIGO de three.js que sobreviven a la minificación —
// jamás comentar ni texto (el texto de la bitácora dice «THREE.» y no es código)
const ES_THREE = (s) => /WebGLRenderer|PerspectiveCamera/.test(s);

const RAIZ = process.cwd();
const dirChunksGlobal = join(RAIZ, ".next/static/chunks");

// la lección del zombi (v238): un servidor viejo que sobrevive al pkill
// retiene el puerto y el velocímetro medía CÓDIGO VIEJO sin saberlo. Toda
// medición declara la versión que midió — si no la dice, no es medición.
const salud = curl(`${BASE}/api/health`);
let versionMedida = "desconocida";
try { versionMedida = JSON.parse(readFileSync("/tmp/velocimetro-sub.bin", "utf8")).version ?? versionMedida; } catch { /* sin health */ }
console.log(`EL VELOCÍMETRO mide contra ${BASE} — build ${versionMedida} (health HTTP ${salud.code})`);

for (const ruta of RUTAS) {
  const doc = curl(`${BASE}${ruta}`, "/tmp/velocimetro-doc.html");
  const html = readFileSync("/tmp/velocimetro-doc.html", "utf8");

  // subrecursos del HTML — las <img> se extraen PRIMERO (con su loading),
  // luego se quitan del HTML para no volver a casar su src como crítico
  const critico = [];
  const enLazy = [];
  const vistos = new Map();
  const mide = (u, tipo, lazy) => {
    if (vistos.has(u)) return;
    const m = curl(`${BASE}${u}`);
    vistos.set(u, m.bytes);
    (lazy ? enLazy : critico).push({ url: u, bytes: m.bytes, tipo });
  };
  const htmlSinImgs = html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = (tag.match(/\bsrc="([^"]+)"/) || [])[1];
    if (src && src.startsWith("/")) {
      const lazy = /loading="lazy"/.test(tag);
      mide(src, lazy ? "Imágenes (lazy)" : "Imágenes", lazy);
    }
    return "";
  });
  for (const u of new Set(
    [...htmlSinImgs.matchAll(/(?:src|href)="(\/[^"]+\.(?:js|css|woff2?|png|jpe?g|webp|svg|ico))"/g)].map((m) => m[1])
  )) {
    mide(u, clasifica(u), false);
  }

  // chunks del globo bajo demanda (next/dynamic no los declara el HTML):
  // es un CENSO DE BUILD, no un coste por ruta — solo las salas que montan
  // globo (/, /mundo, /ver-guerra) pagan esta familia al hidratar; sumarlo
  // a una sala server-only como /conflicto sería MENTIR
  const censoThree = [];
  const dirChunks = join(RAIZ, ".next/static/chunks");
  if (existsSync(dirChunks)) {
    const globosCitados = new Set();
    for (const { url } of critico) {
      if (!url.includes("/_next/static/chunks/")) continue;
      const fichero = join(RAIZ, url.replace("/_next/", ".next/").split("?")[0]);
      if (existsSync(fichero) && ES_THREE(readFileSync(fichero, "utf8"))) globosCitados.add(url);
    }
    if (!globosCitados.size) {
      try {
        const nombres = execFileSync("bash", [
          "-c",
          `for f in ${dirChunks}/*.js; do if rg -q "WebGLRenderer|PerspectiveCamera" "$f" 2>/dev/null; then echo "$f"; fi; done`,
        ], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
        for (const f of nombres) {
          const url = `/_next/static/chunks/${f.split("/").pop()}`;
          if (!vistos.has(url)) censoThree.push(url);
        }
      } catch { /* sin rg: censo vacío, se declara */ }
    }
  }

  const criticos = critico;
  const todo = [...critico, ...enLazy];
  const suma = (l) => l.reduce((a, b) => a + b.bytes, 0);
  const porTipo = {};
  for (const x of criticos) porTipo[x.tipo] = (porTipo[x.tipo] || 0) + x.bytes;

  console.log(`\n══ ${ruta} ══`);
  console.log(`  documento: ${(doc.bytes / 1024).toFixed(1)} KB comprimido · TTFB ${(doc.ttfb * 1000).toFixed(0)} ms · HTTP ${doc.code}`);
  for (const [t, b] of Object.entries(porTipo).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${t}: ${(b / 1024).toFixed(1)} KB`);
  }
  const totalCritico = doc.bytes + suma(criticos);
  const totalTodo = totalCritico + suma(enLazy);
  console.log(`  visita fría sin imágenes lazy: ${(totalCritico / 1024).toFixed(1)} KB en ${criticos.length + 1} peticiones`);
  if (enLazy.length) console.log(`  imágenes lazy (bajo demanda): ${(suma(enLazy) / 1024).toFixed(1)} KB en ${enLazy.length} ficheros`);
  console.log(`  visita fría COMPLETA de ESTA sala (con lazy): ${(totalTodo / 1024).toFixed(1)} KB`);
  for (const [nombre, velocidad] of VELOCIDADES) {
    const s = totalTodo / velocidad;
    const m = Math.floor(s / 60), seg = (s % 60).toFixed(0);
    console.log(`    a ${nombre}: ${m > 0 ? `${m} min ` : ""}${seg} s`);
  }
}

// ── censo de build: la familia three.js (el planeta bajo demanda) ──
if (dirChunksGlobal && existsSync(dirChunksGlobal)) {
  let nombres = [];
  try {
    nombres = execFileSync("bash", [
      "-c",
      `for f in ${dirChunksGlobal}/*.js; do if rg -q "WebGLRenderer|PerspectiveCamera" "$f" 2>/dev/null; then echo "$f"; fi; done`,
    ], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  } catch { nombres = []; }
  if (nombres.length) {
    let comprimido = 0;
    for (const f of nombres) {
      const url = `/_next/static/chunks/${f.split("/").pop()}`;
      comprimido += curl(`${BASE}${url}`).bytes;
    }
    console.log(`\n── EL PLANETA EN EL BUILD (censo, no es por ruta) ──`);
    console.log(`  ${nombres.length} chunks llevan CÓDIGO de three.js: ${(comprimido / 1024).toFixed(1)} KB comprimidos en la red`);
    console.log(`  es el sobre-coste bajo demanda de las salas que montan globo (/, /mundo, /ver-guerra): pagan esta familia al hidratar, además de lo suyo`);
  }
}

console.log("\nEL VELOCÍMETRO no optimiza nada: solo mide. Las decisiones las toman los números.");
