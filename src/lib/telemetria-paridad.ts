"use client";

// ══════════════════════════════════════════════════════════════════════
// v172.0 EL PULSO DE LA PARIDAD — telemetría de acciones 3D vs 2D.
// Idea estrella del inbox #16: «la paridad ya existe; ahora hay que
// MEDIRLA». Dos fuentes honestas, cada una con UN punto de medición:
//   · 3D → el raycast del mundo (mundo-webgl, g.tipo === "sala", punto
//     único donde nace vg:sala3d-accion; se saltan "fila" y "__pagina")
//   · 2D → la caja de la Casa (game-store.spendCoins, punto único de la
//     economía; los motivos «desde el mundo 3D» se EXCLUYEN para no
//     doble-contar lo que el raycast ya contó)
// Nada visual cambia: solo medir si la paridad se USA de verdad.
// Storage blindado (mismo escudo de la Cama, patrón favoritos v171).
// ══════════════════════════════════════════════════════════════════════
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageBlindado } from "@/lib/storage-blindado";

export type FuenteAccion = "3d" | "2d";

export interface UltimaAccion {
  verbo: string;
  tab: string;
  fuente: FuenteAccion;
  ts: number;
}

interface TelemetriaState {
  total3d: number;
  total2d: number;
  /** acciones del día UTC — el pulso de HOY */
  hoy3d: number;
  hoy2d: number;
  dia: string; // YYYY-MM-DD UTC (rollover automático al primer pulso del día)
  /** ¿qué salas del mundo se usan de verdad? */
  porTab3d: Record<string, number>;
  /** ¿qué verbos dispara cada lado? */
  porVerbo3d: Record<string, number>;
  porVerbo2d: Record<string, number>;
  ultima: UltimaAccion | null;
  registrarAccion: (tab: string, verbo: string, fuente: FuenteAccion) => void;
  reiniciar: () => void;
}

const diaUtc = () => new Date().toISOString().slice(0, 10);

export const useTelemetriaParidad = create<TelemetriaState>()(
  persist(
    (set) => ({
      total3d: 0,
      total2d: 0,
      hoy3d: 0,
      hoy2d: 0,
      dia: diaUtc(),
      porTab3d: {},
      porVerbo3d: {},
      porVerbo2d: {},
      ultima: null,
      registrarAccion: (tab, verbo, fuente) => {
        try {
          const v = (verbo || "accion").toLowerCase().slice(0, 18);
          const t = (tab || "casa").slice(0, 24);
          const hoy = diaUtc();
          set((st) => {
            const nuevoDia = st.dia !== hoy;
            const es3 = fuente === "3d";
            return {
              dia: hoy,
              total3d: st.total3d + (es3 ? 1 : 0),
              total2d: st.total2d + (es3 ? 0 : 1),
              hoy3d: nuevoDia ? (es3 ? 1 : 0) : st.hoy3d + (es3 ? 1 : 0),
              hoy2d: nuevoDia ? (es3 ? 0 : 1) : st.hoy2d + (es3 ? 0 : 1),
              porTab3d: es3 ? { ...st.porTab3d, [t]: (st.porTab3d[t] ?? 0) + 1 } : st.porTab3d,
              porVerbo3d: es3 ? { ...st.porVerbo3d, [v]: (st.porVerbo3d[v] ?? 0) + 1 } : st.porVerbo3d,
              porVerbo2d: es3 ? st.porVerbo2d : { ...st.porVerbo2d, [v]: (st.porVerbo2d[v] ?? 0) + 1 },
              ultima: { verbo: v, tab: t, fuente, ts: Date.now() },
            };
          });
        } catch {
          /* la métrica jamás bloquea la acción real */
        }
      },
      reiniciar: () =>
        set({
          total3d: 0,
          total2d: 0,
          hoy3d: 0,
          hoy2d: 0,
          dia: diaUtc(),
          porTab3d: {},
          porVerbo3d: {},
          porVerbo2d: {},
          ultima: null,
        }),
    }),
    {
      name: "vg172-telemetria",
      storage: createJSONStorage(() => storageBlindado),
    },
  ),
);

/** helper no-reactivo para los puntos calientes (raycast del mundo, caja de la Casa) */
export function contarAccion(tab: string, verbo: string, fuente: FuenteAccion) {
  try {
    useTelemetriaParidad.getState().registrarAccion(tab, verbo, fuente);
  } catch {
    /* silencio honesto: medir nunca cuesta una acción */
  }
}

/**
 * helper de la caja 2D: cada gasto del panel DOM cuenta como acción 2D,
 * SALVO los que el mundo 3D ya contó (su motivo lleva «desde el mundo 3D»
 * / «EN 3D» — convención de los paneles desde v168).
 */
export function contarGastoCasa(reason: string) {
  try {
    if (/mundo\s*3d|en\s*3d|\b3d\b/i.test(reason || "")) return; // lo contó el raycast
    const verbo = (String(reason || "").trim().split(/\s+/)[0] || "accion").toLowerCase();
    contarAccion("casa", verbo, "2d");
  } catch {
    /* silencio honesto */
  }
}
