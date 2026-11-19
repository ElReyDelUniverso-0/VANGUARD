#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// v416.0 · PRUEBAS DEL CENTRO DE DATOS MUNDIALES — departamento 4
//
// Qué comprueba, y por qué cada cosa importa:
//   1. El catálogo está íntegro: 52 indicadores, 9 categorías, y CADA uno con
//      código, unidad, método, fuente, licencia y enlace. Si alguien añade un
//      indicador sin fuente, la prueba falla: es la regla del encargo.
//   2. No hay códigos ni ids duplicados (un duplicado rompe los rankings).
//   3. Los ficheros de las cuatro puertas existen y están registrados en el
//      Núcleo, el catálogo de endpoints y la bitácora.
//   4. En vivo (si hay red): el Banco Mundial responde, una serie trae años
//      crecientes sin repetidos, el ranking de un año fijo devuelve SOLO ese
//      año, el modo «reciente» trae los años en cada fila, y la explicación de
//      la diferencia se redacta con su ratio y su aviso de años distintos.
//   5. La API /api/mundial respeta el contrato v407.0 cuando se le pasa una
//      base (producción): {ok, api, version, datos, meta}.
//
// Uso:
//   node scripts/pruebas-mundial.mjs                        (solo código)
//   node scripts/pruebas-mundial.mjs https://mi-dominio     (código + en vivo)
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

// ── 1. Catálogo, leyendo el TypeScript como texto (sin compilar la casa) ───
const cat = readFileSync("src/lib/mundial/catalogo.ts", "utf8");
const bloques = [...cat.matchAll(/\{\s*id:\s*"([a-z0-9_]+)",[\s\S]*?urlDefinicion:\s*base\("([A-Z0-9.]+)"\)/g)];
comprobar(bloques.length >= 45, `catálogo: ${bloques.length} indicadores declarados (mínimo 45)`);
const ids = bloques.map((b) => b[1]);
const codigos = bloques.map((b) => b[2]);
comprobar(new Set(ids).size === ids.length, `ids únicos (${ids.length})`);
comprobar(new Set(codigos).size === codigos.length, `códigos del Banco Mundial únicos (${codigos.length})`);

const categorias = [...cat.matchAll(/\{\s*id:\s*"(poblacion|economia|educacion|salud|energia|agricultura|comercio|ambiente|desarrollo)",\s*nombre:\s*"[^"]+",\s*resumen:/g)];
comprobar(categorias.length === 9, `nueve categorías declaradas (${categorias.length})`);

const camposObligatorios = ["codigo", "unidad", "formato", "sentido", "metodo", "fuente", "licencia", "urlDefinicion"];
const faltas = [];
for (const m of cat.matchAll(/\{\s*id:\s*"([a-z0-9_]+)",[\s\S]*?urlDefinicion:\s*base\("([A-Z0-9.]+)"\)/g)) {
  const trozo = m[0];
  for (const c of camposObligatorios) if (!new RegExp(`${c}:`).test(trozo)) faltas.push(`${m[1]} sin ${c}`);
}
comprobar(faltas.length === 0, `cada indicador declara código, unidad, formato, sentido, método, fuente, licencia y enlace${faltas.length ? ` — faltan: ${faltas.slice(0, 4).join(", ")}` : ""}`);

const sinMetodo = ids.filter((id, i) => !/metodo:\s*"[^"]{40,}"/.test(bloques[i][0]));
comprobar(sinMetodo.length === 0, `método explicado con detalle (40+ caracteres) en los ${ids.length} indicadores`);

// ── 2. Los ficheros de las puertas y los registros ────────────────────────
const puertas = [
  "src/app/datos-mundiales/page.tsx",
  "src/app/datos-mundiales/comparar/page.tsx",
  "src/app/datos-mundiales/pais/[iso]/page.tsx",
  "src/app/datos-mundiales/panel/page.tsx",
  "src/app/api/mundial/route.ts",
  "src/lib/mundial/banco.ts",
  "src/lib/mundial/explicar.ts",
  "src/lib/mundial/formato.ts",
];
for (const p of puertas) comprobar(existsSync(p), `existe ${p}`);

const registro = readFileSync("src/lib/nucleo/registro.ts", "utf8");
for (const id of ["mod:datos-mundiales", "mod:comparador-mundial", "mod:panel-desarrollo", "mod:ficha-datos-pais"]) {
  comprobar(registro.includes(`"${id}"`), `el Núcleo registra ${id}`);
}
const catalogoApi = readFileSync("src/lib/api/catalogo.ts", "utf8");
comprobar(catalogoApi.includes('ruta:"/api/mundial"'), "el catálogo de endpoints documenta /api/mundial");
const bitacora = readFileSync("src/lib/bitacora.ts", "utf8");
comprobar(/version:\s*"v416\.0"/.test(bitacora), "la bitácora tiene la entrada v416.0");
const version = readFileSync("src/lib/version.ts", "utf8");
comprobar(/APP_VERSION\s*=\s*"v416\.0"/.test(version), "APP_VERSION es v416.0");

// ── 3. La regla del encargo, escrita en el código ─────────────────────────
const banco = readFileSync("src/lib/mundial/banco.ts", "utf8");
comprobar(/mrnev=1/.test(banco), "el ranking «reciente» pide el último dato por país a la fuente (mrnev=1)");
const explicar = readFileSync("src/lib/mundial/explicar.ts", "utf8");
comprobar(/no son del mismo año/.test(explicar), "la explicación avisa cuando los dos datos no son del mismo año");
const interfaz = readFileSync("src/components/mundial/grafico-lineas.tsx", "utf8");
comprobar(/p\.anio - puntos\[i - 1\]\.anio > 1/.test(interfaz), "el gráfico corta la línea cuando falta un año (no une huecos)");

// ── 4. En vivo, con datos reales (opcional, requiere red) ─────────────────
async function enVivo() {
  const wb = (u) => fetch(u, { headers: { "user-agent": "VanguardPruebas/416.0" } }).then((r) => (r.ok ? r.json() : null));
  const pob = await wb("https://api.worldbank.org/v2/country/do/indicator/SP.POP.TOTL?format=json&per_page=200&date=1990:2025");
  comprobar(Array.isArray(pob) && Array.isArray(pob[1]) && pob[1].length > 20, `Banco Mundial en vivo: ${pob?.[1]?.length ?? 0} años de población de DO`);

  const fijo = await wb("https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&per_page=400&date=2023");
  const filas = (fijo?.[1] ?? []).filter((f) => f.value !== null);
  comprobar(filas.length > 100, `ranking de un año fijo: ${filas.length} países con dato en 2023`);
  comprobar(filas.every((f) => f.date === "2023"), "todas las filas del ranking fijo son del mismo año");

  const reciente = await wb("https://api.worldbank.org/v2/country/all/indicator/SE.ADT.LITR.ZS?format=json&per_page=400&mrnev=1");
  const rr = (reciente?.[1] ?? []).filter((f) => f.value !== null);
  const anios = [...new Set(rr.map((f) => f.date))];
  comprobar(rr.length > 50 && anios.length > 1, `ranking «reciente»: ${rr.length} países, ${anios.length} años distintos — y cada fila trae el suyo`);
}

// ── 5. La API en producción, con el contrato de la casa ───────────────────
async function api(base) {
  const t = await fetch(`${base}/api/mundial?seccion=catalogo`).then((r) => r.json());
  comprobar(t && t.ok === true && t.api === "1" && typeof t.version === "string", `contrato de /api/mundial en ${base}: ok/api/version`);
  comprobar(t?.datos?.catalogo?.total >= 45, `la API sirve el catálogo (${t?.datos?.catalogo?.total ?? 0} indicadores)`);
  comprobar(Array.isArray(t?.datos?.reglas) && t.datos.reglas.length >= 4, "la API declara sus cuatro reglas de honestidad");

  const cmp = await fetch(`${base}/api/mundial?seccion=comparar&paises=do,ht&indicadores=poblacion,esperanza_vida`).then((r) => r.json());
  const b0 = cmp?.datos?.comparacion?.bloques?.[0];
  comprobar(!!b0 && b0.cifras.length === 2 && typeof b0.explicaciones?.[0]?.texto === "string", "comparar DO/HT devuelve dos cifras y una explicación redactada");
  comprobar(/veces|supera|misma/.test(b0?.explicaciones?.[0]?.texto ?? ""), "la explicación dice la relación, no solo el número");

  const rk = await fetch(`${base}/api/mundial?seccion=ranking&indicador=pib_pc&anio=2023`).then((r) => r.json());
  comprobar(rk?.datos?.ranking?.filas?.length > 100, `ranking en vivo: ${rk?.datos?.ranking?.filas?.length ?? 0} filas`);
  comprobar(rk?.datos?.ranking?.filas?.every((f) => f.anio === 2023), "el ranking fijo no mezcla años");

  const pan = await fetch(`${base}/api/mundial?seccion=panel&indicador=esperanza_vida&agregados=WLD,LCN`).then((r) => r.json());
  comprobar(pan?.datos?.panel?.series?.length === 2, "el panel devuelve los dos agregados pedidos");

  const malo = await fetch(`${base}/api/mundial?seccion=ranking&indicador=no-existe`);
  comprobar(malo.status >= 400, `un indicador inventado no devuelve datos (HTTP ${malo.status})`);

  const pagina = await fetch(`${base}/datos-mundiales`);
  comprobar(pagina.status === 200, `la página /datos-mundiales responde 200 (HTTP ${pagina.status})`);
  const comparar = await fetch(`${base}/datos-mundiales/comparar?paises=do,ht&indicadores=poblacion,pib_pc`);
  comprobar(comparar.status === 200, `la página /datos-mundiales/comparar responde 200 (HTTP ${comparar.status})`);
  const ficha = await fetch(`${base}/datos-mundiales/pais/do`);
  comprobar(ficha.status === 200, `la ficha de país responde 200 (HTTP ${ficha.status})`);
}

const hayRed = await fetch("https://api.worldbank.org/v2/country/DO?format=json", { signal: AbortSignal.timeout(8000) })
  .then((r) => r.ok)
  .catch(() => false);
comprobar(hayRed, "hay red hacia el Banco Mundial (si no, las comprobaciones en vivo se declaran omitidas)");
if (hayRed) await enVivo();
if (BASE) await api(BASE.replace(/\/$/, ""));

console.log(`\n${ok} ✓ · ${mal} ✗${BASE ? ` · base ${BASE}` : " · solo código"}`);
if (mal > 0) {
  console.log("\nFallos:");
  for (const f of fallos) console.log(` · ${f}`);
  process.exit(1);
}