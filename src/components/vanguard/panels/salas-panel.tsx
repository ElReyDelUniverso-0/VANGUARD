"use client";

// Vanguard v7 — SALAS SOCIALES: chat en vivo multijugador por salas tematicas.
// Socket.io -> mini-servicio :3003 (gateway XTransformPort). Comunidad simulada + jugadores reales.
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  MessagesSquare, Send, Users, Hash, Lock, Signal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { getRealtime } from "@/lib/realtime";
import { FlagBadge } from "@/components/vanguard/flag-badge";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";

interface RoomDef { id: string; name: string; desc: string; color: string; }
interface ChatMsg {
  id: string; room: string; author: string; country: string;
  body: string; ts: number; bot?: boolean; sys?: boolean;
}

const ROOM_COLOR: Record<string, string> = {
  amber: "text-amber border-amber-hud bg-amber-hud/20",
  green: "text-green-hud border-green-hud bg-green-hud/20",
  red: "text-red-hud border-red-hud bg-red-hud/20",
  violet: "text-violet-hud border-violet-hud bg-violet-hud/20",
  cyan: "text-cyan-hud border-cyan-hud bg-cyan-hud/20",
};

const CHAT_MSGS_KEY = "vanguard-chat-msgs";

function countChatMsg(): number {
  try {
    const prev = parseInt(localStorage.getItem(CHAT_MSGS_KEY) ?? "0", 10) || 0;
    const next = prev + 1;
    localStorage.setItem(CHAT_MSGS_KEY, String(next));
    return next;
  } catch {
    return 1;
  }
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "ahora";
  if (s < 3600) return `hace ${Math.floor(s / 60)}m`;
  return `hace ${Math.floor(s / 3600)}h`;
}

export function SalasPanel() {
  const alias = useGameStore((s) => s.alias);
  const [rooms, setRooms] = useState<RoomDef[]>([]);
  const [online, setOnline] = useState<Record<string, number>>({});
  const [onlineNames, setOnlineNames] = useState<Record<string, string[]>>({});
  const [active, setActive] = useState<string>("general");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSent = useRef(0);

  // ===== conexion socket =====
  // refs espejo para callbacks sin re-suscribir (actualizados via efectos)
  const activeRef = useRef(active);
  const aliasRef = useRef(alias || "OPERADOR");
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => { aliasRef.current = alias || "OPERADOR"; }, [alias]);

  useEffect(() => {
    const socket = getRealtime();
    if (!socket) return;

    const onInit = (d: { rooms: RoomDef[]; online: Record<string, number> }) => {
      setRooms(d.rooms);
      setOnline(d.online);
    };
    const onConnect = () => {
      setConnected(true);
      // re-entrar a la sala activa tras reconexion
      socket.emit("chat:join", {
        room: activeRef.current,
        name: aliasRef.current,
        country: "UN",
      });
    };
    const onDisconnect = () => setConnected(false);
    const onOnline = (d: { online: Record<string, number>; names: Record<string, string[]> }) => {
      setOnline(d.online);
      setOnlineNames(d.names);
    };
    const onHistory = (d: { roomId: string; msgs: ChatMsg[] }) => {
      if (d.roomId !== activeRef.current) return;
      setMsgs(d.msgs);
    };
    const onMsg = (m: ChatMsg) => {
      if (m.room !== activeRef.current) return;
      setMsgs((prev) => {
        if (prev.some((x) => x.id === m.id)) return prev;
        return [...prev, m];
      });
      if (m.author !== aliasRef.current) sfx.click();
    };
    const onSys = (d: { room: string; body: string; ts: number }) => {
      if (d.room !== activeRef.current) return;
      setMsgs((prev) => [...prev, {
        id: `sys-${d.ts}-${Math.random().toString(36).slice(2, 6)}`,
        room: d.room, author: "SALA", country: "XX", body: d.body, ts: d.ts, sys: true,
      }]);
    };
    const onTyping = (d: { room: string; name: string }) => {
      if (d.room !== activeRef.current || d.name === aliasRef.current) return;
      setTyping(d.name);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(null), 2500);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat:init", onInit);
    socket.on("chat:online", onOnline);
    socket.on("chat:history", onHistory);
    socket.on("chat:msg", onMsg);
    socket.on("chat:sys", onSys);
    socket.on("chat:typing", onTyping);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat:init", onInit);
      socket.off("chat:online", onOnline);
      socket.off("chat:history", onHistory);
      socket.off("chat:msg", onMsg);
      socket.off("chat:sys", onSys);
      socket.off("chat:typing", onTyping);
    };

  }, []);

  const changeRoom = useCallback((roomId: string) => {
    setActive(roomId);
    setMsgs([]);
    setTyping(null);
    const socket = getRealtime();
    socket.emit("chat:join", {
      room: roomId,
      name: aliasRef.current,
      country: "UN",
    }, (res: { ok?: boolean } | undefined) => {
      if (!res?.ok) toast.error("No se pudo entrar a la sala");
    });
    sfx.tab();
  }, []);

  // entrar a la primera sala cuando hay conexion
  useEffect(() => {
    if (connected && rooms.length > 0 && msgs.length === 0) {
      const socket = getRealtime();
      socket.emit("chat:join", { room: activeRef.current, name: aliasRef.current, country: "UN" });
    }
  }, [connected, rooms.length]);

  const send = () => {
    const body = input.trim();
    if (!body) return;
    const now = Date.now();
    if (now - lastSent.current < 600) {
      toast.error("Vas muy rapido, operador — espera un momento");
      return;
    }
    lastSent.current = now;
    const socket = getRealtime();
    socket.emit("chat:msg", { room: activeRef.current, body });
    setInput("");
    sfx.success();
    // recompensa de actividad: +2 monedas cada 10 mensajes en salas
    const total = countChatMsg();
    if (total % 10 === 0) {
      useGameStore.getState().addCoins(2, "Actividad en salas sociales");
      toast.success(`Operador activo: ${total} mensajes — +2 monedas`);
      sfx.unlock();
    }
  };

  // auto-scroll al ultimo mensaje
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  const totalOnline = useMemo(
    () => Object.values(online).reduce((a, b) => a + b, 0),
    [online]
  );
  const activeRoom = rooms.find((r) => r.id === active);

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Salas sociales"
        subtitle="Chat en vivo de la comunidad · tiempo real multijugador · 8 salas tematicas"
        icon={<MessagesSquare className="w-4 h-4 text-violet-hud" />}
        color="violet"
        right={
          <span className={cn(
            "flex items-center gap-1.5 text-[9px] font-mono px-2 py-1 border uppercase",
            connected ? "border-green-hud text-green-hud bg-green-hud/20" : "border-red-hud text-red-hud bg-red-hud/20"
          )}>
            <Signal className="w-3 h-3" />
            {connected ? "EN LINEA" : "CONECTANDO"}
          </span>
        }
      />

      {/* barra de estado */}
      <div className="hud-corner p-2 flex items-center gap-3 text-[10px] font-mono flex-wrap">
        <span className="text-green-hud flex items-center gap-1">
          <Users className="w-3 h-3" /> {totalOnline} operadores en linea
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">hablas como</span>
        <span className="text-amber uppercase flex items-center gap-1">
          <FlagBadge code="UN" size="sm" /> {alias || "OPERADOR"}
        </span>
        <span className="ml-auto text-muted-foreground">+2 monedas cada 10 mensajes en salas</span>
      </div>

      <div className="grid lg:grid-cols-4 gap-3">
        {/* ===== lista de salas ===== */}
        <div className="lg:col-span-1 space-y-1.5">
          {rooms.map((r) => {
            const isActive = r.id === active;
            const n = online[r.id] ?? 0;
            return (
              <button
                key={r.id}
                onClick={() => changeRoom(r.id)}
                className={cn(
                  "w-full text-left p-2.5 border transition-colors group",
                  isActive
                    ? "border-amber-hud bg-amber-hud/20"
                    : "border-border hover:border-amber-hud/50 hover:bg-secondary/40"
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className={cn(
                    "text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 truncate",
                    isActive ? "text-amber" : "text-foreground/90 group-hover:text-amber"
                  )}>
                    <Hash className="w-3 h-3 flex-shrink-0" />
                    {r.name}
                  </span>
                  <span className="text-[9px] font-mono text-green-hud flex-shrink-0 flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-green-hud blink-soft" />
                    {n}
                  </span>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate">{r.desc}</p>
                {/* avatares simulados en linea */}
                {!isActive && (onlineNames[r.id]?.length ?? 0) > 0 && (
                  <p className="text-[8px] font-mono text-muted-foreground/70 mt-1 truncate uppercase">
                    {onlineNames[r.id].slice(0, 3).join(" · ")}
                  </p>
                )}
              </button>
            );
          })}
          {rooms.length === 0 && (
            <div className="hud-corner p-4 text-center text-muted-foreground text-[10px] font-mono">
              cargando salas...
            </div>
          )}
        </div>

        {/* ===== ventana de chat ===== */}
        <div className="lg:col-span-3 hud-corner flex flex-col" style={{ minHeight: 480 }}>
          {/* cabecera de sala */}
          <div className="p-2.5 border-b border-amber-hud/30 flex items-center gap-2 flex-wrap">
            <Lock className="w-3.5 h-3.5 text-amber" />
            <span className="text-xs font-mono font-bold text-amber uppercase tracking-wider">
              {activeRoom?.name ?? "..."}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground uppercase">
              · {activeRoom?.desc}
            </span>
            <span className="ml-auto text-[9px] font-mono text-green-hud flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-hud blink-soft" />
              {online[active] ?? 0} EN LINEA
            </span>
          </div>

          {/* mensajes */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto thin-scroll p-3 space-y-2"
            style={{ maxHeight: 420, minHeight: 380 }}
          >
            {msgs.map((m) => {
              if (m.sys) {
                return (
                  <div key={m.id} className="text-center">
                    <span className="text-[9px] font-mono text-cyan-hud/70 uppercase border border-cyan-hud/20 px-2 py-0.5 bg-cyan-hud/5">
                      {m.body}
                    </span>
                  </div>
                );
              }
              const mine = m.author === (alias || "OPERADOR");
              return (
                <div key={m.id} className={cn("flex gap-2", mine && "flex-row-reverse")}>
                  <div className="w-6 flex-shrink-0 pt-0.5">
                    <FlagBadge code={m.country || "??"} size="sm" />
                  </div>
                  <div className={cn("max-w-[78%]", mine && "text-right")}>
                    <div className={cn(
                      "flex items-center gap-1.5 mb-0.5",
                      mine && "flex-row-reverse"
                    )}>
                      <span className={cn(
                        "text-[9px] font-mono font-bold uppercase",
                        mine ? "text-amber" : m.bot ? "text-cyan-hud" : "text-green-hud"
                      )}>
                        {m.author}
                      </span>
                      {m.bot && (
                        <span className="text-[7px] font-mono px-1 border border-cyan-hud/40 text-cyan-hud/80 uppercase">
                          COMUNIDAD
                        </span>
                      )}
                      <span className="text-[8px] font-mono text-muted-foreground/60">{timeAgo(m.ts)}</span>
                    </div>
                    <div className={cn(
                      "inline-block px-2.5 py-1.5 border text-xs leading-relaxed text-left",
                      mine
                        ? "border-amber-hud bg-amber-hud/15 text-foreground"
                        : "border-border bg-secondary/40 text-foreground/90"
                    )}>
                      {m.body}
                    </div>
                  </div>
                </div>
              );
            })}
            {msgs.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted-foreground text-[10px] font-mono">
                cargando conversacion de la sala...
              </div>
            )}
            {typing && (
              <p className="text-[9px] font-mono text-muted-foreground uppercase animate-pulse pl-8">
                {typing} esta escribiendo...
              </p>
            )}
          </div>

          {/* entrada */}
          <div className="p-2.5 border-t border-amber-hud/30 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
                if (e.key.length === 1) {
                  const socket = getRealtime();
                  socket.emit("chat:typing", { room: activeRef.current });
                }
              }}
              placeholder={`Mensaje para #${activeRoom?.name?.toLowerCase() ?? ""}...`}
              maxLength={240}
              className="h-9 bg-background/60 border-border font-mono text-xs"
              aria-label="Mensaje de chat"
            />
            <Button
              size="sm"
              onClick={send}
              className="h-9 px-3 font-mono text-[10px] uppercase bg-amber-hud border border-amber-hud text-amber hover:bg-amber-hud/70"
              aria-label="Enviar mensaje"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
