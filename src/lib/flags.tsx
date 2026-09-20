"use client";

// v20 BANDERAS VERDADERAS: banderas reales de todos los países del mundo vía
// flagcdn.com (CDN público sin límites). Fallback elegante si no carga.

import { useState } from "react";
import { countryName } from "@/lib/world-data";

export function flagUrl(code: string, w: 20 | 40 | 80 | 160 | 320 = 80): string {
  return `https://flagcdn.com/w${w}/${code.toLowerCase()}.png`;
}

export interface FlagProps {
  code: string;
  size?: number;      // ancho en px (alto proporcional 3:2)
  className?: string;
  title?: string;
}

/** Bandera rectangular REAL (img de flagcdn) con marco sutil. */
export function Flag({ code, size = 24, className = "", title }: FlagProps) {
  const [err, setErr] = useState(false);
  const w = size;
  const h = Math.round(size * 0.67);
  const wcdn = size <= 22 ? 40 : size <= 44 ? 80 : 160;

  if (err || !/^[a-z]{2}$/i.test(code)) {
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 rounded-[3px] border border-border bg-white/5 ${className}`}
        style={{ width: w, height: h }}
        title={title ?? countryName(code)}
        aria-label={title ?? countryName(code)}
      >
        <svg viewBox="0 0 24 16" width={w - 4} height={h - 4} aria-hidden>
          <circle cx="12" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground" />
        </svg>
      </span>
    );
  }

  return (
    <img
      src={flagUrl(code, wcdn as 40 | 80 | 160)}
      width={w}
      height={h}
      alt={title ?? `Bandera de ${countryName(code)}`}
      title={title ?? countryName(code)}
      loading="lazy"
      draggable={false}
      onError={() => setErr(true)}
      className={`inline-block shrink-0 rounded-[3px] border border-white/15 shadow-sm object-cover bg-black/20 ${className}`}
      style={{ width: w, height: h }}
    />
  );
}

/** Chip país: bandera real + nombre (para listas de selección). */
export function FlagChip({ code, size = 20, active = false }: { code: string; size?: number; active?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${active ? "text-electric" : "text-foreground/80"}`}>
      <Flag code={code} size={size} />
      <span className="text-[10px] font-mono truncate">{countryName(code)}</span>
    </span>
  );
}
