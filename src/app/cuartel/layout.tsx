import type { Metadata } from "next";
import { FAQ } from "@/lib/seo-faq-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";

// v400.0 EL REDISEÑO — el cuartel (la app de juego y salas de siempre) vive
// ahora en /cuartel; la portada "/" es la redacción nueva.
export const metadata: Metadata = {
  title: "Cuartel — juego, misiones y salas",
  description: "El cuartel de VANGUARD: guerra global multijugador, misiones, quiz, mercado, simulador y todas las salas.",
  alternates: { canonical: "/cuartel" },
};

// v405.7 EL ESCAPARATE: el FAQPage vive aquí, en la única página donde las
// preguntas se ven (SeoFaq). Sale de la misma lista que la sección visible.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/cuartel#faq`,
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function CuartelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(faqJsonLd) }} />
      {children}
    </>
  );
}
