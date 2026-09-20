"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Swords, Shield, Zap, Heart, Skull, Crosshair, ChevronRight, RotateCw, Trophy, Coins, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";

interface EnemyUnit {
  id: number;
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  reward: { coins: number; xp: number };
}

interface CombatLogEntry {
  id: number;
  text: string;
  type: "player" | "enemy" | "system" | "victory" | "defeat";
}

const ITEM_STATS: Record<string, { attack: number; defense: number; special?: string }> = {
  raw_cable: { attack: 8, defense: 2, special: "Senal interceptada (+3 attack)" },
  raw_photo: { attack: 5, defense: 5, special: "Reconocimiento (+5 defense)" },
  informe_depurado: { attack: 12, defense: 4, special: "Inteligencia precisa (critical)" },
  paquete_satelital: { attack: 18, defense: 8, special: "Vista satelital (double attack)" },
  dossier_de_crisis: { attack: 25, defense: 12, special: "Analisis completo (triple attack)" },
  operacion_clasificada: { attack: 40, defense: 20, special: "Operacion elite (devastating)" },
};

const ENEMY_NAMES = [
  { name: "Patrulla enemiga", emoji: "shield", hp: 30, attack: 6, defense: 2, reward: { coins: 15, xp: 20 } },
  { name: "Vehiculo blindado", emoji: "car", hp: 50, attack: 10, defense: 5, reward: { coins: 25, xp: 30 } },
  { name: "Sniper hostil", emoji: "crosshair", hp: 25, attack: 15, defense: 1, reward: { coins: 20, xp: 35 } },
  { name: "Drone de combate", emoji: "radar", hp: 40, attack: 12, defense: 6, reward: { coins: 30, xp: 40 } },
  { name: "Bunker fortificado", emoji: "castle", hp: 80, attack: 8, defense: 15, reward: { coins: 50, xp: 60 } },
  { name: "Comando elite", emoji: "skull", hp: 60, attack: 18, defense: 10, reward: { coins: 45, xp: 55 } },
  { name: "Artilleria pesada", emoji: "bomb", hp: 45, attack: 22, defense: 3, reward: { coins: 35, xp: 50 } },
];

export function CombatSimulatorPanel() {
  const { inventory, coins, addCoins, addXp, consumeFromInventory, spendCoins } = useGameStore();
  const [phase, setPhase] = useState<"idle" | "fighting" | "victory" | "defeat">("idle");
  const [playerHp, setPlayerHp] = useState(100);
  const [maxPlayerHp, setMaxPlayerHp] = useState(100);
  const [enemy, setEnemy] = useState<EnemyUnit | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [log, setLog] = useState<CombatLogEntry[]>([]);
  const [round, setRound] = useState(1);
  const [totalReward, setTotalReward] = useState({ coins: 0, xp: 0 });
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);
  const logIdRef = useRef(0);

  const addLog = useCallback((text: string, type: CombatLogEntry["type"]) => {
    setLog((prev) => [...prev.slice(-15), { id: logIdRef.current++, text, type }]);
  }, []);

  const startCombat = () => {
    const enemyTemplate = ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];
    setPhase("fighting");
    setPlayerHp(100);
    setMaxPlayerHp(100);
    setRound(1);
    setTotalReward({ coins: 0, xp: 0 });
    setEnemiesDefeated(0);
    setLog([]);
    setEnemy({
      ...enemyTemplate,
      id: 1,
      hp: enemyTemplate.hp,
      maxHp: enemyTemplate.hp,
    });
    addLog("Combate iniciado · Selecciona un item para atacar", "system");
    sfx.alarm();
  };

  const playerAttack = () => {
    if (!selectedItem || !enemy || phase !== "fighting") return;
    const item = inventory.find((i) => i.id === selectedItem);
    if (!item || item.quantity <= 0) {
      toast.error("Item no disponible");
      return;
    }
    const stats = ITEM_STATS[item.id] || { attack: 5, defense: 0 };
    let damage = stats.attack + Math.floor(Math.random() * 5);
    const isCritical = item.id === "informe_depurado" && Math.random() > 0.5;
    const isDouble = item.id === "paquete_satelital";
    const isTriple = item.id === "dossier_de_crisis";
    const isDevastating = item.id === "operacion_clasificada";

    if (isCritical) damage = Math.round(damage * 1.5);
    if (isDouble) damage *= 2;
    if (isTriple) damage *= 3;
    if (isDevastating) damage *= 4;

    damage = Math.max(1, damage - enemy.defense);

    // Consume the item
    consumeFromInventory(item.id, 1);

    addLog(`${item.label} usada → ${damage} de daño${isCritical ? " (CRITICO!)" : isDevastating ? " (DEVASTADOR!)" : ""}`, "player");

    const newEnemyHp = Math.max(0, enemy.hp - damage);
    setEnemy({ ...enemy, hp: newEnemyHp });

    if (newEnemyHp <= 0) {
      // Victory
      addLog(`¡${enemy.name} eliminado! +${enemy.reward.coins} monedas, +${enemy.reward.xp} XP`, "victory");
      sfx.success();
      setTotalReward((r) => ({ coins: r.coins + enemy.reward.coins, xp: r.xp + enemy.reward.xp }));
      setEnemiesDefeated((e) => e + 1);
      addCoins(enemy.reward.coins, "Combat Simulator victory");
      addXp(enemy.reward.xp);

      // Heal 20 hp per victory
      setPlayerHp((hp) => Math.min(maxPlayerHp, hp + 20));
      addLog("Recuperas 20 HP tras la victoria", "system");

      // Next enemy
      setTimeout(() => {
        const next = ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];
        const scaledHp = Math.round(next.hp * (1 + enemiesDefeated * 0.15));
        setEnemy({
          ...next,
          id: enemiesDefeated + 2,
          hp: scaledHp,
          maxHp: scaledHp,
          reward: {
            coins: Math.round(next.reward.coins * (1 + enemiesDefeated * 0.1)),
            xp: Math.round(next.reward.xp * (1 + enemiesDefeated * 0.1)),
          },
        });
        setRound((r) => r + 1);
        addLog(`Nuevo enemigo: ${next.name} (${scaledHp} HP)`, "system");
      }, 1000);
    } else {
      // Enemy counter-attack
      setTimeout(() => {
        const enemyDamage = Math.max(1, enemy.attack + Math.floor(Math.random() * 4) - Math.floor((ITEM_STATS[item.id]?.defense || 0) / 2));
        setPlayerHp((hp) => {
          const newHp = Math.max(0, hp - enemyDamage);
          addLog(`${enemy.name} contraataca → ${enemyDamage} de daño`, "enemy");
          if (newHp <= 0) {
            setPhase("defeat");
            addLog("Has sido derrotado. Combate terminado.", "defeat");
            sfx.error();
          }
          return newHp;
        });
      }, 500);
    }

    setSelectedItem(null);
  };

  const endCombat = () => {
    setPhase("idle");
    setEnemy(null);
    setLog([]);
    sfx.click();
  };

  const usableItems = inventory.filter((i) => ITEM_STATS[i.id]);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Simulador de combate"
        subtitle="Usa items del inventario · combate tactico por turnos"
        icon={<Swords className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <div className="text-[10px] font-mono text-muted-foreground">
            {phase === "fighting" ? `Ronda ${round}` : "Listo"}
          </div>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="hud-corner p-2 bg-red-hud/10 border-red-hud/40">
          <div className="flex items-center gap-1 mb-1">
            <Heart className="w-3 h-3 text-red-hud" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Tu HP</span>
          </div>
          <div className="text-lg font-mono font-bold text-red-hud tabular-nums">{playerHp}/{maxPlayerHp}</div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
            <div className="h-full bg-red-hud transition-all" style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }} />
          </div>
        </div>
        <div className="hud-corner p-2 bg-amber-hud/10 border-amber-hud/40">
          <div className="flex items-center gap-1 mb-1">
            <Trophy className="w-3 h-3 text-amber" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Enemigos</span>
          </div>
          <div className="text-lg font-mono font-bold text-amber tabular-nums">{enemiesDefeated}</div>
          <div className="text-[9px] font-mono text-muted-foreground">derrotados</div>
        </div>
        <div className="hud-corner p-2 bg-green-hud/10 border-green-hud/40">
          <div className="flex items-center gap-1 mb-1">
            <Coins className="w-3 h-3 text-green-hud" />
            <span className="text-[9px] font-mono text-muted-foreground uppercase">Ganado</span>
          </div>
          <div className="text-lg font-mono font-bold text-green-hud tabular-nums">+{totalReward.coins}</div>
          <div className="text-[9px] font-mono text-cyan-hud">+{totalReward.xp} XP</div>
        </div>
      </div>

      {phase === "idle" && (
        <div className="hud-corner p-6 text-center">
          <Swords className="w-12 h-12 mx-auto text-red-hud mb-3" />
          <div className="text-base font-mono font-bold text-foreground mb-2">Simulador de combate tactico</div>
          <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
            Usa los items de tu inventario como armas contra enemigos generados. Cada item tiene stats unicos y efectos especiales. Gana monedas y XP por cada enemigo derrotado.
          </p>
          <div className="flex items-center justify-center gap-3 mb-4 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-amber"><Crosshair className="w-3 h-3" /> Ataque</span>
            <span className="flex items-center gap-1 text-cyan-hud"><Shield className="w-3 h-3" /> Defensa</span>
            <span className="flex items-center gap-1 text-violet-hud"><Zap className="w-3 h-3" /> Especial</span>
          </div>
          {usableItems.length === 0 ? (
            <div className="text-xs text-muted-foreground mb-3">
              No tienes items usables. Consigue cables en Noticias, fotos en Galeria, o fusiona items en la Sala de Fusion.
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground mb-3">
              Tienes {usableItems.length} tipos de items usables ({usableItems.reduce((a, i) => a + i.quantity, 0)} total)
            </div>
          )}
          <Button
            onClick={startCombat}
            disabled={usableItems.length === 0}
            className="bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50 font-mono uppercase tracking-wider"
          >
            <Swords className="w-4 h-4 mr-1" /> Iniciar combate
          </Button>
        </div>
      )}

      {phase === "fighting" && (
        <>
          {/* Enemy display - always visible at top */}
          {enemy && (
          <motion.div
            key={enemy.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hud-corner p-4 bg-red-hud/10 border-red-hud/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <VIcon k={enemy.emoji} className="w-10 h-10 text-red-hud" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-bold text-foreground">{enemy.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">Ronda {round}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] font-mono">
                  <span className="flex items-center gap-0.5 text-red-hud"><Heart className="w-3 h-3" /> {enemy.hp}/{enemy.maxHp}</span>
                  <span className="flex items-center gap-0.5 text-amber"><Crosshair className="w-3 h-3" /> {enemy.attack}</span>
                  <span className="flex items-center gap-0.5 text-cyan-hud"><Shield className="w-3 h-3" /> {enemy.defense}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-red-hud transition-all" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
          )}

          {/* Item selection */}
          <div className="hud-corner p-3">
            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Selecciona un item para atacar</div>
            {usableItems.length === 0 ? (
              <div className="text-center py-4">
                <Skull className="w-8 h-8 mx-auto text-red-hud mb-2" />
                <p className="text-xs font-mono text-red-hud mb-3">Sin items disponibles</p>
                <Button onClick={() => { setPhase("defeat"); addLog("Sin items quedan, retirada", "defeat"); }} size="sm" className="bg-red-hud/30 border border-red-hud text-red-hud font-mono uppercase">
                  Retirada
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {usableItems.map((item) => {
                  const stats = ITEM_STATS[item.id];
                  const isSelected = selectedItem === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "hud-corner p-2 text-left transition-all",
                        isSelected ? "border-amber-hud bg-amber-hud/30 glow-amber" : "hover:bg-secondary/40"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-lg"><VIcon k={item.emoji} className="w-5 h-5 text-amber inline" /></span>
                        <span className="text-[10px] font-mono font-bold text-foreground truncate">{item.label}</span>
                        <span className="text-[9px] font-mono text-muted-foreground ml-auto">x{item.quantity}</span>
                      </div>
                      {stats && (
                        <div className="flex items-center gap-2 text-[9px] font-mono">
                          <span className="text-amber"><Crosshair className="w-2.5 h-2.5 inline" /> {stats.attack}</span>
                          <span className="text-cyan-hud"><Shield className="w-2.5 h-2.5 inline" /> {stats.defense}</span>
                        </div>
                      )}
                      {stats?.special && (
                        <div className="text-[8px] font-mono text-violet-hud mt-0.5 truncate">{stats.special}</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Attack button */}
          {selectedItem && (
            <Button
              onClick={playerAttack}
              className="w-full bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50 font-mono uppercase tracking-wider glow-red"
            >
              <Swords className="w-4 h-4 mr-1" /> Atacar con {inventory.find((i) => i.id === selectedItem)?.label}
            </Button>
          )}

          {/* Combat log */}
          <div className="hud-corner p-3 bg-secondary/30">
            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Registro de combate</div>
            <div className="space-y-1 max-h-[200px] overflow-y-auto thin-scroll">
              <AnimatePresence>
                {log.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "text-xs font-mono py-1 px-2 rounded-sm",
                      entry.type === "player" && "text-amber bg-amber-hud/10",
                      entry.type === "enemy" && "text-red-hud bg-red-hud/10",
                      entry.type === "system" && "text-muted-foreground",
                      entry.type === "victory" && "text-green-hud bg-green-hud/10 font-bold",
                      entry.type === "defeat" && "text-red-hud bg-red-hud/20 font-bold"
                    )}
                  >
                    {entry.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      {(phase === "victory" || phase === "defeat") && (
        <div className="hud-corner p-6 text-center">
          {phase === "defeat" ? (
            <>
              <Skull className="w-12 h-12 mx-auto text-red-hud mb-3" />
              <div className="text-lg font-mono font-bold text-red-hud mb-2">Combate terminado</div>
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-4">
                <div className="hud-corner p-2 bg-secondary/40">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Enemigos</div>
                  <div className="text-xl font-mono font-bold text-amber">{enemiesDefeated}</div>
                </div>
                <div className="hud-corner p-2 bg-secondary/40">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Monedas</div>
                  <div className="text-xl font-mono font-bold text-green-hud">+{totalReward.coins}</div>
                </div>
                <div className="hud-corner p-2 bg-secondary/40">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">XP</div>
                  <div className="text-xl font-mono font-bold text-cyan-hud">+{totalReward.xp}</div>
                </div>
              </div>
            </>
          ) : null}
          <Button
            onClick={endCombat}
            className="bg-amber-hud text-amber hover:bg-amber-hud/80 font-mono uppercase tracking-wider"
          >
            <RotateCw className="w-4 h-4 mr-1" /> Volver
          </Button>
        </div>
      )}
    </div>
  );
}
