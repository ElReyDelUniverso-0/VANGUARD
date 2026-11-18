import assert from 'node:assert/strict';
import fs from 'node:fs';
import {NextRequest} from 'next/server';
import {RUTAS_APRENDIZAJE,evaluarRespuesta,explicarConcepto} from '../../src/lib/conocimiento/aprendizaje';
import {CONCEPTOS,rutasConocimiento} from '../../src/lib/conocimiento/indice';
import {DEPARTAMENTOS as dept} from '../../src/lib/arquitectura/departamentos';
import inv from '../../src/lib/arquitectura/censo.json';
import {FUENTES_PUBLICAS} from '../../src/lib/nucleo/fuentes';
import {MODULOS_NUCLEO} from '../../src/lib/nucleo/registro';
import {GET} from '../../src/app/api/conocimiento/explicar/route';
async function main(){
const checks:string[]=[];function check(name:string,fn:()=>void){fn();checks.push(name);console.log('✓',name);}
check('Registro canónico único de 22 departamentos; academia y explicador con alcance parcial',()=>{assert.equal(dept.length,22);assert.equal(new Set(dept.map(d=>d.id)).size,22);assert.equal(dept.find(d=>d.n===14)?.estado,'parcial');assert.equal(dept.find(d=>d.n===15)?.estado,'parcial');for(const d of dept){assert(d.falta.length>0);assert(d.siguiente.length>20);for(const pieza of d.existe){if(!pieza.ruta)continue;const p=pieza.ruta.split('?')[0];assert(fs.existsSync(`src/app${p}/page.tsx`)||inv.rutas.some(x=>new RegExp('^'+x.ruta.replace(/\[[^\]]+\]/g,'[^/]+')+'$').test(p))||rutasConocimiento().includes(p),p);}}});
check('Censo compartido regenerado y sin rutas huérfanas',()=>{assert(inv.total>150);assert.deepEqual(inv.huerfanas,[]);assert.equal(inv.total,inv.paginas+inv.rutasApi);});
check('Cuatro rutas y doce actividades conectadas a expedientes con fuentes',()=>{assert.equal(RUTAS_APRENDIZAJE.length,4);assert.equal(RUTAS_APRENDIZAJE.flatMap(r=>r.preguntas).length,12);for(const r of RUTAS_APRENDIZAJE)for(const p of r.preguntas){assert(CONCEPTOS.some(c=>c.id===p.concepto&&c.fuentes.length>0));assert(p.correcta>=0&&p.correcta<p.opciones.length);assert(p.explicacion.length>50);}});
check('Evaluación distingue respuestas correctas, incorrectas y entradas no enteras',()=>{for(const r of RUTAS_APRENDIZAJE)for(const p of r.preguntas){assert(evaluarRespuesta(p,p.correcta).correcta);assert(!evaluarRespuesta(p,(p.correcta+1)%p.opciones.length).correcta);assert(!evaluarRespuesta(p,NaN).correcta);assert(!evaluarRespuesta(p,0.5).correcta);}});
check('Motor explicativo reutiliza el texto exacto y no responde sobre temas inexistentes',()=>{for(const c of CONCEPTOS){const r=explicarConcepto(c.id,'rapido')!,full=explicarConcepto(c.id,'completo')!;assert.equal(r.resumen,c.resumen);assert.equal(r.limites,c.limite);assert.equal(full.mecanismo,c.mecanismo);assert(!('mecanismo' in r));assert(r.fuentes.length>0);}assert.equal(explicarConcepto('inexistente','rapido'),null);});
check('Los nuevos módulos tienen destino y dependencias registradas',()=>{for(const id of ['mod:academia-conocimiento','mod:conocimiento-global']){const m=MODULOS_NUCLEO.find(m=>m.id===id)!;assert(m);assert(fs.existsSync(`src/app${m.ruta}/page.tsx`));for(const d of m.dependencias)assert(MODULOS_NUCLEO.some(m=>m.id===d)||FUENTES_PUBLICAS.some(f=>f.id===d));}});
for(const [query,status] of [['tema=pib',200],['tema=pib&nivel=completo',200],['tema=no-existe',404],['tema=pib&nivel=inventar',400],['tema='+('x'.repeat(101)),400]] as const){const r=GET(new NextRequest('http://localhost/api/conocimiento/explicar?'+query));assert.equal(r.status,status);const j=await r.json();assert.equal(j.api,'1');assert.equal(j.ok,status===200);if(status===200)assert.equal(j.datos.id,'pib');checks.push(`API explicativa ${query.slice(0,45)} → ${status}`);}
fs.mkdirSync('qa/conocimiento',{recursive:true});fs.writeFileSync('qa/conocimiento/departamentos.json',JSON.stringify({passed:checks.length,checks,scope:'Integridad de contratos y lógica. No certifica todas las misiones ni derechos de activos heredados.'},null,2)+'\n');console.log(`${checks.length} pruebas aprobadas.`);

}
main().catch(e=>{console.error(e);process.exitCode=1});
