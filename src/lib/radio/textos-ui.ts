// ═══════════════════════════════════════════════════════════════════
// v437.1 · EL ESTUDIO HABLA EL IDIOMA DE LA CASA
//
// El Dueño, textual: «los idiomas en Vanguard, o sea que Vanguard al cambiar
// de idioma TODO cambie». v437.0 tradujo la VOZ: el guion, las fórmulas, la
// sala /voz. Faltaba el cromo del estudio: los botones, las etiquetas, los
// presets y las sugerencias seguían escritos en español aunque la casa
// estuviera en inglés.
//
// Aquí viven esos textos en los ocho idiomas, con la misma ley que la voz:
//   · un idioma sin texto no existe (el tipo obliga a los ocho);
//   · los huecos se rellenan con %a %b %t, nunca con concatenaciones que
//     cambien el orden de la frase (el alemán y el ruso lo agradecen);
//   · lo que se DICE (el guion) y lo que se LEE en los cables no se toca:
//     los cables llegan como se publicaron.
// ═══════════════════════════════════════════════════════════════════

import type { IdiomaVozId } from "@/lib/voz/idiomas";

export interface TextsRadio {
  /** «EN EL AIRE» / «EN SILENCIO» */
  onAir: string;
  offAir: string;
  /** la nota bajo el título: por qué los cables no se traducen */
  cableNota: string;
  /** «bloque 3 de 12» */
  parte: string;
  /** «frase 2 de 5» */
  frase: string;
  /** «silencio» */
  silencio: string;
  /** «12 bloques · 6 asuntos» */
  resumen: string;
  detener: string;
  /** «▶ Continuar (bloque 4)» */
  continuar: string;
  escuchar: string;
  pausa: string;
  anterior: string;
  anteriorTitle: string;
  siguiente: string;
  siguienteTitle: string;
  /** «quedan 03:12» */
  quedan: string;
  /** «05:00 en total» */
  total: string;
  copiarGuion: string;
  copiarRadio: string;
  copiado: string;
  ariaPrograma: string;
  ariaBloques: string;
  /** «Ir al bloque 3: titular» */
  irAlBloque: string;
  ariaGuion: string;
  ariaCharla: string;
  charlaTitulo: string;
  charlaSub: string;
  escribirPregunta: string;
  sitioPregunta: string;
  hablar: string;
  escucho: string;
  preguntar: string;
  puedesSeguir: string;
  vacio: string;
  tu: string;
  ariaAjustes: string;
  tituloAjustes: string;
  estilo: string;
  estilos: [string, string, string];
  /** «Duración · 5 min» */
  duracion: string;
  duraciones: [string, string, string, string];
  persona: string;
  /** «Voz del aparato (12)» */
  vozAparato: string;
  mejorDisponible: string;
  /** «Velocidad · 0.95×» */
  velocidad: string;
  /** «Tono · 1.02» */
  tono: string;
  pausas: string;
  conResumen: string;
  conFuentes: string;
  nota: string;
  presets: [{ nombre: string; detalle: string }, { nombre: string; detalle: string }, { nombre: string; detalle: string }, { nombre: string; detalle: string }];
  sugerencias: [string, string, string, string, string, string];
}

/** rellena «%a», «%b», «%c», «%t» sin tocar el orden de la frase */
export function rellena(patron: string, valores: Record<string, string | number>): string {
  return patron.replace(/%([abct])/g, (m, k: string) => (k in valores ? String(valores[k]) : m));
}

export const TEXTOS_RADIO: Record<IdiomaVozId, TextsRadio> = {
  es: {
    onAir: "EN EL AIRE",
    offAir: "EN SILENCIO",
    cableNota: "· los cables llegan en el idioma en que se publicaron",
    parte: "bloque %a de %b",
    frase: "frase %a de %b",
    silencio: "silencio",
    resumen: "%a bloques · %b asuntos",
    detener: "◼ Detener",
    continuar: "▶ Continuar (bloque %a)",
    escuchar: "▶ Escuchar el programa",
    pausa: "Pausa",
    anterior: "Bloque anterior",
    anteriorTitle: "Bloque anterior (←)",
    siguiente: "Bloque siguiente",
    siguienteTitle: "Bloque siguiente (→)",
    quedan: "quedan %t",
    total: "%t en total",
    copiarGuion: "Copiar el guion",
    copiarRadio: "Copiar mi radio",
    copiado: "✓ Copiado",
    ariaPrograma: "El programa",
    ariaBloques: "Bloques del programa",
    irAlBloque: "Ir al bloque %a: %b",
    ariaGuion: "Guion del programa",
    ariaCharla: "Habla con la radio",
    charlaTitulo: "Pregúntale a la radio",
    charlaSub:
      "Entiende seguimientos («cuéntame más», «la segunda») y cifras del archivo. Responde con los cables de la casa y cita la fuente. Si no hay nada sobre lo que preguntas, lo dice.",
    escribirPregunta: "Escribe tu pregunta",
    sitioPregunta: "¿Qué pasa en Ucrania? · resumen · cuéntame más",
    hablar: "Hablar",
    escucho: "Escucho…",
    preguntar: "Preguntar",
    puedesSeguir: "Puedes seguir con:",
    vacio: "Aún no le has preguntado nada.",
    tu: "Tú",
    ariaAjustes: "Personalización",
    tituloAjustes: "Tu radio",
    estilo: "Estilo",
    estilos: ["Serena · informativa", "Cercana · conversacional", "Filosa · directa"],
    duracion: "Duración · %a min",
    duraciones: [
      "2 minutos · lo esencial",
      "5 minutos · el día",
      "10 minutos · con detalle",
      "15 minutos · programa largo",
    ],
    persona: "Persona",
    vozAparato: "Voz del aparato (%a)",
    mejorDisponible: "La mejor disponible (automático)",
    velocidad: "Velocidad · %a×",
    tono: "Tono · %a",
    pausas: "Pausas naturales (respiración entre frases)",
    conResumen: "Leer también el resumen, no solo el titular",
    conFuentes: "Decir cuántos medios firman cada asunto",
    nota:
      "Todo se guarda en tu aparato; «Copiar mi radio» te da un enlace con estos ajustes. La voz la pone el sistema: si suena metálica, elige otra en la lista — la calidad de cada una está medida, no prometida. Atajos: espacio reproduce o para, ← → cambian de bloque, Esc detiene.",
    presets: [
      { nombre: "Mañana serena", detalle: "5 min · informativa · pausada" },
      { nombre: "Frente abierto", detalle: "10 min · directa · sin adornos" },
      { nombre: "Paseo largo", detalle: "15 min · cercana · con fuentes" },
      { nombre: "Solo lo esencial", detalle: "2 min · titulares y cierre" },
    ],
    sugerencias: [
      "Resumen del día",
      "¿Qué región tiene más?",
      "¿De qué se habla hoy?",
      "¿Qué pasa en Europa?",
      "¿Algo bueno?",
      "¿Qué puedes hacer?",
    ],
  },

  en: {
    onAir: "ON AIR",
    offAir: "OFF AIR",
    cableNota: "· the wires arrive in the language they were published in",
    parte: "block %a of %b",
    frase: "sentence %a of %b",
    silencio: "silence",
    resumen: "%a blocks · %b stories",
    detener: "◼ Stop",
    continuar: "▶ Resume (block %a)",
    escuchar: "▶ Listen to the programme",
    pausa: "Pause",
    anterior: "Previous block",
    anteriorTitle: "Previous block (←)",
    siguiente: "Next block",
    siguienteTitle: "Next block (→)",
    quedan: "%t left",
    total: "%t in total",
    copiarGuion: "Copy the script",
    copiarRadio: "Copy my radio",
    copiado: "✓ Copied",
    ariaPrograma: "The programme",
    ariaBloques: "Programme blocks",
    irAlBloque: "Go to block %a: %b",
    ariaGuion: "Programme script",
    ariaCharla: "Talk to the radio",
    charlaTitulo: "Ask the radio",
    charlaSub:
      "It follows up (“tell me more”, “the second one”) and reads figures from the archive. It answers with the house's wires and cites the source. If there is nothing on what you ask, it says so.",
    escribirPregunta: "Write your question",
    sitioPregunta: "What is happening in Ukraine? · summary · tell me more",
    hablar: "Speak",
    escucho: "Listening…",
    preguntar: "Ask",
    puedesSeguir: "You can go on with:",
    vacio: "You haven't asked it anything yet.",
    tu: "You",
    ariaAjustes: "Personalisation",
    tituloAjustes: "Your radio",
    estilo: "Style",
    estilos: ["Calm · informative", "Close · conversational", "Sharp · direct"],
    duracion: "Length · %a min",
    duraciones: ["2 minutes · the essentials", "5 minutes · the day", "10 minutes · with detail", "15 minutes · long programme"],
    persona: "Persona",
    vozAparato: "Device voice (%a)",
    mejorDisponible: "The best available (automatic)",
    velocidad: "Speed · %a×",
    tono: "Pitch · %a",
    pausas: "Natural pauses (breathing between sentences)",
    conResumen: "Read the summary too, not only the headline",
    conFuentes: "Say how many outlets sign each story",
    nota:
      "Everything is kept on your device; “Copy my radio” gives you a link with these settings. The device supplies the voice: if it sounds metallic, pick another from the list — each one's quality is measured, not promised. Shortcuts: space plays or stops, ← → change block, Esc stops.",
    presets: [
      { nombre: "Calm morning", detalle: "5 min · informative · unhurried" },
      { nombre: "Open front", detalle: "10 min · direct · no ornament" },
      { nombre: "Long walk", detalle: "15 min · close · with sources" },
      { nombre: "Only the essentials", detalle: "2 min · headlines and close" },
    ],
    sugerencias: [
      "Today's summary",
      "Which region has the most?",
      "What is being talked about today?",
      "What is happening in Europe?",
      "Anything good?",
      "What can you do?",
    ],
  },

  pt: {
    onAir: "NO AR",
    offAir: "EM SILÊNCIO",
    cableNota: "· os cabos chegam no idioma em que foram publicados",
    parte: "bloco %a de %b",
    frase: "período %a de %b",
    silencio: "silêncio",
    resumen: "%a blocos · %b assuntos",
    detener: "◼ Parar",
    continuar: "▶ Continuar (bloco %a)",
    escuchar: "▶ Ouvir o programa",
    pausa: "Pausa",
    anterior: "Bloco anterior",
    anteriorTitle: "Bloco anterior (←)",
    siguiente: "Bloco seguinte",
    siguienteTitle: "Bloco seguinte (→)",
    quedan: "faltam %t",
    total: "%t no total",
    copiarGuion: "Copiar o guião",
    copiarRadio: "Copiar a minha rádio",
    copiado: "✓ Copiado",
    ariaPrograma: "O programa",
    ariaBloques: "Blocos do programa",
    irAlBloque: "Ir para o bloco %a: %b",
    ariaGuion: "Guião do programa",
    ariaCharla: "Fala com a rádio",
    charlaTitulo: "Pergunta à rádio",
    charlaSub:
      "Entende seguimentos («conta-me mais», «a segunda») e cifras do arquivo. Responde com os cabos da casa e cita a fonte. Se não houver nada sobre o que perguntas, di-lo.",
    escribirPregunta: "Escreve a tua pergunta",
    sitioPregunta: "O que se passa na Ucrânia? · resumo · conta-me mais",
    hablar: "Falar",
    escucho: "Estou a ouvir…",
    preguntar: "Perguntar",
    puedesSeguir: "Podes seguir com:",
    vacio: "Ainda não lhe perguntaste nada.",
    tu: "Tu",
    ariaAjustes: "Personalização",
    tituloAjustes: "A tua rádio",
    estilo: "Estilo",
    estilos: ["Serena · informativa", "Próxima · conversacional", "Afiada · direta"],
    duracion: "Duração · %a min",
    duraciones: ["2 minutos · o essencial", "5 minutos · o dia", "10 minutos · com detalhe", "15 minutos · programa longo"],
    persona: "Voz",
    vozAparato: "Voz do aparelho (%a)",
    mejorDisponible: "A melhor disponível (automático)",
    velocidad: "Velocidade · %a×",
    tono: "Tonalidade · %a",
    pausas: "Pausas naturais (respiração entre frases)",
    conResumen: "Ler também o resumo, não só o título",
    conFuentes: "Dizer quantos meios assinam cada assunto",
    nota:
      "Tudo fica no teu aparelho; «Copiar a minha rádio» dá-te um link com estes ajustes. A voz é posta pelo sistema: se soar metálica, escolhe outra na lista — a qualidade de cada uma está medida, não prometida. Atalhos: espaço reproduz ou para, ← → mudam de bloco, Esc para.",
    presets: [
      { nombre: "Manhã serena", detalle: "5 min · informativa · pausada" },
      { nombre: "Frente aberta", detalle: "10 min · direta · sem adornos" },
      { nombre: "Passeio longo", detalle: "15 min · próxima · com fontes" },
      { nombre: "Só o essencial", detalle: "2 min · títulos e fecho" },
    ],
    sugerencias: [
      "Resumo do dia",
      "Que região tem mais?",
      "De que se fala hoje?",
      "O que se passa na Europa?",
      "Algo bom?",
      "O que podes fazer?",
    ],
  },

  fr: {
    onAir: "À L'ANTENNE",
    offAir: "EN SILENCE",
    cableNota: "· les dépêches arrivent dans la langue où elles ont été publiées",
    parte: "bloc %a sur %b",
    frase: "phrase %a sur %b",
    silencio: "silence",
    resumen: "%a blocs · %b sujets",
    detener: "◼ Arrêter",
    continuar: "▶ Reprendre (bloc %a)",
    escuchar: "▶ Écouter l'émission",
    pausa: "Pause",
    anterior: "Bloc précédent",
    anteriorTitle: "Bloc précédent (←)",
    siguiente: "Bloc suivant",
    siguienteTitle: "Bloc suivant (→)",
    quedan: "il reste %t",
    total: "%t au total",
    copiarGuion: "Copier le script",
    copiarRadio: "Copier ma radio",
    copiado: "✓ Copié",
    ariaPrograma: "L'émission",
    ariaBloques: "Blocs de l'émission",
    irAlBloque: "Aller au bloc %a : %b",
    ariaGuion: "Script de l'émission",
    ariaCharla: "Parle à la radio",
    charlaTitulo: "Demande à la radio",
    charlaSub:
      "Elle comprend les relances (« raconte-moi plus », « la deuxième ») et les chiffres des archives. Elle répond avec les dépêches de la maison et cite la source. S'il n'y a rien sur ta question, elle le dit.",
    escribirPregunta: "Écris ta question",
    sitioPregunta: "Que se passe-t-il en Ukraine ? · résumé · raconte-moi plus",
    hablar: "Parler",
    escucho: "J'écoute…",
    preguntar: "Demander",
    puedesSeguir: "Tu peux continuer avec :",
    vacio: "Tu ne lui as encore rien demandé.",
    tu: "Toi",
    ariaAjustes: "Personnalisation",
    tituloAjustes: "Ta radio",
    estilo: "Style",
    estilos: ["Sereine · informative", "Proche · conversationnelle", "Tranchante · directe"],
    duracion: "Durée · %a min",
    duraciones: ["2 minutes · l'essentiel", "5 minutes · la journée", "10 minutes · avec détail", "15 minutes · émission longue"],
    persona: "Voix",
    vozAparato: "Voix de l'appareil (%a)",
    mejorDisponible: "La meilleure disponible (automatique)",
    velocidad: "Vitesse · %a×",
    tono: "Hauteur · %a",
    pausas: "Pauses naturelles (respiration entre les phrases)",
    conResumen: "Lire aussi le résumé, pas seulement le titre",
    conFuentes: "Dire combien de médias signent chaque sujet",
    nota:
      "Tout reste sur ton appareil ; « Copier ma radio » te donne un lien avec ces réglages. La voix est fournie par le système : si elle sonne métallique, choisis-en une autre dans la liste — la qualité de chacune est mesurée, pas promise. Raccourcis : espace lit ou arrête, ← → changent de bloc, Échap arrête.",
    presets: [
      { nombre: "Matin serein", detalle: "5 min · informative · posée" },
      { nombre: "Front ouvert", detalle: "10 min · directe · sans ornement" },
      { nombre: "Longue marche", detalle: "15 min · proche · avec sources" },
      { nombre: "Juste l'essentiel", detalle: "2 min · titres et clôture" },
    ],
    sugerencias: [
      "Résumé du jour",
      "Quelle région en a le plus ?",
      "De quoi parle-t-on aujourd'hui ?",
      "Que se passe-t-il en Europe ?",
      "Du bon ?",
      "Que peux-tu faire ?",
    ],
  },

  de: {
    onAir: "AUF SENDUNG",
    offAir: "STILL",
    cableNota: "· die Meldungen kommen in der Sprache, in der sie veröffentlicht wurden",
    parte: "Block %a von %b",
    frase: "Satz %a von %b",
    silencio: "Stille",
    resumen: "%a Blöcke · %b Themen",
    detener: "◼ Stopp",
    continuar: "▶ Weiter (Block %a)",
    escuchar: "▶ Die Sendung hören",
    pausa: "Pause",
    anterior: "Vorheriger Block",
    anteriorTitle: "Vorheriger Block (←)",
    siguiente: "Nächster Block",
    siguienteTitle: "Nächster Block (→)",
    quedan: "noch %t",
    total: "%t insgesamt",
    copiarGuion: "Skript kopieren",
    copiarRadio: "Mein Radio kopieren",
    copiado: "✓ Kopiert",
    ariaPrograma: "Die Sendung",
    ariaBloques: "Blöcke der Sendung",
    irAlBloque: "Zu Block %a: %b",
    ariaGuion: "Skript der Sendung",
    ariaCharla: "Sprich mit dem Radio",
    charlaTitulo: "Frag das Radio",
    charlaSub:
      "Es versteht Rückfragen („erzähl mehr“, „das zweite“) und Zahlen aus dem Archiv. Es antwortet mit den Meldungen des Hauses und nennt die Quelle. Gibt es nichts zu deiner Frage, sagt es das.",
    escribirPregunta: "Schreib deine Frage",
    sitioPregunta: "Was geschieht in der Ukraine? · Zusammenfassung · erzähl mehr",
    hablar: "Sprechen",
    escucho: "Ich höre…",
    preguntar: "Fragen",
    puedesSeguir: "Du kannst weitermachen mit:",
    vacio: "Du hast noch nichts gefragt.",
    tu: "Du",
    ariaAjustes: "Personalisierung",
    tituloAjustes: "Dein Radio",
    estilo: "Stil",
    estilos: ["Ruhig · informativ", "Nah · gesprächig", "Scharf · direkt"],
    duracion: "Dauer · %a Min.",
    duraciones: ["2 Minuten · das Wesentliche", "5 Minuten · der Tag", "10 Minuten · mit Details", "15 Minuten · lange Sendung"],
    persona: "Stimme",
    vozAparato: "Gerätestimme (%a)",
    mejorDisponible: "Die beste verfügbare (automatisch)",
    velocidad: "Geschwindigkeit · %a×",
    tono: "Tonhöhe · %a",
    pausas: "Natürliche Pausen (Atem zwischen den Sätzen)",
    conResumen: "Auch die Zusammenfassung lesen, nicht nur die Schlagzeile",
    conFuentes: "Sagen, wie viele Medien jedes Thema zeichnen",
    nota:
      "Alles bleibt auf deinem Gerät; „Mein Radio kopieren“ gibt dir einen Link mit diesen Einstellungen. Die Stimme stellt das System: klingt sie metallisch, wähle eine andere aus der Liste — die Qualität jeder Stimme ist gemessen, nicht versprochen. Tasten: Leertaste spielt oder stoppt, ← → wechseln den Block, Esc stoppt.",
    presets: [
      { nombre: "Ruhiger Morgen", detalle: "5 Min. · informativ · getragen" },
      { nombre: "Offene Front", detalle: "10 Min. · direkt · ohne Schmuck" },
      { nombre: "Langer Spaziergang", detalle: "15 Min. · nah · mit Quellen" },
      { nombre: "Nur das Wesentliche", detalle: "2 Min. · Schlagzeilen und Schluss" },
    ],
    sugerencias: [
      "Zusammenfassung des Tages",
      "Welche Region hat am meisten?",
      "Worüber wird heute gesprochen?",
      "Was geschieht in Europa?",
      "Etwas Gutes?",
      "Was kannst du tun?",
    ],
  },

  it: {
    onAir: "IN ONDA",
    offAir: "IN SILENZIO",
    cableNota: "· i dispacci arrivano nella lingua in cui sono stati pubblicati",
    parte: "blocco %a di %b",
    frase: "frase %a di %b",
    silencio: "silenzio",
    resumen: "%a blocchi · %b argomenti",
    detener: "◼ Ferma",
    continuar: "▶ Riprendi (blocco %a)",
    escuchar: "▶ Ascolta il programma",
    pausa: "Pausa",
    anterior: "Blocco precedente",
    anteriorTitle: "Blocco precedente (←)",
    siguiente: "Blocco successivo",
    siguienteTitle: "Blocco successivo (→)",
    quedan: "restano %t",
    total: "%t in tutto",
    copiarGuion: "Copia il copione",
    copiarRadio: "Copia la mia radio",
    copiado: "✓ Copiato",
    ariaPrograma: "Il programma",
    ariaBloques: "Blocchi del programma",
    irAlBloque: "Vai al blocco %a: %b",
    ariaGuion: "Copione del programma",
    ariaCharla: "Parla con la radio",
    charlaTitulo: "Chiedi alla radio",
    charlaSub:
      "Capisce i seguiti («dimmi di più», «il secondo») e le cifre dell'archivio. Risponde con i dispacci della casa e cita la fonte. Se non c'è nulla su ciò che chiedi, lo dice.",
    escribirPregunta: "Scrivi la tua domanda",
    sitioPregunta: "Che succede in Ucraina? · riassunto · dimmi di più",
    hablar: "Parla",
    escucho: "Sto ascoltando…",
    preguntar: "Chiedi",
    puedesSeguir: "Puoi continuare con:",
    vacio: "Non gli hai ancora chiesto nulla.",
    tu: "Tu",
    ariaAjustes: "Personalizzazione",
    tituloAjustes: "La tua radio",
    estilo: "Stile",
    estilos: ["Serena · informativa", "Vicina · conversazionale", "Tagliente · diretta"],
    duracion: "Durata · %a min",
    duraciones: ["2 minuti · l'essenziale", "5 minuti · la giornata", "10 minuti · con dettaglio", "15 minuti · programma lungo"],
    persona: "Voce",
    vozAparato: "Voce del dispositivo (%a)",
    mejorDisponible: "La migliore disponibile (automatico)",
    velocidad: "Velocità · %a×",
    tono: "Tono · %a",
    pausas: "Pause naturali (respiro tra le frasi)",
    conResumen: "Leggere anche il riassunto, non solo il titolo",
    conFuentes: "Dire quanti mezzi firmano ogni argomento",
    nota:
      "Tutto resta sul tuo dispositivo; «Copia la mia radio» ti dà un link con queste impostazioni. La voce la mette il sistema: se suona metallica, scegline un'altra dalla lista — la qualità di ognuna è misurata, non promessa. Scorciatoie: spazio riproduce o ferma, ← → cambiano blocco, Esc ferma.",
    presets: [
      { nombre: "Mattina serena", detalle: "5 min · informativa · posata" },
      { nombre: "Fronte aperto", detalle: "10 min · diretta · senza ornamenti" },
      { nombre: "Passeggiata lunga", detalle: "15 min · vicina · con fonti" },
      { nombre: "Solo l'essenziale", detalle: "2 min · titoli e chiusura" },
    ],
    sugerencias: [
      "Riassunto del giorno",
      "Quale regione ne ha di più?",
      "Di cosa si parla oggi?",
      "Che succede in Europa?",
      "Qualcosa di buono?",
      "Che cosa puoi fare?",
    ],
  },

  ru: {
    onAir: "В ЭФИРЕ",
    offAir: "В ТИШИНЕ",
    cableNota: "· сводки приходят на том языке, на котором были опубликованы",
    parte: "блок %a из %b",
    frase: "фраза %a из %b",
    silencio: "тишина",
    resumen: "%a блоков · %b тем",
    detener: "◼ Стоп",
    continuar: "▶ Продолжить (блок %a)",
    escuchar: "▶ Слушать программу",
    pausa: "Пауза",
    anterior: "Предыдущий блок",
    anteriorTitle: "Предыдущий блок (←)",
    siguiente: "Следующий блок",
    siguienteTitle: "Следующий блок (→)",
    quedan: "осталось %t",
    total: "всего %t",
    copiarGuion: "Скопировать сценарий",
    copiarRadio: "Скопировать моё радио",
    copiado: "✓ Скопировано",
    ariaPrograma: "Программа",
    ariaBloques: "Блоки программы",
    irAlBloque: "Перейти к блоку %a: %b",
    ariaGuion: "Сценарий программы",
    ariaCharla: "Поговори с радио",
    charlaTitulo: "Спроси радио",
    charlaSub:
      "Понимает уточнения («расскажи больше», «второе») и цифры из архива. Отвечает сводками дома и называет источник. Если по твоему вопросу ничего нет, так и говорит.",
    escribirPregunta: "Напиши свой вопрос",
    sitioPregunta: "Что происходит в Украине? · сводка · расскажи больше",
    hablar: "Говорить",
    escucho: "Слушаю…",
    preguntar: "Спросить",
    puedesSeguir: "Можно продолжить:",
    vacio: "Ты ещё ничего не спросил.",
    tu: "Ты",
    ariaAjustes: "Персонализация",
    tituloAjustes: "Твоё радио",
    estilo: "Стиль",
    estilos: ["Спокойно · информативно", "Близко · разговорно", "Резко · прямо"],
    duracion: "Длительность · %a мин",
    duraciones: ["2 минуты · главное", "5 минут · день", "10 минут · с подробностями", "15 минут · долгая программа"],
    persona: "Голос",
    vozAparato: "Голос устройства (%a)",
    mejorDisponible: "Лучший доступный (автоматически)",
    velocidad: "Скорость · %a×",
    tono: "Тон · %a",
    pausas: "Естественные паузы (дыхание между фразами)",
    conResumen: "Читать и сводку, а не только заголовок",
    conFuentes: "Говорить, сколько изданий подписывают каждую тему",
    nota:
      "Всё хранится на твоём аппарате; «Скопировать моё радио» даёт ссылку с этими настройками. Голос даёт система: если звучит металлически, выбери другой из списка — качество каждого измерено, а не обещано. Клавиши: пробел играет или останавливает, ← → меняют блок, Esc останавливает.",
    presets: [
      { nombre: "Спокойное утро", detalle: "5 мин · информативно · неспешно" },
      { nombre: "Открытый фронт", detalle: "10 мин · прямо · без украшений" },
      { nombre: "Долгая прогулка", detalle: "15 мин · близко · с источниками" },
      { nombre: "Только главное", detalle: "2 мин · заголовки и конец" },
    ],
    sugerencias: [
      "Сводка дня",
      "В каком регионе больше всего?",
      "О чём говорят сегодня?",
      "Что происходит в Европе?",
      "Есть что-то хорошее?",
      "Что ты умеешь?",
    ],
  },

  zh: {
    onAir: "正在播出",
    offAir: "静默",
    cableNota: "· 消息按发布时的原文语言送达",
    parte: "第 %a 段，共 %b 段",
    frase: "第 %a 句，共 %b 句",
    silencio: "静默",
    resumen: "%a 段 · %b 条消息",
    detener: "◼ 停止",
    continuar: "▶ 继续（第 %a 段）",
    escuchar: "▶ 收听节目",
    pausa: "暂停",
    anterior: "上一段",
    anteriorTitle: "上一段（←）",
    siguiente: "下一段",
    siguienteTitle: "下一段（→）",
    quedan: "还剩 %t",
    total: "共 %t",
    copiarGuion: "复制稿件",
    copiarRadio: "复制我的电台",
    copiado: "✓ 已复制",
    ariaPrograma: "节目",
    ariaBloques: "节目分段",
    irAlBloque: "跳到第 %a 段：%b",
    ariaGuion: "节目稿件",
    ariaCharla: "跟电台说话",
    charlaTitulo: "问电台",
    charlaSub: "听得懂追问（「再多说点」「第二条」）和档案里的数字。它用本宅的消息回答，并注明来源。你问的事情没有材料，它就说没有。",
    escribirPregunta: "写下你的问题",
    sitioPregunta: "乌克兰那边怎么样？· 摘要 · 再多说点",
    hablar: "说话",
    escucho: "正在听……",
    preguntar: "提问",
    puedesSeguir: "可以接着问：",
    vacio: "你还没问过它。",
    tu: "你",
    ariaAjustes: "个性化",
    tituloAjustes: "你的电台",
    estilo: "风格",
    estilos: ["平静 · 资讯", "亲近 · 对话", "锋利 · 直接"],
    duracion: "时长 · %a 分钟",
    duraciones: ["2 分钟 · 只要要点", "5 分钟 · 一天的事", "10 分钟 · 带细节", "15 分钟 · 长节目"],
    persona: "声音人格",
    vozAparato: "设备语音（%a）",
    mejorDisponible: "自动选最好的",
    velocidad: "速度 · %a×",
    tono: "音高 · %a",
    pausas: "自然停顿（句间呼吸）",
    conResumen: "摘要也读，不只读标题",
    conFuentes: "说出每条消息有几家媒体签署",
    nota:
      "一切都存在你的设备上；「复制我的电台」给你一个带这些设置的链接。声音由系统提供：听起来发金属音就换列表里的另一个——每一条的质量是测出来的，不是保证的。快捷键：空格播放或停止，← → 换段，Esc 停止。",
    presets: [
      { nombre: "平静的早晨", detalle: "5 分钟 · 资讯 · 不急" },
      { nombre: "开阔前线", detalle: "10 分钟 · 直接 · 不加修饰" },
      { nombre: "长散步", detalle: "15 分钟 · 亲近 · 带来源" },
      { nombre: "只要要点", detalle: "2 分钟 · 标题和收尾" },
    ],
    sugerencias: ["今日摘要", "哪个地区的消息最多？", "今天在谈什么？", "欧洲怎么样？", "有好消息吗？", "你能做什么？"],
  },
};
