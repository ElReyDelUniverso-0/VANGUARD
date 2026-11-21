// ═══════════════════════════════════════════════════════════════════════════
// v437.0 · PRUEBAS DE LA VOZ EN TU IDIOMA
//
// Lo que se comprueba, y por qué cada cosa importa:
//   ① EL MAPA. Ocho idiomas, cada uno con su etiqueta BCP-47, su frase de prueba
//      escrita en su propio alfabeto y sus símbolos. Si un saludo chino viniera
//      en latín, la prueba lo canta.
//   ② EL LIMPIADOR. «50 %» no se dice igual en Sevilla que en Berlín ni en
//      Pekín. Y lo que era del español (abreviaturas, cifras con letra) sigue
//      siendo del español: no se rompe lo que ya funcionaba.
//   ③ LOS MARCOS. En español, los tres estilos dicen EXACTAMENTE lo que decían
//      (texto literal comparado). En los demás idiomas las fórmulas son suyas y
//      los cables NO se traducen: viajan como se publicaron.
//   ④ EL GUION. Se construye en cada idioma, con su idioma declarado, y el
//      titular original sigue dentro.
//   ⑤ LAS PANTALLAS. Ninguna vuelve a escribir «es-ES» a mano; la sala de voz
//      usa la tabla, y el ▶ del muelle pide el programa con `lang=`.
//
// Se ejecuta con Node: `node scripts/pruebas-voz-idiomas.mjs`
// ═══════════════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (rel) => readFileSync(join(RAIZ, rel), "utf8");

let pasan = 0;
const fallos = [];
function ok(cond, mensaje) {
  if (cond) {
    pasan++;
  } else {
    fallos.push(mensaje);
  }
}
function seccion(t) {
  console.log(`\n── ${t}`);
}

// ── carga real de los módulos (TS → ESM con el compilador de la casa) ──
const ts = require("typescript");
const tmp = mkdtempSync(join(tmpdir(), "vg-voz-idiomas-"));
function cargar(archivo, salida) {
  const fuente = leer(archivo);
  const { outputText } = ts.transpileModule(fuente, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: archivo,
  });
  const js = outputText.replace(/from "\.\/([a-z-]+)"/g, 'from "./$1.mjs"');
  writeFileSync(join(tmp, salida), js, "utf8");
  return pathToFileURL(join(tmp, salida)).href;
}

writeFileSync(
  join(tmp, "_notas.mjs"),
  `export function relevancia(n, ahora = Date.now()) {
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

const urlIdiomas = cargar("src/lib/voz/idiomas.ts", "idiomas.mjs");
const urlLimpiar = cargar("src/lib/voz/limpiar.ts", "limpiar.mjs");
const urlMarcos = cargar("src/lib/radio/marcos.ts", "marcos.mjs");
const urlAgrupar = cargar("src/lib/radio/agrupar.ts", "agrupar.mjs");
const urlGuion = (() => {
  const fuente = leer("src/lib/radio/guion.ts");
  const { outputText } = ts.transpileModule(fuente, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: "src/lib/radio/guion.ts",
  });
  const js = outputText
    .replace(/from "\.\/([a-z-]+)"/g, 'from "./$1.mjs"')
    .replace(/from "@\/lib\/portada\/notas"/g, 'from "./_notas.mjs"');
  writeFileSync(join(tmp, "guion.mjs"), js, "utf8");
  return pathToFileURL(join(tmp, "guion.mjs")).href;
})();

const idiomas = await import(urlIdiomas);
const limpiar = await import(urlLimpiar);
await import(urlMarcos);
const marcos = await import(urlMarcos);
await import(urlAgrupar);
const guion = await import(urlGuion);
rmSync(tmp, { recursive: true, force: true });

const { IDIOMAS_VOZ, ORDEN_IDIOMAS, idiomaVoz, comoIdiomaVoz, esIdiomaVoz, decirSimbolo } = idiomas;

// ═══ A · EL MAPA DE LOS OCHO IDIOMAS ═══════════════════════════════════════
seccion("A · el mapa: ocho idiomas, cada uno con lo suyo");

ok(ORDEN_IDIOMAS.length === 8, `la casa debe tener 8 idiomas de voz (tiene ${ORDEN_IDIOMAS.length})`);
ok(
  ORDEN_IDIOMAS.join(",") === "es,en,pt,fr,de,it,ru,zh",
  "el orden de los idiomas cambió: la casa empieza por español"
);

const BCP = {
  es: "es-ES",
  en: "en-US",
  pt: "pt-BR",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  ru: "ru-RU",
  zh: "zh-CN",
};
for (const id of ORDEN_IDIOMAS) {
  const t = IDIOMAS_VOZ[id];
  ok(!!t, `falta la tabla de «${id}»`);
  ok(t.bcp47 === BCP[id], `la etiqueta de ${id} debe ser ${BCP[id]} (es ${t.bcp47})`);
  ok(t.saludo.length >= 20, `la frase de prueba de ${id} es demasiado corta`);
  ok(t.nativo.length > 0 && t.glyph.length > 0, `a ${id} le falta nombre o glifo`);
  ok(t.ajusteRitmo > 0.5 && t.ajusteRitmo <= 1.2, `el ritmo de ${id} se sale de lo razonable`);
  ok(t.pausaFrase >= 180 && t.pausaParrafo > t.pausaFrase, `las pausas de ${id} no respiran`);
  ok(t.simbolos.length >= 8, `a ${id} le faltan símbolos que decir`);
  ok(
    t.textos && Object.values(t.textos).every((v) => typeof v === "string" && v.trim().length > 0),
    `a ${id} le falta algún texto de la sala de voz`
  );
  ok(t.sinVoces.length > 20 && t.mejorEsMala.includes("{voz}"), `los avisos de ${id} no explican nada`);
}

// los alfabetos: si el chino viniera en latín, esto lo canta
ok(/[\u4e00-\u9fff]/.test(IDIOMAS_VOZ.zh.saludo), "la frase china no está en caracteres chinos");
ok(/[\u0400-\u04ff]/.test(IDIOMAS_VOZ.ru.saludo), "la frase rusa no está en cirílico");
ok(/[áéíóúñ]/.test(IDIOMAS_VOZ.es.saludo), "la frase española perdió sus tildes");
ok(/[àâçéèêëîïôûù]/.test(IDIOMAS_VOZ.fr.saludo), "la frase francesa no está en francés");
ok(/[äöüß]/.test(IDIOMAS_VOZ.de.saludo), "a la frase alemana le faltan sus letras");
ok(/[ãõç]/.test(IDIOMAS_VOZ.pt.saludo), "a la frase portuguesa le faltan sus letras");

// los saludos son distintos entre sí (nada de copiar y pegar)
const saludos = new Set(ORDEN_IDIOMAS.map((id) => IDIOMAS_VOZ[id].saludo));
ok(saludos.size === 8, "hay frases de prueba repetidas entre idiomas");

// el % se dice en cada idioma
const PORCIENTO = {
  es: "por ciento",
  en: "percent",
  pt: "por cento",
  fr: "pour cent",
  de: "Prozent",
  it: "per cento",
  ru: "процентов",
  zh: "百分之",
};
for (const id of ORDEN_IDIOMAS) {
  ok(
    decirSimbolo(id, "%") === PORCIENTO[id],
    `el «%» se dice «${PORCIENTO[id]}» en ${id} (dice «${decirSimbolo(id, "%")}»)`
  );
}

// el idioma de la casa cae siempre a algo válido
ok(comoIdiomaVoz("en-GB") === "en", "comoIdiomaVoz debe aceptar etiquetas con región");
ok(comoIdiomaVoz("xx") === "es", "un idioma que la casa no tiene debe caer a español");
ok(esIdiomaVoz("zh") && !esIdiomaVoz("tl"), "esIdiomaVoz no filtra bien");
ok(idiomaVoz("pt").bcp47 === "pt-BR", "idiomaVoz no devuelve la tabla pedida");

// ═══ B · EL LIMPIADOR, EN CADA IDIOMA ══════════════════════════════════════
seccion("B · el limpiador: los símbolos y las cifras, en su idioma");

ok(limpiar.textoDeBoca("Sube un 50 %", "en").includes("percent"), "en inglés el % debe decirse «percent»");
ok(limpiar.textoDeBoca("Sube un 50 %", "es").includes("por ciento"), "en español el % debe seguir diciéndose «por ciento»");
ok(limpiar.textoDeBoca("Sube un 50 %", "zh").includes("百分之"), "en chino el % debe decirse «百分之»");
ok(limpiar.textoDeBoca("Cuesta $ 5", "en").includes("dollars"), "en inglés el $ debe decirse «dollars»");
ok(limpiar.textoDeBoca("A & B", "de").includes("und"), "en alemán el & debe decirse «und»");

// lo del español sigue siendo del español
ok(limpiar.textoDeBoca("24 cables", "es").includes("veinticuatro"), "en español 24 se sigue diciendo con letra");
ok(!limpiar.textoDeBoca("24 cables", "en").includes("twenty"), "en inglés las cifras se dejan en cifra (no se inventa la palabra)");
ok(limpiar.textoDeBoca("24 cables", "en").includes("24"), "en inglés la cifra debe sobrevivir intacta");
ok(limpiar.textoDeBoca("EE. UU.", "es").includes("Estados Unidos"), "la abreviatura española se conserva");
ok(limpiar.textoDeBoca("50 %", "en").includes("50"), "la limpieza JAMÁS toca una cifra");

// el troceado respeta la respiración de cada idioma
const frasesEs = limpiar.trocearParaBoca("Una frase corta. Otra frase corta.", "es");
const frasesDe = limpiar.trocearParaBoca("Ein kurzer Satz. Noch ein Satz.", "de");
ok(frasesEs.length >= 2, "el troceado español debe dar dos frases");
ok(frasesEs[0].pausa === IDIOMAS_VOZ.es.pausaFrase, "la pausa de frase española cambió sin avisar");
ok(frasesDe[0].pausa === IDIOMAS_VOZ.de.pausaFrase, "el alemán debe respirar con SU pausa, no con la del español");
ok(frasesDe[0].pausa > frasesEs[0].pausa, "el alemán pidió más silencio que el español y no se le da");

const frasesZh = limpiar.trocearParaBoca("先锋电台。这是本宅的声音。", "zh");
ok(frasesZh.length >= 2, "el troceado debe entender la puntuación china (。): no corta");

// ═══ C · LOS MARCOS ════════════════════════════════════════════════════════
seccion("C · los marcos: la casa traduce lo suyo, y solo lo suyo");

const serenaES = marcos.marcoDe("serena", "es");
ok(
  serenaES.saludo[0] === "Radio Vanguard. La casa te cuenta el día.",
  "el saludo español de la víspera cambió palabra por palabra"
);
ok(
  serenaES.cierre[0] === "Hasta aquí el programa. Las fuentes quedan en pantalla.",
  "el cierre español cambió: no se toca lo que ya estaba bien"
);
ok(
  marcos.marcoDe("filosa", "es").saludo[0] !== serenaES.saludo[0],
  "en español los estilos deben seguir sonando distintos"
);
// DECLARADO EN VOZ ALTA: fuera del español el estilo cambia la ENTREGA, no las
// palabras. La prueba lo fija para que nadie lo "arregle" sin decirlo.
ok(
  marcos.marcoDe("serena", "en") === marcos.marcoDe("filosa", "en"),
  "fuera del español el estilo debe cambiar la entrega, no las palabras (marcos.ts lo declara)"
);
for (const id of ["en", "pt", "fr", "de", "it", "ru", "zh"]) {
  const m = marcos.marcoDe("cercana", id);
  ok(m && m.saludo.length > 0 && m.sinCables.length > 20, `falta el marco de ${id}`);
  ok(m.fuente.trim().length > 0, `el marco de ${id} no sabe decir «fuente»`);
  ok(m.rot.cierre.length > 0, `el marco de ${id} no tiene rótulo de cierre`);
  ok(m.archivo(2).includes("2"), `el marco de ${id} pierde la cifra del archivo`);
}
ok(marcos.marcoDe("cercana", "fr").fuente.includes("Source"), "el marco francés debe decir «Source :»");
ok(marcos.marcoDe("cercana", "de").fuente.includes("Quelle"), "el marco alemán debe decir «Quelle:»");

// ═══ D · EL GUION EN CADA IDIOMA ═══════════════════════════════════════════
seccion("D · el guion: el idioma en la casa, el cable como se publicó");

const AHORA = Date.parse("2026-11-18T12:00:00Z");
const NOTAS = [
  {
    id: "n1",
    titulo: "El mar Rojo vuelve a cerrarse al tráfico mercante",
    resumen: "Tres navieras suspenden el paso por el estrecho tras los ataques de la semana.",
    fuente: "France 24",
    region: "oriente",
    fecha: new Date(AHORA - 12 * 60000).toISOString(),
    imagen: null,
    conflicto: true,
    ruta: "/lectura/n1",
  },
  {
    id: "n2",
    titulo: "La UE acuerda un fondo común para defensa aérea",
    resumen: "Los ministros firman el reparto de compras antes de fin de año.",
    fuente: "El País",
    region: "europa",
    fecha: new Date(AHORA - 40 * 60000).toISOString(),
    imagen: null,
    conflicto: false,
    ruta: "/lectura/n2",
  },
];

const pEs = guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 2 });
ok(pEs.idioma === "es", "sin idioma, el programa debe declararse en español");
ok(pEs.titulo.includes("titulares"), "el título español del programa cambió");
ok(pEs.bloques[0].texto.includes("cables abiertos en el archivo"), "la sintonía española cambió");

const pEn = guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 2, idioma: "en" });
ok(pEn.idioma === "en", "el programa inglés debe declarar su idioma");
ok(pEn.titulo.includes("headlines"), `el título inglés no está traducido (${pEn.titulo})`);
ok(pEn.bloques.some((b) => /open cables in the archive/.test(b.texto)), "la sintonía inglesa no se tradujo");
ok(
  pEn.bloques.some((b) => b.texto.includes("El mar Rojo vuelve a cerrarse")),
  "el titular del cable debe viajar SIN traducir (la casa no inventa traducciones)"
);
ok(
  pEn.bloques.find((b) => b.tipo === "desarrollo")?.texto.includes("Source:"),
  "en inglés la fuente se dice «Source:»"
);
ok(
  pEn.bloques.find((b) => b.tipo === "desarrollo")?.texto.includes("minutes ago"),
  "en inglés el «hace X minutos» debe decirse en inglés"
);
ok(
  pEn.bloques.find((b) => b.tipo === "desarrollo")?.texto.includes("the Middle East") === false,
  "la región va en el puente, no pegada al titular"
);

const pRu = guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 1, idioma: "ru" });
ok(pRu.bloques.some((b) => /открытых сообщений в архиве/.test(b.texto)), "la sintonía rusa no se tradujo");
ok(pRu.bloques.every((b) => typeof b.pausaMs === "number" && b.pausaMs > 0), "los bloques rusos no respiran");

const pZh = guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 1, idioma: "zh" });
ok(pZh.bloques.some((b) => b.texto.includes("档案里有")), "la sintonía china no se tradujo");
ok(pZh.titulo.includes("条标题"), "el título chino no se tradujo");

const vacioEn = guion.construirPrograma([], { ahora: AHORA, idioma: "en" });
ok(vacioEn.bloques[0].texto.includes("no new cables"), "el programa vacío inglés no declara el archivo vacío");
ok(vacioEn.idioma === "en", "el programa vacío debe conservar su idioma");

// la duración sigue siendo honesta en cualquier idioma
for (const id of ORDEN_IDIOMAS) {
  const p = guion.construirPrograma(NOTAS, { ahora: AHORA, limite: 2, idioma: id });
  ok(p.duracionMs > 0 && p.bloques.length >= 4, `el programa en ${id} sale vacío o sin duración`);
}

// ═══ E · LA BOCA ═══════════════════════════════════════════════════════════
seccion("E · la boca: el idioma de la casa, y la personalización por idioma");

const decirTs = leer("src/lib/voz/decir.ts");
ok(decirTs.includes("idiomaActual()"), "decir() debe leer el idioma de la casa cuando nadie se lo dice");
ok(decirTs.includes("tabla.bcp47"), "la etiqueta del motor debe salir de la tabla, no de un literal");
ok(/u\.lang = tabla\.bcp47/.test(decirTs), "utterance.lang debe ser el BCP-47 del idioma");
ok(decirTs.includes("gustosEnIdioma"), "falta la puerta de los gustos por idioma");
ok(decirTs.includes("guardarAjustesIdioma"), "falta la escritura de los gustos por idioma");
ok(decirTs.includes("porIdioma"), "los gustos deben guardarse POR idioma");
ok(/curva/.test(decirTs) && decirTs.includes('cierre === "?"'), "la curva de la pregunta desapareció");
ok(decirTs.includes("ajusteRitmo"), "el ritmo del idioma no llega al motor");
ok(decirTs.includes("hablaEseIdioma"), "la boca no debe aceptar voces de otro idioma");

// idiomas.ts no puede repetir la lista de idiomas en otro sitio
const i18nTs = leer("src/lib/i18n.ts");
ok(i18nTs.includes("vanguard-lang-v1"), "la clave del idioma guardado cambió: idiomaActual() se queda sordo");
ok(
  leer("src/lib/voz/idiomas.ts").includes('"vanguard-lang-v1"'),
  "idiomaActual() debe leer la misma clave que el store del idioma"
);

// ═══ F · LAS PANTALLAS ═════════════════════════════════════════════════════
seccion("F · las pantallas: ninguna escribe «es-ES» a mano");

const vozSala = leer("src/components/vanguard/voz-sala.tsx");
ok(vozSala.includes("ORDEN_IDIOMAS"), "la sala de voz no enseña los ocho idiomas");
ok(vozSala.includes("setLang"), "elegir idioma en la sala debe cambiar el de la CASA");
ok(vozSala.includes("tabla.saludo"), "probar la voz debe decir la frase del idioma elegido");
ok(vozSala.includes("guardarEnIdioma"), "los mandos de la sala deben guardar por idioma");
ok(!/sr\.lang = "es-ES"/.test(vozSala), "el micrófono sigue fijado al español");
ok(!/escanearVoces\("es"\)/.test(vozSala), "la sala sigue escaneando solo voces españolas");

const radioTsx = leer("src/components/radio/radio-vanguard.tsx");
ok(radioTsx.includes("comoIdiomaVoz"), "el estudio no toma el idioma de la casa");
ok(/construirPrograma\(notas, \{/.test(radioTsx) && radioTsx.includes("idioma,"), "el estudio no pasa el idioma al guion");
ok(!/escanearVoces\("es"\)/.test(radioTsx), "el estudio sigue escaneando solo voces españolas");

const muelle = leer("src/components/vanguard/muelle-movil.tsx");
ok(muelle.includes("lang=${idioma}"), "el ▶ del muelle no pide el programa en el idioma de la casa");

const ruta = leer("src/app/api/radio/programa/route.ts");
ok(ruta.includes('searchParams.get("lang")'), "la API del programa no acepta idioma");
ok(ruta.includes("idiomaDeLosCables"), "la API debe declarar que los cables no se traducen");
ok(ruta.includes("idiomaNativo") && ruta.includes("bcp47"), "la API debe devolver el idioma que sirvió");

ok(i18nTs.includes("document.documentElement.lang = effective"), "el <html lang> no sigue al idioma efectivo");

const vozPage = leer("src/app/voz/page.tsx");
ok(vozPage.includes("ORDEN_IDIOMAS.length"), "la portada de /voz no declara cuántos idiomas hay");

// ningún otro fichero de la voz puede fijar el español a mano
for (const rel of [
  "src/components/vanguard/voz-sala.tsx",
  "src/components/radio/radio-vanguard.tsx",
  "src/lib/radio/usa-emision.ts",
]) {
  ok(!/"es-ES"/.test(leer(rel)), `${rel} todavía escribe «es-ES» a mano`);
}

// ── resultado ──
console.log("");
if (fallos.length === 0) {
  console.log(`✔ ${pasan} comprobaciones · la casa habla ocho idiomas y el cable no se traduce`);
} else {
  console.log(`✖ ${fallos.length} fallos de ${pasan + fallos.length} comprobaciones`);
  for (const f of fallos) console.log(`  · ${f}`);
  process.exitCode = 1;
}
