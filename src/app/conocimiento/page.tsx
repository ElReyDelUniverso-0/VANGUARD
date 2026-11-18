import type {Metadata} from 'next';
import {ExploradorConocimiento} from '@/components/conocimiento/explorador';
import {datosConocimiento} from '@/lib/conocimiento/datos';
import {SITE_URL} from '@/lib/site';
export const metadata:Metadata={title:'Conocimiento global · VANGUARD',description:'Enciclopedia conectada, nueve centros de investigación, comparación de países y civilizaciones, cronologías e indicadores con fuentes y límites visibles.',alternates:{canonical:`${SITE_URL}/conocimiento`}};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const sp=await searchParams;const s=(k:string)=>typeof sp[k]==='string'?(sp[k] as string).slice(0,180):'';return <ExploradorConocimiento datos={datosConocimiento()} initialMode={s('modo')||'inicio'} initialCountry={s('pais')||'do'} initialQuery={s('q')}/>;}
