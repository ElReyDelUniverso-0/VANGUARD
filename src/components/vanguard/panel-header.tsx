"use client";

import { cn } from "@/lib/utils";

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "amber" | "red" | "cyan" | "violet" | "green";
  right?: React.ReactNode;
}

const colorMap = {
  amber: "text-amber border-amber-hud",
  red: "text-red-hud border-red-hud",
  cyan: "text-cyan-hud border-cyan-hud",
  violet: "text-violet-hud border-violet-hud",
  green: "text-green-hud border-green-hud",
};

export function PanelHeader({ title, subtitle, icon, color = "amber", right }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        {icon && (
          <div className={cn("w-8 h-8 hud-corner flex items-center justify-center border", colorMap[color])}>
            {icon}
          </div>
        )}
        <div>
          <h2 className="font-mono text-base sm:text-lg font-bold tracking-wider uppercase text-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase">{subtitle}</p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}
