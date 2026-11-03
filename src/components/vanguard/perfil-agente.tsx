"use client";

// ============================================================
// VANGUARD v170.2 — PERFIL DEL AGENTE
// Rango (10 grados), econom\u00eda, racha, historial, logros de
// exploraci\u00f3n y ajustes. v170.2: vitrina pública del linaje
// con las 3 joyas, título equipado y prestigio.
// ============================================================

import { useMemo } from "react";
import { RANGOS, rangoPorXp } from "@/lib/vanguard/agente-store";
import { SALAS } from "@/lib/vanguard/salas";
import { CATEGORIAS, type EstadoAgente } from "@/lib/vanguard/tipos";
import type { FichasApi } from "@/lib/vanguard/fichas-store";
import { calcularPrestigio, separarMiles, tituloPorId } from "@/lib/vanguard/gloria";
import { FichaCard } from "./fichas-arte";

interface PropsPerfil {
  agente: EstadoAgente;
  montado: boolean;
  eventosRed: number;
  online: boolean;
  fichasApi: FichasApi;
  onIrFichas: () => void;
  onToggleSonido: () => void;
  onReiniciar: () => void;
}

export function PerfilAgente({ agente, montado, eventosRed, online, fichasApi, onIrFichas, onToggleSonido, onReiniciar }: PropsPerfil) {
  const afinidadPorCat = useMemo(() => {
    const por: Record<string, number> = {};
    let total = 0;
    for (const sala of SALAS) {
      const s = agente.senales[sala.id];
      if (!s) continue;
      const p = s.likes * 3 + s.vistas + Math.min(s.tiempoMs / 60000, 3);
      por[sala.categoria] = (por[sala.categoria] ?? 0) + p;
      total += p;
    }
    return { por, total };
  }, [agente.senales]);

  if (!montado) return null;
  const rango = rangoPorXp(agente.xp);
  const exploradas = Object.values(agente.senales).filter((s) => s.vistas > 0).length;
  const likes = Object.values(agente.senales).reduce((a, s) => a + s.likes, 0);
  const tiempoMin = Math.round(Object.values(agente.senales).reduce((a, s) => a + s.tiempoMs, 0) / 60000);

  // gloria del linaje: vitrina, título y prestigio (defensivo si las fichas aún cargan)
  // NOTA: cálculo directo sin useMemo — vive tras el early-return de montado (≤3 piezas)
  const fichasListas = fichasApi.montado;
  const tituloE = fichasListas ? tituloPorId(fichasApi.fichas.tituloEquipado) : null;
  const prestigio = fichasListas ? calcularPrestigio(fichasApi.fichas) : null;
  const vitrinaPiezas: { uid: string; serial: number; def: NonNullable<ReturnType<FichasApi["resolverDef"]>> }[] = [];
  if (fichasListas) {
    for (const uid of fichasApi.fichas.vitrina) {
      const inst = fichasApi.fichas.inventario.find((i) => i.uid === uid);
      if (!inst) continue;
      const def = fichasApi.resolverDef(inst.fichaId);
      if (def) vitrinaPiezas.push({ uid: inst.uid, serial: inst.serial, def });
    }
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 pb-28 pt-6 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* tarjeta de identidad */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-transparent to-transparent p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-black/60 text-3xl">
              🎖️
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-bold tracking-[0.3em] text-white/40">EXPEDIENTE DEL AGENTE</div>
              <div className="text-xl font-black tracking-wider text-white">{rango.nombre}</div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50">
                <span className="text-amber-300 font-mono">{agente.xp} XP</span>
                {rango.siguiente && <span>· siguiente: {rango.siguiente}</span>}
              </div>
              {tituloE && (
                <div className="mt-1.5 inline-block rounded-lg border px-2 py-0.5 text-[8.5px] font-black tracking-widest" style={{ borderColor: tituloE.color, color: tituloE.color }}>
                  «{tituloE.nombre}»
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-700" style={{ width: `${rango.progreso}%` }} />
          </div>
        </div>

        {/* econom\u00eda y se\u00f1ales */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { etiqueta: "MON ◉", valor: agente.mon, color: "text-amber-300" },
            { etiqueta: "RACHA", valor: `${agente.racha}d`, color: "text-rose-300" },
            { etiqueta: "SALAS VISTAS", valor: `${exploradas}/${SALAS.length}`, color: "text-emerald-300" },
            { etiqueta: "PARTIDAS", valor: agente.partidas, color: "text-violet-300" },
            { etiqueta: "LIKES DADOS", valor: likes, color: "text-rose-300" },
            { etiqueta: "MINUTOS EN RED", valor: tiempoMin, color: "text-cyan-300" },
            { etiqueta: "EVENTOS DE RED", valor: eventosRed, color: "text-white/80" },
            { etiqueta: "CONEXIÓN", valor: online ? "VIVA" : "OFFLINE", color: online ? "text-emerald-300" : "text-red-300" },
          ].map((m) => (
            <div key={m.etiqueta} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
              <div className="text-[8px] font-bold tracking-[0.2em] text-white/40">{m.etiqueta}</div>
              <div className={`mt-1 text-lg font-black ${m.color}`}>{m.valor}</div>
            </div>
          ))}
        </div>

        {/* vitrina del linaje — la presunción que todos ven */}
        {fichasListas && prestigio && (
          <div className="rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-400/[0.07] via-transparent to-transparent p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-[0.25em] text-amber-200/90">VITRINA DEL LINAJE</span>
              <span className="font-mono text-[9px] text-white/40">{separarMiles(prestigio.total)} PRESTIGIO</span>
            </div>
            <p className="mt-1 text-[10px] text-white/40">
              Tus 3 joyas públicas. Cambiarlas, equipar títulos o copiar tu presunción vive en FICHAS → GLORIA.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((slot) => {
                const pieza = vitrinaPiezas[slot];
                if (!pieza) {
                  return (
                    <button
                      key={slot}
                      onClick={onIrFichas}
                      className="grid aspect-[3/4] place-items-center rounded-xl border border-dashed border-white/15 bg-black/20 text-[8px] font-bold text-white/25 transition-all hover:border-amber-300/50 hover:text-amber-200/60 active:scale-95"
                    >
                      + exhibir
                    </button>
                  );
                }
                return <FichaCard key={pieza.uid} def={pieza.def} instancia={{ uid: pieza.uid, fichaId: pieza.def.id, serial: pieza.serial, ts: 0, origen: "vitrina" }} tamaño="sm" onClick={onIrFichas} />;
              })}
            </div>
            <button
              onClick={onIrFichas}
              className="mt-3 w-full rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-[10px] font-black tracking-widest text-amber-200 transition-all hover:bg-amber-400/20 active:scale-95"
            >
              ◈ ABRIR LA COLECCIÓN · PRESUMIR ◈
            </button>
          </div>
        )}

        {/* afinidad por categor\u00eda — el retrato que lee el algoritmo */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-[10px] font-black tracking-[0.25em] text-white/50">TU PERFIL ALGORÍTMICO</div>
          <p className="mt-1 text-[11px] text-white/40">
            Esto es lo que el PARA TI ve cuando decide tu feed. Todo vive en tu dispositivo: la red solo recibe conteos anónimos.
          </p>
          <div className="mt-4 space-y-3">
            {(Object.keys(CATEGORIAS) as (keyof typeof CATEGORIAS)[]).map((cat) => {
              const p = afinidadPorCat.por[cat] ?? 0;
              const pct = afinidadPorCat.total > 0 ? Math.round((p / afinidadPorCat.total) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="mb-1 flex justify-between text-[10px]">
                    <span className={`font-bold tracking-widest ${CATEGORIAS[cat].texto}`}>{cat}</span>
                    <span className="font-mono text-white/40">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full rounded-full bg-gradient-to-r ${CATEGORIAS[cat].gradiente} transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* escalera de rangos */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-[10px] font-black tracking-[0.25em] text-white/50">ESCALERA DE RANGO</div>
          <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
            {RANGOS.map((r) => (
              <div
                key={r.nombre}
                className={`rounded-xl border px-2 py-2 text-center text-[9px] font-bold tracking-wider ${
                  agente.xp >= r.desde ? "border-amber-400/40 bg-amber-400/10 text-amber-300" : "border-white/10 text-white/30"
                }`}
              >
                {r.nombre}
                <div className="text-[8px] font-mono text-white/30">{r.desde} XP</div>
              </div>
            ))}
          </div>
        </div>

        {/* ajustes */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="text-[10px] font-black tracking-[0.25em] text-white/50">AJUSTES DE LA RED</div>
          <div className="mt-3 space-y-2">
            <button
              onClick={onToggleSonido}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4 text-left transition-all hover:border-white/30 active:scale-[0.98]"
            >
              <span>
                <span className="block text-xs font-black text-white">SONIDO DE LA RED</span>
                <span className="text-[10px] text-white/40">cascada de revelado y clics sintetizados</span>
              </span>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black ${agente.sonido ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/40"}`}>
                {agente.sonido ? "ACTIVO" : "SILENCIO"}
              </span>
            </button>
            <button
              onClick={onReiniciar}
              className="flex w-full items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-left transition-all hover:border-red-500/50 active:scale-[0.98]"
            >
              <span>
                <span className="block text-xs font-black text-red-300">QUEMAR EXPEDIENTE</span>
                <span className="text-[10px] text-white/40">borra se\u00f1ales, econom\u00eda y progreso local</span>
              </span>
              <span className="text-red-300">✕</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
