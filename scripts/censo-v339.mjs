// censo-v339.mjs — clasificador del censo ampliado TS6133 (imports muertos vs locales vs params)
// Uso: node scripts/censo-v339.mjs /tmp/ts6133-raw.txt
import fs from 'node:fs';

const raw = fs.readFileSync(process.argv[2] ?? '/tmp/ts6133-raw.txt', 'utf8');
const lines = raw.trim().split('\n').filter(Boolean);
let imp = 0, loc = 0, noparse = 0;
const porArchivo = {};
const detalles = [];

for (const l of lines) {
  const m = l.match(/^([^(]+)\((\d+),(\d+)\): error TS(6133|6196): (.+?)\.?$/);
  if (!m) { noparse++; continue; }
  const [, file, lineS, , code, msg] = m;
  const line = parseInt(lineS);
  const src = fs.readFileSync(file, 'utf8').split('\n');
  const linea = src[line - 1] ?? '';
  // Especies: import statement (la línea empieza por import), o binding dentro de llaves de import
  const esImport = /^\s*import\b/.test(linea);
  const especie = esImport ? 'import' : /function|=>|const |let |class /.test(linea) ? 'local' : 'otro';
  if (esImport) imp++; else loc++;
  porArchivo[file] = porArchivo[file] || [];
  porArchivo[file].push({ line, especie, msg });
  detalles.push({
    file: file.replace(/.*src\//, 'src/'),
    line, code, especie,
    msg: msg.slice(0, 100),
    linea: linea.trim().slice(0, 90),
  });
}

console.log('IMPORTS muertos:', imp, '· LOCALES/OTROS:', loc, '· no parseados:', noparse);
fs.writeFileSync('/tmp/ts6133-detalles.json', JSON.stringify(detalles, null, 1));

// Top archivos por especie import
const importsPorArchivo = {};
for (const d of detalles) if (d.especie === 'import') importsPorArchivo[d.file] = (importsPorArchivo[d.file] ?? 0) + 1;
const top = Object.entries(importsPorArchivo).sort((a, b) => b[1] - a[1]).slice(0, 15);
console.log('\nTop archivos con imports muertos:');
for (const [k, v] of top) console.log(' ', v, k);
console.log('\nTotal archivos con imports muertos:', Object.keys(importsPorArchivo).length);
