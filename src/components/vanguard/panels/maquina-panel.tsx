"use client";

// v95.0 EXPEDIENTE TOTAL — MÁQUINA DEL TIEMPO
// "Elige una crisis y retrocede por sus días: cómo se movió el frente, qué
// cambió y cómo llegó a ser lo que es hoy."
// MODO KARSK VIVO: el teatro determinista de frente-zonas-data (14 días,
// línea que se mueve, área ocupada, localidades que cambian de mano) con
// reproducción automática. MODO FASES: las crisis de Vand, Zenit y Sarn en
// capítulos con teatro esquemático y curva de tensión. MODO ARCHIVO REAL:
// cronologías verificables (MK-ULTRA, STARGATE, PAPERCLIP) marcadas REAL.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Hourglass, Play, Pause, ChevronLeft, ChevronRight, FileText, Landmark,
  Anchor, Crosshair, Radiation, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navigateTo } from "@/lib/nav";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { ExpedienteDrawer } from "@/components/vanguard/expediente-drawer";
import {
  CRISIS, ARCHIVO, nodoPorId, ARISTA_META,
  type CrisisVG, type ArchivoReal, type PinTeatro,
} from "@/lib/expediente-data";
import { useExpediente } from "@/lib/expediente-store";
import {
  puntosFrente, areaOcupada, deltas, LOCALIDADES, controlDe, EJES_PRESION,
  TEATRO_W, TEATRO_H,
} from "@/lib/frente-zonas-data";

const FASES_KARSK = [
  { titulo: "La marea del norte", de: 0, hasta: 4 },
  { titulo: "El pulso del este", de: 5, hasta: 9 },
  { titulo: "La semana decisiva", de: 10, hasta: 13 },
];

const PIN_META: Record<PinTeatro["tipo"], { color: string; icon: typeof Landmark }> = {
  capital: { color: "#FFC94D", icon: Landmark },
  frente: { color: "#FF6B4A", icon: Crosshair },
  puerto: { color: "#3DDCFF", icon: Anchor },
  recurso: { color: "#4DFFC4", icon: Radiation },
};

const CONTROL_COLOR = ["#FF4D4D", "#FFC94D", "#3DDCFF"]; // ocupado, disputado, controlado
const CONTROL_LABEL = ["OCUPADA", "DISPUTADA", "BAJO CONTROL"];

// ---------- teatro del Karsk (vivo) ----------
function TeatroKarsk({ dia }: { dia: number }) {
  const pts = useMemo(() => puntosFrente(dia), [dia]);
  const deltas14 = useMemo(() => deltas(14), []);
  const deltaHoy = useMemo(() => deltas14.find((d) => d.dia === dia)?.delta ?? 0, [deltas14, dia]);
  const area = useMemo(() => areaOcupada(dia), [dia]);
  const controles = useMemo(() => LOCALIDADES.map((l) => controlDe(l, dia)), [dia]);
  const conteo = useMemo(() => {
    const c = [0, 0, 0];
    controles.forEach((k) => c[k]++);
    return c;
  }, [controles]);
  const cambiadas = useMemo(() => deltas14.find((d) => d.dia === dia)?.localidades ?? [], [deltas14, dia]);
  const polyOcupada = `${pts.map(([x, y]) => `${x},${y}`).join(" ")} ${TEATRO_W},${TEATRO_H} ${TEATRO_W},0`;
  const fase = FASES_KARSK.find((f) => dia >= f.de && dia <= f.hasta) ?? FASES_KARSK[2];

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
      {/* mapa */}
      <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#08080e]">
        <AnimatePresence mode="wait">
          <motion.svg
            key={dia}
            viewBox={`0 0 ${TEATRO_W} ${TEATRO_H}`}
            className="block h-auto w-full"
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {/* terreno */}
            <rect width={TEATRO_W} height={TEATRO_H} fill="#0a0a12" />
            <g stroke="#ffffff" strokeOpacity="0.05">
              {Array.from({ length: 8 }, (_, i) => (
                <line key={"gv" + i} x1={(i + 1) * 100} y1={0} x2={(i + 1) * 100} y2={TEATRO_H} />
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <line key={"gh" + i} x1={0} y1={(i + 1) * 90} x2={TEATRO_W} y2={(i + 1) * 90} />
              ))}
            </g>
            {/* área ocupada */}
            <polygon points={polyOcupada} fill="#FF3B30" fillOpacity="0.14" />
            {/* frente */}
            <polyline
              points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
              fill="none"
              stroke="#FF6B4A"
              strokeWidth="3.4"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 7px rgba(255,107,74,0.65))" }}
            />
            {/* ejes de presión */}
            {EJES_PRESION.map((e) => (
              <g key={e.nombre}>
                <line x1={e.x} y1={e.y} x2={e.x - 46 * e.fuerza * e.dir * -1} y2={e.y + 10} stroke="#FFC94D" strokeOpacity="0.5" strokeWidth="1.6" strokeDasharray="6 5" />
                <text x={e.x + 6} y={e.y - 7} fontSize="10" fontWeight="800" fill="#FFC94D" opacity="0.65">
                  {e.nombre}
                </text>
              </g>
            ))}
            {/* localidades */}
            {LOCALIDADES.map((l, i) => {
              const c = controles[i];
              return (
                <g key={l.nombre}>
                  <circle cx={l.x} cy={l.y} r="5.4" fill={`${CONTROL_COLOR[c]}2E`} stroke={CONTROL_COLOR[c]} strokeWidth="1.8" />
                  {cambiadas.includes(l.nombre) && (
                    <circle cx={l.x} cy={l.y} r="10" fill="none" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1.2" className="vg-nodo-anillo" />
                  )}
                  <text x={l.x} y={l.y - 10} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#ffffff99" stroke="#000" strokeWidth="2.6" style={{ paintOrder: "stroke" }}>
                    {l.nombre}
                  </text>
                </g>
              );
            })}
          </motion.svg>
        </AnimatePresence>
        {cambiadas.length > 0 && (
          <div className="absolute left-2 top-2 rounded-lg border border-white/20 bg-black/70 px-2.5 py-1.5 backdrop-blur-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">cambian de mano</span>
            <div className="text-[11px] font-black text-amber-300">{cambiadas.join(" · ")}</div>
          </div>
        )}
      </div>

      {/* panel lateral del día */}
      <div className="flex flex-col gap-2.5">
        <div className="rounded-2xl border border-white/12 bg-black/45 p-3 text-center">
          <div className="text-[9px] font-black uppercase tracking-widest text-white/40">día de campaña</div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={dia}
              className="text-4xl font-black text-amber-300"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.28 }}
            >
              {dia}
            </motion.div>
          </AnimatePresence>
          <div className="text-[10px] font-bold text-white/40">{dia === 13 ? "HOY" : `HACE ${13 - dia} DÍAS`}</div>
        </div>
        <div className="rounded-2xl border border-white/12 bg-black/45 p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">área ocupada</span>
            <span className="text-[13px] font-black text-red-300">{area.toLocaleString("es-ES")} km²</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">delta del día</span>
            <span className={cn("text-[13px] font-black", deltaHoy > 0 ? "text-red-400" : deltaHoy < 0 ? "text-emerald-300" : "text-white/50")}>
              {deltaHoy > 0 ? "+" : ""}{deltaHoy} km²
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {[2, 1, 0].map((k) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: CONTROL_COLOR[k] }} />
                <span className="flex-1 text-[10px] font-bold text-white/50">{CONTROL_LABEL[k]}</span>
                <span className="text-[11px] font-black" style={{ color: CONTROL_COLOR[k] }}>{conteo[k]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/6 p-3">
          <div className="text-[9px] font-black uppercase tracking-widest text-amber-300/80">fase de la campaña</div>
          <div className="mt-0.5 text-[13px] font-black text-amber-100">{fase.titulo}</div>
          <div className="text-[10px] font-semibold text-white/40">días {fase.de}–{fase.hasta}</div>
        </div>
      </div>
    </div>
  );
}

// ---------- teatro esquemático por fases (Vand / Zenit / Sarn) ----------
function TeatroFases({ crisis }: { crisis: CrisisVG }) {
  const [fase, setFase] = useState(0);
  const fases = crisis.fases ?? [];
  const f = fases[Math.min(fase, fases.length - 1)];

  const curva = useMemo(() => {
    if (fases.length < 2) return "";
    const w = 100 / (fases.length - 1);
    return fases.map((x, i) => `${i === 0 ? "M" : "L"} ${i * w} ${100 - x.tension}`).join(" ");
  }, [fases]);

  // el reset de fase se hace remontando el componente con key={crisis.id} en el padre

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
      <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#08080e]">
        <AnimatePresence mode="wait">
          <motion.svg
            key={`${crisis.id}-${fase}`}
            viewBox="0 0 100 100"
            className="block h-auto w-full"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <rect width="100" height="100" fill="#0a0a12" />
            <g stroke="#ffffff" strokeOpacity="0.05">
              {Array.from({ length: 9 }, (_, i) => (
                <line key={"a" + i} x1={(i + 1) * 10} y1={0} x2={(i + 1) * 10} y2={100} />
              ))}
              {Array.from({ length: 9 }, (_, i) => (
                <line key={"b" + i} x1={0} y1={(i + 1) * 10} x2={100} y2={(i + 1) * 10} />
              ))}
            </g>
            {/* masa de tierra esquemática */}
            <path d="M -5 62 Q 18 48 34 55 T 66 52 T 105 60 L 105 105 L -5 105 Z" fill="#ffffff" fillOpacity="0.045" />
            {f?.pins?.map((p, i) => {
              const m = PIN_META[p.tipo];
              const Icon = m.icon;
              return (
                <motion.g
                  key={p.nombre}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 240, damping: 16 }}
                >
                  <circle cx={p.x} cy={p.y} r="9" fill={`${m.color}1E`} stroke={m.color} strokeWidth="0.5" strokeDasharray="2 1.6" />
                  <circle cx={p.x} cy={p.y} r="2.6" fill={m.color} className="vg-pin-late" style={{ transformOrigin: `${p.x}px ${p.y}px` }} />
                  <text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="3.4" fontWeight="800" fill="#ffffffAA" stroke="#000" strokeWidth="0.9" style={{ paintOrder: "stroke" }}>
                    {p.nombre}
                  </text>
                  {/* icono textual: triángulo del tipo */}
                  <text x={p.x} y={p.y + 6.4} textAnchor="middle" fontSize="2.6" fontWeight="900" fill={m.color}>
                    {Icon === Landmark ? "CAP" : Icon === Crosshair ? "FRT" : Icon === Anchor ? "PTO" : "REC"}
                  </text>
                </motion.g>
              );
            })}
          </motion.svg>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="rounded-2xl border border-white/12 bg-black/45 p-3">
          <div className="text-[9px] font-black uppercase tracking-widest text-white/40">capítulo {fase + 1} de {fases.length}</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${crisis.id}-${fase}-t`}
              initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.26 }}
            >
              <div className="text-[15px] font-black leading-tight text-amber-100">{f?.titulo}</div>
              <div className="text-[10px] font-bold text-white/40">{f?.rango}</div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40">tensión</span>
              <span className="text-[13px] font-black text-orange-300">{f?.tension}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${f?.tension ?? 0}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
          {/* curva de tensión de la crisis */}
          <svg viewBox="0 0 100 40" className="mt-2 h-10 w-full">
            <path d={curva} fill="none" stroke="#FF8A3D" strokeWidth="1.6" className="vg-curva" />
            {fases.map((x, i) => (
              <circle
                key={i}
                cx={(100 / (fases.length - 1)) * i}
                cy={40 - x.tension * 0.4}
                r={i === fase ? 2.6 : 1.4}
                fill={i === fase ? "#FFC94D" : "#ffffff55"}
                stroke="#000"
                strokeWidth="0.5"
              />
            ))}
          </svg>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFase((v) => Math.max(0, v - 1))}
            disabled={fase === 0}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 py-2 text-[11px] font-black text-white/70 transition hover:border-amber-400/40 disabled:opacity-30 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" /> ANTES
          </button>
          <button
            onClick={() => setFase((v) => Math.min(fases.length - 1, v + 1))}
            disabled={fase >= fases.length - 1}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-amber-400/40 bg-amber-400/10 py-2 text-[11px] font-black text-amber-300 transition hover:bg-amber-400/20 disabled:opacity-30 active:scale-95"
          >
            DESPUÉS <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- archivo real ----------
function VistaReal({ archivo }: { archivo: ArchivoReal }) {
  const setEnfoque = useExpediente((s) => s.setEnfoque);
  return (
    <div className="rounded-2xl border border-cyan-400/25 bg-[radial-gradient(ellipse_at_80%_0%,rgba(61,220,255,0.08),transparent_55%),#0b0b11] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-cyan-400/50 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-cyan-300">
          REAL · cronología documentada
        </span>
        <span className="text-[10px] font-semibold text-white/40">fuente: {archivo.fuente}</span>
      </div>
      <div className="mt-3 space-y-0">
        {archivo.fases.map((f, i) => (
          <motion.div
            key={f.titulo}
            className="relative border-l-2 border-cyan-400/35 pb-4 pl-5 last:pb-0"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.09, duration: 0.35 }}
          >
            <span className="absolute -left-[7px] top-0.5 h-3 w-3 rounded-full border-2 border-cyan-300 bg-[#0b0b11]" />
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="rounded bg-cyan-400/12 px-1.5 py-0.5 text-[10px] font-black text-cyan-300">{f.rango}</span>
              <span className="text-[13px] font-black text-amber-100">{f.titulo}</span>
            </div>
            <ul className="mt-1 space-y-0.5">
              {f.eventos.map((e, k) => (
                <li key={k} className="text-[12px] leading-snug text-white/70">· {e}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">en el grafo:</span>
        {archivo.enlaces.map((id) => {
          const n = nodoPorId(id);
          if (!n) return null;
          return (
            <button
              key={id}
              onClick={() => setEnfoque(id)}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/80 transition hover:scale-105 hover:border-cyan-400/40 active:scale-95"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: n.acento }} />
              {n.nombre}
            </button>
          );
        })}
        <button
          onClick={() => navigateTo("expedientes" as never)}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-3 py-1.5 text-[11px] font-black text-black transition hover:brightness-110 active:scale-95"
        >
          <FileText className="h-3.5 w-3.5" /> ABRIR ARCHIVO SECRETO
        </button>
      </div>
    </div>
  );
}

// ---------- reproductor del Karsk vivo (estado propio; key remonta) ----------
function KarskPlayer() {
  const [dia, setDia] = useState(13);
  const [play, setPlay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (play) {
      timerRef.current = setInterval(() => {
        setDia((v) => {
          if (v >= 13) { setPlay(false); return 13; }
          return v + 1;
        });
      }, 1500);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [play]);

  return (
    <>
      {/* controles del reproductor */}
      <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-white/12 bg-black/40 p-3 sm:flex-row sm:items-center">
        <button
          onClick={() => {
            // si la campaña terminó, REPRODUCIR la reinicia desde el día 0
            if (!play && dia >= 13) setDia(0);
            setPlay((v) => !v);
          }}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-black transition active:scale-95",
            play ? "bg-gradient-to-r from-red-500 to-orange-500 text-black" : "bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110",
          )}
        >
          {play ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {play ? "PAUSAR LA CAMPAÑA" : "REPRODUCIR 14 DÍAS"}
        </button>
        <input
          type="range"
          min={0}
          max={13}
          value={dia}
          onChange={(e) => { setPlay(false); setDia(parseInt(e.target.value)); }}
          className="vg-slider flex-1"
          aria-label="Línea de tiempo de 14 días"
        />
        <span className="shrink-0 text-[11px] font-black text-white/60">DÍA {dia}/13</span>
        {/* fases */}
        <div className="flex gap-1">
          {FASES_KARSK.map((f) => (
            <button
              key={f.titulo}
              onClick={() => { setPlay(false); setDia(f.de === 0 ? 0 : f.de); }}
              className={cn(
                "rounded-lg border px-2 py-1 text-[9px] font-black transition active:scale-95",
                dia >= f.de && dia <= f.hasta
                  ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
                  : "border-white/10 bg-white/5 text-white/40",
              )}
            >
              {f.titulo.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <TeatroKarsk dia={dia} />
    </>
  );
}

// ---------- panel principal ----------
export function MaquinaPanel() {
  const crisisSel = useExpediente((s) => s.crisisSel);
  const setCrisis = useExpediente((s) => s.setCrisis);

  const opciones = useMemo(
    () => [
      ...CRISIS.map((c) => ({ id: c.id, kind: "sim" as const, c })),
      ...ARCHIVO.map((a) => ({ id: `arc-${a.id}`, kind: "real" as const, a })),
    ],
    [],
  );
  const sel = opciones.find((o) => o.id === crisisSel) ?? opciones[0];

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-2 sm:px-4">
      <HeroOro panel="maquina" />

      {/* selector de líneas temporales */}
      <div className="vg-chips mt-3 flex gap-2 overflow-x-auto pb-1">
        {opciones.map((o, i) => {
          const activa = o.id === sel.id;
          const real = o.kind === "real";
          return (
            <motion.button
              key={o.id}
              onClick={() => setCrisis(o.id)}
              className={cn(
                "shrink-0 rounded-xl border px-3 py-2 text-left transition active:scale-95",
                activa
                  ? real ? "border-cyan-400/60 bg-cyan-400/10" : "border-amber-400/60 bg-amber-400/10"
                  : "border-white/12 bg-white/5 hover:border-white/25",
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-center gap-1.5 text-[12px] font-black text-white/90">
                {real && <CalendarDays className="h-3 w-3 text-cyan-300" />}
                {o.kind === "sim" ? o.c.nombre : o.a.nombre}
              </div>
              <div className="text-[9px] font-semibold text-white/40">
                {real ? o.a.rango : o.c.region}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* cabecera */}
      <motion.div
        key={sel.id}
        className="mt-3 rounded-2xl border border-white/12 bg-black/40 p-4"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300">
            <Hourglass className="h-3.5 w-3.5" /> máquina del tiempo
          </span>
          {sel.kind === "sim" ? (
            <span className="rounded-full border border-amber-400/50 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-amber-300">
              SIM · mundo Vanguard
            </span>
          ) : (
            <span className="rounded-full border border-cyan-400/50 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-cyan-300">
              REAL · archivo
            </span>
          )}
        </div>
        <h3 className="mt-1 text-xl font-black text-amber-100">
          {sel.kind === "sim" ? sel.c.nombre : sel.a.nombre}
        </h3>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-white/70">
          {sel.kind === "sim" ? sel.c.resumen : sel.a.resumen}
        </p>
      </motion.div>

      {/* cuerpo */}
      <div className="mt-3">
        {sel.kind === "real" ? (
          <VistaReal archivo={sel.a} />
        ) : sel.c.modo === "karsk-vivo" ? (
          <KarskPlayer key={sel.id} />
        ) : (
          <TeatroFases key={sel.c.id} crisis={sel.c} />
        )}
      </div>

      {/* eventos de crisis SIM (fases) */}
      {sel.kind === "sim" && sel.c.modo === "fases" && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {sel.c.hechos.map((h, i) => (
            <motion.div
              key={i}
              className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <p className="text-[12px] font-semibold leading-snug text-white/80">{h.texto}</p>
            </motion.div>
          ))}
        </div>
      )}

      <p className="mt-3 text-center text-[10px] font-semibold text-white/25">
        Las crisis SIM son del mundo Vanguard (simulación jugable). Las cronologías marcadas REAL resumen documentos
        públicos desclasificados con su fuente nombrada — fechas y hechos verificables, redacción propia de Vanguard.
      </p>

      <ExpedienteDrawer />
    </div>
  );
}
