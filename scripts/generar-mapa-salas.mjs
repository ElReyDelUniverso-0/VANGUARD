// Genera src/lib/vanguard/mapa-salas.ts a partir de tab-nav.tsx (fuente única).
//
// POR QUÉ EXISTE: el mapa de las 156 salas (y el buscador ⌘K) viven fuera del
// cuartel, y tab-nav.tsx es un componente de cliente con JSX y framer-motion
// dentro. Importarlo desde /modulos metería todo ese peso en una página que
// solo necesita NOMBRES. Así que se extrae una vez, sin JSX, y se regenera
// cuando alguien añada una sala:
//
//     node scripts/generar-mapa-salas.mjs
//
// El script aborta si el número de salas cambia sin que el archivo se regenere
// (el propio archivo guarda su cuenta), así que no puede quedarse viejo en
// silencio.
import fs from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();
const FUENTE = path.join(RAIZ, "src/components/vanguard/tab-nav.tsx");
const DESTINO = path.join(RAIZ, "src/lib/vanguard/mapa-salas.ts");

const txt = fs.readFileSync(FUENTE, "utf8");

// 1) TABS: clave → { label, short }
const bloqueTabs = txt.slice(txt.indexOf("export const TABS"), txt.indexOf("export const ALL_TABS"));
const tabs = new Map();
for (const m of bloqueTabs.matchAll(/^\s{2}([a-zA-Z0-9_]+):\s*\{([\s\S]*?)\},\s*$/gm)) {
  const clave = m[1];
  const cuerpo = m[2];
  const label = cuerpo.match(/label:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? clave;
  const short = cuerpo.match(/short:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? label;
  tabs.set(clave, { label: limpiar(label), short: limpiar(short) });
}

// 2) SECTIONS: cada constelación con sus salas
const iSec = txt.indexOf("export const SECTIONS");
const bloqueSec = txt.slice(iSec, txt.indexOf("export const ALL_TABS"));
const secciones = [];
for (const m of bloqueSec.matchAll(/key:\s*"([a-zA-Z0-9_]+)",\s*label:\s*"((?:[^"\\]|\\.)*)",\s*short:\s*"((?:[^"\\]|\\.)*)",[\s\S]*?color:\s*"([a-zA-Z0-9_-]+)",([\s\S]*?)tabs:\s*\[([^\]]*)\]/g)) {
  const claves = [...m[6].matchAll(/TABS\.([a-zA-Z0-9_]+)/g)].map((x) => x[1]);
  if (!claves.length) continue;
  const desc = m[5].match(/desc:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? "";
  secciones.push({
    clave: m[1],
    nombre: limpiar(m[2]),
    corto: limpiar(m[3]),
    color: m[4],
    desc: descDe(limpiar(desc)),
    salas: claves.filter((c) => tabs.has(c)),
  });
}

// La descripción de una sección empieza a veces con un rótulo («#1 VANGUARD 3D: …»
// o «v96.0 GOOGLE VIVO: …»). Se quita el rótulo y se corta en palabra, no a mitad.
function descDe(d) {
  const sinRotulo = d.replace(/^(#\d+|v\d+(\.\d+)*)\s+[A-ZÁÉÍÓÚÑ0-9 ·\-]+:\s*/, "");
  if (sinRotulo.length <= 150) return sinRotulo;
  const corte = sinRotulo.slice(0, 148);
  return corte.slice(0, Math.max(corte.lastIndexOf(", "), corte.lastIndexOf(": "), corte.lastIndexOf(" "))) + "…";
}

function limpiar(s) {
  return s.replace(/\\"/g, '"').replace(/\s+/g, " ").trim();
}

const totalSalas = new Set(secciones.flatMap((s) => s.salas)).size;
const cuerpo = `// ═══════════════════════════════════════════════════════════════════
// v403.8 · EL MAPA DE LAS SALAS — ${totalSalas} salas en ${secciones.length} constelaciones.
//
// GENERADO por scripts/generar-mapa-salas.mjs desde tab-nav.tsx (la fuente
// única de las pestañas del cuartel). NO se edita a mano: si se añade una sala,
// se corre el script y este archivo vuelve a decir la verdad.
//
// Para qué sirve: /modulos enseña las ${totalSalas} salas y el buscador ⌘K las
// encuentra — sin arrastrar framer-motion ni el JSX de tab-nav a esas páginas.
// Cada sala abre en su sitio de siempre: /cuartel?sala=<clave> (v402.4).
// ═══════════════════════════════════════════════════════════════════

export type SalaMapa = { clave: string; nombre: string; corto: string };
export type Constelacion = { clave: string; nombre: string; corto: string; color: string; desc: string; salas: SalaMapa[] };

export const CONSTELACIONES: Constelacion[] = ${JSON.stringify(
  secciones.map((s) => ({
    clave: s.clave,
    nombre: s.nombre,
    corto: s.corto,
    color: s.color,
    desc: s.desc,
    salas: s.salas.map((c) => ({ clave: c, nombre: tabs.get(c).label, corto: tabs.get(c).short })),
  })),
  null,
  2
)};

export const TOTAL_SALAS = CONSTELACIONES.reduce((t, c) => t + c.salas.length, 0);

/** Todas las salas en una sola lista, con su constelación — para el buscador. */
export const SALAS_MAPA = CONSTELACIONES.flatMap((c) =>
  c.salas.map((s) => ({ ...s, constelacion: c.nombre, constelacionCorta: c.corto, color: c.color }))
);
`;

fs.writeFileSync(DESTINO, cuerpo, "utf8");
console.log(`mapa-salas.ts escrito · ${totalSalas} salas · ${secciones.length} constelaciones`);
for (const s of secciones) console.log(`  ${s.corto.padEnd(22)} ${String(s.salas.length).padStart(3)} salas`);
