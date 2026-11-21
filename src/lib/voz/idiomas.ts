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
  /**
   * v437.0 · LAS CUATRO PERSONAS, DICHAS EN ESTE IDIOMA. En el orden de
   * PERSONAS (locutora · analista · general · cronista). El nombre es el de la
   * casa traducido, el lema es lo que se lee en la tarjeta y la intro es la
   * frase que la boca dice al elegirla: si esto quedara en español, elegir una
   * voz en inglés hablaría español, que es justo lo que el Dueño no quiere.
   */
  vocesDeCasa: { nombre: string; lema: string; intro: string }[];
  /** «Conversación · memoria del aparato» */
  conversacion: string;
  /** «Pausa / sigue» (el botón que calla a medias) */
  pausaSigue: string;
  /** «Calla» */
  callar: string;
  /** «Habla» (el micrófono en reposo) */
  micro: string;
  /** «Escuchando… pulsa para cortar» */
  microEscuchando: string;
  /** lo que se lee dentro de la caja de escribir */
  sitio: string;
  /** «Preguntar» */
  preguntar: string;
  /** «empezar de cero» */
  empezar: string;
  /** la pista de la conversación vacía */
  pista: string;
  /** «Fuentes de esta respuesta» */
  fuentes: string;
  /** la nota honesta del pie de la sala */
  nota: string;
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
      pausaSigue: "Pausa / sigue",
      callar: "Calla",
      micro: "Habla",
      microEscuchando: "Escuchando… pulsa para cortar",
      sitio: "Escríbele o háblale: «explícame el mar Rojo», «qué es la disuasión», «llévame a la crónica»…",
      preguntar: "Preguntar",
      empezar: "empezar de cero",
      pista: "Pregúntale lo que quieras de geopolítica: un teatro, un concepto, el parte del día. Y síguela — «dame un ejemplo», «¿por qué?», «sigue» — que la memoria aguanta la conversación.",
      fuentes: "FUENTES DE ESTA RESPUESTA",
      nota: "El maestro no inventa: si el archivo no trae señal, lo dice. Las cifras salen del archivo real de la casa y la memoria de la conversación no sale de tu aparato.",
      vocesDeCasa: [
        {
          nombre: "LA LOCUTORA",
          lema: "Voz de la casa: clara, media, sin prisa",
          intro: "Soy la locutora. Cuento la casa con voz clara, sin prisa, y digo siempre de dónde sale cada dato.",
        },
        {
          nombre: "EL ANALISTA",
          lema: "Geopolítica explicada: frío, seguro, con ejemplo",
          intro: "Soy el analista. Explico la geopolítica sin adornos: qué pasa, quién gana y con qué ejemplo se comprueba.",
        },
        {
          nombre: "EL GENERAL",
          lema: "Parte de guerra: grave, lento, sin adorno",
          intro: "Soy el general. Doy el parte grave y lento, sin adorno: así se dicen las cosas que cuestan vidas.",
        },
        {
          nombre: "EL CRONISTA",
          lema: "Cuenta lo que pasó, con fechas, sin dramatismo",
          intro: "Soy el cronista. Cuento lo que pasó con sus fechas, sin dramatismo y sin inventar lo que no está en el archivo.",
        },
      ],
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
      pausaSigue: "Pause / resume",
      callar: "Hush",
      micro: "Speak",
      microEscuchando: "Listening… tap to stop",
      sitio: "Type or speak: “explain the Red Sea”, “what is deterrence”, “take me to the chronicle”…",
      preguntar: "Ask",
      empezar: "start over",
      pista: "Ask anything about geopolitics: a theatre, a concept, today's report. And keep going — “give me an example”, “why?”, “continue” — the memory holds the conversation.",
      fuentes: "SOURCES FOR THIS ANSWER",
      nota: "The master does not invent: if the archive carries no signal, it says so. The figures come from the house's real archive, and the conversation memory never leaves your device.",
      vocesDeCasa: [
        {
          nombre: "THE ANCHOR",
          lema: "The house's voice: clear, mid-range, unhurried",
          intro: "I am the anchor. I tell the house's story in a clear voice, unhurried, and I always say where every figure comes from.",
        },
        {
          nombre: "THE ANALYST",
          lema: "Geopolitics explained: cool, certain, with an example",
          intro: "I am the analyst. I explain geopolitics without ornament: what happens, who wins, and which example proves it.",
        },
        {
          nombre: "THE GENERAL",
          lema: "Situation report: grave, slow, no ornament",
          intro: "I am the general. I give the report grave and slow, with no ornament: that is how you say the things that cost lives.",
        },
        {
          nombre: "THE CHRONICLER",
          lema: "Tells what happened, with dates, without drama",
          intro: "I am the chronicler. I tell what happened with its dates, without drama and without inventing what is not in the archive.",
        },
      ],
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
      pausaSigue: "Pausa / continua",
      callar: "Silencia",
      micro: "Fala",
      microEscuchando: "A ouvir… toca para cortar",
      sitio: "Escreve-lhe ou fala: «explica-me o mar Vermelho», «o que é a dissuasão», «leva-me à crónica»…",
      preguntar: "Perguntar",
      empezar: "começar de zero",
      pista: "Pergunta-lhe o que quiseres de geopolítica: um teatro, um conceito, o parte do dia. E continua — «dá-me um exemplo», «porquê?», «segue» — que a memória aguenta a conversa.",
      fuentes: "FONTES DESTA RESPOSTA",
      nota: "O mestre não inventa: se o arquivo não traz sinal, di-lo. As cifras saem do arquivo real da casa e a memória da conversa não sai do teu aparelho.",
      vocesDeCasa: [
        {
          nombre: "A LOCUTORA",
          lema: "Voz da casa: clara, média, sem pressa",
          intro: "Sou a locutora. Conto a casa com voz clara, sem pressa, e digo sempre de onde sai cada dado.",
        },
        {
          nombre: "O ANALISTA",
          lema: "Geopolítica explicada: frio, seguro, com exemplo",
          intro: "Sou o analista. Explico a geopolítica sem enfeites: o que acontece, quem ganha e com que exemplo se comprova.",
        },
        {
          nombre: "O GENERAL",
          lema: "Parte de guerra: grave, lento, sem adorno",
          intro: "Sou o general. Dou o parte grave e lento, sem adorno: é assim que se dizem as coisas que custam vidas.",
        },
        {
          nombre: "O CRONISTA",
          lema: "Conta o que aconteceu, com datas, sem dramatismo",
          intro: "Sou o cronista. Conto o que aconteceu com as suas datas, sem dramatismo e sem inventar o que não está no arquivo.",
        },
      ],
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
      pausaSigue: "Pause / reprends",
      callar: "Tais-toi",
      micro: "Parle",
      microEscuchando: "J'écoute… touche pour couper",
      sitio: "Écris-lui ou parle : «explique-moi la mer Rouge», «qu'est-ce que la dissuasion», «emmène-moi à la chronique»…",
      preguntar: "Demander",
      empezar: "repartir de zéro",
      pista: "Demande-lui ce que tu veux en géopolitique : un théâtre, un concept, le communiqué du jour. Et poursuis — « donne un exemple », « pourquoi ? », « continue » — la mémoire tient la conversation.",
      fuentes: "SOURCES DE CETTE RÉPONSE",
      nota: "Le maître n'invente pas : si les archives n'apportent aucun signal, il le dit. Les chiffres viennent des archives réelles de la maison et la mémoire de la conversation ne quitte pas ton appareil.",
      vocesDeCasa: [
        {
          nombre: "LA PRÉSENTATRICE",
          lema: "La voix de la maison : claire, médium, sans hâte",
          intro: "Je suis la présentatrice. Je raconte la maison d'une voix claire, sans hâte, et je dis toujours d'où vient chaque chiffre.",
        },
        {
          nombre: "L'ANALYSTE",
          lema: "Géopolitique expliquée : froid, sûr, avec un exemple",
          intro: "Je suis l'analyste. J'explique la géopolitique sans ornement : ce qui se passe, qui gagne, et par quel exemple on le vérifie.",
        },
        {
          nombre: "LE GÉNÉRAL",
          lema: "Communiqué de guerre : grave, lent, sans ornement",
          intro: "Je suis le général. Je donne le communiqué, grave et lent, sans ornement : c'est ainsi qu'on dit ce qui coûte des vies.",
        },
        {
          nombre: "LE CHRONIQUEUR",
          lema: "Raconte ce qui s'est passé, avec des dates, sans drame",
          intro: "Je suis le chroniqueur. Je raconte ce qui s'est passé avec ses dates, sans drame et sans inventer ce qui n'est pas aux archives.",
        },
      ],
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
      pausaSigue: "Pause / weiter",
      callar: "Still",
      micro: "Sprich",
      microEscuchando: "Ich höre… tippen zum Beenden",
      sitio: "Schreib oder sprich: „erklär mir das Rote Meer“, „was ist Abschreckung“, „bring mich zur Chronik“…",
      preguntar: "Fragen",
      empezar: "von vorn beginnen",
      pista: "Frag, was du über Geopolitik wissen willst: ein Schauplatz, ein Begriff, der Bericht des Tages. Und bleib dran — „gib mir ein Beispiel“, „warum?“, „weiter“ — das Gedächtnis hält das Gespräch.",
      fuentes: "QUELLEN DIESER ANTWORT",
      nota: "Der Meister erfindet nichts: bringt das Archiv kein Signal, sagt er es. Die Zahlen kommen aus dem echten Archiv des Hauses, und das Gesprächsgedächtnis verlässt dein Gerät nicht.",
      vocesDeCasa: [
        {
          nombre: "DIE SPRECHERIN",
          lema: "Die Stimme des Hauses: klar, mittlere Lage, ohne Eile",
          intro: "Ich bin die Sprecherin. Ich erzähle das Haus mit klarer Stimme, ohne Eile, und sage immer, woher jede Zahl kommt.",
        },
        {
          nombre: "DER ANALYST",
          lema: "Geopolitik erklärt: kühl, sicher, mit Beispiel",
          intro: "Ich bin der Analyst. Ich erkläre Geopolitik ohne Schmuck: was geschieht, wer gewinnt und mit welchem Beispiel man es prüft.",
        },
        {
          nombre: "DER GENERAL",
          lema: "Lagebericht: ernst, langsam, ohne Schmuck",
          intro: "Ich bin der General. Ich gebe den Bericht ernst und langsam, ohne Schmuck: so sagt man, was Leben kostet.",
        },
        {
          nombre: "DER CHRONIST",
          lema: "Erzählt, was geschah, mit Daten, ohne Dramatik",
          intro: "Ich bin der Chronist. Ich erzähle, was geschah, mit seinen Daten, ohne Dramatik und ohne zu erfinden, was nicht im Archiv steht.",
        },
      ],
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
      pausaSigue: "Pausa / riprendi",
      callar: "Taci",
      micro: "Parla",
      microEscuchando: "Sto ascoltando… tocca per fermare",
      sitio: "Scrivigli o parlagli: «spiegami il Mar Rosso», «che cos'è la deterrenza», «portami alla cronaca»…",
      preguntar: "Chiedere",
      empezar: "ricominciare da zero",
      pista: "Chiedigli quello che vuoi di geopolitica: un teatro, un concetto, il rapporto del giorno. E continua — «fammi un esempio», «perché?», «vai avanti» — che la memoria regge la conversazione.",
      fuentes: "FONTI DI QUESTA RISPOSTA",
      nota: "Il maestro non inventa: se l'archivio non porta segnale, lo dice. Le cifre vengono dall'archivio reale della casa e la memoria della conversazione non esce dal tuo apparecchio.",
      vocesDeCasa: [
        {
          nombre: "LA VOCE",
          lema: "La voce della casa: chiara, media, senza fretta",
          intro: "Sono la voce della casa. Racconto la casa con voce chiara, senza fretta, e dico sempre da dove viene ogni dato.",
        },
        {
          nombre: "L'ANALISTA",
          lema: "Geopolitica spiegata: freddo, sicuro, con un esempio",
          intro: "Sono l'analista. Spiego la geopolitica senza ornamenti: cosa accade, chi vince e con quale esempio si verifica.",
        },
        {
          nombre: "IL GENERALE",
          lema: "Rapporto di guerra: grave, lento, senza ornamento",
          intro: "Sono il generale. Do il rapporto grave e lento, senza ornamento: così si dicono le cose che costano vite.",
        },
        {
          nombre: "IL CRONISTA",
          lema: "Racconta ciò che è accaduto, con le date, senza dramma",
          intro: "Sono il cronista. Racconto ciò che è accaduto con le sue date, senza dramma e senza inventare ciò che non è nell'archivio.",
        },
      ],
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
      pausaSigue: "Пауза / дальше",
      callar: "Тишина",
      micro: "Говори",
      microEscuchando: "Слушаю… нажми, чтобы прервать",
      sitio: "Напиши или скажи: «объясни Красное море», «что такое сдерживание», «веди меня в хронику»…",
      preguntar: "Спросить",
      empezar: "начать заново",
      pista: "Спрашивай что угодно о геополитике: театр, понятие, сводка дня. И продолжай — «дай пример», «почему?», «дальше» — память держит разговор.",
      fuentes: "ИСТОЧНИКИ ЭТОГО ОТВЕТА",
      nota: "Мастер не выдумывает: если в архиве нет сигнала, он так и говорит. Цифры берутся из настоящего архива дома, а память разговора не покидает твой аппарат.",
      vocesDeCasa: [
        {
          nombre: "ДИКТОР",
          lema: "Голос дома: ясный, средний, без спешки",
          intro: "Я диктор. Рассказываю о доме ясным голосом, без спешки, и всегда говорю, откуда взята каждая цифра.",
        },
        {
          nombre: "АНАЛИТИК",
          lema: "Геополитика без украшений: холодно, уверенно, с примером",
          intro: "Я аналитик. Объясняю геополитику без украшений: что происходит, кто выигрывает и каким примером это проверяется.",
        },
        {
          nombre: "ГЕНЕРАЛ",
          lema: "Сводка: сурово, медленно, без украшений",
          intro: "Я генерал. Даю сводку сурово и медленно, без украшений: так говорят о том, что стоит жизней.",
        },
        {
          nombre: "ХРОНИКЁР",
          lema: "Рассказывает, что было, с датами, без драмы",
          intro: "Я хроникёр. Рассказываю, что было, с датами, без драмы и не выдумываю то, чего нет в архиве.",
        },
      ],
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
      pausaSigue: "暂停／继续",
      callar: "安静",
      micro: "说话",
      microEscuchando: "正在听……点按中断",
      sitio: "写字或说话：「讲讲红海」「什么是威慑」「带我去纪事」……",
      preguntar: "提问",
      empezar: "从头开始",
      pista: "地缘政治的事都可以问：一个战区、一个概念、今天的通报。接着往下问——「举个例子」「为什么？」「继续说」——记忆撑得住这场对话。",
      fuentes: "这条回答的来源",
      nota: "主人不编造：档案里没有信号，他就说没有。数字取自本宅的真实档案，对话记忆不离开你的设备。",
      vocesDeCasa: [
        {
          nombre: "播音员",
          lema: "本宅之声：清楚、中速、不急",
          intro: "我是本宅的播音员。我用清楚、不急的声音讲这座宅子，并且总说每个数字从哪里来。",
        },
        {
          nombre: "分析员",
          lema: "地缘政治解说：冷静、确定、带例子",
          intro: "我是分析员。我讲地缘政治不加修饰：发生了什么、谁占了上风、用什么例子可以验证。",
        },
        {
          nombre: "将军",
          lema: "战况通报：庄重、缓慢、不加修饰",
          intro: "我是将军。我用庄重而缓慢的声音通报，不加修饰：耗人性命的事就该这样讲。",
        },
        {
          nombre: "记录者",
          lema: "讲清发生过的事，带日期，不煽情",
          intro: "我是记录者。我带着日期讲发生过的事，不煽情，也不编造档案里没有的东西。",
        },
      ],
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
