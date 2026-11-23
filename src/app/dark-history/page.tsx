// ═══════════════════════════════════════════════════════════════════
// VANGUARD · DARK HISTORY — ARCHIVO INTERACTIVO DE LOS ACONTECIMIENTOS
// MÁS OSCUROS DE LA HUMANIDAD (v442.0)
//
// La casa ya tenía un archivo de las guerras (/historia, v274). DARK
// HISTORY lo amplía hacia el otro lado de la memoria: los genocidios,
// las atrocidades, los experimentos no éticos, las tragedias, los
// abusos institucionales y los casos de injusticia.
//
// SIGUIENDO EL PATRÓN DE LA CASA (verdad-cruda v295, /historia v274):
//   · nada se inventa — cada expediente viaja con sus datos y su
//     FUENTE citada (ONU, tribunales penales internacionales,
//     archivos nacionales, instituciones académicas);
//   · las cifras viajan con su rango y su fuente — donde la
//     documentación no es exacta, el expediente lo declara;
//   · las fotografias son FOTOS REALES DE CONTEXTO GEOGRAFICO de la
//     casa (imagenes-reales), no ilustraciones del hecho: nunca se
//     representa el sufrimiento con imagen inventada;
//   · el tono es MEMORIA y EDUCACIÓN: se recuerda para que no se
//     repita, no para el espectáculo.
//
// La sala es server puro (patrón v270/v273): cero JavaScript, cero
// hidratación. Mapa (MiniMapa, servidor), cronología (LineaDeTiempo,
// servidor), los expedientes y sus documentos están en el HTML.
// ═══════════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import Link from "next/link";
import {
  EVENTOS,
  CATEGORIAS,
  censoPorCategoria,
  rangoAnios,
  lineaDarkHistory,
  type Categoria,
} from "@/lib/dark-history";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { LineaDeTiempo } from "@/components/vanguard/linea-de-tiempo";
import { MiniMapa } from "@/components/mapas/mini-mapa";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard.vanguard-casa.workers.dev";

export const metadata: Metadata = {
  title:
    "DARK HISTORY — el archivo de los acontecimientos más oscuros de la humanidad",
  description:
    "Genocidios, atrocidades históricas, experimentos no éticos, tragedias, abusos institucionales y casos de injusticia: 17 expedientes documentados, con mapa, cronología, biografías, documentos y fuentes citadas. La memoria para que no se repita. Vanguard, en español.",
  alternates: { canonical: `${SITE_URL}/dark-history` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/dark-history`,
    title: "DARK HISTORY — el archivo de los hechos más oscuros de la humanidad",
    description:
      "El Holocausto, el genocidio de Ruanda, Camboya, Nankín, Srebrenica, Tuskegee, el Gulag, el apartheid... 17 expedientes documentados, con mapa, cronología, biografías y fuentes citadas.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [
      {
        url: `${SITE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: "DARK HISTORY — el archivo de los acontecimientos más oscuros de la humanidad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DARK HISTORY — Vanguard",
    description:
      "17 expedientes documentados de los hechos más oscuros de la humanidad, con mapa, cronología, biografías, documentos y fuentes citadas.",
  },
};

// ── TODO derivado del archivo de datos (dark-history.ts), nada a mano ──
const RANGO = rangoAnios();

// el censo por categoría, derivado de la fuente
const CENSO = CATEGORIAS.map((c) => ({
  categoria: c,
  n: EVENTOS.filter((e) => e.categoría === c.id).length,
}));

// la línea compuesta COMPLETA en JS (lección v256)
const LINEA_ARCHIVO = lineaDarkHistory();

// ── LA CRONOLUGIA GLOBALDEL ARCHIVO (LineaDeTiempo, servidor) ──
const TRAMOS_TIEMPO = EVENTOS.map((e) => ({
  id: e.id,
  nombre: `${e.codigo} · ${e.nombre}`,
  desde: e.desde,
  hasta: e.hasta,
  era: e.categoría,
  nota: e.lugar,
}));

// el color por categoría: la misma familia del archivo (CATEGORIAS.color),
// en hex porque el eje se pinta con estilos en línea.
const PALETA_CATEGORIAS: Record<string, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.id, c.color])
);

// ── EL MAPA DEL ARCHIVO (MiniMapa, servidor) ──
// los puntos son las coordenadas REALES de cada lugar (lat/lng en la fuente),
// coloreados por categoría.
const PUNTO_CATEGORIA: Record<Categoria, string> = Object.fromEntries(
  CATEGORIAS.map((c) => [c.id, c.color])
) as Record<Categoria, string>;

const PUNTOS_MAPA = EVENTOS.map((e) => ({
  lat: e.lat,
  lng: e.lng,
  color: PUNTO_CATEGORIA[e.categoría],
  nombre: `${e.codigo} · ${e.nombre}`,
}));

// ── ENLACES DE NÚCLEO ──
const ENLACES_NUCLEO: EnlaceContextual[] = [
  {
    etiqueta: "EL ARCHIVO DE LA HISTORIA ▸",
    ruta: "/historia",
    motivo: "las guerras que enseñaron a leer las de hoy",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "EL GLOBO 3D ▸",
    ruta: "/mundo",
    motivo: "los teatros actuales del planeta girando en vivo",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "VERDAD CRUDA ▸",
    ruta: "/verdad-cruda",
    motivo: "el manifesto de la casa sobre la memoria y la verdad",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "LA SALA DEL VÉRTIGO ▸",
    ruta: "/vertigo",
    motivo: "el flujo infinito de cables de la agencia",
    tipoRelacion: "documenta",
  },
];

// el JSON-LD documental (el mismo patrón de /historia): un archive of
// scholarly/educational content, en español, con su fuente.
const jsonLd = jsonLdSeguro({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DARK HISTORY — Vanguard",
  alternateName: "Archivo de los acontecimientos más oscuros de la humanidad",
  url: `${SITE_URL}/dark-history`,
  inLanguage: "es",
  description: metadata.description,
  publisher: {
    "@type": "Organization",
    name: "VANGUARD",
    url: SITE_URL,
  },
});

// ── el JSON-LD documental (schema.org) ──
const jsonLdDark = jsonLd;

export default async function DarkHistoryPage() {
  // las cifras de la portada se derivan del archivo de datos (nada escritas)
  const cifrasPortada = [
    {
      valor: EVENTOS.length,
      etiqueta: "EXPEDIENTES DOCUMENTADOS",
      nota: `${CATEGORIAS.length} categorías · ${RANGO.desde} – ${RANGO.hasta}`,
    },
    {
      valor: CATEGORIAS.length,
      etiqueta: "CATEGORÍAS DEL ARCHIVO",
      nota: "genocidios · atrocidades · experimentos · tragedias · abusos · injusticia",
    },
    {
      valor: EVENTOS.reduce((n, e) => n + e.biografias.length, 0),
      etiqueta: "BIOGRAFÍAS EN EL ARCHIVO",
      nota: "personas del expediente: responsables, testigos y resistencia",
    },
    {
      valor: EVENTOS.reduce((n, e) => n + e.documentos.length, 0),
      etiqueta: "DOCUMENTOS CITADOS",
      nota: "informe, sentencia, testimonio y archivo",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdDark }}
      />

      <PortadaSala
        imagen="/imagenes-reales/chernobyl.jpg"
        alt="Fotografía real del paisaje de Chernóbil, la región que padeció el genocidio del Holodomor y simboliza el peso del archivo"
        volanta="DARK HISTORY · ARCHIVO DE LA MEMORIA"
        titulo="El archivo de los hechos más oscuros de la humanidad"
        sumario={`${EVENTOS.length} expedientes documentados de los acontecimientos más oscuros de la humanidad — genocidios, atrocidades, experimentos no éticos, tragedias, abusos institucionales y casos de injusticia. Cronolog\u00eda, mapa, biografías, documentos y fuentes citadas.`}
        cifras={cifrasPortada}
        acento="#d97052"
        ruta="/dark-history"
        nota="Cada expediente viaja con su FUENTE citada (ONU, tribunales penales internacionales, archivos nacionales, instituciones académicas). Las cifras viajan con su rango y su fuente; las fotografías son fotos reales de contexto geográfico de la casa, no ilustraciones del hecho."
      />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-xs text-zinc-500 leading-relaxed">
          {`${LINEA_ARCHIVO}. El tono del archivo es MEMORIA y EDUCACIÓN: se recuerda para que no se repita, y el sufrimiento de las víctimas nunca se convierte en espectáculo. Nada aquí es inventado: cada nombre, cada cifra y cada documento viaja con su fuente citada.`}
        </p>

        {/* ── EL MAPA DEL ARCHIVO (MiniMapa, servidor) ── */}
        <section className="mt-10" aria-label="El mapa del archivo">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
            <span className="text-rose-300">EL MAPA DEL ARCHIVO</span>
            <span className="text-zinc-600">{` · ${EVENTOS.length} lugares`}</span>
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">
            {`Cada punto es el lugar REAL de un expediente, colocado en sus coordenadas REALES (lat/lng de la fuente), coloreado por categoría. El mapa vive en el servidor: funciona sin JavaScript.`}
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/50">
            <MiniMapa
              puntos={PUNTOS_MAPA}
              etiqueta="Mapa de los lugares de los expedientes de DARK HISTORY"
              clase="w-full"
            />
          </div>
          {/* leyenda del mapa, derivada de la fuente */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {CATEGORIAS.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-400"
              >
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: c.color }}
                />
                {c.nombre}
              </span>
            ))}
          </div>
        </section>

        {/* ── LA CRNOLOGIA DEL ARCHIVO (LineaDeTiempo, servidor) ── */}
        <LineaDeTiempo
          tramos={TRAMOS_TIEMPO}
          paleta={PALETA_CATEGORIAS}
          nombres={Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.nombre]))}
          titulo="LA CRNOLOGIA DEL ARCHIVO"
          volanta="EL ARCHIVO, EN UN EJE"
          nota={`Cada tramo es un expediente con sus años REALES de la fuente (${RANGO.desde} – ${RANGO.hasta}). El eje no se dibuja a mano: su escala sale del arco de los datos.`}
          desde={RANGO.desde}
          hasta={RANGO.hasta}
          acento="#d97052"
        />

        {/* ── EL CENSO DEL ARCHIVO ── */}
        <section className="mt-10" aria-label="El censo del archivo">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
            <span className="text-rose-300">EL CENSO DEL ARCHIVO</span>
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {CENSO.map((c) => (
              <span
                key={c.categoria.id}
                className="border border-zinc-700 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest bg-zinc-900"
              >
                <span
                  className="font-bold"
                  style={{ color: c.categoria.color }}
                >
                  {c.categoria.nombre} ×{c.n}
                </span>
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-400">
          <span className="text-rose-300">LOS EXPEDIENTES</span>
          <span className="text-zinc-600">{` · ${EVENTOS.length} documentos del archivo`}</span>
        </h2>
        <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-slate-400">
          {`Los expedientes van por categoría. Cada uno: su fotografía de contexto geográfico, su resumen, su contexto histórico, su cronología, sus biografías, sus documentos citados y sus fuentes. Las cifras de víctimas viajan con su rango y su fuente: donde la documentación no es exacta, el expediente lo declara.`}
        </p>

        {CENSO.map((grupo) => {
          const items = EVENTOS.filter((e) => e.categoría === grupo.categoria.id);
          if (items.length === 0) return null;
          return (
            <section key={grupo.categoria.id} className="mt-12" aria-label={grupo.categoria.nombre}>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.3em]">
                <span style={{ color: grupo.categoria.color }}>
                  {grupo.categoria.nombre.toUpperCase()}
                </span>
                <span className="text-zinc-600">{` · ${items.length} ${items.length === 1 ? "expediente" : "expedientes"}`}</span>
              </h2>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{grupo.categoria.lema}</p>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {items.map((e) => (
                  <article
                    key={e.id}
                    id={e.id}
                    className="border border-zinc-800 rounded-xl bg-zinc-900/40 scroll-mt-20 overflow-hidden flex flex-col"
                  >
                    {/* FOTO REAL DE CONTEXTO GEOGRAFICO (no ilustración del hecho) */}
                    <div className="relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={e.foto.src}
                        alt={e.foto.alt}
                        width={1200}
                        height={500}
                        loading="lazy"
                        decoding="async"
                        className="h-36 w-full object-cover sm:h-44"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                      {/* el sello del expediente */}
                      <div className="absolute top-2 left-2 flex items-center gap-2">
                        <span
                          className="font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-950/80"
                          style={{ color: grupo.categoria.color }}
                        >
                          {e.codigo}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-950/80 text-zinc-300">
                          {e.pais}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 font-mono text-[10px] text-zinc-300/90">
                        {`${e.desde} – ${e.hasta}`}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-sm font-bold leading-snug text-zinc-100">{e.nombre}</h3>
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{e.lugar}</p>

                      <p className="mt-3 text-xs text-zinc-400 leading-relaxed">{e.resumen}</p>

                      <p className="mt-3 text-[13px] text-zinc-300 leading-relaxed">{e.contexto}</p>

                      {/* la cifra de víctimas con su fuente y rango */}
                      <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                          VÍCTIMAS DOCUMENTADAS
                        </div>
                        <div className="mt-1 text-sm font-bold text-zinc-100">{e.victimas.valor}</div>
                        <div className="mt-1 text-[11px] text-zinc-500 leading-relaxed">{e.victimas.nota}</div>
                      </div>

                      {/* la cronología local */}
                      <div className="mt-4">
                        <h4 className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                          CRONOLUGIA DEL EXPEDIENTE
                        </h4>
                        <ol className="mt-2 space-y-1.5">
                          {e.cronologia.map((h, i) => (
                            <li key={i} className="flex gap-2.5 text-xs text-zinc-400 leading-relaxed">
                              <span className="font-mono text-[10px] text-zinc-500 shrink-0 pt-0.5" style={{ color: grupo.categoria.color }}>
                                {h.anio}
                              </span>
                              <span>{h.evento}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* las biografías */}
                      {e.biografias.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                            BIOGRAFÍAS
                          </h4>
                          <div className="mt-2 space-y-3">
                            {e.biografias.map((b) => (
                              <div key={b.nombre} className="border-l-2 pl-3" style={{ borderColor: grupo.categoria.color }}>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-xs font-bold text-zinc-200">{b.nombre}</span>
                                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{b.rol}</span>
                                </div>
                                <p className="mt-0.5 text-[12px] text-zinc-400 leading-relaxed">{b.texto}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* los documentos */}
                      {e.documentos.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                            DOCUMENTOS
                          </h4>
                          <ul className="mt-2 space-y-2">
                            {e.documentos.map((d) => (
                              <li key={d.titulo} className="border border-zinc-800 rounded-md bg-zinc-950/30 p-3">
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className="text-xs font-bold text-zinc-200">{d.titulo}</span>
                                  <span className="font-mono text-[10px] text-zinc-500 whitespace-nowrap">{d.anio}</span>
                                </div>
                                <p className="mt-1 text-[11px] font-mono uppercase tracking-widest text-zinc-500">{d.tipo}</p>
                                <p className="mt-1 text-[12px] text-zinc-400 leading-relaxed">{d.descripcion}</p>
                                {d.cita && (
                                  <blockquote className="mt-2 border-l-2 pl-2 text-[12px] italic text-zinc-300" style={{ borderColor: grupo.categoria.color }}>
                                    {d.cita}
                                  </blockquote>
                                )}
                                <p className="mt-1.5 text-[11px] text-zinc-500">Fuente: {d.fuente}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* las fuentes */}
                      {e.fuentes.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                            FUENTES
                          </h4>
                          <ul className="mt-2 space-y-1">
                            {e.fuentes.map((fu) => (
                              <li key={fu.org} className="text-[11px] text-zinc-500 leading-relaxed">
                                <span className="font-bold text-zinc-400">{fu.org}:</span> {fu.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* CONECTA CON EL NÚCLEO (patrón v230/v233/v234) — puertas honestas */}
        <div className="mt-12">
          <EnlacesNucleo enlaces={ENLACES_NUCLEO} />
        </div>

        <noscript>
          <p className="mt-6 text-xs text-zinc-500 leading-relaxed">
            {`DARK HISTORY funciona sin JavaScript: los ${EVENTOS.length} expedientes, sus datos, su cronología, sus biografías, sus documentos y sus fuentes —y el mapa con los lugares reales de cada hecho— están arriba, servidos en el HTML.`}
          </p>
        </noscript>
      </div>
    </>
  );
}
