"use client";

import { useEffect, useMemo, useState } from "react";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { CONFLICTS, BRIEFINGS, type AlertLevel } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { Newspaper, AlertTriangle, Flame, TrendingUp, Globe, Clock, Zap, Eye, ChevronRight, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { HeroOro } from "@/components/vanguard/hero-oro";
// v122 INTEL EN VIVO: los cables REALES de la casa leídos DENTRO del briefing
import { LectorNoticia, type CableLectura } from "@/components/vanguard/lector-noticia";

const levelColor: Record<AlertLevel, string> = {
  CRITICO: "text-red-hud border-red-hud bg-red-hud/30",
  TENSION: "text-amber border-amber-hud bg-amber-hud/30",
  INESTABILIDAD: "text-violet-hud border-violet-hud bg-violet-hud/30",
  VIGILANCIA: "text-cyan-hud border-cyan-hud bg-cyan-hud/30",
};

const levelDot: Record<AlertLevel, string> = {
  CRITICO: "bg-red-hud",
  TENSION: "bg-amber",
  INESTABILIDAD: "bg-violet-hud",
  VIGILANCIA: "bg-cyan-hud",
};

export function DailyBriefingPanel() {
  const { level, streak, readBriefings, viewedNews, coins } = useGameStore();
  const [ttsState, setTtsState] = useState<"idle" | "playing">("idle");

  // ===== v122 INTEL EN VIVO DE LA CASA =====
  // Los cables REALES de /api/news emparejados con los frentes del briefing:
  // cada señal abre la SALA DE LECTURA interna (cero saltos fuera).
  const [cables122, setCables122] = useState<CableLectura[]>([]);
  const [cableSel122, setCableSel122] = useState<CableLectura | null>(null);
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
        if (cs.length > 0) setCables122(cs);
      } catch { /* la casa sigue viva sin intel */ }
    };
    cargar();
    const id = setInterval(cargar, 300000);
    return () => { vivo = false; clearInterval(id); };
  }, []);

  const intelPorFrente = useMemo(() => {
    const mapa: Record<string, CableLectura[]> = {};
    for (const c of CONFLICTS) {
      const clave = c.name.toLowerCase();
      const hits = cables122.filter((cab) => {
        const t = cab.title.toLowerCase();
        if (t.includes(clave)) return true;
        // puente por conflictTag (ukraine/gaza/taiwan...)
        if (cab.conflictTag && c.id && t.length > 0) {
          return cab.conflictTag === c.id.toLowerCase();
        }
        return false;
      }).slice(0, 3);
      if (hits.length > 0) mapa[c.id] = hits;
    }
    return mapa;
  }, [cables122]);
  const totalIntel122 = useMemo(() => Object.values(intelPorFrente).flat().length, [intelPorFrente]);

  // Generate daily briefing based on current state
  const briefing = useMemo(() => {
    const critical = CONFLICTS.filter((c) => c.level === "CRITICO");
    const tension = CONFLICTS.filter((c) => c.level === "TENSION");
    const topConflicts = [...CONFLICTS].sort((a, b) => b.intensity - a.intensity).slice(0, 5);
    const freeBriefings = BRIEFINGS.filter((b) => b.coinCost === 0);
    const unreadBriefings = freeBriefings.filter((b) => !readBriefings.includes(b.id));

    const threatLevel = critical.length >= 5 ? "EXTREMO" : critical.length >= 3 ? "ALTO" : "MODERADO";
    const threatColor = threatLevel === "EXTREMO" ? "text-red-hud" : threatLevel === "ALTO" ? "text-amber" : "text-cyan-hud";

    return {
      threatLevel,
      threatColor,
      critical,
      tension,
      topConflicts,
      unreadBriefings,
      totalConflicts: CONFLICTS.length,
    };
  }, [readBriefings]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("es", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  // v13 — BRIEFING EN AUDIO (text-to-speech del navegador)
  const speakBriefing = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Tu navegador no soporta síntesis de voz");
      return;
    }
    if (ttsState === "playing") {
      window.speechSynthesis.cancel();
      setTtsState("idle");
      return;
    }
    const lines = [
      "Briefing diario de Vanguard.",
      `Nivel de amenaza global: ${briefing.threatLevel}.`,
      `${briefing.critical.length} frentes críticos y ${briefing.tension.length} en tensión.`,
      "Los frentes prioritarios:",
      ...briefing.topConflicts.map((c, i) => `${i + 1}. ${c.name}. Intensidad ${c.intensity} de 100. ${c.summary}`),
    ];
    const u = new SpeechSynthesisUtterance(lines.join(" "));
    u.lang = "es-ES";
    u.rate = 1.02;
    u.pitch = 0.95;
    u.onend = () => setTtsState("idle");
    u.onerror = () => setTtsState("idle");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setTtsState("playing");
    toast.success("Escuchando el briefing — los 10 puntos que debes saber hoy");
  };

  return (
    <div className="space-y-3">
      <HeroOro panel="briefing" />
      <PanelHeader
        title="Briefing diario"
        subtitle="Resumen automatico · situacion global"
        icon={<Newspaper className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="text-[10px] font-mono text-muted-foreground text-right">
            <div className="flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3" /> {timeStr}
            </div>
            <div className="text-[9px]">{dateStr}</div>
            <button
              onClick={speakBriefing}
              className={cn(
                "mt-1 px-2 py-0.5 border font-mono text-[9px] uppercase tracking-widest vg-transition",
                ttsState === "playing" ? "border-crisis-hud text-crisis" : "border-electric-hud text-electric hover:bg-electric-hud"
              )}
            >
              {ttsState === "playing" ? "■ Detener audio" : "▶ Escuchar briefing"}
            </button>
          </div>
        }
      />

      {/* Threat level banner */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "hud-corner p-4 bg-gradient-to-r",
          briefing.threatLevel === "EXTREMO"
            ? "from-red-hud/30 to-transparent border-red-hud glow-red"
            : briefing.threatLevel === "ALTO"
            ? "from-amber-hud/30 to-transparent border-amber-hud glow-amber"
            : "from-cyan-hud/20 to-transparent border-cyan-hud"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className={cn("w-8 h-8", briefing.threatColor, briefing.threatLevel === "EXTREMO" && "blink-soft")} />
            <div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase">Nivel de amenaza global</div>
              <div className={cn("text-2xl font-mono font-bold uppercase", briefing.threatColor)}>
                {briefing.threatLevel}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Frentes activos</div>
            <div className="text-2xl font-mono font-bold text-amber">{briefing.totalConflicts}</div>
          </div>
        </div>
      </motion.div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="hud-corner p-3 bg-red-hud/10 border-red-hud/40">
          <div className="flex items-center gap-1 mb-1">
            <Flame className="w-3 h-3 text-red-hud" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Criticos</span>
          </div>
          <div className="text-xl font-mono font-bold text-red-hud">{briefing.critical.length}</div>
        </div>
        <div className="hud-corner p-3 bg-amber-hud/10 border-amber-hud/40">
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3 h-3 text-amber" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Tension</span>
          </div>
          <div className="text-xl font-mono font-bold text-amber">{briefing.tension.length}</div>
        </div>
        <div className="hud-corner p-3 bg-cyan-hud/10 border-cyan-hud/40">
          <div className="flex items-center gap-1 mb-1">
            <Eye className="w-3 h-3 text-cyan-hud" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Sin leer</span>
          </div>
          <div className="text-xl font-mono font-bold text-cyan-hud">{briefing.unreadBriefings.length}</div>
        </div>
        <div className="hud-corner p-3 bg-violet-hud/10 border-violet-hud/40">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-violet-hud" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Cables</span>
          </div>
          <div className="text-xl font-mono font-bold text-violet-hud">{viewedNews.length}</div>
        </div>
      </div>

      {/* Top priority conflicts */}
      <div className="hud-corner p-3">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-amber" />
          <span className="text-xs font-mono font-bold text-foreground uppercase">Frentes prioritarios</span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">Por intensidad</span>
        </div>
        <div className="space-y-2">
          {briefing.topConflicts.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 p-2 pl-4 hud-corner bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="text-[10px] font-mono font-bold text-muted-foreground w-6 text-center">
                #{i + 1}
              </div>
              <div className="flex-shrink-0"><FlagBadge code={c.flag} size="lg" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-foreground truncate">{c.name}</span>
                  <span className={cn("text-[9px] font-mono px-1 py-0.5 border uppercase flex-shrink-0", levelColor[c.level])}>
                    {c.level}
                  </span>
                  {/* v122: badge de señales reales en escucha para este frente */}
                  {(intelPorFrente[c.id]?.length ?? 0) > 0 && (
                    <span className="text-[8.5px] font-mono px-1 py-0.5 border border-cyan-hud/60 text-cyan-hud rounded-sm flex-shrink-0 flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 blink-soft" /> {intelPorFrente[c.id].length} SEÑAL{intelPorFrente[c.id].length > 1 ? "ES" : ""}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden min-w-[60px]">
                    <div
                      className={cn("h-full", levelDot[c.level])}
                      style={{ width: `${c.intensity}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-muted-foreground tabular-nums">{c.intensity}%</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* v122: INTEL EN VIVO DE LA CASA — las señales reales de los frentes */}
      {totalIntel122 > 0 && (
        <div className="hud-corner p-3 border-cyan-hud/50">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-cyan-hud blink-soft" />
            <span className="text-xs font-mono font-bold text-foreground uppercase">Intel en vivo de la casa</span>
            <span className="text-[9px] font-mono text-muted-foreground ml-auto">{cables122.length} cables en escucha · refresh 5 min</span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(intelPorFrente).slice(0, 5).map(([cid, hits]) => {
              const conf = CONFLICTS.find((c) => c.id === cid);
              if (!conf) return null;
              return hits.map((cab, i) => (
                <button
                  key={`${cid}-${cab.id}-${i}`}
                  onClick={() => setCableSel122(cab)}
                  className="w-full text-left flex items-center gap-2 p-2 hud-corner bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                >
                  <span className="flex-shrink-0"><FlagBadge code={conf.flag} /></span>
                  <span className="text-[8.5px] font-mono font-bold text-amber uppercase shrink-0 hidden sm:inline">{conf.name}</span>
                  <span className="flex-1 min-w-0 text-[11px] text-foreground/85 group-hover:text-foreground truncate">{cab.title}</span>
                  {cab.tacticalTag === "ALERTA" && <span className="text-[8px] font-mono font-black text-red-hud border border-red-hud/60 px-1 rounded-sm shrink-0">ALERTA</span>}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </button>
              ));
            })}
          </div>
        </div>
      )}

      {/* Daily recommendations */}
      <div className="hud-corner p-3 bg-gradient-to-br from-amber-hud/10 to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-amber" />
          <span className="text-xs font-mono font-bold text-foreground uppercase">Recomendaciones del dia</span>
        </div>
        <div className="space-y-2">
          {level < 5 && (
            <RecItem icon="crosshair" text="Completa misiones diarias para subir de nivel mas rapido" />
          )}
          {streak < 3 && (
            <RecItem icon="flame" text="Mantén tu racha diaria para bonus crecientes de monedas" />
          )}
          {briefing.unreadBriefings.length > 0 && (
            <RecItem icon="file-text" text={`Tienes ${briefing.unreadBriefings.length} briefings sin leer · +XP disponible`} />
          )}
          {coins < 100 && (
            <RecItem icon="coins" text="Participa en predicciones para multiplicar tus monedas" />
          )}
          {viewedNews.length < 5 && (
            <RecItem icon="newspaper" text="Revisa las noticias en vivo para completar misiones de cable" />
          )}
          <RecItem icon="gamepad" text="Juega al mini-game Threat Assessment para ganar monedas extra" />
          <RecItem icon="trophy" text="Compite en torneos semanales por premios en gemas" />
        </div>
      </div>

      {/* System status */}
      <div className="hud-corner p-3 bg-secondary/30">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-hud blink-soft" />
            <span className="text-green-hud">SISTEMA OPERATIVO</span>
          </div>
          <span className="text-muted-foreground">VANGUARD v2.5.0 · CANAL ENCRIPTADO</span>
        </div>
      </div>

      {/* v122: la SALA DE LECTURA del briefing — misma sala interna de la casa */}
      <LectorNoticia cable={cableSel122} onCerrar={() => setCableSel122(null)} />
    </div>
  );
}

function RecItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2 p-2 hud-corner bg-secondary/40">
      <span className="flex-shrink-0"><VIcon k={icon} className="w-4 h-4 text-amber" /></span>
      <span className="text-xs text-foreground">{text}</span>
    </div>
  );
}
