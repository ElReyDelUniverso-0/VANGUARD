"use client";

import { useSyncExternalStore } from "react";
import { useGameStore } from "@/lib/game-store";
import { ACHIEVEMENTS } from "@/lib/game-data";

// v216.0 LOS 100 — el espejo honesto de la vitrina: tu progreso REAL contra
// los 100 objetivos. Server no puede ver tu aparato; este bloque client lee
// el store (zustand + persist) y pinta solo tras montar (cero mismatch).
// Ley v176: nada de setState en effects — el valor viene del store.

const sinSuscripcion = () => () => {};
const esCliente = () => true;
const esServidor = () => false;

export function VitrinaProgreso() {
  const montado = useSyncExternalStore(sinSuscripcion, esCliente, esServidor);
  const desbloqueados = useGameStore((s) => s.unlockedAchievements);

  if (!montado) return null;

  const total = ACHIEVEMENTS.length;
  const n = desbloqueados.length;
  const pct = Math.round((n / total) * 100);
  const faltan = ACHIEVEMENTS.filter((a) => !desbloqueados.includes(a.id));
  const proximos = faltan.slice(0, 3);

  return (
    <div className="vg216-progreso">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-400">
          Tu progreso real
        </div>
        <div className="font-mono text-2xl font-black text-amber">
          {n}
          <span className="text-zinc-600 text-base"> / {total}</span>
        </div>
      </div>
      <div className="mt-2 h-2.5 w-full rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-300 transition-all duration-700"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {n === 0
          ? "Nadie te regala nada aquí. Empieza ahora."
          : n >= 99
            ? "EL 1% ESTÁ A UN PASO — la historia ya es tuya."
            : `${pct}% del planeta conquistado — ${faltan.length} objetivos esperan su fin.`}
      </p>
      {proximos.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            Los próximos en caer:
          </div>
          {proximos.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 border border-zinc-800 bg-zinc-900/40 rounded-md px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-[12px] font-bold text-zinc-200 truncate">{a.title}</div>
                <div className="text-[10px] text-zinc-500 truncate">{a.description}</div>
              </div>
              <div className="shrink-0 font-mono text-[10px] text-amber">
                +{a.coinReward}◉{a.gemReward > 0 ? ` · +${a.gemReward}◆` : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
