"use client";

// v59.0 ALEJANDRÍA OSCURA — LA BIBLIOTECA DE ALEJANDRÍA GEOPOLÍTICA
// Tres colecciones de conocimiento militar/geopolítico: teorías oscuras con
// veredicto honesto (MITO/REAL/PARCIAL), las ideas que crearon armas históricas
// y civilizaciones perdidas. Cada entrada abre su fuente real desclasificada y
// paga botín (que viaja a la TEMPORADA por el espejo XP global de v58.0).

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ChevronDown, ExternalLink, Skull, Swords, Landmark,
  Sparkles, ShieldCheck, AlertTriangle, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { useGameStore } from "@/lib/game-store";
import {
  TEORIAS, ARMAS, CIVILIZACIONES, OSCURA_TOTAL, OSCURA_MILESTONES,
  oscuraRank, entradaDelDia, isEntradaDelDia, lecturaOscuraReward,
  useOscura, type Veredicto, type OscuraRarity,
} from "@/lib/oscura";

type Coleccion = "TEORIAS" | "ARMAS" | "CIVIS";

const VEREDICTO_CLS: Record<Veredicto, string> = {
  MITO: "bg-red-hud/20 text-red-hud border-red-hud/50",
  REAL: "bg-green-hud/15 text-green-hud border-green-hud/50",
  PARCIAL: "bg-amber-hud/15 text-amber border-amber-hud/50",
};

const RARITY_CLS: Record<OscuraRarity, string> = {
  COMUN: "border-slate-600/50",
  RARO: "border-cyan-hud/50",
  EPICO: "border-violet-400/60",
  LEGENDARIO: "border-amber-400/80 shadow-[0_0_18px_rgba(251,191,36,0.25)]",
};

export function OscuraPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const readIds = useOscura((s) => s.readIds);
  const claimed = useOscura((s) => s.claimedMilestones);
  const registerRead = useOscura((s) => s.registerRead);
  const claimMilestone = useOscura((s) => s.claimMilestone);

  const [col, setCol] = useState<Coleccion>("TEORIAS");
  const [openId, setOpenId] = useState<string | null>(null);

  const reads = readIds.length;
  const rank = useMemo(() => oscuraRank(reads), [reads]);
  const daily = useMemo(() => entradaDelDia(), []);
  const pct = Math.round((reads / OSCURA_TOTAL) * 100);

  const openEntry = (id: string) => {
    const isNew = registerRead(id);
    if (isNew) {
      const rw = lecturaOscuraReward(isEntradaDelDia(id));
      addCoins(rw.coins, `Alejandría Oscura: ${id}`);
      addXp(rw.xp); // v58: viaja a TEMPORADA + TABLÓN SEMANAL automáticamente
      toast.success(`+${rw.coins}ⓒ +${rw.xp}XP · entrada archivada`, {
        description: isEntradaDelDia(id) ? "⭐ ENTRADA DEL DÍA: botín x1.5" : `Progreso ${reads + 1}/${OSCURA_TOTAL} · ${oscuraRank(reads + 1)}`,
      });
      // cobrar hitos pendientes automáticamente
      for (const m of OSCURA_MILESTONES) {
        if (reads + 1 >= m.at && !claimed.includes(m.at) && claimMilestone(m.at)) {
          addCoins(m.coins, `Hito Alejandría: ${m.at} entradas`);
          addXp(m.xp);
          addGemsSafe(m.gems);
          toast(`🏆 HITO: ${m.label}`, { description: `+${m.coins}ⓒ +${m.gems}💎 +${m.xp}XP` });
        }
      }
    }
  };

  const addGemsSafe = (g: number) => {
    if (g > 0) useGameStore.getState().addGems(g, "Hito Alejandría Oscura");
  };

  const abrirFuente = (id: string, url: string, titulo: string) => {
    openEntry(id);
    window.open(url, "_blank", "noopener,noreferrer");
    toast("🔓 Fuente real abierta", { description: titulo.slice(0, 70) });
  };

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Alejandría Oscura"
        subtitle="La biblioteca de los secretos: teorías, armas y civilizaciones que dan miedo de verdad"
        icon={<BookOpen className="w-4 h-4 text-red-hud" />}
        color="red"
        right={<span className="text-[10px] font-mono text-muted-foreground hidden sm:block">{reads}/{OSCURA_TOTAL} · {rank}</span>}
      />

      {/* banner de clasificación */}
      <div className="rounded border border-red-hud/40 bg-red-hud/10 px-3 py-2 flex items-center gap-2 flex-wrap">
        <Skull className="w-3.5 h-3.5 text-red-hud" />
        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-red-hud">
          Clasificado · nivel de acceso: tu curiosidad
        </span>
        <span className="ml-auto text-[9px] font-mono text-muted-foreground">
          Nada inventado: cada fuente es real y desclasificada
        </span>
      </div>

      {/* progreso */}
      <div className="hud-corner bg-secondary/40 p-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Eye className="w-3.5 h-3.5 text-amber" />
          <span className="text-xs font-mono text-foreground font-bold">{reads}/{OSCURA_TOTAL} entradas absorbidas</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-hud/20 text-amber rounded">{rank}</span>
          <span className="ml-auto text-[10px] font-mono text-amber">{pct}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-hud via-amber-hud to-amber-hud transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[9px] font-mono text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber" />
          ⭐ ENTRADA DEL DÍA (botín x1.5): <span className="text-amber">{daily.titulo.slice(0, 52)}{daily.titulo.length > 52 ? "…" : ""}</span>
        </div>
      </div>

      {/* conmutador de colecciones */}
      <div className="grid grid-cols-3 gap-2">
        {([
          { key: "TEORIAS" as Coleccion, label: "TEORÍAS OSCURAS", n: TEORIAS.length, icon: <Skull className="w-3.5 h-3.5" /> },
          { key: "ARMAS" as Coleccion, label: "ARMAS E IDEAS", n: ARMAS.length, icon: <Swords className="w-3.5 h-3.5" /> },
          { key: "CIVIS" as Coleccion, label: "CIVILIZACIONES", n: CIVILIZACIONES.length, icon: <Landmark className="w-3.5 h-3.5" /> },
        ]).map((c) => (
          <button
            key={c.key}
            onClick={() => { setCol(c.key); setOpenId(null); }}
            className={cn(
              "hud-corner py-2 px-1.5 flex flex-col items-center gap-0.5 border transition-colors",
              col === c.key ? "bg-red-hud/15 border-red-hud/60 text-red-hud" : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {c.icon}
            <span className="text-[9px] font-mono font-bold uppercase">{c.label}</span>
            <span className="text-[8px] font-mono opacity-70">{c.n} entradas</span>
          </button>
        ))}
      </div>

      {/* tarjetas */}
      <div className="grid md:grid-cols-2 gap-2.5">
        {col === "TEORIAS" && TEORIAS.map((t) => (
          <OscuraCard
            key={t.id}
            id={t.id}
            titulo={t.titulo}
            veredicto={t.veredicto}
            rareza={t.rareza}
            resumen={t.creencia}
            open={openId === t.id}
            onToggle={() => setOpenId(openId === t.id ? null : t.id)}
            onOpenSource={() => abrirFuente(t.id, t.url, t.titulo)}
            fuente={t.fuente}
            detalle={[
              { k: "ORIGEN", v: t.origen },
              { k: "LO QUE CREEN", v: t.creencia },
              { k: "LO QUE DICEN LOS DOCUMENTOS", v: t.realidad },
            ]}
          />
        ))}
        {col === "ARMAS" && ARMAS.map((a) => (
          <OscuraCard
            key={a.id}
            id={a.id}
            titulo={a.titulo}
            veredicto="REAL"
            rareza="RARO"
            resumen={a.idea}
            open={openId === a.id}
            onToggle={() => setOpenId(openId === a.id ? null : a.id)}
            onOpenSource={() => abrirFuente(a.id, a.url, a.titulo)}
            fuente={a.fuente}
            detalle={[
              { k: "ÉPOCA", v: a.epoca },
              { k: "LA IDEA", v: a.idea },
              { k: "LO QUE CAMBIÓ", v: a.legado },
            ]}
          />
        ))}
        {col === "CIVIS" && CIVILIZACIONES.map((c) => (
          <OscuraCard
            key={c.id}
            id={c.id}
            titulo={c.titulo}
            veredicto="REAL"
            rareza="COMUN"
            resumen={c.misterio}
            open={openId === c.id}
            onToggle={() => setOpenId(openId === c.id ? null : c.id)}
            onOpenSource={() => abrirFuente(c.id, c.url, c.titulo)}
            fuente={c.fuente}
            detalle={[
              { k: "ÉPOCA", v: c.epoca },
              { k: "QUÉ LOGRÓ", v: c.que },
              { k: "EL MISTERIO", v: c.misterio },
            ]}
          />
        ))}
      </div>

      {/* hitos */}
      <div className="hud-corner bg-secondary/40 p-3 space-y-2">
        <div className="text-xs font-mono font-bold uppercase text-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-green-hud" /> Hitos de la biblioteca
        </div>
        <div className="space-y-1.5">
          {OSCURA_MILESTONES.map((m) => {
            const done = reads >= m.at;
            const got = claimed.includes(m.at);
            return (
              <button
                key={m.at}
                disabled={!done || got}
                onClick={() => {
                  if (claimMilestone(m.at)) {
                    addCoins(m.coins, `Hito Alejandría: ${m.at} entradas`);
                    addXp(m.xp);
                    if (m.gems > 0) useGameStore.getState().addGems(m.gems, "Hito Alejandría Oscura");
                    toast.success(`🏆 ${m.label}`, { description: `+${m.coins}ⓒ +${m.gems}💎 +${m.xp}XP` });
                  }
                }}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded border flex items-center gap-2 text-[10px] font-mono transition-colors",
                  got ? "bg-green-hud/10 border-green-hud/40 text-green-hud"
                    : done ? "bg-amber-hud/15 border-amber-hud/60 text-amber animate-pulse"
                    : "bg-secondary/40 border-border text-muted-foreground"
                )}
              >
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span className="flex-1">{m.label}</span>
                <span>+{m.coins}ⓒ +{m.gems}💎 +{m.xp}XP</span>
                <span>{got ? "RECLAMADO" : done ? "RECLAMAR" : `${reads}/${m.at}`}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hud-corner p-3 bg-secondary/30 text-[10px] font-mono text-muted-foreground flex items-start gap-2">
        <Eye className="w-3.5 h-3.5 text-red-hud flex-shrink-0 mt-0.5" />
        <span>
          Regla de la casa: aquí el miedo es honesto. Las teorías se marcan como MITO cuando lo son,
          y lo REAL (MK-ULTRA, Paperclip, las 12.000 armas en alerta) aterriza más duro que cualquier leyenda.
          Leer entradas paga monedas y XP que suma a tu TEMPORADA y al TABLÓN SEMANAL.
        </span>
      </div>
    </div>
  );
}

function OscuraCard({
  id, titulo, veredicto, rareza, resumen, open, onToggle, onOpenSource, fuente, detalle,
}: {
  id: string;
  titulo: string;
  veredicto: Veredicto;
  rareza: OscuraRarity;
  resumen: string;
  open: boolean;
  onToggle: () => void;
  onOpenSource: () => void;
  fuente: string;
  detalle: { k: string; v: string }[];
}) {
  const read = useOscura((s) => s.readIds.includes(id));
  const daily = isEntradaDelDia(id);
  return (
    <div className={cn("hud-corner bg-secondary/40 border", RARITY_CLS[rareza], read && "opacity-90")}>
      <button onClick={onToggle} className="w-full text-left p-3 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("text-[8px] font-mono font-bold px-1 py-0.5 border rounded uppercase", VEREDICTO_CLS[veredicto])}>
              {veredicto}
            </span>
            <span className="text-[8px] font-mono uppercase text-muted-foreground">{rareza}</span>
            {daily && <span className="text-[8px] font-mono text-amber animate-pulse">⭐ DEL DÍA x1.5</span>}
            {read && <span className="text-[8px] font-mono text-green-hud">✓ LEÍDO</span>}
          </div>
          <div className="text-xs font-mono font-bold text-foreground mt-1 leading-snug">{titulo}</div>
          <p className={cn("text-[10px] text-muted-foreground mt-1 leading-relaxed", open && "line-clamp-none")}>
            {resumen.length > 110 && !open ? resumen.slice(0, 110) + "…" : resumen}
          </p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-border/40 pt-2">
              {detalle.map((d) => (
                <div key={d.k}>
                  <div className="text-[8px] font-mono font-bold uppercase tracking-widest text-red-hud/90">{d.k}</div>
                  <p className="text-[10px] text-foreground/90 leading-relaxed">{d.v}</p>
                </div>
              ))}
              <button
                onClick={onOpenSource}
                className="w-full flex items-center justify-center gap-1.5 bg-red-hud/15 border border-red-hud/50 text-red-hud hover:bg-red-hud/25 text-[10px] font-mono font-bold uppercase py-1.5 rounded transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> Abrir fuente real · {fuente}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
