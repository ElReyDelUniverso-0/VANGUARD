"use client";

// v99.0 MENTE VIVA — PULSO AUTÓNOMO: la capa que hace que Vanguard se
// actualice SOLO en TODAS las páginas. Cada 5 minutos el mundo avanza un
// pulso (motor determinista compartido, sin servidor): esta capa detecta el
// cambio, anuncia los eventos nuevos con una píldora que se expande en
// banner, y deja ir a la sala de LA MENTE con un clic.
// Motor: src/lib/mente-data.ts · Recompensa: NINGUNA (información pura).

import { useEffect, useState } from "react";
import { Brain, X, ChevronRight, Radio } from "lucide-react";
import { navigateTo } from "@/lib/nav";
import {
  pulsoActual, proximoPulsoMs, eventosPulso, riesgoPulso,
  TIPO_COLOR,
} from "@/lib/mente-data";

const LS_PULSO = "vg-pulso-v99";

function leerVisto(): number {
  try {
    const n = Number(JSON.parse(localStorage.getItem(LS_PULSO) || "{}").lastBucket);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}
function guardarVisto(bucket: number) {
  try {
    localStorage.setItem(LS_PULSO, JSON.stringify({ lastBucket: bucket, ts: Date.now() }));
  } catch { /* noop */ }
}

export function PulsoAuto() {
  const [montado, setMontado] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());
  const [abierto, setAbierto] = useState(false);
  const [evento, setEvento] = useState<string>("");
  const [salto, setSalto] = useState(0); // pulsos que avanzó mientras no mirabas
  const [visto, setVisto] = useState<number | null>(null); // null = sin inicializar

  useEffect(() => {
    // init en callback (cumple react-hooks/set-state-in-effect)
    const t0 = setTimeout(() => {
      setMontado(true);
      const guardado = leerVisto();
      const b = pulsoActual();
      // primera visita: fijar SIN anunciar · visitas: el estado anunciará si hubo saltos
      if (guardado === 0) {
        guardarVisto(b);
        setVisto(b);
      } else {
        setVisto(guardado);
      }
    }, 0);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearTimeout(t0); clearInterval(id); };
  }, []);

  const bucket = pulsoActual(now);
  const restante = Math.floor(proximoPulsoMs(now) / 1000);
  const restanteTxt = `${String(Math.floor(restante / 60)).padStart(2, "0")}:${String(restante % 60).padStart(2, "0")}`;

  // transición de pulso (patrón render-time setState del proyecto: dispara una
  // sola vez por cubo, no por tick)
  if (montado && visto !== null && bucket !== visto) {
    const saltoReal = Math.min(12, bucket - visto);
    setVisto(bucket);
    setSalto(saltoReal);
    const evs = eventosPulso(bucket);
    const top = [...evs].sort((a, b) => b.riesgo - a.riesgo)[0];
    setEvento(top ? top.titulo : "");
    setAbierto(true);
    guardarVisto(bucket);
  }

  if (!montado) return null;

  const evs = eventosPulso(bucket);
  const riesgo = riesgoPulso(bucket);
  const colorRiesgo = riesgo >= 70 ? "#FF3B30" : riesgo >= 45 ? "#FFA030" : "#4ADE80";

  return (
    <div className="fixed bottom-3 left-3 z-[70] max-w-[min(92vw,360px)] pointer-events-none">
      {abierto ? (
        // ---------- banner de actualización ----------
        <div className="pointer-events-auto v99-pulso rounded-xl border bg-black/90 backdrop-blur-md p-3 shadow-2xl" style={{ borderColor: "#BEF26466" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full vg-acc-dot shrink-0" style={{ background: "#BEF264" }} />
            <p className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: "#BEF264" }}>
              VANGUARD SE ACTUALIZÓ SOLA
            </p>
            <button
              onClick={() => setAbierto(false)}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar aviso de pulso"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {salto > 1 && (
            <p className="text-[10px] text-muted-foreground font-mono mb-1">
              el mundo avanzó {salto} pulsos mientras no mirabas
            </p>
          )}
          {evento && <p className="text-[12px] leading-snug text-foreground/90 mb-2">{evento}</p>}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-muted-foreground">
              pulso Nº {bucket} · riesgo {riesgo} · próximo en {restanteTxt}
            </span>
            <button
              onClick={() => { setAbierto(false); navigateTo("mente"); }}
              className="ml-auto flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold text-black transition-transform active:scale-95"
              style={{ background: "#BEF264" }}
            >
              <Brain className="w-3 h-3" /> VER EN LA MENTE <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        // ---------- píldora compacta (siempre visible, discreta) ----------
        <button
          onClick={() => setAbierto(true)}
          className="pointer-events-auto group flex items-center gap-2 rounded-full border border-white/15 bg-black/80 backdrop-blur-md px-3 py-1.5 transition-colors hover:border-white/35"
          aria-label="Estado del pulso autónomo del mundo"
        >
          <Radio className="w-3 h-3 shrink-0" style={{ color: "#BEF264" }} />
          <span className="font-mono text-[9.5px] text-muted-foreground tabular-nums">
            PULSO {bucket} · {restanteTxt}
          </span>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: colorRiesgo }} />
          <span className="hidden sm:inline font-mono text-[9px] text-muted-foreground/70 group-hover:text-muted-foreground">
            se renueva en {Math.max(1, Math.ceil(((5 * 60_000) - proximoPulsoMs(now)) / 60_000))} min · {evs.length} señales
          </span>
        </button>
      )}
    </div>
  );
}
