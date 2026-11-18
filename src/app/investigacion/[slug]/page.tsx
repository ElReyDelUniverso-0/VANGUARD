import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TEMAS_INVESTIGACION, obtenerTemaInvestigacion } from "@/lib/investigacion";
import { TemaInteractivo } from "@/components/vanguard/investigacion/tema-interactivo";
import { SITE_URL } from "@/lib/site";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { ChevronRight, ArrowLeft, Calendar, ShieldCheck, Tag } from "lucide-react";

export const dynamicParams = false;

export function generateStaticParams() {
  return TEMAS_INVESTIGACION.map((t) => ({ slug: t.id }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tema = obtenerTemaInvestigacion(slug);

  if (!tema) {
    return { title: "Dossier no encontrado · VANGUARD" };
  }

  const titulo = `${tema.titulo} — Vanguard Investigación`;
  const descripcion = tema.subtitulo;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/investigacion/${tema.id}` },
    openGraph: {
      type: "article",
      title: titulo,
      description: descripcion,
      url: `${SITE_URL}/investigacion/${tema.id}`,
      siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
      locale: "es_ES",
      publishedTime: tema.fechaActualizacion,
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
    },
  };
}

export default async function DossierPage({ params }: Props) {
  const { slug } = await params;
  const tema = obtenerTemaInvestigacion(slug);

  if (!tema) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: tema.titulo,
    alternativeHeadline: tema.subtitulo,
    description: tema.resumenEjecutivo,
    datePublished: tema.fechaActualizacion,
    dateModified: tema.fechaActualizacion,
    url: `${SITE_URL}/investigacion/${tema.id}`,
    publisher: {
      "@type": "Organization",
      name: "Vanguard Global Intelligence",
      url: SITE_URL,
    },
    about: tema.etiquetas.map((e) => ({
      "@type": "Thing",
      name: e,
    })),
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />

      {/* ── BREADCRUMBS & NAVEGACIÓN SUPERIOR ── */}
      <nav aria-label="Ruta de navegación" className="border-b border-border/50 bg-secondary/20 px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5 overflow-x-auto thin-scroll">
            <Link href="/" className="hover:text-foreground transition-colors shrink-0">
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href="/investigacion" className="hover:text-foreground transition-colors shrink-0">
              Investigación
            </Link>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="text-amber truncate max-w-[200px] sm:max-w-none">{tema.titulo}</span>
          </div>

          <Link
            href="/investigacion"
            className="flex items-center gap-1 hover:text-amber transition-colors shrink-0 ml-2"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Todos los temas</span>
          </Link>
        </div>
      </nav>

      {/* ── CABECERA EDITORIAL DEL DOSSIER ── */}
      <header className="border-b border-border/60 bg-gradient-to-b from-secondary/40 to-background px-4 sm:px-6 pt-10 pb-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-hud/20 text-amber border border-amber-hud/50 rounded uppercase">
              {tema.categoria.replace("_", " & ")}
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/60 rounded flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Actualizado: {tema.fechaActualizacion}
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-800/40 rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Fuentes Institucionales Auditadas
            </span>
          </div>

          <h1 className="font-mono text-2xl sm:text-4xl font-black uppercase text-foreground leading-tight">
            {tema.titulo}
          </h1>

          <p className="max-w-4xl text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">
            {tema.subtitulo}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {tema.etiquetas.map((e, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[11px] font-mono bg-secondary/50 text-foreground/80 rounded border border-border/50"
              >
                #{e}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── INTERFAZ INTERACTIVA MULTIMODAL ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6">
        <TemaInteractivo tema={tema} />
      </div>
    </main>
  );
}
