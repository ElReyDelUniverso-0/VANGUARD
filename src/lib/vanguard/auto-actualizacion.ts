"use client";

// ============================================================
// VANGUARD v170.0 — AUTO-ACTUALIZACIÓN
// «que vanguard actualice solo»: sondeo de /api/health cada 60 s.
// Si la versión de la red cambia → aviso + recarga suave
// (inmediata si la pestaña está en segundo plano, al estar
// inactivo 20 s si no). Cero dependencias, cero service worker.
// ============================================================

import { useEffect, useRef, useState } from "react";

const VERSION_RED = "170.2";

export interface EstadoRed {
  version: string | null;
  eventos: number;
  online: boolean;
  avisoActualizacion: boolean;
}

export function useAutoActualizacion(): EstadoRed {
  const [estado, setEstado] = useState<EstadoRed>({
    version: null,
    eventos: 0,
    online: true,
    avisoActualizacion: false,
  });
  const ultimaActividad = useRef<number>(Date.now());
  const refAviso = useRef(false);

  useEffect(() => {
    const marcarActividad = () => {
      ultimaActividad.current = Date.now();
    };
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) =>
      window.addEventListener(ev, marcarActividad, { passive: true })
    );

    const sondear = async () => {
      try {
        const r = await fetch("/api/health", { cache: "no-store" });
        const j = (await r.json()) as {
          version?: string;
          telemetria?: { totalEventos?: number };
        };
        const remota = j.version ?? "";
        const nuevaVersion = Boolean(remota && remota !== VERSION_RED);
        setEstado({
          version: remota || null,
          eventos: j.telemetria?.totalEventos ?? 0,
          online: true,
          avisoActualizacion: nuevaVersion,
        });
        if (nuevaVersion && !refAviso.current) {
          refAviso.current = true;
          const inactivo = Date.now() - ultimaActividad.current > 20_000;
          const oculto = typeof document !== "undefined" && document.hidden;
          if (inactivo || oculto) {
            window.location.reload();
          } else {
            window.setTimeout(() => window.location.reload(), 6_000);
          }
        }
      } catch {
        setEstado((prev) => ({ ...prev, online: false }));
      }
    };

    void sondear();
    const t = setInterval(sondear, 60_000);
    return () => {
      clearInterval(t);
      ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) =>
        window.removeEventListener(ev, marcarActividad)
      );
    };
  }, []);

  return estado;
}
