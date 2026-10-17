// VANGUARD v109.0 — SONIDO VANGUARD v4 "ORQUESTA DE ORO" (Web Audio, cero assets)
// v123.0 GLORIA ETERNA — LA CÚSPIDE: el comandante pidió "música épica de gloria,
// relajante, única y súper reconocible, sin derechos de autor". Cinco obras nuevas
// (gloria · triunfo · heroes · serenidad · estrellas) comparten EL MOTIVO GLORIA
// (raíz·raíz·raíz→octava→5ª) y cinco voces nuevas de la orquesta épica:
//   · TIMBAL afinado al acorde (membrana que cae + mazo de fieltro)
//   · CORO CELESTIAL "aah" (dos formantes de vocal + vibrato colectivo)
//   · PLATILLO con cola dorada (corona los puentes de las obras épicas)
//   · TROMPETA HEROICA (formante de latón + vibrato tardío, la voz del abanderado)
//   · ARPA (glissando dorado en el respiro)
// Todo 100% sintetizado en el navegador: cero muestras, cero copyright, para siempre.
//
// Mandato del comandante: "música 100%, nada mediocre, una música ÚNICA para
// Vanguard, dulce para los oídos — que la gente entre solo a escuchar Vanguard".
// Reescritura total del motor de síntesis sobre la misma arquitectura de pistas:
//   · CADENA MASTER DE ESTUDIO: HPF 28Hz → EQ (corte de fangos 240Hz + aire en
//     9kHz) → compresor de bus → limitador de techo → analizador → salida.
//   · REVERB CÁLIDA v2: impulso de 3s con cola lowpass (más oscuro con el
//     tiempo) y reflexiones tempranas — sala, no lata.
//   · CHORUS ESTÉREO en el bus de pads (2 líneas de retraso moduladas L/R).
//   · DELAY PING-PONG filtrado (el eco salta de oído a oído).
//   · PAD v4: sierras desafinadas ±7 cents + sub triangular una octava abajo,
//     filtro con deriva lenta, colas que cruzan el compás (legato).
//   · BAJO v4: sub senoidal + armónico triangular con envolvente de filtro.
//   · VOZ DORADA v4: la melodía ya no es el arpegio repetido — FM de campana
//     suave (portadora + modulador 2:1 con índice que cae), variantes glass y
//     brass, con MOTIVO + SECUENCIA + CADENCIA por secciones A A' B A''.
//   · ARMONÍA RICA: séptimas mayores/menores en los pads (flag rich).
//   · DRONE QUE SIGUE AL ACORDE: desliza a la fundamental de cada compás.
//   · PERCUSIÓN REFINADA: bombo redondo con click filtrado, caja con sala,
//     hats metálicos, shaker y tom para los fills.
//   · ESTRUCTURA de 16 compases: intro (2 compases suaves al arrancar) ·
//     A · A' (variante diaria) · respiro · B (puente al cielo) · A'' · fill.
//   · VARIACIÓN DIARIA (v98) se conserva: 48 ediciones distintas por pista.
//   · MOTIVO FIRMA de Vanguard (la "llamada de la casa") en las 4 pistas
//     insignia nuevas: orquesta · serena · sala · frontera.
// API intacta (startMusic/stopMusic/volumen/espectro/escena/suscripción) — la
// Radio y el resto de la app no notan el cambio de orquesta.

type Pattern = string; // "x...x..." — x = golpe, . = silencio, o = acento

export type TrackCat = "vanguard" | "guerra" | "ambiente";

// v123 GLORIA ETERNA: "heroe" = trompeta heroica · "coro" = coro celestial
export type LeadType = "fm" | "glass" | "brass" | "heroe" | "coro";

interface TrackDef {
  id: string;
  name: string;
  desc: string;
  cat: TrackCat; // familia de la Radio
  bpm: number;
  root: number; // Hz del bajo raíz (registro grave)
  chords: number[][]; // 4 compases: acorde por compás, semitonos relativos a root
  chordsB?: number[][]; // progresión B (el puente); si falta, se usa la A
  rich?: boolean; // pads con séptima (color de orquesta)
  bass: number[]; // 16 pasos: offset en semitonos sobre la FUNDAMENTAL del acorde (-1 silencio)
  arp: number[]; // 16 pasos: índice de nota del acorde (0=root,1=3ª,2=5ª,3=root+12...) (-1 silencio)
  arpType: OscillatorType;
  bassType: OscillatorType;
  kick: Pattern;
  snare: Pattern;
  hat: Pattern;
  drone: number; // multiplicador de root para el drone continuo (0 = sin drone)
  droneGain: number;
  padLevel: number; // volumen del colchón de acordes
  lead?: number[]; // MOTIVO de 16 pasos en grados del acorde (-1 silencio) — la voz que canta
  leadType?: LeadType; // fm = campana suave · glass = cristal · brass = metales · heroe/coro = v123
  shaker?: boolean;
  swing?: boolean;
  fill?: boolean; // relleno de batería en el compás final
  // ── v123 GLORIA ETERNA: la planta de la ORQUESTA ÉPICA ──
  timbal?: boolean; // timbales afinados al acorde en el arranque de compás
  coro?: boolean; // coro celestial ("aah") cantando la armonía de cada compás
  epico?: boolean; // dramaturgia completa: platillo en el puente, arpa en el respiro, final triunfal
}

const st = (semi: number, root: number) => root * Math.pow(2, semi / 12);

// helper: acorde mayor/menor en semitonos relativos
const maj = (r: number) => [r, r + 4, r + 7];
const min = (r: number) => [r, r + 3, r + 7];

export const MUSIC_TRACKS: TrackDef[] = [
  // ══════════════ v123.0 GLORIA ETERNA — la cúspide de la casa ══════════════
  // Las 5 obras nuevas comparten EL MOTIVO GLORIA (raíz · raíz · raíz · octava →
  // resolución a la 5ª): la firma que hace a Vanguard reconocible en 3 notas.
  {
    id: "gloria",
    name: "GLORIA ETERNA",
    desc: "El himno épico de la casa: coro celestial, timbales y trompetas que se alzan — la gloria de Vanguard",
    cat: "vanguard",
    bpm: 72,
    root: st(-24, 73.42), // D0
    chords: [min(0), maj(-4), maj(-2), maj(3)], // Dm - Bb - C - F
    chordsB: [maj(-2), maj(3), maj(5), min(0)], // C - F - G - Dm (el resplandor)
    rich: true, timbal: true, coro: true, epico: true,
    bass: [0, -1, -1, -1, -1, -1, 0, -1, -1, -1, 0, -1, -1, -1, 7, -1],
    arp: [3, -1, -1, 5, -1, -1, 4, -1, 3, -1, -1, 5, -1, -1, 4, -1],
    arpType: "triangle",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "....x.......x...",
    hat: "..x...x...x...x.",
    drone: 0.5,
    droneGain: 0.05,
    padLevel: 0.09,
    lead: [0, -1, -1, 0, -1, -1, 0, -1, 3, -1, -1, 3, -1, 2, -1, -1], // LA LLAMADA DE GLORIA
    leadType: "heroe",
    shaker: true,
    fill: true,
  },
  {
    id: "triunfo",
    name: "MARCHA DEL TRIUNFO",
    desc: "Trompetas victoriosas y tambores de desfile — la marcha que cierra las guerras",
    cat: "guerra",
    bpm: 100,
    root: st(-24, 116.54), // Bb0
    chords: [maj(0), maj(7), maj(-5), maj(7)], // Bb - F - Eb - F
    chordsB: [maj(-5), maj(2), maj(7), maj(0)], // Eb - C - F - Bb (plagal, solemne)
    rich: true, timbal: true, epico: true,
    bass: [0, -1, 0, -1, 0, -1, 0, -1, 0, -1, 0, -1, 7, -1, 7, -1],
    arp: [3, -1, 4, -1, 5, -1, 4, -1, 3, -1, 4, -1, 5, -1, 6, -1],
    arpType: "triangle",
    bassType: "sawtooth",
    kick: "x...x...x...x...",
    snare: "....x...o...x.x.",
    hat: "x.x.x.x.x.x.x.x.",
    drone: 0.5,
    droneGain: 0.045,
    padLevel: 0.075,
    lead: [0, -1, 0, -1, 0, -1, 3, -1, 2, -1, -1, -1, 3, -1, -1, -1], // la marcha de gloria
    leadType: "heroe",
    fill: true,
  },
  {
    id: "heroes",
    name: "CORO DE LOS HÉROES",
    desc: "Cien voces cantando a los que velan por el mundo — el coro celestial de Vanguard",
    cat: "vanguard",
    bpm: 66,
    root: st(-24, 130.81), // C0
    chords: [maj(0), min(-3), maj(-7), maj(-5)], // C - Am - F - G
    chordsB: [maj(-7), maj(-5), min(-3), maj(0)], // F - G - Am - C (el alzarse)
    rich: true, timbal: true, coro: true, epico: true,
    bass: [0, -1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, -1, -1, 7, -1],
    arp: [3, -1, -1, 4, -1, -1, 5, -1, -1, -1, 4, -1, -1, -1, 3, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x...............",
    snare: "................",
    hat: "....x.......x...",
    drone: 0.5,
    droneGain: 0.048,
    padLevel: 0.095,
    lead: [0, -1, -1, -1, 3, -1, -1, -1, 2, -1, -1, -1, 1, -1, -1, -1], // el arco del héroe
    leadType: "coro",
    shaker: true,
  },
  {
    id: "serenidad",
    name: "SERENIDAD DORADA",
    desc: "La calma después de la gloria: arpa de cristal y coro lejano — respirar hondo, el mundo está velado",
    cat: "ambiente",
    bpm: 56,
    root: st(-24, 87.31), // F0
    chords: [maj(0), min(9), maj(5), maj(7)], // F - Dm - Bb - C
    chordsB: [maj(5), maj(7), min(9), maj(0)], // Bb - C - Dm - F (el regreso)
    rich: true, coro: true, epico: true,
    bass: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, -1, -1, -1],
    arp: [3, -1, -1, 6, -1, -1, 8, -1, -1, 6, -1, -1, 3, -1, -1, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x...............",
    snare: "................",
    hat: "........x.......",
    drone: 0.5,
    droneGain: 0.038,
    padLevel: 0.085,
    lead: [-1, -1, 0, -1, -1, 2, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1], // el eco sereno del motivo
    leadType: "glass",
  },
  {
    id: "estrellas",
    name: "NOCHE DE ESTRELLAS",
    desc: "La casa bajo la bóveda: campana de cristal sobre drones profundos — para mirar el cielo y quedarse",
    cat: "ambiente",
    bpm: 50,
    root: st(-24, 110), // A0
    chords: [min(0), maj(-3), maj(3), min(5)], // Am - F - C - Dm
    chordsB: [maj(-3), maj(3), min(0), maj(-3)], // F - C - Am - F (la promesa nocturna)
    rich: true, coro: true,
    bass: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    arp: [3, -1, -1, -1, 5, -1, -1, -1, 4, -1, -1, -1, 5, -1, -1, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x...............",
    snare: "................",
    hat: "................",
    drone: 1,
    droneGain: 0.05,
    padLevel: 0.08,
    lead: [0, -1, -1, -1, -1, -1, 2, -1, -1, -1, -1, -1, 3, -1, -1, -1], // la estrella que sube
    leadType: "glass",
  },
  // ══════════════ v109.0 ORQUESTA DE ORO — las 4 insignias de la casa ══════════════
  {
    id: "orquesta",
    name: "Orquesta de Oro",
    desc: "El alma de Vanguard: piano de campana dorada sobre cuerdas cálidas — el tema de la casa",
    cat: "vanguard",
    bpm: 74,
    root: st(-24, 98), // G0
    chords: [min(0), maj(-4), maj(-2), maj(3)], // Gm - Eb - F - C
    chordsB: [maj(3), maj(-2), min(0), min(7)], // Bb - F - Gm - Dm (el puente)
    rich: true,
    bass: [0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1, 7, -1],
    arp: [3, -1, -1, 4, -1, -1, 5, -1, -1, -1, 4, -1, -1, 5, -1, -1],
    arpType: "triangle",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "....x.......x...",
    hat: "..x...x...x...x.",
    drone: 0.5,
    droneGain: 0.045,
    padLevel: 0.085,
    lead: [0, -1, -1, 2, -1, -1, 1, -1, 3, -1, -1, -1, 2, -1, 1, -1], // la llamada de Vanguard
    leadType: "fm",
    shaker: true,
    fill: true,
  },
  {
    id: "serena",
    name: "Noche Serena",
    desc: "Cristal líquido bajo la luna llena — la pista más dulce de la casa, para mirar las estrellas",
    cat: "ambiente",
    bpm: 52,
    root: st(-24, 87.31), // F0
    chords: [maj(0), maj(7), min(4), maj(-5)], // F - C - Dm - Bb
    chordsB: [maj(9), min(2), maj(7), maj(0)], // D - Gm - C - F (la promesa)
    rich: true,
    bass: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, -1, -1, -1],
    arp: [3, -1, -1, 6, -1, -1, 8, -1, -1, 6, -1, -1, 3, -1, -1, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x...............",
    snare: "................",
    hat: "........x.......",
    drone: 0.5,
    droneGain: 0.04,
    padLevel: 0.09,
    lead: [-1, -1, 3, -1, -1, -1, 5, -1, -1, -1, 4, -1, -1, 1, -1, -1],
    leadType: "glass",
  },
  {
    id: "sala",
    name: "La Sala Dorada",
    desc: "Piano elegante en el vestíbulo de Vanguard — brillos cálidos para la comunidad",
    cat: "vanguard",
    bpm: 88,
    root: st(-24, 116.54), // Bb0
    chords: [maj(0), min(-3), maj(-5), maj(-7)], // Bb - Gm - Eb - F
    chordsB: [maj(-5), maj(-7), min(-3), min(7)], // Eb - F - Gm - Cm
    rich: true,
    bass: [0, -1, -1, -1, 7, -1, -1, -1, 0, -1, -1, -1, 10, -1, 7, -1],
    arp: [3, -1, 4, -1, 5, -1, 4, -1, 3, -1, 4, -1, 5, -1, 6, -1],
    arpType: "triangle",
    bassType: "triangle",
    kick: "x.....x.x.......",
    snare: "....x.......x...",
    hat: "..x...x...x...x.",
    drone: 0,
    droneGain: 0,
    padLevel: 0.07,
    lead: [0, -1, 1, -1, 2, -1, -1, 1, -1, -1, 0, -1, -1, -1, -1, -1],
    leadType: "fm",
    shaker: true,
    swing: true,
  },
  {
    id: "frontera",
    name: "Última Frontera",
    desc: "Metales al amanecer de la batalla — la épica de Vanguard cuando el mundo se decide",
    cat: "guerra",
    bpm: 96,
    root: st(-24, 73.42), // D0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // Dm - Bb - F - C
    chordsB: [min(0), min(5), maj(-4), maj(7)], // Dm - Gm - Bb - A (dramático)
    bass: [0, -1, 0, -1, 0, -1, 0, 7, 0, -1, 0, -1, 0, -1, 10, 7],
    arp: [3, -1, 4, -1, -1, 5, -1, 4, 3, -1, 4, -1, 6, -1, 5, -1],
    arpType: "triangle",
    bassType: "sawtooth",
    kick: "x...x...x...x...",
    snare: "....x.......x...",
    hat: "x.x.x.x.x.x.x.x.",
    drone: 0.5,
    droneGain: 0.05,
    padLevel: 0.06,
    lead: [0, -1, 0, -1, 3, -1, -1, 2, 0, -1, 0, -1, 4, -1, 3, -1],
    leadType: "brass",
    fill: true,
  },
  // ══════════════ la colección histórica (v26→v98) ══════════════
  {
    id: "marcha",
    name: "Marcha de Acero",
    desc: "Tambores de desfile militar y bajo de columnas blindadas",
    cat: "guerra",
    bpm: 96,
    root: st(-24, 110), // A0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // Am - F - C - G
    bass: [0, -1, 0, -1, 0, -1, 0, 7, 0, -1, 0, -1, 0, 7, 10, 12],
    arp: [-1, -1, 6, -1, -1, -1, 4, -1, -1, -1, 2, -1, -1, -1, 0, -1],
    arpType: "triangle",
    bassType: "sawtooth",
    kick: "x...x...x...x...",
    snare: "....x.......x...",
    hat: "..x...x...x...x.",
    drone: 0.5,
    droneGain: 0.05,
    padLevel: 0.05,
    fill: true,
  },
  {
    id: "drones",
    name: "Drones en la Noche",
    desc: "Zumbido oscuro a 2.000 metros — la espera antes del impacto",
    cat: "ambiente",
    bpm: 58,
    root: st(-24, 73.42), // D0
    chords: [min(0), maj(-4), min(-7), maj(-5)], // Dm - Bb - Gm - A
    bass: [0, -1, -1, -1, -1, -1, -1, 7, -1, -1, -1, -1, -1, -1, 10, -1],
    arp: [3, -1, -1, -1, 4, -1, -1, -1, 2, -1, -1, -1, 6, -1, -1, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "................",
    hat: "....x.......x...",
    drone: 1,
    droneGain: 0.08,
    padLevel: 0.06,
  },
  {
    id: "frente",
    name: "Tensión de Frente",
    desc: "Segundero del francotirador — ostinato de trincheras",
    cat: "guerra",
    bpm: 112,
    root: st(-24, 82.41), // E0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // Em - C - G - D
    bass: [0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0, -1, 0, 0, 10, 7],
    arp: [3, -1, 4, -1, 5, -1, 4, -1, 3, -1, 4, -1, 6, -1, 5, -1],
    arpType: "triangle",
    bassType: "sawtooth",
    kick: "x..x....x..x....",
    snare: "....x...x...x...",
    hat: "x.x.x.x.x.x.x.x.",
    drone: 0.25,
    droneGain: 0.04,
    padLevel: 0.045,
    swing: true,
    fill: true,
  },
  {
    id: "radio",
    name: "Radio Guerra",
    desc: "Morse cifrado, latidos y estática de la central de mando",
    cat: "guerra",
    bpm: 84,
    root: st(-24, 98), // G0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // Gm - Eb - Bb - F
    bass: [0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1, 7, -1],
    arp: [3, 4, -1, 3, -1, -1, 5, -1, 3, 4, -1, 3, -1, 6, -1, -1],
    arpType: "square",
    bassType: "triangle",
    kick: "x.......x.......",
    snare: "............x...",
    hat: "..x...x...x...x.",
    drone: 0.5,
    droneGain: 0.05,
    padLevel: 0.04,
  },
  {
    id: "cumbre",
    name: "Cumbre Rota",
    desc: "Piano de mesa de negociaciones que ya se cae a pedazos",
    cat: "ambiente",
    bpm: 72,
    root: st(-24, 87.31), // F0
    chords: [maj(0), min(-3), maj(-7), maj(-5)], // F - Dm - Bb - C
    bass: [0, -1, -1, -1, 7, -1, -1, -1, 0, -1, -1, -1, 10, -1, -1, -1],
    arp: [3, -1, 4, -1, 5, -1, 4, -1, 3, -1, 4, -1, 5, -1, 4, -1],
    arpType: "triangle",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "....x.......x...",
    hat: "................",
    drone: 0,
    droneGain: 0,
    padLevel: 0.06,
  },
  {
    id: "victoria",
    name: "Victoria Final",
    desc: "Fanfarria de banderas — la capital que resiste y celebra",
    cat: "vanguard",
    bpm: 124,
    root: st(-24, 130.81), // C0
    chords: [maj(0), maj(-5), min(-3), maj(-7)], // C - G - Am - F
    bass: [0, -1, 0, -1, 0, -1, 7, -1, 0, -1, 0, -1, 7, -1, 10, 12],
    arp: [3, 4, 5, 7, 5, 4, 3, -1, 4, 5, 6, 8, 6, 5, 4, -1],
    arpType: "square",
    bassType: "sawtooth",
    kick: "x...x...x...x...",
    snare: "....x...x...x...",
    hat: "..x...x...x.x.x.",
    drone: 0,
    droneGain: 0,
    padLevel: 0.05,
    fill: true,
  },
  {
    id: "exodo",
    name: "Éxodo Silencioso",
    desc: "Maletas en la carretera — la marcha lenta de quienes huyen",
    cat: "ambiente",
    bpm: 64,
    root: st(-24, 65.41), // C0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // Cm - Ab - Eb - Bb
    bass: [0, -1, -1, -1, 0, -1, -1, -1, 7, -1, -1, -1, 10, -1, -1, -1],
    arp: [-1, -1, 3, -1, -1, -1, 4, -1, -1, -1, 5, -1, -1, -1, 4, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "........x.......",
    hat: "....x.......x...",
    drone: 0.5,
    droneGain: 0.06,
    padLevel: 0.06,
  },
  {
    id: "bloqueo",
    name: "Bloqueo Naval",
    desc: "Buques de guerra en la gabarra — escoltas y sonar activo",
    cat: "guerra",
    bpm: 76,
    root: st(-24, 55), // G0 profundo
    chords: [min(0), min(5), maj(-5), min(0)], // Gm - Cm - D - Gm
    bass: [0, -1, 0, -1, 0, -1, 0, 7, 0, -1, 0, -1, 0, 10, 7, 0],
    arp: [3, -1, -1, 5, -1, -1, 4, -1, 3, -1, -1, 5, -1, -1, 6, -1],
    arpType: "sawtooth",
    bassType: "sawtooth",
    kick: "x.....x.x.......",
    snare: "....x.......x...",
    hat: "..x...x...x...x.",
    drone: 1,
    droneGain: 0.07,
    padLevel: 0.05,
  },
  {
    id: "ciber",
    name: "Ciberataque",
    desc: "Glitch en la red eléctrica — la guerra que no se ve",
    cat: "guerra",
    bpm: 132,
    root: st(-24, 92.5), // F#0
    chords: [min(0), maj(-4), maj(3), maj(-2)], // F#m - D - A - E
    bass: [0, 0, -1, 0, 0, -1, 0, 7, 0, 0, -1, 0, 0, -1, 10, 7],
    arp: [3, -1, 4, 5, -1, 4, 3, -1, 4, -1, 5, 6, -1, 5, 4, -1],
    arpType: "square",
    bassType: "square",
    kick: "x..x..x...x..x..",
    snare: "..x.......x...x.",
    hat: "x.x.x.x.x.x.x.x.",
    drone: 0,
    droneGain: 0,
    padLevel: 0.035,
    swing: true,
    fill: true,
  },
  {
    id: "invierno",
    name: "Invierno Atómico",
    desc: "Silencio después de la sirena — cielo gris, tierra helada",
    cat: "ambiente",
    bpm: 50,
    root: st(-24, 49), // G0 casi subgrave
    chords: [min(0), maj(-4), min(0), maj(-5)], // Gm - Eb - Gm - D
    bass: [0, -1, -1, -1, -1, -1, -1, -1, -5, -1, -1, -1, -1, -1, -1, -1],
    arp: [-1, -1, -1, 3, -1, -1, -1, -1, 4, -1, -1, -1, -1, -1, 2, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x...............",
    snare: "................",
    hat: "................",
    drone: 1,
    droneGain: 0.1,
    padLevel: 0.07,
  },
  {
    id: "cerco",
    name: "Cerco Urbano",
    desc: "Calles atrincheradas — escombros, protestas y pancartas",
    cat: "guerra",
    bpm: 104,
    root: st(-24, 87.31), // F0
    chords: [min(0), maj(-4), maj(-2), maj(-5)], // Fm - Db - Eb - C
    bass: [0, -1, 0, 0, -1, 0, 7, -1, 0, -1, 0, 0, -1, 10, 7, 0],
    arp: [3, -1, -1, 4, -1, 3, -1, -1, 5, -1, 4, -1, 3, -1, 4, -1],
    arpType: "sawtooth",
    bassType: "sawtooth",
    kick: "x.xx....x.x.....",
    snare: "....x..x....x...",
    hat: "x.x.x.x.x.x.x.x.",
    drone: 0.25,
    droneGain: 0.045,
    padLevel: 0.04,
    fill: true,
  },
  {
    id: "tregua",
    name: "Tregua al Amanecer",
    desc: "Cese al fuego a las 6:00 — café frío y bandera blanca",
    cat: "ambiente",
    bpm: 68,
    root: st(-24, 110), // A0 cálido
    chords: [maj(0), maj(-5), min(4), maj(5)], // A - E - F#m - D
    bass: [0, -1, -1, -1, 7, -1, -1, -1, 0, -1, -1, -1, 7, -1, 12, -1],
    arp: [3, -1, 4, -1, 5, -1, -1, 4, 3, -1, -1, 4, -1, -1, 5, -1],
    arpType: "triangle",
    bassType: "triangle",
    kick: "x.......x.......",
    snare: "................",
    hat: "....x.......x..x",
    drone: 0,
    droneGain: 0,
    padLevel: 0.06,
  },
  {
    id: "ocaso",
    name: "Ocaso en el Frente",
    desc: "El sol cae ámbar sobre las trincheras — la banda sonora del atardecer de Vanguard",
    cat: "ambiente",
    bpm: 64,
    root: st(-24, 98), // G0 cálido
    chords: [maj(0), maj(7), min(4), maj(5)], // G - D - Em - C
    bass: [0, -1, -1, -1, -1, -1, -1, -1, 4, -1, -1, -1, -1, -1, 7, -1],
    arp: [3, -1, -1, 4, -1, -1, 5, -1, -1, -1, 6, -1, -1, 4, -1, -1],
    arpType: "triangle",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "................",
    hat: "....x.......x...",
    drone: 0.5,
    droneGain: 0.04,
    padLevel: 0.075,
  },
  {
    id: "blitz",
    name: "Blitz Total",
    desc: "Columnas mecánicas a 150 BPM — asalto relámpago sin cuartel",
    cat: "guerra",
    bpm: 148,
    root: st(-24, 92.5), // F#0 agresivo
    chords: [min(0), min(0), maj(-5), maj(-2)], // F#m - F#m - B - A
    bass: [0, 0, 12, 0, 0, 10, 0, 0, 0, 0, 12, 0, 7, 0, 10, 0],
    arp: [6, -1, 8, -1, 6, -1, 8, 9, 6, -1, 8, -1, 10, -1, 8, 6],
    arpType: "square",
    bassType: "sawtooth",
    kick: "x...x...x...x..o",
    snare: "....x..o....x...",
    hat: "x.xxx.xxx.xxx.xx",
    drone: 1,
    droneGain: 0.06,
    padLevel: 0.035,
    fill: true,
  },
  {
    id: "himno",
    name: "Himno de Vanguardia",
    desc: "Marcha épica de la agencia — trompetas sintéticas al atardecer",
    cat: "vanguard",
    bpm: 100,
    root: st(-24, 110), // A0
    chords: [min(0), maj(3), maj(5), maj(-2)], // Am - C - D - G
    bass: [0, -1, 0, -1, 7, -1, 0, -1, 0, -1, 0, -1, 5, -1, 7, -1],
    arp: [3, -1, 4, 5, -1, 6, -1, 5, 3, -1, 4, -1, 6, 8, -1, -1],
    arpType: "sawtooth",
    bassType: "sawtooth",
    kick: "x...x...x...x...",
    snare: "....x.......x.o.",
    hat: "..x...x...x...x.",
    drone: 0.5,
    droneGain: 0.05,
    padLevel: 0.06,
    fill: true,
  },
  {
    id: "amanecer",
    name: "Operación Amanecer",
    desc: "Primera luz sobre la base — cuerdas cálidas y esperanza táctica",
    cat: "ambiente",
    bpm: 78,
    root: st(-24, 130.81), // C0 luminoso
    chords: [maj(0), min(-3), maj(-7), maj(-5)], // C - Am - F - G
    bass: [0, -1, -1, 7, -1, -1, 0, -1, -1, -1, 5, -1, -1, -1, 7, -1],
    arp: [0, -1, 4, -1, 6, -1, 8, -1, 6, -1, 4, -1, 6, -1, 8, 9],
    arpType: "triangle",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "........x.......",
    hat: "..x...x...x...x.",
    drone: 0.5,
    droneGain: 0.035,
    padLevel: 0.08,
  },
  {
    id: "fuego",
    name: "Fuego Cruzado",
    desc: "Posiciones enfrentadas a 132 BPM — industrial, metálico, sin tregua",
    cat: "guerra",
    bpm: 132,
    root: st(-24, 87.31), // F0
    chords: [min(0), maj(-4), min(-2), maj(-5)], // Fm - Db - Cm - Bb
    bass: [0, 0, -1, 0, 12, -1, 0, 0, -1, 0, 10, 0, 0, 12, -1, 0],
    arp: [8, -1, 6, 8, -1, 11, -1, 8, 6, -1, 8, -1, 13, 11, 8, -1],
    arpType: "square",
    bassType: "square",
    kick: "x..ox..ox..ox..o",
    snare: "....x.x.....x.x.",
    hat: "x.xxx.xxx.xxx.xo",
    drone: 1,
    droneGain: 0.055,
    padLevel: 0.04,
    fill: true,
  },
  {
    id: "damasco",
    name: "Neón de Damasco",
    desc: "Escala oriental bajo luces de bazar — espías en la ciudad vieja",
    cat: "ambiente",
    bpm: 92,
    root: st(-24, 82.41), // E0
    chords: [min(0), maj(1), maj(-4), maj(5)], // Em - F - C - B
    bass: [0, -1, 1, -1, 0, -1, -1, 1, 0, -1, 5, -1, 7, -1, 5, 1],
    arp: [0, 1, 4, 5, 7, 5, 4, 1, 0, 1, 4, 5, 8, 7, 5, 4],
    arpType: "sawtooth",
    bassType: "triangle",
    kick: "x.....x.x.......",
    snare: "....x.......x...",
    hat: "..x.x.x...x.x.x.",
    drone: 0.5,
    droneGain: 0.05,
    padLevel: 0.05,
  },
  {
    id: "abismo",
    name: "Sintetizador del Abismo",
    desc: "Synthwave de sala de servidores — la verdad a las 3 de la mañana",
    cat: "ambiente",
    bpm: 84,
    root: st(-24, 69.30), // C#0
    chords: [min(0), maj(-4), maj(-2), maj(-7)], // C#m - A - B - E
    bass: [0, 0, -1, 0, -1, 0, 12, -1, 0, 0, -1, 10, -1, 12, -1, 0],
    arp: [6, -1, 9, -1, 11, -1, 9, 6, -1, 8, -1, 6, -1, 9, 11, -1],
    arpType: "sawtooth",
    bassType: "sawtooth",
    kick: "x...x...x...x...",
    snare: "........x.......",
    hat: "..x.x.x.x.x.x.xo",
    drone: 1,
    droneGain: 0.06,
    padLevel: 0.055,
    swing: true,
  },
  {
    id: "aurora",
    name: "Aurora",
    desc: "Luces del norte sobre el cuartel dormido — la calma después del protocolo",
    cat: "ambiente",
    bpm: 56,
    root: st(-24, 87.31), // F0
    chords: [maj(0), maj(-5), min(2), maj(-7)], // F - C - Dm - Bb
    bass: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 7, -1, -1, -1],
    arp: [3, -1, -1, 6, -1, -1, 8, -1, -1, 6, -1, -1, 3, -1, -1, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x...............",
    snare: "................",
    hat: "........x.......",
    drone: 0.5,
    droneGain: 0.045,
    padLevel: 0.09,
  },
  {
    id: "oro",
    name: "Oro de Vanguard",
    desc: "El tema insignia clásico: cuerdas doradas sobre el ocaso",
    cat: "vanguard",
    bpm: 76,
    root: st(-24, 98), // G0
    chords: [min(0), maj(-4), maj(-2), maj(3)], // Gm - Eb - F - C
    bass: [0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1, -1, 0, -1, 7, -1],
    arp: [0, -1, 2, -1, 3, -1, 2, -1, 4, -1, 2, -1, 1, -1, 2, -1],
    arpType: "triangle",
    bassType: "sawtooth",
    kick: "x.......x.......",
    snare: "....x.......x...",
    hat: "..x...x...x...x.",
    drone: 0.5,
    droneGain: 0.05,
    padLevel: 0.1,
    swing: true,
    fill: true,
  },
  {
    id: "grafo",
    name: "Pulso del Grafo",
    desc: "La red del conocimiento latiendo: nodos y aristas en secuencia",
    cat: "vanguard",
    bpm: 122,
    root: st(-24, 82.41), // E0
    chords: [min(0), maj(5), min(3), maj(-4)], // Em - A - G - C
    bass: [0, -1, 0, -1, 0, 0, -1, -1, 0, -1, 0, -1, 0, -1, 10, -1],
    arp: [3, 4, -1, 3, 5, -1, 4, 3, -1, 4, 6, -1, 5, 4, -1, 3],
    arpType: "square",
    bassType: "sawtooth",
    kick: "x...x...x...x...",
    snare: "....x.......x..x",
    hat: "x.x.x.x.x.x.x.x.",
    drone: 0.25,
    droneGain: 0.04,
    padLevel: 0.05,
  },
  {
    id: "neon",
    name: "Neón Vertical",
    desc: "La emisora de noche: synth del feed infinito de Vanguard TV",
    cat: "vanguard",
    bpm: 108,
    root: st(-24, 87.31), // F0
    chords: [min(0), maj(-4), maj(2), min(-7)], // Fm - Db - G - Cm
    bass: [0, 0, -1, 0, -1, 0, -1, 0, 0, 0, -1, 0, -1, 0, 7, -1],
    arp: [0, 2, 3, 4, 3, 2, 0, 2, 3, 4, 5, 4, 3, 2, 1, -1],
    arpType: "sawtooth",
    bassType: "square",
    kick: "x...x...x...x...",
    snare: "....x.......x...",
    hat: "..x...x...x...xx",
    drone: 0,
    droneGain: 0,
    padLevel: 0.06,
  },
  {
    id: "boveda",
    name: "Bóveda Secreta",
    desc: "Dentro del archivo desclasificado: hormigón, luz roja y espera",
    cat: "ambiente",
    bpm: 64,
    root: st(-24, 65.41), // C0
    chords: [min(0), min(-5), maj(-8), maj(-3)], // Cm - Gm - Ab - Bb
    bass: [0, -1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, -1, -1, -1, -1],
    arp: [-1, -1, -1, 3, -1, -1, -1, -1, -1, -1, 4, -1, -1, -1, 6, -1],
    arpType: "sine",
    bassType: "sine",
    kick: "x.......x.......",
    snare: "................",
    hat: "................",
    drone: 1,
    droneGain: 0.09,
    padLevel: 0.08,
  },
];

// ====== v98 MODO ESCENA — la radio sigue tu posición en Vanguard (v109: insignias) ======
export type EscenaKey =
  | "hangar" | "inicio" | "inteligencia" | "juego" | "mercado"
  | "archivo" | "comando" | "observatorio" | "estrategia" | "emisora"
  | "oscsuro" | "creadores" | "social" | "sistema";

export const ESCENA_TRACKS: Record<EscenaKey, string> = {
  hangar: "drones",        // tu base 3D: zumbido de espera
  inicio: "gloria",        // portada: GLORIA ETERNA — el himno épico de la casa (v123)
  inteligencia: "grafo",   // conocimiento: la red latiendo
  juego: "triunfo",        // guerra: la MARCHA DEL TRIUNFO abre el frente (v123)
  mercado: "ciber",        // dinero: Ciberataque
  archivo: "boveda",       // archivo: Bóveda Secreta
  comando: "radio",        // operaciones diarias: Radio Guerra
  observatorio: "estrellas", // vigilancia: NOCHE DE ESTRELLAS bajo la cúpula (v123)
  estrategia: "cerco",     // gran estrategia: Cerco Urbano
  emisora: "neon",         // TV y feeds: Neón Vertical
  oscsuro: "invierno",     // verdad cruda: Invierno Atómico
  creadores: "damasco",    // creadores: Neón de Damasco
  social: "sala",          // comunidad: La Sala Dorada
  sistema: "heroes",       // sistema: CORO DE LOS HÉROES (v123)
};

let escenaActiva: EscenaKey | null = null;
export function setEscenaActiva(e: EscenaKey) { escenaActiva = e; }
export function getEscenaActiva(): EscenaKey | null { return escenaActiva; }

// ====== v112 SOLSTICIO — SESIÓN CONTINUA INTELIGENTE ======
// La radio encadena obras de la FAMILIA que pide la hora del día:
//   ALBA (05-11)     → AMBIENTE  (el planeta despierta sereno)
//   DÍA  (11-18)     → VANGUARD  (la firma de la casa en plena luz)
//   NOCHE (18-23)    → GUERRA    (la noche es del frente)
//   MADRUGADA (23-05)→ AMBIENTE  (la madrugada vuelve a la calma)
export type FranjaMusical = "alba" | "dia" | "noche" | "madrugada";
export function franjaMusical(d = new Date()): { franja: FranjaMusical; fam: TrackCat } {
  const h = d.getHours();
  if (h >= 5 && h < 11) return { franja: "alba", fam: "ambiente" };
  if (h >= 11 && h < 18) return { franja: "dia", fam: "vanguard" };
  if (h >= 18 && h < 23) return { franja: "noche", fam: "guerra" };
  return { franja: "madrugada", fam: "ambiente" };
}

// ====== v98 VARIACIÓN DIARIA — la radio suena ÚNICA cada día ======
// Determinista por fecha UTC: mismo día = misma versión en todo el planeta.
// rot rota la progresión · arpShift transpone · hatAcc mueve el acento.
// 4 × 4 × 3 = 48 ediciones distintas por pista.
function variacionDiaria(): { rot: number; arpShift: number; hatAcc: number; variante: number } {
  const day = Math.floor(Date.now() / 86_400_000); // días UTC
  return {
    rot: day % 4,
    arpShift: [0, 0, 12, -12][day % 4],
    hatAcc: day % 3,
    variante: day % 2, // la A' cambia de carácter cada dos días
  };
}

// v109: número de edición de hoy (para la Radio) — determinista, 1..48
export function edicionDeHoy(): number {
  const v = variacionDiaria();
  // clamp 1..48: la variación diaria puede sumar de más (v111: Nº 49/48 visto en QA)
  return Math.min(EDICIONES_TOTAL, v.rot * 12 + ([0, 0, 12, -12].indexOf(v.arpShift) + 1) * 3 + v.hatAcc + 1);
}
export const EDICIONES_TOTAL = 48;

// ================== MOTOR V4 — ORQUESTA DE ORO ==================
let ctx: AudioContext | null = null;
let master: GainNode | null = null; // pre-ganancia (volumen)
let analyser: AnalyserNode | null = null;
let reverbBus: GainNode | null = null;
let delayBus: GainNode | null = null;
let delayL: DelayNode | null = null;
let delayR: DelayNode | null = null;
let padFilter: BiquadFilterNode | null = null;
let padDriftLfo: OscillatorNode | null = null;
let droneOsc: OscillatorNode | null = null;
let droneOsc2: OscillatorNode | null = null;
let droneAir: AudioBufferSourceNode | null = null;
let droneGain: GainNode | null = null;
let droneLfo: OscillatorNode | null = null;
let noiseBuf: AudioBuffer | null = null;
// v111 ECUALIZADOR DE SALA — 3 bandas entre el EQ de fábrica y el bus comp
let eqBajo: BiquadFilterNode | null = null;
let eqMedio: BiquadFilterNode | null = null;
let eqAlto: BiquadFilterNode | null = null;
const eqValores: { bajo: number; medio: number; alto: number } = { bajo: 0, medio: 0, alto: 0 };
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextTime = 0;
let current: TrackDef | null = null;
let volume = 0.5;
const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((s) => s());
}

// ---- impulso de reverb v2: sala cálida con cola que se oscurece ----
function buildReverbImpulse(c: AudioContext): AudioBuffer {
  const dur = 3.0;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const x = i / len;
      const n = Math.random() * 2 - 1;
      // filtro un polo cuyo corte baja con el tiempo → cola cada vez más oscura
      const k = 0.62 - 0.5 * x;
      lp += k * (n - lp);
      d[i] = lp * Math.pow(1 - x, 2.6);
    }
    // reflexiones tempranas (el oído las lee como "sala de verdad")
    const taps = [0.011, 0.019, 0.031, 0.047, 0.067];
    const gains = [0.42, 0.33, 0.26, 0.19, 0.13];
    for (let tI = 0; tI < taps.length; tI++) {
      const idx = Math.floor(taps[tI] * c.sampleRate) + (ch === 1 ? 37 : 0);
      if (idx < len) d[idx] += (ch === 0 ? 1 : -1) * gains[tI] * 0.8;
    }
  }
  return buf;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();

      // ── CADENA MASTER DE ESTUDIO ──
      const hpf = ctx.createBiquadFilter(); // limpia el rumor infrasonoro
      hpf.type = "highpass";
      hpf.frequency.value = 28;
      hpf.Q.value = 0.71;
      const eqFango = ctx.createBiquadFilter(); // quita la acumulación de 240Hz
      eqFango.type = "peaking";
      eqFango.frequency.value = 240;
      eqFango.gain.value = -1.6;
      eqFango.Q.value = 0.9;
      const eqAire = ctx.createBiquadFilter(); // brillo de orquesta
      eqAire.type = "highshelf";
      eqAire.frequency.value = 9000;
      eqAire.gain.value = 2.2;
      // ── v111 ECUALIZADOR DE SALA (3 bandas, lo mueve el Auditorio) ──
      eqBajo = ctx.createBiquadFilter();
      eqBajo.type = "lowshelf"; eqBajo.frequency.value = 180; eqBajo.gain.value = 0;
      eqMedio = ctx.createBiquadFilter();
      eqMedio.type = "peaking"; eqMedio.frequency.value = 1000; eqMedio.Q.value = 0.85; eqMedio.gain.value = 0;
      eqAlto = ctx.createBiquadFilter();
      eqAlto.type = "highshelf"; eqAlto.frequency.value = 5200; eqAlto.gain.value = 0;
      const comp = ctx.createDynamicsCompressor(); // pega el conjunto
      comp.threshold.value = -20;
      comp.knee.value = 24;
      comp.ratio.value = 2.6;
      comp.attack.value = 0.006;
      comp.release.value = 0.28;
      const limiter = ctx.createDynamicsCompressor(); // techo: nada satura
      limiter.threshold.value = -5;
      limiter.knee.value = 0;
      limiter.ratio.value = 14;
      limiter.attack.value = 0.001;
      limiter.release.value = 0.1;
      analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.78;

      master = ctx.createGain();
      master.gain.value = volume * 0.5;
      master.connect(hpf);
      hpf.connect(eqFango); eqFango.connect(eqAire);
      eqAire.connect(eqBajo); eqBajo.connect(eqMedio); eqMedio.connect(eqAlto);
      eqAlto.connect(comp); comp.connect(limiter);
      limiter.connect(analyser);
      analyser.connect(ctx.destination);

      // buffer de ruido compartido (las percusiones lo leen con offset)
      noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1.2), ctx.sampleRate);
      const nd = noiseBuf.getChannelData(0);
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

      // ── REVERB (bus de sala) ──
      const conv = ctx.createConvolver();
      conv.buffer = buildReverbImpulse(ctx);
      const wet = ctx.createGain();
      wet.gain.value = 0.85;
      reverbBus = ctx.createGain();
      reverbBus.gain.value = 1;
      reverbBus.connect(conv);
      conv.connect(wet);
      wet.connect(master);

      // ── DELAY PING-PONG filtrado ──
      delayBus = ctx.createGain();
      delayL = ctx.createDelay(1.6);
      delayR = ctx.createDelay(1.6);
      const fbLp = ctx.createBiquadFilter();
      fbLp.type = "lowpass"; fbLp.frequency.value = 2600;
      const fbHp = ctx.createBiquadFilter();
      fbHp.type = "highpass"; fbHp.frequency.value = 300;
      const fb = ctx.createGain(); fb.gain.value = 0.34;
      const panL = ctx.createStereoPanner(); panL.pan.value = -0.55;
      const panR = ctx.createStereoPanner(); panR.pan.value = 0.55;
      delayBus.connect(delayL);
      delayL.connect(fbLp); fbLp.connect(fbHp);
      fbHp.connect(panL); panL.connect(master);          // eco 1 → izquierda
      fbHp.connect(delayR);                              // cruza
      delayR.connect(panR); panR.connect(master);        // eco 2 → derecha
      delayR.connect(fb); fb.connect(delayL);            // el loop baila L→R→L
      if (reverbBus) { panR.connect(reverbBus); }

      // ── BUS DE PADS: filtro cálido + deriva lenta + chorus ──
      padFilter = ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.value = 2100;
      padFilter.Q.value = 0.4;
      const dry = ctx.createGain(); dry.gain.value = 0.72;
      padFilter.connect(dry); dry.connect(master);
      // chorus estéreo: dos líneas de retraso moduladas L/R
      const chL = ctx.createDelay(0.1); chL.delayTime.value = 0.012;
      const chR = ctx.createDelay(0.1); chR.delayTime.value = 0.017;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.5;
      const lfoG = ctx.createGain(); lfoG.gain.value = 0.0026;
      const lfo2 = ctx.createOscillator(); lfo2.frequency.value = 0.37;
      const lfo2G = ctx.createGain(); lfo2G.gain.value = 0.0031;
      lfo.connect(lfoG); lfoG.connect(chL.delayTime);
      lfo2.connect(lfo2G); lfo2G.connect(chR.delayTime);
      const chPanL = ctx.createStereoPanner(); chPanL.pan.value = -0.6;
      const chPanR = ctx.createStereoPanner(); chPanR.pan.value = 0.6;
      const chGL = ctx.createGain(); chGL.gain.value = 0.34;
      const chGR = ctx.createGain(); chGR.gain.value = 0.34;
      padFilter.connect(chL); chL.connect(chGL); chGL.connect(chPanL); chPanL.connect(master);
      padFilter.connect(chR); chR.connect(chGR); chGR.connect(chPanR); chPanR.connect(master);
      if (reverbBus) padFilter.connect(reverbBus);
      padDriftLfo = lfo; // guardado para no recolectarlo
      lfo.start(); lfo2.start();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function noise(c: AudioContext, t: number, dur: number, rate = 1): AudioBufferSourceNode | null {
  if (!noiseBuf) return null;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  src.playbackRate.value = rate;
  src.start(t, Math.random() * 0.5, dur + 0.05);
  return src;
}

// ---------- PERCUSIÓN REFINADA ----------
function playKick(c: AudioContext, t: number, accent: boolean) {
  if (!master) return;
  const g = c.createGain();
  g.connect(master);
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(accent ? 118 : 102, t);
  o.frequency.exponentialRampToValueAtTime(37, t + 0.16);
  g.gain.setValueAtTime(accent ? 0.5 : 0.38, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  o.connect(g); o.start(t); o.stop(t + 0.3);
  // cuerpo redondo
  const b = c.createOscillator();
  const bg = c.createGain();
  b.type = "triangle";
  b.frequency.setValueAtTime(84, t);
  b.frequency.exponentialRampToValueAtTime(52, t + 0.07);
  bg.gain.setValueAtTime(0.14, t);
  bg.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  b.connect(bg); bg.connect(master); b.start(t); b.stop(t + 0.1);
  // click filtrado (definición sin "pop")
  const s = noise(c, t, 0.018, 1.4);
  if (s) {
    const f = c.createBiquadFilter();
    f.type = "highpass"; f.frequency.value = 3200;
    const cg = c.createGain();
    cg.gain.setValueAtTime(accent ? 0.12 : 0.08, t);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
    s.connect(f); f.connect(cg); cg.connect(master); s.stop(t + 0.03);
  }
}

function playSnare(c: AudioContext, t: number, accent: boolean) {
  if (!master) return;
  const s = noise(c, t, 0.18, 1);
  if (s) {
    const f = c.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 1650; f.Q.value = 0.8;
    const g = c.createGain();
    g.gain.setValueAtTime(accent ? 0.24 : 0.14, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    s.connect(f); f.connect(g); g.connect(master);
    if (reverbBus) g.connect(reverbBus);
    s.stop(t + 0.2);
  }
  // snap de agudos
  const s2 = noise(c, t, 0.05, 1.6);
  if (s2) {
    const f2 = c.createBiquadFilter();
    f2.type = "highpass"; f2.frequency.value = 6000;
    const g2 = c.createGain();
    g2.gain.setValueAtTime(accent ? 0.1 : 0.06, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    s2.connect(f2); f2.connect(g2); g2.connect(master); s2.stop(t + 0.07);
  }
  // cuerpo tonal
  const o = c.createOscillator();
  const og = c.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(196, t);
  o.frequency.exponentialRampToValueAtTime(132, t + 0.08);
  og.gain.setValueAtTime(accent ? 0.11 : 0.07, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
  o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.1);
}

function playHat(c: AudioContext, t: number, accent: boolean, open = false) {
  if (!master) return;
  const dur = open ? 0.16 : 0.038;
  const s = noise(c, t, dur, open ? 0.9 : 1.25);
  if (!s) return;
  const hp = c.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 9200;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 7800; bp.Q.value = 0.6;
  const g = c.createGain();
  g.gain.setValueAtTime(accent ? 0.062 : 0.032, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(hp); hp.connect(bp); bp.connect(g); g.connect(master);
  s.stop(t + dur + 0.02);
}

function playShaker(c: AudioContext, t: number, accent: boolean) {
  if (!master) return;
  const s = noise(c, t, 0.05, 1.1);
  if (!s) return;
  const f = c.createBiquadFilter();
  f.type = "bandpass"; f.frequency.value = 5600; f.Q.value = 1.1;
  const g = c.createGain();
  g.gain.setValueAtTime(accent ? 0.024 : 0.014, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
  s.connect(f); f.connect(g); g.connect(master);
  if (reverbBus) g.connect(reverbBus);
  s.stop(t + 0.06);
}

function playTom(c: AudioContext, t: number, freq: number) {
  if (!master) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.55, t + 0.2);
  g.gain.setValueAtTime(0.3, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
  o.connect(g); g.connect(master);
  if (reverbBus) g.connect(reverbBus);
  o.start(t); o.stop(t + 0.26);
}

// ---------- NOTAS ----------
function routeVoice(
  c: AudioContext, g: GainNode, opts?: { reverb?: number; delay?: number; pan?: number },
) {
  if (!master) return;
  if (opts?.pan && typeof c.createStereoPanner === "function") {
    const p = c.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, opts.pan));
    g.connect(p); p.connect(master);
    if (opts?.reverb && reverbBus) { const r = c.createGain(); r.gain.value = opts.reverb; p.connect(r); r.connect(reverbBus); }
    if (opts?.delay && delayBus) { const d = c.createGain(); d.gain.value = opts.delay; p.connect(d); d.connect(delayBus); }
  } else {
    g.connect(master);
    if (opts?.reverb && reverbBus) { const r = c.createGain(); r.gain.value = opts.reverb; g.connect(r); r.connect(reverbBus); }
    if (opts?.delay && delayBus) { const d = c.createGain(); d.gain.value = opts.delay; g.connect(d); d.connect(delayBus); }
  }
}

// nota simple (arpegio de textura)
function playNote(
  c: AudioContext, t: number, freq: number, dur: number, type: OscillatorType,
  gain: number, opts?: { reverb?: number; delay?: number; cutoff?: number; pan?: number },
) {
  const osc = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = opts?.cutoff ?? (type === "sawtooth" || type === "square" ? 1500 : 3200);
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(f); f.connect(g);
  routeVoice(c, g, opts);
  osc.start(t); osc.stop(t + dur + 0.06);
}

// VOZ DORADA — FM de campana suave (el piano eléctrico de Vanguard)
function playFM(
  c: AudioContext, t: number, freq: number, dur: number, gain: number,
  opts?: { reverb?: number; delay?: number; pan?: number },
) {
  if (!master) return;
  const car = c.createOscillator();
  const mod = c.createOscillator();
  const modG = c.createGain();
  const env = c.createGain();
  const f = c.createBiquadFilter();
  f.type = "lowpass"; f.frequency.value = 4400;
  car.type = "sine"; car.frequency.value = freq;
  mod.type = "sine"; mod.frequency.value = freq * 2.005;
  // el índice cae → ataque con cuerpo, cola pura (dulzura)
  modG.gain.setValueAtTime(freq * 2.3, t);
  modG.gain.exponentialRampToValueAtTime(freq * 0.22, t + Math.min(0.42, dur * 0.6));
  mod.connect(modG); modG.connect(car.frequency);
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(gain, t + 0.007);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.45);
  car.connect(env); env.connect(f);
  routeVoice(c, f, { reverb: 0.4, delay: 0.45, ...opts });
  car.start(t); mod.start(t);
  car.stop(t + dur * 1.5 + 0.1); mod.stop(t + dur * 1.5 + 0.1);
  // cuerpo cálido debajo de la campana
  const body = c.createOscillator();
  const bg = c.createGain();
  body.type = "triangle"; body.frequency.value = freq;
  bg.gain.setValueAtTime(0, t);
  bg.gain.linearRampToValueAtTime(gain * 0.32, t + 0.01);
  bg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7);
  body.connect(bg);
  routeVoice(c, bg, { pan: opts?.pan });
  body.start(t); body.stop(t + dur * 0.8);
}

// VOZ DE CRISTAL — senos armónicos etéreos (Noche Serena)
function playGlass(
  c: AudioContext, t: number, freq: number, dur: number, gain: number,
  opts?: { reverb?: number; delay?: number; pan?: number },
) {
  if (!master) return;
  const partials: [number, number, number][] = [[1, 1, 1], [3, 0.14, 0.7], [7.02, 0.04, 0.4]];
  for (const [mult, amp, durMult] of partials) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq * mult;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain * amp, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.9 * durMult);
    o.connect(g);
    routeVoice(c, g, { reverb: 0.6, delay: 0.5, ...opts });
    o.start(t); o.stop(t + dur * 2 + 0.1);
  }
}

// VOZ DE METALES — sierras con envolvente de filtro (Última Frontera)
function playBrass(
  c: AudioContext, t: number, freq: number, dur: number, gain: number,
  opts?: { reverb?: number; delay?: number; pan?: number },
) {
  if (!master) return;
  const f = c.createBiquadFilter();
  f.type = "lowpass"; f.Q.value = 1.1;
  f.frequency.setValueAtTime(2100, t);
  f.frequency.exponentialRampToValueAtTime(720, t + dur);
  const env = c.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(gain, t + 0.045);
  env.gain.setValueAtTime(gain, t + dur * 0.7);
  env.gain.linearRampToValueAtTime(0.0001, t + dur * 1.15);
  for (const det of [-8, 8]) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    o.detune.value = det;
    o.connect(env);
    o.start(t); o.stop(t + dur * 1.2);
  }
  const sub = c.createOscillator();
  const sg = c.createGain();
  sub.type = "sine"; sub.frequency.value = freq / 2;
  sg.gain.setValueAtTime(0, t);
  sg.gain.linearRampToValueAtTime(gain * 0.4, t + 0.05);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.1);
  sub.connect(sg);
  sg.connect(master!);
  sub.start(t); sub.stop(t + dur * 1.15);
  env.connect(f);
  routeVoice(c, f, { reverb: 0.3, delay: 0.22, ...opts });
}

// ═════════ v123 GLORIA ETERNA — LA ORQUESTA ÉPICA (cinco voces nuevas) ═════════

// TIMBAL — timbal afinado al acorde: membrana que cae de pitch, golpe de fieltro
function playTimbal(
  c: AudioContext, t: number, freq: number, gain: number,
  opts?: { reverb?: number },
) {
  if (!master) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  // la membrana ARRIBA y cae — el "boom" del timbal de verdad
  o.frequency.setValueAtTime(freq * 1.65, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.085);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.15);
  o.connect(g);
  routeVoice(c, g, { reverb: opts?.reverb ?? 0.35 });
  o.start(t); o.stop(t + 1.2);
  // el mazo: golpe corto de ruido filtrado (ataque que se siente en el pecho)
  if (noiseBuf) {
    const n = c.createBufferSource();
    n.buffer = noiseBuf;
    n.playbackRate.value = 0.7;
    const f = c.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 190; f.Q.value = 0.9;
    const ng = c.createGain();
    ng.gain.setValueAtTime(gain * 0.55, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    n.connect(f); f.connect(ng); ng.connect(master);
    n.start(t); n.stop(t + 0.08);
  }
  // armónico de resonancia (la caja del timbal cantando detrás)
  const r = c.createOscillator();
  const rg = c.createGain();
  r.type = "triangle";
  r.frequency.value = freq * 1.5;
  rg.gain.setValueAtTime(gain * 0.22, t);
  rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  r.connect(rg); rg.connect(master);
  r.start(t); r.stop(t + 0.55);
}

// CORO CELESTIAL — "aah" humano: sierras por DOS FORMANTES de vocal + vibrato lento
function playCoro(
  c: AudioContext, t: number, freq: number, dur: number, gain: number,
  opts?: { reverb?: number; pan?: number },
) {
  if (!master) return;
  const env = c.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(gain, t + dur * 0.38); // el aire llenando el pecho
  env.gain.setValueAtTime(gain, t + dur * 0.78);
  env.gain.linearRampToValueAtTime(0, t + dur * 1.28); // la cola cruza al acorde siguiente
  // DOS formantes de la vocal "a" (el oído lee VOZ HUMANA, no sintetizador)
  const fA = c.createBiquadFilter();
  fA.type = "bandpass"; fA.frequency.value = 640; fA.Q.value = 1.3;
  const fB = c.createBiquadFilter();
  fB.type = "bandpass"; fB.frequency.value = 1060; fB.Q.value = 1.6;
  const gB = c.createGain(); gB.gain.value = 0.55;
  env.connect(fA); env.connect(fB); fB.connect(gB);
  // vibrato colectivo (el coro respira juntos)
  const vib = c.createOscillator();
  const vibG = c.createGain();
  vib.frequency.value = 4.3; vibG.gain.value = 4.5; // cents
  vib.start(t); vib.stop(t + dur * 1.3);
  for (const det of [-7, 0, 7]) {
    const o = c.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = freq;
    o.detune.value = det;
    vibG.connect(o.detune);
    o.connect(env);
    o.start(t); o.stop(t + dur * 1.32);
  }
  fA.connect(master!); gB.connect(master!);
  routeVoice(c, env, { reverb: opts?.reverb ?? 0.62, pan: opts?.pan });
  routeVoice(c, gB, { pan: opts?.pan });
}

// PLATILLO — crash con cola dorada (el instante de gloria)
function playPlatillo(c: AudioContext, t: number, gain: number) {
  if (!master || !noiseBuf) return;
  const n = c.createBufferSource();
  n.buffer = noiseBuf;
  n.playbackRate.value = 1.4;
  const f = c.createBiquadFilter();
  f.type = "highpass"; f.frequency.value = 4200;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
  const brillo = c.createBiquadFilter();
  brillo.type = "highshelf"; brillo.frequency.value = 8000; brillo.gain.value = 4;
  n.connect(f); f.connect(brillo); brillo.connect(g); g.connect(master);
  if (reverbBus) { const r = c.createGain(); r.gain.value = 0.5; g.connect(r); r.connect(reverbBus); }
  n.start(t); n.stop(t + 2.2);
}

// TROMPETA HEROICA — la voz que proclama: formante de latón, ataque de abanderado
function playTrompeta(
  c: AudioContext, t: number, freq: number, dur: number, gain: number,
  opts?: { reverb?: number; delay?: number; pan?: number },
) {
  if (!master) return;
  const f = c.createBiquadFilter();
  f.type = "bandpass"; f.frequency.value = Math.min(2800, freq * 3.2); f.Q.value = 0.85;
  const brillo = c.createBiquadFilter();
  brillo.type = "highshelf"; brillo.frequency.value = 5200; brillo.gain.value = 5;
  const env = c.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(gain, t + 0.035); // la lengua ataca
  env.gain.setValueAtTime(gain, t + dur * 0.72);
  env.gain.linearRampToValueAtTime(0.0001, t + dur * 1.12);
  // vibrato del heroísmo (llega tarde, como el pulso del que sostiene la nota)
  const vib = c.createOscillator();
  const vibG = c.createGain();
  vib.frequency.value = 5.2;
  vibG.gain.setValueAtTime(0, t);
  vibG.gain.linearRampToValueAtTime(6, t + Math.min(0.3, dur * 0.45));
  vib.start(t); vib.stop(t + dur * 1.15);
  for (const [type, det, lv] of [["sawtooth", -6, 1], ["sawtooth", 6, 1], ["square", 0, 0.4]] as const) {
    const o = c.createOscillator();
    o.type = type as OscillatorType;
    o.frequency.value = freq;
    o.detune.value = det;
    const og = c.createGain(); og.gain.value = lv;
    vibG.connect(o.detune);
    o.connect(og); og.connect(env);
    o.start(t); o.stop(t + dur * 1.18);
  }
  // la boquilla: sub senoidal presente pero digno
  const sub = c.createOscillator();
  const sg = c.createGain();
  sub.type = "sine"; sub.frequency.value = freq / 2;
  sg.gain.setValueAtTime(0, t);
  sg.gain.linearRampToValueAtTime(gain * 0.3, t + 0.05);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.05);
  sub.connect(sg); sg.connect(master);
  sub.start(t); sub.stop(t + dur * 1.1);
  env.connect(f); f.connect(brillo);
  routeVoice(c, brillo, { reverb: opts?.reverb ?? 0.38, delay: opts?.delay ?? 0.2, ...opts });
}

// ARPA — glissando dorado que barre el acorde (el respiro entre batallas)
function playArpa(c: AudioContext, t: number, chordSemis: number[], root: number) {
  const grados = [0, 1, 2, 3, 4, 5]; // raíz→3ª→5ª→octava→3ª'→5ª'
  grados.forEach((gIdx, k) => {
    const oct = Math.floor(gIdx / 3);
    const semi = chordSemis[gIdx % 3] + 12 * oct;
    playNote(c, t + k * 0.052, st(semi, root * 8), 0.9, "triangle", 0.035 - k * 0.002, {
      reverb: 0.55, delay: 0.4, pan: k % 2 === 0 ? -0.3 : 0.3,
    });
  });
}

function leadVoice(c: AudioContext, t: number, freq: number, dur: number, gain: number, type: LeadType, pan: number) {
  if (type === "glass") playGlass(c, t, freq, dur, gain, { pan });
  else if (type === "brass") playBrass(c, t, freq, dur, gain, { pan });
  else if (type === "heroe") playTrompeta(c, t, freq, dur, gain * 1.15, { pan }); // v123: el abanderado
  else if (type === "coro") playCoro(c, t, freq, Math.max(dur * 2.2, 0.5), gain * 1.6, { pan }); // v123: la voz colectiva
  else playFM(c, t, freq, dur, gain, { pan });
}

// ---------- PAD v4: colchón de orquesta ----------
function playPad(c: AudioContext, t: number, chordSemis: number[], root: number, barDur: number, level: number, rich: boolean) {
  if (!padFilter || level <= 0) return;
  const isMin = ((chordSemis[1] - chordSemis[0]) % 12 + 12) % 12 === 3;
  const color = chordSemis[0] + (isMin ? 10 : 11); // 7ª menor/mayor
  // [fundamental, 3ª, 5ª, (7ª si rica), octava] — registro medio
  const notes: { semi: number; mult: number }[] = [
    { semi: chordSemis[0], mult: 1 },
    { semi: chordSemis[1], mult: 1 },
    { semi: chordSemis[2], mult: 1 },
  ];
  if (rich) notes.push({ semi: color, mult: 1 });
  notes.push({ semi: chordSemis[0] + 12, mult: 0.7 });
  const per = level / (rich ? 2.4 : 2.0);
  for (const n of notes) {
    for (const det of [-7, 7]) {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = st(n.semi, root * 4);
      osc.detune.value = det;
      const atk = barDur * 0.42;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(per * n.mult, t + atk);
      g.gain.setValueAtTime(per * n.mult, t + barDur * 0.85);
      g.gain.linearRampToValueAtTime(0, t + barDur * 1.35); // la cola cruza al siguiente acorde (legato)
      osc.connect(g); g.connect(padFilter);
      osc.start(t); osc.stop(t + barDur * 1.4);
    }
  }
  // sub triangular una octava abajo (el corazón del colchón)
  const sub = c.createOscillator();
  const sg = c.createGain();
  sub.type = "triangle";
  sub.frequency.value = st(chordSemis[0], root * 2);
  sg.gain.setValueAtTime(0, t);
  sg.gain.linearRampToValueAtTime(level * 0.5, t + barDur * 0.45);
  sg.gain.setValueAtTime(level * 0.5, t + barDur * 0.85);
  sg.gain.linearRampToValueAtTime(0, t + barDur * 1.3);
  sub.connect(sg); sg.connect(padFilter);
  sub.start(t); sub.stop(t + barDur * 1.35);
}

// ---------- DRONE QUE SIGUE AL ACORDE ----------
function startDrone(t: TrackDef) {
  const c = getCtx();
  if (!c || !master || !t.drone) return;
  stopDrone();
  droneGain = c.createGain();
  const dFilter = c.createBiquadFilter();
  dFilter.type = "lowpass";
  dFilter.frequency.value = 340;
  droneOsc = c.createOscillator();
  droneOsc.type = "sine";
  droneOsc.frequency.value = st(0, t.root * 4 * t.drone);
  droneOsc2 = c.createOscillator();
  droneOsc2.type = "sine";
  droneOsc2.frequency.value = st(0, t.root * 4 * t.drone);
  droneOsc2.detune.value = 7;
  droneGain.gain.value = t.droneGain;
  droneLfo = c.createOscillator();
  const lfoGain = c.createGain();
  droneLfo.frequency.value = 0.09;
  lfoGain.gain.value = t.droneGain * 0.4;
  droneLfo.connect(lfoGain); lfoGain.connect(droneGain.gain);
  droneOsc.connect(dFilter); droneOsc2.connect(dFilter);
  dFilter.connect(droneGain); droneGain.connect(master);
  // capa de aire (respiración de la sala, lazo del ruido compartido)
  if (noiseBuf) {
    const af = c.createBiquadFilter();
    af.type = "lowpass"; af.frequency.value = 480;
    const ag = c.createGain();
    ag.gain.value = t.droneGain * 0.35;
    const loop = c.createBufferSource();
    loop.buffer = noiseBuf;
    loop.loop = true;
    loop.playbackRate.value = 0.5;
    loop.connect(af); af.connect(ag); ag.connect(master);
    loop.start();
    droneAir = loop;
  }
  droneOsc.start(c.currentTime);
  droneOsc2.start(c.currentTime);
  droneLfo.start(c.currentTime);
}

function stopDrone() {
  try {
    droneOsc?.stop(); droneOsc2?.stop(); droneLfo?.stop(); droneAir?.stop();
  } catch { /* noop */ }
  droneOsc = null; droneOsc2 = null; droneLfo = null; droneAir = null; droneGain = null;
}

// ---------- EL COMPOSITOR: motivo → secuencia → cadencia ----------
// Las pistas sin motivo propio heredan el contorno del arpegio una octava
// arriba (mismo tono del acorde, registro de canto); las densas se aclaran.
const LEAD_CACHE = new Map<string, number[]>();
function getLead(t: TrackDef): number[] {
  let l = LEAD_CACHE.get(t.id);
  if (!l) {
    if (t.lead) l = t.lead;
    else {
      const dens = t.arp.filter((a) => a >= 0).length;
      const thin = dens > 9;
      l = t.arp.map((a, idx) => (a < 0 || (thin && idx % 2 === 1) ? -1 : a + 3));
    }
    LEAD_CACHE.set(t.id, l);
  }
  return l;
}

function scheduler() {
  const c = ctx;
  const t = current;
  if (!c || !t || !master) return;
  const stepDur = 60 / t.bpm / 4; // semicorcheas
  const barDur = stepDur * 16;
  const vari = variacionDiaria();
  const leadArr = getLead(t);
  const leadType: LeadType = t.leadType ?? (t.cat === "guerra" ? "brass" : t.cat === "vanguard" ? "fm" : "glass");
  while (nextTime < c.currentTime + 0.24) {
    const i = step % 16;
    const barAbs = Math.floor(step / 16);
    const barInCycle = barAbs % 16;
    const cycle = Math.floor(barAbs / 16);
    // estructura A A' · respiro · B · A''
    const section = barInCycle < 4 ? 0 : barInCycle < 8 ? 1 : barInCycle < 12 ? 2 : 3;
    const chordSet = section === 2 && t.chordsB ? t.chordsB : t.chords;
    const chord = chordSet[(barInCycle % 4 + vari.rot) % 4];
    const intro = cycle === 0 && barInCycle < 2; // la orquesta entra respirando
    const breath = barInCycle === 7; // el compás que contiene la respiración
    const filling = !!t.fill && barInCycle === 15 && i >= 12;
    const swingOffset = t.swing && i % 2 === 1 ? stepDur * 0.16 : 0;
    const time = nextTime + swingOffset;

    // ── drone: desliza a la fundamental del compás (el suelo se mueve contigo)
    if (i === 0 && droneOsc && droneOsc2 && t.drone) {
      const target = st(chord[0], t.root * 4 * t.drone);
      try {
        droneOsc.frequency.exponentialRampToValueAtTime(target, time + 0.55);
        droneOsc2.frequency.exponentialRampToValueAtTime(target, time + 0.55);
      } catch { /* noop */ }
    }

    // ── v123 GLORIA ETERNA: la planta épica ──
    // TIMBALES afinados al acorde: en el arranque de compás (cada compás en el
    // puente/clímax, compases alternos en el resto); la intro respira sin ellos.
    if (t.timbal && i === 0 && !intro && !breath) {
      const climax = section === 2 || barInCycle >= 12;
      if (climax || barAbs % 2 === 0) {
        playTimbal(c, time, st(chord[0], t.root * 2), climax ? 0.3 : 0.2);
      }
    }
    // CORO CELESTIAL: canta la fundamental del acorde (y la 5ª arriba en el puente)
    if (t.coro && i === 0 && !intro) {
      playCoro(c, time, st(chord[0], t.root * 4), barDur, section === 2 ? 0.055 : 0.034, { pan: 0 });
      if (section === 2) playCoro(c, time + barDur * 0.5, st(chord[2], t.root * 4), barDur * 0.5, 0.03, { pan: 0.3 });
    }
    // PLATILLO: el crash corona la entrada del puente y el final de ciclo épico
    if (t.epico && i === 0 && barInCycle === 8 && !intro) playPlatillo(c, time, 0.14);
    if (t.epico && filling && i === 12) playPlatillo(c, time + stepDur * 2, 0.1);
    // ARPA: el glissando dorado-barre el acorde en la respiración (calma entre murallas)
    if (t.epico && breath && i === 0) playArpa(c, time, chord, t.root);

    // ── batería (ausente en la intro; en el respiro solo hats)
    if (!intro) {
      const isKick = t.kick[i] === "x" || t.kick[i] === "o";
      const isSn = t.snare[i] === "x" || t.snare[i] === "o" || (filling && i % 2 === 0);
      if (isKick && !breath) playKick(c, time, t.kick[i] === "o");
      if (isSn && !breath) playSnare(c, time, t.snare[i] === "o" || filling);
      const hatOn = t.hat[i] === "x" || t.hat[i] === "o" || (filling && i % 2 === 1);
      if (hatOn) playHat(c, time, t.hat[i] === "o" || (filling && i % 2 === 1), (t.hat[i] === "o" && i > 10) || (breath && i === 12));
      if (t.shaker && i % 2 === 1 && !breath) playShaker(c, time, i % 4 === 3);
      if (filling && i === 14) playTom(c, time, st(chord[0], t.root * 8));
    }

    // ── bajo (late incluso en la respiración, más suave)
    const b = t.bass[i];
    if (b >= 0 && !intro) {
      playNote(c, time, st(chord[0] + b, t.root * 2), stepDur * 2.4, t.bassType, breath ? 0.09 : 0.16, { cutoff: 520 });
    }

    // ── arpegio de textura (callado en la intro, brilla en el puente)
    const a = t.arp[i];
    if (a >= 0 && !intro) {
      const oct = Math.floor(a / 3);
      const tone = chord[a % 3] + 12 * oct + vari.arpShift;
      playNote(c, time, st(tone, t.root * 4), stepDur * 2.6, t.arpType, section === 2 ? 0.04 : 0.03, {
        reverb: 0.5,
        delay: 0.5,
        cutoff: t.arpType === "square" ? 1500 : 3200,
        pan: i % 4 === 0 ? -0.32 : i % 4 === 2 ? 0.32 : i % 2 === 1 ? 0.16 : -0.16,
      });
    }

    // ── pad al inicio de cada compás
    if (i === 0) {
      const lvl = t.padLevel * (intro ? 1.1 : breath ? 1.15 : 1);
      playPad(c, time, chord, t.root, barDur, lvl, t.rich === true);
    }

    // ── LA VOZ DORADA: motivo → variante → puente → cadencia
    if (!intro && !(breath && i > 12)) {
      let deg = leadArr[i];
      if (deg >= 0) {
        if (section === 1) deg = vari.variante === 0 ? deg + 3 : (i % 4 === 0 ? deg + 1 : deg); // A': octava o color según el día
        else if (section === 2) deg = deg + 3; // B: el puente al cielo
        // v123: la trompeta heroica proclama su llamada UNA octava más arriba en el clímax
        if (t.epico && section === 2 && t.leadType === "heroe" && i === 0) deg = deg + 7;
        if (barInCycle % 4 === 3 && i === 15) deg = 3; // cadencia: la frase cae a la octava
        const human = (Math.random() - 0.5) * 0.007;
        const vel = 0.85 + Math.random() * 0.28;
        const gain = leadType === "brass" ? 0.036 * vel : leadType === "glass" ? 0.055 * vel : leadType === "coro" ? 0.06 * vel : leadType === "heroe" ? 0.052 * vel : 0.05 * vel;
        leadVoice(c, time + human, st(deg, t.root * 8) * (1 + (Math.random() - 0.5) * 0.0016), stepDur * 3, gain, leadType, i % 8 < 4 ? -0.18 : 0.18);
      }
    }

    nextTime += stepDur;
    step++;
  }
}

// ================== API pública ==================
function arranque(c: AudioContext, def: TrackDef) {
  current = def;
  step = 0;
  nextTime = c.currentTime + 0.1;
  if (delayL && delayR) {
    const dt = Math.min(1.5, (60 / def.bpm) * 0.75); // corchea con puntillo
    delayL.delayTime.value = dt;
    delayR.delayTime.value = dt;
  }
  startDrone(def);
  timer = setInterval(scheduler, 45);
}

export function startMusic(trackId?: string, fundidoSeg?: number) {
  const c = getCtx();
  if (!c) return;
  const def = MUSIC_TRACKS.find((x) => x.id === trackId) || current || MUSIC_TRACKS[0];
  // FUNDIDO CRUZADO MUSICAL (0.8s): la sala se apaga suave, la nueva pieza
  // entra creciendo — los pads viejos dejan su cola dentro de la nueva.
  // v114 CROSSFADE DE FAMILIA (fundidoSeg ≥ 2): fundido CINEMATOGRÁFICO —
  // la obra vieja muere lenta (τ = fundido/4) y la nueva nace creciendo
  // (τ = fundido/3) — el anochecer de la SESIÓN INTELIGENTE se OYE llegar.
  const yaSonaba = timer !== null;
  if (yaSonaba && master) {
    if (fundidoSeg && fundidoSeg >= 2) {
      master.gain.setTargetAtTime(0, c.currentTime, fundidoSeg / 4);
      setTimeout(() => {
        const cc = getCtx();
        if (!cc || !master) return;
        stopMusic();
        arranque(cc, def);
        master.gain.setTargetAtTime(volume * 0.5, cc.currentTime, fundidoSeg / 3);
        notify();
      }, Math.round(fundidoSeg * 500));
      notify();
      return;
    }
    master.gain.setTargetAtTime(0, c.currentTime, 0.26);
    setTimeout(() => {
      const cc = getCtx();
      if (!cc || !master) return;
      stopMusic();
      arranque(cc, def);
      master.gain.setTargetAtTime(volume * 0.5, cc.currentTime, 0.3);
      notify();
    }, 780);
    notify();
    return;
  }
  stopMusic();
  arranque(c, def);
  notify();
}

// v98 MODO ESCENA — cambia la pista según la sección de Vanguard actual.
export function aplicarEscena(escena: EscenaKey) {
  escenaActiva = escena;
  const track = ESCENA_TRACKS[escena];
  if (!track || current?.id === track) return;
  startMusic(track);
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  stopDrone();
  notify();
}

export function isMusicPlaying(): boolean {
  return timer !== null;
}

export function currentTrackId(): string | null {
  return current?.id ?? null;
}

export function setMusicVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (master && ctx) master.gain.setTargetAtTime(volume * 0.5, ctx.currentTime, 0.05);
  notify();
}

export function getMusicVolume(): number {
  return volume;
}

// ── v111 ECUALIZADOR DE SALA ──
export type BandaEq = "bajo" | "medio" | "alto";
export function setEqBand(banda: BandaEq, gainDb: number) {
  const g = Math.max(-12, Math.min(12, gainDb));
  eqValores[banda] = g;
  const nodo = banda === "bajo" ? eqBajo : banda === "medio" ? eqMedio : eqAlto;
  if (nodo && ctx) nodo.gain.setTargetAtTime(g, ctx.currentTime, 0.05);
  notify();
}
export function getEqBands(): { bajo: number; medio: number; alto: number } {
  return { ...eqValores };
}

// v83 ESTADIO GLOBAL — espectro en vivo para la Radio.
export function getMusicSpectrum(bars = 24): number[] | null {
  if (!analyser || !isMusicPlaying()) return null;
  try {
    const bins = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(bins);
    const out: number[] = [];
    const usable = Math.floor(bins.length * 0.72);
    const per = usable / bars;
    for (let bIdx = 0; bIdx < bars; bIdx++) {
      let sum = 0;
      const from = Math.floor(bIdx * per);
      const to = Math.max(from + 1, Math.floor((bIdx + 1) * per));
      for (let i2 = from; i2 < to; i2++) sum += bins[i2];
      out.push(Math.min(1, (sum / (to - from) / 255) * 1.35));
    }
    return out;
  } catch {
    return null;
  }
}

export function subscribeMusic(cb: () => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

// AUTOPLAY: si el usuario dejó la radio encendida, arranca en el primer gesto
// (los navegadores bloquean el audio sin interacción).
export function resumeMusicIfWanted(): boolean {
  if (typeof window === "undefined" || isMusicPlaying()) return false;
  try {
    const raw = localStorage.getItem("vanguard_music");
    if (!raw) return false;
    const p = JSON.parse(raw) as { on?: boolean; vol?: number; track?: string };
    if (p.on !== true) return false;
    if (typeof p.vol === "number") setMusicVolume(p.vol);
    startMusic(p.track || "gloria"); // v123: si no había obra guardada, la GLORIA recibe
    return true;
  } catch {
    return false;
  }
}

// v109: diagnóstico de solo-lectura para QA automatizado (no toca la UI):
// si `step` avanza, el secuenciador está programando notas reales.
export function __qaEngineDebug(): { step: number; playing: boolean; trackId: string | null; state: string; eq: { bajo: number; medio: number; alto: number } } {
  return {
    step,
    playing: timer !== null,
    trackId: current?.id ?? null,
    state: ctx?.state ?? "sin-ctx",
    eq: { ...eqValores },
  };
}
// puente de QA (solo lectura)
if (typeof window !== "undefined") {
  (window as unknown as { __vgOrquesta?: typeof __qaEngineDebug }).__vgOrquesta = __qaEngineDebug;
}

