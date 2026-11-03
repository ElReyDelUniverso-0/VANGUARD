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

  await verificar("9 tipos de entidad con la fórmula vg:<tipo>:<clave>", () => {
    const tipos = readFileSync(join(RAIZ, "src/lib/nucleo/tipos.ts"), "utf8");
    for (const t of ["pais", "region", "acontecimiento", "documento", "fuente", "mapa", "analisis", "simulacion", "noticia"]) {
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
  await verificar("servidor vivo y en v223.0", async () => {
    const r = await pedir(`/api/health?qa=${Math.floor(Math.random() * 1e9)}`);
    afirmar(r.json?.ok === true, "health no responde ok");
    afirmar(String(r.json?.version).startsWith("v223"), `versión ${r.json?.version} ≠ v223`);
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

  await verificar("LA LUPA: «bajmut» lleva al MAPA DEL FRENTE con su fuente OSINT citada", async () => {
    const r = await pedir("/api/nucleo/busqueda?q=bajmut");
    afirmar(r.status === 200 && r.json?.ok === true, "no ok");
    const f = (r.json.resultados ?? []).find((x) => x.titulo?.startsWith("Frente:") && x.ruta === "/ver-guerra");
    afirmar(Boolean(f), "la ciudad del frente (sala de guerra v129/v220) no es buscable");
    afirmar(f.origen === "fnt:teatros", "el frente no declara su fuente");
    afirmar(String(f.subtitulo).includes("OSINT"), "el frente no cita la procedencia del mapa");
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

  await verificar("los chips contextuales viven en /conflicto/ukraine", async () => {
    const r = await pedir("/conflicto/ukraine");
    afirmar(r.status === 200, "no 200");
    afirmar(r.texto.includes("CONECTA CON EL NÚCLEO"), "chips ausentes en la ficha de teatro");
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
