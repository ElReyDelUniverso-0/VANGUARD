import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";
import { ENCUADRE, SECCION_POR_ID, seccionesOrdenadas } from "@/lib/resiliencia/secciones";
import { Bloques, Salidas, slug } from "@/components/resiliencia/bloques";
import { FichasPeligro } from "@/components/resiliencia/fichas-peligro";
import { ListasPreparacion } from "@/components/resiliencia/listas-check";
import { GlosarioBuscador } from "@/components/resiliencia/glosario-buscador";
import { DirectorioPaises } from "@/components/resiliencia/paises";
import { LISTAS } from "@/lib/resiliencia/listas";
import { ETIQUETAS_TEMA, GLOSARIO, TEMAS_GLOSARIO } from "@/lib/resiliencia/glosario";

// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · LA PÁGINA DE CADA SECCIÓN DEL CENTRO
//
// Una sola ruta para las catorce secciones. No es una pereza de plantillas:
// es el contrato. Mientras una sección sea `Seccion` en
// src/lib/resiliencia/secciones.ts, esta página la sirve, la metadata la
// describe, el sitemap la conoce y el censo la cuenta. Nadie puede olvidar
// una de las quince entregas de la MISIÓN 09, porque nadie las lista a mano.
// ═══════════════════════════════════════════════════════════════════

export const dynamic = "force-static";

type Props = { params: Promise<{ seccion: string }> };

export function generateStaticParams() {
  return seccionesOrdenadas().map((s) => ({ seccion: s.id }));
}

async function seccionDe(params: Props["params"]) {
  const { seccion } = await params;
  return SECCION_POR_ID[seccion] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await seccionDe(params);
  if (!s) return { title: "Sección no encontrada · VANGUARD" };
  const titulo = `${s.titulo} — VANGUARD CIVIL RESILIENCE`;
  return {
    title: titulo,
    description: s.resumen,
    alternates: { canonical: `${SITE_URL}/resiliencia/${s.id}` },
    openGraph: { title: titulo, description: s.lema, url: `${SITE_URL}/resiliencia/${s.id}`, type: "article" },
  };
}

export default async function SeccionResiliencia({ params }: Props) {
  const s = await seccionDe(params);
  if (!s) notFound();

  const todas = seccionesOrdenadas();
  const i = todas.findIndex((x) => x.id === s.id);
  const anterior = i > 0 ? todas[i - 1] : null;
  const siguiente = i < todas.length - 1 ? todas[i + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: s.titulo,
    description: s.resumen,
    inLanguage: "es",
    mainEntityOfPage: `${SITE_URL}/resiliencia/${s.id}`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    articleSection: "VANGUARD CIVIL RESILIENCE",
    audience: { "@type": "Audience", audienceType: "Población general · preparación comunitaria" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-200 sm:px-5">
        <div className="mx-auto max-w-5xl">
          <nav aria-label="Volver" className="flex flex-wrap items-center gap-3 text-[12px]">
            <Link href="/resiliencia" className="font-mono uppercase tracking-widest text-teal-400 hover:text-teal-300">
              ← Centro de resiliencia
            </Link>
            <span className="text-zinc-700">·</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Sección {String(s.n).padStart(2, "0")} de 15
            </span>
          </nav>

          <header className="mt-6 border-b border-zinc-900 pb-6">
            <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">{s.titulo}</h1>
            <p className="mt-2 max-w-3xl text-[15px] leading-7 text-teal-200/90">{s.lema}</p>
            <p className="mt-3 max-w-3xl text-[13px] leading-6 text-zinc-400">{s.resumen}</p>
          </header>

          {s.vista === "bloques" ? <Bloques bloques={s.bloques} /> : null}
          {s.vista === "fichas" ? (
            <>
              <Bloques bloques={s.bloques} />
              <FichasPeligro />
            </>
          ) : null}
          {s.vista === "listas" ? (
            <>
              <Bloques bloques={s.bloques} />
              <ListasPreparacion listas={LISTAS} />
            </>
          ) : null}
          {s.vista === "glosario" ? (
            <>
              <Bloques bloques={s.bloques} />
              <GlosarioBuscador
                terminos={GLOSARIO}
                temas={TEMAS_GLOSARIO.map((t) => ({ clave: t, nombre: ETIQUETAS_TEMA[t] ?? t }))}
              />
            </>
          ) : null}
          {s.vista === "pais" ? (
            <>
              <Bloques bloques={s.bloques} />
              <DirectorioPaises />
            </>
          ) : null}

          <Salidas salidas={s.saleA} />

          <nav aria-label="Secciones del centro" className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Las quince secciones</p>
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {todas.map((x) => (
                <li key={x.id}>
                  <Link
                    href={`/resiliencia/${x.id}`}
                    className={`block truncate rounded px-2 py-1 text-[12.5px] hover:bg-zinc-800/60 ${
                      x.id === s.id ? "font-semibold text-teal-300" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {String(x.n).padStart(2, "0")} · {x.titulo}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/resiliencia/evaluacion" className="block truncate rounded px-2 py-1 text-[12.5px] text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200">
                  → COMMUNITY RESILIENCE
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            {anterior ? (
              <Link href={`/resiliencia/${anterior.id}`} className="text-[12.5px] text-zinc-400 hover:text-zinc-200" id={slug(anterior.id)}>
                ← {String(anterior.n).padStart(2, "0")} · {anterior.titulo}
              </Link>
            ) : (
              <Link href="/resiliencia" className="text-[12.5px] text-zinc-400 hover:text-zinc-200">
                ← La portada del centro
              </Link>
            )}
            {siguiente ? (
              <Link href={`/resiliencia/${siguiente.id}`} className="text-[12.5px] text-zinc-400 hover:text-zinc-200">
                {String(siguiente.n).padStart(2, "0")} · {siguiente.titulo} →
              </Link>
            ) : (
              <Link href="/resiliencia/evaluacion" className="text-[12.5px] text-teal-300 hover:text-teal-200">
                La herramienta: COMMUNITY RESILIENCE →
              </Link>
            )}
          </div>

          <aside className="mt-10 rounded-lg border border-teal-500/20 bg-teal-500/[0.04] p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-teal-300">{ENCUADRE.titulo}</p>
            <p className="mt-1.5 text-[12.5px] leading-6 text-zinc-400">{ENCUADRE.texto}</p>
          </aside>
        </div>
      </main>
    </>
  );
}
