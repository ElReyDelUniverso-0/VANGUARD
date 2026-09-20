"use client";

// Vanguard v7 — Conexion de TIEMPO REAL al mini-servicio socket.io (:3003 via gateway).
// El gateway exige la query XTransformPort y rutas relativas (nunca URL absoluta).
import { io, type Socket } from "socket.io-client";

let _socket: Socket | null = null;

export function getRealtime(): Socket {
  if (typeof window === "undefined") {
    // nunca debe pasar en cliente; fallback inofensivo
    return null as unknown as Socket;
  }
  if (!_socket) {
    _socket = io("/?XTransformPort=3003", {
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
