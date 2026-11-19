import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PERIODOS, periodo } from "@/lib/memoria/colecciones";
import { buscarEnArchivo } from "@/lib/memoria/buscar";
import { ACONTECIMIENTOS } from "@/lib/memoria/acontecimientos";
import { SITE_URL } from "@/lib/site";
import { TarjetaDocumento } from "@/components/memoria/tarjeta-documento";

// ═══════════════════════════════════════════════════════════════════
// v419.0 · /memoria/periodo/[slug] — explorar un siglo
//
// La consulta es por años, sin palabra clave: lo que las instituciones
// digitalizan de ese siglo. Wikimedia Commons queda fuera de esta puerta y se
// dice: su buscador no filtra por fecha y sin texto daría resultados al azar.
// ═══════════════════════════════════════════════════════════════════

type Params = { slug: string };

// El archivo se regenera cada hora: las instituciones no cambian de
// licencia a cada minuto y la casa no quiere golpearlas en cada visita.
export const revalidate = 3600;
export function generateStaticParams() {
  return PERIODOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = periodo(slug);
  if (!p) return { title: "Período no encontrado — Archivo de la memoria" };
  return {
    title: `${p.titulo} en documentos — Archivo de la memoria`,
    description: `${p.resumen} Documentos, fotografías y mapas de ${p.desde} a ${p.hasta} con su procedencia y derechos.`,
    alternates: { canonical: `${SITE_URL}/memoria/periodo/${p.slug}` },
  };
}

export default async function PeriodoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = periodo(slug);
  if (!p) notFound();

  const patas = await Promise.all([
    buscarEnArchivo({ q: "", fuente: "loc", tipo: null, desde: p.desde, hasta: p.hasta, limite: 12 }),
    buscarEnArchivo({ q: "", fuente: "ia", tipo: "publicacion", desde: p.desde, hasta: p.hasta, limite: 12 }),
  ]);
  const documentos = patas.flatMap((x) => x.documentos);
  const avisos = patas.flatMap((x) => x.avisos);
  const expedientes = ACONTECIMIENTOS.filter((a) => a.desde <= p.hasta && a.hasta >= p.desde);

  return (
    <main className="vx-mem">
      <div className="vx-mem-caja">
        <header>
          <p className="vx-mem-volanta">Período · {p.desde}–{p.hasta}</p>
          <h1 className="vx-mem-titulo">{p.titulo}</h1>
          <p className="vx-mem-sub">{p.resumen}</p>
        </header>

        {expedientes.length ? (
          <section className="vx-mem-sec">
            <h2>Expedientes de este siglo</h2>
            <div className="vx-mem-rejilla">
              {expedientes.map((a) => (
                <Link key={a.slug} href={`/memoria/acontecimiento/${a.slug}`} className="vx-mem-tarjeta" style={{ padding: 12, gap: 4 }}>
                  <p className="vx-mem-meta">{a.volanta}</p>
                  <h3 style={{ margin: 0, fontSize: 14, color: "#fafafa" }}>{a.titulo}</h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="vx-mem-sec">
          <h2>Lo digitalizado de este siglo</h2>
          <p className="vx-mem-nota">
            Consulta declarada: documentos del Library of Congress y publicaciones del Internet Archive con fecha entre{" "}
            {p.desde} y {p.hasta}, sin palabra clave. Wikimedia Commons no entra: su buscador no filtra por fecha y sin
            texto devolvería cualquier cosa.
          </p>
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
            <p className="vx-mem-nota">
              Las fuentes no devolvieron documentos de este siglo en este momento. Puede ser una caída pasajera: la
              consulta está hecha y el archivo no la sustituye por otra cosa.
            </p>
          )}
        </section>

        <nav className="vx-mem-sec" aria-label="Otros siglos">
          <h2>Otros siglos</h2>
          <div className="vx-mem-fuentes">
            {PERIODOS.filter((o) => o.slug !== p.slug).map((o) => (
              <Link key={o.slug} href={`/memoria/periodo/${o.slug}`} className="vx-mem-fuente" style={{ textDecoration: "none" }}>
                <strong>{o.titulo}</strong>
                {o.desde}–{o.hasta}
              </Link>
            ))}
          </div>
        </nav>

        <div className="vx-mem-pie">
          <p>
            <Link href="/memoria">Portada del archivo</Link> · <Link href="/memoria/buscar">Buscar con palabra clave</Link> ·{" "}
            <Link href="/memoria/fuentes">Fuentes y derechos</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
