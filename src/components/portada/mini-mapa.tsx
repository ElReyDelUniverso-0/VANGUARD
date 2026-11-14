// v400.0 — mini mapa de la página de lectura: un punto que late donde pasa
import Link from "next/link";
import { geoMercator } from "d3-geo";
import worldPaths from "@/lib/world-paths.json";

const proj = geoMercator()
  .rotate(worldPaths.proj.rotate as [number, number])
  .center(worldPaths.proj.center as [number, number])
  .scale(worldPaths.proj.scale)
  .translate(worldPaths.proj.translate as [number, number]);

export function MiniMapa({ coords, nombre }: { coords: [number, number]; nombre: string }) {
  const p = proj([coords[1], coords[0]]) ?? [500, 250];
  const vw = 300;
  const vh = 190;
  const x = Math.max(0, Math.min(1000 - vw, p[0] - vw / 2));
  const y = Math.max(0, Math.min(500 - vh, p[1] - vh / 2));
  return (
    <div className="vx-caja" style={{ padding: 0, overflow: "hidden" }}>
      <svg viewBox={`${x} ${y} ${vw} ${vh}`} style={{ display: "block", width: "100%", background: "#0e1320" }} role="img" aria-label={`Mapa: ${nombre}`}>
          <image href="/mapa-mundo.svg" x="0" y="0" width={1000} height={500} />
        <g className="vx-hot">
          <circle className="vx-onda" cx={p[0]} cy={p[1]} r="6" fill="#ff3b30" />
          <circle cx={p[0]} cy={p[1]} r="6" fill="#ff3b30" />
          <circle cx={p[0]} cy={p[1]} r="2.4" fill="#fff" />
        </g>
      </svg>
      <div style={{ padding: "14px 18px 18px" }}>
        <h3 style={{ margin: "0 0 10px" }}>{nombre}</h3>
        <Link href="/mundo" className="vx-btn" style={{ width: "100%", justifyContent: "center" }}>
          Ver en el mapa
        </Link>
      </div>
    </div>
  );
}
