"use client";

// ============================================================
// v111.0 MÁQUINA DEL TIEMPO — MINI-MAPA SÍSMICO (MURALLA)
// El comandante pidió un "mini-mapa de sismos en canvas para la
// MURALLA": el planeta entero con los sismos USGS EN VIVO laten-
// do sobre él + la posición de la ISS. Geografía REAL (Natural
// Earth vía world-paths.json) y la MISMA proyección Mercator del
// mapa de la casa — todo encaja pixel con pixel.
//   · Cero rAF: se pinta SOLO cuando llegan datos (canvas estático)
//   · Colores de magnitud heredados de la tarjeta de sismos
// ============================================================
import { useEffect, useRef } from "react";
import worldPaths from "@/lib/world-paths.json";
import { projectLatLng } from "@/components/vanguard/world-map-svg";

const W = 1000;
const H = 500;

function colorDeMag(m: number): string {
  if (m >= 6) return "#FF3B30";
  if (m >= 5) return "#FF9500";
  if (m >= 4) return "#FFC94D";
  return "#5EEAD4";
}

export function MiniMapaSismos({
  quakes,
  iss,
}: {
  quakes: { lat: number; lng: number; mag: number; time?: number }[];
  iss?: { lat?: number; lng?: number } | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // ── fondo oceánico + rejilla ──
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(6,14,16,0.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(94,234,212,0.10)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 100) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 100) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    // ecuador
    ctx.strokeStyle = "rgba(94,234,212,0.22)";
    ctx.setLineDash([6, 8]);
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.setLineDash([]);

    // ── continentes reales (Natural Earth) ──
    try {
      const land = new Path2D(worldPaths.landPath);
      ctx.fillStyle = "rgba(23,68,66,0.75)";
      ctx.strokeStyle = "rgba(94,234,212,0.35)";
      ctx.lineWidth = 1.2;
      ctx.fill(land);
      ctx.stroke(land);
    } catch { /* el mapa aguanta sin costa */ }

    // ── sismos: halo por magnitud + punto ──
    for (const q of quakes) {
      if (typeof q.lat !== "number" || typeof q.lng !== "number") continue;
      const p = projectLatLng(q.lat, q.lng);
      if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;
      const col = colorDeMag(q.mag);
      const r = 3 + Math.min(9, (q.mag - 3) * 2.4);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.6);
      g.addColorStop(0, `${col}AA`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(2.2, r * 0.42), 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // ── ISS: cruz blanca brillante ──
    if (iss && typeof iss.lat === "number" && typeof iss.lng === "number") {
      const p = projectLatLng(iss.lat, iss.lng);
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x - 6, p.y); ctx.lineTo(p.x + 6, p.y);
      ctx.moveTo(p.x, p.y - 6); ctx.lineTo(p.x, p.y + 6);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.stroke();
    }
  }, [quakes, iss]);

  const leyenda = [4, 5, 6];

  return (
    <div className="relative">
      <canvas
        ref={ref}
        width={W}
        height={H}
        className="w-full h-auto rounded-md border"
        style={{ borderColor: "rgba(94,234,212,0.25)", aspectRatio: "2 / 1" }}
        aria-label="Mapa sísmico mundial en vivo"
        role="img"
      />
      {/* leyenda de magnitudes + etiqueta ISS */}
      <div className="absolute bottom-1.5 left-2 flex items-center gap-2 pointer-events-none">
        {leyenda.map((m) => (
          <span key={m} className="inline-flex items-center gap-1 font-mono text-[7.5px] tracking-widest text-white/60">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: colorDeMag(m), boxShadow: `0 0 6px ${colorDeMag(m)}` }} />
            M{m}+
          </span>
        ))}
        <span className="inline-flex items-center gap-1 font-mono text-[7.5px] tracking-widest text-white/75">
          <span className="text-white font-bold">✛</span> ISS
        </span>
      </div>
      {!quakes.length && (
        <span className="absolute inset-0 grid place-items-center font-mono text-[10px] tracking-[0.3em] text-white/40 pointer-events-none">
          SIN SEÑAL USGS
        </span>
      )}
    </div>
  );
}
