"use client";

// Vanguard v195.0 TU LADO — REDES DE VANGUARD.
// La vitrina de la casa en el mundo: los canales oficiales (Telegram vivo
// ya), los que vienen (el Dueño pega su URL real y la tarjeta se enciende)
// y COMPARTIR VANGUARD con enlaces REALES que funcionan hoy — con recompensa
// de monedas por llevar gente a la casa (una vez cada 6h por red).
//
// Leyes: iconos SVG inline (cero bytes de red) · navegación interna solo por
// vanguard:navigate (v190) · nada se recarga solo.

import { useEffect, useState } from "react";
import { PanelHeader } from "@/components/vanguard/panel-header";
import {
  Share2, ExternalLink, Copy, Check, Coins, Link2, Send, MessagesSquare, Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game-store";
import { navigateTo } from "@/lib/nav";
import { sfx } from "@/lib/sound";
import { toast } from "sonner";
import {
  REDES_VANGUARD, ENLACES_COMPARTIR, APP_URL, TEXTO_COMPARTIR,
} from "@/lib/redes-data";

const LS_SHARES = "vg195-shares";
const ENFRIAMIENTO = 6 * 3600_000; // 6h por red

// ====== ICONOS DE MARCA EN SVG INLINE (cero bytes de red) ======
function IconoRed({ id, className }: { id: string; className?: string }) {
  const p = { fill: "currentColor", d: "" };
  switch (id) {
    case "telegram":
      return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...p} d="M21.9 4.6c.2-1-.7-1.7-1.5-1.3L2.7 10.1c-1 .4-1 1.4-.2 1.7l4.5 1.4 1.7 5.4c.3.8 1.1.9 1.6.3l2.3-2.2 4.6 3.4c.7.5 1.6.1 1.8-.8l2.9-14.7zM8.9 13.1l9.5-5.9c.3-.2.6.2.3.4l-7.8 7.2-.3 3-1.7-4.7z" /></svg>;
    case "tiktok":
      return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...p} d="M16.6 3c.4 2 1.8 3.5 3.9 3.7v3c-1.5 0-2.9-.5-3.9-1.2v6.2c0 3.2-2.6 5.8-5.8 5.8S5 17.9 5 14.7c0-3.1 2.5-5.7 5.6-5.8v3.1c-1.4.1-2.6 1.3-2.6 2.7 0 1.5 1.2 2.7 2.7 2.7s2.7-1.2 2.7-2.7V3h3.2z" /></svg>;
    case "youtube":
      return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...p} d="M21.6 7.2c-.2-1.3-1-2.2-2.3-2.4C17.3 4.5 12 4.5 12 4.5s-5.3 0-7.3.3C3.4 5 2.6 5.9 2.4 7.2 2.1 9.1 2.1 12 2.1 12s0 2.9.3 4.8c.2 1.3 1 2.2 2.3 2.4 2 .3 7.3.3 7.3.3s5.3 0 7.3-.3c1.3-.2 2.1-1.1 2.3-2.4.3-1.9.3-4.8.3-4.8s0-2.9-.3-4.8zM10 15V9l5.2 3L10 15z" /></svg>;
    case "x":
      return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...p} d="M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L2 3h6.4l4.4 5.9L17.8 3zm-1.1 16.1h1.7L7.4 4.7H5.6l11.1 14.4z" /></svg>;
    case "instagram":
      return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" /></svg>;
    case "discord":
      return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...p} d="M19.6 5.6c-1.4-.7-2.9-1.1-4.4-1.3l-.5 1c-1.1-.2-2.3-.2-3.4 0l-.5-1c-1.5.2-3 .6-4.4 1.3C3.5 9.7 2.7 13.6 3 17.5c1.6 1.2 3.2 1.9 4.8 2.4l1-1.6c-.5-.2-1.1-.5-1.6-.8l.4-.3c3 1.4 6.2 1.4 9.2 0l.4.3c-.5.3-1.1.6-1.6.8l1 1.6c1.6-.5 3.2-1.2 4.8-2.4.4-4.5-.6-8.4-3.8-11.9zM9.3 14.9c-.9 0-1.6-.8-1.6-1.9s.7-1.9 1.6-1.9 1.6.9 1.6 1.9c0 1.1-.7 1.9-1.6 1.9zm5.4 0c-.9 0-1.6-.8-1.6-1.9s.7-1.9 1.6-1.9 1.6.9 1.6 1.9c0 1.1-.7 1.9-1.6 1.9z" /></svg>;
    case "twitch":
      return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...p} d="M4.3 3L3 6.4v13.9h4.7V22h2.6l2.6-2.6h4L21 15.3V3H4.3zm14.9 11.4l-3 3h-4.7l-2.6 2.6v-2.6H5.2V4.7h14v9.7zM16.4 7.6v5.2h-1.7V7.6h1.7zm-4.6 0v5.2h-1.7V7.6h1.7z" /></svg>;
    case "whatsapp":
      return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...p} d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm0 2a7 7 0 1 1-3.6 13l-.4-.2-2.7.7.7-2.6-.3-.4A7 7 0 0 1 12 5zm-2.7 3.6c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.9 4.5 3.9 2.2.9 2.7.7 3.1.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.2-.3-.3-.6-.4l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.5-.7-2.3-1.5-.6-.6-1-1.3-1.2-1.5-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5L9.9 9c-.2-.4-.4-.4-.6-.4z" /></svg>;
    case "kick":
      return <svg viewBox="0 0 24 24" className={className} aria-hidden="true"><path {...p} d="M3 3h7v4h2V5h2V3h7v7h-2v2h2v2h2v7h-7v-2h-2v-2h-2v4H3V3zm5 5v8h2v-2h2v2h2v-2h-2v-2h2V8h-2v2h-2V8H8z" /></svg>;
    default:
      return <Link2 className={className} aria-hidden="true" />;
  }
}

export function RedesPanel() {
  const addCoins = useGameStore((s) => s.addCoins);
  const [copiado, setCopiado] = useState(false);
  const [shares, setShares] = useState<Record<string, number>>({});

  useEffect(() => {
    const t = setTimeout(() => {
      try { setShares(JSON.parse(localStorage.getItem(LS_SHARES) ?? "{}")); } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const compartir = (id: string, nombre: string, construir: (t: string, l: string) => string) => {
    sfx.coin();
    const url = construir(TEXTO_COMPARTIR, APP_URL);
    window.open(url, "_blank", "noopener,noreferrer");
    const ultima = shares[id] ?? 0;
    if (Date.now() - ultima > ENFRIAMIENTO) {
      const next = { ...shares, [id]: Date.now() };
      try { localStorage.setItem(LS_SHARES, JSON.stringify(next)); } catch {}
      setShares(next);
      addCoins(5, "Llevaste a alguien a la casa");
      toast.success(`Gracias por llevar a la casa: +5 monedas (${nombre})`);
    }
  };

  const copiarEnlace = async () => {
    sfx.click();
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopiado(true);
      toast.success("Enlace copiado: repártelo donde quieras");
      const ultima = shares.copiar ?? 0;
      if (Date.now() - ultima > ENFRIAMIENTO) {
        const next = { ...shares, copiar: Date.now() };
        try { localStorage.setItem(LS_SHARES, JSON.stringify(next)); } catch {}
        setShares(next);
        addCoins(5, "Enlace de la casa copiado");
      }
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.error("El navegador bloqueó el portapapeles");
    }
  };

  const oficiales = REDES_VANGUARD.filter((r) => r.estado === "OFICIAL").length;

  return (
    <div className="max-w-4xl mx-auto pb-20" data-vg195-redes="raiz">
      <PanelHeader
        title="REDES DE VANGUARD"
        subtitle="La casa en el mundo: sigue a Vanguard, trae a tu gente y gana monedas"
        icon={<Share2 className="w-4 h-4" />}
        color="cyan"
        right={
          <Button
            onClick={() => navigateTo("telegram")}
            variant="outline"
            className="font-mono text-[10px] uppercase tracking-widest border-cyan-hud/50 text-cyan-200 hover:bg-cyan-hud/15"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Sala Telegram
          </Button>
        }
      />

      {/* CANALES */}
      <div className="flex items-center gap-2 mb-2">
        <MessagesSquare className="w-3.5 h-3.5 text-cyan-hud" />
        <h3 className="font-display text-xs font-bold uppercase tracking-widest text-foreground">
          Los canales de la casa
        </h3>
        <span className="text-[9px] font-mono text-muted-foreground">{oficiales} oficial(es) · {REDES_VANGUARD.length - oficiales} en camino</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-5">
        {REDES_VANGUARD.map((r) => (
          <div
            key={r.id}
            className={cn(
              "rounded-sm border p-3 bg-secondary/30 transition-colors",
              r.estado === "OFICIAL" ? "border-border" : "border-border/40"
            )}
            style={r.estado === "OFICIAL" ? { borderColor: `${r.color}77`, boxShadow: `0 0 14px ${r.color}18` } : undefined}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className="grid place-items-center w-8 h-8 rounded-sm border shrink-0"
                style={{ borderColor: `${r.color}55`, background: `${r.color}12`, color: r.color }}
              >
                <IconoRed id={r.id} className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="font-display text-[12px] font-bold tracking-wide text-foreground truncate">{r.nombre}</div>
                <div className="text-[9px] font-mono text-muted-foreground truncate">{r.handle}</div>
              </div>
            </div>
            <p className="text-[9px] font-mono text-muted-foreground leading-relaxed mb-2">{r.desc}</p>
            {r.estado === "OFICIAL" && r.url ? (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[28px] px-2 rounded-sm border font-mono text-[9px] uppercase tracking-widest transition-colors w-full justify-center"
                style={{ borderColor: `${r.color}66`, color: r.color, background: `${r.color}0d` }}
              >
                <ExternalLink className="w-3 h-3" /> Abrir canal oficial
              </a>
            ) : (
              <div className="text-center min-h-[28px] flex items-center justify-center border border-dashed border-border/40 rounded-sm font-mono text-[9px] uppercase tracking-widest text-muted-foreground/70">
                Próximamente
              </div>
            )}
          </div>
        ))}
      </div>

      {/* COMPARTIR */}
      <div className="flex items-center gap-2 mb-2">
        <Radio className="w-3.5 h-3.5 text-amber" />
        <h3 className="font-display text-xs font-bold uppercase tracking-widest text-foreground">
          Comparte Vanguard al mundo
        </h3>
        <span className="text-[9px] font-mono text-muted-foreground inline-flex items-center gap-1">
          <Coins className="w-3 h-3 text-amber" /> +5 mon por red cada 6h
        </span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
        {ENLACES_COMPARTIR.map((e) => (
          <button
            key={e.id}
            onClick={() => compartir(e.id, e.nombre, e.url)}
            className="rounded-sm border border-border/50 bg-black/30 p-2 min-h-[56px] flex flex-col items-center justify-center gap-1 transition-colors hover:bg-black/50"
            aria-label={`Compartir Vanguard por ${e.nombre}`}
          >
            <IconoRed id={e.id} className="w-4 h-4" />
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: e.color }}>
              {e.nombre}
            </span>
          </button>
        ))}
        <button
          onClick={copiarEnlace}
          className="rounded-sm border border-border/50 bg-black/30 p-2 min-h-[56px] flex flex-col items-center justify-center gap-1 transition-colors hover:bg-black/50"
          aria-label="Copiar el enlace de Vanguard"
        >
          {copiado ? <Check className="w-4 h-4 text-green-hud" /> : <Copy className="w-4 h-4 text-foreground" />}
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {copiado ? "Copiado" : "Copiar"}
          </span>
        </button>
      </div>

      <div className="text-[9px] font-mono text-muted-foreground/70 leading-relaxed border-t border-border/40 pt-2">
        Los canales marcados PRÓXIMAMENTE quedan listos para el estreno: en cuanto el Dueño abra cada red oficial,
        su tarjeta se enciende sola. Los enlaces de compartir funcionan ya — la casa crece con la gente que trae.
      </div>
    </div>
  );
}
