// ═══════════════════════════════════════════════════════════════════════════
// v432.2 · LOS AJUSTES DEL ORBE — todo lo de ella se puede tocar
//
// Orden del Dueño: «que uno pueda editar todo sobre ella… y que uno pueda mover
// su lugar». Aquí vive el estado de esa personalización, en un solo sitio, para
// que el orbe, el panel y cualquier sala lean lo mismo.
//
// REGLAS DE LA CASA QUE CUMPLE:
//   · Puro: no toca window al importarse (solo dentro de las funciones), así el
//     servidor puede importarlo sin romper.
//   · Se guarda en el aparato del operador (`vg:mente:orbe:v1`), como todo lo
//     suyo. Nada viaja a ningún servidor.
//   · Todo valor que llega de fuera se acota (`freno`) antes de usarse: un
//     localStorage manipulado no puede dejar el orbe gigante ni invisible.
// ═══════════════════════════════════════════════════════════════════════════

// v432.4 · UNA SOLA VOZ — aquí ya NO hay «modo voz». El orbe no tiene voz
// propia: habla con la boca de la casa (lib/voz/decir) y con los gustos que el
// operador ya ajustó en /voz y en la radio. Había tres modos (estudio, aparato,
// callada) y cuatro personas: dos maneras de configurar la MISMA voz, y el
// Dueño pidió una: «elimina el modo voz, solo hay uno».

export type AjustesOrbe = {
  /** si se apaga, el orbe no se pinta (el panel sigue en ⌘J) */
  visible: boolean;
  /** null = abajo en el centro; si hay x/y, vive donde lo dejó el operador */
  x: number | null;
  y: number | null;
  /** diámetro en píxeles */
  tamano: number;
  /** opacidad en reposo (0.3 – 1) */
  opacidad: number;
  /** se aparta mientras se hace scroll, para no tapar lo que se lee */
  autoOcultar: boolean;
  /** 1 = se esconde y deja solo un punto hasta que se toca */
  discreto: boolean;
  /** chips de sugerencias encima */
  chips: boolean;
  /** idioma del reconocimiento */
  idioma: "es-ES" | "es-419" | "es-MX";
  /** la casa te lleva sola cuando la orden es directa («llévame…») */
  dirigirSolo: boolean;
};

export const CLAVE_AJUSTES = "vg:mente:orbe:v1";

export const AJUSTES_DEFECTO: AjustesOrbe = {
  visible: true,
  x: null,
  y: null,
  tamano: 62,
  opacidad: 0.94,
  autoOcultar: true,
  discreto: false,
  chips: true,
  idioma: "es-ES",
  dirigirSolo: true,
};

function freno(valor: number, min: number, max: number, defecto: number): number {
  if (!Number.isFinite(valor)) return defecto;
  return Math.min(max, Math.max(min, valor));
}

/** Limpia cualquier cosa que venga del almacén y devuelve ajustes usables. */
export function sanear(crudo: unknown): AjustesOrbe {
  const j = (crudo ?? {}) as Partial<Record<keyof AjustesOrbe, unknown>>;
  const idiomas: AjustesOrbe["idioma"][] = ["es-ES", "es-419", "es-MX"];
  return {
    visible: j.visible !== false,
    x: typeof j.x === "number" && Number.isFinite(j.x) ? Math.round(j.x) : null,
    y: typeof j.y === "number" && Number.isFinite(j.y) ? Math.round(j.y) : null,
    tamano: Math.round(freno(Number(j.tamano), 40, 96, AJUSTES_DEFECTO.tamano)),
    opacidad: freno(Number(j.opacidad), 0.3, 1, AJUSTES_DEFECTO.opacidad),
    autoOcultar: j.autoOcultar !== false,
    discreto: j.discreto === true,
    chips: j.chips !== false,
    idioma: idiomas.includes(j.idioma as AjustesOrbe["idioma"]) ? (j.idioma as AjustesOrbe["idioma"]) : "es-ES",
    dirigirSolo: j.dirigirSolo !== false,
  };
}

export function leerAjustes(): AjustesOrbe {
  if (typeof window === "undefined") return { ...AJUSTES_DEFECTO };
  try {
    const bruto = window.localStorage.getItem(CLAVE_AJUSTES);
    return sanear(bruto ? (JSON.parse(bruto) as unknown) : {});
  } catch {
    return { ...AJUSTES_DEFECTO };
  }
}

export function guardarAjustes(a: AjustesOrbe): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(a));
    window.dispatchEvent(new CustomEvent("vg:orbe:ajustes", { detail: a }));
  } catch {
    /* modo privado: los ajustes viven en memoria */
  }
}

/** ¿Este elemento es algo que el operador puede pulsar? (para no taparlo) */
export function esInteractivo(el: Element | null): boolean {
  if (!el) return false;
  const interactivo = "a,button,input,select,textarea,summary,[role='button'],[role='link'],[role='tab']";
  return el.matches(interactivo) || el.closest(interactivo) !== null;
}
