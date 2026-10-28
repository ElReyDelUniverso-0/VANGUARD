"use client";

// Vanguard v195.0 TU LADO — ¿DE QUÉ LADO ESTÁS?
// La sala de bandos: cada problema del mundo se parte en DOS lados.
//  ① Declaras tu lado (+5 monedas, +5 XP) y el pueblo se parte en % vivo.
//  ② Puedes APOSTAR monedas POR tu bando: la cuota se fija al apostar y
//     paga más si tu bando es minoritario (margen de la casa 0.95).
//  ③ Al cierre del ciclo, EL MUNDO DECIDE — se suele ir con la mayoría
//     pero NO siempre. Si acertaste, cobras monto × cuota.
//
// Leyes: cero bytes de red · navegación solo por vanguard:navigate (v190) ·
// jamás parece carga (v177-v189) · el juego es con monedas virtuales.

import { useEffect, useMemo, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Scale, Coins, TrendingUp, Users, Hourglass, Check, Flame, Dice5, Trophy, Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/lib/game-store";
import {
  LADOS, LADOS_CATEGORIAS, cicloDe, cierraEn, repartoA, cuotaDe, ganadorDelMundo,
  type LadoProblema,
} from "@/lib/lados-data";
import { navigateTo } from "@/lib/nav";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";

const MONTOS = [25, 50, 100, 250];

function fmtCierre(ms: number): string {
  const h = Math.floor(ms / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

export function LadosPanel() {
  const ladoVotos = useGameStore((s) => s.ladoVotos);
  const ladosApuestas = useGameStore((s) => s.ladosApuestas);
  const votarLado = useGameStore((s) => s.votarLado);
  const apostarLado = useGameStore((s) => s.apostarLado);
  const resolverLado = useGameStore((s) => s.resolverLado);
  const coins = useGameStore((s) => s.coins);

  const [filter, setFilter] = useState<string>("TODAS");
  const [monto, setMonto] = useState<Record<string, number>>({});
  const [tick, setTick] = useState(0);

  // latido honesto: el % del pueblo se mueve cada 30s mientras la sala está abierta
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const ahora = useMemo(() => Date.now(), [tick]);
  const filtrados = filter === "TODAS" ? LADOS : LADOS.filter((p) => p.categoria === filter);

  const stats = useMemo(() => {
    const respondidas = LADOS.filter((p) => ladoVotos[p.id] !== undefined).length;
    const apostadas = Object.values(ladosApuestas).filter((a) => !a.resuelto).length;
    const ganadas = Object.values(ladosApuestas).filter((a) => a.resuelto && a.gano).length;
    return { respondidas, apostadas, ganadas };
  }, [ladoVotos, ladosApuestas]);

  const votar = (p: LadoProblema, lado: "A" | "B") => {
    sfx.click();
    if (votarLado(p.id, lado)) {
      toast.success(`Tu bando está declarado: ${lado === "A" ? p.ladoA : p.ladoB} (+5 monedas)`);
    }
  };

  const apostar = (p: LadoProblema, lado: "A" | "B") => {
    const ciclo = cicloDe(p, ahora);
    const cuota = cuotaDe(p, lado, ciclo, ahora);
    const cant = monto[p.id] ?? 50;
    sfx.coin();
    if (apostarLado(p.id, lado, cant, cuota)) {
      toast.success(`Apuesta colocada: ${cant} mon a ${cuota.toFixed(2)} por ${lado === "A" ? p.ladoA : p.ladoB}`);
    } else {
      toast.error("No se pudo apostar: revisa tus monedas (mínimo 10).");
    }
  };

  const resolver = (p: LadoProblema) => {
    const ciclo = cicloDe(p, ahora);
    const ganador = ganadorDelMundo(p, ciclo, cierraEn(p, ciclo));
    const res = resolverLado(p.id, ganador);
    if (res) {
      sfx.click();
      if (res.gano) {
        sfx.success();
        toast.success(`EL MUNDO DECIDIÓ A TU FAVOR: +${res.pago.toLocaleString("es")} monedas`);
      } else {
        toast(`El mundo decidió lo contrario. Tu bando cayó — la próxima cuota te sonríe.`);
      }
      setTick((x) => x + 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20" data-vg195-lados="raiz">
      <PanelHeader
        title="¿DE QUÉ LADO ESTÁS?"
        subtitle="Declara tu bando en los problemas del mundo y apuesta por él — al cierre, el mundo decide"
        icon={<Scale className="w-4 h-4" />}
        color="red"
        right={
          <Button
            onClick={() => navigateTo("apuestas")}
            variant="outline"
            className="font-mono text-[10px] uppercase tracking-widest border-amber-hud/50 text-amber hover:bg-amber-hud/15"
          >
            <Dice5 className="w-3.5 h-3.5 mr-1" /> Apuestas de guerra
          </Button>
        }
      />

      {/* BARRA DE ESTADO */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="hud-corner p-2 bg-secondary/40 text-center">
          <div className="text-[9px] font-mono uppercase text-muted-foreground">Bandos declarados</div>
          <div className="text-sm font-mono font-bold text-foreground">{stats.respondidas}/{LADOS.length}</div>
        </div>
        <div className="hud-corner p-2 bg-secondary/40 text-center">
          <div className="text-[9px] font-mono uppercase text-muted-foreground">Apuestas vivas</div>
          <div className="text-sm font-mono font-bold text-amber flex items-center justify-center gap-1">
            <Flame className="w-3 h-3" /> {stats.apostadas}
          </div>
        </div>
        <div className="hud-corner p-2 bg-secondary/40 text-center">
          <div className="text-[9px] font-mono uppercase text-muted-foreground">Ganadas</div>
          <div className="text-sm font-mono font-bold text-green-hud flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3" /> {stats.ganadas}
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-1.5 mb-3 flex-wrap" role="tablist" aria-label="Categorías de problemas">
        {LADOS_CATEGORIAS.map((c) => (
          <button
            key={c}
            onClick={() => { sfx.tab(); setFilter(c); }}
            className={cn(
              "px-2.5 py-1 rounded-sm border font-mono text-[9px] uppercase tracking-widest transition-colors",
              filter === c ? "border-red-hud bg-red-hud/20 text-red-200" : "border-border/60 text-muted-foreground hover:text-foreground"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* PROBLEMAS */}
      <div className="space-y-3">
        {filtrados.map((p) => {
          const ciclo = cicloDe(p, ahora);
          const cierre = cierraEn(p, ciclo);
          const restante = cierre - ahora;
          const pctA = repartoA(p, ciclo, ahora);
          const miVoto = ladoVotos[p.id];
          const ap = ladosApuestas[p.id];
          const ganador = restante <= 0 ? ganadorDelMundo(p, ciclo, cierre) : null;
          const montoActual = monto[p.id] ?? 50;

          return (
            <motion.div
              key={`${p.id}:${ciclo}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="hud-corner border border-border/60 bg-secondary/30 p-3"
              data-vg195-problema={p.id}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-display text-sm font-bold tracking-wide text-foreground leading-snug">
                  {p.pregunta}
                </h3>
                <span className={cn(
                  "shrink-0 text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 border rounded-sm",
                  restante <= 0 ? "border-amber-hud/60 text-amber" : "border-border/60 text-muted-foreground"
                )}>
                  {restante <= 0 ? "EL MUNDO DECIDE" : fmtCierre(restante)}
                </span>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground leading-relaxed mb-2">{p.contexto}</p>

              {/* REPARTO EN VIVO */}
              <div className="relative h-6 rounded-sm overflow-hidden border border-border/50 bg-black/40 mb-1" aria-label={`Reparto: ${pctA}% lado A`}>
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700"
                  style={{ width: `${pctA}%`, background: `linear-gradient(90deg, ${p.colorA}55, ${p.colorA}88)` }}
                />
                <div
                  className="absolute inset-y-0 right-0 transition-all duration-700"
                  style={{ width: `${100 - pctA}%`, background: `linear-gradient(90deg, ${p.colorB}88, ${p.colorB}55)` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-2 font-mono text-[9px] font-bold" style={{ color: "#fff" }}>
                  <span style={{ textShadow: "0 1px 2px #000" }}>{pctA}%</span>
                  <span style={{ textShadow: "0 1px 2px #000" }}>{100 - pctA}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground mb-2">
                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> el pueblo se parte</span>
                <span className="inline-flex items-center gap-1"><Hourglass className="w-3 h-3" /> ciclo de {p.horas}h</span>
              </div>

              {/* LOS DOS LADOS */}
              <div className="grid grid-cols-2 gap-2">
                {(["A", "B"] as const).map((lado) => {
                  const esA = lado === "A";
                  const color = esA ? p.colorA : p.colorB;
                  const cuota = cuotaDe(p, lado, ciclo, ahora);
                  const esMiBando = miVoto === lado;
                  const apuestaAqui = ap && ap.lado === lado;
                  return (
                    <div
                      key={lado}
                      className={cn(
                        "rounded-sm border p-2 transition-colors",
                        esMiBando ? "bg-black/50" : "border-border/50 bg-black/20"
                      )}
                      style={esMiBando ? { borderColor: color } : undefined}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-display text-[11px] font-bold tracking-wide truncate" style={{ color }}>
                          {esA ? p.ladoA : p.ladoB}
                        </span>
                        <span className="shrink-0 text-[9px] font-mono" style={{ color }}>
                          x{cuota.toFixed(2)}
                        </span>
                      </div>

                      {!miVoto && restante > 0 && (
                        <Button
                          onClick={() => votar(p, lado)}
                          className="w-full h-7 font-mono text-[9px] uppercase tracking-widest bg-black/40 border hover:bg-black/60"
                          style={{ borderColor: `${color}88`, color }}
                        >
                          ESTE ES MI LADO
                        </Button>
                      )}

                      {esMiBando && (
                        <div className="text-[9px] font-mono uppercase tracking-widest flex items-center gap-1" style={{ color }}>
                          <Check className="w-3 h-3" /> tu bando
                        </div>
                      )}

                      {/* APOSTAR (solo por tu bando, una vez por ciclo) */}
                      {esMiBando && restante > 0 && !ap && (
                        <div className="mt-2 space-y-1.5">
                          <div className="grid grid-cols-4 gap-1">
                            {MONTOS.map((m) => (
                              <button
                                key={m}
                                onClick={() => { sfx.click(); setMonto((s) => ({ ...s, [p.id]: m })); }}
                                className={cn(
                                  "py-0.5 rounded-sm border font-mono text-[9px] transition-colors",
                                  montoActual === m ? "border-amber-hud text-amber bg-amber-hud/15" : "border-border/50 text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                          <Input
                            value={String(montoActual)}
                            onChange={(e) => {
                              const v = parseInt(e.target.value.replace(/\D/g, ""), 10);
                              setMonto((s) => ({ ...s, [p.id]: Number.isFinite(v) ? v : 0 }));
                            }}
                            inputMode="numeric"
                            className="h-7 font-mono text-[11px] bg-secondary/60 border-border"
                            aria-label="Monto de la apuesta en monedas"
                          />
                          <Button
                            onClick={() => apostar(p, lado)}
                            disabled={montoActual < 10 || montoActual > coins}
                            className="w-full h-7 font-mono text-[9px] uppercase tracking-widest bg-amber-hud/30 border border-amber-hud text-amber hover:bg-amber-hud/50"
                          >
                            <Coins className="w-3 h-3 mr-1" /> Apostar {montoActual} mon
                          </Button>
                        </div>
                      )}

                      {apuestaAqui && ap && !ap.resuelto && (
                        <div className="mt-2 text-[9px] font-mono text-amber leading-relaxed">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          {ap.monto} mon a x{ap.cuota.toFixed(2)} — cobras {Math.round(ap.monto * ap.cuota).toLocaleString("es")} si el mundo decide contigo
                        </div>
                      )}

                      {ap && ap.resuelto && (
                        <div className={cn("mt-2 text-[9px] font-mono leading-relaxed", ap.gano ? "text-green-hud" : "text-red-hud")}>
                          {ap.gano ? `Ganaste +${ap.pago?.toLocaleString("es")} mon` : `Perdiste ${ap.monto} mon`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* VEREDICTO */}
              {restante <= 0 && (
                <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-amber">
                    Veredicto: ganó <b>{ganador === "A" ? p.ladoA : p.ladoB}</b>
                  </span>
                  {ap && !ap.resuelto && (
                    <Button
                      onClick={() => resolver(p)}
                      className="h-7 font-mono text-[9px] uppercase tracking-widest bg-green-hud/25 border border-green-hud text-green-200 hover:bg-green-hud/40"
                    >
                      <Zap className="w-3 h-3 mr-1" /> Cobrar veredicto
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 text-[9px] font-mono text-muted-foreground/70 leading-relaxed border-t border-border/40 pt-2">
        El veredicto del mundo se suele ir con la mayoría pero NO siempre: apostar al bando minoritario paga más.
        Todo se juega con monedas virtuales de Vanguard — la casa juega limpio y la cuota se fija al apostar.
      </div>
    </div>
  );
}
