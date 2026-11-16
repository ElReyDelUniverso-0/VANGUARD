// Genera src/lib/vanguard/puertas-salas.ts — el texto de la puerta pública de
// cada sala (/sala/<clave>), sacado SOLO de lo que la casa ya enseña.
//
// POR QUÉ EXISTE (v405.2 LAS PUERTAS DE LAS SALAS): las 155 salas viven dentro
// de /cuartel como paneles de cliente (next/dynamic ssr:false). Para Google son
// invisibles: /cuartel?sala=<clave> lleva canónica /cuartel y su HTML no trae ni
// una línea de la sala. /sala/<clave> es la puerta que se puede encontrar.
//
// LA REGLA: aquí no se escribe ni una palabra nueva. Los textos salen de:
//   ① el rótulo de la sala en tab-nav.tsx (vía mapa-salas.ts, ya generado):
//      «SISMO (red sismológica global)» → lema «red sismológica global»;
//   ② las tarjetas que la propia casa enseña y que ABREN ESA MISMA SALA
//      (objetos `{ tab: "<clave>", …, desc: "…" }`) en FUENTES_FIABLES.
// NO se usa src/lib/vanguard/salas.ts: es el catálogo v170 de otra red y reusa
// claves con otro significado (su «sismo» dice USGS; el panel sismo no lo usa).
//
// INDEXABLE: solo si la sala tiene ≥ MIN_TEXTO caracteres de texto real y no es
// una sala personal/utilitaria. Las demás tienen puerta igual (se comparten,
// enlazan a su constelación) pero con «noindex, follow» y fuera del sitemap: una
// página de una línea es contenido pobre y le resta a todo el sitio. Cuando una
// sala gana descripción real en su tarjeta, se corre el script y entra sola.
//
//     node scripts/generar-mapa-salas.mjs     # si cambió tab-nav
//     node scripts/generar-puertas-salas.mjs
import fs from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();
const MAPA = path.join(RAIZ, "src/lib/vanguard/mapa-salas.ts");
const DESTINO = path.join(RAIZ, "src/lib/vanguard/puertas-salas.ts");
const FUENTES_FIABLES = [
  "src/components/vanguard/home-panel.tsx",
  "src/components/vanguard/navegador.tsx",
  "src/components/vanguard/puerta-vigo.tsx",
];
const MIN_TEXTO = 45; // una frase real completa además del título
// salas que no son un destino de búsqueda: las del visitante (su perfil, sus
// avisos, su informe de regreso…) y las internas de la casa (bitácora de
// novedades — /novedades ya es SALAS_INTERNAS noindex —, blindajes, agentes
// que pulen el código). Tienen puerta, pero no se ofrecen a Google.
const NO_DESTINO = new Set([
  "inicio", "nueva", "perfil", "identidad", "notificaciones", "registro", "estadisticas", "ayuda",
  "ajustes", "cama", "logros", "recompensas", "ranking", "racha", "amigos", "tienda", "fusion", "sistema",
  "cambios", "analista", "novedades", "fortaleza", "atelier", "arquitecto", "agentes",
]);

const mapa = fs.readFileSync(MAPA, "utf8");
const ini = mapa.indexOf("CONSTELACIONES: Constelacion[] = ") + "CONSTELACIONES: Constelacion[] = ".length;
const CONSTELACIONES = JSON.parse(mapa.slice(ini, mapa.indexOf("\n];", ini) + 2));
const SALAS = CONSTELACIONES.flatMap((c) => c.salas);

const limpiar = (s) =>
  s.replace(/\\"/g, '"').replace(/\\n/g, " ").replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
const sinRotulo = (s) => s.replace(/^#\d+\s+/, "").trim(); // «#1 VANGUARD 3D» → «VANGUARD 3D»
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

// «a no añade nada a b» si b lo contiene o si ≥ 60 % de las palabras de a ya están en b
const palabras = (n) => new Set(n.split(" ").filter((w) => w.length > 2));
function parecido(a, b) {
  if (!a || !b) return false;
  if (b.includes(a)) return true;
  const A = palabras(a), B = palabras(b);
  if (!A.size) return true;
  return [...A].filter((w) => B.has(w)).length / A.size >= 0.6;
}

// ② tarjetas { tab: "x", title|titulo|nombre: "…", desc: "…" }
const tarjetas = new Map(); // clave → [{ titulo, desc, fuente }]
for (const rel of FUENTES_FIABLES) {
  const txt = fs.readFileSync(path.join(RAIZ, rel), "utf8");
  for (const m of txt.matchAll(/\{[^{}]*?\btab\s*:\s*"([a-zA-Z0-9_]+)"[^{}]*?\}/g)) {
    const cuerpo = m[0];
    const desc = cuerpo.match(/\bdesc\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1];
    if (!desc) continue;
    const titulo = cuerpo.match(/\b(?:title|titulo|nombre)\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ?? "";
    const lista = tarjetas.get(m[1]) ?? [];
    lista.push({ titulo: sinRotulo(limpiar(titulo)), desc: limpiar(desc), fuente: path.basename(rel) });
    tarjetas.set(m[1], lista);
  }
}

const salida = {};
let indexables = 0;
for (const s of SALAS) {
  const par = s.nombre.match(/^(.*?)\s*\((.+)\)\s*$/);
  const titulo = limpiar(par ? par[1] : s.nombre);
  const lema = par ? limpiar(par[2]) : "";
  const textos = [];
  const otrosNombres = [];
  const propias = tarjetas.get(s.clave) ?? [];
  // el texto más completo primero; fuera los repetidos o contenidos en otro (o en el lema)
  for (const t of [...propias].sort((a, b) => b.desc.length - a.desc.length)) {
    const n = norm(t.desc);
    if (n.length < 12 || parecido(n, norm(lema)) || textos.some((x) => parecido(n, norm(x)))) continue;
    textos.push(t.desc);
  }
  for (const t of propias)
    if (t.titulo && norm(t.titulo) !== norm(titulo) && !otrosNombres.some((o) => norm(o) === norm(t.titulo)))
      otrosNombres.push(t.titulo);
  const largo = lema.length + textos.reduce((a, t) => a + t.length, 0);
  const indexable = !NO_DESTINO.has(s.clave) && largo >= MIN_TEXTO;
  if (indexable) indexables++;
  salida[s.clave] = { titulo, lema, textos, otrosNombres, indexable };
}

const cabecera = `// ═══════════════════════════════════════════════════════════════════
// v405.2 · LAS PUERTAS DE LAS SALAS — el texto público de /sala/<clave>.
//
// GENERADO por scripts/generar-puertas-salas.mjs. NO se edita a mano.
// Cero texto nuevo: lema = paréntesis del rótulo de tab-nav; textos = las
// tarjetas de la casa que abren ESA sala (${FUENTES_FIABLES.map((f) => path.basename(f)).join(", ")}).
// indexable = ≥ ${MIN_TEXTO} caracteres reales y no es sala personal ni interna.
// ${SALAS.length} puertas · ${indexables} indexables.
// Solo lo importan páginas de servidor (no viaja al bundle del ⌘K).
// ═══════════════════════════════════════════════════════════════════

export type PuertaSala = {
  titulo: string;
  lema: string;
  textos: string[];
  otrosNombres: string[];
  indexable: boolean;
};

export const TOTAL_PUERTAS = ${SALAS.length};
export const TOTAL_INDEXABLES = ${indexables};

export const PUERTAS_SALAS: Record<string, PuertaSala> = ${JSON.stringify(salida, null, 2)};
`;
fs.writeFileSync(DESTINO, cabecera);
console.log(`puertas-salas.ts: ${SALAS.length} puertas, ${indexables} indexables`);
