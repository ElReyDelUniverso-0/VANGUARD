"use client";

// v18 CRECIMIENTO: modulo viral para convertir jugadores en embajadores.
// 1) COMPARTIR: botones nativos (WhatsApp/X/Telegram/Facebook/copiar) con
//    mensajes precocinados — cada usuario trae a su circulo.
// 2) CODIGO DE REFERIDO: cada agente tiene un codigo propio; compartirlo da
//    recompensas cuando un amigo se une.
// 3) INSTALAR APP: PWA instalable en movil/escritorio (retencion diaria).

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { toast } from "sonner";
import {
  Share2, Copy, Download, Users, TrendingUp, Gift,
  MessageCircle, Send, Link2, Check, Globe2, Radar, Swords,
} from "lucide-react";
import { ViralCard } from "./viral-card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// v20: URL absoluta solo en cliente (tras hidratación) para evitar mismatch SSR;
// en servidor y primer render se usa ruta relativa.
const SHARE_TEXT =
  "Estoy jugando VANGUARD: el mundo en tiempo real — noticias de guerra en vivo, mapa OSINT 3D, guerra global multijugador y ranking ELO. Entra conmigo:";

export function GrowthShare() {
  const alias = useGameStore((s) => s.alias);
  const addCoins = useGameStore((s) => s.addCoins);
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  // contador persistente de invitaciones compartidas (mision viral)
  const [invited, setInvited] = useState(() => {
    if (typeof window === "undefined") return 0;
    const n = parseInt(localStorage.getItem("vanguard_shares") || "0", 10);
    return Number.isFinite(n) ? n : 0;
  });

  // captura el evento de instalacion PWA del navegador
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const referral = `VGD-${(alias || "AGENTE").replace(/[^A-Z0-9]/gi, "").slice(0, 6).toUpperCase() || "AGENTE"}`;
  // ruta relativa (estable en SSR e hidratación); la URL absoluta se construye solo en eventos
  const sharePath = `/?ref=${referral}`;
  const absoluteShareUrl = () => (typeof window !== "undefined" ? `${window.location.origin}${sharePath}` : sharePath);

  const markCopied = (key: string) => {
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };

  const copy = useCallback(
    async (text: string, key: string, msg: string) => {
      try {
        await navigator.clipboard.writeText(text);
        markCopied(key);
        toast.success(msg);
      } catch {
        // fallback navegador antiguo
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        markCopied(key);
        toast.success(msg);
      }
    },
    []
  );

  const shareCountUp = () => {
    const n = invited + 1;
    setInvited(n);
    localStorage.setItem("vanguard_shares", String(n));
    // recompensa cada 3 compartidas: reclutador de élite
    if (n % 3 === 0) {
      addCoins(100, "Mision viral: 3 invitaciones compartidas");
      toast.success("+100 monedas — Reclutador de élite");
    }
  };

  const openShare = (network: "whatsapp" | "x" | "telegram" | "facebook") => {
    const shareUrl = absoluteShareUrl();
    const text = encodeURIComponent(`${SHARE_TEXT} ${shareUrl}`);
    const url = encodeURIComponent(shareUrl);
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${text}`,
      x: `https://twitter.com/intent/tweet?text=${text}`,
      telegram: `https://t.me/share/url?url=${url}&text=${encodeURIComponent(SHARE_TEXT)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(SHARE_TEXT)}`,
    };
    window.open(links[network], "_blank", "noopener,noreferrer");
    shareCountUp();
  };

  const nativeShare = async () => {
    const shareUrl = absoluteShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: "VANGUARD — El mundo en tiempo real", text: SHARE_TEXT, url: shareUrl });
        shareCountUp();
      } catch {
        /* cancelado por el usuario */
      }
    } else {
      copy(`${SHARE_TEXT} ${shareUrl}`, "native", "Enlace copiado para compartir");
    }
  };

  const installApp = async () => {
    if (!installEvt) {
      toast.info("Usa el menú del navegador → «Añadir a pantalla de inicio»");
      return;
    }
    await installEvt.prompt();
    const res = await installEvt.userChoice;
    if (res.outcome === "accepted") toast.success("VANGUARD instalada. Bienvenido al mando, agente.");
    setInstallEvt(null);
  };

  const networks = [
    { key: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle, cls: "text-green-hud border-green-hud/40 hover:bg-green-hud/10" },
    { key: "x" as const, label: "X / Twitter", icon: Share2, cls: "text-foreground border-border hover:bg-white/5" },
    { key: "telegram" as const, label: "Telegram", icon: Send, cls: "text-electric border-electric/40 hover:bg-electric/10" },
    { key: "facebook" as const, label: "Facebook", icon: Globe2, cls: "text-amber border-amber-hud/40 hover:bg-amber/10" },
  ];

  return (
    <>
    <section className="mt-6 grid gap-4 md:grid-cols-3" aria-label="Crecimiento y comunidad">
      {/* ===== COMPARTIR ===== */}
      <div className="hud-panel p-5 flex flex-col gap-4 relative overflow-hidden">
        <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-60" aria-hidden />
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-electric" />
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-gradient">Lleva VANGUARD al mundo</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          La plataforma crece contigo: cada agente que invita suma poder a la alianza.
          Comparte y gana <span className="text-amber font-bold">+100 monedas</span> cada 3 invitaciones enviadas.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {networks.map(({ key, label, icon: Icon, cls }) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => openShare(key)}
              className={`justify-start gap-2 h-10 font-mono text-[11px] uppercase tracking-wider ${cls}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </Button>
          ))}
        </div>
        <Button onClick={nativeShare} className="w-full font-mono text-xs uppercase tracking-widest gap-2" size="sm">
          <Share2 className="w-4 h-4" /> Compartir invitación
        </Button>
        <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-electric" />
          Invitaciones enviadas: <span className="text-green-hud font-bold">{invited}</span>
          {invited > 0 && invited % 3 !== 0 && <span className="text-amber">· faltan {3 - (invited % 3)} para el bono</span>}
        </div>
      </div>

      {/* ===== REFERIDOS ===== */}
      <div className="hud-panel p-5 flex flex-col gap-4 relative overflow-hidden">
        <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-60" aria-hidden />
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber" />
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-gradient">Tu código de agente</h3>
        </div>
        <button
          onClick={() => copy(referral, "ref", "Código de referido copiado")}
          className="group border border-dashed border-amber-hud/50 rounded-md py-3 px-4 flex items-center justify-between gap-2 hover:bg-amber/5 transition-colors"
          aria-label={`Copiar código de referido ${referral}`}
        >
          <span className="font-mono text-lg font-bold text-amber tracking-[0.25em]">{referral}</span>
          {copied === "ref" ? <Check className="w-4 h-4 text-green-hud" /> : <Copy className="w-4 h-4 text-muted-foreground group-hover:text-amber" />}
        </button>
        <button
          onClick={() => copy(absoluteShareUrl(), "url", "Enlace con tu código copiado")}
          className="group border border-border rounded-md py-2.5 px-4 flex items-center justify-between gap-2 hover:bg-electric/5 transition-colors"
          aria-label="Copiar enlace de invitación"
        >
          <span className="font-mono text-[10px] text-muted-foreground truncate">{sharePath}</span>
          {copied === "url" ? <Check className="w-4 h-4 text-green-hud shrink-0" /> : <Link2 className="w-4 h-4 text-muted-foreground group-hover:text-electric shrink-0" />}
        </button>
        <ul className="text-[11px] text-muted-foreground space-y-1.5 font-mono">
          <li className="flex gap-2"><span className="text-green-hud">▸</span> Tu amigo entra con bono de bienvenida extra</li>
          <li className="flex gap-2"><span className="text-electric">▸</span> Tú ganas <span className="text-amber">+100 monedas</span> por cada 3 invitaciones</li>
          <li className="flex gap-2"><span className="text-amber">▸</span> A más agentes, mayores torneos y crisis globales</li>
        </ul>
      </div>

      {/* ===== INSTALAR + RANKING SEO ===== */}
      <div className="hud-panel p-5 flex flex-col gap-4 relative overflow-hidden">
        <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-60" aria-hidden />
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-green-hud" />
          <h3 className="font-orbitron text-sm tracking-widest uppercase text-gradient">Instala el cuartel general</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Lleva VANGUARD a tu pantalla de inicio: abre en un toque, avisos de crisis en vivo y sin perder tu racha nunca más.
        </p>
        <Button onClick={installApp} size="sm" className="w-full font-mono text-xs uppercase tracking-widest gap-2 border border-green-hud/40 bg-green-hud/10 hover:bg-green-hud/20 text-green-hud" variant="outline">
          <Download className="w-4 h-4" /> Instalar app gratis
        </Button>
        {/* bloque semántico rico para rastreadores: refuerza palabras clave */}
        <div className="text-[10px] text-muted-foreground/80 leading-relaxed font-mono border-t border-border pt-3">
          <span className="inline-flex items-center gap-1 mr-2"><Radar className="w-3 h-3 text-electric inline" />Referencia del sector:</span>
          conflictos mundiales en vivo · mapa de guerra 3D · noticias de conflictos hoy ·
          tensión global · guerras históricas · inteligencia OSINT abierta · simulador militar ·
          <span className="inline-flex items-center gap-1 mt-1"><Swords className="w-3 h-3 text-amber inline" />juego estratégico multijugador de geopolítica en español.</span>
        </div>
      </div>
    </section>
    <ViralCard />
    </>
  );
}
