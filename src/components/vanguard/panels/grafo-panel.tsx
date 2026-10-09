"use client";

// v95.0 EXPEDIENTE TOTAL — GRAFO MUNDIAL
// "Un buscador visual del conocimiento geopolítico de Vanguard."
// La red completa del mundo: crisis, naciones, lugares, expedientes, teorías,
// armas, civilizaciones, documentos, papers y medios conectados por aristas
// tipadas. Física en vivo a 60 fps (repulsión + resortes, DOM imperativo para
// no re-renderizar), arrastre de nodos, impulso viajando por las rutas,
// neighborhood highlight, búsqueda con autocompletado y ficha EXPEDIENTE.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, Network, Pause, Play, Layers, MousePointer2, Info, Bell, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { ExpedienteDrawer } from "@/components/vanguard/expediente-drawer";
import {
  NODOS_EXPEDIENTE, ARISTAS_EXPEDIENTE, ARISTA_META, TIPO_META, nodoPorId,
  vecinosDe, buscarNodosExp, nucleo, grados, estadisticasExpediente,
  type TipoNodo, type NodoExp, type AristaExp,
} from "@/lib/expediente-data";
import { useExpediente } from "@/lib/expediente-store";

const W = 1200;
const H = 760;

type P = { x: number; y: number; vx: number; vy: number; fijo?: boolean };

const PREFIJO_TIPO: Record<string, TipoNodo> = {
  lug: "lugar", nac: "nacion", cri: "crisis", exp: "expediente", teo: "teoria",
  arm: "arma", civ: "civil", doc: "documento", pap: "paper", med: "medio",
};

const CENTROS: Record<string, { x: number; y: number }> = {
  crisis: { x: 600, y: 380 },
  nacion: { x: 320, y: 240 },
  medio: { x: 890, y: 290 },
  lugar: { x: 600, y: 165 },
  expediente: { x: 240, y: 555 },
  teoria: { x: 440, y: 645 },
  arma: { x: 770, y: 645 },
  civil: { x: 955, y: 555 },
  documento: { x: 135, y: 395 },
  paper: { x: 1060, y: 430 },
};

function layoutInicial(ids: string[]): Map<string, P> {
  const contadores: Record<string, number> = {};
  const out = new Map<string, P>();
  ids.forEach((id) => {
    const tipo = PREFIJO_TIPO[id.split(":")[0]] ?? "lugar";
    const c = CENTROS[tipo] ?? { x: 600, y: 380 };
    const k = contadores[tipo] ?? 0;
    contadores[tipo] = k + 1;
    const r = 24 + 32 * Math.sqrt(k);
    const th = k * 2.39996323;
    out.set(id, { x: c.x + r * Math.cos(th), y: c.y + r * Math.sin(th) * 0.82, vx: 0, vy: 0 });
  });
  return out;
}

const clampN = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function GrafoPanel() {
  const est = useMemo(() => estadisticasExpediente(), []);
  const gradosMap = useMemo(() => grados(), []);
  const nucleoSet = useMemo(() => nucleo(), []);

  const setEnfoque = useExpediente((s) => s.setEnfoque);
  const enfoque = useExpediente((s) => s.enfoque);
  const visitados = useExpediente((s) => s.visitados);
  const vigilados = useExpediente((s) => s.vigilados);

  // ---- filtros ----
  const [tipoOff, setTipoOff] = useState<Set<string>>(new Set());
  const [soloNucleo, setSoloNucleo] = useState(true);
  const [q, setQ] = useState("");
  const [fisicaOn, setFisicaOn] = useState(true);

  const visibles = useMemo(() => {
    const set = new Set<string>();
    for (const n of NODOS_EXPEDIENTE) {
      if (tipoOff.has(n.tipo)) continue;
      if (soloNucleo && !nucleoSet.has(n.id)) continue;
      set.add(n.id);
    }
    return set;
  }, [tipoOff, soloNucleo, nucleoSet]);

  const aristasVisibles = useMemo(
    () => ARISTAS_EXPEDIENTE.filter((e) => visibles.has(e.a) && visibles.has(e.b)),
    [visibles],
  );

  const nodosVisibles = useMemo(
    () => NODOS_EXPEDIENTE.filter((n) => visibles.has(n.id)),
    [visibles],
  );

  // ---- posiciones + física imperativa ----
  const posRef = useRef<Map<string, P>>(new Map());
  const nodeRefs = useRef<Map<string, SVGGElement | null>>(new Map());
  const edgeRefs = useRef<Map<string, SVGLineElement | null>>(new Map());
  const pulseRefs = useRef<(SVGCircleElement | null)[]>([]);
  const rafRef = useRef(0);
  const dragRef = useRef<{ id: string; movio: boolean; svg?: SVGSVGElement } | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // posiciones iniciales (o preserva las que ya había al cambiar filtros)
  useEffect(() => {
    const m = posRef.current;
    for (const id of visibles) {
      if (!m.has(id)) m.set(id, { x: W / 2, y: H / 2, vx: 0, vy: 0 });
    }
    for (const id of [...m.keys()]) if (!visibles.has(id)) m.delete(id);
    // primera vez: espiral por clúster
    if (m.get(visibles.values().next().value as string)?.x === W / 2) {
      const semillas = layoutInicial([...visibles]);
      for (const [id, p] of semillas) {
        const prev = m.get(id);
        if (prev && (prev.x !== W / 2 || prev.y !== H / 2)) continue;
        m.set(id, p);
      }
    }
  }, [visibles]);

  const vecinosDeHover = useMemo(
    () => (hoverId ? new Set(vecinosDe(hoverId).map((v) => v.nodo.id)) : null),
    [hoverId],
  );

  // primera pintura tras cambiar filtros (el rAF se encarga del resto)
  useEffect(() => {
    const t0 = performance.now() / 1000;
    for (const [id, p] of posRef.current) {
      const g = nodeRefs.current.get(id);
      if (g) g.setAttribute("transform", `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
    }
    for (const e of aristasVisibles) {
      const a = posRef.current.get(e.a);
      const b = posRef.current.get(e.b);
      const ln = edgeRefs.current.get(`${e.a}|${e.b}|${e.tipo}`);
      if (a && b && ln) {
        ln.setAttribute("x1", a.x.toFixed(1));
        ln.setAttribute("y1", a.y.toFixed(1));
        ln.setAttribute("x2", b.x.toFixed(1));
        ln.setAttribute("y2", b.y.toFixed(1));
      }
    }
    for (let k = 0; k < 14; k++) {
      const e = aristasVisibles[k];
      const dot = pulseRefs.current[k];
      if (!e || !dot) continue;
      const a = posRef.current.get(e.a);
      const b = posRef.current.get(e.b);
      if (!a || !b) continue;
      const f = (t0 * 0.22 + k * 0.13) % 1;
      dot.setAttribute("cx", (a.x + (b.x - a.x) * f).toFixed(1));
      dot.setAttribute("cy", (a.y + (b.y - a.y) * f).toFixed(1));
    }
  }, [visibles, aristasVisibles]);

  const paso = useCallback(() => {
    const pos = posRef.current;
    const arr = [...pos.entries()];
    // repulsión O(n²) — ~120 nodos = ~7k pares, sobrado a 60fps
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i][1];
      for (let j = i + 1; j < arr.length; j++) {
        const b = arr[j][1];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 1; }
        const f = 2400 / d2;
        const d = Math.sqrt(d2);
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx -= fx; a.vy -= fy;
        b.vx += fx; b.vy += fy;
      }
    }
    // resortes de aristas
    for (const e of aristasVisibles) {
      const a = pos.get(e.a);
      const b = pos.get(e.b);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const f = (d - 155) * 0.0045;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }
    // gravedad suave al centro
    for (const [, p] of arr) {
      p.vx += (600 - p.x) * 0.0006;
      p.vy += (380 - p.y) * 0.0011;
    }
    // integrar + pintar
    const t = performance.now() / 1000;
    let pi = 0;
    for (const [id, p] of arr) {
      if (p.fijo) { p.vx = 0; p.vy = 0; }
      else {
        p.vx *= 0.86; p.vy *= 0.86;
        p.x = clampN(p.x + p.vx, 34, W - 34);
        p.y = clampN(p.y + p.vy, 28, H - 28);
      }
      const g = nodeRefs.current.get(id);
      if (g) g.setAttribute("transform", `translate(${p.x.toFixed(1)},${p.y.toFixed(1)})`);
    }
    for (const e of aristasVisibles) {
      const a = pos.get(e.a);
      const b = pos.get(e.b);
      const ln = edgeRefs.current.get(`${e.a}|${e.b}|${e.tipo}`);
      if (a && b && ln) {
        ln.setAttribute("x1", a.x.toFixed(1));
        ln.setAttribute("y1", a.y.toFixed(1));
        ln.setAttribute("x2", b.x.toFixed(1));
        ln.setAttribute("y2", b.y.toFixed(1));
      }
    }
    // impulsos viajando por las aristas más conectadas
    for (let k = 0; k < 14; k++) {
      const e = aristasVisibles[k];
      const dot = pulseRefs.current[k];
      if (!e || !dot) continue;
      const a = pos.get(e.a);
      const b = pos.get(e.b);
      if (!a || !b) continue;
      const f = (t * 0.22 + k * 0.13) % 1;
      dot.setAttribute("cx", (a.x + (b.x - a.x) * f).toFixed(1));
      dot.setAttribute("cy", (a.y + (b.y - a.y) * f).toFixed(1));
      pi++;
    }
  }, [aristasVisibles]);

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let vivo = true;
    const loop = () => {
      if (!vivo) return;
      if (fisicaOn && !document.hidden && !reduce) paso();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { vivo = false; cancelAnimationFrame(rafRef.current); };
  }, [paso, fisicaOn]);

  // ---- interacción ----
  const svgRef = useRef<SVGSVGElement | null>(null);
  const aPantalla = (ev: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 600, y: 380 };
    const r = svg.getBoundingClientRect();
    return {
      x: ((ev.clientX - r.left) / r.width) * W,
      y: ((ev.clientY - r.top) / r.height) * H,
    };
  };

  const onNodeDown = (id: string) => (ev: React.PointerEvent) => {
    ev.preventDefault();
    dragRef.current = { id, movio: false, svg: svgRef.current ?? undefined };
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
  };
  const onNodeMove = (ev: React.PointerEvent) => {
    const dr = dragRef.current;
    if (!dr) return;
    const p = posRef.current.get(dr.id);
    if (!p) return;
    const { x, y } = aPantalla(ev);
    if (Math.abs(p.x - x) + Math.abs(p.y - y) > 4) dr.movio = true;
    p.x = clampN(x, 34, W - 34);
    p.y = clampN(y, 28, H - 28);
    p.fijo = true; // lo que el operador coloca, se queda
  };
  const onNodeUp = (id: string) => () => {
    const dr = dragRef.current;
    dragRef.current = null;
    if (dr && !dr.movio) {
      const p = posRef.current.get(id);
      if (p) p.fijo = false;
      setEnfoque(id);
    }
  };

  // ---- búsqueda ----
  const sugerencias = useMemo(() => (q.trim().length >= 2 ? buscarNodosExp(q, 7) : []), [q]);
  const irANodo = useCallback((n: NodoExp) => {
    setQ("");
    const pos = posRef.current;
    if (!visibles.has(n.id)) {
      // traerlo al grafo aunque esté fuera del núcleo
      setTipoOff((prev) => { const nx = new Set(prev); nx.delete(n.tipo); return nx; });
      setSoloNucleo(false);
    }
    pos.set(n.id, { x: W / 2 + (Math.random() - 0.5) * 60, y: H / 2 + (Math.random() - 0.5) * 60, vx: 0, vy: 0, fijo: false });
    setEnfoque(n.id);
  }, [setEnfoque, visibles]);

  const topConectados = useMemo(
    () => [...NODOS_EXPEDIENTE]
      .map((n) => ({ n, d: gradosMap.get(n.id) ?? 0 }))
      .sort((a, b) => b.d - a.d)
      .slice(0, 10),
    [gradosMap],
  );

  const radioDe = (n: NodoExp) => {
    const d = gradosMap.get(n.id) ?? 0;
    const base = n.tipo === "crisis" ? 9 : n.tipo === "nacion" ? 7.5 : n.tipo === "medio" ? 6 : 4.5;
    return Math.min(15, base + d * 0.55);
  };

  const etiquetaVisible = (n: NodoExp) => {
    if (["crisis", "nacion", "medio"].includes(n.tipo)) return true;
    if (hoverId === n.id || enfoque === n.id) return true;
    return (gradosMap.get(n.id) ?? 0) >= 6;
  };

  const dim = (id: string) => {
    if (!vecinosDeHover) return false;
    return id !== hoverId && !vecinosDeHover.has(id);
  };

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-2 sm:px-4">
      <HeroOro panel="grafo" />

      {/* barra de estadísticas */}
      <motion.div
        className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <span className="flex items-center gap-1.5 text-[11px] font-black tracking-wider text-cyan-300">
          <Network className="h-4 w-4" /> GRAFO MUNDIAL v1
        </span>
        <span className="text-[11px] font-semibold text-white/55">
          {est.entidades} entidades · {est.aristas} conexiones · {est.crisis + est.archivo} crisis · {est.medios} salas
        </span>
        <span className="ml-auto hidden items-center gap-1 text-[10px] font-semibold text-white/35 sm:flex">
          <MousePointer2 className="h-3 w-3" /> arrastra un nodo · toca para abrir su expediente
        </span>
      </motion.div>

      {/* buscador + controles */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-300/70" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && sugerencias[0]) irANodo(sugerencias[0]);
              if (e.key === "Escape") setQ("");
            }}
            placeholder="Busca una crisis, nación, lugar, expediente o medio…"
            className="w-full rounded-xl border border-amber-400/25 bg-black/60 py-2.5 pl-9 pr-3 text-[13px] font-semibold text-amber-100 placeholder:text-white/30 focus:border-amber-400/60 focus:outline-none"
          />
          {sugerencias.length > 0 && (
            <div className="vg-auto absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d14]">
              {sugerencias.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => irANodo(s)}
                  className="vg-res flex w-full items-center gap-2 px-3 py-2 text-left"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.acento }} />
                  <span className="flex-1 truncate text-[12px] font-semibold text-white/85">{s.nombre}</span>
                  <span className="text-[9px] font-black tracking-wider" style={{ color: TIPO_META[s.tipo].hex }}>
                    {TIPO_META[s.tipo].tag}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoloNucleo((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-black transition active:scale-95",
              soloNucleo ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300" : "border-white/15 bg-white/5 text-white/50",
            )}
          >
            <Layers className="h-3.5 w-3.5" /> {soloNucleo ? "NÚCLEO" : "TODO"}
          </button>
          <button
            onClick={() => setFisicaOn((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-black transition active:scale-95",
              fisicaOn ? "border-amber-400/50 bg-amber-400/10 text-amber-300" : "border-white/15 bg-white/5 text-white/50",
            )}
          >
            {fisicaOn ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            FÍSICA
          </button>
        </div>
      </div>

      {/* chips de tipo */}
      <div className="vg-chips mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {(Object.keys(TIPO_META) as TipoNodo[]).map((tk) => {
          const off = tipoOff.has(tk);
          const n = est.porTipo[tk] ?? 0;
          return (
            <button
              key={tk}
              onClick={() => setTipoOff((prev) => {
                const nx = new Set(prev);
                if (nx.has(tk)) nx.delete(tk); else nx.add(tk);
                return nx;
              })}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black tracking-wider transition hover:scale-105 active:scale-95",
                off ? "border-white/10 bg-transparent text-white/30 line-through" : "border-white/15 bg-white/5",
              )}
              style={off ? undefined : { color: TIPO_META[tk].hex, borderColor: `${TIPO_META[tk].hex}55` }}
            >
              {TIPO_META[tk].tag} · {n}
            </button>
          );
        })}
      </div>

      {/* lienzo del grafo */}
      <motion.div
        className="relative mt-2 overflow-hidden rounded-2xl border border-white/12 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,178,71,0.07),transparent_60%),#07070c]"
        initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-[58vh] w-full touch-none select-none md:h-[68vh]"
          onPointerMove={onNodeMove}
        >
          <defs>
            <radialGradient id="vg-glow95" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFC94D" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#FFC94D" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#vg-glow95)" />
          {/* rejilla */}
          <g stroke="#ffffff" strokeOpacity="0.04">
            {Array.from({ length: 12 }, (_, i) => (
              <line key={"v" + i} x1={(i + 1) * 100} y1={0} x2={(i + 1) * 100} y2={H} />
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <line key={"h" + i} x1={0} y1={(i + 1) * 95} x2={W} y2={(i + 1) * 95} />
            ))}
          </g>

          {/* aristas */}
          <g>
            {aristasVisibles.map((e: AristaExp) => {
              const k = `${e.a}|${e.b}|${e.tipo}`;
              const activa = hoverId === e.a || hoverId === e.b || enfoque === e.a || enfoque === e.b;
              const atenuada = vecinosDeHover && !activa;
              return (
                <line
                  key={k}
                  ref={(el) => { edgeRefs.current.set(k, el); }}
                  stroke={ARISTA_META[e.tipo].color}
                  strokeOpacity={atenuada ? 0.05 : activa ? 0.85 : 0.3}
                  strokeWidth={activa ? 1.8 : 1}
                  style={{ transition: "stroke-opacity 0.25s ease, stroke-width 0.25s ease" }}
                />
              );
            })}
          </g>

          {/* impulsos en las aristas principales */}
          <g>
            {aristasVisibles.slice(0, 14).map((e, i) => (
              <circle key={"p" + i} ref={(el) => { pulseRefs.current[i] = el; }} r="2.2" fill="#FFD166" opacity="0.9" />
            ))}
          </g>

          {/* nodos */}
          <g>
            {nodosVisibles.map((n, i) => {
              const r = radioDe(n);
              const atenuado = dim(n.id);
              const esHub = ["crisis", "nacion", "medio"].includes(n.tipo);
              return (
                <g
                  key={n.id}
                  ref={(el) => { nodeRefs.current.set(n.id, el); }}
                  style={{
                    cursor: "grab",
                    opacity: atenuado ? 0.12 : 1,
                    transition: "opacity 0.25s ease",
                  }}
                  onPointerDown={onNodeDown(n.id)}
                  onPointerUp={onNodeUp(n.id)}
                  onPointerEnter={() => setHoverId(n.id)}
                  onPointerLeave={() => setHoverId((v) => (v === n.id ? null : v))}
                >
                  {enfoque === n.id && <circle r={r + 7} fill="none" stroke="#FFC94D" strokeWidth="1.6" className="vg-nodo-anillo" />}
                  <motion.circle
                    r={r}
                    fill={`${n.acento}${esHub ? "33" : "22"}`}
                    stroke={n.acento}
                    strokeWidth={esHub ? 2 : 1.2}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: Math.min(0.6, i * 0.006), type: "spring", stiffness: 260, damping: 18 }}
                  />
                  {esHub && <circle r={r + 3.5} fill="none" stroke={n.acento} strokeOpacity="0.35" strokeWidth="0.8" />}
                  {etiquetaVisible(n) && (
                    <text
                      y={r + 11}
                      textAnchor="middle"
                      fontSize={esHub ? 11 : 9.5}
                      fontWeight="800"
                      fill={esHub ? "#FFE9BE" : "#ffffff88"}
                      stroke="#000"
                      strokeWidth="3"
                      style={{ paintOrder: "stroke" }}
                    >
                      {n.nombre.length > 22 ? n.nombre.slice(0, 21) + "…" : n.nombre}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* leyenda de aristas */}
        <div className="vg-chips absolute bottom-2 left-2 right-2 flex gap-1.5 overflow-x-auto rounded-xl bg-black/55 px-2 py-1.5 backdrop-blur-sm">
          {(Object.keys(ARISTA_META) as (keyof typeof ARISTA_META)[]).map((tk) => (
            <span key={tk} className="flex shrink-0 items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/55">
              <span className="h-0.5 w-3 rounded" style={{ background: ARISTA_META[tk].color }} />
              {ARISTA_META[tk].label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* núcleo conectado + vigilados */}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <motion.div
          className="rounded-2xl border border-white/10 bg-black/40 p-3"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
        >
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/45">
            <Info className="h-3.5 w-3.5" /> los nodos más conectados
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {topConectados.map(({ n, d }, i) => (
              <motion.button
                key={n.id}
                onClick={() => setEnfoque(n.id)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/80 transition hover:scale-105 hover:border-amber-400/40 active:scale-95"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.04 }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: n.acento }} />
                {n.nombre}
                <span className="text-[9px] font-black text-white/35">{d}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
        <motion.div
          className="rounded-2xl border border-white/10 bg-black/40 p-3"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
        >
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/45">
            <Bell className="h-3.5 w-3.5" /> tu expediente
          </span>
          <p className="mt-1.5 text-[11px] font-semibold text-white/50">
            {visitados.length} de {est.entidades} entidades abiertas · {vigilados.length} vigiladas
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {vigilados.length === 0 && (
              <span className="text-[11px] text-white/30">Vigila una entidad desde su ficha y aparecerá aquí.</span>
            )}
            {vigilados.map((v) => (
              <span key={v} className="flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-black text-amber-300">
                <BellRing className="h-3 w-3 vg-lateja" /> {v}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <ExpedienteDrawer />
    </div>
  );
}
