import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { acontecimientosQueLoCitan, documentosVecinos, obtenerDocumento, relacionados } from "@/lib/memoria/documento";
import { CLAVE_TIPO, fechaLegible, type FuenteId } from "@/lib/memoria/tipos";
import { veredicto } from "@/lib/memoria/derechos";
import { fuente as datosFuente } from "@/lib/memoria/fuentes";
import { SITE_URL } from "@/lib/site";
import { SelloDerechos, TarjetaDocumento } from "@/components/memoria/tarjeta-documento";
import { VisorDocumento } from "@/components/memoria/visor-documento";

// ═══════════════════════════════════════════════════════════════════
// v419.0 · /memoria/documento/[fuente]/[id] — la ficha y el visor
//
// La ficha de procedencia responde a las preguntas que un archivo debe
// responder: de quién es el original, quién lo custodia, qué fecha tiene,
// qué derechos declara la institución y qué no sabemos. Y alrededor, las
// referencias cruzadas: en qué expedientes se cita y qué hay al lado.
// ═══════════════════════════════════════════════════════════════════

type Params = { fuente: string; id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { fuente, id } = await params;
  const ficha = await obtenerDocumento(fuente, decodeURIComponent(id));
  if (!ficha) {
    return { title: "Documento no disponible — Archivo de la memoria", robots: { index: false, follow: true } };
  }
  const descripcion = `${CLAVE_TIPO[ficha.tipo]} · ${fechaLegible(ficha.fecha)} · ${ficha.institucion ?? datosFuente(ficha.fuente).nombre}. Procedencia y estado de derechos en la ficha.`;
  return {
    title: `${ficha.titulo} — Archivo de la memoria`,
    description: descripcion.slice(0, 300),
    alternates: { canonical: `${SITE_URL}/memoria/documento/${fuente}/${encodeURIComponent(ficha.id)}` },
    openGraph: {
      title: ficha.titulo,
      description: descripcion.slice(0, 300),
      url: `${SITE_URL}/memoria/documento/${fuente}/${encodeURIComponent(ficha.id)}`,
      type: "article",
      images: ficha.imagen ? [{ url: ficha.imagen }] : undefined,
    },
  };
}

export default async function DocumentoMemoriaPage({ params }: { params: Promise<Params> }) {
  const { fuente: fuenteParam, id: idParam } = await params;
  const id = decodeURIComponent(idParam);
  const ficha = await obtenerDocumento(fuenteParam, id);
  if (!ficha) notFound();

  const v = veredicto(ficha.derechos);
  const datos = datosFuente(ficha.fuente);
  const citadoEn = acontecimientosQueLoCitan(ficha.fuente as FuenteId, ficha.id);
  const vecinos = documentosVecinos(ficha.fuente as FuenteId, ficha.id);
  const cerca = await relacionados(ficha, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: ficha.titulo,
    ...(ficha.autor ? { creator: ficha.autor } : {}),
    ...(ficha.fecha ? { dateCreated: ficha.fecha } : {}),
    ...(ficha.descripcion ? { description: ficha.descripcion } : {}),
    ...(ficha.imagen ? { image: ficha.imagen } : {}),
    url: `${SITE_URL}/memoria/documento/${ficha.fuente}/${encodeURIComponent(ficha.id)}`,
    isBasedOn: ficha.urlOriginal,
    provider: { "@type": "Organization", name: ficha.institucion ?? datos.nombre, url: datos.url },
    ...(ficha.licencia ? { license: ficha.urlOriginal } : {}),
  };

  return (
    <main className="vx-mem">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="vx-mem-caja">
        <header>
          <p className="vx-mem-volanta">
            {datos.nombre} · {CLAVE_TIPO[ficha.tipo]} · clave <code>{ficha.clave}</code>
          </p>
          <h1 className="vx-mem-titulo" style={{ fontSize: "clamp(22px, 3.2vw, 34px)" }}>
            {ficha.titulo}
          </h1>
          <p className="vx-mem-sub" style={{ marginBottom: 14 }}>
            {fechaLegible(ficha.fecha)} · {ficha.autor ?? "autor sin declarar en la fuente"}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <SelloDerechos estado={ficha.derechos} />
            <a className="vx-mem-boton vx-mem-boton--fantasma" href={ficha.urlOriginal} target="_blank" rel="noopener noreferrer">
              Ver en la institución ↗
            </a>
            <Link className="vx-mem-boton vx-mem-boton--fantasma" href={`/memoria/comparar?a=${ficha.fuente}:${encodeURIComponent(ficha.id)}`}>
              Comparar con otro
            </Link>
          </div>
        </header>

        <section className="vx-mem-sec vx-mem-ficha">
          <div>
            {ficha.paginas.length ? (
              <VisorDocumento paginas={ficha.paginas} titulo={ficha.titulo} />
            ) : (
              <div className="vx-mem-pieza">
                <h2 style={{ margin: 0, fontSize: 14, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e8c56a" }}>
                  Sin visor para esta pieza
                </h2>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#d4d4d8" }}>
                  {v.imagenPermitida
                    ? "La fuente no ofrece imágenes digitalizadas de esta pieza: solo la ficha. El registro completo está en la institución."
                    : `${v.etiqueta}: ${v.explicacion} Por eso el archivo no publica la imagen y sí el registro y el enlace.`}
                </p>
                <a className="vx-mem-enlace" href={ficha.urlOriginal} target="_blank" rel="noopener noreferrer">
                  Consultar el original en {datos.nombre} ↗
                </a>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div className="vx-mem-datos">
              <div>
                <span className="vx-mem-etq">Institución</span>
                <span>{ficha.institucion ?? datos.nombre}</span>
              </div>
              <div>
                <span className="vx-mem-etq">Fuente consultada</span>
                <span>
                  <a className="vx-mem-enlace" href={datos.url} target="_blank" rel="noopener noreferrer">
                    {datos.nombre} ↗
                  </a>
                </span>
              </div>
              <div>
                <span className="vx-mem-etq">Fecha</span>
                <span>{fechaLegible(ficha.fecha)}</span>
              </div>
              <div>
                <span className="vx-mem-etq">Autor</span>
                <span>{ficha.autor ?? "sin dato en la fuente"}</span>
              </div>
              <div>
                <span className="vx-mem-etq">Tipo</span>
                <span>{CLAVE_TIPO[ficha.tipo]}</span>
              </div>
              <div>
                <span className="vx-mem-etq">Derechos</span>
                <span>
                  {ficha.derechosTexto ?? "la fuente no declara derechos"} — {v.etiqueta}
                </span>
              </div>
              <div>
                <span className="vx-mem-etq">Licencia</span>
                <span>{ficha.licencia ?? "sin licencia declarada"}</span>
              </div>
              <div>
                <span className="vx-mem-etq">Caras digitalizadas</span>
                <span>{ficha.paginas.length || "ninguna ofrecida por la fuente"}</span>
              </div>
              <div>
                <span className="vx-mem-etq">Clave del archivo</span>
                <span>
                  <code>{ficha.clave}</code>
                </span>
              </div>
            </div>

            <div className="vx-mem-pieza">
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#d4d4d8" }}>
                <strong style={{ color: "#fafafa" }}>{v.etiqueta}.</strong> {v.explicacion}
              </p>
              {ficha.limites.length ? (
                <>
                  <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a1a1aa" }}>
                    Lo que este documento no dice
                  </p>
                  <ul className="vx-mem-lista">
                    {ficha.limites.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>

            {ficha.descripcion ? (
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a1a1aa" }}>
                  Descripción de la fuente
                </p>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#d4d4d8" }}>{ficha.descripcion}</p>
              </div>
            ) : null}

            {ficha.notas.length ? (
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a1a1aa" }}>
                  Notas de la institución
                </p>
                <ul className="vx-mem-lista">
                  {ficha.notas.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {ficha.materias.length ? (
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a1a1aa" }}>
                  Materias declaradas
                </p>
                <p className="vx-mem-meta">{ficha.materias.join(" · ")}</p>
              </div>
            ) : null}
          </div>
        </section>

        {citadoEn.length ? (
          <section className="vx-mem-sec">
            <h2>Referencia cruzada · expedientes que lo citan</h2>
            <p className="vx-mem-nota">Este documento no está suelto: forma parte de los siguientes expedientes del archivo, con el papel que juega en cada uno.</p>
            <div className="vx-mem-rejilla">
              {citadoEn.map((c) => (
                <Link key={c.slug} href={`/memoria/acontecimiento/${c.slug}`} className="vx-mem-tarjeta" style={{ padding: 14, gap: 6 }}>
                  <p className="vx-mem-meta">{c.volanta}</p>
                  <h3 style={{ margin: 0, fontSize: 15, color: "#fafafa" }}>{c.titulo}</h3>
                  {c.papel ? <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "#a1a1aa" }}>{c.papel}</p> : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {vecinos.length ? (
          <section className="vx-mem-sec">
            <h2>En el mismo expediente</h2>
            <p className="vx-mem-nota">Otras piezas fijadas de los expedientes donde aparece este documento.</p>
            <div className="vx-mem-rejilla">
              {vecinos.map((n) => (
                <Link key={`${n.fuente}-${n.id}`} href={`/memoria/documento/${n.fuente}/${encodeURIComponent(n.id)}`} className="vx-mem-tarjeta" style={{ padding: 14, gap: 6 }}>
                  <p className="vx-mem-meta">{n.titulo}</p>
                  <h3 style={{ margin: 0, fontSize: 14, color: "#fafafa" }}>{n.papel}</h3>
                  <span className="vx-mem-enlace" style={{ marginTop: "auto" }}>
                    Abrir la ficha →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {cerca.length ? (
          <section className="vx-mem-sec">
            <h2>Alrededor · misma fuente, año próximo</h2>
            <p className="vx-mem-nota">
              Consulta declarada: el autor (o la primera materia, o las primeras palabras del título) y el mismo año ±1 en{" "}
              {datos.nombre}. No es una recomendación editorial: es la misma institución con un criterio escrito.
            </p>
            <div className="vx-mem-rejilla">
              {cerca.map((d) => (
                <TarjetaDocumento key={d.clave} documento={d} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="vx-mem-pie">
          <p>
            Ficha generada con los datos que {datos.nombre} publica en el momento de la consulta. Si la institución
            cambia el registro, esta ficha cambia con ella.{" "}
            <Link href="/memoria/buscar">Volver al buscador</Link> · <Link href="/memoria/fuentes">Fuentes y derechos</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
