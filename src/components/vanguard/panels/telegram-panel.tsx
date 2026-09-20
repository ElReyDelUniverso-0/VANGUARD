"use client";

// ============================================================
// VANGUARD v24 — BOT DE TELEGRAM VINCULADO AL GRUPO
// Panel de configuración del bot (@BotFather → token → grupo),
// alertas de prueba, tipos de alerta y guía del bot standalone.
// ============================================================
import { useEffect, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Send, Bot, CircleCheck, CircleAlert, Copy, ExternalLink, Bell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TgStatus {
  configured: boolean;
  chatConfigured: boolean;
  botName: string | null;
  commands: { cmd: string; desc: string }[];
}

const LS_TG_ALERTS = "vanguard_tg_alerts_v1";

export function TelegramPanel() {
  const [status, setStatus] = useState<TgStatus | null>(null);
  const [sending, setSending] = useState(false);
  const [alerts, setAlerts] = useState<Record<string, boolean>>({
    incidentes: true,
    memorial: true,
    denuncias: true,
    directos: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_TG_ALERTS);
      if (raw) setAlerts(JSON.parse(raw));
    } catch { /* noop */ }
    fetch("/api/telegram")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ configured: false, chatConfigured: false, botName: null, commands: [] }));
  }, []);

  const toggleAlert = (k: string) => {
    const next = { ...alerts, [k]: !alerts[k] };
    setAlerts(next);
    try { localStorage.setItem(LS_TG_ALERTS, JSON.stringify(next)); } catch { /* noop */ }
  };

  const sendTest = async (kind: "incidente" | "memorial" | "denuncia") => {
    setSending(true);
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title: kind === "incidente" ? "Prueba: Frente de Pokrovsk reporta bombardeos" : kind === "memorial" ? "Homenaje del día en el Memorial" : "Nueva denuncia verificable en foros",
          detail: "Mensaje de prueba enviado desde el panel TELEGRAM de VANGUARD v24.",
          location: "Sistema de alertas VANGUARD",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      toast.success("📨 Alerta enviada al grupo vinculado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar");
    } finally {
      setSending(false);
    }
  };

  const copy = (t: string, label: string) => {
    navigator.clipboard?.writeText(t).then(
      () => toast.success(`${label} copiado`),
      () => toast.error("No se pudo copiar")
    );
  };

  const ok = status?.configured && status?.chatConfigured;

  return (
    <div className="space-y-3">
      <PanelHeader
        title="Bot de Telegram · Alertas de guerra en tu grupo"
        subtitle={status ? (ok ? `bot @${status.botName ?? "?"} conectado` : "bot en modo configuración") : "consultando estado..."}
        icon={<Bot className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
      />

      {/* Estado */}
      <div className="hud-corner p-3 flex items-start gap-3">
        {ok ? <CircleCheck className="w-5 h-5 text-green-hud mt-0.5 flex-shrink-0" /> : <CircleAlert className="w-5 h-5 text-amber mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">
            {ok ? "Bot configurado y vinculado a tu grupo" : "El bot necesita configuración (2 minutos)"}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
            {ok
              ? "Las alertas del servidor se envían al grupo vía /api/telegram. También puedes correr el bot standalone para comandos interactivos."
              : "Crea el bot con @BotFather, añádelo a tu grupo y pon las variables en el servidor. Hasta entonces, la plataforma funciona igual: este panel es el puente."}
          </p>
        </div>
        <span className={cn("text-[9px] font-mono px-2 py-1 border uppercase flex-shrink-0", ok ? "border-green-hud text-green-hud" : "border-amber-hud text-amber")}>
          {ok ? "en línea" : "sin token"}
        </span>
      </div>

      {/* Guía de configuración */}
      {!ok && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hud-corner p-3 space-y-2.5">
          <p className="text-[10px] font-mono uppercase text-cyan-hud tracking-wider">configuración paso a paso</p>
          {[
            { n: 1, t: "Crea el bot", d: "Habla con @BotFather en Telegram → /newbot → elige nombre y usuario. Copia el token (formato 123456:ABC-DEF...)." },
            { n: 2, t: "Añádelo a tu grupo", d: "Agrega el bot como miembro del grupo y dale permiso de enviar mensajes. El grupo es donde llegarán las alertas." },
            { n: 3, t: "Obtén el chat_id", d: "Añade @RawDataBot al grupo y copia el campo chat.id (negativo para grupos: -100...), o consulta getUpdates tras escribir en el grupo." },
            { n: 4, t: "Configura el servidor", d: "Pon las variables en el entorno del servidor (o .env): TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID." },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-2.5">
              <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center border border-cyan-hud/50 text-cyan-hud font-mono text-[10px] font-bold">{s.n}</span>
              <div>
                <p className="text-[11px] font-bold text-foreground leading-tight">{s.t}</p>
                <p className="text-[10px] text-muted-foreground leading-snug">{s.d}</p>
              </div>
            </div>
          ))}
          <div className="border border-border/60 bg-secondary/40 p-2 font-mono text-[10px] text-green-hud overflow-x-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="whitespace-nowrap">TELEGRAM_BOT_TOKEN=123456:ABC-DEF...</span>
              <button onClick={() => copy("TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234...\nTELEGRAM_CHAT_ID=-1001234567890", ".env")} aria-label="Copiar variables" className="text-muted-foreground hover:text-cyan-hud flex-shrink-0">
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div>TELEGRAM_CHAT_ID=-1001234567890</div>
          </div>
          <p className="text-[9px] font-mono text-muted-foreground/70 uppercase leading-relaxed">
            por seguridad nunca pongas el token en el código del cliente: solo variables del servidor
          </p>
        </motion.div>
      )}

      {/* Tipos de alerta */}
      <div className="hud-corner p-3">
        <p className="text-[10px] font-mono uppercase text-cyan-hud tracking-wider mb-2 flex items-center gap-1.5">
          <Bell className="w-3 h-3" /> tipos de alerta que envía el bot
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { k: "incidentes", l: "🚨 Incidentes documentados en el mapa" },
            { k: "memorial", l: "🕯️ Memorial: homenajes y velas" },
            { k: "denuncias", l: "⚖️ Denuncias nuevas en foros" },
            { k: "directos", l: "📡 Directos y streams en vivo" },
          ].map((a) => (
            <button
              key={a.k}
              onClick={() => toggleAlert(a.k)}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 border text-left transition-colors",
                alerts[a.k] ? "border-green-hud/60 bg-green-hud/10 text-foreground" : "border-border/60 text-muted-foreground"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", alerts[a.k] ? "bg-green-hud" : "bg-muted-foreground/40")} />
              <span className="text-[10px] font-mono uppercase leading-tight">{a.l}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Envío de prueba */}
      <div className="hud-corner p-3">
        <p className="text-[10px] font-mono uppercase text-cyan-hud tracking-wider mb-2 flex items-center gap-1.5">
          <Send className="w-3 h-3" /> enviar alerta de prueba al grupo
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => sendTest("incidente")} disabled={sending} className="h-7 font-mono text-[10px] uppercase bg-red-hud/30 border border-red-hud text-red-hud hover:bg-red-hud/50">
            🚨 incidente
          </Button>
          <Button size="sm" onClick={() => sendTest("memorial")} disabled={sending} className="h-7 font-mono text-[10px] uppercase bg-violet-hud/30 border border-violet-hud text-violet-hud hover:bg-violet-hud/50">
            🕯️ memorial
          </Button>
          <Button size="sm" onClick={() => sendTest("denuncia")} disabled={sending} className="h-7 font-mono text-[10px] uppercase bg-amber-hud/30 border border-amber-hud text-amber hover:bg-amber-hud/50">
            ⚖️ denuncia
          </Button>
          <span className="text-[9px] font-mono text-muted-foreground uppercase ml-auto">usa /api/telegram (POST)</span>
        </div>
      </div>

      {/* Bot standalone + webhook */}
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="hud-corner p-3">
          <p className="text-[10px] font-mono uppercase text-cyan-hud tracking-wider mb-1.5 flex items-center gap-1.5">
            <Users className="w-3 h-3" /> bot interactivo (standalone)
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            El script <span className="text-green-hud font-mono">scripts/telegram-bot.mjs</span> corre con long-polling y
            responde comandos en tu grupo: /alertas, /resumen, /incidentes, /memorial, /ayuda.
          </p>
          <div className="border border-border/60 bg-secondary/40 p-2 mt-1.5 font-mono text-[9px] text-green-hud overflow-x-auto flex items-center justify-between gap-2">
            <span className="whitespace-nowrap">node scripts/telegram-bot.mjs</span>
            <button onClick={() => copy("node scripts/telegram-bot.mjs", "comando")} aria-label="Copiar comando" className="text-muted-foreground hover:text-cyan-hud flex-shrink-0">
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="hud-corner p-3">
          <p className="text-[10px] font-mono uppercase text-cyan-hud tracking-wider mb-1.5 flex items-center gap-1.5">
            <Bot className="w-3 h-3" /> webhook (producción)
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Cuando publiques la web, registra el webhook con tu dominio y Telegram llamará a tu servidor en cada mensaje del grupo.
          </p>
          <a
            href="https://core.telegram.org/bots/api#setwebhook"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-mono uppercase text-cyan-hud hover:underline mt-1.5"
          >
            <ExternalLink className="w-3 h-3" /> documentación setWebhook
          </a>
        </div>
      </div>

      {/* Comandos */}
      {status?.commands && (
        <div className="hud-corner p-3">
          <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider mb-1.5">comandos que entiende el bot</p>
          <div className="grid sm:grid-cols-2 gap-1">
            {status.commands.map((c) => (
              <div key={c.cmd} className="flex items-baseline gap-2 text-[10px] font-mono">
                <span className="text-cyan-hud">{c.cmd}</span>
                <span className="text-muted-foreground">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
