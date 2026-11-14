// v400.0 EL REDISEÑO — clasificación de notas por región y por conflicto.
// Fuente única que comparten la portada (servidor), las historias (cliente)
// y la página de lectura. Sin dependencias: corre en ambos lados.

export type Region = "europa" | "oriente" | "americas" | "africa" | "asia" | "mundo";

export const REGIONES: Record<Region, { nombre: string; color: string; claves: string[] }> = {
  europa: {
    nombre: "Europa",
    color: "#5B8DEF",
    claves: [
      "ucrania", "ucraniano", "ucraniana", "rusia", "ruso", "rusa", "kiev", "kyiv", "moscu", "putin", "zelenski", "zelensky",
      "otan", "alemania", "aleman", "francia", "frances", "macron", "reino unido", "londres", "paris", "berlin",
      "italia", "roma", "polonia", "bruselas", "europa", "europeo", "europea", "union europea", "serbia", "hungria",
      "orban", "georgia", "moldavia", "bielorrusia", "lukashenko", "donbas", "crimea", "jarkov", "odesa", "starmer",
      "merz", "espana", "madrid", "portugal", "grecia", "rumania", "suecia", "finlandia", "noruega", "dinamarca",
      "paises bajos", "belgica", "austria", "suiza", "irlanda", "dublin", "kosovo", "bosnia", "balticos", "lituania",
      "letonia", "estonia",
    ],
  },
  oriente: {
    nombre: "Oriente Medio",
    color: "#F0A23B",
    claves: [
      "israel", "israeli", "gaza", "iran", "irani", "teheran", "libano", "hezbola", "hamas", "siria", "damasco",
      "irak", "bagdad", "yemen", "huties", "hutis", "arabia saudi", "arabia saudita", "riad", "qatar", "catar",
      "turquia", "erdogan", "cisjordania", "jerusalen", "tel aviv", "netanyahu", "emiratos", "dubai", "ormuz",
      "jordania", "kuwait", "oman", "palestina", "palestino", "palestinos", "beirut", "likud",
    ],
  },
  americas: {
    nombre: "Américas",
    color: "#3DD6A0",
    claves: [
      "eeuu", "ee uu", "estados unidos", "estadounidense", "trump", "washington", "casa blanca", "pentagono",
      "mexico", "mexicano", "sheinbaum", "venezuela", "venezolano", "maduro", "colombia", "petro", "cuba", "cubano",
      "haiti", "republica dominicana", "dominicana", "santo domingo", "brasil", "lula", "argentina", "milei",
      "chile", "peru", "ecuador", "bolivia", "nicaragua", "ortega", "honduras", "guatemala", "el salvador", "bukele",
      "panama", "costa rica", "canada", "america latina", "latinoamerica", "caribe", "puerto rico", "nueva york",
      "uruguay", "paraguay",
    ],
  },
  africa: {
    nombre: "África",
    color: "#E8664A",
    claves: [
      "sudan", "jartum", "darfur", "sahel", "mali", "niger", "burkina", "congo", "kinshasa", "etiopia", "somalia",
      "nigeria", "libia", "egipto", "cairo", "sudafrica", "kenia", "africa", "africano", "mozambique", "chad",
      "ruanda", "argelia", "marruecos", "tunez", "senegal", "camerun", "uganda", "tanzania", "angola", "eritrea",
    ],
  },
  asia: {
    nombre: "Asia y Pacífico",
    color: "#B07CF0",
    claves: [
      "china", "chino", "china", "pekin", "beijing", "xi jinping", "taiwan", "japon", "tokio", "corea", "pyongyang",
      "kim jong", "seul", "india", "modi", "pakistan", "afganistan", "talibanes", "filipinas", "birmania", "myanmar",
      "indonesia", "tailandia", "vietnam", "australia", "camboya", "bangladesh", "nepal", "sri lanka", "hong kong",
      "malasia", "singapur", "kazajistan", "mongolia", "nueva zelanda",
    ],
  },
  mundo: { nombre: "Mundo", color: "#8A94A7", claves: [] },
};

export type Conflicto = {
  key: string;
  nombre: string;
  region: Region;
  coords: [number, number]; // [lat, lng]
  claves: string[];
  teatro?: string; // sala /conflicto/[tag] de la casa, si existe
};

// Los frentes que siguen las "historias" y el mapa de la portada.
export const CONFLICTOS: Conflicto[] = [
  { key: "ucrania", nombre: "Ucrania", region: "europa", coords: [49, 32], claves: ["ucrania", "ucraniano", "ucraniana", "kiev", "kyiv", "zelenski", "zelensky", "donbas", "crimea", "jarkov", "odesa", "putin", "kremlin"], teatro: "ukraine" },
  { key: "gaza", nombre: "Gaza", region: "oriente", coords: [31.4, 34.4], claves: ["gaza", "hamas", "cisjordania", "palestina", "palestino", "palestinos", "netanyahu", "rehenes", "israel", "israeli"], teatro: "gaza" },
  { key: "iran", nombre: "Irán", region: "oriente", coords: [32.4, 53.7], claves: ["iran", "irani", "teheran", "ormuz", "jamenei"], teatro: "hormuz" },
  { key: "libano", nombre: "Líbano", region: "oriente", coords: [33.9, 35.8], claves: ["libano", "hezbola", "beirut"], teatro: "lebanon" },
  { key: "siria", nombre: "Siria", region: "oriente", coords: [35, 38.5], claves: ["siria", "damasco", "alepo"] },
  { key: "yemen", nombre: "Mar Rojo", region: "oriente", coords: [15.5, 44], claves: ["yemen", "huties", "hutis", "mar rojo"], teatro: "redsea" },
  { key: "sudan", nombre: "Sudán", region: "africa", coords: [15.5, 30], claves: ["sudan", "jartum", "darfur", "el fasher"], teatro: "sudan" },
  { key: "sahel", nombre: "Sahel", region: "africa", coords: [15, 0], claves: ["sahel", "mali", "niger", "burkina"], teatro: "sahel" },
  { key: "congo", nombre: "Congo", region: "africa", coords: [-2.5, 28.8], claves: ["congo", "goma", "kinshasa", "m23"] },
  { key: "taiwan", nombre: "Taiwán", region: "asia", coords: [23.7, 121], claves: ["taiwan", "taipei", "estrecho de taiwan"], teatro: "taiwan" },
  { key: "corea", nombre: "Corea", region: "asia", coords: [39, 126], claves: ["corea del norte", "pyongyang", "kim jong"], teatro: "korea" },
  { key: "venezuela", nombre: "Venezuela", region: "americas", coords: [7, -66], claves: ["venezuela", "venezolano", "maduro", "caracas"] },
  { key: "haiti", nombre: "Haití", region: "americas", coords: [19, -72.5], claves: ["haiti", "haitiano", "puerto principe"] },
  { key: "mexico", nombre: "México", region: "americas", coords: [23.6, -102.5], claves: ["cartel", "carteles", "narcotrafico", "sinaloa", "sheinbaum"] },
];

export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function contiene(textoNorm: string, clave: string): boolean {
  // límites de palabra simples sobre texto ya normalizado
  return (" " + textoNorm + " ").includes(" " + clave + " ");
}

export function regionDe(texto: string): Region {
  const t = normalizar(texto);
  let mejor: Region = "mundo";
  let puntos = 0;
  (Object.keys(REGIONES) as Region[]).forEach((r) => {
    if (r === "mundo") return;
    let n = 0;
    for (const c of REGIONES[r].claves) if (contiene(t, c)) n++;
    if (n > puntos) {
      puntos = n;
      mejor = r;
    }
  });
  return mejor;
}

export function conflictoDe(texto: string): Conflicto | null {
  const t = normalizar(texto);
  let mejor: Conflicto | null = null;
  let puntos = 0;
  for (const c of CONFLICTOS) {
    let n = 0;
    for (const k of c.claves) if (contiene(t, k)) n++;
    if (n > puntos) {
      puntos = n;
      mejor = c;
    }
  }
  return mejor;
}

export function conflictoPorKey(key: string | null | undefined): Conflicto | null {
  if (!key) return null;
  return CONFLICTOS.find((c) => c.key === key) ?? null;
}

/** "hace 5 min", "hace 3 h", "hace 2 d" */
export function haceTexto(iso: string, ahora = Date.now()): string {
  const ms = ahora - new Date(iso).getTime();
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} d`;
}

export function horaCorta(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Santo_Domingo",
    });
  } catch {
    return "";
  }
}

/** minutos de lectura estimados a partir del texto disponible */
export function minutosLectura(texto: string): number {
  const palabras = texto.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200) + 1);
}
