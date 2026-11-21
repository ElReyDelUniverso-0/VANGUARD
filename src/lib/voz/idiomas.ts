// ═══════════════════════════════════════════════════════════════════════════
// v437.0 · LA VOZ EN TU IDIOMA — el mapa de la voz por idioma (idiomas.ts)
//
// El Dueño, textual: «pule más las voces, la personalización también, los
// idiomas en Vanguard — o sea que Vanguard al cambiar de idioma TODO cambie — y
// la voz más hermosa de todas».
//
// Este fichero es la respuesta a la parte que la casa sí puede controlar de
// verdad en un sintetizador del navegador: CUÁL se elige en cada idioma, CÓMO se
// prepara el texto para que se pueda decir en ese idioma, CUÁNTO respira y CÓMO
// se llama cada cosa en la sala donde se ajusta.
//
// Tres leyes que se cumplen aquí:
//  ① UNA SOLA TABLA. Los ocho idiomas de la casa viven en `IDIOMAS_VOZ`, con su
//     etiqueta BCP-47, sus voces buenas conocidas, sus símbolos y sus palabras.
//     Nadie más en el repositorio vuelve a escribir «es-ES» a mano.
//  ② LO QUE NO SE SABE, NO SE INVENTA. Si un idioma no tiene voz instalada, se
//     dice con nombre y apellido; no se finge que suena. Y las cifras solo se
//     escriben con letra donde la casa lo tiene comprobado (español): en los
//     demás idiomas se dejan en cifra, que el motor las lee bien.
//  ③ EL IDIOMA ES UNO. `idiomaActual()` lee el idioma que la casa ya guardó
//     (zustand persist «vanguard-lang-v1») y, si no lo encuentra, el `<html lang>`
//     que la v208.0 mantiene sincronizado. La boca y la interfaz no pueden ir
//     cada una por su lado.
//
// Sin DOM obligatorio, sin red, sin dependencias: se prueba en Node.
// ═══════════════════════════════════════════════════════════════════════════

import type { Lang } from "@/lib/i18n";

export type IdiomaVozId = "es" | "en" | "pt" | "fr" | "de" | "it" | "ru" | "zh";

export interface TextosVoz {
  /** «Idioma de la voz» */
  idioma: string;
  /** «Al cambiar de idioma cambia la casa entera: los textos y la boca» */
  idiomaNota: string;
  /** «Probar esta voz» */
  probar: string;
  /** «Automática (la casa elige la mejor)» */
  automatica: string;
  /** «Voces instaladas en tu aparato» */
  instaladas: string;
  velocidad: string;
  tono: string;
  pausas: string;
  /** «Sin voz» */
  sinVoz: string;
  /** «Esta voz habla…» */
  estaVoz: string;
  /** «se recuerda para este idioma» */
  seRecuerda: string;
  /** «Oír en este idioma» */
  oir: string;
  /** «Las cuatro voces de la casa · elige con quién hablas» */
  personas: string;
  /** «Conversación · memoria del aparato» */
  conversacion: string;
}

export interface IdiomaVoz {
  id: IdiomaVozId;
  /** etiqueta que se entrega al motor: `utterance.lang` */
  bcp47: string;
  /** el nombre del idioma en su propio idioma */
  nativo: string;
  /** dos letras (o un carácter) para el botón */
  glyph: string;
  /**
   * LA FRASE DE PRUEBA. Se dice al probar la voz: una frase de la casa, en ese
   * idioma, con coma, dos puntos y punto — así se oyen las tres pausas.
   */
  saludo: string;
  /** multiplicador de velocidad de arranque (se puede mover a mano) */
  ajusteRitmo: number;
  /** silencio después de cada frase, en ms */
  pausaFrase: number;
  /** silencio después de cada párrafo, en ms */
  pausaParrafo: number;
  /** símbolos que se dicen (no se deletrean) en este idioma */
  simbolos: [RegExp, string][];
  /** nombres de voz femeninos conocidos y buenos, en este idioma */
  femeninas: RegExp;
  /** nombres de voz masculinos conocidos y buenos, en este idioma */
  masculinas: RegExp;
  /** aviso honesto cuando el aparato no tiene NINGUNA voz de este idioma */
  sinVoces: string;
  /** aviso honesto cuando la mejor voz del idioma es de clase baja */
  mejorEsMala: string;
  textos: TextosVoz;
}

export const IDIOMAS_VOZ: Record<IdiomaVozId, IdiomaVoz> = {
  // ── ESPAÑOL ──────────────────────────────────────────────────────────────
  es: {
    id: "es",
    bcp47: "es-ES",
    nativo: "Español",
    glyph: "ES",
    saludo:
      "Radio Vanguard. Aquí está la voz de la casa: clara, sin prisa, con la fuente a la vista y la cifra intacta.",
    ajusteRitmo: 1,
    pausaFrase: 260,
    pausaParrafo: 700,
    simbolos: [
      [/%/g, " por ciento"],
      [/€/g, " euros"],
      [/\$/g, " dólares"],
      [/≈/g, " aproximadamente "],
      [/≥/g, " igual o mayor que "],
      [/≤/g, " igual o menor que "],
      [/→|➜|⟶/g, ", hacia "],
      [/&/g, " y "],
      [/@/g, " arroba "],
      [/\//g, " "],
    ],
    femeninas: /helena|sabina|mónica|monica|paulina|laura|elvira|estrella|camila|sofía|sofia|aria|female|mujer/i,
    masculinas: /jorge|pablo|diego|carlos|raúl|raul|álvaro|alvaro|gonzalo|enrique|male|hombre/i,
    sinVoces:
      "Tu aparato no tiene ninguna voz en español instalada. La casa no puede hablar sin ella: instala una en los ajustes del sistema (Android: Ajustes › Idiomas › Texto a voz; iPhone: Ajustes › Accesibilidad › Contenido leído).",
    mejorEsMala:
      "La mejor voz en español de tu aparato es de clase baja ({voz}: {nota}). Suena robótica porque lo es — no es la casa, es el aparato. Instala «Voz de Google» o una voz neuronal para que esto suene humano.",
    textos: {
      idioma: "Idioma de la voz",
      idiomaNota:
        "Al cambiar de idioma cambia la casa entera: lo que se lee y lo que se oye. Cada idioma guarda su propia voz y su propio ritmo.",
      probar: "Probar esta voz",
      automatica: "Automática",
      instaladas: "Voces instaladas en tu aparato para este idioma",
      velocidad: "Velocidad",
      tono: "Tono",
      pausas: "Pausas",
      sinVoz: "Sin voz",
      estaVoz: "Esta voz habla",
      seRecuerda: "se recuerda para este idioma",
      oir: "Oír en este idioma",
      personas: "LAS CUATRO VOCES DE LA CASA · elige con quién hablas",
      conversacion: "CONVERSACIÓN",
    },
  },

  // ── INGLÉS ───────────────────────────────────────────────────────────────
  en: {
    id: "en",
    bcp47: "en-US",
    nativo: "English",
    glyph: "EN",
    saludo:
      "Radio Vanguard. This is the voice of the house: clear, unhurried, and with the source in sight.",
    ajusteRitmo: 1,
    pausaFrase: 250,
    pausaParrafo: 680,
    simbolos: [
      [/%/g, " percent"],
      [/€/g, " euros"],
      [/\$/g, " dollars"],
      [/≈/g, " about "],
      [/≥/g, " at least "],
      [/≤/g, " at most "],
      [/→|➜|⟶/g, ", toward "],
      [/&/g, " and "],
      [/@/g, " at "],
      [/\//g, " "],
    ],
    femeninas: /aria|jenny|libby|sonia|samantha|victoria|zira|michelle|emma|female/i,
    masculinas: /guy|ryan|alex|daniel|david|mark|george|male/i,
    sinVoces:
      "Your device has no English voice installed. The house cannot speak without one: install it in the system settings (Android: Settings › Languages › Text-to-speech; iPhone: Settings › Accessibility › Spoken Content).",
    mejorEsMala:
      "The best English voice on your device is low class ({voz}: {nota}). It sounds robotic because it is — that is the device, not the house. Install a neural voice so this sounds human.",
    textos: {
      idioma: "Voice language",
      idiomaNota:
        "Changing the language changes the whole house: what you read and what you hear. Each language keeps its own voice and its own pace.",
      probar: "Test this voice",
      automatica: "Automatic",
      instaladas: "Voices installed on this device for this language",
      velocidad: "Speed",
      tono: "Pitch",
      pausas: "Pauses",
      sinVoz: "No voice",
      estaVoz: "This voice speaks",
      seRecuerda: "remembered for this language",
      oir: "Hear it in this language",
      personas: "THE FOUR VOICES OF THE HOUSE · choose who you talk to",
      conversacion: "CONVERSATION",
    },
  },

  // ── PORTUGUÉS ────────────────────────────────────────────────────────────
  pt: {
    id: "pt",
    bcp47: "pt-BR",
    nativo: "Português",
    glyph: "PT",
    saludo:
      "Rádio Vanguard. Esta é a voz da casa: clara, sem pressa, com a fonte à vista e a informação completa.",
    ajusteRitmo: 0.98,
    pausaFrase: 255,
    pausaParrafo: 690,
    simbolos: [
      [/%/g, " por cento"],
      [/€/g, " euros"],
      [/\$/g, " dólares"],
      [/≈/g, " aproximadamente "],
      [/≥/g, " igual ou maior que "],
      [/≤/g, " igual ou menor que "],
      [/→|➜|⟶/g, ", para "],
      [/&/g, " e "],
      [/@/g, " arroba "],
      [/\//g, " "],
    ],
    femeninas: /francisca|luciana|joana|ines|inês|camila|vitoria|vitória|maria|female/i,
    masculinas: /antonio|antônio|ricardo|felipe|daniel|male/i,
    sinVoces:
      "O teu aparelho não tem nenhuma voz em português instalada. A casa não pode falar sem ela: instala uma nas configurações do sistema (Android: Definições › Idiomas › Conversão de texto para voz; iPhone: Ajustes › Acessibilidade › Conteúdo falado).",
    mejorEsMala:
      "A melhor voz em português do teu aparelho é de classe baixa ({voz}: {nota}). Soa robótica porque o é — é o aparelho, não a casa. Instala uma voz neural para que isto soe humano.",
    textos: {
      idioma: "Idioma da voz",
      idiomaNota:
        "Ao mudar de idioma muda a casa inteira: o que se lê e o que se ouve. Cada idioma guarda a sua própria voz e o seu próprio ritmo.",
      probar: "Testar esta voz",
      automatica: "Automática",
      instaladas: "Vozes instaladas no teu aparelho para este idioma",
      velocidad: "Velocidade",
      tono: "Tom",
      pausas: "Pausas",
      sinVoz: "Sem voz",
      estaVoz: "Esta voz fala",
      seRecuerda: "guardado para este idioma",
      oir: "Ouvir neste idioma",
      personas: "AS QUATRO VOZES DA CASA · escolhe com quem falas",
      conversacion: "CONVERSA",
    },
  },

  // ── FRANCÉS ──────────────────────────────────────────────────────────────
  fr: {
    id: "fr",
    bcp47: "fr-FR",
    nativo: "Français",
    glyph: "FR",
    saludo:
      "Radio Vanguard. Voici la voix de la maison : claire, sans hâte, et la source toujours visible.",
    ajusteRitmo: 0.96,
    pausaFrase: 275,
    pausaParrafo: 720,
    simbolos: [
      [/%/g, " pour cent"],
      [/€/g, " euros"],
      [/\$/g, " dollars"],
      [/≈/g, " environ "],
      [/≥/g, " au moins "],
      [/≤/g, " au plus "],
      [/→|➜|⟶/g, ", vers "],
      [/&/g, " et "],
      [/@/g, " arobase "],
      [/\//g, " "],
    ],
    femeninas: /amélie|amelie|audrey|denise|julie|marie|chantal|female/i,
    masculinas: /henri|thomas|paul|claude|male/i,
    sinVoces:
      "Ton appareil n'a aucune voix en français installée. La maison ne peut pas parler sans elle : installe-la dans les réglages du système (Android : Paramètres › Langues › Synthèse vocale ; iPhone : Réglages › Accessibilité › Contenu énoncé).",
    mejorEsMala:
      "La meilleure voix française de ton appareil est de classe basse ({voz} : {nota}). Elle sonne robotique parce qu'elle l'est — c'est l'appareil, pas la maison. Installe une voix neuronale pour que cela sonne humain.",
    textos: {
      idioma: "Langue de la voix",
      idiomaNota:
        "Changer de langue change toute la maison : ce qui se lit et ce qui s'entend. Chaque langue garde sa voix et son rythme.",
      probar: "Tester cette voix",
      automatica: "Automatique",
      instaladas: "Voix installées sur ton appareil pour cette langue",
      velocidad: "Vitesse",
      tono: "Hauteur",
      pausas: "Pauses",
      sinVoz: "Sans voix",
      estaVoz: "Cette voix parle",
      seRecuerda: "mémorisé pour cette langue",
      oir: "Écouter dans cette langue",
      personas: "LES QUATRE VOIX DE LA MAISON · choisissez à qui parler",
      conversacion: "CONVERSATION",
    },
  },

  // ── ALEMÁN ───────────────────────────────────────────────────────────────
  de: {
    id: "de",
    bcp47: "de-DE",
    nativo: "Deutsch",
    glyph: "DE",
    saludo:
      "Radio Vanguard. Das ist die Stimme des Hauses: klar, ohne Eile, die Quelle im Blick und keine Zahl größer gemacht, als sie ist.",
    ajusteRitmo: 0.94,
    pausaFrase: 280,
    pausaParrafo: 730,
    simbolos: [
      [/%/g, " Prozent"],
      [/€/g, " Euro"],
      [/\$/g, " Dollar"],
      [/≈/g, " etwa "],
      [/≥/g, " mindestens "],
      [/≤/g, " höchstens "],
      [/→|➜|⟶/g, ", Richtung "],
      [/&/g, " und "],
      [/@/g, " At-Zeichen "],
      [/\//g, " "],
    ],
    femeninas: /katja|anna|marlene|vicki|hedda|female/i,
    masculinas: /conrad|stefan|hans|klaus|male/i,
    sinVoces:
      "Dein Gerät hat keine deutsche Stimme installiert. Das Haus kann ohne sie nicht sprechen: installiere sie in den Systemeinstellungen (Android: Einstellungen › Sprachen › Text-to-Speech; iPhone: Einstellungen › Bedienungshilfen › Gesprochene Inhalte).",
    mejorEsMala:
      "Die beste deutsche Stimme deines Geräts ist von niedriger Klasse ({voz}: {nota}). Sie klingt robotisch, weil sie es ist — das Gerät, nicht das Haus. Installiere eine neuronale Stimme.",
    textos: {
      idioma: "Sprache der Stimme",
      idiomaNota:
        "Ein Sprachwechsel ändert das ganze Haus: was du liest und was du hörst. Jede Sprache behält ihre Stimme und ihr Tempo.",
      probar: "Diese Stimme testen",
      automatica: "Automatisch",
      instaladas: "Auf diesem Gerät installierte Stimmen für diese Sprache",
      velocidad: "Tempo",
      tono: "Tonhöhe",
      pausas: "Pausen",
      sinVoz: "Keine Stimme",
      estaVoz: "Diese Stimme spricht",
      seRecuerda: "für diese Sprache gemerkt",
      oir: "In dieser Sprache hören",
      personas: "DIE VIER STIMMEN DES HAUSES · wähle, mit wem du sprichst",
      conversacion: "GESPRÄCH",
    },
  },

  // ── ITALIANO ─────────────────────────────────────────────────────────────
  it: {
    id: "it",
    bcp47: "it-IT",
    nativo: "Italiano",
    glyph: "IT",
    saludo:
      "Radio Vanguard. Questa è la voce della casa: chiara, senza fretta, con la fonte in vista.",
    ajusteRitmo: 1,
    pausaFrase: 255,
    pausaParrafo: 690,
    simbolos: [
      [/%/g, " per cento"],
      [/€/g, " euro"],
      [/\$/g, " dollari"],
      [/≈/g, " circa "],
      [/≥/g, " almeno "],
      [/≤/g, " al massimo "],
      [/→|➜|⟶/g, ", verso "],
      [/&/g, " e "],
      [/@/g, " chiocciola "],
      [/\//g, " "],
    ],
    femeninas: /elsa|isabella|alice|federica|female/i,
    masculinas: /diego|luca|cosimo|male/i,
    sinVoces:
      "Il tuo dispositivo non ha nessuna voce italiana installata. La casa non può parlare senza: installala nelle impostazioni di sistema (Android: Impostazioni › Lingue › Sintesi vocale; iPhone: Impostazioni › Accessibilità › Contenuto letto).",
    mejorEsMala:
      "La migliore voce italiana del tuo dispositivo è di classe bassa ({voz}: {nota}). Suona robotica perché lo è — è il dispositivo, non la casa. Installa una voce neurale.",
    textos: {
      idioma: "Lingua della voce",
      idiomaNota:
        "Cambiando lingua cambia tutta la casa: ciò che si legge e ciò che si sente. Ogni lingua conserva la sua voce e il suo ritmo.",
      probar: "Prova questa voce",
      automatica: "Automatica",
      instaladas: "Voci installate sul dispositivo per questa lingua",
      velocidad: "Velocità",
      tono: "Tono",
      pausas: "Pause",
      sinVoz: "Senza voce",
      estaVoz: "Questa voce parla",
      seRecuerda: "memorizzato per questa lingua",
      oir: "Ascolta in questa lingua",
      personas: "LE QUATTRO VOCI DELLA CASA · scegli con chi parlare",
      conversacion: "CONVERSAZIONE",
    },
  },

  // ── RUSO ─────────────────────────────────────────────────────────────────
  ru: {
    id: "ru",
    bcp47: "ru-RU",
    nativo: "Русский",
    glyph: "РУ",
    saludo:
      "Радио Вангард. Это голос дома: ясный, без спешки, и источник на виду.",
    ajusteRitmo: 0.92,
    pausaFrase: 285,
    pausaParrafo: 740,
    simbolos: [
      [/%/g, " процентов"],
      [/€/g, " евро"],
      [/\$/g, " долларов"],
      [/≈/g, " примерно "],
      [/≥/g, " не меньше "],
      [/≤/g, " не больше "],
      [/→|➜|⟶/g, ", к "],
      [/&/g, " и "],
      [/@/g, " собака "],
      [/\//g, " "],
    ],
    femeninas: /milena|katya|катя|ирина|мария|female/i,
    masculinas: /yuri|юрий|дмитрий|pavel|male/i,
    sinVoces:
      "На твоём устройстве нет русского голоса. Дом не может говорить без него: установи голос в настройках системы (Android: Настройки › Языки › Синтез речи; iPhone: Настройки › Универсальный доступ › Озвучивание).",
    mejorEsMala:
      "Лучший русский голос на твоём устройстве низкого класса ({voz}: {nota}). Он звучит роботом, потому что он робот — это устройство, а не дом. Установи нейронный голос.",
    textos: {
      idioma: "Язык голоса",
      idiomaNota:
        "Смена языка меняет весь дом: то, что читается, и то, что слышится. У каждого языка свой голос и свой ритм.",
      probar: "Проверить этот голос",
      automatica: "Автоматически",
      instaladas: "Установленные голоса для этого языка",
      velocidad: "Скорость",
      tono: "Тон",
      pausas: "Паузы",
      sinVoz: "Нет голоса",
      estaVoz: "Этот голос говорит",
      seRecuerda: "запоминается для этого языка",
      oir: "Слушать на этом языке",
      personas: "ЧЕТЫРЕ ГОЛОСА ДОМА · выбери, с кем говорить",
      conversacion: "РАЗГОВОР",
    },
  },

  // ── CHINO (mandarín) ─────────────────────────────────────────────────────
  zh: {
    id: "zh",
    bcp47: "zh-CN",
    nativo: "中文",
    glyph: "中",
    saludo: "先锋电台。这是本宅的声音：清楚，不急，来源一目了然。",
    ajusteRitmo: 0.9,
    pausaFrase: 240,
    pausaParrafo: 660,
    simbolos: [
      [/%/g, "百分之"],
      [/€/g, "欧元"],
      [/\$/g, "美元"],
      [/≈/g, "大约"],
      [/≥/g, "不少于"],
      [/≤/g, "不超过"],
      [/→|➜|⟶/g, "，朝着"],
      [/&/g, "和"],
      [/@/g, "艾特"],
      [/\//g, " "],
    ],
    femeninas: /xiaoxiao|xiaoyi|ting-ting|tingting|mei-jia|meijia|huihui|female/i,
    masculinas: /yunxi|yunyang|kangkang|male/i,
    sinVoces:
      "你的设备没有安装中文语音。没有语音，本宅无法开口：请在系统设置里安装（安卓：设置 › 语言 › 文字转语音；iPhone：设置 › 辅助功能 › 朗读内容）。",
    mejorEsMala:
      "你设备上最好的中文语音等级偏低（{voz}：{nota}）。它听起来像机器人，因为它就是——问题在设备，不在本宅。请安装神经语音。",
    textos: {
      idioma: "语音语言",
      idiomaNota: "换语言就换整个宅子：读到的和听到的都会变。每种语言保留自己的声音和节奏。",
      probar: "试听这个声音",
      automatica: "自动",
      instaladas: "本设备为该语言安装的语音",
      velocidad: "速度",
      tono: "音高",
      pausas: "停顿",
      sinVoz: "无语音",
      estaVoz: "这个声音说的是",
      seRecuerda: "会为该语言记住",
      oir: "用这个语言听",
      personas: "本宅的四个声音 · 选择跟谁说话",
      conversacion: "对话",
    },
  },
};

/** Los ocho, en el orden en que se enseñan (el de la casa: ES primero). */
export const ORDEN_IDIOMAS: IdiomaVozId[] = ["es", "en", "pt", "fr", "de", "it", "ru", "zh"];

export function esIdiomaVoz(x: unknown): x is IdiomaVozId {
  return typeof x === "string" && (ORDEN_IDIOMAS as string[]).includes(x);
}

/** Tabla de un idioma; si no existe, la del español (la casa nunca se queda sin). */
export function idiomaVoz(id: string | null | undefined): IdiomaVoz {
  const base = (id || "es").slice(0, 2).toLowerCase();
  return esIdiomaVoz(base) ? IDIOMAS_VOZ[base] : IDIOMAS_VOZ.es;
}

/** El idioma de la interfaz, como idioma de voz (mismo alfabeto de códigos). */
export function comoIdiomaVoz(lang: Lang | string | null | undefined): IdiomaVozId {
  const base = (lang || "es").slice(0, 2).toLowerCase();
  return esIdiomaVoz(base) ? base : "es";
}

/**
 * EL IDIOMA DE LA CASA, EN UN SOLO SITIO.
 *
 * ① el idioma que zustand persist guardó («vanguard-lang-v1») — es la palabra
 *    del piloto y manda aunque el HTML aún no se haya repintado;
 * ② si no hay nada guardado, el `<html lang>` que la v208.0 mantiene al día;
 * ③ si tampoco, español.
 */
export function idiomaActual(): IdiomaVozId {
  if (typeof window === "undefined") return "es";
  try {
    const crudo = window.localStorage.getItem("vanguard-lang-v1");
    if (crudo) {
      const j = JSON.parse(crudo) as { state?: { lang?: string } };
      const guardado = j?.state?.lang;
      if (esIdiomaVoz(guardado)) return guardado;
    }
  } catch {
    /* modo privado o JSON roto: se sigue al ② */
  }
  try {
    const html = document.documentElement?.lang;
    if (html) return comoIdiomaVoz(html);
  } catch {
    /* sin documento: la casa habla en español */
  }
  return "es";
}

/**
 * LA VOZ DE UN IDIOMA EN EL APARATO. Devuelve el censo ya puntuado, o vacío.
 * Se deja aquí (y no en decir.ts) para que la tabla y su uso vivan juntos.
 */
export interface VozCruda {
  uri: string;
  nombre: string;
  idioma: string;
}

export function hablaEseIdioma(langVoz: string | undefined, id: IdiomaVozId): boolean {
  if (!langVoz) return false;
  const l = langVoz.toLowerCase().replace("_", "-");
  const objetivo = IDIOMAS_VOZ[id];
  const base = objetivo.bcp47.slice(0, 2).toLowerCase();
  if (id === "zh") return l.startsWith("zh") || l.startsWith("cmn");
  return l.split("-")[0] === base;
}

/** El símbolo «%» se dice distinto en cada idioma: esta es la tabla que manda. */
export function decirSimbolo(id: IdiomaVozId, simbolo: string): string {
  const t = IDIOMAS_VOZ[id].simbolos.find(([re]) => re.test(simbolo));
  return t ? t[1].trim() : simbolo;
}
