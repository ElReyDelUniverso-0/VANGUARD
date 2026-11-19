import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COLECCIONES_MEMORIA, coleccion } from "@/lib/memoria/colecciones";
import { buscarEnArchivo } from "@/lib/memoria/buscar";
import { obtenerDocumento } from "@/lib/memoria/documento";
import { fuente as datosFuente } from "@/lib/memoria/fuentes";
import { SITE_URL } from "@/lib/site";
import { TarjetaDocumento } from "@/components/memoria/tarjeta-documento";

// ═══════════════════════════════════════════════════════════════════
// v419.0 · /memoria/coleccion/[slug] — una colección es una consulta
//
// Se declara la consulta (texto, tipo, años, fuentes) y se enseña lo que
// devuelve hoy. Las piezas fijadas, si las hay, van primero y con su papel.
// ═══════════════════════════════════════════════════════════════════

type Params = { slug: string };

// El archivo se regenera cada hora: las instituciones no cambian de
// licencia a cada minuto y la casa no quiere golpearlas en cada visita.
export const revalidate = 3600;
export function generateStaticParams() {
  return COLECCIONES_MEMORIA.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = coleccion(slug);
  if (!c) return { title: "Colección no encontrada — Archivo de la memoria" };
  return {
    title: `${c.titulo} — colección del archivo`,
    description: `${c.pregunta} ${c.intro}`.slice(0, 300),
    alternates: { canonical: `${SITE_URL}/memoria/coleccion/${c.slug}` },
  };
}

export default async function ColeccionPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const c = coleccion(slug);
  if (!c) notFound();

  const fijadas = await Promise.all((c.piezas ?? []).map(async (p) => ({ ...p, ficha: await obtenerDocumento(p.fuente, p.id) })));
  const cosechas = await Promise.all(
    c.fuentes.map((f) =>
      buscarEnArchivo({ q: c.q, fuente: f, tipo: c.tipo, desde: c.desde, hasta: c.hasta, limite: 8 })
    )
  );
  const documentos = cosechas
    .flatMap((x) => x.documentos)
    .filter((d, i, arr) => arr.findIndex((o) => o.clave === d.clave) === i)
    .slice(0, 18);
  const avisos = cosechas.flatMap((x) => x.avisos);

  return (
    <main className="vx-mem">
      <div className="vx-mem-caja">
        <header>
          <p className="vx-mem-volanta">Colección · {c.pregunta}</p>
          <h1 className="vx-mem-titulo">{c.titulo}</h1>
          <p className="vx-mem-sub">{c.intro}</p>
          <p className="vx-mem-meta">
            Consulta: «{c.q}» · {c.tipo ?? "todos los tipos"} · {c.desde ?? "sin límite"}–{c.hasta ?? "hoy"} ·{" "}
            {c.fuentes.map((f) => datosFuente(f).nombre).join(" + ")}
          </p>
        </header>

        {fijadas.length ? (
          <section className="vx-mem-sec">
            <h2>Piezas que anclan la colección</h2>
            <p className="vx-mem-nota">Elegidas a mano por su valor documental, no por el orden en que aparecen en el buscador.</p>
            <div className="vx-mem-rejilla vx-mem-rejilla--ancha">
              {fijadas.map((p) => (
                <div key={`${p.fuente}-${p.id}`} className="vx-mem-pieza">
                  <p className="vx-mem-pieza__papel">{p.papel}</p>
                  {p.ficha ? <TarjetaDocumento documento={p.ficha} /> : <p className="vx-mem-pieza__no">La fuente no devolvió esta pieza ahora mismo.</p>}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="vx-mem-sec">
          <h2>Lo que devuelven las fuentes</h2>
          <p className="vx-mem-nota">{c.nota}</p>
          {avisos.length ? (
            <ul className="vx-mem-avisos">
              {avisos.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          ) : null}
          {documentos.length ? (
            <div className="vx-mem-rejilla">
              {documentos.map((d) => (
                <TarjetaDocumento key={d.clave} documento={d} />
              ))}
            </div>
          ) : (
            <p className="vx-mem-nota">Ninguna fuente devolvió documentos con estos criterios en este momento.</p>
          )}
        </section>

        <section className="vx-mem-sec">
          <div className="vx-mem-pieza">
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e8c56a" }}>
              Qué no hay en esta colección
            </p>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#d4d4d8" }}>{c.noEsta}</p>
          </div>
        </section>

        <nav className="vx-mem-sec" aria-label="Otras colecciones">
          <h2>Otras colecciones</h2>
          <div className="vx-mem-rejilla">
            {COLECCIONES_MEMORIA.filter((o) => o.slug !== c.slug).map((o) => (
              <Link key={o.slug} href={`/memoria/coleccion/${o.slug}`} className="vx-mem-tarjeta" style={{ padding: 12, gap: 4 }}>
                <h3 style={{ margin: 0, fontSize: 14, color: "#fafafa" }}>{o.titulo}</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#a1a1aa" }}>{o.pregunta}</p>
              </Link>
            ))}
          </div>
        </nav>

        <div className="vx-mem-pie">
          <p>
            <Link href="/memoria">Portada del archivo</Link> · <Link href="/memoria/buscar">Buscar</Link> ·{" "}
            <Link href="/memoria/fuentes">Fuentes y derechos</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
