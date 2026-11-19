import type { Metadata } from "next";
import Link from "next/link";
import { compararFichas, obtenerDocumento } from "@/lib/memoria/documento";
import { ACONTECIMIENTOS } from "@/lib/memoria/acontecimientos";
import { FUENTES, type FichaDocumento, type FuenteId } from "@/lib/memoria/tipos";
import { fuente as datosFuente } from "@/lib/memoria/fuentes";
import { SITE_URL } from "@/lib/site";
import { SelloDerechos } from "@/components/memoria/tarjeta-documento";
import "../../memoria/memoria.css";

// ═══════════════════════════════════════════════════════════════════
// v419.0 · /memoria/comparar — dos documentos, cara a cara
//
// Qué compara y qué NO: compara los campos que las instituciones publican
// (título, fecha, autor, institución, derechos, licencia, caras). No inventa
// un «diff» del texto que no ha leído ni transcribe documentos ajenos.
//
// Los pares preparados salen de los expedientes: el borrador frente a la
// copia, la proclamación preliminar frente a la definitiva, el muro que se
// levanta frente al que cae.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Comparar dos documentos — Archivo de la memoria",
  description:
    "Compara dos piezas del archivo: metadatos, fecha, autoría, institución y derechos, con las dos imágenes a la vista cuando la licencia lo permite.",
  alternates: { canonical: `${SITE_URL}/memoria/comparar` },
};

type Params = Record<string, string | string[] | undefined>;

function uno(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function partirClave(clave: string): { fuente: FuenteId; id: string } | null {
  const m = clave.trim().match(/^(loc|ia|commons):(.+)$/);
  if (!m) return null;
  return { fuente: m[1] as FuenteId, id: m[2] };
}

/** Pares con sentido documental, sacados de los expedientes. */
const PARES_PREPARADOS = [
  {
    titulo: "El borrador y la copia de la Declaración de Independencia",
    a: "loc:mtjbib000156",
    b: "loc:mtjbib000159",
    nota: "Junio de 1776 frente al 4 de julio de 1776: el texto de trabajo de Jefferson y la copia que se firmó.",
  },
  {
    titulo: "La proclamación preliminar y la definitiva",
    a: "loc:mal1859300",
    b: "commons:65440764",
    nota: "22 de septiembre de 1862 frente al 1 de enero de 1863: el anuncio y la firma.",
  },
  {
    titulo: "El muro que se construye y el muro que cae",
    a: "loc:2010651171",
    b: "commons:170199868",
    nota: "1961 frente a 1989. La primera pieza no se publica aquí porque la institución no ha evaluado sus derechos.",
  },
  {
    titulo: "El programa de la marcha en dos instituciones",
    a: "loc:94507639",
    b: "commons:81341836",
    nota: "La misma pieza descrita por dos instituciones: sirve para ver qué campos publica cada una.",
  },
];

export default async function CompararPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const claveA = uno(sp.a);
  const claveB = uno(sp.b);
  const partA = partirClave(claveA);
  const partB = partirClave(claveB);

  let a: FichaDocumento | null = null;
  let b: FichaDocumento | null = null;
  if (partA && partB) {
    [a, b] = await Promise.all([obtenerDocumento(partA.fuente, decodeURIComponent(partA.id)), obtenerDocumento(partB.fuente, decodeURIComponent(partB.id))]);
  }

  const filas = a && b ? compararFichas(a, b) : [];

  // pares de los expedientes: cualquier par de piezas fijadas del mismo hecho
  const paresDeExpedientes = ACONTECIMIENTOS.filter((ac) => ac.piezas.length >= 2).map((ac) => ({
    titulo: ac.titulo,
    a: `${ac.piezas[0].fuente}:${ac.piezas[0].id}`,
    b: `${ac.piezas[1].fuente}:${ac.piezas[1].id}`,
    nota: `${ac.piezas[0].papel} — frente a — ${ac.piezas[1].papel}`,
  }));

  return (
    <main className="vx-mem">
      <div className="vx-mem-caja">
        <header>
          <p className="vx-mem-volanta">Vanguard · Memory Archive</p>
          <h1 className="vx-mem-titulo">Comparar dos documentos</h1>
          <p className="vx-mem-sub">
            Dos piezas, cara a cara: lo que cada institución publica de cada una. El archivo compara los campos que las
            fuentes declaran —no transcribe ni interpreta el contenido— y lo dice para que nadie confunda esta tabla con
            un cotejo de textos.
          </p>
        </header>

        <form className="vx-mem-buscador" action="/memoria/comparar" method="get" role="search">
          <div className="vx-mem-campo" style={{ gridColumn: "span 3" }}>
            <label htmlFor="cmp-a">Primera pieza (fuente:identificador)</label>
            <input id="cmp-a" name="a" type="text" defaultValue={claveA} placeholder="loc:mtjbib000156" autoComplete="off" />
          </div>
          <div className="vx-mem-campo" style={{ gridColumn: "span 3" }}>
            <label htmlFor="cmp-b">Segunda pieza (fuente:identificador)</label>
            <input id="cmp-b" name="b" type="text" defaultValue={claveB} placeholder="loc:mtjbib000159" autoComplete="off" />
          </div>
          <button className="vx-mem-boton" type="submit">
            Comparar
          </button>
        </form>
        <p className="vx-mem-nota" style={{ marginTop: 10 }}>
          El identificador está en la ficha de cada documento, en la línea «clave del archivo». También puedes llegar
          desde cualquier ficha con el botón «Comparar con otro».
        </p>

        {claveA || claveB ? (
          !a || !b ? (
            <section className="vx-mem-sec">
              <ul className="vx-mem-avisos">
                <li>
                  {!partA || !partB
                    ? "Hacen falta dos claves con la forma fuente:identificador, por ejemplo loc:mtjbib000156."
                    : "Una de las dos piezas no está disponible ahora mismo en su fuente: no se compara contra un hueco."}
                </li>
              </ul>
            </section>
          ) : (
            <>
              <section className="vx-mem-sec vx-mem-comparar">
                {[a, b].map((f, i) => (
                  <div key={f.clave} className="vx-mem-pieza">
                    <p className="vx-mem-meta">
                      {i === 0 ? "A" : "B"} · {datosFuente(f.fuente).nombre} · <code>{f.clave}</code>
                    </p>
                    {f.paginas[0]?.imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.paginas[0].imagen} alt={f.titulo} style={{ width: "100%", height: "auto", border: "1px solid rgba(255,255,255,0.08)" }} />
                    ) : (
                      <p className="vx-mem-pieza__no">Sin imagen publicada: {f.derechosTexto ?? "la fuente no declara derechos"}.</p>
                    )}
                    <h3 style={{ margin: 0, fontSize: 15, color: "#fafafa" }}>{f.titulo}</h3>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <SelloDerechos estado={f.derechos} />
                      <Link className="vx-mem-enlace" href={`/memoria/documento/${f.fuente}/${encodeURIComponent(f.id)}`}>
                        Abrir la ficha →
                      </Link>
                    </div>
                  </div>
                ))}
              </section>

              <section className="vx-mem-sec">
                <h2>Campos que las fuentes publican</h2>
                <p className="vx-mem-nota">Las filas marcadas en ámbar son las que cambian entre las dos piezas.</p>
                <table className="vx-mem-tabla">
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>A</th>
                      <th>B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((f) => (
                      <tr key={f.campo} data-igual={f.igual ? "si" : "no"}>
                        <td style={{ color: "#a1a1aa", fontFamily: "var(--font-mono, monospace)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {f.campo}
                        </td>
                        <td>{f.a}</td>
                        <td>{f.b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )
        ) : null}

        <section className="vx-mem-sec">
          <h2>Comparaciones preparadas</h2>
          <p className="vx-mem-nota">Pares que tienen sentido documental, sacados de los expedientes del archivo.</p>
          <div className="vx-mem-rejilla">
            {[...PARES_PREPARADOS, ...paresDeExpedientes].map((p) => (
              <Link key={`${p.a}-${p.b}`} href={`/memoria/comparar?a=${encodeURIComponent(p.a)}&b=${encodeURIComponent(p.b)}`} className="vx-mem-tarjeta" style={{ padding: 12, gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 14, color: "#fafafa" }}>{p.titulo}</h3>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "#a1a1aa" }}>{p.nota}</p>
                <p className="vx-mem-meta" style={{ marginTop: "auto" }}>
                  {p.a} vs {p.b}
                </p>
              </Link>
            ))}
          </div>
        </section>

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
