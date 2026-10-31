"use client";

// ============================================================
// v214.0 LA PUERTA — EL RITUAL DE ENTRADA EN 3 PASOS
// El mandato del Dueño: «agrega el permiso de hablar con la voz de
// Vanguard y hacer que las personas se registren en Vanguard (o sea
// hacer cuenta) y poner un modo de seleccionar dónde quiere ir o qué
// quieren hacer en Vanguard». Un solo ritual, tres preguntas:
//   PASO 1 · LA VOZ    — ¿das permiso a Vanguard para hablarte?
//     (usa el sistema v201 intacto: vg201-permiso-hablar + hablarAgente)
//   PASO 2 · TU CUENTA — crear cuenta o entrar (APIs v15/204 intactas:
//     /api/auth/register · /api/auth/login) o seguir como invitado.
//   PASO 3 · TU MODO   — «¿qué quieres hacer en Vanguard?»: 6 modos,
//     cada uno una puerta real (/vertigo, /en-vivo, /guerra-hoy…).
//     Queda en el aparato (vg-modo) y, si hay sesión, en la nube
//     (Account.modo vía /api/auth/modo).
// Leyes de la casa respetadas:
//   · v189/v201 — JAMÁS bloquea: tarjeta aparte, sin cortina, se cierra
//     con Esc/X y se despide sola; nada se recarga ni navega solo
//     (el salto al modo es SIEMPRE un toque del usuario, ley v190).
//   · Una sola voz: mientras el ritual está abierto despacha el evento
//     vg:ritual-abierto y la tarjeta del permiso v201 se aparta —
//     el permiso se pregunta AQUÍ, no en dos sitios a la vez.
//   · Español fijo (mismo patrón que el Navegador v105): cero riesgo i18n.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Volume2, VolumeX, X, UserPlus, LogIn, Compass, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  darPermisoHablar,
  hablarAgente,
  leerPermisoHablar,
  negarPermisoHablar,
  puedeHablarSolo,
  type PermisoHablar,
} from "@/lib/voces-agentes";
import { MODOS, modoDe } from "@/lib/modos";

const LS_RITUAL = "vg-ritual-estado";
const LS_MODO = "vg-modo";

type Paso = 0 | 1 | 2;
interface CuentaPublica {
  username: string;
  isOwner: boolean;
  modo: string;
}

function guardarModoLocal(id: string) {
  try { localStorage.setItem(LS_MODO, id); } catch { /* aparato sin memoria */ }
}
function marcarRitualHecho() {
  try { localStorage.setItem(LS_RITUAL, "hecho"); } catch { /* igual de honesto */ }
}

export function RitualEntrada() {
  const router = useRouter();
  const [portalReady, setPortalReady] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [paso, setPaso] = useState<Paso>(0);
  const [permiso, setPermiso] = useState<PermisoHablar>("sin-responder");
  const [cuenta, setCuenta] = useState<CuentaPublica | null>(null);
  const [modoElegido, setModoElegido] = useState<string>("");
  const [tabCuenta, setTabCuenta] = useState<"crear" | "entrar">("crear");
  const [alias, setAlias] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const abiertoRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setPortalReady(true), 0);
    return () => clearTimeout(t);
  }, []);

  const abrir = useCallback((primerPaso: Paso) => {
    setPaso(primerPaso);
    setAbierto(true);
    abiertoRef.current = true;
    try { window.dispatchEvent(new CustomEvent("vg:ritual-abierto", { detail: { abierto: true } })); } catch {}
  }, []);

  const cerrar = useCallback(() => {
    setAbierto(false);
    abiertoRef.current = false;
    marcarRitualHecho();
    try { window.dispatchEvent(new CustomEvent("vg:ritual-abierto", { detail: { abierto: false } })); } catch {}
  }, []);

  // LA PUERTA SE ABRE UNA VEZ: primera visita, con calma (7s, tras la
  // cortina), saltando lo que ya está respondido (permiso dado, sesión viva).
  useEffect(() => {
    let vivo = true;
    const t = setTimeout(async () => {
      try { if (localStorage.getItem(LS_RITUAL) === "hecho") return; } catch { return; }
      const p = leerPermisoHablar();
      setPermiso(p);
      let primer: Paso = p === "sin-responder" ? 0 : 1;
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        const j = (await r.json()) as { account?: CuentaPublica | null };
        if (!vivo) return;
        if (j.account) {
          setCuenta(j.account);
          primer = 2;
          if (j.account.modo) {
            setModoElegido(j.account.modo);
            guardarModoLocal(j.account.modo);
          }
        }
      } catch { /* sin red: el ritual no depende de la red */ }
      if (vivo) abrir(primer);
    }, 7000);
    return () => { vivo = false; clearTimeout(t); };
  }, [abrir]);

  // si la casa concedió el permiso por otro camino, el paso 1 ya está hecho
  useEffect(() => {
    const sync = () => {
      const p = leerPermisoHablar();
      setPermiso(p);
      if (p !== "sin-responder" && abiertoRef.current && paso === 0) setPaso(1);
    };
    window.addEventListener("vg:permiso-hablar", sync);
    return () => window.removeEventListener("vg:permiso-hablar", sync);
  }, [paso]);

  // Esc = despedida honesta (nunca bloquea)
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, cerrar]);

  // ── PASO 1 · LA VOZ ──
  const darVoz = useCallback(() => {
    darPermisoHablar();
    setPermiso("concedido");
    // el toque de DAR PERMISO es el gesto que abre la boca del aparato
    hablarAgente("assist", "Permiso concedido, comandante. Ya puedo hablarte: te narraré las alertas, las noticias y el mundo.");
    setPaso(1);
  }, []);

  const silencio = useCallback(() => {
    negarPermisoHablar();
    setPermiso("silencio");
    setPaso(1);
  }, []);

  // ── PASO 2 · TU CUENTA ──
  const enviarCuenta = useCallback(async () => {
    if (ocupado) return;
    setError("");
    setOcupado(true);
    try {
      const ruta = tabCuenta === "crear" ? "/api/auth/register" : "/api/auth/login";
      const r = await fetch(ruta, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: alias.trim(), password: clave }),
      });
      const j = (await r.json()) as { ok?: boolean; account?: CuentaPublica; error?: string };
      if (!r.ok || !j.ok || !j.account) {
        setError(j.error || "La Ciudadela no pudo completar la operación.");
        return;
      }
      setCuenta(j.account);
      if (j.account.modo) {
        setModoElegido(j.account.modo);
        guardarModoLocal(j.account.modo);
      }
      if (tabCuenta === "crear" && puedeHablarSolo()) {
        hablarAgente("assist", `Cuenta creada. Bienvenido a la casa, ${j.account.username}.`);
      }
      setPaso(2);
    } catch {
      setError("Sin conexión con la Ciudadela — inténtalo de nuevo.");
    } finally {
      setOcupado(false);
    }
  }, [alias, clave, ocupado, tabCuenta]);

  // ── PASO 3 · TU MODO ──
  const elegirModo = useCallback((id: string) => {
    setModoElegido(id);
    guardarModoLocal(id);
    // espejo en la nube si hay sesión (401 honesto = invitado, se queda local)
    fetch("/api/auth/modo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modo: id }),
    }).catch(() => { /* invitado o sin red: el modo vive en el aparato */ });
    const m = modoDe(id);
    if (m && puedeHablarSolo()) {
      hablarAgente("assist", `Modo fijado: ${m.nombre}. Buen viaje, comandante.`);
    }
  }, []);

  const irAlModo = useCallback(() => {
    const m = modoDe(modoElegido);
    marcarRitualHecho();
    setAbierto(false);
    abiertoRef.current = false;
    try { window.dispatchEvent(new CustomEvent("vg:ritual-abierto", { detail: { abierto: false } })); } catch {}
    // ley v190: el salto SIEMPRE lo decide el usuario — este es su toque
    if (m) router.push(m.ruta);
  }, [modoElegido, router]);

  if (!portalReady || !abierto) return null;

  const modo = modoDe(modoElegido);

  return createPortal(
    <div
      className="fixed left-1/2 -translate-x-1/2 bottom-[calc(96px+env(safe-area-inset-bottom,0px))] sm:bottom-8 z-[48] w-[min(94vw,470px)] vg214-ritual"
      data-vg-ritual
      role="dialog"
      aria-label="La puerta de Vanguard"
    >
      <div className="relative rounded-2xl border border-amber-hud/40 bg-[rgba(12,10,8,0.97)] backdrop-blur-md shadow-[0_14px_50px_rgba(0,0,0,0.7)] overflow-hidden max-h-[74vh] overflow-y-auto no-scrollbar">
        {/* franja viva de la casa */}
        <div className="h-[3px] w-full bg-gradient-to-r from-amber-hud/70 via-green-hud/60 to-amber-hud/70 vg201-franja" aria-hidden />
        <button
          onClick={cerrar}
          className="absolute top-2 right-2 p-1.5 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-white/5 z-10"
          aria-label="Cerrar el ritual"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="px-4 pt-3.5 pb-4">
          {/* cabecera + puntos de paso */}
          <div className="flex items-center gap-2.5 pr-7">
            <span className="grid place-items-center w-8 h-8 rounded-full border border-amber-hud/40 bg-amber-hud/10 shrink-0">
              <Compass className="w-4 h-4 text-amber" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[11px] tracking-[0.22em] text-amber leading-none">LA PUERTA DE VANGUARD</p>
              <p className="font-mono text-[9px] tracking-[0.18em] text-muted-foreground mt-1">
                PASO {paso + 1} DE 3 · {paso === 0 ? "LA VOZ" : paso === 1 ? "TU CUENTA" : "TU MODO"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 shrink-0" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i < paso ? "bg-green-hud" : i === paso ? "bg-amber" : "bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>

          {/* ════ PASO 1 · LA VOZ ════ */}
          {paso === 0 && (
            <div className="mt-3 vg214-paso">
              <p className="font-display text-[15px] font-bold text-foreground leading-snug">
                ¿DAS PERMISO PARA QUE VANGUARD TE HABLE?
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/85">
                Con tu permiso, la voz de Vanguard narrará el mundo: alertas urgentes del radar,
                las noticias del momento y tu agente VG-ASSIST respondiendo en voz alta.
              </p>
              <div className="mt-3.5 flex items-center gap-2">
                <button
                  onClick={darVoz}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-green-hud/40 bg-green-hud/10 text-[11.5px] font-mono tracking-[0.14em] text-green-hud hover:bg-green-hud/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
                  data-vg-ritual-voz-si
                >
                  <Volume2 className="w-4 h-4 shrink-0" />
                  DAR PERMISO
                </button>
                <button
                  onClick={silencio}
                  className="shrink-0 px-3 py-2.5 rounded-xl border border-muted-foreground/30 text-[11px] font-mono tracking-wide text-muted-foreground hover:bg-white/5 active:scale-[0.98] transition flex items-center gap-1.5"
                  data-vg-ritual-voz-no
                >
                  <VolumeX className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">EN SILENCIO</span>
                </button>
              </div>
            </div>
          )}

          {/* ════ PASO 2 · TU CUENTA ════ */}
          {paso === 1 && cuenta && (
            <div className="mt-3 vg214-paso">
              <p className="font-display text-[15px] font-bold text-foreground leading-snug">
                YA ERES DE LA CASA, {cuenta.username}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/85">
                Tu cuenta vive en la Ciudadela. Falta lo mejor: elegir tu modo.
              </p>
              <button
                onClick={() => setPaso(2)}
                className="mt-3 w-full px-3 py-2.5 rounded-xl border border-amber-hud/40 bg-amber-hud/10 text-[11.5px] font-mono tracking-[0.14em] text-amber hover:bg-amber-hud/20 active:scale-[0.98] transition"
                data-vg-ritual-ir-modo
              >
                ELEGIR MI MODO ▸
              </button>
            </div>
          )}
          {paso === 1 && !cuenta && (
            <div className="mt-3 vg214-paso">
              <p className="font-display text-[15px] font-bold text-foreground leading-snug">
                ALIÁTEATE — HAZTE TU CUENTA
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/85">
                Guarda tu progreso, tu modo y tu sitio en la casa. Solo alias y clave — sin correos.
              </p>
              <div className="mt-2.5 flex items-center gap-1.5">
                <button
                  onClick={() => { setTabCuenta("crear"); setError(""); }}
                  className={cn(
                    "flex-1 px-2.5 py-1.5 rounded-lg font-mono text-[10.5px] tracking-[0.12em] transition border",
                    tabCuenta === "crear"
                      ? "border-amber-hud/50 bg-amber-hud/15 text-amber"
                      : "border-muted-foreground/25 text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <UserPlus className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                  CREAR
                </button>
                <button
                  onClick={() => { setTabCuenta("entrar"); setError(""); }}
                  className={cn(
                    "flex-1 px-2.5 py-1.5 rounded-lg font-mono text-[10.5px] tracking-[0.12em] transition border",
                    tabCuenta === "entrar"
                      ? "border-amber-hud/50 bg-amber-hud/15 text-amber"
                      : "border-muted-foreground/25 text-muted-foreground hover:bg-white/5"
                  )}
                >
                  <LogIn className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                  YA TENGO
                </button>
              </div>
              <div className="mt-2.5 grid gap-2">
                <input
                  value={alias}
                  onChange={(e) => setAlias(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "").slice(0, 16))}
                  placeholder="ALIAS (3-16 letras, números o _)"
                  autoComplete="username"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-[12.5px] font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-amber-hud/50 focus:outline-none"
                  data-vg-ritual-alias
                />
                <input
                  value={clave}
                  onChange={(e) => setClave(e.target.value.slice(0, 64))}
                  onKeyDown={(e) => { if (e.key === "Enter") enviarCuenta(); }}
                  type="password"
                  placeholder={tabCuenta === "crear" ? "CLAVE (mínimo 6)" : "TU CLAVE"}
                  autoComplete={tabCuenta === "crear" ? "new-password" : "current-password"}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/15 text-[12.5px] font-mono text-foreground placeholder:text-muted-foreground/60 focus:border-amber-hud/50 focus:outline-none"
                  data-vg-ritual-clave
                />
              </div>
              {error && (
                <p className="mt-2 text-[11.5px] text-red-400 leading-snug" role="alert">{error}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={enviarCuenta}
                  disabled={ocupado || alias.trim().length < 3 || clave.length < (tabCuenta === "crear" ? 6 : 1)}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-green-hud/40 bg-green-hud/10 text-[11.5px] font-mono tracking-[0.14em] text-green-hud hover:bg-green-hud/20 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  data-vg-ritual-cuenta-enviar
                >
                  {ocupado ? "UN MOMENTO…" : tabCuenta === "crear" ? "CREAR MI CUENTA ▸" : "ENTRAR ▸"}
                </button>
                <button
                  onClick={() => setPaso(2)}
                  className="shrink-0 px-3 py-2.5 rounded-xl border border-muted-foreground/30 text-[11px] font-mono tracking-wide text-muted-foreground hover:bg-white/5 active:scale-[0.98] transition"
                >
                  AHORA NO
                </button>
              </div>
            </div>
          )}

          {/* ════ PASO 3 · TU MODO ════ */}
          {paso === 2 && (
            <div className="mt-3 vg214-paso">
              <p className="font-display text-[15px] font-bold text-foreground leading-snug">
                ¿QUÉ QUIERES HACER EN VANGUARD?
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground/85">
                Elige tu modo — tu puerta de entrada de cada día. Puedes cambiarlo cuando quieras en <span className="font-mono text-amber">/modo</span>.
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {MODOS.map((m) => {
                  const activo = modoElegido === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => elegirModo(m.id)}
                      className={cn(
                        "relative text-left rounded-xl border p-2.5 transition active:scale-[0.98]",
                        activo
                          ? "border-amber-hud/70 bg-amber-hud/10"
                          : "border-white/12 bg-black/40 hover:bg-black/60 hover:border-white/25"
                      )}
                      data-vg-ritual-modo={m.id}
                    >
                      {activo && (
                        <Check className="absolute top-2 right-2 w-3.5 h-3.5 text-green-hud" aria-hidden />
                      )}
                      <p className="text-[15px] leading-none">{m.emoji}</p>
                      <p className="mt-1 font-mono text-[10.5px] font-bold tracking-[0.08em]" style={{ color: m.hex }}>
                        {m.nombre}
                      </p>
                      <p className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground">{m.lema}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={irAlModo}
                  disabled={!modo}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-amber-hud/40 bg-amber-hud/10 text-[11.5px] font-mono tracking-[0.14em] text-amber hover:bg-amber-hud/20 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
                  data-vg-ritual-ir
                >
                  {modo ? `IR A ${modo.nombre} ▸` : "ELIGE UN MODO PARA ENTRAR"}
                </button>
                <button
                  onClick={cerrar}
                  className="shrink-0 px-3 py-2.5 rounded-xl border border-muted-foreground/30 text-[11px] font-mono tracking-wide text-muted-foreground hover:bg-white/5 active:scale-[0.98] transition"
                >
                  QUEDARME AQUÍ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
