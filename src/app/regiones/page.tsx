import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { Marco, Bandera } from "@/components/planeta/marco";
import { fmt } from "@/lib/planeta/indicadores";
import { mundo, regiones } from "@/lib/planeta/datos";
import { miles } from "@/lib/mundos/formato";

// ═══════════════════════════════════════════════════════════════════
// v406.5 · /regiones — TERRITORIOS Y REGIONES
// Los continentes del censo y sus 24 subregiones, con las cifras de sus
// países SUMADAS (población, superficie, PIB, gasto militar) o PONDERADAS
// (renta por habitante, esperanza de vida). Cada subregión tiene su página.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Regiones del mundo: las 24 subregiones con su población y su economía | VANGUARD",
  description:
    "El Caribe, Centroamérica, el Sudeste asiático, África occidental y las demás subregiones del mundo con su población, PIB, gasto militar y esperanza de vida sumados con datos del Banco Mundial.",
  alternates: { canonical: `${SITE_URL}/regiones` },
};

export default function RegionesPage() {
  const m = mundo();
  const regs = regiones();
  return (
    <Marco
      ruta="/regiones"
      volanta="Planeta en cifras · Territorios y regiones"
      titulo="Las regiones del mundo"
      sub="Cada país ya tiene su ficha. Aquí se suman: cuánta gente vive en cada región, cuánto produce, cuánto gasta en defensa y cuántos años vive su población. Toca una subregión para ver sus países uno a uno."
      fuente={
        <>
          Regiones y subregiones: censo geográfico de la casa (src/lib/geo-paises.ts, clasificación de Naciones Unidas). Cifras: tabla única del planeta
          (Banco Mundial API v2, captura 17-nov-2026). La renta por habitante de una región es su PIB total dividido entre la población de los países con
          PIB; la esperanza de vida, la media ponderada por población. Cada tarjeta dice cuántos países aportan dato.
        </>
      }
    >
      <div className="vx-pl-cifras">
        {regs.map((r) => (
          <a key={r.region} href={`#${r.region.toLowerCase()}`} className="vx-pl-cifra" style={{ textDecoration: "none", color: "inherit" }}>
            <b>{r.nombre}</b>
            <span>
              {fmt("pob", r.agg.pob)} · {miles((r.agg.pob / m.pob) * 100, 1)} % del mundo
            </span>
            <small>
              {r.subs.length} subregiones · {r.agg.paises} países y territorios
            </small>
          </a>
        ))}
      </div>

      {regs.map((r) => (
        <section key={r.region} id={r.region.toLowerCase()} className="vx-pl-sec" style={{ scrollMarginTop: 80 }}>
          <h2 className="vx-pl-h2">{r.nombre}</h2>
          <p className="vx-pl-h2-sub">
            {fmt("pob", r.agg.pob)} · PIB {fmt("pib", r.agg.pib)} · {fmt("pibPC", r.agg.pibPC)} por habitante · vida media {fmt("vida", r.agg.vida)}
          </p>
          <div className="vx-pl-rejilla">
            {r.subs.map((s) => (
              <Link key={s.slug} href={`/regiones/${s.slug}`} className="vx-pl-tarjeta">
                <h3>{s.nombre}</h3>
                <p>
                  {fmt("pob", s.agg.pob)} · {miles((s.agg.pob / m.pob) * 100, 1)} % del mundo
                </p>
                <p>
                  PIB {fmt("pib", s.agg.pib)} · {fmt("pibPC", s.agg.pibPC)}/hab.
                </p>
                <p className="vx-pl-meta">
                  {s.agg.paises} países · el más poblado:{" "}
                  {s.agg.mayorPob ? (
                    <>
                      <Bandera iso2={s.agg.mayorPob.iso2} nombre={s.agg.mayorPob.nombre} />
                      {s.agg.mayorPob.nombre}
                    </>
                  ) : (
                    "sin dato"
                  )}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">Las 24 subregiones en una tabla</h2>
        <div className="vx-pl-tabla-caja">
          <table className="vx-pl-tabla">
            <thead>
              <tr>
                <th>Subregión</th>
                <th className="n">Países</th>
                <th className="n">Población</th>
                <th className="n">PIB</th>
                <th className="n">PIB/hab.</th>
                <th className="n">Gasto militar</th>
                <th className="n">Vida</th>
              </tr>
            </thead>
            <tbody>
              {regs
                .flatMap((r) => r.subs)
                .sort((a, b) => b.agg.pob - a.agg.pob)
                .map((s) => (
                  <tr key={s.slug}>
                    <td>
                      <Link href={`/regiones/${s.slug}`}>{s.nombre}</Link>
                    </td>
                    <td className="n">{s.agg.paises}</td>
                    <td className="n">{fmt("pob", s.agg.pob)}</td>
                    <td className="n">{fmt("pib", s.agg.pib)}</td>
                    <td className="n">{fmt("pibPC", s.agg.pibPC)}</td>
                    <td className="n">{fmt("mil", s.agg.mil)}</td>
                    <td className="n">{fmt("vida", s.agg.vida)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </Marco>
  );
}
