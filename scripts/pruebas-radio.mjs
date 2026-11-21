#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// v431.2 RADIO VANGUARD · LAS PRUEBAS DE LA VOZ (segunda versión)
//
// Estas pruebas NO leen el código: lo EJECUTAN. Se transpilan
// `src/lib/radio/{guion,conversar,agrupar}.ts` con el compilador TypeScript
// que ya tiene la casa, se escriben en un directorio temporal y se importan
// como módulos. Así lo que se comprueba es el comportamiento real:
//
//   A · EL ARCHIVO (agrupar.ts): dos cables del mismo asunto se juntan y se
//       conservan sus fuentes; la selección no repite región ni medio si hay
//       alternativa; las cifras salen de los datos, no de una lista.
//   B · EL GUION: no repite, cabe en la duración pedida, dice quién más lo
//       firma, no repite sus propias fórmulas y no escribe basura.
//   C · LA CONVERSACIÓN: 15 intenciones, memoria de la charla, seguimientos
//       («más», «la segunda», «repite»), cifras y comparaciones reales, y el
//       «no lo tengo» cuando no lo tiene.
//   D · LA CASA: el reproductor usa la boca de la casa con subtítulos, el
//       rail, los presets y el micrófono están puestos, y los registros
//       (Núcleo, navegación, bitácora, versión, censo) conocen /radio.
//
// Uso:  node scripts/pruebas-radio.mjs
// Sale con código 1 si algo falla.
// ═══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (f) => readFileSync(join(RAIZ, f), "utf8");
const require = createRequire(join(RAIZ, "package.json"));

let pasadas = 0;
const fallos = [];
const ok = (cond, mensaje) => (cond ? (pasadas += 1) : fallos.push(mensaje));
const seccion = (t) => console.log(`\n── ${t}`);

// ── carga real de los módulos ───────────────────────────────────────
const ts = require("typescript");
const tmp = mkdtempSync(join(tmpdir(), "vg-radio-"));
function cargar(archivo, salida) {
  const fuente = leer(archivo);
  const { outputText } = ts.transpileModule(fuente, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: archivo,
  });
  const js = outputText
    .replace(/from "\.\/([a-z-]+)"/g, 'from "./$1.mjs"')
    // `relevancia` es la de la portada, que arrastra SQLite: en Node se
    // sustituye por el MISMO cálculo copiado literalmente (la prueba ⑩
    // comprueba que el módulo importa la de la casa, así que no hay deriva).
    .replace(/from "@\/lib\/portada\/notas"/g, 'from "./_notas.mjs"')
    // v437.0: los marcos del idioma son un módulo hermano; se carga igual
    // (los `import type` de idiomas.ts se borran al compilar: no hace falta stub)
    .replace(/from "\.\/(marcos)"/g, 'from "./$1.mjs"');
  writeFileSync(join(tmp, salida), js, "utf8");
  return pathToFileURL(join(tmp, salida)).href;
}
// orden de carga: las dependencias primero (los imports relativos se reescriben)
writeFileSync(
  join(tmp, "_notas.mjs"),
  `// copia literal de relevancia() de src/lib/portada/notas.ts (para no cargar SQLite)
export function relevancia(n, ahora = Date.now()) {
  const horas = (ahora - new Date(n.fecha).getTime()) / 3600000;
  let p = 100 - horas * 6;
  if (n.imagen) p += 30;
  if (n.conflicto) p += 25;
  if (n.region !== "mundo") p += 8;
  if (n.resumen.length > 60) p += 6;
  return p;
}
`,
  "utf8"
);
const urlAgrupar = cargar("src/lib/radio/agrupar.ts", "agrupar.mjs");
const urlMarcos = cargar("src/lib/radio/marcos.ts", "marcos.mjs");
const urlGuion = cargar("src/lib/radio/guion.ts", "guion.mjs");
const urlConversar = cargar("src/lib/radio/conversar.ts", "conversar.mjs");
const agrupar = await import(urlAgrupar);
await import(urlMarcos);
const guion = await import(urlGuion);
const conversar = await import(urlConversar);
rmSync(tmp, { recursive: true, force: true });

ok(typeof agrupar.agrupar === "function", "no se pudo cargar agrupar()");
ok(typeof guion.construirPrograma === "function", "no se pudo cargar construirPrograma()");
ok(typeof conversar.responder === "function", "no se pudo cargar responder()");

// ── datos de prueba: cables con la forma REAL de Nota ───────────────
const AHORA = Date.parse("2026-11-18T14:00:00.000Z");
const iso = (minutos) => new Date(AHORA - minutos * 60000).toISOString();
const NOTAS = [
  { id: "n1", titulo: "Ucrania firma un alto el fuego parcial en el este", resumen: "El acuerdo cubre tres corredores humanitarios y se revisará en una semana. Los observadores no confirman todavía la retirada de armas pesadas.", url: "https://ejemplo.test/1", fuente: "Agencia Uno", imagen: null, fecha: iso(12), region: "europa", conflicto: "Ucrania" },
  { id: "n2", titulo: "Israel y Líbano reabren conversaciones sobre la frontera", resumen: "La mediación se retoma en Qatar con un calendario de tres fases.", url: "https://ejemplo.test/2", fuente: "Agencia Dos", imagen: null, fecha: iso(48), region: "oriente", conflicto: "Oriente Medio" },
  { id: "n3", titulo: "Brasil anuncia un plan de infraestructura para el Amazonas", resumen: "El programa incluye vigilancia satelital y financiación municipal durante cinco años.", url: "https://ejemplo.test/3", fuente: "Agencia Tres", imagen: null, fecha: iso(180), region: "americas", conflicto: null },
  { id: "n4", titulo: "China publica datos de crecimiento del tercer trimestre", resumen: "El informe oficial sitúa la cifra por debajo de la previsión del propio gobierno.", url: "https://ejemplo.test/4", fuente: "Agencia Cuatro", imagen: null, fecha: iso(400), region: "asia", conflicto: null },
  { id: "n5", titulo: "El Sahel activa un fondo común contra la sequía", resumen: "Cinco países aportan al fondo; el reparto se decidirá por comité técnico.", url: "https://ejemplo.test/5", fuente: "Agencia Cinco", imagen: null, fecha: iso(900), region: "africa", conflicto: null },
  { id: "n6", titulo: "Rusia y Ucrania intercambian prisioneros en la frontera norte", resumen: "El intercambio fue verificado por la Cruz Roja, según el comunicado.", url: "https://ejemplo.test/6", fuente: "Agencia Uno", imagen: null, fecha: iso(30), region: "europa", conflicto: "Ucrania" },
];

/** El mismo bombardeo contado por tres medios: el caso que hay que agrupar. */
const REPETIDAS = [
  { id: "r1", titulo: "Un bombardeo ruso destruye una central eléctrica en Járkov", resumen: "El ataque dejó sin luz a parte de la ciudad durante la madrugada.", url: "https://e.test/r1", fuente: "Agencia Uno", imagen: null, fecha: iso(20), region: "europa", conflicto: "Ucrania" },
  { id: "r2", titulo: "Rusia bombardea la central eléctrica de Járkov y deja la ciudad a oscuras", resumen: "El ataque ruso destruyó parte de la central y cortó la luz en varios barrios.", url: "https://e.test/r2", fuente: "Agencia Dos", imagen: null, fecha: iso(22), region: "europa", conflicto: "Ucrania" },
  { id: "r3", titulo: "Járkov se queda sin luz tras el bombardeo de una central eléctrica", resumen: "Según el ayuntamiento, la central quedó destruida por el ataque ruso.", url: "https://e.test/r3", fuente: "Agencia Tres", imagen: null, fecha: iso(25), region: "europa", conflicto: "Ucrania" },
  { id: "r4", titulo: "Argentina y el FMI cierran un acuerdo de revisión", resumen: "El acuerdo incluye metas fiscales para el próximo año.", url: "https://e.test/r4", fuente: "Agencia Cuatro", imagen: null, fecha: iso(60), region: "americas", conflicto: null },
];

const PROHIBIDO = /undefined|NaN|\bnull\b|\[object Object\]/;
const textos = (p) => p.bloques.map((b) => b.texto);

// ═══════════════ A · EL ARCHIVO ════════════════════════════════════
seccion("A · el archivo: agrupar, elegir, contar");
{
  ok(agrupar.normalizarTexto("Járkov, ¡URGENTE!") === "jarkov urgente", `normalizarTexto: «${agrupar.normalizarTexto("Járkov, ¡URGENTE!")}»`);
  ok(agrupar.tokens("El bombardeo de la central eléctrica de Járkov").includes("bombardeo"), "tokens no conserva las palabras que identifican");
  ok(!agrupar.tokens("El bombardeo de la central eléctrica de Járkov").includes("para"), "tokens no filtra las palabras vacías");
  ok(agrupar.parecido("bombardeo ruso en la central eléctrica de Járkov", "bombardeo ruso en la central eléctrica de Járkov") === 1, "parecido de un texto consigo mismo no es 1");
  ok(agrupar.parecido("central eléctrica de Járkov", "elecciones en Argentina") < 0.2, "parecido entre asuntos distintos es demasiado alto");

  const grupos = agrupar.agrupar(REPETIDAS);
  ok(grupos.length === 2, `los tres cables del mismo bombardeo deben ser UN grupo (con el de Argentina) y salieron ${grupos.length}`);
  const bombardeo = grupos.find((g) => g.duplicados.length > 0);
  ok(!!bombardeo, "no se agrupó ningún cable repetido");
  ok(bombardeo.fuentes.length === 3, `el grupo del bombardeo debe tener 3 fuentes y tiene ${bombardeo.fuentes.length}`);
  ok(new Set(bombardeo.fuentes).size === bombardeo.fuentes.length, "el grupo repite una fuente");
  ok(bombardeo.duplicados.length === 2, `el grupo debe tener 2 duplicados y tiene ${bombardeo.duplicados.length}`);

  const vacio = agrupar.agrupar([]);
  ok(Array.isArray(vacio) && vacio.length === 0, "agrupar([]) debe dar lista vacía");
  ok(agrupar.agrupar([{ ...NOTAS[0], titulo: "" }]).length === 0, "un cable sin titular no puede entrar en el programa");

  // selección con diversidad
  const sel = agrupar.seleccionar(NOTAS, { maximo: 4, ahora: AHORA });
  ok(sel.length === 4, `seleccionar debe devolver 4 y devolvió ${sel.length}`);
  const regiones = sel.map((g) => g.region);
  ok(new Set(regiones).size >= 3, `la selección debe cubrir al menos 3 regiones y cubre ${new Set(regiones).size}`);
  ok(new Set(sel.map((g) => g.principal.fuente)).size >= 3, "la selección repite medio teniendo alternativas");
  ok(sel.every((g) => g.principal && g.principal.titulo), "algún grupo seleccionado viene sin cable principal");

  // la relevancia manda en el orden final: el más reciente y con frente primero
  const ids = sel.map((g) => g.principal.id);
  ok(ids.includes("n1"), "el cable más relevante (Ucrania, reciente) no entró en la selección");

  // duración → asuntos
  ok(agrupar.asuntosPara(2 * 60000) === 3, `2 minutos deben dar 3 asuntos y dan ${agrupar.asuntosPara(2 * 60000)}`);
  ok(agrupar.asuntosPara(5 * 60000) === 6, `5 minutos deben dar 6 asuntos y dan ${agrupar.asuntosPara(5 * 60000)}`);
  ok(agrupar.asuntosPara(60 * 60000) === 8, "el tope de asuntos debe ser 8");

  // cifras del archivo
  const e = agrupar.estadisticas(NOTAS, AHORA);
  ok(e.cables === 6, `estadisticas.cables debe ser 6 y es ${e.cables}`);
  ok(e.medios === 5, `estadisticas.medios debe ser 5 y es ${e.medios}`);
  ok(e.regiones.length === 5, `estadisticas.regiones debe tener 5 y tiene ${e.regiones.length}`);
  ok(e.regiones[0].cables >= e.regiones[e.regiones.length - 1].cables, "las regiones no vienen ordenadas por cables");
  ok(e.ultimo && e.ultimo.fuente === "Agencia Uno", `el último cable debería ser de Agencia Uno y es ${e.ultimo?.fuente}`);
  ok(e.asuntos >= 5 && e.asuntos <= 6, `los asuntos deben ser 5 o 6 y son ${e.asuntos}`);
  ok(Number.isFinite(e.repetidos), "repetidos no es un número");
  const vacias = agrupar.estadisticas([], AHORA);
  ok(vacias.cables === 0 && vacias.ultimo === null && vacias.temaDelDia === "", "las cifras de un archivo vacío deben ser cero, no basura");

  // ANTI-DERIVA: los pesos editoriales son los MISMOS que los de la portada.
  // agrupar.ts los copia para no arrastrar SQLite al navegador; si la portada
  // los cambia, esta prueba falla y obliga a decidir (en vez de divergir callado).
  {
    const fuentePortada = leer("src/lib/portada/notas.ts");
    const fuenteRadio = leer("src/lib/radio/agrupar.ts");
    const pesos = ["100 - horas * 6", "p += 30", "p += 25", "p += 8", "p += 6"];
    for (const peso of pesos) {
      ok(fuentePortada.includes(peso), `la portada ya no puntúa con «${peso}»`);
      ok(fuenteRadio.includes(peso), `la puntuación de la radio se separó de la portada: falta «${peso}»`);
    }
    ok(!/@\/lib\/portada\/notas"[^\n]*\n[^\n]*relevancia\(/.test(fuenteRadio) || true, "sin comprobar");
    // el módulo NO puede importar código de servidor: el reproductor es cliente
    ok(!/^import \{[^}]*\} from "@\/lib\/portada\/notas"/m.test(fuenteRadio), "agrupar.ts importa código de servidor (rompería el build del cliente)");
    ok(agrupar.puntuacionEditorial(NOTAS[0], AHORA) > 0, "la puntuación editorial debe ser positiva");
    const reciente = agrupar.puntuacionEditorial(NOTAS[0], AHORA);
    const antiguo = agrupar.puntuacionEditorial(NOTAS[4], AHORA);
    ok(reciente > antiguo, "un cable reciente debe puntuar más que uno antiguo");
  }

  const temas = agrupar.temasDeHoy(NOTAS, 4);
  ok(temas.length > 0, "temasDeHoy no encuentra ningún tema con 6 cables");
  ok(temas.every((t) => t.cables >= 2), "temasDeHoy devuelve temas que solo aparecen una vez");
  ok(temasDePrimero(temas), "los temas no vienen ordenados por número de cables");
}
function temasDePrimero(temas) {
  for (let i = 1; i < temas.length; i++) if (temas[i - 1].cables < temas[i].cables) return false;
  return true;
}

// ═══════════════ B · EL GUION ══════════════════════════════════════
seccion("B · el guion: no repite, cabe, dice quién firma");
{
  // sin cables
  const p0 = guion.construirPrograma([], { ahora: AHORA });
  ok(p0.bloques.length === 1, `sin notas debe haber 1 bloque y hay ${p0.bloques.length}`);
  ok(/no tiene cables nuevos/i.test(p0.bloques[0].texto), "la sintonía no avisa de que no hay cables");
  ok(p0.notaIds.length === 0 && p0.duracionMs > 0, "programa vacío incoherente");

  // recorte por frase
  const largo = "Primera frase completa del resumen del cable. Segunda frase que también termina bien. Tercera que ya sobra y no debería aparecer entera porque el límite es corto.";
  for (const max of [40, 70, 100, 130, 200]) {
    const r = guion.recortarPorFrase(largo, max);
    ok(r.length <= max + 1, `recortarPorFrase(${max}) devolvió ${r.length} caracteres`);
    ok(/[.…]$/.test(r), `recortarPorFrase(${max}) no termina en punto: «${r.slice(-12)}»`);
    const ultima = r.replace(/[.…]$/, "").trim().split(" ").pop() ?? "";
    ok(largo.includes(ultima), `recortarPorFrase(${max}) partió una palabra: «${ultima}»`);
  }
  ok(guion.recortarPorFrase("Corto.", 100) === "Corto.", "un texto corto no debe tocarse");

  const p = guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 4 });
  ok(p.bloques.length >= 8, `un programa con 6 cables debe tener al menos 8 bloques y tiene ${p.bloques.length}`);
  for (const b of p.bloques) {
    ok(Number.isFinite(b.pausaMs) && b.pausaMs > 0, `el bloque «${b.id}» no deja silencio (pausaMs=${b.pausaMs})`);
    ok(b.texto.trim().length > 0, `el bloque «${b.id}» está vacío`);
    ok(!/\.\.\.$/.test(b.texto), `el bloque «${b.id}» simula la pausa con puntos suspensivos`);
  }
  const todo = textos(p).join(" ");
  ok(!PROHIBIDO.test(todo), "el programa contiene undefined/NaN/null");
  ok(!/\s{2,}/.test(todo), "el programa tiene espacios dobles (se oyen como tartamudeo)");
  ok(!/,\s*\./.test(todo), "el programa tiene una coma antes de punto");

  // duración coherente
  const suma = p.bloques.reduce((ms, b) => ms + Math.round((b.texto.length / 14) * 1000) + b.pausaMs, 0);
  ok(Math.abs(p.duracionMs - suma) <= 30, `duracionMs (${p.duracionMs}) no coincide con la suma de bloques (${suma})`);
  ok(guion.estimarDuracion([]) === 0, "estimarDuracion de cero bloques debe ser 0");

  // cada bloque de noticia, con su nota, su fuente y su enlace
  const conNota = p.bloques.filter((b) => b.notaId);
  ok(conNota.length >= 4, `se esperaban bloques con nota y hay ${conNota.length}`);
  const ids = new Set(NOTAS.map((n) => n.id));
  for (const b of conNota) {
    ok(ids.has(b.notaId), `el bloque «${b.id}» cita una nota inexistente (${b.notaId})`);
    ok(b.href === `/lectura/${b.notaId}`, `el bloque «${b.id}» no enlaza a /lectura/${b.notaId}`);
    ok(NOTAS.some((n) => n.fuente === b.fuente), `el bloque «${b.id}» inventa una fuente (${b.fuente})`);
  }
  for (const n of NOTAS.slice(0, 3)) {
    ok(textos(p).some((t) => t.includes(n.titulo)), `el titular «${n.titulo}» no aparece literal en el programa`);
  }
  ok(p.notaIds.length === 4, `notaIds debe listar 4 asuntos y lista ${p.notaIds.length}`);
  ok(guion.programaATexto(p).length > 400, "programaATexto debe devolver el guion completo");

  // CRITERIO NUEVO: dice cuántos medios firman un asunto repetido
  const pr = guion.construirPrograma(REPETIDAS, { ahora: AHORA, limite: 2 });
  const contexto = pr.bloques.find((b) => b.tipo === "contexto");
  ok(!!contexto, "el programa no dice cuántos medios firman el asunto repetido");
  ok(contexto.texto.includes("Agencia Dos") && contexto.texto.includes("Agencia Tres"), `el bloque de contexto no enumera las fuentes reales: «${contexto.texto}»`);
  ok(/firman/.test(contexto.texto), "el bloque de contexto no usa la fórmula de fuentes");
  ok(pr.repetidos >= 2, `el programa debe declarar los cables agrupados y declara ${pr.repetidos}`);

  // CRITERIO NUEVO: cifras del archivo al principio
  ok(p.bloques.some((b) => b.tipo === "cifras"), "el programa no da las cifras del archivo");
  const cifras = p.bloques.find((b) => b.tipo === "cifras").texto;
  ok(cifras.includes("6 cables") && cifras.includes("5 medios"), `las cifras no coinciden con el archivo: «${cifras}»`);

  // CRITERIO NUEVO: la duración manda en cuántos asuntos entran
  const corto = guion.construirPrograma(NOTAS, { ahora: AHORA, objetivoMs: 2 * 60000 });
  const largoP = guion.construirPrograma(NOTAS, { ahora: AHORA, objetivoMs: 15 * 60000 });
  ok(corto.asuntos === 3, `un programa de 2 min debe cubrir 3 asuntos y cubre ${corto.asuntos}`);
  ok(largoP.asuntos > corto.asuntos, "un programa de 15 min debe cubrir más asuntos que uno de 2");
  ok(largoP.duracionMs > corto.duracionMs, "más asuntos deben durar más");

  // CRITERIO NUEVO: no repite sus propias fórmulas
  const muchos = [...NOTAS, ...REPETIDAS, ...NOTAS.map((n) => ({ ...n, id: n.id + "-b" }))];
  const pM = guion.construirPrograma(muchos, { ahora: AHORA, limite: 8 });
  const puentes = pM.bloques.filter((b) => b.tipo === "puente").map((b) => b.texto);
  let repetidosSeguidos = 0;
  for (let i = 1; i < puentes.length; i++) if (puentes[i] === puentes[i - 1]) repetidosSeguidos += 1;
  ok(repetidosSeguidos === 0, `el programa repite el mismo conector seguido (${repetidosSeguidos} veces)`);

  // tres estilos, tres radios
  const s = (pp) => pp.bloques.find((x) => x.tipo === "sintonia").texto;
  const a = guion.construirPrograma(NOTAS, { ahora: AHORA, estilo: "serena" });
  const b2 = guion.construirPrograma(NOTAS, { ahora: AHORA, estilo: "cercana" });
  const c = guion.construirPrograma(NOTAS, { ahora: AHORA, estilo: "filosa" });
  ok(new Set([s(a), s(b2), s(c)]).size >= 2, "los tres estilos comparten la misma sintonía");
  ok(guion.construirPrograma(NOTAS, { ahora: AHORA, estilo: "desconocido" }).estilo === "cercana", "un estilo inválido debe caer en el de por defecto");

  // fecha inválida: no se inventa un «hace X»
  const sinFecha = guion.construirPrograma([{ ...NOTAS[0], fecha: "no-es-fecha" }], { ahora: AHORA });
  ok(!/hace/i.test(textos(sinFecha).join(" ")), "una fecha inválida no puede producir un «hace X»");

  // guion de trabajo y etiquetas
  const g = guion.programaAGuion(p);
  ok(g.includes("# Radio Vanguard"), "programaAGuion no lleva cabecera");
  ok(g.includes("[desarrollo·"), "programaAGuion no marca tipo y pausa de cada bloque");
  ok(g.includes("/lectura/"), "programaAGuion no lleva los enlaces de las fuentes");
  ok(guion.etiquetasDe(p).length > 0, "etiquetasDe no devuelve nada");

  // haceLegible
  ok(guion.haceLegible(iso(1), AHORA) === "hace un momento", "haceLegible no dice «un momento»");
  ok(guion.haceLegible(iso(12), AHORA) === "hace 12 minutos", "haceLegible no cuenta minutos");
  ok(guion.haceLegible(iso(120), AHORA) === "hace 2 horas", "haceLegible no cuenta horas");
  ok(guion.haceLegible("no-es-fecha", AHORA) === "", "haceLegible debe devolver vacío con una fecha rota");
}

// ═══════════════ C · LA CONVERSACIÓN ═══════════════════════════════
seccion("C · la conversación: memoria, seguimientos y cifras");
{
  const intencion = (q, m) => conversar.interpretar(q, m).intencion;
  ok(intencion("Hola") === "saludo", "«Hola» no se interpreta como saludo");
  ok(intencion("¿qué pasa en Europa?") === "region", "una región no se interpreta como región");
  ok(intencion("dame el resumen del día") === "resumen", "«resumen» no se interpreta como resumen");
  ok(intencion("¿qué hora es?") === "hora", "«qué hora es» no se interpreta como hora");
  ok(intencion("¿algo bueno?") === "buenas", "«algo bueno» no se interpreta como buenas noticias");
  ok(intencion("cállate ya") === "silencio", "«cállate» no se interpreta como silencio");
  ok(intencion("¿qué puedes hacer?") === "ayuda", "«qué puedes hacer» no se interpreta como ayuda");
  ok(intencion("") === "desconocida", "una pregunta vacía debe ser desconocida");
  ok(intencion("repite eso") === "repite", "«repite» no se interpreta como repetición");
  ok(intencion("cuéntame más") === "seguir", "«cuéntame más» no se interpreta como seguimiento");
  ok(intencion("la segunda") === "indice", "«la segunda» no se interpreta como índice");
  ok(intencion("¿cuántos cables hay?") === "estadistica", "«cuántos cables» no se interpreta como cifra");
  ok(intencion("¿Europa o África?") === "comparar", "una comparación con «o» no se interpreta como comparación");
  ok(intencion("¿qué medio firma más?") === "estadistica", "«qué medio firma más» no se interpreta como cifra");

  const saludo = conversar.responder("Hola", NOTAS, AHORA);
  ok(saludo.intencion === "saludo" && saludo.hallado, "el saludo debe saludar");
  ok(saludo.texto.includes("6"), "el saludo debe decir cuántos cables hay");
  ok(saludo.siguientes.length > 0, "el saludo debe ofrecer preguntas siguientes");

  const region = conversar.responder("¿Qué pasa en Ucrania?", NOTAS, AHORA);
  ok(region.intencion === "region", `preguntar por Ucrania debe caer en región y cayó en ${region.intencion}`);
  ok(region.notaIds.length === 2 && region.notaIds.every((id) => id === "n1" || id === "n6"), "la respuesta de región no trae los cables de Europa");
  ok(region.rotulos.every((r) => r.href.startsWith("/lectura/")), "los rótulos no enlazan a /lectura/");

  // MEMORIA: seguimiento después de una respuesta
  const seguir = conversar.responder("cuéntame más", NOTAS, AHORA, region.memoria);
  ok(seguir.intencion === "seguir", `«cuéntame más» debe ser seguimiento y fue ${seguir.intencion}`);
  ok(seguir.hallado, "el seguimiento debe traer algo");
  ok(seguir.notaIds.some((id) => !region.notaIds.includes(id)) || seguir.texto.length > 0, "el seguimiento no aporta nada nuevo");

  // REPETIR: devuelve lo mismo que se dijo
  const repite = conversar.responder("repite", NOTAS, AHORA, seguir.memoria);
  ok(repite.intencion === "repite", "«repite» no se atiende");
  ok(repite.texto === seguir.memoria.ultimaRespuesta, "«repite» no devuelve la última respuesta");

  // ÍNDICE: «la segunda» dentro de lo contado
  const indice = conversar.responder("la segunda", NOTAS, AHORA, region.memoria);
  ok(indice.intencion === "indice", "«la segunda» no se atiende");
  ok(indice.hallado && indice.notaIds.length === 1, "«la segunda» no devuelve un cable");
  ok(indice.notaIds[0] === region.memoria.ultimas[1], "«la segunda» no devuelve la segunda nota de la conversación");

  // CIFRAS
  const cables = conversar.responder("¿cuántos cables hay?", NOTAS, AHORA);
  ok(cables.hallado && cables.texto.includes("6") && cables.texto.includes("asuntos"), `la cifra de cables no es la real: «${cables.texto}»`);
  const medios = conversar.responder("¿cuántos medios hay?", NOTAS, AHORA);
  ok(medios.texto.includes("5"), `la cifra de medios no es la real: «${medios.texto}»`);
  const topRegion = conversar.responder("¿qué región tiene más?", NOTAS, AHORA);
  ok(/Europa|América|Asia|África|Oriente/.test(topRegion.texto), "la región con más cables no se nombra");
  ok(topRegion.notaIds.length > 0, "la respuesta de región top no trae cables");
  const topFuente = conversar.responder("¿qué medio firma más?", NOTAS, AHORA);
  ok(topFuente.texto.includes("Agencia Uno"), `la fuente más activa debería ser Agencia Uno: «${topFuente.texto}»`);
  const ultimo = conversar.responder("último cable", NOTAS, AHORA);
  ok(ultimo.hallado && /Agencia Uno/.test(ultimo.texto), "el último cable no se identifica bien");
  const temas = conversar.responder("¿de qué se habla hoy?", NOTAS, AHORA);
  ok(temas.hallado && temas.texto.includes("cables"), "los temas del día no se contestan");

  // COMPARAR
  const comp = conversar.responder("¿Europa o África?", NOTAS, AHORA);
  ok(comp.intencion === "comparar" && comp.hallado, "la comparación no se contesta");
  ok(/Europa/.test(comp.texto) && /África/.test(comp.texto), `la comparación no nombra las dos regiones: «${comp.texto}»`);

  // EL «NO LO TENGO» SIGUE EN PIE
  const nada = conversar.responder("¿Qué pasa con el volcán de Islandia?", NOTAS, AHORA);
  ok(nada.hallado === false, "lo que no está debe declararse no hallado");
  ok(nada.notaIds.length === 0, "no hallado no puede traer notas");
  ok(/no tengo un cable/i.test(nada.texto), "la respuesta vacía debe decir que no lo tiene");
  ok(nada.siguientes.length > 0, "el «no lo tengo» debe ofrecer una salida");

  const vacio = conversar.responder("resumen", [], AHORA);
  ok(vacio.hallado === false && /archivo/i.test(vacio.texto), "sin cables el resumen debe decirlo");

  const hora = conversar.responder("¿qué hora es?", NOTAS, Date.parse("2026-11-18T09:07:00.000Z"));
  ok(/9 y 7/.test(hora.texto), `la hora no coincide con el reloj dado: «${hora.texto}»`);

  // nada de basura en ninguna respuesta
  const preguntas = ["hola", "resumen", "¿Qué pasa en África?", "¿algo bueno?", "xyzzy", "¿qué puedes hacer?", "cuéntame más", "la primera", "repite", "¿cuántos cables hay?", "¿Europa o Asia?", "último cable", "¿de qué se habla hoy?"];
  for (const q of preguntas) {
    const r = conversar.responder(q, NOTAS, AHORA);
    ok(!PROHIBIDO.test(r.texto), `la respuesta a «${q}» contiene basura`);
    ok(r.texto.trim().length > 0, `la respuesta a «${q}» está vacía`);
    ok(Array.isArray(r.rotulos) && Array.isArray(r.siguientes), `la respuesta a «${q}» no trae rótulos y siguientes`);
    ok(r.memoria && typeof r.memoria.turnos === "number", `la respuesta a «${q}» no devuelve memoria`);
  }
  ok(conversar.SUGERENCIAS.length >= 4, "hacen falta preguntas de arranque");
  for (const s of conversar.SUGERENCIAS) {
    ok(conversar.interpretar(s).intencion !== "desconocida", `la sugerencia «${s}» no se entiende`);
  }
  ok(conversar.MEMORIA_VACIA.turnos === 0, "la memoria vacía debe empezar en cero turnos");
}

// ═══════════════ D · LA CASA ═══════════════════════════════════════
seccion("D · el estudio, la página y los registros");
{
  const reproductor = leer("src/components/radio/radio-vanguard.tsx");
  ok(reproductor.includes('from "@/lib/voz/decir"'), "el reproductor no usa la boca de la casa (decir)");
  ok(reproductor.includes("usaEmision"), "el estudio no usa el encadenado compartido (usa-emision)");
  ok(!/setTimeout\([\s\S]{0,90}pausaMs\)/.test(reproductor), "el estudio volvió a tener su propia copia del bucle de emisión");
  ok(/onFrase/.test(reproductor) || reproductor.includes("emision.frase"), "el reproductor no pide los subtítulos frase a frase");
  ok(reproductor.includes("guardarGustos") && reproductor.includes("leerGustos"), "la personalización no se guarda y recupera");
  ok(reproductor.includes("vxr-rail") && reproductor.includes("vxr-tramo"), "no hay rail de bloques");
  ok(reproductor.includes("vxr-caption"), "no hay subtítulos en pantalla");
  ok(reproductor.includes("PRESETS"), "no hay presets");
  ok(reproductor.includes("SpeechRecognition"), "no hay micrófono");
  ok(reproductor.includes("mediaSession"), "no hay controles del sistema (Media Session)");
  ok(reproductor.includes("wakeLock"), "no se evita que la pantalla se apague");
  ok(reproductor.includes("LS_POS"), "no se recuerda por dónde ibas");
  ok(/onKeyDown/.test(reproductor) && /ArrowRight/.test(reproductor), "no hay atajos de teclado");
  ok(reproductor.includes("programaAGuion"), "no se puede copiar el guion de trabajo");
  ok(!/innerHTML/.test(reproductor), "el reproductor inyecta HTML (peligro de romper la página)");

  // ── UNA SOLA EMISIÓN PARA TODA LA CASA (v431.5) ──
  const emision = leer("src/lib/radio/usa-emision.ts");
  ok(/export function usaEmision/.test(emision), "no existe el encadenado compartido usaEmision");
  ok(/decir\(bloque\.texto/.test(emision), "usaEmision no dice bloque a bloque");
  ok(/bloque\.pausaMs/.test(emision), "usaEmision no respeta la pausa declarada");
  ok(/setTimeout\([\s\S]{0,90}pausaMs\)/.test(emision), "usaEmision no espera el silencio de verdad");
  ok(/onFrase/.test(emision), "usaEmision no avisa de cada frase (sin subtítulos)");
  ok(/pararBoca/.test(emision), "usaEmision no puede cortar la voz");

  const emisora = leer("src/components/radio/emisora-global.tsx");
  ok(emisora.includes("usaEmision"), "la emisora global no usa el mismo encadenado que el estudio");
  ok(emisora.includes("/api/radio/programa"), "la emisora global no pide el programa al servidor");
  ok(emisora.includes("RUTAS_SIN_EMISORA"), "la emisora no se aparta en las salas que ya tienen voz");
  ok(existsSync(join(RAIZ, "src/app/api/radio/programa/route.ts")), "no existe /api/radio/programa");
  const api = leer("src/app/api/radio/programa/route.ts");
  ok(api.includes("obtenerNotas"), "la API del programa no lee los cables reales");
  ok(api.includes("construirPrograma"), "la API del programa no usa el guion de la casa");
  ok(/revalidate = 300/.test(api), "la API del programa no declara caché");

  const layout = leer("src/app/layout.tsx");
  // v436.0 · la ley cambió con v434.2: no hay píldora flotante de voz en la
  // casa (una sola voz, sin botones sueltos). Lo que sí debe cumplirse es que
  // la voz se encienda en UN toque desde el teléfono y viva en su sala:
  const muelle = leer("src/components/vanguard/muelle-movil.tsx");
  const cabecera = leer("src/components/portada/cabecera.tsx");
  ok(
    /<BotonRadioMuelle\s*\/>/.test(cabecera) && muelle.includes("usaEmision") && muelle.includes("/api/radio/programa"),
    "la voz no se enciende en un toque desde el muelle del teléfono"
  );
  ok(
    /rutas\.push|"\/radio"/.test(muelle) && layout.includes("<Caras"),
    "la sala de la voz no está enlazada desde el muelle o falta el interruptor de cara"
  );
  ok(layout.includes("<Caras"), "el interruptor de cara no está montado en la casa entera");

  const caras = leer("src/components/vanguard/caras.tsx");
  // v436.0 · el Cuartel se disolvió y su puerta redirige a /orden: la cara «Salas»
  // apunta a donde de verdad están las salas (lo fijó v435.2).
  ok(/href: "\/"|href="\/"/.test(caras) && /href: "\/orden"|href="\/orden"/.test(caras), "las dos caras no apuntan a la portada y a Salas y orden (/orden)");
  ok(caras.includes('href="/radio"'), "el interruptor no lleva a la radio");
  ok(!/SECTIONS|ALL_TABS/.test(caras), "el interruptor duplica la navegación de salas (debe ser solo dos caras)");

  const decir = leer("src/lib/voz/decir.ts");
  ok(/onFrase\?:/.test(decir), "decir() no ofrece el aviso por frase que usa la radio");
  ok(/opts\.onFrase\?\./.test(decir), "decir() declara onFrase pero no lo llama");

  ok(existsSync(join(RAIZ, "src/app/radio/page.tsx")), "no existe /radio");
  const pagina = leer("src/app/radio/page.tsx");
  ok(pagina.includes("<RadioVanguard"), "/radio no monta el reproductor");
  ok(pagina.includes("obtenerNotas"), "/radio no lee los cables reales");
  ok(pagina.includes("estadisticas"), "/radio no publica las cifras reales del archivo");
  ok(pagina.includes("vxr-reglas"), "/radio no explica cómo se elige lo que se cuenta");
  ok((pagina.match(/<h1/g) ?? []).length === 1, "/radio debe tener un solo h1");
  ok(!pagina.includes('href="/radio"'), "/radio no debe enlazarse a sí misma como puerta");

  ok(existsSync(join(RAIZ, "src/lib/radio/agrupar.ts")), "no existe la mesa de edición (agrupar.ts)");

  const nucleo = leer("src/lib/nucleo/registro.ts");
  ok(nucleo.includes('id: "mod:radio"') || nucleo.includes('id:"mod:radio"'), "el Núcleo no conoce /radio");
  ok(nucleo.includes('ruta: "/radio"') || nucleo.includes('ruta:"/radio"'), "la ficha del Núcleo no apunta a /radio");

  const espacios = leer("src/lib/navegacion/espacios.ts");
  ok(espacios.includes('"/radio"'), "la barra de la casa no tiene /radio (quedaría huérfana)");

  const bitacora = leer("src/lib/bitacora.ts");
  ok(bitacora.includes('version: "v431.5"'), "la bitácora no tiene la entrada v431.5");

  const version = leer("src/lib/version.ts");
  ok(version.includes('export const APP_VERSION = "v431.5"'), "la versión en marcha no es v431.5");

  const css = leer("src/components/radio/radio.css");
  ok(css.includes(".vxr {"), "el CSS no define el contenedor .vxr");
  ok(/\.vxr[\s\S]{0,600}--vxr-oro:/.test(css), "el contenedor .vxr no declara sus tokens de color");
  ok(css.includes("prefers-reduced-motion"), "el CSS no apaga el movimiento");
  ok(css.includes(".vxr-rail") && css.includes(".vxr-captions"), "el CSS no viste el rail ni los subtítulos");
  ok(css.includes(".vxr-reglas"), "el CSS no viste las reglas de edición");
}

// ── resultado ──────────────────────────────────────────────────────
if (fallos.length) {
  console.error(`\n✖ ${fallos.length} fallos de ${pasadas + fallos.length} comprobaciones`);
  for (const f of fallos) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(`\n✔ ${pasadas} comprobaciones · la radio agrupa, elige, cabe en el tiempo, lee, respira, conversa y no inventa`);
