import datos from './catalogo.json';
import perfiles from '@/lib/conocimiento/organizaciones.json';

export type ClaseNodo = 'organizacion' | 'organo' | 'programa' | 'grupo' | 'pais' | 'tratado';
export const TIPOS_RELACION = {
  membresia: 'Membresía plena', asociacion: 'Miembro asociado', cooperacion: 'Cooperación',
  tratado: 'Parte de tratado', candidatura: 'Candidatura', participacion: 'Participación institucional',
  agencia: 'Organismo especializado autónomo', sistema: 'Entidad del sistema ONU',
  relacion: 'Organización relacionada', grupo: 'Institución del grupo', creacion: 'Creación conjunta',
  observacion: 'Observación sin voto', constitucion: 'Instrumento constitutivo',
} as const;
export type TipoRelacion = keyof typeof TIPOS_RELACION;
export interface NodoRed {
  id: string; sigla: string; nombre: string; clase: ClaseNodo; anio: number | null; hito: string;
  sede: string; temas: string[]; funcion: string; limites: string; fuentes: string[];
  cobertura: string; conocimiento?: string | null; iso2?: string | null;
}
export interface RelacionRed { id: string; origen: string; destino: string; tipo: TipoRelacion; fuente: string; evidencia: string; desde?: string }
export interface FuenteRed { id: string; titulo: string; editor: string; url: string; consulta: string; nota: string }
export const NODOS: NodoRed[] = (datos.nodos as NodoRed[]).map(n => {
 const perfil=n.conocimiento?perfiles.find(p=>p.id===n.conocimiento):undefined;
 return perfil?{...n,nombre:perfil.nombre,sede:perfil.sede,funcion:perfil.mandato+' '+perfil.mecanismo,limites:perfil.limite}:n;
});
export const RELACIONES = datos.relaciones as RelacionRed[];
export const FUENTES = datos.fuentes as FuenteRed[];
export const REVISION = datos.revision;
export const LIMITES = datos.limites;
export const TEMAS = [...new Set(NODOS.flatMap(n => n.temas))].sort((a,b) => a.localeCompare(b,'es'));
export const nodoRed = (id: string) => NODOS.find(n => n.id === id);
export const fuenteRed = (id: string) => FUENTES.find(f => f.id === id);
export const relacionesDe = (id: string) => RELACIONES.filter(e => e.origen === id || e.destino === id);
export const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function buscarRed(q: string, tema = '', clase = '') {
  const v = normalizar(q.trim());
  return NODOS.filter(n => (!tema || n.temas.includes(tema)) && (!clase || n.clase === clase) &&
    (!v || normalizar([n.nombre,n.sigla,n.funcion,...n.temas].join(' ')).includes(v)));
}
export function rutaNodo(n: NodoRed) {
  return n.clase === 'pais' ? (n.iso2 ? `/mundos/${n.iso2}` : undefined) : `/organizaciones/redes/${n.id}`;
}
/** BFS sobre evidencia explícita. Una ruta no demuestra alianza, causalidad ni influencia. */
export function caminoEntre(inicio: string, fin: string): RelacionRed[] | null {
  if (!nodoRed(inicio) || !nodoRed(fin)) return null;
  const cola: {id:string; camino:RelacionRed[]}[] = [{id:inicio,camino:[]}];
  const vistos = new Set([inicio]);
  for (let i=0; i<cola.length; i++) {
    const actual=cola[i]; if(actual.id===fin) return actual.camino;
    for(const e of relacionesDe(actual.id)) {
      const otro=e.origen===actual.id?e.destino:e.origen;
      if(!vistos.has(otro)){ vistos.add(otro); cola.push({id:otro,camino:[...actual.camino,e]}); }
    }
  }
  return null;
}
