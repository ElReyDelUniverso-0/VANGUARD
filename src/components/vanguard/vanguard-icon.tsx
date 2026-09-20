"use client";

// Registro central de iconos (reemplaza emojis) — claves usadas en game-data / camera-data
import {
  Crosshair, Star, Medal, Trophy, Flame, Zap, Gem, FileText, BookOpen, Newspaper,
  Image as ImageIcon, Brain, FlaskConical, Map, CheckCircle2, Coins, Landmark, Key,
  Compass, Crown, Swords, Sunrise, Radio, Globe, Radar, Radiation, Shield, Cross,
  Castle, Flag, Satellite, Glasses, FolderOpen, HeartPulse, Palette, Gift, Package,
  Pill, Mountain, Palmtree, TreePine, Fuel, Skull, Bomb, Car, Anchor, Dog, Ghost,
  Bug, Bird, Camera, Video, Film, BarChart3, Moon, Sun, Target, Gamepad2, Signal, Vote, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const REGISTRY: Record<string, LucideIcon> = {
  crosshair: Crosshair,
  target: Target,
  star: Star,
  medal: Medal,
  trophy: Trophy,
  flame: Flame,
  zap: Zap,
  gem: Gem,
  "file-text": FileText,
  "book-open": BookOpen,
  newspaper: Newspaper,
  image: ImageIcon,
  brain: Brain,
  flask: FlaskConical,
  crystal: Gem,
  map: Map,
  "check-circle": CheckCircle2,
  coins: Coins,
  landmark: Landmark,
  key: Key,
  compass: Compass,
  crown: Crown,
  swords: Swords,
  sunrise: Sunrise,
  radio: Radio,
  globe: Globe,
  radar: Radar,
  radiation: Radiation,
  shield: Shield,
  cross: Cross,
  castle: Castle,
  flag: Flag,
  satellite: Satellite,
  glasses: Glasses,
  folder: FolderOpen,
  "heart-pulse": HeartPulse,
  palette: Palette,
  gift: Gift,
  package: Package,
  pill: Pill,
  mountain: Mountain,
  palmtree: Palmtree,
  tree: TreePine,
  fuel: Fuel,
  skull: Skull,
  bomb: Bomb,
  car: Car,
  anchor: Anchor,
  dog: Dog,
  ghost: Ghost,
  bug: Bug,
  bird: Bird,
  camera: Camera,
  cctv: Video,
  video: Video,
  film: Film,
  "bar-chart": BarChart3,
  moon: Moon,
  sun: Sun,
  gamepad: Gamepad2,
  signal: Signal,
  vote: Vote,
  poll: BarChart3,
};

export function VIcon({ k, className }: { k: string; className?: string }) {
  const Icon = REGISTRY[k] ?? Crosshair;
  return <Icon className={cn("w-4 h-4", className)} />;
}

export function VIconBox({ k, className, boxClass }: { k: string; className?: string; boxClass?: string }) {
  const Icon = REGISTRY[k] ?? Crosshair;
  return (
    <div className={cn("flex items-center justify-center rounded-sm border border-amber-hud/40 bg-secondary/60", boxClass ?? "w-8 h-8")}>
      <Icon className={cn("w-4 h-4 text-amber", className)} />
    </div>
  );
}
