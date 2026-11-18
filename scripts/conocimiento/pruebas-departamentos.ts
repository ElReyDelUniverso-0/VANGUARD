import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NextRequest} from 'next/server';
import {RUTAS_APRENDIZAJE,evaluarRespuesta,explicarConcepto} from '../../src/lib/conocimiento/aprendizaje';
import {CONCEPTOS,rutasConocimiento} from '../../src/lib/conocimiento/indice';
import dept from '../../src/lib/departamentos/registro.json';
import inv from '../../src/lib/conocimiento/inventario.json';
import {MODULOS_NUCLEO} from '../../src/lib/nucleo/registro';
import {GET} from '../../src/app/api/conocimiento/explicar/route';
async function main(){
const checks:string[]=[];function check(name:string,fn:()=>void){fn();checks.push(name);console.log('✓',name);}
check('22 departamentos con auditoría, alcance, archivos, pruebas, límites y siguiente expansión',()=>{assert.equal(dept.length,22);assert.equal(new Set(dept.map(d=>d.id)).size,22);for(const d of dept){assert.equal(d.estado,'parcial');for(const key of ['auditoria','funcionalidad','integracion','pruebas','problemas','pendiente','motivo','proxima'] as const)assert(d[key].length>20);for(const f of d.archivos)assert(fs.existsSync(f),f);for(const r of d.rutas){const p=r.split('?')[0];assert(fs.existsSync(`src/app${p}/page.tsx`)||inv.rutas.some(x=>x.ruta===p)||rutasConocimiento().includes(p),r);}}});
check('Censo reproducible sin colisiones; cada patrón apunta a un archivo real',()=>{assert.equal(inv.colisiones.length,0);assert(inv.rutas.length>150);for(const r of inv.rutas)assert(fs.existsSync(r.archivo));});
check('Cuatro rutas y doce actividades conectadas a expedientes con fuentes',()=>{assert.equal(RUTAS_APRENDIZAJE.length,4);assert.equal(RUTAS_APRENDIZAJE.flatMap(r=>r.preguntas).length,12);for(const r of RUTAS_APRENDIZAJE)for(const p of r.preguntas){assert(CONCEPTOS.some(c=>c.id===p.concepto&&c.fuentes.length>0));assert(p.correcta>=0&&p.correcta<p.opciones.length);assert(p.explicacion.length>50);}});
check('Evaluación distingue respuestas correctas, incorrectas y entradas no enteras',()=>{for(const r of RUTAS_APRENDIZAJE)for(const p of r.preguntas){assert(evaluarRespuesta(p,p.correcta).correcta);assert(!evaluarRespuesta(p,(p.correcta+1)%p.opciones.length).correcta);assert(!evaluarRespuesta(p,NaN).correcta);assert(!evaluarRespuesta(p,0.5).correcta);}});
check('Motor explicativo reutiliza el texto exacto y no responde sobre temas inexistentes',()=>{for(const c of CONCEPTOS){const r=explicarConcepto(c.id,'rapido')!,full=explicarConcepto(c.id,'completo')!;assert.equal(r.resumen,c.resumen);assert.equal(r.limites,c.limite);assert.equal(full.mecanismo,c.mecanismo);assert(!('mecanismo' in r));assert(r.fuentes.length>0);}assert.equal(explicarConcepto('inexistente','rapido'),null);});
check('Los nuevos módulos tienen destino y dependencias registradas',()=>{for(const id of ['mod:academia-conocimiento','mod:departamentos']){const m=MODULOS_NUCLEO.find(m=>m.id===id)!;assert(m);assert(fs.existsSync(`src/app${m.ruta}/page.tsx`));for(const d of m.dependencias)assert(MODULOS_NUCLEO.some(m=>m.id===d));}});
for(const [query,status] of [['tema=pib',200],['tema=pib&nivel=completo',200],['tema=no-existe',404],['tema=pib&nivel=inventar',400],['tema='+('x'.repeat(101)),400]] as const){const r=GET(new NextRequest('http://localhost/api/conocimiento/explicar?'+query));assert.equal(r.status,status);const j=await r.json();assert.equal(j.api,'1');assert.equal(j.ok,status===200);if(status===200)assert.equal(j.datos.id,'pib');checks.push(`API explicativa ${query.slice(0,45)} → ${status}`);}
fs.mkdirSync('qa/conocimiento',{recursive:true});fs.writeFileSync('qa/conocimiento/departamentos.json',JSON.stringify({passed:checks.length,checks,scope:'Integridad de contratos y lógica. No certifica todas las misiones ni derechos de activos heredados.'},null,2)+'\n');console.log(`${checks.length} pruebas aprobadas.`);

}
main().catch(e=>{console.error(e);process.exitCode=1});
