// ═══════════════════════════════════════════════════════════════════
// v440.5 · EL MAPA MUNDIAL DE RIESGOS — se dibuja en el servidor
//
// Sin JavaScript en el cliente: el mapa llega ya pintado con sus puntos, y cada
// punto lleva su `<title>` (el nombre y la fecha) y su enlace a la ficha
// oficial. La geografía es la de la casa (`lib/world-paths.json`, Natural
// Earth) con la misma proyección que usa el resto de Vanguard, así que el
// planeta queda exactamente donde el Dueño lo tiene visto.
// ═══════════════════════════════════════════════════════════════════

import { geoMercator } from "d3-geo";
import worldPaths from "@/lib/world-paths.json";
import type { PuntoMapa } from "@/lib/peligro/tipos";

const { landPath, borderPath, graticulePath, width, height, proj } = worldPaths as unknown as {
  landPath: string;
  borderPath: string;
  graticulePath: string;
  width: number;
  height: number;
  proj: { rotate: [number, number]; center: [number, number]; scale: number; translate: [number, number] };
};

const projection = geoMercator()
  .rotate(proj.rotate)
  .center(proj.center)
  .scale(proj.scale)
  .translate(proj.translate);

export const COLOR_CLASE: Record<PuntoMapa["clase"], string> = {
  sismo: "#ff9040",
  desastre: "#ff4d6d",
  incendio: "#ffb020",
  tormenta: "#5de6f7",
  otro: "#8ee9f5",
};

export const NOMBRE_CLASE: Record<PuntoMapa["clase"], string> = {
  sismo: "sismos (USGS + GDACS)",
  desastre: "desastres (GDACS)",
  incendio: "incendios (NASA EONET)",
  tormenta: "tormentas y ciclones",
  otro: "otros eventos naturales",
};

function proyectar(lat: number, lng: number): { x: number; y: number } | null {
  const p = projection([lng, lat]);
  if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) return null;
  return { x: p[0], y: p[1] };
}

function radio(p: PuntoMapa): number {
  if (p.clase === "sismo") return Math.max(2.2, Math.min(9, (p.peso ?? 4.5) - 2.4));
  return 2.4;
}

export function MapaRiesgos({ puntos, maxPuntos = 320 }: { puntos: PuntoMapa[]; maxPuntos?: number }) {
  // el más grave primero; los demás no se pintan si se pasa del tope
  const dibujados = puntos.slice(0, maxPuntos);
  const conteo = dibujados.reduce<Record<string, number>>((acc, p) => {
    acc[p.clase] = (acc[p.clase] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <figure className="gd-mapa">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Mapa mundial de riesgos con ${dibujados.length} puntos en vivo`}
        className="gd-mapa-svg"
      >
        <defs>
          <radialGradient id="gd-mar" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#0b1220" />
            <stop offset="100%" stopColor="#05070c" />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={width} height={height} fill="url(#gd-mar)" />
        <path d={graticulePath} fill="none" stroke="rgba(120,160,200,0.10)" strokeWidth={0.5} />
        <path d={landPath} fill="#101a26" stroke="rgba(150,190,220,0.22)" strokeWidth={0.5} />
        <path d={borderPath} fill="none" stroke="rgba(150,190,220,0.14)" strokeWidth={0.4} />

        {dibujados.map((p, i) => {
          const xy = proyectar(p.lat, p.lng);
          if (!xy) return null;
          const r = radio(p);
          const color = COLOR_CLASE[p.clase] ?? COLOR_CLASE.otro;
          const titulo = `${p.titulo}${p.nivelTexto ? ` · ${p.nivelTexto}` : ""}${p.fecha ? ` · ${p.fecha.slice(0, 10)}` : ""}`;
          const circulo = (
            <>
              <circle cx={xy.x} cy={xy.y} r={r + 2.4} fill={color} opacity={0.16} />
              <circle cx={xy.x} cy={xy.y} r={r} fill={color} opacity={0.92} stroke="rgba(0,0,0,0.45)" strokeWidth={0.5} />
              <title>{titulo}</title>
            </>
          );
          return p.url ? (
            <a key={`${p.clase}-${i}`} href={p.url} target="_blank" rel="noopener noreferrer">
              {circulo}
            </a>
          ) : (
            <g key={`${p.clase}-${i}`}>{circulo}</g>
          );
        })}
      </svg>

      <figcaption className="gd-mapa-pie">
        <span className="gd-mapa-cuenta">{dibujados.length} puntos</span>
        {(Object.keys(NOMBRE_CLASE) as PuntoMapa["clase"][]).map((c) =>
          conteo[c] ? (
            <span key={c} className="gd-leyenda">
              <i style={{ background: COLOR_CLASE[c] }} aria-hidden />
              {NOMBRE_CLASE[c]} · {conteo[c]}
            </span>
          ) : null,
        )}
        <span className="gd-mapa-nota">
          Cada punto lleva su fecha y su nombre al pasar el ratón; al pulsarlo se abre la ficha de la fuente.
        </span>
      </figcaption>
    </figure>
  );
}
