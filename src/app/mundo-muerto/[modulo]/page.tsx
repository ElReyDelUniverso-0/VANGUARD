// ═══════════════════════════════════════════════════════════════════
// v444.0 · /mundo-muerto/[modulo] — la ficha cruda de cada hueso
// Trece páginas estáticas: cifra, datos con su fuente, rutas y casos
// documentados, registros oficiales, señales, a quién llamar, lo que la
// cifra no mide y las fuentes con fecha.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { MODULOS, moduloPorId } from "@/lib/mundo-muerto/modulos";
import { MapaRutas } from "@/components/mundo-muerto/mapa-rutas";
import "@/components/mundo-muerto/mundo-muerto.css";

export const dynamic = "force-static";
export const dynamicParams = false;

interface Props {
  params: Promise<{ modulo: string }>;
}

export function generateStaticParams() {
  return MODULOS.map((m) => ({ modulo: m.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { modulo } = await params;
  const m = moduloPorId(modulo);
  if (!m) return {};
  return {
    title: `${m.nombre}: ${m.cifra} ${m.unidad} | El Mundo Muerto · VANGUARD`,
    description: m.intro.slice(0, 300),
    alternates: { canonical: `${SITE_URL}/mundo-muerto/${m.id}` },
  };
}

export default async function ModuloMuertePage({ params }: Props) {
  const { modulo } = await params;
  const m = moduloPorId(modulo);
  if (!m) notFound();
  const i = MODULOS.indexOf(m);
  const prev = MODULOS[(i - 1 + MODULOS.length) % MODULOS.length];
  const next = MODULOS[(i + 1) % MODULOS.length];
  const ref = (f: number) => {
    const fu = m.fuentes[f];
    return fu ? (
      <a className="mm-ref" href={`#fuente-${f + 1}`} title={fu.titulo}>
        [{f + 1}]
      </a>
    ) : null;
  };

  return (
    <main className="mm" style={{ "--c": m.color } as React.CSSProperties}>
      <div className="mm-caja" style={{ maxWidth: 1040 }}>
        <nav className="mm-migas" aria-label="Migas">
          <Link href="/">Vanguard</Link>
          <span>·</span>
          <Link href="/mundo-muerto">El Mundo Muerto</Link>
          <span>·</span>
          <span>{m.nombre}</span>
        </nav>

        <header className="mm-ficha-cab">
          <p className="mm-volanta" style={{ color: m.color }}>
            Hueso {String(i + 1).padStart(2, "0")} de {MODULOS.length} · {m.hueso}
          </p>
          <h1 className="mm-titulo" style={{ fontSize: "clamp(32px, 5.4vw, 60px)" }}>
            {m.nombre}
          </h1>
          <p className="mm-ficha-cifra">{m.cifra}</p>
          <p className="mm-ficha-unidad">{m.unidad}</p>
          <p className="mm-panel-frase" style={{ maxWidth: "60ch" }}>
            {m.frase}
          </p>
        </header>

        <p className="mm-ficha-intro">{m.intro}</p>
        <p style={{ margin: "14px 0 0" }}>
          <Link className="mm-boton" href={`/mundo-muerto#${m.id}`}>
            ← Verlo en el esqueleto
          </Link>
        </p>

        {m.ayuda && m.ayuda.length > 0 && m.id === "suicidio" && <Ayuda m={m} titulo="Si estás pensando en quitarte la vida, llama ahora" />}

        <section className="mm-seccion">
          <h2>Lo que dicen las cifras</h2>
          <ul className="mm-datos">
            {m.datos.map((d, k) => (
              <li key={k}>
                {d.texto}
                {ref(d.f)}
              </li>
            ))}
          </ul>
        </section>

        {m.registros && (
          <section className="mm-seccion">
            <h2>Ver quién está cerca: los registros oficiales</h2>
            <p className="mm-nota">
              Solo existen donde la ley los creó, y solo incluyen a personas condenadas. Vanguard no copia sus datos: consulta siempre la fuente oficial, que
              es la que está al día.
            </p>
            <div className="mm-registros">
              {m.registros.map((r) => (
                <div key={r.pais} className="mm-registro">
                  <small>{r.pais}</small>
                  <h3>{r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer">{r.nombre} ↗</a> : r.nombre}</h3>
                  <p>{r.como}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {m.senales && (
          <section className="mm-seccion">
            <h2>{m.senales.titulo}</h2>
            <p className="mm-nota">Consejos generales de prevención. Ninguna señal sola prueba nada; varias juntas merecen hablar con el niño y pedir ayuda.</p>
            <ul className="mm-senales">
              {m.senales.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        )}

        {m.rutas && m.rutas.length > 0 && (
          <section className="mm-seccion">
            <h2>{m.tituloRutas ?? "Rutas documentadas"}</h2>
            <p className="mm-nota">Cada arco es una ruta descrita en una fuente concreta, no una estimación del mercado entero.</p>
            <MapaRutas rutas={m.rutas} color={m.color} titulo={`${m.tituloRutas ?? "Rutas"}: ${m.nombre}`} />
            <ul className="mm-rutas">
              {m.rutas.map((r, k) => (
                <li key={k}>
                  {r.etiqueta}
                  {ref(r.f)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {m.casos && (
          <section className="mm-seccion">
            <h2>Casos documentados</h2>
            <div className="mm-casos">
              {m.casos.map((c) => (
                <article key={c.titulo} className="mm-caso">
                  <small>
                    {c.lugar} · {c.anio}
                  </small>
                  <h3>{c.titulo}</h3>
                  <p>
                    {c.texto}
                    {ref(c.f)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {m.ayuda && m.ayuda.length > 0 && m.id !== "suicidio" && <Ayuda m={m} titulo="Dónde denunciar o pedir ayuda (República Dominicana)" />}

        {m.relacionadas && (
          <section className="mm-seccion">
            <h2>En Vanguard</h2>
            <p>
              {m.relacionadas.map((r) => (
                <Link key={r.href} href={r.href} className="mm-boton" style={{ marginRight: 8 }}>
                  {r.label} →
                </Link>
              ))}
            </p>
          </section>
        )}

        <section className="mm-seccion">
          <h2>Lo que la cifra no mide</h2>
          <p className="mm-limites">{m.limites}</p>
        </section>

        <section className="mm-seccion">
          <h2>Fuentes</h2>
          <ol className="mm-fuentes">
            {m.fuentes.map((f, k) => (
              <li key={f.url} id={`fuente-${k + 1}`}>
                <a href={f.url} target="_blank" rel="noopener noreferrer">
                  {f.titulo}
                </a>{" "}
                <small>· {f.fecha}</small>
              </li>
            ))}
          </ol>
        </section>

        <nav className="mm-vecinos" aria-label="Otros huesos">
          <Link href={`/mundo-muerto/${prev.id}`}>
            <small>↑ Hueso anterior · {prev.hueso}</small>
            {prev.nombre}
          </Link>
          <Link href={`/mundo-muerto/${next.id}`} style={{ textAlign: "right" }}>
            <small>Hueso siguiente · {next.hueso} ↓</small>
            {next.nombre}
          </Link>
        </nav>
      </div>
    </main>
  );
}

function Ayuda({ m, titulo }: { m: NonNullable<ReturnType<typeof moduloPorId>>; titulo: string }) {
  return (
    <section className="mm-seccion">
      <h2>{titulo}</h2>
      <div className="mm-ayuda">
        {m.ayuda!.map((a) => {
          const primero = a.contacto.split(" ")[0];
          const tel = /^[*\d][\d-]{2,}$/.test(primero) ? `tel:${primero.replace(/-/g, "")}` : null;
          const web = !tel && a.url && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(a.contacto) ? a.url : null;
          return (
            <div key={a.nombre} className="mm-ayuda-item">
              <span>{a.nombre}</span>
              <b>{tel ? <a href={tel}>{a.contacto}</a> : web ? <a href={web} target="_blank" rel="noopener noreferrer">{a.contacto}</a> : a.contacto}</b>
              {a.nota && <p>{a.nota}</p>}
              {a.url && !web && (
                <p>
                  <a href={a.url} target="_blank" rel="noopener noreferrer">Fuente ↗</a>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
