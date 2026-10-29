"use client";

// v27 ESTABILIDAD — watchdog de conexión.
// Consulta /api/health cada 30s; si el server falla 3 veces seguidas muestra
// un overlay "RECONECTANDO" (en vez de quedarse muerto en silencio) y cuando
// vuelve, recarga automáticamente una sola vez. También reacciona al evento
// `online` del navegador. Intervalos se limpian al desmontar (sin fugas).
// v32 CIELO DE ACERO — anti-nervios: los cold starts de Vercel Hobby (~2-5s)
// hacían parpadear el overlay y recargar la página; ahora timeout 10s,
// 3 fallos seguidos, y las pestañas ocultas no cuentan como fallo.
// v33 ESCUELA DE GUERRA — anti-falsos-positivos: si el socket realtime está
// CONECTADO la experiencia es correcta aunque /api/health tarde: no overlay,
// no recarga (adiós a las recargas fantasma que "buggeaban" la app).
// v84.0 FORTUNA DE GUERRA — ANTI "SIEMPRE DICE QUE SE CAYÓ":
//   · el umbral necesita CONFIRMACIÓN: al llegar a 3 fallos se lanza un ping
//     extra de confirmación (2.5s) y solo entonces se tapa la pantalla. Un
//     microcorte ya nunca muestra el overlay.
//   · al volver a la pestaña (visibilitychange) el contador de fallos se
//     resetea: el navegador congeló los timers, no hubo caída real.
//   · /api/health ahora responde 200 mientras el proceso Next viva (la BD va
//     en el payload), así que el overlay solo aparece con el server MUERTO.
// v183.1 EL RELEVO — LA PESTAÑA VIEJA SE CURA SOLA: el Dueño volvió a ver
// «Desplegando el universo» horas en su móvil con el despliegue SANO (QA
// fresco en vivo: cortina disipada <6s, 0 errores, APIs 200) — la pestaña
// que su teléfono mantenía abierta era de una versión ANTERIOR y NADA en el
// código la avisaba de que detrás había una casa nueva: cada despliegue
// nuevo dejaba pestañas viejas mirando una cortina que ya nadie levantaba.
// Cura: la sonda ahora lee la versión del latido; la primera respuesta fija
// la versión con la que esta pestaña nació y CUALQUIER versión distinta
// posterior (despliegue nuevo mientras dormías) levanta una píldora honesta
// «VANGUARD SE ACTUALIZÓ» y recarga UNA vez con guardia anti-bucle de 90s
// (sessionStorage) — al volver a la pestaña (visibilitychange ya sondea) el
// relevo dispara solo: ninguna pestaña vuelve a quedarse en el pasado.
// v199.0 EL RELEVO HONESTO — EL DUEÑO LO SENTENCIÓ: «entro y carga normal
//   dura como 5 segundos y al rato vuelve a cargar de nuevo y ahí dura dos
//   minutos — la gente se aburrirá y cerrará Vanguard». Autopsia: el relevo
//   v183.1 recargaba SOLO al ver versión distinta — cada despliegue nuevo
//   pateaba con una recarga a todo el que estuviera dentro (a ~30s de
//   entrar), y quien entraba en pleno despliegue aterrizaba DOS veces (la
//   segunda contra un server propagándose: minutos). Cura sin borrar nada:
//   ① el relevo JAMÁS recarga solo — píldora no bloqueante con botón
//   ACTUALIZAR y el mando es del Dueño; ② ANTI-VAHO: se exigen 2 cruces de
//   versión SEGUIDOS (en pleno despliegue las instancias viejas/nuevas
//   conviven y la versión alterna — un cruce solo ya no molesta); ③ la
//   recarga manual conserva la guardia anti-bucle de 90s. El relevo de
//   caída real (down→up tras el overlay RECONECTANDO) se queda: solo dispara
//   cuando el server estuvo MUERTO de verdad y el piloto ya vio la cortina.

import { useEffect, useRef, useState } from "react";
import { peekRealtime } from "@/lib/realtime";

const K_RELEVO = "vg183-relevo"; // marca anti-bucle de la recarga por versión

export function ConnectionWatchdog() {
  const [down, setDown] = useState(false);
  const [relevo, setRelevo] = useState(false);
  const versionTab = useRef<string | null>(null); // versión con la que nació esta pestaña

  useEffect(() => {
    let alive = true;
    let fails = 0;
    let reloaded = false;
    let confirming = false;
    let cruces = 0; // v199.0 anti-vaho: versiones distintas SEGUIDAS vistas

    // sonda única: estado del server + versión del latido
    const probe = async (): Promise<{ ok: boolean; version?: string }> => {
      if (peekRealtime()?.connected) return { ok: true };
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 10000);
        const res = await fetch("/api/health", { cache: "no-store", signal: ctrl.signal });
        clearTimeout(t);
        if (!res.ok) return { ok: false };
        let version: string | undefined;
        try {
          version = (await res.json())?.version;
        } catch {
          // latido sin JSON: el proceso vive igual
        }
        return { ok: true, version };
      } catch {
        return { ok: false };
      }
    };

    // v199.0 EL RELEVO HONESTO: versión nueva desplegada mientras esta pestaña
    // dormía → SOLO se ofrece la píldora (botón ACTUALIZAR). JAMÁS recarga
    // sola: cada despliegue nuevo ya no patea a nadie de la casa.
    const quizaRelevo = () => {
      if (!alive) return;
      setRelevo(true);
    };

    const ping = async () => {
      // pestaña oculta: el navegador congela timers y las peticiones vuelven raras;
      // no pinguear ni contar fallo (evita falsos "caído" al volver a la pestaña)
      if (typeof document !== "undefined" && document.hidden) return;
      const r = await probe();
      if (!alive) return;
      if (r.ok) {
        fails = 0;
        // v199.0: primera respuesta fija el nacimiento de la pestaña; una
        // versión distinta después = despliegue nuevo → píldora honesta con
        // ACTUALIZAR (el Dueño manda). Anti-vaho: durante un despliegue las
        // instancias viejas/nuevas conviven y la versión puede alternar —
        // se exigen 2 cruces SEGUIDOS antes de ofrecer la píldora.
        if (typeof r.version === "string" && r.version) {
          if (versionTab.current === null) versionTab.current = r.version;
          else if (r.version !== versionTab.current) {
            cruces += 1;
            if (cruces >= 2) quizaRelevo();
          } else {
            cruces = 0;
          }
        }
        setDown((prev) => {
          // recarga solo cuando pasamos de caído → arriba y no acabamos de recargar
          if (prev && !reloaded) {
            reloaded = true;
            setTimeout(() => window.location.reload(), 1200);
          }
          return false;
        });
        return;
      }
      fails += 1;
      if (fails < 3) return;
      // v84: umbral alcanzado → ping de CONFIRMACIÓN antes de tapar la pantalla
      if (!confirming) {
        confirming = true;
        setTimeout(async () => {
          confirming = false;
          if (!alive) return;
          const ok2 = await probe();
          if (ok2.ok) {
            fails = 0;
            setDown(false);
            return;
          }
          if (alive && fails >= 3) setDown(true);
        }, 2500);
      }
    };

    const iv = setInterval(ping, 30_000);
    const onOnline = () => void ping();
    // v84: volver a la pestaña NO es una caída — resetea el contador y sondea
    // (v183.1: y si despertamos en un despliegue nuevo, el relevo dispara aquí)
    const onVisible = () => {
      if (document.hidden) return;
      fails = 0;
      setDown(false);
      void ping();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    void ping();

    return () => {
      alive = false;
      clearInterval(iv);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (relevo) {
    // v199.0: píldora honesta del relevo — NO bloquea, NO recarga sola:
    // anuncia la casa nueva y el ACTUALIZAR es del Dueño (una sola pulsación,
    // con guardia anti-bucle de 90s para nada raro del aparato)
    return (
      <div
        className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-widest font-bold bg-black/90 backdrop-blur-md"
        style={{ borderColor: "rgba(232,196,118,.5)", color: "#e8c476" }}
        role="status"
      >
        <span>Vanguard se actualizó</span>
        <button
          onClick={() => {
            try {
              const ult = Number(sessionStorage.getItem(K_RELEVO) || 0);
              if (ult && Date.now() - ult < 90000) return; // guardia anti-bucle
              sessionStorage.setItem(K_RELEVO, String(Date.now()));
            } catch {
              // sessionStorage ausente: recargar igual (el guard del meta v182 cubre)
            }
            try {
              window.location.reload();
            } catch {
              // noop
            }
          }}
          className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest font-bold transition-colors hover:bg-[rgba(232,196,118,.15)]"
          style={{ borderColor: "rgba(232,196,118,.7)", color: "#e8c476" }}
        >
          Actualizar
        </button>
      </div>
    );
  }

  if (!down) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-center px-6">
      <div className="w-10 h-10 border-2 border-amber-hud border-t-transparent rounded-full animate-spin" />
      <div className="text-amber-hud font-mono font-bold tracking-widest text-sm">RECONECTANDO CON VANGUARD…</div>
      <p className="text-[11px] text-muted-foreground max-w-xs">
        Se perdió la conexión con el servidor. No cerraste nada: en cuanto vuelva la señal la página se recarga sola con
        todo tu progreso.
      </p>
    </div>
  );
}
