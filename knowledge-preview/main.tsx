import React from 'react';
import {createRoot} from 'react-dom/client';
import {ExploradorConocimiento} from '../src/components/conocimiento/explorador';
import '../src/components/conocimiento/conocimiento.css';
import datos from './datos.json';
import type {DatosConocimiento} from '../src/lib/conocimiento/tipos';
const p=new URLSearchParams(window.location.search);const route=location.pathname.split('/').filter(Boolean);const kind=route[1],slug=route[2];
// Solo la vista previa abre las rutas antiguas en producción. El código entregado usa rutas relativas.
document.addEventListener('click',e=>{const a=(e.target as HTMLElement).closest('a');if(a&&a.getAttribute('href')?.startsWith('/')&&!a.getAttribute('href')?.startsWith('/conocimiento')){e.preventDefault();window.open('https://vanguard-kq9r.vercel.app'+a.getAttribute('href'),'_blank','noopener,noreferrer');}});
createRoot(document.getElementById('root')!).render(<ExploradorConocimiento datos={datos as unknown as DatosConocimiento} initialMode={kind==='area'||kind==='centro'?'enciclopedia':p.get('modo')??'inicio'} initialTopic={kind==='tema'?slug:undefined} initialArea={kind==='area'?slug:''} initialCenter={kind==='centro'?slug:''} initialCountry={p.get('pais')??'do'} initialQuery={p.get('q')??''}/>);
