"use client";

import { useEffect } from "react";

// v210.0 EL REFUGIO — registro del service worker, diferido como todo en la
// Casa (patrón MontajeTardio/capas-globales): nada pesa en el arranque, el
// worker se inscribe cuando el hilo queda idle y la sala ya respira.
// Es mudo y pasivo: no recarga nada (ley v190), no avisa nada — solo guarda
// activos mudos y sostiene el refugio sin conexión. En navegadores sin
// serviceWorker o en errores de registro, la Casa funciona exactamente igual
// que siempre: el worker es una red de seguridad, no una dependencia.

export function RegistroSW() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const registrar = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // silencio: sin worker la casa respira igual
        });
    };
    if (document.readyState === "complete") {
      registrar();
    } else {
      window.addEventListener("load", registrar, { once: true });
      return () => window.removeEventListener("load", registrar);
    }
  }, []);

  return null;
}
