"use client";

// v73.0 REGLA DE ORO — wrapper de una línea para todos los paneles.
// Lee la config central de src/lib/regla-oro.ts y pinta:
//   1) título GRANDE llamativo → 2) ilustración hermosa → 3) texto fácil.
// Uso en cualquier panel: <HeroOro panel="noticias" />

import { TituloEpico } from "./titulo-epico";
import { REGLA_ORO, type ReglaOroPanel } from "@/lib/regla-oro";

export function HeroOro({
  panel,
  prioritaria = false,
}: {
  panel: ReglaOroPanel;
  prioritaria?: boolean;
}) {
  const c = REGLA_ORO[panel];
  if (!c) return null;
  const altura = "altura" in c && typeof c.altura === "number" ? c.altura : 230;
  return (
    <TituloEpico
      titulo={c.titulo}
      volanta={c.volanta}
      imagen={c.imagen}
      texto={c.texto}
      acento={c.acento}
      altura={altura}
      prioritaria={prioritaria}
    />
  );
}
