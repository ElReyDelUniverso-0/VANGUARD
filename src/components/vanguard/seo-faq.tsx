"use client";

// v34 — FAQ visible del sitio: doble propósito.
// 1) SEO: contenido real e indexable (Google premia páginas que responden
//    preguntas). Va alineado con el JSON-LD FAQPage del layout.
// 2) Conversión: el visitante nuevo entiende qué es VANGUARD en 20 segundos.

import { Radar, HelpCircle } from "lucide-react";

const FAQ = [
  {
    q: "¿Qué es VANGUARD?",
    a: "VANGUARD es la plataforma de conflictos mundiales en tiempo real: reúne noticias de guerras en vivo, un mapa OSINT 3D con capas de inteligencia, tensión global por país y un juego de guerra global multijugador. Todo en un solo lugar, en español y gratis.",
  },
  {
    q: "¿Cuánto cuesta? ¿Hay que pagar algo?",
    a: "Nada. VANGUARD es 100% gratis: no pide tarjeta, no tiene suscripción y funciona directamente en el navegador del celular o la computadora. Puedes apoyar el proyecto invitando a tus amigos con tu código de agente.",
  },
  {
    q: "¿Qué puedo hacer dentro de la plataforma?",
    a: "Ver el mundo en vivo: mapa de conflictos, radar global, cámaras, terremotos y noticias verificadas por la comunidad. Además puedes jugar: guerra global por rondas, duelos 1v1 con ranking ELO, simulador de guerras, trivia de banderas, bolsa geopolítica y misiones diarias con recompensas.",
  },
  {
    q: "¿La información es real?",
    a: "La capa de inteligencia (noticias, mapas, cámaras, sismos) usa fuentes abiertas reales que la comunidad verifica y califica. El juego de guerra global es una simulación estratégica inspirada en la geopolítica actual.",
  },
  {
    q: "¿Necesito instalar una app?",
    a: "No es obligatorio: entra y juega directo desde el navegador. Si quieres, puedes instalarla como app (botón «Instalar app gratis») para abrirla en un toque desde tu pantalla de inicio.",
  },
  {
    q: "¿En qué idiomas está disponible?",
    a: "VANGUARD está en 8 idiomas: español, inglés, portugués, francés, alemán, italiano, ruso y chino. Cambia el idioma desde el menú en un toque.",
  },
];

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
