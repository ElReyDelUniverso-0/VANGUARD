"use client";

// v94.0 GOOGLES TOTAL — EL BUSCADOR DE VANGUARD
// "Haz que Vanguard sea el Google de los problemas geopolíticos."
// La suite completa en un panel: buscador unificado con fichas de conocimiento,
// Tendencias (Google Trends), Traductor (8 idiomas vía núcleo IA), Noticias
// (edición tipo Google News), Académico (papers con citas) y Alertas.
// Sunset palette + animación en cada acción + 60fps + móvil y escritorio.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useGameStore } from "@/lib/game-store";
import { navigateTo } from "@/lib/nav";
import { toast } from "sonner";
import {
  PRODUCTOS, KIND_META, TENDENCIAS, PAPERS, estadisticasIndice, buscarGoogles,
  sugerenciasGoogles, suerteGoogles, serieViva, citacionAPA, citacionMLA,
  BUSQUEDA_REWARD, BUSQUEDA_MAX_DIA, dayKeyUtc,
  type GooglesKind, type FichaGoogles, type ResultadoGoogles, type TerminoTendencia,
} from "@/lib/googles";
import {
  Search, X, MapPin, FolderOpen, Skull, Bomb, Landmark, FileText, BookOpen,
  GraduationCap, TrendingUp, Clock, Copy, Trash2, Bell, BellRing, ArrowRightLeft,
  Sparkles, Languages, Newspaper, BarChart3, LayoutGrid, ChevronRight, Zap,
  CornerDownLeft, Globe2, RefreshCw, ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// STORE PERSISTENTE (alertas, recientes, cuota de recompensa)
// ============================================================
interface AlertaVG { id: string; termino: string; creada: number }

interface GooglesState {
  alertas: AlertaVG[];
  recientes: string[];
  busqDia: string;
  busqN: number;
  citados: string[];
  addAlerta: (t: string) => boolean;
  delAlerta: (id: string) => void;
  addReciente: (q: string) => void;
  registrarBusqueda: () => boolean;
  marcarCitado: (id: string) => void;
}

export const useGoogles = create<GooglesState>()(
  persist(
    (set, get) => ({
      alertas: [],
      recientes: [],
      busqDia: "",
      busqN: 0,
      citados: [],
      addAlerta: (t) => {
        const termino = t.trim().slice(0, 40);
        if (!termino) return false;
        if (get().alertas.some((a) => a.termino.toLowerCase() === termino.toLowerCase())) return false;
        set((s) => ({ alertas: [{ id: "al" + Date.now().toString(36), termino, creada: Date.now() }, ...s.alertas].slice(0, 12) }));
        return true;
      },
      delAlerta: (id) => set((s) => ({ alertas: s.alertas.filter((a) => a.id !== id) })),
      addReciente: (q) => {
        const v = q.trim().slice(0, 48);
        if (!v) return;
        set((s) => ({ recientes: [v, ...s.recientes.filter((r) => r.toLowerCase() !== v.toLowerCase())].slice(0, 8) }));
      },
      registrarBusqueda: () => {
        const hoy = dayKeyUtc();
        const st = get();
        if (st.busqDia !== hoy) {
          set({ busqDia: hoy, busqN: 1 });
          return true;
        }
        if (st.busqN >= BUSQUEDA_MAX_DIA) return false;
        set({ busqN: st.busqN + 1 });
        return true;
      },
      marcarCitado: (id) =>
        set((s) => ({ citados: s.citados.includes(id) ? s.citados : [...s.citados, id].slice(-40) })),
    }),
    { name: "vg-googles-v94", storage: createJSONStorage(() => localStorage) },
  ),
);

// ============================================================
// LOGO CON DIAL DIARIO (7 animaciones, una por día de semana)
// ============================================================
const LOGO_COLORS = ["#FFC94D", "#FFB347", "#FF9E4A", "#FF8A5C", "#FFB347", "#FFD166", "#E8A54B", "#FFC94D"];

function dialDeHoy(): number {
  return new Date().getUTCDay() % 7;
}

function LogoVanguard({ className, letras = "VANGUARD" }: { className?: string; letras?: string }) {
  const dial = dialDeHoy();
  return (
    <span className={cn("vg-logo select-none", className)} aria-label="Vanguard">
      {letras.split("").map((ch, i) => (
        <span
          key={i}
          className={cn("vg-logo-letra", `vg-dial-${dial}`)}
          style={{ color: LOGO_COLORS[i % LOGO_COLORS.length], animationDelay: `${i * 0.09}s` }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

// ============================================================
// HELPERS VISUALES
// ============================================================
const ICONOS_KIND: Record<GooglesKind, React.ComponentType<{ className?: string }>> = {
  lugar: MapPin, expediente: FolderOpen, oscuro: Skull, arma: Bomb, civil: Landmark,
  documento: FileText, wiki: BookOpen, academico: GraduationCap, tendencia: TrendingUp,
};

const FILTROS: Array<{ id: GooglesKind | "todo"; label: string }> = [
  { id: "todo", label: "Todo" },
  { id: "lugar", label: "Lugares" },
  { id: "expediente", label: "Expedientes" },
  { id: "oscuro", label: "Teorías" },
  { id: "arma", label: "Armas" },
  { id: "civil", label: "Civilizaciones" },
  { id: "documento", label: "Documentos" },
  { id: "wiki", label: "WIKIGUERRA" },
  { id: "academico", label: "Académico" },
  { id: "tendencia", label: "Tendencias" },
];

function iconoKind(kind: GooglesKind, className = "w-4 h-4") {
  const Ic = ICONOS_KIND[kind];
  return <Ic className={className} />;
}

/** Envuelve las coincidencias del query en <mark> dentro del snippet. */
function resaltar(snippet: string, q: string): React.ReactNode {
  const tokens = q.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").split(/\s+/).filter((t) => t.length > 2);
  if (!tokens.length) return snippet;
  const partes = snippet.split(new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi"));
  return partes.map((p, i) =>
    tokens.includes(p.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")) ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>,
  );
}

function Sparkline({ serie, hex, w = 92, h = 26 }: { serie: number[]; hex: string; w?: number; h?: number }) {
  const max = Math.max(...serie, 1);
  const min = Math.min(...serie);
  const rango = Math.max(1, max - min);
  const pts = serie.map((v, i) => `${(i / (serie.length - 1)) * w},${h - 2 - ((v - min) / rango) * (h - 5)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="vg-spark shrink-0">
      <motion.polyline
        points={pts}
        fill="none"
        stroke={hex}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0.2 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </svg>
  );
}

function VeredictoBars({ v }: { v: { riesgo: number; tension: number; confianza: number; sentimiento: string } }) {
  const filas: Array<[string, number, string]> = [
    ["RIESGO", v.riesgo, "#FF3B30"],
    ["TENSIÓN", v.tension, "#FF9E4A"],
    ["CONFIANZA", v.confianza, "#FFC94D"],
  ];
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black tracking-[0.18em] text-white/50">VEREDICTO NEURONAL v3</span>
        <span className={cn("text-[9px] font-black px-1.5 py-0.5 border", v.sentimiento === "ESCALADA" ? "text-[#FF6B4A] border-[#FF6B4A]/50" : "text-[#FFC94D] border-[#FFC94D]/40")}>
          {v.sentimiento}
        </span>
      </div>
      {filas.map(([label, val, hex]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-16 text-[8px] font-bold tracking-widest text-white/40">{label}</span>
          <div className="flex-1 h-1.5 bg-white/8 overflow-hidden rounded-sm">
            <motion.div
              className="h-full rounded-sm"
              style={{ background: hex }}
              initial={{ width: 0 }}
              animate={{ width: `${val}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          <span className="w-7 text-right text-[9px] font-black" style={{ color: hex }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// BARRA DE BÚSQUEDA (con autocompletado y teclado)
// ============================================================
function BarraBusqueda({
  valor, setValor, onSubmit, grande = false, autoFocus = false,
}: {
  valor: string;
  setValor: (v: string) => void;
  onSubmit: (q: string) => void;
  grande?: boolean;
  autoFocus?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  const [idx, setIdx] = useState(-1);
  const ref = useRef<HTMLInputElement>(null);
  const sugerencias = useMemo(() => (valor.trim() ? sugerenciasGoogles(valor) : []), [valor]);

  const actualiza = (v: string) => { setValor(v); setIdx(-1); };

  const submit = (q: string) => {
    const v = q.trim();
    if (!v) return;
    setValor(v);
    (document.activeElement as HTMLElement | null)?.blur();
    onSubmit(v);
  };

  return (
    <div className={cn("relative w-full", grande ? "max-w-2xl mx-auto" : "max-w-xl")}>
      <motion.div
        className={cn(
          "flex items-center gap-2 border bg-black/70 backdrop-blur",
          grande ? "px-4 py-3 rounded-2xl" : "px-3 py-2 rounded-xl",
          focus ? "border-[#FFC94D]/70 shadow-[0_0_24px_rgba(255,201,77,0.18)]" : "border-white/15",
        )}
        whileFocus={{ scale: 1.005 }}
      >
        <Search className={cn("shrink-0", focus ? "text-[#FFC94D]" : "text-white/40", grande ? "w-5 h-5" : "w-4 h-4")} />
        <input
          ref={ref}
          value={valor}
          autoFocus={autoFocus}
          onChange={(e) => actualiza(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 160)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, sugerencias.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, -1)); }
            else if (e.key === "Enter") { e.preventDefault(); submit(idx >= 0 ? sugerencias[idx] : valor); }
            else if (e.key === "Escape") { setValor(""); ref.current?.blur(); }
          }}
          placeholder={grande ? "Busca conflictos, lugares, expedientes, teorías, papers…" : "Buscar en Vanguard"}
          className={cn("flex-1 bg-transparent outline-none text-white/90 placeholder:text-white/30", grande ? "text-base" : "text-sm")}
          aria-label="Buscar en Vanguard"
        />
        {valor && (
          <button
            onClick={() => { setValor(""); ref.current?.focus(); }}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {focus && sugerencias.length > 0 && (
          <motion.div
            className={cn("vg-auto absolute left-0 right-0 z-40 mt-1.5 border border-[#FFC94D]/30 bg-[#0b0b10]/95 backdrop-blur-xl rounded-xl overflow-hidden", grande ? "top-full" : "top-full")}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {sugerencias.map((s, i) => (
              <button
                key={s + i}
                onMouseDown={(e) => { e.preventDefault(); submit(s); }}
                onMouseEnter={() => setIdx(i)}
                className={cn("w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors", i === idx ? "bg-[#FFC94D]/12 text-[#FFD166]" : "text-white/70 hover:bg-white/5")}
              >
                <Search className="w-3.5 h-3.5 opacity-50 shrink-0" />
                <span className="flex-1 truncate">{s}</span>
                {i === idx && <CornerDownLeft className="w-3.5 h-3.5 text-[#FFC94D]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// FICHA DE CONOCIMIENTO (panel derecho tipo grafo)
// ============================================================
function Ficha({ ficha, onBuscar, onAbrir }: { ficha: FichaGoogles; onBuscar: (q: string) => void; onAbrir: (doc: FichaGoogles["doc"]) => void }) {
  const meta = KIND_META[ficha.doc.kind];
  return (
    <motion.aside
      className="border border-[#FFC94D]/25 bg-gradient-to-b from-[#14100a]/90 to-[#0a0a0f]/95 rounded-2xl p-4 space-y-3"
      initial={{ opacity: 0, x: 22 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-black tracking-[0.2em] px-1.5 py-0.5 border" style={{ color: meta.hex, borderColor: meta.hex + "66" }}>
          {meta.tag}
        </span>
        <span className="text-[9px] font-bold tracking-wider text-white/40">FICHA DE CONOCIMIENTO</span>
      </div>
      <h3 className="text-lg font-black leading-tight text-white">{ficha.doc.titulo}</h3>
      <div className="space-y-1">
        {ficha.filas.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 text-[11px]">
            <span className="text-white/40 shrink-0">{k}</span>
            <span className="text-white/80 text-right font-semibold truncate">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-white/65">{ficha.doc.texto}</p>
      <VeredictoBars v={ficha.veredicto} />
      {ficha.relacionados.length > 0 && (
        <div>
          <p className="text-[9px] font-black tracking-[0.18em] text-white/40 mb-1.5">LA GENTE TAMBIÉN BUSCA</p>
          <div className="flex flex-wrap gap-1.5">
            {ficha.relacionados.map((r) => (
              <button
                key={r}
                onClick={() => onBuscar(r)}
                className="text-[10px] px-2 py-1 rounded-full border border-white/12 text-white/60 hover:border-[#FFC94D]/60 hover:text-[#FFD166] transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      <motion.button
        onClick={() => onAbrir(ficha.doc)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-2 rounded-lg bg-[#FFC94D] text-black text-xs font-black tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#FFD166] transition-colors"
      >
        ABRIR EN VANGUARD <ChevronRight className="w-3.5 h-3.5" />
      </motion.button>
    </motion.aside>
  );
}

// ============================================================
// ITEM DE RESULTADO
// ============================================================
function ResultadoItem({ r, q, idx, onBuscar, onAbrir }: { r: ResultadoGoogles; q: string; idx: number; onBuscar: (q: string) => void; onAbrir: (doc: ResultadoGoogles["doc"]) => void }) {
  const meta = KIND_META[r.doc.kind];
  return (
    <motion.article
      className="vg-res group px-3 py-3 -mx-3 rounded-xl"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.045, 0.4), duration: 0.28, ease: "easeOut" }}
    >
      <div className="flex gap-3">
        <div
          className="shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center mt-0.5"
          style={{ borderColor: meta.hex + "55", background: meta.hex + "14", color: meta.hex }}
        >
          {iconoKind(r.doc.kind)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[8px] font-black tracking-[0.16em] px-1.5 py-0.5 border" style={{ color: meta.hex, borderColor: meta.hex + "55" }}>{meta.tag}</span>
            <span className="text-[10px] text-white/35 truncate">{r.doc.sub}</span>
          </div>
          <button
            onClick={() => onAbrir(r.doc)}
            className="block text-left mt-1 text-[15px] font-bold leading-snug text-[#E8D9B0] group-hover:text-[#FFD166] group-hover:underline decoration-[#FFC94D]/50 underline-offset-2 transition-colors"
          >
            {r.doc.titulo}
          </button>
          <p className="mt-1 text-xs leading-relaxed text-white/55">{resaltar(r.snippet, q)}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <button onClick={() => onAbrir(r.doc)} className="text-[10px] font-black tracking-wider text-[#FFC94D]/80 hover:text-[#FFC94D] transition-colors">
              ABRIR →
            </button>
            {r.doc.kind !== "tendencia" && (
              <button onClick={() => onBuscar(r.doc.titulo)} className="text-[10px] text-white/35 hover:text-white/70 transition-colors">
                más sobre esto
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ============================================================
// VISTA: RESULTADOS
// ============================================================
type Vista = "portada" | "resultados" | "tendencias" | "traductor" | "noticias" | "academico" | "alertas";

function VistaResultados({ q, filtro, setFiltro, onBuscar, onProducto }: {
  q: string;
  filtro: GooglesKind | "todo";
  setFiltro: (f: GooglesKind | "todo") => void;
  onBuscar: (q: string) => void;
  onProducto: (p: Vista) => void;
}) {
  const resp = useMemo(() => buscarGoogles(q, filtro, 9), [q, filtro]);

  const abrir = (doc: ResultadoGoogles["doc"]) => {
    if (doc.accion.tipo === "tab" && doc.accion.tab) {
      toast(`Abriendo en ${doc.accion.tab.toUpperCase()}…`);
      navigateTo(doc.accion.tab as never);
    } else if (doc.accion.producto) {
      onProducto(doc.accion.producto as Vista);
    }
  };

  return (
    <div className="space-y-4">
      {/* chips de filtro */}
      <div className="vg-chips flex gap-1.5 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={cn(
              "shrink-0 text-[10px] font-black tracking-wider px-2.5 py-1.5 rounded-full border transition-all",
              filtro === f.id
                ? "bg-[#FFC94D] text-black border-[#FFC94D]"
                : "border-white/12 text-white/55 hover:border-[#FFC94D]/50 hover:text-[#FFD166]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/35 tracking-wide">
        Aproximadamente <b className="text-white/60">{resp.total}</b> resultados · {(resp.ms / 1000).toFixed(2)} segundos · núcleo neuronal v3
      </p>

      {resp.corregido && (
        <p className="text-sm text-white/60">
          ¿Quisiste decir <button onClick={() => onBuscar(resp.corregido!)} className="text-[#FFC94D] font-bold italic hover:underline">{resp.corregido}</button>?
        </p>
      )}

      {resp.total === 0 ? (
        <div className="py-14 text-center space-y-3">
          <Search className="w-10 h-10 mx-auto text-white/15" />
          <p className="text-white/60 font-bold">Sin resultados para “{q}”{filtro !== "todo" ? " en este filtro" : ""}</p>
          <p className="text-xs text-white/40 max-w-md mx-auto">Prueba con un lugar del planeta, una agencia (CIA, MI5), una teoría, un arma-idea o una tendencia del mundo Vanguard.</p>
          <button
            onClick={() => onBuscar(suerteGoogles().titulo)}
            className="inline-flex items-center gap-1.5 text-xs font-black text-[#FFC94D] hover:text-[#FFD166] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> VOY A TENER SUERTE
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-1 min-w-0">
            {resp.resultados.map((r, i) => (
              <ResultadoItem key={r.doc.id} r={r} q={q} idx={i} onBuscar={onBuscar} onAbrir={abrir} />
            ))}
          </div>
          {resp.ficha && <Ficha ficha={resp.ficha} onBuscar={onBuscar} onAbrir={abrir} />}
        </div>
      )}

      {resp.relacionadas.length > 0 && resp.total > 0 && (
        <div className="pt-2 border-t border-white/8">
          <p className="text-[9px] font-black tracking-[0.18em] text-white/40 mb-2 mt-3">BÚSQUEDAS RELACIONADAS</p>
          <div className="grid sm:grid-cols-2 gap-1.5">
            {resp.relacionadas.slice(0, 6).map((r) => (
              <button
                key={r}
                onClick={() => onBuscar(r)}
                className="flex items-center justify-between gap-2 text-left text-xs px-3 py-2 rounded-lg bg-white/4 hover:bg-[#FFC94D]/10 text-white/65 hover:text-[#FFD166] transition-colors group"
              >
                <Search className="w-3 h-3 opacity-50 shrink-0" />
                <span className="flex-1 truncate font-semibold">{r}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// VISTA: TENDENCIAS
// ============================================================
const ESTADO_META: Record<string, { hex: string; anim: boolean }> = {
  DISPARA: { hex: "#FF3B30", anim: true },
  AUGE: { hex: "#FF9E4A", anim: false },
  SUBE: { hex: "#FFD166", anim: false },
  ESTABLE: { hex: "#9A9AA5", anim: false },
  BAJA: { hex: "#6B7280", anim: false },
};

function VistaTendencias({ onBuscar }: { onBuscar: (q: string) => void }) {
  const [region, setRegion] = useState("Todas");
  const [sel, setSel] = useState<TerminoTendencia | null>(null);
  const regiones = useMemo(() => ["Todas", ...new Set(TENDENCIAS.map((t) => t.region))], []);
  const lista = useMemo(() => {
    const base = [...TENDENCIAS].sort((a, b) => b.volumen - a.volumen);
    return region === "Todas" ? base : base.filter((t) => t.region === region);
  }, [region]);
  const serieSel = sel ? serieViva(sel) : null;

  return (
    <div className="space-y-4">
      <div className="vg-chips flex gap-1.5 overflow-x-auto pb-1">
        {regiones.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={cn(
              "shrink-0 text-[10px] font-black tracking-wider px-2.5 py-1.5 rounded-full border transition-all",
              region === r ? "bg-[#FFB347] text-black border-[#FFB347]" : "border-white/12 text-white/55 hover:border-[#FFB347]/50 hover:text-[#FFB347]",
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <motion.ol className="space-y-1" initial="ini" animate="fin" variants={{ fin: { transition: { staggerChildren: 0.035 } } }}>
        {lista.map((t, i) => {
          const em = ESTADO_META[t.estado];
          return (
            <motion.li
              key={t.id}
              variants={{ ini: { opacity: 0, y: 8 }, fin: { opacity: 1, y: 0 } }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setSel(t)}
            >
              <span className="w-6 text-right text-lg font-black text-white/25">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onBuscar(t.termino); }}
                  className="block text-left text-sm font-bold text-white/85 hover:text-[#FFD166] transition-colors truncate"
                >
                  {t.termino}
                </button>
                <span className="text-[10px] text-white/35">{t.region} · {t.volumen}k búsquedas/hora</span>
              </div>
              <Sparkline serie={serieViva(t)} hex={em.hex} />
              <span className={cn("shrink-0 text-[8px] font-black tracking-widest px-1.5 py-1 border w-16 text-center", em.anim && "vg-dispara")} style={{ color: em.hex, borderColor: em.hex + "66" }}>
                {t.estado} {t.delta > 0 ? "+" : ""}{t.delta}%
              </span>
            </motion.li>
          );
        })}
      </motion.ol>

      <AnimatePresence>
        {sel && serieSel && (
          <motion.div
            className="border border-[#FFB347]/30 bg-[#0d0c08]/80 rounded-2xl p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-black text-white">{sel.termino}</h4>
                <p className="text-[10px] text-white/40">Interés en las últimas 24 horas · {sel.region}</p>
              </div>
              <button onClick={() => onBuscar(sel.termino)} className="text-[10px] font-black text-[#FFC94D] hover:text-[#FFD166] transition-colors">BUSCAR →</button>
            </div>
            <div className="flex items-end gap-[3px] h-20">
              {serieSel.map((v, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-sm"
                  style={{ background: `linear-gradient(to top, #FF9E4A, #FFD166)` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / Math.max(...serieSel)) * 100}%` }}
                  transition={{ delay: i * 0.02, duration: 0.3, ease: "easeOut" }}
                  title={`${v}k`}
                />
              ))}
            </div>
            <p className="mt-2 text-[9px] text-white/30 tracking-wide">Volumen simulado por el núcleo neuronal v3 · respiración horaria determinista</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// VISTA: TRADUCTOR
// ============================================================
const IDIOMAS_UI = [
  { code: "es", nombre: "Español" }, { code: "en", nombre: "Inglés" }, { code: "pt", nombre: "Portugués" },
  { code: "fr", nombre: "Francés" }, { code: "de", nombre: "Alemán" }, { code: "it", nombre: "Italiano" },
  { code: "zh", nombre: "Chino" }, { code: "ru", nombre: "Ruso" },
];

function VistaTraductor() {
  const [texto, setTexto] = useState("");
  const [de, setDe] = useState("es");
  const [a, setA] = useState("en");
  const [cargando, setCargando] = useState(false);
  const [salida, setSalida] = useState<{ traduccion: string; nota: string; ia: boolean; ms: number } | null>(null);
  const [error, setError] = useState("");

  const traducir = async () => {
    if (!texto.trim() || cargando) return;
    setCargando(true);
    setError("");
    setSalida(null);
    try {
      const res = await fetch("/api/traductor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, de, a }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "El núcleo de traducción no responde");
      setSalida(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const intercambiar = () => {
    setDe(a); setA(de);
    if (salida) { setTexto(salida.traduccion); setSalida(null); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select value={de} onChange={(e) => setDe(e.target.value)} className="vg-select">
          {IDIOMAS_UI.map((i) => <option key={i.code} value={i.code} disabled={i.code === a}>{i.nombre}{i.code === de ? " · detectado" : ""}</option>)}
        </select>
        <button onClick={intercambiar} className="p-2 rounded-full border border-white/15 hover:border-[#FFC94D]/60 hover:text-[#FFD166] text-white/60 transition-colors" aria-label="Intercambiar idiomas">
          <ArrowRightLeft className="w-4 h-4" />
        </button>
        <select value={a} onChange={(e) => setA(e.target.value)} className="vg-select">
          {IDIOMAS_UI.map((i) => <option key={i.code} value={i.code} disabled={i.code === de}>{i.nombre}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value.slice(0, 900))}
            rows={7}
            placeholder="Escribe o pega el cable, el manifiesto o el mensaje a traducir…"
            className="w-full bg-black/60 border border-white/15 focus:border-[#FFC94D]/70 rounded-xl p-3 text-sm text-white/85 outline-none resize-none transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/30">{texto.length}/900</span>
            <motion.button
              onClick={traducir}
              whileTap={{ scale: 0.96 }}
              disabled={cargando || !texto.trim()}
              className="px-5 py-2 rounded-lg bg-[#FFC94D] disabled:opacity-40 text-black text-xs font-black tracking-wider hover:bg-[#FFD166] transition-colors flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5" /> {cargando ? "TRADUCIENDO…" : "TRADUCIR"}
            </motion.button>
          </div>
        </div>

        <div className="relative bg-[#0d0c08]/80 border border-[#FFC94D]/25 rounded-xl p-3 min-h-[188px] flex flex-col">
          {cargando && (
            <div className="flex-1 flex items-center justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="vg-dot w-2 h-2 rounded-full bg-[#FFC94D]" style={{ animationDelay: `${i * 0.18}s` }} />
              ))}
            </div>
          )}
          {!cargando && error && <p className="text-xs text-[#FF6B4A] leading-relaxed">{error}</p>}
          {!cargando && !error && !salida && (
            <p className="text-xs text-white/30 m-auto text-center">La traducción aparecerá aquí.<br />El núcleo IA traduce con registro de agencia.</p>
          )}
          {!cargando && salida && (
            <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="flex-1 text-sm leading-relaxed text-white/90 whitespace-pre-wrap">{salida.traduccion}</p>
              {salida.nota && (
                <p className="mt-2 text-[10px] text-[#FFD166]/70 border-l-2 border-[#FFC94D]/40 pl-2">{salida.nota}</p>
              )}
              <div className="mt-2 flex items-center justify-between text-[9px] text-white/35">
                <span>{salida.ia ? "Red neuronal de Vanguard" : "Glosario táctico local"} · {salida.ms} ms</span>
                <button
                  onClick={() => { navigator.clipboard?.writeText(salida.traduccion); toast("Traducción copiada"); }}
                  className="flex items-center gap-1 hover:text-[#FFD166] transition-colors"
                >
                  <Copy className="w-3 h-3" /> COPIAR
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <p className="text-[10px] text-white/30 tracking-wide">8 idiomas del mundo Vanguard · caché de 24 h · glosario táctico de emergencia si el núcleo IA cae</p>
    </div>
  );
}

// ============================================================
// VISTA: NOTICIAS (edición tipo Google News)
// ============================================================
interface NoticiaItem { id: string; title: string; source: string; sourceCountry?: string | null; tacticalTag?: string | null; publishedAt?: string | null; url?: string | null }

function edadNoticia(iso?: string | null): string {
  if (!iso) return "";
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} d`;
}

/** Edición de reserva: titulares ficticios del mundo Vanguard, deterministas por día. */
function edicionVanguard(): NoticiaItem[] {
  const dia = Math.floor(Date.now() / 86_400_000);
  const PLANTILLAS: Array<[string, string]> = [
    ["ÚLTIMA HORA: la tensión sube en {T} mientras la flota espera órdenes", "ALERTA"],
    ["Análisis: qué se juega realmente el mundo en {T}", "ANALISIS"],
    ["El pulso diplomático gira hacia {T}: mediadores sobre el terreno", "DIPLOMACIA"],
    ["Economía de guerra: el precio del flete reacciona a {T}", "ECONOMIA"],
    ["Humanitario: la cola de evacuados crece cerca de {T}", "HUMANITARIO"],
    ["Satélites confirman movimiento inusual alrededor de {T}", "ALERTA"],
    ["Doctrina y disuasión: la lección silenciosa de {T}", "ANALISIS"],
    ["Negociación exprés: agenda secreta sobre {T}", "DIPLOMACIA"],
    ["Seguros marítimos recalculan el riesgo en {T}", "ECONOMIA"],
    ["Cruces de frontera: la ruta humana que atraviesa {T}", "HUMANITARIO"],
  ];
  const out: NoticiaItem[] = [];
  for (let i = 0; i < 10; i++) {
    const t = TENDENCIAS[(dia * 7 + i * 5) % TENDENCIAS.length];
    const [plantilla, tag] = PLANTILLAS[(dia + i) % PLANTILLAS.length];
    out.push({
      id: "vg-ed-" + i,
      title: plantilla.replace("{T}", t.termino),
      source: "Vanguard Mundo",
      sourceCountry: t.region,
      tacticalTag: tag,
      publishedAt: new Date(Date.now() - (i + 1) * 47 * 60000).toISOString(),
      url: null,
    });
  }
  return out;
}

const TAGS_NEWS = ["TODAS", "ALERTA", "DIPLOMACIA", "ECONOMIA", "HUMANITARIO", "ANALISIS"];

function VistaNoticias({ onBuscar }: { onBuscar: (q: string) => void }) {
  const [items, setItems] = useState<NoticiaItem[] | null>(null);
  const [fuente, setFuente] = useState("");
  const [tag, setTag] = useState("TODAS");

  useEffect(() => {
    let vivo = true;
    fetch("/api/news?limit=14")
      .then((r) => r.json())
      .then((j) => {
        if (!vivo) return;
        if (j.items?.length) { setItems(j.items); setFuente(j.source === "ARCHIVO" ? "Archivo Vanguard + red de medios" : "Red en vivo"); }
        else { setItems(edicionVanguard()); setFuente("Edición Vanguard (mundo ficticio)"); }
      })
      .catch(() => { if (vivo) { setItems(edicionVanguard()); setFuente("Edición Vanguard (mundo ficticio)"); } });
    return () => { vivo = false; };
  }, []);

  const lista = useMemo(() => {
    if (!items) return [];
    return tag === "TODAS" ? items : items.filter((n) => (n.tacticalTag ?? "").toUpperCase() === tag);
  }, [items, tag]);

  const TAG_HEX: Record<string, string> = {
    ALERTA: "#FF3B30", DIPLOMACIA: "#FFC94D", ECONOMIA: "#FF9E4A",
    HUMANITARIO: "#FFD166", ANALISIS: "#9A9AA5",
  };

  return (
    <div className="space-y-4">
      <div className="vg-chips flex gap-1.5 overflow-x-auto pb-1">
        {TAGS_NEWS.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={cn(
              "shrink-0 text-[10px] font-black tracking-wider px-2.5 py-1.5 rounded-full border transition-all",
              tag === t ? "bg-[#FF8A5C] text-black border-[#FF8A5C]" : "border-white/12 text-white/55 hover:border-[#FF8A5C]/60 hover:text-[#FF9E4A]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {!items ? (
        <div className="flex items-center justify-center gap-1.5 py-14">
          {[0, 1, 2].map((i) => <span key={i} className="vg-dot w-2 h-2 rounded-full bg-[#FF8A5C]" style={{ animationDelay: `${i * 0.18}s` }} />)}
        </div>
      ) : (
        <>
          <p className="text-[10px] text-white/35 tracking-wide">EDICIÓN DE HOY · {fuente} · {lista.length} titulares</p>
          {lista[0] && (
            <motion.button
              onClick={() => lista[0].url && window.open(lista[0].url, "_blank")}
              className="w-full text-left border border-[#FF8A5C]/35 bg-gradient-to-br from-[#170d08]/90 to-[#0a0a0f]/95 rounded-2xl p-4 hover:border-[#FF8A5C]/70 transition-colors"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            >
              <span className="vg-lateja text-[8px] font-black tracking-[0.2em] text-[#FF3B30]">PORTADA</span>
              <h3 className="mt-1 text-lg font-black leading-snug text-white">{lista[0].title}</h3>
              <p className="mt-1 text-[10px] text-white/45">{lista[0].source}{lista[0].sourceCountry ? ` · ${lista[0].sourceCountry}` : ""} · {edadNoticia(lista[0].publishedAt)}</p>
            </motion.button>
          )}
          <div className="grid sm:grid-cols-2 gap-2.5">
            {lista.slice(1).map((n, i) => (
              <motion.article
                key={n.id}
                className="border border-white/10 hover:border-[#FFC94D]/40 bg-white/[0.03] hover:bg-[#FFC94D]/[0.05] rounded-xl p-3 transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
                onClick={() => n.url && window.open(n.url, "_blank")}
              >
                <span className="text-[8px] font-black tracking-widest" style={{ color: TAG_HEX[n.tacticalTag?.toUpperCase() ?? "ANALISIS"] ?? "#9A9AA5" }}>
                  {n.tacticalTag?.toUpperCase() || "MUNDO"}
                </span>
                <h4 className="mt-1 text-[13px] font-bold leading-snug text-white/85">{n.title}</h4>
                <p className="mt-1 text-[10px] text-white/40">{n.source}{n.sourceCountry ? ` · ${n.sourceCountry}` : ""} · {edadNoticia(n.publishedAt)}</p>
              </motion.article>
            ))}
          </div>
        </>
      )}
      <p className="text-[10px] text-white/30 tracking-wide">Toca una tendencia del panel Tendencias o búscala arriba para cruzar titulares con el índice completo.</p>
    </div>
  );
}

// ============================================================
// VISTA: ACADÉMICO
// ============================================================
function VistaAcademico() {
  const [orden, setOrden] = useState<"relevancia" | "citas" | "year">("relevancia");
  const [filtro, setFiltro] = useState("");
  const citados = useGoogles((s) => s.citados);
  const marcarCitado = useGoogles((s) => s.marcarCitado);

  const lista = useMemo(() => {
    let l = [...PAPERS];
    if (filtro.trim()) {
      const nf = filtro.toLowerCase();
      l = l.filter((p) => p.titulo.toLowerCase().includes(nf) || p.autores.join(" ").toLowerCase().includes(nf) || p.revista.toLowerCase().includes(nf));
    }
    if (orden === "citas") l.sort((a, b) => b.citas - a.citas);
    if (orden === "year") l.sort((a, b) => b.year - a.year);
    return l;
  }, [orden, filtro]);

  const copiar = (p: (typeof PAPERS)[number], fmt: "APA" | "MLA") => {
    const texto = fmt === "APA" ? citacionAPA(p) : citacionMLA(p);
    navigator.clipboard?.writeText(texto);
    marcarCitado(p.id);
    toast(`Cita ${fmt} copiada al portapapeles`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {(["relevancia", "citas", "year"] as const).map((o) => (
          <button
            key={o}
            onClick={() => setOrden(o)}
            className={cn(
              "text-[10px] font-black tracking-wider px-2.5 py-1.5 rounded-full border transition-all",
              orden === o ? "bg-[#F2C879] text-black border-[#F2C879]" : "border-white/12 text-white/55 hover:border-[#F2C879]/60 hover:text-[#F2C879]",
            )}
          >
            {o === "relevancia" ? "RELEVANCIA" : o === "citas" ? "MÁS CITADOS" : "MÁS RECIENTES"}
          </button>
        ))}
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Filtrar papers…"
          className="ml-auto bg-black/60 border border-white/15 focus:border-[#F2C879]/70 rounded-lg px-3 py-1.5 text-xs text-white/85 outline-none w-44 transition-colors"
        />
      </div>

      <div className="space-y-2.5">
        {lista.map((p, i) => (
          <motion.article
            key={p.id}
            className="border border-white/10 hover:border-[#F2C879]/40 bg-white/[0.03] rounded-xl p-4 transition-colors"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-bold leading-snug text-[#E8D9B0]">{p.titulo}</h4>
              <span className="shrink-0 text-[10px] font-black text-[#F2C879] flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {p.citas}{citados.includes(p.id) ? "+1" : ""}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-white/45">{p.autores.join(" · ")} — <i>{p.revista}</i>, {p.year}</p>
            <p className="mt-2 text-xs leading-relaxed text-white/60">{p.abstracto}</p>
            <div className="mt-2 flex gap-2">
              <button onClick={() => copiar(p, "APA")} className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md border border-[#F2C879]/40 text-[#F2C879] hover:bg-[#F2C879]/10 transition-colors">CITAR APA</button>
              <button onClick={() => copiar(p, "MLA")} className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md border border-white/15 text-white/50 hover:text-white/80 hover:border-white/30 transition-colors">CITAR MLA</button>
              {citados.includes(p.id) && <span className="text-[9px] self-center text-[#FFD166]/70">✓ citado por ti</span>}
            </div>
          </motion.article>
        ))}
      </div>
      <p className="text-[10px] text-white/30 tracking-wide">Los papers del mundo Vanguard son ficción académica original — autores, revistas y datos son del universo del juego.</p>
    </div>
  );
}

// ============================================================
// VISTA: ALERTAS
// ============================================================
function VistaAlertas({ onBuscar }: { onBuscar: (q: string) => void }) {
  const alertas = useGoogles((s) => s.alertas);
  const addAlerta = useGoogles((s) => s.addAlerta);
  const delAlerta = useGoogles((s) => s.delAlerta);
  const [term, setTerm] = useState("");

  const crear = (t: string) => {
    if (addAlerta(t)) { toast(`Alerta creada: "${t.trim().slice(0, 40)}"`); setTerm(""); }
    else toast.error("Esa alerta ya existe o el término está vacío");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && crear(term)}
          placeholder="Vigilar un término: un lugar, una flota, una teoría…"
          className="flex-1 bg-black/60 border border-white/15 focus:border-[#FF6B4A]/70 rounded-xl px-3 py-2.5 text-sm text-white/85 outline-none transition-colors"
        />
        <motion.button
          onClick={() => crear(term)} whileTap={{ scale: 0.96 }}
          className="px-4 rounded-xl bg-[#FF6B4A] text-black text-xs font-black tracking-wider hover:bg-[#FF8A5C] transition-colors flex items-center gap-1.5"
        >
          <Bell className="w-3.5 h-3.5" /> CREAR
        </motion.button>
      </div>

      <div>
        <p className="text-[9px] font-black tracking-[0.18em] text-white/40 mb-1.5">SUGERENCIAS DEL NÚCLEO</p>
        <div className="flex flex-wrap gap-1.5">
          {TENDENCIAS.slice(0, 5).map((t) => (
            <button key={t.id} onClick={() => crear(t.termino)} className="text-[10px] px-2 py-1 rounded-full border border-white/12 text-white/55 hover:border-[#FF6B4A]/60 hover:text-[#FF8A5C] transition-colors">
              + {t.termino}
            </button>
          ))}
        </div>
      </div>

      {alertas.length === 0 ? (
        <p className="text-xs text-white/40 py-8 text-center">Sin alertas todavía. Crea una y el mundo Vanguard te avisará cuando aparezca en el índice.</p>
      ) : (
        <ul className="space-y-2">
          {alertas.map((a, i) => {
            const resp = buscarGoogles(a.termino, "todo", 1);
            const hits = resp.total;
            return (
              <motion.li
                key={a.id}
                className="flex items-center gap-3 border border-white/10 hover:border-[#FF6B4A]/40 bg-white/[0.03] rounded-xl px-3 py-2.5"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              >
                {hits > 0 ? <BellRing className="w-4 h-4 text-[#FF6B4A] vg-lateja" /> : <Bell className="w-4 h-4 text-white/30" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white/85 truncate">{a.termino}</p>
                  <p className="text-[10px] text-white/40">
                    {hits > 0 ? `${hits} coincidencias en el índice · ` : "sin coincidencias por ahora · "}
                    creada {edadNoticia(new Date(a.creada).toISOString())}
                  </p>
                </div>
                <button onClick={() => onBuscar(a.termino)} className="text-[10px] font-black text-[#FFC94D] hover:text-[#FFD166] transition-colors">REVISAR</button>
                <button onClick={() => delAlerta(a.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-[#FF3B30] transition-colors" aria-label="Eliminar alerta">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ============================================================
// PANEL PRINCIPAL
// ============================================================
const ICONOS_PRODUCTO: Record<string, React.ComponentType<{ className?: string }>> = {
  buscador: Search, tendencias: BarChart3, traductor: Languages, noticias: Newspaper,
  academico: GraduationCap, alertas: Bell, tierra: Globe2, ojodios: Sparkles, wikiguerra: BookOpen,
};

export function GooglesPanel() {
  const [vista, setVista] = useState<Vista>("portada");
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<GooglesKind | "todo">("todo");
  const [dock, setDock] = useState(false);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const addReciente = useGoogles((s) => s.addReciente);
  const registrarBusqueda = useGoogles((s) => s.registrarBusqueda);
  const stats = useMemo(() => estadisticasIndice(), []);

  const buscar = (nq: string) => {
    const v = nq.trim();
    if (!v) return;
    setQ(v);
    setInput(v);
    setVista("resultados");
    setFiltro("todo");
    addReciente(v);
    const granted = registrarBusqueda();
    if (granted) {
      addCoins(BUSQUEDA_REWARD.coins, "Operador curioso (búsqueda)");
      addXp(BUSQUEDA_REWARD.xp);
      const n = useGoogles.getState().busqN;
      toast(`Operador curioso +${BUSQUEDA_REWARD.coins}ⓒ +${BUSQUEDA_REWARD.xp} XP (${n}/${BUSQUEDA_MAX_DIA} hoy)`);
    }
  };

  // v96.0 GOOGLE VIVO: la barra central de estructura Google dispara búsquedas aquí.
  // Dos vías: evento vanguard:buscar (panel ya montado) o sessionStorage (primer montaje).
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;
  useEffect(() => {
    const onBuscar = (e: Event) => {
      const q = (e as CustomEvent<{ q?: string }>).detail?.q;
      if (q) buscarRef.current(q);
    };
    window.addEventListener("vanguard:buscar", onBuscar);
    let pendiente: string | null = null;
    try {
      pendiente = sessionStorage.getItem("vg-gbar-q");
      if (pendiente) sessionStorage.removeItem("vg-gbar-q");
    } catch {
      /* sin almacenamiento */
    }
    if (pendiente) buscarRef.current(pendiente);
    return () => window.removeEventListener("vanguard:buscar", onBuscar);
  }, []);

  const suerte = () => {
    const doc = suerteGoogles();
    toast(`Suerte de Vanguard: ${doc.titulo}`);
    buscar(doc.titulo);
  };

  const abrirProducto = (p: (typeof PRODUCTOS)[number]) => {
    if (p.tab) {
      toast(`Abriendo ${p.nombre.toUpperCase()}…`);
      navigateTo(p.tab as never);
    } else {
      setDock(false);
      setVista(p.id as Vista);
    }
  };

  const abrirDoc = (doc: ResultadoGoogles["doc"] | FichaGoogles["doc"]) => {
    if (doc.accion.tipo === "tab" && doc.accion.tab) {
      toast(`Abriendo en ${doc.accion.tab.toUpperCase()}…`);
      navigateTo(doc.accion.tab as never);
    } else if (doc.accion.producto) {
      setVista(doc.accion.producto as Vista);
    }
  };

  return (
    <div className="relative min-h-[72vh] w-full flex flex-col">
      {/* BARRA SUPERIOR (compacta cuando no es portada) */}
      {vista !== "portada" && (
        <div className="sticky top-0 z-30 -mx-1 px-1 pt-1 pb-2.5 bg-gradient-to-b from-[#08080c] via-[#08080c]/95 to-transparent backdrop-blur-sm flex items-center gap-3">
          <button onClick={() => { setVista("portada"); setInput(""); }} className="shrink-0" aria-label="Volver a la portada de GOOGLES">
            <LogoVanguard className="text-lg" letras="VG" />
          </button>
          <div className="flex-1 min-w-0">
            <BarraBusqueda valor={input} setValor={setInput} onSubmit={buscar} />
          </div>
          <button
            onClick={() => setDock((d) => !d)}
            className={cn("shrink-0 p-2 rounded-xl border transition-colors", dock ? "border-[#FFC94D] text-[#FFC94D] bg-[#FFC94D]/10" : "border-white/15 text-white/50 hover:text-[#FFD166] hover:border-[#FFC94D]/50")}
            aria-label="Productos de Vanguard"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DOCK DE PRODUCTOS (overlay) */}
      <AnimatePresence>
        {dock && (
          <motion.div
            className="absolute right-2 top-14 z-40 w-72 border border-[#FFC94D]/30 bg-[#0b0b10]/97 backdrop-blur-xl rounded-2xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, scale: 0.94, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="grid grid-cols-3 gap-1.5">
              {PRODUCTOS.map((p) => {
                const Ic = ICONOS_PRODUCTO[p.id] ?? Search;
                return (
                  <button
                    key={p.id}
                    onClick={() => abrirProducto(p)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl hover:bg-white/6 transition-colors group"
                  >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform" style={{ borderColor: p.hex + "55", background: p.hex + "12", color: p.hex }}>
                      <Ic className="w-5 h-5" />
                    </span>
                    <span className="text-[9px] font-black tracking-wider text-white/60 group-hover:text-white">{p.nombre}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENIDO */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {vista === "portada" && (
            <motion.div
              key="portada"
              className="flex flex-col items-center pt-8 pb-6 px-3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <LogoVanguard className="text-5xl sm:text-7xl" />
              <motion.p
                className="mt-3 text-center text-xs sm:text-sm text-white/50 max-w-md"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              >
                <b className="text-[#FFD166]">El Google de los problemas geopolíticos.</b> Todo el mundo Vanguard, indexado: lugares, expedientes, teorías, papers, tendencias y titulares.
              </motion.p>

              <motion.div className="mt-7 w-full flex flex-col items-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                <BarraBusqueda valor={input} setValor={setInput} onSubmit={buscar} grande autoFocus />
                <div className="flex gap-2.5">
                  <motion.button
                    onClick={() => buscar(input)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-xl bg-[#FFC94D] text-black text-xs font-black tracking-wider hover:bg-[#FFD166] transition-colors shadow-[0_0_20px_rgba(255,201,77,0.25)]"
                  >
                    BUSCAR EN VANGUARD
                  </motion.button>
                  <motion.button
                    onClick={suerte}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="px-5 py-2.5 rounded-xl border border-white/20 text-white/70 text-xs font-black tracking-wider hover:border-[#FFC94D]/60 hover:text-[#FFD166] transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" /> VOY A TENER SUERTE
                  </motion.button>
                </div>
              </motion.div>

              {/* ticker de tendencias */}
              <motion.button
                onClick={() => setVista("tendencias")}
                className="mt-6 flex items-center gap-2 text-[11px] text-white/45 hover:text-[#FFD166] transition-colors overflow-hidden max-w-full"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#FF9E4A] shrink-0" />
                <span className="shrink-0 font-black tracking-widest text-white/35">AHORA:</span>
                <span className="truncate">{TENDENCIAS.slice(0, 3).map((t) => t.termino).join("  ·  ")}</span>
              </motion.button>

              {/* dock en portada */}
              <motion.div
                className="mt-8 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5 w-full max-w-4xl"
                initial="ini" animate="fin"
                variants={{ fin: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
              >
                {PRODUCTOS.map((p) => {
                  const Ic = ICONOS_PRODUCTO[p.id] ?? Search;
                  return (
                    <motion.button
                      key={p.id}
                      variants={{ ini: { opacity: 0, y: 12 }, fin: { opacity: 1, y: 0 } }}
                      onClick={() => abrirProducto(p)}
                      className="group flex flex-col items-center gap-2 py-3.5 rounded-2xl border border-white/8 hover:border-[#FFC94D]/40 bg-white/[0.03] hover:bg-[#FFC94D]/[0.06] transition-colors"
                    >
                      <span className="w-11 h-11 rounded-2xl flex items-center justify-center border group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform" style={{ borderColor: p.hex + "55", background: p.hex + "12", color: p.hex }}>
                        <Ic className="w-5 h-5" />
                      </span>
                      <span className="text-[10px] font-black tracking-wider text-white/60 group-hover:text-white">{p.nombre}</span>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* estadísticas del índice */}
              <motion.div
                className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-white/35 tracking-wide text-center"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              >
                <span><b className="text-[#FFD166]">{stats.total}</b> documentos indexados</span>
                <span className="hidden sm:inline text-white/15">|</span>
                <span>{stats.porKind.lugar ?? 0} lugares del planeta</span>
                <span className="hidden sm:inline text-white/15">|</span>
                <span>{stats.porKind.expediente ?? 0} expedientes desclasificados</span>
                <span className="hidden sm:inline text-white/15">|</span>
                <span>{stats.porKind.academico ?? 0} papers</span>
                <span className="hidden sm:inline text-white/15">|</span>
                <span>buscado por el núcleo neuronal v3</span>
              </motion.div>

              {useGoogles.getState().recientes.length > 0 && (
                <motion.div className="mt-5 flex flex-wrap justify-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  {useGoogles.getState().recientes.slice(0, 5).map((r) => (
                    <button key={r} onClick={() => buscar(r)} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-white/10 text-white/45 hover:border-[#FFC94D]/50 hover:text-[#FFD166] transition-colors">
                      <Clock className="w-3 h-3" /> {r}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {vista === "resultados" && (
            <motion.div key="res" className="px-3 pb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
              <VistaResultados q={q} filtro={filtro} setFiltro={setFiltro} onBuscar={buscar} onProducto={(p) => setVista(p)} />
            </motion.div>
          )}
          {vista === "tendencias" && (
            <motion.div key="tend" className="px-3 pb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
              <VistaTendencias onBuscar={buscar} />
            </motion.div>
          )}
          {vista === "traductor" && (
            <motion.div key="trad" className="px-3 pb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
              <VistaTraductor />
            </motion.div>
          )}
          {vista === "noticias" && (
            <motion.div key="noti" className="px-3 pb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
              <VistaNoticias onBuscar={buscar} />
            </motion.div>
          )}
          {vista === "academico" && (
            <motion.div key="aca" className="px-3 pb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
              <VistaAcademico />
            </motion.div>
          )}
          {vista === "alertas" && (
            <motion.div key="ale" className="px-3 pb-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
              <VistaAlertas onBuscar={buscar} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PIE */}
      <div className="border-t border-white/8 py-2.5 px-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[9px] text-white/30 tracking-widest">
        <span>GOOGLES DE VANGUARD · INDEXACIÓN CONTINUA</span>
        <span className="text-white/15">|</span>
        <span className="flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" /> RESPUESTA DETERMINISTA DEL NÚCLEO v3</span>
      </div>
    </div>
  );
}

