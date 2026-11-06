import type { Metadata } from "next";
import Link from "next/link";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { DetectorClient, type FamiliaCatalogo } from "./detector-client";

// ═══════════════════════════════════════════════════════════════════════════
// EL CENTINELA DE BOLSILLO — /escudo/detector (ronda EL CENTINELA, complemento de la ley
// v204 EL ESCUDO). La sala donde el visitante lleva el escudo EN EL BOLSILLO:
// pega un texto y mira si lleva llaves expuestas ANTES de enviarlo a un chat,
// un correo o un commit. El mirar pasa íntegro en el navegador del visitante
// — cero fetch, cero red: el texto pegado jamás sale de la sala.
//
//   · UNA SOLA FUENTE DE VERDAD: el catálogo de familias (con sus patrones)
//     lo declara el propio script en su --catalogo y esta sala lo HORNEA en
//     build (execFileSync → JSON → props). El navegador aplica los MISMOS
//     patrones que el taller: ningún patrón vive escrito dos veces.
//   · Sala estática (force-static): el catálogo viaja horneado con el
//     despliegue — en serverless no hace falta spawn en runtime.
//   · Si el horneado falla, la sala confiesa el fallo (nunca finge mirar).
// ═══════════════════════════════════════════════════════════════════════════

export const dynamic = "force-static";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

function hornearCatalogo(): FamiliaCatalogo[] | null {
  const script = join(process.cwd(), "scripts", "busca-apikeys.mjs");
  if (!existsSync(script)) return null;
  try {
    const stdout = execFileSync("node", [script, "--catalogo"], {
      encoding: "utf8",
      timeout: 30_000,
      maxBuffer: 8 * 1024 * 1024,
    });
    const datos = JSON.parse(stdout) as { familias?: FamiliaCatalogo[] };
    return datos.familias && datos.familias.length > 0 ? datos.familias : null;
  } catch {
    return null;
  }
}

const CATALOGO = hornearCatalogo();

export const metadata: Metadata = {
  title: "El Detector de Bolsillo — mira tus llaves en el navegador | VANGUARD",
  description:
    "Pega un texto y mira si lleva API keys o secretos expuestos antes de enviarlo: las 10 familias del Escudo de VANGUARD más 2 genéricos, mirando íntegramente en tu navegador — el texto jamás sale de la sala. Con forja de llaves fuertes y medidor de entropía.",
  alternates: {
    canonical: `${SITE_URL}/escudo/detector`,
  },
};

const PUERTAS_DEL_BOLSILLO: EnlaceContextual[] = [
  {
    etiqueta: "LA SALA DEL ESCUDO ▸",
    ruta: "/escudo",
    motivo:
      "el Buscador de Llaves del taller: la misma guardia, mirando el árbol completo del código",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL ESTADO DE LA CASA ▸",
    ruta: "/estado",
    motivo: "el latido público del server — la salud de lo que este bolsillo protege",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "PRIMERA PÁGINA ▸",
    ruta: "/",
    motivo: "la Casa entera, el territorio que el escudo custodia",
    tipoRelacion: "pertenece_a",
  },
];

export default function DetectorPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "El Detector de Bolsillo — VANGUARD",
    description:
      "Escáner de API keys y secretos en el navegador: 10 familias de secretos más 2 genéricos, con forja de llaves fuertes y medidor de entropía. El texto pegado jamás sale del navegador.",
    url: `${SITE_URL}/escudo/detector`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    applicationCategory: "SecurityApplication",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
              ley v204 · el escudo · el bolsillo
            </span>
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-5 py-10">
          <h1 className="text-3xl font-bold text-zinc-100">
            El Centinela de Bolsillo · El Detector de Llaves
          </h1>
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            La sala donde el escudo de la casa viaja CONTIGO: pega un texto —un
            .env, un correo, un fragmento de código— y mira si lleva API keys o
            secretos expuestos antes de enviarlo a un chat, un ticket o un
            commit. El mismo mirar del Buscador del taller, con los mismos
            patrones, horneados de la misma fuente única.
          </p>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            La honestidad primero: <strong className="text-zinc-200">todo pasa
            en tu navegador</strong> — cero fetch, cero red, cero telemetría. El
            texto pegado jamás sale de esta sala, así que puedes mirar un
            secreto de verdad sin entregárselo a nadie.
          </p>

          {CATALOGO ? (
            <DetectorClient catalogo={CATALOGO} />
          ) : (
            <div className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 p-4 font-mono text-[11px] text-red-300">
              El catálogo de familias no pudo hornearse desde{" "}
              <code>scripts/busca-apikeys.mjs --catalogo</code> — la sala se
              niega a fingir una mirada con patrones prestados. Corre el
              horneado en el taller y vuelve.
            </div>
          )}

          <div className="mt-10 rounded-md border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-zinc-400">
            El bolsillo mira con las <strong className="text-zinc-200">10
            familias</strong> del escudo (OpenAI/Anthropic, Google, AWS, GitHub,
            Telegram, Stripe, Slack, llaves privadas, credenciales en URL y
            JWT) más los <strong className="text-zinc-200">2 genéricos de
            reserva</strong> (asignaciones con nombre que huele a secreto y hex
            de alta entropía). Es el complemento de viaje del taller: la mirada
            profunda del árbol completo vive en{" "}
            <Link href="/escudo" className="text-amber-400 hover:text-amber-300">
              la sala del Escudo
            </Link>{" "}
            y en <code className="font-mono text-[12px] text-emerald-400">npm run escudo</code>.
          </div>

          <section className="mt-10 pb-10">
            <EnlacesNucleo
              enlaces={PUERTAS_DEL_BOLSILLO}
              titulo="CONECTA CON EL NÚCLEO"
            />
          </section>
        </article>
      </main>
    </>
  );
}
