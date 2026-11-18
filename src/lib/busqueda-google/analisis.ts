// ============================================================
// v415.0 · VANGUARD SEARCH OPPORTUNITIES — el análisis (puro)
//
// Entra lo que devuelve Search Console + la lista de páginas reales de la
// casa; sale una lista de oportunidades con su motivo y su acción. Sin red,
// sin reloj, sin azar: la misma entrada da siempre la misma salida.
//
// REGLAS DE HONESTIDAD (no se negocian):
//   · La referencia de CTR es la PROPIA casa en la misma franja de posición
//     (clics / impresiones de todas sus filas en esa franja). No se usan curvas
//     de CTR «del sector» ni se promete un puesto.
//   · Si una franja no reúne MIN_IMPRESIONES_FRANJA, su referencia es null y la
//     regla de CTR bajo no se dispara en ella.
//   · Una página sin impresiones lleva posición y CTR null («sin dato»).
//   · Las acciones dicen QUÉ revisar, no cuánto se va a subir.
// ============================================================

import {
  NOMBRE_TIPO,
  TIPOS_OPORTUNIDAD,
  type FilaConsultaPagina,
  type FilaPagina,
  type FranjaCtr,
  type InformeOportunidades,
  type Oportunidad,
  type PaginaCasa,
  type TipoOportunidad,
} from "./tipos";

/** Umbrales declarados (se muestran en el panel tal cual). */
export const UMBRALES = {
  /** impresiones mínimas de una fila para opinar sobre ella */
  minImpresionesFila: 30,
  /** impresiones mínimas de una franja para usarla como referencia */
  minImpresionesFranja: 100,
  /** CTR bajo = por debajo de esta fracción del CTR medio de la franja */
  fraccionCtrBajo: 0.5,
  /** posición máxima para la regla de CTR bajo (más abajo casi nadie mira) */
  posicionMaxCtrBajo: 20,
  /** «contenido a mejorar»: posición media ponderada entre estos dos valores */
  posicionContenidoDesde: 8,
  posicionContenidoHasta: 20,
  /** canibalización: impresiones mínimas de CADA página en la consulta */
  minImpresionesCanibal: 10,
  /** relación consulta→página: puntuación mínima para sugerir otra página */
  encajeSugerir: 0.6,
  /** por debajo de esto se considera que ninguna página trata la consulta */
  encajeHueco: 0.34,
  /** hueco: solo consultas donde la casa aparece por debajo de esta posición */
  posicionHueco: 20,
  /** tope de oportunidades por tipo (el panel no es un volcado) */
  maxPorTipo: 60,
} as const;

export const FRANJAS: { franja: string; desde: number; hasta: number }[] = [
  { franja: "1–3", desde: 0, hasta: 3.5 },
  { franja: "4–10", desde: 3.5, hasta: 10.5 },
  { franja: "11–20", desde: 10.5, hasta: 20.5 },
  { franja: "21+", desde: 20.5, hasta: Infinity },
];

// ── texto ───────────────────────────────────────────────────────

export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const VACIAS = new Set(
  (
    "de la el los las un una unos unas y o u e en con por para del al a que se su sus es lo como mas " +
    "the of and or in on for to a an is are what how who why with from by at " +
    "hoy ahora 2024 2025 2026 vs que cual cuales donde cuando quien"
  ).split(" ")
);

/** Palabras de marca: no sirven para decidir qué página trata la consulta. */
const MARCA = new Set(["vanguard", "vanguardia", "vercel", "app", "kq9r", "u6b9"]);

export function tokens(s: string): string[] {
  return normalizar(s)
    .split(" ")
    .filter((t) => t.length >= 3 && !VACIAS.has(t));
}

export function esConsultaDeMarca(consulta: string): boolean {
  const t = normalizar(consulta).split(" ").filter(Boolean);
  return t.length > 0 && t.some((x) => MARCA.has(x)) && tokens(consulta).filter((x) => !MARCA.has(x)).length === 0;
}

function raiz(t: string): string {
  return t.length >= 6 ? t.slice(0, 5) : t;
}

// ── URL → ruta de la casa ───────────────────────────────────────

/** Quita host, query, ancla y barra final: «https://x.app/mundos/do/?a=1» → «/mundos/do». */
export function rutaDeUrl(url: string): string {
  let r = url.trim();
  try {
    r = new URL(r).pathname;
  } catch {
    r = r.replace(/^https?:\/\/[^/]+/i, "").split(/[?#]/)[0];
  }
  try {
    r = decodeURIComponent(r);
  } catch {
    /* se queda como venía */
  }
  r = r.replace(/\/+$/, "");
  return r === "" ? "/" : r;
}

/** La página de la casa que corresponde a una ruta: exacta, o el prefijo más largo. */
export function paginaDeRuta(ruta: string, paginas: PaginaCasa[]): PaginaCasa | null {
  let mejor: PaginaCasa | null = null;
  for (const p of paginas) {
    if (p.ruta === ruta) return p;
    if (p.ruta !== "/" && ruta.startsWith(p.ruta + "/")) {
      if (!mejor || p.ruta.length > mejor.ruta.length) mejor = p;
    }
  }
  return mejor;
}

// ── consulta → página real ──────────────────────────────────────

export interface Encaje {
  pagina: { ruta: string; nombre: string };
  puntuacion: number;
  /** términos de la consulta que encontró en la página */
  terminos: string[];
}

type IndicePaginas = { p: PaginaCasa; raices: Set<string> }[];

export function indexarPaginas(paginas: PaginaCasa[]): IndicePaginas {
  return paginas.map((p) => ({
    p,
    raices: new Set(tokens(`${p.nombre} ${p.buscar} ${p.ruta.replace(/[/_-]+/g, " ")}`).map(raiz)),
  }));
}

/**
 * La página de la casa que mejor trata una consulta, con una puntuación 0–1
 * (fracción de términos útiles de la consulta que aparecen en la página).
 * `paisDe` (opcional) reconoce países y propone su ficha /mundos/<iso>.
 */
export function encajeDeConsulta(
  consulta: string,
  indice: IndicePaginas,
  paisDe?: (consulta: string) => { ruta: string; nombre: string } | null
): Encaje | null {
  const ts = tokens(consulta).filter((t) => !MARCA.has(t));
  if (ts.length === 0) return null;
  let mejor: Encaje | null = null;
  for (const { p, raices } of indice) {
    const hallados = ts.filter((t) => raices.has(raiz(t)));
    if (hallados.length === 0) continue;
    const puntuacion = hallados.length / ts.length;
    const gana =
      !mejor ||
      puntuacion > mejor.puntuacion ||
      (puntuacion === mejor.puntuacion && p.importante && p.ruta.length < mejor.pagina.ruta.length);
    if (gana) mejor = { pagina: { ruta: p.ruta, nombre: p.nombre }, puntuacion, terminos: hallados };
  }
  const pais = paisDe?.(consulta) ?? null;
  if (pais) {
    // un país en la consulta: su ficha es una página real de la casa
    const encajePais: Encaje = { pagina: pais, puntuacion: Math.max(0.67, mejor?.puntuacion ?? 0), terminos: [] };
    if (!mejor || mejor.puntuacion < 0.67) return encajePais;
  }
  return mejor;
}

// ── franjas de CTR (referencia propia) ──────────────────────────

export function franjaDe(posicion: number): string {
  return (FRANJAS.find((f) => posicion >= f.desde && posicion < f.hasta) ?? FRANJAS[FRANJAS.length - 1]).franja;
}

export function franjasCtr(filas: FilaConsultaPagina[]): FranjaCtr[] {
  return FRANJAS.map((f) => {
    let impresiones = 0;
    let clics = 0;
    for (const r of filas) {
      if (r.posicion >= f.desde && r.posicion < f.hasta) {
        impresiones += r.impresiones;
        clics += r.clics;
      }
    }
    return {
      ...f,
      hasta: Number.isFinite(f.hasta) ? f.hasta : 9999,
      impresiones,
      clics,
      ctr: impresiones >= UMBRALES.minImpresionesFranja ? clics / impresiones : null,
    };
  });
}

// ── formato para los textos ─────────────────────────────────────

export function pct(x: number): string {
  return `${(x * 100).toLocaleString("es-ES", { maximumFractionDigits: 1, minimumFractionDigits: x < 0.1 ? 1 : 0 })} %`;
}
function pos(x: number): string {
  return x.toLocaleString("es-ES", { maximumFractionDigits: 1 });
}
function n(x: number): string {
  return x.toLocaleString("es-ES");
}

// ── el análisis ─────────────────────────────────────────────────

export interface EntradaAnalisis {
  filas: FilaConsultaPagina[];
  /** totales por página (incluyen consultas anonimizadas) */
  paginasGoogle: FilaPagina[];
  /** las páginas reales de la casa */
  paginas: PaginaCasa[];
  /** rutas que el sitemap publica (para la acción de SIN_IMPRESIONES) */
  rutasSitemap?: Set<string> | null;
  /** URL base de la casa, para escribir la URL de las páginas sin impresiones */
  base: string;
  paisDe?: (consulta: string) => { ruta: string; nombre: string } | null;
}

export function analizar(e: EntradaAnalisis): InformeOportunidades {
  const filas = e.filas.filter((r) => r.impresiones > 0 && r.consulta && r.pagina);
  const indice = indexarPaginas(e.paginas);
  const franjas = franjasCtr(filas);
  const ctrDeFranja = new Map(franjas.map((f) => [f.franja, f.ctr]));
  const ops: Oportunidad[] = [];
  let seq = 0;
  const nuevaId = (t: TipoOportunidad) => `${t.toLowerCase()}-${++seq}`;

  const nombreDe = (ruta: string) => {
    const p = paginaDeRuta(ruta, e.paginas);
    return { nombre: p?.ruta === ruta ? p.nombre : p ? `${p.nombre} · ${ruta}` : ruta, categoria: p?.categoria ?? "Sin módulo" };
  };

  // 1 · CTR BAJO — fila a fila
  for (const r of filas) {
    if (r.impresiones < UMBRALES.minImpresionesFila || r.posicion > UMBRALES.posicionMaxCtrBajo) continue;
    const franja = franjaDe(r.posicion);
    const ref = ctrDeFranja.get(franja) ?? null;
    if (ref === null || ref === 0 || r.ctr >= ref * UMBRALES.fraccionCtrBajo) continue;
    const ruta = rutaDeUrl(r.pagina);
    const { nombre, categoria } = nombreDe(ruta);
    const marca = esConsultaDeMarca(r.consulta);
    ops.push({
      id: nuevaId("CTR_BAJO"),
      tipo: "CTR_BAJO",
      consulta: r.consulta,
      url: r.pagina,
      ruta,
      paginaNombre: nombre,
      categoria,
      impresiones: r.impresiones,
      clics: r.clics,
      ctr: r.ctr,
      posicion: r.posicion,
      referencia: { franja, ctr: ref },
      sugerida: null,
      detectada: `${n(r.impresiones)} impresiones con un CTR de ${pct(r.ctr)}, frente al ${pct(ref)} que la propia casa logra de media en posiciones ${franja}.`,
      accion: marca
        ? `Es una búsqueda de la marca: revisa que el título y la descripción de ${ruta} digan claramente qué es Vanguard y qué encontrará quien entra.`
        : `Reescribe el título y la meta descripción de ${ruta} para que respondan de forma directa a «${r.consulta}». La página ya aparece; lo que falla es la invitación a entrar. Comprueba también que el fragmento no esté cortado.`,
      peso: r.impresiones,
    });
  }

  // 2 · CONTENIDO A MEJORAR — por página (con los totales de página)
  const consultasDe = new Map<string, FilaConsultaPagina[]>();
  for (const r of filas) {
    const ruta = rutaDeUrl(r.pagina);
    const l = consultasDe.get(ruta) ?? [];
    l.push(r);
    consultasDe.set(ruta, l);
  }
  for (const pg of e.paginasGoogle) {
    if (pg.clics < 1 || pg.impresiones <= 0) continue;
    if (pg.posicion < UMBRALES.posicionContenidoDesde || pg.posicion > UMBRALES.posicionContenidoHasta) continue;
    const ruta = rutaDeUrl(pg.pagina);
    const { nombre, categoria } = nombreDe(ruta);
    const top = (consultasDe.get(ruta) ?? []).sort((a, b) => b.impresiones - a.impresiones).slice(0, 3);
    const lista = top.map((t) => `«${t.consulta}»`).join(", ");
    ops.push({
      id: nuevaId("CONTENIDO_A_MEJORAR"),
      tipo: "CONTENIDO_A_MEJORAR",
      consulta: top[0]?.consulta ?? null,
      url: pg.pagina,
      ruta,
      paginaNombre: nombre,
      categoria,
      impresiones: pg.impresiones,
      clics: pg.clics,
      ctr: pg.ctr,
      posicion: pg.posicion,
      referencia: null,
      sugerida: null,
      detectada: `Recibe ${n(pg.clics)} clic${pg.clics === 1 ? "" : "s"}, pero su posición media es ${pos(pg.posicion)}: ${pg.posicion <= 10.5 ? "al final de la primera página" : "en la segunda página"}.`,
      accion: lista
        ? `Amplía en ${ruta} la parte que responde a ${lista}: datos con fecha y fuente, una respuesta clara arriba y enlaces internos desde las páginas de ${categoria} que ya reciben visitas.`
        : `Revisa en Search Console qué consultas llevan a ${ruta} (aquí llegan anonimizadas) y amplía la sección que las responde, con datos fechados y enlaces internos.`,
      peso: pg.impresiones,
    });
  }

  // 3 · SIN IMPRESIONES — las puertas importantes que Google no mostró
  const conImpresiones = new Set(e.paginasGoogle.filter((p) => p.impresiones > 0).map((p) => rutaDeUrl(p.pagina)));
  for (const r of filas) conImpresiones.add(rutaDeUrl(r.pagina));
  const importantes = e.paginas.filter((p) => p.importante);
  const sinImpresiones = importantes.filter((p) => !conImpresiones.has(p.ruta));
  const masVista = [...e.paginasGoogle].sort((a, b) => b.clics - a.clics)[0];
  for (const p of sinImpresiones) {
    const enSitemap = e.rutasSitemap ? e.rutasSitemap.has(p.ruta) : null;
    const desde = masVista ? rutaDeUrl(masVista.pagina) : "/";
    ops.push({
      id: nuevaId("SIN_IMPRESIONES"),
      tipo: "SIN_IMPRESIONES",
      consulta: null,
      url: `${e.base}${p.ruta === "/" ? "/" : p.ruta}`,
      ruta: p.ruta,
      paginaNombre: p.nombre,
      categoria: p.categoria,
      impresiones: 0,
      clics: 0,
      ctr: null,
      posicion: null,
      referencia: null,
      sugerida: null,
      detectada:
        enSitemap === false
          ? "Ni una impresión en el periodo, y no aparece en el sitemap."
          : enSitemap === true
            ? "Ni una impresión en el periodo, aunque está en el sitemap."
            : "Ni una impresión en el periodo (no se pudo leer el sitemap para comprobarlo).",
      accion:
        enSitemap === false
          ? `Añade ${p.ruta} al sitemap y enlázala desde ${desde}; después pide la indexación con la Inspección de URLs de Search Console.`
          : `Inspecciona ${p.ruta} con la Inspección de URLs de Search Console para saber si está indexada y por qué no; enlázala desde ${desde}, que es la página que más clics recibe.`,
      peso: 0,
    });
  }

  // 4 · CANIBALIZACIÓN — una consulta, varias páginas
  const porConsulta = new Map<string, FilaConsultaPagina[]>();
  for (const r of filas) {
    const l = porConsulta.get(r.consulta) ?? [];
    l.push(r);
    porConsulta.set(r.consulta, l);
  }
  for (const [consulta, l] of porConsulta) {
    const fuertes = l.filter((r) => r.impresiones >= UMBRALES.minImpresionesCanibal);
    const rutas = new Set(fuertes.map((r) => rutaDeUrl(r.pagina)));
    if (rutas.size < 2) continue;
    const orden = [...fuertes].sort((a, b) => b.clics - a.clics || b.impresiones - a.impresiones);
    const principal = orden[0];
    const otras = orden.slice(1).map((r) => rutaDeUrl(r.pagina));
    const imp = fuertes.reduce((s, r) => s + r.impresiones, 0);
    const cl = fuertes.reduce((s, r) => s + r.clics, 0);
    const rutaP = rutaDeUrl(principal.pagina);
    const { nombre, categoria } = nombreDe(rutaP);
    ops.push({
      id: nuevaId("CANIBALIZACION"),
      tipo: "CANIBALIZACION",
      consulta,
      url: principal.pagina,
      ruta: rutaP,
      paginaNombre: nombre,
      categoria,
      impresiones: imp,
      clics: cl,
      ctr: imp > 0 ? cl / imp : null,
      posicion: principal.posicion,
      referencia: null,
      sugerida: null,
      detectada: `${rutas.size} páginas de la casa aparecen para la misma consulta: ${[rutaP, ...otras].join(", ")}.`,
      accion: `Decide cuál responde a «${consulta}» (hoy la que más clics recibe es ${rutaP}). Diferencia el título de ${otras.join(", ")} o enlázalas hacia ${rutaP} con la consulta como texto del enlace.`,
      peso: imp,
    });
  }

  // 5 · PÁGINA MEJOR y 6 · HUECO — relación consulta → página real
  const vistas = new Set<string>();
  for (const r of [...filas].sort((a, b) => b.impresiones - a.impresiones)) {
    if (r.impresiones < UMBRALES.minImpresionesFila || vistas.has(r.consulta)) continue;
    if (esConsultaDeMarca(r.consulta)) continue;
    vistas.add(r.consulta);
    const ruta = rutaDeUrl(r.pagina);
    const encaje = encajeDeConsulta(r.consulta, indice, e.paisDe);
    const { nombre, categoria } = nombreDe(ruta);
    if (encaje && encaje.puntuacion >= UMBRALES.encajeSugerir && encaje.pagina.ruta !== ruta && !ruta.startsWith(encaje.pagina.ruta + "/")) {
      ops.push({
        id: nuevaId("PAGINA_MEJOR"),
        tipo: "PAGINA_MEJOR",
        consulta: r.consulta,
        url: r.pagina,
        ruta,
        paginaNombre: nombre,
        categoria,
        impresiones: r.impresiones,
        clics: r.clics,
        ctr: r.ctr,
        posicion: r.posicion,
        referencia: null,
        sugerida: encaje.pagina,
        detectada: `Google muestra ${ruta} para «${r.consulta}», pero ${encaje.pagina.ruta} (${encaje.pagina.nombre}) trata ese tema de forma específica${encaje.terminos.length ? ` («${encaje.terminos.join("», «")}»)` : ""}.`,
        accion: `Enlaza desde ${ruta} hacia ${encaje.pagina.ruta} con un texto que diga «${r.consulta}», y asegúrate de que el título de ${encaje.pagina.ruta} nombra el tema con esas palabras.`,
        peso: r.impresiones,
      });
    } else if ((!encaje || encaje.puntuacion < UMBRALES.encajeHueco) && r.posicion > UMBRALES.posicionHueco) {
      ops.push({
        id: nuevaId("HUECO"),
        tipo: "HUECO",
        consulta: r.consulta,
        url: r.pagina,
        ruta,
        paginaNombre: nombre,
        categoria,
        impresiones: r.impresiones,
        clics: r.clics,
        ctr: r.ctr,
        posicion: r.posicion,
        referencia: null,
        sugerida: null,
        detectada: `Google ya asocia la casa con «${r.consulta}» (posición media ${pos(r.posicion)}), pero ninguna página trata ese tema de forma directa.`,
        accion: `Valora una pieza en /editorial que responda a «${r.consulta}» con fuentes, solo si encaja con la línea de Vanguard; si no encaja, no hace falta perseguirla.`,
        peso: r.impresiones,
      });
    }
  }

  // orden y tope por tipo
  const finales: Oportunidad[] = [];
  for (const t of TIPOS_OPORTUNIDAD) {
    const delTipo = ops
      .filter((o) => o.tipo === t)
      .sort((a, b) => b.peso - a.peso || (a.ruta ?? "").localeCompare(b.ruta ?? ""))
      .slice(0, UMBRALES.maxPorTipo);
    finales.push(...delTipo);
  }

  const porCat = new Map<string, { cuantas: number; impresiones: number }>();
  for (const o of finales) {
    const c = porCat.get(o.categoria) ?? { cuantas: 0, impresiones: 0 };
    c.cuantas++;
    c.impresiones += o.impresiones;
    porCat.set(o.categoria, c);
  }

  return {
    oportunidades: finales,
    porTipo: TIPOS_OPORTUNIDAD.map((t) => ({ tipo: t, nombre: NOMBRE_TIPO[t].nombre, cuantas: finales.filter((o) => o.tipo === t).length })),
    porCategoria: [...porCat.entries()]
      .map(([categoria, v]) => ({ categoria, ...v }))
      .sort((a, b) => b.cuantas - a.cuantas || b.impresiones - a.impresiones),
    franjas,
    control: {
      filasConsultaPagina: filas.length,
      filasPagina: e.paginasGoogle.length,
      consultasDistintas: porConsulta.size,
      paginasConImpresiones: conImpresiones.size,
      paginasImportantes: importantes.length,
      paginasImportantesSinImpresiones: sinImpresiones.length,
    },
  };
}
