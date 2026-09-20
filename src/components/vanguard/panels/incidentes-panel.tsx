"use client";

// ============================================================
// VANGUARD v24 — MAPA DE INCIDENTES EN VIVO
// Globo 3D con marcadores de cada incidente documentado, ficha
// de "qué está pasando" y CÁMARAS DE SEGURIDAD con advertencia
// de contenido gráfico (doble confirmación + blur).
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { INCIDENTS, INCIDENT_TYPE_META, type Incident } from "@/lib/dark-data";
import { GlobeMap3D, type Globe3DMarker } from "@/components/vanguard/globe-map-3d";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, EyeOff, Eye, X, Radio, AlertTriangle, MapPin, Skull, ExternalLink } from "lucide-react";

import { isStrict18 } from "@/lib/safety";

const LS_SALA18 = "vanguard_sala18_ok";

function CameraTile({ incident, cam, unlocked, strict }: { incident: Incident; cam: Incident["cameras"][number]; unlocked: boolean; strict: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const show = unlocked && revealed;
  return (
    <div className="relative border border-red-hud/40 overflow-hidden bg-black/60 aspect-video">
      {/* overlay estilo CCTV */}
      <div className="absolute inset-0" style={{ background: show ? "radial-gradient(ellipse at 40% 40%, #1a1a1a 0%, #050505 100%)" : "radial-gradient(ellipse at 40% 40%, #141414 0%, #050505 100%)", filter: show ? "none" : "blur(10px)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)" }} />
      {!show && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 z-10">
          <EyeOff className="w-6 h-6 text-red-hud" />
          <p className="text-[9px] font-mono uppercase text-red-hud text-center px-3 leading-relaxed">
            contenido gráfico · se muestra con advertencia
          </p>
        </div>
      )}
      {show && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 z-10">
          <AlertTriangle className="w-5 h-5 text-amber" />
          <p className="text-[9px] font-mono uppercase text-muted-foreground text-center px-4 leading-relaxed">
            cinta de archivo · {cam.name} · {cam.angle}
          </p>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(incident.name + " footage investigation")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-center gap-1 text-[9px] font-mono uppercase text-cyan-hud hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> abrir fuente verificada
          </a>
        </div>
      )}
      {/* HUD de cámara */}
      <div className="absolute top-1 left-1.5 right-1.5 flex items-center justify-between z-20">
        <span className="flex items-center gap-1 text-[8px] font-mono text-red-hud">
          <span className="w-1.5 h-1.5 rounded-full bg-red-hud blink-soft" /> REC
        </span>
        <span className="text-[8px] font-mono text-muted-foreground">{cam.lastSeen}</span>
      </div>
      <div className="absolute bottom-1 left-1.5 z-20">
        <span className="text-[8px] font-mono text-muted-foreground">{cam.id} · {incident.name}</span>
      </div>
      <div className="absolute bottom-1 right-1.5 z-20 flex gap-1">
        {unlocked && !strict ? (
          <button
            onClick={() => setRevealed((v) => !v)}
            aria-label={show ? "Ocultar cinta" : "Revelar cinta con advertencia"}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-black/70 border border-red-hud/60 text-[8px] font-mono uppercase text-red-hud hover:bg-red-hud/30 transition-colors"
          >
            {show ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
            {show ? "ocultar" : "ver con advertencia"}
          </button>
        ) : (
          <button
            onClick={() => toast.error(strict ? "Oculto por tu MODO ESTRICTO 18+ (Ajustes)" : "Activa el acceso 18+ en la SALA ROJA primero")}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-black/70 border border-border text-[8px] font-mono uppercase text-muted-foreground"
          >
            🔒 bloqueada
          </button>
        )}
      </div>
    </div>
  );
}

export function IncidentesPanel() {
  const [type, setType] = useState<string>("TODOS");
  const [selected, setSelected] = useState<Incident | null>(null);
  // el acceso 18+ se activa en la SALA ROJA (persistente) — init lazy, es panel client-only
  const [sala18] = useState(() => {
    try {
      return localStorage.getItem(LS_SALA18) === "yes";
    } catch {
      return false;
    }
  });
  // v26 MODO ESTRICTO 18+: cintas CCTV ocultas por completo, sin revelar
  const [strict] = useState(() => isStrict18());

  const list = useMemo(() => (type === "TODOS" ? INCIDENTS : INCIDENTS.filter((i) => i.type === type)), [type]);

  const markers = useMemo<Globe3DMarker[]>(
    () =>
      list.map((inc) => ({
        id: inc.id,
        lat: inc.lat,
        lng: inc.lng,
        color: INCIDENT_TYPE_META[inc.type].color,
        size: inc.status === "ACTIVO" ? 0.55 : 0.4,
        alt: inc.status === "ACTIVO" ? 0.06 : 0.02,
        label: `${INCIDENT_TYPE_META[inc.type].icon} ${inc.name} — ${INCIDENT_TYPE_META[inc.type].label}`,
        ring: inc.status === "ACTIVO",
        ringMax: inc.status === "ACTIVO" ? 5 : 2.5,
        onClick: () => setSelected(inc),
      })),
    [list]
  );

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Mapa de incidentes · Qué está pasando ahora"
        subtitle={`${INCIDENTS.length} incidentes documentados · ${INCIDENTS.filter((i) => i.status === "ACTIVO").length} activos · con cámaras`}
        icon={<MapPin className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <span className={cn("text-[9px] font-mono px-2 py-1 border uppercase", sala18 ? "border-green-hud text-green-hud" : "border-red-hud text-red-hud")}>
            {sala18 ? "18+ activado" : "18+ bloqueado"}
          </span>
        }
      />

      {/* Globo 3D */}
      <div className="hud-corner overflow-hidden">
        <GlobeMap3D
          markers={markers}
          height="min(52vh, 520px)"
          autoRotate
          rotateSpeed={0.3}
          atmosphereColor="#ff5533"
          ariaLabel="Globo 3D de incidentes"
        />
      </div>

      {/* Leyenda + filtros */}
      <div className="hud-corner p-2 space-y-2">
        <div className="flex items-center gap-2 flex-wrap text-[9px] font-mono uppercase">
          {Object.entries(INCIDENT_TYPE_META).map(([k, m]) => (
            <button
              key={k}
              onClick={() => setType(k)}
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 border transition-colors",
                type === k ? "border-red-hud text-red-hud bg-red-hud/20" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
              {m.icon} {m.label.toLowerCase()}
            </button>
          ))}
          <button
            onClick={() => setType("TODOS")}
            className={cn(
              "px-1.5 py-0.5 border transition-colors",
              type === "TODOS" ? "border-red-hud text-red-hud bg-red-hud/20" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            todos ({INCIDENTS.length})
          </button>
        </div>
      </div>

      {/* Lista compacta */}
      <div className="grid gap-2 sm:grid-cols-2">
        {list.map((inc, i) => {
          const m = INCIDENT_TYPE_META[inc.type];
          return (
            <motion.article
              key={inc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="hud-corner p-3 hover:bg-secondary/40 transition-colors cursor-pointer group"
              onClick={() => setSelected(inc)}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-border bg-secondary/40 text-sm">{m.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <FlagBadge code={inc.country} size="sm" />
                    <span className="text-[9px] font-mono px-1 py-0.5 border uppercase" style={{ borderColor: `${m.color}66`, color: m.color }}>
                      {inc.status === "ACTIVO" ? "● activo" : "documentado"}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground ml-auto">desde {inc.since}</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-red-hud transition-colors leading-tight">{inc.name}</h3>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{inc.summary}</p>
                  <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Skull className="w-3 h-3" /> {inc.deaths}</span>
                    <span className="flex items-center gap-0.5"><Camera className="w-3 h-3" /> {inc.cameras.length} cámara(s)</span>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Ficha de incidente con cámaras */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
            role="dialog" aria-modal="true"
          >
            <div className="hud-panel border-red-hud max-w-2xl w-full max-h-[88vh] overflow-y-auto thin-scroll p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <FlagBadge code={selected.country} size="sm" />
                    <span className="text-[9px] font-mono px-1.5 py-0.5 border uppercase" style={{ borderColor: `${INCIDENT_TYPE_META[selected.type].color}66`, color: INCIDENT_TYPE_META[selected.type].color }}>
                      {INCIDENT_TYPE_META[selected.type].label}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">desde {selected.since}</span>
                  </div>
                  <h3 className="font-mono text-base font-bold text-foreground leading-tight">{selected.name}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    📍 {selected.lat.toFixed(2)}, {selected.lng.toFixed(2)} · 💀 {selected.deaths}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Cerrar" className="p-1 border border-border hover:border-red-hud text-muted-foreground hover:text-red-hud transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed mt-3">{selected.summary}</p>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {selected.sources.map((s) => (
                  <span key={s} className="text-[9px] font-mono px-1.5 py-0.5 border border-green-hud/40 text-green-hud uppercase">fuente: {s}</span>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-mono uppercase text-red-hud tracking-wider mb-2 flex items-center gap-1.5">
                  <Radio className="w-3 h-3" /> cámaras de seguridad asociadas
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {selected.cameras.map((cam) => (
                    <CameraTile key={cam.id} incident={selected} cam={cam} unlocked={sala18} strict={strict} />
                  ))}
                </div>
                <p className="text-[9px] font-mono text-muted-foreground mt-2 leading-relaxed">
                  Las cintas completas no se alojan en VANGUARD: se enlaza siempre a la fuente documental verificada
                  (agencias u organismos). VANGUARD no sirve contenido gore sin advertencia y sin contexto.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
