import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIAS, MODELOS, estadisticasLabs, modelosDeCategoria } from "@/lib/labs/registro";
import { CATEGORIA_LAB, ORIGEN_ETIQUETA } from "@/lib/labs/tipos";
import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

// ═══════════════════════════════════════════════════════════════════
// v411.0 · VANGUARD LABS — la puerta del laboratorio (/labs)
//
// Quince simuladores con mecánicas distintas repartidos en cinco familias.
// Esta página es el catálogo: qué pregunta responde cada uno, con qué se
// juega y —lo más importante— qué NO puede decir. El catálogo se genera solo
// desde src/lib/labs/registro.ts: si un modelo no está allí, no existe.
//
// La casa no promete que estos modelos acierten el futuro. Promete lo
// contrario: que cada uno declare sus límites antes de que el visitante
// mueva un solo mando.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "VANGUARD LABS — 15 simuladores de sistemas",
  description:
    "Quince simuladores de economía, sociedad, geografía, historia y sistemas complejos. Variables que puedes mover, resultados reproducibles y límites declarados.",
  alternates: { canonical: "/labs" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/labs`,
    title: "VANGUARD LABS — el laboratorio de sistemas",
    description:
      "Economía, sociedad, geografía, historia y sistemas complejos: quince modelos deterministas con supuestos y límites a la vista.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "VANGUARD LABS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VANGUARD LABS — simuladores con límites a la vista",
    description: "Quince modelos para explorar, comparar y aprender. Deterministas, con datos reales citados y supuestos separados.",
  },
};

export default function LabsPage() {
  const stats = estadisticasLabs();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "VANGUARD LABS",
    description:
      "Catálogo de simuladores de sistemas de VANGUARD: economía, sociedad, geografía, historia y sistemas complejos, con supuestos y límites declarados.",
    url: `${SITE_URL}/labs`,
    hasPart: MODELOS.map((m) => ({
      "@type": "WebPage",
      name: m.nombre,
      url: `${SITE_URL}/labs/${m.id}`,
      description: m.resumen,
    })),
  };

  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-zinc-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <header className="border-b border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 px-5 pb-10 pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-400/80">Vanguard · laboratorio de sistemas</p>
          <h1 className="mt-3 font-orbitron text-4xl font-black leading-[1.05] text-zinc-50 sm:text-5xl">
            VANGUARD <span className="text-amber-300">LABS</span>
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-zinc-400">
            Quince máquinas para entender cómo se relacionan las cosas: una economía que crece, una población que envejece, una
            cuenca que se vacía, un imperio que se estira más de lo que puede administrar, una red que se apaga en cascada.
            Mueves las variables. El modelo responde. Y antes de que muevas nada, te dice qué no sabe.
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { n: stats.modelos, t: "simuladores" },
              { n: stats.categorias, t: "familias" },
              { n: stats.variables, t: "variables" },
              { n: stats.presets, t: "escenarios" },
              { n: stats.datosReales, t: "datos citados" },
              { n: stats.limites, t: "límites escritos" },
            ].map((x) => (
              <div key={x.t} className="rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2">
                <dt className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">{x.t}</dt>
                <dd className="font-orbitron text-xl font-black text-amber-200">{x.n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5">
        {/* la ley del laboratorio */}
        <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">La regla de la casa</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-zinc-300">
            Un modelo de esta casa <strong className="text-zinc-100">no predice</strong>. Sirve para ver mecanismos. Por eso cada
            variable declara de dónde sale su número, y esa etiqueta se pinta al lado del mando:
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {(["real", "supuesto", "eleccion"] as const).map((k) => {
              const o = ORIGEN_ETIQUETA[k];
              return (
                <li key={k} className="rounded border p-3" style={{ borderColor: `${o.color}44`, backgroundColor: `${o.color}0d` }}>
                  <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: o.color }}>
                    {o.nombre}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-zinc-400">{o.texto}</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">
            Los datos reales van citados con fuente y con la sala donde se pueden comprobar. Los supuestos están escritos en la
            ficha de cada modelo. Y cuando el modelo no puede sostener una conclusión, lo dice en su lista de límites en vez de
            disimularlo con decimales.
          </p>
        </section>

        {CATEGORIAS.map((catId) => {
          const cat = CATEGORIA_LAB[catId];
          const modelos = modelosDeCategoria(catId);
          return (
            <section key={catId} className="mt-12" id={catId}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-zinc-800 pb-2">
                <h2 className="font-orbitron text-xl font-black text-zinc-100">
                  <span style={{ color: cat.color }}>■</span> {cat.nombre}
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {modelos.length} {modelos.length === 1 ? "modelo" : "modelos"}
                </p>
              </div>
              <p className="mt-2 text-[13px] text-zinc-500">{cat.texto}</p>

              <ul className="mt-4 grid gap-3 md:grid-cols-2">
                {modelos.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/labs/${m.id}`}
                      className="group flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 transition-colors hover:border-amber-400/50 hover:bg-zinc-900/60"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="text-[15px] font-bold text-zinc-100 group-hover:text-amber-200">{m.nombre}</h3>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">{m.id}</span>
                      </div>
                      <p className="mt-1 text-[12px] italic leading-snug text-amber-200/70">{m.pregunta}</p>
                      <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-zinc-400">{m.resumen}</p>
                      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] uppercase tracking-wider text-zinc-600">
                        <span>{m.variables.length} variables</span>
                        <span>{m.series.length} series</span>
                        <span>{m.limites.length} límites</span>
                        <span>{m.presets?.length ?? 0} escenarios</span>
                        {m.mapa && <span className="text-sky-400/70">mapa</span>}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="mt-14 rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
          <h2 className="font-orbitron text-lg font-black text-zinc-100">Qué hay dentro de cada simulador</h2>
          <ul className="mt-3 grid gap-x-6 gap-y-2 text-[13px] leading-relaxed text-zinc-400 sm:grid-cols-2">
            <li>· Editor de variables con unidad, rango y origen de cada número.</li>
            <li>· Control del tiempo simulado y semilla reproducible.</li>
            <li>· Comparador A/B para medir el efecto de un cambio.</li>
            <li>· Gráficos dinámicos y panel de resultados.</li>
            <li>· Experimentos guardados en el navegador, con huella.</li>
            <li>· Exportación a CSV y a JSON con supuestos y límites dentro.</li>
            <li>· Visualización geográfica en los modelos que la tienen.</li>
            <li>· Reinicio a los valores de fábrica, siempre a un clic.</li>
          </ul>
          <p className="mt-4 text-[12px] leading-relaxed text-zinc-500">
            Los experimentos se guardan en tu navegador, no en un servidor: nadie más los ve y se borran si limpias los datos del
            sitio. La huella de cada corrida identifica la combinación exacta de mandos, horizonte y semilla.
          </p>
        </section>

        <nav className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-zinc-800 pt-5 text-[12px]">
          <Link href="/escenarios" className="text-amber-300 underline decoration-amber-400/40 underline-offset-4">
            El Estratega de escenarios (v224)
          </Link>
          <Link href="/herramientas" className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-amber-200">
            Herramientas de la casa
          </Link>
          <Link href="/mundo" className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-amber-200">
            El mundo en vivo
          </Link>
          <Link href="/atlas" className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-amber-200">
            El atlas de países
          </Link>
          <Link href="/pulso-mundial" className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-amber-200">
            El pulso mundial
          </Link>
        </nav>
      </div>
    </main>
  );
}
