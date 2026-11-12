"use client";

import dynamic from "next/dynamic";

const TeatroTotalPanel = dynamic(
  () => import("@/components/vanguard/panels/teatro-total-panel").then((m) => m.TeatroTotalPanel),
  {
    ssr: false,
    loading: () => (
      <div className="hud-panel p-10 text-center font-mono text-xs text-amber">
        Cargando Motor Táctico Mundial 2D / 3D de VANGUARD...
      </div>
    ),
  }
);

export function Teatro3DCliente({
  initialModulo = "mundial",
  initialFrente,
  initialLat,
  initialLng,
  initialNombre,
}: {
  initialModulo?: "mundial" | "frentes" | "uniformes" | "escuadrones" | "armas";
  initialFrente?: string;
  initialLat?: number;
  initialLng?: number;
  initialNombre?: string;
}) {
  return (
    <TeatroTotalPanel
      initialModulo={initialModulo}
      initialFrente={initialFrente}
      initialLat={initialLat}
      initialLng={initialLng}
      initialNombre={initialNombre}
    />
  );
}
