"use client";

// ============================================================
// VANGUARD v85.0 EL MUNDO DENTRO — BOT DE TELEGRAM
// (1) PUENTE DEL SERVIDOR (v24): token del entorno del servidor → grupo.
// (2) TU BOT PERSONAL (v85): el usuario crea SU bot con @BotFather, pega
//     token + chat_id AQUÍ y las alertas salen directas del navegador
//     vía api.telegram.org (CORS abierto) — sin servidor y sin secretos.
// (3) RADAR DE ALERTAS AUTOMÁTICAS (v85): tensión global, noticias
//     críticas y nómina lista para cobrar — con anti-spam por regla.
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Send, Bot, CircleCheck, CircleAlert, Copy, ExternalLink, Bell, Users,
  Radar, KeyRound, MessageSquare, History, Trash2, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroOro } from "@/components/vanguard/hero-oro";
import { getTension } from "@/lib/tension";
import { loadEmpleos, acumularNomina, DEPARTAMENTOS, LS_EMPLEOS } from "@/lib/empleos";

interface TgStatus {
  configured: boolean;
  chatConfigured: boolean;
  botName: string | null;
  commands: { cmd: string; desc: string }[];
}

const LS_TG_ALERTS = "vanguard_tg_alerts_v1";
const LS_TG_OWN = "vanguard-tg-own-v85"; // bot personal: { token, chatId }
const LS_TG_RADAR = "vanguard-tg-radar-v85"; // reglas: { tension, noticias, nomina }
const LS_TG_SENT = "vanguard-tg-sent-v85"; // log: { total, items: [{ts, kind, text}] }
const LS_TG_LAST = "vanguard-tg-last-v85"; // anti-spam: { [regla]: ts }
const LS_TG_SEEN = "vanguard-tg-seen-v85"; // noticias ya alertadas (huellas)

interface OwnBot { token: string; chatId: string }
interface RadarRules { tension: boolean; noticias: boolean; nomina: boolean }
interface SentItem { ts: number; kind: string; text: string }
interface SentLog { total: number; items: SentItem[] }

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch { /* noop */ }
  return fallback;
}

function saveJSON(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* noop */ }
}

// envía con el BOT PERSONAL del usuario (directo, sin servidor)
async function enviarPersonal(bot: OwnBot, text: string): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${bot.token.trim()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: bot.chatId.trim(),
      text: text.slice(0, 3900),
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
    signal: AbortSignal.timeout(9000),
  });
  const data = (await res.json()) as { ok?: boolean; description?: string };
  if (!data.ok) throw new Error(data.description ?? "Telegram rechazó el envío");
}

function huella(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9áéíóúñü ]/g, "").split(/\s+/).slice(0, 9).join(" ");
}

const APP_URL = "https://vanguard-kq9r.vercel.app";

export function TelegramPanel() {
  const [status, setStatus] = useState<TgStatus | null>(null);
  const [sending, setSending] = useState(false);
  const [alerts, setAlerts] = useState<Record<string, boolean>>({
    incidentes: true,
    memorial: true,
    denuncias: true,
    directos: false,
  });

  // bot personal
  const [own, setOwn] = useState<OwnBot>({ token: "", chatId: "" });
  const [ownSaved, setOwnSaved] = useState(false);
  const [ownBusy, setOwnBusy] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // radar de alertas
  const [rules, setRules] = useState<RadarRules>({ tension: true, noticias: true, nomina: true });
  const [radarOn, setRadarOn] = useState(false);
  const [log, setLog] = useState<SentLog>({ total: 0, items: [] });
  const [checking, setChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_TG_ALERTS);
      if (raw) setAlerts(JSON.parse(raw));
    } catch { /* noop */ }
    setOwn(loadJSON<OwnBot>(LS_TG_OWN, { token: "", chatId: "" }));
    setRules(loadJSON<RadarRules>(LS_TG_RADAR, { tension: true, noticias: true, nomina: true }));
    setLog(loadJSON<SentLog>(LS_TG_SENT, { total: 0, items: [] }));
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

  const copy = (t: string, label: string) => {
    navigator.clipboard?.writeText(t).then(
      () => toast.success(`${label} copiado`),
      () => toast.error("No se pudo copiar")
    );
  };

  // ===== bot personal: guardar + probar =====
  const guardarBot = () => {
    if (own.token.trim().length < 20 || !own.chatId.trim()) {
      toast.error("Falta el token del bot o el chat_id");
      return;
    }
    saveJSON(LS_TG_OWN, own);
    setOwnSaved(true);
    toast.success("Bot personal guardado en este dispositivo");
    sfxOk();
  };

  const probarBot = async () => {
    setOwnBusy(true);
    try {
      await enviarPersonal(own, [
        "🛰️ <b>VANGUARD · ALERTA DE PRUEBA</b>",
        "",
        "Tu bot personal está conectado al radar de conflictos.",
        `Desde ahora: escaladas, noticias críticas y nómina llegarán aquí.`,
        "",
        `— ${APP_URL}`,
      ].join("\n"));
      toast.success("📨 Mensaje recibido en tu chat — bot operativa");
      registrar("prueba", "Alerta de prueba enviada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar");
    } finally {
      setOwnBusy(false);
    }
  };

  const sfxOk = () => { try { (window as unknown as { dispatchEvent: (e: Event) => void }).dispatchEvent(new Event("vanguard:tg-ok")); } catch { /* noop */ } };

  const registrar = (kind: string, text: string) => {
    setLog((prev) => {
      const next: SentLog = {
        total: prev.total + 1,
        items: [{ ts: Date.now(), kind, text }, ...prev.items].slice(0, 10),
      };
      saveJSON(LS_TG_SENT, next);
      return next;
    });
  };

  // ===== radar: chequeo de las 3 reglas =====
  const chequear = useCallback(async () => {
    const rulesNow = loadJSON<RadarRules>(LS_TG_RADAR, { tension: true, noticias: true, nomina: true });
    const last = loadJSON<Record<string, number>>(LS_TG_LAST, {});
    const now = Date.now();
    const listo = (regla: string, minMs: number) => now - (last[regla] ?? 0) >= minMs;
    const marcar = (regla: string) => saveJSON(LS_TG_LAST, { ...loadJSON<Record<string, number>>(LS_TG_LAST, {}), [regla]: now });
    let envios = 0;

    // 1) TENSIÓN GLOBAL ≥ 75 — cada 30 min como máximo
    if (rulesNow.tension && listo("tension", 30 * 60000)) {
      try {
        const t = getTension();
        if (t >= 75) {
          await enviarPersonal(own, [
            `🚨 <b>VANGUARD · ESCALADA GLOBAL</b>`,
            ``,
            `Tensión del planeta: <b>${t}/100</b> — zona PROTOCOLO ROJO.`,
            `Las primas de guerra están activas (+15% en todo pago).`,
            ``,
            `<a href="${APP_URL}">Abrir Vanguard</a>`,
          ].join("\n"));
          marcar("tension");
          registrar("tension", `Escalada global: tensión ${t}/100`);
          envios++;
        }
      } catch { /* silencioso */ }
    }

    // 2) NOTICIAS CRÍTICAS — cada 15 min, sin repetir titulares
    if (rulesNow.noticias && listo("noticias", 15 * 60000)) {
      try {
        const res = await fetch("/api/news", { signal: AbortSignal.timeout(9000) });
        const data = (await res.json()) as { items?: { title?: string; url?: string }[] };
        const items = (data.items ?? []).slice(0, 8);
        const seen = loadJSON<Record<string, number>>(LS_TG_SEEN, {});
        const frescas = items.filter((n) => n.title && !seen[huella(n.title)]);
        const criticas = frescas.filter((n) => {
          const t = (n.title ?? "").toLowerCase();
          return ["ataque", "missil", "misil", "bombarde", "nuclear", "escalada", "guerra", "muertos", "evacuac", "bloqueo", "golpe de estado"].some((k) => t.includes(k));
        });
        if (criticas.length > 0) {
          const n = criticas[0];
          await enviarPersonal(own, [
            `📰 <b>VANGUARD · ÚLTIMA HORA</b>`,
            ``,
            `<b>${(n.title ?? "").slice(0, 180)}</b>`,
            n.url ?? "",
            ``,
            `<a href="${APP_URL}">Ver el mundo en Vanguard</a>`,
          ].join("\n"));
          const nuevas: Record<string, number> = { ...seen };
          for (const c of criticas) nuevas[huella(c.title ?? "")] = now;
          // poda: conserva 120 huellas
          const claves = Object.entries(nuevas).sort((a, b) => b[1] - a[1]).slice(0, 120);
          saveJSON(LS_TG_SEEN, Object.fromEntries(claves));
          marcar("noticias");
          registrar("noticias", `Última hora: ${(n.title ?? "").slice(0, 60)}…`);
          envios++;
        }
      } catch { /* silencioso */ }
    }

    // 3) NÓMINA LISTA — cada 60 min
    if (rulesNow.nomina && listo("nomina", 60 * 60000)) {
      try {
        const st = loadJSON<import("@/lib/empleos").EmpleosState>(LS_EMPLEOS, {} as import("@/lib/empleos").EmpleosState);
        const depto = DEPARTAMENTOS.find((d) => d.id === st.depto);
        if (depto && st.lastAccrueTs) {
          const s = acumularNomina(st, depto);
          if (s.nominaPendiente >= 120) {
            await enviarPersonal(own, [
              `💼 <b>VANGUARD · NÓMINA DISPONIBLE</b>`,
              ``,
              `Tu puesto en <b>${depto.nombre}</b> acumuló <b>${Math.floor(s.nominaPendiente)}ⓒ</b> sin cobrar.`,
              `La nómina corre aunque no entres — pero tope 6 h.`,
              ``,
              `<a href="${APP_URL}">Cobrar en Vanguard</a>`,
            ].join("\n"));
            marcar("nomina");
            registrar("nomina", `Nómina lista: ${Math.floor(s.nominaPendiente)}ⓒ · ${depto.nombre}`);
            envios++;
          }
        }
      } catch { /* silencioso */ }
    }

    return envios;
  }, [own]);

  const chequearManual = async () => {
    setChecking(true);
    try {
      const n = await chequear();
      if (n > 0) toast.success(`Radar: ${n} alerta(s) enviada(s) a tu Telegram`);
      else toast.info("Radar: nada nuevo que alertar ahora mismo");
    } catch {
      toast.error("El radar falló: revisa token y chat_id");
    } finally {
      setChecking(false);
    }
  };

  // motor del radar: cada 3 min mientras Vanguard esté abierto
  useEffect(() => {
    if (!radarOn) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      chequear().catch(() => { /* noop */ });
    }, 3 * 60000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [radarOn, chequear]);

  const toggleRadarRule = (k: keyof RadarRules) => {
    const next = { ...rules, [k]: !rules[k] };
    setRules(next);
    saveJSON(LS_TG_RADAR, next);
  };

  const limpiarLog = () => {
    const empty: SentLog = { total: 0, items: [] };
    setLog(empty);
    saveJSON(LS_TG_SENT, empty);
  };

  const ok = status?.configured && status?.chatConfigured;
  const botListo = own.token.trim().length >= 20 && own.chatId.trim().length > 0;

  return (
    <div className="space-y-3">
      <HeroOro panel="telegram" />
      <PanelHeader
        title="Bot de Telegram · Alertas de conflicto en tu bolsillo"
        subtitle={botListo ? "bot personal conectado · radar de alertas listo" : status ? (ok ? `bot del servidor @${status.botName ?? "?"} conectado` : "crea tu bot personal en 2 minutos") : "consultando estado..."}
        icon={<Bot className="w-4 h-4 text-cyan-hud" />}
        color="cyan"
      />

      {/* ===== v85: TU BOT PERSONAL ===== */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="hud-corner p-3 space-y-2.5 border-cyan-hud/60">
        <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-hud flex items-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5" /> TU BOT PERSONAL (v85) · alertas directas a tu telegram
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Crea tu propio bot con <span className="text-cyan-hud font-bold">@BotFather</span> (comando{" "}
          <span className="font-mono text-green-hud">/newbot</span>), pega aquí su token y el chat_id donde
          quieres recibir las alertas. Los mensajes salen <b>directos de tu bot</b>: sin servidores,
          sin secretos compartidos.
        </p>
        <div className="space-y-1.5">
          <div className="relative">
            <Input
              value={own.token}
              onChange={(e) => { setOwn((o) => ({ ...o, token: e.target.value })); setOwnSaved(false); }}
              placeholder="token del bot · ej. 7284915:AAH8s…"
              type={showToken ? "text" : "password"}
              className="h-9 pr-16 bg-background/60 border-border font-mono text-xs"
            />
            <button
              onClick={() => setShowToken((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono uppercase text-muted-foreground hover:text-cyan-hud"
              aria-label="Mostrar u ocultar token"
            >
              {showToken ? "ocultar" : "ver"}
            </button>
          </div>
          <Input
            value={own.chatId}
            onChange={(e) => { setOwn((o) => ({ ...o, chatId: e.target.value })); setOwnSaved(false); }}
            placeholder="chat_id · tu chat (o -100… para grupo)"
            className="h-9 bg-background/60 border-border font-mono text-xs"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={guardarBot} className="h-8 font-mono text-[10px] uppercase bg-cyan-hud/30 border border-cyan-hud text-cyan-hud hover:bg-cyan-hud/50">
            guardar
          </Button>
          <Button size="sm" onClick={probarBot} disabled={!botListo || ownBusy} className="h-8 font-mono text-[10px] uppercase bg-green-hud/30 border border-green-hud text-green-hud hover:bg-green-hud/50 disabled:opacity-40">
            <Send className="w-3 h-3 mr-1" /> {ownBusy ? "enviando…" : "enviar prueba"}
          </Button>
          {botListo && ownSaved && (
            <span className="text-[9px] font-mono uppercase text-green-hud flex items-center gap-1">
              <CircleCheck className="w-3 h-3" /> listo
            </span>
          )}
        </div>
        <p className="text-[9px] font-mono text-muted-foreground uppercase leading-relaxed">
          el token vive solo en TU navegador (localStorage de este dispositivo) y viaja únicamente a api.telegram.org
        </p>
      </motion.div>

      {/* ===== v85: RADAR DE ALERTAS AUTOMÁTICAS ===== */}
      <div className="hud-corner p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-cyan-hud flex items-center gap-1.5">
            <Radar className="w-3.5 h-3.5" /> radar de alertas automáticas
          </p>
          <button
            onClick={() => { setRadarOn((v) => !v); if (!botListo) toast.error("Primero guarda tu bot personal (token + chat_id)"); }}
            disabled={!botListo}
            className={cn(
              "text-[10px] font-mono uppercase px-2.5 py-1.5 border transition-colors disabled:opacity-40",
              radarOn ? "border-green-hud text-green-hud bg-green-hud/20" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {radarOn ? "● radar activo" : "○ activar radar"}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Mientras Vanguard esté abierto, el radar revisa cada 3 minutos el planeta y manda a tu
          Telegram lo que importa — con freno anti-spam por regla.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          {([
            { k: "tension", icon: "🚨", t: "Escalada global", d: "tensión ≥ 75 · máx 1 cada 30 min" },
            { k: "noticias", icon: "📰", t: "Última hora", d: "noticia crítica nueva · máx 1 cada 15 min" },
            { k: "nomina", icon: "💼", t: "Nómina lista", d: "≥ 120ⓒ sin cobrar · máx 1 cada 60 min" },
          ] as { k: keyof RadarRules; icon: string; t: string; d: string }[]).map((r) => (
            <button
              key={r.k}
              onClick={() => toggleRadarRule(r.k)}
              className={cn(
                "border p-2 text-left transition-colors",
                rules[r.k] ? "border-green-hud/60 bg-green-hud/10" : "border-border/60 text-muted-foreground"
              )}
            >
              <p className="text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", rules[r.k] ? "bg-green-hud" : "bg-muted-foreground/40")} />
                {r.icon} {r.t}
              </p>
              <p className="text-[9px] font-mono text-muted-foreground mt-0.5 leading-snug">{r.d}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={chequearManual} disabled={!botListo || checking} className="h-7 font-mono text-[10px] uppercase bg-amber-hud/30 border border-amber-hud text-amber hover:bg-amber-hud/50 disabled:opacity-40">
            <Radar className="w-3 h-3 mr-1" /> {checking ? "escaneando…" : "escanear ahora"}
          </Button>
          <span className="text-[9px] font-mono text-muted-foreground uppercase">
            {log.total} alertas enviadas desde este dispositivo
          </span>
        </div>

        {log.items.length > 0 && (
          <div className="border border-border/60 p-2 space-y-1 max-h-36 overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-mono uppercase text-muted-foreground flex items-center gap-1">
                <History className="w-3 h-3" /> registro de envíos
              </p>
              <button onClick={limpiarLog} className="text-[9px] font-mono uppercase text-red-hud hover:underline flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> limpiar
              </button>
            </div>
            {log.items.map((it, i) => (
              <div key={i} className="flex items-baseline gap-2 text-[10px] font-mono">
                <span className="text-muted-foreground whitespace-nowrap">
                  {new Date(it.ts).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-cyan-hud uppercase">{it.kind}</span>
                <span className="text-foreground/80 truncate">{it.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Estado del puente del servidor (v24) ===== */}
      <div className="hud-corner p-3 flex items-start gap-3">
        {ok ? <CircleCheck className="w-5 h-5 text-green-hud mt-0.5 flex-shrink-0" /> : <CircleAlert className="w-5 h-5 text-amber mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground">
            {ok ? "Puente del servidor vinculado a un grupo" : "Puente del servidor (opcional)"}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
            {ok
              ? "Las alertas del servidor se envían al grupo vía /api/telegram."
              : "El puente del servidor requiere variables de entorno (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID). Para uso personal, tu bot de arriba hace lo mismo sin tocar el servidor."}
          </p>
        </div>
        <span className={cn("text-[9px] font-mono px-2 py-1 border uppercase flex-shrink-0", ok ? "border-green-hud text-green-hud" : "border-amber-hud text-amber")}>
          {ok ? "en línea" : "sin token"}
        </span>
      </div>

      {/* Guía de configuración del puente (compacta) */}
      {!ok && (
        <div className="hud-corner p-3 space-y-2.5">
          <p className="text-[10px] font-mono uppercase text-cyan-hud tracking-wider">configuración del puente (opcional, para grupos)</p>
          {[
            { n: 1, t: "Crea el bot", d: "Habla con @BotFather → /newbot → copia el token (formato 123456:ABC-DEF...)." },
            { n: 2, t: "Añádelo a tu grupo", d: "Agrega el bot como miembro del grupo donde llegarán las alertas." },
            { n: 3, t: "Obtén el chat_id", d: "Añade @RawDataBot al grupo y copia el campo chat.id (negativo para grupos)." },
            { n: 4, t: "Configura el servidor", d: "Pon TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en el entorno del servidor." },
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
        </div>
      )}

      {/* Tipos de alerta del servidor */}
      <div className="hud-corner p-3">
        <p className="text-[10px] font-mono uppercase text-cyan-hud tracking-wider mb-2 flex items-center gap-1.5">
          <Bell className="w-3 h-3" /> tipos de alerta que envía el puente del servidor
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

      {/* Envío de prueba por el puente */}
      <div className="hud-corner p-3">
        <p className="text-[10px] font-mono uppercase text-cyan-hud tracking-wider mb-2 flex items-center gap-1.5">
          <Send className="w-3 h-3" /> enviar alerta de prueba al grupo (puente del servidor)
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { kind: "incidente" as const, label: "🚨 incidente", cls: "bg-red-hud/30 border-red-hud text-red-hud hover:bg-red-hud/50" },
            { kind: "memorial" as const, label: "🕯️ memorial", cls: "bg-violet-hud/30 border-violet-hud text-violet-hud hover:bg-violet-hud/50" },
            { kind: "denuncia" as const, label: "⚖️ denuncia", cls: "bg-amber-hud/30 border-amber-hud text-amber hover:bg-amber-hud/50" },
          ].map((b) => (
            <Button
              key={b.kind}
              size="sm"
              onClick={async () => {
                setSending(true);
                try {
                  const res = await fetch("/api/telegram", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      kind: b.kind,
                      title: b.kind === "incidente" ? "Prueba: Frente de Pokrovsk reporta bombardeos" : b.kind === "memorial" ? "Homenaje del día en el Memorial" : "Nueva denuncia verificable en foros",
                      detail: "Mensaje de prueba enviado desde el panel TELEGRAM de VANGUARD.",
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
              }}
              disabled={sending}
              className={cn("h-7 font-mono text-[10px] uppercase border", b.cls)}
            >
              {b.label}
            </Button>
          ))}
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
            <MessageSquare className="w-3 h-3" /> webhook (producción)
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Para grupos grandes: registra el webhook con tu dominio y Telegram llamará a tu servidor en cada mensaje.
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

      <p className="text-[9px] font-mono text-muted-foreground text-center uppercase flex items-center justify-center gap-1">
        <Wallet className="w-3 h-3" /> el radar también vigila tu nómina de Empleos — nunca más dinero olvidado
      </p>
    </div>
  );
}
