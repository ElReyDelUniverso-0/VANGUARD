// v400.0 — la marca de VANGUARD (misma V dorada de la casa, sin HUD alrededor)
export function LogoVanguard({ conTexto = true }: { conTexto?: boolean }) {
  return (
    <span className="vx-logo">
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="60" height="60" rx="16" fill="#151a26" />
        <path d="M11.8 18.5 L21 18.5 L32 42 L32 53 Z" fill="#F7C948" />
        <path d="M52.2 18.5 L43 18.5 L32 42 L32 53 Z" fill="#D99B16" />
        <path d="M32 9.6 L33.6 14.6 L38.6 16.2 L33.6 17.8 L32 22.8 L30.4 17.8 L25.4 16.2 L30.4 14.6 Z" fill="#FFF3C4" />
      </svg>
      {conTexto && <span>VANGUARD</span>}
    </span>
  );
}
