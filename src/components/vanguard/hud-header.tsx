"use client";

import { cn } from "@/lib/utils";
import { getRankForLevel, xpForLevel } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/vanguard/language-switcher";
import { LiveCounter } from "@/components/vanguard/presence-ping";
import { Coins, Gem, Flame, Zap, Settings, Activity, Volume2, VolumeX, Menu, X, Crown, UserRound, SignalLow } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { suscribirModoGuerra, toggleModoGuerra } from "@/lib/modo-guerra";

interface HudHeaderProps {
  onOpenSettings?: () => void;
  onOpenLog?: () => void;
  onOpenAccount?: () => void;
}

export function HudHeader({ onOpenSettings, onOpenLog, onOpenAccount }: HudHeaderProps) {
  const { coins, gems, xp, level, rank, streak, alias, boosts, muted, setMuted, account } = useGameStore();
  const { t } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  // v86.0 MODO GUERRA: versión ligera para redes saturadas (2G/satélite)
  const [modoGuerra, setModoGuerra] = useState(false);
  useEffect(() => suscribirModoGuerra(setModoGuerra), []);
  const rankInfo = getRankForLevel(level);
  const needed = xpForLevel(level);
  const pct = Math.min(100, Math.round((xp / needed) * 100));
  const xpBoost = boosts.xpUntil && boosts.xpUntil > Date.now();
  const coinBoost = boosts.coinUntil && boosts.coinUntil > Date.now();

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    import("@/lib/sound").then(({ setMuted: setSoundMuted }) => {
      setSoundMuted(newMuted);
    });
  };

  return (
    <header className="sticky top-0 z-30 hud-panel border-b border-amber-hud">
      <div className="px-2 py-1.5 sm:px-4 sm:py-3">
        {/* Row 1: identity + currencies */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Logo / title */}
          <div className="flex items-center gap-1.5 sm:gap-2 mr-auto min-w-0">
            <div
              className="w-7 h-7 sm:w-10 sm:h-10 hud-corner flex-shrink-0 flex items-center justify-center v101-logo"
              style={{ background: "radial-gradient(circle at 50% 40%, #241a04 0%, #120c03 55%, #050508 100%)" }}
              title="VANGUARD · El Mundo, la Inteligencia y el Tiempo"
            >
              {/* v101.0 EL REGRESO: emblema total — el mundo con el ojo integrado,
                  la órbita del satélite (el tiempo) y la estrella de la vanguardia */}
              <svg viewBox="0 0 64 64" className="w-full h-full" aria-label="Emblema de Vanguard" role="img">
                <defs>
                  <linearGradient id="hud-oro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffe08a" />
                    <stop offset="45%" stopColor="#f5c542" />
                    <stop offset="100%" stopColor="#c98a10" />
                  </linearGradient>
                  <radialGradient id="hud-iris" cx="50%" cy="44%" r="58%">
                    <stop offset="0%" stopColor="#fff3c4" />
                    <stop offset="55%" stopColor="#f0b428" />
                    <stop offset="100%" stopColor="#8a5c06" />
                  </radialGradient>
                </defs>
                <ellipse cx="32" cy="33" rx="27" ry="11.5" fill="none" stroke="#8a6410" strokeWidth="1.6" opacity="0.7" transform="rotate(-24 32 33)" />
                <circle cx="54.2" cy="26.4" r="2.4" fill="#ffe08a" />
                <circle cx="32" cy="33" r="17.5" fill="#0e0a04" stroke="url(#hud-oro)" strokeWidth="2" />
                <ellipse cx="32" cy="33" rx="8.2" ry="17.5" fill="none" stroke="url(#hud-oro)" strokeWidth="1.4" opacity="0.8" />
                <path d="M14.5 33 H49.5" stroke="url(#hud-oro)" strokeWidth="1.4" opacity="0.8" />
                <path d="M20.5 33 Q32 24.5 43.5 33 Q32 41.5 20.5 33 Z" fill="#0d0304" stroke="#f5c542" strokeWidth="1.8" />
                <circle cx="32" cy="33" r="6.2" fill="url(#hud-iris)" />
                <circle cx="32" cy="33" r="2.6" fill="#050001" />
                <circle cx="29.9" cy="30.9" r="1.2" fill="#fff6e0" opacity="0.95" />
                <path d="M32 2.6 L33.4 7.8 L38.4 6.2 L35.2 10.3 L38.4 14.4 L33.4 12.8 L32 18 L30.6 12.8 L25.6 14.4 L28.8 10.3 L25.6 6.2 L30.6 7.8 Z" fill="url(#hud-oro)" />
              </svg>
            </div>
            <div className="leading-tight min-w-0">
              <div
                className="font-display text-[11px] sm:text-base font-black tracking-[0.2em] text-amber truncate glitch"
                data-text="VANGUARD"
              >
                VANGUARD
              </div>
              <div className="text-[8px] sm:text-xs text-muted-foreground font-mono uppercase truncate hidden xs:block sm:block">
                <button
                  onClick={onOpenAccount}
                  title={account ? t("hud.myAccount") : t("hud.login")}
                  className={cn(
                    "inline-flex items-center gap-1 px-1 rounded-sm transition-colors hover:text-foreground",
                    account?.isOwner && "text-amber font-bold"
                  )}
                >
                  {account?.isOwner ? (
                    <><Crown className="w-3 h-3" /> {t("hud.owner")}</>
                  ) : account ? (
                    <><UserRound className="w-3 h-3" /> {account.username}</>
                  ) : (
                    <><UserRound className="w-3 h-3" /> {alias || "AGENTE"} · {t("hud.enter")}</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Coins & gems - compact on mobile */}
          <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
            <CoinPill
              icon={<Coins className="w-2.5 h-2.5 sm:w-4 sm:h-4" />}
              value={account?.isOwner ? Infinity : coins}
              boosted={!!coinBoost}
              color="amber"
            />
            <CoinPill
              icon={<Gem className="w-2.5 h-2.5 sm:w-4 sm:h-4" />}
              value={account?.isOwner ? Infinity : gems}
              color="violet"
            />
            {/* Streak hidden on very small screens */}
            <div className="hidden xs:block sm:block">
              <CoinPill
                icon={<Flame className="w-2.5 h-2.5 sm:w-4 sm:h-4" />}
                value={streak}
                color="red"
                label={t("hud.streak")}
              />
            </div>
            {/* Action buttons - compact on mobile */}
            {/* v42: guerreros EN VIVO ahora mismo (presencia HTTP, no socket) */}
            <LiveCounter />
            {/* v21: selector de idioma (7 idiomas) */}
            <LanguageSwitcher />
            {/* v86.0 MODO GUERRA: protocolo de ancho de banda ultra-bajo */}
            <button
              onClick={() => {
                const activo = toggleModoGuerra();
                import("@/lib/sound").then(({ sfx }) => sfx.click());
              }}
              title={modoGuerra ? "MODO GUERRA activo: versión de puro texto para redes saturadas — toca para volver" : "MODO GUERRA: versión ligera de puro texto para 2G / satélite / batería baja"}
              aria-pressed={modoGuerra}
              className={cn(
                "w-6 h-6 sm:w-8 sm:h-8 hud-corner flex-shrink-0 flex items-center justify-center transition-colors",
                modoGuerra ? "border-red-hud text-red-hud bg-red-hud/25 blink-soft" : "border-amber-hud text-amber hover:bg-amber-hud"
              )}
            >
              <SignalLow className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={toggleMute}
              title={muted ? t("hud.soundOn") : t("hud.soundOff")}
              className="w-6 h-6 sm:w-8 sm:h-8 hud-corner flex-shrink-0 flex items-center justify-center border-amber-hud text-amber hover:bg-amber-hud transition-colors"
            >
              {muted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
            {/* On mobile: hamburger menu for settings/log, on desktop: individual buttons */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              title={t("hud.menu")}
              className="sm:hidden w-6 h-6 hud-corner flex-shrink-0 flex items-center justify-center border-amber-hud text-amber hover:bg-amber-hud transition-colors"
            >
              {menuOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
            </button>
            <button
              onClick={onOpenLog}
              title={t("hud.activity")}
              className="hidden sm:flex w-8 h-8 hud-corner flex-shrink-0 items-center justify-center border-amber-hud text-amber hover:bg-amber-hud transition-colors"
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              title={t("hud.settings")}
              className="hidden sm:flex w-8 h-8 hud-corner flex-shrink-0 items-center justify-center border-amber-hud text-amber hover:bg-amber-hud transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden overflow-hidden"
            >
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { onOpenLog?.(); setMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 hud-corner border-amber-hud text-amber hover:bg-amber-hud font-mono text-[10px] uppercase"
                >
                  <Activity className="w-3.5 h-3.5" /> {t("hud.record")}
                </button>
                <button
                  onClick={() => { onOpenSettings?.(); setMenuOpen(false); }}
                  className="flex-1 flex items-center justify-center gap-1.5 h-8 hud-corner border-amber-hud text-amber hover:bg-amber-hud font-mono text-[10px] uppercase"
                >
                  <Settings className="w-3.5 h-3.5" /> {t("hud.settings")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 2: Level + XP bar (always full width below) */}
        <div className="mt-1.5 flex items-center gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <div className="px-1 sm:px-1.5 py-0.5 hud-corner border-amber-hud bg-amber-hud/30">
              <span className="text-[9px] sm:text-xs font-mono font-bold text-amber">L{level}</span>
            </div>
            <div className={cn("text-[9px] sm:text-xs font-bold font-mono uppercase tracking-wide", rankInfo.color)}>
              {rank}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-1.5 sm:h-2 hud-corner bg-black/50 overflow-hidden border border-border/50">
              <motion.div
                className="h-full bg-gradient-to-r from-[#3EA6FF] via-[#38BDF8] to-[#00FF87]"
                style={{ boxShadow: "0 0 10px rgba(62,166,255,0.5)" }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
            </div>
          </div>
          <div className="text-[8px] sm:text-[10px] font-mono text-muted-foreground tabular-nums flex-shrink-0 flex items-center gap-1">
            {xpBoost && <span className="text-amber blink-soft"><Zap className="w-3 h-3 inline text-amber" />x2</span>}
            <span className="hidden sm:inline">{xp}/{needed}</span>
            <span className="sm:hidden">{pct}%</span>
          </div>
        </div>
      </div>
      {/* v16: línea de aurora bajo la cabecera */}
      <div className="hairline-gradient opacity-80" aria-hidden />
    </header>
  );
}

function CoinPill({
  icon,
  value,
  color,
  label,
  boosted,
}: {
  icon: React.ReactNode;
  value: number;
  color: "amber" | "violet" | "red";
  label?: string;
  boosted?: boolean;
}) {
  const colors = {
    amber: "text-amber border-amber-hud bg-amber-hud",
    violet: "text-violet-hud border-violet-hud bg-violet-hud",
    red: "text-red-hud border-red-hud bg-red-hud",
  };
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 sm:py-1 rounded-sm border font-mono text-[10px] sm:text-sm font-bold tabular-nums",
        colors[color],
        boosted && "blink-soft"
      )}
      title={label}
    >
      {icon}
      <span>{Number.isFinite(value) ? value.toLocaleString() : "∞"}</span>
      {boosted && <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
    </div>
  );
}
