// Misión 003 · pruebas aisladas (sin red, sin BD)
const assert = require('assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');

// compilar con tsc (typescript@5)
execx = () => {
  try {
    execFileSync('npx', ['tsc', '--version'], { cwd: path.join(__dirname, '..'), stdio: 'pipe' });
  } catch {
    console.log('NOTA: typescript no está instalado; instala con: npm i -D typescript@5 && npx tsc -p tsconfig.json');
    process.exit(2);
  }
  execFileSync('npx', ['tsc', '-p', 'tsconfig.json'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
};
execx();

const { canonicalizarUrl } = require('../dist/canonical.js');
const { tokens, jaccard } = require('../dist/texto.js');
const { deduplicar } = require('../dist/dedupe.js');
const { centroide } = require('../dist/paises.js');
const { regionDe } = require('../dist/regiones.js');
const { construirMarcadores } = require('../dist/mapa.js');
const { construirCronologia } = require('../dist/cronologia.js');
const { relacionadas } = require('../dist/relacionadas.js');

// 1) URLs canónicas
assert.equal(canonicalizarUrl('https://www.bbc.com/mundo/noticia-a?utm_source=x&fbclid=y#frag'), 'bbc.com/mundo/noticia-a');
assert.equal(canonicalizarUrl('https://bbc.com/mundo/noticia-a'), 'bbc.com/mundo/noticia-a');
assert.equal(canonicalizarUrl('https://example.com/'), 'example.com');
console.log('1 OK · URLs canónicas ignoran utm/fbclid/www/fragmento');

// 2) Jaccard sane
const a = tokens('Irán lanza misiles contra Israel tras amenaza');
const b = tokens('Irán lanza misiles contra Israel: escala el conflicto');
assert(jaccard(a, b) > 0.3, 'titulares similares puntúan alto');
console.log('2 OK · similitud de titulares en español');

// 3) Dedupe: misma historia con distinta URL y tokens solapados
const hoy = new Date().toISOString();
const notas = [
  { id: 'n1', titulo: 'Irán lanza misiles contra Israel tras amenaza', url: 'https://a.com/1?utm_source=x', publicado: hoy, imagen: 'img.jpg', fuente: 'BBC' },
  { id: 'n2', titulo: 'Irán lanza misiles contra Israel tras la amenaza', url: 'https://b.com/2', publicado: hoy, fuente: 'El País' },
  { id: 'n3', titulo: 'Terremoto en Turquía deja 40 heridos', url: 'https://c.com/3', publicado: hoy, fuente: 'DW' },
];
const dedup = deduplicar(notas);
assert.equal(dedup.length, 2, 'n1 y n2 deben fundirse');
assert.equal(dedup[0].principal.imagen, 'img.jpg', 'conserva la nota con imagen');
assert.equal(dedup.find((g) => g.principal.id === 'n1').duplicados.length, 1);
console.log('3 OK · dedupe por similitud y URL, conserva la mejor nota');

// 4) Centroides y regiones
assert(centroide('UA') && Math.abs(centroide('UA')[0] - 48.4) < 1);
assert.equal(centroide('XX'), null);
assert.equal(regionDe('MX'), 'AMERICA_LATINA');
assert.equal(regionDe('IL'), 'ORIENTE_MEDIO');
console.log('4 OK · centroides y macrorregiones');

// 5) Noticias en el mapa: marcadores con precisión país, deduplicados
const notasMapa = [
  { id: 'm1', titulo: 'Irán lanza misiles contra Israel', url: 'https://a.com/1', publicado: hoy, fuente: 'BBC', imagen: null, sourceCountry: 'IR', conflictTag: 'iran-israel', tacticalTag: 'ALERTA', summary: 'Misiles' },
  { id: 'm2', titulo: 'Irán lanza misiles contra Israel', url: 'https://b.com/2', publicado: hoy, fuente: 'El País', imagen: null, sourceCountry: 'IR', conflictTag: 'iran-israel', tacticalTag: 'ALERTA', summary: 'Misiles' },
  { id: 'm3', titulo: 'Terremoto en Turquía deja heridos', url: 'https://c.com/3', publicado: hoy, fuente: 'DW', imagen: null, sourceCountry: 'TR', conflictTag: null, tacticalTag: 'HUMANITARIO', summary: null },
  { id: 'm4', titulo: 'Sin país declarado', url: 'https://d.com/4', publicado: hoy, fuente: 'ONU', imagen: null, sourceCountry: null, conflictTag: null, tacticalTag: null, summary: null },
];
const { marcadores, sinPais, resumen } = construirMarcadores(notasMapa, { ventanaHoras: 720 });
assert.equal(marcadores.length, 2, 'IR deduplica a 1 marcador; TR otro');
assert.equal(sinPais.length, 1, 'la nota sin país va a su propia lista');
assert.equal(resumen.unicas, 3);
assert.equal(resumen.porRegion.ORIENTE_MEDIO, 2); // IR y TR
assert.equal(resumen.porCategoria.ALERTA, 1);
assert(marcadores.every((m) => m.precision === 'pais'));
console.log('5 OK · marcadores por país, dedupe y resumen de regiones');

// 6) Cronología
const crono = construirCronologia(notasMapa);
assert.equal(crono.length, 1);
assert.equal(crono[0].total, 3, 'la cronología también deduplica');
console.log('6 OK · cronología por día deduplicada');

// 7) Relacionadas
const rel = relacionadas(notasMapa[0], notasMapa);
assert(rel.length >= 1);
assert(rel[0].motivos.includes('mismo conflicto') || rel[0].motivos.includes('mismo país'));
console.log('7 OK · relacionadas por conflicto/país');

console.log('\nMisión 003 · 7/7 bloques de prueba OK');
