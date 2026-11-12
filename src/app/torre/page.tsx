import type { Metadata } from "next";
import Link from "next/link";
import { VanguardMarkSvg } from "@/components/vanguard/vanguard-mark-svg";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { TorrePanel } from "@/components/vanguard/torre-panel";
import { SALVAVIDAS, TRAMOS_MS, leerTorre, type ResumenTorre } from "@/lib/torre";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

// ============================================================
// v367.1 EL OJO DEL DUEÑO — LA TORRE DE CONTROL (/torre)
//
// La sala que convierte tres noches de ceguera en una pantalla. Hasta hoy
// la casa sabía que la cortina eterna había mordido al Dueño TRES veces
// (v177 red, v179 server zombi, v181 hilo muerto) y sabía que había
// construido CINCO salvavidas (v178 → v184) — pero no sabía si alguno
// había actuado nunca. Esta sala lo dice con cuentas reales.
//
// · Server-rendered con `force-dynamic`: el parte se pinta ya completo, sin
//   esperar al cliente (y sin caché: un parte viejo es un parte falso).
// · El panel cliente solo añade el latido del aparato y el botón de
//   actualizar. Sin JS, la sala sigue contando lo que hay (progressive
//   honesty: no se finge una carencia).
// · Toda cifra lleva su CADENA DE LA VERDAD: fuente + fecha del corte.
// ============================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "La Torre de Control — salud real del arranque | VANGUARD",
  description:
    "La Torre de Control de VANGUARD: supervivencia real del arranque, tramos de carga medidos en el aparato del visitante, embudo del camino (globo → tab → zona → sala) y cuentas honestas de los cinco salvavidas de la casa. Sin datos personales.",
  alternates: { canonical: `${SITE_URL}/torre` },
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

const PUERTAS_DE_LA_TORRE: EnlaceContextual[] = [
  {
    etiqueta: "LA CRÓNICA DEL DÍA ▸",
    ruta: "/cronica",
    motivo: "el otro parte de la casa: qué pasó de verdad en el archivo en las últimas 24 h",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL CENSO DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "donde fnt:telemetria está declarada PRIVADA: esta Torre no puede salir por la búsqueda",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "LA FRONTERA, A LA VISTA ▸",
    ruta: "/privacidad",
    motivo: "la política que declara los cuatro almacenes privados de la casa, telemetría incluida",
    tipoRelacion: "documenta",
  },
];

export default async function TorrePage() {
  const resumen: ResumenTorre = await leerTorre();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "La Torre de Control — VANGUARD",
    description:
      "Salud real del arranque de VANGUARD: supervivencia, tramos de carga y los cinco salvavidas de la casa.",
    url: `${SITE_URL}/torre`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        <div className="border-b border-zinc-800 bg-zinc-900/60">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
            >
              <VanguardMarkSvg size={18} idPrefix="torre-mark" />
              <span>VANGUARD</span>
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              {resumen.version} · {resumen.codename}
            </span>
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-5 py-10">
          <h1 className="text-3xl font-bold text-zinc-100">La Torre de Control</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            La casa se cayó tres veces en la puerta y se curó a ciegas. Esto es la vista que
            faltaba: qué aparatos arrancan, cuántos llegan vivos al final del montaje, en qué
            escalón del camino se cae la gente y si alguno de los cinco salvavidas ha tenido que
            actuar de verdad. Sin IP, sin user-agent, sin alias: la Torre cuenta sucesos, no
            personas.
          </p>

          <div className="mt-8">
            <TorrePanel inicial={resumen} />
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-amber-300">Cómo se mide (sin adornos)</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-zinc-400">
              <li>
                <strong className="text-zinc-200">Cero tabla nueva:</strong> la Torre escribe en el
                mostrador de contadores que la casa tiene desde v34 — claves con prefijo{" "}
                <code className="text-amber">torre:</code>, que ninguna otra sala lee.
              </li>
              <li>
                <strong className="text-zinc-200">Cero dato personal:</strong> no se guarda IP, ni
                navegador, ni identificador. Una sesión cuenta como mucho un arranque.
              </li>
              <li>
                <strong className="text-zinc-200">Cero número exacto de tiempo:</strong> los
                milisegundos de arranque viajan por tramos ({TRAMOS_MS.map((t) => t.etiqueta).join(" · ")}).
              </li>
              <li>
                <strong className="text-zinc-200">Cero telemetría pública:</strong> su fuente es{" "}
                <code className="text-amber">fnt:telemetria</code>, declarada privada en el núcleo
                desde v218: la búsqueda global no la toca y no existe API pública que la lea.
              </li>
              <li>
                <strong className="text-zinc-200">Cero mentira ante el fallo:</strong> si la BD no
                responde, esta sala dice <em>SIN SEÑAL</em> y no pinta ceros.
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-amber-300">Los cinco salvavidas que se vigilan</h2>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-zinc-400">
              {SALVAVIDAS.map((s) => (
                <li key={s.senal} className="font-mono text-[11px] uppercase tracking-widest">
                  <span className="text-zinc-200">{s.nombre}</span>{" "}
                  <span className="text-zinc-600">— {s.origen}</span>
                </li>
              ))}
            </ul>
          </section>

          <FuenteYFecha
            fuente="el mostrador de contadores de la casa (site_counter) + /api/health"
            consultado={resumen.consultadoEn}
            nota="Cada cuenta de esta página es un suceso real anotado por un aparato real. Un cero significa «aún no», nunca «no importa»."
          />

          <section className="mt-10 pb-10">
            <EnlacesNucleo enlaces={PUERTAS_DE_LA_TORRE} titulo="CONECTA CON EL NÚCLEO" />
          </section>
        </article>
      </main>
    </>
  );
}
