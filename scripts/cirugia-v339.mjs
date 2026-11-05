// cirugia-v339.mjs — LA LEVA DE LOS IMPORTS MUERTOS (v339.0)
// Retira los imports muertos que el censo estricto (tsc --noUnusedLocals --noUnusedParameters) señala.
// Ley de la casa (v333): validar TODO antes de escribir — un solo desajuste = ABORTO sin escribir.
// Especies curadas esta ronda: identificadores marcados por TS6133/TS6196 que viven DENTRO de un
// statement `import` (incluidas líneas de continuación multi-línea, alias `as`, `type` inline).
// Lo demás (locales/params/interfaces) queda en cola para futuras levas.
// Uso: node scripts/cirugia-v339.mjs /tmp/ts6133-raw.txt [--dry] [--statements]
import fs from 'node:fs';

const RAW = process.argv[2] ?? '/tmp/ts6133-raw.txt';
const DRY = process.argv.includes('--dry');
const MODO_STATEMENTS = process.argv.includes('--statements');

const raw = fs.readFileSync(RAW, 'utf8').trim().split('\n').filter(Boolean);
const hallazgos = [];
for (const l of raw) {
  const m = l.match(/^([^(]+)\((\d+),(\d+)\): error TS(6133|6196): '([^']+)' is declared but/);
  if (!m) { console.error('NO PARSEADO:', l); process.exit(1); }
  hallazgos.push({ file: m[1], line: +m[2], col: +m[3], code: m[4], name: m[5] });
}

// ——— PASE 2 (--statements): statements de import ENTEROS muertos ———
// tsc reporta con col=1 (la posición del statement) cuando TODO el import está muerto.
// Solo se retira si el flagged name es el ÚNICO binding del statement.
if (MODO_STATEMENTS) {
  const src_ = (f) => fs.readFileSync(f, 'utf8').split('\n');
  const objetivos = [];
  for (const h of hallazgos) {
    if (h.col !== 1) continue;
    const src = src_(h.file);
    const linea = src[h.line - 1] ?? '';
    if (!/^\s*import\b/.test(linea)) { console.error(`ABORTO: ${h.file}:${h.line} col1 no es import:`, linea); process.exit(1); }
    let fin = h.line - 1;
    for (let k = h.line - 1; k < Math.min(h.line - 1 + 30, src.length); k++) {
      fin = k;
      if (/\bfrom\s*["'][^"']+["']\s*;?\s*$/.test(src[k])) break;
    }
    const stLines = src.slice(h.line - 1, fin + 1);
    const stText = stLines.join('\n');
    if (!new RegExp(`\\b${h.name.replace(/\$/g, '\\$')}\\b`).test(stText)) { console.error(`ABORTO: '${h.name}' no está en el statement de ${h.file}:${h.line}`); process.exit(1); }
    const fuera = src.filter((_, idx) => idx < h.line - 1 || idx > fin).join('\n');
    if (new RegExp(`\\b${h.name.replace(/\$/g, '\\$')}\\b`).test(fuera)) { console.error(`ABORTO: '${h.name}' aparece fuera del statement en ${h.file}`); process.exit(1); }
    const bindings = stText.replace(/^\s*import\s+/, '').replace(/\s*from\s*["'][^"']+["']\s*;?\s*$/, '').replace(/[{}\s]/g, '');
    if (bindings !== h.name) { console.log(`SALTADO (tiene más miembros): ${h.file.replace(/.*src\//, 'src/')}:${h.line} → bindings: ${bindings}`); continue; }
    objetivos.push({ ...h, inicio: h.line - 1, fin, stLines });
  }
  console.log('Statements enteros muertos a retirar:', objetivos.length);
  const porArchivo2 = new Map();
  for (const o of objetivos) {
    if (!porArchivo2.has(o.file)) porArchivo2.set(o.file, []);
    porArchivo2.get(o.file).push(o);
  }
  let tocados2 = 0;
  for (const [file, lista] of porArchivo2) {
    lista.sort((a, b) => b.inicio - a.inicio);
    const src = src_(file);
    for (const o of lista) src.splice(o.inicio, o.fin - o.inicio + 1);
    if (!DRY) fs.writeFileSync(file, src.join('\n'));
    tocados2++;
    for (const o of lista) console.log(`  ✂ ${file.replace(/.*src\//, 'src/')}:${o.inicio + 1} → ${o.stLines[0].trim().slice(0, 80)}`);
  }
  console.log(`\nPASE 2${DRY ? ' (DRY)' : ''}: ${tocados2} archivos, ${objetivos.length} statements enteros retirados`);
  process.exit(0);
}
console.log('Hallazgos totales:', hallazgos.length);

// ---- Fase 1: especies ----
// Un hallazgo es IMPORT si el identificador (col) vive dentro de un statement import.
function esImportEn(f, linea, col, nombre) {
  const src = fs.readFileSync(f, 'utf8').split('\n');
  // localizar el inicio del statement: subir desde linea hasta encontrar /^(\s*)import\b/ o un terminador evidente
  let i = linea - 1;
  while (i >= 0) {
    if (/^\s*import\b/.test(src[i])) break;
    if (/^\s*(export|const|let|var|function|interface|type|class)\b/.test(src[i]) && !/^\s*import\b/.test(src[i])) {
      // llegamos a otro statement sin ver import → no es import
      return null;
    }
    i--;
  }
  if (i < 0) return null;
  // extender hasta el final del statement (línea con from "..." o }) ; máximo 30 líneas
  let fin = i;
  for (let k = i; k < Math.min(i + 30, src.length); k++) {
    fin = k;
    if (/\bfrom\s*["']/.test(src[k]) && /\}\s*from|\*\s+as\s+[\w$]+|^\s*import\s+[\w$]+\s+from/.test(src[k])) break;
    if (k > i && /^\s*import\b/.test(src[k])) break; // otro import empezó sin cerrar (raro)
  }
  // ¿el nombre está dentro del texto del statement en la línea/col señalada?
  const stText = src.slice(i, fin + 1).join('\n');
  if (!/\bfrom\s*["']/.test(stText)) return null;
  // verificar que el identificador señalado coincide con el nombre en esa posición
  const lineaTxt = src[linea - 1] ?? '';
  const enPos = lineaTxt.slice(col - 1, col - 1 + nombre.length);
  if (enPos !== nombre) return null;
  return { inicio: i, fin, stText, lineas: fin - i + 1 };
}

const importHallazgos = [];
const locales = [];
for (const h of hallazgos) {
  const st = esImportEn(h.file, h.line, h.col, h.name);
  if (st) importHallazgos.push({ ...h, st });
  else locales.push(h);
}
console.log('Especie IMPORT (curable esta ronda):', importHallazgos.length);
console.log('Especie LOCAL/PARAM (cola futura):', locales.length);

// agrupar por archivo → statement
const porArchivo = new Map();
for (const h of importHallazgos) {
  const key = `${h.file}#${h.st.inicio}`;
  if (!porArchivo.has(key)) porArchivo.set(key, { file: h.file, inicio: h.st.inicio, fin: h.st.fin, nombres: [] });
  porArchivo.get(key).nombres.push(h.name);
}

// ---- Fase 2: VALIDACIÓN GLOBAL (antes de escribir NADA) ----
let errores = 0;
for (const [, s] of porArchivo) {
  const src = fs.readFileSync(s.file, 'utf8').split('\n');
  const stLines = src.slice(s.inicio, s.fin + 1);
  const stText = stLines.join('\n');
  // 2a: el statement debe ser un import
  if (!/^\s*import\b/.test(stLines[0])) { console.error(`ABORTO: ${s.file}:${s.inicio + 1} no es import:`, stLines[0]); errores++; continue; }
  for (const n of s.nombres) {
    // 2b: el nombre debe aparecer en el statement
    if (!new RegExp(`\\b${n.replace(/\$/g, '\\$')}\\b`).test(stText)) { console.error(`ABORTO: ${s.file}:${s.inicio + 1} no contiene '${n}' en el statement`); errores++; }
    // 2c: el nombre NO debe aparecer fuera del statement (uso real en código)
    const fuera = src.filter((_, idx) => idx < s.inicio || idx > s.fin).join('\n');
    if (new RegExp(`\\b${n.replace(/\$/g, '\\$')}\\b`).test(fuera)) {
      console.error(`ABORTO: '${n}' aparece FUERA del statement en ${s.file} (¿comentario/uso real?)`);
      errores++;
    }
  }
}
if (errores > 0) { console.error(`\nABORTO GLOBAL: ${errores} desajustes — NO SE ESCRIBE NADA (ley v333)`); process.exit(1); }
console.log('\nValidación global: OK —', porArchivo.size, 'statements en', new Set([...porArchivo.values()].map(s => s.file)).size, 'archivos');

// ---- Fase 3: CIRUGÍA ----
// Por archivo, de abajo hacia arriba (línea descendente) para no desplazar índices.
const porArchivoSolo = new Map();
for (const [, s] of porArchivo) {
  if (!porArchivoSolo.has(s.file)) porArchivoSolo.set(s.file, []);
  porArchivoSolo.get(s.file).push(s);
}
let filesTocados = 0, clausulas = 0, statementsEnteros = 0;
const manifiesto = [];

for (const [file, stmts] of porArchivoSolo) {
  stmts.sort((a, b) => b.inicio - a.inicio); // abajo → arriba
  const src = fs.readFileSync(file, 'utf8').split('\n');
  for (const s of stmts) {
    const stLines = src.slice(s.inicio, s.fin + 1);
    const multi = stLines.length > 1;
    if (!multi) {
      // single-line: reconstruir el statement sin las cláusulas de los nombres muertos
      let line = stLines[0];
      for (const n of s.nombres) {
        // cláusula: `type N`, `* as N`, `X as N` (N alias), `N`
        const esc = n.replace(/\$/g, '\\$');
        const patrones = [
          new RegExp(`\\btype\\s+${esc}\\b\\s*,?\\s*`),
          new RegExp(`\\*\\s+as\\s+${esc}\\b\\s*,?\\s*`),
          new RegExp(`\\b[\\w$]+\\s+as\\s+${esc}\\b\\s*,?\\s*`),
          new RegExp(`\\b${esc}\\b\\s*,?\\s*`),
        ];
        let ok = false;
        for (const p of patrones) {
          if (p.test(line)) { line = line.replace(p, ''); ok = true; break; }
        }
        if (!ok) { console.error(`ABORTO: no pude extirpar '${n}' de`, stLines[0]); process.exit(1); }
      }
      // limpiar llaves vacías / comas colgantes
      const sinLlaves = /\{\s*\}/.test(line);
      if (sinLlaves || /^\s*import\s*,?\s*$/.test(line)) {
        // statement entero muerto → retirar sus líneas
        src.splice(s.inicio, s.fin - s.inicio + 1);
        statementsEnteros++; clausulas += s.nombres.length;
        manifiesto.push({ file: file.replace(/.*src\//, 'src/'), statement: stLines[0].trim().slice(0, 100), accion: 'statement entero retirado', nombres: s.nombres });
      } else {
        // normalizar comas dobles y espacios dentro de llaves
        line = line.replace(/\{\s*,\s*/g, '{ ').replace(/\s*,\s*\}/g, ' }').replace(/,\s*,/g, ',').replace(/\{\s+\}/g, '{}');
        src[s.inicio] = line;
        clausulas += s.nombres.length;
        manifiesto.push({ file: file.replace(/.*src\//, 'src/'), statement: stLines[0].trim().slice(0, 100), accion: `cláusulas extirpadas (${s.nombres.join(', ')})`, nombres: s.nombres });
      }
    } else {
      // multi-line: extirpar cláusulas en las líneas de continuación; si una línea queda vacía se retira;
      // si tras la extirpación las llaves quedan vacías, se retira el statement entero.
      const pendientes = new Set(s.nombres);
      const lineasMuertas = [];
      // última línea de miembro (para el trasplante de comas)
      let lastMemberLine = -1;
      for (let k = s.inicio; k <= s.fin; k++) {
        const esFija = /^\s*import\b/.test(src[k]) || /\bfrom\s*["']/.test(src[k]);
        if (!esFija && src[k].trim() !== '') lastMemberLine = k;
      }
      for (let k = s.inicio; k <= s.fin && pendientes.size > 0; k++) {
        const esFija = /^\s*import\b/.test(src[k]) || /\bfrom\s*["']/.test(src[k]);
        if (esFija) continue;
        let t = src[k];
        for (const n of [...pendientes]) {
          const esc = n.replace(/\$/g, '\\$');
          const patrones = [
            new RegExp(`\\btype\\s+${esc}\\b\\s*,?\\s*`),
            new RegExp(`\\*\\s+as\\s+${esc}\\b\\s*,?\\s*`),
            new RegExp(`\\b[\\w$]+\\s+as\\s+${esc}\\b\\s*,?\\s*`),
            new RegExp(`\\b${esc}\\b\\s*,?\\s*`),
          ];
          for (const p of patrones) {
            if (p.test(t)) { t = t.replace(p, ''); pendientes.delete(n); break; }
          }
        }
        // TRASPLANTE DE COMA: si la línea sigue viva, NO es la última de miembros y quedó sin coma
        // final (el muerto era el último de su línea), la coma pasa al miembro precedente —
        // sin ella la línea siguiente queda pegada al anterior (TS1005).
        if (t.trim() === '' || t.trim() === ',') { lineasMuertas.push(k); src[k] = t; }
        else if (k < lastMemberLine && !/,\s*$/.test(t)) src[k] = t.replace(/\s*$/, '') + ',';
        else src[k] = t;
      }
      if (pendientes.size > 0) { console.error(`ABORTO: ${file} — nombres sin extirpar en multi-line: ${[...pendientes].join(', ')}`); process.exit(1); }
      // ¿quedan miembros entre las llaves? (líneas no fijas no vacías)
      let miembros = 0;
      for (let k = s.inicio; k <= s.fin; k++) {
        const esFija = /^\s*import\b/.test(src[k]) || /\bfrom\s*["']/.test(src[k]);
        if (!esFija && src[k].trim() !== '') miembros++;
      }
      if (miembros === 0) {
        src.splice(s.inicio, s.fin - s.inicio + 1);
        statementsEnteros++; clausulas += s.nombres.length;
        manifiesto.push({ file: file.replace(/.*src\//, 'src/'), statement: '(multi-line)', accion: 'statement entero retirado', nombres: s.nombres });
      } else {
        // NOTA GRAMATICAL: las comas finales de las líneas de miembro son OBLIGATORIAS cuando sigue
        // otra línea de miembros, y la coma final antes de `}` es LEGAL — no se toca NINGUNA coma:
        // el patrón de extirpación (\s*,?\s*) ya se lleva la coma del miembro muerto.
        for (let k = lineasMuertas.length - 1; k >= 0; k--) src.splice(lineasMuertas[k], 1);
        clausulas += s.nombres.length;
        manifiesto.push({ file: file.replace(/.*src\//, 'src/'), statement: '(multi-line)', accion: `cláusulas extirpadas en continuación (${s.nombres.join(', ')})`, nombres: s.nombres });
      }
    }
  }
  if (!DRY) fs.writeFileSync(file, src.join('\n'));
  filesTocados++;
}
if (DRY) { console.log('\nDRY: nada se escribió en disco (la mutación fue solo en memoria)'); process.exit(0); }

console.log(`\nCIRUGÍA: ${filesTocados} archivos tocados · ${clausulas} cláusulas muertas extirpadas · ${statementsEnteros} statements enteros retirados`);
fs.writeFileSync('/tmp/cirugia-v339-manifiesto.json', JSON.stringify(manifiesto, null, 1));
console.log('Manifiesto: /tmp/cirugia-v339-manifiesto.json');
