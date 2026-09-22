"use client";

// VANGUARD v17 — MULTIJUGADOR TERMINADO + MOTOR DE CARGA RAPIDA.
// v17 RENDIMIENTO: los paneles ahora se cargan con code-splitting perezoso
// (next/dynamic ssr:false). El bundle inicial solo contiene la portada + nav;
// cada módulo pesado (3D, bolsa, wiki...) baja su propio chunk al visitarlo.
// v17 ESTABILIDAD: PanelErrorBoundary aísla fallos por panel — un módulo caído
// ya NO tumba la app; tarjeta de recuperación con REINTENTAR por módulo.

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { HudHeader } from "@/components/vanguard/hud-header";
import { TabNav, type TabKey } from "@/components/vanguard/tab-nav";
import { APP_VERSION_LABEL, APP_VERSION } from "@/lib/version";
import { PanelErrorBoundary } from "@/components/vanguard/panel-error-boundary";
import { BootScreen } from "@/components/vanguard/boot-screen";
import { DailyLoginModal } from "@/components/vanguard/daily-login-modal";
import { SettingsModal } from "@/components/vanguard/settings-modal";
import { ActivityLogModal } from "@/components/vanguard/activity-log-modal";
import { StatsTicker } from "@/components/vanguard/stats-ticker";
import { motion, AnimatePresence } from "framer-motion";
// v14: reestructuración — portada INICIO con noticias primero + menú llamativo
import { HomePanel } from "@/components/vanguard/home-panel";
import { MegaMenu } from "@/components/vanguard/mega-menu";
import { AccountModal } from "@/components/vanguard/account-modal";
import { useGameStore } from "@/lib/game-store";
import { useT } from "@/lib/i18n";
import { initSound, sfx } from "@/lib/sound";
// v18 CRECIMIENTO: modulo viral en la portada (compartir + referidos + PWA)
import { GrowthShare } from "@/components/vanguard/growth-share";
// v26 RADIO VANGUARD: música de conflicto global (widget flotante, solo cliente)
const MusicPlayer = dynamic(() => import("@/components/vanguard/music-player").then((m) => m.MusicPlayer), { ssr: false });
const ConnectionWatchdog = dynamic(() => import("@/components/vanguard/connection-watchdog").then((m) => m.ConnectionWatchdog), { ssr: false });
// v32 CIELO DE ACERO: badge global del estado del socket multijugador
const RealtimeStatus = dynamic(() => import("@/components/realtime-status").then((m) => m.RealtimeStatus), { ssr: false });
// v33 ESCUELA DE GUERRA — manual del comandante
const TutorialModal = dynamic(() => import("@/components/vanguard/tutorial-modal").then((m) => m.TutorialModal), { ssr: false });

// ============ MOTOR DE CARGA PEREZOSA v17 ============
function PanelSkeleton() {
  return (
    <div className="hud-panel p-10 flex flex-col items-center justify-center gap-3 text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-electric blink-soft" />
        <span className="w-2 h-2 rounded-full bg-electric blink-soft" style={{ animationDelay: "0.2s" }} />
        <span className="w-2 h-2 rounded-full bg-electric blink-soft" style={{ animationDelay: "0.4s" }} />
      </span>
      Cargando módulo...
    </div>
  );
}
// NOTA Next 16: las opciones de dynamic() deben ir inline en cada llamada
// (no se puede compartir un objeto literal entre llamadas).

// PORTADA / INICIO
const NewsPanel = dynamic(() => import("@/components/vanguard/panels/news-panel").then((m) => m.NewsPanel), { ssr: false, loading: PanelSkeleton });
const DailyBriefingPanel = dynamic(() => import("@/components/vanguard/panels/daily-briefing-panel").then((m) => m.DailyBriefingPanel), { ssr: false, loading: PanelSkeleton });
const MapPanel = dynamic(() => import("@/components/vanguard/panels/map-panel").then((m) => m.MapPanel), { ssr: false, loading: PanelSkeleton });
const MissionsPanel = dynamic(() => import("@/components/vanguard/panels/missions-panel").then((m) => m.MissionsPanel), { ssr: false, loading: PanelSkeleton });

// JUEGO
const WorldConquestPanel = dynamic(() => import("@/components/vanguard/panels/world-conquest-panel").then((m) => m.WorldConquestPanel), { ssr: false, loading: PanelSkeleton });
const MultiplayerPanel = dynamic(() => import("@/components/vanguard/panels/multiplayer-panel").then((m) => m.MultiplayerPanel), { ssr: false, loading: PanelSkeleton });
const DetectivePanel = dynamic(() => import("@/components/vanguard/panels/detective-panel").then((m) => m.DetectivePanel), { ssr: false, loading: PanelSkeleton });
const DroneStrikePanel = dynamic(() => import("@/components/vanguard/drone-strike-3d").then((m) => m.DroneStrikePanel), { ssr: false, loading: PanelSkeleton });
const MiniGamePanel = dynamic(() => import("@/components/vanguard/panels/minigame-panel").then((m) => m.MiniGamePanel), { ssr: false, loading: PanelSkeleton });
const CombatSimulatorPanel = dynamic(() => import("@/components/vanguard/panels/combat-simulator-panel").then((m) => m.CombatSimulatorPanel), { ssr: false, loading: PanelSkeleton });
const CountryControlPanel = dynamic(() => import("@/components/vanguard/panels/country-control-panel").then((m) => m.CountryControlPanel), { ssr: false, loading: PanelSkeleton });
const AgeOfNationsPanel = dynamic(() => import("@/components/vanguard/panels/age-of-nations-panel").then((m) => m.AgeOfNationsPanel), { ssr: false, loading: PanelSkeleton });
const ArcadePanel = dynamic(() => import("@/components/vanguard/panels/arcade-panel").then((m) => m.ArcadePanel), { ssr: false, loading: PanelSkeleton });

// v19 MUNDO EXPANDIDO: frentes tácticos, estudio de video, divisas mundiales, perfil
const FrentePanel = dynamic(() => import("@/components/vanguard/panels/frente-panel").then((m) => m.FrentePanel), { ssr: false, loading: PanelSkeleton });
const EstudioPanel = dynamic(() => import("@/components/vanguard/panels/estudio-panel").then((m) => m.EstudioPanel), { ssr: false, loading: PanelSkeleton });
// v22 DIRECTOS EN VIVO: streaming con donaciones
const DirectosPanel = dynamic(() => import("@/components/vanguard/panels/directos-panel").then((m) => m.DirectosPanel), { ssr: false, loading: PanelSkeleton });
// v23 EN VIVO MUNDIAL (streaming real) + COMUNIDAD DE CONTRIBUIDORES
const EnVivoPanel = dynamic(() => import("@/components/vanguard/panels/en-vivo-panel").then((m) => m.EnVivoPanel), { ssr: false, loading: PanelSkeleton });
const ContribuidoresPanel = dynamic(() => import("@/components/vanguard/panels/contribuidores-panel").then((m) => m.ContribuidoresPanel), { ssr: false, loading: PanelSkeleton });
// v25 MEMES GEOPOLÍTICOS — estudio de memes con galería comunitaria
const MemeStudioPanel = dynamic(() => import("@/components/vanguard/panels/meme-studio-panel").then((m) => m.MemeStudioPanel), { ssr: false, loading: PanelSkeleton });
// v26 COMUNIDAD CREADORA — todo lo sube la gente
const CreadorPanel = dynamic(() => import("@/components/vanguard/panels/creador-panel").then((m) => m.CreadorPanel), { ssr: false, loading: PanelSkeleton });
const ArmeriaPanel = dynamic(() => import("@/components/vanguard/panels/armeria-panel").then((m) => m.ArmeriaPanel), { ssr: false, loading: PanelSkeleton });
const GMapsPanel = dynamic(() => import("@/components/vanguard/panels/gmaps-panel").then((m) => m.GMapsPanel), { ssr: false, loading: PanelSkeleton });
const StudiosPanel = dynamic(() => import("@/components/vanguard/panels/studios-panel").then((m) => m.StudiosPanel), { ssr: false, loading: PanelSkeleton });
const GobiernoPanel = dynamic(() => import("@/components/vanguard/panels/gobierno-panel").then((m) => m.GobiernoPanel), { ssr: false, loading: PanelSkeleton });
const BolsaPanel = dynamic(() => import("@/components/vanguard/panels/bolsa-panel").then((m) => m.BolsaPanel), { ssr: false, loading: PanelSkeleton });
// v28 PARA TI — feed vertical estilo TikTok con el contenido de la comunidad
const ForYouPanel = dynamic(() => import("@/components/vanguard/panels/foryou-panel").then((m) => m.ForYouPanel), { ssr: false, loading: PanelSkeleton });
// v24 VERDAD CRUDA — el lado oscuro de los conflictos
const AbusosPanel = dynamic(() => import("@/components/vanguard/panels/abusos-panel").then((m) => m.AbusosPanel), { ssr: false, loading: PanelSkeleton });
const IncidentesPanel = dynamic(() => import("@/components/vanguard/panels/incidentes-panel").then((m) => m.IncidentesPanel), { ssr: false, loading: PanelSkeleton });
const MemorialPanel = dynamic(() => import("@/components/vanguard/panels/memorial-panel").then((m) => m.MemorialPanel), { ssr: false, loading: PanelSkeleton });
const SalaRojaPanel = dynamic(() => import("@/components/vanguard/panels/sala-roja-panel").then((m) => m.SalaRojaPanel), { ssr: false, loading: PanelSkeleton });
const DronGuerraPanel = dynamic(() => import("@/components/vanguard/panels/dronguerra-panel").then((m) => m.DronGuerraPanel), { ssr: false, loading: PanelSkeleton });
const ReclutamientoPanel = dynamic(() => import("@/components/vanguard/panels/reclutamiento-panel").then((m) => m.ReclutamientoPanel), { ssr: false, loading: PanelSkeleton });
const EmbajadoresPanel = dynamic(() => import("@/components/vanguard/panels/embajadores-panel").then((m) => m.EmbajadoresPanel), { ssr: false, loading: PanelSkeleton });
const TelegramPanel = dynamic(() => import("@/components/vanguard/panels/telegram-panel").then((m) => m.TelegramPanel), { ssr: false, loading: PanelSkeleton });
const DivisasPanel = dynamic(() => import("@/components/vanguard/panels/divisas-panel").then((m) => m.DivisasPanel), { ssr: false, loading: PanelSkeleton });
const PerfilPanel = dynamic(() => import("@/components/vanguard/panels/perfil-panel").then((m) => m.PerfilPanel), { ssr: false, loading: PanelSkeleton });

// MERCADO
const MarketsPanel = dynamic(() => import("@/components/vanguard/panels/markets-panel").then((m) => m.MarketsPanel), { ssr: false, loading: PanelSkeleton });
const BookmakerPanel = dynamic(() => import("@/components/vanguard/panels/bookmaker-panel").then((m) => m.BookmakerPanel), { ssr: false, loading: PanelSkeleton });
const WarBettingPanel = dynamic(() => import("@/components/vanguard/panels/war-betting-panel").then((m) => m.WarBettingPanel), { ssr: false, loading: PanelSkeleton });
const PredictionsPanel = dynamic(() => import("@/components/vanguard/panels/predictions-panel").then((m) => m.PredictionsPanel), { ssr: false, loading: PanelSkeleton });
const HooksPanel = dynamic(() => import("@/components/vanguard/panels/hooks-panel").then((m) => m.HooksPanel), { ssr: false, loading: PanelSkeleton });
const ShopPanel = dynamic(() => import("@/components/vanguard/panels/shop-panel").then((m) => m.ShopPanel), { ssr: false, loading: PanelSkeleton });

// COMANDO / INTELIGENCIA
const OsintPanel = dynamic(() => import("@/components/vanguard/panels/osint-panel").then((m) => m.OsintPanel), { ssr: false, loading: PanelSkeleton });
const WarsimPanel = dynamic(() => import("@/components/vanguard/panels/warsim-panel").then((m) => m.WarsimPanel), { ssr: false, loading: PanelSkeleton });
const EspionagePanel = dynamic(() => import("@/components/vanguard/panels/espionaje-panel").then((m) => m.EspionagePanel), { ssr: false, loading: PanelSkeleton });
const CrisisPanel = dynamic(() => import("@/components/vanguard/panels/crisis-panel").then((m) => m.CrisisPanel), { ssr: false, loading: PanelSkeleton });
const RadarPanel = dynamic(() => import("@/components/vanguard/panels/radar-panel").then((m) => m.RadarPanel), { ssr: false, loading: PanelSkeleton });
// v30 VISTA DIOS: observación omnisciente del sistema (guerra + salas + planeta)
const OjoDiosPanel = dynamic(() => import("@/components/vanguard/panels/ojo-dios-panel").then((m) => m.OjoDiosPanel), { ssr: false, loading: PanelSkeleton });
const BibliotecaPanel = dynamic(() => import("@/components/vanguard/panels/biblioteca-panel").then((m) => m.SecretLibraryPanel), { ssr: false, loading: PanelSkeleton });
const TribunalPanel = dynamic(() => import("@/components/vanguard/panels/tribunal-panel").then((m) => m.TribunalPanel), { ssr: false, loading: PanelSkeleton });
const AlianzasPanel = dynamic(() => import("@/components/vanguard/panels/alianzas-panel").then((m) => m.AlianzasPanel), { ssr: false, loading: PanelSkeleton });
const AgentePanel = dynamic(() => import("@/components/vanguard/panels/agente-panel").then((m) => m.AgentePanel), { ssr: false, loading: PanelSkeleton });
const CamerasPanel = dynamic(() => import("@/components/vanguard/panels/cameras-panel").then((m) => m.CamerasPanel), { ssr: false, loading: PanelSkeleton });

// ARCHIVO MUNDIAL
const EncyclopediaPanel = dynamic(() => import("@/components/vanguard/panels/encyclopedia-panel").then((m) => m.EncyclopediaPanel), { ssr: false, loading: PanelSkeleton });
const CuriosidadesPanel = dynamic(() => import("@/components/vanguard/panels/curiosidades-panel").then((m) => m.CuriosidadesPanel), { ssr: false, loading: PanelSkeleton });
const ErasPanel = dynamic(() => import("@/components/vanguard/panels/eras-panel").then((m) => m.ErasPanel), { ssr: false, loading: PanelSkeleton });
const Conquistas3DPanel = dynamic(() => import("@/components/vanguard/panels/conquistas-3d-panel").then((m) => m.Conquistas3DPanel), { ssr: false, loading: PanelSkeleton });
const CountersPanel = dynamic(() => import("@/components/vanguard/panels/counters-panel").then((m) => m.CountersPanel), { ssr: false, loading: PanelSkeleton });
const CartelesPanel = dynamic(() => import("@/components/vanguard/panels/carteles-panel").then((m) => m.CartelesPanel), { ssr: false, loading: PanelSkeleton });
const HistoricalWarsPanel = dynamic(() => import("@/components/vanguard/panels/historical-wars-panel").then((m) => m.HistoricalWarsPanel), { ssr: false, loading: PanelSkeleton });
const FamousDeathsPanel = dynamic(() => import("@/components/vanguard/panels/famous-deaths-panel").then((m) => m.FamousDeathsPanel), { ssr: false, loading: PanelSkeleton });
const QuizPanel = dynamic(() => import("@/components/vanguard/panels/quiz-panel").then((m) => m.QuizPanel), { ssr: false, loading: PanelSkeleton });

// SOCIAL / SISTEMA
const GalleryPanel = dynamic(() => import("@/components/vanguard/panels/gallery-panel").then((m) => m.GalleryPanel), { ssr: false, loading: PanelSkeleton });
const BriefingsPanel = dynamic(() => import("@/components/vanguard/panels/briefings-panel").then((m) => m.BriefingsPanel), { ssr: false, loading: PanelSkeleton });
const FusionPanel = dynamic(() => import("@/components/vanguard/panels/fusion-panel").then((m) => m.FusionPanel), { ssr: false, loading: PanelSkeleton });
const RewardsPanel = dynamic(() => import("@/components/vanguard/panels/rewards-panel").then((m) => m.RewardsPanel), { ssr: false, loading: PanelSkeleton });
const AchievementsPanel = dynamic(() => import("@/components/vanguard/panels/achievements-panel").then((m) => m.AchievementsPanel), { ssr: false, loading: PanelSkeleton });
const ActivityLogPanel = dynamic(() => import("@/components/vanguard/panels/activity-log-panel").then((m) => m.ActivityLogPanel), { ssr: false, loading: PanelSkeleton });
const TournamentsPanel = dynamic(() => import("@/components/vanguard/panels/tournaments-panel").then((m) => m.TournamentsPanel), { ssr: false, loading: PanelSkeleton });
const DailyChallengesPanel = dynamic(() => import("@/components/vanguard/panels/daily-challenges-panel").then((m) => m.DailyChallengesPanel), { ssr: false, loading: PanelSkeleton });
const ProgressChartsPanel = dynamic(() => import("@/components/vanguard/panels/progress-charts-panel").then((m) => m.ProgressChartsPanel), { ssr: false, loading: PanelSkeleton });
const FriendsPanel = dynamic(() => import("@/components/vanguard/panels/friends-panel").then((m) => m.FriendsPanel), { ssr: false, loading: PanelSkeleton });
const NotificationsPanel = dynamic(() => import("@/components/vanguard/panels/notifications-panel").then((m) => m.NotificationsPanel), { ssr: false, loading: PanelSkeleton });
const StreakCalendarPanel = dynamic(() => import("@/components/vanguard/panels/streak-calendar-panel").then((m) => m.StreakCalendarPanel), { ssr: false, loading: PanelSkeleton });
const HelpPanel = dynamic(() => import("@/components/vanguard/panels/help-panel").then((m) => m.HelpPanel), { ssr: false, loading: PanelSkeleton });
const RankingPanel = dynamic(() => import("@/components/vanguard/panels/ranking-panel").then((m) => m.RankingPanel), { ssr: false, loading: PanelSkeleton });
const ForumPanel = dynamic(() => import("@/components/vanguard/panels/forum-panel").then((m) => m.ForumPanel), { ssr: false, loading: PanelSkeleton });
const SalasPanel = dynamic(() => import("@/components/vanguard/panels/salas-panel").then((m) => m.SalasPanel), { ssr: false, loading: PanelSkeleton });
const PollsPanel = dynamic(() => import("@/components/vanguard/panels/polls-panel").then((m) => m.PollsPanel), { ssr: false, loading: PanelSkeleton });
const VideosPanel = dynamic(() => import("@/components/vanguard/panels/videos-panel").then((m) => m.VideosPanel), { ssr: false, loading: PanelSkeleton });

export default function Home() {
  // v14: la PRIMERA página es la portada con NOTICIAS EN VIVO
  const [tab, setTab] = useState<TabKey>("inicio");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const authRefresh = useGameStore((s) => s.authRefresh);
  const alias = useGameStore((s) => s.alias);
  const { t } = useT();
  const initPlayer = useGameStore((s) => s.initPlayer);
  const checkAchievements = useGameStore((s) => s.checkAchievements);
  const recordTabVisit = useGameStore((s) => s.recordTabVisit);

  // init sound + player alias + sesión de cuenta + logros
  useEffect(() => {
    initSound();
    initPlayer();
    authRefresh();
    const t = setInterval(() => checkAchievements(), 5000);
    return () => clearInterval(t);
  }, [checkAchievements, initPlayer, authRefresh]);

  // Keyboard shortcuts: number keys 1-9 to switch tabs, ArrowLeft/Right to navigate
  useEffect(() => {
    const TAB_ORDER: TabKey[] = [
      "inicio", "mundo", "bolsa", "bookmaker", "osint", "ojodios", "detective",
      "dron", "warsim", "arcade", "noticias",
    ];
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept if typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      // M abre el menú completo
      if (e.key.toLowerCase() === "m") {
        setMenuOpen((v) => !v);
        return;
      }
      // Number keys 1-9 (and 0 for 10th)
      if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < TAB_ORDER.length) {
          setTab(TAB_ORDER[idx]);
          sfx.tab();
        }
      }
      if (e.key === "0") {
        setTab(TAB_ORDER[9]);
        sfx.tab();
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const curIdx = TAB_ORDER.indexOf(tab);
        if (curIdx >= 0) {
          const dir = e.key === "ArrowRight" ? 1 : -1;
          const newIdx = (curIdx + dir + TAB_ORDER.length) % TAB_ORDER.length;
          setTab(TAB_ORDER[newIdx]);
          sfx.tab();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tab]);

  // play sound on tab change + record tab visit for daily challenges
  const handleTabChange = (k: TabKey) => {
    sfx.tab();
    setTab(k);
    recordTabVisit(k);
    // v29 FIX: cada sección abre desde arriba — la barra sticky nunca tapa el inicio del panel
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  // navegacion programatica desde otros paneles (ej: tienda -> camaras)
  useEffect(() => {
    const handler = (e: Event) => {
      const target = (e as CustomEvent).detail as TabKey;
      if (target) {
        setTab(target);
        recordTabVisit(target);
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      }
    };
    const openMenu = () => setMenuOpen(true);
    const openAccount = () => setAccountOpen(true);
    window.addEventListener("vanguard:navigate", handler);
    window.addEventListener("vanguard:open-menu", openMenu);
    window.addEventListener("vanguard:open-account", openAccount);
    return () => {
      window.removeEventListener("vanguard:navigate", handler);
      window.removeEventListener("vanguard:open-menu", openMenu);
      window.removeEventListener("vanguard:open-account", openAccount);
    };
  }, [recordTabVisit]);

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* v16 HERMOSA: aurora cinematográfica + partículas + viñeta */}
      <div className="aurora-layer" aria-hidden>
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
        <div className="aurora-orb aurora-orb-4" />
      </div>
      <div className="vignette-layer" aria-hidden />
      <div className="particles-layer" aria-hidden />
      <BootScreen />
      <HudHeader
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenLog={() => setLogOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
      />
      <TabNav active={tab} onChange={handleTabChange} onOpenMenu={() => setMenuOpen(true)} />
      <StatsTicker />

      <main className="flex-1 px-3 py-4 sm:px-4 sm:py-6 max-w-7xl w-full mx-auto pb-20">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <PanelErrorBoundary resetKey={tab} moduleName={`panel ${tab}`}>
        {tab === "inicio" && (
          <>
            <HomePanel />
            {/* v18: sección de crecimiento bajo la portada — conversión de visitantes a embajadores */}
            <GrowthShare />
          </>
        )}
        {tab === "briefing" && <DailyBriefingPanel />}
        {tab === "mapa" && <MapPanel />}
        {tab === "misiones" && <MissionsPanel />}
        {tab === "noticias" && <NewsPanel />}
        {tab === "galeria" && <GalleryPanel />}
        {tab === "briefings" && <BriefingsPanel />}
        {tab === "quiz" && <QuizPanel />}
        {tab === "predicciones" && <PredictionsPanel />}
        {tab === "fusion" && <FusionPanel />}
        {tab === "recompensas" && <RewardsPanel />}
        {tab === "tienda" && <ShopPanel />}
        {tab === "logros" && <AchievementsPanel />}
        {tab === "minijuego" && <MiniGamePanel />}
        {tab === "dron" && <DroneStrikePanel />}
        {tab === "torneos" && <TournamentsPanel />}
        {tab === "retos" && <DailyChallengesPanel />}
        {tab === "estadisticas" && <ProgressChartsPanel />}
        {tab === "amigos" && <FriendsPanel />}
        {tab === "notificaciones" && <NotificationsPanel />}
        {tab === "racha" && <StreakCalendarPanel />}
        {tab === "registro" && <ActivityLogPanel />}
        {tab === "ayuda" && <HelpPanel />}
        {tab === "camaras" && <CamerasPanel />}
        {tab === "combate" && <CombatSimulatorPanel />}
        {tab === "historia" && <HistoricalWarsPanel />}
        {tab === "muertes" && <FamousDeathsPanel />}
        {tab === "apuestas" && <WarBettingPanel />}
        {tab === "conquista" && <CountryControlPanel />}
        {tab === "mundo" && <WorldConquestPanel />}
        {tab === "multijugador" && <MultiplayerPanel />}
        {tab === "frente" && <FrentePanel />}
        {tab === "detective" && <DetectivePanel />}
        {tab === "edad" && <AgeOfNationsPanel />}
        {tab === "arcade" && <ArcadePanel />}
        {tab === "bookmaker" && <BookmakerPanel />}
        {tab === "enciclopedia" && <EncyclopediaPanel />}
        {tab === "curiosidades" && <CuriosidadesPanel />}
        {tab === "epocas" && <ErasPanel />}
        {tab === "conquistas3d" && <Conquistas3DPanel />}
        {tab === "contadores" && <CountersPanel />}
        {tab === "carteles" && <CartelesPanel />}
        {tab === "bolsa" && <MarketsPanel />}
        {tab === "divisas" && <DivisasPanel />}
        {/* v13 — centro de mando global */}
        {tab === "osint" && <OsintPanel />}
        {tab === "warsim" && <WarsimPanel />}
        {tab === "espionaje" && <EspionagePanel />}
        {tab === "crisis" && <CrisisPanel />}
        {tab === "radar" && <RadarPanel />}
        {tab === "ojodios" && <OjoDiosPanel />}
        {tab === "biblioteca" && <BibliotecaPanel />}
        {tab === "tribunal" && <TribunalPanel />}
        {tab === "alianzas" && <AlianzasPanel />}
        {tab === "agente" && <AgentePanel />}
        {tab === "gancho" && <HooksPanel />}
        {tab === "ranking" && <RankingPanel />}
        {tab === "foros" && <ForumPanel />}
        {tab === "salas" && <SalasPanel />}
        {tab === "encuestas" && <PollsPanel />}
        {tab === "videos" && <VideosPanel />}
        {tab === "estudio" && <EstudioPanel />}
        {tab === "directos" && <DirectosPanel />}
        {tab === "memes" && <MemeStudioPanel />}
        {tab === "envivo" && <EnVivoPanel />}
        {tab === "contribuidores" && <ContribuidoresPanel />}
        {tab === "perfil" && <PerfilPanel />}
        {/* v24 — VERDAD CRUDA: el lado oscuro de los conflictos */}
        {tab === "abusos" && <AbusosPanel />}
        {tab === "incidentes" && <IncidentesPanel />}
        {tab === "memorial" && <MemorialPanel />}
        {tab === "sala18" && <SalaRojaPanel />}
        {tab === "dronguerra" && <DronGuerraPanel />}
        {tab === "recluta" && <ReclutamientoPanel />}
        {tab === "embajadores" && <EmbajadoresPanel />}
        {tab === "telegram" && <TelegramPanel />}
        {/* v26 — COMUNIDAD CREADORA: todo lo sube la gente */}
        {tab === "creador" && <CreadorPanel />}
        {tab === "armeria" && <ArmeriaPanel />}
        {tab === "maps" && <GMapsPanel />}
        {tab === "studios" && <StudiosPanel />}
        {tab === "gobierno" && <GobiernoPanel />}
        {tab === "bolsamonedas" && <BolsaPanel />}
        {/* v28 — PARA TI: feed de la comunidad */}
        {tab === "foryou" && <ForYouPanel />}
            </PanelErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-auto hud-panel border-t border-amber-hud py-3 px-4 relative">
        <div className="hairline-gradient absolute top-0 left-0 right-0 opacity-70" aria-hidden />
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-hud blink-soft" />
            <span>{t("footer.system")}</span>
          </div>
          <div className="text-center">
            VANGUARD <span className="text-gradient font-bold">{APP_VERSION_LABEL}</span> · {t("footer.build")} · {alias || "SIN REGISTRO"}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <kbd className="px-1 py-0.5 border border-amber-hud/30 rounded text-amber">M</kbd>
            <span>{t("footer.menuKey")}</span>
            <span className="text-amber-hud/30">·</span>
            <kbd className="px-1 py-0.5 border border-amber-hud/30 rounded text-amber">1-0</kbd>
            <span>{t("footer.navKeys")}</span>
            <span className="text-amber-hud/30">·</span>
            <span>v16 → {APP_VERSION_LABEL}</span>
          </div>
        </div>
      </footer>

      <MegaMenu open={menuOpen} onChange={handleTabChange} onClose={() => setMenuOpen(false)} />
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
      <DailyLoginModal />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ActivityLogModal open={logOpen} onOpenChange={setLogOpen} />
      <MusicPlayer />
      <RealtimeStatus />
      <ConnectionWatchdog />
      {/* v33 ESCUELA DE GUERRA — manual del comandante (auto en 1ª visita) */}
      <TutorialModal />
    </div>
  );
}
