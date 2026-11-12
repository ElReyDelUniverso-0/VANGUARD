"use client";

import dynamic from "next/dynamic";
import type { VistaUniverso } from "@/components/vanguard/panels/universo-diario-panel";

const UniversoDiarioPanel = dynamic(
  () => import("@/components/vanguard/panels/universo-diario-panel").then((m) => m.UniversoDiarioPanel),
  {
    ssr: false,
    loading: () => (
      <div className="hud-panel p-10 text-center font-mono text-xs text-amber">
        Cargando VANGUARD — The Daily Universe, Vanguard Credits & Collections...
      </div>
    ),
  }
);

export function UniversoCliente({ initialVista = "hoy" }: { initialVista?: VistaUniverso }) {
  return <UniversoDiarioPanel initialVista={initialVista} />;
}
