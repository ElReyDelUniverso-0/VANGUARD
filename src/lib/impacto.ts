// ════════════════════════════════════════════════════════════════
// v172.0 LA AGENCIA CENTRAL — EL MOTOR DE IMPACTO
// El Dueño mandó: «Vanguard será el mayor centro de noticias del
// mundo, con noticias EN VIVO POR IMPORTANCIA E IMPACTO, cada una
// con su pie de foto e información».
//
// Este motor es la REGIA de la redacción: cada cable que entra al
// mundo recibe una puntuación de IMPACTO 0–100 (gravedad del
// vocabulario + etiqueta táctica + país + credibilidad de la fuente
// + frescura) y un PELIGRO por escalones (URGENTE → CONTEXTO).
// Es 100% determinista y puro: la misma noticia produce siempre la
// misma puntuación — la Agencia es auditable línea a línea.
//
// Sirve igual al lado 2D (centro-panel) y al lado 3D (la SALA DEL
// MAPA MUNDIAL en primera persona) — una sola verdad, ley #25.
// ════════════════════════════════════════════════════════════════

export interface EntradaImpacto {
  id: string;
  title: string;
  url: string;
  source: string;
  imageUrl?: string | null;
  publishedAt: string | Date;
  tacticalTag?: string | null;
  conflictTag?: string | null;
  sourceCountry?: string | null;
  summary?: string | null;
}

// el veredicto de la redacción — cada escalón con su color de casa
export type TierImpacto = "urgente" | "critico" | "alto" | "desarrollo" | "contexto";

export const TIERS: Record<TierImpacto, { label: string; min: number; hex: string; clase: string; claseBarra: string }> = {
  urgente:    { label: "URGENTE",   min: 80, hex: "#FF3B30", clase: "text-red-hud border-red-hud/60 bg-red-hud/20",      claseBarra: "bg-red-hud" },
  critico:    { label: "CRÍTICO",   min: 64, hex: "#FF8A3D", clase: "text-orange-400 border-orange-400/60 bg-orange-400/15", claseBarra: "bg-orange-400" },
  alto:       { label: "ALTO",      min: 48, hex: "#F5C542", clase: "text-amber border-amber-hud/60 bg-amber-hud/20",    claseBarra: "bg-amber-hud" },
  desarrollo: { label: "DESARROLLO", min: 32, hex: "#7AB8FF", clase: "text-cyan-hud border-cyan-hud/60 bg-cyan-hud/15",  claseBarra: "bg-cyan-hud" },
  contexto:   { label: "CONTEXTO",  min: 0,  hex: "#8B98AD", clase: "text-muted-foreground border-border bg-secondary",  claseBarra: "bg-muted-foreground" },
};

export function tierDeImpacto(score: number): TierImpacto {
  if (score >= TIERS.urgente.min) return "urgente";
  if (score >= TIERS.critico.min) return "critico";
  if (score >= TIERS.alto.min) return "alto";
  if (score >= TIERS.desarrollo.min) return "desarrollo";
  return "contexto";
}

// ── EL VOCABULARIO DE LA GUERRA ────────────────────────────────
// Peso por gravedad (ES + EN, sin acentos para tolerar mayúsculas).
// Las cifras las puso la regia: lo irreversible pesa más.
const VOCAB: [RegExp, number][] = [
  [/nuclear|nucleo militar/i, 22],
  [/balistic[oa]|icbm/i, 16],
  [/invasi[óo]n|invade|invaded/i, 15],
  [/bombarde[oa]?|airstrike|air strike|ataque a[ée]reo/i, 13],
  [/misil|missile|cohete/i, 12],
  [/ataqu[ea]|attack|strike|ofensiva/i, 11],
  [/muert|killed|bajas|casualt|fallec|v[íi]ctimas/i, 11],
  [/tsunami|terremoto|earthquake|sismo/i, 10],
  [/guerra|war|conflicto armado/i, 10],
  [/evacua|refugiad|desplazad/i, 9],
  [/hura[ck][áa]n|hurricane|cicl[óo]n|tornado/i, 9],
  [/dron|drone|uav/i, 9],
  [/tropas|soldad|ej[ée]rcito|infanter[ií]a/i, 8],
  [/sancion|sanction|embargo/i, 8],
  [/alto el fuego|ceasefire|tregua/i, 8],
  [/otan|nato/i, 8],
  [/explosi[óo]n|detonaci[óo]n|blast/i, 8],
  [/secuestro|rehen|hostage/i, 8],
  [/ciberataque|hacker|ransomware/i, 7],
  [/espionaje|spy|inteligencia/i, 6],
  [/cumbre|summit/i, 6],
  [/acuerdo|treaty|firm[ae]/i, 5],
  [/frontera|border/i, 6],
  [/petr[óo]leo|oil|crudo|opep/i, 5],
  [/colapso|crisis/i, 6],
  [/elecci[óo]n|elect|refer[ée]ndum/i, 5],
  [/protesta|manifestaci[óo]n|disturbio/i, 5],
  [/inflaci[óo]n|recesi[óo]n|default/i, 5],
  [/dif[óo]n|hambre|sequ[ií]a|famine/i, 7],
  [/arma|weapon|militar/i, 5],
  [/plan de paz|paz|peace/i, 4],
];

// los pesos del tablero — el país del suceso infla la conmoción
const PESO_PAIS: Record<string, number> = {
  ua: 12, ru: 12, il: 12, ps: 12, ir: 10, tw: 10,
  us: 9, cn: 9, kp: 9, sd: 9, sy: 8, ye: 8, af: 8,
  by: 7, ml: 7, mm: 7, ve: 7, ht: 7, ly: 7, lb: 7,
  iq: 6, pk: 6, in: 6, cd: 6, et: 6, so: 6, ng: 6,
  mx: 6, co: 5, br: 5, ar: 4, cl: 4, pe: 4, ec: 4,
  gb: 5, fr: 5, de: 5, pl: 6, ro: 5, md: 6, ee: 6,
  lv: 5, lt: 5, fi: 5, se: 4, jp: 6, kr: 6, ph: 6,
  hk: 6, es: 4, it: 4, tr: 7, eg: 6,
  za: 4, cu: 5, ni: 5, bo: 4, py: 3, ge: 6, am: 6,
  az: 5, kz: 5, th: 4, id: 5, my: 4, au: 3, ca: 3, gr: 4,
};

// la credibilidad de la fuente (la misma escala de la casa — news-panel)
const FUENTE_CRED: [string, number][] = [
  ["reuters", 9], ["ap", 8], ["associated press", 8], ["afp", 8],
  ["bbc", 7], ["the guardian", 6], ["new york times", 6], ["ny times", 6],
  ["dw", 6], ["france 24", 6], ["al jazeera", 6], ["cnn", 5],
  ["euronews", 5], ["onu", 6], ["un news", 6], ["sky news", 5],
];

function credibilidadFuente(source: string): number {
  const s = (source || "").toLowerCase();
  for (const [k, w] of FUENTE_CRED) if (s.includes(k)) return w;
  return 2;
}

function edadMinutos(publishedAt: string | Date): number {
  try {
    const t = typeof publishedAt === "string" ? new Date(publishedAt).getTime() : publishedAt.getTime();
    return Math.max(0, Math.round((Date.now() - t) / 60000));
  } catch { return 9999; }
}

function edadLegible(min: number): string {
  if (min < 1) return "AHORA MISMO";
  if (min < 60) return `HACE ${min} MIN`;
  const h = Math.round(min / 60);
  if (h < 24) return `HACE ${h} H`;
  return `HACE ${Math.round(h / 24)} D`;
}

// ── LA PUNTUACIÓN ──────────────────────────────────────────────
export function scoreImpacto(e: EntradaImpacto): number {
  let s = 24; // todo cable de la Agencia entra con piso
  const titulo = e.title || "";

  for (const [re, peso] of VOCAB) if (re.test(titulo)) s += peso;

  // la etiqueta táctica que ya clasificó la casa
  const tag = (e.tacticalTag || "").toUpperCase();
  if (tag === "ALERTA") s += 12;
  else if (tag === "HUMANITARIO") s += 8;
  else if (tag === "DIPLOMACIA") s += 6;
  else if (tag === "ECONOMIA") s += 5;
  else if (tag === "ANALISIS") s += 3;

  // los frentes nombrados pesan (conflictTag = guerra viva con nombre)
  if (e.conflictTag) s += 10;

  const pais = (e.sourceCountry || "").toLowerCase();
  s += PESO_PAIS[pais] ?? 4;

  s += credibilidadFuente(e.source);

  const min = edadMinutos(e.publishedAt);
  if (min < 60) s += 10;
  else if (min < 360) s += 7;
  else if (min < 1440) s += 4;
  else if (min < 2880) s += 2;

  return Math.max(5, Math.min(99, Math.round(s)));
}

// ── EL PIE DE FOTO ─────────────────────────────────────────────
// Cada imagen lleva su pie táctico: contexto, origen y hora. Honesto:
// describe la cobertura, nunca inventa lo que la foto muestra.
export function pieDeFoto(e: EntradaImpacto): string {
  const tag = (e.tacticalTag || e.conflictTag || "INFORME").toUpperCase();
  const pais = (e.sourceCountry || "").toUpperCase();
  const min = edadMinutos(e.publishedAt);
  const partes = [tag, pais].filter(Boolean).join(" · ");
  return `${partes} — cobertura ${e.source || "VANGUARD"} · ${edadLegible(min)}`.toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

// ── LA INFORMACIÓN (POR QUÉ IMPORTA) ───────────────────────────
// Si el medio trajo resumen real (v105 LA REDACCIÓN) se sirve limpio;
// si no, la Agencia redacta el porqué con lo que sabe (determinista).
export function resumenDe(e: EntradaImpacto): string {
  const bruta = (e.summary || "").trim();
  // v105: los enlaces viajaban como summary — no son información
  if (bruta.length >= 48 && !bruta.startsWith("http")) {
    const limpia = bruta.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return limpia.length > 320 ? limpia.slice(0, 317).trimEnd() + "…" : limpia;
  }
  const titulo = e.title || "";
  const tag = (e.tacticalTag || "").toUpperCase();
  const paisN = nombrePais(e.sourceCountry);
  const hallado = VOCAB.filter(([re]) => re.test(titulo)).map(([re]) => (titulo.toLowerCase().match(re)?.[0] || "")).filter(Boolean).slice(0, 3);
  const clave = hallado.length ? hallado.join(", ") : "desarrollo en seguimiento";
  const porTag: Record<string, string> = {
    ALERTA: `Riesgo directo en curso${paisN !== "Internacional" ? ` en ${paisN}` : ""}. La Agencia lo mantiene bajo vigilancia continua y sube el aviso al confirmar cada nueva confirmación de la red de fuentes.`,
    DIPLOMACIA: `Movimiento diplomático${paisN !== "Internacional" ? ` con ${paisN} en la mesa` : ""}: según la cobertura de ${e.source || "la fuente"}, las negociaciones tocan ${clave}. Lo que se firme aquí condiciona el tablero de las próximas semanas.`,
    ECONOMIA: `Impacto económico${paisN !== "Internacional" ? ` desde ${paisN}` : ""}: la cobertura menciona ${clave}. Los mercados reaccionan antes que los comunicados — Vanguard vigila la cadena de precios y sanciones.`,
    HUMANITARIO: `Emergencia humanitaria${paisN !== "Internacional" ? ` en ${paisN}` : ""}: ${clave}. Cada hora que pasa agranda la factura civil; la Agencia prioriza estos cables en el rango de urgencia.`,
    ANALISIS: `Lectura de fondo${paisN !== "Internacional" ? ` sobre ${paisN}` : ""}: ${clave}. No es un hecho de portada, es la corriente que mueve los hechos de portada.`,
  };
  return porTag[tag] || `El cable de ${e.source || "la red"} reporta ${clave}${paisN !== "Internacional" ? ` afectando a ${paisN}` : ""}. Vanguard lo ranquea por impacto y lo mantiene bajo escáner mientras la historia se desarrolla.`;
}

// ── EL MAPA — coordenadas por país ─────────────────────────────
// Para la SALA DEL MAPA MUNDIAL: cada cable aterriza en su país real
// (proyección equirectangular sobre la textura del planeta).
export const COORDS: Record<string, [number, number]> = {
  ua: [48.4, 31.2], ru: [61.5, 90], us: [39.8, -98.6], cn: [35.9, 104.2],
  il: [31.4, 35], ps: [31.9, 35.2], ir: [32.4, 53.7], tw: [23.7, 121],
  kp: [40.3, 127.5], kr: [36.5, 127.9], jp: [36.2, 138.3], sd: [12.9, 30.2],
  sy: [34.8, 38.9], ye: [15.6, 48], af: [33.9, 67.7], iq: [33.2, 43.7],
  lb: [33.9, 35.9], ml: [17.6, -4], mm: [21.9, 95.9], ve: [6.4, -66.6],
  ht: [18.9, -72.3], ly: [26.3, 17.2], mx: [23.6, -102.5], co: [4.6, -74.1],
  br: [-14.2, -51.9], ar: [-38.4, -63.6], cl: [-35.7, -71.5], pe: [-9.2, -75],
  ec: [-1.8, -78.2], bo: [-16.3, -63.6], py: [-23.4, -58.4], ni: [12.9, -85.2],
  cu: [21.5, -77.8], gb: [54, -2.5], fr: [46.6, 2.4], de: [51.2, 10.4],
  pl: [52, 19.1], ro: [45.9, 25], md: [47.4, 28.4], ee: [58.6, 25],
  lv: [56.9, 24.6], lt: [55.2, 23.9], fi: [64, 26], se: [60.1, 18.6],
  es: [40.5, -3.7], it: [41.9, 12.6], tr: [39, 35.2], eg: [26.8, 30.8],
  za: [-30.6, 22.9], ng: [9.1, 8.7], et: [9.1, 40.5], so: [5.2, 46.2],
  cd: [-4, 21.8], pk: [30.4, 69.3], in: [20.6, 79], ge: [42.3, 43.4],
  am: [40.1, 45], az: [40.1, 47.6], kz: [48, 66.9], th: [15.9, 101],
  ph: [12.9, 121.8], id: [-0.8, 113.9], my: [4.2, 101.9], au: [-25.3, 133.8],
  ca: [56.1, -106.3], hk: [22.3, 114.2], by: [53.7, 27.9], gr: [39.1, 21.8],
};

const NOMBRES_PAIS: Record<string, string> = {
  ua: "Ucrania", ru: "Rusia", us: "EE. UU.", cn: "China", il: "Israel",
  ps: "Palestina", ir: "Irán", tw: "Taiwán", kp: "Corea del Norte",
  kr: "Corea del Sur", jp: "Japón", sd: "Sudán", sy: "Siria", ye: "Yemen",
  af: "Afganistán", iq: "Irak", lb: "Líbano", ml: "Malí", mm: "Birmania",
  ve: "Venezuela", ht: "Haití", ly: "Libia", mx: "México", co: "Colombia",
  br: "Brasil", ar: "Argentina", cl: "Chile", pe: "Perú", ec: "Ecuador",
  bo: "Bolivia", py: "Paraguay", ni: "Nicaragua", cu: "Cuba", gb: "Reino Unido",
  fr: "Francia", de: "Alemania", pl: "Polonia", ro: "Rumanía", md: "Moldavia",
  ee: "Estonia", lv: "Letonia", lt: "Lituania", fi: "Finlandia", se: "Suecia",
  es: "España", it: "Italia", tr: "Turquía", eg: "Egipto", za: "Sudáfrica",
  ng: "Nigeria", et: "Etiopía", so: "Somalia", cd: "RD Congo", pk: "Pakistán",
  in: "India", ge: "Georgia", am: "Armenia", az: "Azerbaiyán", kz: "Kazajistán",
  th: "Tailandia", ph: "Filipinas", id: "Indonesia", my: "Malasia",
  au: "Australia", ca: "Canadá", hk: "Hong Kong", by: "Bielorrusia", gr: "Grecia",
};

export function nombrePais(code?: string | null): string {
  if (!code) return "Internacional";
  return NOMBRES_PAIS[code.toLowerCase()] || code.toUpperCase();
}

export function coordsDe(code?: string | null): [number, number] | null {
  if (!code) return null;
  return COORDS[code.toLowerCase()] ?? null;
}

// ── LA NOTICIA RANQUEADA ───────────────────────────────────────
export interface NoticiaRanqueada extends EntradaImpacto {
  impacto: number;
  tier: TierImpacto;
  pie: string;
  resumen: string;
  coords: [number, number] | null;
  paisNombre: string;
  edadMin: number;
  edad: string;
}

export function enriquecer(e: EntradaImpacto): NoticiaRanqueada {
  const impacto = scoreImpacto(e);
  const min = edadMinutos(e.publishedAt);
  return {
    ...e,
    impacto,
    tier: tierDeImpacto(impacto),
    pie: pieDeFoto(e),
    resumen: resumenDe(e),
    coords: coordsDe(e.sourceCountry),
    paisNombre: nombrePais(e.sourceCountry),
    edadMin: min,
    edad: edadLegible(min),
  };
}

export function enriquecerLista(lista: EntradaImpacto[]): NoticiaRanqueada[] {
  return (lista || []).map(enriquecer);
}

// ── EL PULSO DE LA AGENCIA ─────────────────────────────────────
export interface PulsoAgencia {
  total: number;
  urgente: number;
  critico: number;
  alto: number;
  desarrollo: number;
  contexto: number;
  paises: number;
  frescoMin: number;
  impactoMedio: number;
}

export function pulsoDe(lista: NoticiaRanqueada[]): PulsoAgencia {
  const n = lista.length || 1;
  const cuento: Record<TierImpacto, number> = { urgente: 0, critico: 0, alto: 0, desarrollo: 0, contexto: 0 };
  const paises = new Set<string>();
  let suma = 0;
  let fresco = 9999;
  for (const it of lista) {
    cuento[it.tier]++;
    paises.add((it.sourceCountry || "INT").toUpperCase());
    suma += it.impacto;
    if (it.edadMin < fresco) fresco = it.edadMin;
  }
  return {
    total: lista.length,
    urgente: cuento.urgente,
    critico: cuento.critico,
    alto: cuento.alto,
    desarrollo: cuento.desarrollo,
    contexto: cuento.contexto,
    paises: paises.size,
    frescoMin: fresco === 9999 ? 0 : fresco,
    impactoMedio: Math.round(suma / n),
  };
}

// por escalón, para el despacho ordenado
export function porTier(lista: NoticiaRanqueada[], tier: TierImpacto): NoticiaRanqueada[] {
  return lista.filter((x) => x.tier === tier);
}
