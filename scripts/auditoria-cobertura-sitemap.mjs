// ============================================================
// v421.6 · AUDITORÍA DE COBERTURA — ¿qué salas existen y no están en el mapa?
//
// La pregunta de la Fase 1, ahora con números: de todas las rutas que la casa
// sirve, ¿cuántas tienen URL anunciada en el sitemap? Una sala que responde 200,
// es indexable y no está en el mapa solo la encuentra Google si alguien la
// enlaza. Eso es contenido invisible.
//
// Uso:  node scripts/auditoria-cobertura-sitemap.mjs [https://casa]
//
// Lee las rutas del propio código (src/app/**/page.tsx), las pide con UA de
// Googlebot y las cruza con el sitemap COMPLETO (índice + hijos).
// ============================================================
import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const BASE = (process.argv.find((a) => a.startsWith("http")) || "https://vanguard.vanguard-casa.workers.dev").replace(/\/$/, "");
const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const RAIZ = new URL("../src/app", import.meta.url).pathname;

const pedir = (u, opts = {}) => fetch(u, { headers: { "user-agent": UA }, redirect: "manual", signal: AbortSignal.timeout(45000), ...opts });
const locs = (t) => [...t.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));

// ── 1. el mapa completo ───────────────────────────────────────
const idx = await (await pedir(`${BASE}/sitemap.xml`)).text();
const hijos = /<sitemapindex[\s>]/.test(idx) ? locs(idx) : [];
const paginas = new Set(/<urlset[\s>]/.test(idx) ? locs(idx) : []);
for (const h of hijos) for (const l of locs(await (await pedir(h)).text())) paginas.add(l);
const enMapa = (ruta) => paginas.has(`${BASE === "https://vanguard.vanguard-casa.workers.dev" ? BASE : BASE}${ruta}`) || paginas.has(`${BASE}${ruta}/`);

// ── 2. las rutas que el código sirve ─────────────────────────
async function rutasDeCarpeta(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith("_") || e.name.startsWith(".")) continue;
      out.push(...(await rutasDeCarpeta(p)));
    } else if (e.name === "page.tsx" || e.name === "page.ts") {
      const ruta = "/" + relative(RAIZ, dir).split(sep).join("/");
      out.push(ruta === "/." ? "/" : ruta);
    }
  }
  return out;
}
const todas = (await rutasDeCarpeta(RAIZ)).sort();
const estaticas = todas.filter((r) => !r.includes("["));
const dinamicas = todas.filter((r) => r.includes("["));

// rutas que por diseño no se anuncian
const PRIVADAS = [/^\/api/, /^\/entrar/, /^\/cuartel/, /^\/estado/, /^\/creadores\/(publicar|moderacion)/, /^\/editorial\//];

console.log(`\nCOBERTURA DEL MAPA · ${BASE}`);
console.log(`  ${paginas.size} URLs anunciadas · ${estaticas.length} rutas estáticas · ${dinamicas.length} rutas con parámetro\n`);

const huecos = [];
const privadas = [];
const cerradas = [];

for (const ruta of estaticas) {
  const url = `${BASE}${ruta}`;
  let res;
  try {
    res = await pedir(url);
  } catch {
    huecos.push({ ruta, motivo: "sin respuesta" });
    continue;
  }
  const html = res.status === 200 ? await res.text() : "";
  const noindex = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html) || /noindex/i.test(res.headers.get("x-robots-tag") || "");
  const enMapaSitio = enMapa(ruta === "/" ? "" : ruta) || (ruta === "/" && paginas.has(`${BASE}/`));

  if (PRIVADAS.some((re) => re.test(ruta))) {
    privadas.push({ ruta, estado: res.status, enMapaSitio });
  } else if (res.status !== 200) {
    cerradas.push({ ruta, estado: res.status });
  } else if (noindex) {
    // una sala que se declara noindex y no está en el mapa está bien así
    if (enMapaSitio) huecos.push({ ruta, motivo: "noindex pero anunciada en el mapa (contradicción)" });
  } else if (!enMapaSitio) {
    huecos.push({ ruta, motivo: "200 · indexable · FUERA del mapa" });
  }
}

console.log("HUECOS REALES (200, indexable, sin URL anunciada):");
if (!huecos.length) console.log("  ninguno");
for (const h of huecos) console.log(`  ✗ ${h.ruta.padEnd(46)} ${h.motivo}`);

if (cerradas.length) {
  console.log("\nRUTAS QUE NO RESPONDEN 200 (no deberían anunciarse):");
  for (const c of cerradas) console.log(`  · ${c.ruta.padEnd(46)} HTTP ${c.estado}`);
}

console.log("\nCÓMO VAN LAS DINÁMICAS (URLs en el mapa por familia):");
const familias = new Map();
for (const r of dinamicas) {
  // el prefijo son los segmentos FIJOS antes del primer parámetro
  // (antes se colaba el [tag] y toda familia parecía tener 0 URLs)
  const partes = r.split("/").filter(Boolean);
  const corte = partes.findIndex((x) => x.startsWith("["));
  const prefijo = "/" + partes.slice(0, corte < 0 ? 2 : corte).join("/");
  familias.set(prefijo, (familias.get(prefijo) || 0) + 1);
}
for (const [prefijo, n] of [...familias].sort((a, b) => b[1] - a[1]).slice(0, 14)) {
  const anunciadas = [...paginas].filter((u) => u.startsWith(`${BASE}${prefijo}/`)).length;
  console.log(`  ${String(anunciadas).padStart(5)} URLs · ${prefijo}  (${n} ruta(s) con parámetro)`);
}

console.log(`\n${"─".repeat(64)}`);
console.log(huecos.length ? `${huecos.length} hueco(s) de cobertura.` : "Cobertura completa: toda sala indexable tiene URL anunciada.");
process.exit(huecos.length ? 1 : 0);
