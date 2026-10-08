// v87.0 EL DESPERTAR — PATRULLAS MILITARES EN VIVO
// Rutas de patrulla NAVAL / AÉREA / DRON entre puntos geoestratégicos REALES.
// Cada patrulla viaja por el mapa como un convoy con estela (SVG animateMotion),
// convirtiendo el tablero en un teatro de guerra vivo: no hay mapa que respire
// sin unidades moviéndose por él.

export type PatronKind = "NAVAL" | "AEREA" | "DRON";

export interface MapPatrulla {
  id: string;
  kind: PatronKind;
  from: [number, number]; // [lat, lng]
  to: [number, number];
  label: string;          // callsign / nombre de la patrulla
  faction: "OTAN" | "RUSIA" | "CHINA" | "IRAN" | "COALICION" | "MULTINACIONAL";
  dur: number;            // duración del viaje en segundos (loop)
  color: string;
}

export const FACTION_COLOR: Record<MapPatrulla["faction"], string> = {
  OTAN: "#38bdf8",
  RUSIA: "#ef4444",
  CHINA: "#f59e0b",
  IRAN: "#a855f7",
  COALICION: "#22d3ee",
  MULTINACIONAL: "#94a3b8",
};

// Rutas reales de patrulla (periodos 2020-2025): frentes navales, corredores
// aéreos de bombardeo/reconocimiento y circuitos de drones HALE.
export const PATRULLAS: MapPatrulla[] = [
  {
    id: "p-1",
    kind: "NAVAL",
    from: [36.8, -6.3],    // Rota (ESP) — base naval OTAN
    to: [36.1, -5.35],     // Gibraltar
    label: "ESPS METEORO",
    faction: "OTAN",
    dur: 14,
    color: FACTION_COLOR.OTAN,
  },
  {
    id: "p-2",
    kind: "NAVAL",
    from: [55.7, 37.5],    // Moscú (flotilla del Volga-Don)
    to: [54.7, 20.4],      // Kaliningrado (Báltico)
    label: "FLOTA BÁLTICO",
    faction: "RUSIA",
    dur: 22,
    color: FACTION_COLOR.RUSIA,
  },
  {
    id: "p-3",
    kind: "AEREA",
    from: [35.3, 33.9],    // Akrotiri (GB) — RAF Chipre
    to: [31.5, 34.3],      // Gaza / franja sur
    label: "RC-135W RIVET",
    faction: "OTAN",
    dur: 12,
    color: FACTION_COLOR.OTAN,
  },
  {
    id: "p-4",
    kind: "AEREA",
    from: [55.97, 37.9],   //base aérea Chkalovski (RUS)
    to: [43.1, 131.9],     // Vladivostok
    label: "TU-95 PATRULLA",
    faction: "RUSIA",
    dur: 26,
    color: FACTION_COLOR.RUSIA,
  },
  {
    id: "p-5",
    kind: "NAVAL",
    from: [26.6, 127.9],   // Kadena / Okinawa (JPN/US)
    to: [24.5, 120.7],     // estrecho de Taiwán
    label: "DDG-51 FLOTA 7",
    faction: "OTAN",
    dur: 18,
    color: FACTION_COLOR.OTAN,
  },
  {
    id: "p-6",
    kind: "NAVAL",
    from: [18.2, 109.5],   // Sanya (CHN) — base naval de Hainan
    to: [9.5, 112.9],      // Fiery Cross (Spratly)
    label: "PLAN TIPO 055",
    faction: "CHINA",
    dur: 20,
    color: FACTION_COLOR.CHINA,
  },
  {
    id: "p-7",
    kind: "DRON",
    from: [12.6, 43.3],    // Bab el-Mandeb
    to: [13.6, 42.9],      // costa hutí (Hodeida)
    label: "MQ-9 VIGÍA",
    faction: "COALICION",
    dur: 11,
    color: FACTION_COLOR.COALICION,
  },
  {
    id: "p-8",
    kind: "NAVAL",
    from: [26.6, 56.3],    //Ormuz — Banda Abbas (IRN)
    to: [25.6, 57.2],      // golfo de Omán
    label: "IRGCN SWARM",
    faction: "IRAN",
    dur: 13,
    color: FACTION_COLOR.IRAN,
  },
  {
    id: "p-9",
    kind: "DRON",
    from: [48.5, 35.0],    // frente de Zaporizhzhia
    to: [45.0, 36.6],      // Crimea / Sebastópol
    label: "SHARK recon",
    faction: "MULTINACIONAL",
    dur: 15,
    color: FACTION_COLOR.MULTINACIONAL,
  },
  {
    id: "p-10",
    kind: "NAVAL",
    from: [12.8, 44.9],    // Mukalla (YEM)
    to: [20.7, 38.9],      // sur del Mar Rojo
    label: "OPERACIÓN ASPIDES",
    faction: "MULTINACIONAL",
    dur: 24,
    color: FACTION_COLOR.MULTINACIONAL,
  },
];
