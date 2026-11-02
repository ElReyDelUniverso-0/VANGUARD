import type { Metadata } from "next";
import Link from "next/link";
import { teatrosDelParte, componerParte } from "@/lib/emisor-guerra";
import { EmisoraCliente } from "./emisora-cliente";
import { GrabadorAudio } from "./grabador";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Emisora de Guerra — audios y el parte hablado de Vanguard",
  description:
    "El Comandante narra el parte completo de la guerra con datos reales: teatros, cables y contextos. Elige la voz, escucha el frente y manda tu propio audio a Vanguard.",
  alternates: { canonical: "/audios" },
  openGraph: {
    title: "Emisora de Guerra de Vanguard",
    description: "La guerra explicada en voz alta. Elige la voz, escucha el parte y manda el tuyo.",
    type: "website",
  },
};

export default async function AudiosPage() {
  const [teatros, totalAudios] = await Promise.all([
    teatrosDelParte().catch(() => []),
    db.audioComandante.count().catch(() => 0),
  ]);
  const total24h = teatros.reduce((a, t) => a + t.cables, 0);
  const texto = componerParte(teatros, total24h).join(" ");

  return (
    <main className="min-h-screen bg-[#040407] text-[#f5f3ee] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] tracking-[0.35em] text-[#ff2a3c] font-bold">◉ EMISORA DE GUERRA · EN VIVO</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-wide">
          LA GUERRA, <span className="text-[#ff2a3c]">EN VOZ ALTA</span>
        </h1>
        <p className="mt-3 text-sm text-[#b9b4aa] leading-relaxed">
          Aquí Vanguard habla de verdad: el Comandante narra el parte completo con los cables reales de las últimas 24
          horas y te explica qué es cada frente y por qué importa. Tú eliges la voz. Y tú también puedes hablar: graba
          un audio y mándalo a Vanguard — aparecerá en el muro de la casa.
        </p>

        <EmisoraCliente textoParte={texto} teatros={teatros} />

        <section className="mt-10 rounded-xl border border-[#ff2a3c]/25 bg-[#0a0a10] p-5">
          <h2 className="text-lg font-bold tracking-wide">🔊 TU AUDIO EN VANGUARD</h2>
          <p className="mt-1 text-sm text-[#b9b4aa]">
            Toca <b className="text-[#f5f3ee]">GRABAR</b> (tu navegador pedirá permiso de micrófono), dilo — hasta 90
            segundos — y envía. Vanguard lo guarda de verdad y lo expone en el muro.
          </p>
          <GrabadorAudio />
        </section>

        <section className="mt-8 rounded-xl border border-[#ffd34d]/25 bg-[#0a0a10] p-5">
          <h2 className="text-lg font-bold tracking-wide text-[#ffd34d]">🎖 TU CUENTA DE VERDAD</h2>
          <p className="mt-1 text-sm text-[#b9b4aa]">
            Con tu cuenta real de Vanguard ({totalAudios} audios ya guardados en la nube de la casa) tu nombre firma lo
            que mandas, tu modo de entrada viaja contigo y tu progreso de los 100 objetivos queda blindado en la nube.
            Se crea desde la app: abre Vanguard, toca <b className="text-[#f5f3ee]">CREAR CUENTA (+300 mon)</b> en la
            barra — nombre + clave, y a vivir.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-lg border border-[#ffd34d]/50 bg-[#ffd34d]/10 px-4 py-2 text-sm font-bold text-[#ffd34d] hover:bg-[#ffd34d]/20"
            >
              Abrir Vanguard y crear mi cuenta →
            </Link>
          </div>
        </section>

        <p className="mt-8 text-[11px] text-[#6b665e]">
          Vanguard narra solo lo que sus cables sostienen. Sin invención, sin rumor: fuente, mapa y voz.
        </p>
      </div>
    </main>
  );
}

