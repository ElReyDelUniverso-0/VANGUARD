// ═══════════════════════════════════════════════════════════════════
// v422.3 RADIO VANGUARD · LA CONVERSACIÓN — entender la pregunta y
// contestar con lo que hay de verdad en el archivo.
//
// QUÉ HACE: `responder(pregunta, notas)` devuelve una frase que se puede
// decir en voz alta, las notas en las que se apoya y —si no se encontró
// nada— la verdad («no tengo un cable sobre eso»). Sin modelo de lenguaje:
// es un intérprete de intenciones + búsqueda real sobre los cables del día.
//
// POR QUÉ ASÍ: el Dueño pidió una voz «que entienda todo». Prometer
// comprensión total sin un proveedor de modelo sería mentir. Esto entiende
// lo que puede demostrar: saludo, resumen del día, un tema concreto, una
// región, una fuente, la hora y «algo bueno». Cuando no entiende, lo dice y
// ofrece lo que sí tiene. La casa no finge.
//
// Sin DOM, sin red: prueba unitaria en scripts/pruebas-radio.mjs.
// ═══════════════════════════════════════════════════════════════════

import type { Nota } from "@/lib/portada/notas";
import { haceLegible, recortarPorFrase } from "./guion";

export type Intencion =
  | "saludo"
  | "resumen"
  | "tema"
  | "region"
  | "fuente"
  | "hora"
  | "buenas"
  | "ayuda"
  | "silencio"
  | "desconocida";

export type Interpretacion = {
  intencion: Intencion;
  /** el término que se busca (tema, región o fuente) */
  termino?: string;
};

export type Respuesta = {
  texto: string;
  intencion: Intencion;
  /** notas reales en las que se apoya (0 = no se encontró nada) */
  notaIds: string[];
  /** ¿se encontró algo que contar? */
  hallado: boolean;
  /** lo que se enseña en pantalla (titulares cortos) */
  rotulos: { texto: string; href: string; fuente: string }[];
};

const REGIONES: Record<string, string> = {
  europa: "Europa",
  oriente: "Oriente Medio",
  americas: "América",
  africa: "África",
  asia: "Asia",
  mundo: "el mundo",
};

const CLAVES_REGION: { claves: string[]; region: string }[] = [
  { region: "europa", claves: ["europa", "ucrania", "rusia", "otan", "bruselas", "putin", "zelenski", "bielorrusia", "polonia", "alemania", "francia", "reino unido"] },
  { region: "oriente", claves: ["oriente medio", "gaza", "israel", "iran", "irán", "siria", "libano", "líbano", "irak", "yemen", "hormuz", "hezbollah", "hamas"] },
  { region: "americas", claves: ["america", "américa", "estados unidos", "eeuu", "mexico", "méxico", "brasil", "argentina", "colombia", "venezuela", "chile", "peru", "perú", "canada", "canadá"] },
  { region: "africa", claves: ["africa", "áfrica", "sahel", "sudan", "sudán", "nigeria", "mali", "malí", "congo", "etiopia", "etiopía"] },
  { region: "asia", claves: ["asia", "china", "taiwan", "taiwán", "japon", "japón", "corea", "india", "pakistan", "pakistán", "filipinas"] },
];

const SALUDOS = ["hola", "buenas", "buenos dias", "buenos días", "buenas tardes", "buenas noches", "hey", "qué tal", "que tal"];
const RESUMEN = ["resumen", "que pasa", "que hay", "titulares", "ultima hora", "novedades", "cuentame", "ponme al dia", "ponme al tanto", "el dia", "del dia"];
const BUENAS = ["buena noticia", "buenas noticias", "algo bueno", "algo positivo", "bueno"];
const AYUDA = ["ayuda", "que puedes hacer", "qué puedes hacer", "como funciona", "cómo funciona", "opciones", "comandos"];
const HORA = ["hora", "que hora", "qué hora", "cuando", "cuándo"];
const SILENCIO = ["callate", "cállate", "silencio", "para", "stop", "basta", "quieta"];

function normalizar(t: string): string {
  return (t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Interpreta la pregunta. Público y puro: la UI puede enseñar la intención. */
export function interpretar(pregunta: string): Interpretacion {
  const q = normalizar(pregunta);
  if (!q) return { intencion: "desconocida" };
  if (SILENCIO.some((s) => q === s || q.startsWith(s + " "))) return { intencion: "silencio" };
  if (SALUDOS.some((s) => q === s || q.startsWith(s + " "))) return { intencion: "saludo" };
  if (AYUDA.some((s) => q.includes(s))) return { intencion: "ayuda" };
  if (BUENAS.some((s) => q.includes(s))) return { intencion: "buenas" };
  if (/^(que hora|qué hora|hora es)/.test(q) || HORA.some((s) => q === s)) return { intencion: "hora" };
  for (const r of CLAVES_REGION) {
    for (const clave of r.claves) {
      if (q.includes(clave)) return { intencion: "region", termino: r.region };
    }
  }
  // «¿qué pasa con X?» / «háblame de X» → el término es lo que sigue.
  // VA ANTES que el resumen: «¿qué pasa con el volcán?» pregunta por el
  // volcán, no por el día entero. (Lo cazó la prueba, no el ojo.)
  const conTema = q.match(
    /(?:que pasa con|hablame de|cuentame sobre|cuentame de|informacion sobre|noticias sobre|que sabes de|sobre|de)\s+([a-z0-9 ]{3,40})/
  );
  if (conTema) return { intencion: "tema", termino: conTema[1].trim() };

  if (RESUMEN.some((s) => q.includes(s))) return { intencion: "resumen" };

  // si la pregunta es una sola palabra con contenido, es un tema
  const palabras = q.split(" ").filter((p) => p.length >= 4);
  if (palabras.length > 0) return { intencion: "tema", termino: q };
  return { intencion: "desconocida" };
}

/** Busca en las notas por título, resumen, fuente y conflicto. */
export function buscarEnCables(notas: Nota[], termino: string): Nota[] {
  const q = normalizar(termino);
  if (!q) return [];
  const palabras = q.split(" ").filter((p) => p.length >= 3);
  const puntuadas = notas.map((n) => {
    const heno = normalizar(`${n.titulo} ${n.resumen} ${n.fuente} ${n.region} ${n.conflicto ?? ""}`);
    let puntos = 0;
    for (const p of palabras) {
      if (!heno.includes(p)) continue;
      puntos += 1;
      if (normalizar(n.titulo).includes(p)) puntos += 2;
    }
    return { n, puntos };
  });
  return puntuadas.filter((x) => x.puntos > 0).sort((a, b) => b.puntos - a.puntos).map((x) => x.n);
}

function rotulosDe(notas: Nota[]) {
  return notas.slice(0, 3).map((n) => ({ texto: n.titulo, href: `/lectura/${n.id}`, fuente: n.fuente }));
}

/**
 * La respuesta hablada. `ahora` permite fijar el reloj en las pruebas.
 */
export function responder(pregunta: string, notas: Nota[], ahora = Date.now()): Respuesta {
  const { intencion, termino } = interpretar(pregunta);

  if (intencion === "silencio") {
    return { texto: "Vale, me callo.", intencion, notaIds: [], hallado: true, rotulos: [] };
  }

  if (intencion === "saludo") {
    return {
      texto: `Hola. Soy la voz de Vanguard. Tengo ${notas.length} ${notas.length === 1 ? "cable" : "cables"} del día. Pregúntame por un país, por un tema, o dime «resumen» y te leo los titulares.`,
      intencion,
      notaIds: [],
      hallado: true,
      rotulos: rotulosDe(notas),
    };
  }

  if (intencion === "ayuda") {
    return {
      texto:
        "Puedo leerte el resumen del día, contarte lo que hay sobre un país o un tema, decirte la hora y avisarte si algo no está en el archivo. Todo lo que digo sale de los cables de la casa: si no hay nada, te lo digo en vez de inventarlo.",
      intencion,
      notaIds: [],
      hallado: true,
      rotulos: [],
    };
  }

  if (intencion === "hora") {
    const h = new Date(ahora);
    return {
      texto: `Son las ${h.getHours()} y ${h.getMinutes()} minutos, hora del aparato que te está hablando.`,
      intencion,
      notaIds: [],
      hallado: true,
      rotulos: [],
    };
  }

  if (intencion === "resumen" || intencion === "desconocida") {
    if (notas.length === 0) {
      return {
        texto: "Ahora mismo el archivo no tiene cables nuevos. No te voy a rellenar el silencio con nada.",
        intencion,
        notaIds: [],
        hallado: false,
        rotulos: [],
      };
    }
    const tres = notas.slice(0, 3);
    const texto =
      intencion === "desconocida"
        ? `No estoy segura de haberte entendido, y prefiero decírtelo. De momento, esto es lo que tengo: ${tres
            .map((n) => `${n.titulo} (${n.fuente})`)
            .join(". ")}.`
        : `Resumen del día, con ${notas.length} ${notas.length === 1 ? "cable" : "cables"}. ${tres
            .map((n, i) => `${i + 1}. ${recortarPorFrase(n.titulo, 120)}. ${n.fuente}, ${haceLegible(n.fecha, ahora)}.`)
            .join(" ")}`;
    return { texto, intencion, notaIds: tres.map((n) => n.id), hallado: true, rotulos: rotulosDe(tres) };
  }

  if (intencion === "region") {
    const nombre = REGIONES[termino ?? ""] ?? termino ?? "";
    const encontradas = notas.filter((n) => n.region === termino).slice(0, 3);
    if (encontradas.length === 0) {
      return {
        texto: `No tengo ningún cable de ${nombre} en este momento. Si quieres, te leo el resumen del día.`,
        intencion,
        notaIds: [],
        hallado: false,
        rotulos: [],
      };
    }
    return {
      texto: `En ${nombre} tengo ${encontradas.length} ${encontradas.length === 1 ? "cable" : "cables"}. ${encontradas
        .map((n) => `${n.titulo}. ${n.fuente}, ${haceLegible(n.fecha, ahora)}.`)
        .join(" ")}`,
      intencion,
      notaIds: encontradas.map((n) => n.id),
      hallado: true,
      rotulos: rotulosDe(encontradas),
    };
  }

  if (intencion === "buenas") {
    const buenas = notas.filter((n) => /acuerdo|alto el fuego|tregua|liberad|rescate|ayuda humanitaria|avance|logro|record|victoria judicial/i.test(`${n.titulo} ${n.resumen}`)).slice(0, 2);
    if (buenas.length === 0) {
      return {
        texto: "Te voy a ser sincera: en los cables de ahora mismo no encuentro nada que pueda llamar buena noticia sin exagerar. No te lo voy a inventar.",
        intencion,
        notaIds: [],
        hallado: false,
        rotulos: [],
      };
    }
    return {
      texto: `Algo bueno, y es real: ${buenas.map((n) => `${n.titulo}. ${n.fuente}.`).join(" ")}`,
      intencion,
      notaIds: buenas.map((n) => n.id),
      hallado: true,
      rotulos: rotulosDe(buenas),
    };
  }

  // tema o fuente
  const encontradas = buscarEnCables(notas, termino ?? pregunta).slice(0, 3);
  if (encontradas.length === 0) {
    const eco = (termino ?? pregunta).slice(0, 60);
    return {
      texto: `No tengo un cable sobre «${eco}». Puedo leerte el resumen del día o buscar otro tema. Prefiero decírtelo a improvisar.`,
      intencion,
      notaIds: [],
      hallado: false,
      rotulos: [],
    };
  }
  const esFuente = encontradas.some((n) => normalizar(n.fuente).includes(normalizar(termino ?? "")));
  return {
    texto: `${esFuente ? "De esa fuente" : "Sobre eso"} tengo ${encontradas.length} ${encontradas.length === 1 ? "cable" : "cables"}. ${encontradas
      .map((n) => `${recortarPorFrase(n.titulo, 130)}. ${n.fuente}, ${haceLegible(n.fecha, ahora)}.`)
      .join(" ")}`,
    intencion: esFuente ? "fuente" : "tema",
    notaIds: encontradas.map((n) => n.id),
    hallado: true,
    rotulos: rotulosDe(encontradas),
  };
}

/** Preguntas de arranque que la UI ofrece como botones (todas respondibles). */
export const SUGERENCIAS = [
  "Resumen del día",
  "¿Qué pasa en Europa?",
  "¿Qué pasa en Oriente Medio?",
  "¿Algo bueno?",
  "¿Qué puedes hacer?",
];
