"use client";

// Vanguard v7 — Conexion de TIEMPO REAL al mini-servicio socket.io (:3003 via gateway).
// El gateway exige la query XTransformPort y rutas relativas (nunca URL absoluta).
import { io, type Socket } from "socket.io-client";

let _socket: Socket | null = null;

// v30 PASO PRO: si NEXT_PUBLIC_REALTIME_URL está definida (p.ej. el servicio
// de Render), el cliente conecta allí; si no, usa el gateway local del sandbox.
// v31.1 CONEXIÓN TOTAL: en producción (Vercel/dominio propio) el cliente conecta
// DIRECTO al servidor multijugador de Render sin configurar ninguna variable;
// en localhost se conserva el gateway local del sandbox.
const ENV_REALTIME_URL = (process.env.NEXT_PUBLIC_REALTIME_URL || "").trim();
const RENDER_REALTIME_URL = "https://vanguard-games.onrender.com";
const IS_LOCALHOST =
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
const REALTIME_URL = ENV_REALTIME_URL || (IS_LOCALHOST ? "" : RENDER_REALTIME_URL);

// v32 CIELO DE ACERO — ESTABILIDAD:
//  · polling primero (aguanta redes móviles/hostiles; socket.io sube a websocket solo)
//  · timeout 20s (tolera el arranque en frío del plan gratis de Render)
//  · connectionStateRecovery: tras un corte breve el socket RECUPERA el estado
//    perdido sin refetch (server y cliente >= 4.6)
//  · despertador: en cada error de conexión un fetch a /health despierta el
//    contenedor dormido de Render y avisa al badge global.
export type RealtimeState = "ok" | "conectando" | "recuperando" | "despertando";

type RtListener = (s: RealtimeState) => void;
const _listeners = new Set<RtListener>();
let _state: RealtimeState = "conectando";
let _lastWake = 0;

export function peekRealtimeState(): RealtimeState {
  return _state;
}

/** Suscripción al estado global del socket; notifica solo cambios futuros
 *  (para el estado ACTUAL usa peekRealtimeState en el inicializador). */
export function onRealtimeState(cb: RtListener): () => void {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}

function setState(s: RealtimeState) {
  if (s === _state) return;
  _state = s;
  _listeners.forEach((l) => {
    try {
      l(s);
    } catch {
      /* listener ajeno no tumba el bus */
    }
  });
}

/** Cualquier request HTTP despierta el contenedor dormido de Render. */
function wakeService() {
  if (!REALTIME_URL) return; // gateway local del sandbox: nada que despertar
  const now = Date.now();
  if (now - _lastWake < 3000) return; // máx 1 ping cada 3s
  _lastWake = now;
  try {
    fetch(`${REALTIME_URL}/health`, { cache: "no-store" }).catch(() => {});
  } catch {
    /* noop */
  }
}

export function getRealtime(): Socket {
  if (typeof window === "undefined") {
    // nunca debe pasar en cliente; fallback inofensivo
    return null as unknown as Socket;
  }
  if (!_socket) {
    _socket = io(REALTIME_URL || "/?XTransformPort=3003", {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 6000,
      randomizationFactor: 0.5,
      timeout: 20000,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      },
    });

    _socket.on("connect", () => setState("ok"));
    _socket.io.on("reconnect", () => setState("ok"));
    _socket.io.on("reconnect_attempt", () => {
      setState("recuperando");
      wakeService();
    });
    _socket.on("disconnect", (reason) => {
      setState(reason === "io client disconnect" ? "conectando" : "recuperando");
    });
    _socket.on("connect_error", () => {
      setState("despertando");
      wakeService();
    });

    setState(_socket.connected ? "ok" : "conectando");
  }
  return _socket;
}

// v21 PULIDO: lee el socket existente SIN crearlo (para inicializadores perezosos
// de useState; evita setState síncrono dentro de effects).
export function peekRealtime(): Socket | null {
  return typeof window === "undefined" ? null : _socket;
}
