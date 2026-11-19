import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Marco } from '@/components/planeta/marco';
import { NODOS, TIPOS_RELACION, REVISION, nodoRed, fuenteRed, relacionesDe, rutaNodo } from '@/lib/redes/indice';
import '@/components/redes/redes.css';
export const dynamicParams=false;
export function generateStaticParams(){return NODOS.filter(n=>n.clase!=='pais').map(n=>({id:n.id}));}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const {id}=await params;const n=nodoRed(id);return n?{title:`${n.nombre} · Funciones, relaciones y fuentes | VANGUARD`,description:n.funcion,alternates:{canonical:`/organizaciones/redes/${n.id}`}}:{};}
export default async function FichaRed({params}:{params:Promise<{id:string}>}){
 const {id}=await params;const n=nodoRed(id);if(!n||n.clase==='pais')notFound();const relaciones=relacionesDe(id);
 const miembros=relaciones.filter(e=>e.destino===id&&e.tipo==='membresia');
 return <Marco ruta={`/organizaciones/redes/${id}`} volanta={`World Networks · ${n.clase}`} titulo={n.nombre} sub={n.funcion} fuente={`Revisión editorial: ${REVISION}. Cada conexión identifica su fuente; no se infieren vínculos no documentados.`}><div className="vr vr-ficha-completa"><p><Link href={`/organizaciones/redes?nodo=${id}`}>← Abrir en el mapa interactivo</Link> · <Link href="/organizaciones">Centro de organizaciones</Link> · <Link href="/organizaciones/redes?vista=documentos">Biblioteca documental</Link></p><div className="vr-stats"><span><b>{n.anio}</b>{n.hito}</span><span>{n.sede}</span><span>{relaciones.length} vínculos incorporados</span></div><h2>Áreas de acción</h2><p>{n.temas.join(' · ')}</p><h2>Función y alcance</h2><p>{n.funcion}</p><h2>Qué no significa esta ficha</h2><p>{n.limites}</p><h2>Membresía y cobertura documental</h2><p>{n.cobertura}</p>{miembros.length>0&&<p>{miembros.length} vínculos de membresía plena incorporados. Los asociados, observadores, candidatos y partes de tratados aparecen por separado en la tabla.</p>}
 <h2>Conexiones y evidencia</h2><div className="vr-tabla-wrap"><table><thead><tr><th>Origen</th><th>Vínculo</th><th>Destino</th><th>Alcance y fuente</th></tr></thead><tbody>{relaciones.map(e=>{const a=nodoRed(e.origen)!,b=nodoRed(e.destino)!;return <tr key={e.id}><td>{rutaNodo(a)?<Link href={rutaNodo(a)!}>{a.nombre}</Link>:a.nombre}</td><td>{TIPOS_RELACION[e.tipo]}</td><td>{rutaNodo(b)?<Link href={rutaNodo(b)!}>{b.nombre}</Link>:b.nombre}</td><td><details><summary>Comprobar relación</summary><p>{e.evidencia}</p><a href={fuenteRed(e.fuente)?.url} target="_blank" rel="noopener noreferrer">Fuente primaria ↗</a></details></td></tr>;})}</tbody></table></div>{!relaciones.length&&<p>No hay conexiones incorporadas en esta edición. No equivale a inexistencia de relaciones.</p>}
 <p><Link href="/memoria">Continuar en el Archivo de la Memoria →</Link></p><h2>Fuentes institucionales</h2><ul>{[...new Set([...n.fuentes,...relaciones.map(e=>e.fuente)])].map(id=>{const f=fuenteRed(id)!;return <li key={id}><a href={f.url} target="_blank" rel="noopener noreferrer">{f.titulo} ↗</a> · consulta {f.consulta}<p>{f.nota}</p></li>;})}</ul>{n.conocimiento&&<p><Link href="/conocimiento?modo=organizaciones">Continuar en el centro de conocimiento institucional →</Link></p>}
 </div></Marco>;
}
