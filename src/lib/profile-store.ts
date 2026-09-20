"use client";

// v19 PERFIL: personalización persistente del agente — countryball, banner,
// marco, bio y país favorito. Store propio (no toca game-store) con persist localStorage.
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BannerStyle = "aurora" | "inferno" | "royal" | "arctic" | "stealth";
export type FrameStyle = "none" | "neon" | "gold" | "camo" | "radar";

export interface ProfileState {
  cbAvatar: string;          // countryball elegido (código país)
  banner: BannerStyle;       // gradiente del banner
  frame: FrameStyle;         // marco del avatar
  bio: string;               // frase del agente
  favCountry: string;        // país favorito (code)
  favFaction: string;        // facción declarada
  setCbAvatar: (c: string) => void;
  setBanner: (b: BannerStyle) => void;
  setFrame: (f: FrameStyle) => void;
  setBio: (b: string) => void;
  setFavCountry: (c: string) => void;
  setFavFaction: (f: string) => void;
}

export const BANNERS: Record<BannerStyle, { label: string; css: string }> = {
  aurora:  { label: "Aurora Eléctrica", css: "linear-gradient(120deg,#0A0A0F 0%,#0d2540 40%,#1E90FF 100%)" },
  inferno: { label: "Infierno Rojo",    css: "linear-gradient(120deg,#0A0A0F 0%,#3d0d0d 40%,#FF3B30 100%)" },
  royal:   { label: "Dorado Real",      css: "linear-gradient(120deg,#0A0A0F 0%,#2e2410 40%,#d4af37 100%)" },
  arctic:  { label: "Ártico",           css: "linear-gradient(120deg,#0A0A0F 0%,#0c2e2a 40%,#00FF87 100%)" },
  stealth: { label: "Sigilo",           css: "linear-gradient(120deg,#0A0A0F 0%,#1a1a2e 55%,#3a3a55 100%)" },
};

export const FRAMES: Record<FrameStyle, { label: string; ring: string }> = {
  none:  { label: "Sin marco",   ring: "none" },
  neon:  { label: "Neón",        ring: "0 0 0 2px #1E90FF, 0 0 12px #1E90FF88" },
  gold:  { label: "Oro",         ring: "0 0 0 2px #d4af37, 0 0 12px #d4af3788" },
  camo:  { label: "Camuflaje",   ring: "0 0 0 3px #3a4a3a" },
  radar: { label: "Radar",       ring: "0 0 0 2px #00FF87, 0 0 14px #00FF8799" },
};

export const FACTIONS = [
  "Bloque Occidental", "Bloque Oriental", "No Alineado", "Mercenario Independiente",
  "Observador OSINT", "Resistencia Digital", "Comandante Supremo",
];

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      cbAvatar: "us",
      banner: "aurora",
      frame: "neon",
      bio: "Agente en activo. El mundo, en tiempo real.",
      favCountry: "us",
      favFaction: "Observador OSINT",
      setCbAvatar: (cbAvatar) => set({ cbAvatar }),
      setBanner: (banner) => set({ banner }),
      setFrame: (frame) => set({ frame }),
      setBio: (bio) => set({ bio }),
      setFavCountry: (favCountry) => set({ favCountry }),
      setFavFaction: (favFaction) => set({ favFaction }),
    }),
    { name: "vanguard-profile-v1" }
  )
);
