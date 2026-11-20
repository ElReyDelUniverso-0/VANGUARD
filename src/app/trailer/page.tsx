import type { Metadata } from "next";
import Link from "next/link";
// v432.0 EL TRÁILER — la página de proyección: el tráiler con capítulos que
// saltan a cada sala y, debajo, la misma ruta escrita para quien prefiera leer.
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { TrailerVanguard } from "@/components/trailer/trailer-vanguard";
import { TRAILER_POSTER, TRAILER_SRC } from "@/components/trailer/trailer-datos";

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "Tráiler — Vanguard explicado en 80 segundos",
  description:
    "El recorrido completo de Vanguard en vídeo: noticias en tiempo real, Guerra Hoy, el globo 3D, 249 países, Lingua, la Armería, la Enciclopedia, el Cuartel y la nueva Zona Cero.",
  alternates: { canonical: "/trailer" },
  openGraph: {
    title: "VANGUARD · el tráiler",
    description: "Todo Vanguard, explicado en ochenta segundos.",
    images: [{ url: TRAILER_POSTER, width: 1280, height: 720 }],
    videos: [{ url: TRAILER_SRC, width: 1280, height: 720, type: "video/mp4" }],
  },
};

const RECORRIDO: { titulo: string; texto: string; ruta: string }[] = [
  { titulo: "Noticias en tiempo real", texto: "Cables de medios de todo el mundo, con su hora y su fuente, ordenados por tema y por región.", ruta: "/en-vivo" },
  { titulo: "Guerra Hoy", texto: "Cada conflicto frente por frente, con mapas, cifras y su cronología.", ruta: "/guerra-hoy" },
  { titulo: "El globo 3D", texto: "Gira el planeta con el dedo y entra en cualquier punto de la Tierra.", ruta: "/mundo" },
  { titulo: "249 países", texto: "Una ficha por país: historia, economía, poder militar y sus propias noticias.", ruta: "/mundos" },
  { titulo: "Lingua", texto: "Más de ocho mil lenguas en un mapa: cómo habla el planeta.", ruta: "/lingua" },
  { titulo: "Armería y Enciclopedia", texto: "Cada arma con su historia; civilizaciones y ciencia, con fuentes.", ruta: "/armeria" },
  { titulo: "El Cuartel", texto: "Todas las salas en una sola pantalla, bajo la misma piel.", ruta: "/cuartel" },
  { titulo: "Zona Cero", texto: "El ojo de Vanguard busca en toda la casa; tú fijas lo que encuentras en tu constelación.", ruta: "/zona-cero" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: "VANGUARD · el tráiler",
  description: "Todo Vanguard, explicado en ochenta segundos.",
  thumbnailUrl: [`${SITE}${TRAILER_POSTER}`],
  contentUrl: `${SITE}${TRAILER_SRC}`,
  uploadDate: "2026-11-20",
  duration: "PT1M21S",
  inLanguage: "es",
};

export default function TrailerPage() {
  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 16px 64px", color: "#f4f1ea" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <p style={{ margin: 0, font: "700 11px/1.2 ui-monospace, monospace", letterSpacing: ".16em", textTransform: "uppercase", color: "#e8c56a" }}>
        Sala de proyección
      </p>
      <h1 style={{ margin: "6px 0 6px", fontSize: "clamp(1.7rem, 4vw, 2.6rem)", fontWeight: 900, lineHeight: 1.1 }}>
        Vanguard, explicado en 80 segundos
      </h1>
      <p style={{ margin: "0 0 22px", color: "#a9afba", maxWidth: 680 }}>
        El recorrido completo de la casa, contado con sus propias pantallas. Pulsa un capítulo para saltar a esa sala del vídeo, o «Entrar» para ir directo a ella.
      </p>
      <TrailerVanguard />
      <h2 style={{ margin: "40px 0 14px", fontSize: "1.3rem", fontWeight: 800 }}>El recorrido, por escrito</h2>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
        {RECORRIDO.map((r) => (
          <Link
            key={r.ruta}
            href={r.ruta}
            style={{ display: "block", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(232,197,106,.25)", background: "rgba(10,12,18,.75)", color: "inherit", textDecoration: "none" }}
          >
            <strong style={{ display: "block", color: "#e8c56a", marginBottom: 4 }}>{r.titulo} →</strong>
            <span style={{ color: "#c9cdd6", fontSize: ".92rem" }}>{r.texto}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
