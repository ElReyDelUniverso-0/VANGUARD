// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — diccionario multilingüe y búsqueda de palabras.
// Consulta en vivo Wikcionario en español: definiciones, etimología,
// grabaciones y traducciones tal como las escribieron sus editores.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas } from "@/components/lingua/piezas";
import { AudioCommonsVista } from "@/components/lingua/audio";
import { conceptos, FUENTE_PALABRAS, glottoDeCodigo, lenguaPorId, nombreCodigo } from "@/lib/lingua/servidor";
import { consultarDiccionario, metadatosAudio, type AudioCommons } from "@/lib/lingua/wiki";
import { RUTAS_LINGUA, rutaIdioma } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const p = typeof sp.p === "string" ? sp.p.trim().slice(0, 60) : "";
  return {
    title: p ? `«${p}» en el diccionario multilingüe · Lingua · VANGUARD` : "Diccionario multilingüe · Lingua · VANGUARD",
    description: "Busca una palabra y obtén sus definiciones, su etimología, grabaciones de pronunciación y sus traducciones a cientos de lenguas, desde Wikcionario.",
    alternates: { canonical: `${SITE_URL}/lingua/diccionario${p ? `?p=${encodeURIComponent(p)}` : ""}` },
    robots: p ? { index: false, follow: true } : undefined,
  };
}

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const p = typeof sp.p === "string" ? sp.p.trim().slice(0, 60) : "";
  const filtro = typeof sp.l === "string" ? sp.l.trim().toLowerCase().slice(0, 40) : "";
  const entrada = p ? await consultarDiccionario(p, nombreCodigo) : null;
  const espanol = entrada?.secciones.find((s) => s.codigo === "es");
  const audios = espanol?.audios.length ? await metadatosAudio(espanol.audios) : new Map<string, AudioCommons>();
  const trad = entrada
    ? Object.entries(entrada.traducciones)
        .map(([code, t]) => ({ code, nombre: nombreCodigo(code), t }))
        .filter((x) => !filtro || x.nombre.toLowerCase().includes(filtro) || x.code === filtro)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    : [];
  const lista = conceptos();

  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.diccionario}
      titulo="Diccionario multilingüe"
      sub="Escribe una palabra en español (o en cualquier lengua con entrada en Wikcionario en español) para ver qué significa, de dónde viene, cómo suena y cómo se dice en otras lenguas. Las traducciones son las que han escrito y revisado los editores de Wikcionario; Lingua no inventa ninguna."
      fuente={
        <>
          Wikcionario en español (CC BY-SA 4.0), consultado en vivo
          {entrada ? (
            <>
              {" "}
              · revisión{" "}
              <a href={`https://es.wiktionary.org/w/index.php?oldid=${entrada.revid}`} target="_blank" rel="noopener noreferrer">
                {entrada.revid}
              </a>
            </>
          ) : null}
          . Grabaciones: Wikimedia Commons, con su licencia y autor.
        </>
      }
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Diccionario" }, ...(p ? [{ label: p }] : [])]} />
      <form className="vx-li-form" method="get" action={RUTAS_LINGUA.diccionario} role="search">
        <label className="ancho">
          Palabra
          <input name="p" type="search" defaultValue={p} placeholder="agua, libertad, ojalá…" required maxLength={60} autoComplete="off" />
        </label>
        <button className="vx-li-boton" type="submit">
          Buscar
        </button>
      </form>

      {p && !entrada ? (
        <div className="vx-li-aviso">
          <b>Wikcionario en español no tiene una entrada para «{p}».</b> Comprueba la ortografía (las mayúsculas cuentan: «París» y «parís» son entradas distintas) o búscala en{" "}
          <a href={`https://es.wiktionary.org/w/index.php?search=${encodeURIComponent(p)}`} target="_blank" rel="noopener noreferrer">
            el buscador de Wikcionario
          </a>
          . Si la fuente no responde, vuelve a intentarlo en unos segundos.
        </div>
      ) : null}

      {entrada ? (
        <>
          <section className="vx-li-seccion">
            <h2 style={{ fontSize: 26 }}>{entrada.titulo}</h2>
            <p className="vx-li-nota">
              Aparece como palabra en {entrada.secciones.length} {entrada.secciones.length === 1 ? "lengua" : "lenguas"} ·{" "}
              <a href={entrada.url} target="_blank" rel="noopener noreferrer">
                ver en Wikcionario
              </a>{" "}
              · <Link href={`${RUTAS_LINGUA.pronunciacion}?p=${encodeURIComponent(entrada.titulo)}`}>pronunciación en otras lenguas</Link>
            </p>
          </section>
          {entrada.secciones.map((s) => {
            const g = glottoDeCodigo(s.codigo);
            const l = g ? lenguaPorId(g) : undefined;
            if (!s.definiciones.length && !s.etimologia) return null;
            return (
              <section key={s.codigo} className="vx-li-caja" style={{ marginTop: 12 }}>
                <h3>{l ? <Link href={rutaIdioma(l.id)} style={{ color: "inherit" }}>{nombreCodigo(s.codigo)}</Link> : nombreCodigo(s.codigo)}</h3>
                {s.etimologia ? (
                  <p className="vx-li-nota">
                    <b>Etimología:</b> {s.etimologia}
                  </p>
                ) : null}
                {s.definiciones.length ? (
                  <ol className="vx-li-lista" style={{ color: "#d6dfea" }}>
                    {s.definiciones.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ol>
                ) : null}
                {s.codigo === "es" && audios.size ? (
                  <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                    {[...new Set(audios.values())].map((a) => (
                      <AudioCommonsVista key={a.archivo} a={a} />
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}

          <section className="vx-li-seccion">
            <h2>Traducciones ({Object.keys(entrada.traducciones).length} lenguas)</h2>
            <p className="vx-li-nota">
              El número entre corchetes indica a qué acepción española corresponde cada traducción, según la anotación de Wikcionario. Una traducción sin número no especifica acepción.
            </p>
            {Object.keys(entrada.traducciones).length ? (
              <>
                <form className="vx-li-form" method="get" action={RUTAS_LINGUA.diccionario}>
                  <input type="hidden" name="p" value={p} />
                  <label className="ancho">
                    Filtrar por lengua
                    <input name="l" defaultValue={filtro} placeholder="francés, quechua, ja…" autoComplete="off" />
                  </label>
                  <button className="vx-li-boton sec" type="submit">
                    Filtrar
                  </button>
                </form>
                <div className="vx-li-tabla-caja">
                  <table className="vx-li-tabla">
                    <thead>
                      <tr>
                        <th>Lengua</th>
                        <th>Traducción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trad.map(({ code, nombre, t }) => {
                        const g = glottoDeCodigo(code);
                        const l = g ? lenguaPorId(g) : undefined;
                        return (
                          <tr key={code}>
                            <td>
                              {l ? <Link href={rutaIdioma(l.id)}>{nombre}</Link> : nombre}
                              <small>{code}</small>
                            </td>
                            <td>
                              {t.map((x, i) => (
                                <span key={i}>
                                  {i ? ", " : ""}
                                  <span className="vx-li-palabra" lang={code}>
                                    {x.texto}
                                  </span>
                                  {x.translit ? <span className="vx-li-tr"> ({x.translit})</span> : null}
                                  {x.acepciones ? <span className="vx-li-tr"> [{x.acepciones}]</span> : null}
                                  {x.nota ? <span className="vx-li-calif">{x.nota}</span> : null}
                                </span>
                              ))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="vx-li-aviso">Esta entrada no tiene tabla de traducciones en Wikcionario en español.</p>
            )}
          </section>
        </>
      ) : null}

      {!p ? (
        <section className="vx-li-seccion">
          <h2>Vocabulario básico precompilado</h2>
          <p className="vx-li-nota">
            33 palabras universales con sus traducciones ya verificadas ({FUENTE_PALABRAS}). Úsalas en el <Link href={RUTAS_LINGUA.comparador}>comparador</Link> o ábrelas en el diccionario.
          </p>
          <div className="vx-li-rejilla tres">
            {lista.map((c) => (
              <Link key={c.id} href={`${RUTAS_LINGUA.diccionario}?p=${encodeURIComponent(c.palabra)}`} className="vx-li-tarjeta">
                <h3>{c.palabra}</h3>
                <p>{c.acepcion.length > 110 ? `${c.acepcion.slice(0, 108)}…` : c.acepcion}</p>
                <small>{Object.keys(c.t).length} lenguas</small>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </MarcoLingua>
  );
}
