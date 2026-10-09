"use client";

// v95.0 EXPEDIENTE TOTAL — DRAWER DE EXPEDIENTE (ficha unificada)
// La pieza que conecta el GRAFO, EL ESPEJO y la MÁQUINA DEL TIEMPO: cualquier
// entidad del mundo Vanguard abre aquí su ficha con veredicto neuronal,
// conexiones tipadas, acciones de salto a su sala y botón de vigilancia.

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Network, Bell, BellRing, Hourglass, FlipHorizontal2, ExternalLink, BrainCircuit, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { navigateTo } from "@/lib/nav";
import { useGameStore } from "@/lib/game-store";
import { evaluarNeuronal } from "@/lib/neurona-core";
import {
  nodoPorId, vecinosDe, crisisDeActores, TIPO_META, ARISTA_META,
  type NodoExp,
} from "@/lib/expediente-data";
import { useExpediente, ARCHIVO_REWARD } from "@/lib/expediente-store";

function ChipCapa({ capa }: { capa: NodoExp["capa"] }) {
  const sim = capa === "SIM";
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-black tracking-wider",
        sim ? "border-amber-400/50 text-amber-300 bg-amber-400/10" : "border-cyan-400/50 text-cyan-300 bg-cyan-400/10",
      )}
    >
      {sim ? "SIM · mundo Vanguard" : "REAL · archivo"}
    </span>
  );
}

function BarraVeredicto({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-[10px] font-bold uppercase tracking-wider text-white/50">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${valor}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <span className="w-7 shrink-0 text-right text-[10px] font-black" style={{ color }}>{Math.round(valor)}</span>
    </div>
  );
}

export function ExpedienteDrawer() {
  const enfoque = useExpediente((s) => s.enfoque);
  const setEnfoque = useExpediente((s) => s.setEnfoque);
  const marcarVisitado = useExpediente((s) => s.marcarVisitado);
  const registrarArchivo = useExpediente((s) => s.registrarArchivo);
  const setCrisis = useExpediente((s) => s.setCrisis);
  const vigilados = useExpediente((s) => s.vigilados);
  const toggleVigilado = useExpediente((s) => s.toggleVigilado);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);

  const nodo = enfoque ? nodoPorId(enfoque) : undefined;
  const vecinos = useMemo(() => (enfoque ? vecinosDe(enfoque) : []), [enfoque]);
  const crisis = useMemo(() => (enfoque ? crisisDeActores(enfoque) : []), [enfoque]);
  const veredicto = useMemo(
    () => (nodo ? evaluarNeuronal(`${nodo.nombre} ${nodo.resumen}`, Math.min(4, vecinos.length)) : null),
    [nodo, vecinos.length],
  );

  // recompensa ANALISTA DE ARCHIVO: fichas nuevas pagan, con cuota diaria
  useEffect(() => {
    if (!nodo) return;
    const pago = registrarArchivo(nodo.id);
    marcarVisitado(nodo.id);
    if (pago) {
      addCoins(ARCHIVO_REWARD.coins, "Analista de archivo (ficha nueva)");
      addXp(ARCHIVO_REWARD.xp);
      toast.success(`Analista de archivo +${ARCHIVO_REWARD.coins}ⓒ +${ARCHIVO_REWARD.xp} XP`, { duration: 2600 });
    }
  }, [nodo?.id]);

  const meta = nodo ? TIPO_META[nodo.tipo] : null;
  const vigila = nodo ? vigilados.some((v) => v.toLowerCase() === nodo.nombre.toLowerCase()) : false;

  return (
    <AnimatePresence>
      {nodo && meta && (
        <>
          <motion.div
            key="velo-ex95"
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEnfoque(null)}
          />
          <motion.aside
            key="panel-ex95"
            className={cn(
              "fixed z-[71] flex flex-col border border-amber-400/25 bg-[#0d0d14]/98 shadow-[0_0_60px_rgba(255,178,71,0.12)]",
              // móvil: hoja inferior · escritorio: columna derecha
              "inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl",
              "md:inset-y-0 md:left-auto md:right-0 md:w-[420px] md:max-h-none md:rounded-l-2xl md:rounded-tr-none",
            )}
            initial={{ opacity: 0, y: 120 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 120 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* barra de acento */}
            <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${nodo.acento}, transparent)` }} />
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-6 vg-ex-scroll">
              {/* cabecera */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-black tracking-wider text-black"
                    style={{ background: meta.hex }}
                  >
                    {meta.tag}
                  </span>
                  <ChipCapa capa={nodo.capa} />
                </div>
                <button
                  onClick={() => setEnfoque(null)}
                  className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:scale-110 hover:text-white active:scale-95"
                  aria-label="Cerrar expediente"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mt-2 text-lg font-black leading-tight text-amber-100">{nodo.nombre}</h3>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-white/45">
                <MapPin className="h-3 w-3" /> {nodo.region}
                {typeof nodo.lat === "number" && typeof nodo.lng === "number" && (
                  <span className="ml-1 text-white/35">· {nodo.lat.toFixed(1)}°, {nodo.lng.toFixed(1)}°</span>
                )}
              </p>

              <p className="mt-3 text-[13px] leading-relaxed text-white/75">{nodo.resumen}</p>

              {/* metadatos */}
              {nodo.filas && nodo.filas.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                  {nodo.filas.map((f, i) => (
                    <motion.div
                      key={f.etiqueta + i}
                      className="flex items-baseline justify-between gap-3 border-b border-white/5 px-3 py-1.5 last:border-0"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.25 }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{f.etiqueta}</span>
                      <span className="text-right text-[11px] font-semibold text-amber-100/85">{f.valor}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* veredicto neuronal */}
              {veredicto && (
                <div className="mt-3 rounded-xl border border-violet-400/20 bg-violet-400/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-violet-300">
                      <BrainCircuit className="h-3.5 w-3.5" /> veredicto neuronal
                    </span>
                    <span className="rounded-full bg-violet-400/15 px-2 py-0.5 text-[10px] font-black text-violet-200">
                      {veredicto.sentimiento}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <BarraVeredicto label="riesgo" valor={veredicto.riesgo} color="#FF4D4D" />
                    <BarraVeredicto label="tensión" valor={veredicto.tension} color="#FF8A3D" />
                    <BarraVeredicto label="confianza" valor={veredicto.confianza} color="#3DDCFF" />
                  </div>
                  <p className="mt-1.5 text-[10px] text-white/35">
                    {veredicto.neuronasActivas.length} neuronas dispararon en el núcleo v3
                  </p>
                </div>
              )}

              {/* conexiones */}
              {vecinos.length > 0 && (
                <div className="mt-3">
                  <span className="mb-1.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/45">
                    <Network className="h-3.5 w-3.5" /> conexiones ({vecinos.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {vecinos.map(({ nodo: v, arista }, i) => (
                      <motion.button
                        key={v.id}
                        onClick={() => setEnfoque(v.id)}
                        className="group flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-left transition hover:scale-[1.04] hover:border-amber-400/40 active:scale-95"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: Math.min(0.4, i * 0.035), duration: 0.2 }}
                        title={ARISTA_META[arista.tipo].label + (arista.nota ? ` · ${arista.nota}` : "")}
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: v.acento }} />
                        <span className="max-w-[130px] truncate text-[11px] font-semibold text-white/80 group-hover:text-amber-200">
                          {v.nombre}
                        </span>
                        <span className="text-[9px] font-black uppercase" style={{ color: ARISTA_META[arista.tipo].color }}>
                          {ARISTA_META[arista.tipo].label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* acciones */}
            <div className="shrink-0 border-t border-white/10 bg-black/50 p-3">
              <div className="grid grid-cols-2 gap-2">
                {nodo.tab && (
                  <button
                    onClick={() => { setEnfoque(null); navigateTo(nodo.tab as never); }}
                    className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-[12px] font-black tracking-wide text-black transition hover:brightness-110 active:scale-[0.98]"
                  >
                    <ExternalLink className="h-4 w-4" /> ABRIR EN VANGUARD
                  </button>
                )}
                {nodo.tipo === "crisis" && nodo.capa === "SIM" && (
                  <>
                    <button
                      onClick={() => { setCrisis(nodo.id.replace("cri:", "")); setEnfoque(null); navigateTo("maquina" as never); }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 py-2 text-[11px] font-black text-amber-300 transition hover:bg-amber-400/20 active:scale-[0.98]"
                    >
                      <Hourglass className="h-3.5 w-3.5" /> CRONOLOGÍA
                    </button>
                    <button
                      onClick={() => { setCrisis(nodo.id.replace("cri:", "")); setEnfoque(null); navigateTo("espejo" as never); }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-violet-400/40 bg-violet-400/10 py-2 text-[11px] font-black text-violet-300 transition hover:bg-violet-400/20 active:scale-[0.98]"
                    >
                      <FlipHorizontal2 className="h-3.5 w-3.5" /> PERSPECTIVAS
                    </button>
                  </>
                )}
                {nodo.tipo === "crisis" && nodo.capa === "REAL" && (
                  <button
                    onClick={() => { setCrisis(nodo.id.replace("arc:", "arc-")); setEnfoque(null); navigateTo("maquina" as never); }}
                    className="col-span-2 flex items-center justify-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400/10 py-2 text-[11px] font-black text-cyan-300 transition hover:bg-cyan-400/20 active:scale-[0.98]"
                  >
                    <Hourglass className="h-3.5 w-3.5" /> VER CRONOLOGÍA REAL
                  </button>
                )}
                <button
                  onClick={() => {
                    const activo = toggleVigilado(nodo.nombre);
                    toast(activo ? `Vigilando: ${nodo.nombre}` : `Vigilancia retirada: ${nodo.nombre}`, { duration: 2200 });
                  }}
                  className={cn(
                    "col-span-2 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-[11px] font-black transition active:scale-[0.98]",
                    vigila
                      ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
                      : "border-white/15 bg-white/5 text-white/60 hover:border-amber-400/40 hover:text-amber-300",
                  )}
                >
                  {vigila ? <BellRing className="h-3.5 w-3.5 vg-lateja" /> : <Bell className="h-3.5 w-3.5" />}
                  {vigila ? "VIGILADO EN TU EXPEDIENTE" : "VIGILAR ESTA ENTIDAD"}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
