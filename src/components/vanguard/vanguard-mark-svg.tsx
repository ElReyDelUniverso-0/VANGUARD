// Zero-JS Server-Safe crest SVG (Polaris + Twin-Wing shield + orbital satellite).
// Safe for both Server Components and Client Components; pass a unique `idPrefix`
// whenever multiple instances can share the same page to avoid SVG gradient ID collisions.

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
  const wls = `${idPrefix}-wls`;
  const wr = `${idPrefix}-wr`;
  const wrs = `${idPrefix}-wrs`;
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
        <radialGradient id={bg} cx="50%" cy="28%" r="78%">
          <stop offset="0%" stopColor="#261C0A" />
          <stop offset="48%" stopColor="#120E08" />
          <stop offset="100%" stopColor="#050507" />
        </radialGradient>
        <linearGradient id={rim} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF0BA" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#F5C542" stopOpacity="0.78" />
          <stop offset="70%" stopColor="#8E5B08" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFE08A" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id={wl} x1="11" y1="20" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF5CC" />
          <stop offset="36%" stopColor="#F7C948" />
          <stop offset="100%" stopColor="#B87A0B" />
        </linearGradient>
        <linearGradient id={wls} x1="16" y1="22" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#C98A14" />
          <stop offset="100%" stopColor="#6D4404" />
        </linearGradient>
        <linearGradient id={wr} x1="53" y1="20" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE699" />
          <stop offset="45%" stopColor="#E6AE24" />
          <stop offset="100%" stopColor="#945F08" />
        </linearGradient>
        <linearGradient id={wrs} x1="48" y1="22" x2="32" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF7D6" />
          <stop offset="50%" stopColor="#F5C542" />
          <stop offset="100%" stopColor="#A66E0A" />
        </linearGradient>
        <linearGradient id={star} x1="32" y1="10" x2="32" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#FFF0B3" />
          <stop offset="100%" stopColor="#F5C542" />
        </linearGradient>
        <linearGradient id={arc} x1="10" y1="43" x2="54" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5C542" stopOpacity="0.06" />
          <stop offset="45%" stopColor="#F5C542" stopOpacity="0.6" />
          <stop offset="85%" stopColor="#38BDF8" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="14" fill={`url(#${bg})`} />
      <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="13.25" stroke={`url(#${rim})`} strokeWidth="1.5" />
      <path d="M17 7.5 H47 L56.5 17 V47 L47 56.5 H17 L7.5 47 V17 Z" stroke="#F5C542" strokeOpacity="0.16" strokeWidth="0.9" />

      <ellipse cx="32" cy="34" rx="22.5" ry="9.2" transform="rotate(-24 32 34)" stroke={`url(#${arc})`} strokeWidth="1.2" />
      <circle cx="50.4" cy="24.5" r="1.75" fill="#38BDF8" />

      <path d="M11.8 20.5 L20.6 20.5 L32 43.4 L32 54 Z" fill={`url(#${wl})`} />
      <path d="M20.6 20.5 L23.8 24 L32 40 L32 43.4 Z" fill={`url(#${wls})`} />
      <path d="M11.8 20.5 L20.6 20.5 L22.1 22.1 L13.3 22.1 Z" fill="#FFF8DC" fillOpacity="0.72" />

      <path d="M52.2 20.5 L43.4 20.5 L32 43.4 L32 54 Z" fill={`url(#${wr})`} />
      <path d="M43.4 20.5 L40.2 24 L32 40 L32 43.4 Z" fill={`url(#${wrs})`} />
      <path d="M52.2 20.5 L43.4 20.5 L41.9 22.1 L50.7 22.1 Z" fill="#FFF5CC" fillOpacity="0.48" />

      <path d="M32 43.4 L34 48 L32 54 L30 48 Z" fill="#FFF3C4" fillOpacity="0.44" />

      <circle cx="32" cy="17.8" r="5.6" stroke="#F5C542" strokeOpacity="0.28" strokeWidth="0.85" strokeDasharray="2.2 2.4" />
      <path d="M32 10.6 L33.7 16.1 L39.2 17.8 L33.7 19.5 L32 25 L30.3 19.5 L24.8 17.8 L30.3 16.1 Z" fill={`url(#${star})`} />
      <circle cx="32" cy="17.8" r="1.25" fill="#FFFFFF" />
    </svg>
  );
}
