// ============================================================
// v367.2 LA VOZ MAESTRA — EL MAESTRO (maestro.ts)
//
// El Dueño describió el problema entero en una frase: «no explica las
// noticias, no navega, no te ayuda, no puede tener una conversación larga».
// Antes de esta ronda la casa tenía un intérprete de órdenes cortas (220
// caracteres) — un portero, no un maestro.
//
// Este módulo es el maestro: recibe lo que dice el piloto, la memoria de la
// conversación y LOS DATOS REALES del archivo, y devuelve una respuesta
// hablada con estructura de analista:
//
//   QUÉ PASA → POR QUÉ IMPORTA → QUÉ VIGILAR → QUÉ SIGNIFICA (y un ejemplo)
//
// ── LAS TRES LEYES QUE NO SE ROMPEN ─────────────────────────
// ① CERO CIFRAS INVENTADAS. Todo número que sale de su boca viene de
//    `DatosMaestro`, que el servidor calcula del archivo real (los cables).
//    El saber de fondo (saber.ts) no tiene ni un dato volátil a propósito.
// ② CERO ACCIÓN PROMETIDA QUE NO EXISTA. La navegación solo apunta a rutas
//    REALES de la casa (`NAVEGACION`), y la respuesta lleva la ruta.
// ③ CERO MENTIRA ANTE EL VACÍO. Si no hay datos, lo dice: «el archivo no
//    trae señal». Si no sabe un concepto, lo dice y ofrece lo que sí sabe.
//
// Es determinista y sin red: funciona con la BD caída, sin claves y sin
// servicios de pago. El LLM (si algún día hay clave) entra como mejora de
// redacción, nunca como fuente de datos.
// ============================================================

import { CONCEPTOS_SABER, TEATROS_SABER, type ConceptoSaber, type TeatroSaber } from "./saber";

export interface DatoTeatro {
  tag: string;
  nombre: string;
  n24: number;
  n7: number;
  ultimo: { titulo: string; fuente: string; fecha: string } | null;
}

export interface DatosMaestro {
  ok: boolean;
  consultadoEn: string;
  archivo: number;
  total24: number;
  total7: number;
  teatros: DatoTeatro[];
  medios: string[];
  nota: string;
}

export interface Turno {
  rol: "piloto" | "casa";
  texto: string;
}

export type ModoMaestro =
  | "panorama"
  | "teatro"
  | "clase"
  | "cronica"
  | "ejemplo"
  | "navegar"
  | "ayuda"
  | "no-se";

export interface RespuestaMaestro {
  hablar: string;
  modo: ModoMaestro;
  ai: false;
  accion: { tipo: string; destino?: string; consulta?: string; ruta?: string; subtab?: string };
  briefing?: { titulo: string; pais: string; impacto: number; tier: string; edad?: string }[];
  fuentes?: { titulo: string; fuente: string; fecha: string; ruta: string }[];
  /** el tema abierto: la memoria de la conversación se sostiene en esto */
  tema?: string;
  /** lo que el maestro puede seguir explicando (botones honestos) */
  seguir?: string[];
}

// ── Normalización (sin acentos, minúsculas, sin signos) ──
// El piloto habla, no escribe: llegan «¿y por qué?», «¡explícame eso!». Los
// signos se vuelven espacios para que la MISMA frase con o sin ellos caiga en
// la misma puerta. (Hallazgo del QA v367.2: «¿y por qué?» se quedaba sin
// respuesta porque el «¿» rompía el reconocimiento del seguimiento.)
function norm(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── La navegación REAL de la casa: alias → destino (tab) + ruta (URL) ──
interface Puerta {
  claves: string[];
  etiqueta: string;
  /** clave de pestaña real de la casa (si existe) */
  tab?: string;
  ruta: string;
}

export const NAVEGACION: Puerta[] = [
  { claves: ["en vivo", "envivo", "ultima hora", "directo", "pulso", "redaccion"], etiqueta: "EN VIVO", tab: "envivo", ruta: "/en-vivo" },
  { claves: ["cronica", "el parte", "parte del dia", "que paso hoy", "resumen del dia"], etiqueta: "LA CRÓNICA DEL DÍA", ruta: "/cronica" },
  { claves: ["torre", "torre de control", "salud", "telemetria", "diagnostico"], etiqueta: "LA TORRE DE CONTROL", ruta: "/torre" },
  { claves: ["centinela", "lo que sigo", "mis teatros", "seguimiento"], etiqueta: "TU CENTINELA", ruta: "/centinela" },
  { claves: ["voz", "voz maestra", "hablar", "asistente", "microfono", "chat"], etiqueta: "LA VOZ MAESTRA", ruta: "/voz" },
  { claves: ["nucleo", "censo", "entidades", "indice"], etiqueta: "EL NÚCLEO", ruta: "/nucleo" },
  { claves: ["mundo", "mapa", "mapamundi", "planeta", "globo"], etiqueta: "EL MUNDO", tab: "mundo", ruta: "/mundo" },
  { claves: ["atlas", "continentes", "paises"], etiqueta: "EL ATLAS", ruta: "/atlas" },
  { claves: ["objetivos", "los 100", "logros", "retos"], etiqueta: "LOS 100 OBJETIVOS", ruta: "/objetivos" },
  { claves: ["armeria", "armas", "arsenal"], etiqueta: "LA ARMERÍA", ruta: "/armeria" },
  { claves: ["historia", "historico", "epocas"], etiqueta: "LA HISTORIA", ruta: "/historia" },
  { claves: ["poder", "lideres", "rostros", "gobiernos"], etiqueta: "EL PODER", ruta: "/poder" },
  { claves: ["espia", "espionaje", "escuchas"], etiqueta: "LA SALA ESPÍA", ruta: "/espia" },
  { claves: ["escenarios", "simulacion", "estratega", "simular"], etiqueta: "LOS ESCENARIOS", ruta: "/escenarios" },
  { claves: ["divisas", "monedas", "economia", "mercados"], etiqueta: "LAS DIVISAS", ruta: "/divisas" },
  { claves: ["galeria", "fotos", "imagenes"], etiqueta: "LA GALERÍA", ruta: "/galeria" },
  { claves: ["audios", "radio", "emisora", "escuchar"], etiqueta: "LOS AUDIOS", ruta: "/audios" },
  { claves: ["perfil", "mi cuenta", "personalizar", "ajustes"], etiqueta: "TU PERFIL", tab: "perfil", ruta: "/modo" },
  { claves: ["privacidad", "datos", "politica"], etiqueta: "PRIVACIDAD", ruta: "/privacidad" },
];

function buscaPuerta(t: string): Puerta | null {
  let mejor: { p: Puerta; largo: number } | null = null;
  for (const p of NAVEGACION) {
    for (const c of p.claves) {
      if (t.includes(c) && (!mejor || c.length > mejor.largo)) mejor = { p, largo: c.length };
    }
  }
  return mejor ? mejor.p : null;
}

function buscaTeatro(t: string): { clave: string; saber: TeatroSaber } | null {
  const alias: Record<string, string[]> = {
    ukraine: ["ucrania", "ukraine", "rusia", "ucraniano"],
    gaza: ["gaza", "israel", "palestina", "palestino"],
    lebanon: ["libano", "hezbola", "beirut"],
    redsea: ["mar rojo", "huties", "yemen", "bab el mandeb", "red sea"],
    sudan: ["sudan", "darfur", "jartum"],
    korea: ["corea", "coreas", "pyongyang", "seul"],
    taiwan: ["taiwan", "estrecho de taiwan", "taipei"],
    hormuz: ["ormuz", "hormuz", "iran", "golfo persico"],
    sahel: ["sahel", "mali", "niger", "burkina"],
  };
  for (const [clave, lista] of Object.entries(alias)) {
    for (const a of lista) {
      if (t === a || (a.length >= 5 ? t.includes(a) : new RegExp(`(^|\\s)${a}($|\\s)`).test(t))) {
        return { clave, saber: TEATROS_SABER[clave] };
      }
    }
  }
  return null;
}

function buscaConcepto(t: string): ConceptoSaber | null {
  for (const c of CONCEPTOS_SABER) {
    if (c.alias.some((a) => (a.length >= 5 ? t.includes(a) : new RegExp(`(^|\\s)${a}($|\\s)`).test(t)))) {
      return c;
    }
  }
  return null;
}

// ── Piezas habladas (con estructura de analista) ──
const TITULO: Record<string, string> = {
  ukraine: "Ucrania",
  gaza: "Gaza",
  lebanon: "Líbano",
  redsea: "el mar Rojo",
  sudan: "Sudán",
  korea: "las dos Coreas",
  taiwan: "Taiwán",
  hormuz: "Ormuz",
  sahel: "el Sahel",
};

function estadoReal(datos: DatosMaestro, tag: string): string {
  const d = datos.teatros.find((t) => t.tag === tag);
  if (!d) {
    return "El archivo de la casa no ha registrado cables de este teatro en la ventana medida, así que no te doy cifras de hoy: prefiero decirte que no hay señal a inventarte un número.";
  }
  const partes: string[] = [];
  partes.push(
    `En la ventana medida, el archivo de la casa registra ${d.n7} cables de este teatro y ${d.n24} de las últimas veinticuatro horas.`,
  );
  if (d.ultimo) {
    partes.push(`El último entró a las ${d.ultimo.fecha} y lo firma ${d.ultimo.fuente}: «${d.ultimo.titulo}».`);
  }
  return partes.join(" ");
}

function hablarTeatro(clave: string, saber: TeatroSaber, datos: DatosMaestro): RespuestaMaestro {
  const titulo = TITULO[clave] ?? saber.nombre;
  const lineas: string[] = [];
  lineas.push(`Vamos con ${saber.nombre}. Primero, el terreno: ${saber.donde}`);
  lineas.push(estadoReal(datos, clave));
  lineas.push(
    `Ahora, el por qué importa. ${saber.porqueImporta} Los actores que cuentan aquí son ${saber.actores.join(", ")}.`,
  );
  lineas.push(`Qué hay que vigilar, en concreto: ${saber.queVigilar.join(". ")}.`);
  lineas.push(`Y un aviso de analista: ${saber.errorComun}`);
  lineas.push(
    `Si quieres, dime «dame un ejemplo sobre ${titulo}» y te lo bajo al último cable, con nombre y fecha.`,
  );
  return {
    hablar: lineas.join("\n\n"),
    modo: "teatro",
    ai: false,
    accion: { tipo: "navegar", destino: "", ruta: `/conflicto/${clave}`, consulta: clave },
    tema: clave,
    seguir: ["Dame un ejemplo", "Explícame la escalada", "¿Qué vigilo esta semana?"],
    fuentes: datos.teatros.find((t) => t.tag === clave)?.ultimo
      ? [
          {
            titulo: datos.teatros.find((t) => t.tag === clave)!.ultimo!.titulo,
            fuente: datos.teatros.find((t) => t.tag === clave)!.ultimo!.fuente,
            fecha: datos.teatros.find((t) => t.tag === clave)!.ultimo!.fecha,
            ruta: `/conflicto/${clave}`,
          },
        ]
      : [],
  };
}

function hablarPanorama(datos: DatosMaestro): RespuestaMaestro {
  const L: string[] = [];
  if (!datos.ok) {
    return {
      hablar: `No puedo darte el panorama con honestidad: ${datos.nota} Prefiero callarme las cifras antes que inventarlas.`,
      modo: "no-se",
      ai: false,
      accion: { tipo: "navegar", destino: "envivo", ruta: "/en-vivo" },
      tema: "panorama",
    };
  }
  const vivos = datos.teatros.filter((t) => t.n7 > 0).slice(0, 3);
  L.push(
    `Panorama. El archivo de la casa tiene ${datos.archivo} cables guardados; en las últimas veinticuatro horas han entrado ${datos.total24}, firmados por ${datos.medios.length} medios distintos.`,
  );
  if (vivos.length === 0) {
    L.push(
      "Ahora mismo no hay teatros con señal en la ventana medida. Eso no es paz: es que el archivo no ha recibido cables nuevos, y la casa no convierte el silencio en una historia.",
    );
  } else {
    L.push(
      `Los teatros que más han hablado son ${vivos
        .map((t) => `${TITULO[t.tag] ?? t.nombre}, con ${t.n7} cables`)
        .join("; ")}.`,
    );
    const primero = vivos[0];
    if (primero.ultimo) {
      L.push(
        `El último cable del más activo es de ${primero.ultimo.fuente}, y dice: «${primero.ultimo.titulo}».`,
      );
    }
    const saber = TEATROS_SABER[primero.tag];
    if (saber) {
      L.push(
        `Por qué importa: ${saber.porqueImporta} Y lo que yo vigilaría primero: ${saber.queVigilar[0]}.`,
      );
    }
  }
  L.push(
    "Si quieres, dime un teatro y te lo explico entero: terreno, actores, por qué importa y qué vigilar. También puedo darte una clase de un concepto, la disuasión, la zona gris, un punto de estrangulamiento.",
  );
  return {
    hablar: L.join("\n\n"),
    modo: "panorama",
    ai: false,
    accion: { tipo: "navegar", destino: "envivo", ruta: "/en-vivo" },
    tema: "panorama",
    seguir: vivos.slice(0, 3).map((t) => `Explícame ${TITULO[t.tag] ?? t.nombre}`),
    fuentes: vivos
      .filter((t) => t.ultimo)
      .map((t) => ({
        titulo: t.ultimo!.titulo,
        fuente: t.ultimo!.fuente,
        fecha: t.ultimo!.fecha,
        ruta: `/conflicto/${t.tag}`,
      })),
    briefing: vivos
      .filter((t) => t.ultimo)
      .map((t) => ({
        titulo: t.ultimo!.titulo,
        pais: TITULO[t.tag] ?? t.nombre,
        impacto: 70,
        tier: "URGENTE",
        edad: t.ultimo!.fecha,
      })),
  };
}

function hablarClase(c: ConceptoSaber, datos: DatosMaestro): RespuestaMaestro {
  const L: string[] = [];
  L.push(`Vamos a clase: ${c.nombre}. ${c.definicion}`);
  L.push(`Un ejemplo real para que se entienda: ${c.ejemplo}`);
  // ancla con el archivo real: el teatro más activo es el aula de hoy
  const vivo = datos.teatros.filter((t) => t.n7 > 0)[0];
  if (vivo && TEATROS_SABER[vivo.tag]) {
    L.push(
      `Y aplícamelo al teatro que hoy tiene más señal, ${TITULO[vivo.tag] ?? vivo.nombre}: ${TEATROS_SABER[vivo.tag].queVigilar[0]}. Eso es ${c.nombre} en la práctica.`,
    );
  }
  L.push(
    "Si quieres, te doy el siguiente escalón: dime «dame otro ejemplo» y lo bajo a un caso concreto del archivo.",
  );
  return {
    hablar: L.join("\n\n"),
    modo: "clase",
    ai: false,
    accion: { tipo: "hablar" },
    tema: `concepto:${c.id}`,
    seguir: ["Dame otro ejemplo", "Explícame la disuasión", "¿Qué pasa hoy en el mundo?"],
  };
}

function hablarCronica(datos: DatosMaestro): RespuestaMaestro {
  const L: string[] = [];
  if (!datos.ok) {
    return {
      hablar: `No hay crónica que darte: ${datos.nota}`,
      modo: "no-se",
      ai: false,
      accion: { tipo: "navegar", destino: "", ruta: "/cronica" },
      tema: "cronica",
    };
  }
  L.push(
    `La crónica del día. Corte de ahora mismo. En las últimas veinticuatro horas el archivo registró ${datos.total24} cables; la ventana de siete días suma ${datos.total7}.`,
  );
  const con24 = datos.teatros.filter((t) => t.n24 > 0);
  if (con24.length === 0) {
    L.push(
      "Ningún teatro ha superado el filtro de las últimas veinticuatro horas, así que no te voy a inventar actividad: hoy el archivo está en silencio.",
    );
  } else {
    L.push(
      `Los teatros con movimiento de hoy: ${con24
        .map((t) => `${TITULO[t.tag] ?? t.nombre} con ${t.n24}`)
        .join(", ")}.`,
    );
  }
  if (datos.medios.length > 0) {
    L.push(`Los medios que han firmado: ${datos.medios.slice(0, 6).join(", ")}.`);
  }
  L.push("La crónica completa, con cada cable fechado, está en la sala Crónica del día. Te la abro si me lo pides.");
  return {
    hablar: L.join("\n\n"),
    modo: "cronica",
    ai: false,
    accion: { tipo: "navegar", destino: "", ruta: "/cronica" },
    tema: "cronica",
    seguir: ["Explícame Gaza", "¿Qué es la zona gris?", "Llévame a la crónica"],
  };
}

function hablarAyuda(): RespuestaMaestro {
  const L: string[] = [];
  L.push(
    "Puedo hacer cuatro cosas, y las hago de verdad. Una: explicarte un teatro — el terreno, los actores, por qué importa y qué vigilar — con las cifras reales del archivo de la casa.",
  );
  L.push(
    "Dos: darte clase de un concepto geopolítico con un ejemplo aplicado. Tres: leerte la crónica del día, la de verdad, con fuente y fecha.",
  );
  L.push(
    "Cuatro: llevarte por la casa. Dime «llévame al mar Rojo», «abre la crónica», «muéstrame el mundo» y abro la sala.",
  );
  L.push("Y una cosa que no hago: inventar. Si no lo sé o el archivo no trae señal, te lo digo.");
  return {
    hablar: L.join("\n\n"),
    modo: "ayuda",
    ai: false,
    accion: { tipo: "hablar" },
    tema: "ayuda",
    seguir: ["¿Qué pasa hoy en el mundo?", "Explícame Taiwán", "¿Qué es la disuasión?"],
  };
}

function hablarEjemplo(temaPrevio: string | undefined, datos: DatosMaestro): RespuestaMaestro {
  // ① si el tema abierto era un concepto, se baja a tierra con el teatro más vivo
  if (temaPrevio?.startsWith("concepto:")) {
    const id = temaPrevio.slice("concepto:".length);
    const c = CONCEPTOS_SABER.find((x) => x.id === id);
    const vivo = datos.teatros.filter((t) => t.n7 > 0)[0];
    const teatro = vivo ? TEATROS_SABER[vivo.tag] : undefined;
    const L: string[] = [];
    if (c) L.push(`Otro ejemplo de ${c.nombre}, este sacado del archivo de la casa.`);
    if (teatro && vivo) {
      L.push(
        `Mira ${TITULO[vivo.tag] ?? vivo.nombre}: ${teatro.queVigilar[0]}. Un analista no lee ahí un titular, lee una señal de ${c ? c.nombre : "poder"}: quién gana si eso cambia.`,
      );
      L.push(
        `Y el dato duro de hoy: ${vivo.n7} cables en la ventana, ${vivo.n24} en las últimas veinticuatro horas. El número no explica la guerra, pero te dice dónde poner los ojos.`,
      );
    } else {
      L.push(
        "Hoy no tengo un teatro con señal suficiente para aterrizar el ejemplo con datos reales. Cuando el archivo reciba cables, el ejemplo se pone solo.",
      );
    }
    return {
      hablar: L.join("\n\n"),
      modo: "ejemplo",
      ai: false,
      accion: { tipo: "hablar" },
      tema: temaPrevio,
      seguir: ["Explícame otro concepto", "¿Qué pasa hoy en el mundo?"],
    };
  }
  // ② si el tema era un teatro, se baja al detalle del último cable
  if (temaPrevio && TEATROS_SABER[temaPrevio]) {
    const saber = TEATROS_SABER[temaPrevio];
    const d = datos.teatros.find((t) => t.tag === temaPrevio);
    const L: string[] = [`Un ejemplo concreto de ${saber.nombre}.`];
    if (d?.ultimo) {
      L.push(
        `Toma el último cable: «${d.ultimo.titulo}», firmado por ${d.ultimo.fuente} el ${d.ultimo.fecha}. Lo importante no es el titular, es lo que mueve: ${saber.queVigilar[0]}.`,
      );
      L.push(`Si eso cambia, el siguiente en notarlo es ${saber.actores[0]}. Ahí está la cadena.`);
    } else {
      L.push(
        "No tengo un cable reciente de ese teatro en la ventana medida. Te doy el ejemplo de manual: " +
          saber.queVigilar[0] +
          ".",
      );
    }
    return {
      hablar: L.join("\n\n"),
      modo: "ejemplo",
      ai: false,
      accion: { tipo: "navegar", destino: "", ruta: `/conflicto/${temaPrevio}`, consulta: temaPrevio },
      tema: temaPrevio,
      seguir: ["Dame otro ejemplo", "¿Qué vigilo esta semana?"],
    };
  }
  return hablarPanorama(datos);
}

// ── El maestro, de una pieza ──
export function responder(
  texto: string,
  datos: DatosMaestro,
  historial: Turno[] = [],
): RespuestaMaestro {
  const t = norm(texto);
  const temaPrevio = [...historial].reverse().find((h) => h.rol === "casa" && h.texto.startsWith("TEMA:"))?.texto.slice(5).trim();

  if (t.length === 0) return hablarAyuda();

  // ① navegación explícita
  if (/(llevame|llévame|abre|abreme|ve a|ir a|muestrame|muéstrame|navega|entra a|saca)/.test(t)) {
    const puerta = buscaPuerta(t);
    if (puerta) {
      return {
        hablar: `Hecho. Te abro ${puerta.etiqueta}.`,
        modo: "navegar",
        ai: false,
        accion: { tipo: "navegar", destino: puerta.tab ?? "", ruta: puerta.ruta },
        tema: temaPrevio,
        seguir: ["¿Qué pasa hoy en el mundo?", "Explícame el mar Rojo"],
      };
    }
    const th = buscaTeatro(t);
    if (th) {
      return {
        hablar: `Hecho. Te abro el teatro de ${TITULO[th.clave] ?? th.saber.nombre}. Y si quieres, te lo explico aquí mismo: dime «explícame ${TITULO[th.clave] ?? th.saber.nombre}».`,
        modo: "navegar",
        ai: false,
        accion: { tipo: "navegar", destino: "", ruta: `/conflicto/${th.clave}`, consulta: th.clave },
        tema: th.clave,
      };
    }
  }

  // ② seguimiento conversacional (la conversación larga)
  const esSeguimiento =
    /(^|\s)(por que|y eso|no (te )?entiendo|no lo entiendo|explica(me)? (mejor|otra vez|eso)|mas detalle|amplia|profundiza|sigue|continua|y luego|que significa eso)(\s|$)/.test(t) ||
    /dame (otro|un) ejemplo|ponme un ejemplo|otro ejemplo|^ejemplo$|^un ejemplo$/.test(t);
  if (esSeguimiento && temaPrevio) {
    if (/ejemplo/.test(t)) return hablarEjemplo(temaPrevio, datos);
    if (temaPrevio.startsWith("concepto:")) {
      const c = CONCEPTOS_SABER.find((x) => x.id === temaPrevio.slice(9));
      if (c) return hablarClase(c, datos);
    }
    const saber = TEATROS_SABER[temaPrevio];
    if (saber) return hablarTeatro(temaPrevio, saber, datos);
    if (temaPrevio === "panorama") return hablarPanorama(datos);
    if (temaPrevio === "cronica") return hablarCronica(datos);
  }

  // ③ clase de concepto
  const concepto = buscaConcepto(t);
  if (concepto && /(que es|qué es|explica|explícame|significa|clase|ensename|enséñame|como funciona|cómo funciona|defin)/.test(t)) {
    return hablarClase(concepto, datos);
  }

  // ④ teatro
  const th = buscaTeatro(t);
  if (th) return hablarTeatro(th.clave, th.saber, datos);

  // ⑤ crónica / panorama
  if (/(cronica|crónica|el parte|parte del dia|que paso hoy|qué pasó hoy|resumen del dia)/.test(t)) {
    return hablarCronica(datos);
  }
  if (/(que pasa|qué pasa|noticias|panorama|como esta el mundo|cómo está el mundo|ultima hora|leeme|resumen|mundo)/.test(t)) {
    return hablarPanorama(datos);
  }

  // ⑥ ayuda
  if (/(que puedes hacer|qué puedes hacer|ayuda|ayudame|ayúdame|quien eres|quién eres|como funcionas)/.test(t)) {
    return hablarAyuda();
  }

  // ⑦ concepto suelto (sin verbo de pregunta): se ofrece la clase
  if (concepto) return hablarClase(concepto, datos);

  // ⑧ honestidad: no lo sé, y esto es lo que sí sé
  return {
    hablar:
      "Eso no lo tengo en el archivo de la casa, y prefiero decírtelo antes que improvisar. Lo que sí puedo hacer ahora mismo: explicarte un teatro con sus datos reales, darte clase de un concepto geopolítico, leerte la crónica del día o llevarte a una sala. Dime cuál.",
    modo: "no-se",
    ai: false,
    accion: { tipo: "hablar" },
    tema: temaPrevio,
    seguir: ["¿Qué pasa hoy en el mundo?", "Explícame Gaza", "¿Qué es la zona gris?"],
  };
}

/** El tema viaja DENTRO de la respuesta hablada hacia el cliente (memoria). */
export function marcarTema(r: RespuestaMaestro): Turno {
  return { rol: "casa", texto: `TEMA:${r.tema ?? ""}` };
}
