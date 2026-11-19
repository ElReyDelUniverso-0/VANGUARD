// ═══════════════════════════════════════════════════════════════════
// v416.0 · /datos-mundiales/comparar — EL COMPARADOR MUNDIAL
// Departamento 4 · VANGUARD WORLD DATA
//
// El resultado que exige el encargo, literal: «un usuario debe poder seleccionar
// dos países, comparar sus indicadores y comprender las diferencias mediante
// gráficos y explicaciones». Aquí hay tres capas por indicador:
//   1. una frase que dice cuántas veces es uno respecto del otro y cuánto es la
//      brecha en la unidad del indicador;
//   2. un gráfico de barras con el último dato de cada país —y su año al lado—;
//   3. la serie histórica completa, donde los huecos de la fuente se ven como
//      cortes, no como rectas.
// Si los dos datos no son del mismo año, la frase lo dice antes de compararlos.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { MarcoDatos } from "@/components/mundial/marco-datos";
import { SelectorComparador } from "@/components/mundial/selector-comparador";
import { GraficoLineas } from "@/components/mundial/grafico-lineas";
import { GraficoBarras } from "@/components/mundial/grafico-barras";
import { INDICADORES, indicador as buscar, CATEGORIAS } from "@/lib/mundial/catalogo";
import { catalogoPaises, seriesDeVarios } from "@/lib/mundial/banco";
import { explicarPar, observaciones } from "@/lib/mundial/explicar";
import { fmtValor, fmtAnio } from "@/lib/mundial/formato";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Comparador mundial de países: hasta 6 indicadores y su serie histórica | VANGUARD",
  description:
    "Compara dos, tres o cuatro países con datos del Banco Mundial: barras, series históricas y una explicación escrita de la diferencia, con el año de cada cifra a la vista.",
  alternates: { canonical: `${SITE_URL}/datos-mundiales/comparar` },
};

const COLORES = ["#f5c542", "#5eead4", "#e23b2e", "#a78bfa"];
const POR_DEFECTO = ["poblacion", "pib_pc", "esperanza_vida", "alfabetizacion"];

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CompararPage({ searchParams }: Props) {
  const sp = await searchParams;
  const paisesCrudos = typeof sp.paises === "string" ? sp.paises : "do,ht";
  const indicadoresCrudos = typeof sp.indicadores === "string" ? sp.indicadores : POR_DEFECTO.join(",");

  const isos = [...new Set(paisesCrudos.split(",").map((s) => s.trim().toLowerCase()).filter((s) => /^[a-z]{2}$/.test(s)))].slice(0, 4);
  const elegidos = isos.length >= 2 ? isos : ["do", "ht"];
  const idsInd = indicadoresCrudos
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((id) => buscar(id)?.id)
    .filter((x): x is string => Boolean(x))
    .slice(0, 6);
  const indicadores = idsInd.length ? idsInd : POR_DEFECTO;

  const listaPaises = await catalogoPaises();
  const opciones = listaPaises.map((p) => ({ iso2: p.iso2, nombre: p.nombre }));
  const datosPaises = elegidos.map((iso) => listaPaises.find((p) => p.iso2 === iso));

  const bloques = await Promise.all(
    indicadores.map(async (id) => {
      const ind = buscar(id);
      if (!ind) return null;
      const series = await seriesDeVarios(elegidos, ind, 1990);
      return { ind, series };
    })
  );

  const solidos = bloques.filter((b): b is NonNullable<typeof b> => Boolean(b));
  const nombres = solidos[0]?.series.map((s) => s.pais) ?? elegidos.map((i) => i.toUpperCase());

  return (
    <MarcoDatos
      activo="/datos-mundiales/comparar"
      volanta="Mundo en cifras · Comparador internacional"
      titulo="Pon dos países uno al lado del otro"
      sub={
        <>
          Elige hasta cuatro países y hasta seis indicadores. Cada bloque trae la <b>frase que explica la diferencia</b>, las barras del último dato con
          su año y la serie histórica completa. Si los dos datos no son del mismo año, se dice antes de compararlos.
        </>
      }
      cifras={[
        { valor: elegidos.length, etiqueta: "países seleccionados", nota: nombres.join(" · ") },
        { valor: solidos.length, etiqueta: "indicadores comparados", nota: `${INDICADORES.length} disponibles en el catálogo` },
        { valor: solidos.reduce((n, b) => n + b.series.reduce((m, s) => m + s.puntos.length, 0), 0), etiqueta: "puntos de serie", nota: "Cada punto, un año con dato publicado" },
        { valor: "24 h", etiqueta: "caché de las series", nota: "La fuente no se golpea en cada visita" },
      ]}
    >
      <section className="vx-md-panel">
        <h2 className="vx-md-h2">1 · Elige países e indicadores</h2>
        <p className="vx-md-h2-sub">El enlace guarda tu selección: cópialo y la comparación vuelve tal cual.</p>
        <SelectorComparador paises={opciones} elegidos={elegidos} indicadores={INDICADORES.map((i) => i.id)} elegidosInd={indicadores} />
      </section>

      {datosPaises.some((p) => !p) ? (
        <div className="vx-md-aviso rojo">
          Algún código de país no existe en el banco del Banco Mundial. Se ha ignorado: {elegidos.filter((iso) => !datosPaises.find((p) => p?.iso2 === iso)).join(", ")}
        </div>
      ) : null}

      {solidos.map(({ ind, series }) => {
        const cifras = series.map((s) => ({ iso: s.iso, pais: s.pais, valor: s.ultimo?.valor ?? null, anio: s.ultimo?.anio ?? null }));
        const pares: { texto: string; aviso?: string; tipo: string }[] = [];
        for (let i = 0; i < cifras.length; i++) {
          for (let j = i + 1; j < cifras.length; j++) {
            const e = explicarPar(cifras[i], cifras[j], ind);
            pares.push({ texto: e.texto, aviso: e.aviso, tipo: e.tipo });
          }
        }
        const obs = series.length >= 2 ? observaciones({ pais: series[0].pais, puntos: series[0].puntos }, { pais: series[1].pais, puntos: series[1].puntos }) : [];
        const serieGrafico = series.map((s, i) => ({ iso: s.iso, nombre: s.pais, color: COLORES[i % COLORES.length], puntos: s.puntos }));
        const barras = cifras.map((c, i) => ({ iso: c.iso, nombre: c.pais, valor: c.valor, anio: c.anio, color: COLORES[i % COLORES.length] }));

        return (
          <section className="vx-md-panel" key={ind.id} aria-labelledby={`ind-${ind.id}`}>
            <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
              <div>
                <h2 className="vx-md-h2" id={`ind-${ind.id}`}>
                  {ind.nombre}
                </h2>
                <p className="vx-md-h2-sub" style={{ marginBottom: 4 }}>
                  {ind.pregunta} · Unidad: {ind.unidad} · Código: <code>{ind.codigo}</code>
                </p>
              </div>
              <p className="vx-md-meta">
                {CATEGORIAS.find((c) => c.id === ind.categoria)?.nombre} ·{" "}
                <a href={ind.urlDefinicion} target="_blank" rel="noreferrer noopener" style={{ color: "#5eead4" }}>
                  definición de la fuente
                </a>
              </p>
            </header>

            <div className="vx-md-aviso teal" style={{ marginTop: 10 }}>
              <b>Qué mide:</b> {ind.metodo}
            </div>

            <div style={{ margin: "14px 0 6px" }}>
              {pares.map((p, i) => (
                <div key={i} className={p.tipo === "sin_dato" ? "vx-md-aviso rojo" : "vx-md-aviso"} style={{ margin: "8px 0" }}>
                  {p.texto}
                  {p.aviso ? (
                    <>
                      <br />
                      <span className="vx-md-meta">{p.aviso}</span>
                    </>
                  ) : null}
                </div>
              ))}
            </div>

            <GraficoBarras barras={barras} indicador={ind} />

            <div style={{ marginTop: 18 }}>
              <GraficoLineas series={serieGrafico} indicador={ind} />
            </div>

            {obs.length ? (
              <ul className="vx-md-lista" style={{ marginTop: 12 }}>
                {obs.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            ) : null}

            <details style={{ marginTop: 12 }}>
              <summary className="vx-md-meta" style={{ cursor: "pointer" }}>
                Ver la tabla de los últimos años (cifra y año, país por país)
              </summary>
              <div className="vx-md-tabla-caja" style={{ maxHeight: 420, marginTop: 10 }}>
                <table className="vx-md-tabla">
                  <thead>
                    <tr>
                      <th>Año</th>
                      {series.map((s) => (
                        <th key={s.iso} className="num">
                          {s.pais}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...new Set(series.flatMap((s) => s.puntos.map((p) => p.anio)))]
                      .sort((a, b) => b - a)
                      .slice(0, 15)
                      .map((anio) => (
                        <tr key={anio}>
                          <td>{anio}</td>
                          {series.map((s) => {
                            const p = s.puntos.find((x) => x.anio === anio);
                            return (
                              <td key={s.iso} className="num">
                                {p ? fmtValor(p.valor, ind) : <span className="vx-md-sin">sin dato</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
        );
      })}

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Fichas de los países elegidos</h2>
        <div className="vx-md-rejilla vx-md-4">
          {elegidos.map((iso, i) => {
            const p = listaPaises.find((x) => x.iso2 === iso);
            return (
              <Link key={iso} href={`/datos-mundiales/pais/${iso}`} className="vx-md-cifra" style={{ textDecoration: "none" }}>
                <b style={{ color: COLORES[i % COLORES.length], fontSize: 20 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://flagcdn.com/w20/${iso}.png`} alt="" width={20} height={14} style={{ marginRight: 8, verticalAlign: -1 }} />
                  {p?.nombre ?? iso.toUpperCase()}
                </b>
                <span>{p?.region ?? "sin región"}</span>
                <small>
                  {p?.renta ?? "sin dato de renta"} · capital {p?.capital || "sin dato"} · abrir la ficha completa →
                </small>
              </Link>
            );
          })}
        </div>
        <p className="vx-md-meta" style={{ marginTop: 12 }}>
          Última cifra de cada serie: {solidos[0]?.series.map((s) => `${s.pais} ${fmtAnio(s.ultimo?.anio ?? null)}`).join(" · ")}
        </p>
      </section>
    </MarcoDatos>
  );
}
