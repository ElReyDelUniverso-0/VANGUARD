import type { Metadata } from "next";
import Link from "next/link";
import { HISTORICAL_WARS } from "@/lib/game-data";
import { buildInstantaneaMundo, type InstantaneaMundo } from "@/lib/mundo-datos";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { BarraMundo } from "@/components/vanguard/barra-mundo";
import { Mundo3DVivo } from "./mundo-3d-vivo";

// v215.0 EL MUNDO — «Vanguard debe ser un mundo 3D donde se vea EN VIVO
// las guerras de todo el mundo, ciudades y lugares importantes en 3D».
// Página server: la instantánea del planeta (cables reales de 24 h por
// teatro) viaja con el primer byte; el client sondea /api/mundo cada
// 60 s — la página JAMÁS se recarga (ley v190) y el globo respira.
// JSON-LD CollectionPage para Google; noscript honesto (ley v210).
//
// v264.0 EL ÍNDICE DEL PLANETA — la instantánea ya viajaba viva (peso de
// 24 h, último titular y fuente por teatro) pero su capa server nunca
// sirvió las puertas: sin JavaScript el planeta era un hueco y para
// Google los teatros eran un párrafo sin enlaces. El índice deriva TODO
// de la instantánea que la página ya sostiene (cero consultas de más):
// los 9 teatros con su peso real de 24 h, su último titular como puerta
// a /noticia y su sala /conflicto a un toque. Teatro sin señal en 24 h
// se declara honesto (medido en esta ronda: la BD lleva 96 h sin cable
// nuevo — las 9 salas quedan abiertas y el índice lo declara): la puerta
// no se apaga porque la señal pause.
//
// v278.0 LA MEMORIA EN EL PLANETA — el archivo de la historia (v274,
// 10 guerras reales con lat/lng EN LA FUENTE) enciende el globo: cada
// guerra del archivo viaja como marca del planeta con SUS coordenadas
// reales, y la puerta ?guerra= nace seleccionada y enfocada (mismo
// patrón ?teatro= de la v264). La validación es contra la fuente real
// (HISTORICAL_WARS.find por id exacto) — la puerta no inventa guerras:
// la pedida que no existe se declara honesta. /historia abre la puerta
// de vuelta desde cada carta. Directiva v266: el archivo vive en la
// fuente (game-data.ts), no en esta sala. Cero fechas a mano — los
// periodos se componen desde los años reales (guardia v234).

export const revalidate = 60;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "EL MUNDO 3D — las guerras del planeta en vivo | VANGUARD",
  description:
    "El planeta entero en un globo 3D: guerras en vivo de todo el mundo con sus cables reales de las últimas 24 horas, gobiernos, organizaciones y gargantas estratégicas del planeta como marcas 3D. Rota, acércate y toca cualquier teatro de guerra. Gratis, en español.",
  alternates: { canonical: `${SITE_URL}/mundo` },
  openGraph: {
    title: "EL MUNDO 3D — las guerras del planeta en vivo · VANGUARD",
    description:
      "Todas las guerras del mundo girando en un globo 3D, con gobiernos, ONU, OTAN y los estrechos que sostienen el planeta. En vivo, minuto a minuto.",
    url: `${SITE_URL}/mundo`,
    siteName: "VANGUARD",
    type: "website",
  },
};

// v264.0 — la edad de la señal, la gramática de la casa (cero fechas
// escritas a mano, guardia v234).
function hace(fecha: string): string {
  const min = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

// ── v278.0 LA MEMORIA EN EL PLANETA — TODO derivado de HISTORICAL_WARS, nada a mano ──
// el año compuesto honesto (misma gramática que /historia): el negativo
// es antes de Cristo y se compone desde el número real de la fuente
function ano(n: number): string {
  return n < 0 ? `${-n} a. C.` : `${n}`;
}

// la capa de memoria que viaja al globo: slim por diseño (el cliente
// recibe lo que pinta, la fuente completa no cruza a la batería client)
const GUERRAS_MEMORIA = HISTORICAL_WARS.map((g) => ({
  id: g.id,
  name: g.name,
  lat: g.lat,
  lng: g.lng,
  region: g.region,
  periodo: `${ano(g.yearStart)} – ${ano(g.yearEnd)}`,
  outcome: g.outcome,
}));

const ANO_INICIO_MEMORIA = HISTORICAL_WARS.reduce((min, g) => (g.yearStart < min ? g.yearStart : min), 0);
const ANO_FIN_MEMORIA = HISTORICAL_WARS.reduce((max, g) => (g.yearEnd > max ? g.yearEnd : max), 0);

// lección v256: la línea se compone COMPLETA en JS — un solo nodo, si la
// fuente cambia la línea cambia sola
const lineaMemoria = `La memoria en el planeta — ${GUERRAS_MEMORIA.length} guerras históricas del archivo encendidas en el globo con sus coordenadas reales, de ${ano(ANO_INICIO_MEMORIA)} a ${ano(ANO_FIN_MEMORIA)}: tócalas en el planeta o pide la tuya con ?guerra=`;

interface Props {
  searchParams: Promise<{ teatro?: string; guerra?: string }>;
}

export default async function MundoPage({ searchParams }: Props) {
  const { teatro, guerra } = await searchParams;
  const teatroInicial = teatro && teatro.length <= 32 ? teatro.slice(0, 32) : null;
  // v278.0 — la puerta de la memoria: validada contra la fuente real por
  // id exacto (la casa no inventa la guerra que la URL pide); la pedida
  // que no existe se declara honesta en la sección de abajo
  const candidatoGuerra = guerra && guerra.length <= 40 ? guerra.slice(0, 40) : null;
  const guerraPedida = candidatoGuerra
    ? (HISTORICAL_WARS.find((g) => g.id === candidatoGuerra) ?? null)
    : null;

  let teatros = 0;
  let hoy = 0;
  let paises = 0;
  let inicial: InstantaneaMundo | null = null;
  try {
    const snap = await buildInstantaneaMundo();
    teatros = snap.teatros.filter((t) => t.n > 0).length;
    hoy = snap.hoy;
    paises = snap.paises;
    inicial = snap;
  } catch (e) {
    console.error("mundo page error", e);
  }

  const lineaIndice = `El índice del planeta — ${teatros} teatros vivos, ${hoy} cables en las últimas 24 h`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "EL MUNDO 3D — las guerras del planeta en vivo",
    description:
      "Globo 3D de Vanguard: guerras en vivo de todo el mundo, gobiernos, organizaciones internacionales y gargantas estratégicas como marcas 3D. Actualización cada 60 segundos.",
    url: `${SITE_URL}/mundo`,
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
        <BarraMundo activa="mundo" />

        {/* cabecera del planeta */}
        <header className="max-w-7xl mx-auto px-4 sm:px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.25em] uppercase text-amber-300 border border-amber-500/50 bg-amber-500/10 rounded px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
              En vivo · 60 s
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wide text-soft">
              EL MUNDO 3D
            </h1>
          </div>
          <p className="mt-2 max-w-3xl text-[13px] text-muted-foreground leading-relaxed">
            El planeta entero girando: cada teatro de guerra encendido con sus
            cables reales de las últimas 24 horas ({teatros} teatros vivos,{" "}
            {hoy} cables, {paises} países), los gobiernos que deciden, la ONU y
            la OTAN que reaccionan y los estrechos que sostienen el comercio.
            Arrastra para rotar, rueda para acercarte, toca cualquier marca.
          </p>
        </header>

        {/* el globo + el panel vivo */}
        <section className="max-w-7xl mx-auto px-4 sm:px-5 pb-10">
          <Mundo3DVivo
            inicial={inicial}
            teatroInicial={teatroInicial}
            guerras={GUERRAS_MEMORIA}
            guerraInicialId={guerraPedida?.id ?? null}
          />
        </section>

        {/* v264.0 EL ÍNDICE DEL PLANETA — los teatros del mapa con puerta:
            derivado de la MISMA instantánea del primer byte (cero consultas
            de más); sin BD la sección ni se pinta (vacío honesto). */}
        {inicial && (
          <section
            className="max-w-7xl mx-auto px-4 sm:px-5 pb-12"
            aria-label="El índice del planeta — los teatros del mapa con puerta"
          >
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-amber-300/90 border-b border-zinc-800 pb-2">
              {lineaIndice}
            </h2>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {inicial.teatros.map((t) => {
                // lección v256: peso y edad compuestos COMPLETOS en JS —
                // el SSR pinta cada línea sin nodos partidos
                const linea = t.ultimo
                  ? `${t.n} cables en 24 h · última señal hace ${hace(t.ultimo.fecha)}`
                  : "sin señal en 24 h — la sala queda abierta";
                const firma = t.ultimo
                  ? `${t.ultimo.f} · hace ${hace(t.ultimo.fecha)}`
                  : null;
                return (
                  <article
                    key={t.slug}
                    className="border border-zinc-800 hover:border-amber-500/50 rounded-md p-3.5 bg-zinc-900/40 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display font-bold text-soft">
                        <Link
                          href={`/conflicto/${t.slug}`}
                          className="hover:text-amber-300 transition-colors"
                        >
                          {t.nombre}
                        </Link>
                      </h3>
                      <span className="font-mono text-[9px] text-zinc-500 shrink-0">
                        {linea}
                      </span>
                    </div>
                    {t.ultimo && firma && (
                      <p className="mt-1.5 text-[12px] text-muted-foreground leading-relaxed">
                        <Link
                          href={`/noticia/${t.ultimo.id}`}
                          className="hover:text-amber-300 transition-colors"
                        >
                          {t.ultimo.t}
                        </Link>
                        <span className="block mt-0.5 font-mono text-[10px] text-zinc-600">
                          {firma}
                        </span>
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* v278.0 LA MEMORIA EN EL PLANETA — el archivo (10 guerras reales
            con lat/lng en la fuente) encendido en el globo: la puerta
            ?guerra= nace seleccionada (patrón ?teatro= v264) y la pedida
            que no existe se declara honesta. La capa no depende de la
            señal viva: funciona incluso con la BD fría. Directiva v266:
            el archivo vive en la fuente (game-data.ts), no en esta sala. */}
        <section
          className="max-w-7xl mx-auto px-4 sm:px-5 pb-12"
          aria-label="La memoria en el planeta — el archivo de la historia en el globo"
        >
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-pink-300 border-b border-zinc-800 pb-2">
            {lineaMemoria}
          </h2>
          {guerraPedida ? (
            <article className="mt-3 border border-pink-500/40 bg-zinc-900/40 rounded-md p-4">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h3 className="font-display font-bold text-soft">{guerraPedida.name}</h3>
                <span className="font-mono text-[10px] text-zinc-500 whitespace-nowrap">
                  {`${ano(guerraPedida.yearStart)} – ${ano(guerraPedida.yearEnd)}`}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-zinc-500">
                {`${guerraPedida.region} — ${guerraPedida.lat.toFixed(1)}°, ${guerraPedida.lng.toFixed(1)}°`}
              </p>
              <p className="mt-2 text-[12px] text-muted-foreground leading-relaxed">
                {guerraPedida.summary}
              </p>
              <p className="mt-2 font-mono text-[10px] text-cyan-hud">
                {`desenlace: ${guerraPedida.outcome}`}
              </p>
              <p className="mt-2.5 flex gap-4 flex-wrap font-mono text-[10px] uppercase tracking-widest">
                <Link
                  href={`/historia#${guerraPedida.id}`}
                  className="text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Su ficha en el archivo ▸
                </Link>
                <Link href="/mundo" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                  Ver el planeta sin puerta ▸
                </Link>
              </p>
            </article>
          ) : (
            <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
              {candidatoGuerra
                ? `La puerta ?guerra=${candidatoGuerra} no encontró ninguna guerra del archivo — las ${GUERRAS_MEMORIA.length} del archivo viven en /historia, cada una con su puerta al globo.`
                : `Las ${GUERRAS_MEMORIA.length} marcas rosas del globo son el archivo de la historia, cada una con sus coordenadas reales de la fuente: toca una (o pídela con ?guerra=) y el planeta te lleva a ella; cada carta de /historia abre su puerta al globo.`}
            </p>
          )}
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            El archivo vive en la fuente (game-data.ts), no en esta sala — directiva v266.
          </p>
        </section>

        {/* la casa completa — sin salir de Vanguard */}
        <section className="max-w-7xl mx-auto px-4 sm:px-5 pb-12 grid gap-3 sm:grid-cols-3">
          <Link
            href="/espia"
            className="group border border-cyan-500/30 bg-zinc-900/40 rounded-md p-4 hover:border-cyan-400/70 transition-colors"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-300">
              ESPÍA ◈
            </p>
            <p className="mt-1 font-display font-bold text-soft group-hover:text-cyan-200 transition-colors">
              Espiar los gobiernos
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Escuchas oficiales (ONU Noticias, Sala de Prensa de la ONU,
              ReliefWeb, OMS), índice de tensión y movimientos de gobierno —
              todo de fuentes abiertas.
            </p>
          </Link>
          <Link
            href="/en-vivo"
            className="group border border-red-500/30 bg-zinc-900/40 rounded-md p-4 hover:border-red-400/70 transition-colors"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-red-300">
              EL PULSO ●
            </p>
            <p className="mt-1 font-display font-bold text-soft group-hover:text-red-200 transition-colors">
              Última hora minuto a minuto
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              La redacción abierta 24 h: cada cable entra solo, con su hora, su
              fuente y su sello de exactitud.
            </p>
          </Link>
          <Link
            href="/traductor"
            className="group border border-sky-500/30 bg-zinc-900/40 rounded-md p-4 hover:border-sky-400/70 transition-colors"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-sky-300">
              TRADUCTOR ⇄
            </p>
            <p className="mt-1 font-display font-bold text-soft group-hover:text-sky-200 transition-colors">
              El mundo en tu idioma
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Traduce cualquier texto y los últimos cables a los 8 idiomas de
              Vanguard: ES · EN · PT · FR · DE · IT · ZH · RU.
            </p>
          </Link>
        </section>

        {/* contenido rastreable para Google (server-rendered) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-5 pb-16 text-[12px] text-muted-foreground leading-relaxed">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
            Qué es EL MUNDO 3D de Vanguard
          </h2>
          <p className="mt-2 max-w-4xl">
            Un mapa 3D del planeta con las guerras de hoy encendidas en tiempo
            real: Ucrania, Gaza e Israel, Ormuz y el Golfo, Taiwán, el Sahel, el
            Mar Rojo, las Coreas, Sudán y el Líbano. Cada teatro muestra cuántos
            cables reales ha producido en las últimas 24 horas y su último
            titular verificado. Alrededor, las plazas del poder: Washington,
            Moscú, Pekín, Bruselas (OTAN), Nueva York (ONU) y las gargantas
            estratégicas — Ormuz, Babel-Mandeb, Suez, Panamá, Malaca, la central
            de Zaporiyia y el Ártico. Los arcos conectan las principales líneas
            de fricción: Rusia▸Ucrania, Irán▸Israel, China▸Taiwán, Coreas,
            Yemen▸Mar Rojo y Pakistán▸India.
          </p>
        </section>
      </main>
      <noscript>
        <div className="max-w-7xl mx-auto px-5 pb-12">
          <p className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
            ◉ VANGUARD · EL MUNDO
          </p>
          <p className="mt-2 text-sm text-zinc-400 max-w-md">
            El globo 3D necesita JavaScript. Lee las guerras de hoy en{" "}
            <Link href="/guerra-hoy" className="text-amber-400 underline">
              /guerra-hoy
            </Link>{" "}
            o entra a la sala{" "}
            <Link href="/en-vivo" className="text-amber-400 underline">
              /en-vivo
            </Link>
            ; el archivo de la historia (las {GUERRAS_MEMORIA.length} guerras con sus años y
            su desenlace, y su puerta al globo) funciona sin JavaScript en{" "}
            <Link href="/historia" className="text-amber-400 underline">
              /historia
            </Link>
            .
          </p>
        </div>
      </noscript>
    </>
  );
}
