// v420.0 VANGUARD LINGUA — catálogo de idiomas del mundo (búsqueda + filtros, sin JS).
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas, Paginas, PuntoAes } from "@/components/lingua/piezas";
import { codigoCorto, familiasRaiz, filtrarLenguas, nombreDe, nombreLengua, nombreTerritorio } from "@/lib/lingua/servidor";
import { AES_ES, CATEGORIAS_ES, MACROAREAS_ES, NOTA_MACROAREAS, RUTAS_LINGUA, formatoNumero, rutaIdioma } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Catálogo de idiomas del mundo · Lingua · VANGUARD",
  description: "Busca entre más de 8.000 lenguas por nombre, código ISO 639-3 o glottocode y filtra por macroárea, familia, país, tipo y grado de amenaza.",
  alternates: { canonical: `${SITE_URL}/lingua/idiomas` },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const POR_PAGINA = 60;

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const q = uno(sp.q).slice(0, 80);
  const macro = uno(sp.macro);
  const categoria = uno(sp.cat);
  const aesTxt = uno(sp.aes);
  const aes = aesTxt !== "" && /^-?\d$/.test(aesTxt) ? Number(aesTxt) : null;
  const familia = uno(sp.familia);
  const pais = uno(sp.pais).toUpperCase().slice(0, 2);
  const orden = (["nombre", "dialectos", "amenaza"].includes(uno(sp.orden)) ? uno(sp.orden) : "nombre") as "nombre" | "dialectos" | "amenaza";
  const pagina = Math.max(1, Number.parseInt(uno(sp.p) || "1", 10) || 1);

  const lista = filtrarLenguas({ q, macro: macro || undefined, categoria: categoria || undefined, aes, familia: familia || undefined, pais: pais || undefined, orden });
  const vista = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const { reales } = familiasRaiz();
  const params = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (macro) u.set("macro", macro);
    if (categoria) u.set("cat", categoria);
    if (aes !== null) u.set("aes", String(aes));
    if (familia) u.set("familia", familia);
    if (pais) u.set("pais", pais);
    if (orden !== "nombre") u.set("orden", orden);
    if (p > 1) u.set("p", String(p));
    const s = u.toString();
    return `${RUTAS_LINGUA.idiomas}${s ? `?${s}` : ""}`;
  };
  const hayFiltro = Boolean(q || macro || categoria || aes !== null || familia || pais);

  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.idiomas}
      titulo="Catálogo de idiomas del mundo"
      sub="Cada lengua reconocida por Glottolog, con su código ISO 639-3 cuando lo tiene, su familia, su macroárea y su estado. Las fichas distinguen la lengua de sus dialectos y de sus variedades regionales."
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Catálogo" }]} />
      <form className="vx-li-form" method="get" action={RUTAS_LINGUA.idiomas} role="search">
        <label className="ancho">
          Nombre, ISO 639-3 o glottocode
          <input name="q" type="search" defaultValue={q} placeholder="náhuatl, swh, gari1256…" autoComplete="off" />
        </label>
        <label>
          Macroárea
          <select name="macro" defaultValue={macro}>
            <option value="">Todas</option>
            {Object.entries(MACROAREAS_ES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Familia
          <select name="familia" defaultValue={familia}>
            <option value="">Todas</option>
            {reales.slice(0, 60).map((f) => (
              <option key={f.nodo.id} value={f.nodo.id}>
                {nombreDe(f.nodo.id)} ({f.n})
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo
          <select name="cat" defaultValue={categoria}>
            <option value="">Todos</option>
            {Object.entries(CATEGORIAS_ES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Estado
          <select name="aes" defaultValue={aes === null ? "" : String(aes)}>
            <option value="">Cualquiera</option>
            {AES_ES.map((a, i) => (
              <option key={a.clave} value={i}>
                {a.nombre}
              </option>
            ))}
            <option value="-1">Sin evaluación</option>
          </select>
        </label>
        <label>
          País (ISO-2)
          <input name="pais" defaultValue={pais} maxLength={2} placeholder="DO" autoComplete="off" />
        </label>
        <label>
          Orden
          <select name="orden" defaultValue={orden}>
            <option value="nombre">Nombre</option>
            <option value="dialectos">Más dialectos</option>
            <option value="amenaza">Más amenazadas</option>
          </select>
        </label>
        <button className="vx-li-boton" type="submit">
          Filtrar
        </button>
        {hayFiltro ? (
          <Link className="vx-li-boton sec" href={RUTAS_LINGUA.idiomas}>
            Limpiar
          </Link>
        ) : null}
      </form>
      <p className="vx-li-nota">
        {formatoNumero(lista.length)} lenguas{pais ? ` con presencia en ${nombreTerritorio(pais)}` : ""}. {NOTA_MACROAREAS}
      </p>

      {vista.length ? (
        <div className="vx-li-tabla-caja">
          <table className="vx-li-tabla">
            <thead>
              <tr>
                <th>Lengua</th>
                <th>Familia</th>
                <th>Macroárea</th>
                <th>Estado</th>
                <th className="num">Dialectos</th>
              </tr>
            </thead>
            <tbody>
              {vista.map((l) => {
                const code = codigoCorto(l.id);
                return (
                  <tr key={l.id}>
                    <td>
                      <Link href={rutaIdioma(l.id)}>{nombreLengua(l)}</Link>
                      <small>
                        {l.nombreEs && l.nombreEs.toLowerCase() !== l.nombre.toLowerCase() ? `${l.nombre} · ` : ""}
                        {l.iso ? `ISO ${l.iso}` : "sin ISO"}
                        {code && code !== l.iso ? ` · ${code}` : ""} · {l.id}
                        {l.categoria !== "Spoken_L1_Language" ? ` · ${CATEGORIAS_ES[l.categoria]?.nombre ?? l.categoria}` : ""}
                      </small>
                    </td>
                    <td>{l.aislada ? <em>Aislada</em> : l.familia ? nombreDe(l.familia) : "—"}</td>
                    <td>{MACROAREAS_ES[l.macro] ?? "—"}</td>
                    <td>
                      <PuntoAes aes={l.aes} />
                    </td>
                    <td className="num">{l.nDialectos || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="vx-li-aviso">
          Ninguna lengua coincide con esos filtros. Prueba con el nombre en inglés (Glottolog nombra en inglés) o con el código ISO de tres letras.
        </p>
      )}
      <Paginas total={lista.length} pagina={pagina} porPagina={POR_PAGINA} base={params} />
    </MarcoLingua>
  );
}
