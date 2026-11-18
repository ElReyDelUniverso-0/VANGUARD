import {NextRequest} from 'next/server';
import {explicarConcepto} from '@/lib/conocimiento/aprendizaje';
import {ok,fallo,cacheable} from '@/lib/sistema/contrato';
/** Contrato central API v1. Solo selecciona información editorial existente. */
export function GET(req:NextRequest){const id=req.nextUrl.searchParams.get('tema')??'',nivel=req.nextUrl.searchParams.get('nivel')??'rapido';if(id.length>100||!['rapido','completo'].includes(nivel))return fallo('VALIDACION','tema debe ser un identificador de hasta 100 caracteres; nivel: rapido o completo.');const datos=explicarConcepto(id,nivel as 'rapido'|'completo');return datos?ok(datos,{cabeceras:cacheable(300)}):fallo('NO_ENCONTRADO','No existe un expediente revisado para ese identificador. No se genera una respuesta alternativa.');}
