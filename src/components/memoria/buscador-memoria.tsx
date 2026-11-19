// v419.0 · MEMORY ARCHIVE — el buscador y la cronología
// Formulario GET de verdad: funciona sin JavaScript y la URL se puede citar,
// compartir y guardar. La cronología son barras hechas con divs, sin gráficos
// externos.

import Link from "next/link";
import { CLAVE_TIPO, TIPOS, type FuenteId, type TipoDocumento } from "@/lib/memoria/tipos";

export interface ValoresBusqueda {
  q: string;
  autor: string;
  fuente: FuenteId | "todas";
  tipo: TipoDocumento | "";
  desde: string;
  hasta: string;
}

export function BuscadorMemoria({ valores }: { valores: ValoresBusqueda }) {
  return (
    <form className="vx-mem-buscador" action="/memoria/buscar" method="get" role="search">
      <div className="vx-mem-campo">
        <label htmlFor="mem-q">Qué buscas</label>
        <input
          id="mem-q"
          name="q"
          type="search"
          defaultValue={valores.q}
          placeholder="declaration of independence, map of america, emancipation…"
          autoComplete="off"
        />
      </div>
      <div className="vx-mem-campo">
        <label htmlFor="mem-autor">Autor o institución</label>
        <input id="mem-autor" name="autor" type="text" defaultValue={valores.autor} placeholder="Lincoln, Jefferson…" />
      </div>
      <div className="vx-mem-campo">
        <label htmlFor="mem-tipo">Tipo</label>
        <select id="mem-tipo" name="tipo" defaultValue={valores.tipo}>
          <option value="">Todos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {CLAVE_TIPO[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="vx-mem-campo">
        <label htmlFor="mem-fuente">Fuente</label>
        <select id="mem-fuente" name="fuente" defaultValue={valores.fuente}>
          <option value="todas">Las tres</option>
          <option value="loc">Library of Congress</option>
          <option value="ia">Internet Archive</option>
          <option value="commons">Wikimedia Commons</option>
        </select>
      </div>
      <div className="vx-mem-campo">
        <label htmlFor="mem-desde">Desde (año)</label>
        <input id="mem-desde" name="desde" type="number" inputMode="numeric" min={1000} max={2100} defaultValue={valores.desde} placeholder="1776" />
      </div>
      <div className="vx-mem-campo">
        <label htmlFor="mem-hasta">Hasta (año)</label>
        <input id="mem-hasta" name="hasta" type="number" inputMode="numeric" min={1000} max={2100} defaultValue={valores.hasta} placeholder="1783" />
      </div>
      <button className="vx-mem-boton" type="submit">
        Buscar
      </button>
    </form>
  );
}

export function Cronologia({
  decadas,
  q,
  desde,
}: {
  decadas: Array<{ decada: number; cuantos: number }>;
  q: string;
  desde?: string;
}) {
  if (!decadas.length) return null;
  const maximo = Math.max(...decadas.map((d) => d.cuantos));
  return (
    <div className="vx-mem-crono" role="list" aria-label="Documentos por década">
      {decadas.map((d) => {
        const alto = Math.max(6, Math.round((d.cuantos / maximo) * 100));
        const hasta = d.decada + 9;
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        params.set("desde", String(d.decada));
        params.set("hasta", String(hasta));
        if (desde) params.set("fuente", desde);
        return (
          <Link key={d.decada} href={`/memoria/buscar?${params.toString()}`} className="vx-mem-crono__barra" role="listitem" title={`${d.cuantos} documentos entre ${d.decada} y ${hasta}`}>
            <span className="vx-mem-crono__tallo" style={{ height: `${alto}%` }} aria-hidden />
            <span className="vx-mem-crono__etiqueta">{d.decada}</span>
          </Link>
        );
      })}
    </div>
  );
}
