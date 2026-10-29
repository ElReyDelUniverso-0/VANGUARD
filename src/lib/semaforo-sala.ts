// v198.0 EL SEMÁFORO DE SALA — mandato del Dueño («optimisa 100 de vanguard,
// no elimines nada importante... cuando uno entre no esté todo lo sitios
// cargado, si no cargue cuando uno entre. Ej: si estoy en el módulo de
// archivos secretos es innecesario que el módulo de noticias esté cargando»).
//
// LA IDEA: la Casa entera comparte un solo cielo, pero cada sala bebe SU
// propia agua. Este semáforo sabe SIEMPRE en qué sala está el visitante y
// si la casa está a la vista; los latidos de datos (noticias del HUD, el
// Centinela de Impacto, el editor de agentes...) lo consultan antes de
// disparar red. En una sala que no muestra noticias, la red de noticias
// DUERME; al volver a INICIO/NOTICIAS/CENTRO..., despierta al instante.
//
// Nada se elimina: los cables del HUD siguen rotando con el agua ya
// recogida, el Centinela sigue velando (con respiración más lenta fuera
// de las salas de noticias) y el pozo único (v197) sigue siendo la fuente.
// Solo deja de viajar bytes que nadie está mirando.

type Oyente = () => void;

// Las salas donde los cables son PROTAGONISTAS (el usuario las abrió para
// leer el mundo). Fuera de ellas, la red de noticias baja la persiana.
const SALAS_NOTICIAS = new Set<string>([
  "inicio",       // portada: ÚLTIMA HORA es el héroe
  "noticias",     // sala de noticias
  "centro",       // la agencia central de noticias
  "briefing",     // el briefing diario abre con cables
  "canalbrief",   // canal de briefings
  "redaccion",    // la redacción de la casa
  "fichas",       // fichas de guerra (beben del balde CENTRO)
  "salaguerra",   // sala de guerra: teatros y cables en vivo
  "guerra-hoy",   // GUERRA HOY (balde centro)
  "camaras",      // cámaras del mundo con cables laterales
]);

let salaActual = "inicio";
let visible = true;
const oyentes = new Set<Oyente>();

if (typeof window !== "undefined") {
  // Sala activa: page.tsx dispara vanguard:sala en CADA cambio de sala
  // (handleTabChange es la única puerta de navegación de la Casa);
  // vanguard:navigate queda como cinturón para navegaciones tempranas.
  window.addEventListener("vanguard:sala", ((e: CustomEvent<string>) => {
    if (typeof e.detail === "string" && e.detail && e.detail !== salaActual) {
      salaActual = e.detail;
      avisar();
    }
  }) as EventListener);
  window.addEventListener("vanguard:navigate", ((e: CustomEvent<string>) => {
    if (typeof e.detail === "string" && e.detail && e.detail !== salaActual) {
      salaActual = e.detail;
      avisar();
    }
  }) as EventListener);
  visible = document.visibilityState === "visible";
  document.addEventListener("visibilitychange", () => {
    const v = document.visibilityState === "visible";
    if (v !== visible) {
      visible = v;
      avisar();
    }
  });
}

function avisar() {
  for (const fn of oyentes) {
    try { fn(); } catch { /* un oyente dormido no tumba el semáforo */ }
  }
}

/** La sala donde el visitante está AHORA MISMO (clave de tab). */
export function salaActiva(): string {
  return salaActual;
}

/** ¿La sala activa es una que MUESTRA cables/noticias? */
export function esSalaNoticias(k = salaActual): boolean {
  return SALAS_NOTICIAS.has(k);
}

/** ¿La casa está a la vista? (pestaña oculta = todo descansa) */
export function casaVisible(): boolean {
  return visible;
}

/**
 * Se suscribe a cambios de sala / visibilidad. Devuelve la baja.
 * El callback dispara también INMEDIATAMENTE al suscribirse (patrón
 * "despierta y mira": el que llega tarde refresca sin esperar al ciclo).
 */
export function onSalaCambia(fn: Oyente): () => void {
  oyentes.add(fn);
  return () => { oyentes.delete(fn); };
}
