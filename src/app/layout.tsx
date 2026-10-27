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
          <button id="vg-cortina-btn" type="button">El universo no responde · Toca para despertarlo</button>
          <noscript><span className="vg-nojs">VANGUARD necesita JavaScript activado para desplegar el universo 3D.</span></noscript>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `(function(){
try{
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
  try{
    var ultR=Number(sessionStorage.getItem(K)||0);
    try{ sessionStorage.setItem(K,String(Date.now())); }catch(e){}
    var mt=document.createElement('meta');
    mt.id='vg-rescate-meta'; mt.httpEquiv='refresh';
    mt.content=(ultR&&(Date.now()-ultR)<90000)?'300':'70';
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
      b.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:rgba(7,6,6,.94);border-top:1px solid rgba(232,196,118,.4);color:#e8c476;font:600 11px/1.5 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:10px 14px;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap';
      var sp=document.createElement('span');
      sp.textContent=esI?'Vanguard no terminó de despertar en este navegador':'Vanguard did not finish waking on this browser';
      var bt=document.createElement('button');
      bt.textContent=esI?'RECARGAR':'RELOAD';
      bt.style.cssText='border:1px solid #e8c476;color:#e8c476;background:rgba(232,196,118,.08);padding:6px 14px;letter-spacing:.2em;font:inherit;border-radius:2px';
      bt.addEventListener('click',recargar);
      b.appendChild(sp); b.appendChild(bt); document.body.appendChild(b);
      var ch=window.setInterval(function(){
        if(window.__vgvivo===true&&b.parentNode){ b.parentNode.removeChild(b); window.clearInterval(ch); }
      },1000);
      window.setTimeout(function(){ window.clearInterval(ch); },120000);
    }catch(e){}
  }
  window.addEventListener('error',function(e){
    if(window.__vgvivo===true||c.getAttribute('data-off')==='1') return;
    var esRecurso=e&&e.target&&e.target.tagName&&(e.target.tagName==='SCRIPT'||e.target.tagName==='LINK');
    var m=esRecurso?String((e.target.src||e.target.href||'')):String((e&&e.message)||'')+' '+String((e&&e.filename)||'');
    if(esRecurso||/chunk|import|module|Failed to fetch|NetworkError|Load failed/i.test(m)){
      var ult=0; try{ ult=Number(sessionStorage.getItem(K)||0); }catch(_){}
      // v184.0: K ahora se estampa en CADA arranque — este umbral compara
      // contra el ARRANQUE de esta página (una recarga de error exige que
      // esta carga lleve viva >60s: adiós a los bucles de reanimación)
      if(Date.now()-ult>60000){ recargar(); return; }
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
