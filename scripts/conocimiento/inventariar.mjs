import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const all=walk('src/app');
const routes=all.filter(f=>/\/(?:page|route)\.[jt]sx?$/.test(f)).map(file=>{const text=fs.readFileSync(file,'utf8');const route='/'+path.dirname(file).replace(/^src\/app\/?/,'').split('/').filter(p=>p&&!/^\(.*\)$/.test(p)&&!p.startsWith('@')).join('/');return {ruta:route,archivo:file,tipo:/\/route\./.test(file)?'endpoint':'pagina',dinamica:route.includes('['),metodos:[...text.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/g)].map(m=>m[1]),dependenciasLocales:[...new Set([...text.matchAll(/(?:from\s+|import\s*)["'](@\/[^"']+)["']/g)].map(m=>m[1]))]};}).sort((a,b)=>a.ruta.localeCompare(b.ruta));
const groups=new Map();for(const r of routes){const key=r.tipo+':'+r.ruta;groups.set(key,[...(groups.get(key)??[]),r.archivo]);}
const out={schema:1,baseCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),generado:new Date().toISOString(),metodo:'Censo estático de page/route y sus imports locales directos. La existencia de código NO demuestra funcionamiento ni publicación. No lee secretos, cuentas ni métricas de visitantes.',rutas:routes,colisiones:[...groups].filter(([,v])=>v.length>1).map(([ruta,archivos])=>({ruta,archivos})),advertencias:['Las funciones duplicadas se identifican por revisión semántica, no por coincidencia de nombres.','Los imports listados son dependencias directas, no el grafo transitivo completo.','Las rutas dinámicas son patrones, no páginas individuales verificadas.']};
fs.writeFileSync('src/lib/conocimiento/inventario.json',JSON.stringify(out,null,2)+'\n');console.log(`${routes.length} patrones inventariados; ${out.colisiones.length} colisiones de ruta.`);
