"use client";

import { useState } from "react";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { CONQUERABLE_COUNTRIES, realLoot, fmtBudget, type ConquerableCountry } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Globe2, Swords, Shield, Coins, Star, Check, Lock, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";

export function CountryControlPanel() {
  const { coins, spendCoins, addCoins, addXp } = useGameStore();
  const [conquered, setConquered] = useState<Set<string>>(new Set());
  const [attacking, setAttacking] = useState<string | null>(null);
  const [defenseLeft, setDefenseLeft] = useState(0);

  const totalConquered = conquered.size;
  const totalReward = totalConquered * 50;

  const handleConquer = (country: ConquerableCountry) => {
    if (conquered.has(country.id)) return;
    const cost = Math.round(country.defense * 2);
    if (coins < cost) {
      toast.error("Monedas insuficientes", { description: `Necesitas ${cost} monedas para atacar ${country.name}` });
      return;
    }

    spendCoins(cost, `Atacar ${country.name}`);
    setAttacking(country.id);
    setDefenseLeft(country.defense);
    sfx.alarm();

    // Simulate battle
    let remaining = country.defense;
    const interval = setInterval(() => {
      const damage = 5 + Math.floor(Math.random() * 15);
      remaining = Math.max(0, remaining - damage);
      setDefenseLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        // Victory — v45.0: botín REAL = presupuesto militar del país (Banco Mundial)
        const loot = realLoot(country);
        const reward = country.reward + loot + Math.floor(Math.random() * 30);
        addCoins(reward, `Conquista de ${country.name}`);
        addXp(60);
        sfx.success();
        setConquered((prev) => new Set([...prev, country.id]));
        setAttacking(null);
        toast.success(`¡${country.name} conquistado!`, {
          description:
            loot > 0 && country.realBudgetB != null
              ? `+${reward} monedas · +${loot} botín real (${fmtBudget(country.realBudgetB)}) · +60 XP`
              : `+${reward} monedas · +60 XP`,
        });
      }
    }, 300);
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Control de paises"
        subtitle="Conquista territorios · gana recursos"
        icon={<Globe2 className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-amber flex items-center gap-0.5"><Coins className="w-3 h-3" /> {coins}</span>
            <span className="text-green-hud">{totalConquered}/{CONQUERABLE_COUNTRIES.length}</span>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="hud-corner p-2 bg-amber-hud/10 border-amber-hud/40">
          <div className="flex items-center gap-1 mb-1">
            <Globe2 className="w-3 h-3 text-amber" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Conquistados</span>
          </div>
          <div className="text-lg font-mono font-bold text-amber">{totalConquered}</div>
        </div>
        <div className="hud-corner p-2 bg-green-hud/10 border-green-hud/40">
          <div className="flex items-center gap-1 mb-1">
            <Coins className="w-3 h-3 text-green-hud" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Bonus total</span>
          </div>
          <div className="text-lg font-mono font-bold text-green-hud">+{totalReward}</div>
        </div>
        <div className="hud-corner p-2 bg-violet-hud/10 border-violet-hud/40">
          <div className="flex items-center gap-1 mb-1">
            <Trophy className="w-3 h-3 text-violet-hud" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Dominio</span>
          </div>
          <div className="text-lg font-mono font-bold text-violet-hud">{Math.round((totalConquered / CONQUERABLE_COUNTRIES.length) * 100)}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="hud-corner p-3 bg-secondary/30">
        <div className="flex items-center justify-between text-[10px] font-mono mb-2">
          <span className="text-muted-foreground uppercase">Dominio global</span>
          <span className="text-amber">{totalConquered}/{CONQUERABLE_COUNTRIES.length} paises</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber to-orange-500 transition-all" style={{ width: `${(totalConquered / CONQUERABLE_COUNTRIES.length) * 100}%` }} />
        </div>
      </div>

      {/* Countries grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {CONQUERABLE_COUNTRIES.map((country, idx) => {
          const isConquered = conquered.has(country.id);
          const isAttacking = attacking === country.id;
          const cost = Math.round(country.defense * 2);

          return (
            <motion.div
              key={country.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02 }}
              className={cn(
                "hud-corner p-3 transition-all",
                isConquered && "border-green-hud bg-green-hud/10",
                isAttacking && "border-red-hud glow-red"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl"><FlagBadge code={country.flag} size="lg" /></span>
                {isConquered && <Check className="w-4 h-4 text-green-hud" />}
                {isAttacking && <Zap className="w-4 h-4 text-red-hud blink-soft" />}
              </div>
              <div className="text-xs font-mono font-bold text-foreground truncate">{country.name}</div>
              <div className="text-[9px] font-mono text-muted-foreground mb-2">{country.region}</div>

              {/* Defense bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-[8px] font-mono mb-0.5">
                  <span className="text-cyan-hud flex items-center gap-0.5"><Shield className="w-2 h-2" /> Defensa</span>
                  <span className="text-muted-foreground">{isAttacking ? defenseLeft : country.defense}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn("h-full transition-all", isConquered ? "bg-green-hud" : isAttacking ? "bg-red-hud blink-soft" : "bg-cyan-hud")}
                    style={{ width: isAttacking ? `${(defenseLeft / country.defense) * 100}%` : isConquered ? "100%" : "100%" }}
                  />
                </div>
              </div>

              {/* Reward + v45.0 botín real (Banco Mundial) */}
              <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                <span className="text-amber flex items-center gap-0.5"><Coins className="w-2.5 h-2.5" /> {country.reward}</span>
                <span className="text-muted-foreground">Costo: {cost}</span>
              </div>
              {country.realBudgetB != null && (
                <div
                  className="mb-2 inline-flex items-center gap-1 rounded-sm border border-amber-hud/50 bg-amber-hud/10 px-1 py-0.5 text-[8px] font-mono font-bold text-amber uppercase tracking-wider"
                  title={`Presupuesto militar real: ${fmtBudget(country.realBudgetB)} (Banco Mundial ${country.realBudgetYear ?? ""}) — se paga como botín al conquistar`}
                >
                  <Coins className="w-2 h-2" />
                  Botín real +{realLoot(country)}
                </div>
              )}

              {/* Action button */}
              {isConquered ? (
                <div className="text-center text-[10px] font-mono text-green-hud uppercase">
                  Conquistado
                </div>
              ) : isAttacking ? (
                <div className="text-center text-[10px] font-mono text-red-hud blink-soft uppercase">
                  Atacando...
                </div>
              ) : (
                <Button
                  onClick={() => handleConquer(country)}
                  disabled={attacking !== null || coins < cost}
                  size="sm"
                  className="w-full h-7 text-[10px] font-mono uppercase bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50"
                >
                  <Swords className="w-3 h-3 mr-1" /> Atacar
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Info */}
      <div className="hud-corner p-3 bg-secondary/30 text-[10px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5 mb-1">
          <Star className="w-3 h-3 text-amber" />
          <span className="text-amber uppercase">Como funciona</span>
        </div>
        Cada pais tiene un nivel de defensa. El costo de ataque es defensa x 2 monedas. La batalla reduce la defensa gradualmente. Al conquistar, recibes recompensas en monedas + XP + bonus por dominio.
        v45.0: los paises con presupuesto militar real (Banco Mundial) pagan BOTIN REAL extra — Ucrania (US$ 64,7 mil M/año) es el premio gordo: +65 monedas.
      </div>
    </div>
  );
}
