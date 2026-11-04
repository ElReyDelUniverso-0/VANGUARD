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
import { readFileSync, existsSync } from "node:fs";
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
    return { status: r.status, texto, json };
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
  await verificar("servidor vivo y en v236.0", async () => {
    const r = await pedir(`/api/health?qa=${Math.floor(Math.random() * 1e9)}`);
    afirmar(r.json?.ok === true, "health no responde ok");
    afirmar(String(r.json?.version).startsWith("v236"), `versión ${r.json?.version} ≠ v236`);
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
    afirmar(pag.includes("Los 100 se cazan aquí"), "el mapa no dice la verdad del aparato");
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
