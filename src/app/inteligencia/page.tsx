import type { Metadata } from "next";
import Link from "next/link";
import { censoCorpus } from "@/lib/centro/corpus";
import { TEMAS_INVESTIGACION } from "@/lib/investigacion/temas-data";
import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import CentroInteligencia from "@/components/vanguard/centro/centro-inteligencia";

// ═══════════════════════════════════════════════════════════════════════════
// v419.1 · CÁMARA DE INTELIGENCIA — /inteligencia
//
// El centro de investigación de la casa, dentro del Vanguard público: NO es
// una maqueta aparte ni un chatbot decorativo. Investiga sobre lo que la casa
// ya publica (dossiers sistémicos, enciclopedia, fichas de país, expedientes,
// feed del núcleo), acepta documentos del operador y devuelve respuestas en
// tres casillas: hecho con cita, interpretación y no confirmado.
// ═══════════════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "CÁMARA DE INTELIGENCIA — centro de investigación con fuentes",
  description:
    "Investiga sobre los dossiers, la enciclopedia, las fichas de país y tus propios documentos. Cada respuesta separa hechos con cita, interpretaciones y datos no confirmados. Informes, comparador de documentos, detector de contradicciones y bibliografía.",
  alternates: { canonical: "/inteligencia" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/inteligencia`,
    title: "VANGUARD · CÁMARA DE INTELIGENCIA",
    description:
      "Un centro de investigación real: pregunta, elige fuentes, investiga, guarda y continúa. Hechos con cita, interpretación y no confirmado, siempre separados.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
  },
};

export default async function InteligenciaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 400) : "";
  const censo = censoCorpus();

  // por dónde empezar: tres dossiers reales, no sugerencias inventadas
  const arranque = TEMAS_INVESTIGACION.slice(0, 3).map((t) => ({
    titulo: `¿Qué dice la casa sobre ${t.titulo.split(":")[0].toLowerCase()}?`,
    ruta: `/investigacion/${t.id}`,
    porque: "dossier sistémico con indicadores y fuentes oficiales",
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Cámara de Inteligencia de Vanguard",
    applicationCategory: "ResearchApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/inteligencia`,
    description:
      "Centro de investigación documental: búsqueda en el corpus de Vanguard, análisis de PDF y DOCX, informes con citas validadas, comparador de fuentes y detector de contradicciones.",
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return (
    <main className="min-h-screen bg-background pb-16 text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      <header className="border-b border-border/60 bg-gradient-to-b from-secondary/40 to-background px-4 pb-8 pt-14 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-3">
          <nav className="flex flex-wrap items-center gap-2 font-mono text-[12px] uppercase tracking-[0.22em] text-muted-foreground">
            <Link href="/" className="hover:text-amber">Vanguard</Link>
            <span aria-hidden>/</span>
            <Link href="/investigacion" className="hover:text-amber">Investigación</Link>
            <span aria-hidden>/</span>
            <span className="text-amber">Cámara de inteligencia</span>
          </nav>

          <h1 className="font-mono text-2xl leading-tight tracking-[0.06em] text-foreground sm:text-3xl">
            CÁMARA DE <span className="text-amber">INTELIGENCIA</span>
          </h1>
          <p className="max-w-3xl text-[13.5px] leading-relaxed text-muted-foreground">
            El centro de investigación de la casa. Pregunta, elige de dónde citar, investiga y guarda. Sirve para{" "}
            <strong className="font-normal text-foreground">investigar sobre lo que Vanguard ya publica</strong> —{" "}
            {censo.fuentes} fuentes, {censo.pasajes.toLocaleString("es-ES")} pasajes citables — y sobre{" "}
            <strong className="font-normal text-foreground">tus propios documentos</strong> (PDF, DOCX, texto). No es un
            chatbot: es un taller. Cada respuesta separa hechos con fuente, interpretaciones y lo que no se puede
            confirmar.
          </p>

          <div className="grid gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Investigar con fuentes", `${censo.fuentes} fuentes de la casa`],
              ["Analizar documentos", "PDF · DOCX · TXT · CSV"],
              ["Informes y bibliografía", "estructura + citas"],
              ["Proyectos e historial", "guardar y continuar"],
            ].map(([t, s]) => (
              <div key={t} className="rounded-sm border border-border/60 bg-card/40 p-2.5">
                <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-amber">{t}</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <CentroInteligencia censo={censo} relacionadosIniciales={arranque} preguntaInicial={q} />

      <footer className="mx-auto mt-6 w-full max-w-6xl px-3 sm:px-6">
        <div className="rounded-sm border border-border/60 bg-card/30 p-3">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.2em] text-muted-foreground">Cómo se conecta con la casa</h2>
          <ul className="mt-1.5 grid gap-1 text-[12.5px] leading-relaxed text-muted-foreground sm:grid-cols-2">
            <li>
              · Cada cita abre su sala real:{" "}
              <Link href="/investigacion" className="text-cyan-hud hover:underline">dossiers sistémicos</Link>,{" "}
              <Link href="/conocimiento/enciclopedia" className="text-cyan-hud hover:underline">enciclopedia</Link>,{" "}
              <Link href="/datos-mundiales" className="text-cyan-hud hover:underline">fichas de país</Link>.
            </li>
            <li>
              · El feed vivo entra por el{" "}
              <Link href="/nucleo" className="text-cyan-hud hover:underline">núcleo</Link> cuando la pregunta pide
              actualidad; se marca como fuente del núcleo, no como dossier.
            </li>
            <li>
              · Los módulos y simuladores se enlazan desde los{" "}
              <Link href="/modulos" className="text-cyan-hud hover:underline">temas relacionados</Link> de cada
              investigación.
            </li>
            <li>
              · Lo que guardas vive en tu navegador y se exporta a .json: sin cuentas y sin servidor de por medio.
            </li>
          </ul>
        </div>
      </footer>
    </main>
  );
}
