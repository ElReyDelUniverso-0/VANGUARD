import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
import { Marco, Bandera } from "@/components/planeta/marco";
import { GuardarPieza } from "@/components/planeta/guardar";
import { fmt } from "@/lib/planeta/indicadores";
import { mundo, subregionDe, subregiones } from "@/lib/planeta/datos";
import { ORGANIZACIONES } from "@/lib/planeta/organizaciones";
import { miles } from "@/lib/mundos/formato";

// ═══════════════════════════════════════════════════════════════════
// v406.5 · /regiones/[clave] — UNA SUBREGIÓN, PAÍS POR PAÍS
// Sus cifras sumadas, el peso de cada país dentro de ella, los bloques
// que la atraviesan y el comparador listo con sus gigantes.
// ═══════════════════════════════════════════════════════════════════

export const dynamicParams = false;

export function generateStaticParams() {
  return subregiones().map((s) => ({ clave: s.slug }));
}

interface Props {
  params: Promise<{ clave: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { clave } = await params;
  const s = subregionDe(clave);
  if (!s) return { title: "Región no encontrada | VANGUARD" };
  return {
    title: `${s.nombre}: ${s.agg.paises} países, población y economía | VANGUARD`,
    description: `${s.nombre} (${s.regionEs}) suma ${fmt("pob", s.agg.pob)} y un PIB de ${fmt("pib", s.agg.pib)}. Sus ${s.agg.paises} países uno a uno con datos del Banco Mundial.`,
    alternates: { canonical: `${SITE_URL}/regiones/${s.slug}` },
  };
}

export default async function SubregionPage({ params }: Props) {
  const { clave } = await params;
  const s = subregionDe(clave);
  if (!s) notFound();
  const m = mundo();
  const isos = new Set(s.filas.map((f) => f.iso2));
  const bloques = ORGANIZACIONES.map((o) => ({ o, dentro: o.miembros.filter((x) => isos.has(x)).length }))
    .filter((x) => x.dentro > 0)
    .sort((a, b) => b.dentro - a.dentro);
  const gigantes = s.filas.filter((f) => f.v.pob !== null).slice(0, 4).map((f) => f.iso2);
  const hermanas = subregiones().filter((x) => x.region === s.region && x.slug !== s.slug);

  return (
    <Marco
      ruta="/regiones"
      volanta={`Planeta en cifras · ${s.regionEs} · subregión`}
      titulo={s.nombre}
      sub={
        <>
          {s.agg.paises} países y territorios que suman {fmt("pob", s.agg.pob)} ({miles((s.agg.pob / m.pob) * 100, 2)} % de la humanidad) y un PIB de{" "}
          {fmt("pib", s.agg.pib)} ({miles((s.agg.pib / m.pib) * 100, 2)} % del mundo).
        </>
      }
      fuente={
        <>
          Subregión «{s.original}» del censo geográfico de la casa (clasificación de Naciones Unidas). Cifras: Banco Mundial API v2 (captura 17-nov-2026)
          y atlas de la casa, las mismas de cada ficha de país. Cobertura: población {s.agg.cobertura.pob}/{s.agg.paises}, PIB {s.agg.cobertura.pib}/
          {s.agg.paises}, gasto militar {s.agg.cobertura.mil}/{s.agg.paises}, esperanza de vida {s.agg.cobertura.vida}/{s.agg.paises}.
        </>
      }
    >
      <div className="vx-pl-cifras">
        <div className="vx-pl-cifra"><b>{fmt("pob", s.agg.pob)}</b><span>población sumada</span></div>
        <div className="vx-pl-cifra"><b>{fmt("sup", s.agg.sup)}</b><span>superficie</span><small>{fmt("dens", s.agg.dens)}</small></div>
        <div className="vx-pl-cifra"><b>{fmt("pib", s.agg.pib)}</b><span>PIB sumado</span><small>{fmt("pibPC", s.agg.pibPC)} por habitante</small></div>
        <div className="vx-pl-cifra"><b>{fmt("mil", s.agg.mil)}</b><span>gasto militar sumado</span><small>{s.agg.cobertura.mil} países con dato</small></div>
        <div className="vx-pl-cifra"><b>{fmt("vida", s.agg.vida)}</b><span>esperanza de vida media</span><small>ponderada por población</small></div>
      </div>

      <div className="vx-pl-fila" style={{ marginTop: 14 }}>
        <GuardarPieza titulo={`Región · ${s.nombre}`} href={`/regiones/${s.slug}`} nota={`${s.agg.paises} países · ${fmt("pob", s.agg.pob)}`} etiquetas={["region", s.slug]} />
        {gigantes.length >= 2 ? (
          <Link href={`/comparador?p=${gigantes.join(",")}`} className="vx-pl-btn">Comparar sus gigantes →</Link>
        ) : null}
        <Link href="/regiones" className="vx-pl-btn">← Todas las regiones</Link>
      </div>

      <section className="vx-pl-sec">
        <h2 className="vx-pl-h2">Sus países, uno a uno</h2>
        <div className="vx-pl-tabla-caja">
          <table className="vx-pl-tabla">
            <thead>
              <tr>
                <th>País</th>
                <th className="n">Población</th>
                <th className="n">% región</th>
                <th className="n">PIB</th>
                <th className="n">PIB/hab.</th>
                <th className="n">Gasto mil.</th>
                <th className="n">Vida</th>
              </tr>
            </thead>
            <tbody>
              {s.filas.map((f) => (
                <tr key={f.iso2} className={f.iso2 === "do" ? "vx-pl-resalta" : undefined}>
                  <td>
                    <Link href={`/mundos/${f.iso2}`}>
                      <Bandera iso2={f.iso2} nombre={f.nombre} />
                      {f.nombre}
                    </Link>
                  </td>
                  <td className="n">{fmt("pob", f.v.pob)}</td>
                  <td className="n">{f.v.pob !== null && s.agg.pob > 0 ? `${miles((f.v.pob / s.agg.pob) * 100, 1)} %` : "—"}</td>
                  <td className="n">{fmt("pib", f.v.pib)}</td>
                  <td className="n">{fmt("pibPC", f.v.pibPC)}</td>
                  <td className="n">{fmt("mil", f.v.mil)}</td>
                  <td className="n">{fmt("vida", f.v.vida)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {bloques.length > 0 ? (
        <section className="vx-pl-sec">
          <h2 className="vx-pl-h2">Los bloques que la atraviesan</h2>
          <p className="vx-pl-h2-sub">Organizaciones con al menos un miembro en {s.nombre}.</p>
          <div>
            {bloques.map(({ o, dentro }) => (
              <Link key={o.clave} href={`/organizaciones/${o.clave}`} className="vx-pl-chip">
                {o.sigla} · {dentro} de {o.miembros.length}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {hermanas.length > 0 ? (
        <section className="vx-pl-sec">
          <h2 className="vx-pl-h2">Otras subregiones de {s.regionEs}</h2>
          <div>
            {hermanas.map((h) => (
              <Link key={h.slug} href={`/regiones/${h.slug}`} className="vx-pl-chip">
                {h.nombre} · {fmt("pob", h.agg.pob)}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </Marco>
  );
}
