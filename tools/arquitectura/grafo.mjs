#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v414.0 · EL GRAFO DE LA CASA — quién depende de quién
//
// Uso:  node tools/arquitectura/grafo.mjs
//
// Lee dos fuentes que ya existen (no inventa nada):
//   · src/lib/arquitectura/censo.json  — cada ruta con los ficheros que la citan
//   · src/lib/nucleo/registro.ts       — cada módulo con sus dependencias declaradas
//
// Y escribe src/lib/arquitectura/grafo.json con:
//   ① las ÁREAS (primer nivel de src/app, src/lib, src/components) y su peso real;
//   ② la MATRIZ de acoplamiento área → área, contada con enlaces observados;
//   ③ los CICLOS de enlace (componentes fuertemente conexas) — informativos,
//      porque en navegación un ciclo no es un error: es una ida y vuelta;
//   ④ las áreas AISLADAS (sin entradas ni salidas) y las CENTRALES (más peso);
//   ⑤ las DEPENDENCIAS ROTAS del censo de módulos (apuntan a algo que no existe).
//
// Por qué así: escanear los 3.072 ficheros del árbol cuesta minutos y memoria;
// el censo ya trae las referencias contadas y el registro ya trae las
// dependencias declaradas. Cruzarlos da el grafo sin volver a leer el repo.
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const CENSO = join(RAIZ, "src/lib/arquitectura/censo.json");
const REGISTRO = join(RAIZ, "src/lib/nucleo/registro.ts");
const SALIDA = join(RAIZ, "src/lib/arquitectura/grafo.json");

if (!existsSync(CENSO)) {
  console.error("Falta el censo. Ejecuta antes: node tools/arquitectura/censar.mjs");
  process.exit(1);
}

const censo = JSON.parse(readFileSync(CENSO, "utf8"));
const registro = existsSync(REGISTRO) ? readFileSync(REGISTRO, "utf8") : "";

/** Área de un fichero del árbol: «app/editorial», «lib/nucleo», «components/planeta». */
function areaDe(fichero) {
  const partes = String(fichero).split("/");
  if (partes.length < 2) return "raíz";
  return `${partes[0]}/${partes[1]}`;
}

/** Área dueña de una ruta: la carpeta de primer nivel de src/app. */
function areaDeRuta(ruta) {
  const trozos = String(ruta).split("/").filter(Boolean);
  if (trozos.length === 0) return "app/(portada)";
  if (trozos[0] === "api") return "api/" + (trozos[1] ?? "");
  return "app/" + trozos[0];
}

const areas = new Map();
const matriz = new Map(); // "desde→hacia" -> n
const sumar = (mapa, clave, n = 1) => mapa.set(clave, (mapa.get(clave) ?? 0) + n);

const asegurar = (id) => {
  if (!areas.has(id)) {
    const tipo = id.startsWith("app/") || id.startsWith("api/") ? "ruta" : "soporte";
    areas.set(id, { id, tipo, rutas: 0, enlacesSalientes: 0, enlacesEntrantes: 0, paginas: 0, api: 0 });
  }
  return areas.get(id);
};

for (const r of censo.rutas) {
  const duena = areaDeRuta(r.ruta);
  const a = asegurar(duena);
  a.rutas += 1;
  if (r.tipo === "api") a.api += 1;
  else a.paginas += 1;

  // la ruta es citada desde N ficheros: cada uno acopla su área con la dueña
  const fuentes = Array.isArray(r.desde) ? r.desde : [];
  a.enlacesEntrantes += fuentes.length;
  for (const f of fuentes) {
    const origen = areaDe(f);
    asegurar(origen);
    asegurar(origen).enlacesSalientes += 1;
    sumar(matriz, `${origen}→${duena}`);
  }
}

// ── matriz ordenada y acoplamiento ──────────────────────────────────
const acoplamientos = [...matriz.entries()]
  .map(([clave, n]) => {
    const [desde, hacia] = clave.split("→");
    return { desde, hacia, n };
  })
  .sort((a, b) => b.n - a.n);

// ── ciclos (componentes fuertemente conexas, Tarjan iterativo) ──────
const nodos = [...areas.keys()].sort();
const adyacencia = new Map(nodos.map((n) => [n, []]));
for (const { desde, hacia } of acoplamientos) {
  if (desde !== hacia && adyacencia.has(desde) && adyacencia.has(hacia)) adyacencia.get(desde).push(hacia);
}

function componentesConexas() {
  const indice = new Map();
  const bajo = new Map();
  const enPila = new Set();
  const pila = [];
  const salida = [];
  let siguiente = 0;

  for (const raiz of nodos) {
    if (indice.has(raiz)) continue;
    const trabajo = [{ n: raiz, i: 0 }];
    while (trabajo.length) {
      const cima = trabajo[trabajo.length - 1];
      const { n } = cima;
      if (cima.i === 0) {
        indice.set(n, siguiente);
        bajo.set(n, siguiente);
        siguiente += 1;
        pila.push(n);
        enPila.add(n);
      }
      const vecinos = adyacencia.get(n) ?? [];
      if (cima.i < vecinos.length) {
        const v = vecinos[cima.i];
        cima.i += 1;
        if (!indice.has(v)) trabajo.push({ n: v, i: 0 });
        else if (enPila.has(v)) bajo.set(n, Math.min(bajo.get(n), indice.get(v)));
        continue;
      }
      trabajo.pop();
      if (trabajo.length) {
        const padre = trabajo[trabajo.length - 1].n;
        bajo.set(padre, Math.min(bajo.get(padre), bajo.get(n)));
      }
      if (bajo.get(n) === indice.get(n)) {
        const comp = [];
        let v;
        do {
          v = pila.pop();
          enPila.delete(v);
          comp.push(v);
        } while (v !== n);
        if (comp.length > 1) salida.push(comp.sort());
      }
    }
  }
  return salida.sort((a, b) => b.length - a.length);
}

// ── registro de módulos: dependencias declaradas ────────────────────
const modulos = [...registro.matchAll(/id:\s*"(mod:[^"]+)"/g)].map((m) => m[1]);
const declaradas = [...registro.matchAll(/dependencias:\s*\[([^\]]*)\]/g)].map((m) =>
  [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1])
);
const refs = declaradas.flat();
const existentes = new Set([...modulos, ...new Set(refs.map((r) => r))]);
const rotas = [...new Set(refs)].filter((r) => r.startsWith("mod:") && !modulos.includes(r));

// ── huecos que el grafo puede ver ───────────────────────────────────
const huerfanas = censo.rutas.filter((r) => r.tipo === "pagina" && (r.referencias ?? 0) === 0).map((r) => r.ruta);
// puertas de API que nadie llama: el árbol las tiene, ningún fichero las cita.
const apiSinConsumidor = censo.rutas.filter((r) => r.tipo === "api" && (r.referencias ?? 0) === 0).map((r) => r.ruta);
// páginas que solo se alcanzan desde un sitio: existen, pero están a un enlace de caerse.
const paginasDeUnEnlace = censo.rutas.filter((r) => r.tipo === "pagina" && (r.referencias ?? 0) === 1).map((r) => r.ruta);
// las cinco puertas más usadas del árbol (por consumidores distintos, no por llamadas)
const apiMasUsadas = censo.rutas
  .filter((r) => r.tipo === "api")
  .sort((a, b) => (b.referencias ?? 0) - (a.referencias ?? 0))
  .slice(0, 8)
  .map((r) => ({ ruta: r.ruta, consumidores: r.referencias ?? 0 }));

const peso = (a) => a.enlacesEntrantes + a.enlacesSalientes;

const grafo = {
  version: "v414.0",
  generado: new Date().toISOString().slice(0, 10),
  fuente: {
    censo: `src/lib/arquitectura/censo.json · ${censo.fecha} · ${censo.paginas} páginas · ${censo.rutasApi} rutas de API`,
    registro: `${modulos.length} módulos · ${refs.length} dependencias declaradas`,
  },
  areas: [...areas.values()].sort((a, b) => peso(b) - peso(a)),
  acoplamientos: acoplamientos.slice(0, 60),
  // un ciclo de enlace no es un error: es una ida y vuelta entre salas.
  ciclosDeEnlace: componentesConexas().slice(0, 12),
  registro: {
    modulos: modulos.length,
    dependencias: refs.length,
    unicas: new Set(refs).size,
    rotas,
  },
  huecos: { huerfanas, apiSinConsumidor, paginasDeUnEnlace, apiMasUsadas },
};

writeFileSync(SALIDA, JSON.stringify(grafo, null, 2) + "\n", "utf8");

const centrales = grafo.areas.filter((a) => a.tipo === "ruta").slice(0, 5).map((a) => `${a.id}(${peso(a)})`);
console.log(`grafo.json escrito · ${grafo.areas.length} áreas · ${acoplamientos.length} acoplamientos · ${grafo.ciclosDeEnlace.length} ciclos de enlace`);
console.log(`  áreas centrales: ${centrales.join(" · ")}`);
console.log(`  dependencias rotas: ${rotas.length ? rotas.join(", ") : "ninguna"}`);
console.log(`  huérfanas: ${huerfanas.length ? huerfanas.join(", ") : "ninguna"}`);
console.log(`  puertas de API que nadie cita: ${apiSinConsumidor.length ? apiSinConsumidor.slice(0, 6).join(", ") : "ninguna"} · páginas de un solo enlace: ${paginasDeUnEnlace.length}`);
if (existentes.size) console.log(`  módulos y funciones referenciadas: ${existentes.size}`);
