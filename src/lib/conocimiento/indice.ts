import areasJson from './areas.json';
import centrosJson from './centros.json';
import conceptosJson from './conceptos.json';
import fuentesJson from './fuentes.json';
import hitosJson from './hitos.json';
import civilizacionesJson from './civilizaciones.json';
import organizacionesJson from './organizaciones.json';
import type {Area,Centro,Concepto,Fuente,Hito,Civilizacion,Organizacion,Indicador} from './tipos';
export const AREAS=areasJson as Area[];
export const CENTROS=centrosJson as Centro[];
export const CONCEPTOS=conceptosJson as Concepto[];
export const FUENTES=fuentesJson as Fuente[];
export const HITOS=hitosJson as Hito[];
export const CIVILIZACIONES=civilizacionesJson as Civilizacion[];
export const ORGANIZACIONES=organizacionesJson as Organizacion[];
export const REVISION_EDITORIAL='2026-11-18';
export const normalizar=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export const anno=(n:number)=>n<0?`${Math.abs(n)} a. C.`:`${n}`;
export function filtrarConceptos(q:string,area=''){const tokens=normalizar(q).split(/\s+/).filter(Boolean);return CONCEPTOS.filter(c=>(!area||c.area===area)&&tokens.every(t=>normalizar(`${c.titulo} ${c.resumen} ${c.mecanismo} ${c.contexto}`).includes(t)));}
export function observacion(i:Indicador|undefined,iso3:string,year:number|'ultimo'):{value:number;year:number}|null{const serie=i?.series[iso3];if(!serie)return null;const y=year==='ultimo'?Math.max(...Object.keys(serie).map(Number)):year;const value=serie[String(y)];return typeof value==='number'&&Number.isFinite(value)?{value,year:y}:null;}
export function formato(v:number|null|undefined,compact=false){return typeof v==='number'&&Number.isFinite(v)?new Intl.NumberFormat('es',{maximumFractionDigits:2,...(compact?{notation:'compact'}:{})}).format(v):'Sin dato';}
export function relacionesDe(id:string){const c=CONCEPTOS.find(c=>c.id===id);if(!c)return[];const directas=c.relacionados.map(target=>({from:id,to:target,tipo:'relación editorial' as const}));const inversas=CONCEPTOS.filter(x=>x.id!==id&&x.relacionados.includes(id)&&!c.relacionados.includes(x.id)).map(x=>({from:id,to:x.id,tipo:'enlace entrante' as const}));return [...directas,...inversas];}
export function rutasConocimiento(){return ['/conocimiento',...AREAS.map(a=>`/conocimiento/area/${a.id}`),...CENTROS.map(c=>`/conocimiento/centro/${c.id}`),...CONCEPTOS.map(c=>`/conocimiento/tema/${c.id}`)];}
/** Correspondencias de contexto: no implican prueba de una teoría científica. */
export function indicadoresParaArea(area:string,all:Indicador[]){const map:Record<string,string[]>={historia:[],geografia:['poblacion','urbana'],geopolitica:['exportaciones','rentas'],economia:['pib','pibpc'],'finanzas-publicas':['impuestos','pib'],'comercio-internacional':['exportaciones','importaciones'],ciencia:['investigacion'],tecnologia:['internet','investigacion'],medioambiente:['bosque'],energia:['electricidad'],'demografia':['poblacion','fertilidad'],educacion:['escolarizacion'],'recursos-naturales':['rentas','agua'],agricultura:['agricultura'],industria:['industria'],transporte:['exportaciones'],'desarrollo-humano':['vida','pibpc'],urbanismo:['urbana'],infraestructura:['electricidad','internet']};const ids=map[area]??[];return ids.flatMap(id=>all.filter(i=>i.id===id));}
