// Vanguard v14 — navegación programática entre paneles y menú global.
import type { TabKey } from "@/components/vanguard/tab-nav";

/** Cambia de pestaña desde cualquier componente (page.tsx escucha el evento). */
export function navigateTo(tab: TabKey) {
  window.dispatchEvent(new CustomEvent("vanguard:navigate", { detail: tab }));
}

/** Abre el menú completo a pantalla completa. */
export function openMainMenu() {
  window.dispatchEvent(new CustomEvent("vanguard:open-menu"));
}
