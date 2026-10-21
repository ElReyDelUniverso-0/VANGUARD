import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron, Inter, Rajdhani, JetBrains_Mono } from "next/font/google";

// v34 SEO GLOBAL: la URL canónica DEBE apuntar a un dominio real. vanguard.world
// aún no tiene DNS (NXDOMAIN): si el canonical apuntara ahí, Google no podría
// indexar y las vistas previas de WhatsApp/X saldrían sin imagen. Orden:
// 1) NEXT_PUBLIC_SITE_URL si está definida  2) URL de producción actual.
// NOTA: cuando se conecte vanguard.world, añadir la env en Vercel y prioriza esa.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";
const SITE_NAME = "VANGUARD — Conflictos Mundiales en Tiempo Real";
const SITE_DESC =
  "La plataforma de conflictos mundiales #1: noticias de guerra en vivo, mapa OSINT 3D con 15 capas de inteligencia, guerra global multijugador, duelos 1v1 con ranking ELO, simulador de guerras, detective por país, apuestas y economía de gemas. Gratis, en español.";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { RetentionLayer } from "@/components/vanguard/retention-layer";
// v151.0 VANGUARD-2: guardia de ruta — /vanguard2 es un universo 3D puro,
// ninguna capa DOM de la Casa monta encima (mandato: cero 2D en el nuevo Vanguard)
import { SoloCasa } from "@/components/vanguard2/solo-casa";
import { Rehidratador } from "@/components/vanguard/rehidratador";
// v133.0 EL ACABADO REAL: el cuerpo de agentes late en TODAS las salas
import { MotorAgentes } from "@/components/vanguard/motor-agentes";
// v134.0 EL ESTRENO: el tráiler de carga — una proyección por sesión
// v148: el import del tráiler se retira — el estreno es la ceremonia 3D del mundo
// v135.0 NEXUS-HYPNOS: el motor de tensión global — la Casa entera respira
// con el pulso del planeta (html[data-tension] + --vg-tension, cero re-render)
import { MotorNexus } from "@/components/vanguard/motor-nexus";
// v99.0 MENTE VIVA: el pulso autónomo global (el mundo se actualiza solo)
import { PulsoAuto } from "@/components/vanguard/pulso-auto";
// v101.0 EL REGRESO — PILAR 1: banner global "el mundo cambió" en todas las páginas
import { RegresoBanner } from "@/components/vanguard/regreso-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ====== v13 CENTRO DE MANDO: tipografia militar/tecnica ======
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jetMono = JetBrains_Mono({
  variable: "--font-jetmono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Título SEO orientado a búsquedas principales (conflictos / guerra / mapa)
  title: {
    default: "VANGUARD · Conflictos Mundiales en Vivo, Mapa OSINT 3D y Guerra Global Multijugador",
    template: "%s · VANGUARD",
  },
  description: SITE_DESC,
  applicationName: "VANGUARD",
  keywords: [
    "conflictos mundiales",
    "guerras en vivo",
    "noticias de guerra",
    "mapa de conflictos",
    "mapa mundial 3D",
    "OSINT",
    "inteligencia geopolítica",
    "guerra global multijugador",
    "juego de guerra online",
    "simulador de guerras",
    "trivia de banderas",
    "ranking ELO",
    "tension mundial",
    "geopolítica juego",
    "detective mundial",
    "apuestas de guerra",
    "predicciones geopolíticas",
    "crisis mundial en vivo",
    "juego de países",
    "conquista del mundo",
  ],
  authors: [{ name: "Vanguard Command" }],
  creator: "Vanguard Command",
  publisher: "Vanguard Command",
  category: "news",
  alternates: { canonical: "/" },
  // Robots: indexacion total con fragmentos grandes en resultados
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // v54.1 GOOGLE SEARCH CONSOLE: meta de verificación de propiedad.
  // Google exige encontrar esta etiqueta exacta en el <head> de la portada
  // para confirmar que somos dueños del sitio y poder pedir indexación,
  // enviar sitemap y ver búsquedas desde Search Console.
  verification: {
    google: "0ZwaEFYOrfzU-l1mpA9H5Ze-j8fgNUFhBjdkYBKvuZ4",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  manifest: "/manifest.webmanifest",
  // Tarjeta grande al compartir por WhatsApp/X/Telegram: clave para viralidad
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "VANGUARD · Conflictos Mundiales en Vivo, Mapa OSINT 3D y Guerra Multijugador",
    description: SITE_DESC,
    images: [
      {
        // v35: OG DINÁMICA — imagen viva con agentes totales + noticias 24h.
        // Cada compartida en WhatsApp/X/Telegram muestra cifras actualizadas.
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "VANGUARD — La plataforma de conflictos mundiales en tiempo real",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VANGUARD · El Mundo en Tiempo Real",
    description: SITE_DESC,
    images: ["/api/og"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VANGUARD",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  width: "device-width",
  initialScale: 1,
};

// v18: DATOS ESTRUCTURADOS JSON-LD — le dicen a Google exactamente qué es
// la página (sitio web + aplicación + organización), clave para aparecer
// destacado en resultados enriquecidos.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: "Vanguard",
      description: SITE_DESC,
      inLanguage: "es",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: "VANGUARD",
      url: SITE_URL,
      applicationCategory: "NewsApplication",
      operatingSystem: "Web",
      browserRequirements: "Requiere JavaScript",
      inLanguage: "es",
      description: SITE_DESC,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      featureList: [
        "Noticias de conflictos en vivo",
        "Mapa OSINT 3D con 15 capas de inteligencia",
        "Guerra global multijugador por rondas",
        "Duelos 1v1 con ranking ELO",
        "Simulador de guerras",
        "Modo detective por país",
        "Bolsa geopolítica y apuestas",
        "Enciclopedia y épocas históricas",
        "Biblioteca oscura con 43 entradas verificadas y documentos desclasificados",
      ],
      // v63.0 PRIMERA PÁGINA: el aggregateRating falso (4.8/1240) se QUITA —
      // Google lo marca como spam de datos estructurados (reseñas auto-servidas)
      // y puede penalizar los resultados enriquecidos de todo el sitio.
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Vanguard Command",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
    },
    {
      // v34: FAQPage — preguntas frecuentes visibles en la portada (SeoFaq).
      // Google puede mostrar estas respuestas directamente en resultados.
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Qué es VANGUARD?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "VANGUARD es la plataforma de conflictos mundiales en tiempo real: reúne noticias de guerras en vivo, un mapa OSINT 3D con capas de inteligencia, tensión global por país y un juego de guerra global multijugador. Todo en un solo lugar, en español y gratis.",
          },
        },
        {
          "@type": "Question",
          name: "¿Cuánto cuesta? ¿Hay que pagar algo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Nada. VANGUARD es 100% gratis: no pide tarjeta, no tiene suscripción y funciona directamente en el navegador del celular o la computadora.",
          },
        },
        {
          "@type": "Question",
          name: "¿Necesito instalar una app?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No es obligatorio: entra y juega directo desde el navegador. Opcionalmente puedes instalarla como app para abrirla en un toque desde tu pantalla de inicio.",
          },
        },
        {
          "@type": "Question",
          name: "¿En qué idiomas está disponible?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "VANGUARD está en 8 idiomas: español, inglés, portugués, francés, alemán, italiano, ruso y chino.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${inter.variable} ${rajdhani.variable} ${jetMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        {/* v151.0: en /vanguard2 NINGUNA capa DOM de la Casa monta encima del canvas 3D */}
        {/* v132.0 LA GRAN AUDITORÍA: el REHIDRATADOR — los valores guardados
            entran tras la hidratación de React; adiós al error #418 para siempre */}
        <SoloCasa>
          <Rehidratador />
        </SoloCasa>
        {/* v133.0: el cuerpo de agentes autónomos — la Casa se pule sola
            en cualquier sala, sin que nadie tenga que visitar su sala */}
        <SoloCasa>
          <MotorAgentes />
        </SoloCasa>
        {/* v134.0 EL ESTRENO — RETIRADO EN v148: la ceremonia de entrada del
            mundo WebGL (negro → estrellas → globo → logo 3D → placa ENTRAR)
            ES el estreno ahora; el tráiler DOM era la última capa 2D del
            arranque (mandato del Dueño: «arrancan 2D aún») */}
        {/* v135.0 NEXUS-HYPNOS: el pulso del planeta viste la Casa entera */}
        <SoloCasa>
          <MotorNexus />
        </SoloCasa>
        {/* v55.0 TEMPORADA CERO: capa global de retención en TODAS las páginas */}
        <SoloCasa>
          <RetentionLayer />
        </SoloCasa>
        {/* v99.0 MENTE VIVA: el pulso autónomo — Vanguard se actualiza sola en TODAS las páginas */}
        <SoloCasa>
          <PulsoAuto />
        </SoloCasa>
        {/* v101.0 EL REGRESO — PILAR 1: el mundo cambió mientras no mirabas (banner de regreso) */}
        <SoloCasa>
          <RegresoBanner />
        </SoloCasa>
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
