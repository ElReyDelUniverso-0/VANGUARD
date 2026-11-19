// ============================================================
// v421.9 /api/ciencia — el índice científico para máquinas.
// Mismos filtros que el buscador público. Sin caché compartida:
// el contrato de la casa sirve estas respuestas con no-store.
// ============================================================
import type { NextRequest } from "next/server";
import {
  ESTADISTICAS,
  NIVEL_INFO,
  TIPO_INFO,
  buscar,
  rutaIdea,
  rutaPublicacion,
  type FiltrosBusqueda,
} from "@/lib/ciencia/indice";
import { fallo, ok } from "@/lib/sistema/contrato";

export const dynamic = "force-dynamic";

function uno(sp: URLSearchParams, k: string): string | undefined {
  const v = sp.get(k);
  return v && v.trim() ? v.trim() : undefined;
}

export function GET(request: NextRequest) {
  const t0 = Date.now();
  const sp = request.nextUrl.searchParams;
  const orden = uno(sp, "orden");
  const f: FiltrosBusqueda = {
    q: uno(sp, "q"),
    disciplina: uno(sp, "disciplina"),
    tipo: uno(sp, "tipo"),
    nivel: uno(sp, "nivel"),
    idea: uno(sp, "idea"),
    desde: uno(sp, "desde"),
    hasta: uno(sp, "hasta"),
    orden: orden === "reciente" || orden === "antigua" || orden === "autores" || orden === "relevancia" ? orden : undefined,
  };

  const tipo = f.tipo;
  if (tipo && !(tipo in TIPO_INFO)) return fallo("VALIDACION", `tipo desconocido: ${tipo}`, undefined, { t0 });
  const nivel = f.nivel;
  if (nivel && !(nivel in NIVEL_INFO)) return fallo("VALIDACION", `nivel desconocido: ${nivel}`, undefined, { t0 });
  const desde = f.desde ? Number(f.desde) : null;
  const hasta = f.hasta ? Number(f.hasta) : null;
  if ((desde !== null && !Number.isFinite(desde)) || (hasta !== null && !Number.isFinite(hasta))) {
    return fallo("VALIDACION", "desde y hasta deben ser años numéricos", undefined, { t0 });
  }

  const limite = Math.min(Math.max(Number(sp.get("limite")) || 50, 1), 200);
  const pagina = Math.max(Number(sp.get("pagina")) || 1, 1);
  const { items, total, facetas } = buscar(f);
  const recortados = items.slice((pagina - 1) * limite, pagina * limite).map((p) => ({
    id: p.id,
    titulo: p.titulo,
    tituloOriginal: p.tituloOriginal,
    fecha: p.fecha,
    medio: p.medio,
    tipo: p.tipo,
    nivel: p.nivel,
    arbitraje: p.arbitraje,
    autores: p.autores.map((a) => a.nombre),
    totalAutores: p.totalAutores,
    identificador: p.identificador,
    original: p.original,
    idea: p.ideaId,
    disciplina: p.disciplinaId,
    lectura: p.lectura,
    cautela: p.cautela,
    ficha: rutaPublicacion(p.id),
    lineaDeIdea: rutaIdea(p.ideaId),
    citasVerificadas: p.referencias,
    citadaPor: p.citadaPor,
  }));

  return ok(
    {
      total,
      pagina,
      limite,
      paginas: Math.max(1, Math.ceil(total / limite)),
      facetas,
      resumen: ESTADISTICAS,
      items: recortados,
    },
    { t0, nota: "Índice capturado el 2026-11-18. El tipo editorial y el nivel de evidencia son campos separados a propósito." }
  );
}
