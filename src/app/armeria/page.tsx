import type { Metadata } from "next";
import Link from "next/link";
import { ARSENAL } from "@/lib/arsenal-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";

// v283.0 LA ARMERÍA DEL ARCHIVO — la cabeza de la cola de la v282: la
// armería (arsenal-data) esperaba «su sala o su sección» y la ronda le
// paga la sala: las armas reales del archivo (AK-47, Shahed-136,
// Javelin, HIMARS...) con su foto, su origen, su era, su función y su
// impacto VERBATIM de la fuente (directiva v266: la casa no inventa),
// su despiece contado desde los pasos reales y la puerta honesta al
// salón interactivo (el aparato, la primera página). Sala server pura
// (sin cliente, sin BD — prerenderizada ○), patrón /historia (v274).
// v326.0 EL ARSENAL SE PUEDE GIRAR: 12 → 21 armas y el título de la
// sala deja de escribir la cifra — la lleva de la fuente (ARSENAL.length,
// la lección v324: un número duro en una cadena es un número que miente
// en silencio).

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: `ARMERÍA — las ${ARSENAL.length} armas que explican los conflictos de hoy | VANGUARD`,
  description:
    "El archivo de armas de VANGUARD: cada arma real con su foto, su origen, su era, qué hace en los conflictos y por qué importa — con datos. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/armeria` },
};

// TODO derivado de la fuente, nada a mano (cero cifras escritas, guardia v234)
const ORIGINS = new Set(ARSENAL.map((w) => w.origin));
const PIEZAS = ARSENAL.reduce((acc, w) => acc + w.assembly.length, 0);
const ULTIMA = ARSENAL[ARSENAL.length - 1];

// LA LÍNEA DE LA CASA compuesta COMPLETA en JS (lección v256): si la
// fuente cambia, la línea cambia sola.
const lineaArmeria = `La armería del archivo — ${ARSENAL.length} armas reales con su foto, su despiece de ${PIEZAS} piezas y su impacto con datos, desde ${ARSENAL[0].short} hasta ${ULTIMA.short}, nacidas en ${ORIGINS.size} orígenes`;

export default function ArmeriaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ARMERÍA — las armas que explican los conflictos de hoy",
    description:
      "Cada arma real del archivo con su foto, su origen, su era, su función y su impacto con datos.",
    url: `${SITE_URL}/armeria`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: ARSENAL.length,
      itemListElement: ARSENAL.map((w, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: w.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <main className="min-h-screen bg-zinc-950 px-4 sm:px-5 py-10 text-zinc-200">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
            ◈ VANGUARD · EL ARCHIVO
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">LA ARMERÍA DEL ARCHIVO</h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">{lineaArmeria}</p>
          <p className="mt-1 text-xs text-zinc-500">
            El salón interactivo de la armería — con selector y despiece paso a
            paso — vive en el aparato ({" "}
            <Link href="/" className="text-amber-400 underline">
              la primera página
            </Link>
            ); esta sala es el archivo completo, servido sin JavaScript.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ARSENAL.map((w) => (
              <article
                key={w.id}
                className="flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40"
                aria-label={w.name}
              >
                {/* la foto real de la fuente (Wikimedia) — la casa no inventa imágenes */}
                <img
                  src={w.photo}
                  alt={w.name}
                  loading="lazy"
                  className="h-44 w-full bg-zinc-800 object-contain p-3"
                />
                <div className="flex flex-1 flex-col p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {w.origin} · {w.era}
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-zinc-100">{w.name}</h2>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{w.function}</p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">{w.impact}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                    despiece: {w.assembly.length} piezas · ficha técnica: {Object.keys(w.specs).length}{" "}
                    especificaciones
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-[11px] leading-relaxed text-zinc-600">
            Las fichas viajan verbatim de la fuente (arsenal-data.ts), no de esta
            sala — si el archivo crece, la armería crece sola. El despiece
            interactivo, con fotos y pasos, vive en el aparato: esta sala es la
            memoria indexable de las mismas armas.
          </p>
          <noscript>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              esta sala funciona sin JavaScript — {lineaArmeria}
            </p>
          </noscript>
        </div>
      </main>
    </>
  );
}
