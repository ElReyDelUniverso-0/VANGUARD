const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function cargar(fetch, ahora) {
  const src=fs.readFileSync('src/lib/noticias-cache.ts','utf8');
  const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  const FakeDate=class extends Date { static now(){return ahora.valor;} };
  const c={exports:{},fetch,Date:FakeDate,Promise,console};c.globalThis=c;vm.runInNewContext(js,c);return c.exports;
}
const ok = body=>({ok:true,json:async()=>body});
test('una respuesta válida se conserva cuando falla la siguiente',async()=>{
 let n=0;const clock={valor:1000};const a=cargar(async()=>++n===1?ok({items:[{id:'a'}]}):{ok:false,status:503},clock);
 assert.equal((await a.pedirNoticias())[0].id,'a');clock.valor+=46000;
 await assert.rejects(a.pedirNoticias(),/503/);assert.equal(a.respaldoNoticias().items[0].id,'a');assert.equal(a.estadoNoticias().respaldoDisponible,true);assert.equal(a.estadoNoticias().ultimoExito,1000);
});
test('respuesta inválida no destruye el último dato válido',async()=>{
 let n=0;const clock={valor:1000};const a=cargar(async()=>++n===1?ok({items:[1]}):ok({error:'fallo'}),clock);
 await a.pedirNoticias();clock.valor+=46000;await assert.rejects(a.pedirNoticias(),/inválida/);assert.equal(a.respaldoNoticias().items[0],1);assert.equal(a.estadoNoticias().respaldoDisponible,true);
});
test('sin dato previo el error no se disimula',async()=>{
 const a=cargar(async()=>({ok:false,status:503}),{valor:1000});await assert.rejects(a.pedirNoticias(),/503/);assert.equal(a.estadoNoticias().respaldoDisponible,false);
});
test('respaldo de más de 24 horas se rechaza',async()=>{
 let n=0;const clock={valor:1000};const a=cargar(async()=>++n===1?ok({items:[1]}):{ok:false,status:503},clock);
 await a.pedirNoticias();clock.valor+=86400001;await assert.rejects(a.pedirNoticias(),/503/);
});
test('repeticiones simultáneas comparten una petición',async()=>{
 let n=0;const a=cargar(async()=>{n++;await new Promise(r=>setTimeout(r,15));return ok({items:[1]});},{valor:1000});
 const [x,y]=await Promise.all([a.pedirNoticias(),a.pedirNoticias()]);assert.equal(n,1);assert.equal(x[0],y[0]);
});
