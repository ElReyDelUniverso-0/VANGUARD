"use client";

// v89.0 OPERACIÓN ESPEJO — PÉRDIDAS CONFIRMADAS (espejo del registro visual de
// bajas materiales más citado del mundo: libro contable por tipo y estado, con
// la regla de oro del original: SOLO se cuenta lo documentado con evidencia).

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Truck, Camera, ChevronDown, ShieldHalf } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { generarPerdidas, totalesPorLado, ESTADOS_META, type EstadoEquipo } from "@/lib/perdidas-data";
import { cn } from "@/lib/utils";

// ---------- contador que RUEDA ----------
function Contador({ valor }: { valor: number }) {
  const [mostrado, setMostrado] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const desde = prev.current;
    prev.current = valor;
    const t0 = performance.now();
    let raf = 0;
    const paso = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      const e = 1 - Math.pow(1 - p, 3);
      setMostrado(Math.round(desde + (valor - desde) * e));
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return <>{mostrado.toLocaleString("es-ES")}</>;
}

// ---------- siluetas SVG ----------
function Silueta({ tipo, color }: { tipo: string; color: string }) {
  const common = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 40 24" className="w-9 h-6 shrink-0 opacity-80">
      {tipo === "tanque" && (<g {...common}><rect x="6" y="13" width="26" height="6" rx="3" /><rect x="13" y="8" width="12" height="5" /><line x1="20" y1="8" x2="38" y2="5" /><circle cx="11" cy="16" r="1.4" /><circle cx="16" cy="16" r="1.4" /><circle cx="21" cy="16" r="1.4" /><circle cx="26" cy="16" r="1.4" /></g>)}
      {tipo === "blindado" && (<g {...common}><rect x="7" y="11" width="24" height="7" rx="2" /><path d="M10 11 L13 6 H26 L29 11" /><circle cx="13" cy="18" r="1.6" /><circle cx="20" cy="18" r="1.6" /><circle cx="27" cy="18" r="1.6" /></g>)}
      {tipo === "obus" && (<g {...common}><line x1="8" y1="18" x2="30" y2="6" /><rect x="12" y="14" width="10" height="5" /><circle cx="14" cy="20" r="1.6" /><circle cx="22" cy="20" r="1.6" /></g>)}
      {tipo === "radar" && (<g {...common}><rect x="12" y="14" width="16" height="5" /><path d="M20 14 L20 8" /><path d="M12 8 Q20 2 28 8" /><circle cx="20" cy="8" r="1.2" /></g>)}
      {tipo === "avion" && (<g {...common}><path d="M4 14 L20 10 L36 12 L34 16 L18 16 Z" /><line x1="18" y1="11" x2="18" y2="5" /><line x1="30" y1="12" x2="34" y2="8" /></g>)}
      {tipo === "dron" && (<g {...common}><path d="M14 12 L26 12 L24 17 L16 17 Z" /><line x1="14" y1="12" x2="8" y2="7" /><line x1="26" y1="12" x2="32" y2="7" /><circle cx="7" cy="6" r="2" /><circle cx="33" cy="6" r="2" /></g>)}
      {tipo === "buque" && (<g {...common}><path d="M6 16 H34 L30 21 H10 Z" /><rect x="16" y="9" width="9" height="7" /><line x1="20" y1="9" x2="20" y2="4" /></g>)}
    </svg>
  );
}

export function PerdidasPanel() {
  const dia = Math.floor(Date.now() / 86400000);
  const cats = useMemo(() => generarPerdidas(dia % 30), [dia]);
  const [lado, setLado] = useState<"TODOS" | "AZUL" | "ROJO">("TODOS");
  const [estadoF, setEstadoF] = useState<EstadoEquipo | "TODOS">("TODOS");
  const [abiertas, setAbiertas] = useState<Set<string>>(() => new Set(["tanques"]));

  const { azul, rojo } = useMemo(() => totalesPorLado(cats), [cats]);
  const total = azul + rojo;
  const fotos = total * 3 + (dia % 17);

  const filtrados = useMemo(
    () =>
      cats.map((c) => ({
        ...c,
        items: c.items
          .filter((it) => lado === "TODOS" || it.lado === lado)
          .map((it) => {
            const d = it.destruido + it.danado + it.abandonado + it.capturado;
            return estadoF === "TODOS"
              ? { ...it, total: d }
              : { ...it, total: estadoF === "DESTRUIDO" ? it.destruido : estadoF === "DAÑADO" ? it.danado : estadoF === "ABANDONADO" ? it.abandonado : it.capturado };
          }),
      })),
    [cats, lado, estadoF]
  );

  const toggle = (id: string) =>
    setAbiertas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const colorLado = (l: "AZUL" | "ROJO") => (l === "AZUL" ? "#3DDCFF" : "#FF6B6B");

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Pérdidas Confirmadas"
        subtitle="Registro visual: solo se cuenta lo documentado con evidencia"
        icon={<Truck className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-2 py-1 border border-red-hud/60 text-red-hud bg-red-hud/10">
            <Camera className="w-3 h-3" /> {fotos.toLocaleString("es-ES")} EVIDENCIAS
          </span>
        }
      />
      <HeroOro panel="perdidas" />

      {/* TOTALES */}
      <div className="grid grid-cols-3 gap-2">
        <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="hud-panel p-3 text-center">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1">azul · equipos perdidos</p>
          <p className="text-2xl font-bold font-mono" style={{ color: "#3DDCFF" }}>
            <Contador valor={azul} />
          </p>
        </motion.div>
        <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.08 }} className="hud-panel p-3 text-center">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1">total documentado</p>
          <p className="text-2xl font-bold font-mono text-foreground">
            <Contador valor={total} />
          </p>
        </motion.div>
        <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.16 }} className="hud-panel p-3 text-center">
          <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1">rojo · equipos perdidos</p>
          <p className="text-2xl font-bold font-mono" style={{ color: "#FF6B6B" }}>
            <Contador valor={rojo} />
          </p>
        </motion.div>
      </div>

      {/* FILTROS */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
          <ShieldHalf className="w-3 h-3" /> lado
        </span>
        {(["TODOS", "AZUL", "ROJO"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLado(l)}
            className={cn(
              "text-[10px] font-mono uppercase px-2.5 py-1 border transition-all active:scale-95",
              lado === l ? "border-red-hud text-red bg-red-hud/20" : "border-border text-muted-foreground hover:border-red-hud/50"
            )}
          >
            {l === "TODOS" ? "ambos" : `fuerza ${l.toLowerCase()}`}
          </button>
        ))}
        <span className="text-[9px] font-mono uppercase text-muted-foreground ml-2">estado</span>
        <button
          onClick={() => setEstadoF("TODOS")}
          className={cn("text-[10px] font-mono uppercase px-2 py-1 border transition-all", estadoF === "TODOS" ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border text-muted-foreground")}
        >
          todos
        </button>
        {ESTADOS_META.map((e) => (
          <button
            key={e.id}
            onClick={() => setEstadoF(e.id)}
            className="text-[10px] font-mono uppercase px-2 py-1 border transition-all active:scale-95"
            style={estadoF === e.id ? { borderColor: e.color, color: e.color, background: `${e.color}22` } : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            {e.nombre.toLowerCase()}
          </button>
        ))}
      </div>

      {/* LIBRO CONTABLE */}
      <div className="space-y-2">
        {filtrados.map((c, ci) => {
          const abierta = abiertas.has(c.id);
          const sub = c.items.reduce((s, it) => s + it.total, 0);
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.05 }} className="hud-panel overflow-hidden">
              <button onClick={() => toggle(c.id)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-amber-hud/5 transition-colors">
                <Silueta tipo={c.icono} color="#FFB020" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex-1 text-left">{c.nombre}</span>
                <span className="text-sm font-mono font-bold text-red-hud">
                  <Contador valor={sub} />
                </span>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", abierta && "rotate-180")} />
              </button>
              {abierta && (
                <div className="border-t border-border/60">
                  <div className="hidden sm:grid grid-cols-[1fr_repeat(4,minmax(52px,64px))_64px] gap-1 px-3 py-1.5 border-b border-border/40 bg-background/60">
                    <span className="text-[8px] font-mono uppercase text-muted-foreground">modelo · evidencia</span>
                    {ESTADOS_META.map((e) => (
                      <span key={e.id} className="text-[8px] font-mono uppercase text-center" style={{ color: e.color }}>
                        {e.nombre}
                      </span>
                    ))}
                    <span className="text-[8px] font-mono uppercase text-muted-foreground text-center">total</span>
                  </div>
                  {c.items.map((it, ii) => (
                    <motion.div
                      key={it.modelo}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: ii * 0.04 }}
                      className="grid grid-cols-[36px_1fr_repeat(4,40px)_48px] sm:grid-cols-[1fr_repeat(4,minmax(52px,64px))_64px] items-center gap-1 px-3 py-1.5 border-b border-border/30 last:border-0 hover:bg-background/50"
                    >
                      <span className="sm:hidden"><Silueta tipo={c.icono} color={colorLado(it.lado)} /></span>
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="hidden sm:inline text-[9px] font-mono font-bold px-1" style={{ color: colorLado(it.lado) }}>
                          {it.lado}
                        </span>
                        <span className="text-[11px] text-foreground/90 truncate">{it.modelo}</span>
                        <span className="flex items-center gap-0.5 text-[8px] font-mono text-muted-foreground shrink-0">
                          <Camera className="w-2.5 h-2.5" /> {(it.total * 2 + 1).toString()}
                        </span>
                      </span>
                      <span className="text-[11px] font-mono text-center" style={{ color: ESTADOS_META[0].color }}>{it.destruido || "—"}</span>
                      <span className="text-[11px] font-mono text-center" style={{ color: ESTADOS_META[1].color }}>{it.danado || "—"}</span>
                      <span className="text-[11px] font-mono text-center" style={{ color: ESTADOS_META[2].color }}>{it.abandonado || "—"}</span>
                      <span className="text-[11px] font-mono text-center" style={{ color: ESTADOS_META[3].color }}>{it.capturado || "—"}</span>
                      <span className="text-[12px] font-mono font-bold text-foreground text-center">{it.total}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground text-center">
        registro espejo con datos ficticios · metodología idéntica: cada cuenta requiere evidencia visual documentada
      </p>
    </div>
  );
}
