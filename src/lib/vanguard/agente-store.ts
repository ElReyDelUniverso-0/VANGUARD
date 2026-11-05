"use client";

// ============================================================
// VANGUARD v170.0 — STORE DEL AGENTE
// mon ◉ · XP · racha · señales (combustible del algoritmo) ·
// historial · mecánicas de salas · telemetría batched.
// Persistencia: localStorage. Telemetría: POST /api/telemetria.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import type { EstadoAgente, SenalSala } from "./tipos";
import { estadoInicialMecanica } from "./mecanicas";

const CLAVE = "vanguard.agente.v170";
export function estadoInicial(): EstadoAgente {
  return {
    mon: 50,
    xp: 0,
    racha: 0,
    ultimoDiaRacha: "",
    partidas: 0,
    senales: {},
    historial: [],
    mecanicas: {},
    sonido: true,
  };
}

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function leer(): EstadoAgente {
  if (typeof window === "undefined") return estadoInicial();
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return estadoInicial();
    const parseado = JSON.parse(crudo) as Partial<EstadoAgente>;
    const base = estadoInicial();
    return {
      ...base,
      ...parseado,
      senales: parseado.senales ?? base.senales,
      historial: parseado.historial ?? base.historial,
      mecanicas: parseado.mecanicas ?? base.mecanicas,
    };
  } catch {
    return estadoInicial();
  }
}

function guardar(e: EstadoAgente): void {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(e));
  } catch {
    // cuota llena o storage bloqueado: el juego continúa en memoria
  }
}

// ── Rangos por XP (10 grados, herencia de PERFIL DEL AGENTE) ─
export const RANGOS = [
  { desde: 0, nombre: "CIUDADANO" },
  { desde: 60, nombre: "OBSERVADOR" },
  { desde: 150, nombre: "RECLUTA" },
  { desde: 300, nombre: "OPERADOR" },
  { desde: 500, nombre: "ANALISTA" },
  { desde: 750, nombre: "AGENTE" },
  { desde: 1050, nombre: "VETERANO" },
  { desde: 1400, nombre: "DIRECTOR" },
  { desde: 1800, nombre: "SOMBRA" },
  { desde: 2300, nombre: "LEYENDA" },
];

export function rangoPorXp(xp: number): { nombre: string; siguiente: string | null; progreso: number } {
  let idx = 0;
  for (let i = 0; i < RANGOS.length; i++) if (xp >= RANGOS[i].desde) idx = i;
  const actual = RANGOS[idx];
  const siguiente = RANGOS[idx + 1] ?? null;
  const progreso = siguiente
    ? Math.min(100, Math.round(((xp - actual.desde) / (siguiente.desde - actual.desde)) * 100))
    : 100;
  return { nombre: actual.nombre, siguiente: siguiente?.nombre ?? null, progreso };
}

// ── Telemetría client-side (batched, sin bloquear UI) ────────
type EventoTelemetria = { fila: string; via: string; ts: number };
let bufferTelemetria: EventoTelemetria[] = [];
let temporizadorTelemetria: ReturnType<typeof setInterval> | null = null;

function enviarTelemetria(): void {
  if (typeof window === "undefined") return;
  if (bufferTelemetria.length === 0) return;
  const lote = bufferTelemetria.splice(0, bufferTelemetria.length);
  try {
    void fetch("/api/telemetria", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventos: lote }),
      keepalive: true,
    }).catch(() => {
      // telemetría es mejor-esfuerzo: silencio total en fallo
    });
  } catch {
    // silencio
  }
}

function asegurarTelemetria(): void {
  if (temporizadorTelemetria !== null || typeof window === "undefined") return;
  temporizadorTelemetria = setInterval(enviarTelemetria, 30_000);
  window.addEventListener("beforeunload", enviarTelemetria);
}

function registrarEventoTelemetria(fila: string, via: string): void {
  const claveFila = (fila || "").trim().slice(0, 48).toLowerCase() || "(vacía)";
  bufferTelemetria.push({ fila: claveFila, via, ts: Date.now() });
  if (bufferTelemetria.length > 200) bufferTelemetria = bufferTelemetria.slice(-200);
  asegurarTelemetria();
}

// ── El hook central ──────────────────────────────────────────
export function useAgente() {
  const [agente, setAgente] = useState<EstadoAgente>(estadoInicial);
  const [montado, setMontado] = useState(false);
  const refAgente = useRef<EstadoAgente>(agente);

  useEffect(() => {
    refAgente.current = agente;
  }, [agente]);

  useEffect(() => {
    // diferido a microtarea: la lectura de storage nunca bloquea el render
    queueMicrotask(() => {
      const e = leer();
      // racha diaria estilo Duolingo: entrar un día nuevo la mantiene; 48 h la rompe
      const hoy = hoyIso();
      if (e.ultimoDiaRacha && e.ultimoDiaRacha !== hoy) {
        const ayer = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
        e.racha = e.ultimoDiaRacha === ayer ? e.racha : 0;
        e.ultimoDiaRacha = "";
        e.mecanicas = { ...e.mecanicas }; // el día nuevo reabre misiones
      }
      setAgente(e);
      setMontado(true);
    });
  }, []);

  const mutar = useCallback((fn: (e: EstadoAgente) => EstadoAgente) => {
    setAgente((prev) => {
      const nuevo = fn(structuredClone(prev));
      guardar(nuevo);
      return nuevo;
    });
  }, []);

  const abrirSala = useCallback(
    (salaId: string) => {
      const ahora = Date.now();
      mutar((e) => {
        const previa: SenalSala = e.senales[salaId] ?? {
          vistas: 0,
          likes: 0,
          noInteresa: false,
          tiempoMs: 0,
          ultimaVistaTs: 0,
        };
        const primeraVez = previa.vistas === 0;
        e.senales[salaId] = {
          ...previa,
          vistas: previa.vistas + 1,
          noInteresa: false,
          ultimaVistaTs: ahora,
        };
        e.historial = [salaId, ...e.historial.filter((h) => h !== salaId)].slice(0, 40);
        // la mecánica de la sala nace con su estado inicial persistido
        if (!e.mecanicas[salaId]) e.mecanicas[salaId] = estadoInicialMecanica(salaId);
        if (primeraVez) {
          e.mon += 10;
          e.xp += 8; // exploración premiada — fórmula Duolingo
        }
        return e;
      });
      registrarEventoTelemetria(`abrir:${salaId}`, "2d");
    },
    [mutar]
  );

  const registrarTiempo = useCallback(
    (salaId: string, ms: number) => {
      mutar((e) => {
        const previa = e.senales[salaId];
        if (!previa) return e;
        e.senales[salaId] = { ...previa, tiempoMs: previa.tiempoMs + Math.min(ms, 120_000) };
        return e;
      });
    },
    [mutar]
  );

  const darLike = useCallback(
    (salaId: string): boolean => {
      let yaEstaba = false;
      mutar((e) => {
        const previa = e.senales[salaId] ?? {
          vistas: 0,
          likes: 0,
          noInteresa: false,
          tiempoMs: 0,
          ultimaVistaTs: 0,
        };
        yaEstaba = previa.likes > 0;
        e.senales[salaId] = { ...previa, likes: yaEstaba ? 0 : 1 };
        if (!yaEstaba) {
          e.mon += 2;
          e.xp += 3;
        }
        return e;
      });
      registrarEventoTelemetria(`like:${salaId}`, "2d");
      return !yaEstaba;
    },
    [mutar]
  );

  const marcarNoInteresa = useCallback(
    (salaId: string) => {
      mutar((e) => {
        const previa = e.senales[salaId] ?? {
          vistas: 0,
          likes: 0,
          noInteresa: false,
          tiempoMs: 0,
          ultimaVistaTs: 0,
        };
        e.senales[salaId] = { ...previa, noInteresa: true };
        return e;
      });
      registrarEventoTelemetria(`ocultar:${salaId}`, "2d");
    },
    [mutar]
  );

  const recompensar = useCallback(
    (mon: number, xp: number, motivo: string) => {
      mutar((e) => {
        e.mon += mon;
        e.xp += xp;
        return e;
      });
      registrarEventoTelemetria(`recompensa:${motivo}`, "2d");
    },
    [mutar]
  );

  const contarPartida = useCallback(() => {
    mutar((e) => {
      e.partidas += 1;
      return e;
    });
  }, [mutar]);

  const pagar = useCallback(
    (mon: number): boolean => {
      if (refAgente.current.mon < mon) return false;
      mutar((e) => {
        e.mon -= mon;
        return e;
      });
      registrarEventoTelemetria("pago", "2d");
      return true;
    },
    [mutar]
  );

  const tocarRacha = useCallback(() => {
    mutar((e) => {
      const hoy = hoyIso();
      if (e.ultimoDiaRacha === hoy) return e;
      const ayer = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      e.racha = e.ultimoDiaRacha === ayer ? e.racha + 1 : 1;
      e.ultimoDiaRacha = hoy;
      e.mon += 5; // bonus diario de presencia
      return e;
    });
  }, [mutar]);

  const actualizarMecanica = useCallback(
    (salaId: string, estado: Record<string, unknown>) => {
      mutar((e) => {
        e.mecanicas[salaId] = estado;
        return e;
      });
    },
    [mutar]
  );

  const cambiarSonido = useCallback(() => {
    mutar((e) => {
      e.sonido = !e.sonido;
      return e;
    });
  }, [mutar]);

  const reiniciar = useCallback(() => {
    const fresco = estadoInicial();
    guardar(fresco);
    setAgente(fresco);
  }, []);

  return {
    agente,
    montado,
    abrirSala,
    registrarTiempo,
    darLike,
    marcarNoInteresa,
    recompensar,
    contarPartida,
    pagar,
    tocarRacha,
    actualizarMecanica,
    cambiarSonido,
    reiniciar,
  };
}

export type AgenteApi = ReturnType<typeof useAgente>;
