// ============================================================
// v421.9 EL BUSCADOR CIENTÍFICO — resultados en el servidor.
// El estado vive en la URL (?q=&disciplina=&tipo=&nivel=&desde=&hasta=&orden=)
// así que cualquier búsqueda se puede compartir, marcar y rastrear.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { BuscadorCiencia, Facetas, MarcoCiencia, Migas, TarjetaPublicacion } from "@/components/ciencia/piezas";
import {
  DISCIPLINAS,
  ESTADISTICAS,
  IDEAS,
  buscar,
  ideaDe,
  rutaBusqueda,
  type FiltrosBusqueda,
} from "@/lib/ciencia/indice";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Buscador de publicaciones · Science Frontier",
  description:
    "Busca por tema, autor, revista o identificador y filtra por disciplina, tipo editorial (investigación, prepublicación, revisión, divulgación) y nivel de evidencia.",
  alternates: { canonical: `${SITE_URL}/ciencia/buscar` },
};

const POR_PAGINA = 12;

function leer(sp: Record<string, string | string[] | undefined>): FiltrosBusqueda {
  const uno = (k: string) => {
    const v = sp[k];
    const s = Array.isArray(v) ? v[0] : v;
    return s && s.trim() ? s.trim() : undefined;
  };
  const orden = uno("orden");
  return {
    q: uno("q"),
    disciplina: uno("disciplina"),
    tipo: uno("tipo"),
    nivel: uno("nivel"),
    idea: uno("idea"),
    desde: uno("desde"),
    hasta: uno("hasta"),
    orden: orden === "reciente" || orden === "antigua" || orden === "autores" || orden === "relevancia" ? orden : undefined,
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = leer(sp);
  const pagina = Math.max(1, Number(Array.isArray(sp.pagina) ? sp.pagina[0] : sp.pagina) || 1);
  const { items, total, facetas } = buscar(f);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const actual = Math.min(pagina, paginas);
  const visibles = items.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA);
  const ideaFiltro = f.idea ? ideaDe(f.idea) : null;
  const conFiltro = Boolean(f.q || f.disciplina || f.tipo || f.nivel || f.idea || f.desde || f.hasta);
  const conPagina = (n: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...f, pagina: n })) if (v) q.set(k, String(v));
    return `/ciencia/buscar?${q.toString()}`;
  };

  return (
    <MarcoCiencia activa="/ciencia/buscar">
      <Migas pasos={[{ href: "/ciencia", label: "Science Frontier" }, { label: "Buscador" }]} />
      <p className="vx-sc-volanta">Buscador de publicaciones</p>
      <h1>{conFiltro ? `${total} ${total === 1 ? "registro" : "registros"}` : "Todo el índice, filtrable"}</h1>
      <p className="vx-sc-sub">
        {conFiltro
          ? "Resultados sobre el índice capturado. Los sellos no son decorativos: separan el tipo editorial del nivel de evidencia."
          : `El índice completo: ${ESTADISTICAS.registros} registros de ${ESTADISTICAS.revistas} revistas, arXiv, actas y sitios institucionales. Busca o filtra por disciplina, tipo y nivel.`}
      </p>

      <BuscadorCiencia f={f} />

      <div className="vx-sc-acciones">
        <span className="vx-sc-kicker">Filtros activos</span>
        {f.q ? <span className="vx-sc-sello-tipo">texto: {f.q}</span> : null}
        {ideaFiltro ? <span className="vx-sc-sello-tipo">idea: {ideaFiltro.pregunta}</span> : null}
        {f.desde || f.hasta ? (
          <span className="vx-sc-sello-tipo">
            años: {f.desde ?? ESTADISTICAS.desde}–{f.hasta ?? ESTADISTICAS.hasta}
          </span>
        ) : null}
        {conFiltro ? (
          <Link className="vx-sc-boton secundario" href="/ciencia/buscar">
            Limpiar todo
          </Link>
        ) : null}
      </div>

      <Facetas f={f} facetas={facetas} />

      <details className="vx-sc-panel" style={{ marginBottom: 14 }}>
        <summary style={{ cursor: "pointer", fontSize: 13, color: "#22d3ee" }}>Filtros finos: idea, rango de años, orden</summary>
        <form action="/ciencia/buscar" method="get" className="vx-sc-filtros" style={{ marginTop: 10 }}>
          {f.q ? <input type="hidden" name="q" value={f.q} /> : null}
          <label>
            Idea
            <select className="vx-sc-campo" name="idea" defaultValue={f.idea ?? ""}>
              <option value="">Todas las ideas</option>
              {IDEAS.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.pregunta}
                </option>
              ))}
            </select>
          </label>
          <label>
            Disciplina
            <select className="vx-sc-campo" name="disciplina" defaultValue={f.disciplina ?? ""}>
              <option value="">Todas</option>
              {DISCIPLINAS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </label>
          <label>
            Desde (año)
            <input className="vx-sc-campo" type="number" name="desde" min={1800} max={2030} defaultValue={f.desde ?? ""} inputMode="numeric" />
          </label>
          <label>
            Hasta (año)
            <input className="vx-sc-campo" type="number" name="hasta" min={1800} max={2030} defaultValue={f.hasta ?? ""} inputMode="numeric" />
          </label>
          <label>
            Orden
            <select className="vx-sc-campo" name="orden" defaultValue={f.orden ?? ""}>
              <option value="">Relevancia</option>
              <option value="reciente">Más reciente</option>
              <option value="antigua">Más antigua</option>
              <option value="autores">Primer autor (A–Z)</option>
            </select>
          </label>
          <div style={{ alignSelf: "end" }}>
            <button className="vx-sc-boton" type="submit">
              Aplicar
            </button>
          </div>
        </form>
      </details>

      {visibles.length === 0 ? (
        <div className="vx-sc-vacio">
          <p style={{ marginTop: 0 }}>Ningún registro cumple esa combinación de filtros.</p>
          <p style={{ marginBottom: 0 }}>
            El índice declara lo que tiene; no rellena huecos. Prueba a{" "}
            <Link href={rutaBusqueda({ q: "gravitacional" })} style={{ color: "#22d3ee" }}>
              buscar «gravitacional»
            </Link>{" "}
            o a <Link href="/ciencia/buscar">quitar los filtros</Link>.
          </p>
        </div>
      ) : (
        <div className="vx-sc-lista doble">
          {visibles.map((p) => (
            <TarjetaPublicacion key={p.id} p={p} />
          ))}
        </div>
      )}

      {paginas > 1 ? (
        <nav className="vx-sc-acciones" aria-label="Paginación de resultados">
          {actual > 1 ? (
            <Link className="vx-sc-boton secundario" href={conPagina(actual - 1)}>
              ← Anterior
            </Link>
          ) : null}
          <span className="vx-sc-meta">
            Página {actual} de {paginas} · {total} registros
          </span>
          {actual < paginas ? (
            <Link className="vx-sc-boton secundario" href={conPagina(actual + 1)}>
              Siguiente →
            </Link>
          ) : null}
        </nav>
      ) : null}

      <p className="vx-sc-hueco" style={{ marginTop: 18 }}>
        Los resultados muestran la lectura de VANGUARD y su límite. La publicación original se abre en una pestaña
        nueva, en el sitio del editor o del repositorio: esta casa no copia artículos.
      </p>
    </MarcoCiencia>
  );
}
