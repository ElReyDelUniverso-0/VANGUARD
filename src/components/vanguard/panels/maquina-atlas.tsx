"use client";

// ============================================================
// v362.0 EL TIEMPO REAL — EL ATLAS DE LA HISTORIA
// «la máquina del tiempo debe tener TODOS los conflictos»:
// las 10 GUERRAS DEL ARCHIVO (HISTORICAL_WARS en game-data, v166)
// viven en UNA franja temporal real — cada barra se posiciona por
// sus AÑOS PUBLICADOS (deriva el mínimo y el máximo de la fuente,
// cero años a mano — guardia v234) y su ancho respira con la
// DURACIÓN del conflicto. Cuatro eras, colores de la casa.
// Clic en la barra = la ficha del conflicto: bandos,
// desenlace, bajas y por qué importa. Los conflictos VIVOS de
// hoy son los seis teatros MUNDO de arriba; esta franja es el
// pasado entero que la máquina también dueña.
// ============================================================

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Hourglass, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { HISTORICAL_WARS, type HistoricalWar } from "@/lib/game-data";

const COLOR_ERA: Record<HistoricalWar["era"], string> = {
  ANTIGUA: "#F5C542",
  EDAD_MEDIA: "#C084FC",
  MODERNA: "#4DD8FF",
  CONTEMPORANEA: "#FF4D5E",
};

const ETIQUETA_ERA: Record<HistoricalWar["era"], string> = {
  ANTIGUA: "ANTIGÜEDAD",
  EDAD_MEDIA: "EDAD MEDIA",
  MODERNA: "EDAD MODERNA",
  CONTEMPORANEA: "CONTEMPORÁNEA",
};

function anioTxt(y: number): string {
  return y < 0 ? `${Math.abs(y)} a.C.` : `${y}`;
}

const W_FRANJA = 960;

export function MaquinaAtlas() {
  const [sel, setSel] = useState<number | null>(null);

  // la escala del tiempo se deriva de la FUENTE (guardia v234: cero años a mano)
  const { min, max } = useMemo(() => {
    let a = Infinity;
    let b = -Infinity;
    for (const w of HISTORICAL_WARS) {
      a = Math.min(a, w.yearStart);
      b = Math.max(b, w.yearEnd);
    }
    return { min: a, max: b };
  }, []);
  const span = Math.max(1, max - min);

  const posIzq = (y: number) => ((y - min) / span) * 100;
  const anchoPct = (w: HistoricalWar) => Math.max(1.4, ((w.yearEnd - w.yearStart) / span) * 100);

  const seleccionada = sel != null ? HISTORICAL_WARS[sel] : null;

  return (
    <div className="rounded-2xl border border-white/12 bg-black/40 p-3.5" data-testid="maquina-atlas">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-amber-300">
          <Hourglass className="h-3.5 w-3.5" /> el atlas de la historia · {HISTORICAL_WARS.length} conflictos en una franja
        </span>
        <span className="font-mono text-[9px] text-white/35">
          {anioTxt(min)} → {anioTxt(max)} · desliza para viajar
        </span>
      </div>

      {/* leyenda de eras */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] text-white/45">
        {(Object.keys(COLOR_ERA) as HistoricalWar["era"][]).map((e) => (
          <span key={e} className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLOR_ERA[e] }} />
            {ETIQUETA_ERA[e]}
          </span>
        ))}
      </div>

      {/* la franja del tiempo */}
      <div className="mt-2 overflow-x-auto pb-1" data-testid="maquina-atlas-franja">
        <div className="relative min-w-[860px]" style={{ width: W_FRANJA }}>
          {/* la línea base del tiempo con sus siglos-lomos */}
          <div className="absolute inset-x-0 top-0 h-px bg-white/12" />
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <div key={f} className="absolute top-0 h-2 w-px bg-white/20" style={{ left: `${f * 100}%` }} />
          ))}
          <div className="absolute right-0 top-0 font-mono text-[8px] text-white/40" style={{ transform: "translateX(2px)" }}>
            HOY
          </div>
          {/* las barras de los conflictos */}
          <div className="relative mt-2 space-y-1">
            {HISTORICAL_WARS.map((w, i) => (
              <button
                key={w.id}
                data-testid={`maquina-atlas-barra-${i}`}
                onClick={() => setSel(i === sel ? null : i)}
                aria-label={`${w.name} (${anioTxt(w.yearStart)} – ${anioTxt(w.yearEnd)})`}
                className={cn(
                  "group relative flex h-5 items-center rounded transition-transform active:scale-[0.99]",
                  sel === i ? "outline outline-1 outline-white/60" : "",
                )}
                style={{ marginLeft: `${posIzq(w.yearStart)}%`, width: `${anchoPct(w)}` }}
                title={`${w.name} · ${anioTxt(w.yearStart)} – ${anioTxt(w.yearEnd)} · ${w.region}`}
              >
                <span
                  className="absolute inset-0 rounded opacity-70 transition-opacity group-hover:opacity-100"
                  style={{ background: `linear-gradient(90deg, ${COLOR_ERA[w.era]}66, ${COLOR_ERA[w.era]}22)` }}
                />
                <span
                  className="absolute left-0 top-0 h-full w-1 rounded-l"
                  style={{ background: COLOR_ERA[w.era] }}
                />
                <span className="relative z-10 truncate px-1.5 text-left text-[9.5px] font-bold text-white/80">
                  {w.emoji} {w.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* la ficha del conflicto elegido */}
      {seleccionada && (
        <motion.div
          key={seleccionada.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 rounded-xl border p-3"
          style={{ borderColor: `${COLOR_ERA[seleccionada.era]}55`, background: `${COLOR_ERA[seleccionada.era]}0d` }}
          data-testid="maquina-atlas-ficha"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg">{seleccionada.emoji}</span>
            <span className="text-[15px] font-black text-white/95">{seleccionada.name}</span>
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[8px] font-black tracking-wider"
              style={{ background: `${COLOR_ERA[seleccionada.era]}22`, color: COLOR_ERA[seleccionada.era] }}
            >
              {ETIQUETA_ERA[seleccionada.era]}
            </span>
            <span className="ml-auto font-mono text-[10px] text-white/50">
              {anioTxt(seleccionada.yearStart)} – {anioTxt(seleccionada.yearEnd)} · {seleccionada.region}
            </span>
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-white/75">{seleccionada.summary}</p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5">
              <div className="font-mono text-[8px] font-black uppercase tracking-widest text-cyan-300">bandos</div>
              <div className="mt-0.5 text-[11px] font-semibold text-white/75">{seleccionada.factions.join("  vs  ")}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5">
              <div className="font-mono text-[8px] font-black uppercase tracking-widest text-red-300">desenlace · bajas</div>
              <div className="mt-0.5 text-[11px] font-semibold text-white/75">
                {seleccionada.outcome} · {seleccionada.casualties}
              </div>
            </div>
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-white/55">
            <ScrollText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
            {seleccionada.significance}
          </p>
        </motion.div>
      )}

      <p className="mt-2 font-mono text-[9px] leading-relaxed text-white/30">
        Las {HISTORICAL_WARS.length} guerras del archivo resumen fuentes públicas con redacción propia de la casa;
        las fechas y las bajas son las publicadas por la historiografía — donde el registro discute, la ficha lo
        muestra. Los conflictos vivos de HOY viajan en los teatros MUNDO de la máquina.
      </p>
    </div>
  );
}
