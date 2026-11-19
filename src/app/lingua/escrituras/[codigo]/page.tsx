// v420.0 VANGUARD LINGUA — ficha de un sistema de escritura.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Insignia, Migas } from "@/components/lingua/piezas";
import { escrituraPorCodigo, escrituras, FUENTE_ESCRITURAS, nombreEscrituraCldr } from "@/lib/lingua/servidor";
import { antepasadosDe, descendientesDe, lenguasDeEscritura, URL_WIKI } from "@/lib/lingua/escrituras";
import { DIRECCIONES, RUTAS_LINGUA, TIPOS_ESCRITURA, rutaEscritura, rutaIdioma } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ codigo: string }> };

export function generateStaticParams() {
  return escrituras().map((e) => ({ codigo: e.codigo }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo } = await params;
  const e = escrituraPorCodigo(codigo);
  if (!e) return { title: "Escrituras · Lingua · VANGUARD" };
  return {
    title: `Escritura ${e.nombre.toLowerCase()} (${e.codigo}) · Lingua · VANGUARD`,
    description: `${e.nombre}: ${TIPOS_ESCRITURA[e.tipo]?.nombre.toLowerCase() ?? e.tipo}, ${DIRECCIONES[e.direccion] ?? ""}. Origen, genealogía, lenguas que la usan y caracteres de Unicode.`,
    alternates: { canonical: `${SITE_URL}${rutaEscritura(e.codigo)}` },
  };
}

export default async function Page({ params }: Props) {
  const { codigo } = await params;
  const e = escrituraPorCodigo(codigo);
  if (!e) notFound();
  const ant = antepasadosDe(e.codigo);
  const desc = descendientesDe(e.codigo);
  const lenguas = lenguasDeEscritura(e, 80);
  const tipo = TIPOS_ESCRITURA[e.tipo];
  const otras = escrituras().filter((x) => x.codigo !== e.codigo && x.tipo === e.tipo).slice(0, 6);
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.escrituras}
      volanta={`Lingua · ${tipo?.nombre ?? "Escritura"}`}
      titulo={`Escritura ${e.nombre.toLowerCase()}`}
      sub={e.texto}
      fuente={
        <>
          Ficha editorial de VANGUARD. Caracteres y nombres: Unicode 15.1 (UCD). Lenguas que la usan: Unicode CLDR 49. {FUENTE_ESCRITURAS}
        </>
      }
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { href: RUTAS_LINGUA.escrituras, label: "Escrituras" }, { label: e.nombre }]} />
      <p style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "0 0 14px" }}>
        <Insignia tipo="escritura" />
        <Insignia tipo="pseudo" texto={e.estado === "viva" ? "En uso" : "Histórica"} />
      </p>
      <div className="vx-li-ficha">
        <div style={{ minWidth: 0 }}>
          <section>
            <h2 style={{ fontSize: 19, margin: "0 0 4px" }}>Caracteres</h2>
            <p className="vx-li-nota">
              Muestra del bloque Unicode «{e.unicode[1]}» (desde U+{e.unicode[0]}), con el nombre oficial de cada carácter. Si tu dispositivo no tiene una fuente para esta escritura, verás
              cuadros vacíos: el texto sigue siendo correcto.
            </p>
            <div className={`vx-li-glifos grandes${e.direccion === "ttb" ? " vx-li-vertical" : ""}`} lang="und">
              {e.muestra.map((c, i) => (
                <div key={i} title={e.muestraNombres[i]}>
                  <b>{c}</b>
                  <small>{e.muestraCodigos[i]}</small>
                  <small>{(e.muestraNombres[i] ?? "").toLowerCase()}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="vx-li-seccion">
            <h2>Cómo funciona</h2>
            <div className="vx-li-texto">
              <p>
                <b>{tipo?.nombre}.</b> {tipo?.nota}
              </p>
              <p>{e.letras}</p>
            </div>
          </section>

          <section className="vx-li-seccion">
            <h2>Origen y genealogía</h2>
            {ant.length || e.ancestro ? (
              <ol className="vx-li-lista">
                {ant.map((a) => (
                  <li key={a.codigo}>
                    <Link href={rutaEscritura(a.codigo)}>{a.nombre}</Link>
                  </li>
                ))}
                <li>
                  <b>{e.nombre}</b>
                  {e.ancestro ? (
                    <span className="vx-li-tr">
                      {" "}
                      — filiación {e.ancestro[1]}
                      {e.ancestro[2] ? `: ${e.ancestro[2]}` : ""}
                    </span>
                  ) : null}
                </li>
              </ol>
            ) : null}
            {e.origenTexto ? <p className="vx-li-nota">{e.origenTexto}</p> : null}
            {e.creador ? <p className="vx-li-nota">Creación atribuida a: {e.creador}.</p> : null}
            {desc.length ? (
              <>
                <p className="vx-li-nota" style={{ marginTop: 10 }}>
                  Escrituras que derivan de ella:
                </p>
                <ul className="vx-li-chips">
                  {desc.map((d) => (
                    <li key={d.codigo}>
                      <Link href={rutaEscritura(d.codigo)}>
                        {d.muestra[0]} {d.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          {lenguas.length ? (
            <section className="vx-li-seccion">
              <h2>Lenguas que la usan</h2>
              <p className="vx-li-nota">
                Según CLDR: {e.lenguasP.length} lenguas la tienen como escritura principal
                {e.lenguasS.length ? ` y ${e.lenguasS.length} como secundaria` : ""}. La escritura no dice nada del parentesco: lenguas de familias distintas comparten alfabeto.
              </p>
              <ul className="vx-li-chips">
                {lenguas.map((l) => (
                  <li key={l.code + (l.principal ? "p" : "s")}>
                    {l.glotto ? (
                      <Link href={rutaIdioma(l.glotto)}>
                        {l.nombre}
                        {l.principal ? "" : " (secundaria)"}
                      </Link>
                    ) : (
                      <span>
                        {l.nombre}
                        {l.principal ? "" : " (secundaria)"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="vx-li-seccion">
              <h2>Lenguas que la usan</h2>
              <p className="vx-li-nota">Ninguna lengua viva la usa hoy como escritura habitual; se conserva en inscripciones, manuscritos y estudios.</p>
            </section>
          )}
        </div>
        <aside className="vx-li-lateral">
          <div className="vx-li-caja">
            <h2>Ficha</h2>
            <dl className="vx-li-datos">
              <div>
                <dt>Código ISO 15924</dt>
                <dd>
                  {e.codigo}
                  {nombreEscrituraCldr(e.codigo) ? <small>Nombre CLDR: {nombreEscrituraCldr(e.codigo)}</small> : null}
                </dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{tipo?.nombre ?? e.tipo}</dd>
              </div>
              <div>
                <dt>Dirección</dt>
                <dd>{DIRECCIONES[e.direccion] ?? e.direccion}</dd>
              </div>
              <div>
                <dt>Mayúsculas y minúsculas</dt>
                <dd>{e.caja ? "Sí, distingue caja" : "No distingue caja"}</dd>
              </div>
              <div>
                <dt>Época de origen</dt>
                <dd>{e.epoca}</dd>
              </div>
              <div>
                <dt>Lugar de origen</dt>
                <dd>{e.lugar}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>{e.estado === "viva" ? "En uso" : "Histórica"}</dd>
              </div>
              <div>
                <dt>Bloque Unicode</dt>
                <dd>
                  {e.unicode[1]} <small>desde U+{e.unicode[0]}</small>
                </dd>
              </div>
            </dl>
          </div>
          <div className="vx-li-caja">
            <h2>Comparar y ampliar</h2>
            <ul className="vx-li-lista">
              <li>
                <Link href={`${RUTAS_LINGUA.comparar}?a=${e.codigo}&b=${e.codigo === "Latn" ? "Cyrl" : "Latn"}`}>Comparar con {e.codigo === "Latn" ? "el cirílico" : "el alfabeto latino"}</Link>
              </li>
              {otras.map((o) => (
                <li key={o.codigo}>
                  <Link href={`${RUTAS_LINGUA.comparar}?a=${e.codigo}&b=${o.codigo}`}>Comparar con {o.nombre.toLowerCase()}</Link>
                </li>
              ))}
              <li>
                <a href={URL_WIKI(e.wiki)} target="_blank" rel="noopener noreferrer">
                  Wikipedia en español
                </a>
              </li>
              <li>
                <a href={`https://www.unicode.org/charts/PDF/U${e.unicode[0]}.pdf`} target="_blank" rel="noopener noreferrer">
                  Tabla oficial de Unicode (PDF)
                </a>
              </li>
              <li>
                <Link href="/conocimiento/enciclopedia/escritura">Enciclopedia: historia de la escritura</Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </MarcoLingua>
  );
}
