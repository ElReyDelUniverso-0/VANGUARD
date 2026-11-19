// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — vocabulario común (cliente y servidor).
// Sin datos pesados: etiquetas en español, rutas y colores. Los datos
// viven en src/lib/lingua/datos/*.json y solo los lee servidor.ts.
// ═══════════════════════════════════════════════════════════════════

export const BASE_LINGUA = "/lingua";

export const RUTAS_LINGUA = {
  inicio: "/lingua",
  idiomas: "/lingua/idiomas",
  familias: "/lingua/familias",
  escrituras: "/lingua/escrituras",
  comparar: "/lingua/escrituras/comparar",
  alfabetos: "/lingua/alfabetos",
  diccionario: "/lingua/diccionario",
  comparador: "/lingua/comparador",
  expresiones: "/lingua/expresiones",
  pronunciacion: "/lingua/pronunciacion",
  peligro: "/lingua/peligro",
  regiones: "/lingua/regiones",
  mapa: "/lingua/mapa",
  traductor: "/lingua/traductor",
  conceptos: "/lingua/conceptos",
} as const;

export const rutaIdioma = (id: string) => `/lingua/idioma/${id}`;
export const rutaFamilia = (id: string) => `/lingua/familias/${id}`;
export const rutaEscritura = (code: string) => `/lingua/escrituras/${code}`;
export const rutaExpresion = (id: string) => `/lingua/expresiones/${id}`;
export const rutaPais = (iso2: string) => `/lingua/regiones/${iso2.toLowerCase()}`;

/** macroáreas de Glottolog (índice = posición en lenguas.json → macroareas) */
export const MACROAREAS_ES: Record<string, string> = {
  Africa: "África",
  Eurasia: "Eurasia",
  Papunesia: "Papunesia",
  Australia: "Australia",
  "North America": "Norteamérica",
  "South America": "Sudamérica",
};

export const NOTA_MACROAREAS =
  "Glottolog divide el mundo en seis macroáreas lingüísticas de tamaño parecido. Papunesia agrupa Nueva Guinea, las islas del Pacífico y el sudeste asiático insular; Norteamérica incluye Mesoamérica y el Caribe.";

/** categorías de Glottolog para el nivel «lengua» */
export const CATEGORIAS_ES: Record<string, { nombre: string; nota: string }> = {
  Spoken_L1_Language: { nombre: "Lengua hablada", nota: "Lengua oral transmitida como lengua materna." },
  Sign_Language: { nombre: "Lengua de señas", nota: "Lengua visual-gestual con gramática propia; no deriva de la lengua oral del país." },
  Pidgin: { nombre: "Pidgin", nota: "Lengua de contacto sin hablantes nativos, surgida para comunicarse entre grupos sin lengua común." },
  Mixed_Language: { nombre: "Lengua mixta", nota: "Lengua nacida de la fusión de dos lenguas, con gramática y léxico de orígenes distintos." },
  Artificial_Language: { nombre: "Lengua construida", nota: "Diseñada conscientemente (por ejemplo, el esperanto)." },
  Speech_Register: { nombre: "Registro de habla", nota: "Variedad especial de uso restringido (ritual, de evitación, de caza…)." },
  Unattested: { nombre: "No atestiguada", nota: "Consta su existencia, pero no se conservan datos lingüísticos." },
  Unclassifiable: { nombre: "Inclasificable", nota: "Con datos tan escasos que no se puede asignar a una familia." },
};

/** estado de amenaza agregado (AES) de Glottolog, de menor a mayor */
export const AES_ES: { clave: string; nombre: string; nota: string; color: string }[] = [
  { clave: "not_endangered", nombre: "No amenazada", nota: "Transmisión normal a los niños.", color: "#5eead4" },
  { clave: "threatened", nombre: "Amenazada", nota: "Todavía la aprenden niños, pero con señales de presión.", color: "#a3e635" },
  { clave: "shifting", nombre: "En retroceso", nota: "La generación joven ya cambia a otra lengua.", color: "#facc15" },
  { clave: "moribund", nombre: "Moribunda", nota: "Solo la hablan adultos mayores; ya no se transmite.", color: "#fb923c" },
  { clave: "nearly_extinct", nombre: "Casi extinta", nota: "Quedan unos pocos hablantes, casi todos ancianos.", color: "#f87171" },
  { clave: "extinct", nombre: "Extinta", nota: "Sin hablantes; puede sobrevivir en textos o en usos rituales.", color: "#94a3b8" },
];
export const AES_SIN_DATO = { nombre: "Sin evaluación", color: "#475569" };

/** descripción más extensa disponible (MED) */
export const MED_ES: Record<string, string> = {
  long_grammar: "Gramática extensa",
  grammar: "Gramática",
  grammar_sketch: "Esbozo gramatical",
  phonology_or_text: "Fonología o textos",
  wordlist_or_less: "Lista de palabras o menos",
};

export const TIPOS_ESCRITURA: Record<string, { nombre: string; nota: string }> = {
  alfabeto: { nombre: "Alfabeto", nota: "Signos para consonantes y vocales por igual." },
  abyad: { nombre: "Abyad", nota: "Signos para consonantes; las vocales se omiten o se marcan con diacríticos opcionales." },
  abugida: { nombre: "Abugida (alfasilabario)", nota: "Cada signo es una consonante con vocal inherente, que se modifica con marcas." },
  silabario: { nombre: "Silabario", nota: "Cada signo representa una sílaba." },
  rasgos: { nombre: "Escritura de rasgos", nota: "La forma de las letras refleja rasgos articulatorios; se agrupan en bloques silábicos." },
  logográfica: { nombre: "Logográfica", nota: "Signos que representan palabras o morfemas, combinados con componentes fonéticos." },
  logosilábica: { nombre: "Logosilábica", nota: "Combina logogramas con signos silábicos." },
};

export const DIRECCIONES: Record<string, string> = {
  ltr: "de izquierda a derecha",
  rtl: "de derecha a izquierda",
  ttb: "de arriba abajo",
  mixta: "variable",
};

/** nombres en español de las grandes familias (Glottolog las nombra en inglés) */
export function etiquetaAes(i: number): { nombre: string; color: string; clave: string } {
  const a = AES_ES[i];
  return a ? { nombre: a.nombre, color: a.color, clave: a.clave } : { ...AES_SIN_DATO, clave: "none" };
}

export function formatoNumero(n: number): string {
  return n.toLocaleString("es-ES");
}

export function formatoPoblacion(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 2 })} mil millones`;
  if (n >= 1e6) return `${(n / 1e6).toLocaleString("es-ES", { maximumFractionDigits: n >= 1e8 ? 0 : 1 })} millones`;
  if (n >= 1e3) return `${Math.round(n / 1e3).toLocaleString("es-ES")} mil`;
  return n.toLocaleString("es-ES");
}

/** normaliza para buscar: minúsculas, sin tildes ni signos */
export function normalizarLingua(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export const FUENTES_LINGUA = {
  glottolog: {
    nombre: "Glottolog 5.4",
    url: "https://glottolog.org/",
    cita: "Hammarström, Harald; Forkel, Robert; Haspelmath, Martin & Bank, Sebastian. 2025. Glottolog 5.4. Leipzig: Max Planck Institute for Evolutionary Anthropology. doi:10.5281/zenodo.15640174 · CC BY 4.0",
  },
  iso: { nombre: "ISO 639-3 (SIL International)", url: "https://iso639-3.sil.org/" },
  cldr: { nombre: "Unicode CLDR 49", url: "https://cldr.unicode.org/" },
  wikcionario: { nombre: "Wikcionario", url: "https://es.wiktionary.org/", licencia: "CC BY-SA 4.0" },
  wiktionary: { nombre: "Wiktionary (inglés)", url: "https://en.wiktionary.org/", licencia: "CC BY-SA 4.0" },
  commons: { nombre: "Wikimedia Commons", url: "https://commons.wikimedia.org/" },
  unicode: { nombre: "Unicode 15.1 · Character Database", url: "https://www.unicode.org/ucd/" },
  mymemory: { nombre: "MyMemory (Translated)", url: "https://mymemory.translated.net/" },
  ethnologue: { nombre: "Ethnologue 2025", url: "https://www.ethnologue.com/" },
};
