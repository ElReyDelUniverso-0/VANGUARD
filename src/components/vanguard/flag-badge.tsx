"use client";

// Badge de pais estilo tactico (reemplaza banderas emoji) — codigo ISO en chip monotematico
import { cn } from "@/lib/utils";

// paleta por region aproximada del codigo
const REGION_HUE: Record<string, string> = {
  UA: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  PS: "text-red-hud border-red-hud bg-red-hud/20",
  LB: "text-red-hud border-red-hud bg-red-hud/20",
  SD: "text-amber border-amber-hud bg-amber-hud/20",
  KP: "text-red-hud border-red-hud bg-red-hud/20",
  TW: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  YE: "text-red-hud border-red-hud bg-red-hud/20",
  IR: "text-violet-hud border-violet-hud bg-violet-hud/20",
  ML: "text-amber border-amber-hud bg-amber-hud/20",
  MM: "text-red-hud border-red-hud bg-red-hud/20",
  VE: "text-violet-hud border-violet-hud bg-violet-hud/20",
  CO: "text-violet-hud border-violet-hud bg-violet-hud/20",
  HT: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  MA: "text-amber border-amber-hud bg-amber-hud/20",
  AM: "text-amber border-amber-hud bg-amber-hud/20",
  SO: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  CD: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  AF: "text-amber border-amber-hud bg-amber-hud/20",
  SY: "text-red-hud border-red-hud bg-red-hud/20",
  ET: "text-amber border-amber-hud bg-amber-hud/20",
  MZ: "text-amber border-amber-hud bg-amber-hud/20",
  MX: "text-violet-hud border-violet-hud bg-violet-hud/20",
  IN: "text-amber border-amber-hud bg-amber-hud/20",
  NG: "text-amber border-amber-hud bg-amber-hud/20",
  BR: "text-violet-hud border-violet-hud bg-violet-hud/20",
  IT: "text-amber border-amber-hud bg-amber-hud/20",
  DE: "text-red-hud border-red-hud bg-red-hud/20",
  RU: "text-red-hud border-red-hud bg-red-hud/20",
  US: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  GB: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  FR: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  CN: "text-red-hud border-red-hud bg-red-hud/20",
  JP: "text-red-hud border-red-hud bg-red-hud/20",
  KR: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  ES: "text-amber border-amber-hud bg-amber-hud/20",
  IL: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  EG: "text-amber border-amber-hud bg-amber-hud/20",
  GR: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
  TR: "text-red-hud border-red-hud bg-red-hud/20",
};

const DEFAULT = "text-amber border-amber-hud bg-amber-hud/20";

export function FlagBadge({ code, className, size = "sm" }: { code?: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const c = code ?? "??";
  const color = REGION_HUE[c] ?? DEFAULT;
  const sizes = {
    sm: "text-[8px] px-1 py-0 min-w-[24px]",
    md: "text-[10px] px-1.5 py-0.5 min-w-[30px]",
    lg: "text-xs px-2 py-1 min-w-[40px]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border rounded-sm font-mono font-bold tracking-widest leading-none flex-shrink-0",
        color,
        sizes[size],
        className
      )}
      title={`COD ${c}`}
    >
      {c}
    </span>
  );
}
