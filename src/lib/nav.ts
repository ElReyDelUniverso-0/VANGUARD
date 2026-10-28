// Vanguard v14 — navegación programática entre paneles y menú global.
import type { TabKey } from "@/components/vanguard/tab-nav";

const LS_USO_ATAJOS = "vg195-atajos-usage";

/** v195 TU LADO: cuenta el uso real de cada sala (muelle de atajos que aprende). */
function contarUso(tab: TabKey) {
  try {
    const raw = localStorage.getItem(LS_USO_ATAJOS);
    const uso = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    uso[tab] = (uso[tab] ?? 0) + 1;
    localStorage.setItem(LS_USO_ATAJOS, JSON.stringify(uso));
  } catch {
    /* el uso es estadística: si falla, la navegación sigue igual */
  }
}

/** Cambia de pestaña desde cualquier componente (page.tsx escucha el evento). */
export function navigateTo(tab: TabKey) {
  contarUso(tab);
  window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: tab }));
}

/** Abre el menú completo a pantalla completa. */
export function openMainMenu() {
  window.dispatchEvent(new CustomEvent("vanguard:open-menu"));
}
