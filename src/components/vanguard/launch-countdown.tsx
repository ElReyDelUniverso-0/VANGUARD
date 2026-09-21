"use client";

// VANGUARD v31 — CUENTA ATRÁS AL GRAN ESTRENO MUNDIAL (mañana se publica
// oficialmente). Banner en la portada: cuenta las horas/min/seg hasta la
// medianoche del 22 de septiembre de 2026 (hora de Santo Domingo, UTC-4).
// Al llegar la hora cambia a "YA ESTAMOS EN VIVO" durante 7 días y luego
// desaparece solo.
import { useEffect, useState } from "react";
import { Rocket, PartyPopper } from "lucide-react";

// 2026-09-22 00:00:00 UTC-4 (America/Santo_Domingo)
const LAUNCH_MS = Date.parse("2026-09-22T00:00:00-04:00");
const HIDE_AFTER_MS = LAUNCH_MS + 7 * 24 * 3600_000; // 7 días después del estreno

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function LaunchCountdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // diferido un tick: evita setState síncrono en el efecto (cascada de renders)
    const t0 = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, []);

  if (now === null || now >= HIDE_AFTER_MS) return null;

  const live = now >= LAUNCH_MS;

  return (
    <div
      className="hud-corner relative overflow-hidden border-amber-hud"
      style={{
        background:
          "linear-gradient(120deg, rgba(255,58,48,0.14) 0%, rgba(30,144,255,0.10) 45%, rgba(255,211,77,0.12) 100%)",
      }}
      role="status"
    >
      <div className="absolute inset-0 pointer-events-none scanline opacity-30" aria-hidden />
      <div className="relative z-10 p-3.5 sm:p-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-sm border border-amber-hud bg-amber-hud/20 flex items-center justify-center flex-shrink-0">
            {live ? <PartyPopper className="w-4 h-4 text-amber" /> : <Rocket className="w-4 h-4 text-amber" />}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              {live ? "El momento llegó" : "Gran estreno mundial · cuenta atrás"}
            </div>
            <div className="text-sm sm:text-base font-mono font-black text-amber truncate">
              {live ? "¡VANGUARD YA ESTÁ EN VIVO PARA EL MUNDO!" : "MAÑANA VANGUARD SE PUBLICA OFICIALMENTE 🚀"}
            </div>
          </div>
        </div>

        {!live && (
          <div className="flex items-center gap-1.5 font-mono flex-shrink-0">
            {[
              { v: pad(Math.floor((LAUNCH_MS - now) / 3600_000)), l: "HORAS" },
              { v: pad(Math.floor(((LAUNCH_MS - now) % 3600_000) / 60_000)), l: "MIN" },
              { v: pad(Math.floor(((LAUNCH_MS - now) % 60_000) / 1000)), l: "SEG" },
            ].map((b) => (
              <div key={b.l} className="text-center px-2 py-1 bg-background/70 border border-amber-hud/40 rounded-sm min-w-[44px]">
                <div className="text-base font-bold text-amber leading-none tabular-nums">{b.v}</div>
                <div className="text-[7px] tracking-[0.2em] text-muted-foreground mt-0.5">{b.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
