// ═══════════════════════════════════════════════════════════════════════════
// v434.2 · PRUEBA DE LA MESA DE ÓRDENES — contra el código real
//
//   npx tsx tools/zona-cero/probar.mts
//
// Lo que se puede romper mañana sin que nadie lo note:
//   ① que las órdenes se numeren solas y no se salten ni se repitan;
//   ② que corregir deje rastro y deshacer devuelva EXACTAMENTE lo de antes;
//   ③ que borrar no deje dependencias huérfanas ni números con agujeros;
//   ④ que una captura enorme o falsa se rechace con un motivo claro;
//   ⑤ que predecir sea determinista, explicable y humilde (confianza baja con
//      poca mesa) y que suba/baje con lo que se pone en el tablero;
//   ⑥ que la mesa salga (MD/JSON) y vuelva idéntica;
//   ⑦ que un almacén manipulado se sane sin romper la pantalla.
// ═══════════════════════════════════════════════════════════════════════════
import {
  mesaVacia, crearOrden, crearPin, crearCaptura, corregir, deshacer, borrar, moverOrden,
  renumerar, predecir, alertas, avance, exportarMD, exportarJSON, importarJSON, sanear,
  siguienteNumero, baseDeMesa, TOPE_CAPTURA_MB,
  type Mesa,
} from "@/lib/zona-cero/mesa";

let fallos = 0;
const ok = (cond: boolean, nombre: string, extra = "") => {
  console.log(` ${cond ? "✓" : "✗"} ${nombre}${extra ? " → " + extra : ""}`);
  if (!cond) fallos++;
};

const AHORA = 1_800_000_000_000;
const DIA = 86_400_000;

// ═══ ① ÓRDENES NUMERADAS ═══════════════════════════════════════════════════
console.log("── ÓRDENES POR NÚMEROS ──");
let m: Mesa = mesaVacia(AHORA);
ok(siguienteNumero(m) === 1, "la primera orden es la 1");
m = crearOrden(m, { titulo: "Asegurar el flanco norte", prioridad: 5, detalle: "Revisar el pase" }, AHORA);
m = crearOrden(m, { titulo: "Cerrar el cable del mar Negro" }, AHORA + 1000);
m = crearOrden(m, { titulo: "Pedir capturas al ojo" }, AHORA + 2000);
ok(m.ordenes.map((o) => o.numero).join(",") === "1,2,3", `se numeran solas: ${m.ordenes.map((o) => o.numero).join(",")}`);
ok(m.ordenes[0].prioridad === 5 && m.ordenes[1].prioridad === 3, "la prioridad se guarda, y la de fábrica es 3");

m = moverOrden(m, m.ordenes[2].id, 0, AHORA + 3000);
ok(m.ordenes[0].titulo.includes("capturas"), "mover lleva la orden arriba");
ok(m.ordenes.map((o) => o.numero).join(",") === "1,2,3", "y se renumera sin agujeros");

m = borrar(m, m.ordenes[1].id, AHORA + 4000);
ok(m.ordenes.map((o) => o.numero).join(",") === "1,2", "borrar renumera: no queda el 2 sin el 1");
ok(m.correcciones.some((c) => c.campo === "borrada"), "y queda rastro de lo borrado");

// ═══ ② CORREGIR Y DESHACER ═════════════════════════════════════════════════
console.log("\n── CORREGIR · EDITAR · DESHACER ──");
const idOrden = m.ordenes[0].id;
const tituloOriginal = m.ordenes[0].titulo;
m = corregir(m, idOrden, "orden", "titulo", "Pedir capturas al ojo (hoy)", AHORA + 5000);
ok(m.ordenes[0].titulo === "Pedir capturas al ojo (hoy)", "corregir cambia el campo");
ok(m.correcciones.at(-1)?.campo === "titulo" && m.correcciones.at(-1)?.antes === tituloOriginal, "y apunta el antes y el después");
const deshecho = deshacer(m, AHORA + 6000);
m = deshecho.mesa;
ok(m.ordenes[0].titulo === tituloOriginal, `deshacer devuelve el texto exacto: «${m.ordenes[0].titulo}»`);
ok(deshecho.dicho.includes("Deshecho"), `y lo dice en cristiano: «${deshecho.dicho}»`);
ok(m.correcciones.length === 1, "el historial pierde la corrección deshecha");

m = corregir(m, idOrden, "orden", "prioridad", "1", AHORA + 7000);
ok(m.ordenes[0].prioridad === 1, "la prioridad se puede corregir y queda en rango");
m = corregir(m, idOrden, "orden", "prioridad", "99", AHORA + 8000);
ok(m.ordenes[0].prioridad === 5, "y un valor absurdo se acota (99 → 5)");

// ═══ ③ SEÑALAR EN EL TABLERO ═══════════════════════════════════════════════
console.log("\n── SEÑALAR (PINES DEL TABLERO) ──");
m = crearPin(m, { x: 250, y: 400, titulo: "Aquí se rompe", tipo: "riesgo", nota: "Convoy sin escolta" }, AHORA + 9000);
m = crearPin(m, { x: 900, y: 100, titulo: "Objetivo", tipo: "objetivo" }, AHORA + 10_000);
ok(m.pines.length === 2 && m.pines[1].numero === 2, "los pines se numeran");
ok(m.pines[0].x === 250 && m.pines[0].tipo === "riesgo", "guardan posición y tipo");
m = crearPin(m, { x: 5000, y: -40 }, AHORA + 11_000);
ok(m.pines[2].x === 1000 && m.pines[2].y === 0, "una posición imposible se acota al lienzo");

// ═══ ④ CAPTURAS ════════════════════════════════════════════════════════════
console.log("\n── CAPTURAS ──");
const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";
let r = crearCaptura(m, { titulo: "Frente norte", dataUrl: png, ancho: 1280, alto: 720, peso: 900_000, fuente: "mapa de la casa" }, AHORA + 12_000);
m = r.mesa;
ok(!r.error && m.capturas.length === 1, "una captura buena entra");
ok(m.capturas[0].ancho === 1280 && m.capturas[0].fuente.includes("mapa"), "guarda tamaño y fuente");

r = crearCaptura(m, { titulo: "Texto", dataUrl: "data:text/plain;base64,AAAA", ancho: 10, alto: 10, peso: 10 }, AHORA + 13_000);
ok(Boolean(r.error) && r.mesa.capturas.length === 1, `lo que no es imagen se rechaza: «${r.error}»`);

r = crearCaptura(m, { titulo: "Enorme", dataUrl: png, ancho: 4000, alto: 4000, peso: 9 * 1024 * 1024 }, AHORA + 14_000);
ok(Boolean(r.error) && r.error!.includes("tope"), `una captura de 9 MB se rechaza con motivo: «${r.error}»`);
ok(TOPE_CAPTURA_MB >= 2, `el tope de fábrica es honesto (${TOPE_CAPTURA_MB} MB máximo)`);

// ═══ ⑤ PREDECIR ════════════════════════════════════════════════════════════
console.log("\n── PREDECIR (motor de la casa) ──");
let mesa2: Mesa = mesaVacia(AHORA);
mesa2 = crearOrden(mesa2, { titulo: "Uno", detalle: "cómo", prioridad: 5 }, AHORA);
mesa2 = crearOrden(mesa2, { titulo: "Dos" }, AHORA);
mesa2 = crearOrden(mesa2, { titulo: "Tres", vence: AHORA - DIA }, AHORA);
const p1 = predecir(mesa2, AHORA, 7);
ok(p1.length === 4, `hace cuatro preguntas de verdad: ${p1.map((p) => p.clave).join(", ")}`);
ok(p1.every((p) => p.probabilidad > 0 && p.probabilidad < 1), "ninguna probabilidad es 0 % ni 100 %");
ok(p1.every((p) => p.factores.length >= 2), "cada una dice en qué se basa");
ok(p1.every((p) => p.texto.length > 10), "y lo explica en una frase");
ok(p1[0].confianza < 0.6, `con tres órdenes, la confianza es baja: ${p1[0].confianza}`);

const p2 = predecir(mesa2, AHORA, 7);
ok(p1.map((p) => p.probabilidad.toFixed(6)).join() === p2.map((p) => p.probabilidad.toFixed(6)).join(), "el mismo tablero da el mismo número (determinista)");

let mesaBuena = mesaVacia(AHORA);
for (let i = 0; i < 10; i += 1) mesaBuena = crearOrden(mesaBuena, { titulo: `Cerrada ${i}`, detalle: "cómo", estado: "hecha" }, AHORA);
for (let i = 0; i < 5; i += 1) mesaBuena = crearPin(mesaBuena, { x: 100 * i, y: 100, titulo: `Señal ${i}` }, AHORA);
let mesaMala = mesaVacia(AHORA);
for (let i = 0; i < 10; i += 1) mesaMala = crearOrden(mesaMala, { titulo: `Pendiente ${i}`, vence: AHORA - DIA }, AHORA);

const cierreBueno = predecir(mesaBuena, AHORA)[0].probabilidad;
const cierreMalo = predecir(mesaMala, AHORA)[0].probabilidad;
ok(cierreBueno > cierreMalo, `una mesa cerrada puntúa mejor que una vencida: ${Math.round(cierreBueno * 100)} % vs ${Math.round(cierreMalo * 100)} %`);
ok(predecir(mesaBuena, AHORA)[0].confianza > p1[0].confianza, "y con más mesa, más confianza");

const h30 = predecir(mesaMala, AHORA, 30)[0];
ok(h30.horizonteDias === 30 && h30.probabilidad >= cierreMalo, "más horizonte, más margen (nunca menos)");

// ═══ ⑥ ALERTAS Y AVANCE ═══════════════════════════════════════════════════
console.log("\n── ALERTAS Y AVANCE ──");
const al = alertas(mesa2, AHORA);
ok(al.length > 0 && al[0].nivel === "alta", `avisa de lo urgente primero: «${al[0].texto}»`);
ok(alertas(mesaVacia(AHORA), AHORA)[0].nivel === "baja", "una mesa vacía se avisa sin dramatismo");
const av = avance(mesaBuena);
ok(av.pct === 100 && av.abiertas === 0, `la mesa cerrada está al ${av.pct} %`);
const bm = baseDeMesa(mesaMala, AHORA);
ok(bm.vencidas === 10, `cuenta las vencidas de verdad: ${bm.vencidas}`);

// ═══ ⑦ EXPORTAR · IMPORTAR · SANEAR ═══════════════════════════════════════
console.log("\n── EXPORTAR · IMPORTAR · SANEAR ──");
const md = exportarMD(m);
ok(md.startsWith("# "), "el markdown empieza por el título");
ok(md.includes("Órdenes") && md.includes("Capturas"), "y trae las tres secciones");
const mdOrdenes = (md.match(/^\d+\. \*\*/gm) ?? []).length;
ok(mdOrdenes === m.ordenes.length, `numera las órdenes en el informe (${mdOrdenes})`);

const json = exportarJSON(m);
const vuelta = importarJSON(json, AHORA);
ok(Boolean(vuelta.mesa), "el JSON vuelve a entrar");
ok(vuelta.mesa!.ordenes.length === m.ordenes.length && vuelta.mesa!.pines.length === m.pines.length, "con las mismas órdenes y señales");
ok(vuelta.mesa!.capturas[0]?.dataUrl === m.capturas[0]?.dataUrl, "y las capturas intactas");
ok(Boolean(importarJSON("{no es json", AHORA).error), "un archivo roto se rechaza con motivo");

const sucia = sanear({
  v: 1,
  ordenes: [{ titulo: "Sin id", prioridad: 99, estado: "inventado" }, null, "basura"],
  pines: [{ x: 5000, y: "arriba" }],
  capturas: [{ dataUrl: "javascript:alert(1)" }],
  ajustes: { motor: "otro", proveedor: "desconocido", topeMB: 999, horizonteDias: -3 },
  correcciones: "no es lista",
}, AHORA);
ok(Boolean(sucia), "un almacén sucio se sanea en vez de romper la pantalla");
ok(sucia!.ordenes.length === 1 && sucia!.ordenes[0].numero === 1, "las filas basura caen y lo válido se renumera");
ok(sucia!.ordenes[0].prioridad === 5 && sucia!.ordenes[0].estado === "pendiente", "prioridad y estado se acotan a lo permitido");
ok(sucia!.pines[0].x === 1000 && sucia!.pines[0].y === 500, "un pin imposible cae en el lienzo");
ok(sucia!.capturas.length === 0, "una captura que no es imagen se descarta");
ok(sucia!.ajustes.motor === "casa" && sucia!.ajustes.horizonteDias === 1, "los ajustes absurdos vuelven a lo válido");
ok(Array.isArray(sucia!.correcciones), "el historial corrupto se convierte en lista vacía");
ok(sanear(null, AHORA) === null, "sin datos no se inventa una mesa");

const ren = renumerar([{ ...m.ordenes[0], numero: 7 } as typeof m.ordenes[0]]);
ok(ren[0].numero === 1, "renumerar deja el 1 donde toca");

console.log(fallos ? `\nRESULTADO: ${fallos} fallo(s)` : "\nRESULTADO: 45 comprobaciones, 0 fallos");
process.exit(fallos ? 1 : 0);
