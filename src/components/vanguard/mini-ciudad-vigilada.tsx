"use client";

// ============================================================
// v122.0 PULIDO REAL — LA CIUDAD VIGILADA (CÁMARAS)
// Un skyline procedural compacto que vive con el RELOJ REAL del
// visitante: sol de día, luna y ventanas encendidas de noche.
// Un dron de la red barrre la ciudad en bucle (scan de la casa).
// 60 FPS: solo transform/opacity; reduced-motion lo apaga.
// Determinista: el skyline es el mismo para todo el planeta.
// ============================================================
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// PRNG determinista (misma ciudad para todos)
function rnd(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// 26 edificios deterministas: x, ancho, alto, ventana por fila/col
const EDIFICIOS = (() => {
  const r = rnd(20261210);
  const out: { x: number; w: number; h: number; cols: number; rows: number }[] = [];
  let x = 0;
  for (let i = 0; i < 26; i++) {
    const w = 22 + Math.round(r() * 34);
    const h = 46 + Math.round(r() * 108);
    out.push({ x, w, h, cols: Math.max(2, Math.floor(w / 12)), rows: Math.max(3, Math.floor(h / 16)) });
    x += w + 2 + Math.round(r() * 6);
  }
  return out;
})();

const CIUDAD_W = EDIFICIOS.reduce((a, e) => a + e.w + 8, 0);
const SKY_H = 190;
const SUELO = SKY_H - 18;

/** ¿Es de noche con el reloj real? (19:00–06:30) */
export function esNocheReal(): boolean {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  return h >= 19 || h < 6 || (h === 6 && m < 30);
}

export function MiniCiudadVigilada({ camarasActivas }: { camarasActivas: number }) {
  const [noche, setNoche] = useState(true); // SSR arranca de noche; el cliente corrige
  const [droneX, setDroneX] = useState(-10);
  const [horaTxt, setHoraTxt] = useState("");

  // el cielo obedece al reloj real del aparato (1 min)
  useEffect(() => {
    const aplica = () => {
      setNoche(esNocheReal());
      setHoraTxt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
    };
    aplica();
    const id = setInterval(aplica, 60_000);
    return () => clearInterval(id);
  }, []);

  // el dron barre la ciudad en bucle (60 FPS via rAF, transform en el atributo)
  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let t0 = performance.now();
    const paso = (t: number) => {
      const p = ((t - t0) / 26000) % 1.12; // loop con pausa
      setDroneX(-40 + p * (CIUDAD_W + 80));
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const cielo = noche
    ? ["#050510", "#0d1226"]
    : ["#28405e", "#7ea0c0"];

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border/70"
      role="img"
      aria-label={`Ciudad vigilada en tiempo real: ${camarasActivas} cámaras desplegadas`}
      style={{ background: `linear-gradient(180deg, ${cielo[0]}, ${cielo[1]})` }}
    >
      <svg viewBox={`0 0 ${CIUDAD_W} ${SKY_H}`} className="w-full h-auto block" preserveAspectRatio="xMidYMax slice">
        {/* sol o luna */}
        {noche ? (
          <g>
            <circle cx={CIUDAD_W - 90} cy={44} r={17} fill="#e8e4d8" opacity={0.92} />
            <circle cx={CIUDAD_W - 97} cy={38} r={15} fill={cielo[0]} opacity={0.9} />
          </g>
        ) : (
          <g>
            <circle cx={CIUDAD_W - 90} cy={44} r={20} fill="#FFD98A" opacity={0.95} />
            <circle cx={CIUDAD_W - 90} cy={44} r={32} fill="#FFD98A" opacity={0.18} />
          </g>
        )}
        {/* estrellas de noche */}
        {noche && Array.from({ length: 22 }).map((_, i) => {
          const r = rnd(i * 7 + 3);
          return <circle key={i} cx={r() * CIUDAD_W} cy={r() * 90} r={0.8} fill="#ffffff" opacity={0.5 + 0.4 * r()} />;
        })}

        {/* edificios + ventanas (encendidas de noche) */}
        {EDIFICIOS.map((e, i) => {
          const y = SUELO - e.h;
          return (
            <g key={i}>
              <rect x={e.x} y={y} width={e.w} height={e.h} fill={noche ? "#0a0e1c" : "#1c2b3d"} stroke={noche ? "#232f4a" : "#2e4258"} strokeWidth={0.8} />
              {/* antena en los altos */}
              {e.h > 120 && <line x1={e.x + e.w / 2} y1={y} x2={e.x + e.w / 2} y2={y - 12} stroke={noche ? "#3a4a6a" : "#3e5470"} strokeWidth={1.2} />}
              {Array.from({ length: e.rows }).map((_, ry) =>
                Array.from({ length: e.cols }).map((_, cx2) => {
                  const encendida = ((i * 31 + ry * 17 + cx2 * 7) % 10) < (noche ? 5 : 2);
                  if (!encendida) return null;
                  return (
                    <rect
                      key={`${ry}-${cx2}`}
                      x={e.x + 4 + cx2 * ((e.w - 8) / e.cols)}
                      y={y + 6 + ry * ((e.h - 10) / e.rows)}
                      width={Math.max(2.4, (e.w - 8) / e.cols - 3.4)}
                      height={Math.max(2.2, (e.h - 10) / e.rows - 4.4)}
                      fill={noche ? "#ffd98a" : "#9fc3e0"}
                      opacity={noche ? 0.85 : 0.6}
                    />
                  );
                })
              )}
            </g>
          );
        })}
        {/* suelo */}
        <rect x={0} y={SUELO} width={CIUDAD_W} height={SKY_H - SUELO} fill={noche ? "#070a16" : "#14212f"} />

        {/* el dron de la red barre la ciudad */}
        <g transform={`translate(${droneX} ${28})`}>
          <rect x={-9} y={-3} width={18} height={5} rx={2.2} fill="#38BDF8" opacity={0.92} />
          <circle cx={-11} cy={-1} r={2.2} fill="none" stroke="#38BDF8" strokeWidth={0.9} opacity={0.8} />
          <circle cx={11} cy={-1} r={2.2} fill="none" stroke="#38BDF8" strokeWidth={0.9} opacity={0.8} />
          <polygon points="0,2 -7,26 7,26" fill="#38BDF8" opacity={0.12} />
          <circle cx={0} cy={0} r={1.6} fill="#7ee0ff" className="blink-soft" />
        </g>
      </svg>

      {/* chip de estado vivo de la vigilancia */}
      <div className="absolute left-2 top-2 flex items-center gap-2 font-mono text-[9px] font-bold tracking-wider">
        <span className={cn("rounded px-1.5 py-0.5", noche ? "bg-black/55 text-cyan-hud" : "bg-white/25 text-[#0a1622]")}>
          {noche ? "LUNA SOBRE LA CIUDAD" : "SOL SOBRE LA CIUDAD"} · {horaTxt}
        </span>
        <span className="rounded bg-black/55 px-1.5 py-0.5 text-green-hud">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-hud blink-soft mr-1" />
          {camarasActivas} CÁMARAS EN VIVO
        </span>
      </div>
    </div>
  );
}
