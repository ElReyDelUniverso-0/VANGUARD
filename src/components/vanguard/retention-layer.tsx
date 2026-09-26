"use client";

// v55.0 TEMPORADA CERO — CAPA GLOBAL DE RETENCIÓN
// Se monta en el layout raíz: funciona en TODAS las páginas, no solo la
// portada. Combina: pase de temporada, cofres variables, combo de sesión,
// informe de ausencia y avisos inteligentes. Mobile-first.

import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useRetention,
  SEASON_DAYS,
  TIER_XP,
  MAX_TIER,
  CHEST_INTERVAL_S,
  COMBO_STEP_S,
  COMBO_MAX,
  COMBO_IDLE_RESET_S,
  tierReward,
  type ChestReward,
} from "@/lib/retention";
import { useGameStore } from "@/lib/game-store";
import { DailyLoginModal } from "@/components/vanguard/daily-login-modal";
import { Flame, Gift, Star, Timer, TrendingUp, Radar, Plane, MapPin, X } from "lucide-react";

const RARITY_STYLE: Record<string, { label: string; cls: string; glow: string }> = {
  COMUN: { label: "COMÚN", cls: "text-slate-200 border-slate-500/60", glow: "shadow-[0_0_18px_rgba(148,163,184,0.5)]" },
  RARO: { label: "RARO", cls: "text-cyan-300 border-cyan-400/60", glow: "shadow-[0_0_22px_rgba(34,211,238,0.6)]" },
  EPICO: { label: "ÉPICO", cls: "text-violet-300 border-violet-400/70", glow: "shadow-[0_0_28px_rgba(167,139,250,0.7)]" },
  LEGENDARIO: { label: "LEGENDARIO", cls: "text-amber-300 border-amber-400/80", glow: "shadow-[0_0_36px_rgba(251,191,36,0.85)]" },
};

interface PulsoZone { label: string; total: number; planes: unknown[] }
interface AbsenceReport {
  awayHours: number;
  aircraft: number;
  zones: number;
  hottest: string;
  hottestTotal: number;
}

function fmtCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${m}m ${String(s % 60).padStart(2, "0")}s`;
}

export function RetentionLayer() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [chestReady, setChestReady] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [rollRarity, setRollRarity] = useState<string>("COMUN");
  const [lastReward, setLastReward] = useState<ChestReward | null>(null);
  const [absence, setAbsence] = useState<AbsenceReport | null>(null);
  const [absenceOpen, setAbsenceOpen] = useState(false);

  const activeSec = useRef(0);
  const lastActivity = useRef(Date.now());
  const lastComboToast = useRef(0);
  const lastNudge = useRef(0);
  const chestBase = useRef(0);

  const ret = useRetention();
  const game = useGameStore();

  // ---------- actividad + ticker ----------
  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem("vg_retention_hidden") === "1") setHidden(true);
    } catch {}

    const bump = () => { lastActivity.current = Date.now(); };
    window.addEventListener("pointerdown", bump, { passive: true });
    window.addEventListener("keydown", bump);
    window.addEventListener("touchstart", bump, { passive: true });
    window.addEventListener("scroll", bump, { passive: true });

    const iv = setInterval(() => {
      setNow(Date.now());
      if (document.hidden) return;
      const idleFor = (Date.now() - lastActivity.current) / 1000;
      if (idleFor > COMBO_IDLE_RESET_S) {
        activeSec.current = 0;
        chestBase.current = Math.floor(activeSec.current / CHEST_INTERVAL_S);
        return;
      }
      const prev = activeSec.current;
      activeSec.current += 1;

      // combo x2 alcanzado → celebración una vez por sesión
      const combo = comboOf();
      if (combo >= 2.0 && lastComboToast.current < 2) {
        lastComboToast.current = 2;
        toast("🔥 ¡COMBO x2.0! Tu XP de temporada va al doble", { description: "Sigue activo para llegar a x3.0" });
      } else if (combo >= 3.0 && lastComboToast.current < 3) {
        lastComboToast.current = 3;
        toast("⚡ ¡COMBO MÁXIMO x3.0!", { description: "Estás en modo veterano. Así se juega en VANGUARD." });
      }

      // goteo de XP de temporada cada 60s activos (escala con combo)
      if (Math.floor(activeSec.current / 60) > Math.floor(prev / 60)) {
        ret.addSeasonXp(Math.round(3 * combo));
      }

      // cofre listo cada CHEST_INTERVAL_S de actividad real
      const chestIdx = Math.floor(activeSec.current / CHEST_INTERVAL_S);
      if (chestIdx > chestBase.current && !chestReady) {
        chestBase.current = chestIdx;
        setChestReady(true);
        toast("🎁 COFRE DETECTADO EN TU SECTOR", { description: "Suministros sin abrir. Pulsa el cofre." });
      }
    }, 1000);

    return () => {
      clearInterval(iv);
      window.removeEventListener("pointerdown", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("touchstart", bump);
      window.removeEventListener("scroll", bump);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chestReady]);

  // ---------- visita / informe de ausencia ----------
  useEffect(() => {
    if (!mounted) return;
    const r = ret.touchVisit();
    if (r.returned) {
      fetch("/api/pulso")
        .then((x) => x.json())
        .then((d: { zones?: PulsoZone[] }) => {
          const zones = d.zones || [];
          const aircraft = zones.reduce((a, z) => a + (z.planes?.length || 0), 0);
          const hot = zones.reduce<PulsoZone | null>((a, z) => (!a || z.total > a.total ? z : a), null);
          setAbsence({
            awayHours: Math.round(r.awayHours * 10) / 10,
            aircraft,
            zones: zones.length,
            hottest: hot?.label || "sector desconocido",
            hottestTotal: hot?.total || 0,
          });
          setAbsenceOpen(true);
        })
        .catch(() => {
          setAbsence({ awayHours: Math.round(r.awayHours), aircraft: 0, zones: 0, hottest: "satélites sin señal", hottestTotal: 0 });
          setAbsenceOpen(true);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // ---------- avisos inteligentes cada 90s ----------
  useEffect(() => {
    if (!mounted) return;
    const iv = setInterval(() => {
      if (document.hidden || ret.nudgesMuted) return;
      const t = Date.now();
      if (t - lastNudge.current < 90000) return;
      const tier = ret.tierOf();
      const pending = Array.from({ length: MAX_TIER }, (_, i) => i + 1).filter(
        (n) => !ret.claimedTiers.includes(n) && n <= tier
      );
      if (pending.length > 0) {
        lastNudge.current = t;
        toast(`⬆️ ${pending.length} nivel(es) de TEMPORADA listos`, { description: "Recompensas esperando. Ábrelos antes de que acabe el día." });
        return;
      }
      if (ret.seasonDaysLeft() <= 3) {
        lastNudge.current = t;
        toast(`⏳ Solo quedan ${ret.seasonDaysLeft()} días de TEMPORADA CERO`, { description: "Última oportunidad para subir de nivel." });
      }
    }, 90000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const comboOf = () =>
    Math.min(COMBO_MAX, 1.0 + Math.floor(activeSec.current / COMBO_STEP_S) * 0.1);

  const toggleHidden = () => {
    const v = !hidden;
    setHidden(v);
    try { localStorage.setItem("vg_retention_hidden", v ? "1" : "0"); } catch {}
  };

  const openChest = useCallback(() => {
    if (rolling || !chestReady) return;
    setRolling(true);
    // ruleta de rareza: sube la tensión ~1.6s antes del veredicto
    const pool = ["COMUN", "RARO", "EPICO", "LEGENDARIO", "RARO", "EPICO", "COMUN"];
    let i = 0;
    const spin = setInterval(() => {
      setRollRarity(pool[i % pool.length]);
      i++;
    }, 110);
    setTimeout(() => {
      clearInterval(spin);
      const rw = ret.openChest();
      const combo = comboOf();
      const xp = Math.round(rw.seasonXp * combo);
      if (rw.coins > 0) game.addCoins(rw.coins, `Cofre ${rw.rarity}`);
      if (rw.gems > 0) game.addGems(rw.gems, `Cofre ${rw.rarity}`);
      if (xp > 0) ret.addSeasonXp(xp);
      setLastReward({ ...rw, seasonXp: xp });
      setRolling(false);
      setChestReady(false);
      const st = RARITY_STYLE[rw.rarity];
      toast(`${st.label}: +${rw.coins} monedas${rw.gems ? ` · +${rw.gems} gemas` : ""} · +${xp} XP`, {
        description: rw.rarity === "LEGENDARIO" ? "¡JACKPOT! Eres de los elegidos." : "Vuelve en 8 min de acción por otro cofre.",
      });
    }, 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolling, chestReady]);

  const claimN = (n: number) => {
    const rw = ret.claimTier(n);
    if (!rw) return;
    const tr = tierReward(n);
    game.addCoins(tr.coins, `Temporada nivel ${n}`);
    if (tr.gems > 0) game.addGems(tr.gems, `Temporada nivel ${n}`);
    toast(`Nivel ${n} reclamado: +${tr.coins} monedas${tr.gems ? ` · +${tr.gems} gemas` : ""}`);
  };

  const claimAbsenceGift = () => {
    game.addCoins(60, "Regalo de retorno");
    toast(" +60 monedas de bienvenida de vuelta", { description: "El frente te echó de menos, agente." });
    setAbsenceOpen(false);
  };

  if (!mounted) return <DailyLoginModal />;

  const tier = ret.tierOf();
  const prog = ret.tierProgress();
  const day = ret.seasonDay();
  const combo = comboOf();
  const seasonEnds = new Date(ret.seasonStart + "T00:00:00").getTime() + SEASON_DAYS * 86400000;
  const seasonLeft = seasonEnds - now;
  const secToNextCombo = COMBO_STEP_S - (activeSec.current % COMBO_STEP_S);
  const nextTier = tier + 1;

  return (
    <>
      {/* Enganche global: login diario en todas las páginas */}
      <DailyLoginModal />

      {!hidden && (
        <>
          {/* ---------- CLÚSTER INFERIOR IZQUIERDO: temporada + combo ---------- */}
          <div className="fixed bottom-2 left-2 z-30 flex flex-col gap-1.5 max-w-[62vw]">
            <button
              onClick={() => setSeasonOpen(true)}
              className="pointer-events-auto text-left rounded-lg border border-amber-500/40 bg-black/85 backdrop-blur px-2.5 py-1.5 shadow-lg hover:border-amber-400/70 transition-colors"
            >
              <div className="flex items-center gap-1.5 font-mono text-[10px] leading-tight">
                <Star className="w-3 h-3 text-amber-300 shrink-0" />
                <span className="text-amber-200 font-bold">TEMPORADA CERO</span>
                <span className="text-slate-400">Nv {tier}</span>
                <span className="text-slate-500">· D{day}/30</span>
                <span className="text-rose-400 ml-0.5">{fmtCountdown(seasonLeft)}</span>
              </div>
              <div className="mt-1 h-1 w-full rounded bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${Math.round(prog * 100)}%` }} />
              </div>
            </button>
            <div className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-black/85 backdrop-blur px-2.5 py-1 font-mono text-[10px] shadow-lg">
              <Flame className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="text-rose-200 font-bold">COMBO x{combo.toFixed(1)}</span>
              {combo < COMBO_MAX && <span className="text-slate-500">x{(combo + 0.1).toFixed(1)} en {fmtCountdown(secToNextCombo * 1000)}</span>}
              {combo >= COMBO_MAX && <span className="text-amber-300">MÁXIMO</span>}
            </div>
          </div>

          {/* ---------- COFRE FLOTANTE ---------- */}
          <button
            onClick={openChest}
            className={`fixed bottom-2 right-2 z-30 rounded-lg border px-3 py-2 font-mono text-[11px] font-bold backdrop-blur transition-all ${
              chestReady
                ? `border-amber-400 bg-amber-500/20 text-amber-200 animate-pulse ${RARITY_STYLE.EPICO.glow}`
                : "border-slate-600/60 bg-black/85 text-slate-300"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Gift className="w-4 h-4" />
              {chestReady ? (rolling ? rollRarity + "…" : "¡ABRIR COFRE!") : `cofre en ${fmtCountdown((CHEST_INTERVAL_S - (activeSec.current % CHEST_INTERVAL_S)) * 1000)}`}
            </span>
          </button>
        </>
      )}

      {hidden && (
        <button
          onClick={toggleHidden}
          className="fixed bottom-2 left-2 z-30 rounded-lg border border-slate-600/60 bg-black/85 px-2 py-1 font-mono text-[10px] text-slate-400"
        >
          ★ temporada
        </button>
      )}
      {!hidden && (
        <button onClick={toggleHidden} className="fixed bottom-2 left-1/2 -translate-x-1/2 z-30 rounded border border-slate-700/50 bg-black/70 px-1.5 py-0.5 text-slate-600" aria-label="ocultar">
          <X className="w-3 h-3" />
        </button>
      )}

      {/* ---------- MODAL TEMPORADA ---------- */}
      <Dialog open={seasonOpen} onOpenChange={setSeasonOpen}>
        <DialogContent className="!fixed border-amber-500/40 bg-black/95 sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-amber-300 flex items-center gap-2">
              <Star className="w-5 h-5" /> TEMPORADA CERO · pase de 30 días
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-mono text-xs">
              Día {day}/30 · termina en {fmtCountdown(seasonLeft)} · cada acción en VANGUARD sube tu nivel
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 font-mono text-xs">
              <div className="flex justify-between text-slate-400">
                <span>NIVEL {tier} → {nextTier}</span>
                <span>{ret.seasonXp % TIER_XP}/{TIER_XP} XP</span>
              </div>
              <div className="mt-1.5 h-2 rounded bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${Math.round(prog * 100)}%` }} />
              </div>
              <div className="mt-1.5 text-[10px] text-slate-500">
                Multiplicador actual x{combo.toFixed(1)} · la XP de cofres y actividad escala con tu COMBO
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: MAX_TIER }, (_, i) => i + 1).map((n) => {
                const claimed = ret.claimedTiers.includes(n);
                const ready = !claimed && n <= tier;
                const tr = tierReward(n);
                return (
                  <button
                    key={n}
                    onClick={() => ready && claimN(n)}
                    title={`Nivel ${n}: +${tr.coins} monedas${tr.gems ? ` +${tr.gems} gemas` : ""}`}
                    className={`rounded border p-1.5 text-center font-mono text-[10px] transition-colors ${
                      claimed
                        ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                        : ready
                        ? "border-amber-400 bg-amber-500/20 text-amber-200 animate-pulse"
                        : "border-slate-700 bg-slate-900/60 text-slate-600"
                    }`}
                  >
                    <div className="font-bold">{n}</div>
                    <div className="text-[8px]">{claimed ? "OK" : ready ? " reclamar" : `+${tr.coins}`}</div>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] font-mono text-slate-500 leading-relaxed">
              Sube nivel jugando: cofres (+10/25/60/150 XP), actividad continua y misiones. Niveles múltiplos de 5 dan gemas.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- MODAL INFORME DE AUSENCIA ---------- */}
      <Dialog open={absenceOpen} onOpenChange={setAbsenceOpen}>
        <DialogContent className="!fixed border-rose-500/40 bg-black/95 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-rose-300 flex items-center gap-2">
              <Radar className="w-5 h-5" /> INFORME DE AUSENCIA
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-mono text-xs">
              Estuviste fuera {absence?.awayHours ?? 0} horas. El mundo no se detuvo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center gap-2 rounded border border-slate-700 bg-slate-900/70 p-2.5">
              <Plane className="w-4 h-4 text-cyan-300 shrink-0" />
              <span className="text-slate-300">{absence?.aircraft ?? 0} aeronaves rastreadas en zonas calientes</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-slate-700 bg-slate-900/70 p-2.5">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-slate-300">
                Zona más activa: <b className="text-rose-300">{absence?.hottest}</b> ({absence?.hottestTotal ?? 0} señales)
              </span>
            </div>
            <div className="flex items-center gap-2 rounded border border-slate-700 bg-slate-900/70 p-2.5">
              <TrendingUp className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="text-slate-300">{absence?.zones ?? 0} frentes monitoreados en tiempo real</span>
            </div>
            <Button onClick={claimAbsenceGift} className="w-full bg-amber-500 text-black hover:bg-amber-400 font-mono uppercase">
              <Gift className="w-4 h-4 mr-1" /> Reclamar regalo de retorno +60
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- ANIMACIÓN DE APERTURA DE COFRE ---------- */}
      {(rolling || lastReward) && rolling && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => {}}>
          <div className={`rounded-xl border-2 bg-black/95 px-8 py-6 text-center font-mono ${RARITY_STYLE[rollRarity]?.cls || ""} ${RARITY_STYLE[rollRarity]?.glow || ""}`}>
            <Gift className="w-10 h-10 mx-auto animate-bounce" />
            <div className="mt-2 text-xl font-bold tracking-widest">{rollRarity}</div>
            <div className="text-xs text-slate-500">descifrando suministros…</div>
          </div>
        </div>
      )}
    </>
  );
}
