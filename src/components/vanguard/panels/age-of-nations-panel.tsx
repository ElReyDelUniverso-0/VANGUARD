"use client";

// Vanguard v12 — AGE OF NATIONS: conquista mundial por turnos sobre el mapa
// real de 24 territorios. Dos modos: CONQUISTA (anexion militar estilo Age of
// History) y CRUZADA (guerras de religion con misioneros). IA agresiva/equilibrada/
// defensiva, impuestos, fortalezas, eventos historicos y guardado automatico.

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { Castle, Coins, Landmark, Swords, Shield, ScrollText, Flag, MoonStar, Crown, RotateCcw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { sfx } from "@/lib/sound";
import { useGameStore } from "@/lib/game-store";
import { TERRITORIES } from "@/lib/conquest-data";
import type { Globe3DMarker } from "@/components/vanguard/globe-map-3d";
import {
  newGame, endTurn, attack, moveTroops, recruit, buildFort, sendMissionary,
  provIncome, religionOf, religionShare, nationsAlive, saveAoN, loadAoN, clearAoN,
  AON_NATION_DEFS, AON_COSTS, AON_RELIGIONS,
  type AoNMode, type AoNState,
} from "@/lib/age-engine";

// v14 — AGE OF NATIONS EN 3D: el tablero SVG se sustituye por el globo real
const GlobeMap3D = dynamic(
  () => import("@/components/vanguard/globe-map-3d").then((m) => m.GlobeMap3D),
  { ssr: false, loading: () => (
    <div className="hud-corner p-10 flex items-center justify-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
      Cargando globo 3D...
    </div>
  ) }
);

export function AgeOfNationsPanel() {
  const coins = useGameStore((s) => s.coins);
  const addCoins = useGameStore((s) => s.addCoins);
  const addGems = useGameStore((s) => s.addGems);
  const addXp = useGameStore((s) => s.addXp);

  const [state, setState] = useState<AoNState | null>(() => {
    const s = loadAoN();
    return s && s.status === "JUGANDO" ? s : null;
  });
  const [mode, setMode] = useState<AoNMode>("CONQUISTA");
  const [nationPick, setNationPick] = useState(0);
  const [sel, setSel] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null); // provincia origen en modo mover
  const [rewarded, setRewarded] = useState(false);
  const [busy, setBusy] = useState(false);
  const stateRef = useRef<AoNState | null>(null);
  useEffect(() => { stateRef.current = state; }, [state]);


  const persist = useCallback((s: AoNState | null) => {
    setState(s ? { ...s } : null);
    if (s) saveAoN(s);
  }, []);

  const start = () => {
    sfx.levelUp();
    const s = newGame(mode, nationPick);
    persist(s);
    toast.success(`Nueva era: ${AON_NATION_DEFS[nationPick].name}`, { description: s.mode === "CONQUISTA" ? "Objetivo: controla 15 de 24 provincias" : "Objetivo: convierte 15 de 24 provincias a tu fe" });
  };

  const applyRewards = useCallback((s: AoNState) => {
    if (rewarded) return;
    setRewarded(true);
    if (s.status === "VICTORIA") {
      addCoins(600, "AGE OF NATIONS: victoria");
      addGems(3, "AGE OF NATIONS: victoria");
      addXp(220);
      sfx.success();
    } else {
      addCoins(50, "AGE OF NATIONS: participacion");
      addXp(40);
    }
  }, [rewarded, addCoins, addGems, addXp]);

  const needSel = () => { toast.error("Selecciona una provincia en el mapa"); return false; };

  // ====== ACCIONES ======
  const doAttack = (targetId: string) => {
    const s = stateRef.current; if (!s || !sel) return needSel();
    const r = attack(s, sel, targetId);
    if (!r.ok) { toast.error(r.msg); return; }
    sfx.alarm();
    if (r.captured) { addCoins(8, "Provincia capturada (Age of Nations)"); sfx.success(); }
    else sfx.error();
    toast(r.captured ? `¡${r.msg}! +8 mon` : r.msg, { description: `Turno ${s.turn} · acciones restantes: ${s.actions}` });
    if (s.status !== "JUGANDO") applyRewards(s);
    persist(s);
    setSel(targetId);
  };

  const doMove = (destId: string) => {
    const s = stateRef.current; if (!s || !moving) return;
    const qty = Math.floor(s.provs[moving].troops / 2);
    const r = moveTroops(s, moving, destId, Math.max(1, qty));
    if (!r.ok) { toast.error(r.msg); return; }
    sfx.beep();
    toast.success(r.msg);
    persist(s); setMoving(null);
  };

  const onProvClick = (id: string) => {
    const s = stateRef.current; if (!s) return;
    sfx.hover();
    const p = s.provs[id];
    if (moving) {
      if (p.owner === s.playerNation && TERRITORIES.find((t) => t.id === moving)!.adj.includes(id)) { doMove(id); return; }
      setMoving(null);
    }
    setSel(id);
  };

  const actionBtn = (label: string, icon: React.ReactNode, fn: () => void, disabled?: boolean, tone?: string) => (
    <Button size="sm" onClick={fn} disabled={disabled}
      className={cn("h-8 text-[10px] font-mono uppercase tracking-wide border", tone ?? "bg-secondary/50 border-border/60 text-foreground hover:border-amber-hud/60")}>
      {icon} {label}
    </Button>
  );

  // ====== SETUP ======
  if (!state) {
    return (
      <div className="space-y-3">
        <PanelHeader title="AGE OF NATIONS" subtitle="Estrategia por turnos · conquista y guerras de religion" icon={<Castle className="w-4 h-4" />} color="red" />
        <div className="grid md:grid-cols-2 gap-2">
          {(["CONQUISTA", "CRUZADA"] as AoNMode[]).map((m) => (
            <button key={m} onClick={() => { sfx.hover(); setMode(m); }}
              className={cn("hud-corner border p-4 text-left transition-colors", mode === m ? "border-amber-hud bg-amber-hud/20" : "border-border/60 bg-secondary/20 hover:border-amber-hud/50")}>
              <div className="flex items-center gap-2 mb-1">
                {m === "CONQUISTA" ? <Swords className="w-4 h-4 text-red-hud" /> : <MoonStar className="w-4 h-4 text-violet-hud" />}
                <span className="font-mono font-bold text-sm uppercase tracking-wider">{m === "CONQUISTA" ? "MODO CONQUISTA" : "GUERRAS SANTAS"}</span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                {m === "CONQUISTA"
                  ? "Recluta ejercitos, fortifica fronteras y anexiona provincias vecinas. Gana controlando 15 de 24 provincias del mundo."
                  : "Elige una fe, convierte provincias con misioneros y conquista en nombre de tu religion. Gana cuando 15 de 24 provincias profesen tu culto."}
              </p>
            </button>
          ))}
        </div>
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">Elige tu nacion</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {AON_NATION_DEFS.map((d, i) => (
            <button key={d.name} onClick={() => { sfx.hover(); setNationPick(i); }}
              className={cn("border p-3 text-left rounded-sm transition-colors", nationPick === i ? "border-amber-hud bg-amber-hud/15" : "border-border/60 bg-secondary/20 hover:border-amber-hud/40")}>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-sm border border-white/30" style={{ background: d.color }} />
                <span className="font-mono text-xs font-bold uppercase">{d.name}</span>
              </div>
              <div className="text-[9px] font-mono text-muted-foreground mb-1">{d.blurb}</div>
              <div className="text-[9px] font-mono flex items-center gap-1">
                {mode === "CRUZADA" && <span style={{ color: religionOf(d.religion).color }}>{religionOf(d.religion).sym}</span>}
                {TERRITORIES.filter((t) => d.provs.includes(t.id)).map((t) => t.name).join(" · ")}
              </div>
            </button>
          ))}
        </div>
        <Button onClick={start} className="w-full sm:w-auto font-mono font-bold uppercase tracking-widest bg-amber-hud/30 border border-amber-hud text-amber hover:bg-amber-hud/50">
          <Flag className="w-4 h-4 mr-2" /> COMENZAR LA HISTORIA
        </Button>
      </div>
    );
  }

  const s = state;
  const myN = s.nations[s.playerNation];
  const rel = religionOf(myN.religion);
  const selP = sel ? s.provs[sel] : null;
  const selT = sel ? TERRITORIES.find((t) => t.id === sel) : null;
  const share = religionShare(s);
  const alive = nationsAlive(s);
  const myProvinces = Object.entries(s.provs).filter(([, p]) => p.owner === s.playerNation).length;

  const ownerColor = (owner: number) => s.nations[owner]?.color ?? "#666";

  return (
    <div className="space-y-3">
      <PanelHeader
        title={s.mode === "CONQUISTA" ? "AGE OF NATIONS" : "GUERRAS SANTAS"}
        subtitle={`Turno ${s.turn} · ${myN.name} · ${myProvinces}/24 provincias`}
        icon={<Castle className="w-4 h-4" />} color="red"
        right={
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex items-center gap-1 text-amber"><Coins className="w-3.5 h-3.5" />{s.gold}</span>
            <span className="text-muted-foreground hidden sm:inline">+{provIncome(s, s.playerNation, s.tax)}/turno</span>
          </div>
        }
      />

      {/* HUD superior */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="hud-corner border bg-secondary/20 p-2 text-center">
          <div className="text-[8px] font-mono text-muted-foreground uppercase">ACCIONES</div>
          <div className="text-sm font-mono font-bold text-amber">{"◆".repeat(Math.max(0, s.actions)) || "—"}</div>
        </div>
        <div className="hud-corner border bg-secondary/20 p-2 text-center">
          <div className="text-[8px] font-mono text-muted-foreground uppercase">IMPUESTOS</div>
          <div className="flex gap-1 justify-center mt-0.5">
            {([1, 2, 3] as const).map((t) => (
              <button key={t} onClick={() => { sfx.hover(); persist({ ...s, tax: t }); }}
                className={cn("px-1.5 text-[9px] font-mono border rounded-sm", s.tax === t ? "border-amber-hud text-amber bg-amber-hud/20" : "border-border/50 text-muted-foreground")}>
                {t === 1 ? "BAJA" : t === 2 ? "MEDIA" : "ALTA"}
              </button>
            ))}
          </div>
        </div>
        <div className="hud-corner border bg-secondary/20 p-2 text-center">
          <div className="text-[8px] font-mono text-muted-foreground uppercase">{s.mode === "CONQUISTA" ? "DOMINIO" : "TU FE"}</div>
          <div className="text-sm font-mono font-bold text-green-hud">
            {s.mode === "CONQUISTA" ? `${Math.round((myProvinces / 24) * 100)}%` : `${share[myN.religion] ?? 0}/24`}
          </div>
        </div>
        <div className="hud-corner border bg-secondary/20 p-2 text-center">
          <div className="text-[8px] font-mono text-muted-foreground uppercase">NACIONES VIVAS</div>
          <div className="text-sm font-mono font-bold text-cyan-hud">{alive.length}</div>
        </div>
      </div>

      {/* MAPA 3D — el mundo real como tablero */}
      <div className="hud-corner border bg-background/60 p-2 relative">
        <AgeGlobe3D
          s={s}
          sel={sel}
          moving={moving}
          ownerColor={ownerColor}
          onProvClick={onProvClick}
        />
        {/* leyenda naciones */}
        <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1.5 pointer-events-none">
          {alive.map((n) => (
            <span
              key={n.id}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[8px] font-mono font-bold uppercase"
              style={{ background: "rgba(4,6,12,0.72)", color: n.id === s.playerNation ? "#fbbf24" : "#c8c8c8", border: `1px solid ${n.color}66` }}
            >
              <span className="w-2 h-2 rounded-sm" style={{ background: n.color }} />
              {n.name.slice(0, 16).toUpperCase()}
            </span>
          ))}
        </div>
        <AnimatePresence>
          {s.status !== "JUGANDO" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center gap-3 z-10">
              <Crown className={cn("w-10 h-10", s.status === "VICTORIA" ? "text-amber" : "text-red-hud")} />
              <div className={cn("font-mono text-xl font-bold tracking-widest", s.status === "VICTORIA" ? "text-amber" : "text-red-hud")}>
                {s.status === "VICTORIA" ? "VICTORIA HISTÓRICA" : "NACIÓN DERROTADA"}
              </div>
              <div className="text-[11px] font-mono text-muted-foreground text-center max-w-sm">
                {s.log[0]} · {s.turn} turnos · {myProvinces} provincias · {s.mode === "CRUZADA" ? `${share[myN.religion] ?? 0} fieles` : ""}
              </div>
              <Button onClick={() => { clearAoN(); setRewarded(false); setState(null); setSel(null); }}
                className="font-mono uppercase tracking-widest bg-amber-hud/30 border border-amber-hud text-amber">
                <RotateCcw className="w-4 h-4 mr-2" /> NUEVA ERA
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PANEL DE ACCION + LOG */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-2 items-start">
        <div className="hud-corner border bg-secondary/20 p-3">
          {!selP || !selT ? (
            <div className="text-[11px] font-mono text-muted-foreground py-2">
              Toca una provincia del globo para ver detalles · tus provincias brillan en ámbar
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm border border-white/30" style={{ background: ownerColor(selP.owner) }} />
                  <span className="font-mono text-sm font-bold">{selT.name}</span>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">{s.nations[selP.owner]?.name}</span>
                </div>
                <div className="flex gap-2 text-[10px] font-mono">
                  <span className="text-amber">{selP.troops} tropas</span>
                  <span className="text-cyan-hud">pop {selP.pop}</span>
                  <span className="text-muted-foreground">fort {"▲".repeat(selP.fort) || "—"}</span>
                  {s.mode === "CRUZADA" && <span style={{ color: religionOf(selP.religion).color }}>{religionOf(selP.religion).sym} {religionOf(selP.religion).name}</span>}
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {selP.owner === s.playerNation ? (
                  <>
                    {actionBtn("RECLUTAR +5 (30)", <Shield className="w-3 h-3" />, () => {
                      const r = recruit(s, sel!);
                      r.ok ? toast.success(r.msg) : toast.error(r.msg); sfx.beep(); persist(s);
                    }, s.gold < AON_COSTS.reclutar)}
                    {actionBtn("FORTIFICAR (45)", <Landmark className="w-3 h-3" />, () => {
                      const r = buildFort(s, sel!);
                      r.ok ? toast.success(r.msg) : toast.error(r.msg); sfx.beep(); persist(s);
                    }, s.gold < AON_COSTS.fort)}
                    {s.mode === "CRUZADA" && selP.religion !== myN.religion &&
                      actionBtn("MISIONERO (60)", <MoonStar className="w-3 h-3" />, () => {
                        const r = sendMissionary(s, sel!);
                        r.ok ? toast.success(r.msg) : toast.error(r.msg); sfx.beep(); persist(s);
                      }, s.gold < AON_COSTS.misionero)}
                    {actionBtn(moving === sel ? "CANCELAR MOVIMIENTO" : "MOVER MITAD", <ChevronRight className="w-3 h-3" />, () => {
                      setMoving(moving === sel ? null : sel); sfx.hover();
                    }, selP.troops < 2, moving === sel ? "bg-cyan-hud/30 border-cyan-hud text-cyan-hud" : undefined)}
                    {moving && moving !== sel && (
                      <span className="text-[10px] font-mono text-cyan-hud self-center">→ toca provincia propia adyacente</span>
                    )}
                  </>
                ) : (
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {selT.adj.some((a) => s.provs[a]?.owner === s.playerNation)
                      ? "Selecciona una provincia tuya vecina y luego ATACAR aqui"
                      : "Provincia no fronteriza con tu imperio"}
                  </div>
                )}
              </div>
              {/* atacar: provincia propia seleccionada + vecino enemigo */}
              {selP.owner === s.playerNation && selT.adj.some((a) => s.provs[a] && s.provs[a].owner !== s.playerNation) && (
                <div className="border-t border-border/40 pt-2">
                  <div className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Fronteras hostiles · toca para atacar (1 accion)</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {selT.adj.filter((a) => s.provs[a] && s.provs[a].owner !== s.playerNation).map((a) => {
                      const ap = s.provs[a]; const at = TERRITORIES.find((x) => x.id === a)!;
                      return (
                        <button key={a} onClick={() => doAttack(a)} disabled={s.actions < 1 || selP.troops < 2}
                          className={cn("px-2 py-1 border rounded-sm text-[10px] font-mono transition-colors", s.actions < 1 || selP.troops < 2 ? "border-border/40 text-muted-foreground/50" : "border-red-hud/60 text-red-hud hover:bg-red-hud/20")}>
                          ⚔ {at.name} ({ap.troops})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end mt-2">
            <Button onClick={() => { const s2 = stateRef.current!; endTurn(s2); sfx.tab(); persist(s2);
                if (s2.status !== "JUGANDO") applyRewards(s2); else toast.info(`Turno ${s2.turn} · +${provIncome(s2, s2.playerNation, s2.tax)} oro`);
              }}
              className="font-mono font-bold uppercase tracking-widest bg-amber-hud/30 border border-amber-hud text-amber hover:bg-amber-hud/50">
              ENDER TURNO {s.turn} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
        <div className="hud-corner border bg-secondary/20 p-2 max-h-64 overflow-y-auto thin-scroll">
          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1"><ScrollText className="w-3 h-3" /> CRONICA MUNDIAL</div>
          {s.log.map((l, i) => (
            <div key={i} className={cn("text-[10px] font-mono py-0.5 border-b border-border/20", l.includes("CAPTURASTE") || l.includes("LA FE") || l.includes("DOMINACION") ? "text-amber" : l.includes("PERDISTE") ? "text-red-hud" : "text-muted-foreground")}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====== GLOBO 3D DE AGE OF NATIONS (v14): sustituye al tablero SVG plano ======
const AON_TERRITORY_NAMES: Record<string, string> = Object.fromEntries(
  TERRITORIES.map((t) => [t.id, t.name])
);

function AgeGlobe3D({
  s, sel, moving, ownerColor, onProvClick,
}: {
  s: AoNState;
  sel: string | null;
  moving: string | null;
  ownerColor: (owner: number) => string;
  onProvClick: (tid: string) => void;
}) {
  const territoryColors = useMemo(() => {
    const m: Record<string, string> = {};
    for (const t of TERRITORIES) {
      const p = s.provs[t.id];
      if (!p) continue;
      const isMine = p.owner === s.playerNation;
      // aclara las provincias propias para diferenciarlas del resto
      m[t.id] = isMine ? ownerColor(p.owner) : ownerColor(p.owner);
    }
    return m;
  }, [s.provs, s.playerNation, ownerColor]);

  const markers = useMemo(() => {
    const arr: Globe3DMarker[] = [];
    for (const t of TERRITORIES) {
      const p = s.provs[t.id];
      if (!p) continue;
      const isMine = p.owner === s.playerNation;
      const isSel = sel === t.id;
      const isMoveSrc = moving === t.id;
      const rel = s.mode === "CRUZADA" ? religionOf(p.religion) : null;
      arr.push({
        id: t.id,
        lat: t.lat,
        lng: t.lng,
        color: isMine ? "#fbbf24" : "#e5e5e5",
        size: 0.26 + Math.min(p.troops, 20) * 0.012,
        alt: 0.015,
        ring: isSel || isMoveSrc || isMine,
        ringMax: isMoveSrc ? 5 : 3.2,
        label: `${t.name} — ${p.troops} tropas${rel ? ` · ${rel.sym}` : ""}${p.fort > 0 ? ` · fort ${p.fort}` : ""}`,
        labelTag: isMine ? "TU PROVINCIA" : undefined,
        onClick: () => onProvClick(t.id),
      });
    }
    return arr;
  }, [s, sel, moving, onProvClick]);

  return (
    <GlobeMap3D
      territoryColors={territoryColors}
      territoryNames={AON_TERRITORY_NAMES}
      highlightTerritory={sel}
      onTerritoryClick={(tid) => {
        if (tid) onProvClick(tid);
      }}
      markers={markers}
      height="min(56vh, 540px)"
      minHeight={300}
      autoRotate={false}
      pov={{ lat: 24, lng: 12, altitude: 2.05 }}
      ariaLabel="Globo 3D de Age of Nations: provincias coloreadas por nación"
    />
  );
}
