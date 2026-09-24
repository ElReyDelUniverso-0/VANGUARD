"use client";

// v46.0 OBJETIVO MUNDIAL — la barra que convierte a cada jugador en reclutador.
// La meta comunitaria es el motor de crecimiento más honesto que existe: los
// números vienen DIRECTOS de la BD (players:total, v38), nadie los puede
// inflar, y la recompensa se desbloquea para TODOS cuando la comunidad llega.
// Quien más invita, más rápido la desbloqueamos — por eso los botones de
// compartir llevan el código de referido del jugador pegado.

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Target, Users, Coins, Gem, Copy, Check, Gift, TrendingUp, Share2 } from "lucide-react";

interface GoalState {
  ok: boolean;
  total: number;
  goal: number;
  remaining: number;
  progress: number;
  reward: { coins: number; gems: number; xp: number };
  claimed: number;
  unlocked: boolean;
  nextGoals: number[];
  passedGoals: number[];
}

const LS_CLAIMED = "vanguard_goal_claimed_v1"; // hitos ya reclamados en este dispositivo

export function GoalBanner() {
  const alias = useGameStore((s) => s.alias);
  const addCoins = useGameStore((s) => s.addCoins);
  const addGems = useGameStore((s) => s.addGems);
  const addXp = useGameStore((s) => s.addXp);
  const [goal, setGoal] = useState<GoalState | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimedHere, setClaimedHere] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(LS_CLAIMED) || "[]");
      setClaimedHere(Array.isArray(arr) && arr.length > 0);
    } catch { /* sin historial */ }
  }, []);

  // patrón verificado: setState síncrono en effect → setTimeout(0)
  useEffect(() => {
    const t = setTimeout(() => {
      void (async () => {
        try {
          const r = await fetch("/api/goal", { cache: "no-store" });
          const j = (await r.json()) as GoalState;
          setGoal(j);
        } catch { /* degradación: banner oculto */ }
      })();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const referral = `VGD-${(alias || "AGENTE").replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase() || "AGENTE"}`;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/?ref=${referral}` : `/?ref=${referral}`;
  const shareMsg = goal
    ? `FALTAN ${goal.remaining} jugadores para desbloquear ${goal.reward.coins.toLocaleString("es")} monedas GRATIS para TODOS en VANGUARD. Entra con mi código:`
    : "Entra a VANGUARD con mi código:";
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${shareMsg} ${shareUrl}`)}`;
  const tgHref = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMsg)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg)}&url=${encodeURIComponent(shareUrl)}`;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMsg} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success("Invitación copiada — pégala donde quieras");
    } catch { toast.error("No se pudo copiar"); }
  };

  const claim = async () => {
    if (!goal || claiming) return;
    setClaiming(true);
    try {
      const r = await fetch("/api/goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: alias || "AGENTE" }),
      });
      const j = await r.json();
      if (r.ok && j.ok) {
        addCoins(j.reward.coins, `Meta mundial ${j.goal} jugadores`);
        addGems(j.reward.gems, `Meta mundial ${j.goal} jugadores`);
        addXp(j.reward.xp);
        const arr = JSON.parse(localStorage.getItem(LS_CLAIMED) || "[]");
        localStorage.setItem(LS_CLAIMED, JSON.stringify([...new Set([...arr, j.goal])]));
        setClaimedHere(true);
        toast.success(`¡RECOMPENSA GLOBAL RECLAMADA! +${j.reward.coins} monedas, +${j.reward.gems} gemas`);
      } else {
        toast.error(j.error || "No se pudo reclamar");
        if (r.status === 409 && /Ya reclamaste/i.test(String(j.error || ""))) {
          const arr = JSON.parse(localStorage.getItem(LS_CLAIMED) || "[]");
          localStorage.setItem(LS_CLAIMED, JSON.stringify([...new Set([...arr, goal.goal])]));
          setClaimedHere(true);
        }
      }
    } catch { toast.error("Error de red"); }
    finally { setClaiming(false); }
  };

  if (!goal || !goal.ok) return null;

  const alreadyClaimed = claimedHere && goal.unlocked;

  return (
    <section className="mt-6" aria-label="Objetivo mundial — meta comunitaria">
      <div className="relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 p-4 md:p-5">
        {/* brillo dorado */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" aria-hidden />
        <div className="flex flex-wrap items-center gap-2">
          <Target className="h-5 w-5 text-amber-400" aria-hidden />
          <h2 className="text-sm font-black uppercase tracking-wider text-amber-300">
            Objetivo mundial · meta de la comunidad
          </h2>
          {goal.unlocked && (
            <span className="rounded-full border border-amber-400/60 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-200 animate-pulse">
              ¡Desbloqueada!
            </span>
          )}
        </div>

        <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
          Cada jugador REAL que entra acerca la recompensa. Cuando lleguemos a{" "}
          <b className="text-amber-300">{goal.goal} agentes</b>, TODOS los que estén dentro
          reclaman <b className="text-amber-300">{goal.reward.coins.toLocaleString("es")} monedas</b> +{" "}
          <b className="text-amber-300">{goal.reward.gems} gemas</b> + {goal.reward.xp} XP.
          {goal.passedGoals.length > 0 && (
            <> Metas ya conquistadas: <b className="text-emerald-400">{goal.passedGoals.join(", ")}</b>.</>
          )}
        </p>

        {/* barra de progreso */}
        <div className="mt-3">
          <div className="flex items-end justify-between text-xs">
            <span className="font-bold text-zinc-200 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-amber-400" aria-hidden />
              {goal.total} / {goal.goal} jugadores
            </span>
            <span className="text-zinc-400">
              {goal.unlocked ? "Meta alcanzada" : `Faltan ${goal.remaining}`}
            </span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full border border-amber-500/30 bg-zinc-900" role="progressbar" aria-valuenow={goal.progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-700"
              style={{ width: `${Math.max(3, goal.progress)}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" aria-hidden />
              {goal.claimed} agentes ya aseguraron su recompensa
            </span>
            <span>Siguientes metas: {goal.nextGoals.slice(0, 3).join(" · ")}</span>
          </div>
        </div>

        {/* acción: reclamar o invitar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {goal.unlocked && !alreadyClaimed ? (
            <Button
              onClick={claim}
              disabled={claiming}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 font-black text-zinc-950 hover:from-amber-400 hover:to-yellow-300"
            >
              <Gift className="mr-1 h-4 w-4" aria-hidden />
              {claiming ? "Reclamando..." : `RECLAMAR ${goal.reward.coins.toLocaleString("es")} MONEDAS`}
            </Button>
          ) : alreadyClaimed ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300">
              <Check className="h-4 w-4" aria-hidden /> Recompensa de la meta {goal.goal} reclamada
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200">
              <Coins className="h-4 w-4" aria-hidden />
              Invita con tu código {referral} y la desbloqueamos antes
            </span>
          )}

          {!goal.unlocked && (
            <>
              <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="Invitar por WhatsApp">
                <Button size="sm" className="bg-emerald-600 font-bold text-white hover:bg-emerald-500">
                  <Share2 className="mr-1 h-3.5 w-3.5" aria-hidden /> WhatsApp
                </Button>
              </a>
              <a href={tgHref} target="_blank" rel="noopener noreferrer" aria-label="Invitar por Telegram">
                <Button size="sm" variant="outline" className="border-sky-500/50 bg-sky-500/10 font-bold text-sky-300 hover:bg-sky-500/20">
                  Telegram
                </Button>
              </a>
              <a href={xHref} target="_blank" rel="noopener noreferrer" aria-label="Invitar por X">
                <Button size="sm" variant="outline" className="border-zinc-600 font-bold text-zinc-200 hover:bg-zinc-800">
                  X
                </Button>
              </a>
              <Button size="sm" variant="outline" onClick={copyInvite} className="border-amber-500/50 font-bold text-amber-300 hover:bg-amber-500/10">
                {copied ? <Check className="mr-1 h-3.5 w-3.5" aria-hidden /> : <Copy className="mr-1 h-3.5 w-3.5" aria-hidden />}
                {copied ? "Copiado" : "Copiar invitación"}
              </Button>
            </>
          )}
        </div>

        <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">
          <Gem className="mr-1 inline h-3 w-3 text-amber-400" aria-hidden />
          El contador lee jugadores ÚNICOS reales de la base de datos — sin bots, sin humo.
          Tu código de referido ({referral}) también da recompensas propias cuando alguien entra con él.
        </p>
      </div>
    </section>
  );
}
