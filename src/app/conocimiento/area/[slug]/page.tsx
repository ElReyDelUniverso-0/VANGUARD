import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ExploradorConocimiento} from '@/components/conocimiento/explorador';
import {datosConocimiento} from '@/lib/conocimiento/datos';
import {AREAS} from '@/lib/conocimiento/indice';
import {SITE_URL} from '@/lib/site';
export function generateStaticParams(){return AREAS.map(c=>({slug:c.id}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params,c=AREAS.find(c=>c.id===slug);return c?{title:`${c.nombre} · VANGUARD`,description:c.pregunta,alternates:{canonical:`${SITE_URL}/conocimiento/area/${c.id}`}}:{};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!AREAS.some(c=>c.id===slug))notFound();const all=datosConocimiento();return <ExploradorConocimiento datos={{...all,mapa:[],indicadores:{...all.indicadores,indicators:[]}}} initialMode="enciclopedia" initialArea={slug}/>;}
