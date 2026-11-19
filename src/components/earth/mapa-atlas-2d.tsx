"use client";

// ═══════════════════════════════════════════════════════════════════
// v416.0 VANGUARD EARTH SYSTEM — EL ATLAS 2D.
//
// El otro lado de la misma moneda: el globo 3D y este atlas plano beben de
// los mismos polígonos (Natural Earth 110m, src/lib/world-geo.ts) y del mismo
// registro de capas. Lo que aquí se elige, el globo lo hereda; lo que el
// globo vuelca, aquí queda seleccionado. Por eso la transición 2D↔3D no
// reinicia nada: es la misma selección mirada desde otro ángulo.
//
// Pensado para el bolsillo: el plano pesa lo que pesa un SVG y en aparatos de
// baja potencia es la vista por defecto (la decide el explorador, no esto).
// ═══════════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { COUNTRY_FEATURES } from "@/lib/world-geo";
import { COLOR_HITO, type Hito } from "@/lib/earth/hitos";

interface PuntoAtlas {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  color: string;
  tamano?: number;
}

export interface MapaAtlas2DProps {
  /** num ISO → color del país (capa de regiones); null = fondo neutro */
  colores?: Record<string, string> | null;
  /** hitos que se pintan encima del plano */
  hitos?: Hito[];
  /** puntos de capa (lugares, teatros, guerras) */
  puntos?: PuntoAtlas[];
  seleccionado?: string | null;
  graticula?: boolean;
  onCountryClick?: (num: string, nombre: string) => void;
  onPuntoClick?: (p: PuntoAtlas) => void;
  altura?: number;
  ariaLabel?: string;
}

const ANCHO = 960;
const ALTO = 500;

export function MapaAtlas2D({
  colores = null,
  hitos = [],
  puntos = [],
  seleccionado = null,
  graticula = false,
  onCountryClick,
  onPuntoClick,
  altura = 420,
  ariaLabel = "Atlas mundial 2D",
}: MapaAtlas2DProps) {
  const { path, proyecta, tracepaises } = useMemo(() => {
    const proyecta = geoNaturalEarth1().fitExtent(
      [
        [8, 8],
        [ANCHO - 8, ALTO - 8],
      ],
      { type: "Sphere" },
    );
    const path = geoPath(proyecta);
    const tracepaises = COUNTRY_FEATURES.map((f) => {
      try {
        return { id: String(f.id ?? ""), nombre: f.properties?.name ?? "", d: path(f) ?? "" };
      } catch {
        return null;
      }
    }).filter((x): x is { id: string; nombre: string; d: string } => Boolean(x));
    return { path, proyecta, tracepaises };
  }, []);

  const reticulado = useMemo(() => {
    if (!graticula) return "";
    try {
      return path(geoGraticule10()) ?? "";
    } catch {
      return "";
    }
  }, [graticula, path]);

  const xy = (lat: number, lng: number): [number, number] | null => {
    try {
      const p = proyecta([lng, lat]);
      return p ? [p[0], p[1]] : null;
    } catch {
      return null;
    }
  };

  return (
    <svg
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      width="100%"
      style={{ height: altura, display: "block", background: "transparent" }}
      role="img"
      aria-label={ariaLabel}
    >
      {/* el marco del planeta: la esfera recortada por la proyección */}
      <path d={path({ type: "Sphere" }) ?? ""} fill="rgba(20,34,54,0.35)" stroke="rgba(120,150,220,0.18)" strokeWidth={0.6} />
      {reticulado && (
        <path d={reticulado} fill="none" stroke="rgba(120,150,220,0.10)" strokeWidth={0.5} />
      )}
      {tracepaises.map((p) => {
        const color = colores && p.id ? colores[p.id] : null;
        const esSel = seleccionado === p.id;
        return (
          <path
            key={p.id || p.nombre}
            d={p.d}
            fill={color ?? "rgba(148,163,205,0.10)"}
            stroke={esSel ? "#FFD166" : "rgba(120,150,220,0.22)"}
            strokeWidth={esSel ? 1.6 : 0.4}
            style={{ cursor: onCountryClick ? "pointer" : "default" }}
            onClick={() => onCountryClick?.(p.id, p.nombre)}
          >
            <title>{`${p.nombre}${color ? "" : ""}`}</title>
          </path>
        );
      })}
      {hitos.map((h) => {
        const p = xy(h.lat, h.lng);
        if (!p) return null;
        return (
          <g key={h.id} style={{ cursor: "default" }}>
            <circle cx={p[0]} cy={p[1]} r={4.5} fill={COLOR_HITO[h.tipo]} opacity={0.22} />
            <circle cx={p[0]} cy={p[1]} r={1.7} fill={COLOR_HITO[h.tipo]} stroke="#0A0A0F" strokeWidth={0.5} />
            <title>{`${h.nombre} · ${h.tipo}`}</title>
          </g>
        );
      })}
      {puntos.map((p) => {
        const q = xy(p.lat, p.lng);
        if (!q) return null;
        return (
          <g
            key={p.id}
            style={{ cursor: onPuntoClick ? "pointer" : "default" }}
            onClick={() => onPuntoClick?.(p)}
          >
            <circle cx={q[0]} cy={q[1]} r={(p.tamano ?? 0.35) * 9} fill={p.color} opacity={0.28} />
            <circle cx={q[0]} cy={q[1]} r={2.4} fill={p.color} stroke="#0A0A0F" strokeWidth={0.6} />
            <title>{p.nombre}</title>
          </g>
        );
      })}
    </svg>
  );
}
