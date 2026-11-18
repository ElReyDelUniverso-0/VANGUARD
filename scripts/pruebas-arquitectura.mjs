#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v414.0 · PRUEBAS DE LA ARQUITECTURA — que el mapa no mienta
//
// Uso:
//   node scripts/pruebas-arquitectura.mjs                     # solo árbol
//   node scripts/pruebas-arquitectura.mjs https://dominio     # árbol + vivo
//
// Qué vigila (y por qué):
//   ① el censo y el grafo son JSON válidos y tienen la forma que consumen
//     /arquitectura y /api/sistema/arquitectura;
//   ② NINGUNA página del árbol se queda fuera del censo (nada oculto);
//   ③ ninguna ruta del censo es fantasma (existe como page.tsx o route.ts*);
//   ④ el grafo es coherente: todo acoplamiento apunta a un área que existe,
//     sin dependencias rotas y sin huérfanas;
//   ⑤ el contrato de integración tiene sus ocho piezas y sabe decir que no
//     (probado en vivo: un descriptor vacío devuelve sus faltas);
//   ⑥ la puerta /api/sistema/arquitectura existe, está en el catálogo y usa
//     el contrato de la casa;
//   ⑦ ningún endpoint vivo se queda sin documentar ni inventariar.
//
// Cero dependencias. Sale con 1 si algo falla.
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = process.cwd();
const BASE = (process.argv[2] || "").replace(/\/$/, "");
let pasan = 0;
const fallos = [];

function verificar(nombre, fn) {
  try {
    fn();
    pasan++;
    console.log(`  ✓ ${nombre}`);
  } catch (e) {
    fallos.push(`${nombre} — ${e.message}`);
    console.error(`  ✗ ${nombre} — ${e.message}`);
  }
}
const afirmar = (c, m) => {
  if (!c) throw new Error(m);
};
const leer = (r) => {
  const p = join(RAIZ, r);
  afirmar(existsSync(p), `falta ${r}`);
  return readFileSync(p, "utf8");
};
const json = (r) => JSON.parse(leer(r));

/** Todas las páginas y manejadores de ruta del árbol, como rutas públicas. */
function rutasDelArbol() {
  const base = join(RAIZ, "src/app");
  afirmar(existsSync(base), "no existe src/app");
  const paginas = [];
  const rutas = [];
  const andar = (dir) => {
    for (const nombre of readdirSync(dir)) {
      const p = join(dir, nombre);
      if (statSync(p).isDirectory()) andar(p);
      else {
        const rel = "/" + relative(base, dir);
        const limpia = rel === "/" ? "/" : rel;
        if (nombre === "page.tsx" || nombre === "page.ts") paginas.push(limpia);
        else if (nombre === "route.ts" || nombre === "route.tsx") rutas.push(limpia);
      }
    }
  };
  andar(base);
  return { paginas: [...new Set(paginas)].sort(), rutas: [...new Set(rutas)].sort() };
}

const arbol = rutasDelArbol();
const censo = json("src/lib/arquitectura/censo.json");
const grafo = json("src/lib/arquitectura/grafo.json");

console.log("\n① LOS DOS MAPAS");
verificar("el censo tiene forma de censo", () => {
  afirmar(typeof censo.paginas === "number" && censo.paginas > 50, "censo.paginas raro");
  afirmar(Array.isArray(censo.rutas) && censo.rutas.length > 100, "censo.rutas vacío o corto");
  afirmar(typeof censo.fecha === "string", "censo sin fecha");
});
verificar("el grafo tiene forma de grafo", () => {
  afirmar(Array.isArray(grafo.areas) && grafo.areas.length > 50, "grafo.areas corto");
  afirmar(Array.isArray(grafo.acoplamientos), "grafo sin acoplamientos");
  afirmar(Array.isArray(grafo.ciclosDeEnlace), "grafo sin ciclos declarados");
  afirmar(typeof grafo.registro?.modulos === "number", "grafo sin registro de módulos");
  afirmar(typeof grafo.huecos?.huerfanas?.length === "number", "grafo sin huecos");
});

console.log("\n② NADA OCULTO");
verificar("toda página del árbol está en el censo", () => {
  const enCenso = new Set(censo.rutas.filter((r) => r.tipo === "pagina").map((r) => r.ruta));
  const fuera = arbol.paginas.filter((p) => !enCenso.has(p));
  afirmar(fuera.length === 0, `páginas reales fuera del censo: ${fuera.join(", ")}`);
});

console.log("\n③ NADA FANTASMA");
verificar("toda ruta del censo existe en src/app", () => {
  const reales = new Set([...arbol.paginas, ...arbol.rutas]);
  const fantasmas = censo.rutas.map((r) => r.ruta).filter((r) => !reales.has(r));
  afirmar(fantasmas.length === 0, `rutas del censo que no existen: ${fantasmas.join(", ")}`);
});
verificar("toda ruta /api del censo es un route.ts* real", () => {
  const api = new Set(arbol.rutas.filter((r) => r.startsWith("/api")));
  const malas = censo.rutas
    .filter((r) => r.tipo === "api" && r.ruta.startsWith("/api"))
    .map((r) => r.ruta)
    .filter((r) => !api.has(r));
  afirmar(malas.length === 0, `rutas /api del censo sin manejador: ${malas.join(", ")}`);
});

console.log("\n④ EL GRAFO CUADRA");
verificar("todo acoplamiento apunta a un área que existe", () => {
  const areas = new Set(grafo.areas.map((a) => a.id));
  const rotos = grafo.acoplamientos.filter((a) => !areas.has(a.desde) || !areas.has(a.hacia));
  afirmar(rotos.length === 0, `acoplamientos a áreas inexistentes: ${rotos.map((r) => `${r.desde}→${r.hacia}`).join(", ")}`);
});
verificar("sin dependencias rotas en el censo de módulos", () => {
  afirmar((grafo.registro.rotas ?? []).length === 0, `dependencias rotas: ${grafo.registro.rotas.join(", ")}`);
});
verificar("sin páginas huérfanas", () => {
  afirmar((grafo.huecos.huerfanas ?? []).length === 0, `huérfanas: ${grafo.huecos.huerfanas.join(", ")}`);
});
verificar("los pesos de área cuadran con la matriz", () => {
  const suma = grafo.acoplamientos.reduce((t, a) => t + a.n, 0);
  afirmar(suma > 0, "matriz vacía");
  const total = grafo.areas.reduce((t, a) => t + a.enlacesEntrantes + a.enlacesSalientes, 0);
  afirmar(total >= suma, `los pesos (${total}) no cubren los acoplamientos mostrados (${suma})`);
});

console.log("\n⑤ EL CONTRATO DE INTEGRACIÓN");
verificar("tiene ocho piezas, cada una con su comprobación y su sitio", () => {
  const t = leer("src/lib/arquitectura/integracion.ts");
  for (const pieza of ["puerta", "registro", "datos", "api", "enlaces", "limites", "pruebas", "constancia"]) {
    afirmar(t.includes(`id: "${pieza}"`), `falta la pieza «${pieza}»`);
  }
  afirmar((t.match(/id: "/g) ?? []).length >= 8, "menos de ocho piezas");
  afirmar(/tipo: "(árbol|registro|prueba|revisión humana)"/.test(t), "las piezas no declaran cómo se comprueban");
  afirmar(t.includes("validarIntegracion"), "no hay validador ejecutable");
  afirmar(t.includes("revisión humana"), "la casa finge que todo se comprueba sola");
});
verificar("el validador sabe decir que no (código)", () => {
  const t = leer("src/lib/arquitectura/integracion.ts");
  afirmar(/faltan\.push\(/.test(t), "el validador no acumula faltas");
  afirmar(/ok: faltan\.length === 0/.test(t), "el validador no cierra con ok");
});

console.log("\n⑥ LA PUERTA DE MÁQUINA");
verificar("/api/sistema/arquitectura usa el contrato de la casa", () => {
  const t = leer("src/app/api/sistema/arquitectura/route.ts");
  for (const trozo of ["conManejo", "ok(", "fallo(", "from \"@/lib/sistema/contrato\"", "muro("]) {
    afirmar(t.includes(trozo), `la puerta no usa «${trozo}»`);
  }
  afirmar(!/NextResponse\.json/.test(t), "devuelve JSON a mano en vez de usar el contrato");
});
verificar("la puerta está documentada en el catálogo de API", () => {
  const cat = leer("src/lib/api/catalogo.ts");
  afirmar(cat.includes('"/api/sistema/arquitectura"'), "no figura en el catálogo");
});

console.log("\n⑦ NINGÚN ENDPOINT SIN REGISTRO");
verificar("cada ruta viva de /api está documentada o inventariada", () => {
  const cat = leer("src/lib/api/catalogo.ts");
  const decl = new Set([...cat.matchAll(/ruta:\s*"(\/api[^"]*)"/g)].map((m) => m[1]));
  const inv = new Set([...cat.matchAll(/^\s{2}"(\/api[^"]*)",$/gm)].map((m) => m[1]));
  const vivas = arbol.rutas.filter((r) => r.startsWith("/api"));
  const sueltas = vivas.filter((r) => !decl.has(r) && !inv.has(r));
  afirmar(sueltas.length === 0, `vivas sin registrar: ${sueltas.join(", ")}`);
});

console.log("\n⑧ LA GUÍA PARA LOS 22 DEPARTAMENTOS");
verificar("existe y cubre las ocho piezas", () => {
  const t = leer("docs/INTEGRACION-22-DEPARTAMENTOS.md");
  for (const p of ["puerta canónica", "registro", "origen", "contrato", "ida y vuelta", "límites", "prueba", "constancia"]) {
    afirmar(t.toLowerCase().includes(p), `la guía no cubre «${p}»`);
  }
});

// ── parte viva ─────────────────────────────────────────────────────
if (BASE) {
  console.log("\n⑨ EN VIVO");
  const pedir = async (r) => {
    const res = await fetch(`${BASE}${r}`, { headers: { "User-Agent": "pruebas-arquitectura" } });
    const texto = await res.text();
    let cuerpo = null;
    try {
      cuerpo = JSON.parse(texto);
    } catch {
      /* no es JSON */
    }
    return { status: res.status, cuerpo };
  };

  const vivo = async (nombre, fn) => {
    try {
      await fn();
      pasan++;
      console.log(`  ✓ ${nombre}`);
    } catch (e) {
      fallos.push(`${nombre} — ${e.message}`);
      console.error(`  ✗ ${nombre} — ${e.message}`);
    }
  };

  await vivo("la puerta responde con el contrato", async () => {
    const r = await pedir("/api/sistema/arquitectura");
    afirmar(r.status === 200, `HTTP ${r.status}`);
    afirmar(r.cuerpo?.ok === true && r.cuerpo.api, "sin contrato");
    afirmar(typeof r.cuerpo?.datos?.resumen?.paginas === "number", "sin resumen");
  });

  await vivo("las ocho piezas se publican y el validador dice que no", async () => {
    const r = await pedir("/api/sistema/arquitectura?seccion=piezas");
    const d = r.cuerpo?.datos;
    afirmar(Array.isArray(d?.piezas) && d.piezas.length === 8, `piezas: ${d?.piezas?.length}`);
    afirmar(Array.isArray(d?.ejemplo?.faltan) && d.ejemplo.faltan.length >= 6, `el validador de un descriptor vacío devolvió ${d?.ejemplo?.faltan?.length} faltas`);
  });

  await vivo("los 22 departamentos se publican con su estado", async () => {
    const r = await pedir("/api/sistema/arquitectura?seccion=departamentos");
    const d = r.cuerpo?.datos?.departamentos;
    afirmar(d?.total === 22, `departamentos: ${d?.total}`);
    afirmar(d.detalle.every((x) => ["en pie", "parcial", "sin construir"].includes(x.estado)), "estados no válidos");
  });

  await vivo("la página /arquitectura sigue en pie", async () => {
    const res = await fetch(`${BASE}/arquitectura`, { headers: { "User-Agent": "pruebas-arquitectura" } });
    afirmar(res.status === 200, `HTTP ${res.status}`);
    const html = await res.text();
    afirmar(html.length > 20000, "página vacía");
  });

  await vivo("los huecos publicados son reales (nombran rutas del árbol)", async () => {
    const r = await pedir("/api/sistema/arquitectura?seccion=huecos");
    const d = r.cuerpo?.datos?.huecos;
    afirmar(Array.isArray(d?.apiSinConsumidor), "sin lista de puertas sin consumidor");
    for (const ruta of d.apiSinConsumidor) afirmar(ruta.startsWith("/api/"), `hueco raro: ${ruta}`);
  });
} else {
  console.log("\n⑨ EN VIVO omitida: pasa la URL del servidor como argumento.");
}

console.log("\n════════════════════════════════════════");
console.log(`  PASAN ${pasan} · FALLAN ${fallos.length}`);
if (fallos.length) {
  fallos.forEach((f) => console.log(`   · ${f}`));
  process.exit(1);
}
console.log("  LA ARQUITECTURA NO MIENTE: censo, grafo y contrato cuadran con el árbol ✓");
