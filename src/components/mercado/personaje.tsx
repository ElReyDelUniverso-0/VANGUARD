// ═══════════════════════════════════════════════════════════════════
// v437.2 · LOS MERCADERES DEL MERCADO — dibujados aquí, sin una descarga
//
// Orden del Dueño: «cada módulo con un personaje enseñando cada uno».
// No hay foto de mercader en `public/` y no se inventa: se dibuja. Cada
// personaje es un SVG de 120×138 con el traje del color de su familia, el
// delantal de lienzo, pelo/gorro/barba según la semilla del puesto y **la pieza
// de su oficio entre las manos** (diez piezas, diez formas).
//
// Formas planas, pieles cálidas, ojos de dos trazos y una sonrisa: se lee como
// un grabado de mercado, no como una mascota. Cero imágenes de red, cero
// fuentes externas: el SVG viaja en el HTML y funciona sin javascript.
// ═══════════════════════════════════════════════════════════════════

import type { Pieza } from "@/lib/mercado/puestos";

const PIELES = ["#e8b48c", "#d99a6c", "#c17a4f", "#8d5a3b", "#f0c9a4", "#a8703f"];
const PELOS = ["#241a14", "#3d2718", "#5a3a22", "#8a6a3f", "#1c1c22", "#6b4a2a"];

/** Un número estable por puesto: el mismo mercader siempre se dibuja igual. */
function semillaDe(x: number, sal: number): number {
  let h = (Math.trunc(x) * 2654435761 + sal * 40503) >>> 0;
  h ^= h >>> 13;
  h = (h * 1274126177) >>> 0;
  return h;
}

const elige = <T,>(lista: T[], h: number): T => lista[h % lista.length];

type Rasgos = {
  piel: string;
  pelo: string;
  barba: boolean;
  gorro: "ninguno" | "pano" | "gorra" | "sombrero";
  bigote: boolean;
};

function rasgosDe(semilla: number): Rasgos {
  const a = semillaDe(semilla, 1);
  const b = semillaDe(semilla, 2);
  const c = semillaDe(semilla, 3);
  return {
    piel: elige(PIELES, a),
    pelo: elige(PELOS, b),
    barba: c % 3 === 0,
    gorro: (["ninguno", "pano", "gorra", "sombrero"] as const)[c % 4],
    bigote: b % 2 === 0,
  };
}

/** Las diez piezas de oficio. Se apoyan en el mostrador, a la altura del pecho. */
function Pieza({ pieza, color }: { pieza: Pieza; color: string }) {
  const metal = "#cbb27a";
  switch (pieza) {
    case "pregon":
      return (
        <g>
          <path d="M78 92 L104 84 L104 96 Z" fill={metal} />
          <rect x="72" y="91" width="8" height="5" rx="2" fill="#8a6f3c" />
          <circle cx="104" cy="90" r="3" fill={color} />
        </g>
      );
    case "globo":
      return (
        <g>
          <circle cx="90" cy="88" r="12" fill="#1d3a5c" stroke={metal} strokeWidth="1.6" />
          <path d="M84 82 q6 5 12 0 M84 90 q6 5 12 0" stroke={color} strokeWidth="1.4" fill="none" />
          <path d="M90 100 l0 8" stroke="#8a6f3c" strokeWidth="2" />
          <rect x="84" y="107" width="12" height="4" rx="2" fill="#5c4326" />
        </g>
      );
    case "legajo":
      return (
        <g>
          <rect x="76" y="86" width="24" height="15" rx="2" fill="#efe3c6" stroke="#b9a882" />
          <path d="M80 91 h16 M80 95 h16" stroke="#b9a882" strokeWidth="1.2" />
          <rect x="78" y="83" width="24" height="4" rx="2" fill={color} opacity="0.7" />
        </g>
      );
    case "matraz":
      return (
        <g>
          <path d="M86 84 h8 v7 l8 16 h-24 l8 -16 z" fill="#bfe9f2" opacity="0.85" stroke="#7fb6c4" />
          <path d="M79 100 h22" stroke={color} strokeWidth="3" />
          <rect x="87" y="80" width="6" height="4" rx="1.5" fill="#7fb6c4" />
        </g>
      );
    case "balanza":
      return (
        <g>
          <path d="M90 82 v22" stroke={metal} strokeWidth="2.4" />
          <path d="M74 88 h32" stroke={metal} strokeWidth="2" />
          <path d="M74 88 l-5 9 h10 z M106 88 l-5 9 h10 z" fill={color} opacity="0.85" stroke={metal} strokeWidth="1.2" />
          <rect x="83" y="103" width="14" height="3.5" rx="1.6" fill="#8a6f3c" />
        </g>
      );
    case "libro":
      return (
        <g>
          <path d="M76 88 q7 -4 14 0 q7 -4 14 0 v15 q-7 -4 -14 0 q-7 -4 -14 0 z" fill="#f4ecd8" stroke="#b9a882" />
          <path d="M90 88 v15" stroke="#b9a882" strokeWidth="1.4" />
          <path d="M80 93 h7 M93 93 h7 M80 97 h7 M93 97 h7" stroke={color} strokeWidth="1.1" />
        </g>
      );
    case "maqueta":
      return (
        <g>
          <rect x="76" y="98" width="28" height="5" rx="2" fill="#6b4a2a" />
          <rect x="80" y="88" width="8" height="10" fill={color} opacity="0.85" />
          <rect x="91" y="92" width="7" height="6" fill="#efe3c6" />
          <path d="M84 88 l4 -8 M94 92 l6 -9" stroke="#cbb27a" strokeWidth="1" />
        </g>
      );
    case "camara":
      return (
        <g>
          <rect x="74" y="86" width="26" height="16" rx="3" fill="#2b2b33" stroke="#4a4a55" />
          <circle cx="87" cy="94" r="5.5" fill={color} opacity="0.9" />
          <circle cx="87" cy="94" r="2" fill="#11131a" />
          <rect x="96" y="83" width="8" height="5" rx="1.5" fill="#4a4a55" />
        </g>
      );
    case "lupa":
      return (
        <g>
          <circle cx="88" cy="91" r="9" fill="#dff3f8" opacity="0.5" stroke={metal} strokeWidth="2.4" />
          <path d="M95 98 l9 9" stroke="#6b4a2a" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M83 88 q4 -3 7 0" stroke={color} strokeWidth="1.4" fill="none" />
        </g>
      );
    case "torno":
      return (
        <g>
          <ellipse cx="90" cy="102" rx="14" ry="4" fill="#6b4a2a" />
          <path d="M84 96 q3 -10 6 -10 q3 0 6 10 z" fill={color} opacity="0.85" stroke="#a8703f" strokeWidth="1" />
          <path d="M78 92 q12 -6 24 0" stroke={metal} strokeWidth="1.6" fill="none" />
        </g>
      );
    default:
      return null;
  }
}

export type PersonajeProps = {
  /** nombre del mercader: se usa en el aria-label, no se pinta */
  nombre: string;
  pieza: Pieza;
  /** color de la familia (el traje y el adorno) */
  color: string;
  /** número del puesto: fija la cara, el pelo y el gorro */
  semilla?: number;
  /** true cuando el puesto está abierto: el mercader se pone de pie */
  saluda?: boolean;
  className?: string;
};

export function Personaje({ nombre, pieza, color, semilla = 0, saluda = false, className = "" }: PersonajeProps) {
  const r = rasgosDe(semilla);
  return (
    <svg
      viewBox="0 0 120 138"
      className={`pm-personaje${saluda ? " pm-saluda" : ""}${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={`${nombre}, el mercader de este puesto`}
      focusable="false"
    >
      {/* el cuerpo: traje del color de la familia y delantal de lienzo */}
      <path d="M32 132 v-26 q0 -16 16 -20 h24 q16 4 16 20 v26 z" fill={color} />
      <path d="M45 132 v-22 q0 -9 7 -11 h16 q7 2 7 11 v22 z" fill="#efe3c6" opacity="0.92" />
      <path d="M45 110 q15 6 30 0" stroke="#cdbe9d" strokeWidth="1.4" fill="none" />
      {/* los brazos */}
      <path d="M32 112 q-6 10 -2 20" stroke={color} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M88 112 q6 10 2 20" stroke={color} strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="133" r="4.4" fill={r.piel} />
      <circle cx="90" cy="133" r="4.4" fill={r.piel} />
      {/* el cuello y la cabeza */}
      <rect x="53" y="58" width="14" height="12" rx="5" fill={r.piel} />
      <ellipse cx="60" cy="44" rx="21" ry="23" fill={r.piel} />
      {/* las orejas */}
      <ellipse cx="39" cy="46" rx="4" ry="6" fill={r.piel} />
      <ellipse cx="81" cy="46" rx="4" ry="6" fill={r.piel} />
      {/* el pelo */}
      {r.gorro === "ninguno" ? (
        <path d="M39 36 q4 -18 21 -18 q17 0 21 18 q-8 -8 -21 -8 q-13 0 -21 8" fill={r.pelo} />
      ) : null}
      {/* la barba */}
      {r.barba ? <path d="M42 50 q18 22 36 0 q-4 18 -18 20 q-14 -2 -18 -20" fill={r.pelo} opacity="0.85" /> : null}
      {/* el gorro */}
      {r.gorro === "pano" ? (
        <g>
          <path d="M38 34 q22 -18 44 0 q-6 -4 -22 -4 q-16 0 -22 4" fill={color} />
          <path d="M82 32 q8 2 6 10" stroke={color} strokeWidth="3" fill="none" />
        </g>
      ) : null}
      {r.gorro === "gorra" ? (
        <g>
          <path d="M37 34 q23 -16 46 0 z" fill="#2b2b33" />
          <path d="M37 34 h46" stroke="#4a4a55" strokeWidth="3" />
          <path d="M56 18 q4 -4 8 0" stroke={color} strokeWidth="2" fill="none" />
        </g>
      ) : null}
      {r.gorro === "sombrero" ? (
        <g>
          <ellipse cx="60" cy="30" rx="30" ry="6" fill="#5c4326" />
          <path d="M43 30 q2 -14 17 -14 q15 0 17 14 z" fill="#6b4a2a" />
          <path d="M43 27 h34" stroke={color} strokeWidth="2.6" />
        </g>
      ) : null}
      {/* la cara: dos trazos de ojos, un bigote y una sonrisa */}
      <path d="M50 43 q3 -2 6 0 M64 43 q3 -2 6 0" stroke="#231a14" strokeWidth="2" strokeLinecap="round" fill="none" />
      {r.bigote ? <path d="M52 53 q8 4 16 0" stroke={r.pelo} strokeWidth="2.6" strokeLinecap="round" fill="none" /> : null}
      <path d="M52 58 q8 7 16 0" stroke="#8a5a44" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* la pieza de su oficio */}
      <Pieza pieza={pieza} color={color} />
    </svg>
  );
}
