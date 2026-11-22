import test from 'node:test';
import assert from 'node:assert/strict';
import { comprobar, inspeccionar, validar } from '../../tools/ecosistema/inspeccion.mjs';
const item = { id: 'test', tipo: 'pagina', url: 'https://test.invalid/', limiteMs: 10000 };
const res = (status, body) => new Response(body, { status });
test('valida latido y no confunde HTTP 200 con base sana', () => {
 assert.equal(validar('salud', '{"ok":true,"db":"up"}'), null);
 assert.match(validar('salud', '{"ok":true,"db":"down"}'), /down/);
 assert.ok(validar('salud', 'incorrecto'));
});
test('verifica fuente realista y rechaza datos vacíos', () => {
 assert.equal(validar('banco', '[{},[{"date":"2024","value":50}]]'), null);
 assert.ok(validar('banco', '[{},[]]'));
});
test('reintenta y recupera, sin peticiones extras', async () => {
 let n=0; const r=await comprobar(item,{fetchImpl:async()=>++n===1?res(503,'fallo'):res(200,'<html></html>'),esperar:async()=>{}});
 assert.equal(r.estado,'ok');assert.equal(r.intentos,2);assert.equal(n,2);
});
test('conserva fallo tras dos intentos', async () => {
 const r=await comprobar(item,{fetchImpl:async()=>res(503,'fallo'),esperar:async()=>{}});
 assert.equal(r.estado,'error');assert.equal(r.intentos,2);assert.equal(r.codigo,503);
});
test('respuesta 200 incorrecta no es éxito', async () => {
 const r=await comprobar(item,{fetchImpl:async()=>res(200,'hola'),intentos:1});assert.equal(r.estado,'error');
});
test('informe incluye resultados y fecha', async () => {
 const r=await inspeccionar([item],{fetchImpl:async()=>res(200,'<html></html>')});assert.equal(r.resultados.length,1);assert.ok(!Number.isNaN(Date.parse(r.realizadoEn)));
});
