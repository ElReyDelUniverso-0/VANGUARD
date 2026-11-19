import { muro, claveCliente } from '@/lib/fortaleza';
import { ok, fallo, conManejo, validar } from '@/lib/sistema/contrato';
import { NODOS, RELACIONES, FUENTES, REVISION, LIMITES, TEMAS, TIPOS_RELACION, buscarRed, nodoRed, relacionesDe, caminoEntre } from '@/lib/redes/indice';
export const dynamic='force-dynamic';
const SECCIONES=['catalogo','nodos','relaciones','fuentes','camino'] as const;
export const GET=conManejo('/api/redes',async(req,t0)=>{
 const v=muro(`redes:${claveCliente(req)}`,60,60_000);
 if(!v.permitido)return fallo('MURO','Demasiadas consultas; espera antes de reintentar.',undefined,{t0,cabeceras:{'Retry-After':String(v.espera)}});
 const p=new URL(req.url).searchParams;
 const seccion=validar.unoDe(p.get('seccion'),'seccion',SECCIONES,'catalogo');
 if((p.get('q')||'').length>180)return fallo('VALIDACION','Consulta demasiado larga; máximo 180 caracteres.',undefined,{t0});
 const q=validar.texto(p.get('q'),'q',{max:180});
 const id=validar.texto(p.get('id'),'id',{max:80});
 const tipo=p.get('tipo')||'';if(tipo&&!Object.hasOwn(TIPOS_RELACION,tipo))return fallo('VALIDACION','Tipo de relación desconocido.',undefined,{t0});
 const limite=Number(p.get('limite')??50),desde=Number(p.get('desde')??0);
 if(!Number.isInteger(limite)||limite<1||limite>100||!Number.isInteger(desde)||desde<0||desde>10000)return fallo('VALIDACION','Paginación inválida: limite 1–100, desde 0–10000.',undefined,{t0});
 if(id&&!nodoRed(id))return fallo('NO_ENCONTRADO','Nodo no incorporado en esta edición.',undefined,{t0});
 const base={revision:REVISION,seccion,limites:LIMITES};let datos:unknown;
 if(seccion==='catalogo')datos={...base,temas:TEMAS,tipos:TIPOS_RELACION,totales:{nodos:NODOS.length,relaciones:RELACIONES.length,fuentes:FUENTES.length}};
 else if(seccion==='camino'){
   const origen=validar.texto(p.get('origen'),'origen',{max:80,requerido:true});const destino=validar.texto(p.get('destino'),'destino',{max:80,requerido:true});
   if(!nodoRed(origen)||!nodoRed(destino))return fallo('NO_ENCONTRADO','Origen o destino no incorporado.',undefined,{t0});
   datos={...base,origen,destino,camino:caminoEntre(origen,destino),nota:'Recorrido exploratorio bidireccional; no prueba alianza, causalidad ni cooperación entre extremos.'};
 }else{
   const lista=seccion==='fuentes'?FUENTES:seccion==='nodos'?(id?[nodoRed(id)!]:buscarRed(q||'',p.get('tema')||'',p.get('clase')||'')):(id?relacionesDe(id):RELACIONES).filter(e=>!tipo||e.tipo===tipo);
   datos={...base,total:lista.length,desde,limite,resultados:lista.slice(desde,desde+limite),siguiente:desde+limite<lista.length?desde+limite:null};
 }
 return ok(datos,{t0,cabeceras:{'Cache-Control':'public, max-age=300'}});
});
