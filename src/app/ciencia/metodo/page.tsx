// ============================================================
// v421.9 MÉTODO Y PROCEDENCIA — la página que hace auditable el centro.
// Qué se capturó, cuándo, con qué fuente, cómo se clasifica, qué NO
// está aquí y cómo se reproduce el índice.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoCiencia, Migas } from "@/components/ciencia/piezas";
import {
  CAPTURA,
  ESTADISTICAS,
  FUENTES,
  NIVEL_INFO,
  PUBLICACIONES,
  TIPO_INFO,
  VERSION_DATOS,
  type NivelEvidencia,
  type TipoPublicacion,
} from "@/lib/ciencia/indice";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Método y procedencia · Science Frontier",
  description:
    "Cómo se construye el índice científico de VANGUARD: fuentes, clasificación editorial, nivel de evidencia, límites declarados y reproducción del proceso.",
  alternates: { canonical: `${SITE_URL}/ciencia/metodo` },
};

export default function Page() {
  const conResumen = PUBLICACIONES.filter((p) => p.resumenOriginal).length;
  const conHuella = PUBLICACIONES.filter((p) => p.sha256).length;
  const porTipo = ESTADISTICAS.porTipo;

  return (
    <MarcoCiencia activa="/ciencia/metodo">
      <Migas pasos={[{ href: "/ciencia", label: "Science Frontier" }, { label: "Método" }]} />
      <p className="vx-sc-volanta">Método y procedencia</p>
      <h1>
        Cómo se sostiene
        <br />
        <em>lo que aquí se afirma</em>.
      </h1>
      <p className="vx-sc-sub">
        Este centro no escribe artículos de divulgación. Captura metadatos bibliográficos reales, los clasifica con una
        taxonomía explícita y añade una lectura editorial con su límite. Todo lo demás —autores, fechas, revistas,
        citas, premios— sale de la fuente y se puede comprobar en el enlace original.
      </p>

      <section className="vx-sc-seccion">
        <header>
          <h2>Qué se capturó</h2>
          <span className="vx-sc-kicker">índice {VERSION_DATOS} · {CAPTURA}</span>
        </header>
        <div className="vx-sc-cifras">
          <div>
            <b>{ESTADISTICAS.registros}</b>
            <span>registros</span>
          </div>
          <div>
            <b>{conHuella}</b>
            <span>con huella SHA-256</span>
          </div>
          <div>
            <b>{conResumen}</b>
            <span>con resumen del editor</span>
          </div>
          <div>
            <b>{ESTADISTICAS.revistas}</b>
            <span>revistas distintas</span>
          </div>
          <div>
            <b>
              {ESTADISTICAS.desde}–{ESTADISTICAS.hasta}
            </b>
            <span>años</span>
          </div>
        </div>
        <dl className="vx-sc-datos">
          {(Object.keys(porTipo) as TipoPublicacion[]).map((t) => (
            <div key={t}>
              <dt style={{ color: TIPO_INFO[t].color }}>{TIPO_INFO[t].etiqueta}</dt>
              <dd>{porTipo[t]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="vx-sc-seccion">
        <header>
          <h2>Fuentes</h2>
          <span className="vx-sc-kicker">una fila por fuente, con su política</span>
        </header>
        <div className="vx-sc-tabla-envoltura">
          <table className="vx-sc-tabla">
            <thead>
              <tr>
                <th scope="col">Fuente</th>
                <th scope="col">Para qué</th>
                <th scope="col">Política declarada</th>
              </tr>
            </thead>
            <tbody>
              {FUENTES.map((f) => (
                <tr key={f.id}>
                  <td>
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                      {f.nombre} ↗
                    </a>
                  </td>
                  <td style={{ color: "#9fb0c4" }}>{f.uso}</td>
                  <td style={{ color: "#9fb0c4" }}>{f.politica}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vx-sc-seccion">
        <header>
          <h2>Las dos preguntas que nunca se mezclan</h2>
          <span className="vx-sc-kicker">tipo editorial ≠ nivel de evidencia</span>
        </header>
        <div className="vx-sc-lista doble">
          <div className="vx-sc-panel">
            <h2>1 · ¿Dónde se publicó?</h2>
            <dl className="vx-sc-datos lista">
              {(Object.keys(TIPO_INFO) as TipoPublicacion[]).map((t) => (
                <div key={t}>
                  <dt style={{ color: TIPO_INFO[t].color }}>{TIPO_INFO[t].etiqueta}</dt>
                  <dd>{TIPO_INFO[t].detalle}</dd>
                </div>
              ))}
            </dl>
            <p className="vx-sc-hueco" style={{ marginTop: 8, marginBottom: 0 }}>
              «Revista con arbitraje declarado» significa que el editor declara arbitraje; no es una verificación
              independiente de este centro. arXiv no arbitra: solo modera.
            </p>
          </div>
          <div className="vx-sc-panel">
            <h2>2 · ¿Qué sostiene la afirmación?</h2>
            <dl className="vx-sc-datos lista">
              {(Object.keys(NIVEL_INFO) as NivelEvidencia[]).map((n) => (
                <div key={n}>
                  <dt style={{ color: n === "hipotesis" ? "#fb7185" : "#cbd5e1" }}>{NIVEL_INFO[n].etiqueta}</dt>
                  <dd>{NIVEL_INFO[n].detalle}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="vx-sc-seccion">
        <header>
          <h2>Cómo se reproduce</h2>
          <span className="vx-sc-kicker">el índice está en el repositorio</span>
        </header>
        <div className="vx-sc-panel">
          <pre
            style={{
              overflowX: "auto",
              fontSize: 12,
              lineHeight: 1.6,
              background: "#050a11",
              border: "1px solid rgba(148,175,205,.18)",
              borderRadius: 10,
              padding: 12,
              color: "#cbd5e1",
            }}
          >
{`# 1 · capturar metadatos reales (Crossref, arXiv, NobelPrize.org, instituciones)
python tools/ciencia/capturar.py

# 2 · construir el índice tipado (valida enlaces, fechas y vínculos)
python tools/ciencia/construir.py

# 3 · comprobar las invariantes (lo mismo que corre la casa antes de publicar)
node tools/ciencia/comprobar.mjs`}
          </pre>
          <p>
            Las capturas crudas no se publican: se guarda su huella SHA-256 en cada ficha y la URL de metadatos
            consultada. Así cualquiera puede repetir la consulta y comparar.
          </p>
          <p style={{ marginBottom: 0 }}>
            <Link href="/api/ciencia" style={{ color: "#22d3ee" }}>
              /api/ciencia
            </Link>{" "}
            sirve el índice con los mismos filtros del buscador, en JSON.
          </p>
        </div>
      </section>

      <section className="vx-sc-seccion">
        <header>
          <h2>Lo que este centro NO es</h2>
        </header>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: "#cbd5e1" }}>
          <li>No es una enciclopedia: no hay artículos educativos, ni resúmenes de libros, ni biografías.</li>
          <li>No es un índice exhaustivo: son {ESTADISTICAS.registros} registros elegidos por su valor de método, no toda la literatura de cada tema.</li>
          <li>No es una revisión sistemática: no declara haber revisado toda la evidencia existente de cada pregunta.</li>
          <li>No copia artículos: guarda metadatos y enlaza al original.</li>
          <li>No convierte una hipótesis en hallazgo: si el registro es una propuesta, la ficha, el buscador y la cronología lo dicen.</li>
          <li>No traduce autores ni títulos oficiales: los títulos originales se conservan y la traducción se marca como de trabajo.</li>
        </ul>
      </section>
    </MarcoCiencia>
  );
}
