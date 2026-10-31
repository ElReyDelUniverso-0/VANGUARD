"use client";

// ============================================================
// v214.0 LA PUERTA — SELECTOR DE MODO + MINI PANEL DE CUENTA (/modo)
// La versión permanente del paso 3 del ritual: aquí la gente vuelve
// a cambiar de modo cuando quiera, y puede aliarse (crear cuenta o
// entrar) SIN salir de esta página. Mismas APIs que la casa entera:
//   · GET  /api/auth/me       — ¿hay sesión? ¿modo guardado en nube?
//   · POST /api/auth/register — crear cuenta (acepta modo inicial)
//   · POST /api/auth/login    — entrar (devuelve el modo de la nube)
//   · POST /api/auth/logout   — salir
//   · POST /api/auth/modo     — fijar el modo en la cuenta (401 = invitado)
// El modo SIEMPRE queda en el aparato (vg-modo) — invitado incluido.
// Ley v190: la navegación al modo es un TOQUE del usuario, jamás automática.
// Español fijo (patrón Navegador v105): cero riesgo i18n.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, UserPlus, LogIn, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { MODOS, modoDe } from "@/lib/modos";

const LS_MODO = "vg-modo";

interface CuentaPublica {
  username: string;
  isOwner: boolean;
  modo: string;
}

export function SelectorModo() {
  const router = useRouter();
  const [cuenta, setCuenta] = useState<CuentaPublica | null>(null);
  const [cuentaLista, setCuentaLista] = useState(false);
  const [modoElegido, setModoElegido] = useState<string>("");
  const [dondeGuardado, setDondeGuardado] = useState<"nube" | "aparato" | null>(null);
  // panel de cuenta
  const [tab, setTab] = useState<"crear" | "entrar">("crear");
  const [alias, setAlias] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  // estado inicial: nube si hay sesión, aparato si no
  useEffect(() => {
    let vivo = true;
    (async () => {
      let local = "";
      try { local = localStorage.getItem(LS_MODO) || ""; } catch { /* aparato mudo */ }
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        const j = (await r.json()) as { account?: CuentaPublica | null };
        if (!vivo) return;
        if (j.account) {
          setCuenta(j.account);
          const id = j.account.modo || local;
          if (id) {
            setModoElegido(id);
            setDondeGuardado(j.account.modo ? "nube" : "aparato");
          }
        } else if (local) {
          setModoElegido(local);
          setDondeGuardado("aparato");
        }
      } catch {
        if (vivo && local) { setModoElegido(local); setDondeGuardado("aparato"); }
      } finally {
        if (vivo) setCuentaLista(true);
      }
    })();
    return () => { vivo = false; };
  }, []);

  const elegirModo = useCallback((id: string) => {
    setModoElegido(id);
    try { localStorage.setItem(LS_MODO, id); } catch { /* aparato mudo */ }
    fetch("/api/auth/modo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modo: id }),
    })
      .then(async (r) => setDondeGuardado(r.ok ? "nube" : "aparato"))
      .catch(() => setDondeGuardado("aparato"));
  }, []);

  const enviarCuenta = useCallback(async () => {
    if (ocupado) return;
    setError("");
    setOcupado(true);
    try {
      const ruta = tab === "crear" ? "/api/auth/register" : "/api/auth/login";
      const r = await fetch(ruta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: alias.trim(),
          password: clave,
          ...(tab === "crear" && modoElegido ? { modo: modoElegido } : {}),
        }),
      });
      const j = (await r.json()) as { ok?: boolean; account?: CuentaPublica; error?: string };
      if (!r.ok || !j.ok || !j.account) {
        setError(j.error || "La Ciudadela no pudo completar la operación.");
        return;
      }
      setCuenta(j.account);
      setAlias("");
      setClave("");
      if (j.account.modo && j.account.modo !== modoElegido) {
        setModoElegido(j.account.modo);
        try { localStorage.setItem(LS_MODO, j.account.modo); } catch {}
        setDondeGuardado("nube");
      } else if (modoElegido) {
        // la cuenta nueva nace con el modo ya elegido en esta sesión
        setDondeGuardado("nube");
      }
    } catch {
      setError("Sin conexión con la Ciudadela — inténtalo de nuevo.");
    } finally {
      setOcupado(false);
    }
  }, [alias, clave, modoElegido, ocupado, tab]);

  const salir = useCallback(async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* igual de honesto */ }
    setCuenta(null);
  }, []);

  const modo = modoDe(modoElegido);

  return (
    <div className="mt-8">
      {/* ════ LOS SEIS MODOS ════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODOS.map((m) => {
          const activo = modoElegido === m.id;
          return (
            <button
              key={m.id}
              onClick={() => elegirModo(m.id)}
              aria-pressed={activo}
              className={cn(
                "relative text-left rounded-2xl border p-4 transition active:scale-[0.99]",
                activo
                  ? "border-amber-hud/70 bg-amber-hud/10 shadow-[0_0_24px_rgba(232,197,106,0.12)]"
                  : "border-white/12 bg-black/40 hover:bg-black/60 hover:border-white/25"
              )}
              data-vg-modo-card={m.id}
            >
              {activo && (
                <span className="absolute top-3 right-3 grid place-items-center w-5 h-5 rounded-full bg-green-hud/20 border border-green-hud/50">
                  <Check className="w-3 h-3 text-green-hud" aria-hidden />
                </span>
              )}
              <p className="text-2xl leading-none">{m.emoji}</p>
              <p className="mt-2 font-mono text-[12px] font-bold tracking-[0.1em]" style={{ color: m.hex }}>
                {m.nombre}
              </p>
              <p className="mt-0.5 text-[12px] font-medium text-foreground/90">{m.lema}</p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">{m.detalle}</p>
            </button>
          );
        })}
      </div>

      {/* ════ ESTADO DEL MODO + SALTO ════ */}
      <div
        className="mt-4 rounded-2xl border border-white/12 bg-black/40 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
        data-vg-modo-estado
      >
        <div className="min-w-0 flex-1">
          {cuentaLista && modo ? (
            <>
              <p className="font-mono text-[11px] tracking-[0.18em] text-amber">
                MODO FIJADO: {modo.nombre}
              </p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                {dondeGuardado === "nube"
                  ? `Guardado en tu cuenta (${cuenta?.username ?? "nube"}). Te espera en cada aparato.`
                  : cuenta
                    ? "Guardado en este aparato — un momento para sincronizarlo con tu cuenta."
                    : "Guardado en este aparato. Hazte tu cuenta abajo para llevarlo a la nube."}
              </p>
            </>
          ) : (
            <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
              {cuentaLista ? "TOCA UN MODO PARA FIJARLO" : "CONSULTANDO LA CIUDADELA…"}
            </p>
          )}
        </div>
        <button
          onClick={() => modo && router.push(modo.ruta)}
          disabled={!modo}
          className="shrink-0 px-4 py-2.5 rounded-xl border border-amber-hud/40 bg-amber-hud/10 font-mono text-[11.5px] tracking-[0.14em] text-amber hover:bg-amber-hud/20 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
          data-vg-modo-ir
        >
          {modo ? `IR A ${modo.nombre} ▸` : "ELIGE UN MODO"}
        </button>
      </div>

      {/* ════ MINI PANEL DE CUENTA ════ */}
      <div className="mt-8 rounded-2xl border border-white/12 bg-black/30 p-4" data-vg-cuenta-panel>
        {cuenta ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] tracking-[0.18em] text-green-hud">
                {cuenta.isOwner ? "👑 " : ""}COMANDANTE {cuenta.username}
              </p>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                Cuenta viva en la Ciudadela · tu modo viaja contigo en cada aparato.
              </p>
            </div>
            <button
              onClick={salir}
              className="shrink-0 px-4 py-2.5 rounded-xl border border-muted-foreground/30 font-mono text-[11px] tracking-wide text-muted-foreground hover:bg-white/5 active:scale-[0.98] transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              SALIR
            </button>
          </div>
        ) : (
          <>
            <p className="font-mono text-[11px] tracking-[0.18em] text-amber">ALIÁTEATE — TU CUENTA</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Solo alias y clave — sin correos, sin líos. Guarda tu modo y tu progreso en la nube.
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <button
                onClick={() => { setTab("crear"); setError(""); }}
                className={cn(
                  "flex-1 px-2.5 py-1.5 rounded-lg font-mono text-[10.5px] tracking-[0.12em] transition border",
                  tab === "crear"
                    ? "border-amber-hud/50 bg-amber-hud/15 text-amber"
                    : "border-muted-foreground/25 text-muted-foreground hover:bg-white/5"
                )}
              >
                <UserPlus className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                CREAR
              </button>
              <button
                onClick={() => { setTab("entrar"); setError(""); }}
                className={cn(
                  "flex-1 px-2.5 py-1.5 rounded-lg font-mono text-[10.5px] tracking-[0.12em] transition border",
                  tab === "entrar"
                    ? "border-amber-hud/50 bg-amber-hud/15 text-amber"
                    : "border-muted-foreground/25 text-muted-foreground hover:bg-white/5"
                )}
              >
                <LogIn className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                YA TENGO
              </button>
            </div>
            <div className="mt-2.5 grid sm:grid-cols-2 gap-2">
              <input
                value={alias}
                onChange={(e) => setAlias(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 16))}
                placeholder="ALIAS (3-16)"
                autoComplete="username"
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-[12.5px] font-mono placeholder:text-muted-foreground/60 focus:border-amber-hud/50 focus:outline-none"
                data-vg-cuenta-alias
              />
              <input
                value={clave}
                onChange={(e) => setClave(e.target.value.slice(0, 64))}
                onKeyDown={(e) => { if (e.key === "Enter") enviarCuenta(); }}
                type="password"
                placeholder={tab === "crear" ? "CLAVE (mínimo 6)" : "TU CLAVE"}
                autoComplete={tab === "crear" ? "new-password" : "current-password"}
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-[12.5px] font-mono placeholder:text-muted-foreground/60 focus:border-amber-hud/50 focus:outline-none"
                data-vg-cuenta-clave
              />
            </div>
            {error && <p className="mt-2 text-[11.5px] text-red-400 leading-snug" role="alert">{error}</p>}
            <button
              onClick={enviarCuenta}
              disabled={ocupado || alias.trim().length < 3 || clave.length < (tab === "crear" ? 6 : 1)}
              className="mt-2.5 w-full px-3 py-2.5 rounded-xl border border-green-hud/40 bg-green-hud/10 font-mono text-[11.5px] tracking-[0.14em] text-green-hud hover:bg-green-hud/20 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
              data-vg-cuenta-enviar
            >
              {ocupado ? "UN MOMENTO…" : tab === "crear" ? "CREAR MI CUENTA ▸" : "ENTRAR ▸"}
            </button>
          </>
        )}
      </div>

      <p className="mt-6 text-[10.5px] font-mono text-muted-foreground leading-relaxed">
        El ritual de entrada (permiso de voz → cuenta → modo) vive en la portada y solo pregunta una vez.
        Aquí puedes cambiar de modo las veces que quieras — la puerta nunca se cierra.
      </p>
    </div>
  );
}
