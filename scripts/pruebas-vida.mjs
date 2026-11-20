// ═══════════════════════════════════════════════════════════════════
// v421.9 · PRUEBAS DE «VIDA» — el algoritmo de impresiones, sin navegador
//
// El recomendador es lógica pura a propósito: se puede ejercitar entero en
// node. Esto comprueba con datos lo que la misión promete: que aprende de lo
// que abres, que no repite lo de hace un momento, que no castiga para siempre
// y que CADA recomendación se puede explicar con una frase.
//
// Uso:  node scripts/pruebas-vida.mjs
// ═══════════════════════════════════════════════════════════════════
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const RAIZ = resolve(new URL("..", import.meta.url).pathname);
const SALIDA = "/tmp/vanguard-vida-algoritmo.mjs";

const r = spawnSync(
  "npx",
  ["--yes", "esbuild", resolve(RAIZ, "src/lib/vida/algoritmo.ts"), "--bundle", "--format=esm", `--outfile=${SALIDA}`, "--log-level=error"],
  { stdio: "inherit", cwd: RAIZ },
);
if (r.status !== 0) {
  console.error("No se pudo compilar el algoritmo (¿esbuild sin red?). Prueba:\n  npx esbuild src/lib/vida/algoritmo.ts --bundle --format=esm --outfile=" + SALIDA);
  process.exit(1);
}

const A = await import(SALIDA);

let pasan = 0;
let fallan = 0;
const prueba = (nombre, fn) => {
  try {
    fn();
    pasan++;
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallan++;
    console.log(`  ✗ ${nombre}\n      ${e instanceof Error ? e.message : e}`);
  }
};
const afirmar = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const DIA = 24 * 60 * 60 * 1000;
const AHORA = Date.UTC(2026, 10, 19, 12, 0, 0);

// un puñado de puertas con la forma real de la casa (id, nombre, href, grupo)
const PUERTAS = [
  { id: "conflictos", nombre: "Conflictos", href: "/guerra-hoy", grupo: "Conflictos" },
  { id: "conflictos/envivo", nombre: "En vivo", href: "/en-vivo", grupo: "Conflictos" },
  { id: "mapa", nombre: "Mapa 3D", href: "/mundo", grupo: "Mapa 3D" },
  { id: "mapas", nombre: "Centro de mapas", href: "/mapas", grupo: "Mapa 3D" },
  { id: "ciencia", nombre: "Ciencia", href: "/ciencia", grupo: "Conocimiento" },
  { id: "historia", nombre: "Historia", href: "/historia", grupo: "Conocimiento" },
  { id: "mi-universo", nombre: "Mi universo", href: "/mi-universo", grupo: "Tu lado" },
  { id: "mesa", nombre: "Mi mesa de trabajo", href: "/espacio", grupo: "Tu lado" },
];

const orden = (lista) => lista.map((f) => f.id);
const porId = (lista, id) => lista.find((f) => f.id === id);

console.log("\nVIDA · algoritmo de impresiones\n" + "─".repeat(62));

prueba("sin señales, todas las puertas empatan en novedad", () => {
  const r = A.puntuar(PUERTAS, { ahora: AHORA }, 0);
  afirmar(r.length === PUERTAS.length, `filas: ${r.length}`);
  afirmar(
    r.every((f) => f.puntos === 3),
    "puntos: " + r.map((f) => `${f.id}=${f.puntos}`).join(" "),
  );
  afirmar(r.every((f) => f.razon === "nunca lo has abierto"), "razón inesperada");
});

prueba("determinista: dos llamadas dan el MISMO orden (no baila entre cargas)", () => {
  const uno = orden(A.puntuar(PUERTAS, { ahora: AHORA }, 0));
  const dos = orden(A.puntuar(PUERTAS, { ahora: AHORA }, 0));
  const tres = orden(A.puntuar([...PUERTAS].reverse(), { ahora: AHORA }, 0));
  afirmar(uno.join("|") === dos.join("|"), "dos llamadas difieren");
  afirmar(uno.join("|") === tres.join("|"), "el orden depende de la entrada (debe ser estable)");
});

prueba("lo que fijaste con la estrella sube al principio", () => {
  const r = A.puntuar(PUERTAS, { favoritos: ["historia"], ahora: AHORA }, 3);
  afirmar(r[0].id === "historia", "primera: " + r[0].id);
  afirmar(r[0].razon === "lo fijaste tú", "razón: " + r[0].razon);
  afirmar(r[0].detalle.favorito === 8, "favorito: " + r[0].detalle.favorito);
});

prueba("los favoritos aceptan clave o href (el almacén de la casa guarda ambos)", () => {
  const r = A.puntuar(PUERTAS, { favoritos: ["/mundo"], ahora: AHORA }, 2);
  afirmar(r[0].id === "mapa", "primera: " + r[0].id);
});

prueba("lo que abres mucho sube (impresiones reales)", () => {
  const r = A.puntuar(PUERTAS, { uso: { "conflictos/envivo": 6 }, ahora: AHORA }, 3);
  afirmar(r[0].id === "conflictos/envivo", "primera: " + r[0].id);
  afirmar(r[0].razon === "vuelves mucho por aquí", "razón: " + r[0].razon);
  afirmar(r[0].detalle.impresiones > 0, "sin impresiones");
});

prueba("las impresiones se saturan: la apertura 200 no vale más que la 8", () => {
  const ocho = A.puntuar(PUERTAS, { uso: { mapa: 8 }, ahora: AHORA }, 0);
  const docientas = A.puntuar(PUERTAS, { uso: { mapa: 200 }, ahora: AHORA }, 0);
  afirmar(Math.abs(porId(ocho, "mapa").puntos - porId(docientas, "mapa").puntos) < 0.001, "no satura");
});

prueba("nunca abierto gana a abierto hace un momento", () => {
  const r = A.puntuar(PUERTAS, { vistos: { mapa: AHORA - 60_000 }, ahora: AHORA }, 0);
  const m = porId(r, "mapa");
  const n = porId(r, "ciencia");
  afirmar(n.puntos > m.puntos, `nuevo ${n.puntos} vs reciente ${m.puntos}`);
  afirmar(m.razon === "lo abriste hace un momento", "razón: " + m.razon);
  afirmar(m.detalle.repeticion < 0, "no penaliza: " + m.detalle.repeticion);
});

prueba("no castiga para siempre: lo visto hace 30 días vuelve a estar disponible", () => {
  const r = A.puntuar(PUERTAS, { vistos: { mapa: AHORA - 30 * DIA }, ahora: AHORA }, 0);
  const m = porId(r, "mapa");
  afirmar(m.detalle.repeticion > -0.02, "sigue penalizando: " + m.detalle.repeticion);
  afirmar(m.puntos > 2.9, "puntos: " + m.puntos);
});

prueba("afinidad de grupo: lo que abres arrastra a sus hermanas no vistas", () => {
  const r = A.puntuar(PUERTAS, { uso: { conflictos: 5 }, ahora: AHORA }, 0);
  const hermana = porId(r, "conflictos/envivo");
  afirmar(hermana.detalle.afinidad > 0, "sin afinidad");
  afirmar(hermana.razon.includes("cerca de lo que más abres"), "razón: " + hermana.razon);
});

prueba("el decaimiento cae con el tiempo y nunca es negativo", () => {
  afirmar(Math.abs(A.decaimiento(0) - 1) < 1e-9, "edad 0");
  afirmar(Math.abs(A.decaimiento(A.VIDA_MEDIA_MS) - 0.5) < 1e-6, "vida media");
  afirmar(A.decaimiento(30 * DIA) < 0.01, "30 días debería olvidarse");
  afirmar(A.decaimiento(-500) <= 1 && A.decaimiento(NaN) === 1, "basura");
});

prueba("toda recomendación trae una razón legible (nada de cajas negras)", () => {
  const r = A.puntuar(PUERTAS, { uso: { mapa: 4 }, favoritos: ["ciencia"], vistos: { historia: AHORA - 2_000 }, ahora: AHORA }, 0);
  afirmar(r.length === PUERTAS.length, "filas: " + r.length);
  for (const f of r) {
    afirmar(typeof f.razon === "string" && f.razon.length > 4, `razón vacía en ${f.id}`);
    const suma = Object.values(f.detalle).reduce((a, b) => a + b, 0);
    afirmar(Math.abs(suma - f.puntos) < 0.02, `${f.id}: detalle ${suma} ≠ puntos ${f.puntos}`);
  }
});

prueba("cuantos limita el resultado y no repite puertas", () => {
  const r = A.puntuar(PUERTAS, { ahora: AHORA }, 6);
  afirmar(r.length === 6, "filas: " + r.length);
  afirmar(new Set(r.map((f) => f.href)).size === 6, "href repetido");
});

prueba("registrarVisto no muta el registro recibido y anota la hora", () => {
  const antes = { mapa: AHORA - DIA };
  const despues = A.registrarVisto(antes, "ciencia", AHORA);
  afirmar(!("ciencia" in antes), "mutó el original");
  afirmar(despues.ciencia === AHORA, "no anotó la hora");
  afirmar(despues.mapa === antes.mapa, "perdió lo anterior");
});

prueba("el registro de impresiones se recorta a 200 y conserva las recientes", () => {
  let v = {};
  for (let i = 0; i < 260; i++) v = A.registrarVisto(v, "p" + i, AHORA + i);
  const claves = Object.keys(v);
  afirmar(claves.length === 200, "claves: " + claves.length);
  afirmar("p259" in v, "perdió la más reciente");
  afirmar(!("p0" in v), "conservó la más vieja");
});

prueba("normalizarSenal tolera basura, negativos y NaN sin reventar", () => {
  const s = A.normalizarSenal({ uso: { a: -3, b: "x", c: 4.7, d: NaN }, favoritos: "no-es-array", vistos: { e: "2026" }, ahora: AHORA });
  afirmar(s.uso.a === undefined && s.uso.b === undefined, "aceptó basura");
  afirmar(s.uso.c === 4, "no redondeó: " + s.uso.c);
  afirmar(Array.isArray(s.favoritos) && s.favoritos.length === 0, "favoritos: " + JSON.stringify(s.favoritos));
  afirmar(s.vistos.e === 2026, "vistos: " + s.vistos.e);
});

prueba("normalizarSenal lee el formato de zustand de vg171-favoritos", () => {
  const s = A.normalizarSenal({ favoritos: { state: { favoritos: ["mapa", "mapa", "ciencia"] }, version: 0 } });
  afirmar(s.favoritos.length === 2, "no dedujo: " + JSON.stringify(s.favoritos));
  const plano = A.normalizarSenal({ favoritos: ["mapa"] });
  afirmar(plano.favoritos[0] === "mapa", "no leyó el plano");
});

prueba("leerJson sobrevive a almacén corrupto y vacío", () => {
  afirmar(A.leerJson("{roto", { x: 1 }).x === 1, "no usó el valor por defecto");
  afirmar(A.leerJson(null, []).length === 0, "null");
  afirmar(A.leerJson('"texto"', {}).constructor === Object, "aceptó un primitivo");
});

prueba("los tonos son estables por persona y salen de la paleta de la casa", () => {
  const a = A.tonoDe("ElRey");
  const b = A.tonoDe("ElRey");
  const c = A.tonoDe("invitado");
  afirmar(a.a === b.a && a.b === b.b, "el color cambia entre cargas");
  afirmar(A.PALETA.includes(a.a) && A.PALETA.includes(a.b), "color fuera de la paleta");
  afirmar(typeof c.a === "string", "invitado sin tono");
});

prueba("hash e inicial aguantan entradas raras", () => {
  afirmar(Number.isInteger(A.hash("")) && A.hash("x") >= 0, "hash inválido");
  afirmar(A.hash("mapa") === A.hash("mapa"), "hash inestable");
  afirmar(A.inicialDe("") === "V", "vacío");
  afirmar(A.inicialDe("   el rey  ") === "E", "espacios");
  afirmar(A.inicialDe("🗺️ mapa") === "🗺", "emoji rompe");
});

prueba("escenario real: tres visitas a un frente lo ponen arriba y se explica", () => {
  let vistos = {};
  for (let i = 0; i < 3; i++) {
    const r = A.puntuar(PUERTAS, { uso: { conflictos: 3 }, vistos, ahora: AHORA + i * 60_000 }, 6);
    afirmar(r.some((f) => f.id === "conflictos"), "la puerta usada no aparece en el top 6");
    vistos = A.registrarVisto(vistos, r[0].id, AHORA + i * 60_000);
  }
  const final = A.puntuar(PUERTAS, { uso: { conflictos: 3 }, vistos, ahora: AHORA + 4 * 60_000 }, 0);
  afirmar(final.every((f) => f.razon.length > 4), "razón vacía");
});

// ─── v422.3: la ruleta y el resumen ──────────────────────────────
prueba("la ruleta nunca repite lo que ya estás viendo", () => {
  const enPantalla = ["conflictos", "mapa", "ciencia"];
  for (let semilla = 0; semilla < 40; semilla++) {
    const e = A.elegirSorprendente(PUERTAS, { ahora: AHORA }, enPantalla, semilla);
    afirmar(e !== null, "devolvió null con puertas libres");
    afirmar(!enPantalla.includes(e.id), `repitió ${e.id} con semilla ${semilla}`);
  }
});

prueba("la ruleta evita lo abierto en la última hora", () => {
  const calientes = { mapa: AHORA - 10 * 60 * 1000, ciencia: AHORA - 30 * 60 * 1000 };
  for (let semilla = 0; semilla < 40; semilla++) {
    const e = A.elegirSorprendente(PUERTAS, { vistos: calientes, ahora: AHORA }, [], semilla);
    afirmar(e && !("mapa" === e.id) && e.id !== "ciencia", `salió caliente: ${e && e.id}`);
  }
});

prueba("si todo está caliente, la ruleta sigue dando algo (nunca se queda vacía)", () => {
  const todos = Object.fromEntries(PUERTAS.map((p) => [p.id, AHORA - 60_000]));
  const e = A.elegirSorprendente(PUERTAS, { vistos: todos, ahora: AHORA }, [], 7);
  afirmar(e !== null, "devolvió null");
  afirmar(e.razon.includes("vuelvas"), "razón: " + e.razon);
});

prueba("si no queda nada libre, la ruleta devuelve null (no inventa)", () => {
  const todos = PUERTAS.map((p) => p.id);
  const e = A.elegirSorprendente(PUERTAS, { ahora: AHORA }, todos, 1);
  afirmar(e === null, "devolvió " + (e && e.id));
});

prueba("la ruleta prefiere lo que nunca abriste", () => {
  for (let semilla = 0; semilla < 25; semilla++) {
    const e = A.elegirSorprendente(PUERTAS, { vistos: { mapa: AHORA - 5 * DIA }, ahora: AHORA }, [], semilla);
    afirmar(e && e.id !== "mapa", "eligió la única ya abierta existiendo nuevas");
  }
});

prueba("la ruleta es reproducible con la misma semilla y varía con otras", () => {
  const uno = A.elegirSorprendente(PUERTAS, { ahora: AHORA }, [], 3);
  const dos = A.elegirSorprendente(PUERTAS, { ahora: AHORA }, [], 3);
  afirmar(uno.id === dos.id, "la misma semilla dio puertas distintas");
  const vistos = new Set();
  for (let s = 0; s < 25; s++) vistos.add(A.elegirSorprendente(PUERTAS, { ahora: AHORA }, [], s).id);
  afirmar(vistos.size >= 3, "semillas distintas solo dieron " + vistos.size + " puerta(s)");
});

prueba("el resumen cuenta puertas, aperturas y recientes sin inflarse", () => {
  const r = A.resumenSenal({
    uso: { a: 3, b: 2, c: -1 },
    vistos: { mapa: AHORA - 1000, ciencia: AHORA - 40 * DIA },
    ahora: AHORA,
  });
  afirmar(r.puertas === 2, "puertas: " + r.puertas);
  afirmar(r.aperturas === 7, "aperturas: " + r.aperturas);
  afirmar(r.recientes === 1, "recientes: " + r.recientes);
});

prueba("el resumen de un aparato recién estrenado es cero, no NaN", () => {
  const r = A.resumenSenal({});
  afirmar(r.puertas === 0 && r.aperturas === 0 && r.recientes === 0, JSON.stringify(r));
});

console.log("─".repeat(62));
console.log(`  ${pasan} pasan · ${fallan} fallan`);
process.exit(fallan === 0 ? 0 : 1);
