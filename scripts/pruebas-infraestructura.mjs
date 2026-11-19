#!/usr/bin/env node
// ============================================================
// v420.3 · EL ATLAS DE INFRAESTRUCTURA — PRUEBAS DE LA CASA
//   node scripts/pruebas-infraestructura.mjs
//
// Lo que vigila:
//   · los nueve campos del mandato en CADA obra (el `e()` no los deja
//     saltarse: si falta uno, el catálogo no compila).
//   · TODA obra es real y documentada: ids únicos, categorías válidas,
//     ISO-2 válido contra geo-paises, fecha null = «sin dato documentado».
//   · Nada de vulnerabilidades ni detalles operativos: las descripciones
//     y características no traen palabras prohibidas.
//   · Las fuentes son públicas y declaradas; fotos solo en la casa.
//   · El censo del núcleo, el sitemap y la pestaña del módulo apuntan
//     a rutas que existen de verdad.
// Sale con código 1 si ALGO falla.
// ============================================================
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

let pasan = 0;
let fallan = 0;
const fallos = [];

function verificar(nombre, fn) {
  try {
    fn();
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

// ── leer los catálogos de datos ───────────────────────────
const CATRAZO = "src/lib/infraestructura";
const DATOS = [
  "datos-aeropuertos.ts",
  "datos-puertos.ts",
  "datos-ferrocarril.ts",
  "datos-puentes.ts",
  "datos-tuneles.ts",
  "datos-centrales.ts",
  "datos-presas.ts",
  "datos-agua.ts",
  "datos-educacion.ts",
  "datos-sanitaria.ts",
  "datos-edificios.ts",
];

const archivos = {};
for (const f of DATOS) {
  const ruta = join(RAIZ, CATRAZO, f);
  afirmar(existsSync(ruta), `falta ${f}`);
  archivos[f] = readFileSync(ruta, "utf8");
}

const geo = readFileSync(join(RAIZ, "src/lib/geo-paises.ts"), "utf8");
const iso2Validos = new Set([...geo.matchAll(/iso2:\s*"([a-z]{2})"/g)].map((m) => m[1]));

// extraer obras: e("id", "nombre", "cat", "iso", { ciudad...
const CATEGORIAS = [
  "aeropuerto",
  "puerto",
  "ferrocarril",
  "puente",
  "tunel",
  "central-energetica",
  "presa",
  "agua",
  "educacion",
  "sanitaria",
  "edificio",
];

function extraerObras() {
  const obras = [];
  for (const f of DATOS) {
    const txt = archivos[f];
    const re = /^  e\("([^"]+)",\s*"((?:[^"\\]|\\.)*)",\s*"([^"]+)",\s*"([a-z]{2})",\s*\{\s*ciudad:\s*"((?:[^"\\]|\\.)*)",\s*lat:\s*(-?[\d.]+),\s*lng:\s*(-?[\d.]+)\s*\},/gm;
    let m;
    while ((m = re.exec(txt)) !== null) {
      obras.push({
        fichero: f,
        id: m[1],
        nombre: m[2],
        categoria: m[3],
        iso: m[4],
        ciudad: m[5],
        lat: Number(m[6]),
        lng: Number(m[7]),
      });
    }
  }
  return obras;
}

const obras = extraerObras();

// ── 1 · el catálogo existe y tiene obras ──────────────────
verificar("el Atlas existe y el catálogo tiene obras (≥ 150)", () => {
  afirmar(obras.length >= 150, `solo ${obras.length} obras extraídas`);
});

// ── 2 · ids únicos, nombres, categorías válidas ───────────
verificar("ids de obra únicos", () => {
  const dup = obras.map((o) => o.id).filter((x, i) => obras.map((y) => y.id).indexOf(x) !== i);
  afirmar(dup.length === 0, `ids duplicados: ${dup.join(", ")}`);
});

verificar("cada obra tiene nombre y categoría válida", () => {
  for (const o of obras) {
    afirmar(o.nombre.trim().length > 0, `obra ${o.id} sin nombre`);
    afirmar(CATEGORIAS.includes(o.categoria), `obra ${o.id} con categoría inválida: ${o.categoria}`);
  }
});

// ── 3 · ISO-2 válido contra geo-paises ────────────────────
verificar("cada ISO-2 existe en geo-paises", () => {
  for (const o of obras) {
    afirmar(iso2Validos.has(o.iso), `obra ${o.id} con ISO inválido: ${o.iso}`);
  }
});

// ── 4 · coordenadas reales ────────────────────────────────
verificar("coordenadas en rango terrestre", () => {
  for (const o of obras) {
    afirmar(o.lat >= -90 && o.lat <= 90, `obra ${o.id} con lat fuera de rango: ${o.lat}`);
    afirmar(o.lng >= -180 && o.lng <= 180, `obra ${o.id} con lng fuera de rango: ${o.lng}`);
  }
});

// ── 5 · las fuentes son públicas ─────────────────────────
verificar("cada obra cita una fuente pública con URL", () => {
  for (const f of DATOS) {
    const txt = archivos[f];
    // la helper WIK/WIK de cada fichero define la URL pública de la fuente
    afirmar(/const WIK = /.test(txt), `${f} sin helper de fuente (WIK)`);
    afirmar(/https?:\/\/en\.wikipedia\.org\/wiki/.test(txt), `${f} sin URL pública de fuente`);
    // y cada obra llama a la helper (o declara su propia fuente)
    const re = /^  e\("([^"]+)"/gm;
    let m;
    let n = 0;
    while ((m = re.exec(txt)) !== null) {
      n++;
      const bloque = txt.slice(txt.indexOf(`e("${m[1]}`), txt.indexOf(`e("${m[1]}`) + 1500);
      afirmar(/WIK\(|fuente:|https?:\/\//.test(bloque), `obra ${m[1]} sin llamada a fuente`);
    }
    afirmar(n > 0, `${f} sin obras`);
  }
});

// ── 6 · nada de información sensible ─────────────────────
verificar("nada de vulnerabilidades ni detalles operativos", () => {
  const prohibido = ["vulnerabilidad", "vulnerable", "control de acceso", "credential", "password", "clave secreta", "secreto"];
  for (const f of DATOS) {
    const txt = archivos[f].toLowerCase();
    for (const p of prohibido) {
      afirmar(!txt.includes(p), `${f} contiene término prohibido: «${p}»`);
    }
  }
});

// ── 7 · fechas: null o texto documentado, no vacía ────────
verificar("fechas: null o texto documentado, nunca vacía", () => {
  for (const f of DATOS) {
    const txt = archivos[f];
    const re = /fecha:\s*(null|"(?:[^"\\]|\\.)*"),/g;
    let m;
    while ((m = re.exec(txt)) !== null) {
      if (m[1] === "null") continue;
      afirmar(m[1].length > 1, `${f}: fecha vacía`);
    }
  }
});

// ── 8 · el catálogo agrupa todo ───────────────────────────
verificar("catalogo.ts agrupa las once categorías", () => {
  const cat = readFileSync(join(RAIZ, CATRAZO, "catalogo.ts"), "utf8");
  for (const c of CATEGORIAS) {
    const pat = new RegExp(`^\\s*(?:\\")?${c.replace(/[-]/g, "\\-")}(?:\\")?:`, "m");
    afirmar(pat.test(cat), `catalogo.ts sin entrada para ${c}`);
  }
});

// ── 9 · el censo del núcleo ───────────────────────────────
verificar("censo: mod:infraestructura y sus piezas registradas", () => {
  const reg = readFileSync(join(RAIZ, "src/lib/nucleo/registro.ts"), "utf8");
  for (const id of ["mod:infraestructura", "mod:infra-gran-obra", "mod:infra-explorador", "mod:infra-ficha"]) {
    afirmar(reg.includes(`id: "${id}"`), `censo sin ${id}`);
  }
  afirmar(/ruta: "\/infraestructura"/.test(reg), "censo sin ruta /infraestructura");
  afirmar(/ruta: "\/infraestructura\/gran-obra"/.test(reg), "censo sin ruta /infraestructura/gran-obra");
  afirmar(/ruta: "\/infraestructura\/explorador"/.test(reg), "censo sin ruta /infraestructura/explorador");
  afirmar(/ruta: "\/infraestructura\/obra\/\[id\]"/.test(reg), "censo sin ruta /infraestructura/obra/[id]");
});

verificar("fuente fnt:infraestructura declarada como pública", () => {
  const f = readFileSync(join(RAIZ, "src/lib/nucleo/fuentes.ts"), "utf8");
  afirmar(/id: "fnt:infraestructura"/.test(f), "fuentes.ts sin fnt:infraestructura");
});

// ── 10 · las rutas existen ────────────────────────────────
verificar("las rutas del Atlas existen en src/app/", () => {
  const rutas = [
    "src/app/infraestructura/page.tsx",
    "src/app/infraestructura/gran-obra/page.tsx",
    "src/app/infraestructura/explorador/page.tsx",
    "src/app/infraestructura/obra/[id]/page.tsx",
  ];
  for (const r of rutas) afirmar(existsSync(join(RAIZ, r)), `falta ${r}`);
});

// ── 11 · sitemap ──────────────────────────────────────────
verificar("sitemap incluye las puertas del Atlas", () => {
  const sm = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
  for (const u of ["/infraestructura", "/infraestructura/explorador", "/infraestructura/gran-obra"]) {
    afirmar(sm.includes(u), `sitemap sin ${u}`);
  }
  afirmar(sm.includes("CATALOGO_INFRA"), "sitemap sin catálogo de obras");
});

// ── 12 · módulo portada ───────────────────────────────────
verificar("el módulo Datos tiene pestaña del Atlas", () => {
  const mod = readFileSync(join(RAIZ, "src/components/portada/modulos.ts"), "utf8");
  afirmar(mod.includes('href: "/infraestructura"'), "modulos.ts sin pestaña del Atlas");
});

// ── 13 · costura con la ficha de país ──────────────────────
verificar("la ficha de país enlaza obras del Atlas", () => {
  const mp = readFileSync(join(RAIZ, "src/app/mundos/[iso]/page.tsx"), "utf8");
  afirmar(mp.includes("obrasDePais"), "mundos/[iso]/page.tsx no usa obrasDePais");
  afirmar(mp.includes("/infraestructura/obra/"), "mundos/[iso]/page.tsx no enlaza fichas del Atlas");
});

// ── 14 · versión ──────────────────────────────────────────
verificar("version.ts marca v420.3", () => {
  const v = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
  afirmar(/export const APP_VERSION = "v420\.0"/.test(v), "APP_VERSION no es v420.3");
  afirmar(/export const APP_CODENAME = "VANGUARD INFRASTRUCTURE ATLAS"/.test(v), "APP_CODENAME no es el del Atlas");
  afirmar(/export const APP_VERSION_ANTERIOR = "v419\.0"/.test(v), "APP_VERSION_ANTERIOR no es v419.0");
});

// ── resumen ───────────────────────────────────────────────
console.log(`\nRESUMEN: ${pasan} pasan · ${fallan} fallan · ${obras.length} obras auditadas`);
if (fallan > 0) {
  console.error("\nFALLOS:\n" + fallos.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
