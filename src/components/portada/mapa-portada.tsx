// v400.0 EL MAPA VIVO EN LA PORTADA — mapa plano real (Natural Earth, el
// mismo de la casa) con un punto que late por cada frente con noticias de
// hoy. Tamaño del punto = cuántas notas lo citan. SVG puro de servidor.
import Link from "next/link";
import { geoMercator } from "d3-geo";
import worldPaths from "@/lib/world-paths.json";
import { CONFLICTOS } from "@/lib/portada/clasificar";
import type { Nota } from "@/lib/portada/notas";

const W = worldPaths.width as number;
const H = worldPaths.height as number;
const proj = geoMercator()
  .rotate(worldPaths.proj.rotate as [number, number])
  .center(worldPaths.proj.center as [number, number])
  .scale(worldPaths.proj.scale)
  .translate(worldPaths.proj.translate as [number, number]);

function color(n: number) {
  if (n >= 6) return "#ff3b30";
  if (n >= 3) return "#f59e0b";
  return "#3dd6f5";
}

export function MapaPortada({ notas }: { notas: Nota[] }) {
  const frentes = CONFLICTOS.map((c) => ({ ...c, n: notas.filter((x) => x.conflicto === c.key).length }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n);

  return (
    <div className="vx-mapa">
      <div className="vx-mapa-lista">
        <h3>Conflictos activos</h3>
        <span className="vx-meta">Según las noticias de las últimas 72 h</span>
        <ul>
          {frentes.slice(0, 8).map((c) => (
            <li key={c.key}>
              <Link href={c.teatro ? `/conflicto/${c.teatro}` : "/guerra-hoy"}>
                <span className="vx-sev" style={{ background: color(c.n), boxShadow: `0 0 10px ${color(c.n)}` }} />
                {c.nombre}
                <b>{c.n} {c.n === 1 ? "nota" : "notas"}</b>
              </Link>
            </li>
          ))}
          {!frentes.length && <li className="vx-meta">Sin frentes con noticias ahora mismo.</li>}
        </ul>
      </div>
      <div className="vx-mapa-svg">
        <svg viewBox={`0 40 ${W} ${H - 70}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="Mapa de conflictos activos">
          <defs>
            <pattern id="vx-puntos" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.05)" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="url(#vx-puntos)" />
          <image href="/mapa-mundo.svg" x="0" y="0" width={1000} height={500} />
          {frentes.map((c) => {
            const p = proj([c.coords[1], c.coords[0]]);
            if (!p) return null;
            const r = Math.min(9, 3.5 + c.n * 0.7);
            const col = color(c.n);
            return (
              <g key={c.key} className="vx-hot">
                <circle className="vx-onda" cx={p[0]} cy={p[1]} r={r} fill={col} opacity="0.6" />
                <circle cx={p[0]} cy={p[1]} r={r} fill={col} opacity="0.95" />
                <circle cx={p[0]} cy={p[1]} r={r * 0.4} fill="#fff" />
                <text x={p[0] + r + 5} y={p[1] + 4} fill="#dfe5ee" fontSize="12" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">
                  {c.nombre}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="vx-mapa-cta">
          <Link href="/mundo" className="vx-btn">
            Abrir el mapa 3D →
          </Link>
        </div>
      </div>
    </div>
  );
}
