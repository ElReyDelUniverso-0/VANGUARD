// ============================================================
// v421.9 LA IDEA EN EVOLUCIÓN — la ficha madre del descubrimiento.
// Reúne la pregunta, su estado honesto, la secuencia de pasos con lo
// que añadió cada uno, el grafo de citas verificadas, los premios, los
// experimentos que la hicieron posible y lo que sigue sin respuesta.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EstadoIdea,
  LineaEvolucion,
  MarcoCiencia,
  Migas,
  SelloNivel,
  SelloTipo,
  TarjetaIdea,
} from "@/components/ciencia/piezas";
import {
  ESTADO_INFO,
  IDEAS,
  TIPO_INFO,
  disciplinaDe,
  divulgacionDeIdea,
  experimentosDeIdea,
  fechaLarga,
  ideaDe,
  premiosDeIdea,
  publicacionesDeIdea,
  rutaDisciplina,
  rutaIdea,
  rutaPublicacion,
} from "@/lib/ciencia/indice";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const idea = ideaDe(id);
  if (!idea) return { title: "Idea no encontrada · Science Frontier" };
  return {
    title: `${idea.pregunta} · Science Frontier`,
    description: idea.sintesis,
    alternates: { canonical: `${SITE_URL}${rutaIdea(idea.id)}` },
    openGraph: { title: idea.pregunta, description: idea.sintesis, url: `${SITE_URL}${rutaIdea(idea.id)}`, siteName: "VANGUARD", type: "article" },
  };
}

export default async function Page({ params }: Params) {
  const { id } = await params;
  const idea = ideaDe(id);
  if (!idea) notFound();

  const disciplina = disciplinaDe(idea.disciplinaId);
  const pubs = publicacionesDeIdea(idea.id);
  const premios = premiosDeIdea(idea.id);
  const experimentos = experimentosDeIdea(idea.id);
  const divulgacion = divulgacionDeIdea(idea.id);
  const otras = IDEAS.filter((i) => i.id !== idea.id && i.disciplinaId === idea.disciplinaId);
  const conHipotesis = pubs.filter((p) => p.nivel === "hipotesis");
  const citas = pubs.flatMap((p) => p.referencias.filter((r) => idea.publicaciones.includes(r)).map((r) => ({ de: p, a: r })));
  const json = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: idea.pregunta,
    description: idea.sintesis,
    url: `${SITE_URL}${rutaIdea(idea.id)}`,
    numberOfItems: idea.publicaciones.length,
    itemListElement: pubs.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "ScholarlyArticle", name: p.titulo, url: p.original, datePublished: p.fecha },
    })),
  };

  return (
    <MarcoCiencia activa="/ciencia/explorador">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(json) }} />
      <Migas
        pasos={[
          { href: "/ciencia", label: "Science Frontier" },
          { href: "/ciencia/explorador", label: "Explorador" },
          { label: idea.pregunta.length > 52 ? `${idea.pregunta.slice(0, 52)}…` : idea.pregunta },
        ]}
      />

      <p className="vx-sc-volanta" style={{ color: disciplina?.color }}>
        {disciplina ? <Link href={rutaDisciplina(disciplina.id)} style={{ color: "inherit" }}>{disciplina.nombre}</Link> : null} · una idea en evolución
      </p>
      <h1>{idea.pregunta}</h1>
      <div className="vx-sc-sellos" style={{ marginBottom: 12 }}>
        <EstadoIdea estado={idea.estado} />
        <span className="vx-sc-meta">
          {idea.publicaciones.length} publicaciones · {idea.desde}–{idea.hasta}
        </span>
        <span className="vx-sc-meta">{idea.abiertas.length} preguntas abiertas</span>
      </div>
      <p className="vx-sc-sub">{idea.sintesis}</p>

      <div className="vx-sc-ficha-detalle">
        <div>
          <section className="vx-sc-panel" style={{ marginBottom: 12 }}>
            <h2>Estado declarado: {ESTADO_INFO[idea.estado].etiqueta}</h2>
            <p style={{ marginBottom: 6 }}>{idea.estadoDetalle}</p>
            <p className="vx-sc-hueco" style={{ margin: 0 }}>
              {ESTADO_INFO[idea.estado].detalle}
            </p>
            {conHipotesis.length > 0 ? (
              <p className="vx-sc-aviso" style={{ marginTop: 12, marginBottom: 0 }}>
                Ojo: la idea puede estar {idea.estado === "demostrado" ? "demostrada" : "en curso"} y contener pasos que
                fueron hipótesis. En esta línea hay {conHipotesis.length} de esos pasos, marcados uno por uno:
                {conHipotesis.map((p) => ` «${p.titulo}»`).join(" · ")}.
              </p>
            ) : null}
          </section>

          <h2 style={{ fontSize: 19, margin: "18px 0 8px" }}>La secuencia real</h2>
          <LineaEvolucion idea={idea} abierta />

          <section className="vx-sc-panel" style={{ marginTop: 14 }}>
            <h2>Grafo de relaciones verificadas</h2>
            <p className="vx-sc-hueco" style={{ marginBottom: 10 }}>
              {citas.length > 0
                ? `${citas.length} ${citas.length === 1 ? "cita verificada" : "citas verificadas"} entre pasos de esta idea (el DOI aparece en las referencias del registro en Crossref).`
                : "No hay citas verificadas entre los pasos: la línea se ordena por fecha y pertenencia editorial a la misma pregunta, no por citas."}
            </p>
            <Grafo ideaId={idea.id} citas={citas.map((c) => `${c.de.id}>${c.a}`)} />
            <dl className="vx-sc-datos" style={{ marginTop: 10 }}>
              {citas.map((c) => (
                <div key={`${c.de.id}-${c.a}`}>
                  <dt style={{ maxWidth: "55%" }}>
                    {c.de.anio} · {c.de.autores[0]?.nombre ?? c.de.medio}
                  </dt>
                  <dd style={{ maxWidth: "45%" }}>
                    cita a {c.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="vx-sc-panel" style={{ marginTop: 14 }}>
            <h2>Preguntas que siguen abiertas</h2>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.65, color: "#cbd5e1" }}>
              {idea.abiertas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="vx-sc-hueco" style={{ marginTop: 10, marginBottom: 0 }}>
              Estas preguntas son editoriales de VANGUARD y describen el frente de investigación, no una lista oficial
              de problemas abiertos de la disciplina.
            </p>
          </section>
        </div>

        <aside className="vx-sc-lateral">
          <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
            <h2>Pasos, en corto</h2>
            <ol style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, lineHeight: 1.5, color: "#9fb0c4" }}>
              {pubs.map((p) => (
                <li key={p.id} style={{ marginBottom: 5 }}>
                  <time dateTime={p.fecha} style={{ fontFamily: "ui-monospace,monospace", color: "#6d7f94" }}>
                    {p.fecha.slice(0, 4)}
                  </time>{" "}
                  <Link href={rutaPublicacion(p.id)} style={{ color: "#d6dfea", textDecoration: "none" }}>
                    {p.titulo}
                  </Link>
                  <div style={{ marginTop: 2 }}>
                    <SelloTipo tipo={p.tipo} /> <SelloNivel nivel={p.nivel} />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {premios.length > 0 ? (
            <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
              <h2>Premios de esta línea</h2>
              {premios.map((pr) => (
                <div key={pr.id} style={{ marginBottom: 8 }}>
                  <p style={{ margin: 0, color: "#e7eef7", fontSize: 13 }}>
                    <Link href={`/ciencia/premios#${pr.id}`} style={{ color: "#e8c56a" }}>
                      {pr.premio} {pr.anio}
                    </Link>
                  </p>
                  <p style={{ margin: 0, fontSize: 12.5 }}>{pr.laureados.join(", ")}</p>
                </div>
              ))}
            </div>
          ) : null}

          {experimentos.length > 0 ? (
            <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
              <h2>Métodos que la hicieron posible</h2>
              <div className="vx-sc-enlaces">
                {experimentos.map((e) => (
                  <Link key={e.id} href={`/ciencia/experimentos#${e.id}`}>
                    {e.nombre}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {divulgacion.length > 0 ? (
            <div className="vx-sc-panel" style={{ marginBottom: 12 }}>
              <h2>Divulgación (no evidencia)</h2>
              <div className="vx-sc-enlaces">
                {divulgacion.map((d) => (
                  <a key={d.id} href={d.original} target="_blank" rel="noopener noreferrer">
                    {d.medio} ↗
                  </a>
                ))}
              </div>
              <p className="vx-sc-hueco" style={{ marginTop: 8, marginBottom: 0 }}>
                {divulgacion[0]?.cautela}
              </p>
            </div>
          ) : null}

          <div className="vx-sc-panel">
            <h2>Otras ideas de {disciplina?.nombre ?? "la disciplina"}</h2>
            <div className="vx-sc-enlaces">
              {otras.length > 0 ? (
                otras.map((o) => <Link key={o.id} href={rutaIdea(o.id)}>{o.pregunta}</Link>)
              ) : (
                <span className="vx-sc-hueco">Es la única idea de esta disciplina en el índice.</span>
              )}
            </div>
          </div>
        </aside>
      </div>

      <section className="vx-sc-seccion">
        <header>
          <h2>Fichas completas de cada paso</h2>
          <span className="vx-sc-kicker">tipo editorial + nivel de evidencia</span>
        </header>
        <div className="vx-sc-lista">
          {pubs.map((p) => (
            <article className="vx-sc-ficha" key={p.id}>
              <div className="vx-sc-sellos">
                <SelloTipo tipo={p.tipo} />
                <SelloNivel nivel={p.nivel} />
                <span className="vx-sc-meta">
                  <time dateTime={p.fecha}>{fechaLarga(p.fecha)}</time>
                </span>
              </div>
              <h3>
                <Link href={rutaPublicacion(p.id)}>{p.titulo}</Link>
              </h3>
              <p className="vx-sc-orig">{p.tituloOriginal}</p>
              <p>{idea.pasos[p.id]}</p>
              <p className="vx-sc-cautela">Límite: {p.cautela}</p>
              <div className="vx-sc-meta">
                <span>{p.medio}</span>
                <span className="sep">·</span>
                <a href={p.original} target="_blank" rel="noopener noreferrer" style={{ color: "#22d3ee" }}>
                  Original ↗
                </a>
                <span className="sep">·</span>
                <span>{TIPO_INFO[p.tipo].etiqueta}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="vx-sc-seccion">
        <header>
          <h2>Otras ideas para seguir</h2>
          <Link href="/ciencia/explorador">Abrir el explorador →</Link>
        </header>
        <div className="vx-sc-ideas">
          {IDEAS.filter((i) => i.id !== idea.id)
            .slice(0, 2)
            .map((i) => (
              <TarjetaIdea key={i.id} idea={i} />
            ))}
        </div>
      </section>
    </MarcoCiencia>
  );
}

/** Grafo determinista (servidor): una fila por publicación, arcos por cita. */
function Grafo({ ideaId, citas }: { ideaId: string; citas: string[] }) {
  const idea = ideaDe(ideaId);
  if (!idea) return null;
  const pubs = publicacionesDeIdea(idea.id);
  const W = 680;
  const paso = pubs.length > 1 ? (W - 80) / (pubs.length - 1) : 0;
  const pos = new Map(pubs.map((p, i) => [p.id, 40 + i * paso]));
  const y = 70;
  return (
    <svg viewBox={`0 0 ${W} 150`} role="img" aria-label={`Red de citas de la idea: ${idea.pregunta}`} style={{ width: "100%", height: "auto" }}>
      <title>{`${pubs.length} publicaciones y ${citas.length} citas verificadas`}</title>
      <line x1={30} y1={y} x2={W - 30} y2={y} stroke="rgba(148,175,205,.25)" strokeWidth={2} />
      {citas.map((c) => {
        const [de, a] = c.split(">");
        const x1 = pos.get(de);
        const x2 = pos.get(a);
        if (x1 === undefined || x2 === undefined) return null;
        return (
          <path
            key={c}
            d={`M ${x1} ${y} C ${x1} ${y - 46}, ${x2} ${y - 46}, ${x2} ${y}`}
            fill="none"
            stroke="#22d3ee"
            strokeOpacity={0.65}
            strokeWidth={1.4}
          />
        );
      })}
      {pubs.map((p) => {
        const x = pos.get(p.id) ?? 0;
        return (
          <g key={p.id}>
            <circle cx={x} cy={y} r={6} fill={p.nivel === "hipotesis" ? "#fb7185" : "#0b111b"} stroke="#22d3ee" strokeWidth={2} />
            <text x={x} y={y + 26} textAnchor="middle" fill="#9fb0c4" fontSize="11" fontFamily="ui-monospace,monospace">
              {p.anio}
            </text>
            <text x={x} y={y + 42} textAnchor="middle" fill="#6d7f94" fontSize="10">
              {p.tipo === "preprint" ? "preprint" : p.tipo === "revision" ? "revisión" : p.tipo === "divulgacion" ? "divulg." : "artículo"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

