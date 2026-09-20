"use client";

import { useState } from "react";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { FUSION_RECIPES, type FusionRecipe } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Layers, ChevronRight, Coins, Star, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const rarityColor: Record<string, string> = {
  COMUN: "text-muted-foreground border-border",
  RARO: "text-cyan-hud border-cyan-hud",
  EPICO: "text-violet-hud border-violet-hud",
  LEGENDARIO: "text-amber border-amber-hud",
};

const rarityGlow: Record<string, string> = {
  COMUN: "",
  RARO: "glow-cyan",
  EPICO: "glow-amber",
  LEGENDARIO: "glow-amber",
};

export function FusionPanel() {
  const { inventory, coins, spendCoins, consumeFromInventory, addToInventory, addXp, recordFusion } = useGameStore();
  const [fusing, setFusing] = useState<string | null>(null);
  const [result, setResult] = useState<FusionRecipe | null>(null);

  const handleFusion = (recipe: FusionRecipe) => {
    // verify inputs
    for (const input of recipe.inputs) {
      const item = inventory.find((i) => i.label === input.label);
      if (!item || item.quantity < input.quantity) {
        toast.error("Materiales insuficientes", {
          description: `Falta ${input.label} (${input.quantity})`,
        });
        return;
      }
    }
    if (coins < recipe.cost) {
      toast.error("Monedas insuficientes");
      return;
    }
    setFusing(recipe.id);
    setTimeout(() => {
      // consume
      spendCoins(recipe.cost, `Fusion ${recipe.name}`);
      recipe.inputs.forEach((input) => {
        const item = inventory.find((i) => i.label === input.label);
        if (item) consumeFromInventory(item.id, input.quantity);
      });
      // add output
      addToInventory({
        id: recipe.output.label.toLowerCase().replace(/\s+/g, "_"),
        label: recipe.output.label,
        emoji: recipe.output.emoji,
        rarity: recipe.rarity,
        source: `Fusion ${recipe.name}`,
      }, recipe.output.quantity);
      addXp(recipe.xpReward);
      recordFusion();
      setResult(recipe);
      setFusing(null);
      toast.success(`Fusion exitosa! +${recipe.output.quantity} ${recipe.output.label}`, {
        description: `+${recipe.xpReward} XP · -${recipe.cost} monedas`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Sala de fusion"
        subtitle="Sintetiza inteligencia · crea objetos superiores"
        icon={<Layers className="w-4 h-4 text-violet-hud" />}
        color="violet"
        right={
          <div className="text-[10px] font-mono text-muted-foreground">
            <span className="text-amber">{coins}</span> monedas
          </div>
        }
      />

      {/* Inventory */}
      <div className="hud-corner p-3">
        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Inventario actual</div>
        {inventory.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin materiales. Consigue cables en Noticias, fotos en Galeria.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {inventory.map((i) => (
              <div key={i.id} className={cn("hud-corner p-2 flex items-center gap-1.5", rarityColor[i.rarity])}>
                <span className="text-xl"><VIcon k={i.emoji} className="w-6 h-6 text-amber" /></span>
                <div className="leading-tight">
                  <div className="text-[10px] font-mono font-bold">{i.label}</div>
                  <div className="text-[9px] font-mono text-muted-foreground">x{i.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipes */}
      <div className="grid md:grid-cols-2 gap-3">
        {FUSION_RECIPES.map((recipe) => {
          const canFuse = recipe.inputs.every((input) => {
            const item = inventory.find((i) => i.label === input.label);
            return item && item.quantity >= input.quantity;
          }) && coins >= recipe.cost;
          const isThisFusing = fusing === recipe.id;

          return (
            <div key={recipe.id} className={cn("hud-corner p-3", canFuse && "glow-amber")}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-mono font-bold text-foreground">{recipe.name}</div>
                  <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", rarityColor[recipe.rarity])}>
                    {recipe.rarity}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-amber flex items-center gap-0.5 justify-end">
                    <Coins className="w-3 h-3" /> {recipe.cost}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-hud flex items-center gap-0.5 justify-end">
                    <Star className="w-3 h-3" /> {recipe.xpReward} XP
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-3">{recipe.description}</p>

              {/* Recipe flow */}
              <div className="flex items-center justify-center gap-2 mb-3 py-2 hud-corner bg-secondary/30">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {recipe.inputs.map((input, i) => {
                      const item = inventory.find((inv) => inv.label === input.label);
                      const has = item && item.quantity >= input.quantity;
                      return (
                        <div key={i} className={cn("hud-corner p-1.5 text-center min-w-[48px]", has ? "border-green-hud" : "border-red-hud")}>
                          <div className="text-lg"><VIcon k={input.emoji} className="w-5 h-5 text-amber" /></div>
                          <div className="text-[8px] font-mono text-muted-foreground">{input.label}</div>
                          <div className={cn("text-[9px] font-mono font-bold", has ? "text-green-hud" : "text-red-hud")}>
                            {item?.quantity ?? 0}/{input.quantity}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber" />
                <div className={cn("hud-corner p-2 text-center min-w-[64px]", rarityGlow[recipe.rarity], rarityColor[recipe.rarity])}>
                  <div className="text-2xl"><VIcon k={recipe.output.emoji} className="w-7 h-7 text-violet-hud" /></div>
                  <div className="text-[8px] font-mono text-muted-foreground">{recipe.output.label}</div>
                  <div className="text-[9px] font-mono font-bold">x{recipe.output.quantity}</div>
                </div>
              </div>

              <Button
                onClick={() => handleFusion(recipe)}
                disabled={!canFuse || isThisFusing}
                className={cn(
                  "w-full font-mono text-[10px] uppercase tracking-wider h-8",
                  canFuse && !isThisFusing
                    ? "bg-violet-hud/40 hover:bg-violet-hud/60 border border-violet-hud text-violet-hud"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {isThisFusing ? (
                  <>
                    <Zap className="w-3 h-3 mr-1 animate-pulse" /> Fusionando...
                  </>
                ) : canFuse ? (
                  "Iniciar fusion"
                ) : (
                  "Materiales insuficientes"
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="hud-corner p-4 text-center border-amber-hud glow-amber"
          >
            <div className="text-4xl mb-2 flex justify-center"><VIcon k={result.output.emoji} className="w-10 h-10 text-violet-hud" /></div>
            <div className="text-sm font-mono font-bold text-amber">Fusion exitosa!</div>
            <p className="text-xs text-muted-foreground mt-1">
              Has creado {result.output.quantity}x {result.output.label} (+{result.xpReward} XP)
            </p>
            <Button
              size="sm"
              onClick={() => setResult(null)}
              className="mt-2 bg-amber-hud text-amber hover:bg-amber-hud/80 font-mono uppercase"
            >
              <Check className="w-3 h-3 mr-1" /> Continuar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
