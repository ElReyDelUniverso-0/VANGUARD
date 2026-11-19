// ============================================================
// v421.9 DISCIPLINA — investigaciones ordenadas por fecha.
// Agrupa las ideas de la disciplina y publica la lista completa de
// registros por año, con tipo editorial y nivel de evidencia a la vista.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarcoCiencia, Migas, TarjetaIdea, TarjetaPublicacion } from "@/components/ciencia/piezas";
import {
  DISCIPLINAS,
  disciplinaDe,
  ideasDeDisciplina,
  publicacionesDeDisciplina,
  rutaBusqueda,
  rutaDisciplina,
} from "@/lib/ciencia/indice";
import { SITE_URL } from "@/lib/site";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return DISCIPLINAS.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const d = disciplinaDe(id);
  if (!d) return { title: "Disciplina no encontrada · Science Frontier" };
  return {
    title: `${d.nombre} · Science Frontier`,
    description: d.descripcion,
    alternates: { canonical: `${SITE_URL}${rutaDisciplina(d.id)}` },
  };
}

export default async function Page({ params }: Params) {
  const { id } = await params;
  const d = disciplinaDe(id);
  if (!d) notFound();

  const ideas = ideasDeDisciplina(d.id);
  const pubs = [...publicacionesDeDisciplina(d.id)].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const porAnio = new Map<number, typeof pubs>();
  for (const p of pubs) {
    const lista = porAnio.get(p.anio) ?? [];
    lista.push(p);
    porAnio.set(p.anio, lista);
  }
  const anios = [...porAnio.keys()].sort((a, b) => b - a);
  const revistas = [...new Set(pubs.filter((p) => p.tipo === "articulo").map((p) => p.medio))];

  return (
    <MarcoCiencia activa="/ciencia/buscar">
      <Migas pasos={[{ href: "/ciencia", label: "Science Frontier" }, { label: d.nombre }]} />
      <p className="vx-sc-volanta" style={{ color: d.color }}>
        Disciplina
      </p>
      <h1>{d.nombre}</h1>
      <p className="vx-sc-sub">{d.descripcion}</p>

      <div className="vx-sc-acciones">
        <Link className="vx-sc-boton secundario" href={rutaBusqueda({ disciplina: d.id, orden: "antigua" })}>
          Ver en el buscador (más antigua primero)
        </Link>
        <span className="vx-sc-meta">
          {pubs.length} publicaciones · {anios.length} años distintos · {revistas.length} revistas
        </span>
      </div>

      <section className="vx-sc-seccion">
        <header>
          <h2>Ideas de la disciplina</h2>
          <span className="vx-sc-kicker">preguntas con su estado declarado</span>
        </header>
        <div className="vx-sc-ideas">
          {ideas.map((i) => (
            <TarjetaIdea key={i.id} idea={i} />
          ))}
        </div>
      </section>

      <section className="vx-sc-seccion">
        <header>
          <h2>Publicaciones por fecha</h2>
          <span className="vx-sc-kicker">de la más reciente a la más antigua</span>
        </header>
        {anios.map((a) => (
          <div className="vx-sc-anio" key={a}>
            <b>{a}</b>
            <ul>
              {(porAnio.get(a) ?? []).map((p) => (
                <li key={p.id}>
                  <time dateTime={p.fecha}>{p.fecha.slice(5)}</time>
                  <Link href={`/ciencia/publicacion/${p.id}`}>{p.titulo}</Link>{" "}
                  <span className="vx-sc-hueco">
                    · {p.medio} · {p.tipo === "preprint" ? "prepublicación" : p.tipo === "revision" ? "revisión" : p.tipo === "divulgacion" ? "divulgación" : "artículo"} ·{" "}
                    {p.nivelEtiqueta}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="vx-sc-seccion">
        <header>
          <h2>Fichas</h2>
          <span className="vx-sc-kicker">la lectura de VANGUARD y su límite</span>
        </header>
        <div className="vx-sc-lista doble">
          {pubs.map((p) => (
            <TarjetaPublicacion key={p.id} p={p} />
          ))}
        </div>
      </section>
    </MarcoCiencia>
  );
}
