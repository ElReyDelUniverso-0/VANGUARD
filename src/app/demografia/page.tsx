import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { Marco, Bandera } from "@/components/planeta/marco";
import { GuardarPieza } from "@/components/planeta/guardar";
import { fmt } from "@/lib/planeta/indicadores";
import { anioTipico, filasPlaneta, mundo, puestoDe, ranking, regiones } from "@/lib/planeta/datos";
import { miles } from "@/lib/mundos/formato";

// ═══════════════════════════════════════════════════════════════════
// v406.5 · /demografia — POBLACIÓN Y DEMOGRAFÍA
// La pregunta que la casa no respondía: ¿cuántos somos, dónde vivimos y
// cuánto vivimos? Todo se calcula en el build con la tabla única del
// planeta (Banco Mundial SP.POP.TOTL y SP.DYN.LE00.IN, con su año).
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Población y demografía del mundo: cuántos somos y cuánto vivimos | VANGUARD",
  description:
    "La población del planeta país por país con datos del Banco Mundial: cuántos países reúnen la mitad de la humanidad, los más densos, la brecha de esperanza de vida y el reparto por regiones.",
  alternates: { canonical: `${SITE_URL}/demografia` },
};

/** Para la densidad se excluyen micro-estados: lo declaramos en la página. */
const SUP_MINIMA = 10_000;

export default function DemografiaPage() {
  const m = mundo();
  const pob = ranking("pob");
  const total = m.pob;
  const anioPob = anioTipico("pob");
  const anioVida = anioTipico("vida");

  let acc = 0;
  let mitad = 0;
  for (const p of pob) {
    acc += p.valor;
    if (acc >= total / 2) {
      mitad = p.puesto;
      break;
    }
  }
  const top10 = pob.slice(0, 10);
  const pesoTop10 = top10.reduce((t, p) => t + p.valor, 0) / total;

  const densos = ranking("dens").filter((p) => (p.fila.v.sup ?? 0) >= SUP_MINIMA);
  const vida = ranking("vida");
  const vidaMax = vida[0];
  const vidaMin = vida[vida.length - 1];

  const tramos = [
    { nombre: "Más de 100 millones", min: 1e8, max: Infinity },
    { nombre: "De 10 a 100 millones", min: 1e7, max: 1e8 },
    { nombre: "De 1 a 10 millones", min: 1e6, max: 1e7 },
    { nombre: "Menos de 1 millón", min: 0, max: 1e6 },
  ].map((t) => {
    const f = filasPlaneta().filter((x) => x.v.pob !== null && x.v.pob >= t.min && x.v.pob < t.max);
    return { ...t, paises: f.length, pob: f.reduce((s, x) => s + (x.v.pob ?? 0), 0) };
  });

  const regs = regiones().filter((r) => r.agg.pob > 0);
  const rdPob = puestoDe("pob", "do");
  const rdVida = puestoDe("vida", "do");
  const rd = filasPlaneta().find((f) => f.iso2 === "do");

  return (
    <Marco
      ruta="/demografia"
      volanta="Planeta en cifras · Población y demografía"
      titulo="¿Cuántos somos y cuánto vivimos?"
      sub={
        <>
          La población del planeta sumada país por país, dónde se concentra y cuántos años vive quien nace en cada lugar. Datos del Banco Mundial
          {anioPob ? <> (población: {anioPob}</> : null}
          {anioVida ? <>; esperanza de vida: {anioVida})</> : anioPob ? <>)</> : null}.
        </>
      }
      fuente={
        <>
          Fuentes: Banco Mundial SP.POP.TOTL (población), AG.SRF.TOTL.K2 (superficie) y SP.DYN.LE00.IN (esperanza de vida al nacer), API v2, captura
          17-nov-2026, más el atlas de la casa donde ya tenía la cifra. La suma mundial es la suma de los {m.cobertura.pob} países y territorios con dato
          del censo geográfico de la casa: puede diferir unas décimas del total que publica la ONU. Las medias regionales se ponderan por población.
        </>
      }
    >
      <div className="vx-pl-cifras">
        <div className="vx-pl-cifra">
          <b>{fmt("pob", total)}</b>
          <span>la suma de {m.cobertura.pob} países y territorios</span>
        </div>
        <div className="vx-pl-cifra">
          <b>{mitad} países</b>
          <span>reúnen a la mitad de la humanidad</span>
        </div>
        <div className="vx-pl-cifra">
          <b>{miles(pesoTop10 * 100, 1)} %</b>
          <span>de las personas vive en los 10 países más poblados</span>
        </div>
        <div className="vx-pl-cifra">
          <b>{fmt("vida", m.vida)}</b>
          <span>esperanza de vida media del planeta (ponderada)</span>
        </div>
        {vidaMax && vidaMin ? (
          <div className="vx-pl-cifra">
            <b>{miles(vidaMax.valor - vidaMin.valor, 1)} años</b>
            <span>
              separan {vidaMax.fila.nombre} de {vidaMin.fila.nombre}
            </span>
          </div>
        ) : null}
        <div className="vx-pl-cifra">
          <b>{fmt("dens", m.dens)}</b>
          <span>densidad media de la tierra habitada</span>
        </div>
      </div>

      <div className="vx-pl-fila" style={{ marginTop: 14 }}>
        <GuardarPieza titulo="Población y demografía del mundo" href="/demografia" nota={`${fmt("pob", total)} · ${mitad} países reúnen la mitad`} etiquetas={["demografia"]} />
        <Link href="/rankings/pob" className="vx-pl-btn">Lista completa de población →</Link>
        <Link href="/rankings/vida" className="vx-pl-btn">Lista completa de esperanza de vida →</Link>
      </div>

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">Los diez países más poblados</h2>
        <p className="vx-pl-h2-sub">Entre los diez suman {fmt("pob", top10.reduce((t, p) => t + p.valor, 0))}.</p>
        <div className="vx-pl-tabla-caja">
          <table className="vx-pl-tabla">
            <thead>
              <tr>
                <th className="n">#</th>
                <th>País</th>
                <th className="n">Población</th>
                <th className="n">% mundo</th>
                <th className="n">Vida</th>
                <th style={{ minWidth: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {top10.map((p) => (
                <tr key={p.fila.iso2}>
                  <td className="n">{p.puesto}</td>
                  <td>
                    <Link href={`/mundos/${p.fila.iso2}`}>
                      <Bandera iso2={p.fila.iso2} nombre={p.fila.nombre} />
                      {p.fila.nombre}
                    </Link>
                  </td>
                  <td className="n">{fmt("pob", p.valor)}</td>
                  <td className="n">{miles((p.valor / total) * 100, 1)} %</td>
                  <td className="n">{fmt("vida", p.fila.v.vida)}</td>
                  <td>
                    <div className="vx-pl-barrita">
                      <i style={{ width: `${(p.valor / top10[0].valor) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {top10.length >= 2 ? (
          <p className="vx-pl-h2-sub" style={{ marginTop: 8 }}>
            <Link href={`/comparador?p=${top10[0].fila.iso2},${top10[1].fila.iso2}`} style={{ color: "#5eead4" }}>
              Compara {top10[0].fila.nombre} y {top10[1].fila.nombre} cifra a cifra →
            </Link>
          </p>
        ) : null}
      </section>

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">Cómo se reparte la humanidad por regiones</h2>
        <p className="vx-pl-h2-sub">Población sumada, su peso sobre el total y la esperanza de vida media ponderada por población.</p>
        <div className="vx-pl-tabla-caja">
          <table className="vx-pl-tabla">
            <thead>
              <tr>
                <th>Región</th>
                <th className="n">Población</th>
                <th className="n">% mundo</th>
                <th className="n">Densidad</th>
                <th className="n">Vida media</th>
                <th style={{ minWidth: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {regs.map((r) => (
                <tr key={r.region}>
                  <td>
                    <Link href={`/regiones#${r.region.toLowerCase()}`}>{r.nombre}</Link>
                  </td>
                  <td className="n">{fmt("pob", r.agg.pob)}</td>
                  <td className="n">{miles((r.agg.pob / total) * 100, 1)} %</td>
                  <td className="n">{fmt("dens", r.agg.dens)}</td>
                  <td className="n">{fmt("vida", r.agg.vida)}</td>
                  <td>
                    <div className="vx-pl-barrita">
                      <i style={{ width: `${(r.agg.pob / regs[0].agg.pob) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">Países grandes y países pequeños</h2>
        <p className="vx-pl-h2-sub">Cuántos países hay en cada tramo de población y qué parte de la humanidad vive en ellos.</p>
        <div className="vx-pl-cifras" style={{ marginTop: 0 }}>
          {tramos.map((t) => (
            <div key={t.nombre} className="vx-pl-cifra">
              <b>{t.paises} países</b>
              <span>{t.nombre}</span>
              <small>{miles((t.pob / total) * 100, 1)} % de la población mundial</small>
            </div>
          ))}
        </div>
      </section>

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">Dónde se vive más y dónde menos</h2>
        <p className="vx-pl-h2-sub">Esperanza de vida al nacer: los diez primeros y los diez últimos de {vida.length} países con dato.</p>
        <div className="vx-pl-rejilla" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {[
            { t: "Más años de vida", l: vida.slice(0, 10) },
            { t: "Menos años de vida", l: vida.slice(-10).reverse() },
          ].map((b) => (
            <div key={b.t} className="vx-pl-panel">
              <h3 style={{ fontSize: 15, margin: "0 0 8px" }}>{b.t}</h3>
              <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", fontSize: 13.5, lineHeight: 1.75 }}>
                {b.l.map((p) => (
                  <li key={p.fila.iso2} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <Link href={`/mundos/${p.fila.iso2}`} style={{ color: "inherit", textDecoration: "none" }}>
                      <span style={{ color: "#6b7c90", marginRight: 6 }}>{p.puesto}.</span>
                      <Bandera iso2={p.fila.iso2} nombre={p.fila.nombre} />
                      {p.fila.nombre}
                    </Link>
                    <span style={{ color: "#9fb0c3" }}>{fmt("vida", p.valor)}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">Los países más densos</h2>
        <p className="vx-pl-h2-sub">
          Habitantes por km² entre los países de más de {miles(SUP_MINIMA)} km² (las ciudades-estado como Mónaco o Singapur se ven en la{" "}
          <Link href="/rankings/dens" style={{ color: "#5eead4" }}>lista completa</Link>).
        </p>
        <div className="vx-pl-rejilla">
          {densos.slice(0, 8).map((p, i) => (
            <Link key={p.fila.iso2} href={`/mundos/${p.fila.iso2}`} className="vx-pl-tarjeta">
              <h3>
                <span style={{ color: "#6b7c90" }}>{i + 1}.</span> <Bandera iso2={p.fila.iso2} nombre={p.fila.nombre} />
                {p.fila.nombre}
              </h3>
              <p>{fmt("dens", p.valor)}</p>
              <p className="vx-pl-meta">
                {fmt("pob", p.fila.v.pob)} en {fmt("sup", p.fila.v.sup)}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {rd ? (
        <section className="vx-pl-sec">
          <h2 className="vx-pl-h2">La República Dominicana en estas listas</h2>
          <div className="vx-pl-panel">
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              {fmt("pob", rd.v.pob)}
              {rdPob ? <> · puesto {rdPob.puesto} de {rdPob.de} en población</> : null}
              {rd.v.vida !== null ? <> · {fmt("vida", rd.v.vida)} de esperanza de vida</> : null}
              {rdVida ? <> (puesto {rdVida.puesto} de {rdVida.de})</> : null} · densidad {fmt("dens", rd.v.dens)}.
            </p>
            <p className="vx-pl-fila" style={{ marginTop: 10 }}>
              <Link href="/mundos/do" className="vx-pl-btn">Su ficha →</Link>
              <Link href="/comparador?p=do,ht" className="vx-pl-btn">Compárala con Haití →</Link>
              <Link href="/regiones/caribe" className="vx-pl-btn">El Caribe sumado →</Link>
            </p>
          </div>
        </section>
      ) : null}
    </Marco>
  );
}
