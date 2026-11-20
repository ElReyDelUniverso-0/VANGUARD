import type { Metadata } from "next";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SITE_URL } from "@/lib/site";
import { ENCUADRE } from "@/lib/resiliencia/secciones";
import { CATEGORIAS, ITEMS, RESPUESTA_MINIMA } from "@/lib/resiliencia/evaluador";
import { EvaluadorResiliencia } from "./cliente";

// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · LA HERRAMIENTA «COMMUNITY RESILIENCE»
// La puerta de servidor; el instrumento vive en cliente.tsx. La metadata
// describe lo que la herramienta ES (evaluación educativa, resultado
// orientativo) y no promete lo que NO ES (certificación, alerta, diagnóstico).
// ═══════════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "COMMUNITY RESILIENCE — evaluación educativa de la preparación comunitaria",
  description: `Autoevaluación educativa sobre ${CATEGORIAS.length} categorías y ${ITEMS.length} preguntas: información y comunicación, acceso a servicios, educación preventiva, inclusión de personas vulnerables, continuidad de servicios esenciales y recuperación comunitaria. Resultado orientativo, nunca una certificación. ${ENCUADRE.texto.slice(0, 80)}`,
  alternates: { canonical: `${SITE_URL}/resiliencia/evaluacion` },
};

export default function EvaluacionResiliencia() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "COMMUNITY RESILIENCE",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/resiliencia/evaluacion`,
    inLanguage: "es",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    description: `Evaluación educativa de la preparación de una comunidad sobre ${CATEGORIAS.length} categorías, con ${ITEMS.length} preguntas y ${RESPUESTA_MINIMA} respuestas mínimas para una lectura orientativa.`,
    featureList: CATEGORIAS.map((c) => c.nombre),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <EvaluadorResiliencia />
    </>
  );
}
