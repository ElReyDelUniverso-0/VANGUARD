// ============================================================
// v402.3 LAS DIEZ LLAVES (app/herramientas/page.tsx)
//
// Orden del Dueño: «extraer herramientas que existen en el internet a una
// lista de 10 herramientas API que cambiarían Vanguard para siempre y
// agregarlas ahora mismo».
//
// Lo que esta sala es: el TALLER de la casa. Diez fuentes externas que ya
// están dentro y que se sirven con dato vivo, y seis que esperan llave —
// declaradas, nunca fingidas.
//
// Lo que esta sala NO es: una copia. No se trae ni una línea de código, ni un
// color, ni una marca de esas herramientas. Se extrae el NÚMERO y se pinta con
// la tipografía, la escala y la honestidad de VANGUARD (pilar 3 del Dueño).
//
// Reglas que cumple:
//   · cero cifras a mano (v234): todo número sale de la respuesta de la fuente
//     y se calcula en el render; si la fuente no contesta, la ficha lo dice.
//   · componente de servidor: cero JavaScript enviado al navegador.
//   · caché de 15 minutos (revalidate): no se castiga a quien presta el dato.
//   · cada ficha lleva organismo, licencia y la hora del dato.
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { GraficoBarras } from "@/components/vanguard/grafico-barras";
import {
  ESPERAN_LLAVE,
  HERRAMIENTAS,
  todasLasSenales,
  type Senal,
} from "@/lib/herramientas-externas";

export const revalidate = 900;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "LAS DIEZ LLAVES — herramientas externas dentro de la casa",
  description:
    "Diez fuentes de datos abiertas que VANGUARD consulta en vivo: sismos del USGS, eventos naturales de la NASA, alertas de GDACS, pobreza del Banco Mundial, desplazamiento de ACNUR, efemérides de Wikimedia, clima y aire de Open-Meteo, el cambio del BCE y el precio de bitcoin. Con organismo, licencia y fecha en cada cifra, y las seis fuentes que esperan llave declaradas aparte.",
  alternates: { canonical: `${SITE_URL}/herramientas` },
  openGraph: {
    title: "LAS DIEZ LLAVES — el taller de fuentes externas de VANGUARD",
    description:
      "El mundo medido por otros, servido por esta casa: diez fuentes abiertas con dato vivo y seis que esperan llave, cada una con su organismo y su licencia.",
    url: `${SITE_URL}/herramientas`,
    siteName: "VANGUARD",
    type: "website",
  },
};

const ACENTO = "#22d3ee";

function Ficha({
  numero,
  nombre,
  organismo,
  queCambia,
  licencia,
  llave,
  senal,
  acento,
}: {
  numero: number;
  nombre: string;
  organismo: string;
  queCambia: string;
  licencia: string;
  llave: string | null;
  senal: Senal | null;
  acento: string;
}) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em]" style={{ color: acento }}>
          {String(numero).padStart(2, "0")} · {llave ? "CON LLAVE" : "ABIERTA"}
        </p>
        <p className="font-mono text-[10px] text-slate-500">{licencia}</p>
      </div>

      <h3 className="mt-1 font-mono text-[15px] font-black uppercase leading-tight tracking-tight text-white">
        {nombre}
      </h3>
      <p className="mt-0.5 font-mono text-[10.5px] text-slate-500">{organismo}</p>

      {senal ? (
        <p className="mt-3 flex items-baseline gap-2">
          <span
            className="font-mono text-2xl font-black tabular-nums leading-none"
            style={{ color: acento }}
          >
            {senal.valor}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
            {senal.unidad}
          </span>
        </p>
      ) : (
        <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-slate-500">
          sin señal · la fuente no contestó · no se inventa un cero
        </p>
      )}

      {senal ? (
        <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{senal.detalle}</p>
      ) : null}

      <p className="mt-2 border-t border-slate-800/80 pt-2 text-[12px] leading-relaxed text-slate-300">
        {queCambia}
      </p>
    </article>
  );
}

export default async function HerramientasPage() {
  const { senales, barrasSismos, barrasEventos } = await todasLasSenales();

  const porId = new Map(senales.map((s) => [s.id, s]));
  const vivas = HERRAMIENTAS.filter((h) => porId.has(h.id)).length;
  const total = HERRAMIENTAS.length;

  // Las cifras de la portada salen de las señales, no de una lista escrita.
  const sismos = porId.get("usgs-sismos");
  const eventos = porId.get("eonet-eventos");
  const gdacs = porId.get("gdacs-alertas");

  return (
    <>
      <PortadaSala
        imagen="/ilustraciones/radar.jpg"
        alt="Antena de radar barriendo el horizonte: la casa escuchando las fuentes abiertas del mundo"
        volanta="EL TALLER · FUENTES EXTERNAS"
        titulo="LAS DIEZ LLAVES"
        sumario="Diez herramientas que ya existen en el internet y que esta casa ha abierto: el dato entra vivo, se pinta en la voz de VANGUARD y lleva su organismo y su fecha. Seis más esperan llave y se declaran sin vergüenza."
        acento={ACENTO}
        cifras={[
          { valor: `${vivas}/${total}`, etiqueta: "fuentes vivas ahora", nota: "consultadas en el render" },
          ...(sismos ? [{ valor: sismos.valor, etiqueta: sismos.unidad, nota: "USGS, últimas 24 h" }] : []),
          ...(eventos ? [{ valor: eventos.valor, etiqueta: eventos.unidad, nota: "NASA EONET" }] : []),
          ...(gdacs ? [{ valor: gdacs.valor, etiqueta: gdacs.unidad, nota: "GDACS, ONU y CE" }] : []),
        ]}
        puntos={[
          {
            titulo: "EL DATO, NO LA MARCA",
            texto:
              "No se copia código, ni color, ni diseño ajeno: se extrae el número y se sirve en la tipografía de esta casa.",
          },
          {
            titulo: "SIN SEÑAL SE DICE",
            texto:
              "Si una fuente no contesta, la ficha lo declara. Un cero falso sería peor que un hueco.",
          },
          {
            titulo: "CON ORGANISMO Y LICENCIA",
            texto:
              "Cada cifra lleva quién la publica, bajo qué licencia y de qué fecha es.",
          },
        ]}
        anclas={[
          { etiqueta: "LAS DIEZ", href: "#diez" },
          { etiqueta: "LAS ESCALAS", href: "#escalas" },
          { etiqueta: "LAS QUE ESPERAN LLAVE", href: "#llaves" },
          { etiqueta: "LA REGLA", href: "#regla" },
        ]}
        nota="Fuentes abiertas consultadas en el servidor con caché de 15 minutos. Ninguna llave privada vive en esta página."
      />

      <main className="mx-auto max-w-6xl px-5 pb-16">
        <section id="diez" className="pt-10" aria-labelledby="diez-titulo">
          <h2
            id="diez-titulo"
            className="font-mono text-xl font-black uppercase tracking-tight text-white"
          >
            LAS DIEZ QUE YA ESTÁN DENTRO
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">
            {vivas === total
              ? "Las diez contestaron en este render: la casa está escuchando el mundo entero."
              : `${vivas} de ${total} contestaron en este render. Las demás lo dicen en su ficha, con la misma letra con la que darían la cifra.`}{" "}
            Toca cualquiera para ver su endpoint y su licencia al pie de la página.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HERRAMIENTAS.map((h, i) => (
              <Ficha
                key={h.id}
                numero={i + 1}
                nombre={h.nombre}
                organismo={h.organismo}
                queCambia={h.queCambia}
                licencia={h.licencia}
                llave={h.llave}
                senal={porId.get(h.id) ?? null}
                acento={h.acento}
              />
            ))}
          </div>
        </section>

        <div id="escalas" className="pt-4">
          {barrasEventos.length > 1 ? (
            <GraficoBarras
              id="grafico-eventos"
              volanta="LA TIERRA ABIERTA · NASA EONET"
              titulo="QUÉ ESTÁ PASANDO AHORA MISMO EN EL PLANETA"
              nota="Los eventos naturales abiertos, contados por categoría y medidos contra la categoría más frecuente de hoy."
              unidad="eventos abiertos"
              acento="#ef4444"
              etiquetaMaximo="la categoría más frecuente de hoy"
              barras={barrasEventos.map((b) => ({
                etiqueta: b.etiqueta,
                valor: b.valor,
                texto: b.texto,
                href: "#diez",
              }))}
            />
          ) : null}

          {barrasSismos.length > 1 ? (
            <GraficoBarras
              id="grafico-sismos"
              volanta="EL PULSO · USGS"
              titulo="LOS CINCO TEMBLORES MAYORES DE HOY"
              nota="Magnitud de los cinco mayores sismos de las últimas 24 horas, medida contra el mayor de la serie."
              unidad="magnitud"
              acento="#f97316"
              etiquetaMaximo="el mayor de hoy"
              barras={barrasSismos.map((b) => ({
                etiqueta: b.etiqueta,
                valor: b.valor,
                texto: b.texto,
                nota: b.nota,
                href: "#diez",
              }))}
            />
          ) : null}
        </div>

        <section id="llaves" className="pt-4" aria-labelledby="llaves-titulo">
          <h2
            id="llaves-titulo"
            className="font-mono text-xl font-black uppercase tracking-tight text-white"
          >
            LAS SEIS QUE ESPERAN LLAVE
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">
            Estas fuentes existen y son buenas, pero piden una llave. Aquí quedan
            encendidas en la lista y apagadas en el dato: se dice qué variable de
            entorno esperan, para que el Dueño decida. Ninguna cifra de este bloque
            está simulada — no hay cifra.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ESPERAN_LLAVE.map((h, i) => (
              <article
                key={h.id}
                className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.28em]"
                    style={{ color: h.acento }}
                  >
                    {String(i + 1).padStart(2, "0")} · ESPERA LLAVE
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">{h.licencia}</p>
                </div>
                <h3 className="mt-1 font-mono text-[15px] font-black uppercase leading-tight tracking-tight text-white">
                  {h.nombre}
                </h3>
                <p className="mt-0.5 font-mono text-[10.5px] text-slate-500">{h.organismo}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-300">{h.queCambia}</p>
                <p className="mt-2 inline-flex rounded border border-slate-800 bg-slate-900/80 px-2 py-0.5 font-mono text-[10px] tracking-wider text-slate-400">
                  {h.llave}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="regla" className="pt-10" aria-labelledby="regla-titulo">
          <h2
            id="regla-titulo"
            className="font-mono text-xl font-black uppercase tracking-tight text-white"
          >
            LA REGLA CON LA QUE ENTRAN
          </h2>
          <ul className="mt-4 grid gap-2 text-[13px] leading-relaxed text-slate-300 sm:grid-cols-2">
            <li className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <b className="text-white">El número manda.</b> Cada barra se mide contra
              la mayor de su propia serie y la cifra va siempre escrita: una barra sin
              número es una opinión dibujada.
            </li>
            <li className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <b className="text-white">Sin llave no hay dato.</b> Las fuentes que piden
              registro no se simulan: se declaran y se esperan.
            </li>
            <li className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <b className="text-white">Se cita al que trabaja.</b> Organismo, licencia y
              fecha en cada ficha: el mérito del dato es de quien lo publica.
            </li>
            <li className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <b className="text-white">Se copia el dato, no el diseño.</b> Ni una línea
              de código ajena dentro de la casa: solo el número, servido a la manera de
              VANGUARD.
            </li>
          </ul>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            endpoints a la vista ·{" "}
            {HERRAMIENTAS.map((h, i) => (
              <span key={h.id}>
                {i > 0 ? " · " : ""}
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 underline decoration-slate-700 underline-offset-2 hover:text-cyan-300"
                >
                  {h.id}
                </a>
              </span>
            ))}
          </p>
          <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
            Hermana de{" "}
            <Link href="/pulso-mundial" className="text-emerald-300 underline underline-offset-2">
              WORLD PULSE
            </Link>{" "}
            (los indicadores del Banco Mundial ya horneados) y de{" "}
            <Link href="/archivo-mundial" className="text-amber-300 underline underline-offset-2">
              EL ARCHIVO
            </Link>{" "}
            (las guerras en una sola escala).
          </p>
        </section>
      </main>
    </>
  );
}
