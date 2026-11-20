// ============================================================
// PORTADAS HERMOSAS VECTORIALES DE VANGUARD (CERO IA FOTOS)
//
// Diseños puros en CSS y SVG táctico para cada módulo:
// Radar térmico, anillos orbitales, cuadrícula cuántica,
// telemetría balística, árboles neurales y sellos clasificados.
// ============================================================

interface PortadaProps {
  id: string;
  nombre?: string;
  color?: string;
}

export function PortadaHermosaModulo({ id, color }: PortadaProps) {
  switch (id) {
    case "informacion":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#031726] via-[#020b14] to-[#01050a]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <defs>
              <radialGradient id="info-glow" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="info-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#info-glow)" />
            {/* Anillos concéntricos de datos */}
            <circle cx="200" cy="110" r="75" stroke="#38bdf8" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 3" />
            <circle cx="200" cy="110" r="54" stroke="#818cf8" strokeWidth="1.2" opacity="0.5" />
            <circle cx="200" cy="110" r="32" stroke="#f59e0b" strokeWidth="1.4" opacity="0.7" />
            {/* Núcleo de Fusión */}
            <circle cx="200" cy="110" r="16" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.5" />
            <polygon points="200,98 204,106 212,110 204,114 200,122 196,114 188,110 196,106" fill="#ffffff" />
            {/* Ejes orbitales */}
            <ellipse cx="200" cy="110" rx="80" ry="24" stroke="#38bdf8" strokeWidth="1" transform="rotate(25 200 110)" opacity="0.6" strokeDasharray="4 2" />
            <ellipse cx="200" cy="110" rx="80" ry="24" stroke="#f59e0b" strokeWidth="1" transform="rotate(-25 200 110)" opacity="0.6" strokeDasharray="4 2" />
            {/* Nodos de telemetría */}
            <circle cx="130" cy="78" r="3.5" fill="#38bdf8" />
            <circle cx="270" cy="142" r="3.5" fill="#f59e0b" />
            <text x="200" y="215" textAnchor="middle" fill="#38bdf8" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.9">
              CENTRO DE INFORMACIÓN PERFECTA · VANGUARD
            </text>
          </svg>
        </div>
      );

    case "academia":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#021f14] via-[#04120c] to-[#010805]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <defs>
              <radialGradient id="acad-glow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="acad-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#acad-glow)" />
            {/* Red de nodos de conocimiento */}
            <circle cx="200" cy="110" r="46" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="200" cy="110" r="68" stroke="#059669" strokeWidth="0.8" opacity="0.3" />
            <circle cx="200" cy="110" r="26" fill="#064e3b" stroke="#34d399" strokeWidth="1.5" />
            {/* Conexiones neurales */}
            <line x1="200" y1="84" x2="140" y2="50" stroke="#10b981" strokeWidth="1" opacity="0.5" />
            <line x1="200" y1="84" x2="260" y2="50" stroke="#10b981" strokeWidth="1" opacity="0.5" />
            <line x1="200" y1="136" x2="150" y2="170" stroke="#10b981" strokeWidth="1" opacity="0.5" />
            <line x1="200" y1="136" x2="250" y2="170" stroke="#10b981" strokeWidth="1" opacity="0.5" />
            {/* Nodos satélite */}
            <circle cx="140" cy="50" r="10" fill="#022c22" stroke="#34d399" strokeWidth="1" />
            <circle cx="260" cy="50" r="10" fill="#022c22" stroke="#34d399" strokeWidth="1" />
            <circle cx="150" cy="170" r="10" fill="#022c22" stroke="#34d399" strokeWidth="1" />
            <circle cx="250" cy="170" r="10" fill="#022c22" stroke="#34d399" strokeWidth="1" />
            {/* Icono central de libro/conocimiento */}
            <path d="M190 102 L200 107 L210 102 L210 118 L200 122 L190 118 Z" fill="url(#acad-gold)" />
            <path d="M200 107 L200 122" stroke="#022c22" strokeWidth="1" />
            {/* Sellos de certificación */}
            <text x="200" y="215" textAnchor="middle" fill="#34d399" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.8">
              ACADEMIA · 10 CURSOS · SHA-256
            </text>
          </svg>
        </div>
      );

    case "motores":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#160628] via-[#0d0217] to-[#040108]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <defs>
              <radialGradient id="mot-glow" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="mot-curva" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" fill="url(#mot-glow)" />
            {/* Grilla matemática */}
            <path d="M 50 180 L 350 180 M 50 140 L 350 140 M 50 100 L 350 100 M 50 60 L 350 60" stroke="#a855f7" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
            <path d="M 100 40 L 100 200 M 180 40 L 180 200 M 260 40 L 260 200 M 340 40 L 340 200" stroke="#a855f7" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
            {/* Curva de Lanchester / Atrición diferencial */}
            <path d="M 60 170 Q 140 160 200 110 T 340 50" fill="none" stroke="url(#mot-curva)" strokeWidth="2.5" />
            <path d="M 60 70 Q 150 120 230 160 T 340 175" fill="none" stroke="#f43f5e" strokeWidth="1.8" strokeDasharray="4 2" opacity="0.8" />
            {/* Puntos de muestreo */}
            <circle cx="200" cy="110" r="5" fill="#c084fc" />
            <circle cx="200" cy="110" r="10" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" />
            <text x="200" y="215" textAnchor="middle" fill="#c084fc" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              100 PLATAFORMAS · MOTORES ANALÍTICOS
            </text>
          </svg>
        </div>
      );

    case "conflictos":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#2a0808] via-[#120303] to-[#080202]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <radialGradient id="conf-rad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
            <rect width="400" height="240" fill="url(#conf-rad)" />
            {/* Radar militar con retícula */}
            <circle cx="200" cy="110" r="80" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
            <circle cx="200" cy="110" r="52" stroke="#ef4444" strokeWidth="0.8" opacity="0.3" />
            <circle cx="200" cy="110" r="24" stroke="#ef4444" strokeWidth="1.2" opacity="0.6" />
            <line x1="200" y1="20" x2="200" y2="200" stroke="#ef4444" strokeWidth="0.75" opacity="0.3" />
            <line x1="110" y1="110" x2="290" y2="110" stroke="#ef4444" strokeWidth="0.75" opacity="0.3" />
            {/* Haz de barrido */}
            <path d="M 200 110 L 260 55 A 80 80 0 0 0 200 30 Z" fill="#ef4444" opacity="0.18" />
            {/* Impactos cinéticos geolocalizados */}
            <circle cx="165" cy="85" r="3.5" fill="#f87171" />
            <circle cx="165" cy="85" r="7" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="230" cy="130" r="4.5" fill="#fca5a5" />
            <circle cx="230" cy="130" r="9" stroke="#f87171" strokeWidth="1" />
            <text x="200" y="215" textAnchor="middle" fill="#f87171" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              FRENTES ACTIVOS · ALERTA EN VIVO
            </text>
          </svg>
        </div>
      );

    case "mapa":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#031d28] via-[#020e14] to-[#010609]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <radialGradient id="mapa-rad" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <rect width="400" height="240" fill="url(#mapa-rad)" />
            {/* Globo terráqueo estilizado en alambre */}
            <circle cx="200" cy="110" r="70" stroke="#06b6d4" strokeWidth="1.2" opacity="0.6" />
            <ellipse cx="200" cy="110" rx="70" ry="26" stroke="#0891b2" strokeWidth="0.8" opacity="0.5" />
            <ellipse cx="200" cy="110" rx="30" ry="70" stroke="#0891b2" strokeWidth="0.8" opacity="0.5" />
            <line x1="200" y1="35" x2="200" y2="185" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            {/* Trayectoria orbital */}
            <path d="M 120 150 Q 200 40 280 150" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="245" cy="80" r="3.5" fill="#38bdf8" />
            <text x="200" y="215" textAnchor="middle" fill="#22d3ee" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              PROYECCIÓN 3D · CAPAS GLOBALES
            </text>
          </svg>
        </div>
      );

    case "conocimiento":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#0c1a30] via-[#060d19] to-[#02050b]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <circle cx="200" cy="110" r="50" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
            <polygon points="200,65 240,135 160,135" stroke="#60a5fa" strokeWidth="1.2" fill="none" opacity="0.7" />
            <polygon points="200,155 160,85 240,85" stroke="#38bdf8" strokeWidth="1.2" fill="none" opacity="0.5" />
            <circle cx="200" cy="110" r="4" fill="#93c5fd" />
            <text x="200" y="215" textAnchor="middle" fill="#60a5fa" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              INTELIGENCIA · DOSSIERS SISTÉMICOS
            </text>
          </svg>
        </div>
      );

    case "planeta":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#261805] via-[#120b02] to-[#060300]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <circle cx="200" cy="110" r="65" stroke="#f59e0b" strokeWidth="1.2" opacity="0.5" />
            {/* Arcos geodésicos */}
            <path d="M 140 110 Q 200 70 260 110" stroke="#fbbf24" strokeWidth="1.2" fill="none" />
            <path d="M 140 110 Q 200 150 260 110" stroke="#d97706" strokeWidth="1.2" fill="none" />
            <line x1="135" y1="110" x2="265" y2="110" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3 2" />
            <circle cx="140" cy="110" r="3" fill="#fde68a" />
            <circle cx="260" cy="110" r="3" fill="#fde68a" />
            <text x="200" y="215" textAnchor="middle" fill="#fbbf24" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              PAÍSES · FRONTERAS · DEMOGRAFÍA
            </text>
          </svg>
        </div>
      );

    case "secretos":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#1a0c2e] via-[#0c0517] to-[#040108]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <circle cx="200" cy="110" r="60" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            <circle cx="200" cy="110" r="30" stroke="#a78bfa" strokeWidth="1.5" opacity="0.7" />
            <rect x="180" y="90" width="40" height="40" stroke="#c4b5fd" strokeWidth="1" fill="none" transform="rotate(45 200 110)" />
            <circle cx="200" cy="110" r="4" fill="#ede9fe" />
            <text x="200" y="215" textAnchor="middle" fill="#a78bfa" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              RESTRICTED // AGENCIAS Y ARCHIVOS
            </text>
          </svg>
        </div>
      );

    case "arsenal":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#2b1002] via-[#140600] to-[#050100]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            {/* Trayectoria balística */}
            <path d="M 80 180 Q 200 20 320 180" stroke="#f97316" strokeWidth="2" fill="none" />
            <path d="M 120 180 Q 200 60 280 180" stroke="#fb923c" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6" />
            <circle cx="200" cy="60" r="4" fill="#fdba74" />
            <line x1="200" y1="50" x2="200" y2="70" stroke="#fdba74" strokeWidth="1" />
            <line x1="190" y1="60" x2="210" y2="60" stroke="#fdba74" strokeWidth="1" />
            <text x="200" y="215" textAnchor="middle" fill="#fb923c" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              ARSENAL · CAPACIDADES MILITARES
            </text>
          </svg>
        </div>
      );

    case "datos":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#021f1d] via-[#010e0c] to-[#000504]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            {/* Pulso telemétrico / sismógrafo */}
            <path d="M 50 120 L 130 120 L 145 90 L 160 150 L 175 60 L 190 170 L 205 100 L 220 135 L 235 120 L 350 120" stroke="#14b8a6" strokeWidth="2" fill="none" />
            <circle cx="190" cy="170" r="3" fill="#5eead4" />
            <text x="200" y="215" textAnchor="middle" fill="#2dd4bf" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              TELEMETRÍA EN VIVO · MONITOREO
            </text>
          </svg>
        </div>
      );

    case "medios":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#270318] via-[#12010b] to-[#050003]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            {/* Espectro electromagnético */}
            <path d="M 70 110 Q 100 70 130 110 T 190 110 T 250 110 T 310 110 T 370 110" stroke="#ec4899" strokeWidth="1.8" fill="none" />
            <path d="M 70 110 Q 100 130 130 110 T 190 110 T 250 110 T 310 110 T 370 110" stroke="#f472b6" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.6" />
            <text x="200" y="215" textAnchor="middle" fill="#f472b6" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              TRANSMISIONES · FRECUENCIAS
            </text>
          </svg>
        </div>
      );

    case "juego":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#241a02] via-[#120c01] to-[#040200]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <polygon points="200,60 215,95 250,95 222,115 233,150 200,128 167,150 178,115 150,95 185,95" stroke="#eab308" strokeWidth="1.5" fill="#ca8a04" fillOpacity="0.2" />
            <circle cx="200" cy="110" r="55" stroke="#facc15" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
            <text x="200" y="215" textAnchor="middle" fill="#facc15" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              CENTRO DE MANDO · EL CUARTEL
            </text>
          </svg>
        </div>
      );

    case "ciencia":
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-[#021b2b] via-[#010b12] to-[#000305]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <ellipse cx="200" cy="110" rx="60" ry="22" stroke="#0ea5e9" strokeWidth="1.2" transform="rotate(30 200 110)" opacity="0.7" />
            <ellipse cx="200" cy="110" rx="60" ry="22" stroke="#38bdf8" strokeWidth="1.2" transform="rotate(-30 200 110)" opacity="0.7" />
            <ellipse cx="200" cy="110" rx="60" ry="22" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.5" />
            <circle cx="200" cy="110" r="5" fill="#38bdf8" />
            <text x="200" y="215" textAnchor="middle" fill="#38bdf8" fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.85">
              TECNOLOGÍA · FÍSICA APLICADA
            </text>
          </svg>
        </div>
      );

    default:
      return (
        <div className="vx-portada-arte bg-gradient-to-br from-zinc-900 to-black">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" fill="none">
            <rect x="20" y="20" width="360" height="200" stroke={color ?? "#e8c476"} strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <circle cx="200" cy="110" r="40" stroke={color ?? "#e8c476"} strokeWidth="1" opacity="0.5" />
            <text x="200" y="215" textAnchor="middle" fill={color ?? "#e8c476"} fontFamily="monospace" fontSize="9" letterSpacing="0.25em" opacity="0.7">
              SALA ESTRATÉGICA VANGUARD
            </text>
          </svg>
        </div>
      );
  }
}
