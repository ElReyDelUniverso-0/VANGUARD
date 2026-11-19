// ============================================================
// v421.9 FICHA DE PUBLICACIÓN — el átomo del centro.
// Muestra, separados y sin mezclar: tipo editorial, régimen de
// arbitraje, nivel de evidencia, qué añadió, su límite, los autores,
// las citas VERIFICADAS contra el índice y el enlace original.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonGuardar } from "@/components/ciencia/biblioteca";
import {
  Autores,
  DisciplinaEnlace,
  MarcoCiencia,
  Migas,
  SelloNivel,
  SelloTipo,
  TarjetaPublicacion,
} from "@/components/ciencia/piezas";
import {
  CAPTURA,
  EXPERIMENTOS,
  NIVEL_INFO,
  PREMIOS,
  PUBLICACIONES,
  TECNOLOGIAS,
  TIPO_INFO,
  fechaLarga,
  ideaDe,
  institucionesDePublicacion,
  publicacionDe,
  relacionesDe,
  rutaBusqueda,
  rutaExperimento,
  rutaIdea,
  rutaInstitucion,
  rutaPremio,
  rutaPublicacion,
  rutaTecnologia,
  tecnologiasDePublicacion,
} from "@/lib/ciencia/indice";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const p = publicacionDe(id);
  if (!p) return { title: "Publicación no encontrada · Science Frontier" };
  return {
    title: `${p.titulo} · Science Frontier`,
    description: `${TIPO_INFO[p.tipo].etiqueta} · ${NIVEL_INFO[p.nivel].etiqueta}. ${p.lectura}`,
    alternates: { canonical: `${SITE_URL}${rutaPublicacion(p.id)}` },
    openGraph: {
      title: p.titulo,
      description: p.lectura,
      url: `${SITE_URL}${rutaPublicacion(p.id)}`,
      siteName: "VANGUARD",
      type: "article",
    },
  };
}

export default async function Page({ params }: Params) {
  const { id } = await params;
  const p = publicacionDe(id);
  if (!p) notFound();

  const idea = ideaDe(p.ideaId);
  const rel = relacionesDe(p);
  const instituciones = institucionesDePublicacion(p.id);
  const tecnologias = tecnologiasDePublicacion(p.id);
  const experimentos = EXPERIMENTOS.filter((e) => e.publicaciones.includes(p.id));
  const premios = idea ? PREMIOS.filter((pr) => pr.idea === idea.id) : [];
  const divulgacion = PUBLICACIONES.filter((d) => d.tipo === "divulgacion" && d.ideaId === p.ideaId);
  const mismaIdea = idea ? publicacionesDeIdeaResto(p.id, idea.publicaciones) : [];
  const json = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: p.titulo,
    name: p.tituloOriginal,
    inLanguage: "es",
    datePublished: p.fecha.length === 10 ? p.fecha : `${p.fecha}-01`,
    isPartOf: { "@type": "Periodical", name: p.medio },
    identifier: p.identificador,
    url: p.original,
    sameAs: [p.original, p.metadatos].filter(Boolean),
    author: p.autores.map((a) => ({ "@type": "Person", name: a.nombre })),
    description: p.lectura,
  };

  return (
    <MarcoCiencia activa="/ciencia/buscar">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(json) }} />
      <Migas
        pasos={[
          { href: "/ciencia", label: "Science Frontier" },
          { href: "/ciencia/buscar", label: "Publicaciones" },
          ...(idea ? [{ href: rutaIdea(idea.id), label: idea.pregunta }] : []),
          { label: p.titulo.length > 42 ? `${p.titulo.slice(0, 42)}…` : p.titulo },
        ]}
      />

      <p className="vx-sc-volanta">
        <DisciplinaEnlace id={p.disciplinaId} /> · {p.anio} · {p.medio}
      </p>
      <h1 style={{ fontSize: "clamp(26px, 4.6vw, 40px)" }}>{p.titulo}</h1>
      <p className="vx-sc-sub" style={{ fontStyle: "italic", color: "#8fa2b8" }}>
        {p.tituloOriginal}
      </p>

      <div className="vx-sc-sellos" style={{ marginBottom: 14 }}>
        <SelloTipo tipo={p.tipo} />
        <SelloNivel nivel={p.nivel} />
        <span className="vx-sc-meta">
          <time dateTime={p.fecha}>{fechaLarga(p.fecha)}</time>
        </span>
        <span className="vx-sc-meta">Arbitraje declarado: {etiquetaArbitraje(p.arbitraje)}</span>
      </div>

      <div className="vx-sc-ficha-detalle">
        <div>
          <section className="vx-sc-panel" style={{ marginBottom: 12 }}>
            <h2>Qué dice, en la lectura de VANGUARD</h2>
            <p className="vx-sc-lectura">{p.lectura}</p>
            <p className="vx-sc-aviso" style={{ marginBottom: 0 }}>
              <b>Límite declarado:</b> {p.cautela}
            </p>
          </section>

          <section className="vx-sc-panel" style={{ marginBottom: 12 }}>
            <h2>Cómo clasificarlo</h2>
            <dl className="vx-sc-datos lista">
              <div>
                <dt>Tipo editorial</dt>
                <dd>{TIPO_INFO[p.tipo].etiqueta}</dd>
              </div>
              <div>
                <dt>Qué implica</dt>
                <dd style={{ maxWidth: "62%" }}>{TIPO_INFO[p.tipo].detalle}</dd>
              </div>
              <div>
                <dt>Nivel de evidencia</dt>
                <dd>{NIVEL_INFO[p.nivel].etiqueta}</dd>
              </div>
              <div>
                <dt>Qué implica</dt>
                <dd style={{ maxWidth: "62%" }}>{NIVEL_INFO[p.nivel].detalle}</dd>
              </div>
              <div>
                <dt>Revista o plataforma</dt>
                <dd>{p.medio}</dd>
              </div>
              <div>
                <dt>Identificador</dt>
                <dd>{p.identificador}</dd>
              </div>
            </dl>
            {p.nivel === "hipotesis" ? (
              <p className="vx-sc-aviso" style={{ marginTop: 12, marginBottom: 0 }}>
                Esta publicación propone una explicación. No se presenta como descubrimiento demostrado: en el índice
                aparece marcada como hipótesis y así viaja a la cronología y al buscador.
              </p>
            ) : null}
          </section>

          {p.resumenOriginal ? (
            <section className="vx-sc-panel" style={{ marginBottom: 12 }}>
              <h2>Resumen original del editor</h2>
              <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>{p.resumenOriginal}</p>
              <p className="vx-sc-hueco" style={{ marginBottom: 0 }}>
                Texto del editor reproducido solo cuando Crossref lo publica con licencia de metadatos. La lectura de
                arriba es de VANGUARD y no es una traducción de este resumen.
              </p>
            </section>
          ) : null}

          {idea ? (
            <section className="vx-sc-panel" style={{ marginBottom: 12 }}>
              <h2>Su lugar en la evolución de una idea</h2>
              <p style={{ marginBottom: 4 }}>
                <Link href={rutaIdea(idea.id)} style={{ color: "#22d3ee" }}>
                  {idea.pregunta}
                </Link>
              </p>
              <p style={{ marginBottom: 6 }}>{idea.pasos[p.id]}</p>
              <p className="vx-sc-hueco" style={{ marginBottom: 0 }}>
                Idea {idea.desde}–{idea.hasta} · estado declarado: {idea.estado} · {idea.publicaciones.length} pasos
                registrados.
              </p>
            </section>
          ) : null}

          <section className="vx-sc-panel" style={{ marginBottom: 12 }}>
            <h2>Publicaciones relacionadas</h2>
            <p className="vx-sc-hueco" style={{ marginBottom: 10 }}>
              «Cita verificada» significa que el DOI aparece en la lista de referencias del registro consultado en
              Crossref. «Misma idea» es una agrupación editorial de VANGUARD, no una cita.
            </p>
            {rel.referencia.length > 0 ? (
              <>
                <p className="vx-sc-kicker">Referencias de este trabajo, dentro del índice</p>
                <ul style={{ margin: "0 0 10px", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>
                  {rel.referencia.map((o) => (
                    <li key={o.id}>
                      <Link href={rutaPublicacion(o.id)} style={{ color: "#22d3ee" }}>
                        {o.titulo}
                      </Link>{" "}
                      <span className="vx-sc-hueco">
                        ({o.anio}, {o.medio})
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {rel.citadaPor.length > 0 ? (
              <>
                <p className="vx-sc-kicker">Trabajos del índice que la citan</p>
                <ul style={{ margin: "0 0 10px", paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>
                  {rel.citadaPor.map((o) => (
                    <li key={o.id}>
                      <Link href={rutaPublicacion(o.id)} style={{ color: "#22d3ee" }}>
                        {o.titulo}
                      </Link>{" "}
                      <span className="vx-sc-hueco">
                        ({o.anio} · {TIPO_INFO[o.tipo].etiqueta})
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {rel.referencia.length === 0 && rel.citadaPor.length === 0 ? (
              <p className="vx-sc-hueco">
                Ninguna cita de este registro apunta a otra publicación del índice. Las relaciones que se muestran
                abajo son de la misma idea, no citas.
              </p>
            ) : null}
            {mismaIdea.length > 0 ? (
              <>
                <p className="vx-sc-kicker">Misma idea, otros pasos</p>
                <div className="vx-sc-meta" style={{ flexWrap: "wrap", gap: 8 }}>
                  {mismaIdea.map((o) => (
                    <Link key={o.id} href={rutaPublicacion(o.id)} style={{ color: "#9fb0c4", fontSize: 12.5 }}>
                      {o.anio} · {o.titulo.slice(0, 64)}
                      {o.titulo.length > 64 ? "…" : ""}
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </section>

          {divulgacion.length > 0 ? (
            <section className="vx-sc-panel" style={{ marginBottom: 12 }}>
              <h2>Divulgación sobre esta idea (no es evidencia)</h2>
              <div className="vx-sc-enlaces">
                {divulgacion.map((d) => (
                  <a key={d.id} href={d.original} target="_blank" rel="noopener noreferrer">
                    {d.titulo} — {d.medio} ↗
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="vx-sc-lateral">
          <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
            <h2>Publicación original</h2>
            <dl className="vx-sc-datos lista">
              <div>
                <dt>Enlace</dt>
                <dd>
                  <a href={p.original} target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>
                    {p.idTipo.toUpperCase()} ↗
                  </a>
                </dd>
              </div>
              <div>
                <dt>Metadatos leídos</dt>
                <dd>
                  <a href={p.metadatos} target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>
                    consultar ↗
                  </a>
                </dd>
              </div>
              <div>
                <dt>Huella de la captura</dt>
                <dd style={{ fontFamily: "ui-monospace,monospace", fontSize: 11 }}>{p.sha256 ? `${p.sha256.slice(0, 16)}…` : "sin archivo (enlace vivo)"}</dd>
              </div>
              <div>
                <dt>Capturado</dt>
                <dd>{CAPTURA}</dd>
              </div>
            </dl>
            <a className="vx-sc-boton" style={{ marginTop: 12, width: "100%" }} href={p.original} target="_blank" rel="noopener noreferrer">
              Abrir la publicación original ↗
            </a>
            <div style={{ marginTop: 8 }}>
              <BotonGuardar id={p.id} titulo={p.titulo} />
            </div>
          </div>

          <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
            <h2>Autoría</h2>
            <Autores p={p} max={10} />
            <p className="vx-sc-hueco" style={{ margin: "8px 0 0" }}>
              {p.totalAutores > 0
                ? `${p.totalAutores} ${p.totalAutores === 1 ? "firma" : "firmas"} en el registro. Los nombres se muestran como los publica la fuente.`
                : "El registro no declara autoría individual."}
            </p>
            {p.autores[0] ? (
              <p style={{ margin: "8px 0 0" }}>
                <Link href={rutaBusqueda({ q: p.autores[0].nombre })} style={{ color: "#22d3ee", fontSize: 12.5 }}>
                  Buscar este autor en el índice →
                </Link>
              </p>
            ) : null}
          </div>

          {instituciones.length > 0 ? (
            <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
              <h2>Instituciones vinculadas</h2>
              <div className="vx-sc-enlaces">
                {instituciones.map((i) => (
                  <Link key={i.id} href={rutaInstitucion(i.id)}>
                    {i.nombre}
                  </Link>
                ))}
              </div>
              <p className="vx-sc-hueco" style={{ marginTop: 8, marginBottom: 0 }}>
                {instituciones.flatMap((i) => i.vinculos.filter((v) => v.publicacion === p.id).map((v) => v.base)).join(" · ")}
              </p>
            </div>
          ) : null}

          {experimentos.length > 0 ? (
            <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
              <h2>Método o experimento</h2>
              <div className="vx-sc-enlaces">
                {experimentos.map((e) => (
                  <Link key={e.id} href={rutaExperimento(e.id)}>
                    {e.nombre}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {tecnologias.length > 0 ? (
            <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
              <h2>Tecnología implicada</h2>
              <div className="vx-sc-enlaces">
                {tecnologias.map((t) => (
                  <Link key={t.id} href={rutaTecnologia(t.id)}>
                    {t.nombre} · {t.madurez}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {premios.length > 0 ? (
            <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
              <h2>Premio asociado a la idea</h2>
              <div className="vx-sc-enlaces">
                {premios.map((pr) => (
                  <Link key={pr.id} href={rutaPremio(pr.id)}>
                    {pr.premio} {pr.anio}
                  </Link>
                ))}
              </div>
              <p className="vx-sc-hueco" style={{ marginTop: 8, marginBottom: 0 }}>
                El premio se asocia a la línea de investigación, no a este artículo concreto.
              </p>
            </div>
          ) : null}
        </aside>
      </div>

      <section className="vx-sc-seccion">
        <header>
          <h2>Otras fichas de la misma disciplina</h2>
          <Link href={`/ciencia/disciplina/${p.disciplinaId}`}>Ver la disciplina →</Link>
        </header>
        <div className="vx-sc-lista doble">
          {PUBLICACIONES.filter((o) => o.disciplinaId === p.disciplinaId && o.id !== p.id)
            .slice(0, 2)
            .map((o) => (
              <TarjetaPublicacion key={o.id} p={o} />
            ))}
        </div>
      </section>
    </MarcoCiencia>
  );
}

function publicacionesDeIdeaResto(id: string, ids: string[]) {
  return ids.filter((x) => x !== id).map((x) => publicacionDe(x)).filter((x): x is NonNullable<ReturnType<typeof publicacionDe>> => Boolean(x));
}

function etiquetaArbitraje(a: string) {
  if (a === "revista") return "revista con arbitraje declarado por el editor";
  if (a === "repositorio") return "repositorio público (arXiv): moderación, no arbitraje";
  return "no aplica (comunicado o registro institucional)";
}
