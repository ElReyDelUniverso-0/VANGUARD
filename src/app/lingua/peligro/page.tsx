// v420.0 VANGUARD LINGUA — explorador de lenguas en peligro.
import type { Metadata } from "next";
import Link from "next/link";
import { MarcoLingua } from "@/components/lingua/marco-lingua";
import { BarraAes, Cifras, MapaPuntos, Migas, Paginas, bandera } from "@/components/lingua/piezas";
import { familiasRaiz, lenguasBajo, nombreDe, nombreLengua, nombreNodo, nombreTerritorio, resumir, todasLasLenguas } from "@/lib/lingua/servidor";
import { AES_ES, MACROAREAS_ES, RUTAS_LINGUA, formatoNumero, rutaFamilia, rutaIdioma, rutaPais } from "@/lib/lingua/tipos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Lenguas en peligro de extinción · Lingua · VANGUARD",
  description: "Qué lenguas dejan de transmitirse, dónde se concentran y cuáles ya se extinguieron, según el estado de amenaza agregado de Glottolog 5.4.",
  alternates: { canonical: `${SITE_URL}/lingua/peligro` },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const POR_PAGINA = 80;

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const aes = typeof sp.aes === "string" && /^[0-5]$/.test(sp.aes) ? Number(sp.aes) : 4;
  const macro = typeof sp.macro === "string" && MACROAREAS_ES[sp.macro] ? sp.macro : "";
  const pagina = Math.max(1, Number.parseInt(typeof sp.p === "string" ? sp.p : "1", 10) || 1);
  const todas = todasLasLenguas();
  const r = resumir(todas);
  const enRiesgo = (x: { aes: number }) => x.aes >= 2 && x.aes <= 4;
  const macroareas = Object.keys(MACROAREAS_ES).map((m) => {
    const ls = todas.filter((l) => l.macro === m);
    const rr = resumir(ls);
    return { m, n: ls.length, aes: rr.aes, sinAes: rr.sinAes, riesgo: ls.filter(enRiesgo).length };
  });
  const familias = familiasRaiz()
    .reales.filter((f) => f.n >= 15)
    .map((f) => {
      const ls = lenguasBajo(f.nodo.id);
      const ev = ls.filter((l) => l.aes >= 0);
      return { f, riesgo: ls.filter(enRiesgo).length, extintas: ls.filter((l) => l.aes === 5).length, ev: ev.length };
    })
    .map((x) => ({ ...x, pct: x.ev ? (x.riesgo + x.extintas) / x.ev : 0 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 12);
  const paises = new Map<string, number>();
  for (const l of todas) if (enRiesgo(l)) for (const p of l.paises) paises.set(p, (paises.get(p) ?? 0) + 1);
  const topPaises = [...paises.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
  const lista = todas.filter((l) => l.aes === aes && (!macro || l.macro === macro)).sort((a, b) => nombreLengua(a).localeCompare(nombreLengua(b), "es"));
  const vista = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const sel = AES_ES[aes];
  const enlace = (a: number, m: string, p = 1) => `${RUTAS_LINGUA.peligro}?aes=${a}${m ? `&macro=${encodeURIComponent(m)}` : ""}${p > 1 ? `&p=${p}` : ""}`;

  return (
    <MarcoLingua
      activo={RUTAS_LINGUA.peligro}
      titulo="Lenguas en peligro"
      sub="Una lengua muere cuando los niños dejan de aprenderla. Este explorador usa el estado de amenaza agregado (AES) de Glottolog, que unifica las evaluaciones de UNESCO, del Catálogo de Lenguas en Peligro (ElCat) y de Ethnologue en una sola escala de seis grados."
    >
      <Migas pasos={[{ href: RUTAS_LINGUA.inicio, label: "Lingua" }, { label: "En peligro" }]} />
      <Cifras
        items={[
          { valor: formatoNumero(r.aes[2] + r.aes[3] + r.aes[4]), label: "lenguas en retroceso, moribundas o casi extintas" },
          { valor: formatoNumero(r.aes[1]), label: "amenazadas, aún con transmisión" },
          { valor: formatoNumero(r.aes[5]), label: "extintas documentadas" },
          { valor: formatoNumero(r.aes[0]), label: "sin amenaza" },
        ]}
      />
      <BarraAes aes={r.aes} sinAes={r.sinAes} enlaces={(i) => enlace(i, macro)} />
      <p className="vx-li-nota" style={{ marginTop: 10 }}>
        Como referencia, Ethnologue (2025) considera en peligro el 44 % de las 7.159 lenguas vivas que cuenta. Las cifras difieren porque cada catálogo usa su propia escala y su propio
        criterio para separar lenguas.
      </p>

      <section className="vx-li-seccion">
        <h2>Por macroárea</h2>
        <div className="vx-li-tabla-caja">
          <table className="vx-li-tabla">
            <thead>
              <tr>
                <th>Macroárea</th>
                <th className="num">Lenguas</th>
                <th className="num">En retroceso a casi extintas</th>
                <th className="num">Extintas</th>
                <th style={{ minWidth: 160 }}>Distribución</th>
              </tr>
            </thead>
            <tbody>
              {macroareas.map((x) => {
                const tot = x.aes.reduce((s, v) => s + v, 0) + x.sinAes;
                return (
                  <tr key={x.m}>
                    <td>
                      <Link href={enlace(aes, x.m)}>{MACROAREAS_ES[x.m]}</Link>
                    </td>
                    <td className="num">{formatoNumero(x.n)}</td>
                    <td className="num">
                      {formatoNumero(x.riesgo)} <small>{Math.round((x.riesgo / Math.max(1, x.n)) * 100)} %</small>
                    </td>
                    <td className="num">{formatoNumero(x.aes[5])}</td>
                    <td>
                      <div className="vx-li-barra" style={{ margin: 0 }}>
                        {x.aes.map((v, i) => (v ? <span key={i} style={{ width: `${(v / tot) * 100}%`, background: AES_ES[i].color }} /> : null))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vx-li-seccion">
        <h2>
          {sel.nombre}
          {macro ? ` · ${MACROAREAS_ES[macro]}` : ""} ({formatoNumero(lista.length)})
        </h2>
        <p className="vx-li-nota">{sel.nota}</p>
        <ul className="vx-li-chips" style={{ marginBottom: 12 }}>
          {AES_ES.map((a, i) => (
            <li key={a.clave}>
              <Link href={enlace(i, macro)} aria-current={i === aes ? "true" : undefined}>
                {a.nombre}
              </Link>
            </li>
          ))}
          {macro ? (
            <li>
              <Link href={enlace(aes, "")}>Todo el mundo</Link>
            </li>
          ) : null}
        </ul>
        <MapaPuntos
          puntos={lista.filter((l) => l.lat !== null && l.lon !== null).map((l) => ({ lat: l.lat as number, lon: l.lon as number, color: sel.color, titulo: nombreLengua(l), href: rutaIdioma(l.id) }))}
          etiqueta={`Mapa de lenguas en estado «${sel.nombre}»`}
          encuadre={Boolean(macro)}
        />
        <div className="vx-li-tabla-caja" style={{ marginTop: 12 }}>
          <table className="vx-li-tabla">
            <thead>
              <tr>
                <th>Lengua</th>
                <th>Familia</th>
                <th>Países</th>
              </tr>
            </thead>
            <tbody>
              {vista.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={rutaIdioma(l.id)}>{nombreLengua(l)}</Link>
                    <small>{l.iso ? `ISO ${l.iso}` : l.id}</small>
                  </td>
                  <td>{l.aislada ? <em>Aislada</em> : l.familia ? <Link href={rutaFamilia(l.familia)}>{nombreDe(l.familia)}</Link> : "—"}</td>
                  <td>{l.paises.slice(0, 4).map((p) => nombreTerritorio(p)).join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginas total={lista.length} pagina={pagina} porPagina={POR_PAGINA} base={(p) => enlace(aes, macro, p)} />
      </section>

      <section className="vx-li-seccion">
        <h2>Familias más castigadas</h2>
        <p className="vx-li-nota">Familias con 15 lenguas o más, ordenadas por la proporción de lenguas evaluadas que están en retroceso, moribundas, casi extintas o ya extintas.</p>
        <div className="vx-li-tabla-caja">
          <table className="vx-li-tabla">
            <thead>
              <tr>
                <th>Familia</th>
                <th className="num">Lenguas</th>
                <th className="num">En riesgo</th>
                <th className="num">Extintas</th>
                <th className="num">Proporción</th>
              </tr>
            </thead>
            <tbody>
              {familias.map((x) => (
                <tr key={x.f.nodo.id}>
                  <td>
                    <Link href={rutaFamilia(x.f.nodo.id)}>{nombreNodo(x.f.nodo)}</Link>
                  </td>
                  <td className="num">{x.f.n}</td>
                  <td className="num">{x.riesgo}</td>
                  <td className="num">{x.extintas}</td>
                  <td className="num">{Math.round(x.pct * 100)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vx-li-seccion">
        <h2>Países con más lenguas en riesgo</h2>
        <p className="vx-li-nota">Lenguas en retroceso, moribundas o casi extintas con presencia en cada país (una lengua puede contar en varios).</p>
        <ul className="vx-li-chips">
          {topPaises.map(([iso, n]) => (
            <li key={iso}>
              <Link href={rutaPais(iso)}>
                {bandera(iso)} {nombreTerritorio(iso)} · {n}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </MarcoLingua>
  );
}
