import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ExploradorConocimiento} from '@/components/conocimiento/explorador';
import {datosConocimiento} from '@/lib/conocimiento/datos';
import {CENTROS} from '@/lib/conocimiento/indice';
import {SITE_URL} from '@/lib/site';
export function generateStaticParams(){return CENTROS.map(c=>({slug:c.id}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params,c=CENTROS.find(c=>c.id===slug);return c?{title:`${c.nombre} · VANGUARD`,description:c.mision,alternates:{canonical:`${SITE_URL}/conocimiento/centro/${c.id}`}}:{};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!CENTROS.some(c=>c.id===slug))notFound();const all=datosConocimiento();return <ExploradorConocimiento datos={{...all,mapa:[],indicadores:{...all.indicadores,indicators:[]}}} initialMode="enciclopedia" initialCenter={slug}/>;}
