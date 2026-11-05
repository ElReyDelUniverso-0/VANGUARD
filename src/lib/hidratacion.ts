"use client";

// v327.0 EL ARQUITECTO SIN RELÓJ INTERNO — LA HIDRATACIÓN SE ESCUCHA UNA VEZ
//
// El bisturí de la v325 (lector-noticia) deja de ser local: las tres
// referencias del patrón useIsHydrated documentado por React viven UNA vez
// en este módulo y lo consumen todas las salas que esperan a la hidratación
// (ley v324, la del reloj central del anillo: el patrón compartido comparte
// hasta el reloj — CERO copias).
//
//   · suscribirNada: un suscriptor que nada escucha — la hidratación ES el
//     evento, no hay tienda que avisar (misma forma que la v325 usó en el
//     lector).
//   · SI_CLIENTE / SI_SERVIDOR: los dos snapshots. React usa el del servidor
//     durante SSR e hidratación y re-rende tras hidratar con el del cliente,
//     POR DISEÑO — sin mismatch, sin estado que nazca escribiendo.
//
// Identidad estable garantizada: las tres referencias viven a nivel de
// módulo (cero re-suscripciones entre renders), igual que las puso la v325.

import { useSyncExternalStore } from "react";

export function suscribirNada(): () => void {
  return () => {};
}

export const SI_CLIENTE = () => true;

export const SI_SERVIDOR = () => false;

export function useIsHydrated(): boolean {
  return useSyncExternalStore(suscribirNada, SI_CLIENTE, SI_SERVIDOR);
}
