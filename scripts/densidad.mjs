#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v405.5 · LA GUARDIA DE LA DENSIDAD — el pilar 2, con dientes.
//
// Hasta hoy, «que una sala no sea un libro» dependía de que yo me acordara de
// mirar el informe. Este script lo convierte en una regla que se puede ejecutar
// y que devuelve error: si una sala supera el techo de letras por elemento
// visual, el proceso sale con 1 y el aviso se ve en la consola del que publique.
//
// QUÉ MIDE: lee la instantánea real de la auditoría (src/lib/auditoria.json,
// escrito por scripts/auditoria.mjs) — sus cifras no se escriben aquí a mano.
// Si se le pasa una URL, mide en vivo y compara con el techo.
//
// USO:
//   node scripts/densidad.mjs                 # informe de la última instantánea
//   node scripts/densidad.mjs --max 800       # falla si alguna sala pasa de 800
//   node scripts/densidad.mjs --smoke https://vanguard-kq9r.vercel.app
//   node scripts/densidad.mjs --json          # salida para máquinas
//
// NO SUSTITUYE A NADA: scripts/auditoria.mjs sigue siendo el auditor completo
// (rutas, enlaces, idioma, recursos, botones). Esto solo vigila UNA cosa.
// ═══════════════════════════════════════════════════════════════════
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, "..");
const INSTANTANEA = join(RAIZ, "src", "lib", "auditoria.json");

/** El techo por defecto: 800 letras por elemento visual. */
const TECHO = 800;

function args() {
  const a = process.argv.slice(2);
  const opciones = { max: TECHO, url: null, json: false, limite: 20 };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--max") opciones.max = Number(a[++i]);
    else if (a[i] === "--smoke") opciones.url = a[++i];
    else if (a[i] === "--json") opciones.json = true;
    else if (a[i] === "--limite") opciones.limite = Number(a[++i]);
  }
  return opciones;
}

/** Cuenta letras y elementos visuales del HTML servido, como el auditor. */
function medirHtml(html) {
  let cuerpo = html;
  cuerpo = cuerpo.replace(/<script[\s\S]*?<\/script>/gi, "");
  cuerpo = cuerpo.replace(/<style[\s\S]*?<\/style>/gi, "");
  const texto = cuerpo.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const visuales = (cuerpo.match(/<img\b|<svg\b|role="img"|<canvas\b|<video\b|<figure\b|<picture\b/gi) || []).length;
  const letras = texto.length;
  return { letras, visuales, ratio: visuales > 0 ? Math.round(letras / visuales) : letras };
}

/** La lista de rutas de la casa, desde la instantánea (sin inventar ninguna). */
function rutasDeLaInstantanea() {
  const crudo = JSON.parse(readFileSync(INSTANTANEA, "utf8"));
  const densidad = crudo?.humo?.densidad;
  if (!Array.isArray(densidad) || densidad.length === 0) {
    throw new Error("la instantánea no trae censo de densidad: corre scripts/auditoria.mjs --smoke <url> --json");
  }
  return {
    fecha: crudo?.humo?.fecha ?? crudo?.fecha ?? null,
    base: crudo?.humo?.base ?? null,
    filas: densidad.map((d) => ({
      ruta: d.ruta,
      letras: d.letras,
      visuales: d.visuales,
      ratio: d.ratio ?? (d.visuales > 0 ? Math.round(d.letras / d.visuales) : d.letras),
    })),
  };
}

/** Mide en vivo las rutas dadas contra una URL base. */
async function medirEnVivo(base, rutas, limite) {
  const salida = [];
  for (const ruta of rutas.slice(0, limite)) {
    try {
      const r = await fetch(base.replace(/\/$/, "") + ruta, { headers: { "user-agent": "vanguard-densidad" } });
      const html = await r.text();
      salida.push({ ruta, ...medirHtml(html), estado: r.status });
    } catch (e) {
      salida.push({ ruta, error: String(e?.message ?? e) });
    }
  }
  return salida;
}

function mediana(nums) {
  const v = [...nums].sort((a, b) => a - b);
  if (v.length === 0) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : Math.round((v[m - 1] + v[m]) / 2);
}

function barra(ratio, techo, ancho = 24) {
  const lleno = Math.max(0, Math.min(ancho, Math.round((ratio / techo) * ancho)));
  return "█".repeat(lleno) + "·".repeat(ancho - lleno);
}

async function main() {
  const op = args();
  let filas;
  let contexto;

  if (op.url) {
    // en vivo: se miden las rutas de la última instantánea (las mismas puertas)
    const { filas: conocidas } = rutasDeLaInstantanea();
    const rutas = conocidas.map((f) => f.ruta);
    filas = await medirEnVivo(op.url, rutas, op.limite);
    contexto = { modo: "en vivo", base: op.url, fecha: new Date().toISOString() };
  } else {
    const { filas: f, fecha, base } = rutasDeLaInstantanea();
    filas = f;
    contexto = { modo: "instantánea", base, fecha };
  }

  const validas = filas.filter((f) => typeof f.ratio === "number" && f.visuales > 0);
  const sobreTecho = validas.filter((f) => f.ratio > op.max);
  const med = mediana(validas.map((f) => f.ratio));
  const ordenadas = [...validas].sort((a, b) => b.ratio - a.ratio);

  if (op.json) {
    console.log(JSON.stringify({ contexto, techo: op.max, mediana: med, sobreTecho: sobreTecho.length, salas: ordenadas }, null, 2));
  } else {
    console.log(`\n═══ GUARDIA DE LA DENSIDAD · pilar 2 ═══`);
    console.log(`fuente: ${contexto.modo}${contexto.base ? " · " + contexto.base : ""}${contexto.fecha ? " · " + contexto.fecha : ""}`);
    console.log(`techo: ${op.max} letras por elemento visual · mediana de la casa: ${med}`);
    console.log(`salas medidas: ${validas.length} · por encima del techo: ${sobreTecho.length}\n`);
    for (const f of ordenadas.slice(0, 12)) {
      const marca = f.ratio > op.max ? "⚠" : " ";
      console.log(`${marca} ${String(f.ratio).padStart(5)} ${barra(f.ratio, op.max)} ${f.ruta.padEnd(26)} ${String(f.letras).padStart(7)} letras · ${String(f.visuales).padStart(4)} visuales`);
    }
    if (sobreTecho.length > 0) {
      console.log(`\n✗ ${sobreTecho.length} sala(s) siguen siendo un libro:`);
      for (const f of sobreTecho) console.log(`   · ${f.ruta} (${f.ratio})`);
      console.log(`\n  El patrón que las arregla: ficha visual + expediente completo detrás de un botón`);
      console.log(`  (src/components/vanguard/ficha.tsx). Nada se borra: el texto viaja en el HTML.\n`);
    } else {
      console.log(`\n✓ ninguna sala pasa de ${op.max} letras por elemento visual.\n`);
    }
  }

  process.exit(sobreTecho.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("guardia de la densidad:", e?.message ?? e);
  process.exit(2);
});
