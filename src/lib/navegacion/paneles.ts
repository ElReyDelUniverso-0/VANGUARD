// ═══════════════════════════════════════════════════════════════════
// v405.10 · LOS PANELES CONFIGURABLES — el operador manda en su muelle
//
// Cada espacio trae sus herramientas en un orden pensado. Pero el operador
// que pasa el día en /mapas quiere el buscador de países arriba y el archivo
// abajo; el que simula quiere el teatro primero. Eso se guarda POR ESPACIO,
// en el aparato del operador y en ningún sitio más.
//
// Reglas:
//  · La configuración guardada NUNCA borra herramientas: solo las ordena y
//    las esconde. Si una herramienta nueva entra en el registro, aparece sola
//    al final de su espacio aunque la configuración sea vieja.
//  · Los ids desconocidos se descartan al leer: si una herramienta se retira
//    algún día, la configuración vieja no rompe nada.
//  · Todo esto son funciones puras salvo las dos de almacenamiento, que
//    fallan en silencio (localStorage puede no existir).
// ═══════════════════════════════════════════════════════════════════

import { CLAVES_ESPACIO, ESPACIO_POR_CLAVE } from "./espacios";
import type { ClaveEspacio, Herramienta } from "./tipos";

export const CLAVE_ALMACEN = "vx405.10-navegacion";

export type AjusteEspacio = {
  /** ids de herramienta, en el orden que quiere el operador */
  orden: string[];
  /** ids escondidos (siguen existiendo: se pueden volver a encender) */
  ocultas: string[];
};

export type ConfigPaneles = {
  version: 1;
  /** densidad del muelle: compacta enseña iconos, normal enseña nombre */
  densidad: "compacta" | "normal";
  /** el muelle arranca plegado si el operador lo dejó así */
  plegado: boolean;
  espacios: Record<string, AjusteEspacio>;
};

/** La configuración de fábrica: el orden declarado en el registro. */
export function panelesPorDefecto(): ConfigPaneles {
  const espacios: Record<string, AjusteEspacio> = {};
  for (const clave of CLAVES_ESPACIO) {
    espacios[clave] = {
      orden: ESPACIO_POR_CLAVE[clave].herramientas.map((h) => h.id),
      ocultas: [],
    };
  }
  return { version: 1, densidad: "normal", plegado: false, espacios };
}

/** El ajuste de un espacio, completado con lo que falte del registro. */
export function ajusteDe(config: ConfigPaneles, clave: ClaveEspacio): AjusteEspacio {
  const registro = ESPACIO_POR_CLAVE[clave]?.herramientas.map((h) => h.id) ?? [];
  const guardado = config.espacios?.[clave];
  const ordenGuardado = (guardado?.orden ?? []).filter((id) => registro.includes(id));
  const nuevas = registro.filter((id) => !ordenGuardado.includes(id));
  const ocultas = (guardado?.ocultas ?? []).filter((id) => registro.includes(id));
  return { orden: [...ordenGuardado, ...nuevas], ocultas };
}

/** Las herramientas visibles de un espacio, en el orden del operador. */
export function herramientasVisibles(config: ConfigPaneles, clave: ClaveEspacio): Herramienta[] {
  const { orden, ocultas } = ajusteDe(config, clave);
  const porId = new Map(ESPACIO_POR_CLAVE[clave]?.herramientas.map((h) => [h.id, h]) ?? []);
  return orden.filter((id) => !ocultas.includes(id)).map((id) => porId.get(id)).filter((h): h is Herramienta => !!h);
}

/** Todas las de un espacio, visibles u ocultas (para la hoja de ajustes). */
export function herramientasTodas(config: ConfigPaneles, clave: ClaveEspacio): Herramienta[] {
  const { orden } = ajusteDe(config, clave);
  const porId = new Map(ESPACIO_POR_CLAVE[clave]?.herramientas.map((h) => [h.id, h]) ?? []);
  return orden.map((id) => porId.get(id)).filter((h): h is Herramienta => !!h);
}

export function estaOculta(config: ConfigPaneles, clave: ClaveEspacio, id: string): boolean {
  return ajusteDe(config, clave).ocultas.includes(id);
}

/** Enciende o apaga una herramienta (nunca la borra). */
export function alternar(config: ConfigPaneles, clave: ClaveEspacio, id: string): ConfigPaneles {
  const a = ajusteDe(config, clave);
  const ocultas = a.ocultas.includes(id) ? a.ocultas.filter((x) => x !== id) : [...a.ocultas, id];
  return { ...config, espacios: { ...config.espacios, [clave]: { orden: a.orden, ocultas } } };
}

/** Mueve una herramienta una posición arriba (-1) o abajo (+1). */
export function mover(config: ConfigPaneles, clave: ClaveEspacio, id: string, direccion: -1 | 1): ConfigPaneles {
  const a = ajusteDe(config, clave);
  const i = a.orden.indexOf(id);
  if (i < 0) return config;
  const j = i + direccion;
  if (j < 0 || j >= a.orden.length) return config;
  const orden = [...a.orden];
  [orden[i], orden[j]] = [orden[j], orden[i]];
  return { ...config, espacios: { ...config.espacios, [clave]: { orden, ocultas: a.ocultas } } };
}

/** Vuelve al orden declarado de un espacio (o de todos). */
export function resetear(config: ConfigPaneles, clave?: ClaveEspacio): ConfigPaneles {
  const base = panelesPorDefecto();
  if (!clave) return { ...base, densidad: config.densidad, plegado: config.plegado };
  return {
    ...config,
    espacios: { ...config.espacios, [clave]: base.espacios[clave] },
  };
}

export function cambiarDensidad(config: ConfigPaneles): ConfigPaneles {
  return { ...config, densidad: config.densidad === "compacta" ? "normal" : "compacta" };
}

export function cambiarPlegado(config: ConfigPaneles): ConfigPaneles {
  return { ...config, plegado: !config.plegado };
}

/**
 * Valida una configuración venida de fuera (localStorage, JSON, un test):
 * devuelve una configuración SANA, con los espacios y claves que existen.
 */
export function sanear(bruto: unknown): ConfigPaneles {
  const base = panelesPorDefecto();
  if (!bruto || typeof bruto !== "object") return base;
  const b = bruto as Partial<ConfigPaneles>;
  const espacios: Record<string, AjusteEspacio> = {};
  for (const clave of CLAVES_ESPACIO) {
    const registro = ESPACIO_POR_CLAVE[clave].herramientas.map((h) => h.id);
    const guardado = (b.espacios ?? {})[clave] as Partial<AjusteEspacio> | undefined;
    const orden = Array.isArray(guardado?.orden) ? guardado!.orden!.filter((id) => registro.includes(id)) : [];
    const ocultas = Array.isArray(guardado?.ocultas) ? guardado!.ocultas!.filter((id) => registro.includes(id)) : [];
    espacios[clave] = {
      orden: [...orden, ...registro.filter((id) => !orden.includes(id))],
      ocultas,
    };
  }
  return {
    version: 1,
    densidad: b.densidad === "compacta" ? "compacta" : "normal",
    plegado: typeof b.plegado === "boolean" ? b.plegado : false,
    espacios,
  };
}

// ───────────── almacenamiento (silencioso: si no hay, no pasa nada) ─────────

export function leerPaneles(): ConfigPaneles {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(CLAVE_ALMACEN) : null;
    if (!raw) return panelesPorDefecto();
    return sanear(JSON.parse(raw));
  } catch {
    return panelesPorDefecto();
  }
}

export function guardarPaneles(config: ConfigPaneles): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent("vanguard:paneles", { detail: config }));
  } catch {
    /* la configuración es una comodidad: si falla, el registro manda */
  }
}
