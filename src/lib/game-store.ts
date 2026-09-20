"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
// v26: sonido especial de recompensa en cada moneda ganada
import { sfx } from "@/lib/sound";
import {
  defaultAlias,
  getRankForLevel,
  xpForLevel,
  type InventoryItem,
  ACHIEVEMENTS,
  BRIEFINGS,
  type AchievementState,
  CONFLICTS,
} from "@/lib/game-data";
import {
  getCameraModel,
  generateEvent,
  ELITE_PASS,
  type CameraModel,
} from "@/lib/camera-data";
import type { ConquestSnapshot } from "@/lib/conquest-data";
import {
  pickWheelPrize,
  rollCrate,
  getCrateDef,
  stakingApyFor,
  stakeAccrued,
  AIRDROP_COINS,
  AIRDROP_GEMS,
  AIRDROP_INTERVAL_MS,
  EXTRA_SPIN_COST_GEMS,
  PASS_TIERS,
  passTierFor,
  passSeasonIndex,
  dayKey,
  type WheelPrize,
  type CrateTier,
  type CrateLootResult,
} from "@/lib/hooks-data";

export type Rarity = "COMUN" | "RARO" | "EPICO" | "LEGENDARIO";

// ====== Red de camaras (vigilancia comprable) ======
export interface PlacedCamera {
  id: string;
  modelId: string;
  name: string;
  lat: number;
  lng: number;
  installedAt: number;
  lastCollectAt: number;
  totalEarned: number;
  eventsCaught: number;
}

export interface CapturedCameraEvent {
  id: string;
  cameraId: string;
  cameraName: string;
  title: string;
  detail: string;
  kind: string;
  severity: number;
  coins: number;
  xp: number;
  ts: number;
  conflictName: string;
}

export interface CameraEventPayload {
  title: string;
  detail: string;
  kind: string;
  severity: number;
  coins: number;
  xp: number;
  conflictName: string;
}

export interface InventoryEntry {
  id: string;
  label: string;
  emoji: string;
  rarity: Rarity;
  quantity: number;
}

// ====== Alertas de precio (mercado v8) ======
export interface PriceAlert {
  id: string;
  assetId: string;
  op: "ABOVE" | "BELOW";
  price: number;
  createdAt: number;
}

// ====== Red social v5: foros / encuestas / comentarios ======
export interface ForumReplyData {
  id: string;
  author: string;
  body: string;
  ts: number;
  likes: number;
}

export interface UserThread {
  id: string;
  title: string;
  category: string;
  body: string;
  author: string;
  ts: number;
  likes: number;
  views: number;
  replies: ForumReplyData[];
}

export interface VComment {
  id: string;
  author: string;
  body: string;
  ts: number;
  likes: number;
}

// ====== Contenido del jugador v7: videos / encuestas / fotos publicados ======
export interface UserVideo {
  id: string;
  title: string;
  desc: string;
  country: string;      // codigo ISO del canal/pais
  category: "COMBATE" | "DIPLOMACIA" | "TECNOLOGIA" | "HUMANITARIO" | "HISTORIA" | "DIRECTO";
  src: string;          // URL del MP4 subido (public/uploads/videos)
  thumb: string;        // miniatura (public/uploads/thumbs)
  ts: number;
  durationSec: number;
}

export interface UserPoll {
  id: string;
  question: string;
  options: string[];
  category: "MILITAR" | "DIPLOMACIA" | "ECONOMIA" | "COMUNIDAD";
  conflictTag?: string;
  ts: number;
}

export interface UserPhoto {
  id: string;
  title: string;
  country: string;
  src: string;          // URL de la imagen subida (public/uploads/fotos)
  ts: number;
}

// ====== Mercado geopolitico v6: portafolio de inversion ======
export interface MarketHolding {
  qty: number;
  avgCost: number;
}

export interface MarketTrade {
  id: string;
  ts: number;
  assetId: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  total: number;
  pnl?: number; // solo SELL
}

// Orden limite pendiente de ejecucion (v6.2)
export interface MarketOrder {
  id: string;
  ts: number;
  assetId: string;
  side: "BUY" | "SELL";
  qty: number;
  limitPrice: number;
}

export interface GameState {
  // Player
  alias: string;
  avatarSeed: string;
  coins: number;
  gems: number;
  xp: number;
  level: number;
  rank: string;
  streak: number;
  lastLoginDate: string | null;
  lastWeeklyClaimDate: string | null;
  claimedWeeklyDays: number[]; // dias ya reclamados esta semana

  // Misiones
  missionProgress: Record<string, { progress: number; completed: boolean; claimed: boolean }>;

  // Inventario
  inventory: InventoryEntry[];

  // Briefings desbloqueados
  unlockedBriefings: string[];
  readBriefings: string[]; // ids leídos para conteo de misiones

  // Noticias / fotos / mapa (acciones contables)
  viewedNews: string[];
  viewedPhotos: string[];
  openedMaps: string[];
  predictions: { id: string; outcome: string; stake: number; odds: number }[];

  // Quizzes
  quizAnswered: string[];
  quizCorrect: number;

  // Fusiones
  fusionCount: number;

  // Daily Challenges
  dailyChallengeProgress: Record<string, number>;
  dailyChallengeClaimed: string[];
  dailyChallengeDate: string | null;

  // Mini-game stats (for tournaments)
  minigameBestScore: number;
  minigameTotalScore: number;
  minigameTotalHits: number;

  // Visited tabs (for daily challenges)
  visitedTabs: string[];

  // Logros (Achievements)
  unlockedAchievements: string[];
  claimedAchievements: string[];

  // Cosmeticos
  hudTheme: "AMBER" | "RED" | "CYAN";
  ownedCosmetics: string[];
  ownedAvatars: string[];
  activeAvatar: string;

  // Audio
  muted: boolean;

  // Boosts
  boosts: { xpUntil: number | null; coinUntil: number | null };

  // Red de camaras
  cameras: PlacedCamera[];
  cameraEventsLog: CapturedCameraEvent[];
  cameraTotalIncome: number;
  cameraTotalEvents: number;
  nextCameraId: number;

  // Elite pass
  eliteUntil: number | null;
  eliteLastClaimDate: string | null;

  // MUNDO DE GUERRA (conquista Risk v6)
  conquestSave: ConquestSnapshot | null;
  conquestWins: number;

  // Mercado geopolitico v6
  marketHoldings: Record<string, MarketHolding>;
  marketTrades: MarketTrade[];
  marketRealized: number; // P/L realizado acumulado
  marketFavorites: string[]; // tickers marcados con estrella
  marketOrders: MarketOrder[]; // ordenes limite pendientes
  marketFeesPaid: number; // comisiones acumuladas

  // Red social (foros / encuestas / comentarios)
  forumThreads: UserThread[]; // hilos creados por el jugador
  forumReplies: Record<string, ForumReplyData[]>; // respuestas por threadId (seed o propio)
  forumLikedIds: string[]; // hilos seed que le gustan
  forumLikedReplies: string[]; // respuestas que le gustan (v6.2)
  forumViewedIds: string[];
  pollVotes: Record<string, number>; // pollId -> indice de opcion
  videoReactions: Record<string, "like" | "dislike">;
  subscribedChannels: string[];
  watchHistory: { videoId: string; ts: number }[];
  comments: Record<string, VComment[]>; // key "video:ID" | "news:ID" | "forum:ID"
  nextThreadId: number;

  // Contenido del jugador v7
  myVideos: UserVideo[];
  myPolls: UserPoll[];
  myPhotos: UserPhoto[];
  nextVideoId: number;
  nextPollId: number;
  nextPhotoId: number;
  mpStats: { wins: number; captures: number; gemsEarned: number; games: number };

  // ====== CENTRO DE GANANCIAS v8 (ruleta / cajones / pase) ======
  wheelSpinsTotal: number; // giros totales de la ruleta (stat)
  lastWheelDate: string | null; // fecha del ultimo giro GRATIS (1/dia)
  lastAirdropAt: number | null; // ultimo airdrop horario reclamado
  freeCrates: Record<CrateTier, number>; // cajones gratuitos ganados (victoria/pase)
  crateOpens: number; // cajones abiertos (stat)
  stakeCount: number; // apuestas de staking abiertas (stat)

  // ====== STAKING v8 (mercado) ======
  stakes: Record<string, { coins: number; startAt: number; lastClaimAt: number }>;
  stakeEarnedTotal: number;
  alerts: PriceAlert[];
  nextAlertId: number;

  // ====== APUESTAS v8 (stats + apuesta gratis diaria) ======
  betStats: { placed: number; won: number; wagered: number; payout: number };
  lastFreeBetDate: string | null;

  // ====== PASE VANGUARD v8 ======
  passXp: number;
  passSeason: number; // indice de temporada al que pertenece el XP
  passClaimedFree: number[];
  passClaimedElite: number[];
  conquestCapturesTotal: number; // capturas históricas (stat de temporada)

  // historial simple
  log: { ts: number; msg: string; delta?: number }[];

  // ====== v15 CUENTAS + LANZAMIENTO ======
  account: { username: string; isOwner: boolean } | null;
  launchPackClaimed: boolean;
  cloudSaveAt: number | null;

  // ---- actions ----
  initPlayer: (alias?: string) => void;

  addCoins: (amount: number, reason: string) => void;
  spendCoins: (amount: number, reason: string) => boolean;
  addGems: (amount: number, reason: string) => void;
  spendGems: (amount: number, reason: string) => boolean;
  addXp: (amount: number) => void;

  progressMission: (code: string, by?: number) => void;
  claimMission: (code: string, rewards: { xp: number; coins: number; gems: number }) => void;

  recordReadBriefing: (id: string) => void;
  recordViewNews: (id: string) => void;
  recordViewPhoto: (id: string) => void;
  recordOpenMap: (id: string) => void;
  recordQuiz: (id: string, correct: boolean, xp: number, coins: number) => void;
  recordPrediction: (id: string, outcome: string, stake: number, odds: number) => void;
  recordFusion: () => void;

  unlockBriefing: (id: string, cost: number) => boolean;
  buyAvatar: (id: string, cost: number) => boolean;
  buyCosmetic: (id: string, cost: number, type: "HUD") => boolean;
  setHudTheme: (t: "AMBER" | "RED" | "CYAN") => void;
  setActiveAvatar: (id: string) => void;
  buyBoost: (type: "XP" | "COIN", cost: number) => boolean;

  // Conquista + Mercado v6
  setConquestSave: (snap: ConquestSnapshot | null) => void;
  recordConquestWin: () => void;
  buyAsset: (assetId: string, qty: number, price: number, fee?: number) => boolean;
  sellAsset: (assetId: string, qty: number, price: number, fee?: number) => number; // devuelve P/L
  toggleFavorite: (assetId: string) => void;
  placeOrder: (assetId: string, side: "BUY" | "SELL", qty: number, limitPrice: number) => boolean;
  cancelOrder: (orderId: string) => void;
  fillOrder: (orderId: string, price: number) => { ok: boolean; pnl?: number }; // ejecuta una orden limite cruzada
  likeReply: (replyId: string) => void; // toggle en respuestas de foro (seed o propias)

  // Red social
  createThread: (title: string, category: string, body: string) => void;
  replyThread: (threadId: string, body: string) => void;
  likeThread: (threadId: string) => void; // toggle, hilos seed o propios
  viewThread: (threadId: string) => void;
  votePoll: (pollId: string, optionIdx: number, rewardCoins?: number) => boolean;
  reactVideo: (videoId: string, r: "like" | "dislike") => void;
  toggleSubscribe: (channelId: string) => boolean;
  recordWatch: (videoId: string) => void;
  addComment: (key: string, body: string) => void;

  // Contenido del jugador v7
  publishVideo: (v: { title: string; desc: string; country: string; category: UserVideo["category"]; src: string; thumb: string; durationSec: number }) => void;
  deleteVideo: (id: string) => void;
  createPoll: (question: string, options: string[], category: UserPoll["category"], conflictTag?: string) => void;
  publishPhoto: (p: { title: string; country: string; src: string }) => void;
  recordMpCapture: (gems: number) => void;
  recordMpWin: () => void;

  // ====== CENTRO DE GANANCIAS v8 ======
  spinWheel: () => WheelPrize | null; // giro gratis diario (1/dia)
  buyExtraSpin: () => WheelPrize | null; // giro extra pagando gemas
  claimAirdrop: () => { coins: number; gems: number } | null; // airdrop horario
  grantCrate: (tier: CrateTier, qty?: number) => void; // cajon gratuito (victoria/pase)
  openCrate: (tier: CrateTier) => CrateLootResult | null; // consume gratis o compra

  // ====== STAKING v8 ======
  stakeAsset: (assetId: string, coins: number) => boolean;
  claimStake: (assetId: string) => number; // devuelve recompensa reclamada
  unstakeAsset: (assetId: string) => number; // devuelve principal + recompensa
  addAlert: (assetId: string, op: "ABOVE" | "BELOW", price: number) => void;
  removeAlert: (id: string) => void;

  // ====== APUESTAS v8 ======
  recordBet: (wager: number, won: boolean, payout: number) => void;
  claimFreeBet: () => boolean; // 50 mon de apuesta gratis 1/dia

  // ====== PASE VANGUARD v8 ======
  addPassXp: (n: number) => void;
  claimPassTier: (tier: number, track: "FREE" | "ELITE") => boolean;
  recordConquestCaptureStat: () => void;

  // Camaras
  isElite: () => boolean;
  cameraDiscount: () => number;
  cameraIncomeRate: (cam: PlacedCamera) => number;
  cameraPending: (cam: PlacedCamera) => number;
  placeCamera: (modelId: string, lat: number, lng: number, name?: string) => { ok: boolean; reason?: string };
  removeCamera: (id: string) => boolean;
  collectCamera: (id: string) => number;
  collectAllCameras: () => number;
  registerCameraEvent: (cameraId: string) => CapturedCameraEvent | null;
  activateElite: (payWith: "COINS" | "GEMS") => boolean;
  claimEliteDaily: () => boolean;

  addToInventory: (item: InventoryItem, qty?: number) => void;
  consumeFromInventory: (id: string, qty: number) => boolean;

  claimWeeklyDay: (day: number, rewards: { coins: number; gems: number; xp: number }) => void;

  // Achievements
  checkAchievements: () => string[]; // returns newly unlocked ids
  claimAchievement: (id: string, rewards: { xp: number; coins: number; gems: number }) => void;

  // Daily challenges
  recordTabVisit: (tab: string) => void;
  recordMinigameStats: (score: number, hits: number) => void;
  claimDailyChallenge: (id: string, rewards: { xp: number; coins: number }) => void;

  // Audio
  setMuted: (m: boolean) => void;

  // Alias
  setAlias: (alias: string) => void;

  // Backup
  exportProgress: () => string;
  importProgress: (json: string) => boolean;

  // ====== v15 CUENTAS ======
  applyOwnerPerks: () => void;
  authLogin: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  authRegister: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  authLogout: () => Promise<void>;
  authRefresh: () => Promise<void>;
  pullCloudSave: () => Promise<boolean>;
  pushCloudSave: () => Promise<void>;
  claimLaunchPack: () => boolean;

  resetProgress: () => void;
}

function computeRank(level: number) {
  return getRankForLevel(level).name;
}

// ====== v15 — economía del propietario (DUENO) ======
export const OWNER_COINS = 9_999_999;
export const OWNER_GEMS = 99_999;

function levelUp(state: GameState): Partial<GameState> {
  let level = state.level;
  let xp = state.xp;
  let needed = xpForLevel(level);
  const log = [...state.log];
  while (xp >= needed) {
    xp -= needed;
    level += 1;
    log.push({ ts: Date.now(), msg: `¡Subiste a nivel ${level}! (+50 monedas bonus)` });
    needed = xpForLevel(level);
  }
  // bonus por subir
  const bonusCoins = (level - state.level) * 50;
  return {
    level,
    xp,
    coins: state.coins + bonusCoins,
    rank: computeRank(level),
    log,
  };
}

// ====== v28 ANTI-TRABADO: storage con escritura DIFERIDA ======
// El persist serializa TODO el estado en cada set(); con fotos/videos/mundos
// eso bloqueaba el hilo principal (el juego se "trababa" tras un rato).
// Este wrapper escribe a localStorage como máximo 1 vez cada 1.2s y siempre
// de forma diferida — las lecturas siguen siendo instantáneas.
const debouncedLocalStorage: StateStorage = (() => {
  let pending: string | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const flush = () => {
    timer = null;
    if (pending === null) return;
    try {
      window.localStorage.setItem("vanguard-game-state-v1", pending);
    } catch {
      /* cuota llena — ignorar silenciosamente */
    }
    pending = null;
  };
  return {
    getItem: (name) => {
      try {
        return window.localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      pending = value;
      if (name !== "vanguard-game-state-v1") {
        // otras claves: escritura inmediata
        try {
          window.localStorage.setItem(name, value);
        } catch {
          /* noop */
        }
        pending = null;
        return;
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, 1200);
    },
    removeItem: (name) => {
      try {
        window.localStorage.removeItem(name);
      } catch {
        /* noop */
      }
    },
  };
})();

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      alias: "",
      avatarSeed: "vanguard-agent",
      coins: 250,
      gems: 5,
      xp: 0,
      level: 1,
      rank: "RECLUTA",
      streak: 0,
      lastLoginDate: null,
      lastWeeklyClaimDate: null,
      claimedWeeklyDays: [],

      missionProgress: {},
      inventory: [
        { id: "raw_cable", label: "Cable bruto", emoji: "radio", rarity: "COMUN", quantity: 5 },
        { id: "raw_photo", label: "Foto OSINT", emoji: "image", rarity: "COMUN", quantity: 3 },
      ],
      unlockedBriefings: [],
      readBriefings: [],
      viewedNews: [],
      viewedPhotos: [],
      openedMaps: [],
      predictions: [],
      quizAnswered: [],
      quizCorrect: 0,
      fusionCount: 0,

      dailyChallengeProgress: {},
      dailyChallengeClaimed: [],
      dailyChallengeDate: null,
      minigameBestScore: 0,
      minigameTotalScore: 0,
      minigameTotalHits: 0,
      visitedTabs: [],

      unlockedAchievements: [],
      claimedAchievements: [],

      hudTheme: "AMBER",
      ownedCosmetics: ["AMBER"],
      ownedAvatars: ["vanguard-agent"],
      activeAvatar: "vanguard-agent",

      muted: false,

      boosts: { xpUntil: null, coinUntil: null },

      cameras: [],
      cameraEventsLog: [],
      cameraTotalIncome: 0,
      cameraTotalEvents: 0,
      nextCameraId: 1,

      eliteUntil: null,
      eliteLastClaimDate: null,

      conquestSave: null,
      conquestWins: 0,
      marketHoldings: {},
      marketTrades: [],
      marketRealized: 0,
      marketFavorites: ["USDX"],
      marketOrders: [],
      marketFeesPaid: 0,

      forumThreads: [],
      forumReplies: {},
      forumLikedIds: [],
      forumLikedReplies: [],
      forumViewedIds: [],
      pollVotes: {},
      videoReactions: {},
      subscribedChannels: ["vg-official"],
      watchHistory: [],
      comments: {},
      nextThreadId: 1,

      myVideos: [],
      myPolls: [],
      myPhotos: [],
      nextVideoId: 1,
      nextPollId: 1,
      nextPhotoId: 1,
      mpStats: { wins: 0, captures: 0, gemsEarned: 0, games: 0 },

      wheelSpinsTotal: 0,
      lastWheelDate: null,
      lastAirdropAt: null,
      freeCrates: { COMUN: 0, ELITE: 0, LEGENDARIA: 0 },
      crateOpens: 0,
      stakeCount: 0,

      stakes: {},
      stakeEarnedTotal: 0,
      alerts: [],
      nextAlertId: 1,

      betStats: { placed: 0, won: 0, wagered: 0, payout: 0 },
      lastFreeBetDate: null,

      passXp: 0,
      passSeason: passSeasonIndex(),
      passClaimedFree: [],
      passClaimedElite: [],
      conquestCapturesTotal: 0,

      // ====== v15 CUENTAS ======
      account: null,
      launchPackClaimed: false,
      cloudSaveAt: null,

      log: [],

      // ====== v15 CUENTAS: propietario + nube + lanzamiento ======
      applyOwnerPerks: () => {
        const s = get();
        const achIds = ACHIEVEMENTS.map((a) => a.id);
        const newLevel = Math.max(s.level, 50);
        set({
          account: { username: s.account?.username ?? "DUENO", isOwner: true },
          alias: "DUENO",
          coins: Math.max(s.coins, OWNER_COINS),
          gems: Math.max(s.gems, OWNER_GEMS),
          level: newLevel,
          rank: computeRank(newLevel),
          eliteUntil: Math.max(s.eliteUntil ?? 0, Date.now() + 3650 * 24 * 3600 * 1000),
          unlockedAchievements: Array.from(new Set([...s.unlockedAchievements, ...achIds])),
          claimedAchievements: Array.from(new Set([...s.claimedAchievements, ...achIds])),
          unlockedBriefings: Array.from(new Set([...s.unlockedBriefings, ...BRIEFINGS.map((b) => b.id)])),
          ownedCosmetics: Array.from(new Set([...s.ownedCosmetics, "AMBER", "RED", "CYAN"])),
          freeCrates: { ...s.freeCrates, LEGENDARIA: s.freeCrates.LEGENDARIA + 3 },
          launchPackClaimed: true,
          log: [
            { ts: Date.now(), msg: "ACCESO TOTAL DE PROPIETARIO: dinero infinito y todo desbloqueado" },
            ...s.log,
          ].slice(0, 50),
        });
      },

      authLogin: async (username, password) => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          const data = await res.json();
          if (!data.ok) return { ok: false, error: data.error ?? "No se pudo iniciar sesión." };
          set({ account: data.account, alias: data.account.isOwner ? "DUENO" : username });
          if (data.account.isOwner) {
            get().applyOwnerPerks();
            await get().pullCloudSave(); // sincroniza el progreso del propietario entre dispositivos
            get().applyOwnerPerks();
          } else if (data.hasSave) {
            await get().pullCloudSave();
          } else if (get().account?.username !== username || !data.hasSave) {
            // cuenta nueva en este dispositivo: empezar de cero (evita heredar monedas locales)
            get().resetProgress();
            set({ account: data.account, alias: username, launchPackClaimed: false });
          }
          return { ok: true };
        } catch {
          return { ok: false, error: "Sin conexión con el servidor de cuentas." };
        }
      },

      authRegister: async (username, password) => {
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          const data = await res.json();
          if (!data.ok) return { ok: false, error: data.error ?? "No se pudo crear la cuenta." };
          // cuenta NUEVA: empezar de cero siempre (no hereda nada del dispositivo)
          get().resetProgress();
          set({
            account: data.account,
            alias: username,
            coins: 550, // 250 base + 300 de bienvenida
            launchPackClaimed: false,
            log: [
              { ts: Date.now(), msg: "Cuenta creada: +300 monedas de bienvenida · reclama el Pack de Lanzamiento", delta: 300 },
            ],
          });
          return { ok: true };
        } catch {
          return { ok: false, error: "Sin conexión con el servidor de cuentas." };
        }
      },

      authLogout: async () => {
        try {
          await get().pushCloudSave();
        } catch {
          /* el guardado no bloquea la salida */
        }
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          /* noop */
        }
        set((s) => ({
          account: null,
          cloudSaveAt: null,
          alias: defaultAlias(),
        }));
      },

      authRefresh: async () => {
        try {
          const res = await fetch("/api/auth/me", { cache: "no-store" });
          const data = await res.json();
          if (data?.account) {
            set({ account: data.account, alias: data.account.isOwner ? "DUENO" : get().alias || data.account.username });
            if (data.account.isOwner) {
              get().applyOwnerPerks();
            }
            if (data.savedAt) {
              await get().pullCloudSave();
            }
          }
        } catch {
          /* sin sesión */
        }
      },

      pullCloudSave: async () => {
        try {
          const res = await fetch("/api/auth/save", { cache: "no-store" });
          const data = await res.json();
          if (!data?.ok || !data.save) return false;
          const cloud = JSON.parse(data.save) as Record<string, unknown>;
          // copia de seguridad local antes de pisar el progreso con la nube
          try {
            const s = get();
            const snap: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(s)) if (typeof v !== "function") snap[k] = v;
            localStorage.setItem("vanguard-backup-prelogin", JSON.stringify(snap));
          } catch {
            /* noop */
          }
          const account = get().account;
          set({ ...cloud, account } as Partial<GameState>);
          if (account?.isOwner) get().applyOwnerPerks();
          set({ cloudSaveAt: Date.now() });
          return true;
        } catch {
          return false;
        }
      },

      pushCloudSave: async () => {
        const acct = get().account;
        if (!acct) return;
        try {
          const s = get();
          const snap: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(s)) if (typeof v !== "function") snap[k] = v;
          await fetch("/api/auth/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ save: JSON.stringify(snap) }),
          });
          set({ cloudSaveAt: Date.now() });
        } catch {
          /* se reintenta en el próximo ciclo */
        }
      },

      claimLaunchPack: () => {
        const s = get();
        if (s.launchPackClaimed) return false;
        const isOwner = !!s.account?.isOwner;
        set((st) => ({
          launchPackClaimed: true,
          coins: st.coins + 1500,
          gems: st.gems + 15,
          freeCrates: {
            ...st.freeCrates,
            ELITE: st.freeCrates.ELITE + 2,
            LEGENDARIA: st.freeCrates.LEGENDARIA + 1,
          },
          eliteUntil: isOwner || (st.eliteUntil && st.eliteUntil > Date.now())
            ? st.eliteUntil
            : Date.now() + ELITE_PASS.durationMs,
          log: [
            { ts: Date.now(), msg: "PACK DE LANZAMIENTO reclamado: +1500 mon, +15 gemas, 3 cajones y 7 días de ELITE", delta: 1500 },
            ...st.log,
          ].slice(0, 50),
        }));
        get().addXp(500);
        return true;
      },

      initPlayer: (alias) => {
        const s = get();
        if (!s.alias) {
          set({ alias: alias ?? defaultAlias() });
        }
      },

      addCoins: (amount, reason) => {
        set((s) => {
          const boost = s.boosts.coinUntil && s.boosts.coinUntil > Date.now() ? 2 : 1;
          // v15: el propietario mantiene su fortuna infinita
          const final = s.account?.isOwner ? Math.max(s.coins + amount, OWNER_COINS) : s.coins + amount * boost;
          return {
            coins: final,
            log: [{ ts: Date.now(), msg: `+${amount * boost} monedas — ${reason}`, delta: amount * boost }, ...s.log].slice(0, 50),
          };
        });
        // v26: SONIDO ESPECIAL por cada recompensa ganada (throttle 900ms
        // para que las rachas rápidas no se conviertan en ruido)
        if (amount > 0 && typeof window !== "undefined") {
          const now = Date.now();
          const w = window as unknown as { __vanguardLastReward?: number };
          if (!w.__vanguardLastReward || now - w.__vanguardLastReward > 900) {
            w.__vanguardLastReward = now;
            try {
              sfx.reward();
            } catch {
              /* noop */
            }
          }
        }
      },
      spendCoins: (amount, reason) => {
        const s = get();
        // v15: el PROPIETARIO gasta sin límite — dinero infinito
        if (s.account?.isOwner) {
          set((st) => ({
            coins: Math.max(st.coins, OWNER_COINS),
            log: [{ ts: Date.now(), msg: `∞ monedas DUENO — ${reason}` }, ...st.log].slice(0, 50),
          }));
          return true;
        }
        if (s.coins < amount) return false;
        set((st) => ({
          coins: st.coins - amount,
          log: [{ ts: Date.now(), msg: `-${amount} monedas — ${reason}`, delta: -amount }, ...st.log].slice(0, 50),
        }));
        return true;
      },
      addGems: (amount, reason) => {
        set((s) => ({
          gems: s.gems + amount,
          log: [{ ts: Date.now(), msg: `+${amount} gemas — ${reason}`, delta: amount }, ...s.log].slice(0, 50),
        }));
      },
      spendGems: (amount, reason) => {
        const s = get();
        // v15: el PROPIETARIO gasta gemas sin límite
        if (s.account?.isOwner) {
          set((st) => ({
            gems: Math.max(st.gems, OWNER_GEMS),
            log: [{ ts: Date.now(), msg: `∞ gemas DUENO — ${reason}` }, ...st.log].slice(0, 50),
          }));
          return true;
        }
        if (s.gems < amount) return false;
        set((st) => ({
          gems: st.gems - amount,
          log: [{ ts: Date.now(), msg: `-${amount} gemas — ${reason}`, delta: -amount }, ...st.log].slice(0, 50),
        }));
        return true;
      },
      addXp: (amount) => {
        set((s) => {
          const boost = s.boosts.xpUntil && s.boosts.xpUntil > Date.now() ? 2 : 1;
          const finalXp = amount * boost;
          const base = { ...s, xp: s.xp + finalXp };
          const leveled = levelUp(base);
          return { ...leveled };
        });
      },

      progressMission: (code, by = 1) => {
        set((s) => {
          const cur = s.missionProgress[code] ?? { progress: 0, completed: false, claimed: false };
          const next = Math.min(cur.progress + by, 9999);
          return {
            missionProgress: {
              ...s.missionProgress,
              [code]: { ...cur, progress: next, completed: cur.completed || next >= 1 },
            },
          };
        });
        // actualizar estados completados se hace al consultar misiones con target
      },
      claimMission: (code, rewards) => {
        set((s) => {
          const cur = s.missionProgress[code];
          if (!cur || cur.claimed) return s;
          const boostC = s.boosts.coinUntil && s.boosts.coinUntil > Date.now() ? 2 : 1;
          const boostX = s.boosts.xpUntil && s.boosts.xpUntil > Date.now() ? 2 : 1;
          const base = {
            ...s,
            coins: s.coins + rewards.coins * boostC,
            gems: s.gems + rewards.gems,
            xp: s.xp + rewards.xp * boostX,
            missionProgress: {
              ...s.missionProgress,
              [code]: { ...cur, claimed: true, completed: true },
            },
            log: [
              { ts: Date.now(), msg: `Mision "${code}" reclamada: +${rewards.coins * boostC} monedas, +${rewards.xp * boostX} XP`, delta: rewards.coins * boostC },
              ...s.log,
            ].slice(0, 50),
          };
          const leveled = levelUp(base);
          return { ...base, ...leveled };
        });
      },

      recordReadBriefing: (id) => {
        set((s) => {
          if (s.readBriefings.includes(id)) return s;
          return { readBriefings: [...s.readBriefings, id] };
        });
        get().progressMission("D_BRIEF_3");
        get().progressMission("W_BRIEF_15");
      },
      recordViewNews: (id) => {
        set((s) => {
          if (s.viewedNews.includes(id)) return s;
          const daily = { ...s.dailyChallengeProgress };
          daily["DC-3"] = (daily["DC-3"] || 0) + 1;
          return { viewedNews: [...s.viewedNews, id], dailyChallengeProgress: daily };
        });
        get().progressMission("D_NEWS_5");
        get().progressMission("W_NEWS_30");
      },
      recordViewPhoto: (id) => {
        set((s) => {
          if (s.viewedPhotos.includes(id)) return s;
          const daily = { ...s.dailyChallengeProgress };
          daily["DC-4"] = (daily["DC-4"] || 0) + 1;
          return { viewedPhotos: [...s.viewedPhotos, id], dailyChallengeProgress: daily };
        });
        get().progressMission("D_PHOTO_2");
      },
      recordOpenMap: (id) => {
        set((s) => {
          if (s.openedMaps.includes(id)) return s;
          const daily = { ...s.dailyChallengeProgress };
          daily["DC-8"] = (daily["DC-8"] || 0) + 1;
          return { openedMaps: [...s.openedMaps, id], dailyChallengeProgress: daily };
        });
        get().progressMission("D_MAP_1");
        // story missions
        if (id === "ukraine") get().progressMission("STORY_KIEV");
        if (id === "gaza") get().progressMission("STORY_GAZA");
        if (id === "sudan") get().progressMission("STORY_SUDAN");
      },
      recordQuiz: (id, correct, xp, coins) => {
        set((s) => {
          if (s.quizAnswered.includes(id)) return s;
          const daily = { ...s.dailyChallengeProgress };
          if (correct) daily["DC-5"] = (daily["DC-5"] || 0) + 1;
          return { quizAnswered: [...s.quizAnswered, id], quizCorrect: s.quizCorrect + (correct ? 1 : 0), dailyChallengeProgress: daily };
        });
        if (correct) {
          get().addXp(xp);
          get().addCoins(coins, "Quiz correcto");
          get().progressMission("D_QUIZ_3");
          get().progressMission("W_QUIZ_15");
        }
      },
      recordPrediction: (id, outcome, stake, odds) => {
        set((s) => {
          const daily = { ...s.dailyChallengeProgress };
          daily["DC-6"] = (daily["DC-6"] || 0) + 1;
          return { predictions: [...s.predictions, { id, outcome, stake, odds }], dailyChallengeProgress: daily };
        });
        get().progressMission("D_PREDICT_1");
        get().progressMission("W_PREDICT_5");
      },
      recordFusion: () => {
        set((s) => {
          const daily = { ...s.dailyChallengeProgress };
          daily["DC-7"] = (daily["DC-7"] || 0) + 1;
          return { fusionCount: s.fusionCount + 1, dailyChallengeProgress: daily };
        });
        get().progressMission("D_FUSION_1");
        get().progressMission("S_FUSION_5");
      },

      unlockBriefing: (id, cost) => {
        const ok = get().spendCoins(cost, `Desbloquear briefing ${id}`);
        if (ok) {
          set((s) => ({ unlockedBriefings: [...s.unlockedBriefings, id] }));
        }
        return ok;
      },
      buyAvatar: (id, cost) => {
        const ok = get().spendCoins(cost, `Avatar ${id}`);
        if (ok) {
          set((s) => ({
            ownedAvatars: [...s.ownedAvatars, id],
            activeAvatar: id,
          }));
        }
        return ok;
      },
      buyCosmetic: (id, cost, type) => {
        const ok = get().spendGems(cost, `Cosmetico ${id}`);
        if (ok) {
          set((s) => ({ ownedCosmetics: [...s.ownedCosmetics, id] }));
          if (type === "HUD") get().setHudTheme(id as any);
        }
        return ok;
      },
      setHudTheme: (t) => set({ hudTheme: t }),
      setActiveAvatar: (id) => set({ activeAvatar: id }),
      buyBoost: (type, cost) => {
        const ok = get().spendGems(cost, `Boost ${type}`);
        if (ok) {
          const until = Date.now() + 24 * 3600 * 1000;
          set((s) => ({
            boosts: type === "XP" ? { ...s.boosts, xpUntil: until } : { ...s.boosts, coinUntil: until },
          }));
        }
        return ok;
      },

      // ====== RED SOCIAL (foros / encuestas / comentarios) ======
      createThread: (title, category, body) => {
        const s = get();
        const id = `UT-${s.nextThreadId}`;
        const thread: UserThread = {
          id,
          title: title.trim().slice(0, 120),
          category,
          body: body.trim().slice(0, 2000),
          author: s.alias || "OPERADOR",
          ts: Date.now(),
          likes: 0,
          views: 1,
          replies: [],
        };
        set((st) => ({
          forumThreads: [thread, ...st.forumThreads],
          nextThreadId: st.nextThreadId + 1,
          log: [{ ts: Date.now(), msg: `Hilo creado en foros: "${thread.title}" (+8 monedas, +5 XP)`, delta: 8 }, ...st.log].slice(0, 50),
        }));
        get().addCoins(8, "Hilo creado en foros");
        get().addXp(5);
      },

      replyThread: (threadId, body) => {
        const s = get();
        const reply: ForumReplyData = {
          id: `R-${Date.now()}`,
          author: s.alias || "OPERADOR",
          body: body.trim().slice(0, 1000),
          ts: Date.now(),
          likes: 0,
        };
        // si es hilo propio, agregar a thread.replies; si es seed, usar map forumReplies
        set((st) => {
          const isOwn = st.forumThreads.some((t) => t.id === threadId);
          if (isOwn) {
            return {
              forumThreads: st.forumThreads.map((t) =>
                t.id === threadId ? { ...t, replies: [...t.replies, reply] } : t
              ),
              log: [{ ts: Date.now(), msg: `Respuesta publicada en "${threadId}" (+3 monedas, +2 XP)`, delta: 3 }, ...st.log].slice(0, 50),
            };
          }
          return {
            forumReplies: { ...st.forumReplies, [threadId]: [...(st.forumReplies[threadId] ?? []), reply] },
            log: [{ ts: Date.now(), msg: `Respuesta publicada en "${threadId}" (+3 monedas, +2 XP)`, delta: 3 }, ...st.log].slice(0, 50),
          };
        });
        get().addCoins(3, "Respuesta en foros");
        get().addXp(2);
      },

      likeThread: (threadId) => {
        set((st) => {
          const isOwn = st.forumThreads.some((t) => t.id === threadId);
          if (isOwn) {
            return {
              forumThreads: st.forumThreads.map((t) =>
                t.id === threadId ? { ...t, likes: Math.max(0, t.likes - 1) } : t
              ),
            };
          }
          const liked = st.forumLikedIds.includes(threadId);
          return {
            forumLikedIds: liked ? st.forumLikedIds.filter((i) => i !== threadId) : [...st.forumLikedIds, threadId],
          };
        });
      },

      viewThread: (threadId) => {
        set((st) => {
          if (!st.forumViewedIds.includes(threadId)) return { forumViewedIds: [...st.forumViewedIds, threadId] };
          return st;
        });
        set((st) => ({
          forumThreads: st.forumThreads.map((t) => (t.id === threadId ? { ...t, views: t.views + 1 } : t)),
        }));
      },

      votePoll: (pollId, optionIdx, rewardCoins = 5) => {
        const s = get();
        if (s.pollVotes[pollId] !== undefined) return false;
        set((st) => ({
          pollVotes: { ...st.pollVotes, [pollId]: optionIdx },
          log: [{ ts: Date.now(), msg: `Voto registrado en encuesta ${pollId} (+${rewardCoins} monedas, +5 XP)`, delta: rewardCoins }, ...st.log].slice(0, 50),
        }));
        get().addCoins(rewardCoins, "Participacion en encuesta");
        get().addXp(5);
        return true;
      },

      reactVideo: (videoId, r) => {
        set((st) => {
          const cur = st.videoReactions[videoId];
          const next = { ...st.videoReactions };
          if (cur === r) delete next[videoId];
          else next[videoId] = r;
          return { videoReactions: next };
        });
      },

      toggleSubscribe: (channelId) => {
        const st = get();
        const isSub = st.subscribedChannels.includes(channelId);
        set({
          subscribedChannels: isSub
            ? st.subscribedChannels.filter((c) => c !== channelId)
            : [...st.subscribedChannels, channelId],
        });
        return !isSub;
      },

      recordWatch: (videoId) => {
        set((st) => {
          const filtered = st.watchHistory.filter((w) => w.videoId !== videoId);
          return { watchHistory: [{ videoId, ts: Date.now() }, ...filtered].slice(0, 30) };
        });
      },

      addComment: (key, body) => {
        const s = get();
        const comment: VComment = {
          id: `C-${Date.now()}`,
          author: s.alias || "OPERADOR",
          body: body.trim().slice(0, 600),
          ts: Date.now(),
          likes: 0,
        };
        set((st) => ({
          comments: { ...st.comments, [key]: [...(st.comments[key] ?? []), comment] },
        }));
        get().addXp(2);
      },

      // ====== CONTENIDO DEL JUGADOR (v7) ======
      publishVideo: ({ title, desc, country, category, src, thumb, durationSec }) => {
        const s = get();
        const id = `UV-${s.nextVideoId}`;
        set((st) => ({
          myVideos: [{ id, title: title.trim().slice(0, 90), desc: desc.trim().slice(0, 300), country, category, src, thumb, ts: Date.now(), durationSec }, ...st.myVideos],
          nextVideoId: st.nextVideoId + 1,
          log: [{ ts: Date.now(), msg: `Video publicado en GlobalVision: "${title.trim().slice(0, 40)}" (+50 gemas, +10 XP)`, delta: 50 }, ...st.log].slice(0, 50),
        }));
        get().addGems(50, "Video publicado");
        get().addXp(10);
      },
      deleteVideo: (id) => {
        set((st) => ({ myVideos: st.myVideos.filter((v) => v.id !== id) }));
      },
      createPoll: (question, options, category, conflictTag) => {
        const s = get();
        const id = `UP-${s.nextPollId}`;
        set((st) => ({
          myPolls: [{ id, question: question.trim().slice(0, 140), options: options.slice(0, 4).map((o) => o.trim().slice(0, 60)), category, conflictTag, ts: Date.now() }, ...st.myPolls],
          nextPollId: st.nextPollId + 1,
          log: [{ ts: Date.now(), msg: `Encuesta creada: "${question.trim().slice(0, 40)}" (+10 monedas, +1 gema)`, delta: 10 }, ...st.log].slice(0, 50),
        }));
        get().addCoins(10, "Encuesta creada");
        get().addGems(1, "Encuesta creada");
        get().addXp(5);
      },
      publishPhoto: ({ title, country, src }) => {
        const s = get();
        const id = `UPH-${s.nextPhotoId}`;
        set((st) => ({
          myPhotos: [{ id, title: title.trim().slice(0, 80), country, src, ts: Date.now() }, ...st.myPhotos],
          nextPhotoId: st.nextPhotoId + 1,
          log: [{ ts: Date.now(), msg: `Foto publicada en OSINT: "${title.trim().slice(0, 40)}" (+15 monedas, +5 XP)`, delta: 15 }, ...st.log].slice(0, 50),
        }));
        get().addCoins(15, "Foto publicada");
        get().addXp(5);
      },
      recordMpCapture: (gems) => {
        set((st) => ({ mpStats: { ...st.mpStats, captures: st.mpStats.captures + 1, gemsEarned: st.mpStats.gemsEarned + gems } }));
        get().addGems(gems, "Captura multijugador");
        get().addCoins(5, "Captura multijugador");
        get().addXp(3);
      },
      recordMpWin: () => {
        set((st) => ({ mpStats: { ...st.mpStats, wins: st.mpStats.wins + 1, gemsEarned: st.mpStats.gemsEarned + 25, games: st.mpStats.games + 1 } }));
        get().addGems(25, "DOMINIO GLOBAL multijugador");
        get().addCoins(200, "DOMINIO GLOBAL multijugador");
        get().addXp(100);
      },

      // ====== MUNDO DE GUERRA + MERCADO (v6) ======
      setConquestSave: (snap) => {
        set({ conquestSave: snap });
      },
      recordConquestWin: () => {
        set((st) => ({
          conquestWins: st.conquestWins + 1,
          log: [
            { ts: Date.now(), msg: "DOMINIO MUNDIAL alcanzado en MUNDO DE GUERRA (+500 monedas, +250 XP, +1 cajón legendaria)", delta: 500 },
            ...st.log,
          ].slice(0, 50),
        }));
        get().addCoins(500, "Dominio mundial");
        get().addXp(250);
        get().addGems(3, "Dominio mundial");
        get().grantCrate("LEGENDARIA", 1);
        get().addPassXp(150);
        get().checkAchievements();
      },

      // ====== CENTRO DE GANANCIAS v8 ======
      spinWheel: () => {
        const s = get();
        const today = dayKey();
        if (s.lastWheelDate === today) return null; // ya giro gratis hoy
        const prize = pickWheelPrize();
        set((st) => ({
          lastWheelDate: today,
          wheelSpinsTotal: st.wheelSpinsTotal + 1,
        }));
        if (prize.coins > 0) get().addCoins(prize.coins, `Ruleta diaria: ${prize.label}`);
        if (prize.gems > 0) get().addGems(prize.gems, `Ruleta diaria: ${prize.label}`);
        if (prize.xp > 0) get().addXp(prize.xp);
        get().addPassXp(15);
        get().checkAchievements();
        return prize;
      },
      buyExtraSpin: () => {
        const s = get();
        if (!s.spendGems(EXTRA_SPIN_COST_GEMS, "Giro extra de ruleta")) return null;
        const prize = pickWheelPrize();
        set((st) => ({ wheelSpinsTotal: st.wheelSpinsTotal + 1 }));
        if (prize.coins > 0) get().addCoins(prize.coins, `Ruleta (giro extra): ${prize.label}`);
        if (prize.gems > 0) get().addGems(prize.gems, `Ruleta (giro extra): ${prize.label}`);
        if (prize.xp > 0) get().addXp(prize.xp);
        get().addPassXp(15);
        get().checkAchievements();
        return prize;
      },
      claimAirdrop: () => {
        const s = get();
        const now = Date.now();
        if (s.lastAirdropAt !== null && now - s.lastAirdropAt < AIRDROP_INTERVAL_MS) return null;
        set({ lastAirdropAt: now });
        get().addCoins(AIRDROP_COINS, "Airdrop horario");
        get().addGems(AIRDROP_GEMS, "Airdrop horario");
        return { coins: AIRDROP_COINS, gems: AIRDROP_GEMS };
      },
      grantCrate: (tier, qty = 1) => {
        set((st) => ({
          freeCrates: { ...st.freeCrates, [tier]: (st.freeCrates[tier] ?? 0) + qty },
          log: [
            { ts: Date.now(), msg: `+${qty} cajón ${tier} gratuito`, delta: undefined },
            ...st.log,
          ].slice(0, 50),
        }));
      },
      openCrate: (tier) => {
        const s = get();
        const def = getCrateDef(tier);
        // 1) consumir cajon gratuito si hay; 2) si no, pagar coste
        if ((s.freeCrates[tier] ?? 0) > 0) {
          set((st) => ({ freeCrates: { ...st.freeCrates, [tier]: st.freeCrates[tier] - 1 } }));
        } else if (def.costCoins > 0) {
          if (!get().spendCoins(def.costCoins, `Abrir ${def.name}`)) return null;
        } else if (def.costGems > 0) {
          if (!get().spendGems(def.costGems, `Abrir ${def.name}`)) return null;
        }
        const loot = rollCrate(tier);
        if (loot.coins > 0) get().addCoins(loot.coins, `${def.name}`);
        if (loot.gems > 0) get().addGems(loot.gems, `${def.name}`);
        if (loot.xp > 0) get().addXp(loot.xp);
        if (loot.boost) {
          set((st) => ({
            boosts: {
              xpUntil: Date.now() + 30 * 60 * 1000,
              coinUntil: Date.now() + 30 * 60 * 1000,
            },
            log: [{ ts: Date.now(), msg: "BOOST x2 XP+MON activado por 30 min", delta: undefined }, ...st.log].slice(0, 50),
          }));
        }
        set((st) => ({ crateOpens: st.crateOpens + 1 }));
        get().addPassXp(12);
        get().checkAchievements();
        return loot;
      },

      // ====== STAKING v8 ======
      stakeAsset: (assetId, coins) => {
        if (coins <= 0) return false;
        if (!get().spendCoins(coins, `Staking ${assetId}`)) return false;
        const now = Date.now();
        set((st) => {
          const cur = st.stakes[assetId];
          return {
            stakes: {
              ...st.stakes,
              [assetId]: {
                coins: (cur?.coins ?? 0) + coins,
                startAt: cur?.startAt ?? now,
                lastClaimAt: cur?.lastClaimAt ?? now,
              },
            },
            stakeCount: st.stakeCount + (cur ? 0 : 1),
          };
        });
        get().addPassXp(8);
        get().checkAchievements();
        return true;
      },
      claimStake: (assetId) => {
        const s = get();
        const stake = s.stakes[assetId];
        if (!stake || stake.coins <= 0) return 0;
        const apy = stakingApyFor(assetId);
        const accrued = stakeAccrued(stake.coins, apy, stake.lastClaimAt);
        if (accrued <= 0) return 0;
        set((st) => ({
          stakes: { ...st.stakes, [assetId]: { ...st.stakes[assetId], lastClaimAt: Date.now() } },
          stakeEarnedTotal: st.stakeEarnedTotal + accrued,
        }));
        get().addCoins(accrued, `Intereses de staking ${assetId}`);
        get().addPassXp(5);
        return accrued;
      },
      unstakeAsset: (assetId) => {
        const s = get();
        const stake = s.stakes[assetId];
        if (!stake || stake.coins <= 0) return 0;
        const apy = stakingApyFor(assetId);
        const accrued = stakeAccrued(stake.coins, apy, stake.lastClaimAt);
        const total = stake.coins + accrued;
        set((st) => {
          const stakes = { ...st.stakes };
          delete stakes[assetId];
          return { stakes, stakeEarnedTotal: st.stakeEarnedTotal + accrued };
        });
        get().addCoins(total, `Retirar staking ${assetId}`);
        return total;
      },
      addAlert: (assetId, op, price) => {
        set((st) => ({
          alerts: [
            ...st.alerts,
            { id: `AL-${st.nextAlertId}`, assetId, op, price, createdAt: Date.now() },
          ],
          nextAlertId: st.nextAlertId + 1,
        }));
      },
      removeAlert: (id) => {
        set((st) => ({ alerts: st.alerts.filter((a) => a.id !== id) }));
      },

      // ====== APUESTAS v8 ======
      recordBet: (wager, won, payout) => {
        set((st) => ({
          betStats: {
            placed: st.betStats.placed + 1,
            won: st.betStats.won + (won ? 1 : 0),
            wagered: st.betStats.wagered + wager,
            payout: st.betStats.payout + payout,
          },
        }));
        get().addPassXp(won ? 10 : 4);
        get().checkAchievements();
      },
      claimFreeBet: () => {
        const s = get();
        const today = dayKey();
        if (s.lastFreeBetDate === today) return false;
        set({ lastFreeBetDate: today });
        get().addCoins(50, "Apuesta gratis diaria");
        return true;
      },

      // ====== PASE VANGUARD v8 ======
      addPassXp: (n) => {
        set((st) => {
          // reset de temporada: si cambia el mes, el PX de pase vuelve a 0
          const season = passSeasonIndex();
          const sameSeason = st.passSeason === season;
          return {
            passSeason: season,
            passXp: sameSeason ? st.passXp + n : n,
            passClaimedFree: sameSeason ? st.passClaimedFree : [],
            passClaimedElite: sameSeason ? st.passClaimedElite : [],
          };
        });
      },
      claimPassTier: (tier, track) => {
        const s = get();
        const def = PASS_TIERS.find((p) => p.tier === tier);
        if (!def) return false;
        if (passTierFor(s.passXp) < tier) return false;
        const claimed = track === "FREE" ? s.passClaimedFree : s.passClaimedElite;
        if (claimed.includes(tier)) return false;
        const reward = track === "FREE" ? def.free : def.elite;
        set((st) => ({
          passClaimedFree: track === "FREE" ? [...st.passClaimedFree, tier] : st.passClaimedFree,
          passClaimedElite: track === "ELITE" ? [...st.passClaimedElite, tier] : st.passClaimedElite,
        }));
        if (reward.coins > 0) get().addCoins(reward.coins, `Pase Vanguard T${tier} (${track})`);
        if (reward.gems > 0) get().addGems(reward.gems, `Pase Vanguard T${tier} (${track})`);
        if (reward.crate) get().grantCrate(reward.crate, 1);
        get().checkAchievements();
        return true;
      },
      recordConquestCaptureStat: () => {
        set((st) => ({ conquestCapturesTotal: st.conquestCapturesTotal + 1 }));
      },
      buyAsset: (assetId, qty, price, fee = 0) => {
        if (qty <= 0) return false;
        const total = Math.round(qty * price);
        const ok = get().spendCoins(total + Math.round(fee), `Comprar ${qty} x ${assetId}`);
        if (!ok) return false;
        set((st) => {
          const cur = st.marketHoldings[assetId] ?? { qty: 0, avgCost: 0 };
          const newQty = cur.qty + qty;
          const newAvg = (cur.avgCost * cur.qty + price * qty) / newQty;
          const trade: MarketTrade = { id: `T-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ts: Date.now(), assetId, side: "BUY", qty, price, total };
          return {
            marketHoldings: { ...st.marketHoldings, [assetId]: { qty: newQty, avgCost: newAvg } },
            marketTrades: [trade, ...st.marketTrades].slice(0, 80),
            marketFeesPaid: st.marketFeesPaid + Math.round(fee),
          };
        });
        get().addXp(Math.max(2, qty / 10 | 0));
        get().checkAchievements();
        return true;
      },
      sellAsset: (assetId, qty, price, fee = 0) => {
        const s = get();
        const cur = s.marketHoldings[assetId];
        if (!cur || cur.qty < qty || qty <= 0) return 0;
        const pnl = Math.round((price - cur.avgCost) * qty - fee);
        const total = Math.round(qty * price - fee);
        set((st) => {
          const trade: MarketTrade = { id: `T-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ts: Date.now(), assetId, side: "SELL", qty, price, total: Math.round(qty * price), pnl };
          const holdings = { ...st.marketHoldings };
          const remaining = holdings[assetId].qty - qty;
          if (remaining <= 0) delete holdings[assetId];
          else holdings[assetId] = { qty: remaining, avgCost: holdings[assetId].avgCost };
          return {
            marketHoldings: holdings,
            marketTrades: [trade, ...st.marketTrades].slice(0, 80),
            marketRealized: st.marketRealized + pnl,
            marketFeesPaid: st.marketFeesPaid + Math.round(fee),
            log: [
              { ts: Date.now(), msg: `Vender ${qty} x ${assetId}: ${pnl >= 0 ? "+" : ""}${pnl} P/L (${pnl >= 0 ? "beneficio" : "perdida"})`, delta: total },
              ...st.log,
            ].slice(0, 50),
          };
        });
        get().addCoins(total, `Vender ${qty} x ${assetId}`);
        get().addXp(Math.max(2, qty / 10 | 0));
        get().checkAchievements();
        return pnl;
      },
      toggleFavorite: (assetId) => {
        set((st) => ({
          marketFavorites: st.marketFavorites.includes(assetId)
            ? st.marketFavorites.filter((i) => i !== assetId)
            : [...st.marketFavorites, assetId],
        }));
      },
      placeOrder: (assetId, side, qty, limitPrice) => {
        if (qty <= 0 || limitPrice <= 0) return false;
        if (side === "BUY") {
          // reservar el peor caso: total + comision
          const worst = Math.round(qty * limitPrice * 1.005);
          if (get().coins < worst) return false;
        } else {
          const cur = get().marketHoldings[assetId];
          if (!cur || cur.qty < qty) return false;
        }
        const order: MarketOrder = { id: `O-${Date.now()}`, ts: Date.now(), assetId, side, qty, limitPrice };
        set((st) => ({ marketOrders: [order, ...st.marketOrders].slice(0, 20) }));
        return true;
      },
      cancelOrder: (orderId) => {
        set((st) => ({ marketOrders: st.marketOrders.filter((o) => o.id !== orderId) }));
      },
      fillOrder: (orderId, price) => {
        const st = get();
        const order = st.marketOrders.find((o) => o.id === orderId);
        if (!order) return { ok: false };
        const fee = Math.round(order.qty * price * 0.005);
        if (order.side === "BUY") {
          const ok = get().buyAsset(order.assetId, order.qty, price, fee);
          if (!ok) return { ok: false };
          set((s2) => ({ marketOrders: s2.marketOrders.filter((o) => o.id !== orderId) }));
          return { ok: true };
        }
        const pnl = get().sellAsset(order.assetId, order.qty, price, fee);
        if (pnl === 0 && !get().marketHoldings[order.assetId]) return { ok: false };
        set((s2) => ({ marketOrders: s2.marketOrders.filter((o) => o.id !== orderId) }));
        return { ok: true, pnl };
      },
      likeReply: (replyId) => {
        set((st) => ({
          forumLikedReplies: st.forumLikedReplies.includes(replyId)
            ? st.forumLikedReplies.filter((i) => i !== replyId)
            : [...st.forumLikedReplies, replyId],
        }));
      },

      // ====== CAMARAS DE VIGILANCIA ======
      isElite: () => {
        if (get().account?.isOwner) return true; // v15: propietario siempre ELITE
        const e = get().eliteUntil;
        return !!e && e > Date.now();
      },
      cameraDiscount: () => (get().isElite() ? ELITE_PASS.discountPct : 0),
      cameraIncomeRate: (cam) => {
        const model: CameraModel = getCameraModel(cam.modelId);
        // intensidad del frente mas cercano dentro del radio de la camara
        let best = 0;
        for (const c of CONFLICTS) {
          const dLat = c.lat - cam.lat;
          const dLng = c.lng - cam.lng;
          const d = Math.sqrt(dLat * dLat + dLng * dLng);
          if (d <= model.radiusDeg) best = Math.max(best, c.intensity);
        }
        const base = best > 0 ? model.coinsPerMin * (best / 100) * model.incomeMult : model.coinsPerMin * 0.15;
        const elite = get().isElite() ? ELITE_PASS.incomeBoost : 1;
        return base * elite;
      },
      cameraPending: (cam) => {
        const model = getCameraModel(cam.modelId);
        const minutes = Math.max(0, (Date.now() - cam.lastCollectAt) / 60000);
        return Math.min(model.capacity, Math.floor(get().cameraIncomeRate(cam) * minutes));
      },
      placeCamera: (modelId, lat, lng, name) => {
        const model = getCameraModel(modelId);
        const disc = get().cameraDiscount();
        const coinsCost = Math.round(model.costCoins * (1 - disc / 100));
        const gemsCost = Math.round(model.costGems * (1 - disc / 100));
        const s = get();
        if (s.coins < coinsCost) return { ok: false, reason: "MONEDAS INSUFICIENTES" };
        if (s.gems < gemsCost) return { ok: false, reason: "GEMAS INSUFICIENTES" };
        if (coinsCost > 0) get().spendCoins(coinsCost, `Instalar camara ${model.tier}`);
        if (gemsCost > 0) get().spendGems(gemsCost, `Instalar camara ${model.tier}`);
        const id = `CAM-${String(s.nextCameraId).padStart(3, "0")}`;
        set((st) => ({
          cameras: [
            ...st.cameras,
            {
              id,
              modelId,
              name: name?.trim().toUpperCase().slice(0, 22) || `${model.tier} ${id}`,
              lat,
              lng,
              installedAt: Date.now(),
              lastCollectAt: Date.now(),
              totalEarned: 0,
              eventsCaught: 0,
            },
          ],
          nextCameraId: st.nextCameraId + 1,
          log: [
            { ts: Date.now(), msg: `Camara ${id} (${model.name}) desplegada en LAT ${lat.toFixed(1)} / LNG ${lng.toFixed(1)}`, delta: -coinsCost },
            ...st.log,
          ].slice(0, 50),
        }));
        get().checkAchievements();
        return { ok: true };
      },
      removeCamera: (id) => {
        const s = get();
        const cam = s.cameras.find((c) => c.id === id);
        if (!cam) return false;
        const model = getCameraModel(cam.modelId);
        const refund = Math.round(model.costCoins * 0.4);
        set((st) => ({
          cameras: st.cameras.filter((c) => c.id !== id),
          coins: st.coins + refund,
          log: [
            { ts: Date.now(), msg: `Camara ${cam.id} retirada (+${refund} monedas de rescate)`, delta: refund },
            ...st.log,
          ].slice(0, 50),
        }));
        return true;
      },
      collectCamera: (id) => {
        const s = get();
        const cam = s.cameras.find((c) => c.id === id);
        if (!cam) return 0;
        const amount = get().cameraPending(cam);
        if (amount <= 0) return 0;
        set((st) => ({
          cameras: st.cameras.map((c) =>
            c.id === id ? { ...c, lastCollectAt: Date.now(), totalEarned: c.totalEarned + amount } : c
          ),
          cameraTotalIncome: st.cameraTotalIncome + amount,
          coins: st.coins + amount,
          log: [
            { ts: Date.now(), msg: `Intel de ${cam.name}: +${amount} monedas`, delta: amount },
            ...st.log,
          ].slice(0, 50),
        }));
        get().addXp(Math.max(1, Math.round(amount / 10)));
        get().checkAchievements();
        return amount;
      },
      collectAllCameras: () => {
        let total = 0;
        for (const cam of get().cameras) {
          total += get().collectCamera(cam.id);
        }
        return total;
      },
      registerCameraEvent: (cameraId) => {
        const s = get();
        const cam = s.cameras.find((c) => c.id === cameraId);
        if (!cam) return null;
        const model = getCameraModel(cam.modelId);
        // el conflicto mas cercano determina la zona del evento
        let nearest = CONFLICTS[0];
        let bestD = Infinity;
        for (const c of CONFLICTS) {
          const d = Math.sqrt((c.lat - cam.lat) ** 2 + (c.lng - cam.lng) ** 2);
          if (d < bestD) {
            bestD = d;
            nearest = c;
          }
        }
        const zoneName = bestD <= model.radiusDeg * 1.6 ? nearest.name : "SECTOR DESCONOCIDO";
        const ev = generateEvent(zoneName, s.nextCameraId);
        const elite = get().isElite() ? ELITE_PASS.incomeBoost : 1;
        const finalCoins = Math.round(ev.coins * model.incomeMult * elite * 0.5);
        const finalXp = Math.max(2, Math.round(ev.xp * model.incomeMult * 0.5));
        const record: CapturedCameraEvent = {
          ...ev,
          coins: finalCoins,
          xp: finalXp,
          cameraId: cam.id,
          cameraName: cam.name,
        };
        set((st) => ({
          cameraEventsLog: [record, ...st.cameraEventsLog].slice(0, 60),
          cameraTotalEvents: st.cameraTotalEvents + 1,
          cameras: st.cameras.map((c) =>
            c.id === cameraId ? { ...c, eventsCaught: c.eventsCaught + 1 } : c
          ),
          coins: st.coins + finalCoins,
          dailyChallengeProgress: {
            ...st.dailyChallengeProgress,
            "DC-9": (st.dailyChallengeProgress["DC-9"] || 0) + 1,
          },
          log: [
            { ts: Date.now(), msg: `Evento captado por ${cam.name}: ${ev.title} (+${finalCoins} monedas)`, delta: finalCoins },
            ...st.log,
          ].slice(0, 50),
        }));
        get().addXp(finalXp);
        get().checkAchievements();
        return record;
      },
      activateElite: (payWith) => {
        const disc = 0;
        const coinCost = payWith === "COINS" ? Math.round(ELITE_PASS.costCoins * (1 - disc / 100)) : 0;
        const gemCost = payWith === "GEMS" ? ELITE_PASS.costGems : 0;
        const s = get();
        if (payWith === "COINS" && s.coins < coinCost) return false;
        if (payWith === "GEMS" && s.gems < gemCost) return false;
        if (coinCost > 0) get().spendCoins(coinCost, "Pase ELITE 7 dias");
        if (gemCost > 0) get().spendGems(gemCost, "Pase ELITE 7 dias");
        set((st) => ({
          eliteUntil: Date.now() + ELITE_PASS.durationMs,
          log: [
            { ts: Date.now(), msg: "PASE ELITE activado: ingresos x2, gemas diarias, descuento camaras", delta: -Math.max(coinCost, gemCost) },
            ...st.log,
          ].slice(0, 50),
        }));
        return true;
      },
      claimEliteDaily: () => {
        const s = get();
        if (!get().isElite()) return false;
        const today = new Date().toISOString().slice(0, 10);
        if (s.eliteLastClaimDate === today) return false;
        set((st) => ({
          eliteLastClaimDate: today,
          gems: st.gems + ELITE_PASS.dailyGems,
          log: [
            { ts: Date.now(), msg: `Beneficio ELITE diario: +${ELITE_PASS.dailyGems} gemas`, delta: ELITE_PASS.dailyGems },
            ...st.log,
          ].slice(0, 50),
        }));
        return true;
      },

      addToInventory: (item, qty = 1) => {
        set((s) => {
          const existing = s.inventory.find((i) => i.id === item.id);
          if (existing) {
            return {
              inventory: s.inventory.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + qty } : i
              ),
            };
          }
          return { inventory: [...s.inventory, { ...item, quantity: qty }] };
        });
      },
      consumeFromInventory: (id, qty) => {
        const s = get();
        const item = s.inventory.find((i) => i.id === id);
        if (!item || item.quantity < qty) return false;
        set((st) => ({
          inventory: st.inventory
            .map((i) => (i.id === id ? { ...i, quantity: i.quantity - qty } : i))
            .filter((i) => i.quantity > 0),
        }));
        return true;
      },

      claimWeeklyDay: (day, rewards) => {
        const s = get();
        if (s.claimedWeeklyDays.includes(day)) return;
        const today = new Date().toISOString().slice(0, 10);
        set((st) => {
          const base = {
            ...st,
            claimedWeeklyDays: [...st.claimedWeeklyDays, day],
            lastWeeklyClaimDate: today,
            coins: st.coins + rewards.coins,
            gems: st.gems + rewards.gems,
            log: [
              { ts: Date.now(), msg: `Recompensa semanal dia ${day}: +${rewards.coins} monedas, +${rewards.gems} gemas, +${rewards.xp} XP`, delta: rewards.coins },
              ...st.log,
            ].slice(0, 50),
          };
          const leveled = levelUp({ ...base, xp: base.xp + rewards.xp });
          return { ...base, ...leveled };
        });
      },

      checkAchievements: () => {
        const s = get();
        const snapshot: AchievementState = {
          level: s.level,
          streak: s.streak,
          fusionCount: s.fusionCount,
          quizCorrect: s.quizCorrect,
          readBriefings: s.readBriefings.length,
          viewedNews: s.viewedNews.length,
          viewedPhotos: s.viewedPhotos.length,
          openedMaps: s.openedMaps.length,
          predictions: s.predictions.length,
          coins: s.coins,
          gems: s.gems,
          unlockedBriefings: s.unlockedBriefings.length,
          claimedMissions: Object.values(s.missionProgress as Record<string, { claimed: boolean }>).filter((m) => m.claimed).length,
          logrosUnlocked: s.unlockedAchievements.length,
          visitedTabs: s.visitedTabs,
          minigameBestScore: s.minigameBestScore,
          camerasPlaced: s.cameras.length,
          cameraEvents: s.cameraTotalEvents,
          cameraIncome: s.cameraTotalIncome,
          conquestTerritories: s.conquestSave
            ? Object.values(s.conquestSave.territories as Record<string, { owner: number; troops: number }>).filter((t) => t.owner === 0).length
            : 0,
          conquestCaptures: s.conquestSave?.captures ?? 0,
          conquestWins: s.conquestWins,
          marketTrades: s.marketTrades.length,
          marketProfit: s.marketRealized,
          myVideos: s.myVideos.length,
          myPolls: s.myPolls.length,
          myPhotos: s.myPhotos.length,
          mpCaptures: s.mpStats.captures,
          mpWins: s.mpStats.wins,
          wheelSpins: s.wheelSpinsTotal,
          crateOpens: s.crateOpens,
          stakeCount: s.stakeCount,
          betsWon: s.betStats.won,
          passTierReached: passTierFor(s.passXp),
          conquestCapturesTotal: s.conquestCapturesTotal,
        };
        const newly: string[] = [];
        for (const a of ACHIEVEMENTS) {
          if (!s.unlockedAchievements.includes(a.id) && a.check(snapshot)) {
            newly.push(a.id);
          }
        }
        if (newly.length > 0) {
          set((st) => ({
            unlockedAchievements: [...st.unlockedAchievements, ...newly],
            log: [
              ...newly.map((id) => {
                const ach = ACHIEVEMENTS.find((x) => x.id === id);
                return { ts: Date.now(), msg: `Logro desbloqueado: ${ach?.title ?? id}`, delta: ach?.coinReward };
              }),
              ...st.log,
            ].slice(0, 50),
          }));
        }
        return newly;
      },

      claimAchievement: (id, rewards) => {
        set((s) => {
          if (!s.unlockedAchievements.includes(id) || s.claimedAchievements.includes(id)) return s;
          const boostC = s.boosts.coinUntil && s.boosts.coinUntil > Date.now() ? 2 : 1;
          const boostX = s.boosts.xpUntil && s.boosts.xpUntil > Date.now() ? 2 : 1;
          const base = {
            ...s,
            coins: s.coins + rewards.coins * boostC,
            gems: s.gems + rewards.gems,
            claimedAchievements: [...s.claimedAchievements, id],
            log: [
              { ts: Date.now(), msg: `Logro reclamado: ${id} (+${rewards.coins * boostC} monedas, +${rewards.xp * boostX} XP)`, delta: rewards.coins * boostC },
              ...s.log,
            ].slice(0, 50),
          };
          const leveled = levelUp({ ...base, xp: base.xp + rewards.xp * boostX });
          return { ...base, ...leveled };
        });
      },

      setMuted: (m) => set({ muted: m }),

      setAlias: (alias) => set({ alias: alias.trim().toUpperCase().slice(0, 24) || defaultAlias() }),

      exportProgress: () => {
        const s = get();
        // strip non-serializable functions, keep only data fields
        const data = {
          version: 1,
          exportedAt: new Date().toISOString(),
          state: {
            alias: s.alias,
            avatarSeed: s.avatarSeed,
            coins: s.coins,
            gems: s.gems,
            xp: s.xp,
            level: s.level,
            rank: s.rank,
            streak: s.streak,
            lastLoginDate: s.lastLoginDate,
            lastWeeklyClaimDate: s.lastWeeklyClaimDate,
            claimedWeeklyDays: s.claimedWeeklyDays,
            missionProgress: s.missionProgress,
            inventory: s.inventory,
            unlockedBriefings: s.unlockedBriefings,
            readBriefings: s.readBriefings,
            viewedNews: s.viewedNews,
            viewedPhotos: s.viewedPhotos,
            openedMaps: s.openedMaps,
            predictions: s.predictions,
            quizAnswered: s.quizAnswered,
            quizCorrect: s.quizCorrect,
            fusionCount: s.fusionCount,
            dailyChallengeProgress: s.dailyChallengeProgress,
            dailyChallengeClaimed: s.dailyChallengeClaimed,
            dailyChallengeDate: s.dailyChallengeDate,
            minigameBestScore: s.minigameBestScore,
            minigameTotalScore: s.minigameTotalScore,
            minigameTotalHits: s.minigameTotalHits,
            visitedTabs: s.visitedTabs,
            unlockedAchievements: s.unlockedAchievements,
            claimedAchievements: s.claimedAchievements,
            hudTheme: s.hudTheme,
            ownedCosmetics: s.ownedCosmetics,
            ownedAvatars: s.ownedAvatars,
            activeAvatar: s.activeAvatar,
            muted: s.muted,
            boosts: s.boosts,
            cameras: s.cameras,
            cameraEventsLog: s.cameraEventsLog,
            cameraTotalIncome: s.cameraTotalIncome,
            cameraTotalEvents: s.cameraTotalEvents,
            nextCameraId: s.nextCameraId,
            eliteUntil: s.eliteUntil,
            eliteLastClaimDate: s.eliteLastClaimDate,
            forumThreads: s.forumThreads,
            forumReplies: s.forumReplies,
            forumLikedIds: s.forumLikedIds,
            forumLikedReplies: s.forumLikedReplies,
            forumViewedIds: s.forumViewedIds,
            pollVotes: s.pollVotes,
            videoReactions: s.videoReactions,
            subscribedChannels: s.subscribedChannels,
            watchHistory: s.watchHistory,
            comments: s.comments,
            nextThreadId: s.nextThreadId,
            conquestSave: s.conquestSave,
            conquestWins: s.conquestWins,
            marketHoldings: s.marketHoldings,
            marketTrades: s.marketTrades,
            marketRealized: s.marketRealized,
            marketFavorites: s.marketFavorites,
            marketOrders: s.marketOrders,
            marketFeesPaid: s.marketFeesPaid,
            myVideos: s.myVideos,
            myPolls: s.myPolls,
            myPhotos: s.myPhotos,
            nextVideoId: s.nextVideoId,
            nextPollId: s.nextPollId,
            nextPhotoId: s.nextPhotoId,
            mpStats: s.mpStats,
            wheelSpinsTotal: s.wheelSpinsTotal,
            lastWheelDate: s.lastWheelDate,
            lastAirdropAt: s.lastAirdropAt,
            freeCrates: s.freeCrates,
            crateOpens: s.crateOpens,
            stakeCount: s.stakeCount,
            stakes: s.stakes,
            stakeEarnedTotal: s.stakeEarnedTotal,
            alerts: s.alerts,
            nextAlertId: s.nextAlertId,
            betStats: s.betStats,
            lastFreeBetDate: s.lastFreeBetDate,
            passXp: s.passXp,
            passSeason: s.passSeason,
            passClaimedFree: s.passClaimedFree,
            passClaimedElite: s.passClaimedElite,
            conquestCapturesTotal: s.conquestCapturesTotal,
            log: s.log,
          },
        };
        return JSON.stringify(data, null, 2);
      },

      importProgress: (json) => {
        try {
          const data = JSON.parse(json);
          if (!data || !data.state) return false;
          const imported = data.state;
          set((s) => ({
            ...s,
            ...imported,
          }));
          return true;
        } catch {
          return false;
        }
      },

      recordTabVisit: (tab) => {
        set((s) => {
          if (s.visitedTabs.includes(tab)) return s;
          const visited = [...s.visitedTabs, tab];
          const daily = { ...s.dailyChallengeProgress };
          daily["DC-1"] = visited.length;
          return { visitedTabs: visited, dailyChallengeProgress: daily };
        });
      },

      recordMinigameStats: (score, hits) => {
        set((s) => {
          const daily = { ...s.dailyChallengeProgress };
          daily["DC-2"] = (daily["DC-2"] || 0) + hits;
          return {
            minigameBestScore: Math.max(s.minigameBestScore, score),
            minigameTotalScore: s.minigameTotalScore + score,
            minigameTotalHits: s.minigameTotalHits + hits,
            dailyChallengeProgress: daily,
          };
        });
      },

      claimDailyChallenge: (id, rewards) => {
        set((s) => {
          if (s.dailyChallengeClaimed.includes(id)) return s;
          const boostC = s.boosts.coinUntil && s.boosts.coinUntil > Date.now() ? 2 : 1;
          const boostX = s.boosts.xpUntil && s.boosts.xpUntil > Date.now() ? 2 : 1;
          const base = {
            ...s,
            coins: s.coins + rewards.coins * boostC,
            claimedAchievements: s.claimedAchievements,
            dailyChallengeClaimed: [...s.dailyChallengeClaimed, id],
            log: [
              { ts: Date.now(), msg: `Reto diario reclamado: ${id} (+${rewards.coins * boostC} monedas, +${rewards.xp * boostX} XP)`, delta: rewards.coins * boostC },
              ...s.log,
            ].slice(0, 50),
          };
          const leveled = levelUp({ ...base, xp: base.xp + rewards.xp * boostX });
          return { ...base, ...leveled };
        });
      },

      resetProgress: () => {
        set({
          alias: "",
          coins: 250,
          gems: 5,
          xp: 0,
          level: 1,
          rank: "RECLUTA",
          streak: 0,
          missionProgress: {},
          inventory: [
            { id: "raw_cable", label: "Cable bruto", emoji: "radio", rarity: "COMUN", quantity: 5 },
            { id: "raw_photo", label: "Foto OSINT", emoji: "image", rarity: "COMUN", quantity: 3 },
          ],
          unlockedBriefings: [],
          readBriefings: [],
          viewedNews: [],
          viewedPhotos: [],
          openedMaps: [],
          predictions: [],
          quizAnswered: [],
          quizCorrect: 0,
          fusionCount: 0,
          dailyChallengeProgress: {},
          dailyChallengeClaimed: [],
          dailyChallengeDate: null,
          minigameBestScore: 0,
          minigameTotalScore: 0,
          minigameTotalHits: 0,
          visitedTabs: [],
          unlockedAchievements: [],
          claimedAchievements: [],
          claimedWeeklyDays: [],
          cameras: [],
          cameraEventsLog: [],
          cameraTotalIncome: 0,
          cameraTotalEvents: 0,
          nextCameraId: 1,
          eliteUntil: null,
          eliteLastClaimDate: null,
          conquestSave: null,
          conquestWins: 0,
          marketHoldings: {},
          marketTrades: [],
          marketRealized: 0,
          forumThreads: [],
          forumReplies: {},
          forumLikedIds: [],
          forumViewedIds: [],
          pollVotes: {},
          videoReactions: {},
          subscribedChannels: ["vg-official"],
          watchHistory: [],
          comments: {},
          nextThreadId: 1,
          myVideos: [],
          myPolls: [],
          myPhotos: [],
          nextVideoId: 1,
          nextPollId: 1,
          nextPhotoId: 1,
          mpStats: { wins: 0, captures: 0, gemsEarned: 0, games: 0 },
          wheelSpinsTotal: 0,
          lastWheelDate: null,
          lastAirdropAt: null,
          freeCrates: { COMUN: 0, ELITE: 0, LEGENDARIA: 0 },
          crateOpens: 0,
          stakeCount: 0,
          stakes: {},
          stakeEarnedTotal: 0,
          alerts: [],
          nextAlertId: 1,
          betStats: { placed: 0, won: 0, wagered: 0, payout: 0 },
          lastFreeBetDate: null,
          passXp: 0,
          passSeason: passSeasonIndex(),
          passClaimedFree: [],
          passClaimedElite: [],
          conquestCapturesTotal: 0,
          log: [],
        });
      },
    }),
    {
      name: "vanguard-game-state-v1",
      version: 8,
      storage: createJSONStorage(() => debouncedLocalStorage),
      merge: (persisted: any, current: any) => {
        // shallow merge: keep new fields from current if not in persisted
        return { ...current, ...persisted };
      },
      migrate: (persisted: any, version: number) => {
        const base = {
          ...persisted,
          dailyChallengeProgress: persisted?.dailyChallengeProgress ?? {},
          dailyChallengeClaimed: persisted?.dailyChallengeClaimed ?? [],
          dailyChallengeDate: persisted?.dailyChallengeDate ?? null,
          minigameBestScore: persisted?.minigameBestScore ?? 0,
          minigameTotalScore: persisted?.minigameTotalScore ?? 0,
          minigameTotalHits: persisted?.minigameTotalHits ?? 0,
          visitedTabs: persisted?.visitedTabs ?? [],
          unlockedAchievements: persisted?.unlockedAchievements ?? [],
          claimedAchievements: persisted?.claimedAchievements ?? [],
          muted: persisted?.muted ?? false,
        };
        if (version < 3) {
          return {
            ...base,
            cameras: persisted?.cameras ?? [],
            cameraEventsLog: persisted?.cameraEventsLog ?? [],
            cameraTotalIncome: persisted?.cameraTotalIncome ?? 0,
            cameraTotalEvents: persisted?.cameraTotalEvents ?? 0,
            nextCameraId: persisted?.nextCameraId ?? 1,
            eliteUntil: persisted?.eliteUntil ?? null,
            eliteLastClaimDate: persisted?.eliteLastClaimDate ?? null,
          };
        }
        if (version < 5) {
          return {
            ...base,
            forumThreads: persisted?.forumThreads ?? [],
            forumReplies: persisted?.forumReplies ?? {},
            forumLikedIds: persisted?.forumLikedIds ?? [],
            forumViewedIds: persisted?.forumViewedIds ?? [],
            pollVotes: persisted?.pollVotes ?? {},
            videoReactions: persisted?.videoReactions ?? {},
            subscribedChannels: persisted?.subscribedChannels ?? ["vg-official"],
            watchHistory: persisted?.watchHistory ?? [],
            comments: persisted?.comments ?? {},
            nextThreadId: persisted?.nextThreadId ?? 1,
          };
        }
        if (version < 6) {
          return {
            ...base,
            conquestSave: persisted?.conquestSave ?? null,
            conquestWins: persisted?.conquestWins ?? 0,
            marketHoldings: persisted?.marketHoldings ?? {},
            marketTrades: persisted?.marketTrades ?? [],
            marketRealized: persisted?.marketRealized ?? 0,
            marketFavorites: persisted?.marketFavorites ?? ["USDX"],
            marketOrders: persisted?.marketOrders ?? [],
            marketFeesPaid: persisted?.marketFeesPaid ?? 0,
            forumLikedReplies: persisted?.forumLikedReplies ?? [],
          };
        }
        if (version < 7) {
          return {
            ...base,
            conquestSave: persisted?.conquestSave ?? null,
            conquestWins: persisted?.conquestWins ?? 0,
            marketHoldings: persisted?.marketHoldings ?? {},
            marketTrades: persisted?.marketTrades ?? [],
            marketRealized: persisted?.marketRealized ?? 0,
            marketFavorites: persisted?.marketFavorites ?? ["USDX"],
            marketOrders: persisted?.marketOrders ?? [],
            marketFeesPaid: persisted?.marketFeesPaid ?? 0,
            forumLikedReplies: persisted?.forumLikedReplies ?? [],
            myVideos: persisted?.myVideos ?? [],
            myPolls: persisted?.myPolls ?? [],
            myPhotos: persisted?.myPhotos ?? [],
            nextVideoId: persisted?.nextVideoId ?? 1,
            nextPollId: persisted?.nextPollId ?? 1,
            nextPhotoId: persisted?.nextPhotoId ?? 1,
            mpStats: persisted?.mpStats ?? { wins: 0, captures: 0, gemsEarned: 0, games: 0 },
          };
        }
        return {
          ...base,
          conquestSave: persisted?.conquestSave ?? null,
          conquestWins: persisted?.conquestWins ?? 0,
          marketHoldings: persisted?.marketHoldings ?? {},
          marketTrades: persisted?.marketTrades ?? [],
          marketRealized: persisted?.marketRealized ?? 0,
          marketFavorites: persisted?.marketFavorites ?? ["USDX"],
          marketOrders: persisted?.marketOrders ?? [],
          marketFeesPaid: persisted?.marketFeesPaid ?? 0,
          forumLikedReplies: persisted?.forumLikedReplies ?? [],
          myVideos: persisted?.myVideos ?? [],
          myPolls: persisted?.myPolls ?? [],
          myPhotos: persisted?.myPhotos ?? [],
          nextVideoId: persisted?.nextVideoId ?? 1,
          nextPollId: persisted?.nextPollId ?? 1,
          nextPhotoId: persisted?.nextPhotoId ?? 1,
          mpStats: persisted?.mpStats ?? { wins: 0, captures: 0, gemsEarned: 0, games: 0 },
          // v8 — CENTRO DE GANANCIAS + STAKING + APUESTAS + PASE
          wheelSpinsTotal: persisted?.wheelSpinsTotal ?? 0,
          lastWheelDate: persisted?.lastWheelDate ?? null,
          lastAirdropAt: persisted?.lastAirdropAt ?? null,
          freeCrates: persisted?.freeCrates ?? { COMUN: 0, ELITE: 0, LEGENDARIA: 0 },
          crateOpens: persisted?.crateOpens ?? 0,
          stakeCount: persisted?.stakeCount ?? 0,
          stakes: persisted?.stakes ?? {},
          stakeEarnedTotal: persisted?.stakeEarnedTotal ?? 0,
          alerts: persisted?.alerts ?? [],
          nextAlertId: persisted?.nextAlertId ?? 1,
          betStats: persisted?.betStats ?? { placed: 0, won: 0, wagered: 0, payout: 0 },
          lastFreeBetDate: persisted?.lastFreeBetDate ?? null,
          passXp: persisted?.passXp ?? 0,
          passSeason: persisted?.passSeason ?? 0,
          passClaimedFree: persisted?.passClaimedFree ?? [],
          passClaimedElite: persisted?.passClaimedElite ?? [],
          conquestCapturesTotal: persisted?.conquestCapturesTotal ?? 0,
        };
      },
    }
  )
);

// ====== v15 — AUTO-GUARDADO EN LA NUBE (solo con sesión iniciada) ======
if (typeof window !== "undefined") {
  let dirty = false;
  let pushing = false;
  useGameStore.subscribe(() => {
    dirty = true;
  });
  setInterval(() => {
    if (!dirty || pushing) return;
    if (!useGameStore.getState().account) return;
    dirty = false;
    pushing = true;
    useGameStore
      .getState()
      .pushCloudSave()
      .finally(() => {
        pushing = false;
      });
  }, 15000);
  window.addEventListener("beforeunload", () => {
    const acct = useGameStore.getState().account;
    if (!acct) return;
    try {
      const s = useGameStore.getState();
      const snap: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(s)) if (typeof v !== "function") snap[k] = v;
      const body = JSON.stringify({ save: JSON.stringify(snap) });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/auth/save", new Blob([body], { type: "application/json" }));
      }
    } catch {
      /* noop */
    }
  });
}
