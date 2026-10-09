"use client";

// v71.0 OCASO — banner cinematográfico de la portada.
// Una puesta de sol eterna sobre la ciudad en guerra: luna llena con halo,
// sol hundiéndose en el horizonte, estrellas que titilan y silueta de rascacielos
// con ventanas encendidas. Todo SVG + CSS (GPU, cero JS por frame), respeta
// prefers-reduced-motion. La regla de oro: nada plano, algo que pida la mirada.

const ESTRELLAS: { x: number; y: number; r: number; d: number; dur: number }[] = [
  { x: 6, y: 18, r: 1.1, d: 0, dur: 2.8 }, { x: 13, y: 9, r: 0.8, d: 0.7, dur: 3.4 },
  { x: 21, y: 26, r: 1.3, d: 1.4, dur: 2.6 }, { x: 30, y: 14, r: 0.9, d: 0.3, dur: 3.9 },
  { x: 38, y: 7, r: 1.0, d: 1.9, dur: 2.4 }, { x: 47, y: 21, r: 0.7, d: 1.1, dur: 3.1 },
  { x: 55, y: 11, r: 1.2, d: 2.2, dur: 2.9 }, { x: 63, y: 5, r: 0.8, d: 0.5, dur: 3.6 },
  { x: 71, y: 19, r: 1.1, d: 1.6, dur: 2.5 }, { x: 79, y: 9, r: 0.9, d: 0.9, dur: 3.3 },
  { x: 87, y: 23, r: 1.2, d: 2.5, dur: 2.7 }, { x: 94, y: 13, r: 0.8, d: 1.2, dur: 3.8 },
  { x: 17, y: 33, r: 0.7, d: 2.0, dur: 3.0 }, { x: 68, y: 30, r: 0.9, d: 0.4, dur: 2.6 },
  { x: 84, y: 33, r: 0.7, d: 1.8, dur: 3.5 }, { x: 43, y: 30, r: 0.8, d: 0.2, dur: 2.9 },
];

const EDIFICIOS: { x: number; w: number; h: number; ventanas: number }[] = [
  { x: 0, w: 7, h: 26, ventanas: 5 }, { x: 8, w: 5, h: 38, ventanas: 4 },
  { x: 14, w: 9, h: 20, ventanas: 6 }, { x: 24, w: 6, h: 32, ventanas: 4 },
  { x: 31, w: 10, h: 24, ventanas: 7 }, { x: 42, w: 5, h: 42, ventanas: 3 },
  { x: 48, w: 8, h: 30, ventanas: 5 }, { x: 57, w: 6, h: 22, ventanas: 4 },
  { x: 64, w: 9, h: 36, ventanas: 6 }, { x: 74, w: 5, h: 26, ventanas: 3 },
  { x: 80, w: 8, h: 40, ventanas: 5 }, { x: 89, w: 6, h: 28, ventanas: 4 },
  { x: 96, w: 4, h: 20, ventanas: 3 },
];

export function OcasoBanner() {
  return (
    <div
      className="hud-panel card-shine relative overflow-hidden mb-4 will-change-transform"
      style={{ padding: 0 }}
      data-parallax="0.12"
      aria-label="VANGUARD · ocaso eterno sobre el mundo en guerra"
    >
      <svg viewBox="0 0 100 42" className="block w-full" role="img" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* cielo: negro azulado arriba → violeta ocaso → brasa naranja en el horizonte */}
          <linearGradient id="oc-cielo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050409" />
            <stop offset="34%" stopColor="#160a1e" />
            <stop offset="62%" stopColor="#4a1630" />
            <stop offset="84%" stopColor="#93321f" />
            <stop offset="100%" stopColor="#ff7a2e" />
          </linearGradient>
          {/* luna: disco cálido con sombras de cráter */}
          <radialGradient id="oc-luna" cx="0.38" cy="0.36" r="0.75">
            <stop offset="0%" stopColor="#fffdf4" />
            <stop offset="52%" stopColor="#ffefc9" />
            <stop offset="86%" stopColor="#f5d99b" />
            <stop offset="100%" stopColor="#eec987" />
          </radialGradient>
          {/* halo de la luna */}
          <radialGradient id="oc-halo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(255,236,180,0.5)" />
            <stop offset="45%" stopColor="rgba(255,210,130,0.16)" />
            <stop offset="100%" stopColor="rgba(255,190,100,0)" />
          </radialGradient>
          {/* resplandor del sol en el horizonte */}
          <radialGradient id="oc-sol" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(255,190,90,0.95)" />
            <stop offset="38%" stopColor="rgba(255,140,50,0.5)" />
            <stop offset="100%" stopColor="rgba(255,110,40,0)" />
          </radialGradient>
          {/* silueta del edificio con leve luz de brasa en la arista */}
          <linearGradient id="oc-bloque" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d0709" />
            <stop offset="100%" stopColor="#050304" />
          </linearGradient>
        </defs>

        {/* cielo completo */}
        <rect x="0" y="0" width="100" height="42" fill="url(#oc-cielo)" />

        {/* estrellas titilando (solo en la mitad alta, lejos del resplandor) */}
        <g>
          {ESTRELLAS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y * 0.55}
              r={s.r * 0.5}
              fill="#fff6e0"
              style={{
                animation: `ocTitilar ${s.dur}s ease-in-out ${s.d}s infinite`,
                transformOrigin: `${s.x}px ${s.y * 0.55}px`,
              }}
            />
          ))}
        </g>

        {/* LUNA LLENA con halo y cráteres */}
        <g>
          <circle cx="78" cy="12" r="13" fill="url(#oc-halo)" />
          <circle cx="78" cy="12" r="4.6" fill="url(#oc-luna)" />
          <circle cx="76.6" cy="10.6" r="0.75" fill="rgba(160,120,60,0.18)" />
          <circle cx="79.4" cy="13.4" r="0.55" fill="rgba(160,120,60,0.16)" />
          <circle cx="77.6" cy="14.2" r="0.4" fill="rgba(160,120,60,0.14)" />
          <circle cx="80.1" cy="10.8" r="0.34" fill="rgba(160,120,60,0.13)" />
        </g>

        {/* sol hundiéndose en el horizonte + banda de brasa */}
        <g>
          <ellipse cx="30" cy="36" rx="26" ry="9" fill="url(#oc-sol)" />
          <circle cx="30" cy="36.6" r="3.1" fill="#ffdf9a" opacity="0.9" />
          <rect x="0" y="35.4" width="100" height="0.35" fill="rgba(255,170,80,0.35)" />
        </g>

        {/* silueta de la ciudad con ventanas encendidas */}
        <g>
          {EDIFICIOS.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={42 - b.h} width={b.w} height={b.h} fill="url(#oc-bloque)" />
              {Array.from({ length: b.ventanas }).map((_, v) => {
                const wx = b.x + 0.9 + (v % 3) * ((b.w - 1.6) / Math.max(1, Math.min(3, b.ventanas) - 0) || 1) * (v % 3);
                const wy = 42 - b.h + 1.6 + Math.floor(v / 3) * 3.2;
                return (
                  <rect
                    key={v}
                    x={Math.min(wx, b.x + b.w - 1.1)}
                    y={wy}
                    width="0.75"
                    height="1.05"
                    fill={v % 4 === 0 ? "#ffd98e" : "#ffb45e"}
                    opacity={v % 3 === 0 ? 0.85 : 0.55}
                    style={v % 5 === 0 ? { animation: `ocVentana ${4 + (i % 5)}s ease-in-out infinite` } : undefined}
                  />
                );
              })}
            </g>
          ))}
        </g>

        {/* niebla cálida baja sobre la ciudad */}
        <rect x="0" y="34" width="100" height="8" fill="rgba(255,130,50,0.10)" />
        <rect x="0" y="38" width="100" height="4" fill="rgba(255,110,40,0.14)" />
      </svg>

      {/* título sobre la escena */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1
          className="font-display font-black tracking-widest text-3xl sm:text-5xl ocaso-title"
          style={{ textShadow: "0 2px 30px rgba(0,0,0,0.8), 0 0 44px rgba(255,150,60,0.35)" }}
        >
          VANGUARD
        </h1>
        <p className="font-jet text-[10px] sm:text-xs tracking-[0.35em] mt-1 sm:mt-2" style={{ color: "rgba(255,220,170,0.85)", textShadow: "0 1px 12px rgba(0,0,0,0.9)" }}>
          EL OCASO ETERNO DEL MUNDO · INTELIGENCIA EN TIEMPO REAL
        </p>
      </div>
    </div>
  );
}
