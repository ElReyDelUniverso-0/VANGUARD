import type {Metadata} from 'next';
import {AcademiaConocimiento} from '@/components/conocimiento/academia';
export const metadata:Metadata={title:'Vanguard Academy · rutas de aprendizaje',description:'Cuatro rutas con doce lecciones y cuestionarios basados en expedientes editoriales existentes. Progreso local y fuentes visibles.',alternates:{canonical:'/conocimiento/aprender'}};
export default function AprenderPage(){return <AcademiaConocimiento/>;}
