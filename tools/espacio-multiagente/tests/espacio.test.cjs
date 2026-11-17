// ESPACIO MULTIAGENTE · prueba de extremo a extremo (servidor HTTP REAL en localhost)
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const os = require('os');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'espacio-'));
const almacen = path.join(tmp, 'espacio.json');
const ROOT = path.join(__dirname, '..');

// servidor local REAL en proceso aparte
const { spawn } = require('child_process');
const { once } = require('events');
const hijo = spawn('node', [path.join(__dirname, 'servidor-fijo.cjs')], { stdio: ['ignore', 'pipe', 'inherit'] });
let port = null;
hijo.stdout.on('data', (d) => {
  const m = String(d).match(/READY (\d+)/);
  if (m) port = Number(m[1]);
});
const esperarPuerto = () => new Promise((resolve, reject) => {
  const t = setInterval(() => { if (port) { clearInterval(t); resolve(port); } }, 10);
  setTimeout(() => { clearInterval(t); reject(new Error('el servidor de prueba no arrancó')); }, 5000);
});

const run = (args) => execFileSync('node', [path.join(ROOT, 'dist/cli.js'), ...args], {
  env: { ...process.env, ESPACIO: almacen }, encoding: 'utf8',
}).trim();

(async () => {
  port = await esperarPuerto();
  const URL_REAL = `http://127.0.0.1:${port}/cable-prueba`;
  // 1) roles listas con funciones delimitadas
  const roles = run(['roles']);
  assert(roles.includes('coordinacion') && roles.includes('seguridad'));
  console.log('1 OK · roles listados con estado');

  // 2) crear y asignar tarea
  const out = run(['tarea', 'nuevo', 'Revisar foco visible del teletipo', '--rol', 'portada', '--detalle', 'WCAG 2.4.7']);
  const tareaId = out.split(' ')[1];
  assert(/creada [0-9a-f]{8}/.test(out));
  run(['tarea', 'estado', tareaId, 'en-curso', '--evidencia', 'B-14 del backlog']);
  console.log('2 OK · tarea creada, asignada y con evidencia');

  // 3) fuente REAL vía HTTP contra el servidor local — sin simulación
  const fOut = run(['fuente', URL_REAL, '--nota', 'cable de prueba del espacio']);
  assert(/HTTP 200/.test(fOut), fOut);
  const fuenteId = fOut.split(' ')[2];
  console.log('3 OK · fetch HTTP real ejecutado y registrado (' + fOut + ')');

  // 4) hallazgo enlazado a la fuente
  const hOut = run(['hallazgo', tareaId, 'El cable informa de ataques con misiles; la fuente lo confirma', '--rol', 'noticias', '--confianza', 'alta', '--fuente', fuenteId]);
  assert(/hallazgo [0-9a-f]{8}/.test(hOut));
  console.log('4 OK · hallazgo registrado con fuente y confianza');

  // 5) pregunta comparada entre dos especialistas
  const pOut = run(['pregunta', 'nuevo', '¿Qué tan urgente es el caso?']);
  const preguntaId = pOut.split(' ')[1];
  run(['respuesta', preguntaId, 'noticias', 'Urgente: hay misiles y fecha declarada']);
  run(['respuesta', preguntaId, 'qa', 'Urgente: revisar antes de publicar en producción']);
  const cmp = run(['comparar', preguntaId]);
  assert(/noticias ↔ qa: 0\.\d+/.test(cmp), cmp);
  console.log('5 OK · comparación de respuestas (solapamiento real):', cmp);

  // 6) informe generado desde el almacén, con la URL real dentro
  const informePath = path.join(tmp, 'informe.md');
  run(['informe', informePath]);
  const informe = fs.readFileSync(informePath, 'utf8');
  assert(informe.includes(URL_REAL), 'el informe cita la fuente real');
  assert(informe.includes('Irán lanza misiles'), 'el informe incluye el extracto real');
  assert(informe.includes('Extracto') || informe.includes('extracto'), 'extractos presentes');
  console.log('6 OK · informe Markdown generado con evidencia real');

  // 7) ningún dato inventado: fuente inexistente → nada se guarda
  const eAntes = JSON.parse(fs.readFileSync(almacen, 'utf8'));
  try { run(['fuente', 'http://127.0.0.1:1/no-existe']); assert.fail('debía fallar'); }
  catch { /* el CLI sale con error 1 y NO escribe */ }
  const eDespues = JSON.parse(fs.readFileSync(almacen, 'utf8'));
  assert.equal(eDespues.fuentes.length, eAntes.fuentes.length, 'no se registra nada cuando el fetch falla');
  console.log('7 OK · un fetch fallido NO registra fuente (nada inventado)');

  hijo.kill('SIGTERM');
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('\nEspacio multiagente · 7/7 OK');
})().catch((e) => { console.error(e); try { hijo.kill('SIGTERM'); } catch {} process.exit(1); });
