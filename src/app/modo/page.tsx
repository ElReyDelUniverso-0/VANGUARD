// ============================================================
// v214.0 LA PUERTA — /modo
// La casa permanente del selector: «¿qué quieres hacer en Vanguard?»
// + tu cuenta. El ritual de entrada (portada) la ofrece como promesa
// («puedes cambiarlo cuando quieras en /modo»); esta página la cumple.
// Server shell honesto (título, resumen, noscript) + selector client
// (el modo y la cuenta viven en el aparato y en la Ciudadela).
// ============================================================
import type { Metadata } from "next";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { SelectorModo } from "./selector-modo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "TU MODO · TU CUENTA — Vanguard",
  description:
    "Elige tu modo en Vanguard: EL VÉRTIGO, EN VIVO, GUERRA HOY, ZONA CERO, MISIONES o la portada total. Aliádate con tu cuenta y entra directo a tu puerta cada día.",
  alternates: { canonical: "/modo" },
};

export default function ModoPage() {
  // v242.0 EL KIT COMPLETO — la ficha honesta de la puerta para Google
  // (patrón v215 con jsonLdSeguro): WebPage — /modo es una página de la
  // casa, no una app suelta; su valor es el selector y las seis puertas.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "TU MODO · TU CUENTA — Vanguard",
    description:
      "Elige tu modo en Vanguard: EL VÉRTIGO, EN VIVO, GUERRA HOY, ZONA CERO, MISIONES o la portada total. Aliáate con tu cuenta y entra directo a tu puerta cada día.",
    url: `${SITE_URL}/modo`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <main className="min-h-screen bg-[#070604] text-foreground">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <header>
            <p className="font-mono text-[10px] tracking-[0.3em] text-amber uppercase">v214.0 · la puerta</p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-black tracking-tight">
              ¿QUÉ QUIERES HACER EN VANGUARD?
            </h1>
            <p className="mt-3 text-[13.5px] sm:text-[15px] leading-relaxed text-muted-foreground">
              Seis modos, seis puertas reales de la casa. Elige el tuyo y Vanguard te recibe cada día
              directo donde tú quieras: deslizar el mundo, la última hora en directo, el frente, la
              ciudad que cae, tus misiones o la portada total.
            </p>
          </header>

          <SelectorModo />

          <noscript>
            <p className="mt-8 text-[12.5px] text-muted-foreground">
              El selector necesita JavaScript. Mientras tanto, cada modo es una página abierta:
              /vertigo · /en-vivo · /guerra-hoy · /zona-cero · /mision · /
            </p>
          </noscript>
        </div>
      </main>
    </>
  );
}
