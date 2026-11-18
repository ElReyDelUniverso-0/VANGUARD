import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {ExploradorConocimiento} from '@/components/conocimiento/explorador';
import {datosConocimiento} from '@/lib/conocimiento/datos';
import {CONCEPTOS,REVISION_EDITORIAL,indicadoresParaArea} from '@/lib/conocimiento/indice';
import {SITE_URL} from '@/lib/site';
export function generateStaticParams(){return CONCEPTOS.map(c=>({slug:c.id}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params,c=CONCEPTOS.find(c=>c.id===slug);return c?{title:`${c.titulo} · VANGUARD`,description:c.resumen,alternates:{canonical:`${SITE_URL}/conocimiento/tema/${c.id}`}}:{};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const c=CONCEPTOS.find(c=>c.id===slug);if(!c)notFound();const all=datosConocimiento();const lite={...all,mapa:[],indicadores:{...all.indicadores,indicators:indicadoresParaArea(c.area,all.indicadores.indicators)}};const json={"@context":"https://schema.org","@type":"Article",headline:c.titulo,description:c.resumen,dateModified:REVISION_EDITORIAL,author:{'@type':'Organization',name:'VANGUARD'},mainEntityOfPage:`${SITE_URL}/conocimiento/tema/${slug}`,citation:c.fuentes.map(id=>all.fuentes.find(f=>f.id===id)?.url).filter(Boolean)};return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(json).replace(/</g,'\\u003c')}}/><ExploradorConocimiento datos={lite} initialTopic={slug}/></>;}
