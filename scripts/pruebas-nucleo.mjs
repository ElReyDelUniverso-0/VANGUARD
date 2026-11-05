#!/usr/bin/env node
// ============================================================
// v218.0 EL NÚCLEO — PRUEBAS DEL SISTEMA CENTRAL
//   node scripts/pruebas-nucleo.mjs [http://localhost:3000]
//
// PARTE A — CENSO (offline, lee el código: nada de servidores):
//   ids únicos · rutas reales en src/app · dependencias existentes
//   · 8 tipos de entidad · frontera pública/privada declarada.
// PARTE B — VIVO (contra el servidor):
//   búsqueda real y sin fuentes privadas · fichas de entidad con
//   enlaces que responden 200 · navegación (/nucleo, sitemap,
//   chips en /conflicto y /noticia) · muro 429 (ley v211) ·
//   cero fuga de campos privados (passHash/saveJson).
// Sale con código 1 si ALGO falla (el Dueño manda: si las pruebas
// básicas fallan, no se continúa con cambios masivos).
// ============================================================
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const BASE = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const PRIVADAS = ["fnt:cuentas", "fnt:jugadores", "fnt:telemetria", "fnt:conversacion"];
const CAMPOS_PRIVADOS = ["passHash", "saveJson", "lastLoginAt"];

let pasan = 0;
let fallan = 0;
const fallos = [];

function verificar(nombre, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      pasan++;
      console.log(`  ✓ ${nombre}`);
    })
    .catch((e) => {
      fallan++;
      fallos.push(`${nombre} — ${e?.message ?? e}`);
      console.error(`  ✗ ${nombre} — ${e?.message ?? e}`);
    });
}

function afirmar(cond, mensaje) {
  if (!cond) throw new Error(mensaje);
}

async function pedir(ruta, init = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30000);
  try {
    const r = await fetch(`${BASE}${ruta}`, { signal: ctrl.signal, ...init });
    const texto = await r.text();
    let json = null;
    try { json = JSON.parse(texto); } catch { /* HTML */ }
    // v237: headers viajan también (content-type/length de los activos) — aditivo
    return { status: r.status, texto, json, headers: Object.fromEntries(r.headers) };
  } finally {
    clearTimeout(t);
  }
}

// ─────────────────────────────────────────────────────────────
// PARTE A — EL CENSO, OFFLINE
// ─────────────────────────────────────────────────────────────
const rutaRegistro = join(RAIZ, "src/lib/nucleo/registro.ts");
const rutaFuentes = join(RAIZ, "src/lib/nucleo/fuentes.ts");
const registro = existsSync(rutaRegistro) ? readFileSync(rutaRegistro, "utf8") : "";
const fuentes = existsSync(rutaFuentes) ? readFileSync(rutaFuentes, "utf8") : "";

const ids = [...registro.matchAll(/id: "(mod:[a-z0-9-]+)"/g)].map((m) => m[1]);
const rutas = [...registro.matchAll(/ruta: "([^"]+)"/g)].map((m) => m[1]);
const deps = [...registro.matchAll(/"((?:mod|fnt):[a-z0-9:-]+)"/g)].map((m) => m[1]);
const fntPublicas = [...fuentes.matchAll(/id: "(fnt:[a-z0-9-]+)"/g)].map((m) => m[1]);

async function parteA() {
  console.log("\nPARTE A — CENSO DEL NÚCLEO (offline)");

  await verificar("el censo existe y tiene ≥ 18 módulos", () => {
    afirmar(registro.length > 0, "src/lib/nucleo/registro.ts no existe");
    afirmar(ids.length >= 18, `solo ${ids.length} módulos en el censo`);
  });

  await verificar("ids de módulo únicos", () => {
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    afirmar(dup.length === 0, `ids duplicados: ${dup.join(", ")}`);
  });

  await verificar("cada ruta del censo existe de verdad en src/app/", () => {
    for (const r of rutas) {
      const rel = r === "/" ? "src/app/page.tsx" : `src/app${r}/page.tsx`;
      afirmar(existsSync(join(RAIZ, rel)), `ruta ${r} sin ${rel}`);
    }
  });

  await verificar("todas las dependencias existen (mod:/fnt:)", () => {
    for (const d of deps) {
      if (d.startsWith("mod:")) afirmar(ids.includes(d), `dependencia inexistente: ${d}`);
      else afirmar(fntPublicas.includes(d) || PRIVADAS.includes(d), `fuente no declarada: ${d}`);
    }
  });

  await verificar("10 tipos de entidad con la fórmula vg:<tipo>:<clave>", () => {
    const tipos = readFileSync(join(RAIZ, "src/lib/nucleo/tipos.ts"), "utf8");
    for (const t of ["pais", "region", "acontecimiento", "documento", "fuente", "mapa", "analisis", "simulacion", "noticia", "punto"]) {
      afirmar(tipos.includes(`"${t}"`), `falta el tipo ${t}`);
    }
    afirmar(tipos.includes("vg:${tipo}"), "la fórmula de id estable no está en tipos.ts");
  });

  await verificar("frontera: fuentes privadas declaradas y públicas ≥ 10", () => {
    for (const p of PRIVADAS) afirmar(fuentes.includes(`"${p}"`), `fuente privada no declarada: ${p}`);
    const publicas = fntPublicas.filter((f) => !PRIVADAS.includes(f));
    afirmar(publicas.length >= 10, `solo ${publicas.length} fuentes públicas`);
  });

  await verificar("sin proveedor para fuentes privadas en busqueda.ts", () => {
    const busq = readFileSync(join(RAIZ, "src/lib/nucleo/busqueda.ts"), "utf8");
    for (const p of PRIVADAS) {
      afirmar(!busq.includes(`fuentePublica("${p}")`), `¡una fuente privada tiene proveedor: ${p}!`);
    }
    afirmar(busq.includes("esFuentePublica"), "falta la guarda de frontera");
  });

  await verificar("el cartógrafo cita sus fuentes y NO inventa coordenadas", () => {
    const geoPath = join(RAIZ, "src/lib/nucleo/geografia.ts");
    afirmar(existsSync(geoPath), "src/lib/nucleo/geografia.ts no existe");
    const geo = readFileSync(geoPath, "utf8");
    for (const trozo of ["TEATRO_3D", "guerras-activas-data", "NO cartografía oficial"]) {
      afirmar(geo.includes(trozo), `el cartógrafo no declara su procedencia: falta «${trozo}»`);
    }
    afirmar(!/lat:\s*-?\d/.test(geo), "¡el cartógrafo declara coordenadas literales — está inventando puntos!");
  });

  await verificar("salas solo donde existen — la ausencia de Corea se declara, no se finge", () => {
    const geo = readFileSync(join(RAIZ, "src/lib/nucleo/geografia.ts"), "utf8");
    for (const sala of ['"ucrania"', '"oriente"', '"sudan"', '"sahel"', '"taiwan"']) {
      afirmar(geo.includes(`sala: ${sala}`), `falta la sala ${sala} en el mapeo`);
    }
    afirmar(!/korea:\s*\{\s*sala:/.test(geo), "¡korea tiene sala fingida!");
    afirmar(geo.includes("NO tiene sala de guerra propia"), "la ausencia de sala de Corea no se declara");
  });

  await verificar("LA PLUMA: la casa pesa poco en el bolsillo (v222)", () => {
    const conflicto = readFileSync(join(RAIZ, "src/app/conflicto/[tag]/page.tsx"), "utf8");
    afirmar(conflicto.includes('loading="lazy"'), "las imágenes de /conflicto no van diferidas — el móvil las descarga ocultas");
    afirmar(conflicto.includes('decoding="async"'), "las imágenes de /conflicto bloquean la decodificación");
    const globo = readFileSync(join(RAIZ, "src/components/vanguard/globe-map-3d.tsx"), "utf8");
    afirmar(globo.includes("setPixelRatio") && globo.includes("devicePixelRatio"), "el globo no capa el DPR del móvil (GPU a 9× en DPR 3)");
    const mundo = readFileSync(join(RAIZ, "src/app/mundo/mundo-3d-vivo.tsx"), "utf8");
    afirmar(mundo.includes("useMemo"), "el globo vivo re-digiere sus datos en cada toque");
    afirmar(mundo.includes('ssr: false'), "el globo ya no viaja diferido (dynamic ssr:false)");
  });

  await verificar("EL BARÓMETRO: catálogo sin un solo valor inventado y mapa honesto (v223)", () => {
    const rutaInd = join(RAIZ, "src/lib/nucleo/indicadores.ts");
    const ind = existsSync(rutaInd) ? readFileSync(rutaInd, "utf8") : "";
    afirmar(ind.length > 0, "src/lib/nucleo/indicadores.ts no existe");
    // los 4 códigos verificados en vivo contra la API v2 del Banco Mundial
    for (const codigo of ["SP.POP.TOTL", "NY.GDP.MKTP.CD", "MS.MIL.XPND.GD.ZS", "SM.POP.TOTL"]) {
      afirmar(ind.includes(`"${codigo}"`), `falta el indicador ${codigo}`);
    }
    // CERO números como datos: ningún campo valor/texto lleva literal —
    // los números SOLO entran por la API (ley: no se inventan hechos)
    afirmar(!/valor:\s*["']?\d/.test(ind) && !/texto:\s*["']?\d/.test(ind), "el catálogo lleva valores escritos a mano — invención");
    afirmar(ind.includes("CC BY 4.0"), "sin licencia declarada en el módulo");
    afirmar(ind.includes("datos.bancomundial.org"), "sin enlace al original en el módulo");
    // el mapa ISO3 cubre EXACTAMENTE las naciones del eslabón MAPAS
    const rel = readFileSync(join(RAIZ, "src/lib/nucleo/relaciones.ts"), "utf8");
    const bloqueRel = (rel.match(/RELACION_PAIS_TEATRO[^{]*\{([\s\S]*?)\};/) ?? [])[1] ?? "";
    const eslabon = new Set([...bloqueRel.matchAll(/"([a-z]{2})"/g)].map((m) => m[1]));
    const mapa = new Set([...ind.matchAll(/^\s{2}([a-z]{2}): "[A-Z]{3}",$/gm)].map((m) => m[1]));
    afirmar(eslabon.size > 0, "no se pudo leer RELACION_PAIS_TEATRO");
    for (const iso of eslabon) afirmar(mapa.has(iso), `el eslabón pide ${iso} y el barómetro no lo cubre`);
    for (const iso of mapa) afirmar(eslabon.has(iso), `el barómetro cubre ${iso} fuera del eslabón MAPAS`);
    // la frontera declara la fuente nueva
    afirmar(fuentes.includes("fnt:indicadores"), "fnt:indicadores no está en la frontera pública");
  });

  await verificar("EL ESTRATEGA: la simulación vive SEPARADA (v224) — datos/supuestos/variables/reglas/resultado", () => {
    const dir = join(RAIZ, "src/lib/nucleo/simulacion");
    const leer = (f) => readFileSync(join(dir, f), "utf8");
    // ① los cinco archivos separados EXISTEN
    const piezas = ["datos.ts", "supuestos.ts", "variables.ts", "reglas.ts", "index.ts"];
    for (const f of piezas) afirmar(existsSync(join(dir, f)), `falta la pieza separada ${f}`);
    // ② las REGLAS son puras: sin BD, sin red, sin reloj, sin azar, sin eval
    const reglas = leer("reglas.ts");
    for (const prohibido of ["@/lib/db", "db.", "fetch(", "Date.now", "Math.random", "eval(", "Function("]) {
      afirmar(!reglas.includes(prohibido), `¡las reglas contienen «${prohibido}» — el determinismo se rompe!`);
    }
    // ③ los SUPUESTOS declaran texto, justificación y límite (≥ 5)
    const supuestos = leer("supuestos.ts");
    const nSup = (supuestos.match(/id: "SUP-/g) ?? []).length;
    afirmar(nSup >= 5, `solo ${nSup} supuestos declarados`);
    for (const campo of ["justificacion:", "limite:", "NO ES UNA PREDICCIÓN"]) {
      afirmar(supuestos.includes(campo), `los supuestos no declaran ${campo}`);
    }
    // ④ las VARIABLES son el único mando: rango fijo, defecto, validación dura
    const variables = leer("variables.ts");
    afirmar((variables.match(/id: "peso/g) ?? []).length === 4, "el escenario no tiene exactamente 4 pesos");
    for (const trozo of ["normalizarVariables", "variable desconocida", "debe estar entre"]) {
      afirmar(variables.includes(trozo), `la validación de variables no rechaza de verdad: falta «${trozo}»`);
    }
    // ⑤ el resultado JAMÁS se presenta como predicción
    const indice = leer("index.ts");
    afirmar(indice.includes("NO ES PREDICCIÓN"), "el resultado viaja sin el aviso anti-predicción");
    // ⑥ los DATOS llevan procedencia y no llevan números escritos a mano
    const datos = leer("datos.ts");
    afirmar(datos.includes("fnt:acontecimientos") && datos.includes("fnt:indicadores"), "los datos no declaran su procedencia");
    afirmar(!/cables:\s*\d{2,}/.test(datos), "los datos llevan cifras escritas a mano — invención");
  });

  await verificar("EL FRENTE: los puntos son entidades SIN una coordenada inventada (v225)", () => {
    const rutaPuntos = join(RAIZ, "src/lib/nucleo/puntos.ts");
    afirmar(existsSync(rutaPuntos), "src/lib/nucleo/puntos.ts no existe");
    const puntos = readFileSync(rutaPuntos, "utf8");
    // el catálogo de puntos NO declara ni una coordenada: solo proyecta
    // geografiaDeTeatro (las salas OSINT documentadas de la casa)
    afirmar(!/lat:\s*-?\d/.test(puntos) && !/lng:\s*-?\d/.test(puntos), "¡puntos.ts declara coordenadas literales — está inventando puntos!");
    for (const trozo of ["geografiaDeTeatro", "puntoPorClave", "puntosDelNucleo", "normalizar"]) {
      afirmar(puntos.includes(trozo), `el catálogo de puntos no usa el contrato de la casa: falta «${trozo}»`);
    }
    // la ficha del punto en relaciones.ts cita la fuente y declara la precisión
    const rel = readFileSync(join(RAIZ, "src/lib/nucleo/relaciones.ts"), "utf8");
    for (const trozo of ["PUNTO DEL FRENTE", "Coordenadas documentadas", "Fuente del mapa", "NO cartografía oficial"]) {
      afirmar(rel.includes(trozo), `la ficha vg:punto no declara «${trozo}»`);
    }
  });

  await verificar("EL TAMIZ: la isla usa terminos/tipo de LA LUPA y la página valida contra la whitelist (v226)", () => {
    const rutaIsla = join(RAIZ, "src/components/vanguard/nucleo-busqueda.tsx");
    afirmar(existsSync(rutaIsla), "src/components/vanguard/nucleo-busqueda.tsx no existe");
    const isla = readFileSync(rutaIsla, "utf8");
    // los chips existen y van por el contrato &tipo= de la LUPA
    for (const trozo of [
      'aria-label="Filtrar por tipo de entidad"',
      "aria-pressed",
      "ETIQUETA_TIPO",
      "TIPOS_ENTIDAD",
      "&tipo=",
      "terminos",
    ]) {
      afirmar(isla.includes(trozo), `la isla no aprovecha la LUPA: falta «${trozo}»`);
    }
    // un tipo desconocido en la URL jamás se finge como filtro
    afirmar(isla.includes("includes(tipoInicial)"), "la isla no valida el tipo inicial contra la whitelist");
    const pag = readFileSync(join(RAIZ, "src/app/nucleo/page.tsx"), "utf8");
    afirmar(pag.includes("tipoInicial"), "la página no pasa el filtro inicial a la isla");
    afirmar(pag.includes("(TIPOS_ENTIDAD as readonly string[]).includes(tipoParam)"), "la página no valida ?tipo= contra la whitelist");
    // el motor recorta DESPUÉS del tamiz (el chip enseña hasta el límite del tipo)
    const busq = readFileSync(join(RAIZ, "src/lib/nucleo/busqueda.ts"), "utf8");
    afirmar(busq.includes("tipoFiltro ? limite : 8"), "el motor no pide el límite completo cuando hay filtro");
    afirmar(busq.includes(".slice(0, limite)"), "el motor no recorta después del filtro");
  });

  await verificar("EL DESPLIEGUE: /conflicto proyecta los frentes del teatro sin inventar nada (v227)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/conflicto/[tag]/page.tsx"), "utf8");
    // la sección usa SOLO el catálogo de la casa (cero coordenadas propias)
    for (const trozo of ["puntosDelNucleo", "geografiaDeTeatro", "idPunto", "NO cartografía oficial"]) {
      afirmar(pag.includes(trozo), `la página del teatro no declara «${trozo}»`);
    }
    afirmar(!/lat:\s*-?\d/.test(pag) && !/lng:\s*-?\d/.test(pag), "¡la página del teatro declara coordenadas literales!");
    // el teatro sin sala declara la ausencia, no la finge
    afirmar(pag.includes("no inventa puntos"), "la ausencia de frentes no se declara honesta");
  });

  await verificar("EL ATLAS: la ficha vg:pais proyecta el atlas + los frentes sin inventar nada (v228)", () => {
    const rel = readFileSync(join(RAIZ, "src/lib/nucleo/relaciones.ts"), "utf8");
    // el meta rico sale de la PROYECCIÓN del atlas (cero datos escritos a mano)
    for (const trozo of ["fmtMillones(p.poblacion)", "fmtKm2(p.superficie)", "p.idiomas", "p.moneda"]) {
      afirmar(rel.includes(trozo), `la ficha del país no proyecta el atlas: falta «${trozo}»`);
    }
    // los frentes salen del catálogo de la casa con su relación declarada
    afirmar(rel.includes("puntosDelNucleo()"), "los frentes del país no salen del catálogo de la casa");
    afirmar(rel.includes('"punto_de"'), "los frentes no viajan con su relación punto_de");
    afirmar(rel.includes("/ver-guerra"), "sin el enlace a la sala de guerra");
    // anti-invención: CERO nombres de frentes escritos a mano en las relaciones
    afirmar(!/Bajmut|Avdíivka|Kupiansk|Járkov|Donetsk/.test(rel), "¡relaciones.ts escribe nombres de frentes a mano!");
  });

  await verificar("EL PUENTE: /ver-guerra mapea el mural al núcleo sin fingir ni fechas (v229)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/ver-guerra/page.tsx"), "utf8");
    // el mapeo editorial es EXPLÍCITO (como TABLERO_ORIENTE) y los chips salen de la casa
    for (const trozo of ["FRENTE_A_TEATRO", "slugAcontecimientoDeTeatro", "groupBy", "no inventa puertas"]) {
      afirmar(pag.includes(trozo), `el puente del mural no declara «${trozo}»`);
    }
    // anti-invención: CERO fechas históricas escritas a mano (viven en la semilla v219)
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la página del mural escribe fechas históricas a mano!");
  });
}

// ─────────────────────────────────────────────────────────────
// PARTE B — LA CASA VIVA
// ─────────────────────────────────────────────────────────────
async function parteB() {
  console.log("\nPARTE B — BÚSQUEDA, NAVEGACIÓN Y RELACIONES (vivo)");

  // calentamiento: si una pasada anterior dejó el muro en castigo, se espera
  // en limpio (la prueba nunca debe pelear con la ley v211, debe verificarla)
  try {
    const sonda = await pedir("/api/nucleo/busqueda?q=calentamiento");
    if (sonda.status === 429) {
      console.log("  … muro en castigo de una pasada anterior: esperando 61 s");
      await new Promise((r) => setTimeout(r, 61000));
    }
  } catch { /* sin conexión: las pruebas de abajo lo dirán */ }

  // salud
  await verificar("servidor vivo y en v316.0", async () => {
    const r = await pedir(`/api/health?qa=${Math.floor(Math.random() * 1e9)}`);
    afirmar(r.json?.ok === true, "health no responde ok");
    afirmar(String(r.json?.version).startsWith("v324"), `versión ${r.json?.version} ≠ v314`);
  });

  // censo por API
  await verificar("GET /api/nucleo/modulos — censo público completo", async () => {
    const r = await pedir("/api/nucleo/modulos");
    afirmar(r.status === 200 && r.json?.ok, "no 200/ok");
    afirmar(r.json.totales.modulos >= 18, "censo incompleto");
    afirmar(r.json.modulos.some((m) => m.id === "mod:nucleo"), "el núcleo no se registra a sí mismo");
    afirmar(r.json.fuentesPrivadas.length === 4, "la frontera privada no está declarada");
  });

  // búsqueda real
  let primerCable = null;
  let cableConTeatro = null;
  await verificar("GET /api/nucleo/busqueda?q=ucrania — resultados REALES", async () => {
    const r = await pedir(`/api/nucleo/busqueda?q=${encodeURIComponent("ucrania")}`);
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    const rdos = r.json.resultados ?? [];
    afirmar(rdos.length >= 3, `solo ${rdos.length} resultados`);
    const cables = rdos.filter((x) => x.ruta?.startsWith("/noticia/"));
    afirmar(cables.length >= 1, "ningún cable real del archivo");
    primerCable = cables[0]?.ruta ?? null;
    cableConTeatro = (cables.find((x) => String(x.subtitulo).includes("UKRAINE")) ?? cables[0])?.ruta ?? null;
    const a = rdos.find((x) => x.entidad?.tipo === "acontecimiento");
    afirmar(Boolean(a), "el acontecimiento de la invasión no aparece en la búsqueda");
    const teatro = rdos.find((x) => x.entidad?.tipo === "region");
    afirmar(Boolean(teatro), "el teatro de Ucrania no aparece como región");
    afirmar(rdos.every((x) => x.origen?.startsWith("fnt:")), "resultado sin fuente declarada");
  });

  await verificar("la búsqueda NUNCA toca fuentes privadas ni filtra campos", async () => {
    const r = await pedir(`/api/nucleo/busqueda?q=${encodeURIComponent("ucrania")}`);
    const crudo = r.texto;
    for (const p of PRIVADAS) afirmar(!crudo.includes(`"${p}"`), `fuente privada en respuesta: ${p}`);
    for (const c of CAMPOS_PRIVADOS) afirmar(!crudo.includes(c), `campo privado filtrado: ${c}`);
    for (const f of r.json.fuentes ?? []) {
      afirmar(!PRIVADAS.includes(f.id), `la búsqueda consultó una fuente privada: ${f.id}`);
    }
  });

  await verificar("búsqueda halla DOCUMENTOS del catálogo (exp-…)", async () => {
    const r = await pedir(`/api/nucleo/busqueda?q=${encodeURIComponent("stargate")}`);
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    const d = (r.json.resultados ?? []).find((x) => x.entidad?.id?.startsWith("vg:documento:exp-"));
    afirmar(Boolean(d), "el expediente STARGATE no aparece");
  });

  await verificar("búsqueda sin resultados = vacío honesto", async () => {
    const r = await pedir(`/api/nucleo/busqueda?q=${encodeURIComponent("zzqqxxw")}`);
    afirmar(r.status === 200 && r.json?.ok === true && (r.json.resultados?.length ?? 0) === 0, "no vacío honesto");
  });

  await verificar("búsqueda halla el ACONTECIMIENTO incluso sin tildes (busca normalizado)", async () => {
    const r = await pedir(`/api/nucleo/busqueda?q=${encodeURIComponent("invasion rusa")}`);
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    const a = (r.json.resultados ?? []).find((x) => x.entidad?.id === "vg:acontecimiento:invasion-rusa-de-ucrania");
    afirmar(Boolean(a), "el acontecimiento de Ucrania no aparece buscando sin tilde");
    afirmar(a?.origen === "fnt:acontecimientos", "el acontecimiento no declara su fuente");
  });

  await verificar("búsqueda corta → 400 (nada de ruido)", async () => {
    const r = await pedir("/api/nucleo/busqueda?q=a");
    afirmar(r.status === 400, `status ${r.status} ≠ 400`);
  });

  // v221 LA LUPA — la búsqueda entiende la pregunta
  const sinTilde = (s) =>
    String(s).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  await verificar("LA LUPA: multi-término — «ukraine drones» halla cables que citan AMBOS arriba", async () => {
    const r = await pedir(`/api/nucleo/busqueda?q=${encodeURIComponent("ukraine drones")}`);
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    afirmar(Array.isArray(r.json.terminos) && r.json.terminos.join(" ") === "ukraine drones", "la pregunta no se declara partida en términos");
    const cables = (r.json.resultados ?? []).filter((x) => x.ruta?.startsWith("/noticia/"));
    afirmar(cables.length >= 1, "ningún cable con ambos términos");
    const top = sinTilde(cables[0].titulo);
    afirmar(top.includes("ukraine") && top.includes("drone"), `el primer cable no cita ambos términos: ${cables[0].titulo}`);
  });

  await verificar("LA LUPA: «artico» encuentra el cable con «ártico» (tildes del archivo)", async () => {
    const r = await pedir("/api/nucleo/busqueda?q=artico");
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    const d = (r.json.resultados ?? []).find((x) => x.ruta?.startsWith("/noticia/") && sinTilde(x.titulo).includes("artico"));
    afirmar(Boolean(d), "el escaneo normalizado no encuentra títulos con tilde");
  });

  await verificar("LA LUPA: «bajmut» halla la ENTIDAD del frente con su fuente OSINT citada", async () => {
    const r = await pedir("/api/nucleo/busqueda?q=bajmut");
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    const f = (r.json.resultados ?? []).find((x) => x.titulo?.startsWith("Frente:"));
    afirmar(Boolean(f), "la ciudad del frente (sala de guerra v129/v220) no es buscable");
    afirmar(f.entidad?.tipo === "punto" && f.entidad?.id === "vg:punto:bajmut", `el frente no es una entidad vg:punto: ${f.entidad?.id}`);
    afirmar(f.origen === "fnt:teatros", "el frente no declara su fuente");
    afirmar(String(f.subtitulo).includes("OSINT"), "el frente no cita la procedencia del mapa");
    afirmar(decodeURIComponent(String(f.ruta)).includes("id=vg:punto:"), "el frente no lleva a su ficha");
  });

  await verificar("EL FRENTE: la ficha vg:punto:bajmut — coordenadas documentadas y cadena completa", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:punto:bajmut")}`);
    afirmar(r.status === 200 && r.json?.ok, `ficha del punto no ok (${r.status})`);
    afirmar(r.json.entidad?.tipo === "punto" && r.json.entidad?.nombre === "Bajmut", "entidad del punto rota");
    const meta = r.json.meta ?? [];
    const coords = meta.find((m) => m.k === "Coordenadas documentadas");
    afirmar(Boolean(coords) && /\d+\.\d+°, -?\d+\.\d+°/.test(coords.v), `sin coordenadas documentadas: ${coords?.v ?? "ausente"}`);
    afirmar((meta.find((m) => m.k === "Fuente del mapa")?.v ?? "").includes("ISW"), "sin la fuente OSINT de la sala citada");
    afirmar((meta.find((m) => m.k === "Precisión del mapa")?.v ?? "").includes("NO cartografía oficial"), "sin precisión declarada");
    afirmar((meta.find((m) => m.k === "Estado")?.v ?? "").length > 0, "sin el estado del punto");
    const enlaces = r.json.enlaces ?? [];
    const rutasEnlaces = enlaces.map((e) => e.ruta);
    afirmar(rutasEnlaces.includes("/ver-guerra"), "sin enlace al mapa del frente");
    afirmar(rutasEnlaces.some((x) => x.startsWith("/conflicto/")), "sin enlace a la ficha del teatro");
    afirmar(enlaces.some((e) => e.ruta.includes("id=vg:acontecimiento:")), "sin enlace al acontecimiento del frente");
    afirmar(enlaces.some((e) => e.ruta.includes("id=vg:pais:")), "sin enlace a los países del frente");
    const geo = r.json.puntoGeografia;
    afirmar(typeof geo?.lat === "number" && typeof geo?.lng === "number" && geo.salaGuerra === "ucrania", "geografía estructurada del punto rota");
    for (const e of enlaces.slice(0, 5)) {
      const dest = await pedir(e.ruta);
      afirmar(dest.status === 200, `enlace roto ${e.ruta} → ${dest.status}`);
    }
  });

  await verificar("EL FRENTE: 404 honesto para una clave que no existe en la geografía", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:punto:atlantis")}`);
    afirmar(r.status === 404, `status ${r.status} ≠ 404`);
    afirmar(String(r.json?.error ?? "").includes("geografía documentada"), "el 404 no explica su criterio");
  });

  await verificar("EL FRENTE: filtro &tipo=punto en la búsqueda", async () => {
    const r = await pedir(`/api/nucleo/busqueda?q=${encodeURIComponent("bajmut")}&tipo=punto`);
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    const rdos = r.json.resultados ?? [];
    afirmar(rdos.length >= 1, "el filtro se llevó todo");
    afirmar(rdos.every((x) => x.entidad?.tipo === "punto"), "se coló un resultado de otro tipo");
    afirmar(r.json.tipo === "punto", "el filtro aplicado no se declara");
  });

  await verificar("EL FRENTE: /nucleo muestra la tarjeta PUNTO DEL FRENTE con conteo real", async () => {
    const r = await pedir("/nucleo");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("PUNTO DEL FRENTE"), "sin la tarjeta del nuevo tipo");
    afirmar(r.texto.includes("ficha de Bajmut"), "sin el ejemplo de ficha del frente");
  });

  await verificar("LA LUPA: filtro &tipo=noticia honesto y 400 en tipo desconocido", async () => {
    const r = await pedir(`/api/nucleo/busqueda?q=${encodeURIComponent("ucrania")}&tipo=noticia`);
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    const rdos = r.json.resultados ?? [];
    afirmar(rdos.length >= 1, "el filtro se llevó todo");
    afirmar(rdos.every((x) => x.entidad?.tipo === "noticia"), "se coló un resultado de otro tipo");
    afirmar(r.json.tipo === "noticia", "el filtro aplicado no se declara en la respuesta");
    const malo = await pedir(`/api/nucleo/busqueda?q=${encodeURIComponent("ucrania")}&tipo=basura`);
    afirmar(malo.status === 400, `tipo inválido → ${malo.status} ≠ 400`);
  });

  // ── v226.0 EL TAMIZ: los chips de /nucleo usan el contrato de LA LUPA ──
  await verificar("EL TAMIZ: el filtro por tipo entrega hasta el LÍMITE COMPLETO del tipo (no lo que sobró del top-24)", async () => {
    // «ukraine» (como la prueba multi-término de LA LUPA): centenares de
    // cables lo citan — con el recorte viejo antes del tamiz solo cabían 8.
    const r = await pedir(`/api/nucleo/busqueda?q=${encodeURIComponent("ukraine")}&tipo=noticia`);
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    const rdos = r.json.resultados ?? [];
    afirmar(rdos.every((x) => x.entidad?.tipo === "noticia"), "se coló un resultado de otro tipo");
    afirmar(rdos.length >= 10, `solo ${rdos.length} noticias — el tamiz sigue recortando antes de filtrar`);
    afirmar(r.json.tipo === "noticia", "el filtro aplicado no se declara");
    afirmar((r.json.terminos ?? []).join(" ") === "ukraine", "los términos de la pregunta no se declaran");
  });

  await verificar("EL TAMIZ: /nucleo renderiza los chips de filtro por tipo (SSR)", async () => {
    const r = await pedir("/nucleo");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes('aria-label="Filtrar por tipo de entidad"'), "sin el grupo de chips");
    for (const etiqueta of [">TODO<", ">NOTICIA / CABLE<", ">PUNTO DEL FRENTE<", ">SIMULACIÓN<", ">PAÍS<"]) {
      afirmar(r.texto.includes(etiqueta), `falta el chip ${etiqueta}`);
    }
    afirmar(r.texto.includes('aria-pressed="true"'), "ningún chip activo por defecto");
    // sin filtro: el TODO activo y ningún chip de tipo encendido
    afirmar(/aria-pressed="true"[^>]*>[^<]*NOTICIA \/ CABLE/.test(r.texto) === false, "un chip de tipo arranca encendido sin ?tipo=");
  });

  await verificar("EL TAMIZ: /nucleo?tipo=noticia arranca con la NOTICIA activa — y basura se ignora (nada fingido)", async () => {
    const r = await pedir("/nucleo?tipo=noticia");
    afirmar(r.status === 200, "no 200");
    afirmar(/aria-pressed="true"[^>]*>[^<]*NOTICIA \/ CABLE/.test(r.texto), "el chip NOTICIA no arranca activo con ?tipo=noticia");
    const b = await pedir("/nucleo?tipo=basura");
    afirmar(b.status === 200, `un tipo desconocido revienta la página (${b.status})`);
    afirmar(/aria-pressed="true"[^>]*>[^<]*NOTICIA \/ CABLE/.test(b.texto) === false, "un tipo desconocido activó un chip — se finge un filtro");
  });

  // relaciones: ficha de entidad y sus enlaces vivos
  await verificar("ficha vg:region:ukraine — enlaces que RESPONDEN 200", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:region:ukraine")}`);
    afirmar(r.status === 200 && r.json?.ok, "ficha no ok");
    const enlaces = r.json.enlaces ?? [];
    afirmar(enlaces.length >= 4, `solo ${enlaces.length} enlaces`);
    for (const e of enlaces.slice(0, 6)) {
      const dest = await pedir(e.ruta);
      afirmar(dest.status === 200, `enlace roto ${e.ruta} → ${dest.status}`);
    }
  });

  await verificar("ficha vg:pais:ua — metadatos reales del atlas + cables", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:pais:ua")}`);
    afirmar(r.status === 200 && r.json?.ok, "ficha no ok");
    afirmar((r.json.meta ?? []).some((m) => m.k === "Capital"), "sin capital del atlas");
    afirmar((r.json.cables ?? []).every((c) => c.ruta.startsWith("/noticia/")), "cable sin ruta de noticia");
  });

  // ── v223.0 EL BARÓMETRO: indicadores reales del Banco Mundial ──
  await verificar("EL BARÓMETRO: ficha vg:pais:ua lleva INDICADORES REALES con atribución", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:pais:ua")}`);
    afirmar(r.status === 200 && r.json?.ok, "ficha no ok");
    const ind = r.json.indicadores;
    afirmar(!!ind, "la ficha de país no lleva el bloque de indicadores");
    afirmar(ind.fuente?.licencia?.includes("CC BY 4.0"), "sin licencia CC BY 4.0 declarada");
    afirmar(/bancomundial\.org|worldbank\.org/.test(ind.fuente?.enlace ?? ""), "fuente sin enlace al original");
    if (ind.valores.length > 0) {
      // con red: cada valor lleva año plausible y enlace verificable al original
      const hoy = new Date().getFullYear();
      for (const v of ind.valores) {
        afirmar(v.anio >= 2015 && v.anio <= hoy + 1, `año imposible (${v.anio}) en ${v.codigo}`);
        afirmar(typeof v.texto === "string" && v.texto.length > 0, `valor sin texto en ${v.codigo}`);
        afirmar(v.enlaceOriginal?.includes("bancomundial.org"), `sin enlace al original en ${v.codigo}`);
      }
      const pob = ind.valores.find((v) => v.codigo === "SP.POP.TOTL");
      if (pob) afirmar(/\d/.test(pob.texto), "población sin dígitos");
    } else {
      // sin red AHORA MISMO: la ficha lo DECLARA — nada fingido
      afirmar(typeof ind.nota === "string" && ind.nota.length > 10, "sin valores y sin nota honesta");
    }
  });

  await verificar("entidad inválida → 404 honesto", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:basura:x")}`);
    afirmar(r.status === 404, `status ${r.status} ≠ 404`);
  });

  await verificar("EL BARÓMETRO: Taiwán declara la ausencia del Banco Mundial (se declara, no se finge)", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:pais:tw")}`);
    afirmar(r.status === 200 && r.json?.ok, `ficha tw no ok (${r.status})`);
    const ind = r.json.indicadores;
    afirmar(!!ind, "tw sin bloque de indicadores");
    afirmar(ind.valores.length === 0, `el Banco Mundial no cubre TWN pero llegaron ${ind.valores.length} valores — algo se inventa`);
    afirmar(typeof ind.nota === "string" && ind.nota.length > 10, "ausencia sin nota que la explique");
  });

  await verificar("ficha vg:simulacion:ver-guerra — el módulo vive en el censo", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:simulacion:ver-guerra")}`);
    afirmar(r.status === 200 && r.json?.ok && r.json.modulo?.id === "mod:ver-guerra", "entidad de módulo rota");
  });

  // el historiador: acontecimiento que reúne noticias
  await verificar("GET /api/nucleo/acontecimientos — 9 hechos reales con fecha y fuente", async () => {
    const r = await pedir("/api/nucleo/acontecimientos");
    afirmar(r.status === 200 && r.json?.ok, "no ok");
    afirmar(r.json.total === 9, `total ${r.json.total} ≠ 9 (semilla duplicada o incompleta)`);
    for (const h of r.json.hechos ?? []) {
      afirmar(h.id?.startsWith("vg:acontecimiento:"), `id inestable: ${h.id}`);
      afirmar(typeof h.ocurridoDesde === "string" && h.ocurridoDesde.length >= 10, `${h.slug} sin fecha de inicio del hecho`);
      afirmar(h.noticiasEnArchivo === null || h.noticiasEnArchivo >= 0, "conteo negativo");
    }
    const uc = (r.json.hechos ?? []).find((h) => h.slug === "invasion-rusa-de-ucrania");
    afirmar(uc?.noticiasEnArchivo >= 1, "el acontecimiento de Ucrania no tiene cables reales");
  });

  await verificar("ficha vg:acontecimiento:invasion-rusa-de-ucrania — cronología real + enlaces 200", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:acontecimiento:invasion-rusa-de-ucrania")}`);
    afirmar(r.status === 200 && r.json?.ok, "ficha no ok");
    afirmar((r.json.meta ?? []).some((m) => m.k === "El hecho empezó" && String(m.v).includes("2022")), "sin fecha del HECHO");
    const cron = r.json.cables ?? [];
    afirmar(cron.length >= 1, "cronología vacía — la regla:teatro no enlazó");
    afirmar(cron.every((c) => c.ruta.startsWith("/noticia/")), "cronología con pieza sin página");
    const fechas = cron.map((c) => c.fecha).sort();
    afirmar(String(fechas[fechas.length - 1]) >= String(fechas[0]), "cronología desordenada");
    for (const e of (r.json.enlaces ?? []).slice(0, 4)) {
      const dest = await pedir(e.ruta);
      afirmar(dest.status === 200, `enlace roto ${e.ruta} → ${dest.status}`);
    }
  });

  await verificar("el cartógrafo: la ficha lleva la GEOGRAFÍA del frente con fuente OSINT", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:acontecimiento:invasion-rusa-de-ucrania")}`);
    afirmar(r.status === 200 && r.json?.ok, "ficha no ok");
    const meta = r.json.meta ?? [];
    const puntos = meta.find((m) => m.k === "Puntos del frente");
    afirmar(Boolean(puntos) && puntos.v.startsWith("12 ciudades"), `puntos del frente: ${puntos?.v ?? "ausente"}`);
    afirmar((meta.find((m) => m.k === "Fuente del mapa")?.v ?? "").includes("ISW"), "sin la fuente OSINT que la sala declara");
    afirmar((meta.find((m) => m.k === "Precisión del mapa")?.v ?? "").includes("NO cartografía oficial"), "sin precisión del mapa declarada");
    afirmar((r.json.enlaces ?? []).some((e) => e.ruta === "/ver-guerra" && e.etiqueta.includes("MAPA")), "sin enlace al mapa del frente");
    const geo = r.json.geografia;
    afirmar(geo?.salaGuerra === "ucrania" && Array.isArray(geo?.puntos) && geo.puntos.length === 12, "geografía estructurada rota");
    afirmar(geo.puntos.every((p) => typeof p.lat === "number" && typeof p.lng === "number"), "punto sin coordenada");
    afirmar(typeof geo.fuenteDatos === "string" && geo.fuenteDatos.length > 10, "fuente del mapa vacía");
  });

  await verificar("el cartógrafo: la sala del eje reparte ciudades por tablero (sin fingir)", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:acontecimiento:guerra-israel-gaza")}`);
    afirmar(r.status === 200 && r.json?.ok, "ficha no ok");
    const meta = r.json.meta ?? [];
    const puntos = meta.find((m) => m.k === "Puntos del frente");
    afirmar(Boolean(puntos) && puntos.v.startsWith("5 ciudades"), `tablero gaza: ${puntos?.v ?? "ausente"}`);
    afirmar((meta.find((m) => m.k === "Fuente del mapa")?.v ?? "").includes("OCHA"), "sin la fuente de la sala oriente");
    const nombres = (r.json.geografia?.puntos ?? []).map((p) => p.nombre);
    afirmar(nombres.includes("Gaza (ciudad)") && nombres.includes("Jerusalén"), "ciudades del tablero gaza ausentes");
    afirmar(!nombres.includes("Beirut"), "¡Beirut se coló en el tablero gaza!");
    afirmar(!nombres.includes("Damasco"), "¡Damasco (sin teatro núcleo) se coló!");
  });

  await verificar("el cartógrafo: korea sin sala de guerra se DECLARA, no se finge", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:acontecimiento:ensayos-de-corea-del-norte")}`);
    afirmar(r.status === 200 && r.json?.ok, "ficha no ok");
    const meta = r.json.meta ?? [];
    afirmar((meta.find((m) => m.k === "Mapa del frente")?.v ?? "").includes("sin sala de guerra propia"), "no declara la ausencia de sala");
    afirmar((meta.find((m) => m.k === "Centro del teatro")?.v ?? "").length > 0, "korea sí tiene centro en el globo (TEATRO_3D)");
    const geo = r.json.geografia;
    afirmar(geo?.salaGuerra === null && (geo?.puntos?.length ?? 1) === 0, "geografía fingida para un teatro sin sala");
  });

  await verificar("ficha vg:noticia:<id> — el cable individual con su acontecimiento", async () => {
    if (!cableConTeatro) throw new Error("sin cable de teatro de la prueba de búsqueda");
    const idCable = cableConTeatro.split("/").pop();
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent(`vg:noticia:${idCable}`)}`);
    afirmar(r.status === 200 && r.json?.ok, `ficha de noticia no ok (${r.status})`);
    afirmar(r.json.entidad?.tipo === "noticia", "tipo equivocado");
    const etiquetas = (r.json.enlaces ?? []).map((e) => e.etiqueta);
    afirmar(etiquetas.some((t) => t.includes("ACONTECIMIENTO")), "el cable no conecta con su acontecimiento");
  });

  // navegación
  await verificar("/nucleo responde con censo, entidades y frontera", async () => {
    const r = await pedir("/nucleo");
    afirmar(r.status === 200, "no 200");
    for (const trozo of ["NÚCLEO", "CENSO DE MÓDULOS", "MAPA DE ENTIDADES", "FRONTERA DE DATOS"]) {
      afirmar(r.texto.includes(trozo), `falta «${trozo}» en la página`);
    }
  });

  await verificar("/nucleo?id=… renderiza la ficha server-side", async () => {
    const r = await pedir(`/nucleo?id=${encodeURIComponent("vg:region:ukraine")}`);
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("FICHA DE ENTIDAD"), "sin ficha renderizada");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "sin enlaces contextuales");
  });

  await verificar("EL BARÓMETRO: /nucleo?id=vg:pais:ua renderiza INDICADORES REALES server-side", async () => {
    const r = await pedir(`/nucleo?id=${encodeURIComponent("vg:pais:ua")}`);
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("INDICADORES REALES"), "sin bloque de indicadores en el HTML");
    afirmar(r.texto.includes("CC BY 4.0"), "sin licencia visible en la ficha");
    afirmar(r.texto.includes("bancomundial.org"), "sin enlace al original en el HTML");
  });

  // ── v224.0 EL ESTRATEGA: la simulación pequeña verificable ──
  await verificar("EL ESTRATEGA: GET /api/nucleo/simulacion — el escenario con sus piezas SEPARADAS", async () => {
    const r = await pedir("/api/nucleo/simulacion");
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    afirmar(String(r.json.etiqueta).includes("NO ES PREDICCIÓN"), "la respuesta viaja sin el aviso anti-predicción");
    afirmar(r.json.supuestos?.length >= 5, "supuestos incompletos");
    afirmar(r.json.supuestos.every((s) => s.texto && s.justificacion && s.limite), "un supuesto sin texto/justificación/límite");
    afirmar(r.json.variables?.catalogo?.length === 4, "el catálogo de pesos no tiene 4 variables");
    afirmar(r.json.variables?.aplicadas && Object.keys(r.json.variables.aplicadas).length === 4, "los pesos aplicados no se declaran");
    afirmar(Array.isArray(r.json.datos) && r.json.datos.length === 9, "los DATOS no son separados o no cubren 9 teatros");
    afirmar(Array.isArray(r.json.resultados) && r.json.resultados.length === 9, "los RESULTADOS no son separados o no cubren 9 teatros");
    const d0 = r.json.datos[0];
    afirmar(Array.isArray(d0.procedencias) && d0.procedencias.some((p) => p.startsWith("fnt:")), "un dato sin procedencia declarada");
    const conTotal = r.json.resultados.filter((x) => x.total !== null);
    afirmar(conTotal.length >= 6, `solo ${conTotal.length} teatros con puntuación`);
    for (let i = 1; i < conTotal.length; i++) {
      afirmar(conTotal[i - 1].total >= conTotal[i].total, "el orden por presión no está ordenado");
    }
    const u = r.json.resultados.find((x) => x.slug === "ukraine");
    afirmar(u?.factores?.tiempo?.ancla?.includes("días") && u?.factores?.cobertura?.ancla?.includes("cables"), "el desglose no muestra las anclas editoriales");
  });

  await verificar("EL ESTRATEGA: determinista — dos ejecuciones idénticas, mismo resultado", async () => {
    const a = await pedir("/api/nucleo/simulacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variables: {} }),
    });
    const b = await pedir("/api/nucleo/simulacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variables: {} }),
    });
    afirmar(a.status === 200 && b.status === 200, "alguna ejecución no ok");
    const ra = JSON.stringify(a.json.resultados);
    const rb = JSON.stringify(b.json.resultados);
    afirmar(ra === rb, "mismo input dio outputs distintos — el escenario NO es determinista");
  });

  await verificar("EL ESTRATEGA: los pesos mandan — solo frentes pone a Ucrania en 100 y deja a Corea sin puntuación", async () => {
    const r = await pedir("/api/nucleo/simulacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variables: { pesoTiempo: 0, pesoCobertura: 0, pesoCapacidad: 0, pesoFrentes: 2 } }),
    });
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    const ukraine = r.json.resultados.find((x) => x.slug === "ukraine");
    afirmar(ukraine?.total === 100, `el frente más documentado no satura su factor: ${ukraine?.total}`);
    const korea = r.json.resultados.find((x) => x.slug === "korea");
    afirmar(korea?.total === null, "Corea puntúa sin sala OSINT — algo se inventa");
    afirmar(korea?.faltantes?.includes("frentes"), "la ausencia de sala de Corea no se declara");
    afirmar(r.json.resultados[0]?.slug === "ukraine", "el teatro saturado no lidera el orden");
  });

  await verificar("EL ESTRATEGA: variables basura → 400 con los errores declarados (sin código de usuarios)", async () => {
    const r1 = await pedir("/api/nucleo/simulacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variables: { pesoMagia: 1 } }),
    });
    afirmar(r1.status === 400, `clave desconocida → ${r1.status} ≠ 400`);
    afirmar(String(r1.json?.errores?.[0] ?? "").includes("pesoTiempo"), "el 400 no lista las variables válidas");
    const r2 = await pedir("/api/nucleo/simulacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variables: { pesoTiempo: 99 } }),
    });
    afirmar(r2.status === 400 && String(r2.json?.errores?.[0]).includes("entre 0 y 2"), `fuera de rango → ${r2.status}`);
    const r3 = await pedir("/api/nucleo/simulacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variables: { pesoCobertura: "alto" } }),
    });
    afirmar(r3.status === 400, `no numérico → ${r3.status} ≠ 400`);
  });

  await verificar("EL ESTRATEGA: todo a cero — el escenario no puntúa nada y lo DECLARA", async () => {
    const r = await pedir("/api/nucleo/simulacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variables: { pesoTiempo: 0, pesoCobertura: 0, pesoFrentes: 0, pesoCapacidad: 0 } }),
    });
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    afirmar(r.json.resultados.every((x) => x.total === null), "con pesos 0 hay puntuaciones — algo se inventa");
    afirmar(r.json.resultados.every((x) => Array.isArray(x.faltantes)), "sin la declaración de lo excluido");
  });

  await verificar("ficha vg:simulacion:escenarios — el módulo vive en el censo", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:simulacion:escenarios")}`);
    afirmar(r.status === 200 && r.json?.ok && r.json.modulo?.id === "mod:escenarios", "entidad del estratega rota");
  });

  await verificar("/escenarios renderiza el escenario con el aviso NO ES PREDICCIÓN y los supuestos", async () => {
    const r = await pedir("/escenarios");
    afirmar(r.status === 200, "no 200");
    for (const trozo of ["EL ", "NO ES PREDICCIÓN", "LOS SUPUESTOS", "SUP-TIEMPO", "LOS LÍMITES"]) {
      afirmar(r.texto.includes(trozo), `falta «${trozo}» en la página`);
    }
  });

  await verificar("los chips contextuales viven en /conflicto/ukraine", async () => {
    const r = await pedir("/conflicto/ukraine");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "chips ausentes en la ficha de teatro");
  });

  // ── v227.0 EL DESPLIEGUE: el teatro lista SUS frentes documentados ──
  await verificar("EL DESPLIEGUE: /conflicto/ukraine lista sus 12 frentes con ficha, fuente y mapa", async () => {
    const r = await pedir("/conflicto/ukraine");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("Los frentes del teatro"), "sin la sección de frentes del teatro");
    afirmar(/documentados<[^>]*>|documentados<\/h2>/.test(r.texto) || r.texto.includes("documentados"), "sin el conteo de frentes");
    afirmar(r.texto.includes("Bajmut"), "Bajmut no aparece en el despliegue del teatro");
    afirmar(r.texto.includes("id=vg%3Apunto%3A"), "los frentes no llevan a su ficha vg:punto");
    afirmar(r.texto.includes("ISW"), "sin la fuente OSINT de la sala citada");
    afirmar(r.texto.includes("NO cartografía oficial"), "sin la precisión declarada");
    afirmar(r.texto.includes("/ver-guerra"), "sin enlace al mapa del frente");
  });

  await verificar("EL DESPLIEGUE: /conflicto/korea declara la ausencia de frentes (nada fingido)", async () => {
    const r = await pedir("/conflicto/korea");
    afirmar(r.status === 200, `korea → ${r.status} (el teatro tiene cables, la puerta debe abrirse)`);
    afirmar(r.texto.includes("Sin frentes documentados"), "la ausencia de sala no se declara");
    afirmar(r.texto.includes("no inventa puntos"), "la razón de la ausencia no se explica");
    afirmar(/Los frentes del teatro — \d+/.test(r.texto) === false, "¡korea finge una lista de frentes!");
  });

  // ── v228.0 EL ATLAS: fichas de país más ricas ──
  await verificar("EL ATLAS: la ficha de Ucrania muestra población, superficie, moneda y SUS frentes (v228)", async () => {
    const r = await pedir(`/nucleo?id=${encodeURIComponent("vg:pais:ua")}`);
    afirmar(r.status === 200, "no 200");
    // la ficha rica del atlas (documentada, edición 2026)
    afirmar(r.texto.includes("Población"), "sin población del atlas");
    afirmar(r.texto.includes("millones"), "población sin el formato del atlas");
    afirmar(r.texto.includes("km²"), "sin superficie del atlas");
    afirmar(r.texto.includes("Grivna"), "sin la moneda documentada del atlas");
    // los frentes del teatro del país, hacia su ficha y con su fuente
    afirmar(r.texto.includes("FRENTE:"), "sin los frentes del teatro del país");
    afirmar(r.texto.includes("id=vg%3Apunto%3A"), "los frentes no llevan a su ficha vg:punto");
    afirmar(r.texto.includes("ISW"), "sin la fuente OSINT citada en los frentes");
    afirmar(r.texto.includes("/ver-guerra"), "sin enlace a la sala de guerra");
  });

  await verificar("EL ATLAS: Brasil sin teatro declara ficha rica SIN fingir frentes (v228)", async () => {
    const r = await pedir(`/nucleo?id=${encodeURIComponent("vg:pais:br")}`);
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("Población"), "sin la ficha rica del atlas");
    afirmar(r.texto.includes("millones"), "sin el formato del atlas");
    afirmar(!r.texto.includes("FRENTE:"), "¡Brasil finge frentes sin teatro!");
  });

  // ── v229.0 EL PUENTE: el mural conecta con el núcleo ──
  await verificar("EL PUENTE: /ver-guerra lista teatros con cables reales, acontecimiento y honestidad (v229)", async () => {
    const r = await pedir("/ver-guerra");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("cables en la agencia"), "sin los chips de conteo real del puente");
    afirmar(r.texto.includes("/conflicto/ukraine"), "el frente DONBÁS no lleva a su teatro real");
    afirmar(r.texto.includes("id=vg%3Aacontecimiento%3A"), "sin las fichas del acontecimiento en el puente");
    afirmar(r.texto.includes("no inventa puertas"), "sin la declaración honesta de los frentes sin teatro");
    afirmar(r.texto.includes("SOMALIA") && r.texto.includes("HAITÍ"), "la lista honesta no nombra los frentes del catálogo");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "sin el bloque de puertas al núcleo");
  });

  // ── v230.0 EL ESPEJO: la ficción muestra la guerra real que la alimenta ──
  await verificar("EL ESPEJO: /zona-cero proyecta la guerra real sin fingir ni fechas (v230)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/zona-cero/page.tsx"), "utf8");
    // los teatros salen del catálogo de la casa y el conteo es REAL de la BD
    for (const trozo of ["TEATROS", "slugAcontecimientoDeTeatro", "groupBy", "no finge conteos"]) {
      afirmar(pag.includes(trozo), `el espejo no declara «${trozo}»`);
    }
    // anti-invención: CERO fechas históricas escritas a mano (viven en la semilla v219)
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la página del espejo escribe fechas históricas a mano!");
    // la ficción se declara: el aviso artístico original queda intacto
    afirmar(pag.includes("no representa a ningún ejército real"), "el aviso de ficción fue tocado");
    // el censo declara las dependencias reales del simulador
    const reg = readFileSync(join(RAIZ, "src/lib/nucleo/registro.ts"), "utf8");
    afirmar(/id: "mod:zona-cero"[\s\S]*?dependencias: \["fnt:teatros", "fnt:cables"\]/.test(reg),
      "mod:zona-cero sin sus dependencias reales fnt:teatros + fnt:cables");
    // la materia prima: solo puertas REALES (nunca /conflicto sin tag, que sería 404)
    const rel = readFileSync(join(RAIZ, "src/lib/nucleo/relaciones.ts"), "utf8");
    afirmar(rel.includes("PUERTA_DE_FUENTE"), "sin el mapa de puertas de la materia prima");
    afirmar(!rel.includes('ruta: "/conflicto",'), "¡puerta inventada a /conflicto sin tag!");
  });

  await verificar("EL ESPEJO vivo: /zona-cero con teatros reales, acontecimiento y puertas al núcleo (v230)", async () => {
    const r = await pedir("/zona-cero");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("LA GUERRA REAL DETRÁS DEL ESPEJO"), "sin la sección de la guerra real");
    afirmar(r.texto.includes("cables en la agencia"), "sin los chips de conteo real");
    afirmar(r.texto.includes("/conflicto/ukraine"), "el teatro real no tiene su sala");
    afirmar(r.texto.includes("id=vg%3Aacontecimiento%3A"), "sin las fichas del acontecimiento en el espejo");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "sin el bloque de puertas al núcleo");
    afirmar(r.texto.includes("/ver-guerra"), "sin la puerta al mural FRENTE TOTAL");
  });

  await verificar("LA MATERIA PRIMA: toda ficha de módulo proyecta sus fuentes fnt: (v230)", async () => {
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:simulacion:zona-cero")}`);
    afirmar(r.status === 200 && r.json?.ok, "ficha del simulador no ok");
    const enlaces = r.json.enlaces ?? [];
    const archivo = enlaces.find((e) => e.etiqueta === "EL ARCHIVO DE CABLES ▸");
    afirmar(!!archivo, "la ficha no muestra su materia prima (fnt:cables)");
    afirmar(archivo?.ruta === "/nucleo?tipo=noticia", "la puerta del archivo no es la real");
    const salas = enlaces.find((e) => e.etiqueta === "LAS SALAS DE GUERRA ▸");
    afirmar(salas?.ruta === "/mundo", "la puerta de las salas no es la real");
    // y las puertas de la materia prima RESPONDEN 200
    for (const e of enlaces.filter((x) => x.tipoRelacion === "documenta")) {
      const dest = await pedir(e.ruta);
      afirmar(dest.status === 200, `puerta de materia prima rota ${e.ruta} → ${dest.status}`);
    }
  });

  // ── v232.0 LA CENTRAL DE ALARMAS: la campana del HUD llama a la primicia ──
  await verificar("v232 LA CENTRAL DE ALARMAS: la ley de la alarma vive en el árbol", async () => {
    const fs = await import("node:fs");
    const alarma = fs.readFileSync("src/lib/alarma.ts", "utf8");
    afirmar(alarma.includes("UMBRAL_ALARMA = TIERS.critico.min"), "la ley de la alarma no es el escalón CRÍTICO");
    afirmar(alarma.includes("VENTANA_MIN = 120"), "la ventana EN VIVO no es 120 min");
    const central = fs.readFileSync("src/components/vanguard/central-alarmas.tsx", "utf8");
    afirmar(central.includes("ÚLTIMA HORA"), "el toast ÚLTIMA HORA no vive en la Central");
    const centro = fs.readFileSync("src/components/vanguard/panels/centro-panel.tsx", "utf8");
    afirmar(centro.includes("useAlarma.getState().limpiar()"), "el CENTRO no revisa la campana");
  });

  // ── v234.0 LA ONDA: la emisora conecta con toda la casa ──
  await verificar("LA ONDA: el parte lleva el id del último hecho y las puertas son las reales (v234)", () => {
    const emisor = readFileSync(join(RAIZ, "src/lib/emisor-guerra.ts"), "utf8");
    afirmar(emisor.includes("ultimoId"), "el parte no lleva el id del último hecho");
    afirmar(emisor.includes("select: { title: true, id: true }"), "el id no sale de la MISMA consulta (nada inventado)");
    const emisora = readFileSync(join(RAIZ, "src/app/audios/emisora-cliente.tsx"), "utf8");
    // las tres puertas del frente: sala real, cable del hecho, globo
    for (const trozo of ["/conflicto/${t.tag}", "/noticia/${t.ultimoId}", "/mundo?teatro="]) {
      afirmar(emisora.includes(trozo), `la emisora no declara la puerta «${trozo}»`);
    }
    // la puerta del último hecho es CONDICIONAL (sin titular no hay puerta)
    afirmar(emisora.includes("t.ultimoTitular && t.ultimoId"), "la puerta del último hecho no tiene guarda honesta");
    // cero conteos a mano en la emisora (los cables/24h vienen de la BD)
    afirmar(!/\d+ cables\//.test(emisora), "¡la emisora escribe conteos de cables a mano!");
    const pag = readFileSync(join(RAIZ, "src/app/audios/page.tsx"), "utf8");
    for (const trozo of ["jsonLdSeguro", "CONECTA CON EL NÚCLEO", "noscript", "/nucleo?tipo=noticia", "/ver-guerra"]) {
      afirmar(pag.includes(trozo), `la página de la emisora no declara «${trozo}»`);
    }
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la página de la emisora escribe fechas a mano!");
  });

  await verificar("LA ONDA viva: /audios sirve las puertas del frente y la conexión con el núcleo (v234)", async () => {
    const r = await pedir("/audios");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("/conflicto/ukraine"), "los frentes no abren su sala real");
    afirmar(r.texto.includes("/noticia/"), "el último hecho no abre su cable");
    afirmar(r.texto.includes("/mundo?teatro="), "sin la onda corta al globo");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "sin la conexión con el núcleo");
    afirmar(r.texto.includes("EL ARCHIVO DE CABLES"), "sin la puerta del archivo");
    afirmar(r.texto.includes("application/ld+json"), "sin JSON-LD honesto");
  });

  await verificar("LA ONDA: las puertas de la emisora responden 200 una a una (v234)", async () => {
    for (const ruta of ["/mundo?teatro=ukraine", "/conflicto/gaza", "/nucleo?tipo=noticia", "/ver-guerra", "/guerra-hoy"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `puerta de la onda rota ${ruta} → ${r.status}`);
    }
  });

  // ── v235.0 EL BOTÍN: la vitrina cuenta lo que vale la caza y muestra el camino ──
  await verificar("EL BOTÍN: la balanza suma el catálogo real y el mapa de caza solo tiene rutas reales (v235)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/objetivos/page.tsx"), "utf8");
    // la balanza se DERIVA: reduce para el botín, filter para el censo — nada a mano
    afirmar(pag.includes("ACHIEVEMENTS.reduce"), "el botín no se suma del catálogo (reduce)");
    afirmar(pag.includes("ACHIEVEMENTS.filter"), "el censo por rareza no sale del catálogo (filter)");
    // cero cifras de botín escritas a mano (solo expresiones {…} y el 100 estructural)
    const cuerpo = pag.split("export default function")[1] || "";
    afirmar(!/\+\s?\d[\d.]{2,}\s?(mon|gemas|XP)/.test(cuerpo), "¡la balanza escribe cifras a mano!");
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la vitrina escribe fechas a mano!");
    // el mapa de caza: SOLO rutas reales de la casa, cada una con su verdad
    for (const ruta of ['ruta: "/"', 'ruta: "/vertigo"', 'ruta: "/mundo"', 'ruta: "/ver-guerra"']) {
      afirmar(pag.includes(ruta), `el mapa de caza no declara la ruta real ${ruta}`);
    }
    afirmar(pag.includes("Los ${ACHIEVEMENTS.length} se cazan aquí"), "el mapa no dice la verdad del aparato (compuesto de la fuente, no a mano)");
    // conexión con el núcleo (patrón v230) + noscript
    for (const trozo of ["EnlacesNucleo", "CONECTA CON EL NÚCLEO", "noscript", "jsonLdSeguro"]) {
      afirmar(pag.includes(trozo), `la vitrina no declara «${trozo}»`);
    }
  });

  await verificar("EL BOTÍN viva: /objetivos sirve la balanza, el censo y las puertas en el SSR (v235)", async () => {
    const r = await pedir("/objetivos");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("La balanza del botín"), "sin la balanza del botín");
    afirmar(r.texto.includes("mon◉ en total"), "sin el total de monedas derivado");
    afirmar(r.texto.includes("gemas en total"), "sin el total de gemas derivado");
    afirmar(r.texto.includes("El mapa de caza"), "sin el mapa de caza");
    afirmar(r.texto.includes("EL APARATO"), "sin la puerta del aparato");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "sin la conexión con el núcleo");
    afirmar(r.texto.includes("application/ld+json"), "sin JSON-LD honesto");
    // el censo por rareza en el SSR (las 4 rarezas con su ×N derivado)
    for (const metal of ["COMUN ×", "RARO ×", "EPICO ×", "LEGENDARIO ×"]) {
      afirmar(r.texto.includes(metal), `el censo no muestra ${metal}N`);
    }
  });

  await verificar("EL BOTÍN: las puertas del mapa de caza responden 200 una a una (v235)", async () => {
    for (const ruta of ["/", "/vertigo", "/mundo", "/ver-guerra", "/nucleo", "/guerra-hoy"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `puerta de la vitrina rota ${ruta} → ${r.status}`);
    }
  });

  // ── v236.0 EL GLOSARIO: el traductor muestra sus tuercas y abre sus cables ──
  await verificar("EL GLOSARIO: fuente única consumida por la API y la vitrina, puerta del cable (v236)", () => {
    const lib = readFileSync(join(RAIZ, "src/lib/glosario-tactico.ts"), "utf8");
    afirmar(lib.includes("export const GLOSARIO_TACTICO"), "el inventario no vive en su fuente única");
    afirmar(lib.includes("export function paresGlosario"), "sin la función de pares para la vitrina");
    // la API ya NO define su propio inventario: consume la fuente única
    const api = readFileSync(join(RAIZ, "src/app/api/traductor/route.ts"), "utf8");
    afirmar(api.includes('from "@/lib/glosario-tactico"'), "la API no consume la fuente única");
    afirmar(!api.includes('"alto el fuego": "ceasefire"'), "¡la API duplica el inventario!");
    afirmar(api.includes("GLOSARIO_TACTICO"), "la vía 3 no usa el glosario de la fuente");
    const pag = readFileSync(join(RAIZ, "src/app/traductor/page.tsx"), "utf8");
    afirmar(pag.includes("paresGlosario"), "la vitrina no pinta el glosario");
    afirmar(pag.includes("PARES_GLOSARIO.length"), "el conteo del glosario no es derivado");
    // cero fechas escritas a mano en la página
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la página del traductor escribe fechas a mano!");
    // la puerta del cable en el estudio (client) — con el id real del pulso
    const estudio = readFileSync(join(RAIZ, "src/app/traductor/traductor-estudio.tsx"), "utf8");
    afirmar(estudio.includes("/noticia/${c.id}"), "los cables vivos siguen siendo datos muertos");
    // conexión con el núcleo (patrón v230) + noscript + JSON-LD intacto
    for (const trozo of ["EnlacesNucleo", "CONECTA CON EL NÚCLEO", "noscript", "/nucleo?tipo=noticia", "jsonLdSeguro"]) {
      afirmar(pag.includes(trozo), `la página del traductor no declara «${trozo}»`);
    }
  });

  await verificar("EL GLOSARIO viva: /traductor sirve el inventario completo y la conexión en el SSR (v236)", async () => {
    const r = await pedir("/traductor");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("El glosario táctico"), "sin la sección del glosario");
    afirmar(r.texto.includes("términos es"), "sin el conteo derivado de términos");
    // pares REALES de la fuente única en el SSR (muestra del inventario)
    for (const par of ["alto el fuego ⇄ ceasefire", "guerra ⇄ war", "armas nucleares ⇄ nuclear weapons"]) {
      afirmar(r.texto.includes(par), `el par «${par}» no vive en el SSR`);
    }
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "sin la conexión con el núcleo");
    afirmar(r.texto.includes("EL ARCHIVO DE CABLES"), "sin la puerta del archivo");
    afirmar(r.texto.includes("application/ld+json"), "sin JSON-LD honesto");
  });

  await verificar("EL GLOSARIO: las puertas del traductor responden 200 una a una (v236)", async () => {
    for (const ruta of ["/nucleo?tipo=noticia", "/vertigo", "/nucleo", "/guerra-hoy", "/en-vivo"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `puerta del traductor rota ${ruta} → ${r.status}`);
    }
  });

  // ── v237.0 EL RELIEVE: el globo a dieta y las pieles en su fuente única ──
  await verificar("EL RELIEVE: fuente única de las pieles, cero rutas repetidas a mano (v237)", () => {
    const lib = readFileSync(join(RAIZ, "src/lib/globe-assets.ts"), "utf8");
    afirmar(lib.includes("export const TEXTURA_RELIEVE"), "el relieve no vive en su fuente única");
    afirmar(lib.includes("export const TEXTURAS_VISTA"), "sin el mapa de pieles en la fuente");
    afirmar(lib.includes("export type GlobeViewMode"), "sin el tipo de vista en la fuente");
    afirmar(lib.includes("TEXTURA_RELIEVE_ORIGINAL"), "el negativo original no está declarado");
    // cero fechas escritas a mano en el lib (ley de la casa)
    afirmar(!/20\d\d-\d\d-\d\d/.test(lib), "¡el lib de pieles escribe fechas a mano!");
    // las 4 salas 3D consumen la fuente — y NINGUNA conserva la ruta a mano
    const salas = [
      "src/components/vanguard/globe-3d.tsx",
      "src/components/vanguard/globe-map-3d.tsx",
      "src/components/vanguard/panels/tierra-panel.tsx",
      "src/components/vanguard/panels/conquistas-3d-panel.tsx",
    ];
    for (const sala of salas) {
      const code = readFileSync(join(RAIZ, sala), "utf8");
      afirmar(code.includes('from "@/lib/globe-assets"'), `${sala} no consume la fuente única`);
      afirmar(!code.includes("/assets/globe/"), `¡${sala} todavía escribe la ruta de la piel a mano!`);
      afirmar(!code.includes("VIEW_TEXTURES"), `¡${sala} conserva el mapa duplicado!`);
    }
    // el tipo sigue exportándose desde los dos componentes (compatibilidad)
    for (const sala of ["src/components/vanguard/globe-3d.tsx", "src/components/vanguard/globe-map-3d.tsx"]) {
      const code = readFileSync(join(RAIZ, sala), "utf8");
      afirmar(code.includes("export type { GlobeViewMode }"), `${sala} no re-exporta el tipo para sus consumidores`);
    }
    // el negativo ORIGINAL sigue en disco y el webp pesa MENOS (fs, no cifras a mano)
    const png = join(RAIZ, "public/assets/globe/earth-topology.png");
    const webp = join(RAIZ, "public/assets/globe/earth-topology.webp");
    afirmar(existsSync(png), "¡el negativo PNG fue borrado! (la casa no borra obra)");
    afirmar(existsSync(webp), "el relieve a dieta no existe");
    afirmar(statSync(webp).size < statSync(png).size, "el webp no es más ligero que el PNG");
  });

  await verificar("EL RELIEVE viva: el webp se sirve ligero y el negativo sigue servido (v237)", async () => {
    const webp = await pedir("/assets/globe/earth-topology.webp");
    afirmar(webp.status === 200, `webp → ${webp.status}`);
    const tipo = String(webp.headers?.["content-type"] || "");
    afirmar(tipo.includes("image/webp"), `content-type del webp: ${tipo}`);
    const png = await pedir("/assets/globe/earth-topology.png");
    afirmar(png.status === 200, `el negativo PNG ya no se sirve (${png.status})`);
    afirmar(Number(webp.headers?.["content-length"] || 0) < Number(png.headers?.["content-length"] || 1),
      "el webp viaja más pesado que el PNG — la dieta es mentira");
  });

  await verificar("EL RELIEVE: las salas 3D de la casa responden 200 (v237)", async () => {
    for (const ruta of ["/", "/mundo", "/ver-guerra"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `sala del globo rota ${ruta} → ${r.status}`);
    }
  });

  // ── v238.0 EL VELOCÍMETRO: medir primero, presupuestos contra la inflación ──
  await verificar("EL VELOCÍMETRO: instrumento honesto y dieta de las salas (v238)", () => {
    const inst = readFileSync(join(RAIZ, "scripts/velocimetro.mjs"), "utf8");
    // el detector de three es de CÓDIGO (sobrevive a la minificación), jamás texto
    afirmar(inst.includes("WebGLRenderer|PerspectiveCamera"), "el detector de three no usa marcadores de código");
    afirmar(inst.includes("const ES_THREE"), "sin detector nombrado de three en el velocímetro");
    // toda medición declara la versión que midió (lección del zombi)
    afirmar(inst.includes("api/health") && inst.includes("versionMedida"), "el velocímetro no declara la versión que mide");
    // las 6 thumbs del teatro existen y pesan MENOS que sus originales (fs, no cifras a mano)
    for (const n of ["drone-1", "city-1", "ship-1", "fire-1", "jet-1", "tanks-1"]) {
      const thumb = join(RAIZ, `public/assets/real/thumbs/${n}.webp`);
      const original = join(RAIZ, `public/assets/real/${n}.jpg`);
      afirmar(existsSync(thumb), `falta la variante ligera ${n}.webp`);
      afirmar(existsSync(original), `¡el original ${n}.jpg fue borrado! (la casa no borra obra)`);
      afirmar(statSync(thumb).size < statSync(original).size, `la thumb ${n} no es más ligera que su original`);
    }
    // la sala del teatro cita las thumbs y no los originales
    const sala = readFileSync(join(RAIZ, "src/app/conflicto/[tag]/page.tsx"), "utf8");
    afirmar(sala.includes("/assets/real/thumbs/"), "el teatro no sirve las variantes ligeras");
    afirmar(!sala.includes('"/assets/real/drone-1.jpg"'), "el teatro todavía cita el fallback pesado a mano");
  });

  await verificar("EL VELOCÍMETRO viva: el teatro sirve thumbs y la sala sigue en pie (v238)", async () => {
    const r = await pedir("/conflicto/ukraine");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("/assets/real/thumbs/"), "el SSR no cita las thumbs");
    afirmar(!r.texto.includes('"/assets/real/drone-1.jpg"'), "el SSR todavía sirve el fallback pesado");
    const thumb = await pedir("/assets/real/thumbs/drone-1.webp");
    afirmar(thumb.status === 200, `thumb → ${thumb.status}`);
    afirmar(String(thumb.headers?.["content-type"] || "").includes("image/webp"), "content-type de la thumb no es webp");
    // presupuestos contra la inflación (línea base v238 con margen generoso):
    // el documento del teatro y del planeta no pueden engordar callados
    const docTeatro = await pedir("/conflicto/ukraine");
    afirmar(docTeatro.texto.length < 1_200_000, `el HTML del teatro engordó (${(docTeatro.texto.length / 1024).toFixed(0)} KB crudo)`);
    const docMundo = await pedir("/mundo");
    afirmar(docMundo.texto.length < 900_000, `el HTML del mundo engordó (${(docMundo.texto.length / 1024).toFixed(0)} KB crudo)`);
  });

  await verificar("EL VELOCÍMETRO: las salas medidas siguen respondiendo 200 (v238)", async () => {
    for (const ruta of ["/mundo", "/conflicto/ukraine", "/", "/guerra-hoy"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `sala medida rota ${ruta} → ${r.status}`);
    }
  });

  // ── v239.0 EL FRENTE LIGERO: la primera página entera cae en fallback y
  // sus slots son pequeños (220×140 y 96×72) — las thumbs de v238 visten
  // estas salas; la metadata social y el hero conservan el ORIGINAL
  // (og/twitter declaran 1200×630: una thumb ahí es mentirle al crawler).
  // v247.0 LA CARGA JUSTA afina el reparto a TRES pieles, ninguna mentirosa:
  // la metadata social viste el ORIGINAL (dims reales declaradas), el hero
  // de la página viste la piel og WebP 1200×630 (el slot ya recortaba en
  // pantalla) y las thumbs visten las cards — la JPG pesada no viaja más
  // como src en ninguna sala.
  await verificar("EL FRENTE LIGERO: las dos pieles viven separadas y honestas (v239)", () => {
    // /guerra-hoy: la lista entera en thumbs, cero fallback pesado a mano
    const frente = readFileSync(join(RAIZ, "src/app/guerra-hoy/page.tsx"), "utf8");
    afirmar(frente.includes("/assets/real/thumbs/"), "guerra-hoy no sirve las variantes ligeras");
    afirmar(!frente.includes('"/assets/real/drone-1.jpg"'), "guerra-hoy todavía cita el fallback pesado a mano");
    afirmar(frente.includes("/api/og"), "la metadata social de guerra-hoy dejó de usar /api/og");
    // /noticia: TRES arrays desde v247 — el original para la metadata social,
    // la piel og para el hero, la thumb para las relacionadas
    const sala = readFileSync(join(RAIZ, "src/app/noticia/[id]/page.tsx"), "utf8");
    afirmar(sala.includes("FALLBACK_THUMBS") && sala.includes("FALLBACK_IMGS"), "noticia no declara las dos pieles");
    afirmar(sala.includes("thumbDe") && sala.includes("imgDe"), "noticia perdió uno de los dos vestidores");
    // la metadata social (og/twitter/JSON-LD) se viste con el ORIGINAL —
    // imgDe alimenta openGraph y el JSON-LD; thumbDe solo las relacionadas
    // (v247: el ancla tolera el formato multilínea, la intención es la misma)
    afirmar(/images:\s*\[\s*\{\s*url:\s*img,/.test(sala), "el og:image de noticia no viste con el original");
    afirmar(/image:\s*\[new URL\(img,\s*SITE_URL\)\.toString\(\)\]/.test(sala), "el JSON-LD de noticia no anuncia el original");
    afirmar(/src=\{thumbDe\(r,\s*i \+ 1\)\}/.test(sala), "las relacionadas de noticia no visten con la thumb");
    // el hero (w-full) viste la piel og WebP de v247 — nunca la thumb
    afirmar(/src=\{hero\}/.test(sala), "el hero de noticia dejó de citar a la piel og");
    afirmar(/fetchPriority="high"/.test(sala), "el hero de noticia perdió su prioridad LCP");
    afirmar(!/src=\{img\b[^}]*\}[^>]*96/.test(sala), "un slot de 96 px viste el original — la dieta se coló donde no iba");
  });

  await verificar("EL FRENTE LIGERO viva: guerra-hoy en thumbs y la puerta del cable honesta (v239)", async () => {
    // la primera página: el SSR entero en thumbs, cero JPG crudo del archivo
    const frente = await pedir("/guerra-hoy");
    afirmar(frente.status === 200, `no 200 (${frente.status})`);
    afirmar(frente.texto.includes("/assets/real/thumbs/"), "el SSR de guerra-hoy no cita las thumbs");
    const crudos = frente.texto.match(/\/assets\/real\/[a-z0-9-]+\.jpg/g) || [];
    afirmar(crudos.length === 0, `guerra-hoy todavía sirve JPG crudo (${[...new Set(crudos)].join(", ")})`);
    // la puerta del cable: relacionadas en thumbs, metadata en el original
    // absoluto (metadataBase) y hero en la piel og — el id sale del SSR de
    // guerra-hoy (BD real, jamás escrito a mano)
    const idCable = (frente.texto.match(/\/noticia\/(cm[a-z0-9]+)/) || [])[1];
    afirmar(Boolean(idCable), "guerra-hoy no expone ninguna puerta /noticia/<id>");
    const sala = await pedir(`/noticia/${idCable}`);
    afirmar(sala.status === 200, `la sala del cable no 200 (${sala.status})`);
    afirmar(sala.texto.includes("/assets/real/thumbs/"), "las relacionadas no visten thumbs en el SSR");
    // v247: la metadata social sigue en el ORIGINAL (la JPG, absoluto o
    // relativo) — jamás con la thumb; y la JPG pesada ya no viaja como src
    const ogMeta = (sala.texto.match(/<meta property="og:image" content="([^"]+)"/) || [])[1] ?? "";
    afirmar(ogMeta.length > 0, "el cable no declara og:image");
    afirmar(!ogMeta.includes("/thumbs/"), "el og:image viste con la thumb — la dieta se coló en la metadata");
    afirmar(/\/assets\/real\/[a-z0-9-]+\.jpg/.test(ogMeta), `el og:image dejó el original: ${ogMeta}`);
    const crudosSala = sala.texto.match(/src="\/assets\/real\/[a-z0-9-]+\.jpg"/g) || [];
    afirmar(crudosSala.length === 0, `la JPG pesada todavía viaja como src (${[...new Set(crudosSala)].join(", ")})`);
    const heroOg = (sala.texto.match(/<img[^>]*\/assets\/real\/og\/[a-z0-9-]+\.webp[^>]*>/) || [])[0] ?? "";
    afirmar(heroOg.length > 0, "el hero no viste la piel og webp en el SSR");
    afirmar(/fetchpriority="high"/i.test(heroOg), "el hero og webp llegó sin prioridad LCP al SSR");
  });

  await verificar("EL FRENTE LIGERO: las salas vestidas siguen respondiendo 200 (v239)", async () => {
    for (const ruta of ["/guerra-hoy", "/conflicto/ukraine", "/mundo"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `sala vestida rota ${ruta} → ${r.status}`);
    }
    const thumb = await pedir("/assets/real/thumbs/tanks-1.webp");
    afirmar(thumb.status === 200, `thumb de la lista → ${thumb.status}`);
    afirmar(String(thumb.headers?.["content-type"] || "").includes("image/webp"), "content-type de la thumb no es webp");
  });

  // ── v240.0 EL REPARTO: la ley v222 (three JAMÁS en el HTML crítico) llega
  // a /zona-cero — los dos teatros 3D viajaban ESTÁTICOS en la primera
  // pintura; ahora cargan bajo demanda y el modo 2D no baja three jamás.
  await verificar("EL REPARTO: los teatros de zona-cero cargan bajo demanda (v240)", () => {
    const tabs = readFileSync(join(RAIZ, "src/components/vanguard/zona-cero-tabs.tsx"), "utf8");
    // la ley se declara donde se aplica
    afirmar(tabs.includes("v222"), "tabs no cita la ley que aplica");
    // dynamic con ssr:false presente para AMBOS teatros (patrón de los globos)
    afirmar((tabs.match(/dynamic\(/g) || []).length >= 2, "faltan cargas bajo demanda en los tabs");
    afirmar((tabs.match(/ssr:\s*false/g) || []).length >= 2, "los teatros 3D no se cargan con ssr:false");
    // CERO import estático de los dos teatros pesados (three viaja en ellos)
    afirmar(!/import\s*\{[^}]*TeatroGlobal3D[^}]*\}\s*from\s*"\.\/teatro-global-3d"/.test(tabs),
      "¡TeatroGlobal3D sigue importado ESTÁTICAMENTE!");
    afirmar(!/import\s*\{[^}]*ZonaCero3D[^}]*\}\s*from\s*"\.\/zona-cero-3d"/.test(tabs),
      "¡ZonaCero3D sigue importado ESTÁTICAMENTE!");
    // el lienzo 2D sigue estático: canvas barato, no le debe nada a three
    afirmar(/import\s*\{\s*ZonaCeroSim\s*\}\s*from\s*"\.\/zona-cero-sim"/.test(tabs),
      "el lienzo 2D clásico dejó de ser estático");
  });

  await verificar("EL REPARTO viva: /zona-cero sin three en el HTML crítico (v240)", async () => {
    const r = await pedir("/zona-cero");
    afirmar(r.status === 200, `no 200 (${r.status})`);
    // los tabs siguen server-rendered con sus tres modos
    afirmar(r.texto.includes("Teatro global 3D") && r.texto.includes("Frente táctico 3D") && r.texto.includes("Ciudad 2D clásica"),
      "los tres modos del selector no viven en el SSR");
    // LA LEY: cada JS que el HTML crítico declara se descarga y se examina —
    // NINGUNO puede llevar el MOTOR de three. Marcadores de CLASES que
    // sobreviven a la minificación y que las otras librerías WebGL NO
    // contienen (maplibre falsea «PerspectiveCamera» ×2 — por eso el censo
    // laxo mentía; WebGLRenderer/ShaderMaterial/BufferGeometry: ×0 en
    // maplibre, verificado en el build). CORRECCIÓN v244: el comentario
    // original documentaba una «CONSTANTE suelta de three en el chunk
    // GLOBAL» — era un ARTEFACTO de medición: el TEXTO de la propia
    // bitácora v240 (que describe la constante) viaja empaquetado y
    // contaminaba el censo; con marcadores de clase limpios (×0 en
    // bitácora, verificado) el chunk global NUNCA llevó motor. La casa
    // corrige su instrumento y su registro — la verdad por delante.
    const jsUrls = [...new Set([
      ...(r.texto.match(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g) || []),
      ...(r.texto.match(/href="(\/_next\/static\/chunks\/[^"]+\.js)"/g) || []),
    ].map((s) => s.replace(/^[a-z]+="/, "").replace(/"$/, "")))];
    afirmar(jsUrls.length >= 5, `el HTML crítico declara muy pocos JS (${jsUrls.length}) — medición rota`);
    let conMotor = 0;
    for (const url of jsUrls) {
      const js = await pedir(url);
      if (js.status === 200 && /WebGLRenderer|ShaderMaterial|BufferGeometry/.test(js.texto)) conMotor++;
    }
    afirmar(conMotor === 0, `${conMotor} chunks del HTML crítico de /zona-cero llevan el MOTOR de three — la ley v222 sigue violada`);
  });

  await verificar("EL REPARTO: las salas del planeta siguen respondiendo 200 (v240)", async () => {
    for (const ruta of ["/zona-cero", "/ver-guerra", "/mundo", "/"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `sala del planeta rota ${ruta} → ${r.status}`);
    }
  });

  // ── v241.0 EL UNIVERSO ABIERTO: el módulo más huérfano del censo (0
  // CONECTA, 0 noscript, 0 JSON-LD pese a indexable) se conecta con la casa
  // sin tocar su ley estructural («cero chrome DOM»): todo vive en el
  // JSON-LD y en el noscript — invisible cuando el lienzo corre.
  await verificar("EL UNIVERSO ABIERTO: la ficha y las puertas viven en el server (v241)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/vanguard2/page.tsx"), "utf8");
    // la ficha para Google (patrón v215)
    afirmar(pag.includes("jsonLdSeguro") && pag.includes('"WebApplication"'), "sin la ficha WebApplication del universo");
    afirmar(pag.includes("application/ld+json"), "el JSON-LD no viaja como ld+json");
    // el noscript con las puertas (patrón v230) y el componente de la casa
    afirmar(pag.includes("<noscript>") && pag.includes("EnlacesNucleo"), "el noscript no usa las puertas de la casa");
    // CERO puertas inventadas: cada ruta citada existe en el censo de rutas
    for (const ruta of ['"/"', '"/mundo"', '"/ver-guerra"', '"/espia"', '"/nucleo"', '"/guerra-hoy"']) {
      afirmar(pag.includes(`ruta: ${ruta}`), `la puerta ${ruta} no está en las puertas del universo`);
    }
    // la ley estructural del lienzo queda intacta: el chrome NO entra en el canvas
    const lienzo = readFileSync(join(RAIZ, "src/components/vanguard2/vanguard2.tsx"), "utf8");
    afirmar(!lienzo.includes("EnlacesNucleo"), "¡el lienzo de VANGUARD-2 fue tocado con chrome DOM!");
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la página del universo escribe fechas a mano!");
  });

  await verificar("EL UNIVERSO ABIERTO viva: /vanguard2 sirve ficha y puertas en el SSR (v241)", async () => {
    const r = await pedir("/vanguard2");
    afirmar(r.status === 200, `no 200 (${r.status})`);
    afirmar(r.texto.includes("application/ld+json") && r.texto.includes("WebApplication"), "el SSR no lleva la ficha del universo");
    afirmar(r.texto.includes("<noscript"), "el SSR no lleva el noscript");
    afirmar(r.texto.includes("PUERTAS DEL UNIVERSO"), "las puertas del universo no viven en el SSR");
    for (const puerta of ["/guerra-hoy", "/nucleo", "/ver-guerra"]) {
      afirmar(r.texto.includes(`href="${puerta}"`), `la puerta ${puerta} no viaja en el HTML`);
    }
  });

  await verificar("EL UNIVERSO ABIERTO: las puertas del universo responden 200 (v241)", async () => {
    for (const ruta of ["/", "/mundo", "/ver-guerra", "/espia", "/nucleo", "/guerra-hoy"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `puerta del universo rota ${ruta} → ${r.status}`);
    }
  });

  // ── v242.0 EL KIT COMPLETO: las tres salas que la cola de v241 dejó
  // señaladas visten su patrón de la casa — /espia CONECTA+noscript,
  // /en-vivo CONECTA, /modo JSON-LD — sin tocar las leyes de cada sala.
  await verificar("EL KIT COMPLETO: las tres salas visten sus patrones en el server (v242)", () => {
    const espia = readFileSync(join(RAIZ, "src/app/espia/page.tsx"), "utf8");
    const envivo = readFileSync(join(RAIZ, "src/app/en-vivo/page.tsx"), "utf8");
    const modo = readFileSync(join(RAIZ, "src/app/modo/page.tsx"), "utf8");
    // /espia: CONECTA + noscript con el componente de la casa + su ficha intacta
    afirmar(espia.includes("<noscript>") && espia.includes("EnlacesNucleo"), "espia sin CONECTA/noscript de la casa");
    afirmar(espia.includes("application/ld+json"), "espia perdió su ficha JSON-LD");
    afirmar(espia.includes("SONPEAR DE NUEVO"), "el noscript de espia no dice la verdad sobre el botón");
    for (const ruta of ['"/ver-guerra"', '"/mundo"', '"/guerra-hoy"', '"/nucleo"']) {
      afirmar(espia.includes(`ruta: ${ruta}`), `la puerta ${ruta} no vive en las puertas del radar`);
    }
    // /en-vivo: CONECTA server-rendered FUERA del componente client (ley v190)
    afirmar(envivo.includes("EnlacesNucleo") && envivo.includes("CONECTA CON EL NÚCLEO"), "en-vivo sin CONECTA");
    const sala = readFileSync(join(RAIZ, "src/app/en-vivo/sala-en-vivo.tsx"), "utf8");
    afirmar(!sala.includes("EnlacesNucleo"), "¡el chrome entró dentro de la sala client!");
    for (const ruta of ['"/guerra-hoy"', '"/espia"', '"/mundo"', '"/nucleo"']) {
      afirmar(envivo.includes(`ruta: ${ruta}`), `la puerta ${ruta} no vive en las puertas del pulso`);
    }
    // /modo: la ficha WebPage con jsonLdSeguro (patrón v215)
    afirmar(modo.includes("jsonLdSeguro") && modo.includes('"WebPage"'), "modo sin la ficha WebPage");
    afirmar(modo.includes("application/ld+json"), "el JSON-LD de modo no viaja como ld+json");
    for (const pag of [espia, envivo, modo]) {
      afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡una sala del kit escribe fechas a mano!");
    }
  });

  await verificar("EL KIT COMPLETO viva: las tres salas sirven su kit en el SSR (v242)", async () => {
    const espia = await pedir("/espia");
    afirmar(espia.status === 200, `espia no 200 (${espia.status})`);
    afirmar(espia.texto.includes("CONECTA CON EL NÚCLEO"), "espia: CONECTA ausente del SSR");
    afirmar(espia.texto.includes("<noscript"), "espia: noscript ausente del SSR");
    for (const puerta of ["/ver-guerra", "/nucleo", "/guerra-hoy"]) {
      afirmar(espia.texto.includes(`href="${puerta}"`), `espia: la puerta ${puerta} no viaja en el HTML`);
    }
    const envivo = await pedir("/en-vivo");
    afirmar(envivo.status === 200, `en-vivo no 200 (${envivo.status})`);
    afirmar(envivo.texto.includes("CONECTA CON EL NÚCLEO"), "en-vivo: CONECTA ausente del SSR");
    for (const puerta of ["/espia", "/mundo"]) {
      afirmar(envivo.texto.includes(`href="${puerta}"`), `en-vivo: la puerta ${puerta} no viaja en el HTML`);
    }
    const modo = await pedir("/modo");
    afirmar(modo.status === 200, `modo no 200 (${modo.status})`);
    afirmar(modo.texto.includes("application/ld+json") && modo.texto.includes("WebPage"), "modo: la ficha no viaja en el SSR");
  });

  await verificar("EL KIT COMPLETO: todas las puertas del kit responden 200 (v242)", async () => {
    for (const ruta of ["/ver-guerra", "/mundo", "/guerra-hoy", "/nucleo", "/espia", "/modo", "/en-vivo"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `puerta del kit rota ${ruta} → ${r.status}`);
    }
  });

  // ── v243.0 LA POLÍTICA VIVA: la última sala del censo que ninguna ronda
  // había expandido (v206→v242) viste el kit — y su sección 9 solo puede
  // documentar lo que el ÁRBOL declara (la política miente si cita un
  // almacén que fuentes.ts no declara, o se calla uno que sí existe).
  await verificar("LA POLÍTICA VIVA: ficha, puertas y frontera en el server (v243)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/privacidad/page.tsx"), "utf8");
    // la ficha WebPage (patrón v215) y el CONECTA (patrón v230)
    afirmar(pag.includes("jsonLdSeguro") && pag.includes('"WebPage"'), "sin la ficha WebPage de la política");
    afirmar(pag.includes("application/ld+json"), "el JSON-LD no viaja como ld+json");
    afirmar(pag.includes("<EnlacesNucleo") && pag.includes("CONECTA CON EL NÚCLEO"), "sin CONECTA de la casa");
    for (const ruta of ['"/nucleo"', '"/modo"', '"/"']) {
      afirmar(pag.includes(`ruta: ${ruta}`), `la puerta ${ruta} no vive en las puertas de la política`);
    }
    // LA HONESTIDAD ESTRUCTURAL: los 4 almacenes privados citados por la
    // sección 9 son EXACTAMENTE los que fuentes.ts declara — ni uno
    // inventado por la política, ni uno real que la política se calla.
    const fuentes = readFileSync(join(RAIZ, "src/lib/nucleo/fuentes.ts"), "utf8");
    const bloquePrivadas = fuentes.slice(fuentes.indexOf("export const FUENTES_PRIVADAS"));
    const idsPrivados = [...bloquePrivadas.matchAll(/id: "(fnt:[a-z]+)"/g)].map((m) => m[1]);
    afirmar(idsPrivados.length === 4, `fuentes.ts declara ${idsPrivados.length} privadas, no 4`);
    for (const id of idsPrivados) {
      afirmar(pag.includes(id), `la política no documenta ${id}, que el árbol declara`);
    }
    afirmar(pag.includes("La frontera técnica"), "sin la sección 9 de la frontera");
    // la política no promete vigilancia que no existe: la suite SÍ la ejecuta
    afirmar(pag.includes("suite de pruebas del sistema"), "sin la referencia a la vigilancia real");
    // SIN noscript a propósito: la página es 100% server — fingir carencia es mentir
    afirmar(!pag.includes("<noscript"), "¡la política finge necesitar JavaScript que no necesita!");
  });

  await verificar("LA POLÍTICA VIVA viva: /privacidad sirve ficha, puertas y frontera en el SSR (v243)", async () => {
    const r = await pedir("/privacidad");
    afirmar(r.status === 200, `no 200 (${r.status})`);
    afirmar(r.texto.includes("application/ld+json") && r.texto.includes("WebPage"), "el SSR no lleva la ficha de la política");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "CONECTA ausente del SSR");
    afirmar(r.texto.includes("La frontera técnica, a la vista"), "la sección 9 no viaja en el SSR");
    for (const puerta of ["/nucleo", "/modo"]) {
      afirmar(r.texto.includes(`href="${puerta}"`), `la puerta ${puerta} no viaja en el HTML`);
    }
  });

  await verificar("LA POLÍTICA VIVA: las puertas de la política responden 200 (v243)", async () => {
    for (const ruta of ["/nucleo", "/modo", "/", "/privacidad"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `puerta de la política rota ${ruta} → ${r.status}`);
    }
  });

  // ── v244.0 LA FAMILIA REUNIDA: la deuda v240 se paga — la familia del
  // motor 3D viaja en UN chunk asíncrono compartido (webpack sí honra
  // splitChunks; Turbopack no) y el censo de la casa se mide con
  // marcadores de CLASE limpios: «isPerspectiveCamera»/«isMesh»
  // sobreviven a la minificación, NO aparecen en el texto de la bitácora
  // (que contaminaba el censo fino de v240 — la constante que describe
  // viajaba como PROSA empaquetada) y maplibre no los contiene (×0
  // verificado en su chunk de ~273 KB gzip).
  await verificar("LA FAMILIA REUNIDA: el build declara la reunión y el motor que la honra (v244)", () => {
    const config = readFileSync(join(RAIZ, "next.config.ts"), "utf8");
    // el grupo de caché reúne a la familia completa bajo demanda
    afirmar(config.includes("familiaTres"), "next.config.ts sin el grupo familiaTres");
    afirmar(config.includes('chunks: "async"'), "el grupo reunido no es async — volvería al HTML crítico (ley v222)");
    for (const miembro of ["three|", "globe\\.gl", "three-globe", "three-render-objects", "@tweenjs"]) {
      afirmar(config.includes(miembro), `la familia reunida no cita a ${miembro.replace(/\\|\|/g, "")}`);
    }
    // el motor que HONRA la configuración: el build de producción es webpack
    const pkg = JSON.parse(readFileSync(join(RAIZ, "package.json"), "utf8"));
    afirmar(pkg.scripts?.build?.includes("--webpack"), "el build de producción no declara el motor que honra splitChunks");
    // la ley v222 sigue citada donde se aplica
    afirmar(config.includes("v222"), "la configuración no cita la ley del HTML crítico");
  });

  await verificar("LA FAMILIA REUNIDA viva: el censo del build — el motor en pocas piezas, sin copias sueltas (v244)", () => {
    const dir = join(RAIZ, ".next", "static", "chunks");
    afirmar(existsSync(dir), "no hay chunks de build — medición imposible");
    // marcadores de CLASE limpios: isPerspectiveCamera/isMesh son banderas
    // que DEFINEN las clases del motor (verificados: ×0 en bitácora, ×0 en
    // maplibre). «WebGLRenderer» se queda FUERA del censo a propósito: los
    // componentes de la casa INSTANCIAN el motor (new X.WebGLRenderer —
    // el inquilino, no la familia) y 6 piezas nuestras lo mencionan —
    // defecto de MI propio test cazado en la primera pasada viva: el
    // censo contaba inquilinos como si fueran familia.
    const esFamilia = /isPerspectiveCamera|isMesh/;
    const piezas = readdirSync(dir).filter((f) => f.endsWith(".js") && esFamilia.test(readFileSync(join(dir, f), "utf8")));
    // la reunión: UNA pieza compartida (familia-tres) y a lo sumo una pieza
    // privada de un grafo (vanguard2) — jamás las 3-5 copias del build v243
    afirmar(piezas.length <= 2, `la familia viaja en ${piezas.length} piezas: la reunión falló (${piezas.join(", ")})`);
    const pesos = piezas.map((f) => Math.round(statSync(join(dir, f)).size / 1024));
    // la pieza reunida carga TODA la familia: nunca un gramo en el HTML
    // crítico de salas sin 3D (eso lo vigila el test siguiente)
    console.log(`    censo de la familia: ${piezas.length} pieza(s) — ${pesos.join(" KB, ")} KB en disco`);
  });

  await verificar("LA FAMILIA REUNIDA viva: el HTML crítico de las salas no lleva motor — casa entera (v244)", async () => {
    // la ley v222 (three JAMÁS en el HTML crítico) extendida y verificada
    // en salas 3D y salas server-only por igual: el chunk reunido es async
    // y NINGÚN JS declarado por la primera pintura puede llevar el motor.
    // Marcador: banderas de clase del motor (isPerspectiveCamera/isMesh,
    // ×0 en bitácora y maplibre) — «WebGLRenderer» falsearía con los
    // componentes de la casa que lo instancian.
    const esFamilia = /isPerspectiveCamera|isMesh/;
    for (const ruta of ["/", "/mundo", "/zona-cero", "/privacidad"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `sala rota ${ruta} → ${r.status}`);
      const jsUrls = [...new Set([
        ...(r.texto.match(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g) || []),
        ...(r.texto.match(/href="(\/_next\/static\/chunks\/[^"]+\.js)"/g) || []),
      ].map((s) => s.replace(/^[a-z]+="/, "").replace(/"$/, "")))];
      afirmar(jsUrls.length >= 5, `el HTML crítico de ${ruta} declara muy pocos JS (${jsUrls.length}) — medición rota`);
      let conMotor = 0;
      for (const url of jsUrls) {
        const js = await pedir(url);
        if (js.status === 200 && esFamilia.test(js.texto)) conMotor++;
      }
      afirmar(conMotor === 0, `${conMotor} chunks del HTML crítico de ${ruta} llevan el motor — la ley v222 violada`);
    }
  });

  // ── v245.0 LA QUINTA ESCUCHA: el radar se ensancha con la OPCW (el
  // elemento más antiguo de la cola: «nuevas fuentes con cuota») y una
  // mina latente sale del árbol — el defecto dormido desde v242
  // TAG_COLOR.tag] (que tsc y SWC se tragaban SOLO con el texto exacto
  // de esa plantilla) vuelve a decir lo que el compilado siempre hizo:
  // z[a.tag]||z.INFO.
  await verificar("LA QUINTA ESCUCHA: la OPCW declarada con cuota y la mina desactivada (v245)", () => {
    const lib = readFileSync(join(RAIZ, "src/lib/espia.ts"), "utf8");
    const pag = readFileSync(join(RAIZ, "src/app/espia/page.tsx"), "utf8");
    // la quinta fuente con su URL REAL verificada (200 · 10 items reales) —
    // ancla en la DECLARACIÓN (lección v243: el comentario no vale)
    const bloque = lib.slice(lib.indexOf("export const ESCUCHAS_FUENTES"), lib.indexOf("export interface ItemEscucha"));
    const nFuentes = (bloque.match(/id: "/g) || []).length;
    afirmar(nFuentes === 5, `la red del radar declara ${nFuentes} señales, no 5`);
    afirmar(bloque.includes('id: "opcw"'), "la OPCW no vive en ESCUCHAS_FUENTES");
    afirmar(bloque.includes("https://www.opcw.org/rss.xml"), "la URL de la OPCW no es la verificada");
    // la cuota de la casa sigue: 4 titulares por fuente, nunca relleno
    afirmar(lib.includes("items.length >= 4"), "la cuota de 4 titulares por fuente desapareció");
    // la mina latente desactivada: la fuente dice lo que el compilado hizo
    afirmar(pag.includes("TAG_COLOR[m.tag]"), "la línea de movimientos sigue sin leer el tag del movimiento");
    afirmar(!pag.includes("TAG_COLOR.tag] ||"), "el corchete suelto sigue en el árbol");
    // el header no hereda el «de 4»
    afirmar(pag.includes("escuchas.length || 5"), "el header seguiría diciendo «de 4 señales» sin red");
    // el censo cita a la quinta (descripción y alias)
    const fuentes = readFileSync(join(RAIZ, "src/lib/nucleo/fuentes.ts"), "utf8");
    const registro = readFileSync(join(RAIZ, "src/lib/nucleo/registro.ts"), "utf8");
    afirmar(fuentes.includes("OPCW"), "fnt:escuchas no cita a la OPCW");
    afirmar(registro.includes("onu oms opcw"), "el alias del módulo espía no cita a la OPCW");
  });

  await verificar("LA QUINTA ESCUCHA viva: /espia declara la red ampliada en el SSR (v245)", async () => {
    const r = await pedir("/espia");
    afirmar(r.status === 200, `espia no 200 (${r.status})`);
    // la OPCW aparece VIVA o SIN SEÑAL — pero aparece: la red del radar
    // se declara entera, nunca se esconde una fuente caída
    afirmar(r.texto.includes("OPCW"), "la OPCW no aparece en el SSR del radar");
    afirmar(r.texto.includes("DESARME"), "la etiqueta del desarme no viaja en el SSR");
    afirmar(r.texto.includes("señales oficiales abiertas"), "el contador de señales desapareció del header");
  });

  // ── v253.0 LA FORMA DE LA SEMANA: el radar deja de dar solo números —
  // cada teatro del índice de tensión se dibuja con 7 barras REALES
  // (cubo rodante de 24 h, la misma ventana del índice) y una tira
  // nueva EL PULSO DEL PLANETA respira los cuatro números del instante,
  // TODOS derivados de las medidas ya calculadas — cero consultas extra,
  // cero invención. Y la sexta escucha honesta: 18+ candidatas medidas,
  // ninguna verificó 200 con items — el radar se queda en 5 y lo declara
  // (la regla v245 es inviolable: nada entra sin verificar).
  await verificar("LA FORMA DE LA SEMANA estática: cubo rodante real y pulso derivado sin consultas extra (v253)", () => {
    const lib = readFileSync(join(RAIZ, "src/lib/espia.ts"), "utf8");
    const pag = readFileSync(join(RAIZ, "src/app/espia/page.tsx"), "utf8");
    // la función existe y su ventana es la RODANTE (cubo de 24 h, semana de 168 h)
    afirmar(lib.includes("export async function formaDeLaSemana"), "formaDeLaSemana no vive en el módulo espía");
    afirmar(lib.includes("Math.floor(horas / 24)"), "el cubo rodante de 24 h desapareció de la forma");
    afirmar(lib.includes("horas >= 168"), "la semana de la forma ya no cierra en 168 h");
    afirmar(lib.includes("forma[tag][6 - cubo] += 1"), "el cubo no llena las 7 barras en orden semana");
    // el pulso se deriva de lo ya medido — cero consultas extra en la página
    afirmar(pag.includes("EL PULSO DEL PLANETA"), "la tira del pulso no vive en el radar");
    afirmar(pag.includes("formaDeLaSemana(Object.keys(TEATROS))"), "la forma no se mide sobre los teatros reales");
    const llamadasForma = (pag.match(/formaDeLaSemana\(/g) || []).length;
    afirmar(llamadasForma === 1, `la forma se mide ${llamadasForma} veces (debe ser UNA — cero consultas extra)`);
    // la forma es decorativa y hoy va encendida: aria-hidden + la barra de hoy
    afirmar(pag.includes("aria-hidden=\"true\"") && pag.includes("i === 6 ? color"), "la forma sin su aria-hidden o sin la barra de hoy encendida");
    // la sexta escucha honesta: la red sigue en 5 y se DECLARA (regla v245)
    const bloque = lib.slice(lib.indexOf("export const ESCUCHAS_FUENTES"), lib.indexOf("export interface ItemEscucha"));
    const nFuentes = (bloque.match(/id: "/g) || []).length;
    afirmar(nFuentes === 5, `la red del radar declara ${nFuentes} señales sin verificación — jamás`);
  });

  await verificar("LA FORMA DE LA SEMANA viva: el SSR del radar dibuja la semana y respira su pulso (v253)", async () => {
    const r = await pedir("/espia");
    afirmar(r.status === 200, `espia no 200 en v253 (${r.status})`);
    afirmar(r.texto.includes("EL PULSO DEL PLANETA"), "el pulso del planeta no viaja en el SSR del radar");
    afirmar(r.texto.includes("cada barra = un día de 24 h"), "la promesa de la barra no viaja en el SSR");
    afirmar(r.texto.includes("cables escuchados hoy"), "el primer número del pulso no viaja en el SSR");
    afirmar(r.texto.includes("cables en la semana completa"), "el número de la semana no viaja en el SSR");
    // las viejas anclas del radar siguen en pie
    afirmar(r.texto.includes("señales oficiales abiertas"), "el contador de señales desapareció del header");
    afirmar(r.texto.includes("<noscript"), "el noscript honesto del radar desapareció");
    // sin fechas escritas a mano en la tira (guardia v234)
    const desde = r.texto.indexOf("EL PULSO");
    afirmar(!/20\d\d-\d\d-\d\d/.test(r.texto.slice(desde, desde + 4000)), "fechas escritas a mano en el pulso (guardia v234)");
  });

  // ── v254.0 EL LATIDO QUE RESPETA: la sala en vivo gana las dos señales
  // que le faltaban al latido — la PAUSA (el visitante congela el sondeo
  // con SU mano, el latido lee el ref para no quedar preso de la cáscara
  // vieja del closure) y LA PILA DE LOS QUE LLEGARON MIENTRAS LEÍAS
  // (si estás lejos de la cabeza, los nuevos no se te esconden: la sala
  // los cuenta y te ofrece la subida con UN toque — nada automático,
  // ley v190; cero mismatch: en el SSR la cuenta es 0 y la pila no existe).
  await verificar("EL LATIDO QUE RESPETA estática: pausa con ref y pila de los nuevos con su salto (v254)", () => {
    const sala = readFileSync(join(RAIZ, "src/app/en-vivo/sala-en-vivo.tsx"), "utf8");
    // la pausa: el latido lee el REF (jamás la cáscara vieja) y reintenta pronto
    afirmar(sala.includes("pausaRef.current"), "el latido no lee el ref de la pausa (cáscara vieja del closure)");
    afirmar(sala.includes("if (pausaRef.current) {"), "el latido no duerme cuando el visitante lo pausó");
    afirmar(sala.includes("pausaRef.current = nuevo"), "el toggle no alimenta al ref — el latido seguiría en su cáscara");
    afirmar(sala.includes("PAUSAR EL LATIDO") && sala.includes("REANUDAR EL LATIDO"), "los dos estados del botón del latido no viven en la sala");
    afirmar(sala.includes("aria-pressed={pausado}"), "el botón del latido sin su estado comunicado");
    afirmar(sala.includes("latido en pausa"), "la sala no dice la verdad sobre el latido pausado");
    // la pila: solo lejos de la cabeza, subida con UN toque, limpieza al volver
    afirmar(sala.includes("abajoRef.current") && sala.includes("window.scrollY > 480"), "el guardián de la posición no vive en la sala");
    afirmar(sala.includes("setNuevosEspera((n) => n + nuevos.length)"), "los nuevos lejanos no se cuentan — se esconderían");
    afirmar(sala.includes("if (!lejos) setNuevosEspera(0)"), "la cuenta no se limpia al volver a la cabeza");
    afirmar(sala.includes("window.scrollTo({ top: 0, behavior: \"smooth\" })"), "la subida de la pila no es un salto suave");
    afirmar(sala.includes("mientras leías"), "la pila no dice cuándo llegaron los cables");
    // ley v190: en el SSR la pila no existe (cero mismatch) y el chrome sigue fuera
    afirmar(!sala.includes("EnlacesNucleo"), "¡el chrome entró dentro de la sala client!");
  });

  await verificar("EL LATIDO QUE RESPETA viva: la sala SSR anuncia la pausa y sigue en pie (v254)", async () => {
    const r = await pedir("/en-vivo");
    afirmar(r.status === 200, `en-vivo no 200 en v254 (${r.status})`);
    afirmar(r.texto.includes("PAUSAR EL LATIDO"), "el botón de la pausa no viaja en el SSR de la sala");
    afirmar(r.texto.includes("cables en sala"), "el contador de la sala desapareció del SSR");
    // la pila NO existe en el SSR (la cuenta nace en 0 — cero mismatch)
    afirmar(!r.texto.includes("mientras leías"), "la pila se pintó en el SSR — mismatch latente");
    // las viejas anclas de la sala siguen en pie
    afirmar(r.texto.includes("EL PULSO — ÚLTIMA HORA DEL MUNDO"), "la cabeza de la sala desapareció");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "en-vivo: CONECTA ausente del SSR");
    afirmar(r.texto.includes("sondeado hace"), "el reloj del sondeo desapareció del SSR");
  });

  // ── v255.0 TU MISIÓN: la misión 100 medía el esfuerzo de TODA la casa
  // pero el propio comandante nunca vio el suyo — su barra personal, sus
  // plataformas cubiertas y el siguiente enlace sugerido, TODO derivado
  // del aparato (localStorage del arsenal ya usado): cero servidores,
  // cero invención; si aún no repartes nada, la barra lo dice sin pena.
  await verificar("TU MISIÓN estática: barra personal, plataformas cubiertas y siguiente enlace sugerido (v255)", () => {
    const m = readFileSync(join(RAIZ, "src/components/vanguard/mission-100.tsx"), "utf8");
    // la barra personal existe y nace del aparato, no del servidor
    afirmar(m.includes("const META_PERSONAL = 100"), "la meta personal no está declarada");
    afirmar(m.includes("miPct") && m.includes("used.length / META_PERSONAL"), "la barra personal no se deriva del aparato");
    afirmar(m.includes("aria-label=\"Tu progreso personal de enlaces repartidos\""), "la barra personal sin su aria-label");
    // las plataformas cubiertas se derivan del PREFIJO del código (VGD-XXXnn)
    afirmar(m.includes("c.slice(4, 7)"), "el prefijo de plataforma ya no se deriva del código");
    afirmar(m.includes("plataformasMias") && m.includes("PLATFORMS.length"), "el conteo de plataformas cubiertas desapareció");
    // el mando sugiere el siguiente enlace sin usar — derivado, nunca inventado
    afirmar(m.includes("siguienteEnlace") && m.includes("links.find((l) => !used.includes(l.code))"), "el siguiente enlace sugerido no se deriva del arsenal");
    // el vacío honesto y la meta cumplida declarada
    afirmar(m.includes("Aún no repartes ninguno"), "el vacío personal ya no se declara sin pena");
    afirmar(m.includes("TU MISIÓN CUMPLIDA"), "la meta personal cumplida no se celebra");
    afirmar(m.includes("tu misión — vive en tu aparato"), "la casa ya no dice dónde vive el progreso personal");
    // el código de guerra personal v41 depende del aparato (myCode nace null en SSR)
    afirmar(m.includes("Tu código de guerra"), "el código de guerra personal desapareció del arsenal");
  });

  await verificar("TU MISIÓN viva: /mision SSR sirve la barra personal con su vacío honesto (v255)", async () => {
    const r = await pedir("/mision");
    afirmar(r.status === 200, `/mision no 200 en v255 (${r.status})`);
    afirmar(r.texto.includes("enlaces tuyos"), "la barra personal no viaja en el SSR del mando");
    // el SSR nace con el aparato vacío: el vacío honesto viaja (cero mismatch)
    afirmar(r.texto.includes("Aún no repartes ninguno"), "el vacío honesto personal no viaja en el SSR");
    afirmar(r.texto.includes("tu misión — vive en tu aparato"), "la declaración del aparato no viaja en el SSR");
    // las anclas viejas del mando siguen en pie (SSR-safe: no dependen del aparato)
    afirmar(r.texto.includes("Misión 100 — enlaces y jugadores"), "la cabeza de la misión desapareció");
    afirmar(r.texto.includes("contador global en vivo"), "el contador global desapareció");
    afirmar(r.texto.includes("Arsenal —"), "el arsenal desapareció del SSR");
    afirmar(r.texto.includes("QR de reclutamiento"), "el QR de reclutamiento desapareció del SSR");
  });

  // ── v256.0 LA ÚLTIMA SEÑAL: el espejo deja de ser un número mudo —
  // cada teatro del espejo dice CUÁNDO sonó su último cable real (el
  // conteo y el max viajan en la MISMA query groupBy, cero roundtrips
  // extra) y la señal más fresca del archivo se declara arriba, derivada
  // de las mediciones ya hechas. Cero fechas escritas a mano (v234).
  await verificar("LA ÚLTIMA SEÑAL estática: el espejo mide la edad, no solo el acumulado (v256)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/zona-cero/page.tsx"), "utf8");
    // dos medidas en la MISMA query groupBy
    afirmar(pag.includes("_max: { publishedAt: true }"), "la última señal no viaja en la misma query groupBy");
    afirmar(pag.includes("conteo: f._count._all"), "el conteo real se perdió al añadir la señal");
    afirmar(pag.includes("ultima: f._max.publishedAt"), "la señal no sale del max real de la BD");
    // la edad se deriva al vuelo de los milisegundos reales — cero fechas a mano
    afirmar(pag.includes("Math.floor(ms / 60000)"), "la edad no se deriva de los milisegundos reales");
    afirmar(pag.includes("Math.floor(horas / 24)"), "los días no se derivan de las horas");
    afirmar(pag.includes("Intl.DateTimeFormat"), "la hora exacta no se formatea con el aparato (patrón refugio v251)");
    // la línea honesta en la tarjeta y la señal más fresca declarada
    afirmar(pag.includes("última señal"), "la tarjeta no dice la edad de su teatro");
    afirmar(pag.includes("la señal más fresca del archivo"), "la señal más fresca no se declara");
    afirmar(pag.includes("edad < 48 * 3_600_000"), "el umbral de frescura desapareció");
    // la vacío honesto: teatro sin cables, línea sin pintar
    afirmar(pag.includes("medicion?.ultima ?? null"), "el vacío honesto ya no se protege");
    // guardia v234 en pie tras la ronda
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡el espejo escribe fechas a mano en la ronda v256!");
  });

  await verificar("LA ÚLTIMA SEÑAL viva: el SSR del espejo sirve la edad real de cada teatro (v256)", async () => {
    const r = await pedir("/zona-cero");
    afirmar(r.status === 200, `/zona-cero no 200 en v256 (${r.status})`);
    afirmar(r.texto.includes("última señal hace"), "el SSR no sirve la edad de ninguna señal");
    afirmar(r.texto.includes("la señal más fresca del archivo"), "la señal más fresca no viaja en el SSR");
    // las anclas viejas del espejo siguen en pie
    afirmar(r.texto.includes("LA GUERRA REAL DETRÁS DEL ESPEJO"), "la sección del espejo desapareció");
    afirmar(r.texto.includes("cables en la agencia"), "los chips de conteo real desaparecieron");
    afirmar(r.texto.includes("cables verificados en"), "el total real del espejo desapareció");
    afirmar(r.texto.includes("/conflicto/ukraine"), "el teatro real perdió su sala");
  });

  // ── v257.0 LA EDAD DEL FRENTE: el puente deja de ser un número mudo —
  // la misma cura que el espejo v256, con la MISMA gramática: cada frente
  // documentado dice CUÁNDO sonó su último cable real (conteo y max en la
  // MISMA query groupBy) y la señal más fresca de los frentes documentados
  // se declara sobre el grid, con el nombre derivado del mapeo. Cero fechas
  // escritas a mano (v234).
  await verificar("LA EDAD DEL FRENTE estática: el puente mide la edad con la misma gramática que el espejo (v257)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/ver-guerra/page.tsx"), "utf8");
    // dos medidas en la MISMA query groupBy del puente
    afirmar(pag.includes("_max: { publishedAt: true }"), "la última señal no viaja en la misma query groupBy del puente");
    afirmar(pag.includes("conteo: f._count._all"), "el conteo real del puente se perdió al añadir la señal");
    afirmar(pag.includes("ultima: f._max.publishedAt"), "la señal del puente no sale del max real de la BD");
    // la edad se deriva al vuelo de los milisegundos reales — cero fechas a mano
    afirmar(pag.includes("Math.floor(ms / 60000)"), "la edad no se deriva de los milisegundos reales");
    afirmar(pag.includes("Math.floor(horas / 24)"), "los días no se derivan de las horas");
    afirmar(pag.includes("Intl.DateTimeFormat"), "la hora exacta no se formatea con el aparato (patrón v251/v256)");
    afirmar(pag.includes("edad < 48 * 3_600_000"), "el umbral de frescura del puente desapareció");
    // la línea honesta en la ficha y la señal más fresca declarada
    afirmar(pag.includes("última señal"), "la ficha del frente no dice la edad de su teatro");
    afirmar(pag.includes("la señal más fresca de los frentes documentados"), "la señal más fresca del puente no se declara");
    // el nombre humano se deriva del mapeo — nunca a mano
    afirmar(pag.includes("nombreDeTag"), "el nombre del frente fresco no se deriva del mapeo FRENTE_A_TEATRO");
    // el vacío honesto: frente sin señal, línea sin pintar
    afirmar(pag.includes("medicion?.ultima ?? null"), "el vacío honesto del puente ya no se protege");
    // guardia v234 en pie tras la ronda
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡el puente escribe fechas a mano en la ronda v257!");
  });

  await verificar("LA EDAD DEL FRENTE viva: el SSR del puente sirve la edad real de cada frente (v257)", async () => {
    const r = await pedir("/ver-guerra");
    afirmar(r.status === 200, `/ver-guerra no 200 en v257 (${r.status})`);
    afirmar(r.texto.includes("última señal hace"), "el SSR no sirve la edad de ninguna señal del puente");
    afirmar(r.texto.includes("la señal más fresca de los frentes documentados"), "la señal más fresca del puente no viaja en el SSR");
    // las anclas viejas del puente siguen en pie (v229)
    afirmar(r.texto.includes("FRENTE"), "la cabeza del mural desapareció");
    afirmar(r.texto.includes("cables en la agencia"), "los chips de conteo real del puente desaparecieron");
    afirmar(r.texto.includes("/conflicto/ukraine"), "el frente DONBÁS no lleva a su teatro real");
    afirmar(r.texto.includes("no inventa puertas"), "la declaración honesta de los frentes sin teatro desapareció");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "sin el bloque de puertas al núcleo");
  });

  // ── v246.0 EL ANDAMIAJE EN SILENCIO: las rutas API solo exportan
  // handlers y su configuración (dynamic/revalidate/runtime/maxDuration) —
  // el aviso .next/types que tres rondas arrastraron (meteo/ZONES,
  // og/size, traductor/IDIOMAS) muere sin borrar nada: las constantes
  // siguen vivas, solo dejan de ser públicas del módulo.
  await verificar("EL ANDAMIAJE EN SILENCIO: las rutas solo exportan handlers y config — nada borrado (v246)", () => {
    const meteo = readFileSync(join(RAIZ, "src/app/api/meteo/route.ts"), "utf8");
    const og = readFileSync(join(RAIZ, "src/app/api/og/route.tsx"), "utf8");
    const trad = readFileSync(join(RAIZ, "src/app/api/traductor/route.ts"), "utf8");
    // los tres valores dejaron de ser públicos del módulo
    afirmar(!meteo.includes("export const ZONES"), "meteo sigue publicando ZONES");
    afirmar(!og.includes("export const size"), "og sigue publicando size");
    afirmar(!trad.includes("export const IDIOMAS"), "traductor sigue publicando IDIOMAS");
    // la ley MEGA-PROMPT: cero borrado — las constantes viven igual
    afirmar(meteo.includes("const ZONES: Zone[]"), "ZONES desapareció de meteo (habría violado la ley de no borrar)");
    afirmar(og.includes("const size = { width: 1200, height: 630 }"), "size desapareció de og");
    afirmar(trad.includes("const IDIOMAS = IDIOMAS_VANGUARD"), "IDIOMAS desapareció del traductor");
    // los handlers y su configuración siguen en pie
    for (const [nombre, txt] of [["meteo", meteo], ["og", og], ["traductor", trad]]) {
      afirmar(txt.includes("export const dynamic"), `${nombre} perdió su dynamic`);
      afirmar(txt.includes("export async function GET"), `${nombre} perdió su GET`);
    }
  });

  await verificar("EL ANDAMIAJE EN SILENCIO viva: las tres rutas responden igual que ayer (v246)", async () => {
    // meteo: mismo contrato { ok, zones[8] } (cacheada u honesta con fallbacks)
    const m = await pedir("/api/meteo");
    afirmar(m.status === 200, `meteo no 200 (${m.status})`);
    afirmar(m.json?.ok === true, "meteo sin ok");
    afirmar(Array.isArray(m.json?.zones) && m.json.zones.length === 8, "meteo no sirve sus 8 zonas");
    // og: la imagen viva sigue naciendo
    const o = await pedir("/api/og");
    afirmar(o.status === 200, `og no 200 (${o.status})`);
    afirmar(String(o.headers?.["content-type"] || "").startsWith("image/"), "og no devuelve imagen");
    // traductor: el GET del catálogo sigue sirviendo la lista entera
    const t = await pedir("/api/traductor");
    afirmar(t.status === 200, `traductor no 200 (${t.status})`);
    afirmar(t.json?.ok === true && Array.isArray(t.json?.idiomas) && t.json.idiomas.length >= 8, "traductor sin su lista de idiomas");
  });

  // ── v247.0 LA CARGA JUSTA: /noticia baja de 342 KB a 40 KB de imágenes
  // iniciales — la medición mandó: hero JPG de 70–210 KB eager + 5 thumbs
  // sin pereza, y una metadata og que declaraba 1200×630 que NINGÚN archivo
  // cumplía. El horno (scripts/hornear-og.mjs) deja pieles og 1200×630
  // exactas, el hero viaja en WebP con fetchPriority=high (ES el LCP), las
  // thumbs van lazy y la metadata declara las dimensiones REALES o nada.
  await verificar("LA CARGA JUSTA: la fuente del hero LCP y las thumbs perezosas (v247)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/noticia/[id]/page.tsx"), "utf8");
    // el hero ES el LCP: prioridad alta y decodificación async en la fuente
    afirmar(pag.includes('fetchPriority="high"'), "el hero no declara fetchPriority=high");
    afirmar(pag.includes('decoding="async"'), "el hero no declara decoding=async");
    afirmar(pag.includes('loading="lazy"'), "las thumbs no declaran pereza");
    // dims reales o nada: la propagación condicional, jamás cifras inventadas
    afirmar(pag.includes("...(dims ? { width: dims.w, height: dims.h } : {})"), "la propagación condicional de dims reales desapareció");
    // el caso más flagrante de la mentira vieja: city-1 es 842×1264 VERTICAL
    afirmar(pag.includes('"city-1": { w: 842, h: 1264 }'), "la tabla de dims reales no lleva el caso vertical city-1");
    // la piel og existe como constante con sus 6 fallbacks
    afirmar(pag.includes("/assets/real/og/drone-1.webp"), "FALLBACK_OG no lleva la piel og del fallback");
  });

  await verificar("LA CARGA JUSTA: el horno dejó pieles og y cada una pesa menos que su JPG (v247)", () => {
    const dirOg = join(RAIZ, "public/assets/real/og");
    afirmar(existsSync(dirOg), "el horno no dejó pieles: falta public/assets/real/og");
    const pieles = readdirSync(dirOg).filter((f) => f.endsWith(".webp"));
    afirmar(pieles.length >= 24, `solo ${pieles.length} pieles og — horno incompleto`);
    for (const piel of pieles) {
      const stem = piel.replace(/\.webp$/, "");
      const jpg = join(RAIZ, "public/assets/real", `${stem}.jpg`);
      afirmar(existsSync(jpg), `piel huérfana sin JPG original: ${stem}`);
      afirmar(statSync(join(dirOg, piel)).size < statSync(jpg).size, `la piel ${stem} pesa igual o más que su JPG original`);
    }
  });

  await verificar("LA CARGA JUSTA viva: hero en piel og WebP, thumbs perezosas y dims reales declaradas (v247)", async () => {
    // la lupa elige un cable SIN imagen (1.857 de 1.877 caen al fallback):
    // su hero es la piel og y su metadata social declara las dims de drone-1
    const lupa = await pedir(`/api/noticias?q=${encodeURIComponent("el")}`);
    afirmar(lupa.status === 200 && lupa.json?.ok === true, "la lupa no responde");
    const items = lupa.json?.items ?? [];
    const sinImg = items.find((x) => !x.img);
    afirmar(Boolean(sinImg), "ningún cable sin imagen en la lupa");
    const r = await pedir(`/noticia/${sinImg.id}`);
    afirmar(r.status === 200, `/noticia/${sinImg.id} no 200 (${r.status})`);
    // el hero viaja en la piel og, JAMÁS en la JPG pesada original
    // (React 19 escribe el atributo en camelCase — case-insensitive en HTML,
    // pero el SSR de la casa hay que leerlo tal cual lo escribe)
    const hero = r.texto.match(/<img[^>]*fetchpriority="high"[^>]*>/i)?.[0] ?? "";
    afirmar(hero.length > 0, "el hero llegó sin fetchpriority=high al SSR");
    const srcHero = hero.match(/src="([^"]+)"/)?.[1] ?? "";
    afirmar(/^\/assets\/real\/og\/[a-z0-9-]+\.webp$/.test(srcHero), `el hero no viaja en piel og: ${srcHero}`);
    // las thumbs relacionadas son perezosas (5 en la sala típica)
    const perezosas = (r.texto.match(/loading="lazy"/g) ?? []).length;
    afirmar(perezosas >= 5, `solo ${perezosas} thumbs perezosas en el SSR`);
    // la metadata social declara dimensiones REALES: el 1200×630 inventado murió
    const pares = [...r.texto.matchAll(/og:image:width" content="(\d+)"\/><meta property="og:image:height" content="(\d+)"/g)].map((m) => `${m[1]}x${m[2]}`);
    afirmar(pares.length >= 1, "og:image sin dimensiones declaradas");
    afirmar(!pares.includes("1200x630"), "el 1200×630 inventado sigue declarado en la metadata");
    afirmar(pares.includes("1600x1067"), `el fallback drone-1 no declara sus dims reales (1600×1067): ${pares.join(",") || "ninguna"}`);
  });

  // ── v248.0 EL FOTOGRAMA LIGERO: los paneles SPA pagan su dieta — la
  // tarjeta de la galería y las thumbs del feed social visten la piel
  // 640×360 (−86% medida) y el visor de la ficha conserva el negativo.
  await verificar("EL FOTOGRAMA LIGERO: la tarjeta viste piel y el visor conserva el negativo (v248)", () => {
    const datos = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    // el helper existe y es la fuente única del mapa stem→piel
    afirmar(datos.includes("export function pielDeFoto"), "pielDeFoto no está exportada en game-data");
    afirmar(datos.includes('"/assets/real/paneles/"'), "el mapa de piel no apunta a paneles/");
    // las fotos sintéticas y las ajenas no tienen piel: vuelven tal cual
    afirmar(datos.includes('!image.endsWith(".jpg")'), "el guardia de piel no excluye lo que no es JPG local");
    const galeria = readFileSync(join(RAIZ, "src/components/vanguard/panels/gallery-panel.tsx"), "utf8");
    // la TARJETA viste la piel
    afirmar(galeria.includes("src={pielDeFoto(p.image)}"), "la tarjeta de la galería no viste la piel");
    // el VISOR conserva el negativo original (la JPG, detrás del click)
    afirmar(galeria.includes("src={photo.image}"), "el visor dejó de servir el negativo original");
  });

  await verificar("EL FOTOGRAMA LIGERO: el feed social viste piel y el horno dejó la familia entera (v248)", () => {
    const social = readFileSync(join(RAIZ, "src/lib/social-data.ts"), "utf8");
    // cero thumbs sembradas en JPG crudo: las 6 visten paneles/*.webp
    const crudas = (social.match(/thumb: "\/assets\/real\/[a-z0-9-]+\.jpg"/g) ?? []).length;
    afirmar(crudas === 0, `${crudas} thumbs del feed siguen en JPG crudo`);
    const enPiel = (social.match(/thumb: "\/assets\/real\/paneles\/[a-z0-9-]+\.webp"/g) ?? []).length;
    afirmar(enPiel === 6, `se esperaban 6 emisiones en piel, hay ${enPiel}`);
    // la familia horneada: ≥24 pieles, cada una más ligera que su JPG,
    // ninguna huérfana (misma auditoría que la familia og de v247)
    const dirPaneles = join(RAIZ, "public/assets/real/paneles");
    afirmar(existsSync(dirPaneles), "el horno no dejó pieles: falta public/assets/real/paneles");
    const pieles = readdirSync(dirPaneles).filter((f) => f.endsWith(".webp"));
    afirmar(pieles.length >= 24, `solo ${pieles.length} pieles de panel — horno incompleto`);
    for (const piel of pieles) {
      const stem = piel.replace(/\.webp$/, "");
      const jpg = join(RAIZ, "public/assets/real", `${stem}.jpg`);
      afirmar(existsSync(jpg), `piel de panel huérfana sin JPG original: ${stem}`);
      afirmar(statSync(join(dirPaneles, piel)).size < statSync(jpg).size, `la piel de panel ${stem} pesa igual o más que su JPG`);
    }
  });

  await verificar("EL FOTOGRAMA LIGERO viva: la piel se sirve y el negativo sigue en pie (v248)", async () => {
    // la piel viaja ligera y con su tipo correcto
    const piel = await pedir("/assets/real/paneles/tanks-2.webp");
    afirmar(piel.status === 200, `la piel tanks-2 → ${piel.status}`);
    afirmar((piel.headers["content-type"] ?? "").includes("image/webp"), `la piel no viaja como image/webp: ${piel.headers["content-type"]}`);
    const bytesPiel = Number(piel.headers["content-length"] ?? 0);
    afirmar(bytesPiel > 0 && bytesPiel < 60 * 1024, `la piel pesa ${bytesPiel} B — fuera del rango horneado`);
    // el negativo original sigue en pie (ley MEGA-PROMPT: nadie lo borra)
    const negativo = await pedir("/assets/real/tanks-2.jpg");
    afirmar(negativo.status === 200, `el negativo original → ${negativo.status}`);
    afirmar(Number(negativo.headers["content-length"] ?? 0) > Number(piel.headers["content-length"] ?? 0), "el negativo pesa igual o menos que la piel — el horno no recortó nada");
  });

  // ── v233.0 LA BALANZA: las variables explicadas y la cadena navegable ──
  await verificar("LA BALANZA: variables explicadas, anclas al catálogo y puertas honestas (v233)", () => {
    const vars = readFileSync(join(RAIZ, "src/lib/nucleo/simulacion/variables.ts"), "utf8");
    // las 4 variables se explican a sí mismas (estructura, no datos a mano)
    for (const trozo of ["mueve:", "fuente:", "ancla:", "cero:", "dos:", "puerta:"]) {
      const veces = vars.split(trozo).length - 1;
      afirmar(veces >= 4, `«${trozo}» no está en las 4 variables (${veces}/4)`);
    }
    // las puertas de las variables son las REALES del censo v230 — cero inventadas
    for (const ruta of ["/nucleo?tipo=acontecimiento", "/nucleo?tipo=noticia", "/ver-guerra", "/nucleo?tipo=pais"]) {
      afirmar(vars.includes(`ruta: "${ruta}"`), `la puerta ${ruta} no vive en el catálogo de variables`);
    }
    // las anclas editoriales suben al catálogo decoradas (valor de reglas.ts, texto nuevo)
    const idx = readFileSync(join(RAIZ, "src/lib/nucleo/simulacion/index.ts"), "utf8");
    for (const trozo of ["ANCLAS", "anclasDelCatalogo", "anclas: anclasDelCatalogo()"]) {
      afirmar(idx.includes(trozo), `el catálogo no declara «${trozo}»`);
    }
    // el id del acontecimiento viaja REAL de la semilla (jamás derivado del slug del teatro)
    const datos = readFileSync(join(RAIZ, "src/lib/nucleo/simulacion/datos.ts"), "utf8");
    afirmar(datos.includes("ACONTECIMIENTO_POR_TEATRO"), "el id del acontecimiento no sale de la semilla v219");
    // la isla abre las puertas con guardas honestas (404 evitado, no fingido)
    const isla = readFileSync(join(RAIZ, "src/components/vanguard/escenario-controles.tsx"), "utf8");
    for (const trozo of ["/conflicto/${r.slug}", "encodeURIComponent(r.puertaAcontecimiento)", "/ver-guerra", "/nucleo?tipo=pais"]) {
      afirmar(isla.includes(trozo), `la isla no declara la puerta «${trozo}»`);
    }
  });

  await verificar("LA BALANZA viva: /escenarios sirve las variables explicadas, las anclas y la cadena (v233)", async () => {
    const r = await pedir("/escenarios");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("LAS VARIABLES — explicadas una a una"), "sin la sección de variables explicadas");
    afirmar(r.texto.includes("LAS ANCLAS — las decisiones editoriales"), "sin la sección de anclas");
    afirmar(r.texto.includes("ANCLAS.TIEMPO_DIAS"), "las anclas no se declaran por su nombre");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "sin la cadena de procedencia navegable");
    afirmar(r.texto.includes("/conflicto/ukraine"), "el teatro con cables no abre su sala real");
    afirmar(r.texto.includes("/ver-guerra"), "sin puerta al mapa del frente");
    afirmar(r.texto.includes("/nucleo?tipo=pais"), "sin puerta a las fichas de país");
    afirmar(r.texto.includes("vg%3Aacontecimiento%3A"), "el factor tiempo no abre su acontecimiento documentado");
  });

  await verificar("LA BALANZA: las puertas de la cadena responden 200 una a una (v233)", async () => {
    for (const ruta of ["/conflicto/ukraine", "/ver-guerra", "/nucleo?tipo=pais", "/nucleo?tipo=noticia", "/nucleo?tipo=acontecimiento"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `puerta de la cadena rota ${ruta} → ${r.status}`);
    }
    // la ficha del acontecimiento de Ucrania con el id REAL de la semilla v219
    const ficha = await pedir(`/nucleo?id=${encodeURIComponent("vg:acontecimiento:invasion-rusa-de-ucrania")}`);
    afirmar(ficha.status === 200, "la ficha del acontecimiento documentado no responde");
  });

  // ── v231.0 EL LATIDO: el vértigo conecta cada pieza con su país y su sala ──
  await verificar("EL LATIDO: /vertigo proyecta país, salas reales y sin fechas a mano (v231)", () => {
    const feed = readFileSync(join(RAIZ, "src/app/vertigo/vertigo-feed.tsx"), "utf8");
    // el país de origen deja de ser dato muerto: chip hacia la ficha vg:pais
    for (const trozo of ["nombrePais", "vg:pais:", "LA SALA DEL MUNDO", "salas"]) {
      afirmar(feed.includes(trozo), `el feed no declara «${trozo}»`);
    }
    // los conteos de las salas llegan del server: CERO cifras escritas a mano
    afirmar(!/\d+ cables/.test(feed), "¡el feed escribe conteos de cables a mano!");
    // la página server mide el archivo con UNA groupBy del catálogo documentado
    const pag = readFileSync(join(RAIZ, "src/app/vertigo/page.tsx"), "utf8");
    for (const trozo of ["TEATROS", "groupBy", "salas={salas}"]) {
      afirmar(pag.includes(trozo), `la página del vértigo no declara «${trozo}»`);
    }
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la página del vértigo escribe fechas a mano!");
  });

  await verificar("EL LATIDO vivo: /vertigo con fichas de país, LA SALA DEL MUNDO y sus puertas (v231)", async () => {
    const r = await pedir("/vertigo");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("vg%3Apais%3A"), "los chips de país no llegan al HTML server-rendered");
    afirmar(r.texto.includes("LA SALA DEL MUNDO"), "sin la última estación del feed");
    afirmar(r.texto.includes("/conflicto/ukraine"), "las salas reales no tienen sus puertas");
    afirmar(r.texto.includes("cables ▸"), "sin los conteos reales en las salas");
    afirmar(r.texto.includes("/nucleo"), "sin la puerta a la búsqueda del núcleo");
  });

  await verificar("EL LATIDO: la ficha vg:pais de un país del feed responde honesta (v231)", async () => {
    // Israel tiene cables reales en el archivo (il) — la ficha nunca 404
    const r = await pedir(`/api/nucleo/entidad?id=${encodeURIComponent("vg:pais:il")}`);
    afirmar(r.status === 200 && r.json?.ok, "ficha vg:pais:il no ok");
    afirmar(r.json.entidad?.id === "vg:pais:il", "id de ficha de país inestable");
  });

  await verificar("los chips contextuales viven en /noticia/[id] con su ACONTECIMIENTO", async () => {
    if (!primerCable) throw new Error("sin cable de la prueba anterior");
    const r = await pedir(primerCable);
    afirmar(r.status === 200, `cable ${primerCable} no 200`);
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "chips ausentes en el cable");
  });

  await verificar("el cable del teatro anuncia PARTE DE: EL ACONTECIMIENTO (server-rendered)", async () => {
    if (!cableConTeatro) throw new Error("sin cable con teatro de la búsqueda");
    const r = await pedir(cableConTeatro);
    afirmar(r.status === 200, `cable ${cableConTeatro} no 200`);
    afirmar(r.texto.includes("PARTE DE: EL ACONTECIMIENTO"), "sin chip del acontecimiento en el cable");
  });

  await verificar("sitemap anuncia /nucleo a Google", async () => {
    const r = await pedir("/sitemap.xml");
    afirmar(r.status === 200 && r.texto.includes("/nucleo"), "sitemap sin /nucleo");
  });

  // compatibilidad: las rutas de la casa siguen vivas
  await verificar("compatibilidad: las rutas existentes siguen en pie", async () => {
    for (const ruta of ["/", "/en-vivo", "/vertigo", "/audios", "/modo", "/objetivos", "/mundo"]) {
      const r = await pedir(ruta);
      afirmar(r.status === 200, `ruta ${ruta} → ${r.status}`);
    }
  });

  // ── v249.0 EL MURO DE PIEDRA: el muro de las voces se talla en el SSR ──
  await verificar("EL MURO DE PIEDRA: el muro de voces vive en el servidor, audible sin JavaScript (v249)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/audios/page.tsx"), "utf8");
    afirmar(pag.includes("EL MURO DE LAS VOCES"), "la página no talla el muro de las voces");
    // ancla tolerante a formato (lección v247a): la consulta puede viajar
    // multilínea — la intención es que el muro se alimente de la BD real
    afirmar(/audioComandante\s*\.findMany/.test(pag), "el muro no se alimenta de la BD real");
    afirmar(pag.includes("/api/media/${v.mediaId}"), "el reproductor no apunta al media real");
    afirmar(pag.includes('preload="none"'), "el reproductor no es perezoso (preload)");
    afirmar(pag.includes("El muro está en pie y vacío"), "el estado vacío no es honesto");
    afirmar(pag.includes("Intl.DateTimeFormat"), "las fechas del muro no salen formateadas de la BD");
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡el muro escribe fechas a mano!");
    const grab = readFileSync(join(RAIZ, "src/app/audios/grabador.tsx"), "utf8");
    afirmar(grab.includes("router.refresh()"), "enviar una voz no repinta el muro de piedra");
    afirmar(grab.includes("} catch (e) {"), "el catch de errores del envío desapareció");
  });

  await verificar("EL MURO DE PIEDRA viva: el SSR lleva las voces reales o el vacío honesto (v249)", async () => {
    const api = await pedir("/api/audios");
    afirmar(api.json?.ok === true, "la API del muro no responde");
    const total = api.json?.total ?? 0;
    const r = await pedir("/audios");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("EL MURO DE LAS VOCES"), "el SSR no lleva el muro");
    if (total > 0) {
      afirmar(r.texto.includes("/api/media/"), `hay ${total} voces en la BD y el SSR no sirve ninguna`);
      const masNueva = api.json.audios[0];
      const media = await pedir(masNueva.url);
      afirmar(media.status === 200, "el audio más nuevo no se sirve");
      afirmar(String(media.headers?.["content-type"] || "").startsWith("audio/"), "el media no sirve audio/*");
    } else {
      afirmar(r.texto.includes("El muro está en pie y vacío"), "muro vacío sin estado honesto");
    }
  });

  // ── v250.0 EL VÉRTIGO QUE RECUERDA: compartir y reanudar (fórmula completa) ──
  await verificar("EL VÉRTIGO QUE RECUERDA: compartir con salida honesta y reanudar sin recargar (v250)", () => {
    const feed = readFileSync(join(RAIZ, "src/app/vertigo/vertigo-feed.tsx"), "utf8");
    // COMPARTIR: Web Share API, portapapeles de respaldo y última red —
    // y la pieza viaja con su sala de lectura real
    afirmar(feed.includes("navigator.share"), "sin Web Share API (fórmula TikTok incompleta)");
    afirmar(feed.includes("navigator.clipboard.writeText"), "sin portapapeles de respaldo");
    afirmar(feed.includes("Copiado"), "sin aviso de copia");
    afirmar(feed.includes("/noticia/${c.id}"), "el enlace compartido no es la sala de lectura real");
    afirmar(feed.includes('aria-label="Compartir este cable"'), "la columna no tiene la tercera señal");
    // REANUDAR: la marca vive en el aparato y el salto está acotado a lo cargado
    afirmar(feed.includes("vg-vertigo-ultimo"), "sin marca de posición en el aparato");
    afirmar(/scrollTop\s*=\s*pos\s*\*\s*contRef\.current\.clientHeight/.test(feed), "el salto de reanudación no está");
    afirmar(feed.includes("pos < iniciales.length"), "el salto no está acotado a lo ya cargado");
    afirmar(feed.includes("Reanudado donde lo dejaste"), "sin aviso de reanudación");
    afirmar(feed.includes("stopPropagation"), "compartir dispara el doble toque de la pieza");
  });

  await verificar("EL VÉRTIGO QUE RECUERDA vivo: el SSR sirve la tercera señal y las estaciones v231 siguen en pie (v250)", async () => {
    const r = await pedir("/vertigo");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes('aria-label="Compartir este cable"'), "el SSR no sirve la señal de compartir");
    afirmar(r.texto.includes("Enviar"), "el SSR no sirve la etiqueta de compartir");
    afirmar(r.texto.includes("LA SALA DEL MUNDO"), "la última estación desapareció");
    afirmar(r.texto.includes("vg%3Apais%3A"), "los chips de país desaparecieron");
    afirmar(r.texto.includes("Leer completo"), "la puerta de lectura desapareció");
  });

  // ── v280.0 EL CONTRARRELOJ DEL PESO: 60 s contra el archivo — la tercera capa del quiz (/en-vivo) ──
  // La otra mitad de la cola v272: modo contrarreloj sobre el pool activo
  // y cota 8 → 12 (más combustible sin consultas nuevas). Medido con el
  // motor real al abrir: la instantánea aguanta exactamente 12 parejas.
  await verificar("EL CONTRARRELOJ DEL PESO estática: el reloj fuera de React, el récord en el botín y las tres fases (v280)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/en-vivo/page.tsx"), "utf8");
    const quiz = readFileSync(join(RAIZ, "src/app/en-vivo/quiz-peso.tsx"), "utf8");
    // la cota crecida en el servidor (la cola v272 lo pedía)
    afirmar(pag.includes("parejasPeso.length < 12"), "la cota del quiz no creció a 12");
    // el reloj: constante declarada y store a nivel de módulo (ley v176)
    afirmar(quiz.includes("const DURACION_SPRINT = 60000;"), "la duración del sprint no está declarada");
    afirmar(quiz.includes("let sprintTimer: ReturnType<typeof setInterval> | null = null;"), "el intervalo del sprint no vive a nivel de módulo");
    afirmar(quiz.includes("function tickSprint(): void {"), "el tick del reloj no existe");
    afirmar(quiz.includes("setInterval(tickSprint, 250)"), "el reloj no corre a 250 ms");
    afirmar(quiz.includes("useSyncExternalStore(sprintSuscribir, sprintSnapshot, () => SPRINT_QUIETO)"), "React no escucha el reloj con snapshot de servidor");
    afirmar(quiz.includes('sprintCache = { fase: "fin", quedanMs: 0, aciertos: sprintAciertos };'), "la campana no cierra la fase fin");
    // el récord del sprint en el botín (migración por defaults, cerradura v132)
    afirmar(quiz.includes("sprintRecord: number;"), "el botín no conoce el récord del sprint");
    afirmar(quiz.includes("sprintRecord: g?.sprintRecord ?? 0,"), "los botines viejos no despiertan con 0 (migración por defaults)");
    afirmar(quiz.includes("guardarBotin({ ...b, sprintRecord: Math.max(b.sprintRecord, sprintAciertos) });"), "la campana no escribe el récord máximo en el botín");
    // el quiz anota al reloj y las fases componen sus líneas
    afirmar(quiz.includes("if (acierto) anotarSprintAcierto();"), "el quiz no anota los aciertos del sprint");
    afirmar(quiz.includes("const lineaSprint = `contrarreloj: ${DURACION_SPRINT / 1000} s contra el archivo"), "la invitación del sprint no se compone desde la constante");
    afirmar(quiz.includes("Math.ceil(sprint.quedanMs / 1000)"), "la cuenta atrás no se compone en segundos");
    afirmar(quiz.includes("CONTRARRELOJ ▸"), "el botón del sprint no está");
    afirmar(quiz.includes("OTRO SPRINT ▸"), "el botón de la revancha no está");
    afirmar(quiz.includes('aria-label="Arrancar el contrarreloj del peso"'), "el sprint no tiene su aria-label");
    afirmar(quiz.includes('aria-live="polite"'), "la cuenta atrás no es accesible (aria-live)");
    afirmar(quiz.includes('disabled={sprint.fase === "marcha"}'), "el modo no se duerme durante la marcha");
    // guardia v234
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡/en-vivo escribe fechas a mano en la ronda v280!");
    afirmar(!/20\d\d-\d\d-\d\d/.test(quiz), "¡el quiz escribe fechas a mano en la ronda v280!");
  });

  await verificar("EL CONTRARRELOJ DEL PESO viva: el SSR sirve el botón del sprint y la invitación compuesta (v280)", async () => {
    const r = await pedir("/en-vivo");
    afirmar(r.status === 200, `/en-vivo no 200 en v280 (${r.status})`);
    afirmar(r.texto.includes("CONTRARRELOJ ▸"), "el botón del sprint no viaja en el SSR");
    afirmar(r.texto.includes("contrarreloj: 60 s contra el archivo — cuántos pesos aciertas antes de que suene la campana"), "la invitación compuesta no viaja (o la constante cambió)");
    afirmar(r.texto.includes('aria-label="Arrancar el contrarreloj del peso"'), "el aria-label del sprint no viaja");
    // la cota crecida: la línea v272 sigue compuesta desde la fuente
    afirmar(/EL QUIZ DEL PESO — \d+ parejas reales del archivo miden tu ojo/.test(r.texto), "la línea del quiz cayó");
    // las anclas de la casa en pie (v279/v272/v213)
    afirmar(/EL QUIZ POR TEATRO — \d+ sala[s]? del frente con par en la instantánea/.test(r.texto), "la línea del frente cayó (v279)");
    afirmar(r.texto.includes("¿Qué cable pesa más?"), "la pregunta del peso cayó (v272)");
    afirmar(r.texto.includes("EL PULSO — ÚLTIMA HORA DEL MUNDO"), "la sala del pulso cayó (v213)");
  });

  // ── v281.0 LA SALA DE LOS SERVICIOS: los 36 expedientes de inteligencia (/servicios) ──
  // Las dos fuentes que solo vivían client-side (AGENCIAS v127 +
  // SERVICIOS v128) suben a server. Medido con el motor real al abrir
  // (tsx): 18 + 18 = 36, fundación 1882 → 2020, 12 naciones, censos
  // 1·1·4·5·4·3 y 6·4·3·3·2 en el orden de la fuente.
  await verificar("LA SALA DE LOS SERVICIOS estática: las dos fuentes, los censos derivados y las líneas compuestas (v281)", () => {
    const sala = readFileSync(join(RAIZ, "src/app/servicios/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    // las DOS fuentes viajan (nada a mano)
    afirmar(sala.includes('from "@/lib/agencias-data"'), "la sala no importa la fuente de la Comunidad (v127)");
    afirmar(sala.includes('from "@/lib/agencias-mundo-data"'), "la sala no importa la fuente de la Red (v128)");
    // los censos derivados con Set + filter en el orden de la fuente
    afirmar(sala.includes("[...new Set(COMUNIDAD.map((a) => a.categoria))]"), "el censo de la comunidad no se deriva con Set");
    afirmar(sala.includes("[...new Set(RED.map((s) => s.categoria))]"), "el censo de la red no se deriva con Set");
    afirmar(sala.includes("COMUNIDAD.filter((a) => a.categoria === c).length"), "el censo de la comunidad no cuenta con filter");
    afirmar(sala.includes("RED.filter((s) => s.categoria === c).length"), "el censo de la red no cuenta con filter");
    // el arco de fundación derivado (guardia v234) y las naciones derivadas
    afirmar(sala.includes("x.fundacion < min ? x.fundacion : min"), "el arco de fundación no se deriva con reduce");
    afirmar(sala.includes("Infinity,"), "el mínimo del arco arranca en 0 — ningún año real bajaría de él (bug cazado en QA viva de la v281)");
    afirmar(sala.includes("new Set(RED.map((s) => s.pais)).size"), "las naciones de la red no se derivan");
    // las líneas compuestas COMPLETAS en JS (lección v256)
    afirmar(sala.includes("const lineaSala = `La sala de los servicios — ${COMUNIDAD.length + RED.length}"), "la línea de la sala no se compone en JS");
    afirmar(sala.includes("${FUNDACION_MIN} a ${FUNDACION_MAX}"), "el arco de la línea no viaja derivado");
    // la placa y las leyendas viven en la fuente (directiva v266)
    afirmar(sala.includes("String(n).padStart(2, \"0\")"), "la placa no se compone desde el num real");
    afirmar(sala.includes("BLOQUES.find((b) => b.cat === cat)?.leyenda"), "las leyendas de los bloques no viajan desde la fuente");
    // la puerta honesta al aparato (patrón v275/v276)
    afirmar(sala.includes("vive en el aparato"), "la puerta honesta al aparato no está declarada");
    // el sitemap indexa la sala (patrón v274)
    afirmar(mapa.includes("${SITE_URL}/servicios"), "el sitemap no anuncia la sala");
    // guardia v234
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala de los servicios escribe fechas a mano en la ronda v281!");
  });

  await verificar("LA SALA DE LOS SERVICIOS viva: el SSR sirve los 36 expedientes y los censos derivados (v281)", async () => {
    const r = await pedir("/servicios");
    afirmar(r.status === 200, `/servicios no 200 en v281 (${r.status})`);
    afirmar(/La sala de los servicios — 36 expedientes reales de inteligencia/.test(r.texto), "la línea compuesta de la sala no viaja (o la fuente cambió)");
    afirmar(/de 1882 a 2020/.test(r.texto), "el arco de fundación derivado no viaja");
    afirmar(r.texto.includes("LA COMUNIDAD"), "la sección de la Comunidad no viaja");
    afirmar(r.texto.includes("LA RED MUNDIAL"), "la sección de la Red no viaja");
    // los expedientes reales de las fuentes, verbatim
    afirmar(r.texto.includes("Secret Intelligence Service (SIS)"), "MI6 no viaja con su nombre de la fuente");
    afirmar(r.texto.includes("Central Intelligence Agency"), "la CIA no viaja con su nombre de la fuente");
    afirmar(r.texto.includes("Semper Occultus"), "el lema de MI6 no viaja verbatim");
    // el censo derivado en los chips (orden de la fuente)
    afirmar(r.texto.includes("LA ALIANZA ×6"), "el chip del censo de la alianza no viaja");
    afirmar(r.texto.includes("SERVICIO ARMADO ×5"), "el chip del censo armado no viaja");
    // las puertas y el vacío honesto
    afirmar(r.texto.includes("vive en el aparato"), "la puerta honesta no viaja");
    afirmar(r.texto.includes('href="/historia"'), "la puerta al archivo no viaja");
    afirmar(r.texto.includes("La sala funciona sin JavaScript"), "el noscript compuesto no viaja");
  });

  // ── v285.0 EL TABLERO EN EL GLOBO: la segunda capa del tablero — coordenadas compuestas y puerta ?teatro= por región viva (/conflictos) ──
  // La cola de la v284 se paga: la coordenada real se compone desde la
  // fuente y cada región con pulso abre el globo (patrón v278 ← v264).
  await verificar("EL TABLERO EN EL GLOBO estática: la puerta heredada y la coordenada compuesta (v285)", () => {
    const sala = readFileSync(join(RAIZ, "src/app/conflictos/page.tsx"), "utf8");
    // la puerta al globo: condicionada al pulso real (cero puertas muertas)
    afirmar(sala.includes("href={`/mundo?teatro=${c.id}`}"), "la puerta al globo no apunta a /mundo?teatro=");
    afirmar(sala.includes("{cables > 0 && ("), "la puerta al globo no exige pulso vivo (sería una puerta muerta)");
    afirmar(sala.includes("Encenderla en el globo ▸"), "la etiqueta de la puerta al globo no es la del linaje (v278)");
    // la coordenada compuesta desde la fuente (guardia v234: nada escrito)
    afirmar(sala.includes("{c.lat.toFixed(1)}°, {c.lng.toFixed(1)}°"), "la coordenada no se compone desde los números reales");
    afirmar(sala.includes("· {c.lat.toFixed(1)}°, {c.lng.toFixed(1)}°"), "la coordenada no viaja en la línea de la ficha");
    // el linaje declarado en la sala
    afirmar(sala.includes("la puerta ?teatro= del globo"), "el linaje de la puerta no se declara en la sala");
    afirmar(sala.includes("la v278 para la memoria"), "el linaje de la memoria no se declara");
    // guardia v234
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡/conflictos escribe fechas a mano en la ronda v285!");
    afirmar(!/const linea\w+ = [^;]*\b19\d\d\b/.test(sala), "¡el tablero escribe años a mano en su línea (v285)!");
  });

  await verificar("EL TABLERO EN EL GLOBO viva: las 9 puertas al globo y la coordenada de Ucrania en el SSR (v285)", async () => {
    const r = await pedir("/conflictos");
    afirmar(r.status === 200, `/conflictos no 200 en v285 (${r.status})`);
    // LAS CIFRAS VIVAS (v310): las puertas al globo solo se abren donde el
    // archivo tiene pulso (ley v285) y el archivo RESPIRA (la rotación de la
    // valla siembra y cosecha) — la ley verifica que TODA puerta pertenece a
    // las 9 regiones de la fuente (jamás una puerta ajena) y que el pulso
    // vivo abre al menos una; los teatros mayores de la casa siguen vivos.
    const idsPuerta = new Set([...r.texto.matchAll(/\/mundo\?teatro=([a-z_]+)/g)].map((m) => m[1]));
    const NUEVE = ["ukraine", "gaza", "hormuz", "taiwan", "korea", "redsea", "sahel", "sudan", "lebanon"];
    afirmar(idsPuerta.size >= 1, `el globo sin puertas vivas (${idsPuerta.size})`);
    for (const id of idsPuerta) {
      afirmar(NUEVE.includes(id), `puerta ajena a las 9 regiones: ${id}`);
    }
    // la coordenada compuesta de Ucrania (48.5, 37.5 — nodos distintos,
    // trampa v258: se pelan los comentarios RSC antes del aserto)
    const limpio = r.texto.replace(/<!-- -->/g, "");
    if (idsPuerta.has("ukraine")) {
      afirmar(limpio.includes("48.5°, 37.5°"), "la coordenada de Ucrania no viaja compuesta");
      afirmar(/\d+ cables del archivo/.test(limpio), "la puerta a la sala no declara su peso vivo (v284)");
    }
    afirmar(/CRITICO ×\d+/.test(limpio), "el chip del censo cayó (v284 — censo de fuente, estable)");
    afirmar(/El tablero de los conflictos — 33 regiones en seguimiento, (\d+) con pulso vivo en el archivo y (\d+) dormidas, con una intensidad media de 66\/100/.test(limpio), "la línea del tablero cayó (v284)");
  });

  // ── v284.0 EL TABLERO DE LOS CONFLICTOS: las 33 regiones de la fuente ganan su índice server (/conflictos) ──
  // La cabeza de la cola de la v283: CONFLICTS (dossier real por región)
  // + el pulso de la BD (groupBy conflictTag) + las puertas honestas
  // (solo teatros del mapa con cables — nunca puertas muertas, ley v206).
  await verificar("EL TABLERO DE LOS CONFLICTOS estática: la fuente intacta, el censo derivado y las puertas honestas (v284)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/conflictos/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    // la fuente intacta: 33 regiones (el borde del slice custodiado)
    afirmar(fuente.includes("export const CONFLICTS"), "la fuente de conflictos no existe");
    const iniC = fuente.indexOf("export const CONFLICTS");
    const finC = fuente.indexOf("];", iniC);
    const bloqueC = fuente.slice(iniC, finC === -1 ? fuente.length : finC + 2);
    afirmar(bloqueC.length > 15000 && bloqueC.length < 25000, `el slice de conflictos midió mal (${bloqueC.length})`);
    const nIds = (bloqueC.match(/id: "/g) ?? []).length;
    afirmar(nIds === 33, `el censo de regiones midió mal (${nIds}/33)`);
    for (const id of ["ukraine", "gaza", "sahel", "taiwan", "korea", "mexico", "favelas"]) {
      afirmar(bloqueC.includes(`id: "${id}"`), `falta la región ${id} en la fuente`);
    }
    // la sala: pulso de lectura pura, censo derivado, puertas honestas
    afirmar(sala.includes('by: ["conflictTag"]'), "el pulso no baja del archivo con groupBy");
    afirmar(sala.includes('where: { externalId: { not: { startsWith: "curated-" } } }'), "el pulso cuenta las piezas curadas de respaldo (la sala nunca miente)");
    afirmar(sala.includes("if (!niveles.includes(c.level)) niveles.push(c.level)"), "el orden del censo no se deriva de la primera aparición en la fuente");
    afirmar(sala.includes("CONFLICTS.filter((c) => c.level === n).length"), "el conteo por nivel no se deriva");
    afirmar(sala.includes("const intensidadMedia = Math.round(sumaIntensidad / CONFLICTS.length)"), "la intensidad media no se deriva con reduce");
    afirmar(sala.includes("const conPulso = CONFLICTS.filter((c) => (vivo[c.id.toUpperCase()] ?? 0) > 0)"), "el pulso vivo no se deriva del groupBy");
    afirmar(sala.includes("const sala = TEATROS[c.id]"), "las puertas no se guardan con el mapa de teatros (ley v206: URL desconocida es 404)");
    afirmar(sala.includes("pulso dormido — sin sala de teatro todavía"), "el vacío de las regiones sin sala no se declara honesto");
    afirmar(sala.includes("su sala de teatro aún no existe"), "el mundo de cables sin sala no se declara");
    // la línea compuesta en JS (lección v256) — sin cifras escritas
    afirmar(sala.includes("const lineaConflictos = `El tablero de los conflictos — ${CONFLICTS.length} regiones en seguimiento, ${conPulso.length} con pulso vivo en el archivo y ${CONFLICTS.length - conPulso.length} dormidas"), "la línea del tablero no se compone COMPLETA en JS");
    afirmar(sala.includes("con una intensidad media de ${intensidadMedia}/100"), "la media no viaja compuesta");
    afirmar(sala.includes("`" + "${nivel} ×${total}`"), "el chip del censo no compone nivel y conteo en un solo nodo (lección v274)");
    afirmar(sala.includes("{c.summary}"), "el dossier no viaja verbatim");
    // las puertas de la casa
    afirmar(mapa.includes("/conflictos"), "el sitemap no anuncia el tablero");
    afirmar(paleta.includes('key: "pg:conflictos"'), "la paleta Ctrl+K no lleva el tablero");
    // guardias
    afirmar(!/const linea\w+ = [^;]*\b19\d\d\b/.test(sala), "¡el tablero escribe años a mano en su línea!");
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡/conflictos escribe fechas a mano en la ronda v284!");
  });

  await verificar("EL TABLERO DE LOS CONFLICTOS viva: el SSR sirve la línea derivada, los chips del censo y las puertas vivas (v284)", async () => {
    const r = await pedir("/conflictos");
    afirmar(r.status === 200, `/conflictos no 200 (${r.status})`);
    afirmar(r.texto.includes("EL TABLERO DE LOS CONFLICTOS"), "el título del tablero no viaja");
    // LAS CIFRAS VIVAS (v310): la línea se deriva de la fuente (33 regiones,
    // 66/100 de intensidad — estables) y de la BD (el pulso vivo respira):
    // la ley exige la forma completa y su SANIDAD (vivas + dormidas = 33)
    const lineaTablero = r.texto.match(/El tablero de los conflictos — 33 regiones en seguimiento, (\d+) con pulso vivo en el archivo y (\d+) dormidas, con una intensidad media de 66\/100/);
    afirmar(lineaTablero !== null, "la línea derivada no viaja (o la fuente/BD cambió)");
    if (lineaTablero) {
      const vivas = Number(lineaTablero[1]);
      afirmar(vivas >= 1 && vivas + Number(lineaTablero[2]) === 33, `el censo del pulso mintió: ${vivas} vivas + ${lineaTablero[2]} dormidas ≠ 33`);
    }
    // los chips del censo compuestos (orden de primera aparición en la
    // fuente) — censo de la FUENTE (estable, ley v284)
    for (const chip of ["CRITICO ×9", "INESTABILIDAD ×14", "TENSION ×5", "VIGILANCIA ×5"]) {
      afirmar(r.texto.includes(chip), `falta el chip del censo ${chip}`);
    }
    // el dossier verbatim + la puerta viva con el conteo real del archivo
    afirmar(r.texto.includes("Frente Oriental — Ucrania"), "el dossier de Ucrania no viaja");
    afirmar(r.texto.includes("/conflicto/ukraine"), "la puerta de Ucrania no viaja");
    afirmar(/\d+ cables del archivo/.test(r.texto), "el conteo vivo del archivo no viaja (¿cambió la BD?)");
    afirmar(r.texto.includes("pulso dormido — sin sala de teatro todavía"), "el vacío honesto de las regiones sin sala no viaja");
    // el sitemap vivo anuncia la sala
    const rs = await pedir("/sitemap.xml");
    afirmar(rs.status === 200 && rs.texto.includes("/conflictos"), "el sitemap vivo no anuncia el tablero");
  });

  // ── v283.0 LA ARMERÍA DEL ARCHIVO: las 12 armas reales de la fuente ganan su sala server (/armeria) ──
  // La cabeza de la cola de la v282: la armería (arsenal-data, la fuente
  // más grande sin vestir) servida en server, patrón /historia (v274).
  // Medido con la fuente real al abrir: 12 armas, 79 piezas de despiece,
  // 8 orígenes, 12 fotos Wikimedia reales.
  await verificar("LA ARMERÍA DEL ARCHIVO estática: la fuente intacta, la línea derivada y las puertas de la casa (v283)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/arsenal-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/armeria/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    // la fuente intacta: las 12 armas uno a uno (el borde del slice custodiado)
    afirmar(fuente.includes("export const ARSENAL"), "la fuente de armas no existe");
    const iniA = fuente.indexOf("export const ARSENAL");
    const finA = fuente.indexOf("];", iniA);
    const bloqueA = fuente.slice(iniA, finA === -1 ? fuente.length : finA + 2);
    afirmar(bloqueA.length > 20000 && bloqueA.length < 40000, `el slice del arsenal midió mal (${bloqueA.length})`);
    for (const id of ["ak47", "m4", "fpv", "shahed", "bayraktar", "javelin", "himars", "lancet", "t90", "leopard2", "rpg7", "m777"]) {
      afirmar(bloqueA.includes(`id: "${id}"`), `falta el arma ${id} en la fuente`);
    }
    // la sala: todo derivado, nada a mano (directiva v266 + lección v256)
    afirmar(sala.includes('import { ARSENAL } from "@/lib/arsenal-data"'), "la sala no consume la fuente canónica");
    afirmar(sala.includes("const ORIGINS = new Set(ARSENAL.map((w) => w.origin))"), "los orígenes no se derivan con Set");
    afirmar(sala.includes("const PIEZAS = ARSENAL.reduce((acc, w) => acc + w.assembly.length, 0)"), "el despiece no se deriva con reduce");
    afirmar(sala.includes("const ULTIMA = ARSENAL[ARSENAL.length - 1]"), "el extremo de la línea no sale de la fuente");
    afirmar(sala.includes("const lineaArmeria = `La armería del archivo — ${ARSENAL.length} armas reales con su foto, su despiece de ${PIEZAS} piezas"), "la línea de la armería no se compone COMPLETA en JS");
    afirmar(sala.includes("desde ${ARSENAL[0].short} hasta ${ULTIMA.short}, nacidas en ${ORIGINS.size} orígenes"), "la línea no viaja de extremo a extremo de la fuente");
    // el verbatim de la fuente en cada ficha
    afirmar(sala.includes("{w.function}"), "la función no viaja verbatim");
    afirmar(sala.includes("{w.impact}"), "el impacto no viaja verbatim");
    afirmar(sala.includes('src={w.photo}'), "la foto real de la fuente no viaja");
    afirmar(sala.includes("{w.origin} · {w.era}"), "el origen y la era no viajan tal como la fuente los declara");
    afirmar(sala.includes("despiece: {w.assembly.length} piezas · ficha técnica: {Object.keys(w.specs).length}"), "el despiece y la ficha no se cuentan desde la fuente");
    // las puertas de la casa
    afirmar(mapa.includes("/armeria"), "el sitemap no anuncia la armería");
    afirmar(paleta.includes('key: "pg:armeria"'), "la paleta Ctrl+K no lleva la armería");
    afirmar(paleta.includes('kind: "page", href: "/armeria"'), "la paleta no abre la sala");
    afirmar(sala.includes("vive en el aparato"), "la puerta al salón interactivo no se declara honesta");
    // la lección de las guardias del arco (v282), generalizada: ni años a mano
    afirmar(!/const linea\w+ = [^;]*\b19\d\d\b/.test(sala), "¡la armería escribe años a mano en su línea!");
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡/armeria escribe fechas a mano en la ronda v283!");
  });

  await verificar("LA ARMERÍA DEL ARCHIVO viva: el SSR sirve la línea derivada, la AK-47 verbatim y el sitemap anuncia la sala (v283)", async () => {
    const r = await pedir("/armeria");
    afirmar(r.status === 200, `/armeria no 200 (${r.status})`);
    afirmar(r.texto.includes("LA ARMERÍA DEL ARCHIVO"), "el título de la sala no viaja");
    // la línea compuesta COMPLETA desde la fuente (12 · 79 · AK-47 · M777 · 8)
    afirmar(r.texto.includes("La armería del archivo — 12 armas reales con su foto, su despiece de 79 piezas y su impacto con datos, desde AK-47 hasta M777, nacidas en 8 orígenes"), "la línea derivada no viaja (o la fuente cambió)");
    // la primera ficha verbatim (los datos son de la fuente, no a mano)
    afirmar(r.texto.includes("AK-47 (Kalashnikov)"), "la primera arma no viaja");
    // el origen y la era son nodos distintos en el HTML (trampa v258, pagada
    // en v274): el aserto usa los valores verbatim de la fuente por separado
    afirmar(r.texto.includes("URSS"), "el origen de la fuente no viaja");
    afirmar(r.texto.includes("1947 · presente"), "la era de la fuente no viaja verbatim");
    // el despiece viaja contado desde la fuente — los comentarios RSC
    // separan los nodos (trampa v258): se pelan antes del aserto
    const limpio = r.texto.replace(/<!-- -->/g, "");
    afirmar(/despiece: \d+ piezas · ficha técnica: \d+/.test(limpio), "el despiece no viaja contado desde la fuente");
    afirmar(r.texto.includes("Shahed-136"), "un arma del medio del archivo no viaja");
    afirmar(r.texto.includes("M777"), "el arma que cierra el archivo no viaja");
    // la puerta honesta al aparato y el sitemap vivo
    afirmar(r.texto.includes("vive en el aparato"), "la puerta al aparato no viaja");
    const rs = await pedir("/sitemap.xml");
    afirmar(rs.status === 200 && rs.texto.includes("/armeria"), "el sitemap vivo no anuncia la armería");
  });

  // ── v287.0 EL PULSO DEL ARCHIVO POR ROSTRO: los keywords de la fuente cruzan el archivo real (/rostros) ──
  // La cola de la v286 se paga: el mismo algoritmo del panel (canon del
  // consumidor) contra los títulos de la BD, lectura pura, vacío honesto.
  // Medido contra la BD fría al abrir: 28 de 34 rostros, 1792 menciones.
  await verificar("EL PULSO DEL ARCHIVO POR ROSTRO estática: el cruce del canon, la lectura pura y el vacío honesto (v287)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/personas-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/rostros/page.tsx"), "utf8");
    // la fuente de keywords intacta
    afirmar(fuente.includes("export const PULSO_KEYWORDS_ROSTROS"), "la fuente de keywords no existe");
    const iniK = fuente.indexOf("export const PULSO_KEYWORDS_ROSTROS");
    const finK = fuente.indexOf("};", iniK);
    const bloqueK = fuente.slice(iniK, finK === -1 ? fuente.length : finK + 2);
    const nKws = (bloqueK.match(/^\s{2}[a-z_]+: \[/gm) ?? []).length;
    afirmar(nKws === 34, `el censo de keywords midió mal (${nKws}/34)`);
    // la sala: lectura pura, el algoritmo del canon, la línea compuesta
    afirmar(sala.includes("PULSO_KEYWORDS_ROSTROS,"), "la sala no consume la fuente de keywords");
    afirmar(sala.includes('where: { externalId: { not: { startsWith: "curated-" } } }'), "el pulso cuenta las piezas curadas de respaldo (la sala nunca miente)");
    afirmar(sala.includes("select: { id: true, title: true }"), "el pulso no baja solo los campos que necesita");
    afirmar(sala.includes("c.title.toLowerCase().includes(k)"), "el matching no es el del canon (el del panel: minúsculas, includes en el título)");
    afirmar(sala.includes("for (const r of ROSTROS) {"), "el cruce no recorre la fuente en su orden");
    afirmar(sala.includes("if (suyos.length > 0) {"), "el vacío de un rostro no se rellena");
    afirmar(sala.includes("const lineaPulso = `El pulso del archivo por rostro — ${pulso.length} de ${ROSTROS.length} rostros citados por ${totalMenciones} titulares del archivo`"), "la línea del pulso no se compone COMPLETA en JS");
    afirmar(sala.includes("href={`/noticia/${p.ultimo.id}`}"), "el último titular no abre su puerta viva a /noticia");
    afirmar(sala.includes("el archivo no cita a ningún rostro todavía — el pulso duerme honesto"), "el vacío del pulso no se declara honesto");
    afirmar(sala.includes('export const dynamic = "force-dynamic"'), "la sala no deja entrar el pulso al render");
    afirmar(sala.includes("EL PULSO DEL ARCHIVO POR ROSTRO"), "la sección del pulso no viaja");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡/rostros escribe fechas a mano en la ronda v287!");
    afirmar(!/const linea\w+ = [^;]*\b19\d\d\b/.test(sala), "¡la sala escribe años a mano en su línea (v287)!");
  });

  await verificar("EL PULSO DEL ARCHIVO POR ROSTRO viva: la línea derivada, la tarjeta de Trump y las anclas v286 (v287)", async () => {
    const r = await pedir("/rostros");
    afirmar(r.status === 200, `/rostros no 200 en v287 (${r.status})`);
    // LAS CIFRAS VIVAS (v310): la línea derivada con su sanidad (los
    // titulares citados cubren a los rostros citados) — el aliento no se congela
    const lineaRostro = r.texto.match(/El pulso del archivo por rostro — (\d+) de 34 rostros citados por (\d+) titulares del archivo/);
    afirmar(lineaRostro !== null, "la línea del pulso no viaja (o la fuente/BD cambió)");
    if (lineaRostro) {
      const nRostros = Number(lineaRostro[1]);
      const nTit = Number(lineaRostro[2]);
      afirmar(nRostros >= 1 && nRostros <= 34, `el pulso cita ${nRostros} rostros (fuera de rango)`);
      afirmar(nTit >= nRostros, `los ${nTit} titulares no cubren a los ${nRostros} rostros`);
    }
    // la tarjeta de Trump: nombre + conteo derivado VIVO + titular vivo
    // (los comentarios RSC separan los nodos — trampa v258: se pelan antes)
    const limpio = r.texto.replace(/<!-- -->/g, "");
    afirmar(/Donald J\. Trump · \d+/.test(limpio), "el conteo de Trump no viaja (¿cambió la BD?)");
    afirmar(/href="\/noticia\/[a-z0-9-]+"/.test(r.texto), "la puerta viva a /noticia no viaja");
    // las anclas v286 en pie
    afirmar(r.texto.includes("La galería de los rostros — 34 fichas reales del poder"), "la línea de la galería cayó (v286)");
    afirmar(r.texto.includes("LOS TRONOS ×12"), "el censo por categoría cayó (v286)");
  });

  // ── v290.0 EL PULSO POR PALABRAS: los keywords de las 6 guerras de la fuente cruzan el archivo (/conflictos) ──
  // La clasificación pendiente resuelta: GUERRAS son dossiers reales (v129);
  // el pulso por palabras cuenta los que CITAN a cada guerra — incluidos
  // los que nadie etiquetó. Medido contra la BD fría: 6 de 6, 398 titulares.
  await verificar("EL PULSO POR PALABRAS estática: la fuente clasificada, el cruce del canon y el vacío honesto (v290)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/guerras-activas-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/conflictos/page.tsx"), "utf8");
    // la fuente clasificada e intacta: 6 guerras reales con sus keywords
    afirmar(fuente.includes("export const GUERRAS"), "la fuente de guerras no existe");
    afirmar(fuente.includes("export const PULSO_KEYWORDS_GUERRA"), "la fuente de keywords no existe");
    const iniP = fuente.indexOf("export const PULSO_KEYWORDS_GUERRA");
    const finP = fuente.indexOf(");", iniP);
    const bloqueP = fuente.slice(iniP, finP === -1 ? fuente.length : finP + 2);
    afirmar(bloqueP.includes("GUERRAS.map((g) => [g.id, g.keywords])"), "los keywords no se derivan de la fuente (algo los escribiría a mano)");
    for (const id of ["ucrania", "oriente", "sudan", "sahel", "myanmar", "taiwan"]) {
      afirmar(fuente.includes(`id: "${id}"`), `falta la guerra ${id} en la fuente`);
    }
    // la sala: el import, el cruce en el orden de la fuente, la línea compuesta
    afirmar(sala.includes('import { GUERRAS, PULSO_KEYWORDS_GUERRA } from "@/lib/guerras-activas-data"'), "la sala no consume la fuente canónica");
    afirmar(sala.includes("for (const g of GUERRAS) {"), "el cruce no recorre la fuente en su orden");
    afirmar(sala.includes("c.title.toLowerCase().includes(k)"), "el matching no es el del canon");
    afirmar(sala.includes("const lineaPalabras = `El pulso por palabras — ${pulsoPalabras.length} de ${GUERRAS.length} guerras citadas por ${totalPalabras} titulares del archivo`"), "la línea del pulso no se compone COMPLETA en JS");
    afirmar(sala.includes("EL PULSO POR PALABRAS"), "la sección no viaja");
    afirmar(sala.includes("{p.nombre} · {p.n}"), "el nombre verbatim y el conteo no viajan juntos en la tarjeta");
    afirmar(sala.includes("el archivo no cita a ninguna guerra todavía — el pulso duerme honesto"), "el vacío del pulso no se declara honesto");
    afirmar(sala.includes("conflictos page error (pulso por palabras)"), "la lectura de títulos no es independiente del groupBy");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡/conflictos escribe fechas a mano en la ronda v290!");
    afirmar(!/const linea\w+ = [^;]*\b19\d\d\b/.test(sala), "¡la sala escribe años a mano en su línea (v290)!");
  });

  await verificar("EL PULSO POR PALABRAS viva: la línea derivada y las seis guerras con sus conteos (v290)", async () => {
    const r = await pedir("/conflictos");
    afirmar(r.status === 200, `/conflictos no 200 en v290 (${r.status})`);
    // LAS CIFRAS VIVAS (v310): la línea derivada con su sanidad — el aliento
    // de la BD no se congela (398 nació en la v290 y hoy camina)
    const lineaPalabras = r.texto.match(/El pulso por palabras — (\d+) de (\d+) guerras citadas por (\d+) titulares del archivo/);
    afirmar(lineaPalabras !== null, "la línea del pulso no viaja (o la fuente/BD cambió)");
    if (lineaPalabras) {
      const citadas = Number(lineaPalabras[1]);
      const totalG = Number(lineaPalabras[2]);
      const nTit = Number(lineaPalabras[3]);
      afirmar(citadas >= 1 && citadas <= totalG && totalG === 6, `el pulso cita ${citadas} de ${totalG} guerras (fuera del canon de la fuente)`);
      afirmar(nTit >= citadas, `los ${nTit} titulares no cubren a las ${citadas} guerras citadas`);
    }
    // las tarjetas: nombres verbatim + conteo VIVO (los comentarios RSC se pelan)
    const limpio = r.texto.replace(/<!-- -->/g, "");
    afirmar(/UCRANIA — LA GUERRA MAYOR · \d+ titulares?/.test(limpio), "la tarjeta de Ucrania no viaja con su conteo");
    afirmar(/ORIENTE MEDIO — EL EJE EN LLAMAS · \d+ titulares?/.test(limpio), "la tarjeta de Oriente no viaja con su conteo");
    // las guerras menores viven o duermen con el pulso vivo (la rotación de
    // la valla cosechó el único titular de Myanmar que la v290 congeló — el
    // vacío honesto de la sala lo cubre): las tarjetas que aparecen llevan
    // su nombre verbatim y su conteo vivo
    const tarjetasGuerra = [...limpio.matchAll(/([A-ZÁÉÍÓÚÑ]+[^·]{0,60}) · (\d+) titulares?/g)].map((m) => m[1].trim());
    afirmar(tarjetasGuerra.length >= 2, `las tarjetas del pulso midieron ${tarjetasGuerra.length} (< 2)`);
    for (const nombre of tarjetasGuerra) {
      afirmar(nombre === nombre.toUpperCase(), `una tarjeta del pulso viaja sin su nombre verbatim: «${nombre}»`);
    }
    afirmar(/href="\/noticia\/[a-z0-9-]+"/.test(r.texto), "la puerta viva a /noticia no viaja");
    // las anclas v284/v285 en pie (cifras vivas — la ley de la v310)
    afirmar(/El tablero de los conflictos — 33 regiones en seguimiento, \d+ con pulso vivo en el archivo y \d+ dormidas, con una intensidad media de 66\/100/.test(limpio), "la línea del tablero cayó (v284)");
    afirmar(limpio.includes("Encenderla en el globo ▸"), "la puerta al globo cayó (v285)");
  });

  // ── v296.0 LAS DIVISAS DEL PLANETA: world-data (v20, REAL) gana su sala server (/divisas) ──
  // El almacén menor sigue pagando: el dataset mundial generado (captura
  // open.er-api.com) sale del aparato al server.
  await verificar("LAS DIVISAS DEL PLANETA estática: la fuente REAL intacta y todo derivado (v296)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/world-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/divisas/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    // la fuente intacta: los dos bloques con sus censos reales (el
    // comentario dice 251 países; el dato de divisas mide 247 — manda el dato)
    afirmar(fuente.includes("export const WORLD_FLAGS"), "la fuente de banderas no existe");
    afirmar(fuente.includes("export const WORLD_CURRENCIES_FULL"), "la fuente de divisas no existe");
    const iniF = fuente.indexOf("export const WORLD_FLAGS");
    const iniC = fuente.indexOf("export const WORLD_CURRENCIES_FULL");
    const finC = fuente.indexOf("export const WORLD_FLAG_MAP");
    const nB = (fuente.slice(iniF, iniC).match(/\{ code: "/g) ?? []).length;
    afirmar(nB === 251, `el censo de banderas midió mal (${nB}/251)`);
    const bloqueC = fuente.slice(iniC, finC);
    const nC = (bloqueC.match(/\{ code: "/g) ?? []).length;
    afirmar(nC === 247, `el censo de divisas midió mal (${nC}/247)`);
    for (const reg of ["Asia", "Europa", "África", "América", "Oceanía", "Antártida"]) {
      afirmar(bloqueC.includes(`region: "${reg}"`), `falta la región ${reg} en la fuente`);
    }
    // la fuente completa: toda entrada con moneda y sin tasa nula
    afirmar((bloqueC.match(/curCode: "/g) ?? []).length === 247, "hay países sin moneda oficial");
    afirmar((bloqueC.match(/rate: 0(?:[,\s}])/g) ?? []).length === 0, "hay tasas nulas en la fuente");
    // la sala: los imports, la línea compuesta, los chips, el fmt, las compartidas
    afirmar(sala.includes('from "@/lib/world-data"'), "la sala no consume la fuente canónica");
    afirmar(
      sala.includes("if (!REGIONES.includes(c.region)) REGIONES.push(c.region)"),
      "las regiones no se derivan en el orden de la fuente",
    );
    afirmar(
      sala.includes("new Set(WORLD_CURRENCIES_FULL.map((c) => c.curCode))"),
      "las monedas únicas no se censan del dato",
    );
    afirmar(
      sala.includes(".filter((m) => m.paises.length >= 2)"),
      "las compartidas no se derivan del dato",
    );
    afirmar(
      sala.includes('.sort((a, b) => b.paises.length - a.paises.length || a.code.localeCompare(b.code, "es"))'),
      "las compartidas no tienen orden determinista",
    );
    afirmar(
      sala.includes("const lineaDivisas = `Las monedas del planeta — ${WORLD_CURRENCIES_FULL.length} países"),
      "la línea no se compone COMPLETA en JS",
    );
    afirmar(
      sala.includes("`" + "${reg} ×${WORLD_CURRENCIES_FULL.filter((c) => c.region === reg).length}`"),
      "el chip de región no compone región y conteo en un nodo",
    );
    afirmar(
      sala.includes('r.toLocaleString("es-ES", { maximumFractionDigits: r >= 100 ? 2 : 4 })'),
      "la tasa no se formatea con la regla derivada del canon",
    );
    afirmar(sala.includes("open.er-api.com"), "la sala no cita la fuente de la captura");
    // la clasificación manda: la sala no convierte, no simula, no dibuja
    // banderas (el CÓDIGO real decide — los comentarios que documentan la
    // exclusión no cuentan, lección v295: se pelan antes del aserto)
    const salaSinComentarios = sala.replace(/\/\/[^\n]*/g, "");
    afirmar(!salaSinComentarios.includes("use client") && !salaSinComentarios.includes("useState"), "¡la sala no es server pura!");
    afirmar(!salaSinComentarios.includes("flagcdn.com"), "¡las banderas viven en el aparato, no en la sala! (la URL real no viaja: la prosa que declara la puerta sí)");
    // las puertas de la casa
    afirmar(mapa.includes("/divisas"), "el sitemap no anuncia las divisas");
    afirmar(paleta.includes('key: "pg:divisas"'), "la paleta Ctrl+K no lleva las divisas");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas ISO a mano en la ronda v296!");
    afirmar(!/const linea\w+ = [^;]*\b(19|20)\d\d\b/.test(sala), "¡la sala escribe un año literal en su línea (v296)!");
  });

  await verificar("LAS DIVISAS DEL PLANETA viva: la línea derivada, los chips, las tasas formateadas y las compartidas (v296)", async () => {
    const r = await pedir("/divisas");
    afirmar(r.status === 200, `/divisas no 200 (${r.status})`);
    afirmar(r.texto.includes("LAS MONEDAS DEL PLANETA"), "el título no viaja");
    // la línea compuesta COMPLETA (247 · 6 · 154 · Euro 37 — derivados de la fuente)
    afirmar(
      r.texto.includes("Las monedas del planeta — 247 países y territorios con su moneda oficial real en 6 regiones y 154 monedas únicas; la más compartida: Euro, que sirve a 37 países"),
      "la línea derivada no viaja (o la fuente cambió)",
    );
    // los comentarios RSC y las etiquetas se pelan: los asertos miran el
    // TEXTO servido (lección v258, crecida en la v294)
    const texto = r.texto.replace(/<[^>]+>/g, "");
    afirmar(texto.includes("Asia ×50"), "el chip de Asia no viaja");
    afirmar(texto.includes("África ×59"), "el chip de África no viaja");
    afirmar(texto.includes("Japón"), "Japón no viaja");
    afirmar(texto.includes("JPY ¥ · Yen"), "la moneda de Japón no viaja completa");
    afirmar(texto.includes("tasa: 153,82 por 1 USD"), "la tasa del yen no viaja formateada");
    afirmar(texto.includes("AFN ؋ · Afgani"), "la moneda de Afganistán no viaja completa");
    afirmar(texto.includes("tasa: 64,779 por 1 USD"), "la tasa del afgani no viaja formateada");
    afirmar(texto.includes("EUR — Euro · € · 37 países"), "la fila del euro compartido no viaja");
    afirmar(texto.includes("USD — Dólar estadounidense · $ · 16 países"), "la fila del dólar compartido no viaja");
    // el sitemap vivo anuncia la sala
    const rs = await pedir("/sitemap.xml");
    afirmar(rs.status === 200 && rs.texto.includes("/divisas"), "el sitemap vivo no anuncia la sala");
  });

  // ── v297.0 EL PODER MUNDIAL: la captura REAL del Banco Mundial (v44) gana su sala server (/poder) ──
  // La directiva de la «Queda» v296 era clara: sube SOLO con captura
  // declarada — nace poder-data (gen-poder-data.mjs, mrnev=1, 2026-11-05).
  await verificar("EL PODER MUNDIAL estática: la captura REAL intacta y todo derivado (v297)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/poder-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/poder/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    // la captura intacta: la fuente citada, los tres indicadores y la fecha declarada
    afirmar(fuente.includes("api.worldbank.org"), "la fuente no cita el Banco Mundial");
    for (const ind of ["MS.MIL.XPND.CD", "MS.MIL.TOTL.P1", "MS.MIL.XPND.GD.ZS"]) {
      afirmar(fuente.includes(ind), `falta el indicador ${ind} en la fuente`);
    }
    afirmar(fuente.includes('fecha: "2026-11-05"'), "la fecha de la captura no está declarada");
    afirmar(!/\{ iso3: "WLD"/.test(fuente), "la captura lleva el agregado WLD (regla de la propia fuente: fuera)");
    // el censo: 167 filas, cero gasto nulo, las 7 regiones de la fuente
    const nF = (fuente.match(/\{ iso3: "/g) ?? []).length;
    afirmar(nF === 167, `el censo de filas midió mal (${nF}/167)`);
    afirmar(!fuente.includes("gasto: null"), "hay países sin gasto en la captura");
    for (const reg of ["Norteamérica", "Asia Oriental y Pacífico", "Europa y Asia Central", "Sur de Asia", "Oriente Medio, Norte de África, Afganistán y Pakistán", "América Latina y el Caribe", "África subsahariana"]) {
      afirmar(fuente.includes(`region: "${reg}"`), `falta la región ${reg} en la captura`);
    }
    // la sala: los imports, la derivación, los fmt, los chips, la fecha del locale
    afirmar(sala.includes('from "@/lib/poder-data"'), "la sala no consume la captura canónica");
    afirmar(sala.includes("sort((a, b) => b.gasto - a.gasto)"), "el ranking no se deriva por gasto");
    afirmar(
      sala.includes("if (!REGIONES.includes(f.region)) REGIONES.push(f.region)"),
      "las regiones no se derivan en el orden de la fuente",
    );
    afirmar(
      sala.includes("const lineaPoder = `El poder militar del planeta — ${RANKING.length} países"),
      "la línea no se compone COMPLETA en JS",
    );
    afirmar(
      sala.includes("`" + "${reg} ×${RANKING.filter((f) => f.region === reg).length}`"),
      "el chip de región no compone región y conteo en un nodo",
    );
    afirmar(
      sala.includes("(f.gasto / LIDER.gasto) * 100"),
      "la barra del ranking no se deriva contra el líder",
    );
    afirmar(
      sala.includes("new Date(`${PODER_CAPTURA.fecha}T00:00:00Z`)"),
      "la fecha de la captura no se deriva del dataset (guardia v234)",
    );
    afirmar(sala.includes("api.worldbank.org"), "la sala no cita la fuente de la captura");
    // la clasificación manda: la sala sirve la captura, no la lectura en
    // vivo, no dibuja banderas, no trae cliente (el CÓDIGO real decide —
    // los comentarios se pelan, lección v295)
    const salaSinComentarios = sala.replace(/\/\/[^\n]*/g, "");
    afirmar(!salaSinComentarios.includes("use client") && !salaSinComentarios.includes("useState"), "¡la sala no es server pura!");
    afirmar(!salaSinComentarios.includes("fetch(") && !salaSinComentarios.includes("getWorldPower"), "¡la sala sirve la captura, no la lectura en vivo!");
    afirmar(!salaSinComentarios.includes("flagcdn.com"), "¡las banderas no viajan en esta sala!");
    // las puertas de la casa
    afirmar(mapa.includes("/poder"), "el sitemap no anuncia el poder");
    afirmar(paleta.includes('key: "pg:poder"'), "la paleta Ctrl+K no lleva el poder");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas ISO a mano en la ronda v297!");
    afirmar(!/const linea\w+ = [^;]*\b(19|20)\d\d\b/.test(sala), "¡la sala escribe un año literal en su línea (v297)!");
  });

  await verificar("EL PODER MUNDIAL viva: la línea derivada, los chips, el ranking y el esfuerzo (v297)", async () => {
    const r = await pedir("/poder");
    afirmar(r.status === 200, `/poder no 200 (${r.status})`);
    afirmar(r.texto.includes("EL PODER MUNDIAL"), "el título no viaja");
    // la línea compuesta COMPLETA (167 · 2,89 · 954 · 33 — derivados de la captura)
    afirmar(
      r.texto.includes("El poder militar del planeta — 167 países con gasto militar registrado que suman US$ 2,89 billones en el último año con dato; Estados Unidos lidera con US$ 954 mil M, el 33% del total de los países con dato"),
      "la línea derivada no viaja (o la captura cambió)",
    );
    // el texto servido se pela de etiquetas (lección v258, crecida en la v294)
    const texto = r.texto.replace(/<[^>]+>/g, "");
    afirmar(texto.includes("Estados Unidos"), "el líder no viaja");
    afirmar(texto.includes("US$ 954 mil M"), "el gasto del líder no viaja formateado");
    afirmar(texto.includes("Asia Oriental y Pacífico ×20"), "el chip de Asia Oriental no viaja");
    afirmar(texto.includes("Europa y Asia Central ×49"), "el chip de Europa no viaja");
    afirmar(texto.includes("África subsahariana ×46"), "el chip de África no viaja");
    afirmar(texto.includes("India"), "India no viaja");
    afirmar(texto.includes("3,1 M"), "el personal de India no viaja formateado");
    afirmar(texto.includes("2,5 M"), "el personal de China no viaja formateado");
    afirmar(texto.includes("Ucrania"), "Ucrania no viaja");
    afirmar(texto.includes("39,6%"), "el esfuerzo de Ucrania no viaja");
    afirmar(texto.includes("5 de noviembre de 2026"), "la fecha de la captura no viaja en prosa");
    // el sitemap vivo anuncia la sala
    const rs = await pedir("/sitemap.xml");
    afirmar(rs.status === 200 && rs.texto.includes("/poder"), "el sitemap vivo no anuncia la sala");
  });

  // ── v298.0 LA FOTOTECA DEL PLANETA: la capa REAL del aparato (v98) gana su sala server (/galeria) ──
  // La «Queda» de la v297 pedía clasificación fina: la medición la pagó
  // contra el DISCO — las 50 fotos existen de verdad.
  await verificar("LA FOTOTECA DEL PLANETA estática: el dataset REAL verificado contra el disco y todo derivado (v298)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/imagenes-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/galeria/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    // el dataset intacto: 50 entradas censadas por patrón, las 5 categorías
    const nE = (fuente.match(/\{ id: "/g) ?? []).length;
    afirmar(nE === 50, `el censo de fotos midió mal (${nE}/50)`);
    for (const cat of ["armas", "archivo", "poder", "lugares", "civilizaciones"]) {
      afirmar(fuente.includes(`cat: "${cat}"`), `falta la categoría ${cat} en la fuente`);
    }
    // el claim REAL se MIDE: cero src remota y las 50 fotos existen en public/
    afirmar(!/src: "http/.test(fuente), "¡hay fotos remotas en la capa REAL!");
    const rutas = [...fuente.matchAll(/src: "([^"]+)"/g)].map((m) => m[1]);
    afirmar(rutas.length === 50, `las rutas midieron mal (${rutas.length}/50)`);
    for (const r of rutas) {
      afirmar(r.startsWith("/imagenes-reales/"), `ruta fuera de la fototeca local: ${r}`);
      afirmar(existsSync(join(RAIZ, "public", r)), `¡la foto REAL no existe en el disco: ${r}!`);
    }
    // toda entrada con su nota editorial y su fuente declarada
    const nNotas = (fuente.match(/nota: "/g) ?? []).length;
    const nFuentes = (fuente.match(/fuente: "/g) ?? []).length;
    afirmar(nNotas === 50, `faltan notas editoriales (${nNotas}/50)`);
    afirmar(nFuentes === 50, `faltan fuentes declaradas (${nFuentes}/50)`);
    // la sala: los imports, la derivación, los chips, la línea, la foto local
    afirmar(sala.includes('from "@/lib/imagenes-data"'), "la sala no consume la fuente canónica");
    afirmar(
      sala.includes("if (!CATS.includes(im.cat)) CATS.push(im.cat)"),
      "las categorías no se derivan en el orden de la fuente",
    );
    afirmar(
      sala.includes("const lineaGaleria = `La fototeca del planeta — ${FOTOS.length} fotografías"),
      "la línea no se compone COMPLETA en JS",
    );
    afirmar(
      sala.includes("`" + "${cat} ×${FOTOS.filter((im) => im.cat === cat).length}`"),
      "el chip de categoría no compone categoría y conteo en un nodo",
    );
    afirmar(sala.includes('loading="lazy"'), "las fotos no viajan con carga perezosa");
    // la clasificación manda: la sala es server pura y sirve fotos LOCALES
    // (el CÓDIGO real decide — los comentarios se pelan, lección v295)
    const salaSinComentarios = sala.replace(/\/\/[^\n]*/g, "");
    afirmar(!salaSinComentarios.includes("use client") && !salaSinComentarios.includes("useState"), "¡la sala no es server pura!");
    afirmar(!salaSinComentarios.includes("fetch("), "¡la sala no necesita la red: el archivo vive en el disco!");
    afirmar(!salaSinComentarios.includes("flagcdn.com") && !salaSinComentarios.includes('src="http'), "¡cero hotlinking: las fotos son locales!");
    // las puertas de la casa
    afirmar(mapa.includes("/galeria"), "el sitemap no anuncia la galería");
    afirmar(paleta.includes('key: "pg:galeria"'), "la paleta Ctrl+K no lleva la galería");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas ISO a mano en la ronda v298!");
    afirmar(!/const linea\w+ = [^;]*\b(19|20)\d\d\b/.test(sala), "¡la sala escribe un año literal en su línea (v298)!");
  });

  await verificar("LA FOTOTECA DEL PLANETA viva: la línea derivada, los chips, las fotos locales y las categorías (v298)", async () => {
    const r = await pedir("/galeria");
    afirmar(r.status === 200, `/galeria no 200 (${r.status})`);
    afirmar(r.texto.includes("LA FOTOTECA DEL PLANETA"), "el título no viaja");
    // la línea compuesta COMPLETA (50 · 5 · primera y última — derivados de la fuente)
    afirmar(
      r.texto.includes("La fototeca del planeta — 50 fotografías reales servidas localmente en 5 categorías, de «Arco compuesto» a «Cohete V-2»"),
      "la línea derivada no viaja (o la fuente cambió)",
    );
    // el texto servido se pela de etiquetas (lección v258, crecida en la v294)
    const texto = r.texto.replace(/<[^>]+>/g, "");
    afirmar(texto.includes("lugares ×19"), "el chip de lugares no viaja");
    afirmar(texto.includes("archivo ×10"), "el chip de archivo no viaja");
    afirmar(texto.includes("poder ×5"), "el chip de poder no viaja");
    afirmar(texto.includes("Arco compuesto"), "la primera foto de la fuente no viaja");
    afirmar(texto.includes("Cohete V-2"), "la última foto de la fuente no viaja");
    afirmar(texto.includes("fuente: Archivo fotográfico Vanguard"), "la fuente declarada no viaja");
    // la foto LOCAL viaja en el HTML (cero hotlinking)
    afirmar(r.texto.includes('src="/imagenes-reales/arco.jpg"'), "la foto local del arco no viaja en el HTML");
    // el sitemap vivo anuncia la sala
    const rs = await pedir("/sitemap.xml");
    afirmar(rs.status === 200 && rs.texto.includes("/galeria"), "el sitemap vivo no anuncia la sala");
  });

  // ── v299.0 LA VOZ DE VANGUARD: la ronda del OÍDO — bug muerto, letra, permiso de hablarle y carriles ──
  await verificar("LA VOZ DE VANGUARD estática: la LETRA cubre las 34 obras, el RESYNC es puro y los carriles separan la esquina (v299)", () => {
    const letra = readFileSync(join(RAIZ, "src/lib/letra-vanguard.ts"), "utf8");
    const motor = readFileSync(join(RAIZ, "src/lib/conflict-music.ts"), "utf8");
    const pill = readFileSync(join(RAIZ, "src/components/vanguard/music-player.tsx"), "utf8");
    const orbe = readFileSync(join(RAIZ, "src/components/vanguard/asistente-voz.tsx"), "utf8");
    const oido = readFileSync(join(RAIZ, "src/components/vanguard/permiso-mic.tsx"), "utf8");
    const boca = readFileSync(join(RAIZ, "src/components/vanguard/permiso-voz.tsx"), "utf8");
    const sfx = readFileSync(join(RAIZ, "src/lib/sound.ts"), "utf8");
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    // la letra cubre TODAS las obras del motor (34 censadas del propio motor)
    const ids = [...motor.matchAll(/^\s{4}id: "([a-z0-9-]+)",$/gm)].map((m) => m[1]);
    afirmar(ids.length === 34, `el motor censó ${ids.length} obras ≠ 34`);
    for (const id of ids) {
      afirmar(letra.includes(`\n  ${id}: {`), `la obra ${id} no tiene letra`);
    }
    const nVersos = (letra.match(/\n    A: "/g) ?? []).length; // 4 espacios = las obras; la etiqueta "A: VERSO" (2 espacios) queda fuera
    afirmar(nVersos === 34, `los versos A censados ${nVersos} ≠ 34 (cada obra canta)`);
    // UNA fuente para letra y canto: el motor importa parteDeCompas y canta en el compás
    afirmar(motor.includes('from "@/lib/letra-vanguard"'), "el motor no canta con la letra de la casa");
    afirmar(motor.includes("cantaLetra(t.id, parte, lineaDeParte(l, parte))"), "el secuenciador no canta la línea del compás");
    afirmar(letra.includes("export function parteDeCompas"), "parteDeCompas no es la fuente única");
    // el resync musical: helpers PUROS + mirada 1.2 s + tick 120 ms + carrera de fundidos
    afirmar(motor.includes("export function siguienteCompas"), "siguienteCompas no es puro/exportado");
    afirmar(motor.includes("export function debeResync"), "debeResync no es puro/exportado");
    afirmar(motor.includes("MIRADA_ADELANTE_S = 1.2"), "la mirada del secuenciador sigue en 0.24 s (el bug vive)");
    afirmar(motor.includes("TICK_MS = 120"), "el tick sigue en 45 ms (el bug vive)");
    afirmar(motor.includes("const miSeq = ++fadeSeq"), "la carrera de fundidos sigue viva");
    afirmar(motor.includes("master.gain.cancelScheduledValues"), "el arranque limpio no levanta el master (radio muda tras fundido)");
    // el pulso del mundo: la casa escucha la tensión real
    afirmar(motor.includes("export function setPulsoMundo"), "setPulsoMundo no existe (mundo sordo)");
    afirmar(pill.includes("setPulsoMundo"), "la radio no alimenta el pulso del mundo");
    // los carriles de la esquina: cofre 8px · radio 56px · orbe 104px · tarjetas que no pisan
    afirmar(pill.includes("fixed bottom-14 right-2 sm:bottom-14 sm:right-3 z-40"), "la radio no vive en su carril de 56px");
    afirmar(orbe.includes("bottom-[calc(104px+env(safe-area-inset-bottom,0px))]"), "el orbe no vive en su carril de 104px");
    afirmar(boca.includes("bottom-[calc(176px+env(safe-area-inset-bottom,0px))]"), "la tarjeta de la boca pisa el carril del orbe");
    // el oído: permiso por adelantado, se suelta al instante, himno de la casa
    afirmar(oido.includes("navigator.mediaDevices.getUserMedia({ audio: true })"), "el permiso del oído no pide el micrófono");
    afirmar(oido.includes("stream.getTracks().forEach((tr) => tr.stop())"), "el oído no suelta el micrófono al instante");
    afirmar(oido.includes("sfx.himno()"), "el oído no abre con la llamada de la casa");
    afirmar(oido.includes('"vg:pide-permiso-mic"'), "el oído no responde al grito del orbe");
    afirmar(orbe.includes('vg:pide-permiso-mic"')); // el orbe llama a la tarjeta al topar not-allowed
    afirmar(sfx.includes("himno: () => {"), "sfx.himno no existe (la casa sin llamada)");
    afirmar(sfx.includes("(Math.random() - 0.5) * 0.008"), "la humanización viva no está en playTone (sonidos idénticos)");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v303.0 (avanza con la plantilla)");
  });

  await verificar("LA VOZ DE VANGUARD viva: el home sirve la versión del oído y la Radio con su letra (v299)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v303.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no canta v307");
  });

  // ── v300.0 LA GUARDIA DEL OÍDO: la orden del Dueño queda BLINDADA — el
  // permiso es RECUPERABLE dentro del panel del orbe, el cofre guarda su
  // carril de 8px y las dos puertas del micrófono (tarjeta v299 + fila
  // v300) coexisten ──
  await verificar("LA GUARDIA DEL OÍDO estática: permiso recuperable en el panel, carril del cofre fijado y dos puertas coexistiendo (v300)", () => {
    const orbe = readFileSync(join(RAIZ, "src/components/vanguard/asistente-voz.tsx"), "utf8");
    const cofre = readFileSync(join(RAIZ, "src/components/vanguard/retention-layer.tsx"), "utf8");
    const oido = readFileSync(join(RAIZ, "src/components/vanguard/permiso-mic.tsx"), "utf8");
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    // la fila permanente: estado REAL del aparato + PEDIR PERMISO con getUserMedia
    afirmar(orbe.includes("navigator.permissions"), "la fila de micrófono no consulta el estado real del aparato");
    afirmar(orbe.includes("perms?.query"), "la fila no usa la API de permisos");
    afirmar(orbe.includes('name: "microphone"'), "la fila no pregunta por el MICRÓFONO");
    afirmar(orbe.includes("p.onchange"), "el estado del permiso no vive (sin onchange la fila miente)");
    afirmar(orbe.includes("getUserMedia({ audio: true })"), "PEDIR PERMISO no abre el diálogo real del navegador");
    afirmar(orbe.includes("getTracks().forEach((t) => t.stop())"), "el pedido no suelta el micrófono al instante");
    afirmar(orbe.includes("ESTADO_MIC"), "el estado del micrófono no tiene lengua propia");
    afirmar(orbe.includes('permisoMic !== "sin-api"'), "la fila no sabe callarse en aparatos sin API de permisos");
    afirmar(orbe.includes('toast } from "sonner"'), "el aviso del permiso concedido no viaja por el canal de la casa");
    // el cofre en SU carril: la queja del Dueño no puede regresar
    afirmar(cofre.includes('data-vg-retencion="cofre"'), "el cofre perdió su marca de retención");
    afirmar(cofre.includes("fixed bottom-2 right-2 z-30"), "el cofre no vive en su carril de 8px (¿volvió a tapar la radio?)");
    // dos puertas, un oído: la tarjeta (v299) y la fila (v300) coexisten
    afirmar(oido.includes("getUserMedia"), "la tarjeta del oído desapareció");
    afirmar(orbe.includes("vg:pide-permiso-mic"), "el orbe ya no llama a la tarjeta del oído");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v303.0");
  });

  await verificar("LA GUARDIA DEL OÍDO viva: el health canta v304 y el home guarda la crónica del oído (v300→v304)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("v324.0"), "la v303.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no canta v307");
  });

  // ── v301.0 LA BIBLIOTECA OSCURA: oscura-data (v63, REAL: «cada teoría
  // con veredicto REAL/MITO/PARCIAL y fuente real») gana su sala server
  // (/oscura) — el teaser de /guerra-hoy la presenta, el aparato la juega
  // (cada lectura paga), la sala abre CADA entrada a su documento
  // original con enlace real ──
  await verificar("LA BIBLIOTECA OSCURA estática: la fuente intacta (43 entradas con fuente real), la sala derivada y las puertas (v301)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/oscura-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/oscura/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    // la fuente intacta: las 4 colecciones con su censo real
    const nT = (fuente.match(/id: "t-/g) ?? []).length;
    const nA = (fuente.match(/id: "a-/g) ?? []).length;
    const nC = (fuente.match(/id: "c-/g) ?? []).length;
    const nD = (fuente.match(/id: "d-/g) ?? []).length;
    afirmar(nT === 14, `teorías ${nT} ≠ 14`);
    afirmar(nA === 11, `armas-idea ${nA} ≠ 11`);
    afirmar(nC === 10, `civilizaciones ${nC} ≠ 10`);
    afirmar(nD === 8, `documentos ${nD} ≠ 8`);
    // las 43 con url pública y fuente declarada: cero url local (el claim REAL se mide)
    const nUrls = (fuente.match(/url: "https?:\/\//g) ?? []).length;
    afirmar(nUrls === 43, `urls públicas ${nUrls} ≠ 43 (cada entrada abre su documento)`);
    afirmar(!/url: "\//.test(fuente), "hay urls locales en la fuente (el claim REAL se mide)");
    afirmar((fuente.match(/fuente: "/g) ?? []).length === 43, "la fuente declarada no cubre las 43");
    // los veredictos y las rarezas dentro de sus dominios, cero ISO en el dataset
    for (const v of fuente.match(/veredicto: "[A-Z]+"/g) ?? []) {
      afirmar(/veredicto: "(REAL|MITO|PARCIAL)"/.test(v), `veredicto fuera de dominio: ${v}`);
    }
    for (const r2 of fuente.match(/rareza: "[A-Z]+"/g) ?? []) {
      afirmar(/rareza: "(COMUN|RARO|EPICO|LEGENDARIO)"/.test(r2), `rareza fuera de dominio: ${r2}`);
    }
    afirmar(!/20\d\d-\d\d-\d\d/.test(fuente), "ISO en el dataset (guardia v234)");
    // la sala derivada: import canónico, server pura, línea compuesta en JS
    afirmar(sala.includes('import { TEORIAS, ARMAS, CIVILIZACIONES, DOCS } from "@/lib/oscura-data"'), "la sala no importa la fuente canónica");
    afirmar(!sala.includes('"use client"') && !sala.includes("useEffect") && !sala.includes("fetch("), "la sala no es server pura (el código pelado decide, lección v295)");
    const linea = (sala.match(/const lineaOscura = `([^`]+)`;/) ?? ["", ""])[1];
    afirmar(linea.includes("${TOTAL}") && linea.includes("${TEORIAS.length}") && linea.includes("${ARMAS.length}") && linea.includes("${CIVILIZACIONES.length}") && linea.includes("${DOCS.length}"), "la línea compuesta no se deriva del dato (lección v256)");
    afirmar(!/\d{4}/.test(linea), "año escrito en la línea compuesta (guardia del arco)");
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "ISO en la sala (guardia v234)");
    afirmar(sala.includes("!VEREDICTOS.includes"), "los veredictos no se derivan en el orden de la fuente (lección v274)");
    afirmar(sala.includes("${v} ×${TEORIAS.filter"), "los chips del veredicto no están en un solo nodo (lección v274)");
    afirmar(sala.includes("function clasesVeredicto"), "el color del veredicto no es regla derivada");
    afirmar((sala.match(/rel="noopener noreferrer"/g) ?? []).length >= 4, "las entradas no abren su documento con enlace real");
    afirmar(sala.includes("numberOfItems: TOTAL") && sala.includes('"@type": "CollectionPage"'), "el JSON-LD no censa las 43 entradas");
    afirmar(sala.includes("esta sala funciona sin JavaScript — {lineaOscura}"), "el noscript no canta la línea");
    // las puertas: sitemap + paleta
    afirmar(mapa.includes("url: `${SITE_URL}/oscura`"), "el sitemap no anuncia /oscura");
    afirmar(paleta.includes('key: "pg:oscura"') && paleta.includes('href: "/oscura"'), "la paleta no lleva a /oscura");
    afirmar(paleta.includes("<EyeOff className="), "el token EyeOff no vive en la paleta");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v303.0");
  });

  await verificar("LA BIBLIOTECA OSCURA viva: el SSR sirve la línea derivada, los censos y las fuentes reales (v301)", async () => {
    const r = await pedir("/oscura");
    afirmar(r.status === 200, `/oscura no 200 (${r.status})`);
    // el trap RSC (lección v295): React separa los nodos de texto con
    // comentarios — se pelan ANTES de asertar las líneas compuestas
    const plano = r.texto.replace(/<!-- -->/g, "");
    afirmar(plano.includes("LA BIBLIOTECA OSCURA"), "la sala no canta su nombre");
    afirmar(plano.includes("43 entradas con su fuente real citada"), "la línea compuesta no viaja en el SSR");
    afirmar(plano.includes("MITO ×3") && plano.includes("PARCIAL ×5") && plano.includes("REAL ×6"), "los chips del veredicto no viajan censados");
    afirmar(plano.includes("LEGENDARIO ×4") && plano.includes("EPICO ×6"), "los chips de rareza no viajan censados");
    afirmar(plano.includes("LAS TEORÍAS CON VEREDICTO ×14") && plano.includes("LAS ARMAS-IDEA ×11") && plano.includes("LAS CIVILIZACIONES QUE DESAPARECIERON ×10") && plano.includes("LOS DOCUMENTOS DESCLASIFICADOS ×8"), "las colecciones no viajan censadas");
    afirmar(plano.includes("REPTILIANOS") && plano.includes("VENONA") && plano.includes("GATEWAY EXPERIENCE"), "las entradas no viajan en el SSR");
    afirmar(plano.includes("fuente: CIA Reading Room"), "la fuente real no viaja en el SSR");
    afirmar(plano.includes('rel="noopener noreferrer"') && plano.includes("cia.gov/readingroom"), "el documento original no abre su enlace real");
    afirmar(plano.includes("Alejandría Oscura") && plano.includes("/guerra-hoy"), "las puertas honestas no viajan");
    afirmar(plano.includes("application/ld+json") && plano.includes('"@type":"CollectionPage"'), "el JSON-LD no viaja");
    // el sitemap vivo anuncia la sala
    const rs = await pedir("/sitemap.xml");
    afirmar(rs.status === 200 && rs.texto.includes("/oscura"), "el sitemap vivo no anuncia la sala");
  });

  // ── v302.0 EL MUNDO RESPIRA: la cola viva del oído (v300) — el ambiente
  // del mundo con la radio APAGADA. Drone, aliento, latido y señal, todo
  // sintetizado; candado de gesto, cesión a la radio y sin ráfagas ──
  await verificar("EL MUNDO RESPIRA estática: el motor del ambiente (helpers puros, candado de gesto, cesión a la radio, sin ráfagas) y el botón MUNDO en la píldora (v302)", () => {
    const motor = readFileSync(join(RAIZ, "src/lib/ambiente-mundo.ts"), "utf8");
    const pill = readFileSync(join(RAIZ, "src/components/vanguard/music-player.tsx"), "utf8");
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    // los helpers PUROS del planeta: carácter, intensidad, latido y señal
    afirmar(motor.includes("export function caracterMundo"), "caracterMundo no es puro/exportado (el mundo sin lengua)");
    for (const c of ["dormido", "respira", "late", "arde"]) {
      afirmar(motor.includes(`"${c}"`), `el mundo no sabe estar ${c}`);
    }
    afirmar(motor.includes("export function intensidadAmbiente"), "intensidadAmbiente no existe (el mundo sin escala)");
    afirmar(motor.includes("export function siguienteLatido"), "siguienteLatido no es puro/exportado (el corazón sin ritmo)");
    afirmar(motor.includes("export function siguienteSenal"), "siguienteSenal no es puro/exportado (los cables sin marca)");
    // el candado de gesto (ley v217) y la persistencia propia
    afirmar(motor.includes("export function resumeAmbienteSiQuerido"), "el mundo no despierta al primer gesto (ley v217 rota)");
    afirmar(motor.includes('LS_AMBIENTE = "vg_ambiente_v302"'), "el ambiente no tiene su persistencia propia");
    afirmar(motor.includes("export function toggleAmbiente"), "el mundo no tiene botón (toggleAmbiente falta)");
    // la cesión a la radio: el mundo jamás pisa la obra
    afirmar(motor.includes('from "@/lib/conflict-music"'), "el motor no mira a la orquesta (cesión imposible)");
    afirmar(motor.includes("isMusicPlaying()"), "el mundo no sabe cuándo suena la radio");
    afirmar(motor.includes("subscribeMusic("), "el mundo no oye el vaivén de la radio (sin suscripción)");
    afirmar(motor.includes('"en-espera"'), "el estado honesto no sabe esperar a la radio");
    afirmar(motor.includes("export function estadoAmbiente") && motor.includes("export function subscribeAmbiente"), "el estado honesto no es consultable");
    // sin ráfagas (lección v299 aplicada al planeta): el golpe se reprograma desde AHORA
    afirmar(motor.includes("clearTimeout(timerLatido)"), "el latido acumula deuda (la lección v299 no llegó al planeta)");
    afirmar(motor.includes("siguienteLatido(tensionActual, Math.random())"), "el latido no lleva deriva humana (robot)");
    // la píldora: botón MUNDO con su marca y el 4.º modo honesto
    afirmar(pill.includes('from "@/lib/ambiente-mundo"'), "la píldora no conoce al mundo");
    afirmar(pill.includes("data-vg-mundo"), "el botón MUNDO no tiene su marca en la píldora");
    afirmar(pill.includes("EL MUNDO RESPIRA"), "el 4.º modo no canta su nombre");
    afirmar(pill.includes("resumeAmbienteSiQuerido"), "la píldora no despierta al mundo al primer gesto");
    afirmar(pill.includes("toggleMundo"), "la píldora no puede mover el mundo (toggleMundo falta)");
    // la versión camina con la casa
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v303.0");
  });

  await verificar("EL MUNDO RESPIRA viva: el home canta la ronda y el health la respira (v302→v304)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v303.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no respira v307");
  });

  // ── v303.0 LA PLANTILLA COMPLETA: la expansión del módulo EMPLEOS — 8
  // oficinas con 48 tareas, VACANTES de RRHH (los nuevos alcanzables), el
  // CONTRATO DE LA SEMANA determinista y +2 rangos ──
  await verificar("LA PLANTILLA COMPLETA estática: 8 oficinas censadas con sus 48 tareas, el contrato de la semana puro, el estado retrocompatible y el panel con vacantes y tarjeta (v303)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/empleos.ts"), "utf8");
    const panel = readFileSync(join(RAIZ, "src/components/vanguard/panels/empleos-panel.tsx"), "utf8");
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    // el censo de la plantilla: 8 oficinas (un sueldoBase NUMÉRICO por
    // departamento — la declaración de la interfaz no es una oficina)
    const nOficinas = (fuente.match(/sueldoBase: [\d.]+/g) ?? []).length;
    afirmar(nOficinas === 8, `la plantilla censó ${nOficinas} oficinas ≠ 8`);
    for (const id of ["estadomayor", "cartografia", "sigint", "cancilleria", "logistica", "transmisiones", "contraintel", "prensa"]) {
      afirmar(fuente.includes(`id: "${id}"`), `falta la oficina ${id} en la plantilla`);
    }
    // las tareas: 56 preguntas = 8 de entrevista + 48 de turno (6 por oficina)
    const nQ = (fuente.match(/q: "/g) ?? []).length;
    afirmar(nQ === 56, `las preguntas censadas ${nQ} ≠ 56 (8 entrevista + 48 turnos)`);
    // cada oficina lleva 6 tareas (la ronda no entregó oficinas cojas):
    // el bloque de cada oficina va desde su id hasta el id siguiente
    const IDS_OFICINAS = ["estadomayor", "cartografia", "sigint", "cancilleria", "logistica", "transmisiones", "contraintel", "prensa"];
    for (const id of IDS_OFICINAS) {
      const ini = fuente.indexOf(`id: "${id}"`);
      afirmar(ini > 0, `la oficina ${id} no se encontró`);
      const sig = fuente.indexOf('id: "', ini + 10);
      const bloque = fuente.slice(ini, sig > 0 ? sig : undefined);
      const nT = (bloque.match(/\{ q: "/g) ?? []).length;
      afirmar(nT === 6, `la oficina ${id} quedó con ${nT} tareas ≠ 6`);
    }
    // la escala de carrera: 7 rangos ascendentes con multiplicador creciente
    const iniR = fuente.indexOf("export const RANGOS");
    const finR = fuente.indexOf("export function rangoDe");
    const rangos = (fuente.slice(iniR, finR).match(/xp: (\d+), mult: ([\d.]+)/g) ?? []).map((s) => {
      const m = s.match(/xp: (\d+), mult: ([\d.]+)/);
      return { xp: Number(m[1]), mult: Number(m[2]) };
    });
    afirmar(rangos.length === 7, `los rangos censados ${rangos.length} ≠ 7`);
    for (let i = 1; i < rangos.length; i++) {
      afirmar(rangos[i].xp > rangos[i - 1].xp && rangos[i].mult > rangos[i - 1].mult, "la escala de carrera no asciende (XP o multiplicador)");
    }
    afirmar(fuente.includes("MARISCAL DE LA CASA") && fuente.includes("SUBDIRECTOR"), "los dos rangos nuevos no existen");
    // el contrato de la semana: helpers puros y deterministas
    afirmar(fuente.includes("export function weekKeyOf"), "weekKeyOf no existe (semana sin clave ISO)");
    afirmar(fuente.includes("export function contratoDeSemana"), "contratoDeSemana no es puro/exportado");
    afirmar(fuente.includes("export function claveContrato"), "claveContrato no existe (el progreso sin llave)");
    afirmar(fuente.includes("export interface ContratoSemanal"), "el contrato sin su forma");
    afirmar(fuente.includes("bono: 300 + ((h >> 9) % 5) * 100"), "el bono del contrato no es determinista derivado del hash");
    // los 8 títulos de encargo (cada título entre comillas: 16 comillas)
    const iniT = fuente.indexOf("const TITULOS_CONTRATO");
    const finT = fuente.indexOf("];", iniT);
    const nTitulos = (fuente.slice(iniT, finT).match(/"/g) ?? []).length / 2;
    afirmar(nTitulos === 8, `los títulos de encargo censados ${nTitulos} ≠ 8`);
    // el estado retrocompatible: los 4 campos nuevos con sus defaults
    for (const campo of ["contratoKey: \"\"", "contratoTurnos: 0", "contratoPerfectos: 0", "contratoCobrado: false"]) {
      afirmar(fuente.includes(campo), `el estado no arranca con ${campo}`);
    }
    // el panel: vacantes de RRHH + tarjeta del contrato + cobro y fila 3D
    afirmar(panel.includes("function VacantesChooser"), "el selector de vacantes no existe (los nuevos inalcanzables)");
    afirmar(panel.includes("DEPARTAMENTOS.filter((d) => d.apt === apt)"), "la entrevista no abre TODAS las vacantes de la aptitud");
    afirmar(panel.includes("data-vg-contrato"), "la tarjeta del contrato no tiene su marca");
    afirmar(panel.includes("CONTRATO DE LA SEMANA") || panel.includes("contrato de la semana"), "el contrato no canta su nombre en el panel");
    afirmar(panel.includes("cobrarContrato"), "el cobro del bono no existe");
    afirmar(panel.includes("cobrar bono"), "la sala 3D no puede cobrar el bono");
    afirmar(panel.includes("ocho oficinas"), "la casa sigue contando cuatro oficinas");
    // la versión camina con la casa
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v303.0");
  });

  await verificar("LA PLANTILLA COMPLETA viva: el home firma la ronda y el health la contrata (v303)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v303.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v307");
  });

  // ── v304.0 LA MANO DE LA FORTUNA: la expansión del módulo FORTUNA — la
  // HORA DORADA determinista (la suerte compartida), la LÁSTIMA (pity) y
  // EL LIBRO persistente con su tarjeta en la tienda ──
  await verificar("LA MANO DE LA FORTUNA estática: la hora dorada determinista, la lástima con escalera y techo, el libro persistente, el gancho del game-store y la tarjeta de la tienda (v304)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/fortuna.ts"), "utf8");
    const tienda = readFileSync(join(RAIZ, "src/components/vanguard/panels/shop-panel.tsx"), "utf8");
    const store = readFileSync(join(RAIZ, "src/lib/game-store.ts"), "utf8");
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    // LA HORA DORADA: determinista con la fecha UTC, paga ×1.5
    afirmar(fuente.includes("export function horaDorada"), "horaDorada no existe (la hora de suerte no es determinista)");
    afirmar(fuente.includes("MULT_HORA_DORADA = 1.5"), "la hora dorada no paga ×1.5");
    afirmar(fuente.includes("getUTCFullYear") && fuente.includes("getUTCHours"), "la hora dorada no vive en UTC (la casa desincronizada)");
    // LA LÁSTIMA: escalera con umbral y techo
    afirmar(fuente.includes("export function probGolpe"), "probGolpe no existe (la racha seca no calienta nada)");
    afirmar(fuente.includes("RACHA_PITY = 35"), "la lástima no tiene su umbral (35 pagos)");
    afirmar(fuente.includes("PROB_TECHO = 0.5"), "la lástima sin techo (0.5)");
    afirmar(fuente.includes("Math.min(PROB_TECHO, PROB_BASE + (racha - RACHA_PITY + 1) * 0.01)"), "la escalera de la lástima no es la probada");
    afirmar(fuente.includes("PROB_BASE = 0.14"), "la probabilidad histórica de la v84 no está declarada");
    // EL LIBRO: persistencia propia y registro honesto
    afirmar(fuente.includes('LS_FORTUNA = "vg_fortuna_v304"'), "el libro no tiene su persistencia propia");
    afirmar(fuente.includes("export function registrarPagoSeco"), "el pago seco no se registra (la racha no crece)");
    afirmar(fuente.includes("export function registrarFortuna"), "el golpe no se escribe en el libro");
    afirmar(fuente.includes("e.rachaSeca = 0;"), "el golpe no apaga la racha");
    afirmar(fuente.includes("mayorGolpe"), "el libro no guarda el mayor golpe");
    // el resultado honesto: elegible + motivo compuesto
    afirmar(fuente.includes("elegible: boolean"), "el resultado no distingue el pago elegible");
    afirmar(fuente.includes('compuesto.join(" · ")'), "el motivo compuesto no existe (la verdad a medias)");
    // el gancho del game-store escribe el libro
    afirmar(store.includes('registrarFortuna, registrarPagoSeco } from "@/lib/fortuna"'), "el gancho no importa al libro");
    afirmar(store.includes("registrarFortuna({ mult: f.mult, extra: f.extra, motivo: f.motivo, base: amount })"), "el gancho del addCoins no escribe el libro");
    afirmar(store.includes("registrarPagoSeco()"), "el gancho del addCoins no calienta la lástima");
    // la tarjeta de la tienda
    afirmar(tienda.includes("data-vg-libro-fortuna"), "la tienda no muestra el libro");
    afirmar(tienda.includes("EL LIBRO DE LA FORTUNA"), "el libro no canta su nombre en la tienda");
    afirmar(tienda.includes("HORA DORADA ACTIVA"), "la tienda no muestra la hora dorada activa");
    afirmar(tienda.includes("probGolpe(libro.rachaSeca)"), "el calor de la ruleta no es el helper probado");
    afirmar(tienda.includes("lástima de la casa"), "la lástima no se le explica al operador");
    // la versión camina con la casa
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v304.0");
  });

  await verificar("LA MANO DE LA FORTUNA viva: el home firma la ronda y el health la respalda (v304)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v304.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no respalda v307");
  });

  // ── v305.0 LA AUDITORÍA DE ACERO: el árbol medido a fondo (eslint
  // completo por primera vez, fugas una a una, XSS, refs en render) —
  // 5 ficheros reparados y el BLINDAJE permanente: los anti-patrones
  // censados NO pueden volver a crecer sin que la suite lo grite ──
  await verificar("LA AUDITORÍA DE ACERO estática: cero ts-ignore, las coerciones ciegas no crecen y los 5 ficheros reparados llevan su cura (v305)", () => {
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    // el censo de ESCAPES DE TIPO en TODO el árbol (recursivo, como el auditor)
    const censa = (regex) => {
      let n = 0;
      const pase = (dir) => {
        for (const e of readdirSync(dir, { withFileTypes: true })) {
          const ruta = join(dir, e.name);
          if (e.isDirectory()) pase(ruta);
          else if (/\.(ts|tsx)$/.test(e.name)) n += (readFileSync(ruta, "utf8").match(regex) ?? []).length;
        }
      };
      pase(join(RAIZ, "src"));
      return n;
    };
    const nTsIgnore = censa(/@ts-ignore|@ts-expect-error|@ts-nocheck/g);
    afirmar(nTsIgnore === 0, `el árbol lleva ${nTsIgnore} ts-ignore/ts-expect/ts-nocheck (la ley del auditor: CERO)`);
    // v306: la ley se APRIETA — de «no crecer» a CERO absoluto (la v306 pagó
    // las últimas 9: cookies tipadas con NextRequest, extractJson ya tipado,
    // el prefijo de Safari con unknown)
    const nAsAny = censa(/as any/g);
    afirmar(nAsAny === 0, `las coerciones ciegas volvieron: ${nAsAny} > 0 (la ley v306: CERO)`);
    // los 5 ficheros reparados llevan su cura declarada
    const signos = readFileSync(join(RAIZ, "src/components/vanguard/signos-vitales.tsx"), "utf8");
    afirmar(signos.includes("setNacimientos"), "el delta de nacimientos no vive en state (refs durante el render)");
    afirmar(signos.includes("prevPobl.current = n"), "la base del delta no se escribe en el reloj (render escribiendo refs)");
    const experimental = readFileSync(join(RAIZ, "src/components/vanguard/panels/experimental-panel.tsx"), "utf8");
    afirmar(experimental.includes("cursor: agarrando"), "el cursor grabbing sigue leyendo refs en el render");
    const centinela = readFileSync(join(RAIZ, "src/components/vanguard/panels/centinela-panel.tsx"), "utf8");
    afirmar(centinela.includes("[franjaMinuto]") && centinela.includes("[periodoVigia]"), "las dependencias complejas del compilador siguen ahí");
    const enVivo = readFileSync(join(RAIZ, "src/components/vanguard/panels/en-vivo-panel.tsx"), "utf8");
    afirmar(enVivo.includes("if (recTimerRef.current) clearInterval(recTimerRef.current);"), "el reloj de grabación sigue huérfano al desmontarse");
    const store = readFileSync(join(RAIZ, "src/lib/game-store.ts"), "utf8");
    afirmar(store.includes('(id === "RED" || id === "CYAN" || id === "AMBER")'), "la guardia de hudTheme no existe");
    // la versión camina con la casa
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v305.0");
  });

  await verificar("LA AUDITORÍA DE ACERO viva: el home firma la ronda y el health respalda el censo (v305)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v305.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no respalda v307");
  });

  // ── v306.0 EL AIRE DEL PERMISO: la segunda cuchilla del mandato del Dueño —
  // la CABECERA que ESTRANGULABA la voz de la casa (microphone=() de la
  // v102 mataba el getUserMedia de la v299 ANTES del permiso del usuario)
  // y las últimas 9 coerciones ciegas pagadas (CERO ley) ──
  await verificar("LA POLÍTICA DEL AIRE estática: la cabecera deja hablar a la casa (microphone=(self)), las cookies de sesión tipadas con NextRequest en las 4 rutas y el censo de coerciones en CERO (v306)", () => {
    const config = readFileSync(join(RAIZ, "next.config.ts"), "utf8");
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    // EL AIRE: la cabecera ya no estrangula la voz propia
    afirmar(config.includes("microphone=(self)"), "la cabecera sigue prohibiendo el micrófono (microphone=() — la v299 muere antes de pedir permiso)");
    afirmar(!config.includes("microphone=()"), "el veto absoluto al micrófono sigue vivo en la política");
    afirmar(config.includes("geolocation=(self)"), "la geolocalización de la casa perdió su permiso");
    afirmar(config.includes("X-Frame-Options") && config.includes("nosniff"), "la ciudadela v102 perdió sus cabeceras de acero");
    // LAS COOKIES: las 4 rutas de sesión con su tipo real (NextRequest)
    for (const ruta of ["src/app/api/agente/route.ts", "src/app/api/ugc/route.ts", "src/app/api/ugc/[id]/route.ts", "src/app/api/contrib/[id]/route.ts"]) {
      const r = readFileSync(join(RAIZ, ruta), "utf8");
      afirmar(r.includes("NextRequest"), `la ruta ${ruta} sigue con Request desnudo (cookies fuera del tipo)`);
      afirmar(!r.includes("as any"), `la ruta ${ruta} mantiene una coerción ciega`);
      afirmar(r.includes("req.cookies.get(SESSION_COOKIE)"), `la ruta ${ruta} no lee la cookie por el camino tipado`);
    }
    // CONSEJO y SONIDO: las coerciones restantes pagadas
    const consejo = readFileSync(join(RAIZ, "src/app/api/consejo/route.ts"), "utf8");
    afirmar(!consejo.includes("as any") && consejo.includes("extractJson(raw)"), "el consejo sigue forzando lo que ya estaba tipado");
    const sonido = readFileSync(join(RAIZ, "src/lib/sound.ts"), "utf8");
    afirmar(sonido.includes("webkitAudioContext?: typeof AudioContext"), "el prefijo de Safari sin su forma con unknown");
    // la versión camina con la casa
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v307.0");
  });

  await verificar("LA POLÍTICA DEL AIRE viva: el home firma la ronda y el health respira con permiso (v306)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v307.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no respira v307");
  });

  // ── v307.0 LA LEY DE LA VELOCIDAD: la TERCERA cuchilla del mandato del
  // Dueño («mejoren el rendimiento… No se limiten a corregir: innoven»).
  // El hallazgo medido: /vanguard2 importaba su motor de forma ESTÁTICA —
  // three.js viajaba en el grafo INICIAL de la ruta (~720 KB crudos de
  // núcleo en un chunk suelto) fuera del alcance del cacheGroup
  // «familia-tres» (chunks:"async") de la v244: la casa pagaba DOS copias
  // del motor. La cura (LA ISLA DEL UNIVERSO, patrón mundo-3d-vivo) vuelve
  // el grafo asíncrono y la copia duplicada muere. LA LEY: el censo del
  // BUILD vela la reunión — los chunks > 300 KB con CÓDIGO del motor
  // (marcador honesto isPerspectiveCamera|isMesh, el del velocímetro v238:
  // sobrevive a la minificación y no lo contiene ni maplibre ni los
  // inquilinos) deben ser EXACTAMENTE UNO y llamarse familia-tres. ──
  await verificar("LA LEY DE LA VELOCIDAD estática: la isla del universo existe y la página ya no importa el motor de forma estática (v307)", () => {
    const pagina = readFileSync(join(RAIZ, "src/app/vanguard2/page.tsx"), "utf8");
    const isla = readFileSync(join(RAIZ, "src/app/vanguard2/universo-isla.tsx"), "utf8");
    // la página server ya NO importa el componente del motor de forma estática
    afirmar(!pagina.includes('from "@/components/vanguard2/vanguard2"'), "la página del universo volvió a importar el motor de forma estática (la copia suelta regresa)");
    afirmar(pagina.includes('from "./universo-isla"'), "la página del universo no monta la isla perezosa");
    afirmar(pagina.includes("<UniversoIsla />"), "la isla no viaja en el render de la página");
    // la isla: patrón de la casa (next/dynamic ssr:false + placeholder del tono del universo)
    afirmar(isla.includes('"use client"'), "la isla no es client (ssr:false exige envoltorio client)");
    afirmar(isla.includes('import("@/components/vanguard2/vanguard2")'), "la isla no carga el universo en su propio chunk");
    afirmar(isla.includes("ssr: false"), "la isla no es perezosa de verdad (sin ssr:false el motor vuelve al HTML inicial)");
    afirmar(isla.includes("#02040a"), "el placeholder de la isla no viste el tono del universo (destello blanco al nacer)");
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v307.0");
  });

  await verificar("LA LEY DE LA VELOCIDAD: censo del BUILD — UNA sola copia del motor, la familia reunida (v307)", () => {
    const dir = join(RAIZ, ".next/static/chunks");
    afirmar(existsSync(dir), "el build no está (corre tras `npm run build`): la ley no puede velar sin build");
    const pesados = [];
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".js")) continue;
      const ruta = join(dir, f);
      const bytes = statSync(ruta).size;
      if (bytes <= 300 * 1024) continue; // los fragmentos compartidos (<300 KB) son hermanos, no copias
      const codigo = readFileSync(ruta, "utf8");
      if (/isPerspectiveCamera|isMesh/.test(codigo)) pesados.push(f);
    }
    afirmar(pesados.length === 1, `la casa paga ${pesados.length} copias del motor en chunks > 300 KB (${pesados.join(", ")}) — la reunión v244 está rota`);
    if (pesados.length === 1) {
      afirmar(pesados[0].startsWith("familia-tres"), `la copia única no es la familia reunida: ${pesados[0]}`);
    }
  });

  // ── v308.0 EL ESPEJO DEL NAVEGADOR: la CUARTA cuchilla del mandato del
  // Dueño (auditar todo, innovar, perfeccionar cada detalle). Las tres
  // cuchillas anteriores midieron el CÓDIGO (acero/aire/velocidad) — esta
  // mide el RENDER VIVO: el espejo (scripts/auditoria-render-v308.sh) arranca
  // la casa y la recorre con un navegador real (6 salas, escritorio y móvil),
  // censurando errores de página, consola y desborde horizontal. El veredicto
  // honesto: casa limpia EXCEPTO una herida de consola — THREE.Clock
  // DEPRECADA en 6 motores 3D (three 0.185 la marca muerta: cuando la quite,
  // la casa entera en 3D se queda sin tiempo). LA CURA: el reloj propio
  // (RelojTres, semántica EXACTA de Clock: primer getDelta = 0, acumulación
  // en elapsedTime, performance.now, nada recortado). LA LEY: censo de
  // CONSTRUCCIONES de APIs muertas del motor EXACTAMENTE CERO en el árbol
  // (la mención en el comentario del propio reloj-tres.ts es testigo de la
  // lección v306: se cuentan construcciones, no menciones) y en el BUILD la
  // marca del reloj deprecado («use THREE.Timer instead», única del núcleo de
  // three y superviviente de la minificación — medido) viaja en EXACTAMENTE
  // UN chunk: la familia reunida v244. La casa no paga segundas copias. ──
  await verificar("EL ESPEJO DEL NAVEGADOR estática: el reloj propio vive en los 6 motores y el instrumento espejo obedece la ley v302 (v308)", () => {
    const reloj = readFileSync(join(RAIZ, "src/lib/reloj-tres.ts"), "utf8");
    // la semántica EXACTA de la Clock que los motores ya vivían
    afirmar(reloj.includes("export class RelojTres"), "el reloj propio no existe");
    afirmar(reloj.includes("performance.now()"), "el reloj propio no usa performance.now (la fuente del tiempo de three)");
    afirmar(reloj.includes("return 0;"), "el reloj propio no arranca con delta 0 (el primer getDelta de Clock devuelve 0)");
    afirmar(reloj.includes("elapsedTime += diff"), "el reloj propio no acumula elapsedTime (hangar/drone/motor lo leen)");
    afirmar(reloj.includes("start(): void"), "el reloj propio no sabe arrancar (el motor del universo llama start() antes de su bucle)");
    afirmar(!reloj.includes("Math.min"), "el reloj propio recorta el delta (el techo es de cada motor, no del reloj — censo por constructo, no por mención: lección v306)");
    // los 6 motores construyen el reloj propio y NINGUNO construye la API muerta
    for (const ruta of [
      "src/components/vanguard/teatro-global-3d.tsx",
      "src/components/vanguard/teatro-guerra-3d.tsx",
      "src/components/vanguard/drone-strike-3d.tsx",
      "src/components/vanguard2/motor.ts",
      "src/components/vanguard/zc3d-engine.ts",
      "src/components/vanguard/hangar-3d.tsx",
    ]) {
      const fuente = readFileSync(join(RAIZ, ruta), "utf8");
      afirmar(fuente.includes('from "@/lib/reloj-tres"'), `${ruta} no viste el reloj propio`);
      afirmar(fuente.includes("new RelojTres()"), `${ruta} no construye el reloj propio`);
      afirmar(!fuente.includes("new THREE.Clock()"), `${ruta} sigue construyendo la API deprecada`);
    }
    // LA LEY: censo de CONSTRUCCIONES de la API muerta en TODO el árbol = CERO
    // (se cuentan construcciones `new THREE.Clock(`, no menciones — lección v306)
    let construcciones = 0;
    const censar = (dir) => {
      for (const f of readdirSync(dir)) {
        const r = join(dir, f);
        if (statSync(r).isDirectory()) { censar(r); continue; }
        if (!f.endsWith(".ts") && !f.endsWith(".tsx")) continue;
        const codigo = readFileSync(r, "utf8");
        construcciones += (codigo.match(/new THREE\.Clock\(/g) || []).length;
      }
    };
    censar(join(RAIZ, "src"));
    afirmar(construcciones === 0, `la casa construye la API muerta ${construcciones} veces (THREE.Clock marcada deprecada por three)`);
    // el instrumento espejo: repetible y con la ley v302 (arranque + auditoría + cierre por PID en UNA llamada)
    const espejo = readFileSync(join(RAIZ, "scripts/auditoria-render-v308.sh"), "utf8");
    afirmar(espejo.includes("/api/health"), "el espejo no arranca la casa de verdad (sin health no hay espejo)");
    afirmar(espejo.includes('kill "$SRVPID"'), "el espejo no cierra por PID (ley v302: cero zombis)");
    afirmar((espejo.match(/auditar "/g) || []).length >= 6, "el espejo mira menos de 6 salas (escritorio + móvil)");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v308.0");
  });

  await verificar("EL ESPEJO DEL NAVEGADOR: censo del BUILD — la marca del núcleo de three viaja en EXACTAMENTE UNA familia (v308)", () => {
    const dir = join(RAIZ, ".next/static/chunks");
    afirmar(existsSync(dir), "el build no está (corre tras `npm run build`): la ley no puede velar sin build");
    // la marca única del reloj deprecado de three («use THREE.Timer instead»,
    // string que solo emite THREE.Clock) sobrevive a la minificación y al
    // tree-shaking (medido: three viaja entero en su barrel) — por eso cuenta
    // COPIAS, no presencia: si la casa volviera a pagar una segunda copia del
    // motor (la herida v307), la marca aparecería en DOS chunks.
    const conMarca = [];
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".js")) continue;
      const codigo = readFileSync(join(dir, f), "utf8");
      if (codigo.includes("use THREE.Timer instead")) conMarca.push(f);
    }
    afirmar(conMarca.length === 1, `la marca del núcleo de three viaja en ${conMarca.length} chunks (${conMarca.slice(0, 3).join(", ")}) — segunda copia del motor`);
    if (conMarca.length === 1) {
      afirmar(conMarca[0].startsWith("familia-tres"), `la copia única no es la familia reunida: ${conMarca[0]}`);
    }
  });

  // ── v309.0 LA PRIMERA QUIRURGÍA: el pago de la deuda documentada — de los
  // 15 setState-en-efecto censados, la casa opera el PRIMERO con QA visual
  // propio: el riel de sección (v170). Su puerta de hidratación y su plegado
  // persistente viven ahora en TIENDAS EXTERNAS CANÓNICAS
  // (useSyncExternalStore con server snapshot — la forma que react.dev
  // recomienda) en vez de efectos que escriben estado. REGALO: el plegado
  // SYNCHRONIZA ENTRE PESTAÑAS (evento storage de las otras + evento propio
  // para la misma pestaña, que escribe sin disparar storage). La deuda baja
  // 15 → 13. growth-share queda INTOCABLE (patrón deliberado, lección v306). ──
  await verificar("LA PRIMERA QUIRURGÍA estática: el riel vive en tiendas externas canónicas, sin efectos que escriban estado, y la puerta de hidratación es el server snapshot (v309)", () => {
    const riel = readFileSync(join(RAIZ, "src/components/vanguard/riel-seccion.tsx"), "utf8");
    // LOS EFECTOS MUERTOS: cero efectos que escriban estado en el riel
    afirmar(!riel.includes("setMontado"), "el riel sigue escribiendo montado desde un efecto (la quirurgía no se aplicó)");
    afirmar(!riel.includes("setPlegado"), "el riel sigue escribiendo plegado desde un efecto");
    afirmar(!riel.includes("useEffect"), "el riel mantiene useEffect (las tiendas externas no lo necesitan)");
    // LAS TIENDAS CANÓNICAS: server snapshot + suscripción real
    afirmar((riel.match(/useSyncExternalStore\(/g) || []).length === 2, "el riel no vive en las dos tiendas externas canónicas");
    afirmar(riel.includes("suscribirPlegado") && riel.includes('addEventListener("storage"'), "el plegado no escucha a las OTRAS pestañas (el regalo entre pestañas murió)");
    afirmar(riel.includes("EVENTO_RIEL") && riel.includes("dispatchEvent"), "el plegado no avisa a su propia pestaña (storage no se dispara en la que escribe)");
    afirmar(riel.includes("noMontado"), "el server snapshot de la puerta de hidratación no existe (el HTML mentiría)");
    // LA MEMORIA Y EL CONTRATO v170 INTACTOS: misma llave, mismo atributo
    afirmar(riel.includes('"vg170-riel"'), "el riel perdió su llave de memoria (la v170 se olvida)");
    afirmar(riel.includes("data-vg-riel-plegado"), "el riel perdió su atributo para el CSS");
    afirmar(riel.includes('getItem') && riel.includes('setItem'), "el riel ya no lee ni escribe su memoria");
    // EL CONSUMIDOR: la casa sigue montando el riel
    const pagina = readFileSync(join(RAIZ, "src/app/page.tsx"), "utf8");
    afirmar(pagina.includes("<RielSeccion"), "la casa dejó de montar el riel de sección");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v309.0");
  });

  await verificar("LA PRIMERA QUIRURGÍA viva: el home sirve el riel desplegado en el SSR (el server snapshot no miente) y firma la ronda (v309)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes('data-vg-riel="1"'), "el SSR no sirve el riel");
    afirmar(r.texto.includes('data-vg-riel-plegado="0"'), "el SSR no nace desplegado (el server snapshot miente)");
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v309.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v309");
  });

  // ── v309.0 LA VALLA DEL ARCHIVO: la herida P0 de la ronda, cazada con
  // medición — la poda v84 (ventana de 6 días) cosechó 1600 cables en UN
  // refresco (1877→422, medido) cuando la red abrió: el archivo que las
  // salas v261-v289 y el sitemap v269 declararon PROFUNDO quedó hueco y la
  // suite lo gritó. LA CURA (aditiva, ninguna función eliminada): la poda
  // sigue podando pero NUNCA baja del piso del archivo (1900 > 1800, la ley
  // v269 con margen) — recorta solo el EXCEDENTE, los más viejos primero.
  // Reconstrucción completa en el worklog: INTEGER vs TEXT en SQLite (los
  // TEXT son inmortales para la poda por el orden de tipos — 77, medidos). ──
  await verificar("LA VALLA DEL ARCHIVO: la poda ya no puede cosechar el archivo entero — el piso vela a las salas del archivo (v309)", () => {
    const ruta = readFileSync(join(RAIZ, "src/app/api/news/route.ts"), "utf8");
    // la poda v84 SIGUE viva (su ventana y su exclusión de curadas intactas)
    afirmar(ruta.includes("6 * 24 * 3600_000"), "la ventana de 6 días de la poda v84 desapareció (la función no se elimina)");
    afirmar(ruta.includes('startsWith: "curated-"'), "la poda perdió su exclusión de las curadas evergreen");
    // LA VALLA: piso declarado, excedente medido, cosecha limitada
    afirmar(ruta.includes("PISO_ARCHIVO = 1900"), "la valla del archivo no existe (la poda puede volver a cosechar el archivo entero)");
    afirmar(ruta.includes("Math.max(0, total - PISO_ARCHIVO)"), "la poda no mide el EXCEDENTE sobre el piso (borra ciego otra vez)");
    afirmar(ruta.includes('orderBy: { publishedAt: "asc" }'), "la cosecha no es los más viejos primero (mata la noticia fresca)");
    afirmar(ruta.includes("take: Math.min(excedente, enVentana)"), "la cosecha no está limitada por el excedente ni por la ventana");
    afirmar(ruta.includes("deleteMany({ where: { id: { in:"), "la cosecha no va por ids exactos (borra ciego otra vez)");
    // la crónica de la herida: la casa recuerda el porqué
    afirmar(ruta.includes("LA VALLA DEL ARCHIVO"), "la valla no dejó su crónica (el porqué se pierde)");
  });

  // ── v310.0 LA SEGUNDA QUIRURGÍA: la deuda sigue pagándose (13 → 12) — el
  // paciente: la puerta de rehidratación del BONO DIARIO (v135, la cura de
  // la carrera #418). Su espera del REHIDRATADOR v132 vivía en un efecto que
  // escribía estado; ahora vive en la TIENDA EXTERNA canónica
  // (useSyncExternalStore + onFinishHydration — el patrón de los docs de
  // zustand), con la tabla de decisiones de la v135 calcada: sin persist,
  // ya hidratado o fallo → hidratado; server snapshot falso (el SSR jamás
  // abre el bono). QA visual propio: SSR mudo · la casa recuerda (bono
  // reclamado hoy NO reaparece) · operador nuevo → el bono abre tras la
  // rehidratación y el aterrizaje. ──
  await verificar("LA SEGUNDA QUIRURGÍA estática: la puerta del bono vive en la tienda externa canónica con la tabla de la v135 calcada (v310)", () => {
    const bono = readFileSync(join(RAIZ, "src/components/vanguard/daily-login-modal.tsx"), "utf8");
    // EL EFECTO MUERTO: cero escrituras de estado de hidratación
    afirmar(!bono.includes("setHidratado"), "el bono sigue escribiendo su hidratación desde un efecto (la quirurgía no se aplicó)");
    // LA TIENDA CANÓNICA: lectura por snapshot + suscripción al fin de hidratación
    afirmar((bono.match(/useSyncExternalStore\(/g) || []).length === 1, "el bono no vive en la tienda externa canónica");
    afirmar(bono.includes("leerHidratacion") && bono.includes("hasHydrated()"), "el snapshot no lee la bandera real del persist");
    afirmar(bono.includes("onFinishHydration"), "la suscripción no espera al REHIDRATADOR (el bono se abriría a ciegas)");
    // LA TABLA DE LA v135 CALCADA: sin persist, ya hidratado o fallo → hidratado
    afirmar(bono.includes("if (!p || p.hasHydrated()) return true;"), "la tabla de la v135 no está calcada (el bono puede quedar encerrado)");
    afirmar(bono.includes("catch { return true; }"), "el fallo del persist no libera al bono (quedaría encerrado)");
    afirmar(bono.includes("noHidratado"), "el server snapshot no existe (el SSR abriría el bono)");
    // el consumidor: la puerta del bono sigue velando la rehidratación antes de preguntar
    afirmar(bono.includes("if (!hidratado) return;"), "la puerta de la v135 desapareció (el bono preguntaría antes de recordar)");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v310.0");
  });

  await verificar("LA SEGUNDA QUIRURGÍA viva: el home firma la ronda y el health respalda la deuda pagada (v310)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v310.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v310");
  });

  // ── v311.0 LA TERCERA QUIRURGÍA: la deuda sigue pagándose (12 → 11) — el
  // paciente es el corte de la VOZ DEL PARTE del CRONOATLAS (v118/v119, el
  // panel de la máquina del tiempo): cambiar de día calla el parte y el
  // aviso del botón vuelve a «Escuchar». La cura vivía en un efecto que
  // escribía estado; hoy la PUREZA SE DIVIDE (la forma canónica de
  // react.dev «quizá no necesitas un efecto»): el corte del AUDIO queda en
  // un efecto que ya no escribe estado y el reset del AVISO se ajusta
  // DURANTE EL RENDER (el día previo guardado, corrección en el render en
  // curso — React descarta y re-renderea una vez). La centralización del
  // corte en las transiciones se DESCARTÓ tras el análisis de dependencias:
  // seis focos de cambio de día, dos dentro del latido del autoplay. ──
  await verificar("LA TERCERA QUIRURGÍA estática: el corte del día dividido por pureza — efecto sin escrituras de estado y ajuste durante el render, con el reproductor y sus seis focos intactos (v311)", () => {
    const m = readFileSync(join(RAIZ, "src/components/vanguard/panels/maquina-panel.tsx"), "utf8");
    // EL EFECTO ESCRITOR MUERTO: la vieja forma (corte de audio + reset en el
    // mismo efecto, con sangría de cuerpo de efecto) NO puede volver
    afirmar(!m.includes("callarVoz();\n    setVozOn(false);"), "el efecto del día vuelve a escribir estado (la quirurgía no se aplicó)");
    // EL AJUSTE DURANTE EL RENDER: día previo guardado y corrección en el render
    afirmar(m.includes("const [diaVoz, setDiaVoz] = useState(dia);"), "el día previo de la voz no se guarda (no hay ajuste durante el render)");
    afirmar(m.includes("if (diaVoz !== dia) {"), "la comparación del día previo no existe");
    afirmar(m.includes("setDiaVoz(dia);"), "el día previo no se actualiza dentro del ajuste (bucle infinito garantizado)");
    afirmar(m.includes("setVozOn(false);\n  }"), "el aviso de la voz no se resetea en el ajuste");
    // EL CORTE DEL AUDIO: efecto secundario legítimo, SIN escrituras de estado
    afirmar(m.includes("callarVoz();\n  }, [dia]);"), "el corte de audio del día ya no vive en su efecto (el contrato de la lib de voz muere)");
    // LAS OTRAS DOS PIEZAS DEL SISTEMA DE VOZ INTACTAS: el desmonte y el latido
    afirmar(m.includes("() => callarVoz(), [])"), "el corte al desmontar desapareció");
    afirmar(m.includes("vozActiva()") && m.includes("setInterval"), "el latido que sincroniza la voz con la librería desapareció");
    // EL CENSO DE LAS ESCRITURAS DEL AVISO (llamadas, no menciones — ley v309):
    // el latido (1) + el ajuste durante el render (1) + el botón (2) = 4
    const censoAviso = (m.match(/setVozOn\(/g) || []).length;
    afirmar(censoAviso === 4, `el censo de escrituras del aviso midió ${censoAviso} ≠ 4`);
    // EL REPRODUCTOR INTACTO: seis focos de cambio de día (dos en el autoplay)
    const censoDia = (m.match(/setDia\(/g) || []).length;
    afirmar(censoDia === 6, `los focos de cambio de día midieron ${censoDia} ≠ 6 (el reproductor fue tocado)`);
    // EL CONSUMIDOR: la casa sigue montando el CRONOATLAS
    const pagina = readFileSync(join(RAIZ, "src/app/page.tsx"), "utf8");
    afirmar(pagina.includes('tab === "maquina" && <MaquinaPanel />'), "la casa dejó de montar el panel de la máquina");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v311.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LA TERCERA QUIRURGÍA viva: el home firma la ronda y el health respalda la deuda pagada (v311)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v311.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v311");
  });

  // ── v312.0 LA CUARTA QUIRURGÍA: la deuda sigue pagándose (11 → 9) — dos
  // heridas en un solo paciente, la CÁMARA DE CONSECUENCIAS (v135
  // NEXUS-HYPNOS, el efecto mariposa de news-panel): el reset de los
  // CONTROLES al abrir un cable (el tag decide) y el REINICIO de la
  // proyección (paso a 0, o al final con movimiento reducido) vivían en
  // efectos que escribían estado. La cura: la SEGUNDA HERRAMIENTA de la
  // casa — el AJUSTE DURANTE EL RENDER (react.dev, «quizá no necesitas un
  // efecto») — para ambas; el RELOJ que avanza el paso es un efecto
  // secundario legítimo y queda puro (solo programa el intervalo). ──
  await verificar("LA CUARTA QUIRURGÍA estática: los dos efectos escritores de la cámara curados por ajuste durante el render y el reloj puro, con el contrato del whatif intacto (v312)", () => {
    const c = readFileSync(join(RAIZ, "src/components/vanguard/camara-consecuencias.tsx"), "utf8");
    // LOS DOS EFECTOS ESCRITORES MUERTOS: no puede volver el reset de los
    // controles en un efecto (el tag decide el arranque) ni el reinicio del
    // paso escrito sincrónicamente dentro de un efecto
    afirmar(!c.includes("setEscId(d.escId);\n    setPert(d.pert);\n    setDosis(3);\n    setHorizonte(180);\n  }, [cable]);"), "el reset de controles vuelve a vivir en un efecto escritor (la quirurgía no se aplicó)");
    afirmar(!c.includes("if (reduced) { setPaso(fin); return; }\n    setPaso(0);"), "el reinicio del paso vuelve a escribirse sincrónicamente en un efecto");
    // EL AJUSTE DURANTE EL RENDER: cable ya visto + reinicio ya visto
    afirmar(c.includes("const [cableVisto, setCableVisto] = useState(cable);"), "el cable ya visto no se guarda (no hay ajuste de los controles)");
    afirmar(c.includes("if (cableVisto !== cable) {"), "la comparación del cable previo no existe");
    afirmar(c.includes("setCableVisto(cable);"), "el cable previo no se actualiza dentro del ajuste (bucle infinito garantizado)");
    afirmar(c.includes("const [reinicioVisto, setReinicioVisto] = useState({ r: resultado, red: reduced });"), "el resultado ya visto no se guarda (no hay ajuste del reinicio)");
    afirmar(c.includes("reinicioVisto.r !== resultado || reinicioVisto.red !== reduced"), "la comparación del reinicio no existe");
    afirmar(c.includes("setPaso(resultado ? (reduced ? resultado.serie.length - 1 : 0) : 0);"), "el paso no se ajusta (día 0, o final con movimiento reducido)");
    // EL RELOJ PURO: el intervalo vive en un efecto SIN escrituras sincrónicas
    afirmar(c.includes("const iv = window.setInterval("), "el reloj de la proyección desapareció (la proyección se congela)");
    afirmar(c.includes("if (!resultado || reduced) return;\n    const fin = resultado.serie.length - 1;"), "el reloj ya no descansa cuando la casa no simula (o el movimiento es reducido)");
    afirmar(!c.includes("setPaso(0)") && !c.includes("setPaso(fin)"), "una escritura sincrónica del paso volvió a un cuerpo de efecto");
    // LAS PIEZAS INTACTAS: el sello honesto, el Monte Carlo y el Escape
    afirmar(c.includes("simulación · no predicción"), "el sello honesto de la casa desapareció");
    afirmar(c.includes("monteCarlo"), "el Monte Carlo del veredicto desapareció");
    afirmar(c.includes('e.key === "Escape"') && c.includes("onCerrar()"), "el Escape honesto desapareció");
    // EL CONSUMIDOR: la casa sigue montando la cámara con su cable
    const noticias = readFileSync(join(RAIZ, "src/components/vanguard/panels/news-panel.tsx"), "utf8");
    afirmar(noticias.includes("<CamaraConsecuencias cable={cableSim} onCerrar={() => setCableSim(null)} />"), "la casa dejó de montar la cámara de consecuencias");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v312.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LA CUARTA QUIRURGÍA viva: el home firma la ronda y el health respalda la deuda pagada (v312)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v312.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v312");
  });

  // ── v313.0 LA ESCUELA QUE RESPIRA: la primera expansión del autociclo — la
  // escuela del mando (estrategia-data, ficción declarada desde la v92) se
  // dobla y respira: 8 doctrinas en dos ciclos de contra-doctrina, 10
  // wargames/lecciones/leyendas, giro diario por envoltura (6 de 10, 4 de 10)
  // y EL FIN DEL CARTEL: TU sube a la tabla con sus victorias REALES de
  // conquista (conquestWins) y el puesto que le dan — la ley v216 dentro de
  // la propia casa. ──
  await verificar("LA ESCUELA QUE RESPIRA estática: currículo doblado, giro por envoltura y el ranking con TU real (v313)", () => {
    const d = readFileSync(join(RAIZ, "src/lib/estrategia-data.ts"), "utf8");
    // EL CURRÍCULO DOBLADO: censos exactos de las familias
    const doctrinas = (d.match(/nombre: "(?:Marea Corta|Muro Elástico|Mano de Sombras|Puño de Acero|Diente de Sierra|Coraza de Sal|Jinete Fantasma|Cámara Lenta)",/g) || []).length;
    afirmar(doctrinas === 8, `las doctrinas del currículo midieron ${doctrinas} ≠ 8`);
    const wargames = (d.match(/reglaEspecial: "/g) || []).length;
    afirmar(wargames === 10, `los wargames de la mesa midieron ${wargames} ≠ 10 (el campo reglaEspecial es exclusivo de la mesa)`);
    afirmar((d.match(/doctrinaFav: "/g) || []).length === 10, `las leyendas de la tabla midieron ${((d.match(/doctrinaFav: "/g) || []).length)} ≠ 10`);
    // LOS DOS CICLOS DE CONTRA-DOCTRINA: el segundo ciclo cierra la cola
    afirmar(d.includes('contra: "Coraza de Sal"') && d.includes('contra: "Diente de Sierra"'), "el segundo ciclo de contra-doctrina no cierra (Sierra↔Sal)");
    afirmar(d.includes('contra: "Cámara Lenta"') && d.includes('contra: "Jinete Fantasma"'), "el segundo ciclo de contra-doctrina no cierra (Jinete↔Cámara)");
    // LA ROTACIÓN POR ENVOLTURA: determinista, sin cortar el anillo
    afirmar(d.includes("function girar<T>"), "la rotación por envoltura desapareció (la escuela no respira)");
    afirmar(d.includes("girar(ESCENARIOS_BASE, 6") && d.includes("girar(LECCIONES_BASE, 4"), "el giro diario no reparte 6 de 10 wargames y 4 de 10 lecciones");
    // EL FIN DEL CARTEL: TU con victorias reales y puesto por mérito
    const panel = readFileSync(join(RAIZ, "src/components/vanguard/panels/estrategia-panel.tsx"), "utf8");
    afirmar(panel.includes('useGameStore((s) => s.conquestWins)'), "el ranking no lee las victorias REALES del operador (el cartel sigue vivo)");
    afirmar(panel.includes("eres: true"), "TU no lleva su sello de fila real");
    afirmar(!panel.includes("gana wargames y sube a la tabla"), "el texto del cartel antiguo sigue en la casa");
    afirmar(!panel.includes(">¿?</span>"), "el «¿?» decorativo sigue en la tabla (la forma JSX del cartel muerto)");
    afirmar(panel.includes("generalesOrdenados"), "la tabla ya no ordena por mérito");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v313.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LA ESCUELA QUE RESPIRA viva: el home firma la ronda y el health respalda la expansión (v313)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v313.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v313");
  });

  // ── v314.0 LA MESA VIVA: etapa 1 de la idea anotada — los wargames dejan
  // de ser fichas y se juegan por decisiones: motor determinista (cero
  // Math.random), la regla especial dispara narrada, botín honesto por la
  // tienda del juego solo en el handler final (cero escrituras de estado en
  // efectos) y diálogo portal con Escape honesto. ──
  await verificar("LA MESA VIVA estática: motor determinista sin azar ciego, botín honesto en el handler y mesa por portal (v314)", () => {
    const m = readFileSync(join(RAIZ, "src/lib/wargame-motor.ts"), "utf8");
    // EL MOTOR DETERMINISTA: cero Math.random — la ley de la casa (las
    // tiradas viven en mulberry32/fnvHash por escenario·turno·jugada)
    afirmar(!m.includes("Math.random()"), "el motor tira con Math.random() (partidas irreproducibles — la ley de determinismo muere)");
    afirmar(m.includes("mulberry32(fnvHash("), "las tiradas del motor no viven en el hash determinista de la casa");
    // EL ARSENAL Y LA REGLA: cinco jugadas y la regla especial dispara narrada
    const arsenal = (m.match(/id: "(?:asalto|flanqueo|artilleria|reagrupar|senuelo)"/g) || []).length;
    afirmar(arsenal === 5, `el arsenal del mando midió ${arsenal} ≠ 5`);
    afirmar(m.includes("reglaEspecial") && m.includes("dadoRegla"), "la regla especial de la mesa ya no dispara");
    // EL VEREDICTO Y EL BOTÍN: escalado por dificultad, consuelo honesto
    afirmar(m.includes("20 + esc.dificultad * 10") && m.includes("15 + esc.dificultad * 5"), "el botín de la mesa ya no escala con la dificultad");
    // LA MESA EN EL PANEL: portal, recompensa SOLO en el handler, efecto puro
    const panel = readFileSync(join(RAIZ, "src/components/vanguard/panels/estrategia-panel.tsx"), "utf8");
    afirmar(panel.includes("createPortal("), "la mesa dejó de vivir en portal (el ancla robada vuelve)");
    afirmar(!panel.includes("Math.random()"), "el panel de la mesa tira con Math.random()");
    const handlerMesa = panel.split("const jugar = (idx: number) => {")[1] || "";
    const cuerpoHandler = handlerMesa.split("};")[0] || "";
    afirmar(cuerpoHandler.includes("addCoins(") && cuerpoHandler.includes("addXp("), "el botín no se cobra en el handler de la jugada final (el progreso es falso)");
    afirmar(panel.includes('if (e.key === "Escape") onCerrar();'), "el Escape honesto de la mesa desapareció");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v314.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LA MESA VIVA viva: el home firma la ronda y el health respalda la mesa (v314)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v314.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v314");
  });

  // ── v315.0 LA MESA CON MEMORIA: etapa 2 de LA MESA VIVA — la mesa recuerda:
  // contadores PROPIOS (jamás cruzar conquestWins — la ley de contadores
  // honestos), historial revivible con las jugadas exactas y la dificultad
  // guardada (la v313 re-tira la dificultad cada día) y el revivir
  // determinista que re-juega el curso SIN cobrar botín (la mesa solo se
  // paga una vez). ──
  await verificar("LA MESA CON MEMORIA estática: contadores propios, historial revivible y replay sin botín (v315)", () => {
    const tienda = readFileSync(join(RAIZ, "src/lib/game-store.ts"), "utf8");
    // LA MEMORIA VIVE EN LA TIENDA CANÓNICA (persiste y viaja con exportProgress)
    afirmar(tienda.includes("wargameStats") && tienda.includes("wargameHistorial"), "la memoria de la mesa no vive en la tienda canónica");
    // LOS CONTADORES SON PROPIOS: la acción de la memoria jamás toca conquestWins
    const cuerpoMemoria = tienda.split("recordWargame: (partida) => {")[1]?.split("\n      },")[0] || "";
    afirmar(cuerpoMemoria.includes("wargameStats") && cuerpoMemoria.includes("racha"), "recordWargame no lleva los contadores propios de la mesa");
    afirmar(!cuerpoMemoria.includes("conquestWins"), "recordWargame cruza conquestWins (la ley de contadores honestos muere)");
    afirmar(cuerpoMemoria.includes("Math.max"), "la mejor racha/objetivo ya no se miden con máximo honesto");
    afirmar(cuerpoMemoria.includes(".slice(0, 8)"), "el historial de la mesa crece sin techo (la memoria se pudre)");
    // EL PANEL: memoria visible, tablero de mejores y la grabación en el handler
    const panel = readFileSync(join(RAIZ, "src/components/vanguard/panels/estrategia-panel.tsx"), "utf8");
    afirmar(panel.includes("memoria del operador"), "la memoria del operador no se pinta en la ficha");
    afirmar(panel.includes("revivir"), "el tablero de mejores partidas no tiene revivir");
    const handlerJugar = panel.split("const jugar = (idx: number) => {")[1]?.split("};")[0] || "";
    afirmar(handlerJugar.includes("recordWargame("), "la partida no se graba en el handler de la jugada final (efecto-escritor disfrazado)");
    // EL REPLAY: determinista y SIN botín
    const cola = panel.split("function ReplayMesa")[1] || "";
    afirmar(cola.includes("escenarioPorId"), "el replay no resuelve la mesa original (la dificultad guardada se perdió)");
    afirmar(cola.includes("resolverJugada") && cola.includes("estadoInicial"), "el replay no re-juega el curso con el motor determinista");
    afirmar(!cola.includes("addCoins(") && !cola.includes("addXp("), "el replay COBRA botín (la economía se inflora gratis)");
    afirmar(cola.includes('if (e.key === "Escape") onCerrar();'), "el Escape honesto del replay desapareció");
    // EL HELPER DE MESAS: catálogo resuelto por id fuera de la rotación diaria
    const data = readFileSync(join(RAIZ, "src/lib/estrategia-data.ts"), "utf8");
    afirmar(data.includes("export function escenarioPorId"), "el helper de mesas por id no existe (la memoria queda huérfana)");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v315.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LA MESA CON MEMORIA viva: el home firma la ronda y el health respalda la memoria (v315)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v315.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v315");
  });

  // ── v316.0 LAS INSIGNIAS DE LA ESCUELA: etapa 3 de LA MESA VIVA — la
  // memoria de la mesa alimenta al CHECKER CANÓNICO de logros: 4 señales
  // nuevas en el snapshot, bloque ESCUELA en el cableado con cruce honesto,
  // 6 insignias reales y el corona compuesto (cero 99/100 a mano). ──
  await verificar("LAS INSIGNIAS DE LA ESCUELA estática: señales de la mesa en el checker, bloque ESCUELA con cruce honesto y 6 insignias reales (v316)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    // LAS 4 SEÑALES de la memoria en el AchievementState
    const iniEstado = fuente.indexOf("export interface AchievementState");
    const estado = fuente.slice(iniEstado, fuente.indexOf("}", iniEstado));
    for (const campo of ["wargameJugadas", "wargameGanadas", "wargameMejorRacha", "wargameMejorObjetivo"]) {
      afirmar(estado.includes(`${campo}?`), `la señal ${campo} no llega al checker de logros`);
    }
    // EL BLOQUE ESCUELA en el cableado de la fuente (ley v267)
    const iniMapa = fuente.indexOf("export const CABLEADO_BLOQUES");
    const mapa = fuente.slice(iniMapa, fuente.indexOf("];", iniMapa) + 2);
    afirmar(mapa.includes('bloque: "ESCUELA"'), "el cableado no declara el bloque ESCUELA");
    const alimentoEscuela = (mapa.split('bloque: "ESCUELA"')[1] || "").split("]")[0] || "";
    const camposEscuela = [...alimentoEscuela.matchAll(/campo: "(wargame\w+)"/g)].map((m) => m[1]);
    afirmar(camposEscuela.length === 4, `el bloque ESCUELA alimenta ${camposEscuela.length} ≠ 4 señales`);
    // LAS 6 INSIGNIAS reales, una por umbral, con check y progress
    const insignias = fuente.split("\n").filter((l) => l.includes('category: "ESCUELA"') && l.includes("check:"));
    afirmar(insignias.length === 6, `la escuela midió ${insignias.length} ≠ 6 insignias`);
    for (const id of ["ACH-WGM-1", "ACH-WGM-WIN-1", "ACH-WGM-WIN-5", "ACH-WGM-STREAK-3", "ACH-WGM-OBJ-80", "ACH-WGM-OBJ-100"]) {
      afirmar(insignias.some((l) => l.includes(`id: "${id}"`)), `la insignia ${id} no existe`);
    }
    // CRUCE HONESTO: cada pareja (ESCUELA, campo) tiene insignia real que la lee
    for (const campo of camposEscuela) {
      afirmar(insignias.some((l) => l.includes(`s.${campo}`)), `la señal ${campo} no tiene insignia real que la lea`);
    }
    // EL CORONA COMPUESTO: cero 99 a mano (la vitrina no vuelve a mentir al crecer)
    afirmar(fuente.includes("ACHIEVEMENTS.length - 1"), "el logro corona sigue escribiendo el 99 a mano (envejece al crecer el catálogo)");
    // EL CHECKER ALIMENTADO POR LA MESA: recordWargame llama a checkAchievements
    const tienda = readFileSync(join(RAIZ, "src/lib/game-store.ts"), "utf8");
    const cuerpoMemoria = tienda.split("recordWargame: (partida) => {")[1]?.split("\n      },")[0] || "";
    afirmar(cuerpoMemoria.includes("checkAchievements()"), "la memoria de la mesa no alimenta al checker (las insignias no se cazan jugando)");
    const checker = tienda.split("checkAchievements: () => {")[1]?.split("const newly")[0] || "";
    afirmar(checker.includes("wargameStats.jugadas") && checker.includes("wargameStats.mejorObjetivo"), "el snapshot del checker no lleva las señales de la mesa");
    // LA VITRINA: el panel de logros sirve la escuela; la escuela muestra su caza compuesta de la fuente
    const panelLogros = readFileSync(join(RAIZ, "src/components/vanguard/panels/achievements-panel.tsx"), "utf8");
    afirmar(panelLogros.includes('"ESCUELA"'), "el panel de logros no sirve el bloque ESCUELA");
    const panelEscuela = readFileSync(join(RAIZ, "src/components/vanguard/panels/estrategia-panel.tsx"), "utf8");
    afirmar(panelEscuela.includes("insignias de la escuela") && panelEscuela.includes('a.category === "ESCUELA"'), "la escuela no muestra su caza compuesta de la fuente");
    // LA VITRINA PÚBLICA SIN «100» A MANO (el corona y la vitrina componen de la fuente)
    const objetivos = readFileSync(join(RAIZ, "src/app/objetivos/page.tsx"), "utf8");
    afirmar(objetivos.includes("LOS <span") && objetivos.includes("{ACHIEVEMENTS.length}</span> OBJETIVOS"), "el H1 de la vitrina vuelve a escribir el censo a mano");
    afirmar(!objetivos.includes('verdad:\n      "Los 100 se cazan aquí'), "el mapa de caza volvió a escribir el 100 a mano");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v316.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LAS INSIGNIAS DE LA ESCUELA viva: el home firma la ronda y el health respalda las insignias (v316)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v316.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v316");
  });

  // ── v317.0 LA MESA EN LA PORTADA: etapa 4 de LA MESA VIVA — la escuela
  // entra al FEED del home: la última partida es una tarjeta tipo "mesa" del
  // algoritmo PARA TI, y el REVIVIR desde la portada despacha el contrato
  // vg:mesa-revivir (llave fecha) que la escuela resuelve en SU fuente
  // canónica. Una sola tarjeta (no granja de replays), UNA fila 3D con la
  // misma acción, y el oyente en la escuela con el patrón legal v168. ──
  await verificar("LA MESA EN LA PORTADA estática: tipo mesa en el algoritmo, tarjeta desde la fuente canónica y el contrato de revivir (v317)", () => {
    const algoritmo = readFileSync(join(RAIZ, "src/lib/algoritmo-feed.ts"), "utf8");
    // EL TIPO: "mesa" existe y el algoritmo lo trata como contenido de productor
    afirmar(algoritmo.includes('"vivo" | "mesa"'), "el tipo mesa no existe en TipoFeed");
    const iniPuntuar = algoritmo.indexOf("export function puntuar");
    const cuerpoPuntuar = algoritmo.slice(iniPuntuar, algoritmo.indexOf("etiquetaTipo", iniPuntuar));
    afirmar(cuerpoPuntuar.includes('t.tipo === "pulso" || t.tipo === "mesa" ? 1.2'), "la mesa no tiene base de productor (el algoritmo no la alimenta)");
    afirmar(cuerpoPuntuar.includes('porQue = "TU ÚLTIMA PARTIDA EN LA ESCUELA"'), "la razón honesta de la mesa no existe (el algoritmo es una caja negra)");
    const iniEtiqueta = algoritmo.indexOf("function etiquetaTipo");
    afirmar(algoritmo.slice(iniEtiqueta, algoritmo.indexOf("}", algoritmo.indexOf('"mesa"', iniEtiqueta))).includes('case "mesa": return "LA MESA";'), "la etiqueta LA MESA no está en el algoritmo");
    // LA TARJETA en el panel foryou: UNA sola (la última), desde la tienda
    const foryou = readFileSync(join(RAIZ, "src/components/vanguard/panels/foryou-panel.tsx"), "utf8");
    afirmar(foryou.includes("const wargameHistorial = useGameStore((s) => s.wargameHistorial);"), "el feed no lee la fuente canónica (la tarjeta sería un cartel)");
    const iniTarjetas = foryou.indexOf("const mesaTarjetas = useMemo");
    const cuerpoTarjetas = foryou.slice(iniTarjetas, foryou.indexOf("}, [wargameHistorial]);", iniTarjetas));
    afirmar(cuerpoTarjetas.includes("wargameHistorial[0]") && !cuerpoTarjetas.includes("wargameHistorial.slice"), "la tarjeta no es LA ÚLTIMA (el feed sería una granja de replays)");
    afirmar(cuerpoTarjetas.includes('autor: "LA ESCUELA DEL MANDO"'), "la tarjeta no firma la escuela");
    afirmar(cuerpoTarjetas.includes("tipo: \"mesa\""), "la tarjeta no usa el tipo mesa");
    afirmar(cuerpoTarjetas.includes("id: `mesa-${p.fecha}`"), "la tarjeta no nace fresca por partida (id por fecha)");
    afirmar(foryou.includes("[...ugc, ...mesaTarjetas, ...memes, ...tvTarjetas, ...pulsos]"), "la mesa no entra a la cola del algoritmo");
    // EL RENDER: veredicto con barras, botín, racha viva y el botón de revivir
    afirmar(foryou.includes('if (t.tipo === "mesa") {'), "el feed no sabe pintar la mesa");
    const iniRender = foryou.indexOf('if (t.tipo === "mesa") {');
    const cuerpoRender = foryou.slice(iniRender, foryou.indexOf("// PULSO — el Productor de Vanguard", iniRender));
    for (const pieza of ["objetivoAzul", "objetivoRojo", "victoria azul", "botinCoins", "botinXp", "wargameStats.racha", "mejorObjetivo", "La escuela del mando", "Revivir la mesa", "replay determinista"]) {
      afirmar(cuerpoRender.includes(pieza), `el render de la mesa no dice ${pieza}`);
    }
    // EL CONTRATO: revivirDesdeElFeed navega y despacha vg:mesa-revivir con la llave
    afirmar(foryou.includes('new CustomEvent("vg:mesa-revivir", { detail: { fecha } })'), "el contrato vg:mesa-revivir no existe en el feed");
    const iniRevivir = foryou.indexOf("const revivirDesdeElFeed = useCallback");
    const cuerpoRevivir = foryou.slice(iniRevivir, foryou.indexOf("}, [navegar]);", iniRevivir));
    afirmar(cuerpoRevivir.includes('navegar("estrategia")'), "el revivir no lleva a la escuela");
    afirmar((cuerpoRevivir.match(/disparar\(\)|setTimeout\(disparar/g) ?? []).length >= 3, "el revivir no salva el montaje perezoso (reintentos)");
    // LA PARIDAD 3D: la fila LA MESA con la misma acción
    afirmar(foryou.includes("a: \"revivir la mesa\""), "la fila LA MESA no existe en la paridad 3D");
    afirmar(foryou.includes('d.accion === "revivir la mesa"'), "la acción 3D no despacha el contrato");
    // EL OYENTE en la escuela: busca por fecha en SU fuente y abre el replay
    const escuela = readFileSync(join(RAIZ, "src/components/vanguard/panels/estrategia-panel.tsx"), "utf8");
    afirmar(escuela.includes('window.addEventListener("vg:mesa-revivir", onRevivir)'), "la escuela no escucha el contrato de la portada");
    const iniOyente = escuela.indexOf("vg:mesa-revivir");
    const cuerpoOyente = escuela.slice(iniOyente, escuela.indexOf("}, [historial]);", iniOyente));
    afirmar(cuerpoOyente.includes('historial.find((x) => x.fecha === d.fecha)'), "la escuela no resuelve la partida en SU fuente (tomaría fe del evento)");
    afirmar(cuerpoOyente.includes("if (p) setReplay(p);"), "el oyente no abre el replay determinista");
    // CERO DEUDA NUEVA: el oyente es evento→setState en callback (patrón v168),
    // no escritura en montaje — el censo canónico lo verifica en el QA.
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v317.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LA MESA EN LA PORTADA viva: el home firma la ronda y el health respalda la portada (v317)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v317.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v317");
  });

  // ── v318.0 EL INFORME QUE RESPIRA: la segunda expansión del autociclo — el
  // instituto de evaluación de campaña (evaluacion-data, espejo declarado
  // desde la v89) se dobla y respira: 16 leads/cuerpos, teatros doblados,
  // SEXTO teatro (Ártico y el Gran Norte) y EL GIRO DEL DÍA: 3 de 6 teatros
  // en profundidad por el anillo de la escuela (girar exportada — un solo
  // patrón del ecosistema), que avanza UNA muesca por informe: el plato
  // entero jamás se repite dos días seguidos. ──
  await verificar("EL INFORME QUE RESPIRA estática: instituto doblado, sexto teatro y el giro del anillo (v318)", () => {
    const d = readFileSync(join(RAIZ, "src/lib/evaluacion-data.ts"), "utf8");
    // EL DOBLEZ: censos exactos de las familias del instituto
    const leads = (d.match(/const LEADS = \[[\s\S]*?\];/) || [""])[0];
    // censo honesto: cada lead es una línea que empieza con comilla
    const lineasLeads = leads.split("\n").filter((l) => l.trim().startsWith('"'));
    afirmar(lineasLeads.length === 16, `el pool de leads midió ${lineasLeads.length} ≠ 16`);
    const cuerpos = (d.match(/const CUERPOS = \[[\s\S]*?\];/) || [""])[0];
    const lineasCuerpos = cuerpos.split("\n").filter((l) => l.trim().startsWith('"'));
    afirmar(lineasCuerpos.length === 16, `el pool de cuerpos midió ${lineasCuerpos.length} ≠ 16`);
    // EL SEXTO TEATRO: Ártico y el Gran Norte existe y aporta sus líneas
    afirmar(d.includes("Ártico y el Gran Norte"), "el sexto teatro del informe no existe (el cuarto de mapa frío sigue fuera)");
    const artico = (d.match(/const LINEAS_ARTICO = \[[\s\S]*?\];/) || [""])[0];
    const lineasArtico = artico.split("\n").filter((l) => l.trim().startsWith('"'));
    afirmar(lineasArtico.length === 6, `las líneas del ártico midieron ${lineasArtico.length} ≠ 6`);
    // EL GIRO DEL DÍA: anillo de la escuela (girar importada, no copiada)
    afirmar(d.includes('import { girar } from "./estrategia-data";'), "el giro no usa la rotación por envoltura de la escuela (el patrón se copió en vez de compartirse)");
    afirmar(d.includes("const giro = numero % TEATROS_BASE.length"), "el anillo del giro no avanza una muesca por informe (el plato puede repetirse dos días seguidos)");
    afirmar(d.includes("profundidad: enFoco"), "el giro del día ya no marca los teatros en profundidad");
    // LA FRONTERA HONESTA: el giro se declara en el propio informe
    afirmar(d.includes("notaGiro"), "la ley del giro no se declara en el informe (el lector no sabe qué es foco y qué no)");
    // EL PANEL: foco visible, en corto honesto y paridad 3D con el giro
    const panel = readFileSync(join(RAIZ, "src/components/vanguard/panels/evaluacion-panel.tsx"), "utf8");
    afirmar(panel.includes("Foco del día:"), "el foco del día no se declara en el masthead del panel");
    afirmar(panel.includes("En corto · el resto del mundo"), "los teatros fuera del giro no tienen su bloque en corto");
    afirmar(panel.includes('ev.teatros.filter((t) => t.profundidad)'), "la paridad 3D no sigue la ley del giro (viajan los teatros equivocados al volumen)");
    afirmar(!panel.includes("ev.teatros.slice(0, 4)"), "el slice antiguo de teatros sigue en la paridad 3D (la 3D ignora el giro)");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v318.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("EL INFORME QUE RESPIRA viva: el home firma la ronda y el health respalda el instituto (v318)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v318.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v318");
  });

  // ── v319.0 LA COLECCIÓN QUE CRECE: tercera expansión del autociclo — el
  // álbum de fichas (fichas-guerra-data, v176) se dobla con las DOS guerras
  // mayores que el feed ignoraba (Congo/M23, Myanmar) — cada carta con
  // llave REAL del mapa conflictTag (sincronía pinneada: una guerra del
  // feed = una carta), y la gloria crece con el álbum: 13 títulos con
  // notas honestas y EL COLECCIONISTA pidiendo las 11 fichas completas. ──
  await verificar("LA COLECCIÓN QUE CRECE estática: álbum doblado con llave real, sincronía feed-carta y la gloria a 13 (v319)", () => {
    const d = readFileSync(join(RAIZ, "src/lib/fichas-guerra-data.ts"), "utf8");
    const api = readFileSync(join(RAIZ, "src/app/api/news/route.ts"), "utf8");
    const gloria = readFileSync(join(RAIZ, "src/lib/gloria.ts"), "utf8");
    const panel = readFileSync(join(RAIZ, "src/components/vanguard/panels/fichas-panel.tsx"), "utf8");
    // EL DOBLEZ: censos exactos — 11 cartas con serie VG-…
    const series = (d.match(/serie: "VG-\d+"/g) || []).length;
    afirmar(series === 11, `el álbum midió ${series} ≠ 11 cartas`);
    for (const k of ["ukraine", "gaza", "lebanon", "sudan", "redsea", "korea", "taiwan", "hormuz", "sahel", "congo", "myanmar"]) {
      afirmar(d.includes(`key: "${k}"`), `la carta ${k} no está en el álbum`);
    }
    // LA SINCRONÍA — una guerra del feed = una carta de la colección:
    // las 11 llaves del mapa conflictTag de la API son EXACTAMENTE las 11 del catálogo
    const bloqueMapa = api.split("const map: Record<string, string[]> = {")[1] || "";
    const llavesFeed = [...bloqueMapa.split("\n").filter((l) => /^\s*\w+: \[/.test(l)).map((l) => l.split(":")[0].trim())];
    afirmar(llavesFeed.length === 11, `el mapa del feed midió ${llavesFeed.length} ≠ 11 llaves`);
    for (const k of llavesFeed) {
      afirmar(d.includes(`key: "${k}"`), `la llave del feed ${k} no tiene carta en el álbum (la sincronía murió)`);
    }
    afirmar(api.includes("congo: [") && api.includes("myanmar: ["), "las dos llaves nuevas no están en el mapa del escáner");
    // LOS HECHOS HISTÓRICOS: las dos cartas nuevas con inicio citable
    afirmar(d.includes('inicioIso: "2022-03-28"') && d.includes("M23"), "la carta del Kivu no lleva su origen histórico");
    afirmar(d.includes('inicioIso: "2021-02-01"') && d.includes("TATMADAW"), "la carta de Myanmar no lleva su golpe citable");
    // LA GLORIA CRECE: 13 títulos, notas honestas y la cima del álbum completo
    const titulos = (gloria.match(/id: "/g) || []).length;
    afirmar(titulos === 13, `los títulos de la gloria midieron ${titulos} ≠ 13`);
    afirmar(gloria.includes('id: "coleccionista"') && gloria.includes("Completa las 11 fichas del álbum"), "EL COLECCIONISTA no pide el álbum completo");
    afirmar(gloria.includes('nota: "Descubre 9 fichas"'), "la nota del MAESTRO sigue mintiendo con el álbum de 11");
    afirmar(panel.includes("/13") && panel.includes("LOS 13 TÍTULOS SON TUYOS"), "el panel de la colección no canta los 13 títulos");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v319.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LA COLECCIÓN QUE CRECE viva: el home firma la ronda y el health respalda el álbum (v319)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v319.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v319");
  });

  // ── v320.0 LA RED COMPLETA: cuarta expansión del autociclo — la red de
  // canales OSINT (canales-data, v89) paga los 4 que la promesa de la v120
  // dejó debiendo (16 → 20, «la red llega a 20» queda VERDADERO) y la red
  // respira con el anillo de la escuela: EL DESTACADO DEL DÍA rota un
  // canal por fecha con la MISMA girar() exportada — el tercer consumidor
  // del patrón del ecosistema (mando, instituto, red). ──
  await verificar("LA RED COMPLETA estática: 20 canales con identidad única y el destacado del anillo (v320)", () => {
    const d = readFileSync(join(RAIZ, "src/lib/canales-data.ts"), "utf8");
    const panel = readFileSync(join(RAIZ, "src/components/vanguard/panels/canales-panel.tsx"), "utf8");
    // LA RED COMPLETA: censo exacto de la promesa v120
    const ids = [...d.matchAll(/id: "([a-z0-9]+)", nombre: /g)].map((m) => m[1]);
    afirmar(ids.length === 20, `la red midió ${ids.length} ≠ 20 canales (la promesa de la v120 sigue debiendo)`);
    afirmar(new Set(ids).size === 20, "hay ids duplicados en la red (la identidad de la casa muere)");
    for (const k of ["columna", "faromar", "geofono", "tiniebla"]) {
      afirmar(ids.includes(k), `el canal nuevo ${k} no está en la red`);
    }
    // LA IDENTIDAD: colores y handles únicos — dos canales no pueden vestir igual
    const colores = [...d.matchAll(/color: "(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1]);
    afirmar(new Set(colores).size === colores.length, "hay colores repetidos en la red (dos canales con la misma voz visual)");
    const handles = [...d.matchAll(/handle: "(@[a-z0-9_.]+)"/g)].map((m) => m[1]);
    afirmar(new Set(handles).size === handles.length, "hay handles repetidos en la red");
    // EL DESTACADO DEL DÍA: el anillo de la escuela sirve a la red (cero copias)
    afirmar(d.includes('import { girar } from "./estrategia-data";'), "el destacado no usa el anillo de la escuela (el patrón se copió en vez de compartirse)");
    afirmar(d.includes("export function canalDestacadoDeHoy"), "el destacado del día no existe (la red no respira)");
    afirmar(d.includes("dia % CANALES.length"), "el anillo del destacado no avanza una muesca por fecha");
    // EL PANEL: la rotación se declara al lector y el destacado es tocable
    afirmar(panel.includes("Destacado del día ·"), "el panel no declara el destacado del día");
    afirmar(panel.includes("dos días seguidos jamás repiten el destacado"), "la ley del anillo no se declara al lector");
    afirmar(panel.includes("canalDestacadoDeHoy"), "el panel no consume el destacado (estaba muerto al llegar)");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v320.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LA RED COMPLETA viva: el home firma la ronda y el health respalda la escucha (v320)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v320.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v320");
  });

  // ── v321.0 LA PANTALLA EN EL ANILLO: quinta expansión del autociclo — el
  // canal brief (canalbrief-data, v92 — la última pieza de la cola expansiva
  // documentada) se dobla (4 series, 12 temas, 16 voces) y respira con el
  // anillo de la escuela: EL EPISODIO DEL DÍA — girar() compartida sirve a
  // su CUARTO consumidor (mando, instituto, red, canal). ──
  await verificar("LA PANTALLA EN EL ANILLO estática: canal doblado, anillo compartido sin copias y la ley declarada (v321)", () => {
    const d = readFileSync(join(RAIZ, "src/lib/canalbrief-data.ts"), "utf8");
    const panel = readFileSync(join(RAIZ, "src/components/vanguard/panels/canalbrief-panel.tsx"), "utf8");
    // EL DOBLEZ: censos exactos de las familias del canal
    const series = (d.match(/canal: "/g) || []).length;
    afirmar(series === 4, `las series del canal midieron ${series} ≠ 4 (Ojo del Mundo y Sala de Máquinas no entraron)`);
    for (const s of ["Ojo del Mundo", "Sala de Máquinas"]) {
      afirmar(d.includes(`canal: "${s}"`), `la serie nueva ${s} no está en el canal`);
    }
    const temas = (d.match(/^  \{ t: "/gm) || []).length;
    afirmar(temas === 12, `los temas del canal midieron ${temas} ≠ 12 (las seis clases nuevas faltan)`);
    for (const frag of ["el ojo barato", "el seguro que decide", "flotas fantasma", "el mapa vota antes que el general"]) {
      afirmar(d.includes(frag), `el tema nuevo «${frag}» no está en la parrilla`);
    }
    const voces = (d.split("const USUARIOS = [")[1] || "").split("]")[0].split(",").filter((x) => x.trim().length > 0).length;
    afirmar(voces === 16, `las voces del cinturón midieron ${voces} ≠ 16`);
    // EL ANILLO LLEGA AL CANAL: girar compartida, cero copias del patrón
    afirmar(d.includes('import { girar, diaDelAnillo } from "./estrategia-data";'), "el episodio del día no usa el anillo de la escuela (el patrón se copió en vez de compartirse) // v324: el import trae también el reloj central");
    afirmar(d.includes("export function episodioDestacadoDeHoy"), "el episodio del día no existe (el canal no respira)");
    afirmar(d.includes("girar(eps, 1, diaDelAnillo() % eps.length)"), "el anillo del canal no avanza una muesca por fecha");
    afirmar(d.includes("destacado: boolean"), "la ficha del episodio no declara su destacado");
    afirmar(d.includes("serie: string"), "la ficha del episodio no sabe quién habla");
    // EL PANEL: la rotación se declara al lector y el destacado es tocable
    afirmar(panel.includes("Episodio del día ·"), "el panel no declara el episodio del día");
    afirmar(panel.includes("dos días seguidos jamás repiten el destacado"), "la ley del anillo no se declara al lector");
    afirmar(panel.includes("episodioDestacadoDeHoy"), "el panel no consume el anillo (el destacado estaba muerto al llegar)");
    afirmar(panel.includes("{sel.serie.toUpperCase()}"), "la pantalla no sabe quién habla (la serie no viaja al reproductor)");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v321.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LA PANTALLA EN EL ANILLO viva: el home firma la ronda y el health respalda la pantalla (v321)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v321.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v321");
  });

  // ── v322.0 EL ADVERSARIO CON NOMBRE: sexta expansión del autociclo — el
  // ciber (v90, el mapa que no hace ruido) se dobla y respira con el anillo
  // de la escuela: 24 naciones (el hemisferio sur, el Ártico y los
  // estrechos), 10 tipos, 14 sectores y doce CAMPAÑAS con nombre — cada
  // arco vivo nace atribuido (estimación declarada) y el anillo de girar()
  // sirve a su QUINTO consumidor: la campaña del día. ──
  await verificar("EL ADVERSARIO CON NOMBRE estática: ciber doblado, doce campañas con nombre y el anillo sin copias (v322)", () => {
    const d = readFileSync(join(RAIZ, "src/lib/ciber-data.ts"), "utf8");
    const panel = readFileSync(join(RAIZ, "src/components/vanguard/panels/ciber-panel.tsx"), "utf8");
    // EL DOBLEZ: censos exactos de las familias del mapa (bandera = nación,
    // color tras nombre = tipo, emoji = sector — cada familia con su firma)
    const naciones = (d.match(/bandera: "/g) || []).length;
    afirmar(naciones === 24, `las naciones del mapa midieron ${naciones} ≠ 24 (el hemisferio sur no entró)`);
    for (const frag of ["Confederación del Plata", "Estación Ártica Aurora", "Liga Hanseática", "Sultanato de Malaca", "Archipiélago del Caribe", "Península Dorada"]) {
      afirmar(d.includes(frag), `la nación nueva ${frag} no está en el mapa`);
    }
    const tipos = (d.match(/\{ id: "[a-z]+", nombre: "[^"]+", color: "#/g) || []).length;
    afirmar(tipos === 10, `los tipos de ataque midieron ${tipos} ≠ 10 (las cuatro firmas nuevas faltan)`);
    for (const t of ["Cadena de suministro", "Secuestro DNS", "Desvío BGP", "Wiper"]) {
      afirmar(d.includes(`"${t}"`), `el tipo nuevo ${t} no está en el catálogo`);
    }
    const sectores = (d.match(/emoji: "/g) || []).length;
    afirmar(sectores === 14, `los sectores midieron ${sectores} ≠ 14 (los frentes civiles faltan)`);
    // EL ADVERSARIO CON NOMBRE: doce campañas, identidad única (lección v320)
    const campanas = (d.match(/\{ id: "(manada|papel|guadana|marea|gato|cincel|escalera|sonata|polvo|harmattan|cable|perla)"/g) || []).length;
    afirmar(campanas === 12, `las campañas midieron ${campanas} ≠ 12 (el adversario sigue anónimo)`);
    for (const c of ["MANADA DE INVIERNO", "PAPEL DE ARROZ", "GUADAÑA DE SAL", "PERLA NEGRA", "CABLE INVERSO", "HARMATTAN"]) {
      afirmar(d.includes(c), `la campaña ${c} no está en el catálogo`);
    }
    const coloresCampana = [...d.matchAll(/origen: "[a-z]+", color: "(#[0-9A-F]+)"/g)].map((m) => m[1]);
    afirmar(coloresCampana.length === 12 && new Set(coloresCampana).size === 12, `los colores de campaña no son doce únicos (${new Set(coloresCampana).size}/${coloresCampana.length})`);
    // EL ANILLO LLEGA AL CIBER: girar compartida, cero copias del patrón
    afirmar(d.includes('import { girar, diaDelAnillo } from "./estrategia-data";'), "el adversario del día no usa el anillo de la escuela (el patrón se copió en vez de compartirse) // v324: el import trae también el reloj central");
    afirmar(d.includes("export function campanaDelDia"), "la campaña del día no existe (el ciber no respira)");
    afirmar(d.includes("girar(CAMPANAS, 1, diaDelAnillo() % CAMPANAS.length)"), "el anillo del ciber no avanza una muesca por fecha");
    afirmar(d.includes("campanaId: string"), "el arco no nace atribuido (el quién no viaja en el dato)");
    afirmar(d.includes("function atribuirCampana"), "la atribución no es determinista");
    // EL PANEL: la campaña se declara al lector y la atribución se confiesa estimación
    afirmar(panel.includes("campaña del día"), "el panel no declara la campaña del día");
    afirmar(panel.includes("dos días seguidos jamás repiten la campaña del día"), "la ley del anillo no se declara al lector");
    afirmar(panel.includes("campanaDelDia"), "el panel no consume el anillo (la campaña estaba muerta al llegar)");
    afirmar(panel.includes('aria-label="Campaña del día"'), "la franja del adversario no tiene su señal");
    afirmar(panel.includes("atribución estimada"), "la atribución no se confiesa estimación (hechos ≠ estimaciones)");
    afirmar(panel.includes("en sombra"), "el contador de la campaña no es honesto cuando no hay arcos suyos");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v322.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("EL ADVERSARIO CON NOMBRE vivo: el home firma la ronda y el health respalda el mapa (v322)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v322.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v322");
  });

  // ── v323.0 LA CIRUGÍA DEL TRIBUNAL: primera cirugía de la cola de deuda —
  // el expediente del Juicio Histórico deja de ser un efecto-escritor
  // (useState + useEffect(setSave(loadSave()))) y pasa a ser TIENDA EXTERNA
  // con useSyncExternalStore (el patrón de la casa): el censo baja 9+4 → 8+4. ──
  await verificar("LA CIRUGÍA DEL TRIBUNAL estática: tienda externa sin efecto-escritor (v323)", () => {
    const t = readFileSync(join(RAIZ, "src/components/vanguard/panels/tribunal-panel.tsx"), "utf8");
    // LA CIRUGÍA: la tienda del aparato, no estado nacido en un efecto
    afirmar(t.includes("useSyncExternalStore(suscribirTribunal, rawTribunal, rawTribunalServidor)"), "el expediente no es tienda externa (el efecto-escritor sigue vivo)");
    afirmar(t.includes("const EVENTO_TRIBUNAL = \"vg-tribunal-v13\""), "sin el evento propio que notifica el voto");
    afirmar(t.includes("function guardarVoto(ns: Save)"), "sin la única puerta de escritura");
    afirmar(t.includes("window.dispatchEvent(new Event(EVENTO_TRIBUNAL))"), "el voto no despierta a la tienda");
    afirmar(t.includes("const rawTribunalServidor = () => \"\""), "sin getServerSnapshot (hidratación a ciegas)");
    afirmar(!/useEffect\(\(\) => \{ setSave\(/.test(t), "¡el efecto-escritor del expediente sigue en el cuerpo!");
    afirmar(!t.includes("setSave(ns)"), "¡el voto todavía escribe por setState!");
    afirmar(t.includes("guardarVoto(ns); // v323"), "el voto no pasó por la puerta nueva");
    // el cobro no se tocó (ley v302: escribir en handler, jamás en efecto)
    afirmar(t.includes('addCoins(10, "TRIBUNAL: veredicto emitido")'), "el cobro del veredicto desapareció");
    afirmar(t.includes("addXp(10);"), "la xp del veredicto desapareció");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v323.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("LA CIRUGÍA DEL TRIBUNAL vivo: el home firma la ronda y el health respalda la cirugía (v323)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v323.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v323");
  });

  // ── v324.0 EL ATLAS MIRA AL SUR: el censo por firma cantó Oceanía 2 y
  // África 10 — el atlas dobla la mirada al sur (66 → 84 países, 69 → 78
  // figuras, 15 → 24 rutas), el anillo de la escuela llega al atlas como
  // SEXTO consumidor (paisDelDia + figuraDelDia) con el reloj CENTRALIZADO
  // en estrategia-data (mueren las copias de canalbrief v321 y ciber v322),
  // y los RÉCORDS DEL PLANETA se computan con reduce — nada duro. ──
  await verificar("EL ATLAS MIRA AL SUR estático: censos por firma, sexto anillo y récords computados (v324)", () => {
    const a = readFileSync(join(RAIZ, "src/lib/atlas-data.ts"), "utf8");
    // CENSOS POR FIRMA (ley v322): el catálogo que se dobla lleva su censo
    // el censo por REGIÓN del sur (v324): África 17, Oceanía 4, América 16, Asia 23, Europa 24
    // (el patrón ancla la entrada con «, poblacion» para no comer la línea de la interfaz)
    afirmar((a.match(/region: "(?:América|Europa|Asia|África|Oceanía)", poblacion/g) || []).length === 84, `el atlas no tiene 84 países (${(a.match(/region: "(?:América|Europa|Asia|África|Oceanía)", poblacion/g) || []).length})`);
    afirmar((a.match(/categoria: "/g) || []).length === 78, `el atlas no tiene 78 figuras (${(a.match(/categoria: "/g) || []).length})`);
    afirmar((a.match(/etiqueta: "/g) || []).length === 24, `el atlas no tiene 24 rutas de poder (${(a.match(/etiqueta: "/g) || []).length})`);
    afirmar((a.match(/region: "África", poblacion/g) || []).length === 17, "el sur de África no entró (deben ser 17)");
    afirmar((a.match(/region: "Oceanía", poblacion/g) || []).length === 4, "el Pacífico no entró (deben ser 4)");
    afirmar((a.match(/region: "América", poblacion/g) || []).length === 16, "Centroamérica y el Caribe no entraron (deben ser 16)");
    // los nuevos por nombre: Ghana, Bolivia, Papúa, Fiyi, Uzbekistán, Myanmar, Serbia
    for (const p of ["Ghana", "Bolivia", "Papúa Nueva Guinea", "Fiyi", "Uzbekistán", "Myanmar", "Sri Lanka", "Serbia", "Croacia", "Guatemala", "Panamá", "República Dominicana", "Costa de Marfil", "Senegal", "Camerún", "Angola", "Tanzania", "Mozambique"])
      afirmar(a.includes(`nombre: "${p}"`), `la nación nueva ${p} no está en el catálogo`);
    // las figuras nuevas con el sur y los organismos en el centro
    for (const f of ["faye", "samia", "traore", "arevalo", "okonjo", "urquiza", "charpentier", "adichie", "bonmati"])
      afirmar(a.includes(`id: "${f}"`), `la figura nueva ${f} no está en la mesa`);
    // EL SEXTO ANILLO: girar + diaDelAnillo importados — UN solo reloj, CERO copias
    afirmar(a.includes('import { girar, diaDelAnillo } from "./estrategia-data";'), "el atlas copia el reloj del anillo en vez de importarlo");
    afirmar(a.includes("export function paisDelDia"), "el país del día no existe (el atlas no respira)");
    afirmar(a.includes("girar(PAISES_ATLAS, 1, diaDelAnillo() % PAISES_ATLAS.length)"), "el anillo del atlas no avanza una muesca por fecha");
    afirmar(a.includes("export function figuraDelDia"), "la figura del día no existe");
    afirmar(a.includes("girar(PERSONAS_ATLAS, 1, diaDelAnillo() % PERSONAS_ATLAS.length)"), "el anillo de las figuras no avanza");
    afirmar(a.includes("export function recordsDelPlaneta") && a.includes(".reduce("), "los récords del planeta no se computan del catálogo");
    // el reloj ÚNICO: las copias de v321/v322 están muertas
    const estr = readFileSync(join(RAIZ, "src/lib/estrategia-data.ts"), "utf8");
    const ciber = readFileSync(join(RAIZ, "src/lib/ciber-data.ts"), "utf8");
    const canal = readFileSync(join(RAIZ, "src/lib/canalbrief-data.ts"), "utf8");
    afirmar(estr.includes("export function diaDelAnillo"), "el reloj central del anillo no existe en estrategia-data");
    afirmar(!ciber.includes("function diaDelAnillo"), "la copia de ciber-data sigue viva (dos relojes = dos verdades)");
    afirmar(!canal.includes("function diaDelAnillo"), "la copia de canalbrief-data sigue viva (dos relojes = dos verdades)");
    // EL PANEL DICE LA VERDAD: franja, figura invitada, ley y récords
    const panel = readFileSync(join(RAIZ, "src/components/vanguard/panels/atlas-panel.tsx"), "utf8");
    afirmar(panel.includes('aria-label="País del día"'), "el panel no tiene la franja del país del día");
    afirmar(panel.includes("figura del día:"), "la figura invitada no viaja en la franja");
    afirmar(panel.includes("horaEn(paisDia.zona, now)"), "la franja no usa el reloj vivo de la sala");
    afirmar(panel.includes("el anillo del atlas avanza un país y una figura por día"), "la ley del anillo no está en pantalla");
    afirmar(panel.includes('aria-label="Récords del planeta"') && panel.includes("records.map((rec)"), "los récords del planeta no llegan al panel");
    // la versión camina con la casa
    const version = readFileSync(join(RAIZ, "src/lib/version.ts"), "utf8");
    afirmar(version.includes('APP_VERSION = "v324.0"'), "la fuente única de versión no es v324.0");
    afirmar(version.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no está en la fuente única");
  });

  await verificar("EL ATLAS MIRA AL SUR vivo: el home firma la ronda y el health respalda al sur (v324)", async () => {
    const r = await pedir("/");
    afirmar(r.status === 200, `/ no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS MIRA AL SUR"), "el nombre de la ronda no viaja en el home");
    afirmar(r.texto.includes("v324.0"), "la v324.0 no viaja en el home");
    const salud = await pedir("/api/health");
    afirmar(salud.json?.ok === true && String(salud.json?.version).startsWith("v324"), "el health no firma v324");
  });

  // ── v295.0 LA VERDAD CRUDA: dark-data (v24, documentada) gana su sala server (/verdad-cruda) ──
  // El almacén menor clasificado: diez fuentes caídas en negativo y la
  // veta documentada (fuentes públicas citadas) que sube.
  await verificar("LA VERDAD CRUDA estática: la fuente documentada intacta y todo derivado (v295)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/dark-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/verdad-cruda/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    // la fuente intacta: los cinco bloques con sus censos reales
    afirmar(fuente.includes("export const WAR_ABUSES"), "la fuente de abusos no existe");
    const iniA = fuente.indexOf("export const WAR_ABUSES");
    const finA = fuente.indexOf("export interface IncidentCamera");
    const bloqueA = fuente.slice(iniA, finA);
    const nAb = (bloqueA.match(/id: "ab-/g) ?? []).length;
    afirmar(nAb === 12, `el censo de abusos midió mal (${nAb}/12)`);
    for (const g of ["UCRANIA", "GAZA", "SUDÁN", "MYANMAR", "GLOBAL"]) {
      afirmar(bloqueA.includes(`war: "${g}"`), `falta la guerra ${g} en la fuente`);
    }
    const iniI = fuente.indexOf("export const INCIDENTS");
    const finI = fuente.indexOf("export interface FallenJournalist");
    const nInc = (fuente.slice(iniI, finI).match(/id: "inc-/g) ?? []).length;
    afirmar(nInc === 14, `el censo de incidentes midió mal (${nInc}/14)`);
    const iniM = fuente.indexOf("export const MEMORIAL_FALLEN");
    const finM = fuente.indexOf("export const MEMORIAL_WARS");
    const nMem = (fuente.slice(iniM, finM).match(/id: "mj-/g) ?? []).length;
    afirmar(nMem === 10, `el censo del memorial midió mal (${nMem}/10)`);
    const iniD = fuente.indexOf("export const DRONE_MODELS");
    const finD = fuente.indexOf("export const DRONE_CASUALTY_FACTS");
    const nDr = (fuente.slice(iniD, finD).match(/id: "/g) ?? []).length;
    afirmar(nDr === 4, `el censo de drones midió mal (${nDr}/4)`);
    const iniC = fuente.indexOf("export const DRONE_CASUALTY_FACTS");
    const finC = fuente.indexOf("export interface RecruitSide");
    const nCi = (fuente.slice(iniC, finC).match(/stat: "/g) ?? []).length;
    afirmar(nCi === 4, `el censo de cifras midió mal (${nCi}/4)`);
    // la fuente completa: todas las entradas documentadas (la cabeza de la
    // fuente lo declara: «todas las entradas citan fuentes públicas»)
    afirmar((bloqueA.match(/verified: true/g) ?? []).length === 12, "los abusos no están todos verificados");
    afirmar((bloqueA.match(/sources: \[/g) ?? []).length === 12, "hay abusos sin fuente citada");
    afirmar((fuente.slice(iniI, finI).match(/sources: \[/g) ?? []).length === 14, "hay incidentes sin fuente citada");
    afirmar((fuente.slice(iniM, finM).match(/documentedBy: "/g) ?? []).length === 10, "hay caídos sin quién los documente");
    // la sala: los imports, la línea compuesta, los chips, las fuentes verbatim
    for (const imp of ["WAR_ABUSES,", "INCIDENTS,", "MEMORIAL_FALLEN,", "MEMORIAL_WARS,", "DRONE_MODELS,", "DRONE_CASUALTY_FACTS,", "INCIDENT_TYPE_META,", "ABUSE_TYPES,"]) {
      afirmar(sala.includes(imp), `la sala no consume ${imp.replace(",", "")}`);
    }
    afirmar(
      sala.includes("for (const a of WAR_ABUSES) if (!GUERRAS.includes(a.war)) GUERRAS.push(a.war)"),
      "las guerras no se derivan en el orden de la fuente",
    );
    afirmar(
      sala.includes("for (const i of INCIDENTS) if (!TIPOS.includes(i.type)) TIPOS.push(i.type)"),
      "los tipos no se derivan en el orden de la fuente",
    );
    afirmar(
      sala.includes("Object.keys(MEMORIAL_WARS).filter((w) =>"),
      "el memorial no sigue el orden que la propia fuente declara",
    );
    afirmar(
      sala.includes("const lineaVerdad = `La verdad cruda de las guerras — ${WAR_ABUSES.length} abusos documentados con su fuente citada en ${GUERRAS.length} guerras"),
      "la línea no se compone COMPLETA en JS",
    );
    afirmar(
      sala.includes("`" + "${guerra} ×${WAR_ABUSES.filter((a) => a.war === guerra).length}`"),
      "el chip de guerra no compone guerra y conteo en un nodo",
    );
    afirmar(
      sala.includes("`" + "${INCIDENT_TYPE_META[t].label} ×${INCIDENTS.filter((i) => i.type === t).length}`"),
      "el chip de incidente no compone etiqueta y conteo en un nodo",
    );
    afirmar(sala.includes("${s.org} — ${s.label}"), "la fuente citada del abuso no viaja verbatim");
    afirmar(sala.includes("documentado por: {f.documentedBy}"), "el memorial no cita quién lo documenta");
    afirmar(sala.includes("NO suben a esta sala"), "la sala no declara lo que se queda en el aparato");
    // la clasificación manda: mecánica de juego e índice de metraje FUERA
    // (el CÓDIGO real decide: los comentarios que documentan la exclusión
    // no cuentan — se pelan antes del aserto, lección v258 sobre la fuente)
    const salaSinComentarios = sala.replace(/\/\/[^\n]*/g, "");
    afirmar(!salaSinComentarios.includes("SALA_ROJA_ITEMS"), "¡el índice de metraje (sala roja) no sube a la sala!");
    afirmar(!salaSinComentarios.includes("RECRUIT_SIDES"), "¡el reclutamiento 3D no sube a la sala!");
    afirmar(!salaSinComentarios.includes("ELECTION_") && !salaSinComentarios.includes("AMBASSADOR_"), "¡el ciclo electoral no sube a la sala!");
    // las puertas de la casa
    afirmar(mapa.includes("/verdad-cruda"), "el sitemap no anuncia la verdad cruda");
    afirmar(paleta.includes('key: "pg:verdad-cruda"'), "la paleta Ctrl+K no lleva la verdad cruda");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas ISO a mano en la ronda v295!");
    afirmar(!/const linea\w+ = [^;]*\b(19|20)\d\d\b/.test(sala), "¡la sala escribe un año literal en su línea (v295)!");
  });

  await verificar("LA VERDAD CRUDA viva: la línea derivada, los chips, las fuentes citadas y el memorial (v295)", async () => {
    const r = await pedir("/verdad-cruda");
    afirmar(r.status === 200, `/verdad-cruda no 200 (${r.status})`);
    afirmar(r.texto.includes("LA VERDAD CRUDA DE LAS GUERRAS"), "el título no viaja");
    // la línea compuesta COMPLETA (12 · 5 · 10 · 14 · 4 · 4 — derivados de la fuente)
    afirmar(
      r.texto.includes("La verdad cruda de las guerras — 12 abusos documentados con su fuente citada en 5 guerras, 10 periodistas caídos en el memorial, 14 incidentes documentados, 4 sistemas de dron con su anatomía y 4 cifras del coste"),
      "la línea derivada no viaja (o la fuente cambió)",
    );
    // los comentarios RSC y las etiquetas se pelan: los asertos miran el
    // TEXTO servido (lección v258 creciendo en la v294)
    const texto = r.texto.replace(/<[^>]+>/g, "");
    afirmar(texto.includes("UCRANIA ×5"), "el chip de Ucrania no viaja");
    afirmar(texto.includes("Guerra de Ucrania ×6"), "el chip del memorial no viaja");
    afirmar(texto.includes("Ataque / bombardeo ×4"), "el chip de incidentes no viaja");
    afirmar(texto.includes("Ataque a la estación de Kramatorsk"), "el abuso de Kramatorsk no viaja");
    afirmar(texto.includes("ONU/OHCHR — Informe OHCHR Ucrania #12"), "la fuente citada verbatim no viaja");
    afirmar(texto.includes("Viktoria Roshchyna"), "la reportera del memorial no viaja");
    afirmar(texto.includes("CPJ · RSF · IPI"), "quién documenta no viaja");
    afirmar(texto.includes("458"), "el conteo documentado de Bucha no viaja");
    afirmar(texto.includes("Shahed-136 / Gerán-2"), "el dron no viaja");
    afirmar(texto.includes("≈2.000 km"), "el alcance del Shahed no viaja");
    afirmar(texto.includes("9.000+"), "la cifra del coste no viaja");
    afirmar(texto.includes("ONU/OHCHR 2025"), "la fuente de la cifra no viaja");
    // el sitemap vivo anuncia la sala
    const rs = await pedir("/sitemap.xml");
    afirmar(rs.status === 200 && rs.texto.includes("/verdad-cruda"), "el sitemap vivo no anuncia la sala");
  });

  // ── v294.0 EL ATLAS DEL PLANETA: atlas-data (v121, REAL) gana su sala server (/atlas) ──
  // El censo fuera de la cola: cinco cabezas caídas en la clasificación
  // (ficción/juego declarado en su propia fuente) y la veta real que sube.
  await verificar("EL ATLAS DEL PLANETA estática: la fuente REAL intacta y todo derivado (v294)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/atlas-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/atlas/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    // la fuente intacta: los tres bloques con sus censos reales (el dato
    // manda: la cabeza de la fuente dice 70 personas, el dato dice 69)
    afirmar(fuente.includes("export const PAISES_ATLAS"), "la fuente de países no existe");
    const iniP = fuente.indexOf("export const PAISES_ATLAS");
    const iniC = fuente.indexOf("export const PERSONAS_ATLAS");
    const iniR = fuente.indexOf("export const RUTAS_PODER");
    const bloqueP = fuente.slice(iniP, iniC);
    const bloqueC = fuente.slice(iniC, iniR);
    const nP = (bloqueP.match(/\n  \{ id: "/g) ?? []).length;
    const nC = (bloqueC.match(/bio: "/g) ?? []).length;
    afirmar(nP === 84, `el censo de países midió mal (${nP}/84) // v324: 66 → 84, el sur entró`);
    afirmar(nC === 78, `el censo de personas midió mal (${nC}/78 — manda el dato) // v324: 69 → 78`);
    const nR = (fuente.slice(iniR).match(/\{ de: "/g) ?? []).length;
    afirmar(nR === 24, `el censo de rutas midió mal (${nR}/24) // v324: 15 → 24`);
    for (const reg of ["América", "Asia", "Europa", "Oceanía", "África"]) {
      afirmar(bloqueP.includes(`region: "${reg}"`), `falta la región ${reg} en la fuente`);
    }
    for (const cat of ["GOBIERNO", "ORGANISMOS", "DINERO", "CIENCIA", "CULTURA"]) {
      afirmar(bloqueC.includes(`categoria: "${cat}"`), `falta la categoría ${cat} en la fuente`);
    }
    afirmar(
      fuente.includes("export function personaPorId") &&
        fuente.includes("export function fmtKm2") &&
        fuente.includes("export function fmtMillones"),
      "faltan los derivados del canon (personaPorId, fmtKm2, fmtMillones)",
    );
    // la sala: los imports, la línea compuesta, los chips, los fmt, las rutas
    afirmar(sala.includes("PAISES_ATLAS,"), "la sala no consume las naciones");
    afirmar(sala.includes("PERSONAS_ATLAS,"), "la sala no consume las personas");
    afirmar(sala.includes("personaPorId,"), "la sala no consume el resolvedor de rutas");
    afirmar(
      sala.includes("for (const p of PAISES_ATLAS) if (!REGIONES.includes(p.region)) REGIONES.push(p.region)"),
      "las regiones no se derivan en el orden de la fuente",
    );
    afirmar(
      sala.includes("if (!CATEGORIAS.includes(x.categoria)) CATEGORIAS.push(x.categoria)"),
      "las categorías no se derivan en el orden de la fuente",
    );
    afirmar(
      sala.includes("const lineaAtlas = `El atlas del planeta — ${PAISES_ATLAS.length} naciones"),
      "la línea no se compone COMPLETA en JS",
    );
    afirmar(
      sala.includes("`" + "${reg} ×${PAISES_ATLAS.filter((p) => p.region === reg).length}`"),
      "el chip de región no compone región y conteo en un nodo",
    );
    afirmar(
      sala.includes("`" + "${cat} ×${PERSONAS_ATLAS.filter((x) => x.categoria === cat).length}`"),
      "el chip de categoría no compone categoría y conteo en un nodo",
    );
    afirmar(sala.includes("fmtMillones(p.poblacion)"), "la población no se formatea con el fmt del canon");
    afirmar(sala.includes("fmtKm2(p.superficie)"), "la superficie no se formatea con el fmt del canon");
    afirmar(
      sala.includes("RUTAS_PODER.filter(\n  (r) => personaPorId(r.de) && personaPorId(r.a),\n)"),
      "las rutas no se resuelven contra las personas",
    );
    afirmar(sala.includes("el reloj que la mueve vive en el"), "la sala no declara que el reloj vive en el aparato (el eco del LIVE_RATES v293)");
    afirmar(sala.includes("esta sala es la memoria servida sin JavaScript"), "la puerta honesta al aparato no se declara");
    // las puertas de la casa
    afirmar(mapa.includes("/atlas"), "el sitemap no anuncia el atlas");
    afirmar(paleta.includes('key: "pg:atlas"'), "la paleta Ctrl+K no lleva el atlas");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas a mano en la ronda v294!");
    afirmar(!/const linea\w+ = [^;]*\b(19|20)\d\d\b/.test(sala), "¡la sala escribe un año literal en su línea (v294)!");
  });

  await verificar("EL ATLAS DEL PLANETA viva: la línea derivada, los chips, los fmt y las rutas del poder (v294)", async () => {
    const r = await pedir("/atlas");
    afirmar(r.status === 200, `/atlas no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ATLAS DEL PLANETA"), "el título no viaja");
    // la línea compuesta COMPLETA (84 · 5 · 78 · 24 — derivados de la fuente; rodillo v324: el sur entró)
    afirmar(
      r.texto.includes("El atlas del planeta — 84 naciones con su capital y su líder real en 5 regiones, 78 personas del poder con su sede real y 24 rutas que unen los ejes del mundo"),
      "la línea derivada no viaja (o la fuente cambió)",
    );
    // los comentarios RSC y las etiquetas se pelan: los asertos miran el
    // TEXTO servido (los nombres de las rutas cruzan nodos <span>)
    const texto = r.texto.replace(/<[^>]+>/g, "");
    afirmar(texto.includes("América ×16"), "el chip de América no viaja");
    afirmar(texto.includes("GOBIERNO ×37"), "el chip de GOBIERNO no viaja");
    afirmar(texto.includes("9.833.517 km²"), "la superficie de EE. UU. no viaja formateada");
    afirmar(texto.includes("341 millones"), "la población de EE. UU. no viaja formateada");
    afirmar(texto.includes("Xi Jinping"), "la persona no viaja");
    afirmar(texto.includes("La Casa Blanca"), "la sede real no viaja");
    afirmar(texto.includes("Donald Trump ↔ Xi Jinping — GRAN PARIDAD"), "la ruta del poder no viaja resuelta");
    // el sitemap vivo anuncia la sala
    const rs = await pedir("/sitemap.xml");
    afirmar(rs.status === 200 && rs.texto.includes("/atlas"), "el sitemap vivo no anuncia la sala");
  });

  // ── v293.0 EL ARCHIVO MUNDIAL: archive-data (v12, REAL) gana su sala server (/archivo-mundial) ──
  // El censo del almacén sigue pagándose: la fuente clasificada REAL de
  // pies a cabeza (curiosidades, eras, contadores, crimen, carteles).
  await verificar("EL ARCHIVO MUNDIAL estática: la fuente REAL intacta y todo derivado (v293)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/archive-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/archivo-mundial/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    // la fuente intacta: los cuatro bloques con sus censos reales
    afirmar(fuente.includes("export const CURIOSITIES"), "la fuente de curiosidades no existe");
    const iniCu = fuente.indexOf("export const CURIOSITIES");
    const finCu = fuente.indexOf("export const ERAS");
    const bloqueCu = fuente.slice(iniCu, finCu);
    const nCurios = (bloqueCu.match(/id: "c/g) ?? []).length;
    afirmar(nCurios === 44, `el censo de curiosidades midió mal (${nCurios}/44)`);
    for (const cat of ["GUERRA", "POLITICA", "RELIGION", "ANTIGUEDAD", "ECONOMIA", "ESPIONAJE"]) {
      afirmar(bloqueCu.includes(`"${cat}"`), `falta la categoría ${cat} en la fuente`);
    }
    afirmar(fuente.includes("export const ERAS") && fuente.includes("export const WAR_DEATHS") && fuente.includes("export const CARTELS"), "faltan bloques del archivo mundial");
    const iniCa = fuente.indexOf("export const CARTELS");
    const finCa = fuente.indexOf("];", iniCa);
    const bloqueCa = fuente.slice(iniCa, finCa);
    const nCart = (bloqueCa.match(/id: "/g) ?? []).length;
    afirmar(nCart === 8, `el censo de carteles midió mal (${nCart}/8)`);
    // la sala: los imports, la línea compuesta, los chips, el formato
    afirmar(sala.includes("CURIOSITIES,"), "la sala no consume las curiosidades");
    afirmar(sala.includes("if (!CATS.includes(c.cat)) CATS.push(c.cat)"), "las categorías no se derivan en el orden de la fuente");
    afirmar(sala.includes("const lineaArchivoMundial = `El archivo mundial — ${CURIOSITIES.length} curiosidades verídicas en ${CATS.length} categorías, ${ERAS.length} eras desde ${ERAS[0].name}"), "la línea no se compone COMPLETA en JS");
    afirmar(sala.includes("`" + "${cat} ×${CURIOSITIES.filter((c) => c.cat === cat).length}`"), "el chip del censo no compone categoría y conteo en un nodo");
    afirmar(sala.includes('w.total.toLocaleString("es-ES")'), "el total de guerra no se formatea desde el número real");
    afirmar(sala.includes("{c.leader.name}:"), "el líder del cartel no viaja verbatim");
    afirmar(sala.includes("esta sala es la memoria servida sin JavaScript"), "la puerta honesta al aparato no se declara");
    // las puertas de la casa
    afirmar(mapa.includes("/archivo-mundial"), "el sitemap no anuncia el archivo mundial");
    afirmar(paleta.includes('key: "pg:archivo-mundial"'), "la paleta Ctrl+K no lleva el archivo mundial");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas a mano en la ronda v293!");
    afirmar(!/const linea\w+ = [^;]*\b(19|20)\d\d\b/.test(sala), "¡la sala escribe un año literal en su línea (v293)!");
  });

  await verificar("EL ARCHIVO MUNDIAL viva: la línea derivada, las eras, WW2 formateado y Medellín con Escobar (v293)", async () => {
    const r = await pedir("/archivo-mundial");
    afirmar(r.status === 200, `/archivo-mundial no 200 (${r.status})`);
    afirmar(r.texto.includes("EL ARCHIVO MUNDIAL"), "el título no viaja");
    // la línea compuesta COMPLETA (44 · 6 · 8 · 6 · 8 — derivados de la fuente)
    afirmar(r.texto.includes("El archivo mundial — 44 curiosidades verídicas en 6 categorías, 8 eras desde Prehistoria, 6 contadores de guerra y 8 expedientes de cartel, con sus líderes reales"), "la línea derivada no viaja (o la fuente cambió)");
    // los comentarios RSC se pelan antes de los asertos de nodos contiguos
    const limpio = r.texto.replace(/<!-- -->/g, "");
    afirmar(limpio.includes("GUERRA ×10"), "el chip GUERRA no viaja");
    afirmar(limpio.includes("2,5 M a.C. – 3500 a.C."), "el periodo de la Prehistoria no viaja verbatim");
    afirmar(limpio.includes("75.000.000"), "el total de WW2 no viaja formateado");
    afirmar(limpio.includes("La batalla de Karansebes (1788)"), "la curiosidad de Karansebes no viaja");
    afirmar(limpio.includes("Cartel de Medellín"), "el expediente de Medellín no viaja");
    afirmar(limpio.includes("Pablo Escobar"), "el líder real no viaja");
    // el sitemap vivo anuncia la sala
    const rs = await pedir("/sitemap.xml");
    afirmar(rs.status === 200 && rs.texto.includes("/archivo-mundial"), "el sitemap vivo no anuncia la sala");
  });

  // ── v292.0 EL ARCHIVO DESCLASIFICADO: la capa REAL de expediente-data sube a /servicios ──
  // La cabeza del censo del almacén (v291) clasificada: ARCHIVO es la capa
  // REAL (la fuente la declara así); CRISIS y NACIONES son SIM y no suben.
  await verificar("EL ARCHIVO DESCLASIFICADO estática: la clasificación manda y todo se deriva (v292)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/expediente-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/servicios/page.tsx"), "utf8");
    // la fuente: la disciplina REAL/SIM declarada y los 5 expedientes reales intactos
    afirmar(fuente.includes("REAL (archivo desclasificado + geografía real) va marcada como tal"), "la fuente no declara su disciplina REAL/SIM (el comentario parte la frase en dos líneas)");
    afirmar(fuente.includes("const REAL_SEED: ArchivoReal[] = ["), "la capa REAL no existe en la fuente");
    const iniR = fuente.indexOf("const REAL_SEED");
    const finR = fuente.indexOf("];", iniR);
    const bloqueR = fuente.slice(iniR, finR === -1 ? fuente.length : finR + 2);
    for (const id of ["mkultra", "stargate", "paperclip", "cointelpro", "echelon"]) {
      afirmar(bloqueR.includes(`id: "${id}"`), `falta el expediente ${id} en la capa REAL`);
    }
    afirmar(bloqueR.includes('fuente: "CIA Reading Room · colección MK-ULTRA · Comisión Church (1975)"'), "la fuente citada de MK-ULTRA no está");
    // la sala: el import, la línea compuesta, la fuente citada, el vacío
    afirmar(sala.includes('import { ARCHIVO } from "@/lib/expediente-data"'), "la sala no consume la capa REAL");
    afirmar(sala.includes("const totalFases = ARCHIVO.reduce((acc, a) => acc + a.fases.length, 0)"), "las fases no se derivan con reduce");
    afirmar(sala.includes("const lineaArchivo = `El archivo desclasificado — ${ARCHIVO.length} expedientes reales de la capa REAL de la fuente, con ${totalFases} fases y su fuente citada: la historia que los propios archivos confiesan`"), "la línea del archivo no se compone COMPLETA en JS");
    afirmar(sala.includes("fuente: {a.fuente}"), "la fuente citada no viaja verbatim");
    afirmar(sala.includes('{a.fases.map((f) => f.titulo).join(" · ")}'), "los títulos de las fases no viajan verbatim");
    afirmar(sala.includes("la capa REAL de la fuente llega vacía — el archivo duerme honesto"), "el vacío de la capa REAL no se declara");
    afirmar(sala.includes("La capa SIM (el mundo Vanguard) NO sube a esta sala"), "la clasificación SIM/REAL no se declara en la sala");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡/servicios escribe fechas a mano en la ronda v292!");
    afirmar(!/const linea\w+ = [^;]*\b(19|20)\d\d\b/.test(sala), "¡la sala escribe un año literal en su línea (v292)!");
  });

  await verificar("EL ARCHIVO DESCLASIFICADO viva: la línea derivada, MK-ULTRA con su fuente citada y las anclas (v292)", async () => {
    const r = await pedir("/servicios");
    afirmar(r.status === 200, `/servicios no 200 en v292 (${r.status})`);
    // la línea compuesta COMPLETA (5 · 21 — derivados de la fuente)
    afirmar(r.texto.includes("El archivo desclasificado — 5 expedientes reales de la capa REAL de la fuente, con 21 fases y su fuente citada: la historia que los propios archivos confiesan"), "la línea del archivo no viaja (o la fuente cambió)");
    // los comentarios RSC se pelan antes de los asertos de nodos contiguos
    const limpio = r.texto.replace(/<!-- -->/g, "");
    afirmar(limpio.includes("MK-ULTRA: el programa que la CIA quiso borrar"), "MK-ULTRA no viaja");
    afirmar(limpio.includes("fuente: CIA Reading Room · colección MK-ULTRA · Comisión Church (1975)"), "la fuente citada de MK-ULTRA no viaja");
    afirmar(limpio.includes("ECHELON: la red que escuchaba al planeta"), "ECHELON no viaja");
    afirmar(limpio.includes("Informe TEMP 168 del Parlamento Europeo (2001)"), "la fuente de ECHELON no viaja");
    afirmar(limpio.includes("fases: 5 — Aprobación"), "las fases no viajan con sus títulos verbatim (MK-ULTRA tiene 5, medido contra la fuente)");
    // las anclas v291/v288 en pie
    afirmar(limpio.includes("El pacto que une las dos salas — 5 arcos nacen del hub de Londres (MI6) y 1 cruza el Atlántico hasta Washington (38.8977°, -77.0365°), la terminal del puente con la Comunidad"), "la línea del pacto cayó (v291)");
    afirmar(/El pulso del archivo por agencia — \d+ de 18 agencias citadas por \d+ titulares del archivo/.test(r.texto), "el pulso por agencia cayó (v288)");
  });

  // ── v291.0 EL PACTO QUE UNE LAS DOS SALAS: los tres exports hermanos restantes de agencias-mundo-data suben al server (/servicios, quinta capa) ──
  // COLECCION_MUNDO (cifras servidas), REDES (arcos verbatim) y
  // TERMINAL_PUENTE (coordenada compuesta — el camino del globo, v285).
  // Medido con el motor real al abrir (tsx): 18 · 12 · 6 · MI6 1909 ·
  // CNI 2002 · 5 arcos desde el hub mi6 · 1 puente.
  await verificar("EL PACTO QUE UNE LAS DOS SALAS estática: los tres hermanos, las siglas derivadas y la guardia del arco crecida (v291)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/agencias-mundo-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/servicios/page.tsx"), "utf8");
    // los tres exports hermanos intactos en la fuente
    afirmar(fuente.includes("export const REDES"), "la fuente de arcos no existe");
    afirmar(fuente.includes("export const TERMINAL_PUENTE"), "la terminal del puente no existe");
    afirmar(fuente.includes("export const COLECCION_MUNDO"), "las cifras de la red no existen");
    // la sala consume los tres
    afirmar(sala.includes("REDES, TERMINAL_PUENTE, COLECCION_MUNDO"), "los tres hermanos no viajan al server");
    // las siglas derivadas de SERVICIOS por id (nada a mano)
    afirmar(sala.includes("const siglaDe = (id: string): string => RED.find((s) => s.id === id)?.sigla ?? id"), "las siglas de los arcos no se derivan por id");
    afirmar(sala.includes("const arcosPacto = REDES.map"), "los arcos no se derivan de la fuente");
    afirmar(sala.includes('r.a === "washington" ? null : siglaDe(r.a)'), "la terminal del puente no se distingue del resto de arcos");
    // las dos líneas compuestas COMPLETAS en JS (lección v256)
    afirmar(sala.includes("const lineaPacto = `El pacto que une las dos salas — ${REDES.length} arcos nacen del hub de Londres (${hubPacto}) y ${nPuentes} cruza el Atlántico hasta Washington (${TERMINAL_PUENTE.lat}°, ${TERMINAL_PUENTE.lng}°), la terminal del puente con la Comunidad`"), "la línea del pacto no se compone COMPLETA en JS");
    afirmar(sala.includes("const lineaCifrasRed = `La red mundial en cifras — ${COLECCION_MUNDO.total} expedientes de ${COLECCION_MUNDO.naciones} naciones, ${COLECCION_MUNDO.enAlianza} en la alianza"), "la línea de cifras no se sirve de COLECCION_MUNDO");
    // la sección + la terminal compuesta (el camino del globo, v285)
    afirmar(sala.includes("EL PACTO QUE UNE LAS DOS SALAS"), "la sección del pacto no viaja");
    afirmar(sala.includes("TERMINAL_PUENTE.lat}°, ${TERMINAL_PUENTE.lng}°"), "la coordenada no se compone desde la fuente (v285)");
    afirmar(sala.includes("el puente atlántico — la terminal vive en LA COMUNIDAD"), "el puente no se declara como la puerta con la sala hermana");
    // el noscript crece compuesto
    afirmar(sala.includes("y los ${REDES.length} arcos del pacto UKUSA"), "el noscript no creció con el pacto");
    // guardias: fechas a mano y AÑOS en las líneas — la guardia del arco crece a (19|20)
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡/servicios escribe fechas a mano en la ronda v291!");
    afirmar(!/const linea\w+ = [^;]*\b(19|20)\d\d\b/.test(sala), "¡la sala escribe un año a mano en su línea (1909/1946/2002 viven en la fuente, v291)!");
  });

  await verificar("EL PACTO QUE UNE LAS DOS SALAS viva: la línea derivada, los arcos verbatim y las anclas v288/v289 (v291)", async () => {
    const r = await pedir("/servicios");
    afirmar(r.status === 200, `/servicios no 200 en v291 (${r.status})`);
    // las dos líneas compuestas COMPLETAS (derivadas de la fuente real)
    afirmar(r.texto.includes("El pacto que une las dos salas — 5 arcos nacen del hub de Londres (MI6) y 1 cruza el Atlántico hasta Washington (38.8977°, -77.0365°), la terminal del puente con la Comunidad"), "la línea del pacto no viaja (¿cambió la fuente?)");
    afirmar(r.texto.includes("La red mundial en cifras — 18 expedientes de 12 naciones, 6 en la alianza de los Cinco Ojos; el más viejo: MI6 (1909) — el más joven: CNI (2002)"), "la línea de cifras no viaja (¿cambió la fuente?)");
    // los arcos verbatim + la terminal compuesta (los comentarios RSC se pelan)
    const limpio = r.texto.replace(/<!-- -->/g, "");
    afirmar(limpio.includes("UKUSA 1946"), "la etiqueta del pacto no viaja verbatim (v266)");
    afirmar(limpio.includes("MI6 ▸ GCHQ"), "el arco del hub no viaja con sus siglas derivadas");
    afirmar(limpio.includes("Washington, D.C. (38.8977°, -77.0365°)"), "la terminal no viaja compuesta");
    afirmar(limpio.includes("el puente atlántico — la terminal vive en LA COMUNIDAD"), "el puente atlántico no se declara");
    // el noscript crecido
    afirmar(limpio.includes("y los 5 arcos del pacto UKUSA"), "el noscript no creció con el pacto");
    // las anclas v288/v289 en pie (cifras vivas — la ley de la v310)
    afirmar(/El pulso del archivo por agencia — \d+ de 18 agencias citadas por \d+ titulares del archivo/.test(r.texto), "el pulso por agencia cayó (v288)");
    afirmar(/El pulso de la red mundial — \d+ de 18 servicios citados por \d+ titulares del archivo/.test(r.texto), "el pulso de la red cayó (v289)");
  });

  // ── v289.0 EL PULSO DE LA RED MUNDIAL: los keywords de los 18 servicios extranjeros cruzan el mismo archivo (/servicios) ──
  // El bloque hermano del pulso por agencia (v288): el algoritmo del
  // panel (red-mundial-panel), la única lectura de la sala, el orden de
  // la fuente y el vacío honesto. Medido contra la BD fría al abrir:
  // 2 de 18 servicios citados por 5 titulares (ASIS 1 · CNI 4).
  await verificar("EL PULSO DE LA RED MUNDIAL estática: el cruce del canon y el vacío honesto (v289)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/agencias-mundo-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/servicios/page.tsx"), "utf8");
    // la fuente de keywords intacta (18 servicios extranjeros)
    afirmar(fuente.includes("export const PULSO_KEYWORDS_MUNDO"), "la fuente de keywords no existe");
    const iniM = fuente.indexOf("export const PULSO_KEYWORDS_MUNDO");
    const finM = fuente.indexOf("};", iniM);
    const bloqueM = fuente.slice(iniM, finM === -1 ? fuente.length : finM + 2);
    const nKws = (bloqueM.match(/^\s{2}[a-z_0-9]+: \[/gm) ?? []).length;
    afirmar(nKws === 18, `el censo de keywords midió mal (${nKws}/18)`);
    // la sala: el import, el cruce compartido, la línea compuesta
    afirmar(sala.includes("PULSO_KEYWORDS_MUNDO"), "la sala no consume la fuente de keywords de la red");
    afirmar(sala.includes("for (const sv of RED) {"), "el cruce no recorre la fuente en su orden (RED = los 18 servicios extranjeros)");
    afirmar(sala.includes("c.title.toLowerCase().includes(k)"), "el matching no es el del canon (red-mundial-panel)");
    afirmar(sala.includes("const lineaPulsoMundo = `El pulso de la red mundial — ${pulsoMundo.length} de ${RED.length} servicios citados por ${totalMundo} titulares del archivo`"), "la línea del pulso de la red no se compone COMPLETA en JS");
    afirmar(sala.includes("EL PULSO DE LA RED MUNDIAL"), "la sección de la red no viaja");
    afirmar(sala.includes("el archivo no cita a ningún servicio de la red todavía — el pulso duerme honesto"), "el vacío de la red no se declara honesto");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡/servicios escribe fechas a mano en la ronda v289!");
    afirmar(!/const linea\w+ = [^;]*\b19\d\d\b/.test(sala), "¡la sala escribe años a mano en su línea (v289)!");
  });

  await verificar("EL PULSO DE LA RED MUNDIAL viva: la línea derivada, ASIS y CNI con sus menciones (v289)", async () => {
    const r = await pedir("/servicios");
    afirmar(r.status === 200, `/servicios no 200 en v289 (${r.status})`);
    // LAS CIFRAS VIVAS (v310): la línea derivada con su sanidad (los titulares
    // citados cubren a los servicios citados) — el aliento de la BD no se congela
    const lineaRed = r.texto.match(/El pulso de la red mundial — (\d+) de 18 servicios citados por (\d+) titulares del archivo/);
    afirmar(lineaRed !== null, "la línea de la red no viaja (o la fuente/BD cambió)");
    if (lineaRed) {
      const nServ = Number(lineaRed[1]);
      const nTit = Number(lineaRed[2]);
      afirmar(nServ >= 1 && nServ <= 18, `el pulso cita ${nServ} servicios (fuera de rango)`);
      afirmar(nTit >= nServ, `los ${nTit} titulares no cubren a los ${nServ} servicios`);
    }
    // las tarjetas: los comentarios RSC se pelan antes (trampa v258) — el
    // conjunto citado es el que la BD dice HOY (la rotación de la valla sacó
    // a CNI del conjunto medido en la v289: las tarjetas viven con el pulso)
    const limpio = r.texto.replace(/<!-- -->/g, "");
    if (lineaRed && Number(lineaRed[1]) >= 1) {
      afirmar(/· \d+ mención/.test(limpio), "las tarjetas del pulso no viajan con su conteo vivo");
    }
    // las anclas v288/v282 en pie (cifras vivas — la ley de la v310)
    afirmar(/El pulso del archivo por agencia — \d+ de 18 agencias citadas por \d+ titulares del archivo/.test(r.texto), "el pulso por agencia cayó (v288)");
    afirmar(limpio.includes("de 1882 a 2020"), "el arco de fundación cayó (v282)");
  });

  // ── v288.0 EL PULSO DEL ARCHIVO POR AGENCIA: los keywords de la fuente cruzan el archivo real (/servicios) ──
  // La «Queda» de la v282 (en pie en la cola de la v287) se paga: el mismo
  // algoritmo del panel (canon del consumidor) contra los títulos de la BD,
  // lectura pura, vacío honesto. Medido contra la BD fría al abrir:
  // 10 de 18 agencias citadas por 451 titulares (CIA 307).
  await verificar("EL PULSO DEL ARCHIVO POR AGENCIA estática: el cruce del canon, la lectura pura y el vacío honesto (v288)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/agencias-data.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/servicios/page.tsx"), "utf8");
    // la fuente de keywords intacta (18 llaves, las agencias del censo)
    afirmar(fuente.includes("export const PULSO_KEYWORDS"), "la fuente de keywords no existe");
    const iniK = fuente.indexOf("export const PULSO_KEYWORDS");
    const finK = fuente.indexOf("};", iniK);
    const bloqueK = fuente.slice(iniK, finK === -1 ? fuente.length : finK + 2);
    const nKws = (bloqueK.match(/^\s{2}[a-z]+: \[/gm) ?? []).length;
    afirmar(nKws === 18, `el censo de keywords midió mal (${nKws}/18)`);
    // la sala: lectura pura, el algoritmo del canon, la línea compuesta
    afirmar(sala.includes("PULSO_KEYWORDS,"), "la sala no consume la fuente de keywords");
    afirmar(sala.includes('where: { externalId: { not: { startsWith: "curated-" } } }'), "el pulso cuenta las piezas curadas de respaldo (la sala nunca miente)");
    afirmar(sala.includes("select: { id: true, title: true }"), "el pulso no baja solo los campos que necesita");
    afirmar(sala.includes("c.title.toLowerCase().includes(k)"), "el matching no es el del canon (el del panel: minúsculas, includes en el título)");
    afirmar(sala.includes("for (const a of COMUNIDAD) {"), "el cruce no recorre la fuente en su orden");
    afirmar(sala.includes("if (suyos.length > 0) {"), "el vacío de una agencia no se rellena");
    afirmar(sala.includes("const lineaPulso = `El pulso del archivo por agencia — ${pulso.length} de ${COMUNIDAD.length} agencias citadas por ${totalMenciones} titulares del archivo`"), "la línea del pulso no se compone COMPLETA en JS");
    afirmar(sala.includes("href={`/noticia/${p.ultimo.id}`}"), "el último titular no abre su puerta viva a /noticia");
    afirmar(sala.includes("el archivo no cita a ninguna agencia todavía — el pulso duerme honesto"), "el vacío del pulso no se declara honesto");
    afirmar(sala.includes('export const dynamic = "force-dynamic"'), "la sala no deja entrar el pulso al render");
    afirmar(sala.includes("EL PULSO DEL ARCHIVO POR AGENCIA"), "la sección del pulso no viaja");
    // guardias
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡/servicios escribe fechas a mano en la ronda v288!");
    afirmar(!/const linea\w+ = [^;]*\b19\d\d\b/.test(sala), "¡la sala escribe años a mano en su línea (v288)!");
  });

  await verificar("EL PULSO DEL ARCHIVO POR AGENCIA viva: la línea derivada, la tarjeta de CIA y las anclas v282 (v288)", async () => {
    const r = await pedir("/servicios");
    afirmar(r.status === 200, `/servicios no 200 en v288 (${r.status})`);
    // LAS CIFRAS VIVAS (v310): el archivo RESPIRA — la casa ingesta cables en
    // cada refresco (medido: la poda v84 dormaba porque la red estaba bloqueada;
    // hoy respira y los conteos caminan). La ley verifica la FORMA derivada y
    // su SANIDAD (cada agencia citada aportó ≥ 1 titular), jamás un congelamiento.
    const lineaPulso = r.texto.match(/El pulso del archivo por agencia — (\d+) de 18 agencias citadas por (\d+) titulares del archivo/);
    afirmar(lineaPulso !== null, "la línea del pulso no viaja (o la fuente/BD cambió)");
    if (lineaPulso) {
      const nAgencias = Number(lineaPulso[1]);
      const nTitulares = Number(lineaPulso[2]);
      afirmar(nAgencias >= 1 && nAgencias <= 18, `el pulso cita ${nAgencias} agencias (fuera de rango)`);
      afirmar(nTitulares >= nAgencias, `los ${nTitulares} titulares no cubren a las ${nAgencias} agencias (el conteo derivado mintió)`);
    }
    // la tarjeta de CIA: sigla + conteo derivado VIVO + titular vivo
    // (los comentarios RSC separan los nodos — trampa v258: se pelan antes)
    const limpio = r.texto.replace(/<!-- -->/g, "");
    afirmar(/CIA · \d+/.test(limpio), "el conteo de CIA no viaja (¿cambió la BD?)");
    afirmar(/href="\/noticia\/[a-z0-9-]+"/.test(r.texto), "la puerta viva a /noticia no viaja");
    // el noscript crecido (compuesto en JS) — con la MISMA cifra viva que la línea
    if (lineaPulso) {
      afirmar(r.texto.includes(`con el pulso del archivo por agencia (${lineaPulso[1]} de 18 agencias citadas)`), "el noscript no creció con el pulso (o discrepa de la línea)");
    }
    // las anclas v282 en pie
    afirmar(r.texto.includes("La sala de los servicios — 36 expedientes reales de inteligencia"), "la línea de la sala cayó (v282)");
    afirmar(r.texto.includes("LOS SENTIDOS DE LA INTELIGENCIA"), "la sección de los sentidos cayó (v282)");
  });

  // ── v286.0 LOS ROSTROS DEL PODER: la galería de los rostros sube a server (/rostros) ──
  // personas-data (ROSTROS, 34 fichas reales — TRONOS 12 · DINERO 10 ·
  // TRIBUNAL 6 · NUEVOS 6, 20 campos por expediente) solo vivía
  // client-side (rostros-panel, intros-gta). Medido con el motor real
  // al abrir (tsx): 34 fichas · 18 naciones · poder 58–98 · frase y
  // lat/lng en las 34 — la sala no escribe una cifra: la sirve de
  // COLECCION_ROSTROS (ya derivada en la fuente con Set+filter+reduce).
  await verificar("LOS ROSTROS DEL PODER estática: la fuente, el censo derivado, las leyendas de la fuente, las líneas compuestas y las cifras servidas (v286)", () => {
    const sala = readFileSync(join(RAIZ, "src/app/rostros/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    // la fuente viaja (nada a mano)
    afirmar(sala.includes('from "@/lib/personas-data"'), "la sala no importa la fuente de los rostros");
    afirmar(sala.includes("ROSTROS,\n  COLECCION_ROSTROS,\n  CATEGORIAS_ROSTRO,"), "los tres exports de la fuente no viajan");
    // el censo derivado con Set + filter en el orden de la fuente
    afirmar(sala.includes("[...new Set(ROSTROS.map((r) => r.categoria))]"), "el censo no se deriva con Set");
    afirmar(sala.includes("ROSTROS.filter((r) => r.categoria === c).length"), "el censo no cuenta con filter");
    afirmar(sala.includes("new Set(ROSTROS.map((r) => r.pais)).size"), "las naciones no se derivan");
    // las leyendas e iconos viven en la fuente (directiva v266)
    afirmar(sala.includes("CATEGORIAS_ROSTRO[c].leyenda"), "las leyendas no viajan desde la fuente");
    afirmar(sala.includes("CATEGORIAS_ROSTRO[c].etiqueta"), "las etiquetas no viajan desde la fuente");
    // las líneas compuestas COMPLETAS en JS (lección v256)
    afirmar(sala.includes("const lineaRostros = `La galería de los rostros — ${ROSTROS.length}"), "la línea de la galería no se compone en JS");
    afirmar(sala.includes("censoRostros.map((c) => `${c.etiqueta} ×${c.n}`).join(\" · \")"), "los censos no viajan derivados en la línea");
    // la placa y las cifras servidas de COLECCION_ROSTROS (herencia v282)
    afirmar(sala.includes('String(n).padStart(2, "0")'), "la placa no se compone desde el num real");
    afirmar(sala.includes("const lineaCifras = `La colección en cifras — ${COLECCION_ROSTROS.total}"), "la línea de cifras no se compone desde COLECCION_ROSTROS");
    afirmar(sala.includes("COLECCION_ROSTROS.masPoderoso.nombre"), "la ficha más poderosa no viaja derivada");
    // las DOS guardias heredadas: cero años a mano en las líneas + guardia v234
    afirmar(!/const linea\w+ = [^;]*\b\d{4}\b/.test(sala), "¡una línea de la sala escribe un año a mano (debe salir de la fuente)!");
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas ISO a mano en la ronda v286!");
    // las puertas de la casa (patrón v274/v275)
    afirmar(mapa.includes("${SITE_URL}/rostros"), "el sitemap no anuncia la galería");
    afirmar(paleta.includes('key: "pg:rostros"'), "la paleta Ctrl+K no lleva a la galería");
    afirmar(sala.includes("vive en el aparato"), "la puerta honesta al aparato no está declarada");
  });

  await verificar("LOS ROSTROS DEL PODER viva: el SSR sirve las fichas verbatim, los censos derivados y el sitemap anuncia la sala (v286)", async () => {
    const r = await pedir("/rostros");
    afirmar(r.status === 200, `/rostros no 200 en v286 (${r.status})`);
    afirmar(r.texto.includes("LOS ROSTROS DEL PODER"), "el título de la galería no viaja");
    // la línea compuesta COMPLETA desde la fuente (34 · 18 · censos)
    afirmar(r.texto.includes("La galería de los rostros — 34 fichas reales del poder en 18 naciones"), "la línea derivada no viaja (o la fuente cambió)");
    afirmar(r.texto.includes("LOS TRONOS ×12"), "el censo de los tronos no viaja derivado");
    afirmar(r.texto.includes("EL DINERO ×10"), "el censo del dinero no viaja derivado");
    // las fichas verbatim de la fuente (los datos son de la fuente, no a mano)
    afirmar(r.texto.includes("Donald J. Trump"), "la ficha más poderosa no viaja");
    afirmar(r.texto.includes("47.º Presidente de los Estados Unidos"), "el cargo verbatim no viaja");
    afirmar(r.texto.includes("Yo solo puedo arreglarlo."), "la frase verbatim no viaja");
    afirmar(r.texto.includes("La desaparición de la URSS fue la mayor catástrofe geopolítica del siglo XX."), "la frase de la fuente no viaja verbatim");
    // la línea de cifras servida de COLECCION_ROSTROS
    afirmar(r.texto.includes("La colección en cifras — 34 fichas de 18 naciones"), "la línea de cifras no viaja compuesta");
    // la placa derivada del num real + el legendario de la fuente
    afirmar(r.texto.includes("01 · "), "la placa derivada no viaja");
    afirmar(r.texto.includes("Jefes de Estado y monarcas"), "la leyenda de la fuente no viaja");
    // las puertas y el sitemap vivo
    afirmar(r.texto.includes("vive en el aparato"), "la puerta honesta no viaja");
    afirmar(r.texto.includes("Esta sala funciona sin JavaScript"), "el noscript compuesto no viaja");
    const rs = await pedir("/sitemap.xml");
    afirmar(rs.status === 200 && rs.texto.includes("/rostros"), "el sitemap vivo no anuncia la galería");
  });

  // ── v282.0 LOS SENTIDOS DE LA SALA: la segunda capa de /servicios ──
  // La «Queda» de la v281 se paga: los TRES exports hermanos de
  // agencias-data suben al server. Medido con el motor real al abrir
  // (tsx): SENTIDOS 5 (HUMINT·SIGINT·GEOINT·OSINT·FININT), ALIADAS 1
  // (FEMA), COLECCION 18·16·2·1882·2020·6 — la sala no escribe una
  // cifra: la sirve de la fuente (ya derivada con Set+filter+reduce).
  await verificar("LOS SENTIDOS DE LA SALA estática: los tres hermanos, las líneas compuestas y las cifras servidas de COLECCION (v282)", () => {
    const sala = readFileSync(join(RAIZ, "src/app/servicios/page.tsx"), "utf8");
    // los TRES exports hermanos viajan (nada a mano)
    afirmar(sala.includes("ALIADAS,\n  SENTIDOS,\n  COLECCION,"), "los tres imports hermanos de agencias-data no viajan (v282)");
    // las tres líneas compuestas COMPLETAS en JS (lección v256)
    afirmar(sala.includes("const lineaSentidos = `Los sentidos del oficio — ${SENTIDOS.length}"), "lineaSentidos no se compone desde el length real");
    afirmar(sala.includes("SENTIDOS.map((s) => s.sigla).join(\" · \")"), "las siglas de los sentidos no viajan derivadas");
    afirmar(sala.includes("const lineaManos = `La sala anexa — ${ALIADAS.length}"), "lineaManos no se compone desde el length real");
    afirmar(sala.includes("ALIADAS.map((a) => a.sigla).join(\" · \")"), "las siglas de las manos no viajan derivadas");
    afirmar(sala.includes("const lineaCifras = `La colección en cifras — ${COLECCION.total}"), "lineaCifras no se compone desde COLECCION");
    // la sala NO escribe las cifras: las sirve de COLECCION (ya derivada en la fuente)
    afirmar(sala.includes("COLECCION.enCorredor} sedes en el corredor"), "el censo del corredor no viaja desde COLECCION");
    afirmar(sala.includes("COLECCION.masAntigua.fundacion} (${COLECCION.masAntigua.sigla})"), "el arco de fundación no viaja desde COLECCION");
    afirmar(sala.includes("COLECCION.creadasPost11S} nacidas tras el 11-S"), "el post 11-S no viaja desde COLECCION");
    afirmar(sala.includes("COLECCION.fueraCorredor.join(\" · \")"), "los huérfanos del corredor no viajan derivados");
    // la casa no inventa el arco: ninguna línea nueva escribe 1882 ni 2020 a mano
    afirmar(!/const linea\w+ = [^;]*\b1882\b/.test(sala), "¡el arco 1882 está escrito a mano en una línea (debe salir de COLECCION)!");
    afirmar(!/const linea\w+ = [^;]*\b2020\b/.test(sala), "¡el año 2020 está escrito a mano en una línea (debe salir de COLECCION)!");
    // las dos secciones nuevas + el strip + el noscript crecido
    afirmar(sala.includes("LOS SENTIDOS DE LA INTELIGENCIA"), "la sección de los sentidos no está declarada");
    afirmar(sala.includes("SALA ANEXA — LAS MANOS QUE ACTÚAN"), "la sala anexa no está declarada");
    afirmar(sala.includes("{`${lineaCifras}.`}"), "el strip de cifras no se pinta compuesto");
    afirmar(sala.includes("los ${SENTIDOS.length} sentidos del oficio y la sala anexa (${ALIADAS.map((a) => a.sigla).join(\" · \")}) también viajan en el HTML"), "el noscript no creció compuesto");
    // las anclas v281 en pie + guardia v234
    afirmar(sala.includes("const lineaSala = `La sala de los servicios — ${COMUNIDAD.length + RED.length}"), "la línea v281 de la sala se rompió");
    afirmar(sala.includes("BLOQUES.find((b) => b.cat === cat)?.leyenda"), "las leyendas de la fuente se rompieron");
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas a mano en la ronda v282!");
  });

  await verificar("LOS SENTIDOS DE LA SALA viva: el SSR sirve los sentidos, las manos y las cifras derivadas (v282)", async () => {
    const r = await pedir("/servicios");
    afirmar(r.status === 200, `/servicios no 200 en v282 (${r.status})`);
    // los cinco sentidos, verbatim de la fuente
    afirmar(r.texto.includes("LOS SENTIDOS DE LA INTELIGENCIA"), "la sección de los sentidos no viaja");
    afirmar(r.texto.includes("5 disciplinas del oficio"), "el censo derivado de los sentidos no viaja");
    afirmar(r.texto.includes("HUMINT"), "HUMINT no viaja");
    afirmar(r.texto.includes("FININT"), "FININT no viaja");
    afirmar(r.texto.includes("El oficio más antiguo: personas que hablan con personas"), "el texto de HUMINT no viaja verbatim");
    afirmar(r.texto.includes("leer el mundo entero con paciencia de relojero"), "el texto de OSINT no viaja verbatim");
    // la sala anexa, verbatim de la fuente
    afirmar(r.texto.includes("SALA ANEXA — LAS MANOS QUE ACTÚAN"), "la sala anexa no viaja");
    afirmar(r.texto.includes("Federal Emergency Management Agency"), "FEMA no viaja con su nombre de la fuente");
    afirmar(r.texto.includes("es la mano que actúa cuando los ojos ya vieron el desastre"), "la nota de FEMA no viaja verbatim");
    // la colección en cifras, servida de COLECCION (16 corredor · ONI 1882 · DELTA 7 2020)
    afirmar(r.texto.includes("La colección en cifras — 18 expedientes oficiales, 16 sedes en el corredor"), "la línea de cifras no viaja compuesta");
    afirmar(r.texto.includes("fundada en 1882 (ONI) y la más joven en 2020 (DELTA 7)"), "el arco derivado no viaja en la línea de cifras");
    afirmar(r.texto.includes("6 nacidas tras el 11-S"), "el post 11-S derivado no viaja");
    afirmar(r.texto.includes("fuera del corredor: 16ª AF · DELTA 7"), "los huérfanos derivados no viajan");
    // el noscript crecido y las anclas v281 en pie
    afirmar(r.texto.includes("los 5 sentidos del oficio y la sala anexa (FEMA) también viajan en el HTML"), "el noscript crecido no viaja");
    afirmar(r.texto.includes("LA COMUNIDAD"), "la ancla v281 de la comunidad se rompió");
    afirmar(r.texto.includes("LA RED MUNDIAL"), "la ancla v281 de la red se rompió");
    afirmar(r.texto.includes("Semper Occultus"), "la ancla v281 del lema de MI6 se rompió");
    afirmar(r.texto.includes("de 1882 a 2020"), "la ancla v281 del arco en lineaSala se rompió");
  });

  // ── v279.0 EL QUIZ DEL FRENTE: la segunda capa del quiz del peso — parejas por teatro (/en-vivo) ──
  // La cabeza de la cola v272: los dos cables más pesados de UNA sala,
  // derivados de la MISMA instantánea (conflictTag ya viajaba en el
  // payload v213). Medido contra la BD al abrir: 25/60 con teatro —
  // gaza 18 · taiwan 3 · hormuz 3 · ukraine 1 (huérfana, sin par).
  await verificar("EL QUIZ DEL FRENTE estática: la derivación por teatro declarada en el servidor y el modo nuevo en el quiz (v279)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/en-vivo/page.tsx"), "utf8");
    const quiz = readFileSync(join(RAIZ, "src/app/en-vivo/quiz-peso.tsx"), "utf8");
    // la derivación en el servidor: Map por conflictTag, pesos distintos, orden determinista
    afirmar(pag.includes("const salas = new Map<string, CableVivo[]>()"), "el servidor no agrupa la instantánea por sala");
    afirmar(pag.includes("c.conflicto.trim().toUpperCase()"), "el teatro no se normaliza desde el conflictTag real");
    afirmar(pag.includes("orden[0].impacto !== orden[1].impacto"), "el frente casa parejas con pesos IGUALES — preguntaría lo que no tiene respuesta");
    afirmar(pag.includes("y.total - x.total || x.teatro.localeCompare(y.teatro)"), "el orden de las salas no es determinista");
    afirmar(pag.includes("const salasSinPar = salas.size - parejasTeatro.length"), "el censo de salas huérfanas no se deriva");
    afirmar(pag.includes("parejasTeatro={parejasTeatro} salasSinPar={salasSinPar}"), "el quiz no recibe las parejas del frente");
    // el componente: el tipo nuevo, la línea compuesta en JS, el toggle y la ficha del frente
    afirmar(quiz.includes("export interface ParTeatro extends ParPeso"), "el tipo de la pareja del frente no viaja");
    afirmar(quiz.includes("const lineaTeatro = `EL QUIZ POR TEATRO — ${parejasTeatro.length}"), "la línea del frente no se compone COMPLETA en JS");
    afirmar(quiz.includes("del frente con par en la instantánea: ${nombresFrente ||"), "la línea del frente no nombra las salas derivadas");
    afirmar(quiz.includes('"ninguna todavía"'), "el vacío del frente no se declara honesto");
    afirmar(quiz.includes("${salasSinPar > 0 ?"), "la sala huérfana no viaja derivada");
    afirmar(quiz.includes("sin par posible"), "la sala huérfana no se nombra");
    afirmar(quiz.includes('aria-label="Modo del quiz del peso"'), "el toggle del modo no viaja");
    afirmar(quiz.includes("POR TEATRO ▸"), "el botón del modo teatro no está");
    afirmar(quiz.includes("SALA GENERAL ▸"), "el botón de la sala general no está");
    afirmar(quiz.includes("FRENTE · {par.teatro.toUpperCase()} — {par.total} cables de esta sala en la instantánea"), "la ficha del frente no se compone desde el total derivado");
    afirmar(quiz.includes('function cambiarModo(nuevo: "sala" | "teatro")'), "el cambio de modo no resetea la ronda");
    afirmar(quiz.includes('modo === "teatro" && parejasTeatro.length > 0 ? parejasTeatro : parejas'), "el modo no decide qué parejas sirven");
    // guardia v234
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡/en-vivo escribe fechas a mano en la ronda v279!");
    afirmar(!/20\d\d-\d\d-\d\d/.test(quiz), "¡el quiz escribe fechas a mano en la ronda v279!");
  });

  await verificar("EL QUIZ DEL FRENTE viva: el SSR de /en-vivo sirve la línea del frente con las salas reales y el toggle (v279)", async () => {
    const r = await pedir("/en-vivo");
    afirmar(r.status === 200, `/en-vivo no 200 en v279 (${r.status})`);
    // la línea del frente, compuesta en JS desde la BD fría (medida al abrir:
    // gaza 18 · hormuz 3 · taiwan 3 con par · ukraine 1 huérfana; el orden
    // es determinista: total desc y nombre asc — HORMUZ va antes que TAIWAN)
    afirmar(/EL QUIZ POR TEATRO — \d+ sala[s]? del frente con par en la instantánea/.test(r.texto), "la línea del frente no viaja en el SSR");
    afirmar(r.texto.includes("GAZA · HORMUZ · TAIWAN"), "las salas reales del frente no viajan en el orden determinista (¿cambió la BD?)");
    afirmar(r.texto.includes("1 sala sin par posible"), "la sala huérfana no se declara en el SSR");
    afirmar(r.texto.includes("POR TEATRO ▸"), "el toggle POR TEATRO no viaja en el SSR");
    afirmar(r.texto.includes('aria-pressed="true"'), "el modo activo no se declara en el SSR");
    // las anclas de la casa en pie (v272/v213)
    afirmar(/EL QUIZ DEL PESO — \d+ parejas reales del archivo miden tu ojo/.test(r.texto), "la línea del quiz v272 cayó");
    afirmar(r.texto.includes("¿Qué cable pesa más?"), "la pregunta del peso cayó (v272)");
    afirmar(r.texto.includes("EL PULSO — ÚLTIMA HORA DEL MUNDO"), "la sala del pulso cayó (v213)");
  });

  // ── v278.0 LA MEMORIA EN EL PLANETA: el archivo (lat/lng de la fuente) enciende el globo de /mundo ──
  // La cabeza de la cola de la v277 (la «evaluación aparte» pagada): el
  // archivo de la historia tiene lat/lng reales en la fuente y /mundo ya
  // validaba ?teatro= (v264) — la misma puerta ahora abre ?guerra=.
  // Medido con simulador contra la fuente: 10 guerras, arco 264 a. C. → 1991.
  await verificar("LA MEMORIA EN EL PLANETA estática: la puerta ?guerra= validada contra la fuente y las marcas del archivo en el globo (v278)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    const mundo = readFileSync(join(RAIZ, "src/app/mundo/page.tsx"), "utf8");
    const globo = readFileSync(join(RAIZ, "src/app/mundo/mundo-3d-vivo.tsx"), "utf8");
    const historiap = readFileSync(join(RAIZ, "src/app/historia/page.tsx"), "utf8");
    // la fuente intacta: las 10 guerras con sus coordenadas reales
    afirmar(fuente.includes("export const HISTORICAL_WARS"), "la fuente de guerras no existe");
    const iniH = fuente.indexOf("export const HISTORICAL_WARS");
    const finH = fuente.indexOf("];", iniH);
    const bloqueH = fuente.slice(iniH, finH === -1 ? fuente.length : finH + 2);
    afirmar(bloqueH.length > 5000 && bloqueH.length < 8000, `el slice del archivo midió mal (${bloqueH.length})`);
    for (const id of ["HW-PUNIC", "HW-ROMAN-GAUL", "HW-CRUSADES", "HW-HUNDRED", "HW-NAPOLONIC", "HW-WW1", "HW-WW2", "HW-VIETNAM", "HW-COLD", "HW-GERMANIC"]) {
      afirmar(bloqueH.includes(`id: "${id}"`), `falta la guerra ${id} en la fuente`);
    }
    const nCoord = (bloqueH.match(/lat: -?\d+\.\d,/g) ?? []).length;
    afirmar(nCoord === 10, `las coordenadas del archivo no están completas (${nCoord}/10)`);
    // la puerta en /mundo: validada contra la fuente real (nada de inventar)
    afirmar(mundo.includes("guerra?: string"), "la puerta ?guerra= no está declarada en /mundo");
    afirmar(mundo.includes("HISTORICAL_WARS.find((g) => g.id === candidatoGuerra)"), "la puerta no se valida contra la fuente real por id exacto");
    afirmar(mundo.includes("candidatoGuerra = guerra && guerra.length <= 40"), "la puerta no acota la longitud del pedido");
    afirmar(mundo.includes("GUERRAS_MEMORIA = HISTORICAL_WARS.map"), "la memoria no viaja desde la fuente (map derivado)");
    afirmar(mundo.includes("periodo: `${ano(g.yearStart)} – ${ano(g.yearEnd)}`"), "el periodo no se compone desde los años reales");
    afirmar(mundo.includes("const lineaMemoria = `La memoria en el planeta — ${GUERRAS_MEMORIA.length} guerras históricas del archivo encendidas en el globo con sus coordenadas reales, de ${ano(ANO_INICIO_MEMORIA)} a ${ano(ANO_FIN_MEMORIA)}: tócalas en el planeta o pide la tuya con ?guerra=`"), "la línea de la memoria no se compone COMPLETA en JS");
    afirmar(mundo.includes("no encontró ninguna guerra del archivo"), "la puerta fallida no se declara honesta");
    // el globo: la capa de memoria (marcas rosas, pestaña, selección)
    afirmar(globo.includes('{ kind: "guerra"; id: string }'), "el globo no conoce la selección de guerra");
    afirmar(globo.includes("id: `guerra-${g.id}`"), "las marcas de memoria no están en el globo");
    afirmar(globo.includes('"GUERRA HISTÓRICA · EL ARCHIVO"'), "la etiqueta de memoria no viaja");
    afirmar(globo.includes("setPestana(\"memoria\")"), "la pestaña de memoria no abre con la guerra");
    afirmar(globo.includes("const COLOR_MEMORIA = \"#F472B6\""), "el color de la memoria no está");
    // las puertas de vuelta desde /historia
    afirmar(historiap.includes("href={`/mundo?guerra=${g.id}`}"), "las cartas del archivo no abren su puerta al globo");
    // guardia v234 en ambas salas
    afirmar(!/20\d\d-\d\d-\d\d/.test(mundo), "¡/mundo escribe fechas a mano en la ronda v278!");
    afirmar(!/20\d\d-\d\d-\d\d/.test(historiap), "¡/historia escribe fechas a mano en la ronda v278!");
  });

  await verificar("LA MEMORIA EN EL PLANETA viva: /mundo?guerra=HW-PUNIC enciende la guerra y /historia abre sus puertas (v278)", async () => {
    const r = await pedir("/mundo?guerra=HW-PUNIC");
    afirmar(r.status === 200, `/mundo?guerra= no 200 (${r.status})`);
    afirmar(r.texto.includes('aria-label="La memoria en el planeta — el archivo de la historia en el globo"'), "la sección de memoria no viaja en el SSR");
    afirmar(r.texto.includes("La memoria en el planeta — 10 guerras históricas del archivo encendidas en el globo con sus coordenadas reales, de 264 a. C. a 1991: tócalas en el planeta o pide la tuya con ?guerra="), "la línea derivada de la memoria no viaja (o las cifras no coinciden con la fuente)");
    // la guerra pedida con su periodo compuesto y sus coordenadas reales
    // la cabeza y el periodo son nodos distintos (trampa v258, pagada en v274):
    // el aserto usa lo que el SSR realmente renderiza
    afirmar(r.texto.includes("Guerras Punicas"), "la guerra pedida no viaja");
    afirmar(r.texto.includes("264 a. C. – 146 a. C."), "el periodo compuesto no viaja");
    afirmar(r.texto.includes("Mediterraneo — 37.0°, 14.0°"), "la línea región+coordenadas reales no viaja compuesta");
    afirmar(r.texto.includes("desenlace: Victoria romana · Cartago destruida en 146 a.C."), "el desenlace de la guerra pedida no viaja");
    afirmar(r.texto.includes("/historia#HW-PUNIC"), "la puerta de vuelta al archivo no viaja");
    // la puerta inválida se declara honesta
    const r2 = await pedir("/mundo?guerra=GUERRA-QUE-NO-ES");
    afirmar(r2.status === 200, `/mundo con puerta inválida no 200 (${r2.status})`);
    afirmar(r2.texto.includes("no encontró ninguna guerra del archivo"), "la puerta fallida no se declara honesta en el SSR");
    // /historia abre las puertas al globo (primera y última del canon)
    const r3 = await pedir("/historia");
    afirmar(r3.status === 200, `/historia no 200 en v278 (${r3.status})`);
    afirmar(r3.texto.includes("/mundo?guerra=HW-PUNIC"), "la puerta de las Punicas no está en el archivo");
    afirmar(r3.texto.includes("/mundo?guerra=HW-GERMANIC"), "la puerta de las Germanicas no está en el archivo");
    // las anclas de la casa en pie (v264/v274/v275/v277)
    afirmar(r2.texto.includes("El índice del planeta"), "el índice del planeta cayó (v264)");
    afirmar(r3.texto.includes("La taquilla del archivo — 8 conflictos con cuota abierta en 4 categorías"), "la línea de la taquilla cayó (v275)");
    afirmar(r3.texto.includes("El juicio de los libros — 4 de 8 cuotas encuentran su desenlace en el archivo"), "el juicio cayó (v277)");
  });

  // ── v277.0 EL JUICIO DE LOS LIBROS: las cuotas de la taquilla se cruzan con el desenlace del archivo (/historia) ──
  // La cabeza de la cola de la v276 (medida al abrir la ronda): la taquilla,
  // segunda capa — WAR_BETS × HISTORICAL_WARS por nombre exacto. Medido con
  // simulador contra la fuente: 4 de 8 cuotas encuentran veredicto (Punicas,
  // Cruzadas, Cien Años, Guerra Fria); 4 no (la casa no inventa el cruce).
  await verificar("EL JUICIO DE LOS LIBROS estática: el cruce honesto por nombre exacto declarado en la sala (v277)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    const pag = readFileSync(join(RAIZ, "src/app/historia/page.tsx"), "utf8");
    // las dos fuentes intactas
    afirmar(fuente.includes("export const WAR_BETS"), "la fuente de cuotas no existe");
    afirmar(fuente.includes("export const HISTORICAL_WARS"), "la fuente de guerras no existe");
    // la sala cruza por nombre exacto (la casa no inventa el cruce)
    afirmar(pag.includes("VEREDICTOS = new Map(APUESTAS.map((b) => [b.id, GUERRAS.find((g) => g.name === b.warName)]))"), "el cruce no es por nombre exacto de la fuente");
    afirmar(pag.includes("const CON_VEREDICTO = APUESTAS.filter((b) => VEREDICTOS.get(b.id) !== undefined)"), "el censo con veredicto no se deriva (filter)");
    afirmar(pag.includes("const SIN_VEREDICTO = APUESTAS.filter((b) => VEREDICTOS.get(b.id) === undefined)"), "el censo sin veredicto no se deriva (filter)");
    afirmar(pag.includes("const lineaJuicio = `El juicio de los libros — ${CON_VEREDICTO.length} de ${APUESTAS.length} cuotas encuentran su desenlace en el archivo: la casa dio su porcentaje y los libros escribieron quién ganó`"), "la línea del juicio no se compone COMPLETA en JS");
    afirmar(pag.includes("los libros dicen: ${libro.outcome}"), "el desenlace no viaja verbatim de la fuente");
    afirmar(pag.includes("SIN_VEREDICTO.map((b) => b.warName).join(\", \")"), "los nombres del vacío no se componen derivados (join)");
    afirmar(pag.includes("la casa no inventa el cruce que la fuente no declara"), "el vacío honesto del cruce no está declarado");
    afirmar(pag.includes("${CON_VEREDICTO.length} con veredicto de los libros"), "el noscript no se compone derivado");
    // el juicio no inventa fechas (guardia v234)
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la sala escribe fechas a mano en la ronda v277!");
  });

  await verificar("EL JUICIO DE LOS LIBROS viva: el SSR sirve el cruce con los desenlaces reales (v277)", async () => {
    const r = await pedir("/historia");
    afirmar(r.status === 200, `/historia no 200 en v277 (${r.status})`);
    afirmar(r.texto.includes("El juicio de los libros — 4 de 8 cuotas encuentran su desenlace en el archivo"), "la línea derivada del juicio no viaja (o las cifras no coinciden con la fuente)");
    // los 4 desenlaces verbatim de la fuente, bajo las cuotas de la casa
    afirmar(r.texto.includes("los libros dicen: Victoria romana · Cartago destruida en 146 a.C."), "el veredicto de las Punicas no viaja verbatim");
    afirmar(r.texto.includes("los libros dicen: Fracaso final · Caida de Acre en 1291"), "el veredicto de las Cruzadas no viaja");
    afirmar(r.texto.includes("los libros dicen: Victoria francesa · Inglaterra pierde territorios continentales"), "el veredicto de los Cien Años no viaja");
    afirmar(r.texto.includes("los libros dicen: Colapso de la URSS en 1991"), "el veredicto de la Guerra Fria no viaja");
    // el vacío honesto con los 4 nombres derivados
    afirmar(r.texto.includes("Sin veredicto en el archivo: Batalla de Termopilas, Waterloo, WWII Europa, Vietnam — la casa no inventa el cruce que la fuente no declara."), "el vacío del cruce no viaja con los nombres derivados");
    // las anclas de la casa en pie (v274/v275)
    afirmar(r.texto.includes("LA TAQUILLA DEL ARCHIVO"), "la ancla v275 cayó");
    afirmar(r.texto.includes("La taquilla del archivo — 8 conflictos con cuota abierta en 4 categorías"), "la línea de la taquilla cayó (v275)");
    afirmar(r.texto.includes("El archivo vive en la fuente"), "la procedencia del archivo cayó (v274)");
  });

  // ── v276.0 LA ESCUADRA DE LA CASA: los 6 aliados de la fuente suben a la vitrina (/objetivos) ──
  // La cabeza de la cola de la v275 (medida al abrir la ronda): FRIENDS —
  // el último catálogo client-side sin vestir. La cola juraba «12»: la
  // fuente real declara 6 operadores (F1–F6) con el escalafón RANKS de 9 —
  // canon = repo. La vitrina sirve su censo, presencia y cima derivados.
  await verificar("LA ESCUADRA DE LA CASA estática: la fuente de 6 aliados intacta y la vitrina la sirve derivada (v276)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    const pag = readFileSync(join(RAIZ, "src/app/objetivos/page.tsx"), "utf8");
    // la fuente intacta: los 6 aliados uno a uno
    afirmar(fuente.includes("export const FRIENDS"), "la fuente de aliados no existe");
    const iniF = fuente.indexOf("export const FRIENDS");
    const finF = fuente.indexOf("];", iniF);
    const bloqueF = fuente.slice(iniF, finF === -1 ? fuente.length : finF + 2);
    afirmar(bloqueF.length > 700 && bloqueF.length < 3000, `el slice de la escuadra midió mal (${bloqueF.length})`);
    for (const id of ["F1", "F2", "F3", "F4", "F5", "F6"]) {
      afirmar(bloqueF.includes(`id: "${id}"`), `falta el aliado ${id} en la fuente`);
    }
    // el escalafón real de la casa: 9 rangos
    const iniR = fuente.indexOf("export const RANKS");
    const bloqueR = fuente.slice(iniR, fuente.indexOf("];", iniR) + 2);
    afirmar((bloqueR.match(/name: "/g) || []).length === 9, "el escalafón no declara sus 9 rangos");
    // la vitrina consume la fuente (directiva v266) y deriva TODO (cero cifras a mano)
    afirmar(/import \{[^}]*\bFRIENDS\b[^}]*\} from "@\/lib\/game-data"/.test(pag), "la vitrina no consume FRIENDS de la fuente");
    afirmar(/import \{[^}]*\bRANKS\b[^}]*\} from "@\/lib\/game-data"/.test(pag), "la vitrina no consume el escalafón RANKS");
    afirmar(pag.includes("const EN_LINEA = ALIADOS.filter((a) => a.online).length"), "la presencia no se deriva (filter)");
    afirmar(pag.includes("new Set(ALIADOS.map((a) => a.rank)).size"), "los rangos distintos no se derivan (Set)");
    afirmar(pag.includes("ALIADOS.reduce((max, a) => (a.level > max.level ? a : max))"), "la cima no se deriva (reduce)");
    afirmar(pag.includes("const lineaEscuadra = `La escuadra de la casa — ${ALIADOS.length} operadores aliados: ${EN_LINEA} en línea, ${RANGOS_DISTINTOS} rangos del escalafón de ${RANKS.length} y ${CIMA.alias} (nivel ${CIMA.level}) en la cima`"), "la línea de la escuadra no se compone COMPLETA en JS");
    afirmar(pag.includes("La escuadra vive en la fuente"), "la vitrina no declara la procedencia de la escuadra");
    afirmar(pag.includes("vive en el aparato, no en esta vitrina"), "la puerta honesta del salón interactivo no está declarada");
    // la escuadra no inventa fechas (guardia v234)
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la vitrina escribe fechas a mano en la ronda v276!");
  });

  await verificar("LA ESCUADRA DE LA CASA viva: el SSR sirve los 6 aliados con sus datos derivados (v276)", async () => {
    const r = await pedir("/objetivos");
    afirmar(r.status === 200, `/objetivos no 200 en v276 (${r.status})`);
    afirmar(r.texto.includes("LA ESCUADRA DE LA CASA"), "la cabeza de la escuadra no viaja en el SSR");
    afirmar(r.texto.includes("La escuadra de la casa — 6 operadores aliados: 3 en línea, 5 rangos del escalafón de 9 y FALCON_X (nivel 18) en la cima"), "la línea derivada de la escuadra no viaja (o las cifras no coinciden con la fuente)");
    // los 6 aliados reales con sus rangos de la fuente
    for (const alias of ["WOLF_Tactico", "FALCON_X", "GHOST_Cmd", "VIPER_K", "RAVEN_Alpha", "PHOENIX_R"]) {
      afirmar(r.texto.includes(alias), `el aliado ${alias} no viaja a la vitrina`);
    }
    // el estado compuesto desde la fuente (booleano + lastActive tal como la fuente lo declara)
    afirmar(r.texto.includes("nivel 18 · EN LÍNEA"), "la cima en línea no se compone desde el booleano real");
    afirmar(r.texto.includes("nivel 8 · visto hace 1d"), "el estado offline no viaja tal como la fuente lo declara");
    afirmar(r.texto.includes("quiz: 12 aciertos · racha: 12"), "los contadores reales de la cima no se componen en JS");
    afirmar(r.texto.includes("misiones reclamadas: 14"), "las misiones reclamadas de la cima no viajan");
    afirmar(r.texto.includes("La escuadra vive en la fuente"), "la procedencia de la escuadra no viaja");
    // las anclas de la casa en pie (v235/v267/v268/v270/v273)
    afirmar(r.texto.includes("EL TERCER CATÁLOGO"), "la ancla v273 cayó");
    afirmar(r.texto.includes("LA JORNADA"), "la ancla v268 cayó");
    afirmar(r.texto.includes("EL SEGUNDO CATÁLOGO"), "la ancla v270 cayó");
    afirmar(r.texto.includes("EL CABLEADO DEL APARATO"), "la ancla v267 cayó");
    afirmar(r.texto.includes("La balanza del botín"), "la ancla v235 cayó");
  });

  // ── v275.0 LA TAQUILLA DEL ARCHIVO: las 8 cuotas de la fuente suben a la sala (/historia) ──
  // La cabeza de la cola de la v274 (medida al abrir la ronda): WAR_BETS —
  // 8 conflictos con cuota (WB1–WB8, ANTIGUA ×2 · MEDIEVAL ×2 · MODERNA ×1
  // · ACTUAL ×3) solo vivía en el panel client-side del aparato; la
  // taquilla la sirve en server con censo y líneas derivados.
  await verificar("LA TAQUILLA DEL ARCHIVO estática: la fuente de 8 cuotas intacta y la sala la sirve derivada (v275)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    const pag = readFileSync(join(RAIZ, "src/app/historia/page.tsx"), "utf8");
    // la fuente intacta: los 8 conflictos uno a uno
    afirmar(fuente.includes("export const WAR_BETS"), "la fuente de apuestas no existe");
    const iniW = fuente.indexOf("export const WAR_BETS");
    const finW = fuente.indexOf("];", iniW);
    const bloqueW = fuente.slice(iniW, finW === -1 ? fuente.length : finW + 2);
    afirmar(bloqueW.length > 1500 && bloqueW.length < 4000, `el slice de la taquilla midió mal (${bloqueW.length})`);
    for (const id of ["WB1", "WB2", "WB3", "WB4", "WB5", "WB6", "WB7", "WB8"]) {
      afirmar(bloqueW.includes(`id: "${id}"`), `falta el conflicto ${id} en la fuente`);
    }
    // la sala consume la fuente (directiva v266) y deriva TODO (cero cifras a mano)
    afirmar(/import \{[^}]*\bWAR_BETS\b[^}]*\} from "@\/lib\/game-data"/.test(pag), "la sala no consume WAR_BETS de la fuente");
    afirmar(pag.includes("[...new Set(APUESTAS.map((b) => b.category))]"), "el censo de categorías no se deriva (Set)");
    afirmar(pag.includes(".filter((b) => b.category === e).length"), "el conteo por categoría no se deriva (filter)");
    afirmar(pag.includes("const lineaTaquilla = `La taquilla del archivo — ${APUESTAS.length} conflictos con cuota abierta en ${TAQUILLA_ERAS.length} categorías"), "la línea de la taquilla no se compone COMPLETA en JS");
    afirmar(pag.includes("Math.round(b.probabilityA * 100)"), "la probabilidad no se compone desde la fuente");
    afirmar(pag.includes("La taquilla vive en la fuente"), "la sala no declara la procedencia de la taquilla");
    afirmar(pag.includes("La casa no acepta apuestas"), "el vacío honesto de la taquilla no está declarado");
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la sala escribe fechas a mano en la ronda v275!");
  });

  await verificar("LA TAQUILLA DEL ARCHIVO viva: la sala sirve las 8 cuotas con sus datos derivados (v275)", async () => {
    const r = await pedir("/historia");
    afirmar(r.status === 200, `/historia no 200 en v275 (${r.status})`);
    afirmar(r.texto.includes("LA TAQUILLA DEL ARCHIVO"), "la cabeza de la taquilla no viaja en el SSR");
    afirmar(r.texto.includes("La taquilla del archivo — 8 conflictos con cuota abierta en 4 categorías"), "la línea derivada de la taquilla no viaja (o las cifras no coinciden con la fuente)");
    // el censo por categoría (derivado al abrir la ronda: 2/2/1/3)
    afirmar(r.texto.includes("ANTIGUA ×2 · MEDIEVAL ×2 · MODERNA ×1 · ACTUAL ×3"), "el censo por categoría no viaja derivado");
    // conflictos reales con sus datos de la fuente (números tal como la fuente los declara)
    afirmar(r.texto.includes("Guerras Punicas"), "las Punicas no viajan a la taquilla");
    afirmar(r.texto.includes("cuotas: 1.4 / 3.2"), "las cuotas de las Punicas no viajan derivadas");
    afirmar(r.texto.includes("la casa da 65% a Roma"), "la probabilidad de Roma no se compone desde la fuente");
    afirmar(r.texto.includes("la casa da 80% a EE.UU."), "la probabilidad de la Guerra Fria no viaja");
    afirmar(r.texto.includes("Batalla de Termopilas"), "Termopilas no viaja a la taquilla");
    // las anclas de la casa en pie (la v274 no cayó)
    afirmar(r.texto.includes("La taquilla vive en la fuente"), "la procedencia de la taquilla no viaja");
    afirmar(r.texto.includes("El archivo vive en la fuente"), "la procedencia del archivo cayó (v274)");
    afirmar(r.texto.includes("El archivo de la historia — 10 guerras de Antigüedad a Contemporánea: de 264 a. C. a 1991, la memoria con la que la casa lee las de hoy"), "la línea del archivo cayó (v274)");
  });

  // ── v274.0 EL ARCHIVO DE LA HISTORIA: las 10 guerras reales de la fuente abren puerta propia (/historia) ──
  // La cabeza de la cola (medida al abrir la ronda): HISTORICAL_WARS —
  // 10 guerras con años, facciones, desenlace y coste — solo vivía en el
  // panel client-side; la puerta nueva las sirve en server con censo y
  // arco de tiempo derivados.
  await verificar("EL ARCHIVO DE LA HISTORIA estática: la fuente de 10 guerras intacta y la sala la sirve derivada (v274)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    const pag = readFileSync(join(RAIZ, "src/app/historia/page.tsx"), "utf8");
    const mapa = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    // la fuente intacta: las 10 guerras con sus años reales
    afirmar(fuente.includes("export const HISTORICAL_WARS"), "la fuente de guerras históricas no existe");
    const iniH = fuente.indexOf("export const HISTORICAL_WARS");
    const finH = fuente.indexOf("];", iniH);
    const bloqueH = fuente.slice(iniH, finH === -1 ? fuente.length : finH + 2);
    afirmar(bloqueH.length > 4000 && bloqueH.length < 9000, `el slice del archivo midió mal (${bloqueH.length})`);
    for (const id of ["HW-PUNIC", "HW-CRUSADES", "HW-NAPOLONIC", "HW-WW2", "HW-COLD", "HW-GERMANIC"]) {
      afirmar(bloqueH.includes(`id: "${id}"`), `falta la guerra ${id} en la fuente`);
    }
    // la sala consume la fuente (directiva v266) y deriva TODO (cero cifras a mano)
    afirmar(/import \{[^}]*\bHISTORICAL_WARS\b[^}]*\} from "@\/lib\/game-data"/.test(pag), "la sala no consume HISTORICAL_WARS de la fuente");
    afirmar(pag.includes("const CENSO_ERAS = ERA_ORDEN.map("), "el censo por era no se deriva de la fuente");
    afirmar(pag.includes("const ANO_INICIO = GUERRAS.reduce("), "el arco de tiempo no se deriva (reduce)");
    afirmar(pag.includes("g.yearEnd - g.yearStart"), "la duración de cada guerra no se deriva de sus años reales");
    // los años negativos se componen como a. C. desde el número real (guardia v234)
    afirmar(pag.includes("n < 0 ? `${-n} a. C.` : `${n}`"), "el año negativo no se compone honestamente desde la fuente");
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la sala escribe fechas a mano en la ronda v274!");
    // la línea compuesta COMPLETA en JS (lección v256)
    afirmar(pag.includes("const lineaArchivo = `El archivo de la historia — ${GUERRAS.length} guerras de ${ERA_NOMBRES[ERA_ORDEN[0]]} a ${ERA_NOMBRES[ERA_ORDEN[3]]}: de ${ano(ANO_INICIO)} a ${ano(ANO_FIN)}, la memoria con la que la casa lee las de hoy`"), "la línea del archivo no se compone COMPLETA en JS");
    afirmar(pag.includes("El archivo vive en la fuente"), "la sala no declara la procedencia del archivo");
    afirmar(pag.includes("numberOfItems: GUERRAS.length"), "el JSON-LD no declara el censo real de la fuente");
    // las puertas de la casa: el mapa anuncia la sala y la paleta la lleva
    afirmar(mapa.includes("/historia"), "el sitemap no anuncia la puerta nueva");
    const paleta = readFileSync(join(RAIZ, "src/components/vanguard/section-search.tsx"), "utf8");
    afirmar(paleta.includes('href: "/historia"') && paleta.includes("pg:historia"), "la paleta no lleva la puerta del archivo");
  });

  await verificar("EL ARCHIVO DE LA HISTORIA viva: la sala sirve las 10 guerras reales con sus años derivados (v274)", async () => {
    const r = await pedir("/historia");
    afirmar(r.status === 200, `/historia no 200 en v274 (${r.status})`);
    afirmar(r.texto.includes("EL ARCHIVO DE LA HISTORIA"), "la cabeza del archivo no viaja en el SSR");
    afirmar(r.texto.includes("El archivo de la historia — 10 guerras de Antigüedad a Contemporánea: de 264 a. C. a 1991, la memoria con la que la casa lee las de hoy"), "la línea derivada del archivo no viaja (o las cifras no coinciden con la fuente)");
    // las eras derivadas (medidas al abrir la ronda: 3/2/1/4)
    afirmar(r.texto.includes("Antigüedad ×3"), "el censo de la Antigüedad no viaja derivado");
    afirmar(r.texto.includes("Edad Media ×2"), "el censo de la Edad Media no viaja derivado");
    afirmar(r.texto.includes("Contemporánea ×4"), "el censo de la Contemporánea no viaja derivado");
    // guerras reales con sus datos de la fuente (nombres tal como la fuente los declara)
    afirmar(r.texto.includes("Guerras Punicas"), "las Guerras Punicas no viajan");
    afirmar(r.texto.includes("264 a. C. – 146 a. C."), "los años negativos de las Punicas no se componen desde la fuente");
    afirmar(r.texto.includes("Segunda Guerra Mundial"), "la Segunda Guerra Mundial no viaja");
    afirmar(r.texto.includes("~70-85M muertos"), "el coste real de la WW2 no viaja");
    afirmar(r.texto.includes("Guerra Fria"), "la Guerra Fria no viaja");
    afirmar(r.texto.includes("Tierra Santa · 195 años"), "la duración derivada de la guerra más larga no viaja");
    // las anclas de la casa en pie
    afirmar(r.texto.includes("El archivo vive en la fuente"), "la procedencia del archivo no viaja");
    afirmar(r.texto.includes("PRIMERA PÁGINA"), "las puertas honestas del núcleo cayeron");
    // el mapa anuncia la puerta nueva en vivo
    const mapa = await pedir("/sitemap.xml");
    afirmar(mapa.status === 200 && mapa.texto.includes("/historia"), "el sitemap vivo no anuncia /historia");
  });

  // ── v273.0 EL TERCER CATÁLOGO: los 3 torneos del aparato viajan en SSR ──
  // La cabeza de la cola (medida al abrir la ronda): TOURNAMENTS — Copa
  // Estratega, Operación Tritón, Maratón Operacional — solo vivía en el
  // panel client-side; la vitrina sirve ahora su censo, su botín y su líder.
  await verificar("EL TERCER CATÁLOGO estática: censo, botín y líder de los torneos derivados de la fuente (v273)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    const pag = readFileSync(join(RAIZ, "src/app/objetivos/page.tsx"), "utf8");
    // la fuente intacta: los 3 torneos con id, botín y tabla reales
    afirmar(fuente.includes("export const TOURNAMENTS"), "la fuente de torneos no existe");
    const iniT = fuente.indexOf("export const TOURNAMENTS");
    const finT = fuente.indexOf("];", iniT);
    const bloqueT = fuente.slice(iniT, finT === -1 ? fuente.length : finT + 2);
    afirmar(bloqueT.length > 1500 && bloqueT.length < 4000, `el slice del catálogo midió mal (${bloqueT.length})`);
    for (const id of ["T-QUIZ-WEEK", "T-MINIGAME-WEEK", "T-XP-WEEK"]) {
      afirmar(bloqueT.includes(`id: "${id}"`), `falta el torneo ${id} en la fuente`);
    }
    // la vitrina consume la fuente y deriva TODO con reduce (cero cifras a mano)
    afirmar(/import \{[^}]*\bTOURNAMENTS\b[^}]*\} from "@\/lib\/game-data"/.test(pag), "la vitrina no consume TOURNAMENTS de la fuente");
    afirmar(pag.includes("const BOTIN_TORNEOS = TORNEOS.reduce("), "el botín de los torneos no se deriva (reduce)");
    afirmar(pag.includes("t.monedas + x.topPrize.coins"), "el mon de los torneos no se suma del catálogo");
    afirmar(pag.includes("t.gemas + x.topPrize.gems"), "las gemas de los torneos no se suman del catálogo");
    afirmar(pag.includes("n + x.leaderboard.length"), "las posiciones de las tablas no se derivan del catálogo");
    // la línea de la sección compuesta COMPLETA en JS (lección v256)
    afirmar(pag.includes("const lineaTorneos = `El tercer catálogo de la casa — ${TORNEOS.length} torneos en marcha con ${cifra.format(BOTIN_TORNEOS.monedas)} mon y ${BOTIN_TORNEOS.gemas} gemas de botín en la cima, ${POSICIONES} posiciones en las tablas`"), "la línea de los torneos no se compone COMPLETA en JS");
    afirmar(pag.includes("EL TERCER CATÁLOGO"), "la cabeza del tercer catálogo desapareció");
    afirmar(pag.includes("botín: +${t.topPrize.coins} mon · +${t.topPrize.gems} gemas"), "el botín de cada torneo no se compone en JS");
    afirmar(pag.includes("líder: ${lider.alias} con ${cifra.format(lider.score)} puntos"), "el líder no se compone en JS desde la tabla real");
    afirmar(pag.includes("este catálogo también vive en la fuente"), "la vitrina no declara la procedencia del tercer catálogo");
    // el tercer catálogo no inventa fechas (guardia v234)
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la vitrina escribe fechas a mano en la ronda v273!");
  });

  await verificar("EL TERCER CATÁLOGO viva: el SSR sirve los 3 torneos con su botín derivado y las anclas en pie (v273)", async () => {
    const r = await pedir("/objetivos");
    afirmar(r.status === 200, `/objetivos no 200 en v273 (${r.status})`);
    afirmar(r.texto.includes("EL TERCER CATÁLOGO"), "el tercer catálogo no viaja en el SSR");
    afirmar(r.texto.includes("El tercer catálogo de la casa — 3 torneos en marcha con 1900 mon y 19 gemas de botín en la cima, 21 posiciones en las tablas"), "la línea derivada del tercer catálogo no viaja (o la cifra no coincide con la fuente)");
    afirmar(r.texto.includes("T-QUIZ-WEEK · Copa Estratega"), "la firma del torneo quiz no viaja");
    afirmar(r.texto.includes("T-MINIGAME-WEEK · Operacion Tritón"), "la firma del torneo mini-game no viaja");
    afirmar(r.texto.includes("T-XP-WEEK · Maraton Operacional"), "la firma del torneo de progreso no viaja");
    afirmar(r.texto.includes("botín: +500 mon · +5 gemas"), "el botín compuesto del torneo quiz no viaja");
    afirmar(r.texto.includes("botín: +800 mon · +8 gemas"), "el botín compuesto del torneo mayor no viaja");
    afirmar(r.texto.includes("líder: AGUILEGEND-7 con 47 puntos"), "el líder real de la tabla no viaja compuesto");
    // las anclas de la casa en pie (v235/v267/v268/v270)
    afirmar(r.texto.includes("LA JORNADA"), "la ancla v268 cayó");
    afirmar(r.texto.includes("EL SEGUNDO CATÁLOGO"), "la ancla v270 cayó");
    afirmar(r.texto.includes("EL CABLEADO DEL APARATO"), "la ancla v267 cayó");
    afirmar(r.texto.includes("La balanza del botín"), "la ancla v235 cayó");
  });

  // ── v272.0 EL QUIZ DEL PESO: dos cables reales, una apuesta, el veredicto del motor ──
  // El legado del linaje perdido v174–v176: la CENTRAL DE ALARMAS (v232)
  // ya avisa y el MOTOR DE IMPACTO (v172) ya ranquea — nada conectaba el
  // motor con el juicio del visitante. Las parejas nacen de la MISMA
  // instantánea del pulso (cero consultas de más) y la racha vive en el
  // navegador (cerradura v132) — la BD JAMÁS (un solo escritor, v245/v246).
  await verificar("EL QUIZ DEL PESO estática: las parejas nacen de la instantánea y el veredicto es el motor (v272)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/en-vivo/page.tsx"), "utf8");
    const quiz = readFileSync(join(RAIZ, "src/app/en-vivo/quiz-peso.tsx"), "utf8");
    // cero consultas de más: las parejas se derivan de la instantánea YA servida (herencia v256/v262)
    afirmar(pag.includes("const ordenadosPeso = [...iniciales].sort"), "las parejas no se derivan de la instantánea ya servida");
    afirmar(pag.includes("parejasPeso.length < 12"), "el quiz no pone cota a sus parejas (v280: la cota creció 8 → 12 para el contrarreloj)");
    afirmar(pag.includes("a.impacto !== b.impacto"), "el quiz admite parejas sin veredicto (pesos iguales)");
    afirmar(pag.includes("<QuizPeso parejas={parejasPeso} parejasTeatro={parejasTeatro} salasSinPar={salasSinPar} />"), "el quiz no viaja montado bajo la sala (v279: creció con el modo teatro)");
    // el veredicto no es una opinión: es el motor canónico (directiva v266 — la fuente manda)
    afirmar(quiz.includes('import { TIERS, type TierImpacto } from "@/lib/impacto"'), "el quiz no consume el motor canónico (TIERS)");
    afirmar(quiz.includes("pesoApostado > pesoRival"), "el veredicto no compara el peso real del motor");
    afirmar(quiz.includes("TIERS[tier as TierImpacto]?.label"), "las etiquetas del peso no vienen de la fuente canónica");
    // la racha vive en el navegador con cerradura v132, jamás en la BD (leyes v245/v246)
    afirmar(quiz.includes("marcarHidratado(CLAVE_PESO)"), "la cerradura v132 no custodia el botín del quiz");
    afirmar(quiz.includes("estaHidratado(CLAVE_PESO)"), "el botín se escribe sin pasar por la cerradura");
    afirmar(!quiz.includes("db.") && !quiz.includes("fetch("), "el quiz toca la red o la BD — la sala ya le sirvió la comida");
    // cero fechas escritas a mano (guardia v234)
    afirmar(!/20\d\d-\d\d-\d\d/.test(quiz), "¡el quiz escribe fechas a mano en la ronda v272!");
  });

  await verificar("EL QUIZ DEL PESO viva: la sala sirve el quiz con parejas reales y las anclas en pie (v272)", async () => {
    const r = await pedir("/en-vivo");
    afirmar(r.status === 200, `/en-vivo no 200 en v272 (${r.status})`);
    afirmar(/EL QUIZ DEL PESO — \d+ parejas reales del archivo miden tu ojo/.test(r.texto), "la cabeza compuesta del quiz no viaja (o la cifra no es derivada)");
    afirmar(r.texto.includes("¿Qué cable pesa más?"), "la pregunta del quiz desapareció");
    afirmar((r.texto.match(/PESA MÁS ▸/g) || []).length >= 2, "los botones de apuesta no viajan en el SSR");
    // las anclas de la sala en pie (v213 arriba, CONECTA v242 abajo)
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "el CONECTA de v242 desapareció tras montar el quiz");
    afirmar(r.texto.includes("EL PULSO — ÚLTIMA HORA DEL MUNDO"), "la sala de v213 murió bajo el quiz");
  });

  // ── v271.0 EL CANAL CLASIFICADO: el feed declara el teatro de cada cable ──
  // La candidata que la v269 dejó medida: el <item> del canal no llevaba
  // <category> — los agregadores no podían filtrar por teatro.
  await verificar("EL CANAL CLASIFICADO estática: la categoría viene del conflictTag y el nombre humano del catálogo canónico (v271)", () => {
    const feed = readFileSync(join(RAIZ, "src/app/feed.xml/route.ts"), "utf8");
    // la fuente manda (directiva v266): el nombre humano viene de TEATROS, no se inventa
    afirmar(feed.includes('import { TEATROS } from "@/lib/teatros"'), "el canal no consume el catálogo canónico");
    afirmar(feed.includes("conflictTag: string | null"), "el conflictTag no viaja en el tipo del feed");
    afirmar(feed.includes("const categorias = it.conflictTag"), "la categoría no se compone desde el cable real");
    afirmar(feed.includes("<category>${esc(it.conflictTag)}</category>"), "el conflictTag crudo no viaja en <category>");
    afirmar(feed.includes("TEATROS[it.conflictTag]?.nombre ?? it.conflictTag"), "el nombre humano no viene de la fuente (o el tag desconocido no cae honesto)");
    // vacío honesto: el cable sin teatro no declara categoría de ficción
    afirmar(feed.includes('        : "";'), "un cable sin teatro pinta categoría falsa");
    // cero fechas escritas a mano (guardia v234)
    afirmar(!/20\d\d-\d\d-\d\d/.test(feed), "¡el canal escribe fechas a mano en la ronda v271!");
  });

  await verificar("EL CANAL CLASIFICADO viva: el RSS sirve categorías reales, canónicas y honestas (v271)", async () => {
    const r = await pedir("/feed.xml");
    afirmar(r.status === 200, `/feed.xml no 200 en v271 (${r.status})`);
    afirmar((r.headers["content-type"] || "").includes("application/rss+xml"), "el canal no viaja como RSS");
    afirmar(r.texto.includes('<rss version="2.0">'), "la cabeza del canal desapareció");
    afirmar(r.texto.includes("VANGUARD — Conflictos Mundiales en Vivo"), "el título del canal desapareció");
    afirmar(r.texto.includes("/noticia/"), "las puertas /noticia desaparecieron del canal");
    // las categorías reales de los 30 cables servidos (BD medida: 13 etiquetados)
    const valores = [...r.texto.matchAll(/<category>([^<]+)<\/category>/g)].map((m) => m[1]);
    afirmar(valores.length >= 10, `el canal clasifica menos de lo medido (${valores.length} categorías)`);
    const CANONICOS = new Set([
      "ukraine", "gaza", "hormuz", "taiwan", "sahel", "redsea", "korea", "sudan", "lebanon",
      "Ucrania", "Gaza e Israel", "Ormuz y el Golfo", "Taiwán y el Pacífico", "El Sahel", "Mar Rojo", "Las Coreas", "Sudán", "Líbano",
    ]);
    for (const v of valores) {
      afirmar(CANONICOS.has(v), `categoría fuera del catálogo canónico: «${v}»`);
    }
    afirmar(valores.includes("gaza") && valores.includes("Gaza e Israel"), "el par crudo+humano de gaza no viaja");
    afirmar(valores.includes("taiwan") && valores.includes("Taiwán y el Pacífico"), "el par crudo+humano de taiwan no viaja");
  });

  // ── v270.0 EL SEGUNDO CATÁLOGO: los 9 retos diarios del aparato viajan en SSR ──
  // (renumerada en vuelo: el turno paralelo 500735 tomó v269.0 EL MAPA DEL
  // ARCHIVO — protocolo canon-repo, dos escritores, un canon)
  // La casa tiene DOS catálogos de misiones: MISSION_TEMPLATES (la jornada,
  // v268) y DAILY_CHALLENGES (DC-1→DC-9), que solo vivía client-side.
  await verificar("EL SEGUNDO CATÁLOGO estática: censo, botín y meta de los retos derivados de la fuente (v270)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    const pag = readFileSync(join(RAIZ, "src/app/objetivos/page.tsx"), "utf8");
    // la fuente intacta: los 9 retos DC con id, botín y meta reales
    afirmar(fuente.includes("export const DAILY_CHALLENGES"), "la fuente de retos no existe");
    const iniD = fuente.indexOf("export const DAILY_CHALLENGES");
    const bloqueD = fuente.slice(iniD, fuente.indexOf("];", iniD) + 2);
    afirmar(bloqueD.length > 400 && bloqueD.length < 4000, `el slice del catálogo midió mal (${bloqueD.length})`);
    for (let i = 1; i <= 9; i++) afirmar(bloqueD.includes(`id: "DC-${i}"`), `falta el reto DC-${i} en la fuente`);
    // la vitrina consume la fuente y deriva TODO con reduce (lección v268: cero cifras a mano)
    afirmar(/import \{[^}]*\bDAILY_CHALLENGES\b[^}]*\} from "@\/lib\/game-data"/.test(pag), "la vitrina no consume DAILY_CHALLENGES de la fuente");
    afirmar(pag.includes("const BOTIN_RETOS = RETOS.reduce("), "el botín de los retos no se deriva (reduce)");
    afirmar(pag.includes("t.xp + r.xpReward"), "el XP de los retos no se suma del catálogo");
    afirmar(pag.includes("t.monedas + r.coinReward"), "el mon de los retos no se suma del catálogo");
    afirmar(pag.includes("r.target > max ? r.target : max"), "la meta mayor no se deriva del catálogo");
    // la línea de la sección compuesta COMPLETA en JS (lección v256)
    afirmar(pag.includes("const lineaCatalogo = `El segundo catálogo de la casa — ${RETOS.length} retos diarios con ${cifra.format(BOTIN_RETOS.xp)} XP y ${cifra.format(BOTIN_RETOS.monedas)} mon de botín, metas de 1 a ${META_MAYOR}`"), "la línea del catálogo no se compone COMPLETA en JS");
    afirmar(pag.includes("EL SEGUNDO CATÁLOGO"), "la cabeza del catálogo desapareció");
    afirmar(pag.includes("botín: +${r.xpReward} XP · +${r.coinReward} mon"), "el botín de cada reto no se compone en JS");
    afirmar(pag.includes("el catálogo vive en la fuente"), "la vitrina no declara la procedencia del catálogo");
    // el segundo catálogo no inventa fechas (guardia v234)
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la vitrina escribe fechas a mano en la ronda v270!");
  });

  await verificar("EL SEGUNDO CATÁLOGO viva: el SSR sirve los 9 retos con su botín derivado y las anclas en pie (v270)", async () => {
    const r = await pedir("/objetivos");
    afirmar(r.status === 200, `/objetivos no 200 en v270 (${r.status})`);
    afirmar(r.texto.includes("EL SEGUNDO CATÁLOGO"), "el segundo catálogo no viaja en el SSR");
    afirmar(r.texto.includes("9 retos diarios con 330 XP y 280 mon de botín, metas de 1 a 5"), "la línea derivada del catálogo no viaja (330 XP · 280 mon · metas 1→5)");
    // las cabezas reales de la fuente, no resúmenes
    for (const cabeza of ["Patrulla matinal", "Caza de amenazas", "Coleccionista de cables", "Verificador de campo", "Analista certero", "Profeta", "Sintesis avanzada", "Explorador global", "Operador CCTV"]) {
      afirmar(r.texto.includes(cabeza), `el reto «${cabeza}» no viaja`);
    }
    afirmar(r.texto.includes("DC-1 · Patrulla matinal"), "la firma del reto no se compone con su id real");
    // el botín de celdas reales, compuesto en JS desde la fuente
    afirmar(r.texto.includes("botín: +50 XP · +45 mon · meta: 1"), "el botín de DC-7 no viaja compuesto");
    afirmar(r.texto.includes("botín: +45 XP · +40 mon · meta: 3"), "el botín de DC-9 no viaja compuesto");
    // las anclas v235, v267 y v268 siguen en pie
    afirmar(r.texto.includes("La balanza del botín"), "la balanza v235 desapareció");
    afirmar(r.texto.includes("EL CABLEADO DEL APARATO"), "el cableado v267 desapareció");
    afirmar(r.texto.includes("LA JORNADA"), "la jornada v268 desapareció");
  });

  // ── v268.0 EL RITMO DE LA CASA: las 19 misiones del aparato viajan en SSR ──
  // La vitrina contaba el botín (v235) y el cableado (v267) pero nunca el
  // RITMO: MISSION_TEMPLATES (19 misiones — 9 diarias, 5 semanales, 2
  // especiales, 3 capítulos de campaña) solo vivía client-side.
  await verificar("EL RITMO DE LA CASA estática: censo y botín derivados de la fuente, capítulos con puertas reales (v268)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    const pag = readFileSync(join(RAIZ, "src/app/objetivos/page.tsx"), "utf8");
    // la fuente intacta: 19 misiones con code y category
    afirmar(fuente.includes("export const MISSION_TEMPLATES"), "la fuente de misiones no existe");
    const iniM = fuente.indexOf("export const MISSION_TEMPLATES");
    const bloqueM = fuente.slice(iniM, fuente.indexOf("];", iniM) + 2);
    const nMisiones = (bloqueM.match(/code: "/g) || []).length;
    afirmar(nMisiones >= 19, `el catálogo de misiones se encoge (${nMisiones})`);
    // la vitrina consume la fuente y deriva TODO con filter/reduce
    // (aserto evolucionado de línea exacta a intención reforzada, lección v268:
    //  el import crece ronda a ronda — lo que no cambia es QUE el nombre viaja
    //  dentro de las llaves del import de la fuente única)
    afirmar(/import \{[^}]*\bMISSION_TEMPLATES\b[^}]*\} from "@\/lib\/game-data"/.test(pag), "la vitrina no consume MISSION_TEMPLATES");
    afirmar(pag.includes("MISIONES.filter((m) => m.category === cat)"), "el censo por ritmo no se deriva (filter)");
    afirmar(pag.includes("monedas: t.monedas + m.coinReward"), "el botín del ritmo no se suma del catálogo (reduce)");
    afirmar(pag.includes("MISIONES.filter((m) => m.category === \"STORY\")"), "los capítulos no salen del catálogo");
    // la línea de la sección compuesta COMPLETA en JS (lección v256)
    afirmar(pag.includes("const lineaRitmo = `La jornada de la casa — ${MISIONES.length} misiones vivas: ${CENSO_RITMO[0].n} cada día, ${CENSO_RITMO[1].n} cada semana, ${CENSO_RITMO[2].n} especiales y ${CENSO_RITMO[3].n} capítulos de campaña`"), "la línea del ritmo no se compone COMPLETA en JS");
    // los capítulos abren sus salas: puerta real con el conflictTag de la fuente + vacío honesto
    afirmar(pag.includes("href={`/conflicto/${m.conflictTag}`}"), "los capítulos no abren sus salas");
    afirmar(pag.includes("{m.conflictTag && ("), "el capítulo sin sala pinta puerta falsa");
    afirmar(pag.includes("LA JORNADA"), "la cabeza de la jornada desapareció");
    // cero fechas escritas a mano (guardia v234)
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la vitrina escribe fechas a mano en la ronda v268!");
  });

  await verificar("EL RITMO DE LA CASA viva: el SSR sirve la jornada, el botín derivado y las salas de campaña (v268)", async () => {
    const r = await pedir("/objetivos");
    afirmar(r.status === 200, `/objetivos no 200 en v268 (${r.status})`);
    afirmar(r.texto.includes("LA JORNADA"), "la jornada no viaja en el SSR");
    afirmar(r.texto.includes("19 misiones vivas: 9 cada día, 5 cada semana, 2 especiales y 3 capítulos de campaña"), "la línea derivada del ritmo no viaja");
    afirmar(r.texto.includes("cada día ×9"), "el censo del ritmo diario no viaja");
    afirmar(r.texto.includes("la campaña ×3"), "el censo de la campaña no viaja");
    // el botín derivado (280 mon la jornada diaria, 1100 la semanal — sumas reales del catálogo)
    afirmar(r.texto.includes("+280 mon◉"), "el botín diario derivado no viaja");
    afirmar(r.texto.includes("+1100 mon◉"), "el botín semanal derivado no viaja (cifra es-ES real)");
    // las puertas de campaña: las 3 salas reales del archivo
    for (const sala of ["/conflicto/ukraine", "/conflicto/gaza", "/conflicto/sudan"]) {
      afirmar(r.texto.includes(`la sala del capítulo: ${sala}`), `la campaña no abre ${sala}`);
    }
    afirmar(r.texto.includes("Capitulo 1 — Kiev bajo asedio"), "el capítulo 1 no viaja");
    // las anclas v235 y v267 siguen en pie
    afirmar(r.texto.includes("La balanza del botín"), "la balanza v235 desapareció");
    afirmar(r.texto.includes("EL CABLEADO DEL APARATO"), "el cableado v267 desapareció");
  });

  // ── v269.0 EL MAPA DEL ARCHIVO: el sitemap anuncia el archivo entero ──
  // La cota de v207 (500) se quedó corta: el archivo medido es 1877 y 1377
  // puertas /noticia quedaban fuera del mapa de Google. Y las páginas
  // profundas del archivo (v261, canónicas cada una) no viajaban al mapa.
  // El tamaño de página vive en la FUENTE (teatros.ts): sala y mapa derivan
  // con el mismo número.
  await verificar("EL MAPA DEL ARCHIVO estática: el sitemap anuncia el archivo entero y las páginas profundas derivadas de la count real (v269)", () => {
    const sm = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    const cat = readFileSync(join(RAIZ, "src/lib/teatros.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/conflicto/[tag]/page.tsx"), "utf8");
    // la fuente única del tamaño de página: el catálogo declara, sala y mapa consumen
    afirmar(cat.includes("export const PAGE_SIZE_ARCHIVO = 40"), "el catálogo no declara el tamaño de página del archivo");
    afirmar(sala.includes("const PAGE_SIZE = PAGE_SIZE_ARCHIVO"), "la sala no consume el tamaño de la fuente única");
    afirmar(sm.includes("PAGE_SIZE_ARCHIVO"), "el sitemap no consume el tamaño de la fuente única");
    // el archivo entero: la cota declarada (2000) supera el archivo medido (1877)
    afirmar(sm.includes("const PUERTAS_NOTICIA = 2000"), "el sitemap no declara la cota del archivo entero");
    afirmar(!sm.includes("take: 500"), "el sitemap sigue cortando el archivo a la cota vieja");
    // las páginas profundas: derivadas de la count real, nunca inventadas
    afirmar(sm.includes("Math.ceil(g._count.conflictTag / PAGE_SIZE_ARCHIVO)"), "las páginas profundas no se derivan de la count real");
    afirmar(sm.includes("?page=${p}"), "sin puertas a las páginas profundas del archivo");
    // lastModified honesto: la última señal real del teatro, no una fecha fingida (guardia v234)
    afirmar(sm.includes("_max: { publishedAt: true }"), "la groupBy del mapa no mide la última señal");
    afirmar(sm.includes("new Date(ultima)"), "el mapa no usa la última señal real como lastModified");
  });

  // ── v267.0 EL CABLEADO DEL APARATO: qué señal del estado alimenta cada bloque ──
  // La vitrina dice desde v235 «los 100 se cazan aquí» pero nunca declaró
  // QUÉ alimenta cada bloque. La directiva v266 manda: el mapa se declara
  // EN LA FUENTE (CABLEADO_BLOQUES, game-data.ts) y la vitrina lo sirve.
  await verificar("EL CABLEADO DEL APARATO estática: la fuente declara el mapa y la vitrina lo sirve compuesto en JS (v267)", () => {
    const fuente = readFileSync(join(RAIZ, "src/lib/game-data.ts"), "utf8");
    const pag = readFileSync(join(RAIZ, "src/app/objetivos/page.tsx"), "utf8");
    // el mapa vive EN LA FUENTE, con las 9 parejas de bloques declaradas
    afirmar(fuente.includes("export const CABLEADO_BLOQUES"), "el mapa de alimentación no vive en la fuente única");
    const bloques = ["PROGRESO", "INTEL", "COMBATE", "GUERRA", "MERCADO", "GANANCIAS", "VIGILANCIA", "SOCIAL", "ESPECIAL"];
    const ini = fuente.indexOf("export const CABLEADO_BLOQUES");
    const mapa = fuente.slice(ini, fuente.indexOf("];", ini) + 2);
    for (const b of bloques) {
      afirmar(mapa.includes(`bloque: "${b}"`), `el cableado no declara el bloque ${b}`);
    }
    // CRUCE HONESTO: por cada pareja (bloque, campo) declarada debe existir
    // un logro real con esa category que lea ese s.<campo> — el mapa no
    // puede declarar ficción
    const logros = fuente.split("\n").filter((l) => l.includes("category:") && l.includes("check:"));
    const parejas = [...mapa.matchAll(/\{ bloque: "(\w+)", alimento: \[(.*?)\] \}/g)];
    let parejasTotales = 0;
    for (const [, bloque, alimento] of parejas) {
      for (const campo of [...alimento.matchAll(/campo: "(\w+)"/g)].map((m) => m[1])) {
        parejasTotales++;
        const evidencia = logros.some((l) => l.includes(`category: "${bloque}"`) && l.includes(`s.${campo}`));
        afirmar(evidencia, `la pareja ${bloque}←${campo} no tiene logro real que la respalde`);
      }
    }
    afirmar(parejasTotales >= 37, `el cableado se encoge (${parejasTotales} parejas)`);
    // la vitrina consume la fuente y compone las líneas COMPLETAS en JS (lección v256)
    // (aserto evolucionado de línea exacta a intención reforzada, lección v268)
    afirmar(/import \{[^}]*\bCABLEADO_BLOQUES\b[^}]*\} from "@\/lib\/game-data"/.test(pag), "la vitrina no consume el cableado de la fuente");
    afirmar(pag.includes("const lineaCableado = `El cableado del aparato — ${SENALES} señales del estado alimentan los ${CABLEADO_BLOQUES.length} bloques de la vitrina`"), "la línea del cableado no se compone COMPLETA en JS");
    afirmar(pag.includes('const alimento = c.alimento.map((a) => a.nombre).join(" · ")'), "el alimento de cada bloque no se compone en JS");
    afirmar(pag.includes("EL CABLEADO DEL APARATO"), "la cabeza del cableado desapareció");
    afirmar(pag.includes("se alimenta de: "), "los bloques no declaran su alimento");
    // cero fechas escritas a mano (guardia v234)
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la vitrina escribe fechas a mano en la ronda v267!");
  });

  await verificar("EL CABLEADO DEL APARATO viva: el SSR sirve el mapa de alimentación con las anclas v235 en pie (v267)", async () => {
    const r = await pedir("/objetivos");
    afirmar(r.status === 200, `/objetivos no 200 en v267 (${r.status})`);
    afirmar(r.texto.includes("EL CABLEADO DEL APARATO"), "el cableado no viaja en el SSR");
    afirmar(r.texto.includes("39 señales del estado alimentan los 10 bloques"), "la línea derivada del mapa no viaja (39 señales · 10 bloques)");
    afirmar(r.texto.includes("se alimenta de: nivel · pestañas visitadas"), "PROGRESO no declara su alimento real");
    afirmar(r.texto.includes("se alimenta de: cámaras operando · eventos captados"), "VIGILANCIA no declara su alimento real");
    afirmar(r.texto.includes("El mapa vive en la fuente"), "la vitrina no dice dónde vive el mapa");
    // las anclas v235 (balanza, censo, mapa de caza) siguen en pie
    afirmar(r.texto.includes("La balanza del botín"), "la balanza v235 desapareció");
    afirmar(r.texto.includes("El mapa de caza"), "el mapa de caza v235 desapareció");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "la conexión con el núcleo desapareció");
  });

  // ── v266.0 EL TELETIPO DE LA CASA: los despachos reales de la agencia en SSR ──
  // El mural tiene su teletipo GDELT client-side (frente-total-sim, fetch
  // /api/geo-tablero): sin JavaScript no viaja despacho alguno. La casa
  // tiene SU propia agencia (481 cables etiquetados de los 5 frentes
  // documentados): los 8 más frescos viajan ahora en el SSR.
  await verificar("EL TELETIPO DE LA CASA estática: el archivo de la agencia en SSR, acotado y compuesto en JS (v266)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/ver-guerra/page.tsx"), "utf8");
    // los despachos salen del archivo de la casa: acotados a los frentes documentados, frescos primero
    afirmar(pag.includes("where: { conflictTag: { in: Object.values(FRENTE_A_TEATRO) } }"), "los despachos no se acotan a los frentes documentados del mural");
    afirmar(pag.includes("orderBy: { publishedAt: \"desc\" }"), "los despachos no llegan frescos primero");
    afirmar(pag.includes("take: 8"), "el teletipo de la casa no está acotado");
    // vacío honesto: sin despachos la sección ni se pinta
    afirmar(pag.includes("{despachos.length > 0 && ("), "la sección del teletipo no respeta el vacío honesto");
    // lección v256: la línea de la sección compuesta COMPLETA en JS
    afirmar(pag.includes("const lineaTeletipo = `el cable de la casa — ${despachos.length} despachos reales de los frentes documentados`"), "la línea del teletipo no se compone COMPLETA en JS");
    afirmar(pag.includes("{lineaTeletipo}"), "la sección no sirve la línea compuesta");
    // las puertas: cada despacho lleva a su cable y declara su frente
    afirmar(pag.includes("href={`/noticia/${d.id}`}"), "la puerta al despacho real desapareció");
    afirmar(pag.includes("{nombreDeTag[d.conflictTag] ?? d.conflictTag}"), "el despacho no declara su frente");
    // la edad con la gramática de la casa (textoEdad), la hora exacta con Intl
    afirmar(pag.includes("textoEdad(Date.now() - new Date(d.publishedAt).getTime())"), "la edad del despacho no usa la gramática de la casa");
    afirmar(pag.includes("horaExacta(new Date(d.publishedAt))"), "la hora exacta del despacho no usa el aparato Intl");
    afirmar(pag.includes("EL TELETIPO DE LA AGENCIA"), "la cabeza del teletipo de la agencia desapareció");
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡ver-guerra escribe fechas a mano en la ronda v266!");
  });

  await verificar("EL TELETIPO DE LA CASA viva: el SSR sirve despachos reales de la agencia con sus puertas (v266)", async () => {
    const r = await pedir("/ver-guerra");
    afirmar(r.status === 200, `/ver-guerra no 200 en v266 (${r.status})`);
    afirmar(r.texto.includes("EL TELETIPO DE LA AGENCIA"), "el teletipo de la agencia no viaja en el SSR");
    afirmar(r.texto.includes("el cable de la casa"), "la línea del teletipo no viaja en el SSR");
    afirmar(r.texto.includes("despachos reales"), "el peso del teletipo no se declara");
    afirmar(r.texto.includes("/noticia/"), "ningún despacho real lleva a su cable");
    // las anclas del puente y la edad del frente (v229/v257) siguen en pie
    afirmar(r.texto.includes("cables en la agencia"), "el puente v229 desapareció");
    afirmar(r.texto.includes("no inventa puertas"), "la honestidad v229 desapareció");
    afirmar(r.texto.includes("● última señal"), "la edad del frente v257 desapareció");
  });

  // ── v265.0 EL PÓRTICO DE LAS SALAS: la puerta que las 9 salas nunca tuvieron ──
  // Desde v206 cada teatro vive en /conflicto/[tag], pero la raíz /conflicto
  // era un 404: las salas solo se alcanzaban por puertas laterales (chips,
  // mural, «Otros teatros», sitemap). El pórtico las sirve EN SERVER: cards
  // del catálogo canónico, UNA groupBy (_count + _max, patrón v257/v262),
  // cero findMany — y la puerta se anuncia en el sitemap.
  await verificar("EL PÓRTICO DE LAS SALAS estática: catálogo canónico, una groupBy con dos medidas y líneas compuestas en JS (v265)", () => {
    const portico = readFileSync(join(RAIZ, "src/app/conflicto/page.tsx"), "utf8");
    const sm = readFileSync(join(RAIZ, "src/app/sitemap.ts"), "utf8");
    // las cards salen del catálogo canónico (la misma fuente única)
    afirmar(portico.includes("Object.entries(TEATROS).map"), "las salas del pórtico no salen del catálogo canónico");
    // UNA consulta con dos medidas: el censo, no las filas
    afirmar(portico.includes("by: [\"conflictTag\"]"), "la groupBy del pórtico no agrupa por etiqueta");
    afirmar(portico.includes("_count: { _all: true }"), "la groupBy del pórtico no cuenta");
    afirmar(portico.includes("_max: { publishedAt: true }"), "la groupBy del pórtico no mide la última señal");
    afirmar(portico.includes("conflictTag: { in: Object.keys(TEATROS) }"), "la groupBy no se acota a los teatros del catálogo");
    afirmar(!portico.includes("findMany"), "¡el pórtico consultó filas de más (el censo no necesita findMany)!");
    // el peso del pórtico: suma real de los conteos, cero números a mano
    afirmar(portico.includes("const totalPuerta = conteos"), "el peso del pórtico no se deriva de los conteos");
    afirmar(portico.includes("const lineaPortico = totalPuerta"), "la línea del pórtico no se compone en JS");
    afirmar(portico.includes("El pórtico de las salas — ${salas} salas, ${totalPuerta} cables con puerta en el archivo"), "la línea del pórtico no declara peso y salas compuestos en JS");
    // lección v256: la línea de cada sala compuesta COMPLETA en JS
    afirmar(portico.includes("${medicion.conteo} cables en el archivo · última señal hace ${hace(new Date(medicion.ultima))}"), "la línea de peso/edad de la sala no se compone COMPLETA en JS");
    // vacío honesto: sin medición la línea ni se pinta (el pórtico sigue en pie)
    afirmar(portico.includes("{lineaSala && ("), "la sala sin medición no respeta el vacío honesto");
    // las dos puertas por sala: la sala y el planeta 3D
    afirmar(portico.includes("href={`/conflicto/${k}`}"), "la puerta a la sala desapareció del pórtico");
    afirmar(portico.includes("href={`/mundo?teatro=${k}`}"), "la puerta al planeta 3D desapareció del pórtico");
    // las claves v263 viajan: el pórtico declara las palabras que abren la puerta
    afirmar(portico.includes("sus palabras: ${t.claves.slice(0, 4).join(\" · \")}"), "el pórtico no declara las palabras de cada sala");
    // la señal más fresca, derivada de las mediciones ya hechas
    afirmar(portico.includes("la señal más fresca de las salas: ${fresca.nombre} — última señal hace ${hace(fresca.ultima)}"), "la línea de la señal fresca no se compone en JS");
    // la puerta se anuncia a Google (la raíz ya no es 404)
    afirmar(sm.includes("url: `${SITE_URL}/conflicto`,"), "el sitemap no anuncia el pórtico de las salas");
    // JSON-LD CollectionPage + ItemList de las salas
    afirmar(portico.includes('"@type": "CollectionPage"') && portico.includes('"@type": "ItemList"'), "el pórtico perdió su JSON-LD de colección");
    // la edad de la casa, cero fechas a mano
    afirmar(portico.includes("function hace(fecha: Date): string {"), "sin la edad de la casa para el pórtico");
    afirmar(!/20\d\d-\d\d-\d\d/.test(portico), "¡el pórtico escribe fechas a mano en la ronda v265!");
  });

  await verificar("EL PÓRTICO DE LAS SALAS viva: la raíz /conflicto sirve las 9 puertas con peso real y señal fresca (v265)", async () => {
    const r = await pedir("/conflicto");
    afirmar(r.status === 200, `/conflicto no 200 en v265 (${r.status}) — la raíz seguía siendo 404`);
    // la línea compuesta y las puertas de las salas viajan en el HTML
    afirmar(r.texto.includes("Las salas del conflicto"), "la cabeza del pórtico no viaja en el SSR");
    afirmar(r.texto.includes("El pórtico de las salas"), "la línea del pórtico no viaja en el SSR");
    afirmar(r.texto.includes("cables con puerta"), "el peso del pórtico no se declara");
    // las 9 puertas deterministas (el catálogo es la fuente): primera, segunda y la más pequeña
    afirmar(r.texto.includes('href="/conflicto/ukraine"'), "la puerta de Ucrania desapareció del pórtico");
    afirmar(r.texto.includes('href="/conflicto/gaza"'), "la puerta de Gaza desapareció del pórtico");
    afirmar(r.texto.includes('href="/conflicto/lebanon"'), "la puerta de Líbano desapareció del pórtico");
    // BD medida en esta ronda: las 9 salas tienen señal (la más vieja, 3 cables)
    afirmar(r.texto.includes("cables en el archivo"), "el peso de las salas no se declara en el SSR");
    afirmar(r.texto.includes("última señal hace"), "la edad de las salas no se declara en el SSR");
    // las claves canónicas viajan (deterministas: salen del catálogo)
    afirmar(r.texto.includes("sus palabras: ucrania"), "las palabras de la sala de Ucrania no viajan");
    // la señal más fresca: gaza (medida en la ronda: 2026-10-31, la más reciente)
    afirmar(r.texto.includes("la señal más fresca de las salas"), "la señal fresca no se declara");
    afirmar(r.texto.includes("Gaza e Israel"), "el nombre humano de la sala fresca no viaja");
    // las anclas de la casa siguen en pie
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "sin el bloque de puertas al núcleo");
  });

  // ── v264.0 EL ÍNDICE DEL PLANETA: los teatros del mapa con puerta ──
  // /mundo (v215) sostenía la instantánea viva (peso 24 h, último titular y
  // fuente por teatro) pero su capa server nunca sirvió las puertas: sin
  // JS el planeta era un hueco y para Google los teatros eran un párrafo
  // sin enlaces. El índice deriva TODO de la instantánea (cero consultas)
  // y declara honesto el teatro sin señal en 24 h (BD medida: 96 h sin
  // cable nuevo — las 9 salas quedan abiertas).
  await verificar("EL ÍNDICE DEL PLANETA estática: derivado de la instantánea, cero consultas, compuesto en JS (v264)", () => {
    const mundo = readFileSync(join(RAIZ, "src/app/mundo/page.tsx"), "utf8");
    // cero roundtrips: el índice deriva de la instantánea que ya viajaba
    afirmar(mundo.includes("inicial.teatros.map((t) => {"), "el índice no deriva de la instantánea del primer byte");
    afirmar(!mundo.includes("db.newsItem"), "¡el índice consultó la BD de nuevo (roundtrips de más)!");
    // las dos puertas por teatro: la sala y el titular
    afirmar(mundo.includes("href={`/conflicto/${t.slug}`}"), "la puerta a la sala del teatro desapareció del índice");
    afirmar(mundo.includes("href={`/noticia/${t.ultimo.id}`}"), "la puerta al último titular desapareció del índice");
    // lección v256: peso y edad compuestos COMPLETOS en JS
    afirmar(mundo.includes("const lineaIndice = `El índice del planeta — ${teatros} teatros vivos, ${hoy} cables en las últimas 24 h`"), "la línea del índice no se compone COMPLETA en JS");
    afirmar(mundo.includes("const linea = t.ultimo"), "la línea de peso/edad del teatro no se compone en JS");
    afirmar(mundo.includes("const firma = t.ultimo"), "la firma del titular no se compone en JS");
    // vacío honesto: el teatro sin señal declara su ausencia y su sala abierta
    afirmar(mundo.includes('"sin señal en 24 h — la sala queda abierta"'), "el teatro sin señal no declara su ausencia");
    // sin BD la sección ni se pinta (vacío honesto, ley de la casa)
    afirmar(mundo.includes("{inicial && ("), "la sección del índice no respeta el vacío de la instantánea");
    // la edad con la gramática de la casa, cero fechas a mano
    afirmar(mundo.includes("function hace(fecha: string): string {"), "sin la edad de la casa para la señal");
    afirmar(!/20\d\d-\d\d-\d\d/.test(mundo), "¡el mundo escribe fechas a mano en la ronda v264!");
  });

  await verificar("EL ÍNDICE DEL PLANETA viva: las 9 salas con puerta en el SSR y el silencio de 24 h declarado honesto (v264)", async () => {
    const r = await pedir("/mundo");
    afirmar(r.status === 200, `/mundo no 200 en v264 (${r.status})`);
    // la línea compuesta y las puertas de las salas viajan en el HTML
    afirmar(r.texto.includes("El índice del planeta"), "el índice del planeta no viaja en el SSR");
    afirmar(r.texto.includes('href="/conflicto/ukraine"'), "la puerta a la sala de Ucrania desapareció del índice");
    afirmar(r.texto.includes('href="/conflicto/gaza"'), "la puerta a la sala de Gaza desapareció del índice");
    // BD medida en esta ronda: 96 h sin cable nuevo — el vacío es el estado
    // honesto del planeta y el índice lo declara (con la sala abierta)
    afirmar(r.texto.includes("sin señal en 24 h"), "el silencio de 24 h no se declara honesto en el SSR");
    // las anclas del planeta (v215) siguen en pie
    afirmar(r.texto.includes("EL MUNDO 3D"), "la cabeza del planeta desapareció");
    afirmar(r.texto.includes("Espiar los gobiernos"), "la casa completa desapareció");
  });

  // ── v263.0 EL ARCHIVO QUE CRECE: los sin etiqueta citan su sala ──
  // El 74 % del archivo (1396 cables) no tenía puerta a ninguna sala aunque
  // sus propias palabras citaran el teatro. El catálogo canónico lleva sus
  // CLAVES, la sala las cruza EN LECTURA (pool acotado, cero escritura en la
  // BD) y pinta hasta 6 candidatos declarando qué palabras abrieron cada
  // puerta. Solo en la página 1: las hondas no pagan la consulta.
  await verificar("EL ARCHIVO QUE CRECE estática: claves canónicas, pool acotado y candidatos compuestos en JS (v263)", () => {
    const cat = readFileSync(join(RAIZ, "src/lib/teatros.ts"), "utf8");
    const sala = readFileSync(join(RAIZ, "src/app/conflicto/[tag]/page.tsx"), "utf8");
    // el catálogo canónico lleva las claves de sus 9 teatros (una sola fuente)
    afirmar((cat.match(/claves: \[/g) || []).length === 9, "el catálogo no lleva las claves de sus 9 teatros");
    afirmar(cat.includes('"kremlin"'), "las claves de ucrania no citan al Kremlin");
    afirmar(cat.includes('"babel-mandeb"'), "las claves de redsea no citan Babel-Mandeb");
    afirmar(cat.includes('"hezbolá"'), "las claves de lebanon no citan a Hezbolá");
    afirmar(cat.includes('"jartum"'), "las claves de sudan no citan Jartum");
    // el hallazgo es EN LECTURA: pool acotado de sin etiqueta, cero escritura
    afirmar(sala.includes("const POOL_SIN_ETIQUETA = 1000"), "el pool de sin etiqueta no está acotado ni declarado");
    afirmar(sala.includes("conflictTag: null"), "el pool no consulta los cables sin etiqueta");
    // el cruce en JS: acentos y mayúsculas con toLowerCase, cero trucos SQL
    afirmar(sala.includes("const texto = `${r.title} ${r.summary ?? \"\"}`.toLowerCase()"), "el cruce no normaliza el texto del cable con toLowerCase");
    afirmar(sala.includes("citadas.length > 0"), "sin el filtro honesto de claves citadas");
    afirmar(sala.includes(".slice(0, 6)"), "la sala no acota sus candidatos a 6");
    // solo la cabeza de la sala paga la consulta
    afirmar(sala.includes("page === 1 ? await getCandidatos(teatro.claves) : []"), "las páginas hondas del archivo pagan la consulta de candidatos");
    // lección v256: la línea de la sección se compone COMPLETA en JS
    afirmar(sala.includes("const lineaCandidatos = `El archivo que crece — ${candidatos.length} cables sin etiqueta citan esta sala`"), "la línea de candidatos no se compone COMPLETA en JS");
    afirmar(sala.includes("{lineaCandidatos}"), "la sección no sirve la línea compuesta");
    // vacío honesto: sin candidatos la sección ni se pinta
    afirmar(sala.includes("candidatos.length > 0 && ("), "la sección no respeta el vacío honesto");
    // la derivación transparente: cada candidato declara qué abrió la puerta
    afirmar(sala.includes("citan: {c.citadas.join(\" · \")}"), "el candidato no declara qué palabras abrieron su puerta");
    afirmar(sala.includes("SIN ETIQUETA"), "el candidato no declara que carece de etiqueta");
    afirmar(sala.includes("La casa no escribe"), "la declaración de un solo escritor no viaja en la sección");
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas a mano en la ronda v263!");
  });

  await verificar("EL ARCHIVO QUE CRECE viva: la sala de ucrania abre puertas a los sin etiqueta y las páginas hondas no pagan la sección (v263)", async () => {
    const r = await pedir("/conflicto/ukraine");
    afirmar(r.status === 200, `/conflicto/ukraine no 200 en v263 (${r.status})`);
    // la sección viaja con su línea compuesta y sus chips transparentes
    afirmar(r.texto.includes("El archivo que crece"), "la sección de candidatos no viaja en el SSR");
    afirmar(r.texto.includes("sin etiqueta citan esta sala"), "la línea de candidatos no declara su peso");
    afirmar(r.texto.includes("SIN ETIQUETA"), "los candidatos no declaran que carecen de etiqueta");
    afirmar(r.texto.includes("citan:"), "los candidatos no declaran qué palabras abrieron su puerta");
    // las anclas de la sala completa (v261) siguen en pie
    afirmar(r.texto.includes("página 1 de 5"), "la paginación v261 desapareció");
    afirmar(r.texto.includes("Los frentes del teatro"), "el despliegue v227 desapareció");
    // las páginas hondas no pagan la sección (solo la cabeza de la sala)
    const r2 = await pedir("/conflicto/ukraine?page=2");
    afirmar(r2.status === 200, `/conflicto/ukraine?page=2 no 200 en v263 (${r2.status})`);
    afirmar(!r2.texto.includes("El archivo que crece"), "la sección de candidatos se repite en las páginas hondas");
    afirmar(r2.texto.includes("página 2 de 5"), "la paginación v261 no sobrevive en la página 2");
  });

  // ── v262.0 EL CANAL QUE PESA: los chips de la Primera página hablan ──
  // /guerra-hoy (v35+v202+v206+v208+v213+v239+v251) es la puerta de Google
  // para «guerra hoy» y sus chips solo decían el nombre: la MISMA groupBy
  // gana DOS medidas (patrón v256/v257), cada chip declara peso y edad, y
  // el canal gana su declaración de frescura (gramática v259).
  await verificar("EL CANAL QUE PESA estática: la misma groupBy con dos medidas y los chips compuestos en JS (v262)", () => {
    const canal = readFileSync(join(RAIZ, "src/app/guerra-hoy/page.tsx"), "utf8");
    // la MISMA groupBy, DOS medidas (cero roundtrips de más)
    afirmar(canal.includes("_count: { conflictTag: true }"), "la count del teatro no viaja en la groupBy");
    afirmar(canal.includes("_max: { publishedAt: true }"), "sin la última señal en la MISMA groupBy (roundtrips de más)");
    // los chips hablan: peso + edad, compuestos COMPLETOS en JS (lección v256)
    afirmar(canal.includes("const chip = `${t.nombre} · ${t.n}`"), "el chip no declara su peso compuesto en JS");
    afirmar(canal.includes("`● última señal ${hace(t.ultima)}`"), "el chip no declara la edad de su teatro");
    afirmar(canal.includes("edadMin < 48 * 60"), "el umbral de frescura no es el de la casa (48 h, v256/v257)");
    afirmar(canal.includes('fresca ? "text-amber-300" : "text-zinc-500"'), "el color de la edad no usa la regla de la casa");
    // la señal más fresca del canal: la cabeza de la muestra, cero consultas
    afirmar(canal.includes("const masFresca = items[0] ?? null"), "la señal más fresca no se deriva de la cabeza de la muestra");
    afirmar(canal.includes("la señal más fresca del canal"), "el canal no declara su señal más fresca");
    // la hora exacta del patrón Intl, cero fechas a mano
    afirmar(canal.includes('toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })'), "la hora exacta del title no se formatea con Intl");
    afirmar(!/20\d\d-\d\d-\d\d/.test(canal), "¡el canal escribe fechas a mano en la ronda v262!");
  });

  await verificar("EL CANAL QUE PESA viva: los chips del SSR declaran peso y edad, y el canal declara su señal más fresca (v262)", async () => {
    const r = await pedir("/guerra-hoy");
    afirmar(r.status === 200, `/guerra-hoy no 200 en v262 (${r.status})`);
    // el chip con peso real de la BD y su edad — CIFRA VIVA (v310): la casa
    // ingesta en cada refresco, el peso del teatro respira (ucrania nació 173
    // en la v262 y hoy camina); la ley exige que el chip lo DECLARE
    const chipUcrania = r.texto.match(/Ucrania · (\d+)/);
    afirmar(chipUcrania !== null, "el chip de Ucrania no declara su peso real");
    if (chipUcrania) {
      afirmar(Number(chipUcrania[1]) >= 1, `el peso del teatro midió ${chipUcrania[1]} (un teatro vivo pesa ≥ 1)`);
    }
    afirmar(/última señal hace/.test(r.texto), "la edad de los teatros no viaja en el SSR");
    afirmar(r.texto.includes("Teatros en vivo"), "la fila de chips v206 desapareció");
    afirmar(r.texto.includes('href="/conflicto/ukraine"'), "la puerta a la sala del teatro desapareció");
    // la declaración de frescura del canal (gramática v259)
    afirmar(r.texto.includes("la señal más fresca del canal"), "el SSR no sirve la declaración de frescura");
    // las anclas de la Primera página siguen en pie
    afirmar(r.texto.includes("GUERRA HOY"), "la cabeza del canal desapareció");
    afirmar(r.texto.includes("historias en seguimiento"), "el contador de historias desapareció");
    afirmar(r.texto.includes("/noticia/"), "la puerta de lectura v202 desapareció");
  });

  // ── v261.0 LA SALA COMPLETA: el archivo del teatro se pagina en el
  // servidor, cero JS ──
  // /conflicto/[tag] (v206+v215+v218+v222+v227+v238) medía «N cables en la
  // agencia» pero solo encendía 40 — ucrania guardaba 173 y 133 no tenían
  // puerta. La count real manda las páginas, fuera de rango es 404 limpio,
  // la última señal se mide sobre TODO el archivo y cada página es
  // canónica a sí misma.
  await verificar("LA SALA COMPLETA estática: el archivo se pagina en el servidor con la count real, cero JS (v261)", () => {
    const sala = readFileSync(join(RAIZ, "src/app/conflicto/[tag]/page.tsx"), "utf8");
    // la paginación server-side: skip, count y páginas derivadas
    afirmar(sala.includes("searchParams"), "la sala no recibe la página pedida");
    afirmar(sala.includes("const PAGE_SIZE = PAGE_SIZE_ARCHIVO"), "sin tamaño de página declarado en la fuente única (v269)");
    afirmar(sala.includes("skip: (page - 1) * PAGE_SIZE"), "la paginación no salta las páginas anteriores");
    afirmar(sala.includes("Math.ceil(total / PAGE_SIZE)"), "sin el número de páginas derivado de la count real");
    afirmar(sala.includes("?page="), "sin puertas a las páginas siguientes");
    afirmar(sala.includes('aria-current={p === page ? "page" : undefined}'), "la página activa no se declara (aria-current)");
    // fuera de rango es 404 limpio — nada vacío para Google
    afirmar(sala.includes("if (!Number.isInteger(pedida) || pedida < 1) notFound()"), "una página mal pedida no es 404 limpio");
    afirmar(sala.includes("if (pedida > paginas) notFound()"), "una página más allá del archivo no es 404 limpio");
    // la última señal del ARCHIVO, no la de la página
    afirmar(sala.includes("db.newsItem.findFirst"), "la última señal de la cabecera no consulta el archivo entero");
    afirmar(sala.includes("const fechaUltima = ultimaSenal ?? (items[0] ? new Date(items[0].publishedAt) : null)"), "la cabecera sigue midiendo la cabeza de la página");
    // lección v256: la cabecera también se compone COMPLETA en JS
    afirmar(sala.includes("{fechaUltima && ` · última señal hace ${hace(fechaUltima)}`}"), "la cabecera no compone su línea COMPLETA en JS");
    // canonical por página (Google indexa el archivo entero)
    afirmar(sala.includes("alternates: { canonical: canon }"), "sin canonical por página");
    afirmar(sala.includes('` — página ${page}`'), "el title no declara la página");
    // lección v256: la línea del nav se compone COMPLETA en JS antes del JSX
    afirmar(sala.includes("const lineaPaginacion = `página ${page} de ${paginas} — ${total} cables en el archivo del teatro`"), "la línea del nav no se compone COMPLETA en JS (SSR intercalaría <!-- -->)");
    afirmar(sala.includes("{lineaPaginacion}"), "el nav no sirve la línea compuesta");
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas a mano en la ronda v261!");
  });

  await verificar("LA SALA COMPLETA viva: ukraine pagina su archivo real, la 2 sirve otros cables y la cortina no sirve sala (v261)", async () => {
    const p1 = await pedir("/conflicto/ukraine");
    afirmar(p1.status === 200, `/conflicto/ukraine no 200 (${p1.status})`);
    // LAS CIFRAS VIVAS (v310): el archivo respira (la casa ingesta cada
    // refresco; ucrania nació 173 en la v261 y hoy camina). La ley verifica
    // la DERIVACIÓN (páginas = techo(peso / 40 — la count real manda)) y el
    // ACUERDO DE SALAS (el chip del canal y la sala miden el MISMO archivo),
    // jamás un congelamiento del aliento de la BD.
    const pesoSala = p1.texto.match(/(\d+) cables en el archivo del teatro/);
    afirmar(pesoSala !== null, "el nav no declara el peso real del archivo");
    const paginasDeclaradas = p1.texto.match(/página 1 de (\d+)/);
    afirmar(paginasDeclaradas !== null, "la sala no declara su paginación real");
    if (pesoSala && paginasDeclaradas) {
      const nPeso = Number(pesoSala[1]);
      const nPag = Number(paginasDeclaradas[1]);
      afirmar(nPeso >= 1, `el peso del teatro midió ${nPeso} (un teatro con sala vive) `);
      afirmar(nPag === Math.ceil(nPeso / 40), `la paginación mintió: ${nPag} páginas para ${nPeso} cables (la count real manda)`);
      // EL ACUERDO DE SALAS: el chip del canal y la sala ven el mismo archivo
      const canal = await pedir("/guerra-hoy");
      const chipCanal = canal.texto.match(/Ucrania · (\d+)/);
      afirmar(chipCanal !== null && Number(chipCanal[1]) === nPeso, `el chip del canal (${chipCanal ? chipCanal[1] : "?"}) y la sala (${nPeso}) no se ponen de acuerdo`);
    }
    // la puerta a la página 2 existe si y solo si hay más de una página
    const hayMas = paginasDeclaradas && Number(paginasDeclaradas[1]) >= 2;
    afirmar(hayMas === p1.texto.includes('href="/conflicto/ukraine?page=2"'), "la puerta a la página 2 no obedece a la paginación real");
    if (hayMas) {
      afirmar(p1.texto.includes("siguiente ▶"), "sin la señal de la página siguiente");
      // la página 2: otros cables, con su anterior y su lugar declarado
      const p2 = await pedir("/conflicto/ukraine?page=2");
      afirmar(p2.status === 200, `página 2 → ${p2.status} (la paginación declaró ${paginasDeclaradas[1]} páginas)`);
      afirmar(p2.texto.includes(`página 2 de ${paginasDeclaradas[1]}`), "la segunda página no declara su lugar");
      afirmar(p2.texto.includes("◀ anterior"), "sin la puerta de vuelta");
      afirmar(p2.texto.includes('href="/conflicto/ukraine"'), "el anterior no vuelve al limpio");
      afirmar(p2.texto.includes('href="/conflicto/ukraine?page=3"') === (Number(paginasDeclaradas[1]) >= 3), "la puerta a la página 3 no obedece a la paginación real");
    }
    // fuera de rango: la cortina de la casa, sin sala — NADA de contenido
    // indexable (Next 16 sirve el notFound en streaming con 200 en TODA la
    // casa: un tag desconocido de v206 y una /noticia inexistente se
    // comportan igual, medido en esta ronda — lo que importa es que la sala
    // vacía jamás viaja: ni paginación, ni cables, ni nav)
    const fuera = await pedir("/conflicto/ukraine?page=99");
    afirmar(!/página 1 de \d+/.test(fuera.texto) && !fuera.texto.includes("cables en el archivo"), "¡la página 99 sirve una sala vacía!");
    afirmar(!fuera.texto.includes("Los frentes del teatro"), "¡la página 99 sirve el despliegue de una sala que no existe!");
    const mala = await pedir("/conflicto/ukraine?page=abc");
    afirmar(!/página 1 de \d+/.test(mala.texto) && !mala.texto.includes("cables en el archivo"), "¡la página abc sirve una sala vacía!");
    // las anclas de la sala siguen en pie
    afirmar(p1.texto.includes("Los frentes del teatro"), "el despliegue v227 desapareció");
    afirmar(p1.texto.includes("CONECTA CON EL NÚCLEO"), "el núcleo v218 desapareció");
    afirmar(p1.texto.includes("/assets/real/thumbs/"), "las thumbs v238 desaparecieron");
  });

  // ── v260.0 LA SALA DEL TEATRO: la puerta de lectura declara el peso de su
  // teatro y las relacionadas hablan humano ──
  // /noticia/[id] (v202+v208+v211+v252, la página más vestida de la casa)
  // no decía CUÁNTO pesaba el teatro del cable ni a qué sala iban las
  // relacionadas: UNA count con índice (v209), el catálogo canónico (v259)
  // y la hora exacta del patrón Intl de la casa.
  await verificar("LA SALA DEL TEATRO estática: la count real, el catálogo humano y la hora Intl (v260)", () => {
    const pag = readFileSync(join(RAIZ, "src/app/noticia/[id]/page.tsx"), "utf8");
    // la count con índice y su vacío honesto (sin tag ni BD, la línea ni se pinta)
    afirmar(pag.includes("async function getConteoTeatro"), "la count del teatro no vive en su fuente");
    afirmar(pag.includes("db.newsItem.count({ where: { conflictTag: tag } })"), "el conteo no consulta la BD real");
    afirmar(pag.includes("if (!tag) return 0;"), "sin tag se consulta de más — cero consultas de más");
    afirmar(pag.includes("conteoTeatro > 0 && it.conflictTag"), "la línea del conteo no tiene su vacío honesto");
    afirmar(pag.includes("Promise.all(["), "la count y las relacionadas no corren en paralelo (roundtrips de más)");
    afirmar(pag.includes("cables en este teatro"), "la puerta de lectura no declara el peso de su teatro");
    // el catálogo canónico con su fallback honesto (gramática v259)
    afirmar(pag.includes('from "@/lib/teatros"'), "la puerta de lectura no lee el catálogo canónico");
    afirmar(pag.includes("TEATROS[r.conflictTag]?.nombre ?? r.conflictTag"), "las relacionadas no hablan humano");
    // la hora exacta: el patrón Intl de la casa, cero fechas a mano
    afirmar(pag.includes('toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })'), "la firma no lleva la hora exacta del patrón Intl");
    afirmar(!/20\d\d-\d\d-\d\d/.test(pag), "¡la puerta de lectura escribe fechas a mano en la ronda v260!");
  });

  await verificar("LA SALA DEL TEATRO viva: un cable real de ucrania declara su conteo y sus relacionadas hablan humano (v260)", async () => {
    // determinista: un cable sacado de /conflicto/ukraine TIENE el tag por construcción
    const sala = await pedir("/conflicto/ukraine");
    afirmar(sala.status === 200, `/conflicto/ukraine no 200 (${sala.status})`);
    const m = sala.texto.match(/\/noticia\/[a-z0-9]+/i);
    afirmar(Boolean(m), "la sala del teatro no expone ninguna puerta /noticia/<id>");
    const r = await pedir(m[0]);
    afirmar(r.status === 200, `la puerta ${m[0]} no responde`);
    afirmar(r.texto.includes("cables en este teatro"), "el SSR no sirve el conteo del teatro");
    afirmar(r.texto.includes('href="/conflicto/ukraine"'), "la puerta a la sala del teatro no viaja en el HTML");
    afirmar(r.texto.includes("Ucrania"), "las relacionadas no llevan el nombre humano del catálogo");
    // las anclas de la puerta de lectura siguen en pie
    afirmar(r.texto.includes('aria-label="Escuchar este cable"'), "la voz v252 desapareció");
    afirmar(r.texto.includes("fetchPriority"), "el hero v247 perdió su prioridad LCP");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "el núcleo v218 desapareció");
  });

  // ── v259.0 EL TEATRO CON NOMBRE: la tercera sala de guerra habla humano ──
  // /en-vivo (v213 EL PULSO + v254 EL LATIDO QUE RESPETA) medía el planeta
  // en cinco cifras y filtraba por tags crudos; su propio stat frescoMin
  // viajaba en el payload sin ser leído NINGUNA vez. Ahora declara «la
  // señal más fresca de la sala: [fuente] — última señal hace X» (la MISMA
  // gramática del espejo v256 y del puente v257) y sus teatros leen el
  // catálogo canónico de la casa (src/lib/teatros.ts, la fuente única de
  // /conflicto/[tag] y el sitemap) — con fallback honesto, nunca inventado.
  await verificar("EL TEATRO CON NOMBRE estática: la sala declara su señal más fresca y sus teatros hablan humano (v259)", () => {
    const sala = readFileSync(join(RAIZ, "src/app/en-vivo/sala-en-vivo.tsx"), "utf8");
    // los teatros con nombre del catálogo canónico, con fallback honesto
    afirmar(sala.includes('from "@/lib/teatros"'), "la sala no lee el catálogo canónico de teatros");
    afirmar(sala.includes("TEATROS[tag]?.nombre ?? tag"), "los chips de filtro no hablan humano ni con fallback honesto");
    afirmar(sala.includes("TEATROS[c.conflicto]?.nombre ?? c.conflicto"), "los chips de la línea del tiempo no hablan humano");
    // la declaración de frescura: gramática v256/v257, compuesta COMPLETA en JS
    afirmar(sala.includes("const masFresca = cables[0] ?? null"), "la señal más fresca no se deriva de la cabeza de la muestra");
    afirmar(sala.includes("la señal más fresca de la sala"), "la sala no declara su señal más fresca");
    afirmar(sala.includes("edadViva(masFresca.fecha).toLowerCase()"), "la edad no se compone COMPLETA en JS antes del JSX (lección v256)");
    afirmar(sala.includes('frescoMin <= 15 ? "text-amber-300" : "text-zinc-500"'), "el color de la declaración no usa la MISMA regla del rompiendo");
    afirmar(sala.includes('toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })'), "la hora exacta del title no se formatea con Intl");
    afirmar(!/20\d\d-\d\d-\d\d/.test(sala), "¡la sala escribe fechas a mano en la ronda v259!");
  });

  await verificar("EL TEATRO CON NOMBRE vivo: el SSR de la sala sirve la declaración y el nombre humano (v259)", async () => {
    const r = await pedir("/en-vivo");
    afirmar(r.status === 200, `en-vivo no 200 en v259 (${r.status})`);
    afirmar(r.texto.includes("la señal más fresca de la sala"), "el SSR no sirve la declaración de frescura");
    // la edad puede ser «hace N» o «ahora mismo» según la señal — la gramática manda
    afirmar(/última señal (hace|ahora)/.test(r.texto), "la gramática de las tres salas no viaja en el SSR");
    // nombre humano medido en la muestra 60 de esta ronda: gaza → «Gaza e Israel»
    afirmar(r.texto.includes("Gaza e Israel"), "el teatro del catálogo no viaja con su nombre humano");
    // las anclas de la sala siguen en pie
    afirmar(r.texto.includes("PAUSAR EL LATIDO"), "el botón del latido desapareció");
    afirmar(r.texto.includes("sondeado hace"), "el reloj del sondeo desapareció");
    afirmar(r.texto.includes("EL PULSO — ÚLTIMA HORA DEL MUNDO"), "la cabeza de la sala desapareció");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "en-vivo: CONECTA ausente del SSR");
  });

  // ── v258.0 EL VÉRTIGO QUE HABLA: la cuarta señal — el feed más vivo de
  // la casa era el único mudo (la sala de lectura habla desde v252). La
  // boca es la MISMA (speechSynthesis del aparato): una sola voz a la vez,
  // la voz PERTENECE A LA PIEZA — al deslizar calla —, cancel() al
  // desmontar, y el aparato mudo se DECLARA una vez. Ley v190: nada suena
  // sin UN TOQUE.
  await verificar("EL VÉRTIGO QUE HABLA: la cuarta señal con la voz que pertenece a la pieza (v258)", () => {
    const feed = readFileSync(join(RAIZ, "src/app/vertigo/vertigo-feed.tsx"), "utf8");
    // la misma boca v252 y su toggle honesto con los dos estados
    afirmar(feed.includes("window.speechSynthesis"), "el feed no usa la voz del aparato");
    afirmar(feed.includes("SpeechSynthesisUtterance"), "sin utterance no hay lectura");
    afirmar(feed.includes('u.lang = "es-ES"'), "la voz del feed no es la española");
    afirmar(feed.includes('vozId === c.id ? "🔇" : "🔊"'), "la cuarta señal no alterna su estado");
    afirmar(feed.includes('vozId === c.id ? "Parar" : "Oír"'), "la etiqueta de la voz no alterna");
    afirmar(feed.includes('aria-label={vozId === c.id ? "Parar la voz de este cable" : "Escuchar este cable"}'), "la cuarta señal sin su aria-label alternante");
    // una sola voz a la vez y la voz que calla al deslizar
    afirmar(feed.includes("const [vozId, setVozId] = useState(\"\")"), "sin el estado de la voz única");
    afirmar(feed.includes("if (vozId && visible && visible !== vozId) pararVoz()"), "la voz se queda hablando de la pieza anterior al deslizar");
    // el feed jamás deja una voz huérfana y el aparato mudo se declara
    afirmar(feed.includes("window.speechSynthesis?.cancel()"), "el feed puede dejar una voz huérfana al desmontar");
    afirmar(feed.includes("Tu aparato no tiene voz para leer"), "sin la declaración honesta del aparato mudo");
    // la cuarta señal no dispara el doble toque de la pieza
    afirmar(feed.includes("stopPropagation"), "la voz dispara el doble toque de la pieza");
  });

  await verificar("EL VÉRTIGO QUE HABLA vivo: el SSR del feed sirve la cuarta señal (v258)", async () => {
    const r = await pedir("/vertigo");
    afirmar(r.status === 200, `/vertigo no 200 en v258 (${r.status})`);
    afirmar(r.texto.includes('aria-label="Escuchar este cable"'), "el SSR no sirve la cuarta señal");
    afirmar(r.texto.includes("Oír"), "el SSR no sirve la etiqueta de la voz");
    // la declaración honesta NO viaja en el SSR (nace con la voz callada, cero mismatch)
    afirmar(!r.texto.includes("Tu aparato no tiene voz"), "la declaración del aparato mudo nace visible (mismatch)");
    // las anclas viejas del feed siguen en pie
    afirmar(r.texto.includes('aria-label="Compartir este cable"'), "la tercera señal desapareció");
    afirmar(r.texto.includes("LA SALA DEL MUNDO"), "la última estación desapareció");
    afirmar(r.texto.includes("Leer completo"), "la puerta de lectura desapareció");
  });

  // ── v251.0 EL REFUGIO CON MEMORIA: el último parte del aparato ──
  await verificar("EL REFUGIO CON MEMORIA: el centinela deja la copia y el refugio la talla sin fingir que es vivo (v251)", () => {
    const centinela = readFileSync(join(RAIZ, "src/components/vanguard/centinela-parte.tsx"), "utf8");
    afirmar(centinela.includes("vg-ultimo-parte"), "el centinela no escribe la memoria del aparato");
    afirmar(centinela.includes("guardado: Date.now()"), "la copia no viaja con su hora");
    const portada = readFileSync(join(RAIZ, "src/app/guerra-hoy/page.tsx"), "utf8");
    afirmar(portada.includes("CentinelaParte"), "la primera página no deja copia para el refugio");
    const refugio = readFileSync(join(RAIZ, "src/app/offline/page.tsx"), "utf8");
    afirmar(refugio.includes("vg-ultimo-parte"), "el refugio no lee la memoria del aparato");
    afirmar(refugio.includes("vg-parte-guardado"), "sin muro para el último parte");
    afirmar(refugio.includes("dangerouslySetInnerHTML"), "el parte no viaja inline (chunks que quizá nunca se cachean)");
    afirmar(refugio.includes("Intl.DateTimeFormat"), "la hora del guardado no se formatea");
    afirmar(refugio.includes("memoria del aparato, no la red"), "sin la confesión honesta");
    afirmar(!/20\d\d-\d\d-\d\d/.test(refugio), "¡el refugio escribe fechas a mano!");
  });

  await verificar("EL REFUGIO CON MEMORIA viva: el script y el muro viajan en el HTML del refugio (v251)", async () => {
    const r = await pedir("/offline");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("No hay conexión"), "el refugio perdió su verdad");
    afirmar(r.texto.includes("vg-ultimo-parte"), "el script del parte no viaja en el HTML");
    afirmar(r.texto.includes("vg-parte-guardado"), "el muro del parte no está en el HTML");
    afirmar(r.texto.includes("memoria del aparato, no la red"), "la confesión no viaja en el HTML");
    const portada = await pedir("/guerra-hoy");
    afirmar(portada.status === 200, "la primera página no responde");
    afirmar(portada.texto.includes("GUERRA HOY"), "la portada perdió su cabeza");
  });

  // ── v252.0 LA SALA QUE HABLA: escuchar y compartir en la puerta de lectura ──
  await verificar("LA SALA QUE HABLA: la isla trae la voz honesta y el patrón de compartir (v252)", () => {
    const isla = readFileSync(join(RAIZ, "src/app/noticia/[id]/voz-cable.tsx"), "utf8");
    // LA VOZ: speechSynthesis del aparato, es-ES, cancel en desmontaje,
    // y la declaración honesta cuando el aparato es mudo
    afirmar(isla.includes("speechSynthesis"), "la isla no usa la voz del aparato");
    afirmar(isla.includes("SpeechSynthesisUtterance"), "sin utterance no hay lectura");
    afirmar(isla.includes('lang = "es-ES"'), "la voz de la casa no es la española");
    afirmar(isla.includes("speechSynthesis?.cancel()"), "la sala puede dejar una voz huérfana");
    afirmar(isla.includes("no tiene voz para leer"), "sin la declaración honesta del aparato mudo");
    afirmar(isla.includes('aria-label="Escuchar este cable"'), "sin la señal de escuchar");
    // COMPARTIR: el patrón v250 exacto
    afirmar(isla.includes("navigator.share"), "sin Web Share API");
    afirmar(isla.includes("navigator.clipboard.writeText"), "sin portapapeles de respaldo");
    afirmar(isla.includes("Enlace copiado"), "sin aviso de copia");
    afirmar(isla.includes('aria-label="Compartir este cable"'), "sin la señal de compartir");
    // LA SALA MONTA LA ISLA con el cable real
    const sala = readFileSync(join(RAIZ, "src/app/noticia/[id]/page.tsx"), "utf8");
    afirmar(sala.includes("VozCable"), "la puerta de lectura no monta la isla");
    afirmar(sala.includes('url={`${SITE_URL}/noticia/${it.id}`}'), "la isla no viaja con el canónico real");
  });

  await verificar("LA SALA QUE HABLA viva: el SSR de un cable real sirve la voz y la salida (v252)", async () => {
    const portada = await pedir("/guerra-hoy");
    const m = portada.texto.match(/\/noticia\/[a-z0-9]+/i);
    afirmar(Boolean(m), "la portada no expone ninguna puerta /noticia/<id>");
    const r = await pedir(m[0]);
    afirmar(r.status === 200, `la sala ${m[0]} no responde`);
    afirmar(r.texto.includes('aria-label="Escuchar este cable"'), "el SSR no sirve la voz");
    afirmar(r.texto.includes("▶ Escuchar"), "el SSR no sirve la etiqueta de la voz");
    afirmar(r.texto.includes('aria-label="Compartir este cable"'), "el SSR no sirve la salida");
    // las pieles v247 siguen en pie en la misma sala
    afirmar(r.texto.includes("fetchPriority"), "el hero perdió su prioridad LCP");
  });

  // ── v269.0 EL MAPA DEL ARCHIVO viva: el mapa de Google sirve el archivo entero ──
  await verificar("EL MAPA DEL ARCHIVO viva: el sitemap sirve las puertas del archivo y las páginas profundas (v269)", async () => {
    const r = await pedir("/sitemap.xml");
    afirmar(r.status === 200, "el sitemap no responde");
    const puertas = (r.texto.match(/\/noticia\//g) || []).length;
    afirmar(puertas >= 1800, `el mapa solo anuncia ${puertas} puertas de noticia — el archivo entero no viaja`);
    // ucrania (173 cables medidos en v261 → 5 páginas) declara sus páginas profundas
    afirmar(r.texto.includes("/conflicto/ukraine?page=2"), "el mapa no anuncia la página profunda de ucrania");
    // la página 1 no se anuncia dos veces (su canónica es al limpio — v261)
    afirmar(!r.texto.includes("/conflicto/ukraine?page=1"), "el mapa anuncia la página 1 dos veces");
  });

  // el muro al final: quema la cuota de esta IP
  await verificar("muro v211: la ráfaga recibe 429", async () => {
    let vio429 = false;
    for (let i = 0; i < 40; i++) {
      const r = await pedir(`/api/nucleo/busqueda?q=prueba${i}`);
      if (r.status === 429) { vio429 = true; break; }
    }
    afirmar(vio429, "40 búsquedas seguidas sin 429 — el muro no existe");
  });
}

// ─────────────────────────────────────────────────────────────
const t0 = Date.now();
await parteA();
await parteB();
console.log(`\n════════════════════════════════════════`);
console.log(`  PASAN ${pasan} · FALLAN ${fallan} · ${Date.now() - t0} ms`);
if (fallan > 0) {
  console.log("\n  EL DUEÑO MANDÓ: si las pruebas básicas fallan, no hay cambios masivos.");
  fallos.forEach((f) => console.log(`   · ${f}`));
  process.exit(1);
}
console.log("  EL NÚCLEO ESTÁ EN PIE: censo, búsqueda, relaciones y navegación ✓");
