// ============================================================
// VANGUARD · EMBLEMA CIBERNÉTICO VECTORIAL (v423.0)
// Emblema holográfico seguro para SSR con doble energía oro/cian
// ============================================================

interface VanguardMarkSvgProps {
  size?: number;
  className?: string;
  idPrefix?: string;
  label?: string;
}

export function VanguardMarkSvg({
  size = 24,
  className,
  idPrefix = "vgm",
  label = "Emblema de VANGUARD",
}: VanguardMarkSvgProps) {
  const bg = `${idPrefix}-bg`;
  const rim = `${idPrefix}-rim`;
  const wl = `${idPrefix}-wl`;
  const wr = `${idPrefix}-wr`;
  const star = `${idPrefix}-star`;
  const arc = `${idPrefix}-arc`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id={bg} cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1e1b2e" />
          <stop offset="45%" stopColor="#0a0a14" />
          <stop offset="100%" stopColor="#020308" />
        </radialGradient>
        <linearGradient id={rim} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="70%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id={wl} x1="12" y1="18" x2="32" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="40%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={wr} x1="52" y1="18" x2="32" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="40%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id={star} x1="32" y1="10" x2="32" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={arc} x1="10" y1="45" x2="54" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5c542" stopOpacity="0.1" />
          <stop offset="40%" stopColor="#f5c542" stopOpacity="0.8" />
          <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <polygon
        points="12,4 52,4 60,12 60,52 52,60 12,60 4,52 4,12"
        fill={`url(#${bg})`}
        stroke={`url(#${rim})`}
        strokeWidth="1.6"
      />

      <ellipse
        cx="32"
        cy="33"
        rx="24"
        ry="9"
        transform="rotate(-28 32 33)"
        stroke={`url(#${arc})`}
        strokeWidth="1.3"
        strokeDasharray="4 2"
      />
      <circle cx="51" cy="22" r="2.2" fill="#38bdf8" />

      <path d="M12 20 L21 20 L32 44 L32 54 Z" fill={`url(#${wl})`} />
      <path d="M52 20 L43 20 L32 44 L32 54 Z" fill={`url(#${wr})`} />

      <polygon points="32,10 33.8,15.8 39.5,18 33.8,20.2 32,26 30.2,20.2 24.5,18 30.2,15.8" fill={`url(#${star})`} />
      <circle cx="32" cy="18" r="1.3" fill="#ffffff" />
    </svg>
  );
}
