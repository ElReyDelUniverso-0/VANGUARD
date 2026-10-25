"use client";

// v118.0 CRONOATLAS — MÁQUINA DEL TIEMPO REALISTA
// "Elige una crisis y retrocede por sus días: cómo se movió el frente, qué
// cambió y cómo llegó a ser lo que es hoy."
// MODO KARSK VIVO: el teatro determinista de frente-zonas-data crece a 21
// días y gana CAPAS DE INFORMACIÓN: terreno real (río Karsk, carreteras,
// contornos de elevación y el puente de Orikhiv), CLIMA diario renderizado,
// ejes de presión con flechas que respiran según la fuerza del día,
// estadísticas de campaña (bajas, bombardeos, drones, convoyes, moral),
// DESPACHOS DEL FRENTE (el parte diario de la casa), reproductor con
// velocidad ×0.5/×1/×2, avance/retroceso paso a paso y ticks de eventos en
// la línea de tiempo. MODO FASES: las crisis de Vand, Zenit y Sarn en
// capítulos con teatro esquemático y curva de tensión. MODO ARCHIVO REAL:
// cronologías verificables (MK-ULTRA, STARGATE, PAPERCLIP, COINTELPRO,
// ECHELON) marcadas REAL.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Hourglass, Play, Pause, ChevronLeft, ChevronRight, FileText, Landmark,
  Anchor, Crosshair, Radiation, CalendarDays, Skull, Bomb, Plane, Truck,
  CloudRain, CloudSnow, CloudFog, Wind, Sun, CloudLightning, Gauge, Radio,
  Volume2, SquareX, Download, X, Snowflake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navigateTo } from "@/lib/nav";
import { toast } from "sonner";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { ExpedienteDrawer } from "@/components/vanguard/expediente-drawer";
// v119 CRONOTEATRO: la voz del parte (TTS de la casa, respeta el MUTE)
import { narrarDespachos, callarVoz, vozDisponible, vozActiva } from "@/lib/despacho-voz";
import {
  CRISIS, ARCHIVO, nodoPorId, ARISTA_META,
  type CrisisVG, type ArchivoReal, type PinTeatro,
} from "@/lib/expediente-data";
import { useExpediente } from "@/lib/expediente-store";
import { useT } from "@/lib/i18n";
import {
  puntosFrente, areaOcupada, deltas, LOCALIDADES, controlDe, EJES_PRESION,
  TEATRO_W, TEATRO_H, fuerzaEje,
  // v118 CRONOATLAS
  DIAS_CAMPANA, DIA_HOY, FASES_CAMPANA, faseDe, climaDe, statsDe, despachosDe,
  diasConEvento, RIO_KARSK, PUENTE_KARSK, CARRETERAS, CONTORNOS, KARSKGRAD_LABEL,
  // v119 CRONOTEATRO
  modsDe, nieveAcumulada, historiaDe,
  type ClimaInfo, type HistoriaLoc,
} from "@/lib/frente-zonas-data";
import { fnv89 } from "@/lib/pulsos-data";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";

const PIN_META: Record<PinTeatro["tipo"], { color: string; icon: typeof Landmark }> = {
  capital: { color: "#FFC94D", icon: Landmark },
  frente: { color: "#FF6B4A", icon: Crosshair },
  puerto: { color: "#3DDCFF", icon: Anchor },
  recurso: { color: "#4DFFC4", icon: Radiation },
};

const CONTROL_COLOR = ["#FF4D4D", "#FFC94D", "#3DDCFF"]; // ocupado, disputado, controlado
const CONTROL_LABEL = ["OCUPADA", "DISPUTADA", "BAJO CONTROL"];

const CLIMA_META: Record<ClimaInfo["tipo"], { icon: typeof Sun; label: string }> = {
  despejado: { icon: Sun, label: "DESPEJADO" },
  lluvia: { icon: CloudRain, label: "LLUVIA" },
  tormenta: { icon: CloudLightning, label: "TORMENTA" },
  niebla: { icon: CloudFog, label: "NIEBLA" },
  nieve: { icon: CloudSnow, label: "NIEVE" },
  viento: { icon: Wind, label: "VIENTO" },
};

// ---------- clima renderizado sobre el teatro (determinista por día) ----------
function ClimaSvg({ clima, dia }: { clima: ClimaInfo; dia: number }) {
  const gotas = useMemo(() => {
    if (clima.tipo !== "lluvia" && clima.tipo !== "tormenta") return [];
    return Array.from({ length: clima.tipo === "tormenta" ? 34 : 24 }, (_, i) => {
      const h = fnv89(`wx118:${dia}:${i}`);
      return { x: (h.charCodeAt(0) % 790) + 5, y: (h.charCodeAt(1) % 520) + 8, len: 9 + (h.charCodeAt(2) % 8) };
    });
  }, [clima.tipo, dia]);
  const flocos = useMemo(() => {
    if (clima.tipo !== "nieve") return [];
    return Array.from({ length: 30 }, (_, i) => {
      const h = fnv89(`wn118:${dia}:${i}`);
      return { x: (h.charCodeAt(0) % 790) + 5, y: (h.charCodeAt(1) % 520) + 8, r: 1.1 + (h.charCodeAt(2) % 12) / 10 };
    });
  }, [clima.tipo, dia]);
  const rabios = useMemo(() => {
    if (clima.tipo !== "viento") return [];
    return Array.from({ length: 6 }, (_, i) => {
      const h = fnv89(`wv118:${dia}:${i}`);
      return { x: (h.charCodeAt(0) % 640) + 30, y: 40 + i * 82 + (h.charCodeAt(1) % 30), len: 90 + (h.charCodeAt(2) % 90) };
    });
  }, [clima.tipo, dia]);
  const relampago = useMemo(() => {
    if (clima.tipo !== "tormenta") return null;
    const h = fnv89(`wl118:${dia}`);
    const x = 80 + (h.charCodeAt(0) % 640);
    const y = 60 + (h.charCodeAt(1) % 300);
    return `${x},${y} ${x - 9},${y + 26} ${x + 2},${y + 28} ${x - 6},${y + 58} ${x + 14},${y + 22} ${x + 3},${y + 20} ${x + 12},${y}`;
  }, [clima.tipo, dia]);

  return (
    <g pointerEvents="none">
      {clima.tipo === "lluvia" && <rect width={TEATRO_W} height={TEATRO_H} fill="#3DDCFF" fillOpacity="0.03" />}
      {clima.tipo === "tormenta" && <rect width={TEATRO_W} height={TEATRO_H} fill="#1B1B2E" fillOpacity="0.22" />}
      {gotas.map((g, i) => (
        <line key={"gota" + i} x1={g.x} y1={g.y} x2={g.x - 3} y2={g.y + g.len} stroke="#9BD8F0" strokeOpacity="0.3" strokeWidth="1.1" />
      ))}
      {flocos.map((f, i) => (
        <circle key={"floco" + i} cx={f.x} cy={f.y} r={f.r} fill="#ffffff" fillOpacity="0.5" />
      ))}
      {clima.tipo === "nieve" && <rect width={TEATRO_W} height={TEATRO_H} fill="#ffffff" fillOpacity="0.045" />}
      {clima.tipo === "niebla" && (
        <>
          <ellipse cx={TEATRO_W / 2} cy={TEATRO_H * 0.32} rx={TEATRO_W * 0.62} ry={64} fill="#ffffff" fillOpacity="0.09" />
          <ellipse cx={TEATRO_W / 2} cy={TEATRO_H * 0.58} rx={TEATRO_W * 0.7} ry={78} fill="#ffffff" fillOpacity="0.07" />
          <ellipse cx={TEATRO_W / 2} cy={TEATRO_H * 0.8} rx={TEATRO_W * 0.6} ry={62} fill="#ffffff" fillOpacity="0.05" />
        </>
      )}
      {rabios.map((v, i) => (
        <line key={"viento" + i} x1={v.x} y1={v.y} x2={v.x + v.len} y2={v.y} stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.4" strokeDasharray="14 9" />
      ))}
      {relampago && <polygon points={relampago} fill="#FFF3B0" fillOpacity="0.85" />}
    </g>
  );
}

// ---------- teatro del Karsk (vivo, v118 realista) ----------
// v119: recibe localidadSel (anillo dorado), onSelect (cronología de la
// localidad) y exportarTeatro (el día completo como PNG del comandante).
function TeatroKarsk({
  dia, localidadSel, onSelect, exportarTeatro, mapaRef, onCerrar,
}: {
  dia: number;
  localidadSel: number | null;
  onSelect: (i: number) => void;
  exportarTeatro: () => void;
  mapaRef: React.RefObject<HTMLDivElement | null>;
  onCerrar: () => void;
}) {
  const pts = useMemo(() => puntosFrente(dia), [dia]);
  const { t } = useT();
  const deltas21 = useMemo(() => deltas(DIAS_CAMPANA), []);
  const deltaHoy = useMemo(() => deltas21.find((d) => d.dia === dia)?.delta ?? 0, [deltas21, dia]);
  const area = useMemo(() => areaOcupada(dia), [dia]);
  const controles = useMemo(() => LOCALIDADES.map((l) => controlDe(l, dia)), [dia]);
  const conteo = useMemo(() => {
    const c = [0, 0, 0];
    controles.forEach((k) => c[k]++);
    return c;
  }, [controles]);
  const cambiadas = useMemo(() => deltas21.find((d) => d.dia === dia)?.localidades ?? [], [deltas21, dia]);
  const polyOcupada = `${pts.map(([x, y]) => `${x},${y}`).join(" ")} ${TEATRO_W},${TEATRO_H} ${TEATRO_W},0`;
  const fase = faseDe(dia);
  const clima = useMemo(() => climaDe(dia), [dia]);
  const stats = useMemo(() => statsDe(dia), [dia]);
  const despachos = useMemo(() => despachosDe(dia), [dia]);
  const fuerzas = useMemo(() => EJES_PRESION.map((_, i) => fuerzaEje(i, dia)), [dia]);
  // v119 CRONOTEATRO: el clima tiñe el parte + la nieve se acumula día tras día
  const mods = useMemo(() => modsDe(dia), [dia]);
  const nieve = useMemo(() => nieveAcumulada(dia), [dia]);
  // v119: LA VOZ DEL PARTE — estado local; al cambiar de día la voz se corta
  const [vozOn, setVozOn] = useState(false);
  useEffect(() => {
    if (!vozOn) return;
    const id = setInterval(() => { if (!vozActiva()) setVozOn(false); }, 1000);
    return () => clearInterval(id);
  }, [vozOn]);
  useEffect(() => {
    callarVoz();
    setVozOn(false);
  }, [dia]);
  useEffect(() => () => callarVoz(), []);
  const ClimaIcon = CLIMA_META[clima.tipo].icon;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
        {/* mapa con capas de información */}
        <div ref={mapaRef} className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#08080e]">
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
              <defs>
                <marker id="flecha118" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#FFC94D" fillOpacity="0.9" />
                </marker>
              </defs>
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
              {/* v118: contornos de elevación (colinas del este) */}
              <g fill="none" stroke="#ffffff" strokeOpacity="0.09">
                {CONTORNOS.map((c, i) => (
                  <ellipse key={"col" + i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} strokeDasharray="5 6" />
                ))}
              </g>
              {/* v118: carreteras */}
              {CARRETERAS.map((camin, i) => (
                <polyline
                  key={"carretera" + i}
                  points={camin.map(([x, y]) => `${x},${y}`).join(" ")}
                  fill="none"
                  stroke="#ffffff"
                  strokeOpacity="0.14"
                  strokeWidth="2.2"
                  strokeDasharray="10 7"
                />
              ))}
              {/* v118: río Karsk */}
              <polyline
                points={RIO_KARSK.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="none"
                stroke="#2FA8D8"
                strokeOpacity="0.5"
                strokeWidth="7"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 5px rgba(47,168,216,0.45))" }}
              />
              {/* v118: puente estratégico */}
              <g>
                <rect x={PUENTE_KARSK.x - 12} y={PUENTE_KARSK.y - 3.5} width={24} height={7} rx={2} fill="none" stroke="#FFC94D" strokeOpacity="0.85" strokeWidth="1.6" />
                <text x={PUENTE_KARSK.x} y={PUENTE_KARSK.y - 9} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#FFC94D" opacity="0.8" stroke="#000" strokeWidth="2.4" style={{ paintOrder: "stroke" }}>
                  {PUENTE_KARSK.nombre.toUpperCase()}
                </text>
              </g>
              {/* v118: KARSKGRAD al este */}
              <text x={KARSKGRAD_LABEL.x} y={KARSKGRAD_LABEL.y} textAnchor="middle" fontSize="10" fontWeight="900" fill="#ffffff" opacity="0.28" letterSpacing="2">
                {KARSKGRAD_LABEL.texto}
              </text>
              {/* área ocupada */}
              <polygon points={polyOcupada} fill="#FF3B30" fillOpacity="0.14" />
              {/* v119: la nieve ACUMULADA vela el terreno (cada día seguido la tiñe más) */}
              {nieve > 0 && <rect width={TEATRO_W} height={TEATRO_H} fill="#ffffff" fillOpacity={0.035 * nieve} />}
              {/* frente */}
              <polyline
                points={pts.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="none"
                stroke="#FF6B4A"
                strokeWidth="3.4"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 7px rgba(255,107,74,0.65))" }}
              />
              {/* v118: ejes de presión con flecha viva según la fuerza del día */}
              {EJES_PRESION.map((e, i) => {
                const f = fuerzas[i];
                const largo = 34 + f * 74;
                const xFinal = e.x + largo * e.dir * -1;
                return (
                  <g key={e.nombre}>
                    <line
                      x1={e.x} y1={e.y} x2={xFinal} y2={e.y + 10}
                      stroke="#FFC94D"
                      strokeOpacity={0.35 + f * 0.5}
                      strokeWidth={1.4 + f * 2}
                      strokeDasharray="6 5"
                      markerEnd="url(#flecha118)"
                    />
                    <text x={e.x + 6} y={e.y - 7} fontSize="10" fontWeight="800" fill="#FFC94D" opacity="0.65">
                      {e.nombre}
                    </text>
                  </g>
                );
              })}
              {/* v119: localidades CLICABLES — toca una y lee su cronología de 21 días */}
              {LOCALIDADES.map((l, i) => {
                const c = controles[i];
                const sel = i === localidadSel;
                return (
                  <g
                    key={l.nombre}
                    onClick={() => onSelect(i)}
                    className="cursor-pointer"
                    data-localidad119={l.nombre}
                  >
                    {/* zona de toque generosa (el mapa es denso en móvil) */}
                    <circle cx={l.x} cy={l.y} r="16" fill="transparent" />
                    {sel && <circle cx={l.x} cy={l.y} r="13" fill="none" stroke="#FFC94D" strokeOpacity="0.9" strokeWidth="1.6" strokeDasharray="3 3" className="vg-nodo-anillo" />}
                    <circle cx={l.x} cy={l.y} r={sel ? "6.6" : "5.4"} fill={`${CONTROL_COLOR[c]}2E`} stroke={CONTROL_COLOR[c]} strokeWidth={sel ? "2.4" : "1.8"} />
                    {cambiadas.includes(l.nombre) && (
                      <circle cx={l.x} cy={l.y} r="10" fill="none" stroke="#FFFFFF" strokeOpacity="0.75" strokeWidth="1.2" className="vg-nodo-anillo" />
                    )}
                    <text x={l.x} y={l.y - 10} textAnchor="middle" fontSize={sel ? "10.5" : "9.5"} fontWeight={sel ? "900" : "800"} fill={sel ? "#FFC94D" : "#ffffff99"} stroke="#000" strokeWidth="2.6" style={{ paintOrder: "stroke" }}>
                      {l.nombre}
                    </text>
                  </g>
                );
              })}
              {/* v118: clima del día */}
              <ClimaSvg clima={clima} dia={dia} />
              {/* v118: rosa de los vientos + escala */}
              <g opacity="0.55">
                <circle cx={TEATRO_W - 34} cy={34} r={13} fill="none" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" />
                <polygon points={`${TEATRO_W - 34},23 ${TEATRO_W - 30},37 ${TEATRO_W - 34},33 ${TEATRO_W - 38},37`} fill="#ffffff" fillOpacity="0.7" />
                <text x={TEATRO_W - 34} y={16} textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff" fillOpacity="0.8">N</text>
              </g>
              <g opacity="0.6">
                <line x1={18} y1={TEATRO_H - 18} x2={98} y2={TEATRO_H - 18} stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2" />
                <line x1={18} y1={TEATRO_H - 22} x2={18} y2={TEATRO_H - 14} stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2" />
                <line x1={98} y1={TEATRO_H - 22} x2={98} y2={TEATRO_H - 14} stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2" />
                <text x={58} y={TEATRO_H - 26} textAnchor="middle" fontSize="9" fontWeight="800" fill="#ffffff" fillOpacity="0.7">20 KM</text>
              </g>
            </motion.svg>
          </AnimatePresence>
          {/* chips en vivo sobre el mapa */}
          <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
            {cambiadas.length > 0 && (
              <div className="rounded-lg border border-white/20 bg-black/70 px-2.5 py-1.5 backdrop-blur-sm">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/50">cambian de mano</span>
                <div className="text-[11px] font-black text-amber-300">{cambiadas.join(" · ")}</div>
              </div>
            )}
          </div>
          <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
            <span className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/70 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/75 backdrop-blur-sm">
              <ClimaIcon className="h-3 w-3 text-cyan-300" />
              {CLIMA_META[clima.tipo].label}{nieve > 1 ? ` ×${nieve} DÍAS` : ""} {clima.tempC > 0 ? "+" : ""}{clima.tempC}° · V {clima.vientoKmh} KM/H {clima.direccion}
            </span>
            {/* v119: el parte lleva los MODIFICADORES del clima a la vista */}
            {mods.efectos.map((ef) => (
              <span key={ef} className="flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-amber-300/90 backdrop-blur-sm">
                <Snowflake className="h-2.5 w-2.5" /> {ef}
              </span>
            ))}
            <span className="rounded-lg border border-white/15 bg-black/70 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white/50 backdrop-blur-sm">
              tecla: {String.fromCharCode(65 + (dia % 8))}·{1 + (dia % 6)} · escala 1:250000
            </span>
          </div>
          {/* v119: EXPORTAR EL TEATRO — el día entero como PNG del comandante */}
          <button
            onClick={exportarTeatro}
            title={t("maqui119.pngTitle")}
            className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-lg border border-cyan-400/40 bg-black/75 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-cyan-300 backdrop-blur-sm transition hover:bg-cyan-400/20 active:scale-95"
          >
            <Download className="h-3 w-3" /> {t("maqui119.png")}
          </button>
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
            <div className="text-[10px] font-bold text-white/40">{dia === DIA_HOY ? "HOY" : `HACE ${DIA_HOY - dia} DÍAS`}</div>
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
          {/* v118: estadísticas de campaña del día */}
          <div className="rounded-2xl border border-white/12 bg-black/45 p-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-white/40">últimas 24 horas</div>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
                <div className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-white/45"><Skull className="h-3 w-3" /> bajas ROJO</div>
                <div className="text-[15px] font-black tabular-nums text-red-300">{stats.bajasRojo}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
                <div className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-white/45"><Skull className="h-3 w-3" /> bajas AZUL</div>
                <div className="text-[15px] font-black tabular-nums text-sky-300">{stats.bajasAzul}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
                <div className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-white/45"><Bomb className="h-3 w-3" /> bombardeos</div>
                <div className="text-[15px] font-black tabular-nums text-amber-300">{stats.bombardeos}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
                <div className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-white/45"><Plane className="h-3 w-3" /> drones ↓</div>
                <div className="text-[15px] font-black tabular-nums text-violet-300">{stats.drones}</div>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5">
              <span className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-white/45"><Truck className="h-3 w-3" /> convoyes logísticos</span>
              <span className="text-[13px] font-black tabular-nums text-emerald-300">{stats.convoyes}</span>
            </div>
            {/* moral de los bandos */}
            <div className="mt-2 space-y-1.5">
              {([
                { k: "ROJO", v: stats.moralRojo, c: "#FF4D4D" },
                { k: "AZUL", v: stats.moralAzul, c: "#3DDCFF" },
              ]).map((m) => (
                <div key={m.k}>
                  <div className="flex items-baseline justify-between text-[8.5px] font-black uppercase tracking-wider">
                    <span className="text-white/45">moral {m.k}</span>
                    <span style={{ color: m.c }}>{Math.round(m.v)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: m.c }}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.v}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
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

      {/* v119: LA CRONOLOGÍA DE LA LOCALIDAD TOCADA — la campaña desde su esquina */}
      <AnimatePresence>
        {localidadSel !== null && (
          <CronologiaLocalidad idx={localidadSel} dia={dia} onCerrar={onCerrar} />
        )}
      </AnimatePresence>

      {/* v118: despachos del frente — el parte diario + v119: LA VOZ DEL PARTE */}
      <div className="rounded-2xl border border-white/12 bg-black/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/45">
            <Radio className="h-3 w-3 text-amber-300" /> despachos del frente · día {dia}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="hidden text-[9px] font-semibold text-white/30 sm:inline">parte de la casa · verificado</span>
            {vozDisponible() && (
              <button
                onClick={() => {
                  if (vozActiva()) {
                    callarVoz();
                    setVozOn(false);
                  } else {
                    const ok = narrarDespachos(dia, despachos);
                    setVozOn(ok);
                    if (!ok) toast(t("maqui119.mute"));
                  }
                }}
                className={cn(
                  "flex items-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-widest transition active:scale-95",
                  vozOn
                    ? "border-amber-400/60 bg-amber-400/15 text-amber-300"
                    : "border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20",
                )}
                title={vozOn ? "Callar el parte" : "Escuchar el parte"}
              >
                {vozOn ? <SquareX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                {vozOn ? t("maqui119.callar") : t("maqui119.voz")}
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {despachos.map((d, i) => (
            <motion.div
              key={`${dia}-${i}`}
              className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
            >
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-amber-400/12 px-1.5 py-0.5 text-[9.5px] font-black tabular-nums text-amber-300">{d.hora}</span>
                <span className="text-[8.5px] font-black uppercase tracking-wider text-white/35">{d.sector}</span>
              </div>
              <p className="mt-1 text-[11.5px] leading-snug text-white/75">{d.texto}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- v119: CRONOLOGÍA DE LOCALIDAD (la campaña desde SU esquina) ----------
// v122: EXPORTAR LA CRONOLOGÍA DE LOCALIDAD como tarjeta PNG del comandante.
// La tarjeta se dibuja como SVG puro (sin dependencias externas, monospace
// genérico) a partir de los datos reales de historiaDe().
function descargarCronoPng(hist: HistoriaLoc, dia: number) {
  try {
    const W = 1200;
    const H = 630;
    const barW = (W - 120) / hist.dias.length;
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const rectCambios = hist.cambios.slice(0, 6).map(
      (cm, i) => `<text x="60" y="${470 + i * 26}" font-family="monospace" font-size="15" font-weight="bold" fill="${cm.dia === dia ? "#ffffff" : "#9aa3ad"}">DÍA ${cm.dia} · ${CONTROL_LABEL[cm.de]} → ${CONTROL_LABEL[cm.a]}</text>`
    ).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="fondo" cx="18%" cy="8%" r="90%">
      <stop offset="0%" stop-color="#241a06"/>
      <stop offset="100%" stop-color="#0a0a12"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#fondo)"/>
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="#FFC94D55" stroke-width="2" rx="14"/>
  <text x="60" y="72" font-family="monospace" font-size="20" font-weight="bold" fill="#FFC94D" letter-spacing="6">VANGUARD · MÁQUINA DEL TIEMPO</text>
  <text x="60" y="126" font-family="monospace" font-size="44" font-weight="bold" fill="#ffffff">${esc(hist.nombre.toUpperCase())}</text>
  <text x="60" y="160" font-family="monospace" font-size="17" fill="#8a9199">CRONOLOGÍA DE LOCALIDAD · ${DIAS_CAMPANA} DÍAS · DÍA VIVO ${dia}</text>
  <text x="60" y="216" font-family="monospace" font-size="14" font-weight="bold" fill="#8a9199">QUIÉN LA TUVO, DÍA A DÍA</text>
  ${hist.dias.map((c, d) => `<rect x="${60 + d * barW}" y="232" width="${barW - 3}" height="56" rx="3" fill="${CONTROL_COLOR[c]}" opacity="${d <= dia ? 0.92 : 0.22}"/>${d === dia ? `<rect x="${60 + d * barW - 2}" y="228" width="${barW + 1}" height="64" rx="4" fill="none" stroke="#ffffff" stroke-width="2.5"/>` : ""}`).join("")}
  <text x="60" y="318" font-family="monospace" font-size="14" fill="#FF4D4D" font-weight="bold">OCUPADA ${hist.diasRojo} D</text>
  <text x="300" y="318" font-family="monospace" font-size="14" fill="#FFC94D" font-weight="bold">DISPUTADA ${hist.diasDisputada} D</text>
  <text x="560" y="318" font-family="monospace" font-size="14" fill="#3DDCFF" font-weight="bold">BAJO CONTROL ${hist.diasAzul} D</text>
  <text x="820" y="318" font-family="monospace" font-size="14" fill="#ffffff" font-weight="bold">CAMBIOS DE MANO ${hist.cambios.length}</text>
  <line x1="60" y1="342" x2="${W - 60}" y2="342" stroke="#ffffff22" stroke-width="1.5"/>
  <text x="60" y="386" font-family="monospace" font-size="15" font-weight="bold" fill="#8a9199">CAMBIOS DE MANO REGISTRADOS</text>
  ${rectCambios || '<text x="60" y="470" font-family="monospace" font-size="15" fill="#6a7178">La línea nunca la tocó: toda la campaña de un mismo lado.</text>'}
  ${hist.menciones.length > 0 ? `<text x="60" y="${470 + Math.min(6, hist.cambios.length) * 26 + 18}" font-family="monospace" font-size="14" fill="#8a9199">La mencionan ${hist.menciones.length} despachos del frente</text>` : ""}
  <text x="60" y="${H - 40}" font-family="monospace" font-size="14" fill="#6a7178">vanguard · teatro del karsk determinista · exportado del día ${dia}</text>
</svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `vanguard-cronologia-${hist.nombre.toLowerCase().replace(/\s+/g, "-")}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        toast(`CRONOLOGÍA EXPORTADA · ${hist.nombre.toUpperCase()}`);
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast("EL NAVEGADOR BLOQUEÓ LA EXPORTACIÓN"); };
    img.src = url;
  } catch {
    toast("EL NAVEGADOR BLOQUEÓ LA EXPORTACIÓN");
  }
}

function CronologiaLocalidad({
  idx, dia, onCerrar,
}: {
  idx: number;
  dia: number;
  onCerrar: () => void;
}) {
  const hist = useMemo(() => historiaDe(idx), [idx]);
  return (
    <motion.div
      key={hist.nombre}
      className="rounded-2xl border border-amber-400/30 bg-[radial-gradient(ellipse_at_0%_0%,rgba(255,201,77,0.09),transparent_55%),rgba(0,0,0,0.5)] p-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-300/80">cronología de localidad</span>
          <span className="truncate text-[15px] font-black text-amber-100">{hist.nombre.toUpperCase()}</span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-black text-white/60">{DIAS_CAMPANA} DÍAS</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {/* v122: la tarjeta del comandante — la crónica de esta localidad en PNG */}
          <button
            onClick={() => descargarCronoPng(hist, dia)}
            aria-label="Exportar cronología como PNG"
            title="Exportar esta cronología como tarjeta PNG"
            className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-2 py-1.5 text-[9px] font-black uppercase tracking-wider text-amber-300 transition hover:border-amber-400/80 active:scale-95"
          >
            PNG
          </button>
          <button
            onClick={onCerrar}
            aria-label="Cerrar cronología"
            className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-white/60 transition hover:border-white/35 active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* quién la tuvo: días por bando */}
      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        <div className="rounded-lg border border-red-400/25 bg-red-400/8 px-2 py-1.5">
          <div className="text-[8.5px] font-black uppercase tracking-wider text-white/45">días ocupada</div>
          <div className="text-[15px] font-black tabular-nums text-red-300">{hist.diasRojo}</div>
        </div>
        <div className="rounded-lg border border-amber-400/25 bg-amber-400/8 px-2 py-1.5">
          <div className="text-[8.5px] font-black uppercase tracking-wider text-white/45">días disputada</div>
          <div className="text-[15px] font-black tabular-nums text-amber-300">{hist.diasDisputada}</div>
        </div>
        <div className="rounded-lg border border-cyan-400/25 bg-cyan-400/8 px-2 py-1.5">
          <div className="text-[8.5px] font-black uppercase tracking-wider text-white/45">días bajo control</div>
          <div className="text-[15px] font-black tabular-nums text-cyan-300">{hist.diasAzul}</div>
        </div>
        <div className="rounded-lg border border-white/12 bg-white/[0.04] px-2 py-1.5">
          <div className="text-[8.5px] font-black uppercase tracking-wider text-white/45">cambios de mano</div>
          <div className="text-[15px] font-black tabular-nums text-white/85">{hist.cambios.length}</div>
        </div>
      </div>

      {/* la línea de 21 puntos: quién la tuvo cada día */}
      <div className="mt-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2">
        <div className="flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider text-white/40">
          <span>quién la tuvo, día a día</span>
          <span>d0 → d{DIA_HOY}</span>
        </div>
        <div className="mt-1.5 flex items-end gap-[3px]">
          {hist.dias.map((c, d) => (
            <div key={d} className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
              <span
                className={cn("h-5 w-full rounded-[3px]", d === dia && "ring-2 ring-white/80")}
                style={{ background: `${CONTROL_COLOR[c]}B8`, opacity: d <= dia ? 1 : 0.28 }}
                title={`Día ${d}: ${CONTROL_LABEL[c]}`}
              />
              {(d % 5 === 0 || d === DIA_HOY) && (
                <span className="text-[7.5px] font-black tabular-nums text-white/35">{d}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* los cambios de mano */}
      {hist.cambios.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {hist.cambios.map((cm) => (
            <span
              key={cm.dia}
              className={cn(
                "rounded-lg border px-2 py-1 text-[9.5px] font-black tabular-nums",
                cm.dia === dia ? "border-white/50 bg-white/15 text-white" : "border-white/12 bg-white/[0.04] text-white/60",
              )}
            >
              DÍA {cm.dia} · {CONTROL_LABEL[cm.de]} → {CONTROL_LABEL[cm.a]}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[11px] font-semibold text-white/45">
          La línea nunca la tocó: {hist.diasRojo === DIAS_CAMPANA ? "toda la campaña detrás del frente enemigo" : "toda la campaña del lado azul"}.
        </p>
      )}

      {/* los despachos que la mencionaron */}
      {hist.menciones.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-[8.5px] font-black uppercase tracking-wider text-white/40">
            la mencionan los despachos ({hist.menciones.length})
          </div>
          {hist.menciones.slice(0, 3).map((m, i) => (
            <div key={i} className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1.5">
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-amber-400/12 px-1.5 py-0.5 text-[9px] font-black tabular-nums text-amber-300">DÍA {m.dia} · {m.hora}</span>
                <span className="text-[8px] font-black uppercase tracking-wider text-white/35">{m.sector}</span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-white/70">{m.texto}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
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
const VELOCIDADES = [
  { ms: 2600, label: "×0.5", nombre: "LENTA" },
  { ms: 1500, label: "×1", nombre: "NORMAL" },
  { ms: 750, label: "×2", nombre: "RÁPIDA" },
];

function KarskPlayer() {
  const [dia, setDia] = useState(DIA_HOY);
  const [play, setPlay] = useState(false);
  const [vel, setVel] = useState(1); // índice en VELOCIDADES
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventos = useMemo(() => diasConEvento(), []);
  const porcentaje = (d: number) => (d / DIA_HOY) * 100;
  // v119 CRONOTEATRO: cronología de localidad + exportación PNG del teatro
  const [localidadSel, setLocalidadSel] = useState<number | null>(null);
  const mapaRef = useRef<HTMLDivElement>(null);

  // v119: EXPORTAR EL TEATRO — el SVG del día a canvas 2× y descarga PNG.
  // Sin servicios: serializa el <svg> vivo, rasteriza en tu máquina y baja
  // como "vanguard-karsk-dia{N}.png". Si el navegador lo bloquea, avisa.
  const exportarTeatro = useCallback(() => {
    const svg = mapaRef.current?.querySelector("svg");
    if (!svg) return;
    try {
      const clon = svg.cloneNode(true) as SVGSVGElement;
      clon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clon.setAttribute("width", String(TEATRO_W * 2));
      clon.setAttribute("height", String(TEATRO_H * 2));
      clon.style.opacity = "1"; // AnimatePresence puede dejarlo a medio fundir
      const base = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      base.setAttribute("width", String(TEATRO_W * 2));
      base.setAttribute("height", String(TEATRO_H * 2));
      base.setAttribute("fill", "#0a0a12");
      clon.insertBefore(base, clon.firstChild);
      const data = new XMLSerializer().serializeToString(clon);
      const url = URL.createObjectURL(new Blob([data], { type: "image/svg+xml;charset=utf-8" }));
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = TEATRO_W * 2;
        canvas.height = TEATRO_H * 2;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `vanguard-karsk-dia${dia}.png`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 4000);
          toast(`TEATRO EXPORTADO · día ${dia} · ${canvas.width}×${canvas.height}`);
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast("EL NAVEGADOR BLOQUEÓ LA EXPORTACIÓN");
      };
      img.src = url;
    } catch {
      toast("EL NAVEGADOR BLOQUEÓ LA EXPORTACIÓN");
    }
  }, [dia]);

  useEffect(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (play) {
      timerRef.current = setInterval(() => {
        setDia((v) => {
          if (v >= DIA_HOY) { setPlay(false); return DIA_HOY; }
          return v + 1;
        });
      }, VELOCIDADES[vel].ms);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [play, vel]);

  return (
    <>
      {/* controles del reproductor */}
      <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-white/12 bg-black/40 p-3 sm:flex-row sm:items-center">
        <button
          onClick={() => {
            // si la campaña terminó, REPRODUCIR la reinicia desde el día 0
            if (!play && dia >= DIA_HOY) setDia(0);
            setPlay((v) => !v);
          }}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-black transition active:scale-95",
            play ? "bg-gradient-to-r from-red-500 to-orange-500 text-black" : "bg-gradient-to-r from-amber-400 to-orange-500 text-black hover:brightness-110",
          )}
        >
          {play ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {play ? "PAUSAR LA CAMPAÑA" : `REPRODUCIR ${DIAS_CAMPANA} DÍAS`}
        </button>
        {/* paso a paso */}
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => { setPlay(false); setDia((v) => Math.max(0, v - 1)); }}
            disabled={dia === 0}
            aria-label="Día anterior"
            className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-2 text-white/70 transition hover:border-amber-400/40 disabled:opacity-30 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setPlay(false); setDia((v) => Math.min(DIA_HOY, v + 1)); }}
            disabled={dia === DIA_HOY}
            aria-label="Día siguiente"
            className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-2 text-white/70 transition hover:border-amber-400/40 disabled:opacity-30 active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {/* v118: línea de tiempo con ticks de eventos */}
        <div className="relative min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={DIA_HOY}
            value={dia}
            onChange={(e) => { setPlay(false); setDia(parseInt(e.target.value)); }}
            className="vg-slider w-full"
            aria-label={`Línea de tiempo de ${DIAS_CAMPANA} días`}
          />
          {/* ticks de eventos (días en que una localidad cambia de mano) */}
          <div className="pointer-events-none absolute inset-x-0 top-[calc(50%+6px)] h-1.5">
            {eventos.map((d) => (
              <span
                key={d}
                className="absolute top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-red-400 shadow-[0_0_5px_rgba(255,80,80,0.9)]"
                style={{ left: `${porcentaje(d)}%` }}
              />
            ))}
          </div>
        </div>
        <span className="shrink-0 text-[11px] font-black text-white/60">DÍA {dia}/{DIA_HOY}</span>
        {/* v118: velocidad */}
        <button
          onClick={() => setVel((v) => (v + 1) % VELOCIDADES.length)}
          title={`Velocidad ${VELOCIDADES[vel].nombre}`}
          className="flex shrink-0 items-center gap-1 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-2 text-[10px] font-black text-cyan-300 transition hover:bg-cyan-400/20 active:scale-95"
        >
          <Gauge className="h-3.5 w-3.5" /> {VELOCIDADES[vel].label}
        </button>
        {/* fases */}
        <div className="flex gap-1">
          {FASES_CAMPANA.map((f) => (
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
      <TeatroKarsk
        dia={dia}
        localidadSel={localidadSel}
        onSelect={(i) => setLocalidadSel((v) => (v === i ? null : i))}
        exportarTeatro={exportarTeatro}
        mapaRef={mapaRef}
        onCerrar={() => setLocalidadSel(null)}
      />
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

  // ════════════════════════════════════════════════════════════
  // v168: PARIDAD 2D→3D — LA MÁQUINA DEL TIEMPO en volumen: la
  // línea temporal activa (SIM o REAL), su modo y todas las
  // crisis/archivos reales, seleccionables desde el mundo
  // ════════════════════════════════════════════════════════════
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const filas: FilaContenido3D[] = [
      {
        t: `MÁQUINA DEL TIEMPO: ${sel.kind === "sim" ? sel.c.nombre.toUpperCase() : sel.a.nombre.toUpperCase()}`,
        v: sel.kind === "sim" ? "SIM · VANGUARD" : "REAL · ARCHIVO",
        color: sel.kind === "sim" ? "#FFC94D" : "#3DDCFF",
        d: sel.kind === "sim" ? sel.c.resumen : sel.a.resumen,
      },
      {
        t: sel.kind === "real" ? "CRONOLOGÍA VERIFICABLE" : sel.c.modo === "karsk-vivo" ? "TEATRO KARSK VIVO · 21 DÍAS" : "CRISIS EN FASES",
        color: "#7AB8FF",
        d: sel.kind === "real"
          ? "Documentos desclasificados con fuente nombrada · fechas y hechos verificables"
          : sel.c.modo === "karsk-vivo"
            ? "Reproductor día a día con clima, ejes de presión, estadísticas y despachos del frente"
            : "Capítulos con curva de tensión y teatro esquemático",
      },
    ];
    // offset 2: la línea activa y su modo preceden al resto de opciones
    for (const o of opciones.slice(0, 9)) {
      filas.push({
        t: (o.kind === "sim" ? o.c.nombre : o.a.nombre).toUpperCase(),
        v: o.kind === "real" ? o.a.rango : o.c.region,
        color: o.kind === "real" ? "#3DDCFF" : "#FFC94D",
        d: `${o.id === sel.id ? "LÍNEA ACTIVA · " : ""}${o.kind === "sim" ? o.c.resumen : o.a.resumen}`,
        a: "abrir linea",
      });
    }
    if (sel.kind === "sim" && sel.c.modo === "fases" && sel.c.hechos[0]) {
      filas.push({
        t: sel.c.hechos[0].texto,
        color: "#FFC94D",
        d: `Hecho real de la crisis · ${Math.max(0, sel.c.hechos.length - 1)} más en el panel 2D`,
      });
    }
    return filas;
  }, [opciones, sel]);
  useSala3DContenido(
    "maquina",
    "MÁQUINA DEL TIEMPO",
    "#FFC94D",
    sel.kind === "sim"
      ? `${sel.c.nombre} · ${sel.c.modo === "karsk-vivo" ? "teatro vivo de 21 días" : "crisis en fases"} · ${CRISIS.length} crisis SIM + ${ARCHIVO.length} archivos REALES`
      : `${sel.a.nombre} · ${sel.a.rango} · archivo real desclasificado`,
    filas3D,
  );

  // v168: oyente de acciones del mundo 3D — mismo setCrisis que los chips 2D
  useEffect(() => {
    const onAccion = (e: Event) => {
      const det = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (det?.tab !== "maquina") return;
      if (det.accion === "abrir linea") {
        // offset 2: la línea activa y su modo preceden a las opciones
        const o = opciones[det.idx - 2];
        if (o) setCrisis(o.id);
      }
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [opciones, setCrisis]);

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
