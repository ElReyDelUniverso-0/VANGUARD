"use client";

import { VanguardMarkSvg } from "./vanguard-mark-svg";
import { cn } from "@/lib/utils";

interface VanguardEmblemProps {
  size?: number;
  className?: string;
  idPrefix?: string;
  showWordmark?: boolean;
  compact?: boolean;
}

export function VanguardEmblem({
  size = 40,
  className,
  idPrefix = "vg-emblem",
  showWordmark = false,
  compact = false,
}: VanguardEmblemProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <VanguardMarkSvg size={size} idPrefix={idPrefix} className="w-full h-full shrink-0" />
      {showWordmark && (
        <span
          className={cn(
            "font-display font-black tracking-[0.22em] text-amber-300 uppercase",
            compact ? "text-xs" : "text-sm sm:text-base"
          )}
        >
          VANGUARD
        </span>
      )}
    </span>
  );
}
