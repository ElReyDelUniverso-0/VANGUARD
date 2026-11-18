// ═══════════════════════════════════════════════════════════════════
// v406.3 EL CALENDARIO EDITORIAL — /editorial/calendario.
// Prioridades semanales, las piezas día a día (publicadas y en cola), el
// plan de actualizaciones calculado desde el registro, los criterios de
// calidad, la verificación y la coordinación con el departamento de informes.
// Se regenera cada hora para que «hoy» y los estados de revisión sean reales.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import "../editorial.css";
import { PortadaSala } from "@/components/vanguard/portada-sala";
import { ARTICULOS, planDeRevisiones, FECHA_ES, TIPO_ES } from "@/lib/editorial";
import { area } from "@/lib/editorial/areas";
import {
  SEMANAS,
  VENTANA,
  calendario,
  cola,
  semanaDe,
  ESTADO_ES,
  CRITERIOS_CALIDAD,
  PASOS_VERIFICACION,
  INFORMES,
} from "@/lib/editorial/calendario";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Calendario editorial — La redacción de Vanguard",
  description:
    "Las próximas cuatro semanas de la redacción de Vanguard: prioridades, piezas programadas, plan de actualizaciones y criterios de verificación.",
  alternates: { canonical: "/editorial/calendario" },
};

const ESTADO_REV = { "al-dia": "Al día", "revisar-pronto": "Revisar pronto", vencida: "Toca revisar" } as const;

export default function Calendario() {
  const hoy = new Date().toISOString().slice(0, 10);
  const todo = calendario();
  const revisiones = planDeRevisiones(hoy);
  const p1 = cola().filter((p) => p.prioridad === 1).length;

  return (
    <main className="vx ed">
      <PortadaSala
        imagen="/ilustraciones/briefing.jpg"
        alt="Mesa de mando con documentos y pantallas de un briefing"
        volanta="REDACCIÓN · PLAN DE 30 DÍAS"
        titulo="Calendario editorial"
        sumario={`Del ${FECHA_ES(VENTANA.desde)} al ${FECHA_ES(VENTANA.hasta)}: cuatro semanas con prioridad propia, una cola con fuentes previstas y un plan de revisiones que se calcula solo.`}
        cifras={[
          { valor: ARTICULOS.length, etiqueta: "publicadas" },
          { valor: cola().length, etiqueta: "en cola" },
          { valor: p1, etiqueta: "prioridad máxima" },
          { valor: SEMANAS.length, etiqueta: "semanas" },
        ]}
        anclas={[
          { etiqueta: "Semanas", href: "#semanas" },
          { etiqueta: "Actualizaciones", href: "#actualizaciones" },
          { etiqueta: "Calidad", href: "#calidad" },
          { etiqueta: "Verificación", href: "#verificacion" },
          { etiqueta: "Informes", href: "#informes" },
        ]}
        acento="#e8c56a"
        prioritaria
        nivel="h1"
      />

      <section className="vx-sec" id="semanas" aria-labelledby="ed-sem-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Prioridades semanales</span>
              <h2 id="ed-sem-t">Las cuatro semanas</h2>
              <p>Lo publicado enlaza a su pieza; lo pendiente muestra su ángulo, sus fuentes previstas y con qué informe se coordina.</p>
            </div>
          </div>
          <div className="ed-semanas">
            {SEMANAS.map((s) => {
              const piezas = todo.filter((p) => semanaDe(p.fecha)?.n === s.n || (s.n === 1 && p.fecha < VENTANA.desde));
              return (
                <section key={s.n} className="ed-semana" aria-labelledby={`sem-${s.n}`}>
                  <div className="ed-semana-cab">
                    <h3 id={`sem-${s.n}`}>
                      Semana {s.n} · {s.foco}
                    </h3>
                    <span>
                      {FECHA_ES(s.desde)} – {FECHA_ES(s.hasta)}
                    </span>
                  </div>
                  <p className="ed-semana-obj">{s.objetivo}</p>
                  <ul className="ed-hitos" aria-label="Hitos de la semana">
                    {s.hitos.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  <ol className="ed-dias">
                    {piezas.map((p) => {
                      const ar = area(p.area);
                      return (
                        <li key={p.fecha + p.titulo} className="ed-pieza" style={{ ["--ed-acento" as string]: ar.color }}>
                          <span className="ed-pieza-fecha">
                            <b>{Number(p.fecha.slice(8))}</b>
                            {p.fecha.slice(5, 7) === "11" ? "nov" : "dic"}
                          </span>
                          <div>
                            <span className="ed-chip">{ar.nombre}</span>{" "}
                            <span className="ed-estado" data-e={p.estado}>
                              {ESTADO_ES[p.estado]}
                            </span>{" "}
                            <span className="ed-prio" data-p={p.prioridad}>
                              P{p.prioridad} · {TIPO_ES[p.tipo]}
                            </span>
                            <p className="ed-pieza-t">{p.slug ? <Link href={`/editorial/${p.slug}`}>{p.titulo}</Link> : p.titulo}</p>
                            {!p.slug && <p className="ed-pieza-a">{p.angulo}</p>}
                            <p className="ed-pieza-x">
                              Informe: {p.informe}
                              {p.complementa ? ` · No repite: ${p.complementa}` : ""}
                              {!p.slug ? ` · Fuentes previstas: ${p.fuentes.join(", ")}` : ""}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="vx-sec" id="actualizaciones" aria-labelledby="ed-act-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Sistema de actualización</span>
              <h2 id="ed-act-t">Plan de revisiones</h2>
              <p>
                Calculado a {FECHA_ES(hoy)} desde el registro: cada pieza declara cada cuántos días se revisa y, si depende de un evento, la
                fecha del hito. Las piezas de datos se recalculan solas desde el censo.
              </p>
            </div>
          </div>
          <div className="ed-tabla-env">
            <table className="ed-revs">
              <thead>
                <tr>
                  <th scope="col">Pieza</th>
                  <th scope="col">Próxima revisión</th>
                  <th scope="col">Motivo</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {revisiones.map((r) => (
                  <tr key={r.a.slug}>
                    <td>
                      <Link href={`/editorial/${r.a.slug}`}>{r.a.titulo}</Link>
                    </td>
                    <td>{FECHA_ES(r.proxima)}</td>
                    <td>{r.motivo}</td>
                    <td>
                      <span className="ed-rev" data-e={r.estado}>
                        {ESTADO_REV[r.estado]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="vx-sec" id="calidad" aria-labelledby="ed-cal-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Normas de la casa</span>
              <h2 id="ed-cal-t">Criterios de calidad</h2>
            </div>
          </div>
          <ul className="ed-criterios">
            {CRITERIOS_CALIDAD.map((c) => (
              <li key={c.titulo}>
                <b>{c.titulo}</b>
                <span>{c.texto}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="vx-sec" id="verificacion" aria-labelledby="ed-ver-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Antes de publicar</span>
              <h2 id="ed-ver-t">Verificación</h2>
            </div>
            <Link href="/editorial/como-verificar-una-foto-o-un-video-de-una-guerra">Método de 7 pasos →</Link>
          </div>
          <ol className="ed-pasos">
            {PASOS_VERIFICACION.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="vx-sec" id="informes" aria-labelledby="ed-inf-t">
        <div className="vx-wrap">
          <div className="vx-sec-h">
            <div>
              <span className="vx-sello">Coordinación</span>
              <h2 id="ed-inf-t">Con el departamento de informes</h2>
              <p>Qué entrega cada informe de la casa a la redacción y qué recibe de vuelta.</p>
            </div>
          </div>
          <div className="ed-tabla-env">
            <table className="ed-informes">
              <thead>
                <tr>
                  <th scope="col">Informe</th>
                  <th scope="col">Entrega a la redacción</th>
                  <th scope="col">Recibe de la redacción</th>
                  <th scope="col">Áreas</th>
                </tr>
              </thead>
              <tbody>
                {INFORMES.map((i) => (
                  <tr key={i.ruta}>
                    <td>
                      <Link href={i.ruta}>{i.nombre}</Link>
                    </td>
                    <td>{i.entrega}</td>
                    <td>{i.recibe}</td>
                    <td>{i.areas.map((a) => area(a).nombre).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
