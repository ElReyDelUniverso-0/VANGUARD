// Fuentes públicas oficiales; no se utilizan los sismos simulados de /api/datos/sismos.
export type Clase = 'sismo' | 'volcan' | 'inundacion' | 'tormenta';
export type Evento = { id:string; titulo:string; clase:Clase; fecha:string; lat:number; lon:number; estado:'registro'|'abierto'|'cerrado'; magnitud:number|null; fuente:'USGS'|'NASA EONET'; url:string };
export type Resultado = { eventos:Evento[]; consultadoEn:string|null; estado:'actualizado'|'respaldo'|'no-disponible'; aviso?:string };
type Json = Record<string, any>;
const categorias:Record<string,Clase> = {volcanoes:'volcan', floods:'inundacion', severeStorms:'tormenta'};
function punto(c:unknown): c is [number,number,...number[]] { return Array.isArray(c) && typeof c[0]==='number' && Number.isFinite(c[0]) && c[0]>=-180 && c[0]<=180 && typeof c[1]==='number' && Number.isFinite(c[1]) && c[1]>=-90 && c[1]<=90; }
function fecha(v:unknown):string|null { const d=typeof v==='number'||typeof v==='string'?new Date(v):null;return d && Number.isFinite(d.getTime())?d.toISOString():null; }
export function parseSismos(data:unknown):Evento[] {
 const d=data as Json;if (!d||d.type!=='FeatureCollection'||!Array.isArray(d.features)) throw new Error('USGS: formato inválido');
 return d.features.flatMap((f:Json)=>{const p=f.properties||{}, c=f.geometry?.coordinates, t=fecha(p.time);if(typeof f.id!=='string'||!punto(c)||!t||typeof p.mag!=='number'||!Number.isFinite(p.mag))return [];return [{id:'usgs:'+f.id,titulo:typeof p.place==='string'?p.place:'Lugar sin nombre',clase:'sismo' as const,fecha:t,lon:c[0],lat:c[1],estado:'registro' as const,magnitud:p.mag,fuente:'USGS' as const,url:`https://earthquake.usgs.gov/earthquakes/eventpage/${encodeURIComponent(f.id)}`}];});
}
export function parseEonet(data:unknown):Evento[] {
 const d=data as Json;if(!d||!Array.isArray(d.events))throw new Error('EONET: formato inválido');
 return d.events.flatMap((e:Json)=>{if(typeof e.id!=='string'||typeof e.title!=='string')return []; const categoria=Array.isArray(e.categories)?e.categories.find((x:Json)=>categorias[x?.id]):null;const clase=categorias[categoria?.id];if(!clase||!Array.isArray(e.geometry))return [];const geometria=e.geometry.filter((g:Json)=>g?.type==='Point'&&punto(g.coordinates)&&fecha(g.date)).sort((a:Json,b:Json)=>Date.parse(b.date)-Date.parse(a.date))[0];if(!geometria)return [];return [{id:'eonet:'+e.id,titulo:e.title,clase,fecha:fecha(geometria.date)!,lon:geometria.coordinates[0],lat:geometria.coordinates[1],estado:e.closed?'cerrado' as const:'abierto' as const,magnitud:null,fuente:'NASA EONET' as const,url:`https://eonet.gsfc.nasa.gov/api/v3/events/${encodeURIComponent(e.id)}`}];});
}
const URLS = { usgs:'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson', eonet:'https://eonet.gsfc.nasa.gov/api/v3/events?status=all&days=30&limit=500&category=volcanoes,floods,severeStorms' } as const;
const cache = new Map<string,{eventos:Evento[];fecha:string;ts:number}>();
export async function obtenerFuente(id:'usgs'|'eonet'):Promise<Resultado> {
 const previa=cache.get(id); if(previa && Date.now()-previa.ts<300000)return {eventos:previa.eventos,consultadoEn:previa.fecha,estado:'actualizado'};
 try { const r=await fetch(URLS[id],{cache:'no-store',signal:AbortSignal.timeout(9000)});if(!r.ok)throw new Error(`HTTP ${r.status}`); const json:unknown=await r.json();const eventos=id==='usgs'?parseSismos(json):parseEonet(json);const ahora=new Date().toISOString();cache.set(id,{eventos,fecha:ahora,ts:Date.now()});return {eventos,consultadoEn:ahora,estado:'actualizado'}; }
 catch { if(previa)return {eventos:previa.eventos,consultadoEn:previa.fecha,estado:'respaldo',aviso:'Fuente temporalmente inaccesible; se conserva la última respuesta de esta instancia.'};return {eventos:[],consultadoEn:null,estado:'no-disponible',aviso:'Fuente no disponible. No se han inventado eventos.'}; }
}
