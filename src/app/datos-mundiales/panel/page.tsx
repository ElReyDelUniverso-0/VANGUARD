// ═══════════════════════════════════════════════════════════════════
// v416.0 · /datos-mundiales/panel — EL PANEL DE DESARROLLO MUNDIAL
// Departamento 4 · VANGUARD WORLD DATA
//
// La pregunta que ningún ranking responde: «¿y el mundo entero, cómo va?».
// Aquí NO se suman los países a mano —eso sería una cifra de la casa, no de la
// fuente—: se piden los AGREGADOS OFICIALES del Banco Mundial (WLD, LCN, SSF…),
// que ya vienen ponderados por el propio organismo, y se dibujan juntos para
// comparar la trayectoria del planeta con la de sus regiones.
// ═══════════════════════════════════════════════════════════════════
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";
import { MarcoDatos } from "@/components/mundial/marco-datos";
import { Controles } from "@/components/mundial/controles";
import { GraficoLineas } from "@/components/mundial/grafico-lineas";
import { INDICADORES, indicador as buscar, CATEGORIAS, categoriaDe } from "@/lib/mundial/catalogo";
import { serieDeAgregado, AGREGADOS } from "@/lib/mundial/banco";
import { fmtValor, fmtVariacion } from "@/lib/mundial/formato";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Panel de desarrollo mundial: el planeta y sus regiones en series largas | VANGUARD",
  description:
    "La trayectoria del mundo y de sus regiones con los agregados oficiales del Banco Mundial: población, renta, esperanza de vida, educación, energía y medio ambiente desde 1990.",
  alternates: { canonical: `${SITE_URL}/datos-mundiales/panel` },
};

const COLORES = ["#f5c542", "#5eead4", "#e23b2e", "#a78bfa", "#60a5fa", "#f472b6"];
const POR_DEFECTO = ["WLD", "LCN", "SSF", "EAS"];

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PanelPage({ searchParams }: Props) {
  const sp = await searchParams;
  const idCrudo = typeof sp.indicador === "string" ? sp.indicador : "esperanza_vida";
  const ind = buscar(idCrudo) ?? INDICADORES[0];
  const agrCrudo = typeof sp.agregados === "string" ? sp.agregados.toUpperCase() : POR_DEFECTO.join(",");
  const pedidos = agrCrudo
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => AGREGADOS.some((a) => a.iso === s));
  const lista = pedidos.length ? pedidos : POR_DEFECTO;

  const series = await Promise.all(lista.map((iso) => serieDeAgregado(iso, ind, 1990)));
  const conDatos = series.filter((s) => s.puntos.length > 0);
  const mundo = series.find((s) => s.iso === "WLD");
  const cat = categoriaDe(ind.categoria);
  const aniosDisponibles = [...new Set(conDatos.flatMap((s) => s.puntos.map((p) => p.anio)))].sort((a, b) => b - a);

  return (
    <MarcoDatos
      activo="/datos-mundiales/panel"
      volanta={`Mundo en cifras · Panel de desarrollo · ${cat.nombre}`}
      titulo="Cómo va el mundo, región por región"
      sub={
        <>
          Los agregados son <b>del propio Banco Mundial</b> (ponderados por el organismo), no una media calculada por la casa. Se dibujan juntos para ver
          si el planeta y sus regiones se mueven en la misma dirección, y desde qué año se separan.
        </>
      }
      cifras={[
        {
          valor: mundo?.ultimo ? fmtValor(mundo.ultimo.valor, ind) : "sin dato",
          etiqueta: `Mundo · ${ind.nombre.toLowerCase()}`,
          nota: `Año ${mundo?.ultimo?.anio ?? "—"} · ${mundo?.puntos.length ?? 0} años con dato desde ${mundo?.puntos[0]?.anio ?? "—"}`,
        },
        {
          valor: mundo && mundo.puntos.length > 1 ? fmtVariacion(mundo.puntos[0].valor, mundo.puntos[mundo.puntos.length - 1].valor) : "sin dato",
          etiqueta: "variación del mundo en la serie",
          nota: mundo ? `De ${mundo.puntos[0]?.anio ?? "—"} a ${mundo.ultimo?.anio ?? "—"}` : "serie no disponible",
        },
        { valor: conDatos.length, etiqueta: "agregados con dato", nota: lista.join(" · ") },
        { valor: ind.codigo, etiqueta: "código de la fuente", nota: `${ind.unidad} · ${ind.fuente}` },
      ]}
    >
      <section className="vx-md-panel">
        <h2 className="vx-md-h2">1 · Qué serie mirar</h2>
        <Controles base="/datos-mundiales/panel" indicador={ind.id} anio={null} anios={[]} extra={{ agregados: lista.join(",") }} />
        <div className="vx-md-chips" style={{ marginTop: 6 }}>
          {AGREGADOS.map((a) => {
            const dentro = lista.includes(a.iso);
            const nuevos = dentro ? lista.filter((x) => x !== a.iso) : [...lista, a.iso].slice(0, 6);
            const href = `/datos-mundiales/panel?indicador=${ind.id}&agregados=${(nuevos.length ? nuevos : ["WLD"]).join(",")}`;
            return (
              <Link key={a.iso} href={href} className="vx-md-chip" data-on={dentro ? "1" : "0"} style={{ textDecoration: "none" }}>
                {a.nombre}
              </Link>
            );
          })}
        </div>
        <p className="vx-md-meta">Máximo seis agregados a la vez. Si quitas todos, vuelve el mundo.</p>
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">{ind.nombre}</h2>
        <p className="vx-md-h2-sub">
          {ind.pregunta} · Unidad: {ind.unidad} · {ind.metodo}
        </p>
        {conDatos.length ? (
          <GraficoLineas
            series={series.map((s, i) => ({ iso: s.iso, nombre: s.pais || s.iso, color: COLORES[i % COLORES.length], puntos: s.puntos }))}
            indicador={ind}
            altura={360}
          />
        ) : (
          <div className="vx-md-aviso rojo">
            El Banco Mundial no publica este indicador para los agregados elegidos. Prueba otro indicador o vuelve a intentarlo: la fuente puede estar
            respondiendo lento.
          </div>
        )}
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Último dato de cada agregado, con su año</h2>
        <div className="vx-md-tabla-caja" style={{ maxHeight: "none" }}>
          <table className="vx-md-tabla">
            <thead>
              <tr>
                <th>Agregado</th>
                <th className="num">Último dato</th>
                <th className="num">Año</th>
                <th className="num">Años con dato</th>
                <th className="num">Variación en la serie</th>
                <th>Nota de la fuente</th>
              </tr>
            </thead>
            <tbody>
              {series.map((s) => {
                const primero = s.puntos[0];
                const ultimo = s.puntos[s.puntos.length - 1];
                const nota = AGREGADOS.find((a) => a.iso === s.iso)?.nota ?? "—";
                return (
                  <tr key={s.iso}>
                    <td>{s.pais || s.iso}</td>
                    <td className="num">{ultimo ? fmtValor(ultimo.valor, ind) : <span className="vx-md-sin">sin dato</span>}</td>
                    <td className="num vx-md-meta">{ultimo?.anio ?? "—"}</td>
                    <td className="num vx-md-meta">{s.puntos.length}</td>
                    <td className="num">{primero && ultimo && primero !== ultimo ? fmtVariacion(primero.valor, ultimo.valor) : "—"}</td>
                    <td className="vx-md-meta">{nota}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="vx-md-meta" style={{ marginTop: 10 }}>
          Años presentes en la serie: {aniosDisponibles.slice(0, 12).join(", ")}
          {aniosDisponibles.length > 12 ? "…" : ""}. Un agregado es una media ponderada: no describe a ningún país concreto.
        </p>
      </section>

      <section className="vx-md-panel">
        <h2 className="vx-md-h2">Por qué esto no lo calcula la casa</h2>
        <ul className="vx-md-lista">
          <li>
            <b>Sumar países a mano da cifras falsas.</b> Sin ponderar por población, la «esperanza de vida del mundo» saldría de una media simple de 200
            países y no de la gente que vive en ellos.
          </li>
          <li>
            <b>El agregado del Banco Mundial ya viene ponderado y documentado.</b> Se usa el suyo y se dice que es suyo.
          </li>
          <li>
            <b>Los agregados no son países.</b> «África subsahariana» no firma tratados: cualquier lectura política de un agregado es una lectura
            aproximada.
          </li>
          <li>
            <b>Un indicador vacío se queda vacío.</b> Si la fuente no publica ese indicador para ese agregado, la tabla escribe «sin dato» y no se
            sustituye por el de al lado.
          </li>
        </ul>
      </section>
    </MarcoDatos>
  );
}
