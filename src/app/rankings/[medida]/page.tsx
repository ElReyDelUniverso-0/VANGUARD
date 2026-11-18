import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { Marco, Bandera } from "@/components/planeta/marco";
import { GuardarPieza } from "@/components/planeta/guardar";
import { INDICADOR, INDICADORES, esIndicador, fmt } from "@/lib/planeta/indicadores";
import { anioTipico, mundo, ranking } from "@/lib/planeta/datos";
import { miles } from "@/lib/mundos/formato";

// ═══════════════════════════════════════════════════════════════════
// v407.1 · /rankings/[medida] — UNA LISTA MUNDIAL COMPLETA
// Todos los países con dato, de mayor a menor, con su peso sobre el total
// mundial y el acumulado. Estática (ocho páginas). Cada fila lleva a la ficha
// del país y al comparador.
// ═══════════════════════════════════════════════════════════════════

export const dynamicParams = false;

export function generateStaticParams() {
  return INDICADORES.map((i) => ({ medida: i.id }));
}

interface Props {
  params: Promise<{ medida: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { medida } = await params;
  if (!esIndicador(medida)) return { title: "Ranking no encontrado | VANGUARD" };
  const ind = INDICADOR[medida];
  const r = ranking(medida);
  return {
    title: `${ind.nombre}: ranking mundial de ${r.length} países | VANGUARD`,
    description: `${ind.pregunta} La lista completa de ${r.length} países ordenados por ${ind.nombre.toLowerCase()}, con el año de cada dato. Encabeza ${r[0]?.fila.nombre ?? "—"} (${fmt(medida, r[0]?.valor)}).`,
    alternates: { canonical: `${SITE_URL}/rankings/${medida}` },
  };
}

/** Los indicadores que se pueden sumar tienen «peso sobre el total». */
const SUMABLES = new Set(["pob", "sup", "pib", "mil"]);

export default async function RankingPage({ params }: Props) {
  const { medida } = await params;
  if (!esIndicador(medida)) notFound();
  const ind = INDICADOR[medida];
  const r = ranking(medida);
  const m = mundo();
  const total = SUMABLES.has(medida) ? (m[medida as "pob" | "sup" | "pib" | "mil"] as number) : null;
  const anio = ind.anioDe ? anioTipico(ind.anioDe) : null;
  const max = r[0]?.valor ?? 1;

  // ¿cuántos países hacen falta para llegar a la mitad del total?
  let mitad: number | null = null;
  if (total) {
    let acc = 0;
    for (const p of r) {
      acc += p.valor;
      if (acc >= total / 2) {
        mitad = p.puesto;
        break;
      }
    }
  }
  const mediana = r.length ? r[Math.floor(r.length / 2)].valor : null;
  const rd = r.find((p) => p.fila.iso2 === "do");

  // el acumulado se calcula antes de pintar (nada se reasigna durante el render)
  const acumulados: number[] = [];
  r.reduce((acc, p) => {
    const n = acc + p.valor;
    acumulados.push(n);
    return n;
  }, 0);
  return (
    <Marco
      ruta="/rankings"
      volanta={`Planeta en cifras · Ranking · ${ind.codigo}`}
      titulo={ind.nombre}
      sub={
        <>
          {ind.pregunta} {r.length} países con dato, ordenados de mayor a menor
          {anio ? <> (el año más común del dato es {anio}; cada fila dice el suyo)</> : null}.
        </>
      }
      fuente={<>Fuente: {ind.fuente}. Captura del Banco Mundial: 17-nov-2026. Los países sin dato no aparecen: no se estima ninguna cifra.</>}
    >
      <nav className="vx-pl-fila" style={{ marginTop: 14 }} aria-label="Otros rankings">
        {INDICADORES.map((i) => (
          <Link key={i.id} href={`/rankings/${i.id}`} className={`vx-pl-btn ${i.id === medida ? "vx-pl-btn--on" : ""}`}>
            {i.corto}
          </Link>
        ))}
      </nav>

      <div className="vx-pl-cifras">
        <div className="vx-pl-cifra">
          <b>{r[0]?.fila.nombre ?? "—"}</b>
          <span>encabeza la lista · {fmt(medida, r[0]?.valor)}</span>
        </div>
        <div className="vx-pl-cifra">
          <b>{fmt(medida, mediana)}</b>
          <span>la mediana: la mitad de los países está por debajo</span>
        </div>
        {total ? (
          <div className="vx-pl-cifra">
            <b>{fmt(medida, total)}</b>
            <span>la suma de los {r.length} países</span>
          </div>
        ) : null}
        {mitad ? (
          <div className="vx-pl-cifra">
            <b>{mitad} países</b>
            <span>reúnen la mitad del total mundial</span>
          </div>
        ) : null}
        {rd ? (
          <div className="vx-pl-cifra">
            <b>Puesto {rd.puesto}</b>
            <span>República Dominicana · {fmt(medida, rd.valor)}</span>
          </div>
        ) : null}
      </div>

      <div className="vx-pl-fila" style={{ marginTop: 14 }}>
        <GuardarPieza
          titulo={`Ranking mundial · ${ind.nombre}`}
          href={`/rankings/${medida}`}
          nota={`${r.length} países · encabeza ${r[0]?.fila.nombre ?? "—"} · ${ind.fuente}`}
          etiquetas={["ranking", medida]}
        />
        <Link href="/comparador" className="vx-pl-btn">Comparar países →</Link>
      </div>

      <section className="vx-pl-sec">
        <div className="vx-pl-tabla-caja">
          <table className="vx-pl-tabla">
            <thead>
              <tr>
                <th className="n">#</th>
                <th>País</th>
                <th className="n">{ind.corto}</th>
                {total ? <th className="n">% mundo</th> : null}
                {total ? <th className="n">Acumulado</th> : null}
                <th style={{ minWidth: 90 }}></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {r.map((p, i) => {
                const acumulado = acumulados[i];
                const anioP = ind.anioDe ? p.fila.anios[ind.anioDe] : undefined;
                return (
                  <tr key={p.fila.iso2} id={p.fila.iso2} className={p.fila.iso2 === "do" ? "vx-pl-resalta" : undefined}>
                    <td className="n">{p.puesto}</td>
                    <td>
                      <Link href={`/mundos/${p.fila.iso2}`}>
                        <Bandera iso2={p.fila.iso2} nombre={p.fila.nombre} />
                        {p.fila.nombre}
                      </Link>
                    </td>
                    <td className="n">
                      {fmt(medida, p.valor)}
                      {anioP ? <span className="vx-pl-anio">{anioP}</span> : null}
                    </td>
                    {total ? <td className="n">{miles((p.valor / total) * 100, 2)} %</td> : null}
                    {total ? <td className="n">{miles((acumulado / total) * 100, 1)} %</td> : null}
                    <td>
                      <div className="vx-pl-barrita">
                        <i style={{ width: `${Math.max(1, (p.valor / max) * 100)}%` }} />
                      </div>
                    </td>
                    <td>
                      <Link href={`/comparador?p=${p.fila.iso2}`} className="vx-pl-chip">comparar</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </Marco>
  );
}
