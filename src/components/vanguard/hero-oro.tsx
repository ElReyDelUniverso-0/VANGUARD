"use client";

// v73.0 REGLA DE ORO — wrapper de una línea para todos los paneles.
// Lee la config central de src/lib/regla-oro.ts y pinta:
//   1) título GRANDE llamativo → 2) escena hermosa → 3) texto fácil.
// Uso en cualquier panel: <HeroOro panel="noticias" />
// v110.0 MATRIZ 2100: la imagen plana muere — cada panel recibe su
// ESCENA 3D procedural (variante por mundo) con sello EN VIVO.

import { TituloEpico } from "./titulo-epico";
import { REGLA_ORO, type ReglaOroPanel } from "@/lib/regla-oro";
import { escenaDePanel, hashDe } from "./escenas-3d";

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
      escena={escenaDePanel(panel)}
      semilla={hashDe(panel)}
      texto={c.texto}
      acento={c.acento}
      altura={altura}
      prioritaria={prioritaria}
    />
  );
}
