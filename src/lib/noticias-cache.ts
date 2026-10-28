// v196.0 EL POZO ÚNICO — toda la casa bebe del mismo agua.
//
// AUTOPSIA v196: la primera visita disparaba /api/news OCHO veces en los
// primeros 40 segundos (news-strip al montar, hud-header con su intervalo de
// 180s, home-panel al montar + cada 60s, teletipo-vivo con su promesa global,
// y cada panel que abre su sala) — 60KB por llamada = ~480KB de datos
// repetidos quemados en móvil mientras el usuario apenas miraba la portada.
//
// LA CURA: un pozo compartido en memoria con:
//  · TTL de 45s — dentro de la ventana, todos resuelven del mismo dato al
//    instante (cero red).
//  · Vuelo compartido — si dos componentes piden a la vez, UNA sola petición
//    viaja y los dos beben de la misma promesa (se acabó la tormenta de
//    reintentos en señal débil: el fallo también se comparte).
//  · La API jamás cambia: sigue sirviendo { items: [...] } — el pozo solo
//    recuerda la última respuesta y la reparte.
//
// Leyes intactas: NADA se recarga solo (v190) — el pozo no fuerza recargas
// ni timers nuevos; cada componente conserva su propio ritmo de refresco,
// solo que ahora el agua es la misma para todos.

type NoticiasRespuesta = { items?: unknown[]; error?: string; pulso?: unknown };

type Balde = { resp: NoticiasRespuesta; ts: number } | null;
type Pozo = { todo: Balde; centro: Balde; vueloTodo: Promise<unknown[]> | null; vueloCentro: Promise<unknown[]> | null };

// v196.1: el pozo vive en globalThis — Turbopack puede duplicar el módulo en
// varios chunks y cada copia traería SU propia caché (3 llamadas en vez de 1).
// En el window no hay duplicado posible: toda la casa bebe del mismo pozo.
// Dos baldes: el agua GENERAL y el agua del CENTRO (?modo=centro — la que
// beben el Centinela de Impacto, las fichas y la sala GUERRA HOY).
const G = globalThis as typeof globalThis & { __vgPozoNoticias?: Pozo };
const pozo: Pozo = (G.__vgPozoNoticias ??= { todo: null, centro: null, vueloTodo: null, vueloCentro: null });

const TTL_MS = 45_000;

function urlDe(clave: "todo" | "centro"): string {
  return clave === "centro" ? "/api/news?modo=centro" : "/api/news";
}

function pedir(clave: "todo" | "centro"): Promise<unknown[]> {
  return fetch(urlDe(clave), { cache: "no-store" })
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<NoticiasRespuesta>;
    })
    .then((j) => {
      pozo[clave] = { resp: j, ts: Date.now() };
      return Array.isArray(j?.items) ? j.items : [];
    })
    .finally(() => {
      if (clave === "centro") pozo.vueloCentro = null; else pozo.vueloTodo = null;
    });
}

/**
 * Pide las noticias de la casa por el pozo.
 * @param fuerza  refresca el pozo aunque el agua esté fresca (lo usan los
 *                refrescos maestros, p.ej. el latido de 60s de la portada).
 * @param clave   "todo" (agua general) o "centro" (modo=centro).
 */
export async function pedirNoticias(fuerza = false, clave: "todo" | "centro" = "todo"): Promise<unknown[]> {
  const agua = pozo[clave];
  const vuelo = clave === "centro" ? pozo.vueloCentro : pozo.vueloTodo;
  if (!fuerza && agua && Date.now() - agua.ts < TTL_MS) return Array.isArray(agua.resp.items) ? agua.resp.items : [];
  if (vuelo) return vuelo;
  const nuevo = pedir(clave);
  if (clave === "centro") pozo.vueloCentro = nuevo; else pozo.vueloTodo = nuevo;
  return nuevo;
}

/** Agua fresca del pozo (o null si nunca ha llovido). */
export function noticiasEnCache(clave: "todo" | "centro" = "todo"): unknown[] | null {
  const agua = pozo[clave];
  const items = agua ? agua.resp.items : null;
  return Array.isArray(items) ? items : null;
}

/** El pulso de la Agencia (viaja en la respuesta del balde CENTRO). */
export function pulsoCentro(): unknown {
  return pozo.centro?.resp?.pulso ?? null;
}
