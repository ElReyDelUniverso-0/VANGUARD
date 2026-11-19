// v416.0 · GRÁFICO DE LÍNEAS — series históricas sin librerías
// Departamento 4 · VANGUARD WORLD DATA
// SVG puro, renderizado en el servidor: cero JavaScript, cero CDN. Cada punto
// conserva su año; los huecos de la fuente se dibujan como huecos (la línea se
// corta), no como una recta que une dos años distintos como si fueran seguidos.

import type { Indicador } from "@/lib/mundial/catalogo";
import { fmtValor, SIN_DATO } from "@/lib/mundial/formato";

export interface SerieGrafico {
  iso: string;
  nombre: string;
  color: string;
  puntos: { anio: number; valor: number }[];
}

const ANCHO = 860;
const ALTO = 320;
const M = { arriba: 18, derecha: 18, abajo: 34, izq: 66 };

export function GraficoLineas({
  series,
  indicador,
  altura = ALTO,
}: {
  series: SerieGrafico[];
  indicador: Indicador;
  altura?: number;
}) {
  const conDatos = series.filter((s) => s.puntos.length > 0);
  if (conDatos.length === 0) {
    return <p className="vx-md-sin">Sin datos publicados para los países elegidos en este indicador.</p>;
  }
  const anios = conDatos.flatMap((s) => s.puntos.map((p) => p.anio));
  const minAnio = Math.min(...anios);
  const maxAnio = Math.max(...anios);
  const valores = conDatos.flatMap((s) => s.puntos.map((p) => p.valor));
  let min = Math.min(...valores);
  let max = Math.max(...valores);
  if (min === max) {
    min = min - 1;
    max = max + 1;
  }
  const margen = (max - min) * 0.08;
  min -= margen;
  max += margen;

  const anchoUtil = ANCHO - M.izq - M.derecha;
  const altoUtil = altura - M.arriba - M.abajo;
  const x = (anio: number) => (maxAnio === minAnio ? M.izq + anchoUtil / 2 : M.izq + ((anio - minAnio) / (maxAnio - minAnio)) * anchoUtil);
  const y = (valor: number) => M.arriba + altoUtil - ((valor - min) / (max - min)) * altoUtil;

  const ticksY = 5;
  const marcasY = Array.from({ length: ticksY + 1 }, (_, i) => min + ((max - min) * i) / ticksY);
  const pasoX = Math.max(1, Math.ceil((maxAnio - minAnio) / 8));
  const marcasX: number[] = [];
  for (let a = minAnio; a <= maxAnio; a += pasoX) marcasX.push(a);
  if (marcasX[marcasX.length - 1] !== maxAnio) marcasX.push(maxAnio);

  /** Corta la línea cuando entre dos puntos hay más de un año de hueco. */
  function tramos(puntos: { anio: number; valor: number }[]) {
    const salida: { anio: number; valor: number }[][] = [];
    let actual: { anio: number; valor: number }[] = [];
    puntos.forEach((p, i) => {
      if (i > 0 && p.anio - puntos[i - 1].anio > 1) {
        if (actual.length > 0) salida.push(actual);
        actual = [p];
      } else {
        actual.push(p);
      }
    });
    if (actual.length) salida.push(actual);
    return salida;
  }

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${ANCHO} ${altura}`} className="vx-md-grafico" role="img" aria-label={`Serie histórica de ${indicador.nombre}`}>
        <rect x={0} y={0} width={ANCHO} height={altura} fill="#08080b" rx={10} />
        {marcasY.map((v, i) => (
          <g key={`y${i}`}>
            <line x1={M.izq} x2={ANCHO - M.derecha} y1={y(v)} y2={y(v)} stroke="#1b1b22" strokeWidth={1} />
            <text x={M.izq - 8} y={y(v) + 4} fill="#7e7a71" fontSize={11} textAnchor="end">
              {fmtValor(v, indicador)}
            </text>
          </g>
        ))}
        {marcasX.map((a) => (
          <text key={`x${a}`} x={x(a)} y={altura - 12} fill="#7e7a71" fontSize={11} textAnchor="middle">
            {a}
          </text>
        ))}
        {conDatos.map((s) => (
          <g key={s.iso}>
            {tramos(s.puntos).map((tramo, i) => (
              <polyline
                key={`${s.iso}-${i}`}
                fill="none"
                stroke={s.color}
                strokeWidth={2.4}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={tramo.map((p) => `${x(p.anio)},${y(p.valor)}`).join(" ")}
              />
            ))}
            {s.puntos.map((p) => (
              <circle key={`${s.iso}-${p.anio}`} cx={x(p.anio)} cy={y(p.valor)} r={2.4} fill={s.color}>
                <title>{`${s.nombre} · ${p.anio}: ${fmtValor(p.valor, indicador)}`}</title>
              </circle>
            ))}
            {(() => {
              const u = s.puntos[s.puntos.length - 1];
              return (
                <text x={x(u.anio) + 6} y={y(u.valor) - 6} fill={s.color} fontSize={12} fontWeight={700}>
                  {s.nombre.length > 16 ? `${s.nombre.slice(0, 15)}…` : s.nombre}
                </text>
              );
            })()}
          </g>
        ))}
        <text x={M.izq} y={14} fill="#9a958a" fontSize={11}>
          {indicador.nombre} · {indicador.unidad}
        </text>
      </svg>
      <div className="vx-md-leyenda">
        {series.map((s) => (
          <span key={s.iso}>
            <i style={{ background: s.color }} />
            {s.nombre} {s.puntos.length ? `· ${s.puntos.length} años con dato` : "· sin dato"}
          </span>
        ))}
      </div>
      <figcaption className="vx-md-meta" style={{ marginTop: 6 }}>
        Cada punto es un año con dato publicado. Donde la línea se corta, la fuente no publicó ese año: no se ha interpolado.{" "}
        {conDatos.some((s) => s.puntos.length === 0) ? `${SIN_DATO} = el país no aparece en esta serie.` : ""}
      </figcaption>
    </figure>
  );
}
