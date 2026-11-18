import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Laboratorio } from "@/components/labs/laboratorio";
import { MODELOS, obtenerModelo } from "@/lib/labs/registro";
import { CATEGORIA_LAB, ORIGEN_ETIQUETA } from "@/lib/labs/tipos";
import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

// ═══════════════════════════════════════════════════════════════════
// v411.0 · LA FICHA DE UN LABORATORIO — /labs/<modelo>
//
// Una página por modelo, con parámetros estáticos: no hay base de datos, no
// hay contenido generado al azar y no hay una URL por combinación de mandos
// (eso sería contenido duplicado a escala). El estado de la simulación vive
// entero en el navegador.
//
// El orden de la página es deliberado: primero la pregunta, luego los
// límites, después los mandos. Un visitante que solo lea los dos primeros
// bloques ya sabe qué puede y qué no puede concluir.
// ═══════════════════════════════════════════════════════════════════

export const dynamicParams = false;

export function generateStaticParams() {
  return MODELOS.map((m) => ({ modelo: m.id }));
}

type Props = { params: Promise<{ modelo: string }> };

function recortar(texto: string, max = 155) {
  if (texto.length <= max) return texto;
  return `${texto.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { modelo } = await params;
  const m = obtenerModelo(modelo);
  if (!m) return { title: "Laboratorio no encontrado", robots: { index: false, follow: false } };
  const titulo = `${m.nombre} — simulador`;
  return {
    title: titulo,
    description: recortar(m.resumen),
    alternates: { canonical: `/labs/${m.id}` },
    openGraph: {
      type: "article",
      title: titulo,
      description: recortar(m.resumen),
      url: `/labs/${m.id}`,
      siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
      locale: "es_ES",
    },
    twitter: { card: "summary_large_image", title: titulo, description: recortar(m.resumen) },
  };
}

export default async function ModeloPage({ params }: Props) {
  const { modelo } = await params;
  const m = obtenerModelo(modelo);
  if (!m) notFound();

  const cat = CATEGORIA_LAB[m.categoria];
  const hermanos = MODELOS.filter((x) => x.categoria === m.categoria && x.id !== m.id);
  const origenConteo = m.variables.reduce(
    (acc, v) => ({ ...acc, [v.origen]: (acc[v.origen] ?? 0) + 1 }),
    {} as Record<string, number>
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${m.nombre} — VANGUARD LABS`,
    description: m.resumen,
    url: `${SITE_URL}/labs/${m.id}`,
    isPartOf: { "@type": "CollectionPage", name: "VANGUARD LABS", url: `${SITE_URL}/labs` },
    about: m.pregunta,
  };

  const jsonLdMigas = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "VANGUARD", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Laboratorios", item: `${SITE_URL}/labs` },
      { "@type": "ListItem", position: 3, name: m.nombre, item: `${SITE_URL}/labs/${m.id}` },
    ],
  };

  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-zinc-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLdMigas) }} />

      <div className="mx-auto max-w-6xl px-5">
        <nav aria-label="Migas de pan" className="pt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <Link href="/" className="hover:text-amber-300">Vanguard</Link>
          <span className="mx-2 text-zinc-700">/</span>
          <Link href="/labs" className="hover:text-amber-300">Labs</Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span className="text-zinc-400">{m.nombre}</span>
        </nav>

        <header className="mt-6 border-b border-zinc-800 pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: cat.color }}>
            {cat.nombre} · laboratorio {m.id}
          </p>
          <h1 className="mt-2 font-orbitron text-3xl font-black leading-tight text-zinc-50 sm:text-4xl">{m.nombre}</h1>
          <p className="mt-3 max-w-3xl text-lg font-light italic leading-snug text-amber-200/85">{m.pregunta}</p>
          <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-zinc-400">{m.resumen}</p>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <li>{m.variables.length} variables</li>
            <li>{m.series.length} series</li>
            <li>{m.pasosMax} {m.unidadTiempo}s de horizonte máximo</li>
            <li>{m.limites.length} límites declarados</li>
            <li>{m.presets?.length ?? 0} escenarios de partida</li>
            {m.mapa && <li className="text-sky-400/80">con mapa</li>}
          </ul>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Por qué este laboratorio existe</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">{m.contexto}</p>
          </div>
          <div className="rounded-lg border border-rose-500/25 bg-rose-500/[0.05] p-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-rose-300/90">Lo que este modelo NO puede decir</h2>
            <ul className="mt-2 space-y-1.5">
              {m.limites.map((l, i) => (
                <li key={i} className="flex gap-2 text-[12px] leading-snug text-zinc-400">
                  <span className="text-rose-400/70">—</span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Datos reales que usa o cita</h2>
            <ul className="mt-2 space-y-2">
              {m.reales.map((d, i) => (
                <li key={i} className="border-l-2 border-sky-400/40 pl-2">
                  <p className="text-[12px] font-semibold text-zinc-200">{d.dato}</p>
                  <p className="font-mono text-[11px] text-sky-300/90">{d.valor}</p>
                  <p className="text-[10px] leading-snug text-zinc-500">
                    {d.fuente} ·{" "}
                    <Link href={d.donde} className="underline decoration-zinc-700 underline-offset-2 hover:text-amber-300">
                      comprobar en {d.donde}
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">Supuestos del motor</h2>
            <ul className="mt-2 space-y-1.5">
              {m.supuestos.map((s, i) => (
                <li key={i} className="flex gap-2 text-[12px] leading-snug text-zinc-400">
                  <span className="text-amber-400/70">·</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">De dónde sale cada mando</h2>
            <ul className="mt-2 space-y-2">
              {(["real", "supuesto", "eleccion"] as const).map((k) => {
                const o = ORIGEN_ETIQUETA[k];
                const n = origenConteo[k] ?? 0;
                return (
                  <li key={k} className="rounded border p-2" style={{ borderColor: `${o.color}33`, backgroundColor: `${o.color}0a` }}>
                    <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: o.color }}>
                      {o.nombre} · {n}
                    </p>
                    <p className="text-[11px] leading-snug text-zinc-500">{o.texto}</p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[11px] leading-snug text-zinc-500">
              Un paso = {m.unidadTiempo}. La corrida es determinista: mismos mandos y misma semilla dan exactamente el mismo
              resultado.
            </p>
          </div>
        </section>

        <section className="mt-10" id="mesa">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-orbitron text-xl font-black text-zinc-100">La mesa de trabajo</h2>
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              todo se calcula en tu navegador · nada se envía
            </p>
          </div>
          <div className="mt-4">
            <Laboratorio modeloId={m.id} />
          </div>
        </section>

        {hermanos.length > 0 && (
          <section className="mt-12 border-t border-zinc-800 pt-6">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              Otros laboratorios de {cat.nombre.toLowerCase()}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {hermanos.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/labs/${h.id}`}
                    className="inline-block rounded border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-[12px] text-zinc-300 hover:border-amber-400/50 hover:text-amber-200"
                  >
                    {h.nombre}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/labs"
                  className="inline-block rounded border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[12px] text-amber-200 hover:bg-amber-400/20"
                >
                  Ver los {MODELOS.length} simuladores
                </Link>
              </li>
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
