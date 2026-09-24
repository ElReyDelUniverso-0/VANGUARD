"use client";

// v42 TU IDIOMA, TU GUERRA — PRESENCIA EN VIVO (HTTP puro, sin socket).
// El comandante quiere ver "personas activas ahora, no solo entraron y ya":
//  · PresencePing — componente invisible: latido cada 30s a /api/presence con
//    el UID del agente (mismo vanguard-mp-uid del contador de jugadores) y el
//    idioma activo. Solo late con la pestaña VISIBLE: al ocultar la pestaña
//    deja de latir y a los 90s el servidor deja de contarla. Corre en /,
//    /mision y /guerra-hoy.
//  · LiveCounter — badge visible "N EN LÍNEA" con punto verde pulsante.
//    Suscripción al bus local: los latidos de PresencePing actualizan el
//    número en todas las instancias sin polling extra.
//  · LiveTitle (v42.3) — prueba social en la PESTAÑA: con 2+ guerreros en
//    línea el título pasa a "(N EN LÍNEA) <página>" en el idioma del visitante;
//    se ve incluso en una captura de pantalla compartida. Respeta el título
//    SEO de cada página y lo restaura al desmontar.
// Al no depender del socket de Render, la presencia funciona incluso mientras
// el contenedor multijugador despierta (cold start 30-50s).

import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import { useLangStore, ensureLangDetected, useT, translate } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const BEAT_MS = 30_000; // latido cada 30s

// ---------- bus local del contador en vivo ----------
let _online = 0;
let _peak = 0; // v45.0 RÉCORD GLOBAL: pico histórico de guerreros en línea
const _subs = new Set<(n: number) => void>();
const _subsPeak = new Set<(peak: number) => void>();

function setOnline(n: number) {
  if (n === _online) return;
  _online = n;
  _subs.forEach((cb) => {
    try {
      cb(n);
    } catch {
      /* un suscriptor roto no tumba el bus */
    }
  });
}

function setPeak(p: number) {
  if (p <= _peak) return;
  _peak = p;
  _subsPeak.forEach((cb) => {
    try {
      cb(p);
    } catch {
      /* un suscriptor roto no tumba el bus */
    }
  });
}

/** Suscripción al número de guerreros en línea; entrega el valor actual al irse. */
export function subscribeOnline(cb: (n: number) => void): () => void {
  _subs.add(cb);
  cb(_online);
  return () => {
    _subs.delete(cb);
  };
}

/** v45.0 — suscripción al pico histórico en línea. */
export function subscribePeak(cb: (peak: number) => void): () => void {
  _subsPeak.add(cb);
  cb(_peak);
  return () => {
    _subsPeak.delete(cb);
  };
}

// ---------- latido ----------
function getUid(): string {
  try {
    let id = localStorage.getItem("vanguard-mp-uid");
    if (!id) {
      id = `mp-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
      localStorage.setItem("vanguard-mp-uid", id);
    }
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2)}`;
  }
}

async function beat() {
  if (typeof document === "undefined") return;
  if (document.visibilityState === "hidden") return; // pestaña oculta = no activa
  try {
    const lang = useLangStore.getState().lang;
    const r = await fetch("/api/presence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ uid: getUid(), lang }),
    });
    const j = (await r.json().catch(() => null)) as {
      online?: number;
      peak?: number;
      newRecord?: boolean;
    } | null;
    if (j && typeof j.online === "number") {
      const wasRecord = _online > 0 && j.online > _online;
      setOnline(j.online);
      if (typeof j.peak === "number") setPeak(j.peak);
      // v45.0: celebración cuando la subida real cruza el pico guardado
      if (j.newRecord === true && wasRecord) {
        try {
          toast.success(translate(useLangStore.getState().lang, "live.newrecord"), {
            description: `${j.online} ${translate(useLangStore.getState().lang, "live.online")}`,
          });
        } catch {
          /* la fiesta nunca tumba la guerra */
        }
      }
    }
  } catch {
    /* un latido perdido no tumba la guerra: el servidor tolera 3 */
  }
}

/** Consulta puntual del contador (para el primer render del badge). */
export async function refreshOnline() {
  try {
    const r = await fetch("/api/presence", { cache: "no-store" });
    const j = (await r.json().catch(() => null)) as {
      online?: number;
      peak?: number;
    } | null;
    if (j && typeof j.online === "number") setOnline(j.online);
    if (j && typeof j.peak === "number") setPeak(j.peak);
  } catch {
    /* sin señal: el badge conserva el último valor */
  }
}

let _started = false;

/** Arranca el latido global (idempotente — una sola vez por página). */
export function startPresenceHeartbeat() {
  if (typeof window === "undefined" || _started) return;
  _started = true;
  beat();
  setInterval(beat, BEAT_MS);
  // al volver a la pestaña, late de inmediato (no espera al siguiente tick)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") beat();
  });
}

// ---------- componentes ----------

/** Invisible: auto-idioma + latido de presencia. Montar en cada página pública. */
export function PresencePing() {
  useEffect(() => {
    // v42: el idioma del navegador se aplica al entrar (si el usuario nunca
    // eligió uno a mano) — mismo punto de montaje, cero coste extra.
    ensureLangDetected();
    startPresenceHeartbeat();
  }, []);
  return null;
}

/** v42.3 Título de pestaña EN VIVO: con 2+ en línea anteponer "(N EN LÍNEA)". */
export function LiveTitle() {
  useEffect(() => {
    const base = document.title;
    const apply = () => {
      try {
        const label = translate(useLangStore.getState().lang, "live.online");
        document.title = _online >= 2 ? `(${_online} ${label}) ${base}` : base;
      } catch {
        /* el título de la pestaña nunca tumba la guerra */
      }
    };
    const unsubOnline = subscribeOnline(apply);
    const unsubLang = useLangStore.subscribe(apply);
    return () => {
      unsubOnline();
      unsubLang();
      // restaurar solo si nuestro prefijo sigue puesto (no pisar a otra página)
      if (document.title.startsWith("(")) document.title = base;
    };
  }, []);
  return null;
}

/** Badge "N EN LÍNEA": punto verde pulsante + contador compartido por bus.
 *  v45.0 RÉCORD GLOBAL: chip dorado con el pico histórico; pulsa cuando el
 *  número actual iguala o supera el récord, y lo celebra con toast. */
export function LiveCounter({ showLabel = true }: { showLabel?: boolean }) {
  const [n, setN] = useState(0);
  const [peak, setPeakState] = useState(0);
  const firedRef = useRef(false);
  const { t } = useT();
  useEffect(() => subscribeOnline(setN), []);
  useEffect(
    () =>
      subscribePeak((p) => {
        setPeakState(p);
        // el primer pico que llega >1 tras montar implica récord reciente:
        // se celebra una sola vez por sesión para no cansar
        if (p > 1 && !firedRef.current && p >= _online) {
          firedRef.current = true;
          try {
            toast.success(translate(useLangStore.getState().lang, "live.newrecord"), {
              description: `${p} ${translate(useLangStore.getState().lang, "live.online")}`,
            });
          } catch {
            /* nada */
          }
        }
      }),
    []
  );
  useEffect(() => {
    refreshOnline();
  }, []);
  const atRecord = peak > 0 && n >= peak;
  return (
    <span
      className="inline-flex items-center gap-1 sm:gap-1.5 px-1 sm:px-1.5 py-0.5 rounded-sm border border-green-hud/60 bg-green-hud/10 text-green-hud font-mono font-bold text-[10px] sm:text-xs tabular-nums flex-shrink-0"
      title={`${n} ${t("live.online")}${peak > 0 ? ` · ${t("live.record")}: ${peak}` : ""}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-hud animate-pulse flex-shrink-0" />
      <span>{n}</span>
      {showLabel && (
        <span className="hidden md:inline text-[9px] tracking-widest uppercase">
          {t("live.online")}
        </span>
      )}
      {peak > 1 && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-sm border px-1 text-[9px] tracking-widest uppercase",
            atRecord
              ? "border-amber-hud bg-amber-hud/20 text-amber animate-pulse"
              : "border-amber-hud/50 bg-amber-hud/10 text-amber/80"
          )}
          title={`${t("live.record")}: ${peak}`}
        >
          <Trophy className="h-2.5 w-2.5" />
          {peak}
        </span>
      )}
    </span>
  );
}
