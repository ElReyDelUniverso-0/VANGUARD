// ═══════════════════════════════════════════════════════════════════
// v431.2 RADIO VANGUARD · LA CONVERSACIÓN (segunda versión) — ahora con
// memoria de la charla, seguimientos y cifras del archivo.
//
// QUÉ AÑADE SOBRE v422.3:
//   ① MEMORIA DE TURNO: después de hablar de Ucrania, «¿y en África?» se
//      entiende como región, «cuéntame más» sigue por el mismo tema y «la
//      segunda» sabe a qué cable te refieres.
//   ② SEGUIMIENTOS: «más», «otra», «siguiente», «repite», «explícame»,
//      «la primera / la segunda / la tercera».
//   ③ CIFRAS DEL ARCHIVO (reales, derivadas): cuántos cables y medios hay,
//      qué región tiene más, qué medio firma más, cuál fue el último cable
//      y de qué se habla hoy. Y comparaciones: «¿Europa o África?».
//   ④ RESPUESTAS QUE SE PUEDEN ESCUCHAR: frases cortas, sin paréntesis ni
//      símbolos, y siempre con la fuente de lo que afirma.
//
// LO QUE SIGUE SIENDO VERDAD: no hay un modelo de lenguaje detrás. Entiende
// lo que puede demostrar y, cuando no sabe o no tiene el dato, lo dice. Eso
// es lo que la hace fiable: no improvisa.
// Sin DOM, sin red: se prueba en Node (scripts/pruebas-radio.mjs).
// ═══════════════════════════════════════════════════════════════════

import type { Nota } from "@/lib/portada/notas";
import { estadisticas, normalizarTexto, temasDeHoy } from "./agrupar";
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
  | "desconocida"
  | "seguir"
  | "repite"
  | "indice"
  | "estadistica"
  | "comparar";

export type Interpretacion = {
  intencion: Intencion;
  /** el término que se busca (tema, región, fuente o medida) */
  termino?: string;
  /** para «la segunda», «el primero»… (1, 2, 3) */
  orden?: number;
  /** para comparar dos regiones */
  segundo?: string;
};

/** Lo que la radio recuerda de la conversación (vive en el aparato). */
export type Memoria = {
  /** el tema del último turno, para seguimientos */
  tema?: string;
  /** las notas de las que se habló, en orden */
  ultimas: string[];
  /** cuántas se han contado ya (para «cuéntame más») */
  contadas: number;
  /** el texto de la última respuesta (para «repite») */
  ultimaRespuesta: string;
  turnos: number;
};

export const MEMORIA_VACIA: Memoria = { ultimas: [], contadas: 0, ultimaRespuesta: "", turnos: 0 };

export type Respuesta = {
  texto: string;
  intencion: Intencion;
  /** notas reales en las que se apoya (0 = no se encontró nada) */
  notaIds: string[];
  /** ¿se encontró algo que contar? */
  hallado: boolean;
  /** lo que se enseña en pantalla (titulares cortos) */
  rotulos: { texto: string; href: string; fuente: string }[];
  /** la memoria actualizada que el que llama debe guardar */
  memoria: Memoria;
  /** preguntas que se pueden hacer después (botones, no adornos) */
  siguientes: string[];
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
  { region: "oriente", claves: ["oriente medio", "gaza", "israel", "iran", "siria", "libano", "irak", "yemen", "hormuz", "hezbollah", "hamas"] },
  { region: "americas", claves: ["america", "estados unidos", "eeuu", "mexico", "brasil", "argentina", "colombia", "venezuela", "chile", "peru", "canada"] },
  { region: "africa", claves: ["africa", "sahel", "sudan", "nigeria", "mali", "congo", "etiopia"] },
  { region: "asia", claves: ["asia", "china", "taiwan", "japon", "corea", "india", "pakistan", "filipinas"] },
];

const SALUDOS = ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "hey", "que tal"];
const RESUMEN = ["resumen", "que pasa", "que hay", "titulares", "ultima hora", "novedades", "cuentame", "ponme al dia", "ponme al tanto", "el dia", "del dia"];
const BUENAS = ["buena noticia", "buenas noticias", "algo bueno", "algo positivo", "bueno"];
const AYUDA = ["ayuda", "que puedes hacer", "como funciona", "opciones", "comandos"];
const SILENCIO = ["callate", "silencio", "para", "stop", "basta", "quieta"];
const SEGUIR = ["mas", "y mas", "otra", "otras", "siguiente", "siguientes", "cuentame mas", "dame mas", "continua", "sigue", "y luego", "que mas hay", "algo mas"];
const REPITE = ["repite", "otra vez", "repiteme", "como has dicho", "repitelo"];
const ORDINALES: { palabras: string[]; orden: number }[] = [
  { palabras: ["primera", "primero", "el uno", "la uno", "1"], orden: 1 },
  { palabras: ["segunda", "segundo", "la dos", "el dos", "2"], orden: 2 },
  { palabras: ["tercera", "tercero", "la tres", "el tres", "3"], orden: 3 },
];
const ESTADISTICA: { claves: string[]; medida: string }[] = [
  { claves: ["cuantos cables", "cuantas noticias", "cuantos hay", "cuantos cables hay", "total de cables"], medida: "cables" },
  { claves: ["cuantos medios", "cuantas fuentes", "cuantas fuentes hay"], medida: "medios" },
  { claves: ["cuantas regiones", "que regiones"], medida: "regiones" },
  { claves: ["que region tiene mas", "region con mas", "donde hay mas"], medida: "region-top" },
  { claves: ["que medio firma mas", "fuente con mas", "que medio publica mas", "quien firma mas"], medida: "fuente-top" },
  { claves: ["ultimo cable", "lo ultimo", "ultima noticia", "que ha entrado"], medida: "ultimo" },
  { claves: ["de que se habla", "que temas", "temas del dia", "de que hablan"], medida: "temas" },
];
const HORA = ["hora", "que hora"];

/** Minúsculas, sin acentos ni signos. */
function limpiar(t: string): string {
  return normalizarTexto(t).replace(/[¿?¡!.,;:]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Interpreta la pregunta. Con `memoria` resuelve seguimientos («más»,
 * «la segunda», «y en África»). Pública y pura.
 */
export function interpretar(pregunta: string, memoria: Memoria = MEMORIA_VACIA): Interpretacion {
  const q = limpiar(pregunta);
  if (!q) return { intencion: "desconocida" };

  if (SILENCIO.some((s) => q === s || q.startsWith(s + " "))) return { intencion: "silencio" };
  if (SALUDOS.some((s) => q === s || q.startsWith(s + " "))) return { intencion: "saludo" };
  if (AYUDA.some((s) => q.includes(s))) return { intencion: "ayuda" };
  if (REPITE.some((s) => q.includes(s))) return { intencion: "repite" };
  if (BUENAS.some((s) => q.includes(s))) return { intencion: "buenas" };
  if (/^(que hora|hora es)/.test(q) || HORA.some((s) => q === s)) return { intencion: "hora" };

  // «la segunda», «la primera» → dentro de lo último que se contó
  for (const o of ORDINALES) {
    if (o.palabras.some((p) => new RegExp(`\\b${p}\\b`).test(q))) {
      return { intencion: "indice", orden: o.orden };
    }
  }

  // «¿Europa o África?» → comparación de dos regiones
  const dos = q.match(/^(.{3,30}?) o (?:en )?(.{3,30})$/);
  if (dos) {
    const a = CLAVES_REGION.find((r) => r.claves.some((c) => dos[1].includes(c)));
    const b = CLAVES_REGION.find((r) => r.claves.some((c) => dos[2].includes(c)));
    if (a && b && a.region !== b.region) {
      return { intencion: "comparar", termino: a.region, segundo: b.region };
    }
  }

  const region = CLAVES_REGION.find((r) => r.claves.some((c) => q.includes(c)));
  if (region) return { intencion: "region", termino: region.region };

  const medida = ESTADISTICA.find((e) => e.claves.some((c) => q.includes(c)));
  if (medida) return { intencion: "estadistica", termino: medida.medida };

  // «¿qué pasa con X?» / «háblame de X» → el término es lo que sigue.
  // VA ANTES que el resumen: «¿qué pasa con el volcán?» pregunta por el
  // volcán, no por el día entero.
  const conTema = q.match(
    /(?:que pasa con|hablame de|cuentame sobre|cuentame de|informacion sobre|noticias sobre|que sabes de|sobre|de)\s+([a-z0-9 ]{3,40})/
  );
  if (conTema) return { intencion: "tema", termino: conTema[1].trim() };

  // Seguimiento ANTES que resumen: «cuéntame más» pide continuar, no el día
  // entero. («cuéntame» a secas sí es resumen, y sigue estando en RESUMEN.)
  if (SEGUIR.some((s) => q === s || q.startsWith(s + " ") || q.endsWith(" " + s))) {
    return { intencion: "seguir" };
  }

  if (RESUMEN.some((s) => q.includes(s))) return { intencion: "resumen" };

  const palabras = q.split(" ").filter((p) => p.length >= 4);
  if (palabras.length > 0) {
    if (memoria.tema && SEGUIR.some((s) => q.includes(s))) {
      return { intencion: "seguir" };
    }
    return { intencion: "tema", termino: q };
  }
  return { intencion: "desconocida" };
}

/** Busca en las notas por título, resumen, fuente, región y conflicto. */
export function buscarEnCables(notas: Nota[], termino: string): Nota[] {
  const q = limpiar(termino);
  if (!q) return [];
  const palabras = q.split(" ").filter((p) => p.length >= 3);
  const puntuadas = notas.map((n) => {
    const heno = limpiar(`${n.titulo} ${n.resumen} ${n.fuente} ${n.region} ${n.conflicto ?? ""}`);
    let puntos = 0;
    for (const p of palabras) {
      if (!heno.includes(p)) continue;
      puntos += 1;
      if (limpiar(n.titulo).includes(p)) puntos += 2;
    }
    return { n, puntos };
  });
  return puntuadas.filter((x) => x.puntos > 0).sort((a, b) => b.puntos - a.puntos).map((x) => x.n);
}

function rotulosDe(notas: Nota[]) {
  return notas.slice(0, 3).map((n) => ({ texto: n.titulo, href: `/lectura/${n.id}`, fuente: n.fuente }));
}

function conRotulos(notas: Nota[], ids: string[]): Nota[] {
  const porId = new Map(notas.map((n) => [n.id, n]));
  return ids.map((id) => porId.get(id)).filter((n): n is Nota => !!n);
}

function nombreDeFuenteMasActiva(notas: Nota[]): { fuente: string; cables: number } | null {
  const cuenta = new Map<string, number>();
  for (const n of notas) cuenta.set(n.fuente, (cuenta.get(n.fuente) ?? 0) + 1);
  const top = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0];
  return top ? { fuente: top[0], cables: top[1] } : null;
}

/** La respuesta hablada. `ahora` permite fijar el reloj en las pruebas. */
export function responder(
  pregunta: string,
  notas: Nota[],
  ahora = Date.now(),
  memoria: Memoria = MEMORIA_VACIA
): Respuesta {
  const { intencion, termino, orden, segundo } = interpretar(pregunta, memoria);
  const base = { intencion, notaIds: [] as string[], hallado: true, rotulos: [] as Respuesta["rotulos"], siguientes: [] as string[] };
  const cerrar = (r: Partial<Respuesta> & { texto: string }): Respuesta => {
    const memoriaNueva: Memoria = {
      tema: r.intencion === "region" || r.intencion === "tema" ? termino ?? memoria.tema : memoria.tema,
      ultimas: r.notaIds ?? memoria.ultimas,
      contadas: (r.notaIds?.length ?? 0) > 0 ? Math.min(r.notaIds!.length, 1) : memoria.contadas,
      ultimaRespuesta: r.texto,
      turnos: memoria.turnos + 1,
    };
    return { ...base, ...r, memoria: memoriaNueva } as Respuesta;
  };

  if (intencion === "silencio") return cerrar({ texto: "Vale, me callo.", hallado: true });

  if (intencion === "repite") {
    return cerrar({
      texto: memoria.ultimaRespuesta || "Todavía no he dicho nada que repetir.",
      hallado: !!memoria.ultimaRespuesta,
      notaIds: memoria.ultimas,
      rotulos: rotulosDe(conRotulos(notas, memoria.ultimas)),
    });
  }

  if (intencion === "saludo") {
    const e = estadisticas(notas, ahora);
    return cerrar({
      texto: `Hola. Soy la voz de Vanguard. Tengo ${e.cables} ${e.cables === 1 ? "cable" : "cables"} de ${e.medios} ${e.medios === 1 ? "medio" : "medios"}${e.temaDelDia ? `, y lo que más se repite hoy es «${e.temaDelDia}»` : ""}. Pregúntame por un país, por un tema, o dime «resumen».`,
      notaIds: notas.slice(0, 3).map((n) => n.id),
      rotulos: rotulosDe(notas.slice(0, 3)),
      siguientes: ["Resumen del día", "¿De qué se habla hoy?", "¿Algo bueno?"],
    });
  }

  if (intencion === "ayuda") {
    return cerrar({
      texto:
        "Puedo leerte el resumen del día, contarte lo que hay sobre un país o un tema, darte cifras del archivo —cuántos cables, qué región tiene más, quién firma más, cuál fue el último—, decirte la hora y avisarte si algo no está. También entiendo seguimientos: «cuéntame más», «la segunda», «repite». Todo lo que digo sale de los cables de la casa: si no hay nada, te lo digo en vez de inventarlo.",
      siguientes: ["¿Cuántos cables hay?", "¿Qué región tiene más?", "Último cable"],
    });
  }

  if (intencion === "hora") {
    const h = new Date(ahora);
    return cerrar({
      texto: `Son las ${h.getHours()} y ${h.getMinutes()} minutos, hora del aparato que te está hablando.`,
    });
  }

  if (intencion === "estadistica") {
    const e = estadisticas(notas, ahora);
    switch (termino) {
      case "cables":
        return cerrar({
          texto: `Ahora mismo hay ${e.cables} ${e.cables === 1 ? "cable" : "cables"} en el archivo, que cuentan ${e.asuntos} ${e.asuntos === 1 ? "asunto" : "asuntos"} distintos: ${e.repetidos} ${e.repetidos === 1 ? "cable repite" : "cables repiten"} lo que ya cuenta otro.`,
          hallado: e.cables > 0,
          notaIds: notas.slice(0, 3).map((n) => n.id),
          rotulos: rotulosDe(notas.slice(0, 3)),
          siguientes: ["¿De qué se habla hoy?", "Resumen del día"],
        });
      case "medios":
        return cerrar({
          texto: `Hay ${e.medios} ${e.medios === 1 ? "medio" : "medios"} firmando cables en este momento.`,
          hallado: e.medios > 0,
          siguientes: ["¿Qué medio firma más?", "¿Cuántos cables hay?"],
        });
      case "regiones":
        return cerrar({
          texto: e.regiones.length
            ? `Hay ${e.regiones.length} ${e.regiones.length === 1 ? "región" : "regiones"} con cables: ${e.regiones.map((r) => `${REGIONES[r.region] ?? r.region}, ${r.cables}`).join("; ")}.`
            : "Ahora mismo no hay regiones con cables.",
          hallado: e.regiones.length > 0,
          siguientes: ["¿Qué región tiene más?", "Resumen del día"],
        });
      case "region-top": {
        const top = e.regiones[0];
        if (!top) return cerrar({ texto: "No hay cables, así que no hay región que destaque.", hallado: false });
        return cerrar({
          texto: `La que más suena hoy es ${REGIONES[top.region] ?? top.region}, con ${top.cables} ${top.cables === 1 ? "cable" : "cables"}. Después, ${e.regiones[1] ? `${REGIONES[e.regiones[1].region] ?? e.regiones[1].region}, con ${e.regiones[1].cables}` : "nada más"}.`,
          hallado: true,
          notaIds: notas.filter((n) => n.region === top.region).slice(0, 3).map((n) => n.id),
          rotulos: rotulosDe(notas.filter((n) => n.region === top.region).slice(0, 3)),
          siguientes: [`¿Qué pasa en ${REGIONES[top.region] ?? top.region}?`, "Resumen del día"],
        });
      }
      case "fuente-top": {
        const f = nombreDeFuenteMasActiva(notas);
        if (!f) return cerrar({ texto: "No hay cables firmados ahora mismo.", hallado: false });
        return cerrar({
          texto: `Quien más firma hoy es ${f.fuente}, con ${f.cables} ${f.cables === 1 ? "cable" : "cables"}.`,
          hallado: true,
          notaIds: notas.filter((n) => n.fuente === f.fuente).slice(0, 3).map((n) => n.id),
          rotulos: rotulosDe(notas.filter((n) => n.fuente === f.fuente).slice(0, 3)),
          siguientes: [`¿Qué ha dicho ${f.fuente}?`, "¿Cuántos medios hay?"],
        });
      }
      case "ultimo": {
        if (!e.ultimo) return cerrar({ texto: "No hay ningún cable en el archivo.", hallado: false });
        return cerrar({
          texto: `El último que entró es «${recortarPorFrase(e.ultimo.titulo, 130)}», de ${e.ultimo.fuente}, ${haceLegible(new Date(ahora - e.ultimo.haceMs).toISOString(), ahora)}.`,
          hallado: true,
          notaIds: notas.slice(0, 1).map((n) => n.id),
          rotulos: rotulosDe(notas.slice(0, 1)),
          siguientes: ["Resumen del día", "¿De qué se habla hoy?"],
        });
      }
      case "temas": {
        const temas = temasDeHoy(notas, 5);
        if (!temas.length) return cerrar({ texto: "No hay suficientes cables para decir de qué se habla hoy.", hallado: false });
        return cerrar({
          texto: `Hoy se repiten estos asuntos: ${temas.map((t) => `${t.tema}, en ${t.cables} cables`).join("; ")}. Son cuentas de palabras sobre los titulares del archivo, no una interpretación mía.`,
          hallado: true,
          notaIds: notas.slice(0, 3).map((n) => n.id),
          rotulos: rotulosDe(notas.slice(0, 3)),
          siguientes: [`¿Qué pasa en ${REGIONES[estadisticas(notas, ahora).regiones[0]?.region ?? "europa"] ?? "Europa"}?`, "Resumen del día"],
        });
      }
      default:
        break;
    }
  }

  if (intencion === "comparar") {
    const e = estadisticas(notas, ahora);
    const a = e.regiones.find((r) => r.region === termino);
    const b = e.regiones.find((r) => r.region === segundo);
    const na = REGIONES[termino ?? ""] ?? termino ?? "";
    const nb = REGIONES[segundo ?? ""] ?? segundo ?? "";
    if (!a && !b) {
      return cerrar({ texto: `Ni ${na} ni ${nb} tienen cables ahora mismo.`, hallado: false });
    }
    const texto =
      (a?.cables ?? 0) === (b?.cables ?? 0)
        ? `Están igual: ${na}, ${a?.cables ?? 0} ${a?.cables === 1 ? "cable" : "cables"}; ${nb}, ${b?.cables ?? 0}.`
        : (a?.cables ?? 0) > (b?.cables ?? 0)
          ? `Hoy gana ${na}: ${a?.cables ?? 0} ${a?.cables === 1 ? "cable" : "cables"} frente a ${b?.cables ?? 0} de ${nb}.`
          : `Hoy gana ${nb}: ${b?.cables ?? 0} ${b?.cables === 1 ? "cable" : "cables"} frente a ${a?.cables ?? 0} de ${na}.`;
    return cerrar({
      texto,
      hallado: true,
      notaIds: notas.filter((n) => n.region === termino || n.region === segundo).slice(0, 3).map((n) => n.id),
      rotulos: rotulosDe(notas.filter((n) => n.region === termino || n.region === segundo).slice(0, 3)),
    });
  }

  if (intencion === "indice") {
    const id = memoria.ultimas[(orden ?? 1) - 1];
    const n = id ? notas.find((x) => x.id === id) : undefined;
    if (!n) {
      return cerrar({
        texto: `No tengo un ${orden === 1 ? "primero" : orden === 2 ? "segundo" : "tercero"} del que hablarte todavía. Pregúntame primero por un tema.`,
        hallado: false,
      });
    }
    return cerrar({
      texto: `El ${orden === 1 ? "primero" : orden === 2 ? "segundo" : "tercero"} era: ${n.titulo}. ${n.fuente}, ${haceLegible(n.fecha, ahora)}. ${recortarPorFrase(n.resumen, 200)}`,
      notaIds: [n.id],
      rotulos: rotulosDe([n]),
    });
  }

  if (intencion === "seguir") {
    const conocidas = conRotulos(notas, memoria.ultimas);
    const pendientes = notas.filter((n) => !memoria.ultimas.includes(n.id));
    const siguientes = pendientes.slice(0, 2);
    if (conocidas.length === 0 && siguientes.length === 0) {
      return cerrar({ texto: "No tengo más cables que contarte ahora mismo.", hallado: false });
    }
    const lista = siguientes.length > 0 ? siguientes : conocidas.slice(0, 1);
    return cerrar({
      texto: `Sigo. ${lista.map((n) => `${n.titulo}. ${n.fuente}, ${haceLegible(n.fecha, ahora)}.`).join(" ")}`,
      notaIds: [...memoria.ultimas, ...lista.map((n) => n.id)].slice(-6),
      rotulos: rotulosDe(lista),
      siguientes: ["Cuéntame más", "Resumen del día"],
    });
  }

  if (intencion === "resumen" || intencion === "desconocida") {
    if (notas.length === 0) {
      return cerrar({
        texto: "Ahora mismo el archivo no tiene cables nuevos. No te voy a rellenar el silencio con nada.",
        hallado: false,
      });
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
    return cerrar({
      texto,
      notaIds: tres.map((n) => n.id),
      rotulos: rotulosDe(tres),
      siguientes: ["Cuéntame más", "¿De qué se habla hoy?", "¿Algo bueno?"],
    });
  }

  if (intencion === "region") {
    const nombre = REGIONES[termino ?? ""] ?? termino ?? "";
    const encontradas = notas.filter((n) => n.region === termino).slice(0, 3);
    if (encontradas.length === 0) {
      return cerrar({
        texto: `No tengo ningún cable de ${nombre} en este momento. Si quieres, te leo el resumen del día.`,
        hallado: false,
        siguientes: ["Resumen del día", "¿Qué región tiene más?"],
      });
    }
    const total = notas.filter((n) => n.region === termino).length;
    return cerrar({
      texto: `En ${nombre} tengo ${total} ${total === 1 ? "cable" : "cables"}. ${encontradas
        .map((n) => `${n.titulo}. ${n.fuente}, ${haceLegible(n.fecha, ahora)}.`)
        .join(" ")}`,
      notaIds: encontradas.map((n) => n.id),
      rotulos: rotulosDe(encontradas),
      siguientes: ["Cuéntame más", "Repite"],
    });
  }

  if (intencion === "buenas") {
    const buenas = notas
      .filter((n) => /acuerdo|alto el fuego|tregua|liberad|rescate|ayuda humanitaria|avance|logro|record|victoria judicial/i.test(`${n.titulo} ${n.resumen}`))
      .slice(0, 2);
    if (buenas.length === 0) {
      return cerrar({
        texto: "Te voy a ser sincera: en los cables de ahora mismo no encuentro nada que pueda llamar buena noticia sin exagerar. No te lo voy a inventar.",
        hallado: false,
        siguientes: ["Resumen del día", "¿De qué se habla hoy?"],
      });
    }
    return cerrar({
      texto: `Algo bueno, y es real: ${buenas.map((n) => `${n.titulo}. ${n.fuente}.`).join(" ")}`,
      notaIds: buenas.map((n) => n.id),
      rotulos: rotulosDe(buenas),
    });
  }

  // tema o fuente
  const encontradas = buscarEnCables(notas, termino ?? pregunta).slice(0, 3);
  if (encontradas.length === 0) {
    const eco = (termino ?? pregunta).slice(0, 60);
    const alternativas = temasDeHoy(notas, 3);
    return cerrar({
      texto: `No tengo un cable sobre «${eco}».${alternativas.length ? ` Hoy se habla de ${alternativas.map((t) => t.tema).join(", ")}.` : ""} Prefiero decírtelo a improvisar.`,
      hallado: false,
      siguientes: ["Resumen del día", ...(alternativas[0] ? [`¿Qué pasa con ${alternativas[0].tema}?`] : [])],
    });
  }
  const esFuente = encontradas.some((n) => limpiar(n.fuente).includes(limpiar(termino ?? "")));
  return cerrar({
    texto: `${esFuente ? "De esa fuente" : "Sobre eso"} tengo ${encontradas.length} ${encontradas.length === 1 ? "cable" : "cables"}. ${encontradas
      .map((n) => `${recortarPorFrase(n.titulo, 130)}. ${n.fuente}, ${haceLegible(n.fecha, ahora)}.`)
      .join(" ")}`,
    intencion: esFuente ? "fuente" : "tema",
    notaIds: encontradas.map((n) => n.id),
    rotulos: rotulosDe(encontradas),
    siguientes: ["Cuéntame más", "La segunda", "Repite"],
  });
}

/** Preguntas de arranque que la UI ofrece como botones (todas respondibles). */
export const SUGERENCIAS = [
  "Resumen del día",
  "¿Qué región tiene más?",
  "¿De qué se habla hoy?",
  "¿Qué pasa en Europa?",
  "¿Algo bueno?",
  "¿Qué puedes hacer?",
];
