"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useT, tabLabel, TAB_SHORTS } from "@/lib/i18n";
import {
  Map, Target, Newspaper, Images, Brain, ShoppingBag, Trophy, BarChart3, Layers,
  FileText, Award, Gamepad2, ScrollText, Zap, ChevronLeft, ChevronRight, Users,
  Bell, Flame, Globe, HelpCircle, Swords, Skull, Dice5, Globe2, Video,
  Radio, MessagesSquare, Vote, Command, Radar, Signal, TrendingUp, Shield,
  Castle, CircleDollarSign, MessageCircle, Network, Gift, Medal, Rocket, Fingerprint,
  Joystick, Flag, Coins, BookOpen, Sparkles, Hourglass, Earth, Activity, VenetianMask,
  Siren, BookLock, Gavel, BrainCircuit, ShieldAlert, Home, LayoutGrid,
  Bomb, Clapperboard, Banknote, UserCog, Scale, MapPinned, Flame as FlameIcon, AlertOctagon,
  Crosshair, UserCheck, Send, Laugh, Palette, Satellite,
  Wand2, Landmark,
} from "lucide-react";

export type TabKey =
  | "inicio"
  | "briefing" | "mapa" | "misiones" | "noticias" | "galeria" | "briefings"
  | "quiz" | "predicciones" | "fusion" | "recompensas" | "tienda" | "logros"
  | "minijuego" | "registro" | "torneos" | "retos" | "estadisticas" | "amigos"
  | "notificaciones" | "racha" | "ayuda" | "camaras" | "combate" | "historia"
  | "muertes" | "apuestas" | "conquista" | "foros" | "encuestas" | "videos"
  | "mundo" | "bolsa" | "salas" | "multijugador" | "gancho" | "ranking"
  | "dron" | "detective"
  // v12 expansion x100
  | "edad" | "arcade" | "bookmaker" | "enciclopedia" | "curiosidades"
  | "epocas" | "conquistas3d" | "contadores" | "carteles"
  // v13 centro de mando global
  | "osint" | "warsim" | "espionaje" | "crisis" | "radar"
  | "biblioteca" | "tribunal" | "alianzas" | "agente"
  // v19 mundo expandido: frentes en vivo, estudio de video, divisas, perfil
  | "frente" | "estudio" | "divisas" | "perfil"
  // v22 directos en vivo con donaciones
  | "directos"
  // v23 en vivo mundial (streaming real) + comunidad de contribuidores
  | "envivo" | "contribuidores"
  // v24 verdad cruda: el lado oscuro de los conflictos
  | "abusos" | "incidentes" | "memorial" | "sala18" | "dronguerra" | "recluta" | "embajadores" | "telegram"
  // v25 memes geopolíticos: estudio de memes con galería comunitaria
  | "memes"
  // v26 comunidad creadora: todo lo sube la gente
  | "creador" | "armeria" | "maps"
  // v27 estudios creadores: un estudio para cada sección + gobierno + bolsa
  | "studios" | "gobierno" | "bolsamonedas"
  // v28 para ti: feed vertical estilo TikTok/YouTube con el contenido de la comunidad
  | "foryou";

interface TabDef {
  key: TabKey;
  label: string;
  short: string;
  icon: React.ReactNode;
  color: string;
}

interface SectionDef {
  key: string;
  label: string;
  short: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
  tabs: TabDef[];
}

const TABS: Record<TabKey, TabDef> = {
  inicio:        { key: "inicio",        label: "Inicio (Noticias)", short: "INICIO", icon: <Home className="w-3.5 h-3.5" />, color: "amber" },
  briefing:      { key: "briefing",      label: "Briefing diario",   short: "BRIEFING", icon: <Globe className="w-3.5 h-3.5" />, color: "amber" },
  misiones:      { key: "misiones",      label: "Misiones",          short: "MISIONES", icon: <Target className="w-3.5 h-3.5" />, color: "red" },
  retos:         { key: "retos",         label: "Retos diarios",     short: "RETOS", icon: <Zap className="w-3.5 h-3.5" />, color: "amber" },
  gancho:        { key: "gancho",        label: "Centro de Ganancias", short: "GANANCIAS", icon: <Gift className="w-3.5 h-3.5" />, color: "amber" },
  conquista:     { key: "conquista",     label: "Conquista",         short: "CONQUISTA", icon: <Globe2 className="w-3.5 h-3.5" />, color: "amber" },
  mundo:         { key: "mundo",         label: "Mundo de Guerra",   short: "GUERRA",   icon: <Castle className="w-3.5 h-3.5" />, color: "red" },
  multijugador:  { key: "multijugador",  label: "Multijugador",      short: "MULTI",    icon: <Network className="w-3.5 h-3.5" />, color: "red" },
  detective:     { key: "detective",     label: "Archivos Nación (Detective)", short: "DETECTIVE", icon: <Fingerprint className="w-3.5 h-3.5" />, color: "violet" },

  // ====== v12: expansion x100 ======
  edad:          { key: "edad",          label: "Age of Nations",    short: "AOF",     icon: <Flag className="w-3.5 h-3.5" />, color: "red" },
  arcade:        { key: "arcade",        label: "Arcade Pack",       short: "ARCADE",  icon: <Joystick className="w-3.5 h-3.5" />, color: "red" },
  bookmaker:     { key: "bookmaker",     label: "BetNación (Casa de Apuestas)", short: "BETNACIÓN", icon: <Coins className="w-3.5 h-3.5" />, color: "green" },
  enciclopedia:  { key: "enciclopedia",  label: "Enciclopedia mundial", short: "ENCICLO", icon: <BookOpen className="w-3.5 h-3.5" />, color: "cyan" },
  curiosidades:  { key: "curiosidades",  label: "Curiosidades",      short: "CURIOSO", icon: <Sparkles className="w-3.5 h-3.5" />, color: "amber" },
  epocas:        { key: "epocas",        label: "Épocas antiguas",   short: "EPOCAS",  icon: <Hourglass className="w-3.5 h-3.5" />, color: "violet" },
  conquistas3d:  { key: "conquistas3d",  label: "Conquistas 3D",     short: "CONQ.3D", icon: <Earth className="w-3.5 h-3.5" />, color: "cyan" },
  contadores:    { key: "contadores",    label: "Contadores mundiales", short: "CONTADORES", icon: <Activity className="w-3.5 h-3.5" />, color: "red" },
  carteles:      { key: "carteles",      label: "Carteles",          short: "CARTELES", icon: <VenetianMask className="w-3.5 h-3.5" />, color: "violet" },

  // ====== v13: centro de mando global ======
  osint:         { key: "osint",         label: "Sala OSINT (15 capas)", short: "OSINT",  icon: <Radar className="w-3.5 h-3.5" />, color: "cyan" },
  warsim:        { key: "warsim",        label: "Simulador de Guerras", short: "WARSIM", icon: <Swords className="w-3.5 h-3.5" />, color: "red" },
  espionaje:     { key: "espionaje",     label: "Red de Espionaje",  short: "ESPIONAJE", icon: <VenetianMask className="w-3.5 h-3.5" />, color: "violet" },
  crisis:        { key: "crisis",        label: "Crisis Mundial",    short: "CRISIS", icon: <Siren className="w-3.5 h-3.5" />, color: "red" },
  // v19
  frente:        { key: "frente",        label: "Líneas de Frente en Vivo", short: "FRENTE", icon: <Bomb className="w-3.5 h-3.5" />, color: "red" },
  estudio:       { key: "estudio",       label: "Estudio de Video",  short: "ESTUDIO", icon: <Clapperboard className="w-3.5 h-3.5" />, color: "red" },
  directos:      { key: "directos",      label: "Directos en Vivo",  short: "DIRECTOS", icon: <Radio className="w-3.5 h-3.5" />, color: "red" },
  envivo:        { key: "envivo",        label: "EN VIVO Mundial (Noticias + Comunidad)", short: "EN VIVO", icon: <Signal className="w-3.5 h-3.5" />, color: "red" },
  contribuidores:{ key: "contribuidores",label: "Comunidad de Contribuidores", short: "CONTRIB", icon: <Users className="w-3.5 h-3.5" />, color: "green" },
  // v24 verdad cruda
  abusos:        { key: "abusos",        label: "Crímenes y Abusos", short: "ABUSOS", icon: <Scale className="w-3.5 h-3.5" />, color: "red" },
  incidentes:    { key: "incidentes",    label: "Mapa de Incidentes", short: "INCIDEN", icon: <MapPinned className="w-3.5 h-3.5" />, color: "red" },
  memorial:      { key: "memorial",      label: "Memorial †", short: "MEMORIAL", icon: <FlameIcon className="w-3.5 h-3.5" />, color: "violet" },
  sala18:        { key: "sala18",        label: "Sala Roja (18+)", short: "SALA 18+", icon: <AlertOctagon className="w-3.5 h-3.5" />, color: "red" },
  dronguerra:    { key: "dronguerra",    label: "Guerra de Drones", short: "DR.GUERRA", icon: <Crosshair className="w-3.5 h-3.5" />, color: "red" },
  recluta:       { key: "recluta",       label: "Cómo se Recluta (3D)", short: "RECLUTA", icon: <UserCheck className="w-3.5 h-3.5" />, color: "cyan" },
  embajadores:   { key: "embajadores",   label: "Embajadores por País", short: "EMBAJAD", icon: <Vote className="w-3.5 h-3.5" />, color: "green" },
  telegram:      { key: "telegram",      label: "Bot de Telegram", short: "TELEGRAM", icon: <Send className="w-3.5 h-3.5" />, color: "cyan" },
  // v25 memes geopolíticos
  memes:         { key: "memes",         label: "Estudio de Memes",  short: "MEMES",   icon: <Laugh className="w-3.5 h-3.5" />, color: "violet" },
  // v26 comunidad creadora: todo lo sube la gente
  creador:       { key: "creador",       label: "Estudio Comunitario (sube tu contenido)", short: "CREADOR", icon: <Palette className="w-3.5 h-3.5" />, color: "violet" },
  armeria:       { key: "armeria",       label: "Armería Real (fotos + armado)", short: "ARMERÍA", icon: <Crosshair className="w-3.5 h-3.5" />, color: "red" },
  maps:          { key: "maps",          label: "Google Maps de Conflictos", short: "G.MAPS", icon: <Satellite className="w-3.5 h-3.5" />, color: "cyan" },
  // v27 estudios creadores
  studios:       { key: "studios",       label: "Estudios Creadores (noticias, banderas, mapas, música)", short: "ESTUDIOS", icon: <Wand2 className="w-3.5 h-3.5" />, color: "violet" },
  gobierno:      { key: "gobierno",      label: "Gobierno Mundial (presidente, decretos, reclutar)", short: "GOBIERNO", icon: <Landmark className="w-3.5 h-3.5" />, color: "amber" },
  bolsamonedas:  { key: "bolsamonedas",  label: "Bolsa de Monedas (crea tu propia moneda)", short: "MONEDAS", icon: <Coins className="w-3.5 h-3.5" />, color: "green" },
  // v28 para ti
  foryou:        { key: "foryou",        label: "Para Ti (feed de la comunidad)", short: "PARA TI", icon: <Flame className="w-3.5 h-3.5" />, color: "red" },
  divisas:       { key: "divisas",       label: "Divisas del Mundo", short: "DIVISAS", icon: <Banknote className="w-3.5 h-3.5" />, color: "green" },
  perfil:        { key: "perfil",        label: "Personalizar Perfil", short: "PERFIL", icon: <UserCog className="w-3.5 h-3.5" />, color: "violet" },
  radar:         { key: "radar",         label: "Radar Desinfo + Conexiones", short: "RADAR", icon: <ShieldAlert className="w-3.5 h-3.5" />, color: "green" },
  biblioteca:    { key: "biblioteca",    label: "Biblioteca Secreta", short: "BIBLIO", icon: <BookLock className="w-3.5 h-3.5" />, color: "amber" },
  tribunal:      { key: "tribunal",      label: "Juicio Histórico",  short: "TRIBUNAL", icon: <Gavel className="w-3.5 h-3.5" />, color: "amber" },
  alianzas:      { key: "alianzas",      label: "Alianzas",          short: "ALIANZAS", icon: <Flag className="w-3.5 h-3.5" />, color: "violet" },
  agente:        { key: "agente",        label: "Perfil del Agente (IQ)", short: "AGENTE", icon: <BrainCircuit className="w-3.5 h-3.5" />, color: "cyan" },

  mapa:          { key: "mapa",          label: "Mapa mundial",      short: "MAPA", icon: <Map className="w-3.5 h-3.5" />, color: "amber" },
  noticias:      { key: "noticias",      label: "Noticias",          short: "NOTICIAS", icon: <Newspaper className="w-3.5 h-3.5" />, color: "amber" },
  galeria:       { key: "galeria",       label: "Galería OSINT",     short: "GALERÍA", icon: <Images className="w-3.5 h-3.5" />, color: "violet" },
  briefings:     { key: "briefings",     label: "Briefings clasificados", short: "BRIEFINGS", icon: <FileText className="w-3.5 h-3.5" />, color: "cyan" },
  camaras:       { key: "camaras",       label: "Cámaras CCTV",      short: "CÁMARAS", icon: <Video className="w-3.5 h-3.5" />, color: "cyan" },

  videos:        { key: "videos",        label: "GlobalVision",      short: "VIDEOS", icon: <Signal className="w-3.5 h-3.5" />, color: "red" },
  combate:       { key: "combate",       label: "Simulador de combate", short: "COMBATE", icon: <Swords className="w-3.5 h-3.5" />, color: "red" },
  historia:      { key: "historia",      label: "Guerras históricas", short: "HISTORIA", icon: <ScrollText className="w-3.5 h-3.5" />, color: "amber" },
  muertes:       { key: "muertes",       label: "Figuras y bajas",   short: "MUERTES", icon: <Skull className="w-3.5 h-3.5" />, color: "red" },

  quiz:          { key: "quiz",          label: "Quiz geopolítico",  short: "QUIZ", icon: <Brain className="w-3.5 h-3.5" />, color: "green" },
  bolsa:         { key: "bolsa",         label: "Mercado geopolítico", short: "MERCADO", icon: <CircleDollarSign className="w-3.5 h-3.5" />, color: "green" },
  predicciones:  { key: "predicciones",  label: "Predicciones",      short: "PREDIC", icon: <BarChart3 className="w-3.5 h-3.5" />, color: "amber" },
  apuestas:      { key: "apuestas",      label: "Apuestas de guerra", short: "APUESTAS", icon: <Dice5 className="w-3.5 h-3.5" />, color: "amber" },
  estadisticas:  { key: "estadisticas",  label: "Estadísticas",      short: "ESTADÍS", icon: <TrendingUp className="w-3.5 h-3.5" />, color: "cyan" },

  logros:        { key: "logros",        label: "Logros",            short: "LOGROS", icon: <Award className="w-3.5 h-3.5" />, color: "green" },
  recompensas:   { key: "recompensas",   label: "Recompensas",       short: "RECOMP", icon: <Trophy className="w-3.5 h-3.5" />, color: "amber" },
  ranking:       { key: "ranking",       label: "Ranking global",    short: "RANKING", icon: <Medal className="w-3.5 h-3.5" />, color: "amber" },
  racha:         { key: "racha",         label: "Racha",             short: "RACHA", icon: <Flame className="w-3.5 h-3.5" />, color: "red" },
  fusion:        { key: "fusion",        label: "Fusion",            short: "FUSION", icon: <Layers className="w-3.5 h-3.5" />, color: "violet" },
  registro:      { key: "registro",      label: "Registro",          short: "REGISTRO", icon: <ScrollText className="w-3.5 h-3.5" />, color: "cyan" },

  foros:         { key: "foros",         label: "Foros",             short: "FOROS", icon: <MessagesSquare className="w-3.5 h-3.5" />, color: "cyan" },
  salas:         { key: "salas",         label: "Salas sociales",    short: "SALAS", icon: <MessageCircle className="w-3.5 h-3.5" />, color: "violet" },
  encuestas:     { key: "encuestas",     label: "Encuestas",         short: "ENCUESTAS", icon: <Vote className="w-3.5 h-3.5" />, color: "green" },
  amigos:        { key: "amigos",        label: "Amigos",            short: "AMIGOS", icon: <Users className="w-3.5 h-3.5" />, color: "cyan" },
  torneos:       { key: "torneos",       label: "Torneos",           short: "TORNEOS", icon: <Trophy className="w-3.5 h-3.5" />, color: "amber" },
  notificaciones:{ key: "notificaciones",label: "Alertas",           short: "ALERTAS", icon: <Bell className="w-3.5 h-3.5" />, color: "amber" },

  tienda:        { key: "tienda",        label: "Tienda",            short: "TIENDA", icon: <ShoppingBag className="w-3.5 h-3.5" />, color: "cyan" },
  minijuego:     { key: "minijuego",     label: "Minijuegos",        short: "MINIJUEGO", icon: <Gamepad2 className="w-3.5 h-3.5" />, color: "red" },
  dron:          { key: "dron",          label: "Dron Strike 3D",   short: "DRON",     icon: <Rocket className="w-3.5 h-3.5" />, color: "red" },
  ayuda:         { key: "ayuda",         label: "Ayuda",             short: "AYUDA", icon: <HelpCircle className="w-3.5 h-3.5" />, color: "amber" },
};

// ====== SECCIONES PRINCIPALES ======
// v11: lo que divierte y mueve dinero VA DELANTE (JUEGO + MERCADO).
// v12: JUEGO crece (Age of Nations, Arcade), MERCADO gana BetNación,
// y nueva seccion ARCHIVO MUNDIAL con enciclopedia y datos del mundo.
// v13: WARSIM y ESPIONAJE entran en juego/mercado; OSINT y RADAR lideran
// inteligencia; CRISIS y ALIANZAS encabezan social; AGENTE abre sistema.
export const SECTIONS: SectionDef[] = [
  {
    key: "inicio", label: "INICIO", short: "INICIO", icon: <Home className="w-4 h-4" />, color: "amber",
    desc: "Portada con noticias en vivo y menú de mundos",
    tabs: [TABS.inicio, TABS.noticias],
  },
  {
    key: "juego", label: "JUEGO", short: "JUEGO", icon: <Castle className="w-4 h-4" />, color: "red",
    desc: "Guerra, detective, Warsim, Age of Nations y Arcade",
    tabs: [TABS.mundo, TABS.multijugador, TABS.frente, TABS.detective, TABS.edad, TABS.arcade, TABS.dron, TABS.minijuego, TABS.combate, TABS.warsim, TABS.conquista],
  },
  {
    key: "mercado", label: "MERCADO", short: "MERCADO", icon: <CircleDollarSign className="w-4 h-4" />, color: "green",
    desc: "Exchange, apuestas, predicciones y espionaje — gana o pierde monedas",
    tabs: [TABS.bolsa, TABS.divisas, TABS.bookmaker, TABS.apuestas, TABS.predicciones, TABS.espionaje, TABS.gancho],
  },
  {
    key: "archivo", label: "ARCHIVO MUNDIAL", short: "ARCHIVO", icon: <BookOpen className="w-4 h-4" />, color: "cyan",
    desc: "Enciclopedia, épocas, 3D, contadores, biblioteca y tribunal",
    tabs: [TABS.enciclopedia, TABS.curiosidades, TABS.epocas, TABS.conquistas3d, TABS.contadores, TABS.carteles, TABS.biblioteca, TABS.tribunal],
  },
  {
    key: "comando", label: "COMANDO", short: "COMANDO", icon: <Command className="w-4 h-4" />, color: "amber",
    desc: "Centro de operaciones diarias",
    tabs: [TABS.briefing, TABS.misiones, TABS.retos, TABS.quiz],
  },
  {
    key: "inteligencia", label: "INTELIGENCIA", short: "INTEL", icon: <Radar className="w-4 h-4" />, color: "cyan",
    desc: "Sala OSINT, mapa, cables, radar y vigilancia",
    tabs: [TABS.osint, TABS.mapa, TABS.radar, TABS.galeria, TABS.briefings, TABS.camaras],
  },
  {
    key: "emisora", label: "EMISORA", short: "EMISORA", icon: <Signal className="w-4 h-4" />, color: "red",
    desc: "EN VIVO mundial, Para Ti, GlobalVision, directos con donaciones, estudio de video, memes y contenido de guerra",
    tabs: [TABS.foryou, TABS.envivo, TABS.videos, TABS.directos, TABS.estudio, TABS.memes, TABS.historia, TABS.muertes],
  },
  {
    key: "oscsuro", label: "VERDAD CRUDA", short: "VERDAD", icon: <Skull className="w-4 h-4" />, color: "red",
    desc: "El lado oscuro: abusos documentados, incidentes, memorial y material fuerte con advertencia",
    tabs: [TABS.abusos, TABS.incidentes, TABS.memorial, TABS.sala18, TABS.dronguerra, TABS.recluta],
  },
  {
    key: "creadores", label: "CREADORES", short: "CREADORES", icon: <Palette className="w-4 h-4" />, color: "violet",
    desc: "Todo lo sube la gente: estudio comunitario, armería real con fotos y mapas de Google sin lag",
    tabs: [TABS.creador, TABS.studios, TABS.armeria, TABS.maps, TABS.bolsamonedas],
  },
  {
    key: "social", label: "SOCIAL", short: "SOCIAL", icon: <MessagesSquare className="w-4 h-4" />, color: "violet",
    desc: "Crisis mundial, contribuidores, embajadores, alianzas, salas, perfil y comunidad",
    tabs: [TABS.crisis, TABS.contribuidores, TABS.gobierno, TABS.embajadores, TABS.alianzas, TABS.salas, TABS.foros, TABS.encuestas, TABS.amigos, TABS.torneos, TABS.perfil],
  },
  {
    key: "sistema", label: "SISTEMA", short: "SISTEMA", icon: <Shield className="w-4 h-4" />, color: "cyan",
    desc: "Perfil, progreso, logros, tienda, telegram y ayuda",
    tabs: [TABS.agente, TABS.logros, TABS.recompensas, TABS.ranking, TABS.racha, TABS.fusion, TABS.registro, TABS.estadisticas, TABS.notificaciones, TABS.telegram, TABS.tienda, TABS.ayuda],
  },
];

export function sectionOfTab(tab: TabKey): SectionDef {
  return SECTIONS.find((s) => s.tabs.some((t) => t.key === tab)) ?? SECTIONS[0];
}

const SECTION_COLOR: Record<string, { active: string; dot: string }> = {
  amber: { active: "text-amber bg-amber-hud border-amber-hud", dot: "bg-amber" },
  cyan: { active: "text-cyan-hud bg-cyan-hud border-cyan-hud", dot: "bg-cyan-hud" },
  red: { active: "text-red-hud bg-red-hud border-red-hud", dot: "bg-red-hud" },
  green: { active: "text-green-hud bg-green-hud border-green-hud", dot: "bg-green-hud" },
  violet: { active: "text-violet-hud bg-violet-hud border-violet-hud", dot: "bg-violet-hud" },
};

export function TabNav({
  active,
  onChange,
  onOpenMenu,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
  onOpenMenu?: () => void;
}) {
  // v21 MULTIIDIOMA: traducción de secciones/subtemas (es hasta montar → sin mismatch)
  const { t, lang } = useT();
  const section = sectionOfTab(active);
  const sectionScroll = useRef<HTMLDivElement>(null);
  const tabScroll = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = tabScroll.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = tabScroll.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [active]);

  // auto-scroll active subtab into view
  useEffect(() => {
    const el = tabScroll.current;
    if (!el) return;
    const activeBtn = el.querySelector(`[data-tab="${active}"]`) as HTMLElement | null;
    if (activeBtn) {
      const left = activeBtn.offsetLeft - el.clientWidth / 2 + activeBtn.clientWidth / 2;
      el.scrollTo({ left, behavior: "smooth" });
    }
    const secEl = sectionScroll.current;
    const secBtn = secEl?.querySelector(`[data-section="${section.key}"]`) as HTMLElement | null;
    if (secEl && secBtn) {
      const left = secBtn.offsetLeft - secEl.clientWidth / 2 + secBtn.clientWidth / 2;
      secEl.scrollTo({ left, behavior: "smooth" });
    }
  }, [active, section.key]);

  const scrollBy = (dir: number) => {
    const el = tabScroll.current;
    if (!el) return;
    el.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  return (
    <nav className="sticky top-[78px] sm:top-[109px] z-20 hud-panel border-y border-amber-hud shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)]">
      {/* Fila 1: secciones principales */}
      <div className="border-b border-amber-hud/20 relative">
        <div
          ref={sectionScroll}
          className="overflow-x-auto thin-scroll"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex gap-1 px-2 sm:px-4 py-1.5 min-w-max items-center">
            {SECTIONS.map((s) => {
              const isActive = s.key === section.key;
              const c = SECTION_COLOR[s.color] ?? SECTION_COLOR.amber;
              return (
                <button
                  key={s.key}
                  data-section={s.key}
                  onClick={() => onChange(s.tabs[0].key)}
                  title={s.desc}
                  className={cn(
                    "relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-sm font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap border transition-colors",
                    isActive ? c.active : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="section-bg"
                      className="absolute inset-0 border rounded-sm"
                      style={{ backdropFilter: "blur(2px)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {s.icon}
                    <span className="hidden sm:inline">{t(`sec.${s.key}`)}</span>
                    <span className="sm:hidden">{t(`sec.${s.key}`)}</span>
                    <span className={cn("w-1 h-1 rounded-full ml-0.5", c.dot)} />
                  </span>
                </button>
              );
            })}
            {/* MENÚ llamativo a pantalla completa */}
            {onOpenMenu && (
              <button
                onClick={onOpenMenu}
                title={t("nav.openFull")}
                aria-label={t("nav.openFull")}
                className="ml-1 mr-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest border border-electric-hud text-electric bg-electric-hud/40 hover:bg-electric-hud/70 transition-colors"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("nav.menu")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fila 2: subtemas de la seccion activa */}
      <div className="relative">
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity",
            canLeft ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity",
            canRight ? "opacity-100" : "opacity-0"
          )}
        />
        {canLeft && (
          <button onClick={() => scrollBy(-1)} className="absolute left-0 top-0 bottom-0 z-20 px-0.5 flex items-center bg-background/80 hover:bg-amber-hud/30" aria-label="Anterior">
            <ChevronLeft className="w-3.5 h-3.5 text-amber" />
          </button>
        )}
        {canRight && (
          <button onClick={() => scrollBy(1)} className="absolute right-0 top-0 bottom-0 z-20 px-0.5 flex items-center bg-background/80 hover:bg-amber-hud/30" aria-label="Siguiente">
            <ChevronRight className="w-3.5 h-3.5 text-amber" />
          </button>
        )}
        <div
          ref={tabScroll}
          className="overflow-x-auto thin-scroll"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex gap-1 px-2 sm:px-4 py-1.5 min-w-max">
            {section.tabs.map((t) => {
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  data-tab={t.key}
                  onClick={() => onChange(t.key)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-sm font-mono text-[9px] sm:text-[11px] font-bold uppercase tracking-wide transition-colors whitespace-nowrap border",
                    isActive
                      ? "text-amber border-amber-hud bg-amber-hud/30"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:border-amber-hud/40"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    {t.icon}
                    <span className="hidden sm:inline">{tabLabel(lang, t.key, t.label)}</span>
                    <span className="sm:hidden">{TAB_SHORTS[lang]?.[t.key] ?? t.short}</span>
                  </span>
                </button>
              );
            })}
            {/* contador de subtemas */}
            <span className="self-center ml-2 text-[8px] font-mono text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap hidden md:inline">
              {t(`sec.${section.key}.desc`)} · {section.tabs.length} {t("nav.subtopics")}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
