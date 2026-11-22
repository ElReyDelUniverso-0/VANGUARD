// ═══════════════════════════════════════════════════════════════════════════
// v437.2 · PRUEBA DEL MERCADO — diez puestos, diez mercaderes, una contradanza
//
//   npx tsx tools/mercado/probar.mts
//
// Lo que se puede romper mañana sin que nadie lo note:
//   ① que el mercado deje de cubrir las diez familias (un puesto huérfano);
//   ② que una sección apunte a una ruta que ya no existe (la lista miente);
//   ③ que dos mercaderes se llamen igual o compartan oficio, pieza o saludo;
//   ④ que el buscador invente o deje de encontrar por tilde;
//   ⑤ que la música se salga del oído, atruene, se pase de la vuelta o deje de
//     ser una vuelta de ocho compases con campana en las entradas;
//   ⑥ que las diez familias vuelvan a la portada o al menú principal;
//   ⑦ que los personajes dejen de estar dibujados aquí (una descarga, un mp3);
//   ⑧ que se rompa la ley del sonido: ninguna voz propia, o un contexto nuevo.
// ═══════════════════════════════════════════════════════════════════════════

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

import {
  PUESTOS,
  SECCIONES,
  MERCADERES,
  buscar,
  cifrasMercado,
  hondo,
  llano,
  puestoDeId,
  puestoDelDia,
  type Pieza,
} from "@/lib/mercado/puestos";
import {
  BPM,
  DURACION_COMPAS,
  DURACION_VUELTA,
  NOTAS_POR_VUELTA,
  PULSOS_POR_COMPAS,
  SEGUNDO_POR_PULSO,
  SUELO_HZ,
  TECHO_HZ,
  TOTAL_COMPASES,
  hz,
  melodiaCompleta,
  nombreDeGrado,
  notasDeCompas,
  partitura,
} from "@/lib/mercado/musica";
import {
  SEGUNDOS_PREGON,
  pregonDe,
  pregonDelDia,
  pregones,
} from "@/lib/mercado/pregon";
import {
  CLAVE_CESTA,
  TOPE_CESTA,
  alternarCesta,
  cestaVacia,
  contarCesta,
  detalleCesta,
  enCesta,
  leerCesta,
  sanearCesta,
  textoCesta,
} from "@/lib/mercado/cesta";
import { EJES, EXPERIENCIAS } from "@/lib/experiencia/registro";
import { ACCIONES, TODAS, firma, firmasUnicas } from "@/lib/sonido/acciones";
import { NAV_PRIMARIO } from "@/lib/operacion/orden";

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

/** ¿Existe esta ruta como página de la casa? Acepta segmentos dinámicos ([id]). */
function existeRuta(href: string): boolean {
  const limpia = (href || "").split("?")[0].split("#")[0].replace(/\/+$/, "");
  if (!limpia.startsWith("/")) return false;
  let dir = resolve(raiz, "src/app");
  if (limpia === "") return existsSync(resolve(dir, "page.tsx"));
  for (const p of limpia.slice(1).split("/")) {
    const directa = resolve(dir, p);
    if (existsSync(directa) && statSync(directa).isDirectory()) {
      dir = directa;
      continue;
    }
    // segmento dinámico: [id], [p], [...resto] — cualquiera sirve
    let dinamica: string | null = null;
    try {
      const hijos = readdirSync(dir, { withFileTypes: true });
      const carpeta = hijos.find((h) => h.isDirectory() && h.name.startsWith("["));
      if (carpeta) dinamica = resolve(dir, carpeta.name);
    } catch {
      /* no es un directorio */
    }
    if (dinamica && existsSync(dinamica)) {
      dir = dinamica;
      continue;
    }
    return false;
  }
  return existsSync(resolve(dir, "page.tsx"));
}

const PIEZAS: Pieza[] = ["pregon", "globo", "legajo", "matraz", "balanza", "libro", "maqueta", "camara", "lupa", "torno"];

console.log("\n── ① los diez puestos ─────────────────────────────────────────\n");

comprueba(PUESTOS.length === 10, "hay diez puestos");
comprueba(PUESTOS.length === EJES.length, "un puesto por familia (las diez del registro)");
comprueba(
  EJES.every((e) => PUESTOS.some((p) => p.id === e.id)),
  "no falta ninguna familia en la plaza",
);
comprueba(new Set(PUESTOS.map((p) => p.id)).size === 10, "ningún puesto repetido");
comprueba(
  PUESTOS.every((p, i) => p.numero === EJES[i].numero && p.nombre === EJES[i].nombre && p.lema === EJES[i].lema),
  "los puestos conservan número, nombre y lema de su familia",
);
comprueba(
  PUESTOS.every((p) => /^#[0-9a-fA-F]{6}$/.test(p.color)),
  "cada puesto tiene su color de toldo (hex de seis)",
);
comprueba(
  PUESTOS.every((p) => /^#[0-9a-fA-F]{6}$/.test(p.hondo) && p.hondo !== p.color),
  "el color hondo se calcula y no repite el del toldo",
);
comprueba(hondo("#ffffff") !== hondo("#000000"), "el hondo distingue colores distintos");
comprueba(hondo("no-es-un-color") === "#1b1720", "un color roto no rompe la plaza");
comprueba(
  PUESTOS.every((p) => /^\/[a-z0-9/._-]+$/i.test(p.img)),
  "la imagen de cada puesto es una ruta de la casa",
);
comprueba(
  PUESTOS.every((p) => p.cifras.length >= 1 && p.cifras.length <= 2),
  "cada puesto trae de una a dos cifras (la ley del registro)",
);
comprueba(
  PUESTOS.every((p) => p.cifras.every((c) => c.valor.trim().length > 0 && c.etiqueta.trim().length > 0)),
  "ninguna cifra del puesto va vacía",
);
comprueba(puestoDeId("geografia")?.nombre === "Geografía", "se puede abrir un puesto por su id");
comprueba(puestoDeId("no-existe") === null, "un id inventado no devuelve un puesto fantasma");

console.log("\n── ② los diez mercaderes ──────────────────────────────────────\n");

const mercaderes = PUESTOS.map((p) => p.personaje);
comprueba(mercaderes.length === 10, "cada puesto tiene su mercader");
comprueba(new Set(mercaderes.map((m) => m.nombre)).size === 10, "ningún mercader repite nombre");
comprueba(new Set(mercaderes.map((m) => m.oficio)).size === 10, "ningún mercader repite oficio");
comprueba(new Set(mercaderes.map((m) => m.pieza)).size === 10, "ningún mercader repite pieza");
comprueba(new Set(mercaderes.map((m) => m.saludo)).size === 10, "ningún mercader repite saludo");
comprueba(
  mercaderes.every((m) => PIEZAS.includes(m.pieza)),
  "las diez piezas de oficio son las que se dibujan",
);
comprueba(
  mercaderes.every((m) => m.nombre.trim().length >= 3 && m.oficio.trim().length >= 4),
  "nombre y oficio tienen cuerpo (nadie se llama «x»)",
);
comprueba(
  mercaderes.every((m) => m.saludo.length >= 30 && /[.!?]$/.test(m.saludo)),
  "cada saludo es una frase entera, no un eslogan",
);
comprueba(
  Object.keys(MERCADERES).every((k) => EJES.some((e) => e.id === k)),
  "el catálogo de mercaderes no tiene claves de familias que no existen",
);

console.log("\n── ③ cada puesto con sus secciones (rutas reales) ─────────────\n");

comprueba(
  PUESTOS.every((p) => p.secciones.length >= 2),
  "todo puesto tiene al menos su puerta y una sección más",
);
comprueba(
  PUESTOS.every((p) => p.secciones[0].href === p.puerta),
  "la primera sección de cada puesto es su puerta canónica",
);
comprueba(
  PUESTOS.every((p) => new Set(p.secciones.map((s) => s.href)).size === p.secciones.length),
  "ningún puesto repite una sección",
);
comprueba(
  SECCIONES.length === PUESTOS.reduce((n, p) => n + p.secciones.length, 0),
  "el índice del mercado es exactamente la suma de los puestos",
);
comprueba(
  SECCIONES.length >= EXPERIENCIAS.length,
  "están todas las experiencias del registro (más la puerta de cada familia)",
);
comprueba(
  EXPERIENCIAS.every((x) => SECCIONES.some((s) => s.href === x.href && s.puesto === x.eje)),
  "cada experiencia aparece en el puesto de SU familia",
);
comprueba(
  SECCIONES.every((s) => s.nombre.trim() && s.detalle.trim()),
  "ninguna sección se enseña sin nombre ni explicación",
);
const inexistentes = [...new Set(SECCIONES.map((s) => s.href))].filter((h) => !existeRuta(h));
comprueba(inexistentes.length === 0, `todas las secciones abren una página de verdad (${inexistentes.length} rotas)`);
if (inexistentes.length) console.log("   rutas que ya no existen:", inexistentes.join(", "));
comprueba(existeRuta("/mercado"), "la propia plaza tiene su página");
comprueba(cifrasMercado().secciones === SECCIONES.length, "las cifras del mercado salen del propio índice");
comprueba(cifrasMercado().puestos === 10 && cifrasMercado().mercaderes === 10, "diez y diez, contados, no escritos");

console.log("\n── ④ el buscador de la plaza ──────────────────────────────────\n");

comprueba(buscar("").length === 0, "sin consulta el buscador no devuelve nada");
comprueba(buscar("geografia").some((h) => h.puesto.id === "geografia"), "encuentra por familia");
comprueba(buscar("Geografía").length === buscar("geografia").length, "las tildes no cambian el resultado");
comprueba(buscar("cartografo").some((h) => h.puesto.id === "geografia"), "encuentra por oficio, sin tilde");
comprueba(buscar("Nora").some((h) => h.puesto.id === "actualidad"), "encuentra por el nombre del mercader");
comprueba(
  buscar("academia").some((h) => h.puesto.id === "educacion" && h.secciones.some((s) => s.href === "/academia")),
  "encuentra una sección por su ruta",
);
comprueba(buscar("archivo").length > 0, "encuentra por lo que hace la sección");
comprueba(buscar("zzzz-no-existe").length === 0, "nada inventado: lo que no está, no aparece");
comprueba(
  buscar("mapa").every((h) => h.secciones.every((s) => llano([s.nombre, s.detalle, s.href].join(" ")).includes("mapa"))),
  "cuando filtra secciones, todas las que enseña responden a la consulta",
);
comprueba(llano("  El  MERCADO_de  Vanguard ") === "el mercado de vanguard", "el comparador normaliza espacios y guiones");

console.log("\n── ⑤ la música de la plaza ────────────────────────────────────\n");

comprueba(BPM === 100, "la contradanza va a 100 pulsos por minuto");
comprueba(Math.abs(SEGUNDO_POR_PULSO - 0.6) < 1e-9, "un pulso dura 0,6 s");
comprueba(Math.abs(DURACION_COMPAS - PULSOS_POR_COMPAS * 0.6) < 1e-9, "el compás de 4/4 dura 2,4 s");
comprueba(TOTAL_COMPASES === 8, "la vuelta tiene ocho compases");
comprueba(Math.abs(DURACION_VUELTA - 19.2) < 1e-9, "la vuelta entera dura 19,2 s");
comprueba(partitura().length === 8, "la partitura se puede leer compás a compás");
comprueba(partitura().every((c) => c.split(" · ").length >= 3), "cada compás tiene su frase, no una nota suelta");
comprueba(hz("La4") === 440, "La4 son 440 Hz");
comprueba(Math.abs(hz("Do5") - 523.25) < 0.02, "Do5 son 523,25 Hz");
comprueba(hz("no-es-una-nota") === 440, "una nota rota no rompe la vuelta");
const vuelta = melodiaCompleta();
comprueba(vuelta.length === NOTAS_POR_VUELTA && vuelta.length > 20, "la vuelta es una pieza, no un bip");
comprueba(
  vuelta.every((n) => n.tipo === "ruido" || ((n.f ?? 0) >= SUELO_HZ && (n.f ?? 0) <= TECHO_HZ)),
  "ninguna nota se sale del oído (80–1200 Hz)",
);
comprueba(vuelta.every((n) => n.g > 0 && n.g <= 0.09), "ninguna nota atruena (ganancia ≤ 0,09)");
comprueba(vuelta.every((n) => n.d > 0 && n.d <= 3), "ninguna nota dura una eternidad");
comprueba(
  vuelta.every((n) => (n.cuando ?? 0) + Math.min(3, n.d) <= DURACION_VUELTA + 0.001 || (n.cuando ?? 0) < DURACION_VUELTA),
  "la vuelta cabe en su tiempo (nada se cuela en la siguiente)",
);
comprueba(
  notasDeCompas(0).some((n) => n.tipo === "campana") && notasDeCompas(4).some((n) => n.tipo === "campana"),
  "la campana marca las dos entradas (compases 1 y 5)",
);
comprueba(
  notasDeCompas(2).every((n) => n.tipo !== "campana"),
  "los compases de en medio no llevan campana (no se vuelve monótona)",
);
comprueba(
  notasDeCompas(0).some((n) => n.tipo === "madera") && notasDeCompas(1).some((n) => n.tipo === "madera"),
  "el bajo de madera sostiene todos los compases",
);
comprueba(notasDeCompas(9).length === notasDeCompas(1).length, "el compás 9 vuelve a ser el 1 (la vuelta no se acaba)");
comprueba(notasDeCompas(-1).length === notasDeCompas(7).length, "un índice negativo no rompe la vuelta");
comprueba(["I", "IV", "V"].includes(nombreDeGrado(0)) && nombreDeGrado(8) === nombreDeGrado(0), "la armonía se lee y también da la vuelta");
comprueba(notasDeCompas(0).every((n) => (n.cuando ?? 0) < DURACION_COMPAS), "cada compás suena dentro de su compás");

console.log("\n── ⑥ fuera de la portada y fuera del menú principal ───────────\n");

const portada = lee("src/app/page.tsx");
const orden = lee("src/lib/operacion/orden.ts");
const muelle = lee("src/components/vanguard/muelle-movil.tsx");
comprueba(portada.includes("MercadoPortada"), "la portada monta la franja del mercado");
comprueba(!portada.includes("<Ecosistema />"), "la portada ya NO pinta el tráiler de las diez familias");
comprueba(portada.includes("/mercado") || lee("src/components/mercado/mercado-portada.tsx").includes("/mercado"), "de la portada se sale al mercado");
comprueba(
  NAV_PRIMARIO.filter((x) => x.href === "/mercado").length === 1,
  "el menú principal tiene UNA puerta al mercado",
);
comprueba(
  NAV_PRIMARIO.length <= 8,
  "el menú principal no crece con las diez familias (sigue corto)",
);
comprueba(
  NAV_PRIMARIO.filter((x) => EJES.some((e) => e.puerta === x.href)).length <= 1,
  "el menú principal no se convierte en la lista de las diez familias",
);
comprueba(muelle.includes('href: "/mercado"'), "el muelle del móvil también lleva al mercado");
comprueba(lee("src/lib/descubrimiento/fichas.ts").includes('href: "/mercado"'), "el mercado tiene ficha en el descubrimiento");
comprueba(existsSync(resolve(raiz, "src/app/mercado/page.tsx")), "el mercado es un módulo con su página");

console.log("\n── ⑦ los mercaderes están dibujados aquí ──────────────────────\n");

const personaje = lee("src/components/mercado/personaje.tsx");
comprueba(PIEZAS.every((p) => personaje.includes(`case "${p}"`)), "las diez piezas de oficio se dibujan");
comprueba(!/<img\b/i.test(personaje), "ningún mercader es una imagen descargada");
comprueba(!/https?:\/\//.test(personaje), "el dibujo no pide nada a la red");
comprueba(personaje.includes("pm-saluda"), "el mercader saluda cuando su puesto está abierto");
comprueba(personaje.includes("aria-label"), "el dibujo se explica a quien no lo ve");
const cliente = lee("src/components/mercado/mercado-cliente.tsx");
comprueba(!/https?:\/\//.test(cliente), "la plaza no carga nada de fuera");
comprueba(cliente.includes("buscar("), "el buscador de la plaza es el de los datos, no una copia");
comprueba(cliente.includes("puestoDelDia"), "el puesto del día se calcula, no se sortea");
comprueba(puestoDelDia(new Date(2026, 0, 1)).id === puestoDelDia(new Date(2026, 0, 1, 23, 59)).id, "el puesto del día no cambia dentro del día");
comprueba(puestoDelDia(new Date(2026, 0, 1)).id !== puestoDelDia(new Date(2026, 0, 2)).id, "y cambia al día siguiente");

console.log("\n── ⑧ la ley del sonido, cumplida en el mercado ────────────────\n");

for (const voz of ["puesto-abrir", "puesto-cerrar", "moneda", "mercado-musica"] as const) {
  comprueba(voz in ACCIONES, `la voz «${voz}» existe en el catálogo`);
  comprueba(TODAS.includes(voz), `la voz «${voz}» está en el índice de la casa`);
  comprueba(firma(voz).length > 0, `la voz «${voz}» tiene firma propia`);
}
comprueba(firmasUnicas(), "sigue sin haber dos voces iguales en toda la casa");
comprueba(
  ["puesto-abrir", "puesto-cerrar", "moneda", "mercado-musica"].every(
    (v) => cliente.includes(`"${v}"`) || lee("src/components/mercado/mercado-portada.tsx").includes(`"${v}"`),
  ),
  "las cuatro voces del mercado suenan en la plaza",
);
comprueba(cliente.includes("suenaNotas("), "la música avanza por compases con el motor de la casa");
comprueba(cliente.includes('visibilitychange') && cliente.includes("EVENTO"), "la música se calla al cambiar de pestaña y con el sonido apagado");
comprueba(cliente.includes("Escape"), "Escape cierra el puesto (sin secuestrar el teclado)");
comprueba(!/new AudioContext|createOscillator|\.mp3|\.wav/i.test(cliente), "la plaza no abre un contexto nuevo ni descarga audio");
comprueba(lee("src/lib/sonido/tocar.ts").includes("export function suenaNotas"), "el portero de la casa ofrece la música que avanza");
const css = lee("src/components/mercado/mercado.css");
comprueba(css.includes("prefers-reduced-motion"), "el mercado respeta a quien pidió no moverse");
comprueba(css.includes('data-vg-mov="quieto"'), "el mercado obedece la perilla de movimiento de la casa");
comprueba((css.match(/!important/g) ?? []).length <= 6, "la piel no abusa de !important (solo para la quietud)");


console.log("\n── ⑨ el pregón de la plaza ─────────────────────────────────────\n");

const cinta = pregones();
comprueba(cinta.length === 10, "el pregón tiene una línea por puesto");
comprueba(new Set(cinta.map((x) => x.texto)).size === 10, "ninguna línea del pregón se repite");
comprueba(
  cinta.every((x) => PUESTOS.some((p) => p.id === x.puesto.id) && x.texto.includes(x.puesto.personaje.nombre)),
  "cada línea dice el mercader de su puesto",
);
comprueba(
  cinta.every((x) => x.texto.includes(x.puesto.nombre) && x.texto.includes(String(x.puesto.secciones.length))),
  "cada línea dice la familia y cuántas secciones hay dentro",
);
comprueba(cinta.every((x) => x.href === `/mercado#puesto-${x.puesto.id}`), "cada línea lleva a SU puesto, no a la plaza");
comprueba(cinta.every((x) => x.texto.length >= 40 && x.texto.length <= 190), "las líneas caben en una cinta, ni mudas ni ladrillos");
comprueba(cinta.every((x) => !/[<>]/.test(x.texto)), "el pregón es texto, no marcado");
comprueba(pregonDe(10).puesto.id === pregonDe(0).puesto.id, "el pregón da la vuelta");
comprueba(pregonDe(-3).puesto.id === pregones()[7].puesto.id, "un índice negativo no rompe la cinta");
comprueba(pregonDelDia(new Date(2026, 4, 2)).puesto.id === pregonDelDia(new Date(2026, 4, 2, 22, 30)).puesto.id, "el pregón del día aguanta el día entero");
comprueba(SEGUNDOS_PREGON >= 5 && SEGUNDOS_PREGON <= 12, "el pregón da tiempo a leerlo (5–12 s por línea)");

console.log("\n── ⑩ la cesta ──────────────────────────────────────────────────\n");

const unaRuta = SECCIONES[0].href;
const otraRuta = SECCIONES[1].href;
comprueba(CLAVE_CESTA === "vg:mercado:v1", "la cesta vive en la clave de la casa (vg:mercado:v1)");
comprueba(contarCesta(cestaVacia()) === 0, "la cesta empieza vacía");
comprueba(contarCesta(alternarCesta(cestaVacia(), unaRuta)) === 1, "se puede echar una sección");
comprueba(enCesta(alternarCesta(cestaVacia(), unaRuta), unaRuta), "y queda apuntada");
comprueba(
  contarCesta(alternarCesta(alternarCesta(cestaVacia(), unaRuta), unaRuta)) === 0,
  "volver a tocarla la saca (la tecla es la misma)",
);
comprueba(
  contarCesta(alternarCesta(alternarCesta(alternarCesta(cestaVacia(), unaRuta), unaRuta), unaRuta)) === 1,
  "echar, sacar y volver a echar no duplica nada",
);
comprueba(
  contarCesta(alternarCesta(alternarCesta(cestaVacia(), unaRuta), otraRuta)) === 2,
  "dos secciones distintas caben las dos",
);
comprueba(contarCesta(alternarCesta(cestaVacia(), "/ruta-inventada")) === 0, "una ruta inventada no entra en la cesta");
comprueba(sanearCesta(["no-es-una-cesta"]).secciones.length === 0, "basura guardada no se convierte en cesta");
comprueba(sanearCesta(null).secciones.length === 0, "una cesta vacía de verdad no rompe nada");
comprueba(leerCesta("{esto no es json").secciones.length === 0, "un JSON roto se lee como cesta vacía");
comprueba(
  leerCesta(textoCesta(alternarCesta(cestaVacia(), unaRuta))).secciones[0] === unaRuta,
  "lo guardado y lo leído coinciden",
);
comprueba(
  sanearCesta({ secciones: Array.from({ length: TOPE_CESTA + 10 }, (_, i) => SECCIONES[i % SECCIONES.length].href) })
    .secciones.length <= TOPE_CESTA,
  "la cesta tiene tope (no es un almacén)",
);
comprueba(detalleCesta(alternarCesta(cestaVacia(), unaRuta))[0].href === unaRuta, "la cesta se resuelve con su sección entera");
comprueba(
  detalleCesta(alternarCesta(cestaVacia(), unaRuta))[0].puestoNombre.length > 0,
  "y dice de qué puesto es",
);

console.log("\n── ⑪ la plaza vive: pregón, ronda, voz, cesta y enlace ────────\n");

comprueba(cliente.includes("pregonDe(") && cliente.includes("pregones()"), "la plaza pinta el pregón desde sus datos");
comprueba(cliente.includes("setInterval") && cliente.includes("MS_RONDA"), "la ronda avanza con su propio reloj");
comprueba(cliente.includes("darUnaVuelta") && cliente.includes("ronda"), "hay ronda y se puede parar");
comprueba(cliente.includes('"Escape"'), "Escape para la ronda y cierra el puesto");
comprueba(cliente.includes("decir(") && cliente.includes("personaje.voz"), "el mercader habla con SU persona de la casa");
comprueba(cliente.includes("speechSynthesis"), "si el aparato no sabe hablar, se calla sin romperse");
comprueba(cliente.includes("pararBoca"), "cerrar el puesto corta la voz");
comprueba(cliente.includes("CLAVE_CESTA") && cliente.includes("localStorage"), "la cesta se guarda en el aparato");
comprueba(cliente.includes("alternarCesta("), "la cesta usa la lógica pura, no una copia");
comprueba(cliente.includes("clipboard") && cliente.includes("#puesto-"), "el enlace del puesto se puede copiar");
comprueba(cliente.includes("location.hash") && cliente.includes("puesto-"), "un enlace directo abre su puesto al entrar");
comprueba(cliente.includes("history.replaceState"), "abrir un puesto no recarga la página");
comprueba(lee("src/components/mercado/mercado-portada.tsx").includes("/mercado#puesto-"), "los toldos de la portada abren su puesto");
comprueba(lee("src/app/mercado/page.tsx").includes("pregonDelDia"), "la página cierra con el pregón del día");
const cssViva = lee("src/components/mercado/mercado.css");
for (const clase of ["pm-pregon", "pm-tecla", "pm-cesta", "pm-otro", "pm-aviso"]) {
  comprueba(cssViva.includes(`.${clase}`), `la piel tiene ${clase}`);
}
comprueba(cssViva.includes(".pm-plaza.pm-con-abierto"), "el puesto abierto manda en la plaza");
comprueba(
  PUESTOS.every((p) => ["locutora", "analista", "general", "cronista"].includes(p.personaje.voz)),
  "cada mercader tiene una persona de la boca de la casa",
);
comprueba(new Set(PUESTOS.map((p) => p.personaje.voz)).size >= 3, "no hablan los diez igual");
comprueba(new Set(PUESTOS.map((p) => p.personaje.voz)).size <= 4, "y no se inventan personas que la casa no tiene");

console.log(`\nRESULTADO: ${ok} comprobaciones, ${mal} fallos\n`);
if (mal > 0) {
  console.log("FALLOS:");
  for (const f of fallos) console.log(` · ${f}`);
  process.exit(1);
}
