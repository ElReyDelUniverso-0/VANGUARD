import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { Marco } from "@/components/planeta/marco";
import { BuscaTuPais } from "@/components/planeta/busca-tu-pais";
import { fmt } from "@/lib/planeta/indicadores";
import { agregar, filaDe, filasPlaneta, mundo } from "@/lib/planeta/datos";
import { ORGANIZACIONES, REVISION_ORGANIZACIONES, TIPOS_ORGANIZACION, compartidos, type TipoOrganizacion } from "@/lib/planeta/organizaciones";
import { miles } from "@/lib/mundos/formato";
import type { FilaPlaneta } from "@/lib/planeta/indicadores";

// ═══════════════════════════════════════════════════════════════════
// v406.5 · /organizaciones — QUIÉN SE SIENTA CON QUIÉN
// Dieciséis bloques con sus miembros de pleno derecho, su fuente oficial y
// su peso real (población, PIB y gasto militar sumados con la tabla única
// del planeta). Un buscador dice a qué bloques pertenece cualquier país.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Organizaciones internacionales: OTAN, UE, BRICS, OPEP, G20 y más, con su peso real | VANGUARD",
  description:
    "Dieciséis organizaciones internacionales con sus miembros, su fuente oficial y lo que pesan juntas en población, PIB y gasto militar. Busca a qué bloques pertenece tu país.",
  alternates: { canonical: `${SITE_URL}/organizaciones` },
};

function filasDe(miembros: string[]): FilaPlaneta[] {
  return miembros.map((m) => filaDe(m)).filter((f): f is FilaPlaneta => !!f);
}

export default function OrganizacionesPage() {
  const m = mundo();
  const datos = ORGANIZACIONES.map((o) => ({ o, agg: agregar(filasDe(o.miembros)) }));
  const tipos = Object.keys(TIPOS_ORGANIZACION) as TipoOrganizacion[];
  const brics = ORGANIZACIONES.find((o) => o.clave === "brics");
  const g7 = ORGANIZACIONES.find((o) => o.clave === "g7");
  const aggBrics = brics ? agregar(filasDe(brics.miembros)) : null;
  const aggG7 = g7 ? agregar(filasDe(g7.miembros)) : null;
  const otan = ORGANIZACIONES.find((o) => o.clave === "otan");
  const ue = ORGANIZACIONES.find((o) => o.clave === "union-europea");
  const otanUe = otan && ue ? compartidos(otan, ue).length : null;

  // lo que viaja al buscador del cliente: país → bloques (solo claves)
  const paises = filasPlaneta()
    .map((f) => ({ iso2: f.iso2, nombre: f.nombre, orgs: ORGANIZACIONES.filter((o) => o.miembros.includes(f.iso2)).map((o) => o.clave) }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const siglas = Object.fromEntries(ORGANIZACIONES.map((o) => [o.clave, o.sigla]));

  return (
    <Marco
      ruta="/organizaciones"
      volanta="Planeta en cifras · Organizaciones internacionales"
      titulo="Quién se sienta con quién"
      sub="Dieciséis organizaciones que aparecen cada día en las noticias, con sus miembros de pleno derecho, su fuente oficial y lo que pesan juntas en población, economía y defensa."
      fuente={
        <>
          Miembros: la fuente oficial enlazada en cada bloque, lista revisada el {REVISION_ORGANIZACIONES}. Solo se cuentan miembros de pleno derecho (los
          observadores, socios e invitados se explican en la nota de cada bloque). Cifras: tabla única del planeta (Banco Mundial API v2, captura
          17-nov-2026); el peso sobre el mundo se calcula contra la suma de {m.cobertura.pob} países y territorios.
        </>
      }
    >
      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">¿A qué bloques pertenece un país?</h2>
        <p className="vx-pl-h2-sub">Escribe el nombre de cualquier país.</p>
        <BuscaTuPais paises={paises} siglas={siglas} />
      </section>

      {aggBrics && aggG7 ? (
        <section className="vx-pl-sec">
          <h2 className="vx-pl-h2">BRICS frente al G7</h2>
          <p className="vx-pl-h2-sub">La comparación que más se repite en la prensa, con las cifras de cada miembro sumadas.</p>
          <div className="vx-pl-tabla-caja">
            <table className="vx-pl-tabla">
              <thead>
                <tr>
                  <th></th>
                  <th className="n">BRICS ({brics?.miembros.length})</th>
                  <th className="n">G7 ({g7?.miembros.length})</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Población</td><td className="n">{fmt("pob", aggBrics.pob)} · {miles((aggBrics.pob / m.pob) * 100, 1)} %</td><td className="n">{fmt("pob", aggG7.pob)} · {miles((aggG7.pob / m.pob) * 100, 1)} %</td></tr>
                <tr><td>PIB (US$ corrientes)</td><td className="n">{fmt("pib", aggBrics.pib)} · {miles((aggBrics.pib / m.pib) * 100, 1)} %</td><td className="n">{fmt("pib", aggG7.pib)} · {miles((aggG7.pib / m.pib) * 100, 1)} %</td></tr>
                <tr><td>Renta por habitante</td><td className="n">{fmt("pibPC", aggBrics.pibPC)}</td><td className="n">{fmt("pibPC", aggG7.pibPC)}</td></tr>
                <tr><td>Gasto militar</td><td className="n">{fmt("mil", aggBrics.mil)}</td><td className="n">{fmt("mil", aggG7.mil)}</td></tr>
                <tr><td>Esperanza de vida media</td><td className="n">{fmt("vida", aggBrics.vida)}</td><td className="n">{fmt("vida", aggG7.vida)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="vx-pl-h2-sub" style={{ marginTop: 8 }}>
            El PIB va en dólares corrientes (tipo de cambio de mercado), no en paridad de poder adquisitivo: con PPA el peso de los BRICS sería mayor.
            {otanUe !== null ? <> Dato de solapamiento: {otanUe} países son a la vez de la OTAN y de la UE.</> : null}
          </p>
        </section>
      ) : null}

      {tipos.map((t) => {
        const lista = datos.filter((d) => d.o.tipo === t);
        if (lista.length === 0) return null;
        return (
          <section key={t} className="vx-pl-sec">
            <h2 className="vx-pl-h2">{TIPOS_ORGANIZACION[t]}</h2>
            <div className="vx-pl-rejilla">
              {lista.map(({ o, agg }) => (
                <Link key={o.clave} href={`/organizaciones/${o.clave}`} className="vx-pl-tarjeta">
                  <h3>
                    {o.sigla} <span style={{ color: "#6b7c90", fontWeight: 400 }}>· {o.miembros.length} miembros</span>
                  </h3>
                  <p>{o.proposito}</p>
                  <p className="vx-pl-meta">
                    {miles((agg.pob / m.pob) * 100, 1)} % de la población · {miles((agg.pib / m.pib) * 100, 1)} % del PIB mundial · desde {o.fundacion}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">Todos los bloques en una tabla</h2>
        <div className="vx-pl-tabla-caja">
          <table className="vx-pl-tabla">
            <thead>
              <tr>
                <th>Bloque</th>
                <th className="n">Miembros</th>
                <th className="n">Población</th>
                <th className="n">% mundo</th>
                <th className="n">PIB</th>
                <th className="n">% PIB</th>
                <th className="n">Gasto militar</th>
              </tr>
            </thead>
            <tbody>
              {[...datos]
                .sort((a, b) => b.agg.pib - a.agg.pib)
                .map(({ o, agg }) => (
                  <tr key={o.clave}>
                    <td>
                      <Link href={`/organizaciones/${o.clave}`}>{o.sigla}</Link>
                    </td>
                    <td className="n">{o.miembros.length}</td>
                    <td className="n">{fmt("pob", agg.pob)}</td>
                    <td className="n">{miles((agg.pob / m.pob) * 100, 1)} %</td>
                    <td className="n">{fmt("pib", agg.pib)}</td>
                    <td className="n">{miles((agg.pib / m.pib) * 100, 1)} %</td>
                    <td className="n">{fmt("mil", agg.mil)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </Marco>
  );
}
