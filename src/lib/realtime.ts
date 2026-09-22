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

export function getRealtime(): Socket {
  if (typeof window === "undefined") {
    // nunca debe pasar en cliente; fallback inofensivo
    return null as unknown as Socket;
  }
  if (!_socket) {
    _socket = io(REALTIME_URL || "/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
      timeout: 8000,
    });
  }
  return _socket;
}

// v21 PULIDO: lee el socket existente SIN crearlo (para inicializadores perezosos
// de useState; evita setState síncrono dentro de effects).
export function peekRealtime(): Socket | null {
  return typeof window === "undefined" ? null : _socket;
}
