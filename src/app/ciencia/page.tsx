// ============================================================
// v421.9 SCIENCE FRONTIER — portada del centro científico.
// No es una colección de artículos divulgativos: es la puerta de un
// sistema de descubrimiento. Buscador real, ideas con estado, tipos
// editoriales separados y enlace a cada publicación original.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import {
  BuscadorCiencia,
  ListaDisciplinas,
  MarcoCiencia,
  Seccion,
  TarjetaIdea,
  TarjetaPublicacion,
} from "@/components/ciencia/piezas";
import {
  CAPTURA,
  DISCIPLINAS,
  ESTADISTICAS,
  ESTADO_INFO,
  EXPERIMENTOS,
  IDEAS,
  INSTITUCIONES,
  NIVEL_INFO,
  PREMIOS,
  PUBLICACIONES,
  TECNOLOGIAS,
  TIPO_INFO,
  VERSION_DATOS,
  fechaLarga,
  rutaBusqueda,
  rutaIdea,
  rutaPublicacion,
  type NivelEvidencia,
  type TipoPublicacion,
} from "@/lib/ciencia/indice";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Science Frontier · el centro científico de VANGUARD",
  description:
    "Buscador de publicaciones científicas con enlace al artículo original, filtros por disciplina, tipo editorial y nivel de evidencia, y un explorador para seguir la evolución de una idea.",
  alternates: { canonical: `${SITE_URL}/ciencia` },
  openGraph: {
    title: "Science Frontier · VANGUARD",
    description:
      "Ciencia rastreada hasta su origen: 42 registros con DOI o arXiv, 9 ideas en evolución y 6 premios documentados.",
    url: `${SITE_URL}/ciencia`,
    siteName: "VANGUARD",
    type: "website",
  },
};

const TIPOS: TipoPublicacion[] = ["articulo", "preprint", "revision", "divulgacion"];
const NIVELES: NivelEvidencia[] = ["medicion", "experimento", "observacional", "inferencia", "hipotesis", "sintesis", "demostracion", "registro"];

export default function Page() {
  const recientes = [...PUBLICACIONES]
    .filter((p) => p.tipo !== "divulgacion")
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 4);
  const ideasDestacadas = ["ondas", "planetas", "corazon"].map((id) => IDEAS.find((i) => i.id === id)).filter((i) => Boolean(i));
  const json = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "VANGUARD Science Frontier",
    url: `${SITE_URL}/ciencia`,
    description:
      "Índice de publicaciones científicas con tipo editorial, nivel de evidencia, enlace original y líneas de evolución entre investigaciones relacionadas.",
    dateModified: CAPTURA,
    inLanguage: "es",
    isBasedOn: ["https://api.crossref.org/", "https://arxiv.org/", "https://www.nobelprize.org/"],
    hasPart: IDEAS.map((i) => ({ "@type": "ItemPage", name: i.pregunta, url: `${SITE_URL}${rutaIdea(i.id)}` })),
  };

  return (
    <MarcoCiencia activa="/ciencia">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(json) }} />

      <p className="vx-sc-volanta">Misión 06 · Centro mundial de ciencia</p>
      <h1>
        Ciencia rastreada
        <br />
        hasta <em>su origen</em>.
      </h1>
      <p className="vx-sc-sub">
        Aquí no se reescribe la ciencia: se indexa. Cada registro es una publicación real —con su DOI o su versión
        en arXiv— clasificada por tipo editorial y por lo que realmente mide. Elige un tema y sigue cómo una pregunta
        se convirtió en medición, en modelo o, todavía, en hipótesis.
      </p>

      <BuscadorCiencia f={{}} />

      <div className="vx-sc-cifras">
        <div>
          <b>{ESTADISTICAS.publicaciones}</b>
          <span>publicaciones</span>
        </div>
        <div>
          <b>{ESTADISTICAS.ideas}</b>
          <span>ideas en evolución</span>
        </div>
        <div>
          <b>{ESTADISTICAS.disciplinas}</b>
          <span>disciplinas</span>
        </div>
        <div>
          <b>
            {ESTADISTICAS.desde}–{ESTADISTICAS.hasta}
          </b>
          <span>años cubiertos</span>
        </div>
        <div>
          <b>{ESTADISTICAS.premios}</b>
          <span>premios documentados</span>
        </div>
      </div>

      <Seccion titulo="Cómo leer esta casa" kicker="La frontera entre tipos y evidencias">
        <div className="vx-sc-lista doble">
          <div className="vx-sc-panel">
            <h2>Tipo editorial</h2>
            <dl className="vx-sc-datos lista">
              {TIPOS.map((t) => (
                <div key={t}>
                  <dt style={{ color: TIPO_INFO[t].color }}>{TIPO_INFO[t].etiqueta}</dt>
                  <dd>{TIPO_INFO[t].detalle}</dd>
                </div>
              ))}
            </dl>
            <p className="vx-sc-hueco" style={{ marginTop: 10 }}>
              Un DOI acredita que el artículo está registrado, no que su hallazgo sea cierto. Aquí nunca se dice
              «revisado por pares» por el nombre de la revista: se declara el régimen de arbitraje del registro.
            </p>
          </div>
          <div className="vx-sc-panel">
            <h2>Nivel de evidencia</h2>
            <dl className="vx-sc-datos lista">
              {NIVELES.map((n) => (
                <div key={n}>
                  <dt style={{ color: n === "hipotesis" ? "#fb7185" : "#cbd5e1" }}>{NIVEL_INFO[n].etiqueta}</dt>
                  <dd>{NIVEL_INFO[n].detalle}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="vx-sc-panel" style={{ marginTop: 10 }}>
          <h2>Estado de una idea</h2>
          <dl className="vx-sc-datos lista">
            {(Object.keys(ESTADO_INFO) as (keyof typeof ESTADO_INFO)[]).map((k) => (
              <div key={k}>
                <dt style={{ color: ESTADO_INFO[k].color }}>{ESTADO_INFO[k].etiqueta}</dt>
                <dd>{ESTADO_INFO[k].detalle}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Seccion>

      <Seccion titulo="Explora una idea" kicker="El descubrimiento, paso a paso" href="/ciencia/explorador">
        <p className="vx-sc-sub" style={{ marginTop: 0 }}>
          Nueve preguntas abiertas hace décadas o siglos, con la secuencia real de publicaciones que las movieron.
        </p>
        <div className="vx-sc-ideas">
          {IDEAS.slice(0, 6).map((i) => (
            <TarjetaIdea key={i.id} idea={i} />
          ))}
        </div>
        <p style={{ marginTop: 12 }}>
          <Link className="vx-sc-boton secundario" href="/ciencia/explorador">
            Abrir el explorador de descubrimientos →
          </Link>
        </p>
      </Seccion>

      <Seccion titulo="Ideas destacadas" kicker="Tres formas distintas de saber">
        <div className="vx-sc-lista">
          {ideasDestacadas.map((i) => (
            <article className="vx-sc-panel" key={i!.id}>
              <div className="vx-sc-sellos" style={{ marginBottom: 6 }}>
                <span className="vx-sc-kicker">{i!.desde}–{i!.hasta}</span>
                <span className="vx-sc-estado" style={{ color: ESTADO_INFO[i!.estado].color }}>
                  {ESTADO_INFO[i!.estado].etiqueta}
                </span>
              </div>
              <h2 style={{ fontSize: 18, marginBottom: 6 }}>
                <Link href={rutaIdea(i!.id)}>{i!.pregunta}</Link>
              </h2>
              <p>{i!.sintesis}</p>
              <p className="vx-sc-meta" style={{ margin: 0 }}>
                {i!.publicaciones.length} publicaciones · {i!.abiertas.length} preguntas abiertas ·{" "}
                <Link href={rutaIdea(i!.id)}>ver la evolución</Link>
              </p>
            </article>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Publicaciones recientes del índice" kicker="Ordenadas por fecha de publicación" href={rutaBusqueda({ orden: "reciente" })}>
        <div className="vx-sc-lista">
          {recientes.map((p) => (
            <div key={p.id} style={{ marginBottom: 2 }}>
              <div className="vx-sc-meta" style={{ marginBottom: 4 }}>
                <time dateTime={p.fecha}>{fechaLarga(p.fecha)}</time>
                <span className="sep">·</span>
                <span>{p.medio}</span>
                <span className="sep">·</span>
                <Link href={rutaPublicacion(p.id)}>{p.titulo}</Link>
              </div>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Disciplinas" kicker="Seis maneras de ordenar el conocimiento" href="/ciencia/buscar">
        <ListaDisciplinas compacta />
      </Seccion>

      <Seccion titulo="Catálogos del centro" kicker="Instituciones, premios, experimentos y tecnología">
        <div className="vx-sc-cifras" style={{ gridTemplateColumns: "repeat(2, minmax(0,1fr))" }}>
          <div>
            <b>{INSTITUCIONES.length}</b>
            <span>
              <Link href="/ciencia/instituciones">instituciones (con su URL comprobada)</Link>
            </span>
          </div>
          <div>
            <b>{EXPERIMENTOS.length}</b>
            <span>
              <Link href="/ciencia/experimentos">experimentos históricos</Link>
            </span>
          </div>
          <div>
            <b>{PREMIOS.length}</b>
            <span>
              <Link href="/ciencia/premios">premios con motivación literal</Link>
            </span>
          </div>
          <div>
            <b>{TECNOLOGIAS.length}</b>
            <span>
              <Link href="/ciencia/tecnologia">avances tecnológicos</Link>
            </span>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Una publicación, en detalle" kicker="Así es una ficha del centro">
        <TarjetaPublicacion p={PUBLICACIONES.find((p) => p.id === "ondas-ns") ?? PUBLICACIONES[0]} />
      </Seccion>

      <p className="vx-sc-pie" style={{ borderTop: 0, marginTop: 10 }}>
        Índice {VERSION_DATOS} · captura {CAPTURA} · {DISCIPLINAS.length} disciplinas ·{" "}
        <Link href="/ciencia/metodo">método y procedencia completos</Link>
      </p>
    </MarcoCiencia>
  );
}
