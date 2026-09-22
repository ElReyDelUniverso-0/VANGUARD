"use client";

// v27 ESTABILIDAD — watchdog de conexión.
// Consulta /api/health cada 30s; si el server falla 3 veces seguidas muestra
// un overlay "RECONECTANDO" (en vez de quedarse muerto en silencio) y cuando
// vuelve, recarga automáticamente una sola vez. También reacciona al evento
// `online` del navegador. Intervalos se limpian al desmontar (sin fugas).
// v32 CIELO DE ACERO — anti-nervios: los cold starts de Vercel Hobby (~2-5s)
// hacían parpadear el overlay y recargar la página; ahora timeout 10s,
// 3 fallos seguidos, y las pestañas ocultas no cuentan como fallo.

import { useEffect, useState } from "react";

export function ConnectionWatchdog() {
  const [down, setDown] = useState(false);

  useEffect(() => {
    let alive = true;
    let fails = 0;
    let reloaded = false;

    const ping = async () => {
      // pestaña oculta: el navegador congela timers y las peticiones vuelven raras;
      // no pinguear ni contar fallo (evita falsos "caído" al volver a la pestaña)
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 10000);
        const res = await fetch("/api/health", { cache: "no-store", signal: ctrl.signal });
        clearTimeout(t);
        fails = res.ok ? 0 : fails + 1;
      } catch {
        fails += 1;
      }
      if (!alive) return;
      const isDown = fails >= 3;
      setDown((prev) => {
        // recarga solo cuando pasamos de caído → arriba y no acabamos de recargar
        if (prev && !isDown && !reloaded) {
          reloaded = true;
          setTimeout(() => window.location.reload(), 1200);
        }
        return isDown;
      });
    };

    const iv = setInterval(ping, 30_000);
    const onOnline = () => void ping();
    window.addEventListener("online", onOnline);
    void ping();

    return () => {
      alive = false;
      clearInterval(iv);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!down) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center px-6">
      <div className="w-10 h-10 border-2 border-amber-hud border-t-transparent rounded-full animate-spin" />
      <div className="text-amber-hud font-mono font-bold tracking-widest text-sm">RECONECTANDO CON VANGUARD…</div>
      <p className="text-[11px] text-muted-foreground max-w-xs">
        Se perdió la conexión con el servidor. No cerraste nada: en cuanto vuelva la señal la página se recarga sola con
        todo tu progreso.
      </p>
    </div>
  );
}
