import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Orbitron, Rajdhani, JetBrains_Mono } from "next/font/google";

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
// v186.0 EL SALVAVIDAS: la versión viaja dentro del script inline (placa de
// cortina) — cada captura del Dueño diagnostica sola (¿pestaña vieja o build nuevo?)
import { APP_VERSION } from "@/lib/version";
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

// v193.0 LA CASA LIGERA — la familia Inter se jubila: el texto base ahora
// nace en Geist Sans (ya viajaba en la casa); una familia menos que bajar
// en cada visita con señal lenta.
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
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${rajdhani.variable} ${jetMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {/* ════════════════════════════════════════════════════════════
            v155.0 LA CORTINA DE ARRANQUE — la ley contra la pantalla muerta.
            El Dueño (móvil) pasó 3 días viendo NADA: el servidor dev moría
            de OOM y su teléfono se quedaba en negro sin decir nada. Esta
            cortina es HTML/CSS PURO: se pinta ANTES de que exista JavaScript,
            siempre. Si una página pesada tarda >12s en dar señal de vida
            (window.__vgvivo — desde v173.0 solo /vanguard2 lo exige: la casa
            plana se funde sola al cargar), ofrece el botón
            «TOCA PARA DESPERTARLO» (recarga con guardia anti-bucle). Si el
            fallo es de chunks viejos (despliegue nuevo), UNA recarga sola
            por minuto. En las páginas ligeras (portales) se retira sola al
            completar la carga: solo los universos 3D exigen señal de vida.

            v178.0 EL DESPERTADOR — la ley contra la cortina eterna. El Dueño
            volvió a quedarse horas en «Desplegando el universo» con el
            servidor sano: la causa era la ESPERA DEL EVENTO LOAD (un chunk
            de 1MB+ estancado en la red móvil deja readyState en interactive
            para siempre) y la falta de rescate fuera del universo pesado.
            Cura triple: ① la casa plana se funde de la cortina en cuanto el
            DOM existe (el HTML prerenderizado YA ES la casa entera — el load
            ya no manda); ② botón de rescate también en rutas ligeras (10s)
            y tope duro de 20s: la cortina JAMÁS es eterna; ③ en el universo
            pesado el ojo ya no muere a los 20s (si __vgvivo llega tarde, la
            cortina se funde igual) y recibe tope duro de 60s.

            v181.0 EL RESCATE TOTAL — «el otro vanguard se queda cargando y
            nunca termina»: los dos Huecos que v178 no cubría. ④ NAVEGADOR
            VIEJO: si el aparato no puede NI PARSEAR el bundle, NADA de React
            corre — ningún rescate interno existiría. Cheque de capacidades
            (Promise/Map/Set/fetch/addEventListener) en ES5 PURO, antes del
            bundle: mensaje honesto «demasiado antiguo» y fin (nada de
            recargas en bucle con esperanza falsa). ⑤ EL VIGÍA POST-CORTINA:
            la cortina se levanta con el DOM (v178) — si el bundle murió
            después, el piloto queda en una casa MUDA sin explicación. Un
            vigía externo a React vigila la señal __vgvivo: si no llega
            (20s ligeras / 68s pesadas), levanta una barra honesta con
            RECARGAR — y se retira sola si la casa respira tarde.

            v182.0 EL ÚLTIMO RESCATE — el Dueño lo vio OTRA VEZ: «no termina
            de cargar, se queda en iniciando universo» CON el server sano y
            la cortina v181 con tope duro de 20s/60s. El agujero que queda:
            TODO el rescate v178/v181 vive en timers de JavaScript — si el
            hilo principal del aparato MUERE o bloquea (pestaña congelada
            por el SO, un chunk que spinea el hilo en un móvil viejo), los
            timers nunca corren y NINGÚN rescate JS se ejecuta: cortina
            eterna de verdad. La cura es HTML PURO, sin ni un byte de JS:
            un <meta http-equiv=refresh> DENTRO de la cortina. Si la cortina
            sigue viva a los 70s (pasado el tope pesado de 60s), el NAVEGADOR
            mismo recarga — no depende del hilo, ni de timers, ni de React.
            Arranque sano: apagar() retira la cortina (y el meta dentro) en
            ≤20s/≤60s y el refresh jamás dispara. Guardia anti-bucle: si
            hace <90s ya hubo un rescate, el guión estira el meta a 300s
            (un reintento lento cada 5 min, nunca un bucle vertiginoso).

            v189.0 LA LEY SAGRADA — «entro carga bien y después vuelve a
            cargar y 30 segundos exactos recarga de nuevo: injugable». La
            autopsia del bucle encontró TRES gatillos de recarga peleándose
            con una señal lenta: el carril rápido v186 ponía el socorro a
            los 30s EXACTOS en sesiones ya atascadas; el bote/paciente
            recargaban al detectar estancamiento; el meta de rescate mataba
            a los 70s un HTML que aún bajaba. Cada recarga TIRABA la
            descarga (una respuesta sin terminar no se cachea) y el
            reintento empezaba de CERO: matemática de nunca terminar. LA
            CURA ES UNA LEY: NADA SE RECARGA SOLO. JAMÁS. ① el bote y el
            paciente ya no recargan: solo dicen la verdad de la descarga
            (KB reales) y esperan — una descarga que nadie tira SIEMPRE
            termina; ② el carril rápido de 30s muere; ③ el meta nace
            SIEMPRE a 300s (solo dispara si JavaScript jamás ejecutó);
            ④ los errores de módulo ya no recargan: la casa hidrata con lo
            que llegó; ⑤ __vgcasa por fin NACE (nadie la seteaba desde
            v185): cuando el último _next termina, la casa lo anuncia.
            ════════════════════════════════════════════════════════════ */}
        <div id="vg-cortina" role="status" aria-label="Vanguard cargando">
          {/* v182.0 EL ÚLTIMO RESCATE: el meta http-equiv=refresh NO vive aquí
              en el JSX — React 19 ELEVA los <meta> al <head> en la hidratación
              (QA lo cazó vivo: una recarga fantasma cada 70s en una casa
              sana). Lo crea el guión vanilla de abajo en document.head, fuera
              del árbol de React: nadie puede resucitarlo salvo el navegador
              con la cortina muerta. */}
          <style dangerouslySetInnerHTML={{ __html: `
            #vg-cortina{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;background:radial-gradient(120% 90% at 50% 110%,#14100a 0%,#070606 55%,#050404 100%);transition:opacity .65s ease;font-family:var(--font-orbitron),system-ui,sans-serif}
            #vg-cortina.vg-off{opacity:0;pointer-events:none}
            /* v184.0 LA CORTINA DE PIEDRA — la ley contra la cortina CONGELADA.
               El Dueño la vio de nuevo (captura real 2026-10-27: «se queda así
               y ya no termina», cortina viva SIN botón y SIN mensaje = los
               timers del ojo NUNCA corrieron: el aparato congeló/mató la
               pestaña a mitad de carga y Chrome pintó el último fotograma =
               la cortina, eterna). Ni el meta refresh ni los timers pueden
               salvar un renderer muerto… pero la OPACIDAD la anima el hilo
               DEL COMPOSITOR, que sigue vivo aunque el hilo principal esté
               muerto o congelado: a los 75s la cortina se funde SOLA, sin
               JS, sin timers, sin React — y deja ver la casa prerenderizada
               detrás. En un arranque sano esto jamás se ve: apagar() retira
               el nodo entero en ≤1s. pointer-events:none garantiza que una
               cortina invisible jamás tape un toque. */
            #vg-cortina{animation:vgCortinaPiedra 1.2s ease 75s forwards}
            @keyframes vgCortinaPiedra{to{opacity:0;visibility:hidden;pointer-events:none}}
            #vg-cortina .vg-faro{width:9px;height:9px;border-radius:50%;background:#e8c476;box-shadow:0 0 0 0 rgba(232,196,118,.55);animation:vgFaro 1.6s ease-out infinite}
            #vg-cortina .vg-marca{font-size:clamp(30px,9vw,60px);font-weight:800;letter-spacing:.4em;color:#e8c476;text-shadow:0 0 26px rgba(232,196,118,.28);margin-right:-.4em}
            #vg-cortina .vg-estado{font-family:var(--font-jetmono),monospace;font-size:11px;letter-spacing:.32em;color:rgba(232,196,118,.72);text-transform:uppercase;text-align:center;padding:0 18px}
            #vg-cortina .vg-estado::after{content:'';animation:vgPuntos 1.2s steps(4,end) infinite}
            #vg-cortina .vg-barra{width:170px;height:2px;overflow:hidden;border-radius:2px;background:rgba(232,196,118,.14)}
            #vg-cortina .vg-barra i{display:block;width:40%;height:100%;background:linear-gradient(90deg,transparent,#e8c476,transparent);animation:vgBrillo 1.15s linear infinite}
            #vg-cortina-btn{display:none;margin-top:6px;border:1px solid #e8c476;color:#e8c476;background:rgba(232,196,118,.07);padding:15px 24px;letter-spacing:.24em;font-size:12px;font-weight:600;border-radius:2px;text-transform:uppercase;font-family:inherit}
            #vg-cortina-btn[data-on="1"]{display:inline-block;animation:vgAparecer .5s ease-out}
            #vg-cortina .vg-nojs{color:rgba(232,196,118,.8);font-size:12px;letter-spacing:.2em;text-align:center;padding:0 24px}
            #vg-cortina .vg-ver{font-family:var(--font-jetmono),monospace;font-size:9px;letter-spacing:.3em;color:rgba(232,196,118,.42);text-transform:uppercase}
            @keyframes vgFaro{0%{box-shadow:0 0 0 0 rgba(232,196,118,.5)}100%{box-shadow:0 0 0 18px rgba(232,196,118,0)}}
            @keyframes vgBrillo{0%{transform:translateX(-110%)}100%{transform:translateX(320%)}}
            @keyframes vgPuntos{0%{content:''}25%{content:'·'}50%{content:'··'}75%{content:'···'}}
            @keyframes vgAparecer{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
            @media (prefers-reduced-motion:reduce){#vg-cortina *{animation:none !important}}
          `}} />
          <span className="vg-faro" />
          <span className="vg-marca">VANGUARD</span>
          <span className="vg-barra"><i /></span>
          <span className="vg-estado" id="vg-cortina-estado">Desplegando el universo</span>
          <span className="vg-ver" id="vg-cortina-ver">despliegue {APP_VERSION}</span>
          <button id="vg-cortina-btn" type="button">El universo no responde · Toca para despertarlo</button>
          <noscript><span className="vg-nojs">VANGUARD necesita JavaScript activado para desplegar el universo 3D.</span></noscript>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `(function(){
try{
  var VER='${APP_VERSION}';
  var c=document.getElementById('vg-cortina'); if(!c) return;
  var btn=document.getElementById('vg-cortina-btn');
  var st=document.getElementById('vg-cortina-estado');
  var K='vg155-recarga';
  var esI=(navigator.language||'es').toLowerCase().indexOf('es')===0;
  // v181.0 EL RESCATE TOTAL — ④ EL CHEQUE DE CAPACIDADES (ES5 puro, corre
  // SIEMPRE, ni un byte del bundle hace falta): si el navegador no puede
  // ejecutar la Casa, se lo decimos a la cara en vez de dejar una cortina
  // muda o una casa muerta. Nada de bucles de recarga con esperanza falsa.
  var sinSoporte=false;
  try{
    if(typeof Promise==='undefined') sinSoporte=true;
    else if(typeof Map==='undefined'||typeof Set==='undefined') sinSoporte=true;
    else if(typeof window.fetch==='undefined') sinSoporte=true;
    else if(!window.addEventListener||!document.querySelector) sinSoporte=true;
  }catch(e){ sinSoporte=true; }
  if(sinSoporte){
    try{
      if(st) st.textContent=esI?'Este navegador es demasiado antiguo para VANGUARD':'This browser is too old for VANGUARD';
      var nota=document.createElement('div'); nota.className='vg-nojs';
      nota.textContent=esI?'Actualiza Chrome o Samsung Internet para entrar al universo.':'Update your browser to enter the universe.';
      c.appendChild(nota);
    }catch(e){}
    return;
  }
  // v187.0 EL TESTIGO — la primera herida de esta pestaña queda ESCRITA.
  // El modo 2 del socorrista (hidratación atascada) muere en silencio en
  // aparatos que QA no cubre (la tablet del Dueño): este testigo captura el
  // PRIMER error de script y la PRIMERA promesa rota, con la primera línea
  // del stack, y lo guarda en sessionStorage. El socorro lo pinta como
  // «CÓDIGO: …» — la próxima captura del Dueño trae la CAUSA, no una
  // adivinanza. Sin regex (barras dentro del template literal), indexOf.
  function testigo(m){
    try{
      var t=String(m||'');
      if(!t||t.indexOf('ResizeObserver')>-1) return;
      sessionStorage.setItem('vg187-err',t.slice(0,170));
    }catch(e){}
  }
  window.addEventListener('error',function(e){
    try{
      var m=(e&&e.message)||'';
      if(!m&&e&&e.target&&e.target.tagName) m='RECURSO '+(e.target.src||e.target.href||e.target.tagName);
      if(!m) return;
      var s=(e&&e.error&&e.error.stack)||'';
      if(s) m=m+' @ '+String(s).slice(0,110);
      testigo(m);
    }catch(x){}
  },true);
  window.addEventListener('unhandledrejection',function(e){
    try{
      var r=e&&e.reason;
      var m=(r&&(r.message||r.name))||String(r||'PROMESA ROTA');
      var s=(r&&r.stack)||'';
      if(s) m=m+' @ '+String(s).slice(0,110);
      testigo(m);
    }catch(x){}
  });
  // v188.0 EL PACIENTE — instrumentos de vida del CHORRO de descarga.
  // La captura del Dueño (cortina v187 a los 30s, batería al 4%) y su relato
  // («30 segundos después pasa lo mismo») cazaron el bucle de inanición:
  // el bote v186 recargaba a los ~34s y TIRABA la descarga a medio camino —
  // y una respuesta sin TERMINAR no se cachea: cada reintento volvía a
  // bajar 1.8MB DE CERO en una señal que necesita más de 34s. Matemática
  // de nunca terminar. Cura: saber si el chorro está VIVO antes de pisar.
  // vgCargaTerminada cuenta cada script/estilo de _next que TERMINA (load o
  // error — capture: los eventos de recurso no burbujean) y estampa hora;
  // vgPendientes cuenta los que siguen en el alambre; vgChorroVivo decide
  // con una ley honesta: vivo = algo terminó hace <15s, o la primera ola
  // aún viaja (nada terminó pero hay pendientes — tope 75s sin NADA).
  var vgCargas=0, vgUltCarga=0, vgT0=Date.now();
  function vgCargaTerminada(e){
    try{
      var tg=e&&e.target; if(!tg||!tg.tagName) return;
      if(tg.tagName!=='SCRIPT'&&tg.tagName!=='LINK') return;
      var u=String(tg.src||tg.href||'');
      if(u.indexOf('/_next/')<0) return;
      tg.setAttribute('data-vghecho','1');
      // v189.0 EL ERROR NO ES VIDA — un recurso que TERMINA ROTO (404 de
      // chunks muertos, red cortada) deja de contar como pendiente (arriba)
      // pero JAMÁS refresca la hora de vida del chorro: si el aparato pide
      // chunks muertos de un HTML viejo, el chorro muere honesto a los 15s
      // y el bote puede reanimar — sin esta cura, cada 404 «alimentaba» al
      // paciente y el socorro esperaba eterno frente a un cadáver.
      if(e.type==='error'){ tg.setAttribute('data-vgmal','1'); return; }
      vgCargas++; vgUltCarga=Date.now();
      // v189.0: __vgcasa por fin NACE — v185 la leía pero NADIE la seteaba
      // (el socorro decía «la casa no llega» CON la descarga ya completa).
      // Cuando el último _next termina, la casa anuncia que llegó entera.
      if(vgPendientes()===0){ try{ window.__vgcasa=true; }catch(eV3){} }
    }catch(e2){}
  }
  window.addEventListener('load',vgCargaTerminada,true);
  // v188.1 QA: window capture NO ve los load de recursos (data-vghecho=0
  // cazado en navegador real) — el truco documentado es DOCUMENT capture.
  document.addEventListener('load',vgCargaTerminada,true);
  document.addEventListener('error',vgCargaTerminada,true);
  function vgPendientes(){
    try{
      var n=0,i,els=document.getElementsByTagName('script'),ls=document.getElementsByTagName('link');
      for(i=0;i<els.length;i++){ var u1=String(els[i].src||''); if(u1.indexOf('/_next/')>-1&&!els[i].getAttribute('data-vghecho')) n++; }
      for(i=0;i<ls.length;i++){ var u2=String(ls[i].href||''); if(u2.indexOf('/_next/')>-1&&!ls[i].getAttribute('data-vghecho')) n++; }
      return n;
    }catch(e){ return -1; }
  }
  function vgChorroVivo(){
    try{
      // segunda señal de vida, a prueba de eventos: si los KB completados
      // CRECEN desde el último chequeo, el chorro está vivo sin discusión
      var kb=kbCasa();
      if(kb>=0){
        if(vgUltKB<0) vgUltKB=kb;
        else if(kb>vgUltKB){ vgUltKB=kb; vgUltCarga=Date.now(); }
      }
    }catch(eX){}
    try{
      if(vgCargas===0) return vgPendientes()!==0&&(Date.now()-vgT0)<75000;
      return (Date.now()-vgUltCarga)<15000;
    }catch(e){ return true; }
  }
  var vgUltKB=-1;
  // v188.0: los KB REALES en UNA sola fuente — la cortina (v185) y el
  // socorro paciente dicen lo mismo (performance API, indexOf, jamás regex).
  function kbCasa(){
    try{
      if(!window.performance||!performance.getEntriesByType) return -1;
      var rs=performance.getEntriesByType('resource')||[];
      var kb=0;
      for(var i=0;i<rs.length;i++){
        var it=rs[i];
        var nm=String((it&&it.name)||'');
        if(it&&(nm.indexOf('/_next/')>-1||nm.slice(-3)==='.js'||nm.slice(-4)==='.css')){
          var tr=(typeof it.transferSize==='number')?it.transferSize:(it.encodedBodySize||0);
          if(tr>0) kb+=tr;
        }
      }
      return Math.round(kb/1024);
    }catch(e){ return -1; }
  }
  // v188.0 LA NOTA DE BATERÍA — la captura del Dueño venía con 4%: el ahorro
  // de energía de Android frena el CPU y la señal. Si el aparato está bajo
  // y sin cargador, se lo decimos a la cara (en la cortina y en el socorro).
  function notaBateria(el){
    try{
      if(!navigator.getBattery||!el) return;
      navigator.getBattery().then(function(b){
        try{
          if(b&&b.level<0.15&&!b.charging){
            var d=document.createElement('div');
            d.style.cssText='font:400 11px/1.6 system-ui,sans-serif;color:rgba(255,152,92,.9);max-width:340px;text-align:center';
            d.textContent=esI?('Tu aparato está con '+Math.round(b.level*100)+'% de batería y sin cargador: el ahorro de energía frena la descarga. Conéctalo y Vanguard abrirá rápido.'):'Low battery with no charger: power saving slows the download. Plug in and Vanguard opens fast.';
            el.appendChild(d);
          }
        }catch(eB2){}
      }).catch(function(){});
    }catch(eB){}
  }
  var batDicha=false;
  // v182.0 EL ÚLTIMO RESCATE — el meta http-equiv=refresh nace AQUÍ, en JS
  // vanilla sobre document.head (NUNCA en el JSX: React 19 eleva los <meta>
  // al head en la hidratación y quedaba armado tras un arranque sano =
  // recarga fantasma cada 70s; QA lo cazó). Si la cortina sigue viva a los
  // 70s (pasado el tope pesado de 60s), el NAVEGADOR recarga solo: HTML
  // puro, sin timers, sin hilo, sin React. Guardia anti-bucle: si hace <90s
  // ya hubo un rescate, el meta nace a 300s (un reintento lento cada 5 min).
  // apagar() lo desarma al instante en un arranque sano.
  // v184.0 CORTINA DE PIEDRA — BUG CAZADO EN LA GUERRA: la guardia anti-bucle
  // SOLO registraba las recargas del BOTÓN (recargar()), pero el meta que
  // recarga SOLO no dejaba rastro → una carga atascada se reanimaba cada 70s
  // ETERNA (el Dueño: «al principio sí carga, después entra una segunda
  // pantalla y no termina nunca»). Cura: CADA arranque estampa su hora en
  // sessionStorage — si esta carga nació <90s tras la anterior, ALGUIEN está
  // reanimando en bucle (meta o error) → el meta nace a 300s. Máximo un
  // ciclo extra a 70s; después, un reintento lento cada 5 min. Jamás bucle.
  //
  // v189.0 LA LEY SAGRADA: el meta nace SIEMPRE a 300s. Los 70s podían
  // reventar la PRIMERA descarga del propio HTML aún en vuelo (señal lenta
  // = el documento mismo tarda >70s: el meta lo mataba y el bucle giraba).
  // A 300s solo dispara si JavaScript JAMÁS ejecutó (cortina eterna de
  // verdad, hilo muerto): en todo arranque con JS vivo, apagar() lo
  // desarma en ≤20s/≤60s.
  try{
    try{ sessionStorage.setItem(K,String(Date.now())); }catch(e){}
    var mt=document.createElement('meta');
    mt.id='vg-rescate-meta'; mt.httpEquiv='refresh';
    mt.content='300';
    if(document.head) document.head.appendChild(mt);
  }catch(e){}
  // v173.0 LA CASA EN VIVO: el modo 3D se retiró — la portada es la consola
  // plana viva y ya no exige señal del universo; solo /vanguard2 sigue pesado
  var pesado=(location.pathname.indexOf('/vanguard2')===0);
  // v169.0 LA CONSOLA PLANA: si el piloto eligió 2D, la cortina NO espera
  // al universo WebGL (no monta) — se funde con la página lista
  var modo2d=false;
  try{ modo2d=(localStorage.getItem('vanguard-modo')==='2d'); }catch(e){}
  if(modo2d) pesado=false;
  function apagar(){
    if(c.getAttribute('data-off')==='1') return;
    c.setAttribute('data-off','1'); c.className='vg-off';
    // v182.0: la casa despertó — el meta de rescate muere YA (la retirada
    // del div ya lo llevaría, pero esto lo desarma al instante)
    try{ var mt=document.getElementById('vg-rescate-meta'); if(mt&&mt.parentNode) mt.parentNode.removeChild(mt); }catch(e){}
    c.style.opacity='0';
    setTimeout(function(){ if(c&&c.parentNode) c.parentNode.removeChild(c); },800);
    // v181.0: la casa queda sola ante el peligro — el vigía confirma que
    // respira (20s en rutas ligeras; 68s en el universo pesado, tras su
    // tope de 60s: si despierta a los 50s la barra se retira sola)
    setTimeout(vigia,pesado?68000:20000);
    // v155.1: si la pestaña durmió durante el fundido (móvil bloqueado,
    // throttling de timers), la retiramos al despertar — nunca queda un
    // nodo muerto flotando en el DOM
    document.addEventListener('visibilitychange',function(){
      if(document.visibilityState==='visible'&&c&&c.parentNode&&c.getAttribute('data-off')==='1'){
        setTimeout(function(){ if(c&&c.parentNode) c.parentNode.removeChild(c); },150);
      }
    });
  }
  function encender(msg){
    if(c.getAttribute('data-off')==='1') return;
    if(st&&msg) st.textContent=msg;
    if(btn) btn.setAttribute('data-on','1');
    // v188.0: la nota de batería entra con el primer rescate de la cortina
    if(!batDicha){ batDicha=true; notaBateria(c); }
  }
  function recargar(){
    try{ sessionStorage.setItem(K,String(Date.now())); }catch(e){}
    try{ var mt=document.getElementById('vg-rescate-meta'); if(mt&&mt.parentNode) mt.parentNode.removeChild(mt); }catch(e){}
    location.reload();
  }
  // v181.0 EL RESCATE TOTAL — ⑤ EL VIGÍA POST-CORTINA: v178 levanta la
  // cortina en cuanto el DOM existe; si el bundle murió DESPUÉS (parse error,
  // chunk muerto en un aparato que QA no cubre), el piloto queda en una casa
  // muda. Este vigía vive FUERA de React: si __vgvivo no llega, levanta una
  // barra honesta con RECARGAR — y se retira sola si la casa respira tarde.
  function vigia(){
    try{
      if(window.__vgvivo===true) return;
      var b=document.createElement('div');
      b.id='vg-vigia';
      b.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:rgba(7,6,6,.94);border-top:1px solid rgba(232,196,118,.4);color:#e8c476;font:600 11px/1.5 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:10px 14px;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap';
      var sp=document.createElement('span');
      sp.textContent=esI?'Vanguard no terminó de despertar en este navegador':'Vanguard did not finish waking on this browser';
      // v186.0: la placa de versión viaja en el vigía también
      var sv=document.createElement('span');
      sv.style.cssText='opacity:.55;font-size:9px;letter-spacing:.18em';
      sv.textContent=VER;
      var bt=document.createElement('button');
      bt.textContent=esI?'RECARGAR':'RELOAD';
      bt.style.cssText='border:1px solid #e8c476;color:#e8c476;background:rgba(232,196,118,.08);padding:6px 14px;letter-spacing:.2em;font:inherit;border-radius:2px';
      bt.addEventListener('click',recargar);
      b.appendChild(sp); b.appendChild(sv); b.appendChild(bt); document.body.appendChild(b);
      // v187.0: la barra del vigía también marca la sesión como sufrida
      try{ sessionStorage.setItem('vg187-sufrio',String(Date.now())); }catch(eV){}
      var ch=window.setInterval(function(){
        if(window.__vgvivo===true&&b.parentNode){ b.parentNode.removeChild(b); window.clearInterval(ch); }
      },1000);
      window.setTimeout(function(){ window.clearInterval(ch); },120000);
    }catch(e){}
  }
  // v185.0 EL SOCORRISTA — EL RESCATE DE LA SEGUNDA PANTALLA (la Casa).
  // La cortina ya muere sola (20s/60s v178 + piedra v184), pero DETRÁS está
  // la casa prerenderizada llena de «Cargando módulo...» — y si el bundle
  // nunca baja (señal móvil estancada) o la hidratación muere en silencio,
  // el Dueño se queda mirando ESO eternamente: la barra vigía v181 es
  // pequeña y nadie la ve. El socorrista vive FUERA de React, distingue las
  // dos muertes con la señal temprana __vgcasa (el bundle llegó y parseó)
  // y levanta UN SOCORRO A PANTALLA COMPLETA, imposible de no ver. Nada de
  // bucles: UNA sola reanimación automática con guardia sessionStorage de
  // 3 min; después el mando es del Dueño (botón ENTRAR DE NUEVO).
  var KS='vg185-socorro';
  function quitarVigia(){
    try{ var v=document.getElementById('vg-vigia'); if(v&&v.parentNode) v.parentNode.removeChild(v); }catch(e){}
  }
  function socorrer(modo){ // modo 1: el bundle no llega · modo 2: hidratación atascada
    try{
      if(window.__vgvivo===true) return;
      quitarVigia();
      if(document.getElementById('vg-socorro')) return;
      var s=document.createElement('div');
      s.id='vg-socorro';
      s.style.cssText='position:fixed;inset:0;z-index:2147482999;background:rgba(5,4,4,.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;color:#e8c476;font-family:system-ui,sans-serif;text-align:center;padding:26px';
      var t=document.createElement('div');
      t.style.cssText='font:700 15px/1.5 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase';
      t.textContent=esI?(modo===1?'La casa no llega a tu aparato':'La casa despertó a medias'):(modo===1?'The house never reached your device':'The house woke up halfway');
      var p=document.createElement('div');
      p.style.cssText='font:400 12px/1.6 system-ui,sans-serif;color:rgba(232,196,118,.78);max-width:340px';
      p.textContent=esI?(modo===1?'La descarga va lenta con esta señal. Vanguard espera paciente y solo se reanima si se estanca de verdad; también puedes tocar ENTRAR DE NUEVO.':'La descarga llegó pero la casa sigue despertando. Si en un minuto no hay casa viva, toca ENTRAR DE NUEVO.'):(modo===1?'The download is slow on this signal. Vanguard waits patiently and only relaunches if it truly stalls; you can also tap ENTER AGAIN.':'The download arrived but the house is still waking. If nothing changes in a minute, tap ENTER AGAIN.');
      var bt=document.createElement('button');
      bt.textContent=esI?'ENTRAR DE NUEVO':'ENTER AGAIN';
      bt.style.cssText='border:1px solid #e8c476;color:#e8c476;background:rgba(232,196,118,.08);padding:14px 26px;letter-spacing:.24em;font:700 12px system-ui,sans-serif;border-radius:2px;text-transform:uppercase;margin-top:6px';
      bt.addEventListener('click',recargar);
      var vr=document.createElement('div');
      vr.style.cssText='font:500 9px system-ui,sans-serif;letter-spacing:.28em;color:rgba(232,196,118,.45);text-transform:uppercase;margin-top:4px';
      vr.textContent='VANGUARD '+VER;
      s.appendChild(t); s.appendChild(p); s.appendChild(bt); s.appendChild(vr);
      document.body.appendChild(s);
      // v187.0: la sesión queda marcada como SUFRIDA (el cine de entrada se
      // calla hoy — nadie que esperó un rescate quiere una pantalla más que
      // se pueda confundir con carga) y el testigo muestra la herida
      // capturada como CÓDIGO legible en la propia placa de socorro.
      try{ sessionStorage.setItem('vg187-sufrio',String(Date.now())); }catch(eS){}
      try{
        var er=sessionStorage.getItem('vg187-err');
        if(er){
          var ec=document.createElement('div');
          ec.style.cssText='font:500 9px/1.6 ui-monospace,monospace;letter-spacing:.04em;color:rgba(232,196,118,.55);max-width:340px;word-break:break-all;margin-top:2px';
          ec.textContent='CÓDIGO: '+er;
          s.appendChild(ec);
        }
      }catch(eE){}
      notaBateria(s);
      // la casa despertó tarde → el socorro se retira solo (jamás tapa una casa viva)
      var aviso2=false;
      var q=window.setInterval(function(){
        try{
          if(window.__vgcasa===true&&!aviso2){ aviso2=true; p.textContent=esI?'La descarga llegó entera — la casa está despertando. Unos segundos más…':'The download arrived — the house is waking. A few more seconds…'; }
        }catch(eQ2){}
        if(window.__vgvivo===true&&s.parentNode){ s.parentNode.removeChild(s); window.clearInterval(q); }
      },1000);
      window.setTimeout(function(){ window.clearInterval(q); },180000);
      // v189.0 LA LEY SAGRADA — el BOTE v186 y su reanimación automática
      // MURIERON. El relato del Dueño lo sentenció («30 segundos exactos y
      // recarga de nuevo: injugable»): toda recarga tira la descarga, y en
      // una señal lenta el reintento vuelve a necesitar más tiempo del que
      // el sistema le da — bucle eterno. El socorro modo 1 ahora es un
      // MONITOR HONESTO que JAMÁS recarga: dice los KB reales cada 5s
      // («el chorro sigue vivo» / «señal lenta — la descarga NO se suelta:
      // sigue») y espera. Una descarga que nadie tira SIEMPRE termina; el
      // reintento es del Dueño (botón ENTRAR DE NUEVO).
      if(modo===1){
        // v189.0 EL BOTÓN DE LA SALIDA LIMPIA (ley hermana «ADIÓS AL CINE»)
        // — ya no hay bote que se agote: este botón vive SIEMPRE en el
        // socorro. Si el aparato guarda un DOCUMENTO VIEJO que pide chunks
        // MUERTOS (404 de un despliegue anterior), reintentar igual es bajar
        // los mismos 404 para siempre: la cura real es pedir la casa CON
        // OTRO NOMBRE (?vg189=hora — el navegador baja HTML fresco con
        // chunks vivos) y limpiar las caches API por si algún SW/Cache
        // guardó restos. Es MANUAL: la ley jamás recarga sola.
        try{
          var bt2=document.createElement('button');
          bt2.textContent=esI?'ACTUALIZAR AHORA':'UPDATE NOW';
          bt2.style.cssText='border:1px solid #e8c476;color:#070606;background:#e8c476;padding:13px 24px;letter-spacing:.2em;font:700 11px system-ui,sans-serif;border-radius:2px;text-transform:uppercase;margin-top:2px';
          bt2.addEventListener('click',function(){
            try{
              if(window.caches&&caches.keys){ caches.keys().then(function(ks){ ks.forEach(function(k){ try{ caches.delete(k); }catch(eC2){} }); }).catch(function(){}); }
            }catch(eC){}
            try{ sessionStorage.setItem('vg187-sufrio',String(Date.now())); }catch(eC3){}
            try{ location.replace('/?vg189='+Date.now()); }catch(eC4){ location.replace('/'); }
          });
          s.appendChild(bt2);
        }catch(eC1){}
        // v190.0 LA LEY SAGRADA — monitor honesto que JAMÁS recarga: dice
        // los KB reales cada 5s y espera. Una descarga que nadie tira
        // SIEMPRE termina; el reintento es del Dueño (ENTRAR DE NUEVO /
        // ACTUALIZAR AHORA).
        var pk=document.createElement('div');
        pk.style.cssText='font:500 10px/1.6 system-ui,sans-serif;letter-spacing:.14em;color:rgba(232,196,118,.62);text-transform:uppercase';
        s.appendChild(pk);
        var pintaChorro=function(vivo){
          try{
            var kb2=kbCasa();
            pk.textContent=(kb2>=0?('Descarga: '+kb2+' KB llegados'):'Descarga en curso')+(vivo?' · el chorro sigue vivo':' · señal lenta — la descarga NO se suelta: sigue');
          }catch(eP1){}
        };
        pintaChorro(vgChorroVivo());
        var paciente=window.setInterval(function(){
          try{
            if(window.__vgvivo===true||!document.getElementById('vg-socorro')){ window.clearInterval(paciente); return; }
            pintaChorro(vgChorroVivo());
          }catch(eP2){}
        },5000);
      }
    }catch(e){}
  }
  // en pesado los topes son más largos: el bundle del universo pesa y su
  // cortina ya aguanta 60s (v178) — socorrista a 100s/150s, nunca antes.
  // v189.0: el CARRIL RÁPIDO de 30s v186 MURIÓ con la ley — era el gatillo
  // exacto del bucle («30 segundos exactos y recarga de nuevo»). El socorro
  // ya no recarga NADA: es un monitor con botón manual; su timing sobra.
  var tSoc1=pesado?100000:50000;
  var tSoc2=pesado?150000:90000;
  window.setTimeout(function(){ if(window.__vgcasa!==true&&window.__vgvivo!==true) socorrer(1); },tSoc1);
  window.setTimeout(function(){ if(window.__vgcasa===true&&window.__vgvivo!==true) socorrer(2); },tSoc2);
  window.addEventListener('error',function(e){
    if(window.__vgvivo===true||c.getAttribute('data-off')==='1') return;
    var esRecurso=e&&e.target&&e.target.tagName&&(e.target.tagName==='SCRIPT'||e.target.tagName==='LINK');
    var m=esRecurso?String((e.target.src||e.target.href||'')):String((e&&e.message)||'')+' '+String((e&&e.filename)||'');
    // v189.0 LA LEY SAGRADA: un módulo caído JAMÁS recarga solo — tirar la
    // descarga en una señal lenta era el otro motor del bucle (v184 pedía
    // >60s de vida, pero con señal muy lenta el umbral se cruzaba igual y
    // la descarga moría a mitad). La casa hidrata con lo que llegó; el
    // fallo se dice a la cara y el reintento es del Dueño.
    if(esRecurso||/chunk|import|module|Failed to fetch|NetworkError|Load failed/i.test(m)){
      encender('Un módulo falló — la descarga sigue; toca para reintentar');
      return;
    }
    encender('Fallo de carga — toca para recargar');
  },true);
  // v184.0 LA RESURRECCIÓN — la cura del fotograma congelado del Dueño: el
  // aparato congeló/mató la pestaña A MITAD DE CARGA (cortina viva) y al
  // volver el último fotograma pintado era la cortina, eterna. En el instante
  // en que la pestaña VUELVE a primer plano (visibilitychange→visible), si la
  // cortina sigue viva la matamos YA: la casa prerenderizada está detrás y es
  // mejor cara viva que cortina muerta. Si el renderer murió del todo, Chrome
  // recarga la página al tocar — y el nuevo arranque ya nace con la guardia
  // v184 anti-bucle. Cubre también el caso timers famélicos: tras horas
  // congelado, el ojo expirado dispara apagar() igual — doble red.
  document.addEventListener('visibilitychange',function(){
    try{
      if(document.visibilityState!=='visible') return;
      if(window.__vgvivo===true) return;
      if(c.getAttribute('data-off')==='1') return;
      apagar();
    }catch(e){}
  });
  window.addEventListener('unhandledrejection',function(){
    if(window.__vgvivo!==true&&c.getAttribute('data-off')!=='1') encender('Fallo de carga — toca para recargar');
  });
  if(btn) btn.addEventListener('click',recargar);
  var n=0;
  var ojo=window.setInterval(function(){
    n++;
    // v185.0 EL PROGRESO VERDADERO: mientras la cortina vive y el rescate
    // no ha encendido, el estado deja de mentir con un texto fijo y dice
    // los KB REALES de scripts/css llegados (performance API, same-origin:
    // transferSize honesto). En una señal lenta el Dueño VE la descarga
    // avanzar en vez de mirar «Desplegando el universo» congelado.
    if(n%8===0&&st&&(!btn||btn.getAttribute('data-on')!=='1')){
      try{
        // v188.0: una sola fuente de KB (kbCasa) — la cortina y el socorro
        // paciente dicen la misma verdad. indexOf, jamás regex en este
        // template literal (lección v185.1: las barras se consumen).
        var kb=kbCasa();
        if(kb>0) st.textContent=esI?('Descargando la casa · '+kb+' KB'):('Downloading the house · '+kb+' KB');
      }catch(e){}
    }
    // v178.0: la casa plana vive en cuanto el DOM existe — el HTML
    // prerenderizado YA ES la casa entera; esperar al evento load era
    // dejar la cortina rehén del recurso más lento de la red del móvil
    var domListo=(document.readyState!=='loading');
    if(window.__vgvivo===true||modo2d||(!pesado&&domListo)){ clearInterval(ojo); apagar(); return; }
    if(!pesado){
      // v178.0: rescate universal también fuera del universo pesado —
      // botón a los 10s y tope duro a los 20s (jamás una cortina eterna)
      if(n===40) encender('Tarda más de lo normal — toca para despertarlo');
      if(n>=80){ clearInterval(ojo); apagar(); return; }
    }else{
      if(n===48) encender('Tarda más de lo normal — toca para despertarlo');
      // v178.0: el ojo ya NO muere a los 20s — si el universo despierta
      // tarde, la cortina se funde igual; el botón queda a la vista; tope 60s
      if(n===80) encender('El universo no responde — toca para despertarlo');
      if(n>=240){ clearInterval(ojo); apagar(); return; }
    }
  },250);
}catch(e){}
})();` }} />
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
