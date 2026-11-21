// ═══════════════════════════════════════════════════════════════════════════
// v437.0 · LA RADIO EN TU IDIOMA — los marcos del programa (marcos.ts)
//
// Encargo del Dueño: «los idiomas en Vanguard, o sea que Vanguard al cambiar de
// idioma TODO cambie». Un programa de radio son dos cosas pegadas: lo que la
// casa DICE (sus fórmulas: sintonía, cifras, puentes, cierre) y lo que el ARCHIVO
// trae (titulares, resumen, fuente, hora). Esto separa las dos, y solo traduce
// lo primero — lo segundo se lee tal como se publicó, sin inventar traducciones.
//
// LA LEY, ESCRITA AQUÍ PARA QUE NO SE OLVIDE:
//   ① LO QUE ES DE LA CASA SE DICE EN TU IDIOMA. Las siete fórmulas de cada
//      estilo/lenguaje son nuestras: se traducen enteras.
//   ② LO QUE ES DEL CABLE NO SE TOCA. Titular, resumen y fuente viajan en el
//      idioma en que el medio los publicó. La casa no traduce a ojo: si algún
//      día se traduce, será con un modelo y se dirá cuál.
//   ③ EN ESPAÑOL NADA CAMBIA. Los tres estilos (serena, cercana, filosa) siguen
//      diciendo exactamente lo que decían: sus textos están copiados tal cual.
//   ④ EN LOS DEMÁS IDIOMAS EL ESTILO NO CAMBIA LAS PALABRAS, cambia la entrega
//      (velocidad y tono, que viven en las personas de la voz). Se dice aquí, en
//      voz alta, en vez de fingir siete traducciones por estilo.
// Sin DOM, sin red: se prueba en Node.
// ═══════════════════════════════════════════════════════════════════════════

import type { IdiomaVozId } from "@/lib/voz/idiomas";

export type EstiloRadio = "serena" | "cercana" | "filosa";

export interface CifrasArchivo {
  cables: number;
  medios: number;
  regiones: number;
}

export interface Marco {
  /** el punto final de una frase, en la escritura del idioma */
  punto: string;
  /** lo que separa dos datos seguidos (en chino, nada) */
  sep: string;
  /** [0] sintonía — puede llevar {hora} */
  saludo: string[];
  /** lo que se dice si el archivo está vacío */
  sinCables: string;
  /** «Estos son los cables que abren el día.» */
  titulares: string[];
  /** «Empezamos por» */
  antes: string[];
  /** «Seguimos.» */
  despues: string[];
  /** «Cambiamos de región.» */
  puente: string[];
  cierre: string[];
  invitacion: string[];
  /** «12 cables abiertos en el archivo» */
  archivo: (n: number) => string;
  /** «Hoy: 12 cables, 8 medios, 4 regiones.» */
  cifras: (c: CifrasArchivo) => string;
  /** «2 cables cuentan lo mismo que otro, así que los junto en un solo asunto.» */
  repetidos: (n: number) => string;
  /** «, también en 2 medios» */
  tambienEn: (n: number) => string;
  /** «Fuente: » */
  fuente: string;
  /** «hace 12 minutos» */
  hace: (iso: string, ahora: number) => string;
  /** nombre legible de la región */
  region: (clave: string) => string;
  /** el bloque de desarrollo entero */
  desarrollo: (titulo: string, cuerpo: string, fuente: string, cuando: string) => string;
  /** «Este asunto lo firman tres medios: A, B y C. Te he leído la versión de X.» */
  firma: (cuantos: number, lista: string, leida: string, otros: number) => string;
  /** el título del programa */
  titulo: (titulares: number, asuntos: number) => string;
  rot: {
    sintonia: string;
    cifras: string;
    titulares: string;
    seguimos: string;
    cierre: string;
    invitacion: string;
    firma: string;
  };
}

// ── ESPAÑOL: los tres estilos de siempre, palabra por palabra ─────────────

const REGION_ES: Record<string, string> = {
  europa: "Europa",
  oriente: "Oriente Medio",
  americas: "América",
  africa: "África",
  asia: "Asia",
  mundo: "el mundo",
};

function haceEs(iso: string, ahora: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const min = Math.round((ahora - t) / 60000);
  if (min < 2) return "hace un momento";
  if (min < 60) return `hace ${min} minutos`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.round(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}

const comunES = {
  punto: ".",
  sep: " ",
  fuente: "Fuente: ",
  hace: haceEs,
  region: (clave: string) => REGION_ES[clave] ?? "el mundo",
  desarrollo: (titulo: string, cuerpo: string, fuente: string, cuando: string) =>
    `${titulo}.${cuerpo ? ` ${cuerpo}` : ""} Fuente: ${fuente}${cuando ? `, ${cuando}` : ""}.`,
  firma: (cuantos: number, lista: string, leida: string, otros: number) =>
    `Este asunto lo ${cuantos === 2 ? "firman dos medios" : `firman ${cuantos} medios`}: ${lista}. Te he leído la versión de ${leida}${otros ? `; las otras ${otros === 1 ? "está" : "están"} enlazadas en pantalla` : ""}.`,
  archivo: (n: number) => `${n} ${n === 1 ? "cable abierto" : "cables abiertos"} en el archivo`,
  cifras: (c: CifrasArchivo) =>
    `Hoy: ${c.cables} ${c.cables === 1 ? "cable" : "cables"}, ${c.medios} ${c.medios === 1 ? "medio" : "medios"}, ${c.regiones} ${c.regiones === 1 ? "región" : "regiones"}.`,
  repetidos: (n: number) =>
    `${n} ${n === 1 ? "cable cuenta" : "cables cuentan"} lo mismo que otro, así que los junto en un solo asunto.`,
  tambienEn: (n: number) => `, también en ${n} ${n === 1 ? "medio" : "medios"}`,
  titulo: (titulares: number, asuntos: number) =>
    `Radio Vanguard · ${titulares} titulares, ${asuntos} ${asuntos === 1 ? "asunto" : "asuntos"}`,
};

const MARCOS_ES: Record<EstiloRadio, Marco> = {
  serena: {
    ...comunES,
    saludo: ["Radio Vanguard. La casa te cuenta el día.", "Son las {hora}. Esto es Radio Vanguard."],
    sinCables:
      "Radio Vanguard. Ahora mismo el archivo no tiene cables nuevos: cuando lleguen, aquí estarán.",
    titulares: ["Estos son los cables que abren el día.", "Los asuntos para entender la jornada.", "Lo que hay, en orden."],
    antes: ["Empezamos por", "Vamos con", "Primer asunto:"],
    despues: ["Seguimos.", "Siguiente.", "Otro frente."],
    puente: ["Cambiamos de región.", "Nos vamos a", "Ahora, en"],
    cierre: [
      "Hasta aquí el programa. Las fuentes quedan en pantalla.",
      "Esto es todo por ahora.",
      "Cerramos aquí. Todo lo dicho tiene su fuente.",
    ],
    invitacion: [
      "Puedes preguntarme por cualquier frente. Te responderé con lo que hay en el archivo, y te diré cuándo no hay nada.",
    ],
    rot: {
      sintonia: "Sintonía",
      cifras: "El archivo en cifras",
      titulares: "Titulares",
      seguimos: "Seguimos",
      cierre: "Cierre",
      invitacion: "Puedes preguntar",
      firma: "Quién lo firma",
    },
  },
  cercana: {
    ...comunES,
    saludo: [
      "¡Hola! Soy la voz de la casa. Vamos a ver el día juntos.",
      "Buenas. Te cuento lo que está pasando, sin prisa.",
      "Aquí la radio de la casa. Vamos allá.",
    ],
    sinCables:
      "Radio Vanguard. Ahora mismo el archivo no tiene cables nuevos: cuando lleguen, aquí estarán.",
    titulares: ["Te cuento lo que hay hoy.", "Mira lo que tenemos en el archivo.", "Esto es lo que ha entrado."],
    antes: ["Te cuento lo de", "Empecemos por", "Vamos con"],
    despues: ["Y ahora, otra cosa.", "Seguimos.", "Vamos a otro sitio."],
    puente: ["Nos vamos a", "Ahora te llevo a", "Cambiamos de escenario:"],
    cierre: [
      "Nada más por ahora. Todo lo que has oído tiene su fuente en pantalla.",
      "Y hasta aquí el paseo de hoy.",
      "Lo dejamos aquí, que el día sigue.",
    ],
    invitacion: [
      "Pregúntame lo que quieras: si está en el archivo te lo leo, y si no está, te lo digo claro.",
    ],
    rot: {
      sintonia: "Sintonía",
      cifras: "El archivo en cifras",
      titulares: "Titulares",
      seguimos: "Seguimos",
      cierre: "Cierre",
      invitacion: "Puedes preguntar",
      firma: "Quién lo firma",
    },
  },
  filosa: {
    ...comunES,
    saludo: ["Radio Vanguard. Sin adornos: los cables del día.", "Directo al grano.", "Lo que hay, sin relleno."],
    sinCables:
      "Radio Vanguard. Ahora mismo el archivo no tiene cables nuevos: cuando lleguen, aquí estarán.",
    titulares: ["Esto es lo que hay.", "Los titulares, sin relleno.", "Los hechos, uno detrás de otro."],
    antes: ["Primero:", "Vamos con", "Empezamos por"],
    despues: ["Siguiente.", "Vamos a lo siguiente.", "Otro."],
    puente: ["Saltamos a", "Ahora:", "Nos vamos a"],
    cierre: [
      "Fin del programa. Las fuentes están en pantalla: compruébalas.",
      "Corto y claro: hasta aquí.",
      "Se acabó. Los datos, a la vista.",
    ],
    invitacion: ["Si quieres una explicación, pregunta. Si no lo sé, no me lo invento."],
    rot: {
      sintonia: "Sintonía",
      cifras: "El archivo en cifras",
      titulares: "Titulares",
      seguimos: "Seguimos",
      cierre: "Cierre",
      invitacion: "Puedes preguntar",
      firma: "Quién lo firma",
    },
  },
};

// ── LOS DEMÁS IDIOMAS: un marco por idioma (las fórmulas son de la casa) ──

// La etiqueta de la fuente es una sola por idioma: la usan el campo `fuente` y
// el bloque de desarrollo, y así no pueden decir cosas distintas.
const FUENTE_EN = "Source: ";
const FUENTE_PT = "Fonte: ";
const FUENTE_FR = "Source : ";
const FUENTE_DE = "Quelle: ";
const FUENTE_IT = "Fonte: ";
const FUENTE_RU = "Источник: ";
const FUENTE_ZH = "来源：";

const MARCOS_OTROS: Record<Exclude<IdiomaVozId, "es">, Marco> = {
  en: {
    punto: ".",
    sep: " ",
    saludo: ["Radio Vanguard. The house tells you the day.", "This is Radio Vanguard, with the source in sight."],
    sinCables: "Radio Vanguard. The archive has no new cables right now: when they arrive, they will be here.",
    titulares: ["These are the cables that open the day.", "What there is, in order."],
    antes: ["We start with", "First:"],
    despues: ["Next.", "Moving on."],
    puente: ["We change region.", "Now, in"],
    cierre: ["That is the programme. The sources stay on screen."],
    invitacion: ["Ask me about any front: if it is in the archive I will read it, and if it is not, I will say so."],
    archivo: (n) => `${n} ${n === 1 ? "open cable" : "open cables"} in the archive`,
    cifras: (c) =>
      `Today: ${c.cables} ${c.cables === 1 ? "cable" : "cables"}, ${c.medios} ${c.medios === 1 ? "outlet" : "outlets"}, ${c.regiones} ${c.regiones === 1 ? "region" : "regions"}.`,
    repetidos: (n) => `${n} ${n === 1 ? "cable tells" : "cables tell"} the same as another, so I read them as one story.`,
    tambienEn: (n) => `, also in ${n} ${n === 1 ? "outlet" : "outlets"}`,
    fuente: "Source: ",
    hace: (iso, ahora) => {
      const t = Date.parse(iso);
      if (!Number.isFinite(t)) return "";
      const min = Math.round((ahora - t) / 60000);
      if (min < 2) return "just now";
      if (min < 60) return `${min} minutes ago`;
      const h = Math.round(min / 60);
      if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"} ago`;
      const d = Math.round(h / 24);
      return `${d} ${d === 1 ? "day" : "days"} ago`;
    },
    region: (k) =>
      ({ europa: "Europe", oriente: "the Middle East", americas: "the Americas", africa: "Africa", asia: "Asia" })[k] ??
      "the world",
    desarrollo: (titulo, cuerpo, fuente, cuando) =>
      `${titulo}.${cuerpo ? ` ${cuerpo}` : ""} ${FUENTE_EN}${fuente}${cuando ? `, ${cuando}` : ""}.`,
    firma: (cuantos, lista, leida, otros) =>
      `This story is signed by ${cuantos} outlets: ${lista}. I read you the version from ${leida}${otros ? `; the others are linked on screen` : ""}.`,
    titulo: (t, a) => `Radio Vanguard · ${t} headlines, ${a} ${a === 1 ? "story" : "stories"}`,
    rot: {
      sintonia: "Station id",
      cifras: "The archive in numbers",
      titulares: "Headlines",
      seguimos: "Next",
      cierre: "Close",
      invitacion: "You can ask",
      firma: "Who signs it",
    },
  },

  pt: {
    punto: ".",
    sep: " ",
    saludo: ["Rádio Vanguard. A casa conta-te o dia.", "Isto é a Rádio Vanguard, com a fonte à vista."],
    sinCables: "Rádio Vanguard. Neste momento o arquivo não tem cabos novos: quando chegarem, estarão aqui.",
    titulares: ["Estes são os cabos que abrem o dia.", "O que há, por ordem."],
    antes: ["Começamos por", "Primeiro:"],
    despues: ["Seguimos.", "Vamos a outro."],
    puente: ["Mudamos de região.", "Agora, em"],
    cierre: ["Até aqui o programa. As fontes ficam no ecrã."],
    invitacion: ["Pergunta-me por qualquer frente: se estiver no arquivo, leio-o; se não estiver, digo-to."],
    archivo: (n) => `${n} ${n === 1 ? "cabo aberto" : "cabos abertos"} no arquivo`,
    cifras: (c) =>
      `Hoje: ${c.cables} ${c.cables === 1 ? "cabo" : "cabos"}, ${c.medios} ${c.medios === 1 ? "meio" : "meios"}, ${c.regiones} ${c.regiones === 1 ? "região" : "regiões"}.`,
    repetidos: (n) => `${n} ${n === 1 ? "cabo conta" : "cabos contam"} o mesmo que outro, por isso junto-os num só assunto.`,
    tambienEn: (n) => `, também em ${n} ${n === 1 ? "meio" : "meios"}`,
    fuente: "Fonte: ",
    hace: (iso, ahora) => {
      const t = Date.parse(iso);
      if (!Number.isFinite(t)) return "";
      const min = Math.round((ahora - t) / 60000);
      if (min < 2) return "há um momento";
      if (min < 60) return `há ${min} minutos`;
      const h = Math.round(min / 60);
      if (h < 24) return `há ${h} ${h === 1 ? "hora" : "horas"}`;
      const d = Math.round(h / 24);
      return `há ${d} ${d === 1 ? "dia" : "dias"}`;
    },
    region: (k) =>
      ({ europa: "Europa", oriente: "o Médio Oriente", americas: "as Américas", africa: "África", asia: "a Ásia" })[k] ??
      "o mundo",
    desarrollo: (titulo, cuerpo, fuente, cuando) =>
      `${titulo}.${cuerpo ? ` ${cuerpo}` : ""} ${FUENTE_PT}${fuente}${cuando ? `, ${cuando}` : ""}.`,
    firma: (cuantos, lista, leida, otros) =>
      `Este assunto é assinado por ${cuantos} meios: ${lista}. Li-te a versão de ${leida}${otros ? `; as outras estão ligadas no ecrã` : ""}.`,
    titulo: (t, a) => `Rádio Vanguard · ${t} títulos, ${a} ${a === 1 ? "assunto" : "assuntos"}`,
    rot: {
      sintonia: "Sintonia",
      cifras: "O arquivo em números",
      titulares: "Títulos",
      seguimos: "Seguimos",
      cierre: "Fecho",
      invitacion: "Podes perguntar",
      firma: "Quem assina",
    },
  },

  fr: {
    punto: ".",
    sep: " ",
    saludo: [
      "Radio Vanguard. La maison vous raconte la journée.",
      "Ici Radio Vanguard, la source toujours visible.",
    ],
    sinCables: "Radio Vanguard. Le fichier n'a aucun nouveau câble pour l'instant : dès qu'il en arrive, ils seront ici.",
    titulares: ["Voici les câbles qui ouvrent la journée.", "Ce qu'il y a, dans l'ordre."],
    antes: ["On commence par", "Premier point :"],
    despues: ["On continue.", "Au suivant."],
    puente: ["On change de région.", "Maintenant, en"],
    cierre: ["Voilà pour ce programme. Les sources restent à l'écran."],
    invitacion: ["Demandez-moi n'importe quel front : si c'est dans le fichier, je le lis ; sinon, je le dis."],
    archivo: (n) => `${n} ${n === 1 ? "câble ouvert" : "câbles ouverts"} dans le fichier`,
    cifras: (c) =>
      `Aujourd'hui : ${c.cables} ${c.cables === 1 ? "câble" : "câbles"}, ${c.medios} ${c.medios === 1 ? "média" : "médias"}, ${c.regiones} ${c.regiones === 1 ? "région" : "régions"}.`,
    repetidos: (n) => `${n} ${n === 1 ? "câble dit" : "câbles disent"} la même chose qu'un autre : je les réunis en un seul sujet.`,
    tambienEn: (n) => `, aussi dans ${n} ${n === 1 ? "média" : "médias"}`,
    fuente: "Source : ",
    hace: (iso, ahora) => {
      const t = Date.parse(iso);
      if (!Number.isFinite(t)) return "";
      const min = Math.round((ahora - t) / 60000);
      if (min < 2) return "à l'instant";
      if (min < 60) return `il y a ${min} minutes`;
      const h = Math.round(min / 60);
      if (h < 24) return `il y a ${h} ${h === 1 ? "heure" : "heures"}`;
      const d = Math.round(h / 24);
      return `il y a ${d} ${d === 1 ? "jour" : "jours"}`;
    },
    region: (k) =>
      ({ europa: "l'Europe", oriente: "le Moyen-Orient", americas: "les Amériques", africa: "l'Afrique", asia: "l'Asie" })[k] ??
      "le monde",
    desarrollo: (titulo, cuerpo, fuente, cuando) =>
      `${titulo}.${cuerpo ? ` ${cuerpo}` : ""} ${FUENTE_FR}${fuente}${cuando ? `, ${cuando}` : ""}.`,
    firma: (cuantos, lista, leida, otros) =>
      `Ce sujet est signé par ${cuantos} médias : ${lista}. Je vous lis la version de ${leida}${otros ? ` ; les autres sont liées à l'écran` : ""}.`,
    titulo: (t, a) => `Radio Vanguard · ${t} titres, ${a} ${a === 1 ? "sujet" : "sujets"}`,
    rot: {
      sintonia: "Indicatif",
      cifras: "Le fichier en chiffres",
      titulares: "Titres",
      seguimos: "On continue",
      cierre: "Clôture",
      invitacion: "Vous pouvez demander",
      firma: "Qui le signe",
    },
  },

  de: {
    punto: ".",
    sep: " ",
    saludo: ["Radio Vanguard. Das Haus erzählt dir den Tag.", "Hier ist Radio Vanguard, die Quelle im Blick."],
    sinCables: "Radio Vanguard. Das Archiv hat gerade keine neuen Kabel: sobald welche kommen, sind sie hier.",
    titulares: ["Das sind die Kabel, die den Tag öffnen.", "Was da ist, der Reihe nach."],
    antes: ["Wir beginnen mit", "Erstens:"],
    despues: ["Weiter.", "Nächstes."],
    puente: ["Wir wechseln die Region.", "Jetzt in"],
    cierre: ["Das war das Programm. Die Quellen bleiben auf dem Bildschirm."],
    invitacion: ["Frag mich zu jeder Front: steht es im Archiv, lese ich es vor; steht es nicht drin, sage ich es."],
    archivo: (n) => `${n} ${n === 1 ? "offenes Kabel" : "offene Kabel"} im Archiv`,
    cifras: (c) =>
      `Heute: ${c.cables} ${c.cables === 1 ? "Kabel" : "Kabel"}, ${c.medios} ${c.medios === 1 ? "Medium" : "Medien"}, ${c.regiones} ${c.regiones === 1 ? "Region" : "Regionen"}.`,
    repetidos: (n) => `${n} ${n === 1 ? "Kabel bringt" : "Kabel bringen"} dasselbe wie ein anderes — ich fasse sie zu einer Meldung zusammen.`,
    tambienEn: (n) => `, auch in ${n} ${n === 1 ? "Medium" : "Medien"}`,
    fuente: "Quelle: ",
    hace: (iso, ahora) => {
      const t = Date.parse(iso);
      if (!Number.isFinite(t)) return "";
      const min = Math.round((ahora - t) / 60000);
      if (min < 2) return "gerade eben";
      if (min < 60) return `vor ${min} Minuten`;
      const h = Math.round(min / 60);
      if (h < 24) return `vor ${h} ${h === 1 ? "Stunde" : "Stunden"}`;
      const d = Math.round(h / 24);
      return `vor ${d} ${d === 1 ? "Tag" : "Tagen"}`;
    },
    region: (k) =>
      ({ europa: "Europa", oriente: "der Nahe Osten", americas: "Amerika", africa: "Afrika", asia: "Asien" })[k] ??
      "die Welt",
    desarrollo: (titulo, cuerpo, fuente, cuando) =>
      `${titulo}.${cuerpo ? ` ${cuerpo}` : ""} ${FUENTE_DE}${fuente}${cuando ? `, ${cuando}` : ""}.`,
    firma: (cuantos, lista, leida, otros) =>
      `Diese Meldung ist von ${cuantos} Medien gezeichnet: ${lista}. Ich lese die Fassung von ${leida}${otros ? `; die anderen sind auf dem Bildschirm verlinkt` : ""}.`,
    titulo: (t, a) => `Radio Vanguard · ${t} Schlagzeilen, ${a} ${a === 1 ? "Meldung" : "Meldungen"}`,
    rot: {
      sintonia: "Senderkennung",
      cifras: "Das Archiv in Zahlen",
      titulares: "Schlagzeilen",
      seguimos: "Weiter",
      cierre: "Schluss",
      invitacion: "Du kannst fragen",
      firma: "Wer zeichnet",
    },
  },

  it: {
    punto: ".",
    sep: " ",
    saludo: ["Radio Vanguard. La casa ti racconta la giornata.", "Questa è Radio Vanguard, con la fonte in vista."],
    sinCables: "Radio Vanguard. In questo momento l'archivio non ha cavi nuovi: quando arriveranno, saranno qui.",
    titulares: ["Questi sono i cavi che aprono la giornata.", "Quello che c'è, in ordine."],
    antes: ["Cominciamo da", "Primo punto:"],
    despues: ["Seguiamo.", "Passiamo a un altro."],
    puente: ["Cambiamo regione.", "Adesso, in"],
    cierre: ["Fino a qui il programma. Le fonti restano sullo schermo."],
    invitacion: ["Chiedimi di qualsiasi fronte: se è nell'archivio te lo leggo, se non c'è te lo dico."],
    archivo: (n) => `${n} ${n === 1 ? "cavo aperto" : "cavi aperti"} nell'archivio`,
    cifras: (c) =>
      `Oggi: ${c.cables} ${c.cables === 1 ? "cavo" : "cavi"}, ${c.medios} ${c.medios === 1 ? "testata" : "testate"}, ${c.regiones} ${c.regiones === 1 ? "regione" : "regioni"}.`,
    repetidos: (n) => `${n} ${n === 1 ? "cavo dice" : "cavi dicono"} la stessa cosa di un altro: li unisco in un solo argomento.`,
    tambienEn: (n) => `, anche in ${n} ${n === 1 ? "testata" : "testate"}`,
    fuente: "Fonte: ",
    hace: (iso, ahora) => {
      const t = Date.parse(iso);
      if (!Number.isFinite(t)) return "";
      const min = Math.round((ahora - t) / 60000);
      if (min < 2) return "poco fa";
      if (min < 60) return `${min} minuti fa`;
      const h = Math.round(min / 60);
      if (h < 24) return `${h} ${h === 1 ? "ora" : "ore"} fa`;
      const d = Math.round(h / 24);
      return `${d} ${d === 1 ? "giorno" : "giorni"} fa`;
    },
    region: (k) =>
      ({ europa: "l'Europa", oriente: "il Medio Oriente", americas: "le Americhe", africa: "l'Africa", asia: "l'Asia" })[k] ??
      "il mondo",
    desarrollo: (titulo, cuerpo, fuente, cuando) =>
      `${titulo}.${cuerpo ? ` ${cuerpo}` : ""} ${FUENTE_IT}${fuente}${cuando ? `, ${cuando}` : ""}.`,
    firma: (cuantos, lista, leida, otros) =>
      `Questo argomento è firmato da ${cuantos} testate: ${lista}. Ti ho letto la versione di ${leida}${otros ? `; le altre sono linkate sullo schermo` : ""}.`,
    titulo: (t, a) => `Radio Vanguard · ${t} titoli, ${a} ${a === 1 ? "argomento" : "argomenti"}`,
    rot: {
      sintonia: "Sigla",
      cifras: "L'archivio in cifre",
      titulares: "Titoli",
      seguimos: "Seguiamo",
      cierre: "Chiusura",
      invitacion: "Puoi chiedere",
      firma: "Chi firma",
    },
  },

  ru: {
    punto: ".",
    sep: " ",
    saludo: ["Радио Вангард. Дом рассказывает тебе день.", "Это Радио Вангард, источник на виду."],
    sinCables: "Радио Вангард. Сейчас в архиве нет новых сообщений: когда появятся, они будут здесь.",
    titulares: ["Вот сообщения, которые открывают день.", "Что есть, по порядку."],
    antes: ["Начинаем с", "Первое:"],
    despues: ["Дальше.", "Следующее."],
    puente: ["Меняем регион.", "Теперь в"],
    cierre: ["На этом программа. Источники остаются на экране."],
    invitacion: ["Спроси о любом фронте: если это есть в архиве, я прочитаю; если нет — скажу."],
    archivo: (n) => `${n} ${n === 1 ? "открытое сообщение" : "открытых сообщений"} в архиве`,
    cifras: (c) =>
      `Сегодня: ${c.cables} ${c.cables === 1 ? "сообщение" : "сообщений"}, ${c.medios} ${c.medios === 1 ? "издание" : "изданий"}, ${c.regiones} ${c.regiones === 1 ? "регион" : "регионов"}.`,
    repetidos: (n) => `${n} ${n === 1 ? "сообщение говорит" : "сообщений говорят"} то же, что и другое: я объединяю их в одну тему.`,
    tambienEn: (n) => `, также в ${n} ${n === 1 ? "издании" : "изданиях"}`,
    fuente: "Источник: ",
    hace: (iso, ahora) => {
      const t = Date.parse(iso);
      if (!Number.isFinite(t)) return "";
      const min = Math.round((ahora - t) / 60000);
      if (min < 2) return "только что";
      if (min < 60) return `${min} минут назад`;
      const h = Math.round(min / 60);
      if (h < 24) return `${h} ${h === 1 ? "час" : "часов"} назад`;
      const d = Math.round(h / 24);
      return `${d} ${d === 1 ? "день" : "дней"} назад`;
    },
    region: (k) =>
      ({ europa: "Европа", oriente: "Ближний Восток", americas: "Америка", africa: "Африка", asia: "Азия" })[k] ??
      "мир",
    desarrollo: (titulo, cuerpo, fuente, cuando) =>
      `${titulo}.${cuerpo ? ` ${cuerpo}` : ""} ${FUENTE_RU}${fuente}${cuando ? `, ${cuando}` : ""}.`,
    firma: (cuantos, lista, leida, otros) =>
      `Эту тему подписывают ${cuantos} изданий: ${lista}. Я прочитал версию ${leida}${otros ? `; остальные связаны на экране` : ""}.`,
    titulo: (t, a) => `Радио Вангард · ${t} заголовков, ${a} ${a === 1 ? "тема" : "тем"}`,
    rot: {
      sintonia: "Позывные",
      cifras: "Архив в цифрах",
      titulares: "Заголовки",
      seguimos: "Дальше",
      cierre: "Закрытие",
      invitacion: "Можно спросить",
      firma: "Кто подписал",
    },
  },

  zh: {
    punto: "。",
    sep: "",
    saludo: ["先锋电台。本宅为你读今天。", "这里是先锋电台，来源一目了然。"],
    sinCables: "先锋电台。档案里现在没有新的消息：一有，就在这里。",
    titulares: ["下面是打开今天的几条消息。", "有什么，按顺序来。"],
    antes: ["先从", "第一条："],
    despues: ["继续。", "下一条。"],
    puente: ["换个地区。", "现在是"],
    cierre: ["节目到这里。来源都留在屏幕上。"],
    invitacion: ["随便问哪个方向：档案里有，我读给你听；没有，我就说没有。"],
    archivo: (n) => `档案里有 ${n} 条消息`,
    cifras: (c) => `今天：${c.cables} 条消息，${c.medios} 家媒体，${c.regiones} 个地区。`,
    repetidos: (n) => `有 ${n} 条消息说的是同一件事，我把它们并成一条。`,
    tambienEn: (n) => `，另有 ${n} 家媒体报道`,
    fuente: "来源：",
    hace: (iso, ahora) => {
      const t = Date.parse(iso);
      if (!Number.isFinite(t)) return "";
      const min = Math.round((ahora - t) / 60000);
      if (min < 2) return "刚刚";
      if (min < 60) return `${min} 分钟前`;
      const h = Math.round(min / 60);
      if (h < 24) return `${h} 小时前`;
      return `${Math.round(h / 24)} 天前`;
    },
    region: (k) =>
      ({ europa: "欧洲", oriente: "中东", americas: "美洲", africa: "非洲", asia: "亚洲" })[k] ?? "世界",
    desarrollo: (titulo, cuerpo, fuente, cuando) =>
      `${titulo}。${cuerpo ? ` ${cuerpo}` : ""} ${FUENTE_ZH}${fuente}${cuando ? `，${cuando}。` : "。"}`,
    firma: (cuantos, lista, leida, otros) =>
      `这条消息由 ${cuantos} 家媒体署名：${lista}。我读的是 ${leida} 的版本${otros ? "，其余的在屏幕上" : ""}。`,
    titulo: (t, a) => `先锋电台 · ${t} 条标题，${a} 条消息`,
    rot: {
      sintonia: "台标",
      cifras: "档案数据",
      titulares: "标题",
      seguimos: "继续",
      cierre: "结束",
      invitacion: "可以提问",
      firma: "谁署名",
    },
  },
};

/**
 * EL MARCO QUE MANDA. Español: los tres estilos, palabra por palabra. Otros
 * idiomas: su marco (el estilo cambia la entrega, no las palabras — está dicho).
 */
export function marcoDe(estilo: EstiloRadio, idioma: IdiomaVozId = "es"): Marco {
  if (idioma === "es") {
    return MARCOS_ES[estilo] ?? MARCOS_ES.cercana;
  }
  return MARCOS_OTROS[idioma as Exclude<IdiomaVozId, "es">] ?? MARCOS_OTROS.en;
}

/** ¿Este idioma cambia las palabras del programa, o solo la entrega? */
export function idiomaTraduceElPrograma(idioma: IdiomaVozId): boolean {
  return idioma !== "es";
}

export { MARCOS_ES };
