// ═══════════════════════════════════════════════════════════════════════════
// v431.0 · PRUEBA DE LA MENTE — contra el código real, no contra mocks
//
//   npx tsx tools/mente/probar.mts
//
// Comprueba lo que se puede romper mañana sin que nadie lo note:
//   ① que el mapa de la casa siga conociendo sus lugares y sus rutas;
//   ② que «llévame a …» resuelva al sitio correcto (y no invente uno);
//   ③ que el modo casa (sin modelo) siga respondiendo y creando artefactos.
// No necesita base de datos, ni red, ni credenciales.
// ═══════════════════════════════════════════════════════════════════════════
import { LUGARES, TOTAL_LUGARES, buscarEnCasa, resolverDestino, areaDeRuta, mapaParaElModelo } from "@/lib/mente/mapa-casa";
import { hablarConMente, pideCrear, pideIr, pulirRespuesta } from "@/lib/mente/agente";
import { sanear, AJUSTES_DEFECTO } from "@/lib/mente/ajustes-orbe";

let fallos = 0;
const ok = (cond: boolean, nombre: string, extra = "") => {
  console.log(` ${cond ? "✓" : "✗"} ${nombre}${extra ? " → " + extra : ""}`);
  if (!cond) fallos++;
};

console.log("── MAPA DE LA CASA ──");
ok(TOTAL_LUGARES > 200, `conoce ${TOTAL_LUGARES} lugares de la casa`);
ok(LUGARES.every((l) => l.r.startsWith("/")), "todas las rutas son rutas de la casa");
ok(new Set(LUGARES.map((l) => l.tipo)).size >= 5, `tipos de lugar: ${[...new Set(LUGARES.map((l) => l.tipo))].join(", ")}`);

console.log("\n── BÚSQUEDA Y NAVEGACIÓN ──");
for (const [frase, esperado] of [
  ["llévame al mapa", "/mapas"],
  ["donde veo las divisas", "/divisas"],
  ["llévame a la mente", "/cuartel?sala=mente"],
  ["abre el cuartel", "/cuartel"],
  ["quiero ver el teatro", "/teatro-3d"],
] as [string, string][]) {
  const h = resolverDestino(frase);
  ok(Boolean(h) && h!.r.startsWith(esperado.split("?")[0]), `«${frase}» → ${h?.r ?? "nada"} (esperaba ${esperado})`);
}
ok(resolverDestino("xyzzy plugh") === null, "una frase sin destino no inventa uno");
ok(resolverDestino("llévame al mapa y quiero ver los países")?.r.startsWith("/mapas") === true, "una frase larga no diluye el destino (IDF)");
ok(buscarEnCasa("divisas").length > 0, `buscar «divisas» devuelve ${buscarEnCasa("divisas").length} resultados`);
ok(areaDeRuta("/cuartel?sala=mente").clave.length > 0, `área de /cuartel?sala=mente: ${areaDeRuta("/cuartel?sala=mente").nombre}`);

console.log("\n── CREAR (detección) ──");
ok(pideCrear("hazme un plan de tres pasos") === "plan", "«plan de tres pasos» → plan");
ok(pideCrear("escríbeme una tabla comparativa") === "tabla", "«tabla comparativa» → tabla");
ok(pideCrear("¿qué es el cuartel?") === null, "una pregunta no pide crear");

console.log("\n── DIRIGIR (orden directa) ──");
ok(pideIr("llévame al mapa") === true, "«llévame al mapa» es una orden de ir");
ok(pideIr("abre el cuartel") === true, "«abre el cuartel» es una orden de ir");
ok(pideIr("¿dónde veo las divisas?") === false, "una pregunta NO arrastra al operador");
ok(pideIr("quiero ver el teatro") === true, "«quiero ver…» es una orden de ir");

console.log("\n── MODO CASA (sin modelo: presupuesto mínimo, sin red) ──");
const mapa = await hablarConMente({ mensaje: "llévame al mapa, quiero ver los países", presupuestoMs: 1000 });
ok(mapa.ia === false && mapa.motor === "casa", `motor honesto: ${mapa.motor}`);
ok(mapa.enlaces.some((e) => e.ruta.startsWith("/mapas")), `enlaces: ${mapa.enlaces.map((e) => e.ruta).join(", ")}`);
ok(mapa.respuesta.length > 20, `responde algo útil (${mapa.respuesta.length} caracteres)`);
ok(mapa.pasos.length > 0, `deja rastro de pasos: ${mapa.pasos.map((p) => p.etiqueta).join(" · ")}`);
ok(mapa.dirigir === true, "«llévame al mapa» pide que la interfaz te lleve");
const pregunta = await hablarConMente({ mensaje: "¿dónde veo las divisas?", presupuestoMs: 1000 });
ok(pregunta.dirigir === false && pregunta.enlaces.length > 0, "una pregunta ofrece puertas pero no arrastra");

const creado = await hablarConMente({ mensaje: "hazme un plan para seguir el conflicto de Ucrania", presupuestoMs: 1000 });
ok(creado.artefactos.length === 1, `crea ${creado.artefactos.length} artefacto(s) en modo casa`);
ok(creado.artefactos[0]?.contenido.includes("#"), "el artefacto es markdown editable");
ok(creado.artefactos[0]?.tipo === "plan", `tipo del artefacto: ${creado.artefactos[0]?.tipo}`);
ok(!/plan tres pasos seguir/i.test(creado.artefactos[0]?.titulo ?? ""), `título legible: «${creado.artefactos[0]?.titulo}»`);

console.log("\n── LO QUE DICE (pulido, sin relleno) ──");
const sucio = pulirRespuesta("**Claro**, ve a /mapas (allí está todo). Como modelo de lenguaje, no puedo. ¡Buena pregunta!");
ok(!sucio.includes("**"), "quita el markdown");
ok(!sucio.includes("/mapas"), "quita las rutas escritas (la interfaz pinta puertas)");
ok(!/Claro|Como modelo|Buena pregunta|^¡|^¿/i.test(sucio), `quita las muletillas: «${sucio}»`);
const largo = pulirRespuesta("Uno. Dos. Tres. Cuatro. Cinco. Seis. Siete.");
ok(largo.split(/(?<=[.!?])\s+/).length <= 5, "no pasa de cinco frases (se lee en voz alta)");

console.log("\n── LOS AJUSTES DEL ORBE (nada puede dejarlo roto) ──");
const sucios = sanear({ tamano: 999, opacidad: 0, x: Number.NaN, voz: "inventada", persona: "otra", velocidad: 9, idioma: "fr-FR" });
ok(sucios.tamano === 96, `tamaño acotado: ${sucios.tamano}`);
ok(sucios.opacidad === 0.3, `opacidad acotada: ${sucios.opacidad}`);
ok(sucios.x === null, "posición inválida vuelve al centro");
ok(sucios.voz === "casa" && sucios.persona === "locutora" && sucios.idioma === "es-ES", "voz/persona/idioma caen a lo válido");
ok(sucios.velocidad === 1.4, `velocidad acotada: ${sucios.velocidad}`);
ok(AJUSTES_DEFECTO.visible === true && AJUSTES_DEFECTO.chips === true, "los de fábrica: visible y con sugerencias");
ok(sanear({}).tamano === AJUSTES_DEFECTO.tamano, "sin nada guardado se usan los de fábrica");

console.log("\n── EL MAPA QUE VE EL MODELO ──");
const m = mapaParaElModelo();
ok(m.includes("ÁREAS") && m.length < 6000, `prompt del mapa: ${m.length} caracteres (cabe en el contexto)`);
ok((m.match(/·/g) || []).length >= 10, "enumera las áreas con sus puertas");

console.log(fallos ? `\nRESULTADO: ${fallos} fallo(s)` : "\nRESULTADO: 41 comprobaciones, 0 fallos");
process.exit(fallos ? 1 : 0);
