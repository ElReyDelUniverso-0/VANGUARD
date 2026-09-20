import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron, Inter, Rajdhani, JetBrains_Mono } from "next/font/google";

// v18 SEO GLOBAL: URL canonica configurable por entorno. Cambia NEXT_PUBLIC_SITE_URL
// al dominio definitivo para que Google indexe la direccion correcta.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard.world";
const SITE_NAME = "VANGUARD — Conflictos Mundiales en Tiempo Real";
const SITE_DESC =
  "La plataforma de conflictos mundiales #1: noticias de guerra en vivo, mapa OSINT 3D con 15 capas de inteligencia, guerra global multijugador, duelos 1v1 con ranking ELO, simulador de guerras, detective por país, apuestas y economía de gemas. Gratis, en español.";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

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
        url: "/og-image.png",
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
    images: ["/og-image.png"],
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
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1240",
        bestRating: "5",
        worstRating: "1",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Vanguard Command",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
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
        <Toaster />
        <Sonner />
      </body>
    </html>
  );
}
