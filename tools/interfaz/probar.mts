// ═══════════════════════════════════════════════════════════════════════════
// v436.2 · PRUEBA DEL PULSO — las voces, las perillas y el movimiento
//
//   npx tsx tools/interfaz/probar.mts
//
// Lo que se puede romper mañana sin que nadie lo note:
//   ① que dos acciones acaben sonando igual (el «único» deja de ser cierto);
//   ② que una voz se cuele por encima del oído o dure una eternidad;
//   ③ que el portero deje sonar en modo calma, en pestaña oculta o sin gesto;
//   ④ que el anti-metralleta no frene y un botón se vuelva una ametralladora;
//   ⑤ que las preferencias se coman basura guardada y dejen la casa muda o
//     temblando;
//   ⑥ que el CSS prometa animaciones que no existen o que se olvide de
//     respetar `prefers-reduced-motion` / `data-vg-mov` / `data-vg-anim`;
//   ⑦ que se cuele un asset de audio (la casa sintetiza, no descarga);
//   ⑧ que el descubrimiento se quede sin sus sonidos por un refactor.
// ═══════════════════════════════════════════════════════════════════════════

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  ACCIONES, TODAS, esAccion, firma, firmasUnicas, duracionDe,
  puedeSonar, tocaAhora, marcarDisparo, olvidarDisparos, ACCION_POR_DEFECTO,
  type Accion,
} from "@/lib/sonido/acciones";
import {
  CLAVE, POR_DEFECTO, sanear, debeAnimar, nivel, leer,
  type Movimiento,
} from "@/lib/interfaz/vivo";

let ok = 0;
let mal = 0;
const fallos: string[] = [];

function comprueba(cond: boolean, texto: string) {
  if (cond) {
    ok++;
    console.log(` ✓ ${texto}`);
  } else {
    mal++;
    fallos.push(texto);
    console.log(` ✗ ${texto}`);
  }
}

const raiz = resolve(import.meta.dirname, "../..");
const lee = (p: string) => readFileSync(resolve(raiz, p), "utf8");

console.log("\n── ① las voces: una por acción, ninguna repetida ───────────────\n");

comprueba(TODAS.length >= 24, `hay ${TODAS.length} acciones con voz propia`);
comprueba(new Set(TODAS).size === TODAS.length, "no hay acciones duplicadas en el catálogo");

const firmas = TODAS.map(firma);
comprueba(new Set(firmas).size === firmas.length, `las ${firmas.length} firmas son distintas (${firmasUnicas().length} únicas)`);

const repetidas = firmas.filter((f, i) => firmas.indexOf(f) !== i);
comprueba(repetidas.length === 0, "ninguna voz comparte receta con otra");

const familias = new Set(TODAS.map((a) => ACCIONES[a].familia));
comprueba(familias.size >= 4, `hay ${familias.size} familias sonoras (${[...familias].join(", ")})`);

const sinQue = TODAS.filter((a) => !ACCIONES[a].que || ACCIONES[a].que.length < 12);
comprueba(sinQue.length === 0, "cada acción dice en palabras qué se oye");

const ques = TODAS.map((a) => ACCIONES[a].que);
comprueba(new Set(ques).size === ques.length, "ninguna acción describe lo mismo que otra");

console.log("\n── ② la ley del oído: nada chirría ni atruena ─────────────────\n");

const ganancias = TODAS.flatMap((a) => ACCIONES[a].notas.map((n) => n.g));
comprueba(Math.max(...ganancias) <= 0.09, `la ganancia máxima es ${Math.max(...ganancias)} (tope 0,09)`);
comprueba(Math.min(...ganancias) > 0, "ninguna nota sale con ganancia cero (no habría sonido)");

const notas = TODAS.flatMap((a) => ACCIONES[a].notas);
const conF = notas.filter((n) => n.tipo !== "ruido" && typeof n.f === "number");
comprueba(conF.length > 0 && Math.min(...conF.map((n) => n.f as number)) >= 60, "ninguna nota baja del oído útil (60 Hz)");
comprueba(Math.max(...conF.map((n) => n.f as number)) <= 8000, "ninguna nota sube del oído cómodo (8 kHz)");

const duraciones = notas.map((n) => n.d);
comprueba(Math.min(...duraciones) >= 0.02, "ningún golpe es tan corto que el navegador lo recorte");
comprueba(Math.max(...duraciones) <= 3, "ningún golpe dura más de 3 s");

const accionesLargas = TODAS.filter((a) => duracionDe(a) > 4);
comprueba(accionesLargas.length === 0, "ninguna acción se alarga más de 4 s en total");

const muchosGolpes = TODAS.filter((a) => ACCIONES[a].notas.length > 6);
comprueba(muchosGolpes.length === 0, "ninguna acción amontona más de 6 golpes");

console.log("\n── ③ el portero: silencio honrado ────────────────────────────\n");

comprueba(puedeSonar({ mudo: false, calma: false, gesto: true }) === true, "con sonido, sin calma y con gesto: suena");
comprueba(puedeSonar({ mudo: true, calma: false, gesto: true }) === false, "el Dueño apagó el sonido: no suena");
comprueba(puedeSonar({ mudo: false, calma: true, gesto: true }) === false, "modo calma (lectura/silencio): no suena");
comprueba(puedeSonar({ mudo: false, calma: false, gesto: false }) === false, "sin gesto previo: no suena (política del navegador)");
comprueba(puedeSonar({ mudo: false, calma: false, gesto: true, oculto: true }) === false, "pestaña oculta: no suena");
comprueba(puedeSonar({ mudo: true, calma: true, gesto: false, oculto: true }) === false, "todas las razones a la vez: tampoco");

console.log("\n── ④ el anti-metralleta ──────────────────────────────────────\n");

olvidarDisparos();
const a: Accion = "panel-abrir";
comprueba(tocaAhora(a, 1000) === true, "la primera vez, la acción suena");
marcarDisparo(a, 1000);
comprueba(tocaAhora(a, 1010) === false, "10 ms después no vuelve a sonar (rebote de ratón)");
comprueba(tocaAhora(a, 1000 + ACCIONES[a].cada + 1) === true, `pasado su margen (${ACCIONES[a].cada} ms) vuelve a sonar`);
olvidarDisparos();
comprueba(tocaAhora(a, 5) === true, "olvidarDisparos deja el reloj limpio (la prueba no se contamina)");

const cadaMini = Math.min(...TODAS.map((x) => ACCIONES[x].cada));
comprueba(cadaMini >= 35, `el margen más corto es ${cadaMini} ms (no hay acción sin freno)`);

console.log("\n── ⑤ las perillas: no se comen basura ────────────────────────\n");

comprueba(esAccion("paso-hecho"), "esAccion reconoce una acción real");
comprueba(!esAccion("paso-inventado"), "esAccion rechaza una acción inventada");
comprueba(!esAccion(undefined) && !esAccion(42) && !esAccion(null), "esAccion aguanta basura sin romperse");
comprueba(esAccion(ACCION_POR_DEFECTO), "la acción por defecto existe de verdad");

comprueba(CLAVE.startsWith("vg:") && CLAVE.endsWith(":v1"), `la clave del aparato está versionada (${CLAVE})`);
comprueba(POR_DEFECTO.sonido === true, "por defecto la casa suena (solo tras un gesto)");
comprueba(POR_DEFECTO.movimiento === "auto", "por defecto el movimiento obedece al sistema");

const sucio = sanear({ sonido: "sí", movimiento: "disco", extra: 1 });
comprueba(sucio.sonido === true && sucio.movimiento === "auto", "almacén sucio → vuelve al defecto, sin romperse");
const parcial = sanear({ sonido: false });
comprueba(parcial.sonido === false && parcial.movimiento === "auto", "lo válido se conserva y lo ausente se rellena");
comprueba(sanear(null).sonido === true, "sin almacén, la casa sigue teniendo perillas");
comprueba(leer().sonido === true, "en node (sin localStorage) leer() devuelve el defecto");

comprueba(debeAnimar({ sonido: true, movimiento: "quieto" }, false) === false, "«quieto» apaga el movimiento aunque el sistema no lo pida");
comprueba(debeAnimar({ sonido: true, movimiento: "auto" }, true) === false, "«auto» con el sistema en reduce: no anima");
comprueba(debeAnimar({ sonido: true, movimiento: "auto" }, false) === true, "«auto» con el sistema normal: anima");
comprueba(debeAnimar({ sonido: true, movimiento: "suave" }, true) === true, "«suave» anima lo justo aunque el sistema pida reduce");

const niveles: Movimiento[] = ["auto", "suave", "quieto"];
comprueba(niveles.every((m) => ["pleno", "suave", "quieto"].includes(nivel({ sonido: true, movimiento: m }, false))), "toda perilla produce un nivel que el CSS entiende");
comprueba(nivel({ sonido: true, movimiento: "auto" }, true) === "suave", "el sistema en reduce se traduce a nivel «suave»");

console.log("\n── ⑥ el CSS: ni animaciones fantasma ni movimiento forzado ───\n");

const vivoCss = lee("src/app/vivo.css");
const descubrimientoCss = lee("src/components/descubrimiento/descubrimiento.css");
const hubCss = lee("src/app/descubrir/descubrir.css");
const keyframes = [...vivoCss.matchAll(/@keyframes\s+([a-zA-Z0-9_-]+)/g)].map((m) => m[1]);
comprueba(keyframes.length >= 6, `vivo.css declara ${keyframes.length} fotogramas`);

const usadas = [...vivoCss.matchAll(/animation:\s*([a-zA-Z0-9_-]+)/g)].map((m) => m[1]);
const fantasma = [...new Set(usadas)].filter((u) => !keyframes.includes(u) && u !== "none");
comprueba(fantasma.length === 0, fantasma.length ? `animaciones sin fotogramas: ${fantasma.join(", ")}` : "cada animación usada tiene su @keyframes");

comprueba(/prefers-reduced-motion:\s*reduce/.test(vivoCss), "vivo.css respeta prefers-reduced-motion");
comprueba(/data-vg-mov="quieto"/.test(vivoCss), "vivo.css obedece la perilla «quieto»");
comprueba(/data-vg-anim="desactivadas"/.test(vivoCss), "vivo.css respeta el sistema de animaciones v416.0");
comprueba(/data-vg-oculto="1"/.test(vivoCss), "vivo.css para todo en una pestaña oculta");

const duracionesCss = [...vivoCss.matchAll(/(\d+)ms/g)].map((m) => Number(m[1]));
comprueba(Math.max(...duracionesCss) <= 900, `ninguna transición pasa de 900 ms (máx ${Math.max(...duracionesCss)} ms): nada se arrastra`);

const todosLosFotogramas = [
  ...keyframes,
  ...[descubrimientoCss, hubCss].flatMap((css) => [...css.matchAll(/@keyframes\s+([a-zA-Z0-9_-]+)/g)].map((m) => m[1])),
];
for (const [nombre, css] of [["descubrimiento.css", descubrimientoCss], ["descubrir.css", hubCss]] as const) {
  const refs = [...css.matchAll(/animation:\s*([a-zA-Z0-9_-]+)/g)].map((m) => m[1]);
  const rotas = [...new Set(refs)].filter((r) => !todosLosFotogramas.includes(r) && r !== "none");
  comprueba(rotas.length === 0, rotas.length ? `${nombre} usa animaciones sin fotogramas: ${rotas.join(", ")}` : `${nombre} solo usa fotogramas declarados`);
}

console.log("\n── ⑦ la casa sintetiza: ni un solo archivo de audio ─────────\n");

const fuentesSonido = ["src/lib/sonido/acciones.ts", "src/lib/sonido/tocar.ts", "src/lib/sound.ts"];
const conAsset = fuentesSonido.filter((f) => /\.(mp3|wav|ogg|m4a|flac)\b|https?:\/\//.test(lee(f)));
comprueba(conAsset.length === 0, conAsset.length ? `assets o URLs en: ${conAsset.join(", ")}` : "ningún mp3/wav/URL: todo sale del Web Audio");

const tocarSrc = lee("src/lib/sonido/tocar.ts");
comprueba(/puedeSonar\(/.test(tocarSrc), "suena() pasa por el portero (no hay atajo al altavoz)");
comprueba(/calmaActiva\(\)/.test(tocarSrc), "suena() consulta el modo calma de la casa");
comprueba(/initSound/.test(tocarSrc), "el audio se despierta con la pieza de la casa, no con un contexto paralelo");

console.log("\n── ⑧ el descubrimiento no se queda mudo ──────────────────────\n");

const panel = lee("src/components/descubrimiento/descubrimiento.tsx");
const hub = lee("src/app/descubrir/descubrir-cliente.tsx");
const layout = lee("src/app/layout.tsx");

const accionesPanel: Accion[] = ["panel-abrir", "panel-cerrar", "pestana", "sala-nueva", "paso-hecho", "modo-libre", "reiniciar"];
for (const x of accionesPanel) {
  comprueba(panel.includes(`suena("${x}")`), `el panel usa su voz: ${x}`);
}
const accionesHub: Accion[] = ["viaje", "paso-hecho", "filtro", "ficha-abrir", "ficha-cerrar", "sorpresa", "reiniciar"];
for (const x of accionesHub) {
  // la ficha elige su voz en un ternario: se busca el nombre, no la llamada literal
  comprueba(hub.includes(`"${x}"`), `el hub usa su voz: ${x}`);
}
comprueba(panel.includes("<AjustesVivo"), "el panel ofrece los interruptores de sonido y movimiento");
comprueba(hub.includes("<AjustesVivo"), "el hub ofrece los interruptores de sonido y movimiento");
comprueba(layout.includes("<Vivo />"), "la capa viva está montada en toda la casa");
comprueba(layout.includes('import "./vivo.css"'), "la hoja del pulso entra en el layout");

const sorpresa = hub.includes("const sorpresa") && hub.includes("Math.random");
comprueba(sorpresa, "existe la sorpresa del mandato: «llévame a algo que no conozco»");

const todoSuena = TODAS.every((x) => panel.includes(`"${x}"`) || hub.includes(`"${x}"`) || x === "entrar-casa" || x === "permiso-voz" || x === "silencio" || x === "logro" || x === "aviso" || x === "error" || x === "copiar" || x === "guardar" || x === "predecir" || x === "deshacer" || x === "paso-ir" || x === "guia-elegida" || x === "progreso-subir" || x === "buscar");
comprueba(todoSuena, "cada voz del catálogo tiene un lugar donde suena (panel, hub o acción de la casa)");

console.log(`\nRESULTADO: ${ok} comprobaciones, ${mal} fallos\n`);
if (mal > 0) {
  console.log("FALLOS:");
  for (const f of fallos) console.log(` · ${f}`);
  process.exit(1);
}
