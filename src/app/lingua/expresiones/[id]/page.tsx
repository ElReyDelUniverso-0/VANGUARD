// v420.0 VANGUARD LINGUA — una expresión en todas las lenguas registradas.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Migas } from "@/components/lingua/piezas";
import { expresionPorId, expresiones, glottoDeCodigo, lenguaPorId, nombreCodigo, nombreDe } from "@/lib/lingua/servidor";
import { MACROAREAS_ES, RUTAS_LINGUA, rutaExpresion, rutaIdioma } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export function generateStaticParams() {
  return expresiones().map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const e = expresionPorId(id);
  if (!e) return { title: "Expresiones · Lingua · VANGUARD" };
  return {
    title: `Cómo se dice «${e.es}» en ${Object.keys(e.t).length} lenguas · Lingua · VANGUARD`,
    description: `«${e.es}» en ${Object.keys(e.t).length} lenguas, con transliteración y notas de uso, según Wiktionary.`,
    alternates: { canonical: `${SITE_URL}${rutaExpresion(id)}` },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const e = expresionPorId(id);
  if (!e) notFound();
  const macro = typeof sp.macro === "string" ? sp.macro : "";
  const filas = Object.entries(e.t)
    .map(([code, t]) => {
      const g = glottoDeCodigo(code);
      const l = g ? lenguaPorId(g) : undefined;
      return { code, t, l, nombre: nombreCodigo(code) };
    })
    .filter((f) => !macro || f.l?.macro === macro)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const conNotas = filas.filter((f) => f.t.some((x) => x[2])).length;
  const otras = expresiones().filter((x) => x.categoria === e.categoria && x.id !== e.id);
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.expresiones}
      titulo={`«${e.es}» en ${Object.keys(e.t).length} lenguas`}
      sub={
        <>
          Traducciones del sentido «{e.glosa || e.pagina}» de la entrada inglesa{" "}
          <a href={e.fuente} target="_blank" rel="noopener noreferrer">
            {e.pagina}
          </a>{" "}
          en Wiktionary (revisión {e.revision}). {conNotas ? `${conNotas} lenguas tienen notas de uso: léelas antes de usar la expresión.` : ""}
        </>
      }
      fuente={<>Wiktionary en inglés · tablas de traducción · CC BY-SA 4.0</>}
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { href: RUTAS_LINGUA.expresiones, label: "Expresiones" }, { label: e.es }]} />
      <ul className="vx-li-chips" style={{ marginBottom: 12 }}>
        <li>
          <Link href={rutaExpresion(e.id)} aria-current={!macro ? "true" : undefined}>
            Todas
          </Link>
        </li>
        {Object.entries(MACROAREAS_ES).map(([k, v]) => (
          <li key={k}>
            <Link href={`${rutaExpresion(e.id)}?macro=${encodeURIComponent(k)}`} aria-current={macro === k ? "true" : undefined}>
              {v}
            </Link>
          </li>
        ))}
      </ul>
      <div className="vx-li-tabla-caja">
        <table className="vx-li-tabla">
          <thead>
            <tr>
              <th>Lengua</th>
              <th>Expresión</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.code}>
                <td>
                  {f.l ? <Link href={rutaIdioma(f.l.id)}>{f.nombre}</Link> : f.nombre}
                  <small>{f.l?.familia ? nombreDe(f.l.familia) : f.l?.aislada ? "lengua aislada" : f.code}</small>
                </td>
                <td>
                  {f.t.map(([w, tr, nota], i) => (
                    <span key={i} style={{ display: "block" }}>
                      <span className="vx-li-palabra" lang={f.code}>
                        {w}
                      </span>
                      {tr ? <span className="vx-li-tr"> ({tr})</span> : null}
                      {nota ? <span className="vx-li-calif">{nota}</span> : null}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {otras.length ? (
        <section className="vx-li-seccion">
          <h2>Más expresiones</h2>
          <ul className="vx-li-chips">
            {otras.map((o) => (
              <li key={o.id}>
                <Link href={rutaExpresion(o.id)}>{o.es}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </MarcoLingua>
  );
}
