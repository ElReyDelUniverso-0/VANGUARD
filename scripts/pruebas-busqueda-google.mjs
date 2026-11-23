// ============================================================
// v415.0 · Pruebas de VANGUARD SEARCH OPPORTUNITIES
//
//   node scripts/pruebas-busqueda-google.mjs
//
// PARTE A — sin red ni credenciales:
//   · el análisis (src/lib/busqueda-google/analisis.ts) aplica cada regla con
//     filas de PRUEBA construidas aquí (no salen nunca en la web)
//   · el cliente, sin variables GSC_*, dice «no configurado» y no inventa
//   · el JWT de la cuenta de servicio se firma con RS256 y verifica
//   · el acceso a datos exige sesión del Dueño Y secretos propios
//   · ningún archivo del módulo contiene filas de ejemplo ni promesas de puesto
// Sale con código 1 si algo falla.
// ============================================================
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { generateKeyPairSync, createVerify } from "node:crypto";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const RAIZ = process.cwd();
const { createJiti } = require(join(RAIZ, "node_modules/jiti"));
const jiti = createJiti(import.meta.url, { alias: { "@": join(RAIZ, "src") }, interopDefault: true });

let pasan = 0;
let fallan = 0;
async function prueba(nombre, fn) {
  try {
    await fn();
    pasan++;
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallan++;
    console.log(`  ✗ ${nombre}\n      ${e?.message ?? e}`);
  }
}
function afirmar(c, m) {
  if (!c) throw new Error(m);
}

// Limpia cualquier credencial del entorno: la parte A nunca habla con Google.
for (const k of Object.keys(process.env)) if (k.startsWith("GSC_")) delete process.env[k];
delete process.env.AUTH_SECRET;
delete process.env.OWNER_PASSWORD;

const A = await jiti.import(join(RAIZ, "src/lib/busqueda-google/analisis.ts"));
const C = await jiti.import(join(RAIZ, "src/lib/busqueda-google/cliente.ts"));

const BASE = "https://vanguard.vanguard-casa.workers.dev";
const PAGINAS = [
  { ruta: "/", nombre: "Portada", categoria: "Portada", buscar: "portada conflictos mundiales", importante: true },
  { ruta: "/rankings", nombre: "Rankings mundiales", categoria: "Planeta", buscar: "ranking paises pib poblacion esperanza de vida", importante: true },
  { ruta: "/comparador", nombre: "Comparador de países", categoria: "Planeta", buscar: "comparar paises pib poblacion", importante: true },
  { ruta: "/organizaciones", nombre: "Organizaciones internacionales", categoria: "Planeta", buscar: "otan brics g20 opep asean miembros", importante: true },
  { ruta: "/demografia", nombre: "Demografía mundial", categoria: "Planeta", buscar: "poblacion natalidad envejecimiento", importante: true },
  { ruta: "/sala-interna", nombre: "Sala interna", categoria: "Sistema", buscar: "interna", importante: false },
];
const f = (consulta, ruta, impresiones, clics, posicion) => ({
  consulta,
  pagina: BASE + ruta,
  impresiones,
  clics,
  ctr: impresiones ? clics / impresiones : 0,
  posicion,
});
// Filas de PRUEBA (solo para este script).
const FILAS = [
  // referencia de la franja 1–3: CTR alto
  f("vanguard", "/", 400, 160, 1.2),
  f("ranking pib paises", "/rankings", 300, 90, 2.1),
  // franja 1–3, CTR muy por debajo → CTR_BAJO
  f("miembros de la otan", "/organizaciones", 250, 2, 2.6),
  // franja 4–10 con referencia
  f("comparar paises", "/comparador", 200, 20, 6),
  // página con clics en posición 8–20 → CONTENIDO_A_MEJORAR (por página)
  f("natalidad mundial", "/demografia", 120, 3, 12),
  // canibalización: misma consulta, dos páginas con ≥10 impresiones
  f("pib por pais", "/rankings", 80, 4, 9),
  f("pib por pais", "/comparador", 60, 1, 14),
  // página mejor: la consulta es de organizaciones pero Google muestra la portada
  f("brics miembros", "/", 90, 1, 15),
  // hueco: nadie trata la consulta y está muy abajo
  f("receta de pupusas salvadoreñas", "/", 70, 0, 48),
  // un país → ficha /mundos/do vía paisDe
  f("republica dominicana pib", "/", 50, 0, 30),
];
const POR_PAGINA = [
  { pagina: BASE + "/", impresiones: 700, clics: 170, ctr: 170 / 700, posicion: 8 },
  { pagina: BASE + "/rankings", impresiones: 400, clics: 95, ctr: 0.24, posicion: 3 },
  { pagina: BASE + "/organizaciones", impresiones: 260, clics: 2, ctr: 0.008, posicion: 2.6 },
  { pagina: BASE + "/comparador", impresiones: 270, clics: 21, ctr: 0.08, posicion: 8.4 },
  { pagina: BASE + "/demografia", impresiones: 130, clics: 3, ctr: 0.023, posicion: 12 },
];
const paisDe = (q) => (/dominicana/.test(A.normalizar(q)) ? { ruta: "/mundos/do", nombre: "Ficha de República Dominicana" } : null);

console.log("PARTE A — análisis, cliente y acceso (sin red)");

const inf = A.analizar({ filas: FILAS, paginasGoogle: POR_PAGINA, paginas: PAGINAS, rutasSitemap: new Set(["/", "/rankings", "/comparador", "/organizaciones"]), base: BASE, paisDe });
const de = (t) => inf.oportunidades.filter((o) => o.tipo === t);

await prueba("normalizar quita acentos y mayúsculas; rutaDeUrl quita dominio, query y barra final", () => {
  afirmar(A.normalizar("Demografía  MUNDIAL") === "demografia mundial", A.normalizar("Demografía  MUNDIAL"));
  afirmar(A.rutaDeUrl(BASE + "/rankings/?x=1#a") === "/rankings", A.rutaDeUrl(BASE + "/rankings/?x=1#a"));
  afirmar(A.rutaDeUrl(BASE + "/") === "/", "la raíz debe quedar como /");
});

await prueba("la referencia de CTR es la propia casa por franja, y una franja pequeña queda «sin dato»", () => {
  const f13 = inf.franjas.find((x) => x.franja === "1–3");
  afirmar(f13 && f13.ctr !== null && Math.abs(f13.ctr - 252 / 950) < 1e-9, `franja 1–3: ${JSON.stringify(f13)}`);
  const f21 = inf.franjas.find((x) => x.franja === "21+");
  afirmar(f21 && f21.impresiones === 120 && f21.ctr === 0, `franja 21+ con 120 impresiones: ${JSON.stringify(f21)}`);
  const pequena = A.franjasCtr([f("algo", "/", 99, 5, 2)]).find((x) => x.franja === "1–3");
  afirmar(pequena && pequena.ctr === null, `con 99 impresiones la franja no es referencia: ${JSON.stringify(pequena)}`);
  const sinRef = A.analizar({ filas: [f("algo poco visto", "/rankings", 99, 0, 2)], paginasGoogle: [], paginas: PAGINAS.filter((p) => !p.importante), base: BASE });
  afirmar(!sinRef.oportunidades.some((o) => o.tipo === "CTR_BAJO"), "sin referencia no se aplica la regla de CTR bajo");
});

await prueba("CTR_BAJO detecta «miembros de la otan» (2/250 en posición 2,6) y no la marca propia", () => {
  const o = de("CTR_BAJO");
  afirmar(o.some((x) => x.consulta === "miembros de la otan" && x.ruta === "/organizaciones"), JSON.stringify(o.map((x) => x.consulta)));
  afirmar(!o.some((x) => x.consulta === "vanguard"), "la consulta de marca no debe salir");
  afirmar(o.every((x) => x.referencia && x.ctr !== null && x.ctr < x.referencia.ctr * A.UMBRALES.fraccionCtrBajo), "CTR por debajo de la mitad de la referencia");
});

await prueba("CONTENIDO_A_MEJORAR marca /demografia (clics en posición 12)", () => {
  const o = de("CONTENIDO_A_MEJORAR");
  afirmar(o.some((x) => x.ruta === "/demografia"), JSON.stringify(o.map((x) => x.ruta)));
  afirmar(!o.some((x) => x.ruta === "/rankings"), "/rankings está en posición 3: no debe salir");
});

await prueba("SIN_IMPRESIONES: solo puertas importantes sin impresiones; nunca inventa posición", () => {
  const o = de("SIN_IMPRESIONES");
  afirmar(o.length === 0, `todas las importantes tienen impresiones aquí: ${JSON.stringify(o.map((x) => x.ruta))}`);
  const otra = A.analizar({ filas: [], paginasGoogle: [], paginas: PAGINAS, rutasSitemap: new Set(["/"]), base: BASE });
  const s = otra.oportunidades.filter((x) => x.tipo === "SIN_IMPRESIONES");
  afirmar(s.length === 5, `5 importantes, salieron ${s.length}`);
  afirmar(!s.some((x) => x.ruta === "/sala-interna"), "una sala no importante no debe salir");
  afirmar(s.every((x) => x.posicion === null && x.ctr === null && x.impresiones === 0), "posición y CTR deben ser null");
  afirmar(s.some((x) => x.ruta === "/rankings" && /sitemap/i.test(x.detectada + x.accion)), "debe avisar si falta en el sitemap");
  afirmar(otra.control.paginasImportantesSinImpresiones === 5, "cifra de control");
});

await prueba("CANIBALIZACION: «pib por pais» repartida entre /rankings y /comparador", () => {
  const o = de("CANIBALIZACION");
  afirmar(o.some((x) => x.consulta === "pib por pais"), JSON.stringify(o.map((x) => x.consulta)));
});

await prueba("PAGINA_MEJOR: «brics miembros» propone /organizaciones; un país propone su ficha", () => {
  const o = de("PAGINA_MEJOR");
  afirmar(o.some((x) => x.consulta === "brics miembros" && x.sugerida?.ruta === "/organizaciones"), JSON.stringify(o.map((x) => [x.consulta, x.sugerida])));
  afirmar(o.some((x) => x.consulta === "republica dominicana pib" && x.sugerida?.ruta === "/mundos/do"), "ficha de país");
});

await prueba("HUECO: «receta de pupusas salvadoreñas» no la trata ninguna página", () => {
  const o = de("HUECO");
  afirmar(o.some((x) => x.consulta === "receta de pupusas salvadoreñas"), JSON.stringify(o.map((x) => x.consulta)));
});

await prueba("cada oportunidad trae las 8 columnas y ninguna acción promete un puesto", () => {
  afirmar(inf.oportunidades.length > 0, "sin oportunidades");
  for (const o of inf.oportunidades) {
    afirmar(typeof o.detectada === "string" && o.detectada.length > 10, `detectada vacía en ${o.id}`);
    afirmar(typeof o.accion === "string" && o.accion.length > 10, `acción vacía en ${o.id}`);
    afirmar(typeof o.impresiones === "number" && typeof o.clics === "number", `cifras en ${o.id}`);
    afirmar(!/primer (puesto|lugar)|top ?1|garantiz|asegura(mos)? (el|la) (posici|puesto)|posición 1\b/i.test(o.accion + " " + o.detectada), `promesa en ${o.id}: ${o.accion}`);
  }
  const ids = new Set(inf.oportunidades.map((o) => o.id));
  afirmar(ids.size === inf.oportunidades.length, "ids repetidos");
});

await prueba("agrupa por tipo y por categoría con las mismas cuentas", () => {
  const suma = inf.porTipo.reduce((s, t) => s + t.cuantas, 0);
  afirmar(suma === inf.oportunidades.length, `${suma} ≠ ${inf.oportunidades.length}`);
  const sumaCat = inf.porCategoria.reduce((s, c) => s + c.cuantas, 0);
  afirmar(sumaCat === inf.oportunidades.length, `${sumaCat} ≠ ${inf.oportunidades.length}`);
});

await prueba("sin filas no hay oportunidades de consulta (no se inventan)", () => {
  const vacio = A.analizar({ filas: [], paginasGoogle: [], paginas: PAGINAS.filter((p) => !p.importante), base: BASE });
  afirmar(vacio.oportunidades.length === 0, `salieron ${vacio.oportunidades.length}`);
});

await prueba("cliente sin variables GSC_*: «no configurado», sin token ni llamada", async () => {
  const cfg = C.configuracion();
  afirmar(cfg.lista === false && cfg.modo === null, JSON.stringify(cfg));
  afirmar(cfg.sitio === "https://vanguard.vanguard-casa.workers.dev/", `sitio por defecto: ${cfg.sitio}`);
  let error = null;
  try {
    await C.tokenDeAcceso();
  } catch (e) {
    error = e;
  }
  afirmar(error instanceof C.ErrorGoogle && error.paso === "token", `debía fallar en el paso token: ${error}`);
});

await prueba("periodo(28) termina hace tres días y dura 28 días", () => {
  const p = C.periodo(28, new Date("2026-11-14T12:00:00Z"));
  afirmar(p.fin === "2026-11-11" && p.inicio === "2026-10-15" && p.dias === 28, JSON.stringify(p));
});

await prueba("el JWT de la cuenta de servicio se firma con RS256 y verifica con la clave pública", () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" });
  const jwt = C.firmarJwt("prueba@proyecto.iam.gserviceaccount.com", pem, 1_800_000_000);
  const [h, p, s] = jwt.split(".");
  const cab = JSON.parse(Buffer.from(h, "base64url").toString());
  const cue = JSON.parse(Buffer.from(p, "base64url").toString());
  afirmar(cab.alg === "RS256", "alg");
  afirmar(cue.scope === "https://www.googleapis.com/auth/webmasters.readonly", `scope de solo lectura: ${cue.scope}`);
  afirmar(cue.aud === "https://oauth2.googleapis.com/token" && cue.exp - cue.iat === 3600, "aud/exp");
  const v = createVerify("RSA-SHA256");
  v.update(`${h}.${p}`);
  afirmar(v.verify(publicKey, Buffer.from(s, "base64url")), "firma inválida");
});

await prueba("credenciales de cuenta de servicio en base64 se reconocen (y no se exponen)", () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 1024 });
  const json = JSON.stringify({ type: "service_account", client_email: "lector@mi-proyecto.iam.gserviceaccount.com", private_key: privateKey.export({ type: "pkcs8", format: "pem" }) });
  process.env.GSC_SERVICE_ACCOUNT_JSON = Buffer.from(json).toString("base64");
  try {
    const cfg = C.configuracion();
    afirmar(cfg.lista && cfg.modo === "cuenta-servicio", JSON.stringify(cfg));
    const texto = JSON.stringify(cfg);
    afirmar(!texto.includes("PRIVATE KEY") && !texto.includes("lector@"), `se filtra un secreto: ${texto}`);
  } finally {
    delete process.env.GSC_SERVICE_ACCOUNT_JSON;
  }
});

await prueba("acceso: sin sesión no; Dueño con secretos de reserva no; Dueño blindado sí", async () => {
  const ACC = await jiti.import(join(RAIZ, "src/lib/busqueda-google/acceso.ts"));
  const AUTH = await jiti.import(join(RAIZ, "src/lib/auth-server.ts"));
  afirmar(!ACC.accesoADatos(null).permitido, "anónimo");
  const tokReserva = AUTH.createSessionToken(AUTH.OWNER_USERNAME);
  afirmar(AUTH.verifySessionToken(tokReserva) === "DUENO", "el token de reserva es válido como sesión…");
  afirmar(!ACC.accesoADatos(tokReserva).permitido, "…pero no abre los datos privados");
  // Con secretos propios (auth-server lee AUTH_SECRET al cargar: módulos frescos)
  process.env.AUTH_SECRET = "secreto-de-prueba-" + Math.random();
  process.env.OWNER_PASSWORD = "otra";
  try {
    const fresco = createJiti(import.meta.url, { alias: { "@": join(RAIZ, "src") }, interopDefault: true, moduleCache: false });
    const ACC2 = await fresco.import(join(RAIZ, "src/lib/busqueda-google/acceso.ts"));
    const AUTH2 = await fresco.import(join(RAIZ, "src/lib/auth-server.ts"));
    const tok = AUTH2.createSessionToken(AUTH2.OWNER_USERNAME);
    afirmar(ACC2.accesoADatos(tok).permitido, "Dueño blindado debe entrar");
    afirmar(!ACC2.accesoADatos(tokReserva).permitido, "un token firmado con la clave pública no debe valer");
    afirmar(!ACC2.accesoADatos(AUTH2.createSessionToken("otro")).permitido, "otra cuenta no es el Dueño");
  } finally {
    delete process.env.AUTH_SECRET;
    delete process.env.OWNER_PASSWORD;
  }
});

await prueba("ningún archivo de producción del módulo trae filas de ejemplo ni promete puestos", () => {
  const archivos = [
    ...readdirSync(join(RAIZ, "src/lib/busqueda-google")).map((a) => `src/lib/busqueda-google/${a}`),
    "src/app/oportunidades/page.tsx",
    "src/app/api/sistema/busqueda-google/route.ts",
  ];
  for (const a of archivos) {
    const t = readFileSync(join(RAIZ, a), "utf8");
    afirmar(!/(DEMO|EJEMPLO|MUESTRA|FAKE|MOCK)_?(FILAS|DATOS|ROWS)/i.test(t), `${a} parece traer datos de ejemplo`);
    afirmar(!/\bimpresiones:\s*\d{2,}/.test(t), `${a} trae cifras de impresiones escritas a mano`);
    afirmar(!/te (llevamos|llevaremos) al primer|garantizamos/i.test(t), `${a} promete resultados`);
  }
});

console.log(`\n${pasan} ✓ · ${fallan} ✗`);
process.exit(fallan ? 1 : 0);
