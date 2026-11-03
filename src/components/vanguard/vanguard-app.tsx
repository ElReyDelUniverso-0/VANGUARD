"use client";

// ============================================================
// VANGUARD v170.0 «RENACIMIENTO» — CÁSCARA RAÍZ
// 4 pestañas: PARA TI (algoritmo) · SALAS · BUSCAR · AGENTE.
// HUD superior (mon/XP/racha/red), overlay de sala, ⌘K,
// racha diaria, telemetría y auto-actualización.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAgente } from "@/lib/vanguard/agente-store";
import { useAutoActualizacion } from "@/lib/vanguard/auto-actualizacion";
import { useFichas } from "@/lib/vanguard/fichas-store";
import { tituloPorId } from "@/lib/vanguard/gloria";
import { SALA_POR_ID } from "@/lib/vanguard/salas";
import { rangoPorXp } from "@/lib/vanguard/agente-store";
import { FeedParaTi } from "./feed-para-ti";
import { SalasGrid } from "./salas-grid";
import { SalaVista } from "./sala-vista";
import { Buscador } from "./buscador";
import { PerfilAgente } from "./perfil-agente";
import { FichasVista } from "./fichas-vista";
import { sfxClick } from "@/lib/vanguard/sonido";

type Pestana = "parati" | "salas" | "fichas" | "buscar" | "agente";

const PESTANAS: { id: Pestana; etiqueta: string; icono: string }[] = [
  { id: "parati", etiqueta: "PARA TI", icono: "⚡" },
  { id: "salas", etiqueta: "SALAS", icono: "▦" },
  { id: "fichas", etiqueta: "FICHAS", icono: "◈" },
  { id: "buscar", etiqueta: "BUSCAR", icono: "⌕" },
  { id: "agente", etiqueta: "AGENTE", icono: "🎖️" },
];

export function VanguardApp() {
  const agenteApi = useAgente();
  const { agente, montado } = agenteApi;
  const fichasApi = useFichas(agenteApi); // una sola fuente de verdad para fichas + gloria
  const [pestana, setPestana] = useState<Pestana>("parati");
  const [salaAbierta, setSalaAbierta] = useState<string | null>(null);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const red = useAutoActualizacion();

  // semilla de sesión: el feed es estable dentro de la sesión, vivo entre sesiones
  const semillaSesion = useMemo(() => `ses-${Math.floor(Date.now() / 21_600_000)}`, []);

  // racha diaria al entrar
  useEffect(() => {
    if (montado) agenteApi.tocarRacha();
    }, [montado]);

  // aviso temporal (toasts ligeros sin dependencias)
  const mostrarAviso = useCallback((mensaje: string) => {
    setAviso(mensaje);
    window.setTimeout(() => setAviso(null), 3500);
  }, []);

  const abrirSala = useCallback(
    (salaId: string) => {
      agenteApi.abrirSala(salaId);
      setSalaAbierta(salaId);
    },
    [agenteApi]
  );

  const rango = rangoPorXp(agente.xp);

  const irAPestana = (p: Pestana) => {
    sfxClick();
    if (p === "buscar") {
      setBuscadorAbierto(true);
      return;
    }
    setPestana(p);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#05060a] text-white">
      {/* ── HUD SUPERIOR ── */}
      <header className="relative z-30 shrink-0 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black tracking-[0.18em] text-white">VANGUARD</span>
            <span className="hidden text-[9px] font-bold tracking-widest text-emerald-300 sm:inline">GLORIA 170.2</span>
          </div>

          <button
            onClick={() => { sfxClick(); setBuscadorAbierto(true); }}
            className="ml-auto hidden items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-white/50 transition-all hover:border-white/40 hover:text-white sm:flex"
          >
            <span>⌕</span> Buscar en la red
            <kbd className="rounded border border-white/20 bg-black/50 px-1.5 py-0.5 font-mono text-[9px]">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-2 sm:ml-3">
            <div className={`flex items-center gap-1.5 text-[9px] font-bold ${red.online ? "text-emerald-300" : "text-red-300"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${red.online ? "animate-pulse bg-emerald-400" : "bg-red-400"}`} />
              <span className="hidden sm:inline">{red.online ? "RED VIVA" : "SIN RED"}</span>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-amber-400/30 bg-amber-400/10 px-2.5 py-1">
              <span className="text-[11px] font-black text-amber-300">{agente.mon}</span>
              <span className="text-[10px] text-amber-300/70">◉</span>
            </div>
            <div className="hidden items-center gap-1 rounded-xl border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 sm:flex">
              <span className="text-[11px] font-black text-rose-300">{agente.racha}d</span>
              <span className="text-[10px]">🔥</span>
            </div>
            <div className="hidden flex-col items-end md:flex">
              <span className="text-[9px] font-black tracking-widest text-white">{rango.nombre}</span>
              <span className="text-[8px] font-mono text-white/40">{agente.xp} XP</span>
            </div>
            {montado && fichasApi.fichas.tituloEquipado && tituloPorId(fichasApi.fichas.tituloEquipado) && (
              <div
                className="hidden rounded-lg border px-2 py-1 text-[8px] font-black tracking-widest lg:block"
                style={{
                  borderColor: tituloPorId(fichasApi.fichas.tituloEquipado)!.color,
                  color: tituloPorId(fichasApi.fichas.tituloEquipado)!.color,
                }}
                title={`Título equipado: ${tituloPorId(fichasApi.fichas.tituloEquipado)!.nombre}`}
              >
                «{tituloPorId(fichasApi.fichas.tituloEquipado)!.nombre}»
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── CUERPO ── */}
      <main className="relative flex-1 overflow-hidden">
        {/* PESTANA: PARA TI */}
        <div className={`absolute inset-0 ${pestana === "parati" ? "block" : "hidden"}`}>
          <FeedParaTi
            agente={agente}
            semillaSesion={semillaSesion}
            onAbrir={abrirSala}
            onLike={agenteApi.darLike}
            onNoInteresa={agenteApi.marcarNoInteresa}
            sonido={agente.sonido}
            montado={montado}
          />
        </div>

        {/* PESTANA: SALAS */}
        <div className={`absolute inset-0 ${pestana === "salas" ? "block" : "hidden"}`}>
          <SalasGrid agente={agente} montado={montado} onAbrir={abrirSala} />
        </div>

        {/* PESTANA: FICHAS */}
        <div className={`absolute inset-0 ${pestana === "fichas" ? "block" : "hidden"}`}>
          <FichasVista agenteApi={agenteApi} fichasApi={fichasApi} montado={montado} onAviso={mostrarAviso} />
        </div>

        {/* PESTANA: AGENTE */}
        <div className={`absolute inset-0 ${pestana === "agente" ? "block" : "hidden"}`}>
          <PerfilAgente
            agente={agente}
            montado={montado}
            eventosRed={red.eventos}
            online={red.online}
            fichasApi={fichasApi}
            onIrFichas={() => irAPestana("fichas")}
            onToggleSonido={agenteApi.cambiarSonido}
            onReiniciar={() => {
              agenteApi.reiniciar();
              mostrarAviso("Expediente quemado. La red te recibe como agente nuevo.");
            }}
          />
        </div>

        {/* SALA ABIERTA (overlay) */}
        {salaAbierta && SALA_POR_ID[salaAbierta] && (
          <SalaVista
            sala={SALA_POR_ID[salaAbierta]}
            agenteApi={agenteApi}
            onVolver={() => setSalaAbierta(null)}
            onAviso={mostrarAviso}
          />
        )}
      </main>

      {/* ── NAVEGACIÓN INFERIOR ── */}
      <nav className="relative z-30 shrink-0 border-t border-white/10 bg-black/60 backdrop-blur-xl" aria-label="Navegación principal">
        <div className="mx-auto grid max-w-lg grid-cols-5 px-1 py-1.5">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              onClick={() => irAPestana(p.id)}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-2 transition-all active:scale-90 ${
                pestana === p.id ? "text-white" : "text-white/35 hover:text-white/70"
              }`}
            >
              <span className={`text-lg leading-none ${pestana === p.id && p.id === "parati" ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : ""}`}>
                {p.icono}
              </span>
              <span className="text-[8px] font-black tracking-[0.2em]">{p.etiqueta}</span>
              {pestana === p.id && <span className="h-0.5 w-6 rounded-full bg-white" />}
            </button>
          ))}
        </div>
      </nav>

      {/* BUSCADOR ⌘K */}
      <Buscador
        abierto={buscadorAbierto}
        onAbrir={() => setBuscadorAbierto(true)}
        onCerrar={() => setBuscadorAbierto(false)}
        onAbrirSala={abrirSala}
      />

      {/* AVISO GLOBAL */}
      {aviso && (
        <div className="pointer-events-none fixed left-1/2 top-16 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-2xl border border-white/20 bg-black/90 px-4 py-3 text-center text-xs font-semibold text-white shadow-2xl backdrop-blur">
          {aviso}
        </div>
      )}

      {/* AVISO DE AUTO-ACTUALIZACIÓN */}
      {red.avisoActualizacion && (
        <div className="fixed left-1/2 top-16 z-[60] w-[92%] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-400/40 bg-emerald-950/90 px-4 py-3 text-center text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur">
          NUEVA VERSIÓN DE LA RED DETECTADA — ACTUALIZANDO…
        </div>
      )}
    </div>
  );
}
