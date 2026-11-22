// ═══════════════════════════════════════════════════════════════════
// WAR & HUMANITY en la PORTADA — la sala nueva tiene que verse desde
// la puerta de la casa. Componente de SERVIDOR y cero JS: lee la misma
// instantánea que la sala (compactada de Banco Mundial/UCDP y UNHCR) y
// enseña tres cosas, cada una con su fuente y su año:
//
//   · muertes en combate del último año consolidado (UCDP/PRIO vía BM)
//   · los tres países con más muertes ese año
//   · personas desplazadas por la fuerza en el mundo (UNHCR)
//
// No hay una sola cifra estimada por la casa: si un dato no está, no se
// pinta. El aviso de «no es el total de víctimas civiles» viaja con la
// tira, porque el número de combate NO cuenta a los civiles asesinados.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { SNAP, totalAnio, ranking, cifra } from "@/lib/guerra/datos";
import { PAISES_GEO } from "@/lib/geo-paises";

const CSS = `
.vxwh-tira{position:relative;display:grid;gap:clamp(18px,3vw,40px);grid-template-columns:1fr;
  padding:clamp(20px,3.4vw,38px);border:1px solid rgba(255,90,70,.28);border-radius:4px;
  background:radial-gradient(120% 140% at 8% 0%,rgba(120,20,12,.55),rgba(8,10,12,.94) 62%),#08090b;
  overflow:hidden}
@media(min-width:900px){.vxwh-tira{grid-template-columns:1.15fr 1fr;align-items:start}}
.vxwh-tira::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 44px);opacity:.5}
.vxwh-tira h2{margin:.35rem 0 .6rem;font-size:clamp(1.5rem,3.4vw,2.35rem);line-height:1.12;letter-spacing:-.01em}
.vxwh-tira h2 em{font-style:normal;color:#ff6a4d}
.vxwh-tira p{max-width:56ch;color:rgba(233,238,241,.82);line-height:1.6;font-size:.98rem}
.vxwh-tira-acc{display:flex;flex-wrap:wrap;gap:.6rem;margin-top:1.1rem}
.vxwh-tira-cifras{display:grid;gap:.9rem;margin:0}
.vxwh-tira-cifras>div{padding:.85rem .95rem;border:1px solid rgba(255,255,255,.12);border-left:2px solid #ff5a46;
  background:rgba(0,0,0,.35);display:flex;flex-direction:column;gap:.25rem}
.vxwh-tira-cifras dt{font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:rgba(233,238,241,.6)}
.vxwh-tira-cifras dd{margin:0;font-size:clamp(1.5rem,3vw,2rem);font-variant-numeric:tabular-nums;font-weight:600;color:#fff}
.vxwh-tira-cifras>div>span{font-size:.72rem;line-height:1.4;color:rgba(233,238,241,.55)}
.vxwh-tira-top dd{display:flex;flex-wrap:wrap;gap:.35rem .9rem;font-size:1rem !important}
.vxwh-tira-top dd a{color:rgba(233,238,241,.9);text-decoration:none;border-bottom:1px solid rgba(255,90,70,.45);
  padding-bottom:1px;font-size:.95rem;font-weight:400}
.vxwh-tira-top dd a b{font-variant-numeric:tabular-nums;color:#ff8a72;font-weight:600;margin-left:.25rem}
.vxwh-tira-top dd a:hover{border-color:#ff6a4d;color:#fff}
`;

const NOMBRE = new Map(PAISES_GEO.map((p) => [p.iso3, p.nombre]));

export function TiraWarHumanity() {
  const anio = SNAP.anios.combate[SNAP.anios.combate.length - 1];
  const anioDesp = SNAP.anios.desplazamiento[SNAP.anios.desplazamiento.length - 1];
  const total = totalAnio(SNAP.combate, anio);
  const top = ranking(SNAP.combate, anio).slice(0, 3);
  const desp = SNAP.mundo.find((m) => m.anio === anioDesp);
  const forzados = desp ? desp.refugiados + desp.desplazadosInternos : undefined;

  if (!desp && total.total === 0) return null;

  return (
    <section className="vxwh-tira vx-entra" aria-labelledby="vxwh-t">
      <style>{CSS}</style>
      <span className="vx-mira vx-esquinas" aria-hidden />
      <div className="vxwh-tira-txt">
        <span className="vx-sello">Centro mundial · guerras y crisis humanitarias</span>
        <h2 id="vxwh-t">
          El mapa de las guerras, <em>con el número al lado</em>.
        </h2>
        <p>
          Muertos en combate, desplazados y refugiados, país por país y año por año, sobre el mismo globo
          de la casa. Cada cifra lleva su fuente y su año; lo que la fuente no mide, la sala lo declara
          en lugar de rellenarlo.
        </p>
        <div className="vxwh-tira-acc">
          <Link href="/war-humanity" className="vx-btn">
            Abrir War &amp; Humanity
          </Link>
          <Link href="/war-humanity?vista=desplazamiento&anio=2024" className="vx-btn vx-btn-sec">
            Ver desplazamiento
          </Link>
        </div>
      </div>

      <dl className="vxwh-tira-cifras">
        {total.total > 0 && (
          <div>
            <dt>Muertes en combate · {anio}</dt>
            <dd>{cifra(total.total)}</dd>
            <span>{total.paises} países con dato · UCDP/PRIO vía Banco Mundial</span>
          </div>
        )}
        {forzados !== undefined && desp && (
          <div>
            <dt>Desplazados por la fuerza · {desp.anio}</dt>
            <dd>{cifra(forzados)}</dd>
            <span>
              {cifra(desp.refugiados)} refugiados + {cifra(desp.desplazadosInternos)} desplazados internos · UNHCR
            </span>
          </div>
        )}
        {top.length > 0 && (
          <div className="vxwh-tira-top">
            <dt>Donde más se muere · {anio}</dt>
            <dd>
              {top.map((t) => (
                <Link key={t.iso3} href={`/war-humanity?anio=${anio}&pais=${t.iso3}#pais`}>
                  {NOMBRE.get(t.iso3) ?? t.iso3} <b>{cifra(t.valor)}</b>
                </Link>
              ))}
            </dd>
            <span>Sólo muertes en combate registradas: no incluye a las víctimas civiles no verificadas.</span>
          </div>
        )}
      </dl>
    </section>
  );
}
