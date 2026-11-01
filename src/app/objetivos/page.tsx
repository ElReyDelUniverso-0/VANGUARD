import type { Metadata } from "next";
import Link from "next/link";
import { ACHIEVEMENTS } from "@/lib/game-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { VitrinaProgreso } from "@/components/vanguard/vitrina-progreso";

// v216.0 LOS 100 — LA VITRINA DE OBJETIVOS. Mandato del Dueño: «una lista de
// los 100 objetivos de Vanguard, fuertes, abusivos, super llamativos, con
// morbo, adictivos». El catálogo vive en game-data.ts (ACHIEVEMENTS — progreso
// REAL del store, no carteles); esta página es su vitrina pública y
// indexable: 100 tarjetas agrupadas por bloque, recompensas a la vista y el
// rey de la casa al final: EL 1% (solo cae con los otros 99).

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "Los 100 Objetivos de Vanguard — ¿llegarás al 1%?",
  description:
    "100 objetivos con recompensas reales: monedas, gemas y XP. El sediento, Mano de Dios, El ojo que nunca parpadea... y EL 1%: el objetivo que solo el 1% alcanzará. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/objetivos` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/objetivos`,
    title: "Los 100 Objetivos de Vanguard — ¿llegarás al 1%?",
    description:
      "El sediento. Mano de Dios. El ojo que nunca parpadea. Y EL 1%: el objetivo que casi nadie alcanzará. Recompensas reales, gratis, en español.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "Los 100 Objetivos de Vanguard" }],
  },
  twitter: { card: "summary_large_image", title: "Los 100 Objetivos de Vanguard", description: "El sediento. Mano de Dios. EL 1%. ¿Cuántos puedes conquistar?" },
};

const BLOQUES: { key: string; titulo: string; grito: string }[] = [
  { key: "PROGRESO", titulo: "El ascenso", grito: "El planeta ya sabe tu nombre" },
  { key: "INTEL", titulo: "El sediento", grito: "La guerra corre por tus venas" },
  { key: "COMBATE", titulo: "Sin parpadear", grito: "El pulso más duro del planeta" },
  { key: "GUERRA", titulo: "La conquista", grito: "La historia se escribe con tu firma" },
  { key: "MERCADO", titulo: "El dinero", grito: "Las velas se mueven cuando respiras" },
  { key: "GANANCIAS", titulo: "El vicio", grito: "La fortuna es tu colega" },
  { key: "VIGILANCIA", titulo: "Los ojos", grito: "Nada escapa. Nada." },
  { key: "SOCIAL", titulo: "La voz", grito: "La comunidad debate lo que tú decides" },
  { key: "ESPECIAL", titulo: "La leyenda", grito: "Pocos podrán verte a los ojos" },
];

const RARITY: Record<string, string> = {
  COMUN: "text-zinc-400 border-zinc-600 bg-zinc-800/60",
  RARO: "text-cyan-hud border-cyan-hud bg-cyan-hud/10",
  EPICO: "text-violet-hud border-violet-hud bg-violet-hud/10",
  LEGENDARIO: "text-amber border-amber-hud bg-amber-hud/10",
};

export default function ObjetivosPage() {
  const rey = ACHIEVEMENTS.find((a) => a.id === "ACH-LOGROS-100");
  const resto = ACHIEVEMENTS.filter((a) => a.id !== "ACH-LOGROS-100");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Los 100 Objetivos de Vanguard",
    description:
      "100 objetivos con recompensas reales: monedas, gemas y XP. El 1% es el objetivo supremo: solo se desbloquea con los otros 99.",
    numberOfItems: ACHIEVEMENTS.length,
    itemListElement: ACHIEVEMENTS.slice(0, 20).map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.title,
      url: `${SITE_URL}/objetivos#obj-${a.id}`,
    })),
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />

      <div className="border-b border-zinc-800 bg-zinc-900/60">
        <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
          >
            ◉ VANGUARD
          </Link>
          <Link
            href="/guerra-hoy"
            className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-300"
          >
            Primera página
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* HERO */}
        <header className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-300">
            La vitrina que casi nadie termina
          </div>
          <h1 className="mt-3 font-orbitron text-3xl sm:text-5xl font-black tracking-wide text-zinc-100">
            LOS <span className="text-amber">100</span> OBJETIVOS
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            100 objetivos. Recompensas reales: monedas, gemas y XP que viven en tu
            cuenta. No hay suerte aquí: cada objetivo se arranca con esfuerzo, y
            hay uno —{" "}
            <strong className="text-amber">EL 1%</strong> — que solo se desbloquea
            cuando los otros 99 ya son tuyos. La pregunta es simple:{" "}
            <strong className="text-zinc-200">¿de qué lado quedarás?</strong>
          </p>
        </header>

        {/* TU PROGRESO REAL */}
        <section className="mt-8 border border-amber-500/40 bg-amber-500/5 rounded-md p-5">
          <VitrinaProgreso />
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm uppercase tracking-wider rounded px-5 py-2.5 transition-colors"
            >
              Entrar y cazar objetivos →
            </Link>
          </div>
        </section>

        {/* EL REY */}
        {rey && (
          <section className="mt-8 border-2 border-amber-500/60 rounded-lg p-6 bg-gradient-to-b from-amber-500/10 to-transparent">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">
              El objetivo supremo · Nº 100
            </div>
            <h2 className="mt-2 font-orbitron text-2xl sm:text-3xl font-black text-amber">
              {rey.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{rey.description}</p>
            <div className="mt-3 font-mono text-[11px] text-zinc-400">
              Botín: <strong className="text-amber">+{rey.coinReward} mon◉</strong> ·{" "}
              <strong className="text-amber">+{rey.gemReward} gemas</strong> ·{" "}
              <strong className="text-amber">+{rey.xpReward} XP</strong>
            </div>
          </section>
        )}

        {/* LOS BLOQUES */}
        {BLOQUES.map((b, bi) => {
          const items = resto.filter((a) => a.category === b.key);
          if (items.length === 0) return null;
          return (
            <section key={b.key} className="mt-10">
              <div className="flex items-baseline gap-3 flex-wrap border-b border-zinc-800 pb-2">
                <h2 className="font-orbitron text-lg font-black text-zinc-100">
                  {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][bi]}. {b.titulo.toUpperCase()}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {b.grito} · {items.length} objetivos
                </span>
              </div>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {items.map((a) => (
                  <article
                    key={a.id}
                    id={`obj-${a.id}`}
                    className="border border-zinc-800 hover:border-amber-500/50 rounded-md p-3.5 bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold leading-snug text-zinc-100">{a.title}</h3>
                      <span
                        className={`shrink-0 font-mono text-[9px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${RARITY[a.rarity] || RARITY.COMUN}`}
                      >
                        {a.rarity}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{a.description}</p>
                    <div className="mt-2 font-mono text-[10px] text-zinc-500">
                      +{a.coinReward} mon◉
                      {a.gemReward > 0 && <span className="text-amber"> · +{a.gemReward} gemas</span>}
                      <span> · +{a.xpReward} XP</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* CIERRE */}
        <section className="mt-10 border border-red-400/30 bg-red-400/5 rounded-md p-5 text-center">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Los objetivos se miden con lo que HACES dentro de la Casa: cada cable
            leído, cada territorio conquistado, cada apuesta ganada suma de
            verdad.{" "}
            <Link href="/" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
              Entra ahora
            </Link>{" "}
            — los primeros en llegar siempre se recuerdan más.
          </p>
        </section>
      </div>
    </main>
  );
}
