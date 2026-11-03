"use client";

// ============================================================
// VANGUARD v170.0 — SALA VISTA (detalle universal)
// Renderiza las filas de cualquier sala, procesa acciones de
// mecánica, ejecuta el minijuego ARCADE y gestiona tiempos.
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIAS, type Fila, type Sala } from "@/lib/vanguard/tipos";
import { filasDeSala, type DatosApi, type ContextoFilas } from "@/lib/vanguard/filas";
import { estadoInicialMecanica, procesarAccionMecanica, type ContextoMecanica } from "@/lib/vanguard/mecanicas";
import { sfxClick, sfxExito, sfxFallo } from "@/lib/vanguard/sonido";
import { rangoPorXp } from "@/lib/vanguard/agente-store";
import type { AgenteApi } from "@/lib/vanguard/agente-store";

interface PropsSala {
  sala: Sala;
  agenteApi: AgenteApi;
  onVolver: () => void;
  onAviso: (mensaje: string) => void;
}

export function SalaVista({ sala, agenteApi, onVolver, onAviso }: PropsSala) {
  const { agente } = agenteApi;
  const [datos, setDatos] = useState<DatosApi>({});
  const [cargando, setCargando] = useState(sala.fuente === "api");
  const [flash, setFlash] = useState<string | null>(null);
  const inicioSala = useRef(Date.now());
  const cat = CATEGORIAS[sala.categoria];

  const necesitaApi = sala.fuente === "api" || sala.id === "betnacion" || sala.id === "pulso";

  // carga de datos de las fuentes externas (por proxy interno)
  useEffect(() => {
    if (!necesitaApi) return;
    let vivo = true;
    const cargar = async () => {
      try {
        const pide: Promise<void>[] = [];
        const pedir = async (clave: keyof DatosApi, url: string) => {
          const r = await fetch(url, { cache: "no-store" });
          if (!r.ok) return;
          const j = (await r.json()) as DatosApi[keyof DatosApi];
          if (vivo && j) setDatos((prev) => ({ ...prev, [clave]: j }));
        };
        if (sala.id === "sismo" || sala.id === "pulso") pide.push(pedir("sismos", "/api/datos/sismos"));
        if (sala.id === "meteo" || sala.id === "pulso") pide.push(pedir("clima", "/api/datos/clima"));
        if (sala.id === "cripto" || sala.id === "betnacion" || sala.id === "pulso") pide.push(pedir("cripto", "/api/datos/cripto"));
        if (sala.id === "planeta" || sala.id === "pulso") pide.push(pedir("planeta", "/api/datos/planeta"));
        if (sala.id === "curiosidades" || sala.id === "pulso") pide.push(pedir("curiosidad", "/api/datos/curiosidad"));
        await Promise.all(pide);
      } catch {
        // la sala muestra su modo simulado honesto
      } finally {
        if (vivo) setCargando(false);
      }
    };
    void cargar();
    const t = setInterval(cargar, 120_000); // refresco automático en vivo
    return () => {
      vivo = false;
      clearInterval(t);
    };
  }, [necesitaApi, sala.id]);

  // registro de tiempo de estancia (señal de dwell para el algoritmo)
  useEffect(() => {
    return () => {
      agenteApi.registrarTiempo(sala.id, Date.now() - inicioSala.current);
    };
  }, [sala.id]);

  // Escape para volver
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onVolver();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onVolver]);

  const ctxMecanica: ContextoMecanica = useMemo(
    () => ({
      mon: agente.mon,
      likesDados: Object.values(agente.senales).reduce((a, s) => a + s.likes, 0),
      salasVisitadas: Object.values(agente.senales).filter((s) => s.vistas > 0).length,
      partidasJugadas: agente.partidas,
      racha: agente.racha,
      precioCripto: datos.cripto?.criptos.find((c) => c.simbolo === "BTC")?.precioUsd ?? null,
    }),
    [agente, datos.cripto]
  );

  const estadoMecanica = agente.mecanicas[sala.id] ?? estadoInicialMecanica(sala.id);

  const ctxFilas: ContextoFilas = useMemo(
    () => ({
      estado: estadoMecanica,
      mon: agente.mon,
      likesDados: ctxMecanica.likesDados,
      salasVisitadas: ctxMecanica.salasVisitadas,
      partidasJugadas: agente.partidas,
      racha: agente.racha,
      xp: agente.xp,
      rangoNombre: rangoPorXp(agente.xp).nombre,
      salasExploradas: Object.values(agente.senales).filter((s) => s.vistas > 0).length,
      totalSalas: 24,
    }),
    [estadoMecanica, agente, ctxMecanica]
  );

  const filas = useMemo(() => filasDeSala(sala, datos, ctxFilas), [sala, datos, ctxFilas]);

  // tick del imperio + resolución automática de betnación
  useEffect(() => {
    const t = setInterval(() => {
      if (sala.id === "imperio" && agente.mecanicas[sala.id]?.fundado) ejecutarAccion("tick");
      if (sala.id === "betnacion") {
        const apuesta = agente.mecanicas[sala.id]?.apuesta as { ts: number } | undefined;
        if (apuesta && Date.now() - apuesta.ts > 60_500) ejecutarAccion("resolver");
      }
    }, 4000);
    return () => clearInterval(t);
    }, [sala.id, agente]);

  const ejecutarAccion = useCallback(
    (accion: string) => {
      if (accion === "sin_op") return;
      const resultado = procesarAccionMecanica(
        sala.id,
        accion,
        { ...estadoInicialMecanica(sala.id), ...(agente.mecanicas[sala.id] ?? {}) },
        {
          ...ctxMecanica,
          mon: agente.mon,
        }
      );
      agenteApi.actualizarMecanica(sala.id, resultado.estado);
      if (resultado.deltaMon !== 0 || resultado.deltaXp !== 0) {
        agenteApi.recompensar(resultado.deltaMon, resultado.deltaXp, `${sala.id}:${accion.slice(0, 12)}`);
      }
      if (resultado.partidaJugada) agenteApi.contarPartida();
      if (resultado.mensaje) onAviso(resultado.mensaje);
      if (resultado.sonido === "exito") sfxExito();
      else if (resultado.sonido === "fallo") sfxFallo();
      else if (resultado.sonido === "click" && agente.sonido) sfxClick();
    },
      [sala.id, agente.mecanicas, agente.mon, ctxMecanica, agente.sonido]
  );

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#05060a]">
      {/* cabecera de sala */}
      <header className={`relative shrink-0 overflow-hidden border-b ${cat.borde} bg-gradient-to-br ${cat.gradiente}`}>
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative flex items-center gap-3 px-4 py-4 sm:px-6">
          <button
            onClick={() => { sfxClick(); onVolver(); }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black/40 text-white/80 transition-all active:scale-90"
            aria-label="Volver"
          >
            ←
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-black/40 text-2xl">
            {sala.icono}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-black tracking-wider text-white">{sala.nombre}</h1>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold tracking-[0.2em] ${cat.texto}`}>{cat.etiqueta}</span>
              <span className="rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-[9px] font-bold tracking-widest text-white/70">
                {sala.fuenteEtiqueta}
              </span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[9px] tracking-widest text-white/50">SALDO</div>
            <div className="text-sm font-black text-amber-300">{agente.mon} ◉</div>
          </div>
        </div>
      </header>

      {/* cuerpo de filas */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28 pt-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-3">
          {cargando && (
            <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4 text-xs tracking-widest text-white/40">
              SINCRONIZANDO FUENTE EXTERNA…
            </div>
          )}
          {sala.id === "arcade" && <Arcade onFin={(puntos) => ejecutarAccion(`fin:${puntos}`)} activo />}
          {filas.map((fila, i) => (
            <FilaRender key={`${sala.id}-${i}`} fila={fila} onAccion={ejecutarAccion} />
          ))}
          <div className="pt-2 text-center">
            <span className="text-[9px] font-mono tracking-widest text-white/20">
              VANGUARD 170.0 · SIN MODO 3D · SEÑALES EN TU DISPOSITIVO
            </span>
          </div>
        </div>
      </div>

      {/* flash de feedback */}
      {flash && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-black/80 px-4 py-2 text-xs font-bold text-white">
          {flash}
        </div>
      )}
    </div>
  );
}

// ── Renderizador de filas universales ────────────────────────
function FilaRender({ fila, onAccion }: { fila: Fila; onAccion: (a: string) => void }) {
  switch (fila.tipo) {
    case "stat":
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-[9px] font-bold tracking-[0.25em] text-white/40">{fila.etiqueta}</div>
          <div className={`mt-1 text-base font-black ${fila.color ?? "text-white"}`}>{fila.valor}</div>
          {fila.detalle && <div className="mt-0.5 text-[11px] text-white/45">{fila.detalle}</div>}
        </div>
      );
    case "texto":
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-[10px] font-black tracking-[0.2em] text-white/60">{fila.titulo}</div>
          <p className="mt-2 text-[13px] leading-relaxed text-white/70">{fila.cuerpo}</p>
        </div>
      );
    case "lista":
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-xs font-black tracking-wide text-white">{fila.titulo}</div>
          {fila.items.map((item, i) => (
            <div key={i} className="mt-2 border-t border-white/5 pt-2 first:border-0 first:pt-0">
              <div className={`text-[13px] font-semibold ${item.color ?? "text-white/85"}`}>{item.principal}</div>
              {item.secundario && <div className="mt-0.5 text-[11px] leading-relaxed text-white/45">{item.secundario}</div>}
            </div>
          ))}
        </div>
      );
    case "progreso":
      return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] font-bold tracking-[0.25em] text-white/40">{fila.etiqueta}</span>
            <span className={`text-xs font-black ${fila.color ?? "text-white"}`}>{fila.detalle}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-white/60 to-white transition-all duration-500 ${fila.color ?? ""}`}
              style={{ width: `${Math.max(0, Math.min(100, fila.valor))}%` }}
            />
          </div>
        </div>
      );
    case "accion":
      return (
        <button
          onClick={() => onAccion(fila.accion)}
          className="group flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/[0.06] p-4 text-left transition-all hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
        >
          <span>
            <span className="block text-[13px] font-black tracking-wide text-white">{fila.etiqueta}</span>
            {fila.nota && <span className="mt-0.5 block text-[10px] text-white/40">{fila.nota}</span>}
          </span>
          <span className="ml-3 text-lg text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-white">→</span>
        </button>
      );
  }
}

// ── MINIJUEGO ARCADE: reflejos contra el reloj ───────────────
function Arcade({ onFin, activo }: { onFin: (puntos: number) => void; activo: boolean }) {
  const [enJuego, setEnJuego] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [restante, setRestante] = useState(20);
  const [blanco, setBlanco] = useState({ x: 50, y: 50 });
  const arenaRef = useRef<HTMLDivElement>(null);
  const puntosRef = useRef(0);

  useEffect(() => {
    if (!enJuego) return;
    const inicio = Date.now();
    const t = setInterval(() => {
      const rest = 20 - Math.floor((Date.now() - inicio) / 1000);
      if (rest <= 0) {
        clearInterval(t);
        setEnJuego(false);
        onFin(puntosRef.current);
        setPuntos(0);
        setRestante(20);
        return;
      }
      setRestante(rest);
    }, 1000);
    return () => clearInterval(t);
  }, [enJuego, onFin]);

  const empezar = () => {
    setPuntos(0);
    setRestante(20);
    moverBlanco();
    setEnJuego(true);
    sfxClick();
  };

  const moverBlanco = () => {
    setBlanco({ x: 12 + Math.random() * 76, y: 14 + Math.random() * 72 });
  };

  const golpear = () => {
    const nuevo = puntos + 1;
    setPuntos(nuevo);
    puntosRef.current = nuevo;
    moverBlanco();
    sfxClick();
  };

  if (!activo) return null;

  return (
    <div className="rounded-2xl border border-red-500/30 bg-black/40 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[9px] font-bold tracking-[0.25em] text-red-300">ARENA DE REFLEJOS</span>
        <span className="font-mono text-sm font-black text-white">
          {puntos} pts · {Math.max(0, restante)}s
        </span>
      </div>
      <div
        ref={arenaRef}
        className="relative mt-3 h-56 w-full cursor-crosshair overflow-hidden rounded-xl border border-white/10 bg-[#080a10]"
      >
        {enJuego ? (
          <button
            onClick={golpear}
            className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-red-400 to-rose-600 shadow-[0_0_25px_rgba(239,68,68,0.7)] transition-all duration-150 active:scale-90"
            style={{ left: `${blanco.x}%`, top: `${blanco.y}%` }}
            aria-label="Blanco"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <span className="text-xs tracking-widest text-white/50">20 segundos. Blancos fugaces. Tu récord te mira.</span>
            <button
              onClick={empezar}
              className="rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 text-sm font-black tracking-widest text-white active:scale-95"
            >
              {puntos > 0 || restante < 20 ? "OTRA PARTIDA" : "EMPEZAR"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
