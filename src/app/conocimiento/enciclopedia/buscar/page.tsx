// v417.0 VANGUARD KNOWLEDGE — búsqueda temática en la Enciclopedia.
// Funciona sin JavaScript (formulario GET); los resultados no se indexan.
import type { Metadata } from "next";
import Link from "next/link";
import { Marco } from "@/components/planeta/marco";
import { Buscador, Migas } from "@/components/enciclopedia/piezas";
import { BASE_ENCICLOPEDIA, CATEGORIAS, buscarArticulos, categoriaDe, rutaArticulo, rutaCategoria } from "@/lib/enciclopedia/indice";
import { filtrarConceptos } from "@/lib/conocimiento/indice";

export const metadata: Metadata = {
  title: "Buscar en la enciclopedia · VANGUARD",
  robots: { index: false, follow: true },
};

const SUGERENCIAS = ["taínos", "monzón", "Hammurabi", "blanqueamiento", "Tratado Antártico", "brecha digital", "Köppen", "Consejo de Seguridad"];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").slice(0, 80).trim();
  const res = q ? buscarArticulos(q) : [];
  const conceptos = q ? filtrarConceptos(q).slice(0, 8) : [];
  return (
    <Marco
      ruta={`${BASE_ENCICLOPEDIA}/buscar`}
      activo="/conocimiento"
      volanta="Enciclopedia · Búsqueda temática"
      titulo={q ? `«${q}»` : "Buscar"}
      sub={q ? `${res.length} ${res.length === 1 ? "artículo" : "artículos"} y ${conceptos.length} conceptos breves.` : "Busca por tema, lugar, persona, época o concepto."}
    >
      <Migas pasos={[{ href: "/conocimiento", label: "Conocimiento" }, { href: BASE_ENCICLOPEDIA, label: "Enciclopedia" }, { label: "Buscar" }]} />
      <Buscador q={q} autoFocus={!q} />

      {q && res.length === 0 && conceptos.length === 0 ? (
        <p className="vx-pl-vacio" style={{ marginTop: 14 }}>
          Sin resultados para «{q}». Prueba con un término más general o explora por categorías.
        </p>
      ) : null}

      {res.length ? (
        <section className="vx-en-bloque" aria-label="Artículos">
          <h2>Artículos de la enciclopedia</h2>
          {res.map(({ articulo: a, extracto }) => {
            const c = categoriaDe(a.categoria);
            return (
              <div key={a.slug} className="vx-en-resultado">
                <h3>
                  <Link href={rutaArticulo(a.slug)}>{a.titulo}</Link>
                </h3>
                <p style={{ fontSize: 12, color: c?.color, margin: "0 0 4px" }}>{c?.nombre}</p>
                <p>{extracto}</p>
              </div>
            );
          })}
        </section>
      ) : null}

      {conceptos.length ? (
        <section className="vx-en-bloque" aria-label="Conceptos">
          <h2>Conceptos breves</h2>
          <p className="vx-en-nota">Expedientes cortos del explorador de conocimiento.</p>
          <div>
            {conceptos.map((c) => (
              <Link key={c.id} href={`/conocimiento/tema/${c.id}`} className="vx-pl-chip">
                {c.titulo}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="vx-en-bloque" aria-label="Sugerencias">
        <h2>{q ? "Otras búsquedas" : "Prueba con"}</h2>
        <div>
          {SUGERENCIAS.map((s) => (
            <Link key={s} href={`${BASE_ENCICLOPEDIA}/buscar?q=${encodeURIComponent(s)}`} className="vx-pl-chip">
              {s}
            </Link>
          ))}
        </div>
        <h2 style={{ marginTop: 18 }}>O explora por categorías</h2>
        <div>
          {CATEGORIAS.map((c) => (
            <Link key={c.id} href={rutaCategoria(c.id)} className="vx-pl-chip" style={{ borderColor: c.color }}>
              {c.nombre}
            </Link>
          ))}
        </div>
      </section>
    </Marco>
  );
}
