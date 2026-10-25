"use client";

// v106.0 PESTAÑAS DE CROMO — MURALLA DE VIGILANCIA: la mejora del OBSERVATORIO.
// Antes el Observatorio eran 17 pestañas planas sin puerta; ahora abre con su
// propia sala: una muralla EN VIVO (sismos reales de la USGS, la ISS sobre el
// planeta, vuelos, presencia de guerreros) + las 17 salas de vigilancia a un
// toque. Datos reales de las APIs que ya existen — cero invención, cero fotos
// IA, teal de telescopio (#5EEAD4) como acento de la sala.

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Users, Waves, Radio, ArrowRight, Satellite, RefreshCw } from "lucide-react";
import { SECTIONS, TABS, accentOfSection, type TabKey } from "@/components/vanguard/tab-nav";
import { TAB_SHORTS, useT } from "@/lib/i18n";
import { sfx } from "@/lib/sound";

const TEAL = "#5EEAD4";

interface Quake {
  mag: number;
  place: string;
  lat: number;
  lng: number;
  depth: number;
  time: number;
}
interface IssAny {
  lat?: number;
  lng?: number;
  [k: string]: unknown;
}
interface PulsoAny {
  ok?: boolean;
  iss?: IssAny | null;
  planes?: unknown[];
  news?: unknown[];
  sources?: Record<string, boolean>;
}

function irA(k: TabKey) {
  sfx.tab();
  window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: k }));
}

function haceCuanto(ms: number): string {
  const min = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} d`;
}

function magColor(mag: number): string {
  if (mag >= 6) return "#FF3B30";
  if (mag >= 4.5) return "#FFA030";
  if (mag >= 3) return "#FFC94D";
  return "#4ADE80";
}

// v111.0 MÁQUINA DEL TIEMPO — mini-mapa sísmico en canvas dentro de la muralla
import { MiniMapaSismos } from "@/components/vanguard/mini-mapa-sismos";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido"; // v168: paridad 2D→3D

// salas con latido en vivo (los 6 instrumentos que respiran solos)
const SALAS_VIVAS = new Set<string>(["centinela", "espectro", "sismo", "cielos", "planeta", "pulso"]);

export function ObservatorioPanel() {
  const { t, lang } = useT();
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [sismosLive, setSismosLive] = useState(false);
  const [pulso, setPulso] = useState<PulsoAny | null>(null);
  const [online, setOnline] = useState<number | null>(null);
  const [peak, setPeak] = useState<number | null>(null);
  const [hora, setHora] = useState<string>("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const tick = () => setHora(new Date().toLocaleTimeString(lang === "es" ? "es-ES" : lang, { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [lang]);

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      setCargando(true);
      const [rq, rp, rpr] = await Promise.allSettled([
        fetch("/api/earthquakes", { cache: "no-store" }),
        fetch("/api/pulso", { cache: "no-store" }),
        fetch("/api/presence", { cache: "no-store" }),
      ]);
      if (!vivo) return;
      if (rq.status === "fulfilled" && rq.value.ok) {
        try {
          const j = await rq.value.json();
          const qs: Quake[] = Array.isArray(j?.quakes) ? j.quakes : [];
          setQuakes(qs);
          setSismosLive(Boolean(j?.live));
        } catch { /* la muralla aguanta sin sismos */ }
      }
      if (rp.status === "fulfilled" && rp.value.ok) {
        try { setPulso(await rp.value.json()); } catch { /* sin pulso también aguanta */ }
      }
      if (rpr.status === "fulfilled" && rpr.value.ok) {
        try {
          const j = await rpr.value.json();
          if (typeof j?.online === "number") setOnline(j.online);
          if (typeof j?.peak === "number") setPeak(j.peak);
        } catch { /* sin presencia */ }
      }
      setCargando(false);
    };
    cargar();
    // la muralla respira: refresco cada 3 min como los instrumentos reales
    const iv = setInterval(cargar, 180_000);
    return () => {
      vivo = false;
      clearInterval(iv);
    };
  }, []);

  const topSismos = useMemo(
    () => [...quakes].sort((a, b) => b.mag - a.mag).slice(0, 5),
    [quakes]
  );
  const nVuelos = Array.isArray(pulso?.planes) ? pulso!.planes!.length : 0;
  const nNoticias = Array.isArray(pulso?.news) ? pulso!.news!.length : 0;
  const iss = pulso?.iss ?? null;
  const salas = useMemo(() => {
    const obs = SECTIONS.find((s) => s.key === "observatorio");
    return (obs?.tabs ?? []).filter((tb) => tb.key !== "observatorio");
  }, []);

  // v168: PARIDAD 2D→3D — la MURALLA DE VIGILANCIA emite sus filas reales
  // (sismos USGS reales, la ISS del pulso y las salas de vigilancia)
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    const filas: FilaContenido3D[] = [
      {
        t: "MURALLA DE VIGILANCIA",
        v: `${online ?? "—"} EN LÍNEA`,
        color: TEAL,
        d: `el planeta medido en vivo · ${quakes.length} eventos sísmicos en 48h · pico de presencia ${peak ?? "—"} · ${sismosLive ? "red USGS en vivo" : "red sísmica local"}`,
      },
      {
        t: iss && typeof iss.lat === "number" && typeof iss.lng === "number"
          ? `ISS SOBRE ${iss.lat.toFixed(2)}°, ${iss.lng.toFixed(2)}°`
          : "ISS SIN SEÑAL",
        v: `${nVuelos} VUELOS`,
        color: TEAL,
        d: `pulso real del planeta: ${nVuelos} vuelos rastreados · ${nNoticias} noticias · la EEI posicionada en directo`,
      },
    ];
    for (const q of topSismos.slice(0, 4)) {
      filas.push({
        t: q.place || "SIN LUGAR",
        v: `M${q.mag.toFixed(1)}`,
        color: magColor(q.mag),
        d: `hace ${haceCuanto(q.time)} · profundidad ${q.depth.toFixed(0)} km · ${q.lat.toFixed(1)}°, ${q.lng.toFixed(1)}° · USGS`,
      });
    }
    for (const tb of salas.slice(0, 6)) {
      filas.push({
        t: (TAB_SHORTS[lang]?.[tb.key] ?? tb.short).toUpperCase(),
        v: SALAS_VIVAS.has(tb.key) ? "EN VIVO" : undefined,
        color: SALAS_VIVAS.has(tb.key) ? "#3DDC84" : TEAL,
        d: `sala de vigilancia · un toque para abrirla como pestaña de cromo`,
        a: "abrir sala",
      });
    }
    return filas;
  }, [topSismos, salas, lang, iss, nVuelos, nNoticias, online, peak, quakes.length, sismosLive]);
  useSala3DContenido(
    "observatorio",
    "MURALLA DE VIGILANCIA",
    "#5EEAD4",
    `observatorio en directo · ${quakes.length} sismos · ${online ?? "—"} guerreros en línea`,
    filas3D,
  );
  // v168: oyente de acciones 3D — offset: las salas empiezan tras 2 fijas + 4 sismos
  useEffect(() => {
    const onAccion = (e: Event) => {
      const det = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (det?.tab !== "observatorio" || det.accion !== "abrir sala") return;
      const start = 2 + Math.min(4, topSismos.length);
      const tb = salas[det.idx - start];
      if (tb) irA(tb.key);
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [topSismos.length, salas]);

  return (
    <section className="space-y-5" aria-label={t("obs.titulo")}>
      {/* cabecera de la muralla: reloj + presencia + estado del planeta */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-xl border p-4 sm:p-5 v106-muralla"
        style={{ borderColor: `${TEAL}44`, background: `linear-gradient(160deg, ${TEAL}14, rgba(6,6,10,0.92) 55%)` }}
      >
        {/* barrido de radar decorativo — transform puro, 60 FPS */}
        <div className="v106-radar" aria-hidden />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: TEAL }}>
              <Satellite className="w-3.5 h-3.5" />
              {t("obs.sub")} · {hora}
            </div>
            <h1 className="glitch font-display text-2xl sm:text-3xl font-black tracking-wider text-soft mt-1" data-text={t("obs.titulo")}>
              {t("obs.titulo")}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-xl">{t("obs.linea")}</p>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto shrink-0 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-green-hud/50 bg-green-hud/10 font-mono text-[10px] font-bold text-green-hud uppercase tracking-wide">
              <Users className="w-3.5 h-3.5" />
              {t("obs.online")}: {online ?? "—"}
            </span>
            {peak != null && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-hud/50 bg-amber-hud/10 font-mono text-[10px] font-bold text-amber uppercase tracking-wide">
                <Activity className="w-3.5 h-3.5" />
                {t("obs.pico")}: {peak}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[10px] font-bold uppercase tracking-wide" style={{ borderColor: `${TEAL}55`, color: TEAL, background: `${TEAL}12` }}>
              <Radio className={cargando ? "w-3.5 h-3.5 animate-pulse" : "w-3.5 h-3.5"} />
              {sismosLive ? t("obs.usgsVivo") : t("obs.redLocal")}
            </span>
          </div>
        </div>
      </motion.div>

      {/* muralla en vivo: 4 instrumentos grandes alimentados de APIs reales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* SISMOS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="hud-panel p-4 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <Waves className="w-4 h-4" style={{ color: TEAL }} />
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: TEAL }}>{t("obs.sismos")}</h2>
            <span className="ml-auto font-mono text-[8px] uppercase tracking-widest text-muted-foreground">USGS</span>
          </div>
          {/* v111: el planeta entero con los sismos EN VIVO latiendo sobre él */}
          <div className="mb-3">
            <MiniMapaSismos quakes={quakes} iss={iss} />
          </div>
          {topSismos.length === 0 ? (
            <p className="text-[11px] text-muted-foreground font-mono py-3">{cargando ? t("obs.cargando") : t("obs.sindatos")}</p>
          ) : (
            <ul className="space-y-1.5">
              {topSismos.map((q, i) => (
                <li key={`${q.lat}-${q.time}-${i}`} className="flex items-center gap-2 text-[11px]">
                  <span
                    className="shrink-0 px-1.5 py-0.5 rounded font-mono text-[10px] font-black text-black"
                    style={{ backgroundColor: magColor(q.mag) }}
                  >
                    M{q.mag.toFixed(1)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground/85">{q.place}</span>
                  <span className="shrink-0 font-mono text-[8px] uppercase text-muted-foreground">{haceCuanto(q.time)}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => irA("sismo")}
            className="mt-auto pt-3 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors self-start"
          >
            {t("obs.abrir")} SISMO <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>

        {/* PULSO REAL: ISS + vuelos */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hud-panel p-4 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <Satellite className="w-4 h-4" style={{ color: TEAL }} />
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: TEAL }}>{t("obs.pulso")}</h2>
          </div>
          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">ISS</span>
              <span className="text-foreground/90">
                {iss && typeof iss.lat === "number" && typeof iss.lng === "number"
                  ? `${iss.lat.toFixed(2)}°, ${iss.lng.toFixed(2)}°`
                  : t("obs.sindatos")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{t("obs.vuelos")}</span>
              <span className="text-foreground/90">{nVuelos > 0 ? nVuelos : "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{t("obs.noticias")}</span>
              <span className="text-foreground/90">{nNoticias > 0 ? nNoticias : "—"}</span>
            </div>
          </div>
          <button
            onClick={() => irA("pulso")}
            className="mt-auto pt-3 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors self-start"
          >
            {t("obs.abrir")} PULSO <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>

        {/* PLANETA: eventos de capas (EONET/sismología vía /api/layers) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="hud-panel p-4 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <Activity className="w-4 h-4" style={{ color: TEAL }} />
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: TEAL }}>{t("obs.planeta")}</h2>
          </div>
          <div className="flex-1 flex items-center justify-center py-2">
            <div className="text-center">
              <div className="font-display text-4xl font-black" style={{ color: TEAL, textShadow: `0 0 24px ${TEAL}66` }}>
                {quakes.length > 0 ? quakes.length : "—"}
              </div>
              <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground mt-1">{t("obs.eventos48h")}</div>
            </div>
          </div>
          <button
            onClick={() => irA("planeta")}
            className="mt-auto inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors self-start"
          >
            {t("obs.abrir")} PLANETA <ArrowRight className="w-3 h-3" />
          </button>
        </motion.div>

        {/* SALAS: el índice de vigilancia con contador */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hud-panel p-4 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2.5">
            <Radio className="w-4 h-4" style={{ color: TEAL }} />
            <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: TEAL }}>{t("obs.salas")}</h2>
          </div>
          <div className="flex-1 flex items-center justify-center py-2">
            <div className="text-center">
              <div className="font-display text-4xl font-black text-soft">{salas.length}</div>
              <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground mt-1">{t("obs.salasSub")}</div>
            </div>
          </div>
          <p className="font-mono text-[9px] text-muted-foreground leading-relaxed">{t("obs.salasTexto")}</p>
        </motion.div>
      </div>

      {/* las salas de vigilancia — cada una abre como pestaña de cromo */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw className="w-3.5 h-3.5" style={{ color: TEAL }} />
          <h2 className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: TEAL }}>{t("obs.salasTitulo")}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {salas.map((tb, i) => {
            const acc = accentOfSection("observatorio");
            const viva = SALAS_VIVAS.has(tb.key);
            return (
              <motion.button
                key={tb.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + i * 0.018 }}
                onClick={() => irA(tb.key)}
                title={t("obs.abrirSala")}
                className="group flex items-center gap-2.5 p-3 rounded-xl border bg-[#0b0b12]/70 hover:bg-[#101018]/90 text-left transition-colors"
                style={{ borderColor: `${acc}2b` }}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center border shrink-0"
                  style={{ borderColor: `${acc}44`, color: acc, background: `linear-gradient(150deg, ${acc}1f, rgba(6,6,10,0.9))` }}
                >
                  {TABS[tb.key]?.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-foreground/90 truncate">
                    {TAB_SHORTS[lang]?.[tb.key] ?? tb.short}
                  </span>
                  {viva && (
                    <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest text-green-hud">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-hud blink-soft" /> {t("obs.vivo")}
                    </span>
                  )}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
