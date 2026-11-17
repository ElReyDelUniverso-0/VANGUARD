"use client";

// v405.10 · LOS TRAZOS DE LA NAVEGACIÓN
// Un solo sitio donde el nombre de un icono (texto, guardado en el registro)
// se convierte en un dibujo. El registro de espacios no importa React: así la
// barra puede hacerse dinámica sin arrastrar el paquete de iconos enteros.
import {
  Globe, Globe2, Layers, BookOpen, Crosshair, Target, Swords, Users, Activity,
  Eye, FlaskConical, Shield, Gamepad2, GitBranch, Newspaper, Home, Radio, Siren,
  Images, Languages, FlipHorizontal2, Fingerprint, Radar, Skull, Landmark, Brain,
  VenetianMask, FileSearch, Search, Archive, Hourglass, FileStack, BookMarked,
  History, Gavel, CircleDollarSign, Banknote, Gem, TrendingUp, Dices, Coins,
  UserCog, Hammer, Wrench, Briefcase, Bot, LayoutGrid, Cpu, Mic, Sparkles, Castle,
  UserCheck, Joystick, Medal, Trophy, MessagesSquare, Crown, Vote, ShieldCheck,
  HelpCircle, Settings, Compass, Gauge, TowerControl, ShieldAlert, ChevronLeft,
  ChevronRight, ChevronUp, ChevronDown, SlidersHorizontal, X, Check, ArrowRight,
  Map as MapIcon, Grid2x2, Rocket, type LucideIcon,
} from "lucide-react";

const TRAZOS: Record<string, LucideIcon> = {
  globe: Globe, "globe-2": Globe2, layers: Layers, "book-open": BookOpen,
  crosshair: Crosshair, target: Target, swords: Swords, users: Users, activity: Activity,
  eye: Eye, "flask-conical": FlaskConical, shield: Shield, "gamepad-2": Gamepad2,
  "git-branch": GitBranch, newspaper: Newspaper, home: Home, radio: Radio, siren: Siren,
  images: Images, languages: Languages, "flip-horizontal-2": FlipHorizontal2,
  fingerprint: Fingerprint, radar: Radar, skull: Skull, landmark: Landmark, brain: Brain,
  "venetian-mask": VenetianMask, "file-search": FileSearch, search: Search, archive: Archive,
  hourglass: Hourglass, "file-stack": FileStack, "book-marked": BookMarked, history: History,
  gavel: Gavel, "circle-dollar-sign": CircleDollarSign, banknote: Banknote, gem: Gem,
  "trending-up": TrendingUp, dices: Dices, coins: Coins, "user-cog": UserCog,
  hammer: Hammer, wrench: Wrench, briefcase: Briefcase, bot: Bot, "layout-grid": LayoutGrid,
  cpu: Cpu, mic: Mic, sparkles: Sparkles, castle: Castle, "user-check": UserCheck,
  joystick: Joystick, medal: Medal, trophy: Trophy, "messages-square": MessagesSquare,
  crown: Crown, vote: Vote, "shield-check": ShieldCheck, "help-circle": HelpCircle,
  settings: Settings, compass: Compass, gauge: Gauge, "tower-control": TowerControl,
  "shield-alert": ShieldAlert, map: MapIcon, grid: Grid2x2, rocket: Rocket,
  "chevron-left": ChevronLeft, "chevron-right": ChevronRight, "chevron-up": ChevronUp,
  "chevron-down": ChevronDown, sliders: SlidersHorizontal, x: X, check: Check,
  arrow: ArrowRight,
};

export function IconoNav({ nombre, className = "h-4 w-4" }: { nombre: string; className?: string }) {
  const C = TRAZOS[nombre] ?? TRAZOS.compass;
  return <C className={className} strokeWidth={1.75} />;
}

export const TRAZOS_DISPONIBLES = Object.keys(TRAZOS);
