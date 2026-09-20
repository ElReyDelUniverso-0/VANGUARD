"use client";

import { SHOP_ITEMS } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { ShoppingBag, Coins, Gem, Check, Lock, Zap, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function ShopPanel() {
  const { coins, gems, ownedAvatars, ownedCosmetics, activeAvatar, hudTheme, buyAvatar, buyCosmetic, buyBoost, unlockBriefing, readBriefings, spendCoins, addToInventory, activateElite, isElite } = useGameStore();

  const categories = ["CAMERA", "ELITE", "AVATAR", "BRIEFING", "BOOST", "CONSUMABLE", "COSMETIC"];
  const catLabel: Record<string, string> = {
    CAMERA: "Camaras de vigilancia",
    ELITE: "Membresias",
    AVATAR: "Avatares",
    BRIEFING: "Informes",
    BOOST: "Mejoras",
    CONSUMABLE: "Consumibles",
    COSMETIC: "Cosmeticos",
  };

  const goCameras = () => {
    window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: "camaras" }));
  };

  const handleBuy = (item: typeof SHOP_ITEMS[number]) => {
    if (item.category === "CAMERA") {
      // las camaras se pagan al desplegarlas en el mapa
      toast("Despliegue de camara", { description: "Elige el modelo en la red de camaras y colocalo donde quieras" });
      goCameras();
      return;
    }
    if (item.category === "ELITE") {
      if (isElite()) {
        toast.info("Pase ELITE ya activo");
        return;
      }
      const ok = item.currency === "COINS" ? activateElite("COINS") : activateElite("GEMS");
      if (ok) toast.success("PASE ELITE activado: ingresos x2, gemas diarias y descuentos", { description: "7 dias de ventajas de comando" });
      else toast.error(item.currency === "COINS" ? "Monedas insuficientes" : "Gemas insuficientes");
      return;
    }
    if (item.category === "AVATAR") {
      if (ownedAvatars.includes(item.id)) {
        useGameStore.setState({ activeAvatar: item.id });
        toast.success(`Avatar activado: ${item.title}`);
        return;
      }
      const ok = buyAvatar(item.id, item.cost);
      if (ok) toast.success(`Avatar comprado: ${item.title}`, { description: `-${item.cost} monedas` });
      else toast.error("Monedas insuficientes");
    } else if (item.category === "BRIEFING") {
      if (item.id === "BRIEFING_TW_SECRET") {
        const ok = unlockBriefing("B-TW-01", item.cost);
        if (ok) toast.success("Briefing SECRETO desbloqueado", { description: `-${item.cost} monedas` });
        else toast.error("Monedas insuficientes");
      }
    } else if (item.category === "BOOST") {
      if (item.id === "BOOST_HP_COMBAT") {
        const ok = spendCoins(item.cost, `Boost HP combate`);
        if (ok) toast.success(`${item.title} activado`, { description: `-${item.cost} monedas` });
        else toast.error("Monedas insuficientes");
        return;
      }
      const isXP = item.id === "BOOST_XP_2X";
      const ok = buyBoost(isXP ? "XP" : "COIN", item.cost);
      if (ok) toast.success(`${item.title} activado`, { description: `-${item.cost} gemas · 24h` });
      else toast.error("Gemas insuficientes");
    } else if (item.category === "CONSUMABLE") {
      const ok = spendCoins(item.cost, `Consumible ${item.title}`);
      if (ok) {
        addToInventory({
          id: item.id.toLowerCase().replace(/_/g, "_"),
          label: item.title,
          emoji: item.icon,
          rarity: "COMUN",
          source: "Tienda Vanguard",
        }, 1);
        toast.success(`Comprado: ${item.title}`, { description: `-${item.cost} monedas` });
      } else {
        toast.error("Monedas insuficientes");
      }
    } else if (item.category === "COSMETIC") {
      if (ownedCosmetics.includes(item.id.replace("COSMETIC_", "").split("_")[0])) {
        const t = item.id.includes("RED") ? "RED" : item.id.includes("CYAN") ? "CYAN" : "AMBER";
        useGameStore.setState({ hudTheme: t as any });
        toast.success(`Tema HUD activo: ${t}`);
        return;
      }
      const t = item.id.includes("RED") ? "RED" : "CYAN";
      const ok = buyCosmetic(t, item.cost, "HUD");
      if (ok) toast.success(`Cosmetico comprado: ${item.title}`, { description: `-${item.cost} gemas` });
      else toast.error("Gemas insuficientes");
    }
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Tienda de comando"
        subtitle="Gasta tus monedas y gemas"
        icon={<ShoppingBag className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-0.5 text-amber"><Coins className="w-3 h-3" /> {coins}</span>
            <span className="flex items-center gap-0.5 text-violet-hud"><Gem className="w-3 h-3" /> {gems}</span>
          </div>
        }
      />

      {categories.map((cat) => {
        const items = SHOP_ITEMS.filter((i) => i.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2 sticky top-[100px] bg-background/80 backdrop-blur-sm py-1 z-10">
              <div className="text-xs font-mono font-bold uppercase px-2 py-1 border border-cyan-hud text-cyan-hud bg-cyan-hud/30">
                {catLabel[cat]}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">{items.length} items</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {items.map((item) => {
                let owned = false;
                let active = false;
                if (cat === "AVATAR") {
                  owned = ownedAvatars.includes(item.id);
                  active = activeAvatar === item.id;
                } else if (cat === "COSMETIC") {
                  const t = item.id.includes("RED") ? "RED" : item.id.includes("CYAN") ? "CYAN" : "AMBER";
                  owned = ownedCosmetics.includes(t);
                  active = hudTheme === t;
                } else if (cat === "BRIEFING") {
                  owned = readBriefings.includes("B-TW-01");
                } else if (cat === "ELITE") {
                  owned = isElite();
                  active = isElite();
                }
                const affordable = item.currency === "COINS" ? coins >= item.cost : gems >= item.cost;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "hud-corner p-3 flex flex-col items-center text-center",
                      active && "glow-amber"
                    )}
                  >
                    <div className={cn("w-14 h-14 flex items-center justify-center mb-2 hud-corner bg-secondary/50", active && "bg-amber-hud")}>
                      <VIcon k={item.icon} className="w-7 h-7 text-amber" />
                    </div>
                    <div className="text-xs font-mono font-bold text-foreground mb-1 line-clamp-1">{item.title}</div>
                    <div className="text-[10px] text-muted-foreground mb-2 line-clamp-2 flex-1">{item.description}</div>
                    <div className="flex items-center gap-1 text-[10px] font-mono mb-2">
                      {item.currency === "COINS" ? (
                        <span className={cn("flex items-center gap-0.5", affordable ? "text-amber" : "text-red-hud")}>
                          <Coins className="w-3 h-3" /> {item.cost}
                        </span>
                      ) : (
                        <span className={cn("flex items-center gap-0.5", affordable ? "text-violet-hud" : "text-red-hud")}>
                          <Gem className="w-3 h-3" /> {item.cost}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleBuy(item)}
                      disabled={(cat === "BRIEFING" && owned) || (cat === "ELITE" && owned)}
                      className={cn(
                        "w-full h-7 text-[10px] font-mono uppercase",
                        active
                          ? "bg-green-hud/30 border border-green-hud text-green-hud"
                          : owned
                          ? "bg-secondary text-muted-foreground"
                          : affordable
                          ? "bg-cyan-hud/30 border border-cyan-hud text-cyan-hud hover:bg-cyan-hud/50"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {active ? (
                        <><Check className="w-3 h-3 mr-1" /> Activo</>
                      ) : owned ? (
                        <><Check className="w-3 h-3 mr-1" /> Activar</>
                      ) : (cat === "BRIEFING" || cat === "ELITE") && owned ? (
                        <><Lock className="w-3 h-3 mr-1" /> Comprado</>
                      ) : cat === "CAMERA" ? (
                        <><Video className="w-3 h-3 mr-1" /> Desplegar</>
                      ) : affordable ? (
                        <>Comprar</>
                      ) : (
                        <><Lock className="w-3 h-3 mr-1" /> Sin saldo</>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Boost indicator */}
      <div className="hud-corner p-3 bg-secondary/30 flex items-center gap-3 text-[10px] font-mono">
        <Zap className="w-4 h-4 text-amber" />
        <span className="text-muted-foreground">
          Los boosts duplican tus ganancias durante 24 horas. Las camaras generan intel incluso mientras no juegas: despliegalas cerca de frentes criticos para maximizar ingresos.
        </span>
      </div>
    </div>
  );
}
