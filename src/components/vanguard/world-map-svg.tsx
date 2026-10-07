"use client";

// Mapa mundial detallado (geografia real Natural Earth via world-paths.json)
// Soporta: marcadores de conflicto, camaras del jugador con radio de vision,
// y modo despliegue (click en cualquier punto del mundo -> lat/lng).
import { useMemo, useCallback } from "react";
import worldPaths from "@/lib/world-paths.json";
import { geoMercator } from "d3-geo";
import type { ConflictRegion } from "@/lib/game-data";
import type { PlacedCamera } from "@/lib/game-store";
import { getCameraModel } from "@/lib/camera-data";
import { FlagBadge } from "./flag-badge";
import { cn } from "@/lib/utils";

const WIDTH = 1000;
const HEIGHT = 500;

const projection = geoMercator()
  .rotate([-10, 0])
  .center([0, 20])
  .scale(155)
  .translate([WIDTH / 2, HEIGHT / 2 + 45]);

export function projectLatLng(lat: number, lng: number): { x: number; y: number } {
  const p = projection([lng, lat]);
  return { x: p?.[0] ?? 0, y: p?.[1] ?? 0 };
}

export function unprojectXY(x: number, y: number): { lat: number; lng: number } {
  const inv = projection.invert?.([x, y]);
  return { lng: inv?.[0] ?? 0, lat: inv?.[1] ?? 0 };
}

export interface MapRoute {
  id: string;
  from: [number, number]; // [lat, lng]
  to: [number, number];
  color: string;
  label?: string;
}

export interface WorldMapProps {
  conflicts?: ConflictRegion[];
  selected?: string | null;
  onSelectConflict?: (id: string) => void;
  cameras?: PlacedCamera[];
  selectedCamera?: string | null;
  onSelectCamera?: (id: string) => void;
  // modo despliegue: cursor personalizado + callback al hacer click en el mapa
  deployMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  showFronts?: boolean;
  showSat?: boolean;
  showGrid?: boolean;
  // rutas animadas (redes de narcotrafico / afiliaciones yihadistas / crimen)
  routes?: MapRoute[];
  // color personalizado por id de conflicto (modos de amenaza)
  customColors?: Record<string, string>;
  // v86.0 CENTINELA: pings genéricos (aviones/buques del espectro en vivo)
  pings?: MapPing[];
  // v86.0 CENTINELA: capas tácticas conmutables (bases, energía, exclusiones…)
  capas?: CapaTactica[];
  className?: string;
}

export interface MapPing {
  id: string;
  lat: number;
  lng: number;
  color: string;
  tipo: "AVION_MIL" | "AVION_CIVIL" | "BUQUE_GUERRA" | "BUQUE_CIVIL";
  etiqueta?: string;
}

export interface CapaTactica {
  id: string;
  tipo: "BASE" | "ENERGIA" | "EXCLUSION" | "BLOQUEO" | "POBLACION" | "SUMINISTRO";
  nombre: string;
  lat?: number;
  lng?: number;
  puntos?: [number, number][]; // secuencia [lat,lng] para trazos (oleoductos, rutas)
  color?: string;
}

export function WorldMapSVG({
  conflicts = [],
  selected = null,
  onSelectConflict,
  cameras = [],
  selectedCamera = null,
  onSelectCamera,
  deployMode = false,
  onMapClick,
  showFronts = true,
  showSat = false,
  showGrid = true,
  routes = [],
  pings = [],
  capas = [],
  customColors,
  className,
}: WorldMapProps) {
  const land = useMemo(() => worldPaths.landPath, []);
  const borders = useMemo(() => worldPaths.borderPath, []);
  const graticule = useMemo(() => worldPaths.graticulePath, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!deployMode || !onMapClick) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
      const y = ((e.clientY - rect.top) / rect.height) * HEIGHT;
      const { lat, lng } = unprojectXY(x, y);
      onMapClick(Math.max(-78, Math.min(80, lat)), Math.max(-179, Math.min(179, lng)));
    },
    [deployMode, onMapClick]
  );

  const levelColor = (c: ConflictRegion) =>
    customColors?.[c.id] ?? (c.level === "CRITICO" ? "#ef4444" : c.level === "TENSION" ? "#f59e0b" : c.level === "INESTABILIDAD" ? "#a855f7" : "#22d3ee");

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn("w-full h-full block", deployMode && "cursor-crosshair", className)}
      style={{ aspectRatio: "2/1", minHeight: 300, maxHeight: "72vh" }}
      onClick={handleClick}
    >
      <defs>
        {/* v74.0 GRAN OCASO: océano nocturno con horizonte de brasa al sur */}
        <radialGradient id="wm-ocean" cx="50%" cy="34%" r="95%">
          <stop offset="0%" stopColor={showSat ? "#0c1e17" : "#0d1120"} />
          <stop offset="62%" stopColor={showSat ? "#060c08" : "#070912"} />
          <stop offset="100%" stopColor={showSat ? "#160d06" : "#180d0a"} />
        </radialGradient>
        <linearGradient id="wm-land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={showSat ? "#14261b" : "#171d30"} />
          <stop offset="100%" stopColor={showSat ? "#0a1409" : "#0d1120"} />
        </linearGradient>
        <pattern id="wm-grid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(217,167,32,0.05)" strokeWidth="0.5" />
        </pattern>
        <filter id="wm-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={WIDTH} height={HEIGHT} fill="url(#wm-ocean)" />
      {showGrid && <rect width={WIDTH} height={HEIGHT} fill="url(#wm-grid)" />}
      <path d={graticule} fill="none" stroke="rgba(217,167,32,0.07)" strokeWidth="0.4" />

      {/* Continentes reales */}
      <path d={land} fill="url(#wm-land)" stroke={showSat ? "#1f4030" : "rgba(217,167,32,0.4)"} strokeWidth="0.7" />
      <path d={borders} fill="none" stroke="rgba(150,150,170,0.14)" strokeWidth="0.4" />

      {/* Rutas de red (narcotrafico / afiliaciones) — v81: balizas vivas + convoy que viaja */}
      {routes.length > 0 && (
        <g fill="none">
          {routes.map((r) => {
            const a = projectLatLng(r.from[0], r.from[1]);
            const b = projectLatLng(r.to[0], r.to[1]);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.18 - 14;
            const d = `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
            return (
              <g key={`rt-${r.id}`}>
                <path d={d} stroke={r.color} strokeWidth="1.1" opacity="0.22" strokeDasharray="5 4" />
                <path d={d} stroke={r.color} strokeWidth="1.6" opacity="0.75" strokeDasharray="10 90" className="route-flow" />
                {/* v81: el convoy viaja por la ruta (SVG nativo, sin JS) */}
                <circle r="2.1" fill={r.color} opacity="0.95" filter="url(#wm-glow)">
                  <animateMotion dur="6s" repeatCount="indefinite" path={d} />
                </circle>
                <circle cx={a.x} cy={a.y} r="2.6" fill={r.color} opacity="0.9" />
                <circle cx={b.x} cy={b.y} r="2.6" fill={r.color} opacity="0.9" />
                {/* v81: baliza morse en cada extremo de la ruta */}
                <circle cx={a.x} cy={a.y} r="5" fill="none" stroke={r.color} strokeWidth="0.8" className="beacon" style={{ color: r.color }} />
                <circle cx={b.x} cy={b.y} r="5" fill="none" stroke={r.color} strokeWidth="0.8" className="beacon" style={{ color: r.color, animationDelay: "0.7s" }} />
                {r.label && (
                  <text x={mx} y={my - 4} fill={r.color} fontSize="8.5" fontFamily="monospace" opacity="0.85" textAnchor="middle">
                    {r.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      )}

      {/* Frentes (lineas) — v81: guiones en marcha, la línea vive */}
      {showFronts && conflicts.length > 0 && (
        <g fill="none" stroke="rgba(255,80,80,0.4)" strokeWidth="1">
          {conflicts.slice(0, 8).map((c) => {
            const p = projectLatLng(c.lat, c.lng);
            return <circle key={`f-${c.id}`} cx={p.x} cy={p.y} r={6 + (c.intensity / 100) * 10} opacity={0.3} className="frente-marcha" />;
          })}
        </g>
      )}

      {/* Radios de camaras */}
      <g>
        {cameras.map((cam) => {
          const p = projectLatLng(cam.lat, cam.lng);
          const model = getCameraModel(cam.modelId);
          const r = model.radiusDeg * 3.1;
          const isSel = selectedCamera === cam.id;
          return (
            <g key={`cr-${cam.id}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={isSel ? "rgba(34,211,238,0.10)" : "rgba(34,211,238,0.045)"}
                stroke={isSel ? "rgba(34,211,238,0.75)" : "rgba(34,211,238,0.3)"}
                strokeWidth={isSel ? 1.4 : 0.7}
                strokeDasharray="4 3"
              />
              {/* icono de camara */}
              <g
                style={{ cursor: onSelectCamera ? "pointer" : "default" }}
                onClick={(e) => {
                  if (onSelectCamera) {
                    e.stopPropagation();
                    onSelectCamera(cam.id);
                  }
                }}
              >
                <circle cx={p.x} cy={p.y} r={isSel ? 6 : 4.5} fill="#22d3ee" stroke="#0b0f1c" strokeWidth="1" filter={isSel ? "url(#wm-glow)" : undefined} />
                <path
                  d={`M ${p.x - 2.4} ${p.y - 1.6} h 3.4 l 1.4 -1.4 v 6 l -1.4 -1.4 h -3.4 z`}
                  fill="#0b0f1c"
                  transform={`translate(0, -1)`}
                />
              </g>
              {isSel && (
                <text x={p.x + 9} y={p.y - 6} fill="#22d3ee" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
                  {cam.id} · {cam.name}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* Marcadores de conflicto — v81: sonar + retícula de designación */}
      <g>
        {conflicts.map((c) => {
          const p = projectLatLng(c.lat, c.lng);
          const isSel = selected === c.id;
          const color = levelColor(c);
          const radius = 3.5 + (c.intensity / 100) * 5;
          const esCaliente = c.level === "CRITICO" || isSel;
          return (
            <g
              key={c.id}
              style={{ cursor: onSelectConflict ? "pointer" : "default" }}
              onClick={(e) => {
                if (onSelectConflict) {
                  e.stopPropagation();
                  onSelectConflict(c.id);
                }
              }}
              filter={isSel ? "url(#wm-glow)" : undefined}
            >
              <circle cx={p.x} cy={p.y} r={radius * 2.6} fill={color} opacity={0.1} />
              {/* v81: pings de sonar en zonas calientes — el mapa emite señal */}
              {esCaliente && (
                <g>
                  <circle cx={p.x} cy={p.y} r={radius * 3.4} fill="none" stroke={color} strokeWidth="1" className="ping-sonar" />
                  <circle cx={p.x} cy={p.y} r={radius * 3.4} fill="none" stroke={color} strokeWidth="1" className="ping-sonar" />
                  <circle cx={p.x} cy={p.y} r={radius * 3.4} fill="none" stroke={color} strokeWidth="1" className="ping-sonar" />
                </g>
              )}
              <circle cx={p.x} cy={p.y} r={radius} fill={color} opacity={0.9} stroke="#fff" strokeWidth={isSel ? 1.4 : 0.5} />
              <circle
                cx={p.x}
                cy={p.y}
                r={radius * 1.7}
                fill="none"
                stroke={color}
                strokeWidth="0.9"
                opacity={0.55}
                className={isSel ? "blink-soft" : undefined}
              />
              {/* v81: retícula de objetivo sobre el conflicto seleccionado — corona giratoria + corchetes */}
              {isSel && (
                <g transform={`translate(${p.x}, ${p.y})`}>
                  <g className="corona-blanco">
                    <circle r={radius * 4.2} fill="none" stroke={color} strokeWidth="1" strokeDasharray="10 7" opacity="0.8" />
                    {[0, 90, 180, 270].map((ang) => (
                      <line
                        key={ang}
                        x1={0}
                        y1={-radius * 4.9}
                        x2={0}
                        y2={-radius * 3.6}
                        stroke={color}
                        strokeWidth="1.4"
                        transform={`rotate(${ang})`}
                        opacity="0.9"
                      />
                    ))}
                  </g>
                  <rect
                    x={-radius * 2.6}
                    y={-radius * 2.6}
                    width={radius * 5.2}
                    height={radius * 5.2}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.8"
                    strokeDasharray="6 4"
                    opacity="0.5"
                  />
                </g>
              )}
              {isSel && (
                <g transform={`translate(${p.x + radius + 4}, ${p.y + 4})`}>
                  <text fill={color} fontSize="11" fontFamily="monospace" fontWeight="bold">
                    {c.name.toUpperCase()}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>

      {/* v86.0 CAPAS TÁCTICAS conmutables — bajo los marcadores vivos */}
      {capas.length > 0 && (
        <g>
          {capas.map((c) => {
            const color = c.color ?? "#00FF87";
            if (c.tipo === "BASE" && c.lat != null && c.lng != null) {
              const p = projectLatLng(c.lat, c.lng);
              return (
                <g key={`cp-${c.id}`}>
                  <rect x={p.x - 5} y={p.y - 3.4} width={10} height={6.8} fill={`${color}2e`} stroke={color} strokeWidth="0.9" />
                  <text x={p.x + 7.5} y={p.y + 2.4} fill={color} fontSize="6.2" fontFamily="monospace" opacity="0.85">{c.nombre}</text>
                </g>
              );
            }
            if ((c.tipo === "ENERGIA" || c.tipo === "SUMINISTRO") && c.puntos && c.puntos.length >= 2) {
              const d = c.puntos.map(([la, lo], i) => {
                const p = projectLatLng(la, lo);
                return `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
              }).join(" ");
              return (
                <g key={`cp-${c.id}`}>
                  <path d={d} fill="none" stroke={color} strokeWidth="1.6" opacity="0.55" strokeDasharray={c.tipo === "ENERGIA" ? "7 4" : "2 5"} strokeLinecap="round" />
                  <text x={projectLatLng(c.puntos[0][0], c.puntos[0][1]).x} y={projectLatLng(c.puntos[0][0], c.puntos[0][1]).y - 6} fill={color} fontSize="6.4" fontFamily="monospace" opacity="0.9">{c.nombre}</text>
                </g>
              );
            }
            if (c.tipo === "EXCLUSION" && c.lat != null && c.lng != null) {
              const p = projectLatLng(c.lat, c.lng);
              return (
                <g key={`cp-${c.id}`}>
                  <circle cx={p.x} cy={p.y} r={26} fill="rgba(255,70,85,0.07)" stroke="rgba(255,70,85,0.55)" strokeWidth="0.9" strokeDasharray="6 4" />
                  <line x1={p.x - 8} y1={p.y - 8} x2={p.x + 8} y2={p.y + 8} stroke="rgba(255,70,85,0.7)" strokeWidth="1" />
                  <line x1={p.x - 8} y1={p.y + 8} x2={p.x + 8} y2={p.y - 8} stroke="rgba(255,70,85,0.7)" strokeWidth="1" />
                  <text x={p.x} y={p.y + 38} fill="rgba(255,70,85,0.85)" fontSize="6.2" fontFamily="monospace" textAnchor="middle">{c.nombre}</text>
                </g>
              );
            }
            if (c.tipo === "BLOQUEO" && c.lat != null && c.lng != null) {
              const p = projectLatLng(c.lat, c.lng);
              return (
                <g key={`cp-${c.id}`}>
                  <circle cx={p.x} cy={p.y} r={5.5} fill="none" stroke={color} strokeWidth="1.1" />
                  <path d={`M ${p.x - 3.4} ${p.y + 1} h 6.8 M ${p.x - 3.4} ${p.y + 3.4} h 4.4`} stroke={color} strokeWidth="1.1" />
                  <text x={p.x + 8} y={p.y + 3} fill={color} fontSize="6.2" fontFamily="monospace" opacity="0.85">{c.nombre}</text>
                </g>
              );
            }
            if (c.tipo === "POBLACION" && c.lat != null && c.lng != null) {
              const p = projectLatLng(c.lat, c.lng);
              return (
                <g key={`cp-${c.id}`}>
                  <circle cx={p.x} cy={p.y} r={3.4} fill={color} opacity="0.22" />
                  <circle cx={p.x} cy={p.y} r={1.6} fill={color} opacity="0.85" />
                </g>
              );
            }
            return null;
          })}
        </g>
      )}

      {/* v86.0 PINGS del espectro en vivo (aviones y buques) — encima de todo */}
      {pings.length > 0 && (
        <g>
          {pings.map((p) => {
            const pt = projectLatLng(p.lat, p.lng);
            const glifo =
              p.tipo === "AVION_MIL" || p.tipo === "AVION_CIVIL"
                ? "M 0 -3 L 2.4 2.6 L 0 1.2 L -2.4 2.6 Z"
                : "M -2.6 2.2 L -2.6 -0.4 L 0 -2.4 L 2.6 -0.4 L 2.6 2.2 Z";
            return (
              <g key={p.id} filter={p.tipo === "AVION_MIL" || p.tipo === "BUQUE_GUERRA" ? "url(#wm-glow)" : undefined}>
                <circle cx={pt.x} cy={pt.y} r={4.6} fill={p.color} opacity="0.12" />
                <path d={glifo} fill={p.color} transform={`translate(${pt.x}, ${pt.y})`} opacity="0.95" />
                {p.etiqueta && (
                  <text x={pt.x + 6} y={pt.y - 3} fill={p.color} fontSize="5.6" fontFamily="monospace" opacity="0.75">{p.etiqueta}</text>
                )}
              </g>
            );
          })}
        </g>
      )}

    </svg>
  );
}

// Chip de coordenadas
export function CoordChip({ lat, lng }: { lat: number; lng: number }) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return (
    <span className="text-[10px] font-mono text-cyan-hud">
      {Math.abs(lat).toFixed(1)}°{ns} {Math.abs(lng).toFixed(1)}°{ew}
    </span>
  );
}

export { FlagBadge };
