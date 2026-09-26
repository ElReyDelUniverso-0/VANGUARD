"use client";

// VANGUARD v57.0 — ARCHIVO SECRETO: EXPEDIENTES DESCLASIFICADOS
// La sala de lectura del Ojo de Dios: expedientes REALES desclasificados por
// el FBI (Vault), CIA (Reading Room), NARA, National Security Archive y
// The Black Vault. Mecánica de colección: cada expediente abierto la primera
// vez paga monedas/gemas/XP de temporada y sube el RANGO DE INTELIGENCIA.
// Hitos de colección (25%..100%) con botín mayor. Exp. del día = +50%.

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, FolderOpen, FileLock2, Star, ExternalLink, Award, ShieldAlert, Landmark, Building2, Vault, Hourglass } from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { useGameStore } from "@/lib/game-store";
import { useRetention } from "@/lib/retention";
import {
  EXPEDIENTES, SEC_MILESTONES, AGENCIA_STYLE, RARITY_STYLE,
  useExpedientes, intelRank, nextRankAt, expedienteDelDia,
  isExpedienteDelDia, lecturaReward, type Agencia,
} from "@/lib/expedientes";

const AGEN_ICONS: Record<Agencia, React.ReactNode> = {
  FBI: <ShieldAlert className="w-3 h-3" />,
  CIA: <Eye className="w-3 h-3" />,
  NSARCHIVE: <Landmark className="w-3 h-3" />,
  NARA: <Building2 className="w-3 h-3" />,
  BLACKVAULT: <Vault className="w-3 h-3" />,
};

type Filtro = "TODOS" | Agencia;
const FILTROS: Filtro[] = ["TODOS", "FBI", "CIA", "NARA", "NSARCHIVE", "BLACKVAULT"];

export function ExpedientesPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addGems = useGameStore((s) => s.addGems);
  const addSeasonXp = useRetention((s) => s.addSeasonXp);
  const readIds = useExpedientes((s) => s.readIds);
  const claimed = useExpedientes((s) => s.claimedMilestones);
  const markRead = useExpedientes((s) => s.markRead);
  const claimMilestone = useExpedientes((s) => s.claimMilestone);
  const [filtro, setFiltro] = useState<Filtro>("TODOS");

  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const total = EXPEDIENTES.length;
  const pct = Math.round((readIds.length / total) * 100);
  const rank = intelRank(readIds.length);
  const nextRank = nextRankAt(readIds.length);
  const daily = useMemo(() => expedienteDelDia(), []);

  const lista = useMemo(
    () => (filtro === "TODOS" ? EXPEDIENTES : EXPEDIENTES.filter((e) => e.agencia === filtro)),
    [filtro]
  );
  const pendientes = useMemo(
    () => SEC_MILESTONES.filter((m) => readIds.length >= m.at && !claimed.includes(m.at)),
    [readIds.length, claimed]
  );

  function cobrarPendientes() {
    for (const m of pendientes) {
      if (claimMilestone(m.at)) {
        addCoins(m.coins, `Archivo Secreto: ${m.label}`);
        if (m.gems > 0) addGems(m.gems, `Archivo Secreto: ${m.label}`);
        if (m.seasonXp > 0) addSeasonXp(m.seasonXp);
        toast.success(`🏆 HITO DEL ARCHIVO: ${m.label}`, {
          description: `+${m.coins} monedas${m.gems ? ` · +${m.gems} gemas` : ""}${m.seasonXp ? ` · +${m.seasonXp} XP temporada` : ""}`,
          duration: 6000,
        });
      }
    }
  }

  function abrirExpediente(id: string, url: string) {
    const exp = EXPEDIENTES.find((e) => e.id === id);
    if (!exp) return;
    const isDaily = isExpedienteDelDia(id);
    const { already } = markRead(id);
    if (!already) {
      const rw = lecturaReward(exp, isDaily);
      addCoins(rw.coins, "Archivo Secreto: expediente abierto");
      if (rw.gems > 0) addGems(rw.gems, "Archivo Secreto: expediente raro");
      addSeasonXp(rw.seasonXp);
      toast.success(
        `${isDaily ? "⭐ EXPEDIENTE DEL DÍA " : "🗂️ EXPEDIENTE REGISTRADO"} · ${exp.titulo.slice(0, 42)}${exp.titulo.length > 42 ? "…" : ""}`,
        { description: `+${rw.coins} monedas${rw.gems ? ` · +${rw.gems} gema(s)` : ""} · +${rw.seasonXp} XP temporada`, duration: 5000 }
      );
    }
    cobrarPendientes();
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      /* pop-up bloqueado: la lectura ya quedó registrada */
    }
  }

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Archivo Secreto"
        subtitle="Expedientes desclasificados · FBI · CIA · NARA · NSArchive · Black Vault"
        icon={<FolderOpen className="w-4 h-4" />}
        color="violet"
      />

      {/* ===== BANNER DE CLASIFICACIÓN (estética de dossier) ===== */}
      <div className="relative overflow-hidden rounded-sm border border-violet-hud/40 bg-black/60 p-3 sm:p-4">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5 bg-[repeating-linear-gradient(45deg,#ef4444_0_10px,transparent_10px_20px)] opacity-60"
        />
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="rounded-sm border-2 border-red-hud px-2 py-0.5 font-mono text-[10px] sm:text-xs font-black tracking-[0.18em] text-red-hud rotate-[-1.5deg]">
            TOP SECRET → DESCLASIFICADO
          </span>
          <span className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase">
            Sala de lectura FOIA · material público y legal
          </span>
        </div>

        {/* progreso de colección + rango */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px] sm:text-xs">
          <span className="text-violet-hud font-bold">
            {readIds.length}/{total} expedientes ({pct}%)
          </span>
          <span className="text-amber font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> RANGO: {rank}
          </span>
          {nextRank && (
            <span className="text-muted-foreground">
              {nextRank.rank} a los {nextRank.at} leídos
            </span>
          )}
        </div>
        <div className="mt-2 h-2 w-full rounded bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400 transition-all duration-500"
            style={{ width: `${Math.max(3, pct)}%` }}
          />
        </div>
      </div>

      {/* ===== EXPEDIENTE DEL DÍA ===== */}
      <button
        onClick={() => abrirExpediente(daily.id, daily.url)}
        className={cn(
          "w-full text-left rounded-sm border p-3 sm:p-4 bg-gradient-to-br from-amber-500/10 to-black/70 hover:from-amber-500/20 transition-colors",
          readSet.has(daily.id) ? "border-amber-hud/30" : "border-amber-hud/80 shadow-[0_0_18px_rgba(245,158,11,0.15)] animate-pulse"
        )}
      >
        <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider">
          <Star className="w-3.5 h-3.5 text-amber" />
          <span className="text-amber font-bold">EXPEDIENTE DEL DÍA · recompensa x1.5</span>
          {readSet.has(daily.id) && <span className="text-muted-foreground">· ya registrado</span>}
        </div>
        <div className="mt-1.5 font-bold text-sm sm:text-base text-foreground">{daily.titulo}</div>
        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{daily.desc}</div>
        <div className="mt-2 flex items-center gap-1.5 font-mono text-[10px] text-amber-300">
          <ExternalLink className="w-3 h-3" /> abrir dossier original {readSet.has(daily.id) ? "(relectura libre)" : "(+recompensa)"}
        </div>
      </button>

      {/* ===== FILTROS POR AGENCIA ===== */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-0.5 px-0.5">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={cn(
              "flex-shrink-0 rounded-sm border px-2.5 py-1 font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-colors",
              filtro === f
                ? "border-violet-hud bg-violet-hud/20 text-violet-hud"
                : "border-slate-700 text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ===== HITOS PENDIENTES (los cobramos en cuanto se abren) ===== */}
      {pendientes.length > 0 && (
        <button
          onClick={cobrarPendientes}
          className="w-full rounded-sm border border-amber-hud/70 bg-amber-500/15 px-3 py-2 font-mono text-[11px] sm:text-xs text-amber font-bold animate-pulse"
        >
          🏆 {pendientes.length} hito(s) de colección por cobrar — toca aquí
        </button>
      )}

      {/* ===== GRID DE EXPEDIENTES ===== */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {lista.map((exp) => {
          const leido = readSet.has(exp.id);
          const isDaily = isExpedienteDelDia(exp.id);
          const rw = lecturaReward(exp, isDaily);
          const ag = AGENCIA_STYLE[exp.agencia];
          return (
            <article
              key={exp.id}
              className={cn(
                "relative flex flex-col rounded-sm border bg-black/50 p-3 transition-colors",
                leido ? "border-slate-700/70" : "border-slate-600 hover:border-violet-hud/60"
              )}
            >
              {/* fila superior: agencia + rareza + clasificación */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-wide">
                <span className={cn("inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5", ag.cls)}>
                  {AGEN_ICONS[exp.agencia]} {ag.label}
                </span>
                <span className={cn("rounded-sm border px-1.5 py-0.5", RARITY_STYLE[exp.rareza])}>{exp.rareza}</span>
                <span className="inline-flex items-center gap-1 rounded-sm border border-slate-600 px-1.5 py-0.5 text-muted-foreground">
                  <Hourglass className="w-2.5 h-2.5" /> {exp.year}
                </span>
                {isDaily && <span className="text-amber font-bold">⭐ DÍA</span>}
              </div>

              {/* clasificación original tachada → DESCLASIFICADO */}
              <div className="mt-2 font-mono text-[10px]">
                <span className="text-red-hud/90 line-through decoration-red-hud/70">{exp.clasificacion}</span>
                <span className="ml-1.5 text-green-hud font-bold">→ LIBERADO</span>
              </div>

              <h3 className={cn("mt-1.5 font-bold text-sm leading-snug", leido ? "text-muted-foreground" : "text-foreground")}>
                {exp.titulo}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">{exp.desc}</p>

              <div className="mt-2.5 flex items-center justify-between gap-2 mt-auto">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {leido ? "✓ en tu colección" : `+${rw.coins} ⓒ · +${rw.seasonXp} XP`}
                </span>
                <button
                  onClick={() => abrirExpediente(exp.id, exp.url)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors min-h-[32px]",
                    leido
                      ? "border-slate-600 text-muted-foreground hover:text-foreground"
                      : "border-violet-hud bg-violet-hud/15 text-violet-hud hover:bg-violet-hud/30"
                  )}
                >
                  <FileLock2 className="w-3.5 h-3.5" />
                  {leido ? "reabrir" : "abrir expediente"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* ===== LISTA DE HITOS DE COLECCIÓN ===== */}
      <div className="rounded-sm border border-slate-700/70 bg-black/40 p-3">
        <div className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Botín del archivo — hitos de colección
        </div>
        <ul className="space-y-1.5">
          {SEC_MILESTONES.map((m) => {
            const got = claimed.includes(m.at);
            const ready = readIds.length >= m.at;
            return (
              <li key={m.at} className="flex items-center justify-between gap-2 font-mono text-[11px] sm:text-xs">
                <span className={cn("flex items-center gap-1.5", got ? "text-green-hud" : ready ? "text-amber font-bold" : "text-muted-foreground")}>
                  {got ? "✓" : ready ? "🎁" : "🔒"} {m.label}
                </span>
                <span className={cn("whitespace-nowrap", got ? "text-muted-foreground" : "text-amber")}>
                  +{m.coins}ⓒ{m.gems ? ` · +${m.gems}💎` : ""}{m.seasonXp ? ` · +${m.seasonXp}XP` : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-[10px] sm:text-xs text-muted-foreground font-mono leading-relaxed px-1">
        Todos los expedientes provienen de salas de lectura oficiales y archivos públicos (FOIA / CREST / NARA).
        Vanguard enlaza al documento original; el enlace se abre en una pestaña nueva. Ningún material es
        clasificado: todo fue desclasificado por las propias agencias.
      </p>
    </div>
  );
}
