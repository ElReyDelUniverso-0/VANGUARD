// ═══════════════════════════════════════════════════════════════════
// v437.0 · WAR & HUMANITY · el mapa
//
// No es un mapa nuevo: es el MISMO `world-paths.json` de la casa (Natural
// Earth 110m) con la MISMA proyección del mapa grande y del taller. Lo que
// cambia es lo que se pone encima: una burbuja por país, con el radio en
// función de la cifra declarada del año elegido.
//
// Componente de servidor: cero JavaScript. Cada burbuja es un enlace, así que
// los filtros funcionan sin una línea de script.
// ═══════════════════════════════════════════════════════════════════
import { geoMercator } from "d3-geo";
import worldPaths from "@/lib/world-paths.json";
import { claseDeIntensidad, type Intensidad } from "@/lib/guerra/datos";

const W = 1000;
const H = 500;

const proyeccion = geoMercator()
  .rotate([-10, 0])
  .center([0, 20])
  .scale(155)
  .translate([W / 2, H / 2 + 45]);

function xy(lat: number, lng: number): { x: number; y: number } {
  const p = proyeccion([lng, lat]);
  return { x: p?.[0] ?? 0, y: p?.[1] ?? 0 };
}

export type PuntoGuerra = {
  iso3: string;
  nombre: string;
  lat: number;
  lng: number;
  valor: number;
  href: string;
  seleccionado?: boolean;
};

export const COLOR_INTENSIDAD: Record<Intensidad, string> = {
  alta: "#ef4444",
  media: "#f2b74a",
  baja: "#7fb2d9",
  "sin-dato": "#3f4c5a",
};

export function MapaGuerra({ puntos, maximo, etiqueta }: { puntos: PuntoGuerra[]; maximo: number; etiqueta: string }) {
  // el radio va con la raíz del valor: una burbuja del doble de área = el doble
  // de personas, que es como se lee una cifra sin mentir con el dibujo
  const radio = (v: number) => 2.5 + 22 * Math.sqrt(v / Math.max(1, maximo));

  const ordenados = [...puntos].sort((a, b) => b.valor - a.valor);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={etiqueta} className="vxgh-mapa" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="vxgh-tierra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2431" />
          <stop offset="100%" stopColor="#0e151d" />
        </radialGradient>
        <filter id="vxgh-brillo" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={W} height={H} fill="#070c12" />
      <path d={(worldPaths as { graticulePath: string }).graticulePath} fill="none" stroke="#16202c" strokeWidth={0.5} />
      <path d={(worldPaths as { landPath: string }).landPath} fill="url(#vxgh-tierra)" stroke="#2b3d50" strokeWidth={0.5} />
      <path d={(worldPaths as { borderPath: string }).borderPath} fill="none" stroke="#33475e" strokeWidth={0.35} />

      {/* primero las pequeñas, para que las grandes no las tapen */}
      {ordenados
        .slice()
        .reverse()
        .map((p) => {
          const { x, y } = xy(p.lat, p.lng);
          const r = radio(p.valor);
          const color = COLOR_INTENSIDAD[claseDeIntensidad(p.valor)];
          return (
            <a key={p.iso3} href={p.href} aria-label={`${p.nombre}: ${p.valor.toLocaleString("es-ES")}`}>
              <title>{`${p.nombre} · ${p.valor.toLocaleString("es-ES")}`}</title>
              <circle cx={x} cy={y} r={r} fill={color} fillOpacity={p.seleccionado ? 0.55 : 0.32} stroke={color} strokeWidth={p.seleccionado ? 1.6 : 0.9} filter="url(#vxgh-brillo)" />
              {p.seleccionado && <circle cx={x} cy={y} r={r + 4} fill="none" stroke="#f2b74a" strokeWidth={1} strokeDasharray="3 3" />}
            </a>
          );
        })}
    </svg>
  );
}
