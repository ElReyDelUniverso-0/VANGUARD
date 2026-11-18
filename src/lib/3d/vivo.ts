"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.15 · EL DIRECTOR DE ESCENAS — el 3D no quema lo que nadie mira
//
// EL DEFECTO, MEDIDO (no supuesto): con la pestaña abierta y las manos
// quietas, la casa gastaba entre el 20% y el 107% de un núcleo por ruta 3D
// (/teatro-3d 107%, /mapas 71%, /cuartel 67% —siete lienzos a la vez—,
// /zona-cero 22%, /mundo 21%). Medido con `Performance.getMetrics()`
// (TaskDuration) durante 4 s de reposo, en producción. Nada de eso lo veía
// el usuario como «error»: lo sentía como lag, ventilador y batería.
//
// LA REGLA QUE IMPONE ESTE MÓDULO, en una frase: **ninguna escena pinta si
// no se ve, y ninguna pinta a 60 fps si nadie la está tocando**.
//   ① VISIBILIDAD: IntersectionObserver sobre el lienzo (con margen para que
//      arranque justo antes de entrar en pantalla) + `visibilitychange`.
//   ② REPOSO: sin puntero, rueda, teclado ni scroll durante `reposoSeg`, la
//      escena baja a `fpsReposo` (20 por defecto). El primer gesto la
//      devuelve a 60. Se nota el movimiento, no el gasto.
//   ③ PRESUPUESTO POR APARATO: núcleos, memoria y densidad de píxeles del
//      aparato deciden el DPR, las sombras y el antialias. Un móvil con DPR 3
//      no tiene por qué rasterizar 9× los píxeles de la misma escena.
//   ④ MOVIMIENTO REDUCIDO: si el sistema pide `prefers-reduced-motion`, la
//      escena se queda en reposo permanente (la casa ya lo respeta en unos
//      sitios; aquí se cumple en todos de una vez).
//
// NO dibuja nada: no importa `three`, no toca el DOM más que para observar.
// Cualquier motor de la casa puede usarlo sin arrastrar la librería 3D.
// ═══════════════════════════════════════════════════════════════════

export type ClaseEquipo = "alto" | "medio" | "bajo";

export interface Presupuesto3D {
  /** clase del aparato, deducida de sus tripas (no del user-agent) */
  clase: ClaseEquipo;
  /** densidad de píxeles que se permite (nunca por encima del aparato) */
  dpr: number;
  /** ¿puede permitirse sombras suaves? */
  sombras: boolean;
  /** ¿puede permitirse antialias del navegador? (con DPR alto no hace falta) */
  antialias: boolean;
  fpsActivo: number;
  fpsReposo: number;
  /** el sistema pidió reducir movimiento */
  reducirMovimiento: boolean;
  /** true si el aparato es táctil grueso (móvil/tableta) */
  tactil: boolean;
}

let cache: Presupuesto3D | null = null;

/** El presupuesto del aparato. Se calcula una vez por proceso. */
export function presupuesto3D(): Presupuesto3D {
  if (cache) return cache;
  if (typeof window === "undefined") {
    cache = {
      clase: "medio",
      dpr: 1,
      sombras: false,
      antialias: false,
      fpsActivo: 60,
      fpsReposo: 20,
      reducirMovimiento: false,
      tactil: false,
    };
    return cache;
  }
  const nav = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number };
  const nucleos = nav.hardwareConcurrency ?? 4;
  const memoria = nav.deviceMemory ?? 4; // GB, solo en Chromium
  const dprAparato = window.devicePixelRatio || 1;
  const tactil = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const reducirMovimiento = hayReducirMovimiento();

  // La clase NO se deduce del ancho de pantalla (un portátil pequeño es
  // potente y un móvil caro también): se deduce de lo que el aparato declara.
  let clase: ClaseEquipo = "alto";
  if (nucleos <= 4 || memoria <= 3) clase = "bajo";
  else if (nucleos <= 6 || memoria <= 4 || (tactil && dprAparato >= 2.5)) clase = "medio";

  const dpr = Math.min(dprAparato, clase === "alto" ? 2 : clase === "medio" ? 1.5 : 1.25);
  cache = {
    clase,
    dpr,
    sombras: clase === "alto" && !tactil,
    antialias: clase === "alto" && dpr < 1.5,
    fpsActivo: 60,
    fpsReposo: clase === "bajo" ? 12 : 20,
    reducirMovimiento,
    tactil,
  };
  return cache;
}

export function hayReducirMovimiento(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// ── el pulso global de la interacción (UN juego de listeners para toda la casa) ──
let ultimoGesto = 0;
let gestosPuestos = false;
function ponerGestos() {
  if (gestosPuestos || typeof window === "undefined") return;
  gestosPuestos = true;
  const marcar = () => {
    ultimoGesto = performance.now();
  };
  const opciones: AddEventListenerOptions = { passive: true };
  window.addEventListener("pointerdown", marcar, opciones);
  window.addEventListener("pointermove", marcar, opciones);
  window.addEventListener("wheel", marcar, opciones);
  window.addEventListener("touchstart", marcar, opciones);
  window.addEventListener("keydown", marcar, opciones);
  window.addEventListener("scroll", marcar, opciones);
}

/** ¿hace cuánto que nadie toca nada? (ms) */
export function quietud(): number {
  if (!ultimoGesto) return Number.POSITIVE_INFINITY;
  return performance.now() - ultimoGesto;
}

// ── cuántas escenas están vivas ahora mismo (diagnóstico y tope) ──
const vivas = new Set<EscenaViva>();
export function escenasVivas(): number {
  return vivas.size;
}

export interface OpcionesEscena {
  /** margen del observador: la escena despierta antes de entrar en pantalla */
  margen?: string;
  /** segundos sin gestos antes de bajar a fpsReposo */
  reposoSeg?: number;
  /** fotogramas por segundo en reposo (0 = congelar del todo) */
  fpsReposo?: number;
  /** la escena sigue pintando aunque esté fuera de pantalla (casi nunca) */
  siempreViva?: boolean;
}

/**
 * Una escena 3D que sabe cuándo debe pintar. Los motores de la casa piden
 * `programar(cb)` en vez de `requestAnimationFrame(cb)` y preguntan `pintar()`
 * antes de tocar la GPU; todo lo demás (visibilidad, pestaña oculta, reposo,
 * movimiento reducido) lo resuelve este objeto.
 */
export class EscenaViva {
  private el: HTMLElement;
  private opciones: Required<OpcionesEscena>;
  private visible = true;
  private pendiente: (() => void) | null = null;
  private temporizador = 0;
  private io: IntersectionObserver | null = null;
  private parada = false;
  private alCambiarVisibilidad: () => void;
  private presupuesto: Presupuesto3D;

  constructor(el: HTMLElement, opciones: OpcionesEscena = {}) {
    ponerGestos();
    this.el = el;
    this.presupuesto = presupuesto3D();
    this.opciones = {
      margen: opciones.margen ?? "160px",
      reposoSeg: opciones.reposoSeg ?? 2.5,
      fpsReposo: opciones.fpsReposo ?? this.presupuesto.fpsReposo,
      siempreViva: opciones.siempreViva ?? false,
    };
    // v405.15: la visibilidad de salida se MIDE (getBoundingClientRect), no se
    // supone. Antes se asumía «visible» y, en páginas lentas —donde el aviso del
    // IntersectionObserver puede tardar segundos en entregarse—, una escena que
    // nacía fuera de pantalla seguía pintando mientras esperaba.
    if (!this.opciones.siempreViva) {
      try {
        const r = el.getBoundingClientRect();
        const margen = 160;
        this.visible = r.bottom > -margen && r.top < (window.innerHeight || 0) + margen && r.width > 0 && r.height > 0;
      } catch {
        this.visible = true;
      }
    }
    if (typeof IntersectionObserver !== "undefined" && !this.opciones.siempreViva) {
      this.io = new IntersectionObserver(
        (entradas) => {
          const dentro = entradas.some((e) => e.isIntersecting);
          if (dentro === this.visible) return;
          this.visible = dentro;
          this.despertar();
        },
        { rootMargin: this.opciones.margen, threshold: 0 }
      );
      this.io.observe(el);
    }
    this.alCambiarVisibilidad = () => this.despertar();
    document.addEventListener("visibilitychange", this.alCambiarVisibilidad);
    vivas.add(this);
  }

  get dpr(): number {
    return this.presupuesto.dpr;
  }

  get presupuestoDeEquipo(): Presupuesto3D {
    return this.presupuesto;
  }

  get seVe(): boolean {
    return this.visible;
  }

  /** ¿toca pintar este cuadro? (y, de paso, marca actividad) */
  pintar(): boolean {
    if (this.parada) return false;
    if (typeof document !== "undefined" && document.hidden) return false;
    if (!this.visible) return false;
    return !this.presupuesto.reducirMovimiento || quietud() < this.opciones.reposoSeg * 1000;
  }

  /** true cuando la escena está visible pero nadie la toca: se pinta despacio */
  enReposo(): boolean {
    return quietud() > this.opciones.reposoSeg * 1000;
  }

  /**
   * Pide el siguiente cuadro. Devuelve `false` si la escena quedó dormida
   * (fuera de pantalla o pestaña oculta): el motor debe entonces NO pintar y
   * esperar a que el director lo despierte.
   */
  programar(cb: () => void): boolean {
    if (this.parada) return false;
    if (typeof document !== "undefined" && document.hidden) {
      this.pendiente = cb;
      return false;
    }
    if (!this.visible) {
      this.pendiente = cb;
      return false;
    }
    if (this.opciones.fpsReposo > 0 && this.enReposo()) {
      this.temporizador = window.setTimeout(() => {
        this.temporizador = 0;
        if (!this.parada) cb();
      }, 1000 / this.opciones.fpsReposo);
      return true;
    }
    requestAnimationFrame(cb);
    return true;
  }

  /** fin de la escena: suelta observador, temporizador y listeners */
  parar(): void {
    this.parada = true;
    this.io?.disconnect();
    this.io = null;
    document.removeEventListener("visibilitychange", this.alCambiarVisibilidad);
    if (this.temporizador) window.clearTimeout(this.temporizador);
    this.temporizador = 0;
    this.pendiente = null;
    vivas.delete(this);
  }

  private despertar() {
    if (this.parada) return;
    if (this.temporizador) {
      window.clearTimeout(this.temporizador);
      this.temporizador = 0;
    }
    const cb = this.pendiente;
    if (!cb) return;
    if (typeof document !== "undefined" && document.hidden) return;
    if (!this.visible) return;
    this.pendiente = null;
    requestAnimationFrame(cb);
  }
}

/** Atajo: crea la escena y devuelve null si no hay elemento (SSR). */
export function escenaViva(el: HTMLElement | null, opciones: OpcionesEscena = {}): EscenaViva | null {
  if (!el) return null;
  return new EscenaViva(el, opciones);
}
