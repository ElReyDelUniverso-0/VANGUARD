import type { Metadata } from 'next';
import { Marco } from '@/components/planeta/marco';
import { ExploradorRedes } from '@/components/redes/explorador';
import { SITE_URL } from '@/lib/site';
export const metadata: Metadata = {title:'World Networks · Mapa de organizaciones y relaciones verificables | VANGUARD',description:'Explora la arquitectura institucional del mundo: organizaciones, países, cooperación, tratados, evidencia y cronología. Cada conexión conserva su tipo y fuente.',alternates:{canonical:`${SITE_URL}/organizaciones/redes`}};
export default function RedesPage(){return <Marco ruta="/organizaciones/redes" volanta="Vanguard World Networks · Organizaciones internacionales" titulo="El mundo, conectado." sub="No basta con saber dónde está un país. Descubre qué instituciones lo conectan, qué acuerdos las sostienen y qué significa realmente cada vínculo." fuente="Selección documental de fuentes institucionales primarias. Revisión editorial: 18 de noviembre de 2026. No es un registro universal ni una actualización en tiempo real."><ExploradorRedes /></Marco>;}
