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
// v112.0 SOLSTICIO — el planeta de la MURALLA respira de verdad:
//   · TERMINADOR SOLAR REAL por columnas: declinación + ecuación
//     del tiempo — la noche cae exactamente donde cae ahora (la
//     elipse aproximada del mapa grande, pero matemática fina),
//     con crepúsculo suave y el disco solar en su punto subsolar.
//   · PATRULLAS EN VIVO: las 10 rutas militares de la casa
//     (naval/aérea/dron) cruzando el mapa como convoyes con
//     estela — vía SVG animateMotion, CERO rAF (el contrato
//     60 FPS queda intacto: el canvas sigue estático).
// ============================================================
import { useEffect, useRef, useState } from "react";
import worldPaths from "@/lib/world-paths.json";
import { projectLatLng, unprojectXY } from "@/components/vanguard/world-map-svg";
import { PATRULLAS, type MapPatrulla } from "@/lib/patrullas";

const W = 1000;
const H = 500;

function colorDeMag(m: number): string {
  if (m >= 6) return "#FF3B30";
  if (m >= 5) return "#FF9500";
  if (m >= 4) return "#FFC94D";
  return "#5EEAD4";
}

// ── v112 SOLSTICIO: geometría del Sol AHORA MISMO ──
// Declinación δ (aprox. precisa ±0.2°) y ecuación del tiempo (±15 s):
// suficiente para pintar la noche donde la Tierra la pinta de verdad.
function solAhora(): { dec: number; lngSub: number } {
  const ahora = new Date();
  const inicio = Date.UTC(ahora.getUTCFullYear(), 0, 0);
  const N = Math.floor((ahora.getTime() - inicio) / 86_400_000); // día del año
  const dec = 23.44 * Math.sin((2 * Math.PI * (284 + N)) / 365); // grados
  const B = (2 * Math.PI * (N - 81)) / 364;
  const eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // minutos
  const hUtc = ahora.getUTCHours() + ahora.getUTCMinutes() / 60 + ahora.getUTCSeconds() / 3600;
  const lngSub = -15 * (hUtc + eot / 60 - 12); // longitud subsolar (grados)
  return { dec, lngSub: ((lngSub + 540) % 360) - 180 };
}

// ── v112: la noche por columnas — latitud del terminador en cada longitud ──
// tan(φb) = −cos(H)/tan(δ) · H = longitud − longitud subsolar.
// δ > 0 (sol en el norte): la noche va del sur hasta φb · δ < 0: del φb al norte.
function latitudTerminador(lng: number, dec: number, lngSub: number): number {
  const H = ((lng - lngSub) * Math.PI) / 180;
  const d = (dec * Math.PI) / 180;
  const tanD = Math.tan(d);
  if (Math.abs(tanD) < 1e-4) return Math.cos(H) > 0 ? -90 : 90; // equinoccio: circulo polar
  return (Math.atan(-Math.cos(H) / tanD) * 180) / Math.PI;
}

function dibujarNoche(ctx: CanvasRenderingContext2D, dec: number, lngSub: number) {
  const paso = 4; // columnas de 4 px — curva lisa a coste mínimo
  for (let x = 0; x <= W; x += paso) {
    const lng = unprojectXY(x, H / 2).lng;
    const phiB = latitudTerminador(lng, dec, lngSub);
    const yB = Math.max(0, Math.min(H, projectLatLng(phiB, lng).y));
    const solEnNorte = dec > 0;
    // noche = del terminador al polo que NO ve el sol
    const yTop = solEnNorte ? yB : 0;
    const yBot = solEnNorte ? H : yB;
    if (yBot - yTop < 1) continue;
    // crepúsculo: banda suave de 26 px junto a la línea
    const g = ctx.createLinearGradient(0, yTop, 0, yBot);
    const borde = solEnNorte ? 0 : 1;
    g.addColorStop(borde, "rgba(2,8,18,0.06)");
    g.addColorStop(0.18, "rgba(2,8,18,0.34)");
    g.addColorStop(1, "rgba(1,5,12,0.5)");
    ctx.fillStyle = g;
    ctx.fillRect(x, yTop, paso, yBot - yTop);
    // la línea del crepúsculo, un filo azul frío
    ctx.fillStyle = "rgba(120,150,220,0.35)";
    ctx.fillRect(x, yB - 0.5, paso, 1);
  }
  // el disco solar en su punto subsolar (el corazón del día)
  const sol = projectLatLng(dec, lngSub);
  if (sol.x > -20 && sol.x < W + 20 && sol.y > -20 && sol.y < H + 20) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,214,110,0.85)";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(sol.x + Math.cos(a) * 7, sol.y + Math.sin(a) * 7);
      ctx.lineTo(sol.x + Math.cos(a) * 11, sol.y + Math.sin(a) * 11);
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(sol.x, sol.y, 0, sol.x, sol.y, 16);
    g.addColorStop(0, "rgba(255,214,110,0.9)");
    g.addColorStop(0.4, "rgba(255,214,110,0.28)");
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sol.x, sol.y, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#FFD66E";
    ctx.beginPath(); ctx.arc(sol.x, sol.y, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ── v112: patrulla → geometría SVG (línea + convoy con animateMotion) ──
function rutaPatrulla(p: MapPatrulla): { d: string; x1: number; y1: number; x2: number; y2: number } | null {
  const a = projectLatLng(p.from[0], p.from[1]);
  const b = projectLatLng(p.to[0], p.to[1]);
  if ([a.x, a.y, b.x, b.y].some((v) => !Number.isFinite(v))) return null;
  return { d: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}

export function MiniMapaSismos({
  quakes,
  iss,
}: {
  quakes: { lat: number; lng: number; mag: number; time?: number }[];
  iss?: { lat?: number; lng?: number } | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  // v112: el terminador se mueve ~0.25°/min — un repaso cada 60 s basta
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(iv);
  }, []);

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

    // ── v112 TERMINADOR SOLAR REAL — la noche cae donde cae AHORA ──
    try {
      const { dec, lngSub } = solAhora();
      dibujarNoche(ctx, dec, lngSub);
    } catch { /* sin sol el mapa aguanta */ }

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
  }, [quakes, iss, tick]);

  const leyenda = [4, 5, 6];

  return (
    <div className="relative">
      <canvas
        ref={ref}
        width={W}
        height={H}
        className="w-full h-auto rounded-md border"
        style={{ borderColor: "rgba(94,234,212,0.25)", aspectRatio: "2 / 1" }}
        aria-label="Mapa sísmico mundial en vivo con terminador solar y patrullas"
        role="img"
      />
      {/* v112 PATRULLAS EN VIVO — convoyes cruzando el planeta (SVG, 0 rAF) */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
      >
        {PATRULLAS.map((p) => {
          const r = rutaPatrulla(p);
          if (!r) return null;
          return (
            <g key={p.id}>
              {/* la estela: la ruta entera, tenue */}
              <path d={r.d} fill="none" stroke={p.color} strokeWidth="1" strokeDasharray="3 5" opacity="0.4" />
              {/* el convoy viajando (browser-compositor, cero JS por frame) */}
              <circle r="3" fill={p.color} stroke="rgba(255,255,255,0.8)" strokeWidth="0.7" opacity="0.95">
                <animateMotion dur={`${p.dur}s`} repeatCount="indefinite" path={r.d} />
              </circle>
              <circle r="7" fill="none" stroke={p.color} strokeWidth="0.6" opacity="0.35">
                <animateMotion dur={`${p.dur}s`} repeatCount="indefinite" path={r.d} />
              </circle>
            </g>
          );
        })}
      </svg>
      {/* leyenda de magnitudes + etiqueta ISS + sol */}
      <div className="absolute bottom-1.5 left-2 flex items-center gap-2 pointer-events-none flex-wrap">
        {leyenda.map((m) => (
          <span key={m} className="inline-flex items-center gap-1 font-mono text-[7.5px] tracking-widest text-white/60">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: colorDeMag(m), boxShadow: `0 0 6px ${colorDeMag(m)}` }} />
            M{m}+
          </span>
        ))}
        <span className="inline-flex items-center gap-1 font-mono text-[7.5px] tracking-widest text-white/75">
          <span className="text-white font-bold">✛</span> ISS
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-[7.5px] tracking-widest text-white/60">
          <span className="text-amber font-bold">☀</span> SOL
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-[7.5px] tracking-widest text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" style={{ boxShadow: "0 0 6px #38bdf8" }} />
          PATRULLAS ×{PATRULLAS.length}
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
