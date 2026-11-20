// ============================================================
// VANGUARD · EMBLEMA HOLOGRÁFICO CUÁNTICO (v423.0 - "DE OTRO MUNDO")
//
// Nueva identidad visual hiperfuturista:
// - Escudo de sigilo aerotáctico con bisel de plasma
// - Núcleo de fusión de energía dual (Oro Solar & Cian Cuántico)
// - Órbita satelital con telemetría viva y coordenadas OSINT
// ============================================================

export function LogoVanguard({
  conTexto = true,
  lema = "INTELIGENCIA GEOPOLÍTICA GLOBAL",
}: {
  conTexto?: boolean;
  lema?: string;
}) {
  return (
    <span className="group inline-flex items-center gap-3 select-none">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
        {/* Resplandor exterior holográfico al hover */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500/20 via-cyan-500/30 to-purple-500/20 blur-md transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 opacity-60" />

        <svg
          viewBox="0 0 64 64"
          fill="none"
          className="relative h-11 w-11 drop-shadow-[0_0_12px_rgba(245,197,66,0.35)] transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="vx-bg" cx="50%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#1e1b2e" />
              <stop offset="45%" stopColor="#0a0a14" />
              <stop offset="100%" stopColor="#020308" />
            </radialGradient>
            <linearGradient id="vx-rim-gold" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
            <linearGradient id="vx-wing-l" x1="12" y1="18" x2="32" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef9c3" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="vx-wing-r" x1="52" y1="18" x2="32" y2="52" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="40%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="vx-core" x1="32" y1="12" x2="32" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <radialGradient id="vx-pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Placa base blindada con corte cibernético */}
          <polygon
            points="12,4 52,4 60,12 60,52 52,60 12,60 4,52 4,12"
            fill="url(#vx-bg)"
            stroke="url(#vx-rim-gold)"
            strokeWidth="1.6"
          />

          {/* Cuadrícula táctica interna */}
          <line x1="4" y1="32" x2="60" y2="32" stroke="#38bdf8" strokeOpacity="0.15" strokeWidth="0.8" strokeDasharray="3 3" />
          <line x1="32" y1="4" x2="32" y2="60" stroke="#f59e0b" strokeOpacity="0.15" strokeWidth="0.8" strokeDasharray="3 3" />

          {/* Anillo de órbita y satélite */}
          <ellipse
            cx="32"
            cy="33"
            rx="24"
            ry="9"
            transform="rotate(-28 32 33)"
            stroke="#38bdf8"
            strokeOpacity="0.65"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />
          <circle cx="51" cy="22" r="2.2" fill="#38bdf8" />
          <circle cx="51" cy="22" r="4.5" stroke="#38bdf8" strokeWidth="0.8" opacity="0.6" />

          {/* Ala izquierda de combate en Oro Fusión */}
          <path d="M12 20 L21 20 L32 44 L32 54 Z" fill="url(#vx-wing-l)" />
          <path d="M21 20 L24 23 L32 41 L32 44 Z" fill="#78350f" opacity="0.4" />

          {/* Ala derecha de combate en Cian Cuántico */}
          <path d="M52 20 L43 20 L32 44 L32 54 Z" fill="url(#vx-wing-r)" />
          <path d="M43 20 L40 23 L32 41 L32 44 Z" fill="#082f49" opacity="0.4" />

          {/* Quilla y vértice inferior */}
          <polygon points="30,47 34,47 32,54" fill="#ffffff" opacity="0.9" />

          {/* Núcleo de fusión / Estrella Polaris polar */}
          <circle cx="32" cy="18" r="8" fill="url(#vx-pulse)" />
          <circle cx="32" cy="18" r="4.5" stroke="#fef08a" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
          <polygon
            points="32,10 33.8,15.8 39.5,18 33.8,20.2 32,26 30.2,20.2 24.5,18 30.2,15.8"
            fill="url(#vx-core)"
          />
          <circle cx="32" cy="18" r="1.3" fill="#ffffff" />
        </svg>
      </span>

      {conTexto && (
        <span className="flex flex-col text-left">
          <span className="flex items-center gap-1.5">
            <b className="font-sans text-base font-black tracking-[0.24em] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-sky-300 drop-shadow-[0_0_12px_rgba(245,197,66,0.4)]">
              VANGUARD
            </b>
            <span className="rounded bg-sky-500/20 px-1 py-0.2 font-mono text-[8px] font-bold text-sky-300 tracking-wider uppercase border border-sky-500/40">
              2100
            </span>
          </span>
          {lema && (
            <small className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-zinc-400 group-hover:text-amber-300/80 transition-colors">
              {lema}
            </small>
          )}
        </span>
      )}
    </span>
  );
}
