"use client";

import { useState, useMemo } from "react";
import { VIcon } from "@/components/vanguard/vanguard-icon";
import { INITIAL_NOTIFICATIONS, type Notification } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { Bell, BellRing, Check, CheckCheck, Trash2, Trophy, Gift, Users, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const typeColor: Record<string, string> = {
  ACHIEVEMENT: "text-green-hud border-green-hud bg-green-hud/30",
  MISSION: "text-amber border-amber-hud bg-amber-hud/30",
  WEEKLY: "text-amber border-amber-hud bg-amber-hud/30",
  TOURNAMENT: "text-cyan-hud border-cyan-hud bg-cyan-hud/30",
  SYSTEM: "text-muted-foreground border-border bg-secondary",
  FRIEND: "text-violet-hud border-violet-hud bg-violet-hud/30",
};

const typeIcon: Record<string, React.ReactNode> = {
  ACHIEVEMENT: <Trophy className="w-3.5 h-3.5" />,
  MISSION: <Check className="w-3.5 h-3.5" />,
  WEEKLY: <Gift className="w-3.5 h-3.5" />,
  TOURNAMENT: <Trophy className="w-3.5 h-3.5" />,
  SYSTEM: <Info className="w-3.5 h-3.5" />,
  FRIEND: <Users className="w-3.5 h-3.5" />,
};

export function NotificationsPanel() {
  const { log } = useGameStore();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");

  // Derive achievement notifications from game log + initial notifications
  const achievementNotifs: Notification[] = useMemo(() => {
    return log
      .filter((entry) => entry.msg.includes("Logro desbloqueado:"))
      .map((entry) => {
        const title = entry.msg.replace("Logro desbloqueado: ", "");
        return {
          id: `log-${entry.ts}`,
          type: "ACHIEVEMENT" as const,
          title: "Logro desbloqueado",
          message: title,
          timestamp: entry.ts,
          read: false,
          icon: "trophy",
        };
      });
  }, [log]);

  // Merge: achievement notifs first, then initial, excluding dismissed
  const allNotifications = useMemo(() => {
    const merged = [...achievementNotifs, ...INITIAL_NOTIFICATIONS];
    // dedupe by title
    const seen = new Set<string>();
    return merged
      .filter((n) => {
        if (seen.has(n.title)) return false;
        seen.add(n.title);
        return true;
      })
      .filter((n) => !dismissed.includes(n.id))
      .map((n) => ({ ...n, read: readIds.includes(n.id) || n.read }))
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [achievementNotifs, dismissed, readIds]);

  const filtered = filter === "UNREAD" ? allNotifications.filter((n) => !n.read) : allNotifications;
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setReadIds((prev) => [...prev, id]);
  };

  const markAllRead = () => {
    setReadIds(allNotifications.map((n) => n.id));
    toast.success(`${unreadCount} notificaciones marcadas como leidas`);
  };

  const remove = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const clearAll = () => {
    setDismissed(allNotifications.map((n) => n.id));
    toast.success("Notificaciones eliminadas");
  };

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Centro de notificaciones"
        subtitle="Alertas · logros · eventos del sistema"
        icon={unreadCount > 0 ? <BellRing className="w-4 h-4 text-amber blink-soft" /> : <Bell className="w-4 h-4 text-muted-foreground" />}
        color="amber"
        right={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            {unreadCount > 0 && (
              <span className="flex items-center gap-0.5 text-amber">
                <span className="px-1.5 py-0.5 bg-amber-hud text-amber font-bold rounded-sm">{unreadCount}</span>
                sin leer
              </span>
            )}
          </div>
        }
      />

      {/* Action bar */}
      <div className="hud-corner p-2 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1">
          {(["ALL", "UNREAD"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2 py-1 border text-[10px] font-mono uppercase",
                filter === f
                  ? "border-amber-hud text-amber bg-amber-hud/30"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "ALL" ? `Todas (${allNotifications.length})` : `Sin leer (${unreadCount})`}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="h-7 px-2 text-[10px] font-mono uppercase border-amber-hud/40 text-amber hover:bg-amber-hud/30"
          >
            <CheckCheck className="w-3 h-3 mr-1" /> Marcar leidas
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clearAll}
            disabled={allNotifications.length === 0}
            className="h-7 px-2 text-[10px] font-mono uppercase border-border text-muted-foreground hover:bg-destructive/20 hover:text-red-hud"
          >
            <Trash2 className="w-3 h-3 mr-1" /> Limpiar
          </Button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto thin-scroll pr-1">
        {filtered.length === 0 ? (
          <div className="hud-corner p-8 text-center">
            <Bell className="w-10 h-10 mx-auto text-muted-foreground opacity-40 mb-2" />
            <p className="text-sm font-mono text-muted-foreground">
              {filter === "UNREAD" ? "Sin notificaciones sin leer" : "Sin notificaciones"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Las alertas de logros y eventos apareceran aqui
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn(
                  "hud-corner p-3 pl-4 flex items-start gap-2 transition-all",
                  !n.read && "border-l-4 border-l-amber bg-amber-hud/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 hud-corner flex items-center justify-center text-base flex-shrink-0",
                  typeColor[n.type]
                )}>
                  <VIcon k={n.icon} className="w-4 h-4 text-amber" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("text-[9px] font-mono px-1.5 py-0.5 border uppercase", typeColor[n.type])}>
                      {n.type}
                    </span>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-amber blink-soft" />}
                    <span className="text-[9px] font-mono text-muted-foreground ml-auto">
                      {timeAgo(n.timestamp)}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-foreground">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{n.message}</div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="p-1 hover:bg-amber-hud/30 rounded-sm text-amber"
                      title="Marcar como leida"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => remove(n.id)}
                    className="p-1 hover:bg-destructive/20 rounded-sm text-muted-foreground hover:text-red-hud"
                    title="Eliminar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
