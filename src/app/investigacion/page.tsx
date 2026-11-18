import type { Metadata } from "next";
import Link from "next/link";
import { TEMAS_INVESTIGACION, metricasInvestigacion } from "@/lib/investigacion";
import { CatalogoInvestigacion } from "@/components/vanguard/investigacion/catalogo-investigacion";
import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { BookOpen, Search, FlaskConical, MapPin, Scale, Layers, Sparkles } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// VANGUARD INVESTIGACIÓN SISTÉMICA — /investigacion
// Conecta los seis verbos: Descubrir, Comprender, Investigar,
// Visualizar, Comparar y Simular en una plataforma unificada.
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "INVESTIGACIÓN SISTÉMICA — Ecosistema Conectado de Conocimiento",
  description:
    "Descubre, comprende, investiga, visualiza, compara y simula los grandes temas del planeta. Geopolítica, semiconductores, agua, energía, deuda soberana y armamento con fuentes primarias oficiales.",
  alternates: { canonical: "/investigacion" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/investigacion`,
    title: "VANGUARD INVESTIGACIÓN SISTÉMICA — Plataforma Internacional de Conocimiento",
    description:
      "Conectamos enciclopedia, cartografía, datos empíricos y simuladores en una sola plataforma de análisis e investigación internacional.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "VANGUARD INVESTIGACIÓN SISTÉMICA",
    description:
      "El conocimiento global conectado: diez dossiers de alta densidad con mapas interactivos, indicadores de la AIE/Banco Mundial y simuladores.",
  },
};

export default function InvestigacionPage() {
  const stats = metricasInvestigacion();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "VANGUARD Investigación Sistémica",
    description:
      "Ecosistema integrado de investigación, visualización de datos, análisis geoestratégico y simulación de sistemas complejos.",
    url: `${SITE_URL}/investigacion`,
    hasPart: TEMAS_INVESTIGACION.map((t) => ({
      "@type": "ScholarlyArticle",
      name: t.titulo,
      url: `${SITE_URL}/investigacion/${t.id}`,
      description: t.resumenEjecutivo,
      datePublished: t.fechaActualizacion,
    })),
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      {/* ── CABECERA DE LA SALA ── */}
      <header className="border-b border-border/60 bg-gradient-to-b from-secondary/40 to-background px-4 sm:px-6 pt-16 pb-10">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-amber">
            <span className="w-2 h-2 rounded-full bg-amber animate-pulse" />
            VANGUARD · Ecosistema de Conocimiento e Investigación
          </div>

          <h1 className="font-mono text-3xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
            INVESTIGACIÓN <span className="text-amber">SISTÉMICA</span>
          </h1>

          <p className="max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">
            No concebimos el conocimiento como artículos aislados, noticias efímeras o fórmulas sueltas.
            Diseñamos un ecosistema donde puedes <strong className="text-foreground">descubrir</strong> un tema,{" "}
            <strong className="text-foreground">comprender</strong> su lógica causal,{" "}
            <strong className="text-foreground">investigar</strong> sus datos con fuentes institucionales,{" "}
            <strong className="text-foreground">visualizarlo</strong> en coordenadas cartográficas,{" "}
            <strong className="text-foreground">comparar</strong> sus actores y{" "}
            <strong className="text-foreground">simularlo</strong> en tiempo real con modelos matemáticos.
          </p>

          {/* Tarjetas de Cifras del Ecosistema */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            {[
              { n: stats.totalTemas, l: "Dossiers Sistémicos", sub: "Actualizados" },
              { n: stats.totalIndicadores, l: "Indicadores Auditados", sub: "Banco Mundial / AIE / SIPRI" },
              { n: stats.totalNodos, l: "Nodos Cartográficos", sub: "Coordenadas Reales" },
              { n: 15, l: "Simuladores Labs", sub: "Modelos Acoplados" },
            ].map((s, i) => (
              <div key={i} className="hud-panel p-3 bg-secondary/30">
                <dt className="text-[10px] font-mono uppercase text-muted-foreground">{s.l}</dt>
                <dd className="text-2xl font-mono font-bold text-amber">{s.n}</dd>
                <span className="text-[10px] text-muted-foreground block truncate">{s.sub}</span>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* ── CUERPO PRINCIPAL CON CATÁLOGO CLIENTE ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 space-y-10">
        {/* El Ciclo de Investigación en 5 Pasos */}
        <section className="hud-panel p-5 bg-secondary/20 border-border/80">
          <h2 className="text-xs font-mono uppercase font-bold text-amber mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> El Método Vanguard: Cinco Formatos en Uno
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-card/60 rounded border border-border/40 space-y-1">
              <span className="font-mono text-amber font-bold block">1. COMPRENDER</span>
              <p className="text-muted-foreground text-[11px]">Resumen ejecutivo, conceptos esenciales con glosario y cronología causal.</p>
            </div>
            <div className="p-3 bg-card/60 rounded border border-border/40 space-y-1">
              <span className="font-mono text-amber font-bold block">2. INVESTIGAR</span>
              <p className="text-muted-foreground text-[11px]">Series empíricas auditadas con fuente, año, unidad y puntos ciegos admitidos.</p>
            </div>
            <div className="p-3 bg-card/60 rounded border border-border/40 space-y-1">
              <span className="font-mono text-amber font-bold block">3. VISUALIZAR</span>
              <p className="text-muted-foreground text-[11px]">Mapa geoestratégico SVG con chokepoints, nodos y coordenadas exactas.</p>
            </div>
            <div className="p-3 bg-card/60 rounded border border-border/40 space-y-1">
              <span className="font-mono text-amber font-bold block">4. COMPARAR</span>
              <p className="text-muted-foreground text-[11px]">Matriz comparativa asimétrica de capacidades, costes y dependencias.</p>
            </div>
            <div className="p-3 bg-card/60 rounded border border-border/40 space-y-1">
              <span className="font-mono text-amber font-bold block">5. SIMULAR</span>
              <p className="text-muted-foreground text-[11px]">Enlace directo a /labs/ y /cuartel?tab=tools con parámetros sugeridos.</p>
            </div>
          </div>
        </section>

        {/* Catálogo Interactivo con Búsqueda y Filtros */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-mono uppercase font-bold text-foreground">
              Dossiers Temáticos Disponibles
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {stats.totalTemas} investigaciones publicadas
            </span>
          </div>

          <CatalogoInvestigacion temas={TEMAS_INVESTIGACION} />
        </section>
      </div>
    </main>
  );
}
