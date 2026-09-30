"use client";

// v72.0 INFINITA VERDADES — MI PAÍS · SIMULADOR DE NACIÓN.
// El comandante pidió: "crear simulador de país, mi país, cartel/unión, elegir
// su territorio, cada figura pública, y poder invitar jugadores aleatorios".
//  · CREACIÓN EN 4 PASOS: Identidad → Bandera (2 tintas + símbolo, SVG con brillo
//    real, nada plano) → Territorio (gobierno, región del mundo, capital) →
//    Figuras públicas (presidente + gabinete generado, todo editable).
//  · ESTADÍSTICAS DE NACIÓN: población/PIB/ejército derivados del nombre en el
//    servidor — mismas reglas para todos.
//  · UNIÓN / CARTEL: funda el tuyo o únete a los del mundo (miembros en vivo).
//  · RECLUTAR ALIADO ALEATORIO: invita a un guerrero EN LÍNEA al azar; si te
//    invitan, la invitación llega aquí y con ACEPTAR entras a su unión.
//  · REGLA DE ORO: título grande → ilustración → texto fácil.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Flag, Users, MapPin, Crown, UserPlus, Loader2, Swords, Landmark, Check, Inbox, LogOut } from "lucide-react";
import { toast } from "sonner";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { TituloEpico } from "@/components/vanguard/titulo-epico";
import { cn } from "@/lib/utils";

// ---------- tipos ----------
interface Ministro {
  rol: string;
  nombre: string;
}
interface Nacion {
  uid: string;
  nombre: string;
  gentilicio: string;
  lema: string;
  c1: string;
  c2: string;
  simbolo: string;
  gobierno: string;
  region: string;
  capital: string;
  presidente: string;
  ministros: Ministro[];
  union: string | null;
  pob: number;
  pib: number;
  ejercito: number;
}
interface UnionRow {
  nombre: string;
  tipo: string;
  lema: string;
  fundador: string;
  miembros: number;
}
interface Invitacion {
  id: number;
  de: string;
  nacion: string;
  union: string;
}

// ---------- datos ----------
const GOBIERNOS = ["REPÚBLICA", "DEMOCRACIA", "MONARQUÍA", "JUNTA MILITAR", "TECNOCRACIA", "CARTEL", "EMIRATO", "CONFEDERACIÓN"];
const REGIONES = ["América del Norte", "América del Sur", "Europa", "África", "Oriente Medio", "Asia", "Oceanía", "Ártico"];
const SIMBOLOS = ["★", "☭", "⚜", "☀", "⚔", "✠", "♛", "🦅", "🐉", "🔥", "🕊", "⚓"];
const TIPOS_UNION = ["ALIANZA", "CARTEL", "UNIÓN", "COALICIÓN"];
const NOMBRES = ["Valeria", "Adrián", "Kofi", "Mei", "Sasha", "Ingrid", "Rashid", "Camila", "Nikolái", "Fátima", "Diego", "Yuki", "Amara", "Leonel", "Priya", "Elena", "Óscar", "Zara"];
const APELLIDOS = ["Vargas", "Okafor", "Tanaka", "Petrov", "Silva", "Herrera", "Kowalski", "Marchetti", "Dubois", "Nakamura", "Haddad", "Rojas", "Lindqvist", "Costa", "Ibrahim", "Moreau", "Castillo", "Volkov"];
const ROLES = ["Ministro de Defensa", "Ministra de Exterior", "Ministro de Economía", "Directora de Inteligencia"];

const compact = new Intl.NumberFormat("es", { notation: "compact", maximumFractionDigits: 1 });

function uidLocal(): string {
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

function generarGabinete(): Ministro[] {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  return ROLES.map((rol) => ({ rol, nombre: `${pick(NOMBRES)} ${pick(APELLIDOS)}` }));
}

// ---------- bandera SVG con brillo (nada plano) ----------
function Bandera({ c1, c2, simbolo, className }: { c1: string; c2: string; simbolo: string; className?: string }) {
  const id = useMemo(() => `fb${Math.random().toString(36).slice(2, 8)}`, []);
  return (
    <svg viewBox="0 0 60 40" className={className} role="img" aria-label="Bandera de mi país">
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="38%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="62%" stopColor="#000000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.30" />
        </linearGradient>
      </defs>
      <rect width="60" height="20" fill={c1} />
      <rect y="20" width="60" height="20" fill={c2} />
      <text x="30" y="21.5" textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="#ffffff" stroke="rgba(0,0,0,0.45)" strokeWidth="0.55" paintOrder="stroke" style={{ fontFamily: "sans-serif" }}>
        {simbolo}
      </text>
      <rect width="60" height="40" fill={`url(#${id}s)`} />
      <rect width="60" height="40" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="1" />
    </svg>
  );
}

// ---------- barra de estadística ----------
function StatBar({ label, valor, pct, color }: { label: string; valor: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="text-foreground tabular-nums">{valor}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-black/50 overflow-hidden border border-white/5">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(4, Math.min(100, pct))}%`, background: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
    </div>
  );
}

// ---------- panel ----------
export function MiPaisPanel() {
  const [uid, setUid] = useState("");
  const [mia, setMia] = useState<Nacion | null>(null);
  const [top, setTop] = useState<Nacion[]>([]);
  const [uniones, setUniones] = useState<UnionRow[]>([]);
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [cargando, setCargando] = useState(true);

  // wizard
  const [paso, setPaso] = useState(1);
  const [f, setF] = useState({
    nombre: "", gentilicio: "", lema: "",
    c1: "#c8102e", c2: "#ffd60a", simbolo: "★",
    gobierno: "REPÚBLICA", region: "América del Sur", capital: "",
    presidente: "", ministros: [] as Ministro[],
  });
  const [guardando, setGuardando] = useState(false);

  // unión
  const [uNombre, setUNombre] = useState("");
  const [uTipo, setUTipo] = useState("ALIANZA");
  const [uLema, setULema] = useState("");
  const [reclutando, setReclutando] = useState(false);
  const vivoRef = useRef(true);

  const refrescar = useCallback(async (u: string) => {
    try {
      const r = await fetch(`/api/naciones?uid=${encodeURIComponent(u)}`, { cache: "no-store" });
      const d = await r.json();
      if (!vivoRef.current) return;
      setMia(d?.mia ?? null);
      setTop(Array.isArray(d?.top) ? d.top : []);
      setUniones(Array.isArray(d?.uniones) ? d.uniones : []);
    } catch { /* aguanta */ }
  }, []);

  useEffect(() => {
    vivoRef.current = true;
    const u = uidLocal();
    setUid(u);
    refrescar(u);
    setCargando(false);
    return () => { vivoRef.current = false; };
  }, [refrescar]);

  // buzón de invitaciones (polling cada 12s)
  useEffect(() => {
    if (!uid) return;
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch(`/api/reclutar?uid=${encodeURIComponent(uid)}`, { cache: "no-store" });
        const d = await r.json();
        if (alive) setInvitaciones(Array.isArray(d?.items) ? d.items : []);
      } catch { /* silencio */ }
    };
    poll();
    const t = setInterval(poll, 12_000);
    return () => { alive = false; clearInterval(t); };
  }, [uid]);

  const proclamar = async () => {
    if (f.nombre.trim().length < 2) { toast.error("Tu país necesita un nombre"); setPaso(1); return; }
    setGuardando(true);
    try {
      const r = await fetch("/api/naciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "guardar", uid, nacion: f }),
      });
      const d = await r.json();
      if (d?.ok) {
        setMia(d.mia);
        toast.success(`¡${f.nombre} proclamado! Ya figura en el mapa de naciones.`);
        refrescar(uid);
      } else {
        toast.error(d?.error || "No se pudo proclamar la nación");
      }
    } catch {
      toast.error("Red intermitente — intenta de nuevo");
    } finally {
      setGuardando(false);
    }
  };

  const accionUnion = async (action: string, union?: string) => {
    try {
      const r = await fetch("/api/naciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, uid, union: union ?? { nombre: uNombre, tipo: uTipo, lema: uLema } }),
      });
      const d = await r.json();
      if (d?.ok) {
        toast.success(action === "crear_union" ? `¡${d.union} fundada!` : action === "salir" ? "Saliste de la unión" : `Te uniste a ${d.union}`);
        setUNombre(""); setULema("");
        refrescar(uid);
      } else {
        toast.error(d?.error || "No se pudo completar");
      }
    } catch {
      toast.error("Red intermitente — intenta de nuevo");
    }
  };

  const reclutar = async () => {
    setReclutando(true);
    try {
      const r = await fetch("/api/reclutar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invitar", uid }),
      });
      const d = await r.json();
      if (d?.ok) toast.success(`Invitación enviada a un guerrero en línea (${String(d.objetivo).slice(0, 10)}…). Si acepta, se une a tu causa.`);
      else toast.error(d?.error || "No se pudo enviar la invitación");
    } catch {
      toast.error("Red intermitente — intenta de nuevo");
    } finally {
      setReclutando(false);
    }
  };

  const aceptar = async (inv: Invitacion) => {
    try {
      const r = await fetch("/api/reclutar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "aceptar", uid, id: inv.id }),
      });
      const d = await r.json();
      setInvitaciones((prev) => prev.filter((i) => i.id !== inv.id));
      if (d?.ok) {
        toast.success(inv.union ? `¡Bienvenido a ${inv.union}!` : `Te aliaste con ${inv.nacion}`);
        refrescar(uid);
      }
    } catch { /* silencio */ }
  };

  // ---------- render ----------
  return (
    <div className="space-y-4">
      <PanelHeader title="MI PAÍS" subtitle="Simulador de nación" />

      <TituloEpico
        titulo="MI PAÍS"
        volanta="Simulador de nación — funda, une y conquista"
        imagen="/ilustraciones/mi-pais.jpg"
        texto="Proclama tu propia nación: ponle nombre y bandera, elige su gobierno y territorio, nombra a sus figuras públicas, fúndala en una unión o cartel… y recluta aliados al azar entre los guerreros que están en línea ahora mismo."
        altura={270}
      />

      {cargando ? (
        <div className="hud-panel p-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando tu expediente de fundador…
        </div>
      ) : !mia ? (
        /* ==================== WIZARD DE CREACIÓN ==================== */
        <section className="hud-panel p-4 md:p-5" aria-label="Crear mi país">
          {/* pasos */}
          <div className="flex items-center gap-1.5 mb-4" aria-hidden>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={cn("h-1 flex-1 rounded-full transition-all duration-500", paso >= n ? "bg-gradient-to-r from-[#ffc46b] to-[#ff8a2a] shadow-[0_0_8px_rgba(255,138,42,0.5)]" : "bg-white/10")} />
            ))}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber mb-3">PASO {paso} DE 4</p>

          {paso === 1 ? (
            <div className="space-y-3.5">
              <h3 className="font-display font-bold uppercase text-sm flex items-center gap-2"><Flag className="w-4 h-4 text-amber" /> Identidad de la nación</h3>
              <input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value.slice(0, 32) })} placeholder="Nombre del país (ej. NUEVA ESPERANZA)" aria-label="Nombre del país" className="w-full bg-black/40 border border-white/10 focus:border-amber-hud/60 rounded-sm px-3 py-2.5 text-sm outline-none transition-colors min-h-[44px]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={f.gentilicio} onChange={(e) => setF({ ...f, gentilicio: e.target.value.slice(0, 24) })} placeholder="Gentilicio (ej. esperanzano)" aria-label="Gentilicio" className="w-full bg-black/40 border border-white/10 focus:border-amber-hud/60 rounded-sm px-3 py-2.5 text-sm outline-none transition-colors min-h-[44px]" />
                <input value={f.capital} onChange={(e) => setF({ ...f, capital: e.target.value.slice(0, 28) })} placeholder="Capital (ej. Puerto Libre)" aria-label="Capital" className="w-full bg-black/40 border border-white/10 focus:border-amber-hud/60 rounded-sm px-3 py-2.5 text-sm outline-none transition-colors min-h-[44px]" />
              </div>
              <input value={f.lema} onChange={(e) => setF({ ...f, lema: e.target.value.slice(0, 80) })} placeholder="Lema nacional (ej. Ni un paso atrás)" aria-label="Lema nacional" className="w-full bg-black/40 border border-white/10 focus:border-amber-hud/60 rounded-sm px-3 py-2.5 text-sm outline-none transition-colors min-h-[44px]" />
            </div>
          ) : null}

          {paso === 2 ? (
            <div className="space-y-3.5">
              <h3 className="font-display font-bold uppercase text-sm flex items-center gap-2"><Flag className="w-4 h-4 text-amber" /> Bandera nacional</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <Bandera c1={f.c1} c2={f.c2} simbolo={f.simbolo} className="w-40 h-auto rounded-sm shadow-[0_10px_28px_rgba(0,0,0,0.6)]" />
                <div className="flex items-center gap-3">
                  <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Tinta 1
                    <input type="color" value={f.c1} onChange={(e) => setF({ ...f, c1: e.target.value })} aria-label="Color 1 de la bandera" className="w-12 h-10 bg-transparent cursor-pointer" />
                  </label>
                  <label className="flex flex-col gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Tinta 2
                    <input type="color" value={f.c2} onChange={(e) => setF({ ...f, c2: e.target.value })} aria-label="Color 2 de la bandera" className="w-12 h-10 bg-transparent cursor-pointer" />
                  </label>
                </div>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Símbolo en el centro</p>
              <div className="flex flex-wrap gap-1.5">
                {SIMBOLOS.map((s) => (
                  <button key={s} onClick={() => setF({ ...f, simbolo: s })} aria-pressed={f.simbolo === s}
                    className={cn("w-10 h-10 text-lg rounded-sm border transition-all active:scale-90 min-h-[40px]",
                      f.simbolo === s ? "border-amber-hud bg-amber-hud/20 shadow-[0_0_12px_rgba(255,138,42,0.3)]" : "border-white/10 bg-black/30 hover:border-amber-hud/50")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {paso === 3 ? (
            <div className="space-y-3.5">
              <h3 className="font-display font-bold uppercase text-sm flex items-center gap-2"><Landmark className="w-4 h-4 text-amber" /> Gobierno y territorio</h3>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Forma de gobierno</p>
              <div className="flex flex-wrap gap-1.5">
                {GOBIERNOS.map((g) => (
                  <button key={g} onClick={() => setF({ ...f, gobierno: g })} aria-pressed={f.gobierno === g}
                    className={cn("px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-widest border rounded-sm transition-all active:scale-95 min-h-[32px]",
                      f.gobierno === g ? "text-amber border-amber-hud bg-amber-hud/20 shadow-[0_0_14px_rgba(255,138,42,0.25)]" : "text-muted-foreground border-white/10 hover:border-amber-hud/40")}>
                    {g}
                  </button>
                ))}
              </div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Región del mundo</p>
              <div className="flex flex-wrap gap-1.5">
                {REGIONES.map((r) => (
                  <button key={r} onClick={() => setF({ ...f, region: r })} aria-pressed={f.region === r}
                    className={cn("px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-widest border rounded-sm transition-all active:scale-95 min-h-[32px]",
                      f.region === r ? "text-cyan-hud border-cyan-hud bg-cyan-hud/20 shadow-[0_0_14px_rgba(30,144,255,0.25)]" : "text-muted-foreground border-white/10 hover:border-cyan-hud/40")}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {paso === 4 ? (
            <div className="space-y-3.5">
              <h3 className="font-display font-bold uppercase text-sm flex items-center gap-2"><Crown className="w-4 h-4 text-amber" /> Figuras públicas</h3>
              <input value={f.presidente} onChange={(e) => setF({ ...f, presidente: e.target.value.slice(0, 32) })} placeholder={f.gobierno === "MONARQUÍA" ? "Nombre del Rey / la Reina" : f.gobierno === "CARTEL" ? "Nombre del Jefe" : "Nombre del Presidente"} aria-label="Nombre del líder" className="w-full bg-black/40 border border-white/10 focus:border-amber-hud/60 rounded-sm px-3 py-2.5 text-sm outline-none transition-colors min-h-[44px]" />
              {f.ministros.length === 0 ? (
                <button onClick={() => setF({ ...f, ministros: generarGabinete() })}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-sm border border-amber-hud/50 bg-amber-hud/10 hover:bg-amber-hud/20 transition-all active:scale-[0.98] text-sm font-semibold text-amber">
                  <UserPlus className="w-4 h-4" /> Generar gabinete automáticamente
                </button>
              ) : (
                <div className="space-y-2">
                  {f.ministros.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-44 shrink-0 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{m.rol}</span>
                      <input value={m.nombre} onChange={(e) => setF({ ...f, ministros: f.ministros.map((mm, j) => (j === i ? { ...mm, nombre: e.target.value.slice(0, 28) } : mm)) })}
                        aria-label={`Nombre de ${m.rol}`}
                        className="flex-1 bg-black/40 border border-white/10 focus:border-amber-hud/60 rounded-sm px-2.5 py-2 text-[13px] outline-none transition-colors min-h-[40px]" />
                    </div>
                  ))}
                  <button onClick={() => setF({ ...f, ministros: generarGabinete() })} className="font-mono text-[10px] uppercase tracking-widest text-cyan-hud hover:text-foreground transition-colors">
                    ⟳ regenerar gabinete
                  </button>
                </div>
              )}
              {/* vista previa final */}
              <div className="rounded-sm border border-amber-hud/30 bg-black/40 p-4 mt-2">
                <Bandera c1={f.c1} c2={f.c2} simbolo={f.simbolo} className="w-full h-24 object-cover rounded-sm" />
                <p className="font-display font-black uppercase text-lg mt-3 text-foreground">{f.nombre || "SIN NOMBRE"}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{f.gobierno} · {f.region} {f.capital ? `· Capital: ${f.capital}` : ""}</p>
              </div>
            </div>
          ) : null}

          {/* navegación del wizard */}
          <div className="flex items-center justify-between gap-2 mt-5">
            <button onClick={() => setPaso((p) => Math.max(1, p - 1))} disabled={paso === 1}
              className="px-4 py-2.5 min-h-[44px] text-xs font-mono uppercase tracking-widest border border-white/10 rounded-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all">
              ← atrás
            </button>
            {paso < 4 ? (
              <button onClick={() => setPaso((p) => Math.min(4, p + 1))}
                className="px-5 py-2.5 min-h-[44px] text-xs font-mono uppercase tracking-widest rounded-sm text-black bg-gradient-to-b from-[#ffc46b] to-[#ff8a2a] border border-[#ffd9a0]/60 shadow-[0_4px_18px_rgba(255,138,42,0.3)] hover:brightness-110 active:scale-95 transition-all font-bold">
                siguiente →
              </button>
            ) : (
              <button onClick={proclamar} disabled={guardando}
                className="px-5 py-2.5 min-h-[44px] text-xs font-mono uppercase tracking-widest rounded-sm text-black bg-gradient-to-b from-[#7dff9b] to-[#00c853] border border-[#b9ffd0]/60 shadow-[0_4px_18px_rgba(0,200,83,0.3)] hover:brightness-110 active:scale-95 transition-all font-bold disabled:opacity-60 inline-flex items-center gap-2">
                {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                ¡Proclamar nación!
              </button>
            )}
          </div>
        </section>
      ) : (
        /* ==================== MI PAÍS PROCLAMADO ==================== */
        <>
          {/* tarjeta de la nación — imagen primero */}
          <section className="hud-panel overflow-hidden" aria-label={`Mi país ${mia.nombre}`}>
            <div className="relative h-28" style={{ background: `linear-gradient(120deg, ${mia.c1}, ${mia.c2})` }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.25),transparent_55%)]" aria-hidden />
              <Bandera c1={mia.c1} c2={mia.c2} simbolo={mia.simbolo} className="absolute left-4 bottom-[-18px] w-28 rounded-sm shadow-[0_12px_30px_rgba(0,0,0,0.7)] border border-black/40" />
              <span className="absolute right-3 top-3 font-mono text-[9px] uppercase tracking-widest bg-black/50 text-amber px-2 py-1 border border-amber-hud/40">{mia.gobierno}</span>
            </div>
            <div className="p-4 pt-8">
              <h3 className="font-display font-black uppercase text-xl text-foreground">{mia.nombre}</h3>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
                {mia.gentilicio || "—" } {mia.region ? `· ${mia.region}` : ""} {mia.capital ? `· Capital: ${mia.capital}` : ""}
              </p>
              {mia.lema ? <p className="text-[13px] italic text-foreground/80 mt-2">“{mia.lema}”</p> : null}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <StatBar label="Población" valor={compact.format(mia.pob)} pct={(mia.pob / 142_000_000) * 100} color="#ffc46b" />
                <StatBar label="PIB (M USD)" valor={compact.format(mia.pib)} pct={(mia.pib / 2_400_000) * 100} color="#7dff9b" />
                <StatBar label="Ejército" valor={compact.format(mia.ejercito)} pct={(mia.ejercito / 910_000) * 100} color="#ff7a5c" />
              </div>

              <div className="mt-4 rounded-sm border border-white/5 bg-black/30 p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber" /> Figuras públicas
                </p>
                <p className="text-[13px] text-foreground">{mia.presidente || "Líder sin nombre"} <span className="text-muted-foreground">— {mia.gobierno === "MONARQUÍA" ? "Sobrano" : mia.gobierno === "CARTEL" ? "Jefe máximo" : "Presidente"}</span></p>
                {mia.ministros.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {mia.ministros.map((m, i) => (
                      <li key={i} className="text-[12px] text-foreground/80 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber shadow-[0_0_6px_rgba(255,138,42,0.8)]" aria-hidden />
                        {m.nombre} <span className="text-muted-foreground">— {m.rol}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </section>

          {/* UNIÓN / CARTEL */}
          <section className="hud-panel p-4" aria-label="Unión o cartel">
            <h3 className="font-display font-bold uppercase text-sm flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-violet-hud" /> Unión / Cartel
            </h3>
            {mia.union ? (
              <div className="flex items-center justify-between gap-2 rounded-sm border border-violet-hud/40 bg-violet-hud/10 px-3.5 py-3">
                <div>
                  <p className="font-display font-bold text-sm text-foreground">{mia.union}</p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">tu nación pertenece a esta unión</p>
                </div>
                <button onClick={() => accionUnion("salir")} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-[10px] font-mono uppercase tracking-widest border border-red-hud/50 text-red-hud hover:bg-red-hud/10 rounded-sm transition-all active:scale-95">
                  <LogOut className="w-3.5 h-3.5" /> salir
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input value={uNombre} onChange={(e) => setUNombre(e.target.value.slice(0, 32))} placeholder="Nombre de la unión" aria-label="Nombre de la unión" className="bg-black/40 border border-white/10 focus:border-violet-hud/60 rounded-sm px-3 py-2.5 text-sm outline-none min-h-[44px]" />
                  <input value={uLema} onChange={(e) => setULema(e.target.value.slice(0, 80))} placeholder="Lema de la unión" aria-label="Lema de la unión" className="bg-black/40 border border-white/10 focus:border-violet-hud/60 rounded-sm px-3 py-2.5 text-sm outline-none min-h-[44px]" />
                  <div className="flex flex-wrap gap-1 items-center">
                    {TIPOS_UNION.map((t) => (
                      <button key={t} onClick={() => setUTipo(t)} aria-pressed={uTipo === t}
                        className={cn("px-2 py-1.5 text-[9px] font-mono uppercase tracking-widest border rounded-sm transition-all active:scale-95",
                          uTipo === t ? "text-violet-hud border-violet-hud bg-violet-hud/20" : "text-muted-foreground border-white/10 hover:border-violet-hud/40")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => accionUnion("crear_union")} disabled={uNombre.trim().length < 2}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[46px] rounded-sm border border-violet-hud/50 bg-violet-hud/10 hover:bg-violet-hud/20 text-sm font-semibold text-violet-hud transition-all active:scale-[0.98] disabled:opacity-40">
                  <Users className="w-4 h-4" /> Fundar {uTipo.toLowerCase()} {uNombre ? `“${uNombre}”` : ""}
                </button>
              </div>
            )}

            {/* uniones del mundo */}
            {uniones.length > 0 ? (
              <div className="mt-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Uniones y carteles del mundo — únete con un toque</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {uniones.map((u) => (
                    <div key={u.nombre} className="flex items-center justify-between gap-2 rounded-sm border border-white/10 bg-black/30 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate">{u.nombre} <span className="font-mono text-[8px] uppercase text-violet-hud">[{u.tipo}]</span></p>
                        <p className="font-mono text-[9px] text-muted-foreground truncate">{u.miembros} miembro(s) · funda: {u.fundador}</p>
                      </div>
                      {mia.union !== u.nombre ? (
                        <button onClick={() => accionUnion("unirse", u.nombre)} className="shrink-0 px-2.5 py-1.5 min-h-[32px] text-[9px] font-mono uppercase tracking-widest border border-green-hud/50 text-green-hud hover:bg-green-hud/10 rounded-sm transition-all active:scale-95">
                          unir
                        </button>
                      ) : (
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-green-hud">✓ dentro</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          {/* RECLUTAR ALIADO ALEATORIO + buzón */}
          <section className="hud-panel p-4" aria-label="Reclutamiento aleatorio">
            <h3 className="font-display font-bold uppercase text-sm flex items-center gap-2 mb-3">
              <Swords className="w-4 h-4 text-red-hud" /> Reclutamiento relámpago
            </h3>
            <button onClick={reclutar} disabled={reclutando}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 min-h-[52px] rounded-sm text-black font-bold text-sm uppercase tracking-widest bg-gradient-to-b from-[#ffc46b] to-[#ff8a2a] border border-[#ffd9a0]/60 shadow-[0_6px_24px_rgba(255,138,42,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60">
              {reclutando ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Invitar a un guerrero aleatorio en línea
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">Se elige al azar entre los guerreros conectados ahora mismo. Si acepta, entrará a tu unión.</p>

            {invitaciones.length > 0 ? (
              <div className="mt-3 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber flex items-center gap-1.5">
                  <Inbox className="w-3.5 h-3.5" /> Te invitan ({invitaciones.length})
                </p>
                {invitaciones.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-2 rounded-sm border border-amber-hud/40 bg-amber-hud/10 px-3.5 py-3 animate-in fade-in duration-300">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{inv.nacion || "Una nación misteriosa"} te quiere en su bando</p>
                      {inv.union ? <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">unión: {inv.union}</p> : null}
                    </div>
                    <button onClick={() => aceptar(inv)} className="shrink-0 px-3 py-2 min-h-[40px] text-[10px] font-mono uppercase tracking-widest rounded-sm text-black bg-gradient-to-b from-[#7dff9b] to-[#00c853] font-bold hover:brightness-110 active:scale-95 transition-all">
                      aceptar
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </>
      )}

      {/* NACIONES DEL MUNDO */}
      {top.length > 0 ? (
        <section className="hud-panel p-4" aria-label="Naciones del mundo">
          <h3 className="font-display font-bold uppercase text-sm flex items-center gap-2 mb-3">
            <Flag className="w-4 h-4 text-amber" /> Naciones del mundo <span className="font-mono text-[9px] text-muted-foreground">({top.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {top.map((n) => (
              <div key={n.uid} className={cn("rounded-sm border p-3 transition-all hover:-translate-y-0.5",
                mia && n.uid === uid ? "border-amber-hud/60 bg-amber-hud/5 shadow-[0_0_18px_rgba(255,138,42,0.15)]" : "border-white/10 bg-black/30 hover:border-amber-hud/40")}>
                <div className="flex items-center gap-2.5">
                  <Bandera c1={n.c1} c2={n.c2} simbolo={n.simbolo} className="w-12 h-auto rounded-[2px] shadow-[0_4px_10px_rgba(0,0,0,0.6)]" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-foreground truncate">{n.nombre}{mia && n.uid === uid ? <span className="ml-1.5 font-mono text-[8px] uppercase text-amber">· tuya</span> : null}</p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground truncate">{n.gobierno} · {n.region || "—"}</p>
                  </div>
                </div>
                {n.union ? <p className="font-mono text-[9px] uppercase tracking-widest text-violet-hud mt-2 truncate">⚑ {n.union}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
