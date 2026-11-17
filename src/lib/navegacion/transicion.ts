// ═══════════════════════════════════════════════════════════════════
// v405.10 · LAS TRANSICIONES — un solo movimiento, no un parpadeo
//
// La casa prohíbe recargar para navegar. Aquí se centraliza la única forma de
// cambiar de sitio en la navegación adaptativa:
//  ① si el navegador soporta View Transitions, el cambio de página ocurre
//     DENTRO de la transición (una sola animación, sin destello blanco);
//  ② si no, se navega igual y un aviso ligero (data-viajando) marca el viaje
//     durante 400 ms para que la barra no parezca congelada;
//  ③ nunca se lanza si la URL es la misma (evita history duplicado).
// Todo con guardas: esto también corre en el servidor durante el render.
// ═══════════════════════════════════════════════════════════════════

type RouterLike = { push: (href: string) => void };

type DocumentoConTransiciones = Document & {
  startViewTransition?: (cb: () => void) => unknown;
};

/** ¿Es la misma página? Compara ruta + consulta, sin barra final. */
export function esMismaPagina(actual: string | null | undefined, destino: string): boolean {
  const limpiar = (u: string) => u.replace(/\/+$/, "") || "/";
  return limpiar((actual ?? "/").split("#")[0]) === limpiar(destino.split("#")[0]);
}

export function navegarConTransicion(router: RouterLike, href: string, actual?: string | null): void {
  if (esMismaPagina(actual, href)) return;
  if (typeof document === "undefined") {
    router.push(href);
    return;
  }
  const doc = document as DocumentoConTransiciones;
  const raiz = document.documentElement;
  raiz.setAttribute("data-viajando", "1");
  const limpiar = () => window.setTimeout(() => raiz.removeAttribute("data-viajando"), 420);
  // Una sola vez por clic, pase lo que pase.
  let hecho = false;
  const empujar = () => {
    if (hecho) return;
    hecho = true;
    router.push(href);
  };

  // La View Transition API NO ejecuta su callback si la pestaña está oculta ni
  // si ya hay otra transición en curso. Se usa solo con la página visible y se
  // deja una red de seguridad: perder una navegación es mucho peor que perder
  // el adorno de la transición.
  const visible = document.visibilityState !== "hidden";
  try {
    if (visible && typeof doc.startViewTransition === "function") {
      doc.startViewTransition(empujar);
      window.setTimeout(empujar, 180);
      limpiar();
      return;
    }
  } catch {
    /* si la transición falla, se navega igual: la casa no se queda quieta */
  }
  empujar();
  limpiar();
}
