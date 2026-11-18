"use client";

// ═══════════════════════════════════════════════════════════════════
// v411.0 · MAPA DEL LABORATORIO (SVG, sin dependencias)
//
// Proyección equirectangular 2:1 sobre un lienzo con retícula. No dibuja
// fronteras: dibuja el reparto que el modelo acaba de calcular —puntos con
// radio proporcional y rutas con grosor proporcional al tráfico—. Un mapa
// con fronteras de fondo fingiría una precisión política que el modelo no
// tiene; una retícula solo sitúa.
// ═══════════════════════════════════════════════════════════════════

import type { MapaLab } from "@/lib/labs/tipos";

interface Props {
  mapa: MapaLab;
}

const ANCHO = 720;
const ALTO = 360;

const px = (lng: number) => ((lng + 180) / 360) * ANCHO;
const py = (lat: number) => ((90 - lat) / 180) * ALTO;

export function MapaLabSvg({ mapa }: Props) {
  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full rounded-md border border-zinc-800" role="img" aria-label="Mapa de la simulación">
        <rect width={ANCHO} height={ALTO} fill="#0a0a0c" />
        {/* retícula cada 30° */}
        {Array.from({ length: 11 }, (_, i) => i * 30).map((lat) => (
          <line key={`p${lat}`} x1={0} x2={ANCHO} y1={py(lat - 60)} y2={py(lat - 60)} stroke="#18181b" strokeWidth={1} />
        ))}
        {Array.from({ length: 13 }, (_, i) => i * 30).map((lng) => (
          <line key={`m${lng}`} x1={px(lng - 180)} x2={px(lng - 180)} y1={0} y2={ALTO} stroke="#18181b" strokeWidth={1} />
        ))}
        {/* ecuador */}
        <line x1={0} x2={ANCHO} y1={py(0)} y2={py(0)} stroke="#27272a" strokeWidth={1.5} strokeDasharray="4 4" />

        {mapa.rutas.map((r) => {
          const [latA, lngA] = r.from;
          const [latB, lngB] = r.to;
          // Curva suave: los trazos rectos entre continentes parecían cables.
          const mx = (px(lngA) + px(lngB)) / 2;
          const my = (py(latA) + py(latB)) / 2 - Math.abs(px(lngB) - px(lngA)) * 0.08;
          return (
            <path
              key={r.id}
              d={`M${px(lngA)},${py(latA)} Q${mx},${my} ${px(lngB)},${py(latB)}`}
              fill="none"
              stroke={r.color}
              strokeOpacity={0.75}
              strokeWidth={Math.max(0.8, Math.min(7, r.peso * 5))}
              strokeLinecap="round"
            />
          );
        })}

        {mapa.puntos.map((p) => (
          <g key={p.id}>
            <circle cx={px(p.lng)} cy={py(p.lat)} r={Math.max(2.5, Math.min(14, p.radio))} fill={p.color} fillOpacity={0.22} stroke={p.color} strokeWidth={1.2} />
            <circle cx={px(p.lng)} cy={py(p.lat)} r={1.6} fill={p.color} />
            <text x={px(p.lng) + 8} y={py(p.lat) - 6} fontSize={9} fill="#d4d4d8" fontFamily="ui-monospace, monospace">
              {p.etiqueta}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-[11px] leading-relaxed text-zinc-500">{mapa.nota}</figcaption>
    </figure>
  );
}
