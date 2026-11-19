// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — pronunciación con grabaciones reales.
// Solo dos fuentes autorizadas: grabaciones de Wikimedia Commons (cada
// una con su licencia libre y su autor) y transcripciones AFI escritas
// por los editores de Wiktionary/Wikcionario. Sin voces sintéticas.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas } from "@/components/lingua/piezas";
import { AudioCommonsVista } from "@/components/lingua/audio";
import { glottoDeCodigo, lenguaPorId, nombreCodigo, vocabularioDe } from "@/lib/lingua/servidor";
import { consultarPronunciacion, metadatosAudio, type AudioCommons } from "@/lib/lingua/wiki";
import { RUTAS_LINGUA, rutaIdioma } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const p = typeof sp.p === "string" ? sp.p.trim().slice(0, 60) : "";
  return {
    title: p ? `Pronunciación de «${p}» · Lingua · VANGUARD` : "Pronunciación con grabaciones reales · Lingua · VANGUARD",
    description: "Escucha cómo se pronuncia una palabra en distintas lenguas con grabaciones de hablantes en Wikimedia Commons y su transcripción fonética (AFI).",
    alternates: { canonical: `${SITE_URL}/lingua/pronunciacion` },
    robots: p ? { index: false, follow: true } : undefined,
  };
}

const EJEMPLOS = ["agua", "bonjour", "gracias", "water", "Wasser", "obrigado", "merci", "hello"];

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const p = typeof sp.p === "string" ? sp.p.trim().slice(0, 60) : "";
  const l = typeof sp.l === "string" ? sp.l.trim().toLowerCase().slice(0, 12) : "";
  const r = p ? await consultarPronunciacion(p) : null;
  const lenguas = r ? r.lenguas.filter((x) => !l || x.codigo === l) : [];
  const archivos = lenguas.flatMap((x) => x.audios.map((a) => a.archivo));
  const meta = archivos.length ? await metadatosAudio(archivos) : new Map<string, AudioCommons>();
  const sugeridas = !p && l ? vocabularioDe(l).slice(0, 24) : [];
  const ordenadas = [...lenguas].sort((a, b) => {
    const prio = (c: string) => (c === l ? 0 : c === "es" ? 1 : 2);
    return prio(a.codigo) - prio(b.codigo) || b.audios.length - a.audios.length || nombreCodigo(a.codigo).localeCompare(nombreCodigo(b.codigo), "es");
  });
  const totalAudios = lenguas.reduce((s, x) => s + x.audios.filter((a) => meta.has(a.archivo)).length, 0);

  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.pronunciacion}
      titulo="Pronunciación"
      sub="Grabaciones de hablantes reales alojadas en Wikimedia Commons y transcripciones en el Alfabeto Fonético Internacional (AFI) escritas por los editores de Wiktionary. Si una palabra no tiene grabación en la fuente, Lingua no la fabrica: lo dice."
      fuente={
        <>
          Wiktionary en inglés y Wikcionario en español (CC BY-SA 4.0), consultados en vivo; audio de Wikimedia Commons con la licencia y el autor indicados en cada grabación.
        </>
      }
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Pronunciación" }, ...(p ? [{ label: p }] : [])]} />
      <form className="vx-li-form" method="get" action={RUTAS_LINGUA.pronunciacion} role="search">
        <label className="ancho">
          Palabra (en la lengua que quieras oír)
          <input name="p" type="search" defaultValue={p} placeholder="bonjour, Wasser, agua…" required maxLength={60} autoComplete="off" />
        </label>
        <label>
          Código de lengua (opcional)
          <input name="l" defaultValue={l} placeholder="fr, de, es…" maxLength={12} autoComplete="off" />
        </label>
        <button className="vx-li-boton" type="submit">
          Escuchar
        </button>
      </form>

      {!p ? (
        <>
          {sugeridas.length ? (
            <section className="vx-li-seccion">
              <h2>Palabras de {nombreCodigo(l)} para probar</h2>
              <p className="vx-li-nota">Del vocabulario básico de Lingua. No todas tendrán grabación: depende de lo que hayan subido los hablantes a Commons.</p>
              <ul className="vx-li-chips">
                {sugeridas.map(({ concepto, t }) => (
                  <li key={concepto.id}>
                    <Link href={`${RUTAS_LINGUA.pronunciacion}?p=${encodeURIComponent(t[0][0])}&l=${l}`}>
                      {t[0][0]} <span className="vx-li-tr">({concepto.palabra})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="vx-li-seccion">
            <h2>Prueba con</h2>
            <ul className="vx-li-chips">
              {EJEMPLOS.map((e) => (
                <li key={e}>
                  <Link href={`${RUTAS_LINGUA.pronunciacion}?p=${encodeURIComponent(e)}`}>{e}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section className="vx-li-seccion">
            <h2>De dónde salen las grabaciones</h2>
            <div className="vx-li-texto">
              <p>
                Wikimedia Commons reúne decenas de miles de grabaciones de palabras hechas por hablantes voluntarios, muchas a través del proyecto Lingua Libre. Cada archivo se publica con
                una licencia libre (CC0, CC BY o CC BY-SA) que permite reproducirlo citando a su autor, y Lingua muestra ese crédito junto a cada audio.
              </p>
              <p>
                El AFI es el alfabeto que usan los lingüistas para escribir sonidos sin ambigüedad: [ˈaɣwa] indica que la g de «agua» se pronuncia suave entre vocales. Lingua muestra
                las transcripciones tal como figuran en la fuente, con la variedad (Francia, Quebec, Inglaterra…) cuando el editor la indica.
              </p>
            </div>
          </section>
        </>
      ) : null}

      {p && !r ? (
        <p className="vx-li-aviso">
          <b>No hay entrada para «{p}»</b> ni en Wiktionary en inglés ni en Wikcionario en español. Revisa la ortografía y las mayúsculas (en alemán, los sustantivos van con mayúscula:
          «Wasser»).
        </p>
      ) : null}

      {r ? (
        <>
          <p className="vx-li-nota">
            «{r.titulo}»: {lenguas.length} {lenguas.length === 1 ? "lengua" : "lenguas"} con datos de pronunciación{l ? ` (filtrado: ${nombreCodigo(l)})` : ""}, {totalAudios}{" "}
            {totalAudios === 1 ? "grabación" : "grabaciones"}.{" "}
            {r.fuentes.map((f, i) => (
              <span key={f}>
                {i ? " · " : ""}
                <a href={f} target="_blank" rel="noopener noreferrer">
                  {f.includes("en.wiktionary") ? "Wiktionary" : "Wikcionario"}
                </a>
              </span>
            ))}
          </p>
          {!lenguas.length ? (
            <p className="vx-li-aviso">
              La entrada existe, pero {l ? `no tiene datos de pronunciación para ${nombreCodigo(l)}` : "no incluye grabaciones ni transcripciones explícitas"}. Algunas lenguas generan el AFI
              automáticamente en la página de Wiktionary; puedes verlo allí.
            </p>
          ) : null}
          <div style={{ display: "grid", gap: 12 }}>
            {ordenadas.map((x) => {
              const g = glottoDeCodigo(x.codigo);
              const ln = g ? lenguaPorId(g) : undefined;
              const audios = x.audios.map((a) => ({ a, m: meta.get(a.archivo) })).filter((z): z is { a: typeof z.a; m: AudioCommons } => Boolean(z.m));
              return (
                <section key={`${x.codigo}-${x.seccion}`} className="vx-li-caja">
                  <h3>
                    {ln ? <Link href={rutaIdioma(ln.id)} style={{ color: "inherit" }}>{nombreCodigo(x.codigo)}</Link> : nombreCodigo(x.codigo)}{" "}
                    <span style={{ color: "var(--pl-tenue)", textTransform: "none", letterSpacing: 0 }}>· {x.codigo}</span>
                  </h3>
                  {x.ipa.length ? (
                    <ul className="vx-li-lista" style={{ listStyle: "none", paddingLeft: 0 }}>
                      {x.ipa.slice(0, 8).map((i, k) => (
                        <li key={k}>
                          <span className="vx-li-ipa">{i.texto}</span>
                          {i.acento ? <span className="vx-li-tr"> · {i.acento}</span> : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="vx-li-nota">Sin transcripción AFI explícita en la fuente.</p>
                  )}
                  {audios.length ? (
                    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                      {audios.slice(0, 6).map(({ a, m }) => (
                        <AudioCommonsVista key={a.archivo} a={m} etiqueta={a.acento || undefined} />
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </>
      ) : null}
    </MarcoLingua>
  );
}
