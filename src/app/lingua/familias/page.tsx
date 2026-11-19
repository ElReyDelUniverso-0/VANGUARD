// v420.0 VANGUARD LINGUA — explorador de familias lingüísticas.
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { Insignia, Migas, PuntoAes } from "@/components/lingua/piezas";
import { familiasRaiz, nombreLengua, nombreNodo } from "@/lib/lingua/servidor";
import { AGRUPACIONES_PROPUESTAS, PSEUDOFAMILIAS, fichaFamilia } from "@/lib/lingua/familias";
import { MACROAREAS_ES, RUTAS_LINGUA, formatoNumero, rutaFamilia, rutaIdioma } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Familias lingüísticas del mundo · árbol interactivo · Lingua · VANGUARD",
  description: "Las familias de lenguas del mundo según Glottolog 5.4: de la atlántico-congo y la austronesia a las lenguas aisladas, con árbol interactivo, mapa e historia.",
  alternates: { canonical: `${SITE_URL}/lingua/familias` },
};

export default function Page() {
  const { reales, pseudo, aisladas } = familiasRaiz();
  const grandes = reales.filter((f) => f.n >= 20);
  const medianas = reales.filter((f) => f.n >= 4 && f.n < 20);
  const pequenas = reales.filter((f) => f.n < 4);
  const totalEnFamilias = reales.reduce((s, f) => s + f.n, 0);
  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.familias}
      titulo="Árbol de las lenguas del mundo"
      sub={`Una familia es un conjunto de lenguas que descienden de un antepasado común demostrado. Glottolog 5.4 reconoce ${reales.length} familias con lenguas vivas o documentadas y ${aisladas.length} lenguas aisladas. Elige una familia para recorrer sus ramas.`}
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "Familias" }]} />
      <p className="vx-li-aviso">
        <b>Cómo leer el árbol.</b> Cada familia se divide en ramas y subramas hasta llegar a las lenguas (punto de color según su estado) y, debajo, a sus dialectos.
        Las agrupaciones que no son genealógicas —lenguas de señas, pidgins, lenguas construidas, inclasificables— aparecen aparte.
      </p>

      <section className="vx-li-seccion">
        <h2>Grandes familias ({grandes.length})</h2>
        <p className="vx-li-nota">Con 20 lenguas o más. Juntas suman la mayoría de las {formatoNumero(totalEnFamilias)} lenguas clasificadas en familias.</p>
        <div className="vx-li-rejilla tres">
          {grandes.map((f) => {
            const ficha = fichaFamilia(f.nodo.id);
            return (
              <Link key={f.nodo.id} href={rutaFamilia(f.nodo.id)} className="vx-li-tarjeta">
                <h3>{nombreNodo(f.nodo)}</h3>
                <p>
                  {formatoNumero(f.n)} lenguas{nombreNodo(f.nodo) !== f.nodo.nombre ? ` · ${f.nodo.nombre}` : ""}
                </p>
                {ficha?.origen ? <small>{ficha.origen.length > 110 ? `${ficha.origen.slice(0, 108)}…` : ficha.origen}</small> : null}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="vx-li-seccion">
        <h2>Familias medianas ({medianas.length})</h2>
        <p className="vx-li-nota">Entre 4 y 19 lenguas.</p>
        <ul className="vx-li-chips">
          {medianas.map((f) => (
            <li key={f.nodo.id}>
              <Link href={rutaFamilia(f.nodo.id)}>
                {nombreNodo(f.nodo)} · {f.n}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="vx-li-seccion">
        <h2>Familias pequeñas ({pequenas.length})</h2>
        <p className="vx-li-nota">Dos o tres lenguas emparentadas entre sí y con ninguna otra conocida.</p>
        <ul className="vx-li-chips">
          {pequenas.map((f) => (
            <li key={f.nodo.id}>
              <Link href={rutaFamilia(f.nodo.id)}>
                {nombreNodo(f.nodo)} · {f.n}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="vx-li-seccion" id="aisladas">
        <h2>Lenguas aisladas ({aisladas.length})</h2>
        <p className="vx-li-nota">
          Lenguas sin parentesco demostrado con ninguna otra: cada una es, en la práctica, una familia de un solo miembro. El euskera es la más conocida de Europa; muchas otras están
          extintas o casi extintas.
        </p>
        <div className="vx-li-tabla-caja">
          <table className="vx-li-tabla">
            <thead>
              <tr>
                <th>Lengua</th>
                <th>Macroárea</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {aisladas.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={rutaIdioma(l.id)}>{nombreLengua(l)}</Link>
                    <small>{l.iso ? `ISO ${l.iso}` : l.id}</small>
                  </td>
                  <td>{MACROAREAS_ES[l.macro] ?? "—"}</td>
                  <td>
                    <PuntoAes aes={l.aes} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vx-li-seccion">
        <h2>Agrupaciones que no son familias</h2>
        <p className="vx-li-nota">Glottolog las usa para catalogar lenguas que no se pueden (o no se deben) clasificar por descendencia.</p>
        <div className="vx-li-rejilla">
          {pseudo.map((f) => (
            <Link key={f.nodo.id} href={rutaFamilia(f.nodo.id)} className="vx-li-tarjeta">
              <Insignia tipo="pseudo" />
              <h3 style={{ marginTop: 8 }}>
                {nombreNodo(f.nodo)} · {f.n}
              </h3>
              <p>{PSEUDOFAMILIAS[f.nodo.id] ?? ""}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="vx-li-seccion">
        <h2>Macrofamilias propuestas y no demostradas</h2>
        <p className="vx-li-nota">Hipótesis frecuentes en libros y mapas que Glottolog no acepta como familias. Por eso no aparecen en el árbol.</p>
        <div className="vx-li-rejilla">
          {AGRUPACIONES_PROPUESTAS.map((a) => (
            <div key={a.nombre} className="vx-li-tarjeta">
              <h3>{a.nombre}</h3>
              <p>{a.nota}</p>
              <small>
                <a href={a.fuente.url} target="_blank" rel="noopener noreferrer">
                  {a.fuente.titulo}
                </a>
              </small>
            </div>
          ))}
        </div>
      </section>
    </MarcoLingua>
  );
}
