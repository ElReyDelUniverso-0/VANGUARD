// v401 — la marca de VANGUARD: la V dorada de la casa + Orbitron en oro
export function LogoVanguard({ conTexto = true, lema = "El mundo en tiempo real" }: { conTexto?: boolean; lema?: string }) {
  return (
    <span className="vx-logo">
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="60" height="60" rx="14" fill="#120E08" stroke="#e8c476" strokeWidth="1.5" strokeOpacity="0.8" />
        <ellipse cx="32" cy="34" rx="22.5" ry="9.2" transform="rotate(-24 32 34)" stroke="#38BDF8" strokeOpacity="0.55" strokeWidth="1.2" />
        <circle cx="50.4" cy="24.5" r="1.75" fill="#38BDF8" />
        <path d="M11.8 20.5 L20.6 20.5 L32 43.4 L32 54 Z" fill="#F7C948" />
        <path d="M52.2 20.5 L43.4 20.5 L32 43.4 L32 54 Z" fill="#D99B16" />
        <path d="M32 10.6 L33.7 16.1 L39.2 17.8 L33.7 19.5 L32 25 L30.3 19.5 L24.8 17.8 L30.3 16.1 Z" fill="#FFF3C4" />
      </svg>
      {conTexto && (
        <span className="vx-logo-t">
          <b>VANGUARD</b>
          {lema && <small>{lema}</small>}
        </span>
      )}
    </span>
  );
}
