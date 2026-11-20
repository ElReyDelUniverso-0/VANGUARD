"use client";

// ═══════════════════════════════════════════════════════════════════════════
// v431.0 · LA MENTE, MONTA — la única puerta que decide dónde NO entra
//
// La mente tiene que estar «cuando quiera», pero no en los sitios donde una
// capa flotante rompe la casa: el universo 3D (/vanguard2, un canvas puro) y
// las salas inmersivas de pantalla completa. Fuera de ahí, se monta una vez en
// el layout y sirve en todas las páginas.
// ═══════════════════════════════════════════════════════════════════════════

import { usePathname } from "next/navigation";
import { PanelMente } from "./panel-mente";

const SIN_MENTE = ["/vanguard2", "/vertigo", "/offline", "/entrar"];

export function MenteGlobal() {
  const ruta = usePathname() ?? "/";
  if (SIN_MENTE.some((r) => ruta === r || ruta.startsWith(r + "/"))) return null;
  return <PanelMente />;
}
