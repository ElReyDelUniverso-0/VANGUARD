// ============================================================
// v193.1 VIGO — EL CENTINELA DE VANGUARD (marca icónica de la casa)
// El personaje de la plataforma: un centinela orbital con UN SOLO
// OJO-RADAR que barre el mundo. Su cara vive también en el favicon
// (src/app/icon.svg): la marca se reconoce antes de entrar.
//
// Leyes de la casa respetadas:
//  · CERO IMÁGENES / CERO BYTES DE RED: es SVG inline (la lección
//    v189: nada de fotos que estanquen la señal lenta).
//  · JAMÁS PARECE CARGA: Vigo solo aparece con la casa viva y su
//    animación es de personaje (flota, mira), nunca de proceso.
//  · prefers-reduced-motion: Vigo queda quieto y sereno.
// ============================================================

interface VigoProps {
  /** alto aproximado del personaje en px (default 120) */
  size?: number;
  /** burbuja de diálogo opcional sobre la cabeza */
  burbuja?: string;
  /** acento del ojo-radar (default oro Vanguard) */
  acento?: string;
  className?: string;
}

export function Vigo({ size = 120, burbuja, acento = "#F5C542", className }: VigoProps) {
  return (
    <div className={className} style={{ position: "relative", display: "inline-block" }}>
      {burbuja && (
        <div
          className="vg193-burbuja"
          style={{ ["--vg193-acento" as string]: acento }}
        >
          {burbuja}
        </div>
      )}
      <svg
        width={Math.round(size * 0.86)}
        height={size}
        viewBox="0 0 120 140"
        fill="none"
        role="img"
        aria-label="Vigo, el centinela de Vanguard"
      >
        <defs>
          <linearGradient id="vg193-oro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE08A" />
            <stop offset="45%" stopColor={acento} />
            <stop offset="100%" stopColor="#8A5C06" />
          </linearGradient>
          <radialGradient id="vg193-iris" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#FFF3C4" />
            <stop offset="55%" stopColor={acento} />
            <stop offset="100%" stopColor="#6B4705" />
          </radialGradient>
          <linearGradient id="vg193-cuerpo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A2A08" />
            <stop offset="100%" stopColor="#15100A" />
          </linearGradient>
        </defs>

        {/* sombra en el suelo — respira con la flotación */}
        <ellipse className="vg193-sombra" cx="60" cy="132" rx="26" ry="5" fill="#000" opacity="0.5" />

        {/* EL PERSONAJE COMPLETO FLOTA (es un centinela orbital, no camina) */}
        <g className="vg193-flotar">
          {/* antena con baliza EN VIVO */}
          <line x1="60" y1="10" x2="60" y2="26" stroke="#8A6410" strokeWidth="2.4" />
          <circle className="vg193-baliza" cx="60" cy="8" r="3.6" fill="#3DDC97" />

          {/* cabeza: hexágono de la casa */}
          <path
            d="M32 30 L60 20 L88 30 L88 58 L60 68 L32 58 Z"
            fill="url(#vg193-oro)"
            stroke="#FFE08A"
            strokeWidth="1.4"
          />
          {/* visor oscuro */}
          <path d="M38 34 L82 34 L82 56 L60 62 L38 56 Z" fill="#0D0304" opacity="0.92" />

          {/* EL OJO-RADAR: iris, pupila, brillo y parpadeo honesto */}
          <g className="vg193-parpadeo" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <circle cx="60" cy="46" r="9.5" fill="url(#vg193-iris)" />
            <circle cx="60" cy="46" r="4" fill="#050001" />
            <circle cx="57.4" cy="43.4" r="1.7" fill="#FFF6E0" opacity="0.95" />
          </g>

          {/* anillo de barrido del radar (gira alrededor del ojo) */}
          <g className="vg193-radar" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <circle cx="60" cy="46" r="14.5" fill="none" stroke="#3DDC97" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="6 5" />
            <path d="M60 31.5 A14.5 14.5 0 0 1 74.5 46" fill="none" stroke="#3DDC97" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="74.5" cy="46" r="2" fill="#3DDC97" />
          </g>

          {/* boca: rejilla de radio */}
          <g stroke="#5C3E05" strokeWidth="1.4" opacity="0.85">
            <line x1="54" y1="63" x2="66" y2="63" />
          </g>

          {/* cuello */}
          <rect x="53" y="68" width="14" height="6" fill="#6B4705" />

          {/* hombros con luces de estado */}
          <rect x="26" y="74" width="68" height="9" rx="4" fill="url(#vg193-oro)" stroke="#FFE08A" strokeWidth="1" />
          <circle className="vg193-luz-roja" cx="33" cy="78.5" r="2.2" fill="#FF3B30" />
          <circle className="vg193-baliza" cx="87" cy="78.5" r="2.2" fill="#3DDC97" />

          {/* cuerpo con la V de Vanguard grabada */}
          <path d="M38 83 L82 83 L74 118 L60 124 L46 118 Z" fill="url(#vg193-cuerpo)" stroke="#8A6410" strokeWidth="1.6" />
          <path
            d="M50 90 L60 110 L70 90 L65 90 L60 101 L55 90 Z"
            fill={acento}
            opacity="0.95"
          />
          {/* remaches */}
          <circle cx="43" cy="86" r="1.3" fill="#FFE08A" opacity="0.7" />
          <circle cx="77" cy="86" r="1.3" fill="#FFE08A" opacity="0.7" />
        </g>
      </svg>

      <style dangerouslySetInnerHTML={{ __html: VG193_CSS }} />
    </div>
  );
}

const VG193_CSS = `
.vg193-burbuja {
  position: absolute; bottom: calc(100% + 8px); left: 50%;
  transform: translateX(-50%);
  background: #0D0B07;
  border: 1px solid var(--vg193-acento, #F5C542);
  border-radius: 8px;
  color: #F5E9C9;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  line-height: 1.35;
  padding: 6px 10px;
  width: max-content;
  max-width: min(240px, 70vw);
  text-align: center;
  box-shadow: 0 0 18px rgba(245,197,66,0.18);
  z-index: 20;
}
.vg193-burbuja::after {
  content: ""; position: absolute; top: 100%; left: 50%;
  margin-left: -6px;
  border: 6px solid transparent;
  border-top-color: var(--vg193-acento, #F5C542);
}

.vg193-flotar { animation: vg193-flota 3.4s ease-in-out infinite alternate; }
@keyframes vg193-flota { from { transform: translateY(2.5px); } to { transform: translateY(-3.5px); } }

.vg193-radar { animation: vg193-gira 4.2s linear infinite; }
@keyframes vg193-gira { to { transform: rotate(360deg); } }

.vg193-baliza { animation: vg193-late 1.7s ease-in-out infinite; }
@keyframes vg193-late { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }

.vg193-luz-roja { animation: vg193-late 2.6s ease-in-out infinite; animation-delay: 0.8s; }

.vg193-parpadeo { animation: vg193-parpadeo 6s ease-in-out infinite; }
@keyframes vg193-parpadeo {
  0%, 47%, 54%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.08); }
}

.vg193-sombra { animation: vg193-sombra 3.4s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
@keyframes vg193-sombra { from { transform: scaleX(1); opacity: 0.5; } to { transform: scaleX(0.88); opacity: 0.34; } }

/* respeto al que necesita calma: Vigo queda sereno */
@media (prefers-reduced-motion: reduce) {
  .vg193-flotar, .vg193-radar, .vg193-baliza, .vg193-luz-roja, .vg193-parpadeo, .vg193-sombra {
    animation: none !important;
  }
}
`;
