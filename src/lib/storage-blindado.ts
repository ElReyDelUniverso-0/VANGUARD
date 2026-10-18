// ============================================================
// v132.0 LA GRAN AUDITORÍA — STORAGE BLINDADO
// Con skipHydration, los stores no leen localStorage hasta que
// EL REHIDRATADOR lo ordena (post-hidratación de React). Pero
// zustand persist escribe en CADA setState — y un setState que
// llegue ANTES de la rehidratación (initPlayer, detección de
// idioma…) pisa lo guardado con los valores por defecto.
// LA CERRADURA: ninguna escritura sale hasta que su store
// termina de rehidratarse. Lo guardado es intocable hasta
// entonces. El progreso del visitante es sagrado.
// ============================================================

const HIDRATADOS = new Set<string>();

export function marcarHidratado(name: string) {
  HIDRATADOS.add(name);
}

export function estaHidratado(name: string): boolean {
  return HIDRATADOS.has(name);
}

/** StateStorage con cerradura de hidratación — sustituye a localStorage directo */
export const storageBlindado = {
  getItem: (name: string): string | null => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (!HIDRATADOS.has(name)) return; // cerradura: nada sale antes de hidratar
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* cuota llena — ignorar silenciosamente */
    }
  },
  removeItem: (name: string): void => {
    if (!HIDRATADOS.has(name)) return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* noop */
    }
  },
};
