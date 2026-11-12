import type { Metadata } from "next";
import Link from "next/link";
import { VanguardMarkSvg } from "@/components/vanguard/vanguard-mark-svg";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import { FuenteYFecha } from "@/components/vanguard/fuente-y-fecha";
import { CronicaCopiar } from "@/components/vanguard/cronica-copiar";
import { parteDelDia, parteEnTexto, VENTANA_CABLES, VENTANA_DIAS } from "@/lib/cronica";
import { fechaHora } from "@/lib/procedencia";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

// ============================================================
// v367.1 EL OJO DEL DUEÑO — MODO CRÓNICA (/cronica)
//
// La razón honesta de volver cada día: el parte de lo que de verdad ha
// pasado en el archivo de la casa en las últimas 24 horas — qué teatros
// hablaron, qué medios firmaron, a qué hora se cargó el planeta y cuál fue
// el último cable que entró.
//
// · Server-rendered con `force-dynamic` (nada de crónica cacheada).
// · Cada bloque lleva su CADENA DE LA VERDAD (fuente + fecha del corte).
// · Cero números escritos a mano: todo se deriva del archivo real; la
//   ventana medida se declara en la cara del lector.
// · Si la BD no responde, la sala dice SIN SEÑAL. No hay crónica falsa.
// ============================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "La Crónica del Día — qué pasó de verdad | VANGUARD",
  description:
    "El parte diario de VANGUARD derivado del archivo real: teatros que hablaron en 24 horas, medios que firmaron, la hora más cargada del planeta y el último cable que entró. Sin cifras inventadas.",
  alternates: { canonical: `${SITE_URL}/cronica` },
};

export const dynamic = "force-dynamic";

const PUERTAS_DE_LA_CRONICA: EnlaceContextual[] = [
  {
    etiqueta: "EL PULSO · EN VIVO ▸",
    ruta: "/en-vivo",
    motivo: "la crónica cuenta el día; el pulso lo está viviendo minuto a minuto",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "LA TORRE DE CONTROL ▸",
    ruta: "/torre",
    motivo: "el otro parte: no qué pasó en el mundo, sino si la casa llega viva al arranque",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "TU CENTINELA ▸",
    ruta: "/centinela",
    motivo: "sigue tus teatros y tus medios: la crónica solo te cuenta lo tuyo",
    tipoRelacion: "pertenece_a",
  },
];

export default async function CronicaPage() {
  const parte = await parteDelDia();
  const texto = parteEnTexto(parte);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "La Crónica del Día — VANGUARD",
    description:
      "El parte diario derivado del archivo real de cables de VANGUARD, con la fecha de cada pieza.",
    url: `${SITE_URL}/cronica`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    dateModified: parte.consultadoEn,
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
              <VanguardMarkSvg size={18} idPrefix="cronica-mark" />
              <span>VANGUARD</span>
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              CORTE · {fechaHora(parte.consultadoEn)}
            </span>
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-5 py-10">
          <h1 className="text-3xl font-bold text-zinc-100">La Crónica del Día</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            No es un resumen de lo que creemos que pasó: es el parte de lo que el archivo de la
            casa registró, con la fecha de publicación de cada pieza. Si una fuente no respondió,
            esta crónica no rellena el hueco.
          </p>

          {!parte.ok ? (
            <div className="mt-8 rounded-md border border-red-500/30 bg-red-500/5 p-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-red-300">
                SIN SEÑAL
              </p>
              <p className="mt-2 text-sm text-zinc-400">{parte.nota}</p>
            </div>
          ) : (
            <>
              {/* ── EL CENSO DEL DÍA ── */}
              <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Cifra etiqueta="EN 24 H" valor={parte.censo.ultimas24} destacada />
                <Cifra etiqueta="HOY" valor={parte.censo.hoy} />
                <Cifra etiqueta="TEATROS 24 H" valor={parte.censo.teatros24} />
                <Cifra etiqueta="MEDIOS 24 H" valor={parte.censo.medios24} />
              </section>

              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                VENTANA MEDIDA · los {parte.ventana.cables} cables más recientes de{" "}
                {parte.ventana.dias} días (tope {VENTANA_CABLES}) · archivo total {parte.censo.archivo}{" "}
                cables
              </p>

              {/* ── EL PULSO DEL PLANETA ── */}
              <section className="mt-8 rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
                  EL PULSO DE LAS ÚLTIMAS 24 H
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {parte.horaCargada
                    ? `La hora más cargada del planeta fue las ${parte.horaCargada.hora}:00 UTC, con ${parte.horaCargada.n} cables entrando a la vez.`
                    : "Sin cables suficientes en 24 h para dibujar el pulso."}{" "}
                  {parte.masReciente
                    ? `El último cable que entró es de ${parte.masReciente.fuente}, a las ${fechaHora(parte.masReciente.publicado)}.`
                    : ""}
                </p>
              </section>

              {/* ── LOS TEATROS QUE HABLARON ── */}
              <section className="mt-8">
                <h2 className="text-lg font-bold text-amber-300">
                  Los teatros con señal en la ventana
                </h2>
                {parte.censo.ultimas24 === 0 ? (
                  <p className="mt-2 rounded-sm border border-zinc-800 bg-zinc-900/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                    El archivo no registró cables nuevos en las últimas 24 h — estos teatros son
                    los de los últimos 7 días. Se dice, no se disimula.
                  </p>
                ) : null}
                {parte.teatros.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-500">
                    Ningún teatro con señal en la ventana. Sin datos no hay titular.
                  </p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2">
                    {parte.teatros.map((t) => (
                      <li
                        key={t.tag}
                        className="rounded-sm border border-zinc-800 bg-zinc-900/40 px-3 py-2"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <Link
                            href={`/conflicto/${t.tag}`}
                            className="font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
                          >
                            {t.tag} ▸
                          </Link>
                          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                            {t.hoy} hoy · {t.semana} en 7 d
                          </span>
                        </div>
                        {t.ultimo ? (
                          <p className="mt-1 text-sm leading-snug text-zinc-400">
                            {t.ultimo.titulo}{" "}
                            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                              — {t.ultimo.fuente} · {fechaHora(t.ultimo.publicado)}
                            </span>
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* ── LOS MEDIOS QUE FIRMARON ── */}
              <section className="mt-8">
                <h2 className="text-lg font-bold text-amber-300">
                  Los medios en la ventana
                </h2>
                {parte.medios.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-500">Ningún medio en la ventana.</p>
                ) : (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {parte.medios.map((m) => (
                      <li
                        key={m.medio}
                        className="rounded-sm border border-zinc-700 bg-zinc-900/70 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-zinc-300"
                        title={`último: ${m.ultimo ? fechaHora(m.ultimo) : "sin fecha"}`}
                      >
                        {m.medio}{" "}
                        <span className="text-amber">{m.hoy}</span>
                        <span className="text-zinc-600">/{m.enVentana}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="mt-6">
                <CronicaCopiar texto={texto} />
              </div>
            </>
          )}

          <FuenteYFecha
            fuente="el archivo de cables de la casa (tabla NewsItem)"
            consultado={parte.consultadoEn}
            publicado={parte.masReciente?.publicado ?? null}
            nota={`Corte hecho a las ${fechaHora(parte.consultadoEn)}. La fecha de cada cable es la de su publicación real, nunca la de esta consulta.`}
          />

          <section className="mt-10 pb-10">
            <EnlacesNucleo enlaces={PUERTAS_DE_LA_CRONICA} titulo="CONECTA CON EL NÚCLEO" />
          </section>
        </article>
      </main>
    </>
  );
}

function Cifra({
  etiqueta,
  valor,
  destacada = false,
}: {
  etiqueta: string;
  valor: number;
  destacada?: boolean;
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">{etiqueta}</p>
      <p className={`font-mono text-2xl ${destacada ? "text-amber" : "text-zinc-100"}`}>{valor}</p>
    </div>
  );
}
