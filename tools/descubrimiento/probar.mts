// ═══════════════════════════════════════════════════════════════════════════
// v435.2 · PRUEBA DEL SISTEMA DE DESCUBRIMIENTO — contra el código real
//
//   npx tsx tools/descubrimiento/probar.mts
//
// Lo que se puede romper mañana sin que nadie lo note:
//   ① que una ficha no lleve a una puerta que no existe (guía = trampa);
//   ② que una sala se quede sin explicación o con un ejemplo vacío;
//   ③ que una guía prometa un paso que ya no está en la casa;
//   ④ que el progreso se cuente mal o que «modo libre» no se respete;
//   ⑤ que los destacados citen funciones que ya no existen.
// ═══════════════════════════════════════════════════════════════════════════
import { FICHAS, TOTAL_FICHAS, fichaDe, existePuerta, porDivision, ejemplosDe, PUERTAS_DE_ENTRADA, PUERTAS_EXTRA } from "@/lib/descubrimiento/fichas";
import { GUIAS, guiaSugerida, pasoDe, totalPasos } from "@/lib/descubrimiento/guias";
import {
  progresoVacio, sanear, marcarVisita, registrarPaso, pctDescubierto, fichasVisitadas,
  recomendar, recomendarVarias,
} from "@/lib/descubrimiento/progreso";
import { DESTACADOS, ultimosDestacados } from "@/lib/descubrimiento/destacados";

let fallos = 0;
const ok = (cond: boolean, nombre: string, extra = "") => {
  console.log(` ${cond ? "✓" : "✗"} ${nombre}${extra ? " → " + extra : ""}`);
  if (!cond) fallos++;
};
const AHORA = 1_800_000_000_000;

// ═══ ① FICHAS ══════════════════════════════════════════════════════════════
console.log("── FICHAS DE LA CASA ──");
ok(TOTAL_FICHAS >= 80, `hay ficha para ${TOTAL_FICHAS} puertas`);
ok(FICHAS.every((f) => f.href.startsWith("/")), "todas las puertas son rutas de la casa");
ok(new Set(FICHAS.map((f) => f.href)).size === FICHAS.length, "ninguna ficha repetida");
ok(FICHAS.every((f) => f.que.trim().length >= 12), "todas dicen qué son (una línea de verdad)");
ok(FICHAS.every((f) => f.ejemplos.length >= 1), "todas traen al menos un ejemplo");
ok(FICHAS.every((f) => f.ejemplos.every((e) => e.trim().length >= 8)), "ningún ejemplo es una palabra suelta");
ok(FICHAS.every((f) => f.primerPaso.trim().length >= 8 && /^[A-ZÁÉÍÓÚÑ]/.test(f.primerPaso)), "el primer paso empieza como una acción");
ok(FICHAS.filter((f) => f.nivel === "sin prisa").length >= 10, `marca ${FICHAS.filter((f) => f.nivel === "sin prisa").length} salas «sin prisa»`);

const mapa = fichaDe("/mapas");
ok(Boolean(mapa) && mapa!.ejemplos[0].toLowerCase().includes("capa"), `la ficha de /mapas habla de capas: «${mapa?.ejemplos[0]?.slice(0, 60)}…»`);
const mesa = fichaDe("/zona-cero/mesa");
ok(mesa?.href === "/zona-cero/mesa", "la mesa de órdenes tiene ficha propia (no cae en /zona-cero)");
ok(fichaDe("/mundos/do")?.href === "/mundos", "una ficha de país cae en la ficha de países");
ok(fichaDe("/buscar")?.href === "/buscar", "el buscador tiene ficha aunque no esté en el árbol de módulos");
ok(fichaDe("/ruta-que-no-existe") === null, "una ruta que no existe no tiene ficha inventada");

const sinEjemplo = FICHAS.filter((f) => ejemplosDe(f.href, f.que, f.nombre).length === 0);
ok(sinEjemplo.length === 0, "ejemplosDe nunca devuelve una lista vacía");
ok(porDivision().length >= 7, `se agrupan en ${porDivision().length} divisiones`);
ok(PUERTAS_DE_ENTRADA.every((r) => existePuerta(r)), "las puertas de entrada existen todas");
ok(PUERTAS_EXTRA.every((p) => p.ejemplos.length > 0), "las puertas nuevas traen sus ejemplos");

// ═══ ② GUÍAS ══════════════════════════════════════════════════════════════
console.log("\n── GUÍAS ──");
ok(GUIAS.length >= 4, `hay ${GUIAS.length} caminos`);
for (const g of GUIAS) {
  const malas = g.pasos.filter((p) => !existePuerta(p.ruta));
  ok(malas.length === 0, `«${g.nombre}»: todos sus pasos existen${malas.length ? " — FALLA: " + malas.map((m) => m.ruta).join(", ") : ""}`);
}
ok(GUIAS.every((g) => g.pasos.every((p) => p.que.length > 15 && p.haz.length > 15)), "cada paso dice qué vas a ver y qué hacer");
ok(GUIAS.every((g) => g.pasos.every((p) => p.minutos >= 1 && p.minutos <= 10)), "los minutos son creíbles (1–10)");
const primeros = GUIAS.find((g) => g.id === "primeros-pasos")!;
ok(primeros.pasos.reduce((t, p) => t + p.minutos, 0) <= 12, `«primeros pasos» cabe en ${primeros.pasos.reduce((t, p) => t + p.minutos, 0)} minutos`);
ok(totalPasos("primeros-pasos") === primeros.pasos.length, "totalPasos cuadra");
ok(pasoDe("primeros-pasos", 999)?.ruta === primeros.pasos[primeros.pasos.length - 1].ruta, "un índice fuera de rango se acota (no rompe)");
ok(pasoDe("no-existe", 0) === null, "una guía inventada no devuelve paso");
ok(guiaSugerida({})?.id === GUIAS[0].id, "sin progreso sugiere la primera guía");
ok(guiaSugerida({ "primeros-pasos": 99 })?.id !== "primeros-pasos", "con la primera terminada sugiere otra");

// ═══ ③ PROGRESO ═══════════════════════════════════════════════════════════
console.log("\n── PROGRESO ──");
let p = progresoVacio(AHORA);
ok(pctDescubierto(p) === 0, "sin visitas, 0 % descubierto");
p = marcarVisita(p, "/mapas/", AHORA + 1000);
ok(Boolean(p.visitadas["/mapas"]), "una visita se apunta sin la barra final");
ok(fichasVisitadas(p) === 1 && pctDescubierto(p) > 0, `con una visita: ${fichasVisitadas(p)} ficha, ${pctDescubierto(p)} %`);
p = marcarVisita(p, "/", AHORA + 2000);
ok(Object.keys(p.visitadas).length === 1, "la portada no cuenta como sala descubierta");

p = registrarPaso(p, "primeros-pasos", 1, AHORA + 3000);
ok(p.guias["primeros-pasos"] === 2, "un paso apuntado cuenta dos (el 0 y el 1)");
p = registrarPaso(p, "primeros-pasos", 0, AHORA + 4000);
ok(p.guias["primeros-pasos"] === 2, "volver atrás no resta progreso");

const r1 = recomendar(p);
ok(Boolean(r1) && !p.visitadas[r1!.href], `recomienda algo sin visitar: ${r1?.href}`);
ok(!p.visitadas["/guerra-hoy"] && r1?.href === "/guerra-hoy", "y empieza por una puerta de entrada");
const varias = recomendarVarias(p, 3);
ok(varias.length === 3 && new Set(varias.map((v) => v.href)).size === 3, "ofrece tres salidas distintas (no una sola)");

const lleno = progresoVacio(AHORA);
for (const f of FICHAS) lleno.visitadas[f.href.split("#")[0].split("?")[0]] = AHORA;
ok(pctDescubierto(lleno) === 100, "con todo pisado, 100 %");
ok(recomendar(lleno) === null, "y ya no recomienda nada (no inventa)");

const sucio = sanear({ visitadas: { "/mapas": "ayer", "../../etc": 5, "/mundos": 12 }, guias: { x: -3, y: "mucho" }, guiaActiva: 42, modoLibre: "sí" }, AHORA);
ok(Boolean(sucio.visitadas["/mundos"]) && !sucio.visitadas["../../etc"], "el almacén sucio se limpia (rutas basura fuera)");
ok(sucio.guias.x === 0, "los pasos negativos vuelven a cero");
ok(sucio.modoLibre === false, "«modo libre» solo se enciende con un sí de verdad");

// ═══ ④ DESTACADOS ═════════════════════════════════════════════════════════
console.log("\n── LO DESTACADO ──");
ok(DESTACADOS.length >= 6, `hay ${DESTACADOS.length} destacados`);
ok(DESTACADOS.every((d) => existePuerta(d.ruta)), "todos llevan a una puerta que existe");
ok(DESTACADOS.every((d) => d.que.length > 20 && d.prueba.length > 15), "todos dicen qué dan y qué probar");
const num = (v: string) => {
  const [mayor, menor] = v.replace("v", "").split(".");
  return Number(mayor) * 1000 + Number(menor);
};
const versiones = DESTACADOS.map((d) => num(d.version));
ok(versiones.every((v, i) => i === 0 || versiones[i - 1] >= v), `están ordenados de lo más nuevo a lo más viejo (${DESTACADOS.map((d) => d.version).join(" > ")})`);
ok(ultimosDestacados(3).length === 3, "ultimosDestacados recorta bien");
ok(new Set(DESTACADOS.map((d) => d.ruta)).size >= 4, "no son todos el mismo enlace");

console.log(fallos ? `\nRESULTADO: ${fallos} fallo(s)` : "\nRESULTADO: 47 comprobaciones, 0 fallos");
process.exit(fallos ? 1 : 0);
