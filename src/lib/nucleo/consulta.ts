// ============================================================
// v407.0 · LA CONSULTA ESTRUCTURADA — entender la pregunta antes de buscar
//
// La búsqueda del núcleo (v221) ya sabe partir una frase en términos y puntuar
// resultados. Lo que no hacía era INTERPRETAR: «¿qué pasa en Ucrania?» llegaba
// como tres palabras y perdía dos cosas que la casa sabe — que «Ucrania» es un
// país con ISO `ua` y ficha propia, y que «pasa» significa noticias.
//
// Este módulo NO sustituye a la búsqueda ni la toca: la alimenta. Devuelve una
// interpretación explícita (país, tipo de entidad, filtros, expansiones) que el
// endpoint /api/consulta usa y que cualquier módulo puede leer.
//
// ES DETERMINISTA Y SIN PROVEEDOR. No hay modelo de lenguaje detrás: hay reglas,
// el índice del nexo (108 países entre alias y gentilicios) y el censo. Si algún
// día hay proveedor configurado, este módulo seguirá siendo el suelo: lo que no
// se puede inventar, se decide con reglas y se declara.
// ============================================================

import { POR_ISO2, normalizar } from "@/lib/geo-paises";
import { TIPOS_ENTIDAD, type TipoEntidad } from "@/lib/nucleo/tipos";
import { paisesEnTexto, terminosDePais, contextoDePais } from "@/lib/nucleo/nexo";

/** Qué quiso decir la persona, en lenguaje de la casa. */
export interface Interpretacion {
  /** la pregunta tal cual llegó (recortada) */
  q: string;
  /** la pregunta normalizada (minúsculas, sin tildes) */
  normalizada: string;
  /** términos útiles para los proveedores de búsqueda */
  terminos: string[];
  /** el país del que habla, si lo dice */
  pais: { iso2: string; nombre: string; termino: string } | null;
  /** el tipo de entidad que pide, si lo dice */
  tipo: TipoEntidad | null;
  /** filtros reconocidos y declarados */
  filtros: { teatro: string | null; reciente: boolean };
  /** otras formas de escribir lo mismo (ISO, gentilicio, alias) */
  expansiones: string[];
  /** por qué se interpretó así (para que el usuario pueda corregir) */
  pistas: string[];
}

/** Palabras que significan «quiero noticias» (y su tipo de entidad). */
const INTENCION_TIPO: { palabras: string[]; tipo: TipoEntidad; pista: string }[] = [
  { palabras: ["noticia", "noticias", "cable", "cables", "ultima hora", "pasa", "pasando", "actualidad", "titular"], tipo: "noticia", pista: "«noticia» → tipo noticia" },
  { palabras: ["ficha", "pais", "paises", "geografia", "capital", "poblacion", "superficie", "frontera", "fronteras", "vecinos"], tipo: "pais", pista: "«ficha/país» → tipo país" },
  { palabras: ["acontecimiento", "acontecimientos", "conflicto", "guerra", "guerras", "frente", "cronologia"], tipo: "acontecimiento", pista: "«conflicto/guerra» → tipo acontecimiento" },
  { palabras: ["mapa", "mapas", "globo", "capas", "planeta"], tipo: "mapa", pista: "«mapa» → tipo mapa" },
  { palabras: ["simulacion", "simulador", "simular", "teatro", "escenario", "juego"], tipo: "simulacion", pista: "«simulador» → tipo simulación" },
  { palabras: ["documento", "documentos", "expediente", "archivo", "osint"], tipo: "documento", pista: "«expediente» → tipo documento" },
  { palabras: ["punto", "puntos", "ciudad", "ciudades", "bajmut", "frente"], tipo: "punto", pista: "«punto del frente» → tipo punto" },
];

/** Sinónimos de la casa que no son países (se expanden igual). */
const SINONIMOS: Record<string, string[]> = {
  eeuu: ["estados unidos", "usa"],
  "ee uu": ["estados unidos"],
  "reino unido": ["gran bretana", "uk"],
  onu: ["naciones unidas"],
  otan: ["otan", "nato"],
  ue: ["union europea"],
  opep: ["opep"],
  bm: ["banco mundial"],
  fmi: ["fondo monetario internacional"],
};

/** El teatro que nombra la pregunta, si nombra alguno (claves reales de la casa). */
const TEATROS_NOMBRADOS: { claves: string[]; tag: string }[] = [
  { claves: ["ucrania", "ukraine", "rusia", "donbas", "bajmut", "jersón", "jerson"], tag: "ukraine" },
  { claves: ["gaza", "israel", "palestina", "hamas", "cisjordania"], tag: "gaza" },
  { claves: ["libano", "beirut", "hezbola", "hezbollah"], tag: "lebanon" },
  { claves: ["ormuz", "golfo", "iran", "hormuz", "estrecho"], tag: "hormuz" },
  { claves: ["taiwan", "taiwán", "pacífico", "pacifica", "china"], tag: "taiwan" },
  { claves: ["sahel", "mali", "niger", "burkina"], tag: "sahel" },
  { claves: ["mar rojo", "redsea", "huties", "yemen"], tag: "redsea" },
  { claves: ["corea", "coreas", "pyongyang", "seul"], tag: "korea" },
  { claves: ["sudan", "sudán", "jartum", "darfur"], tag: "sudan" },
];

/**
 * Interpreta una pregunta en español. Nunca lanza: si no entiende nada, devuelve
 * la interpretación mínima (los términos tal cual) y lo dice en `pistas`.
 */
export function interpretarConsulta(crudo: string, limiteTerminos = 6): Interpretacion {
  const q = (crudo ?? "").toString().slice(0, 240).trim();
  const normalizada = normalizar(q);
  const pistas: string[] = [];

  // 1 · ¿de qué país habla?
  const mencion = paisesEnTexto(q, 1)[0] ?? null;
  const pais = mencion
    ? { iso2: mencion.iso2, nombre: mencion.nombre, termino: mencion.termino }
    : null;
  if (pais) pistas.push(`«${pais.termino}» → ${pais.nombre} (${pais.iso2.toUpperCase()})`);

  // 2 · ¿qué tipo de cosa pide?
  let tipo: TipoEntidad | null = null;
  for (const regla of INTENCION_TIPO) {
    if (regla.palabras.some((p) => contiene(normalizada, p))) {
      tipo = regla.tipo;
      pistas.push(regla.pista);
      break;
    }
  }
  // si nombra un país y no pide otra cosa, lo que quiere es su ficha
  if (!tipo && pais) {
    tipo = "pais";
    pistas.push("nombra un país sin pedir otra cosa → su ficha");
  }

  // 3 · ¿algún teatro?
  let teatro: string | null = null;
  for (const t of TEATROS_NOMBRADOS) {
    if (t.claves.some((c) => contiene(normalizada, c))) {
      teatro = t.tag;
      pistas.push(`teatro reconocido: ${t.tag}`);
      break;
    }
  }

  // 4 · ¿pide lo reciente?
  const reciente = ["hoy", "ahora", "ultima hora", "ultimas", "reciente", "24 h", "24h"].some((p) =>
    contiene(normalizada, p)
  );
  if (reciente) pistas.push("pide lo reciente → ventana de 24 h");

  // 5 · términos para los proveedores: la pregunta sin muletillas
  const muletillas = new Set([
    "que","quien","quienes","como","cuando","donde","por","para","el","la","los","las","un","una","unos","unas",
    "de","del","en","y","o","es","son","esta","estan","pasa","pasando","ultima","ultimas","hora","dime","muestra",
    "muestrame","busca","buscar","quiero","saber","sobre","con","sin","al","a",
  ]);
  const terminos = normalizada
    .split(" ")
    .filter((t) => t.length >= 2 && !muletillas.has(t))
    .slice(0, limiteTerminos);
  if (terminos.length === 0 && normalizada) terminos.push(normalizada.slice(0, 40));

  // 6 · expansiones: cómo se escribe lo mismo de otras formas
  const expansiones = new Set<string>();
  if (pais) {
    for (const t of terminosDePais(pais.iso2).slice(0, 8)) expansiones.add(t);
    const ctx = contextoDePais(pais.iso2);
    if (ctx) expansiones.add(ctx.nombre);
    expansiones.add(pais.iso2);
    const p = POR_ISO2.get(pais.iso2);
    if (p) expansiones.add(p.iso3.toLowerCase());
  }
  for (const t of terminos) {
    for (const sin of SINONIMOS[t] ?? []) expansiones.add(sin);
  }
  expansiones.delete(normalizada);
  if (expansiones.size > 0) pistas.push(`${expansiones.size} formas alternativas para buscar`);

  return {
    q,
    normalizada,
    terminos,
    pais,
    tipo,
    filtros: { teatro, reciente },
    expansiones: [...expansiones].slice(0, 12),
    pistas,
  };
}

/** Palabra completa dentro de una cadena normalizada (evita «iran» en «tirano»). */
function contiene(texto: string, palabra: string): boolean {
  if (!palabra) return false;
  const i = texto.indexOf(palabra);
  if (i === -1) return false;
  const antes = i === 0 ? " " : texto[i - 1];
  const despues = i + palabra.length >= texto.length ? " " : texto[i + palabra.length];
  return (antes === " " || antes === "") && (despues === " " || despues === "" || despues === "s");
}

/** El tipo de entidad pedido, validado contra la whitelist de la casa. */
export function tipoValido(t: string | null): TipoEntidad | null {
  if (!t) return null;
  return (TIPOS_ENTIDAD as readonly string[]).includes(t) ? (t as TipoEntidad) : null;
}
