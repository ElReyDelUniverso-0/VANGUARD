#!/usr/bin/env node
/** Banco Mundial API v2. Solo datos numéricos recibidos; ninguna interpolación.
 * Ejecutar manualmente: node scripts/conocimiento/actualizar-indicadores.mjs
 * Salida atómica; un fallo conserva el snapshot anterior. Sin claves ni BD. */
import fs from 'node:fs/promises';
import path from 'node:path';
const defs = [
 ['poblacion','SP.POP.TOTL','Población','personas','demografia','Habitantes residentes; las estimaciones se revisan con los censos.'],
 ['pib','NY.GDP.MKTP.CD','PIB','US$ corrientes','economia','Producción valorada en dólares corrientes; no mide bienestar ni crecimiento real.'],
 ['pibpc','NY.GDP.PCAP.CD','PIB por habitante','US$ corrientes/persona','economia','Promedio de producción por habitante; oculta distribución e informalidad.'],
 ['urbana','SP.URB.TOTL.IN.ZS','Población urbana','% de población','urbanismo','Las definiciones de urbano varían entre oficinas nacionales.'],
 ['vida','SP.DYN.LE00.IN','Esperanza de vida','años','desarrollo-humano','Indicador de período al nacer, no pronóstico de una cohorte individual.'],
 ['agricultura','NV.AGR.TOTL.ZS','Agricultura, silvicultura y pesca','% del PIB','agricultura','Valor añadido sectorial; no equivale a empleo ni superficie cultivada.'],
 ['industria','NV.IND.TOTL.ZS','Industria incluida construcción','% del PIB','industria','Incluye minería, manufactura, servicios públicos y construcción.'],
 ['exportaciones','NE.EXP.GNFS.ZS','Exportaciones de bienes y servicios','% del PIB','comercio-internacional','Los flujos brutos pueden superar el PIB en economías de intermediación.'],
 ['importaciones','NE.IMP.GNFS.ZS','Importaciones de bienes y servicios','% del PIB','comercio-internacional','No es por sí solo un indicador de dependencia o fragilidad.'],
 ['bosque','AG.LND.FRST.ZS','Superficie forestal','% de superficie terrestre','medioambiente','No distingue por sí sola bosque primario, plantación ni calidad ecológica.'],
 ['electricidad','EG.ELC.ACCS.ZS','Acceso a electricidad','% de población','energia','Acceso no garantiza suministro continuo, seguro ni asequible.'],
 ['fertilidad','SP.DYN.TFRT.IN','Fecundidad total','nacimientos por mujer','demografia','Tasa sintética de período, no descendencia final de una generación.'],
 ['investigacion','GB.XPD.RSDV.GD.ZS','Gasto en investigación y desarrollo','% del PIB','ciencia','Cobertura y años difieren por país; un hueco no significa ausencia de investigación.'],
 ['impuestos','GC.TAX.TOTL.GD.ZS','Ingresos tributarios','% del PIB','finanzas-publicas','Cobertura institucional de gobierno central; no comparar sin revisar metadatos.'],
 ['rentas','NY.GDP.TOTL.RT.ZS','Rentas de recursos naturales','% del PIB','recursos-naturales','Renta económica estimada de petróleo, gas, carbón, minerales y bosques; no ingresos fiscales.'],
 ['agua','ER.H2O.FWTL.ZS','Extracción anual de agua dulce','% de recursos internos','recursos-naturales','Puede superar 100 % por reutilización o recursos compartidos; cobertura temporal desigual.'],
 ['internet','IT.NET.USER.ZS','Personas que usan Internet','% de población','tecnologia','Uso reciente según encuestas y estimaciones; no mide velocidad o asequibilidad.'],
 ['escolarizacion','SE.SEC.ENRR','Matrícula secundaria bruta','% del grupo de edad','educacion','Incluye alumnado fuera de la edad oficial: puede superar 100 %.']
];
const captured = new Date().toISOString();
async function get(d){const [id,code,name,unit,area,limit]=d;const url=`https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&date=2010:2025&per_page=20000`;let last;
 for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`HTTP ${r.status}`);const data=await r.json();if(!Array.isArray(data?.[1])||Number(data[0].pages)>1)throw Error('Respuesta incompleta o inválida');let series={};for(const row of data[1]){const iso=row.countryiso3code;if(!/^[A-Z]{3}$/.test(iso)||typeof row.value!=='number'||!Number.isFinite(row.value))continue;(series[iso]??={})[row.date]=row.value;}if(!Object.keys(series).length)throw Error('Sin observaciones');console.log(id,Object.keys(series).length);return {id,code,name,unit,area,limit,source:url,lastUpdated:data[0].lastupdated??null,series};}catch(e){last=e;}}
 throw Error(`${code}: ${last}`);
}
const cacheDir=path.resolve('.cache/conocimiento-ingestion');await fs.mkdir(cacheDir,{recursive:true});
const indicators=[],failures=[];let cursor=0;await Promise.all(Array.from({length:4},async()=>{while(cursor<defs.length){const i=cursor++;const cached=path.join(cacheDir,defs[i][0]+'.json');try{let value;try{const old=JSON.parse(await fs.readFile(cached,'utf8'));if(old.captured?.slice(0,10)===captured.slice(0,10))value=old.value;}catch{}if(!value){value=await get(defs[i]);await fs.writeFile(cached,JSON.stringify({captured,value}));}indicators.push(value);}catch(e){failures.push({id:defs[i][0],code:defs[i][1],error:String(e)});console.error(String(e));}}}));
if(!indicators.length)throw Error('Ninguna fuente respondió: se conserva la instantánea anterior');
indicators.sort((a,b)=>defs.findIndex(d=>d[0]===a.id)-defs.findIndex(d=>d[0]===b.id));
const result={schema:1,provider:'Banco Mundial · World Development Indicators',license:'CC BY 4.0 (salvo excepciones de metadatos del proveedor)',terms:'https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets',captured,period:[2010,2025],requested:defs.length,failures,indicators};
const dest=path.resolve('src/lib/conocimiento/indicadores.json');await fs.writeFile(dest+'.tmp',JSON.stringify(result));await fs.rename(dest+'.tmp',dest);console.log('Snapshot completo:',dest);
