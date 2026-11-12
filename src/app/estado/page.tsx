import type { Metadata } from "next";
import Link from "next/link";
import { VanguardMarkSvg } from "@/components/vanguard/vanguard-mark-svg";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { EstadoLatido } from "./estado-latido";

// ═══════════════════════════════════════════════════════════════════════════
// EL ESTADO DE LA CASA — /estado (el latido público, patrón /escudo).
// La sala donde cualquiera toma el pulso del server: proceso, base de datos,
// memoria y tiempo de vida, servidos por la API de salud de la casa
// (/api/health, v27 + v84). 100% server-rendered salvo el botón del latido
// (estado-latido.tsx, cliente mínimo sin efectos — ley v335).
// ═══════════════════════════════════════════════════════════════════════════

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "El Estado de la Casa — Latido Público | VANGUARD",
  description:
    "El latido público de VANGUARD: proceso, base de datos, memoria y tiempo de vida del server, servidos por la API de salud de la casa. Un clic, un latido, sin sondeos automáticos.",
  alternates: {
    canonical: `${SITE_URL}/estado`,
  },
};

const PUERTAS_DEL_ESTADO: EnlaceContextual[] = [
  {
    etiqueta: "EL ESCUDO ▸",
    ruta: "/escudo",
    motivo:
      "el guardián de los secretos de la casa — la otra mitad del blindaje",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL CENSO DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo:
      "el inventario público de módulos y fuentes — el cuerpo que este latido sostiene",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "PRIMERA PÁGINA ▸",
    ruta: "/",
    motivo: "la Casa entera, el territorio que este latido mantiene de pie",
    tipoRelacion: "pertenece_a",
  },
];

export default function EstadoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "El Estado de la Casa — Latido Público — VANGUARD",
    description:
      "El latido público de VANGUARD: proceso, base de datos, memoria y tiempo de vida del server, servidos por la API de salud de la casa.",
    url: `${SITE_URL}/estado`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        <div className="border-b border-zinc-800 bg-zinc-900/60">
          <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
            >
              <VanguardMarkSvg size={18} idPrefix="est-mark" />
              <span>VANGUARD</span>
            </Link>
            <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider">
              el latido público · /api/health
            </span>
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-5 py-10">
          <h1 className="text-3xl font-bold text-zinc-100">
            El Estado de la Casa · El Latido Público
          </h1>
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            La sala donde cualquiera toma el pulso del server: si el proceso
            vive, cómo respira la base de datos, cuánta memoria sostiene la
            casa y cuánto tiempo lleva de pie. El patrón de toda página de
            estado seria — viviendo DENTRO de Vanguard, sin puertas externas.
          </p>

          <div className="mt-6 flex flex-col gap-8">
            <section>
              <h2 className="text-lg font-bold text-amber-300">Cómo late</h2>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                La salud viaja por{" "}
                <code className="font-mono text-[12px] text-emerald-400">
                  GET /api/health
                </code>
                , la vía que el watchdog del cliente consulta desde la v27 para
                saber si la casa sigue en pie. Desde la v84 la consulta de base
                de datos corre contra un reloj de{" "}
                <strong className="text-zinc-200">3.5 segundos</strong> y el
                endpoint responde{" "}
                <strong className="text-zinc-200">siempre 200</strong> mientras
                el proceso Next esté vivo: el estado de la BD va en el payload
                como diagnóstico —{" "}
                <code className="font-mono text-[12px] text-emerald-400">up</code>{" "}
                ·{" "}
                <code className="font-mono text-[12px] text-amber-400">slow</code>{" "}
                ·{" "}
                <code className="font-mono text-[12px] text-red-400">down</code>{" "}
                — para que nadie vea «se cayó la conexión» cuando la casa
                funciona.
              </p>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                Junto al estado de la BD viajan la latencia del eco, la memoria
                del proceso (el vigilante v178 la releva a los 900 MB para que
                el kernel nunca tenga que hacerlo), el montículo, la versión de
                la casa y el tiempo de vida desde el último despertar.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-300">
                El latido en vivo
              </h2>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                Toma el pulso con la mano. Honestidad primero: esta sala no
                sondea sola — sin intervalos, sin efectos (ley v335) — porque
                el watchdog de la casa ya hace la guardia automática; esta isla
                es la mirada pública, no el guardián.
              </p>
              <EstadoLatido />
            </section>
          </div>

          <div className="mt-10 border border-amber-500/30 bg-amber-500/5 rounded-md p-4 text-sm text-zinc-400">
            Si el latido está mudo, la casa lo confiesa: el error se pinta tal
            cual, sin maquillar. Y si la BD llegara sin voz, el proceso sigue
            respondiendo — el progreso del visitante siempre vivió en su
            local (ley v27), la BD es la memoria del Centro Mundial.
          </div>

          <section className="mt-10 pb-10">
            <EnlacesNucleo
              enlaces={PUERTAS_DEL_ESTADO}
              titulo="CONECTA CON EL NÚCLEO"
            />
          </section>
        </article>
      </main>
    </>
  );
}
