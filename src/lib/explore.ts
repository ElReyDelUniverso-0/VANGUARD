// v48.0 BRÚJULA — EXPLORADOR DE MUNDOS
// Convierte la navegación en una mecánica de juego: cada sección nueva que el
// comandante descubre suma progreso y paga monedas al cruzar hitos.
// Objetivo de marketing: matar el problema "hay secciones enterradas que nadie
// ve" dándole a cada rincón de VANGUARD un incentivo económico de visita.

// Hitos fijos + el último (todas las secciones) se añade dinámicamente en el
// componente con ALL_TABS.length. Recompensas crecientes.
export const EXPLORE_STEPS = [10, 25, 50] as const;

export const EXPLORE_REWARDS: Record<number, number> = {
  10: 150,
  25: 400,
  50: 1000,
};

export function exploreRewardFor(step: number, total: number): number {
  if (step >= total) return 2500;
  return EXPLORE_REWARDS[step] ?? 100;
}

// localStorage de hitos ya cobrados (evita dobles pagos entre sesiones)
export const LS_EXPLORE_CLAIMED = "vanguard_explore_claimed_v1";

export function claimedMilestones(): number[] {
  try {
    const raw = localStorage.getItem(LS_EXPLORE_CLAIMED);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => typeof n === "number") : [];
  } catch {
    return [];
  }
}

export function markMilestoneClaimed(step: number): void {
  try {
    const cur = claimedMilestones();
    if (!cur.includes(step)) {
      localStorage.setItem(LS_EXPLORE_CLAIMED, JSON.stringify([...cur, step]));
    }
  } catch {
    /* sin localStorage no hay cobro, pero la app sigue */
  }
}
