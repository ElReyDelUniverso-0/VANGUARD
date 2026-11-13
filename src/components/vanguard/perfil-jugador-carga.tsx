"use client";

// v367.6 — LA CARGA DEL CARNET (envoltorio de cliente)
// `next/dynamic({ ssr: false })` no se permite dentro de un Server Component
// (error de compilación en Next 16), así que el patrón de la casa —el mismo de
// la portada con sus paneles— se monta aquí, en un componente de cliente, y la
// sala server /perfil lo importa tal cual. El perfil trabaja con el aparato
// (almacenamiento local, foto, sesión): no tiene sentido pintarlo en servidor.

import dynamic from "next/dynamic";

export const PerfilJugadorCarga = dynamic(
  () => import("@/components/vanguard/perfil-jugador").then((m) => m.PerfilJugador),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-5">
        <div className="hud-panel animate-pulse rounded-sm border border-amber-hud/30 px-3 py-6">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            abriendo el carnet…
          </p>
        </div>
      </div>
    ),
  },
);

export default PerfilJugadorCarga;
