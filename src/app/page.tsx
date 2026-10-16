"use client";

// VANGUARD v17 — MULTIJUGADOR TERMINADO + MOTOR DE CARGA RAPIDA.
// v17 RENDIMIENTO: los paneles ahora se cargan con code-splitting perezoso
// (next/dynamic ssr:false). El bundle inicial solo contiene la portada + nav;
// cada módulo pesado (3D, bolsa, wiki...) baja su propio chunk al visitarlo.
// v17 ESTABILIDAD: PanelErrorBoundary aísla fallos por panel — un módulo caído
// ya NO tumba la app; tarjeta de recuperación con REINTENTAR por módulo.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { HudHeader } from "@/components/vanguard/hud-header";
import { sectionOfTab, accentOfSection, ALL_TABS, SECTIONS, type TabKey } from "@/components/vanguard/tab-nav";
// v106.0 PESTAÑAS DE CROMO: la franja del navegador interno reemplaza a la
// barra de secciones — pestañas que se abren, se eligen y se cierran.
import { ChromeTabs, MAX_PESTANAS } from "@/components/vanguard/chrome-tabs";
import { toast } from "sonner";
import { APP_VERSION_LABEL, APP_VERSION } from "@/lib/version";
// v72.0 INFINITA VERDADES: la intro cinematográfica VUELVE (letras 3D realistas,
// luna llena y ocaso cálido). Una vez por sesión, saltable, reduced-motion off.
const IntroCinematica = dynamic(() => import("@/components/vanguard/intro-cinematica").then((m) => m.IntroCinematica), { ssr: false });
// v110.0 MATRIZ 2100 — motor 3D global (ajustes → CSS vars + paralaje)
const Motor3D = dynamic(() => import("@/components/vanguard/motor-3d").then((m) => m.Motor3D), { ssr: false });
import { PanelErrorBoundary } from "@/components/vanguard/panel-error-boundary";
import { SettingsModal } from "@/components/vanguard/settings-modal";
import { ActivityLogModal } from "@/components/vanguard/activity-log-modal";
import { StatsTicker } from "@/components/vanguard/stats-ticker";
import { motion, AnimatePresence, type Variants } from "framer-motion";
// v14: reestructuración — portada INICIO con noticias primero + menú llamativo
import { HomePanel } from "@/components/vanguard/home-panel";
import { MegaMenu } from "@/components/vanguard/mega-menu";
// v121.0 LA CAMA MÁS CÓMODA: ATLAS MUNDIAL (el modo que faltaba: cada país y
// cada persona importante con su ubicación) + LA CAMA (la habitación de
// personalización total) + TRANSICIÓN MAESTRA (5 estilos de viaje) + el
// MOTOR DE LA CAMA (CSS vars) + FRANJA ILUSTRADA (ilustraciones funcionales)
const AtlasPanel = dynamic(() => import("@/components/vanguard/panels/atlas-panel").then((m) => m.AtlasPanel), { ssr: false, loading: PanelSkeleton });
const CamaPanel = dynamic(() => import("@/components/vanguard/panels/cama-panel").then((m) => m.CamaPanel), { ssr: false, loading: PanelSkeleton });
import { TransicionMaestra } from "@/components/vanguard/transicion-maestra";
import { MotorCama } from "@/components/vanguard/motor-cama";
import { FranjaIlustrada } from "@/components/vanguard/ilustraciones-vivas";
import { useCama } from "@/lib/cama-store";
// v96.0 GOOGLE VIVO: barra estructura Google + transición de cine + motor CineVivo
import { GoogleBar } from "@/components/vanguard/google-bar";
import { CineVivo } from "@/components/vanguard/cine-vivo";
// v120.0 GRAN SALTO 3D: la ciudad viva REINA en la portada — cielo real
// (día/noche según tu reloj), región rotativa a mano y VANGUARD en letras 3D
import { CiudadHero } from "@/components/vanguard/ciudad-hero";
// v47.0 BUSCADOR DE SECCIONES: paleta para saltar a cualquiera de las 81 secciones
import { SectionSearch } from "@/components/vanguard/section-search";
import { AccountModal } from "@/components/vanguard/account-modal";
import { useGameStore } from "@/lib/game-store";
import { useT } from "@/lib/i18n";
import { initSound, sfx } from "@/lib/sound";
// v18 CRECIMIENTO: modulo viral en la portada (compartir + referidos + PWA)
import { GrowthShare } from "@/components/vanguard/growth-share";
// v46.0 OBJETIVO MUNDIAL: meta comunitaria con recompensa para todos (motor de reclutamiento)
import { GoalBanner } from "@/components/vanguard/goal-banner";
import { ShareGoalBanner } from "@/components/vanguard/share-goal";
// v34 LLAMADO A LAS ARMAS: recepción de invitados ?ref=, kit de reclutamiento y FAQ SEO
import { ReferralLanding } from "@/components/vanguard/referral-landing";
import { PromoKit } from "@/components/vanguard/promo-kit";
import { Mission100 } from "@/components/vanguard/mission-100";
import { SeoFaq } from "@/components/vanguard/seo-faq";
// v26 RADIO VANGUARD: música de conflicto global (widget flotante, solo cliente)
import { ensurePlayerCounted } from "@/lib/realtime";
import { ensureLangDetected } from "@/lib/i18n";
import { startPresenceHeartbeat, LiveTitle } from "@/components/vanguard/presence-ping";
// v67.0 EL HANGAR — capa global de crisis/PROTOCOLO ROJO + easter eggs + contador de guerra + rival
const ProtocoloRojo = dynamic(() => import("@/components/vanguard/protocolo-rojo").then((m) => m.ProtocoloRojo), { ssr: false });
const EasterEggs = dynamic(() => import("@/components/vanguard/easter-eggs").then((m) => m.EasterEggs), { ssr: false });
const CostoGuerra = dynamic(() => import("@/components/vanguard/costo-guerra").then((m) => m.CostoGuerra), { ssr: false });
const RivalStrip = dynamic(() => import("@/components/vanguard/rival-strip").then((m) => m.RivalStrip), { ssr: false });
// v67.0 EL HANGAR — el hub 3D del agente
const HangarPanel = dynamic(() => import("@/components/vanguard/hangar-3d").then((m) => m.HangarPanel), { ssr: false, loading: PanelSkeleton });
const MusicPlayer = dynamic(() => import("@/components/vanguard/music-player").then((m) => m.MusicPlayer), { ssr: false });
const ConnectionWatchdog = dynamic(() => import("@/components/vanguard/connection-watchdog").then((m) => m.ConnectionWatchdog), { ssr: false });
// v32 CIELO DE ACERO: badge global del estado del socket multijugador
const RealtimeStatus = dynamic(() => import("@/components/realtime-status").then((m) => m.RealtimeStatus), { ssr: false });
// v84.0 FORTUNA DE GUERRA: lluvia de monedas del GOLPE DE FORTUNA (global)
const FortunaLluvia = dynamic(() => import("@/components/vanguard/fortuna-lluvia").then((m) => m.FortunaLluvia), { ssr: false });
// v40 GEOPOLÍTICA EN VIVO: el tablón del planeta con datos reales (Banco Mundial/USGS/Wikipedia)
const GeopoliticaPanel = dynamic(() => import("@/components/vanguard/panels/geopolitica-panel").then((m) => m.GeopoliticaPanel), { ssr: false, loading: PanelSkeleton });
// v41 PLANETA VIVO: globo con capas NASA EONET + auroras NOAA + sismos + EEI en directo
const PlanetaPanel = dynamic(() => import("@/components/vanguard/panels/planeta-panel").then((m) => m.PlanetaPanel), { ssr: false, loading: PanelSkeleton });
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
// v105.0 LA REDACCIÓN — el lugar optimizado para leer el mundo
const RedaccionPanel = dynamic(() => import("@/components/vanguard/panels/redaccion-panel").then((m) => m.RedaccionPanel), { ssr: false, loading: PanelSkeleton });
// v106.0 PESTAÑAS DE CROMO: la NUEVA PESTAÑA (elegir destino con ómnibox) + la
// MURALLA DE VIGILANCIA (el corazón nuevo del OBSERVATORIO)
const NuevaPanel = dynamic(() => import("@/components/vanguard/panels/nueva-panel").then((m) => m.NuevaPanel), { ssr: false, loading: PanelSkeleton });
const ObservatorioPanel = dynamic(() => import("@/components/vanguard/panels/observatorio-panel").then((m) => m.ObservatorioPanel), { ssr: false, loading: PanelSkeleton });
// v113.0 LETRAS VIVAS: la página de los imposibles (forja de letras 3D, órbita, lluvia)
const ExperimentalPanel = dynamic(() => import("@/components/vanguard/panels/experimental-panel").then((m) => m.ExperimentalPanel), { ssr: false, loading: PanelSkeleton });
// v115.0 SINGULARIDAD: la sala del ARQUITECTO + su motor perpetuo global
const ArquitectoPanel = dynamic(() => import("@/components/vanguard/panels/arquitecto-panel").then((m) => m.ArquitectoPanel), { ssr: false, loading: PanelSkeleton });
const MotorArquitecto = dynamic(() => import("@/components/vanguard/panels/arquitecto-panel").then((m) => m.MotorArquitecto), { ssr: false });
// v105.0 EL NAVEGADOR — brújula "¿qué quiero hacer hoy?" (global)
const Navegador = dynamic(() => import("@/components/vanguard/navegador").then((m) => m.Navegador), { ssr: false });
const DailyBriefingPanel = dynamic(() => import("@/components/vanguard/panels/daily-briefing-panel").then((m) => m.DailyBriefingPanel), { ssr: false, loading: PanelSkeleton });
const MapPanel = dynamic(() => import("@/components/vanguard/panels/map-panel").then((m) => m.MapPanel), { ssr: false, loading: PanelSkeleton });
// v81.0 MAPAS DE GUERRA — sala de operaciones táctica
const OpsPanel = dynamic(() => import("@/components/vanguard/panels/ops-panel").then((m) => m.OpsPanel), { ssr: false, loading: PanelSkeleton });
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
// v102.0 LA CIUDADELA — TALLER DE JUEGOS (crear/publicar/jugar) + FORTALEZA
const TallerJuegosPanel = dynamic(() => import("@/components/vanguard/panels/taller-juegos-panel").then((m) => m.TallerJuegosPanel), { ssr: false, loading: PanelSkeleton });
const FortalezaPanel = dynamic(() => import("@/components/vanguard/panels/fortaleza-panel").then((m) => m.FortalezaPanel), { ssr: false, loading: PanelSkeleton });

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
// v97.0 PANTALLA TOTAL: la plataforma de video de Vanguard (feed vertical + sala de proyección)
const PantallaPanel = dynamic(() => import("@/components/vanguard/panels/pantalla-panel").then((m) => m.PantallaPanel), { ssr: false, loading: PanelSkeleton });
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
// v82.0 TODO EL MUNDO — Banco Central de Vanguard
const HaciendaPanel = dynamic(() => import("@/components/vanguard/panels/hacienda-panel").then((m) => m.HaciendaPanel), { ssr: false, loading: PanelSkeleton });
const BookmakerPanel = dynamic(() => import("@/components/vanguard/panels/bookmaker-panel").then((m) => m.BookmakerPanel), { ssr: false, loading: PanelSkeleton });
const WarBettingPanel = dynamic(() => import("@/components/vanguard/panels/war-betting-panel").then((m) => m.WarBettingPanel), { ssr: false, loading: PanelSkeleton });
const PredictionsPanel = dynamic(() => import("@/components/vanguard/panels/predictions-panel").then((m) => m.PredictionsPanel), { ssr: false, loading: PanelSkeleton });
const HooksPanel = dynamic(() => import("@/components/vanguard/panels/hooks-panel").then((m) => m.HooksPanel), { ssr: false, loading: PanelSkeleton });
const ShopPanel = dynamic(() => import("@/components/vanguard/panels/shop-panel").then((m) => m.ShopPanel), { ssr: false, loading: PanelSkeleton });

// COMANDO / INTELIGENCIA
const OsintPanel = dynamic(() => import("@/components/vanguard/panels/osint-panel").then((m) => m.OsintPanel), { ssr: false, loading: PanelSkeleton });
const WarsimPanel = dynamic(() => import("@/components/vanguard/panels/warsim-panel").then((m) => m.WarsimPanel), { ssr: false, loading: PanelSkeleton });
// v100.0 LABORATORIO DEL DESTINO: WHAT IF? LAB — simulación contrafactual conectada al Espejo
const LaboratorioPanel = dynamic(() => import("@/components/vanguard/panels/laboratorio-panel").then((m) => m.LaboratorioPanel), { ssr: false, loading: PanelSkeleton });
// v101.0 EL REGRESO — los tres pilares de retención
const CambiosPanel = dynamic(() => import("@/components/vanguard/panels/cambios-panel").then((m) => m.CambiosPanel), { ssr: false, loading: PanelSkeleton });
const AnalistaPanel = dynamic(() => import("@/components/vanguard/panels/analista-panel").then((m) => m.AnalistaPanel), { ssr: false, loading: PanelSkeleton });
const EscenariosPanel = dynamic(() => import("@/components/vanguard/panels/escenarios-panel").then((m) => m.EscenariosPanel), { ssr: false, loading: PanelSkeleton });
const EspionagePanel = dynamic(() => import("@/components/vanguard/panels/espionaje-panel").then((m) => m.EspionagePanel), { ssr: false, loading: PanelSkeleton });
const CrisisPanel = dynamic(() => import("@/components/vanguard/panels/crisis-panel").then((m) => m.CrisisPanel), { ssr: false, loading: PanelSkeleton });
const RadarPanel = dynamic(() => import("@/components/vanguard/panels/radar-panel").then((m) => m.RadarPanel), { ssr: false, loading: PanelSkeleton });
// v30 VISTA DIOS: observación omnisciente del sistema (guerra + salas + planeta)
const OjoDiosPanel = dynamic(() => import("@/components/vanguard/panels/ojo-dios-panel").then((m) => m.OjoDiosPanel), { ssr: false, loading: PanelSkeleton });
// v72.0 INFINITA VERDADES + MI PAÍS
const InfinitaPanel = dynamic(() => import("@/components/vanguard/panels/infinita-panel").then((m) => m.InfinitaPanel), { ssr: false, loading: PanelSkeleton });
const MiPaisPanel = dynamic(() => import("@/components/vanguard/panels/mi-pais-panel").then((m) => m.MiPaisPanel), { ssr: false, loading: PanelSkeleton });
const ExpedientesPanel = dynamic(() => import("@/components/vanguard/panels/expedientes-panel").then((m) => m.ExpedientesPanel), { ssr: false, loading: PanelSkeleton });
// v59 ALEJANDRÍA OSCURA: biblioteca geopolítica del miedo
const OscuraPanel = dynamic(() => import("@/components/vanguard/panels/oscura-panel").then((m) => m.OscuraPanel), { ssr: false, loading: PanelSkeleton });
const BibliotecaPanel = dynamic(() => import("@/components/vanguard/panels/biblioteca-panel").then((m) => m.SecretLibraryPanel), { ssr: false, loading: PanelSkeleton });
const TribunalPanel = dynamic(() => import("@/components/vanguard/panels/tribunal-panel").then((m) => m.TribunalPanel), { ssr: false, loading: PanelSkeleton });
const AlianzasPanel = dynamic(() => import("@/components/vanguard/panels/alianzas-panel").then((m) => m.AlianzasPanel), { ssr: false, loading: PanelSkeleton });
const AgentePanel = dynamic(() => import("@/components/vanguard/panels/agente-panel").then((m) => m.AgentePanel), { ssr: false, loading: PanelSkeleton });
const CamerasPanel = dynamic(() => import("@/components/vanguard/panels/cameras-panel").then((m) => m.CamerasPanel), { ssr: false, loading: PanelSkeleton });
// v51.0 PULSO MUNDIAL — intel REAL en vivo: ISS + OpenSky + Spaceflight News (sin API key)
const PulsoPanel = dynamic(() => import("@/components/vanguard/panels/pulso-panel").then((m) => m.PulsoPanel), { ssr: false, loading: PanelSkeleton });

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
const ConsejoIaPanel = dynamic(() => import("@/components/vanguard/panels/consejo-ia-panel").then((m) => m.ConsejoIaPanel), { ssr: false, loading: PanelSkeleton });
const SalasPanel = dynamic(() => import("@/components/vanguard/panels/salas-panel").then((m) => m.SalasPanel), { ssr: false, loading: PanelSkeleton });
const PollsPanel = dynamic(() => import("@/components/vanguard/panels/polls-panel").then((m) => m.PollsPanel), { ssr: false, loading: PanelSkeleton });
// v85.0 EL MUNDO DENTRO
const EmpleosPanel = dynamic(() => import("@/components/vanguard/panels/empleos-panel").then((m) => m.EmpleosPanel), { ssr: false, loading: PanelSkeleton });
const ModoArPanel = dynamic(() => import("@/components/vanguard/panels/modo-ar-panel").then((m) => m.ModoArPanel), { ssr: false, loading: PanelSkeleton });
const CreadorMapasPanel = dynamic(() => import("@/components/vanguard/panels/creador-mapas-panel").then((m) => m.CreadorMapasPanel), { ssr: false, loading: PanelSkeleton });
// v86.0 CENTINELA GLOBAL — la plataforma definitiva de información de guerra
const VerificaPanel = dynamic(() => import("@/components/vanguard/panels/verifica-panel").then((m) => m.VerificaPanel), { ssr: false, loading: PanelSkeleton });
const CentinelaPanel = dynamic(() => import("@/components/vanguard/panels/centinela-panel").then((m) => m.CentinelaPanel), { ssr: false, loading: PanelSkeleton });
const EspectroPanel = dynamic(() => import("@/components/vanguard/panels/espectro-panel").then((m) => m.EspectroPanel), { ssr: false, loading: PanelSkeleton });
// v89.0 OPERACIÓN ESPEJO — los 6 espejos de los grandes portales de conflicto
const PulsosPanel = dynamic(() => import("@/components/vanguard/panels/pulsos-panel").then((m) => m.PulsosPanel), { ssr: false, loading: PanelSkeleton });
const EvaluacionPanel = dynamic(() => import("@/components/vanguard/panels/evaluacion-panel").then((m) => m.EvaluacionPanel), { ssr: false, loading: PanelSkeleton });
const PerdidasPanel = dynamic(() => import("@/components/vanguard/panels/perdidas-panel").then((m) => m.PerdidasPanel), { ssr: false, loading: PanelSkeleton });
const FrentesPanel = dynamic(() => import("@/components/vanguard/panels/frentes-panel").then((m) => m.FrentesPanel), { ssr: false, loading: PanelSkeleton });
const SimuladorPanel = dynamic(() => import("@/components/vanguard/panels/simulador-panel").then((m) => m.SimuladorPanel), { ssr: false, loading: PanelSkeleton });
const CanalesPanel = dynamic(() => import("@/components/vanguard/panels/canales-panel").then((m) => m.CanalesPanel), { ssr: false, loading: PanelSkeleton });
// v90.0 ESPEJOS SIN FIN — la segunda hornada de espejos
const MundialPanel = dynamic(() => import("@/components/vanguard/panels/mundial-panel").then((m) => m.MundialPanel), { ssr: false, loading: PanelSkeleton });
const WikiguerraPanel = dynamic(() => import("@/components/vanguard/panels/wikiguerra-panel").then((m) => m.WikiguerraPanel), { ssr: false, loading: PanelSkeleton });
const CielosPanel = dynamic(() => import("@/components/vanguard/panels/cielos-panel").then((m) => m.CielosPanel), { ssr: false, loading: PanelSkeleton });
const CiberPanel = dynamic(() => import("@/components/vanguard/panels/ciber-panel").then((m) => m.CiberPanel), { ssr: false, loading: PanelSkeleton });
const SismoPanel = dynamic(() => import("@/components/vanguard/panels/sismo-panel").then((m) => m.SismoPanel), { ssr: false, loading: PanelSkeleton });
const MercadosPanel = dynamic(() => import("@/components/vanguard/panels/mercados-panel").then((m) => m.MercadosPanel), { ssr: false, loading: PanelSkeleton });
// v91.0 AUGE Y CAÍDA — el RTS territorial del espejo infinito
const ImperioPanel = dynamic(() => import("@/components/vanguard/panels/imperio-panel").then((m) => m.ImperioPanel), { ssr: false, loading: PanelSkeleton });
// v92.0 OJO DEL MUNDO — la tercera hornada del espejo: 7 portales nuevos
const PronosticosPanel = dynamic(() => import("@/components/vanguard/panels/pronosticos-panel").then((m) => m.PronosticosPanel), { ssr: false, loading: PanelSkeleton });
const EnClavePanel = dynamic(() => import("@/components/vanguard/panels/enclaves-panel").then((m) => m.EnClavePanel), { ssr: false, loading: PanelSkeleton });
const ExtranjeraPanel = dynamic(() => import("@/components/vanguard/panels/extranjera-panel").then((m) => m.ExtranjeraPanel), { ssr: false, loading: PanelSkeleton });
const GeointPanel = dynamic(() => import("@/components/vanguard/panels/geoint-panel").then((m) => m.GeointPanel), { ssr: false, loading: PanelSkeleton });
const MonitorGlobalPanel = dynamic(() => import("@/components/vanguard/panels/monitorglobal-panel").then((m) => m.MonitorGlobalPanel), { ssr: false, loading: PanelSkeleton });
const CanalBriefPanel = dynamic(() => import("@/components/vanguard/panels/canalbrief-panel").then((m) => m.CanalBriefPanel), { ssr: false, loading: PanelSkeleton });
// v93.0 VANGUARD EARTH: el googles de Vanguard (simulador de satélite espía)
const TierraPanel = dynamic(() => import("@/components/vanguard/panels/tierra-panel").then((m) => m.TierraPanel), { ssr: false, loading: PanelSkeleton });
// v94.0 GOOGLES TOTAL: Vanguard como el Google de los problemas geopolíticos
const GooglesPanel = dynamic(() => import("@/components/vanguard/panels/googles-panel").then((m) => m.GooglesPanel), { ssr: false, loading: PanelSkeleton });
// v98.0 ORO TOTAL: IMÁGENES DE VANGUARD — búsqueda visual de fotos reales
const ImagenesPanel = dynamic(() => import("@/components/vanguard/panels/imagenes-panel").then((m) => m.ImagenesPanel), { ssr: false, loading: PanelSkeleton });
// v99.0 MENTE VIVA: LA MENTE — el cerebro central (pulso autónomo + charla + expedientes)
const MentePanel = dynamic(() => import("@/components/vanguard/panels/mente-panel").then((m) => m.MentePanel), { ssr: false, loading: PanelSkeleton });
// v103.0 MODO AGENTE: la IA superpotente que CREA dentro de Vanguard (juegos, escenarios, informes)
const AgenteIaPanel = dynamic(() => import("@/components/vanguard/panels/agente-ia-panel").then((m) => m.AgenteIaPanel), { ssr: false, loading: PanelSkeleton });

// v104.0 LA VITRINA: el muro unificado de TODAS las obras de la comunidad
const MuroObrasPanel = dynamic(() => import("@/components/vanguard/panels/muro-obras-panel").then((m) => m.MuroObrasPanel), { ssr: false, loading: PanelSkeleton });

// v95.0 EXPEDIENTE TOTAL: grafo mundial, espejo y máquina del tiempo
const GrafoPanel = dynamic(() => import("@/components/vanguard/panels/grafo-panel").then((m) => m.GrafoPanel), { ssr: false, loading: PanelSkeleton });
const EspejoPanel = dynamic(() => import("@/components/vanguard/panels/espejo-panel").then((m) => m.EspejoPanel), { ssr: false, loading: PanelSkeleton });
const MaquinaPanel = dynamic(() => import("@/components/vanguard/panels/maquina-panel").then((m) => m.MaquinaPanel), { ssr: false, loading: PanelSkeleton });
const EstrategiaGlobalPanel = dynamic(() => import("@/components/vanguard/panels/estrategia-panel").then((m) => m.EstrategiaGlobalPanel), { ssr: false, loading: PanelSkeleton });
const VideosPanel = dynamic(() => import("@/components/vanguard/panels/videos-panel").then((m) => m.VideosPanel), { ssr: false, loading: PanelSkeleton });

export default function Home() {
  // v14: la PRIMERA página es la portada con NOTICIAS EN VIVO
  const [tab, setTab] = useState<TabKey>("inicio");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // v47.0 BUSCADOR DE SECCIONES (paleta de comandos) — nada queda enterrado
  const [searchOpen, setSearchOpen] = useState(false);
  // v108.0 MODO INMERSIÓN — pantalla completa para VER TODO: el menú de arriba
  // se aparta (mandato: "un modo pantalla completa, que el menú de arriba opaque")
  const [inmersion, setInmersion] = useState(false);
  const inmersionRef = useRef(false);
  const [accountOpen, setAccountOpen] = useState(false);
  // v102.0 LA CIUDADELA — gate del pasaporte: cualquier panel pide cuenta con
  // window.dispatchEvent(new CustomEvent("vanguard:pasaporte", { detail: { motivo } }))
  const [gatePasaporte, setGatePasaporte] = useState<string | null>(null);
  const authRefresh = useGameStore((s) => s.authRefresh);
  const alias = useGameStore((s) => s.alias);
  const { t } = useT();
  const initPlayer = useGameStore((s) => s.initPlayer);
  const checkAchievements = useGameStore((s) => s.checkAchievements);
  const recordTabVisit = useGameStore((s) => s.recordTabVisit);

  // ===== v106.0 PESTAÑAS DE CROMO — el navegador interno de Vanguard =====
  // Pestañas abiertas + activa, con persistencia honesta en localStorage
  // (vuelves donde estabas, como en el navegador de tu máquina).
  const [pestanas, setPestanas] = useState<TabKey[]>(["inicio"]);

  // ===== v118.0 CRONOATLAS — FLUIDEZ DIRECCIONAL =====
  // El panel entra desde el lado que le toca: navegación hacia delante entra
  // por la derecha y sale por la izquierda; volver invierte el movimiento.
  // Como un navegador de verdad: la dirección SE SIENTE.
  const [dirMov, setDirMov] = useState<1 | -1>(1);
  const historialTabsRef = useRef<TabKey[]>(["inicio"]);
  const forceDirRef = useRef<number | null>(null); // swipe/ciclo fuerzan dirección
  const swipeRef = useRef<{ x: number; y: number; t: number } | null>(null);

  // ABRIR pestaña: dedupe (si ya está abierta, solo se activa), tope honesto de
  // MAX_PESTANAS (la más antigua se recoge con aviso), visita registrada para el
  // Explorador — la NUEVA no cuenta: abrir pestañas no paga el mapa. Escena para
  // la radio + scroll arriba (la franja nunca tapa el inicio del panel).
  const handleTabChange = useCallback((k: TabKey) => {
    sfx.tab();
    // v118: dirección del movimiento (adelante por defecto, atrás si
    // volvemos a la pestaña previa del historial, o la que fuerza el swipe)
    const hist = historialTabsRef.current;
    let dir: 1 | -1 = 1;
    if (forceDirRef.current != null) {
      dir = forceDirRef.current < 0 ? -1 : 1;
      forceDirRef.current = null;
    } else if (hist.length >= 2 && hist[hist.length - 2] === k) {
      dir = -1;
    }
    setDirMov(dir);
    // v121.0 LA CAMA: la casa aprende el camino del dueño en cada viaje
    useCama.getState().visita(k);
    historialTabsRef.current = [...hist.filter((x) => x !== k), k].slice(-12);
    setTab(k);
    if (!pestanas.includes(k)) {
      if (pestanas.length >= MAX_PESTANAS) {
        const idxVieja = pestanas.findIndex((p) => p !== tab && p !== "nueva");
        if (idxVieja >= 0) {
          setPestanas([...pestanas.slice(0, idxVieja), ...pestanas.slice(idxVieja + 1), k]);
          toast(t("cromo.tope"), { description: `${MAX_PESTANAS} ${t("cromo.topeDesc")}` });
        } else {
          setPestanas([...pestanas, k]);
        }
      } else {
        setPestanas([...pestanas, k]);
      }
    }
    if (k !== "nueva") recordTabVisit(k);
    // v112: la sala activa queda a la vista de todos (sessionStorage) — el
    // Motor 3D y la radio la leen si despiertan después que este dispatch
    try {
      sessionStorage.setItem("vg-sala-activa", sectionOfTab(k).key);
    } catch { /* noop */ }
    window.dispatchEvent(new CustomEvent("vanguard:escena", { detail: sectionOfTab(k).key }));
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pestanas, tab, recordTabVisit, t]);

  // CERRAR pestaña: la vecina de la derecha hereda el foco (o la de la izquierda);
  // si se cierra la última, se abre la NUEVA — el navegador nunca se queda ciego.
  const cerrarPestana = useCallback((k: TabKey) => {
    const idx = pestanas.indexOf(k);
    if (idx < 0) return;
    if (pestanas.length <= 1) {
      setPestanas(["nueva"]);
      setTab("nueva");
      return;
    }
    const restantes = pestanas.filter((p) => p !== k);
    setPestanas(restantes);
    if (k === tab) setTab(restantes[Math.min(idx, restantes.length - 1)]);
  }, [pestanas, tab]);

  // v118: SWIPE EN BORDES (móvil) — desliza desde el borde para cambiar de
  // pestaña abierta, como el navegador de tu máquina. Bordes de 44 px, umbral
  // de 70 px horizontales, ignora gestos verticales, interactivos y modales.
  // v121.0 LA CAMA: el dueño elige CÓMO viaja entre salas y CUÁNTO se mueve
  const estiloTrans = useCama((s) => s.transicion);
  const movCama = useCama((s) => s.movimiento);
  const modoCamaOn = useCama((s) => s.modoCama);
  const variantesSala = useMemo<Variants>(() => {
    const mov = modoCamaOn ? Math.min(movCama, 0.35) : movCama;
    const m = Math.max(0.15, mov);          // multiplicador de distancias
    const dur = (n: number) => n / m;        // a más intensidad, más rápido
    const d = (n: number) => n * m;
    const bez = [0.22, 1, 0.36, 1] as [number, number, number, number];
    switch (estiloTrans) {
      case "cine3d":
        return {
          entra: (dir: number) => ({ opacity: 0, x: dir >= 0 ? d(60) : d(-60), rotateY: dir >= 0 ? -16 : 16, transformPerspective: 1200 }),
          centro: { opacity: 1, x: 0, rotateY: 0, transformPerspective: 1200, transition: { duration: dur(0.42), ease: bez } },
          sale: (dir: number) => ({ opacity: 0, x: dir >= 0 ? d(-50) : d(50), rotateY: dir >= 0 ? 12 : -12, transformPerspective: 1200, transition: { duration: dur(0.26), ease: [0.4, 0, 1, 1] as [number, number, number, number] } }),
        };
      case "telon":
        return {
          entra: () => ({ opacity: 0, scaleY: 0.82, y: d(-34), transformOrigin: "50% 0%" }),
          centro: { opacity: 1, scaleY: 1, y: 0, transformOrigin: "50% 0%", transition: { duration: dur(0.4), ease: bez } },
          sale: () => ({ opacity: 0, scaleY: 0.88, y: d(26), transformOrigin: "50% 100%", transition: { duration: dur(0.24), ease: [0.4, 0, 1, 1] as [number, number, number, number] } }),
        };
      case "hiperespacio":
        return {
          entra: () => ({ opacity: 0, scale: 1.14 }),
          centro: { opacity: 1, scale: 1, transition: { duration: dur(0.36), ease: bez } },
          sale: () => ({ opacity: 0, scale: 0.9, transition: { duration: dur(0.22), ease: [0.4, 0, 1, 1] as [number, number, number, number] } }),
        };
      case "disolver":
        return {
          entra: () => ({ opacity: 0, scale: 0.992 }),
          centro: { opacity: 1, scale: 1, transition: { duration: dur(0.5), ease: "easeOut" } },
          sale: () => ({ opacity: 0, transition: { duration: dur(0.3), ease: "easeIn" } }),
        };
      default: // deslizar — el v118 direccional, ahora con intensidad ajustable
        return {
          entra: (dir: number) => ({ opacity: 0, x: dir >= 0 ? d(30) : d(-30), y: d(18), scale: 0.99 }),
          centro: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: dur(0.3), ease: bez } },
          sale: (dir: number) => ({ opacity: 0, x: dir >= 0 ? d(-24) : d(24), y: d(-12), scale: 0.995, transition: { duration: dur(0.2), ease: [0.4, 0, 1, 1] as [number, number, number, number] } }),
        };
    }
  }, [estiloTrans, movCama, modoCamaOn]);

  const alTocarBorde = useCallback((e: React.TouchEvent) => {
    const tch = e.touches[0];
    if (!tch) return;
    if (tch.clientX > 44 && tch.clientX < window.innerWidth - 44) { swipeRef.current = null; return; }
    const el = e.target as HTMLElement | null;
    if (el && el.closest("input,textarea,select,iframe,canvas,button,a,[data-no-swipe]")) return;
    swipeRef.current = { x: tch.clientX, y: tch.clientY, t: Date.now() };
  }, []);
  const alSoltarBorde = useCallback((e: React.TouchEvent) => {
    const s = swipeRef.current;
    swipeRef.current = null;
    if (!s) return;
    if (menuOpen || searchOpen || settingsOpen || logOpen || accountOpen || gatePasaporte) return;
    const tch = e.changedTouches[0];
    if (!tch) return;
    const dx = tch.clientX - s.x;
    const dy = tch.clientY - s.y;
    const dt = Date.now() - s.t;
    if (Math.abs(dx) < 70 || Math.abs(dy) > 60 || dt > 800) return;
    const dirSwipe = dx < 0 ? 1 : -1; // izquierda → siguiente
    // v119: SWIPE TAMBIÉN PARA SECCIONES — con una sola pestaña abierta el
    // gesto recorre el CATÁLOGO COMPLETO de SECTIONS (la sección se abre como
    // pestaña al navegar), así el borde nunca queda sin respuesta.
    if (pestanas.length < 2) {
      const catalogo = SECTIONS.map((sct) => sct.key);
      const idxSec = catalogo.indexOf(tab);
      const destinoSec = catalogo[(idxSec + dirSwipe + catalogo.length) % catalogo.length];
      forceDirRef.current = dirSwipe;
      handleTabChange(destinoSec as TabKey);
      return;
    }
    const idx = pestanas.indexOf(tab);
    if (idx < 0) return;
    const destino = pestanas[(idx + dirSwipe + pestanas.length) % pestanas.length];
    forceDirRef.current = dirSwipe;
    handleTabChange(destino);
  }, [pestanas, tab, handleTabChange, menuOpen, searchOpen, settingsOpen, logOpen, accountOpen, gatePasaporte]);

  // la NUEVA PESTAÑA: elegir destino (el + de la franja / Alt+N)
  const abrirNueva = useCallback(() => {
    handleTabChange("nueva");
  }, [handleTabChange]);

  // v107.0 GRUPOS DE CROMO: reordenar arrastrando + cerrar VARIAS (grupos y
  // "cerrar las demás") en UNA sola escritura de estado — cerrar de a una con
  // el mismo estado viejo dejaría pestañas fantasma en la franja.
  const cerrarVarias = useCallback(
    (ks: TabKey[]) => {
      if (ks.length === 0) return;
      const restantes = pestanas.filter((p) => !ks.includes(p));
      const lista = restantes.length > 0 ? restantes : ["nueva" as TabKey];
      setPestanas(lista);
      if (ks.includes(tab)) {
        const idx = pestanas.indexOf(tab);
        setTab(lista[Math.max(0, Math.min(idx < 0 ? 0 : idx, lista.length - 1))] ?? "nueva");
      }
    },
    [pestanas, tab],
  );

  // hidratación de las pestañas guardadas (una vez, tras montar — sin mismatch;
  // microtask para no cascada de renders, patrón v102). El guardián "hidratado"
  // evita la trampa cazada en QA: la persistencia corriendo ANTES de la
  // hidratación sobreescribía el archivo con ["inicio"] y se perdía la sesión.
  const hidratado = useRef(false);
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const raw = localStorage.getItem("vg-cromo-tabs-v106");
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length > 0) {
            const validas = arr.filter(
              (k: unknown): k is TabKey => typeof k === "string" && (k === "nueva" || ALL_TABS.includes(k as TabKey))
            );
            if (validas.length > 0) {
              setPestanas(validas.slice(0, MAX_PESTANAS));
              const guardada = localStorage.getItem("vg-cromo-activa-v106");
              if (
                guardada &&
                (guardada === "nueva" || ALL_TABS.includes(guardada as TabKey)) &&
                validas.includes(guardada as TabKey)
              ) {
                setTab(guardada as TabKey);
                // v112: la sala restaurada anuncia su escena — el Motor 3D viste
                // su preset de era y la radio sabe dónde despertó. Doble vía:
                // sessionStorage (el chunk lazy del Motor la lee al montar — su
                // montaje llega DESPUÉS de este restore) + el evento para quien
                // ya esté escuchando. (defecto de recarga en frío: nadie
                // anunciaba la sala al montar)
                try {
                  sessionStorage.setItem("vg-sala-activa", sectionOfTab(guardada as TabKey).key);
                } catch { /* sin sesión la era global manda */ }
                window.dispatchEvent(
                  new CustomEvent("vanguard:escena", { detail: sectionOfTab(guardada as TabKey).key })
                );
              }
            }
          }
        }
      } catch {
        /* sin almacenamiento el navegador abre en INICIO y ya está */
      }
      hidratado.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, []);

  // persistencia en cada cambio del navegador interno (solo tras hidratar:
  // escribir antes machacaría las pestañas guardadas con las iniciales)
  useEffect(() => {
    if (!hidratado.current) return;
    try {
      localStorage.setItem("vg-cromo-tabs-v106", JSON.stringify(pestanas));
      localStorage.setItem("vg-cromo-activa-v106", tab);
    } catch {
      /* la sesión vive igual sin almacenamiento */
    }
  }, [pestanas, tab]);

  // init sound + player alias + sesión de cuenta + logros
  useEffect(() => {
    initSound();
    initPlayer();
    authRefresh();
    // v39.1 CADA VISITA CUENTA: el visitante se cuenta como jugador en el
    // montaje de la página — SIN esperar al socket (Render puede tardar 30-50s
    // en despertar; antes esos móviles se iban sin contar). Idempotente.
    ensurePlayerCounted();
    // v42 TU IDIOMA, TU GUERRA: idioma automático del navegador + presencia
    // en vivo por HTTP (latidos 30s — el badge "N EN LÍNEA" del HUD).
    ensureLangDetected();
    startPresenceHeartbeat();
    const t = setInterval(() => checkAchievements(), 5000);
    return () => clearInterval(t);
  }, [checkAchievements, initPlayer, authRefresh]);

  // v106.0 TECLADO DE CROMO: los números 1-9/0 saltan entre tus PESTAÑAS
  // ABIERTAS (ya no a un orden fijo — el navegador te obedece a ti), las flechas
  // giran entre lo abierto y Alt+N abre la NUEVA PESTAÑA. (M = mega-menú,
  // Ctrl+K o / = buscador: intactos.)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't intercept if typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      // M abre el menú completo
      if (e.key.toLowerCase() === "m") {
        setMenuOpen((v) => !v);
        return;
      }
      // v47.0: Ctrl+K / Cmd+K o «/» abren el buscador de secciones
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSearchOpen((v) => !v);
        return;
      }
      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      // Alt+N: nueva pestaña (como el navegador, Ctrl+T está reservado por el SO)
      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        abrirNueva();
        return;
      }
      // Números 1-9 (y 0 para la última): saltar entre pestañas ABIERTAS
      if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < pestanas.length) {
          setTab(pestanas[idx]);
          sfx.tab();
        }
      }
      if (e.key === "0") {
        setTab(pestanas[pestanas.length - 1]);
        sfx.tab();
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        // v67.0: en EL HANGAR las flechas mueven al agente — no cambian de pestaña
        if (tab === "hangar") return;
        const curIdx = pestanas.indexOf(tab);
        if (curIdx >= 0) {
          const dir = e.key === "ArrowRight" ? 1 : -1;
          // v118: el ciclo de pestañas también viaja en su dirección
          forceDirRef.current = dir;
          setTab(pestanas[(curIdx + dir + pestanas.length) % pestanas.length]);
          sfx.tab();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tab, pestanas, abrirNueva]);

  // (v106.0: el handleTabChange vive ahora arriba, con el estado del navegador)

  // v98.0 COLOR ÚNICO POR SECCIÓN — publica el acento del mundo activo como CSS
  // var: la transición de cine, el buscador y los detalles del chrome se tiñen
  // del color de la sección (el oro de INICIO es la identidad de Vanguard).
  useEffect(() => {
    const acc = accentOfSection(sectionOfTab(tab).key);
    document.documentElement.style.setProperty("--vg-acc", acc);
  }, [tab]);

  // navegacion programatica desde otros paneles (ej: tienda -> camaras)
  useEffect(() => {
    const handler = (e: Event) => {
      const target = (e as CustomEvent).detail as TabKey;
      // v106.0: TODA la navegación programática abre PESTAÑA (dedupe + escena +
      // scroll incluidos en el navegador interno) — nada se salta la franja.
      if (target) handleTabChange(target);
    };
    const openMenu = () => setMenuOpen(true);
    const openAccount = () => setAccountOpen(true);
    // v102: el pasaporte se pide desde cualquier panel del taller/estudio
    const pedirPasaporte = (e: Event) => {
      const motivo = (e as CustomEvent<{ motivo?: string }>).detail?.motivo ??
        "Necesitas un pasaporte de la Ciudadela para esto — créalo gratis en 10 segundos.";
      setGatePasaporte(motivo);
      setAccountOpen(true);
    };
    window.addEventListener("vanguard:navigate", handler);
    window.addEventListener("vanguard:open-menu", openMenu);
    window.addEventListener("vanguard:open-account", openAccount);
    window.addEventListener("vanguard:pasaporte", pedirPasaporte);
    return () => {
      window.removeEventListener("vanguard:navigate", handler);
      window.removeEventListener("vanguard:open-menu", openMenu);
      window.removeEventListener("vanguard:open-account", openAccount);
      window.removeEventListener("vanguard:pasaporte", pedirPasaporte);
    };
  }, [handleTabChange]);

  // ===== v108.0 MODO INMERSIÓN + TECLA F + DUPLICAR PESTAÑA =====
  // El fullscreen nativo es el mejor esfuerzo (algunos navegadores lo bloquean
  // en iframes); el MODO INMERSIÓN siempre funciona: aparta la cabecera, la
  // barra Google y la franja, y deja el contenido solo en pantalla.
  const alternarInmersion = useCallback(() => {
    const next = !inmersionRef.current;
    inmersionRef.current = next;
    setInmersion(next);
    try {
      if (next && !document.fullscreenElement) {
        const p = document.documentElement.requestFullscreen?.();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } else if (!next && document.fullscreenElement) {
        const p = document.exitFullscreen?.();
        if (p && typeof p.catch === "function") p.catch(() => {});
      }
    } catch {}
    if (next) toast(t("inmi.entrar"), { description: t("inmi.hint") });
    sfx.tab();
  }, [t]);

  // Esc sale de la inmersión; si el usuario sale del fullscreen nativo con Esc,
  // fullscreenchange mantiene el estado coherente.
  useEffect(() => {
    if (!inmersion) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        inmersionRef.current = false;
        setInmersion(false);
      }
    };
    const onFs = () => {
      if (!document.fullscreenElement && inmersionRef.current) {
        inmersionRef.current = false;
        setInmersion(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [inmersion]);

  // Tecla F (fuera de campos de texto): entrar/salir de pantalla completa
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "f" || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      alternarInmersion();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [alternarInmersion]);

  // v108: duplicar pestaña como el navegador (respeta el tope honesto de 9)
  const duplicarPestana = useCallback(
    (k: TabKey) => {
      if (pestanas.length >= MAX_PESTANAS) {
        toast(t("cromo.tope"), { description: `${MAX_PESTANAS} ${t("cromo.topeDesc")}` });
        return;
      }
      const i = pestanas.indexOf(k);
      if (i < 0) return;
      const n = [...pestanas];
      n.splice(i + 1, 0, k);
      setPestanas(n);
      sfx.tab();
    },
    [pestanas, t]
  );

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
      {/* v72.0: intro cinematográfica de vuelta — letras realistas + luna llena */}
      <IntroCinematica />
      {/* v110.0 MATRIZ 2100: MOTOR 3D GLOBAL — traduce los ajustes del usuario a
          CSS vars en :root y alimenta el paralaje con el puntero (rAF, 60 FPS) */}
      <Motor3D />
      {/* v121.0 LA CAMA MÁS CÓMODA: el motor de personalización — letra, acento,
          movimiento, densidad y modo cama a CSS vars en :root (cero re-render) */}
      <MotorCama />
      {/* v115.0 SINGULARIDAD: el ARQUITECTO trabaja en PERPETUO desde cualquier sala */}
      <MotorArquitecto />
      {/* v108.0 MODO INMERSIÓN: la cabecera, la barra Google y la franja se
          apartan (display:contents cuando no — cero cajas fantasma) para que
          el contenido mande y se vea TODO */}
      <div className={inmersion ? "hidden" : "contents"}>
      <HudHeader
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenLog={() => setLogOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
      />
      {/* v96.0 GOOGLE VIVO: la estructura de las webs más usadas del mundo —
          letras vivas + buscador central + INVESTIGAR + rejilla de apps */}
      <GoogleBar active={tab} onChange={handleTabChange} onOpenMenu={() => setMenuOpen(true)} />
      {/* v106.0 PESTAÑAS DE CROMO: la franja del navegador interno — pestañas
          abiertas, + para la NUEVA, × para cerrar, buscar y menú a la derecha */}
      <ChromeTabs
        pestanas={pestanas}
        activa={tab}
        onElegir={handleTabChange}
        onCerrar={cerrarPestana}
        onCerrarVarias={cerrarVarias}
        onReordenar={setPestanas}
        onNueva={abrirNueva}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onDuplicar={duplicarPestana}
        onInmersion={alternarInmersion}
      />
      {/* v42.3: la pestaña del navegador muestra "(N EN LÍNEA)" con 2+ guerreros */}
      <LiveTitle />
      <StatsTicker />
      {/* v67.0 EL HANGAR: capa de crisis global + easter eggs vivos en toda la app */}
      <ProtocoloRojo />
      <EasterEggs />
      </div>

      {/* v108: píldora flotante para salir de la inmersión — siempre a mano */}
      {inmersion && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-[70]"
        >
          <button
            onClick={alternarInmersion}
            data-salir-inmi108
            title={t("inmi.salir")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-green-hud/60 bg-[#0B0B12]/92 backdrop-blur-md text-green-hud font-mono text-[10px] font-bold uppercase tracking-widest shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9)] hover:bg-green-hud/20 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="4 14 10 14 10 20" />
              <polyline points="20 10 14 10 14 4" />
              <line x1="14" y1="10" x2="21" y2="3" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            {t("inmi.salir")}
            <span className="opacity-50 normal-case tracking-normal">Esc</span>
          </button>
        </motion.div>
      )}

      {/* v121.0 TRANSICIÓN MAESTRA: el dueño ELIGE cómo viaja entre salas
          (deslizar · cine 3D · telón · hiperespacio · disolver) + sello vivo */}
      <TransicionMaestra tabKey={tab} label={APP_VERSION_LABEL} />
      <CineVivo />

      <main className="flex-1 px-3 py-4 sm:px-4 sm:py-6 max-w-7xl w-full mx-auto pb-20" data-swipe118="1" onTouchStart={alTocarBorde} onTouchEnd={alSoltarBorde}>
        {/* v118 CRONOATLAS: transición DIRECCIONAL — adelante entra por la
            derecha, atrás invierte el movimiento; AnimatePresence pasa el
            custom a la pestaña saliente para que el exit también lo sepa. */}
        <AnimatePresence mode="wait" initial={false} custom={dirMov}>
          <motion.div
            key={tab}
            className="panel-stagger"
            custom={dirMov}
            variants={variantesSala}
            initial="entra"
            animate="centro"
            exit="sale"
          >
            <PanelErrorBoundary resetKey={tab} moduleName={`panel ${tab}`}>
        {tab === "inicio" && (
          <>
            {/* v120.0 GRAN SALTO 3D: la MEGALÓPOLIS viva abre la portada —
                ciclo día/noche EN TIEMPO REAL, región que gira (sola cada
                día, a mano con fundido) y letras 3D volumétricas */}
            <CiudadHero />
            {/* v67.0 EL HANGAR: el costo del mundo y tu rival, siempre a la vista */}
            <CostoGuerra />
            <RivalStrip />
            <HomePanel />
            {/* v121.0 FRANJA ILUSTRADA: las ilustraciones vivas FUNCIONALES
                viven ENTRE los bloques de la casa — satélite, globo y ciudad
                procedurales + la hora real del visitante */}
            <FranjaIlustrada titulo="EL MUNDO NO SE DETIENE" />
            {/* v46.0: la meta comunitaria encima de todo — cada visitante ve el objetivo y su recompensa */}
            <GoalBanner />
            {/* v49.0: misión de difusión 200 enlaces — progreso real desde la BD, recompensa global al llegar */}
            <ShareGoalBanner />
            {/* v18: sección de crecimiento bajo la portada — conversión de visitantes a embajadores */}
            <GrowthShare />
            {/* v34: kit de reclutamiento (mensajes para copiar + medidor de agentes) y FAQ SEO */}
            <PromoKit />
            {/* v37 MISIÓN 100: arsenal de 100 enlaces + contador global en vivo */}
            <Mission100 />
            <SeoFaq />
          </>
        )}
        {tab === "briefing" && <DailyBriefingPanel />}
        {tab === "mapa" && <MapPanel />}
        {tab === "operaciones" && <OpsPanel />}
        {tab === "misiones" && <MissionsPanel />}
        {tab === "noticias" && <NewsPanel />}
        {tab === "redaccion" && <RedaccionPanel />}
        {/* v106.0 PESTAÑAS DE CROMO — la página para ELEGIR destino */}
        {tab === "nueva" && <NuevaPanel />}
        {/* v121.0 MODO ATLAS MUNDIAL — el modo que faltaba: cada país y cada
            persona importante del planeta con su ubicación EN VIVO */}
        {tab === "atlas" && <AtlasPanel />}
        {/* v121.0 LA CAMA — la habitación de personalización total */}
        {tab === "cama" && <CamaPanel />}
        {/* v106.0 MURALLA DE VIGILANCIA — el corazón del OBSERVATORIO */}
        {tab === "observatorio" && <ObservatorioPanel />}
        {tab === "experimental" && <ExperimentalPanel />}
        {/* v115.0 SINGULARIDAD — la sala donde el agente autónomo construye delante de ti */}
        {tab === "arquitecto" && <ArquitectoPanel />}
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
        {tab === "pulso" && <PulsoPanel />}
        {/* v67.0 EL HANGAR: base 3D del agente */}
        {tab === "hangar" && <HangarPanel />}
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
        {/* v102.0 LA CIUDADELA — taller de juegos de la comunidad */}
        {tab === "taller" && <TallerJuegosPanel />}
        {tab === "bookmaker" && <BookmakerPanel />}
        {tab === "enciclopedia" && <EncyclopediaPanel />}
        {tab === "curiosidades" && <CuriosidadesPanel />}
        {tab === "epocas" && <ErasPanel />}
        {tab === "conquistas3d" && <Conquistas3DPanel />}
        {tab === "contadores" && <CountersPanel />}
        {tab === "carteles" && <CartelesPanel />}
        {tab === "bolsa" && <MarketsPanel />}
        {tab === "hacienda" && <HaciendaPanel />}
        {tab === "divisas" && <DivisasPanel />}
        {/* v13 — centro de mando global */}
        {tab === "osint" && <OsintPanel />}
        {tab === "warsim" && <WarsimPanel />}
        {/* v100.0 LABORATORIO DEL DESTINO: ¿y si...? */}
        {tab === "laboratorio" && <LaboratorioPanel />}
        {tab === "cambios" && <CambiosPanel />}
        {tab === "analista" && <AnalistaPanel />}
        {/* v102.0 LA CIUDADELA — fortaleza de acero (seguridad visible) */}
        {tab === "fortaleza" && <FortalezaPanel />}
        {tab === "escenarios" && <EscenariosPanel />}
        {tab === "espionaje" && <EspionagePanel />}
        {tab === "crisis" && <CrisisPanel />}
        {tab === "radar" && <RadarPanel />}
        {tab === "ojodios" && <OjoDiosPanel />}
        {tab === "verdades" && <InfinitaPanel />}
        {tab === "verifica" && <VerificaPanel />}
        {tab === "centinela" && <CentinelaPanel />}
        {tab === "espectro" && <EspectroPanel />}
        {/* v89.0 OPERACIÓN ESPEJO */}
        {tab === "pulsos" && <PulsosPanel />}
        {tab === "evaluacion" && <EvaluacionPanel />}
        {tab === "perdidas" && <PerdidasPanel />}
        {tab === "frentes" && <FrentesPanel />}
        {tab === "simulador" && <SimuladorPanel />}
        {tab === "canales" && <CanalesPanel />}
        {tab === "mundial" && <MundialPanel />}
        {tab === "wikiguerra" && <WikiguerraPanel />}
        {tab === "cielos" && <CielosPanel />}
        {tab === "ciber" && <CiberPanel />}
        {tab === "sismo" && <SismoPanel />}
        {tab === "mercados" && <MercadosPanel />}
        {/* v91.0 AUGE Y CAÍDA: RTS territorial jugable */}
        {tab === "imperio" && <ImperioPanel />}
        {/* v92.0 OJO DEL MUNDO: tercera hornada de espejos */}
        {tab === "pronosticos" && <PronosticosPanel />}
        {tab === "enclaves" && <EnClavePanel />}
        {tab === "extranjera" && <ExtranjeraPanel />}
        {tab === "geoint" && <GeointPanel />}
        {tab === "monitorglobal" && <MonitorGlobalPanel />}
        {tab === "canalbrief" && <CanalBriefPanel />}
        {tab === "estrategia" && <EstrategiaGlobalPanel />}
        {/* v94.0 GOOGLES TOTAL: el Google de los problemas geopolíticos */}
        {tab === "googles" && <GooglesPanel />}
        {/* v98.0 ORO TOTAL: la búsqueda visual de Vanguard */}
        {tab === "imagenes" && <ImagenesPanel />}
        {tab === "mente" && <MentePanel />}
        {/* v95.0 EXPEDIENTE TOTAL: la red, el espejo y la máquina del tiempo */}
        {tab === "grafo" && <GrafoPanel />}
        {tab === "espejo" && <EspejoPanel />}
        {tab === "maquina" && <MaquinaPanel />}
        {/* v93.0 VANGUARD EARTH: el googles de Vanguard */}
        {tab === "tierra" && <TierraPanel />}
        {tab === "mipais" && <MiPaisPanel />}
        {/* v97.0 PANTALLA TOTAL: VANGUARD TV — feed vertical + sala de proyección */}
        {tab === "pantalla" && <PantallaPanel />}
        {/* v57 ARCHIVO SECRETO: expedientes desclasificados coleccionables */}
        {tab === "expedientes" && <ExpedientesPanel />}
        {/* v59 ALEJANDRÍA OSCURA: teorías, armas y civilizaciones */}
        {tab === "oscura" && <OscuraPanel />}
        {tab === "geopolitica" && <GeopoliticaPanel />}
        {tab === "planeta" && <PlanetaPanel />}
        {tab === "biblioteca" && <BibliotecaPanel />}
        {tab === "tribunal" && <TribunalPanel />}
        {tab === "alianzas" && <AlianzasPanel />}
        {tab === "agente" && <AgentePanel />}
        {tab === "agenteia" && <AgenteIaPanel />}
        {tab === "obras" && <MuroObrasPanel />}
        {tab === "gancho" && <HooksPanel />}
        {tab === "ranking" && <RankingPanel />}
        {tab === "foros" && <ForumPanel />}
        {tab === "consejoia" && <ConsejoIaPanel />}
        {/* v85 — EL MUNDO DENTRO: empleos con sueldos, AR y constructor de mapas */}
        {tab === "empleos" && <EmpleosPanel />}
        {tab === "armodo" && <ModoArPanel />}
        {tab === "mapascrea" && <CreadorMapasPanel />}
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

      <MegaMenu open={menuOpen} onChange={handleTabChange} onClose={() => setMenuOpen(false)} onOpenSearch={() => setSearchOpen(true)} />
      {/* v47.0: paleta de búsqueda — Ctrl+K, tecla / o botón Buscar del nav */}
      <SectionSearch open={searchOpen} onClose={() => setSearchOpen(false)} onChange={(tab) => handleTabChange(tab as TabKey)} />
      <AccountModal open={accountOpen} onClose={() => { setAccountOpen(false); setGatePasaporte(null); }} gate={gatePasaporte} />
      {/* v55.0: DailyLoginModal ahora vive en RetentionLayer (layout global) */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <ActivityLogModal open={logOpen} onOpenChange={setLogOpen} />
      <MusicPlayer />
      <RealtimeStatus />
      <ConnectionWatchdog />
      <FortunaLluvia />
      {/* v34 — recepción del recluta: procesa ?ref= y da bono de bienvenida */}
      <ReferralLanding />
      {/* v33 ESCUELA DE GUERRA — manual del comandante (auto en 1ª visita) */}
      <TutorialModal />
      {/* v105.0 EL NAVEGADOR — brújula global "¿qué quiero hacer hoy?" */}
      <Navegador />
    </div>
  );
}
