import type { Metadata } from "next";
import Link from "next/link";
import { PortadaSala } from "@/components/vanguard/portada-sala";
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
    image: parte.claves.find((c) => c.imagen)?.imagen ?? undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }} />
      <main className="min-h-screen bg-zinc-950 text-zinc-200">
        {/* v402.0 LA CRÓNICA, PERFECCIONADA — modelo «The Morning» (NYT) y Axios
            Smart Brevity: cinco claves con foto, luego teatro por teatro, luego
            quién firmó. Alimentada por los cables VIVOS (antes salía en cero). */}
        <PortadaSala
          imagen="/ilustraciones/briefing.jpg"
          alt="Mesa de briefing nocturna con carpetas, mapa y lámpara encendida"
          volanta={`Conflictos · Crónica del ${fechaCorta(parte.consultadoEn)}`}
          titulo="Qué pasó hoy, de verdad"
          sumario="El parte del día armado solo con cables reales: las cinco claves, cada frente con su última señal y los medios que firmaron. Si una fuente calla, aquí no se rellena el hueco."
          cifras={[
            { valor: parte.censo.ultimas24, etiqueta: "Cables en 24 h", nota: "con su hora de publicación" },
            { valor: parte.censo.teatros24, etiqueta: "Frentes con señal", nota: "en las últimas 24 h" },
            { valor: parte.censo.medios24, etiqueta: "Medios que firmaron", nota: "en las últimas 24 h" },
            {
              valor: parte.horaCargada ? `${String(parte.horaCargada.hora).padStart(2, "0")}:00` : "—",
              etiqueta: "Hora más cargada",
              nota: parte.horaCargada ? `UTC · ${parte.horaCargada.n} cables` : "sin datos",
            },
          ]}
          anclas={[
            { etiqueta: "Las 5 claves", href: "#claves" },
            { etiqueta: "Frente por frente", href: "#frentes" },
            { etiqueta: "Quién firmó", href: "#medios" },
          ]}
        />

        <div className="vx-cron">
          {!parte.ok ? (
            <div className="vx-cron-vacio">
              <b>SIN SEÑAL</b>
              <p>{parte.nota}</p>
            </div>
          ) : (
            <>
              {/* ── ① LAS CINCO CLAVES ── */}
              <section id="claves" className="vx-cron-sec" aria-labelledby="t-claves">
                <span className="vx-cron-sello">◆ Sección 01 · Lo esencial</span>
                <h2 id="t-claves">Las cinco claves del día</h2>
                {parte.claves.length === 0 ? (
                  <p className="vx-cron-nota">Los medios no han enviado cables frescos en las últimas 36 horas.</p>
                ) : (
                  <ol className="vx-cron-claves">
                    {parte.claves.map((c, i) => (
                      <li key={c.id}>
                        <Link href={c.enlace ?? "#"} className="vx-cron-clave">
                          <span className="vx-cron-num">{String(i + 1).padStart(2, "0")}</span>
                          <span className="vx-cron-foto" style={{ background: c.color ?? "#1b2230" }}>
                            {c.imagen ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={c.imagen} alt="" loading={i < 2 ? "eager" : "lazy"} referrerPolicy="no-referrer" />
                            ) : null}
                          </span>
                          <span className="vx-cron-txt">
                            {c.nombreTeatro && (
                              <span className="vx-cron-tag" style={{ color: c.color ?? undefined }}>
                                <i style={{ background: c.color ?? undefined }} /> {c.nombreTeatro}
                              </span>
                            )}
                            <b>{c.titulo}</b>
                            {c.resumen && <span className="vx-cron-res">{c.resumen}</span>}
                            <small>
                              {c.fuente} · {horaLocal(c.publicado)}
                            </small>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {/* ── ② FRENTE POR FRENTE ── */}
              <section id="frentes" className="vx-cron-sec" aria-labelledby="t-frentes">
                <span className="vx-cron-sello">◆ Sección 02 · El tablero</span>
                <h2 id="t-frentes">Frente por frente</h2>
                <p className="vx-cron-nota">
                  {parte.horaCargada
                    ? `La hora más cargada fue las ${parte.horaCargada.hora}:00 UTC, con ${parte.horaCargada.n} cables a la vez. `
                    : ""}
                  {parte.masReciente
                    ? `El último cable entró de ${parte.masReciente.fuente} a las ${fechaHora(parte.masReciente.publicado)}.`
                    : ""}
                </p>
                {parte.teatros.length === 0 ? (
                  <p className="vx-cron-nota">Ningún frente con señal en la ventana. Sin datos no hay titular.</p>
                ) : (
                  <div className="vx-cron-frentes">
                    {parte.teatros.map((t) => (
                      <Link
                        key={t.tag}
                        href={`/conflicto/${t.tag}`}
                        className="vx-cron-frente"
                        style={{ ["--fc" as string]: t.ultimo?.color ?? "#e8c56a" }}
                      >
                        <span className="vx-cron-frente-top">
                          <b>{t.ultimo?.nombreTeatro ?? t.tag}</b>
                          <small>
                            {t.hoy} hoy · {t.semana} en {VENTANA_DIAS} d
                          </small>
                        </span>
                        {t.ultimo && (
                          <span className="vx-cron-frente-ult">
                            {t.ultimo.imagen ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={t.ultimo.imagen} alt="" loading="lazy" referrerPolicy="no-referrer" />
                            ) : null}
                            <span>
                              {t.ultimo.titulo}
                              <small>
                                {t.ultimo.fuente} · {horaLocal(t.ultimo.publicado)}
                              </small>
                            </span>
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* ── ③ QUIÉN FIRMÓ ── */}
              <section id="medios" className="vx-cron-sec" aria-labelledby="t-medios">
                <span className="vx-cron-sello">◆ Sección 03 · Las fuentes</span>
                <h2 id="t-medios">Quién firmó</h2>
                {parte.medios.length === 0 ? (
                  <p className="vx-cron-nota">Ningún medio en la ventana.</p>
                ) : (
                  <ul className="vx-cron-medios">
                    {parte.medios.map((m) => (
                      <li key={m.medio} title={`último: ${m.ultimo ? fechaHora(m.ultimo) : "sin fecha"}`}>
                        <b>{m.medio}</b>
                        <span>
                          {m.hoy} hoy <i>/ {m.enVentana} en la ventana</i>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="vx-cron-nota">
                  Ventana medida: los {parte.ventana.cables} cables más recientes de {parte.ventana.dias} días (tope{" "}
                  {VENTANA_CABLES}).
                </p>
                <div className="vx-cron-copiar">
                  <CronicaCopiar texto={texto} />
                </div>
              </section>
            </>
          )}

          <FuenteYFecha
            fuente="los cables vivos de los medios (BBC Mundo, France 24, El País, Europa Press…) y, de respaldo, el archivo de la casa"
            consultado={parte.consultadoEn}
            publicado={parte.masReciente?.publicado ?? null}
            nota={`Corte hecho a las ${fechaHora(parte.consultadoEn)}. La fecha de cada cable es la de su publicación real, nunca la de esta consulta.`}
          />

          <section className="vx-cron-sec">
            <EnlacesNucleo enlaces={PUERTAS_DE_LA_CRONICA} titulo="Sigue en Vanguard" />
          </section>
        </div>
      </main>
    </>
  );
}

function horaLocal(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Santo_Domingo" });
  } catch {
    return "";
  }
}

function fechaCorta(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "long", timeZone: "America/Santo_Domingo" });
  } catch {
    return "día";
  }
}
