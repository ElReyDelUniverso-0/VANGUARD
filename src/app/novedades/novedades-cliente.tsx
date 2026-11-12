"use client";

import dynamic from "next/dynamic";
import type { FuncionExpansionId } from "@/lib/vanguard-expansion-data";

const NovedadesPanel = dynamic(
  () => import("@/components/vanguard/panels/novedades-panel").then((m) => m.NovedadesPanel),
  {
    ssr: false,
    loading: () => (
      <div className="hud-panel p-10 text-center font-mono text-xs text-amber">
        Cargando Panel Lo Nuevo & Expansión 10X de VANGUARD...
      </div>
    ),
  }
);

export function NovedadesCliente({
  initialVista = "todo",
  initialFuncion = "comparador-fuerzas",
}: {
  initialVista?: "todo" | "novedades" | "funciones";
  initialFuncion?: FuncionExpansionId;
}) {
  return <NovedadesPanel initialVista={initialVista} initialFuncion={initialFuncion} />;
}
