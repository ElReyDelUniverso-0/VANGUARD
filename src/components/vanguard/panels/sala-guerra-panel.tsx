"use client";

// ============================================================
// v129.0 LA SALA DE GUERRA — EL MANDO SUPREMO
// El mega simulador del Dueño: 6 teatros del planeta (5 en fuego
// + 1 observado) dentro de una sala con cuerpo propio:
//   · EL TEATRO 3D — entrar y ver la guerra representada
//   · EL MAPA MAESTRO — zonas de control, frentes y ciudades
//   · FUERZAS ENFRENTADAS — barras comparadas de los dos bandos
//   · EL BALANCE HUMANO — bajas y desplazados con honestidad
//   · EL PULSO REAL — los cables de la casa por teatro
//   · LA LÍNEA DEL TIEMPO — cómo se llegó hasta aquí
//   · LA BOLSA DE GUERRA — las cuotas de la casa + BETNACIÓN
// HONESTIDAD: estimaciones OSINT editorializadas — Vanguard
// no predice: presenta. (ISW · ACLED · OCHA · ACNUR)
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";
import { TeatroGuerra3D } from "@/components/vanguard/teatro-guerra-3d";
import { sfx } from "@/lib/sound";
import { navigateTo } from "@/lib/nav";
import { cn, q2 } from "@/lib/utils";
import {
  GUERRAS, COLECCION_GUERRAS, guerraDe, COLOR_ESTADO, proyectarTeatro,
  type GuerraActiva, type CiudadGuerra,
} from "@/lib/guerras-activas-data";
import {
  Swords, Radio, Map as MapIcon, Users, HandCoins, History, Scale,
  ChevronRight, Flame, Eye, Crosshair, ArrowUpRight, TriangleAlert,
} from "lucide-react";

const MW = 1000, MH = 520, PAD = 42;
const IW = MW - PAD * 2, IH = MH - PAD * 2;

const xyDe = (g: GuerraActiva, lat: number, lng: number) => {
  const p = proyectarTeatro(lat, lng, g.bbox, IW, IH);
  return { x: p.x + PAD, y: p.y + PAD };
};

function cableDeTeatro(id: string, cables: CableLectura[]): CableLectura[] {
  const kws = (guerraDe(id)?.keywords ?? []).map((k) => k.toLowerCase());
  if (kws.length === 0) return [];
  return cables
    .filter((c) => kws.some((k) => c.title.toLowerCase().includes(k)))
    .slice(0, 4);
}

// ── barra comparada de fuerzas ──
function BarraFuerza({ etiqueta, a, b, ua, ub }: { etiqueta: string; a: number; b: number; ua: string; ub: string }) {
  const max = Math.max(a, b, 1);
  const pa = Math.round((a / max) * 100);
  const pb = Math.round((b / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
        <span className="text-foreground font-bold">{a.toLocaleString("es")} {ua}</span>
        <span>{etiqueta}</span>
        <span className="text-foreground font-bold">{b.toLocaleString("es")} {ub}</span>
      </div>
      <div className="mt-1 h-2.5 rounded-full bg-border/40 relative overflow-hidden flex">
        <div className="h-full rounded-l-full" style={{ width: `${pa / 2}%`, background: "linear-gradient(90deg,#1c5c8f,#5AB8FF)" }} />
        <div className="h-full rounded-r-full ml-auto" style={{ width: `${pb / 2}%`, background: "linear-gradient(270deg,#8f2a1c,#FF6A55)" }} />
      </div>
    </div>
  );
}

export function SalaGuerraPanel() {
  const [selId, setSelId] = useState<string>("ucrania");
  const [cables, setCables] = useState<CableLectura[]>([]);
  const [cableSel, setCableSel] = useState<CableLectura | null>(null);
  const [ciuSel, setCiuSel] = useState<CiudadGuerra | null>(null);

  const guerra: GuerraActiva = guerraDe(selId) ?? GUERRAS[0];
  const meta = { color: guerra.activa ? "#FF4A3A" : "#7FE3FF" };

  // ── el pulso real: cables de la casa, frescos cada 5 minutos ──
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
        })).filter((c) => c.title.length > 12);
        if (cs.length > 0) setCables(cs);
      } catch { /* el frente también vive en silencio */ }
    };
    cargar();
    const id = setInterval(cargar, 300_000);
    return () => { vivo = false; clearInterval(id); };
  }, []);

  const cablesGuerra = useMemo(() => cableDeTeatro(guerra.id, cables), [guerra, cables]);
  const totalSenales = useMemo(
    () => GUERRAS.reduce((s, g) => s + cableDeTeatro(g.id, cables).length, 0),
    [cables],
  );

  const elegir = (id: string) => {
    if (id === selId) return;
    setSelId(id);
    setCiuSel(null);
    sfx.campana();
  };

  return (
    <div className="space-y-5">
      <PanelHeader
        title="LA SALA DE GUERRA"
        subtitle="El mando supremo: seis teatros del planeta, sus mapas, sus fuerzas y sus cuotas — en vivo y con honestidad"
        icon={<Swords className="w-4 h-4" />}
        color="red"
      />

      <HeroOro panel="salaguerra" />

      {/* ── CIFRAS DE LA SALA ── */}
      <div className="flex flex-wrap gap-x-6 gap-y-1.5 justify-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        <span><span className="text-foreground font-bold">{COLECCION_GUERRAS.activas}</span> teatros en fuego</span>
        <span><span className="text-foreground font-bold">{COLECCION_GUERRAS.ciudades}</span> ciudades fichadas</span>
        <span>{COLECCION_GUERRAS.desplazadosTxt}</span>
        {totalSenales > 0 && <span className="text-foreground"><Radio className="inline w-3 h-3 -mt-0.5" /> {totalSenales} señales vivas ahora</span>}
      </div>

      {/* ── SELECTOR DE TEATROS ── */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {GUERRAS.map((g) => {
          const activo = g.id === selId;
          const sen = cableDeTeatro(g.id, cables).length;
          return (
            <button
              key={g.id}
              onClick={() => elegir(g.id)}
              className={cn(
                "flex items-center gap-1.5 rounded border px-2.5 py-1.5 font-mono text-[9px] font-bold tracking-wider transition-all",
                activo ? "border-red-500/70 bg-red-500/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
              )}
              title={g.subtitulo}
            >
              <span>{g.bandoA.bandera}</span>
              {g.nombre.split(" — ")[0]}
              {g.activa ? <Flame className="w-3 h-3 text-red-500" /> : <Eye className="w-3 h-3 text-cyan-hud" />}
              {sen > 0 && <span className="flex items-center gap-0.5" style={{ color: "#D4AF37" }}><Radio className="w-2.5 h-2.5" />{sen}</span>}
            </button>
          );
        })}
      </div>

      {/* ── EL TEATRO 3D — ENTRAR Y VER LA GUERRA ── */}
      <div data-teatro-vivo className="hud-panel p-3">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-red-hud" /> EL TEATRO 3D — {guerra.nombre}
          </p>
          <span className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground hidden sm:inline">
            arrastra para orbitar · rueda para acercar
          </span>
        </div>
        <TeatroGuerra3D key={guerra.id} guerra={guerra} alto={430} />
      </div>

      {/* ── EL MAPA MAESTRO ── */}
      <div className="grid lg:grid-cols-[1.55fr_1fr] gap-4">
        <div className="hud-panel p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
              <MapIcon className="w-3.5 h-3.5 text-red-hud" /> EL MAPA MAESTRO — {guerra.bandoA.nombre} vs {guerra.bandoB.nombre}
            </p>
            <span className="font-mono text-[8px] tracking-widest text-muted-foreground hidden md:inline">ESQUEMA OSINT APROXIMADO</span>
          </div>
          <svg viewBox={`0 0 ${MW} ${MH}`} className="w-full h-auto select-none rounded border border-border/60 bg-[#060a0f]" role="img" aria-label={`Mapa maestro de ${guerra.nombre}`}>
            {/* retícula */}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`v${i}`} x1={PAD + (i * IW) / 8} y1={PAD} x2={PAD + (i * IW) / 8} y2={MH - PAD} stroke="#1a2a3a" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <line key={`h${i}`} x1={PAD} y1={PAD + (i * IH) / 5} x2={MW - PAD} y2={PAD + (i * IH) / 5} stroke="#1a2a3a" strokeWidth="0.5" />
            ))}

            {/* zonas de control */}
            {guerra.zonas.map((z) => {
              const d = z.polygon.map(([la, ln]) => {
                const p = xyDe(guerra, la, ln);
                return `${p.x},${p.y}`;
              }).join(" ");
              const esA = z.bando === "A";
              return (
                <polygon
                  key={z.nombre}
                  points={d}
                  fill={esA ? "rgba(90,184,255,0.12)" : "rgba(255,106,85,0.12)"}
                  stroke={esA ? "#5AB8FF" : "#FF6A55"}
                  strokeWidth="1.2"
                  strokeDasharray="7 5"
                />
              );
            })}

            {/* frentes encendidos */}
            {guerra.frentes.map((f) => {
              const d = f.puntos.map(([la, ln]) => {
                const p = xyDe(guerra, la, ln);
                return `${p.x},${p.y}`;
              }).join(" ");
              return (
                <g key={f.nombre}>
                  <polyline points={d} fill="none" stroke="#FF4A3A" strokeWidth="3.2" strokeLinecap="round" opacity="0.95" className="v129-frente" />
                  <polyline points={d} fill="none" stroke="#FFB49E" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                </g>
              );
            })}

            {/* ciudades fichadas */}
            {guerra.ciudades.map((c) => {
              const p = xyDe(guerra, c.lat, c.lng);
              const color = COLOR_ESTADO[c.estado];
              const activa = ciuSel?.nombre === c.nombre;
              const grande = c.estado === "capital" || c.estado === "frente";
              return (
                <g
                  key={c.nombre}
                  onClick={() => { setCiuSel(c); sfx.campana(); }}
                  className="cursor-pointer"
                  role="button"
                  aria-label={`${c.nombre} — ${c.estado}`}
                >
                  <circle cx={p.x} cy={p.y} r={13} fill="transparent" />
                  {activa && <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="#D4AF37" strokeWidth={1.4} className="v129-anillo" />}
                  <circle cx={p.x} cy={p.y} r={grande ? 5 : 3.4} fill={color} fillOpacity={0.92} />
                  <text
                    x={p.x + 7} y={p.y - 4}
                    fontSize="11"
                    fill={activa ? "#D4AF37" : "var(--muted-foreground)"}
                    fontFamily="monospace"
                    fontWeight="bold"
                    style={{ pointerEvents: "none" }}
                  >
                    {c.nombre}
                  </text>
                </g>
              );
            })}

            {/* brújula + watermark */}
            <g transform={`translate(${MW - PAD - 26}, ${PAD + 20})`}>
              <circle r="13" fill="none" stroke="#2a4a5a" strokeWidth="1" />
              <path d="M 0,-9 L 3.5,4 L 0,1.5 L -3.5,4 Z" fill="#D4AF37" />
              <text y="26" fontSize="9" fill="var(--muted-foreground)" textAnchor="middle" fontFamily="monospace">N</text>
            </g>
            <text x={MW / 2} y={MH - 12} fontSize="9" fill="#4a5a6a" textAnchor="middle" fontFamily="monospace" letterSpacing="3">
              ESQUEMA APROXIMADO · FUENTES ABIERTAS ({guerra.fuente.split(",")[0]}…)
            </text>
          </svg>
          {/* leyenda de estados */}
          <div className="flex items-center gap-3 flex-wrap mt-2 font-mono text-[9px] text-muted-foreground">
            {Array.from(new Set(guerra.ciudades.map((c) => c.estado))).map((e) => (
              <span key={e} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: COLOR_ESTADO[e] }} />
                {e}
              </span>
            ))}
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5 bg-red-500 inline-block" /> línea de frente
            </span>
          </div>
        </div>

        {/* ficha de ciudad + resumen */}
        <div className="space-y-4">
          <div className="hud-panel p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-2">
              <Eye className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> LA CIUDAD TOCADA
            </p>
            {ciuSel ? (
              <motion.div key={ciuSel.nombre} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLOR_ESTADO[ciuSel.estado] }} />
                  <p className="font-caviar text-xl text-foreground leading-none">{ciuSel.nombre}</p>
                  <span className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded border border-border text-muted-foreground">{ciuSel.estado}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-2">{ciuSel.nota ?? "sin notas de la casa — la ciudad respira"}</p>
                <p className="font-mono text-[8px] text-muted-foreground mt-2 tracking-widest">{ciuSel.lat.toFixed(2)}° · {ciuSel.lng.toFixed(2)}°</p>
              </motion.div>
            ) : (
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                Toca cualquier ciudad del mapa maestro: su ficha se abre aquí — estado, nota de la casa y coordenadas.
              </p>
            )}
          </div>

          <div className="hud-panel p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-1.5">
              <Flame className="w-3.5 h-3.5 text-red-hud" /> LO QUE SABEMOS DEL TEATRO
            </p>
            <p className="text-[11px] text-foreground/90 leading-relaxed">{guerra.resumen}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {guerra.actores.map((a) => (
                <span key={a} className="rounded-full border border-border px-2 py-0.5 font-mono text-[8px] tracking-widest text-muted-foreground">{a}</span>
              ))}
            </div>
            <p className="font-mono text-[9px] text-muted-foreground mt-3 leading-relaxed flex gap-1.5">
              <TriangleAlert className="w-3 h-3 shrink-0 mt-0.5 text-amber" />
              <span><span className="text-foreground font-bold">RIESGO GLOBAL:</span> {guerra.riesgoGlobal}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── FUERZAS ENFRENTADAS + BALANCE HUMANO ── */}
      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-4">
        <div className="hud-panel p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
            <Scale className="w-3.5 h-3.5 text-cyan-hud" /> FUERZAS ENFRENTADAS — ESTIMACIÓN OSINT
          </p>
          <div className="flex items-center justify-between font-mono text-[10px] font-bold tracking-wider mb-3">
            <span className="text-[#5AB8FF]">{guerra.bandoA.bandera} {guerra.bandoA.nombre}</span>
            <span className="text-muted-foreground text-[8px] uppercase tracking-widest">desde {guerra.desde}</span>
            <span className="text-[#FF6A55]">{guerra.bandoB.nombre} {guerra.bandoB.bandera}</span>
          </div>
          <div className="space-y-3">
            <BarraFuerza etiqueta="efectivos" a={guerra.bandoA.efectivos} b={guerra.bandoB.efectivos} ua="k" ub="k" />
            <BarraFuerza etiqueta="tanques" a={guerra.bandoA.tanques} b={guerra.bandoB.tanques} ua="" ub="" />
            <BarraFuerza etiqueta="artillería" a={guerra.bandoA.artilleria} b={guerra.bandoB.artilleria} ua="" ub="" />
            <BarraFuerza etiqueta="aeronaves" a={guerra.bandoA.aeronaves} b={guerra.bandoB.aeronaves} ua="" ub="" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-[8px] leading-relaxed">
            <p className="rounded border border-border/60 p-2 text-muted-foreground"><span className="text-foreground">Apoyos A:</span> {guerra.bandoA.apoyos}</p>
            <p className="rounded border border-border/60 p-2 text-muted-foreground"><span className="text-foreground">Apoyos B:</span> {guerra.bandoB.apoyos}</p>
          </div>
        </div>

        <div className="hud-panel p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-2">
            <Users className="w-3.5 h-3.5 text-red-hud" /> EL BALANCE HUMANO
          </p>
          <p className="text-[11px] text-foreground leading-relaxed">{guerra.bajas.texto}</p>
          <p className="text-[10px] text-muted-foreground italic leading-relaxed mt-1.5">{guerra.bajas.nota}</p>
          <div className="mt-3 pt-3 border-t border-border/60">
            <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground">los que marchan</p>
            <p className="text-[11px] text-foreground font-bold leading-relaxed mt-1">{guerra.desplazados}</p>
          </div>
          <p className="font-mono text-[8px] text-muted-foreground mt-3 leading-relaxed tracking-wide">
            FUENTE: {guerra.fuente}
          </p>
        </div>
      </div>

      {/* ── EL PULSO REAL ── */}
      <div className="hud-panel p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-red-hud" /> EL PULSO REAL — {guerra.nombre.split(" — ")[0]} EN LOS CABLES DE AHORA
        </p>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-1 mb-3">
          Señales auténticas recibidas por la Casa en este momento, filtradas por las palabras del teatro.
          Se leen aquí mismo — la Casa nunca manda a otro portal.
        </p>
        {cablesGuerra.length > 0 ? (
          <div className="space-y-1.5">
            {cablesGuerra.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCableSel(c); sfx.campana(); }}
                className="w-full text-left rounded border border-border px-3 py-2 transition-all hover:border-foreground/30"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[7px] font-bold tracking-widest"
                    style={{ background: "rgba(255,74,58,0.12)", color: "#FF6A55" }}
                  >
                    {c.conflictTag ?? c.tacticalTag ?? "SEÑAL"}
                  </span>
                  <span className="text-[10px] text-foreground leading-snug">{c.title}</span>
                </span>
                <span className="block font-mono text-[8px] text-muted-foreground mt-1 uppercase tracking-wider">
                  {c.source} · {new Date(c.publishedAt).toLocaleDateString("es", { day: "numeric", month: "short" })} · leer en la sala interna
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground italic leading-relaxed rounded border border-dashed border-border px-4 py-5 text-center">
            El frente está en silencio para las palabras de este teatro en la franja actual — el pulso se renueva cada cinco minutos.
          </p>
        )}
      </div>

      {/* ── LÍNEA DEL TIEMPO + BOLSA DE GUERRA ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="hud-panel p-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-3">
            <History className="w-3.5 h-3.5 text-amber" /> LA LÍNEA DEL TIEMPO — CÓMO SE LLEGÓ AQUÍ
          </p>
          <div className="relative pl-5 space-y-3">
            <span className="absolute left-1.5 top-1 bottom-1 w-px bg-gradient-to-b from-red-500/70 via-border to-transparent" />
            {guerra.hitos.map((h, i) => (
              <motion.div
                key={h.fecha}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: q2(i * 0.05), duration: 0.3 }}
                className="relative"
              >
                <span className="absolute -left-[1.35rem] top-1 w-2 h-2 rounded-full bg-red-500/80 ring-2 ring-background" />
                <p className="font-mono text-[8px] font-bold tracking-[0.2em] text-red-400">{h.fecha}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{h.evento}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="hud-panel p-4 flex flex-col">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-2">
            <HandCoins className="w-3.5 h-3.5 text-amber" /> LA BOLSA DE GUERRA — CUOTAS DE LA CASA
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
            Los escenarios que la sala vigila, con la cuota que BetNación paga si aciertas.
            Son estimaciones editorializadas del equipo OSINT — Vanguard no predice: presenta.
          </p>
          <div className="space-y-1.5 flex-1">
            {guerra.apuestas.map((a, i) => (
              <motion.div
                key={a.escenario}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: q2(i * 0.05), duration: 0.3 }}
                className="flex items-center justify-between gap-2 rounded border border-border px-3 py-2"
              >
                <span className="text-[10px] text-foreground leading-snug">{a.escenario}</span>
                <span className="shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-bold" style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37" }}>
                  {a.cuota}
                </span>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => { sfx.campana(); navigateTo("bookmaker"); }}
              className="rounded border border-amber-hud/50 bg-amber-hud/10 px-3 py-2 font-mono text-[9px] font-bold tracking-widest text-amber flex items-center justify-center gap-1 hover:bg-amber-hud/20 transition-all"
            >
              <HandCoins className="w-3 h-3" /> BETNACIÓN <ArrowUpRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => { sfx.campana(); navigateTo("laboratorio"); }}
              className="rounded border border-border px-3 py-2 font-mono text-[9px] font-bold tracking-widest text-muted-foreground flex items-center justify-center gap-1 hover:text-foreground hover:border-foreground/30 transition-all"
            >
              ¿Y SI...? <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* lectura interna */}
      {cableSel && <LectorNoticia cable={cableSel} onCerrar={() => setCableSel(null)} />}
    </div>
  );
}