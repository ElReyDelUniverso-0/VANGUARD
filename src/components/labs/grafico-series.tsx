"use client";

// ═══════════════════════════════════════════════════════════════════
// v411.0 · GRÁFICO DE SERIES DEL LABORATORIO
//
// SVG puro, sin librerías: el mismo resultado en servidor y en cliente, y
// ningún recurso externo que el iframe de vista previa no pueda cargar.
// Hover con línea de lectura: el visitante ve el valor de cada serie en el
// paso que señala, porque una curva sin números es una decoración.
// ═══════════════════════════════════════════════════════════════════

import { useMemo, useState } from "react";
import type { SerieLab } from "@/lib/labs/tipos";

interface Props {
  etiquetas: string[];
  series: (SerieLab & { valores: number[] })[];
  altura?: number;
  /** Series apagadas por el visitante (por campo). */
  ocultas: string[];
}

function fmt(v: number): string {
  const a = Math.abs(v);
  if (a >= 1000) return v.toLocaleString("es-ES", { maximumFractionDigits: 0 });
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

export function GraficoSeries({ etiquetas, series, altura = 280, ocultas }: Props) {
  const [indice, setIndice] = useState<number | null>(null);
  const ANCHO = 760;
  const MARGEN = { arriba: 14, derecha: 12, abajo: 26, izquierda: 46 };
  const w = ANCHO - MARGEN.izquierda - MARGEN.derecha;
  const h = altura - MARGEN.arriba - MARGEN.abajo;

  const visibles = series.filter((s) => !ocultas.includes(s.campo));

  const { min, max } = useMemo(() => {
    const vals = visibles.flatMap((s) => s.valores).filter((v) => Number.isFinite(v));
    if (!vals.length) return { min: 0, max: 1 };
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const pad = (hi - lo) * 0.08 || Math.abs(hi || 1) * 0.1;
    return { min: lo - pad, max: hi + pad };
  }, [visibles]);

  const n = Math.max(1, etiquetas.length - 1);
  const x = (i: number) => MARGEN.izquierda + (i / n) * w;
  const y = (v: number) => MARGEN.arriba + h - ((v - min) / Math.max(1e-9, max - min)) * h;

  const lineas = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    t,
    valor: max - t * (max - min),
    y: MARGEN.arriba + t * h,
  }));

  if (!visibles.length) {
    return (
      <p className="rounded border border-zinc-800 bg-zinc-900/40 p-6 text-center text-sm text-zinc-500">
        Todas las series están ocultas. Enciende alguna en la leyenda para ver la corrida.
      </p>
    );
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${ANCHO} ${altura}`}
        className="w-full"
        role="img"
        aria-label={`Gráfico de ${visibles.map((s) => s.nombre).join(", ")}`}
        onMouseLeave={() => setIndice(null)}
        onMouseMove={(ev) => {
          const caja = ev.currentTarget.getBoundingClientRect();
          const px = ((ev.clientX - caja.left) / caja.width) * ANCHO;
          const i = Math.round(((px - MARGEN.izquierda) / w) * n);
          setIndice(Math.max(0, Math.min(n, i)));
        }}
      >
        <rect x={0} y={0} width={ANCHO} height={altura} fill="#09090b" rx={6} />
        {lineas.map((l) => (
          <g key={l.t}>
            <line
              x1={MARGEN.izquierda}
              x2={MARGEN.izquierda + w}
              y1={l.y}
              y2={l.y}
              stroke="#27272a"
              strokeWidth={1}
            />
            <text x={MARGEN.izquierda - 6} y={l.y + 3} textAnchor="end" fontSize={9} fill="#71717a" fontFamily="ui-monospace, monospace">
              {fmt(l.valor)}
            </text>
          </g>
        ))}

        {visibles.map((s) => {
          const d = s.valores
            .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
            .join(" ");
          return (
            <g key={s.campo}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          );
        })}

        {indice !== null && (
          <g>
            <line
              x1={x(indice)}
              x2={x(indice)}
              y1={MARGEN.arriba}
              y2={MARGEN.arriba + h}
              stroke="#52525b"
              strokeDasharray="3 3"
            />
            {visibles.map((s) => (
              <circle key={s.campo} cx={x(indice)} cy={y(s.valores[indice] ?? 0)} r={3} fill={s.color} />
            ))}
          </g>
        )}

        <text x={MARGEN.izquierda} y={altura - 8} fontSize={9} fill="#71717a" fontFamily="ui-monospace, monospace">
          {etiquetas[0]}
        </text>
        <text x={MARGEN.izquierda + w} y={altura - 8} fontSize={9} fill="#71717a" textAnchor="end" fontFamily="ui-monospace, monospace">
          {etiquetas[etiquetas.length - 1]}
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-widest">
        {series.map((s) => {
          const apagada = ocultas.includes(s.campo);
          return (
            <span
              key={s.campo}
              className={apagada ? "text-zinc-600 line-through" : "text-zinc-400"}
              style={{ borderLeft: `3px solid ${apagada ? "#3f3f46" : s.color}`, paddingLeft: 6 }}
            >
              {s.nombre}
            </span>
          );
        })}
      </div>

      {indice !== null && (
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-[11px] text-zinc-300">
          <span className="text-amber-300">{etiquetas[indice]}</span>
          {visibles.map((s) => (
            <span key={s.campo}>
              <span style={{ color: s.color }}>{s.nombre}</span>: {fmt(s.valores[indice] ?? 0)}
              {s.unidad ? ` ${s.unidad}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
