"use client";

// v82.0 TODO EL MUNDO — BANCO CENTRAL DE VANGUARD (tab hacienda).
// La economía del guerrero, por fin con Techo:
//  1) SUELDO DE OPERATIVO — ingreso pasivo que acumula en vivo (1ⓒ/min base,
//     multiplicado por tu nivel, tope de 8 h). Cobra cuando quieras.
//  2) DEPÓSITO A PLAZO — 3 cámaras de bóveda (30 min +9% · 3 h +16% · 12 h +30%).
//     Un depósito activo por cámara; cobras capital + interés al vencer.
//  3) TESORERÍA — flujo real de tus últimas 50 operaciones del registro
//     (ingresos, gastos, neto y de dónde vino cada moneda).
//  4) BONIFICACIÓN DE INFORMACIÓN — el Ojo paga por tus informes: certifica
//     cada 10 minutos y cobra entre 20-40ⓒ.
// Persistencia: localStorage vanguard-hacienda-v82. Perf: 1 tick/s puro estado.

import { useEffect, useMemo, useState } from "react";
import {
  Landmark, Wallet, Hourglass, TrendingUp, TrendingDown, FileCheck2, Coins, Clock3, Vault,
} from "lucide-react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { useGameStore } from "@/lib/game-store";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HeroOro } from "@/components/vanguard/hero-oro";

// ————— persistencia —————
const HACIENDA_KEY = "vanguard-hacienda-v82";
interface HaciendaEstado {
  lastSueldo: number;            // ts del último cobro de sueldo
  ultimoCertificado: number;     // ts del último informe certificado
  depositos: Record<string, { monto: number; inicio: number } | null>; // por plan
}
function cargarHacienda(): HaciendaEstado {
  const base: HaciendaEstado = { lastSueldo: Date.now(), ultimoCertificado: 0, depositos: { v30: null, v180: null, v720: null } };
  try {
    const raw = JSON.parse(localStorage.getItem(HACIENDA_KEY) || "") as Partial<HaciendaEstado>;
    return {
      lastSueldo: typeof raw.lastSueldo === "number" ? raw.lastSueldo : Date.now(),
      ultimoCertificado: typeof raw.ultimoCertificado === "number" ? raw.ultimoCertificado : 0,
      depositos: { ...base.depositos, ...(raw.depositos ?? {}) },
    };
  } catch {
    return base;
  }
}
function guardarHacienda(e: HaciendaEstado) {
  try { localStorage.setItem(HACIENDA_KEY, JSON.stringify(e)); } catch { /* noop */ }
}

// ————— planes de bóveda —————
const PLANES = [
  { id: "v30", nombre: "BÓVEDA 30 MIN", minutos: 30, interes: 0.09, nota: "Golpe rápido — ideal entre operaciones" },
  { id: "v180", nombre: "BÓVEDA 3 HORAS", minutos: 180, interes: 0.16, nota: "El equilibrio del especulador" },
  { id: "v720", nombre: "BÓVEDA 12 HORAS", minutos: 720, interes: 0.30, nota: "Para quien duerme lejos del radar" },
] as const;

const MIN_DEPOSITO = 200;
const MAX_DEPOSITO = 5000;
const COOLDOWN_CERTIFICADO = 10 * 60_000;

export function HaciendaPanel() {
  const coins = useGameStore((s) => s.coins);
  const gems = useGameStore((s) => s.gems);
  const level = useGameStore((s) => s.level);
  const addCoins = useGameStore((s) => s.addCoins);
  const spendCoins = useGameStore((s) => s.spendCoins);
  const log = useGameStore((s) => s.log);

  const [estado, setEstado] = useState<HaciendaEstado>(() =>
    typeof window === "undefined" ? { lastSueldo: Date.now(), ultimoCertificado: 0, depositos: {} } : cargarHacienda()
  );
  const [ahora, setAhora] = useState(() => Date.now());
  const [monto, setMonto] = useState(500);
  const [flota, setFlota] = useState<{ id: number; texto: string } | null>(null);

  useEffect(() => {
    const t = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // ————— 1) SUELDO: tasa por nivel, tope 8 h —————
  const tasaMin = 1 + level * 0.12; // ⓒ por minuto
  const TOPE_MS = 8 * 3600_000;
  const acumulado = Math.min(TOPE_MS, ahora - estado.lastSueldo);
  const sueldoPendiente = Math.floor((acumulado / 60_000) * tasaMin);
  const topeAlcanzado = acumulado >= TOPE_MS;

  const cobrarSueldo = () => {
    if (sueldoPendiente < 1) return;
    addCoins(sueldoPendiente, "SUELDO DE OPERATIVO — Banco Central");
    sfx.reward();
    setFlota({ id: Date.now(), texto: `+${sueldoPendiente}ⓒ sueldo` });
    const e = { ...estado, lastSueldo: Date.now() };
    setEstado(e); guardarHacienda(e);
    toast.success(`Sueldo cobrado: +${sueldoPendiente}ⓒ`, { description: `Tasa: ${tasaMin.toFixed(2)}ⓒ/min · nivel ${level}` });
  };

  // ————— 2) DEPÓSITOS —————
  const depositar = (planId: string) => {
    const m = Math.max(MIN_DEPOSITO, Math.min(MAX_DEPOSITO, Math.floor(monto) || 0));
    if (estado.depositos[planId]) return;
    if (!spendCoins(m, `Depósito a plazo ${planId} — Banco Central`)) {
      toast.error(`Necesitas ${m}ⓒ para entrar en la bóveda`);
      sfx.error();
      return;
    }
    const e: HaciendaEstado = { ...estado, depositos: { ...estado.depositos, [planId]: { monto: m, inicio: Date.now() } } };
    setEstado(e); guardarHacienda(e); sfx.coin();
    toast.success(`${m}ⓒ guardados en la bóveda`, { description: "El Banco Central custodia tu dinero" });
  };

  const cobrarDeposito = (planId: string) => {
    const d = estado.depositos[planId];
    if (!d) return;
    const plan = PLANES.find((p) => p.id === planId)!;
    const maduro = ahora - d.inicio >= plan.minutos * 60_000;
    if (!maduro) {
      toast("La bóveda sigue sellada — espera al vencimiento");
      return;
    }
    const interes = Math.round(d.monto * plan.interes);
    addCoins(d.monto + interes, `Bóveda ${plan.minutos}min vencida (+${interes} interés)`);
    sfx.reward();
    setFlota({ id: Date.now(), texto: `+${interes}ⓒ interés` });
    const e: HaciendaEstado = { ...estado, depositos: { ...estado.depositos, [planId]: null } };
    setEstado(e); guardarHacienda(e);
    toast.success(`Bóveda abierta: +${d.monto + interes}ⓒ`, { description: `Capital ${d.monto}ⓒ + interés ${interes}ⓒ (${Math.round(plan.interes * 100)}%)` });
  };

  // ————— 3) TESORERÍA: flujo del registro —————
  const tesoreria = useMemo(() => {
    let ingresos = 0, gastos = 0;
    const fuentes: Record<string, number> = {};
    for (const l of log) {
      // solo movimientos de MONEDAS (los de gemas también llevan delta pero dicen "gemas")
      if (typeof l.delta !== "number" || l.delta === 0 || l.msg.includes("gemas")) continue;
      const fuente = l.msg.split("—")[1]?.trim().slice(0, 26) || "recompensa";
      if (l.delta > 0) {
        ingresos += l.delta;
        fuentes[fuente] = (fuentes[fuente] ?? 0) + l.delta;
      } else {
        gastos += -l.delta;
      }
    }
    const top = Object.entries(fuentes).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { ingresos, gastos, neto: ingresos - gastos, top };
  }, [log]);

  // ————— 4) BONIFICACIÓN DE INFORMACIÓN —————
  const listoCertificado = ahora - estado.ultimoCertificado >= COOLDOWN_CERTIFICADO;
  const certificarInforme = () => {
    if (!listoCertificado) return;
    const pago = 20 + Math.floor(Math.random() * 21); // 20-40ⓒ
    addCoins(pago, "Informe certificado ante el Ojo — Banco Central");
    sfx.reward();
    setFlota({ id: Date.now(), texto: `+${pago}ⓒ informe` });
    const e = { ...estado, ultimoCertificado: Date.now() };
    setEstado(e); guardarHacienda(e);
    toast.success(`Informe certificado: +${pago}ⓒ`, { description: "El Ojo de Dios paga por buena información" });
  };
  const cdCert = Math.max(0, COOLDOWN_CERTIFICADO - (ahora - estado.ultimoCertificado));

  const fmt = (n: number) => n.toLocaleString("es");

  return (
    <div className="space-y-3">
      <HeroOro panel="hacienda" />
      <PanelHeader
        title="Banco Central de Vanguard"
        subtitle="Tu dinero ahora trabaja: sueldo operativo, bóvedas con interés y tesorería de verdad"
        icon={<Landmark className="w-4 h-4 text-amber" />}
        color="amber"
        right={
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-amber border border-amber-hud/50 bg-amber-hud/10 px-2 py-1">
            <Wallet className="w-3.5 h-3.5" /> {fmt(coins)}ⓒ <span className="text-violet-hud">· {fmt(gems)}💎</span>
          </span>
        }
      />

      {/* SUELDO + CERTIFICADO */}
      <div className="grid lg:grid-cols-2 gap-3">
        <section className="hud-panel p-3.5 border-amber-hud/40 relative overflow-hidden">
          {flota && (
            <span key={flota.id} className="moneda-flota absolute right-4 top-3 font-mono text-sm font-bold text-amber pointer-events-none z-10">
              {flota.texto}
            </span>
          )}
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber" aria-hidden />
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-amber">Sueldo de operativo</h3>
            <span className="ml-auto font-mono text-[9px] text-muted-foreground uppercase tracking-widest">{tasaMin.toFixed(2)}ⓒ/min · nivel {level}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
            El Banco Central paga por estar en servicio. Acumula hasta 8 horas — vuelve cuando quieras y cobra.
            {topeAlcanzado && <b className="text-crisis"> Tope alcanzado: ¡cobra ya!</b>}
          </p>
          <div className="mt-2.5 flex items-end justify-between gap-2">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">acumulado {topeAlcanzado ? "(tope 8h)" : ""}</p>
              <p className="font-display text-3xl font-bold text-amber tabular-nums leading-none mt-0.5">+{fmt(sueldoPendiente)}ⓒ</p>
            </div>
            <button onClick={cobrarSueldo} disabled={sueldoPendiente < 1}
              className="px-5 py-2.5 min-h-[48px] bg-gradient-to-b from-amber-hud/50 to-amber-hud/20 border border-amber-hud text-amber rounded-sm text-[11px] font-mono uppercase font-bold tracking-widest hover:brightness-125 disabled:opacity-40 transition-all active:scale-95">
              cobrar sueldo
            </button>
          </div>
          <div className="mt-2 h-1 bg-secondary overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-hud/60 to-amber transition-[width] duration-1000"
              style={{ width: `${Math.min(100, (acumulado / TOPE_MS) * 100)}%` }} />
          </div>
        </section>

        <section className="hud-panel p-3.5 border-cyan-hud/40">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-cyan-hud" aria-hidden />
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-cyan-hud">Bonificación de información</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
            La información es dinero: certifica un informe ante el Ojo de Dios cada 10 minutos y el Banco Central lo paga entre 20 y 40ⓒ.
          </p>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] text-muted-foreground">
              {listoCertificado ? "el Ojo espera tu informe" : (
                <span className="inline-flex items-center gap-1"><Clock3 className="w-3 h-3" /> próximo pago en {Math.ceil(cdCert / 60_000)} min</span>
              )}
            </p>
            <button onClick={certificarInforme} disabled={!listoCertificado}
              className="px-4 py-2.5 min-h-[48px] bg-cyan-hud/15 border border-cyan-hud text-cyan-hud rounded-sm text-[11px] font-mono uppercase font-bold tracking-widest hover:bg-cyan-hud/30 disabled:opacity-40 transition-all active:scale-95">
              certificar informe
            </button>
          </div>
        </section>
      </div>

      {/* BÓVEDAS */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Vault className="w-4 h-4 text-amber" aria-hidden />
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-amber">Depósito a plazo — bóvedas del Banco</h3>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">monto {MIN_DEPOSITO}-{fmt(MAX_DEPOSITO)}ⓒ</span>
            <input type="number" min={MIN_DEPOSITO} max={MAX_DEPOSITO} value={monto}
              onChange={(e) => setMonto(parseInt(e.target.value, 10) || MIN_DEPOSITO)}
              className="w-24 bg-secondary border border-amber-hud/30 rounded-sm px-2 py-1.5 text-[11px] font-mono tabular-nums" aria-label="monto del depósito" />
            {[500, 1000, 2500].map((v) => (
              <button key={v} onClick={() => setMonto(v)} className="px-1.5 py-1 text-[9px] font-mono border border-amber-hud/30 text-amber rounded-sm hover:bg-amber-hud/20">
                {v}
              </button>
            ))}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {PLANES.map((p) => {
            const d = estado.depositos[p.id];
            const totalMs = p.minutos * 60_000;
            const restante = d ? Math.max(0, totalMs - (ahora - d.inicio)) : 0;
            const maduro = !!d && restante === 0;
            const progreso = d ? Math.min(100, ((ahora - d.inicio) / totalMs) * 100) : 0;
            const ganancia = Math.round((d?.monto ?? monto) * p.interes);
            return (
              <div key={p.id} className={cn("hud-panel p-3 relative overflow-hidden transition-colors", maduro && "border-green-hud shadow-[0_0_18px_rgba(0,255,135,0.12)]")}>
                <div className="flex items-center justify-between">
                  <h4 className="font-mono text-[10px] uppercase tracking-widest text-foreground">{p.nombre}</h4>
                  <span className="font-mono text-[10px] font-bold text-green-hud">+{Math.round(p.interes * 100)}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.nota}</p>
                {d ? (
                  <>
                    <p className="font-display text-xl font-bold text-amber tabular-nums mt-2">{fmt(d.monto)}ⓒ <span className="text-[11px] text-muted-foreground font-mono">→ {fmt(d.monto + ganancia)}ⓒ</span></p>
                    <div className="mt-1.5 h-1 bg-secondary overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-hud/50 to-green-hud transition-[width] duration-1000" style={{ width: `${progreso}%` }} />
                    </div>
                    <button onClick={() => cobrarDeposito(p.id)}
                      className={cn("mt-2 w-full px-3 py-2 min-h-[44px] rounded-sm border text-[10px] font-mono uppercase font-bold tracking-widest transition-all active:scale-[0.98]",
                        maduro ? "bg-green-hud/25 border-green-hud text-green-hud hover:bg-green-hud/40" : "bg-secondary/60 border-border text-muted-foreground cursor-not-allowed")}>
                      {maduro ? "abrir bóveda — cobrar" : `sellada · ${Math.floor(restante / 60000)} min restantes`}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="font-display text-xl font-bold text-muted-foreground/70 tabular-nums mt-2">
                      +{fmt(ganancia)}ⓒ <span className="text-[11px] font-mono">de interés</span>
                    </p>
                    <button onClick={() => depositar(p.id)}
                      className="mt-2 w-full px-3 py-2 min-h-[44px] bg-amber-hud/20 border border-amber-hud text-amber rounded-sm text-[10px] font-mono uppercase font-bold tracking-widest hover:bg-amber-hud/40 transition-all active:scale-[0.98]">
                      depositar {fmt(Math.min(MAX_DEPOSITO, Math.max(MIN_DEPOSITO, monto)))}ⓒ
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* TESORERÍA */}
      <section className="hud-panel p-3.5">
        <div className="flex items-center gap-2">
          <Hourglass className="w-4 h-4 text-cyan-hud" aria-hidden />
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-cyan-hud">Tesorería — tus últimas {log.length} operaciones</h3>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2.5">
          <div className="rounded-sm border border-green-hud/30 bg-green-hud/5 p-2.5">
            <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-hud" /> ingresos</p>
            <p className="font-display text-lg font-bold text-green-hud tabular-nums">+{fmt(tesoreria.ingresos)}ⓒ</p>
          </div>
          <div className="rounded-sm border border-crisis-hud/30 bg-crisis-hud/5 p-2.5">
            <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground flex items-center gap-1"><TrendingDown className="w-3 h-3 text-crisis" /> gastos</p>
            <p className="font-display text-lg font-bold text-crisis tabular-nums">-{fmt(tesoreria.gastos)}ⓒ</p>
          </div>
          <div className="rounded-sm border border-amber-hud/30 bg-amber-hud/5 p-2.5">
            <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">neto</p>
            <p className={cn("font-display text-lg font-bold tabular-nums", tesoreria.neto >= 0 ? "text-amber" : "text-crisis")}>
              {tesoreria.neto >= 0 ? "+" : ""}{fmt(tesoreria.neto)}ⓒ
            </p>
          </div>
        </div>
        {tesoreria.top.length > 0 && (
          <div className="mt-2.5 space-y-1">
            <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">de dónde vino tu dinero</p>
            {tesoreria.top.map(([fuente, cant]) => (
              <div key={fuente} className="flex items-center gap-2">
                <span className="text-[10px] text-foreground/85 truncate flex-1">{fuente}</span>
                <div className="h-1 bg-secondary w-40 overflow-hidden rounded-full">
                  <div className="h-full bg-amber-hud/70" style={{ width: `${Math.max(8, (cant / (tesoreria.top[0]?.[1] || 1)) * 100)}%` }} />
                </div>
                <span className="font-mono text-[10px] text-amber tabular-nums w-16 text-right">+{fmt(cant)}ⓒ</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
