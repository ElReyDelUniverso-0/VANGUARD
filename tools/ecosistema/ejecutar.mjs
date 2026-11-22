import { mkdir, writeFile } from 'node:fs/promises';
import { inspeccionar } from './inspeccion.mjs';
const informe = await inspeccionar();
await mkdir('informes-ecosistema', { recursive: true });
await writeFile('informes-ecosistema/salud.json', JSON.stringify(informe, null, 2) + '\n');
for (const r of informe.resultados) console.log(`${r.estado.toUpperCase()} ${r.id} HTTP=${r.codigo ?? '-'} ${r.ms}ms (${r.intentos} intentos)${r.detalle ? ' · ' + r.detalle : ''}`);
if (informe.resultados.some(r => r.estado === 'error' || r.estado === 'lento')) process.exitCode = 1;
