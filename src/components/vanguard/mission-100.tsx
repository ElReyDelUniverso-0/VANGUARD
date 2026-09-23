"use client";

// v37 MISIÓN 100 — centro de mando de la campaña de enlaces.
// El comandante ordenó: "hasta que no se repartan 100 enlaces, no hay descanso".
// Este módulo convierte esa orden en una misión medible y en vivo:
//   1) BARRA GLOBAL: enlaces distribuidos (comunidad + motores/directorios) / meta 100.
//   2) ARSENAL: 100 enlaces únicos rastreados (10 plataformas x 10 canales), cada uno
//      con su código VGD-XXXXXX — al copiar, suma al contador global.
//   3) RANKING EN VIVO: cada visitante que llega por un enlace suma a ese código,
//      así se sabe QUÉ enlace trae gente de verdad.
// Sin emojis (regla del proyecto); iconos lucide + tipografía monoespaciada HUD.

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Target, Copy, Check, Trophy, ChevronDown, ExternalLink, Flame,
  Link2, MessageCircle, Send, Globe2, Share2, Hash, MessageSquare,
  Camera, Music2, Youtube, Radio, TrendingUp, Swords,
} from "lucide-react";

// ===== mensajes de reclutamiento (rotan entre enlaces para que no parezca spam) =====
const MESSAGES = [
  "El mundo está en guerra EN VIVO: noticias de conflictos al minuto, mapa OSINT 3D y guerra global multijugador. Entra gratis:",
  "Mapa 3D con aviones militares, tanques y tropas en tiempo real + noticias reales de conflictos. En español y gratis:",
  "Guerra global multijugador: conquista territorios, sube tu ELO y mira el mundo arder en directo. Pasa y entra:",
  "Conflictos mundiales EN DIRECTO: data OSINT, noticias de medios internacionales y simulador táctico. 100% gratis:",
];

type Intent = "whatsapp" | "x" | "telegram" | "facebook";

interface Platform {
  key: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  hint: string;
  prefix: string;
  intent?: Intent;
}

const PLATFORMS: Platform[] = [
  { key: "wa-grupos", name: "WhatsApp — grupos", icon: MessageCircle, color: "text-green-hud", prefix: "WAG", intent: "whatsapp", hint: "Pega el mensaje + enlace en 2-3 grupos al día. Cada grupo es un enlace distinto." },
  { key: "wa-estado", name: "WhatsApp — estados", icon: Camera, color: "text-green-hud", prefix: "WAE", hint: "Publica en tu estado: el enlace se previsualiza con la tarjeta oficial de la página." },
  { key: "facebook", name: "Facebook — grupos y muros", icon: Globe2, color: "text-amber", prefix: "FBG", intent: "facebook", hint: "Grupos de noticias, juegos y geopolítica en español. Un grupo = un enlace." },
  { key: "x", name: "X / Twitter", icon: Share2, color: "text-foreground", prefix: "XTW", intent: "x", hint: "Tuitea con etiquetas: #guerra #noticias #OSINT #geopolitica. Un tuit = un enlace." },
  { key: "telegram", name: "Telegram — canales", icon: Send, color: "text-electric", prefix: "TGC", intent: "telegram", hint: "Grupos y canales de noticias mundiales, juegos y estrategia." },
  { key: "discord", name: "Discord — servidores", icon: Hash, color: "text-electric", prefix: "DSR", hint: "Canales #enlaces o #general de servidores de juegos y estrategia." },
  { key: "reddit", name: "Reddit — subreddits", icon: MessageSquare, color: "text-amber", prefix: "RDT", hint: "r/espanol, r/geopolitica, r/Mexico, r/Argentina, r/Colombia, r/noticias..." },
  { key: "instagram", name: "Instagram — bio e historias", icon: Camera, color: "text-amber", prefix: "IGB", hint: "Enlace en tu bio + historia con el mensaje. Cambia el enlace cada semana." },
  { key: "tiktok", name: "TikTok — bio y comentarios", icon: Music2, color: "text-foreground", prefix: "TTB", hint: "Enlace en bio y en comentarios de vídeos de noticias y geopolítica." },
  { key: "yt-foros", name: "YouTube y foros", icon: Youtube, color: "text-foreground", prefix: "YTF", hint: "Comentarios de vídeos de noticias + foros de estrategia y simuladores." },
];

const LINKS_PER_PLATFORM = 10;
const USED_KEY = "vanguard_m100_used";
// QR de reclutamiento — URL canónica de producción (determinista, sin mismatch SSR)
const QR_URL = "https://vanguard-kq9r.vercel.app/?ref=VGD-QRCODE";

interface MissionData {
  mission: number;
  goal: number;
  shares: number;
  external: number;
  refVisits: number;
  sharesToday: number;
  players: number;
  playersToday: number;
  playerGoal: number;
  topLinks: { code: string; visits: number }[];
}

const EMPTY: MissionData = { mission: 0, goal: 100, shares: 0, external: 0, refVisits: 0, sharesToday: 0, players: 0, playersToday: 0, playerGoal: 100, topLinks: [] };

function readUsed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const arr = JSON.parse(localStorage.getItem(USED_KEY) || "[]");
    return Array.isArray(arr) ? arr.slice(0, 300) : [];
  } catch {
    return [];
  }
}

export function Mission100({ standalone = false }: { standalone?: boolean }) {
  const [data, setData] = useState<MissionData>(EMPTY);
  const [used, setUsed] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>("wa-grupos");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/visits", { cache: "no-store" });
      const json = await res.json();
      if (json && json.ok) {
        setData({
          mission: json.mission || 0,
          goal: json.goal || 100,
          shares: json.shares || 0,
          external: json.external || 0,
          refVisits: json.refVisits || 0,
          sharesToday: json.sharesToday || 0,
          players: json.players || 0,
          playersToday: json.playersToday || 0,
          playerGoal: json.playerGoal || 100,
          topLinks: Array.isArray(json.topLinks) ? json.topLinks : [],
        });
      }
    } catch {
      /* red parpadea: el contador se recupera solo */
    }
  }, []);

  useEffect(() => {
    // diferido: localStorage solo existe en cliente y la regla de hooks prohíbe
    // setState síncrono dentro del efecto
    const t0 = setTimeout(() => {
      setUsed(readUsed());
      refresh();
    }, 0);
    const t = setInterval(refresh, 25000);
    const onShare = () => refresh();
    const onPlayer = () => refresh();
    window.addEventListener("vanguard:share", onShare);
    window.addEventListener("vanguard:player", onPlayer);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
      window.removeEventListener("vanguard:share", onShare);
      window.removeEventListener("vanguard:player", onPlayer);
    };
  }, [refresh]);

  const links = useMemo(() => {
    const out: { code: string; msg: string; platform: Platform; index: number }[] = [];
    PLATFORMS.forEach((p, i) => {
      for (let j = 1; j <= LINKS_PER_PLATFORM; j++) {
        const code = `VGD-${p.prefix}${String(j).padStart(2, "0")}`;
        out.push({ code, msg: MESSAGES[(i * LINKS_PER_PLATFORM + j) % MESSAGES.length], platform: p, index: j });
      }
    });
    return out;
  }, []);

  const absoluteUrl = (code: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/?ref=${code}` : `/?ref=${code}`;

  const bumpShare = useCallback(() => {
    window.dispatchEvent(new CustomEvent("vanguard:share"));
    setData((d) => ({ ...d, mission: d.mission + 1, shares: d.shares + 1 }));
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "share" }),
    }).catch(() => {});
  }, []);

  const copy = useCallback(
    async (text: string, key: string, code: string) => {
      const done = () => {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1600);
        setUsed((prev) => {
          if (prev.includes(code)) return prev;
          const next = [...prev, code];
          localStorage.setItem(USED_KEY, JSON.stringify(next));
          return next;
        });
        bumpShare();
        toast.success(`Enlace ${code} copiado — pégalo y suma al contador`);
      };
      try {
        await navigator.clipboard.writeText(text);
        done();
      } catch {
        try {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          done();
        } catch {
          toast.error("No se pudo copiar — mantén pulsado el enlace para copiarlo a mano");
        }
      }
    },
    [bumpShare]
  );

  const openIntent = (intent: Intent, msg: string, url: string) => {
    const t = encodeURIComponent(`${msg} ${url}`);
    const u = encodeURIComponent(url);
    const map: Record<Intent, string> = {
      whatsapp: `https://wa.me/?text=${t}`,
      x: `https://twitter.com/intent/tweet?text=${t}`,
      telegram: `https://t.me/share/url?url=${u}&text=${encodeURIComponent(msg)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${encodeURIComponent(msg)}`,
    };
    window.open(map[intent], "_blank", "noopener,noreferrer");
    bumpShare();
  };

  const pct = Math.min(100, Math.round((data.mission / data.goal) * 100));
  const done = data.mission >= data.goal;
  const playersPct = Math.min(100, Math.round((data.players / data.playerGoal) * 100));
  const playersDone = data.players >= data.playerGoal;
  const maxTop = Math.max(1, ...data.topLinks.map((t) => t.visits));
  const qrWrapRef = useRef<HTMLDivElement>(null);

  const downloadQr = () => {
    const c = qrWrapRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = "vanguard-qr.png";
    a.click();
    toast.success("QR descargado — pégalo en tu estado o compártelo de móvil a móvil");
  };

  return (
    <section className="hud-panel p-5 md:p-6 mt-6 relative overflow-hidden" aria-label="Misión 100 enlaces">
      <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-60" aria-hidden />
      <div className="flex flex-wrap items-center gap-3">
        <Target className="w-6 h-6 text-amber" />
        <h2 className="font-orbitron text-base md:text-lg tracking-widest uppercase text-gradient">
          Misión 100 — enlaces y jugadores
        </h2>
        <span
          className={`ml-auto font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${
            done ? "border-green-hud/60 text-green-hud bg-green-hud/10" : "border-amber-hud/50 text-amber bg-amber/10"
          }`}
        >
          {done ? "Meta cumplida" : "En curso"}
        </span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
        {done
          ? "Los 100 enlaces están repartidos y la red sigue creciendo. Nueva meta: 250 — cada enlace nuevo multiplica el alcance."
          : "Orden doble del mando: repartir 100 enlaces Y reclutar 100 jugadores. Cada copia del arsenal suma enlaces; cada visitante que entra a la guerra suma jugadores — todo se ve aquí en vivo."}
      </p>

      {/* ===== barra de progreso global ===== */}
      <div className="mt-4">
        <div className="flex items-end justify-between font-mono">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tabular-nums ${done ? "text-green-hud" : "text-amber"}`}>
              {data.mission}
            </span>
            <span className="text-sm text-muted-foreground">/ {data.goal} enlaces</span>
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-electric animate-pulse" /> contador global en vivo
          </div>
        </div>
        <div className="mt-2 h-4 rounded-full bg-border/40 overflow-hidden border border-border" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-full rounded-full transition-all duration-700 ${done ? "bg-green-hud/80" : "bg-gradient-to-r from-amber-hud via-amber to-electric"}`}
            style={{ width: `${Math.max(3, pct)}%` }}
          />
        </div>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[10px] text-muted-foreground">
          <span><span className="text-amber font-bold">{data.shares}</span> comunidad</span>
          <span><span className="text-electric font-bold">{data.external}</span> motores y directorios</span>
          <span><span className="text-green-hud font-bold">{data.refVisits}</span> visitas traídas</span>
          <span><span className="text-foreground font-bold">{data.sharesToday}</span> enlaces hoy</span>
        </div>
      </div>

      {/* ===== barra gemela: JUGADORES EN LA GUERRA (reto extremo del mando) ===== */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-end justify-between font-mono">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold tabular-nums ${playersDone ? "text-green-hud" : "text-electric"}`}>
              {data.players}
            </span>
            <span className="text-sm text-muted-foreground">/ {data.playerGoal} jugadores</span>
          </div>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
            <Swords className="w-3 h-3 text-green-hud animate-pulse" /> agentes únicos dentro de la guerra
          </span>
        </div>
        <div className="mt-2 h-4 rounded-full bg-border/40 overflow-hidden border border-border" role="progressbar" aria-valuenow={playersPct} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={`h-full rounded-full transition-all duration-700 ${playersDone ? "bg-green-hud/80" : "bg-gradient-to-r from-electric via-green-hud to-amber"}`}
            style={{ width: `${Math.max(3, playersPct)}%` }}
          />
        </div>
        {data.players === 0 ? (
          <p className="mt-2 font-mono text-[10px] text-muted-foreground leading-relaxed">
            Reclutando la primera ola: cada QR escaneado y cada enlace pegado trae al siguiente jugador. El contador sube en vivo — aquí mismo.
          </p>
        ) : (
          data.playersToday > 0 && (
            <p className="mt-2 font-mono text-[10px] text-green-hud">+{data.playersToday} reclutados hoy</p>
          )
        )}
        {playersDone && (
          <div className="mt-3 border border-green-hud/50 bg-green-hud/10 rounded-md px-4 py-3 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-green-hud shrink-0" />
            <p className="text-xs font-mono text-green-hud tracking-wide">
              RETO CUMPLIDO — 100 JUGADORES EN LA GUERRA. La sala sigue abierta: a por 250.
            </p>
          </div>
        )}
      </div>

      {done && (
        <div className="mt-4 border border-green-hud/50 bg-green-hud/10 rounded-md px-4 py-3 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-green-hud shrink-0" />
          <p className="text-xs font-mono text-green-hud tracking-wide">
            MISIÓN CUMPLIDA — 100 ENLACES SUPERADOS. La red de reclutamiento sigue activa: nueva meta 250.
          </p>
        </div>
      )}

      {/* ===== ranking en vivo ===== */}
      <div className="mt-5 border border-border rounded-md p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-electric" />
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Top enlaces que traen gente — en vivo
          </h3>
        </div>
        {data.topLinks.length === 0 ? (
          <p className="mt-3 text-[11px] text-muted-foreground font-mono">
            Todavía no llega nadie por un enlace del arsenal. Copia el primero y aparece aquí.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.topLinks.map((t, i) => (
              <li key={t.code} className="flex items-center gap-3 font-mono text-[11px]">
                <span className={`w-5 text-right ${i === 0 ? "text-amber font-bold" : "text-muted-foreground"}`}>{i + 1}.</span>
                <span className="text-foreground font-bold tracking-wider w-28 truncate">{t.code}</span>
                <div className="flex-1 h-2 rounded-full bg-border/40 overflow-hidden">
                  <div className="h-full bg-electric/70 rounded-full" style={{ width: `${Math.max(6, (t.visits / maxTop) * 100)}%` }} />
                </div>
                <span className="text-green-hud font-bold w-12 text-right tabular-nums">{t.visits} visit.</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ===== arsenal: 10 plataformas x 10 enlaces ===== */}
      <div className="mt-5">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-amber" />
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Arsenal — {links.length} enlaces rastreados, uno por canal
          </h3>
        </div>

        <div className="mt-3 space-y-2">
          {PLATFORMS.map((p) => {
            const isOpen = open === p.key;
            const pLinks = links.filter((l) => l.platform.key === p.key);
            const pUsed = pLinks.filter((l) => used.includes(l.code)).length;
            const Icon = p.icon;
            return (
              <div key={p.key} className="border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : p.key)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
                  aria-expanded={isOpen}
                >
                  <Icon className={`w-4 h-4 ${p.color}`} />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-foreground">{p.name}</span>
                  <span className="ml-auto flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                    {pUsed > 0 && <span className="text-green-hud">{pUsed}/{LINKS_PER_PLATFORM} usados</span>}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-[10px] text-muted-foreground font-mono mb-3 leading-relaxed">{p.hint}</p>
                    <ul className="space-y-1.5">
                      {pLinks.map((l) => {
                        const isUsed = used.includes(l.code);
                        const isCopied = copiedKey === l.code;
                        return (
                          <li key={l.code} className={`flex items-center gap-2 rounded border px-2.5 py-2 ${isUsed ? "border-green-hud/30 bg-green-hud/5" : "border-border bg-background/40"}`}>
                            <span className="font-mono text-[10px] text-amber font-bold tracking-wider w-24 shrink-0">{l.code}</span>
                            <span className="font-mono text-[10px] text-muted-foreground truncate flex-1 hidden sm:inline">/?ref={l.code}</span>
                            <button
                              onClick={() => copy(`${l.msg} ${absoluteUrl(l.code)}`, l.code, l.code)}
                              className="shrink-0 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded border border-amber-hud/40 text-amber hover:bg-amber/10 transition-colors"
                              aria-label={`Copiar enlace ${l.code} con mensaje`}
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-green-hud" /> : <Copy className="w-3.5 h-3.5" />}
                              {isCopied ? "copiado" : "copiar"}
                            </button>
                            {p.intent && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openIntent(p.intent as Intent, l.msg, absoluteUrl(l.code))}
                                className="shrink-0 h-7 px-2 font-mono text-[10px] uppercase"
                                aria-label={`Abrir ${p.name} con el enlace ${l.code}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== QR de reclutamiento — para reclutar fuera de la red ===== */}
      <div className="mt-5 border border-border rounded-md p-4 flex items-center gap-4">
        <div ref={qrWrapRef} className="shrink-0 rounded-md overflow-hidden bg-[#f5f4ee] p-1.5" aria-label="Código QR de reclutamiento">
          <QRCodeCanvas value={QR_URL} size={104} bgColor="#f5f4ee" fgColor="#11150f" />
        </div>
        <div className="min-w-0">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            QR de reclutamiento — rastreado VGD-QRCODE
          </h3>
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
            Pégalo en tu estado de WhatsApp, imprímelo o muéstralo de móvil a móvil. Todo el que lo escanee entra directo a la guerra y suma como jugador.
          </p>
          <Button size="sm" variant="outline" onClick={downloadQr} className="mt-2 h-8 font-mono text-[10px] uppercase tracking-wider border-electric/40 text-electric hover:bg-electric/10">
            Descargar QR
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Flame className="w-3 h-3 text-amber" /> Cada visitante que entra por tu enlace recibe +50 monedas de bienvenida</span>
        {!standalone && (
          <a href="/mision" className="text-electric hover:underline inline-flex items-center gap-1">
            Centro de mando directo: /mision <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {standalone && (
          <a href="/" className="text-electric hover:underline inline-flex items-center gap-1">
            Volver al cuartel general <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </section>
  );
}
