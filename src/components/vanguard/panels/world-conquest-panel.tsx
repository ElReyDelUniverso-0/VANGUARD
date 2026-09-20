"use client";

// Vanguard v6 — MUNDO DE GUERRA: mini-juego de conquista estilo Risk sobre el mapa mundial real.
// Controlas un pais/territorio, te expandes por adyacencias, 3 IA enemigas con doctrinas propias.
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Swords, Shield, Flag, Coins, Globe2, Play, RotateCcw, ChevronRight, X,
  Crosshair, Trophy, Skull, Layers, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import type { Globe3DMarker, Globe3DArc } from "@/components/vanguard/globe-map-3d";
import { useGameStore } from "@/lib/game-store";
import {
  TERRITORIES, FACTIONS, getTerritory, incomeFor, resolveBattle,
  createInitialSnapshot, CAPTURE_REWARD, COMMANDERS, getCommander,
  type ConquestSnapshot, type FactionId,
} from "@/lib/conquest-data";

// v14 — MAPA DE GUERRA EN 3D: globo real (globe.gl) en lugar del SVG plano
const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  { ssr: false, loading: () => (
    <div className="hud-corner p-10 flex items-center justify-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
      Cargando motor 3D...
    </div>
  ) }
);

const CONTINENT_COLOR: Record<string, string> = {
  "NORTEAMÉRICA": "#3EA6FF",
  "SUDAMÉRICA": "#38BDF8",
  "EUROPA": "#A855F7",
  "ÁFRICA": "#00FF87",
  "ASIA": "#FF3B30",
  "OCEANÍA": "#FFD166",
};

const TERRITORY_NAMES: Record<string, string> = Object.fromEntries(
  TERRITORIES.map((t) => [t.id, t.name])
);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function WorldConquestPanel() {
  const save = useGameStore((s) => s.conquestSave);
  const setConquestSave = useGameStore((s) => s.setConquestSave);
  const recordConquestWin = useGameStore((s) => s.recordConquestWin);
  const recordConquestCaptureStat = useGameStore((s) => s.recordConquestCaptureStat);
  const addPassXp = useGameStore((s) => s.addPassXp);
  const addCoins = useGameStore((s) => s.addCoins);
  const addXp = useGameStore((s) => s.addXp);
  const coins = useGameStore((s) => s.coins);

  const [snap, setSnap] = useState<ConquestSnapshot | null>(save ?? null);
  const [homePick, setHomePick] = useState<string | null>(null);
  const [commanderPick, setCommanderPick] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [battle, setBattle] = useState<{
    fromName: string; toName: string; atkRoll: number; defRoll: number;
    defLosses: number; atkLosses: number; captured: boolean; attacker: FactionId; defender: FactionId;
  } | null>(null);
  const [aiThinking, setAiThinking] = useState<FactionId | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  // persistir cada cambio
  useEffect(() => {
    setConquestSave(snap);
  }, [snap, setConquestSave]);

  const phase: "REINFORCE" | "ATTACK" | "IDLE" | "OVER" =
    !snap ? "IDLE" : snap.finished ? "OVER" : (aiThinking !== null || busy) ? "ATTACK" : snap.reserves > 0 ? "REINFORCE" : "ATTACK";

  const playerTerritories = useMemo(
    () => (snap ? TERRITORIES.filter((t) => snap.territories[t.id].owner === 0) : []),
    [snap]
  );

  // ====== acciones del jugador ======
  const startCampaign = useCallback(() => {
    if (!homePick || !commanderPick) return;
    const s = createInitialSnapshot(homePick, commanderPick);
    setSnap(s);
    setSelected(null);
  }, [homePick, commanderPick]);

  const deployTroop = useCallback((tid: string) => {
    setSnap((prev) => {
      if (!prev || prev.reserves <= 0) return prev;
      const terr = prev.territories[tid];
      if (!terr || terr.owner !== 0) return prev;
      return {
        ...prev,
        reserves: prev.reserves - 1,
        territories: { ...prev.territories, [tid]: { ...terr, troops: terr.troops + 1 } },
      };
    });
  }, []);

  const deployAll = useCallback(() => {
    setSnap((prev) => {
      if (!prev || prev.reserves <= 0) return prev;
      const own = TERRITORIES.filter((t) => prev.territories[t.id].owner === 0);
      if (own.length === 0) return prev;
      const next = { ...prev.territories };
      let r = prev.reserves;
      // priorizar fronteras
      const frontier = own.filter((t) => t.adj.some((a) => next[a].owner !== 0));
      const pool = frontier.length > 0 ? frontier : own;
      let i = 0;
      while (r > 0) {
        const t = pool[i % pool.length];
        next[t.id] = { ...next[t.id], troops: next[t.id].troops + 1 };
        r -= 1;
        i += 1;
      }
      return { ...prev, reserves: 0, territories: next };
    });
  }, []);

  const doAttack = useCallback((fromId: string, toId: string) => {
    if (!snap) return;
    const cmd = getCommander(snap.commander);
    const from = snap.territories[fromId];
    const to = snap.territories[toId];
    if (!from || !to || from.owner !== 0 || from.troops < 2) return;
    const atkForce = from.troops - 1;
    const res = resolveBattle(atkForce, to.troops, cmd?.atkMult ?? 1, 1);
    const next = { ...snap.territories };
    let captures = snap.captures;
    let finished = false;
    let victory = false;
    const log = [...snap.log];

    if (res.captured) {
      next[toId] = { owner: 0, troops: Math.max(1, atkForce - res.atkLosses) };
      next[fromId] = { owner: 0, troops: 1 };
      captures += 1;
      log.unshift({
        ts: Date.now(),
        msg: `TOMASTE ${getTerritory(toId).name.toUpperCase()} (${res.atkLosses} bajas propias, ${res.defLosses} enemigas)`,
        faction: 0,
      });
    } else {
      next[fromId] = { owner: 0, troops: Math.max(1, from.troops - res.atkLosses) };
      next[toId] = { owner: to.owner, troops: Math.max(0, to.troops - res.defLosses) };
      if (next[toId].troops <= 0) {
        // defensa aniquilada -> captura automatica con supervivientes minimos
        next[toId] = { owner: 0, troops: Math.max(1, atkForce - res.atkLosses) };
        next[fromId] = { owner: 0, troops: 1 };
        captures += 1;
        res.captured = true;
      }
      log.unshift({
        ts: Date.now(),
        msg: res.captured
          ? `TOMASTE ${getTerritory(toId).name.toUpperCase()} en combate callejero (${res.atkLosses} bajas propias)`
          : `Asalto rechazado en ${getTerritory(toId).name} (${res.atkLosses} bajas propias)`,
        faction: 0,
      });
    }
    log.splice(14);

    finished = TERRITORIES.every((t) => next[t.id].owner === 0);
    victory = finished;
    if (!finished && TERRITORIES.filter((t) => next[t.id].owner === 0).length === 0) {
      finished = true;
      victory = false;
    }

    setBattle({
      fromName: getTerritory(fromId).name, toName: getTerritory(toId).name,
      atkRoll: res.atkRoll, defRoll: res.defRoll, defLosses: res.defLosses,
      atkLosses: res.atkLosses, captured: res.captured, attacker: 0, defender: to.owner,
    });
    if (res.captured) {
      const coinReward = Math.round(CAPTURE_REWARD.coins * (cmd?.coinMult ?? 1));
      addCoins(coinReward, `Territorio conquistado: ${getTerritory(toId).name}`);
      addXp(CAPTURE_REWARD.xp);
      recordConquestCaptureStat();
      addPassXp(4);
    }
    if (finished && victory) {
      setTimeout(() => recordConquestWin(), 400);
    }
    setSnap({ ...snap, territories: next, captures, log, finished, victory });
  }, [snap, addCoins, addXp, recordConquestWin, recordConquestCaptureStat, addPassXp]);

  // ====== turno de la IA ======
  const endTurn = useCallback(async () => {
    if (!snap || busyRef.current || snap.finished) return;
    busyRef.current = true;
    setBusy(true);
    setSelected(null);
    let s: ConquestSnapshot = { ...snap, territories: { ...snap.territories }, log: [...snap.log] };

    for (const f of [1, 2, 3] as FactionId[]) {
      const ownedIds = TERRITORIES.filter((t) => s.territories[t.id].owner === f).map((t) => t.id);
      if (ownedIds.length === 0) continue;
      setAiThinking(f);
      await sleep(700);

      // refuerzos
      const inc = incomeFor(s.territories, f);
      let reserves = inc;
      const logF = [...s.log];
      logF.unshift({ ts: Date.now(), msg: `${FACTIONS[f].name}: +${inc} refuerzos`, faction: f });
      const terrs = { ...s.territories };
      const frontier = ownedIds.filter((id) => getTerritory(id).adj.some((a) => terrs[a].owner !== f));
      const pool = frontier.length > 0 ? frontier : ownedIds;
      let i = 0;
      while (reserves > 0) {
        const id = pool[i % pool.length];
        terrs[id] = { ...terrs[id], troops: terrs[id].troops + 1 };
        reserves -= 1;
        i += 1;
      }

      // ataques (hasta 3, contra el vecino mas debil con ventaja)
      let attacks = 0;
      while (attacks < 3) {
        let best: { from: string; to: string; ratio: number } | null = null;
        for (const id of ownedIds) {
          const src = terrs[id];
          if (src.owner !== f || src.troops < 3) continue;
          for (const adj of getTerritory(id).adj) {
            const dst = terrs[adj];
            if (!dst || dst.owner === f || dst.owner === null) continue;
            const ratio = (src.troops - 1) / Math.max(1, dst.troops);
            if (ratio >= 1.35 && (!best || ratio > best.ratio)) {
              best = { from: id, to: adj, ratio };
            }
          }
        }
        if (!best) break;
        const from = terrs[best.from];
        const to = terrs[best.to];
        const atkForce = from.troops - 1;
        // v8: la defensa del JUGADOR aplica el multiplicador del comandante elegido
        const playerDefMult = to.owner === 0 ? (getCommander(snap?.commander)?.defMult ?? 1) : 1;
        const res = resolveBattle(atkForce, to.troops, 1, playerDefMult);
        if (res.captured) {
          terrs[best.to] = { owner: f, troops: Math.max(1, atkForce - res.atkLosses) };
          terrs[best.from] = { owner: f, troops: 1 };
          ownedIds.push(best.to);
          logF.unshift({
            ts: Date.now(),
            msg: `${FACTIONS[f].short} TOMO ${getTerritory(best.to).name.toUpperCase()}${to.owner === 0 ? " (¡TUYO!)" : ""}`,
            faction: f,
          });
        } else {
          terrs[best.from] = { owner: f, troops: Math.max(1, from.troops - res.atkLosses) };
          terrs[best.to] = { owner: to.owner, troops: Math.max(1, to.troops - res.defLosses) };
          logF.unshift({
            ts: Date.now(),
            msg: `${FACTIONS[f].short} fallo el asalto a ${getTerritory(best.to).name}${to.owner === 0 ? " (tu territorio aguanta)" : ""}`,
            faction: f,
          });
        }
        attacks += 1;
        await sleep(450);
      }
      logF.splice(14);
      s = { ...s, territories: terrs, log: logF };
      setSnap(s);
      await sleep(350);
    }

    // derrotas / nueva ronda
    const ownedByPlayer = TERRITORIES.filter((t) => s.territories[t.id].owner === 0).length;
    let finished = false;
    let victory = false;
    if (ownedByPlayer === 0) { finished = true; victory = false; }
    if (TERRITORIES.every((t) => s.territories[t.id].owner === 0)) { finished = true; victory = true; }
    const income = incomeFor(s.territories, 0) + (getCommander(snap?.commander)?.incomeBonus ?? 0);
    const log = [...s.log];
    if (!finished) {
      log.unshift({ ts: Date.now(), msg: `RONDA ${s.turn + 1} — Recibes ${income} refuerzos. Turno de ${FACTIONS[0].name}.`, faction: 0 });
    }
    setSnap({ ...s, turn: s.turn + 1, activeFaction: 0, reserves: income, finished, victory, log });
    setAiThinking(null);
    setBusy(false);
    busyRef.current = false;
  }, [snap]);

  const newCampaign = useCallback(() => {
    setSnap(null);
    setHomePick(null);
    setSelected(null);
    setBattle(null);
  }, []);

  // limpiar banner de batalla
  useEffect(() => {
    if (!battle) return;
    const t = setTimeout(() => setBattle(null), 3600);
    return () => clearTimeout(t);
  }, [battle]);

  const selectedTerr = selected ? TERRITORIES.find((t) => t.id === selected) : null;
  const canAttackFrom = (tid: string) => phase === "ATTACK" && snap?.territories[tid].owner === 0 && snap?.territories[tid].troops >= 2;
  const attackTargets = useMemo(() => {
    if (!selectedTerr || !snap || !canAttackFrom(selectedTerr.id)) return [];
    return selectedTerr.adj.filter((a) => snap.territories[a].owner !== 0);
  }, [selectedTerr, snap]);

  // ====== render ======
  if (!snap) {
    return (
      <HomeSelect
        homePick={homePick}
        setHomePick={setHomePick}
        commanderPick={commanderPick}
        setCommanderPick={setCommanderPick}
        onStart={startCampaign}
        coins={coins}
      />
    );
  }

  const totalPlayer = playerTerritories.length;
  const domainPct = Math.round((totalPlayer / TERRITORIES.length) * 100);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Mundo de Guerra"
        subtitle={`Ronda ${snap.turn} · ${TERRITORIES.length} territorios · comandante ${getCommander(snap.commander)?.name ?? "SIN ASIGNAR"}`}
        icon={<Globe2 className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
              <Coins className="w-3.5 h-3.5 text-amber" /> {coins}
            </div>
            <button
              onClick={newCampaign}
              className="flex items-center gap-1 px-2 py-1 border border-red-hud/60 text-red-hud rounded-sm text-[10px] font-mono font-bold uppercase hover:bg-red-hud/20"
            >
              <RotateCcw className="w-3 h-3" /> Nueva
            </button>
          </div>
        }
      />

      {/* barra de estado de facciones */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {FACTIONS.map((f) => {
          const count = TERRITORIES.filter((t) => snap.territories[t.id].owner === f.id).length;
          const troops = TERRITORIES.filter((t) => snap.territories[t.id].owner === f.id)
            .reduce((acc, t) => acc + snap.territories[t.id].troops, 0);
          const isTurn = aiThinking === f.id;
          return (
            <div
              key={f.id}
              className={cn(
                "hud-corner p-2.5 bg-secondary/40 border transition-all",
                f.borderClass,
                isTurn && "ring-1 ring-white/40 scale-[1.02]"
              )}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={cn("text-[10px] font-mono font-bold uppercase truncate", f.colorClass)}>
                  {f.id === 0 ? f.name : f.short}
                </span>
                {isTurn && <Zap className="w-3 h-3 troop-pulse text-white" />}
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <div className="text-[8px] font-mono text-muted-foreground uppercase">Territorios</div>
                  <div className={cn("text-lg font-mono font-bold leading-none", f.colorClass)}>{count}</div>
                </div>
                <div>
                  <div className="text-[8px] font-mono text-muted-foreground uppercase">Tropas</div>
                  <div className="text-lg font-mono font-bold leading-none text-foreground">{troops}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* MAPA DE GUERRA */}
        <div className="lg:col-span-2">
          <WarMap3D
            snap={snap}
            selected={selected}
            attackTargets={attackTargets}
            aiThinking={aiThinking}
            onTerritoryClick={(tid) => {
              if (phase === "OVER" || busy) return;
              const terr = snap.territories[tid];
              if (phase === "REINFORCE") {
                if (terr.owner === 0 && snap.reserves > 0) deployTroop(tid);
                return;
              }
              if (terr.owner === 0 && canAttackFrom(tid)) {
                setSelected(tid === selected ? null : tid);
                return;
              }
              if (selected && attackTargets.includes(tid)) {
                doAttack(selected, tid);
              }
            }}
          />
          {/* fase + acciones */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className={cn(
              "px-3 py-1.5 border rounded-sm text-[11px] font-mono font-bold uppercase tracking-wider",
              phase === "REINFORCE" ? "border-green-hud bg-green-hud/20 text-green-hud"
                : phase === "OVER" ? "border-red-hud bg-red-hud/20 text-red-hud"
                : "border-amber-hud bg-amber-hud/20 text-amber"
            )}>
              {phase === "REINFORCE" && `FASE REFUERZOS — ${snap.reserves} tropas por desplegar (click en tus territorios)`}
              {phase === "ATTACK" && !busy && "FASE ATAQUE — elige un territorio tuyo (2+ tropas) y luego un vecino enemigo"}
              {busy && aiThinking !== null && `TURNO ENEMIGO — ${FACTIONS[aiThinking].name} moviendo...`}
              {phase === "OVER" && (snap.victory ? "CAMPAÑA COMPLETADA — DOMINIO MUNDIAL" : "CAMPAÑA PERDIDA — tu imperio ha caído")}
            </div>
            {phase === "REINFORCE" && (
              <button
                onClick={deployAll}
                className="px-3 py-1.5 border border-green-hud text-green-hud rounded-sm text-[10px] font-mono font-bold uppercase hover:bg-green-hud/20"
              >
                Desplegar todo
              </button>
            )}
            {phase === "ATTACK" && !busy && (
              <button
                onClick={endTurn}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-hud bg-red-hud/20 text-red-hud rounded-sm text-[10px] font-mono font-bold uppercase hover:bg-red-hud/40"
              >
                <ChevronRight className="w-3.5 h-3.5" /> Terminar turno
              </button>
            )}
          </div>

          {/* banner de batalla */}
          <AnimatePresence>
            {battle && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "mt-2 hud-corner p-3 border",
                  battle.captured ? "border-green-hud bg-green-hud/10" : "border-red-hud bg-red-hud/10"
                )}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {battle.captured
                      ? <Trophy className="w-4 h-4 text-green-hud" />
                      : <Skull className="w-4 h-4 text-red-hud" />}
                    <span className="text-xs font-mono font-bold uppercase text-foreground">
                      {battle.fromName} → {battle.toName} {battle.captured ? "— ¡TERRITORIO TOMADO!" : "— asalto rechazado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="text-amber">ATK {battle.atkRoll.toFixed(1)}</span>
                    <span className="text-cyan-hud">DEF {battle.defRoll.toFixed(1)}</span>
                    <span className="text-green-hud">-{battle.defLosses} enemigos</span>
                    <span className="text-red-hud">-{battle.atkLosses} tuyos</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PANEL LATERAL */}
        <div className="space-y-3">
          {/* dominio */}
          <div className="hud-corner p-3 bg-secondary/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Dominio global</span>
              <span className="text-xs font-mono font-bold text-amber">{domainPct}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-hud to-red-hud"
                animate={{ width: `${domainPct}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
              />
            </div>
            <div className="text-[9px] font-mono text-muted-foreground mt-1.5">
              {totalPlayer}/{TERRITORIES.length} territorios · {snap.captures} conquistas · +5 mon / +3 XP por captura
            </div>
          </div>

          {/* territorio seleccionado */}
          {selectedTerr && (
            <div className="hud-corner p-3 bg-secondary/40 border-amber-hud">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-foreground">{selectedTerr.name}</div>
                  <div className="text-[9px] font-mono text-muted-foreground uppercase">
                    {selectedTerr.continent} · tropas {snap.territories[selectedTerr.id].troops}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {attackTargets.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-[9px] font-mono text-red-hud uppercase font-bold">Objetivos vecinos:</div>
                  {attackTargets.map((a) => {
                    const t = snap.territories[a];
                    const f = FACTIONS[t.owner];
                    const atkForce = snap.territories[selectedTerr.id].troops - 1;
                    // probabilidad aproximada: fuerza de ataque vs defensa x1.15
                    const odds = Math.round((atkForce / (atkForce + t.troops * 1.15)) * 100);
                    return (
                      <button
                        key={a}
                        onClick={() => doAttack(selectedTerr.id, a)}
                        disabled={busy}
                        className="w-full flex items-center justify-between gap-2 px-2 py-1.5 border border-red-hud/50 rounded-sm hover:bg-red-hud/20 transition-colors text-left disabled:opacity-40"
                      >
                        <span className="text-[10px] font-mono text-foreground truncate">{getTerritory(a).name}</span>
                        <span className="text-[9px] font-mono text-muted-foreground whitespace-nowrap flex items-center gap-1.5">
                          <span className={cn("font-bold", odds >= 60 ? "text-green-hud" : odds >= 35 ? "text-amber" : "text-red-hud")}>
                            {odds}%
                          </span>
                          {f.short} · {t.troops} tropas
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* log de guerra */}
          <div className="hud-corner bg-secondary/40">
            <div className="p-2.5 border-b border-amber-hud/30">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Bitácora de guerra</span>
            </div>
            <div className="max-h-64 overflow-y-auto thin-scroll divide-y divide-border/30">
              {snap.log.map((l, i) => {
                const f = FACTIONS[l.faction];
                return (
                  <div key={`${l.ts}-${i}`} className="px-2.5 py-1.5 text-[10px] font-mono leading-snug flex gap-1.5">
                    <span className={cn("font-bold whitespace-nowrap", f.colorClass)}>{f.short}</span>
                    <span className={cn("text-foreground/90", l.msg.includes("¡TUYO!") && "text-red-hud font-bold")}>
                      {l.msg}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* overlay fin de campana */}
      <AnimatePresence>
        {snap.finished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={cn(
                "hud-corner max-w-md w-full p-6 text-center border-2",
                snap.victory ? "border-amber-hud bg-amber-hud/10" : "border-red-hud bg-red-hud/10"
              )}
            >
              {snap.victory ? (
                <Trophy className="w-12 h-12 text-amber mx-auto mb-3" />
              ) : (
                <Skull className="w-12 h-12 text-red-hud mx-auto mb-3" />
              )}
              <h3 className="text-xl font-mono font-bold tracking-widest text-foreground uppercase mb-1">
                {snap.victory ? "Dominio Mundial" : "Imperio Destruido"}
              </h3>
              <p className="text-xs font-mono text-muted-foreground mb-4">
                {snap.victory
                  ? `Has conquistado los ${TERRITORIES.length} territorios en ${snap.turn} rondas. Recompensa: +500 monedas, +250 XP, +3 gemas y 1 CAJÓN LEGENDARIA gratuito.`
                  : `Tu imperio cayó en la ronda ${snap.turn}. Los generales enemigos reparten tu territorio.`}
              </p>
              <button
                onClick={newCampaign}
                className="px-4 py-2 border border-amber-hud bg-amber-hud/30 text-amber rounded-sm text-xs font-mono font-bold uppercase hover:bg-amber-hud/50"
              >
                Nueva campaña
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ====== MAPA DE GUERRA 3D (v14): globo real con territorios por faccion ======
function WarMap3D({
  snap, selected, attackTargets, aiThinking, onTerritoryClick,
}: {
  snap: ConquestSnapshot;
  selected: string | null;
  attackTargets: string[];
  aiThinking: FactionId | null;
  onTerritoryClick: (id: string) => void;
}) {
  // color de cada territorio segun su faccion propietaria
  const territoryColors = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of TERRITORIES) m[t.id] = FACTIONS[snap.territories[t.id].owner].color;
    return m;
  }, [snap]);

  const selectedTerr = selected ? getTerritory(selected) : null;

  // nodos de territorio: tropas + capital + objetivos, como pilares sobre el globo
  const markers = useMemo(() => {
    const arr: Globe3DMarker[] = TERRITORIES.map((t) => {
      const st = snap.territories[t.id];
      const f = FACTIONS[st.owner];
      const isTarget = attackTargets.includes(t.id);
      const isSel = selected === t.id;
      const isCapital = snap.playerHome === t.id && st.owner === 0;
      return {
        id: t.id,
        lat: t.lat,
        lng: t.lng,
        color: f.color,
        size: 0.3 + Math.min(0.34, st.troops * 0.03),
        alt: 0.02,
        ring: isTarget || isSel || isCapital,
        ringMax: isTarget ? 5.5 : 3.2,
        label: `${t.name} — ${st.troops} tropas${isCapital ? " · CAPITAL" : ""}`,
        labelTag: f.id === 0 ? "TU IMPERIO" : f.name,
        onClick: () => onTerritoryClick(t.id),
      };
    });
    return arr;
  }, [snap, selected, attackTargets, onTerritoryClick]);

  // flechas de asalto hacia los objetivos del territorio seleccionado
  const arcs = useMemo(() => {
    if (!selectedTerr) return [] as Globe3DArc[];
    return attackTargets.map((a) => {
      const to = getTerritory(a);
      return {
        startLat: selectedTerr.lat,
        startLng: selectedTerr.lng,
        endLat: to.lat,
        endLng: to.lng,
        color: ["#FF3B30", "#FF3B3066"] as [string, string],
        stroke: 0.9,
        dashTime: 1600,
      };
    });
  }, [selectedTerr, attackTargets]);

  return (
    <div className="hud-corner relative overflow-hidden">
      <GlobeMap3D
        territoryColors={territoryColors}
        territoryNames={TERRITORY_NAMES}
        highlightTerritory={selected}
        onTerritoryClick={(tid) => {
          if (tid) onTerritoryClick(tid);
        }}
        markers={markers}
        arcs={arcs}
        height="min(56vh, 540px)"
        minHeight={300}
        autoRotate={false}
        pov={{ lat: 24, lng: 12, altitude: 2.05 }}
        ariaLabel="Mapa de guerra 3D: territorios coloreados por facción"
      />
      {/* leyenda facciones */}
      <div className="absolute top-2 left-2 bg-background/85 px-2 py-1.5 hud-corner border-amber-hud pointer-events-none">
        <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Facciones</div>
        <div className="text-[8px] font-mono text-amber mb-1.5 flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-amber-hud blink-soft" /> TU CAPITAL PULSA EN AZUL
        </div>
        {FACTIONS.map((f) => (
          <div key={f.id} className="flex items-center gap-1.5 text-[9px] font-mono">
            <span className="w-2 h-2 rounded-sm" style={{ background: f.color }} />
            <span className={cn("uppercase", aiThinking === f.id ? f.colorClass + " font-bold" : "text-muted-foreground")}>
              {f.id === 0 ? "TU IMPERIO" : f.name}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-2 right-2 text-[10px] font-mono text-amber bg-background/80 px-2 py-1 hud-corner border-amber-hud">
        RONDA {snap.turn} · {aiThinking !== null ? FACTIONS[aiThinking].name : "TU TURNO"}
      </div>
      <div className="absolute bottom-2 left-2 text-[9px] font-mono text-muted-foreground bg-background/70 px-2 py-1 rounded-sm">
        Arrastra para girar el globo · clic en un territorio para actuar
      </div>
    </div>
  );
}

// ====== pantalla de seleccion de origen ======
function HomeSelect({
  homePick, setHomePick, commanderPick, setCommanderPick, onStart, coins,
}: {
  homePick: string | null;
  setHomePick: (id: string) => void;
  commanderPick: string | null;
  setCommanderPick: (id: string) => void;
  onStart: () => void;
  coins: number;
}) {
  const byContinent = useMemo(() => {
    const m: Record<string, typeof TERRITORIES> = {};
    for (const t of TERRITORIES) {
      (m[t.continent] ??= []).push(t);
    }
    return m;
  }, []);

  // v14: colores por continente para la vista previa 3D
  const previewColors = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of TERRITORIES) m[t.id] = CONTINENT_COLOR[t.continent] ?? "#3EA6FF";
    return m;
  }, []);

  return (
    <div className="space-y-4">
      <PanelHeader
        title="Mundo de Guerra"
        subtitle="Mini-juego de conquista global estilo tablero — elige tu nación de origen y domina los 24 territorios"
        icon={<Globe2 className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
            <Coins className="w-3.5 h-3.5 text-amber" /> {coins}
          </div>
        }
      />

      {/* v14: vista previa 3D con TU PAÍS resaltado antes de iniciar */}
      <div className="hud-corner relative overflow-hidden">
        <GlobeMap3D
          territoryColors={previewColors}
          territoryNames={TERRITORY_NAMES}
          highlightTerritory={homePick}
          onTerritoryClick={(tid) => {
            if (tid) setHomePick(tid);
          }}
          markers={
            homePick
              ? [{
                  id: "cap",
                  lat: getTerritory(homePick).lat,
                  lng: getTerritory(homePick).lng,
                  color: "#3EA6FF",
                  size: 0.55,
                  alt: 0.05,
                  ring: true,
                  ringMax: 4,
                  label: `TU PAÍS: ${getTerritory(homePick).name}`,
                  labelTag: "CAPITAL",
                }]
              : []
          }
          height="min(44vh, 430px)"
          minHeight={240}
          autoRotate
          rotateSpeed={0.5}
          ariaLabel="Globo 3D para elegir tu nación de origen"
        />
        <div className="absolute bottom-2 left-2 text-[9px] font-mono text-muted-foreground bg-background/80 px-2 py-1 hud-corner border-amber-hud">
          Toca una región del globo para elegir tu nación
        </div>
        {homePick && (
          <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-amber bg-background/80 px-2 py-1 hud-corner border-amber-hud">
            TU PAÍS: {getTerritory(homePick).name.toUpperCase()}
          </div>
        )}
      </div>

      <div className="hud-corner p-4 bg-secondary/40">
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <HowTo icon={<Flag className="w-4 h-4 text-amber" />} title="1 · Elige origen" desc="Tu capital inicia con 12 tropas. Las 3 IA enemigas se reparten el resto del planeta." />
          <HowTo icon={<Shield className="w-4 h-4 text-cyan-hud" />} title="2 · Elige comandante" desc="Cada comandante otorga una pasiva permanente: ataque, defensa, logística o botín." />
          <HowTo icon={<Swords className="w-4 h-4 text-red-hud" />} title="3 · Conquista" desc="Ataca vecinos con ventaja. Capturar da monedas y +4 PX de Pase Vanguard. Domina el 100% para el cajón LEGENDARIA." />
        </div>

        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2">
          Naciones de origen · {homePick ? "1 seleccionada" : "ninguna"}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto thin-scroll pr-1">
          {Object.entries(byContinent).map(([cont, list]) => (
            <div key={cont} className="space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-sm" style={{ background: CONTINENT_COLOR[cont] }} />
                <span style={{ color: CONTINENT_COLOR[cont] }}>{cont}</span>
              </div>
              {list.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setHomePick(t.id)}
                  className={cn(
                    "w-full text-left px-2 py-1.5 border rounded-sm text-[10px] font-mono transition-colors flex items-center justify-between gap-1",
                    homePick === t.id
                      ? "border-amber-hud bg-amber-hud/30 text-amber font-bold"
                      : "border-border/50 text-muted-foreground hover:text-foreground hover:border-amber-hud/40"
                  )}
                >
                  <span className="truncate">{t.name}</span>
                  <Layers className="w-3 h-3 opacity-50 flex-shrink-0" />
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2 mt-4">
          Comandante · {commanderPick ? (getCommander(commanderPick)?.name ?? "") : "ninguno seleccionado"}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
          {COMMANDERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCommanderPick(c.id)}
              className={cn(
                "text-left px-2.5 py-2 border rounded-sm transition-colors",
                commanderPick === c.id
                  ? "border-amber-hud bg-amber-hud/30 text-amber"
                  : "border-border/50 text-muted-foreground hover:text-foreground hover:border-amber-hud/40"
              )}
            >
              <div className="text-[10px] font-mono font-bold uppercase truncate">{c.name}</div>
              <div className="text-[9px] font-mono leading-snug mt-0.5">{c.doctrine}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[10px] font-mono text-muted-foreground">
            {homePick && commanderPick ? (
              <>
                Capital: <span className="text-amber font-bold">{getTerritory(homePick).name}</span> · comandante <span className="text-amber font-bold">{getCommander(commanderPick)?.name}</span>
              </>
            ) : (
              "Selecciona nación y comandante para comenzar la campaña"
            )}
          </div>
          <button
            onClick={onStart}
            disabled={!homePick || !commanderPick}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-colors",
              homePick && commanderPick
                ? "border-green-hud bg-green-hud/20 text-green-hud hover:bg-green-hud/40"
                : "border-border/50 text-muted-foreground opacity-50 cursor-not-allowed"
            )}
          >
            <Play className="w-4 h-4" /> Iniciar campaña
          </button>
        </div>
      </div>

      {/* facciones IA */}
      <div className="grid sm:grid-cols-3 gap-2">
        {FACTIONS.slice(1).map((f) => (
          <div key={f.id} className={cn("hud-corner p-3 bg-secondary/40 border", f.borderClass)}>
            <div className="flex items-center gap-2 mb-1">
              <Crosshair className={cn("w-4 h-4", f.colorClass)} />
              <span className={cn("text-xs font-mono font-bold uppercase", f.colorClass)}>{f.name}</span>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">{f.doctrine}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HowTo({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="hud-corner p-3 bg-background/60">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[11px] font-mono font-bold uppercase text-foreground">{title}</span>
      </div>
      <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">{desc}</div>
    </div>
  );
}
