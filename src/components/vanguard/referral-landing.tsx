"use client";

// v34 LLAMADO A LAS ARMAS — recepción del recluta.
// Hasta ahora los enlaces compartidos llevaban ?ref=CODIGO pero NADIE lo procesaba:
// el invitado aterrizaba sin bono y el reclutador nunca recibía mérito.
// Ahora: se detecta el código, se guarda como unidad del agente, se da bono de
// bienvenida (+50 monedas) y se limpia la URL para que no quede sucia.

import { useEffect } from "react";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";

export function ReferralLanding() {
  const addCoins = useGameStore((s) => s.addCoins);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const raw = p.get("ref");
      if (!raw) return;
      const code = raw.replace(/[^A-Za-z0-9-]/g, "").slice(0, 16).toUpperCase();
      if (!code) return;

      // v37 MISIÓN 100: cuenta la visita traída por el enlace (ranking global).
      // Se cuenta 1 vez por sesión para que refrescar no infle el ranking.
      if (sessionStorage.getItem("vanguard_ref_counted") !== code) {
        sessionStorage.setItem("vanguard_ref_counted", code);
        fetch("/api/visits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "ref", code }),
        }).catch(() => {});
      }

      const prev = localStorage.getItem("vanguard_ref");
      const alreadyToasted = sessionStorage.getItem("vanguard_ref_toasted") === code;

      if (prev !== code) {
        localStorage.setItem("vanguard_ref", code);
        addCoins(50, `Bono de bienvenida — reclutado por ${code}`);
        if (!alreadyToasted) {
          toast.success(`Reclutado por la unidad ${code} · +50 monedas de bienvenida`, {
            duration: 7000,
          });
          sessionStorage.setItem("vanguard_ref_toasted", code);
        }
      } else if (!alreadyToasted) {
        toast.info(`Activo en la unidad ${code}. Recluta a más agentes y gana monedas.`, {
          duration: 5000,
        });
        sessionStorage.setItem("vanguard_ref_toasted", code);
      }

      // limpia ?ref= de la barra del navegador (el código ya quedó guardado)
      window.history.replaceState({}, "", window.location.pathname);
    } catch {
      /* never break the app por un referido */
    }
  }, [addCoins]);

  return null;
}
