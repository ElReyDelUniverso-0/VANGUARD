"use client";

import { generateStreakHistory } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Flame, Calendar, TrendingUp, Award, ChevronLeft, ChevronRight, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";

export function StreakCalendarPanel() {
  const { streak, lastLoginDate, coins, addCoins, addXp } = useGameStore();
  const [month, setMonth] = useState(new Date());

  const today = new Date().toISOString().slice(0, 10);
  const history = generateStreakHistory(streak, lastLoginDate);

  // Build calendar grid for current month
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const firstDay = new Date(year, monthIdx, 1);
  const lastDay = new Date(year, monthIdx + 1, 0);
  const daysInMonth = lastDay.getDate();
  // Monday-first
  const startWeekday = (firstDay.getDay() + 6) % 7;

  const days: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(year, monthIdx, d).toISOString().slice(0, 10);
    days.push(dateStr);
  }
  // pad to full weeks
  while (days.length % 7 !== 0) days.push(null);

  const isClaimed = (dateStr: string | null) => {
    if (!dateStr) return false;
    const histEntry = history.find((h) => h.date === dateStr);
    return histEntry?.claimed ?? false;
  };

  const isToday = (dateStr: string | null) => dateStr === today;
  const isFuture = (dateStr: string | null) => {
    if (!dateStr) return false;
    return dateStr > today;
  };

  const monthName = month.toLocaleDateString("es", { month: "long", year: "numeric" });

  // longest streak calc
  const longestStreak = Math.max(streak, Math.floor(Math.random() * 8) + 5); // mock for display
  const totalClaimed = history.filter((h) => h.claimed).length;
  const totalRewards = history.filter((h) => h.claimed).reduce((a, h) => a + h.reward, 0);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Calendario de racha"
        subtitle="Mantén tu racha activa · recompensas crecientes"
        icon={<Flame className="w-4 h-4 text-red-hud" />}
        color="red"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-0.5 text-red-hud">
              <Flame className="w-3 h-3" /> {streak} dias
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-amber">{totalClaimed}/30</span>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="hud-corner p-3 bg-red-hud/10 border-red-hud/40">
          <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-hud" /> Racha actual
          </div>
          <div className="text-2xl font-mono font-bold text-red-hud">{streak}</div>
          <div className="text-[9px] font-mono text-muted-foreground">dias consecutivos</div>
        </div>
        <div className="hud-corner p-3 bg-amber-hud/10 border-amber-hud/40">
          <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Award className="w-3 h-3 text-amber" /> Racha record
          </div>
          <div className="text-2xl font-mono font-bold text-amber">{longestStreak}</div>
          <div className="text-[9px] font-mono text-muted-foreground">mejor historico</div>
        </div>
        <div className="hud-corner p-3 bg-green-hud/10 border-green-hud/40">
          <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <Check className="w-3 h-3 text-green-hud" /> Dias reclamados
          </div>
          <div className="text-2xl font-mono font-bold text-green-hud">{totalClaimed}</div>
          <div className="text-[9px] font-mono text-muted-foreground">ultimos 30 dias</div>
        </div>
        <div className="hud-corner p-3 bg-cyan-hud/10 border-cyan-hud/40">
          <div className="text-[10px] font-mono text-muted-foreground uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-hud" /> Total ganado
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-hud">{totalRewards}</div>
          <div className="text-[9px] font-mono text-muted-foreground">monedas (30d)</div>
        </div>
      </div>

      {/* Calendar */}
      <div className="hud-corner p-3">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setMonth(new Date(year, monthIdx - 1, 1))}
            className="p-1 hud-corner hover:bg-amber-hud/30 text-amber"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-sm font-mono font-bold text-amber uppercase">{monthName}</div>
          <button
            onClick={() => setMonth(new Date(year, monthIdx + 1, 1))}
            className="p-1 hud-corner hover:bg-amber-hud/30 text-amber"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((d) => (
            <div key={d} className="text-center text-[9px] font-mono text-muted-foreground uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dateStr, i) => {
            if (!dateStr) return <div key={i} className="aspect-square" />;
            const claimed = isClaimed(dateStr);
            const today_ = isToday(dateStr);
            const future = isFuture(dateStr);
            const dayNum = parseInt(dateStr.slice(8, 10));
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "aspect-square hud-corner flex flex-col items-center justify-center text-[10px] font-mono relative transition-all",
                  claimed && "bg-red-hud/20 border-red-hud",
                  today_ && "border-amber-hud bg-amber-hud/30 glow-amber",
                  future && !today_ && "opacity-30",
                  !claimed && !future && !today_ && "bg-secondary/30"
                )}
              >
                <span className={cn(
                  "font-bold",
                  today_ ? "text-amber" : claimed ? "text-red-hud" : "text-muted-foreground"
                )}>
                  {dayNum}
                </span>
                {claimed && <Flame className="w-2.5 h-2.5 text-red-hud mt-0.5" />}
                {today_ && !claimed && <Flame className="w-2.5 h-2.5 text-amber mt-0.5 blink-soft" />}
                {future && <Lock className="w-2 h-2 text-muted-foreground mt-0.5" />}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Streak visualization - last 30 days bar chart */}
      <div className="hud-corner p-3">
        <div className="text-[10px] font-mono text-muted-foreground uppercase mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-amber" /> Evolucion de la racha (ultimos 30 dias)
        </div>
        <div className="flex items-end gap-0.5 h-20 overflow-x-auto thin-scroll">
          {history.map((d, i) => {
            const height = d.claimed ? 100 : 5;
            const isLast = i === history.length - 1;
            return (
              <motion.div
                key={d.date}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.01 }}
                className={cn(
                  "flex-1 min-w-[6px] rounded-t-sm transition-colors",
                  d.claimed ? (isLast ? "bg-amber glow-amber" : "bg-red-hud") : "bg-secondary"
                )}
                title={`${d.date} - ${d.claimed ? "reclamado" : "no reclamado"}`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground mt-1">
          <span>Hace 30 dias</span>
          <span>Hoy</span>
        </div>
      </div>

      {/* Next milestone */}
      <div className="hud-corner p-3 bg-gradient-to-r from-amber-hud/20 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber" />
            <div>
              <div className="text-xs font-mono font-bold text-foreground">Proximo hito de racha</div>
              <div className="text-[10px] font-mono text-muted-foreground">
                {streak < 3 && "3 dias · bonus +50 monedas"}
                {streak >= 3 && streak < 7 && "7 dias · bonus +200 monedas + 2 gemas"}
                {streak >= 7 && streak < 14 && "14 dias · bonus +400 monedas + 4 gemas"}
                {streak >= 14 && streak < 30 && "30 dias · bonus EPICO +1000 monedas + 10 gemas"}
                {streak >= 30 && "¡Racha legendaria! Mantenla viva"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-muted-foreground uppercase">Faltan</div>
            <div className="text-xl font-mono font-bold text-amber">
              {streak < 3 ? 3 - streak :
               streak < 7 ? 7 - streak :
               streak < 14 ? 14 - streak :
               streak < 30 ? 30 - streak : 0}
            </div>
            <div className="text-[9px] font-mono text-muted-foreground">dias</div>
          </div>
        </div>
      </div>
    </div>
  );
}
