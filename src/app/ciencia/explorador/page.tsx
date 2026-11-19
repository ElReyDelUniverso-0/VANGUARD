import type { Metadata } from "next";
import Link from "next/link";
import { MarcoCiencia, Migas } from "@/components/ciencia/piezas";
import { ExploradorDescubrimientos } from "@/components/ciencia/explorador";
import { IDEAS, PUBLICACIONES, rutaPublicacion } from "@/lib/ciencia/indice";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Explorador de descubrimientos · Science Frontier",
  description:
    "Elige un tema y sigue paso a paso cómo una idea científica pasó de la pregunta a la medición: qué añadió cada publicación y qué no demuestra.",
  alternates: { canonical: `${SITE_URL}/ciencia/explorador` },
};

/** Se envía al navegador solo lo que el explorador pinta. */
function compacta() {
  return PUBLICACIONES.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    tituloOriginal: p.tituloOriginal,
    ideaId: p.ideaId,
    disciplinaId: p.disciplinaId,
    fecha: p.fecha,
    anio: p.anio,
    medio: p.medio,
    tipo: p.tipo,
    arbitraje: p.arbitraje,
    nivel: p.nivel,
    nivelEtiqueta: p.nivelEtiqueta,
    lectura: p.lectura,
    cautela: p.cautela,
    original: p.original,
    identificador: p.identificador,
    idTipo: p.idTipo,
    metadatos: p.metadatos,
    sha256: p.sha256,
    autores: p.autores.slice(0, 6),
    totalAutores: p.totalAutores,
    resumenOriginal: null,
    versionDe: p.versionDe,
    referencias: p.referencias,
    citadaPor: p.citadaPor,
    relacionadas: p.relacionadas,
  }));
}

export default function Page() {
  return (
    <MarcoCiencia activa="/ciencia/explorador">
      <Migas pasos={[{ href: "/ciencia", label: "Science Frontier" }, { label: "Explorador de descubrimientos" }]} />
      <p className="vx-sc-volanta">La experiencia central</p>
      <h1>
        Una pregunta.
        <br />
        <em>Todos sus pasos.</em>
      </h1>
      <p className="vx-sc-sub">
        Elige un tema a la izquierda, recorre las publicaciones en orden y lee, en cada una, qué añadió y qué no
        demuestra. Los pasos son registros reales: si un paso fue una hipótesis, aparece marcado como hipótesis aunque
        la pregunta ya esté resuelta.
      </p>
      <ExploradorDescubrimientos ideas={IDEAS} publicaciones={compacta()} />
      <div className="vx-sc-panel" style={{ marginTop: 16 }}>
        <h2>Sin JavaScript</h2>
        <p style={{ marginBottom: 6 }}>
          La misma información está en páginas indexables. Cada idea tiene su línea completa y cada paso su ficha:
        </p>
        <div className="vx-sc-meta" style={{ flexWrap: "wrap", gap: 10 }}>
          {IDEAS.slice(0, 4).map((i) => (
            <Link key={i.id} href={`/ciencia/idea/${i.id}`} style={{ color: "#22d3ee" }}>
              {i.pregunta}
            </Link>
          ))}
        </div>
        <p style={{ marginTop: 8, marginBottom: 0 }}>
          <Link href={rutaPublicacion("ondas-bh")} style={{ color: "#22d3ee" }}>
            Ejemplo de ficha de publicación →
          </Link>
        </p>
      </div>
    </MarcoCiencia>
  );
}
