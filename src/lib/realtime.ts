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

    _socket.on("connect", () => {
      setState("ok");
      // v36 BLINDAJE TOTAL — AUTO-RECLUTAMIENTO: cada visitante entra al lobby
      // de la guerra global en cuanto el socket vive (también en reconexiones),
      // con SU identidad persistente (la misma clave que usa multiplayer-panel).
      // Así la partida mundial nunca luce vacía (0/24) y al abrir el panel el
      // comandante ya está dentro y puede reclamar territorio al instante.
      autoJoinMp();
    });
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

    startLifeline();
    setState(_socket.connected ? "ok" : "conectando");
  }
  return _socket;
}

// v33 ESCUELA DE GUERRA — LÍNEA DE VIDA PERMANENTE.
// El plan gratis de Render duerme el contenedor a los 15 min sin tráfico y en
// móvil el navegador congela los timers al ocultar la pestaña: el socket moría
// y no volvía solo ("solo dura 5 minutos"). Triple defensa, todo en cliente:
//  1) GUARDIÁN (10s, pestaña visible): si el socket no está conectado y no hay
//     intento de reconexión en marcha, fuerza socket.connect() + despertador.
//  2) KEEP-ALIVE (4 min): un fetch a /health mantiene el contenedor de Render
//     DESPIERTO mientras haya alguien con la web abierta (4 min << 15 min).
//  3) RESURRECCIÓN instantánea: al volver a la pestaña o recuperar la red,
//     despierta + reconecta al momento (sin esperar el siguiente retry).
let _lifelineStarted = false;

function healSocket() {
  const s = _socket;
  if (!s || s.connected) return;
  wakeService();
  try {
    // connect() es seguro incluso si ya está reconectando: reintenta al instante
    s.connect();
  } catch {
    /* el motor ya está en marcha */
  }
}

// v36 — AUTO-RECLUTAMIENTO AL LOBBY DE GUERRA GLOBAL.
// Usa EXACTAMENTE las mismas claves que multiplayer-panel (vanguard-mp-uid)
// para que sea el MISMO jugador, no un fantasma duplicado. El alias se lee del
// persist de game-store (sin importarlo: evitaría una dependencia circular).
function autoJoinMp() {
  try {
    let id = localStorage.getItem("vanguard-mp-uid");
    if (!id) {
      id = `mp-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      localStorage.setItem("vanguard-mp-uid", id);
    }
    let name = "OPERADOR";
    try {
      const raw = localStorage.getItem("vanguard-game-state-v1");
      if (raw) {
        const al = String(JSON.parse(raw)?.state?.alias || "").trim();
        if (al) name = al.slice(0, 18);
      }
    } catch {
      /* alias ilegible: seguimos como OPERADOR */
    }
    _socket?.emit("mp:join", { playerId: id, name }, () => {});

    // v38 OPERACIÓN 100 JUGADORES — reto extremo del mando: conseguir 100 jugadores.
    // Cada agente que entra a la guerra suma al contador GLOBAL de jugadores únicos:
    // dedupe por UID en la BD (player:UID) y gate de sesión para que las
    // reconexiones no re-cuenten. Dispara el evento para la barra en vivo.
    if (sessionStorage.getItem("vanguard_player_counted") !== "1") {
      sessionStorage.setItem("vanguard_player_counted", "1");
      window.dispatchEvent(new CustomEvent("vanguard:player"));
      fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "player", uid: id }),
      }).catch(() => {});
    }
  } catch {
    /* el auto-join jamás tumba la conexión */
  }
}

function startLifeline() {
  if (_lifelineStarted || typeof window === "undefined") return;
  _lifelineStarted = true;

  // 1) guardián de pulso
  setInterval(() => {
    if (document.hidden) return; // oculta: el navegador congela red/timers
    healSocket();
  }, 10_000);

  // 2) keep-alive del contenedor de Render
  setInterval(() => {
    if (document.hidden) return;
    wakeService();
  }, 4 * 60_000);

  // 3) resurrección al volver a la pestaña / recuperar red
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) healSocket();
  });
  window.addEventListener("online", () => healSocket());
}

// v21 PULIDO: lee el socket existente SIN crearlo (para inicializadores perezosos
// de useState; evita setState síncrono dentro de effects).
export function peekRealtime(): Socket | null {
  return typeof window === "undefined" ? null : _socket;
}
