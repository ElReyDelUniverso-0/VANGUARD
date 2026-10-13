// gen_i18n_v109.mjs — claves radio109.* (Auditorio + categorías) en 8 idiomas.
// Ancla: la línea "inmi.pill" de CADA bloque de idioma (valor único por lengua).
// Guard anti-doble-corrida: si radio109 ya existe, aborta.
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "src/lib/i18n.ts";
let src = readFileSync(FILE, "utf8");

if (src.includes("radio109.aud.badge")) {
  console.error("ABORT: radio109.* ya presente (corrida doble)");
  process.exit(1);
}

// [ancla exacta de la línea "inmi.pill", bloque a insertar después]
const BLOCKS = [
  [`"inmi.pill": "MODO INMERSIÓN",`,
`  "radio109.aud.entrar": "Abrir el Auditorio",
  "radio109.aud.salir": "Salir del Auditorio",
  "radio109.aud.titulo": "AUDITORIO VANGUARD",
  "radio109.aud.sub": "Sala de escucha a pantalla completa — la orquesta de Vanguard",
  "radio109.aud.badge": "SONIDO V4",
  "radio109.aud.edicion": "EDICIÓN DEL DÍA",
  "radio109.cat.vanguard": "VANGUARD",
  "radio109.cat.guerra": "GUERRA",
  "radio109.cat.ambiente": "AMBIENTE",
  "radio109.aud.pie": "28 obras · orquesta sintetizada en vivo · edición diaria única · 100% Vanguard",`],

  [`"inmi.pill": "IMMERSION MODE",`,
`  "radio109.aud.entrar": "Open the Listening Room",
  "radio109.aud.salir": "Leave the Listening Room",
  "radio109.aud.titulo": "VANGUARD LISTENING ROOM",
  "radio109.aud.sub": "Full-screen listening room — Vanguard's live orchestra",
  "radio109.aud.badge": "SOUND V4",
  "radio109.aud.edicion": "TODAY'S EDITION",
  "radio109.cat.vanguard": "VANGUARD",
  "radio109.cat.guerra": "WAR",
  "radio109.cat.ambiente": "AMBIENCE",
  "radio109.aud.pie": "28 works · live-synthesized orchestra · unique daily edition · 100% Vanguard",`],

  [`"inmi.pill": "MODO IMERSÃO",`,
`  "radio109.aud.entrar": "Abrir o Auditório",
  "radio109.aud.salir": "Sair do Auditório",
  "radio109.aud.titulo": "AUDITÓRIO VANGUARD",
  "radio109.aud.sub": "Sala de audição em tela cheia — a orquestra de Vanguard",
  "radio109.aud.badge": "SOM V4",
  "radio109.aud.edicion": "EDIÇÃO DO DIA",
  "radio109.cat.vanguard": "VANGUARD",
  "radio109.cat.guerra": "GUERRA",
  "radio109.cat.ambiente": "AMBIENTE",
  "radio109.aud.pie": "28 obras · orquestra sintetizada ao vivo · edição diária única · 100% Vanguard",`],

  [`"inmi.pill": "MODE IMMERSION",`,
`  "radio109.aud.entrar": "Ouvrir l'Auditorium",
  "radio109.aud.salir": "Quitter l'Auditorium",
  "radio109.aud.titulo": "AUDITORIUM VANGUARD",
  "radio109.aud.sub": "Salle d'écoute plein écran — l'orchestre de Vanguard",
  "radio109.aud.badge": "SON V4",
  "radio109.aud.edicion": "ÉDITION DU JOUR",
  "radio109.cat.vanguard": "VANGUARD",
  "radio109.cat.guerra": "GUERRE",
  "radio109.cat.ambiente": "AMBIANCE",
  "radio109.aud.pie": "28 œuvres · orchestre synthétisé en direct · édition quotidienne unique · 100% Vanguard",`],

  [`"inmi.pill": "IMMERSIONSMODUS",`,
`  "radio109.aud.entrar": "Auditorium öffnen",
  "radio109.aud.salir": "Auditorium verlassen",
  "radio109.aud.titulo": "VANGUARD AUDITORIUM",
  "radio109.aud.sub": "Hörraum im Vollbild — das Orchester von Vanguard",
  "radio109.aud.badge": "KLANG V4",
  "radio109.aud.edicion": "EDITION DES TAGES",
  "radio109.cat.vanguard": "VANGUARD",
  "radio109.cat.guerra": "KRIEG",
  "radio109.cat.ambiente": "ATMOSPHÄRE",
  "radio109.aud.pie": "28 Werke · live synthetisiertes Orchester · einzigartige Tagesedition · 100% Vanguard",`],

  [`"inmi.pill": "MODO IMMERSIONE",`,
`  "radio109.aud.entrar": "Apri l'Auditorium",
  "radio109.aud.salir": "Esci dall'Auditorium",
  "radio109.aud.titulo": "AUDITORIUM VANGUARD",
  "radio109.aud.sub": "Sala d'ascolto a schermo intero — l'orchestra di Vanguard",
  "radio109.aud.badge": "SUONO V4",
  "radio109.aud.edicion": "EDIZIONE DEL GIORNO",
  "radio109.cat.vanguard": "VANGUARD",
  "radio109.cat.guerra": "GUERRA",
  "radio109.cat.ambiente": "AMBIENTE",
  "radio109.aud.pie": "28 opere · orchestra sintetizzata dal vivo · edizione giornaliera unica · 100% Vanguard",`],

  [`"inmi.pill": "沉浸模式",`,
`  "radio109.aud.entrar": "打开音乐厅",
  "radio109.aud.salir": "退出音乐厅",
  "radio109.aud.titulo": "VANGUARD 音乐厅",
  "radio109.aud.sub": "全屏聆听厅 —— Vanguard 的实时管弦乐团",
  "radio109.aud.badge": "音效 V4",
  "radio109.aud.edicion": "今日版本",
  "radio109.cat.vanguard": "VANGUARD",
  "radio109.cat.guerra": "战争",
  "radio109.cat.ambiente": "氛围",
  "radio109.aud.pie": "28 部作品 · 实时合成管弦乐 · 每日独特版本 · 100% Vanguard",`],

  [`"inmi.pill": "РЕЖИМ ПОГРУЖЕНИЯ",`,
`  "radio109.aud.entrar": "Открыть аудиториум",
  "radio109.aud.salir": "Выйти из аудиториума",
  "radio109.aud.titulo": "АУДИТОРИУМ VANGUARD",
  "radio109.aud.sub": "Прослушивание на весь экран — оркестр Vanguard в реальном времени",
  "radio109.aud.badge": "ЗВУК V4",
  "radio109.aud.edicion": "ВЫПУСК ДНЯ",
  "radio109.cat.vanguard": "VANGUARD",
  "radio109.cat.guerra": "ВОЙНА",
  "radio109.cat.ambiente": "АТМОСФЕРА",
  "radio109.aud.pie": "28 произведений · оркестр, синтезируемый вживую · уникальный выпуск дня · 100% Vanguard",`],
];

let insertadas = 0;
for (const [anchor, block] of BLOCKS) {
  const hits = src.split(anchor).length - 1;
  if (hits !== 1) {
    console.error(`ABORT: ancla encontrada ${hits} veces (esperaba 1): ${anchor}`);
    process.exit(1);
  }
  const at = src.indexOf(anchor);
  const lineEnd = src.indexOf("\n", at);
  if (lineEnd === -1) { console.error("ABORT: sin fin de línea"); process.exit(1); }
  src = src.slice(0, lineEnd + 1) + block + "\n" + src.slice(lineEnd + 1);
  insertadas += block.split("\n").length;
}

writeFileSync(FILE, src);
console.log(`OK: 8 bloques × 10 claves = ${insertadas} inserciones`);
// verificación por idioma
const langs = ["MODO INMERSIÓN", "IMMERSION MODE", "MODO IMERSÃO", "MODE IMMERSION", "IMMERSIONSMODUS", "MODO IMMERSIONE", "沉浸模式", "РЕЖИМ ПОГРУЖЕНИЯ"];
for (const l of langs) {
  const at = src.indexOf(l);
  const next = src.indexOf(l, at + 1);
  const seg = src.slice(at, next === -1 ? undefined : next);
  const n = (seg.match(/radio109\./g) || []).length;
  console.log(`  [${l}] radio109.* = ${n}`);
}
