// ═══════════════════════════════════════════════════════════════════
// v405.10 · EL CONTEXTO — de dónde estás a qué herramientas necesitas
//
// Una sola función pura decide el espacio: `espacioDe(ruta, sala)`. No mira
// el historial, ni cookies, ni nada que no esté en la URL — porque la URL es
// el único sitio donde la casa puede confiar (y así el servidor y el cliente
// dicen siempre lo mismo, sin desajustes de hidratación).
//
// REGLA DE ORO: el prefijo más largo gana. /conflicto/<tag> es geo y
// /conflictos es geo; /teatro-3d es simulación aunque /teatro3d (sala) sea
// geografía. Si dos espacios declararan el mismo prefijo, las pruebas fallan.
// ═══════════════════════════════════════════════════════════════════

import { ESPACIOS, ESPACIO_POR_CLAVE, ESPACIO_POR_DEFECTO } from "./espacios";
import type { ClaveEspacio, Contexto, Espacio, Herramienta } from "./tipos";

/** Parte una URL de la casa en ruta limpia + sala del cuartel (?sala=). */
export function partirRuta(entrada: string | null | undefined): { ruta: string; sala: string | null } {
  const bruto = (entrada ?? "/").split("#")[0];
  const [camino, consulta = ""] = bruto.split("?");
  // sin barra final (excepto la portada) y en minúsculas para comparar
  let ruta = camino.replace(/\/+$/, "").toLowerCase();
  if (ruta === "") ruta = "/";
  if (ruta === "/index") ruta = "/";
  let sala: string | null = null;
  if (consulta) {
    const p = new URLSearchParams(consulta);
    sala = p.get("sala") ?? p.get("tab");
  }
  return { ruta, sala };
}

/** ¿La ruta encaja con el prefijo? "/mapas" encaja con "/mapas" y con "/mapas/x". */
function encaja(ruta: string, prefijo: string): boolean {
  if (prefijo === "") return ruta === "/";
  return ruta === prefijo || ruta.startsWith(prefijo + "/");
}

/**
 * El espacio de trabajo de una URL.
 * ① la sala activa del cuartel manda (es lo más específico que existe);
 * ② después, el prefijo de ruta MÁS LARGO;
 * ③ si nada encaja, lectura (la portada) o la casa (rutas internas).
 */
export function espacioDe(entrada: string | null | undefined): ClaveEspacio {
  const { ruta, sala } = partirRuta(entrada);
  // ① la sala del cuartel (?sala=<clave>) es lo más específico que existe
  if (sala) {
    const porSala = ESPACIOS.find((e) => e.detecta.salas.includes(sala));
    if (porSala) return porSala.clave;
  }
  // ② las puertas con nombre dentro de la URL llevan su espacio consigo:
  //    /sala/<clave>, /modulo/<id> y /constelacion/<clave> son la MISMA cosa
  //    que su sala o su módulo vistos desde fuera. Sin esto, una puerta abierta
  //    desde un enlace compartido perdería el contexto del que viene.
  const puertaSala = ruta.match(/^\/sala\/([a-z0-9-]+)$/);
  if (puertaSala) {
    const e = ESPACIOS.find((x) => x.detecta.salas.includes(puertaSala[1]));
    if (e) return e.clave;
  }
  const puertaModulo = ruta.match(/^\/modulo\/([a-z0-9-]+)$/);
  if (puertaModulo) {
    const e = ESPACIOS.find((x) => (x.detecta.modulos ?? []).includes(puertaModulo[1]));
    if (e) return e.clave;
  }
  const puertaConstelacion = ruta.match(/^\/constelacion\/([a-z0-9-]+)$/);
  if (puertaConstelacion) {
    const e = ESPACIOS.find((x) => (x.detecta.constelaciones ?? []).includes(puertaConstelacion[1]));
    if (e) return e.clave;
  }
  let mejor: { clave: ClaveEspacio; largo: number } | null = null;
  for (const e of ESPACIOS) {
    for (const prefijo of e.detecta.rutas) {
      if (!encaja(ruta, prefijo)) continue;
      const largo = prefijo.length;
      if (!mejor || largo > mejor.largo) mejor = { clave: e.clave, largo };
    }
  }
  if (mejor) return mejor.clave;
  return ESPACIO_POR_DEFECTO;
}

/** Espacios secundarios: los que también sirven en esta ruta, sin ser el actual. */
export function secundariosDe(entrada: string | null | undefined): ClaveEspacio[] {
  const { ruta } = partirRuta(entrada);
  const principal = espacioDe(entrada);
  const otros = ESPACIOS.filter(
    (e) => e.clave !== principal && e.detecta.rutas.some((p) => p !== "" && encaja(ruta, p)),
  ).map((e) => e.clave);
  // los vecinos declarados del espacio actual completan la lista, en su orden
  const vecinos = ESPACIO_POR_CLAVE[principal].vecinos.filter((v) => v !== principal);
  return Array.from(new Set([...otros, ...vecinos])).slice(0, 3);
}

/** ¿Esta herramienta es la que se está viendo ahora mismo? */
export function herramientaActiva(herramienta: Herramienta, entrada: string | null | undefined): boolean {
  const { ruta, sala } = partirRuta(entrada);
  const [hRuta, hConsulta = ""] = herramienta.href.split("?");
  const hSala = hConsulta ? new URLSearchParams(hConsulta).get("sala") : null;
  if (hSala) return ruta === "/cuartel" && sala === hSala;
  if (hRuta === "/") return ruta === "/" && !sala;
  return ruta === hRuta || ruta.startsWith(hRuta + "/");
}

/**
 * El contexto completo: espacio, vecinos y las herramientas YA filtradas por
 * la configuración del operador (si pasa una función de visibilidad).
 */
export function contextoDe(
  entrada: string | null | undefined,
  visibles?: (clave: ClaveEspacio, herramienta: Herramienta) => boolean,
): Contexto {
  const { ruta, sala } = partirRuta(entrada);
  const espacio = espacioDe(entrada);
  const def = ESPACIO_POR_CLAVE[espacio];
  const herramientas = visibles ? def.herramientas.filter((h) => visibles(espacio, h)) : def.herramientas;
  return { ruta, sala, espacio, secundarios: secundariosDe(entrada), herramientas };
}

/** Los espacios a los que se puede saltar desde aquí (transiciones). */
export function transicionesDe(clave: ClaveEspacio): Espacio[] {
  return ESPACIO_POR_CLAVE[clave].vecinos.map((v) => ESPACIO_POR_CLAVE[v]).filter(Boolean);
}

/**
 * Ranking contextual: sube lo que pertenece al espacio actual y a sus vecinos.
 * Se usa en el buscador ⌘K para que buscar «atlas» desde /mapas devuelva
 * primero el atlas, y buscar «atlas» desde /divisas no lo esconda.
 */
export function puntuarContexto(
  espacioDestino: ClaveEspacio | undefined,
  espacioActual: ClaveEspacio,
): number {
  if (!espacioDestino) return 0;
  if (espacioDestino === espacioActual) return 45;
  if (ESPACIO_POR_CLAVE[espacioActual]?.vecinos.includes(espacioDestino)) return 18;
  return 0;
}

/** Reordena una lista ya puntuada aplicando el bonus de contexto (estable). */
export function ordenarPorContexto<T extends { espacio?: ClaveEspacio; puntos: number }>(
  lista: T[],
  espacioActual: ClaveEspacio,
): T[] {
  return lista
    .map((x, i) => ({ x, i, total: x.puntos + puntuarContexto(x.espacio, espacioActual) }))
    .sort((a, b) => b.total - a.total || a.i - b.i)
    .map((v) => v.x);
}

/** Resumen para el HUD: nombre y lema del espacio, sin tocar el registro. */
export function rotuloDe(clave: ClaveEspacio): { nombre: string; lema: string; color: string } {
  const e = ESPACIO_POR_CLAVE[clave] ?? ESPACIO_POR_CLAVE[ESPACIO_POR_DEFECTO];
  return { nombre: e.nombre, lema: e.lema, color: e.color };
}
