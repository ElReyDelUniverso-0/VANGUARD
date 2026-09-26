// v53.0 FRENTE TOTAL — datos de los 10 teatros de operación reales que arden
// en el mural del planeta. Solo fuentes abiertas y estimaciones públicas
// (ACLED/OSINT/medios); ninguna credencial, ningún contenido gráfico real.

export interface FrenteDef {
  id: string;
  name: string;
  sideA: { name: string; colors: string[] };
  sideB: { name: string; colors: string[] };
  intensity: number; // 0-100 (estimación pública)
  casualties: string; // estimación pública textual
  regionIdx: number; // 0..4 → /api/geo-tablero
  terrain: "steppe" | "city" | "desert" | "jungle" | "mountain" | "sea" | "coast" | "tropic";
  note: string;
}

export const FRENTES: FrenteDef[] = [
  {
    id: "donbas", name: "DONBÁS",
    sideA: { name: "Ucrania", colors: ["#0057B7", "#FFD700"] },
    sideB: { name: "Rusia", colors: ["#FFFFFF", "#D52B1E"] },
    intensity: 92, casualties: "~812.000 bajas estimadas (ambos bandos)",
    regionIdx: 0, terrain: "steppe",
    note: "La guerra convencional más grande desde 1945: artillería masiva, drones FPV y guerra electrónica metro a metro.",
  },
  {
    id: "gaza", name: "GAZA · LEVANTE",
    sideA: { name: "Israel", colors: ["#0038B8", "#FFFFFF"] },
    sideB: { name: "Hamás · Hezbolá", colors: ["#007A3D", "#000000"] },
    intensity: 78, casualties: "~128.000 bajas estimadas",
    regionIdx: 1, terrain: "city",
    note: "Combate urbano túnel a túnel, misiles balísticos y dos frentes solapados (Gaza y frontera norte).",
  },
  {
    id: "marrojo", name: "MAR ROJO",
    sideA: { name: "Coalición naval", colors: ["#3C3B6E", "#B22234"] },
    sideB: { name: "Houtíes", colors: ["#007A3D", "#CE1126"] },
    intensity: 58, casualties: "~9.000 afectados · tráfico naval -60%",
    regionIdx: 1, terrain: "sea",
    note: "Drones antibuque y misiles balísticos contra el Babel-Mandeb: el 12% del comercio mundial ha cambiado de ruta.",
  },
  {
    id: "sudan", name: "SUDÁN",
    sideA: { name: "SAF (Ejército)", colors: ["#D21034", "#FFFFFF"] },
    sideB: { name: "RSF (Rápidas)", colors: ["#000000", "#D21034"] },
    intensity: 85, casualties: "~150.000 muertos · 10M desplazados",
    regionIdx: 2, terrain: "city",
    note: "La mayor crisis de desplazados del planeta: dos ejércitos disputando Jartum casa por casa.",
  },
  {
    id: "sahel", name: "SAHEL",
    sideA: { name: "Juntas (FAMa · AES)", colors: ["#002A8F", "#FFD700"] },
    sideB: { name: "JNIM · EIGS", colors: ["#000000", "#3a7d44"] },
    intensity: 64, casualties: "~46.000 muertos desde 2012",
    regionIdx: 2, terrain: "desert",
    note: "Emboscadas con IED, motos y el triángulo del mal: la zona de combate más letal por habitante.",
  },
  {
    id: "somalia", name: "SOMALIA",
    sideA: { name: "SNA · ATMIS", colors: ["#4189DD", "#FFFFFF"] },
    sideB: { name: "Al-Shabaab", colors: ["#1a1a1a", "#f5f5f5"] },
    intensity: 66, casualties: "~38.000 muertos desde 2006",
    regionIdx: 2, terrain: "coast",
    note: "Ofensivas del government en el Hiiraan y asaltos con vehículos suicida en Mogadiscio.",
  },
  {
    id: "rdc", name: "RDC ESTE",
    sideA: { name: "FARDC · Wazalendo", colors: ["#007FFF", "#F7D618"] },
    sideB: { name: "M23 · AFC", colors: ["#4a5d23", "#2b2b2b"] },
    intensity: 81, casualties: "~45.000 muertos · 7M desplazados",
    regionIdx: 2, terrain: "tropic",
    note: "Ofensiva sobre Goma con artillería en los volcanes: minerales de guerra y desplazados en masa.",
  },
  {
    id: "myanmar", name: "MYANMAR",
    sideA: { name: "Junta (Tatmadaw)", colors: ["#CE1126", "#FFFFFF"] },
    sideB: { name: "PDF · EAOs", colors: ["#000000", "#FCD116"] },
    intensity: 71, casualties: "~74.000 muertos desde el golpe",
    regionIdx: 3, terrain: "jungle",
    note: "Operación 1027 y sucesoras: guerrilla capturando puestos fronterizos y bases aéreas completas.",
  },
  {
    id: "kashmir", name: "CACHEMIRA · LoC",
    sideA: { name: "India", colors: ["#FF9933", "#138808"] },
    sideB: { name: "Pakistán", colors: ["#01411C", "#FFFFFF"] },
    intensity: 47, casualties: "~38.000 desde 1989",
    regionIdx: 3, terrain: "mountain",
    note: "Dos potencias nucleares intercambiando fuego de mortero sobre la Línea de Control, a 5.000 m de altitud.",
  },
  {
    id: "haiti", name: "HAITÍ",
    sideA: { name: "PNH · Misión (MSS)", colors: ["#00209F", "#D21034"] },
    sideB: { name: "Viv Ansanm", colors: ["#111111", "#8B0000"] },
    intensity: 72, casualties: "~14.000 muertos · 700k desplazados",
    regionIdx: 4, terrain: "city",
    note: "Bandas armadas contra el Estado: el puerto, el aeropuerto y el país entero en disputa sin ejército.",
  },
];

// Palabras que convierten un titular real en operación simulada
export const VIOLENT_RE =
  /(airstrike|air strike|shelling|artillery|missile|drone|bomb|attack|offensive|strike|kills|clashes|shooting|assault|explosion|ataque|bombardeo|obús|obuses|artiller[íi]a|misil|dron|explosi[óo]n|ofensiva|combates|tiroteo|asalto|muer)/i;
