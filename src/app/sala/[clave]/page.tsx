// ═══════════════════════════════════════════════════════════════════
// v405.7 · LAS PUERTAS DE LAS SALAS — /sala/[clave]
//
// EL AGUJERO QUE CIERRA: las 155 salas viven en /cuartel como paneles de
// cliente (next/dynamic ssr:false). /cuartel?sala=<clave> lleva canónica
// /cuartel y su HTML no trae ni una línea de la sala: para Google, el
// Simulador de Guerras, la Sala OSINT o el Atlas NO EXISTEN. Nadie los
// encuentra buscando, y por eso casi nadie entra.
//
// ESTA PÁGINA: una puerta de servidor por sala (155 estáticas, de
// mapa-salas.ts + puertas-salas.ts). Dice qué es la sala con las palabras que
// la casa YA usa (rótulo + tarjetas que abren esa sala), la sitúa en su
// constelación, enlaza a sus hermanas y abre la sala de verdad con un toque:
// /cuartel?sala=<clave>, donde siempre. No se crea ni una sala, no se copia
// ningún panel, no se escribe texto nuevo.
//
// SOLO LAS QUE TIENEN QUÉ DECIR VAN A GOOGLE: las salas sin texto real (o
// personales/internas) tienen puerta igual, pero «noindex, follow» y fuera del
// sitemap — una página de una línea resta a todo el sitio. Ver
// scripts/generar-puertas-salas.mjs.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONSTELACIONES, TOTAL_SALAS } from "@/lib/vanguard/mapa-salas";
import { PUERTAS_SALAS } from "@/lib/vanguard/puertas-salas";
import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

const COLOR: Record<string, string> = {
  amber: "#f5a623",
  cyan: "#5eead4",
  red: "#ff4d5e",
  green: "#3ddc97",
  violet: "#b48cff",
  blue: "#7ab8ff",
};

function buscar(clave: string) {
  for (const c of CONSTELACIONES) {
    const s = c.salas.find((x) => x.clave === clave);
    if (s) return { c, s, p: PUERTAS_SALAS[clave] };
  }
  return null;
}

/** primera frase útil, cortada en palabra (≤ max) */
function resumen(t: string, max = 155) {
  const limpio = t.replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max - 1);
  return corte.slice(0, corte.lastIndexOf(" ")).replace(/[,:;·—-]+$/, "") + "…";
}

export function generateStaticParams() {
  return CONSTELACIONES.flatMap((c) => c.salas.map((s) => ({ clave: s.clave })));
}

export async function generateMetadata({ params }: { params: Promise<{ clave: string }> }): Promise<Metadata> {
  const { clave } = await params;
  const r = buscar(clave);
  if (!r) return { title: "Sala no encontrada" };
  const { c, s, p } = r;
  const titulo = p?.titulo ?? s.corto;
  const base = p?.textos[0] || p?.lema || c.desc;
  const description = resumen(`${titulo}: ${base}. Una sala de ${c.nombre} en VANGUARD.`);
  const gancho = p?.lema || p?.textos[0];
  return {
    title: gancho ? `${titulo} — ${resumen(gancho, 64)}` : `${titulo} — ${c.nombre}`,
    description,
    alternates: { canonical: `/sala/${s.clave}` },
    robots: p?.indexable ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${titulo} · VANGUARD`,
      description,
      url: `/sala/${s.clave}`,
      type: "website",
    },
  };
}

export default async function Sala({ params }: { params: Promise<{ clave: string }> }) {
  const { clave } = await params;
  const r = buscar(clave);
  if (!r) notFound();
  const { c, s, p } = r;
  const color = COLOR[c.color] ?? "#f5a623";
  const titulo = p?.titulo ?? s.corto;
  const abrir = `/cuartel?sala=${s.clave}`;
  const hermanas = c.salas.filter((x) => x.clave !== s.clave);
  const otras = CONSTELACIONES.filter((x) => x.clave !== c.clave);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "VANGUARD", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: `Las ${TOTAL_SALAS} salas`, item: `${SITE_URL}/modulos` },
      { "@type": "ListItem", position: 3, name: c.nombre, item: `${SITE_URL}/constelacion/${c.clave}` },
      { "@type": "ListItem", position: 4, name: titulo, item: `${SITE_URL}/sala/${s.clave}` },
    ],
  };

  return (
    <main className="vx vx-sala-pagina">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <section className="vx-sec">
        <div className="vx-wrap">
          <p className="vx-migas">
            <Link href="/modulos#mapa">Las {TOTAL_SALAS} salas</Link>
            <span aria-hidden>›</span>
            <Link href={`/constelacion/${c.clave}`} style={{ color }}>
              {c.nombre}
            </Link>
            <span aria-hidden>›</span>
            <span>{s.corto}</span>
          </p>
          <span className="vx-sello" style={{ borderColor: color, color }}>
            Sala · {c.corto}
          </span>
          <h1>{titulo}</h1>
          {p?.lema ? <p className="vx-sala-lema">{p.lema}</p> : null}

          <div className="vx-sala-cuerpo">
            {p && p.textos.length > 0 ? (
              <div className="vx-sala-textos">
                {p.textos.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            ) : null}

            <Link href={abrir} className="vx-sala-abrir" style={{ borderColor: color, color }} prefetch={false}>
              Entrar a {s.corto} <span aria-hidden>→</span>
            </Link>
            <p className="vx-sala-nota">
              Se abre dentro del cuartel de VANGUARD, desde el navegador: no hay nada que descargar.
            </p>

            {p && p.otrosNombres.length > 0 ? (
              <p className="vx-sala-alias">
                En la casa también la verás como{" "}
                {p.otrosNombres.map((n, i) => (
                  <span key={n}>
                    {i > 0 ? (i === p.otrosNombres.length - 1 ? " y " : ", ") : null}
                    <b>{n}</b>
                  </span>
                ))}
                .
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="vx-sec" aria-label={`La constelación ${c.nombre}`}>
        <div className="vx-wrap">
          <h2 className="vx-const-h2">
            Forma parte de <Link href={`/constelacion/${c.clave}`}>{c.nombre}</Link>
          </h2>
          <p className="vx-const-desc">{c.desc}</p>
          {hermanas.length > 0 ? (
            <ul className="vx-const-nav">
              {hermanas.map((h) => (
                <li key={h.clave}>
                  <Link href={`/sala/${h.clave}`}>
                    <i style={{ background: color }} aria-hidden />
                    {h.corto}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="vx-sec" aria-label="Las otras constelaciones">
        <div className="vx-wrap">
          <h2 className="vx-const-h2">Las otras {otras.length} constelaciones</h2>
          <ul className="vx-const-nav">
            {otras.map((h) => (
              <li key={h.clave}>
                <Link href={`/constelacion/${h.clave}`}>
                  <i style={{ background: COLOR[h.color] ?? "#f5a623" }} aria-hidden />
                  {h.corto}
                  <b>{h.salas.length}</b>
                </Link>
              </li>
            ))}
          </ul>
          <p className="vx-const-pie">
            ¿Buscas otra cosa? Pulsa <kbd>⌘K</kbd> y escribe una palabra: el buscador mira las {TOTAL_SALAS} salas a la
            vez.
          </p>
        </div>
      </section>
    </main>
  );
}
