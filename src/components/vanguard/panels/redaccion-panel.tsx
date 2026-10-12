"use client";

// v105.0 LA REDACCIÓN — el lugar para leer el mundo.
// El comandante pidió: "un lugar optimizado para leer mejor, saber qué está
// pasando en el mundo: actualidad, curiosidades, por qué y más información".
// Aquí manda la tipografía: serif de lectura, columna medida, tres tamaños de
// letra, tiempo de lectura, cero popups (MODO CALMA) y cero fotos IA — solo
// imágenes reales de los medios o portadas tipográficas.
// Tres capas: PORTADA (noticias reales con resumen), ¿POR QUÉ IMPORTA? (contexto
// escrito por la sala) e INVESTIGACIÓN EN VIVO (búsqueda web real + síntesis).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Newspaper, Clock, Bookmark, BookmarkCheck, Search, Loader2, ChevronLeft,
  Sparkles, Globe2, ArrowRight, Eye, BellOff, MessageSquareText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { useCalma, calmaActiva } from "@/lib/calma";

const ACC = "#FFC94D";
const LS_GUARDADOS = "vg-redaccion-guardados-v105";
const FUENTES_LINEA = "BBC Mundo · France 24 · DW · Al Jazeera · ONU · Euronews · The Guardian · El Mundo · ABC + GDELT";

type Pieza = {
  id: string;
  t: string;
  s: string;
  f: string;
  img: string;
  fecha: string;
  tag: string;
  conflicto: string;
  pais: string;
};

type PorqueRes = {
  ia: boolean;
  cache?: boolean;
  explica: string;
  contexto: string;
  claves: string[];
  sigue: string;
};

type InvRes = {
  ia: boolean;
  web: boolean;
  cache?: boolean;
  respuesta: string;
  hallazgos: { titulo: string; fuente: string; fecha: string }[];
  claves: string[];
  confianza: number;
};

const CATS = [
  { k: "portada", label: "PORTADA" },
  { k: "conflicto", label: "CONFLICTOS" },
  { k: "ALERTA", label: "ALERTAS" },
  { k: "DIPLOMACIA", label: "DIPLOMACIA" },
  { k: "ECONOMIA", label: "ECONOMÍA" },
  { k: "HUMANITARIO", label: "HUMANITARIO" },
  { k: "ANALISIS", label: "ANÁLISIS" },
  { k: "guardados", label: "GUARDADOS" },
] as const;

const TAG_COLOR: Record<string, string> = {
  ALERTA: "#FF3B30",
  DIPLOMACIA: "#4ADE80",
  ECONOMIA: "#FFC94D",
  HUMANITARIO: "#38BDF8",
  ANALISIS: "#A855F7",
  INFO: "#9CA3AF",
};

function rel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "";
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "ahora mismo";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

function tiempoLectura(p: Pieza): number {
  const palabras = `${p.t} ${p.s}`.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 160) + (p.s ? 1 : 0));
}

function iniciales(f: string): string {
  const limpio = (f || "VANGUARD").replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ ]/g, "").trim();
  const parts = limpio.split(/\s+/).slice(0, 2);
  return (parts.map((x) => x[0]).join("") || "VG").toUpperCase();
}

function PortadaTipografica({ p, alto }: { p: Pieza; alto: string }) {
  const c = TAG_COLOR[p.tag] || TAG_COLOR.INFO;
  return (
    <div
      className={cn("relative w-full flex items-center justify-center overflow-hidden shrink-0", alto)}
      style={{ background: `linear-gradient(135deg, #0d0b06 0%, #171204 55%, #050508 100%)` }}
    >
      <div className="absolute inset-0 opacity-[0.14]" style={{ background: `radial-gradient(circle at 30% 20%, ${c} 0%, transparent 55%)` }} />
      <div className="text-center px-3 select-none">
        <p className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground mb-1">VANGUARD · LA REDACCIÓN</p>
        <p className="font-serif text-3xl font-bold leading-none" style={{ color: c }}>{iniciales(p.f)}</p>
        <p className="font-mono text-[8.5px] tracking-widest text-muted-foreground mt-1.5 max-w-[180px] truncate">{p.f}</p>
      </div>
    </div>
  );
}

function FotoReal({ p, alto }: { p: Pieza; alto: string }) {
  const [rota, setRota] = useState(false);
  if (!p.img || rota) return <PortadaTipografica p={p} alto={alto} />;
  return (
    <div className={cn("relative w-full overflow-hidden shrink-0 bg-black/60", alto)}>
      { }
      <img
        src={p.img}
        alt={p.t.slice(0, 80)}
        loading="lazy"
        onError={() => setRota(true)}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
  );
}

function ChipTag({ tag }: { tag: string }) {
  const c = TAG_COLOR[tag] || TAG_COLOR.INFO;
  return (
    <span className="px-1.5 py-0.5 rounded font-mono text-[8.5px] font-bold tracking-wider shrink-0"
      style={{ color: c, background: `${c}1a`, border: `1px solid ${c}44` }}>
      {tag}
    </span>
  );
}

export function RedaccionPanel() {
  const activarLectura = useCalma((s) => s.activarLectura);
  const desactivarLectura = useCalma((s) => s.desactivarLectura);
  const pedirSilencio = useCalma((s) => s.pedirSilencio);

  const [items, setItems] = useState<Pieza[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cat, setCat] = useState<string>("portada");
  const [abierta, setAbierta] = useState<Pieza | null>(null);
  const [letra, setLetra] = useState<1 | 2 | 3>(2);
  const [guardados, setGuardados] = useState<Pieza[]>([]);
  const [porque, setPorque] = useState<Record<string, PorqueRes>>({});
  const [porqueLoading, setPorqueLoading] = useState(false);
  const [invQ, setInvQ] = useState("");
  const [inv, setInv] = useState<InvRes | null>(null);
  const [invLoading, setInvLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const progresoRef = useRef<HTMLDivElement | null>(null);

  // ---- MODO CALMA: mientras la redacción esté abierta, nada interrumpe ----
  useEffect(() => {
    activarLectura();
    return () => desactivarLectura();
  }, [activarLectura, desactivarLectura]);

  // ---- carga inicial: portada desde el archivo; si la BD está vacía, siembra con /api/news ----
  const cargar = useCallback(async () => {
    try {
      const res = await fetch("/api/noticias", { cache: "no-store" });
      const d = await res.json();
      if (Array.isArray(d.items) && d.items.length > 0) {
        setItems(d.items as Pieza[]);
        setCargando(false);
        return;
      }
    } catch { /* siembra */ }
    try {
      const res2 = await fetch("/api/news?limit=24", { cache: "no-store" });
      const d2 = await res2.json();
      const arr = Array.isArray(d2.items) ? d2.items : [];
      setItems(
        arr.map((r: Record<string, unknown>): Pieza => ({
          id: String(r.id ?? r.externalId ?? Math.random()),
          t: String(r.title ?? ""),
          s: String(r.summary ?? ""),
          f: String(r.source ?? ""),
          img: String(r.imageUrl ?? ""),
          fecha: new Date(String(r.publishedAt ?? Date.now())).toISOString(),
          tag: String(r.tacticalTag ?? "INFO"),
          conflicto: String(r.conflictTag ?? ""),
          pais: String(r.sourceCountry ?? ""),
        })).filter((x: Pieza) => x.t)
      );
    } catch { /* sala en silencio */ }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // guardados + reloj de tiempos relativos
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_GUARDADOS) || "[]") as Pieza[];
      if (Array.isArray(raw)) setGuardados(raw.slice(0, 40));
    } catch { /* sin guardados */ }
    const iv = setInterval(() => setTick((x) => x + 1), 30_000);
    return () => clearInterval(iv);
  }, []);

  // barra de progreso de lectura (transform puro, sin re-render)
  useEffect(() => {
    if (!abierta) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const doc = document.documentElement;
        const total = doc.scrollHeight - window.innerHeight;
        const p = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
        if (progresoRef.current) progresoRef.current.style.transform = `scaleX(${p})`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [abierta]);

  const filtradas = useMemo(() => {
    void tick;
    if (cat === "portada") return items;
    if (cat === "guardados") return guardados;
    if (cat === "conflicto") return items.filter((p) => p.conflicto);
    return items.filter((p) => (p.tag || "INFO") === cat);
  }, [items, cat, guardados, tick]);

  const hero = filtradas[0];
  const resto = filtradas.slice(1);

  const toggleGuardar = (p: Pieza) => {
    const ya = guardados.some((g) => g.id === p.id);
    const sig = ya ? guardados.filter((g) => g.id !== p.id) : [{ ...p }, ...guardados].slice(0, 40);
    setGuardados(sig);
    try { localStorage.setItem(LS_GUARDADOS, JSON.stringify(sig)); } catch { /* lleno */ }
  };

  const cargarPorque = async (p: Pieza) => {
    if (porque[p.id] || porqueLoading) return;
    setPorqueLoading(true);
    try {
      const u = `/api/noticias?porque=${encodeURIComponent(p.t)}&s=${encodeURIComponent(p.s.slice(0, 500))}&f=${encodeURIComponent(p.f)}`;
      const res = await fetch(u, { cache: "no-store" });
      const d = await res.json();
      setPorque((m) => ({ ...m, [p.id]: d as PorqueRes }));
    } catch {
      setPorque((m) => ({
        ...m,
        [p.id]: { ia: false, explica: "La sala no pudo redactar el contexto en este pulso — reintenta en unos segundos.", contexto: "", claves: [], sigue: "" },
      }));
    } finally {
      setPorqueLoading(false);
    }
  };

  const investigarDesde = (q: string) => {
    try { sessionStorage.setItem("vg-mente-investigar", JSON.stringify({ q })); } catch { /* ok */ }
    window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: "mente" }));
  };

  const investigar = async () => {
    const q = invQ.trim();
    if (q.length < 4 || invLoading) return;
    setInvLoading(true);
    setInv(null);
    try {
      const res = await fetch(`/api/noticias?investiga=${encodeURIComponent(q)}`, { cache: "no-store" });
      const d = await res.json();
      if (d.ok === false) throw new Error(d.error || "sin investigación");
      setInv(d as InvRes);
    } catch (e) {
      setInv({ ia: false, web: false, respuesta: e instanceof Error ? e.message : "La investigación no pudo completarse en este pulso.", hallazgos: [], claves: [], confianza: 0 });
    } finally {
      setInvLoading(false);
    }
  };

  const letraCls = letra === 1 ? "text-[14px] leading-[1.75]" : letra === 2 ? "text-[16px] leading-[1.8]" : "text-[18.5px] leading-[1.85]";

  return (
    <div className="space-y-3">
      <PanelHeader
        title="LA REDACCIÓN"
        subtitle="El lugar para leer el mundo · noticias reales, porqués e investigación en vivo"
        icon={<Newspaper className="w-4 h-4" />}
        color="amber"
        right={
          <div className="flex items-center gap-1.5 font-mono text-[9px] px-2 py-1 rounded-full border" style={{ color: ACC, borderColor: `${ACC}55` }}>
            <span className="w-1.5 h-1.5 rounded-full vg-acc-dot" style={{ background: ACC }} />
            {cargando ? "SINTONIZANDO" : `${items.length} PIEZAS`}
          </div>
        }
      />

      {/* MODO CALMA honesto: mientras lees, nada te interrumpe */}
      <div className="v105-entra rounded-xl border px-3 py-2.5 flex items-center gap-2.5 flex-wrap" style={{ borderColor: `${ACC}33`, background: `${ACC}0a` }}>
        <BellOff className="w-4 h-4 shrink-0" style={{ color: ACC }} />
        <p className="text-[11.5px] leading-snug flex-1 min-w-[180px] text-foreground/85">
          <span className="font-bold" style={{ color: ACC }}>MODO LECTURA activo:</span> ninguna notificación comercial interrumpe tu lectura ni tu escritura. Los avisos te esperan en Alertas.
        </p>
        <button
          onClick={() => { pedirSilencio(30); }}
          disabled={calmaActiva() && useCalma.getState().silencioHasta > Date.now()}
          className="px-2.5 py-1 rounded-lg border font-mono text-[9.5px] font-bold tracking-wider transition-transform active:scale-95 disabled:opacity-45"
          style={{ color: ACC, borderColor: `${ACC}55` }}
        >
          SILENCIO 30 MIN
        </button>
      </div>

      {/* ---------------- INVESTIGACIÓN EN VIVO ---------------- */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2">
        <p className="font-mono text-[9.5px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Search className="w-3 h-3" /> investigación en vivo · la red real, sin enlaces, con fuentes citadas
        </p>
        <div className="flex gap-2">
          <input
            value={invQ}
            onChange={(e) => setInvQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") investigar(); }}
            placeholder="¿Qué pasa realmente con…? Pregunta al mundo"
            className="flex-1 min-w-0 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-amber/50"
          />
          <button
            onClick={investigar}
            disabled={invLoading || invQ.trim().length < 4}
            className="rounded-lg px-3.5 font-bold text-black transition-transform active:scale-95 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
            style={{ background: ACC }}
          >
            {invLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="font-mono text-[10px] tracking-wider hidden sm:inline">INVESTIGAR</span>
          </button>
        </div>

        {inv && (
          <div className="v105-entra rounded-lg border p-3 space-y-2.5" style={{ borderColor: `${ACC}44`, background: `${ACC}08` }}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-[8.5px] px-2 py-0.5 rounded-full border font-bold" style={{ color: ACC, borderColor: `${ACC}55` }}>
                {inv.ia ? (inv.web ? "SÍNTESIS · RED REAL + IA" : "SÍNTESIS · NÚCLEO IA") : "SALA HONESTA"}
              </span>
              {inv.cache && <span className="font-mono text-[8.5px] px-2 py-0.5 rounded-full border border-white/20 text-muted-foreground">caché del planeta</span>}
              {inv.confianza > 0 && <span className="font-mono text-[8.5px] text-muted-foreground">confianza {inv.confianza}/100</span>}
            </div>
            <p className="text-[13px] leading-relaxed text-foreground/90 font-serif">{inv.respuesta}</p>
            {inv.claves.length > 0 && (
              <div className="flex flex-col gap-1">
                {inv.claves.map((c, i) => (
                  <p key={i} className="text-[11.5px] text-foreground/75 flex gap-1.5"><span style={{ color: ACC }}>▸</span>{c}</p>
                ))}
              </div>
            )}
            {inv.hallazgos.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-white/10">
                <p className="font-mono text-[8.5px] uppercase tracking-widest text-muted-foreground pt-1.5">hallazgos reales · medio y fecha, cero enlaces</p>
                {inv.hallazgos.map((h, i) => (
                  <div key={i} className="rounded-md bg-black/40 border border-white/10 px-2.5 py-1.5">
                    <p className="text-[11.5px] leading-snug text-foreground/85">{h.titulo}</p>
                    <p className="font-mono text-[8.5px] text-muted-foreground mt-0.5">{h.fuente}{h.fecha ? ` · ${h.fecha}` : ""}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------------- CATEGORÍAS ---------------- */}
      {!abierta && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 v105-scroll">
          {CATS.map((c) => {
            const activo = cat === c.k;
            const n = c.k === "portada" ? items.length : c.k === "guardados" ? guardados.length : c.k === "conflicto" ? items.filter((x) => x.conflicto).length : items.filter((x) => (x.tag || "INFO") === c.k).length;
            return (
              <button
                key={c.k}
                onClick={() => setCat(c.k)}
                className={cn(
                  "shrink-0 px-2.5 py-1.5 rounded-lg border font-mono text-[10px] font-bold tracking-wider transition-all",
                  activo ? "text-black" : "text-muted-foreground border-white/10 bg-black/30 hover:border-white/25"
                )}
                style={activo ? { background: ACC, borderColor: ACC } : undefined}
              >
                {c.label}{n > 0 && <span className={cn("ml-1", activo ? "text-black/60" : "text-muted-foreground")}>{n}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* ---------------- LECTOR ---------------- */}
      {abierta && (
        <div className="v105-entra space-y-4">
          <div className="sticky top-0 z-10 -mx-3 px-3 py-1.5 bg-background/90 backdrop-blur-sm flex items-center gap-2">
            <div className="h-0.5 flex-1 rounded-full bg-white/10 overflow-hidden">
              <div ref={progresoRef} className="h-full rounded-full origin-left" style={{ width: "100%", transform: "scaleX(0)", background: ACC }} />
            </div>
          </div>

          <button
            onClick={() => { setAbierta(null); window.scrollTo({ top: 0 }); }}
            className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> VOLVER A LA PORTADA
          </button>

          <article className="mx-auto max-w-[680px] space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <ChipTag tag={abierta.tag} />
              {abierta.pais && <FlagBadge code={abierta.pais.toUpperCase()} />}
              <span className="font-mono text-[9.5px] text-muted-foreground">{abierta.f}</span>
              <span className="font-mono text-[9.5px] text-muted-foreground">· {rel(abierta.fecha)}</span>
              <span className="font-mono text-[9.5px] text-muted-foreground ml-auto flex items-center gap-1"><Clock className="w-3 h-3" />{tiempoLectura(abierta)} min</span>
            </div>

            <h1 className="font-serif font-bold text-[24px] sm:text-[30px] leading-[1.2] text-foreground">{abierta.t}</h1>

            {abierta.s ? (
              <p className="font-serif italic text-[16px] sm:text-[18px] leading-[1.6] text-foreground/80 border-l-2 pl-3.5" style={{ borderColor: `${ACC}88` }}>
                {abierta.s}
              </p>
            ) : (
              <p className="text-[11.5px] text-muted-foreground font-mono">Este cable llegó solo con titular — el resumen del medio llegará en el próximo refresco del canal.</p>
            )}

            <FotoReal p={abierta} alto="h-52 sm:h-72" />

            {/* ¿POR QUÉ IMPORTA? */}
            <div className="rounded-xl border p-3.5 space-y-3" style={{ borderColor: `${ACC}44`, background: `${ACC}08` }}>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-mono text-[9.5px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: ACC }}>
                  <Sparkles className="w-3 h-3" /> ¿POR QUÉ IMPORTA?
                </p>
                {porque[abierta.id] && (
                  <span className="font-mono text-[8.5px] px-2 py-0.5 rounded-full border" style={{ color: ACC, borderColor: `${ACC}55` }}>
                    {porque[abierta.id].ia ? "REDACTADO POR LA SALA (IA)" : "SALA HONESTA SIN IA"}
                  </span>
                )}
              </div>
              {!porque[abierta.id] ? (
                <button
                  onClick={() => cargarPorque(abierta)}
                  disabled={porqueLoading}
                  className="w-full rounded-lg py-2.5 font-mono text-[11px] font-bold tracking-widest text-black transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: ACC }}
                >
                  {porqueLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareText className="w-4 h-4" />}
                  {porqueLoading ? "LA SALA ESTÁ REDACTANDO…" : "PEDIR EL CONTEXTO A LA REDACCIÓN"}
                </button>
              ) : (
                <div className="space-y-2.5 font-serif">
                  <p className={cn("text-foreground/90", letraCls)}>{porque[abierta.id].explica}</p>
                  {porque[abierta.id].contexto && <p className={cn("text-foreground/75", letraCls)}>{porque[abierta.id].contexto}</p>}
                  {porque[abierta.id].claves.length > 0 && (
                    <ul className="space-y-1.5">
                      {porque[abierta.id].claves.map((c, i) => (
                        <li key={i} className={cn("text-foreground/85 flex gap-2", letra === 3 ? "text-[15px]" : "text-[13px]")}>
                          <span className="font-mono text-[10px] mt-0.5 shrink-0" style={{ color: ACC }}>{String(i + 1).padStart(2, "0")}</span>{c}
                        </li>
                      ))}
                    </ul>
                  )}
                  {porque[abierta.id].sigue && (
                    <p className="text-[12px] text-muted-foreground border-t border-white/10 pt-2 font-mono">A VIGILAR → {porque[abierta.id].sigue}</p>
                  )}
                </div>
              )}
            </div>

            {/* acciones del lector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => toggleGuardar(abierta)}
                className={cn(
                  "rounded-lg border py-2.5 font-mono text-[10.5px] font-bold tracking-wider flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]",
                  guardados.some((g) => g.id === abierta.id) ? "text-black" : "text-foreground border-white/15 bg-black/30 hover:border-white/30"
                )}
                style={guardados.some((g) => g.id === abierta.id) ? { background: ACC, borderColor: ACC } : undefined}
              >
                {guardados.some((g) => g.id === abierta.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {guardados.some((g) => g.id === abierta.id) ? "GUARDADA" : "GUARDAR"}
              </button>
              <button
                onClick={() => investigarDesde(abierta.t)}
                className="rounded-lg border py-2.5 font-mono text-[10.5px] font-bold tracking-wider flex items-center justify-center gap-1.5 text-foreground border-white/15 bg-black/30 hover:border-white/30 transition-transform active:scale-[0.98]"
              >
                <Search className="w-4 h-4" /> INVESTIGAR ESTO
              </button>
            </div>

            {/* tamaño de letra */}
            <div className="flex items-center justify-center gap-2 pb-2">
              <span className="font-mono text-[9px] text-muted-foreground">TAMAÑO</span>
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setLetra(n)}
                  className={cn("rounded-md border px-2 py-0.5 font-mono text-[10px]", letra === n ? "text-black" : "text-muted-foreground border-white/15")}
                  style={letra === n ? { background: ACC, borderColor: ACC } : undefined}
                >
                  {["A", "A+", "A++"][n - 1]}
                </button>
              ))}
            </div>
          </article>
        </div>
      )}

      {/* ---------------- PORTADA ---------------- */}
      {!abierta && (
        <div className="space-y-3">
          {cargando && (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-white/10 bg-black/40 p-3 flex gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 rounded bg-white/10 w-1/3 v105-brillo" />
                    <div className="h-3.5 rounded bg-white/10 w-full v105-brillo" />
                    <div className="h-3.5 rounded bg-white/10 w-2/3 v105-brillo" />
                  </div>
                  <div className="w-20 h-20 rounded-lg bg-white/10 v105-brillo shrink-0" />
                </div>
              ))}
            </div>
          )}

          {!cargando && filtradas.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-black/40 p-8 text-center space-y-2">
              <Globe2 className="w-8 h-8 mx-auto text-muted-foreground" />
              <p className="text-[13px] text-foreground/80">{cat === "guardados" ? "Aún no guardas ninguna pieza — cada artículo tiene su botón GUARDAR." : "El canal está sintonizando fuentes — vuelve en un par de minutos."}</p>
            </div>
          )}

          {!cargando && hero && (
            <button
              onClick={() => { setAbierta(hero); window.scrollTo({ top: 0 }); }}
              className="v105-entra w-full text-left rounded-xl overflow-hidden border border-white/12 bg-black/40 hover:border-amber/50 transition-colors group"
            >
              <FotoReal p={hero} alto="h-44 sm:h-60" />
              <div className="p-3.5 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <ChipTag tag={hero.tag} />
                  {hero.pais && <FlagBadge code={hero.pais.toUpperCase()} />}
                  <span className="font-mono text-[9.5px] text-muted-foreground">{hero.f} · {rel(hero.fecha)}</span>
                  <span className="font-mono text-[9.5px] text-muted-foreground ml-auto flex items-center gap-1"><Clock className="w-3 h-3" />{tiempoLectura(hero)} min</span>
                </div>
                <h2 className="font-serif font-bold text-[18px] sm:text-[21px] leading-[1.25] text-foreground group-hover:text-amber/90 transition-colors">{hero.t}</h2>
                {hero.s && <p className="text-[12.5px] leading-relaxed text-foreground/70 line-clamp-3">{hero.s}</p>}
                <p className="font-mono text-[9.5px] flex items-center gap-1 pt-0.5" style={{ color: ACC }}>
                  LEER AHORA <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </button>
          )}

          {!cargando && resto.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-2.5">
              {resto.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => { setAbierta(p); window.scrollTo({ top: 0 }); }}
                  className="v105-entra text-left rounded-xl overflow-hidden border border-white/10 bg-black/40 hover:border-amber/40 transition-colors flex flex-col"
                  style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                >
                  <FotoReal p={p} alto="h-28" />
                  <div className="p-2.5 space-y-1.5 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <ChipTag tag={p.tag} />
                      {p.pais && <FlagBadge code={p.pais.toUpperCase()} />}
                      <span className="font-mono text-[8.5px] text-muted-foreground truncate">{p.f} · {rel(p.fecha)}</span>
                    </div>
                    <p className="font-serif font-bold text-[14px] leading-[1.3] text-foreground line-clamp-3">{p.t}</p>
                    {p.s && <p className="text-[11px] leading-snug text-foreground/60 line-clamp-2">{p.s}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* pie de fuentes: cero enlaces, solo verdad */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-3 flex items-start gap-2.5">
        <Eye className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">fuentes reales del canal</p>
          <p className="text-[11px] text-foreground/70 leading-relaxed">{FUENTES_LINEA}. Vanguard lee y organiza; nunca inventa titulares ni fotos: sin imagen del medio, portada tipográfica.</p>
        </div>
      </div>
    </div>
  );
}
