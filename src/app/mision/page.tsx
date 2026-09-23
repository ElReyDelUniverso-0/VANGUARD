import type { Metadata } from "next";
import { Mission100 } from "@/components/vanguard/mission-100";
import { NewsStrip } from "@/components/vanguard/news-strip";
import { PlayerPing } from "@/components/vanguard/player-ping";

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
      <div className="mx-auto max-w-3xl px-3 sm:px-4 py-8 md:py-10">
        {/* v39.1: el visitante cuenta como jugador sin esperar al socket */}
        <PlayerPing />
        {/* v39: strip de noticias en vivo — toda página de mando muestra el frente */}
        <NewsStrip />
        <Mission100 standalone />
      </div>
    </main>
  );
}
