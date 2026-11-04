import type { Metadata } from "next";
import Link from "next/link";
import { teatrosDelParte, componerParte } from "@/lib/emisor-guerra";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { EmisoraCliente } from "./emisora-cliente";
import { GrabadorAudio } from "./grabador";
import { db } from "@/lib/db";

// ============================================================
// v217.0 LA EMISORA — la página del parte hablado.
// v234.0 LA ONDA — la página se conecta con la casa: JSON-LD
// honesto (WebPage, patrón v204 con jsonLdSeguro), noscript con
// las puertas esenciales y CONECTA CON EL NÚCLEO (patrón v230,
// EnlacesNucleo reutilizado): la emisora ya no es una isla — la
// onda lleva al archivo, a las salas, al mapa y a la búsqueda.
// El grabador y la emisión (v217) quedan INTACTOS.
// v249.0 EL MURO DE PIEDRA — el muro de las voces deja de vivir
// solo dentro del grabador (client-side): la página lo TALLA en
// el servidor con las últimas voces REALES de la BD (SSR sin
// JavaScript, audible con el reproductor nativo) y un vacío
// honesto si nadie habló aún. El muro vivo del grabador sigue
// siendo el espejo instantáneo; el grabador repinta este muro
// con router.refresh() al mandar una voz.
// ============================================================

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

/** v234.0 — las puertas REALES de la onda (censo v230: cero rutas
 * inventadas; cada destino responde 200 con datos reales). */
const conectaNucleo: EnlaceContextual[] = [
  {
    etiqueta: "EL ARCHIVO DE CABLES ▸",
    ruta: "/nucleo?tipo=noticia",
    motivo: "Los cables reales que el Comandante narra — cada uno con su fuente",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "LAS SALAS DE GUERRA ▸",
    ruta: "/mundo",
    motivo: "El globo 3D EN VIVO donde los frentes del parte arden de verdad",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "EL MAPA DEL FRENTE ▸",
    ruta: "/ver-guerra",
    motivo: "El mural FRENTE TOTAL con los frentes documentados de cada teatro",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "LA BÚSQUEDA DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "El buscador global de todas las entidades documentadas de la casa",
    tipoRelacion: "visible_en",
  },
];

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
  const [teatros, totalAudios, voces] = await Promise.all([
    teatrosDelParte().catch(() => []),
    db.audioComandante.count().catch(() => 0),
    // v249.0 — las últimas voces reales para el muro de piedra (el techo
    // del archivo visible en el SSR; la API /api/audios sigue sirviendo
    // las 30 completas a quien las pida).
    db.audioComandante
      .findMany({ orderBy: { createdAt: "desc" }, take: 8 })
      .catch(() => []),
  ]);
  const total24h = teatros.reduce((a, t) => a + t.cables, 0);
  const texto = componerParte(teatros, total24h).join(" ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Emisora de Guerra de Vanguard",
    description:
      "El parte de guerra hablado con datos reales: teatros, cables de 24 horas y contextos explicados. Elige la voz, escucha el frente y manda tu propio audio.",
    url: `${SITE_URL}/audios`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
  };

  return (
    <main className="min-h-screen bg-[#040407] text-[#f5f3ee] px-4 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />
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

        {/* v249.0 EL MURO DE PIEDRA — el archivo de las voces en el SSR:
            servido desde la BD real, audible con el reproductor NATIVO
            (funciona sin JavaScript) e indexable. Nada a mano: voces,
            conteos y fechas salen de la BD. */}
        <section className="mt-8 rounded-xl border border-white/10 bg-[#0a0a10] p-5">
          <h2 className="text-lg font-bold tracking-wide">🗣 EL MURO DE LAS VOCES</h2>
          <p className="mt-1 text-sm text-[#b9b4aa]">
            Las últimas voces que los comandantes mandaron a la emisora — talladas en el servidor, audibles sin JavaScript
            ({totalAudios} {totalAudios === 1 ? "voz guardada" : "voces guardadas"} en la casa).
          </p>
          {voces.length === 0 ? (
            <p className="mt-3 text-xs text-[#6b665e]">
              El muro está en pie y vacío: todavía nadie habló. El primer audio puede ser el tuyo — graba arriba.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {voces.map((v) => (
                <li key={v.id} className="rounded-lg border border-white/10 bg-white/[.02] p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-bold">{v.titulo}</span>
                    <span className="text-[10px] tracking-widest text-[#ffd34d]">
                      {v.autor} · {v.duracion} s ·{" "}
                      {new Intl.DateTimeFormat("es", { day: "numeric", month: "short", year: "numeric" }).format(
                        v.createdAt
                      )}
                    </span>
                  </div>
                  <audio controls preload="none" src={`/api/media/${v.mediaId}`} className="mt-2 h-9 w-full" />
                </li>
              ))}
            </ul>
          )}
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

        {/* v234.0 — la onda llega al núcleo (patrón v230) */}
        <EnlacesNucleo titulo="CONECTA CON EL NÚCLEO" enlaces={conectaNucleo} />

        <noscript>
          <p className="mt-6 rounded-lg border border-white/10 bg-white/[.03] p-4 text-xs leading-relaxed text-[#b9b4aa]">
            Sin JavaScript la emisora no puede sonar, pero la casa sigue en pie: lee el{" "}
            <Link href="/guerra-hoy" className="text-[#ffd34d] underline">
              parte escrito de GUERRA HOY
            </Link>
            , entra a{" "}
            <Link href="/nucleo" className="text-[#ffd34d] underline">
              LA BÚSQUEDA DEL NÚCLEO
            </Link>{" "}
            o escucha los frentes sala a sala en{" "}
            <Link href="/conflicto/ukraine" className="text-[#ffd34d] underline">
              /conflicto/ukraine
            </Link>
            . Y las voces de la casa suenan igual: EL MURO DE LAS VOCES se oye con el reproductor nativo, sin
            JavaScript.
          </p>
        </noscript>
      </div>
    </main>
  );
}

