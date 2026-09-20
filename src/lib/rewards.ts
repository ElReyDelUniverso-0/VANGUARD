// Vanguard v23 — EN VIVO MUNDIAL + COMUNIDAD DE CONTRIBUIDORES.
// Tablas de recompensas oficiales, rangos de contribuidor y utilidades
// compartidas entre las API routes (server) y los paneles (cliente).

// ====== RECOMPENSAS POR CONTRIBUCIÓN ======
export const CONTRIB_REWARDS: Record<
  string,
  { coins: number; label: string; icon: string; past: string }
> = {
  reporte: { coins: 50, label: "Reporte", icon: "📡", past: "aprobado" },
  ficha: { coins: 100, label: "Ficha", icon: "📝", past: "aprobada" },
  analisis: { coins: 150, label: "Análisis", icon: "📊", past: "aprobado" },
  traduccion: { coins: 30, label: "Traducción", icon: "🌐", past: "aprobada" },
  prediccion: { coins: 200, label: "Predicción", icon: "🎯", past: "aprobada" },
};

export const MOD_REWARD = 10; // por moderar un reporte
export const VERIFY_REWARD = 10; // por verificar noticia (acierto)
export const VERIFY_DUDA_REWARD = 5;
export const VERIFY_NOSE_REWARD = 2;
export const ELITE_BADGE_BONUS = 500; // badge Fact-Checker Elite (único)

// ====== RANGOS DE CONTRIBUIDOR ======
export interface RankDef {
  key: string;
  name: string;
  min: number;
  badge: string; // emoji
  color: string; // tailwind text-*
  perk: string;
}

export const RANKS: RankDef[] = [
  { key: "novato", name: "CONTRIBUIDOR NOVATO", min: 5, badge: "🔵", color: "text-cyan-hud", perk: "Badge azul pequeño" },
  { key: "activo", name: "CONTRIBUIDOR ACTIVO", min: 25, badge: "🟢", color: "text-green-hud", perk: "Badge verde + acceso beta features" },
  { key: "corresponsal", name: "CORRESPONSAL VERIFICADO", min: 100, badge: "🟡", color: "text-amber", perk: "Badge dorado + perfil destacado · Colaboradores del mes" },
  { key: "senior", name: "EDITOR SENIOR", min: 500, badge: "🔴", color: "text-red-hud", perk: "Apruebas fichas tú mismo + panel de moderación" },
  { key: "pillar", name: "PILLAR DE LA COMUNIDAD", min: 1000, badge: "⚫", color: "text-foreground", perk: "Tu nombre en 'Acerca de' + monedas extra permanentes" },
];

export function rankOf(approved: number): { current: RankDef | null; next: RankDef | null; progress: number } {
  let current: RankDef | null = null;
  let next: RankDef | null = null;
  for (const r of RANKS) {
    if (approved >= r.min) current = r;
    else { next = r; break; }
  }
  if (!next && current) next = null;
  const progress = next ? Math.min(1, (approved - (current?.min ?? 0)) / (next.min - (current?.min ?? 0))) : 1;
  return { current, next, progress };
}

// ====== BONUS DE STREAMING POR ESPECTADORES ======
export function streamBonusCoins(avgViewers: number, minutes: number): number {
  // 10 viewers: +20/h · 50: +100/h · 100+: +300/h (prorrateado por minuto)
  const perHour = avgViewers >= 100 ? 300 : avgViewers >= 50 ? 100 : avgViewers >= 10 ? 20 : 0;
  let coins = Math.round((perHour * minutes) / 60);
  if (minutes >= 120) coins += 100; // stream de 2+ horas: +100 bonus
  return coins;
}

// ====== ANTI-SPAM ======
export const ANTI_SPAM = {
  maxFichasDay: 10,
  maxReportesDay: 20,
  maxOtrosDay: 15,
  minGapMs: 5 * 60 * 1000, // 5 minutos entre envíos
};

/** Umbral de aprobación por votos comunitarios (70% de 5+ votos). */
export function communityVerdict(confirm: number, deny: number): "aprobado" | "rechazado" | null {
  const total = confirm + deny;
  if (total < 5) return null; // aún en revisión
  return confirm / total >= 0.7 ? "aprobado" : "rechazado";
}

/** Detetección simple de duplicados: normaliza y compara similitud gruesa. */
export function looksDuplicate(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9áéíóúñü\s]/gi, "").replace(/\s+/g, " ").trim();
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  // similitud por bigramas (Jaccard) >= 0.8
  const grams = (s: string) => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) set.add(s.slice(i, i + 2));
    return set;
  };
  const gx = grams(x), gy = grams(y);
  if (gx.size === 0 || gy.size === 0) return false;
  let inter = 0;
  for (const g of gx) if (gy.has(g)) inter++;
  return inter / (gx.size + gy.size - inter) >= 0.8;
}

// ====== CANALES DE NOTICIAS EN VIVO (embeds públicos de YouTube) ======
export interface NewsChannel {
  id: string;
  name: string;
  channelId: string; // youtube channel id para /embed/live_stream
  country: string; // countryball
  lang: string; // es | en | ar | fr | ru
  perspective: string; // Occidental | Catar | Rusia | Europa | Mundial
  site: string; // url de respaldo
}

export const NEWS_CHANNELS: NewsChannel[] = [
  { id: "aljazeera", name: "Al Jazeera English", channelId: "UCNye-wNBqNL5ZzHSJdpkiRg", country: "qa", lang: "en", perspective: "Catar", site: "https://www.youtube.com/@aljazeeraenglish/live" },
  { id: "dw", name: "DW News", channelId: "UCknLrEdhRCp1aegoMqRaCZg", country: "de", lang: "en", perspective: "Occidental", site: "https://www.youtube.com/@dwnews/live" },
  { id: "france24", name: "France 24 English", channelId: "UCQfwfsi5VrQ8yKZ-UWmAoBw", country: "fr", lang: "en", perspective: "Occidental", site: "https://www.youtube.com/@France24_en/live" },
  { id: "euronews", name: "Euronews", channelId: "UCMR2ti3f4lJJKfCGAg4bEnw", country: "eu", lang: "en", perspective: "Europa", site: "https://www.youtube.com/@euronews/live" },
  { id: "rt", name: "RT (perspectiva diferente)", channelId: "UCpwvZwUam-URkxB7g4USKpg", country: "ru", lang: "ru", perspective: "Rusia", site: "https://www.youtube.com/@RTnews/live" },
];

export const LIVE_CATEGORIES = [
  { key: "analisis", label: "Análisis de conflicto", icon: "📊" },
  { key: "debate", label: "Debate geopolítico", icon: "🗣️" },
  { key: "noticias", label: "Noticias comentadas", icon: "📺" },
  { key: "historia", label: "Historia en vivo", icon: "🏛️" },
  { key: "simulacion", label: "Simulación comentada", icon: "🎮" },
];

export const REACTIONS = [
  { key: "fire", emoji: "🔥" },
  { key: "heart", emoji: "❤️" },
  { key: "wow", emoji: "😮" },
  { key: "hundred", emoji: "💯" },
  { key: "swords", emoji: "⚔️" },
];

// Nivel mínimo para hacer live (regla del sistema)
export const MIN_LEVEL_LIVE = 3;

// Reglas del live
export const LIVE_RULES = [
  { icon: "🚫", text: "Sin contenido explícito — moderación automática con IA" },
  { icon: "🌍", text: "Solo temas de geopolítica e historia" },
  { icon: "🎖️", text: `Nivel ${MIN_LEVEL_LIVE} o superior para hacer live` },
  { icon: "⛔", text: "Si violas las reglas: ban de 7 días del sistema de lives" },
];

// Recompensas de espectador
export const VIEWER_REWARDS = [
  { icon: "⏱️", text: "Ver 30 min de live: +10 monedas" },
  { icon: "🎯", text: "Participar en la predicción del live: +bonus" },
  { icon: "💰", text: "Donar monedas al streamer: +5 XP" },
];
