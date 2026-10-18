"use client";

// ============================================================
// v135.0 NEXUS-HYPNOS — MOTOR DE TENSIÓN GLOBAL
// "The War Room Ambient": la Casa entera DEBE respirar con el
// pulso del planeta. Este motor lee el termómetro vivo
// (tension.ts v67) y escribe en el <html>:
//   · data-tension = "calma" | "tensa" | "alta" | "critica"
//   · --vg-tension = 0.000..1.000 (nivel fino para CSS calc)
// El CSS de v135 reacciona en cadena: la aurora cambia de
// color, las líneas de vida laten más rápido, los bordes se
// enrojecen y en CRÍTICA la señal entera sufre glitch.
// Cero re-render de React: puro CSS reaccionando a atributos.
// ============================================================
import { useEffect } from "react";
import { getTension } from "@/lib/tension";

function aplicarTension() {
  try {
    const t = getTension();
    const tier = t < 35 ? "calma" : t < 60 ? "tensa" : t < 80 ? "alta" : "critica";
    const html = document.documentElement;
    if (html.dataset.tension !== tier) html.dataset.tension = tier;
    html.style.setProperty("--vg-tension", (t / 100).toFixed(3));
  } catch {
    /* sin documento: SSR */
  }
}

export function MotorNexus() {
  useEffect(() => {
    aplicarTension();
    // el planeta deriva: relee el termómetro cada 12s
    const iv = window.setInterval(aplicarTension, 12000);
    // empujones instantáneos (crisis votada, protocolo rojo...)
    const alEmpujon = () => aplicarTension();
    window.addEventListener("vanguard:tension", alEmpujon);
    return () => {
      window.clearInterval(iv);
      window.removeEventListener("vanguard:tension", alEmpujon);
    };
  }, []);
  return null;
}
