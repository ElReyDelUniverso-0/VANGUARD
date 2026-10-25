"use client";

import { cn } from "@/lib/utils";
// v121.0 LA CAMA MÁS CÓMODA: los títulos de TODAS las salas entran ahora
// letra a letra (rotación volumétrica + subida, solo transform/opacity).
import { LetrasAnimadas } from "@/components/vanguard/letras-animadas";

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
        <div className="min-w-0">
          {/* v124.0 CAVIAR: los títulos de la casa van en serif de colección
              con ORO en cada glifo — alta clase en todas las salas.
              v135.0 NEXUS-HYPNOS: cada glifo ahora tiene VOLUMEN 3D
              (extrusión holográfica .nexus-letra) — adiós al plano de 1990.
              v139 3D BRUTAL: el título entero FLOTA SOLO en 3D (vaivén
              constante con perspectiva propia — se ve incluso dentro del
              cristal y sin mover un dedo). */}
          <h2 className="vg-flota-v139 font-caviar text-base sm:text-lg font-bold tracking-[0.12em] uppercase text-foreground [perspective:600px]">
            <LetrasAnimadas text={title} letraClass="caviar-letra nexus-letra" />
          </h2>
          {subtitle && (
            /* v136 PROFUNDIDAD TOTAL: el subtítulo duerme con una capa de cuerpo */
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono uppercase nexus-sub">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {right}
      </div>
    </div>
  );
}
