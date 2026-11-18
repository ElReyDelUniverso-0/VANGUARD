// ============================================================
// v405.16 · EL NEXO — de un titular a un país, y de un país a la casa entera
//
// EL AGUJERO QUE TAPA, medido en la casa publicada: un cable de la redacción
// sabía a qué TEATRO pertenecía (`conflictTag`) pero no de qué PAÍS hablaba. El
// resultado: 249 fichas de país recién construidas (/mundos/<iso>) que no
// recibían ni una visita desde las noticias, y noticias que no llevaban a
// ninguna ficha. Dos mundos completos, sin puerta entre ellos.
//
// Este módulo es el puente, y solo hace dos cosas:
//   ①  `paisesEnTexto()` — lee CUALQUIER texto (un titular, un resumen, una nota
//       de la casa) y devuelve los países que menciona, con el término exacto
//       que los delató y su posición. Con eso el enlace no es una suposición:
//       se puede escribir «el titular dice “ecuatorianos”».
//   ②  `enlacesDePaisEnTexto()` / `contextoDePais()` — convierten eso en puertas
//       REALES de la casa: la ficha del país, el mapa, el simulador con sus
//       coordenadas y la búsqueda del núcleo.
//
// REGLAS (las mismas de la casa):
//   · Cero datos inventados: los nombres salen de `geo-paises.ts` (ISO 3166-1),
//     no de una lista escrita aquí. Lo único curado a mano son los ALIAS y los
//     GENTILICIOS, que son hechos del idioma y no cifras del planeta.
//   · Cero falsos positivos por palabras que también son otra cosa: los nombres
//     ambiguos («Chad», «Georgia», «Congo», «Corea», «Guinea») SOLO cuentan
//     cuando aparecen dentro de un nombre completo («Corea del Sur»).
//   · Puro y determinista: sin red, sin BD, sin reloj. Se puede probar.
// ============================================================

import { POR_ISO2, normalizar, type PaisGeo } from "@/lib/geo-paises";
import type { EnlaceContextual } from "@/lib/nucleo/tipos";

/** Un país mencionado en un texto: cuál, con qué palabra y dónde. */
export interface PaisMencionado {
  /** ISO 3166-1 alfa-2 en minúsculas (la clave de la ficha /mundos/<iso>) */
  iso2: string;
  nombre: string;
  /** el término exacto del texto que lo delató, normalizado («ecuatorianos») */
  termino: string;
  /** posición del primer token del término dentro del texto normalizado */
  desde: number;
}

// ── NOMBRES AMBIGUOS ──────────────────────────────────────────────
// Palabras que son país y también otra cosa. Nunca se aceptan solas: si el
// texto dice «Chad» puede ser un nombre de persona; si dice «Chad del Sur» no
// existe, pero «Corea del Sur» sí — por eso los nombres completos siguen
// funcionando (se buscan como n-gramas de dos y tres palabras).
const AMBIGUOS = new Set(["chad", "georgia", "congo", "corea", "guinea", "samoa", "malta"]);

// ── ALIAS ─────────────────────────────────────────────────────────
// Cómo se llama a un país sin decir su nombre oficial. Solo los que la prensa
// en español usa de verdad y que no se confunden con otra cosa.
const ALIAS: Record<string, string[]> = {
  us: ["ee uu", "eeuu", "estados unidos", "usa", "union americana"],
  gb: ["reino unido", "gran bretana", "uk"],
  kr: ["corea del sur", "surcorea", "republica de corea"],
  kp: ["corea del norte", "norcorea"],
  cd: ["republica democratica del congo", "congo kinshasa"],
  cg: ["republica del congo", "congo brazzaville"],
  ru: ["federacion rusa"],
  ir: ["republica islamica de iran"],
  nl: ["paises bajos", "holanda"],
  cz: ["republica checa", "chequia"],
  mm: ["myanmar"],
  tl: ["timor oriental", "timor leste"],
  sz: ["esuatini", "suazilandia"],
  mk: ["macedonia del norte"],
  ba: ["bosnia y herzegovina", "bosnia"],
  ae: ["emiratos arabes unidos", "emiratos"],
  va: ["santa sede", "vaticano"],
  ps: ["autoridad palestina", "palestina"],
  ci: ["costa de marfil"],
  tr: ["turkiye"],
  cf: ["republica centroafricana"],
  do: ["republica dominicana"],
};

// ── GENTILICIOS ───────────────────────────────────────────────────
// El titular casi nunca dice «Ecuador»: dice «pescadores ecuatorianos». Esta
// tabla (hechos del idioma, no cifras) es la que convierte un gentilicio en un
// país. Se declara limitada: cubre los gentilicios que la casa usa en sus
// cables; no es un diccionario exhaustivo.
const GENTILICIOS: Record<string, string[]> = {
  af: ["afgano", "afgana"],
  al: ["albanes", "albanesa"],
  de: ["aleman", "alemana"],
  ao: ["angoleno", "angoleno"],
  sa: ["saudi", "saudies"],
  ar: ["argentino", "argentina"],
  am: ["armenio", "armenia"],
  au: ["australiano", "australiana"],
  at: ["austriaco", "austriaca"],
  az: ["azerbaiyano", "azeri"],
  bd: ["bangladesi"],
  be: ["belga"],
  by: ["bielorruso", "bielorrusa"],
  bo: ["boliviano", "boliviana"],
  ba: ["bosnio", "bosnia"],
  br: ["brasileno", "brasilena"],
  bg: ["bulgaro", "bulgara"],
  ca: ["canadiense"],
  cl: ["chileno", "chilena"],
  cn: ["chino", "china"],
  co: ["colombiano", "colombiana"],
  kp: ["norcoreano", "norcoreana"],
  kr: ["surcoreano", "surcoreana", "coreano", "coreana"],
  cr: ["costarricense"],
  hr: ["croata"],
  cu: ["cubano", "cubana"],
  dk: ["danes", "danesa"],
  ec: ["ecuatoriano", "ecuatoriana"],
  eg: ["egipcio", "egipcia"],
  ae: ["emirati"],
  sk: ["eslovaco", "eslovaca"],
  si: ["esloveno", "eslovena"],
  es: ["espanol", "espanola"],
  us: ["estadounidense", "norteamericano", "norteamericana"],
  ee: ["estonio", "estonia"],
  et: ["etiope"],
  ph: ["filipino", "filipina"],
  fi: ["finlandes", "finlandesa"],
  fr: ["frances", "francesa"],
  ge: ["georgiano", "georgiana"],
  gr: ["griego", "griega"],
  gt: ["guatemalteco", "guatemalteca"],
  ht: ["haitiano", "haitiana"],
  hn: ["hondureno", "hondurena"],
  hu: ["hungaro", "hungara"],
  in: ["indio", "india", "hindues"],
  id: ["indonesio", "indonesia"],
  iq: ["iraqui", "iraquies"],
  ir: ["irani", "iranies"],
  ie: ["irlandes", "irlandesa"],
  il: ["israeli", "israelies"],
  it: ["italiano", "italiana"],
  jp: ["japones", "japonesa"],
  jo: ["jordano", "jordana"],
  kz: ["kazajo", "kazaja"],
  ke: ["keniano", "keniata"],
  kw: ["kuwaiti"],
  lv: ["leton", "letona"],
  lb: ["libanes", "libanesa"],
  ly: ["libio", "libia"],
  lt: ["lituano", "lituana"],
  ma: ["marroqui", "marroquies"],
  mx: ["mexicano", "mexicana"],
  md: ["moldavo", "moldava"],
  mn: ["mongol", "mongola"],
  me: ["montenegrino"],
  ni: ["nicaraguense"],
  ng: ["nigeriano", "nigeriana"],
  no: ["noruego", "noruega"],
  nz: ["neozelandes", "neozelandesa"],
  nl: ["holandes", "holandesa", "neerlandes"],
  pk: ["paquistani", "pakistani"],
  pa: ["panameno", "panamena"],
  py: ["paraguayo", "paraguaya"],
  pe: ["peruano", "peruana"],
  pl: ["polaco", "polaca"],
  pt: ["portugues", "portuguesa"],
  gb: ["britanico", "britanica"],
  do: ["dominicano", "dominicana"],
  cz: ["checo", "checa"],
  ro: ["rumano", "rumana"],
  ru: ["ruso", "rusa"],
  sv: ["salvadoreno", "salvadorena"],
  rs: ["serbio", "serbia"],
  sy: ["sirio", "siria"],
  za: ["sudafricano", "sudafricana"],
  sd: ["sudanes", "sudanesa"],
  se: ["sueco", "sueca"],
  ch: ["suizo", "suiza"],
  th: ["tailandes", "tailandesa"],
  tw: ["taiwanes", "taiwanesa"],
  tn: ["tunecino", "tunecina"],
  tr: ["turco", "turca"],
  ua: ["ucraniano", "ucraniana"],
  uy: ["uruguayo", "uruguaya"],
  ve: ["venezolano", "venezolana"],
  vn: ["vietnamita"],
  ye: ["yemeni", "yemenies"],
};

// ── EL ÍNDICE (se construye una vez) ──────────────────────────────
let CACHE: Map<string, string> | null = null;

/**
 * El plural de un término, en las tres formas del español: vocal → +s,
 * consonante → +es, z → ces. Se aplica a la ÚLTIMA palabra («emiratos árabes
 * unidos» → «… unidos», que ya es plural y no cambia).
 *
 * Existe porque el titular no dice «ucraniano», dice «drones ucranianos»: la
 * primera versión de este módulo se quedó en el singular y la prueba en vivo lo
 * cazó con un cable real («VIDEO: Drones rusos destruyen… ucranianos»).
 */
function pluralDe(clave: string): string | null {
  const partes = clave.split(" ");
  const ult = partes[partes.length - 1];
  if (ult.length < 3) return null;
  const cierre = ult.slice(-1);
  let plural: string;
  if ("aeiouáéíóú".includes(cierre)) plural = ult + "s";
  else if (cierre === "z") plural = ult.slice(0, -1) + "ces";
  else if (/[a-zñ]/.test(cierre)) plural = ult + "es";
  else return null;
  if (plural === ult) return null;
  return [...partes.slice(0, -1), plural].join(" ");
}

function poner(mapa: Map<string, string>, termino: string, iso2: string) {
  const clave = normalizar(termino);
  if (!clave) return;
  if (AMBIGUOS.has(clave)) return; // sola no vale; los nombres completos van por n-grama
  if (!POR_ISO2.has(iso2)) return; // jamás un país que la casa no conoce
  if (!mapa.has(clave)) mapa.set(clave, iso2);
  // v406.4b: el plural también es el país («ucranianos», «rusos», «franceses»)
  const plural = pluralDe(clave);
  if (plural && !mapa.has(plural)) mapa.set(plural, iso2);
}

function indice(): Map<string, string> {
  if (CACHE) return CACHE;
  const mapa = new Map<string, string>();
  for (const p of POR_ISO2.values()) poner(mapa, p.nombre, p.iso2);
  for (const [iso2, alias] of Object.entries(ALIAS)) {
    for (const a of alias) poner(mapa, a, iso2);
  }
  for (const [iso2, g] of Object.entries(GENTILICIOS)) {
    for (const t of g) poner(mapa, t, iso2);
  }
  CACHE = mapa;
  return mapa;
}

/** Cuántos términos conoce el nexo (para la sala /nucleo y las pruebas). */
export function tamanoIndice(): number {
  return indice().size;
}

/** Todos los términos que apuntan a un país (para depurar y para probar). */
export function terminosDePais(iso2: string): string[] {
  const objetivo = iso2.toLowerCase();
  return [...indice().entries()].filter(([, v]) => v === objetivo).map(([k]) => k).sort();
}

/**
 * Lee un texto y devuelve los países que menciona, en orden de aparición.
 * Los términos más largos ganan: «corea del sur» antes que «corea» — y «corea»
 * sola no cuenta nunca (es ambigua).
 */
export function paisesEnTexto(texto: string, limite = 4): PaisMencionado[] {
  if (!texto) return [];
  const norm = normalizar(texto);
  if (!norm) return [];
  const tokens = norm.split(" ");
  const mapa = indice();
  const hallados = new Map<string, PaisMencionado>();
  for (let i = 0; i < tokens.length; i++) {
    for (const n of [3, 2, 1]) {
      if (i + n > tokens.length) continue;
      const gramo = tokens.slice(i, i + n).join(" ");
      const iso2 = mapa.get(gramo);
      if (!iso2 || hallados.has(iso2)) continue;
      const pais: PaisGeo | undefined = POR_ISO2.get(iso2);
      hallados.set(iso2, {
        iso2,
        nombre: pais ? pais.nombre : iso2.toUpperCase(),
        termino: gramo,
        desde: i,
      });
    }
  }
  return [...hallados.values()].sort((a, b) => a.desde - b.desde).slice(0, limite);
}

/** ¿De qué país habla este texto? El primero, si hay alguno. */
export function paisDeTexto(texto: string): PaisMencionado | null {
  return paisesEnTexto(texto, 1)[0] ?? null;
}

/**
 * El país más cercano a una coordenada, por el centro que declara `geo-paises`.
 * Se declara lo que es: una APROXIMACIÓN por distancia al centro del país, no
 * una frontera oficial. Sirve para etiquetar un punto del mapa, no para juzgar
 * soberanía.
 */
export function paisDeCoordenada(lat: number, lng: number): PaisGeo | null {
  let mejor: PaisGeo | null = null;
  let mejorKm = Infinity;
  const RAD = Math.PI / 180;
  for (const p of POR_ISO2.values()) {
    const dLat = (p.lat - lat) * RAD;
    const dLng = (p.lng - lng) * RAD;
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat * RAD) * Math.cos(p.lat * RAD) * Math.sin(dLng / 2) ** 2;
    const km = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(s)));
    if (km < mejorKm) {
      mejorKm = km;
      mejor = p;
    }
  }
  return mejor;
}

// ── LAS PUERTAS ───────────────────────────────────────────────────

/** La región del censo viene en inglés (es el campo de Natural Earth); la casa habla español. */
const REGION_ES: Record<string, string> = {
  Europe: "Europa",
  Asia: "Asia",
  Africa: "África",
  Americas: "América",
  Oceania: "Oceanía",
  Antarctic: "Antártida",
};

export function regionEnEspanol(region: string): string {
  return REGION_ES[region] ?? region;
}

/** Las puertas reales de un país, con la ruta que YA existe en la casa. */
export interface ContextoPais {
  iso2: string;
  nombre: string;
  region: string;
  lat: number;
  lng: number;
  puertas: { clave: string; etiqueta: string; ruta: string; motivo: string }[];
}

function codificar(s: string): string {
  return encodeURIComponent(s);
}

/** El contexto completo de un país: sus cuatro puertas de siempre. */
export function contextoDePais(iso2: string): ContextoPais | null {
  const p = POR_ISO2.get(iso2.toLowerCase());
  if (!p) return null;
  return {
    iso2: p.iso2,
    nombre: p.nombre,
    region: regionEnEspanol(p.region),
    lat: p.lat,
    lng: p.lng,
    puertas: [
      {
        clave: "ficha",
        etiqueta: `LA FICHA DE ${p.nombre.toUpperCase()} ▸`,
        ruta: `/mundos/${p.iso2}`,
        motivo: "Geografía, economía, política, cultura, historia y fronteras en una sola ficha",
      },
      {
        clave: "mapa",
        etiqueta: "EL MAPA DE LOS MUNDOS ▸",
        ruta: "/mundos",
        motivo: "El país con su polígono real, sus fronteras y su macroterritorio",
      },
      {
        clave: "simular",
        etiqueta: "SIMULAR AQUÍ ▸",
        ruta: `/teatro-3d?lat=${p.lat}&lng=${p.lng}&nombre=${codificar(p.nombre)}`,
        motivo: "Abre el teatro táctico en las coordenadas reales del país",
      },
      {
        clave: "buscar",
        etiqueta: `BUSCAR «${p.nombre}» ▸`,
        ruta: `/nucleo?q=${codificar(p.nombre)}`,
        motivo: "Todo lo que la casa tiene de este país: cables, entidades y módulos",
      },
    ],
  };
}

/**
 * Chips «de este texto a sus países»: lo que montan las noticias para dejar de
 * ser un callejón sin salida.
 */
export function enlacesDePaisEnTexto(texto: string, limite = 3): EnlaceContextual[] {
  const paises = paisesEnTexto(texto, limite);
  const enlaces: EnlaceContextual[] = [];
  for (const p of paises) {
    enlaces.push({
      etiqueta: `LA FICHA DE ${p.nombre.toUpperCase()} ▸`,
      ruta: `/mundos/${p.iso2}`,
      motivo: `El texto dice «${p.termino}»: ${p.nombre} tiene ficha propia (geografía, economía, política e historia)`,
      tipoRelacion: "implica_pais",
    });
  }
  if (paises.length > 0) {
    enlaces.push({
      etiqueta: `BUSCAR «${paises[0].nombre}» ▸`,
      ruta: `/nucleo?q=${codificar(paises[0].nombre)}`,
      motivo: "Todos los cables y entidades de la casa sobre este país",
      tipoRelacion: "fuente_de",
    });
  }
  return enlaces;
}

/**
 * Chips de un país hacia la redacción: el camino de vuelta. Se usa en la ficha
 * del país para que el lector sepa qué se está publicando AHORA sobre él.
 */
export function enlacesDePaisARedaccion(iso2: string): EnlaceContextual[] {
  const p = POR_ISO2.get(iso2.toLowerCase());
  if (!p) return [];
  return [
    {
      etiqueta: "ÚLTIMA HORA ▸",
      ruta: "/en-vivo",
      motivo: `La redacción abierta 24 h: lo último del planeta, ${p.nombre} incluido`,
      tipoRelacion: "pertenece_a",
    },
    {
      etiqueta: "EL ARCHIVO MUNDIAL ▸",
      ruta: "/archivo-mundial",
      motivo: `Lo publicado sobre ${p.nombre} y su región, ordenado por geografía`,
      tipoRelacion: "documenta",
    },
    {
      etiqueta: `BUSCAR «${p.nombre}» EN EL NÚCLEO ▸`,
      ruta: `/nucleo?q=${encodeURIComponent(p.nombre)}`,
      motivo: "Búsqueda global: cables, acontecimientos, entidades y módulos",
      tipoRelacion: "fuente_de",
    },
  ];
}
