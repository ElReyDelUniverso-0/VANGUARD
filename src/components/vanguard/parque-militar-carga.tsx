"use client";

// v367.8 — LA CARGA DEL PARQUE MILITAR (envoltorio de cliente)
// `next/dynamic({ ssr: false })` no se permite dentro de un Server Component en
// Next 16; el patrón de la casa (el mismo de la portada) es hacerlo aquí, en un
// componente de cliente, y que las salas server lo importen tal cual. La escena
// es WebGL puro: en servidor no hay nada que pintar.

import dynamic from "next/dynamic";
import type { FaccionId } from "@/lib/3d/activos-militares";

export const ParqueMilitarCarga = dynamic(
  () => import("@/components/vanguard/uniformes-3d").then((m) => m.ParqueMilitar),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-sm border border-amber-hud/30 bg-[#0a0d12] px-3 py-10">
        <p className="animate-pulse text-center font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
          montando el parque militar…
        </p>
      </div>
    ),
  },
) as unknown as (props: { faccionInicial?: FaccionId; alto?: number; compacto?: boolean }) => React.ReactElement;

export default ParqueMilitarCarga;
