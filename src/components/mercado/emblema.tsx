// ═══════════════════════════════════════════════════════════════════
// v439.2 · LOS EMBLEMAS DE LA CASA — el ojo, la V, la carta, el sello…
//
// Orden del Dueño: «por personaje, por los logos de Vanguard — el ojo, la V,
// los mapas, etc.». Así que ya no hay mercaderes de dibujo: cada puesto lleva
// delante una MEDALLA de feria con el emblema de su familia, dibujada aquí, y
// una orla de bombillas que parpadean (la feria, pedida por el Dueño).
//
// Diez piezas, diez formas, cero descargas y cero peticiones: el SVG viaja en
// el HTML y se ve sin javascript. Si la casa pide quietud, las bombillas se
// apagan quietas (mercado.css lo respeta).
// ═══════════════════════════════════════════════════════════════════

import type { Emblema as TipoEmblema } from "@/lib/mercado/puestos";

const CREMA = "#f4ecd8";
const TINTA = "#241a14";

/** El dibujo del emblema, dentro de la medalla. Solo líneas y planos. */
function Simbolo({ tipo, color }: { tipo: TipoEmblema; color: string }) {
  const trazo = { stroke: CREMA, strokeWidth: 2.6, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (tipo) {
    case "ojo":
      return (
        <g>
          <path d="M32 58 Q60 36 88 58 Q60 80 32 58 Z" {...trazo} />
          <circle cx="60" cy="58" r="10.5" fill={color} opacity="0.9" />
          <circle cx="60" cy="58" r="4.6" fill={TINTA} />
          <circle cx="57.4" cy="55.4" r="1.6" fill={CREMA} />
        </g>
      );
    case "mapa":
      return (
        <g>
          <path d="M34 44 L52 38 L68 44 L86 38 L86 76 L68 82 L52 76 L34 82 Z" {...trazo} />
          <path d="M52 38 V76 M68 44 V82" stroke={CREMA} strokeWidth="1.6" opacity="0.7" />
          <path d="M40 56 q10 -6 20 0 q10 6 20 0" stroke={CREMA} strokeWidth="1.4" opacity="0.55" fill="none" />
          <circle cx="64" cy="54" r="4.4" fill={color} stroke={CREMA} strokeWidth="1.8" />
        </g>
      );
    case "sello":
      return (
        <g>
          <circle cx="60" cy="58" r="22" {...trazo} strokeDasharray="3 4" />
          <circle cx="60" cy="58" r="14.5" {...trazo} />
          <path d="M54 48 L60 68 L66 48" stroke={CREMA} strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "atomo":
      return (
        <g>
          <ellipse cx="60" cy="58" rx="24" ry="9.5" {...trazo} />
          <ellipse cx="60" cy="58" rx="24" ry="9.5" {...trazo} transform="rotate(60 60 58)" />
          <ellipse cx="60" cy="58" rx="24" ry="9.5" {...trazo} transform="rotate(120 60 58)" />
          <circle cx="60" cy="58" r="5" fill={CREMA} />
        </g>
      );
    case "barras":
      return (
        <g>
          <path d="M38 74 H82" stroke={CREMA} strokeWidth="2.4" strokeLinecap="round" />
          <rect x="41" y="58" width="8" height="16" rx="1.5" fill={CREMA} opacity="0.85" />
          <rect x="53" y="48" width="8" height="26" rx="1.5" fill={color} stroke={CREMA} strokeWidth="1.6" />
          <rect x="65" y="54" width="8" height="20" rx="1.5" fill={CREMA} opacity="0.7" />
          <rect x="75" y="42" width="6" height="32" rx="1.5" fill={color} stroke={CREMA} strokeWidth="1.6" />
        </g>
      );
    case "libro":
      return (
        <g>
          <path d="M36 48 q12 -6 24 0 q12 -6 24 0 v28 q-12 -6 -24 0 q-12 -6 -24 0 z" {...trazo} />
          <path d="M60 48 V76" stroke={CREMA} strokeWidth="2" />
          <path d="M42 56 h12 M66 56 h12 M42 64 h12 M66 64 h12" stroke={CREMA} strokeWidth="1.4" opacity="0.7" />
        </g>
      );
    case "orbe":
      return (
        <g>
          <circle cx="60" cy="58" r="21" {...trazo} />
          <ellipse cx="60" cy="58" rx="9" ry="21" {...trazo} strokeWidth="1.8" />
          <path d="M39 58 H81" stroke={CREMA} strokeWidth="1.8" />
          <path d="M43 46 q17 -6 34 0 M43 70 q17 6 34 0" stroke={CREMA} strokeWidth="1.5" opacity="0.7" fill="none" />
        </g>
      );
    case "onda":
      return (
        <g>
          <path d="M34 58 q6.5 -16 13 0 q6.5 16 13 0 q6.5 -16 13 0 q6.5 16 13 0" {...trazo} />
          <path d="M34 74 H86" stroke={CREMA} strokeWidth="1.6" opacity="0.5" />
        </g>
      );
    case "lupa":
      return (
        <g>
          <circle cx="55" cy="53" r="15" {...trazo} />
          <path d="M66 64 L80 78" stroke={CREMA} strokeWidth="4.4" strokeLinecap="round" />
          <path d="M48 49 q6 -4 12 0" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "uve":
      return (
        <g>
          <path d="M40 40 L60 76 L80 40" stroke={CREMA} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M45 78 H75" stroke={color} strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="60" cy="34" r="2.6" fill={color} />
        </g>
      );
    default:
      return null;
  }
}

export type EmblemaProps = {
  tipo: TipoEmblema;
  color: string;
  /** nombre del agente: se usa en el aria-label, no se pinta */
  nombre: string;
  /** true cuando el puesto está abierto: la medalla se enciende */
  encendida?: boolean;
  className?: string;
};

export function Emblema({ tipo, color, nombre, encendida = false, className = "" }: EmblemaProps) {
  // doce bombillas alrededor de la medalla (menos las dos de abajo, donde va el pie)
  const bombillas = Array.from({ length: 12 }, (_, i) => {
    const ang = (-160 + i * 30) * (Math.PI / 180);
    return { x: 60 + Math.cos(ang) * 49, y: 58 + Math.sin(ang) * 49, i };
  }).filter((b) => b.y < 96);

  return (
    <svg
      viewBox="0 0 120 150"
      className={`pm-emblema${encendida ? " pm-emblema-on" : ""}${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={`Emblema de ${nombre}`}
      focusable="false"
    >
      {/* la orla de bombillas: la feria */}
      {bombillas.map((b) => (
        <circle
          key={b.i}
          className="pm-bombilla"
          cx={b.x.toFixed(1)}
          cy={b.y.toFixed(1)}
          r="2.6"
          fill={color}
          style={{ animationDelay: `${(b.i * 0.16).toFixed(2)}s` }}
        />
      ))}

      {/* la medalla */}
      <circle cx="60" cy="58" r="41" fill={`${color}22`} stroke={color} strokeWidth="2" opacity="0.9" />
      <circle cx="60" cy="58" r="35" fill="rgba(11,10,16,0.78)" stroke={CREMA} strokeWidth="1.2" strokeOpacity="0.35" />
      <Simbolo tipo={tipo} color={color} />

      {/* el pie de la medalla: la feria está montada sobre madera */}
      <rect x="55" y="96" width="10" height="18" rx="2" fill="#4a3320" />
      <rect x="30" y="113" width="60" height="9" rx="3.5" fill="#6b4a2a" />
      <rect x="36" y="115.5" width="48" height="1.6" rx="0.8" fill={CREMA} opacity="0.22" />
      <circle cx="60" cy="107" r="2.2" fill={color} opacity="0.8" />
    </svg>
  );
}

/** Lista de los emblemas que la casa sabe dibujar (la prueba la usa). */
export const EMBLEMAS_DIBUJADOS: TipoEmblema[] = [
  "ojo",
  "mapa",
  "sello",
  "atomo",
  "barras",
  "libro",
  "orbe",
  "onda",
  "lupa",
  "uve",
];
