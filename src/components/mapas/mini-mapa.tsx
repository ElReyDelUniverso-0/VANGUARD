// ═══════════════════════════════════════════════════════════════════
// v436.7 · EL PLANETA EN MINIATURA — la misma geografía, en pequeño
//
// No es un mapa nuevo ni una imagen: es el MISMO `world-paths.json` que usa el
// mapa de la casa y el taller, dibujado a 1000×500 con la MISMA proyección
// (rotate -10, center 0/20, scale 155). Si un punto cae en el mismo sitio en el
// mapa grande, cae en el mismo sitio aquí.
//
// Componente de servidor: cero JavaScript. Los puntos laten con CSS.
// ═══════════════════════════════════════════════════════════════════
import { geoMercator } from "d3-geo";
import worldPaths from "@/lib/world-paths.json";

const W = 1000;
const H = 500;

export type PuntoMini = { lat: number; lng: number; color?: string; nombre?: string };
export type TrazoMini = { puntos: [number, number][]; color?: string };

const proyeccion = geoMercator()
  .rotate([-10, 0])
  .center([0, 20])
  .scale(155)
  .translate([W / 2, H / 2 + 45]);

function xy(lat: number, lng: number): { x: number; y: number } {
  const p = proyeccion([lng, lat]);
  return { x: p?.[0] ?? 0, y: p?.[1] ?? 0 };
}

export function MiniMapa({
  puntos = [],
  trazos = [],
  clase = "",
  etiqueta = "Mapa del mundo",
  brillo = true,
}: {
  puntos?: PuntoMini[];
  trazos?: TrazoMini[];
  clase?: string;
  etiqueta?: string;
  brillo?: boolean;
}) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`vxm ${clase}`}
      role="img"
      aria-label={etiqueta}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="vxm-halo" cx="50%" cy="46%" r="58%">
          <stop offset="0%" stopColor="#FF9F45" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#FF9F45" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FF9F45" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vxm-tierra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b2734" />
          <stop offset="100%" stopColor="#0f1720" />
        </linearGradient>
      </defs>
      {brillo && <rect width={W} height={H} fill="url(#vxm-halo)" />}
      <path d={worldPaths.graticulePath} fill="none" stroke="#1a2733" strokeWidth={0.6} />
      <path d={worldPaths.landPath} fill="url(#vxm-tierra)" stroke="#2b3b4d" strokeWidth={0.6} />
      <path d={worldPaths.borderPath} fill="none" stroke="#31455c" strokeWidth={0.45} opacity={0.9} />
      {trazos.map((t, i) => (
        <path
          key={`t${i}`}
          d={t.puntos
            .map(([lat, lng], k) => {
              const { x, y } = xy(lat, lng);
              return `${k === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ")}
          fill="none"
          stroke={t.color ?? "#FFD166"}
          strokeWidth={1.8}
          strokeDasharray="7 5"
          strokeLinecap="round"
          opacity={0.95}
        />
      ))}
      {puntos.map((p, i) => {
        const { x, y } = xy(p.lat, p.lng);
        const c = p.color ?? "#FF9F45";
        return (
          <g key={`p${i}`}>
            <circle className="vxm-onde" cx={x} cy={y} r={4} fill="none" stroke={c} strokeWidth={1.1} opacity={0.55} style={{ animationDelay: `${(i % 5) * 0.45}s` }} />
            <circle cx={x} cy={y} r={3.2} fill={c} stroke="#05070a" strokeWidth={1} />
            <circle cx={x} cy={y} r={9} fill={c} opacity={0.08} />
          </g>
        );
      })}
    </svg>
  );
}
