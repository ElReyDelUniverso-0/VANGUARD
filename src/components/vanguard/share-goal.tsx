"use client";

// v50.0 RED GLOBAL — la misión de difusión hecha progresiva: 200 ✓ → 300 →
// 400 → 500 → 750 → 1000 enlaces. Cada hito alcanzado abre una recompensa
// global mayor y TODOS pueden reclamarla una vez. El progreso es real desde
// la BD (solo enlaces verificados a mano). Estilo eléctrico (azul) para
// distinguirse de la meta dorada de jugadores.
// v51.1 HITO 300 — FIX: muestra y reclama hitos YA conquistados aunque la
// meta activa haya avanzado (reached de la API + goal en el POST).

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link2, Coins, Gem, Copy, Check, Globe2, TrendingUp, Flag } from "lucide-react";

// v51.3 VIAJE DE HITOS — espejo del servidor (route.ts). Si cambian allí, cambian aquí.
const MILESTONES_LOCAL = [200, 300, 400, 500, 750, 1000] as const;
const REWARDS_LOCAL: Record<number, { coins: number; gems: number; xp: number }> = {
  200: { coins: 3000, gems: 30, xp: 500 },
  300: { coins: 5000, gems: 50, xp: 800 },
  400: { coins: 8000, gems: 80, xp: 1200 },
  500: { coins: 12000, gems: 120, xp: 2000 },
  750: { coins: 20000, gems: 200, xp: 3000 },
  1000: { coins: 35000, gems: 350, xp: 5000 },
};

interface ShareGoalState {
  ok: boolean;
  total: number;
  goal: number;
  remaining: number;
  progress: number;
  reward: { coins: number; gems: number; xp: number };
  claimed: number;
  unlocked: boolean;
  reached?: number[];
}

// Mapa de reclamos por hito: {"200": true, "300": true, ...}
const LS_CLAIM_MAP = "vanguard_sharegoal_claim_map_v1";
const LS_CLAIMED_LEGACY = "vanguard_sharegoal_claimed_v1";

function readClaimMap(): Record<string, boolean> {
  try {
    const map = JSON.parse(localStorage.getItem(LS_CLAIM_MAP) || "{}") as Record<string, boolean>;
    // migración v49 → v50: quien reclamó el hito 200 lo conserva
    if (localStorage.getItem(LS_CLAIMED_LEGACY) === "1") map["200"] = true;
    return map;
  } catch { return {}; }
}

// v51.1: hito conquistado más alto aún NO reclamado en este dispositivo
function computePendingGoal(reached: number[] | undefined): number | null {
  if (!reached || reached.length === 0) return null;
  try {
    const map = readClaimMap();
    const pending = reached.filter((m) => !map[String(m)]);
    return pending.length ? pending[pending.length - 1] : null;
  } catch { return null; }
}

export function ShareGoalBanner() {
  const alias = useGameStore((s) => s.alias);
  const addCoins = useGameStore((s) => s.addCoins);
  const addGems = useGameStore((s) => s.addGems);
  const addXp = useGameStore((s) => s.addXp);
  const [sg, setSg] = useState<ShareGoalState | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimedHere, setClaimedHere] = useState(false);
  const [pendingGoal, setPendingGoal] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { setClaimedHere(!!readClaimMap()["200"]); } catch { /* sin historial */ }
  }, []);

  // patrón verificado: setState síncrono en effect → setTimeout(0)
  useEffect(() => {
    const t = setTimeout(() => {
      void (async () => {
        try {
          const r = await fetch("/api/sharegoal", { cache: "no-store" });
          const j = (await r.json()) as ShareGoalState;
          setSg(j);
          // v51.1: prioriza hitos conquistados pendientes de reclamo (ej. 300)
          const pend = computePendingGoal(j.reached);
          setPendingGoal(pend);
          try { setClaimedHere(pend === null && !!readClaimMap()[String(j.goal)]); } catch { /* noop */ }
        } catch { /* degradación: banner oculto */ }
      })();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const referral = `VGD-${(alias || "AGENTE").replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase() || "AGENTE"}`;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/?ref=${referral}` : `/?ref=${referral}`;
  const shareMsg = `MISIÓN DE DIFUSIÓN: ${sg ? sg.total : 0}/${sg ? sg.goal : 300} enlaces para desbloquear ${(sg?.reward.coins ?? 5000).toLocaleString("es")} monedas GRATIS para todos en VANGUARD. Publica, comparte y entra con mi código:`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${shareMsg} ${shareUrl}`)}`;
  const tgHref = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMsg)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg)}&url=${encodeURIComponent(shareUrl)}`;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMsg} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      toast.success("Misión copiada — publícala en foros, blogs y wikis");
    } catch { toast.error("No se pudo copiar"); }
  };

  const claim = async () => {
    if (!sg || claiming) return;
    const goalToClaim = pendingGoal ?? sg.goal;
    setClaiming(true);
    try {
      const r = await fetch("/api/sharegoal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: alias || "AGENTE", goal: goalToClaim }),
      });
      const j = await r.json();
      if (r.ok && j.ok) {
        addCoins(j.reward.coins, `Misión difusión ${j.goal} enlaces`);
        addGems(j.reward.gems, `Misión difusión ${j.goal} enlaces`);
        addXp(j.reward.xp);
        try {
          const map = readClaimMap();
          map[String(j.goal)] = true;
          localStorage.setItem(LS_CLAIM_MAP, JSON.stringify(map));
        } catch { /* sin historial */ }
        setClaimedHere(computePendingGoal(sg.reached) === null);
        setPendingGoal(computePendingGoal(sg.reached));
        toast.success(`¡MISIÓN ${j.goal} ENLACES RECLAMADA! +${j.reward.coins} monedas, +${j.reward.gems} gemas`);
      } else {
        toast.error(j.error || "No se pudo reclamar");
        if (r.status === 409 && /Ya reclamaste/i.test(String(j.error || ""))) {
          try {
            const map = readClaimMap();
            map[String(goalToClaim)] = true;
            localStorage.setItem(LS_CLAIM_MAP, JSON.stringify(map));
          } catch { /* sin historial */ }
          setClaimedHere(computePendingGoal(sg.reached) === null);
          setPendingGoal(computePendingGoal(sg.reached));
        }
      }
    } catch {
      toast.error("Sin conexión con el cuartel");
    } finally {
      setClaiming(false);
    }
  };

  if (!sg || !sg.ok) return null;

  return (
    <section
      className="mt-6 hud-panel p-5 relative overflow-hidden border-electric/40"
      aria-label={`Misión de difusión — meta ${sg.goal} enlaces`}
      data-testid="share-goal-banner"
    >
      <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-70" aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-electric" aria-hidden />
          <h2 className="font-orbitron text-sm tracking-widest uppercase text-electric">
            Misión de difusión mundial
          </h2>
          <span className="font-mono text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 uppercase">
            {pendingGoal !== null ? "¡Recompensa lista!" : sg.unlocked ? "¡Desbloqueada!" : "En curso"}
          </span>
        </div>
        <div className="font-mono text-xs text-muted-foreground flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-green-hud" aria-hidden />
          <span className="text-electric font-bold text-base">{sg.total}</span> / {sg.goal} enlaces públicos
        </div>
      </div>

      {/* barra de progreso con marcas de fuego */}
      <div
        className="mt-3 h-3 rounded-full bg-background/60 border border-border overflow-hidden relative"
        role="progressbar"
        aria-valuenow={sg.total}
        aria-valuemin={0}
        aria-valuemax={sg.goal}
        aria-label={`Progreso de difusión ${sg.total} de ${sg.goal} enlaces`}
      >
        <div
          className="h-full bg-gradient-to-r from-electric/60 via-electric to-green-hud transition-[width] duration-700"
          style={{ width: `${Math.max(3, sg.progress)}%` }}
        />
      </div>

      {/* v51.3 VIAJE DE HITOS — la campaña hecha visible: conquistado ✓ · activo · futuro */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Hitos de la campaña">
        {MILESTONES_LOCAL.map((m) => {
          const reachedM = (sg.reached ?? []).includes(m) || sg.total >= m;
          const activeM = m === sg.goal;
          const rw = REWARDS_LOCAL[m];
          return (
            <span
              key={m}
              title={reachedM ? `Hito ${m} conquistado — recompensa reclamable` : `Hito ${m}: ${rw.coins.toLocaleString("es")} mon + ${rw.gems} gemas + ${rw.xp} XP`}
              className={[
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors",
                reachedM
                  ? "border-green-hud/60 bg-green-hud/15 text-green-hud"
                  : activeM
                    ? "border-amber/70 bg-amber/15 text-amber animate-pulse"
                    : "border-border text-muted-foreground/70",
              ].join(" ")}
            >
              {reachedM ? <Check className="w-3 h-3" aria-hidden /> : activeM ? <Flag className="w-3 h-3" aria-hidden /> : null}
              {m}
              {activeM && !reachedM && (
                <span className="hidden sm:inline-flex items-center gap-0.5 text-amber/80">
                  <Coins className="w-2.5 h-2.5" aria-hidden />{rw.coins.toLocaleString("es")}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-muted-foreground">
        <span>
          {sg.unlocked
            ? `META ${sg.goal} CONQUISTADA — la recompensa espera para todos`
            : `Faltan ${sg.remaining} enlaces para la meta ${sg.goal} — cada publicación en un sitio nuevo cuenta`}
        </span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-amber"><Coins className="w-3 h-3" aria-hidden />{sg.reward.coins.toLocaleString("es")}</span>
          <span className="flex items-center gap-1 text-electric"><Gem className="w-3 h-3" aria-hidden />{sg.reward.gems}</span>
          <span className="text-muted-foreground/70">+{sg.reward.xp} XP</span>
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {pendingGoal !== null ? (
          <Button onClick={claim} disabled={claiming} size="sm" className="gap-2 font-mono text-xs uppercase tracking-widest bg-electric/15 border border-electric/50 hover:bg-electric/25 text-electric" variant="outline">
            <Globe2 className="w-4 h-4" aria-hidden /> Reclamar recompensa del hito {pendingGoal} enlaces
          </Button>
        ) : sg.unlocked && !claimedHere ? (
          <Button onClick={claim} disabled={claiming} size="sm" className="gap-2 font-mono text-xs uppercase tracking-widest bg-electric/15 border border-electric/50 hover:bg-electric/25 text-electric" variant="outline">
            <Globe2 className="w-4 h-4" aria-hidden /> Reclamar recompensa global
          </Button>
        ) : (
          <>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-green-hud/40 text-green-hud font-mono text-[11px] uppercase tracking-wider hover:bg-green-hud/10 transition-colors" aria-label="Compartir misión por WhatsApp">
              WhatsApp
            </a>
            <a href={tgHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-electric/40 text-electric font-mono text-[11px] uppercase tracking-wider hover:bg-electric/10 transition-colors" aria-label="Compartir misión por Telegram">
              Telegram
            </a>
            <a href={xHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-foreground font-mono text-[11px] uppercase tracking-wider hover:bg-white/5 transition-colors" aria-label="Compartir misión por X">
              X
            </a>
            <Button onClick={copyInvite} size="sm" variant="outline" className="gap-2 h-9 font-mono text-[11px] uppercase tracking-wider" aria-label="Copiar mensaje de la misión">
              {copied ? <Check className="w-3.5 h-3.5 text-green-hud" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />} Copiar misión
            </Button>
          </>
        )}
        {claimedHere && (
          <span className="font-mono text-[11px] text-green-hud uppercase tracking-wider">Recompensa reclamada — gracias, comandante {referral}</span>
        )}
      </div>
    </section>
  );
}
