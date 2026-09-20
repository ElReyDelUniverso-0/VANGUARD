// Vanguard v6 — MUNDO DE GUERRA: mini-juego de conquista estilo Risk sobre el mapa mundial real.
// 24 territorios, 4 facciones (jugador + 3 IA), adyacencias terrestres/marítimas.

export type FactionId = 0 | 1 | 2 | 3; // 0 = jugador

export interface Faction {
  id: FactionId;
  name: string;
  short: string;
  color: string; // hex para el mapa
  colorClass: string; // clase tailwind de texto
  bgClass: string; // clase tailwind de fondo
  borderClass: string;
  doctrine: string;
}

export const FACTIONS: Faction[] = [
  { id: 0, name: "TU IMPERIO", short: "TÚ", color: "#3EA6FF", colorClass: "text-amber", bgClass: "bg-amber-hud", borderClass: "border-amber-hud", doctrine: "Comandante supremo — lo decides tú" },
  { id: 1, name: "EJE ESCARLATA", short: "EJE", color: "#FF3B30", colorClass: "text-red-hud", bgClass: "bg-red-hud", borderClass: "border-red-hud", doctrine: "Blitz agresivo — ataca la frontera más débil" },
  { id: 2, name: "ALIANZA ACERO", short: "ACERO", color: "#38BDF8", colorClass: "text-cyan-hud", bgClass: "bg-cyan-hud", borderClass: "border-cyan-hud", doctrine: "Fortificación paciente — acumula tropas" },
  { id: 3, name: "SINDICATO SOMBRA", short: "SOMBRA", color: "#A855F7", colorClass: "text-violet-hud", bgClass: "bg-violet-hud", borderClass: "border-violet-hud", doctrine: "Oportunista — golpea cuando sangras" },
];

export interface Territory {
  id: string;
  name: string;
  continent: "NORTEAMÉRICA" | "SUDAMÉRICA" | "EUROPA" | "ÁFRICA" | "ASIA" | "OCEANÍA";
  lat: number;
  lng: number;
  bonus: number; // ingreso extra si controlas todo el continente
  adj: string[]; // ids de territorios adyacentes
  baseTroops: number;
}

export const TERRITORIES: Territory[] = [
  // NORTEAMÉRICA
  { id: "canadartico", name: "Canadá Ártico", continent: "NORTEAMÉRICA", lat: 62, lng: -100, bonus: 2, baseTroops: 2, adj: ["eeuu", "siberia"] },
  { id: "eeuu", name: "Estados Unidos", continent: "NORTEAMÉRICA", lat: 39, lng: -98, bonus: 2, baseTroops: 4, adj: ["canadartico", "mexico", "japon"] },
  { id: "mexico", name: "México y Centroamérica", continent: "NORTEAMÉRICA", lat: 21, lng: -101, bonus: 2, baseTroops: 3, adj: ["eeuu", "amazonia"] },
  // SUDAMÉRICA
  { id: "amazonia", name: "Amazonia y Brasil", continent: "SUDAMÉRICA", lat: -8, lng: -53, bonus: 2, baseTroops: 3, adj: ["mexico", "andes", "argentina", "africacentral"] },
  { id: "andes", name: "Cordillera de los Andes", continent: "SUDAMÉRICA", lat: -22, lng: -66, bonus: 2, baseTroops: 2, adj: ["amazonia", "argentina"] },
  { id: "argentina", name: "Cono Sur", continent: "SUDAMÉRICA", lat: -38, lng: -64, bonus: 2, baseTroops: 2, adj: ["amazonia", "andes"] },
  // EUROPA
  { id: "europawest", name: "Europa Occidental", continent: "EUROPA", lat: 47, lng: 2, bonus: 3, baseTroops: 4, adj: ["escandinavia", "balcanes", "magreb"] },
  { id: "escandinavia", name: "Escandinavia", continent: "EUROPA", lat: 63, lng: 16, bonus: 3, baseTroops: 2, adj: ["europawest", "europaeste", "siberia"] },
  { id: "europaeste", name: "Europa Oriental", continent: "EUROPA", lat: 53, lng: 33, bonus: 3, baseTroops: 4, adj: ["escandinavia", "balcanes", "siberia", "asiacentral"] },
  { id: "balcanes", name: "Balcanes y Turquía", continent: "EUROPA", lat: 42, lng: 24, bonus: 3, baseTroops: 3, adj: ["europawest", "europaeste", "oriente"] },
  // ÁFRICA
  { id: "magreb", name: "Magreb y Sáhara", continent: "ÁFRICA", lat: 27, lng: -5, bonus: 2, baseTroops: 2, adj: ["europawest", "africaoccidental", "egipto"] },
  { id: "africaoccidental", name: "África Occidental", continent: "ÁFRICA", lat: 11, lng: -2, bonus: 2, baseTroops: 3, adj: ["magreb", "africacentral"] },
  { id: "africacentral", name: "Cuenca del Congo", continent: "ÁFRICA", lat: -1, lng: 22, bonus: 2, baseTroops: 3, adj: ["africaoccidental", "africaoriental", "africasure", "amazonia"] },
  { id: "egipto", name: "Egipto y Cuerno", continent: "ÁFRICA", lat: 24, lng: 34, bonus: 2, baseTroops: 3, adj: ["magreb", "africaoriental", "oriente"] },
  { id: "africaoriental", name: "África Oriental", continent: "ÁFRICA", lat: -4, lng: 37, bonus: 2, baseTroops: 3, adj: ["egipto", "africacentral", "africasure"] },
  { id: "africasure", name: "África Austral", continent: "ÁFRICA", lat: -26, lng: 25, bonus: 2, baseTroops: 2, adj: ["africacentral", "africaoriental"] },
  // ASIA
  { id: "oriente", name: "Oriente Medio", continent: "ASIA", lat: 29, lng: 46, bonus: 3, baseTroops: 4, adj: ["balcanes", "egipto", "asiacentral", "india"] },
  { id: "asiacentral", name: "Asia Central", continent: "ASIA", lat: 45, lng: 66, bonus: 3, baseTroops: 3, adj: ["europaeste", "oriente", "siberia", "india", "china"] },
  { id: "siberia", name: "Siberia", continent: "ASIA", lat: 62, lng: 96, bonus: 3, baseTroops: 3, adj: ["escandinavia", "europaeste", "asiacentral", "china", "canadartico", "japon"] },
  { id: "india", name: "Subcontinente Indio", continent: "ASIA", lat: 21, lng: 78, bonus: 3, baseTroops: 4, adj: ["oriente", "asiacentral", "china", "sudeste"] },
  { id: "china", name: "China y Mongolia", continent: "ASIA", lat: 34, lng: 105, bonus: 3, baseTroops: 5, adj: ["siberia", "asiacentral", "india", "sudeste", "japon"] },
  { id: "sudeste", name: "Sudeste Asiático", continent: "ASIA", lat: 13, lng: 102, bonus: 3, baseTroops: 3, adj: ["india", "china", "australia"] },
  { id: "japon", name: "Japón y el Pacífico", continent: "ASIA", lat: 37, lng: 139, bonus: 3, baseTroops: 3, adj: ["china", "siberia", "eeuu"] },
  // OCEANÍA
  { id: "australia", name: "Australia y Oceanía", continent: "OCEANÍA", lat: -25, lng: 134, bonus: 2, baseTroops: 2, adj: ["sudeste"] },
];

export const CONTINENT_LIST = ["NORTEAMÉRICA", "SUDAMÉRICA", "EUROPA", "ÁFRICA", "ASIA", "OCEANÍA"] as const;

export const TERRITORY_IDS = TERRITORIES.map((t) => t.id);

export function getTerritory(id: string): Territory {
  return TERRITORIES.find((t) => t.id === id)!;
}

export const FACTION_START_TROOPS = 12;

// ====== COMANDANTES (v8): eliges 1 antes de iniciar la campana, pasiva permanente ======
export interface Commander {
  id: string;
  name: string;
  doctrine: string;
  atkMult: number; // multiplicador de tirada de ataque del jugador
  defMult: number; // multiplicador de defensa de tus territorios contra IA
  incomeBonus: number; // refuerzos extra por ronda
  coinMult: number; // multiplicador de monedas por captura
}

export const COMMANDERS: Commander[] = [
  {
    id: "KHAN",
    name: "MARISCAL KHAN",
    doctrine: "Ofensiva total — tus asaltos golpean x1.15 más fuerte",
    atkMult: 1.15,
    defMult: 1,
    incomeBonus: 0,
    coinMult: 1,
  },
  {
    id: "VOSTOK",
    name: "GENERAL VOSTOK",
    doctrine: "Muro de acero — tus territorios defienden x1.25",
    atkMult: 1,
    defMult: 1.25,
    incomeBonus: 0,
    coinMult: 1,
  },
  {
    id: "WU",
    name: "ECONOMISTA WU",
    doctrine: "Logística suprema — +2 refuerzos cada ronda",
    atkMult: 1,
    defMult: 1,
    incomeBonus: 2,
    coinMult: 1,
  },
  {
    id: "REYES",
    name: "CORONEL REYES",
    doctrine: "Guerra de botín — doble de monedas por captura (+PX de pase)",
    atkMult: 1,
    defMult: 1,
    incomeBonus: 0,
    coinMult: 2,
  },
];

export function getCommander(id: string | null | undefined): Commander | null {
  if (!id) return null;
  return COMMANDERS.find((c) => c.id === id) ?? null;
}

// Elección de facciones iniciales: el jugador elige su territorio de origen;
// las IA reparten territorios restantes equilibradamente.
export const AI_NAMES_POOL = ["MARISCAL VOROTNIKOV", "GENERAL HALVORSEN", "COMANDANTE KHUMALO", "EMIR AL-RASHID", "DICTADOR MONTENEGRO"];

export interface ConquestSnapshot {
  territories: Record<string, { owner: FactionId; troops: number }>;
  turn: number; // ronda global
  activeFaction: FactionId;
  reserves: number; // tropas por desplegar (fase refuerzos del activo)
  started: boolean;
  finished: boolean;
  victory: boolean;
  playerHome: string | null;
  log: { ts: number; msg: string; faction: FactionId }[];
  captures: number; // capturas totales del jugador (stat)
  commander?: string | null; // comandante elegido (v8, opcional para saves antiguos)
  lastBattle: {
    from: string;
    to: string;
    attacker: FactionId;
    defender: FactionId;
    atkRoll: number;
    defRoll: number;
    defLosses: number;
    atkLosses: number;
    captured: boolean;
  } | null;
}

export function createInitialSnapshot(homeId: string, commanderId?: string | null): ConquestSnapshot {
  const territories: ConquestSnapshot["territories"] = {};
  // reparto inicial: jugador toma su territorio elegido, el resto se reparte entre las 3 IA
  const ids = [...TERRITORY_IDS];
  const home = TERRITORIES.find((t) => t.id === homeId)!;
  const initialReserves = FACTION_START_TROOPS;
  territories[homeId] = { owner: 0, troops: initialReserves };
  const rest = ids.filter((i) => i !== homeId);
  // shuffle determinista-ish
  rest.sort(() => Math.random() - 0.5);
  rest.forEach((id, i) => {
    territories[id] = { owner: ((i % 3) + 1) as FactionId, troops: Math.max(1, Math.round(Math.random() * 2) + 1) };
  });
  return {
    territories,
    turn: 1,
    activeFaction: 0,
    reserves: initialReserves,
    started: true,
    finished: false,
    victory: false,
    playerHome: homeId,
    commander: commanderId ?? null,
    log: [
      { ts: Date.now(), msg: `Ronda 1 — Tu imperio establece su capital en ${home.name}. Despliega ${initialReserves} reservas.`, faction: 0 },
    ],
    captures: 0,
    lastBattle: null,
  };
}

// Ingreso de refuerzos por ronda para una faccion
export function incomeFor(terr: Record<string, { owner: FactionId; troops: number }>, faction: FactionId): number {
  let owned = 0;
  const continents = new Set<string>();
  for (const t of TERRITORIES) {
    if (terr[t.id]?.owner === faction) {
      owned += 1;
      continents.add(t.continent);
    }
  }
  if (owned === 0) return 0;
  let income = Math.max(3, Math.floor(owned / 2));
  // bonus continental: todos los territorios del continente son de la faccion
  for (const cont of continents) {
    const inCont = TERRITORIES.filter((t) => t.continent === cont);
    if (inCont.every((t) => terr[t.id].owner === faction)) {
      income += inCont[0].bonus;
    }
  }
  return income;
}

// Resolucion de batalla: ventaja defensiva ligera; tiradas 0..(tropas*fuerza)
// v8: atkMult/defMult opcionales para el pasivo del comandante elegido
export function resolveBattle(atkTroops: number, defTroops: number, atkMult = 1, defMult = 1): {
  atkRoll: number;
  defRoll: number;
  defLosses: number;
  atkLosses: number;
  captured: boolean;
} {
  const atkRoll = Math.random() * atkTroops * atkMult;
  const defRoll = Math.random() * defTroops * 1.15 * defMult; // defensa x1.15 base
  let defLosses = 0;
  let atkLosses = 0;
  let captured = false;
  if (atkRoll > defRoll) {
    defLosses = Math.min(defTroops, Math.ceil(Math.random() * 2) + (atkTroops > defTroops * 2 ? 1 : 0));
    atkLosses = Math.min(atkTroops - 1, Math.floor(Math.random() * 2));
    if (defLosses >= defTroops) captured = true;
  } else {
    atkLosses = Math.min(atkTroops - 1, Math.ceil(Math.random() * 2));
    defLosses = Math.floor(Math.random() * 2);
  }
  return { atkRoll, defRoll, defLosses, atkLosses, captured };
}

export const VICTORY_REWARD = { coins: 500, xp: 250, gems: 3 };
export const CAPTURE_REWARD = { coins: 5, xp: 3 };
