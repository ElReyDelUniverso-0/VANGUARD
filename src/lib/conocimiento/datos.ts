/** Adaptador de SOLO LECTURA. Reutiliza identidades y geometría existentes.
 * Nunca altera países, monedas, juegos ni tablas de Prisma. */
import { fichas } from '@/lib/mundos/ficha';
import { POLIGONOS_ORDENADOS } from '@/lib/mundos/mapa';
import raw from './indicadores.json';
import {AREAS,CENTROS,CONCEPTOS,HITOS,CIVILIZACIONES,ORGANIZACIONES,FUENTES} from './indice';
import type {DatosConocimiento,Snapshot} from './tipos';
let cache:DatosConocimiento|undefined;
export function datosConocimiento():DatosConocimiento{
 if(cache)return cache;
 const paises=fichas().map(p=>({iso2:p.iso2,iso3:p.iso3,nombre:p.nombre,region:p.region,lat:p.lat,lng:p.lng,capital:p.atlas?.capital??null,moneda:p.moneda?.nombre??null}));
 const isos=new Set(paises.map(p=>p.iso3));
 const snapshot=raw as unknown as Snapshot;
 // Se excluyen agregados (WLD, grupos de ingreso, regiones) de tablas de países.
 const indicators=snapshot.indicators.map(i=>({...i,series:Object.fromEntries(Object.entries(i.series).filter(([iso])=>isos.has(iso)))}));
 const cubiertos=new Set<string>();let observaciones=0;for(const i of indicators)for(const [iso,serie] of Object.entries(i.series)){cubiertos.add(iso);observaciones+=Object.keys(serie).length;}
 cache={areas:AREAS,centros:CENTROS,conceptos:CONCEPTOS,hitos:HITOS,civilizaciones:CIVILIZACIONES,organizaciones:ORGANIZACIONES,fuentes:FUENTES,paises,indicadores:{...snapshot,indicators},mapa:POLIGONOS_ORDENADOS.filter(p=>!!p.iso2).map(p=>({iso2:p.iso2!,d:p.pais.d})),cobertura:{paises:paises.length,conDatos:cubiertos.size,observaciones,fuentes:FUENTES.length}};
 return cache;
}
