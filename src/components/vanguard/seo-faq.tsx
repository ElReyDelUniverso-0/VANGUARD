"use client";

// v34 — FAQ visible del sitio: doble propósito.
// 1) SEO: contenido real e indexable (Google premia páginas que responden
//    preguntas). Va alineado con el JSON-LD FAQPage del layout.
// 2) Conversión: el visitante nuevo entiende qué es VANGUARD en 20 segundos.

import { Radar, HelpCircle } from "lucide-react";
import { FAQ } from "@/lib/seo-faq-data";

// v405.7: las preguntas viven en src/lib/seo-faq-data.ts — la MISMA lista
// alimenta esta sección visible y el JSON-LD FAQPage de /cuartel (layout).


export function SeoFaq() {
  return (
    <section className="mt-6 hud-panel p-5 relative overflow-hidden" aria-label="Preguntas frecuentes sobre VANGUARD">
      <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-60" aria-hidden />
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-electric" />
        <h2 className="font-orbitron text-sm tracking-widest uppercase text-gradient">
          Preguntas frecuentes
        </h2>
      </div>
      <div className="grid gap-2">
        {FAQ.map((f) => (
          <details
            key={f.q}
            className="group border border-border rounded-md bg-black/20 px-3.5 py-2.5 open:border-electric/40 transition-colors"
          >
            <summary className="flex items-center gap-2 cursor-pointer list-none text-xs font-mono uppercase tracking-wider text-foreground/90 group-open:text-electric">
              <Radar className="w-3.5 h-3.5 text-amber shrink-0" />
              {f.q}
            </summary>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
      {/* v35: enlace interno rastreable al canal SEO de noticias */}
      <a
        href="/guerra-hoy"
        className="mt-3 inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-electric hover:text-amber transition-colors"
      >
        <Radar className="w-3.5 h-3.5" /> Últimas noticias de guerra → Guerra Hoy
      </a>
    </section>
  );
}
