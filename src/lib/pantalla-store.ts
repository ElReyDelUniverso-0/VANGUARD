// VANGUARD v97.0 · PANTALLA TOTAL — estado de VANGUARD TV
// Likes, suscripciones, "ver luego", comentarios propios y cuota diaria de la
// recompensa ESPECTADOR CRÍTICO (proyectar pases nuevos paga monedas).

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dayKeyUtc } from "./googles";

export const TV_REWARD = { coins: 6, xp: 4 };
export const TV_MAX_DIA = 5;

export interface ComentarioPropio {
  id: string;
  paseId: string;
  texto: string;
  haceMin: number;
}

interface EstadoTV {
  /** ids de pases con like */
  liked: string[];
  /** canales suscritos */
  subs: string[];
  /** pases guardados en "ver luego" */
  guardar: string[];
  /** comentarios escritos por el operador */
  misComentarios: ComentarioPropio[];
  /** pases que ya pagaron recompensa (una vez por pase) */
  recompensados: string[];
  /** cuota diaria de recompensa por proyectar pases nuevos */
  tvDia: string;
  tvN: number;
  toggleLike: (id: string) => boolean;
  toggleSub: (canalId: string) => boolean;
  toggleGuardar: (id: string) => boolean;
  comentar: (paseId: string, texto: string) => boolean;
  registrarTV: (id: string) => boolean;
}

export const usePantalla = create<EstadoTV>()(
  persist(
    (set, get) => ({
      liked: [],
      subs: [],
      guardar: [],
      misComentarios: [],
      recompensados: [],
      tvDia: "",
      tvN: 0,
      toggleLike: (id) => {
        const tiene = get().liked.includes(id);
        set((s) => ({ liked: tiene ? s.liked.filter((x) => x !== id) : [...s.liked, id].slice(-300) }));
        return !tiene;
      },
      toggleSub: (canalId) => {
        const tiene = get().subs.includes(canalId);
        set((s) => ({ subs: tiene ? s.subs.filter((x) => x !== canalId) : [...s.subs, canalId].slice(0, 24) }));
        return !tiene;
      },
      toggleGuardar: (id) => {
        const tiene = get().guardar.includes(id);
        set((s) => ({ guardar: tiene ? s.guardar.filter((x) => x !== id) : [id, ...s.guardar].slice(0, 120) }));
        return !tiene;
      },
      comentar: (paseId, texto) => {
        const v = texto.trim().slice(0, 240);
        if (!v) return false;
        set((s) => ({
          misComentarios: [{ id: paseId + ":mio:" + Date.now(), paseId, texto: v, haceMin: 0 }, ...s.misComentarios].slice(0, 80),
        }));
        return true;
      },
      registrarTV: (id) => {
        const st = get();
        // la recompensa se paga UNA VEZ por pase (lista propia, independiente
        // de like/guardar: deshacer y rehacer no reintenta el cobro)
        if (st.recompensados.includes(id)) return false;
        const hoy = dayKeyUtc();
        const nHoy = st.tvDia === hoy ? st.tvN : 0;
        if (nHoy >= TV_MAX_DIA) return false;
        set({ recompensados: [...st.recompensados, id].slice(-200), tvDia: hoy, tvN: nHoy + 1 });
        return true;
      },
    }),
    { name: "vg-pantalla-v97", storage: createJSONStorage(() => localStorage) },
  ),
);
