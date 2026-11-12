// ============================================================
// v367.3 LA MÚSICA CON FORMA — LAS PIEZAS (lib/musica/piezas.ts)
//
// Aquí están las obras. Todas cumplen las cuatro leyes de forma.ts:
// sello de cuatro notas, forma A-B-A, compás fijo y cero deriva.
//
// DOS DECISIONES DEL DUEÑO, respetadas al pie de la letra:
//  ① TRIBUTOS = RITMO Y FORMA, NUNCA MELODÍA. Las piezas marcadas como
//     tributo toman PRESTADO el pulso (tempo, acentuación, tipo de
//     groove) de músicas que al Dueño le gustan — eso no es de nadie —
//     pero la melodía, la armonía y el sello son originales de la casa.
//     Cada una lo dice en su `nota`: no hay copia ni medio parecido.
//  ② EL HIMNO ES DE LA CASA. Sesenta a noventa segundos, sello de cuatro
//     notas en cada sección, A-B-A y final. Se oye una vez y se queda.
// ============================================================

import {
  ACORDES,
  SELLO,
  golpes,
  selloEn16,
  selloVariante,
  type Capa,
  type Pieza,
  type Seccion,
} from "./forma";

// ── Ayudantes de escritura (para que las piezas se lean como partituras) ──
const pad = (gain = 0.22): Capa => ({ inst: "pad", patron: [], gain });
const bajo = (patron: number[], gain = 0.5): Capa => ({ inst: "bajo", patron, gain });
const arpa = (patron: number[], gain = 0.3): Capa => ({ inst: "arpa", patron, gain });
const metal = (patron: number[], gain = 0.26): Capa => ({ inst: "metal", patron, gain });
const coro = (gain = 0.16): Capa => ({ inst: "coro", patron: [], gain });
const bombo = (patron: number[], gain = 0.9): Capa => ({ inst: "bombo", patron, gain });
const caja = (patron: number[], gain = 0.55): Capa => ({ inst: "caja", patron, gain });
const charles = (patron: number[], gain = 0.32): Capa => ({ inst: "charles", patron, gain });
const timpano = (patron: number[], gain = 0.6): Capa => ({ inst: "timpano", patron, gain });
const platillo = (gain = 0.5): Capa => ({ inst: "platillo", patron: [], gain });

// Bajos típicos (16 pasos): 0 = raíz, 2 = quinta, -1 = silencio
const BAJO_RECT = [0, -1, 0, -1, 2, -1, 0, -1, 0, -1, 0, -1, 2, -1, 0, -1];
const BAJO_MARCHA = [0, -1, 0, -1, 0, -1, 2, -1, 0, -1, 0, -1, 2, -1, 0, -1];
const BAJO_PULSO = [0, -1, -1, 0, -1, -1, 2, -1, 0, -1, -1, 0, -1, 2, -1, -1];

// Arpas: arpegios del acorde (0 raíz, 1 tercera, 2 quinta, 3 octava)
const ARPA_ARRIBA = [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 2, 1, 2];
const ARPA_AMPLIA = [0, -1, 2, -1, 3, -1, 2, -1, 1, -1, 2, -1, 3, -1, 1, -1];

// ── Percusión ──
const BOMBO_4x4 = golpes(0, 4, 8, 12);
const BOMBO_MARCHA = golpes(0, 6, 8, 14);
const CAJA_MARCHA = golpes(4, 12);
const CAJA_REDOBLE = golpes(2, 4, 10, 12, 15);
const CHARLES_OCHO = golpes(2, 6, 10, 14);
const CHARLES_DIECISEIS = golpes(0, 2, 4, 6, 8, 10, 12, 14);
const TIMBAL_ENTRADA = golpes(0, 8);

// ══════════════════════════════════════════════════════════
// ① EL HIMNO DE VANGUARD — «LA CASA EN PIE»
//    84 bpm · 30 compases ≈ 1 min 26 s · forma intro-A-B-A2-final
// ══════════════════════════════════════════════════════════
const HIMNO_SECCIONES: Seccion[] = [
  {
    nombre: "intro",
    compases: 4,
    acordes: [ACORDES.menor, ACORDES.mayor, ACORDES.menor, ACORDES.menor],
    capas: [pad(0.2), coro(0.12), arpa(ARPA_AMPLIA, 0.18), timpano(TIMBAL_ENTRADA, 0.4)],
  },
  {
    // A — el sello entra por primera vez: aquí se aprende la casa
    nombre: "A",
    compases: 8,
    acordes: [
      ACORDES.menor, ACORDES.mayor, ACORDES.menor7, ACORDES.mayor,
      ACORDES.menor, ACORDES.mayor, ACORDES.sus, ACORDES.menor,
    ],
    capas: [
      pad(0.24),
      bajo(BAJO_RECT, 0.52),
      metal(selloEn16(), 0.3),
      arpa(ARPA_ARRIBA, 0.2),
      bombo(BOMBO_4x4, 0.7),
      caja(CAJA_MARCHA, 0.4),
      charles(CHARLES_OCHO, 0.24),
    ],
  },
  {
    // B — el contraste: sube la tensión, la percusión se abre, el sello calla
    nombre: "B",
    compases: 8,
    acordes: [
      ACORDES.mayor7, ACORDES.menor7, ACORDES.mayor7, ACORDES.sus,
      ACORDES.mayor7, ACORDES.sus, ACORDES.menor7, ACORDES.mayor,
    ],
    capas: [
      pad(0.28),
      bajo(BAJO_MARCHA, 0.55),
      coro(0.2),
      arpa(ARPA_AMPLIA, 0.26),
      metal(selloVariante(), 0.22),
      bombo(BOMBO_MARCHA, 0.85),
      caja(CAJA_REDOBLE, 0.5),
      charles(CHARLES_DIECISEIS, 0.2),
    ],
  },
  {
    // A2 — la vuelta: el sello otra vez, ahora con metales y coro (lo que se recuerda)
    nombre: "A2",
    compases: 8,
    acordes: [
      ACORDES.menorOctava, ACORDES.mayorOctava, ACORDES.menor7, ACORDES.mayorOctava,
      ACORDES.menorOctava, ACORDES.mayor, ACORDES.sus, ACORDES.menor,
    ],
    capas: [
      pad(0.3),
      bajo(BAJO_RECT, 0.58),
      metal(selloEn16(), 0.38),
      coro(0.24),
      arpa(ARPA_ARRIBA, 0.24),
      bombo(BOMBO_4x4, 0.9),
      caja(CAJA_MARCHA, 0.5),
      charles(CHARLES_DIECISEIS, 0.26),
    ],
  },
  {
    // final — dos compases: platillo y la raíz sostenida. Se apaga, no se corta.
    nombre: "final",
    compases: 2,
    acordes: [ACORDES.menorOctava, ACORDES.menor],
    capas: [pad(0.34), coro(0.26), platillo(0.55), timpano(TIMBAL_ENTRADA, 0.7)],
  },
];

export const HIMNO: Pieza = {
  id: "himno-vanguard",
  nombre: "LA CASA EN PIE",
  lema: "El himno de Vanguard: el sello de cuatro notas",
  familia: "himno",
  bpm: 84,
  raiz: 110,
  swing: 0,
  secciones: HIMNO_SECCIONES,
  nota: `Composición original de la casa. El sello son las cuatro notas ${SELLO.join("·")} y aparece en las tres secciones. Forma A-B-A: se presenta, se contrasta y se vuelve — por eso se recuerda.`,
};

// ══════════════════════════════════════════════════════════
// ② TRIBUTOS DE PULSO — ritmo y forma prestados, melodía nueva
// ══════════════════════════════════════════════════════════
const TERRANOVA: Pieza = {
  id: "pulso-terranova",
  nombre: "PULSO TERRANOVA",
  lema: "Cuatro por cuatro que empuja, con el sello encima",
  familia: "tributo",
  bpm: 122,
  raiz: 98,
  swing: 0,
  tributoA: "el pulso bailable de Terranova",
  secciones: [
    {
      nombre: "intro",
      compases: 2,
      acordes: [ACORDES.menor, ACORDES.menor],
      capas: [pad(0.18), charles(CHARLES_OCHO, 0.2), arpa(ARPA_AMPLIA, 0.16)],
    },
    {
      nombre: "A",
      compases: 8,
      acordes: [ACORDES.menor, ACORDES.menor7, ACORDES.mayor, ACORDES.menor7, ACORDES.menor, ACORDES.menor7, ACORDES.sus, ACORDES.menor],
      capas: [
        pad(0.22),
        bajo(BAJO_PULSO, 0.6),
        metal(selloEn16(), 0.28),
        arpa(ARPA_ARRIBA, 0.22),
        bombo(BOMBO_4x4, 0.95),
        charles(CHARLES_DIECISEIS, 0.3),
        caja(CAJA_MARCHA, 0.35),
      ],
    },
    {
      nombre: "B",
      compases: 8,
      acordes: [ACORDES.mayor7, ACORDES.sus, ACORDES.menor7, ACORDES.mayor, ACORDES.mayor7, ACORDES.sus, ACORDES.menor, ACORDES.menor7],
      capas: [
        pad(0.26),
        bajo(BAJO_PULSO, 0.62),
        metal(selloVariante(), 0.3),
        coro(0.16),
        bombo(BOMBO_4x4, 0.95),
        caja(CAJA_REDOBLE, 0.42),
        charles(CHARLES_DIECISEIS, 0.34),
      ],
    },
    {
      nombre: "A2",
      compases: 8,
      acordes: [ACORDES.menorOctava, ACORDES.menor7, ACORDES.mayorOctava, ACORDES.sus, ACORDES.menorOctava, ACORDES.mayor, ACORDES.menor7, ACORDES.menor],
      capas: [
        pad(0.26),
        bajo(BAJO_PULSO, 0.64),
        metal(selloEn16(), 0.36),
        arpa(ARPA_ARRIBA, 0.24),
        bombo(BOMBO_4x4, 1),
        caja(CAJA_MARCHA, 0.44),
        charles(CHARLES_DIECISEIS, 0.32),
      ],
    },
    { nombre: "final", compases: 2, acordes: [ACORDES.menorOctava, ACORDES.menor], capas: [pad(0.3), platillo(0.5)] },
  ],
  nota: "El pulso (122 bpm, acentuación y groove) está inspirado en Terranova; la melodía, la armonía, el bajo y el sello son originales de la casa. Ritmo y forma no son de nadie: la canción no se copia.",
};

const CIENCIA: Pieza = {
  id: "mi-ciencia-tu-locura",
  nombre: "MI CIENCIA, TU LOCURA",
  lema: "Medio tiempo, swing medido y un sello que no se va",
  familia: "tributo",
  bpm: 100,
  raiz: 92,
  swing: 0.16,
  tributoA: "el balanceo de «Tu locura es mi ciencia»",
  secciones: [
    {
      nombre: "intro",
      compases: 2,
      acordes: [ACORDES.menor7, ACORDES.menor7],
      capas: [pad(0.2), arpa(ARPA_AMPLIA, 0.2), charles(CHARLES_OCHO, 0.24)],
    },
    {
      nombre: "A",
      compases: 8,
      acordes: [ACORDES.menor7, ACORDES.mayor7, ACORDES.menor7, ACORDES.sus, ACORDES.menor7, ACORDES.mayor7, ACORDES.sus, ACORDES.menor7],
      capas: [
        pad(0.24),
        bajo(BAJO_PULSO, 0.5),
        metal(selloEn16(), 0.24),
        arpa(ARPA_ARRIBA, 0.26),
        bombo(BOMBO_MARCHA, 0.7),
        caja(CAJA_REDOBLE, 0.3),
        charles(CHARLES_OCHO, 0.3),
      ],
    },
    {
      nombre: "B",
      compases: 8,
      acordes: [ACORDES.mayor7, ACORDES.menor7, ACORDES.mayor7, ACORDES.sus, ACORDES.mayor7, ACORDES.menor7, ACORDES.mayor7, ACORDES.menor],
      capas: [
        pad(0.27),
        bajo(BAJO_RECT, 0.52),
        coro(0.18),
        arpa(ARPA_AMPLIA, 0.3),
        metal(selloVariante(), 0.26),
        bombo(BOMBO_MARCHA, 0.75),
        charles(CHARLES_OCHO, 0.32),
      ],
    },
    {
      nombre: "A2",
      compases: 8,
      acordes: [ACORDES.menor7, ACORDES.mayor7, ACORDES.menor7, ACORDES.sus, ACORDES.menor7, ACORDES.mayor, ACORDES.sus, ACORDES.menor],
      capas: [
        pad(0.27),
        bajo(BAJO_PULSO, 0.54),
        metal(selloEn16(), 0.32),
        arpa(ARPA_ARRIBA, 0.3),
        coro(0.16),
        bombo(BOMBO_MARCHA, 0.8),
        caja(CAJA_MARCHA, 0.34),
        charles(CHARLES_DIECISEIS, 0.26),
      ],
    },
    { nombre: "final", compases: 2, acordes: [ACORDES.menor7, ACORDES.menor], capas: [pad(0.3), platillo(0.45)] },
  ],
  nota: "El balanceo (100 bpm, swing medido del 16 %) está inspirado en «Tu locura es mi ciencia»; la melodía, el bajo, la armonía y el sello son originales de la casa. Se toma el ritmo, no la canción.",
};

const NOCTURNO: Pieza = {
  id: "nocturno-frontera",
  nombre: "NOCTURNO DE FRONTERA",
  lema: "Lento, de noche, con el sello en el metal",
  familia: "tributo",
  bpm: 76,
  raiz: 87,
  swing: 0.08,
  tributoA: "el aire nocturno de las baladas de synth",
  secciones: [
    { nombre: "intro", compases: 3, acordes: [ACORDES.menor, ACORDES.menor], capas: [pad(0.22), arpa(ARPA_AMPLIA, 0.18)] },
    {
      nombre: "A",
      compases: 8,
      acordes: [ACORDES.menor, ACORDES.mayor7, ACORDES.menor7, ACORDES.sus, ACORDES.menor, ACORDES.mayor7, ACORDES.sus, ACORDES.menor],
      capas: [pad(0.26), bajo(BAJO_RECT, 0.44), metal(selloEn16(), 0.22), arpa(ARPA_ARRIBA, 0.26), timpano(TIMBAL_ENTRADA, 0.3)],
    },
    {
      nombre: "B",
      compases: 8,
      acordes: [ACORDES.mayor7, ACORDES.menor7, ACORDES.mayor7, ACORDES.menor7, ACORDES.mayor7, ACORDES.sus, ACORDES.menor7, ACORDES.menor],
      capas: [pad(0.3), coro(0.2), arpa(ARPA_AMPLIA, 0.3), metal(selloVariante(), 0.24)],
    },
    {
      nombre: "A2",
      compases: 8,
      acordes: [ACORDES.menorOctava, ACORDES.mayor7, ACORDES.menor7, ACORDES.sus, ACORDES.menorOctava, ACORDES.mayor7, ACORDES.sus, ACORDES.menor],
      capas: [pad(0.28), bajo(BAJO_RECT, 0.46), metal(selloEn16(), 0.3), coro(0.18), arpa(ARPA_ARRIBA, 0.28), charles(CHARLES_OCHO, 0.18)],
    },
    { nombre: "final", compases: 2, acordes: [ACORDES.menorOctava, ACORDES.menor], capas: [pad(0.32), platillo(0.4)] },
  ],
  nota: "El aire (76 bpm, pads largos, sin prisa) es inspiración de forma; todo lo demás es original de la casa.",
};

// ══════════════════════════════════════════════════════════
// ③ MÚSICA MILITAR DE LA CASA — para la radio de guerra
// ══════════════════════════════════════════════════════════
const PASO_DE_GUERRA: Pieza = {
  id: "paso-de-guerra",
  nombre: "PASO DE GUERRA",
  lema: "Marcha de tambores y metales: no adorna, avanza",
  familia: "militar",
  bpm: 96,
  raiz: 82,
  swing: 0,
  secciones: [
    { nombre: "intro", compases: 2, acordes: [ACORDES.menor, ACORDES.menor], capas: [caja(CAJA_MARCHA, 0.6), bombo(BOMBO_MARCHA, 0.5)] },
    {
      nombre: "A",
      compases: 8,
      acordes: [ACORDES.menor, ACORDES.menor, ACORDES.menor7, ACORDES.menor, ACORDES.menor, ACORDES.mayor, ACORDES.menor7, ACORDES.menor],
      capas: [
        bajo(BAJO_MARCHA, 0.6),
        metal(selloEn16(), 0.34),
        timpano(TIMBAL_ENTRADA, 0.5),
        bombo(BOMBO_MARCHA, 0.9),
        caja(CAJA_MARCHA, 0.6),
      ],
    },
    {
      nombre: "B",
      compases: 8,
      acordes: [ACORDES.menor7, ACORDES.sus, ACORDES.menor7, ACORDES.menor, ACORDES.menor7, ACORDES.sus, ACORDES.menor, ACORDES.menor7],
      capas: [
        bajo(BAJO_MARCHA, 0.62),
        metal(selloVariante(), 0.36),
        timpano(TIMBAL_ENTRADA, 0.55),
        bombo(BOMBO_MARCHA, 0.95),
        caja(CAJA_REDOBLE, 0.62),
      ],
    },
    { nombre: "A2", compases: 8, acordes: [ACORDES.menor, ACORDES.menor7, ACORDES.menor, ACORDES.sus, ACORDES.menor, ACORDES.menor7, ACORDES.sus, ACORDES.menor], capas: [bajo(BAJO_MARCHA, 0.64), metal(selloEn16(), 0.4), bombo(BOMBO_MARCHA, 1), caja(CAJA_MARCHA, 0.66), timpano(TIMBAL_ENTRADA, 0.55)] },
    { nombre: "final", compases: 2, acordes: [ACORDES.menor, ACORDES.menor], capas: [platillo(0.6), timpano(TIMBAL_ENTRADA, 0.7), caja(CAJA_MARCHA, 0.5)] },
  ],
  nota: "Marcha original de la casa: tambor, timbal y metales. Sin samples y sin copia — todo se sintetiza aquí mismo.",
};

const TAMBORES_DEL_ESTE: Pieza = {
  id: "tambores-del-este",
  nombre: "TAMBORES DEL ESTE",
  lema: "Redoble seco, escala menor, aire de frente largo",
  familia: "militar",
  bpm: 108,
  raiz: 78,
  swing: 0.05,
  secciones: [
    { nombre: "intro", compases: 2, acordes: [ACORDES.menor, ACORDES.menor], capas: [caja(CAJA_REDOBLE, 0.5), timpano(TIMBAL_ENTRADA, 0.4)] },
    {
      nombre: "A",
      compases: 8,
      acordes: [ACORDES.menor, ACORDES.menor7, ACORDES.menor, ACORDES.sus, ACORDES.menor, ACORDES.menor7, ACORDES.sus, ACORDES.menor],
      capas: [bajo(BAJO_MARCHA, 0.58), metal(selloEn16(), 0.3), bombo(BOMBO_MARCHA, 0.85), caja(CAJA_REDOBLE, 0.6), charles(CHARLES_OCHO, 0.18)],
    },
    {
      nombre: "B",
      compases: 8,
      acordes: [ACORDES.sus, ACORDES.menor7, ACORDES.sus, ACORDES.menor, ACORDES.sus, ACORDES.menor7, ACORDES.menor, ACORDES.sus],
      capas: [bajo(BAJO_MARCHA, 0.6), metal(selloVariante(), 0.32), coro(0.14), bombo(BOMBO_MARCHA, 0.9), caja(CAJA_REDOBLE, 0.64)],
    },
    { nombre: "A2", compases: 8, acordes: [ACORDES.menor, ACORDES.sus, ACORDES.menor7, ACORDES.menor, ACORDES.menor, ACORDES.sus, ACORDES.menor7, ACORDES.menor], capas: [bajo(BAJO_MARCHA, 0.62), metal(selloEn16(), 0.36), bombo(BOMBO_MARCHA, 1), caja(CAJA_REDOBLE, 0.7), timpano(TIMBAL_ENTRADA, 0.5)] },
    { nombre: "final", compases: 3, acordes: [ACORDES.menor, ACORDES.menor, ACORDES.menor], capas: [platillo(0.55), caja(CAJA_REDOBLE, 0.7), bombo(BOMBO_MARCHA, 0.8)] },
  ],
  nota: "Tambores sintetizados en la casa. La escala es menor natural y el redoble es seco: música de frente, no de desfile.",
};

/** Todas las piezas de la casa, en el orden en que se muestran. */
export const MUSICA_CASA: Pieza[] = [HIMNO, TERRANOVA, CIENCIA, NOCTURNO, PASO_DE_GUERRA, TAMBORES_DEL_ESTE];

export function piezaPorId(id: string): Pieza | null {
  return MUSICA_CASA.find((p) => p.id === id) ?? null;
}
