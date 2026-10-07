"use client";

// v27 ESTABILIDAD — watchdog de conexión.
// Consulta /api/health cada 30s; si el server falla 3 veces seguidas muestra
// un overlay "RECONECTANDO" (en vez de quedarse muerto en silencio) y cuando
// vuelve, recarga automáticamente una sola vez. También reacciona al evento
// `online` del navegador. Intervalos se limpian al desmontar (sin fugas).
// v32 CIELO DE ACERO — anti-nervios: los cold starts de Vercel Hobby (~2-5s)
// hacían parpadear el overlay y recargar la página; ahora timeout 10s,
// 3 fallos seguidos, y las pestañas ocultas no cuentan como fallo.
// v33 ESCUELA DE GUERRA — anti-falsos-positivos: si el socket realtime está
// CONECTADO la experiencia es correcta aunque /api/health tarde: no overlay,
// no recarga (adiós a las recargas fantasma que "buggeaban" la app).
// v84.0 FORTUNA DE GUERRA — ANTI "SIEMPRE DICE QUE SE CAYÓ":
//   · el umbral necesita CONFIRMACIÓN: al llegar a 3 fallos se lanza un ping
//     extra de confirmación (2.5s) y solo entonces se tapa la pantalla. Un
//     microcorte ya nunca muestra el overlay.
//   · al volver a la pestaña (visibilitychange) el contador de fallos se
//     resetea: el navegador congeló los timers, no hubo caída real.
//   · /api/health ahora responde 200 mientras el proceso Next viva (la BD va
//     en el payload), así que el overlay solo aparece con el server MUERTO.

import { useEffect, useState } from "react";
import { peekRealtime } from "@/lib/realtime";

export function ConnectionWatchdog() {
  const [down, setDown] = useState(false);

  useEffect(() => {
    let alive = true;
    let fails = 0;
    let reloaded = false;
    let confirming = false;

    // sonda única: true si el server o el socket responden
    const probe = async (): Promise<boolean> => {
      if (peekRealtime()?.connected) return true;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 10000);
        const res = await fetch("/api/health", { cache: "no-store", signal: ctrl.signal });
        clearTimeout(t);
        return res.ok;
      } catch {
        return false;
      }
    };

    const ping = async () => {
      // pestaña oculta: el navegador congela timers y las peticiones vuelven raras;
      // no pinguear ni contar fallo (evita falsos "caído" al volver a la pestaña)
      if (typeof document !== "undefined" && document.hidden) return;
      const ok = await probe();
      if (!alive) return;
      if (ok) {
        fails = 0;
        setDown((prev) => {
          // recarga solo cuando pasamos de caído → arriba y no acabamos de recargar
          if (prev && !reloaded) {
            reloaded = true;
            setTimeout(() => window.location.reload(), 1200);
          }
          return false;
        });
        return;
      }
      fails += 1;
      if (fails < 3) return;
      // v84: umbral alcanzado → ping de CONFIRMACIÓN antes de tapar la pantalla
      if (!confirming) {
        confirming = true;
        setTimeout(async () => {
          confirming = false;
          if (!alive) return;
          const ok2 = await probe();
          if (ok2) {
            fails = 0;
            setDown(false);
            return;
          }
          if (alive && fails >= 3) setDown(true);
        }, 2500);
      }
    };

    const iv = setInterval(ping, 30_000);
    const onOnline = () => void ping();
    // v84: volver a la pestaña NO es una caída — resetea el contador y sondea
    const onVisible = () => {
      if (document.hidden) return;
      fails = 0;
      setDown(false);
      void ping();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    void ping();

    return () => {
      alive = false;
      clearInterval(iv);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
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
