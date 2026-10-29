// ============================================================
// v86.0 CENTINELA GLOBAL — FILTRO DE CONTENIDO GRÁFICO
// v134.0 EL ESTRENO: EL MODO GUERRA (versión ligera «sin imágenes»)
// queda ELIMINADO por orden del Dueño — atrapaba visitantes en una
// pantalla negra sin salida clara. Solo sobrevive aquí el filtro de
// contenido explícito (protege sin censurar, no toca el diseño).
// ============================================================

// Estado del filtro de contenido gráfico (misma mecánica, bus aparte)
const LS_FILTRO = "vanguard-filtro-grafico";
export const FILTRO_EVENTO = "vanguard:filtro-grafico";

export function filtroGraficoActivo(): boolean {
  try {
    // POR DEFECTO ACTIVO: la advertencia de contenido explícito protege sin censurar
    return (localStorage.getItem(LS_FILTRO) ?? "1") === "1";
  } catch {
    return true;
  }
}

export function setFiltroGrafico(activo: boolean) {
  try {
    localStorage.setItem(LS_FILTRO, activo ? "1" : "0");
  } catch { /* sin storage */ }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(FILTRO_EVENTO, { detail: { activo } }));
  }
}

export function suscribirFiltroGrafico(cb: (activo: boolean) => void): () => void {
  cb(filtroGraficoActivo());
  const listener = (e: Event) => cb(Boolean((e as CustomEvent).detail?.activo));
  window.addEventListener(FILTRO_EVENTO, listener);
  const storage = () => cb(filtroGraficoActivo());
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(FILTRO_EVENTO, listener);
    window.removeEventListener("storage", storage);
  };
}
