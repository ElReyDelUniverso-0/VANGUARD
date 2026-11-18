import { PuentesConocimientoPais } from "@/components/conocimiento/puentes-pais";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";
import { SEMILLA_ACONTECIMIENTOS } from "@/lib/nucleo/acontecimientos";
import { HISTORICAL_WARS } from "@/lib/game-data";
import { PAISES_GEO, POR_ISO2 } from "@/lib/geo-paises";
import { fichaPais, regionEnEspanol, type FichaPais } from "@/lib/mundos/ficha";
import { LIENZO, vecinosDe, territorioDe } from "@/lib/mundos/mapa";
import { vistaDePais } from "@/lib/mundos/mapa-detalle";
import { PUENTES, resolverPuente } from "@/lib/mundos/registro";
import { formatear, distancia as fmtDistancia, aniosDesde, miles } from "@/lib/mundos/formato";
import { GuardarEnEspacio } from "@/components/mundos/guardar-espacio";
// v405.16 · EL NÚCLEO, DENTRO DE LA FICHA — la función enlacesDePais() existía
// desde la v218 y no la montaba nadie: 249 fichas sin un solo chip. Ahora la
// ficha abre el teatro, el mapa, el acontecimiento y la búsqueda, y escucha los
// cables del país sin dejar de ser estática (el bloque los pide al núcleo).
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { enlacesDePais } from "@/lib/nucleo/relaciones";
import { enlacesDePaisARedaccion as enlacesRedaccion } from "@/lib/nucleo/nexo";
import { CablesDelPais } from "./cables-del-pais";
// v407.1 · EL PLANETA EN CIFRAS — la ficha en contexto: puestos mundiales,
// región sumada y bloques a los que pertenece (misma tabla que /comparador).
import { puestoDe } from "@/lib/planeta/datos";
import { INDICADOR } from "@/lib/planeta/indicadores";
import { organizacionesDePais } from "@/lib/planeta/organizaciones";
import { rutaRegionDe, SUBREGIONES_ES } from "@/lib/planeta/subregiones";
// v412.0 · LA BANDA DE NEXOS — la ficha deja de ser un callejón: dice qué
// modelo explica lo que enseña y dónde se comprueban sus cifras.
import { BandaNexos } from "@/components/arquitectura/banda-nexos";
import { nexosDePais } from "@/lib/arquitectura/nexos";

// ═══════════════════════════════════════════════════════════════════
// v405.12 · /mundos/[iso] — LA FICHA DE UN PAÍS
//
// Las cinco tablas de identidad de la casa, unidas por ISO-2, más las
// fronteras topológicas y los hechos del archivo. Lo que la casa no sabe de
// un país se dice con la palabra «sin dato» — nunca con estimaciones.
//
// Se prerenderiza para los 249 países del censo: se sirve desde el CDN, sin
// consultar la base de datos, y cada ficha enlaza a sus vecinos y a los
// módulos de información y simulación.
// ═══════════════════════════════════════════════════════════════════


export const dynamicParams = false;

export function generateStaticParams() {
  return PAISES_GEO.map((g) => ({ iso: g.iso2 }));
}

interface Props {
  params: Promise<{ iso: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { iso } = await params;
  const f = fichaPais(iso);
  if (!f) return { title: "País no encontrado | VANGUARD" };
  const donde = f.atlas ? `${f.atlas.capital}, ${regionEnEspanol(f.region)}` : regionEnEspanol(f.region);
  const datos = [
    f.poblacion !== null ? `población ${formatear("poblacion", f.poblacion / 1_000_000)}` : null,
    f.superficie !== null ? `superficie ${formatear("superficie", f.superficie)}` : null,
    f.censo && f.censo.pib !== null ? `PIB ${formatear("usd", f.censo.pib)}` : null,
    f.moneda ? `moneda ${f.moneda.nombre}` : null,
    f.militar ? `gasto militar ${formatear("usd", f.militar.gasto)}` : null,
  ].filter(Boolean);
  return {
    title: `${f.nombre} — ficha, fronteras y datos | VANGUARD`,
    description: `${f.nombre} (${donde}): ${datos.join(" · ")}. Fronteras reales con sus vecinos, conflicto en seguimiento, personas del poder y puente al simulador.`,
    alternates: { canonical: `${SITE_URL}/mundos/${f.iso2}` },
  };
}

const RAD = Math.PI / 180;
function distanciaKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = (b.lat - a.lat) * RAD;
  const dLng = (b.lng - a.lng) * RAD;
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * RAD) * Math.cos(b.lat * RAD) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(s)));
}

export default async function PaisPage({ params }: Props) {
  const { iso } = await params;
  const f: FichaPais | null = fichaPais(iso);
  if (!f) notFound();

  const vecinos = vecinosDe(f.iso2);
  const territorio = territorioDe(f.iso2);
  const vista = vistaDePais(f.iso2);

  // ── hechos armados reales del archivo donde aparece este país ──
  const acontecimientos = SEMILLA_ACONTECIMIENTOS.filter((a) => a.paisCodes.includes(f.iso2));

  // ── guerras históricas del archivo, por cercanía geográfica (declarada) ──
  const guerras = HISTORICAL_WARS.map((w) => ({ w, km: distanciaKm({ lat: f.lat, lng: f.lng }, w) }))
    .filter((x) => x.km <= 2600)
    .sort((a, b) => a.km - b.km)
    .slice(0, 5);

  const puentes = PUENTES.map((p) => ({ ...p, href: resolverPuente(p, f) }));

  // v407.1 — dónde queda este país en las listas del planeta
  const puestos = (["pob", "sup", "pib", "pibPC", "mil", "vida"] as const)
    .map((id) => ({ id, nombre: INDICADOR[id].nombre, p: puestoDe(id, f.iso2) }))
    .filter((x) => x.p !== null);
  const bloques = organizacionesDePais(f.iso2);
  const rutaRegion = rutaRegionDe(f.subregion);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Country",
    name: f.nombre,
    identifier: [f.iso2.toUpperCase(), f.iso3],
    description: f.atlas ? f.atlas.dato : `${f.nombre} en el censo geográfico de VANGUARD (${regionEnEspanol(f.region)})`,
    url: `${SITE_URL}/mundos/${f.iso2}`,
    ...(f.atlas ? { capital: { "@type": "City", name: f.atlas.capital } } : {}),
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
  };

  return (
    <main className="min-h-screen bg-[#05060b] text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <div className="mx-auto max-w-[1100px] px-3 py-6 sm:px-6">
        <nav className="vx-mp-sub" style={{ marginBottom: 12 }}>
          <Link href="/mundos" style={{ color: "#5eead4", textDecoration: "none" }}>
            ← El mapa de los mundos
          </Link>
          {" · "}
          <Link href="/atlas" style={{ color: "#5eead4", textDecoration: "none" }}>
            Atlas del planeta
          </Link>
          {territorio ? (
            <>
              {" · "}
              <span>{territorio.nombre}</span>
            </>
          ) : null}
        </nav>

        <header className="vx-mp-cab">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://flagcdn.com/w160/${f.iso2}.png`}
            alt={`Bandera de ${f.nombre}`}
            width={76}
            height={52}
            className="vx-mp-bandera"
          />
          <div>
            <h1 className="vx-mp-titulo">{f.nombre}</h1>
            <p className="vx-mp-sub">
              {regionEnEspanol(f.region)}
              {f.subregion ? ` · ${f.subregion}` : ""}
              {f.atlas ? ` · capital ${f.atlas.capital}` : ""}
            </p>
          </div>
          <div className="vx-mp-codigos">
            <span className="vx-mp-codigo">ISO {f.iso2.toUpperCase()}</span>
            <span className="vx-mp-codigo">{f.iso3}</span>
            <span className="vx-mp-codigo">NE {f.num}</span>
            <span className="vx-mp-codigo">{(f.lat).toFixed(1)}°, {(f.lng).toFixed(1)}°</span>
          </div>
        </header>

        {/* ── MAPA DE DETALLE ── */}
        <section className="vx-mp" style={{ marginTop: 16 }}>
          {vista ? (
            <div className="vx-mp-mapa">
              <svg
                viewBox={vista.vb}
                role="img"
                aria-label={`Mapa de ${f.nombre} con sus países vecinos`}
                preserveAspectRatio="xMidYMid meet"
              >
                <rect x="0" y="0" width={LIENZO.ancho} height={LIENZO.alto} className="vx-mp-mar" />
                {vista.capas
                  .filter((c) => c.rol !== "pais")
                  .map((c) => (
                    <path
                      key={c.clave}
                      d={c.d}
                      className={c.rol === "vecino" ? "vx-mp-vecino" : "vx-mp-otro"}
                    >
                      <title>{c.nombre}</title>
                    </path>
                  ))}
                {vista.capas
                  .filter((c) => c.rol === "pais")
                  .map((c) => (
                    <path key={c.clave} d={c.d} className="vx-mp-pais">
                      <title>{f.nombre}</title>
                    </path>
                  ))}
              </svg>
              <p className="vx-mp-mapa-pie">
                Detalle sobre Natural Earth 50m, la misma proyección del índice. El país va iluminado; sus vecinos
                terrestres, en tono medio. {vecinos.length > 0 ? `${vecinos.length} fronteras terrestres.` : "Sin fronteras terrestres en la topología."}
              </p>
            </div>
          ) : (
            <p className="vx-mp-mapa-pie" style={{ border: "1px solid rgba(120,220,235,0.2)", borderRadius: 12, padding: "10px 12px" }}>
              Este territorio no tiene polígono propio en el mapa de detalle de Natural Earth (es una isla o un
              territorio muy pequeño). Su ficha existe igual: los datos de abajo son los de la casa.
            </p>
          )}

          {/* ── BLOQUES ── */}
          <div className="vx-mp-bloques">
            <div className="vx-mp-bloque">
              <h2>Geografía</h2>
              <dl>
                <div>
                  <dt>Capital</dt>
                  <dd>{f.atlas ? f.atlas.capital : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Región</dt>
                  <dd>{regionEnEspanol(f.region)}</dd>
                </div>
                <div>
                  <dt>Subregión (ONU)</dt>
                  <dd>{f.subregion || <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Macroterritorio de la casa</dt>
                  <dd>{territorio ? territorio.nombre : <em>sin asignar</em>}</dd>
                </div>
                <div>
                  <dt>Superficie</dt>
                  <dd>
                    {f.superficie === null ? <em>sin dato</em> : formatear("superficie", f.superficie)}
                    {f.censo && f.censo.anios.sup && !f.atlas ? <span className="vx-mp-cuando"> ({f.censo.anios.sup})</span> : null}
                  </dd>
                </div>
                <div>
                  <dt>Población</dt>
                  <dd>
                    {f.poblacion === null ? <em>sin dato</em> : formatear("poblacion", f.poblacion / 1_000_000)}
                    {f.censo && f.censo.anios.pob && f.cobertura.poblacion === "banco-mundial" ? (
                      <span className="vx-mp-cuando"> ({f.censo.anios.pob})</span>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt>Densidad</dt>
                  <dd>{f.densidad === null ? <em>sin dato</em> : formatear("densidad", f.densidad)}</dd>
                </div>
                <div>
                  <dt>Coordenadas</dt>
                  <dd>
                    {f.lat.toFixed(2)}°, {f.lng.toFixed(2)}°
                  </dd>
                </div>
                <div>
                  <dt>Zona horaria</dt>
                  <dd>{f.atlas ? f.atlas.zona : <em>sin dato</em>}</dd>
                </div>
              </dl>
            </div>

            <div className="vx-mp-bloque">
              <h2>Economía</h2>
              <dl>
                <div>
                  <dt>Moneda</dt>
                  <dd>{f.moneda ? `${f.moneda.nombre} (${f.moneda.codigo})` : f.atlas ? f.atlas.moneda : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Símbolo</dt>
                  <dd>{f.moneda ? f.moneda.simbolo || f.moneda.codigo : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Tipo de cambio</dt>
                  <dd>{f.moneda ? formatear("tasa", f.moneda.tasa) : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>PIB</dt>
                  <dd>
                    {f.censo && f.censo.pib !== null ? formatear("usd", f.censo.pib) : <em>sin dato</em>}
                    {f.censo && f.censo.anios.pib ? <span className="vx-mp-cuando"> ({f.censo.anios.pib})</span> : null}
                  </dd>
                </div>
                <div>
                  <dt>PIB por habitante</dt>
                  <dd>{f.censo && f.censo.pibPC !== null ? formatear("usd", f.censo.pibPC) : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Gasto militar</dt>
                  <dd>{f.militar ? formatear("usd", f.militar.gasto) : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>% del PIB en armas</dt>
                  <dd>{f.militar && f.militar.gdpPct !== null ? formatear("pct", f.militar.gdpPct) : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Año del dato militar</dt>
                  <dd>{f.militar ? f.militar.anio : <em>sin dato</em>}</dd>
                </div>
              </dl>
              <p className="vx-mp-nota">
                El gasto militar, el PIB y el PIB por habitante salen del Banco Mundial (US$ corrientes del último año
                con dato, y cada cifra lleva su año); el tipo de cambio, del dataset de monedas de la casa. Donde el
                Banco Mundial no publica, la ficha dice «sin dato»: no se estima.
              </p>
            </div>

            <div className="vx-mp-bloque">
              <h2>Política</h2>
              <dl>
                <div>
                  <dt>Forma de gobierno</dt>
                  <dd>{f.atlas ? f.atlas.gobierno : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Líder</dt>
                  <dd>{f.atlas ? f.atlas.lider : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Puesto militar mundial</dt>
                  <dd>{f.militar ? `${f.militar.puesto} de ${miles(f.militar.de, 0)} por gasto` : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Efectivos en armas</dt>
                  <dd>{f.militar && f.militar.personal !== null ? formatear("personal", f.militar.personal) : <em>sin dato</em>}</dd>
                </div>
              </dl>
              {f.atlas ? <p className="vx-mp-dato">{f.atlas.dato}</p> : null}
            </div>

            <div className="vx-mp-bloque">
              <h2>Cultura</h2>
              <dl>
                <div>
                  <dt>Idiomas</dt>
                  <dd>{f.atlas ? f.atlas.idiomas : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Moneda como cultura</dt>
                  <dd>{f.moneda ? f.moneda.nombre : <em>sin dato</em>}</dd>
                </div>
                <div>
                  <dt>Esperanza de vida</dt>
                  <dd>
                    {f.censo && f.censo.esperanzaVida !== null ? formatear("anios", f.censo.esperanzaVida) : <em>sin dato</em>}
                    {f.censo && f.censo.anios.vida ? <span className="vx-mp-cuando"> ({f.censo.anios.vida})</span> : null}
                  </dd>
                </div>
              </dl>
              {f.personas.length > 0 ? (
                <ul className="vx-mp-lista" style={{ marginTop: 8 }}>
                  {f.personas.map((p) => (
                    <li key={p.id}>
                      <strong>{p.nombre}</strong> · {p.cargo}
                      <br />
                      <span className="vx-mp-cuando">
                        {p.sede}, {p.ciudad} · desde {p.desde}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="vx-mp-nota">La casa no tiene personas del poder fichadas en este país.</p>
              )}
            </div>
          </div>

          {/* ── FRONTERAS ── */}
          <div className="vx-mp-bloque">
            <h2>Fronteras · {vecinos.length} vecinos terrestres</h2>
            {vecinos.length > 0 ? (
              <div className="vx-mp-vecinos">
                {vecinos.map((v) =>
                  v.iso2 ? (
                    <Link key={v.clave} href={`/mundos/${v.iso2}`}>
                      {v.nombre}
                    </Link>
                  ) : (
                    <span key={v.clave}>{v.nombre}</span>
                  ),
                )}
              </div>
            ) : (
              <p className="vx-mp-nota">
                Sin vecinos terrestres en la topología de Natural Earth: es una isla, o su polígono no llega a compartir
                arco con nadie en esta resolución.
              </p>
            )}
            <p className="vx-mp-nota">
              Fronteras calculadas por arcos compartidos de topojson sobre Natural Earth: es la lista de países que
              tocan tierra con este, no un tratado. Marítimas y fluviales no entran.
            </p>
          </div>

          {/* ── HISTORIA Y CONFLICTO ── */}
          <div className="vx-mp-bloque">
            <h2>Historia y conflicto</h2>
            {acontecimientos.length > 0 ? (
              <ul className="vx-mp-lista">
                {acontecimientos.map((a) => (
                  <li key={a.slug}>
                    <strong>{a.titulo}</strong>{" "}
                    <span className="vx-mp-cuando">
                      ({a.tipo} · {a.estado} · desde {a.ocurridoDesde.slice(0, 10)}, {aniosDesde(Number(a.ocurridoDesde.slice(0, 4)))})
                    </span>
                    <br />
                    {a.resumen}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="vx-mp-nota">
                Ninguno de los acontecimientos sembrados del núcleo toca este país. La casa solo siembra hechos armados
                reales con fecha pública: no rellena el hueco.
              </p>
            )}

            {guerras.length > 0 ? (
              <>
                <p className="vx-mp-nota" style={{ marginTop: 12 }}>
                  <strong>Archivo histórico cercano</strong> — guerras reales del archivo de la casa a menos de 2.600 km
                  del centro del país (por distancia geográfica, no por frontera):
                </p>
                <ul className="vx-mp-lista">
                  {guerras.map(({ w, km }) => (
                    <li key={w.id}>
                      <strong>{w.name}</strong>{" "}
                      <span className="vx-mp-cuando">
                        ({w.yearStart < 0 ? `${Math.abs(w.yearStart)} a.C.` : w.yearStart}–{w.yearEnd < 0 ? `${Math.abs(w.yearEnd)} a.C.` : w.yearEnd} ·{" "}
                        {fmtDistancia(km)} del centro)
                      </span>
                      <br />
                      {w.summary}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <div className="vx-mp-acciones" style={{ marginTop: 12 }}>
              <Link href="/conflictos" className="vx-mp-vecinos" style={{ border: 0, padding: 0 }}>
                <span style={{ border: "1px solid rgba(120,220,235,0.22)", borderRadius: 999, padding: "4px 10px" }}>
                  Tablero de conflictos →
                </span>
              </Link>
              <Link href="/historia" style={{ color: "#5eead4", textDecoration: "none", fontSize: 12.5 }}>
                Archivo de guerras →
              </Link>
            </div>
          </div>

          {/* ── PUENTES ── */}
          <div className="vx-mp-bloque">
            <h2>Conectado con la casa · {puentes.length} puertas</h2>
            <div className="vx-mp-acciones">
              {puentes.map((p) => (
                <Link key={p.id} href={p.href} className="vx-mo-puente" title={p.desc}>
                  <span className="vx-mo-puente-clase">{p.clase}</span>
                  {p.nombre}
                </Link>
              ))}
              <GuardarEnEspacio
                iso2={f.iso2}
                nombre={`País: ${f.nombre}`}
                nota={`${f.nombre} · ${regionEnEspanol(f.region)}${f.atlas ? ` · ${f.atlas.capital}` : ""}`}
              />
            </div>
            <p className="vx-mp-nota">
              «Simular aquí» abre el teatro táctico en las coordenadas reales del país ({f.lat.toFixed(2)},{" "}
              {f.lng.toFixed(2)}); «Divisas» abre el tablero de monedas; «Guardar en mi espacio» deja esta ficha como
              pieza en tu proyecto activo.
            </p>
          </div>

          {/* ── v407.1 · EN EL PLANETA ── */}
          <div className="vx-mp-bloque">
            <h2>{f.nombre} en el planeta</h2>
            {puestos.length > 0 ? (
              <div className="vx-mp-acciones">
                {puestos.map((x) => (
                  <Link key={x.id} href={`/rankings/${x.id}#${f.iso2}`} className="vx-mo-puente" title={`Ranking mundial de ${x.nombre.toLowerCase()}`}>
                    <span className="vx-mo-puente-clase">{x.nombre}</span>
                    puesto {x.p!.puesto} de {x.p!.de}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="vx-mp-nota">El Banco Mundial no publica cifras de este territorio: no entra en las listas mundiales.</p>
            )}
            {bloques.length > 0 ? (
              <>
                <p className="vx-mp-nota" style={{ marginBottom: 6 }}>Miembro pleno de:</p>
                <div className="vx-mp-acciones">
                  {bloques.map((o) => (
                    <Link key={o.clave} href={`/organizaciones/${o.clave}`} className="vx-mo-puente" title={o.nombre}>
                      <span className="vx-mo-puente-clase">bloque</span>
                      {o.sigla}
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
            <div className="vx-mp-acciones" style={{ marginTop: 10 }}>
              <Link href={`/comparador?p=${f.iso2}`} style={{ color: "#5eead4", textDecoration: "none", fontSize: 12.5 }}>
                Compararlo con otros países →
              </Link>
              {rutaRegion ? (
                <Link href={rutaRegion} style={{ color: "#5eead4", textDecoration: "none", fontSize: 12.5 }}>
                  {SUBREGIONES_ES[f.subregion] ?? f.subregion}, sumada →
                </Link>
              ) : null}
            </div>
          </div>

          {/* ── VECINOS ── */}
          {vecinos.length > 0 ? (
            <div className="vx-mp-bloque">
              <h2>Los vecinos, con su ficha</h2>
              <div className="vx-mp-lista-paises">
                {vecinos.map((v) => {
                  const g = v.iso2 ? POR_ISO2.get(v.iso2) : null;
                  const fv = v.iso2 ? fichaPais(v.iso2) : null;
                  const etiqueta = v.iso2 ? (
                    <Link href={`/mundos/${v.iso2}`}>{v.nombre}</Link>
                  ) : (
                    <span>{v.nombre}</span>
                  );
                  return (
                    <p key={v.clave} style={{ margin: 0, fontSize: 12.5 }}>
                      {etiqueta}{" "}
                      <span className="vx-mp-cuando">
                        {fv && fv.atlas ? `· ${formatear("poblacion", fv.atlas.poblacion)}` : g ? `· ${regionEnEspanol(g.region)}` : ""}
                      </span>
                    </p>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* ── v405.16 · EL CABLE Y EL PAÍS ─────────────────────────
              Dos direcciones, una sola verdad:
              · la ficha enlaza al núcleo (teatro, mapa, acontecimiento,
                búsqueda) con enlacesDePais — la costura que llevaba escrita
                desde la v218 y nadie montaba;
              · y la redacción entra en la ficha: los cables que mencionan al
                país, pedidos al núcleo desde el cliente para no romper el
                prerenderizado de los 249 países. */}
          <div className="vx-mp-bloque" id="nucleo">
            <h2>Este país en el núcleo · qué se puede hacer desde aquí</h2>
            <EnlacesNucleo
              enlaces={[...enlacesDePais(f.iso2), ...enlacesRedaccion(f.iso2)]}
              titulo={`CONECTA CON ${f.nombre.toUpperCase()}`}
            />
            <CablesDelPais nombre={f.nombre} iso2={f.iso2} />
          </div>

          <PuentesConocimientoPais iso={f.iso2} nombre={f.nombre} />
          {/* ── v412.0 · DEL DATO AL MECANISMO ─────────────────────
              La ficha decía cuánto, no por qué. Estas siete salidas llevan
              al comparador, al globo, a los dos modelos que explican los
              mecanismos de la ficha y al catálogo donde consta la fuente de
              cada cifra. Los dos modelos avisan de que NO usan los datos de
              este país: enseñan el mecanismo, no lo proyectan. */}
          <div className="vx-mp-bloque">
            <h2>De la cifra al mecanismo · sigue por aquí</h2>
            <BandaNexos
              nexos={nexosDePais(f.iso2)}
              titulo={`${f.nombre.toUpperCase()} EN EL RESTO DE LA CASA`}
              nota="Ninguna de estas salidas promete un dato que la casa no tenga. Los dos simuladores son genéricos: sirven para entender el mecanismo que aparece en esta ficha, no para proyectar este país."
            />
          </div>

          <p className="vx-mp-nota">
            Ficha generada en el servidor con las tablas de la casa: geo-paises (identidad ISO), atlas-data (capital,
            población, superficie, idiomas, moneda, gobierno, líder), world-data (moneda y tasa), poder-data (Banco
            Mundial, captura 2026-11-05), Natural Earth (polígono, vecinos) y el núcleo de acontecimientos (hechos con
            fecha). Lo que falta se dice: «sin dato».
          </p>
        </section>
      </div>
    </main>
  );
}
