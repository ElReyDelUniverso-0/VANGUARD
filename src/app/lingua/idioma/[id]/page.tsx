// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — ficha de lengua (o de dialecto).
// Une Glottolog (genealogía, ubicación, estado), CLDR (población,
// escrituras, variedades regionales) y Wikcionario (vocabulario y
// expresiones atestiguadas). Lo que no está en las fuentes no se muestra.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { BarraAes, Insignia, MapaPuntos, Migas, PuntoAes, bandera, type PuntoMapa } from "@/components/lingua/piezas";
import {
  alfabetoDe,
  codigoCorto,
  dialectoPorId,
  dialectosDe,
  escrituraPorCodigo,
  escriturasDeCodigo,
  expresionesDe,
  hijosDe,
  lenguaPorId,
  linaje,
  macrolenguaDe,
  macrolenguaQueContiene,
  nombreDe,
  nombreEscrituraCldr,
  nombreLengua,
  nombreTerritorio,
  resumir,
  territoriosDeLengua,
  tipoDe,
  usuariosCldr,
  variedadesDe,
  vocabularioDe,
  type Lengua,
} from "@/lib/lingua/servidor";
import { AES_ES, CATEGORIAS_ES, MACROAREAS_ES, MED_ES, RUTAS_LINGUA, formatoNumero, formatoPoblacion, rutaEscritura, rutaFamilia, rutaIdioma, rutaPais } from "@/lib/lingua/tipos";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";
import { POR_ISO2 } from "@/lib/geo-paises";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const l = lenguaPorId(id);
  if (l) {
    const fam = l.aislada ? "lengua aislada" : l.familia ? `familia ${nombreDe(l.familia)}` : (CATEGORIAS_ES[l.categoria]?.nombre ?? "");
    return {
      title: `${nombreLengua(l)} · ficha de idioma · Lingua · VANGUARD`,
      description: `${nombreLengua(l)} (${l.nombre}${l.iso ? `, ISO ${l.iso}` : ""}): ${fam}, ${MACROAREAS_ES[l.macro] ?? ""}. Dónde se habla, estado de amenaza, dialectos, escrituras y vocabulario.`,
      alternates: { canonical: `${SITE_URL}${rutaIdioma(id)}` },
    };
  }
  const d = dialectoPorId(id);
  if (d) return { title: `${d.nombre} · dialecto · Lingua · VANGUARD`, alternates: { canonical: `${SITE_URL}${rutaIdioma(id)}` } };
  return { title: "Lingua · VANGUARD" };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const tipo = tipoDe(id);
  if (tipo === "familia") redirect(rutaFamilia(id));
  if (tipo === "dialecto") return <FichaDialecto id={id} />;
  const l = lenguaPorId(id);
  if (!l) notFound();
  return <FichaLengua l={l} />;
}

function enlacePaso(p: { id: string; tipo: string }) {
  return p.tipo === "familia" ? rutaFamilia(p.id) : rutaIdioma(p.id);
}

function FichaLengua({ l }: { l: Lengua }) {
  const nombre = nombreLengua(l);
  const pasos = linaje(l.id);
  const code = codigoCorto(l.id);
  const hermanas = l.padre ? hijosDe(l.padre).lenguas.filter((x) => x.id !== l.id) : [];
  const dialectos = dialectosDe(l.id);
  const directos = hijosDe(l.id).dialectos;
  const territorios = territoriosDeLengua(l.id);
  const escr = code ? escriturasDeCodigo(code) : null;
  const variedades = code ? variedadesDe(code) : [];
  const vocab = vocabularioDe(code);
  const exprs = expresionesDe(code);
  const alfa = code ? alfabetoDe(code) : undefined;
  const usuarios = code ? usuariosCldr(code) : 0;
  const macroMiembros = l.iso ? macrolenguaDe(l.iso) : null;
  const enMacro = l.iso ? macrolenguaQueContiene(l.iso) : null;
  const aes = AES_ES[l.aes];
  const cat = CATEGORIAS_ES[l.categoria];
  const resumenHermanas = resumir(hermanas);
  const puntos: PuntoMapa[] = [
    ...hermanas.filter((h) => h.lat !== null && h.lon !== null).slice(0, 400).map((h) => ({ lat: h.lat as number, lon: h.lon as number, color: "#64748b", titulo: nombreLengua(h), href: rutaIdioma(h.id) })),
    ...(l.lat !== null && l.lon !== null ? [{ lat: l.lat, lon: l.lon, color: aes?.color ?? "#5eead4", titulo: nombre, foco: true }] : []),
  ];
  const json = {
    "@context": "https://schema.org",
    "@type": "Language",
    name: nombre,
    alternateName: l.nombre,
    ...(l.iso ? { identifier: `ISO 639-3: ${l.iso}` } : {}),
    url: `${SITE_URL}${rutaIdioma(l.id)}`,
    sameAs: [`https://glottolog.org/resource/languoid/id/${l.id}`],
  };

  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.idiomas}
      volanta={`Lingua · ${l.aislada ? "Lengua aislada" : cat?.nombre ?? "Lengua"}`}
      titulo={nombre}
      sub={
        <>
          {l.nombreEs && l.nombreEs.toLowerCase() !== l.nombre.toLowerCase() ? <>Nombre en Glottolog: {l.nombre}. </> : null}
          {l.aislada
            ? "Lengua aislada: no se le ha demostrado parentesco con ninguna otra lengua conocida."
            : l.familia
              ? <>Pertenece a la familia <Link href={rutaFamilia(l.familia)}>{nombreDe(l.familia)}</Link>{pasos.length > 1 ? `, rama ${pasos[pasos.length - 1].nombre}` : ""}.</>
              : cat?.nota}{" "}
          {MACROAREAS_ES[l.macro] ? `Macroárea: ${MACROAREAS_ES[l.macro]}.` : ""}
        </>
      }
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(json) }} />
      <Migas
        pasos={[
          { href: RUTAS_LINGUA.inicio, label: "Lingua" },
          { href: RUTAS_LINGUA.idiomas, label: "Catálogo" },
          ...pasos.slice(0, 1).map((p) => ({ href: enlacePaso(p), label: p.nombre })),
          ...(pasos.length > 2 ? [{ label: "…" }] : []),
          ...(pasos.length > 1 ? [{ href: enlacePaso(pasos[pasos.length - 1]), label: pasos[pasos.length - 1].nombre }] : []),
          { label: nombre },
        ]}
      />
      <p style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "0 0 14px" }}>
        <Insignia tipo="lengua" />
        {cat && l.categoria !== "Spoken_L1_Language" ? <Insignia tipo="pseudo" texto={cat.nombre} /> : null}
        {l.aislada ? <Insignia tipo="familia" texto="Aislada" /> : null}
        {macroMiembros ? <Insignia tipo="variedad" texto="Macrolengua ISO" /> : null}
      </p>

      <div className="vx-li-ficha">
        <div style={{ minWidth: 0 }}>
          {puntos.length ? (
            <section>
              <MapaPuntos puntos={puntos} etiqueta={`Ubicación de referencia de ${nombre} y de sus lenguas hermanas`} />
              <p className="vx-li-nota" style={{ marginTop: 6 }}>
                Punto grande: ubicación de referencia de {nombre} en Glottolog (un centro aproximado, no una frontera).
                {hermanas.length ? ` En gris, ${formatoNumero(hermanas.length)} lenguas de la misma rama.` : ""}
              </p>
            </section>
          ) : null}

          <section className="vx-li-seccion">
            <h2>Clasificación genealógica</h2>
            {l.aislada ? (
              <p className="vx-li-nota">
                No pertenece a ninguna familia: es una de las lenguas aisladas del mundo. Ver <Link href={`${RUTAS_LINGUA.familias}#aisladas`}>todas las lenguas aisladas</Link>.
              </p>
            ) : pasos.length ? (
              <ol className="vx-li-lista">
                {pasos.map((p) => (
                  <li key={p.id}>
                    <Link href={p.tipo === "familia" ? `${rutaFamilia(pasos[0].id)}?n=${p.id}` : rutaIdioma(p.id)}>{p.nombre}</Link>
                  </li>
                ))}
                <li>
                  <b>{nombre}</b>
                </li>
              </ol>
            ) : (
              <p className="vx-li-nota">{cat?.nota}</p>
            )}
            {pasos.length ? (
              <p style={{ marginTop: 10 }}>
                <Link className="vx-li-boton sec" href={`${rutaFamilia(pasos[0].id)}?n=${l.id}`}>
                  Ver en el árbol interactivo →
                </Link>
              </p>
            ) : null}
          </section>

          {aes ? (
            <section className="vx-li-seccion">
              <h2>Vitalidad</h2>
              <p className="vx-li-nota">
                <PuntoAes aes={l.aes} /> — {aes.nota} Fuente: estado agregado de amenaza (AES) de Glottolog, que combina las evaluaciones de UNESCO, ElCat y Ethnologue.
              </p>
              {hermanas.length >= 3 ? (
                <>
                  <p className="vx-li-nota">Situación de las {formatoNumero(hermanas.length)} lenguas hermanas:</p>
                  <BarraAes aes={resumenHermanas.aes} sinAes={resumenHermanas.sinAes} />
                </>
              ) : null}
            </section>
          ) : null}

          {territorios.length ? (
            <section className="vx-li-seccion">
              <h2>Dónde se habla y cuánta gente la usa</h2>
              <p className="vx-li-nota">
                Estimaciones de Unicode CLDR por país (porcentaje de la población que usa la lengua, como primera o segunda lengua).
                {usuarios ? ` Suma aproximada: ${formatoPoblacion(usuarios)} de personas.` : ""}
              </p>
              <div className="vx-li-tabla-caja">
                <table className="vx-li-tabla">
                  <thead>
                    <tr>
                      <th>País o territorio</th>
                      <th className="num">% población</th>
                      <th className="num">Personas</th>
                      <th>Estatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {territorios.slice(0, 25).map((t) => (
                      <tr key={t.iso2}>
                        <td>
                          {bandera(t.iso2)} <Link href={rutaPais(t.iso2)}>{t.nombre}</Link>
                        </td>
                        <td className="num">{t.pct.toLocaleString("es-ES", { maximumFractionDigits: 2 })} %</td>
                        <td className="num">{formatoPoblacion(t.hablantes)}</td>
                        <td>{t.oficial === "official" ? "Oficial" : t.oficial === "de_facto_official" ? "Oficial de facto" : t.oficial === "official_regional" ? "Oficial regional" : t.oficial ? "Reconocida" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {directos.length ? (
            <section className="vx-li-seccion">
              <h2>Dialectos ({formatoNumero(dialectos.length)})</h2>
              <p className="vx-li-nota">
                Formas de hablar {nombre} registradas en Glottolog. Son dialectos, no lenguas aparte: sus hablantes se entienden entre sí con mayor o menor esfuerzo.
              </p>
              <ul className="vx-li-chips">
                {directos.slice(0, 120).map((d) => (
                  <li key={d.id}>
                    <Link href={rutaIdioma(d.id)}>{d.nombre}</Link>
                  </li>
                ))}
              </ul>
              {directos.length > 120 ? <p className="vx-li-nota">…y {directos.length - 120} más en el árbol.</p> : null}
            </section>
          ) : null}

          {variedades.length ? (
            <section className="vx-li-seccion">
              <h2>Variedades regionales normalizadas</h2>
              <p className="vx-li-nota">Normas regionales con código propio en CLDR (las que usan teclados, correctores y sistemas operativos). Son variedades de la misma lengua, no dialectos de Glottolog.</p>
              <ul className="vx-li-chips">
                {variedades.map((v) => (
                  <li key={v.codigo}>
                    <span>
                      <Insignia tipo="variedad" texto={v.codigo} /> {v.nombre}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {vocab.length ? (
            <section className="vx-li-seccion">
              <h2>Vocabulario básico</h2>
              <p className="vx-li-nota">Traducciones tal como figuran en Wikcionario en español (acepción 1). Solo se muestran las que existen en la fuente.</p>
              <div className="vx-li-tabla-caja">
                <table className="vx-li-tabla">
                  <tbody>
                    {vocab.map(({ concepto, t }) => (
                      <tr key={concepto.id}>
                        <td>
                          <Link href={`${RUTAS_LINGUA.diccionario}?p=${encodeURIComponent(concepto.palabra)}`}>{concepto.palabra}</Link>
                        </td>
                        <td>
                          {t.map(([w, tr, nota], i) => (
                            <span key={i}>
                              {i ? ", " : ""}
                              <span className="vx-li-palabra" lang={code}>{w}</span>
                              {tr ? <span className="vx-li-tr"> ({tr})</span> : null}
                              {nota ? <span className="vx-li-calif">{nota}</span> : null}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {exprs.length ? (
            <section className="vx-li-seccion">
              <h2>Expresiones</h2>
              <p className="vx-li-nota">De las tablas de traducción de Wiktionary en inglés. Los matices (registro, momento del día) se muestran tal como los anota la fuente.</p>
              <div className="vx-li-tabla-caja">
                <table className="vx-li-tabla">
                  <tbody>
                    {exprs.map(({ expresion, t }) => (
                      <tr key={expresion.id}>
                        <td>
                          <Link href={`${RUTAS_LINGUA.expresiones}/${expresion.id}`}>{expresion.es}</Link>
                        </td>
                        <td>
                          {t.map(([w, tr, nota], i) => (
                            <span key={i}>
                              {i ? " · " : ""}
                              <span className="vx-li-palabra" lang={code}>{w}</span>
                              {tr ? <span className="vx-li-tr"> ({tr})</span> : null}
                              {nota ? <span className="vx-li-calif">{nota}</span> : null}
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {hermanas.length ? (
            <section className="vx-li-seccion">
              <h2>Lenguas de la misma rama</h2>
              <ul className="vx-li-chips">
                {hermanas.slice(0, 60).map((h) => (
                  <li key={h.id}>
                    <Link href={rutaIdioma(h.id)}>{nombreLengua(h)}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="vx-li-lateral">
          <div className="vx-li-caja">
            <h2>Ficha técnica</h2>
            <dl className="vx-li-datos">
              <div>
                <dt>Glottocode</dt>
                <dd>
                  <a href={`https://glottolog.org/resource/languoid/id/${l.id}`} target="_blank" rel="noopener noreferrer">
                    {l.id}
                  </a>
                </dd>
              </div>
              <div>
                <dt>ISO 639-3</dt>
                <dd>
                  {l.iso ? (
                    <a href={`https://iso639-3.sil.org/code/${l.iso}`} target="_blank" rel="noopener noreferrer">
                      {l.iso}
                    </a>
                  ) : (
                    "Sin código asignado"
                  )}
                  {code && code !== l.iso ? <small>Código corto (ISO 639-1 / CLDR): {code}</small> : null}
                </dd>
              </div>
              {enMacro ? (
                <div>
                  <dt>Macrolengua ISO</dt>
                  <dd>
                    Forma parte de «{enMacro}»
                    <small>ISO agrupa bajo una macrolengua variedades que se tratan como una sola lengua en ciertos usos.</small>
                  </dd>
                </div>
              ) : null}
              {macroMiembros ? (
                <div>
                  <dt>Macrolengua</dt>
                  <dd>
                    Agrupa {macroMiembros.length} lenguas individuales en ISO 639-3
                    <small>{macroMiembros.slice(0, 12).join(", ")}{macroMiembros.length > 12 ? "…" : ""}</small>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt>Tipo</dt>
                <dd>
                  {cat?.nombre ?? l.categoria}
                  <small>{cat?.nota}</small>
                </dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <PuntoAes aes={l.aes} />
                </dd>
              </div>
              <div>
                <dt>Documentación disponible</dt>
                <dd>{MED_ES[l.med] ?? "Sin dato"}</dd>
              </div>
              {l.paises.length ? (
                <div>
                  <dt>Países (Glottolog)</dt>
                  <dd>
                    {l.paises.map((p, i) => (
                      <span key={p}>
                        {i ? ", " : ""}
                        <Link href={rutaPais(p)}>{nombreTerritorio(p)}</Link>
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
              {l.lat !== null && l.lon !== null ? (
                <div>
                  <dt>Ubicación de referencia</dt>
                  <dd>
                    {l.lat.toFixed(2)}°, {l.lon.toFixed(2)}°
                  </dd>
                </div>
              ) : null}
              {escr && (escr.p.length || escr.s.length) ? (
                <div>
                  <dt>Escrituras (CLDR)</dt>
                  <dd>
                    {escr.p.map((s, i) => (
                      <span key={s}>
                        {i ? ", " : ""}
                        {escrituraPorCodigo(s) ? <Link href={rutaEscritura(s)}>{nombreEscrituraCldr(s) ?? s}</Link> : nombreEscrituraCldr(s) ?? s}
                      </span>
                    ))}
                    {escr.s.length ? <small>Secundarias: {escr.s.map((s) => nombreEscrituraCldr(s) ?? s).join(", ")}</small> : null}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="vx-li-caja">
            <h2>Seguir explorando</h2>
            <ul className="vx-li-lista">
              {alfa ? (
                <li>
                  <Link href={`${RUTAS_LINGUA.alfabetos}?l=${code}`}>Alfabeto y caracteres</Link>
                </li>
              ) : null}
              {code ? (
                <li>
                  <Link href={`${RUTAS_LINGUA.comparador}?l=es,${code}`}>Comparar palabras con el español</Link>
                </li>
              ) : null}
              {code ? (
                <li>
                  <Link href={`${RUTAS_LINGUA.pronunciacion}?l=${code}`}>Pronunciación con grabaciones</Link>
                </li>
              ) : null}
              {l.paises.slice(0, 3).map((p) =>
                POR_ISO2.has(p) ? (
                  <li key={p}>
                    <Link href={`/mundos/${p.toLowerCase()}`}>Ficha de país: {nombreTerritorio(p)}</Link>
                  </li>
                ) : null,
              )}
              <li>
                <a href={`https://glottolog.org/resource/languoid/id/${l.id}`} target="_blank" rel="noopener noreferrer">
                  Bibliografía en Glottolog
                </a>
              </li>
              {l.iso ? (
                <li>
                  <a href={`https://www.ethnologue.com/language/${l.iso}/`} target="_blank" rel="noopener noreferrer">
                    Ethnologue ({l.iso})
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </aside>
      </div>
    </MarcoLingua>
  );
}

function FichaDialecto({ id }: { id: string }) {
  const d = dialectoPorId(id);
  if (!d) notFound();
  const l = lenguaPorId(d.lengua);
  const pasos = linaje(id);
  const sub = hijosDe(id).dialectos;
  const hermanos = hijosDe(d.padre).dialectos.filter((x) => x.id !== id);
  const raiz = pasos.find((p) => p.tipo === "familia");
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.idiomas}
      volanta="Lingua · Dialecto"
      titulo={d.nombre}
      sub={
        l ? (
          <>
            Dialecto de <Link href={rutaIdioma(l.id)}>{nombreLengua(l)}</Link> según Glottolog. Un dialecto es una forma de hablar una lengua; no es una lengua aparte.
          </>
        ) : (
          "Dialecto registrado en Glottolog."
        )
      }
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, ...(l ? [{ href: rutaIdioma(l.id), label: nombreLengua(l) }] : []), { label: d.nombre }]} />
      <p style={{ margin: "0 0 14px" }}>
        <Insignia tipo="dialecto" />
      </p>
      <div className="vx-li-ficha">
        <div style={{ minWidth: 0 }}>
          <section>
            <h2 style={{ fontSize: 19, margin: "0 0 8px" }}>Linaje</h2>
            <ol className="vx-li-lista">
              {pasos.map((p) => (
                <li key={p.id}>
                  <Link href={enlacePaso(p)}>{p.nombre}</Link> <Insignia tipo={p.tipo === "familia" ? "familia" : p.tipo === "lengua" ? "lengua" : "dialecto"} />
                </li>
              ))}
              <li>
                <b>{d.nombre}</b>
              </li>
            </ol>
            {raiz ? (
              <p style={{ marginTop: 10 }}>
                <Link className="vx-li-boton sec" href={`${rutaFamilia(raiz.id)}?n=${id}`}>
                  Ver en el árbol interactivo →
                </Link>
              </p>
            ) : null}
          </section>
          {sub.length ? (
            <section className="vx-li-seccion">
              <h2>Subdialectos</h2>
              <ul className="vx-li-chips">
                {sub.map((s) => (
                  <li key={s.id}>
                    <Link href={rutaIdioma(s.id)}>{s.nombre}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {hermanos.length ? (
            <section className="vx-li-seccion">
              <h2>Dialectos del mismo grupo</h2>
              <ul className="vx-li-chips">
                {hermanos.slice(0, 80).map((s) => (
                  <li key={s.id}>
                    <Link href={rutaIdioma(s.id)}>{s.nombre}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
        <aside className="vx-li-lateral">
          <div className="vx-li-caja">
            <h2>Ficha técnica</h2>
            <dl className="vx-li-datos">
              <div>
                <dt>Glottocode</dt>
                <dd>
                  <a href={`https://glottolog.org/resource/languoid/id/${d.id}`} target="_blank" rel="noopener noreferrer">
                    {d.id}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Lengua</dt>
                <dd>{l ? <Link href={rutaIdioma(l.id)}>{nombreLengua(l)}</Link> : d.lengua}</dd>
              </div>
              {l ? (
                <div>
                  <dt>Estado de la lengua</dt>
                  <dd>
                    <PuntoAes aes={l.aes} />
                    <small>Glottolog evalúa la vitalidad a nivel de lengua, no de dialecto.</small>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </aside>
      </div>
    </MarcoLingua>
  );
}
