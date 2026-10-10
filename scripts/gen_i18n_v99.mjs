#!/usr/bin/env node
// v99.0 MENTE VIVA — i18n ×8 idiomas:
//  1) i18n-tabs.ts: label "mente" ×8 (después del ancla imagenes de cada idioma)
//  2) i18n-tabs.ts: short "mente" ×8 (en cada bloque de TAB_SHORTS)
//  3) i18n.ts: sec.inteligencia.desc ×8 → añade LA MENTE a la lista de salas
// Verificación final: recuento de escrituras + anclas intactas.

import { readFileSync, writeFileSync } from "node:fs";

const TABS = "src/lib/i18n-tabs.ts";
const I18N = "src/lib/i18n.ts";

let escrituras = 0;
function reemplazarUna(contenido, ancla, insercion, fichero, etiqueta) {
  const i = contenido.indexOf(ancla);
  if (i < 0) {
    console.error(`  ✗ ANCLA NO ENCONTRADA [${etiqueta}] en ${fichero}: ${ancla.slice(0, 60)}…`);
    process.exit(1);
  }
  if (contenido.indexOf(ancla, i + 1) >= 0) {
    console.error(`  ✗ ANCLA AMBIGUA [${etiqueta}] en ${fichero} (aparece 2+ veces)`);
    process.exit(1);
  }
  escrituras++;
  return contenido.slice(0, i) + insercion + contenido.slice(i);
}

// ---------- 1+2: i18n-tabs.ts ----------
let tabs = readFileSync(TABS, "utf8");

// labels ×8 (ancla = valor de imagenes en cada idioma; insertamos "mente: …" antes)
const LABELS = [
  ["es", "LA MENTE DE VANGUARD (IA central: pulso autónomo del mundo, charla y expedientes neuronales)"],
  ["en", "THE VANGUARD MIND (central AI: autonomous world pulse, chat and neural dossiers)"],
  ["pt", "A MENTE DE VANGUARD (IA central: pulso autônomo do mundo, conversa e expedientes neurais)"],
  ["fr", "L'ESPRIT DE VANGUARD (IA centrale : pouls autonome du monde, dialogue et dossiers neuronaux)"],
  ["de", "DER VANGUARD-VERSTAND (zentrale KI: autonomer Weltpuls, Chat und neurale Akten)"],
  ["it", "LA MENTE DI VANGUARD (IA centrale: impulso autonomo del mondo, chat e fascicoli neurali)"],
  ["ru", "РАЗУМ VANGUARD (центральный ИИ: автономный пульс мира, чат и нейро-досье)"],
  ["zh", "VANGUARD 心智（中央AI：世界自主脉冲、对话与神经档案）"],
];
const ANCLA_LABEL = {
  es: `imagenes: "IMÁGENES DE VANGUARD (fotos reales: lugares, poder, archivo, armas y civilizaciones)"`,
  en: `imagenes: "VANGUARD IMAGES (real photos: places, power, archive, weapons and civilizations)"`,
  pt: `imagenes: "IMAGENS DE VANGUARD (fotos reais: lugares, poder, arquivo, armas e civilizações)"`,
  fr: `imagenes: "IMAGES DE VANGUARD (vraies photos : lieux, pouvoir, archives, armes et civilisations)"`,
  de: `imagenes: "VANGUARD-BILDER (echte Fotos: Orte, Macht, Archiv, Waffen und Zivilisationen)"`,
  it: `imagenes: "IMMAGINI DI VANGUARD (foto reali: luoghi, potere, archivio, armi e civiltà)"`,
  ru: `imagenes: "ОБРАЗЫ VANGUARD (реальные фото: места, власть, архив, оружие и цивилизации)"`,
  zh: `imagenes: "VANGUARD 影像（真实照片：地点、权力、档案、武器与文明）"`,
};
const VALOR_TAB = {
  es: "mente", en: "mente", pt: "mente", fr: "mente", de: "mente", it: "mente", ru: "mente", zh: "mente",
};
for (const [lang, label] of LABELS) {
  const ancla = ANCLA_LABEL[lang];
  const insercion = `${VALOR_TAB[lang]}: "${label}", `;
  tabs = reemplazarUna(tabs, ancla, insercion, TABS, `label.${lang}`);
}

// shorts ×8: localizamos el BLOQUE de cada idioma dentro de TAB_SHORTS
// (los shorts "IMAGEN" se repiten entre idiomas → reemplazo por bloque, no global)
const SHORTS = { es: "MENTE", en: "MIND", pt: "MENTE", fr: "ESPRIT", de: "VERST.", it: "MENTE", ru: "РАЗУМ", zh: "心智" };
const ANCLA_SHORT = { es: 'imagenes: "IMAGEN"', en: 'imagenes: "IMAGEN"', pt: 'imagenes: "IMAGEN"', fr: 'imagenes: "IMAGE"', de: 'imagenes: "BILDER"', it: 'imagenes: "IMAGEN"', ru: 'imagenes: "ОБРАЗЫ"', zh: 'imagenes: "影像"' };
const INICIO_SHORTS = tabs.indexOf("export const TAB_SHORTS: Record<string, TabDict> = {");
if (INICIO_SHORTS < 0) {
  console.error("✗ no encontré TAB_SHORTS");
  process.exit(1);
}
for (const lang of Object.keys(SHORTS)) {
  // bloque del idioma: del "  xx: {" al siguiente bloque "  yy: {" (orden real del fichero)
  const inicio = tabs.indexOf(`  ${lang}: {`, INICIO_SHORTS);
  if (inicio < 0) {
    console.error(`✗ bloque TAB_SHORTS[${lang}] no encontrado`);
    process.exit(1);
  }
  const siguiente = tabs.slice(inicio + 4).search(/^  [a-z]{2}: \{/m);
  const fin = siguiente < 0 ? tabs.length : inicio + 4 + siguiente;
  if (inicio < 0 || fin < 0 || fin <= inicio) {
    console.error(`✗ bloque TAB_SHORTS[${lang}] no delimitado`);
    process.exit(1);
  }
  const bloque = tabs.slice(inicio, fin);
  const ancla = ANCLA_SHORT[lang];
  const n = bloque.split(ancla).length - 1;
  if (n !== 1) {
    console.error(`✗ ancla short [${lang}] aparece ${n} veces en su bloque`);
    process.exit(1);
  }
  const insercion = `${ancla}, mente: "${SHORTS[lang]}"`;
  tabs = tabs.slice(0, inicio) + bloque.replace(ancla, insercion) + tabs.slice(fin);
  escrituras++;
  console.log(`  ✓ short.${lang} = ${SHORTS[lang]}`);
}

writeFileSync(TABS, tabs);
console.log(`✓ i18n-tabs.ts: ${escrituras} escrituras (8 labels + 8 shorts)`);

// ---------- 3: i18n.ts — sec.inteligencia.desc ×8 ----------
let i18n = readFileSync(I18N, "utf8");
let escriturasI18n = 0;

const DESCS = {
  es: ["GOOGLES, ", " el núcleo de conocimiento", "GOOGLES, LA MENTE, IMÁGENES, el GRAFO MUNDIAL, EL ESPEJO, la MÁQUINA DEL TIEMPO, VANGUARD EARTH y los expedientes — el núcleo de conocimiento, con el pulso autónomo del mundo corriendo en vivo"],
  en: ["GOOGLES, IMAGES,", " the knowledge core", "GOOGLES, THE MIND, IMAGES, the WORLD GRAPH, THE MIRROR, the TIME MACHINE, VANGUARD EARTH and the dossiers — the knowledge core, with the autonomous pulse of the world running live"],
  pt: ["o GRAFO MUNDIAL", "o núcleo de conhecimento", "GOOGLES, A MENTE, IMAGENS, o GRAFO MUNDIAL, O ESPELHO, a MÁQUINA DO TEMPO, VANGUARD EARTH e os expedientes — o núcleo de conhecimento, com o pulso autônomo do mundo a correr em direto"],
  fr: ["le GRAPHE MONDIAL", "le noyau de connaissance", "GOOGLES, L'ESPRIT, IMAGES, le GRAPHE MONDIAL, LE MIROIR, la MACHINE DU TEMPS, VANGUARD EARTH et les dossiers — le noyau de connaissance, avec le pouls autonome du monde en direct"],
  de: ["der WELTGRAPH", "der Wissenskern", "GOOGLES, DER VERSTAND, BILDER, der WELTGRAPH, DER SPIEGEL, die ZEITMASCHINE, VANGUARD EARTH und die Dossiers — der Wissenskern, mit dem autonomen Weltpuls in Echtzeit"],
  it: ["il GRAFO MONDIALE", "il nucleo di conoscenza", "GOOGLES, LA MENTE, IMMAGINI, il GRAFO MONDIALE, LO SPECCHIO, la MACCHINA DEL TEMPO, VANGUARD EARTH e i dossier — il nucleo di conoscenza, con l'impulso autonomo del mondo in diretta"],
  ru: ["МИРОВОЙ ГРАФ", "ядро знаний", "GOOGLES, РАЗУМ, ОБРАЗЫ, МИРОВОЙ ГРАФ, ЗЕРКАЛО, МАШИНА ВРЕМЕНИ, VANGUARD EARTH и досье — ядро знаний, с автономным пульсом мира в прямом эфире"],
  zh: ["世界图谱", "知识核心", "GOOGLES、心智、影像、世界图谱、镜像、时光机、VANGUARD EARTH 与档案 — 知识核心，世界自主脉冲实时运转"],
};

const lineas = i18n.split("\n");
for (let i = 0; i < lineas.length; i++) {
  const m = lineas[i].match(/^\s*"sec\.inteligencia\.desc": "(.*)",\s*$/);
  if (!m) continue;
  const valor = m[1];
  // ¿es|en|pt|fr|de|it|zh|ru? localizar por el idioma del bloque: contamos cuántos ya reemplazados
  const langIndex = Object.values(DESCS).findIndex(([antes, despues]) => valor.includes(antes) && valor.includes(despues));
  if (langIndex < 0) continue;
  const lang = Object.keys(DESCS)[langIndex];
  lineas[i] = lineas[i].replace(`"sec.inteligencia.desc": "${valor}"`, `"sec.inteligencia.desc": "${DESCS[lang][2]}"`);
  escriturasI18n++;
  console.log(`  ✓ sec.inteligencia.desc [${lang}]`);
}
i18n = lineas.join("\n");
writeFileSync(I18N, i18n);
console.log(`✓ i18n.ts: ${escriturasI18n}/8 desc escritas`);
if (escriturasI18n !== 8) {
  console.error(`✗ esperaba 8 descs, escritas ${escriturasI18n}`);
  process.exit(1);
}
console.log(`\nTOTAL: ${escrituras + escriturasI18n} escrituras verificadas`);
