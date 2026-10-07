// v86.0 CENTINELA GLOBAL — MODO GUERRA
// "Protocolo de ancho de banda ultra-bajo": un botón que convierte Vanguard en
// su versión ligera de puro texto, para leer el mundo con red de 2G, satélite
// saturado o batería al límite. Pausa animaciones, oculta imágenes pesadas y
// apaga brillos: la verdad sin adorno. Persistido + bus de eventos.

const LS_KEY = "vanguard-modo-guerra";
export const MG_EVENTO = "vanguard:modo-guerra";

export function modoGuerraActivo(): boolean {
  try {
    return localStorage.getItem(LS_KEY) === "1";
  } catch {
    return false;
  }
}

function aplicar(activo: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("modo-guerra", activo);
}

export function setModoGuerra(activo: boolean) {
  try {
    localStorage.setItem(LS_KEY, activo ? "1" : "0");
  } catch { /* sin storage */ }
  aplicar(activo);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MG_EVENTO, { detail: { activo } }));
  }
}

export function toggleModoGuerra(): boolean {
  const next = !modoGuerraActivo();
  setModoGuerra(next);
  return next;
}

/** Se suscribe a cambios y sincroniza el estado inicial. Devuelve cleanup. */
export function suscribirModoGuerra(cb: (activo: boolean) => void): () => void {
  aplicar(modoGuerraActivo());
  cb(modoGuerraActivo());
  const listener = (e: Event) => cb(Boolean((e as CustomEvent).detail?.activo));
  window.addEventListener(MG_EVENTO, listener);
  const storage = () => cb(modoGuerraActivo());
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(MG_EVENTO, listener);
    window.removeEventListener("storage", storage);
  };
}

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
