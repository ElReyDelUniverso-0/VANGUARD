import type { Metadata } from "next";
import Link from "next/link";
import { instantaneaPulso } from "@/lib/pulso";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { SalaEnVivo, type CableVivo, type StatsVivo } from "./sala-en-vivo";

// v213.0 EL PULSO — LA SALA EN VIVO (la puerta del «EL PRIMERO»).
// Página server: baja la instantánea (solo cables REALES enriquecidos
// por el motor de impacto v172) con el primer byte y la entrega a la
// sala client, que sondea /api/pulso cada 30 s — la sala jamás se
// recarga (ley v190) y jamás miente (exactitud: fuente + credibilidad
// + hora exacta). JSON-LD CollectionPage para Google News.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "EN VIVO — Última hora del mundo, minuto a minuto | VANGUARD",
  description:
    "La sala de última hora de VANGUARD: cada cable real del planeta entra solo, con su hora, su fuente y su sello de exactitud. Sondeo cada 30 segundos, página que nunca se recarga. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/en-vivo` },
};

// revalidate 30: la sala vive — Google re-rastrea y ve el mundo moviéndose
export const revalidate = 30;

// v242.0 EL KIT COMPLETO — CONECTA server-rendered bajo la sala (patrón
// v230/v236): rutas REALES del censo v218, verificadas por la prueba.
const PUERTAS_DEL_PULSO: EnlaceContextual[] = [
  {
    etiqueta: "PRIMERA PÁGINA ▸",
    ruta: "/guerra-hoy",
    motivo: "la primera página escrita de la guerra, con el mismo cable real que entra aquí",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "EL RADAR DE GOBIERNOS ▸",
    ruta: "/espia",
    motivo: "lo que los gobiernos PUBLICAN — el otro extremo del mismo hilo de escuchas",
    tipoRelacion: "fuente_de",
  },
  {
    etiqueta: "EL GLOBO 3D ▸",
    ruta: "/mundo",
    motivo: "cada cable de la sala en su sitio exacto del planeta",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "LA BÚSQUEDA DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "todo el archivo real de la casa, buscable cuando la última hora ya pasó",
    tipoRelacion: "modulo_de",
  },
];

function aCableVivo(r: Awaited<ReturnType<typeof instantaneaPulso>>["items"][number]): CableVivo {
  return {
    id: r.id,
    t: r.title,
    f: r.source,
    u: r.url ?? "",
    fecha: typeof r.publishedAt === "string" ? r.publishedAt : new Date(r.publishedAt).toISOString(),
    impacto: r.impacto,
    tier: r.tier,
    cred: r.cred,
    tag: (r.tacticalTag || "INFO").toUpperCase(),
    conflicto: r.conflictTag || "",
    pais: r.sourceCountry || "",
    paisNombre: r.paisNombre || "",
    s: r.resumen || "",
  };
}

export default async function EnVivoPage() {
  let iniciales: CableVivo[] = [];
  let calientes: CableVivo[] = [];
  let stats: StatsVivo = {
    hoy: 0, ultimaHora: 0, urgente: 0, teatros: 0, paises: 0, frescoMin: null,
    generado: new Date().toISOString(),
  };
  try {
    const snap = await instantaneaPulso();
    iniciales = snap.items.map(aCableVivo);
    calientes = snap.calientes.map(aCableVivo);
    stats = { ...snap.stats, generado: snap.stats.generado };
  } catch (e) {
    console.error("en-vivo page error", e);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "EN VIVO — última hora del mundo, minuto a minuto",
    description:
      "La sala de última hora de VANGUARD: cables reales del planeta con hora, fuente y sello de exactitud; sondeo cada 30 segundos.",
    url: `${SITE_URL}/en-vivo`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
      <noscript>
        <main className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
              ◉ VANGUARD · EL PULSO
            </p>
            <h1 className="mt-3 text-xl font-bold text-zinc-100">
              La sala EN VIVO necesita JavaScript
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Actívalo para ver la última hora latir — o entra a la primera
              página clásica en{" "}
              <Link href="/guerra-hoy" className="text-amber-400 underline">
                /guerra-hoy
              </Link>
              .
            </p>
          </div>
        </main>
      </noscript>
      <SalaEnVivo iniciales={iniciales} calientesIniciales={calientes} statsIniciales={stats} />
      {/* v242.0 CONECTA CON EL NÚCLEO — server-rendered, vive bajo la sala:
          la sala manda en pantalla (min-h-screen) y las puertas esperan
          abajo, sin meter chrome dentro del componente client (ley v190). */}
      <section className="border-t border-zinc-800 bg-zinc-950 px-4 sm:px-5 pb-14 -mt-1">
        <div className="max-w-7xl mx-auto">
          <EnlacesNucleo enlaces={PUERTAS_DEL_PULSO} titulo="CONECTA CON EL NÚCLEO" />
        </div>
      </section>
    </>
  );
}
