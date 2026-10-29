"use client";

// v95.0 EXPEDIENTE TOTAL — EL ESPEJO DE VANGUARD
// "Una misma noticia, distintas perspectivas."
// Cada crisis del mundo Vanguard contada por las seis salas del ecosistema
// OSINT: lo que cada medio pone en portada, lo que omite y lo que cuestiona.
// Matriz de verificación con convergencia por hecho, nota editorial de la
// Mesa y síntesis con el núcleo neuronal. Contenido SIM del mundo Vanguard,
// declarado como tal; el método (confirmado/omitido/en disputa) es el real.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FlipHorizontal2, CheckCircle2, EyeOff, HelpCircle, ChevronDown, Hourglass,
  ShieldCheck, Bell, BellRing, Newspaper, FlaskConical, Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { navigateTo } from "@/lib/nav";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { ExpedienteDrawer } from "@/components/vanguard/expediente-drawer";
import { CRISIS, convergenciaDe, medioPorId, type CrisisVG } from "@/lib/expediente-data";
import { useExpediente } from "@/lib/expediente-store";
import { evaluarNeuronal, fnvHash, predecir, bucketMinutos } from "@/lib/neurona-core";
import { dayKeyUtc } from "@/lib/googles";
// v122 SEÑALES REALES: los cables de la casa junto al espejo SIM (separación honesta)
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";

const ESTADO_META = {
  confirmado: { label: "CONFIRMADO", color: "#4DFFC4" },
  disputado: { label: "DISPUTADO", color: "#FFC94D" },
  investigacion: { label: "EN INVESTIGACIÓN", color: "#B48CFF" },
} as const;

function tensionActual(c: CrisisVG): number {
  if (c.fases && c.fases.length > 0) return c.fases[c.fases.length - 1].tension;
  const h = fnvHash(`espejo95:${c.id}:${dayKeyUtc()}`);
  return 55 + (h % 30);
}

function ChipEstado({ estado }: { estado: keyof typeof ESTADO_META }) {
  const m = ESTADO_META[estado];
  return (
    <span
      className="rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider"
      style={{ color: m.color, borderColor: `${m.color}66`, background: `${m.color}14` }}
    >
      {m.label}
    </span>
  );
}

function MediosCard({ crisis, p, abierto, onToggle, idx }: {
  crisis: CrisisVG;
  p: CrisisVG["perspectivas"][number];
  abierto: boolean;
  onToggle: () => void;
  idx: number;
}) {
  const medio = medioPorId(p.medio);
  return (
    <motion.div
      className="overflow-hidden rounded-2xl border bg-black/40"
      style={{ borderColor: `${medio.color}44` }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.35 }}
    >
      <button onClick={onToggle} className="block w-full text-left transition hover:bg-white/[0.03]">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${medio.color}, transparent)` }} />
        <div className="p-3.5">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{medio.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] font-black" style={{ color: medio.color }}>{medio.nombre}</span>
                <span
                  className={cn(
                    "rounded-full border px-1.5 py-0.5 text-[8px] font-black tracking-wider",
                    medio.tipo === "INSTITUCIONAL" && "border-cyan-400/50 text-cyan-300",
                    medio.tipo === "INDEPENDIENTE" && "border-emerald-400/50 text-emerald-300",
                    medio.tipo === "SIN VERIFICAR" && "border-red-400/60 text-red-300",
                  )}
                >
                  {medio.tipo}
                </span>
                <span className="text-[9px] font-semibold text-white/30">{medio.handle}</span>
              </div>
              <p className="mt-1.5 text-[13px] font-bold leading-snug text-amber-100/90">“{p.titular}”</p>
            </div>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 text-white/40 transition-transform duration-300", abierto && "rotate-180")}
            />
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="space-y-2.5 border-t border-white/8 px-3.5 pb-3.5 pt-3">
              {p.destaca.length > 0 && (
                <div>
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-300/80">
                    <CheckCircle2 className="h-3 w-3" /> pone en portada
                  </span>
                  <div className="mt-1 space-y-1">
                    {p.destaca.map((i) => (
                      <p key={i} className="rounded-lg bg-emerald-400/8 px-2 py-1 text-[11px] font-semibold leading-snug text-emerald-100/85">
                        {crisis.hechos[i]?.texto}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {p.omite.length > 0 && (
                <div>
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/45">
                    <EyeOff className="h-3 w-3" /> no menciona
                  </span>
                  <div className="mt-1 space-y-1">
                    {p.omite.map((i) => (
                      <p key={i} className="rounded-lg bg-white/5 px-2 py-1 text-[11px] font-semibold leading-snug text-white/45">
                        {crisis.hechos[i]?.texto}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {p.disputa.length > 0 && (
                <div>
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-300/80">
                    <HelpCircle className="h-3 w-3" /> cuestiona abiertamente
                  </span>
                  <div className="mt-1 space-y-1">
                    {p.disputa.map((i) => (
                      <p key={i} className="rounded-lg bg-amber-400/8 px-2 py-1 text-[11px] font-semibold leading-snug text-amber-100/80">
                        {crisis.hechos[i]?.texto}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-violet-400/25 bg-violet-400/8 px-2.5 py-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-violet-300">nota de la mesa</span>
                <p className="mt-0.5 text-[11px] leading-snug text-violet-100/80">{p.nota}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function EspejoPanel() {
  const crisisSel = useExpediente((s) => s.crisisSel);
  const setCrisis = useExpediente((s) => s.setCrisis);
  const vigilados = useExpediente((s) => s.vigilados);
  const toggleVigilado = useExpediente((s) => s.toggleVigilado);

  const crisis = CRISIS.find((c) => c.id === crisisSel) ?? CRISIS[0];
  const convergencia = useMemo(() => convergenciaDe(crisis), [crisis]);
  const veredicto = useMemo(
    () => evaluarNeuronal(`${crisis.nombre} ${crisis.resumen} ${crisis.hechos.map((h) => h.texto).join(" ")}`, 3),
    [crisis],
  );
  // v100: proyección v4 del Espejo — la misma crisis alimenta el LABORATORIO
  const proyeccion = useMemo(
    () => predecir(`${crisis.nombre} ${crisis.resumen} ${crisis.hechos.map((h) => h.texto).join(" ")}`, bucketMinutos(240)),
    [crisis],
  );
  const [abierto, setAbierto] = useState<string | null>(crisis.perspectivas[0]?.medio ?? null);

  // ===== v122 SEÑALES REALES DE AHORA (bloque honesto: SIM ≠ REAL) =====
  // El espejo cuenta el mundo Vanguard (SIM); debajo, los cables REALES
  // que la casa recibe ahora mismo, leídos en la SALA DE LECTURA interna.
  const [cablesReales, setCablesReales] = useState<CableLectura[]>([]);
  const [cableSelReal, setCableSelReal] = useState<CableLectura | null>(null);
  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      try {
        const r = await fetch("/api/news", { cache: "no-store" });
        const j = await r.json();
        if (!vivo || !Array.isArray(j?.items)) return;
        const cs: CableLectura[] = (j.items as Record<string, unknown>[]).map((it) => ({
          id: String(it.id ?? it.url ?? Math.random().toString(36).slice(2)),
          title: String(it.title ?? ""),
          url: String(it.url ?? ""),
          source: String(it.source ?? "casa"),
          publishedAt: String(it.publishedAt ?? new Date().toISOString()),
          tacticalTag: (it.tacticalTag as string) ?? null,
          conflictTag: (it.conflictTag as string) ?? null,
          sourceCountry: (it.sourceCountry as string) ?? null,
        })).filter((c) => c.title.length > 12).slice(0, 4);
        if (cs.length > 0) setCablesReales(cs);
      } catch { /* el espejo vive sin señales */ }
    };
    cargar();
    const id = setInterval(cargar, 300000);
    return () => { vivo = false; clearInterval(id); };
  }, []);

  // v168: PARIDAD 2D→3D — la sala ESPEJO emite la crisis activa: las seis salas
  // con su titular (desplegables), la matriz de verificación y los cables reales.
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const filas: FilaContenido3D[] = crisis.perspectivas.map((p) => {
      const medio = medioPorId(p.medio);
      return {
        t: `${medio.emoji} ${medio.nombre}`,
        v: medio.tipo,
        color: medio.color,
        d: `“${p.titular}” · nota de la mesa: ${p.nota}`,
        a: "desplegar sala",
      };
    });
    crisis.hechos.slice(0, 3).forEach((h, i) => {
      const conv = convergencia[i];
      filas.push({
        t: h.texto,
        v: `${conv.menciona}/${conv.total} SALAS`,
        p: Math.round((conv.menciona / Math.max(1, conv.total)) * 100),
        color: ESTADO_META[h.estado].color,
        d: conv.disputan > 0 ? `${conv.disputan} salas la disputan abiertamente` : "convergencia entre salas sin disputa",
      });
    });
    filas.push({
      t: "NÚCLEO NEURONAL",
      v: `RIESGO ${Math.round(veredicto.riesgo)}`,
      p: Math.round(veredicto.riesgo),
      color: "#B48CFF",
      d: `${veredicto.sentimiento} · tensión ${Math.round(veredicto.tension)} · confianza ${Math.round(veredicto.confianza)} · proyección: ${proyeccion.escenarios[0]?.nombre ?? "—"} ${proyeccion.escenarios[0]?.probabilidad ?? 0}%`,
    });
    for (const cab of cablesReales.slice(0, 2)) {
      filas.push({
        t: cab.title,
        v: cab.tacticalTag ?? "INFO",
        color: cab.tacticalTag === "ALERTA" ? "#FF6B60" : "#7DD3FC",
        d: `REAL · cable de la casa: ${cab.source}`,
        a: "leer cable",
      });
    }
    return filas;
  }, [crisis, convergencia, veredicto, proyeccion, cablesReales]);
  // v168: el raycast 3D despliega la MISMA sala de medio que el botón 2D y
  // abre el MISMO lector de cables (las filas de cable van al final del array)
  useEffect(() => {
    const onAccion = (e: Event) => {
      const det = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (det?.tab !== "espejo") return;
      if (det.accion === "desplegar sala") {
        const p = crisis.perspectivas[det.idx];
        if (p) setAbierto((v) => (v === p.medio ? null : p.medio));
      } else if (det.accion === "leer cable") {
        const ncables = Math.min(cablesReales.length, 2);
        const cab = cablesReales[det.idx - (filas3D.length - ncables)];
        if (cab) setCableSelReal(cab);
      }
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [crisis, cablesReales, filas3D]);
  useSala3DContenido(
    "espejo",
    "EL ESPEJO DE VANGUARD",
    "#FBBF24",
    `Una misma noticia, distintas perspectivas · ${crisis.nombre} · tensión ${tensionActual(crisis)}`,
    filas3D,
  );

  const vigila = vigilados.some((v) => v.toLowerCase() === crisis.nombre.toLowerCase());

  return (
    <div className="mx-auto max-w-6xl px-3 pb-24 pt-2 sm:px-4">
      <HeroOro panel="espejo" />

      {/* selector de crisis */}
      <div className="vg-chips mt-3 flex gap-2 overflow-x-auto pb-1">
        {CRISIS.map((c, i) => {
          const activa = c.id === crisis.id;
          return (
            <motion.button
              key={c.id}
              onClick={() => { setCrisis(c.id); setAbierto(null); }}
              className={cn(
                "shrink-0 rounded-xl border px-3 py-2 text-left transition active:scale-95",
                activa ? "border-red-400/60 bg-red-400/10" : "border-white/12 bg-white/5 hover:border-white/25",
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="text-[12px] font-black text-white/90">{c.nombre}</div>
              <div className="text-[9px] font-semibold text-white/40">{c.region}</div>
            </motion.button>
          );
        })}
      </div>

      {/* v122: SEÑALES REALES DE AHORA — SIM y REAL nunca se mezclan */}
      {cablesReales.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-cyan-400/25 bg-[radial-gradient(ellipse_at_80%_0%,rgba(56,189,248,0.08),transparent_55%),#0a0d12] p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-300">
              <Radio className="h-3.5 w-3.5 blink-soft" /> señales reales de ahora
            </span>
            <span className="rounded-full border border-cyan-400/50 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-cyan-300">
              REAL · cables de la casa
            </span>
            <span className="text-[9px] font-semibold text-white/35 ml-auto">el espejo de arriba cuenta el mundo Vanguard (SIM)</span>
          </div>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {cablesReales.map((cab) => (
              <button
                key={cab.id}
                onClick={() => setCableSelReal(cab)}
                className="text-left rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 transition hover:border-cyan-400/40 active:scale-[0.99] group"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="shrink-0 rounded px-1 py-0.5 text-[8px] font-black tracking-wider"
                    style={{
                      color: cab.tacticalTag === "ALERTA" ? "#FF6B60" : "#7DD3FC",
                      border: `1px solid ${cab.tacticalTag === "ALERTA" ? "#FF6B6066" : "#7DD3FC44"}`,
                    }}
                  >
                    {cab.tacticalTag ?? "INFO"}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/35 shrink-0">{cab.source}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11.5px] font-semibold leading-snug text-white/80 group-hover:text-white">{cab.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* cabecera de crisis */}
      <motion.div
        key={crisis.id}
        className="mt-3 overflow-hidden rounded-2xl border border-red-400/25 bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,59,48,0.10),transparent_55%),#0b0b11] p-4"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-300">
            <FlipHorizontal2 className="h-3.5 w-3.5" /> una crisis · seis salas
          </span>
          <span className="rounded-full border border-amber-400/50 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-amber-300">
            SIM · mundo Vanguard
          </span>
        </div>
        <h3 className="mt-1.5 text-xl font-black text-amber-100">{crisis.nombre}</h3>
        <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-white/70">{crisis.resumen}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {/* medidor de tensión */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/45">tensión de la crisis</span>
            <div className="h-2 w-36 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${tensionActual(crisis)}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
            <span className="text-[11px] font-black text-orange-300">{tensionActual(crisis)}</span>
          </div>
          <button
            onClick={() => { setCrisis(crisis.id); navigateTo("maquina" as never); }}
            className="flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-[11px] font-black text-amber-300 transition hover:bg-amber-400/20 active:scale-95"
          >
            <Hourglass className="h-3.5 w-3.5" /> VER CRONOLOGÍA
          </button>
          {/* v100: EL ESPEJO → LABORATORIO DEL DESTINO */}
          <button
            onClick={() => {
              try { sessionStorage.setItem("vg-whatif-crisis", crisis.id); } catch { /* noop */ }
              toast(`¿Y SI...? llevando ${crisis.nombre} al laboratorio`, { duration: 2600, icon: "🧪" });
              navigateTo("laboratorio" as never);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-sky-400/50 bg-sky-400/15 px-3 py-1.5 text-[11px] font-black text-sky-300 transition hover:bg-sky-400/25 active:scale-95"
          >
            <FlaskConical className="h-3.5 w-3.5" /> ¿Y SI...?
          </button>
          <button
            onClick={() => {
              const activo = toggleVigilado(crisis.nombre);
              toast(activo ? `Vigilando: ${crisis.nombre}` : `Vigilancia retirada: ${crisis.nombre}`, { duration: 2200 });
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-black transition active:scale-95",
              vigila ? "border-amber-400/60 bg-amber-400/15 text-amber-300" : "border-white/15 bg-white/5 text-white/60 hover:text-amber-300",
            )}
          >
            {vigila ? <BellRing className="h-3.5 w-3.5 vg-lateja" /> : <Bell className="h-3.5 w-3.5" />}
            {vigila ? "VIGILADA" : "VIGILAR"}
          </button>
        </div>
      </motion.div>

      {/* las seis salas */}
      <div className="mt-4 grid gap-2.5 md:grid-cols-2">
        {crisis.perspectivas.map((p, i) => (
          <MediosCard
            key={p.medio}
            crisis={crisis}
            p={p}
            idx={i}
            abierto={abierto === p.medio}
            onToggle={() => setAbierto((v) => (v === p.medio ? null : p.medio))}
          />
        ))}
      </div>

      {/* matriz de verificación */}
      <motion.div
        className="mt-4 rounded-2xl border border-white/12 bg-black/40 p-4"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/45">
            <ShieldCheck className="h-3.5 w-3.5" /> matriz de verificación · convergencia entre salas
          </span>
          <span className="hidden text-[10px] font-semibold text-white/30 sm:block">
            cuántas de las {crisis.perspectivas.length} salas mencionan cada hecho
          </span>
        </div>
        <div className="mt-3 space-y-2.5">
          {crisis.hechos.map((h, i) => {
            const conv = convergencia[i];
            return (
              <motion.div
                key={i}
                className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ChipEstado estado={h.estado} />
                  <p className="flex-1 text-[12px] font-semibold leading-snug text-white/85">{h.texto}</p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {Array.from({ length: conv.total }, (_, k) => (
                      <motion.span
                        key={k}
                        className="h-1.5 flex-1 rounded-full"
                        style={{ background: k < conv.menciona ? "#4DFFC4" : "rgba(255,255,255,0.09)", originX: 0 }}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ delay: 0.35 + i * 0.05 + k * 0.03 }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-emerald-300">{conv.menciona}/{conv.total}</span>
                  {conv.disputan > 0 && (
                    <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
                      {conv.disputan} la disputan
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* síntesis de la mesa */}
      <motion.div
        className="mt-3 rounded-2xl border border-violet-400/25 bg-violet-400/6 p-4"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-violet-300">
            <Newspaper className="h-3.5 w-3.5" /> síntesis del núcleo neuronal
          </span>
          <span className="rounded-full bg-violet-400/15 px-2 py-0.5 text-[10px] font-black text-violet-200">
            {veredicto.sentimiento} · riesgo {Math.round(veredicto.riesgo)}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            { l: "riesgo", v: veredicto.riesgo, c: "#FF4D4D" },
            { l: "tensión", v: veredicto.tension, c: "#FF8A3D" },
            { l: "confianza", v: veredicto.confianza, c: "#3DDCFF" },
          ].map((b) => (
            <div key={b.l}>
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-white/45">{b.l}</span>
                <span className="text-[11px] font-black" style={{ color: b.c }}>{Math.round(b.v)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: b.c }}
                  initial={{ width: 0 }} animate={{ width: `${b.v}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </div>
        {/* v100: proyección v4 de la crisis — puente con el LABORATORIO */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-xl border border-violet-400/20 bg-black/30 px-2.5 py-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-violet-300">proyección v4 · {proyeccion.horizonte}</span>
          <span className="text-[10.5px] font-bold text-violet-100/80">
            {proyeccion.escenarios[0]?.nombre} {proyeccion.escenarios[0]?.probabilidad}%
          </span>
          <span className="hidden text-[9.5px] font-semibold text-white/40 sm:inline">señal: {proyeccion.escenarios[0]?.señal}</span>
          <button
            onClick={() => {
              try { sessionStorage.setItem("vg-whatif-crisis", crisis.id); } catch { /* noop */ }
              navigateTo("laboratorio" as never);
            }}
            className="ml-auto text-[10px] font-black text-sky-300 underline decoration-sky-400/40 underline-offset-2 transition hover:text-sky-200"
          >
            SIMULAR ESTO →
          </button>
        </div>
        <button
          onClick={() => navigateTo("verifica" as never)}
          className="mt-3 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2 text-[11px] font-black tracking-wide text-black transition hover:brightness-110 active:scale-[0.98]"
        >
          ABRIR LA MESA DE VERIFICACIÓN COMPLETA
        </button>
      </motion.div>

      <p className="mt-3 text-center text-[10px] font-semibold text-white/25">
        Los medios, titulares y disputas son del mundo Vanguard (simulación). El método — separar lo confirmado de lo
        omitido y de lo disputado — es el que EL ESPEJO quiere que uses con la información de verdad.
      </p>

      <ExpedienteDrawer />

      {/* v122: la SALA DE LECTURA de las señales reales — misma sala interna, cero saltos */}
      <LectorNoticia cable={cableSelReal} onCerrar={() => setCableSelReal(null)} />
    </div>
  );
}
