"use client";

// ============================================================
// v362.0 EL TIEMPO REAL — FASE 3 del mandato del Dueño
// («la máquina del tiempo debe tener todos los conflictos,
// mapas y escenarios 3D interactivos, líderes y demás datos»)
// EL MUNDO EN LA MÁQUINA: los SEIS TEATROS REALES de la Sala de
// Guerra viajan por el tiempo con TRES piezas que ya existían:
//   ① LA LÍNEA REAL: el reproductor de hitos (cronología de la
//      guerra, fecha a fecha, con latido honesto del mapa v361).
//   ② EL MAPA DEL TEATRO: la proyección real del teatro (zonas
//      de control, frentes y ciudades con su COLOR_ESTADO del
//      mapa maestro — CERO datos inventados, solo la fuente).
//   ③ EL ESCENARIO 3D: el TeatroGuerra3D de la Sala de Guerra
//      (v129) embebido en SU PROPIO CHUNK (ley v193) — cero
//      duplicación del motor, terreno/ciudades/frentes/unidades
//      procedurales intactos.
//   ④ LOS LÍDERES: los rostros del poder (v130) que están en la
//      mesa del teatro — SOLO los del catálogo que coinciden con
//      bandos y actores publicados; si nadie coincide, se
//      confiesa. Los demás datos: fuerzas, bajas con nota
//      honesta, desplazados, riesgo global, cuotas y FUENTE.
// Doctrina: Vanguard no predice — presenta. Todo sale de
// src/lib/guerras-activas-data.ts y src/lib/personas-data.ts.
// ============================================================

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play, Pause, ChevronLeft, ChevronRight, Globe2, Users, Crosshair, Skull,
  Plane, AlertTriangle, Coins, Landmark, MapPin, Box, Atom,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { GuerraActiva } from "@/lib/guerras-activas-data";
import { COLOR_ESTADO } from "@/lib/guerras-activas-data";
import { ROSTROS, type Rostro } from "@/lib/personas-data";
// v363.0 LA CASA DESCUBRE — visitar la mesa de un teatro revela a sus
// líderes en el álbum ilustrado (el sello conserva la primera fecha)
import { useColeccionVanguard } from "@/lib/fichas-coleccion-data";

// v362: el escenario 3D viaja en SU PROPIO CHUNK (ley v193) — three.js no
// pesa en la primera pintura de la máquina; la sala de guerra ya lo usa así
const TeatroGuerra3D = dynamic(
  () => import("@/components/vanguard/teatro-guerra-3d").then((m) => m.TeatroGuerra3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[430px] items-center justify-center rounded-2xl border border-white/10 bg-black/40">
        <span className="animate-pulse font-mono text-[11px] tracking-widest text-white/40">
          DESPLEGANDO EL ESCENARIO 3D…
        </span>
      </div>
    ),
  },
);

const MS_LATIDO = 5_000;
const MS_PAUSA_INTERACCION = 12_000;

// el aparato pidió menos movimiento: suscripción limpia por useSyncExternalStore
// (cero setState en effects — ley v335) — en servidor no hay matchMedia
const suscribirReducido = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const leerReducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reducidoServidor = () => false;

// ── los alias que la casa ya usa en bandos y actores (fuente publicada) ──
const ALIAS_PAIS: Record<string, string[]> = {
  "Estados Unidos": ["EE. UU.", "EE.UU.", "EEUU", "Estados Unidos"],
  "Unión Europea": ["UE", "Unión Europea"],
};

/** Los rostros del catálogo (v130) que están EN LA MESA del teatro:
 *  la coincidencia es por país/organización publicada en bandos,
 *  apoyos y actores — jamás una suposición de la casa. */
export function lideresDeGuerra(g: GuerraActiva): Rostro[] {
  const mesa = [g.bandoA.nombre, g.bandoB.nombre, g.bandoA.apoyos, g.bandoB.apoyos, ...g.actores]
    .join(" · ");
  return ROSTROS.filter((r) => {
    const variantes = ALIAS_PAIS[r.pais] ?? [r.pais];
    return variantes.some((v) => mesa.includes(v));
  });
}

// ── la proyección real del teatro: equirectangular sobre el bbox publicado ──
const W_MAPA = 760;
const H_MAPA = 520;
const PAD_MAPA = 30;

function proyeccionDe(g: GuerraActiva) {
  const { minLat, maxLat, minLng, maxLng } = g.bbox;
  const px = (lng: number) =>
    PAD_MAPA + ((lng - minLng) / Math.max(0.0001, maxLng - minLng)) * (W_MAPA - PAD_MAPA * 2);
  const py = (lat: number) =>
    H_MAPA - PAD_MAPA - ((lat - minLat) / Math.max(0.0001, maxLat - minLat)) * (H_MAPA - PAD_MAPA * 2);
  return { px, py };
}

const COLOR_BANDO = { A: "#3DDCFF", B: "#FF4A3A" } as const;

export function MaquinaMundo({ guerra }: { guerra: GuerraActiva }) {
  const totalHitos = guerra.hitos.length;
  const [hito, setHito] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [ciudad, setCiudad] = useState<number | null>(null);
  const reducido = useSyncExternalStore(suscribirReducido, leerReducido, reducidoServidor);
  const ultimaInteraccion = useRef(0);

  // UN solo latido del reproductor: avanza el hito si está tocando y nadie
  // interactuó hace poco (el patrón honesto del mapa v361, ley v196/v335)
  useEffect(() => {
    if (!tocando) return;
    const t = setInterval(() => {
      if (reducido) return;
      if (Date.now() - ultimaInteraccion.current < MS_PAUSA_INTERACCION) return;
      setHito((h) => (h + 1) % totalHitos);
    }, MS_LATIDO);
    return () => clearInterval(t);
  }, [tocando, reducido, totalHitos]);

  const anotar = () => { ultimaInteraccion.current = Date.now(); };

  const saltarHito = (d: number) => {
    anotar();
    setHito((h) => (h + d + totalHitos) % totalHitos);
  };

  const { px, py } = useMemo(() => proyeccionDe(guerra), [guerra]);
  const lideres = useMemo(() => lideresDeGuerra(guerra), [guerra]);
  const hitoActual = guerra.hitos[Math.min(hito, totalHitos - 1)] ?? guerra.hitos[0];
  const ciudadSel = ciudad != null ? guerra.ciudades[ciudad] : null;

  // ── v363.0 LA MESA DEL TEATRO DESCUBRE — entrar al teatro revela a los
  // rostros del poder publicados en su mesa; el álbum jamás bloquea la máquina
  const mesaAnunciada = useRef("");
  useEffect(() => {
    try {
      const nuevas: string[] = [];
      for (const l of lideres) {
        if (useColeccionVanguard.getState().descubrir(`lider:${l.id}`, "mesa")) nuevas.push(l.nombre);
      }
      if (nuevas.length && mesaAnunciada.current !== guerra.id) {
        mesaAnunciada.current = guerra.id;
        toast.success(`MESA DEL TEATRO · ${nuevas.length} EXPEDIENTE${nuevas.length > 1 ? "S" : ""} ENTRAN AL ÁLBUM`, {
          description: nuevas.join(" · "),
          duration: 5000,
        });
      }
    } catch { /* el álbum jamás bloquea la máquina del tiempo */ }
  }, [lideres, guerra.id]);

  return (
    <div className="space-y-3" data-testid="maquina-mundo">
      {/* ── ① LA LÍNEA REAL: el reproductor de hitos ── */}
      <div
        data-testid="maquina-mundo-reproductor"
        className="rounded-2xl border border-red-400/25 bg-gradient-to-br from-red-400/10 to-black/60 p-3.5"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-red-300">
            <Globe2 className="h-3.5 w-3.5" /> la línea real · {totalHitos} hitos verificables
          </span>
          <span className="font-mono text-[10px] text-white/40">desde {guerra.desde}</span>
        </div>

        <motion.div
          key={hito}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-2.5"
        >
          <div className="font-mono text-lg font-black tracking-wide text-amber-100">
            {hitoActual?.fecha}
          </div>
          <p className="mt-1 text-[13px] font-semibold leading-snug text-white/85">
            {hitoActual?.evento}
          </p>
        </motion.div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => { anotar(); setTocando((t) => !t); }}
            aria-label={tocando ? "Pausar la cronología" : "Reproducir la cronología"}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition active:scale-95",
              tocando ? "border-red-400/60 bg-red-400/15 text-red-200" : "border-white/15 bg-white/5 text-white/70 hover:border-white/30",
            )}
          >
            {tocando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => saltarHito(-1)}
            aria-label="Hito anterior"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition active:scale-95 hover:border-white/30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => saltarHito(1)}
            aria-label="Hito siguiente"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition active:scale-95 hover:border-white/30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="flex flex-1 flex-wrap items-center gap-1" data-testid="maquina-mundo-hitos">
            {guerra.hitos.map((_, i) => (
              <button
                key={i}
                onClick={() => { anotar(); setHito(i); }}
                aria-label={`Ir al hito ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === hito ? "w-5 bg-red-300" : "w-2 bg-white/20 hover:bg-white/40",
                )}
              />
            ))}
            <span className="ml-1 font-mono text-[9px] text-white/35">
              {hito + 1}/{totalHitos}
            </span>
          </div>
        </div>
      </div>

      {/* ── ② EL MAPA DEL TEATRO: la proyección real de la fuente ── */}
      <div className="rounded-2xl border border-white/12 bg-black/40 p-3.5" data-testid="maquina-mundo-mapa">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-cyan-300">
            <MapPin className="h-3.5 w-3.5" /> el mapa del teatro · toca una ciudad
          </span>
          <span className="font-mono text-[9px] text-white/35">
            esquema OSINT aproximado — no cartografía oficial
          </span>
        </div>
        <div className="mt-2 overflow-x-auto">
          <svg
            data-testid="maquina-mundo-svg"
            viewBox={`0 0 ${W_MAPA} ${H_MAPA}`}
            className="h-auto w-full min-w-[560px] rounded-xl bg-[#050b12]"
            role="img"
            aria-label={`Mapa del teatro ${guerra.nombre}`}
          >
            {/* las zonas de control publicadas */}
            {guerra.zonas.map((z, i) => (
              <polygon
                key={i}
                points={z.polygon.map(([lat, lng]) => `${px(lng)},${py(lat)}`).join(" ")}
                fill={z.bando === "A" ? COLOR_BANDO.A : COLOR_BANDO.B}
                fillOpacity={0.09}
                stroke={z.bando === "A" ? COLOR_BANDO.A : COLOR_BANDO.B}
                strokeOpacity={0.45}
                strokeWidth={1.4}
                strokeDasharray="5 4"
              >
                <title>{`${z.nombre} — bando ${z.bando}`}</title>
              </polygon>
            ))}
            {/* los frentes publicados */}
            {guerra.frentes.map((f, i) => (
              <polyline
                key={i}
                points={f.puntos.map(([lat, lng]) => `${px(lng)},${py(lat)}`).join(" ")}
                fill="none"
                stroke="#FF4A3A"
                strokeWidth={2.4}
                strokeOpacity={0.85}
                strokeLinecap="round"
                strokeDasharray="2 5"
              >
                <title>{f.nombre}</title>
              </polyline>
            ))}
            {/* el centro del teatro: el anillo del foco */}
            <circle cx={px(guerra.lng)} cy={py(guerra.lat)} r={9} fill="none" stroke="#FFC94D" strokeOpacity={0.7} strokeWidth={1.6} />
            <circle cx={px(guerra.lng)} cy={py(guerra.lat)} r={3} fill="#FFC94D" />
            {/* las ciudades con su estado real (mapa maestro) */}
            {guerra.ciudades.map((c, i) => (
              <g
                key={i}
                data-testid={`maquina-mundo-ciudad-${i}`}
                onClick={() => { anotar(); setCiudad(i === ciudad ? null : i); }}
                className="cursor-pointer"
                role="button"
                aria-label={`${c.nombre}: ${c.estado}`}
              >
                <circle cx={px(c.lng)} cy={py(c.lat)} r={5.5} fill={COLOR_ESTADO[c.estado]}>
                  <title>{`${c.nombre} — ${c.estado.toUpperCase()}${c.nota ? ` · ${c.nota}` : ""}`}</title>
                </circle>
                {ciudad === i && (
                  <circle cx={px(c.lng)} cy={py(c.lat)} r={10} fill="none" stroke="#FFFFFF" strokeWidth={1.6} strokeOpacity={0.9} />
                )}
                <text
                  x={px(c.lng)}
                  y={py(c.lat) - 9}
                  textAnchor="middle"
                  className="fill-white/75"
                  fontSize={9.5}
                  fontWeight={700}
                >
                  {c.nombre}
                </text>
              </g>
            ))}
          </svg>
        </div>
        {/* leyenda de estados (los colores del mapa maestro) */}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[9px] text-white/45">
          {(["capital", "segura", "contendida", "frente", "sitio", "ocupada", "puerto", "observada"] as const).map((e) => (
            <span key={e} className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLOR_ESTADO[e] }} />
              {e.toUpperCase()}
            </span>
          ))}
        </div>
        {ciudadSel && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-xl border border-cyan-400/30 bg-cyan-400/[0.06] px-3 py-2"
            data-testid="maquina-mundo-ciudad-ficha"
          >
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-black text-cyan-200">{ciudadSel.nombre}</span>
              <span className="rounded-full border border-cyan-400/40 px-1.5 py-0.5 font-mono text-[8px] font-black tracking-wider text-cyan-300">
                {ciudadSel.estado.toUpperCase()}
              </span>
            </div>
            {ciudadSel.nota && <p className="mt-0.5 text-[11px] leading-snug text-white/65">{ciudadSel.nota}</p>}
          </motion.div>
        )}
      </div>

      {/* ── ③ EL ESCENARIO 3D: el motor de la Sala de Guerra, en su chunk ── */}
      <div data-testid="maquina-mundo-3d" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-400/35 bg-amber-400/10 px-3 py-2">
          <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-200">
            VANGUARD MOTOR 3D CON EDIFICIOS OSM + ESCUADRONES REALES
          </span>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={`/teatro-3d?modulo=mundial&lat=${guerra.lat}&lng=${guerra.lng}&nombre=${encodeURIComponent(guerra.nombre)}`}
              className="inline-flex items-center gap-1 rounded-lg bg-[#FFC94D] px-2.5 py-1 font-mono text-[10px] font-black text-black hover:bg-[#ffd66b]"
            >
              <Box className="h-3 w-3" /> ABRIR EN SIMULADOR 3D COMPLETO →
            </Link>
            <Link
              href="/teatro-3d?modo=libre"
              className="inline-flex items-center gap-1 rounded-lg border border-red-400/45 bg-red-400/15 px-2.5 py-1 font-mono text-[10px] font-black text-red-200 hover:bg-red-400/25"
            >
              <Atom className="h-3 w-3" /> MODO LIBRE + NUCLEAR →
            </Link>
          </div>
        </div>
        <TeatroGuerra3D key={guerra.id} guerra={guerra} alto={430} />
      </div>

      {/* ── ④ LOS LÍDERES Y LOS BANDOS: la mesa del teatro ── */}
      <div className="rounded-2xl border border-white/12 bg-black/40 p-3.5">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-amber-300">
          <Users className="h-3.5 w-3.5" /> los bandos y sus fuerzas (estimaciones OSINT)
        </span>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {[guerra.bandoA, guerra.bandoB].map((b, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl border px-3 py-2.5",
                i === 0 ? "border-cyan-400/25 bg-cyan-400/[0.05]" : "border-red-400/25 bg-red-400/[0.05]",
              )}
            >
              <div className="flex items-center gap-1.5 text-[13px] font-black text-white/90">
                <span>{b.bandera}</span> {b.nombre}
                <span className={cn("ml-auto font-mono text-[8px] font-black tracking-wider", i === 0 ? "text-cyan-300" : "text-red-300")}>
                  BANDO {i === 0 ? "A" : "B"}
                </span>
              </div>
              <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[10px] text-white/60">
                <span>efectivos: <b className="text-white/85">{b.efectivos}k</b></span>
                <span>tanques: <b className="text-white/85">{b.tanques}</b></span>
                <span>artillería: <b className="text-white/85">{b.artilleria}</b></span>
                <span>aeronaves: <b className="text-white/85">{b.aeronaves}</b></span>
              </div>
              <p className="mt-1 text-[10px] leading-snug text-white/45">apoyos: {b.apoyos}</p>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-violet-300">
            <Landmark className="h-3.5 w-3.5" /> los rostros en la mesa (catálogo del poder v130)
          </span>
          {lideres.length > 0 ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2" data-testid="maquina-mundo-lideres">
              {lideres.map((r) => (
                <div key={r.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{r.bandera}</span>
                    <div className="min-w-0">
                      <div className="truncate text-[12.5px] font-black text-white/90">{r.nombre}</div>
                      <div className="truncate font-mono text-[9px] text-white/45">{r.cargo}</div>
                    </div>
                    <span className="ml-auto shrink-0 rounded-full border border-violet-400/40 bg-violet-400/10 px-1.5 py-0.5 font-mono text-[8px] font-black text-violet-300">
                      PODER {r.poder}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 font-mono text-[9px] text-white/45">
                    <span>mandato: {r.mandato}</span>
                    <span>en la mesa: {r.pais}</span>
                  </div>
                  {r.frase && (
                    <p className="mt-1 border-l-2 border-violet-400/40 pl-2 text-[10.5px] italic leading-snug text-white/55">
                      «{r.frase}»
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] leading-snug text-white/50">
              Ningún rostro del catálogo del poder está publicado en la mesa de este teatro — la casa no suple con suposiciones: aquí mandan las fuerzas y las facciones de la fuente.
            </p>
          )}
        </div>
      </div>

      {/* ── ⑤ LOS DEMÁS DATOS: bajas, desplazados, riesgo, cuotas, fuente ── */}
      <div className="rounded-2xl border border-white/12 bg-black/40 p-3.5">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-red-300">
          <Skull className="h-3.5 w-3.5" /> los demás datos del teatro
        </span>
        <div className="mt-2 space-y-2 text-[11.5px] leading-relaxed text-white/70">
          <p><Crosshair className="mr-1.5 inline h-3.5 w-3.5 text-red-300" /><b className="text-white/85">Bajas:</b> {guerra.bajas.texto}</p>
          <p className="border-l-2 border-white/15 pl-2 font-mono text-[10px] text-white/45">{guerra.bajas.nota}</p>
          <p><AlertTriangle className="mr-1.5 inline h-3.5 w-3.5 text-amber-300" /><b className="text-white/85">Desplazados:</b> {guerra.desplazados}</p>
          <p><Plane className="mr-1.5 inline h-3.5 w-3.5 text-cyan-300" /><b className="text-white/85">Actores en la mesa:</b> {guerra.actores.join(" · ")}</p>
          <p><Globe2 className="mr-1.5 inline h-3.5 w-3.5 text-violet-300" /><b className="text-white/85">Riesgo global:</b> {guerra.riesgoGlobal}</p>
        </div>
        {guerra.apuestas.length > 0 && (
          <div className="mt-2.5">
            <div className="flex items-center gap-1.5 font-mono text-[9px] font-black uppercase tracking-widest text-emerald-300">
              <Coins className="h-3 w-3" /> las cuotas de la casa (juego, no pronóstico)
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {guerra.apuestas.map((a, i) => (
                <span key={i} className="rounded-full border border-emerald-400/30 bg-emerald-400/[0.07] px-2 py-0.5 font-mono text-[9px] text-emerald-200/90">
                  {a.escenario}: {a.cuota}
                </span>
              ))}
            </div>
          </div>
        )}
        <p className="mt-2.5 border-t border-white/10 pt-2 font-mono text-[9px] text-white/35">
          fuente: {guerra.fuente} · intensidad publicada {guerra.intensidad}/100 · escalada {guerra.escalada}/5 ·
          Vanguard no predice: presenta.
        </p>
      </div>
    </div>
  );
}
