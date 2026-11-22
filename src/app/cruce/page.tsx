// ============================================================
// v402.4 LA DISTANCIA DE CASA (app/cruce/page.tsx)
//
// Lo que el Dueño pidió después de las diez llaves: «sigue agregando todo eso
// y hazlo más único». Aquí está lo más único que la casa puede presumir sin
// inventar un solo número:
//
//   EL CRUCE. Ninguna de las fuentes del mundo dice, por sí sola, a qué
//   distancia de esta casa ocurrió lo que pasó hoy. Se puede CALCULAR: USGS
//   entrega la coordenada de cada sismo, GDACS la de cada alerta y su nivel, y
//   entre las dos se mide con la fórmula de la esfera (haversine).
//
// Reglas de siempre:
//   · cero cifras a mano (v234): los kilómetros se calculan en el render a
//     partir de las coordenadas que publican USGS y GDACS.
//   · sin señal se dice: si una fuente no contesta, su bloque lo declara.
//   · componente de SERVIDOR: cero JavaScript al navegador.
//   · las barras se miden contra la MÁS LEJANA de la lista, y se explica: en
//     esta sala una barra corta significa «cerca», no «poco».
// ============================================================

import type { Metadata } from "next";
import Link from "next/link";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { GraficoBarras } from "@/components/vanguard/grafico-barras";
// v402.5 — los hechos del día, en su eje (no en diez párrafos)
import { EjeDelDia } from "@/components/vanguard/eje-del-dia";
import { db } from "@/lib/db";
import {
  CASA,
  alertasCercanas,
  efemeridesDelDia,
  efemeridesEnLista,
  eventosNaturales,
  cruceConPaises,
  loMasCercaDeCasa,
  sismosCercanos,
  sismosDelDia,
  todasLasSenales,
} from "@/lib/herramientas-externas";

export const revalidate = 900;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "EL CRUCE — a qué distancia de casa pasó lo de hoy | VANGUARD",
  description:
    "El cruce que nadie más hace: los sismos del día (USGS) y las alertas humanitarias (GDACS) ordenados por la distancia real, en kilómetros calculados, hasta esta casa. Más el parte del planeta (NASA EONET) y lo que ocurrió un día como hoy (Wikimedia). Cero cifras inventadas.",
  alternates: { canonical: `${SITE_URL}/cruce` },
  openGraph: {
    title: "EL CRUCE — lo que pasó hoy, medido desde esta casa",
    description:
      "Sismos y alertas del mundo ordenados por cercanía real, en kilómetros calculados en el render. La distancia la pone la fórmula; los datos, USGS y GDACS.",
    url: `${SITE_URL}/cruce`,
    siteName: "VANGUARD",
    type: "website",
  },
};

const ACENTO = "#f43f5e";

const nf = new Intl.NumberFormat("es-ES");

function Fila({
  medida,
  titulo,
  lugar,
  km,
  acento,
}: {
  medida: string;
  titulo: string;
  lugar: string;
  km: number;
  acento: string;
}) {
  return (
    <li className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate font-mono text-[11.5px] text-slate-300">
          <span className="font-bold text-white">{medida}</span> · {titulo}
        </p>
        <p className="shrink-0 font-mono text-[11.5px] font-bold tabular-nums" style={{ color: acento }}>
          {nf.format(km)} km
        </p>
      </div>
      <p className="mt-0.5 truncate font-mono text-[10px] text-slate-500">{lugar}</p>
    </li>
  );
}

export default async function CrucePage() {
  const [cerca, sismos, senales, efemerides, listaEfemerides, eventos] = await Promise.all([
    loMasCercaDeCasa(),
    sismosDelDia(),
    todasLasSenales(),
    efemeridesDelDia().catch(() => null),
    efemeridesEnLista(8).catch(() => []),
    eventosNaturales().catch(() => ({ senal: null, barras: [] })),
  ]);

  const { sismos: sismosCerca, alertas: alertasCerca } = cerca;

  // v402.6 — DÓNDE TIEMBLA Y QUIÉN LO CUENTA: cada sismo se empareja con la
  // capital real más cercana (atlas-data) y ese país se cruza con el archivo
  // de la casa. Si la base no contesta, el bloque lo declara: nunca un cero.
  const conPais = await cruceConPaises(12).catch(() => ({ sismos: [], alertas: [] }));
  // v402.9 — EL CRUCE CUADRA: país y sismo salen JUNTOS de la misma fila.
  // (En la v402.8 el país salía de un mapa por id y el sismo de un segundo
  //  `find`, y podían acabar siendo dos temblores distintos: la tarjeta decía
  //  528 km al lado de un sismo que estaba a 236. Un dato incoherente es peor
  //  que ninguno.) Ahora se elige el evento con la capital más cercana por
  //  país y se pinta ESE MISMO evento con ESE MISMO kilómetro.
  const paisesDelDia: { pais: NonNullable<(typeof conPais.sismos)[number]["pais"]>; sismo: (typeof conPais.sismos)[number] }[] = [];
  for (const e of conPais.sismos) {
    if (!e.pais) continue;
    const ya = paisesDelDia.find((x) => x.pais.id === e.pais!.id);
    if (!ya) paisesDelDia.push({ pais: e.pais, sismo: e });
    else if (e.pais.kmCapital < ya.pais.kmCapital) {
      ya.pais = e.pais;
      ya.sismo = e;
    }
  }
  paisesDelDia.sort((a, b) => a.pais.kmCapital - b.pais.kmCapital);
  paisesDelDia.length = Math.min(paisesDelDia.length, 4);

  const cablesPorPais = new Map<string, number | null>();
  for (const { pais: p } of paisesDelDia) {
    try {
      cablesPorPais.set(
        p.id,
        await db.newsItem.count({
          where: {
            OR: [
              { sourceCountry: p.id },
              { sourceCountry: p.id.toUpperCase() },
            ],
          },
        })
      );
    } catch {
      cablesPorPais.set(p.id, null); // sin archivo: se declara
    }
  }

  // Cifras de la portada: derivadas de lo que se acaba de calcular.
  const sismoMasCerca = sismosCerca[0];
  const alertaMasCerca = alertasCerca[0];
  const vivas = senales.senales.length;
  const totalFuentes = 10;

  // Las barras se miden contra la más LEJANA de la lista corta (así la barra
  // más corta es la más cercana), y el gráfico lo dice en su nota.
  const barrasSismos = sismosCerca.map((s) => ({
    etiqueta: s.lugar,
    valor: s.km,
    texto: `${nf.format(s.km)} km`,
    nota: s.medida,
    href: "#sismos-cerca",
  }));

  const barrasAlertas = alertasCerca.map((a) => ({
    etiqueta: a.lugar,
    valor: a.km,
    texto: `${nf.format(a.km)} km`,
    nota: a.medida,
    href: "#alertas-cerca",
  }));

  return (
    <>
      <PortadaSala ruta="/cruce"
        imagen="/imagenes-reales/satelite.jpg"
        alt="El planeta visto desde arriba, con una línea marcando la distancia de un punto a otro"
        volanta="EL CRUCE · LO QUE PASÓ HOY, MEDIDO DESDE CASA"
        titulo="LA DISTANCIA DE CASA"
        sumario="Cada sismo del día y cada alerta humanitaria, ordenados por lo lejos que quedaron de esta casa. Los kilómetros los calcula la fórmula con las coordenadas que publican USGS y GDACS; nadie más los pone en la misma pantalla."
        acento={ACENTO}
        cifras={[
          ...(sismoMasCerca
            ? [
                {
                  valor: nf.format(sismoMasCerca.km),
                  etiqueta: "km al sismo más cercano",
                  nota: sismoMasCerca.lugar,
                },
              ]
            : []),
          ...(alertaMasCerca
            ? [
                {
                  valor: nf.format(alertaMasCerca.km),
                  etiqueta: "km a la alerta más cercana",
                  nota: `${alertaMasCerca.medida} · ${alertaMasCerca.lugar}`,
                },
              ]
            : []),
          {
            valor: `${vivas}/${totalFuentes}`,
            etiqueta: "fuentes contestando",
            nota: "en este render",
          },
          ...(eventos.senal
            ? [{ valor: eventos.senal.valor, etiqueta: eventos.senal.unidad, nota: "NASA EONET" }]
            : []),
        ]}
        puntos={[
          {
            titulo: "LA FÓRMULA, NO LA OPINIÓN",
            texto:
              "Los kilómetros salen de la distancia sobre la esfera (haversine, radio medio de 6.371 km) con las coordenadas que publica cada organismo.",
          },
          {
            titulo: "BARRA CORTA = CERCA",
            texto:
              "En esta sala las barras se miden contra lo más lejano de la lista, y se explica: aquí una barra corta no significa «poco», significa «al lado».",
          },
          {
            titulo: "DOS MUNDOS EN UNA PANTALLA",
            texto:
              "Lo que tembló, lo que alertó la ONU y lo que ocurrió un día como hoy: el presente medido y el pasado recordado, juntos.",
          },
        ]}
        anclas={[
          { etiqueta: "SISMOS CERCA", href: "#sismos-cerca" },
          { etiqueta: "ALERTAS CERCA", href: "#alertas-cerca" },
          { etiqueta: "GRAFOS", href: "#grafos" },
          { etiqueta: "UN DÍA COMO HOY", href: "#efemerides" },
        ]}
        nota={`Punto de mira: ${CASA.nombre} (${CASA.lat.toFixed(4)}°, ${CASA.lon.toFixed(4)}°) — la casa del Dueño. Las coordenadas de los eventos son las que declaran USGS y GDACS, sin retocar.`}
      />

      <main className="mx-auto max-w-5xl px-5 pb-16">
        <section id="sismos-cerca" className="pt-10" aria-labelledby="sismos-cerca-titulo">
          <h2
            id="sismos-cerca-titulo"
            className="font-mono text-xl font-black uppercase tracking-tight text-white"
          >
            LOS SISMOS DE HOY, DEL MÁS CERCANO AL MÁS LEJANO
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">
            {sismosCerca.length > 0
              ? `Los ${sismosCerca.length} sismos más próximos de los ${sismos.senal?.valor ?? "—"} que registró hoy el USGS. La distancia se calcula con su coordenada, no se estima.`
              : "La fuente no contestó: no hay lista de sismos que enseñar. No se rellena con nada."}
          </p>
          {sismosCerca.length > 0 ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {sismosCerca.map((s) => (
                <Fila
                  key={`${s.lat}-${s.lon}-${s.km}`}
                  medida={s.medida}
                  titulo={s.titulo === "sismo" ? "sismo registrado" : s.titulo}
                  lugar={s.lugar}
                  km={s.km}
                  acento={ACENTO}
                />
              ))}
            </ul>
          ) : null}
        </section>

        <section id="alertas-cerca" className="pt-10" aria-labelledby="alertas-cerca-titulo">
          <h2
            id="alertas-cerca-titulo"
            className="font-mono text-xl font-black uppercase tracking-tight text-white"
          >
            LAS ALERTAS DE LA ONU, POR CERCANÍA
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">
            {alertasCerca.length > 0
              ? `Las ${alertasCerca.length} alertas más próximas del sistema GDACS (Comisión Europea y OCHA), con el nivel que ellos declaran —verde, naranja o rojo—, el país tal como lo escribe la fuente y su distancia calculada.`
              : "El sistema de alertas no contestó: el bloque lo dice en vez de fingir cero alertas."}
          </p>
          {alertasCerca.length > 0 ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {alertasCerca.map((a) => (
                <Fila
                  key={`${a.lat}-${a.lon}-${a.km}`}
                  medida={a.medida}
                  titulo={a.titulo}
                  lugar={a.lugar}
                  km={a.km}
                  acento="#f59e0b"
                />
              ))}
            </ul>
          ) : null}
        </section>

        {/* v402.6 · DÓNDE TIEMBLA Y QUIÉN LO CUENTA */}
        <section className="pt-10" aria-labelledby="quien-cuenta">
          <h2
            id="quien-cuenta"
            className="font-mono text-xl font-black uppercase tracking-tight text-white"
          >
            DÓNDE TIEMBLA, QUIÉN LO CUENTA
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">
            {paisesDelDia.length > 0
              ? "Cada temblor, emparejado con la capital real más cercana del atlas de la casa (84 naciones con latitud y longitud) y con los cables que el archivo tiene de ese país. Ojo, y se dice: se mide a la CAPITAL, y si el temblor cae en un territorio que no está en el atlas —Puerto Rico, por ejemplo— gana la capital más próxima de las que sí están."
              : "Sin sismos con coordenada en este render: no hay país que emparejar. No se rellena con nada."}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {paisesDelDia.map(({ pais: p, sismo }) => {
              const cables = cablesPorPais.get(p.id) ?? null;
              return (
                <article
                  key={p.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate font-mono text-[12px] font-bold text-white">
                      {p.nombre} · {p.capital}
                    </p>
                    <p className="shrink-0 font-mono text-[11px] tabular-nums text-rose-300">
                      {nf.format(p.kmCapital)} km
                    </p>
                  </div>
                  <p className="mt-1 truncate font-mono text-[10.5px] text-slate-500">
                    {sismo ? `${sismo.medida} · ${sismo.lugar}` : "sismo sin lugar declarado"}
                  </p>
                  <p className="mt-2 border-t border-slate-800/80 pt-2 font-mono text-[11px] text-slate-300">
                    {cables === null ? (
                      <span className="text-slate-500">
                        el archivo no contestó · sin cifra de cables
                      </span>
                    ) : (
                      <>
                        <span className="font-bold text-white">{nf.format(cables)}</span> cables de
                        este país en el archivo
                      </>
                    )}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <div id="grafos" className="pt-2">
          {barrasSismos.length > 1 ? (
            <GraficoBarras
              id="grafico-cerca-sismos"
              volanta="EL CRUCE · DISTANCIA A ESTA CASA"
              titulo="LOS SISMOS DE HOY, MEDIDOS DESDE CASA"
              nota="Cada barra es la distancia real al sismo. Se mide contra el más LEJANO de la lista: aquí, barra corta significa «al lado»."
              unidad="kilómetros"
              acento={ACENTO}
              etiquetaMaximo="el más lejano de la lista"
              barras={barrasSismos}
            />
          ) : null}

          {barrasAlertas.length > 1 ? (
            <GraficoBarras
              id="grafico-cerca-alertas"
              volanta="EL CRUCE · ALERTAS Y DISTANCIA"
              titulo="LAS ALERTAS DE GDACS, MEDIDAS DESDE CASA"
              nota="Distancia real a cada alerta del sistema de la ONU, medida contra la más lejana de la lista."
              unidad="kilómetros"
              acento="#f59e0b"
              etiquetaMaximo="la más lejana de la lista"
              barras={barrasAlertas}
            />
          ) : null}
        </div>

        <section id="efemerides" className="pt-10" aria-labelledby="efemerides-titulo">
          <h2
            id="efemerides-titulo"
            className="font-mono text-xl font-black uppercase tracking-tight text-white"
          >
            UN DÍA COMO HOY
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-slate-400">
            {efemerides
              ? `${efemerides.valor} hechos ocurrieron en esta misma fecha según el archivo de Wikipedia en español. Aquí van los ${listaEfemerides.length} más antiguos de la lista: el pasado que se cumple hoy, junto al mundo que acaba de moverse arriba.`
              : "La enciclopedia no contestó: la casa no rellena la memoria con invenciones."}
          </p>
          {listaEfemerides.length > 0 ? (
            <EjeDelDia
              id="eje-dia-cruce"
              eventos={listaEfemerides}
              volanta="EL CRUCE · EL PASADO QUE SE CUMPLE HOY"
              titulo="UN DÍA COMO HOY, EN UN EJE"
              nota="Los hechos de esta misma fecha, en su año, para leerlos junto al mundo que acaba de moverse arriba."
              acento="#f59e0b"
            />
          ) : (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-slate-500">
                sin efemérides
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-300">
                {efemerides?.detalle ?? "La enciclopedia no contestó en este render."}
              </p>
            </div>
          )}
          <p className="mt-4 text-[12px] leading-relaxed text-slate-500">
            El archivo completo del día se lee en{" "}
            <Link href="/historia" className="text-amber-300 underline underline-offset-2">
              LA MEMORIA
            </Link>{" "}
            y las diez fuentes con su licencia, en{" "}
            <Link href="/herramientas" className="text-cyan-300 underline underline-offset-2">
              LAS DIEZ LLAVES
            </Link>
            .
          </p>
        </section>
      </main>
    </>
  );
}
