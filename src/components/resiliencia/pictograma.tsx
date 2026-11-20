// v420.1 · MISIÓN 09 · el pictograma por nombre (cero emoji en la interfaz)
import {
  Accessibility, Activity, BookMarked, BookOpen, CheckSquare, Droplets, Flame,
  Globe2, GraduationCap, Hammer, Home, Landmark, Library, ListChecks, Mountain,
  Radio, RefreshCw, Shield, Snowflake, Sprout, Sun, SunDim, Tornado, Users,
  Waves, Wind, Wrench, Zap, Info, type LucideIcon,
} from "lucide-react";

const TRAZOS: Record<string, LucideIcon> = {
  accessibility: Accessibility,
  activity: Activity,
  "book-marked": BookMarked,
  "book-open": BookOpen,
  "check-square": CheckSquare,
  droplets: Droplets,
  flame: Flame,
  "globe-2": Globe2,
  "graduation-cap": GraduationCap,
  hammer: Hammer,
  home: Home,
  landmark: Landmark,
  library: Library,
  "list-checks": ListChecks,
  mountain: Mountain,
  radio: Radio,
  "refresh-cw": RefreshCw,
  shield: Shield,
  snowflake: Snowflake,
  sprout: Sprout,
  sun: Sun,
  "sun-dim": SunDim,
  tornado: Tornado,
  users: Users,
  waves: Waves,
  wind: Wind,
  wrench: Wrench,
  zap: Zap,
};

export function Pictograma({ nombre, className = "h-4 w-4" }: { nombre: string; className?: string }) {
  const Trazo = TRAZOS[nombre] ?? Info;
  return <Trazo aria-hidden className={className} strokeWidth={1.6} />;
}
