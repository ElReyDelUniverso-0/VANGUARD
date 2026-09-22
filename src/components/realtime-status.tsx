"use client";

// VANGUARD v32 CIELO DE ACERO — badge global del estado del socket multijugador.
// Muestra lo que pasa POR DEBAJO (el watchdog de /api/health cubre solo el Next):
//  · ok          → punto verde discreto que se desvanece (no estorba)
//  · conectando  → gris "CONECTANDO…"
//  · recuperando → ámbar "RECONECTANDO…" (corte breve; recovery activo)
//  · despertando → cian "DESPIERTA SERVIDOR · ~1 MIN" (arranque en frío Render)
// Tocarlo fuerza un reintento manual (getRealtime().connect()).

import { useEffect, useState } from "react";
import { Satellite, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { getRealtime, onRealtimeState, peekRealtime, peekRealtimeState, type RealtimeState } from "@/lib/realtime";

const STYLES: Record<RealtimeState, { cls: string; dot: string; icon: React.ReactNode }> = {
  ok: {
    cls: "border-green-hud/50 bg-black/70",
    dot: "bg-green-hud",
    icon: <Wifi className="w-3 h-3 text-green-hud" />,
  },
  conectando: {
    cls: "border-border bg-black/80",
    dot: "bg-muted-foreground",
    icon: <Satellite className="w-3 h-3 text-muted-foreground animate-pulse" />,
  },
  recuperando: {
    cls: "border-amber-hud/70 bg-amber-hud/10",
    dot: "bg-amber-hud animate-pulse",
    icon: <Satellite className="w-3 h-3 text-amber-hud animate-pulse" />,
  },
  despertando: {
    cls: "border-cyan-hud/70 bg-cyan-hud/10",
    dot: "bg-cyan-hud animate-pulse",
    icon: <Satellite className="w-3 h-3 text-cyan-hud animate-bounce" />,
  },
};

export function RealtimeStatus() {
  const { t } = useT();
  const [state, setState] = useState<RealtimeState>(() => peekRealtimeState());
  const [quiet, setQuiet] = useState(false); // ok → colapsa a punto tras 4s

  // suscripción al bus global: los setState viven en el callback (eventos
  // externos), nunca síncronos en el cuerpo del effect (React 19 estricto)
  useEffect(() => {
    let iv: ReturnType<typeof setTimeout> | null = null;
    const un = onRealtimeState((s) => {
      setState(s);
      if (iv) {
        clearTimeout(iv);
        iv = null;
      }
      if (s === "ok") {
        iv = setTimeout(() => setQuiet(true), 4000);
      } else {
        setQuiet(false);
      }
    });
    return () => {
      if (iv) clearTimeout(iv);
      un();
    };
  }, []);

  if (state === "ok" && quiet) {
    return (
      <div
        className="fixed bottom-3 left-2 sm:left-3 z-40 flex items-center gap-1.5 px-1.5 py-1 rounded-full border border-green-hud/40 bg-black/60 cursor-pointer"
        onClick={() => setQuiet(false)}
        aria-label={t("rt.conectado")}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-hud opacity-70" />
      </div>
    );
  }

  const st = STYLES[state];
  const label =
    state === "ok"
      ? t("rt.conectado")
      : state === "conectando"
        ? t("rt.conectando")
        : state === "recuperando"
          ? t("rt.recuperando")
          : t("rt.despertando");

  return (
    <button
      type="button"
      onClick={() => {
        try {
          const s = peekRealtime() ?? getRealtime();
          if (!s.connected) s.connect();
        } catch {
          /* noop */
        }
      }}
      className={cn(
        "fixed bottom-3 left-2 sm:left-3 z-40 flex items-center gap-1.5 px-2 py-1 rounded-sm border font-mono text-[8px] uppercase tracking-widest backdrop-blur-sm select-none active:scale-95 transition-transform",
        st.cls
      )}
      aria-live="polite"
    >
      {state === "ok" ? (
        <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
      ) : (
        st.icon
      )}
      <span className={cn(state === "ok" ? "text-green-hud" : state === "recuperando" ? "text-amber-hud" : state === "despertando" ? "text-cyan-hud" : "text-muted-foreground")}>
        {label}
      </span>
      {state !== "ok" && <WifiOff className="w-2.5 h-2.5 opacity-50" />}
    </button>
  );
}
