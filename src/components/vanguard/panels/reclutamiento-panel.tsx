"use client";

// ============================================================
// VANGUARD v24 — CÓMO SE RECLUTA · MAPA 3D POR BANDOS
// Ucrania, Rusia, Israel, Myanmar y voluntarios internacionales:
// método, edades, pagos, fases del proceso y centros en el globo.
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { RECRUIT_SIDES, type RecruitSide } from "@/lib/dark-data";
import { GlobeMap3D, type Globe3DMarker, type Globe3DArc } from "@/components/vanguard/globe-map-3d";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, GraduationCap, Banknote, Route, ExternalLink } from "lucide-react";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { useSala3DContenido, type FilaContenido3D } from "@/components/vanguard/use-sala3d-contenido";

const KIND_COLOR: Record<string, string> = {
  CENTRO: "#38bdf8",
  ENTRENAMIENTO: "#a855f7",
};

export function ReclutamientoPanel() {
  const [sideIdx, setSideIdx] = useState(0);
  const side = RECRUIT_SIDES[sideIdx];

  const markers = useMemo<Globe3DMarker[]>(
    () =>
      side.markers.map((m, i) => ({
        id: `${side.id}-m${i}`,
        lat: m.lat,
        lng: m.lng,
        color: KIND_COLOR[m.kind] ?? "#38bdf8",
        size: 0.45,
        alt: 0.04,
        label: `${m.kind === "ENTRENAMIENTO" ? "🎓" : "📍"} ${m.name}`,
        ring: true,
        ringMax: 4,
      })),
    [side]
  );

  const arcs = useMemo<Globe3DArc[]>(() => {
    // arcos del primer centro hacia el resto (ruta de recluta)
    if (side.markers.length < 2) return [];
    const [first, ...rest] = side.markers;
    return rest.map((m) => ({
      startLat: first.lat,
      startLng: first.lng,
      endLat: m.lat,
      endLng: m.lng,
      color: ["#38bdf8", "#a855f7"] as [string, string],
      stroke: 0.35,
    }));
  }, [side]);

  // ════════════════════════════════════════════════════════════
  // v168: PARIDAD 2D→3D — el mapa de recluta vive en volumen:
  // los 5 bandos reales (seleccionables desde el mundo), la ficha
  // del bando activo, sus fases y el verificador de Bellingcat
  // ════════════════════════════════════════════════════════════
  const filas3D = useMemo<FilaContenido3D[]>(() => {
    // los bandos encabezan la lista: el idx del 3D = índice en RECRUIT_SIDES (sin offset)
    const filas: FilaContenido3D[] = RECRUIT_SIDES.map((s, i) => ({
      t: s.name.toUpperCase(),
      v: s.method,
      color: i === sideIdx ? "#F5C542" : "#38BDF8",
      d: s.summary,
      a: "ver bando",
    }));
    filas.push(
      { t: `EDADES DE RECLUTA: ${side.ages}`, color: "#38BDF8", d: `Bando activo: ${side.name} · método ${side.method}` },
      { t: `PAGO: ${side.pay}`, color: "#3DDC84", d: `Duración del contrato: ${side.term}` },
      ...side.phases.slice(0, 3).map((ph) => ({
        t: ph.name,
        color: "#7AB8FF",
        d: ph.desc,
      })),
      { t: "LO QUE NO SALE EN LOS ANUNCIOS", color: "#F5C542", d: side.facts[0] ?? "Hechos verificados del bando activo" },
      {
        t: "VERIFICAR EN BELLINGCAT",
        a: "verificar en bellingcat",
        color: "#7AB8FF",
        d: `Abre bellingcat.com con la búsqueda de reclutamiento de ${side.name}`,
      },
    );
    return filas;
  }, [side, sideIdx]);
  useSala3DContenido(
    "recluta",
    "CÓMO SE RECLUTA · MAPA 3D POR BANDOS",
    "#38BDF8",
    `${RECRUIT_SIDES.length} bandos · activo: ${side.name} · ${side.method}`,
    filas3D,
  );

  // v168: oyente de acciones del mundo 3D — mismo setSideIdx que los
  // botones 2D y misma apertura del enlace de Bellingcat
  useEffect(() => {
    const onAccion = (e: Event) => {
      const det = (e as CustomEvent<{ tab: string; accion: string; idx: number }>).detail;
      if (det?.tab !== "recluta") return;
      if (det.accion === "ver bando") {
        // sin offset: las filas de bandos encabezan filas3D, idx = índice en RECRUIT_SIDES
        const s = RECRUIT_SIDES[det.idx];
        if (s) setSideIdx(det.idx);
      } else if (det.accion === "verificar en bellingcat") {
        const s = RECRUIT_SIDES[sideIdx];
        if (s) window.open(`https://www.bellingcat.com/?s=${encodeURIComponent(s.name + " recruitment")}`, "_blank", "noreferrer");
      }
    };
    window.addEventListener("vg:sala3d-accion", onAccion);
    return () => window.removeEventListener("vg:sala3d-accion", onAccion);
  }, [sideIdx]);

  return (
    <div className="space-y-3">
      <HeroOro panel="recluta" />
      <PanelHeader
        title="Cómo se recluta · Mapa 3D por bandos"
        subtitle={`${RECRUIT_SIDES.length} bandos · edades, pagos reales, fases y centros en el globo`}
        icon={<Users className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
      />

      {/* Selector de bandos */}
      <div className="hud-corner p-2 flex items-center gap-1 flex-wrap">
        {RECRUIT_SIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSideIdx(i)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 border text-[9px] font-mono uppercase transition-colors",
              sideIdx === i ? "border-cyan-hud text-cyan-hud bg-cyan-hud/20" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <FlagBadge code={s.flag} size="sm" />
            {s.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-3">
        {/* Globo 3D */}
        <div className="lg:col-span-3">
          <div className="hud-corner overflow-hidden">
            <GlobeMap3D
              markers={markers}
              arcs={arcs}
              height="min(46vh, 460px)"
              autoRotate
              rotateSpeed={0.35}
              atmosphereColor="#38bdf8"
              ariaLabel={`Globo 3D de reclutamiento: ${side.name}`}
            />
          </div>
          <div className="hud-corner p-2 mt-2 flex items-center gap-3 flex-wrap text-[9px] font-mono uppercase text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: KIND_COLOR.CENTRO }} /> centro de reclutamiento</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: KIND_COLOR.ENTRENAMIENTO }} /> polígono de entrenamiento</span>
            <span className="flex items-center gap-1"><Route className="w-3 h-3" /> arcos = ruta del recluta</span>
          </div>
        </div>

        {/* Ficha del bando */}
        <div className="lg:col-span-2 space-y-2">
          <AnimatePresence mode="wait">
            <motion.div key={side.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
              <div className="hud-corner p-3">
                <div className="flex items-center gap-2">
                  <FlagBadge code={side.flag} size="md" />
                  <h3 className="font-mono text-sm font-bold uppercase text-foreground">{side.name}</h3>
                  <span className="ml-auto text-[9px] font-mono px-1.5 py-0.5 border border-cyan-hud/50 text-cyan-hud uppercase">{side.method}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">{side.summary}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="hud-corner p-2 text-center">
                  <Users className="w-3.5 h-3.5 text-cyan-hud mx-auto" />
                  <p className="text-[8px] font-mono uppercase text-muted-foreground mt-1">edades</p>
                  <p className="text-[9px] font-mono text-foreground leading-tight mt-0.5">{side.ages}</p>
                </div>
                <div className="hud-corner p-2 text-center">
                  <Banknote className="w-3.5 h-3.5 text-green-hud mx-auto" />
                  <p className="text-[8px] font-mono uppercase text-muted-foreground mt-1">pago</p>
                  <p className="text-[9px] font-mono text-foreground leading-tight mt-0.5">{side.pay}</p>
                </div>
                <div className="hud-corner p-2 text-center">
                  <GraduationCap className="w-3.5 h-3.5 text-violet-hud mx-auto" />
                  <p className="text-[8px] font-mono uppercase text-muted-foreground mt-1">duración</p>
                  <p className="text-[9px] font-mono text-foreground leading-tight mt-0.5">{side.term}</p>
                </div>
              </div>

              {/* Fases */}
              <div className="hud-corner p-3">
                <p className="text-[10px] font-mono uppercase text-cyan-hud tracking-wider mb-2">el proceso, paso a paso</p>
                <div className="space-y-2">
                  {side.phases.map((ph, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center border border-cyan-hud/50 text-cyan-hud font-mono text-[9px] font-bold">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-foreground leading-tight">{ph.name}</p>
                        <p className="text-[10px] text-muted-foreground leading-snug">{ph.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hechos verificados */}
              <div className="hud-corner p-3">
                <p className="text-[10px] font-mono uppercase text-amber tracking-wider mb-1.5">lo que no sale en los anuncios</p>
                <ul className="space-y-1">
                  {side.facts.map((f, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground leading-snug flex items-start gap-1.5">
                      <span className="text-amber flex-shrink-0">▸</span> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Centros */}
              <div className="hud-corner p-3">
                <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> centros en el mapa
                </p>
                <div className="flex flex-wrap gap-1">
                  {side.markers.map((m) => (
                    <span key={m.name} className="text-[9px] font-mono px-1.5 py-0.5 border border-border text-muted-foreground uppercase">
                      {m.kind === "ENTRENAMIENTO" ? "🎓" : "📍"} {m.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {side.sources.map((s) => (
                    <span key={s} className="text-[8px] font-mono px-1 py-0.5 border border-green-hud/40 text-green-hud uppercase">fuente: {s}</span>
                  ))}
                  <a
                    href={`https://www.bellingcat.com/?s=${encodeURIComponent(side.name + " recruitment")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto flex items-center gap-1 text-[9px] font-mono uppercase text-cyan-hud hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> verificar en bellingcat
                  </a>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
