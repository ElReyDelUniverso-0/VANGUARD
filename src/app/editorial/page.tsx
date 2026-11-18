// ═══════════════════════════════════════════════════════════════════
// v406.3 VANGUARD EDITORIAL COMMAND — /editorial, la biblioteca de la casa.
// Diez áreas que unen el Vanguard moderno (salas de servidor) y el clásico
// (las 155 puertas /sala/<clave>), artículos con fuentes y fecha de revisión,
// y la cola de las próximas semanas. Servidor puro: cero JS de cliente.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import "./editorial.css";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { TarjetaArticulo } from "@/components/editorial/bloques";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";
import { ARTICULOS, articulosDeArea, articulosDeTipo, FECHA_ES } from "@/lib/editorial";
import { AREAS_EDITORIALES, puertasClasicas } from "@/lib/editorial/areas";
import { cola, VENTANA } from "@/lib/editorial/calendario";

export const metadata: Metadata = {
  title: "La redacción de Vanguard — biblioteca de geopolítica, historia, economía y conflictos",
  description: `${ARTICULOS.length} artículos con fuentes en 10 áreas: geopolítica, países, economía mundial, historia, conflictos, ciencia, sociedad, educación, recursos naturales y relaciones internacionales.`,
  alternates: { canonical: "/editorial" },
};

export default function Editorial() {
  const [primero, ...resto] = ARTICULOS;
  const proximas = cola().slice(0, 6);
  const tipos = [
    { tipo: "actualidad" as const, t: "Actualidad", d: "Lo que pasa ahora, con fecha de corte y revisión programada." },
    { tipo: "permanente" as const, t: "Permanentes", d: "Las piezas de fondo que explican el mundo y no caducan." },
    { tipo: "datos" as const, t: "Datos vivos", d: "Clasificaciones que se recalculan solas desde el censo de la casa." },
  ];
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "La redacción de Vanguard",
    url: `${SITE_URL}/editorial`,
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ARTICULOS.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/editorial/${a.slug}`,
        name: a.titulo,
      })),
    },
  };

  return (
    <main className="vx ed">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(ld) }} />
      <PortadaSala
        imagen="/ilustraciones/biblioteca.jpg"
        alt="Estanterías de una gran biblioteca iluminadas en tonos dorados"
        volanta="REDACCIÓN · BIBLIOTECA DEL CONOCIMIENTO"
        titulo="La redacción de Vanguard"
        sumario="Artículos con fuentes, organizados en diez áreas y unidos a las salas de la casa. Lo que pasa hoy y lo que lo explica."
        cifras={[
          { valor: ARTICULOS.length, etiqueta: "artículos publicados" },
          { valor: AREAS_EDITORIALES.length, etiqueta: "áreas editoriales" },
          { valor: cola().length, etiqueta: "piezas en la cola", nota: "30 días" },
          { valor: ARTICULOS.reduce((s, a) => s + a.fuentes.length, 0), etiqueta: "fuentes citadas" },
        ]}
        anclas={[
          { etiqueta: "Lo último", href: "#ultimo" },
          { etiqueta: "Las 10 áreas", href: "#areas" },
          { etiqueta: "Por tipo", href: "#tipos" },
          { etiqueta: "Próximamente", href: "#proximo" },
          { etiqueta: "Calendario", href: "/editorial/calendario" },
        ]}
        acento="#e8c56a"
        prioritaria
        nivel="h1"
        nota="Cada pieza muestra sus fuentes, su fecha de revisión y su registro de cambios."
      />

      <section className="vx-sec" id="ultimo" aria-labelledby="ed-ultimo-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Recién publicado</span>
              <h2 id="ed-ultimo-t">Lo último de la redacción</h2>
            </div>
          </div>
          <div className="ed-rejilla-dest">
            {primero && <TarjetaArticulo a={primero} grande />}
            <div className="ed-col">
              {resto.slice(0, 2).map((a) => (
                <TarjetaArticulo key={a.slug} a={a} />
              ))}
            </div>
          </div>
          <div className="ed-rejilla" style={{ marginTop: 16 }}>
            {resto.slice(2, 8).map((a) => (
              <TarjetaArticulo key={a.slug} a={a} />
            ))}
          </div>
        </div>
      </section>

      <section className="vx-sec" id="areas" aria-labelledby="ed-areas-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Estructura editorial</span>
              <h2 id="ed-areas-t">Las diez áreas</h2>
              <p>Cada área une sus artículos con las salas modernas y las puertas del Vanguard clásico (◆).</p>
            </div>
          </div>
          <div className="ed-areas">
            {AREAS_EDITORIALES.map((ar) => {
              const arts = articulosDeArea(ar.clave);
              return (
                <section key={ar.clave} className="ed-area" style={{ ["--ed-acento" as string]: ar.color }} aria-labelledby={`area-${ar.clave}`}>
                  <p className="ed-area-lema">{ar.lema}</p>
                  <h3 id={`area-${ar.clave}`}>
                    <Link href={`/editorial/area/${ar.clave}`}>{ar.nombre}</Link>
                  </h3>
                  <p className="ed-area-desc">{ar.descripcion}</p>
                  {arts.length > 0 ? (
                    <ul className="ed-area-arts">
                      {arts.map((a) => (
                        <li key={a.slug}>
                          <Link href={`/editorial/${a.slug}`}>{a.titulo}</Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="ed-area-vacia">Primeras piezas en la cola del calendario.</p>
                  )}
                  <div className="ed-puertas">
                    <span className="ed-puertas-t">Salas de la casa</span>
                    {ar.moderno.map((e) => (
                      <Link key={e.href} href={e.href}>
                        {e.label}
                      </Link>
                    ))}
                    {puertasClasicas(ar.clasico).map((e) => (
                      <Link key={e.href} href={e.href} data-clasico="1">
                        {e.label}
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="vx-sec" id="tipos" aria-labelledby="ed-tipos-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Actualidad y fondo</span>
              <h2 id="ed-tipos-t">Tres tipos de pieza</h2>
            </div>
          </div>
          <div className="ed-tipos">
            {tipos.map((t) => (
              <div key={t.tipo} className="ed-tipo-col">
                <h3>{t.t}</h3>
                <p>{t.d}</p>
                <ul>
                  {articulosDeTipo(t.tipo).map((a) => (
                    <li key={a.slug}>
                      <Link href={`/editorial/${a.slug}`}>{a.titulo}</Link>
                      <span>Revisado el {FECHA_ES(a.revisado)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="vx-sec" id="proximo" aria-labelledby="ed-prox-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">La cola</span>
              <h2 id="ed-prox-t">Próximamente en la redacción</h2>
              <p>
                Calendario del {FECHA_ES(VENTANA.desde)} al {FECHA_ES(VENTANA.hasta)}.
              </p>
            </div>
            <Link href="/editorial/calendario">Calendario completo →</Link>
          </div>
          <ul className="ed-dias">
            {proximas.map((p) => {
              const ar = AREAS_EDITORIALES.find((x) => x.clave === p.area)!;
              const [, m, d] = p.fecha.split("-");
              return (
                <li key={p.fecha + p.titulo} className="ed-pieza" style={{ ["--ed-acento" as string]: ar.color }}>
                  <span className="ed-pieza-fecha">
                    <b>{Number(d)}</b>
                    {m === "11" ? "nov" : "dic"}
                  </span>
                  <div>
                    <span className="ed-chip">{ar.nombre}</span>
                    <p className="ed-pieza-t">{p.titulo}</p>
                    <p className="ed-pieza-a">{p.angulo}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
