// ============================================================
// v415.0 · VANGUARD SEARCH OPPORTUNITIES — el servicio (SOLO SERVIDOR)
//
// Une las tres piezas: el cliente de Search Console (cliente.ts), las páginas
// reales de la casa (el directorio de la v407.1 + las fichas de país del nexo)
// y el análisis puro (analisis.ts). Además hace comprobaciones PÚBLICAS de la
// casa que no necesitan credenciales (meta de verificación, sitemap, robots),
// para que el panel diga algo verdadero incluso antes de conectar Google.
// ============================================================

import { memo } from "@/lib/sistema/cache";
import { SITE_URL, CASA_OFICIAL } from "@/lib/site";
import { destinos } from "@/lib/planeta/directorio";
import { paisDeTexto } from "@/lib/nucleo/nexo";
import { analizar, rutaDeUrl } from "./analisis";
import {
  configuracion,
  listarSitios,
  periodo,
  totalesDelSitio,
  filasConsultaPagina,
  filasPorPagina,
  tokenDeAcceso,
  ErrorGoogle,
  type Periodo,
} from "./cliente";
import type { InformeOportunidades, PaginaCasa, Totales } from "./tipos";

export const DIAS_PERMITIDOS = [7, 28, 90] as const;
export type Dias = (typeof DIAS_PERMITIDOS)[number];

/** Meta de verificación declarada en src/app/layout.tsx (v54.1). */
export const META_VERIFICACION = "0ZwaEFYOrfzU-l1mpA9H5Ze-j8fgNUFhBjdkYBKvuZ4";

// ── las páginas reales de la casa ───────────────────────────────

let PAGINAS: PaginaCasa[] | null = null;

export function paginasDeLaCasa(): PaginaCasa[] {
  if (PAGINAS) return PAGINAS;
  PAGINAS = destinos()
    .filter((d) => d.permiso === "publico" && !d.ruta.includes("?"))
    .map((d) => ({
      ruta: d.ruta,
      nombre: d.nombre,
      categoria: d.modulo,
      buscar: `${d.descripcion} ${d.buscar}`,
      importante: d.nivel === "centro" && !d.interno && d.estado !== "PLAN",
    }));
  if (!PAGINAS.some((p) => p.ruta === "/")) {
    PAGINAS.push({ ruta: "/", nombre: "Portada", categoria: "Portada", buscar: "portada inicio vanguard conflictos mundiales tiempo real", importante: true });
  }
  return PAGINAS;
}

/** Un país en la consulta → su ficha real /mundos/<iso>. */
export function fichaDePais(consulta: string): { ruta: string; nombre: string } | null {
  const p = paisDeTexto(consulta);
  return p ? { ruta: `/mundos/${p.iso2}`, nombre: `Ficha de ${p.nombre}` } : null;
}

// ── comprobaciones públicas (sin credenciales) ──────────────────

export interface Comprobacion {
  id: string;
  nombre: string;
  ok: boolean | null;
  detalle: string;
}

async function traer(url: string): Promise<{ estado: number; texto: string } | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8_000), cache: "no-store", headers: { "User-Agent": "VanguardSearchOpportunities/1.0" } });
    return { estado: r.status, texto: await r.text() };
  } catch {
    return null;
  }
}

/**
 * Las URLs que publica el sitemap de la casa, recorriendo el ÍNDICE.
 * v421.4 — desde v421.0 /sitemap.xml es un <sitemapindex> de 7 archivos. Este
 * código hacía grep de <loc> sobre el índice y devolvía las 7 rutas de los
 * propios sitemaps: el motor de oportunidades creía que la casa publica siete
 * páginas y marcaba como «oportunidad» todo lo demás. Medido el 2026-11-20.
 * Si algún día vuelve a ser un sitemap único, la primera rama lo sirve igual.
 */
async function urlsDelSitemap(casa: string): Promise<string[] | null> {
  const r = await traer(`${casa}/sitemap.xml`);
  if (!r || r.estado !== 200) return null;
  const locs = (t: string) => [...t.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const raiz = locs(r.texto);
  if (!/<sitemapindex[\s>]/.test(r.texto)) return raiz;
  const hijos = await Promise.all(raiz.map((u) => traer(u)));
  return hijos.flatMap((h) => (h && h.estado === 200 ? locs(h.texto) : []));
}

/** Rutas que publica el sitemap de la casa (null si no se pudo leer). */
export async function rutasDelSitemap(): Promise<Set<string> | null> {
  const { valor } = await memo("gsc:sitemap", 60 * 60_000, async () => {
    const urls = await urlsDelSitemap(SITE_URL);
    return urls ? urls.map((u) => rutaDeUrl(u)) : null;
  });
  return valor ? new Set(valor) : null;
}

export async function comprobacionesPublicas(): Promise<Comprobacion[]> {
  const { valor } = await memo("gsc:publicas", 30 * 60_000, async () => {
    const [portada, robots, sitemap] = await Promise.all([traer(`${CASA_OFICIAL}/`), traer(`${CASA_OFICIAL}/robots.txt`), traer(`${CASA_OFICIAL}/sitemap.xml`)]);
    // v421.4 — el número tiene que ser el de PÁGINAS: si /sitemap.xml es un
    // índice, se cuentan las URLs de sus hijos (antes decía «7 URLs»).
    const publicadas = sitemap?.estado === 200 ? await urlsDelSitemap(CASA_OFICIAL) : null;
    const urls = publicadas?.length ?? 0;
    const bloquea = robots?.estado === 200 && /User-Agent:\s*(\*|Googlebot)\s*\n(?:[^\n]*\n)*?Disallow:\s*\/\s*$/im.test(robots.texto);
    const lista: Comprobacion[] = [
      {
        id: "verificacion",
        nombre: "Meta de verificación de Google en la portada",
        ok: portada ? portada.texto.includes(META_VERIFICACION) : null,
        detalle: portada
          ? portada.texto.includes(META_VERIFICACION)
            ? `La portada (${CASA_OFICIAL}/) publica la etiqueta google-site-verification: la propiedad «prefijo de URL» puede estar verificada con ella.`
            : "La portada NO publica la etiqueta de verificación declarada en layout.tsx."
          : "No se pudo leer la portada para comprobarlo.",
      },
      {
        id: "sitemap",
        nombre: "Sitemap accesible",
        ok: sitemap ? sitemap.estado === 200 && urls > 0 : null,
        detalle: sitemap ? `${CASA_OFICIAL}/sitemap.xml responde HTTP ${sitemap.estado} con ${urls.toLocaleString("es-ES")} URLs.` : "No se pudo leer el sitemap.",
      },
      {
        id: "robots",
        nombre: "robots.txt deja pasar a Googlebot",
        ok: robots ? robots.estado === 200 && !bloquea : null,
        detalle: robots ? (bloquea ? "robots.txt bloquea la raíz a Googlebot." : `robots.txt responde HTTP ${robots.estado} y no bloquea la raíz.`) : "No se pudo leer robots.txt.",
      },
    ];
    return lista;
  });
  return valor;
}

// ── prueba de conexión (con credenciales) ───────────────────────

export interface PasoPrueba {
  paso: string;
  ok: boolean | null;
  detalle: string;
  ms: number;
}

export interface ResultadoPrueba {
  conectado: boolean;
  sitio: string;
  pasos: PasoPrueba[];
  /** totales reales de los últimos 7 días cerrados, si se llegó hasta ahí */
  totales7d: (Totales & { periodo: Periodo }) | null;
}

export async function probarConexion(): Promise<ResultadoPrueba> {
  const cfg = configuracion();
  const pasos: PasoPrueba[] = [];
  const medir = async <T>(paso: string, fn: () => Promise<T>, detalleOk: (v: T) => string): Promise<T | null> => {
    const t0 = Date.now();
    try {
      const v = await fn();
      pasos.push({ paso, ok: true, detalle: detalleOk(v), ms: Date.now() - t0 });
      return v;
    } catch (e) {
      const detalle = e instanceof ErrorGoogle ? `${e.message}${e.motivoGoogle ? ` · Google: ${e.motivoGoogle}` : ""}` : e instanceof Error ? e.message : String(e);
      pasos.push({ paso, ok: false, detalle, ms: Date.now() - t0 });
      return null;
    }
  };

  pasos.push({
    paso: "Credenciales en el servidor",
    ok: cfg.lista,
    detalle: cfg.lista
      ? `Modo ${cfg.modo}${cfg.cuentaServicio ? ` (${cfg.cuentaServicio})` : ""}.`
      : cfg.aviso ?? `Faltan: ${cfg.faltan.join(" ")}`,
    ms: 0,
  });
  if (!cfg.lista) return { conectado: false, sitio: cfg.sitio, pasos, totales7d: null };

  const token = await medir("Token de acceso de Google", tokenDeAcceso, () => "Google entregó un token de solo lectura (webmasters.readonly).");
  if (!token) return { conectado: false, sitio: cfg.sitio, pasos, totales7d: null };

  const sitios = await medir("Propiedades visibles para esta credencial", listarSitios, (s) =>
    s.length ? s.map((x) => `${x.siteUrl} (${x.permissionLevel})`).join(" · ") : "Ninguna: la credencial no tiene acceso a ninguna propiedad."
  );
  if (sitios && !sitios.some((s) => s.siteUrl === cfg.sitio)) {
    pasos.push({
      paso: "La propiedad configurada está entre ellas",
      ok: false,
      detalle: `GSC_SITE_URL = «${cfg.sitio}» no aparece en la lista. Añade la credencial como usuario de esa propiedad o corrige GSC_SITE_URL.`,
      ms: 0,
    });
    return { conectado: false, sitio: cfg.sitio, pasos, totales7d: null };
  }

  const p = periodo(7);
  const tot = await medir("Consulta real a searchAnalytics (7 días cerrados)", () => totalesDelSitio(cfg.sitio, p), (t) =>
    `${p.inicio} → ${p.fin}: ${t.impresiones.toLocaleString("es-ES")} impresiones y ${t.clics.toLocaleString("es-ES")} clics.`
  );
  return { conectado: !!tot, sitio: cfg.sitio, pasos, totales7d: tot ? { ...tot, periodo: p } : null };
}

// ── el informe ──────────────────────────────────────────────────

export interface InformeCompleto extends InformeOportunidades {
  sitio: string;
  periodo: Periodo;
  totales: Totales;
  generado: string;
  cacheado: boolean;
}

export async function informe(dias: Dias): Promise<InformeCompleto> {
  const cfg = configuracion();
  if (!cfg.lista) throw new ErrorGoogle("token", 0, "No hay credenciales de Search Console configuradas.", null);
  const p = periodo(dias);
  const { valor, cacheado } = await memo(`gsc:informe:${cfg.sitio}:${p.inicio}:${p.fin}`, 6 * 60 * 60_000, async () => {
    const [totales, filas, porPagina, sitemap] = await Promise.all([
      totalesDelSitio(cfg.sitio, p),
      filasConsultaPagina(cfg.sitio, p),
      filasPorPagina(cfg.sitio, p),
      rutasDelSitemap(),
    ]);
    const analisis = analizar({
      filas,
      paginasGoogle: porPagina,
      paginas: paginasDeLaCasa(),
      rutasSitemap: sitemap,
      base: CASA_OFICIAL.replace(/\/+$/, ""),
      paisDe: fichaDePais,
    });
    return {
      ...analisis,
      sitio: cfg.sitio,
      periodo: p,
      totales,
      generado: new Date().toISOString(),
    };
  });
  return { ...valor, cacheado };
}
