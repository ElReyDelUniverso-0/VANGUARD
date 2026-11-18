// ═══════════════════════════════════════════════════════════════════
// v406.3 PIEZAS DE DATOS — artículos que se escriben solos.
// El cuerpo es una función: lee fichas() (el censo de /mundos: atlas de la
// casa + Banco Mundial + poder-data) y compone tablas y frases en cada
// petición. Cuando el bot de datos refresca el censo, el artículo cambia sin
// que nadie lo toque: es la parte del plan de actualizaciones que no depende
// de la redacción. Cada clasificación enlaza a la ficha del país.
// ═══════════════════════════════════════════════════════════════════
import { fichas, type FichaPais } from "@/lib/mundos/ficha";
import { formatear, miles, type FormatoMedida } from "@/lib/mundos/formato";
import type { Articulo, Bloque } from "../tipos";

const RD = "do"; // la pieza sitúa siempre a la República Dominicana (sede del lector)
const esRD = (iso2: string) => iso2.toLowerCase() === RD;
const UMBRAL_DENSIDAD = 1_000_000; // los microestados se tratan aparte en la densidad

type Valor = (f: FichaPais) => number | null;

function clasificar(valor: Valor, filtro: (f: FichaPais) => boolean = () => true) {
  return fichas()
    .filter(filtro)
    .map((f) => ({ f, v: valor(f) }))
    .filter((x): x is { f: FichaPais; v: number } => x.v !== null && Number.isFinite(x.v))
    .sort((a, b) => b.v - a.v);
}

function ranking(
  titulo: string,
  valor: Valor,
  formato: FormatoMedida,
  opciones: { n?: number; escala?: number; filtro?: (f: FichaPais) => boolean; nota?: string; asc?: boolean } = {},
): Bloque {
  const { n = 10, escala = 1, filtro, nota, asc = false } = opciones;
  let lista = clasificar(valor, filtro);
  if (asc) lista = [...lista].reverse();
  const filas = lista.slice(0, n).map((x, i) => ({
    pos: i + 1,
    nombre: x.f.nombre,
    href: `/mundos/${x.f.iso2.toLowerCase()}`,
    valor: formatear(formato, x.v / escala),
  }));
  const iRd = lista.findIndex((x) => esRD(x.f.iso2));
  if (iRd >= n && !asc) {
    const x = lista[iRd];
    filas.push({ pos: iRd + 1, nombre: x.f.nombre, href: `/mundos/${RD}`, valor: formatear(formato, x.v / escala) });
  }
  return {
    t: "ranking",
    titulo,
    filas: filas.map((f) => ({ ...f, destacado: f.href === `/mundos/${RD}` })),
    nota: `${nota ? nota + " · " : ""}${lista.length} países y territorios con dato.`,
  };
}

function puesto(valor: Valor, iso2: string, filtro?: (f: FichaPais) => boolean) {
  const lista = clasificar(valor, filtro);
  const i = lista.findIndex((x) => x.f.iso2.toLowerCase() === iso2.toLowerCase());
  return i < 0 ? null : { puesto: i + 1, de: lista.length, valor: lista[i].v };
}

function suma(valor: Valor) {
  return clasificar(valor).reduce((s, x) => s + x.v, 0);
}

function anioDominante(campo: string): string {
  const cuenta = new Map<number, number>();
  for (const f of fichas()) {
    const a = f.censo?.anios?.[campo];
    if (a) cuenta.set(a, (cuenta.get(a) ?? 0) + 1);
  }
  const top = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0];
  return top ? String(top[0]) : "último disponible";
}

const pob: Valor = (f) => f.poblacion;
const sup: Valor = (f) => f.superficie;
const den: Valor = (f) => f.densidad;
const vida: Valor = (f) => f.censo?.esperanzaVida ?? null;
const pib: Valor = (f) => f.censo?.pib ?? null;
const pibPC: Valor = (f) => f.censo?.pibPC ?? null;
const gasto: Valor = (f) => (f.militar ? f.militar.gasto : null);
const esfuerzo: Valor = (f) => (f.militar ? f.militar.gdpPct : null);
const grande = (f: FichaPais) => (f.poblacion ?? 0) >= UMBRAL_DENSIDAD;

function frasePuesto(etiqueta: string, p: ReturnType<typeof puesto>, formato: FormatoMedida, escala = 1): string {
  if (!p) return `${etiqueta}: sin dato.`;
  return `${etiqueta}: puesto ${p.puesto} de ${p.de} (${formatear(formato, p.valor / escala)}).`;
}

function cuerpoPoblacion(): Bloque[] {
  const total = suma(pob);
  const top = clasificar(pob);
  const dos = top.slice(0, 2).reduce((s, x) => s + x.v, 0);
  const diez = top.slice(0, 10).reduce((s, x) => s + x.v, 0);
  return [
    {
      t: "p",
      x: `Las fichas de Vanguard suman ${miles(total / 1e9, 2)} miles de millones de personas repartidas en ${top.length} países y territorios. Solo los dos primeros, ${top[0]?.f.nombre} y ${top[1]?.f.nombre}, reúnen el ${miles((dos / total) * 100, 1)} % de la humanidad; los diez primeros, el ${miles((diez / total) * 100, 1)} %.`,
    },
    { t: "h2", x: "Dónde vive la gente", id: "poblacion" },
    ranking("Los 10 más poblados", pob, "poblacion", { escala: 1e6, nota: `Población · atlas de la casa + Banco Mundial (sobre todo ${anioDominante("pob")})` }),
    { t: "h2", x: "Cuánto territorio ocupa cada uno", id: "superficie" },
    ranking("Los 10 más extensos", sup, "superficie", { nota: "Superficie total en km² · atlas de la casa + Banco Mundial" }),
    {
      t: "p",
      x: "La superficie y la población casi nunca coinciden: varios de los países más grandes del planeta tienen enormes extensiones de desierto, tundra o hielo prácticamente deshabitadas.",
    },
    { t: "h2", x: "Dónde está más apretada la población", id: "densidad" },
    ranking("Los 10 más densos (más de 1 millón de habitantes)", den, "densidad", {
      filtro: grande,
      nota: "Habitantes por km² · derivada de las dos tablas anteriores; se excluyen microestados y territorios de menos de 1 millón de habitantes",
    }),
    { t: "h2", x: "Cuántos años vive la gente", id: "vida" },
    ranking("La esperanza de vida más alta", vida, "anios", { nota: `Años al nacer · Banco Mundial SP.DYN.LE00.IN (sobre todo ${anioDominante("vida")})` }),
    ranking("La esperanza de vida más baja", vida, "anios", { asc: true, nota: "Mismo indicador, ordenado de menor a mayor" }),
    { t: "h2", x: "Dónde queda la República Dominicana", id: "rd" },
    {
      t: "lista",
      items: [
        frasePuesto("Población", puesto(pob, RD), "poblacion", 1e6),
        frasePuesto("Superficie", puesto(sup, RD), "superficie"),
        frasePuesto("Densidad (países de más de 1 millón de habitantes)", puesto(den, RD, grande), "densidad"),
        frasePuesto("Esperanza de vida", puesto(vida, RD), "anios"),
      ],
    },
    {
      t: "aviso",
      x: "Esta página se recalcula sola cada vez que se actualiza el censo de /mundos. Las cifras de un mismo país pueden corresponder a años distintos: cada ficha indica el año de cada dato.",
    },
  ];
}

function cuerpoEconomia(): Bloque[] {
  const total = suma(pib);
  const top = clasificar(pib);
  const dos = top.slice(0, 2).reduce((s, x) => s + x.v, 0);
  const totalGasto = suma(gasto);
  const topG = clasificar(gasto);
  return [
    {
      t: "p",
      x: `La suma del PIB de los ${top.length} países y territorios con dato en el censo de Vanguard ronda los ${formatear("usd", total)}. ${top[0]?.f.nombre} y ${top[1]?.f.nombre} producen juntos el ${miles((dos / total) * 100, 1)} % de ese total. El PIB mide el valor de todo lo que produce una economía en un año, en dólares corrientes: no dice cómo se reparte, pero es la medida más usada del peso económico de un país.`,
    },
    { t: "h2", x: "Las mayores economías", id: "pib" },
    ranking("PIB: las 10 mayores economías", pib, "usd", { nota: `US$ corrientes · Banco Mundial NY.GDP.MKTP.CD (sobre todo ${anioDominante("pib")})` }),
    { t: "h2", x: "La renta por habitante", id: "pib-pc" },
    ranking("PIB por habitante: los 10 primeros", pibPC, "usd", { nota: "US$ por persona · Banco Mundial NY.GDP.PCAP.CD" }),
    {
      t: "p",
      x: "La clasificación por habitante cambia por completo el mapa: la encabezan economías pequeñas con centros financieros, petróleo o una población reducida. Las grandes potencias por PIB total suelen quedar lejos de los primeros puestos.",
    },
    ranking("PIB por habitante: los 10 últimos", pibPC, "usd", { asc: true, nota: "Mismo indicador, ordenado de menor a mayor" }),
    { t: "h2", x: "Quién gasta más en defensa", id: "defensa" },
    {
      t: "p",
      x: `Los ${topG.length} países con dato de gasto militar suman ${formatear("usd", totalGasto)}. Solo el primero, ${topG[0]?.f.nombre}, representa el ${miles(((topG[0]?.v ?? 0) / totalGasto) * 100, 1)} % de ese total.`,
    },
    ranking("Gasto militar: los 10 mayores", gasto, "usd", { nota: "US$ corrientes · poder-data · Banco Mundial MS.MIL.XPND.CD" }),
    ranking("Esfuerzo militar: % del PIB dedicado a defensa", esfuerzo, "pct", { nota: "Banco Mundial MS.MIL.XPND.GD.ZS · en guerra o bajo amenaza, el porcentaje se dispara" }),
    { t: "h2", x: "Dónde queda la República Dominicana", id: "rd" },
    {
      t: "lista",
      items: [
        frasePuesto("PIB", puesto(pib, RD), "usd"),
        frasePuesto("PIB por habitante", puesto(pibPC, RD), "usd"),
        frasePuesto("Gasto militar", puesto(gasto, RD), "usd"),
        frasePuesto("Esfuerzo militar (% del PIB)", puesto(esfuerzo, RD), "pct"),
      ],
    },
    {
      t: "aviso",
      x: "Página recalculada desde el censo de /mundos. El PIB en dólares corrientes depende del tipo de cambio: una devaluación puede hacer caer a un país en la tabla aunque su economía no se haya contraído.",
    },
  ];
}

const comunes = {
  publicado: "2026-11-18",
  revisarCada: 30,
  enlaces: [
    { href: "/mundos", label: "Los 249 mundos" },
    { href: "/mundos/do", label: "Ficha de la República Dominicana" },
    { href: "/divisas", label: "Divisas" },
  ],
  informe: "Censo de /mundos (censo-banco-mundial.json, captura del bot de datos) · se recalcula solo",
};

export const rankingPoblacion: Articulo = {
  ...comunes,
  slug: "el-mundo-en-cifras-poblacion-territorio-y-vida",
  titulo: "El mundo en cifras: quién tiene más gente, más territorio y más años de vida",
  entradilla:
    "Clasificaciones de población, superficie, densidad y esperanza de vida de todos los países y territorios, calculadas en directo desde el censo de Vanguard y con la República Dominicana siempre a la vista.",
  area: "paises",
  tipo: "datos",
  revisado: "2026-11-18",
  imagen: "/ilustraciones/estadisticas.jpg",
  claves: [
    "Las tablas se calculan en cada visita desde las 249 fichas de /mundos.",
    "Fuentes: atlas de la casa y Banco Mundial, con el año de cada dato en la ficha del país.",
    "En la densidad se excluyen los territorios de menos de un millón de habitantes, para no comparar ciudades-Estado con países.",
  ],
  cuerpo: cuerpoPoblacion,
  fuentes: [
    { nombre: "Banco Mundial · Población total (SP.POP.TOTL)", url: "https://data.worldbank.org/indicator/SP.POP.TOTL", tipo: "primaria" },
    { nombre: "Banco Mundial · Superficie (AG.SRF.TOTL.K2)", url: "https://data.worldbank.org/indicator/AG.SRF.TOTL.K2", tipo: "primaria" },
    { nombre: "Banco Mundial · Esperanza de vida al nacer (SP.DYN.LE00.IN)", url: "https://data.worldbank.org/indicator/SP.DYN.LE00.IN", tipo: "primaria" },
  ],
  salas: ["atlas", "tierra"],
  etiquetas: ["población", "superficie", "densidad", "esperanza de vida", "datos", "ranking"],
  complementa: "/mundos muestra un país cada vez y el mapa por capas; esta pieza ordena y compara",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación. El cuerpo se recalcula desde el censo en cada visita." }],
};

export const rankingEconomia: Articulo = {
  ...comunes,
  slug: "el-mundo-en-cifras-economia-y-gasto-militar",
  titulo: "El mundo en cifras: las mayores economías, la renta por habitante y el gasto militar",
  entradilla:
    "Quién produce más, quién vive mejor por persona y quién dedica más dinero a sus ejércitos. Clasificaciones calculadas en directo desde el censo de Vanguard.",
  area: "economia",
  tipo: "datos",
  revisado: "2026-11-18",
  imagen: "/ilustraciones/mercados.jpg",
  claves: [
    "PIB y PIB por habitante del Banco Mundial, en dólares corrientes.",
    "Gasto militar en dólares y en porcentaje del PIB.",
    "Las tablas cambian solas cuando el bot de datos actualiza el censo.",
  ],
  cuerpo: cuerpoEconomia,
  fuentes: [
    { nombre: "Banco Mundial · PIB (NY.GDP.MKTP.CD)", url: "https://data.worldbank.org/indicator/NY.GDP.MKTP.CD", tipo: "primaria" },
    { nombre: "Banco Mundial · PIB per cápita (NY.GDP.PCAP.CD)", url: "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD", tipo: "primaria" },
    { nombre: "Banco Mundial · Gasto militar (MS.MIL.XPND.CD)", url: "https://data.worldbank.org/indicator/MS.MIL.XPND.CD", tipo: "primaria" },
  ],
  enlaces: [...comunes.enlaces, { href: "/poder", label: "Poder militar" }],
  salas: ["bolsa", "observatorio"],
  etiquetas: ["PIB", "economía", "renta", "gasto militar", "datos", "ranking"],
  complementa: "/poder clasifica la fuerza militar; esta pieza cruza economía y defensa",
  cambios: [{ fecha: "2026-11-18", nota: "Publicación. El cuerpo se recalcula desde el censo en cada visita." }],
};
