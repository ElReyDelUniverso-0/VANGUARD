// ═══════════════════════════════════════════════════════════════════
// v440.5 · GLOBAL DANGER — el centro mundial de observación de riesgos
//
// Encargo del Dueño, textual: «Construye GLOBAL DANGER para Vanguard. Crea un
// centro mundial de observación de riesgos y amenazas para la humanidad.
// Mapa mundial de riesgos. Contaminación. Enfermedades y brotes epidémicos.
// Inseguridad alimentaria. Crisis humanitarias. Riesgos ambientales. Escasez de
// recursos. Estadísticas y comparaciones. Niveles de riesgo explicados. Fuentes
// oficiales. Actualización automática cuando existan datos disponibles. Cada
// riesgo debe incluir fecha, fuente, metodología y contexto. No generes falsas
// alarmas.»
//
// CÓMO SE CUMPLE, Y CÓMO NO SE MIENTE:
//   · las cifras salen de la API oficial de cada organismo, en el servidor, en
//     cada visita; si una no contesta se usa la última lectura conocida CON SU
//     FECHA y se confiesa en la barra de estado;
//   · el nivel 0–5 sólo se pone donde hay una escala publicada (OMS para el
//     aire, FAO para la subalimentación y el agua, GDACS para desastres); donde
//     no la hay, la señal sale con «sin clasificación oficial»;
//   · cada señal lleva fecha, fuente, metodología y contexto, en su ficha;
//   · nada se adelanta: ni víctimas, ni hectáreas, ni «emergencia» que la
//     autoridad no haya declarado.
//
// Se regenera sola cada 15 minutos (ISR). Sin JavaScript en el cliente: el mapa
// y las tablas llegan pintados.
// ═══════════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import Link from "next/link";
import "@/app/global-danger/global-danger.css";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { MapaRiesgos, COLOR_CLASE } from "@/components/peligro/mapa-riesgos";
import { CATEGORIAS, construirSenales, categoriaDe, type Contexto } from "@/lib/peligro/senales";
import { NIVELES, ESCALAS, nivelDe } from "@/lib/peligro/niveles";
import { FUENTES } from "@/lib/peligro/fuentes";
import { PAISES_COMPARACION } from "@/lib/peligro/instantanea";
import {
  CIUDADES_AIRE,
  leerAire,
  leerBrotes,
  leerComparativa,
  leerEONET,
  leerGDACS,
  leerIndicadores,
  leerSismos,
  type Lectura,
  type ValorIndicador,
} from "@/lib/peligro/vivo";
import type { PuntoMapa } from "@/lib/peligro/tipos";
import { APP_VERSION_LABEL } from "@/lib/version";

export const revalidate = 900; // 15 minutos

export const metadata: Metadata = {
  title: "Global Danger · el observatorio mundial de riesgos de Vanguard",
  description:
    "Mapa mundial de riesgos en vivo, contaminación, brotes epidémicos, inseguridad alimentaria, crisis humanitarias, riesgos ambientales y escasez de recursos. Cada dato con su fecha, su fuente oficial, su metodología y su contexto. Sin alarmas inventadas.",
  alternates: { canonical: "/global-danger" },
};

const NOMBRE_PAIS: Record<string, string> = {
  WLD: "Mundo",
  ESP: "España",
  USA: "Estados Unidos",
  BRA: "Brasil",
  IND: "India",
  NGA: "Nigeria",
  DOM: "República Dominicana",
};

const COMPARA: { codigo: string; nombre: string; unidad: string; decimales: number }[] = [
  { codigo: "EN.ATM.PM25.MC.M3", nombre: "PM2,5 (media anual)", unidad: "µg/m³", decimales: 1 },
  { codigo: "SN.ITK.DEFC.ZS", nombre: "Subalimentación", unidad: "%", decimales: 1 },
  { codigo: "ER.H2O.FWTL.ZS", nombre: "Extracción de agua dulce", unidad: "%", decimales: 1 },
];

function fecha(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function cifra(n: number, decimales = 1): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("es-ES", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

/** La barra de estado: qué contestó y qué hubo que sacar de la instantánea. */
function EstadoFuentes({
  lecturas,
  cuando,
}: {
  lecturas: { nombre: string; l: Lectura<unknown> }[];
  cuando: string;
}) {
  const vivas = lecturas.filter((x) => x.l.ok).length;
  return (
    <section className="gd-estado" aria-label="Estado de las fuentes">
      <div className="gd-estado-fila">
        <span className={vivas === lecturas.length ? "gd-pulso gd-pulso-ok" : "gd-pulso gd-pulso-parcial"}>
          {vivas}/{lecturas.length} fuentes en vivo
        </span>
        <span className="gd-estado-hora">lectura {fecha(cuando)} UTC</span>
        <span className="gd-estado-nota">
          se regenera sola cada 15 minutos · si una fuente no contesta se muestra su última lectura conocida, con
          fecha
        </span>
      </div>
      <ul className="gd-estado-lista">
        {lecturas.map((x) => (
          <li key={x.nombre} className={x.l.ok ? "gd-chip gd-chip-ok" : "gd-chip gd-chip-inst"}>
            <i aria-hidden />
            {x.nombre}
            <b>{x.l.ok ? "en vivo" : "última conocida"}</b>
            {!x.l.ok && x.l.error ? <em title={x.l.error}>·</em> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function GlobalDangerPage() {
  // ── las lecturas, todas a la vez ──────────────────────────────────────
  const [sismos, gdacs, eonet, brotes, indicadores, ...aires] = await Promise.all([
    leerSismos(),
    leerGDACS(),
    leerEONET(),
    leerBrotes(),
    leerIndicadores(),
    ...CIUDADES_AIRE.map((c) => leerAire(c.lat, c.lng, c.nombre)),
  ]);

  const comparativa = await leerComparativa(
    PAISES_COMPARACION,
    COMPARA.map((c) => c.codigo),
  );

  const ahora = new Date().toISOString();

  // ── el contexto que comen las señales ────────────────────────────────
  const rojos = gdacs.datos.filter((d) => (d.nivelTexto ?? "").toLowerCase() === "red").length;
  const naranjas = gdacs.datos.filter((d) => (d.nivelTexto ?? "").toLowerCase() === "orange").length;
  const verdes = gdacs.datos.filter((d) => (d.nivelTexto ?? "").toLowerCase() === "green").length;
  const incendios = eonet.datos.filter((e) => e.clase === "incendio").length;
  const tormentas = eonet.datos.filter((e) => e.clase === "tormenta").length;
  const mayor = sismos.datos.reduce<PuntoMapa | null>(
    (a, b) => (!a || (b.peso ?? 0) > (a.peso ?? 0) ? b : a),
    null,
  );

  const contexto: Contexto = {
    indicadores,
    brotes,
    aire: aires,
    desastres: {
      rojos,
      naranjas,
      verdes,
      total: gdacs.datos.length,
      ultimo: gdacs.datos[0]?.fecha ?? null,
    },
    eventos: {
      total: eonet.datos.length,
      incendios,
      tormentas,
      otros: eonet.datos.length - incendios - tormentas,
      ultimo: eonet.datos[0]?.fecha ?? null,
    },
    sismos: { total: sismos.datos.length, mayor: mayor?.peso ?? null, mayorLugar: mayor?.titulo ?? null },
  };

  const senales = construirSenales(contexto);

  const puntos: PuntoMapa[] = [
    ...gdacs.datos.map((d) => ({ ...d })),
    ...sismos.datos,
    ...eonet.datos,
  ];

  const lecturasEstado = [
    { nombre: "USGS", l: sismos },
    { nombre: "GDACS", l: gdacs },
    { nombre: "NASA EONET", l: eonet },
    { nombre: "OMS", l: brotes },
    { nombre: "Banco Mundial", l: indicadores["EN.ATM.PM25.MC.M3"] as Lectura<unknown> },
    { nombre: "Open-Meteo", l: aires[0] },
  ];

  return (
    <main className="pm-pagina gd-pagina">
      <PortadaSala
        ruta="/global-danger"
        imagen="/imagenes-reales/satelite.jpg"
        alt="Vista de satélite de la Tierra con su atmósfera iluminada"
        volanta="Módulo · Global Danger"
        titulo="Global Danger"
        sumario="El observatorio mundial de riesgos de la casa: el mapa del planeta en vivo y las seis familias que pueden romperle la vida a la gente —aire, brotes, hambre, desastres, ambiente y recursos—, cada cifra con su fecha, su fuente oficial, su metodología y su contexto. Aquí no se grita: se cita."
        cifras={[
          {
            valor: `${Math.min(puntos.length, 320)}`,
            etiqueta: "puntos en el mapa",
            nota: puntos.length > 320 ? `de ${puntos.length} leídas · el resto, abajo` : "USGS · GDACS · EONET",
          },
          { valor: `${senales.length}`, etiqueta: "señales vivas", nota: "seis familias" },
          { valor: `${FUENTES.length}`, etiqueta: "fuentes oficiales", nota: "con su licencia" },
          { valor: "15 min", etiqueta: "se regenera", nota: "ISR, sin martillear" },
        ]}
        acento="#ff4d6d"
        nota="Cada nivel 0–5 que se muestra sale de una escala publicada por el organismo (OMS, FAO, GDACS). Donde no hay escala, la señal lo dice y no se puntúa."
      />

      <EstadoFuentes lecturas={lecturasEstado} cuando={ahora} />

      {/* ───────────────── 1 · EL MAPA ───────────────── */}
      <section className="gd-seccion" id="mapa" aria-labelledby="gd-mapa-titulo">
        <h2 className="gd-h2" id="gd-mapa-titulo">
          El mapa del planeta, ahora
        </h2>
        <p className="gd-intro">
          Sismos de magnitud 4,5 o más de los últimos siete días (USGS), desastres con impacto potencial
          (GDACS) y eventos naturales observados por satélite (NASA EONET). Todo lo que se ve aquí lo publicó
          alguien con nombre y fecha; el mapa sólo lo pone en su sitio.
        </p>
        <p className="gd-intro"><a href="/desastres">Explorar Disaster Radar: filtros por tipo y período, cronología y mapa →</a></p>
        <MapaRiesgos puntos={puntos} />

        <div className="gd-mapa-fichas">
          <article className="gd-mini">
            <h3>Sismos · últimos 7 días</h3>
            <p>
              <strong>{sismos.datos.length}</strong> sismos de magnitud ≥ 4,5.
              {mayor ? (
                <>
                  {" "}
                  El mayor: <strong>M {mayor.peso}</strong> — {mayor.titulo.replace(/^M [\d.]+ - /, "")}.
                </>
              ) : null}
            </p>
            <a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php" target="_blank" rel="noopener noreferrer">
              feed oficial de USGS →
            </a>
          </article>
          <article className="gd-mini">
            <h3>Desastres abiertos · GDACS</h3>
            <p>
              <strong>{gdacs.datos.length}</strong> eventos con impacto estimado:{" "}
              <span style={{ color: "#ff4d6d" }}>{rojos} rojos</span>,{" "}
              <span style={{ color: "#ff9040" }}>{naranjas} naranjas</span>,{" "}
              <span style={{ color: "#48c78e" }}>{verdes} verdes</span>.
            </p>
            <a href="https://www.gdacs.org/" target="_blank" rel="noopener noreferrer">
              GDACS, la fuente →
            </a>
          </article>
          <article className="gd-mini">
            <h3>Eventos naturales · NASA EONET</h3>
            <p>
              <strong>{eonet.datos.length}</strong> abiertos: {incendios} incendios, {tormentas} tormentas y{" "}
              {eonet.datos.length - incendios - tormentas} de otro tipo (volcanes, icebergs, inundaciones).
            </p>
            <a href="https://eonet.gsfc.nasa.gov/" target="_blank" rel="noopener noreferrer">
              EONET, la fuente →
            </a>
          </article>
        </div>
      </section>

      {/* ───────────────── 2 · LAS SEÑALES ───────────────── */}
      <section className="gd-seccion" id="riesgos" aria-labelledby="gd-riesgos-titulo">
        <h2 className="gd-h2" id="gd-riesgos-titulo">
          Las seis familias del riesgo, con su ficha
        </h2>
        <p className="gd-intro">
          Cada ficha lleva cuatro cosas que casi nunca van juntas: <b>el dato y su fecha</b>, <b>la fuente</b>{" "}
          con su enlace, <b>la metodología</b> con la que se calculó y <b>el contexto</b> para no leerlo de más.
          Cuando la fuente no publica escala, la ficha lo dice: «sin clasificación oficial».
        </p>

        <nav className="gd-indice" aria-label="Familias del riesgo">
          {CATEGORIAS.map((c) => (
            <a key={c.id} href={`#gd-${c.id}`} style={{ ["--gd-c" as string]: c.color }}>
              {c.nombre}
            </a>
          ))}
        </nav>

        {CATEGORIAS.map((cat) => {
          const suyas = senales.filter((s) => s.categoria === cat.id);
          if (suyas.length === 0) return null;
          return (
            <div key={cat.id} className="gd-familia" id={`gd-${cat.id}`} style={{ ["--gd-c" as string]: cat.color }}>
              <header className="gd-familia-cabeza">
                <h3>{cat.nombre}</h3>
                <p>{cat.que}</p>
              </header>
              <div className="gd-tarjetas">
                {suyas.map((s) => {
                  const n = nivelDe(s.nivel);
                  return (
                    <article key={s.id} className="gd-tarjeta">
                      <div className="gd-tarjeta-top">
                        <span className="gd-etiqueta">{categoriaDe(s.categoria).nombre}</span>
                        {n ? (
                          <span className="gd-nivel" style={{ ["--gd-n" as string]: n.color }}>
                            <i aria-hidden />
                            {n.nivel} · {n.nombre}
                          </span>
                        ) : (
                          <span className="gd-nivel gd-nivel-sin">sin clasificación oficial</span>
                        )}
                      </div>
                      <h4>{s.titulo}</h4>
                      <p className="gd-valor">{s.valor}</p>
                      <dl className="gd-ficha">
                        <div>
                          <dt>Fecha</dt>
                          <dd>{s.fecha}</dd>
                        </div>
                        <div>
                          <dt>Fuente</dt>
                          <dd>
                            <a href={s.fuenteUrl} target="_blank" rel="noopener noreferrer">
                              {s.fuente} ↗
                            </a>
                            {s.enVivo ? <span className="gd-vivo"> · en vivo</span> : null}
                          </dd>
                        </div>
                        <div>
                          <dt>Metodología</dt>
                          <dd>{s.metodologia}</dd>
                        </div>
                        <div>
                          <dt>Contexto</dt>
                          <dd>{s.contexto}</dd>
                        </div>
                        <div>
                          <dt>Nivel</dt>
                          <dd>{s.criterioNivel}</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>

              {/* la lista de brotes, dentro de su familia */}
              {cat.id === "epidemias" ? (
                <ol className="gd-brotes">
                  {brotes.datos.slice(0, 8).map((b) => (
                    <li key={b.url}>
                      <span className="gd-brote-fecha">{b.fecha}</span>
                      <a href={b.url} target="_blank" rel="noopener noreferrer">
                        {b.titulo}
                      </a>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          );
        })}
      </section>

      {/* ───────────────── 3 · EL AIRE AHORA ───────────────── */}
      <section className="gd-seccion" id="aire" aria-labelledby="gd-aire-titulo">
        <h2 className="gd-h2" id="gd-aire-titulo">
          El aire de ocho ciudades, en esta hora
        </h2>
        <p className="gd-intro">
          Una por continente, pedida a Open-Meteo (modelo CAMS de Copernicus) en cada visita. Son medias
          horarias: sirven para ver el aire de ahora, no para comparar países —para eso está la tabla de abajo,
          que es anual y del Banco Mundial.
        </p>
        <div className="gd-tabla-caja">
          <table className="gd-tabla">
            <caption className="gd-sr">PM2,5 por ciudad en la última hora</caption>
            <thead>
              <tr>
                <th scope="col">Ciudad</th>
                <th scope="col">PM2,5 (µg/m³)</th>
                <th scope="col">Índice US AQI</th>
                <th scope="col">Hora de la lectura (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {aires.map((a, i) => (
                <tr key={CIUDADES_AIRE[i].nombre}>
                  <th scope="row">{CIUDADES_AIRE[i].nombre}</th>
                  <td>{a.ok ? cifra(a.datos.pm25, 1) : "—"}</td>
                  <td>{a.ok ? Math.round(a.datos.aqi) : "—"}</td>
                  <td>{a.ok ? a.datos.hora.replace("T", " ") : a.error ? "sin lectura" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gd-pie-nota">
          El índice US AQI lo publica el propio modelo; la escalera anual de la OMS no se aplica a una hora. Si
          quieres el detalle de una ciudad, el enlace está en la ficha de contaminación.
        </p>
      </section>

      {/* ───────────────── 4 · COMPARACIONES ───────────────── */}
      <section className="gd-seccion" id="comparaciones" aria-labelledby="gd-comp-titulo">
        <h2 className="gd-h2" id="gd-comp-titulo">
          Estadísticas y comparaciones
        </h2>
        <p className="gd-intro">
          Los mismos tres indicadores en siete sitios, para que un número mundial no se lea como si describiera a
          todo el mundo. Cada celda es el último año que publica el Banco Mundial para ese país; el año va en la
          fila de cabecera del indicador.
        </p>
        <div className="gd-tabla-caja">
          <table className="gd-tabla gd-tabla-comp">
            <caption className="gd-sr">Comparación de indicadores por país</caption>
            <thead>
              <tr>
                <th scope="col">País</th>
                {COMPARA.map((c) => (
                  <th key={c.codigo} scope="col">
                    {c.nombre}
                    <span className="gd-unidad">
                      {c.unidad} ·{" "}
                      {Object.values(comparativa).map((p) => p[c.codigo]?.datos.anio).find(Boolean) ?? "—"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAISES_COMPARACION.map((p) => (
                <tr key={p}>
                  <th scope="row">{NOMBRE_PAIS[p] ?? p}</th>
                  {COMPARA.map((c) => {
                    const l: Lectura<ValorIndicador> | undefined = comparativa[p]?.[c.codigo];
                    return (
                      <td key={c.codigo} className={l?.ok ? undefined : "gd-celda-inst"}>
                        {l ? cifra(l.datos.valor, c.decimales) : "—"}
                        {l && !l.ok ? <span className="gd-aster">*</span> : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="gd-pie-nota">
          * valor de la última lectura conocida (la API no contestó en este momento). Fuente de las tres columnas:
          Banco Mundial, con los códigos EN.ATM.PM25.MC.M3, SN.ITK.DEFC.ZS y ER.H2O.FWTL.ZS.
        </p>
      </section>

      {/* ───────────────── 5 · NIVELES ───────────────── */}
      <section className="gd-seccion" id="niveles" aria-labelledby="gd-niveles-titulo">
        <h2 className="gd-h2" id="gd-niveles-titulo">
          Qué significa cada nivel (y qué no)
        </h2>
        <p className="gd-intro">
          El 0–5 es una escala de <b>lectura</b> de Vanguard, no un boletín oficial. Se rellena sólo cuando el
          organismo que produce el dato publica su propia clasificación o un umbral concreto. Si no, la ficha dice
          «sin clasificación oficial» y no se le pone número.
        </p>
        <ul className="gd-niveles">
          {NIVELES.map((n) => (
            <li key={n.nivel} style={{ ["--gd-n" as string]: n.color }}>
              <span className="gd-nivel-num">{n.nivel}</span>
              <div>
                <strong>{n.nombre}</strong>
                <p>{n.que}</p>
                <em>{n.hacer}</em>
              </div>
            </li>
          ))}
        </ul>

        <h3 className="gd-h3">Las escalas oficiales que se usan aquí</h3>
        <div className="gd-escalas">
          {ESCALAS.map((e) => (
            <article key={e.id} className="gd-escala">
              <h4>{e.nombre}</h4>
              <p className="gd-escala-org">{e.organismo}</p>
              <p>
                <b>Cómo funciona:</b> {e.como}
              </p>
              <p>
                <b>Cómo se usa aquí:</b> {e.uso}
              </p>
              <a href={e.url} target="_blank" rel="noopener noreferrer">
                la escala en su origen ↗
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────────── 6 · FUENTES ───────────────── */}
      <section className="gd-seccion" id="fuentes" aria-labelledby="gd-fuentes-titulo">
        <h2 className="gd-h2" id="gd-fuentes-titulo">
          Fuentes oficiales
        </h2>
        <p className="gd-intro">
          Sólo entra lo que está en esta lista. Cada fila dice qué organismo lo publica, cada cuánto, con qué
          licencia y si la página lo lee en vivo o de su última lectura conocida.
        </p>
        <div className="gd-tabla-caja">
          <table className="gd-tabla gd-tabla-fuentes">
            <caption className="gd-sr">Fuentes oficiales del observatorio</caption>
            <thead>
              <tr>
                <th scope="col">Fuente</th>
                <th scope="col">Organismo</th>
                <th scope="col">Qué publica</th>
                <th scope="col">Cadencia</th>
                <th scope="col">Licencia</th>
                <th scope="col">Aquí</th>
              </tr>
            </thead>
            <tbody>
              {FUENTES.map((f) => (
                <tr key={f.id}>
                  <th scope="row">
                    <a href={f.url} target="_blank" rel="noopener noreferrer">
                      {f.nombre} ↗
                    </a>
                  </th>
                  <td>{f.organismo}</td>
                  <td>{f.que}</td>
                  <td>{f.cadencia}</td>
                  <td>{f.licencia}</td>
                  <td>
                    <span className={f.uso === "vivo" ? "gd-chip gd-chip-ok" : "gd-chip"}>
                      {f.uso === "vivo" ? "en vivo" : f.uso === "ambas" ? "vivo + última" : "última lectura"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ───────────────── 7 · METODOLOGÍA Y LÍMITES ───────────────── */}
      <section className="gd-seccion" id="metodo" aria-labelledby="gd-metodo-titulo">
        <h2 className="gd-h2" id="gd-metodo-titulo">
          Cómo se actualiza, y lo que esta página no hace
        </h2>
        <div className="gd-dos">
          <div>
            <h3 className="gd-h3">Cómo se actualiza</h3>
            <ul className="gd-lista">
              <li>
                La página se regenera sola cada <b>15 minutos</b> (ISR de Next.js): no hay botón de «refrescar» ni
                se martillea a ninguna API.
              </li>
              <li>
                Cada fuente tiene <b>9 segundos</b> para contestar. Si no lo hace, se usa su{" "}
                <b>última lectura conocida</b> —con su fecha a la vista— y la barra de estado lo dice.
              </li>
              <li>
                Las series anuales (Banco Mundial, FAO) se piden al abrir la página; cada valor conserva <b>su
                propio año</b>, que no tiene por qué ser el actual: los organismos publican con meses de retraso y
                eso se muestra, no se disimula.
              </li>
              <li>
                Los puntos del mapa llevan <b>su fecha</b> en la ficha; los que no la traen no se pintan.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="gd-h3">Lo que esta página no hace</h3>
            <ul className="gd-lista gd-lista-no">
              <li>No declara emergencias: eso lo hace la autoridad (OMS, OCHA, el país).</li>
              <li>No adelanta víctimas, daños ni superficies quemadas sin confirmación oficial.</li>
              <li>No inventa un nivel donde la fuente no publica escala.</li>
              <li>No suma indicadores distintos para fabricar un «índice de peligro mundial»: eso sería un número con pinta de científico y sin dueño.</li>
              <li>No usa el miedo como reclamo: ni cuentas atrás, ni «última hora» inventada.</li>
              <li>No guarda tus datos: no hay formularios ni cookies de seguimiento en esta página.</li>
            </ul>
          </div>
        </div>

        <div className="gd-aviso">
          <strong>Si hay una emergencia real cerca de ti</strong>, la información que vale es la de tu autoridad
          nacional y la de OCHA (ReliefWeb). Esta página es un observatorio de lectura: no sustituye a un boletín
          oficial ni a una orden de evacuación.
          <span className="gd-aviso-links">
            <a href="https://www.who.int/emergencies/disease-outbreak-news" target="_blank" rel="noopener noreferrer">
              OMS ↗
            </a>
            <a href="https://reliefweb.int/" target="_blank" rel="noopener noreferrer">
              ReliefWeb (OCHA) ↗
            </a>
            <a href="https://www.gdacs.org/" target="_blank" rel="noopener noreferrer">
              GDACS ↗
            </a>
          </span>
        </div>
      </section>

      <footer className="gd-pie">
        <span>
          Global Danger · {senales.length} señales · {puntos.length} puntos · lectura {fecha(ahora)} UTC ·{" "}
          {APP_VERSION_LABEL}
        </span>
        <span className="gd-pie-leyenda">
          {(Object.keys(COLOR_CLASE) as (keyof typeof COLOR_CLASE)[]).map((k) => (
            <i key={k} style={{ background: COLOR_CLASE[k] }} aria-hidden />
          ))}
        </span>
        <Link href="/mercado">volver al mercado de la casa ↑</Link>
      </footer>
    </main>
  );
}
