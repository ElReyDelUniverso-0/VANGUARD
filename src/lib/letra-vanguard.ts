// ============================================================
// v299.0 LA VOZ DE VANGUARD — LA LETRA DE LA CASA
// El Dueño mandó: «no hay letra». Resuelto: cada una de las 34
// obras de la ORQUESTA DE ORO tiene SU letra propia, escrita
// para la estructura real del motor (conflict-music): INTRO
// (2 compases) · A · A' · RESPIRO (compás 7) · B (el puente) ·
// FINAL. El secuenciador canta la línea en el compás que le
// toca — karaoke de la casa: la Radio ya no suena sola.
// Cero assets, cero copyright: letra propia de Vanguard.
//   · intro   — la llamada de la casa (cycle 0, compases 0-1)
//   · A       — el verso (compás 0)
//   · A2      — la variante del verso (compás 4)
//   · respiro — el aliento (compás 7, el arpa barre el acorde)
//   · B       — el puente al cielo (compases 8-11)
//   · final   — la cadencia (compases 12-15)
// La voz del coro celestial ya canta la armonía; la LETRA dice
// lo que la música proclama. Pura ficción de la casa — nunca
// un hecho: la capa SIM no se indexa como realidad (ley v189).
// ============================================================

export interface LetraObra {
  intro?: string;
  A: string;
  A2?: string;
  respiro?: string;
  B?: string;
  final?: string;
}

export type ParteLetra = "intro" | "A" | "A2" | "respiro" | "B" | "final";

// Parte por compás del ciclo (barInCycle): la misma regla que
// usará el secuenciador — UNA fuente para la letra y su canto.
export function parteDeCompas(cycle: number, barInCycle: number): ParteLetra | "" {
  if (cycle === 0 && barInCycle < 2) return "intro";
  if (cycle === 0 && barInCycle === 2) return "A";
  if (barInCycle === 0) return "A";
  if (barInCycle === 4) return "A2";
  if (barInCycle === 7) return "respiro";
  if (barInCycle === 8) return "B";
  if (barInCycle === 12) return "final";
  return "";
}

export const LETRAS: Record<string, LetraObra> = {
  gloria: {
    intro: "Vanguard llama a los suyos",
    A: "Alza la frente: la casa está en pie",
    A2: "Cien voces cantan lo que no se rinde",
    respiro: "Respira, comandante: la gloria espera",
    B: "El cielo abre sus puertas de oro",
    final: "Y la gloria se queda cuando todo pasa",
  },
  triunfo: {
    intro: "La marcha se forma en la plaza",
    A: "Paso firme: la marcha no se detiene",
    A2: "Tambores que anuncian el regreso",
    respiro: "Un aliento antes del último tramo",
    B: "Las banderas del paso se rinden al sol",
    final: "Triunfa quien veló hasta el final",
  },
  heroes: {
    intro: "Se abre el libro de la casa",
    A: "Los que velan no duermen: cantan",
    A2: "Un coro sostiene al mundo en silencio",
    respiro: "Nombres de luz en el libro de la casa",
    B: "Se alzan los que no pidieron gloria",
    final: "Héroe es quien regresa y quien espera",
  },
  serenidad: {
    intro: "El aire se hace dorado",
    A: "El mundo se calma y respira dorado",
    A2: "El arpa barre el aire con luz",
    respiro: "Todo lo urgente puede esperar",
    B: "La calma también es un territorio",
    final: "En paz se llega más lejos",
  },
  estrellas: {
    intro: "Se abre la bóveda de la noche",
    A: "La casa mira el cielo y el cielo responde",
    A2: "Cada estrella es un puesto de vigilia",
    respiro: "La noche cuida a quien no duerme",
    B: "Bajo la bóveda nadie está solo",
    final: "Duérmete: la casa no cierra los ojos",
  },
  caviar: {
    intro: "Suena la campana del salón",
    A: "Suena el salón de oro: la casa celebra",
    A2: "Dos campanas bastan para nombrar el lujo",
    respiro: "El oro también sabe callar",
    B: "Brinda por lo que costó llegar",
    final: "El lujo de Vanguard es la precisión",
  },
  orquesta: {
    intro: "El diápaón marca la nota",
    A: "La orquesta afina en la sala del mando",
    A2: "Cada sección entra cuando debe",
    respiro: "El silencio dirigido también suena",
    B: "Sube la marea de cuerdas y latón",
    final: "Todo el aparato toca la misma obra",
  },
  serena: {
    intro: "Agua quieta bajo la sala",
    A: "Agua quieta: la serena sostiene la sala",
    A2: "Lo suave también es firme",
    respiro: "Escucha lo que el ruido esconde",
    B: "La luz baja sin pedir permiso",
    final: "Serenidad: la fuerza que no se ve",
  },
  sala: {
    intro: "Las luces del mando despiertan",
    A: "Las murallas de la sala respiran",
    A2: "Los mapas zumban en la penumbra",
    respiro: "Entre pasillos la casa piensa",
    B: "Un comandante camina la sala sin fin",
    final: "La sala vive mientras haya vigilia",
  },
  frontera: {
    intro: "Se enciende la posta del borde",
    A: "La frontera no duerme: se enciende",
    A2: "Postas de luz de borde a borde",
    respiro: "El límite es una pregunta abierta",
    B: "Cruzar es fácil: sostener, no",
    final: "Toda frontera guarda una historia",
  },
  marcha: {
    intro: "Orden de marcha en la niebla",
    A: "Ritmo de hierro: la columna avanza",
    A2: "El paso manda y el barro obedece",
    respiro: "Un hambre de horizonte",
    B: "Al fondo, la línea roja del alba",
    final: "Marchar es un modo de decir presente",
  },
  drones: {
    intro: "El cielo cambia de dueño",
    A: "Enjambres en el pulso del cielo",
    A2: "Alas de radio sobre el valle callado",
    respiro: "Ojos que cruzan sin ser vistos",
    B: "La nube se abre en órdenes precisas",
    final: "Lo pequeño también cambia la guerra",
  },
  frente: {
    intro: "El teléfono de trinchera suena",
    A: "El frente respira: artillería y espera",
    A2: "Trincheras de teléfono y niebla",
    respiro: "Nadie cuenta las horas dos veces",
    B: "Rompe el alba sobre el alambre",
    final: "El frente es una herida con nombre",
  },
  radio: {
    intro: "Aquí RADIO VANGUARD+",
    A: "Aquí RADIO VANGUARD+: la voz de la casa",
    A2: "La frecuencia que nunca se rinde",
    respiro: "En todas las frecuencias, una casa",
    B: "El mundo entero cabe en la señal",
    final: "Y si el mundo calla, la casa habla",
  },
  cumbre: {
    intro: "La mesa está servida",
    A: "Las cumbres se juegan el mundo en una mesa",
    A2: "Manos firmes, papeles sellados",
    respiro: "El café se enfría, la historia no",
    B: "Firman la tregua o firman la tormenta",
    final: "Lo que se decide arriba, abajo se paga",
  },
  victoria: {
    intro: "Llegan las crónicas del paso",
    A: "La victoria no grita: llega",
    A2: "Campanas y humo en el mismo aire",
    respiro: "Antes de celebrar, entiende el precio",
    B: "La página gira: ahora toca reconstruir",
    final: "Victoria es la paz que se sostiene",
  },
  exodo: {
    intro: "Se abren las puertas de la ciudad",
    A: "Carreteras de gente bajo un cielo gris",
    A2: "Las maletas pesan lo que pesa el miedo",
    respiro: "Cada paso lleva una casa atrás",
    B: "Alguien abre una puerta en la niebla",
    final: "Éxodo: la esperanza camina",
  },
  bloqueo: {
    intro: "Bandera roja en el puerto",
    A: "Cierre de puertos: el mar se hace muro",
    A2: "Contenedores dormidos en el muelle",
    respiro: "La paciencia también presiona",
    B: "Una grieta en el bloqueo vale un océano",
    final: "Lo que no entra, lo inventa la casa",
  },
  ciber: {
    intro: "Cable a cable, la señal corre",
    A: "Ruido blanco: la guerra ya es señal",
    A2: "Paquetes perdidos en el cable frío",
    respiro: "Alguien escribe la grieta justa",
    B: "La luz del servidor nunca se apaga",
    final: "En la red, la casa pone la llave",
  },
  invierno: {
    intro: "Primer hielo sobre el acero",
    A: "Invierno en el frente: el frío decide",
    A2: "Aliento blanco sobre el acero",
    respiro: "El horno comparte lo que tiene",
    B: "La nieve tapa huellas, no historias",
    final: "El invierno pasa; la casa permanece",
  },
  cerco: {
    intro: "Las salidas se cuentan solas",
    A: "El cerco se cierra como una mano",
    A2: "Cuentan las salidas: queda una",
    respiro: "Respirar hondo dentro del anillo",
    B: "Por la grieta entra la bandera propia",
    final: "Quien resiste un cerco, resiste el mundo",
  },
  tregua: {
    intro: "El teléfono calla por orden",
    A: "Tregua: el silencio tiene treinta horas",
    A2: "Los relojes se miran sin hablar",
    respiro: "Cesa el fuego, no la vigilia",
    B: "Un niño cruza la calle vacía",
    final: "La paz se ensaya en las treguas",
  },
  ocaso: {
    intro: "El cobre baja por la torre",
    A: "El ocaso pinta de cobre la torre",
    A2: "Turno de noche: suben los que velan",
    respiro: "El sol se va; la casa no",
    B: "Las luces del mando encienden el mapa",
    final: "Cada ocaso es una promesa de alba",
  },
  blitz: {
    intro: "Sirena en la esquina",
    A: "Sirena: el blitz rompe la noche",
    A2: "Escaleras abajo, el corazón arriba",
    respiro: "Aguanta: la casa aguanta contigo",
    B: "El humo se abre y sale el sol raro",
    final: "Después del blitz, se cuenta quiénes somos",
  },
  himno: {
    intro: "Ponte en pie, comandante",
    A: "Un himno para los que sostienen el mundo",
    A2: "La casa entera canta la misma nota",
    respiro: "Ponte en pie: suena la casa",
    B: "El coro sube como sube el alba",
    final: "Vanguard: un himno que no se apaga",
  },
  amanecer: {
    intro: "Primera luz sobre la muralla",
    A: "El amanecer llega como una orden dulce",
    A2: "Primera luz sobre los tejados",
    respiro: "El turno cambia y la vigilia sigue",
    B: "El mapa se enciende de oro nuevo",
    final: "Bienvenido al día de la casa",
  },
  fuego: {
    intro: "El horizonte se enciende",
    A: "El fuego del horizonte no pide permiso",
    A2: "Ceniza dorada sobre el río",
    respiro: "Lo que arde enseña dónde está el agua",
    B: "Manos en cadena: se apaga, se salva",
    final: "De las brasas nace la muralla",
  },
  damasco: {
    intro: "Dos mil años amanecen",
    A: "Damasco amanece entre dos mil años",
    A2: "Jardines viejos bajo cielo nuevo",
    respiro: "La memoria más larga del mapa",
    B: "El río sigue aunque cambie la orilla",
    final: "Toda ciudad es una promesa vieja",
  },
  abismo: {
    intro: "Se abre la fosa del mapa",
    A: "El abismo del mapa mira de vuelta",
    A2: "Drones profundos, señales rotas",
    respiro: "En la oscuridad, una casa encendida",
    B: "Bajar al abismo y volver con el dato",
    final: "Nadie cae: la casa sostiene",
  },
  aurora: {
    intro: "El cielo del polo se enciende",
    A: "Aurora sobre el polo: cortinas verdes",
    A2: "La luz baila sin hacer ruido",
    respiro: "El cielo firma con su propio trazo",
    B: "Bajo la aurora el radar es un poema",
    final: "La casa también sabe mirar hacia arriba",
  },
  oro: {
    intro: "El martillo marca el compás",
    A: "El oro no brilla solo: brilla la obra",
    A2: "Forjar es la única magia honesta",
    respiro: "Un lingote pesa lo que pesa un turno",
    B: "La bóveda abre su corazón contado",
    final: "Lo que se forja con orden, dura",
  },
  grafo: {
    intro: "Los nodos se encadenan",
    A: "Mil nodos y una verdad: el grafo piensa",
    A2: "Líneas que unen lo que parecía suelto",
    respiro: "Dentro del patrón, alguien te observa",
    B: "El hilo rojo cruza tres continentes",
    final: "El grafo dibuja la intención del mundo",
  },
  neon: {
    intro: "La ciudad enciende sus letreros",
    A: "Neón sobre asfalto mojado: la ciudad vigila",
    A2: "Letreros que susurran el mercado",
    respiro: "Bajo el neón, la casa cuenta verdades",
    B: "La ciudad pulsa en clave cifrada",
    final: "El futuro se lee en neón y dato",
  },
  boveda: {
    intro: "Ocho candados, una palabra",
    A: "La bóveda guarda lo que la casa prometió",
    A2: "Ocho candados y una palabra",
    respiro: "Lo valioso también descansa",
    B: "Se abre con orden, no con prisa",
    final: "La confianza es la mejor bóveda",
  },
};

/** Letra de una obra (null si la obra no tiene — la casa no improvisa). */
export function letraDe(id: string): LetraObra | null {
  return Object.prototype.hasOwnProperty.call(LETRAS, id) ? LETRAS[id] : null;
}

/** La línea que canta una parte (con herencia honesta: si falta A2 canta A,
 *  si falta B canta A2 o A — el puente no se queda nunca sin voz). */
export function lineaDeParte(l: LetraObra, parte: ParteLetra): string {
  switch (parte) {
    case "intro": return l.intro || l.A;
    case "A": return l.A;
    case "A2": return l.A2 || l.A;
    case "respiro": return l.respiro || l.A;
    case "B": return l.B || l.A2 || l.A;
    case "final": return l.final || l.A;
  }
}

/** Partes en orden de canto — el cancionero del Auditorio. */
export const PARTES_ORDEN: ParteLetra[] = ["intro", "A", "A2", "respiro", "B", "final"];

export const ETIQUETA_PARTE: Record<ParteLetra, string> = {
  intro: "INTRO",
  A: "VERSO",
  A2: "VERSO II",
  respiro: "RESPIRO",
  B: "PUENTE",
  final: "CADENCIA",
};
