import type { Metadata } from "next";
import Link from "next/link";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";
import { BarraMundo } from "@/components/vanguard/barra-mundo";
import { VanguardMarkSvg } from "@/components/vanguard/vanguard-mark-svg";
import { IlustracionCabecera } from "@/components/vanguard/ilustracion-cabecera"; // v360 LA CASA ILUSTRADA
import { TEATROS } from "@/lib/teatros";
import { colorTension, haceDe } from "@/lib/mundo";
import {
  formaDeLaSemana,
  indiceTension,
  leerEscuchas,
  movimientosDeGobierno,
  type EscuchaFuente,
  type MovimientoGobierno,
  type TensionTeatro,
} from "@/lib/espia";
import { SondeoEspia } from "./sondeo-espia";

// v215.0 MODO ESPÍA — «un modo de espiar el gobierno».
// LA HONESTIDAD COMO TÉCNICA: Vanguard espía SOLO lo que los gobiernos
// y las organizaciones PUBLICAN — filos RSS oficiales (OSINT, fuentes
// abiertas) + los cables de la propia BD filtrados por olor a gobierno.
// Server-rendered con revalidate 180: Google lee el radar y el radar
// no golpea a nadie (caché de escuchas de 10 min en el módulo).

export const revalidate = 180;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "MODO ESPÍA — radar de gobiernos en fuentes abiertas | VANGUARD",
  description:
    "Espía lo que los gobiernos PUBLICAN: escuchas oficiales de la ONU Noticias, la Sala de Prensa de la ONU, ReliefWeb (OCHA), la OMS y la OPCW (armas químicas), índice de tensión por teatro de guerra con su forma semanal, el pulso del planeta y los movimientos de gobierno del día. Todo de fuentes abiertas (OSINT), gratis y en español.",
  alternates: { canonical: `${SITE_URL}/espia` },
  openGraph: {
    title: "MODO ESPÍA — radar de gobiernos · VANGUARD",
    description:
      "Escuchas oficiales en vivo, índice de tensión por región con su semana dibujada, el pulso del planeta y movimientos de gobiernos. Espionaje a la vista: solo fuentes abiertas.",
    url: `${SITE_URL}/espia`,
    siteName: "VANGUARD",
    type: "website",
  },
};

// v242.0 EL KIT COMPLETO — las puertas del radar son rutas REALES del
// censo v218 (verificadas por la prueba: cero invención).
const PUERTAS_DEL_RADAR: EnlaceContextual[] = [
  {
    etiqueta: "EL MAPA DEL FRENTE ▸",
    ruta: "/ver-guerra",
    motivo: "los teatros cuyo índice de tensión mide este radar, documentados y en vivo",
    tipoRelacion: "documenta",
  },
  {
    etiqueta: "EL GLOBO 3D ▸",
    ruta: "/mundo",
    motivo: "cada capital y organización del radar en su sitio exacto del planeta",
    tipoRelacion: "visible_en",
  },
  {
    etiqueta: "GUERRA HOY ▸",
    ruta: "/guerra-hoy",
    motivo: "la primera página escrita con los mismos cables que el radar escucha",
    tipoRelacion: "pertenece_a",
  },
  {
    etiqueta: "LA BÚSQUEDA DEL NÚCLEO ▸",
    ruta: "/nucleo",
    motivo: "todo el archivo real de la casa, buscable por teatro, país y fuente",
    tipoRelacion: "modulo_de",
  },
];

const TAG_COLOR: Record<string, string> = {
  ALERTA: "text-red-300 border-red-400/40 bg-red-400/10",
  DIPLOMACIA: "text-sky-300 border-sky-400/40 bg-sky-400/10",
  ECONOMIA: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  HUMANITARIO: "text-violet-300 border-violet-400/40 bg-violet-400/10",
  ANALISIS: "text-amber-300 border-amber-400/40 bg-amber-400/10",
  INFO: "text-zinc-400 border-zinc-600 bg-zinc-800/60",
};

const TENDENCIA: Record<TensionTeatro["tendencia"], { s: string; c: string }> = {
  sube: { s: "▲ SUBE", c: "text-red-300" },
  baja: { s: "▼ BAJA", c: "text-emerald-300" },
  plano: { s: "▶ PLANO", c: "text-zinc-400" },
};

export default async function EspiaPage() {
  let escuchas: EscuchaFuente[] = [];
  let movimientos: MovimientoGobierno[] = [];
  let tension: TensionTeatro[] = [];
  let forma: Record<string, number[]> = {};
  let generado = new Date().toISOString();

  try {
    escuchas = await leerEscuchas();
  } catch (e) {
    console.error("espia escuchas", e);
  }
  try {
    movimientos = await movimientosDeGobierno();
  } catch (e) {
    console.error("espia movimientos", e);
  }
  try {
    tension = await indiceTension(Object.keys(TEATROS), Object.fromEntries(Object.entries(TEATROS).map(([k, v]) => [k, v.nombre])));
  } catch (e) {
    console.error("espia tension", e);
  }
  try {
    forma = await formaDeLaSemana(Object.keys(TEATROS));
  } catch (e) {
    console.error("espia forma", e);
  }

  const fuentesVivas = escuchas.filter((f) => f.estado === "VIVA").length;

  // v253.0 EL PULSO DEL PLANETA — números del planeta derivados SOLO de
  // los datos ya medidos arriba (tensión + forma): cero consultas extra,
  // cero invención; sin datos, la tira ni existe (vacío honesto).
  const hoyTotal = tension.reduce((a, t) => a + t.n24, 0);
  const encendidos = tension.filter((t) => t.n24 > 0).length;
  const caliente = tension.reduce<TensionTeatro | null>(
    (a, t) => (t.n24 > (a?.n24 ?? -1) ? t : a),
    null,
  );
  const semanaTotal = Object.values(forma).reduce(
    (a, arr) => a + arr.reduce((x, y) => x + y, 0),
    0,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "MODO ESPÍA — radar de gobiernos en fuentes abiertas",
    description:
      "Escuchas oficiales de gobiernos y organizaciones (ONU, OTAN, Pentágono, Casa Blanca, UE), índice de tensión por teatro y movimientos de gobierno. OSINT, fuentes abiertas.",
    url: `${SITE_URL}/espia`,
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
        <BarraMundo activa="espia" />

        {/* v360 LA CASA ILUSTRADA — el espionaje entra como baño de luz lateral */}
        <header className="relative overflow-hidden max-w-7xl mx-auto px-4 sm:px-5 pt-6 pb-4">
          <IlustracionCabecera src="/ilustraciones/espionaje.jpg" />
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wide text-soft">
              MODO ESPÍA <span className="text-cyan-300">◈</span>
            </h1>
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-cyan-300 border border-cyan-500/50 bg-cyan-500/10 rounded px-2 py-0.5">
              Radar de gobiernos
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-[13px] text-muted-foreground leading-relaxed">
            Espionaje a la vista, sin máscaras: Vanguard escucha{" "}
            <strong className="text-zinc-300">lo que los gobiernos y las organizaciones PUBLICAN</strong> —
            sus boletines oficiales, sus declaraciones, sus decretos. Nada se
            invade, nada se hackea: si ellos lo emiten, aquí se oye. Hoy el
            radar tiene {fuentesVivas} de {escuchas.length || 5} señales oficiales abiertas.
          </p>
          <div className="mt-3">
            <SondeoEspia generado={generado} />
          </div>
        </header>

        {/* v253.0 EL PULSO DEL PLANETA — la tira que respira: los cuatro
            números del día, todos derivados de las medidas reales de arriba.
            Sin tensión que medir, la tira ni se pinta (vacío honesto). */}
        {tension.length > 0 && (
          <section aria-label="El pulso del planeta" className="max-w-7xl mx-auto px-4 sm:px-5 pb-8">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-cyan-300">
              ◉ EL PULSO DEL PLANETA — los números de este instante
            </h2>
            <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="border border-zinc-800 rounded-md bg-zinc-900/40 p-3">
                <p className="font-display text-2xl font-black text-soft">{hoyTotal}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">cables escuchados hoy</p>
              </div>
              <div className="border border-zinc-800 rounded-md bg-zinc-900/40 p-3">
                <p className="font-display text-2xl font-black text-soft">{encendidos}<span className="text-sm text-zinc-500">/{tension.length}</span></p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">teatros encendidos</p>
              </div>
              <div className="border border-zinc-800 rounded-md bg-zinc-900/40 p-3">
                <p className="font-display text-2xl font-black text-soft truncate">{caliente?.nombre ?? "—"}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">el teatro más caliente · {caliente?.n24 ?? 0} cables hoy</p>
              </div>
              <div className="border border-zinc-800 rounded-md bg-zinc-900/40 p-3">
                <p className="font-display text-2xl font-black text-soft">{semanaTotal}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">cables en la semana completa</p>
              </div>
            </div>
          </section>
        )}

        {/* ÍNDICE DE TENSIÓN */}
        <section className="max-w-7xl mx-auto px-4 sm:px-5 pb-8">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            01 · Índice de tensión por teatro — 24 h contra la media de 7 días · cada barra = un día de 24 h
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tension.map((t) => {
              const color = colorTension(t.porcentaje);
              const ten = TENDENCIA[t.tendencia];
              return (
                <Link
                  key={t.slug}
                  href={`/conflicto/${t.slug}`}
                  className="block border border-zinc-800 rounded-md bg-zinc-900/40 p-3 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-soft">{t.nombre}</p>
                    <span className={`font-mono text-[9px] uppercase tracking-widest ${ten.c}`}>
                      {ten.s}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${Math.max(3, t.porcentaje)}%`, background: color }} />
                  </div>
                  {/* v253.0 LA FORMA DE LA SEMANA — 7 barras REALES (cubo
                      rodante de 24 h, la misma ventana del índice); hoy va
                      encendida con el color de tensión. Decorativa: los
                      números ya se leen en la tarjeta (aria-hidden). */}
                  {forma[t.slug] && (() => {
                    const maxDia = Math.max(1, ...forma[t.slug]);
                    return (
                      <div className="mt-2 flex items-end gap-[3px] h-4" aria-hidden="true">
                        {forma[t.slug].map((n, i) => (
                          <div
                            key={i}
                            title={`${n} cable${n === 1 ? "" : "s"} · ${i === 6 ? "hoy (24 h)" : `${6 - i} día${6 - i === 1 ? "" : "s"} atrás`}`}
                            className="w-full rounded-sm"
                            style={{ height: `${Math.max(14, (n / maxDia) * 100)}%`, background: i === 6 ? color : "rgb(63 63 70)" }}
                          />
                        ))}
                      </div>
                    );
                  })()}
                  <p className="mt-1.5 font-mono text-[10px] text-zinc-500">
                    {t.n24} cables hoy · media {t.media7}/día · tensión {t.porcentaje}/100
                  </p>
                </Link>
              );
            })}
            {!tension.length && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                El índice no responde — reintenta con SONPEAR DE NUEVO.
              </p>
            )}
          </div>
        </section>

        {/* ESCUCHAS OFICIALES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-5 pb-8">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            02 · Escuchas oficiales — lo que ellos mismos emiten
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {escuchas.map((f) => (
              <div
                key={f.id}
                className={`border rounded-md p-3 ${
                  f.estado === "VIVA"
                    ? "border-cyan-500/30 bg-zinc-900/40"
                    : "border-zinc-800 bg-zinc-900/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-[13px] font-bold text-soft">{f.nombre}</p>
                  <span
                    className={`font-mono text-[8px] uppercase tracking-widest rounded px-1.5 py-0.5 border ${
                      f.estado === "VIVA"
                        ? "text-emerald-300 border-emerald-400/40 bg-emerald-400/10"
                        : "text-zinc-500 border-zinc-700"
                    }`}
                  >
                    {f.estado === "VIVA" ? "● señal viva" : "○ sin señal"}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                  {f.etiqueta}
                </p>
                <ul className="mt-2 space-y-2">
                  {f.items.map((it, i) => (
                    <li key={i}>
                      <a
                        href={it.enlace}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] leading-snug text-zinc-300 hover:text-cyan-300"
                      >
                        {it.titulo} ↗
                      </a>
                      {it.fecha && (
                        <span className="block font-mono text-[9px] text-zinc-600">
                          hace {haceDe(it.fecha)}
                        </span>
                      )}
                    </li>
                  ))}
                  {!f.items.length && (
                    <li className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
                      La fuente no responde — nunca se inventa un titular.
                    </li>
                  )}
                </ul>
              </div>
            ))}
            {!escuchas.length && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Sin señales esta pasada — el radar reintenta con SONPEAR DE NUEVO.
              </p>
            )}
          </div>
        </section>

        {/* MOVIMIENTOS DE GOBIERNO
            v245.0 LA QUINTA ESCUCHA — reparación honesta: la fuente decía
            TAG_COLOR.tag] (clave estática inexistente + un corchete suelto
            que tsc y SWC se tragaban SOLO con el texto exacto de esta
            plantilla — con texto corto tsc grita TS1005). El compilado real
            (z[a.tag]||z.INFO) siempre fue el correcto: el runtime sirvió
            colores verdaderos desde v242 — la fuente vuelve a decirlo. */}
        <section className="max-w-7xl mx-auto px-4 sm:px-5 pb-8">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            03 · Movimientos de gobierno — los cables que huelen a poder
          </h2>
          <div className="mt-3 border border-zinc-800 rounded-md bg-zinc-900/40 divide-y divide-zinc-800/70">
            {movimientos.map((m) => (
              <Link
                key={m.id}
                href={`/noticia/${m.id}`}
                className="block px-3.5 py-2.5 hover:bg-zinc-900/70 transition-colors"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono text-[9px] uppercase tracking-widest border rounded px-1.5 py-0.5 ${TAG_COLOR[m.tag] || TAG_COLOR.INFO}`}>
                    {m.tag}
                  </span>
                  <span className="text-[13px] leading-snug text-zinc-200">{m.titulo}</span>
                </div>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                  {m.fuente} · hace {haceDe(m.fecha)}
                </p>
              </Link>
            ))}
            {!movimientos.length && (
              <p className="px-3.5 py-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Hoy no hay movimientos con ese olor — el planeta respira tranquilo.
              </p>
            )}
          </div>
        </section>

        {/* v242.0 CONECTA CON EL NÚCLEO (patrón v230/v236) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-5 pb-8">
          <EnlacesNucleo enlaces={PUERTAS_DEL_RADAR} titulo="CONECTA CON EL NÚCLEO" />
        </section>

        {/* pie: al globo */}
        <section className="max-w-7xl mx-auto px-4 sm:px-5 pb-14">
          <Link
            href="/mundo"
            className="group block border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-zinc-950/40 to-transparent rounded-md p-4 hover:border-amber-400/80 transition-colors"
          >
            <p className="font-display text-lg font-black tracking-wide text-soft group-hover:text-amber-200 transition-colors">
              VER LOS GOBIERNOS EN EL MUNDO 3D ▸
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Cada capital, organización y garganta estratégica del radar, en su
              sitio exacto del planeta — con las guerras encendidas en vivo.
            </p>
          </Link>
        </section>

        {/* v242.0 noscript HONESTO — el radar ES server-rendered: el índice,
            las escuchas y los movimientos se leen enteros sin JavaScript.
            Lo único que necesita JS es el botón SONPEAR DE NUEVO (v190:
            nada se refresca solo). La casa lo dice en vez de fingir. */}
        <noscript>
          <div className="border-t border-zinc-800 bg-zinc-900/80 px-5 py-8 text-center">
            <p className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-cyan-300">
              <VanguardMarkSvg size={14} idPrefix="espia-ns" /> VANGUARD · MODO ESPÍA
            </p>
            <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
              Este radar se lee entero sin JavaScript — el índice, las escuchas
              y los movimientos ya están aquí. Solo el botón «SONPEAR DE NUEVO»
              lo necesita. Las puertas de la casa siguen abiertas:
            </p>
            <p className="mt-3 flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/guerra-hoy" className="text-cyan-300 underline">
                PRIMERA PÁGINA
              </Link>
              <Link href="/ver-guerra" className="text-cyan-300 underline">
                EL MAPA DEL FRENTE
              </Link>
              <Link href="/nucleo" className="text-cyan-300 underline">
                LA BÚSQUEDA
              </Link>
            </p>
          </div>
        </noscript>
      </main>
    </>
  );
}
