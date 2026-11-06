import type { Metadata } from "next";
import Link from "next/link";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { EscudoEscaner } from "./escudo-escaner";

// ═══════════════════════════════════════════════════════════════════════════
// LA SALA DEL ESCUDO — /escudo (complemento de la ley v204 EL ESCUDO).
// La sala pública donde la casa confiesa su guardia de secretos: qué vigila el
// Buscador de Llaves, cómo mira y qué deudas tiene declaradas. El catálogo de
// familias NO se duplica aquí — lo declara el propio script en su --json y lo
// sirve /api/escudo (una sola fuente de verdad: el script).
// 100% server-rendered salvo el botón de la mirada (escudo-escaner.tsx).
// ═══════════════════════════════════════════════════════════════════════════

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "El Escudo — Buscador de Llaves | VANGUARD",
  description:
    "El buscador de API keys de la casa: 10 familias de secretos vigiladas más 2 genéricos de reserva, informe enmascarado y deudas declaradas. Complemento de la ley v204 EL ESCUDO.",
  alternates: {
    canonical: `${SITE_URL}/escudo`,
  },
};

const PUERTAS_DEL_ESCUDO: EnlaceContextual[] = [
  {
    etiqueta: "EL CENSO DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo:
      "el inventario público de módulos y fuentes de la casa — el mapa del que este escudo nace",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "POLÍTICA DE PRIVACIDAD ▸",
    ruta: "/privacidad",
    motivo:
      "lo que la casa maneja y jamás sale por una API pública — la frontera que este escudo custodia",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "PRIMERA PÁGINA ▸",
    ruta: "/",
    motivo: "la Casa entera, el territorio que este escudo protege",
    tipoRelacion: "pertenece_a",
  },
];

const COMANDOS: { cmd: string; nota: string }[] = [
  { cmd: "npm run escudo", nota: "informe completo · exit 1 si hay hallazgos nuevos" },
  { cmd: "npm run escudo -- --strict", nota: "también falla con los permitidos (quemados)" },
  { cmd: "npm run escudo -- --json", nota: "salida JSON para CI" },
  { cmd: "npm run escudo-env", nota: "el inventario del aire: qué variables respira el código" },
];

export default function EscudoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "El Escudo — Buscador de Llaves — VANGUARD",
    description:
      "El buscador de API keys de la casa: 10 familias de secretos vigiladas más 2 genéricos de reserva, informe enmascarado y deudas declaradas.",
    url: `${SITE_URL}/escudo`,
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
              className="font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
            >
              ◉ VANGUARD
            </Link>
            <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider">
              ley v204 · el escudo
            </span>
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-5 py-10">
          <h1 className="text-3xl font-bold text-zinc-100">
            El Escudo · El Buscador de Llaves
          </h1>
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            La guardia de secretos de la casa: una herramienta de Node puro (cero
            dependencias nuevas) que revisa el árbol de trabajo completo buscando
            API keys y secretos filtrados ANTES de que viajen al repo o al
            público.
          </p>

          <div className="mt-6 flex flex-col gap-8">
            <section>
              <h2 className="text-lg font-bold text-amber-300">Cómo mira</h2>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                Vigila <strong className="text-zinc-200">10 familias</strong> de
                secretos — OpenAI/Anthropic (sk-…), Google (AIza…), AWS
                (AKIA/ASIA…), GitHub (ghp_/gho_…), bots de Telegram
                (123456:AA…), Stripe (sk_live_…), Slack (xoxb-…), llaves privadas
                y service accounts (BEGIN PRIVATE KEY), credenciales escondidas
                dentro de una URL de conexión de base de datos (usuario y
                contraseña en la misma cadena) y JWT firmados
                (eyJ…eyJ…) — más{" "}
                <strong className="text-zinc-200">2 genéricos de reserva</strong>:
                asignaciones de SECRET/TOKEN/PASSWORD con nombre que huele a
                secreto y literales hex de alta entropía. El catálogo vivo,
                con severidad y cura de cada familia, lo declara el propio script
                y lo verás al ejecutar la mirada.
              </p>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                Tres reglas del veredicto: los hallazgos nuevos hacen caer el
                escudo (exit 1); los secretos ya públicos y documentados viajan
                en la lista <code className="font-mono text-[12px] text-amber-400">PERMITIDOS</code>{" "}
                del script con su motivo escrito (deudas declaradas, no delitos);
                y toda llave del informe viaja{" "}
                <strong className="text-zinc-200">enmascarada</strong> — el informe
                jamás filtra lo que caza.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-300">Los comandos</h2>
              <div className="mt-3 flex flex-col gap-2">
                {COMANDOS.map((c) => (
                  <div
                    key={c.cmd}
                    className="border border-zinc-800 bg-zinc-900/60 rounded-md px-3 py-2.5"
                  >
                    <code className="font-mono text-[12px] text-emerald-400">
                      {c.cmd}
                    </code>
                    <span className="block mt-1 text-[11px] text-zinc-600">
                      {c.nota}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                Y el hermano menor del Buscador:{" "}
                <code className="font-mono text-[12px] text-emerald-400">escudo-env</code>{" "}
                (el Inventario del Aire) mira qué variables de entorno respira el
                código, cuáles declara la casa y qué reservas hardcodeadas
                quedaron en el camino — la lista exacta de la rotación pendiente.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-300">
                La mirada en vivo
              </h2>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                El mismo escudo que corre el taller, mirando desde la web. La
                honestidad primero: en producción el endpoint queda a puerta
                cerrada (403) salvo que la casa defina{" "}
                <code className="font-mono text-[12px] text-amber-400">ESCUDO_WEB=1</code>{" "}
                — el despliegue serverless no viaja con el árbol de trabajo
                completo, así que ahí el escudo de verdad corre en el taller y en
                CI.
              </p>
              <EscudoEscaner />
            </section>

            <section>
              <h2 className="text-lg font-bold text-amber-300">
                El bolsillo del escudo
              </h2>
              <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
                La misma guardia, de viaje:{" "}
                <Link
                  href="/escudo/detector"
                  className="font-mono text-[12px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
                >
                  /escudo/detector ▸
                </Link>{" "}
                — el Detector de Bolsillo mira el texto que pegues con las
                MISMAS familias (patrones horneados de la fuente única: este
                script), íntegramente en el navegador del visitante — cero red:
                el texto jamás sale de la sala. Con forja de llaves fuertes y
                medidor de entropía.
              </p>
            </section>
          </div>

          <div className="mt-10 border border-amber-500/30 bg-amber-500/5 rounded-md p-4 text-sm text-zinc-400">
            Este escudo nació de una auditoría honesta y sus deudas están
            declaradas a la vista: cuando la rotación en Vercel cierre, la lista
            de permitidos se vacía y toda reaparición vuelve a ser delito.
          </div>

          <section className="mt-10 pb-10">
            <EnlacesNucleo
              enlaces={PUERTAS_DEL_ESCUDO}
              titulo="CONECTA CON EL NÚCLEO"
            />
          </section>
        </article>
      </main>
    </>
  );
}
