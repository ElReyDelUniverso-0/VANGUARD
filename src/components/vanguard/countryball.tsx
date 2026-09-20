"use client";

// v20 COUNTRYBALLS 2.0 — cada país con su BANDERA VERDADERA.
// La bola recorta la bandera real (flagcdn.com) en un círculo con ojos clásicos,
// sombreado esférico y contorno. Fallback: SVG simplificado si la imagen falla.
// Funciona con los 251 países/territorios del dataset mundial.

import React, { useState } from "react";
import { countryName } from "@/lib/world-data";
import { flagUrl } from "@/lib/flags";

export interface CBDef {
  code: string;
  name: string;
  /** bandera como franjas horizontales/verticales + detalle (fallback SVG) */
  stripes: string[];
  vertical?: boolean;
  canton?: string;
  emblem?: string;
  star?: string;
}

/** Definiciones SVG simplificadas (fallback offline + compat v19). */
export const COUNTRYBALLS: CBDef[] = [
  { code: "us", name: "EE.UU.", stripes: ["#B22234", "#FFFFFF", "#3C3B6E"], canton: "#3C3B6E" },
  { code: "ru", name: "Rusia", stripes: ["#FFFFFF", "#0039A6", "#D52B1E"] },
  { code: "cn", name: "China", stripes: ["#DE2910"], star: "#FFDE00" },
  { code: "ua", name: "Ucrania", stripes: ["#0057B7", "#FFD700"] },
  { code: "il", name: "Israel", stripes: ["#FFFFFF", "#0038B8", "#FFFFFF"] },
  { code: "ps", name: "Palestina", stripes: ["#000000", "#FFFFFF", "#007A3D"] },
  { code: "de", name: "Alemania", stripes: ["#000000", "#DD0000", "#FFCE00"] },
  { code: "fr", name: "Francia", stripes: ["#0055A4", "#FFFFFF", "#EF4135"], vertical: true },
  { code: "gb", name: "Reino Unido", stripes: ["#012169"], emblem: "#C8102E" },
  { code: "es", name: "España", stripes: ["#AA151B", "#F1BF00", "#AA151B"] },
  { code: "mx", name: "México", stripes: ["#006847", "#FFFFFF", "#CE1126"], vertical: true },
  { code: "br", name: "Brasil", stripes: ["#009C3B"], emblem: "#FFDF00" },
  { code: "in", name: "India", stripes: ["#FF9933", "#FFFFFF", "#138808"] },
  { code: "jp", name: "Japón", stripes: ["#FFFFFF"], emblem: "#BC002D" },
  { code: "kr", name: "Corea del Sur", stripes: ["#FFFFFF"], emblem: "#CD2E3A" },
  { code: "tr", name: "Turquía", stripes: ["#E30A17"], star: "#FFFFFF" },
  { code: "ir", name: "Irán", stripes: ["#239F40", "#FFFFFF", "#DA0000"] },
  { code: "cu", name: "Cuba", stripes: ["#002A8F", "#FFFFFF", "#002A8F"] },
  { code: "pl", name: "Polonia", stripes: ["#FFFFFF", "#DC143C"] },
  { code: "ar", name: "Argentina", stripes: ["#74ACDF", "#FFFFFF", "#74ACDF"] },
  { code: "co", name: "Colombia", stripes: ["#FCD116", "#003893", "#CE1126"] },
  { code: "sd", name: "Sudán", stripes: ["#D21034", "#FFFFFF", "#000000"] },
  // v25 — fallbacks ampliados a 40 países
  { code: "it", name: "Italia", stripes: ["#009246", "#FFFFFF", "#CE2B74"], vertical: true },
  { code: "pt", name: "Portugal", stripes: ["#046A38", "#DA291C"], vertical: true },
  { code: "se", name: "Suecia", stripes: ["#006AA7"], emblem: "#FECC02" },
  { code: "no", name: "Noruega", stripes: ["#BA0C2F"], emblem: "#00205B" },
  { code: "fi", name: "Finlandia", stripes: ["#FFFFFF"], emblem: "#002F6C" },
  { code: "dk", name: "Dinamarca", stripes: ["#C8102E"], emblem: "#FFFFFF" },
  { code: "ch", name: "Suiza", stripes: ["#DA291C"], emblem: "#FFFFFF" },
  { code: "gr", name: "Grecia", stripes: ["#0D5EAF", "#FFFFFF"], canton: "#0D5EAF" },
  { code: "nl", name: "Países Bajos", stripes: ["#AE1C28", "#FFFFFF", "#21468B"] },
  { code: "be", name: "Bélgica", stripes: ["#000000", "#FDDA24", "#EF3340"], vertical: true },
  { code: "at", name: "Austria", stripes: ["#ED2939", "#FFFFFF", "#ED2939"] },
  { code: "hu", name: "Hungría", stripes: ["#CE2939", "#FFFFFF", "#477050"] },
  { code: "ro", name: "Rumanía", stripes: ["#002B7F", "#FCD116", "#CE1126"], vertical: true },
  { code: "rs", name: "Serbia", stripes: ["#C6363C", "#0C4076", "#FFFFFF"] },
  { code: "ie", name: "Irlanda", stripes: ["#169B62", "#FFFFFF", "#FF883E"], vertical: true },
  { code: "ca", name: "Canadá", stripes: ["#D80621", "#FFFFFF", "#D80621"], vertical: true },
  { code: "au", name: "Australia", stripes: ["#012169"], emblem: "#FFFFFF" },
  { code: "vn", name: "Vietnam", stripes: ["#DA251D"], star: "#FFFF00" },
];

/** Stickers recomendados: conflictos + cobertura amplia del mundo (96). */
export const STICKER_CODES = [
  "ua", "ru", "il", "ps", "us", "cn", "ir", "tr", "gb", "fr", "de", "es",
  "mx", "br", "ar", "co", "cl", "pe", "ve", "do", "cu", "ht", "sd", "ss",
  "ml", "ne", "ng", "et", "so", "ke", "cd", "cg", "cf", "ly", "eg", "ma",
  "in", "pk", "af", "iq", "sy", "lb", "ye", "jp", "kr", "kp", "tw", "mm",
  // v25 — segunda mitad: Europa, Cáucaso, Asia, Américas
  "at", "be", "bg", "by", "ch", "cz", "dk", "ee", "fi", "gr", "hr", "hu",
  "ie", "is", "lt", "lu", "lv", "md", "mk", "nl", "no", "pt", "ro", "rs",
  "se", "si", "sk", "al", "ba", "cy", "mt", "ge", "am", "az", "kz", "mn",
  "bd", "lk", "kh", "vn", "th", "ph", "id", "my", "au", "ca", "gt", "hn",
];

const VALID_RE = /^[a-z]{2}$/;

function Eyes() {
  return (
    <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full" aria-hidden>
      <ellipse cx="41.5" cy="24.5" rx="7" ry="8" fill="#fff" />
      <ellipse cx="55" cy="24.5" rx="6" ry="7" fill="#fff" opacity="0.95" />
      <circle cx="43" cy="25.5" r="2.9" fill="#101010" />
      <circle cx="56.5" cy="25.5" r="2.7" fill="#101010" />
      {/* cejas enfadadas (estilo polandball de guerra) */}
      <path d="M35 16.5 q6 -3.5 11 -0.5" stroke="#101010" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M50 14.5 q5 -1.5 9 1.5" stroke="#101010" strokeWidth="2.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function SimplifiedBall({ def, size, className }: { def: CBDef; size: number; className?: string }) {
  const n = def.stripes.length;
  const h = 64 / n;
  const id = `cbsvg-${def.code}-${size}`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} role="img" aria-label={`Countryball ${def.name}`}>
      <defs>
        <clipPath id={id}>
          <circle cx="32" cy="32" r="30" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {def.stripes.map((c, i) =>
          def.vertical ? (
            <rect key={i} x={(64 / n) * i} y="0" width={64 / n + 1} height="64" fill={c} />
          ) : (
            <rect key={i} x="0" y={h * i} width="64" height={h + 1} fill={c} />
          )
        )}
        {def.canton && <rect x="0" y="0" width="30" height="30" fill={def.canton} />}
        {def.emblem && <circle cx="32" cy="32" r="12" fill={def.emblem} />}
        {def.star && (
          <path d="M32 16 L36 28 L49 28 L38 36 L42 49 L32 41 L22 49 L26 36 L15 28 L28 28 Z" fill={def.star} />
        )}
      </g>
      <circle cx="42" cy="26" r="7.5" fill="#fff" />
      <circle cx="55" cy="26" r="7.5" fill="#fff" opacity="0.92" />
      <circle cx="44" cy="26" r="3" fill="#111" />
      <circle cx="57" cy="26" r="3" fill="#111" />
      <ellipse cx="24" cy="18" rx="20" ry="12" fill="#ffffff" opacity="0.12" />
      <circle cx="32" cy="32" r="30" fill="none" stroke="#0A0A0F" strokeWidth="2.5" />
    </svg>
  );
}

export interface CountryballProps {
  code: string;
  size?: number;
  className?: string;
  /** mostrar cejas enfadadas (por defecto sí, estilo guerra) */
  angry?: boolean;
}

/** Countryball con la BANDERA REAL del país recortada en círculo. */
export function Countryball({ code, size = 40, className = "", angry = true }: CountryballProps) {
  const [err, setErr] = useState(false);
  const name = countryName(code);
  const valid = VALID_RE.test(code);
  const wcdn = size <= 26 ? 40 : size <= 52 ? 80 : 160;

  if (!valid || err) {
    const def = COUNTRYBALLS.find((c) => c.code === code) ?? COUNTRYBALLS[0];
    return <SimplifiedBall def={def} size={size} className={className} />;
  }

  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full align-middle ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Countryball ${name} con bandera real`}
    >
      {/* imagen de bandera real recortada en círculo */}
      <img
        src={flagUrl(code, wcdn as 40 | 80 | 160)}
        alt=""
        loading="lazy"
        draggable={false}
        onError={() => setErr(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* sombreado esférico */}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.30), transparent 46%), radial-gradient(circle at 68% 92%, rgba(0,0,0,0.42), transparent 58%)",
        }}
      />
      {/* ojos */}
      {angry ? <Eyes /> : null}
      {/* contorno oscuro clásico */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: `inset 0 0 0 ${Math.max(1.5, size * 0.045)}px #0A0A0F` }}
      />
    </span>
  );
}

/** Convierte texto con códigos [cb:xx] en JSX con countryballs (para comentarios). */
export function renderWithStickers(text: string, size = 22): React.ReactNode {
  const parts = text.split(/(\[cb:[a-z]{2}\])/g);
  return parts.map((p, i) => {
    const m = /^\[cb:([a-z]{2})\]$/.exec(p);
    if (m)
      return <Countryball key={i} code={m[1]} size={size} className="inline-block align-middle mx-0.5 -mt-0.5" />;
    return <span key={i}>{p}</span>;
  });
}

/** Detecta si el texto tiene stickers. */
export const hasStickers = (text: string) => /\[cb:[a-z]{2}\]/.test(text);
