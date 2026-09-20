// VANGUARD v26 — SEGURIDAD DE CONTENIDO SENSIBLE (18+)
// El usuario pidió: "la advertencia de sitio +18: que NO se vea ninguna foto
// censurada, así te ahorras todo ese tiempo". Este módulo implementa el
// MODO ESTRICTO: cuando está activo, ningún contenido marcado sensible se
// muestra NI SIQUIERA censurado — se reemplaza por un bloque "contenido oculto".
// Persistente en localStorage; funciona sin React (los paneles legacy pueden
// llamar a isStrict18() directamente) y vía useStrict18() en componentes.

const LS_STRICT = "vanguard_strict18";

export function isStrict18(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LS_STRICT) === "1";
  } catch {
    return false;
  }
}

export function setStrict18(v: boolean) {
  try {
    localStorage.setItem(LS_STRICT, v ? "1" : "0");
    window.dispatchEvent(new CustomEvent("vanguard:strict18", { detail: v }));
  } catch {
    /* noop */
  }
}

/** ¿Este item debe OCULTARSE por completo (modo estricto)? */
export function shouldHideSensitive(sensitive: boolean): boolean {
  return sensitive && isStrict18();
}

// ---- suscripción ligera estilo hook (sin dependencias) ----
type Listener = (v: boolean) => void;
const listeners = new Set<Listener>();
if (typeof window !== "undefined") {
  window.addEventListener("vanguard:strict18", (e) => {
    const v = (e as CustomEvent).detail === true;
    listeners.forEach((l) => l(v));
  });
}

export function subscribeStrict18(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
