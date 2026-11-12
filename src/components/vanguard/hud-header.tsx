"use client";

import { cn } from "@/lib/utils";
import { VanguardEmblem } from "@/components/vanguard/vanguard-logo";
import { getRankForLevel, xpForLevel } from "@/lib/game-data";
import { useGameStore } from "@/lib/game-store";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/vanguard/language-switcher";
import { LiveCounter } from "@/components/vanguard/presence-ping";
import Link from "next/link";
import { Coins, Gem, Flame, Zap, Settings, Activity, Volume2, VolumeX, Menu, X, Crown, UserRound, Compass, AudioLines, Sparkles, Box } from "lucide-react";
// v135.0 NEXUS-HYPNOS: el SONIDO DEL BÚNKER — atmósfera generativa que respira
// con el pulso del planeta (drone + estática de satélite + estación numérica)
import { iniciarBunker, pararBunker, bunkerActivo, setNivelBunker } from "@/lib/audio-bunker";
import { getTension } from "@/lib/tension";
const BUNKER_KEY = "vg-bunker-v135";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// v134.0 EL ESTRENO: MODO GUERRA ELIMINADO por orden del Dueño —
// atrapaba visitantes en pantalla negra (la lib ya solo guarda el filtro de contenido)
// v115.0 SINGULARIDAD: la FIRMA 3D de la FORJA luce junto al alias del HUD
import { useProfileStore } from "@/lib/profile-store";
import { TituloLetras3D } from "@/components/vanguard/letras-3d";
// v117.0 ATMÓSFERA: mini-noticiero 2100 rotativo (Sala de Lectura interna,
// cero enlaces externos) + chip vivo de EL ARQUITECTO (navega a su sala)
import { useArquitecto } from "@/lib/arquitecto";
import { navigateTo } from "@/lib/nav";
import { pedirNoticias } from "@/lib/noticias-cache";
import { esSalaNoticias, onSalaCambia } from "@/lib/semaforo-sala";
import type { CableLectura } from "@/components/vanguard/lector-noticia";
// v198.0 LA CASA LIGERA: la sala de lectura del HUD es un modal — su chunk
// baja cuando lo ABRES, no en el arranque de toda la casa
import dynamic from "next/dynamic";
const LectorNoticia = dynamic(
  () => import("@/components/vanguard/lector-noticia").then((m) => m.LectorNoticia),
  { ssr: false }
);
import { Radio, Bot } from "lucide-react";
// v232.0 LA CENTRAL DE ALARMAS — la campana viva de la Agencia en el HUD
import { CentralAlarmas } from "@/components/vanguard/central-alarmas";
// v126.0 LA CASA · ATELIER — la serie grabada del visitante (Ley de la artesanía)
// v133.0 EL ACABADO REAL — la placa luce el Nº de unidad de la EDICIÓN
// LIMITADA vigente (Ley de la escasez): cada visitante sale del taller
// con una pieza numerada del lote de la estación.
import { useLuxe } from "@/lib/luxe-store";
import { edicionVigente, unidadDeSerie } from "@/lib/luxe";

interface HudHeaderProps {
  onOpenSettings?: () => void;
  onOpenLog?: () => void;
  onOpenAccount?: () => void;
}

export function HudHeader({ onOpenSettings, onOpenLog, onOpenAccount }: HudHeaderProps) {
  const { coins, gems, xp, level, rank, streak, alias, boosts, muted, setMuted, account } = useGameStore();
  // v115: la firma 3D grabada en la FORJA acompaña al agente en el HUD
  const firma = useProfileStore((s) => s.firma);
  // v117: el ARQUITECTO respira en el HUD — ciclo vivo junto a la brújula
  const arqActivo = useArquitecto((s) => s.activo);
  const arqFase = useArquitecto((s) => s.fase);
  const arqCiclos = useArquitecto((s) => s.contadores.ciclos);
  const arqEnCurso = useArquitecto((s) => s.enCurso);
  // v117: mini-noticiero 2100 — titular rotativo de la casa, SIN salir de Vanguard
  const [cables, setCables] = useState<CableLectura[]>([]);
  const [idxNoti, setIdxNoti] = useState(0);
  const [lectorHud, setLectorHud] = useState<CableLectura | null>(null);
  const { t } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
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

  // v135 SONIDO DEL BÚNKER: interruptor del HUD. La preferencia se recuerda,
  // pero el arranque SIEMPRE es con gesto del usuario (política de autoplay):
  // si quedó «on», resucita en el primer toque que dé en la casa.
  const [bunkerOn, setBunkerOn] = useState(false);
  useEffect(() => {
    let queria = false;
    try { queria = localStorage.getItem(BUNKER_KEY) === "on"; } catch { /* sin storage */ }
    if (!queria) return;
    const resucitar = () => {
      if (!bunkerActivo()) {
        if (iniciarBunker()) {
          setNivelBunker(getTension() / 100);
          setBunkerOn(true);
        }
      }
      window.removeEventListener("pointerdown", resucitar);
    };
    window.addEventListener("pointerdown", resucitar, { once: true });
    return () => window.removeEventListener("pointerdown", resucitar);
  }, []);
  // el búnker sigue el pulso del planeta mientras suena
  useEffect(() => {
    if (!bunkerOn) return;
    setNivelBunker(getTension() / 100);
    const iv = window.setInterval(() => setNivelBunker(getTension() / 100), 12000);
    return () => window.clearInterval(iv);
  }, [bunkerOn]);
  const toggleBunker = () => {
    if (bunkerOn || bunkerActivo()) {
      pararBunker();
      setBunkerOn(false);
      try { localStorage.setItem(BUNKER_KEY, "off"); } catch { /* noop */ }
    } else {
      const ok = iniciarBunker();
      if (ok) {
        setNivelBunker(getTension() / 100);
        setBunkerOn(true);
        try { localStorage.setItem(BUNKER_KEY, "on"); } catch { /* noop */ }
      }
    }
  };

  // v117 MINI-NOTICIERO: 6 titulares de la casa, rotan cada 7 s — leerlos
  // abre la SALA DE LECTURA interna (portada 3D + contexto + NEURONA)
  // v198.0 SEMÁFORO DE SALA: el latido de 180s SOLO viaja si la sala donde
  // estás MUESTRA cables (inicio/noticias/centro/briefing...). En otra sala
  // (p.ej. ARCHIVO SECRETO) la red de noticias duerme: los cables ya
  // recogidos siguen rotando igual y al volver a una sala de noticias el
  // agua fresca llega AL INSTANTE (despertar y mirar, sin esperar el ciclo).
  useEffect(() => {
    let viva = true;
    const pide = async (forzar = false) => {
      try {
        if (forzar && (!esSalaNoticias() || document.hidden)) return;
        // v196: por el pozo único — misma agua para toda la casa
        const items = await pedirNoticias(forzar);
        if (!viva || !Array.isArray(items)) return;
        const cs: CableLectura[] = (items as Record<string, unknown>[]).slice(0, 8).map((it: Record<string, unknown>) => ({
          id: String(it.id ?? it.url ?? Math.random().toString(36).slice(2)),
          title: String(it.title ?? ""),
          url: String(it.url ?? ""),
          source: String(it.source ?? ""),
          publishedAt: String(it.publishedAt ?? new Date().toISOString()),
          tacticalTag: (it.tacticalTag as string) ?? null,
          conflictTag: (it.conflictTag as string) ?? null,
          sourceCountry: (it.sourceCountry as string) ?? null,
        })).filter((c) => c.title.length > 12).slice(0, 6);
        // v122 PRIORIDAD ALERTA: los cables marcados ALERTA/URGENTE van PRIMERO
        // en la rotación — la casa no entierra un ataque entre el ruido.
        cs.sort((a, b) => {
          const prio = (c: CableLectura) => (c.tacticalTag === "ALERTA" || c.tacticalTag === "URGENTE" ? 0 : 1);
          return prio(a) - prio(b);
        });
        if (cs.length > 0) setCables(cs);
      } catch {
        /* la casa no se queja: el noticiero espera la próxima señal */
      }
    };
    void pide();
    const bajaSala = onSalaCambia(() => { void pide(true); });
    const iv = setInterval(() => { void pide(true); }, 180_000);
    return () => { viva = false; clearInterval(iv); bajaSala(); };
  }, []);
  useEffect(() => {
    if (cables.length < 2) return;
    const iv = setInterval(() => setIdxNoti((i) => (i + 1) % cables.length), 7000);
    return () => clearInterval(iv);
  }, [cables.length]);
  // v126: la placa de serie grabada — pequeña, como las cosas bien hechas
  const serieLuxe = useLuxe((s) => s.serie);
  // v133: el Nº de unidad de la edición vigente — se calcula UNA vez tras
  // la hidratación (sin relojes vivos en render, contrato anti-#418 de v132)
  const [unidadLuxe, setUnidadLuxe] = useState<{ n: number; total: number; nombre: string } | null>(null);
  useEffect(() => {
    if (!serieLuxe) return;
    try {
      const ed = edicionVigente();
      setUnidadLuxe({ n: unidadDeSerie(serieLuxe, ed), total: ed.total, nombre: ed.nombre });
    } catch { /* la edición espera a la próxima señal */ }
  }, [serieLuxe]);
  // v122: el cable actual es una ALERTA → el noticiero se viste de rojo y avisa
  const cableHud = cables.length > 0 ? cables[idxNoti % cables.length] : null;
  const esAlerta = cableHud?.tacticalTag === "ALERTA" || cableHud?.tacticalTag === "URGENTE";

  return (
    <header className="sticky top-0 z-30 hud-panel border-b border-amber-hud">
      <div className="px-2 py-1.5 sm:px-4 sm:py-3">
        {/* Row 1: identity + currencies */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Logo / title */}
          <div className="flex items-center gap-1.5 sm:gap-2 mr-auto min-w-0">
            <div
              className="w-7 h-7 sm:w-10 sm:h-10 hud-corner flex-shrink-0 flex items-center justify-center v101-logo"
              title="VANGUARD · El Mundo, la Inteligencia y el Tiempo"
            >
              <VanguardEmblem size={40} idPrefix="hud-mark" className="w-full h-full" />
            </div>
            <div className="leading-tight min-w-0">
              {/* v139 3D BRUTAL: el wordmark ya no es texto — es un HOLOGRAMA
                  que gira solo (rotateY ±14° constante) con DOS capas fantasma
                  reales detrás (::before/::after a translateZ −16/−32px): al
                  girar, la profundidad se separa ante tus ojos. Sin truncate
                  (recorta las capas 3D); "VANGUARD" con tracking cabe en 360px. */}
              <div
                className="vg-holo-v139 font-caviar text-[12px] sm:text-lg font-bold tracking-[0.22em] text-amber nexus-letra"
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
                {/* v115.0 SINGULARIDAD: la FIRMA 3D de la FORJA junto al alias —
                    la identidad del agente con volumen real (volumen mínimo, sin peso) */}
                {firma && (
                  <span className="hidden md:inline-flex max-w-[190px] items-center overflow-hidden" title={`FIRMA 3D · ${firma.texto}`}>
                    <TituloLetras3D
                      texto={firma.texto}
                      acento={firma.acento}
                      material={firma.material}
                      profundidad={Math.min(4, firma.profundidad)}
                      className="text-[13px] leading-none"
                      etiqueta={firma.texto}
                    />
                  </span>
                )}
                {/* v126.0 LA CASA · ATELIER: la serie grabada del visitante —
                    pequeña, como deben ser las cosas bien hechas (Ley de la artesanía) */}
                {serieLuxe && (
                  <button
                    onClick={() => navigateTo("atelier")}
                    title={unidadLuxe ? `${unidadLuxe.nombre} · pieza Nº ${unidadLuxe.n} de ${unidadLuxe.total} — EL ATELIER` : "Tu placa de serie · EL ATELIER"}
                    className="hidden lg:inline-flex items-center gap-1 font-caviar text-[9px] tracking-[0.14em] opacity-45 hover:opacity-90 transition-opacity"
                    style={{ color: "var(--vg-sello, #D4AF37)" }}
                  >
                    · SERIE {serieLuxe}
                    {unidadLuxe && (
                      <span className="opacity-80">· Nº {String(unidadLuxe.n).padStart(4, "0")}/{unidadLuxe.total}</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* v117 MINI-NOTICIERO 2100 — titular rotativo de la casa (solo pantallas anchas) */}
          {cableHud && (
            <button
              onClick={() => setLectorHud(cableHud)}
              title={t("hud117.noticiero")}
              className="v117-noticiero group relative hidden min-w-0 max-w-[300px] flex-1 items-center gap-2 overflow-hidden rounded-sm border px-2 py-1 text-left transition-colors lg:flex"
              style={esAlerta
                ? { borderColor: "#FF3B3077", background: "rgba(255,59,48,0.12)" }
                : { borderColor: "#FF8A2A44", background: "rgba(255,138,42,0.05)" }}
            >
              <span className="flex shrink-0 items-center gap-1 font-mono text-[8px] font-bold tracking-[0.2em]" style={{ color: esAlerta ? "#FF3B30" : "#FF8A2A" }}>
                <Radio className={cn("h-3 w-3", esAlerta && "v117-parpadeo")} /> {esAlerta ? "ALERTA" : "2100"}
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={idxNoti}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                  className="truncate text-[10px] leading-tight text-foreground/80 transition-colors group-hover:text-foreground"
                >
                  {cableHud.title}
                </motion.span>
              </AnimatePresence>
            </button>
          )}

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
            {/* v232.0 LA CENTRAL DE ALARMAS — la campana de la Agencia: cables
                CRÍTICO+ recién nacidos avisan EN VIVO (toast + panel + lector) */}
            <CentralAlarmas />
            {/* v134.0: el botón del MODO GUERRA (versión ligera) se retiró del HUD —
                atrapaba visitantes en pantalla negra; la Casa ya no tiene modo oscuro */}
            {/* Acceso Directo Prominente al Modo 3D */}
            <Link
              href="/teatro-3d"
              title="Abrir Motor Táctico 3D: Edificios 3D, Escuadrones, Modo Libre y Máquina del Tiempo"
              aria-label="Abrir Modo 3D Teatro Total"
              className="h-6 sm:h-8 px-1.5 sm:px-2.5 hud-corner flex-shrink-0 flex items-center gap-1 border border-[#38BDF8] bg-[#38BDF8]/15 text-[#38BDF8] hover:bg-[#38BDF8] hover:text-black transition-colors font-mono text-[9px] sm:text-[10px] font-black tracking-wider"
            >
              <Box className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>3D</span>
            </Link>
            {/* Menú VANGUARD de Lo Nuevo + Links Directos + 10 Funciones Nuevas */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("vanguard:menu-novedades"))}
              title="Menú VANGUARD: Lo Nuevo, links directos y 10 funciones nuevas"
              aria-label="Menú VANGUARD Lo Nuevo"
              className="h-6 sm:h-8 px-1.5 sm:px-2.5 hud-corner flex-shrink-0 flex items-center gap-1 bg-[#FFC94D] text-black hover:bg-[#ffd66b] transition-colors font-mono text-[9px] sm:text-[10px] font-black tracking-wider"
            >
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline sm:inline">LO NUEVO</span>
            </button>
            {/* v105.0 EL NAVEGADOR: la brújula que responde "¿qué hago hoy?" — visible siempre */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("vanguard:navegador"))}
              title="¿Qué quieres hacer hoy? — el navegador de Vanguard"
              className="w-6 h-6 sm:w-8 sm:h-8 hud-corner flex-shrink-0 flex items-center justify-center border-amber-hud text-amber hover:bg-amber-hud transition-colors v105-brujula"
            >
              <Compass className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            {/* v117 CHIP DEL ARQUITECTO — el agente autónomo respira aquí mismo:
                ciclo actual y fase, un clic te lleva a su sala (sin recargar) */}
            {arqActivo && (
              <button
                onClick={() => navigateTo("arquitecto")}
                title={t("hud117.arq")}
                className="v117-chiparq hidden h-6 items-center gap-1 rounded-sm border px-1.5 font-mono text-[9px] font-bold tracking-wider transition-colors sm:flex sm:h-8"
                style={{ borderColor: "#FF5EDB66", background: "rgba(255,94,219,0.08)", color: "#FF5EDB" }}
              >
                <Bot className="h-3 w-3" />
                <span className="hidden md:inline">ARQ · C{arqCiclos}</span>
                <span
                  className={cn("inline-block h-1.5 w-1.5 rounded-full", arqEnCurso ? "v117-parpadeo" : "")}
                  style={{ background: arqEnCurso ? "#FF5EDB" : arqFase === "INSTALADO" ? "#34C759" : arqFase === "DORMIDO" ? "#8a8a9a" : "#FFC94D" }}
                />
              </button>
            )}
            <button
              onClick={toggleBunker}
              title={bunkerOn ? "Sonido del búnker ON · la atmósfera respira con la tensión del mundo (clic para apagar)" : "Sonido del búnker OFF · drone generativo + estática de satélite reactiva a la tensión global"}
              aria-pressed={bunkerOn}
              className={cn("w-6 h-6 sm:w-8 sm:h-8 hud-corner flex-shrink-0 flex items-center justify-center transition-colors", bunkerOn ? "border-cyan-hud text-cyan-hud v135-bunker-on" : "border-amber-hud text-amber hover:bg-amber-hud")}
            >
              <AudioLines className="w-3 h-3 sm:w-4 sm:h-4" />
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
              <span className="text-[9px] sm:text-xs font-mono font-bold text-amber nexus-num">L{level}</span>
            </div>
            <div className={cn("text-[9px] sm:text-xs font-bold font-mono uppercase tracking-wide nexus-letra-suave", rankInfo.color)}>
              {rank}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-1.5 sm:h-2 hud-corner bg-black/50 overflow-hidden border border-border/50">
              <motion.div
                className="h-full bg-gradient-to-r from-[#E8C56A] via-[#38BDF8] to-[#3DDC97]"
                style={{ boxShadow: "0 0 10px rgba(232, 197, 106,0.5)" }}
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

      {/* v117: la SALA DE LECTURA del noticiero del HUD — portal al body,
          misma sala interna que en INICIO (cero navegación externa) */}
      <LectorNoticia cable={lectorHud} onCerrar={() => setLectorHud(null)} />
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
        "nexus-btn3d flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 sm:py-1 rounded-sm border font-mono text-[10px] sm:text-sm font-bold nexus-num",
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
