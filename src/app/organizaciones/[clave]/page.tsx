import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { Marco, Bandera } from "@/components/planeta/marco";
import { GuardarPieza } from "@/components/planeta/guardar";
import { MapaMiembros } from "@/components/planeta/mapa-miembros";
import { fmt, type FilaPlaneta } from "@/lib/planeta/indicadores";
import { agregar, filaDe, mundo } from "@/lib/planeta/datos";
import { ORGANIZACIONES, REVISION_ORGANIZACIONES, TIPOS_ORGANIZACION, compartidos, organizacionDe } from "@/lib/planeta/organizaciones";
import { miles } from "@/lib/mundos/formato";
import { POR_ISO2 } from "@/lib/geo-paises";

// ═══════════════════════════════════════════════════════════════════
// v406.5 · /organizaciones/[clave] — UN BLOQUE POR DENTRO
// El mapa de sus miembros, lo que pesan juntos, quién pesa más dentro, con
// qué otros bloques se solapa y la fuente oficial donde se comprueba.
// ═══════════════════════════════════════════════════════════════════

export const dynamicParams = false;

export function generateStaticParams() {
  return ORGANIZACIONES.map((o) => ({ clave: o.clave }));
}

interface Props {
  params: Promise<{ clave: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clave } = await params;
  const o = organizacionDe(clave);
  if (!o) return { title: "Organización no encontrada | VANGUARD" };
  return {
    title: `${o.sigla}: sus ${o.miembros.length} miembros y lo que pesan | VANGUARD`,
    description: `${o.nombre} (${o.fundacion}, sede: ${o.sede}). ${o.proposito} Miembros, mapa, población, PIB y gasto militar sumados.`,
    alternates: { canonical: `${SITE_URL}/organizaciones/${o.clave}` },
  };
}

export default async function OrganizacionPage({ params }: Props) {
  const { clave } = await params;
  const o = organizacionDe(clave);
  if (!o) notFound();
  const m = mundo();
  const filas = o.miembros.map((x) => filaDe(x)).filter((f): f is FilaPlaneta => !!f);
  const agg = agregar(filas);
  const orden = [...filas].sort((a, b) => (b.v.pib ?? -1) - (a.v.pib ?? -1));
  const solapes = ORGANIZACIONES.filter((x) => x.clave !== o.clave)
    .map((x) => ({ x, comunes: compartidos(o, x) }))
    .filter((s) => s.comunes.length > 0)
    .sort((a, b) => b.comunes.length - a.comunes.length);
  const top = orden.slice(0, 4).map((f) => f.iso2);
  const pesoMayor = orden[0] && agg.pib > 0 && orden[0].v.pib ? orden[0].v.pib / agg.pib : null;

  return (
    <Marco
      ruta="/organizaciones"
      volanta={`Planeta en cifras · ${TIPOS_ORGANIZACION[o.tipo]} · desde ${o.fundacion}`}
      titulo={`${o.sigla} · ${o.nombre}`}
      sub={o.proposito}
      fuente={
        <>
          Lista de miembros: <a href={o.fuente.url} target="_blank" rel="noopener noreferrer">{o.fuente.nombre}</a>, revisada el {REVISION_ORGANIZACIONES}.
          Cifras: Banco Mundial API v2 (captura 17-nov-2026) y atlas de la casa, las mismas de cada ficha de país. Cobertura: PIB {agg.cobertura.pib}/
          {filas.length} miembros, gasto militar {agg.cobertura.mil}/{filas.length}.
        </>
      }
    >
      <div className="vx-pl-panel" style={{ marginTop: 14 }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          <b>Por qué importa hoy.</b> {o.porQue}
        </p>
        <p style={{ margin: "8px 0 0", lineHeight: 1.6, color: "#9fb0c3", fontSize: 14 }}>
          <b>Nota.</b> {o.nota} · Sede: {o.sede}.
        </p>
      </div>

      <div className="vx-pl-cifras">
        <div className="vx-pl-cifra"><b>{o.miembros.length}</b><span>miembros de pleno derecho</span></div>
        <div className="vx-pl-cifra"><b>{fmt("pob", agg.pob)}</b><span>{miles((agg.pob / m.pob) * 100, 1)} % de la humanidad</span></div>
        <div className="vx-pl-cifra"><b>{fmt("pib", agg.pib)}</b><span>{miles((agg.pib / m.pib) * 100, 1)} % del PIB mundial</span><small>{fmt("pibPC", agg.pibPC)} por habitante</small></div>
        <div className="vx-pl-cifra"><b>{fmt("mil", agg.mil)}</b><span>{m.mil > 0 ? `${miles((agg.mil / m.mil) * 100, 1)} % del gasto militar mundial` : "gasto militar"}</span></div>
        <div className="vx-pl-cifra"><b>{fmt("sup", agg.sup)}</b><span>{miles((agg.sup / m.sup) * 100, 1)} % de la superficie de todos los países</span></div>
        {pesoMayor !== null && orden[0] ? (
          <div className="vx-pl-cifra"><b>{miles(pesoMayor * 100, 0)} %</b><span>del PIB del bloque es de {orden[0].nombre}</span></div>
        ) : null}
      </div>

      <div className="vx-pl-fila" style={{ marginTop: 14 }}>
        <GuardarPieza titulo={`Bloque · ${o.sigla}`} href={`/organizaciones/${o.clave}`} nota={`${o.miembros.length} miembros · ${fmt("pib", agg.pib)} de PIB`} etiquetas={["organizacion", o.clave]} />
        {top.length >= 2 ? <Link href={`/comparador?p=${top.join(",")}`} className="vx-pl-btn">Comparar sus mayores economías →</Link> : null}
        <Link href="/organizaciones" className="vx-pl-btn">← Todos los bloques</Link>
      </div>

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">El mapa de sus miembros</h2>
        <MapaMiembros miembros={o.miembros} titulo={`Miembros de ${o.sigla}`} />
      </section>

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">Sus miembros, de mayor a menor economía</h2>
        <div className="vx-pl-tabla-caja">
          <table className="vx-pl-tabla">
            <thead>
              <tr>
                <th>País</th>
                <th className="n">PIB</th>
                <th className="n">% del bloque</th>
                <th className="n">Población</th>
                <th className="n">PIB/hab.</th>
                <th className="n">Gasto mil.</th>
                <th className="n">Mil. % PIB</th>
              </tr>
            </thead>
            <tbody>
              {orden.map((f) => (
                <tr key={f.iso2} className={f.iso2 === "do" ? "vx-pl-resalta" : undefined}>
                  <td>
                    <Link href={`/mundos/${f.iso2}`}>
                      <Bandera iso2={f.iso2} nombre={f.nombre} />
                      {f.nombre}
                    </Link>
                  </td>
                  <td className="n">{fmt("pib", f.v.pib)}</td>
                  <td className="n">{f.v.pib !== null && agg.pib > 0 ? `${miles((f.v.pib / agg.pib) * 100, 1)} %` : "—"}</td>
                  <td className="n">{fmt("pob", f.v.pob)}</td>
                  <td className="n">{fmt("pibPC", f.v.pibPC)}</td>
                  <td className="n">{fmt("mil", f.v.mil)}</td>
                  <td className="n">{fmt("milPib", f.v.milPib)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {solapes.length > 0 ? (
        <section className="vx-pl-sec">
          <h2 className="vx-pl-h2">Con qué otros bloques se cruza</h2>
          <p className="vx-pl-h2-sub">Miembros que comparte con otras organizaciones de esta sección.</p>
          <div className="vx-pl-rejilla">
            {solapes.slice(0, 8).map(({ x, comunes }) => (
              <Link key={x.clave} href={`/organizaciones/${x.clave}`} className="vx-pl-tarjeta">
                <h3>
                  {x.sigla} <span style={{ color: "#6b7c90", fontWeight: 400 }}>· {comunes.length} en común</span>
                </h3>
                <p>{comunes.map((c) => POR_ISO2.get(c)?.nombre ?? c.toUpperCase()).join(", ")}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </Marco>
  );
}
