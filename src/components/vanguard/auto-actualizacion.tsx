"use client";

// Vanguard v207.0 INFINITO — AUTO-ACTUALIZACIÓN A LA VISTA.
// El Dueño mandó «que Vanguard siempre se actualice sola». Esta capa:
//   · pregunta a /api/system cada 4 minutos (y al volver a la pestaña),
//   · si detecta una versión MÁS NUEVA publicada, muestra un aviso fijo,
//     no bloqueante, con el botón ACTUALIZAR AHORA;
//   · la recarga SIEMPRE la decide el usuario (ley v190: nada se recarga
//     solo; ley v189: opt-in que no estorba). DESPUÉS la calla 15 minutos.
// Honestidad: si /api/system falla o no hay nada nuevo, esta capa es
// invisible — cero ruido, cero px ocupados.
// Vive en CapasGlobales → baja en diferido, jamás en el arranque crítico.

import { useEffect, useRef, useState } from "react";
import { APP_VERSION_LABEL } from "@/lib/version";

const CADA_MS = 4 * 60 * 1000;
const SILENCIO_MS = 15 * 60 * 1000;
const CLAVE_SILENCIO = "vg-update-silencio";

export function AutoActualizacion() {
  const [nueva, setNueva] = useState<string | null>(null);
  const ultima = useRef(0);
  const mirando = useRef(false);

  useEffect(() => {
    let muerta = false;
    const mirar = () => {
      if (muerta) return;
      // el silencio pedido por el usuario manda
      const calladoHasta = Number(localStorage.getItem(CLAVE_SILENCIO) ?? 0);
      if (Date.now() < calladoHasta) return;
      if (mirando.current || Date.now() - ultima.current < 60_000) return;
      mirando.current = true;
      ultima.current = Date.now();
      fetch("/api/system", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { hayNueva?: boolean; remota?: string | null } | null) => {
          if (!muerta && d?.hayNueva && d.remota) setNueva(d.remota);
        })
        .catch(() => {})
        .finally(() => {
          mirando.current = false;
        });
    };
    mirar(); // primera mirada al montar (la capa nace en diferido, casa ya viva)
    const alVolver = () => {
      if (document.visibilityState === "visible") {
        ultima.current = 0;
        mirar();
      }
    };
    document.addEventListener("visibilitychange", alVolver);
    const t = setInterval(mirar, CADA_MS);
    return () => {
      muerta = true;
      document.removeEventListener("visibilitychange", alVolver);
      clearInterval(t);
    };
  }, []);

  if (!nueva) return null;

  return (
    <div
      role="status"
      data-vg207-auto-actualizacion="1"
      className="fixed top-3 right-3 z-[95] max-w-[280px] hud-panel border-amber-hud/70 bg-black/90 backdrop-blur-md p-3 shadow-[0_0_24px_rgba(245,197,66,0.25)]"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-hud opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-hud" />
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber">
          nueva versión detectada
        </span>
      </div>
      <p className="text-[11px] text-foreground/90 leading-snug mt-1.5">
        Vanguard se puso al día sola: <span className="text-amber font-bold">{nueva}</span> está
        lista. Recarga para entrar en la casa nueva.
      </p>
      <div className="flex items-center gap-2 mt-2.5">
        <button
          onClick={() => {
            try {
              sessionStorage.setItem("vg-actualizo", `${APP_VERSION_LABEL}→${nueva}`);
            } catch {}
            location.reload();
          }}
          className="flex-1 px-2 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-sm bg-amber-hud text-black hover:brightness-110 transition"
        >
          ⟳ Actualizar ahora
        </button>
        <button
          onClick={() => {
            localStorage.setItem(CLAVE_SILENCIO, String(Date.now() + SILENCIO_MS));
            setNueva(null);
          }}
          className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider rounded-sm border border-white/25 text-muted-foreground hover:text-foreground transition"
        >
          Después
        </button>
      </div>
      <div className="text-[8px] font-mono text-muted-foreground/70 mt-1.5 uppercase tracking-wider">
        {APP_VERSION_LABEL} → {nueva} · se actualiza sola
      </div>
    </div>
  );
}
