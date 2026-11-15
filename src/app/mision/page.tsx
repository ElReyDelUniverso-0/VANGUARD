import type { Metadata } from "next";
import { Mission100 } from "@/components/vanguard/mission-100";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { PlayerPing } from "@/components/vanguard/player-ping";
import { PresencePing, LiveTitle } from "@/components/vanguard/presence-ping";

// v37 MISIÓN 100 — centro de mando directo para la campaña de enlaces.
// El comandante la abre en el móvil: https://vanguard-kq9r.vercel.app/mision
// Página utilitaria: no se indexa (el SEO vive en / y /guerra-hoy).

export const metadata: Metadata = {
  title: "MISIÓN 100 ENLACES — Centro de mando de reclutamiento | VANGUARD",
  description:
    "Arsenal de 100 enlaces rastreados para repartir VANGUARD por WhatsApp, Facebook, X, Telegram, Discord, Reddit y más. Contador global en vivo y ranking de enlaces.",
  robots: { index: false, follow: false },
};

export default function MisionPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* v402.0 — portada de sala del módulo Juego (la tira de noticias ya la da el teletipo) */}
      <PortadaSala
        imagen="/ilustraciones/recluta.jpg"
        alt="Oficina de reclutamiento en penumbra con un cartel de llamada a filas"
        volanta="Juego · Misión 100"
        titulo="Misión 100"
        sumario="Repartir cien enlaces y reclutar cien jugadores. Cada mensaje listo para copiar, por canal, con su enlace rastreado."
        anclas={[
          { etiqueta: "El Cuartel", href: "/cuartel" },
          { etiqueta: "Tu perfil", href: "/perfil" },
        ]}
        acento="#e8c56a"
      />
      <div className="mx-auto max-w-3xl px-3 sm:px-4 py-8 md:py-10">
        {/* v39.1: el visitante cuenta como jugador sin esperar al socket */}
        <PlayerPing />
        {/* v42: latido de presencia EN VIVO + auto-idioma */}
        <PresencePing />
        {/* v42.3: título de pestaña EN VIVO */}
        <LiveTitle />
        <Mission100 standalone />
      </div>
    </main>
  );
}
