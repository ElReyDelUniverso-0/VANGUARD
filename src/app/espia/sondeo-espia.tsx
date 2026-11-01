"use client";

// v215.0 MODO ESPÍA — el sondeo del radar. El reloj de la última pasada
// y un botón honesto: el agente decide cuándo volver a escuchar (ley
// v190 — nada se refresca solo por arte de magia; aquí es un toque).

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SondeoEspia({ generado }: { generado: string }) {
  const router = useRouter();
  const [sondeando, setSondeando] = useState(false);

  // la hora del sondeo es derivada del render — sin efectos ni cascadas
  let hora = "";
  try {
    hora = new Date(generado).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  } catch {
    hora = "";
  }

  const sondear = () => {
    if (sondeando) return;
    setSondeando(true);
    try {
      router.refresh();
    } catch {
      /* noop */
    }
    // el refresco server llega en segundos; el botón respira de nuevo
    setTimeout(() => setSondeando(false), 1500);
  };

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.25em] uppercase text-cyan-300 border border-cyan-500/50 bg-cyan-500/10 rounded px-2 py-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
        Radar activo{hora ? ` · sondeo ${hora}` : ""}
      </span>
      <button
        type="button"
        onClick={sondear}
        disabled={sondeando}
        className={`font-mono text-[9px] uppercase tracking-widest rounded px-2.5 py-1 border transition-colors ${
          sondeando
            ? "border-cyan-500/40 text-cyan-500/60 cursor-wait"
            : "border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
        }`}
      >
        {sondeando ? "Escuchando…" : "Sondear de nuevo ▸"}
      </button>
    </div>
  );
}
