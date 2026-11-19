import Link from 'next/link';
import { articulosDePais, rutaArticulo, BASE_ENCICLOPEDIA } from '@/lib/enciclopedia/indice';
/** Puente aditivo; no modifica los datos ni los enlaces anteriores del país.
 *  v417.0 · añade los artículos de fondo de la Enciclopedia que tratan el país
 *  (primero su monografía, si existe) para pasar del dato a la historia. */
export function PuentesConocimientoPais({iso,nombre}:{iso:string;nombre:string}){
  const arts=articulosDePais(iso).slice(0,6);
  return <section aria-label={`Investigar ${nombre}`} style={{margin:'24px 0',padding:'18px 20px',border:'1px solid #33534e',borderRadius:8,background:'#0b201e'}}>
    <h2 style={{fontSize:18,color:'#a1e4d3',margin:'0 0 10px'}}>Investiga este país sin empezar de nuevo</h2>
    <p style={{fontSize:13,color:'#a4b9bb'}}>Economía, población y recursos con indicadores fechados; acontecimientos asociados y comparación internacional. Lo que aún no está documentado se declara.</p>
    <Link href={`/conocimiento?modo=paises&pais=${encodeURIComponent(iso)}`} style={{color:'#e8c277',fontSize:13}}>Abrir el centro de conocimiento de {nombre} →</Link>
    {arts.length>0&&<div style={{marginTop:14,paddingTop:12,borderTop:'1px solid #24403c'}}>
      <h3 style={{fontSize:14,color:'#a1e4d3',margin:'0 0 8px'}}>En la Enciclopedia</h3>
      <ul style={{listStyle:'none',margin:0,padding:0,display:'grid',gap:6}}>
        {arts.map(a=><li key={a.slug} style={{fontSize:13,color:'#a4b9bb',lineHeight:1.4}}>
          <Link href={rutaArticulo(a.slug)} style={{color:'#e7edf5',fontWeight:600}}>{a.titulo}</Link>
          {a.categoria==='paises'?<span style={{color:'#e8c277'}}> · monografía del país</span>:null} — {a.bajada}
        </li>)}
      </ul>
    </div>}
    <p style={{margin:'12px 0 0',fontSize:12}}><Link href={BASE_ENCICLOPEDIA} style={{color:'#5eead4'}}>Explorar la Enciclopedia completa →</Link></p>
  </section>;
}
